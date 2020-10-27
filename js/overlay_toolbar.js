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
