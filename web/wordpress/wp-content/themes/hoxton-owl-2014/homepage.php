<?php
/*
Template name: Home page
*/
?>

<?php Starkers_Utilities::get_template_parts( array( 'parts/shared/html-header', 'parts/shared/header' ) ); ?>

<div id="homepage-hero">

	<div class="wrapper">
		<h1>Introducing the OWL</h1>
		<div class="clear"></div>
		<p>an open source</p>
		<div class="clear"></div>
		<p>fully programmable</p>
		<div class="clear"></div>
		<p>FX pedal</p>
	</div>

</div>

<div class="wrapper flexbox">

	<div class="white-box">
		<?php if ( have_posts() ) while ( have_posts() ) : the_post(); ?>
		<?php the_content(); ?>
		<?php endwhile; ?>
	</div>

</div>

<?php Starkers_Utilities::get_template_parts( array( 'parts/shared/footer','parts/shared/html-footer' ) ); ?>