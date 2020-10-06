// GTFS streetElements

class streetElementNode {
    constructor (id, feature, layer) {
        this.layer = layer;
        this.valid = true;
        this.feature = feature; // The layer
        this.id = id;            // The streetElementNode ID
        this.connetions = [];    // Nodes who are connected to this element

        this.feature.parentID = this.id; // Define ID // FIXME

        this.layer.getSource().addFeature(this.feature);
    }

    setID (value){
        //this.feature.parentID = value;
        this.id = value;
    }

    get getID (){
        return this.id;
    }

    addConnection (value){
        // value: streetElementLink
        //verify if there are more than X connetions
        this.connetions.push(value.getID);
    }

    getConnections () {
        return this.connetions;
    }


    removeConnection (id) {
        // id: streetElementLink.id
        console.log(this.connections);// FIXME
        for (var i in this.connetions ){
            if (this.connetions[i] == id){
                delete(this.connetions[i]); // remove id
            }
            console.log(this.connetions); // FIXME; remove
        }
        console.log(this.connections); // FIXME
    }

    // terminate

    terminate (){
        // delete feature // TODO
        // parent has to delete connections first
        this.valid = false;
        this.layer.getSource().removeFeature(this.feature);
    }

}

class streetElementLink {
    constructor (id, nodeA, nodeB, layer) {
        this.id = id;
        this.layer = layer;
        this.valid = true;
        var coordinates = [
            nodeA.feature.getGeometry().flatCoordinates,
            nodeB.feature.getGeometry().flatCoordinates
        ];

        this.nodes = {};
        this.nodes[nodeA.getID] = nodeB.getID;
        this.nodes[nodeB.getID] = nodeA.getID;

        this.nodes_vec = [nodeA.getID, nodeB.getID];

        this.feature = new ol.Feature({
            geometry: new ol.geom.LineString(coordinates),
            name: 'Line'
        });
        layer.getSource().addFeature(this.feature);
    }

    get getID (){
        return this.id;
    }

    terminate (){
        // node: node who killed the link
        // delete feature // TODO
        // parent has to delete connections first
        this.valid = false;
        this.layer.getSource().removeFeature(this.feature);
        return this.nodes_vec;
    }

}

//obj_streetElementGroup.getLastElement.element.getSource().addFeature // FIXME // TODO
class streetElementGroup {
    constructor (map) {
        this.elements = []; // could it be private? // TODO
        this.links = []; // could it be private? // TODO
        this.lastSelect = null; // last element
        this.map = map; // add the map methods
        this.layers = {};

        this.addLayer("link"); // links between nodes
        this.addLayer("shape");
        this.addLayer("stop");
        this.addLayer("fork");
        this.addLayer("endpoint");
    }

    // Method to get the amount of elements
    get length (){
        return this.elements.length;
    }

    addElement(coordenate, type){
        console.log(coordenate); // TODO
        const feature = new ol.Feature({
	          geometry: new ol.geom.Point(ol.proj.fromLonLat([
	              coordenate[0],
                coordenate[1]
	          ]))
        });
        this.addElementByFeature(feature, type);
    }

    addElementByFeature (feature, type){
        // features: an Array of features
        // type: the kind of element
        console.log("Add element by features");
        // Verify type TODO
        this.elements.push(
            new streetElementNode(
                this.elements.length, // ID number
                feature, // feature
                this.layers[type] // layer
            ));

        if (this.lastSelect){ // Connect elements
            // TODO exceptions for endpoints
            this.addLink(this.lastSelect,
                    this.getLastElement
                   );
        }

        // The new element is the lastSelect now
        this.lastSelect = this.getLastElement;
    }

    addLink(nodeA, nodeB){
        const connection =             new streetElementLink(
            this.links.length, // ID number
            nodeA,
            nodeB,
            this.layers["link"] // always link layer
        );
        this.links.push(
            connection
        );
        // Update link on nodes
        this.elements[nodeA.getID].addConnection(connection);
        this.elements[nodeB.getID].addConnection(connection);
    }

    addLayer (type){
        var color, radius;
        var style;
        switch (type) {
        case 'shape': // Shape element, blue
            radius = 5;
            color = "blue";
            style =  new ol.style.Style({
	              image: new ol.style.Circle({
	                  radius: radius, // 5 default
	                  fill: new ol.style.Fill({color: color}) // blue default
	              })
            });
            break;
        case 'stop': // Stop element, red
            radius = 7;
            color = "red";
            style =  new ol.style.Style({
	              image: new ol.style.Circle({
	                  radius: radius, // 5 default
	                  fill: new ol.style.Fill({color: color}) // blue default
	              })
            });
            break;
        case 'fork': // Intersec. violet
            radius = 5;
            color = "violet";
            style =  new ol.style.Style({
	              image: new ol.style.Circle({
	                  radius: radius, // 5 default
	                  fill: new ol.style.Fill({color: color}) // blue default
	              })
            });
            break;
        case 'endpoint': // Terminals, green
            radius = 5;
            color = "green";
            style =  new ol.style.Style({
	              image: new ol.style.Circle({
	                  radius: radius, // 5 default
	                  fill: new ol.style.Fill({color: color}) // blue default
	              })
            });
            break;
        case 'link': // link, blue
            radius = 2;
            color = "blue";
            style =  new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: "blue",
                    width: 1,
	              })
            });
            break;
        default:
            console.log('Type: '+ type +' not found');
        }

        const vectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: style
        });
        this.layers[type] = vectorLayer; // Add layer to obj
        this.map.addLayer(this.layers[type]); // Add layer to map
    }


    // Return the streetElement object
    getElementByID (value){
        return this.elements[value];
    }

    // Return the streetElementNode last object got in Array
    get getLastElement (){
        var decrem = 1;
        // Change this while FIXME:
        while (this.elements[this.elements.length-decrem].valid != true) {
            decrem = decrem + 1;
        }
        return this.elements[this.elements.length-decrem];
    }

    deleteLink (link_id){
        var nodes = this.links[link_id].terminate();
        this.elements[nodes[0]].removeConnection(link_id);
        this.elements[nodes[1]].removeConnection(link_id);
    }

    deleteLastElement (){
        // This one is easy because last in Array but
        // a point in middlen needs more logic
        var element = this.getLastElement;
        var connections = element.getConnections();

        console.log(connections); // FIXME;

        for ( var i  in connections){
            // the second node in the link:
            //console.log(i); // FIXME
            // Delete connections
            this.deleteLink(connections[i]);
        }

        element.terminate(); // terminate element
        // this.map.removeLayer(element.layer);
        console.log("REMOVE"); // FIXME // remove

        // Head pointer
        // var element = this.elements.pop(); //
        this.lastSelect = this.getLastElement;
    }

    deleteElementByID (value){
        console.log("delete element"); // TODO
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
