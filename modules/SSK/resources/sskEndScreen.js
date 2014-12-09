(function (mw, $, playerData) {
    "use strict";

    mw.PluginManager.add('sskEndScreen', mw.KBaseScreen.extend({
        infoLink: null,
        adviceLink: null,
        defaultConfig: {
            order: 4,
            templatePath: '../SSK/resources/sskEndScreen.tmpl.html',
            itemsLimit: 10,
            adviceMetadataField: null,
            infoMetadataField: null,
            adviceTarget: '_blank',
            infoTarget: '_blank',
            playlistId: '_KDP_CTXPL'
        },

        setup: function () {
            if (this.getPlayer().playlist) // don't enable end screen on playlists
                return;
            var _this = this;
            this.templateData = {};
            this.templateData.items = [];
            this.bind('onEndedDone', function () {
                _this.showScreen();
                _this.bindButtons();
            });
            this.bind('updateLayout', $.proxy(this.onUpdateLayout, this));
            this.loadData();
        },

        onUpdateLayout: function() {
            if (!this.$screen)
                return;

            var wrapperHeight = this.$screen.find('.actions').height() + this.$screen.find('.carousel').height();
            this.$screen.find('.wrapper').height(wrapperHeight);
        },

        loadData: function() {
            this.loadRelatedPlaylist();
            this.loadMetadata();
        },

        reloadData: function() {
            this.infoLink = null;
            this.adviceLink = null;
            this.templateData.items = [];
            this.loadData();
        },

        loadRelatedPlaylist: function() {
            var _this = this;

            $.ajax({
                url: playerData.proxy,
                data: {
                    p: playerData.relatedService + '?id=' + this.getPlayer().kentryid
                },
                dataType: 'json',
                success: $.proxy(this.onPlaylistResponse, this)
            });
        },

        onPlaylistResponse: function(data) {
            if (!data || (data.code && data.message )) {
                this.log('Error getting playlist items: ' + (data ? data.message : ''));
                return;
            }
            this.templateData.items = data;
        },

        loadMetadata: function() {
            var requestObject = {
                'service': 'metadata_metadata',
                'action': 'list',
                'filter:objectType': 'KalturaMetadataFilter',
                'filter:metadataObjectTypeEqual': 1,
                'filter:objectIdEqual': this.getPlayer().kentryid
            };
            this.getKalturaClient().doRequest(requestObject, $.proxy(this.onLoadMetadataResponse, this));
        },

        onLoadMetadataResponse: function(data) {
            if (!data || (data.code && data.message )) {
                this.log('Error getting metadata: ' + data.message);
                return;
            }
            if (data.objects && data.objects.length > 0) {
                var xmlDoc = $.parseXML(data.objects[0].xml);
                var $xml = $(xmlDoc);
                this.infoLink = $xml.find(this.getConfig('infoMetadataField')).first().text();
                this.adviceLink = $xml.find(this.getConfig('adviceMetadataField')).text();

                this.embedPlayer.triggerHelper('sskEndScreenMetadataUpdate', xmlDoc);
            }
        },

        showScreen: function () {
            var that = this;
            this._super(); // this is an override of showScreen in mw.KBaseScreen.js - call super

            this.$screen.find('a.info, a.advice').parent().hide(); // hide by default
            if (this.templateData.items.length) {
                var carousel = this.carousel();
                this.$screen.off().on('click.arrows', '.arrow', function () {
                    carousel(this.className.indexOf('next') > -1 ? 'next' : 'prev');
                });
            }

            if (this.infoLink)
                this.$screen.find('a.info')
                    .attr('href', this.infoLink)
                    .attr('target', this.getConfig('infoTarget'))
                    .parent().show();

            if (this.adviceLink)
                this.$screen.find('a.advice')
                    .attr('href', this.adviceLink)
                    .attr('target', this.getConfig('adviceTarget'))
                    .parent().show();

            this.$screen.find('a.share').click(function() {
                $('.sideBarContainer .share').click();
            });
            this.onUpdateLayout();
        },

        bindButtons: function() {
            var that = this;
            this.$screen.find('a.repeat').click(function() {
                that.getPlayer().replay();
            });
            this.$screen.find('.carousel > a').click(function() {
                var entryId = $(this).data('entry-id');
                that.getPlayer().sendNotification('changeMedia', {'entryId': entryId});
                that.bind('onChangeMediaDone', function(){
                    that.getPlayer().play();
                    that.unbind('onChangeMediaDone');
                    that.reloadData.call(that);
                });
            });
        },

        carousel: (function(){
            var itemToMove,
                img, locked, children,
                carousel,
                width;

            function slide(direction){
                if( locked )
                    return;

                locked = true;

                // do nothing if there are no items
                if( carousel.children.length < 2 )
                    return false;

                itemToMove = children[0];
                if( direction == 'next' )
                    itemToMove.style.marginLeft = -width + 'px';
                else{
                    var itemToMove = children[children.length-1];
                    itemToMove.style.marginLeft = -width + 'px';
                    carousel.insertBefore(itemToMove, children[0]);
                    setTimeout(function(){
                        itemToMove.removeAttribute('style');
                    },50);
                    locked = false;
                }

                // move the child to the end of the items' list
                if( direction == 'next' )
                    setTimeout(function(){
                        itemToMove.removeAttribute('style');
                        carousel.appendChild(itemToMove);
                        locked = false;
                    }, 220);
            }

            function init() {
                carousel = $('.sskEndScreen .carousel')[0];
                children = carousel.children;
                width = children[0].clientWidth;

                for( var i=0; i < children.length; i++ ){
                    lazyload( children[i].getElementsByTagName('img')[0] );
                }
            }

            function lazyload(img){
                // lazy load image
                var lazy = img.getAttribute('data-src');

                if( lazy ){
                    img.src = lazy;
                    img.removeAttribute('data-src');
                    lazy = null;
                }
            }

            init();

            return slide;
        })

    }));

})(window.mw, window.jQuery, window.kalturaIframePackageData);