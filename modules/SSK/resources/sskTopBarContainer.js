(function (mw, $) {
    "use strict";

    // remove the default kaltura control bar container
    mw.PluginManager.registerdPlugins.topBarContainer = null;
    mw.PluginManager.add('topBarContainer', mw.KBasePlugin.extend({

        defaultConfig: {},

        setup: function () {
            this.addBindings();
        },
        addBindings: function () {
            var _this = this;
            // Register our container
            this.bind('addLayoutContainer', function () {
                _this.getPlayer().getVideoHolder().before(_this.getComponent());
                _this.show();
            });

            // Hide
            this.bind('onplay', function() {
                _this.hide();
            });
        },
        show: function () {
            this.getComponent().addClass('open');
            // Trigger the screen overlay with layout info:
            this.getPlayer().triggerHelper('onShowToplBar', {
                'top': this.getComponent().height() + 15
            });
        },
        hide: function () {
            this.getComponent().removeClass('open');
            // Allow interface items to update:
            this.getPlayer().triggerHelper('onHideTopBar', {'top': 15});
        },
        getComponent: function () {
            if (!this.$el) {
                // Add control bar
                this.$el = $('<div />')
                    .addClass('topBarContainer')
                    .addClass('hover');
            }
            return this.$el;
        }
    }));

})(window.mw, window.jQuery);