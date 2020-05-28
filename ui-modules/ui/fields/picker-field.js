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
        projectType: "",

        launchModal: function(field, el, callback)
        {
            var self = this;

            if (self.options.picker && self.options.picker.query && self.options.picker.query.projectType)
            {
                var projectType = self.top().getControlByPath('projectType') ? self.top().getControlByPath('projectType').getValue() : "";
                if (projectType)
                {
                    self.options.picker.query.projectType = projectType
                }
                else
                {
                    delete self.options.picker.query.projectType;
                }
            }

            if (self.options.picker && self.options.picker.query && self.options.picker.query._doc && self.options.picker.query._doc.hasOwnProperty("$ne"))
            {
                var thisId = self.context.document && self.context.document._doc ? self.context.document._doc : null;
                if (thisId)
                {
                    self.options.picker.query._doc['$ne'] = thisId
                }
                else
                {
                    delete self.options.picker.query._doc['$ne'];
                }
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