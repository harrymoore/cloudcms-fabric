#!/usr/bin/env node
/*jshint esversion: 8 */
/*jshint -W069 */
const BaseScript = require('./lib/BaseScript.js');
const chalk = require('chalk');
const Logger = require('basic-logger');
const log = new Logger({
    showMillis: false,
    showTimestamp: true
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

class Patch extends BaseScript {
    constructor() {
        super();
    }

    /** exec()
     * entry point 
    */
    async exec() {
        let self = this;

        await self.connect();

        console.log(chalk.yellow("Connected to project: \"" + self.project.title + "\" and branch: " + self.branch.title || self.branch._doc));

        let query = {
            _type: "fabric:project",
            id: {
                '$exists': false
            },
            _fields: {
                title: 1,
                _doc: 1,
                id: 1
            }
        };

        let nodes = await self.session.queryNodes(self.repository, self.branch, query, {metadata: true, full: true, limit: -1});

        // nodes.rows.forEach(async (doc) => {
        //     // no id
        //     log.info(`${doc._doc} "" title: "${doc.title}"`);
        //     // console.log(JSON.stringify(doc,null,2));
        //     let node = await self.session.updateNode(self.repository, self.branch, doc, {id: doc._doc});
        //     console.log("Updated node: " + JSON.stringify(node,null,2));
        // });

        let patches = nodes.rows.map(node => {
            let patch = {
                node: node._doc,
                patch: {
                    op: 'add',
                    path: '/id',
                    value: node._doc
                }
            };

            return patch;
        });
    

        console.log("Patches: " + JSON.stringify(patches, null, 2));
    
        patches.forEach(patch => {
            console.log("Patch: " + JSON.stringify(patch, null, 2));
            self.session.patchNode(self.repository, self.branch, patch.node, [patch.patch]);    

            // setTimeout(function() {
            //     console.log("Patch: " + JSON.stringify(patch, null, 2));
            //     self.session.patchNode(self.repository, self.branch, patch.node, [patch.patch]);    
            // }, 1000);
        });        
    }
};


// Run the command class exec() method
(new Patch()).exec();
