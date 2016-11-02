module.exports = { 
  name: "Login",
  data: function () {
    return {
      name: null,
      password: null,
      incorrect: false
    };
  },
  template: '\
    <div class="panel panel-default">\
      <div class="panel-heading">Login</div>\
      <div class="panel-body">\
        <div class="alert alert-danger" role="alert" v-if="incorrect">\
          Name and/or password incorrect\
        </div>\
        <form class="form-horizontal">\
          <div class="form-group">\
            <label for="name" class="control-label col-sm-3">Name</label>\
            <div class="col-sm-9">\
              <input type="text" id="name" class="form-control" v-model="name"/>\
            </div>\
          </div>\
          <div class="form-group">\
            <label for="password" class="control-label col-sm-3">Password</label>\
            <div class="col-sm-9">\
              <input type="password" id="password" class="form-control" v-model="password"/>\
            </div>\
          </div>\
        </form>\
      </div>\
      <div class="panel-footer">\
        <button class="btn btn-primary" @click="login">Login</button>\
      </div>\
    </div>',
  methods: {
    login: function (event) {
      this.incorrect = false;
      this.$http.post('/api/login', { name: this.name, password: this.password}).then((response) => {
        console.log("login successful");
      }, (response) => {
        console.log("login failed");
        this.incorrect = true;
      });
    }
  }
}
