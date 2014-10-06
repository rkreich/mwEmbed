(function (mw, $, kWidget) {
    "use strict";

    mw.PluginManager.add('sskBeratungButton', mw.KBaseComponent.extend({

        defaultConfig: {
            parent: 'sideBarContainer'
        },

        setup: function () {
            if (this.getPlayer().playlist) // don't enable on playlists
                return;
            this.addBindings();
        },

        addBindings: function () {
        },

        getComponent: function () {
            if (!this.$el) {
                this.$el = $('<button>Beratung</button>').addClass('advice').prepend('<i class="icon-advice"></i>');
            }
            return this.$el;
        }
    }));

})(window.mw, window.jQuery, kWidget);
