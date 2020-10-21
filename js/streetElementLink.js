//////////////// GTFS streetElements ///////////////////
////                                                ////
////  This library tries to encapsulate some of the ////
////  more necessary tables and elements required   ////
////  by the General Transit Feed Specification,    ////
////  format
////
////

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

    static isInstance (obj) {
        if (typeof(obj) == "object"){
            if (obj.constructor.name == streetElementLink.name){
                return true;
            }
        }
        console.log("The variable is not a " + streetElementLink.name + " instance");
        return false;
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
