// GTFS streetElements

class streetElementNode {
    constructor (id, coordenate, layer) {
        this.valid = true;
        this.id = id;            // The streetElementNode ID

        this.feature = new ol.Feature({ // The feature
	          geometry: new ol.geom.Point(ol.proj.fromLonLat([
	              coordenate[0],
                coordenate[1]
	          ]))
        });

        this.connections = [];    // Links who connect this element to others nodes

        this.feature.parent = this; // Pass parent reference

        this.layer = layer; // Define the layer ( and type )
        this.layer.getSource().addFeature(this.feature); // Gettin visible on map

    }

    setID (value){
        this.id = value;
    }

    get getID (){
        return this.id;
    }

    get type (){ // Layer name is the element type
        return this.layer.name;
    }

    addConnection (value){
        // value: streetElementLink
        //verify if there are more than X connections
        this.connections.push(value);
    }

    getConnections () {
        return this.connections;
    }


    // TODO push, rotation
    removeConnection (link) {
        // link: streetElementLink
        if (this.valid){
        for (var i in this.connections ){
            if (this.connections[i].getID == link.getID){
                this.connections.splice(i, 1);
            }
        }
        }
    }

    get coordinates (){
        return this.feature.getGeometry().getCoordinates();
    }


    setCoordinates ( coordenate ){
        this.feature.getGeometry().setCoordinates(
            ol.proj.fromLonLat([
	              coordenate[0],
                coordenate[1]
	          ]));
        for( var i in this.connections ){
            this.connections[i].update(); // Update link
        }
    }

    setLayer (layer){
        console.log("set layer"); // FIXME
        this.layer.getSource().removeFeature(this.feature);
        this.layer = layer;
        this.layer.getSource().addFeature(this.feature);
    }

    // Terminate element
    terminate (){
        // delete feature // TODO
        // parent has to delete connections first

        // Set it as invalid
        this.valid = false;

        // Terminate links:
        this.connections.forEach((value, index)=>{
            console.log(value);
            value.terminate(); // Terminate link
        });

        // Remove feature from map
        this.layer.getSource().removeFeature(this.feature);

    }
}

class streetElementLink { // Link between two nodes
    constructor (id, nodeA, nodeB, layer) {
        this.valid = true;
        this.id = id;

        this.layer = layer;

        var coordinates = [
            nodeA.feature.getGeometry().flatCoordinates,
            nodeB.feature.getGeometry().flatCoordinates
        ];

        this.nodeA = nodeA;
        this.nodeB = nodeB;

        this.feature = new ol.Feature({
            geometry: new ol.geom.LineString(coordinates),
            name: 'Line'
        });
        layer.getSource().addFeature(this.feature);
    }

    update () { // Update figure on map
        var coordinates = [
            this.nodeA.feature.getGeometry().flatCoordinates,
            this.nodeB.feature.getGeometry().flatCoordinates
        ];
        this.feature.getGeometry().setCoordinates(coordinates);
    }

    get getID (){
        return this.id;
    }

    getPartner (node) {
        if ( node.getID == this.nodeA.getID ){
            return this.nodeB;
        } else if ( node.getID == this.nodeB.getID ){
            return this.nodeA;
        } else {
            return null;
        }
    }

    terminate (){
        // node: node who killed the link
        // delete feature // TODO
        // parent has to delete connections first
        this.valid = false;
        this.layer.getSource().removeFeature(this.feature);
        this.nodeA.removeConnection(this);
        this.nodeB.removeConnection(this);
    }
}

// TODO: add shape element (contains nodes and links)
class streetElementGroup {
    constructor (map) {
        this.elements = []; // could it be private? // TODO
        this.links = []; // could it be private? // TODO
        this.lastSelect = null; // last element // head pointer
        this.map = map; // add the map methods
        this.layers = {};

        this.addLayer("link", "blue"); // links between nodes
        this.addLayer("shape", "blue");
        this.addLayer("stop", "red");
        this.addLayer("fork", "violet");
        this.addLayer("endpoint", "green");
        this.addLayer("select", "yellow");
    }

    // Method to get the amount of elements
    get length (){
        return this.elements.length;
    }

    addElement(coordenate, type){
        console.log(coordenate); // FIXME
        // coordenate: a single of coordenate, point
        // type: the element layer name
        console.log("Add element by features");
        // Verify type TODO
        this.elements.push(
            new streetElementNode(
                this.elements.length, // ID number
                coordenate, // coordinate
                this.layers[type] // layer
            ));

        if (this.lastSelect){ // Connect elements
            // TODO exceptions for endpoints
            this.addLink(this.lastSelect,
                    this.getLastElement
                   );
        }

        // The new element is the lastSelect now
        this.selectElement(this.getLastElement);
    }

