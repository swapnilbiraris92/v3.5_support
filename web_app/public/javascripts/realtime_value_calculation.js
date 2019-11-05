/* eslint-disable no-multi-str */
/* eslint-disable camelcase */
/* eslint-disable prefer-const */
// Copyright Asquared IoT Pvt. Ltd. 2019
// Asquared IoT Pvt. Ltd. Confidential Information
// Shared with Koninca Minolta Inc on March 08, 2019, under NDA between
// Asqaured IoT and Konica Minolta

let config = require('../../config/index');
let mysql = require('mysql');
let moment = require('moment');

// redis client
const redis = require('redis');
const redis_client = redis.createClient();
const {promisify} = require('util');
const getAsync = promisify(redis_client.get).bind(redis_client);

// Start and end time for calculations
const start_hr_min = moment('08:40:00', 'HH:mm:ss');
const end_hr_min = moment('08:39:59', 'HH:mm:ss');


// global variable for sound analysis
global.real_time_parameters = [];

// global variable for current sensor
global.real_time_parameters_cs = [];


let db_config = {
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  table: config.database.raw_table,
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
  * function to count prduction count.
  * @param {Array} machine_list list of machines.
  * @param {string} database database to be used.
  * @param {object} start_time start time for calculations.
  * @param {object} end_time end time for calculations.
  * @return {object} object of machine_id as key and prduction count as value.
*/
let prod_cnt_fun = (machine_list, database, start_time, end_time) => {
  return new Promise(function(resolve, reject) {
    let production_count = {};
    let production_off_flag = {};
    let production_on_flag = {};
    let production_machine_flag = {};
    let machine_flag = {};
    let production_count_threshold = 1;

    machine_list.forEach(function(machinemdata) {
      production_count[machinemdata] = 0;
      production_off_flag[machinemdata] = 0;
      production_on_flag[machinemdata] = 0;
      production_machine_flag[machinemdata] = 0;
      machine_flag[machinemdata] = 0;
    });
    let production_query = 'select * from ' + database + '.smooth_data_rts where \
          ts > "'+moment(start_time).format('Y-MM-DD HH:mm:ss')+'" and \
          ts < "'+moment(end_time).format('Y-MM-DD HH:mm:ss')+'" \
          order by ts';
    let ldsjcPromise = fetchingData(production_query);
    ldsjcPromise.then(function(resultsmachine) {
      resultsmachine.forEach(function(production_count_instance) {
        if (production_count_instance['prediction'] == 1 || production_count_instance['prediction'] == 0 ) {
          production_off_flag[production_count_instance['machine_id']] += 1;
          production_on_flag[production_count_instance['machine_id']] = 0;
          if (production_off_flag[production_count_instance['machine_id']] == production_count_threshold && production_machine_flag[production_count_instance['machine_id']] == 1) {
            production_machine_flag[production_count_instance['machine_id']] =
                    0;
            production_count[production_count_instance['machine_id']] =
                    production_count[production_count_instance['machine_id']] + 1;
          }
        } else {
          production_off_flag[production_count_instance['machine_id']] = 0;
          production_on_flag[production_count_instance['machine_id']] += 1;
          if (production_on_flag[production_count_instance['machine_id']] == production_count_threshold && production_machine_flag[production_count_instance['machine_id']] == 0) {
            production_machine_flag[production_count_instance['machine_id']] =
                    1;
          }
        }
      });
      resolve(production_count);
    }, function(error) {
      reject(error);
    });
  });
};

/**
  * function to count crane values.
  * @param {object} start_time start time for calculations.
  * @return {object} object for calculated crane values.
*/
let crane_fun = (start_time) => {
  return new Promise(function(resolve, reject) {
    let query = 'select sum(operation_time) operation_time, \
                sum(down_time) down_time from \
                (SELECT \
                sum(operation_time) operation_time, \
                sum(down_time) down_time \
                FROM precalculations_crane \
                WHERE ts >= "' + start_time.format('Y-MM-DD HH:mm:ss') + '" \
                UNION \
                SELECT \
                sum(data_format_0) operation_time, \
                count(data_index) - sum(data_format_0) down_time \
                FROM cranestatus_ubuntu.`cMT-8F59_log000_data` \
                WHERE data_index > \
                (SELECT data_index FROM precalculations_crane \
                ORDER BY ts DESC LIMIT 1) \
                AND FROM_UNIXTIME(round(`time@timestamp`,6)-9*3600) >= \
                "' + start_time.format('Y-MM-DD HH:mm:ss') + '") sub_table;';

    let ldscranePromise = fetchingData(query);
    ldscranePromise.then(function(resultsmachine) {
      let crane_down_time;
      let crane_operation_time;
      resultsmachine.forEach(function(machine) {
        crane_operation_time = machine.operation_time;
        crane_down_time = machine.down_time;
      });
      if (crane_operation_time > 0) {} else {
        crane_operation_time = 0;
      }
      if (crane_down_time > 0) {} else {
        crane_down_time = 0;
      }
      if (crane_operation_time + crane_down_time > 0) {
        crane_operation_rate =
          crane_operation_time / (crane_operation_time + crane_down_time) * 100;
        crane_downtime_rate =
          crane_down_time / (crane_operation_time + crane_down_time) * 100;
      } else {
        crane_operation_rate = 0;
        crane_downtime_rate = 0;
      }

      crane_object = {};
      crane_object.operation_time = crane_operation_time;
      crane_object.down_time = crane_down_time;
      crane_object.operation_rate = crane_operation_rate;
      crane_object.downtime_rate = crane_downtime_rate;

      resolve(crane_object);
    }, function(error) {
      reject(error);
    });
  });
};

/**
  * function to calculate machines value.
  * @param {Array} machine_list list of machines.
  * @param {string} database database to be used.
  * @param {object} start_time start time for calculations.
  * @param {object} end_time end time for calculations.
  * @return {object} object of machine values.
*/
let machines_fun = (machine_list, database, start_time, end_time) => {
  return new Promise(function(resolve, reject) {
    let responce_Data = {};
    machine_list.forEach(function(machine) {
      responce_Data[machine] = {};
      responce_Data[machine]['operation_time'] = 0;
      responce_Data[machine]['down_time'] = 0;
      responce_Data[machine]['operation_rate'] = 0;
      responce_Data[machine]['downtime_rate'] = 0;
    });

    let operation_time = {};
    let down_time = {};
    let down_time_rate = {};
    let operation_rate = {};

    let last_timestamp = {};
    let last_timestamp_ddc = {};

    let disconnect_threshold = 300000;

    let flag = 0;

    machine_list.forEach(function(machine) {
      operation_time[machine] = 0;
      down_time[machine] = 0;
      down_time_rate[machine] = 0;
      operation_rate[machine] = 0;
      let getAsyncResult = getAsync('rts_last_ts_' + machine);
      getAsyncResult.then(function(res) {
        last_timestamp_ddc[machine] = {};
        last_timestamp[machine] = moment(start_time).format('Y-MM-DD HH:mm:ss');
        if (res) {
          last_timestamp_ddc[machine] = moment(JSON.parse(res)).format('Y-MM-DD HH:mm:ss');
        }
        last_timestamp [machine] = {};
        last_timestamp[machine] = moment(start_time).format('Y-MM-DD HH:mm:ss');


        let query_rts = 'select \
                  machine_id, ts, prediction \
                  from ' + database + '.smooth_data_rts \
                  where machine_id = "'+machine+'" and \
                  ts >= "'+moment(start_time).format('Y-MM-DD HH:mm:ss')+'" \
                  and ts <= "'+moment(end_time).format('Y-MM-DD HH:mm:ss')+'" \
                  order by ts';

        let rts_pro = fetchingData(query_rts);
        rts_pro.then(function(rts_pro_results) {
          rts_pro_results.forEach(function(instance) {
            if ((moment(instance['ts'], 'Y-MM-DD HH:mm:ss').diff(last_timestamp_ddc[instance['machine_id']])) < disconnect_threshold) {
              if ( instance['prediction'] == 0 ) {
                down_time[instance['machine_id']] =
                down_time[instance['machine_id']] +
                moment(instance['ts'], 'Y-MM-DD HH:mm:ss')
                    .diff(last_timestamp[instance['machine_id']])/1000;
              } else {
                operation_time[instance['machine_id']] =
                operation_time[instance['machine_id']] +
                moment(instance['ts'], 'Y-MM-DD HH:mm:ss')
                    .diff(last_timestamp[instance['machine_id']])/1000;
              }
            }
            last_timestamp[instance['machine_id']] =
            moment(instance['ts'], 'Y-MM-DD HH:mm:ss');
            last_timestamp_ddc[instance['machine_id']] =
            moment(instance['ts'], 'Y-MM-DD HH:mm:ss');
          });

          responce_Data[machine]['operation_time'] = operation_time[machine];
          responce_Data[machine]['down_time'] = down_time[machine];

          if (operation_time[machine] + down_time[machine] == 0) {
            responce_Data[machine].operation_rate = 0;
            responce_Data[machine].downtime_rate = 0;
          } else {
            responce_Data[machine].operation_rate =
                      parseFloat(
                          (
                            operation_time[machine] /
                            ( operation_time[machine] + down_time[machine] ) *
                            100
                          ).toFixed(2)
                      );
            responce_Data[machine].downtime_rate =
                      parseFloat(
                          (
                            down_time[machine] /
                            ( operation_time[machine] + down_time[machine] ) *
                            100
                          ).toFixed(2)
                      );
          }
          flag ++;
          if (flag == machine_list.length) {
            resolve(responce_Data);
          };
        }, function(error) {
          reject(error);
        });
      }, function(error) {
        reject(error);
      });
    });
  });
};

module.exports = {
  // function to store max timestamp before 08:40:00
  rts_last_ts: function() {
    // select ts from smooth_data_rts where
    let current_time = moment('21:40:00', 'HH:mm:ss');
    console.log('current_time:', current_time);
    if (current_time > moment()) {
      current_time.subtract(1, 'day');
    }
    let query = 'select machine_id, max(ts) ts from smooth_data_rts where ts <= "' +
        current_time.format('Y-MM-DD HH:mm:ss') + '" group by machine_id';
    let rts_last_ts_pro = fetchingData(query);
    rts_last_ts_pro.then(function(results) {
      results.forEach((result) => {
        if (results[0].ts) {
          redis_client.set('rts_last_ts_' + result.machine_id, JSON.stringify(result.ts), redis.print);
        }
      });
    }, function(error) {
      console.log(error);
    });
  },

  // function to calculate values for realtime page using sound data
  real_time_calculation: function() {
    let machine_list = ['4-01', '4-02', '4-03', '4-05', '4-06', '4-07', '4-09'];
    let responce_Data = {};
    let database_name = 'hmmasterdb';

    responce_Data['4-C1'] = {};
    responce_Data['4-C1']['operation_time'] = 0;
    responce_Data['4-C1']['down_time'] = 0;
    responce_Data['4-C1']['operation_rate'] = 0;
    responce_Data['4-C1']['downtime_rate'] = 0;


    let current_hr_min = moment();
    let start_time;
    let end_time;

    if ( start_hr_min < end_hr_min ) {
      if ( current_hr_min > start_hr_min ) {
        if ( current_hr_min < end_hr_min ) {
          start_time = moment(start_hr_min);
          end_time = moment(current_hr_min);
        } else {
          start_time = moment(start_hr_min);
          end_time = moment( end_hr_min);
        }
      } else {
        start_time = moment(start_hr_min).subtract(1, 'day');
        end_time = moment(end_hr_min).subtract(1, 'day');
      }
    } else {
      if ( current_hr_min > start_hr_min ) {
        start_time = moment(start_hr_min);
        end_time = moment( current_hr_min);
      } else {
        if ( current_hr_min < end_hr_min ) {
          start_time = moment(start_hr_min).subtract(1, 'day');
          end_time = moment(current_hr_min);
        } else {
          start_time = moment(start_hr_min).subtract(1, 'day');
          end_time = moment(end_hr_min);
        }
      }
    }

    let machines_pro = machines_fun(
        machine_list, database_name, start_time, end_time);
    machines_pro.then(function(machines_pro_res) {
      machine_list.forEach(function(machine) {
        responce_Data[machine] = {};
        responce_Data[machine]['operation_time'] =
        machines_pro_res[machine]['operation_time'];
        responce_Data[machine]['down_time'] =
        machines_pro_res[machine]['down_time'];
        responce_Data[machine]['operation_rate'] =
        machines_pro_res[machine]['operation_rate'];
        responce_Data[machine]['downtime_rate'] =
        machines_pro_res[machine]['downtime_rate'];
      });

      // production count
      let prod_cnt_pro = prod_cnt_fun(
          machine_list, database_name, start_time, end_time);
      prod_cnt_pro.then(function(production_count) {
        machine_list.forEach(function(machine) {
          responce_Data[machine]['job_count'] =
                      production_count[machine];
        });

        // crane calcultions
        let crane_pro = crane_fun(start_time);
        crane_pro.then(function(crane) {
          responce_Data['4-C1'].operation_time = crane.operation_time;
          responce_Data['4-C1'].down_time = crane.down_time;
          responce_Data['4-C1'].operation_rate = crane.operation_rate;
          responce_Data['4-C1'].downtime_rate = crane.downtime_rate;
          real_time_parameters = responce_Data;
        }, function(error) {
          console.log(error);
        });
      }, function(error) {
        console.log(error);
      });
    }, function(error) {
      console.log(error);
    });
  },

  // function to calculate values for realtime page using current data
  real_time_calculation_cs: function() {
    let machine_list = ['4-01', '4-02', '4-03', '4-05', '4-06', '4-07', '4-09'];
    let responce_Data = {};
    let database_name = 'hmmasterdbcs';

    responce_Data['4-C1'] = {};
    responce_Data['4-C1']['operation_time'] = 0;
    responce_Data['4-C1']['down_time'] = 0;
    responce_Data['4-C1']['operation_rate'] = 0;
    responce_Data['4-C1']['downtime_rate'] = 0;

    let current_hr_min = moment();
    let start_time;
    let end_time;
    if ( start_hr_min < end_hr_min ) {
      if ( current_hr_min > start_hr_min ) {
        if ( current_hr_min < end_hr_min ) {
          start_time = moment(start_hr_min);
          end_time = moment(current_hr_min);
        } else {
          start_time = moment(start_hr_min);
          end_time = moment( end_hr_min);
        }
      } else {
        start_time = moment(start_hr_min).subtract(1, 'day');
        end_time = moment(end_hr_min).subtract(1, 'day');
      }
    } else {
      if ( current_hr_min > start_hr_min ) {
        start_time = moment(start_hr_min);
        end_time = moment( current_hr_min);
      } else {
        if ( current_hr_min < end_hr_min ) {
          start_time = moment(start_hr_min).subtract(1, 'day');
          end_time = moment(current_hr_min);
        } else {
          start_time = moment(start_hr_min).subtract(1, 'day');
          end_time = moment(end_hr_min);
        }
      }
    }

    let machines_pro = machines_fun(
        machine_list, database_name, start_time, end_time);
    machines_pro.then(function(machines_pro_res) {
      machine_list.forEach(function(machine) {
        responce_Data[machine] = {};
        responce_Data[machine]['operation_time'] =
      machines_pro_res[machine]['operation_time'];
        responce_Data[machine]['down_time'] =
      machines_pro_res[machine]['down_time'];
        responce_Data[machine]['operation_rate'] =
      machines_pro_res[machine]['operation_rate'];
        responce_Data[machine]['downtime_rate'] =
      machines_pro_res[machine]['downtime_rate'];
      });

      // production count
      let prod_cnt_pro = prod_cnt_fun(
          machine_list, database_name, start_time, end_time);
      prod_cnt_pro.then(function(production_count) {
        machine_list.forEach(function(machine) {
          responce_Data[machine]['job_count'] = production_count[machine];
        });

        // crane calcultions
        let crane_pro = crane_fun(start_time);
        crane_pro.then(function(crane) {
          responce_Data['4-C1'].operation_time = crane.operation_time;
          responce_Data['4-C1'].down_time = crane.down_time;
          responce_Data['4-C1'].operation_rate = crane.operation_rate;
          responce_Data['4-C1'].downtime_rate = crane.downtime_rate;
          real_time_parameters_cs = responce_Data;
        }, function(err) {
          console.log(err);
        });
      }, function(error) {
        console.log(error);
      });
    }, function(error) {
      console.log(error);
    });
  },
};

