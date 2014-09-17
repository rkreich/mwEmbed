(function (mw, $, playerData) {
    "use strict";

    // override the embed player function and then proxy it
    var embedPlayerFunc = $.fn.embedPlayer;
    $.fn.embedPlayer = function() {
        var uri = new mw.Uri(window.location.href);
        playerData.widgetId = uri.query.wid;
        playerData.entryId = uri.query.entry_id;
        playerData.kalturaProxy = uri.query.proxy;
        this.attr('kentryid', playerData.entryId);

        embedPlayerFunc.apply(this, arguments);
    };

    mw.addKalturaPlugin(['mw.StaticHelper'], 'staticHelper', function(embedPlayer, callback){
        new mw.StaticHelper(embedPlayer, callback);
    });
})(window.mediaWiki, window.jQuery, window.kalturaIframePackageData);