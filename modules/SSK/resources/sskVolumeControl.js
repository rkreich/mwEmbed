( function( mw, $ ) {"use strict";

mw.PluginManager.add( 'sskVolumeControl', mw.KBaseComponent.extend({

	defaultConfig: {
		parent                 : "controlsContainer",
		order                  : 55,
		showTooltip            : true,
		displayImportance      : "medium",
		accessibleControls     : false,
		accessibleVolumeChange : 0.1,
		pinVolumeBar           : false,
		useCookie              : true

	},

	// Cached component variables
	vars : {},


	setup: function( embedPlayer ) {
		this.bind('layoutBuildDone', this.addBindings.bind(this));

		var _this = this;
		this.cookieName = this.pluginName + '_volumeValue';
		this.bind( 'playerReady ' , function(){
			if ( (_this.getConfig( 'useCookie' ) && $.cookie( _this.cookieName ) ) ) {
				var volumeValue = parseInt( $.cookie( _this.cookieName ) );
				if ( !isNaN( volumeValue ) &&
					volumeValue >= 0 &&
					volumeValue <= 100 ) {
					if ( volumeValue === 0 ) {
						_this.getPlayer().preMuteVolume = 1;
						_this.getPlayer().muted = true;
						_this.updateFirstMute = true;
					}
					_this.firstUpdate = true;
					_this.getPlayer().setVolume( volumeValue / 100 , true );
					_this.updateVolumeUI.call(_this, volumeValue / 100 );
				}
			}
		});
	},

	saveVolume: function(){
		if (this.firstUpdate){
			this.firstUpdate = false;
			return;
		}
		if( this.getConfig( 'useCookie' ) ){
			this.getPlayer().setCookie( this.cookieName ,this.getPlayer().getPlayerElementVolume() * 100 );
		}
	},
	isSafeEnviornment: function(){
		return !mw.isMobileDevice();
	},

	// this.getPlayer().getPlayerElementVolume()

	addBindings: function(){
		var _this = this;

		this.prepare();

		this.DOM.elm.on('mousedown', this.onmousedown.bind(this))
                    .on('mouseup', this.onmouseup.bind(this));

		this.bind('volumeChanged', function(e, percent){
			_this.updateVolumeUI( percent );
			_this.saveVolume();
		});
	},

	// event callbacks
	onmousedown : function(e){
	    this.calcVolume(e);
		this.DOM.elm.on('mousemove', this.calcVolume.bind(this));
	},

	onmouseup : function(){
	    this.DOM.elm.off('mousemove');
	},

	// calculates the percentage when clicking / + moving the mouse on the component
	calcVolume : function(e){
	  	var posX    = e.pageX - this.DOM.elm.offset().left,
	        percent = posX / this.vars.width;

	  	this.updateVolumeUI( percent );
	  	this.getPlayer().setVolume( percent , true );
	  	this.saveVolume();
	},

	updateVolumeUI: function( percent ){
		if( percent > .95 )
			percent = 1;
		if( percent < 0.05)
			percent = 0;

		var newBorderWidth = [this.vars.borderWidth[0] * percent, this.vars.borderWidth[1] * percent];

		this.DOM.slider[0].style.borderWidth = newBorderWidth[0] + "px " + newBorderWidth[1] + "px";
	},

	DOM : {},

	prepare : function(){
		var elm = this.getComponent();

		this.DOM.elm = elm;
		this.DOM.slider = elm.find('.slider');

		this.vars.width = this.DOM.elm[0].scrollWidth;
		this.vars.borderWidth = [this.vars.width/4, this.vars.width/2];
	},

	getComponent: function(){
		if( this.$el )
			return this.$el;

		// Add the volume control icon
		this.$el = $('<div />')
			.addClass( this.getCssClass() )
			.addClass('volumeControl')
			.append(
				$( '<div />' ).addClass( 'slider' )
			);

		return this.$el;
	}
}));

} )( window.mw, window.jQuery );