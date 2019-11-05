/* eslint-disable no-multi-str */
/* eslint-disable prefer-const */
/* eslint-disable camelcase */
// Copyright Asquared IoT Pvt. Ltd. 2019
// Asquared IoT Pvt. Ltd. Confidential Information
var express = require('express');
var router = express.Router();
let config = require('../config/index');
var mysql = require('mysql');

// exporting MySQL database credentials
let db_config = {
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
};
let client;

/**
 * function to maintain MySQL database connection
 */
function handleDisconnect() {
  client = mysql.createConnection(db_config);
  client.connect(function(err) {
    if (err) {
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);
    }
  });
  client.on('error', function(err) {
    console.log('db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

function fetchingData(query) {
  return new Promise(function(resolve, reject) {
    client.query(query, function(error, results, fields) {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      };
    });
  });
}

function getTimeSetting(res) {
  query = "select * from web_app_parameters"
  fetchingData(query).then((timeSettingPromise) => {
    var responceData = {}
    timeSettingPromise.forEach(function(row) {
      
      if(row.variable.substring(0, 6) == 'status'){
        if (row.value == "1"){
          responceData["status"]= row.variable.substring(6, 7);
        }
      }
      else{
        responceData[row.variable] = {}      
        var row_arr = row.value.split(':')
        responceData[row.variable]['hr'] = row_arr[0];
        responceData[row.variable]['min'] = row_arr[1];
      }
    });
    res.send(responceData)
  }).catch((timeSettingPromiseError) => {
    console.log(timeSettingPromiseError)
    res.send(timeSettingPromiseError)
  })

}

router.get('/', function(req, res) {
  getTimeSetting(res);
});
router.get('/getMachineNames', function(req, res) {
  let query = "select * from machine_names"
  fetchingData(query).then((machines) => {
    var responceData = machines;
    res.send(responceData)
  }).catch((machinesError) => {
    res.send(machinesError)
  })
});

module.exports = router;
