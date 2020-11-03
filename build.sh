#!/bin/bash

node_modules/.bin/browserify \
js/streetElementAgency.js \
js/streetElementCalendar.js \
js/streetElementGroup.js \
js/streetElementLink.js \
js/streetElementNode.js \
js/streetElementRoute.js \
js/streetElementShape.js \
js/streetElementStopTime.js \
js/streetElementTrip.js \
js/app_main.js \
js/map_main.js \
js/overlay_toolbar.js \
--plugin tinyify --outfile lib/bundle.js

exit 0
