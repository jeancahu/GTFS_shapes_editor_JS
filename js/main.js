import {
  streetElementGroup,
  streetElementNode,
  streetElementLink,
} from "streetelement";

const { en_US, es_CR } = require("./lang.js");

const vue = require("vue");

import Overlay from "ol/Overlay";

///////////// utils functions ///////////////////

// Checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] != "undefined" ? args[number] : match;
    });
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/////////////// components ///////////////////////

//////////////////////////////////////////////////
var extent_area = [
  // TEMP // just a example // TODO // remove
  //       +++++++++
  //       +       +
  //       +  Map  +
  //       +       +
  // --->  @++++++++
  [-84.43669241118701, 9.726525930153954],
  // ++++++++@ <---
  // +       +
  // +  Map  +
  // +       +
  // +++++++++
  [-83.72894500499169, 9.99625455768836],
];
//// Constrained map in the work area
// Map need a layers group, we're
// adding only base layer, streetElementNodes will be next
// base layer mainly has routes and buildings.

//////////////////// Download as text/plain /////////////////////

function downloadString(text, fileName) {
  var blob = new Blob([text], { type: "text/plain" });
  var a = document.createElement("a");
  a.download = fileName;
  a.href = URL.createObjectURL(blob);
  a.dataset.downloadurl = ["text/plain", a.download, a.href].join(":");
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () {
    URL.revokeObjectURL(a.href);
  }, 1500);
}

function downloadShapesCSV() {
  console.log("downloadShapesCSV");
  downloadString(app.o_se_group.shapesToGTFS(), "shapes.txt");
}

function downloadStopsCSV() {
  console.log("downloadStopsCSV");
  downloadString(app.o_se_group.stopsToGTFS(), "stops.txt");
}

function downloadHistoryArray() {
  console.log("downloadHistoryArray");
  downloadString(
    app.o_se_group.historyString(),
    "street_element_group_history.txt"
  );
}

//////////////////// Vue experiments ////////////////////////////

