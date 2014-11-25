(function (mw, $, kWidget) {
    "use strict";

    mw.PluginManager.add('sskBeratungButton', mw.KBaseComponent.extend({

        adviceLink: null,

        defaultConfig: {
            parent: 'sideBarContainer',
            insertMode: 'firstChild',
            adviceMetadataField: null,
            adviceTarget: '_blank'
        },

        setup: function () {
            this.addBindings();
        },

        addBindings: function () {
            this.bind('sskEndScreenMetadataUpdate', $.proxy(this.onSskEndScreenMetadataUpdate, this));
        },

        onSskEndScreenMetadataUpdate: function(event, xmlDoc) {
            var $xml = $(xmlDoc);
            this.adviceLink = $xml.find(this.getConfig('adviceMetadataField')).text();
            if (this.$el)
                this.setAdviceLink();
        },

        setAdviceLink: function () {
            if (this.adviceLink) {
                this.$el
                    .attr('href', this.adviceLink)
                    .attr('target', this.getConfig('adviceTarget'))
                    .css('display', 'block');
            }
            else {
                this.$el.hide();
            }
        },

        getComponent: function () {
            if (!this.$el) {
                // buttons onclick is being set from sskEndScreen plugin
                this.$el = $('<a class="button">Beratung</a>').addClass('advice').prepend('<i class="icon-advice"></i>');
                this.setAdviceLink();
            }
            return this.$el;
        }
    }));

})(window.mw, window.jQuery, kWidget);