    addLink(nodeA, nodeB){
        if (nodeA.getID == nodeB.getID){
            return 1;} // Error

        if (nodeA.valid & nodeB.valid) {} //OK
        else {return 2;} // ERROR

        nodeA.getConnections().forEach((value, index)=>{
            if ( value.getPartner(nodeA).getID == nodeB.getID ){
                return; // duplicate link
            }
        });
        nodeB.getConnections().forEach((value, index)=>{
            if ( value.getPartner(nodeB).getID == nodeA.getID ){
                console.log("Half link error at :", value);
                return; // half-link error
            }
        });

        const connection = new streetElementLink(
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

        this.updateElementLayerByID(nodeA.getID);
        this.updateElementLayerByID(nodeB.getID);
        return connection.getID;
    }

    updateElementLayerByID(element_id){ // TODO
        // if (this.elements[element_id].connections.length < 2){
        //     // Endpoint
        //     this.elements[element_id].setLayer(this.layers["endpoint"]);
        // } else if (this.elements[element_id].connections.length < 3){
        //     // Shape or stop
        //     if (this.elements[element_id].type == "stop") {
        //         return;
        //     } else {
        //         this.elements[element_id].setLayer(this.layers["shape"]);
        //     }
        // } else {

        if (this.elements[element_id].connections.length > 2){
            // Intersection
            this.elements[element_id].setLayer(this.layers["fork"]);
        }
    }

    addLayer (type, color){
        var radius;
        var style;
        switch (type) {
        case 'shape': // Shape element, blue
            radius = 5;
            style =  new ol.style.Style({
	              image: new ol.style.Circle({
	                  radius: radius, // 5 default
	                  fill: new ol.style.Fill({color: color}) // blue default
	              })
            });
            break;
        case 'stop': // Stop element, red
            radius = 7;
            style =  new ol.style.Style({
	              image: new ol.style.Circle({
	                  radius: radius, // 5 default
	                  fill: new ol.style.Fill({color: color}) // blue default
	              })
            });
            break;
        case 'fork': // Intersec. violet
            radius = 5;
            style =  new ol.style.Style({
	              image: new ol.style.Circle({
	                  radius: radius, // 5 default
	                  fill: new ol.style.Fill({color: color}) // blue default
	              })
            });
            break;
        case 'endpoint': // Terminals, green
            radius = 5;
            style =  new ol.style.Style({
	              image: new ol.style.Circle({
	                  radius: radius, // 5 default
	                  fill: new ol.style.Fill({color: color}) // blue default
	              })
            });
            break;
        case 'select': // Terminals, green
            radius = 3;
            style =  new ol.style.Style({
	              image: new ol.style.Circle({
	                  radius: radius, // 5 default
	                  fill: new ol.style.Fill({color: color}) // blue default
	              })
            });
            break;
        case 'link': // link, blue
            radius = 2;
            style =  new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: color,
                    // width: 10, // TODO
                    width: 3,
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
        vectorLayer.name = type; // Name the layer
        this.layers[type] = vectorLayer; // Add layer to obj
        this.map.addLayer(this.layers[type]); // Add layer to map
    }

    selectElement (element) {
        if ( this.lastSelect ){
            if (element)
            {this.updateElementLayerByID(element.getID);}
            this.layers["select"].getSource().removeFeature(
                this.lastSelect.feature
            );
        }
        this.lastSelect = element;
        if ( this.lastSelect ){
            this.layers["select"].getSource().addFeature(
                this.lastSelect.feature
            );
        }
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
            if ( this.elements.length-decrem < 0 ){
                return null;
            }
        }
        return this.elements[this.elements.length-decrem];
    }

    deleteLinkByID (link_id){ // TODO: move to link.terminate
        this.links[link_id].terminate();
    }

    deleteLastElement (){
        if (this.getLastElement){
            this.deleteElementByID (this.getLastElement.getID);
        } else {
            console.log("there are no valid elements in the vector");
        }
    }

    deleteElementByID (value){
        // This one is easy because last in Array but
        // a point in middlen needs more logic
        var element = this.elements[value];
        if (element.valid){
            console.log("valid element");
        } else {
            console.log("invalid element");
            return;
        }

        element.terminate(); // terminate element

        if( element.getConnections().length == 2 ){
            this.addLink(
               element.getConnections()[0].getPartner(element),
               element.getConnections()[1].getPartner(element)
            );
        }

        // this.map.removeLayer(element.layer);
        console.log("REMOVE"); // FIXME // remove

        // Head pointer
        // var element = this.elements.pop(); //
        this.selectElement(this.getLastElement);
    }
}

