(function (mw, $, playerData) {
    "use strict";

    mw.PluginManager.add('staticHelper', mw.KBasePlugin.extend({
        setup: function(){
            // copy the ks to the flashvars, this is required for the flash player
            if (!playerData.playerConfig.vars.ks) {
                var kapi = mw.kApiGetPartnerClient(this.embedPlayer.kwidgetid);
                this.embedPlayer.playerConfig.vars.ks = kapi.ks;
            }

            $(this.embedPlayer).bind('widgetLoaded' + this.bindPostFix, function () {
                var $videoListWrapper = $('.video-list-wrapper');
                var $videoList = $('.media-rss-video-list');

                // removes the extra 4 pixels added in mw.Playlist::updatePlaylistLayout
                $videoListWrapper.css('left', parseInt($videoList.css('left')) - 4);

                // removes the 2 pixels on the right side
                $videoListWrapper.css('right', 0);

                // add the extra 10 pixels that were remove by the playlist render, see mw.Playlist::getListHeight
                $videoList.height($videoList.height() + 10);
            });
        }
    }));
})(window.mw, window.jQuery, window.kalturaIframePackageData);