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
                 service_id,
                 trip_id,
                 direction_id,
                 shape_id  // Shape object
                ) {
        this.route_id = route_id;
        this.service_id = service_id;
        this.trip_id = trip_id;
        this.direction_id = direction_id;
        this.shape_id = shape_id;
    }
    // Create a function for every param to
    // verify if it is a valid valor // TODO
}
