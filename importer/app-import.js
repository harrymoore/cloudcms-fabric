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
    
    // console.log(JSON.stringify(project,null,4));
    return project;
}

function Car(make, model, year) {
    this.make = make;
    this.model = model;
    this.year = year;
  }

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
    this.season = json.season || "spring";
    this.difficulty = json.difficulty || "easy";
    this.discount = json.discount || "0";
    this.category = {
        title: "Apparel"
    };
    this.mainImage = {
        title: ""
    };
};
