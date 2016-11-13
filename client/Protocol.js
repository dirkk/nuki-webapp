module.exports = {
  name: "Protocol",
  data: function () {
    return {
      entries: []
    };
  },
  template: '\
  <div>\
    <table class="table table-striped table-hover">\
      <thead>\
        <th class="col-xs-7">Text</th>\
        <th class="col-xs-5">Date</th>\
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
  }
}
