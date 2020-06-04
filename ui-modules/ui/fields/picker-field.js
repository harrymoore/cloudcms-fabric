(function($) {

    var Alpaca = $.alpaca;

    if (!Alpaca.Fields) {
        Alpaca.Fields = {};
    }

    Alpaca.Fields.FabricNodePickerField = Alpaca.Fields.AbstractGitanaPickerField.extend(
    /**
     * @lends Alpaca.Fields.FabricPickerField.prototype
     */
    {
        // setup: function () {
        //     var self = this;

        //     try 
        //     {
        //         if ((self.name == "category" || self.name == "subCategory") && Alpaca.globalContext.document.__features()["f:publishable"].state === 'live')
        //         {
        //             self.options.readonly = true;
        //             self.top().getControlByPath('category') ? self.top().getControlByPath('category').getValue() : [];
        //         }    
        //     }
        //     catch {}

        //     self.base();
        // },

        postRender: function(callback)
        {
            var self = this;

            self.base(function(){

                try 
                {
                    if ((self.name == "category" || self.name == "subCategory") && Alpaca.globalContext.document.__features()["f:publishable"].state === 'live')
                    {
                        self.options.readonly = true;
                    }    
                }
                catch {}

                callback();
            });
        },

        renderButtons: function(outer, columnButtons, refreshFn)
        {
            var self = this;

            try 
            {
                if ((self.name == "category" || self.name == "subCategory") && Alpaca.globalContext.document.__features()["f:publishable"].state === 'live')
                {
                    return;
                }    
            }
            catch {}

            self.base(outer, columnButtons, refreshFn);
        },

        launchModal: function(field, el, callback)
        {
            var self = this;

            if (self.options.readonly) {
                return callback();
            }

            // parentCategory field on fabric:category template
            if (self.name == "parentCategory" && self.options.picker) {
                self.options.picker.query = {
					_type: "fabric:category",
					parentCategory: {
						"$exists": false
					},
					_doc: {
						"$ne": self.context.document._doc
					}
				};
            }

            // category field on fabric:project template
            if (self.name == "category" && self.options.picker) {
                self.options.picker.query = {
					_type: "fabric:category",
                    projectType: self.top().getControlByPath('projectType').getValue() || "",
					parentCategory: {
						"$exists": false
                    }
                };
            }

            // subCategory field on fabric:project template
            if (self.name == "subCategory" && self.options.picker) {
                var id = self.top().getControlByPath('category') ? self.top().getControlByPath('category').getValue() : [];
                if (id.length > 0)
                {
                    var ids = [];
                    id.forEach(element => {
                        ids.push(element.id);
                    });
                    
                    self.options.picker.query = {
                        _type: "fabric:category",
                        "parentCategory.id": {
                            "$in": ids
                        }
                    };
                }
            }

            // keywords field on fabric:project template
            if (self.name == "keywords" && self.options.picker) {
                self.options.picker.query = {
					_type: "fabric:keyword",
                    "category.projectType": self.top().getControlByPath('projectType').getValue() || ""
                };
            }
            
            self.base(field, el, callback);
        },

        getFieldType: function()
        {
            return "fabric-node-picker";
        },

        pickerConfiguration: function()
        {
            return {
                "title": "Select a Node",
                "type": "gitana-node-picker"
            };
        },

        getTitle: function() {
            return "Fabric Node Picker Field";
        },

        getDescription: function() {
            return "Field for selecting nodes from Fabric content model based on projectType property";
        }
    });


    Alpaca.registerFieldClass("fabric-node-picker", Alpaca.Fields.FabricNodePickerField);

})(jQuery);