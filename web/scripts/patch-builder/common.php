<?php
/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

const PATCH_TYPE_CPLUSPLUS = 'C++';
const PATCH_TYPE_FAUST     = 'faust';
const PATCH_TYPE_PUREDATA  = 'pd';
const PATCH_TYPE_UNKNOWN   = 'unknown';

const MAKE_TARGET_SYSX     = 'sysex';
const MAKE_TARGET_WEB      = 'web';

/**
 * Returns the patch type.
 *
 * @return string
 *     The patch type.
 */
function getPatchType($patch) {

    if (!isset($patch['github'])) {
        return PATCH_TYPE_UNKNOWN;
    }
    $github = $patch['github'];
    if (!is_array($github) || 0 === count($github)) {
        return PATCH_TYPE_UNKNOWN;
    }

    $primaryFile = $github[0];
    if (preg_match('/\.hpp$/', $primaryFile)) {
        return PATCH_TYPE_CPLUSPLUS;
    } elseif (preg_match('/\.dsp$/', $primaryFile)) {
        return PATCH_TYPE_FAUST;
    } elseif (preg_match('/\.pd$/', $primaryFile)) {
        return PATCH_TYPE_PUREDATA;
    } else {
        return PATCH_TYPE_UNKNOWN;
    }

} // function getPatchType
