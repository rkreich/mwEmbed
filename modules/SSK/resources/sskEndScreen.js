(function (mw, $) {
    "use strict";

    mw.PluginManager.add('sskEndScreen', mw.KBaseScreen.extend({

        defaultConfig: {
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
            var that = this;
            this._super(); // this is an override of showScreen in mw.KBaseScreen.js - call super

            this.$screen.off().on('click.arrows', '.arrow', function(){
                that.carousel( this.className.indexOf('next') > -1 ? 'next' : 'prev' );
            });
        },

        carousel : (function(){
            var itemToMove,
                img, locked, children,
                carousel,
                width;

            return function(direction){
                if( locked )
                    return;

                locked = true;

                if( !carousel ){
                    carousel = $('.sskEndScreen .carousel')[0];
                    children = carousel.children;
                    width = children[0].clientWidth;

                    for( var i=0; i < children.length; i++ ){
                        lazyload( children[i].getElementsByTagName('img')[0] );
                    }
                }

                if( carousel.children.length < 2 )
                    return false;


                itemToMove = children[0];
                if( direction == 'next' ){
                    itemToMove.style.marginLeft = -width + 'px';
                }
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

            function lazyload(img){
                // lazy load image
                var lazy = img.getAttribute('data-src');

                if( lazy ){
                    img.src = lazy;
                    img.removeAttribute('data-src');
                    lazy = null;
                }
            }
        })(),

    }));

})(window.mw, window.jQuery);