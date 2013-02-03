var util = require('util');
var fn = JSymfony.fn;
/**
 * A RouteCollection represents a set of Route instances.
 *
 * When adding a route at the end of the collection, an existing route
 * with the same name is removed first. So there can only be one route
 * with a given name.
 *
 * @constructor
 */
function RouteCollection() {
    /**
     * @type {Object.<string, JSymfony.Routing.Route>}
     * @protected
     */
    this._routes = {};
}

/**
 * @param {string} name The route name
 * @param {JSymfony.Routing.Route} route A Route instance
 */
RouteCollection.prototype.add = function (name, route) {
    this._routes[name] = route;
};

/**
 * Returns all routes in this collection.
 *
 * @return {Object.<string, JSymfony.Routing.Route>}
 */
RouteCollection.prototype.all = function () {
    return this._routes;
};

RouteCollection.prototype.get = function (name) {
    return this._routes.hasOwnProperty(name) ? this._routes[name] : null;
};

/**
 * Removes a route or an array of routes by name from the collection
 *
 * @param {string|Array.<string>} name The route name or an array of route names
 */
RouteCollection.prototype.remove = function (name) {
    var self = this;

    fn.castArray(name).forEach(function (name) {
        delete self._routes[name];
    });
};

/**
 * Adds a route collection at the end of the current set by appending all
 * routes of the added collection.
 *
 * @param {RouteCollection} collection A RouteCollection instance
 */
RouteCollection.prototype.addCollection = function (collection) {
    var self = this;
    collection.forEach(function (name, route) {
        self.add(name, route);
    });
};

/**
 * Adds a prefix to the path of all child routes.
 *
 * @param {string} prefix
 */
RouteCollection.prototype.addPrefix = function (prefix) {
    prefix = fn.trim(fn.trim(prefix), '/');
    if (!prefix) {
        return;
    }
    var routes = this._routes;
    this.forEach(function (name, route) {
        route.setPath('/' + prefix + route.getPath());
    });
};

/**
 * Sets the hostname pattern on all routes.
 *
 * @param {string} pattern      The pattern
 * @param {Object.<string, *>}  defaults     An array of default values
 * @param {Object.<string, string>}  requirements An array of requirements
 */
RouteCollection.prototype.setHostname = function (pattern, defaults, requirements) {
    this.forEach(function (name, route) {
        route.setHostname(pattern);
        route.addDefaults(defaults);
        route.addRequirements(requirements);
    });
};

/**
 * Adds defaults to all routes.
 *
 * An existing default value under the same name in a route will be overridden.
 *
 * @param {Object.<string, *>}  defaults An array of default values
 */
RouteCollection.prototype.addDefaults = function (defaults) {
    this.forEach(function (name, route) {
        route.addDefaults(defaults);
    });
};

/**
 * Adds requirements to all routes.
 *
 * An existing requirement under the same name in a route will be overridden.
 *
 * @param {Object.<string, string>}  requirements An array of requirements
 */
RouteCollection.prototype.addDefaults = function (requirements) {
    this.forEach(function (name, route) {
        route.addRequirements(requirements);
    });
};

/**
 * Sets the schemes (e.g. 'https') all child routes are restricted to.
 * @param {string|Array.<string>} schemes The scheme or an array of schemes
 */
RouteCollection.prototype.setSchemes = function (schemes) {
    this.forEach(function (name, route) {
        route.setSchemes(schemes);
    });
};

/**
 * Sets the HTTP methods (e.g. 'POST') all child routes are restricted to.
 *
 * @param {string|Array.<string>} methods The method or an array of methods
 */
RouteCollection.prototype.setMethods = function (methods) {
    this.forEach(function (name, route) {
        route.setMethods(methods);
    });
};


/**
 * Iterates over a route collection
 *
 * @param {function(string, JSymfony.Routing.Route)} callback Callback function
 */
RouteCollection.prototype.forEach = function (callback) {
    for (var name in this._routes) {
        if (!this._routes.hasOwnProperty(name)) {
            continue;
        }
        var res = fn.call(callback, name, this._routes[name]);
        if (res === false) {
            return;
        }
    }
};

JSymfony.Routing.RouteCollection = module.exports = RouteCollection;
