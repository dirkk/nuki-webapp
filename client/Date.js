exports.install = function (Vue, options) {
  Vue.filter('date', function (date, format) {
    if (!date) {
      return "N/A";
    }
    moment.locale(Vue.config.lang);
    return moment(date).format(format);
  });
};
