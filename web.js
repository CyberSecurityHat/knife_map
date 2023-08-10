const express = require('express');
const fs = require('fs');
const axios = require('axios');
const {body, validationResult} = require('express-validator');
require('dotenv').config();

const { sequelize } = require("./models");
const report = require("./models/report");
const warnung = require("./models/warnung");
const seed = require('./seed');

const app = express();
const path = require('path');
const { error } = require('console');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const filePath = path.join(__dirname, 'data/coordinate.json');

(async () => {
    const coordinates = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const count = await warnung.count();
    if (count === 0) {
        for (const coord of coordinates) {
            if (coord.latitude && coord.longitude) {
                await warnung.create({
                    address: coord.address,
                    latitude: coord.latitude,
                    longitude: coord.longitude,
                    date: coord.date
                });
            }
        }
        console.log("Coordinates seeded successfully!");
    }
})();

const port = 8001;

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  res.render('index', { coordinates: data });
});

app.use(express.urlencoded({ extended: true }));


const validateReportRequest = [
  body('option').notEmpty().withMessage('버튼 옵션은 필수 선택 사항입니다.'),
  body('location').notEmpty().withMessage('지역 기입은 필수 사항입니다.'),
  body('year').notEmpty().withMessage('연도 선택은 필수 사항입니다.'),
  body('month').notEmpty().withMessage('월 선택은 필수 사항입니다.'),
  body('day').notEmpty().withMessage('일 선택은 필수 사항입니다.'),
  body('sourceUrl').notEmpty().withMessage('출처 URL 기입은 필수 사항입니다.'),
  body('location').isLength({ min: 1, max: 50}).withMessage('비정상적인 글자 길이는 허용하지 않습니다.'),
  body('year').isLength({min: 4, max: 4}).withMessage('비정상적인 글자 길이는 허용하지 않습니다.'),
  body('month').isInt({min: 1, max: 12}).withMessage('비정상적인 글자 길이는 허용하지 않습니다.'), //제대로 걸러지는지 확인해봐야됨
  body('day').isInt({min: 1, max: 31}).withMessage('비정상적인 글자 길이는 허용하지 않습니다.'),
  body('sourceUrl').isURL().withMessage('비정상적인 URL값은 허용하지 않습니다.'),
]


app.get('/report', (req, res) => {
  res.render('report');
})

app.post('/report', validateReportRequest, async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if(clientIP.length < 23){
    const { option, location, year, month, day, sourceUrl } = req.body;
    const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
    console.log(clientIP);
  
    try {
      report.create({
        ipAddress: clientIP,
        option: option,
        location: location,
        date: date,
        sourceUrl: sourceUrl
      });
  
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.status(500).send('제보를 받는 동안 오류가 발생했습니다. 트위터로 문의해주세요. @knifemap');
    }
  }else{
    res.status(400).send('ip값이 이상합니다. 트위터로 문의해주세요. @knifemap');
  }
});


app.listen(port, () => {
    
  console.log(`Server running at http://localhost:${port}`);
});

sequelize.sync({force: false})
    .then(() => {
        console.log("데이터베이스 연결 성공");
        
    })
    .catch((err) => {
        console.error(err);
    });
// Route to provide coordinates data in JSON format
app.get('/coordinates-data', async (req, res) => {
    try {
        const data = await warnung.findAll();
        res.json(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Internal Server Error");
    }
});

seed();