'use strict';
module.exports = function ( grunt ) {

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),

        less: {
            build: {
                files: {
                    "bin/ng-awesome-table.css": "css/ng-awesome-table.less"
                }
            }
        },

        eslint: {
            options: {
                parser: 'babel-eslint'
            },
            target: ['js/ng-awesome-table.js']
        },

        babel: {
            options: {
                sourceMap: true,
                presets: ['es2015']
            },
            dist: {
                files: {
                    'bin/ng-awesome-table.js': 'js/ng-awesome-table.js'
                }
            }
        },

        uglify: {
            build: {
                options: {
                    sourceMap: true
                },
                files: {
                    'bin/ng-awesome-table.min.js': ['bin/ng-awesome-table.js']
                }
            }
        }
    });

    grunt.registerTask( 'build', ['less', 'eslint', 'babel', 'uglify']);
    grunt.registerTask( 'default', [ 'build' ] );
};
