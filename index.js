/**
 * Module dependencies.
 */

var methods = require('methods').concat('all');

function koaNamespace(app) {
  if (!app.all) {
    throw new Error('must use koa-router first!');
  }

  app.namespace = namespace;

  methods.forEach(function(method) {
    var orig = app[method];
    app[method] = function koaNamespaceRouteMethod() {
      var args = Array.prototype.slice.call(arguments)
        , path = args.shift()
        , self = this;


      // if there is only one arg, it is a handler mounted below a
      // namespace call. this means we just want to resolve the path
      // to the namespace.
      if (arguments.length == 1) {
        args.unshift(path);
        path = '';
      }

      // koa-router allows arrays of routes
      path = Array.isArray(path) ? path : [path];

      // map paths route handlers get to fully qualified namespace paths
      path = path.map(function(p) {
        app.namespace(p, function() {
          p = this._ns.join('/').replace(/\/\//g, '/').replace(/\/$/, '') || '/';
        });
        return p;
      });

      // jam path back on the front, wooo
      args.unshift(path);
      return orig.apply(this, args);
    };
  });
}

/**
 * Namespace using the given `path`, providing a callback `fn()`,
 * which will be invoked immediately, resetting the namespace to the previous.
 *
 * @param {String} path
 * @param {Function} fn
 * @return {Server} for chaining
 * @api public
 */
function namespace() {
  var args = Array.prototype.slice.call(arguments)
    , path = args.shift()
    , fn = args.pop()
    , self = this;

  if (args.length) self.all(path, args);
  if (args.length) self.all(path + '/*', args);
  (this._ns = this._ns || []).push(path);
  fn.call(this);
  this._ns.pop();
  return this;
}

module.exports = koaNamespace;
