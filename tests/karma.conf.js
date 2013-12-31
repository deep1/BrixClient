// Karma configuration
// Generated on Tue Jun 04 2013 15:47:23 GMT-0400 (EDT)


// base path, that will be used to resolve files and exclude
basePath = '';


// list of files / patterns to load in the browser
files = [
  MOCHA,
  MOCHA_ADAPTER,
    // watch these for changes but don't load them
    {pattern: '../*.html', watched: true, included: false, served: false},
    {pattern: 'karma.conf.js', watched: true, included: false, served: false},
    // load the following (and watch for changes)
    'lib/chai.js',
    'helper.js',
    '../js/d3.v3.min.js',
    '../js/eventmanager.js',
    '../js/widget-base.js',
    '../js/widget-linegraph.js',
    '../js/widget-image.js',
    '../js/widget-carousel.js',
    '../js/widget-sketch.js',
    '../js/submitmanager.js',
    // spec files below here
    'spec/widget-base-spec.js',
    'spec/widget-linegraph-spec.js',
    'spec/widget-carousel-spec.js',
    'spec/widget-sketch-spec.js',
    'spec/submitmanager-spec.js'
];


// list of files to exclude
exclude = [
  
];


// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['progress'];


// web server port
port = 1338;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['PhantomJS'];


// If browser does not capture in given timeout [ms], kill it
captureTimeout = 60000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
