// CALLING RELEVANT MYSQL PROCEDURES.
// All button are calling relevant mysql procedures with scenario_id from relevant repeater in page and data value from relevant json property.
// eg. for scenario global
// Mysql CALL INSERT_SCENARIO_GLOBAL_FROM_JSON_ARRAY({{scenarioId}},{{json}});
// where json js:
return $("State.csvtojson_scenario_state")['global']['data'];
