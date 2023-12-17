const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function saveImage(imageData, imageWidth, imageHeight, savePath) {
    const buffer = Buffer.from(imageData.split(','), 'base64');

    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath, { recursive: true });
    }

    const filePath = path.join(savePath, `${Date.now()}.jpg`);

    try {
        await sharp(buffer, {
            raw: { width: imageWidth, height: imageHeight, channels: 3 },
        }).toFile(filePath);

        return filePath;
    } catch (error) {
        throw new Error('Error saving image');
    }
}

module.exports = { saveImage };
