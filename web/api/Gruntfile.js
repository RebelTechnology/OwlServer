'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [ 'Gruntfile.js', 'api-settings.js', 'app.js', 'lib/*.js', 'routes/*.js', 'models/*.js' ]
        },

        mochaTest: {
            test: {
                options: {
                    quiet: false,
                    clearRequireCache: false
                },
                src: [ 'test/*.js' ]
            }
        },

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');

    // Default to tasks to run with the "grunt" command.
    grunt.registerTask('default', [ 'jshint', 'mochaTest' ]);

};
