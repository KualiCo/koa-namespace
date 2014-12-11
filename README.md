#koa-namespace

Nested namespaces for [koa](http://koajs.com) apps using
[koa-router](https://github.com/alexmingoia/koa-router).

## Installation

```bash
npm i --save koa-namespace
```

## Usage

```JavaScript
var koa = require('koa');
var router = require('koa-router');
var namespace = require('koa-namespace');

var app = koa();

app.use(router(app));
namespace(app);

app.namespace('/foo', function() {
  app.get('/bar', function* (next) {
    // this will be served under /foo/bar
  });

  // you can nest namespaces
  app.namespace('/beans', function() {
    app.del('/baz', function* () {

    });

    // if you leave off the path it will be default to the namespace
    app.get(function* (next) {
      // will be served at /bar/beans
    });
  });
});

// namespaces can have url parameters
app.namespace('/something/:id', function() {
  app.get('/another/:thing', function* () {
    //this.params.id and this.params.thing will both be set
  });
});
```

This is inspired by [express-namespace](https://github.com/expressjs/express-namespace)
and [koa-router-namespace](https://github.com/chenboxiang/koa-router-namespace).
