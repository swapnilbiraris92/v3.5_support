/* eslint-disable no-multi-str */
/* eslint-disable prefer-const */
/* eslint-disable camelcase */
// Copyright Asquared IoT Pvt. Ltd. 2019
// Asquared IoT Pvt. Ltd. Confidential Information
// Shared with Koninca Minolta Inc on March 08, 2019, under NDA between
// Asqaured IoT and Konica Minolta

let express = require('express');
// eslint-disable-next-line new-cap
let router = express.Router();
let Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
let config = require('../config/index');
let mysql = require('mysql');

// redis client
const redis = require('redis');
const redis_client = redis.createClient();
const {promisify} = require('util');
const getAsync = promisify(redis_client.get).bind(redis_client);

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
  * function to calculate values for chart for duration one hour for crane.
  * @param {object} Obj object.
  * @return {object} calculate values for selected an hour for crane for chart.
*/
let one_hour_crane = (Obj) => {
  return new Promise(function(resolve, reject) {
    let start_time = Obj.start_time;
    let end_time = Obj.end_time;
    let group_start_label = Obj.group_start_label;
    let group_end_label = Obj.group_end_label;
    one_hour_crane_query = 'SELECT "4-C1" AS machine_id, \
    min, \
    sum(operation_time) operation_time, \
    sum(down_time) AS down_time \
    FROM \
    (SELECT "4-C1" AS machine_id, \
       ts, \
       CASE \
           WHEN ts >= "' + group_start_label[0].format('Y-MM-DD HH:mm:ss') + '" \
                AND ts < "' + group_end_label[0].format('Y-MM-DD HH:mm:ss') + '" THEN ' + group_start_label[0].minutes() + ' \
           WHEN ts >= "' + group_start_label[1].format('Y-MM-DD HH:mm:ss') + '" \
                AND ts < "' + group_end_label[1].format('Y-MM-DD HH:mm:ss') + '" THEN ' + group_start_label[1].minutes() + ' \
           WHEN ts >= "' + group_start_label[2].format('Y-MM-DD HH:mm:ss') + '" \
                AND ts < "' + group_end_label[2].format('Y-MM-DD HH:mm:ss') + '" THEN ' + group_start_label[2].minutes() + ' \
           WHEN ts >= "' + group_start_label[3].format('Y-MM-DD HH:mm:ss') + '" \
                AND ts < "' + group_end_label[3].format('Y-MM-DD HH:mm:ss') + '" THEN ' + group_start_label[3].minutes() + ' \
           WHEN ts >= "' + group_start_label[4].format('Y-MM-DD HH:mm:ss') + '" \
                AND ts < "' + group_end_label[4].format('Y-MM-DD HH:mm:ss') + '" THEN ' + group_start_label[4].minutes() + ' \
           WHEN ts >= "' + group_start_label[5].format('Y-MM-DD HH:mm:ss') + '" \
                AND ts < "' + group_end_label[5].format('Y-MM-DD HH:mm:ss') + '" THEN ' + group_start_label[5].minutes() + ' \
           WHEN ts >= "' + group_start_label[6].format('Y-MM-DD HH:mm:ss') + '" \
                AND ts < "' + group_end_label[6].format('Y-MM-DD HH:mm:ss') + '" THEN ' + group_start_label[6].minutes() + ' \
           WHEN ts >= "' + group_start_label[7].format('Y-MM-DD HH:mm:ss') + '" \
                AND ts < "' + group_end_label[7].format('Y-MM-DD HH:mm:ss') + '" THEN ' + group_start_label[7].minutes() + ' \
           WHEN ts >= "' + group_start_label[8].format('Y-MM-DD HH:mm:ss') + '" \
                AND ts < "' + group_end_label[8].format('Y-MM-DD HH:mm:ss') + '" THEN ' + group_start_label[8].minutes() + ' \
           ELSE ' + group_start_label[9].minutes() + ' \
       END AS min, \
       operation_time, \
       down_time \
      FROM precalculations_crane \
      WHERE ts >= "' + start_time.format('Y-MM-DD HH:mm:ss') + '" \
        AND ts < "' + end_time.format('Y-MM-DD HH:mm:ss') + '" \
      ORDER BY ts) AS prev \
      GROUP BY min;';
    let crane_results_to_return = {};
    crane_results_to_return['operation_time'] = {};
    crane_results_to_return['down_time'] = {};
    crane_results_to_return['operation_rate'] = {};
    let query_promise = fetchingData(one_hour_crane_query);
    query_promise.then(function(crane_results) {
      crane_results.forEach(function(crane_result) {
        crane_results_to_return['down_time'][crane_result.min] = crane_result.down_time;
        crane_results_to_return['operation_time'][crane_result.min] = crane_result.operation_time;
      });
      let ot_keys = Object.keys(crane_results_to_return['operation_time']);
      let dt_keys = Object.keys(crane_results_to_return['down_time']);
      let keys_union = [...new Set([...dt_keys, ...ot_keys])];
      keys_union.forEach(function(key2) {
        if (crane_results_to_return['operation_time'][key2] >= 0) {
        } else {
          crane_results_to_return['operation_time'][key2] = 0;
        }
        if (crane_results_to_return['down_time'][key2] >= 0) {
        } else {
          crane_results_to_return['down_time'][key2] = 0;
        }
        if ((crane_results_to_return['operation_time'][key2] + crane_results_to_return['down_time'][key2]) == 0) {
          crane_results_to_return['operation_rate'][key2] = 0;
        } else {
          crane_results_to_return['operation_rate'][key2] = crane_results_to_return['operation_time'][key2] / (crane_results_to_return['operation_time'][key2] + crane_results_to_return['down_time'][key2]);
        }
      });
      resolve(crane_results_to_return);
    });
  });
};

/**
  * function to calculate values for chart for duration single day for crane.
  * @param {object} Obj object.
  * @return {object} calculate values for selected day for crane for chart.
*/
let single_day_crane = (Obj) => {
  return new Promise(function(resolve, reject) {
    let start_time = Obj.start_time;
    let end_time = Obj.end_time;
    let query_crane = "SELECT '4-C1' AS machine_id, \
        concat(day(ts), hour(ts)) as hr, sum(operation_time) operation_time, \
        sum(down_time) AS down_time \
      FROM precalculations_crane \
        WHERE ts >= '" + start_time.format("Y-MM-DD HH:mm:ss") + "' AND ts < '" + end_time.format("Y-MM-DD HH:mm:ss") + "' \
        GROUP BY concat(day(ts), hour(ts));";
    let crane_results_to_return = {};
    crane_results_to_return['operation_time'] = {};
    crane_results_to_return['down_time'] = {};
    crane_results_to_return['operation_rate'] = {};
    let query_promise = fetchingData(query_crane);
    query_promise.then(function(crane_results) {
      crane_results.forEach(function(crane_result) {
        crane_results_to_return['down_time'][crane_result.hr] = crane_result.down_time;
        crane_results_to_return['operation_time'][crane_result.hr] = crane_result.operation_time;
      });
      let ot_keys = Object.keys(crane_results_to_return['operation_time']);
      let dt_keys = Object.keys(crane_results_to_return['down_time']);
      let keys_union = [...new Set([...dt_keys, ...ot_keys])];
      keys_union.forEach(function(key2) {
        if (crane_results_to_return['operation_time'][key2] >= 0) {
        } else {
          crane_results_to_return['operation_time'][key2] = 0;
        }
        if (crane_results_to_return['down_time'][key2] >= 0) {
        } else {
          crane_results_to_return['down_time'][key2] = 0;
        }
        if ((crane_results_to_return['operation_time'][key2] + crane_results_to_return['down_time'][key2]) == 0) {
          crane_results_to_return['operation_rate'][key2] = 0;
        } else {
          crane_results_to_return['operation_rate'][key2] = crane_results_to_return['operation_time'][key2] / (crane_results_to_return['operation_time'][key2] + crane_results_to_return['down_time'][key2]);
        }
      });
      resolve(crane_results_to_return);
    });
  });
};

