<?php

return array(
    "sskVolumeControl" => array(
        'scripts'           => "resources/sskVolumeControl.js",
        'dependencies'      => 'mw.KBaseComponent',
        'kalturaPluginName' => 'sskVolumeControl',
    ),
    "sskScrubber" => array(
        'scripts'           => "resources/sskScrubber.js",
        'dependencies'      => 'mw.KBaseComponent',
        'kalturaPluginName' => 'sskScrubber',
    ),
    "sskDescriptionLabel" => array(
        'scripts'           => "resources/sskDescriptionLabel.js",
        'dependencies'      => 'mw.KBaseComponent',
        'kalturaPluginName' => 'sskDescriptionLabel',
    ),
    "sskTopBarContainer" => array(
        'scripts'           => "resources/sskTopBarContainer.js",
        'dependencies'      => 'mw.KBaseComponent',
        'kalturaPluginName' => 'sskTopBarContainer',
    ),
    "sskControlBarContainer" => array(
        'scripts'           => "resources/sskControlBarContainer.js",
        'dependencies'      => 'mw.KBaseComponent',
        'kalturaPluginName' => 'sskControlBarContainer',
    ),
    "sskSourceSelector" => array(
        'scripts'           => "resources/sskSourceSelector.js",
        'dependencies'      => 'mw.KBaseComponent',
        'kalturaPluginName' => 'sskSourceSelector',
    ),
    "sskEndScreen" => array(
        'scripts'           => "resources/sskEndScreen.js",
        'styles' => "../SSK/resources/sskEndScreen.css",
        'templates' => "../SSK/resources/sskEndScreen.tmpl.html",
        'dependencies'      => 'mw.KBaseScreen',
        'kalturaPluginName' => 'sskEndScreen',
    ),
);