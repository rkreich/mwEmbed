( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'titleLabel', mw.KBaseComponent.extend({
		defaultConfig: {
			"parent" : "topBarContainer",
			"order"  : 1,
			"align"  : "left",
			"text"   : '{mediaProxy.entry.name}',
			desc     : '{mediaProxy.entry.description}'
		},
		setup: function(){
			var _this = this,
				descriptionElm = $('<span>').addClass('descriptionLabel').text( _this.getConfig('desc') );
			this.bind('playerReady', function(){
				// Update title to entry name
				_this.getComponent().text(
					_this.getConfig('text')
				).append(descriptionElm);
			});
		},
		getComponent: function() {
			if( !this.$el ) {
				this.$el = $( '<div />' ) .addClass( this.getCssClass() );
			}
			return this.$el;
		}
	}));

})( window.mw, window.jQuery );