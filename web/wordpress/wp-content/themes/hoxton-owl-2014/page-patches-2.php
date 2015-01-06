<?php
/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 * 
 * This is the template for the 'Patches' page.
 * 
 * Note that this file is named after the page's slug, following the Wordpress
 * convention "page-{page_slug}.php".
 */

$resUri = get_template_directory_uri() . '/page-patches-2/';

// <link rel="stylesheet"> tags to be placed in <head>
//wp_enqueue_style('owl-patches-page_style_css', $resUri . 'style.css', array(), 5);
wp_enqueue_style('owl-patches-page_fonts_googleapis', 'http://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700|Montserrat:400,700');

// <script> tags to be placed in <head>
wp_enqueue_script('owl-patches-page_less',           $resUri . 'js3rdparty/less-1.2.1.min.js');
wp_enqueue_script('owl-patches-page_jquery',         $resUri . 'js3rdparty/jquery-1.7.1.min.js');
wp_enqueue_script('owl-patches-page_bootstrap_tabs', $resUri . 'js3rdparty/bootstrap-tabs.js');
wp_enqueue_script('owl-patches-page_socksjs',        $resUri . 'js3rdparty/sockjs-min-0.3.4.js');
wp_enqueue_script('owl-patches-page_knockout',       $resUri . 'js3rdparty/knockout-2.0.0.js');
wp_enqueue_script('owl-patches-page_jquery_knob',    $resUri . 'js3rdparty/jquery.knob.min.js');
wp_enqueue_script('owl-patches-page_knob',           $resUri . 'js/knob.js');
wp_enqueue_script('owl-patches-page_prettify',       'https://google-code-prettify.googlecode.com/svn/trunk/src/prettify.js');
wp_enqueue_script('owl-patches-page_run_prettify',   'https://google-code-prettify.googlecode.com/svn/loader/run_prettify.js');

// <script> tags to be placed just before </body>
wp_enqueue_script('owl-patches-page_vertxbus'              , $resUri . 'js/vertxbus.js', array(), false, true);
wp_enqueue_script('owl-patches-page_spreadsheet_client_app', $resUri . 'js/spreadsheet_client_app.js', array(), false, true);
wp_enqueue_script('owl-patches-page_spreadsheets_google',    'https://spreadsheets.google.com/feeds/list/1ocSb1dTeOm8YgeqDOAGsfLddZrGxzAbymuq0bz5ZQ3Q/od6/public/values?alt=json-in-script&callback=importGSS', array(), false, true);

?>

<?php Starkers_Utilities::get_template_parts( array( 'parts/shared/html-header', 'parts/shared/header' ) ); ?>

