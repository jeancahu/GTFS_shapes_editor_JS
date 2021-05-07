import {fromLonLat } from 'ol/proj';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';

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
        var connections = [];    // Links who connect this element to others nodes

        // Public elements
        this.valid = true;

        const feature = new Feature({ // The feature
	          geometry: new Point(fromLonLat([
	              coordenate[0],
                coordenate[1]
	          ]))
        });

        this.stop_info = {}; // TODO : private

        feature.parent = this; // Pass parent reference

        layer.getSource().addFeature(feature); // Gettin visible on map

        /////////////// Privileged methods

        this.getID = () => id;

        this.getCoordinates = () => {
            return feature.getGeometry().getCoordinates();
        };

        this.getFlatCoordinates = () => {
            return feature.getGeometry().flatCoordinates;
        };

        this.setCoordinates = ( coordenate ) => {
            feature.getGeometry().setCoordinates(
                fromLonLat([
	                  coordenate[0],
                    coordenate[1]
	              ]));
            for( var i in connections ){
                connections[i].update(); // Update link
            }
        };

        this.setLayer = (new_layer) => {
            layer.getSource().removeFeature(feature);
            layer = new_layer;
            layer.getSource().addFeature(feature);
        };

        this.getType = () => { // Layer name is the element type
            return layer.name; // TODO: smarter type resolve
        };

        this.getFeatureUID = () => {
            return feature.ol_uid;
        };

        this.addConnection = (value) =>{
            // value: streetElementLink
            //verify if there are more than X connections
            connections.push(value);
        };

        this.getConnections = () => {
            return connections;
        };

        // TODO push, rotation
        this.removeConnection = (link) => {
            // link: streetElementLink
            if (this.valid){
                for (var i in connections ){ // TODO : use filter
                    if (connections[i].getID() == link.getID()){
                        connections.splice(i, 1);
                    }
                }
            }
        };

        // Terminate element
        this.terminate = () => {
            // delete feature // TODO
            // parent has to delete connections first

            // Set it as invalid
            this.valid = false;

            // Terminate links:
            connections.forEach((value, index)=>{
                value.terminate(); // Terminate link
            });

            // Remove feature from map
            layer.getSource().removeFeature(feature);

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

    setStopInfo (stop_info){
        // @param: map: stop_info, a map with the stop info
        // TODO verify info
        this.stop_info = stop_info;
    }

    getStopInfo (){
        if (this.getType() == streetElementNode.type.STOP |
            this.getType() == streetElementNode.type.ENDPOINT){
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
}

module.exports = streetElementNode;
