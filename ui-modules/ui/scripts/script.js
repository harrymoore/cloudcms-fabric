define(function (require, exports, module) {
    var $ = require("jquery");

    // (function (open) {
    //     XMLHttpRequest.prototype.open = function () {
    //         this.addEventListener("readystatechange", function () {
    //             console.log(this.readyState);
    //         }, false);
    //         open.apply(this, arguments);
    //     };
    // })(XMLHttpRequest.prototype.open);

    // $("body").on("cloudcms-ready", function () {
    //     $.ajaxSetup({
    //         // global: true,
    //         beforeSend: function (xhr, settings) {
    //             // console.log(JSON.stringify(xhr, null, 2));
    //             console.log(JSON.stringify(settings, null, 2));
    //             return true;
    //         },

    //         complete: function (xhr, status) {
    //             console.log(JSON.stringify(xhr, null, 2));
    //             console.log(JSON.stringify(status, null, 2));
    //             return true;
    //         }
    //     });
    // });

    // $.ajaxSetup({
    //     dataFilter: function (data, type) {
    //         if (type === 'json' && data) {
    //             var jsonData = JSON.parse(data);
    //             if (jsonData.href && jsonData.href.startsWith('https://sandbox.api.kbb.com/vrs/data/makes')) {
    //                 data = [];
    //                 for (var i = 0; i < jsonData.items.length; i++) {
    //                     data.push({
    //                         value: jsonData.items[i].makeId,
    //                         text: jsonData.items[i].makeName
    //                     });
    //                 }
    //             }

    //             data = JSON.stringify(data);
    //         }

    //         return data;
    //     }
    // });

    // use larger image previews
    // document.addEventListener("load", function (ev) {
    //     var s = "" + ev.target.src;
    //     if (s && -1 !== s.indexOf('/preview/') && -1 !== s.indexOf('size=64')) {
    //         s = s.replace("name=icon64", "name=icon160");
    //         s = s.replace("size=64", "size=160");
    //         s = s.replace("mimetype=image/png", "mimetype=image/jpeg");
    //         ev.target.src = s;
    //     }
    // }, true);

});