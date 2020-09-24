// node app.js output-file-path input-json-path group artifact version
require('dotenv').config();
const urlCoDec = require("url-encode-decode");
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

inputData.forEach(json => {
    // include the main image if in the json
    if (json.image) {
        imageList[urlCoDec.decode(json.image)] = json.id;
    }

    // now find any additional images in the markdown field to include in the download
    if (json.markdown) {
        extractImages(json.markdown).forEach(imageSrc => {
            imageList[urlCoDec.decode(imageSrc)] = json.id;
        });
    }   
});

const CONCURRENT_DOWNLOADS = 10;
eachOfLimit(Object.keys(imageList), CONCURRENT_DOWNLOADS, async (imageUrl) => {
    // download main image
    if (imageUrl) {
        try {
            let filePath = await downloadImage(imageUrl, imageList[imageUrl]);
            // let title = path.basename(filePath);
            // console.log(`Downloaded image ${title} to ${filePath}`);
        } catch (error) {
            console.error(`Failed to downloaded image ${imageUrl} with error ${error}`);
        }
    }
}, (err) => {
    if (err) {
        return "Got an error: " + console.error(err);
    }
    console.log("All done - images downloaded to " + TMP_IMAGES);
});

function extractImages(markdown) {
    let imageRegex = /(?:!\[(.*?)\]\((.*?)\))/g;
    let imageList = [];

    while (match = imageRegex.exec(markdown)) {
        imageList.push(urlCoDec.decode(match[2]));
    }

    return imageList;
}

async function downloadImage(imageUrl, blogId) {
    let url = (new URL(imageUrl, "https://www.fabric.com/")).toString();
    if (imageUrl.startsWith("https://")) {
        url = imageUrl;
    }

    let ext = path.extname(imageUrl);
    let fileName = path.basename(url, ext) + '_' + blogId + ext;
    let filePath = path.normalize(path.join(TMP_IMAGES, fileName));
    const writer = fs.createWriteStream(filePath);

    const response = await Axios({
        url: urlCoDec.decode(url),
        method: 'GET',
        responseType: 'stream'
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve(filePath))
        writer.on('error', reject)
    })
}
