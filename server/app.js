var express = require('express');
var low = require('lowdb');
var fileAsync = require('lowdb/lib/file-async');
var NukiBridgeApi = require('nuki-bridge-api');
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var bcrypt = require('bcrypt');
var session = require('express-session')
var crypto = require('crypto');

const PORT = 3000;
const SALT_ROUNDS= 10;
const NUKI_IP = "192.168.2.194";
const NUKI_PORT = "9112";
const NUKI_TOKEN = "e725g9";

var app = express();

const config = low('config.json');
// const GOOGLE_MAIL_AUTH = config.get("GOOGLE_MAIL").value();

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
    res.status(401).send('You are not authorized to view this page');
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
    res.status(401).send('You are not authorized to view this page');
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
        res.status(401).send("You are not authorized for this time.");
      } else {
        req.session.userId = user.name;
        if (!!user.admin) req.session.admin = true;

        addProtocol("User '" + req.session.userId + "' logged in.", req);

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
  addProtocol("User '" + req.session.userId + "' logged out.", req);
  delete req.session.userId;
  req.session.destroy(function(err) {
    if (!err) {
      res.status(200).send("OK");
    } else {
      res.status(400).send("Logout failed");
    }
  })
});

app.post('/api/newUser', jsonParser, function (req, res) {
  var body = req.body;
  var name = body.name;
  var mail = body.mail;
  var admin = !!body.admin;
  var times = body.times;

  if (!!users.find({ "name": name }).value()) {
    res.status(400).send("Username already exists.");
  } else if (!!users.find({ "mail": mail }).value()) {
    res.status(400).send("Mail already exists.");
  } else {
    crypto.randomBytes(12, function(err, buffer) {
      var token = buffer.toString('hex');
      var validDate = new Date();
      validDate.setDate(validDate.getDate() + 2);
      var newUser = {
        name: name,
        admin: admin,
        mail: mail,
        invitation: {
          token: token,
          validUntil: validDate
        }
      };
      if (!!times) newUser.times = times;

      users.push(newUser).value();
      addProtocol("User '" + name + "' was added.", req);

      res.set('Content-Type', 'application/json');
      res.status(200).send(newUser);
    });
  }
});

app.post('/api/acceptInvitation', jsonParser, function (req, res) {
  var name = body.user.trim();
  var token = body.token.trim();
  var newPassword = body.password.trim();

  var user = users.find({ "name": name }).value();
  if (!user || user.invitation.token !== token) {
    res.status(401).send("Invitation not found.");
  } else if (user.invitation.validUntil > new Date()) {
    res.status(401).send("The invitation is not valid anymore.");
  } else {
    bcrypt.hash(password, SALT_ROUNDS, function(err, hash) {
      delete user.invitation;
      user.password = hash;
      res.status(200).send();
    });
  }
});

app.delete('/api/user', jsonParser, function (req, res) {
  var name = req.query.name;

  if (req.session.userId === name) {
    res.status(400).send("You can't delete your own user.");
  } else {
    if (!!users.find({ "name": name }).value()) {
      users.remove({ "name": name }).value();
      addProtocol("User '" + name + "' was deleted.", req);
      res.status(200).send();
    } else {
      res.status(400).send("User does not exist.");
    }
  }
});

app.post('/api/changePassword', jsonParser, function (req, res) {
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
app.get('/api/protocol', function (req, res) {
  var count = !req.query.count ? 25 : Number(req.query.count);
  var skip  = !req.query.skip ? 0 : Number(req.query.skip);

  res.set('Content-Type', 'application/json');
  res.send(protocol
    .sortBy('date')
    .reverse()
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
