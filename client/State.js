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
          <span v-if="open">Offen</span>\
          <span v-if="!open">Geschlossen</span>\
          <span v-if="open === undefined">Unbekannt</span>\
        </div>\
      </div>\
    </div>',
  methods: {
    toggle: function (ev) {
      console.log("toogle");
    }
  }
}
