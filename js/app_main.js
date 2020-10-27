//////////////////// Vue experiments ////////////////////////////
var app = new Vue({
    el: '#editor_gtfs_tables',
    data() {
        return {
            // data: {
            dictionary: {
                en_US: {
                    add:          "Add",
                    remove:       "Remove",
                    shape_id:     "Shape ID",
                    agency:       "Agency",
                    shapes:       "Shapes",
                    stops:        "Stops",
                    routes:       "Routes",
                    trips:        "Trips",
                    stop_times:   "Stop times"
                    //agency_id:    "Agency ID",
                },
                es_CR: {
                    add:          "Agregar",
                    remove:       "Eliminar",
                    // shape_id: "Punto ID"
                    agency:       "Empresa",
                    shapes:       "Recorridos",
                    stops:        "Paradas",
                    routes:       "Rutas",
                    trips:        "Viajes",
                    stop_times:   "Horario de parada"
                }
            },
            //language: "es_CR",
            language: "en_US",

            showList: "shape", // it shows Shapes by default

            // Popup content structures
            popup_content: popup_content, // Gobal object

            nodes: o_se_group.nodes, // contains stops too FIXME

            shapes: o_se_group.shapes,
            routes: o_se_group.routes,
            agencies: o_se_group.agencies,
            services: o_se_group.services,
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
                "st_arrival_time",
                "st_departure_time",
                "st_stop_id",
                "st_stop_sequence"
            ],
            tripFields: [
                "t_route_id",
                "t_service_id",
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
    methods: {
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
                    view.setCenter(this.nodes[element_id].coordinates); // FIXME remove
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
                    this.goToNodeOnMap(result[result.length -1].getID);
                    this.ns_head_node_id =
                        result[result.length -1].getID;

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
            view.setCenter(this.nodes[node_id].coordinates);
            view.setZoom(17.9); // TODO use a config file
            console.log(node_id);
        },
        isVisible(value) { // Return a bool
            return ( value == this.showList );
        },
        showAgency() {
            this.showList = "agency";
        },
        showShape() {
            this.showList = "shape";
        },
        showStop() {
            this.showList = "stop";
        },
        showStopTime() {
            this.showList = "stoptime";
        },
        showRoute() {
            this.showList = "route";
        },
        showCalendar() {
            this.showList = "calendar";
        },
        showTrip() {
            this.showList = "trip";
        },
        // popupInfo(){ // FIXME
        //     return o_se_group.getLastSelectedNode().getID;
        // },
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
        },
        saveShape(){ // save shape into streetElementGroup
            console.log(this.ns_segments);
            o_se_group.addShape(
                document.getElementById("new_shape_id").value,
                this.ns_segments
            );
            this.saveShapeStop();
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
        },
        saveTrip(){
            o_se_group.addTrip(
                document.getElementById("t_route_id").value, // TODO, try to get the value without getElementById, using vue
                document.getElementById("t_service_id").value,
                document.getElementById("t_trip_id").value,
                document.getElementById("t_direction_id").value,
                document.getElementById("t_shape_id").value
            );
            console.log("saveTrip");
        },
        removeTrip (trip_id){ // TODO
            console.log("remove trip: " + trip_id);
        },
        saveStopTime(){
            console.log("saveStopTime");
        },
        removeStopTime (trip_id, stop_id){ // TODO
            console.log("remove stoptime: " + trip_id + ' ' + stop_id);
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
            var result = this.shapes.slice().reverse();
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
            return this.agencies.slice().reverse();
        },
        rev_routes () {
            return this.routes.slice().reverse();
        },
        rev_services () {
            return this.services.slice().reverse();
        },
        rev_trips () {
            return this.trips.slice().reverse();
        },
        rev_stoptimes () { // TODO
            return this.stopTimes.slice().reverse();
        },
        // popup () {
        //     return "TODO";
        // },
        // popup_info () { // TODO
        //     return this.selectedNode.getID;
        // }
    },
    filters: {
        input_box(value) {
            return "<input type=\"text\" value=\"" + value + "\">";
        }
    }
});
