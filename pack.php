<?php
$opts     = array(
    'host:',
    'wid:',
    'uiconfid:',
    'debug',
);
$options  = getopt('', $opts);
$host     = _getOption($options ,'host', true);
$widgetId = _getOption($options ,'wid', true);
$uiConfId = _getOption($options ,'uiconfid', true);
$playerId = 'kplayer';
$isDebug  = _getOption($options ,'debug', false);


/**
 * Set global variables
 */
$_GET['wid']              = $widgetId;
$_GET['uiconf_id']        = $uiConfId;
$_GET['entry_id']         = '';
$_GET['playerId']         = 'kplayer';
$_GET['debug']            = 'true';
$_GET['forceMobileHTML5'] = 'true';

foreach ($_GET as $key => $value) {
    $_REQUEST[$key] = $value;
}

$_SERVER['SERVER_PORT'] = '443';
$_SERVER['HTTP_HOST']   = $host;
$_SERVER['SERVER_NAME'] = $host;
$_SERVER['SCRIPT_NAME'] = 'mwEmbedLoader.php';

/**
 * Set output file names
 */
$fileSuffix            = $widgetId . '_' . $uiConfId;
$outputFolder          = 'static';
$mwEmbedFrameFilename  = 'mwEmbedFrame' . $fileSuffix . '.html';
$mwEmbedLoaderFilename = 'mwEmbedLoader' . $fileSuffix . '.js';
$loadJSInlineFilename  = 'startup' . $fileSuffix . '.js';
$loadModulesJsFilename     = 'modules' . $fileSuffix . '.js';


require(dirname(__FILE__) . '/includes/DefaultSettings.php');
require(dirname(__FILE__) . '/includes/MwEmbedWebStartSetup.php');


/**
 *
 * mwEmbedLoader
 *
 */
ob_start();
require('mwEmbedLoader.php');
$output = ob_get_clean();

//  replace the path to our static mwEmbedFrame.php html page
$output = str_replace('mwEmbedFrame.php', $mwEmbedFrameFilename, $output);

file_put_contents($outputFolder . '/' . $mwEmbedLoaderFilename, $output);

/**
 *
 * mwEmbedFrame
 *
 */
ob_start();
require_once(dirname(__FILE__) . '/modules/KalturaSupport/kalturaIframeClass.php');
$kIframe = new kalturaIframeClass();
echo $kIframe->getIFramePageOutput();
$output = ob_get_clean();
// replace the paths to the mwEmbedLoader.php static js
preg_match_all('#src="(https?.*mwEmbedLoader.php[^"]*)#', $output, $matches);
foreach ($matches[1] as $mwEmbedLoaderUrl) {
    $output = str_replace($mwEmbedLoaderUrl, $mwEmbedLoaderFilename, $output);
}

// find static js includes like PIE.js
preg_match_all('#src="(https?://'.$host.'./[^"]*)"#', $output, $matches);
foreach ($matches[1] as $srcInclude) {
    _copyUrlToStatic($srcInclude);
    $newSrcInclude = trim(parse_url($srcInclude, PHP_URL_PATH), '/');
    $output = str_replace($srcInclude, $newSrcInclude, $output);
}

// the start up inline script
$output = preg_replace('/writeScript\("[^"]+"\)/', 'writeScript("'.$loadJSInlineFilename.'")', $output);

// find the iframe data
preg_match('/window.kalturaIframePackageData = ([^;]+)/', $output, $matches);
$iframeData = json_decode($matches[1], true);

// copy and replace css files
foreach($iframeData['skinResources'] as &$skinResource)
{
    $skinSrc = $skinResource['src'];
    _copyUrlToStatic($skinSrc);
    $skinResource['src'] = trim(parse_url($skinSrc, PHP_URL_PATH), '/');
}

// replace entry result with null, instead of empty array, otherwise it won't be loaded
$iframeData['entryResult'] = null;

// clear the error that is added by the incorrect (but required) playlist id
$iframeData['error'] = null;

// replace ks so it would be dynamically started on player load time
array_walk_recursive($iframeData, function(&$item, $key) {
    if ($key == 'ks')
        $item = null;
});

// write the new iframe data
$output = preg_replace('/window.kalturaIframePackageData = ([^;]+)/', 'window.kalturaIframePackageData = '.json_encode($iframeData), $output);

// another ks occurrence in json
$output = preg_replace('/"ks":"[^"]+"/', '"ks":null', $output);

file_put_contents($outputFolder . '/' . $mwEmbedFrameFilename, $output);

/**
 *
 * modules.js - TODO
 *
 */

$modules =  ["mw.MwEmbedSupport","mw.KalturaIframePlayerSetup","mw.KWidgetSupport","keyboardShortcuts","controlBarContainer","topBarContainer","sideBarContainer","largePlayBtn","playPauseBtn","fullScreenBtn","scrubber","volumeControl","currentTimeLabel","durationLabel","sourceSelector","related","acCheck","acPreview","carouselPlugin","liveStream","titleLabel","statisticsPlugin","mw.StaticHelper","mw.EmbedPlayer","kdark"];
$fauxRequest    = new WebRequest();
$resourceLoader = new MwEmbedResourceLoader();
$modulesToLoad  = array();
foreach ($modules as $name) {
    $module = $resourceLoader->getModule($name);
    $loader = $module->getLoaderScript();
    if ($loader === false) {
        $modulesToLoad[$name] = $module;
    }
}

$context        = new MwEmbedResourceLoaderContext($resourceLoader, $fauxRequest);
$output         = $resourceLoader->makeModuleResponse($context, $modulesToLoad);
//file_put_contents($outputFolder . '/' . $loadModulesJsFilename, $output);



/**
 *
 * startup.js
 *
 */
$modules = array( 'jquery', 'mediawiki' );
wfRunHooks( 'ResourceLoaderGetStartupModules', array( &$modules ) );
$resourceLoader = new MwEmbedResourceLoader();
$modulesToLoad = array();
$missing = array();
foreach ($modules as $name ) {
    $module = $resourceLoader->getModule($name);
    if ($module) {
        $modulesToLoad[$name] = $module;
    } else {
        $missing[] = $name;
    }
}
$output = $resourceLoader->makeModuleResponse($context, $modulesToLoad, $missing);
file_put_contents($outputFolder . '/' . $loadJSInlineFilename, $output);


function _getOption($options, $key, $required) {
    if ($required && !isset($options[$key])) {
        echo 'Invalid arguments'.PHP_EOL;
        echo 'php pack.php --host HOST --wid WID --uiconfid UICONFID --debug'.PHP_EOL;
        die;
    }

    return isset($options[$key]) ? $options[$key] : null;
}

function _copyUrlToStatic($url) {
    global $outputFolder;
    $path = trim(parse_url($url, PHP_URL_PATH), '/');
    $srcOutputDir = $outputFolder . '/'. pathinfo($path, PATHINFO_DIRNAME);
    if (!file_exists($srcOutputDir))
        mkdir($srcOutputDir, 0777, true);
    copy($path, $outputFolder . '/'. $path);
}