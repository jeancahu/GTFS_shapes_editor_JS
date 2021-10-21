#!/bin/bash

set -e

declare -r fonts_dir=styles/fonts

grep -c gtfs_shape_editor package.json || { echo 'Use me in the project root' ; exit 1 ; }
test -d src/shapeeditor || { echo 'Use me in the project root' ; exit 1 ; }
{ test -d $fonts_dir && echo '  Static shapeeditor directory found' ; } || mkdir $fonts_dir

which unzip || { echo 'Please install unzip first!!!' ; exit 1 ; }
which wget || { echo 'Please install wget first!!!' ; exit 1 ; }

cd $fonts_dir
wget 'https://fonts.google.com/download?family=Poppins' -O fonts.zip
unzip ./fonts.zip

exit $?
