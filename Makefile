#
# Makefile to build and test the brixclient
#

# Search path for targets and prerequisites
#VPATH = src

DEPSWRITER = tools/closure-library/closure/bin/build/depswriter.py
BUILDER = tools/closure-library/closure/bin/build/closurebuilder.py
BUILDER_ARGS = \
	--root=src/pearson \
	--root=src/goog \
	--root=src/third_party/closure/goog \
	--output_mode=compiled \
	--output_file=$(brixlib_compiled) \
	--compiler_jar=$(COMPILER)
BUILDER_LOG = build/build.log

COMPILER = tools/closure-compiler/compiler.jar
COMPILER_ARGS = \
	'--compilation_level=SIMPLE_OPTIMIZATIONS' \
	'--source_map_format=V3' \
	"--create_source_map=$(brixlib_compiled).map" \
	"--language_in=ECMASCRIPT5_STRICT" \
	"--warning_level=VERBOSE" \
	"--jscomp_warning=checkTypes" \
	"--jscomp_warning=accessControls" \
	"--jscomp_warning=const" \
	"--extra_annotation_name=abstract" \
	"--extra_annotation_name=virtual" \
	"--extra_annotation_name=note" \
	"--output_wrapper=(function(){%output%}).call(this);" \
	"--externs=src/externs/d3.v3.externs.js" \
	"--externs=src/externs/jquery-1.8.externs.js" \
	"--generate_exports" \
	"--js=src/goog/deps.js"
BUILDER_COMPILER_ARGS = $(patsubst %,--compiler_flags=%,$(COMPILER_ARGS))

brixlib_compiled = build/brixlib-compiled.js
brixlib_deps = build/brixlib-deps.js
brixlib_sources = \
	src/pearson/brix/briclayer.js \
	src/pearson/brix/bricworks.js \
	src/pearson/brix/brix-labelcarousel.js \
	src/pearson/brix/brix-labelselector.js \
	src/pearson/brix/brix-pyramidchart.js \
	src/pearson/brix/widget-barchart.js \
	src/pearson/brix/widget-base.js \
	src/pearson/brix/widget-button.js \
	src/pearson/brix/widget-callouts.js \
	src/pearson/brix/widget-carousel.js \
	src/pearson/brix/widget-checkgroup.js \
	src/pearson/brix/widget-image.js \
	src/pearson/brix/widget-imageviewer.js \
	src/pearson/brix/widget-journal.js \
	src/pearson/brix/widget-labelgroup.js \
	src/pearson/brix/widget-linegraph.js \
	src/pearson/brix/widget-legend.js \
	src/pearson/brix/widget-markergroup.js \
	src/pearson/brix/widget-multiplechoicequestion.js \
	src/pearson/brix/widget-multiselectquestion.js \
	src/pearson/brix/widget-numeric.js \
	src/pearson/brix/widget-numericquestion.js \
	src/pearson/brix/widget-piechart.js \
	src/pearson/brix/widget-prototype-axes.js \
	src/pearson/brix/widget-radiogroup.js \
	src/pearson/brix/widget-selectgroup.js \
	src/pearson/brix/widget-sketch.js \
	src/pearson/brix/widget-slider.js \
	src/pearson/brix/mortar/mortar-agestructure.js \
	src/pearson/brix/mortar/mortar-base.js \
	src/pearson/brix/mortar/mortar-dataswap.js \
	src/pearson/brix/mortar/mortar-hilite.js \
	src/pearson/brix/mortar/mortar-traceselection.js \
	src/pearson/brix/mortar/mortar-waveform.js \
	src/pearson/brix/utils/answerman.js \
	src/pearson/brix/utils/answermanpolling.js \
	src/pearson/brix/utils/ipc.js \
	src/pearson/brix/utils/ipsproxy.js \
	src/pearson/brix/utils/localanswerman.js \
	src/pearson/brix/utils/submitmanager.js \
	src/pearson/utils/domhelper.js \
	src/pearson/utils/eventmanager.js \
	src/pearson/utils/messagebroker.js

.DELETE_ON_ERROR :
.PHONY : all build doc test

all : build doc

build : $(brixlib_compiled) $(brixlib_deps)

$(brixlib_compiled) : $(brixlib_sources)
	python $(BUILDER) $(BUILDER_ARGS) $(BUILDER_COMPILER_ARGS) $(brixlib_sources:%=--input=%) 2>&1 | tee $(BUILDER_LOG)

$(brixlib_deps) : $(brixlib_sources)
	python $(DEPSWRITER) --root_with_prefix="src/pearson ../pearson" --output_file=$(brixlib_deps)

doc :

test :


