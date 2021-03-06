module.exports = function(grunt) {
	'use strict';
	grunt.initConfig({
		'connect': {
			'server': {
				'options': {
					'port': 8080,
					'base': '.',
					'keepalive': true
				}
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.registerTask('server', ['connect']);
};