/**
  * function to calculate values for chart for duration one hour and single day
  * for selected machines.
  * @param {object} Obj object.
  * @return {object} calculate values for selected day for selected machines
  * for chart.
*/
let single_day = (Obj) => {
  return new Promise(function(resolve, reject) {
    let database_name = Obj.database_name;
    let machine_list = Obj.machine_list;
    let for_date = Obj.input_date;
    let sub_duration = Obj.sub_duration;
    let group_start_label = Obj.group_start_label;
    let group_end_label = Obj.group_end_label;
    let minutes_list = Obj.minutes_list;
    let start_time;
    let end_time;
    let operation_time = {};
    let down_time = {};
    let down_time_rate = {};
    let operation_rate = {};
    let total_downtime = {};
    let total_operation_time = {};
    let last_timestamp = {};
    let flag = 0;
    let inside_flag = 0;
    let c_operation_time = 0;
    let c_down_time = 0;
    let c_operation_rate = 0;
    let c_down_time_rate = 0;
    let end_date_to_send;
    let disconnect_threshold = 300000;
    let start_threshold = 1;
    let end_threshold = 1;
    let machine_flag = {};
    let on_flag = {};
    let off_flag = {};

    // seperating machine and crane lists
    let crane_list = machine_list.filter(function(value, index, arr) {
      return value === '4-C1';
    });
    machine_list = machine_list.filter(function(value, index, arr) {
      return value != '4-C1';
    });

    // fetchig time setting
    let query = 'select * from web_app_parameters where variable in ' +
                '("start_hr_min", "end_hr_min")';
    let dayPromise = fetchingData(query);
    dayPromise.then(function(results) {
      results.forEach(function(result) {
        if (result.variable === 'start_hr_min') {
          start_hr_min = moment(result.value, 'HH:mm:ss');
        } else {
          end_hr_min = moment(result.value, 'HH:mm:ss');
        }
      });
      start_time = moment((for_date.format("Y-MM-DD") + " " + start_hr_min.format("HH:mm:ss")), "Y-MM-DD HH:mm:ss");
      end_time = moment((for_date.format("Y-MM-DD") + " " + end_hr_min.format("HH:mm:ss")), "Y-MM-DD HH:mm:ss");
      end_date_to_send = moment((for_date.format('Y-MM-DD') + " " + end_hr_min.format("HH:mm:ss")), "Y-MM-DD HH:mm:ss");
      if (start_time >= end_time) {
        end_time = moment(end_time.add(1, 'day'));
        end_date_to_send = moment(end_date_to_send.add(1, 'day'));
      }
      if (moment() < end_time) {
        end_time = moment();
      }

      if (sub_duration === 'one_hour') {
        let sql_machine_list = '';
        machine_list.forEach(function(machine) {
          sql_machine_list = sql_machine_list + "'" + machine + "',";
        });
        sql_machine_list = sql_machine_list.substring(0, sql_machine_list.length - 1);

        // creating string of partation names for selected machines
        // e.g. for machine_id '4-01' and timestamp '2019-06-04 12:54:00' partation name is 4_01sp4

        let partition_list = '';
        let partition_start_day = start_time.dayOfYear();
        if (partition_start_day == 366) {
          partition_start_day = 0;
        }
        let partition_end_day = end_time.dayOfYear();
        if (partition_end_day == 366) {
          partition_end_day = 0;
        }
        let partition_day_list = [];
        if (partition_start_day == partition_end_day) {
          partition_day_list.push(partition_start_day);
        } else {
          partition_day_list.push(partition_start_day);
          partition_day_list.push(partition_end_day);
        }

        machine_list.forEach(function(machine) {
          partition_day_list.forEach(function(partition_day) {
            partition_list = partition_list + machine.replace('-', '_') + "sp" + partition_day + ", ";
          });
        });
        partition_list = partition_list.substring(0, partition_list.length - 2);

        one_hour_query = 'select \
                              machine_id, \
                              ts, \
                              case \
                                  when ts >= "' + group_start_label[0].format('Y-MM-DD HH:mm:ss') + '" and ts <= "' + group_end_label[0].format('Y-MM-DD HH:mm:ss') + '" then ' + group_start_label[0].minutes() + ' \
                                  when ts >= "' + group_start_label[1].format('Y-MM-DD HH:mm:ss') + '" and ts <= "' + group_end_label[1].format('Y-MM-DD HH:mm:ss') + '" then ' + group_start_label[1].minutes() + ' \
                                  when ts >= "' + group_start_label[2].format('Y-MM-DD HH:mm:ss') + '" and ts <= "' + group_end_label[2].format('Y-MM-DD HH:mm:ss') + '" then ' + group_start_label[2].minutes() + ' \
                                  when ts >= "' + group_start_label[3].format('Y-MM-DD HH:mm:ss') + '" and ts <= "' + group_end_label[3].format('Y-MM-DD HH:mm:ss') + '" then ' + group_start_label[3].minutes() + ' \
                                  when ts >= "' + group_start_label[4].format('Y-MM-DD HH:mm:ss') + '" and ts <= "' + group_end_label[4].format('Y-MM-DD HH:mm:ss') + '" then ' + group_start_label[4].minutes() + ' \
                                  when ts >= "' + group_start_label[5].format('Y-MM-DD HH:mm:ss') + '" and ts <= "' + group_end_label[5].format('Y-MM-DD HH:mm:ss') + '" then ' + group_start_label[5].minutes() + ' \
                                  when ts >= "' + group_start_label[6].format('Y-MM-DD HH:mm:ss') + '" and ts <= "' + group_end_label[6].format('Y-MM-DD HH:mm:ss') + '" then ' + group_start_label[6].minutes() + ' \
                                  when ts >= "' + group_start_label[7].format('Y-MM-DD HH:mm:ss') + '" and ts <= "' + group_end_label[7].format('Y-MM-DD HH:mm:ss') + '" then ' + group_start_label[7].minutes() + ' \
                                  when ts >= "' + group_start_label[8].format('Y-MM-DD HH:mm:ss') + '" and ts <= "' + group_end_label[8].format('Y-MM-DD HH:mm:ss') + '" then ' + group_start_label[8].minutes() + ' \
                                  else ' + group_start_label[9].minutes() + ' \
                                  end as min, \
                                  prediction from ' + database_name + '.smooth_data partition ( ' + partition_list + ' ) \
                          where \
                              ts > "' + start_time.format('Y-MM-DD HH:mm:ss') + '" \
                              and \
                              ts < "' + end_time.format('Y-MM-DD HH:mm:ss') + '" \
                          order by machine_id, ts';

        machine_list.forEach(function(machine) {
          machine_flag[machine] = 0;
          on_flag[machine] = 0;
          off_flag[machine] = 0;
          operation_time[machine] = {};
          down_time[machine] = {};
          down_time_rate[machine] = {};
          operation_rate[machine] = {};
          total_downtime[machine] = 0;
          total_operation_time[machine] = 0;
          last_timestamp[machine] = {};
          for (let i = 0; i < 10; i++) {
            operation_time[machine][minutes_list[i]] = 0;
            down_time[machine][minutes_list[i]] = 0;
            down_time_rate[machine][minutes_list[i]] = 0;
            operation_rate[machine][minutes_list[i]] = 0;
            last_timestamp[machine][minutes_list[i]] = group_start_label[i];
          }
        });
        if (machine_list.length > 0) {
          let one_hour_query_promise = fetchingData(one_hour_query);
          one_hour_query_promise.then(function(one_hour_query_promise_results) {
            one_hour_query_promise_results.forEach(function(instance) {
              if ((moment(instance['ts'], 'Y-MM-DD HH:mm:ss').diff(last_timestamp[instance['machine_id']][instance['min']])) < disconnect_threshold) {
                if (instance['prediction'] == 0) {
                  off_flag[instance['machine_id']] = off_flag[instance['machine_id']] + 1;
                  on_flag[instance['machine_id']] = 0;
                  if (off_flag[instance['machine_id']] >= end_threshold) {
                    machine_flag[instance['machine_id']] = 0;
                  }
                } else {
                  off_flag[instance['machine_id']] = 0;
                  on_flag[instance['machine_id']] = on_flag[instance['machine_id']] + 1;
                  if (on_flag[instance['machine_id']] >= start_threshold) {
                    machine_flag[instance['machine_id']] = 1;
                  }
                }
                if (machine_flag[instance['machine_id']] == 0) {
                  down_time[instance['machine_id']][instance['min']] = down_time[instance['machine_id']][instance['min']] + moment(instance['ts'], 'Y-MM-DD HH:mm:ss').diff(last_timestamp[instance['machine_id']][instance['min']]) / 1000;
                } else {
                  operation_time[instance['machine_id']][instance['min']] = operation_time[instance['machine_id']][instance['min']] + moment(instance['ts'], 'Y-MM-DD HH:mm:ss').diff(last_timestamp[instance['machine_id']][instance['min']]) / 1000;
                  if (instance['min'] == 44) {
                  }
                }
              } else {
                machine_flag[instance['machine_id']] = 0;
              }
              last_timestamp[instance['machine_id']][instance['min']] = moment(instance['ts'], 'Y-MM-DD HH:mm:ss');
            });

            if (crane_list.length > 0) {
              let crane_obj = {
                'start_time': start_time,
                'end_time': end_time,
                'group_start_label': group_start_label,
                'group_end_label': group_end_label,
              };
              one_hour_crane(crane_obj).then((res) => {
                operation_time['4-C1'] = res['operation_time'];
                down_time['4-C1'] = res['down_time'];
                operation_rate['4-C1'] = res['operation_rate'];
                let results = {'operation_time': operation_time, 'down_time': down_time, "operation_rate": operation_rate, "c_operation_time": c_operation_time, "c_down_time": c_down_time, "start_time": start_time, "end_date_to_send": end_date_to_send};
                resolve(results);
              });
            } else {
              let results = {'operation_time': operation_time, 'down_time': down_time, "operation_rate": operation_rate, "c_operation_time": c_operation_time, "c_down_time": c_down_time, "start_time": start_time, "end_date_to_send": end_date_to_send};
              resolve(results);
            }
          });
        } else {
          if (crane_list.length > 0) {
            let crane_obj = {
              'start_time': start_time,
              'end_time': end_time,
              'group_start_label': group_start_label,
              'group_end_label': group_end_label,
            };
            one_hour_crane(crane_obj).then((res) => {
              operation_time['4-C1'] = res['operation_time'];
              down_time['4-C1'] = res['down_time'];
              operation_rate['4-C1'] = res['operation_rate'];
              let results = {'operation_time': operation_time, 'down_time': down_time, "operation_rate": operation_rate, "c_operation_time": 0, "c_down_time": 0, "start_time": start_time, "end_date_to_send": end_date_to_send};
              resolve(results);
            });
          }
        }
      } else {
        machine_list.forEach(function(machine) {
          let getAsyncResult = '';
          operation_time[machine] = {};
          down_time[machine] = {};
          down_time_rate[machine] = {};
          operation_rate[machine] = {};
          total_downtime[machine] = 0;
          total_operation_time[machine] = 0;
          last_timestamp[machine] = {};

          last_timestamp[machine][end_time.date() + '' + end_time.hours()] = moment(end_time).format('Y-MM-DD HH:00:00');
          
          operation_time[machine][start_time.date() + '' + start_time.hours()] = 0;
          down_time[machine][start_time.date() + '' + start_time.hours()] = 0;
          down_time_rate[machine][start_time.date() + '' + start_time.hours()] = 0;
          operation_rate[machine][start_time.date() + '' + start_time.hours()] = 0;
          operation_time[machine][end_time.date() + '' + end_time.hours()] = 0;
          down_time[machine][end_time.date() + '' + end_time.hours()] = 0;
          down_time_rate[machine][end_time.date() + '' + end_time.hours()] = 0;
          operation_rate[machine][end_time.date() + '' + end_time.hours()] = 0;
          query_today = 'select machine_id, concat(day(ts), \
          hour(ts)) as hr, sum(operation_time) operation_time, \
          sum(down_time) down_time \
          from ' + database_name + '.precalculations where \
          machine_id = "' + machine + '" and \
          ts >= "' + moment(start_time).format('Y-MM-DD HH:mm:ss') + '" and \
          ts < "' + moment(end_time).format('Y-MM-DD HH:mm:ss') + '" \
          group by machine_id, concat(day(ts), hour(ts))';

          let precalculations_promise = fetchingData(query_today);

          precalculations_promise.then(function(precalculations_promise_results) {
            precalculations_promise_results.forEach(function(precalculations_promise_result) {
              operation_time[precalculations_promise_result['machine_id']][precalculations_promise_result['hr']] = precalculations_promise_result['operation_time'];
              total_downtime[precalculations_promise_result['machine_id']] = total_downtime[precalculations_promise_result['machine_id']] + precalculations_promise_result['down_time'];
              total_operation_time[precalculations_promise_result['machine_id']] = total_operation_time[precalculations_promise_result['machine_id']] + precalculations_promise_result['operation_time'];
              down_time[precalculations_promise_result['machine_id']][precalculations_promise_result['hr']] = precalculations_promise_result['down_time'];
              if (precalculations_promise_result['down_time_rate']) {
                down_time_rate[precalculations_promise_result['machine_id']][precalculations_promise_result['hr']] = precalculations_promise_result['down_time_rate'];
              } else {
                down_time_rate[precalculations_promise_result['machine_id']][precalculations_promise_result['hr']] = 0;
              }
              if (precalculations_promise_result['operation_rate']) {
                operation_rate[precalculations_promise_result['machine_id']][precalculations_promise_result['hr']] = precalculations_promise_result['operation_rate'];
              } else {
                operation_rate[precalculations_promise_result['machine_id']][precalculations_promise_result['hr']] = 0;
              }
            });
            flag = flag + 1;
            if (flag == machine_list.length) {
              
              if (moment().diff(moment(end_time)) > 720000) {
                machine_list.forEach(function(m) {
                  
                  total_downtime[m] = total_downtime[m] + down_time[m][start_time.date() + "" + start_time.hours()];
                  total_operation_time[m] = total_operation_time[m] + operation_time[m][start_time.date() + "" + start_time.hours()];
                  total_downtime[m] = total_downtime[m] + down_time[m][end_time.date() + "" + end_time.hours()];
                  total_operation_time[m] = total_operation_time[m] + operation_time[m][end_time.date() + "" + end_time.hours()];

                  if ((down_time[m][start_time.date() + "" + start_time.hours()] + operation_time[m][start_time.date() + "" + start_time.hours()]) == 0) {
                    operation_rate[m][start_time.date() + "" + start_time.hours()] = 0;
                  } else {
                    operation_rate[m][start_time.date() + "" + start_time.hours()] = (operation_time[m][start_time.date() + "" + start_time.hours()] / (down_time[m][start_time.date() + "" + start_time.hours()] + operation_time[m][start_time.date() + "" + start_time.hours()])) * 100;
                  }
                  if ((down_time[m][end_time.date() + "" + end_time.hours()] + operation_time[m][end_time.date() + "" + end_time.hours()]) == 0) {
                    operation_rate[m][end_time.date() + "" + end_time.hours()] = 0;
                  } else {
                    operation_rate[m][end_time.date() + "" + end_time.hours()] = (operation_time[m][end_time.date() + "" + end_time.hours()] / (down_time[m][end_time.date() + "" + end_time.hours()] + operation_time[m][end_time.date() + "" + end_time.hours()])) * 100;
                  }
                });

                machine_list.forEach(function(m) {
                  c_operation_time = c_operation_time + total_operation_time[m];
                  c_down_time = c_down_time + total_downtime[m];
                });
                c_operation_rate = c_operation_time / (c_operation_time + c_down_time);
                c_down_time_rate = c_down_time / (c_operation_time + c_down_time);
                if (crane_list.length > 0) {
                  let crane_obj = {
                    'start_time': start_time,
                    'end_time': end_time,
                  };
                  single_day_crane(crane_obj).then((res) => {
                    operation_time['4-C1'] = res['operation_time'];
                    down_time['4-C1'] = res['down_time'];
                    operation_rate['4-C1'] = res['operation_rate'];
                    let results = { 'operation_time': operation_time, 'down_time': down_time, "operation_rate": operation_rate, "c_operation_time": c_operation_time, "c_down_time": c_down_time, "start_time": start_time, "end_date_to_send": end_date_to_send };
                    resolve(results);
                  });
                } else {
                  let results = { 'operation_time': operation_time, 'down_time': down_time, "operation_rate": operation_rate, "c_operation_time": c_operation_time, "c_down_time": c_down_time, "start_time": start_time, "end_date_to_send": end_date_to_send };
                  resolve(results);
                }
              } else {
                machine_list.forEach(function(inside_machine) {
                  let end_point_min = moment().minutes()%10;

                  if (database_name === 'hmmasterdbcs') {
                    getAsyncResult = getAsync('chart_last_ts_cs_' + inside_machine);
                  } else {
                    getAsyncResult = getAsync('chart_last_ts_sa_' + inside_machine);
                  }
                  let query_end_points = '';
                  getAsyncResult.then(function(res) {
                    last_timestamp[inside_machine][(moment().subtract(end_point_min + 10, 'minutes')).date() + '' + (moment().subtract(end_point_min + 10, 'minutes')).hours()] = moment((moment().subtract(end_point_min + 10, 'minutes'))).format('Y-MM-DD HH:mm:00');
                    query_end_points = 'select \
                        machine_id, ts, concat(day(ts), \
                        hour(ts)) as hr, prediction \
                        from ' + database_name + '.smooth_data_rts  \
                        where machine_id = "' + inside_machine + '" and \
                        ts >= "\
                        ' + (moment().subtract(end_point_min + 10, 'minutes')).format('Y-MM-DD HH:mm:00') + '" \
                        and ts <= "\
                        ' + moment(end_time).format('Y-MM-DD HH:mm:ss') + '" \
                        order by ts';
                    if (end_point_min < 2) {
                      query_end_points = 'select \
                        machine_id, ts, concat(day(ts), \
                        hour(ts)) as hr, prediction \
                        from ' + database_name + '.smooth_data_rts  \
                        where machine_id = "' + inside_machine + '" and \
                        ts > "' + moment(res).format('Y-MM-DD HH:mm:ss') + '" and ts >= "\
                        ' + (moment().subtract(end_point_min + 10, 'minutes')).format('Y-MM-DD HH:mm:00') + '" \
                        and ts <= "\
                        ' + moment(end_time).format('Y-MM-DD HH:mm:ss') + '" \
                        order by ts';
                      if (res) {
                        last_timestamp[inside_machine][(moment().subtract(end_point_min + 10, 'minutes')).date() + '' + (moment().subtract(end_point_min + 10, 'minutes')).hours()] = res;
                      }
                    }
                    if (end_point_min >= 2) {
                      last_timestamp[inside_machine][(moment().subtract(end_point_min, 'minutes')).date() + '' + (moment().subtract(end_point_min, 'minutes')).hours()] = moment((moment().subtract(end_point_min, 'minutes'))).format('Y-MM-DD HH:mm:00');
                      query_end_points = 'select \
                          machine_id, ts, concat(day(ts), \
                          hour(ts)) as hr, prediction \
                          from ' + database_name + '.smooth_data_rts  \
                          where machine_id = "' + inside_machine + '" and \
                          ts >= "\
                          ' + (moment().subtract(end_point_min, 'minutes')).format('Y-MM-DD HH:mm:00') + '" \
                          and ts <= "\
                          ' + moment(end_time).format('Y-MM-DD HH:mm:ss') + '" \
                          order by ts';
                      if (res) {
                        query_end_points = 'select \
                          machine_id, ts, concat(day(ts), \
                          hour(ts)) as hr, prediction \
                          from ' + database_name + '.smooth_data_rts  \
                          where machine_id = "' + inside_machine + '" and \
                          ts > "' + moment(res).format('Y-MM-DD HH:mm:ss') + '" and ts >= "\
                          ' + (moment().subtract(end_point_min, 'minutes')).format('Y-MM-DD HH:mm:00') + '" \
                          and ts <= "\
                          ' + moment(end_time).format('Y-MM-DD HH:mm:ss') + '" \
                          order by ts';
                        last_timestamp[inside_machine][(moment().subtract(end_point_min, 'minutes')).date() + '' + (moment().subtract(end_point_min, 'minutes')).hours()] = res;
                      }
                    }

                    let end_points_promise = fetchingData(query_end_points);
                    end_points_promise.then(function(end_points_promise_results) {
                      machine_flag[machine] = 0;
                      on_flag[machine] = 0;
                      off_flag[machine] = 0;
                      end_points_promise_results.forEach(function(instance) {
                        if ((moment(instance['ts'], 'Y-MM-DD HH:mm:ss').diff(last_timestamp[instance['machine_id']][instance['hr']])) < disconnect_threshold) {
                          if (instance['prediction'] == 0) {
                            off_flag[machine] = off_flag[machine] + 1;
                            on_flag[machine] = 0;
                            if (off_flag[machine] >= end_threshold) {
                              machine_flag[machine] = 0;
                            }
                          } else {
                            off_flag[machine] = 0;
                            on_flag[machine] = on_flag[machine] + 1;
                            if (on_flag[machine] >= start_threshold) {
                              machine_flag[machine] = 1;
                            }
                          }
                          if (machine_flag[machine] == 0) {
                            down_time[instance['machine_id']][instance['hr']] = down_time[instance['machine_id']][instance['hr']] + moment(instance['ts'], 'Y-MM-DD HH:mm:ss').diff(last_timestamp[instance['machine_id']][instance['hr']]) / 1000;
                          } else {
                            operation_time[instance['machine_id']][instance['hr']] = operation_time[instance['machine_id']][instance['hr']] + moment(instance['ts'], 'Y-MM-DD HH:mm:ss').diff(last_timestamp[instance['machine_id']][instance['hr']]) / 1000;
                          }
                        } else {
                          machine_flag[machine] = 0;
                        }
                        last_timestamp[instance['machine_id']][instance['hr']] = moment(instance['ts'], 'Y-MM-DD HH:mm:ss');
                      });
                      inside_flag = inside_flag + 1;
                      if (inside_flag == machine_list.length) {
                        machine_list.forEach(function(m) {
                          total_downtime[m] = total_downtime[m] + down_time[m][start_time.date() + "" + start_time.hours()];
                          total_operation_time[m] = total_operation_time[m] + operation_time[m][start_time.date() + "" + start_time.hours()];
                          total_downtime[m] = total_downtime[m] + down_time[m][end_time.date() + "" + end_time.hours()];
                          total_operation_time[m] = total_operation_time[m] + operation_time[m][end_time.date() + "" + end_time.hours()];

                          if ((down_time[m][start_time.date() + "" + start_time.hours()] + operation_time[m][start_time.date() + "" + start_time.hours()]) == 0) {
                            operation_rate[m][start_time.date() + "" + start_time.hours()] = 0;
                          } else {
                            operation_rate[m][start_time.date() + "" + start_time.hours()] = (operation_time[m][start_time.date() + "" + start_time.hours()] / (down_time[m][start_time.date() + "" + start_time.hours()] + operation_time[m][start_time.date() + "" + start_time.hours()])) * 100;
                          }
                          if ((down_time[m][end_time.date() + "" + end_time.hours()] + operation_time[m][end_time.date() + "" + end_time.hours()]) == 0) {
                            operation_rate[m][end_time.date() + "" + end_time.hours()] = 0;
                          } else {
                            operation_rate[m][end_time.date() + "" + end_time.hours()] = (operation_time[m][end_time.date() + "" + end_time.hours()] / (down_time[m][end_time.date() + "" + end_time.hours()] + operation_time[m][end_time.date() + "" + end_time.hours()])) * 100;
                          }
                        });
                        machine_list.forEach(function(m) {
                          c_operation_time = c_operation_time + total_operation_time[m];
                          c_down_time = c_down_time + total_downtime[m];
                        });
                        c_operation_rate = c_operation_time / (c_operation_time + c_down_time);
                        c_down_time_rate = c_down_time / (c_operation_time + c_down_time);
                        if (crane_list.length > 0) {
                          let crane_obj = {
                            'start_time': start_time,
                            'end_time': end_time,
                          };
                          single_day_crane(crane_obj).then((res) => {
                            operation_time['4-C1'] = res['operation_time'];
                            down_time['4-C1'] = res['down_time'];
                            operation_rate['4-C1'] = res['operation_rate'];
                            let results = { 'operation_time': operation_time, 'down_time': down_time, "operation_rate": operation_rate, "c_operation_time": c_operation_time, "c_down_time": c_down_time, "start_time": start_time, "end_date_to_send": end_date_to_send };
                            resolve(results);
                          });
                        } else {
                          let results = {'operation_time': operation_time, 'down_time': down_time, "operation_rate": operation_rate, "c_operation_time": c_operation_time, "c_down_time": c_down_time, "start_time": start_time, "end_date_to_send": end_date_to_send};
                          resolve(results);
                        }
                      }
                    }, function(err) {
                      console.log(err);
                    });
                  }, function(err) {
                    console.log(err);
                  });
                });
              }
            }
          }, function(err) {
            console.log(err);
          });
        });
        if (machine_list.length == 0) {
          if (crane_list.length > 0) {
            let crane_obj = {
              'start_time': start_time,
              'end_time': end_time
            };
            single_day_crane(crane_obj).then((res) => {
              operation_time['4-C1'] = res['operation_time'];
              down_time['4-C1'] = res['down_time'];
              operation_rate['4-C1'] = res['operation_rate'];
              let results = { 'operation_time': operation_time, 'down_time': down_time, "operation_rate": operation_rate, "c_operation_time": 0, "c_down_time": 0, "start_time": start_time, "end_date_to_send": end_date_to_send };
              resolve(results);
            });
          }
        }
      }
    });
  });
};

