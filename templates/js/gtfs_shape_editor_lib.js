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
    coordinateFormat: customFormat(
        document.getElementById('precision').value),
    projection: 'EPSG:4326',
    // comment the following two lines to have the mouse position
    // be placed within the map.
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position'),
    undefinedHTML: '&nbsp;',
});


// Map need a layers group, we're
// adding only base layer, streetElements will be next
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
var projectionSelect = document.getElementById('projection');
projectionSelect.addEventListener('change', function (event) {
    mousePositionControl.setProjection(event.target.value);

});

// Amount of digits behind dot
var precisionInput = document.getElementById('precision');
precisionInput.addEventListener('change', function (event) {
    var newCustomFormat = function(dgts)
    {return (function(coord1) {
        coord2 = [coord1[0], coord1[1]];
        //console.log(coord2);
        return ol.coordinate.toStringXY(coord2,dgts);
    });
    }
    mousePositionControl.setCoordinateFormat(
        newCustomFormat(event.target.value));
});

// FIXME: change the "typo" variable for something with sense
var typo = document.getElementById('shape_typo').value;
var typoSelect = document.getElementById('shape_typo');
typoSelect.addEventListener('change', function (event) {
    typo = event.target.value;
});
