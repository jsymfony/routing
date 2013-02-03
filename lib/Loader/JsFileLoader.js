var util = require('util');
var path = require('path');
var _ = require('lodash');
var FileLoader = JSymfony.Config.Loader.FileLoader;
var Route = JSymfony.Routing.Route;

/**
 * @constructor
 * @extends {JSymfony.Config.Loader.FileLoader}
 */
function JsFileLoader(locator) {
    FileLoader.call(this, locator);
}

util.inherits(JsFileLoader, FileLoader);

/**
 * @type {Array}
 * @protected
 */
JsFileLoader.prototype._availableKeys = ['resource', 'type', 'prefix', 'pattern', 'path', 'hostname', 'schemes', 'methods', 'defaults', 'requirements', 'options']

/**
 * Loads a Js file
 *
 * @param {string} file
 * @param {string} type
 *
 * @return {JSymfony.Routing.RouteCollection}
 */

JsFileLoader.prototype.load = function (file, type) {
    var path = this._locator.locate(file);

    var configs = this.loadFile(path);

    var collection = new JSymfony.Routing.RouteCollection();


    for (var name in configs) {
        if (!configs.hasOwnProperty(name)) {
            continue;
        }
        var config = configs[name];

        this.validate(config, name, path);

        if (config.resource) {
            this._parseImport(collection, config, path, file)
        } else {
            this._parseRoute(collection, name, config, path);
        }
    }

    return collection;
};

/**
 * Loads a js file
 * @param {string} path
 *
 * @return {Object}
 */
JsFileLoader.prototype.loadFile = function (path) {
    return require(path);
};

/**
 * Returns true if this class supports the given resource.
 *
 * @param {string} file
 * @param {string} type
 *
 * @return {boolean}
 */
JsFileLoader.prototype.supports = function (file, type) {
    return typeof file === 'string' && path.extname(file) === '.js';
};

/**
 * Parses a route and adds it to the RouteCollection.
 *
 * @param {JSymfony.Routing.RouteCollection} collection
 * @param {string} name
 * @param {Object} config
 * @param {string} path
 * @protected
 */
JsFileLoader.prototype._parseRoute = function (collection, name, config, path) {
    var route = new Route(config.path, config.defaults, config.requirements, config.options, config.hostname, config.schemes, config.methods);
    collection.add(name, route);
};

/**
 *
 * @param {JSymfony.Routing.RouteCollection} collection
 * @param {Object} config
 * @param {string} filePath
 * @param {string} file
 * @protected
 */
JsFileLoader.prototype._parseImport = function (collection, config, filePath, file) {
    this.setCurrentDir(path.dirname(filePath));

    var subCollection = this.import(config.resource, type, file);
    if (config.prefix) {
        subCollection.addPrefix(config.prefix);
    }
    if (config.hostname) {
        subCollection.setHostname(config.hostname);
    }
    if (config.schemes) {
        subCollection.setSchemes(config.schemes);
    }
    if (config.methods) {
        subCollection.setMethods(config.methods);
    }
    if (config.defaults) {
        subCollection.addDefaults(config.defaults);
    }
    if (config.requirements) {
        subCollection.addRequirements(config.requirements);
    }

    collection.addCollection(subCollection);
};

/**
 * Validates the route configuration.
 *
 * @param {Object} config
 * @param {string} name
 * @param {string} path
 */
JsFileLoader.prototype.validate = function (config, name, path) {
    if (typeof config !== 'object') {
        throw new JSymfony.InvalidArgumentError('Invalid definition of "' + name + '" in "' + path + '"');
    }

    var extraKeys = _.difference(Object.keys(config), this._availableKeys);
    if (extraKeys.length) {
        throw new JSymfony.InvalidArgumentError(JSymfony.fn.sprintf(
            'The routing file "%s" contains unsupported keys for "%s": "%s". Expected one of: "%s".',
            path, name, extraKeys.join('", "'), this._availableKeys.join('", "')
        ));
    }

    if (config.resource && config.path) {
        throw new JSymfony.InvalidArgumentError(JSymfony.fn.sprintf(
            'The routing file "%s" must not specify both the "resource" key and the "path" key for "%s". Choose between an import and a route definition.',
            path, name
        ));
    }

    if (!config.resource && !config.path) {
        throw new JSymfony.InvalidArgumentError(JSymfony.fn.sprintf(
            'You must define a "path" for the route "%s" in file "%s".',
            name, path
        ));
    }
};


JSymfony.Routing.Loader.JsFileLoader = module.exports = JsFileLoader;
