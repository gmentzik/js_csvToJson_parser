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

// CALL VALIDATION FUNCTION EXAMPLES (updates Budibase state)
// pmi
jsonKey = 'pmi';
required = ['module_input_value','scenario_id','setting_id'];
csv2jsonState = validateArrayOfObjs(csv2jsonState, jsonKey, required);
// vm
jsonKey = 'vm';
required = ['scenario_id','node_type_id','servers','vcpus','ram','storage'];
csv2jsonState = validateArrayOfObjs(csv2jsonState, jsonKey, required);

return csv2jsonState;
// END VALIDATION OF JSON
