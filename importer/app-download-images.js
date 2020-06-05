// node app.js output-file-path input-json-path group artifact version
require('dotenv').config();
const fs = require('fs');
const https = require('https');
const Axios = require('axios');
const path = require('path');
const eachOfLimit = require('async/eachOfLimit');
const inputJSON = process.argv[2];

const TMP_IMAGES = path.join(process.cwd(), "images");
if (!fs.existsSync(TMP_IMAGES)) {
    fs.mkdirSync(TMP_IMAGES);
}

var inputData = require(inputJSON);
inputData = inputData.db[0].data.posts;
inputData.shift(); // the first post looks like a message from Ghost blog software so skip it

eachOfLimit(inputData, 5, async (json) => {
    // download main image
    if (json.image) {
        let filePath = await downloadImage(json.image);
        let title = path.basename(filePath);
        console.log(`Downloaded image ${title} to ${filePath}`);
    }
}, (err) => {
    if (err) {
        return "Got an error: " + console.error(err);
    }
    console.log("All done - images downloaded to " + TMP_IMAGES);
});

async function downloadImage(imageUrl) {
    let url = (new URL(imageUrl, "https://www.fabric.com/")).toString();
    let fileName = path.basename(url);
    let filePath = path.normalize(path.join(TMP_IMAGES, fileName));
    const writer = fs.createWriteStream(filePath);

    const response = await Axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve(filePath))
        writer.on('error', reject)
    })
}
