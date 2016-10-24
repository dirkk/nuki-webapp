const Users = { template: '<div>foo</div>' }
const State = { template: '<div>foo</div>' }
const Logout = { template: '<div>foo</div>' }
const Login = require("./Login.js")

const routes = [
  { path: '/users', component: Users },
  { path: '/state', component: State },
  { path: '/logout', component: Logout },
  { path: '/', component: Login }
]

const router = new VueRouter({ routes });

const app = new Vue({
  router
}).$mount('#app');
/*
const app = new Vue({
  el: '#app',
  data: {
  }
});
*/
