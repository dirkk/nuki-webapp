const NewUser = require("./NewUser.js")
const UserManagement = require("./UserManagement.js")
const Protocol = require("./Protocol.js")
const State = { template: '<div>foo</div>' }
const Logout = { template: '<div>foo</div>' }
const Login = require("./Login.js")

const routes = [
  { path: '/users', component: UserManagement },
  { path: '/new-user', component: NewUser },
  { path: '/protocol', component: Protocol },
  { path: '/state', component: State },
  { path: '/logout', component: Logout },
  { path: '/', component: Login }
]

const router = new VueRouter({ routes });

const app = new Vue({
  router
}).$mount('#app');
