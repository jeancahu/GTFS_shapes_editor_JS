const streetElementNode = require('./streetElementNode.js');

//////////////// GTFS streetElements ///////////////////
////                                                ////
////  This library tries to encapsulate some of the ////
////  more necessary tables and elements required   ////
////  by the General Transit Feed Specification,    ////
////  format
////
////

class streetElementShape {
    constructor (shape_id,
                 segments
                ) {
        var shape_nodes = [];
        var shape_id_array = [];

        //////////// Privileged //////////////
        this.getID = () => shape_id; // TODO

        this.getInfo = () => {
            return {
                id: shape_id,
                points: [] // TODO
            };
        };

        this.getSequenceText = () => {
            var result = '';
            segments.forEach(
                segment =>{
                    result += 'n'+segment[0]+'l'+segment[1]+',';
                });
            return result; // TODO
        };

        this.getSegments = () => segments;

        this.valid = () => true; // TODO

        this.getNodeArray = () => shape_nodes;

        this.concatSegment = (shape_segment) => {
            if (shape_nodes.length == 0){
                shape_nodes = shape_segment;
            } else {
                if (shape_nodes[shape_nodes.length -1] == shape_segment[0]){
                    // it's ok
                } else {
                    // it's not compatible
                }
            }
        };

        this.getAllowedSegmentsToConcat = () => {
            if (shape_nodes.length){
                var result = [];
                var link_to_exclude = streetElementLink.getLinkBetween(
                    shape_nodes[shape_nodes.length -1],
                    shape_nodes[shape_nodes.length -2],
                );
                var allowed_links = streetElementLink.getLinksFromNode(
                    shape_nodes[shape_nodes.length -1],
                    [link_to_exclude]
                );
                allowed_links.forEach((link) => {
                    result.push([shape_nodes[shape_nodes.length -1], link]);
                });
                return result;
            } else {
                return ['*'];
            }

        };

        // TODO // this.getStops

    }

    static isInstance (obj) {
        if (typeof(obj) == "object"){
            if (obj.constructor.name == streetElementShape.name){
                return true;
            }
        }
        console.log("The variable is not a " + streetElementShape.name + " instance");
        return false;
    }

    static routeSegment (node, link) { // return a shape segment
        var result = [node];
        var nextNode = link.getPartner(node);

        if (nextNode) {
            // Node in the link
        } else {
            // Node not found
            return null;
        }

        if (nextNode.valid) {
            if (nextNode.getConnections().length > 2){ // It is a fork
                result.push(nextNode); // to return the fork and end execution
            } else if (nextNode.getConnections().length == 1 |
                      nextNode.getType() == streetElementNode.type.ENDPOINT){ // Endpoint
                result.push(nextNode); // to return the endpoint and end execution
            } else { // return the nodes until fork/endpoint
                nextNode.getConnections().forEach((inner_link) => {
                    if (inner_link != link){
                        // it is not the same link
                        result = result.concat( // TODO, eval null return
                            streetElementShape.routeSegment(nextNode, inner_link)
                        );
                    }
                });
            }
            return result;
        } else {
            return null;
        }
    }
}

module.exports = streetElementShape;
