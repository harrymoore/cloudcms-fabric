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

let imageFileNames = {};

PACKAGER.create({
    outputPath: "./",
    archiveGroup: group,
    archiveName: artifact,
    archiveVersion: version
}, function (err, packager) {
    if (err) {
        return console.error(err);
    }

    // load categories so we can associate projects correctly
    var categoryData = require('./input-data/categories.json');
    categoryData.forEach(json => {
        packager.addNode(json)        
    });

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
            let ext = path.extname(projectJSON.mainImage.src);
            let fileName = path.basename(projectJSON.mainImage.src, ext) + '_' + json.id + ext;
            let filePath = path.join(TMP_IMAGES, fileName);
            var imageJSON = {
                title: fileName,
                altText: projectJSON.mainImage.alt || fileName,
                url: projectJSON.mainImage.src,
                // _alias: "image_" + fileName,
                _type: "fabric:image",
                _features: {
                    "f:titled": {},
                    "f:filename": {
                        "filename": fileName
                    },
                    "f:indexable": {}
                },
                _existing: {
                    _type: "fabric:image",
                    title: fileName
                }
            };

            let mainImageNode = null;
            if (imageFileNames[imageJSON.title]) {
                mainImageNode = imageFileNames[imageJSON.title];
            } else {
                mainImageNode = packager.addNode(imageJSON);
                imageFileNames[imageJSON.title] = mainImageNode;
                if (fs.existsSync(filePath)) {
                    packager.addAttachment(mainImageNode, "default", filePath);
                } else {
                    console.log("WARNING: image file not found for attachment " + filePath);
                }
                packager.addAssociation(imagesFolderNode, mainImageNode, {
                    "_type": "a:child",
                    "directionality": "DIRECTED"
                });
            }

            // console.log("adding node for image: \n" + JSON.stringify(mainImageNode, null, 2));
            projectJSON.mainImage = {
                __related_node__: mainImageNode.id
            }
        }

        let projectNode = packager.addNode(projectJSON)

        if (projectNode.json._imageList) {
            projectNode.json._imageList.forEach(image => {
                let imageUrl = image.src;
                let ext = path.extname(imageUrl);
                let fileName = path.basename(imageUrl, ext) + '_' + json.id + ext;
                let filePath = path.join(TMP_IMAGES, fileName);
                let alt = image.alt || fileName;

                let imageJSON = {
                    title: fileName,
                    altText: alt,
                    url: imageUrl,
                    // _alias: "image_" + imageUrl,
                    _type: "fabric:image",
                    _features: {
                        "f:titled": {},
                        "f:filename": {
                            "filename": fileName
                        },
                        "f:indexable": {}
                    // },
                    // _existing: {
                    //     _type: "fabric:image",
                    //     title: fileName
                    }
                };

                let imageNode = null;
                if (imageFileNames[imageJSON.title]) {
                    imageNode = imageFileNames[imageJSON.title];
                } else {
                    imageNode = packager.addNode(imageJSON);
                    imageFileNames[imageJSON.title] = imageNode;
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
                }
                
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

function getProjectType(json) {
    if (!json.slug || typeof json.slug !== 'string') {
        return "project";
    }
    if (!json.title || typeof json.title !== 'string') {
        return "project";
    }
    if (!json.markdown || typeof json.markdown !== 'string') {
        return "project";
    }
    
    let str = `${json.slug} ${json.title} ${json.markdown}`;

    if (str.match(/designer/i)) {
        return "inspiration";
    }

    if (str.match(/sewing\s+101/i) || str.match(/sewing\s+tips/i)) {
        return "sewing101";
    }

    if (str.match(/fabric\s+101/i) || str.match(/fabrics/i)) {
        return "fabric101";
    }

    if (str.match(/quilt/i) && str.match(/block/i)) {
        return "project";
    }
    
    if (str.match(/diy/i) || str.match(/quilt/i) || str.match(/pattern/i) || str.match(/tutorial/i)) {
        return "project";
    }

    if (str.match(/holiday/i)) {
        return "project";
    }

    if (str.match(/designer/i)) {
        return "inspiration";
    }

    return "project";
}

function PROJECT(json) {
    this._type = "fabric:project";
    // this.id = "_alias";
    this.projectType = getProjectType(json);
    console.log(`${json.id},${this.projectType}`)

    this.projectSubType = "legacyBlogPost";
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
        __related_node__: "category_Apparel"
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