/**
  * function to calculate values for chart for duration day (in formate
  * required for week, month, year, six month) for crane
  * @param {object} Obj object.
  * @return {object} calculate values for day for crane for chart.
*/
let n_day_crane = (Obj) => {
  return new Promise(function(resolve, reject) {
    let start_time = Obj.start_time;
    let end_time = Obj.end_time;
    let query_crane = "SELECT '4-C1' AS machine_id, \
        sum(operation_time) as operation_time, \
        sum(down_time) as down_time \
      FROM precalculations_crane \
        WHERE ts >= '" + start_time.format("Y-MM-DD HH:mm:ss") + "' AND ts < '" + end_time.format("Y-MM-DD HH:mm:ss") + "';";
    let crane_results_to_return = {};

    crane_results_to_return['operation_time'] = null;
    crane_results_to_return['down_time'] = null;
    crane_results_to_return['operation_rate'] = null;
    let query_promise = fetchingData(query_crane);

    query_promise.then(function(crane_results) {
      crane_results.forEach(function(crane_result) {
        if (crane_result.down_time > 0) {
          crane_results_to_return['down_time'] = crane_result.down_time;
        } else {
          crane_results_to_return['down_time'] = 0;
        }

        if (crane_result.operation_time > 0) {
          crane_results_to_return['operation_time'] = crane_result.operation_time;
        } else {
          crane_results_to_return['operation_time'] = 0;
        }
      });


      resolve(crane_results_to_return);
    });
  });
};

