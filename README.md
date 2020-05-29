# cloudcms-fabric
Cloud CMS engagement artifacts for Fabric.com "Inspire" project

Content Model and other configuration artifacts for Fabric.com

## install content model
    1. create a gitana.json file in this folder (project root)
    2. cd ./content-model
    3. set a branch id in deploy-content-model.sh
    4. run the shell script: ./deploy-content-model.sh

    Note: some of the forms use a custom control: "fabric-node-picker"
          so you will need to install the ui module below:

## install ui-module
    From Manage Platform / Modules register and deploy a new module:
    ID: fabric-ui
    Title: fabric-ui
    Type: github
    URL: https://github.com/harrymoore/cloudcms-fabric.git
    Path: /ui-modules/ui
    Branch: master

## import Category and Keyword content
    Category and Keywords are central to content curation. Predefined values can be imported:

    cd ./importer

    ### (one time setup) Install and initialize the npm "cloudcms-cli" module:
        1. npm install -g cloudcms-cli
        2. cloudcms init

    ### import data:
        1. Set a repository id and a branch id in deploy-content-model.sh
        2. run the shell script: ./deploy-data.sh
