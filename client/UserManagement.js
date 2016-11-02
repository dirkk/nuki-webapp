module.exports = { 
  name: "UserManagement",
  data: function () {
    return {
      users: [
        { name: "Max Mustermann", mail: "man@test.de" },
        { name: "Max Mustermann", mail: "man@test.de" },
        { name: "Max Müller", mail: "man@test.de" },
        { name: "Max Mustermann", mail: "man@test.de" },
      ]
    };
  },
  template: '\
  <div>\
    <div class="btn-group">\
      <a class="btn btn-default" href="#/new-user">\
        <i class="glyphicon glyphicon-plus" /> Neu\
      </a>\
    </div>\
\
    <table class="table table-striped table-hover">\
      <thead>\
        <th>Name</th>\
        <th>Mail</th>\
      </thead>\
      <tbody>\
        <tr v-for="user in users">\
          <td>{{ user.name }}</td>\
          <td>{{ user.mail }}</td>\
        </tr>\
      </tbody>\
    </table>\
  </div>',
  methods: {
    delete: function (event) {
    }
  }
}
