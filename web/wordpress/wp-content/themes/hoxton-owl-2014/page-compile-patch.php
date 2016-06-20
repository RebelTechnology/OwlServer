<?php
/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 *
 * This is the template for the 'Patches' page.
 *
 * Note that this file is named after the page's slug, following the Wordpress
 * convention "page-{page_slug}.php".
 */

$resUri = get_template_directory_uri() . '/page-compile-patch/';

// <link rel="stylesheet"> tags to be placed in <head>
wp_enqueue_style('owl-patches-page_style_css', $resUri . 'style.css', array(), 5);
wp_enqueue_style('jquery-ui-style', get_template_directory_uri() . '/js/jquery-ui-1.11.4.custom/jquery-ui.min.css');
wp_enqueue_style('jquery-ui-style-structure', get_template_directory_uri() . '/js/jquery-ui-1.11.4.custom/jquery-ui.structure.min.css');
wp_enqueue_style('jquery-ui-style-theme', get_template_directory_uri() . '/js/jquery-ui-1.11.4.custom/jquery-ui.theme.min.css');
//wp_enqueue_style('select2', get_template_directory_uri() . '/js/select2/css/select2.min.css');

// <script> tags to be placed in <head>
wp_enqueue_script('owl-patches-page_knockout',      $resUri . 'js3rdparty/knockout-2.0.0.js');
wp_enqueue_script('jquery',                         $resUri . 'js3rdparty/jquery-1.7.1.min.js');
wp_enqueue_script('jquery-ui',                      get_template_directory_uri() . '/js/jquery-ui-1.11.4.custom/jquery-ui.min.js', array('jquery'));
wp_enqueue_script('owl-patches-page_jquery_knob',   $resUri . 'js3rdparty/jquery.knob.min.js', array('jquery'));
wp_enqueue_script('owl-patches-page_knob',          $resUri . 'js/knob.js');

wp_enqueue_script('owl-patches-page_prettify',      'https://google-code-prettify.googlecode.com/svn/trunk/src/prettify.js');
wp_enqueue_script('owl-patches-page_run_prettify',  'https://google-code-prettify.googlecode.com/svn/loader/run_prettify.js');

//wp_enqueue_script('select2', get_template_directory_uri() . '/js/select2/js/select2.min.js', array('jquery'));


wp_enqueue_script('midi-client',                    $resUri . 'js/midiclient.js');
wp_enqueue_script('owl-midi-control',               $resUri . 'js/OpenWareMidiControl.js');
wp_enqueue_script('owl-cmd',                        $resUri . 'js/owlcmd.js');

// <script> tags to be placed just before </body>
wp_enqueue_script('owl-api-client',                 get_template_directory_uri() . '/js/hoxtonowl-api-client.js', array('jquery'), false, true);
wp_enqueue_script('owl-patch',                      get_template_directory_uri() . '/js/hoxtonowl-patch.js', array(), false, true);
wp_enqueue_script('owl-patches-page_patch_manager', $resUri . 'js/patchManager.js', array('jquery', 'jquery-ui', 'owl-patch', 'owl-api-client'), false, true);
wp_enqueue_script('pd-fileutils',                   $resUri . 'js3rdparty/pd-fileutils-latest.min.js', ['owl-patches-page_patch_manager'], false, true);
wp_enqueue_script('ace',                 			get_template_directory_uri() . '/js/ace/ace.js', array(), false, true);
wp_enqueue_script('ace-autocompleter',             get_template_directory_uri() . '/js/ace/ext-language_tools.js', array('ace'), false, true);

?>

<?php Starkers_Utilities::get_template_parts( array( 'parts/shared/html-header', 'parts/shared/header' ) ); ?>

<h1>Owl Patch Editor</h1>

<div id="compile-buttons" style="text-align:center;margin:10px auto">
	<button id="load-patch-button">load</button>
	<button id="upload-patch-button">upload</button>
	<button id="compile-patch-button">compile</button>
	<form id="test-form">
		<input id="file-input" type="file"></input>
		<button type="submit"></button>
	</form>
</div>

<div id="ace-editor-wrapper" style="position:relative;width:100%;height:100%;">
	<div id="ace-editor" style="position:absolute;width:100%;height:100%;"></div>
</div>

<?php Starkers_Utilities::get_template_parts( array( 'parts/shared/footer','parts/shared/html-footer') ); ?>

<script>
	$(function(){
	
		var editor;
		
		editor = ace.edit('ace-editor');
		
		ace.require("ace/ext/language_tools");
		
		// set syntax mode
		editor.session.setMode('ace/mode/c_cpp');
		editor.$blockScrolling = Infinity;
		
		// set theme
		editor.setTheme("ace/theme/chrome");
		editor.setShowPrintMargin(false);
		
		// autocomplete settings
		editor.setOptions({
			enableBasicAutocompletion: true,
			enableLiveAutocompletion: true,
			enableSnippets: true
		});
		
		// this function is called when the user modifies the editor
		editor.session.on('change', (e) => {
			console.log('editor changed');
		});
		
		$('#test-form').on('submit', function(e){
			console.log($('#file-input')[0].files[0]);
			e.preventDefault();
		});
		
		// compile-buttons events
		$('#load-patch-button').on('click', function(e){
		
			var fileUrl = '/wp-content/uploads/patch-files/tmp-470b6dc4c3/test.cpp';
			
			console.log('requesting from', fileUrl);
			
			$.get( fileUrl, function( data ) {
				editor.setValue(data);
			});
		
		});
		$('#upload-patch-button').on('click', function(e){
		
			// get the content from the editor as a string
			var string = editor.getValue();
			
			//upload it here
			upload(string);
			
			
			
			
		});
		
		$('#compile-patch-button').on('click', function(e){
		
			// get the content from the editor as a string
			var file = editor.getValue();
			
			//upload it here
			
			
		});
		
	});
	
	function upload(string){
	
		
	
		var fileUploadToken = '';
		var bag = 'abcdefghijklmnopqrstuvwxyz0123456789';
		for (var i = 0; i < 7; i++) {
			fileUploadToken += bag.charAt(Math.floor(Math.random() * bag.length));
		}
		
		var blob = new Blob([string]);
		var file = new File([blob], 'test.cpp');
	
		var data = new FormData();
		//var files = fileUpload[0].files;
		//for (var i = 0; i < files.length; i++) {
		   data.append('files[]', file);
		//}
		

		var patchId = '5767ef6884522c960779e73b';//$('#frm-patch-id').val();
		if (patchId) {
		   data.append('patchId', patchId);
		} else {
		   data.append('fileUploadToken', fileUploadToken);
		}

		data.append('action', 'owl-patch-file-upload'); // WordPress action

		$.ajax({
		   url: '/wp-admin/admin-ajax.php',
		   type: 'POST',
		   contentType: false,
		   data: data,
		   processData: false,
		   cache: false
		}).done(function(){
			console.log('done');
		});
		
	
	}
	
	
	
	
</script>
