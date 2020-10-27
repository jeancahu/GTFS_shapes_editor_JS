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

function toggleHideMap () {
    document.getElementById("map_container").hidden =
        !document.getElementById("map_container").hidden;
    // map.setTarget(document.getElementById("map_container")); // FIXME
    map.updateSize(); // FIXME
    // yourLayer.getSource().changed(); // TODO
}

///////////// initial values ////////////////////

document.getElementById("view_nodes_cb").checked = true;
document.getElementById("view_links_cb").checked = true;
document.getElementById("view_stops_cb").checked = true;
document.getElementsByName("node_type").forEach(
    checkbox => {
        console.log(checkbox.checked);
        checkbox.checked = false;
        // checkbox.disabled = true; // TODO
    });
document.getElementById("nt_shape").checked      = true;
document.getElementById("action").value          = "select";

///////////// sidebar ///////////////////////////

function onActionChange () { // TODO
    var event_value = document.getElementById("action").value;
    switch(event_value) {
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
        document.getElementById("action").value = "select";
    }
}

//////////////// filters /////////////////////////

function filterValidNode (node) {
    return node.valid;
}

function filterStopNode (node) {
    // endpoints are stops too
    return node.type == streetElementNode.type.STOP |
        node.type == streetElementNode.type.ENDPOINT;
}

function filterShapeNode (node) {
    return node.type == streetElementNode.type.SHAPE;
}

function filterForkNode (node) {
    return node.type == streetElementNode.type.FORK;
}

function filterEndpointNode (node) {
    return node.type == streetElementNode.type.ENDPOINT;
}

function filterNearestNode (coordinate) {
    // TODO
}

function filterValidShapeSegment (shape) {
    //return shape.valid(); // TODO
    return true; // FIXME
}


//////////////// global vars /////////////////////

var popup_content = {
    id: null,
    type: null,
    connections: null,
    geo_lon: '',
    geo_lat: '',
    stop_info: {}
};

/////////////// components ///////////////////////

Vue.config.ignoredElements = [
    // nothing
];

// Vue.component('popup', {
//     props: ["content"],
//     template: `
// <div :id="container" class="ol-popup">
//   <a href="#" :id="closer" class="ol-popup-closer"></a>
//   <div id="popup-content">{{ content }}<p>{{ info }}</p></div>
// </div>
// `,
//     data(){
//         return {
//             info: "TODO TEST FIXME"
//         };
//     },
//     computed:{
//         container() {
//             return "popup_node_info";
//         },
//         closer () {
//             return "popup-closer";
//         }
//     }
// });

//////////////////////////////////////////////////
//       +++++++++
//       +       +
//       +  Map  +
//       +       +
// --->  @++++++++
var extent_area =
    ol.proj.fromLonLat([-84.43669241118701,9.726525930153954]

);

// ++++++++@ <---
// +       +
// +  Map  +
// +       +
// +++++++++
extent_area = extent_area.concat(
    ol.proj.fromLonLat([-83.72894500499169,9.99625455768836]

));

//// Constrained map in the work area
var view = new ol.View({
    center: ol.proj.fromLonLat([-84.1027104, 9.865107]),
    zoom: 12,
    // [minx,miny,max,may]
    extent: extent_area,
});

// Map need a layers group, we're
// adding only base layer, streetElementNodes will be next
// base layer mainly has routes and buildings.
var map = new ol.Map({
    controls: ol.control.defaults(
        {attribution: false}),
    layers: [
	      new ol.layer.Tile({
	          source: new ol.source.OSM(),
	      }),
	      //vectorLayer,
    ],
    keyboardEventTarget: document,
    //overlays: [overlay_node_info],
    target: 'map_container', // It shows coordinates on page
    view: view,
});

// Return node type from radio menu
function get_node_type () {
    const radio_buttons_node_type = document.getElementsByName("node_type");

    var result;
    radio_buttons_node_type.forEach( (radio_button) => {
        if (radio_button.checked){
            console.log(radio_button.value);
            result = radio_button.value;
        }
    });
    return result;
}

function set_node_type (type) {
    const radio_buttons_node_type = document.getElementsByName("node_type");
    radio_buttons_node_type.forEach( (radio_button) => {
        if (radio_button.value == type){
            radio_button.checked = true;
        } else {
            radio_button.checked = false;
        }
    });
}

///////////////////////////////////////////////////////////////////////
// Aqui vamos haciendo la lista con puntos dependiendo de que clase sea
// se crea una lista con los diferentes puntos a dibujar sobre el mapa
const o_se_group = new streetElementGroup(map);

// try to load a history
if ( typeof(_streetElementGroupHistory) !== 'undefined' ){
    console.log("There is a history");
    o_se_group.historyLoad(_streetElementGroupHistory);
}

var coord2;

