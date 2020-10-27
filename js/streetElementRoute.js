//////////////// GTFS streetElements ///////////////////
////                                                ////
////  This library tries to encapsulate some of the ////
////  more necessary tables and elements required   ////
////  by the General Transit Feed Specification,    ////
////  format
////
////

class streetElementRoute {
    constructor (id,
                 agency_id,  // agency object
                 short_name,
                 long_name,
                 type
                ) {

        this.getID = () => {
            return id;
        };

        this.getInfo = () => {
            return {
                agency_id: agency_id,
                short_name: short_name,
                long_name: long_name,
                type: type
            };
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
