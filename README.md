# GTFS Shape Editor Django-App

Webapp which uses Vue, OpenLayers/OpenStreetMap, sweetalert2 and Bootstrap.
Editor shows a map where you can draw and route shapes, place stops and edit the properties in the tables just below.

## Install
```bash
pip install shapeeditor
```

Add the app 'shapeeditor' in your Django project settings file

```python
INSTALLED_APPS = [
    ...
    'shapeeditor',
    ...
]
```

Shapeeditor needs authentication to edit the data, define the LOGIN\_URL variable to know where redirect if visitor is not logged.

```python
LOGIN_URL='/admin/login/'

# First point map extent area [longitude, latitude]
#       +++++++++
#       +       +
#       +  Map  +
#       +       +
# --->  @++++++++

# Second point map extent area [longitude, latitude]
# ++++++++@ <---
# +       +
# +  Map  +
# +       +
# +++++++++

SHAPEEDITOR_MAP_EXTENT_AREA = [
    [-84.43669241118701, 9.726525930153954],
    [-83.72894500499169, 9.99625455768836]]

# Center by default on load [longitude, latitude]
SHAPEEDITOR_MAP_CENTER = [-84.1027104, 9.865107]

# Router service for shape generation request (This one is a free demo)
SHAPEEDITOR_ROUTING_MACHINE_URL = "http://router.project-osrm.org/route/v1/driving/" 
```

Include Shapeeditor urls in urls.py, then we can open the editor from the site, draw the shape and download as a shapes.txt or import it to the database.

```python
urlpatterns = [
    path('shapeeditor/', include('shapeeditor.urls')),
]
```

Just to be sure database is ok run the next commands.
```bash
./manage.py makemigrations
./manage.py migrate
```

## Usage

Map interface allows the user to draw a shape, cut links and delete links and nodes, to create a shape you need to define two _endpoints_ then put _waypoints_ between the begin and end, more waypoints means better aproximation.

Most of the features are already implemented in JS but there is not a GUI equivalent to call for methods yet.

Shapes are made with nodes, nodes have a type, it could be _endpoint_ for start or end of shapes, _stops_, these can be part of the shape too, _fork_ are the nodes where are more than two links, _waypoint_ are the common nodes. To create a Shape first draw paths clicking on map with the interaction _add\_node_, when you already have a connection between two _endpoints_ through multiple nodes and links add a Shape in the section below, once added the shape pick the waypoints with _select\_node_ + Shift, when you pick a _waypoint_ and it is in a shape segment, the whole segment is selected, pick only _waypoints_ their segments are in the shape.

Pick waypoints from the start node to the final node, keep the waypoints in order to avoid backward motion, when you pick a waypoint the section>accordion for the shape we are adding the waypoints will show the waypoints list, when the the waypoints are enough click on **save** button to write the shape, then push it to database.

### Hide and show elements on map

https://user-images.githubusercontent.com/18200186/135690366-f2075476-8246-4764-a464-fca59e1b1a7d.mp4

### Add and delete nodes

https://user-images.githubusercontent.com/18200186/135690845-87f48d78-453e-4da0-bfb4-e5fdbf25e1f2.mp4

### Remove and split links

https://user-images.githubusercontent.com/18200186/135691010-26e44323-4f7c-47ae-8822-450c01d793de.mp4

## Uninstall
Just delete all the mentions in settings.py and remove the package from your Python libs
```bash
pip uninstall shapeeditor
```

## How to contribute
PR are welcome.

Here some screenshots: </br>
<p align="center">
    <img src="https://user-images.githubusercontent.com/18200186/135689334-b3d4d58a-6f20-409e-8985-9118480342c5.png">
</p>
