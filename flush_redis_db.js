/* jshint esversion: 8 */
'use strict';

/**
* Copyright Asquared IoT Pvt. Ltd. 2019
* Asquared IoT Pvt. Ltd. Confidential Information
* Shared with Koninca Minolta Inc on March 08, 2019, under NDA between
* Asqaured IoT and Konica Minolta
*/


const redis = require('./web_app/node_modules/redis');
const client = redis.createClient();

const {promisify} = require('util');
const getAsyncKey = promisify(client.keys).bind(client);
const getAsyncFlushdb = promisify(client.flushdb).bind(client);



  let getAsyncFlushdbResult = getAsyncFlushdb();
  getAsyncFlushdbResult.then( function (succeeded, err) {
    if(succeeded) {
      console.log('flush redis db complete...');
      client.quit();
    } else {
      console.log(err);
    }
  });

