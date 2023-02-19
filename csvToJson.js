// START CONVERT CSV TO JSON
// Parse Button JS code
// csvToJson inputs:
// csvtext: the csv text from an input text field
// additionalPropertiesObj: a json object with properties you want to add/replace at final json output
// delimiter: the csv values seperator
// quoteChar: the quote char for used in csv to eclose values

// csvToJson object properties names
const PARSEDATA = 'data';
const PARSEINFO = 'parse_info';
const PARSEERROR = 'parse_error';
const VALIDATIONERROR = 'validation_error';
const ISVALID = 'isvalid';

// set delimiter (in case variable or value is invalid delimiter is set to comma)
let selected_csv_delimiter = $("ImportCSVForm.Fields.csv_seperator_picker");
if (!selected_csv_delimiter || selected_csv_delimiter == null || selected_csv_delimiter == '') {
    console.log('delimeter variable or value is invalid and delimiter is set to comma');
    selected_csv_delimiter = ',';
}
console.log('Set csv_delimiter is: ' + selected_csv_delimiter);

// Convert csv to json function
const csvToJson = (csvtext, additionalPropertiesObj = {}, delimiter = ',', quoteChar = '"') => {

  // ******** Internal functions *********
  // Check if row has content
  const hasContent = (values) => {
        if (values.length > 0) {
            for (let i = 0; i < values.length; i++) {
                if (values[i]['inquotes'] || values[i]['value']) {
                    return true;
                }
            }
        }
        return false;
    }
  // Get appropriate value depending if csv field is in quotes or not
  // regex: get tokens between seperators
  const splitRowValuesOnDilimeterRegex = new RegExp(`(?<=${delimiter}|^)((${quoteChar})?(.*?)(\\2))(?:${delimiter}|$)`, 'gs');
  const getMatchedValues = line => [...line.matchAll(splitRowValuesOnDilimeterRegex)]
      .map(m => {
        // check if token is enclosed quotes
        if (m[2] == '"' && m[2] == m[4]) {
            return {'value': m[3], 'inquotes': true};
        } else {
            return {'value': m[1], 'inquotes': false};
        }
      }
    );
  
  // Handle and return appropriate csv field value
    const getValueFormatByType = (fieldvalue) => {
        const value = fieldvalue['value'];
        const inquotes = fieldvalue['inquotes'];
        // empty or undefined returns null
        if(value === undefined || (value === '' && !inquotes)){
            return null;
        }
        // values in quotes should are always considered strings
        // else parse them
        const trimmedValue = value.trim();
        if (!inquotes && trimmedValue !== "") {     
            // is number (Number() returns false for "" and 0 , also !isNaN("") also returns true so special handling is needed for 0)
            if (Number(trimmedValue) || (!isNaN(trimmedValue) && Number.parseFloat(trimmedValue) === 0)) {
                return Number(trimmedValue);
            }
            // is Boolean
            if(trimmedValue === "true" || trimmedValue === "false"){
                return JSON.parse(trimmedValue.toLowerCase());
            }   
        }
        // is String
        return String(value).replaceAll(quoteChar.repeat(2),quoteChar);
    }  

  // ****** csv2JSON execution part **********
  let result = {};
  try {
    // regex:  split csvtext rows to array of lines on [CR]LF
    const splitRowOnNewLineRegex = new RegExp(`\\r?\\n(?=(?:(?:[^${quoteChar}]*[${quoteChar}]){2})*[^${quoteChar}]*$)`,'g');
    let lines = csvtext.split(splitRowOnNewLineRegex);
    // 1st entry in lines array is the csv headers. Put into headers array and remove from lines array.
    let headers = (lines.shift()).split(delimiter).map(x => x.trim());
    // Create json array
    result[PARSEDATA] = [];
    for (const line of lines) {
        // get array of matched tokens
        let currentLine = getMatchedValues(line);
        // Check if row has content. Skip if empty
        if (!hasContent(currentLine)) continue;
        // create json object from row
        const lineObject = headers.reduce((acc, curhead, j) => {
            const val = getValueFormatByType(currentLine[j]);
            const propertyName = curhead;
            return { ...acc, [propertyName]: val };
          }, {});
          // add addition properties to object
          result[PARSEDATA].push({...lineObject, ...additionalPropertiesObj});
        
    }
  } catch(e) {
      result[PARSEERROR] = 'Error while parsing csv: name: ' + e.name + ' ,message: ' + e.message;
  } 
  return result;
}
// End of Convert csv text to json function

