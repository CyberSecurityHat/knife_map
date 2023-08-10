
const { sequelize } = require("./models");
const warnung = require("./models/warnung");
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'coordinate.json');

(async () => {
    const coordinates = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const coord of coordinates) {
        await warnung.create({
            address: coord.address,
            latitude: coord.latitude,
            longitude: coord.longitude,
            date: coord.date
        });
    }

    console.log("Coordinates seeded successfully!");
    sequelize.close();
})();
