<?php
/*
Template name: Rig builder (simple)
*/
?>

<?php Starkers_Utilities::get_template_parts( array( 'parts/shared/html-header', 'parts/shared/header' ) ); ?>

<div class="wrapper flexbox">

    <div id="breadcrumb"><?php the_breadcrumb(); ?></div>

    <div class="content-area">
        <div class="white-box">

			<?php if ( have_posts() ) while ( have_posts() ) : the_post(); ?>
			<h1><?php the_title(); ?></h1>

			<div style="clear:both; margin-bottom: 30px;"></div>

			<form id="rig-builder-attributes">
				<label for="active-channel"><span class="parameter-label">ACTIVE CHANNEL</span></label>
				<select id="active-channel">
					<option value="red">Red</option>
					<option value="green">Green</option>
				</select>

				<label for="series"><span class="parameter-label" style="margin-left: 50px;">SERIES</span></label>
				<select id="series">
					<option value="parallel">Parallel</option>
					<option value="dual">Dual mode</option>
					<option value="series">Series</option>
					<option value="dual">Single mode</option>
				</select>
			</form>

			<div style="clear:both; margin-bottom: 30px;"></div>

			<span class="parameter-label active-channel-indicator red"></span>
			<div class="rig-builder-tile-container">
	          	<!-- Start of a tile here -->
	                <div class="patch-tile rig-builder-tile">
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
	        </div>

			<?php the_content(); ?>
			<?php endwhile; ?>

		</div>
	</div>

	<div class="widget-area">
		<?php dynamic_sidebar( 'right_sidebar_1' ); ?>
	</div>

	<div class="clear"></div>

</div>

<?php Starkers_Utilities::get_template_parts( array( 'parts/shared/footer','parts/shared/html-footer' ) ); ?>