/**
  * function to calculate values for chart for duration day (in formate
  * required for week, month, year, six month) for selected machines.
  * @param {object} Obj object.
  * @return {object} calculate values for day for selected machines for chart.
*/
let n_day = (Obj) => {
  return new Promise(function(resolve, reject) {
    let database_name = Obj.database_name;
    let machine_list = Obj.machine_list;
    let for_date = Obj.input_date;
    let duration = Obj.duration;
    let crane_list = machine_list.filter(function(value, index, arr) {
      return value === '4-C1';
    });
    // seperating machines and crane
    machine_list = machine_list.filter(function(value, index, arr) {
      return value != '4-C1';
    });
    let operation_time = {};
    let down_time = {};
    let operation_time_ep = {};
    let down_time_ep = {};
    let down_time_rate = {};
    let operation_rate = {};
    let total_downtime = {};
    let total_operation_time = {};
    let last_timestamp = {};
    let flag = 0;
    let inside_flag = 0;
    let c_operation_time = 0;
    let c_down_time = 0;
    let c_operation_rate = 0;
    let c_down_time_rate = 0;
    let start_hr_min;
    let end_hr_min;
    let start_time;
    let end_time;
    let current_hr_min = moment();
    let end_date_to_send;
    let disconnect_threshold = 300000;
    let start_threshold = 1;
    let end_threshold = 1;
    let machine_flag = {};
    let on_flag = {};
    let off_flag = {};
    let duration_counter = for_date.date();
    if (duration === 'day') {
      duration_counter = for_date.date();
    } else {
      duration_counter = for_date.month() + 1;
    }

    query = "select * from web_app_parameters where variable in ('start_hr_min', 'end_hr_min')";
    // fetching starting and ending time from mysql
    let dayPromise = fetchingData(query);
    dayPromise.then(function(results) {
      results.forEach(function(result) {
        if (result.variable === 'start_hr_min') {
          start_hr_min = moment(result.value, "HH:mm:ss");
        } else {
          end_hr_min = moment(result.value, "HH:mm:ss");
        }
      });
      start_time = moment((for_date.format("Y-MM-DD") + " " + start_hr_min.format("HH:mm:ss")), "Y-MM-DD HH:mm:ss");
      end_time = moment((for_date.format("Y-MM-DD") + " " + end_hr_min.format("HH:mm:ss")), "Y-MM-DD HH:mm:ss");
      end_date_to_send = moment((for_date.format('Y-MM-DD') + " " + end_hr_min.format("HH:mm:ss")), "Y-MM-DD HH:mm:ss");

      if (start_time < current_hr_min) {
        if (start_time < end_time) {
          if (current_hr_min < end_time) {
            end_time = current_hr_min;
          }
        } else {
          end_time = moment(end_time.add(1, 'day'));
          data_to_send = moment(end_date_to_send.add(1, 'day'));
          if (current_hr_min < end_time) {
            end_time = current_hr_min;
          }
        }
      } else {
        // setting starting and ending time
        if (start_hr_min < end_hr_min) {
          if (current_hr_min > start_hr_min) {
            if (current_hr_min < end_hr_min) {
              start_time = moment(start_hr_min);
              end_time = moment(current_hr_min);
            } else {
              start_time = moment(start_hr_min);
              end_time = moment(end_hr_min);
            }
          } else {
            start_time = moment(start_hr_min).subtract(1, 'day');
            end_time = moment(end_hr_min).subtract(1, 'day');
          }
        } else {
          if (current_hr_min > start_hr_min) {
            start_time = moment(start_hr_min);
            end_time = moment(current_hr_min);
          } else {
            if (current_hr_min < end_hr_min) {
              start_time = moment(start_hr_min).subtract(1, "day");
              end_time = moment(current_hr_min);
            } else {
              start_time = moment(start_hr_min).subtract(1, "day");
              end_time = moment(end_hr_min);
            }
          }
        }
      }

      if (machine_list.length == 0) {
        if (crane_list.length > 0) {
          let crane_obj = {
            'start_time': start_time,
            'end_time': end_time,
          };
          n_day_crane(crane_obj).then((res) => {
            operation_time['4-C1'] = res['operation_time'];
            down_time['4-C1'] = res['down_time'];
            operation_rate['4-C1'] = res['operation_rate'];
            let results = {'duration_counter': duration_counter, 'operation_time': operation_time, 'down_time': down_time, "operation_rate": operation_rate, "c_operation_time": c_operation_time, "c_down_time": c_down_time, "start_time": start_time, "end_date_to_send": end_date_to_send};
            resolve(results);
          });
        }
      }
      machine_list.forEach(function(machine) {
        operation_time[machine] = 0;
        down_time[machine] = 0;
        down_time_rate[machine] = 0;
        operation_rate[machine] = 0;
        total_downtime[machine] = 0;
        total_operation_time[machine] = 0;
        operation_time_ep[machine] = {};
        down_time_ep[machine] = {};
        operation_time_ep[machine][start_time.date() + '' + start_time.hours()] = 0;
        operation_time_ep[machine][end_time.date() + '' + end_time.hours()] = 0;
        down_time_ep[machine][start_time.date() + '' + start_time.hours()] = 0;
        down_time_ep[machine][end_time.date() + '' + end_time.hours()] = 0;
        last_timestamp[machine] = {};
        last_timestamp[machine][start_time.date() + '' + start_time.hours()] = moment(start_time).format('Y-MM-DD HH:mm:ss');
        last_timestamp[machine][end_time.date() + '' + end_time.hours()] = moment(end_time).format('Y-MM-DD HH:00:00');

        if (start_time.hours() == end_time.hours()) {
          last_timestamp[machine][start_time.date() + '' + start_time.hours()] = moment(start_time).format('Y-MM-DD HH:mm:ss');
        }

        let query_today = 'select \
        machine_id, sum(operation_time) as operation_time, \
        sum(down_time) as down_time from ' + database_name + '.precalculations \
        where machine_id = "' + machine + '" and \
        ts >= "' + moment(start_time).format('Y-MM-DD HH:mm:ss') + '" and \
        ts < "' + moment(end_time).format('Y-MM-DD HH:mm:ss') + '" \
        group by machine_id';


        let precalculations_promise = fetchingData(query_today);
        precalculations_promise.then(function(precalculations_promise_results) {
          precalculations_promise_results.forEach(function(precalculations_promise_result) {
            operation_time[precalculations_promise_result['machine_id']] = precalculations_promise_result['operation_time'];
            total_downtime[precalculations_promise_result['machine_id']] = total_downtime[precalculations_promise_result['machine_id']] + precalculations_promise_result['down_time'];
            total_operation_time[precalculations_promise_result['machine_id']] = total_operation_time[precalculations_promise_result['machine_id']] + precalculations_promise_result['operation_time'];
            down_time[precalculations_promise_result['machine_id']] = precalculations_promise_result['down_time'];
            if (precalculations_promise_result['down_time_rate']) {
              down_time_rate[precalculations_promise_result['machine_id']] = precalculations_promise_result['down_time_rate'];
            } else {
              down_time_rate[precalculations_promise_result['machine_id']] = 0;
            }
            if (precalculations_promise_result['operation_rate']) {
              operation_rate[precalculations_promise_result['machine_id']] = precalculations_promise_result['operation_rate'];
            } else {
              operation_rate[precalculations_promise_result['machine_id']] = 0;
            }
          });
          flag = flag + 1;
          if (flag == machine_list.length) {
            machine_list.forEach(function(m) {
              if ((down_time[m] + operation_time[m]) == 0) {
                operation_rate[m] = 0;
              } else {
                operation_rate[m] = operation_time[m] / (down_time[m] + operation_time[m]);
              }
            });
            machine_list.forEach(function(m) {
              c_operation_time = c_operation_time + operation_time[m];
              c_down_time = c_down_time + down_time[m];
            });
            c_operation_rate = c_operation_time / (c_operation_time + c_down_time);
            c_down_time_rate = c_down_time / (c_operation_time + c_down_time);
            if (crane_list.length > 0) {
              let crane_obj = {
                'start_time': start_time,
                'end_time': end_time,
              };
              n_day_crane(crane_obj).then((res) => {
                operation_time['4-C1'] = res['operation_time'];
                down_time['4-C1'] = res['down_time'];
                operation_rate['4-C1'] = res['operation_rate'];
                let results = {'duration_counter': duration_counter, 'operation_time': operation_time, 'down_time': down_time, "operation_rate": operation_rate, "c_operation_time": c_operation_time, "c_down_time": c_down_time, "start_time": start_time, "end_date_to_send": end_date_to_send};
                resolve(results);
              });
            } else {
              let results = {'duration_counter': duration_counter, 'operation_time': operation_time, 'down_time': down_time, "operation_rate": operation_rate, "c_operation_time": c_operation_time, "c_down_time": c_down_time, "start_time": start_time, "end_date_to_send": end_date_to_send};
              resolve(results);
            }
          }
        }, function(err) {
          console.log(err);
        });
      });
    });
  });
};

/**
  * N days function.
  * @param {object} Objs The first number.
  * @return {array} res server responce object.
*/
async function x_days(Objs) {
  let arrayOfFunc = [];
  Objs.forEach((obj) => {
    arrayOfFunc.push(n_day(obj));
  });
  let res = await x_days_helper(arrayOfFunc);
  return res;
}

/**
  * N days helper.
  * @param {array} arrayOfFunc The first number.
  * @return {object} result server responce object.
*/
function x_days_helper(arrayOfFunc) {
  return Promise.all(arrayOfFunc).then((result) => {
    return result;
  }).catch((error) => {
    console.log(error);
  });
}

/**
  * Calculates and returns data for month charts.
  * @param {array} machine_list The first number.
  * @param {string} for_date starting date.
  * @param {string} custom_end_time ending date.
  * @param {string} tab_type custome or year.
  * @param {string} database_name database to use.
  * @param {object} res server responce object.
*/
function monthfun(machine_list,
    for_date, custom_end_time, tab_type, database_name, res) {
  let displayData = {};
  displayData['labels'] = [];
  displayData['reportData'] = [];
  let duration = 'day';
  let y_axis_operation_max_label = 24;
  let y_axis_downtime_max_label = 24;
  let y_axis_operation_rate_max_label = 100;
  let from_date;
  let to_date;
  if (tab_type === "custom") {
    from_date = moment(for_date);
    to_date = moment(custom_end_time);
  } else {
    from_date = moment(for_date.format('Y-MM-01') + " 00:00:00");
    to_date = moment(moment(for_date).endOf('month').format('Y-MM-DD'), 'Y-MM-DD');
  }
  // counter to count total operation time and downtime
  let total_operation = 0;
  let total_downtime_o = 0;
  // variable for starting and ending time for which data of day is requested
  let start_hr_min;
  let end_hr_min;
  // current time
  let current_hr_min = moment();
  // varible to store starting and ending datetime
  let start_time;
  let end_time;
  let end_flag;
  let end_date_to_send;


  query = 'select * from web_app_parameters where variable in ("start_hr_min", \
          "end_hr_min")';
  let weekPromise = fetchingData(query);
  weekPromise.then(function(results) {
    results.forEach(function(result) {
      if (result.variable === 'start_hr_min') {
        start_hr_min = moment(result.value, 'HH:mm:ss');
      } else {
        end_hr_min = moment(result.value, 'HH:mm:ss');
      }
    });

    start_time = moment((from_date.format('Y-MM-DD') + ' ' + start_hr_min.format('HH:mm:ss')));
    if (start_hr_min < end_hr_min) {
      end_date_to_send = moment(to_date.format('Y-MM-DD') + ' ' + end_hr_min.format('HH:mm:ss'));
      end_time = moment(to_date.format('Y-MM-DD') + ' ' + end_hr_min.format('HH:mm:ss'));
    } else {
      end_date_to_send = moment(moment(to_date.format('Y-MM-DD')).add(1, 'day').format('Y-MM-DD') + ' ' + end_hr_min.format('HH:mm:ss'));
      end_time = moment(moment(to_date.format('Y-MM-DD')).add(1, 'day').format('Y-MM-DD') + ' ' + end_hr_min.format('HH:mm:ss'));
    }

    if (start_time >= current_hr_min) {
      start_time.subtract(1, 'week');
      end_time.subtract(1, 'week');
      end_date_to_send.subtract(1, 'week');
    }

    if (start_hr_min < end_hr_min) {
      end_flag = moment(moment(start_time).format('Y-MM-DD') + ' ' + end_hr_min.format('HH:mm:ss'));
    } else {
      end_flag = moment(moment(start_time).add(1, 'day').format('Y-MM-DD') + ' ' + end_hr_min.format('HH:mm:ss'));
    }

    let flag = moment(start_time);
    x_axis_label = [];
    total_time = {};
    day_list = [];
    while (flag < end_time) {
      label = moment(flag).format('DD');
      x_axis_label.push(label);
      day_list.push(flag.format('D'));

      if (end_flag < end_time) {
        total_time[flag.format('D').toString()] = end_flag.diff(flag, 'hours', true);
      } else {
        total_time[flag.format('D').toString()] = end_time.diff(flag, 'hours', true);
      }
      flag.add(1, 'day');
      end_flag.add(1, 'day');
    }
    let raw_data_operation_list = {};
    displayData = {};
    displayData['machine_list'] = machine_list;
    machine_list.forEach(function(machine) {
      displayData[machine] = {};
      displayData[machine]['operation'] = [];
      displayData[machine]['downtime'] = [];
      displayData[machine]['operation_rate'] = [];
    });
    machine_list.forEach(function(machine) {
      raw_data_operation_list[machine] = {};
    });

    let start = moment(from_date.format('Y-MM-DD'), 'Y-MM-DD');
    let end = moment(to_date.format('Y-MM-DD'), 'Y-MM-DD');
    if (end > moment()) {
      end = moment();
    }
    let range = moment.range(start, end);
    let day_list_for_query = Array.from(range.by('day'));
    day_list_for_query = day_list_for_query.map(m => m.format('Y-MM-DD HH:mm:ss'));

    let day_obj = [];
    day_list_for_query.forEach(function(day_value) {
      day_obj.push({
        'machine_list': machine_list,
        'input_date': moment(day_value),
        'duration': duration,
        'database_name': database_name,
      });
    });
    let operation_list_to_send = {};
    let downtime_list_to_send = {};

    machine_list.forEach(function(machine) {
      operation_list_to_send[machine] = {};
      downtime_list_to_send[machine] = {};
    });
    x_days(day_obj).then((resu) => {
      resu.forEach(function(instance) {
        machine_list.forEach(function(machine) {
          operation_list_to_send[machine][instance['duration_counter']] = instance['operation_time'][machine];
          downtime_list_to_send[machine][instance['duration_counter']] = instance['down_time'][machine];
        });
      });
      let raw_data_operation_list = operation_list_to_send;
      let raw_data_downtime_list = downtime_list_to_send;

      let keys = Object.keys(raw_data_operation_list);
      keys.forEach(function(key2) {
        let operation = [];
        let downtime = [];
        let operation_rate = [];
        day_list.forEach(function(dy) {
          if (dy in raw_data_operation_list[key2]) {
            if (key2 != '4-C1') {
              op = raw_data_operation_list[key2][dy] / 3600;
              operation.push(raw_data_operation_list[key2][dy] / 3600);
              total_operation = total_operation + raw_data_operation_list[key2][dy];
            } else {
              if (raw_data_operation_list[key2][dy]) {
                op = raw_data_operation_list[key2][dy] / 3600;
                operation.push(raw_data_operation_list[key2][dy] / 3600);
              } else {
                operation.push(null);
              }
            }
          } else {
            if (key2 != '4-C1') {
              operation.push(0);
              raw_data_operation_list[key2][dy] = 0;
            } else {
              operation.push(null);
              raw_data_operation_list[key2][dy] = null;
            }
          }

          if (dy in raw_data_downtime_list[key2]) {
            if (key2 != '4-C1') {
              dt = raw_data_downtime_list[key2][dy] / 3600;
              downtime.push(raw_data_downtime_list[key2][dy] / 3600);
              total_downtime_o = total_downtime_o + raw_data_downtime_list[key2][dy];
            } else {
              if (raw_data_downtime_list[key2][dy]) {
                dt = raw_data_downtime_list[key2][dy] / 3600;
                downtime.push(raw_data_downtime_list[key2][dy] / 3600);
              } else {
                downtime.push(null);
              }
            }
          } else {
            if (key2 != '4-C1') {
              downtime.push(0);
              raw_data_downtime_list[key2][dy] = 0;
            } else {
              downtime.push(null);
              raw_data_downtime_list[key2][dy] = null;
            }
          }
        });


        day_list.forEach(function(dy) {
          if (dy in raw_data_operation_list[key2]) {
            if ((raw_data_downtime_list[key2][dy] + raw_data_operation_list[key2][dy]) == 0) {
              if (key2 == '4-C1') {
                if (raw_data_downtime_list[key2][dy] && raw_data_operation_list[key2][dy]) {

                  operation_rate.push(0);
                } else {
                  operation_rate.push(null);
                }
              } else {
                operation_rate.push(0);
              }
            } else {
              operation_rate.push(raw_data_operation_list[key2][dy] / (raw_data_downtime_list[key2][dy] + raw_data_operation_list[key2][dy]) * 100);
            }
          }
        });
        displayData['y_axis_operation_max_label'] = Math.ceil(y_axis_operation_max_label);
        displayData['y_axis_downtime_max_label'] = Math.ceil(y_axis_downtime_max_label);
        displayData['y_axis_operation_rate_max_label'] = Math.ceil(y_axis_operation_rate_max_label);

        displayData[key2].operation = operation;
        displayData[key2].downtime = downtime;
        displayData[key2].operation_rate = operation_rate;
        displayData['circle_value'] = [total_operation, total_operation / (total_operation + total_downtime_o), total_downtime_o, total_downtime_o / (total_operation + total_downtime_o), total_operation / (total_operation + total_downtime_o) * 100, total_downtime_o / (total_operation + total_downtime_o) * 100];
        displayData['start_time'] = start_time;
        displayData['end_time'] = end_date_to_send;
        displayData['x_axis_label'] = x_axis_label;
        displayData['duration'] = 'month';
      });
      data_to_send = {'displayData': displayData};
      res.send(data_to_send);
    }, function(err) {
      console.log(err);
    });
  });
}

