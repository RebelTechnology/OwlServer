<?php
/**
 * Skin file for the Hoxton OWL 2014 skin.
 *
 * @file
 * @ingroup Skins
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

/**
 * SkinTemplate class for the Hoxton OWL 2014 skin
 *
 * @ingroup Skins
 */
class SkinHoxtonOWL2014 extends SkinTemplate {

    public $skinname = 'hoxtonowl2014',
           $stylename = 'HoxtonOWL2014',
           $template = 'HoxtonOWL2014Template',
           $useHeadElement = true;

    /**
     * Add CSS via ResourceLoader
     *
     * @param $out OutputPage
     */
    function setupSkinUserCss( OutputPage $out ) {

        parent::setupSkinUserCss( $out );
        
        $out->addModuleStyles( array(
            'mediawiki.skinning.interface', 'skins.hoxtonowl2014'
        ) );

        $out->addHeadItem(
            'hoxton-owl-2014/meta/X-UA-Compatible',
            '<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">'
        );

        $out->addHeadItem(
            'hoxton-owl-2014/meta/viewport',
            '<meta name="viewport" content="width=device-width, initial-scale=1.0"><!-- Remove if you\'re not building a responsive site. (But then why would you do such a thing?) -->'
        );

        $out->addHeadItem(
            'hoxton-owl-2014/css/google-fonts',
            "<link href='http://fonts.googleapis.com/css?family=Ubuntu:100,300,400,500,700|Montserrat:400,700' rel='stylesheet' type='text/css'>"
        );

    }
}

/**
 * BaseTemplate class for the Hoxton OWL 2014 skin
 *
 * @ingroup Skins
 */
class HoxtonOWL2014Template extends BaseTemplate {

    const WP_THEME_BASE_URL = '/wp-content/themes/hoxton-owl-2014/';

    /**
     * Outputs a single sidebar portlet of any kind.
     */
    private function outputPortlet( $box ) {
        if ( !$box['content'] ) {
            return;
        }

        ?>
        <div
            role="navigation"
            class="mw-portlet"
            id="<?php echo Sanitizer::escapeId( $box['id'] ) ?>"
            <?php echo Linker::tooltip( $box['id'] ) ?>
        >
            <h3>
                <?php
                if ( isset( $box['headerMessage'] ) ) {
                    $this->msg( $box['headerMessage'] );
                } else {
                    echo htmlspecialchars( $box['header'] );
                }
                ?>
            </h3>

            <?php
            if ( is_array( $box['content'] ) ) {
                echo '<ul>';
                foreach ( $box['content'] as $key => $item ) {
                    echo $this->makeListItem( $key, $item );
                }
                echo '</ul>';
            } else {
                echo $box['content'];
            }?>
        </div>
        <?php
    }

