(function (mw, $, kWidget) {
    "use strict";

    mw.PluginManager.add('sskShareButton', mw.KBaseComponent.extend({

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
                // buttons onclick is being set from sskEndScreen plugin
                this.$el = $('<a class="button">Teilen</a>').addClass('share').prepend('<i class="icon-share"></i>');
            }
            return this.$el;
        }
    }));

})(window.mw, window.jQuery, kWidget);
