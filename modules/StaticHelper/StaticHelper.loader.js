(function (mw, $, playerData) {
    "use strict";

    // override the embed player function and then proxy it
    var embedPlayerFunc = $.fn.embedPlayer;
    $.fn.embedPlayer = function () {
        var uri = new mw.Uri(window.location.href);

        if (uri.query.wid)
            playerData.widgetId = uri.query.wid;

        if (uri.query.entry_id)
            playerData.entryId = uri.query.entry_id;

        if (uri.query.proxy)
            playerData.proxy = uri.query.proxy;

        if (uri.query.playlist_id) {
            playerData.playlistId = uri.query.playlist_id;
            var playlistPlugin = {};
            if (playerData.playerConfig.plugins.playlistAPI)
                playlistPlugin = playerData.playerConfig.plugins.playlistAPI;

            playlistPlugin.autoInsert = false;
            playlistPlugin.autoContinue = true;
            playlistPlugin.kpl0Id = playerData.playlistId;
            playerData.playerConfig.plugins.playlistAPI = playlistPlugin;
        }

        playerData.kalturaProxy = uri.query.proxy;
        this.attr('kentryid', playerData.entryId);
        embedPlayerFunc.apply(this, arguments);
    };

    mw.addKalturaPlugin(['mw.StaticHelper'], 'staticHelper', function (embedPlayer, callback) {
        new mw.StaticHelper(embedPlayer, callback);
    });

    $(mw).bind('KalturaSupportNewPlayer', function (event, embedPlayer) {
        // if proxy was provided, switch the doApiRequest function on the prototype of
        // mw.KApi to use our local function that supports proxy
        if (playerData.proxy)
            mw.KApi.prototype.doApiRequest = doApiRequest;

        embedPlayer.bindHelper('startPlayerBuildOut', function (event, callback) {
            if (playerData.playlistId && !playerData.playlistResult) {

                var playlistId = playerData.playlistId;
                /*var playlistObject = {};
                 playlistObject[playlistId] = {
                 id: playlistId
                 };
                 embedPlayer.kalturaPlaylistData = playlistObject;
                 callback();*/

                var kapi = mw.kApiGetPartnerClient(embedPlayer.kwidgetid);

                var requestObject = {
                    service: 'playlist',
                    action: 'execute',
                    id: playlistId
                };
                kapi.doRequest(requestObject, function (result) {
                    var playlistObject = {};
                    var data = result[0];
                    playlistObject[playlistId] = {
                        id: playlistId,
                        items: data
                    };
                    embedPlayer.kalturaPlaylistData = playlistObject;

                    // we must set the first playlist entry id, otherwise the player will not be loaded correctly
                    embedPlayer.kentryid = data.length ? data[0].id : -1;
                    callback();
                });

            }
            else {
                callback();
            }
        });
    });

    function doApiRequest(param, callback){
        var _this = this;
        // Remove service tag ( hard coded into the api url )
        var serviceType = param['service'];
        delete param['service'];

        // Add the signature ( if not a session init )
        if( serviceType != 'session' ){
            param['kalsig'] = _this.getSignature( param );
        }

        param.format = 1;

        // Build the request url with sorted params:
        var requestURL = _this.getApiUrl( serviceType ) + '&' + $.param( param );

        $.ajax({
            url: playerData.proxy,
            data: {
                p: requestURL
            },
            success: function (data) {
                if(callback) {
                    callback(data);
                    callback = null;
                }
            }
        });
        mw.log("kAPI:: doApiRequest: " + requestURL);
    }
})(window.mediaWiki, window.jQuery, window.kalturaIframePackageData);