//////////////// GTFS streetElements ///////////////////
////                                                ////
////  This library tries to encapsulate some of the ////
////  more necessary tables and elements required   ////
////  by the General Transit Feed Specification,    ////
////  format
////
////

class streetElementShape {
    constructor (s_shape_id,
                 s_node_array
                ) {
        this.shape_id = s_shape_id;
        this.node_array = s_node_array;
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
}
