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
  <div>\
    <h1>New User</h1>\
    <form class="form-horizontal">\
      <div class="form-group">\
        <label for="name" class="control-label col-sm-3">Name</label>\
        <div class="col-sm-6">\
          <input type="text" id="name" class="form-control" v-model.trim="name"/>\
        </div>\
      </div>\
      <div class="form-group">\
        <label for="mail" class="control-label col-sm-3">Mail</label>\
        <div class="col-sm-6">\
          <input type="email" id="mail" class="form-control" v-model.trim="mail"/>\
        </div>\
      </div>\
      <div class="form-group">\
        <div class="col-sm-offset-3 col-sm-6">\
          <div class="checkbox">\
            <label>\
              <input type="checkbox" id="admin" v-model="admin"> Is Administrator?\
            </label>\
          </div>\
        </div>\
      </div>\
      <div class="form-group">\
        <div class="col-sm-offset-3 col-sm-6">\
          <button type="submit" class="btn btn-primary" \
            v-bind:class="{ disabled: !canBeSaved}"\
            @click="save">\
            Create\
          </button>\
        </div>\
      </div>\
    </form>\
  </div>',
  computed: {
    canBeSaved: function () {
      return !!this.name && !!this.mail;
    }
  },
  methods: {
    save: function (event) {
      if (!this.canBeSaved) return;
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
