//////////////// GTFS streetElements ///////////////////
////                                                ////
////  This library tries to encapsulate some of the ////
////  more necessary tables and elements required   ////
////  by the General Transit Feed Specification,    ////
////  format
////
////

class streetElementScheme {
    constructor (id,
                 service_id,
                 trip_id
                ) {

        this.getID = () => {
            return id;
        };

        this.getInfo = () => {
            return {
                service_id: service_id,
                trip_id: trip_id
            };
        };
    }

    // Create a function for every param to
    // verify if it is a valid valor // TODO
    static isInstance (obj) {
        if (typeof(obj) == "object"){
            if (obj.constructor.name == streetElementScheme.name){
                return true;
            }
        }
        console.log("The variable is not a " + streetElementScheme.name + " instance");
        return false;
    }

}
