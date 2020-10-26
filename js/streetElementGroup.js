//////////////// GTFS streetElements ///////////////////
////                                                ////
////  This library tries to encapsulate some of the ////
////  more necessary tables and elements required   ////
////  by the General Transit Feed Specification,    ////
////  format
////
////

class streetElementGroup {
    constructor (map) {
        ////// Private data ///////////////////////////
        /////////////// map //// Network map //////////
        var history = [];      // GTFS state         //
        var layers = {};       // Network layers     //
        var lastSelect = null; // last node selected //
        ///////////////////////////////////////////////

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
                layers[streetElementLink.type.LINK], // always link layer
                layers[streetElementLink.type.DIRECTION] // direction layer
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
            case streetElementNode.type.SHAPE: // Shape element, blue
                radius = 5;
                style =  new ol.style.Style({
	                  image: new ol.style.Circle({
	                      radius: radius, // 5 default
	                      fill: new ol.style.Fill({color: color})
	                  })
                });
                break;
            case streetElementNode.type.STOP: // Stop element, red
                radius = 7;
                style =  new ol.style.Style({
	                  image: new ol.style.Circle({
	                      radius: radius, // 5 default
	                      fill: new ol.style.Fill({color: color})
	                  })
                });
                break;
            case streetElementNode.type.FORK: // Intersec. violet
                radius = 5;
                style =  new ol.style.Style({
	                  image: new ol.style.Circle({
	                      radius: radius, // 5 default
	                      fill: new ol.style.Fill({color: color})
	                  })
                });
                break;
            case streetElementNode.type.ENDPOINT: // Terminals, green
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
            case streetElementLink.type.LINK: // FIXME link, blue
                radius = 2;
                style =  new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: color,
                        // width: 10, // TODO
                        width: 4.5,
	                  })
                });
                break;
            case streetElementLink.type.DIRECTION:
                style = function (feature) {
                    var geometry = feature.getGeometry();
                    var style = [];
                    geometry.forEachSegment(function (start, end) {
                        var dx = end[0] - start[0];
                        var dy = end[1] - start[1];
                        var rotation = Math.atan2(dy, dx);
                        style.push(
                            new ol.style.Style({
                                geometry: new ol.geom.Point(start),
                                image: new ol.style.Icon({
                                    src: 'assets/img/arrow.png',
                                    anchor: [-0.15, 0.5],
                                    rotateWithView: true,
                                    rotation: -rotation,
                                }),
                            })
                        );
                    });
                    return style;
                };
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
            if (command[0] == "selectNodeByID" | // Process selectNodeByID
                command[0] == "unselectNode") {  // or unselectNode
                if (history[history.length -1][0] == "selectNodeByID" |
                    history[history.length -1][0] == "unselectNode") {
                    // only save the last selected node if there are not editions in between
                    history.pop();
                }
            } else if (command[0] == "setNodeCoordinatesByID" ) {
                if (history[history.length -1][0] == "setNodeCoordinatesByID" |
                    history[history.length -1][1] == command[1]) {
                    // only save the last move for same node
                    history.pop();
                }
            }
            history.push(command);
        };

        this.historyLoad = (in_history) => { // TODO
            console.log("Load history");
            // TODO if method is not in class, error code
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
            history.pop();
        };

        this.addNode = (coordinate, type) => {
            // coordinate: a single of coordinate, point
            // type: the element layer name

            if (type == streetElementNode.type.ENDPOINT |
                type == streetElementNode.type.STOP     |
                type == streetElementNode.type.SHAPE    |
                type == streetElementNode.type.FORK     )
            {
                // good type, continue
            } else {
                console.log("Bad node type on init");
                return 1; // error
            }

            this.historyPush(["addNode", coordinate, type]);

            var new_node = new streetElementNode(
                this.nodes.length, // ID number
                coordinate, // coordinate
                layers[type] // layer
            );

            // If node has stop type, add stop info
            if (type == streetElementNode.type.STOP    |
                type == streetElementNode.type.ENDPOINT)
            {
                new_node.setStopInfo(
                    {
                        id: this.nodes.length,
                        name: '' // TODO
                    }
                );
            }

            this.nodes.push(new_node);

            if (lastSelect){ // Connect nodes
                // TODO exceptions for endpoints
                addLink(lastSelect,
                        this.getLastElement
                       );
            }

            // The new element is the lastSelect now
            this.selectNode(this.getLastElement);
            return 0; // done
        };

        this.linkNodesByID = (nodeA_id, nodeB_id) => { // External
            this.historyPush(["linkNodesByID", nodeA_id, nodeB_id]);
            addLink (
                this.nodes[nodeA_id],
                this.nodes[nodeB_id]
            );
        };

        this.splitLinkByID = (link_id, coordinate, type) => {
            this.historyPush([
                "splitLinkByID",
                link_id,
                coordinate,
                type
            ]);
            // invalidate the link
            this.links[link_id].terminate();

            // TODO projection on the link to get a coordinate
            // TODO type node

            // add a Shape Node
            var new_node = new streetElementNode(
                this.nodes.length, // ID number
                coordinate, // coordinate
                layers[streetElementNode.type.SHAPE] // layer
            );

            this.nodes.push(new_node);

            // The new element is the lastSelect now
            this.selectNode(new_node);

            // Link with the previous node A
            addLink(new_node,
                    this.links[link_id].nodeA
                   );

            // Link with the previous node B
            addLink(new_node,
                    this.links[link_id].nodeB
                   );
        };

        this.changeNodeInfoByID = (node_id, info) => { // TODO improve
            this.historyPush([
                "changeNodeInfoByID",
                node_id,
                info
            ]);
            // { // input param: info::
            //     node_type: layer,
            //     stop_id: number,
            //     stop_name: text,
            //     stop_description: text,
            // }
            // TODO verify the type
            if (info.node_type){
                this.nodes[node_id].setLayer(
                    layers[info.node_type]
                );
            }

            // verify the data
            var stop_info = {};
            if (info.stop_id){
                stop_info['id'] = info.stop_id;
            }
            if (info.stop_name){
                stop_info['name'] = info.stop_name;
            }
            if (info.stop_description){
                stop_info['description'] = info.stop_description;
            }
            if (info.stop_url){
                stop_info['url'] = info.stop_description;
            }

            this.nodes[node_id].setStopInfo(
                stop_info
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
            if ( lastSelect ){
                if (element)
                {this.updateElementLayerByID(element.getID);}
                layers["select"].getSource().removeFeature(
                    lastSelect.feature
                );
            }
            lastSelect = element;
            if ( lastSelect ){
                layers["select"].getSource().addFeature(
                    lastSelect.feature
                );
            }
        };

        this.getLastSelectedNode = () => {
            return lastSelect; // FIXME
        };

        this.disableElementsByType = (type) =>{
            if (type == streetElementNode.type.ENDPOINT |
                type == streetElementNode.type.STOP     |
                type == streetElementNode.type.SHAPE    |
                type == streetElementNode.type.FORK     |
                type == streetElementLink.type.LINK     |
                type == streetElementLink.type.DIRECTION)
            {
                layers[type].setVisible(false);
            } else {
                console.log("Error: layer "+ type +" not found");
            }
        };

        this.enableElementsByType = (type) =>{
            if (type == streetElementNode.type.ENDPOINT |
                type == streetElementNode.type.STOP     |
                type == streetElementNode.type.SHAPE    |
                type == streetElementNode.type.FORK     |
                type == streetElementLink.type.LINK     |
                type == streetElementLink.type.DIRECTION)
            {
                layers[type].setVisible(true);
            } else {
                console.log("Error: layer "+ type +" not found");
            }
        };

        ////// END Privileged methods //////

        ////// Public data //////
        this.nodes     = []; // could it to be private? // TODO
        this.links     = []; // could it to be private? // TODO

        this.shapes    = [];
        this.agencies  = [];
        this.routes    = [];
        this.trips     = [];
        this.stopTimes = [];

        ////// END Public data //////

        // Add layers
        addLayer(streetElementLink.type.LINK,        "#585CCB"); // links between nodes
        addLayer(streetElementNode.type.SHAPE,       "#585CCB");
        addLayer(streetElementNode.type.FORK,        "#A46FF5");
        addLayer(streetElementNode.type.STOP,        "#DA1033");
        addLayer(streetElementNode.type.ENDPOINT,    "green");
        addLayer(streetElementLink.type.DIRECTION,   "yellow"); // link direction
        addLayer("select",                           "yellow");
    } ////// END streetElementGroup constructor //////

    ////// Public methods //////

    static isInstance ( obj ){
        if (typeof(obj) == "object"){
            if (obj.constructor.name == streetElementGroup.name){
                return true;
            }
        }
        console.log("The variable is not a " + streetElementGroup.name + " instance");
        return false;
    }

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

    nodesBetween(nodeA, nodeB){
        if ( streetElementNode.isInstance(nodeA) &
             streetElementNode.isInstance(nodeB) ) {
            console.log("both are nodes");
        } else {
            console.log("bad arguments");
        }
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

