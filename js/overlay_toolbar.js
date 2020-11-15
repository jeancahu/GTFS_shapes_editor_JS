/////////////////// set map target ////////////
map.setTarget(
    document.getElementById("map_container")
);

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
