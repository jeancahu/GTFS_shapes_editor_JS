import { streetElementGroup } from "streetelement";
import { en_US, es_CR } from "./lang.js"; // TODO enable lang selector

// StreetElementGroup Config
const seg_config = {
  routing_machine_url: routing_machine_url, // TODO
  // onChange: this.test, // FIXME // test function
  // onStopsChange:
  // onWaypointsChange:
  // onEndpointsChange:
  // onForksChange:
};

// Search for global variables for center and extent_area
if (center) seg_config["center"] = center;
if (extent_area) seg_config["lonLatExtent"] = extent_area;

// Export the object as default
export default {
  o_se_group: new streetElementGroup(seg_config),

  dict: en_US,

  pointer: { coordinate: [0, 0] }, // TODO

  // Stops section
  stops_list: [],
  endpoints_id_list: [],
  page_indicator_stops: 1,
  page_indicator_stops_selected: 0,

  // Stop times section
  in_st_stop_id: 0,

  // Shapes section:
  end_node_on_newshape: "null",
  begin_node_on_newshape: "null",
  shape_id_on_newshape: null,
  shape_valid_waypoints: [],

  // End shapes section

  activeSections: [
    // active section for horizontal_tabs_menu.html
    //"agency", // TODO
    "shapes",
    "stops",
    //"routes", // TODO
    //"trips", // TODO
    //"stop_times", // TODO
    //"calendar", // TODO
    //"scheme", // TODO
  ],

  currentActiveSection: "shapes", // activate post-render

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
