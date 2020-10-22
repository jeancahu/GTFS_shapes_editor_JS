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

//////////////// global vars /////////////////////

var popup_content = {
    id: '',
    type: '',
    geo_lon: 0,
    geo_lat: 0,
    stop_id: ''
};

/////////////// components ///////////////////////

Vue.config.ignoredElements = [
    // nothing
];

Vue.component('popup', {
    props: ["content"],
    template: `
<div :id="container" class="ol-popup">
  <a href="#" :id="closer" class="ol-popup-closer"></a>
  <div id="popup-content">{{ content }}<p>{{ info }}</p></div>
</div>
`,
    data(){
        return {
            info: "TODO TEST FIXME"
        };
    },
    computed:{
        container() {
            return "popup_node_info";
        },
        closer () {
            return "popup-closer";
        }
    }
});


//////////////////////////////////////////////////

//// Constrained map in the area of interst
var view = new ol.View({
    center: ol.proj.fromLonLat([-84.1027104, 9.865107]),
    zoom: 12,
    // [minx,miny,max,may]
    extent: [-9375050.54, 1092000.79, -9352512.37, 1113049.659],
});


// var coord2; // coordenates vector
// var customFormat = function(dgts)
// {
//     return (function(coord1) {
//         coord2 = [coord1[0], coord1[1]];
//         return ol.coordinate.toStringXY(coord2, dgts);
//     });
// }

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
            if (streetElementNode.isInstance(
                feature_onHover.parent)
                ){
                // It is a node
                console.log("It's a node");
            } else {
                // It's a link
                // TODO

                // invalidate link
                // unselect lastnode
                // add a Node
                // link node with node A
                // link node with node B
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
                popup_content.id =
                    feature_onHover.parent.getID;
                popup_content.type =
                    feature_onHover.parent.type;

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
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'z') {
        console.log('Remove last');
        o_se_group.deleteLastElement();
    }
});

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

            popup_content: popup_content, // Gobal object

            nodes: o_se_group.nodes, // contains stops too
            shapes: o_se_group.shapes,
            routes: o_se_group.routes,
            agencies: o_se_group.agencies,
            trips: o_se_group.trips,
            stopTimes: o_se_group.stopTimes,

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
                "stop_lat", // same than shape
                "stop_lon", // same than shape
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

            r_routeType: [
                {value: 3, name: "autobus"},
                {value: 2, name: "train"},
                {value: 1, name: "metro"}
            ]
        };
    },
    methods: {
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
        saveStop(){
            // this.stopFields.forEach( (value) => {
            //     console.log(value);
            //     console.log(document.getElementById(value).value);
            // });
            console.log("saveStop");
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
        saveCalendar(){
            // o_se_group.addCalendar(
            //     document.getElementById("c_service_id").value
            // );
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
        rev_nodes () { // TODO
            result = [];
            // this.nodes.slice().reverse().forEach( (value) => {
            //     if (value.valid){
            //         result.push(value);
            //     }
            // });
            return result;
        },
        rev_shapes () {
            return []; // TODO
        },
        rev_stops () { // TODO
            result = [];
            this.nodes.slice().reverse().forEach( (value) => {
                if (value.valid && value.type == 'stop'){
                    result.push(value);
                }
            });
            return result;
        },
        rev_agencies () {
            return this.agencies.slice().reverse();
        },
        rev_routes () {
            return this.routes.slice().reverse();
        },
        rev_services () {
            return []; // TODO
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

