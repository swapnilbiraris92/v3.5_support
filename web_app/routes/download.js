/* jshint esversion: 9 */
'use strict';
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
let stringify = require('csv-stringify');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let config = require('../config/index');
let Moment = require('moment');
let app = express();
let bodyParser = require('body-parser');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
let mysql = require('mysql');

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

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
  * function to execute SQL query.
  * @param {string} query Query to execute.
  * @return {object} promise to wait untill query executes.
*/
function fetchingData(query) {
  return new Promise(function(resolve, reject) {
    client.query(query, function(error, results) {
      if (error) {
        console.log('error ' + error);
        reject(error);
      } else {
        resolve(results);
      };
    });
  });
}

/**
  * function to convert seconds to hr:mm:ss format.
  * @param {number} num number to pad.
  * @return {string} string in required format.
*/
function pad_for_three(num) {
  return ('00' + num).slice(-3);
}

/**
  * function to format data for CSV and generate CSV.
  * @param {string} for_date starting data of CSV.
  * @param {string} end_date ending data of CSV.
  * @param {string} lan language for CSV.
  * @param {string} display_machine_name Selected machines for CSV.
  * @param {string} database_name database to use.
  * @param {object} res_par responce object.
*/
function csvfun(for_date, end_date, lan, display_machine_name, database_name,
    res_par) {
  let from_date = moment(for_date.format('Y-MM-01') + ' 06:00:00');
  let to_date = moment(moment(end_date).endOf('month').format('Y-MM-DD " 06:00:00"'), 'Y-MM-DD HH:mm:ss').add(1, 'day');
  let end_date_to_fetch_null = moment(moment(end_date).endOf('month').format('Y-MM-DD " 06:00:00"'), 'Y-MM-DD HH:mm:ss').add(1, 'day');
  if (end_date_to_fetch_null > moment()) {
    if (moment().hours() < 6) {
      end_date_to_fetch_null = moment(moment().format('Y-MM-DD 06:00:00'), 'Y-MM-DD HH:mm:ss');
      end_date_to_fetch_null.subtract(1, 'day');
    } else {
      end_date_to_fetch_null = moment(moment().format('Y-MM-DD 06:00:00'), 'Y-MM-DD HH:mm:ss');
    }
  } else {
  }

  let data_to_push = {};

  let query = 'select * from ' + database_name + '.csv_info where \
    date_of_record >= "' + from_date.format('Y-MM-DD') + '" and \
    date_of_record < "' + to_date.format('Y-MM-DD') + '" and \
    (end_time >= "' + from_date.format('Y-MM-DD HH:mm:ss') + '" and \
    start_time < "' + to_date.format('Y-MM-DD HH:mm:ss') + '") or \
    (end_time is NULL and \
    start_time < "' + end_date_to_fetch_null.format('Y-MM-DD HH:mm:ss') + '" \
    and start_time >= "' + from_date.format('Y-MM-DD HH:mm:ss') + '") order by \
    machine_id, date_of_record, start_time';

  fetchingData(query).then((csvPromise) => {
    let csv_data_list = [];
    csvPromise.forEach(function(instance) {
      let downtime_to_print = 0;
      let day_start_time = moment(instance['date_of_record']).format('Y-MM-DD 06:00:00');
      let day_end_time = moment(moment(instance['date_of_record']).format('Y-MM-DD 06:00:00')).add(1, 'day');
      if (instance['last_job_timestamp']) {
      } else {
        instance['last_job_timestamp'] = moment(moment(instance['date_of_record']).format('Y-MM-DD 05:59:59')).add(1, 'day');
      }
      if (moment(instance['end_time']) < moment(day_end_time) || moment(instance['start_time']) >= moment(day_start_time)) {
        if (instance['end_time'] && moment(instance['start_time']) >= moment(day_start_time)) {
          if (lan === 'ja') {
            if (instance['down_time']) {
              downtime_to_print = instance['down_time'];
            } else {
              downtime_to_print = 0;
            }
            data_to_push = {
              'ID': "" + instance['branch_id'] + display_machine_name[instance['machine_id']].replace("-", "") + moment(instance['date_of_record']).format('YMMDD') + pad_for_three(instance['serial_no']),
              '支店': instance['branch_id'],
              '号機': display_machine_name[instance['machine_id']].replace("-", ""),
              '実績日': moment(instance['date_of_record']).format('Y/MM/DD'),
              '表示開始時刻': moment(instance['first_job_time']).format('Y/MM/DD HH:mm:ss'),
              '表示終了時刻': moment(instance['last_job_timestamp']).format('Y/MM/DD HH:mm:ss'),
              '作業順': instance['serial_no'],
              '稼働開始時刻': moment(instance['start_time']).format('Y/MM/DD HH:mm:ss'),
              '稼働完了時刻': moment(instance['end_time']).format('Y/MM/DD HH:mm:ss'),
              '稼働時間': instance['operation_time'],
              '合計加工時間': instance['cut_time'],
              '合計送り時間': instance['feed_time'],
              '停止時間': downtime_to_print,
              '生産数': instance['cut_count'],
            };
            for (let counter = 1; counter < 101; counter++) {
              data_to_push['バーコード ' + counter] = null;
            }
            if (instance['barcode']) {
              let barcode_counter = 1;
              let barcode_arr_wd = instance['barcode'].split(',');

              let barcode_arr = barcode_arr_wd.filter(function(elem, pos) {
                return barcode_arr_wd.indexOf(elem) == pos;
              });

              barcode_arr.forEach(function(barcode_instance) {
                if (barcode_counter < 101) {
                  data_to_push['バーコード ' + barcode_counter] = barcode_instance;
                  barcode_counter += 1;
                }
              });
            } else {
              data_to_push['バーコード ' + 1] = null;
            }
          } else {
            if (instance['down_time']) {
              downtime_to_print = instance['down_time'];
            } else {
              downtime_to_print = 0;
            }
            data_to_push = {
              'ID': "" + instance['branch_id'] + display_machine_name[instance['machine_id']].replace("-", "") + moment(instance['date_of_record']).format('YMMDD') + pad_for_three(instance['serial_no']),
              'Company Branch Number': instance['branch_id'],
              'Machine': display_machine_name[instance['machine_id']].replace("-", ""),
              'Date of a Record': moment(instance['date_of_record']).format('Y/MM/DD'),
              'First Time Stamp of Jobs in a Day': moment(instance['first_job_time']).format('Y/MM/DD HH:mm:ss'),
              'Last Time Stamp of Jobs in a Day': moment(instance['last_job_timestamp']).format('Y/MM/DD HH:mm:ss'),
              'Serial Numer of Jobs in a Day for that Machine': instance['serial_no'],
              'Operation Start Time': moment(instance['start_time']).format('Y/MM/DD HH:mm:ss'),
              'Operation End Time': moment(instance['end_time']).format('Y/MM/DD HH:mm:ss'),
              'Operation Time': instance['operation_time'],
              'Total Cutting Time During Operation': instance['cut_time'],
              'Total Feed Time': instance['feed_time'],
              'Down Time Between this and next Operation': downtime_to_print,
              'Production Number': instance['cut_count'],
            };
            for (let counter = 1; counter < 101; counter++) {
              data_to_push['Bar Code ' + counter] = null;
            }
            if (instance['barcode']) {
              let barcode_counter = 1;
              let barcode_arr_wd = instance['barcode'].split(',');

              let barcode_arr = barcode_arr_wd.filter(function(elem, pos) {
                return barcode_arr_wd.indexOf(elem) == pos;
              });
              barcode_arr.forEach(function(barcode_instance) {
                if (barcode_counter < 101) {
                  data_to_push['Bar Code ' + barcode_counter] = barcode_instance;
                  barcode_counter += 1;
                }
              });
            } else {
              data_to_push['Bar Code ' + 1] = null;
            }
          }
        }
        csv_data_list.push(data_to_push);
      }
    });
    let file_name = '' + from_date.format('YMM') + ' ' + end_date.format('YMM') + '.csv';
    stringify(csv_data_list, {header: true}).pipe(res_par);
    res_par.setHeader('Content-Type', 'text/csv');
    res_par.setHeader('Content-Disposition', file_name);
  });
}

