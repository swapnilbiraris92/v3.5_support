/* eslint-disable camelcase */
/* eslint-disable prefer-const */
// Copyright Asquared IoT Pvt. Ltd. 2019
// Asquared IoT Pvt. Ltd. Confidential Information
// Shared with Koninca Minolta Inc on March 08, 2019, under NDA between
// Asqaured IoT and Konica Minolta

let amqp = require('amqplib/callback_api');
let config = require('../../config/index');
let mysql = require('mysql');
let moment = require('moment');

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

global.lsd = [];
global.lsd_cs = [];

lsd['4-01'] = {};
lsd['4-01']['timestamp'] = '2000-01-01 00:00:00';
lsd['4-01']['status_timestamp'] = '2000-01-01 00:00:00';
lsd['4-01']['status'] = 'red';
lsd['4-01']['barcode'] = '';
lsd['4-02'] = {};
lsd['4-02']['timestamp'] = '2000-01-01 00:00:00';
lsd['4-02']['status_timestamp'] = '2000-01-01 00:00:00';
lsd['4-02']['status'] = 'red';
lsd['4-02']['barcode'] = '';
lsd['4-03'] = {};
lsd['4-03']['timestamp'] = '2000-01-01 00:00:00';
lsd['4-03']['status_timestamp'] = '2000-01-01 00:00:00';
lsd['4-03']['status'] = 'red';
lsd['4-03']['barcode'] = '';
lsd['4-05'] = {};
lsd['4-05']['timestamp'] = '2000-01-01 00:00:00';
lsd['4-05']['status_timestamp'] = '2000-01-01 00:00:00';
lsd['4-05']['status'] = 'red';
lsd['4-05']['barcode'] = '';
lsd['4-06'] = {};
lsd['4-06']['timestamp'] = '2000-01-01 00:00:00';
lsd['4-06']['status_timestamp'] = '2000-01-01 00:00:00';
lsd['4-06']['status'] = 'red';
lsd['4-06']['barcode'] = '';
lsd['4-07'] = {};
lsd['4-07']['timestamp'] = '2000-01-01 00:00:00';
lsd['4-07']['status_timestamp'] = '2000-01-01 00:00:00';
lsd['4-07']['status'] = 'red';
lsd['4-07']['barcode'] = '';
lsd['4-09'] = {};
lsd['4-09']['timestamp'] = '2000-01-01 00:00:00';
lsd['4-09']['status_timestamp'] = '2000-01-01 00:00:00';
lsd['4-09']['status'] = 'red';
lsd['4-09']['barcode'] = '';

lsd_cs['4-01'] = {};
lsd_cs['4-01']['timestamp'] = '2000-01-01 00:00:00';
lsd_cs['4-01']['status_timestamp'] = '2000-01-01 00:00:00';
lsd_cs['4-01']['status'] = 'red';
lsd_cs['4-01']['barcode'] = '';
lsd_cs['4-02'] = {};
lsd_cs['4-02']['timestamp'] = '2000-01-01 00:00:00';
lsd_cs['4-02']['status_timestamp'] = '2000-01-01 00:00:00';
lsd_cs['4-02']['status'] = 'red';
lsd_cs['4-02']['barcode'] = '';
lsd_cs['4-03'] = {};
lsd_cs['4-03']['timestamp'] = '2000-01-01 00:00:00';
lsd_cs['4-03']['status_timestamp'] = '2000-01-01 00:00:00';
lsd_cs['4-03']['status'] = 'red';
lsd_cs['4-03']['barcode'] = '';
lsd_cs['4-05'] = {};
lsd_cs['4-05']['timestamp'] = '2000-01-01 00:00:00';
lsd_cs['4-05']['status_timestamp'] = '2000-01-01 00:00:00';
lsd_cs['4-05']['status'] = 'red';
lsd_cs['4-05']['barcode'] = '';
lsd_cs['4-06'] = {};
lsd_cs['4-06']['timestamp'] = '2000-01-01 00:00:00';
lsd_cs['4-06']['status_timestamp'] = '2000-01-01 00:00:00';
lsd_cs['4-06']['status'] = 'red';
lsd_cs['4-06']['barcode'] = '';
lsd_cs['4-07'] = {};
lsd_cs['4-07']['timestamp'] = '2000-01-01 00:00:00';
lsd_cs['4-07']['status_timestamp'] = '2000-01-01 00:00:00';
lsd_cs['4-07']['status'] = 'red';
lsd_cs['4-07']['barcode'] = '';
lsd_cs['4-09'] = {};
lsd_cs['4-09']['timestamp'] = '2000-01-01 00:00:00';
lsd_cs['4-09']['status_timestamp'] = '2000-01-01 00:00:00';
lsd_cs['4-09']['status'] = 'red';
lsd_cs['4-09']['barcode'] = '';

