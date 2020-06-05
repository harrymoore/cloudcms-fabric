// node app.js output-file-path input-json-path group artifact version
require('dotenv').config();
const PACKAGER = require("cloudcms-packager");
const fs = require('fs');
const https = require('https');
const path = require('path');
const inputJSON = process.argv[2];
const group = process.argv[3];
const artifact = process.argv[4];
const version = process.argv[5];

const TMP_IMAGES = path.join(process.cwd(), "images");
if (!fs.existsSync(TMP_IMAGES)) {
    fs.mkdirSync(TMP_IMAGES);
}

PACKAGER.create({
    outputPath: "./",
    archiveGroup: group,
    archiveName: artifact,
    archiveVersion: version
}, function (err, packager) {
    if (err) {
        return console.error(err);
    }

    // packager.addFromDisk(inputJSON);
    var inputData = require(inputJSON);
    inputData = inputData.db[0].data.posts;
    inputData.shift(); // the first post looks like a message from Ghost blog software so skip it

    // add the 'images' folder node
    const IMAGES_ALIAS = "images";
    packager.addNode({
        _type: "n:node",
        title: "images",
        _alias: IMAGES_ALIAS,
        _features: {
            "f:container": {}
        },
        _existing: {
            _type: "n:node",
            title: "images",
            "_features.f:container": {
                "$exists": true
            }
        }
    });

    inputData = inputData.slice(0,5);
    
    inputData.forEach((json) => {
        let projectNode = new PROJECT(json);

        // download and attach main image
        if (projectNode.mainImage) {
            let title = path.basename(projectNode.mainImage);
            let filePath = path.join(TMP_IMAGES, title);
            var imageNode = {
                title: title,
                // _filePath: "/images/" + title,
                _alias: "image_" + title,
                _type: "fabric:image",
                _existing: {
                    _type: "fabric:image",
                    title: title
                }
            };
            packager.addNode(imageNode);
            packager.addAttachment(imageNode._alias, "default", filePath);
            packager.addAssociation(IMAGES_ALIAS, imageNode._alias, {
                "_type": "a:child",
                "directionality": "DIRECTED"
            });

            projectNode.mainImage = {
                __related_node__: imageNode._alias
            }
        }

        packager.addNode(projectNode)
    });

    // package up the archive
    packager.package(function (err, info) {
        if (err) {
            return console.error(err);
        }
        console.log("All done - wrote file: " + info.filename);
    });
});

function PROJECT(json) {
    this._type = "fabric:project";
    this.projectType = "project";
    this.title = json.title;
    this.overview = json.html || "";
    this.description = json.meta_description || "";
    this.slug = json.slug;
    this._key = "project_" + json.uuid;
    this._alias = "project_" + json.uuid;
    this._existing = {
        _type: "fabric:project",
        title: this.title
    };
    this.featured = json.featured ? "yes" : "no";
    this.season = [];
    this.difficulty = json.difficulty || "easy";
    this.discount = json.discount || "0";
    this.category = [{
        title: "Apparel"
    }];
    if (json.image) {
        this.mainImage = json.image;
    }
};

