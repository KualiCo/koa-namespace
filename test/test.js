var koa = require('koa');
var request = require('supertest-as-promised');
var http = require('http');
var router = require('koa-router');
var namespace = require('../');
var Promise = require('bluebird');

describe('app.namespace(path, fn)', function() {

  it('fills in params', function() {
    var app = koa();
    app.use(router(app));
    namespace(app);
    app.namespace('/hurp/:durp', function() {
      app.get('/foo/:bar', function* () {
        this.body = {
          hurp: this.params.durp,
          foo: this.params.bar
        };
      });
    });

    var server = http.createServer(app.callback());
    return request(server).get('/hurp/whatitis/foo/yoyo').expect({hurp: 'whatitis', foo: 'yoyo'});
  });

  it('should not prefix root-level paths', function(){
    var app = koa();
    app.use(router(app));
    namespace(app);

    app.get('/one', function *(){
      this.body = 'GET one';
    });

    app.get('/some/two', function *(){
      this.body = 'GET two';
    });

    app.get(['/three', '/four'], function *() {
      this.body = 'GET three or four';
    })

    var server = http.createServer(app.callback());
    var promises = [
      request(server)
      .get('/one')
      .expect('GET one'),

      request(server)
      .get('/some/two')
      .expect('GET two'),

      request(server)
      .get('/three')
      .expect('GET three or four'),

      request(server)
      .get('/four')
      .expect('GET three or four')
    ];

    return Promise.all(promises);
  })

  it('should prefix within .namespace()', function() {
    var app = new koa();
    app.use(router(app));
    namespace(app);

    app.get('/one', function *(){
      this.body = 'GET one';
    });

    app.namespace('/foo', function(){
      app.get(function *(){
        this.body = 'foo';
      });

      app.namespace('/baz', function(){
        app.get(['/', '/alias'], function *(){
          this.body = 'GET baz';
        });

        app.del('/all', function *() {
          this.body = 'DELETE all baz';
        });
      })

      app.get('/bar', function *() {
        this.body = 'bar';
      });
    })

    app.get('/some/two', function *(){
      this.body = 'GET two';
    });

    var server = http.createServer(app.callback());

    var promises = [
      request(server)
      .get('/one')
      .expect('GET one'),

      request(server)
      .get('/some/two')
      .expect('GET two'),

      request(server)
      .get('/foo')
      .expect('foo'),

      request(server)
      .get('/foo/baz')
      .expect('GET baz'),

      request(server)
      .get('/foo/baz/alias')
      .expect('GET baz'),

      request(server)
      .del('/foo/baz/all')
      .expect('DELETE all baz'),

      request(server)
      .get('/foo/bar')
      .expect('bar')
    ];
    return Promise.all(promises);
  });
})
