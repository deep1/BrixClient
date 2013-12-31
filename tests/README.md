# Testing #

This is using the [mocha][] javascript test framework.  You can run it
in the browser or on command line using [Karma][] (once Testacular).

To run it out of the browser, drop /test/index.html into your browser
and the tests will run.  Any javascript files you'd like to test, as
well as their dependencies, should be referenced via script tags within
index.html.

To run it via command-line, you must have [node.js][], [phantomjs][], and
[karma][] installed.  All javascript files you'd like to test, as
well as their dependencies, should be referenced within `karma.conf.js`.
Generally, this will be the same thing as you'll put in index.html.
From within the test/ directory run
```
$ karma start karma.conf.js
```
This will run all of our tests using phantomjs.  It will then watch for
changes in all the js files referenced in `karma.conf.js` and all of the
html files in the main directory and re-run the tests when changes are
found.

The actual tests you'll find within the `/test/spec/` directory, generally
one spec file per javascript file you're testing.

Mocha allows you to use a number of assertion libraries; syntax for
your tests.  I've installed [chai][] only because
it was easy.  Chai has three different assertion styles, a [TDD][] style
and two [BDD][] styles.  BDD is more in vogue these days so I went with
that and chose 'expect' rather than 'should' only because 'should'
falls down when you run the tests in IE sometimes.

[mocha]: <http://visionmedia.github.io/mocha/> "feature-rich JavaScript test framework running on node and the browser"
[chai]: <http://chaijs.com> "Chai is a BDD / TDD assertion library for node and the browser"
[TDD]: <http://en.wikipedia.org/wiki/Test-driven_development> "Test-driven Development - wikipedia"
[BDD]: <http://en.wikipedia.org/wiki/Behavior-driven_development> "Behavior-driven Development - wikipedia"
[karma]: <http://karma-runner.github.io/0.8/index.html> "Karma Spectacular Test Runner for JavaScript"
[node.js]: <http://nodejs.org/> "node.js home page"
[phantomjs]: <http://phantomjs.org/> "phantom.js home page"

## Environment setup ##
### linux ###

Install node and phantomjs. 
The npm package depends on the nodejs package (among others).

    $ sudo apt-get install npm phantomjs

Then use npm (node package manager) to install karma:

    $ sudo npm install -g karma

## Testing iframes ##
When opening the test file from browser, you will run into security issues related with iframe not being able to load Javascript.
In Chrome console you will get an error message similar to 

"Not allowed to load local resource: file://.../PlayerProto/js/eventmanager_ex.js"

The workaround is to open the page from a web server.
In Mac, Python is pre-installed, so you can run the Python's simple web server

    $ python -m SimpleHTTPServer


Because of this, the iframe related tests are in a separate html file: test/iframe_tests.html.
