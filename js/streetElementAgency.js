//////////////// GTFS streetElements ///////////////////
////                                                ////
////  This library tries to encapsulate some of the ////
////  more necessary tables and elements required   ////
////  by the General Transit Feed Specification,    ////
////  format
////
////

class streetElementAgency {
    constructor (id,
                 name,
                 url,
                 timezone,
                 lang,
                 phone,
                 fare_url,
                 email
                ) {

        this.getID = () => id;

        this.getInfo = () => {
            return {
                id: id,
                name: name,
                url: url,
                timezone: timezone,
                lang: lang,
                phone: phone,
                fare_url: fare_url,
                email: email
            };
        };
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

module.exports = streetElementAgency;
