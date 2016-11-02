module.exports = { 
  name: "Protocol",
  data: function () {
    return { };
  },
  template: '\
  <div>\
    <table class="table table-striped table-hover">\
      <thead>\
        <th>Date</th>\
        <th>Text</th>\
      </thead>\
      <tbody>\
        <tr v-for="entry in entries">\
          <td>{{ entry.date }}</td>\
          <td>{{ entry.text }}</td>\
        </tr>\
      </tbody>\
    </table>\
  </div>',
  computed: {
    entries: function () {
      this.$http.get("/api/protocol").then(function (response) {
        this.entries = response;
      }, function (response) {
        console.log("COuld not load protocl entries.");
        console.log(response);
      });
    }
  }
}
