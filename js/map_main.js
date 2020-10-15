///////////////////////////////////////////////////

// Constrained map in the area of interst
var view = new ol.View({
    center: ol.proj.fromLonLat([-84.1027104, 9.865107]),
    zoom: 12,
    // [minx,miny,max,may]
    extent: [-9375050.54, 1092000.79, -9352512.37, 1113049.659],
});


var coord2; // coordenates vector
var customFormat = function(dgts)
{
    return (function(coord1) {
        coord2 = [coord1[0], coord1[1]];
        return ol.coordinate.toStringXY(coord2,dgts);
    });
}

//
var mousePositionControl = new ol.control.MousePosition({
    coordinateFormat: customFormat(4),
    projection: 'EPSG:4326',
    // comment the following two lines to have the mouse position
    // be placed within the map.
    className: 'custom-mouse-position',
    //target: document.getElementById('mouse-position'),
    undefinedHTML: '&nbsp;',
});


// Map need a layers group, we're
// adding only base layer, streetElementNodes will be next
// base layer mainly has routes and buildings.
var map = new ol.Map({
    controls: ol.control.defaults(
        {attribution: false}).extend([mousePositionControl]),
    layers: [
	      new ol.layer.Tile({
	          source: new ol.source.OSM(),
	      }),
	      //vectorLayer,
    ],
    keyboardEventTarget: document,
    target: 'map_container', // It shows coordinates on page
    view: view,
});

// FIXME: change the "node_type" variable for something with sense
var node_type = document.getElementById('node_type').value;
var nodeTypeSelect = document.getElementById('node_type');
nodeTypeSelect.addEventListener('change', function (event) {
    node_type = event.target.value;
});

// TODO: Review needed
///////////////////////////////////////////////////////////////////////
// Aqui vamos haciendo la lista con puntos dependiendo de que clase sea
// se crea una lista con los diferentes puntos a dibujar sobre el mapa
const o_se_group = new streetElementGroup(map);

// try to load a history
if ( typeof(_streetElementGroupHistory) !== 'undefined' ){
    console.log("There is a history");
    o_se_group.historyLoad(_streetElementGroupHistory);
}

map.on('click', (event)=> {
    var action = document.getElementById('action').value;
    var feature_onHover = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
        return feature;
    });

    // TODO: change for a switch
    if (action == "remove"){
        // Click on element to remove
        if ( feature_onHover ){
            if ( typeof(feature_onHover.parent) != 'undefined' ){
                o_se_group.deleteNodeByID(
                    feature_onHover.parent.getID);
            }
        }
    } else if (action == "add") {
        if (feature_onHover){
            // Link a node with other by ID
            o_se_group.linkNodesByID(
                feature_onHover.parent.getID,
                o_se_group.lastSelect.getID
            );
            o_se_group.selectNodeByID(
                feature_onHover.parent.getID
            );
        } else {
            o_se_group.addNode(coord2, node_type); //FIXME
        }

    } else if (action == "move") {
        console.log("move");
        if (o_se_group.lastSelect){
            o_se_group.setNodeCoordinatesByID(
                o_se_group.lastSelect.getID,
                coord2
            );
        }
    } else if (action == "select") {
        if (feature_onHover){
            o_se_group.selectNodeByID(
                feature_onHover.parent.getID
            );
        }
    } else {
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
    if (event.key === 's') {
        console.log('Stop!');
        node_type = 'stop';
    } else if (event.key === 'e') {
        console.log('Endpoint!');
        node_type = 'endpoint';
    }

});

document.addEventListener('keyup', function(event) {
        node_type = document.getElementById('node_type').value;
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
    el: '#app',
    data() {
        return {
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
            language: "es_CR",
            //language: "en_US",

            showList: "shape", // it shows Shapes by default

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
        showTrip() {
            this.showList = "trip";
        },
        saveAgency(){
            this.agencyFields.forEach( (value) => {
                console.log(value);
            }); // FIXME remove
            o_se_group.addAgency(
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
        rev_nodes() {
            result = [];
            this.nodes.slice().reverse().forEach( (value) => {
                if (value.valid){
                    result.push(value);
                }
            });
            return result;
        },
        rev_shapes(){
            return []; // TODO
        },
        rev_stops() { // TODO
            result = [];
            this.nodes.slice().reverse().forEach( (value) => {
                if (value.valid && value.type == 'stop'){
                    result.push(value);
                }
            });
            return result;
        },
        rev_agencies() {
            return this.agencies.slice().reverse();
        },
        rev_routes() {
            return this.routes.slice().reverse();
        },
        rev_trips() {
            return this.trips.slice().reverse();
        },
        rev_stoptimes() { // TODO
            return this.stopTimes.slice().reverse();
        }
    },
    filters: {
        input_box(value) {
            return "<input type=\"text\" value=\"" + value + "\">";
        }
    }
});
