var util = require('util');
var fn = JSymfony.fn;
/**
 * A Route describes a route and its parameters.
 *
 * @constructor
 *
 * @param {string} path
 * @param {Object.<string, *>=} defaults
 * @param {Object.<string, string>=} requirements
 * @param {string} hostname
 * @param {Array.<string>} schemes
 * @param {Array.<string>} methods
 */
function Route(path, defaults, requirements, hostname, schemes, methods) {
    this.setPath(path);
    this.setDefaults(defaults);
    this.setRequirements(requirements);
    this.setHostname(hostname);
    this.setSchemes(schemes);
    this.setMethods(methods);
}

/**
 * @type {string}
 * @protected
 */
Route.prototype._path = '/';

/**
 * @type {string}
 * @protected
 */
Route.prototype._hostname = '';

/**
 * @type {Array.<string>}
 * @protected
 */
Route.prototype._schemes = [];

/**
 * @type {Array.<string>}
 * @protected
 */
Route.prototype._methods = [];

/**
 * @type {Object.<string, *>}
 * @protected
 */
Route.prototype._defaults = {};

/**
 * @type {Object.<string, string>}
 * @protected
 */
Route.prototype._requirements = {};

/**
 * @type {JSymfony.Routing.CompiledRoute?}
 * @protected
 */
Route.prototype._compiled = null;

/**
 * Returns pattern for the path
 *
 * @return {string}
 */
Route.prototype.getPath = function () {
    return this._path;
};

/**
 * Sets the pattern for the path
 *
 * @param {string} pattern
 *
 * @return {Route}
 */
Route.prototype.setPath= function (pattern) {
    this._path = '/' + fn.ltrim(fn.trim(pattern), '/');
    this._compiled = null;
    return this;
};

/**
 * Returns the pattern for the hostname
 *
 * @return {string}
 */
Route.prototype.getHostname = function() {
    return this._hostname;
};

/**
 * Sets the pattern for the hostname.
 *
 * @param pattern
 *
 * @return {Route}
 */
Route.prototype.setHostname = function (pattern) {
    this._hostname = pattern || '';
    this._compiled = null;
    return this;
};

/**
 * Returns the lowercased schemes this route is restricted to.
 * So an empty array means that any scheme is allowed.
 *
 * @return {Array.<string>}
 */
Route.prototype.getSchemes = function () {
    return this._schemes;
};

/**
 * Sets the schemes (e.g. 'https') this route is restricted to.
 * So an empty array means that any scheme is allowed.
 *
 * @param {string|Array.<string>} schemes The scheme or an array of schemes
 *
 * @return {Route}
 */
Route.prototype.setSchemes = function (schemes) {
    this._schemes = fn.castArray(schemes).map(function (scheme) {
        return scheme.toLowerCase();
    });

    this._compiled = null;

    return this;
};

/**
 * Returns the uppercased HTTP methods this route is restricted to.
 * So an empty array means that any method is allowed.
 *
 * @return {Array.<string>} The schemes
 */
Route.prototype.getMethods = function () {
    return this._methods;
};

/**
 * Sets the HTTP methods (e.g. 'POST') this route is restricted to.
 * So an empty array means that any method is allowed.
 *
 * @param {string|Array.<string>} methods The method or an array of methods
 *
 * @return {Route}
 */
Route.prototype.setMethods = function (methods) {
    this._methods = fn.castArray(methods).map(function (method) {
        return method.toLowerCase();
    });

    this._compiled = null;

    return this;
};

/**
 * Return the defaults
 *
 * @return {Object.<string, *>}
 */
Route.prototype.getDefaults = function() {
    return this._defaults;
};

/**
 * Sets the defaults
 *
 * @param {Object.<string, *>} defaults The defaults
 *
 * @return {Route}
 */
Route.prototype.setDefaults = function (defaults) {
    this._defaults = {};

    return this.addDefaults(defaults);
};

/**
 * Adds defaults
 *
 * @param {Object.<string, *>} defaults The defaults
 *
 * @return {Route}
 */
