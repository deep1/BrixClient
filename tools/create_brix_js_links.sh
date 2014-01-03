#! /bin/bash

# Call this script w/ the path to the repository directory
# It defaults to the path on my system.

# create the needed js symlinks in the current working directory:
# brixlib-compiled.js
# brixlib-deps.js
# d3.v3.min.js
# pearson
# closure-library
#
# This supports a brix html page referencing either:
#   <script src="js/d3.v3.min.js"></script>
# and
# either
#   <script src="js/brixlib-compiled.js"></script>
# or
#   <script src="js/closure-library/closure/goog/base.js"></script>
#   <script src="js/brixlib-deps.js"></script>
#   <script>
#     goog.require('pearson.brix.BricLayer');
#   </script>

REPODIR=~/Projects/pearson/brixclient/
REPODIR=${1:-$REPODIR}

# echo the relative path from $1 to $2
function getrelpath() {
    local common_part=$1
    local back=
    while [ "${2#$common_part}" = "$2" ]
    do
      common_part=$(dirname $common_part)/
      back="../${back}"
    done
    echo ${back}${2#$common_part}
}

function getfullpath() {
  local DIR=$(echo "${1%/*}")
  (cd "$DIR" && echo "$(pwd -P)")
}

WD=`echo "$(pwd -P)"`
ABS_REPODIR=`getfullpath $REPODIR`

declare -a TARGETS=(\
        ${ABS_REPODIR}/build/brixlib-compiled.js\
        ${ABS_REPODIR}/build/brixlib-deps.js\
        ${ABS_REPODIR}/src/third_party/d3.v3.min.js\
        ${ABS_REPODIR}/src/pearson\
        ${ABS_REPODIR}/tools/closure-library\
    )

for t in "${TARGETS[@]}"
do
    rm `basename $t`
    ln -s `getrelpath $WD $t` `basename $t`
done