let csv2jsonState = $("State.csvtojson_scenario_state") != null ? $("State.csvtojson_scenario_state") : {};
let  jsonKey = '';
let addPropertiesObj = {'scenario_id': $("ScenarioRepeater.smt_scenario.scenario_id")};
let csv_text = '';


const convertCSVtoJsonAndAddToStateObject = () => {
    if (csv_text != null && csv_text.trim().length > 0) {
        csv2jsonState[jsonKey] = csvToJson(csv_text, addPropertiesObj, selected_csv_delimiter);
    } else {
        csv2jsonState[jsonKey] = {};
        csv2jsonState[jsonKey][PARSEINFO] = "No csv text found";
    }   
}


const convertCSVtoJsonAndAddToStateTenantObject = () => {
    let tenantData = $("State.tenant_data");
    tenantData = (!tenantData || tenantData == null) ? {} : tenantData;
    const tenantKeys = Object.keys(tenantData);
    // Check if not tenant data is submited
    if (tenantKeys.length === 0) {
        csv2jsonState[jsonKey] = {};
        csv2jsonState[jsonKey][PARSEINFO] = "No csv text for any tenant is submited";   
        return;
    }
    
    // Check tenantData opco keys for errors. In case of error write as parse error and return immediatelly.
    const checkTenantKeys = tenantKeys.every(k => {
        if (!Number(k)) {
            csv2jsonState[jsonKey] = {};
            csv2jsonState[jsonKey][PARSEERROR] = 'Unexpected opco_id: ' + k;
            return false;       
        }
      return true;
    });
    if (!checkTenantKeys) return;

    // create array to hold json object with parsed data or any other parse info for each tenant.
    let tenantDataArray = [];
    for (const [opcoid, csvtxt] of Object.entries(tenantData)) {
        let tenantObj = {};
        if (csvtxt != null && csvtxt.trim().length > 0) {
            addPropertiesObj = {
                ...addPropertiesObj,
                'opco_id': parseInt(opcoid)
                };
            tenantObj = csvToJson(csvtxt, addPropertiesObj, selected_csv_delimiter);
            if (tenantObj.hasOwnProperty(PARSEERROR)) tenantObj[PARSEERROR] = '[Opco_id: ' + opcoid + ']. ' + tenantObj[PARSEERROR];
        } else {
            tenantObj[PARSEERROR] =  'No csv text found for opco_id: ' + opcoid;
        }
        tenantDataArray.push(tenantObj);
    }
    console.log(tenantDataArray);
    if (tenantDataArray.length === 0) {
            csv2jsonState[jsonKey] = {};
            csv2jsonState[jsonKey][PARSEERROR] = "Unexpected error. Parsed tennant data array is empty!";
            return;
        }
    
    // Merged parsed results.
    let mergedTenantsObj = {};
    for (const tenantObj of tenantDataArray) {
        // merge error messages
        if (tenantObj.hasOwnProperty(PARSEERROR)) {
            if (!mergedTenantsObj.hasOwnProperty(PARSEERROR)) {
                mergedTenantsObj[PARSEERROR] = tenantObj[PARSEERROR];
            } else {
                mergedTenantsObj[PARSEERROR] += ', ' + tenantObj[PARSEERROR];
            }
        }
        // merge json data
        if (tenantObj.hasOwnProperty(PARSEDATA)) {
            if (!mergedTenantsObj.hasOwnProperty(PARSEDATA)) {
                mergedTenantsObj[PARSEDATA] = [];
            }
            mergedTenantsObj[PARSEDATA] = [...mergedTenantsObj[PARSEDATA],...tenantObj[PARSEDATA]];         
        }
    }

    csv2jsonState[jsonKey] = mergedTenantsObj;
}

// PREPARE CSVTOJSON STATE FROM FORM FIELDS
// examples calling the function to update Budibase state
//pmi
jsonKey = 'pmi';
csv_text = $("ImportCSVForm.Fields.pmi_csv");
convertCSVtoJsonAndAddToStateObject();
// vm
jsonKey = 'vm';
csv_text = $("ImportCSVForm.Fields.vm_csv");
convertCSVtoJsonAndAddToStateObject();
// tenant
jsonKey = 'tenant';
convertCSVtoJsonAndAddToStateTenantObject();

return csv2jsonState;

// END CONVERT CSV TO JSON
