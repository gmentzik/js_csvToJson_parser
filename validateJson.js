// >>>>  VALIDATE <<<<< (verifies genarated json from csv to json parser)
// Check if json has data and checks for required fields

// START VALIDATION OF JSON
// csvToJson object properties names
const PARSEDATA = 'data';
const PARSEINFO = 'parse_info';
const PARSEERROR = 'parse_error';
const VALIDATIONERROR = 'validation_error';
const ISVALID = 'isvalid';

// validation function
const validateArrayOfObjs = (stateObj, jsonArrayKey, requiredFieldsArr,maxAllowed = 0) => {
    let errmessage = '';
    
    // Check if json key is created and is not empty array.
    const checkObjectPropertyValueExistsNoParseErrorNoEmptyArray = (obj, propertyName) => {
      if ( !obj.hasOwnProperty(propertyName) ) {
            errmessage = propertyName + ' object creation has probably failed';
            return false;
      }
      if ( obj[propertyName].hasOwnProperty(PARSEERROR) ) {
            errmessage = 'Parse error exists!';
            return false;
      }
      if ( obj[propertyName].hasOwnProperty(PARSEDATA) && Array.isArray(obj[propertyName][PARSEDATA])) {
           if (obj[propertyName][PARSEDATA].length > 0) {
             if (maxAllowed === 0) return true;
             if (obj[propertyName][PARSEDATA].length <= maxAllowed) {
                    return true;
                 }
                 else {
                    errmessage = 'Only ' + maxAllowed + ' are allowed';
                 }
           } else {
             errmessage = 'Parsed data array is empty';
           }
      }
        errmessage = 'No parsed data found';
        return false;
    }
    
    // Check if required Fields properties exists on all array objects.
    const validateRequiredFieldsExists = (arrayOfObj, required_fields) => {
      for (const obj of arrayOfObj) {
          for (const field of required_fields) {
              if(!obj.hasOwnProperty(field)){
                    errmessage = field + " was not found in json data";
                    return false;
            }
          }
      }
      return true;
    }
    
    // if error occured add to json object of the jsonArrayKey the validation_error message.
    try {
        if ( !checkObjectPropertyValueExistsNoParseErrorNoEmptyArray(stateObj, jsonArrayKey) 
            || !validateRequiredFieldsExists(stateObj[jsonArrayKey][PARSEDATA], requiredFieldsArr)) {
                // IF JSON KEY/DATA MISSING OR NOT VALID 
                if (!stateObj.hasOwnProperty(jsonArrayKey)) stateObj[jsonArrayKey] = {};
                stateObj[jsonArrayKey][VALIDATIONERROR] = errmessage;
                stateObj[jsonArrayKey][ISVALID] = false;
            } else {
                // JSON DATA IS VALID
                stateObj[jsonArrayKey][ISVALID] = true;
            }
    } catch (e) {
        if (!stateObj.hasOwnProperty(jsonArrayKey)) stateObj[jsonArrayKey] = {};
        stateObj[jsonArrayKey][VALIDATIONERROR] = "Error while validating json: " + 'name: ' + e.name + ' ,message: ' + e.message;
        stateObj[jsonArrayKey][ISVALID] = false;
    }
    return stateObj;
}
// end of validation function

let csv2jsonState = $("State.csvtojson_scenario_state") != null ? $("State.csvtojson_scenario_state") : {};
let jsonKey = '';
let required = [];
//global
jsonKey = 'global';
required = ['scenario_id','raw_cm_retention','raw_pm_retention','raw_trace_retention','require_hw_inspection','sp_extras_scenarios',
'sp_extras_hw_reuse','sp_extras_expansion','sp_extras_multi_tenant','sp_extras_multi_vendor','purchase_new_servers','infrastructure_required',
'project_years','sp_extras_security','project_type'];
csv2jsonState = validateArrayOfObjs(csv2jsonState, jsonKey, required,1);
// footprint
jsonKey = 'footprint';
required = ['scenario_id','flavor_code','sw_module_id'];
csv2jsonState = validateArrayOfObjs(csv2jsonState, jsonKey, required);
// pmi
jsonKey = 'pmi';
required = ['module_input_value','scenario_id','setting_id'];
csv2jsonState = validateArrayOfObjs(csv2jsonState, jsonKey, required);
// bom
jsonKey = 'bom';
required = ['scenario_id','material_id','elements'];
csv2jsonState = validateArrayOfObjs(csv2jsonState, jsonKey, required);
// vm
jsonKey = 'vm';
required = ['scenario_id','node_type_id','servers','vcpus','ram','storage'];
csv2jsonState = validateArrayOfObjs(csv2jsonState, jsonKey, required);
// cost
jsonKey = 'cost';
required = ['scenario_id','cost_year','cost_item_id','cost_amount'];
csv2jsonState = validateArrayOfObjs(csv2jsonState, jsonKey, required);
// tenant
jsonKey = 'tenant';
required = ['scenario_id','opco_id','flavor_code','sw_ran_release','cells_count','nodes_count','oss_instances','bsc_rnc_count'];
csv2jsonState = validateArrayOfObjs(csv2jsonState, jsonKey, required);

return csv2jsonState;
// END VALIDATION OF JSON