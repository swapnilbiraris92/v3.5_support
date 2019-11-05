// Copyright Asquared IoT Pvt. Ltd. 2019
// Asquared IoT Pvt. Ltd. Confidential Information
// Shared with Koninca Minolta Inc on March 08, 2019, under NDA between Asqaured IoT and Konica Minolta

var express = require('express');
var router = express.Router();
var amqp = require('amqplib/callback_api');

router.post('/', function (req, res) {
  var data_to_upload = JSON.stringify(req.body);
  amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
      var q = 'data_from_edge';
      var msg = data_to_upload;
      ch.assertQueue(q, { durable: false });
      ch.sendToQueue(q, Buffer.from(msg));
    });
    setTimeout(function () { conn.close(); }, 500);
  });
  res.send("Uploaded");
});

module.exports = router;