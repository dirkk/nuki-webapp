var express = require('express');
var low = require('lowdb');
var fileAsync = require('lowdb/lib/file-async');
var NukiBridgeApi = require('nuki-bridge-api');
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var bcrypt = require('bcrypt');
var session = require('express-session')

const PORT = 3000;
const SALT_ROUNDS= 10;
const NUKI_IP = "192.168.2.194";
const NUKI_PORT = "9112";
const NUKI_TOKEN = "e725g9";

var app = express();

// Start database using file-async storage
var db = low('db.json', {
  storage: fileAsync
})
db.defaults({ users: [], protocol: [] })
  .value()

var users = db.get('users');
var protocol = db.get('protocol');

app.use(express.static('client'));
app.use('/vendor', express.static('node_modules'));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));

// User management

/**
 * Checks whether the user is currently logged in.
 *
 * @param req request
 * @param res response
 * @param next call next middleware
 */
function checkAuth(req, res, next) {
  if (!req.session.userId) {
    res.send('You are not authorized to view this page');
  } else {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  }
}

/**
 * Checks whether the currently logged in user is an administrator.
 *
 * @param req request
 * @param res response
 * @param next call next middleware
 */
function checkAuthAdmin(req, res, next) {
  if (!req.session.userId || !req.session.admin) {
    res.send('You are not authorized to view this page');
  } else {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  }
}

/**
 * Returns whether the current time is compatible for the authentification time schedule.
 * @param times object for each weekday with start/end date
 * @returns authentification success
 */
function checkAuthTime(times) {
  if (!times) return true;

  var day = new Date().getDay();
  var time = times[day];
  if (!time) return false;

  var hour = new Date().getHours();
  return hour >= time.start && hour < time.end;
}

/**
 * Returns whether the given password is valid. Password must contain between 8 and 16 numbers.
 * The password ist restricted to numbers as a keypad entry might be a future possibility.
 *
 * @param password  password to checke
 * @returns password is valid
 */
function isValidPassword(password) {
  return /[0-9]{8, 16}/g.exec(password);
}

// logs in a user, stores the user within the session
app.post('/api/login', jsonParser, function (req, res) {
  var body = req.body;
  var user = users.find({ "name": body.user }).value();

  if (!user) {
    res.status(400).send("Bad username/password");
    return;
  }

  bcrypt.compare(body.password, user.password, function(err, hashFound) {
    if (!!user && hashFound) {
      if (!checkAuthTime(user.times)) {
        res.status(400).send("You are not authorized for this time.");
      } else {
        req.session.userId = user.name;
        if (!!user.admin) req.session.admin = true;
        res.set('Content-Type', 'application/json');
        res.status(200).send({user: user.name, admin: user.admin});
      }
    } else {
      res.status(400).send("Bad username/password");
    }
  });
});

// logout a user
app.post('/api/logout', function (req, res) {
  delete req.session.userId;
  req.session.destroy(function(err) {
    if (!err) {
      res.status(200).send("OK");
    } else {
      res.status(400).send("Logout failed");
    }
  })
});

app.post('/api/newUser', checkAuthAdmin, jsonParser, function (req, res) {
  var body = req.body;
  var user = body.user.trim();
  var password = body.password.trim();
  var admin = !!body.admin;
  var times = body.times;

  if (!!users.find({ "name": user }).value()) {
    res.status(400).send("User already exists.");
  } else {
    bcrypt.hash(password, SALT_ROUNDS, function(err, hash) {
      var newUser = {
        name: user,
        password: hash,
        admin: admin
      };
      if (!!times) newUser.times = times;

      users.push(newUser).value();
      res.status(200).send();
    });
  }
});

app.post('/api/deleteUser', checkAuthAdmin, jsonParser, function (req, res) {
  var body = req.body;
  var user = body.user.trim();

  if (!!users.find({ "name": user }).value()) {
    users.remove({ "name": user }).value();
    res.status(200).send();
  } else {
    res.status(400).send("User does not exist.");
  }
});

app.post('/api/changePassword', checkAuthAdmin, jsonParser, function (req, res) {
  var body = req.body;
  var user = body.user.trim();
  var newPassword= body.password.trim();

  if (!!users.find({ "name": user }).value()) {
    bcrypt.hash(newPassword, SALT_ROUNDS, function(err, hash) {
      users.find({ "name": user }).assign({ password: hash }).value();
      res.status(200).send();
    })
  } else {
    res.status(400).send("User does not exist.");
  }
});

app.get('/api/users', function (req, res) {
  var count = !req.query.count ? 25 : Number(req.query.count);
  var skip  = !req.query.skip ? 0 : Number(req.query.skip);

  res.set('Content-Type', 'application/json');
  res.send(users
    .slice(skip, skip + count)
    .value()
    .map(u => { return {
      name: u.name,
      mail: u.mail,
      admin: u.admin,
      times: u.times
    }})
  );
});

// protocol
app.get('/api/protocol', checkAuthAdmin, function (req, res) {
  var count = !req.query.count ? 25 : Number(req.query.count);
  var skip  = !req.query.skip ? 0 : Number(req.query.skip);

  res.set('Content-Type', 'application/json');
  res.send(protocol
    .sortBy('date')
    .slice(skip, skip + count)
    .value()
  );
});

/**
 * Adds a new protocol entry.
 *
 * @param entry protocol text
 * @param req request
 */
function addProtocol(entry, req) {
  var text = (!req.session.userId ? "" : req.session.userId + ": ") + entry;
  protocol.push({
    text: text,
    date: new Date()
  }).value();
};

// Nuki functions
function getNuki () {
  // find nuki
  var bridge = new NukiBridgeApi.Bridge(NUKI_IP, NUKI_PORT, NUKI_TOKEN);
  return bridge.list().then(function (nukis) {
    console.log("Nuki found");
    if (nukis.length !== 0) {
      console.log("No or too many nukis found");
    }
    return nukis[0];
  });
};

app.get('/api/state', checkAuth, function (req, res) {
  getNuki().then(function (nuki) {
    nuki.lockState().then(function (lockState) {
      if (lockState === lockStates.LOCKED) {
          res.send('Nuki locked');
      } else if (lockState === lockStates.UNLOCKED) {
          res.send('Nuki unlocked');
      }
    });
  }, function (err) {
    console.log(err);
    res.status(500).send("Could not connect to nuki.");
  });
});

app.get('/api/toggle', checkAuth, function (req, res) {
  getNuki().then(function (nuki) {
    nuki.lockState().then(function (lockState) {
      if (lockState === lockStates.LOCKED) {
          nuki.lockAction(lockActions.UNLOCK);
          addProtocol("Nuki unlocked", req);
          res.send("Nuki unlocked");
      } else if (lockState === lockStates.UNLOCKED) {
          nuki.lockAction(lockActions.LOCK);
          addProtocol("Nuki locked", req);
          res.send("Nuki locked");
      }
    });
  });
});

app.get('/api/unlock', checkAuth, function (req, res) {
  getNuki().then(function (nuki) {
    nuki.lockAction(lockActions.UNLOCK);
    addProtocol("Nuki unlocked", req);
    res.send("Nuki unlocked");
  });
});

app.get('/api/lock', checkAuth, function (req, res) {
  getNuki().then(function (nuki) {
    nuki.lockAction(lockActions.LOCK);
    addProtocol("Nuki locked", req);
    res.send("Nuki locked");
  });
});

var server = app.listen(PORT, function () {
  console.log("Nuki webapp listening on port " + PORT + "!");
});
module.exports = server;
