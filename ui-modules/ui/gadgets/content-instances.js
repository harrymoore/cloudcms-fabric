define(function (require, exports, module) {
    var $ = require("jquery");
    var Ratchet = require("ratchet/web");
    var OneTeam = require("oneteam");
    var TemplateHelperFactory = require("template-helper");

    var ContentInstancesGadget = require("app/gadgets/project/content/content-instances");

    return Ratchet.GadgetRegistry.register("custom-content-instances", ContentInstancesGadget.extend({

        doGitanaQuery: function (context, model, searchTerm, query, pagination, callback) {
            var self = this;

            if (!query) {
                query = {};
            }

            if (self.selectedProjectType) {
                query.projectType = self.selectedProjectType;
            }

            query._fields = {
                title: 1,
                projectType: 1,
                contributor: 1,
                keywords: 1,
                category: 1,
                creationDate: 1,
                launchDate: 1,
                expirationDate: 1,
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

        afterSwap: function(el, model, originalContext, callback)
        {
            var self = this;

            self.base(el, model, originalContext, function() {

                var selectedContentTypeDescriptor = self.observable("selected-content-type").get();
                if (selectedContentTypeDescriptor && selectedContentTypeDescriptor.definition && selectedContentTypeDescriptor.definition.properties.projectType) {
                    // customization. add select list to choose project type filter
                    var selectList = '<select class="btn btn-default" id="selectedProjectType" name="projecttypes"><option selected value="">All</option>';
                    
                    selectedContentTypeDescriptor.definition.properties.projectType.enum.forEach(type => {
                        selectList += `<option value="${type}">${type}</option>`;
                    });

                    selectList += "</select>";

                    var selectListDiv = `<div id="project-type-div" class="button-container dropdown">${selectList}</div>`;
                    var projectTypeList = $(selectListDiv).insertBefore('#center > div.buttonbar > div.pull-right > div:nth-child(1) > button');

                    // on change of selected Project Type:
                    $(projectTypeList).change(function(e) {
                        e.stopPropagation();
                        self.selectedProjectType = $(e.target).find(":selected").val() || "";
                        self.handleSetFilter(el, model, $(el).find("input[type=search]").val());
                    });
                }

                callback();
            });
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