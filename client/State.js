module.exports = {
  name: "Login",
  data: function () {
    return {
      open: undefined
    };
  },
  template: '\
    <div class="row">\
      <div class="col-xs-12">\
        <div class="circle" @click="toggle">\
          <span v-if="open">{{ $t("state.open") }}</span>\
          <span v-if="open === false">{{ $t("state.closed") }}</span>\
          <span v-if="open === undefined">{{ $t("state.unknown") }}</span>\
        </div>\
      </div>\
    </div>',
  methods: {
    toggle: function (ev) {
      console.log("toogle");
    }
  }
}
