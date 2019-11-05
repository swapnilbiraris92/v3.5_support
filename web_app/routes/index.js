// Copyright Asquared IoT Pvt. Ltd. 2019
// Asquared IoT Pvt. Ltd. Confidential Information
// Shared with Koninca Minolta Inc on March 08, 2019, under NDA between Asqaured IoT and Konica Minolta
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('../public/dist/index');
});

module.exports = router;
