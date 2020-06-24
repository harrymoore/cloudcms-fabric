// node app.js output-file-path input-json-path group artifact version
require('dotenv').config();
const PACKAGER = require("cloudcms-packager");
const urlCoDec = require("url-encode-decode");
const fs = require('fs');
const https = require('https');
const path = require('path');
const { url } = require('inspector');
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
    // const IMAGES_ALIAS = "node__images";
    const imagesFolderNode = packager.addNode({
        _type: "n:node",
        title: "images",
        // _alias: IMAGES_ALIAS,
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
        // _alias: "root_root",
        _existing: {
            _type: "n:node",
            _qname: "r:root"
        }
    };
    const rootNode = packager.addNode(ROOT_NODE);

    packager.addAssociation(rootNode, imagesFolderNode, {
        "_type": "a:child",
        "directionality": "DIRECTED"
    });

// process just a few nodes for testing
// inputData = inputData.slice(19, 22);

    inputData.forEach((json) => {
        let projectJSON = new PROJECT(json);
        let mainImageNode = null;

        // attach main image
        if (projectJSON.mainImage && projectJSON.mainImage.src) {
            let title = path.basename(projectJSON.mainImage.src);
            let filePath = path.join(TMP_IMAGES, title);
            var imageJSON = {
                title: title,
                altText: projectJSON.mainImage.alt || title,
                url: projectJSON.mainImage.src,
                // _alias: "image_" + title,
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
            mainImageNode = packager.addNode(imageJSON);
            if (fs.existsSync(filePath)) {
                packager.addAttachment(mainImageNode, "default", filePath);
            } else {
                console.log("WARNING: image file not found for attachment " + filePath);
            }
            packager.addAssociation(imagesFolderNode, mainImageNode, {
                "_type": "a:child",
                "directionality": "DIRECTED"
            });
            // console.log("adding node for image: \n" + JSON.stringify(mainImageNode, null, 2));
            projectJSON.mainImage = {
                __related_node__: mainImageNode.id
            }
        }

        let projectNode = packager.addNode(projectJSON)

        if (projectNode.json._imageList) {
            projectNode.json._imageList.forEach(image => {
                let imageUrl = image.src;
                let title = path.basename(imageUrl);
                let filePath = path.join(TMP_IMAGES, title);
                let alt = image.alt || title;
                let url = imageUrl;

                let imageJSON = {
                    title: title,
                    altText: alt,
                    url: url,
                    // _alias: "image_" + url,
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

                let imageNode = packager.addNode(imageJSON);
                if (fs.existsSync(filePath)) {
                    packager.addAttachment(imageNode, "default", filePath);
                } else {
                    console.log("WARNING: image file not found for attachment " + imageUrl);
                }
                    // add the image node as a child of the "/images" folder node
                packager.addAssociation(imagesFolderNode, imageNode, {
                    "_type": "a:child",
                    "directionality": "DIRECTED"
                });
                // associate image to this Project node
                packager.addAssociation(projectNode, imageNode, {
                    "_type": "a:linked",
                    "directionality": "UNDIRECTED"
                });
            });

            delete projectNode.json._imageList;
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
    // this._alias = "project_" + json.uuid;
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
        this.mainImage = {
            src: urlCoDec.decode(json.image),
            alt: json.meta_title || ""
        };
    } else {
        this.mainImage = {}
    }

    this._imageList = extractImages(json.markdown);
};

function extractImages(markdown) {
    let imageRegex = /(?:!\[(.*?)\]\((.*?)\))/g;
    let imageList = [];

    while (match = imageRegex.exec(markdown)) {
        imageList.push({
            alt: match[1],
            src: urlCoDec.decode(match[2])
        });
    }

    return imageList;
}
