// GTFS streetElements

class streetElement {
    constructor (value) {
        this.element = value; // The layer
        this.element.parentID = -1; // The streetElement ID
        this.id = -1; // The streetElement ID
        this.connetions = []; // Nodes who are connected to this element
    }

    setID (value){
        this.element.parentID = value;
        this.id = value;
    }
}

class streetElementGroup {
    constructor () {
        this.elements = []; // could it be private? // TODO
    }

    // Method to get the amount of elements
    get length (){
        return this.elements.length;
    }

    addElementBySource (vectorSource, radius=5, color=blue){
        const vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: new ol.style.Style({
	              image: new ol.style.Circle({
	                  radius: radius, // 5 default
	                  fill: new ol.style.Fill({color: color}) // blue default
	              })
            })
        });
        addElementByLayer (vectorLayer);
    }

    // set addElement (value){
    addElementByLayer (value){
        console.log("add layer as element"); // FIXME remove this
        var new_element = new streetElement(
            value, // The layer
        );
        this.addElement(new_element);
    }

    addElement (value){
        console.log("add element"); // FIXME remove this
        value.setID(this.elements.length);
        this.elements.push(
            value
        );
    }

    // Return the streetElement object
    getElementByID (value){
        return this.elements[value];
    }

    // Return the streetElement last object got in Array
    get getLastElement (){
        return this.elements[this.elements.length-1];
    }

    deleteElementByID (value){
        console.log("delete element");
    }

}




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
