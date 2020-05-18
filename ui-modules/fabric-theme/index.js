define(function(require, exports, module) {

    var UI = require("ui");
    var moduleId = module.uri.match(/^.+(_modules[^\/]+)\/.*/)[1];

    // register the theme: "theme"
    UI.registerTheme({
        "key": "fabric-theme",
        "title": "Fabric Theme",
        "module": moduleId + "/theme.js"
    });

});