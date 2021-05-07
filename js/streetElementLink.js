import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';

//////////////// GTFS streetElements ///////////////////
////                                                ////
////  This library tries to encapsulate some of the ////
////  more necessary tables and elements required   ////
////  by the General Transit Feed Specification,    ////
////  format
////
////

class streetElementLink { // Link between two nodes
    constructor (
        id,        // Link indentificator
        nodeA,     // StreetElementNode object
        nodeB,     // StreetElementNode object
        layer,     // OL-Layer object
        direction_layer  // OL-Layer object
    ) {
        this.valid = true;

        var coordinates = [
            nodeA.getFlatCoordinates(),
            nodeB.getFlatCoordinates()
        ];
        var rev_coordinates = [
            nodeB.getFlatCoordinates(),
            nodeA.getFlatCoordinates()
        ];

        this.nodeA = nodeA;
        this.nodeB = nodeB;

        const feature = new Feature({
            geometry: new LineString(coordinates),
            name: 'Line'
        });
        const rev_feature = new Feature({
            geometry: new LineString(rev_coordinates),
            name: 'Line'
        });

        feature.parent = this;
        rev_feature.parent = this;

        layer.getSource().addFeature(feature);

        ////// Privileged methods

        this.getID = () => id;

        this.update = () => { // Update figure on map
            var coordinates = [
                this.nodeA.getFlatCoordinates(),
                this.nodeB.getFlatCoordinates()
            ];
            var rev_coordinates = [
                this.nodeB.getFlatCoordinates(),
                this.nodeA.getFlatCoordinates()
            ];

            feature.getGeometry().setCoordinates(coordinates);
            rev_feature.getGeometry().setCoordinates(rev_coordinates);
        };

        this.setDirectionFromNode = (node) => {
            this.hideDirection();
            if (node == this.nodeA){
                console.log("set_direction 0");
                direction_layer.getSource().addFeature(feature);
            } else if (node == this.nodeB){
                console.log("set_direction 1");
                direction_layer.getSource().addFeature(rev_feature);
            } else {
                console.log("Error: node is not in the link");
            }
        };

        this.hideDirection = () => {
            if (
                direction_layer.getSource().getFeatures().some(
                    (i_feature) => {return i_feature.ol_uid == rev_feature.ol_uid;}
                )
            ){
                direction_layer.getSource().removeFeature(rev_feature);
            }
            if (
                direction_layer.getSource().getFeatures().some(
                    (i_feature) => {return i_feature.ol_uid == feature.ol_uid;}
                )
            ){
                direction_layer.getSource().removeFeature(feature);
            }
        };

        this.terminate = () => {
            // node: node who killed the link
            // delete feature // TODO
            // parent has to delete connections first
            this.valid = false;
            layer.getSource().removeFeature(feature);
            this.hideDirection();
            this.nodeA.removeConnection(this);
            this.nodeB.removeConnection(this);
        };
    }

    static isInstance (obj) {
        if (typeof(obj) == "object"){
            if (obj.constructor.name == streetElementLink.name){
                return true;
            }
        }
        console.log("The variable is not a " + streetElementLink.name + " instance");
        return false;
    }

    static get type () {
        return {
            LINK: "link",
            DIRECTION: "arrow"
        };
    }

    static getLinkBetween (nodeA, nodeB) {
        var result;
        var links = nodeA.getConnections();
        links.some((link) => {
            if (link.getPartner(nodeA) == nodeB){
                result = link;
                return true;
            }
        });
        return result;
    }

    static getLinksFromNode (node, exclude=[]) {
        var result = [];
        var links = node.getConnections();
        links.forEach((link) =>{
            //// for each link

            if (exclude.some((excluded_link) => {
                return link.getID() == excluded_link.getID();
            })){
                // ignore the link
            } else { // add the link
                result.push(link);
            }
            //// end for each link
        });
        return result;
    }

    getPartner (node) {
        if ( node.getID() == this.nodeA.getID() ){
            return this.nodeB;
        } else if ( node.getID() == this.nodeB.getID() ){
            return this.nodeA;
        } else {
            return null;
        }
    }

}

module.exports = streetElementLink;
