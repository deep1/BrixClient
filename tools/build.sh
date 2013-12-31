#! /bin/bash

# This is a simple build script meant to run the Google closure compiler over the
# brix javascript source in this folder to produce a "brixlib-compiled.js" file.
# This script is intended to be run from the source folder (as the current directory).
#
# You may want to read the [Using ClosureBuilder][] page for more information on the
# tool being used here.
#
# To do this you will need the closure library and compiler.
# 1. create a folder "closure" as a sibling of this repo's folder
# 2. in that folder clone the closure library's git repository to closure-library
#    see [Closure Library Documentation][] for more info.
#     ```git clone https://code.google.com/p/closure-library/```
# 3. download the [latest closure compiler](http://closure-compiler.googlecode.com/files/compiler-latest.zip)
#    (The link to the latest compiler came from the [Closure Compiler][] page.
# 4. unzip it into a subfolder of the closure folder you created above which should be
#    named _closure-compiler_.
#    (when I got it, the zip contained 3 files: compiler.jar, README and COPYING)
# 5. flag this file and the closurebuilder.py file as executable
#
# [Using ClosureBuilder]: <https://developers.google.com/closure/library/docs/closurebuilder>
# [Closure Library Documentation]: <https://developers.google.com/closure/library/docs/overview>
# [Closure Compiler]: <https://developers.google.com/closure/compiler/>
#
# NOTE: Remember to remove the  fakeactivitydb.js in the real release.

# command to run the dependency writer from the js folder:
#../../closure/closure-library/closure/bin/build/depswriter.py --root_with_prefix=". ../../../../playerproto/js" > brixlib-deps.js

function getfullpath() {
  DIR=$(echo "${1%/*}")
  (cd "$DIR" && echo "$(pwd -P)")
}

REPODIR=".."
DEPSWRITER="${REPODIR}/../closure/closure-library/closure/bin/build/depswriter.py"
BUILDER="${REPODIR}/../closure/closure-library/closure/bin/build/closurebuilder.py"
COMPILER="${REPODIR}/../closure/closure-compiler/compiler.jar" 
LIBRARYDIR="${REPODIR}/../closure/closure-library/" 
OUTFILE="brixlib-compiled.js"
DEPSOUTFILE="brixlib-deps.js"
REPODIRNAME="`basename \`getfullpath $REPODIR\``"

declare -a COMPILER_ARGS=(\
	'--compilation_level=SIMPLE_OPTIMIZATIONS'\
	'--source_map_format=V3'\
	"--create_source_map=${OUTFILE}.map"\
	"--language_in=ECMASCRIPT5_STRICT"\
	"--warning_level=VERBOSE"\
	"--jscomp_warning=checkTypes"\
	"--jscomp_warning=accessControls"\
	"--jscomp_warning=const"\
	"--extra_annotation_name=abstract"\
	"--extra_annotation_name=virtual"\
	"--extra_annotation_name=note"\
	"--output_wrapper=(function(){%output%}).call(this);"
	"--externs=d3.v3.externs.js"\
	"--externs=jquery-1.8.externs.js"\
	"--generate_exports"\
	"--js=${LIBRARYDIR}closure/goog/deps.js"\
	)

declare -a BLDR_COMPILER_ARGS
numArgs=${#COMPILER_ARGS[*]}
for (( i = 0; i < $numArgs; ++i ))
do
	BLDR_COMPILER_ARGS=("${BLDR_COMPILER_ARGS[*]}" "--compiler_flags=${COMPILER_ARGS[$i]}");
done

BRIX_ARGS=$(cat <<EOF
	--input=answerman.js
	--input=answermanpolling.js
	--input=briclayer.js
	--input=bricworks.js
	--input=brix-labelcarousel.js
	--input=brix-labelselector.js
	--input=brix-pyramidchart.js
	--input=domhelper.js
	--input=eventmanager.js
	--input=ipc.js
	--input=ipsproxy.js
	--input=localanswerman.js
	--input=messagebroker.js
	--input=mortar-agestructure.js
	--input=mortar-base.js
	--input=mortar-dataswap.js
	--input=mortar-hilite.js
	--input=mortar-traceselection.js
	--input=mortar-waveform.js
	--input=submitmanager.js
	--input=widget-barchart.js
	--input=widget-base.js
	--input=widget-button.js
	--input=widget-callouts.js
	--input=widget-carousel.js
	--input=widget-checkgroup.js
	--input=widget-image.js
	--input=widget-imageviewer.js
	--input=widget-journal.js
	--input=widget-labelgroup.js
	--input=widget-linegraph.js
	--input=widget-legend.js
	--input=widget-markergroup.js
	--input=widget-multiplechoicequestion.js
	--input=widget-multiselectquestion.js
	--input=widget-numeric.js
	--input=widget-numericquestion.js
	--input=widget-piechart.js
	--input=widget-prototype-axes.js
	--input=widget-radiogroup.js
	--input=widget-selectgroup.js
	--input=widget-sketch.js
	--input=widget-slider.js
	--root=.
	--root=$LIBRARYDIR
	--output_mode=compiled
	--output_file=$OUTFILE
	--compiler_jar=$COMPILER
	${BLDR_COMPILER_ARGS[*]}
EOF
)

$BUILDER $BRIX_ARGS
$DEPSWRITER --root_with_prefix=". ../../../../$REPODIRNAME/js" --output_file=$DEPSOUTFILE

