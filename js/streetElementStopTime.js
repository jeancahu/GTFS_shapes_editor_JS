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
                 stop_id  // Stop object
                ) {

        this.getID = () => stop_id;

        this.getInfo = () => {
            return {
                trip_id: trip_id,
                arrival_time: arrival_time,
                departure_time: departure_time,
                stop_id: stop_id
            };
        };
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

module.exports = streetElementStopTime;
