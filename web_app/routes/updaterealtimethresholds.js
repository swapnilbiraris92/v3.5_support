// Copyright Asquared IoT Pvt. Ltd. 2019
// Asquared IoT Pvt. Ltd. Confidential Information
var express = require('express');
var router = express.Router();
let config=require('../config/index')
var mysql      = require('mysql');


var db_config = {
  host     : config.database.host,
  user     : config.database.user,
  password : config.database.password,
  database : config.database.database
}

var client;

function handleDisconnect() {
  client = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  client.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  client.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();


function fetchingToday(query){
    return new Promise(function(resolve, reject){

        client.query(query, function (error, results, fields) 
            {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                };
            });
    
	});
}



router.post('/', function(req, res) {
	 var task = req.body.task;

    if (task === 'update'){

    	    var realTimeThresholds1 = req.body.thresholdMachine01;
    var realTimeThresholds2 = req.body.thresholdMachine02;
    var realTimeThresholds3 = req.body.thresholdMachine03;
    var realTimeThresholds5 = req.body.thresholdMachine05;
    var realTimeThresholds6 = req.body.thresholdMachine06;
    var realTimeThresholds7 = req.body.thresholdMachine07;
    var realTimeThresholds9 = req.body.thresholdMachine09;

    	query1 = "update realTimeThresholds set machine01 = " + realTimeThresholds1 + ";"
    	query2 = "update realTimeThresholds set machine02 = " + realTimeThresholds2 + ";"
    	query3 = "update realTimeThresholds set machine03 = " + realTimeThresholds3 + ";"
    	query5 = "update realTimeThresholds set machine05 = " + realTimeThresholds5 + ";"
    	query6 = "update realTimeThresholds set machine06 = " + realTimeThresholds6 + ";"
    	query7 = "update realTimeThresholds set machine07 = " + realTimeThresholds7 + ";"
    	query9 = "update realTimeThresholds set machine09 = " + realTimeThresholds9 + ";"    
    	var updatePromise1 = fetchingToday(query1);
    	updatePromise1.then(function(results1){
    	    var updatePromise2 = fetchingToday(query2);
    	    updatePromise2.then(function(results2){
    	        var updatePromise3 = fetchingToday(query3);
    		    updatePromise3.then(function(results3){
    		        var updatePromise5 = fetchingToday(query5);
    		    	updatePromise5.then(function(results5){
    		        	var updatePromise6 = fetchingToday(query6);
    		    		updatePromise6.then(function(results6){
    		        		var updatePromise7 = fetchingToday(query7);
    		    			updatePromise7.then(function(results7){
    		        			var updatePromise9 = fetchingToday(query9);
    		    				updatePromise9.then(function(results9){
    		  					      res.send("Threshold setting succesfully updated")
    		  					}, function(err) {
    		  					console.log(err);
    							});
    		        
			    		    }, function(err) {
    						  console.log(err);
    						});
		    		    }, function(err) {
    				  		console.log(err);
    					});
    		        }, function(err) {
    		  			console.log(err);
    				});
    		        }, function(err) {
    		  			console.log(err);
    				});
	    		 }, function(err) {
    	  		console.log(err);
    		});
    	}, function(err) {
    	  console.log(err);
    	});
	} else {
		query = "select * from realTimeThresholds;"
		responceData = {}
		var rttPromise = fetchingToday(query);
    				rttPromise.then(function(resultsmachine){
    					responceData['machine09'] = resultsmachine[0]['machine09']
    					responceData['machine07'] = resultsmachine[0]['machine07']
    					responceData['machine06'] = resultsmachine[0]['machine06']
    					responceData['machine05'] = resultsmachine[0]['machine05']
    					responceData['machine03'] = resultsmachine[0]['machine03']
    					responceData['machine02'] = resultsmachine[0]['machine02']
    					responceData['machine01'] = resultsmachine[0]['machine01']
    					res.send(responceData);
    				}, function(err) {
    	  				console.log(err);
    				});

	}

});

module.exports = router;