/**
  * Calculates and returns data for week charts.
  * @param {array} machine_list The first number.
  * @param {string} for_date starting date.
  * @param {string} database_name database to use.
  * @param {object} res server responce object.
*/
function weekfun(machine_list, for_date, database_name, res) {
  let displayData = {};
  displayData['labels'] = [];
  displayData['reportData'] = [];
  let duration = 'day';
  let y_axis_operation_max_label = 24;
  let y_axis_downtime_max_label = 24;
  let y_axis_operation_rate_max_label = 100;
  const from_date = moment(for_date.startOf('isoweek'));
  const to_date = moment(for_date.endOf('isoweek'));

  // counter to count total operation time and downtime
  let total_operation = 0;
  let total_downtime_o = 0;
  // variable for starting and ending time for which data of day is requested
  let start_hr_min;
  let end_hr_min;
  // current time
  let current_hr_min = moment();
  // varible to store starting and ending datetime
  let start_time;
  let end_time;
  let end_flag;
  let end_date_to_send;
  // query to fetch starting and ending time

  query = 'select * from web_app_parameters where variable in ("start_hr_min", \
          "end_hr_min")';
  // fetching starting and ending time from mysql
  let weekPromise = fetchingData(query);
  weekPromise.then(function(results) {
    results.forEach(function(result) {
      if (result.variable === 'start_hr_min') {
        start_hr_min = moment(result.value, 'HH:mm:ss');
      } else {
        end_hr_min = moment(result.value, 'HH:mm:ss');
      }
    });

    start_time = moment((from_date.format('Y-MM-DD') + ' ' + start_hr_min.format('HH:mm:ss')));
    if (start_hr_min < end_hr_min) {
      end_date_to_send = moment(to_date.format('Y-MM-DD') + ' ' + end_hr_min.format('HH:mm:ss'));
      end_time = moment(to_date.format('Y-MM-DD') + " " + end_hr_min.format("HH:mm:ss"));
    } else {
      end_date_to_send = moment(moment(to_date.format('Y-MM-DD')).add(1, 'day').format('Y-MM-DD') + " " + end_hr_min.format("HH:mm:ss"));
      end_time = moment(moment(to_date.format('Y-MM-DD')).add(1, 'day').format('Y-MM-DD') + " " + end_hr_min.format("HH:mm:ss"));
    }

    if (start_time >= current_hr_min) {
      start_time.subtract(1, 'week');
      end_time.subtract(1, 'week');
      end_date_to_send.subtract(1, 'week');
    }

    if (start_hr_min < end_hr_min) {
      end_flag = moment(moment(start_time).format('Y-MM-DD') + " " + end_hr_min.format("HH:mm:ss"));
    } else {
      end_flag = moment(moment(start_time).add(1, 'day').format('Y-MM-DD') + " " + end_hr_min.format("HH:mm:ss"));
    }

    let flag = moment(start_time);
    x_axis_label = [];
    total_time = {};
    day_list = [];
    // generating x-axis labels and total time list
    while (flag < end_time) {
      label = moment(flag).format('DD');
      x_axis_label.push(label);
      day_list.push(flag.format('D'));

      if (end_flag < end_time) {
        total_time[flag.format('D').toString()] = end_flag.diff(flag, 'hours', true);
      } else {
        total_time[flag.format('D').toString()] = end_time.diff(flag, 'hours', true);
      }
      flag.add(1, 'day');
      end_flag.add(1, 'day');
    }
    let raw_data_operation_list = {};
    displayData = {};
    displayData['machine_list'] = machine_list;
    machine_list.forEach(function(machine) {
      displayData[machine] = {};
      displayData[machine]['operation'] = [];
      displayData[machine]['downtime'] = [];
      displayData[machine]['operation_rate'] = [];
    });
    machine_list.forEach(function(machine) {
      raw_data_operation_list[machine] = {};
    });


    let start = moment(from_date.format('Y-MM-DD'), 'Y-MM-DD');
    let end = moment(to_date.format('Y-MM-DD'), 'Y-MM-DD');
    if (end > moment()) {
      end = moment();
    }
    let range = moment.range(start, end);
    let day_list_for_query = Array.from(range.by('day'));
    day_list_for_query = day_list_for_query.map(m => m.format('Y-MM-DD HH:mm:ss'));

    let day_obj = [];
    day_list_for_query.forEach(function(day_value) {
      day_obj.push({
        'machine_list': machine_list,
        'input_date': moment(day_value),
        'duration': duration,
        'database_name': database_name,
      });
    });
    let operation_list_to_send = {};
    let downtime_list_to_send = {};

    machine_list.forEach(function(machine) {
      operation_list_to_send[machine] = {};
      downtime_list_to_send[machine] = {};
    });
    x_days(day_obj).then((resu) => {
      resu.forEach(function(instance) {
        machine_list.forEach(function(machine) {
          operation_list_to_send[machine][instance['duration_counter']] = instance['operation_time'][machine];
          downtime_list_to_send[machine][instance['duration_counter']] = instance['down_time'][machine];
        });
      });
      let raw_data_operation_list = operation_list_to_send;
      let raw_data_downtime_list = downtime_list_to_send;
      let keys = Object.keys(raw_data_operation_list);
      keys.forEach(function(key2) {
        let operation = [];
        let downtime = [];
        let operation_rate = [];
        day_list.forEach(function(dy) {
          if (dy in raw_data_operation_list[key2]) {
            if (key2 != '4-C1') {
              op = raw_data_operation_list[key2][dy] / 3600;
              operation.push(raw_data_operation_list[key2][dy] / 3600);
              total_operation = total_operation + raw_data_operation_list[key2][dy];
            } else {
              if (raw_data_operation_list[key2][dy]) {
                op = raw_data_operation_list[key2][dy] / 3600;
                operation.push(raw_data_operation_list[key2][dy] / 3600);
              } else {
                operation.push(null);
              }
            }
          } else {
            if (key2 != '4-C1') {
              operation.push(0);
              raw_data_operation_list[key2][dy] = 0;
            } else {
              operation.push(null);
              raw_data_operation_list[key2][dy] = null;
            }
          }

          if (dy in raw_data_downtime_list[key2]) {
            if (key2 != '4-C1') {
              dt = raw_data_downtime_list[key2][dy] / 3600;
              downtime.push(raw_data_downtime_list[key2][dy] / 3600);
              total_downtime_o = total_downtime_o + raw_data_downtime_list[key2][dy];
            } else {
              if (raw_data_downtime_list[key2][dy]) {
                dt = raw_data_downtime_list[key2][dy] / 3600;
                downtime.push(raw_data_downtime_list[key2][dy] / 3600);
              } else {
                downtime.push(null);
              }
            }
          } else {
            if (key2 != '4-C1') {
              downtime.push(0);
              raw_data_downtime_list[key2][dy] = 0;
            } else {
              downtime.push(null);
              raw_data_downtime_list[key2][dy] = null;
            }
          }
        });


        day_list.forEach(function(dy) {
          if (dy in raw_data_operation_list[key2]) {
            if ((raw_data_downtime_list[key2][dy] + raw_data_operation_list[key2][dy]) == 0) {
              if (key2 == '4-C1') {
                if (raw_data_downtime_list[key2][dy] && raw_data_operation_list[key2][dy]) {

                  operation_rate.push(0);
                } else {
                  operation_rate.push(null);
                }
              } else {
                operation_rate.push(0);
              }
            } else {
              operation_rate.push(raw_data_operation_list[key2][dy] / (raw_data_downtime_list[key2][dy] + raw_data_operation_list[key2][dy]) * 100);
            }
          }
        });
        displayData['y_axis_operation_max_label'] = Math.ceil(y_axis_operation_max_label);
        displayData['y_axis_downtime_max_label'] = Math.ceil(y_axis_downtime_max_label);
        displayData['y_axis_operation_rate_max_label'] = Math.ceil(y_axis_operation_rate_max_label);

        displayData[key2].operation = operation;
        displayData[key2].downtime = downtime;
        displayData[key2].operation_rate = operation_rate;
        displayData['circle_value'] = [total_operation, (total_operation / (total_operation + total_downtime_o)), total_downtime_o, (total_downtime_o / (total_operation + total_downtime_o)), total_operation / (total_operation + total_downtime_o) * 100, total_downtime_o / (total_operation + total_downtime_o) * 100];
        displayData['start_time'] = start_time;
        displayData['end_time'] = end_date_to_send;
        displayData['x_axis_label'] = x_axis_label;
        displayData['duration'] = "week";
      });
      data_to_send = { 'displayData': displayData };
      res.send(data_to_send);
    }, function (err) {
      console.log(err);
    });
  });
}

