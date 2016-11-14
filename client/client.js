const routes = require("./Routing.js");
const User = require("./User.js");
const DateFilter = require("./Date.js");
const VueCookie = require('vue-cookie');
const VueI18n = require('vue-i18n')
const Language = require("./Language.js");

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
Vue.use(DateFilter);

// languages
Vue.use(VueI18n)
Vue.config.lang = 'de';
Vue.config.fallbackLang = 'en'
Object.keys(Language).forEach(function (lang) {
  Vue.locale(lang, Language[lang])
})

const app = new Vue({
  router
}).$mount('#app');
