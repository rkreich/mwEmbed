(function (mw, $) {
    "use strict";

    // remove the default kaltura control bar container
    mw.PluginManager.registerdPlugins.controlBarContainer = null;

    var locked = false,
        playerHoverDisabled = true,
        $sourceSelector;

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
            this.bind('showInlineDownloadLink', function () {
                _this.hide();
            });
            this.bind('layoutBuildDone ended', function () {
                _this.show();
            });

            // Show / Hide controlbar on hover
            this.bind('showPlayerControls', function (e, data) {
                _this.show();
            });
            this.bind('hidePlayerControls', function () {
                if (!locked)
                    _this.hide();
            });
            this.bind( 'onComponentsHoverDisabled', function(){
                playerHoverDisabled = true;
            });
            this.bind( 'onComponentsHoverEnabled', function(){
                playerHoverDisabled = false;
            });

            // Integration with source selector to keep control bar active when menu is open
            this.bind('onFocusOutOfIframe', function () {
                locked = false;
                if (playerHoverDisabled)
                    return;
                _this.hide();
            });
            this.bind('toggleSourceSelector', function() {
                locked = (_this.getSourceSelector().is(':visible'));
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