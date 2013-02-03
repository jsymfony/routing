var util = require('util');
var parent = JSymfony.InvalidArgumentError;

function MissingMandatoryParametersError(message) {
    parent.call(this, message)
}

util.inherits(MissingMandatoryParametersError, parent);

JSymfony.Routing.Error.MissingMandatoryParametersError = module.exports = MissingMandatoryParametersError;
