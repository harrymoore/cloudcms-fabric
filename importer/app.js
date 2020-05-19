require('dotenv').config();
const packager = require("cloudcms-packager");

const archiveName = argv[1];


const now = Date.now();
const date = new Date(now);
const timestamp = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}-${now}`;
console.log(timestamp);

packager.create({
    outputPath: "output-data",
    archiveGroup: "fabric",
    archiveName: "model",
    archiveVersion: timestamp
}, function(err, packager) {
    if (err) {
        return console.error(err);
    }

    // let's put things into the package...
    packager.addNode({
        "title": "Hello World"
    });

    // package up the archive
    packager.package(function(err, info) {
        if (err) {
            return console.error(err);
        }
        console.log("All done - wrote file: " + info.filename);
    });

});