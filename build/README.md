Build Folder
============

The ```build``` folder is for build output files.

It currently is where these files are create:

    brixlib-compiled.js
    brixlib-compiled.js.map
    brixlib-deps.js
    build.log

The ```build.log``` contains a record of the compiler stderr and stdout output from the last
make of ```brixlib-compiled.js```.

Most (currently all) of the files in this folder are created by targets in the ```Makefile```
in the root of the BrixClient repository.