/**
  * function to format data for aggregate CSV and generate aggregate CSV.
  * @param {string} for_date starting data of CSV.
  * @param {string} end_date ending data of CSV.
  * @param {string} lan language for CSV.
  * @param {string} display_machine_name Selected machines for CSV.
  * @param {string} database_name database to use.
  * @param {object} res_par responce object.
*/
function csvfunAggregate(for_date, end_date, lan, display_machine_name,
    database_name, res_par) {
  let from_date = moment(for_date.format('Y-MM-01') + ' 06:00:00');
  let to_date = moment(moment(end_date).endOf('month').format('Y-MM-DD " 06:00:00"'), 'Y-MM-DD HH:mm:ss').add(1, 'day');
  let end_date_to_fetch_null = moment(moment(end_date).endOf('month').format('Y-MM-DD " 06:00:00"'), 'Y-MM-DD HH:mm:ss').add(1, 'day');
  if (end_date_to_fetch_null > moment()) {
    if (moment().hours() < 6) {
      end_date_to_fetch_null = moment(moment().format('Y-MM-DD 06:00:00'), 'Y-MM-DD HH:mm:ss');
      end_date_to_fetch_null.subtract(1, 'day');
    } else {
      end_date_to_fetch_null = moment(moment().format('Y-MM-DD 06:00:00'), 'Y-MM-DD HH:mm:ss');
    }
  } else {
  }

  let data_to_push;

  let query = 'select * from ' + database_name + '.csv_info where \
  date_of_record >= "' + from_date.format('Y-MM-DD') + '" and \
  date_of_record < "' + to_date.format('Y-MM-DD') + '" and \
  (end_time >= "' + from_date.format('Y-MM-DD HH:mm:ss') + '" and \
  start_time < "' + to_date.format('Y-MM-DD HH:mm:ss') + '") or \
  (end_time is NULL and \
  start_time < "' + end_date_to_fetch_null.format('Y-MM-DD HH:mm:ss') + '" \
  and start_time >= "' + from_date.format('Y-MM-DD HH:mm:ss') + '") order by \
  machine_id, date_of_record, start_time';

  let lastTimeStamp;
  let id;
  let dateOfRecord;
  let firstTimeStamp;
  let serialNumber;
  let operationStartTime;
  let operationEndTime;
  let cuttingTime;
  let feedTime;
  let downTime;
  let productinCount;
  let branchID;
  let displayMachineName;
  let instanceBarcode;
  let barcodeFlag;
  let operationTime;
  let csvDataPushFlag = false;
  let firstBarcodes = '';
  let previousMachine = '';


  fetchingData(query).then((csvPromise) => {
    // csv object for creating csv
    let csv_data_list = [];
    csvPromise.forEach(function(instance) {
      instanceBarcode = instance.barcode;
      barcodeFlag = instance.flag;
      displayMachineName = display_machine_name[instance.machine_id].replace('-', '');
      branchID = instance.branch_id;
      operationEndTime = instance.end_time;

      // on machine change or barcode not present or on new barcode scan
      // new record will start.
      if ((previousMachine != displayMachineName) || !instanceBarcode || barcodeFlag) {
        previousMachine = displayMachineName;
        // pushing data in csv object
        if (csvDataPushFlag) {
          let barcodeHeader = 'バーコード ';
          let specificBarcodeHeader = '固定バーコード ';
          if (lan !== 'ja') {
            barcodeHeader = 'Bar Code ';
            specificBarcodeHeader = 'Specific Bar Code ';
          }
          // specific barcode intially null
          for (let counter = 1; counter < 6; counter++) {
            data_to_push[specificBarcodeHeader + counter] = null;
          }
          // normal barcode intially null
          for (let counter = 1; counter < 101; counter++) {
            data_to_push[barcodeHeader + counter] = null;
          }

          // filtering dublicate barcodes and seperation in specific and normal barcodes
          if (firstBarcodes) {
            let barcode_counter = 1;
            let specificBarcodeCounter = 1;
            let barcode_arr_wd = firstBarcodes.split(',');
            let barcode_arr = barcode_arr_wd.filter(function(elem, pos) {
              return barcode_arr_wd.indexOf(elem) == pos;
            });

            // seperating
            barcode_arr.forEach(function(barcode_instance) {
              // specific Barcodes
              if (barcode_instance[0] == '9' && specificBarcodeCounter < 6) {
                data_to_push[specificBarcodeHeader + specificBarcodeCounter
                ] = barcode_instance;
                specificBarcodeCounter += 1;
              }
              // normal Barcodes
              if (barcode_instance[0] != '9' && barcode_counter < 101) {
                data_to_push[barcodeHeader + barcode_counter] = barcode_instance;
                barcode_counter += 1;
              }
            });
          }


          csv_data_list.push(data_to_push);
          csvDataPushFlag = false;
          // assigning barcode value to varible used for record
          firstBarcodes = instanceBarcode;
        }


        firstTimeStamp = instance.first_job_time;
        serialNumber = instance.serial_no;
        operationStartTime = instance.start_time;
        dateOfRecord = instance.date_of_record;
        id = '' + branchID + displayMachineName + moment(dateOfRecord).format('YMMDD') + pad_for_three(serialNumber);

        // last timestamp
        if (instance.last_job_timestamp) {
          lastTimeStamp = instance.last_job_timestamp;
        } else {
          lastTimeStamp = moment(moment(dateOfRecord).format('Y-MM-DD 05:59:59')).add(1, 'day');
        }

        // intializing to zero
        operationTime = 0;
        cuttingTime = 0;
        feedTime = 0;
        downTime = 0;
        productinCount = 0;
      }


      operationTime = operationTime + instance.operation_time;
      cuttingTime = cuttingTime + instance.cut_time;
      feedTime = feedTime + instance.feed_time;
      productinCount = productinCount + instance.cut_count;

      if (instance.down_time) {
        downTime = downTime + instance.down_time;
      }

      let day_start_time = moment(dateOfRecord).format('Y-MM-DD 06:00:00');
      let day_end_time = moment(moment(dateOfRecord).format('Y-MM-DD 06:00:00')).add(1, 'day');

      if (moment(operationEndTime) < moment(day_end_time) || moment(operationStartTime) >= moment(day_start_time)) {
        if (operationEndTime && moment(operationStartTime) >= moment(day_start_time)) {
          if (lan === 'ja') {
            data_to_push = {
              'ID': id,
              '支店': branchID,
              '号機': displayMachineName,
              '実績日': moment(dateOfRecord).format('Y/MM/DD'),
              '表示開始時刻': moment(firstTimeStamp).format('Y/MM/DD HH:mm:ss'),
              '表示終了時刻': moment(lastTimeStamp).format('Y/MM/DD HH:mm:ss'),
              '作業順': serialNumber,
              '稼働開始時刻': moment(operationStartTime).format('Y/MM/DD HH:mm:ss'),
              '稼働完了時刻': moment(operationEndTime).format('Y/MM/DD HH:mm:ss'),
              '稼働時間': operationTime,
              '合計加工時間': cuttingTime,
              '合計送り時間': feedTime,
              '停止時間': downTime,
              '生産数': productinCount,
            };
          } else {
            data_to_push = {
              'ID': id,
              'Company Branch Number': branchID,
              'Machine': displayMachineName,
              'Date of a Record': moment(dateOfRecord).format('Y/MM/DD'),
              'First Time Stamp of Jobs in a Day': moment(firstTimeStamp).format('Y/MM/DD HH:mm:ss'),
              'Last Time Stamp of Jobs in a Day': moment(lastTimeStamp).format('Y/MM/DD HH:mm:ss'),
              'Serial Numer of Jobs in a Day for that Machine': serialNumber,
              'Operation Start Time': moment(operationStartTime).format('Y/MM/DD HH:mm:ss'),
              'Operation End Time': moment(operationEndTime).format('Y/MM/DD HH:mm:ss'),
              'Operation Time': operationTime,
              'Total Cutting Time During Operation': cuttingTime,
              'Total Feed Time': feedTime,
              'Down Time Between this and next Operation': downTime,
              'Production Number': productinCount,
            };
          }
        }
        csvDataPushFlag = true;
      }
    });
    if (csvDataPushFlag) {
      let barcodeHeader = 'バーコード ';
      let specificBarcodeHeader = '固定バーコード ';
      if (lan !== 'ja') {
        barcodeHeader = 'Bar Code ';
        specificBarcodeHeader = 'Specific Bar Code ';
      }
      // specific barcode intially null
      for (let counter = 1; counter < 6; counter++) {
        data_to_push[specificBarcodeHeader + counter] = null;
      }
      // normal barcode intially null
      for (let counter = 1; counter < 101; counter++) {
        data_to_push[barcodeHeader + counter] = null;
      }
      // filtering dublicate barcodes and seperation in specific and normal barcodes
      if (firstBarcodes) {
        let barcode_counter = 1;
        let specificBarcodeCounter = 1;
        let barcode_arr_wd = firstBarcodes.split(',');
        let barcode_arr = barcode_arr_wd.filter(function(elem, pos) {
          return barcode_arr_wd.indexOf(elem) == pos;
        });
        // seperating
        barcode_arr.forEach(function(barcode_instance) {
        // specific Barcodes
          if (barcode_instance[0] == '9' && specificBarcodeCounter < 6) {
            data_to_push[specificBarcodeHeader + specificBarcodeCounter] = barcode_instance;
            specificBarcodeCounter += 1;
          }
          // normal Barcodes
          if (barcode_instance[0] != '9' && barcode_counter < 101) {
            data_to_push[barcodeHeader + barcode_counter] = barcode_instance;
            barcode_counter += 1;
          }
        });
      }
      csv_data_list.push(data_to_push);
    }

    let file_name = '' + from_date.format('YMM') + ' ' + end_date.format('YMM') + '_aggregate.csv';
    stringify(csv_data_list, {header: true}).pipe(res_par);
    res_par.setHeader('Content-Type', 'text/csv');
    res_par.setHeader('Content-Disposition', file_name);
  });
}

router.post('/', function(req, res) {
  let database_name = 'hmmasterdbcs';
  // 7102019 variable to check if request is for csv aggregate or not.
  let isCSVAggregate = req.body.isCSVAggregate;
  console.log('database_name', database_name);
  let csv_start_date = moment(req.body.csv_start_date, 'Y-MM-DD HH:mm:ss');
  let csv_end_date = moment(req.body.csv_end_date, 'Y-MM-DD HH:mm:ss');
  let display_machine_name = {};
  let lan = req.body.lan;
  let query = 'select * from machine_names';
  fetchingData(query).then((machines) => {
    machines.forEach(function(row) {
      display_machine_name[row['machine_id']] = row['machine_name'];
    });

    if (isCSVAggregate) {
      csvfunAggregate(csv_start_date, csv_end_date, lan, display_machine_name, database_name, res);
    } else {
      csvfun(csv_start_date, csv_end_date, lan, display_machine_name, database_name, res);
    }
  }).catch((machinesError) => {
    console.log(machinesError);
    res.send(machinesError);
  });
});
module.exports = router;
