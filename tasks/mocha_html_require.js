module.exports = function (grunt) {
    var path = require('path'),
        ejs  = require('ejs');

    var _ = grunt.util._;

    var taskName        = 'mocha_html_require',
        taskDescription = 'generate html for mocha browser test.',
        taskDir         = 'node_modules/grunt-mocha-html-require';

    grunt.file.defaultEncoding = 'utf8';
    var template = grunt.file.read(path.join(taskDir, '/template/runner.html.ejs'));

    grunt.registerMultiTask(taskName, taskDescription, function () {

        var target = this.target,
            config = grunt.config(taskName)[target],

            checkLeaks = (config.checkLeaks === false ? false : true),

            autoClean = config.autoClean || false,

            htmlPath = config.html || 'test/' + target + '.html',
            dirname  = path.dirname(htmlPath),

            assert     = config.assert || 'assert',
            assertPath = 'node_modules/' + assert + '/' + assert + '.js',

	    requireConfigPath = config.requireConfig,
	    
            testPaths = config.test.length ?
                _.map(
                    _.flatten(_.map(config.test, function (path) { return grunt.file.expand(path); })),
                    stripJsCoffeeExtension
                ): [];

        if (!htmlPath) {
            throw new Error('invalid html path.');
        }
        if (!grunt.file.exists(assertPath)) {
            throw new Error('assert module is not found. [' + assertPath + ']');
        }

        var html = ejs.render(template, {
            title      : config.title || target,
            checkLeaks : checkLeaks,
            cssPath    : path.relative(dirname, 'node_modules/mocha/mocha.css'),
            mochaPath  : path.relative(dirname, 'node_modules/mocha/mocha.js'),
	    requireConfigPath: path.relative(dirname, requireConfigPath),
            requirePath: path.relative(dirname, 'node_modules/requirejs/require.js'),
            assertPath : path.relative(dirname, assertPath),
            testPaths   : _.map(testPaths, function (testPath) {
		// This is entirely dependent on the contents of the require config!
                return "../../" + testPath;
            })
        });

        grunt.file.write(htmlPath, html);

        if (autoClean) {
            grunt.file.write(htmlPath);
        }
    });
};


function stripJsCoffeeExtension (path) {
    return path.replace(/\.(?:js|coffee)$/, "");
}

function oneLessParentDirectory (path) {
    return path.replace(/^\.\.\//, "");
}
