# GTFS Shape Web Editor

GTFS Editor, Django App

GTFS Shape Editor uses Vue, OpenLayers/OpenStreetMap and Bootstrap.
Editor shows a map where you can draw and route shapes, place stops. The data is bind to GTFS tables through Vue, you can edit the data in the tables just under the map.

## How to use from repository ( very alpha ):

    $ npm install .
    $ npm run debug
    $ bash bash/vendor-dep.sh
    $ pip install .    # Use a virtual env

Add the app 'shapeeditor' in Django settings

    INSTALLED_APPS = [
        ...
        'shapeeditor',
        ...
    ]

    SHAPEEDITOR_MAP_EXTENT_AREA = '[1,2,3,4]'
    SHAPEEDITOR_ROUTING_MACHINE_URL = 'example.com'

include apps urls in urls.py

    urlpatterns = [
        path('shapeeditor/', include('shapeeditor.urls')),
    ]

Here some live examples:
[Editor preview](http://161.35.54.122:10066/new/shape_editor/index.html)
<img src="http://161.35.54.122:10066/gtfs_editor.png" >