map.on('click', (event)=> {
    var coordinate = ol.proj.toLonLat(event.coordinate);
    var action = document.getElementById('action').value;
    var feature_onHover = map.forEachFeatureAtPixel(
        event.pixel,
        function(feature, layer)
        {
            return feature;
        });

    ////////////////////////// create shape ////////////////

    if ( feature_onHover ){
        if (streetElementLink.isInstance(
            feature_onHover.parent))
        { // if element is a link
            console.log("oneshot");
            if (feature_onHover.parent.oneshot){
                feature_onHover.parent.oneshot(
                    feature_onHover.parent.getID
                );
                feature_onHover.parent.oneshot = undefined;
                return; // end execution
            }
        }
    }

    /////////////////////  end create shape ////////////////

    switch(action) {
    case "remove":
        // Click on element to remove
        if ( feature_onHover ){
            if (streetElementNode.isInstance(
                feature_onHover.parent)
               ){ // if element is a node
                o_se_group.deleteNodeByID(
                    feature_onHover.parent.getID);
            }
        }
        break;

    case "add":
        if (feature_onHover){
            if (streetElementNode.isInstance(
                feature_onHover.parent)
               ){ // if element is a node
                // Link a node with other by ID
                o_se_group.linkNodesByID(
                    feature_onHover.parent.getID,
                    o_se_group.getLastSelectedNode().getID
                );
                o_se_group.selectNodeByID(
                    feature_onHover.parent.getID
                );
            }
        } else {
            o_se_group.addNode(coordinate, get_node_type()); //FIXME
        }
        break;

    case "split":
        console.log("Split a line");
        if (feature_onHover){
            if (streetElementLink.isInstance(
                feature_onHover.parent)
                ){
                // It is a Link
                o_se_group.splitLinkByID(
                    feature_onHover.parent.getID,
                    coordinate,
                    get_node_type() // TODO
                );
            }
        } else {
            // does nothing
            console.log("Nothing to split");
        }
        break;

    case "cut":
        console.log("Remove a link");
        if (feature_onHover){
            if (streetElementLink.isInstance(
                feature_onHover.parent)
               ){ // if element is a Link
                console.log(feature_onHover.parent.getID);
                o_se_group.deleteLinkByID(
                    feature_onHover.parent.getID
                );
            }
        } else {
            // does nothing
            console.log("Nothing to split");
        }
        break;

    case "move":
        console.log("move");
        if (o_se_group.getLastSelectedNode()){
            o_se_group.setNodeCoordinatesByID(
                o_se_group.getLastSelectedNode().getID,
                coordinate
            );
        }
        break;

    case "select":
        if (feature_onHover){ // if element exists
            if (streetElementNode.isInstance(
                feature_onHover.parent)
               ){ // if element is a node
                o_se_group.selectNodeByID(
                    feature_onHover.parent.getID
                );
                // clear the name input
                document.getElementById("ol_in_stop_name").value = '';
                popup_content.id =
                    feature_onHover.parent.getID;
                popup_content.type =
                    feature_onHover.parent.type;
                popup_content.connections =
                    feature_onHover.parent.getConnections().length;
                popup_content.stop_info =
                    feature_onHover.parent.getStopInfo();
                overlay_node_info.setPosition(
                    //ol.proj.fromLonLat(
                    feature_onHover.parent.coordinates
                    //)
                ); // TODO
            }
        }
        else {
            overlay_node_info.setPosition(
                undefined
            ); // TODO
        }
        break;

        defaul: // Could be unselect
        console.log("undefined action");

    }
});

// ~~Undo~~ function ( not yet )
// document.addEventListener('keydown', function(event) {
//     if (event.ctrlKey && event.key === 'z') {
//         console.log('Remove last');
//         o_se_group.deleteLastElement();
//     }
// });

// Shortcuts
document.addEventListener('keypress', function(event) {
    switch(event.key) {
    case "q":
        set_node_type(streetElementNode.type.SHAPE);
        break;
    case "s":
        set_node_type(streetElementNode.type.STOP);
        break;
    case "e":
        set_node_type(streetElementNode.type.ENDPOINT);
        break;
    case "f":
        set_node_type(streetElementNode.type.FORK);
        break;
    default:
        console.log("no action");
    }
});

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

//////////////////// Axios post /////////////////////////////////

function postWithAxios (){
    axios.post('/eso',
               o_se_group.historyString(), // FIXME
           { headers: {
               'Content-type': 'application/x-www-form-urlencoded',
           }
           }
          )
    .then(function (response) {
        console.log(response);
    })
    .catch(function (error) {
        console.log(error);
    });
}
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
                "agency_fare_url",
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
                    view.setCenter(result[result.length -1].coordinates); // FIXME remove
                    view.setZoom(17.9); // FIXME remove
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
        translate(word) {
            result = this.dictionary[this.language][word];
            if ( result ){
                return result;
            }
            return word;
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
                document.getElementById("agency_fare_url").value,
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

/////////////////// add overlay ///////////////

//// Popups/overlay
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
var overlay_node_info = new ol.Overlay({
    element: document.getElementById(
        'popup_node_info'),
    autoPan: true,
    autoPanAnimation: {
        duration: 250,
    },
});
closer.onclick = function () {
    overlay_node_info.setPosition(undefined);
    closer.blur();
    return false;
};
map.addOverlay(overlay_node_info);

////////// delete the loading screen div //////
map.once('postrender', async function(event) {
    await sleep(2000); // wait for two seconds
    document.getElementById("loading_screen").remove();
});

///////// show and hide nodes and links //////
function toggleShowNodes (event) {
    console.log(event.target.checked );
    if (event.target.checked){
        o_se_group.enableElementsByType(
            streetElementNode.type.SHAPE
        );
    } else {
        o_se_group.disableElementsByType(
            streetElementNode.type.SHAPE
        );
    }
}
document.getElementById("view_nodes_cb").addEventListener(
    "change",
    toggleShowNodes
);

function toggleShowLinks (event) {
    console.log(event.target.checked );
    if ( event.target.checked ){
        o_se_group.enableElementsByType(
            streetElementLink.type.LINK
        );
    } else {
        o_se_group.disableElementsByType(
            streetElementLink.type.LINK
        );
    }
}
document.getElementById("view_links_cb").addEventListener(
    "change",
    toggleShowLinks
);

function toggleShowStops(event) {
    console.log(event.target.checked );
    if ( event.target.checked ){
        o_se_group.enableElementsByType(
            streetElementNode.type.STOP
        );
    } else {
        o_se_group.disableElementsByType(
            streetElementNode.type.STOP
        );
    }
}
document.getElementById("view_stops_cb").addEventListener(
    "change",
    toggleShowStops
);
