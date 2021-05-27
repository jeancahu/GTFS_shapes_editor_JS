#!/bin/bash

set -e

declare -r vendor_dir=src/shapeeditor/static/shapeeditor/vendor

grep -c gtfs_shape_editor package.json || { echo 'Use me in the project root' ; exit 1 ; }
test -d src/shapeeditor || { echo 'Use me in the project root' ; exit 1 ; }

test -d node_modules || { echo 'I need the node_modules/ locally to do my job' ; exit 1 ; }

{ test -d $vendor_dir && echo '  Static shapeeditor directory found' ; } || mkdir $vendor_dir

mkdir $vendor_dir/{css,js}    || echo '' >/dev/null
mkdir $vendor_dir/css/{ol,bt} || echo '' >/dev/null
mkdir $vendor_dir/js/bt       || echo '' >/dev/null

## OpenLayers CSS
for VENDOR_FILE in \
    node_modules/ol/ol.css \
    node_modules/ol/LICENSE.md
do echo "Copy $VENDOR_FILE to $vendor_dir/css/ol"
   cp $VENDOR_FILE $vendor_dir/css/ol
done

## Bootstrap CSS
for VENDOR_FILE in \
    node_modules/bootstrap/dist/css/bootstrap.min.css \
    node_modules/bootstrap/LICENSE
do echo "Copy $VENDOR_FILE to $vendor_dir/css/bt"
   cp $VENDOR_FILE $vendor_dir/css/bt
done

## Bootstrap JS
for VENDOR_FILE in \
    node_modules/bootstrap/dist/js/bootstrap.bundle.min.js \
    node_modules/bootstrap/LICENSE
do echo "Copy $VENDOR_FILE to $vendor_dir/js/bt"
   cp $VENDOR_FILE $vendor_dir/js/bt
done


