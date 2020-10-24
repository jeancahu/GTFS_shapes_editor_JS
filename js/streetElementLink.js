//////////////// GTFS streetElements ///////////////////
////                                                ////
////  This library tries to encapsulate some of the ////
////  more necessary tables and elements required   ////
////  by the General Transit Feed Specification,    ////
////  format
////
////

class streetElementLink { // Link between two nodes
    constructor (id, nodeA, nodeB, layer, direction_layer) {
        this.valid = true;
        this.id = id;

        this.layer = layer;
        this.direction_layer = direction_layer;

        var coordinates = [
            nodeA.feature.getGeometry().flatCoordinates,
            nodeB.feature.getGeometry().flatCoordinates
        ];
        var rev_coordinates = [
            nodeB.feature.getGeometry().flatCoordinates,
            nodeA.feature.getGeometry().flatCoordinates
        ];

        this.nodeA = nodeA;
        this.nodeB = nodeB;

        this.feature = new ol.Feature({
            geometry: new ol.geom.LineString(coordinates),
            name: 'Line'
        });
        this.rev_feature = new ol.Feature({
            geometry: new ol.geom.LineString(rev_coordinates),
            name: 'Line'
        });

        this.feature.parent = this;
        this.rev_feature.parent = this;

        layer.getSource().addFeature(this.feature);
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
                return link.getID == excluded_link.getID;
            })){
                // ignore the link
            } else { // add the link
                result.push(link);
            }
            //// end for each link
        });
        return result;
    }

    update () { // Update figure on map
        var coordinates = [
            this.nodeA.feature.getGeometry().flatCoordinates,
            this.nodeB.feature.getGeometry().flatCoordinates
        ];
        var rev_coordinates = [
            this.nodeB.feature.getGeometry().flatCoordinates,
            this.nodeA.feature.getGeometry().flatCoordinates
        ];

        this.feature.getGeometry().setCoordinates(coordinates);
        this.rev_feature.getGeometry().setCoordinates(rev_coordinates);
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

    setDirectionFromNode (node) {
        if (node == this.nodeA){
            console.log("set_direction 0");
            this.direction_layer.getSource().addFeature(this.feature);

            if (
                this.direction_layer.getSource().getFeatures().some(
                    (feature) => {return feature.ol_uid == this.rev_feature.ol_uid;}
                )
            ){
                this.direction_layer.getSource().removeFeature(this.rev_feature);
            }
        } else if (node == this.nodeB){
            console.log("set_direction 1");
            this.direction_layer.getSource().addFeature(this.rev_feature);
            if (
                this.direction_layer.getSource().getFeatures().some(
                    (feature) => {return feature.ol_uid == this.feature.ol_uid;}
                )
            ){
                this.direction_layer.getSource().removeFeature(this.feature);
            }
        } else {
            console.log("Error: node is not in the link");
        }
    }

    hideDirection () {
        if (
            this.direction_layer.getSource().getFeatures().some(
                (feature) => {return feature.ol_uid == this.rev_feature.ol_uid;}
            )
        ){
            this.direction_layer.getSource().removeFeature(this.rev_feature);
        }
        if (
            this.direction_layer.getSource().getFeatures().some(
                (feature) => {return feature.ol_uid == this.feature.ol_uid;}
            )
        ){
            this.direction_layer.getSource().removeFeature(this.feature);
        }
    }

    terminate (){
        // node: node who killed the link
        // delete feature // TODO
        // parent has to delete connections first
        this.valid = false;
        this.layer.getSource().removeFeature(this.feature);
        this.hideDirection();
        this.nodeA.removeConnection(this);
        this.nodeB.removeConnection(this);
    }
}
