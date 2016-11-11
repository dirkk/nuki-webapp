const routes = require("./Routing.js");
const User = require("./User.js");
var VueCookie = require('vue-cookie');

const router = new VueRouter({ routes });
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth) && !User.isLoggedIn()
    || to.matched.some(record => record.meta.requiresAdminAuth) && !User.isLoggedInAdmin()) {
    next({ path: '/' });
  } else {
    next();
  }
});

Vue.use(VueCookie);
const app = new Vue({
  router
}).$mount('#app');
