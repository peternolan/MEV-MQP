import {filterData} from "./filterActions";

/**
 * Queries the Database with the current userID to retrieve that user's bin names
 */
export const getUserCases = userID => () => {
  const fetchData = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userID,
    }),
  };
  return fetch(`${process.env.REACT_APP_NODE_SERVER}/getusercases`, fetchData)
    .then(response => response.json())
    .then(bins => (bins.rows || []))
    .catch((err) => {
      console.error.bind(err);
    });
};


export const getCountData = report =>  (dispatch) => {
  dispatch(filterData());
};


/**
 * Queries the Database with the current userID and a bin name to create
 * that bin in the database
 */
export const createUserBin = (userID, binName, binDesc) => () => {
  const fetchData = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userID,
      binName,
      binDesc,
    }),
  };
  return fetch(`${process.env.REACT_APP_NODE_SERVER}/createuserbin`, fetchData)
    .then(response => response.json())
    .then((bins) => {
      if (bins.rows[0]) {
        return bins.rows[0].case_id;
      }
      return -1;
    });
};

/**
 * Queries the Database with a primaryid, two bins, and the current userID to
 * move a report from one bin to another
 */
export const moveReport = (primaryid, fromBin, toBin, userID, type) => () => {
  console.log('Action Move Report ' + primaryid + ' ' + fromBin + ' ' + toBin + ' ' + userID + ' ' + type);
  const fetchData = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      primaryid,
      fromBin,
      toBin,
      userID,
      type,
    }),
  };
  return fetch(`${process.env.REACT_APP_NODE_SERVER}/binreport`, fetchData);
};

/**
 * Queries the Database with a primaryid, two bins, and the current userID to
 * move a report from one bin to another
 */
export const getAgeAndCode = (primaryid) => () => {

  const fetchData = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ primaryid }),
  };


  return fetch(`${process.env.REACT_APP_NODE_SERVER}/getAgeAndCode`, fetchData)
      .then(response => response.json())
      .then(report => report.rows)
      .catch(err => console.log('Failed to retrieve Age', err));
};

/**
 * Queries the Database with a caseID to get the case name
 * that user's reports contained in specified bin that fit in filters
 */
export const getCaseNameByID = caseID => () => {
  const fetchData = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      caseID,
    }),
  };

  return fetch(`${process.env.REACT_APP_NODE_SERVER}/getcasename`, fetchData)
    .then(response => response.json())
    .then(reports => (reports.rows ? reports.rows : []));
};


const countInstance = (array) => {
    var ind = 0;
    var duplicates = [];
    for (var i in array) {

        if (!duplicates.find(function(item) {

            return item.word === array[i]
        })) {



            duplicates.push({word: array[i], count: 1});
        }
        else {

            ind = duplicates.findIndex(function(item) {return item.word === array[i]});
            duplicates[ind].count++;
        }

    }

    return duplicates;

}


/**
 * counts the number of times certain terms are present within a list of reports
 *
 */
export const getInstances = (reports) => {
  if(reports == undefined){return ()=>{null;}}
  //at this point, reports is an array of report objects
  const fields = ["sex", "age_year", "me_type", "outc_cod"];//the fields we will be counting terms from (keeping it seperate allows us to modify fields of interest easily)
  var results = {};
  
  for(var field of fields){//iterate over each report 4 times -- once for each field we're interested in
    if(results[field] == undefined){results[field] = {}}
    for(var report of reports){ //for each report in the list of reports
      if(report[field] == null){continue;}//ignore null fields
      if(typeof report[field][Symbol.iterator] === 'function' && report[field].__proto__ != String.prototype){//if the field is iterable but NOT a string (ie a dict or an array of some sort)
        for(var element of report[field]){//then let's iterate through each element of the field
          if(element == null){continue;} //skip nulled elements
          if(results[field][element] == undefined){ //if we have not encountered the current element
            results[field][element] = 0; //make a new dict entry for it
          }
          results[field][element]++;// increase the currently encountered dict entry
        }
      }
      else if(results[field][report[field]] == undefined){
        results[field][report[field]] = 1; //if we haven't seen the dict entry, then make a new one and increment it
      }
      else{
        results[field][report[field]]++;//if we have seen this dict entry, then increment it
      }
    }
  }


  return ()=>{return results};

};



