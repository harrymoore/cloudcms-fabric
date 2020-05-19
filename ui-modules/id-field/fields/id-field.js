define(function(require, exports, module) {

    var $ = require("jquery");

    var Alpaca = $.alpaca;

    Alpaca.Fields.IdField = Alpaca.Fields.TextField.extend(
    /**
     * @lends Alpaca.Fields.IdField.prototype
     */
    {
        onChange: function()
        {
            var self = this;

            self.base();

            var value = self.getValue();
            if ("" === value) {
                self.setValue(self._randomValue());
            }
        },

        /**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "id-field";
        },

        /**
         * @see Alpaca.Fields.TextField#handleValidate
         */
        handleValidate: function()
        {
            return this.base();
        },
        
        /**
         * @see Alpaca.Fields.TextField#setup
         */
        setup: function()
        {
            this.base();
        },
 
        _getThisNodeId: function()
        {
            if (Alpaca.globalContext.document) {
                return Alpaca.globalContext.document._doc;
            }

            var parts = window.location.hash.split('/');
            var id = parts[4] || "";
            return id;
        },

        beforeRenderControl: function(model, callback)
        {
            var self = this;
            var property = self.options.property || '_doc';
            var thisNodeId = self._getThisNodeId();
        },

        afterRenderControl: function (model, callback) {
            var self = this;

            this.base(model, function () {
                self.on("ready", function (e) {
                    if (Alpaca.isValEmpty(self.getValue()))
                    {
                        self.setValue(self._getThisNodeId());
                    }
                });

                callback();
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {

            return Alpaca.merge(this.base(), {
                "properties": {
                    "property": {
                        "title": "Property",
                        "description": "Name of the property to duplicate. Defaults to _doc",
                        "type": "string",
                        "default": "_doc",
                        "readonly": true
                    }
                }
            });

        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "property": {
                        "type": "text"
                    }
                }
            });
        },

        /**
         * @see Alpaca.Fields.TextField#getTitle
         */
        getTitle: function() {
            return "ID Field";
        },

        /**
         * @see Alpaca.Fields.TextField#getDescription
         */
        getDescription: function() {
            return "Duplicate _doc property in a read only field";
        }

        /* end_builder_helpers */
    });
    
    // Alpaca.registerMessages({
    // });

    Alpaca.registerFieldClass("id", Alpaca.Fields.IdField);

});