    /**
     * Outputs the entire contents of the page
     */
    public function execute() {
        $this->html( 'headelement' ) ?>

        <?php /* HEADER */ ?>

        <header>
            <div id="primary-nav-bar">
                <div id="primary-nav-container">
                    <a href="<?php echo get_option('home'); ?>"><img id="logo" src="<?php echo get_bloginfo('template_directory');?>/images/logo.png" alt="Hoxton Owl"></a>
                    <ul id="primary-nav-items">
                        <?php wp_nav_menu( array( 'container_class' => 'main-nav', 'theme_location' => 'primary' ) ); ?>
                    </ul>
                    <ul id="reg-signin-items">
                        <!--<li><a href="#">Register</a></li>
                        <li><a href="#">Sign in</a></li>-->
                        <li><a href="http://www.rebeltech.org/shop/" class="order-button">Order</a></li>
                    </ul>
                </div>
            </div>
        </header>

        <?php /* CONTENT */ ?>

        <div class="wrapper flexbox">

            <div id="breadcrumb">
                <ul id="breadcrumbs">
                    <li>
                        <a href="/">Home</a>
                    </li>
                    <li class="separator"> / </li>
                    <li>
                        <a href="/mediawiki">Documentation</a>
                    </li>

                    <li class="separator"> / </li>
                    <li>
                        <strong><?= $this->getSkin()->getTitle(); ?></strong>
                    </li>
                </ul>
            </div>

            <div class="content-area">
                <div class="white-box">

                    <div class="mw-body" role="main">

                        <?php if ( $this->data['sitenotice'] ) { ?>
                            <div id="siteNotice"><?php $this->html( 'sitenotice' ) ?></div>
                        <?php } ?>

                        <?php if ( $this->data['newtalk'] ) { ?>
                            <div class="usermessage"><?php $this->html( 'newtalk' ) ?></div>
                        <?php } ?>

                        <h1 class="firstHeading">
                            <span dir="auto"><?php $this->html( 'title' ) ?></span>
                        </h1>

                        <div class="mw-body-content">
                            <div id="contentSub">
                                <?php if ( $this->data['subtitle'] ) { ?>
                                    <p><?php $this->html( 'subtitle' ) ?></p>
                                <?php } ?>
                                <?php if ( $this->data['undelete'] ) { ?>
                                    <p><?php $this->html( 'undelete' ) ?></p>
                                <?php } ?>
                            </div>

                            <?php $this->html( 'bodytext' ) ?>

                            <?php $this->html( 'catlinks' ) ?>

                            <?php $this->html( 'dataAfterContent' ); ?>

                        </div>
                    </div>

                </div>
            </div>

            <div class="widget-area">

            <div id="mw-navigation">
                <?php /*<h2><?php $this->msg( 'navigation-heading' ) ?></h2> */ ?>

                <form
                    action="<?php $this->text( 'wgScript' ) ?>"
                    role="search"
                    class="mw-portlet"
                    id="p-search"
                >
                    <input type="hidden" name="title" value="<?php $this->text( 'searchtitle' ) ?>" />

                    <h3><label for="searchInput">Search documentation</label></h3>

                    <?php echo $this->makeSearchInput( array( "id" => "searchInput" ) ) ?>
                    <?php echo $this->makeSearchButton( 'go' ) ?>

                </form>

                <?php

                $this->outputPortlet( array(
                    'id' => 'p-variants',
                    'headerMessage' => 'variants',
                    'content' => $this->data['content_navigation']['variants'],
                ) );
                $this->outputPortlet( array(
                    'id' => 'p-views',
                    'headerMessage' => 'views',
                    'content' => $this->data['content_navigation']['views'],
                ) );
                $this->outputPortlet( array(
                    'id' => 'p-actions',
                    'headerMessage' => 'actions',
                    'content' => $this->data['content_navigation']['actions'],
                ) );

                foreach ( $this->getSidebar() as $boxName => $box ) {
                    $this->outputPortlet( $box );
                }

                $this->outputPortlet( array(
                    'id' => 'p-personal',
                    'headerMessage' => 'personaltools',
                    'content' => $this->getPersonalTools(),
                ) );

                /* $this->outputPortlet( array(
                    'id' => 'p-namespaces',
                    'headerMessage' => 'namespaces',
                    'content' => $this->data['content_navigation']['namespaces'],
                ) ); */

                ?>
            </div>

                <?php dynamic_sidebar( 'right_sidebar_1' ); ?>
            </div>

            <div class="clear"></div>

        </div>

        <?php /* END CONTENT */ ?>

        <?php /* FOOTER */ ?>

        <footer>
            <div id="footer-bar">
                <p>
                    <?php foreach ( $this->getFooterIcons( 'icononly' ) as $blockName => $footerIcons ) { ?>
                        <?php
                        foreach ( $footerIcons as $icon ) {
                            echo $this->getSkin()->makeFooterIcon( array_merge($icon, array('style' => 'display: inline; margin: 0; vertical-align: middle; margin: 0 10px;')) );
                        }
                        ?>
                    <?php } ?>
                    Copyright Hoxton Owl 2014
                </p>
            </div>
        </footer>

        <?php $this->printTrail() ?>
        </body></html>

        <?php
    }
}
