(function($) {

    var OneTeam = undefined;
    if (typeof(require) !== "undefined")
    {
        OneTeam = require("oneteam");
    }

    Ratchet.Gadgets.FabricNodePicker = Ratchet.Gadgets.AbstractGitanaPicker.extend({

        doGitanaQuery: function(context, model, searchTerm, query, pagination, callback)
        {
            var self = this;

            var projectType = jQuery("[data-alpaca-field-name='projectType']").children().children("option:selected").val() || "";
            if (projectType)
            {
                query.projectType = projectType
            }


            var b = self.branch();

            var o = {
                query: {}
            };

            if (model.query)
            {
                o.query = JSON.parse(JSON.stringify(model.query));
            }

            if (query)
            {
                Ratchet.copyInto(o.query, query);
            }

            var projectType = jQuery("[data-alpaca-field-name='projectType']").children().children("option:selected").val() || "";
            if (projectType)
            {
                o.query.projectType = projectType
            }
            else
            {
                delete o.query.projectType;
            }

            if (searchTerm) {
                if (model.filterMode === "fullText")
                {
                    o.search = searchTerm;
                }
                else
                {
                    o.search = OneTeam.buildSearchBlock(searchTerm, ["title", "__type"]);
                }
            }

            var typeQNames = [];
            if (model.typeQNames)
            {
                for (var i = 0; i < model.typeQNames.length; i++)
                {
                    if (!typeQNames.contains(model.typeQNames[i]))
                    {
                        typeQNames.push(model.typeQNames[i]);
                    }
                }
            }
            else if (model.typeQName)
            {
                typeQNames.push(model.typeQName);
            }

            var completionFn = function()
            {
                if (typeQNames.length > 0)
                {
                    o.query._type = {
                        "$in": typeQNames
                    };
                }

                if (!pagination) {
                    pagination = {};
                }

                pagination.paths = true;

                Chain(b).findNodes(o, pagination).then(function() {
                    callback(this);
                });
            };

            // if includeChildTypes, then we go back to the server for every definition QName in typeQNames
            // and load children type QNames.  We include those in our typeQNames.
            if (model.includeChildTypes)
            {
                OneTeam.projectDefinitions(self, function(definitionDescriptors) {

                    var loadedTypeQNames = [];

                    var fns = [];
                    for (var i = 0; i < typeQNames.length; i++)
                    {
                        var definition = null;
                        var descriptor = definitionDescriptors[typeQNames[i]];
                        if (descriptor)
                        {
                            definition = descriptor.definition;
                        }
                        if (definition)
                        {
                            var fn = function (definition, loadedTypeNames) {
                                return function (done) {

                                    definition.listChildDefinitions({
                                        "limit": -1,
                                        "ignoreParent": true
                                    }).each(function () {
                                        loadedTypeNames.push(this.getQName());
                                    }).then(function () {
                                        done();
                                    });

                                };
                            }(definition, loadedTypeQNames);
                            fns.push(fn);
                        }
                    }
                    Ratchet.parallel(fns, function () {

                        for (var i = 0; i < loadedTypeQNames.length; i++)
                        {
                            if (typeQNames.indexOf(loadedTypeQNames[i]) === -1)
                            {
                                typeQNames.push(loadedTypeQNames[i]);
                            }
                        }

                        completionFn();
                    });
                });

                return;
            }

            completionFn();
        },


    });

    Ratchet.GadgetRegistry.register("fabric-node-picker", Ratchet.Gadgets.FabricNodePicker);

})(jQuery);