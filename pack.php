<?php
$opts     = array(
    'host:',
    'wid:',
    'config:',
    'debug',
);
$options  = getopt('', $opts);
//$host     = _getOption($options ,'host', true);
$host = '';
$widgetId = _getOption($options ,'wid', true);
$playerConfig = _getOption($options ,'config', true);
$playerId = 'kplayer';
$isDebug  = _getOption($options ,'debug', false, false);
$isDebug = !is_null($isDebug);

if (!file_exists($playerConfig))
    die('Player config not found');

/**
 * Set global variables
 */
$_GET['wid']              = $widgetId;
$_GET['jsonConfig']        = file_get_contents($playerConfig);
$_GET['entry_id']         = '';
$_GET['uiconf_id']         = 1;
$_GET['playerId']         = 'kplayer';
$_GET['debug']            = $isDebug ? 'true' : null;
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
$fileSuffix            = $widgetId;
$outputFolder          = 'static';
$mwEmbedFrameFilename  = 'mwEmbedFrame' . $fileSuffix . '.html';
$mwEmbedLoaderFilename = 'mwEmbedLoader' . $fileSuffix . '.js';
$loadJSInlineFilename  = 'startup' . $fileSuffix . '.js';
$loadModulesJsFilename     = 'modules' . $fileSuffix . '.js';


require_once(dirname(__FILE__) . '/includes/DefaultSettings.php');
require_once(dirname(__FILE__) . '/includes/MwEmbedWebStartSetup.php');
require_once(dirname(__FILE__) . '/modules/StaticHelper/StaticResourceLoader.php');

// override the local settings
$wgEnableScriptDebug = $isDebug;
$wgResourceLoaderDebug = $isDebug;
$wgUseFileCache = false;

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
require_once(dirname(__FILE__) . '/modules/StaticHelper/StaticIframeClass.php');
$kIframe = new StaticIframeClass();
echo $kIframe->getIFramePageOutput();
$output = ob_get_clean();

// copy resources/PIE/PIE.js
_copyUrlToStatic('resources/PIE/PIE.js');

_copyUrlToStatic('modules/EmbedPlayer/binPlayers/kaltura-player/kdp3.swf');

// replace the paths to the mwEmbedLoader.php static js
preg_match_all('#src="(https?.*mwEmbedLoader.php[^"]*)#', $output, $matches);
foreach ($matches[1] as $mwEmbedLoaderUrl) {
    $output = str_replace($mwEmbedLoaderUrl, $mwEmbedLoaderFilename, $output);
}

// the start up inline script
$output = preg_replace('/writeScript\(\s?"[^"]+"\)/m', 'writeScript("'.$loadJSInlineFilename.'")', $output);

$iframeData = $kIframe->getIframePackageData();

// copy and replace css files
foreach($iframeData['skinResources'] as &$skinResource)
{
    $skinSrc = $skinResource['src'];
    _copyUrlToStatic($skinSrc);
    $skinResource['src'] = trim(parse_url($skinSrc, PHP_URL_PATH), '/');
}

$output = preg_replace('#"wgLoadScript":\s?"http://./load.php"#', '"wgLoadScript": "./"', $output);

// replace the script loader with our static modules.js
$output = str_replace('http://./load.php', $loadModulesJsFilename, $output);

file_put_contents($outputFolder . '/' . $mwEmbedFrameFilename, $output);

/**
 *
 * startup.js
 *
 */
$modules = array( 'jquery', 'mediawiki' );
wfRunHooks( 'ResourceLoaderGetStartupModules', array( &$modules ) );
$modules[] = 'mediawiki.Uri'; // required for our loading logic
$resourceLoader = new MwEmbedResourceLoader();
$startupModulesToLoad = array();
$missing = array();
foreach ($modules as $name ) {
    $module = $resourceLoader->getModule($name);
    if ($module) {
        $startupModulesToLoad[$name] = $module;
    } else {
        $missing[] = $name;
    }
}
$fauxRequest    = new WebRequest();
$context        = new MwEmbedResourceLoaderContext($resourceLoader, $fauxRequest);
$output = $resourceLoader->makeModuleResponse($context, $startupModulesToLoad, $missing);
file_put_contents($outputFolder . '/' . $loadJSInlineFilename, $output);


/**
 *
 * modules.js
 *
 */
unset($_GET['modules']);
unset($_GET['only']);
unset($_GET['skin']);
unset($_GET['lang']);
$moduleList = $kIframe->getModulesList();
$moduleList[] = $kIframe->getUiConfResult()->getPlayerConfig()['layout']['skin'];
$moduleList[] = 'mw.EmbedPlayerKplayer'; // alway add flash player
$fauxRequest    = new WebRequest();
$resourceLoader = new StaticResourceLoader();
$modulesToLoad  = array();
function disableModuleUrlLoad($module) {
    // in debug mode, modules will be loaded via additional requests but we just want it to be un-minified and under modules.js
    $reflectionObject = new ReflectionObject($module);
    if ($reflectionObject->hasProperty('debugRaw')) {
        $debugRawProperty = $reflectionObject->getProperty('debugRaw');
        $debugRawProperty->setAccessible(true);
        $debugRawProperty->setValue($module, false);
    }
}
function loadDependencies(array &$modulesToLoad, array $dependencies, StaticResourceLoader $resourceLoader) {
    global $startupModulesToLoad;
    foreach($dependencies as $dep)
    {
        /** @var MwEmbedResourceLoaderFileModule $depModule */
        $depModule = $resourceLoader->getModule($dep);
        disableModuleUrlLoad($depModule);
        loadDependencies($modulesToLoad, $depModule->getDependencies(), $resourceLoader);
        if (!array_key_exists($dep, $startupModulesToLoad)) // do not add startup modules again
            $modulesToLoad[$dep] = $depModule;
    }
}
ob_end_clean();
foreach ($moduleList as $name) {
    /** @var MwEmbedResourceLoaderFileModule $module */
    $module = $resourceLoader->getModule($name);
    disableModuleUrlLoad($module);
    loadDependencies($modulesToLoad, $module->getDependencies(), $resourceLoader);
    $modulesToLoad[$name] = $module;
}

// move the iframe setup module to be loaded last, otherwise some dependencies are required
$iframeSetup = $modulesToLoad['mw.KalturaIframePlayerSetup'];
unset($modulesToLoad['mw.KalturaIframePlayerSetup']);
$modulesToLoad['mw.KalturaIframePlayerSetup'] = $iframeSetup;

$context        = new MwEmbedResourceLoaderContext($resourceLoader, $fauxRequest);
$output         = $resourceLoader->makeModuleResponse($context, $modulesToLoad);

preg_match_all('#url\((https?://[^)]*)#', $output, $matches);
foreach ($matches[1] as $cssUrl) {
    _copyUrlToStatic($cssUrl);
    $newCssUrl = trim(parse_url($cssUrl, PHP_URL_PATH), '/');
    $output = str_replace($cssUrl, $newCssUrl, $output);
}
file_put_contents($outputFolder . '/' . $loadModulesJsFilename, $output);

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