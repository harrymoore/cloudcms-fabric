// node app.js output-file-path input-json-path group artifact version
require('dotenv').config();
const packager = require("cloudcms-packager");

const outputFolder = process.argv[2];
const inputJSON = process.argv[3];
const group = process.argv[4];
const artifact = process.argv[5];
const version = process.argv[6];

// const now = Date.now();
// const date = new Date(now);
// const timestamp = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}-${now}`;
// console.log(timestamp);

packager.create({
    outputPath: outputFolder,
    archiveGroup: group,
    archiveName: artifact,
    archiveVersion: version
}, function(err, packager) {
    if (err) {
        return console.error(err);
    }

    // package up content type definitions
    packager.addFromDisk(inputJSON);

    // package up the archive
    packager.package(function(err, info) {
        if (err) {
            return console.error(err);
        }
        console.log("All done - wrote file: " + info.filename);
    });

});