/**
  * Calculates and returns data for year charts.
  * @param {array} machine_list The first number.
  * @param {string} for_date starting date.
  * @param {string} custom_end_time ending date.
  * @param {string} tab_type custome or year.
  * @param {string} database_name database to use.
  * @param {object} res server responce object.
*/
function yearfun(machine_list, for_date, custom_end_time, tab_type, 
    database_name, res) {
  let displayData = {};
  displayData['labels'] = [];
  displayData['reportData'] = [];

  let y_axis_operation_max_label = 744;
  let y_axis_downtime_max_label = 744;
  let y_axis_operation_rate_max_label = 100;
  let duration_to_send = 'month';
  let from_date;
  let to_date;

  if (tab_type === 'custom') {
    from_date = moment(for_date);
    to_date = moment(custom_end_time);
  } else {
    from_date = moment(for_date.startOf('year'));
    to_date = moment(for_date.endOf('year'));
  }
  let total_operation = 0;
  let total_downtime_o = 0;
  // variable for starting and ending time for which data of day is requested
  let start_hr_min;
  let end_hr_min;
  // varible to store starting and ending datetime
  let start_time;
  let end_time;
  let end_date_to_send;

  // query to fetch starting and ending time
  query = 'select * from web_app_parameters where variable in ("start_hr_min", "end_hr_min")';
  // fetching starting and ending time from mysql
  let yearPromise = fetchingData(query);
  yearPromise.then(function(results) {
    results.forEach(function(result) {
      if (result.variable === 'start_hr_min') {
        start_hr_min = moment(result.value, 'HH:mm:ss');
      } else {
        end_hr_min = moment(result.value, 'HH:mm:ss');
      }
    });

    start_time = moment((from_date.format('Y-MM-DD') + ' ' + start_hr_min.format('HH:mm:ss')));
    if (start_hr_min < end_hr_min) {
      end_date_to_send = moment(to_date.format('Y-MM-DD') + ' ' + end_hr_min.format('HH:mm:ss'));
      end_time = moment(to_date.format('Y-MM-DD') + ' ' + end_hr_min.format('HH:mm:ss'));
    } else {
      end_date_to_send = moment(moment(to_date.format('Y-MM-DD')).add(1, 'day').format('Y-MM-DD') + ' ' + end_hr_min.format('HH:mm:ss'));
      end_time = moment(moment(to_date.format('Y-MM-DD')).add(1, 'day').format('Y-MM-DD') + ' ' + end_hr_min.format('HH:mm:ss'));
    }

    // generating month list
    let flag = moment(from_date);

    let month_list = [];

    let flag_timestamp = moment(from_date);
    while (flag_timestamp < to_date) {
      month_list.push(moment(flag_timestamp.format('Y-MM-01')).month() + 1);
      flag_timestamp.add(1, 'month');
    }
    let start = moment(from_date.format('Y-MM-DD'), 'Y-MM-DD');
    let end = moment(to_date.format('Y-MM-DD'), 'Y-MM-DD');
    if (end > moment()) {
      end = moment();
    }
    let range = moment.range(start, end);
    let six_month_list_for_query = Array.from(range.by('day'));
    six_month_list_for_query = six_month_list_for_query.map(m => m.format('Y-MM-DD HH:mm:ss'));

    let six_month_objs = [];
    six_month_list_for_query.forEach(function(day_value) {
      six_month_objs.push({
        'machine_list': machine_list,
        'input_date': moment(day_value),
        'duration': duration_to_send,
        'database_name': database_name,
      });
    });
    let operation_list_to_send = {};
    let downtime_list_to_send = {};
    machine_list.forEach(function(machine) {
      operation_list_to_send[machine] = {};
      downtime_list_to_send[machine] = {};
      month_list.forEach(function(month) {
        operation_list_to_send[machine][month] = 0;
        downtime_list_to_send[machine][month] = 0;
      });
    });
    flag = moment(start_time);
    let x_axis_label = [];
    let total_time = {};

    while (flag < end_time) {
      label = moment(flag).format('MM');
      x_axis_label.push(label);
      total_time[flag.format('M').toString()] = 0;
      flag.add(1, 'month');
    }
    displayData = {};
    displayData['machine_list'] = machine_list;
    machine_list.forEach(function(machine) {
      displayData[machine] = {};
      displayData[machine]['operation'] = [];
      displayData[machine]['downtime'] = [];
      displayData[machine]['operation_rate'] = [];
    });

    x_days(six_month_objs).then((results) => {
      results.forEach(function(instance) {
        machine_list.forEach(function(machine) {
          operation_list_to_send[machine][instance['duration_counter']] = operation_list_to_send[machine][instance['duration_counter']] + instance['operation_time'][machine];
          downtime_list_to_send[machine][instance['duration_counter']] = downtime_list_to_send[machine][instance['duration_counter']] + instance['down_time'][machine];
        });
      });

      let raw_data_operation_list = operation_list_to_send;
      let raw_data_downtime_list = downtime_list_to_send;
      let keys = Object.keys(raw_data_operation_list);
      keys.forEach(function(key2) {
        let operation = [];
        let downtime = [];
        let operation_rate = [];
        month_list.forEach(function(mo) {
          if (mo in raw_data_operation_list[key2]) {
            if (key2 != '4-C1') {
              op = raw_data_operation_list[key2][mo] / (3600);
              operation.push(raw_data_operation_list[key2][mo] / (3600));
              total_operation = total_operation + raw_data_operation_list[key2][mo];
            } else {
              if (raw_data_operation_list[key2][mo]) {
                op = raw_data_operation_list[key2][mo] / (3600);
                operation.push(raw_data_operation_list[key2][mo] / (3600));
              } else {
                operation.push(null);
              }
            }
          } else {
            if (key2 != '4-C1') {
              operation.push(0);
              raw_data_operation_list[key2][mo] = 0;
              raw_data_operation_list[key2][mo] = null;
            } else {
              operation.push(null);
            }
          }

          if (mo in raw_data_downtime_list[key2]) {
            if (key2 != '4-C1') {
              dt = raw_data_downtime_list[key2][mo] / (3600);
              downtime.push(raw_data_downtime_list[key2][mo] / (3600));
              total_downtime_o = total_downtime_o + raw_data_downtime_list[key2][mo];
            } else {
              if (raw_data_downtime_list[key2][mo]) {
                dt = raw_data_downtime_list[key2][mo] / (3600);
                downtime.push(raw_data_downtime_list[key2][mo] / (3600));
              } else {
                downtime.push(null);
              }
            }
          } else {
            if (key2 != '4-C1') {
              downtime.push(0);
              raw_data_downtime_list[key2][mo] = 0;
            } else {
              downtime.push(null);
              raw_data_downtime_list[key2][mo] = null;
            }
          }
        });

        month_list.forEach(function(mo) {
          if (mo in raw_data_operation_list[key2]) {
            if ((raw_data_downtime_list[key2][mo] + raw_data_operation_list[key2][mo]) == 0) {
              if (key2 == '4-C1') {
                if (raw_data_downtime_list[key2][mo] && raw_data_operation_list[key2][mo]) {
                  operation_rate.push(0);
                } else {
                  operation_rate.push(null);
                }
              } else {
                operation_rate.push(0);
              }
            } else {
              operation_rate.push(raw_data_operation_list[key2][mo] / (raw_data_downtime_list[key2][mo] + raw_data_operation_list[key2][mo]) * 100);
            }
          }
        });
        displayData['y_axis_operation_max_label'] = Math.ceil(y_axis_operation_max_label);
        displayData['y_axis_downtime_max_label'] = Math.ceil(y_axis_downtime_max_label);
        displayData['y_axis_operation_rate_max_label'] = Math.ceil(y_axis_operation_rate_max_label);
        displayData[key2].operation = operation;
        displayData[key2].downtime = downtime;
        displayData[key2].operation_rate = operation_rate;
        displayData['circle_value'] = [total_operation, total_operation / (total_operation + total_downtime_o), total_downtime_o, total_downtime_o / (total_operation + total_downtime_o), total_operation / (total_operation + total_downtime_o) * 100, total_downtime_o / (total_operation + total_downtime_o) * 100];
        displayData['start_time'] = start_time;
        displayData['end_time'] = end_date_to_send;
        displayData['x_axis_label'] = x_axis_label;
        displayData['duration'] = 'year';
      });

      data_to_send = {'displayData': displayData};
      res.send(data_to_send);
    }, function(err) {
      console.log(err);
    });
  });
}

/**
  * Calculates and returns data for sixmonth charts.
  * @param {array} machine_list The first number.
  * @param {string} for_date starting date.
  * @param {string} database_name database to use.
  * @param {object} res server responce object.
*/
function sixmonthfun(machine_list, for_date, database_name, res) {
  let displayData = {};
  displayData['labels'] = [];
  displayData['reportData'] = [];
  let y_axis_operation_max_label = 744;
  let y_axis_downtime_max_label = 744;
  let y_axis_operation_rate_max_label = 100;

  let duration_to_send = 'month';
  let from_date;
  let to_date;

  from_date = moment(moment(for_date).startOf('month').format('Y-MM-DD HH:mm:ss'), 'Y-MM-DD HH:mm:ss');
  to_date = moment(from_date).add(6, 'month').subtract(1, 'day');

  let total_operation = 0;
  let total_downtime_o = 0;
  // variable for starting and ending time for which data of day is requested
  let start_hr_min;
  let end_hr_min;
  // varible to store starting and ending datetime
  let start_time;
  let end_time;
  let end_date_to_send;
  query = 'select * from web_app_parameters where variable in ("start_hr_min", "end_hr_min")';
  // fetching starting and ending time from mysql
  let yearPromise = fetchingData(query);
  yearPromise.then(function(results) {
    results.forEach(function(result) {
      if (result.variable === 'start_hr_min') {
        start_hr_min = moment(result.value, 'HH:mm:ss');
      } else {
        end_hr_min = moment(result.value, 'HH:mm:ss');
      }
    });
    start_time = moment((from_date.format('Y-MM-DD') + ' ' + start_hr_min.format('HH:mm:ss')));
    if (start_hr_min < end_hr_min) {
      end_date_to_send = moment(to_date.format('Y-MM-DD') + ' ' + end_hr_min.format('HH:mm:ss'));
      end_time = moment(to_date.format('Y-MM-DD') + ' ' + end_hr_min.format('HH:mm:ss'));
    } else {
      end_date_to_send = moment(moment(to_date.format('Y-MM-DD')).add(1, 'day').format('Y-MM-DD') + ' ' + end_hr_min.format('HH:mm:ss'));
      end_time = moment(moment(to_date.format('Y-MM-DD')).add(1, 'day').format('Y-MM-DD') + ' ' + end_hr_min.format('HH:mm:ss'));
    }
    let flag = moment(from_date);
    let month_list = [];
    let flag_timestamp = moment(from_date);
    while (flag_timestamp < to_date) {
      month_list.push(moment(flag_timestamp.format('Y-MM-01')).month() + 1);
      flag_timestamp.add(1, 'month');
    }
    let start = moment(from_date.format('Y-MM-DD'), 'Y-MM-DD');
    let end = moment(to_date.format('Y-MM-DD'), 'Y-MM-DD');

    if (end > moment()) {
      end = moment();
    }

    let range = moment.range(start, end);
    let six_month_list_for_query = Array.from(range.by('day'));
    six_month_list_for_query = six_month_list_for_query.map(m => m.format('Y-MM-DD HH:mm:ss'));

    let six_month_objs = [];
    six_month_list_for_query.forEach(function(day_value) {
      six_month_objs.push({
        'machine_list': machine_list,
        'input_date': moment(day_value),
        'duration': duration_to_send,
        'database_name': database_name,
      });
    });
    let operation_list_to_send = {};
    let downtime_list_to_send = {};
    machine_list.forEach(function(machine) {
      operation_list_to_send[machine] = {};
      downtime_list_to_send[machine] = {};
      month_list.forEach(function(month) {
        operation_list_to_send[machine][month] = 0;
        downtime_list_to_send[machine][month] = 0;
      });
    });
    flag = moment(start_time);
    let x_axis_label = [];
    let total_time = {};

    while (flag < end_time) {
      label = moment(flag).format('MM');
      x_axis_label.push(label);
      total_time[flag.format('M').toString()] = 0;
      flag.add(1, 'month');
    }
    displayData = {};
    displayData['machine_list'] = machine_list;
    machine_list.forEach(function(machine) {
      displayData[machine] = {};
      displayData[machine]['operation'] = [];
      displayData[machine]['downtime'] = [];
      displayData[machine]['operation_rate'] = [];
    });
    x_days(six_month_objs).then((results) => {
      results.forEach(function(instance) {
        machine_list.forEach(function(machine) {
          operation_list_to_send[machine][instance['duration_counter']] = operation_list_to_send[machine][instance['duration_counter']] + instance['operation_time'][machine];
          downtime_list_to_send[machine][instance['duration_counter']] = downtime_list_to_send[machine][instance['duration_counter']] + instance['down_time'][machine];
        });
      });
      let raw_data_operation_list = operation_list_to_send;
      let raw_data_downtime_list = downtime_list_to_send;
      let keys = Object.keys(raw_data_operation_list);
      keys.forEach(function(key2) {
        let operation = [];
        let downtime = [];
        let operation_rate = [];
        month_list.forEach(function(mo) {
          if (mo in raw_data_operation_list[key2]) {
            if (key2 != '4-C1') {
              op = raw_data_operation_list[key2][mo] / (3600);
              operation.push(raw_data_operation_list[key2][mo] / (3600));
              total_operation = total_operation + raw_data_operation_list[key2][mo];
            } else {
              if (raw_data_operation_list[key2][mo]) {
                op = raw_data_operation_list[key2][mo] / (3600);
                operation.push(raw_data_operation_list[key2][mo] / (3600));
              } else {
                operation.push(null);
              }
            }
          } else {
            if (key2 != '4-C1') {
              operation.push(0);
              raw_data_operation_list[key2][mo] = 0;
            } else {
              operation.push(null);
              raw_data_operation_list[key2][mo] = null;
            }
          }
          if (mo in raw_data_downtime_list[key2]) {
            if (key2 != '4-C1') {
              dt = raw_data_downtime_list[key2][mo] / (3600);
              downtime.push(raw_data_downtime_list[key2][mo] / (3600));
              total_downtime_o = total_downtime_o + raw_data_downtime_list[key2][mo];
            } else {
              if (raw_data_downtime_list[key2][mo]) {
                dt = raw_data_downtime_list[key2][mo] / (3600);
                downtime.push(raw_data_downtime_list[key2][mo] / (3600));
              } else {
                downtime.push(null);
              }
            }
          } else {
            if (key2 != '4-C1') {
              downtime.push(0);
              raw_data_downtime_list[key2][mo] = 0;
            } else {
              downtime.push(null);
              raw_data_downtime_list[key2][mo] = null;
            }
          }
        });
        month_list.forEach(function(mo) {
          if (mo in raw_data_operation_list[key2]) {
            if ((raw_data_downtime_list[key2][mo] + raw_data_operation_list[key2][mo]) == 0) {
              if (key2 == '4-C1') {
                if (raw_data_downtime_list[key2][mo] && raw_data_operation_list[key2][mo]) {
                  operation_rate.push(0);
                } else {
                  operation_rate.push(null);
                }
              } else {
                operation_rate.push(0);
              }
            } else {
              operation_rate.push(raw_data_operation_list[key2][mo] / (raw_data_downtime_list[key2][mo] + raw_data_operation_list[key2][mo]) * 100);
            }
          }
        });
        displayData['y_axis_operation_max_label'] = Math.ceil(y_axis_operation_max_label);
        displayData['y_axis_downtime_max_label'] = Math.ceil(y_axis_downtime_max_label);
        displayData['y_axis_operation_rate_max_label'] = Math.ceil(y_axis_operation_rate_max_label);
        displayData[key2].operation = operation;
        displayData[key2].downtime = downtime;
        displayData[key2].operation_rate = operation_rate;
        displayData['circle_value'] = [total_operation, total_operation / (total_operation + total_downtime_o), total_downtime_o, total_downtime_o / (total_operation + total_downtime_o), total_operation / (total_operation + total_downtime_o) * 100, total_downtime_o / (total_operation + total_downtime_o) * 100];
        displayData['start_time'] = start_time;
        displayData['end_time'] = end_date_to_send;
        displayData['x_axis_label'] = x_axis_label;
        displayData['duration'] = 'year';
      });
      data_to_send = {'displayData': displayData};
      res.send(data_to_send);
    }, function(err) {
      console.log(err);
    });
  });
}

