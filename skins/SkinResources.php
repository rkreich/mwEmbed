<?php

// go over the folder list 
return array(
	'kdark' => array(
		/** 
		  * We need to have mw.EmbedPlayer dependency for our skin
		  * So that the Core CSS will load before Skin CSS
		 **/
		'dependencies' => 'mw.EmbedPlayer',
		'styles' => array(
			'skins/kdark/css/layout.css',
			'skins/kdark/css/icons.css',
		)
	),
    'ssk' => array(
        /**
         * We need to have mw.EmbedPlayer dependency for our skin
         * So that the Core CSS will load before Skin CSS
         **/
        'dependencies' => 'mw.EmbedPlayer',
        'styles' => array(
            'skins/ssk/css/layout.css',
            'skins/ssk/css/icons.css',
        )
    )
);