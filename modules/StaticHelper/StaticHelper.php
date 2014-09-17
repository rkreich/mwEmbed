<?php
return array(
    "mw.StaticHelper" => array(
        'scripts'      => array(
            'resources/mw.StaticHelper.js'
        ),
        'dependencies' => array(
            'mw.EmbedPlayer',
            'mediawiki.Uri',
            'mw.Playlist',
        ),
        'kalturaPluginName' => 'staticHelper',
        'kalturaLoad' => 'always'
    ),
);