/**
  * Calculates and returns data for day charts.
  * @param {array} machine_list The first number.
  * @param {string} for_date starting date.
  * @param {string} database_name database to use.
  * @param {object} res server responce object.
*/
function dayfun(machine_list, for_date, database_name, res) {
  let displayData = {};
  displayData['labels'] = [];
  displayData['reportData'] = [];
  let duration = 'day';
  let y_axis_operation_max_label = 60;
  let y_axis_downtime_max_label = 60;
  let y_axis_operation_rate_max_label = 100;
  let sql_machine_list = '';
  let total_operation = 0;
  let total_downtime_o = 0;
  let start_hr_min;
  let end_hr_min;
  let start_time;
  let end_time;
  let end_date_to_send;
  query = 'select * from web_app_parameters where variable in ("start_hr_min", "end_hr_min")';
  let dayPromise = fetchingData(query);
  dayPromise.then(function(results) {
    results.forEach(function(result) {
      if (result.variable === 'start_hr_min') {
        start_hr_min = moment(result.value, 'HH:mm:ss');
      } else {
        end_hr_min = moment(result.value, 'HH:mm:ss');
      }
    });
    start_time = moment((for_date.format('Y-MM-DD') + ' ' + start_hr_min.format('HH:mm:ss')));
    end_time = moment((for_date.format('Y-MM-DD') + ' ' + end_hr_min.format('HH:mm:ss')));
    end_date_to_send = moment((for_date.format('Y-MM-DD') + ' ' + end_hr_min.format('HH:mm:ss')));
    if (start_time >= end_time) {
      end_time = moment(end_time.add(1, 'day'));
      end_date_to_send = moment(end_date_to_send.add(1, 'day'));
    }

    machine_list.forEach(function(machine) {
      sql_machine_list = sql_machine_list + '\'' + machine + '\',';
    });
    sql_machine_list = sql_machine_list.substring(0, sql_machine_list.length - 1);
    flag = moment(start_time.format('Y-MM-DD HH:00:00'));
    prev_flag = moment(start_time);
    start_flag = moment(start_time);
    x_axis_label = [];
    total_time = {};
    hour_list = [];
    minutes_list = [];
    let group_start_label = [];
    let group_end_label = [];
    let diffTime = 0;
    let sub_duration = 'one_hour';
    while (flag < end_time) {
      label = moment(flag).format('HH:mm');
      diffTime = end_time.diff(start_flag, 'minutes', true);
      if (diffTime <= 60) {
        sub_duration = 'one_hour';
        let addingCount = diffTime / 10;
        let addingLabel;
        let calTime;
        for (let i = 0; i < 10; i++) {
          calTime = moment(start_time).add(i * addingCount, 'minutes');
          addingLabel = moment(calTime).format('HH:mm');
          x_axis_label.push(addingLabel);
          minutes_list.push(calTime.minutes());
          group_start_label.push(moment(calTime));
          flag = moment(end_time);
        }
        for (let i = 1; i < 10; i++) {
          group_end_label.push(group_start_label[i]);
        }
        group_end_label.push(moment(end_time));
      } else {
        sub_duration = 'multiple_hour';
        x_axis_label.push(label);
        hour_list.push(flag.date() + '' + flag.hours());
        flag.add(1, 'hours');
      }
      if (flag < end_time) {
        total_time[flag.date() + '' + flag.hours()] = flag.diff(prev_flag, 'minutes', true);
      } else {
        total_time[prev_flag.date() + '' + prev_flag.hours()] = end_time.diff(prev_flag, 'minutes', true);
      }
      prev_flag = moment(flag);
    }
    let raw_data_operation_list = {};
    displayData = {};
    displayData['machine_list'] = machine_list;
    machine_list.forEach(function(machine) {
      displayData[machine] = {};
      displayData[machine]['operation'] = [];
      displayData[machine]['downtime'] = [];
      displayData[machine]['operation_rate'] = [];
    });
    machine_list.forEach(function(machine) {
      raw_data_operation_list[machine] = {};
    });
    let o2 = {
      'machine_list': machine_list,
      'input_date': start_time,
      'duration': duration,
      'sub_duration': sub_duration,
      'group_start_label': group_start_label,
      'group_end_label': group_end_label,
      'minutes_list': minutes_list,
      'database_name': database_name,
    };
    single_day(o2).then((results) => {
      let raw_data_operation_list = results.operation_time;
      let raw_data_downtime_list = results.down_time;
      if (sub_duration == 'one_hour') {
        let keys = Object.keys(raw_data_operation_list);
        keys.forEach(function(key2) {
          let operation = [];
          let downtime = [];
          let operation_rate = [];
          minutes_list.forEach(function(hr) {
            if (hr in raw_data_operation_list[key2]) {
              op = raw_data_operation_list[key2][hr] / 60;
              operation.push(raw_data_operation_list[key2][hr] / 60);
              if (key2 != '4-C1') {
                total_operation = total_operation + raw_data_operation_list[key2][hr];
              }
            } else {
              if (key2 != '4-C1') {
                operation.push(0);
                raw_data_operation_list[key2][hr] = 0;
              } else {
                operation.push(null);
                raw_data_operation_list[key2][hr] = null;
              }
            }
            if (hr in raw_data_downtime_list[key2]) {
              dt = raw_data_downtime_list[key2][hr] / 60;
              downtime.push(raw_data_downtime_list[key2][hr] / 60);
              if (key2 != '4-C1') {
                total_downtime_o = total_downtime_o + raw_data_downtime_list[key2][hr];
              }
            } else {
              if (key2 != '4-C1') {
                downtime.push(0);
                raw_data_downtime_list[key2][hr] = 0;
              } else {
                downtime.push(null);
                raw_data_downtime_list[key2][hr] = null;
              }
            }
          });
          minutes_list.forEach(function(hr) {
            if (hr in raw_data_operation_list[key2]) {
              if ((raw_data_downtime_list[key2][hr] + raw_data_operation_list[key2][hr]) == 0) {
                if (key2 == '4-C1') {
                  if (raw_data_downtime_list[key2][hr] && raw_data_operation_list[key2][hr]) {
                    operation_rate.push(0);
                  } else {
                    operation_rate.push(null);
                  }
                } else {
                  operation_rate.push(0);
                }
              } else {
                operation_rate.push(raw_data_operation_list[key2][hr] / (raw_data_downtime_list[key2][hr] + raw_data_operation_list[key2][hr]) * 100);
              }
            }
          });
          y_axis_operation_max_label = 6;
          y_axis_downtime_max_label = 6;
          displayData['y_axis_operation_max_label'] = Math.ceil(y_axis_operation_max_label);
          displayData['y_axis_downtime_max_label'] = Math.ceil(y_axis_downtime_max_label);
          displayData['y_axis_operation_rate_max_label'] = Math.ceil(y_axis_operation_rate_max_label);
          displayData[key2].operation = operation;
          displayData[key2].downtime = downtime;
          displayData[key2].operation_rate = operation_rate;
          displayData['circle_value'] = [total_operation, total_operation / (total_operation + total_downtime_o), total_downtime_o, total_downtime_o / (total_operation + total_downtime_o), total_operation / (total_operation + total_downtime_o) * 100, total_downtime_o / (total_operation + total_downtime_o) * 100];
          displayData['start_time'] = results.start_time;
          displayData['end_time'] = results.end_date_to_send;
          displayData['x_axis_label'] = x_axis_label;
          displayData['duration'] = 'day';
        });
      } else {
        let keys = Object.keys(raw_data_operation_list);
        keys.forEach(function(key2) {
          let operation = [];
          let downtime = [];
          let operation_rate = [];
          hour_list.forEach(function(hr) {
            if (hr in raw_data_operation_list[key2]) {
              op = raw_data_operation_list[key2][hr] / 60;
              operation.push(raw_data_operation_list[key2][hr] / 60);
              if (key2 != '4-C1') {
                total_operation = total_operation + raw_data_operation_list[key2][hr];
              }
            } else {
              if (key2 != '4-C1') {
                operation.push(0);
                raw_data_operation_list[key2][hr] = 0;
              } else {
                operation.push(null);
                raw_data_operation_list[key2][hr] = null;
              }
            }

            if (hr in raw_data_downtime_list[key2]) {
              dt = raw_data_downtime_list[key2][hr] / 60;
              downtime.push(raw_data_downtime_list[key2][hr] / 60);
              if (key2 != '4-C1') {
                total_downtime_o = total_downtime_o + raw_data_downtime_list[key2][hr];
              }
            } else {
              if (key2 != '4-C1') {
                downtime.push(0);
                raw_data_downtime_list[key2][hr] = 0;
              } else {
                downtime.push(null);
                raw_data_downtime_list[key2][hr] = null;
              }
            }
          });
          hour_list.forEach(function(hr) {
            if (hr in raw_data_operation_list[key2]) {
              if ((raw_data_downtime_list[key2][hr] + raw_data_operation_list[key2][hr]) === 0) {
                if (key2 == '4-C1') {
                  if (raw_data_downtime_list[key2][hr] && raw_data_operation_list[key2][hr]) {
                    operation_rate.push(0);
                  } else {
                    operation_rate.push(null);
                  }
                } else {
                  operation_rate.push(0);
                }
              } else {
                operation_rate.push(raw_data_operation_list[key2][hr] / (raw_data_downtime_list[key2][hr] + raw_data_operation_list[key2][hr]) * 100);
              }
            }
          });
          displayData['y_axis_operation_max_label'] = Math.ceil(y_axis_operation_max_label);
          displayData['y_axis_downtime_max_label'] = Math.ceil(y_axis_downtime_max_label);
          displayData['y_axis_operation_rate_max_label'] = Math.ceil(y_axis_operation_rate_max_label);
          displayData[key2].operation = operation;
          displayData[key2].downtime = downtime;
          displayData[key2].operation_rate = operation_rate;
          displayData['circle_value'] = [total_operation, total_operation / (total_operation + total_downtime_o), total_downtime_o, total_downtime_o / (total_operation + total_downtime_o), total_operation / (total_operation + total_downtime_o) * 100, total_downtime_o / (total_operation + total_downtime_o) * 100];
          displayData['start_time'] = results.start_time;
          displayData['end_time'] = results.end_date_to_send;
          displayData['x_axis_label'] = x_axis_label;
          displayData['duration'] = 'day';
        });
      }
      data_to_send = {'displayData': displayData};
      res.send(data_to_send);
    }, function(err) {
      console.log(err);
    });
  });
}
/**
  * Calculates and returns data for today charts.
  * @param {array} machine_list The first number
  * @param {string} database_name database to use.
  * @param {object} res server responce object.
*/
function todayfun(machine_list, database_name, res) {
  let displayData = {};
  displayData['labels'] = [];
  displayData['reportData'] = [];
  let duration = 'day';
  let y_axis_operation_max_label = 60;
  let y_axis_downtime_max_label = 60;
  let y_axis_operation_rate_max_label = 100;
  let sql_machine_list = '';
  let total_operation = 0;
  let total_downtime_o = 0;
  let start_hr_min;
  let end_hr_min;
  let start_time;
  let end_time;
  let end_date_to_send;

  // fetching time setting
  query = 'select * from web_app_parameters where variable in ("start_hr_min", "end_hr_min")';
  let todayPromise = fetchingData(query);
  todayPromise.then(function(results) {
    results.forEach(function(result) {
      if (result.variable === 'start_hr_min') {
        start_hr_min = moment(result.value, 'HH:mm:ss');
      } else {
        end_hr_min = moment(result.value, 'HH:mm:ss');
      }
    });
    end_date_to_send = moment(end_hr_min);
    start_time = moment(start_hr_min);
    end_time = moment(end_hr_min);

    if (start_hr_min >= end_hr_min) {
      end_time = moment(end_date_to_send).add(1, 'day');
      end_date_to_send = moment(end_date_to_send).add(1, 'day');
    }

    machine_list.forEach(function(machine) {
      sql_machine_list = sql_machine_list + '\'' + machine + '\',';
    });
    sql_machine_list = sql_machine_list.substring(0, sql_machine_list.length - 1);
    flag = moment(start_time.format('Y-MM-DD HH:00:00'));
    prev_flag = moment(start_time);
    start_flag = moment(start_time);
    x_axis_label = [];
    total_time = {};
    hour_list = [];
    minutes_list = [];
    let group_start_label = [];
    let group_end_label = [];
    let diffTime = 0;
    let sub_duration = 'one_hour';
    while (flag < end_time) {
      label = moment(flag).format('HH:mm');
      diffTime = end_time.diff(start_flag, 'minutes', true);
      if (diffTime <= 60) {
        sub_duration = 'one_hour';
        let addingCount = diffTime / 10;
        let addingLabel;
        let calTime;
        for (let i = 0; i < 10; i++) {
          calTime = moment(start_time).add(i * addingCount, 'minutes');
          addingLabel = moment(calTime).format('HH:mm');
          x_axis_label.push(addingLabel);
          minutes_list.push(calTime.minutes());
          group_start_label.push(moment(calTime));
          flag = moment(end_time);
        }
        for (let i = 1; i < 10; i++) {
          group_end_label.push(group_start_label[i]);
        }
        group_end_label.push(moment(end_time));
      } else {
        sub_duration = 'multiple_hour';
        x_axis_label.push(label);
        hour_list.push(flag.date() + '' + flag.hours());
        flag.add(1, 'hours');
      }
      if (flag < end_time) {
        total_time[flag.date() + '' + flag.hours()] = flag.diff(prev_flag, 'minutes', true);
      } else {
        total_time[prev_flag.date() + '' + prev_flag.hours()] = end_time.diff(prev_flag, 'minutes', true);
      }
      prev_flag = moment(flag);
    }
    let raw_data_operation_list = {};
    displayData = {};
    displayData['machine_list'] = machine_list;
    machine_list.forEach(function(machine) {
      displayData[machine] = {};
      displayData[machine]['operation'] = [];
      displayData[machine]['downtime'] = [];
      displayData[machine]['operation_rate'] = [];
      raw_data_operation_list[machine] = {};
    });
    let o2 = {
      'machine_list': machine_list,
      'input_date': start_time,
      'duration': duration,
      'sub_duration': sub_duration,
      'group_start_label': group_start_label,
      'group_end_label': group_end_label,
      'minutes_list': minutes_list,
      'database_name': database_name,
    };
    single_day(o2).then((results) => {
      let raw_data_operation_list = results.operation_time;
      let raw_data_downtime_list = results.down_time;
      if (sub_duration == 'one_hour') {
        let keys = Object.keys(raw_data_operation_list);
        keys.forEach(function(key2) {
          let operation = [];
          let downtime = [];
          let operation_rate = [];
          minutes_list.forEach(function(hr) {
            if (hr in raw_data_operation_list[key2]) {
              op = raw_data_operation_list[key2][hr] / 60;
              operation.push(raw_data_operation_list[key2][hr] / 60);
              if (key2 != '4-C1') {
                total_operation = total_operation + raw_data_operation_list[key2][hr];
              }
            } else {
              if (key2 != '4-C1') {
                operation.push(0);
                raw_data_operation_list[key2][hr] = 0;
              } else {
                operation.push(null);
                raw_data_operation_list[key2][hr] = null;
              }
            }
            if (hr in raw_data_downtime_list[key2]) {
              dt = raw_data_downtime_list[key2][hr] / 60;
              downtime.push(raw_data_downtime_list[key2][hr] / 60);
              if (key2 != '4-C1') {
                total_downtime_o = total_downtime_o + raw_data_downtime_list[key2][hr];
              }
            } else {
              if (key2 != '4-C1') {
                downtime.push(0);
                raw_data_downtime_list[key2][hr] = 0;
              } else {
                downtime.push(null);
                raw_data_downtime_list[key2][hr] = null;
              }
            }
          });
          minutes_list.forEach(function(hr) {
            if (hr in raw_data_operation_list[key2]) {
              if ((raw_data_downtime_list[key2][hr] + raw_data_operation_list[key2][hr]) == 0) {
                if (key2 == '4-C1') {
                  if (raw_data_downtime_list[key2][hr] && raw_data_operation_list[key2][hr]) {
                    operation_rate.push(0);
                  } else {
                    operation_rate.push(null);
                  }
                } else {
                  operation_rate.push(0);
                }
              } else {
                operation_rate.push(raw_data_operation_list[key2][hr] / (raw_data_downtime_list[key2][hr] + raw_data_operation_list[key2][hr]) * 100);
              }
            }
          });
          y_axis_operation_max_label = 6;
          y_axis_downtime_max_label = 6;
          displayData['y_axis_operation_max_label'] = Math.ceil(y_axis_operation_max_label);
          displayData['y_axis_downtime_max_label'] = Math.ceil(y_axis_downtime_max_label);
          displayData['y_axis_operation_rate_max_label'] = Math.ceil(y_axis_operation_rate_max_label);
          displayData[key2].operation = operation;
          displayData[key2].downtime = downtime;
          displayData[key2].operation_rate = operation_rate;
          displayData['circle_value'] = [total_operation, total_operation / (total_operation + total_downtime_o), total_downtime_o, total_downtime_o / (total_operation + total_downtime_o), total_operation / (total_operation + total_downtime_o) * 100, total_downtime_o / (total_operation + total_downtime_o) * 100];
          displayData['start_time'] = results.start_time;
          displayData['end_time'] = results.end_date_to_send;
          displayData['x_axis_label'] = x_axis_label;
          displayData['duration'] = 'day';
        });
      } else {
        let keys = Object.keys(raw_data_operation_list);
        keys.forEach(function(key2) {
          let operation = [];
          let downtime = [];
          let operation_rate = [];
          hour_list.forEach(function(hr) {
            if (hr in raw_data_operation_list[key2]) {
              op = raw_data_operation_list[key2][hr] / 60;
              operation.push(raw_data_operation_list[key2][hr] / 60);
              if (key2 != '4-C1') {
                total_operation = total_operation + raw_data_operation_list[key2][hr];
              }
            } else {
              if (key2 != '4-C1') {
                operation.push(0);
                raw_data_operation_list[key2][hr] = 0;
              } else {
                operation.push(null);
                raw_data_operation_list[key2][hr] = null;
              }
            }
            if (hr in raw_data_downtime_list[key2]) {
              dt = raw_data_downtime_list[key2][hr] / 60;
              downtime.push(raw_data_downtime_list[key2][hr] / 60);
              if (key2 != '4-C1') {
                total_downtime_o = total_downtime_o + raw_data_downtime_list[key2][hr];
              }
            } else {
              if (key2 != '4-C1') {
                downtime.push(0);
                raw_data_downtime_list[key2][hr] = 0;
              } else {
                downtime.push(null);
                raw_data_downtime_list[key2][hr] = null;
              }
            }
          });
          hour_list.forEach(function(hr) {
            if (hr in raw_data_operation_list[key2]) {
              if ((raw_data_downtime_list[key2][hr] + raw_data_operation_list[key2][hr]) == 0) {
                if (key2 == '4-C1') {
                  if (raw_data_downtime_list[key2][hr] && raw_data_operation_list[key2][hr]) {
                    operation_rate.push(0);
                  } else {
                    operation_rate.push(null);
                  }
                } else {
                  operation_rate.push(0);
                }
              } else {
                operation_rate.push(raw_data_operation_list[key2][hr] / (raw_data_downtime_list[key2][hr] + raw_data_operation_list[key2][hr]) * 100);
              }
            }
          });
          displayData['y_axis_operation_max_label'] = Math.ceil(y_axis_operation_max_label);
          displayData['y_axis_downtime_max_label'] = Math.ceil(y_axis_downtime_max_label);
          displayData['y_axis_operation_rate_max_label'] = Math.ceil(y_axis_operation_rate_max_label);
          displayData[key2].operation = operation;
          displayData[key2].downtime = downtime;
          displayData[key2].operation_rate = operation_rate;
          if (total_operation + total_downtime_o != 0) {
            displayData['circle_value'] = [total_operation, total_operation / (total_operation + total_downtime_o), total_downtime_o, total_downtime_o / (total_operation + total_downtime_o), total_operation / (total_operation + total_downtime_o) * 100, total_downtime_o / (total_operation + total_downtime_o) * 100];
          } else {
            displayData['circle_value'] = [total_operation, 0, total_downtime_o, 0, 0, 0];
          }
          displayData['start_time'] = results.start_time;
          displayData['end_time'] = results.end_date_to_send;
          displayData['x_axis_label'] = x_axis_label;
          displayData['duration'] = 'day';
        });
      }
      data_to_send = {'displayData': displayData};
      res.send(data_to_send);
    }, function(err) {
      console.log(err);
    });
  });
}

