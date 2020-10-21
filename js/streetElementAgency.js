//////////////// GTFS streetElements ///////////////////
////                                                ////
////  This library tries to encapsulate some of the ////
////  more necessary tables and elements required   ////
////  by the General Transit Feed Specification,    ////
////  format
////
////

class streetElementAgency {
    constructor (agency_id,
                 agency_name,
                 agency_url,
                 agency_timezone,
                 agency_lang,
                 agency_phone,
                 agency_fare_url,
                 agency_email
                ) {
        this.agency_id = agency_id;
        this.agency_name = agency_name;
        this.agency_url = agency_url;
        this.agency_timezone = agency_timezone;
        this.agency_lang = agency_lang;
        this.agency_phone = agency_phone;
        this.agency_fare_url = agency_fare_url;
        this.agency_email = agency_email;
    }
    // Create a function for every param to
    // verify if it is a valid valor // TODO
    static isInstance ( obj ){
        if (typeof(obj) == "object"){
            if (obj.constructor.name == streetElementAgency.name){
                return true;
            }
        }
        console.log("The variable is not a " + streetElementAgency.name + " instance");
        return false;
    }

}
