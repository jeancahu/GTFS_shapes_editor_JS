//////////////// GTFS streetElements ///////////////////
////                                                ////
////  This library tries to encapsulate some of the ////
////  more necessary tables and elements required   ////
////  by the General Transit Feed Specification,    ////
////  format
////
////  streetElementNode: this class represents      ////
////  every single point necessary to reproduce the ////
////  shape

class streetElementNode {
    constructor (id, coordenate, layer) {
        // Private

        // Public elements
        this.valid = true;
        this.id = id;            // The streetElementNode ID

        const feature = new ol.Feature({ // The feature
	          geometry: new ol.geom.Point(ol.proj.fromLonLat([
	              coordenate[0],
                coordenate[1]
	          ]))
        });

        this.connections = [];    // Links who connect this element to others nodes
        this.stop_info = {};

        feature.parent = this; // Pass parent reference

        this.layer = layer; // Define the layer ( and type )
        this.layer.getSource().addFeature(feature); // Gettin visible on map

        this.getCoordinates = () => {
            return feature.getGeometry().getCoordinates();
        };

        this.getFlatCoordinates = () => {
            return feature.getGeometry().flatCoordinates;
        };

        this.setCoordinates = ( coordenate ) => {
            feature.getGeometry().setCoordinates(
                ol.proj.fromLonLat([
	                  coordenate[0],
                    coordenate[1]
	              ]));
            for( var i in this.connections ){
                this.connections[i].update(); // Update link
            }
        };

        this.setLayer = (layer) => {
            this.layer.getSource().removeFeature(feature);
            this.layer = layer;
            this.layer.getSource().addFeature(feature);
        };

        this.getFeatureUID = () => {
            return feature.ol_uid;
        };

        // Terminate element
        this.terminate = () => {
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
            this.layer.getSource().removeFeature(feature);

        };
    }

    static isInstance (obj) {
        if (typeof(obj) == "object"){
            if (obj.constructor.name == streetElementNode.name){
                return true;
            }
        }
        console.log("The variable is not a " + streetElementNode.name + " instance");
        return false;
    }

    static distance (nodeA, nodeB) { // TODO distance between two nodes
        console.log("TODO distance between two nodes");
    }

    static get type () {
        return { // The only possible node types
            FORK: "fork",
            SHAPE: "shape",
            ENDPOINT: "endpoint",
            STOP: "stop"
        };
    }

    get type (){ // Layer name is the element type
        return this.layer.name; // TODO: smarter type resolve
    }

    setID (value){
        this.id = value;
    }

    get getID (){
        return this.id;
    }

    setStopInfo (stop_info){
        // @param: map: stop_info, a map with the stop info
        // TODO verify info
        this.stop_info = stop_info;
    }

    getStopInfo (){
        if (this.type == streetElementNode.type.STOP |
            this.type == streetElementNode.type.ENDPOINT){
            return this.stop_info;
        } else {
            var result = {
                id: '',
                name: '',
                description: '',
                url: ''
            };
            return result;
        }
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
}
