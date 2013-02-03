var util = require('util');
var parent = JSymfony.InvalidArgumentError;

function RouteNotFoundError(message) {
    parent.call(this, message)
}

util.inherits(RouteNotFoundError, parent);

JSymfony.Routing.Error.RouteNotFoundError = module.exports = RouteNotFoundError;
