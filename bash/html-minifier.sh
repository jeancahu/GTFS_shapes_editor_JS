#!/bin/bash

npx html-minifier \
--collapse-whitespace \
--remove-comments \
--remove-optional-tags \
--remove-redundant-attributes \
--remove-script-type-attributes \
--remove-tag-whitespace \
--use-short-doctype \
-o ./dist/index.html \
index.html

exit $?
