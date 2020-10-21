//////////////// GTFS streetElements ///////////////////
////                                                ////
////  This library tries to encapsulate some of the ////
////  more necessary tables and elements required   ////
////  by the General Transit Feed Specification,    ////
////  format
////
////

class streetElementCalendar {
    constructor (service_id,
                ) {
        this.agency_id = agency_id;
    }

    static get type () {
        return { // enum for service on day
            AVAILABLE: 1,
            UNAVAILABLE: 0
        };
    }

    // Create a function for every param to
    // verify if it is a valid valor // TODO
    static isInstance ( obj ){
        if (typeof(obj) == "object"){
            if (obj.constructor.name == streetElementCalendar.name){
                return true;
            }
        }
        console.log("The variable is not a " + streetElementCalendar.name + " instance");
        return false;
    }

}
