/* eslint-disable camelcase */
/* eslint-disable prefer-const */
// Copyright Asquared IoT Pvt. Ltd. 2019
// Asquared IoT Pvt. Ltd. Confidential Information
// Shared with Koninca Minolta Inc on March 08, 2019, under NDA between
// Asqaured IoT and Konica Minolta
let express = require('express');
// eslint-disable-next-line new-cap
let router = express.Router();
let config = require('../config/index');
let mysql = require('mysql');
let moment = require('moment');

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
/**
  * function to execute SQL query.
  * @param {string} query Query to execute.
  * @return {object} promise to wait untill query executes.
*/
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

/**
  * function server realtime page request using sound data analytics data.
  * @param {object} res responce object.
*/
function sound_analytics(res) {
  let disconnect_threshold_st = 60;

  let crane_list = ['4-C1'];
  let machine_list = ['4-01', '4-02', '4-03', '4-05', '4-06', '4-07', '4-09'];
  let responceData = {};
  machine_list.forEach(function(machine) {
    responceData[machine] = {};
    responceData[machine]['status'] = global.lsd[machine].status;
    responceData[machine]['barcode'] = global.lsd[machine].barcode;
    if (moment(global.lsd[machine].status_timestamp) < moment().subtract(disconnect_threshold_st, 'seconds')) {
      responceData[machine]['status_timestamp'] = 'dncon';
    } else {
      responceData[machine]['status_timestamp'] = 'con';
    }
    responceData[machine]['operation_time'] = global.real_time_parameters[machine]['operation_time'];
    responceData[machine]['down_time'] = global.real_time_parameters[machine]['down_time'];
    responceData[machine]['operation_rate'] = global.real_time_parameters[machine]['operation_rate'];
    responceData[machine]['downtime_rate'] = global.real_time_parameters[machine]['downtime_rate'];
    responceData[machine]['job_count'] = global.real_time_parameters[machine]['job_count'];
  });
  responceData['4-C1'] = {};
  responceData['4-C1']['status'] = 'red';
  responceData['4-C1']['operation_time'] = global.real_time_parameters['4-C1']['operation_time'];
  responceData['4-C1']['down_time'] = global.real_time_parameters['4-C1']['down_time'];
  responceData['4-C1']['operation_rate'] = global.real_time_parameters['4-C1']['operation_rate'];
  responceData['4-C1']['downtime_rate'] = global.real_time_parameters['4-C1']['downtime_rate'];

  query = " select data_format_0, FROM_UNIXTIME(round(`time@timestamp`)) as last_crane_timestamp from cranestatus_ubuntu.`cMT-8F59_log000_data` where data_index = (select max(data_index) from cranestatus_ubuntu.`cMT-8F59_log000_data`);";
  let ldscranePromise = fetchingData(query);
  ldscranePromise.then(function(resultsmachine) {
    if (moment(resultsmachine[0]['last_crane_timestamp']) < moment().subtract(180, 'seconds')) {
      responceData['4-C1']['status_timestamp'] = 'dncon';
    } else {
      responceData['4-C1']['status_timestamp'] = 'con';
    }
    if (resultsmachine[0]['data_format_0'] == 1) {
      responceData['4-C1'].status = 'green';
    } else {
      responceData['4-C1'].status = 'yellow';
    }
    res.send(responceData);
  }, function(err) {
    console.log(err);
  });
}

/**
  * function server realtime page request using current sensor data.
  * @param {object} res responce object.
*/
function current_sensor(database_name, res) {
  let disconnect_threshold_st = 60;
  let crane_list = ['4-C1'];
  let machine_list = ['4-01', '4-02', '4-03', '4-05', '4-06', '4-07', '4-09'];
  let responceData = {};
  machine_list.forEach(function(machine) {
    responceData[machine] = {};
    responceData[machine]['status'] = global.lsd_cs[machine].status;
    responceData[machine]['barcode'] = global.lsd_cs[machine].barcode;
    if (moment(global.lsd_cs[machine].status_timestamp) < moment().subtract(disconnect_threshold_st, 'seconds')) {
      responceData[machine]['status_timestamp'] = 'dncon';
    } else {
      responceData[machine]['status_timestamp'] = 'con';
    }
    responceData[machine]['operation_time'] = global.real_time_parameters_cs[machine]['operation_time'];
    responceData[machine]['down_time'] = global.real_time_parameters_cs[machine]['down_time'];
    responceData[machine]['operation_rate'] = global.real_time_parameters_cs[machine]['operation_rate'];
    responceData[machine]['downtime_rate'] = global.real_time_parameters_cs[machine]['downtime_rate'];
    responceData[machine]['job_count'] = global.real_time_parameters_cs[machine]['job_count'];
  });
  responceData['4-C1'] = {};
  responceData['4-C1']['status'] = 'red';
  responceData['4-C1']['operation_time'] = global.real_time_parameters_cs['4-C1']['operation_time'];
  responceData['4-C1']['down_time'] = global.real_time_parameters_cs['4-C1']['down_time'];
  responceData['4-C1']['operation_rate'] = global.real_time_parameters_cs['4-C1']['operation_rate'];
  responceData['4-C1']['downtime_rate'] = global.real_time_parameters_cs['4-C1']['downtime_rate'];
  query = 'select data_format_0, ' +
          'FROM_UNIXTIME(round(`time@timestamp`)) as last_crane_timestamp ' +
          'from cranestatus_ubuntu.`cMT-8F59_log000_data` where ' +
          'data_index = (select max(data_index) from ' +
          'cranestatus_ubuntu.`cMT-8F59_log000_data`)';
  let ldscranePromise = fetchingData(query);
  ldscranePromise.then(function(resultsmachine) {
    if (moment(resultsmachine[0]['last_crane_timestamp']) < moment().subtract(180, 'seconds')) {
      responceData['4-C1']['status_timestamp'] = 'dncon';
    } else {
      responceData['4-C1']['status_timestamp'] = 'con';
    }
    if (resultsmachine[0]['data_format_0'] == 1) {
      responceData['4-C1'].status = 'green';
    } else {
      responceData['4-C1'].status = 'yellow';
    }
    res.send(responceData);
  }, function(err) {
    console.log(err);
  });
}

router.post('/', function(req, res) {
  let database_name = 'hmmasterdbcs';
  console.log('database_name', database_name);
  if (database_name === 'hmmasterdb') {
    sound_analytics(res);
  }
  if (database_name === 'hmmasterdbcs') {
    current_sensor(database_name, res);
  }
});
module.exports = router;

