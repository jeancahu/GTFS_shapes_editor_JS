//////////////// GTFS streetElements ///////////////////
////                                                ////
////  This library tries to encapsulate some of the ////
////  more necessary tables and elements required   ////
////  by the General Transit Feed Specification,    ////
////  format
////
////

class streetElementNode {
    constructor (id, coordenate, layer) {
        // Private

        // Public elements
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

    get isNode () { return true; };
    get isLink () { return false; };

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
        this.feature.parent = this;
        layer.getSource().addFeature(this.feature);
    }

    get isNode () { return false; };
    get isLink () { return true; };

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
        ////// Private data //////////////////
        //// map //// Network map ////////////
        var history = []; // GTFS state     //
        var layers = {};  // Network layers //
        //////////////////////////////////////

        ////// Private methods //////
        var addLink = (nodeA, nodeB) => { // Internal
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
                layers["link"] // always link layer
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
        }; // END addlink

        var addLayer = (type, color) => {
            var radius;
            var style;
            switch (type) {
            case 'shape': // Shape element, blue
                radius = 5;
                style =  new ol.style.Style({
	                  image: new ol.style.Circle({
	                      radius: radius, // 5 default
	                      fill: new ol.style.Fill({color: color})
	                  })
                });
                break;
            case 'stop': // Stop element, red
                radius = 7;
                style =  new ol.style.Style({
	                  image: new ol.style.Circle({
	                      radius: radius, // 5 default
	                      fill: new ol.style.Fill({color: color})
	                  })
                });
                break;
            case 'fork': // Intersec. violet
                radius = 5;
                style =  new ol.style.Style({
	                  image: new ol.style.Circle({
	                      radius: radius, // 5 default
	                      fill: new ol.style.Fill({color: color})
	                  })
                });
                break;
            case 'endpoint': // Terminals, green
                radius = 5;
                style =  new ol.style.Style({
	                  image: new ol.style.Circle({
	                      radius: radius, // 5 default
	                      fill: new ol.style.Fill({color: color})
	                  })
                });
                break;
            case 'select': // Terminals, green
                radius = 3;
                style =  new ol.style.Style({
	                  image: new ol.style.Circle({
	                      radius: radius, // 5 default
	                      fill: new ol.style.Fill({color: color})
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
            layers[type] = vectorLayer; // Add layer to obj
            map.addLayer(layers[type]); // Add layer to map
        }; // END addLayer

        ////// Privileged methods //////

        this.historyPush = (command) => { // TODO private method
            // command is a list with an external function and its arguments
            history.push(command);
        };

        this.historyLoad = (in_history) => { // TODO
            console.log("Load history");
            in_history.forEach( (commad) => {
                this[commad[0]](...commad.slice(1, commad.length));
            });
        };

        this.historyString = () => { // Saves history
            console.log("String history");
            var result = JSON.stringify(
                history
            ).replace(/\]\,\[/g,"],\n\t\t\t[");
            result = result.replace(/\[\[/,"[\n\t\t\t[");
            result = "const _streetElementGroupHistory = " + result;
            result = result.replace(/\]$/,"\n];");
            return result;
        };

        this.historyPop = function () { // TODO
            console.log("Pop from history");
        };

        this.addNode = (coordenate, type) => {
            // coordenate: a single of coordenate, point
            // type: the element layer name

            this.historyPush(["addNode", coordenate, type]);

            // Verify type TODO
            this.nodes.push(
                new streetElementNode(
                    this.nodes.length, // ID number
                    coordenate, // coordinate
                    layers[type] // layer
                ));

            if (this.lastSelect){ // Connect nodes
                // TODO exceptions for endpoints
                addLink(this.lastSelect,
                        this.getLastElement
                       );
            }

            // The new element is the lastSelect now
            this.selectNode(this.getLastElement);
        };

        this.linkNodesByID = (nodeA_id, nodeB_id) => { // External
            this.historyPush(["linkNodesByID", nodeA_id, nodeB_id]);
            addLink (
                this.nodes[nodeA_id],
                this.nodes[nodeB_id]
            );
        };

        this.deleteNodeByID = (value) => {
            // This one is easy because last in Array but
            // a point in middlen needs more logic
            var element = this.nodes[value];
            if (element.valid){
                console.log("valid element");
            } else {
                console.log("invalid element");
                return;
            }
            this.historyPush(["deleteNodeByID", value]);
            element.terminate(); // terminate element

            if( element.getConnections().length == 2 ){
                addLink(
                    element.getConnections()[0].getPartner(element),
                    element.getConnections()[1].getPartner(element)
                );
            }

            // Head pointer
            this.selectNode(this.getLastElement);
        };

        this.updateElementLayerByID = (element_id) => { // TODO
            // if (this.nodes[element_id].connections.length < 2){
            //     // Endpoint
            //     this.nodes[element_id].setLayer(layers["endpoint"]);
            // } else if (this.nodes[element_id].connections.length < 3){
            //     // Shape or stop
            //     if (this.nodes[element_id].type == "stop") {
            //         return;
            //     } else {
            //         this.nodes[element_id].setLayer(layers["shape"]);
            //     }
            // } else {

            if (this.nodes[element_id].connections.length > 2){
                // Intersection
                this.nodes[element_id].setLayer(layers["fork"]);
            }
        };

        this.selectNode = (element) => {
            if ( this.lastSelect ){
                if (element)
                {this.updateElementLayerByID(element.getID);}
                layers["select"].getSource().removeFeature(
                    this.lastSelect.feature
                );
            }
            this.lastSelect = element;
            if ( this.lastSelect ){
                layers["select"].getSource().addFeature(
                    this.lastSelect.feature
                );
            }
        };
        ////// END Privileged methods //////

        ////// Public data //////
        this.nodes = []; // could it to be private? // TODO
        this.links = []; // could it to be private? // TODO

        this.shapes = [];
        this.agencies = [];
        this.routes = [];
        this.trips = [];
        this.stopTimes = [];

        this.lastSelect = null; // last element // head pointer
        ////// END Public data //////

        // Add layers
        addLayer("link", "blue"); // links between nodes
        addLayer("shape", "blue");
        addLayer("stop", "red");
        addLayer("fork", "violet");
        addLayer("endpoint", "green");
        addLayer("select", "yellow");
    } ////// END streetElementGroup constructor //////

    ////// Public methods //////

    // Method to get the amount of nodes
    get length (){
        return this.nodes.length;
    }

    computeShapes () { // TODO
        console.log("Compute shapes");
        endpoints = [];
        this.nodes.forEach((node) => {
            console.log(node.type);
        });
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

        var agency = new streetElementAgency (
            agency_id,
            agency_name,
            agency_url,
            agency_timezone,
            agency_lang,
            agency_phone,
            agency_fare_url,
            agency_email
        );

        this.historyPush([
            "addAgency",
            agency_id,
            agency_name,
            agency_url,
            agency_timezone,
            agency_lang,
            agency_phone,
            agency_fare_url,
            agency_email
        ]);

        console.log(agency);

        this.agencies.push(agency);

        return true; // TODO
    }

    addRoute(route_id,
             agency_id,
             route_short_name,
             route_long_name,
             route_type
             ) {

        var route = new streetElementRoute (
            route_id,
            agency_id,
            route_short_name,
            route_long_name,
            route_type
        );

        this.historyPush([
            "addRoute",
            route_id,
            agency_id,
            route_short_name,
            route_long_name,
            route_type
        ]);

        console.log(route);

        this.routes.push(route);

        return true; // TODO
    }

    addTrip(route_id, // Route object
            service_id,
            trip_id,
            direction_id,
            shape_id  // Shape object
           ) {

        var trip = new streetElementTrip(
            route_id, // Route object
            service_id,
            trip_id,
            direction_id,
            shape_id  // Shape object
        );

        this.historyPush([
            "addTrip",
            route_id, // Route object
            service_id,
            trip_id,
            direction_id,
            shape_id  // Shape object
        ]);

        console.log(trip);

        this.trips.push(trip);

        return true; // TODO
    }

    addStopTime (trip_id,  // Trip object
                 arrival_time,
                 departure_time,
                 stop_id,  // Stop object
                 stop_sequence
                ) {
        var stoptime = new streetElementStopTime(
            trip_id,  // Trip object
            arrival_time,
            departure_time,
            stop_id,  // Stop object
            stop_sequence
        );

        this.historyPush([
            "addStopTime",
            trip_id,  // Trip object
            arrival_time,
            departure_time,
            stop_id,  // Stop object
            stop_sequence
        ]);

        console.log(stoptime);

        this.stopTimes.push(stoptime);

        return true; // TODO
    }

    unselectNode () {
        this.historyPush(["unselectNode"]);
        this.selectNode(null);
    }

    selectNodeByID ( node_id ){ // External // TODO verify data
        this.historyPush(["selectNodeByID", node_id]);
        this.selectNode(this.nodes[node_id]);
    }

    setNodeCoordinatesByID (node_id, coordinates){ // External
        this.historyPush([
            "setNodeCoordinatesByID",
            node_id,
            coordinates
        ]);
        this.nodes[node_id].setCoordinates(coordinates);
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

    splitLinkByID (link_id){ // TODO
        this.historyPush([
            "splitLinkByID",
            link_id
        ]);
        this.links[link_id].terminate();
    }

    deleteLinkByID (link_id){ // TODO: move to link.terminate
        this.historyPush([
            "deleteLinkByID",
            link_id
        ]);
        this.links[link_id].terminate();
    }

    deleteLastElement (){
        if (this.getLastElement){
            this.deleteNodeByID (this.getLastElement.getID);
        } else {
            console.log("there are no valid nodes in the vector");
        }
    }
}

