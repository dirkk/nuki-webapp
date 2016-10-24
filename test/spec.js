var request = require('supertest');
var should  = require('should')
var url = "http://localhost:3000";

describe('Loading express js', function () {
  it('responds to /', function (done) {
    request(url)
      .get('/')
      .expect(200, done);
  });
});

describe('POST /login', function () {
  it('logs in as normal user correctly', function (done) {
    request(url)
      .post('/login')
      .send({user: "user", password: "password"})
      .expect(200)
      .end(function(err, res) {
        if (err) done(err);
        res.header['location'].should.include('/toggle')
        // res.body.should.have.property('OK');
        done();
      });
  });
});
