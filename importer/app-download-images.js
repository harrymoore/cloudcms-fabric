// node app.js output-file-path input-json-path group artifact version
require('dotenv').config();
const fs = require('fs');
const Axios = require('axios');
const path = require('path');
const eachOfLimit = require('async/eachOfLimit');
const inputJSON = process.argv[2];

const TMP_IMAGES = path.join(process.cwd(), "images");
if (!fs.existsSync(TMP_IMAGES)) {
    fs.mkdirSync(TMP_IMAGES);
}

let inputData = require(inputJSON);
inputData = inputData.db[0].data.posts;
inputData.shift(); // the first post looks like a message from Ghost blog software so skip it

// inputData = inputData.slice(0, 2);

let imageList = {};
const imageRegex = /<img\s+[^(src)]*src="([^\"]+)\"/g;

inputData.forEach(json => {
    // include the main image if in the json
    if (json.image) {
        imageList[json.image] = 1;
    }

    // now find any additional <img> tags in the html field and pull out the src URLs to include in the download
    if (json.html) {
        while ( match = imageRegex.exec( json.html ) ) {
            imageList[match[1]] = 1;
        }
    }
});

const CONCURRENT_DOWNLOADS = 10;
eachOfLimit(Object.keys(imageList), CONCURRENT_DOWNLOADS, async (imageUrl) => {
    // download main image
    if (imageUrl) {
        let filePath = await downloadImage(imageUrl);
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
    if (imageUrl.startsWith("https://")) {
        url = imageUrl;
    }

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
