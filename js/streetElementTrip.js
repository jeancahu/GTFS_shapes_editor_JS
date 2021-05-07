//////////////// GTFS streetElements ///////////////////
////                                                ////
////  This library tries to encapsulate some of the ////
////  more necessary tables and elements required   ////
////  by the General Transit Feed Specification,    ////
////  format
////
////

class streetElementTrip {
    constructor (route_id, // Route object
                 id, // trip id // TODO move top
                 direction_id,
                 shape_id  // Shape object
                ) {

        this.getID = () => id;

        this.getInfo = () => {
            return {
                route_id: route_id,
                trip_id: id,
                direction_id: direction_id,
                shape_id: shape_id
            };
        };

    }
    // Create a function for every param to
    // verify if it is a valid valor // TODO
    static isInstance ( obj ){
        if (typeof(obj) == "object"){
            if (obj.constructor.name == streetElementTrip.name){
                return true;
            }
        }
        console.log("The variable is not a " + streetElementTrip.name + " instance");
        return false;
    }

}

module.exports = streetElementTrip;
