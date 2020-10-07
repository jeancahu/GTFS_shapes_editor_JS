///////////////////////////////////////////////////

// Constrained map in the area of interst
var view = new ol.View({
    center: ol.proj.fromLonLat([-84.1027104, 9.865107]),
    zoom: 12,
    // [minx,miny,max,may]
    extent: [-9375050.54, 1092000.79, -9352512.37, 1113049.659],
});


var coord2; // coordenates vector
var customFormat = function(dgts)
{
    return (function(coord1) {
        coord2 = [coord1[0], coord1[1]];
        return ol.coordinate.toStringXY(coord2,dgts);
    });
}

//
var mousePositionControl = new ol.control.MousePosition({
    coordinateFormat: customFormat(4),
        //document.getElementById('precision').value),
    projection: 'EPSG:4326',
    // comment the following two lines to have the mouse position
    // be placed within the map.
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position'),
    undefinedHTML: '&nbsp;',
});


// Map need a layers group, we're
// adding only base layer, streetElementNodes will be next
// base layer mainly has routes and buildings.
var map = new ol.Map({
    controls: ol.control.defaults(
        {attribution: false}).extend([mousePositionControl]),
    layers: [
	      new ol.layer.Tile({
	          source: new ol.source.OSM(),
	      }),
	      //vectorLayer,
    ],
    keyboardEventTarget: document,
    target: 'map_container', // It shows coordinates on page
    view: view,
});

// FIXME: change the "node_type" variable for something with sense
var node_type = document.getElementById('node_type').value;
var nodeTypeSelect = document.getElementById('node_type');
nodeTypeSelect.addEventListener('change', function (event) {
    node_type = event.target.value;
});

// TODO: Review needed
///////////////////////////////////////////////////////////////////////
// Aqui vamos haciendo la lista con puntos dependiendo de que clase sea
// se crea una lista con los diferentes puntos a dibujar sobre el mapa
const obj_streetElementGroup = new streetElementGroup(map);

function map_event_listener(event) {
    var action = document.getElementById('action').value;

    // TODO: change for a switch
    if (action == "remove"){
    //// Borrar si se da un segundo click:
    feature_onHover = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
        obj_streetElementGroup.deleteElementByID(feature.parent.getID);
        return feature;
    });
    } else if (action == "add") {
        obj_streetElementGroup.addElement(coord2, node_type); //FIXME
    } else if (action == "edit") {
        console.log("edit");

    } else if (action == "move") {
        console.log("move");
        if (obj_streetElementGroup.lastSelect){
            obj_streetElementGroup.lastSelect.setCoordinates(coord2);
        }

    } else if (action == "select") {
        console.log("edit");

    } else {
        console.log("select");
    }
}

//map.addEventListener('click', map_event_listener);
map.on('click', map_event_listener);

var feature_onHover;
map.on('pointermove', function (event) {
    feature_onHover = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
        //console.log(feature.ol_uid);
        console.log(feature.parent.getID); // streetElement.id
        //console.log(layer.ol_uid);
        return feature;
    });
    if (feature_onHover) {
        // Cambiamos la geometría cuando estamos sobre el feature
        console.log(feature_onHover.getGeometry().getCoordinates());
    } //else {
      //  container.style.display = 'none';
    //}
});


// Undo function
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'z') {
        console.log('Remove last');
        obj_streetElementGroup.deleteLastElement();
    }
});

// Shortcuts
document.addEventListener('keypress', function(event) {
    if (event.key === 's') {
        console.log('Stop!');
        node_type = 'stop';
    } else if (event.key === 'e') {
        console.log('Endpoint!');
        node_type = 'endpoint';
    }

});

document.addEventListener('keyup', function(event) {
    // if (event.key === 's') {
    //     console.log('Stop!');
        node_type = document.getElementById('shape_type').value;; // FIXME
    // }
});
