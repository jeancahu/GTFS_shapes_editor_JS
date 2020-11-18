//////////////////// Vue experiments ////////////////////////////

const en_US = new Proxy(
{
    add:             "Add",
    remove:          "Remove",
    agency:          "Agency",
    shapes:          "Shapes",
    stops:           "Stops",
    routes:          "Routes",
    trips:           "Trips",
    calendar:        "Calendar",
    stop_times:      "Stop times",
    scheme:          "Scheme",

    shape_id:        "Shape ID",

    agency_id:       "Agency ID",
    agency_name:     "Name",
    agency_url:      "Web-site",
    agency_timezone: "Time zone",
    agency_lang:     "Language",
    agency_phone:    "Phone number",
    agency_email:    "e-mail",

    stop_id:         "Stop ID",
    stop_name:       "Name",
    stop_desc:       "Description",
    stop_url:        "Information URL",

    r_route_id:         "Route ID",
    r_route_short_name: "Short name",
    r_route_long_name:  "Long name",
    r_route_type:       "Type",
    r_agency_id:        "Agency",

    c_service_id:    "Service ID",
    c_monday:        "Monday",
    c_tuesday:       "Tuesday",
    c_wednesday:     "Wednesday",
    c_thursday:      "Thursday",
    c_friday:        "Friday",
    c_saturday:      "Saturday",
    c_sunday:        "Sunday",
    c_start_day:     "Start day",
    c_end_day:       "End day",

    t_route_id:      "Route",
    t_service_id:    "Service",
    t_trip_id:       "Trip ID",
    t_direction_id:  "Direction",
    t_shape_id:      "Shape",
    inbound_travel:  "Inbound",
    outbound_travel: "Outbound",

    st_trip_id:        "Trip",
    st_arrival_time:   "Arrival time",
    st_departure_time: "Departure time",
    st_stop_id:        "Stop",
    st_stop_sequence:  "Sequence"
},
    { // handler
        get: function(target, name) {
            return target.hasOwnProperty(name) ? target[name] : name;
        }
    }
);

const es_CR = new Proxy(
    {
    add:             "Agregar",
    remove:          "Eliminar",
    agency:          "Empresa",
    shapes:          "Recorridos",
    stops:           "Paradas",
    routes:          "Rutas",
    trips:           "Viajes",
    calendar:        "Servicios",
    stop_times:      "Horarios",
    scheme:          "Programa",

    shape_id:        "ID Recor.",

    agency_id:       "ID Empr.",
    agency_name:     "Nombre",
    agency_url:      "Sitio web",
    agency_timezone: "Zona horaria",
    agency_lang:     "Idioma",
    agency_phone:    "Telefono",
    agency_email:    "e-mail",

    stop_id:         "ID Parada",
    stop_name:       "Nombre",
    stop_desc:       "Descripción",
    stop_url:        "URL Información",

    r_route_id:         "ID Ruta",
    r_route_short_name: "Nombre corto",
    r_route_long_name:  "Nombre largo",
    r_route_type:       "Tipo",
    r_agency_id:        "Empresa",

    c_service_id:    "ID servicio",
    c_monday:        "Lunes",
    c_tuesday:       "Martes",
    c_wednesday:     "Miércoles",
    c_thursday:      "Jueves",
    c_friday:        "Viernes",
    c_saturday:      "Sábado",
    c_sunday:        "Domingo",
    c_start_day:     "Día de inicio",
    c_end_day:       "Día final",

    t_route_id:      "Ruta",
    t_service_id:    "Servicio",
    t_trip_id:       "ID viaje",
    t_direction_id:  "Dirección",
    t_shape_id:      "Recorrido",
    inbound_travel:  "Regreso",
    outbound_travel: "Ida",

    st_trip_id:        "Viaje",
    st_arrival_time:   "Llegada",
    st_departure_time: "Salida",
    st_stop_id:        "Parada",
    st_stop_sequence:  "Secuencia"
},
      { // handler
          get: function(target, name) {
              return target.hasOwnProperty(name) ? target[name] : name;
          }
      }
);

