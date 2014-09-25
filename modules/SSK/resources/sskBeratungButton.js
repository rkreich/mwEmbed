(function (mw, $, kWidget) {
    "use strict";

    mw.PluginManager.add('sskBeratungButton', mw.KBaseComponent.extend({

        defaultConfig: {
            parent: 'sideBarContainer'
        },

        setup: function () {
            this.addBindings();
        },

        addBindings: function () {
        },

        getComponent: function () {
            if (!this.$el) {
                this.$el = $('<button>Beratung</button>').addClass('beratung').prepend('<i class="icon-users"></i>');
            }
            return this.$el;
        }
    }));

})(window.mw, window.jQuery, kWidget);
