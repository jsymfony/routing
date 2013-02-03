require('js-yaml');

var util = require('util');
var fs = require('fs');
var path = require('path');
var JSFileLoader = JSymfony.Routing.Loader.JsFileLoader;

/**
 * @constructor
 * @extends {JSymfony.Routing.Loader.JsFileLoader}
 */
function YamlFileLoader(locator) {
    JSFileLoader.call(this, locator)
}

util.inherits(YamlFileLoader, JSFileLoader);

YamlFileLoader.prototype.supports = function (file, type) {
    if (typeof file !== 'string') {
        return false;
    }
    var ext = path.extname(file);
    return  ext === '.yml' || ext === '.yaml';
};

JSymfony.Routing.Loader.YamlFileLoader = module.exports = YamlFileLoader;
