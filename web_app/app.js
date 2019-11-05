/* eslint-disable camelcase */
/* eslint-disable prefer-const */
// Copyright Asquared IoT Pvt. Ltd. 2019
// Asquared IoT Pvt. Ltd. Confidential Information
let createError = require('http-errors');
let express = require('express');
const serveStatic = require('serve-static');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let passport = require('passport');
let indexRouter = require('./routes/index');
let usersRouter = require('./routes/user');
let outputdataRouter = require('./routes/outputdata');
let updatetimesettingRouter = require('./routes/updatetimesetting');
let liveDataRouter = require('./routes/livedata');
let downloadRouter = require('./routes/download');
let uploadRouter = require('./routes/edgeupload');
let updateRealTimeThresholdsRouter = require('./routes/updaterealtimethresholds');
let consumer = require('./public/javascripts/edgedataprocess');
let realtime_value_calculation = require('./public/javascripts/realtime_value_calculation');
let timeSettingRouter = require('./routes/timesetting');
let config=require('./config/index');
let mysql = require('mysql');

let app = express();
let cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'mysession',
  keys: ['vueauthrandomkey'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}),
);

app.use(passport.initialize());
app.use(passport.session());

// mysql credentials
let db_config = {
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  table: config.database.login_table,
};
// connecting to mysql database
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

let users = [
  {
    id: 1,
    name: 'a',
    email: 'a',
    password: 'a',
  },
];

// getting the local authentication type
let LocalStrategy = require('passport-local').Strategy;
let bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', serveStatic ( path.join(__dirname, '/dist') ) );

passport.use(
    new LocalStrategy( {
      usernameField: "email",
      passwordField: "password"
    },
    (username, password, done) => {
      let user = users.find((user) => {
        let query = 'select * from '+ db_config.table+';';
        let loginPromise = fetchingData(query);
        loginPromise.then(function(results) {
          if (results[0].username === username && results[0].password === password) {
            done(null, user);
          } else {
            done(null, false, {message: 'Incorrect username or password'});
          }
        });
      });
    }
    )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  let user = users.find((user) => {
    return user.id === id;
  });

  done(null, user);
});

consumer.consumer();
setInterval(realtime_value_calculation.real_time_calculation, 4000);
setInterval(realtime_value_calculation.real_time_calculation_cs, 4000);
setInterval(realtime_value_calculation.rts_last_ts, 60000);

app.use('/hello', usersRouter);
app.use('/outputdata', outputdataRouter);
app.use('/livedata', liveDataRouter);
app.use('/download', downloadRouter);
app.use('/upload', uploadRouter);
app.use('/gettimesetting', timeSettingRouter);
app.use('/updatetimesetting', updatetimesettingRouter);
app.use('/updateRealTimeThresholds', updateRealTimeThresholdsRouter);

app.post('/api/login', function(req, res) {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.log('in err');
      return next(err);
    }
    if (!user) {
      return res.status(400).send([user, "Cannot log in", info]);
    }
    req.login(user, err => {
      res.send("Logged in");
    });
  })(req, res);
});

const authMiddleware = (req, res, next) => {  
  if (!req.isAuthenticated()) {
    res.status(401).send('You are not authenticated');
  } else {
    return next();
  }
};

/* GET users listing. */
app.get("/api/user", authMiddleware, (req, res) => {  
  let user = users.find(user => {
    return user.id === req.session.passport.user;
  });
  res.send({ user: user });
});


app.get("/api/logout", function(req, res) {  
  req.logout();
  res.send("logged out");
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
