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

// Selects the proyection type
// var projectionSelect = document.getElementById('projection');
// projectionSelect.addEventListener('change', function (event) {
//     mousePositionControl.setProjection(event.target.value);

// });

// Amount of digits behind dot
// var precisionInput = document.getElementById('precision');
// precisionInput.addEventListener('change', function (event) {
//     var newCustomFormat = function(dgts)
//     {return (function(coord1) {
//         coord2 = [coord1[0], coord1[1]];
//         //console.log(coord2);
//         return ol.coordinate.toStringXY(coord2,dgts);
//     });
//     }
//     mousePositionControl.setCoordinateFormat(
//         newCustomFormat(event.target.value));
// });

// FIXME: change the "typo" variable for something with sense
var typo = document.getElementById('shape_typo').value;
var typoSelect = document.getElementById('shape_typo');
typoSelect.addEventListener('change', function (event) {
    typo = event.target.value;
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

        obj_streetElementGroup.deleteElementByID(feature.parentID);

        return feature;
    });
    } else if (action == "add") {
        obj_streetElementGroup.addElement(coord2, typo); //FIXME
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
        console.log(feature.parentID); // streetElement.id
        //console.log(layer.ol_uid);
        return feature;
    });
    if (feature_onHover) {
        // Cambiamos la geometría cuando estamos sobre el feature
        console.log(feature_onHover.getGeometry().getCoordinates());
        //var content = document.getElementById('popup-content');
    //    console.log(feature_onHover.getProperties().name);
        //overlay.setPosition(evt.coordinate);
        //content.innerHTML = 'HOVER ' + feature_onHover.getProperties().name;
        //container.style.display = 'block';
    } //else {
      //  container.style.display = 'none';
    //}
});

//

// var hide_map = document.getElementById("disable_map");
// // Toggle map visibility
// hide_map.addEventListener("click",
//     function (event) {
//         element = document.getElementById("map_container");
//     if (element.style.display === "none") {
//         element.style.display = "block";
//     } else {
//         element.style.display = "none";
//     }
// });

// Undo function
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'z') {
        console.log('Undo!');
        obj_streetElementGroup.deleteLastElement();
    }
});

document.addEventListener('keypress', function(event) {
    if (event.key === 's') {
        console.log('Stop!');
        typo = 'stop'; // FIXME
    }
});

document.addEventListener('keyup', function(event) {
    // if (event.key === 's') {
    //     console.log('Stop!');
        typo = document.getElementById('shape_typo').value;; // FIXME
    // }
});
