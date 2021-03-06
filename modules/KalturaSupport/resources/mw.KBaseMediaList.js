( function( mw, $ ) {"use strict";

	/**
	 * Base screen component that allow to show overlay on top of the player
	 **/

	mw.KBaseMediaList = mw.KBaseComponent.extend({

		mediaList: [],
		isDisabled: false,
		$mediaListContainer: null,
		selectedMediaItemIndex: 0,
		startFrom: 0,

		getBaseConfig: function(){
			var parentConfig = this._super();
			return $.extend({}, parentConfig, {
				'oneSecRotatorSlidesLimit': 61,
				'twoSecRotatorSlidesLimit': 250,
				'maxRotatorSlides': 125,
				'layout': 'vertical',
				'mediaItemWidth': null,
				'mediaItemHeight': null,
				'mediaItemRatio': (16 / 9),
				'horizontalHeaderHeight': 0,
				'onPage': false,
				'includeInLayout': true,
				'clipListTargetId': null,
				'containerPosition':  'right',
				'parent': null
			});
		},

		setDefaults: function(){
			this.baseThumbSettings = {
				'partner_id': this.getPlayer().kpartnerid,
				'uiconf_id': this.getPlayer().kuiconfid,
				'entry_id': this.getPlayer().kentryid,
				'width': this.getConfig( "thumbWidth" )
			};
			this._super( );
		},

		_addBindings: function () {
			var _this = this;
			this._super();

			this.bind('updateLayout', function(){
				if (_this.getConfig( 'parent')){
					setTimeout(function(){
						_this.renderMediaList();
						_this.setSelectedMedia(_this.selectedMediaItemIndex);
					}, 0);
				}
			});
			// handle fullscreen entering resize
			$( this.embedPlayer ).bind('onOpenFullScreen', function() {
				if ( !_this.getConfig( 'parent') ){
					$(".medialistContainer").hide();
					$(".videoHolder").width("100%");
				}
			});

			// handle fullscreen exit resize
			$( this.embedPlayer ).bind('onCloseFullScreen', function() {
				if ( !_this.getConfig( 'parent') ){
					$(".medialistContainer").show();
					$(".videoHolder").width(_this.videoWidth+"px");
				}
			});

		},

		getComponent: function(){
			if( ! this.$el ){
				this.$el = $( '<div />' )
					.addClass( this.pluginName + " medialistContainer unselectable k-" + this.getLayout() );
				this.$el.append($( '<div />' ).addClass("k-medialist-header k-" + this.getLayout() ));
				this.$el.append($( '<div />' ).addClass("k-chapters-container k-" + this.getLayout() ));
				if (!this.getConfig('parent')){
					if ( this.getConfig( 'containerPosition' ) === 'top' && !this.getConfig( 'onPage' ) ) {
						this.getMedialistContainer().prepend(this.$el);
					} else {
						this.getMedialistContainer().append(this.$el);
					}
				}
			}
			return this.$el;
		},
		getMedialistComponent: function(){
			return this.getComponent().find(".k-chapters-container");
		},
		getMedialistHeaderComponent: function(){
			return this.getComponent().find(".k-medialist-header");
		},
		// set the play list container according to the selected position
		getMedialistContainer: function(){
			if (!this.$mediaListContainer) {
				if ( this.getConfig( 'onPage' ) ) {
					var iframeID = this.embedPlayer.id + '_ifp';
					try {
						//Try to find and apply css on parent frame
						var cssLink = this.getConfig('cssFileName');
						if (cssLink) {
							cssLink = cssLink.toLowerCase().indexOf("http") === 0 ? cssLink : kWidget.getPath() + cssLink; // support external CSS links
							$( 'head', window.parent.document ).append( '<link type="text/css" rel="stylesheet" href="' + cssLink + '"/>' );
						} else {
							mw.log( "Error: "+ this.pluginName +" could not find CSS link" );
						}

						$( window['parent'].document ).find( '.onpagePlaylistInterface' ).remove(); // remove any previously created playlists
						var iframeParent = window['parent'].document.getElementById( this.embedPlayer.id );
						if ( this.getConfig( 'clipListTargetId' ) && $( iframeParent ).parent().find( "#" + this.getConfig( 'clipListTargetId' ) ).length > 0 ) {
							$( iframeParent ).parent().find( "#" + this.getConfig( 'clipListTargetId' ) ).html( "<div class='onpagePlaylistInterface'></div>" );
							this.$mediaListContainer = $( iframeParent ).parent().find( ".onpagePlaylistInterface" );
						} else {
							$( iframeParent ).after( "<div class='onpagePlaylistInterface'></div>" );
							this.$mediaListContainer = $( iframeParent ).parent().find( ".onpagePlaylistInterface" );
							$( this.$mediaListContainer ).width( $( iframeParent ).width());
							var containerHeight = this.getLayout() === "vertical" ? this.getConfig( "mediaItemHeight" ) * 3 : this.getConfig( "mediaItemHeight" ) + this.getConfig('horizontalHeaderHeight');
							$( this.$mediaListContainer ).height( containerHeight );
						}
						// support hidden playlists
						if ( this.getConfig( 'includeInLayout' ) === false ) {
							this.$mediaListContainer.hide();
						}
						this.$mediaListContainer.addClass( "k-" + this.getLayout() );
					} catch ( e ) {
						mw.log( "Error: "+ this.pluginName +" could not access parent iframe" );
					}
				} else {
					this.$mediaListContainer = $( ".playlistInterface" );
					// resize the video to make place for the playlist according to its position (left, top, right, bottom)
					if ( this.getConfig( 'containerPosition' ) == 'right' || this.getConfig( 'containerPosition' ) == 'left' ) {
						$( ".videoHolder, .mwPlayerContainer" ).css( "width", this.$mediaListContainer.width() - this.getConfig( "mediaItemWidth" ) + "px" );
						this.videoWidth = (this.$mediaListContainer.width() - this.getConfig( "mediaItemWidth" ));
					}
					if ( this.getConfig( 'containerPosition' ) == 'left' ) {
						$( ".mwPlayerContainer" ).css( "float", "right" );
					}

					if ( this.getConfig( 'containerPosition' ) == 'top' || this.getConfig( 'containerPosition' ) == 'bottom' ) {
						var playlistHeight = this.getLayout() === "vertical" ? this.getConfig( "mediaItemHeight" ) * 2 : this.getConfig( "mediaItemHeight" ) + this.getConfig('horizontalHeaderHeight');
						$(".medialistContainer").height(playlistHeight);
						$( ".mwPlayerContainer" ).css( "height", this.$mediaListContainer.height() - playlistHeight + "px" );
						$( ".videoHolder" ).css( "height", this.$mediaListContainer.height() - playlistHeight - $( ".controlBarContainer" ).height() + "px" );
					}
				}
			}
			return this.$mediaListContainer;
		},
		// set the size of the playlist container and the video
		setMedialistContainerSize: function(){
			if (!this.getConfig('onPage') && this.getConfig( 'containerPosition' )) {
				// resize the video to make place for the playlist according to its position (left, top, right, bottom)
				if ( this.getConfig( 'containerPosition' ) == 'right' || this.getConfig( 'containerPosition' ) == 'left' ) {
					this.getComponent().width( this.getConfig( "mediaItemWidth" ) );
					this.getComponent().height( "100%" );
					this.getComponent().css( "position", "absolute" );
				}
				if ( this.getConfig( 'containerPosition' ) == 'right' ) {
					this.getComponent().css( "right", "0px" );
					$( ".mwPlayerContainer" ).css( "float", "left" );
				}
				if ( this.getConfig( 'containerPosition' ) == 'top' || this.getConfig( 'containerPosition' ) == 'bottom' ) {
					this.getComponent().height( this.getConfig( "mediaItemHeight" ) * 2 );
					this.getComponent().css( "display", "block" );
				}
			}
			if (this.getLayout() === "horizontal" ){
				if (this.getConfig("mediaItemHeight") === null){
					this.setConfig("mediaItemHeight", this.getComponent().height());
				}
				this.getComponent().height(this.getConfig("mediaItemHeight") + this.getConfig('horizontalHeaderHeight'));
			}
		},

		getMediaListDomElements: function(){
			return this.getMedialistComponent().find(".chapterBox");
		},

		destroy: function(){
			this.unbind();
			this.getComponent.empty();
		},

		//General
		getLayout: function(){
			return  this.getConfig( 'layout' ) || 'horizontal';
		},
		getTemplateData: function(){
			return this.mediaList;
		},
		getMetaData: function(){
			return {
				includeThumbnail: this.getConfig('includeThumbnail'),
				includeItemStartTime: this.getConfig('includeItemStartTime'),
				includeItemNumberPattern: this.getConfig('includeItemNumberPattern'),
				includeMediaItemDuration:this.getConfig('includeMediaItemDuration'),
				titleLimit: this.getConfig('titleLimit'),
				descLimit: this.getConfig('descriptionLimit'),
				layout: this.getLayout()
			}
		},
		onDisable: function(){
			if (this.embedPlayer.getError() !== null){
				return;
			}
			this.isDisabled = true;
			var mediaBoxes = this.getMediaListDomElements();
			mediaBoxes.addClass("disabled");
			mediaBoxes.find("*").addClass("disabled");
		},
		onEnable: function(){
			this.isDisabled = false;
			var mediaBoxes = this.getMediaListDomElements();
			mediaBoxes.removeClass("disabled");
			mediaBoxes.find("*").removeClass("disabled");
		},

		//Media Item
		renderMediaList: function(){
			//Generate new list template data
			var medialist = this.getTemplateHTML( {meta: this.getMetaData(), mediaList: this.getTemplateData()});
			//Only render if medialist item are present
			if (this.getTemplateData().length > 0) {
				//Clear previous list
				this.getMedialistComponent().empty();
				//Add media items to DOM
				this.getMedialistComponent().append( medialist );
				//Adjust container size
				this.setMedialistContainerSize();
				this.setMedialistComponentHeight();
				//Adjust the mediaboxes size
				this.setMediaBoxesDimensions();
				//Attach media items handlers
				this.attachMediaListHandlers();
				//Add scroll if applicable
				this.shouldAddScroll( );
				$( this.embedPlayer ).trigger( "mediaListLayoutReady" );
			}
		},
		setMedialistComponentHeight: function(){
			if (this.getLayout() === "vertical" && (this.getConfig("containerPosition") === "top" || this.getConfig("containerPosition") === "bottom")){
				this.getMedialistComponent().height(this.getComponent().height());
			}else{
				this.getMedialistComponent().height(this.getComponent().height()-this.getMedialistHeaderComponent().height());
			}

		},
		setMediaBoxesDimensions: function(){
			var height = this.getMedialistComponent().height();
			var width = this.getMedialistComponent().width();
			var layout = this.getLayout();
			var mediaBoxes = this.getMediaListDomElements();
			if (layout == "vertical"){
				var newHeight = this.getConfig( "mediaItemHeight" ) || width * (1 / this.getConfig("mediaItemRatio"));
				mediaBoxes.width(width).height(newHeight);
			} else {
				var newWidth = this.getConfig( "mediaItemWidth" ) || height * this.getConfig("mediaItemRatio");
				mediaBoxes.width(newWidth).height(height);
			}
		},
		getScrollbarSize: function(w) {
			w = w || window;
			var d = w.document, b = d.body, r = [ 0, 0 ], t;
			if (b) {
				t = d.createElement('div');
				t.style.cssText = 'position:absolute;overflow:scroll;top:-100px;left:-100px;width:100px;height:100px;';
				b.insertBefore(t, b.firstChild);
				r = { height: t.offsetHeight - t.clientHeight, width: t.offsetWidth - t.clientWidth };
				b.removeChild(t);
			}
			return r;
		},
		isScrollbarVisible: function(elem) {
			if (typeof $(elem).innerWidth() == 'number') {
				return {
					height: $(elem).get(0) ? $(elem).get(0).scrollHeight > $(elem).innerHeight() : false,
					width: $(elem).get(0) ? $(elem).get(0).scrollWidth > $(elem).innerWidth() : false
				};
			} else {
				return {
					width: $(elem).css('scrollWidth') > $(elem).css('clientWidth'),
					height: $(elem).css('scrollHeight') > $(elem).css('clientHeight')
				};
			}
		},
		getItemNumber: function(index){
			var itemVal = ( index + 1 ).toString();
			if( typeof this.getConfig('includeItemNumberPattern' ) == 'string' ){
				itemVal =  this.getConfig('includeItemNumberPattern' ).replace( '$1', itemVal );
			}
			// replace spaces with '&nbsp;'
			itemVal = itemVal.replace(/\s/g, '&nbsp;' );
			return itemVal;
		},
		getMediaItemById: function(id){
			var mediaItem = null;
			mediaItem = $.grep(this.mediaList, function(mediaItem){
				return (mediaItem.id == id);
			});
			return mediaItem;
		},
		getThumbUrl: function(item) {
			var time = item.thumbOffset || item.startTime;
			var thumbUrl = kWidget.getKalturaThumbUrl(
				$.extend( {}, this.baseThumbSettings, {
					'vid_sec': parseInt( time / 1000 )
				} )
			);
			return thumbUrl;
		},
		getThumbWidth: function(){
			return parseInt( this.getConfig( 'thumbnailWidth' ) ) ;
		},
		getThumbHeight: function(){
			return this.getThumbWidth() * 9 / 16;
		},
		getThumRotatorUrl: function(){
			var _this = this;
			var imageSlicesUrl = kWidget.getKalturaThumbUrl(
				$.extend( {}, this.baseThumbSettings, {
					'vid_slices': _this.getSliceCount()
				})
			);
			// preload the image slices:
			(new Image()).src = imageSlicesUrl;

			return imageSlicesUrl;
		},

		//UI Handlers
		shouldAddScroll: function(handler){
			if( this.checkAddScroll() ){
				this.addScroll();
			} else{
				var height = this.getMedialistComponent().height();
				var width = this.getMedialistComponent().width();
				var layout = this.getLayout();
				var mediaBoxes = this.getMediaListDomElements();
				if (layout == "vertical"){
					if (this.isScrollbarVisible(this.getComponent() ).height){
						width -= this.getScrollbarSize().width;
					}
					mediaBoxes.width(width);
				} else {
					if (this.isScrollbarVisible(this.getComponent() ).width){
						height -= this.getScrollbarSize().height;
					}
					mediaBoxes.height(height);
				}
				if (!this.getConfig('containerPosition')){
					var largestBoxHeight = 0;
					var mediaBoxes = this.getMediaListDomElements();
					mediaBoxes.each( function ( inx, box ) {
						var pad = parseInt( $( box ).css( 'padding-top' ) ) + parseInt( $( box ).css( 'padding-bottom' ) );
						if ( $( box ).height() + pad > largestBoxHeight ) {
							largestBoxHeight = $( box ).height() + pad;
						}
					} );
					mediaBoxes.css( 'height', largestBoxHeight );
					if ( this.getLayout() == 'vertical' ) {
						// give the box a height:
						this.getComponent().css( 'height',
								mediaBoxes.length * largestBoxHeight
						)
					}
				}
			}
		},
		attachMediaListHandlers: function(){
			var _this = this;
			var hoverInterval = null;
			var mediaBoxes = this.getMediaListDomElements();
			mediaBoxes
				.off('click' )
				.on('click', function(){
					if ( !_this.isDisabled ){
						// set active media item
						var index = $(this).data( 'chapterIndex' );
						// Check if the current chapter is already active, set skipPause flag accordingly.
						_this.skipPauseFlag = !$( this ).hasClass( 'active');
						// call mediaClicked with the media index (implemented in component level)
						_this.mediaClicked(index);
					}
				});
			if (this.getConfig('thumbnailRotator')) {
				mediaBoxes
					.off( 'mouseenter mouseleave', '.k-thumb' )
					.on( {
						mouseenter: function () {
							var index = $( this ).data( 'chapterIndex' );
							var item = _this.mediaList[index];
							// update base css:

							$( this ).css( {
								'width': item.thumbnail.width,
								'height': item.thumbnail.height,
								'background-image': 'url(\'' + item.thumbnail.rotatorUrl + '\')',
								'background-position': _this.getThumbSpriteOffset( item.thumbnail.width, ( item.startTime ) ),
								// fix aspect ratio on bad Kaltura API returns
								'background-size': ( item.thumbnail.width * _this.getSliceCount() ) + 'px 100%'
							} );

							var startTime = item.startTime;
							var endTime = item.endTime;
							// on hover sequence thumbs in range
							var stepInx = _this.getSliceIndexForTime( startTime );
							var imageDiv = $( this );
							var doStepIndex = function () {
								// update background-position' per current step index:
								imageDiv.css( 'background-position', -( stepInx * item.thumbnail.width ) + 'px 0px' );
								stepInx++;
								if ( stepInx >= _this.getSliceIndexForTime( endTime ) ) {
									stepInx = _this.getSliceIndexForTime( startTime );
								}
							};
							hoverInterval = setInterval( doStepIndex, 500 );
							doStepIndex();
						},
						mouseleave: function () {
							clearInterval( hoverInterval );
							// retore to orginal image:
							var index = $( this ).data( 'chapterIndex' );
							var item = _this.mediaList[index];
							$( this )
								.css( {
									'background-repeat': 'no-repeat',
									'background-position': 'center',
									'background-size': 'auto 100%'
								} )
								.css( {
									'background-image': 'url(\'' + item.thumbnail.url + '\')'
								} );
						}
					}, ".k-thumb" );
			}
		},
		mediaClicked: function(){
			// should be implemented by component;
		},
		setSelectedMedia: function(mediaIndex){
			var mediaBoxes = this.getMediaListDomElements();
			mediaBoxes.removeClass( 'active');
			this.selectedMediaItemIndex = mediaIndex;
			$( mediaBoxes[mediaIndex] ).addClass( 'active'); //li[data-chapter-index='" + activeIndex + "']
			if (!this.getConfig('overflow')) {
				var carousel = this.getMedialistComponent().find( '.k-carousel' );
				if (carousel[0]) {
					carousel[0].jCarouselLiteGo( mediaIndex );
				}
			}
		},
		getActiveItem: function(){
			return this.getComponent().find( "li[data-chapter-index='" + this.selectedMediaItemIndex + "']" );
		},
		updateActiveItemDuration: function(duration){
			this.getActiveItem().find('.k-duration #mediaItemDuration').text(
				kWidget.seconds2npt( duration )
			);
		},
		getThumbSpriteOffset: function( thumbWidth, time ){
			var sliceIndex = this.getSliceIndexForTime( time );
			return - ( sliceIndex * thumbWidth ) + 'px 0px';
		},
		getSliceCount: function(){
			var duration = this.getPlayer().getDuration();
			if( duration < this.getConfig('oneSecRotatorSlidesLimit') ){
				return Math.round( duration ); // every second
			}
			if( duration < this.getConfig('twoSecRotatorSlidesLimit') ){
				return Math.round( duration / 2 ); // every 2 seconds
			}
			// max slice count 125
			return this.getConfig('maxRotatorSlides');
		},
		getSliceIndexForTime: function( time ){
			var sliceCount = this.getSliceCount();
			var perc = time / this.getPlayer().getDuration();
			var sliceIndex = Math.ceil( sliceCount * perc );
			return sliceIndex;
		},
		addScroll: function(){
			this.addScrollUiComponents();
			this.initScroll();
		},
		initScroll: function(){
			var $cc = this.getMedialistComponent();
			this.mediaItemVisible = this.calculateVisibleScrollItems();
			var isVertical = ( this.getLayout() == 'vertical' );
			var speed = mw.isTouchDevice() ? 100: 200;

			// Add scrolling carousel to clip list ( once dom sizes are up-to-date )
			$cc.find('.k-carousel').jCarouselLite({
				btnNext: '.k-next',
				btnPrev: '.k-prev',
				visible: this.mediaItemVisible,
				mouseWheel: true,
				circular: false,
				vertical: isVertical,
				start: this.startFrom,
				scroll: 1,
				speed: speed
			});

			// give more height if needed
			if( this.getLayout() == 'vertical' ){
				$cc.find('.k-carousel').css('height', $cc.height() );
			} else {
				// fit to container:
				$cc.find('.k-carousel').css('width', $cc.width() );
			}
		},
		getMediaItemBoxWidth: function(){
			return this.getConfig('mediaItemWidth') || 320;
		},
		addScrollUiComponents: function(){
			var $cc = this.getMedialistComponent();
			$cc.find('ul').wrap(
				$( '<div>' ).addClass('k-carousel')
			);
			// Add scroll buttons
			$cc.find('.k-carousel').before(
				$( '<a />' )
					.addClass( "k-scroll k-prev" )
			);
			$cc.find('.k-carousel').after(
				$( '<a />' )
					.addClass( "k-scroll k-next" )
			);

			// Add media item hover to hide show play buttons:
			var inKBtn = false;
			var inContainer = false;
			var checkHideBtn = function(){
				setTimeout(function(){
					if( !inKBtn && !inContainer ){
						$cc.find('.k-prev,.k-next').animate({'opacity':0});
					}
				},0)
			}
			var showBtn = function(){
				$cc.find('.k-prev,.k-next').animate({'opacity':1});
			}
			// check for knext
			$cc.find('.k-prev,.k-next')
				.hover(function(){
					showBtn();
					inKBtn = true;
				},function(){
					inKBtn = false;
					checkHideBtn();
				})
			$cc.find('.k-carousel').hover( function(){
				showBtn();
				inContainer = true;
			}, function(){
				inContainer = false;
				checkHideBtn();
			})
			// hide the arrows to start with ( with an animation so users know they are there )
			$cc.find('.k-prev,.k-next').animate({'opacity':0});
		},
		calculateVisibleScrollItems: function(){
			var $cc = this.getMedialistComponent();

			var mediaItemVisible = 3;
			var dimensions = this.getLargestBoxDimensions();
			// Get rough estimates for number of media items visible.
			if( this.getLayout() == 'horizontal' ){
				// calculate number of visible media items
				mediaItemVisible = Math.floor( $cc.find( '.k-carousel' ).width() / dimensions.largestBoxWidth );
			} else {
				// calculate number of visible for vertical media items
				mediaItemVisible = Math.floor( $cc.height() / dimensions.largestBoxHeight );
			}
			// don't show more media items then we have available:
			if( mediaItemVisible >  this.mediaList.length ){
				mediaItemVisible = this.mediaList.length
			}

			return mediaItemVisible;
		},
		getLargestBoxDimensions: function(){
			// Get rough estimates for number of media items visible.
			var largestBoxWidth = 0;
			var largestBoxHeight = 0;
			this.getMediaListDomElements().each( function(inx, box){
				var $box = $(box);
				if( $box.width() > largestBoxWidth ){
					largestBoxWidth = $box.width()
				}
				if( $box.height() > largestBoxHeight ){
					largestBoxHeight = $box.height() + (
						(parseInt( $box.css('padding-top') ) || 0) + (parseInt( $box.css( 'padding-bottom') ) || 0) +
							(parseInt( $box.css('margin-top') ) || 0)+ (parseInt( $box.css( 'margin-bottom') ) || 0)
						);
				}
			});

			return {largestBoxWidth: largestBoxWidth, largestBoxHeight: largestBoxHeight}
		},
		checkAddScroll: function(){
			if( ! this.getConfig('overflow') && this.mediaList.length ){
				return true;
			}
			// for horizontal layouts fix to parent size fitting in area:
			if( this.getLayout() == 'horizontal' ){
				var totalWidth = this.getMediaItemBoxWidth()
					* this.mediaList.length;
				// Check if width is 100%, add boxes > than width
				if( this.getComponent().width() <  totalWidth ){
					return true;
				}
			}
			return false;
		}
	});

} )( window.mw, window.jQuery );