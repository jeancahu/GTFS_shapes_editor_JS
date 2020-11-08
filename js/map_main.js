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
    // target: 'map_container', // It shows coordinates on page
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
                    feature_onHover.parent.getCoordinates()
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
