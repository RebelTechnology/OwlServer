<?php
/**
 * Hoxton OWL 2014 skin
 *
 * @file
 * @ingroup Skins
 * @author  Sam Artuso <sam@highoctanedev.co.uk>
 * @license CC0 (public domain) <http://creativecommons.org/publicdomain/zero/1.0/>
 */

$wgExtensionCredits['skin'][] = array(
    'path'           => __FILE__,
    'name'           => 'HoxtonOWL2014',
    'version'        => '1.0',
    'url'            => 'http://www.hoxtonowl.com',
    'author'         => 'Sam Artuso <sam@highoctanedev.co.uk>',
    'descriptionmsg' => 'Hoxton OWL 2014 skin',
    'license'        => 'GPL3',
);

$wgValidSkinNames['hoxtonowl2014'] = 'HoxtonOWL2014';

$wgAutoloadClasses['SkinHoxtonOWL2014'] = __DIR__ . '/HoxtonOWL2014.skin.php';
$wgMessagesDirs['HoxtonOWL2014'] = __DIR__ . '/i18n';

$wgResourceModules['skins.hoxtonowl2014'] = array(
    'styles' => array(
        'HoxtonOWL2014/resources/wordpress-fix.css'                       => array( 'media' => 'screen' ),
        '../../wp-content/themes/hoxton-owl-2014/css/reset.css'     => array('media' => 'screen'),
        '../../wp-content/themes/hoxton-owl-2014/css/app-style.css' => array('media' => 'screen'),
        '../../wp-content/themes/hoxton-owl-2014/style.css'         => array('media' => 'screen'),
    ),
    'remoteBasePath' => &$GLOBALS['wgStylePath'],
    'localBasePath' => &$GLOBALS['wgStyleDirectory'],
);
