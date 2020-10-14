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

class streetElementAgency {
    constructor (agency_id,
                 agency_name,
                 agency_url,
                 agency_timezone,
                 agency_lang,
                 agency_phone,
                 agency_fare_url,
                 agency_email
                ) {
        this.agency_id = agency_id;
        this.agency_name = agency_name;
        this.agency_url = agency_url;
        this.agency_timezone = agency_timezone;
        this.agency_lang = agency_lang;
        this.agency_phone = agency_phone;
        this.agency_fare_url = agency_fare_url;
        this.agency_email = agency_email;
    }
    // Create a function for every param to
    // verify if it is a valid valor // TODO
}

class streetElementRoute {
    constructor (route_id,
                 agency_id,  // agency object
                 route_short_name,
                 route_long_name,
                 route_type
                ) {
        this.route_id = route_id;
        this.agency_id = agency_id;
        this.route_short_name = route_short_name;
        this.route_long_name = route_long_name;
        this.route_type = route_type;
    }
    // Create a function for every param to
    // verify if it is a valid valor // TODO
}

class streetElementTrip {
    constructor (route_id, // Route object
                 service_id,
                 trip_id,
                 direction_id,
                 shape_id  // Shape object
                ) {
        this.route_id = route_id;
        this.service_id = service_id;
        this.trip_id = trip_id;
        this.direction_id = direction_id;
        this.shape_id = shape_id;
    }
    // Create a function for every param to
    // verify if it is a valid valor // TODO
}

class streetElementStopTime {
    constructor (trip_id,  // Trip object
                 arrival_time,
                 departure_time,
                 stop_id,  // Stop object
                 stop_sequence
                ) {
        this.trip_id = trip_id;
        this.arrival_time = arrival_time;
        this.departure_time = departure_time;
        this.stop_id = stop_id;
        this.stop_sequence = stop_sequence;
    }
    // Create a function for every param to
    // verify if it is a valid valor // TODO
}

// TODO: add shape element (contains nodes and links)
class streetElementGroup {
    constructor (map) {
        this.nodes = []; // could it to be private? // TODO
        this.links = []; // could it to be private? // TODO
        this.agencies = [];
        this.routes = [];
        this.trips = [];
        this.stopTimes = [];

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

    // Method to get the amount of nodes
    get length (){
        return this.nodes.length;
    }

    addElement(coordenate, type){
        console.log(coordenate); // FIXME
        // coordenate: a single of coordenate, point
        // type: the element layer name
        console.log("Add element by features");
        // Verify type TODO
        this.nodes.push(
            new streetElementNode(
                this.nodes.length, // ID number
                coordenate, // coordinate
                this.layers[type] // layer
            ));

        if (this.lastSelect){ // Connect nodes
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
        this.nodes[nodeA.getID].addConnection(connection);
        this.nodes[nodeB.getID].addConnection(connection);

        this.updateElementLayerByID(nodeA.getID);
        this.updateElementLayerByID(nodeB.getID);
        return connection.getID;
    }

    addAgency(agency_id,
              agency_name,
              agency_url,
              agency_timezone,
              agency_lang,
              agency_phone,
              agency_fare_url,
              agency_email
             ) {
        return true; // TODO
    }
    updateElementLayerByID(element_id){ // TODO
        // if (this.nodes[element_id].connections.length < 2){
        //     // Endpoint
        //     this.nodes[element_id].setLayer(this.layers["endpoint"]);
        // } else if (this.nodes[element_id].connections.length < 3){
        //     // Shape or stop
        //     if (this.nodes[element_id].type == "stop") {
        //         return;
        //     } else {
        //         this.nodes[element_id].setLayer(this.layers["shape"]);
        //     }
        // } else {

        if (this.nodes[element_id].connections.length > 2){
            // Intersection
            this.nodes[element_id].setLayer(this.layers["fork"]);
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
        return this.nodes[value];
    }

    // Return the streetElementNode last object got in Array
    get getLastElement (){
        var decrem = 1;
        // Change this while FIXME:
        while (this.nodes[this.nodes.length-decrem].valid != true) {
            decrem = decrem + 1;
            if ( this.nodes.length-decrem < 0 ){
                return null;
            }
        }
        return this.nodes[this.nodes.length-decrem];
    }

    deleteLinkByID (link_id){ // TODO: move to link.terminate
        this.links[link_id].terminate();
    }

    deleteLastElement (){
        if (this.getLastElement){
            this.deleteElementByID (this.getLastElement.getID);
        } else {
            console.log("there are no valid nodes in the vector");
        }
    }

    deleteElementByID (value){
        // This one is easy because last in Array but
        // a point in middlen needs more logic
        var element = this.nodes[value];
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
        // var element = this.nodes.pop(); //
        this.selectElement(this.getLastElement);
    }
}

