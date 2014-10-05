(function (mw, $) {
    "use strict";

    // remove the default kaltura control bar container
    mw.PluginManager.registerdPlugins.controlBarContainer = null;

    var locked = false,
        playerHoverDisabled = true,
        $sourceSelector,
        hideControls = false;

    mw.PluginManager.add('controlBarContainer', mw.KBasePlugin.extend({

        defaultConfig: {},

        setup: function () {
            // Exit if we're using native controls
            if (this.getPlayer().useNativePlayerControls()) {
                this.getPlayer().enableNativeControls();
                return;
            }
            // Bind player
            this.addBindings();
        },
        addBindings: function () {
            var _this = this;
            // Register our container
            this.bind('addLayoutContainer', function () {
                _this.getPlayer().getInterface().append(_this.getComponent());
            });

            // Hide
            this.bind('sskHideControls', function() {
                _this.hide();
            });

            // Show
            this.bind('sskShowControls', function() {
                _this.show();
            });
        },
        show: function () {
            this.getComponent().addClass('open');
            // Trigger the screen overlay with layout info:
            this.getPlayer().triggerHelper('onShowControlBar', {
                'bottom': this.getComponent().height() + 15
            });
            var $interface = this.embedPlayer.getInterface();
            $interface.removeClass('player-out');
        },
        hide: function () {
            this.getPlayer().isControlsVisible = false;
            this.getComponent().removeClass('open');
            var $interface = this.embedPlayer.getInterface();
            $interface.addClass('player-out');
            // Allow interface items to update:
            this.getPlayer().triggerHelper('onHideControlBar', {'bottom': 15});
        },
        getComponent: function () {
            if (!this.$el) {
                var $controlsContainer = $('<div />').addClass('controlsContainer');
                // Add control bar
                this.$el = $('<div />')
                    .addClass('controlBarContainer')
                    .append($controlsContainer);

                this.$el.addClass('hover');
            }
            return this.$el;
        },
        getSourceSelector: function () {
            if (!$sourceSelector)
                $sourceSelector = $('.sourceSelector');
            return $sourceSelector;
        }
    }));

})(window.mw, window.jQuery);