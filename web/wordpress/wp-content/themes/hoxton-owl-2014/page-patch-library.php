<?php
/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 *
 * This is the template for the 'Patches' page.
 *
 * Note that this file is named after the page's slug, following the Wordpress
 * convention "page-{page_slug}.php".
 */

$resUri = get_template_directory_uri() . '/page-patch-library/';

// <link rel="stylesheet"> tags to be placed in <head>
wp_enqueue_style('owl-patches-page_style_css', $resUri . 'style.css', array(), 5);
wp_enqueue_style('owl-patches-page_fonts_googleapis', 'http://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700|Montserrat:400,700');
wp_enqueue_style('jquery-ui-style', get_template_directory_uri() . '/js/jquery-ui-1.11.2.custom/jquery-ui.min.css');
wp_enqueue_style('jquery-ui-style-structure', get_template_directory_uri() . '/js/jquery-ui-1.11.2.custom/jquery-ui.structure.min.css');
wp_enqueue_style('jquery-ui-style-theme', get_template_directory_uri() . '/js/jquery-ui-1.11.2.custom/jquery-ui.theme.min.css');

// <script> tags to be placed in <head>
wp_enqueue_script('owl-patches-page_knockout',      $resUri . 'js3rdparty/knockout-2.0.0.js');
wp_enqueue_script('jquery',                         $resUri . 'js3rdparty/jquery-1.7.1.min.js');
wp_enqueue_script('jquery-ui',                      get_template_directory_uri() . '/js/jquery-ui-1.11.2.custom/jquery-ui.min.js', array('jquery'));
wp_enqueue_script('owl-patches-page_jquery_knob',   $resUri . 'js3rdparty/jquery.knob.min.js', array('jquery'));
wp_enqueue_script('owl-patches-page_knob',          $resUri . 'js/knob.js');

wp_enqueue_script('owl-patches-page_prettify',      'https://google-code-prettify.googlecode.com/svn/trunk/src/prettify.js');
wp_enqueue_script('owl-patches-page_run_prettify',  'https://google-code-prettify.googlecode.com/svn/loader/run_prettify.js');

// <script> tags to be placed just before </body>
wp_enqueue_script('owl-api-client',                 get_template_directory_uri() . '/js/hoxtonowl-api-client.js', array('jquery'), false, true);
wp_enqueue_script('owl-patch',                      get_template_directory_uri() . '/js/hoxtonowl-patch.js', array(), false, true);
wp_enqueue_script('owl-patches-page_patch_manager', $resUri . 'js/patchManager.js', array('jquery', 'jquery-ui', 'owl-patch', 'owl-api-client'), false, true);

?>

<?php Starkers_Utilities::get_template_parts( array( 'parts/shared/html-header', 'parts/shared/header' ) ); ?>


<div id="secondary-nav-bar">
    <div id="secondary-nav-bar-content">
        <div class="secondary-nav-item" data-bind="css: { active: search() === 'all' }, click: selectAllPatches">
            <img src="<?= $resUri ?>images/browse-all-icon.png" width="40" height="40" alt="icon">
            <p>Browse all</p>
        </div>
        <!-- <div class="secondary-nav-item"> -->
        <!--   <img src="<?= $resUri ?>images/latest-icon.png" width="40" height="40" alt="icon"> -->
        <!--   <p>Latest</p> -->
        <!-- </div> -->
        <!-- <div class="secondary-nav-item"> -->
        <!--   <img src="<?= $resUri ?>images/popular-icon.png" width="40" height="40" alt="icon"> -->
        <!--   <p>Popular</p> -->
        <!-- </div> -->
        <div class="secondary-nav-item" data-bind="css: { active: search() === 'tag' }, click: selectAllTags">
            <img src="<?= $resUri ?>images/tags-icon.png" width="40" height="40" alt="icon">
            <p>Tags</p>
        </div>
        <div class="secondary-nav-item" data-bind="css: { active: search() === 'author' }, click: selectAllAuthors">
            <img src="<?= $resUri ?>images/authors-icon.png" width="40" height="40" alt="icon">
            <p>Authors</p>
        </div>
        <?php if (is_user_logged_in()): ?>
        <div class="secondary-nav-item" data-bind="css: { active: search() === 'myPatches' }, click: selectMyPatches">
            <img src="<?= $resUri ?>images/my-patches-icon.png" width="40" height="40" alt="icon">
            <p>My patches</p>
        </div>
        <?php endif; ?>
        <!-- <div class="secondary-nav-item"> -->
        <!--     <img src="<?= $resUri ?>images/my-rigs-icon.png" width="40" height="40" alt="icon"> -->
        <!--     <p>My rigs</p> -->
        <!-- </div> -->
    </div>
