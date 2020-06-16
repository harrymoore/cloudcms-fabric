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
    const IMAGES_ALIAS = "node__images";
    const imagesFolderNode = packager.addNode({
        _type: "n:node",
        title: "images",
        _alias: IMAGES_ALIAS,
        _features: {
            "f:container": {
                active: true
            },
            "f:titled": {},
            "f:filename": {
                "filename": "images"
            },
            "f:indexable": {}
        },
        _existing: {
            _type: "n:node",
            title: "images",
            "_features.f:container": {
                "$exists": true
            }
        }
    });


    const ROOT_NODE = {
        _qname: "r:root",
        _type: "n:root",
        _alias: "root_root",
        _existing: {
            _type: "n:node",
            _qname: "r:root"
        }
    };
    const rootNode = packager.addNode(ROOT_NODE);

    packager.addAssociation(rootNode.json._alias, imagesFolderNode.json._alias, {
        "_type": "a:child",
        "directionality": "DIRECTED"
    });

    // process just a few nodes for testing
    inputData = inputData.slice(0, 2);

    inputData.forEach((json) => {
        let projectJSON = new PROJECT(json);

        // attach main image
        if (projectJSON.mainImage) {
            let title = path.basename(projectJSON.mainImage);
            let filePath = path.join(TMP_IMAGES, title);
            var imageJSON = {
                title: title,
                // _filePath: "/images/" + title,
                _alias: "image_" + title,
                _type: "fabric:image",
                _features: {
                    "f:titled": {},
                    "f:filename": {
                        "filename": title
                    },
                    "f:indexable": {}
                },
                _existing: {
                    _type: "fabric:image",
                    title: title
                }
            };
            imageNode = packager.addNode(imageJSON);
            packager.addAttachment(imageNode.json._alias, "default", filePath);
            packager.addAssociation(imagesFolderNode.json._alias, imageNode.json._alias, {
                "_type": "a:child",
                "directionality": "DIRECTED"
            });
            console.log("adding node for image: \n" + JSON.stringify(imageNode, null, 2));
            projectJSON.mainImage = {
                __related_node__: imageNode.json._alias
            }
        }

        let projectNode = packager.addNode(projectJSON)

        // now find any additional <img> tags in the html field and pull out the src URLs to include in the download
        if (projectNode.json.overview) {
            let imageList = {};
            const imageRegex = /<img\s+[^(src)]*src="([^\"]+)\"/g;

            while (match = imageRegex.exec(projectNode.json.overview)) {
                // if (projectJSON.json.mainImage && projectJSON.json.mainImage == )
                imageList[match[1]] = 1;
            }

            Object.keys(imageList).forEach(imageUrl => {
                let title = path.basename(imageUrl);
                let filePath = path.join(TMP_IMAGES, title);

                let imageJSON = {
                    title: title,
                    _alias: "image_" + title,
                    _type: "fabric:image",
                    _features: {
                        "f:titled": {},
                        "f:filename": {
                            "filename": title
                        },
                        "f:indexable": {}
                    },
                    _existing: {
                        _type: "fabric:image",
                        title: title
                    }
                };

                if (projectNode.json.mainImage && projectNode.json.mainImage.__related_node__ == imageJSON._alias) {
                    // mainImage is already created so skip here
                } else {
                    let imageNode = packager.addNode(imageJSON);
                    packager.addAttachment(imageNode.json._alias, "default", filePath);
                    // add the image node as a child of the "/images" folder node
                    packager.addAssociation(imagesFolderNode.json._alias, imageNode.json._alias, {
                        "_type": "a:child",
                        "directionality": "DIRECTED"
                    });
                    // associate image to this Project node
                    packager.addAssociation(imagesFolderNode.json._alias, imageNode.json._alias, {
                        "_type": "a:linked",
                        "directionality": "UNDIRECTED"
                    });
                }
            });
        }
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
    this.projectType = "legacy";
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
    this.creationDate = json.created_at || "";
    if (json.image) {
        this.mainImage = json.image;
    }
};
