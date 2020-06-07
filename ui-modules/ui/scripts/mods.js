define(function (require, exports, module) {
    var $ = require("jquery");

    // document.addEventListener("load", function (ev) {
    //     var s = "" + ev.target.src;
    //     if (s && -1 !== s.indexOf('/preview/') && -1 !== s.indexOf('size=64')) {
    //         // s = s.replace("name=icon64", "name=icon160");
    //         s = s.replace("size=64", "size=128");
    //         // s = s.replace("mimetype=image/png", "mimetype=image/jpeg");
    //         ev.target.src = s;
    //     }
    // }, true);

    // (function (send) {
    //     XMLHttpRequest.prototype.send = function (body) {
    //         var info = "send data\r\n" + body;
    //         console.log(info);
    //         send.call(this, body);
    //     };
    // })(XMLHttpRequest.prototype.send);

    let oldXHROpen = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        // do something with the method, url and etc.
        this.addEventListener('load', function () {
            // do something with the response text
            console.log('load: ' + this.responseText);
        });

        return oldXHROpen.apply(this, arguments);
    }
});