<div class="wrapper flexbox">

    <div id="breadcrumb"><?php the_breadcrumb(); ?></div>

    <div class="content-area">
        <div class="white-box">
            <h1>Patches</h1>

            <div id="secondary-nav-bar">
            
                <div id="secondary-nav-bar-content">
                
                  <!-- <div class="secondary-nav-item"> -->
                  <!--   <img src="<?= $resUri ?>images/browse-all-icon.png" width="40" height="40" alt="icon"> -->
                  <!--   <p>Browse all</p> -->
                  <!-- </div> -->
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
                <!-- <div class="secondary-nav-item"> -->
                <!--     <img src="<?= $resUri ?>images/my-patches-icon.png" width="40" height="40" alt="icon"> -->
                <!--     <p>My patches</p> -->
                <!-- </div> -->
                <!-- <div class="secondary-nav-item"> -->
                <!--     <img src="<?= $resUri ?>images/my-rigs-icon.png" width="40" height="40" alt="icon"> -->
                <!--     <p>My rigs</p> -->
                <!-- </div> -->
                    
                </div>
            </div>
                
            <div id="filter-bar" data-bind="if: search() != 'patch'">
              <div id="filter-wrapper" class="wrapper" data-bind="foreach: search() === 'author' ? authors : tags">
                <div class="tag-filter-button" 
                 data-bind="text: $data, click: selectFilter, css: { active: searchItems.indexOf($data) > -1 }">
                </div>
              </div>
            </div>
            
            <div class="wrapper">
            
                <!-- <div id="breadcrumb"></div> -->
                
                <div class="content-container">
            
                  <!-- ko if: selectedPatch -->
                    <div id="one-third" data-bind="with: selectedPatch">
                        <div class="patch-tile-small" id="sticker">
                            <table class="patch-title-controls">
                            <tr>
                                <td><span class="patch-title" data-bind="text: name"></span></td>
                                <!-- <td width="40"><div class="add-button"><span>+</span></div></td> -->
                            </tr>
                            <tr>
                                <td style="padding-top: 20px;">
                          <span class="author-name" data-bind="text: author, click: selectOnlyAuthor"></span>
                        </td>
                                <td>&nbsp;</td>
                            </tr>
                        </table>
                        </div>            
                        <div class="patch-description">
                            <p data-bind="text: description"></p>
                        </div>            
                        <div class="patch-stats">
                          <table width="100%">
                            <tr>
                              <td width="30%"><span class="parameter-label">Channels</span></td>
                              <td><p data-bind="text: (inputs + ' in / ' + outputs + ' out')"></p></td>
                            </tr>
                            <tr>
                              <td><span class="parameter-label">CPU</span></td>
                              <td><p data-bind="text: cycles"></p></td>
                            </tr>
                            <tr>
                              <td><span class="parameter-label">Memory</span></td>
                              <td><p data-bind="text: (bytes + ' / 1Mb')"></p></td>
                            </tr>
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
                    <div id="two-thirds">
                        <!-- Soundcloud embed here -->
                        <iframe width="100%" height="250" scrolling="no" frameborder="no" 
                        data-bind="if: soundcloud, attr: { src: soundcloud }">
                    </iframe>
                        <!--div class="clear"></div-->
                        <div class="" data-bind="with: selectedPatch">
                            <h2>Parameters</h2>
                            <div class="flexbox">
                              <div class="knob-container">
                                <input class="knob" data-angleOffset="-125" data-angleArc="250" data-displayInput="false"
                           data-fgColor="#ed7800" data-linecap="round" data-width="100%" 
                           data-rotation="clockwise" data-readOnly="true" value="35">
                                <p class="parameter-label" data-bind="text: parameters[0]"></p>
                              </div>
                              <div class="knob-container">
                                <input class="knob" data-angleOffset="-125" data-angleArc="250" data-displayInput="false" 
                           data-fgColor="#ed7800" data-linecap="round" data-width="100%" 
                           data-rotation="clockwise" data-readOnly="true" value="35">
                                <p class="parameter-label" data-bind="text: parameters[1]"></p>
                              </div>
                              <div class="knob-container">
                                <input class="knob" data-angleOffset="-125" data-angleArc="250" data-displayInput="false" 
                           data-fgColor="#ed7800" data-linecap="round" data-width="100%" 
                           data-rotation="clockwise" data-readOnly="true" value="35">
                                <p class="parameter-label" data-bind="text: parameters[2]"></p>
                              </div>
                              <div class="knob-container">
                                <input class="knob" data-angleOffset="-125" data-angleArc="250" data-displayInput="false" 
                           data-fgColor="#ed7800" data-linecap="round" data-width="100%" 
                           data-rotation="clockwise" data-readOnly="true" value="35">
                                <p class="parameter-label" data-bind="text: parameters[3]"></p>
                              </div>
                            </div>
                        </div>        
                        <div class="">
                            <h2>Patch code</h2>
                    <pre id="gitsource" class="prettyprint"></pre>
                        </div>                
                    </div>
                <!-- /ko -->
            
                  <!-- ko foreach: filteredPatches -->
                  <!-- Start of a tile here -->
                <div class="patch-tile">
                    <table class="patch-title-controls">
                      <tbody><tr>
                          <!-- <td width="40"><div class="play-button">&gt;</div></td> -->
                          <td><span class="patch-title" data-bind="text: name, click: selectPatch"></span></td>
                          <!-- <td width="40"><div class="add-button"><span>+</span></div></td> -->
                        </tr>
                        <tr>
                          <!-- <td>&nbsp;</td> -->
                          <td style="padding-top: 20px;">
                      <span class="author-name" data-bind="text: author, click: selectOnlyAuthor"></span>
                      </td>
                          <td>&nbsp;</td>
                        </tr>
                    </tbody></table>
                    <div class="patch-baseline">
                  <!-- ko foreach: tags -->
                      <div class="tag"><span data-bind="text: $data, click: selectOnlyTag"></span></div>
                  <!-- /ko -->
                      <!-- <span class="add-counter">215</span> -->
                    </div>
                  </div>
                    <!-- End of the tile -->
                <!-- /ko -->
                </div>
                
            </div>
        </div>
    </div>

    <div class="widget-area">
        <?php dynamic_sidebar( 'right_sidebar_1' ); ?>
    </div>

    <div class="clear"></div>

</div>

<?php Starkers_Utilities::get_template_parts( array( 'parts/shared/footer','parts/shared/html-footer') ); ?>