/**
 * Queries the Database with currently selected filters, a bin, and a userID to retrieve
 * that user's reports contained in specified bin that fit in filters
 */
export const getCaseReports = (bin, userID, filters) => (dispatch, getState) => {

  const defaultFilters = {
    init_fda_dt: {
      start: '1',
      end: '9999999999',
    },
    sex: [],
    occr_country: [],
    age: [],
    occp_cod: [],
    meType: [],
    product: [],
    stage: [],
    cause: [],
  };
  const filtersToUse = (filters) ? Object.assign(defaultFilters, filters) : getState().filters;
  const fetchData = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...filtersToUse,
      bin,
      userID,
    }),
  };
  return fetch(`${process.env.REACT_APP_NODE_SERVER}/getreports`, fetchData)
    .then(response => response.json())
    .then(reports => (reports.rows ? reports.rows : []))
};

/**
 * Queries the Database with a primaryid to get
 * that report's narrative text
 */
export const getReportNarrativeFromID = primaryid => () => {
  const fetchData = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ primaryid }),
  };

  return fetch(`${process.env.REACT_APP_NODE_SERVER}/getreporttext`, fetchData)
    .then(response => response.json())
    .then(report => report.rows)
    .catch(err => console.log('Failed to retrieve report text', err));
};

/**
 * Queries the Database with a userID and an (optional) caseName
 * If caseName is not present, its get reports in any case
 * to get that report PrimaryIDs that exist in a case already
 */
export const getReportsInCases = (userID, caseName) => () => {
  const fetchData = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userID,
      caseName,
    }),
  };

  return fetch(`${process.env.REACT_APP_NODE_SERVER}/getreportsincases`, fetchData)
    .then(response => response.json())
    .then(response => (response.rows ? response.rows : []))
    .catch(err => console.log('Failed to retrieve reports in Cases', err));
};

/**
 * Queries the Database with a userID and a caseName
 * returns actual reports.
 */
export const getReportsFromCase = (userID, caseName) => () => {
  const fetchData = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userID,
      caseName,
    }),
  };
  return fetch(`${process.env.REACT_APP_NODE_SERVER}/getreportsfromcasename`, fetchData)
    .then(response => {return response.json();})
    .then(response => (response.rows ? response.rows : []))
    .catch(err => console.log('Failed to retrieve reports from cases', err));
};



/**
 * Queries the Database with a caseID to get
 * the tags of the reports from the case
 */
export const getTagsinCase = caseID => () => {
  const fetchData = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      caseID,
    }),
  };

  return fetch(`${process.env.REACT_APP_NODE_SERVER}/getcasetags`, fetchData)
    .then(response => response.json())
    .then(response => (response.rows ? response.rows : []))
    .catch(err => console.log('Failed to retrieve tags in that case', err));
};


export const executeSearch = (str) => () => {

  if(typeof(String.prototype.trim) === "undefined")
  {
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
  }
  const fetchData = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },

        body: JSON.stringify({'search_string':str.trim()}),
    };
    return fetch(`${process.env.REACT_APP_NODE_SERVER}/executeSearch`, fetchData)
            .then(function(response){console.log(response);return response.json();});
            //.then(function(json){console.log(json)});
};

export const archiveCase = (name, active, userID) => () => {
  const fetchData = {
    method: 'PUT',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      active,
      userID,
    }),
  };


  return fetch(`${process.env.REACT_APP_NODE_SERVER}/archivecase`, fetchData);
};

export function htmlEncode (str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

// I needed the opposite function today, so adding here too:
export function htmlUnescape (str){
    return str
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
};

export const setAllReports = reports =>
  dispatch => dispatch({ type: 'SET_ALL_REPORTS', all_reports: reports });

export const setSearchedReports = reports =>
  dispatch => dispatch({ type: 'SET_SEARCHED_REPORTS', searched_reports: reports });