const editor_gtfs_conf = {
  el: "#editor_gtfs",
  data() {
    return {
      o_se_group: new streetElementGroup({
        center: [-84.1027104, 9.865107],
        lonLatExtent: extent_area,
        onChange: this.test, // FIXME // test function
        // onStopsChange:
        // onWaypointsChange:
        // onEndpointsChange:
        // onForksChange:
      }),

      /////////////////// SIDEBAR
      map_hidden: false,
      map_action: "select",
      map_node_type: streetElementNode.type.WAYPOINT,

      map_view_nodes: true,
      map_view_links: true,
      map_view_stops: true,
      ////////////////// END SIDEBAR

      dict: en_US,

      pointer: [0, 0],

      // Stops section
      page_indicator_stops: 1,
      //   Number.parseInt(
      //   this.o_se_group.getStops()
      //     .length /
      //     10 +
      //     1
      // ), // FIXME
      page_indicator_stops_selected: 0,

      // Stop times section
      in_st_stop_id: 0,

      // Shapes section:
      shape_valid_waypoints: [],

      agencyFields: [
        // TODO These are constants, import as a constant array
        "agency_id",
        "agency_name",
        "agency_url",
        "agency_timezone",
        "agency_lang",
        "agency_phone",
        "agency_email",
      ],
      shapeFields: [
        "shape_id",
        "shape_pt_lat",
        "shape_pt_lon",
        "shape_pt_sequence",
        "shape_dist_traveled",
      ],
      stopFields: [
        "stop_id",
        "stop_code",
        "stop_name",
        "stop_desc",
        "stop_lat",
        "stop_lon",
        "zone_id",
        "stop_url", // page with a photo and info about TODO
        "location_type",
        "parent_station",
        "stop_timezone",
        "wheelchair_boarding",
      ],
      stopTimeFields: [
        "st_trip_id",
        "st_stop_id",
        "st_arrival_time",
        "st_departure_time",
      ],
      tripFields: ["t_route_id", "t_trip_id", "t_direction_id", "t_shape_id"],
      routeFields: [
        "r_route_id",
        "r_agency_id",
        "r_route_short_name",
        "r_route_long_name",
        "r_route_type", // TODO, autobus by default
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
        "c_end_day",
      ],
      calendarCheckboxFields: [
        "c_monday",
        "c_tuesday",
        "c_wednesday",
        "c_thursday",
        "c_friday",
        "c_saturday",
        "c_sunday",
      ],

      r_routeType: [
        { value: 3, name: "autobus" },
        { value: 2, name: "train" },
        { value: 1, name: "metro" },
      ],
    };
  },
  mounted() {
    // try to load a history from the static url
    if (typeof _streetElementGroupHistory !== "undefined") {
      console.log("There is a history");
      this.o_se_group.historyLoad(_streetElementGroupHistory);
    }

    // setInterval(() => {
    //   this.pointer = o_se_group.pointer.coordinate;
    // }, 120);
  },
  watch: {
    // stops() {
    //   this.page_indicator_stops = Number.parseInt(this.o_se_group.getStops().length / 10 + 1);
    // },
    map_action(new_state, old_state) {
      // changes o_se_group operation mode
      this.o_se_group.setMode(new_state);
    },
    map_node_type(new_state, old_state) {
      this.o_se_group.selected_node_type = new_state;
    },
    map_hidden(new_state, old_state) {
      document.getElementById("fullscreen-view").hidden = new_state;
      this.o_se_group.getMap().updateSize();
    },
    map_view_nodes(new_state, old_state) {
      if (new_state) {
        this.o_se_group.enableElementsByType(streetElementNode.type.WAYPOINT);
      } else {
        this.o_se_group.disableElementsByType(streetElementNode.type.WAYPOINT);
      }
    },
    map_view_links(new_state, old_state) {
      if (new_state) {
        this.o_se_group.enableElementsByType(streetElementLink.type.LINK);
      } else {
        this.o_se_group.disableElementsByType(streetElementLink.type.LINK);
      }
    },
    map_view_stops(new_state, old_state) {
      if (new_state) {
        this.o_se_group.enableElementsByType(streetElementNode.type.STOP);
      } else {
        this.o_se_group.disableElementsByType(streetElementNode.type.STOP);
      }
    },
  },
  methods: {
    test() {
      console.log("Hello World - test method");
    },
    pushShapesToDB() {
      fetch("push_shapes", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({
          head: "shapes",
          body: this.o_se_group.shapes.array.map((shape) => shape.getInfo()),
        }),
      });
    },
    pushStopsToDB() {
      fetch("push_stops", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({
          head: "stops",
          body: this.o_se_group.getStops(),
        }),
      });
    },
    selectShape(event, shape_id) {
      //event.target.scrollIntoView();
      this.o_se_group.shapes.array.forEach((shape) => shape.setVisible(false));

      var classes = new Array(0);
      event.target.classList.forEach((css_class) => classes.push(css_class));
      if (classes.some((name) => name === "collapsed")) {
      } else
        this.o_se_group.shapes.array
          .filter((shape) => shape.getID() === shape_id)[0]
          .setVisible(true);

      this.shape_valid_waypoints = this.o_se_group.shapes.array
        .filter((shape) => shape.getID() === shape_id)[0]
        .getWaypoints();
    },
    deleteShapeWaypoint(node_id) {
      // TODO improve in streetelement package
      console.log("delete node " + node_id);
      this.shape_valid_waypoints = this.shape_valid_waypoints.filter(
        (i_node_id) => i_node_id != node_id
      );
      this.o_se_group.shapes.selected_nodes =
        this.o_se_group.shapes.selected_nodes.filter(
          (i_node_id) => i_node_id != node_id
        ); // TODO remove
    },
    updateShapeByID(shape_id) {
      var valid_waypoints = this.shape_valid_waypoints.slice();
      this.o_se_group.shapes.selected_nodes.forEach((node_id) => {
        if (valid_waypoints.some((previous_id) => node_id === previous_id)) {
        } else valid_waypoints.push(node_id); // add the node to the result
      });

      this.o_se_group.updateShapeByID(shape_id, {
        id: document.getElementById("shape_section_shape_id_" + shape_id).value,
        start: document.getElementById(
          "shape_section_start_node_id_" + shape_id
        ).value,
        end: document.getElementById("shape_section_end_node_id_" + shape_id)
          .value,
        waypoints: valid_waypoints,
      });

      this.shape_valid_waypoints = this.o_se_group.shapes.array // TODO improve inside streetelement
        .filter(
          (shape) =>
            shape.getID() ===
            document.getElementById("shape_section_shape_id_" + shape_id).value
        )[0]
        .getWaypoints();
    },
    selectStop(event, stop_node_id) {
      console.log(event);
      //event.target.scrollIntoView();
      this.focusNodeOnMapByID(stop_node_id);
    },

    increaseStopPageSelector() {
      if (this.page_indicator_stops_selected < this.page_indicator_stops - 1) {
        this.page_indicator_stops_selected += 1;
      }
    },
    decreaseStopPageSelector() {
      if (this.page_indicator_stops_selected) {
        this.page_indicator_stops_selected -= 1;
      }
    },
    toggleDict() {
      if (this.dict.lang == "es_CR") {
        // US English
        this.dict = en_US;
      } else {
        // CR Spanish
        this.dict = es_CR;
      }
    },
    changeNodeInfoFromPopup(node_id) {
      this.o_se_group.changeNodeInfoByID(node_id, {
        type: document.getElementById("ol_node_type").value,
        stop_id: document.getElementById("ol_in_stop_id").value,
        stop_name: document.getElementById("ol_in_stop_name").value,
      });
      alert("Success: edit data"); // TODO replace
    },
    changeNodeInfoFromStopSection(node_id) {
      var new_stop_info = {};

      this.stopFields.forEach((field) => {
        new_stop_info[field] = document.getElementById(
          "stop_section_" + field + node_id
        ).value;
      });
      this.o_se_group.changeNodeInfoByID(node_id, new_stop_info);
      alert("Success: edit data");
    },
    focusNodeOnMapByID(node_id) {
      this.o_se_group.selectNodeByID(node_id);
      this.o_se_group.focusNodeOnMapByID(node_id);
    },
    saveAgency() {
      this.agencyFields.forEach((value) => {
        console.log(value);
      }); // FIXME remove
      this.o_se_group.addAgency(
        // TODO, for, create a list, then use it as arg
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
    removeAgency(agency_id) {
      // TODO
      console.log("remove agency: " + agency_id);
      this.o_se_group.removeAgency(agency_id);
    },
    saveRoute() {
      this.o_se_group.addRoute(
        document.getElementById("r_route_id").value,
        document.getElementById("r_agency_id").value,
        document.getElementById("r_route_short_name").value,
        document.getElementById("r_route_long_name").value,
        document.getElementById("r_route_type").value
      );
      console.log("saveRoute");
    },
    removeRoute(route_id) {
      // TODO
      console.log("remove route: " + route_id);
      this.o_se_group.removeRoute(route_id);
    },
    saveShape() {
      // TODO
    },
    removeShape(shape_id) {
      // TODO
    },
    saveCalendar() {
      var service_info = {};
      this.calendarFields.forEach((field) => {
        if (document.getElementById(field).type == "checkbox") {
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
      this.o_se_group.addService(service_info);

      console.log(service_info);
      console.log("saveCalendar");
    },
    removeCalendar(service_id) {
      // TODO
      console.log("remove service: " + service_id);
      this.o_se_group.removeService(service_id);
    },
    saveTrip() {
      this.o_se_group.addTrip({
        route_id: document.getElementById("t_route_id").value, // TODO, try to get the value without getElementById, using vue
        trip_id: document.getElementById("t_trip_id").value,
        direction_id: document.getElementById("t_direction_id").value,
        shape_id: document.getElementById("t_shape_id").value,
      });
      console.log("saveTrip");
    },
    removeTrip(trip_id) {
      // TODO
      console.log("remove trip: " + trip_id);
      this.o_se_group.removeTrip(trip_id);
    },
    saveStopTime() {
      this.o_se_group.addStopTime(
        document.getElementById("st_trip_id").value, // TODO, get value without getElementById
        document.getElementById("st_arrival_time").value,
        document.getElementById("st_departure_time").value,
        document.getElementById("st_stop_id").value
      );
      console.log("saveStopTime");
    },
    removeStopTime(trip_id, stop_id) {
      // TODO
      console.log("remove stoptime: " + trip_id + " " + stop_id);
      this.o_se_group.removeStopTime(trip_id, stop_id);
    },
    changeScheme(event, service_id, trip_id) {
      if (event.target.checked) {
        this.o_se_group.addScheme(service_id, trip_id);
      } else {
        this.o_se_group.removeScheme(service_id, trip_id);
      }
    },
    isActiveTrip(service_id, trip_id) {
      return this.o_se_group.services.array
        .filter((service) => service.getID() == service_id)[0]
        .isActiveTrip(trip_id);
    },
  },
  computed: {
    shape_valid_waypoints_list() {
      var result = this.shape_valid_waypoints.slice();
      this.o_se_group.shapes.selected_nodes.forEach((node_id) => {
        if (result.some((previous_id) => node_id === previous_id)) {
        } else result.push(node_id); // add the node to the result
      });
      return result;
    },
    popup_node_type_is_stop() {
      return (
        (this.o_se_group.popup_content.type == streetElementNode.type.STOP) |
        (this.o_se_group.popup_content.type == streetElementNode.type.ENDPOINT)
      );
    },
    stopsWhenTrip() {
      // TODO
      // document.getElementById("st_trip_id")
      // get shape from trip
      // get nodes from shape
      // get stops from nodes
      // return stops

      var result = this.o_se_group.getStops().reverse();
      return result;
    },
    rev_endpoints() {
      // return end valid endpoints
      var result = this.o_se_group.getEndpoints().reverse();
      return result;
    },
    rev_shapes() {
      return this.o_se_group.shapes.array.slice().reverse();
      // .reduce(
      //     (rows, key, index) =>
      //     (index % 10 == 0
      //      ? rows.push([key])
      //      : rows[rows.length - 1].push(key)) && rows,
      //     []
      // );
    },
    rev_stops() {
      // TODO
      return this.o_se_group
        .getStops()
        .reverse()
        .reduce(
          (rows, key, index) =>
            (index % 10 == 0
              ? rows.push([key])
              : rows[rows.length - 1].push(key)) && rows,
          []
        );
    },
    rev_agencies() {
      return this.o_se_group.agencies.array.slice().reverse();
    },
    rev_routes() {
      return this.o_se_group.routes.array.slice().reverse();
    },
    rev_services() {
      return this.o_se_group.services.array.slice().reverse();
    },
    rev_trips() {
      return this.o_se_group.trips.array.slice().reverse();
    },
    rev_stoptimes() {
      // TODO
      return this.o_se_group.stopTimes.array.slice().reverse();
    },
  },
  filters: {
    input_box(value) {
      return '<input type="text" value="' + value + '">';
    },
  },
};

// VUE 2
const app = new vue(editor_gtfs_conf);

/////////////////// set map target ////////////
app.o_se_group.getMap().setTarget(document.getElementById("map_container"));

/////////////////// add overlay ///////////////

//// Popups/overlay
var content = document.getElementById("popup-content");
var closer = document.getElementById("popup-closer");
app.o_se_group.getMap().addOverlay(
  new Overlay({
    id: "popup_node_info",
    element: document.getElementById("popup_node_info"),
    autoPan: true,
    autoPanAnimation: {
      duration: 250,
    },
  })
);

closer.onclick = function () {
  app.o_se_group
    .getMap()
    .getOverlayById("popup_node_info")
    .setPosition(undefined);
  closer.blur();
  return false;
};

/// Controls
app.o_se_group.addMapControl(
  document.getElementById("custom_control_interaction")
);

////////// delete the loading screen div //////
app.o_se_group.getMap().once("postrender", async function (event) {
  await sleep(1000); // wait for two seconds
  document.getElementById("nav-agency-tab").click(); // set agency section default
  document.getElementById("loading_screen").remove();
});

/////////////////////////// File gtfs stops input
var file_content = {};
document.getElementById("file_gtfs_stops_input").onchange = (change) => {
  change.target.files[change.target.files.length - 1].text().then((file) => {
    var content = file.replace(/\r/gm, "").split("\n");
    var headers = content[0].split(",");
    content.slice(1).forEach((line) => {
      var params = {};
      line.split(/,(?=(?:(?:[^"]*"){2})*[^\"]*$)/).forEach((line, index) => {
        params[headers[index]] = line;
      });
      params["nolink"] = true; // doesn't link with another node
      params["stop_description"] = params.stop_desc;
      params["coordinate"] = [params.stop_lon, params.stop_lat];
      params["type"] = "stop";
      app.o_se_group.addNode(params);
    });
  });
};

///////////////// exports (bundle.something in console) ////////////
// these method and data is accesible from outside the bundle
export {
  app,
  downloadHistoryArray,
  downloadShapesCSV,
  downloadStopsCSV,
  downloadString,
};
