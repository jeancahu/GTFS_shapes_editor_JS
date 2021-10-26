import Vue from "vue";
import data_config from "./vue_data.js";

import Swal from "sweetalert2";

import downloadString from "./download_string.js";

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

function getCookie(name) {
  if (!document.cookie) {
    return null;
  }

  const xsrfCookies = document.cookie
    .split(";")
    .map((c) => c.trim())
    .filter((c) => c.startsWith(name + "="));

  if (xsrfCookies.length === 0) {
    return null;
  }
  return decodeURIComponent(xsrfCookies[0].split("=")[1]);
}
/////////////// components ///////////////////////

//////////////////// Vue experiments ////////////////////////////

const editor_gtfs_conf = {
  el: "#editor_gtfs",
  data() {
    return data_config;
  },
  mounted() {
    // try to load a history from the database
    if (typeof streetElementGroupHistory !== "undefined") {
      console.log("There is a history");
      this.o_se_group.historyLoad(streetElementGroupHistory);
    }

    ////////// delete the loading screen div //////
    this.o_se_group.getMap().once("postrender", async function (event) {
      await sleep(2000); // wait for 2000 m seconds
      document.getElementById("loading_screen").remove();
    });

    // decorators
    this.o_se_group.onAddNode(this.updateStops);
    this.o_se_group.onDeleteNode(this.updateStops);
    // this.o_se_group.onEndpointsChange(this.updateStops);

    // first update
    this.updateStops();

    this.pointer = this.o_se_group.pointer;

    //setInterval(() => { // FIXME
    //this.stops_list = this.o_se_group.getStops();
    //}, 500);
  },
  methods: {
    saveHistory() {
      Swal.fire({
        title: "Do you want to save the history changes?",
        input: "text",
        inputLabel: "History identifier",
        inputValue: "new history",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: `Save`,
        denyButtonText: `Don't save`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          var history_name = "new history with no name";
          if (result.value) {
            history_name = result.value;
          }

          fetch("push_history", {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-CSRFToken": getCookie("csrftoken"),
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify({
              head: history_name,
              body: this.o_se_group.historyArray(),
            }),
          }).then(Swal.fire("Saved!", "", "success")); // TODO add catch
        } else if (result.isDenied) {
          Swal.fire("Changes are not saved", "", "info");
        }
      });
    },
    pushShapesToDB() {
      console.log(this.o_se_group.shapes.array.map((shape) => shape.getInfo()));

      Swal.fire({
        title: "Do you want to save the changes?",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: `Save`,
        denyButtonText: `Don't save`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          fetch("push_shapes", {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-CSRFToken": getCookie("csrftoken"),
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify({
              head: "shapes",
              body: this.o_se_group.shapes.array.map((shape) =>
                shape.getInfo()
              ),
            }),
          }).then(Swal.fire("Saved!", "", "success")); // TODO add catch
        } else if (result.isDenied) {
          Swal.fire("Changes are not saved", "", "info");
        }
      });
    },
    pushStopsToDB() {
      Swal.fire({
        title: "Do you want to save the changes?",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: `Save`,
        denyButtonText: `Don't save`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          fetch("push_stops", {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-CSRFToken": getCookie("csrftoken"),
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify({
              head: "stops",
              body: this.o_se_group.getStops().map((stop_info) => {
                // TODO move to streetelement
                return stop_info.stop_info; // TODO remove extra info
              }),
            }),
          }).then(Swal.fire("Saved!", "", "success")); // TODO add catch
        } else if (result.isDenied) {
          Swal.fire("Changes are not saved", "", "info");
        }
      });
    },
    addNewShape() {
      if (
        this.shape_id_on_newshape &&
        this.begin_node_on_newshape != "null" &&
        this.end_node_on_newshape != "null"
      ) {
        // add a new shape
        if (
          this.o_se_group.addShape({
            id: this.shape_id_on_newshape,
            start: this.begin_node_on_newshape,
            end: this.end_node_on_newshape,
          })
        ) {
        } else
          Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: false,
          }).fire({
            icon: "success",
            title: "Shape " + this.shape_id_on_newshape + " added",
          });
      } else {
        console.error("some param on newshape is wrong");
        Swal.fire({
          icon: "error",
          // title: 'Oops...',
          text: "Some param is not selected or invalid Shape ID",
        });
      }
    },
    selectShape(event, shape_id) {
      //event.target.scrollIntoView();
      this.o_se_group.shapes.array.forEach((shape) => shape.setVisible(false));

      var classes = new Array(0);
      event.target.classList.forEach((css_class) => classes.push(css_class)); // FIXME use ClassList to find specClass
      if (classes.some((name) => name === "collapsed")) {
        // Hide the map sidebar
        this.selected_shape = "";
        this.mapSidebar = "";
      } else {
        // Show the map sidebar to push or delete waypoints

        this.selected_shape = shape_id; // TODO use this data var
        this.mapSidebar = "map_sidebar_show";

        // Set the shape visible
        this.o_se_group.shapes.array
          .filter((shape) => shape.getID() === shape_id)[0]
          .setVisible(true);
      }

      this.shape_valid_waypoints = this.o_se_group.shapes.array
        .filter((shape) => shape.getID() === shape_id)[0]
        .getWaypoints();
    },
    downloadShapesLocally() {
      downloadString(this.o_se_group.shapesToGTFS(), "shapes.txt");
    },
    downloadStopsLocally() {
      downloadString(this.o_se_group.stopsToGTFS(), "stops.txt");
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

      let new_start_node_id = document.getElementById(
        "shape_section_start_node_id_" + shape_id
      );
      let new_end_node_id = document.getElementById(
        "shape_section_end_node_id_" + shape_id
      );

      this.o_se_group.updateShapeByID(shape_id, {
        id: document.getElementById("shape_section_shape_id_" + shape_id).value,
        start: new_start_node_id.value,
        end: new_end_node_id.value,
        waypoints: valid_waypoints,
      });

      // First option is the original value in shape
      new_start_node_id.firstChild.selected = true;
      new_end_node_id.firstChild.selected = true;

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
    updateStops() {
      this.endpoints_id_list = this.o_se_group
        .getEndpoints()
        .map((node) => node.getID());
      this.stops_list = this.o_se_group
        .getStops()
        .reverse()
        .reduce(
          (rows, key, index) =>
            (index % 10 == 0
              ? rows.push([key])
              : rows[rows.length - 1].push(key)) && rows,
          []
        );

      this.page_indicator_stops = Number.parseInt(
        this.o_se_group.getStops().length / 10 + 1
      ); // FIXME
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
    //saveShape() { // already implemented in "addNewShape"
    //},
    removeShape() {
      // Removes a shape from the o_se_group
      let shape_id = document.getElementsByName("to_delete_shape_name")[0]
        .value;
      if (shape_id != "null") {
        Swal.fire({
          title: "Do you want to remove the shape " + shape_id + "?",
          showConfirmButton: false,
          showDenyButton: true,
          showCancelButton: true,
          denyButtonText: `Delete`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isDenied) {
            console.log("remove shape: " + shape_id);
            this.o_se_group.removeShape(shape_id);
            Swal.fire("Shape deleted!", "", "success"); // TODO add catch
          }
        });
      } else {
        Swal.fire("Select a Shape to delete first", "", "info");
      }
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
    pointerCoorCopy() {
      navigator.clipboard
        .writeText(
          "longitude=" +
            this.pointer.coordinate[0] +
            ";latitude=" +
            this.pointer.coordinate[1]
        )
        .then(
          function () {
            console.log("Coordinates copied successful");
          },
          function (err) {
            console.error("Error at copy coordinates", err);
          }
        );
      return true;
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
      return this.stops_list;
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
const app = new Vue(editor_gtfs_conf);

/////////////////// set StreetElementGroup target ////////////
app.o_se_group.setTarget(document.getElementById("map_container"));

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
      params["nolink"] = true; // doesn't link with a previous selected node
      params["stop_description"] = params.stop_desc;
      params["coordinate"] = [params.stop_lon, params.stop_lat];
      params["type"] = "stop";
      app.o_se_group.addNode(params);
    });
  });
};
