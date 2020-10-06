// TODO: Review needed
///////////////////////////////////////////////////////////////////////
// Aqui vamos haciendo la lista con puntos dependiendo de que clase sea
// se crea una lista con los diferentes puntos a dibujar sobre el mapa
var layers_vector = [];
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
    var color;
    const features = [];
    features.push(new ol.Feature({
	      geometry: new ol.geom.Point(ol.proj.fromLonLat([
	          coord2[0], coord2[1]
	      ]))
    }));

    if ( typo == "shape" ){
        color = 'blue';

        // se crean los objetos vectores que serán al final de cuentas
        // lo que se dibuja sobre el objeto mapa
        const vectorSource = new ol.source.Vector({
            features
        });
        // Add layer to the map
        const vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: new ol.style.Style({
	              image: new ol.style.Circle({
	                  radius: 5,
	                  fill: new ol.style.Fill({color: color})
	              })
            })
        });
        map.addLayer(vectorLayer);
        layers_vector.push(vectorLayer);
    } else if ( typo == 'endpoint' ) { // typo: end point
        color = 'green';

        // se crean los objetos vectores que serán al final de cuentas
        // lo que se dibuja sobre el objeto mapa
        const stopVectorSource = new ol.source.Vector({
            features
        });
        // Add layer to the map
        const stopVectorLayer = new ol.layer.Vector({
            source: stopVectorSource,
            style: new ol.style.Style({
	              image: new ol.style.Circle({
	                  radius: 5,
	                  fill: new ol.style.Fill({color: color})
	              })
            })
        });
        map.addLayer(stopVectorLayer);
        layers_vector.push(stopVectorLayer);
        // stopVectorLayer.addEventListener('mouseover', function (event) {
        //     console.log("mouseover");
        // }); // end
    } else if ( typo == 'fork' ) { // typo: intersection
        color = 'violet';

        // se crean los objetos vectores que serán al final de cuentas
        // lo que se dibuja sobre el objeto mapa
        const stopVectorSource = new ol.source.Vector({
            features
        });
        // Add layer to the map
        const stopVectorLayer = new ol.layer.Vector({
            source: stopVectorSource,
            style: new ol.style.Style({
	              image: new ol.style.Circle({
	                  radius: 5,
	                  fill: new ol.style.Fill({color: color})
	              })
            })
        });
        map.addLayer(stopVectorLayer);
        layers_vector.push(stopVectorLayer);
        // stopVectorLayer.addEventListener('mouseover', function (event) {
        //     console.log("mouseover");
        // }); // end
    } else { // typo: stop
    color = 'red';

    // se crean los objetos vectores que serán al final de cuentas
    // lo que se dibuja sobre el objeto mapa
    const stopVectorSource = new ol.source.Vector({
        features
    });
    // Add layer to the map
    const stopVectorLayer = new ol.layer.Vector({
        source: stopVectorSource,
        style: new ol.style.Style({
	          image: new ol.style.Circle({
	              radius: 7,
	              fill: new ol.style.Fill({color: color})
	          })
        })
    });
    map.addLayer(stopVectorLayer);
    layers_vector.push(stopVectorLayer);
    // stopVectorLayer.addEventListener('mouseover', function (event) {
    //     console.log("mouseover");
    // }); // end

    }
    }
}
//map.addEventListener('click', map_event_listener);
map.on('click', map_event_listener);

var feature_onHover;
map.on('pointermove', function (event) {
    feature_onHover = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
        //console.log(feature);
        console.log(layer.ol_uid);
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
