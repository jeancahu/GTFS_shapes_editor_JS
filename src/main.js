import {
    streetElementGroup,
    streetElementNode,
    streetElementLink,
    streetElementShape } from 'streetelement';

const { en_US, es_CR } = require('./lang.js');

const vue = require('vue');

import Overlay from 'ol/Overlay';

import {fromLonLat} from 'ol/proj'; // FIXME; remove


///////////// utils functions ///////////////////

// Checks if it isn't implemented yet.
if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
            ;
        });
    };
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//////////////// filters /////////////////////////
function filterStopNode (node) {
    // endpoints are stops too
    return node.getType() == streetElementNode.type.STOP |
        node.getType() == streetElementNode.type.ENDPOINT;
}

function filterShapeNode (node) {
    return node.getType() == streetElementNode.type.SHAPE;
}

function filterForkNode (node) {
    return node.getType() == streetElementNode.type.FORK;
}

function filterEndpointNode (node) {
    return node.getType() == streetElementNode.type.ENDPOINT;
}

function filterValidShapeSegment (shape) {
    //return shape.isValid(); // TODO
    return true; // FIXME
}


/////////////// components ///////////////////////

//////////////////////////////////////////////////
//       +++++++++
//       +       +
//       +  Map  +
//       +       +
// --->  @++++++++
var extent_area =
    fromLonLat([-84.43669241118701,9.726525930153954]
);

// ++++++++@ <---
// +       +
// +  Map  +
// +       +
// +++++++++
extent_area = extent_area.concat(
    fromLonLat([-83.72894500499169,9.99625455768836]
));

//// Constrained map in the work area
// Map need a layers group, we're
// adding only base layer, streetElementNodes will be next
// base layer mainly has routes and buildings.

///////////////////////////////////////////////////////////////////////
// Aqui vamos haciendo la lista con puntos dependiendo de que clase sea
// se crea una lista con los diferentes puntos a dibujar sobre el mapa
const o_se_group = new streetElementGroup([-84.1027104, 9.865107], extent_area);

// try to load a history
if ( typeof(_streetElementGroupHistory) !== 'undefined' ){
    console.log("There is a history");
    o_se_group.historyLoad(_streetElementGroupHistory);
}

//////////////////// Download as text/plain /////////////////////

function downloadString(text, fileName) {
    var blob = new Blob([text], { type: 'text/plain' });
    var a = document.createElement('a');
    a.download = fileName;
    a.href = URL.createObjectURL(blob);
    a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(a.href); }, 1500);
}

function downloadShapesCSV () {
    console.log("downloadShapesCSV");
    downloadString(o_se_group.shapesToGTFS(), 'shapes.txt');
}

function downloadStopsCSV () {
    console.log("downloadStopsCSV");
    downloadString(o_se_group.stopsToGTFS(), 'stops.txt');
}

function downloadHistoryArray () {
    console.log("downloadHistoryArray");
    downloadString(o_se_group.historyString(), 'street_element_group_history.txt');
}

//////////////////// Axios post /////////////////////////////////

function postHistoryWithAxios (){
    axios.post('/input_path_history',
               o_se_group.historyJSON() // FIXME
         ).then(function (response) {
             console.log(response);
         }
         ).catch(function (error) {
            console.log(error);
        });
}

function postGTFSWithAxios (){
    axios.post('/input_path_gtfs',
               o_se_group.toJSON() // FIXME
              ).then(function (response) {
                  console.log(response);
              }
                    ).catch(function (error) {
                        console.log(error);
                    });
}

//////////////////// Vue experiments ////////////////////////////

