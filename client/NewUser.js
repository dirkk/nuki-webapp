module.exports = {
  name: "NewUser",
  data: function () {
    return {
      name: null,
      mail: null,
      admin: false,
      times: []
    };
  },
  template: '\
  <h1>hgdsf</h1>\
    <form class="form-horizontal">\
      <div class="form-group">\
        <label for="name" class="control-label col-sm-3">Name</label>\
        <div class="col-sm-9">\
          <input type="text" id="name" class="form-control" v-model="name"/>\
        </div>\
      </div>\
      <div class="form-group">\
        <label for="mail" class="control-label col-sm-3">Mail</label>\
        <div class="col-sm-9">\
          <input type="text" id="mail" class="form-control" v-model="mail"/>\
        </div>\
      </div>\
      <div class="form-group">\
        <label for="admin" class="control-label col-sm-3">Is Administrator?</label>\
        <div class="col-sm-9">\
          <input type="checkbox" id="admin" class="form-control" v-model="admin"/>\
        </div>\
      </div>\
    </form>',
  methods: {
    save: function (event) {
      this.$http.post('/api/newUser', {
        name: this.name,
        password: this.password,
        admin: this.admin,
        times: this.times
      }).then(response => {
        console.log("User added");
      }, (response) => {
        console.log("User could not be added." + response);
      });
    }
  }
}
