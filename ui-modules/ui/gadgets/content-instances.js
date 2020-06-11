define(function (require, exports, module) {
    var $ = require("jquery");
    var Ratchet = require("ratchet/web");
    var OneTeam = require("oneteam");
    var TemplateHelperFactory = require("template-helper");

    var ContentInstancesGadget = require("app/gadgets/project/content/content-instances");

    return Ratchet.GadgetRegistry.register("custom-content-instances", ContentInstancesGadget.extend({

        doGitanaQuery: function (context, model, searchTerm, query, pagination, callback) {
            if (!query) {
                query = {};
            }

            query._fields = {
                title: 1,
                description: 1,
                _system: 1,
                _type: 1,
                "mainImage.id": 1
            };

            if (searchTerm) {
                Object.assign(query, OneTeam.searchQuery(searchTerm, ["title", "description"]));
            }

            this.base(context, model, searchTerm, query, pagination, function (resultMap) {

                var array = resultMap.asArray();

                model.size = resultMap.size();
                model.totalRows = resultMap.totalRows();

                // copy into map so that we can reference by ID
                // this may help with drag/drop                
                model.rowsById = {};
                for (var i = 0; i < array.length; i++) {
                    var row = array[i];
                    model.rowsById[row._doc] = row;
                }

                callback(resultMap);
            });
        },

        iconUri: function (row, model, context) {
            var _iconUri = OneTeam.iconUriForNode(row);

            if (row.mainImage && row.mainImage.id) {
                _iconUri = _iconUri.replace(/&node=[^&]+&/, "&node=" + row.mainImage.id + "&");
            }

            _iconUri = _iconUri.replace("size=64", "size=128");
            _iconUri = _iconUri.replace("icon64", "icon128");

            return _iconUri;
        },

        prepareModel: function (el, model, callback) {
            var self = this;

            this.base(el, model, function () {

                TemplateHelperFactory.create(self, "content-instances", function (err, renderTemplate) {

                    model.renderTemplate = renderTemplate;

                    var project = self.observable("project").get();

                    model.projectId = project.getId();
                    model.types = [];

                    OneTeam.project2ContentTypes(self, true, function (contentTypeEntries) {

                        var selectedContentTypeDescriptor = null;

                        // select based on incoming qname, otherwise select first
                        var qname = model.tokens["qname"];
                        if (qname) {
                            for (var i = 0; i < contentTypeEntries.length; i++) {
                                if (contentTypeEntries[i].qname === qname) {
                                    selectedContentTypeDescriptor = contentTypeEntries[i];
                                    break;
                                }
                            }
                        }

                        if (!selectedContentTypeDescriptor) {
                            if (contentTypeEntries && contentTypeEntries.length > 0) {
                                selectedContentTypeDescriptor = contentTypeEntries[0];
                            }
                        }

                        model.selectedContentTypeDescriptor = selectedContentTypeDescriptor;

                        // we set this here in case any dependent code needs this observable
                        // (such as the create content wizard which links from this page)
                        if (selectedContentTypeDescriptor) {
                            self.observable("selected-content-type").set(selectedContentTypeDescriptor);
                        }

                        callback();

                    });
                });
            });
        }
    }));
});