const editor_gtfs_conf = {
    el: '#editor_gtfs',
    data() {
        return {

            /////////////////// SIDEBAR
            map_hidden: false,
            map_action: 'select',
            map_node_type: 'shape',

            map_view_nodes: true,
            map_view_links: true,
            map_view_stops: true,
            ////////////////// END SIDEBAR

            dict: en_US,

            // Popup content structures
            popup_content: o_se_group.popup_content, // Gobal object

            nodes: o_se_group.nodes, // contains stops too FIXME
            stops: o_se_group.nodes
                .filter(node => node.isValid())
                .filter(filterStopNode), // contains stops too FIXME
            agencies: o_se_group.agencies,
            shapes: o_se_group.shapes,
            routes: o_se_group.routes,
            services: o_se_group.services,
            trips: o_se_group.trips,
            stopTimes: o_se_group.stopTimes,

            pointer: o_se_group.pointer,

            // Stops section
            page_indicator_stops: Number.parseInt(( o_se_group.nodes.filter(node => node.isValid()).filter(filterStopNode).length / 10 )+1), // FIXME
            page_indicator_stops_selected: 0,

            // Stop times section
            in_st_stop_id: 0,

            // Shapes section:
            ns_allowed_links: [],
            ns_segments: [],
            ns_head_node_id: null,

            agencyFields: [ // TODO These are constants, import as a constant array
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
                "stop_code",
                "stop_name",
                "stop_desc",
                "stop_lat",
                "stop_lon",
                "zone_id",
                "stop_url",  // page with a photo and info about TODO
                "location_type",
                "parent_station",
                "stop_timezone",
                "wheelchair_boarding"
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
        nodes () {
            this.stops = this.nodes.filter(node => node.isValid()).filter(filterStopNode);
        },
        stops () {
            this.page_indicator_stops = Number.parseInt(( this.stops.length / 10 )+1);
        },
        map_action (new_state, old_state) {
            // changes o_se_group operation mode
            o_se_group.setMode(new_state);
        },
        map_node_type (new_state, old_state) {
            o_se_group.selected_node_type = new_state;
        },
        map_hidden (new_state, old_state) {
            document.getElementById("fullscreen-view").hidden =
                new_state;
            o_se_group.map.updateSize();
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
        increaseStopPageSelector() {
            if ( this.page_indicator_stops_selected < this.page_indicator_stops -1 ){
                this.page_indicator_stops_selected+=1;
            }
        },
        decreaseStopPageSelector() {
            if ( this.page_indicator_stops_selected){
                this.page_indicator_stops_selected-=1;
            }
        },
        toggleDict () {
            if ( this.dict.lang == 'es_CR' ){
                // US English
                this.dict = en_US;
            } else {
                // CR Spanish
                this.dict = es_CR;
            }
        },
        changeNodeInfoFromPopup(node_id){
            o_se_group.changeNodeInfoByID(
                node_id,
                {
                    type: document.getElementById("ol_node_type").value,
                    stop_id: document.getElementById("ol_in_stop_id").value,
                    stop_name: document.getElementById("ol_in_stop_name").value
                }
            );
            this.stops = this.nodes.filter(node => node.isValid()).filter(filterStopNode); // TODO remove
            alert("Success: edit data");
        },
        changeNodeInfoFromStopSection(node_id){
            var new_stop_info = {};

            this.stopFields.forEach(
                field => {
                    new_stop_info[field] = document.getElementById("stop_section_"+field+node_id).value;
                }
            );
            o_se_group.changeNodeInfoByID(
                node_id,
                new_stop_info
            );
            alert("Success: edit data");
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
                    o_se_group.map.getView().setCenter(this.nodes[element_id].getCoordinates()); // TODO remove
                    o_se_group.map.getView().setZoom(17.9); // TODO remove

                    this.ns_allowed_links =
                        this.nodes[element_id].getConnections();
                    console.log("Allowed links when node:");
                    console.log(this.ns_allowed_links);
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
                                result[result.length -1].getID()
                            ]

                        );
                    }
                    o_se_group.focusNodeOnMapByID(result[result.length -1].getID());
                    this.ns_head_node_id =
                        result[result.length -1].getID();

                    var excluded_link = streetElementLink.getLinkBetween(
                        result[result.length -1],
                        result[result.length -2]
                    );

                    console.log("Excluded links: ");
                    console.log(excluded_link);
                    console.log(this.ns_allowed_links);

                    // Hide direction
                    this.ns_allowed_links.forEach((link) => {
                        link.hideDirection();
                        console.log("Hide direction link:"+link.getID());
                        link.oneshot = undefined;
                    });

                    this.ns_allowed_links =
                        streetElementLink.getLinksFromNode(
                            result[result.length -1],
                            [excluded_link]
                        );
                    console.log("Allowed links when node: getLinksFromNode");
                    console.log(this.ns_allowed_links);

                    // Show direction and set oneshot function
                    this.ns_allowed_links.forEach((link) => {
                        console.log("Links in allowed array");
                        console.log(link.getID());
                        console.log(result[result.length -1].getConnections().forEach(
                            link => console.log(link.getID())));
                        link.setDirectionFromNode(
                            result[result.length -1]);
                        link.oneshot = (link_id) => {
                            app.newShapeOnChange(link_id, 'oneshot');
                        };
                    });

                }
            }
        },
        focusNodeOnMapByID (node_id){
            o_se_group.selectNodeByID(node_id);
            o_se_group.focusNodeOnMapByID(node_id);
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
            o_se_group.addTrip({
                'route_id': document.getElementById("t_route_id").value, // TODO, try to get the value without getElementById, using vue
                'trip_id': document.getElementById("t_trip_id").value,
                'direction_id': document.getElementById("t_direction_id").value,
                'shape_id': document.getElementById("t_shape_id").value
            });
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
        changeScheme(event, service_id, trip_id){
            if (event.target.checked){
                o_se_group.addScheme(
                    service_id,
                    trip_id
                );
            } else {
                o_se_group.removeScheme(
                    service_id,
                    trip_id
                );
            }
        },
        isActiveTrip(service_id, trip_id){
            return this.services.array.filter(
                service => service.getID() == service_id
            )[0].isActiveTrip(trip_id);
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
                result = result.filter(node => node.isValid());
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
            result = result.filter(node => node.isValid());
            result = result.filter(filterStopNode);
            return result;
        },
        rev_endpoints () {
            // return end valid endpoints
            var result = this.nodes.slice().reverse();
            result = result.filter(node => node.isValid());
            result = result.filter(filterEndpointNode);
            return result;
        },
        rev_shapes () {
            var result = this.shapes.array.slice().reverse();
            result = result.filter(filterValidShapeSegment);
            return result;
        },
        rev_stops () { // TODO
            return this.stops.slice().reverse().reduce((rows, key, index) => (
                index % 10 == 0 ? rows.push([key]) :
                    rows[rows.length-1].push(key)) && rows, []);
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
    },
    filters: {
        input_box(value) {
            return "<input type=\"text\" value=\"" + value + "\">";
        }
    }
};

