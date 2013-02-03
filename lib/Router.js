/**
 * The Router class is an example of the integration of all pieces of the routing system for easier use
 *
 * @param {JSymfony.Routing.RouteCollection} routeCollection
 * @param {JSymfony.Routing.RequestContext} context
 * @constructor
 */
function Router(routeCollection, context) {
    this._routeCollection = routeCollection;
    this._context = context || new JSymfony.Routing.RequestContext();
    this._matcher = null;
    this._generator = null;
}

Router.prototype.getRouteCollection = function () {
    return this._routeCollection;
};

Router.prototype.setContext = function (context) {
    this._context = context;

    if (this._matcher) {
        this._matcher.setContext(context);
    }

    if (this._generator) {
        this._generator.setContext(context);
    }
};

Router.prototype.getContext = function () {
    return this._context;
};

Router.prototype.generate = function (name, parameters, absolute) {
    return this.getGenerator().generate(name, parameters, absolute);
};

Router.prototype.match = function (uri) {
    return this.getMatcher().match(uri);
};

Router.prototype.getMatcher = function () {
    if (!this._matcher) {
        this._matcher = new JSymfony.Routing.UrlMatcher(this.getRouteCollection(), this._context);
    }
    return this._matcher;
};

Router.prototype.getGenerator = function () {
    if (!this._generator) {
        this._generator = new JSymfony.Routing.UrlGenerator(this.getRouteCollection(), this._context);
    }
    return this._generator;
};

Router.prototype.setMatcher = function (matcher) {
    this._matcher = matcher;
};

Router.prototype.setGenerator = function (generator) {
    this._generator = generator;
};



JSymfony.Routing.Router = module.exports = Router;
