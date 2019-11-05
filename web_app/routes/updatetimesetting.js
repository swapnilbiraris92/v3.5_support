// Copyright Asquared IoT Pvt. Ltd. 2019
// Asquared IoT Pvt. Ltd. Confidential Information
var express = require('express');
var datetime = require('node-datetime');
var router = express.Router();
var Moment = require('moment');
const MomentRange = require('moment-range');

const moment = MomentRange.extendMoment(Moment);
//const client = require('../lib/database');

let config = require('../config/index')

var mysql = require('mysql');


var db_config = {
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database
}

var client;

function handleDisconnect() {
  client = mysql.createConnection(db_config); // Recreate the connection, since
  // the old one cannot be reused.

  client.connect(function(err) { // The server is either down
    if (err) { // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }
  }); // process asynchronous requests in the meantime.
  // If you're also serving http, display a 503 error.
  client.on('error', function(err) {
    console.log("------------")
    console.log('db error', err);
    console.log("------------")
    if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();
    } else { // connnection idle timeout (the wait_timeout
      throw err; // server variable configures this)
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
router.post('/updateMachineNames', function(req, res) {
  let query1, query2, query3, query4, query5, query6, query7, query8;
  query1 = "update machine_names set machine_name = '" + req.body['4-01'] + "' where machine_id = '4-01';"
  query2 = "update machine_names set machine_name = '" + req.body['4-02'] + "' where machine_id = '4-02';"
  query3 = "update machine_names set machine_name = '" + req.body['4-03'] + "' where machine_id = '4-03';"
  query4 = "update machine_names set machine_name = '" + req.body['4-05'] + "' where machine_id = '4-05';"
  query5 = "update machine_names set machine_name = '" + req.body['4-06'] + "' where machine_id = '4-06';"
  query6 = "update machine_names set machine_name = '" + req.body['4-07'] + "' where machine_id = '4-07';"
  query7 = "update machine_names set machine_name = '" + req.body['4-09'] + "' where machine_id = '4-09';"
  query8 = "update machine_names set machine_name = '" + req.body['4-C1'] + "' where machine_id = '4-C1';"
  var updatePromise1 = fetchingData(query1);
  updatePromise1.then(function(results1) {
    var updatePromise2 = fetchingData(query2);
    updatePromise2.then(function(results2) {
      //res.send("updateMachineNames succesfully updated")
    }, function(err) {
      console.log(err);
    });
  }, function(err) {
    console.log(err);
  });

  var updatePromise3 = fetchingData(query3);
  updatePromise3.then(function(results1) {
    var updatePromise4 = fetchingData(query4);
    updatePromise4.then(function(results2) {
      //  res.send("updateMachineNames succesfully updated")
    }, function(err) {
      console.log(err);
    });
  }, function(err) {
    console.log(err);
  });

  var updatePromise5 = fetchingData(query5);
  updatePromise5.then(function(results1) {
    var updatePromise6 = fetchingData(query6);
    updatePromise6.then(function(results2) {
      //  res.send("updateMachineNames succesfully updated")
    }, function(err) {
      console.log(err);
    });
  }, function(err) {
    console.log(err);
  });

  var updatePromise7 = fetchingData(query7);
  updatePromise7.then(function(results1) {
    var updatePromise8 = fetchingData(query8);
    updatePromise8.then(function(results2) {
      res.send("updateMachineNames succesfully updated")
    }, function(err) {
      console.log(err);
    });
  }, function(err) {
    console.log(err);
  });

});
router.post('/', function(req, res) {
  var start_time_to_set = req.body.start_time_to_set;
  var end_time_to_set = req.body.end_time_to_set;

  query1 = "update web_app_parameters set value = '" + end_time_to_set + "' where variable = 'end_hr_min';"
  query2 = "update web_app_parameters set value = '" + start_time_to_set + "' where variable = 'start_hr_min';"
  // additional one
  query3 = "update web_app_parameters set value = '" + req.body.end_time_to_set_2 + "' where variable = 'end_hr_min_2';"
  query4 = "update web_app_parameters set value = '" + req.body.start_time_to_set_2 + "' where variable = 'start_hr_min_2';"
  query5 = "update web_app_parameters set value = '" + req.body.end_time_to_set_3 + "' where variable = 'end_hr_min_3';"
  query6 = "update web_app_parameters set value = '" + req.body.start_time_to_set_3 + "' where variable = 'start_hr_min_3';"
  query7 = "update web_app_parameters set value = '" + req.body.end_time_to_set_4 + "' where variable = 'end_hr_min_4';"
  query8 = "update web_app_parameters set value = '" + req.body.start_time_to_set_4 + "' where variable = 'start_hr_min_4';"
  query9 = "update web_app_parameters set value = '" + req.body.end_time_to_set_5 + "' where variable = 'end_hr_min_5';"
  query10 = "update web_app_parameters set value = '" + req.body.start_time_to_set_5 + "' where variable = 'start_hr_min_5';"
  // first One
  query11 = "update web_app_parameters set value = '" + req.body.end_time_to_set_1 + "' where variable = 'end_hr_min_1';"
  query12 = "update web_app_parameters set value = '" + req.body.start_time_to_set_1 + "' where variable = 'start_hr_min_1';"

  query13 = "update web_app_parameters set value = '" + req.body.status1 + "' where variable = 'status1';"
  query14 = "update web_app_parameters set value = '" + req.body.status2 + "' where variable = 'status2';"
  query15 = "update web_app_parameters set value = '" + req.body.status3 + "' where variable = 'status3';"
  query16 = "update web_app_parameters set value = '" + req.body.status4 + "' where variable = 'status4';"
  query17 = "update web_app_parameters set value = '" + req.body.status5 + "' where variable = 'status5';"
  query18 = "update web_app_parameters set value = '" + req.body.status6 + "' where variable = 'status6';"

  query19 = "update web_app_parameters set value = '" + req.body.end_time_to_set_6 + "' where variable = 'end_hr_min_6';"
  query20 = "update web_app_parameters set value = '" + req.body.start_time_to_set_6 + "' where variable = 'start_hr_min_6';"

  var updatePromise1 = fetchingData(query1);
  updatePromise1.then(function(results1) {
    var updatePromise2 = fetchingData(query2);
    updatePromise2.then(function(results2) {
      //  res.send("Time setting succesfully updated")
    }, function(err) {
      console.log(err);
    });
  }, function(err) {
    console.log(err);
  });

  // first One
  // second set value
  var updatePromise11 = fetchingData(query11);
  updatePromise11.then(function(results1) {
    var updatePromise12 = fetchingData(query12);
    updatePromise12.then(function(results2) {
      //res.send("Time setting succesfully updated")
    }, function(err) {
      console.log(err);
    });
  }, function(err) {
    console.log(err);
  });

  // second set value
  var updatePromise3 = fetchingData(query3);
  updatePromise3.then(function(results1) {
    var updatePromise4 = fetchingData(query4);
    updatePromise4.then(function(results2) {
      //res.send("Time setting succesfully updated")
    }, function(err) {
      console.log(err);
    });
  }, function(err) {
    console.log(err);
  });
  // third one
  var updatePromise5 = fetchingData(query5);
  updatePromise5.then(function(results1) {
    var updatePromise6 = fetchingData(query6);
    updatePromise6.then(function(results2) {
      //res.send("Time setting succesfully updated")
    }, function(err) {
      console.log(err);
    });
  }, function(err) {
    console.log(err);
  });
  // fourth one
  var updatePromise7 = fetchingData(query7);
  updatePromise7.then(function(results1) {
    var updatePromise8 = fetchingData(query8);
    updatePromise8.then(function(results2) {
      //res.send("Time setting succesfully updated")
    }, function(err) {
      console.log(err);
    });
  }, function(err) {
    console.log(err);
  });

  // fifth record
  var updatePromise9 = fetchingData(query9);
  updatePromise9.then(function(results1) {
    var updatePromise10 = fetchingData(query10);
    updatePromise10.then(function(results2) {
      //res.send("Time setting succesfully updated")
    }, function(err) {
      console.log(err);
    });
  }, function(err) {
    console.log(err);
  });

  // sixth record
  var updatePromise19 = fetchingData(query19);
  updatePromise19.then(function(results1) {
    var updatePromise20 = fetchingData(query20);
    updatePromise20.then(function(results2) {
      //res.send("Time setting succesfully updated")
    }, function(err) {
      console.log(err);
    });
  }, function(err) {
    console.log(err);
  });


  var updatePromise13 = fetchingData(query13);
  updatePromise13.then(function(results1) {
    var updatePromise14 = fetchingData(query14);
    updatePromise14.then(function(results2) {
      //res.send("Time setting succesfully updated")
    }, function(err) {
      console.log(err);
    });
  }, function(err) {
    console.log(err);
  });

  var updatePromise15 = fetchingData(query15);
  updatePromise15.then(function(results1) {
    var updatePromise16 = fetchingData(query16);
    updatePromise16.then(function(results2) {
      //res.send("Time setting succesfully updated")
    }, function(err) {
      console.log(err);
    });
  }, function(err) {
    console.log(err);
  });

  var updatePromise17 = fetchingData(query17);
  updatePromise17.then(function(results1) {
    var updatePromise18 = fetchingData(query18);
    updatePromise18.then(function(results2) {
      res.send("Time setting succesfully updated")
    }, function(err) {
      console.log(err);
    });
  }, function(err) {
    console.log(err);
  });



});

module.exports = router;
