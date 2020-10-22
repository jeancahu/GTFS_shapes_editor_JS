//////////////// GTFS streetElements ///////////////////
////                                                ////
////  This library tries to encapsulate some of the ////
////  more necessary tables and elements required   ////
////  by the General Transit Feed Specification,    ////
////  format
////
////

class streetElementShape {
    constructor (shape_id
                ) {
        var shape_array = [];
        var shape_id_array = [];

        //////////// Privileged //////////////
        this.shape_id = () => {
            return shape_id; // TODO
        };

        this.getShapeArray = () => {
            return shape_array;
        };

        this.concatSegment = (shape_segment) => {
            if (shape_array.length == 0){
                shape_array = shape_segment;
            } else {
                if (shape_array[shape_array.length -1] == shape_segment[0]){
                    // it's ok
                } else {
                    // it's not compatible
                }
            }
        };

        this.getAllowedSegmentsToConcat = () => {
            if (shape_array.length){
                var result = [];
                var link_to_exclude = streetElementLink.getLinkBetween(
                    shape_array[shape_array.length -1],
                    shape_array[shape_array.length -2],
                );
                var allowed_links = streetElementLink.getLinksFromNode(
                    shape_array[shape_array.length -1],
                    [link_to_exclude]
                );
                allowed_links.forEach((link) => {
                    result.push([shape_array[shape_array.length -1], link]);
                });
                return result;
            } else {
                return ['*'];
            }

        };

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

    // static route (nodeA, nodeB) {
    //     if (streetElementNode.isInstance(nodeA) &
    //         streetElementNode.isInstance(nodeB)) {
    //         result = [];
    //         var connections = nodeA.getConnections();
    //         for (var i=0; i < connections.length ; i++) {
    //             console.log(connections[i]);
    //         }
    //         return result;
    //     } else {
    //         // bad arguments
    //         return null;
    //     }
    // }

    static routeSegmentUntilNode (nodeA, link, nodeB) { // return a shape segment
        return []; // TODO
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
            } else if (nextNode.getConnections().length == 1){ // Endpoint
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
