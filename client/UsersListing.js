var User = require("./User.js");

module.exports = {
  name: "UsersListing",
  data: function () {
    return {
      users: [],
      descending: false,
    };
  },
  template: '\
  <div>\
    <div class="row">\
      <div class="col-xs-6">\
        <div class="btn-group">\
          <router-link class="btn btn-default" :to="{ path: \'user/new\' }">\
            <i class="glyphicon glyphicon-plus" /> {{ $t("users.new") }}\
          </router-link>\
        </div>\
      </div>\
    </div>\
\
    <table class="table table-striped table-hover" style="margin-top: 20px;">\
      <thead>\
        <tr>\
          <th class="col-sm-5"><a @click="order(\'name\')">{{ $t("users.name") }}</a></th>\
          <th class="col-sm-4"><a @click="order(\'mail\')">{{ $t("users.mail") }}</a></th>\
          <th class="col-sm-1"><a @click="order(\'admin\')">{{ $t("users.admin") }}</a></th>\
          <th class="col-sm-2"></th>\
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
  </div>',
  created: function () {
    this.$http.get("/api/users").then(response => {
      this.users = response.body;
    });
  },
  methods: {
    order: function (key) {
      this.users.sort((a, b) => {
        var obj1 = (typeof a[key] === 'string' || a[key] instanceof String) ? a[key].toLowerCase() : a[key];
        var obj2 = (typeof b[key] === 'string' || b[key] instanceof String) ? b[key].toLowerCase() : b[key];

        return this.descending ? obj1 <= obj2 : obj1 > obj2;
      });
      this.descending = !this.descending;
    },
    canDelete: user => {
      return User.getUser() === user.name;
    },
    deleteUser: function (user) {
      var confirm = window.confirm(Vue.t("users.messages.confirmDelete"));

      if (confirm) {
        this.$http.delete("/api/user?name=" + user.name).then(response => {
          this.users = this.users.filter(u => u !== user);
        }, response => {
          window.alert(Vue.t("users.messages.couldNotDelete") + response.body);
        });
      }
    }
  }
}
