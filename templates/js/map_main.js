// TODO: Review needed
///////////////////////////////////////////////////////////////////////
// Aqui vamos haciendo la lista con puntos dependiendo de que clase sea
// se crea una lista con los diferentes puntos a dibujar sobre el mapa
const obj_streetElementGroup = new streetElementGroup(map);

function map_event_listener(event) {
    var action = document.getElementById('action').value;

    if (action == "remove"){
    //// Borrar si se da un segundo click:
    feature_onHover = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
        //console.log(feature);
        map.removeLayer(layer);
        return feature;
    });
    } else if (action == "add")
    {

        obj_streetElementGroup.addElement(coord2, typo); //FIXME

    }
}

//map.addEventListener('click', map_event_listener);
map.on('click', map_event_listener);

var feature_onHover;
map.on('pointermove', function (event) {
    feature_onHover = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
        //console.log(feature.ol_uid);
        console.log(feature.parentID); // streetElement.id
        //console.log(layer.ol_uid);
        return feature;
    });
    if (feature_onHover) {
        // Cambiamos la geometría cuando estamos sobre el feature
        console.log(feature_onHover.getGeometry().getCoordinates());
        //var content = document.getElementById('popup-content');
    //    console.log(feature_onHover.getProperties().name);
        //overlay.setPosition(evt.coordinate);
        //content.innerHTML = 'HOVER ' + feature_onHover.getProperties().name;
        //container.style.display = 'block';
    } //else {
      //  container.style.display = 'none';
    //}
});

//

// var hide_map = document.getElementById("disable_map");
// // Toggle map visibility
// hide_map.addEventListener("click",
//     function (event) {
//         element = document.getElementById("map_container");
//     if (element.style.display === "none") {
//         element.style.display = "block";
//     } else {
//         element.style.display = "none";
//     }
// });

// Undo function
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'z') {
        console.log('Undo!');
        obj_streetElementGroup.deleteLastElement();
    }
});

document.addEventListener('keypress', function(event) {
    if (event.key === 's') {
        console.log('Stop!');
        typo = 'stop'; // FIXME
    }
});

document.addEventListener('keyup', function(event) {
    // if (event.key === 's') {
    //     console.log('Stop!');
        typo = document.getElementById('shape_typo').value;; // FIXME
    // }
});