// VUE 2
const app = new vue(editor_gtfs_conf);

/////////////////// set map target ////////////
o_se_group.map.setTarget(
    document.getElementById("map_container")
);

/////////////////// add overlay ///////////////

//// Popups/overlay
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
o_se_group.map.addOverlay(
    new Overlay({
        id: 'popup_node_info',
        element: document.getElementById(
            'popup_node_info'),
        autoPan: true,
        autoPanAnimation: {
            duration: 250,
        },
    })
);

closer.onclick = function () {
    o_se_group.map.getOverlayById('popup_node_info').setPosition(undefined);
    closer.blur();
    return false;
};

/// Controls
o_se_group.addMapControl(
    document.getElementById('custom_control_interaction')
);

////////// delete the loading screen div //////
o_se_group.map.once('postrender', async function(event) {
    await sleep(2000); // wait for two seconds
    document.getElementById('nav-agency-tab').click(); // set agency section default
    document.getElementById("loading_screen").remove();
});

/////////////////////////// File gtfs stops input
var file_content = {};
document.getElementById("file_gtfs_stops_input").onchange = (change) => {
    change.target.files[change.target.files.length-1].text().then(
        (file) => {
            var content = file.replace(/\r/gm, '').split('\n');
            var headers = content[0].split(',');
            content.slice(1).forEach((line) =>{
                var params = {};
                line.split(/,(?=(?:(?:[^"]*"){2})*[^\"]*$)/).forEach((line, index) => {
                    params[headers[index]] = line;
                });
                params['nolink'] = true; // doesn't link with another node
                params['stop_description'] = params.stop_desc;
                params['coordinate'] = [params.stop_lon, params.stop_lat];
                params['type'] = 'stop';
                o_se_group.addNode(params);
            });
        }
    );
};

///////////////// exports (bundle.something in console) ////////////
// these method and data is accesible from outside the bundle
export {
    o_se_group, // FIXME temporal
    downloadHistoryArray,
    downloadShapesCSV,
    downloadStopsCSV,
    downloadString
}
