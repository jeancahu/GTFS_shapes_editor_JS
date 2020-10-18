# Shape editor
GTFS shapes editor made mainly in Javascript, using Openstreet map and TEMPLATE.co sheet styles.
The editor allows to add nodes who could represent *stops*, generic shapes points, *intersections* or *endpoints*, the last one are the shape points at the end and begin.
This software tries to become an easier tool to ingress GTFS data required to generate an basic zipped file, the same file we could create using a Calc Sheet but 
throug a webapp instead.

## How to use(develop):

    $ npm install express
    $ npm run serve

Here some examples:
[Editor preview](https://jeancahu.github.io/GTFS_shapes_editor_JS/index.html)
<img src="http://161.35.54.122:10066/gtfs_shape_editor.png" >

## TODO

* [ ] A photo for each stop in a shape
* [ ] Buttons style
* [ ] Select style
* [ ] Table columns href to manual definitions
* [ ] Explain how to add the editor to a web server