const editor_gtfs_conf = {
    data() {
        return {

            /////////////////// SIDEBAR
            map_hidden: false, // TODO
            map_action: 'select',

            // map_node_type:, // TODO

            map_view_nodes: true,
            map_view_links: true,
            map_view_stops: true,
            ////////////////// END SIDEBAR

            language: "en_US",
            dict: en_US,

            showList: "shape", // it shows Shapes by default

            // Popup content structures
            popup_content: popup_content, // Gobal object

            nodes: o_se_group.nodes, // contains stops too FIXME

            agencies: o_se_group.agencies,
            shapes: o_se_group.shapes,
            routes: o_se_group.routes,
            services: o_se_group.services,
            schemes: o_se_group.schemes,
            trips: o_se_group.trips,
            stopTimes: o_se_group.stopTimes,

            // Stop times section
            in_st_stop_id: 0,

            // Shapes section:
            ns_allowed_links: [],
            ns_segments: [],
            ns_head_node_id: null,

            agencyFields: [
                "agency_id",
								"agency_name",
								"agency_url",
                "agency_timezone",
                "agency_lang",
                "agency_phone",
                "agency_email"
            ],
            shapeFields: [
                "shape_id",
                "shape_pt_lat",
                "shape_pt_lon",
                "shape_pt_sequence",
                "shape_dist_traveled"
            ],
            stopFields: [
                "stop_id",
                "stop_name",
                "stop_desc",
                "stop_url"  // page with a photo and info about
            ],
            stopTimeFields: [
                "st_trip_id",
                "st_stop_id",
                "st_arrival_time",
                "st_departure_time"
            ],
            tripFields: [
                "t_route_id",
                "t_trip_id",
                "t_direction_id",
                "t_shape_id"
            ],
            routeFields: [
                "r_route_id",
                "r_agency_id",
                "r_route_short_name",
                "r_route_long_name",
                "r_route_type" // TODO, autobus by default
            ],

            calendarFields: [
                "c_service_id",
                "c_monday",
                "c_tuesday",
                "c_wednesday",
                "c_thursday",
                "c_friday",
                "c_saturday",
                "c_sunday",
                "c_start_day",
                "c_end_day"
            ],
            calendarCheckboxFields: [
                "c_monday",
                "c_tuesday",
                "c_wednesday",
                "c_thursday",
                "c_friday",
                "c_saturday",
                "c_sunday"
            ],

            r_routeType: [
                {value: 3, name: "autobus"},
                {value: 2, name: "train"},
                {value: 1, name: "metro"}
            ]
        };
    },
    watch:{
        map_action (new_state, old_state) {
            switch(new_state) { // TODO
            case "select":
                break;
            case "add":
                break;
            case "split":
                break;
            case "move":
                break;
            case "remove":
                break;
            case "cut":
                break;
            default:
                console.log("unknown action");
                this.map_action = "select";
            }
        },
        map_hidden (new_state, old_state) {
            document.getElementById("map_container").hidden =
                new_state;
            map.updateSize();
        },
        map_view_nodes (new_state, old_state) {
            if (new_state){
                o_se_group.enableElementsByType(
                    streetElementNode.type.SHAPE
                );
            } else {
                o_se_group.disableElementsByType(
                    streetElementNode.type.SHAPE
                );
            }
        },
        map_view_links (new_state, old_state) {
            if ( new_state ){
                o_se_group.enableElementsByType(
                    streetElementLink.type.LINK
                );
            } else {
                o_se_group.disableElementsByType(
                    streetElementLink.type.LINK
                );
            }
        },
        map_view_stops (new_state, old_state) {
            if ( new_state ){
                o_se_group.enableElementsByType(
                    streetElementNode.type.STOP
                );
            } else {
                o_se_group.disableElementsByType(
                    streetElementNode.type.STOP
                );
            }
        }
    },
    methods: {
        toggleHideMap () {
            document.getElementById("map_container").hidden =
                !document.getElementById("map_container").hidden;
            this.map_hidden = document.getElementById("map_container").hidden;
            map.updateSize();
        },
        changeNodeInfoFromPopup(node_id){
            o_se_group.changeNodeInfoByID(
                node_id,
                {
                    node_type: document.getElementById("ol_node_type").value,
                    stop_id: document.getElementById("ol_in_stop_id").value,
                    stop_name: document.getElementById("ol_in_stop_name").value
                    //stop_description: document.getElementById("").value,
                }
            );
            // Update popup
            popup_content.stop_info = o_se_group.nodes[node_id].getStopInfo();
            alert("Success: edit data"); // FIXME : remove
        },
        changeNodeInfoFromStopSection(node_id){
            o_se_group.changeNodeInfoByID(
                node_id,
                {
                    stop_id: document.getElementById("stop_id_"+node_id).value,
                    stop_name: document.getElementById("stop_name_"+node_id).value,
                    stop_description: document.getElementById("stop_desc_"+node_id).value,
                    stop_url: document.getElementById("stop_url_"+node_id).value,
                }
            );
            // Update popup
            popup_content.stop_info = o_se_group.nodes[node_id].getStopInfo();
            alert("Success: edit data"); // FIXME : remove
        },
        newShapeOnChange(event, element) {
            var element_id;
            if (typeof(event) == "number"){
                element_id = event;
            } else { // event object
                element_id = event.target.value;
                if (element != "node"){
                    event.target.value = 'noselect';
                }
            }
            if (element == 'node'){
                console.log("node ID: "+element_id);
                this.ns_head_node_id = Number(
                    element_id);
                if (element_id == 'noselect'){
                    this.ns_allowed_links = [];
                } else {
                    view.setCenter(this.nodes[element_id].getCoordinates()); // FIXME remove
                    view.setZoom(17.9); // FIXME remove

                    this.ns_allowed_links =
                        this.nodes[element_id].getConnections();
                }
            } else {
                console.log("link ID: "+element_id);
                if (element_id == 'noselect'){
                    // TODO
                } else {
                    var result = streetElementShape.routeSegment(
                        this.nodes[this.ns_head_node_id],
                        o_se_group.links[element_id] // FIXME
                    );
                    console.log(result);
                    if(result){
                        this.ns_segments.push(
                            // result // FIXME cyclic
                            [
                                this.ns_head_node_id,
                                Number(element_id),
                                result[result.length -1].getID
                            ]

                        );
                    }
                    this.goToNodeOnMap(result[result.length -1].getID());
                    this.ns_head_node_id =
                        result[result.length -1].getID();

                    excluded_link = streetElementLink.getLinkBetween(
                        result[result.length -1],
                        result[result.length -2]
                    );

                    // Hide direction
                    this.ns_allowed_links.forEach((link) => {
                        link.hideDirection();
                        link.oneshot = undefined;
                    });

                    this.ns_allowed_links =
                        streetElementLink.getLinksFromNode(
                            result[result.length -1],
                            [excluded_link]
                        );

                    // Show direction and set oneshot function
                    this.ns_allowed_links.forEach((link) => {
                        link.setDirectionFromNode(
                            result[result.length -1]);
                        link.oneshot = (link_id) => {
                            app.newShapeOnChange(link_id, 'oneshot');
                        };
                    });

                }
            }
        },
        goToNodeOnMap (node_id) { // TODO needs testing
            view.setCenter(this.nodes[node_id].getCoordinates());
            view.setZoom(17.9); // TODO use a config file
            console.log(node_id);
        },
        isVisible(value) { // Return a bool
            return ( value == this.showList );
        },
        saveAgency(){
            this.agencyFields.forEach( (value) => {
                console.log(value);
            }); // FIXME remove
            o_se_group.addAgency( // TODO, for, create a list, then use it as arg
                document.getElementById("agency_id").value,
						    document.getElementById("agency_name").value,
						    document.getElementById("agency_url").value,
                document.getElementById("agency_timezone").value,
                document.getElementById("agency_lang").value,
                document.getElementById("agency_phone").value,
                null, // FIXME
                document.getElementById("agency_email").value
            );
            console.log("saveAgency");
        },
        removeAgency (agency_id){ // TODO
            console.log("remove agency: " + agency_id);
            o_se_group.removeAgency(agency_id);
        },
        saveRoute(){
            o_se_group.addRoute(
                document.getElementById("r_route_id").value,
                document.getElementById("r_agency_id").value,
                document.getElementById("r_route_short_name").value,
                document.getElementById("r_route_long_name").value,
                document.getElementById("r_route_type").value
            );
            console.log("saveRoute");
        },
        removeRoute (route_id){ // TODO
            console.log("remove route: " + route_id);
            o_se_group.removeRoute(route_id);
        },
        saveShape(){ // save shape into streetElementGroup
            console.log(this.ns_segments);
            o_se_group.addShape(
                document.getElementById("new_shape_id").value,
                this.ns_segments
            );
            this.saveShapeStop();
        },
        removeShape (shape_id){ // TODO
            console.log("remove shape: " + shape_id);
            o_se_group.removeShape(shape_id);
        },
        saveShapeStop(){ // ends a new shape ingress or abort
            o_se_group.nodes[
                // lastnode in shape
                this.ns_segments[this.ns_segments.length -1][2]
            ].getConnections().forEach(
                connection => {
                    connection.hideDirection();     //
                    connection.oneshot = undefined; //
                });
            this.ns_segments = [];
            this.ns_allowed_links = [];
            this.ns_head_node_id = null;
        },
        saveCalendar(){
            var service_info = {};
            this.calendarFields.forEach(field => {
                if (document.getElementById(field).type == 'checkbox'){
                    console.log(document.getElementById(field).checked);
                    service_info[field.substring(2)] =
                        document.getElementById(field).checked;
                } else {
                    console.log(document.getElementById(field).value);
                    service_info[field.substring(2)] =
                        document.getElementById(field).value;
                }
            });

            // TODO verify data
            o_se_group.addService(
                service_info
            );

            console.log(service_info);
            console.log("saveCalendar");
        },
        removeCalendar (service_id){ // TODO
            console.log("remove service: " + service_id);
            o_se_group.removeService(service_id);
        },
        saveTrip(){
            o_se_group.addTrip(
                document.getElementById("t_route_id").value, // TODO, try to get the value without getElementById, using vue
                document.getElementById("t_trip_id").value,
                document.getElementById("t_direction_id").value,
                document.getElementById("t_shape_id").value
            );
            console.log("saveTrip");
        },
        removeTrip (trip_id){ // TODO
            console.log("remove trip: " + trip_id);
            o_se_group.removeTrip(trip_id);
        },
        saveStopTime(){
            o_se_group.addStopTime(
                document.getElementById("st_trip_id").value, // TODO, get value without getElementById
                document.getElementById("st_arrival_time").value,
                document.getElementById("st_departure_time").value,
                document.getElementById("st_stop_id").value
            );
            console.log("saveStopTime");
        },
        removeStopTime (trip_id, stop_id){ // TODO
            console.log("remove stoptime: " + trip_id + ' ' + stop_id);
            o_se_group.removeStopTime(trip_id, stop_id);
        },
        saveScheme(){
            o_se_group.addScheme(
                o_se_group.schemes.length, // FIXME
                document.getElementById("sc_service_id").value,
                document.getElementById("sc_trip_id").value
            );
        },
        removeScheme (scheme_id){ // TODO
            console.log("remove scheme: " + scheme_id);
        }
    },
    computed: {
        popup_node_type_is_stop (){
            return this.popup_content.type == streetElementNode.type.STOP |
                this.popup_content.type == streetElementNode.type.ENDPOINT;
        },
        new_shape_sequence () {
            if (this.ns_segments.length){
                //
            } else {
                return '';
            }

            var result = 'b';

            this.ns_segments.forEach((segment) => {
                result += 'n'+String(segment[0]) + 'l'+String(segment[1]);
            });

            result += 'en' + String(this.ns_segments[
                this.ns_segments.length -1
            ][2]);

            return result;
        },
        new_shape_allowed_nodes() {
            var result = [];
            if (this.ns_segments.length){
                // this.ns_segments(
                //     this.ns_segments.length -1
                // ); // last node in shape
            } else {
                result = this.nodes.slice().reverse();
                result = result.filter(filterValidNode);
                result = result.filter(filterEndpointNode);
            }
            return result;
        },
        stopsWhenTrip () { // TODO
            // document.getElementById("st_trip_id")
            // get shape from trip
            // get nodes from shape
            // get stops from nodes
            // return stops

            var result = this.nodes.slice().reverse();
            result = result.filter(filterValidNode);
            result = result.filter(filterStopNode);
            return result;
        },
        rev_endpoints () {
            // return end valid endpoints
            var result = this.nodes.slice().reverse();
            result = result.filter(filterValidNode);
            result = result.filter(filterEndpointNode);
            return result;
        },
        rev_shapes () {
            var result = this.shapes.array.slice().reverse();
            result = result.filter(filterValidShapeSegment);
            return result;
        },
        rev_stops () { // TODO
            var result = this.nodes.slice().reverse();
            result = result.filter(filterValidNode);
            result = result.filter(filterStopNode);
            return result;
        },
        rev_agencies () {
            return this.agencies.array.slice().reverse();
        },
        rev_routes () {
            return this.routes.array.slice().reverse();
        },
        rev_services () {
            return this.services.array.slice().reverse();
        },
        rev_trips () {
            return this.trips.array.slice().reverse();
        },
        rev_stoptimes () { // TODO
            return this.stopTimes.array.slice().reverse();
        },
        rev_schemes () { // TODO
            return this.schemes.slice().reverse();
        }
    },
    filters: {
        input_box(value) {
            return "<input type=\"text\" value=\"" + value + "\">";
        }
    }
};

// VUE 3
// const main_app = Vue.createApp(editor_gtfs_conf);
// main_app.mount('#editor_gtfs');

// VUE 2
editor_gtfs_conf['el'] = '#editor_gtfs';
const app = new Vue(editor_gtfs_conf);
