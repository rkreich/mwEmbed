(function (mw, $, playerData) {
    "use strict";

    mw.StaticHelper = function (embedPlayer, callback) {
        this.init(embedPlayer, callback);
    };

    mw.StaticHelper.prototype = {
        bindPostfix: '.staticHelper',

        init: function (embedPlayer, callback) {
            var playlistItem = [];
            playlistItem.push('<HBox id="item">');
            playlistItem.push('     <VBox id="thumb">');
            playlistItem.push('         <Image width="100" url="{this.thumbnailUrl}" source="{this.thumbnailUrl}"/>');
            playlistItem.push('     </VBox>');
            playlistItem.push('     <VBox id="text">');
            playlistItem.push('         <Label text="{this.name}" styleName="itemRendererLabel" label="{this.name}" prefix="" font="Arial"/>');
            playlistItem.push('     </VBox>');
            playlistItem.push('</HBox>');
            mw.setConfig('KalturaSupport.PlaylistDefaultItemRenderer', playlistItem.join());

            $(embedPlayer).bind('widgetLoaded' + this.bindPostfix, function () {
                var $videoListWrapper = $('.video-list-wrapper');
                var $videoList = $('.media-rss-video-list');

                // removes the extra 4 pixels added in mw.Playlist::updatePlaylistLayout
                $videoListWrapper.css('left', parseInt($videoList.css('left')) - 4);

                // removes the 2 pixels on the right side
                $videoListWrapper.css('right', 0);

                // add the extra 10 pixels that were remove by the playlist render, see mw.Playlist::getListHeight
                $videoList.height($videoList.height() + 10);
            });

            callback();
        }
    };
})(window.mw, window.jQuery, window.kalturaIframePackageData);