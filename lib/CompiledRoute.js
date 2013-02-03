/**
 * CompiledRoutes are returned by the RouteCompiler class.
 *
 * @constructor
 *
 * @param {string} staticPrefix The static prefix of the compiled route
 * @param {string} regex The regular expression to use to match this route
 * @param {Array} tokens An array of tokens to use to generate URL for this route
 * @param {Array} pathVariables An array of path variables
 * @param {string?} hostnameRegex Hostname regex
 * @param {Array=} hostnameTokens Hostname tokens
 * @param {Array=} hostnameVariables An array of hostname variables
 * @param {Array=} variables An array of variables (variables defined in the path and in the hostname patterns)
 */
function CompiledRoute(staticPrefix, regex, tokens, pathVariables, hostnameRegex, hostnameTokens, hostnameVariables, variables) {
    this._staticPrefix = staticPrefix;
    this._regex = regex;
    this._tokens = tokens;
    this._pathVariables = pathVariables;
    this._hostnameRegex = hostnameRegex || null;
    this._hostnameTokens = hostnameTokens || [];
    this._hostnameVariables = hostnameVariables || [];
    this._variables = variables || [];
}

/**
 * @type {string}
 * @protected
 */
CompiledRoute.prototype._staticPrefix = '';
/**
 * @type {string}
 * @protected
 */
CompiledRoute.prototype._regex = '';
/**
 * @type {Array}
 * @protected
 */
CompiledRoute.prototype._tokens = [];
/**
 * @type {Array}
 * @protected
 */
CompiledRoute.prototype._pathVariables = [];
/**
 * @type {string?}
 * @protected
 */
CompiledRoute.prototype._hostnameRegex = null;
/**
 * @type {Array}
 * @protected
 */
CompiledRoute.prototype._hostnameTokens = [];
/**
 * @type {Array}
 * @protected
 */
CompiledRoute.prototype._hostnameVariables = [];
/**
 * @type {Array}
 * @protected
 */
CompiledRoute.prototype._variables = [];

/**
 * Returns the static prefix
 *
 * @return {string} The static prefix
 */
CompiledRoute.prototype.getStaticPrefix = function () {
    return this._staticPrefix;
};

/**
 * Returns the regex
 *
 * @return {string} The regex
 */
CompiledRoute.prototype.getRegex = function () {
    return this._regex;
};

/**
 * Returns the hostname regex
 *
 * @return {string?} The hostname regex or null
 */
CompiledRoute.prototype.getHostnameRegex = function () {
    return this._hostnameRegex;
};

/**
 * Returns the tokens
 *
 * @return {Array} The tokens
 */
CompiledRoute.prototype.getTokens = function () {
    return this._tokens;
};

/**
 * Returns the hostname tokens
 *
 * @return {Array} The tokens
 */
CompiledRoute.prototype.getHostnameTokens = function () {
    return this._hostnameTokens;
};

/**
 * Returns the variables
 *
 * @return {Array} The variables
 */
CompiledRoute.prototype.getVariables = function () {
    return this._variables;
};

/**
 * Returns the path variables
 *
 * @return {Array} The variables
 */
CompiledRoute.prototype.getPathVariables = function () {
    return this._pathVariables;
};

/**
 * Returns the hostname variables
 *
 * @return {Array} The variables
 */
CompiledRoute.prototype.getHostnameVariables = function () {
    return this._hostnameVariables;
};

JSymfony.Routing.CompiledRoute = module.exports = CompiledRoute;
