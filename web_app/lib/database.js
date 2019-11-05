let config=require('../config/index')
var mysql      = require('mysql');
/*var client = mysql.createConnection({
  host     : config.database.host,
  user     : config.database.user,
  password : config.database.password,
  database : config.database.database
});
*/

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
    console.log(client.state)                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  client.on('error', function(err) {
    console.log("------------")
    console.log('db error', err);
    console.log("------------")
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      console.log("correct")
      handleDisconnect();
      console.log(client.state)                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();


module.exports=client