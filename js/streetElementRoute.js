//////////////// GTFS streetElements ///////////////////
////                                                ////
////  This library tries to encapsulate some of the ////
////  more necessary tables and elements required   ////
////  by the General Transit Feed Specification,    ////
////  format
////
////

class streetElementRoute {
    constructor (route_id,
                 agency_id,  // agency object
                 route_short_name,
                 route_long_name,
                 route_type
                ) {
        this.agency_id = agency_id;
        this.route_short_name = route_short_name;
        this.route_long_name = route_long_name;
        this.route_type = route_type;

        this.getID = () => {
            return route_id;
        };
    }
    // Create a function for every param to
    // verify if it is a valid valor // TODO
    static isInstance (obj) {
        if (typeof(obj) == "object"){
            if (obj.constructor.name == streetElementRoute.name){
                return true;
            }
        }
        console.log("The variable is not a " + streetElementRoute.name + " instance");
        return false;
    }

}
