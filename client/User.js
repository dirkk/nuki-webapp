module.exports = {
  setUser (newValue) {
    Vue.cookie.set('user', newValue.user, 1);
    Vue.cookie.set('admin', !!newValue.admin, 1);
  },
  clearUser () {
    Vue.cookie.delete('user');
  },
  isLoggedIn () {
    return !!Vue.cookie.get('user');
  },
  isLoggedInAdmin () {
    return !!Vue.cookie.get('user') && Vue.cookie.get('admin');
  }
}
