// Copyright Asquared IoT Pvt. Ltd. 2019
// Asquared IoT Pvt. Ltd. Confidential Information
// Shared with Koninca Minolta Inc on March 08, 2019, under NDA between
// Asqaured IoT and Konica Minolta

const config = {
  url_parameters: {
    port: '3001',
  },
  database: {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'hmmasterdb',
    raw_table: 'raw_data',
    login_table: 'login',
  },
};
module.exports = config;
