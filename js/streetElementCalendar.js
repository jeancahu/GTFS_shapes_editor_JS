//////////////// GTFS streetElements ///////////////////
////                                                ////
////  This library tries to encapsulate some of the ////
////  more necessary tables and elements required   ////
////  by the General Transit Feed Specification,    ////
////  format
////
////

class streetElementCalendar {
    constructor (service_info
                ) {
        this.getInfo = () => {
            return service_info;
        };
        this.getServiceDays = () => {
            return [
                service_info["monday"],
                service_info["tuesday"],
                service_info["wednesday"],
                service_info["thursday"],
                service_info["friday"],
                service_info["saturday"],
                service_info["sunday"]
            ];
        };
        this.getID = () => {
            return service_info.service_id;
        };
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