/**
  * Calculates and returns data for custom charts.
  * @param {array} machine_list The first number.
  * @param {string} start_date The second number.
  * @param {string} end_date The first number.
  * @param {strin} duration The second number.
  * @param {string} database_name database to use.
  * @param {object} res server responce object.
*/
function custom(machine_list, start_date, end_date, duration, database_name, 
    res) {
  // fetching time setting from database
  query = 'select * from web_app_parameters where variable in ("start_hr_min", "end_hr_min")';
  let customPromise = fetchingData(query);
  customPromise.then(function(results) {
    results.forEach(function(result) {
      if (result.variable === 'start_hr_min') {
        start_hr_min = moment(result.value, 'HH:mm:ss');
      } else {
        end_hr_min = moment(result.value, 'HH:mm:ss');
      }
    });

    if (start_hr_min < end_hr_min) {
      start_time = moment((start_date.format('Y-MM-DD') + ' ' + start_hr_min.format('HH:mm:ss')));
      end_time = moment((end_date.format('Y-MM-DD') + ' ' + end_hr_min.format('HH:mm:ss')));
    } else {
      start_time = moment((start_date.format('Y-MM-DD') + ' ' + start_hr_min.format('HH:mm:ss')));
      end_time = moment((moment(end_date).format('Y-MM-DD')) + ' ' + end_hr_min.format('HH:mm:ss'));
    }
    time_diff_day = end_time.diff(start_time, 'day', true);
    time_diff_month = end_time.diff(start_time, 'month', true);
    // if time difference is less than and equal to one day
    if (time_diff_day <= 1) {
      dayfun(machine_list, start_time, database_name, res);
    }
    // if time difference is greater than one day and less than equal to month
    if (time_diff_day > 1 && time_diff_month <= 1) {
      monthfun(machine_list, start_time, end_time, duration, database_name, res);
    }
    // if time difference is greater than month
    if (time_diff_month > 1) {
      yearfun(machine_list, start_time, end_time, duration, database_name, res);
    }
  });
}

// rout accept request from client on http://IP:PORT/outputdata/
router.post('/', function(req, res) {
  let database_name = 'hmmasterdbcs';
  console.log('database_name', database_name);
  let custom_start_date = moment(req.body.custom_start_date, 'Y-MM-DD HH:mm:ss');
  let custom_end_date = moment(req.body.custom_end_date, 'Y-MM-DD HH:mm:ss');
  let duration = req.body.duration;
  let machineList = req.body.machineList;
  // calling today function
  if (duration == 'today') {
    todayfun(machineList, database_name, res);
  };
  // calling day function
  if (duration == 'day') {
    dayfun(machineList, custom_start_date, database_name, res);
  };
  // calling week function
  if (duration == 'week') {
    weekfun(machineList, custom_start_date, database_name, res);
  };
  // calling month function
  if (duration == 'month') {
    monthfun(machineList, custom_start_date, custom_start_date, duration, database_name, res);
  };
  // calling sixMinths function
  if (duration == 'sixMonths') {
    sixmonthfun(machineList, custom_start_date, database_name, res);
  };
  // calling year function
  if (duration == 'year') {
    yearfun(machineList, custom_start_date, custom_start_date, duration, database_name, res);
  };
  // calling custom function
  if (duration == 'custom') {
    custom(machineList, custom_start_date, custom_end_date, 'custom', database_name, res);
  };
});
module.exports = router;
