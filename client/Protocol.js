module.exports = {
  name: "Protocol",
  data: function () {
    return {
      entries: [],
      descending: false,
    };
  },
  template: '\
  <div>\
    <table class="table table-striped table-hover">\
      <thead>\
        <tr>\
          <th class="col-sm-7"><a @click="order(\'text\')">{{ $t("protocol.text") }}</a></th>\
          <th class="col-sm-5"><a @click="order(\'date\')">{{ $t("protocol.date") }}</a></th>\
        </tr>\
      </thead>\
      <tbody>\
        <tr v-for="entry in entries">\
          <td>{{ entry.text }}</td>\
          <td>{{ entry.date | date(\'LLL\') }}</td>\
        </tr>\
      </tbody>\
    </table>\
  </div>',
  created: function () {
    this.$http.get("/api/protocol").then(response => {
      this.entries = response.body;
    }, response => {
      console.log("Could not load protocol entries.");
      console.log(response);
    });
  },
  methods: {
    order: function (key) {
      this.entries.sort((a, b) => {
        var obj1 = (typeof a[key] === 'string' || a[key] instanceof String) ? a[key].toLowerCase() : a[key];
        var obj2 = (typeof b[key] === 'string' || b[key] instanceof String) ? b[key].toLowerCase() : b[key];

        return this.descending ? obj1 <= obj2 : obj1 > obj2;
      });
      this.descending = !this.descending;
    }
  }
}
