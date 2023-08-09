const express = require('express');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const app = express();
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const port = 3000;

app.use(express.static('public'));





app.get('/', (req, res) => {
  const data = JSON.parse(fs.readFileSync('data/coordinate.json', 'utf8'));
  res.render('index', { coordinates: data });
});



app.listen(port, () => {
    
  console.log(`Server running at http://localhost:${port}`);
});