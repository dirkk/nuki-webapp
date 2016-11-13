module.exports = {
  name: "NewUser",
  data: function () {
    return {
      name: null,
      mail: null,
      admin: false,
      times: [],
      invitation: null,
      error: null
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
    <div class="alert alert-success" v-if="invitation">\
      Der Nutzer wurde erfolgreich erstellt. Der Einladungscode ist \
      {{ invitation }}. <a class="alert-link" :href="mailTo">Einladung verschicken.</a>\
    </div>\
    <div class="alert alert-danger" v-if="error">\
      {{ error }}\
    </div>\
  </div>',
  computed: {
    canBeSaved: function () {
      return !!this.name && !!this.mail && !this.invitation;
    },
    mailTo: function () {
      var subject = "Zugang zum Café Mondial";
      var body = encodeURIComponent("Hallo " + this.name + ",\n\nDein Einladungscode ist " +
        this.invitation + " und du kannst diese unter " + window.location.protocol +
        "//" + window.location.host + "/acceptInvitation?token=" + this.invitation +
        " annehmen.\n\nViele Grüße\nCafé Mondial");
      return "mailto:" + this.mail + "?subject=" + subject + "&body=" + body;
    }
  },
  methods: {
    save: function (event) {
      if (!this.canBeSaved) return;

      this.error = null;
      this.invitation = null;
      this.$http.post('/api/newUser', {
        name: this.name,
        admin: this.admin,
        mail: this.mail
      }).then(response => {
        this.invitation = response.body.invitation.token;
      }, response => {
        this.error = response.body;
      });
    }
  }
}