Route.prototype.addDefaults = function (defaults) {
    if (!defaults) {
        return this;
    }

    for (var name in defaults) {
        if (!defaults.hasOwnProperty(name)) {
            continue;
        }
        this._defaults[name] = defaults[name];
    }
    this._compiled = null;

    return this;
};

/**
 * Gets a default value
 *
 * @param {string} key A variable name
 *
 * @return {*}
 */
Route.prototype.getDefault = function(key) {
    return this._defaults[key];
};

/**
 * Checks if a default value is set for the given variable.
 *
 * @param {string} key A variable name
 *
 * @return {boolean}
 */
Route.prototype.hasDefault = function(key) {
    return this._defaults.hasOwnProperty(key);
};

/**
 * Sets a default value
 *
 * @param {string} key A variable name
 *
 * @param {*} value The default value
 *
 * @return {Route}
 */
Route.prototype.setDefault = function(key, value) {
    this._defaults[key] = value;
    this._compiled = null;
    return this;
};

/**
 * Returns the requirements
 *
 * @return {Object.<string, string>}
 */
Route.prototype.getRequirements = function() {
    return this._requirements;
};


/**
 * Sets the requirements.
 *
 * @param {Object.<string, string>} requirements The requirements
 *
 * @return {Route}
 */
Route.prototype.setRequirements = function(requirements) {
        this._requirements = {};
        return this.addRequirements(requirements);
};

/**
 * Adds requirements
 *
 * @param  {Object.<string, string>} requirements The requirement
 *
 * @return {*}
 */
Route.prototype.addRequirements = function (requirements) {
    if (!requirements) {
        return this;
    }

    for (var key in requirements) {
        if (!requirements.hasOwnProperty(key)) {
            continue;
        }
        this._requirements[key] = this._sanitizeRequirement(key, requirements[key]);
    }
    this._compiled = null;

    return this;
};

/**
 * Returns the requirement for the given key.
 *
 * @param {string} key The key
 *
 * @return {string?} The regex string or undefined when not given
 */
Route.prototype.getRequirement = function(key) {
    if (!this.hasRequirement(key)) {
        return null;
    }
    return this._requirements[key];
};

/**
 * Checks if a requirement is set for the given key.
 *
 * @param {string} key A variable name
 *
 * @return {boolean}
 */
Route.prototype.hasRequirement = function (key) {
    return this._requirements.hasOwnProperty(key);
};

/**
 * Sets a requirement for the given key
 *
 * @param {string} key The key
 *
 * @param {string} regex The regex
 *
 * @return {*}
 */
Route.prototype.setRequirement = function (key, regex) {
    this._requirements[key] = this._sanitizeRequirement(key, regex);
    this._compiled = null;

    return this;
};


/**
 * Compiles the route.
 *
 * @return {JSymfony.Routing.CompiledRoute} A CompiledRoute instance
 *
 * @throws {JSymfony.LogicError} If the Route cannot be compiled because the path or hostname pattern is invalid
 */
Route.prototype.compile = function () {
    if (this._compiled) {
        return this._compiled;
    }
    var compiler = new JSymfony.Routing.RouteCompiler();
    return this._compiled = compiler.compile(this);
};

/**
 *
 * @param {string} key
 * @param {string} regex
 *
 * @return {string}
 *
 * @throws {JSymfony.InvalidArgumentError}
 *
 * @private
 */
Route.prototype._sanitizeRequirement = function(key, regex) {
    if (typeof regex !== 'string') {
        throw new JSymfony.InvalidArgumentError('Routing requirement for "' + key + '" must be a string.');
    }
    if ('' !== regex && '^' === regex[0]) {
        regex = regex.substring(1);
    }

    if ('$' === regex.slice(-1)) {
        regex = regex.slice(0, -1);
    }

    if ('' === regex) {
        throw new JSymfony.InvalidArgumentError('Routing requirement for "' + key +'" cannot be empty.');
    }

    return regex;
};

JSymfony.Routing.Route = module.exports = Route;
