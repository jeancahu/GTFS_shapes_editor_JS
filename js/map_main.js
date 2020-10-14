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
        //document.getElementById('precision').value),
    projection: 'EPSG:4326',
    // comment the following two lines to have the mouse position
    // be placed within the map.
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position'),
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

map.on('click', (event)=> {
    var action = document.getElementById('action').value;
    var feature_onHover = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
        return feature;
    });

    // TODO: change for a switch
    if (action == "remove"){
        // Click on element to remove
        if ( feature_onHover ){
            o_se_group.deleteElementByID(
                feature_onHover.parent.getID);
        }
    } else if (action == "add") {
        if (feature_onHover){
            console.log("eso eso");
            o_se_group.addLink(
                feature_onHover.parent,
                o_se_group.lastSelect
            );
            o_se_group.selectElement(feature_onHover.parent);
        } else {
            o_se_group.addElement(coord2, node_type); //FIXME
        }

    } else if (action == "edit") {
        console.log("edit");

    } else if (action == "move") {
        console.log("move");
        if (o_se_group.lastSelect){
            o_se_group.lastSelect.setCoordinates(coord2);
        }
    } else if (action == "select") {
        if (feature_onHover){
            o_se_group.selectElement(
                feature_onHover.parent
            );
        }
    } else {
        console.log("select");
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


//////////////////// Vue experiments ////////////////////////////

var app = new Vue({
    el: '#app',
    data() {
        return {
            showList: "shape", // It shows Shapes by default

            shapes: o_se_group.nodes,
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
            stopFields: [
                "stop_id",
                "stop_name",
                "stop_desc",
                "stop_lat", // Same than shape
                "stop_lon"  // Same than shape
            ],
            stopTimesFields: [
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
            ]

            //last: o_se_group.getLastElement // getSelected TODO
        }
    },
    methods: {
        show(value) {
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
        saveStop(){
            // this.stopFields.forEach( (value) => {
            //     console.log(value);
            //     console.log(document.getElementById(value).value);
            // });
            console.log("saveStop");
        },
        saveRoute(){
            console.log("saveRoute");
        },
        saveTrip(){
            console.log("saveTrip");
        }
    },
    computed: {
        rev_shapes() {
            result = [];
            this.shapes.slice().reverse().forEach( (value) => {
                if (value.valid){
                    result.push(value);
                }
            });
            return result;
        },
        rev_stops() { // TODO
            result = [];
            this.shapes.slice().reverse().forEach( (value) => {
                if (value.valid && value.type == 'stop'){
                    result.push(value);
                }
            });
            return result;
        },
        rev_agencys() { // TODO
            result = [];
            return result;
        },
        rev_routes() { // TODO
            result = [];
            return result;
        },
        rev_trips() { // TODO
            result = [];
            return result;
        },
        rev_stoptimes() { // TODO
            result = [];
            return result;
        }
    },
    filters: {
        input_box(value) {
            return "<input type=\"text\" value=\"" + value + "\">";
        }
    }
});
