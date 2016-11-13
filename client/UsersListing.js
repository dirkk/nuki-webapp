var User = require("./User.js");

module.exports = {
  name: "UsersListing",
  data: function () {
    return {
      users: []
    };
  },
  template: '\
  <div>\
    <div class="row">\
      <div class="col-xs-6">\
        <div class="btn-group">\
          <router-link class="btn btn-default" :to="{ path: \'user/new\' }">\
            <i class="glyphicon glyphicon-plus" /> Neu\
          </router-link>\
        </div>\
      </div>\
    </div>\
\
    <div class="row" style="margin-top: 20px;">\
      <div class="col-xs-12">\
        <table class="table table-striped table-hover">\
          <thead>\
            <tr>\
              <th class="col-xs-6">Name</th>\
              <th class="col-xs-4">Mail</th>\
              <th class="col-xs-1">Admin</th>\
              <th class="col-xs-1"></th>\
            </tr>\
          </thead>\
          <tbody>\
            <tr v-for="user in users">\
              <td>{{ user.name }}</td>\
              <td>{{ user.mail }}</td>\
              <td>\
                <i class="glyphicon glyphicon-ok" v-if="user.admin" />\
              </td>\
              <td>\
                <router-link class="btn btn-warning btn-sm" disabled=""\
                  :to="{ name: \'editUser\', params: { name: 123 }}">\
                  <i class="glyphicon glyphicon-pencil"/>\
                </router-link>\
                <button class="btn btn-danger btn-sm"\
                        :disabled="canDelete(user)" @click="deleteUser(user)">\
                  <i class="glyphicon glyphicon-trash"/>\
                </button>\
              </td>\
            </tr>\
          </tbody>\
        </table>\
      </div>\
    </div>\
  </div>',
  created: function () {
    this.$http.get("/api/users").then(response => {
      this.users = response.body;
    });
  },
  methods: {
    canDelete: user => {
      return User.getUser() === user.name;
    },
    deleteUser: function (user) {
      var confirm = window.confirm("Wollen Sie den Benutzer wirklich löschen?");

      if (confirm) {
        this.$http.delete("/api/user?name=" + user.name).then(response => {
          this.users = this.users.filter(u => u !== user);
        }, response => {
          window.alert("Benutzer konnte nicht gelöscht werden. Meldung: " + response.body);
        });
      }
    }
  }
}
