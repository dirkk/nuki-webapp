const NewUser = require("./NewUser.js");
const UsersListing = require("./UsersListing.js");
const Protocol = require("./Protocol.js");
const State = require("./State");
const Login = require("./Login.js");
const User = require("./User.js");

module.exports = [{
  path: '/users',
  component: UsersListing,
  meta: { requiresAdminAuth: true }
}, {
  path: '/user/new',
  name: 'newUser',
  component: NewUser,
  meta: { requiresAdminAuth: true },
}, {
  path: '/user/:name',
  name: 'editUser',
  component: NewUser,
  meta: { requiresAdminAuth: true },
}, {
  path: '/protocol',
  component: Protocol,
  meta: { requiresAdminAuth: true }
}, {
  path: '/state',
  component: State,
  meta: { requiresAuth: true }
}, {
  path: '/logout',
  beforeEnter: (to, from, next) => {
    User.clearUser();
    next({ path: '/' });
  }
}, {
  path: '/',
  component: Login,
  beforeEnter: (to, from, next) => {
    if (User.isLoggedIn()) {
      next({ path: '/state' });
    } else {
      next();
    }
  }
}];
