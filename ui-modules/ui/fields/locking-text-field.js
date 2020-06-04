(function($) {

    var Alpaca = $.alpaca;

    if (!Alpaca.Fields) {
        Alpaca.Fields = {};
    }

    Alpaca.Fields.LockingTextField = Alpaca.Fields.SlugField.extend(
    {
        setup: function () {
            var self = this;

            try 
            {
                if (Alpaca.globalContext.document.__features()["f:publishable"].state === 'live')
                {
                    self.options.readonly = true;
                }    
            }
            catch {}

            self.base();
        },

        getFieldType: function()
        {
            return "locking-text";
        },

        getTitle: function() {
            return "Locking Text Field";
        },

        getDescription: function() {
            return "Subclass of Text field which locks input if node is Published";
        }
    });

    Alpaca.registerFieldClass("locking-text", Alpaca.Fields.LockingTextField);

})(jQuery);