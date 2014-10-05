(function (mw, $) {
    "use strict";

    var locked = false,
        playerHoverDisabled = true,
        $sourceSelector,
        hideControls = false;

    mw.PluginManager.add('sskControlsManager', mw.KBasePlugin.extend({

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
            this.bind('showInlineDownloadLink', function () {
                _this.embedPlayer.triggerHelper('sskHideControls');
            });
            this.bind('layoutBuildDone ended', function () {
                hideControls = true;
                _this.embedPlayer.triggerHelper('sskHideControls');
            });
            this.bind('onEndedDone', function() {
                hideControls = true;
                _this.embedPlayer.triggerHelper('sskHideControls');
            });
            this.bind('onPlayInterfaceUpdate', function() {
                hideControls = false;
                _this.embedPlayer.triggerHelper('sskShowControls');
            });
            this.bind('showPlayerControls', function (e, data) {
                if (hideControls)
                    return;
                _this.embedPlayer.triggerHelper('sskShowControls');
            });
            this.bind('hidePlayerControls', function () {
                if (!locked)
                    _this.embedPlayer.triggerHelper('sskHideControls');
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
                //if (playerHoverDisabled)
                //    return;
                _this.embedPlayer.triggerHelper('sskHideControls');
            });
            this.bind('toggleSourceSelector', function() {
                locked = (_this.getSourceSelector().is(':visible'));
            });
        }
    }));

})(window.mw, window.jQuery);