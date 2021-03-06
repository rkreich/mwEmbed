/**
 * mediawiki.client has some convenience functions for user agent checks
 *
 * TODO this should be combined with or bootstrap jquery.client.js
 */
( function( mw ) {

	var userAgent = navigator.userAgent;

	mw.isMobileDevice = function(){
		return ( mw.isIphone() || mw.isIpod() || mw.isIpad() || mw.isAndroid() || mw.isWindowsPhone() || mw.getConfig( "EmbedPlayer.ForceNativeComponent") === true )
	};
	mw.isIphone = function(){
		return ( mw.getConfig( "EmbedPlayer.ForceNativeComponent") !== true && navigator.userAgent.indexOf('iPhone') != -1 && ! mw.isIpad() ) || mw.isIpod();
	};
	mw.isIE = function() {
		return (/msie/.test(userAgent.toLowerCase()));
	};
    mw.isIE7 = function(){
        return (/msie 7/.test(userAgent.toLowerCase()));
    };
	mw.isIE8 = function(){
		return (/msie 8/.test(userAgent.toLowerCase()));
	};
	mw.isIE9 = function(){
		return (/msie 9/.test(userAgent.toLowerCase()));
	};
	mw.isIE = function() {
		return (/msie/).test(userAgent.toLowerCase());
	};
	mw.isDesktopSafari = function(){
	  return (/safari/).test(userAgent.toLowerCase()) && !mw.isMobileDevice() && !mw.isChrome();
	};
	mw.isIE9Comp = function(){
		return (/msie 7/.test(userAgent.toLowerCase()) && /trident\/5/.test(userAgent.toLowerCase()));
	};
	mw.isIE10Comp = function(){
		return (/msie 7/.test(userAgent.toLowerCase()) && /trident\/6/.test(userAgent.toLowerCase()));
	};
	// Uses hack described at:
	// http://www.bdoran.co.uk/2010/07/19/detecting-the-iphone4-and-resolution-with-javascript-or-php/
	mw.isIphone4 = function(){
		return ( mw.isIphone() && ( window.devicePixelRatio && window.devicePixelRatio >= 2 ) );
	};
	mw.isIpod = function(){
		return (  userAgent.indexOf('iPod') != -1 );
	};
	mw.isIpad = function(){
		return ( userAgent.indexOf('iPad') != -1 );
	};
	mw.isIpad3 = function(){
		return  /OS 3_/.test( userAgent ) && mw.isIpad();
	};
	mw.isAndroid44 = function(){
		return ( userAgent.indexOf( 'Android 4.4') != -1 );
	};
	mw.isAndroid43 = function(){
		return ( userAgent.indexOf( 'Android 4.3') != -1 );
	};
	mw.isAndroid42 = function(){
		return ( userAgent.indexOf( 'Android 4.2') != -1 );
	};
	mw.isAndroid41 = function(){
		return ( userAgent.indexOf( 'Android 4.1') != -1 );
	};
	mw.isAndroid40 = function(){
		return ( userAgent.indexOf( 'Android 4.0') != -1 );
	};
	mw.isAndroid2 = function(){
		return ( userAgent.indexOf( 'Android 2.') != -1 );
	};
	mw.isAndroid = function(){
		return ( userAgent.indexOf( 'Android') != -1 );
	};
	mw.isAndroid4andUp = function(){
		return ( userAgent.indexOf( 'Android 4.') != -1 );
	};
	mw.isFirefox = function(){
		return ( userAgent.indexOf( 'Firefox') != -1 );
	};
	mw.isChrome = function(){
		return ( userAgent.indexOf( 'Chrome') != -1 );
	};
	mw.isAndroidNativeBrowser = function(){
		return (mw.isAndroid() && !mw.isFirefox() && !mw.isChrome());
	};
	mw.isAndroidChromeNativeBrowser = function(){
		return ( mw.isAndroid() && mw.isChrome() && userAgent.indexOf( 'Version/' ) != -1 )
	};
	mw.isMobileChrome = function(){
		return ( userAgent.indexOf( 'Android 4.' ) != -1
					&&
				  userAgent.indexOf( 'Chrome' ) != -1
				)
	};
	mw.isWindowsPhone = function(){
		return (  userAgent.indexOf('Windows Phone') != -1 );
	};
	mw.isIOS = function(){
		return ( mw.isIphone() || mw.isIpod() || mw.isIpad() );
	};
	mw.isIOS3 = function(){
		return /OS 3_/.test( userAgent ) && mw.isIOS();
	};
	mw.isIOS4 = function(){
		return /OS 4_/.test( userAgent ) && mw.isIOS();
	};
	mw.isIOS5 = function(){
		return /OS 5_/.test( userAgent ) && mw.isIOS();
	};

	mw.isIOS6 = function(){
		return /OS 6_/.test( userAgent ) && mw.isIOS();
	};

	mw.isIOS7 = function(){
		return /OS 7_/.test( userAgent ) && mw.isIOS();
	};

	mw.isIOS71 = function(){
		return /OS 7_1/.test( userAgent ) && mw.isIOS();
	};

	mw.isIOS8 = function(){
		// Known Limitation - It will return false for iOS8 Simulator
		return ( /OS 8_/.test( userAgent ) || /Version\/8/.test( userAgent ) ) && mw.isIOS();
	};

	mw.isSilk = function(){
		return /\bSilk\b/.test(userAgent);
	};

	// Does the client has native touch bindings?
	mw.hasNativeTouchBindings = function(){
		return (mw.isAndroid41() || mw.isAndroid42() || ( mw.isAndroid() && mw.isFirefox() ));
	};

	// Detect small mobile device ( smartphones )
	mw.isDeviceLessThan480P = function(){
		return matchMedia('only screen and (max-device-width: 480px)').matches;
	};

	mw.hasMouseEvents = function(){
		return !mw.isMobileDevice();
	};

	mw.isTouchDevice = function(){
		return !!('ontouchstart' in window);
	};

	/**
	 * Fallforward system by default prefers flash.
	 *
	 * This is separate from the EmbedPlayer library detection to provide
	 * package loading control NOTE: should be phased out in favor of browser
	 * feature detection where possible
	 *
	 */
	mw.isHTML5FallForwardNative = function(){
		if( mw.isMobileHTML5() ){
			return true;
		}
		// Check for url flag to force html5:
		if( document.URL.indexOf('forceMobileHTML5') != -1 ){
			return true;
		}
		// Fall forward native:
		// if the browser supports flash ( don't use html5 )
		if( mw.supportsFlash() ){
			return false;
		}
		// No flash return true if the browser supports html5 video tag with
		// basic support for canPlayType:
		if( mw.supportsHTML5() ){
			return true;
		}

		return false;
	};

	mw.isMobileHTML5 = function(){
		// Check for a mobile html5 user agent:
		if ( mw.isIphone() ||
			 mw.isIpod()   ||
			 mw.isIpad()   ||
			 mw.isAndroid2()
		){
			return true;
		}
		return false;
	};

	mw.supportsHTML5 = function(){
		// Blackberry is evil in its response to canPlayType calls.
		if( userAgent.indexOf('BlackBerry') != -1 ){
			return false ;
		}
		var dummyvid = document.createElement( "video" );
		if( dummyvid.canPlayType ) {
			return true;
		}
		return false;
	};

	/**
	 * If the browser supports flash
	 * @return {boolean} true or false if flash > 10 is supported.
	 */
	mw.supportsFlash = function() {
		if( mw.getConfig('EmbedPlayer.DisableHTML5FlashFallback' ) ){
			return false;
		}
		
		// Desktop safari flash has "power saving bug" as well as cross domain request issues
		// by default we disable flash on desktop safari. 
		if( mw.isDesktopSafari() ){
			return false;
		}

		var majorVersion = this.getFlashVersion().split(',').shift();
		if( majorVersion < 10 ){
			return false;
		} else {
			return true;
		}
	};

	mw.supportSilverlight = function(){
		return Silverlight.isInstalled("4.0");
	};

	/**
	 * parse JSON string
	 * @return {object} parsed json object. If parsing fails (syntax error): returns retValue if specified. If no retValue was specified - returns an empty object.
	 */
	mw.parseJSON = function(json, retValue) {
		try{
			var parsedJson = JSON.parse(json);
		}catch(e){
			mw.log("JSON parse syntax error: " + e);
			return retValue ? retValue : null;
		}
		return parsedJson;
	}

	/**
	 * Checks for flash version
	 * @return {string} flash version string
	 */
	mw.getFlashVersion = function() {
		// navigator browsers:
		if (navigator.plugins && navigator.plugins.length) {
			try {
				if(navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin){
					return (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
				}
			} catch(e) {}
		}
		// IE
		try {
			try {
				if( typeof ActiveXObject != 'undefined' ){
					// avoid fp6 minor version lookup issues
					// see: http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
					var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
					try {
						axo.AllowScriptAccess = 'always';
					} catch(e) {
						return '6,0,0';
					}
				}
			} catch(e) {}
			return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
		} catch(e) {}
		return '0,0,0';
	};

} )( window.mediaWiki );