</div>

<div id="filter-bar" data-bind="if: search() != 'patch' && search() != 'all' && search() != 'myPatches'">
    <div id="filter-wrapper" class="wrapper" data-bind="foreach: search() === 'author' ? authors : tags">
        <div class="tag-filter-button" data-bind="text: $data, click: selectFilter, css: { active: searchItems.indexOf($data) > -1 }"></div>
    </div>
</div>

<div class="wrapper flexbox">
    <div class="content-container">
        <!-- ko if: selectedPatch -->

        <!-- #one-third -->
        <div id="one-third" data-bind="with: selectedPatch" class="patch-library">
            <div class="patch-tile-small" id="sticker">
                <table class="patch-title-controls">
                    <tr>
                        <td><span class="patch-title no-pseudo-link" data-bind="text: name"></span></td>
                        <td width="40"><div class="edit-button" data-bind="click: HoxtonOwl.patchManager.editPatch"><img src="<?= $resUri ?>images/pencil.png" alt="Edit patch" /></div></td>
                    </tr>
                    <tr>
                        <td style="padding-top: 20px;">
                            <span class="author-name" data-bind="text: author.name, click: selectOnlyAuthor"></span>
                        </td>
                        <td>&nbsp;</td>
                    </tr>
                </table>
            </div>
            <div class="patch-description">
                <h2>Description</h2>
                <p data-bind="text: description"></p>
            </div>
            <!-- ko if: instructions -->
            <div class="patch-instructions">
                <h2>Instructions</h2>
                <p data-bind="text: instructions"></p>
            </div>
            <!-- /ko -->
            <!-- <div class="video-wrapper1">
                <iframe src="//www.youtube.com/embed/HAfODHJFkjE" frameborder="0" allowfullscreen></iframe>
            </div> -->
            <div class="patch-stats" data-bind="with: selectedPatch">
                <table width="100%">
                    <tr>
                        <td width="30%"><span class="parameter-label">Channels</span></td>
                        <td><p data-bind="text: (inputs + ' in / ' + outputs + ' out')"></p></td>
                    </tr>
                    <tr>
                        <td><span class="parameter-label">CPU</span></td>
                        <td><p data-bind="text: cycles + '%'"></p></td>
                    </tr>
                    <tr>
                        <td><span class="parameter-label">Memory</span></td>
                        <td><p data-bind="text: (selectedPatch().bytesToHuman(bytes) + ' / 1Mb')"></p></td>
                    </tr>
                    <!-- <tr> -->
                    <!--     <td><span class="parameter-label">Version</span></td> -->
                    <!--     <td><p>v.1.1.0 - 21/04/2014</p></td> -->
                    <!-- </tr> -->
                    <!-- <tr> -->
                    <!--   <td><span class="parameter-label">Used in</span></td> -->
                    <!--   <td><p>123 rigs</p></td> -->
                    <!-- </tr> -->
                </table>
            </div>
            <!-- ko foreach: tags -->
            <div class="tag"><span data-bind="text: $data, click: selectOnlyTag"></span></div>
            <!-- /ko -->
        </div>
        <!-- /#one-third -->

        <!-- #two-thirds -->
        <div id="two-thirds" class="patch-library">
            <div data-bind="foreach: soundcloud">
                <iframe width="100%" height="250" scrolling="no" frameborder="no" data-bind="attr: { src: $data }"></iframe>
            </div>
            <!-- <div class="video-wrapper2"> -->
            <!--     <iframe src="//www.youtube.com/embed/HAfODHJFkjE" frameborder="0" allowfullscreen></iframe> -->
            <!-- </div> -->
            <!-- <div class="clear"></div> -->
            <div class="patch-stats2" data-bind="with: selectedPatch">
                <span class="parameter-label">Channels</span>
                <span class="parameter-value" data-bind="text: (inputs + ' in / ' + outputs + ' out')"></span>
                <span class="parameter-label">CPU</span>
                <span class="parameter-value" data-bind="text: cycles + '%'"></span>
                <span class="parameter-label">Memory</span>
                <span class="parameter-value" data-bind="text: (selectedPatch().bytesToHuman(bytes) + ' / 1Mb')"></span>
                <!-- <span class="parameter-label">Version</span> -->
                <!-- <span class="parameter-value">v.1.1.0 - 21/04/2014</span> -->
                <!-- <span class="parameter-label">Used in</span> -->
                <!-- <span class="parameter-value">123 rigs</span> -->
            </div>
            <div class="white-box2" data-bind="with: selectedPatch">
                <h2 class="bolder">Parameters</h2>
                <div class="flexbox flex-center">
                    <div class="knob-container">
                        <input class="knob" data-angleOffset="-125" data-angleArc="250" data-displayInput="false" data-fgColor="#ed7800" data-linecap="round" data-width="100%" data-rotation="clockwise" data-readOnly="true" value="35">
                        <p class="parameter-label" data-bind="text: parameters.a"></p>
                    </div>
                    <div class="knob-container">
                        <input class="knob" data-angleOffset="-125" data-angleArc="250" data-displayInput="false" data-fgColor="#ed7800" data-linecap="round" data-width="100%" data-rotation="clockwise" data-readOnly="true" value="35">
                        <p class="parameter-label" data-bind="text: parameters.b"></p>
                    </div>
                    <div class="knob-container">
                        <input class="knob" data-angleOffset="-125" data-angleArc="250" data-displayInput="false" data-fgColor="#ed7800" data-linecap="round" data-width="100%" data-rotation="clockwise" data-readOnly="true" value="35">
                        <p class="parameter-label" data-bind="text: parameters.c"></p>
                    </div>
                    <div class="knob-container">
                        <input class="knob" data-angleOffset="-125" data-angleArc="250" data-displayInput="false" data-fgColor="#ed7800" data-linecap="round" data-width="100%" data-rotation="clockwise" data-readOnly="true" value="35">
                        <p class="parameter-label" data-bind="text: parameters.d"></p>
                    </div>
                    <div class="knob-container">
                        <input class="knob" data-angleOffset="-125" data-angleArc="250" data-displayInput="false" data-fgColor="#ed7800" data-linecap="round" data-width="100%" data-rotation="clockwise" data-readOnly="true" value="35">
                        <p class="parameter-label" data-bind="text: parameters.e"></p>
                    </div>
                </div>
            </div>
            <div class="white-box2" id="git-code">
                <h2 class="bolder">Patch code</h2>
                <div id="github-files">
                    <!--
                    <ul>
                        <li><a href="#tabs-1">Nunc tincidunt</a></li>
                    </ul>
                    <div id="tabs-1">
                        <pre class="prettyprint"></pre>
                    </div>
                    -->
                </div>
            </div>
        </div>
        <!-- /#two-thirds -->
        <!-- /ko -->

        <!-- ko foreach: filteredPatches -->
        <!-- div.patch-tile -->
        <div class="patch-tile">
            <table class="patch-title-controls">
                <tbody>
                    <tr>
                        <!-- <td width="40"><div class="play-button">&gt;</div></td> -->
                        <td><span class="patch-title" data-bind="text: name, click: HoxtonOwl.patchManager.openPatch, attr: { 'data-patch-id': _id }"></span></td>
                        <!--td><span class="patch-title" data-bind="text: name, click: selectPatch"></span></td-->
                        <!-- <td width="40"><div class="add-button"><span>+</span></div></td> -->
                    </tr>
                    <tr>
                        <!-- <td>&nbsp;</td> -->
                        <td style="padding-top: 20px;"><span class="author-name" data-bind="visible: search() !== 'myPatches', text: author.name, click: selectOnlyAuthor"></span></td>
                        <!-- <td>&nbsp;</td> -->
                    </tr>
                </tbody>
            </table>
            <div class="patch-baseline">
                <!-- ko foreach: tags -->
                <div class="tag"><span data-bind="text: $data, click: selectOnlyTag"></span></div>
                <!-- /ko -->
                <!-- <span class="add-counter">215</span> -->
            </div>
        </div>
        <!-- /div.patch-tile -->
        <!-- /ko -->

    </div> <!-- /div.content-container -->
</div> <!-- /div.wrapper.flexbox -->

<?php
global $current_user;

if (is_user_logged_in()):
?><div id="wordpress-username" style="display: none;"><?= $current_user->user_login; ?></div>
<?php endif; ?>

<?php Starkers_Utilities::get_template_parts( array( 'parts/shared/footer','parts/shared/html-footer') ); ?>
