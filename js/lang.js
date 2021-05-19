const en_US = new Proxy(
{
    lang:            "en_US",

    add:             "Add",
    remove:          "Remove",
    agency:          "Agency",
    shapes:          "Shapes",
    stops:           "Stops",
    routes:          "Routes",
    trips:           "Trips",
    calendar:        "Calendar",
    stop_times:      "Stop times",
    scheme:          "Scheme",

    shape_id:        "Shape ID",

    agency_id:       "Agency ID",
    agency_name:     "Name",
    agency_url:      "Web-site",
    agency_timezone: "Time zone",
    agency_lang:     "Language",
    agency_phone:    "Phone number",
    agency_email:    "e-mail",

    stop_id:         "Stop ID",
    stop_name:       "Name",
    stop_desc:       "Description",
    stop_url:        "Information URL",

    r_route_id:         "Route ID",
    r_route_short_name: "Short name",
    r_route_long_name:  "Long name",
    r_route_type:       "Type",
    r_agency_id:        "Agency",

    c_service_id:    "Service ID",
    c_monday:        "Monday",
    c_tuesday:       "Tuesday",
    c_wednesday:     "Wednesday",
    c_thursday:      "Thursday",
    c_friday:        "Friday",
    c_saturday:      "Saturday",
    c_sunday:        "Sunday",
    c_start_day:     "Start day",
    c_end_day:       "End day",

    t_route_id:      "Route",
    t_service_id:    "Service",
    t_trip_id:       "Trip ID",
    t_direction_id:  "Direction",
    t_shape_id:      "Shape",
    inbound_travel:  "Inbound",
    outbound_travel: "Outbound",

    st_trip_id:        "Trip",
    st_arrival_time:   "Arrival time",
    st_departure_time: "Departure time",
    st_stop_id:        "Stop",
    st_stop_sequence:  "Sequence"
},
    { // handler
        get: function(target, name) {
            return target.hasOwnProperty(name) ? target[name] : name;
        }
    }
);

const es_CR = new Proxy(
{
    lang:            "es_CR",

    add:             "Agregar",
    remove:          "Eliminar",
    agency:          "Empresa",
    shapes:          "Recorridos",
    stops:           "Paradas",
    routes:          "Rutas",
    trips:           "Viajes",
    calendar:        "Servicios",
    stop_times:      "Horarios",
    scheme:          "Programa",

    shape_id:        "ID Recor.",

    agency_id:       "ID Empr.",
    agency_name:     "Nombre",
    agency_url:      "Sitio web",
    agency_timezone: "Zona horaria",
    agency_lang:     "Idioma",
    agency_phone:    "Telefono",
    agency_email:    "e-mail",

    stop_id:         "ID Parada",
    stop_name:       "Nombre",
    stop_desc:       "Descripción",
    stop_url:        "URL Información",

    r_route_id:         "ID Ruta",
    r_route_short_name: "Nombre corto",
    r_route_long_name:  "Nombre largo",
    r_route_type:       "Tipo",
    r_agency_id:        "Empresa",

    c_service_id:    "ID servicio",
    c_monday:        "Lunes",
    c_tuesday:       "Martes",
    c_wednesday:     "Miércoles",
    c_thursday:      "Jueves",
    c_friday:        "Viernes",
    c_saturday:      "Sábado",
    c_sunday:        "Domingo",
    c_start_day:     "Día de inicio",
    c_end_day:       "Día final",

    t_route_id:      "Ruta",
    t_service_id:    "Servicio",
    t_trip_id:       "ID viaje",
    t_direction_id:  "Dirección",
    t_shape_id:      "Recorrido",
    inbound_travel:  "Regreso",
    outbound_travel: "Ida",

    st_trip_id:        "Viaje",
    st_arrival_time:   "Llegada",
    st_departure_time: "Salida",
    st_stop_id:        "Parada",
    st_stop_sequence:  "Secuencia"
},
      { // handler
          get: function(target, name) {
              return target.hasOwnProperty(name) ? target[name] : name;
          }
      }
);

module.exports ={
    es_CR,
    en_US
};
