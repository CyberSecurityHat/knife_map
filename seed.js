const { sequelize } = require("./models");
const warnung = require("./models/warnung");
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'coordinate.json');

const seed = async () => {
    const coordinates = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // warnung 테이블 초기화
    await warnung.destroy({
        where: {},
        truncate: true
    });

    for (const coord of coordinates) {
        // 디폴트 값 설정
        const latitude = coord.latitude || 9999999.9999999;
        const longitude = coord.longitude || 9999999.9999999;

        await warnung.create({
            address: coord.address,
            latitude: latitude,
            longitude: longitude,
            date: coord.date
        });
    }

    console.log("Coordinates seeded successfully!");
};


module.exports = seed;
