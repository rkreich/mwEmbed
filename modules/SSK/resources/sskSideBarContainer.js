(function (mw, $) {
    "use strict";

    // remove the default kaltura side bar container
    mw.PluginManager.registerdPlugins.sideBarContainer = null;

    mw.PluginManager.add('sideBarContainer', mw.KBasePlugin.extend({

        defaultConfig: {
            'hover': true,
            'position': 'left'
        },

        keepOnScreen: false,

        setup: function () {
            // Bind player
            this.addBindings();
        },
        addBindings: function () {
            var _this = this;
            // Register our container
            this.bind('addLayoutContainer', function () {
                _this.getPlayer().getVideoHolder().before(_this.getComponent());
            });
            this.bind('layoutBuildDone ended', function () {
                _this.show();
            });
            this.bind('showPlayerControls', function (e, data) {
                _this.show();
            });
            this.bind('hidePlayerControls', function () {
                _this.hide();
            });
        },
        show: function () {
            this.getComponent().addClass('openBtn');
        },
        hide: function () {
            this.getComponent().removeClass('openBtn');
        },
        getComponent: function () {
            if (!this.$el) {
                var _this = this;
                this.$el = $('<div />')
                    .addClass('sideBarContainer ' + _this.getConfig('position'))
                    .addClass('hover');
            }
            return this.$el;
        },
        destroy: function () {
            this._super();
            this.getComponent().remove();
        }
    }));

})(window.mw, window.jQuery);