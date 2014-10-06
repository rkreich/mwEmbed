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
                // buttons onclick is being set from sskEndScreen plugin
                this.$el = $('<a class="button">Beratung</a>').addClass('advice').prepend('<i class="icon-advice"></i>');
                if (this.getPlayer().playlist) // don't show in playlist mode
                    this.$el.hide();
            }
            return this.$el;
        }
    }));

})(window.mw, window.jQuery, kWidget);