machine_map = {
  'c18718844': '4-01',
  'c18718854': '4-02',
  'c18718842': '4-03',
  'c18718849': '4-05',
  'c18718847': '4-06',
  'c18718843': '4-07',
  'c18718853': '4-09',
};

module.exports = {
  consumer: function() {
    let data_to_store = [];
    let data_to_send = [];
    let hw_stats_data_to_store = [];
    let hw_stats_data_to_send = [];
    amqp.connect('amqp://localhost', function(err, conn) {
      conn.createChannel(function(err, ch) {
        let q = 'data_from_edge';
        ch.assertQueue(q, {durable: false});
        ch.consume(q, function(msg) {
          msg = JSON.parse(msg.content.toString());
          console.log('  Recieve msg: %s', msg)
          try {
            lsd[machine_map[msg['machine_id']]]['barcode'] = msg['barcode_id'];
            lsd_cs[machine_map[msg['machine_id']]]['barcode'] = msg['barcode_id'];
            // sound analytics
            if (msg.prediction == 0) {
              lsd[machine_map[msg['machine_id']]]['machine_id'] = machine_map[msg['machine_id']];
              lsd[machine_map[msg['machine_id']]]['prediction'] = msg['prediction'];
              lsd[machine_map[msg['machine_id']]]['status_timestamp'] = msg['timestamp'];
              if (moment(lsd[machine_map[msg['machine_id']]]['timestamp']) < moment().subtract('10', 'minutes')) {
                lsd[machine_map[msg['machine_id']]]['status'] = 'red';
              } else {
                lsd[machine_map[msg['machine_id']]]['status'] = 'yellow';
              }
            } else {
              lsd[machine_map[msg['machine_id']]]['machine_id'] = machine_map[msg['machine_id']];
              lsd[machine_map[msg['machine_id']]]['timestamp'] = msg['timestamp'];
              lsd[machine_map[msg['machine_id']]]['status_timestamp'] = msg['timestamp'];
              lsd[machine_map[msg['machine_id']]]['prediction'] = msg['prediction'];
              lsd[machine_map[msg['machine_id']]]['status'] = 'green';
            }
            // current sensor
            if (msg.saw_sensor == 0) {
              lsd_cs[machine_map[msg['machine_id']]]['machine_id'] = machine_map[msg['machine_id']];
              lsd_cs[machine_map[msg['machine_id']]]['prediction'] = msg['saw_sensor'];
              lsd_cs[machine_map[msg['machine_id']]]['status_timestamp'] = msg['timestamp'];
              if (moment(lsd_cs[machine_map[msg['machine_id']]]['timestamp']) < moment().subtract('10', 'minutes')) {
                lsd_cs[machine_map[msg['machine_id']]]['status'] = 'red';
              } else {
                lsd_cs[machine_map[msg['machine_id']]]['status'] = 'yellow';
              }
            } else {
              lsd_cs[machine_map[msg['machine_id']]]['machine_id'] = machine_map[msg['machine_id']];
              lsd_cs[machine_map[msg['machine_id']]]['timestamp'] = msg['timestamp'];
              lsd_cs[machine_map[msg['machine_id']]]['status_timestamp'] = msg['timestamp'];
              lsd_cs[machine_map[msg['machine_id']]]['prediction'] = msg['saw_sensor'];
              lsd_cs[machine_map[msg['machine_id']]]['status'] = 'green';
            }

            let dts = [];
            dts.push(machine_map[msg.machine_id]);
            dts.push(msg.timestamp);
            dts.push(msg.prediction);
            dts.push(msg.vice_sensor);
            dts.push(msg.saw_sensor);
            // if edge device sends machine_status
            dts.push(msg.machine_status);
            // if edge device does not send machine_status
            /*
            let machine_status = 0;
            if ( msg.saw_sensor == 0) {
              machine_status = 0;
            }
            if ( msg.saw_sensor == 1 && msg.vice_sensor == 0 ) {
              machine_status = 1;
            }
            if ( msg.saw_sensor == 1 && msg.vice_sensor == 1 ) {
              machine_status = 2;
            }
            dts.push(machine_status);
            */
            dts.push(msg.barcode_id);
            dts.push(msg.flag);
            data_to_store.push(dts);
            let hslts = [];
            hslts.push(machine_map[msg.machine_id]);
            hslts.push(msg.timestamp);
            hslts.push(msg.hw_stats.MEM_BUFFERS);
            hslts.push(msg.hw_stats.CPU_IO_WAIT_TIME);
            hslts.push(msg.hw_stats.MEM_FREE);
            hslts.push(msg.hw_stats.CORE_TEMP);
            hslts.push(msg.hw_stats.MEM_PCT);
            hslts.push(msg.hw_stats.MEM_CACHED);
            hslts.push(msg.hw_stats.CPU_FREQ);
            hslts.push(msg.hw_stats.SWAP_PCT);
            hslts.push(msg.hw_stats.CPU_PCT);
            hslts.push(msg.hw_stats.DISK_IO_BUSY_TIME);
            hslts.push(msg.hw_stats.NUM_PROCS);
            hw_stats_data_to_store.push(hslts);
            if (data_to_store.length == 10) {
              hw_stats_subset = hw_stats_data_to_store.slice(0, 11);
              hw_stats_subset.forEach(function(hw_stats_instance) {
                hw_stats_data_to_send.push(Object.values(hw_stats_instance));
              });
              let hw_stats_query = "INSERT INTO hw_stats (machine_id, ts, MEM_BUFFERS, CPU_IO_WAIT_TIME, MEM_FREE, CORE_TEMP, MEM_PCT, MEM_CACHED, CPU_FREQ, SWAP_PCT, CPU_PCT, DISK_IO_BUSY_TIME, NUM_PROCS) VALUES ?";
              client.query(hw_stats_query, [hw_stats_data_to_send],
                  function(err) {
                    if (err) throw err;
                    hw_stats_data_to_send = [];
                  });
              hw_stats_data_to_store = hw_stats_data_to_store.slice(11, hw_stats_data_to_store.length);

              subset = data_to_store.slice(0, 11);
              subset.forEach(function(instance) {
                data_to_send.push(Object.values(instance));
              });
              let data_to_send_raw_data = data_to_send;
              let data_to_send_raw_data_rts = data_to_send;
              data_to_send = [];
              let query = "INSERT INTO " + db_config.table + " (machine_id, ts, prediction, vice_sensor, saw_sensor, machine_status, barcode_id, flag) VALUES ?";
              client.query(query, [data_to_send_raw_data], function(err, response) {
                if (err) throw err;
                data_to_send_raw_data = [];
                console.log('    Successfully inserted into raw_data');
              });
              query = "INSERT INTO raw_data_rts (machine_id, ts, prediction, vice_sensor, saw_sensor, machine_status, barcode_id, flag) VALUES ?";
              client.query(query, [data_to_send_raw_data_rts], function(err, response) {
                if (err) throw err;
                data_to_send_raw_data_rts = [];
                console.log('    Successfully inserted into raw_data_rts');
              });
              data_to_store = data_to_store.slice(11, data_to_store.length);
            }
          } catch (err) {
            console.log(err);
          }
        }, {noAck: true});
      });
    });
  },
};
