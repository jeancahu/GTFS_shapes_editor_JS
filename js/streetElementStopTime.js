//////////////// GTFS streetElements ///////////////////
////                                                ////
////  This library tries to encapsulate some of the ////
////  more necessary tables and elements required   ////
////  by the General Transit Feed Specification,    ////
////  format
////
////

class streetElementStopTime {
    constructor (trip_id,  // Trip object
                 arrival_time,
                 departure_time,
                 stop_id,  // Stop object
                 stop_sequence
                ) {
        this.trip_id = trip_id;
        this.arrival_time = arrival_time;
        this.departure_time = departure_time;
        this.stop_id = stop_id;
        this.stop_sequence = stop_sequence;
    }
    // Create a function for every param to
    // verify if it is a valid valor // TODO
    static isInstance (obj) {
        if (typeof(obj) == "object"){
            if (obj.constructor.name == streetElementStopTime.name){
                return true;
            }
        }
        console.log("The variable is not a " + streetElementStopTime.name + " instance");
        return false;
    }

}
