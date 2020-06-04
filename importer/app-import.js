// node app.js output-file-path input-json-path group artifact version
require('dotenv').config();
const PACKAGER = require("cloudcms-packager");

const inputJSON = process.argv[2];
const group = process.argv[3];
const artifact = process.argv[4];
const version = process.argv[5];

PACKAGER.create({
    outputPath: "./",
    archiveGroup: group,
    archiveName: artifact,
    archiveVersion: version
}, function(err, packager) {
    if (err) {
        return console.error(err);
    }

    // packager.addFromDisk(inputJSON);
    var inputData = require(inputJSON);
    inputData = inputData.db[0].data.posts;
    inputData.shift(); // the first post looks like a message from Ghost blog software so skip it
    
    inputData.forEach(json => {
        packager.addNode(projectFromPost(json))        
    });

    // package up the archive
    packager.package(function(err, info) {
        if (err) {
            return console.error(err);
        }
        console.log("All done - wrote file: " + info.filename);
    });
});

function projectFromPost(json) {
    var project = new PROJECT(json);
    
    console.log(JSON.stringify(project,null,4));
    return project;
}

function Car(make, model, year) {
    this.make = make;
    this.model = model;
    this.year = year;
  }

function PROJECT(json) {
    this._type = "fabric:project";
    this.title = json.title;
    this.season = json.season || "";
    this.difficulty = json.difficulty || "easy";
    this.discount = json.discount || "0";
    this.description = json.html || "";

    // "DesktopMobile": "desktop",
    // "featured": "no",
    // "projectType": "sewing101",
    // "category": [
    //     {
    //         "id": "2547abbd4afcc9d6fcec",
    //         "ref": "node://e26d0b6d5e120016c18a/8ba09e97a317becd199a/d19ead4bc1bd4d4b3007/2547abbd4afcc9d6fcec",
    //         "title": "Apparel",
    //         "qname": "o:b0a94272d9b76d057c25",
    //         "typeQName": "fabric:category"
    //     }
    // ],
    // "mainImage": {},
    // "altImage": {},
    // "step1ToolsAndMaterials": {
    //     "title": "Step 1: Tools And Materials",
    //     "images": [],
    //     "links": []
    // },
    // "step2MeasuringCutting": {
    //     "title": "Step 2: Measuring & Cutting",
    //     "images": [],
    //     "links": []
    // },
    // "additionalSteps": [],
    // "additionalFiles": [
    //     {
    //         "file": {
    //             "id": "60ed4e11bb711cc5e9dd",
    //             "ref": "node://e26d0b6d5e120016c18a/8ba09e97a317becd199a/d19ead4bc1bd4d4b3007/60ed4e11bb711cc5e9dd",
    //             "title": "file1 copy 2.pdf",
    //             "qname": "o:60ed4e11bb711cc5e9dd",
    //             "typeQName": "n:node"
    //         }
    //     },
    //     {
    //         "file": {
    //             "id": "7caaa82767b797b9d536",
    //             "ref": "node://e26d0b6d5e120016c18a/8ba09e97a317becd199a/d19ead4bc1bd4d4b3007/7caaa82767b797b9d536",
    //             "title": "A Sample PDF.pdf",
    //             "qname": "o:7caaa82767b797b9d536",
    //             "typeQName": "n:node"
    //         }
    //     }
    // ]
};
