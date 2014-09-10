(function (mw, $) {
    "use strict";

    mw.PluginManager.add('sskEndScreen', mw.KBaseScreen.extend({

        defaultConfig: {
            parent: "topBarContainer",
            order: 4,
            templatePath: '../SSK/resources/sskEndScreen.tmpl.html'
        },

        setup: function () {
            var _this = this;
            this.bind('onEndedDone', function () {
                _this.showScreen();
            });
        },

        showScreen: function () {
            this._super(); // this is an override of showScreen in mw.KBaseScreen.js - call super
        }
    }));

})(window.mw, window.jQuery);