define(function (require, exports, module) {
    var $ = require("jquery");
    var url = "" + location.href;

    // only register this handler on the Content instances page
    if (url && -1 !== url.indexOf('/content/fabric:project') || -1 !== url.indexOf('/documents/')) {
        document.addEventListener("load", function (evt) {
            // an image was loaded. if it looks like the preview image of a content instance then handle it
            var srcUrl = "" + evt.target.src;
            var matches = srcUrl.match(/preview\/([^?]+)\?repository=([^&]+)\&branch=([^&]+)\&node=([^&]+)\&/);

            if (matches && matches.length == 5) {
                // console.log("Node id = " + matches[4] + " srcUrl = " + srcUrl);
                // console.log("event.target.src " + JSON.stringify(evt.target.src));

                var nodeUrl = "/proxy/repositories/" + matches[2] + "/branches/" + matches[3] + "/nodes/query";
                var query = '{"_doc": "_ID_","_fields": {"mainImage.image.id": 1}}'.replace("_ID_", matches[4]);

                // see if this is a fabric:project icon preview request
                $.ajax({
                    type: "GET",
                    url: nodeUrl,
                    data: {
                        "query": query
                    },
                    context: evt.target
                }).done(function (data) {
                    if (data && data.rows && data.rows.length && data.rows.length > 0 && data.rows[0].mainImage && data.rows[0].mainImage.image && data.rows[0].mainImage.image.id) {
                        var targetEl = this;
                        try {
                            // attempt to replace the icon preview url with a url that refers to the node's mainImage property
                            // targetEl.src = "/proxy/repositories/_REPO_/branches/_BRANCH_/nodes/_NODE_/attachments/default?size=125".replace("_REPO_", matches[2]).replace("_BRANCH_", matches[3]).replace("_NODE_", data.rows[0].mainImage.image.id);
                            targetEl.src = "/preview/_NODE1_?repository=_REPO_&branch=_BRANCH_&node=_NODE2_&mimetype=image/png&size=125&name=preview_&attachment=default".replace("_REPO_", matches[2]).replace("_BRANCH_", matches[3]).replace("_NODE1_", matches[4]).replace("_NODE2_", data.rows[0].mainImage.image.id);
                        } finally { }
                    }
                });
            }
        }, true);
    }

    // use larger image previews
    document.addEventListener("load", function(ev) {
        var s = "" + ev.target.src;
        if (s && -1 !== s.indexOf('.cloudcms.net/preview/') && -1 !== s.indexOf('size=64') && -1 === s.indexOf('&_replaced')) {
            s = s.replace("name=icon64", "name=iconfabric");
            s = s.replace("size=64", "size=125");
            s = s.replace("mimetype=image/png", "mimetype=image/jpeg");
            // s += "&force=true&_replaced=true";
            ev.target.src = s;
        }
    }, true);

    // $(document).ajaxSend(function (event, jqxhr, settings) {
    //     console.log(JSON.stringify(settings, null, 2));
    // });

    // $("body").on("cloudcms-ready", function () {
    //     $.ajaxSetup({
    //         global: false,
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

});