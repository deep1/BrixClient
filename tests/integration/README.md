/test/integration/ Information

The html pages with 'demo' in the title here demonstrate various integration scenarios,
with local installations of the various server components or with the Dev Cloud
environment.

The demo-boilerplate.js file allows for local integration tests.
The demo-aws-dev-boilerplate.js file allows for testing against the Dev Cloud env.

We will eventually be referencing a local copy of the compiled brix library within
these demo files, /test/integration/brixlib-compiled.js, for the convenience of those
wishing to avoid compiling the library itself.  However, please check the update
date on this file and compare it to the commit of the feature you wish to test for
unless you compile it yourself there is no guarantee this lib is up to date.
