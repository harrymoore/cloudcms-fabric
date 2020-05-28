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

        // afterRenderControl: function(model, callback)
        // {
        //     var self = this;

        //     self.projectType = self.context.document ? self.context.document.projectType || "" : "";

        //     this.base(model, function() {
        //         self.on("ready", function(e){
        //             // screen draw is done
        //             // find the field and register a callback
        //             var dep = self.top().getControlByPath('projectType');
        //             if (dep) {
        //                 self.subscribe(dep, function(value) {
        //                     self.projectType = value;
        //                 });
        //             }
        //         });
        //         callback();
        //     });
        // },

        launchModal: function(field, el, callback)
        {
            var self = this;

            var projectType = self.top().getControlByPath('projectType') ? self.top().getControlByPath('projectType').getValue() : "";
            if (projectType)
            {
                self.options.picker.query.projectType = projectType
            }
            else
            {
                delete self.options.picker.query.projectType;
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