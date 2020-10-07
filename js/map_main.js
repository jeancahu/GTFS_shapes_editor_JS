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
const o_se_group = new streetElementGroup(map);

map.on('click', (event)=> {
    var action = document.getElementById('action').value;
    var feature_onHover = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
        return feature;
    });

    // TODO: change for a switch
    if (action == "remove"){
        // Click on element to remove
        if ( feature_onHover ){
            o_se_group.deleteElementByID(
                feature_onHover.parent.getID);
        }
    } else if (action == "add") {
        if (feature_onHover){
            console.log("eso eso");
            o_se_group.addLink(
                feature_onHover.parent,
                o_se_group.lastSelect
            );
            o_se_group.selectElement(feature_onHover.parent);
        } else {
            o_se_group.addElement(coord2, node_type); //FIXME
        }

    } else if (action == "edit") {
        console.log("edit");

    } else if (action == "move") {
        console.log("move");
        if (o_se_group.lastSelect){
            o_se_group.lastSelect.setCoordinates(coord2);
        }
    } else if (action == "select") {
        if (feature_onHover){
            o_se_group.selectElement(
                feature_onHover.parent
            );
        }
    } else {
        console.log("select");
    }
});

// ~~Undo~~ function ( not yet )
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'z') {
        console.log('Remove last');
        o_se_group.deleteLastElement();
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
        node_type = document.getElementById('node_type').value;
});


//////////////////// Vue experiments ////////////////////////////

var app = new Vue({
    el: '#app',
    data: {
        shapes: o_se_group.elements,
        last: o_se_group
    }
});

