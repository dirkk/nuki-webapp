module.exports = {
  name: "UsersListing",
  data: function () {
    return {
      users: []
    };
  },
  template: '\
  <div>\
    <div class="btn-group">\
      <router-link class="btn btn-default" :to="{ path: \'user/new\' }">\
        <i class="glyphicon glyphicon-plus" /> Neu\
      </router-link>\
    </div>\
\
    <table class="table table-striped table-hover">\
      <thead>\
        <th class="col-xs-6">Name</th>\
        <th class="col-xs-4">Mail</th>\
        <th class="col-xs-1">Admin</th>\
        <th class="col-xs-1"></th>\
      </thead>\
      <tbody>\
        <tr v-for="user in users">\
          <td>{{ user.name }}</td>\
          <td>{{ user.mail }}</td>\
          <td>\
            <i class="glyphicon glyphicon-ok" v-if="user.admin" />\
          </td>\
          <td>\
            <router-link class="btn btn-warning btn-sm"\
              :to="{ name: \'editUser\', params: { name: 123 }}">\
              <i class="glyphicon glyphicon-pencil"/>\
            </router-link>\
          </td>\
        </tr>\
      </tbody>\
    </table>\
  </div>',
  created: function () {
    this.$http.get("/api/users").then((response) => {
      this.users = response.body;
    })
  },
  methods: {
    delete: function (event) {
    }
  }
}
