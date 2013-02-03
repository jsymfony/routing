var util = require('util');
var _ = require('lodash');
var querystring = require('querystring');

/**
 * UrlGenerator can generate a URL or a path for any route in the RouteCollection based on the passed parameters.
 *
 * @param {JSymfony.Routing._routeCollection} routeCollection
 * @param {JSymfony.Routing.RequestContext} context
 * @constructor
 */
function UrlGenerator(routeCollection, context) {
    this._routeCollection = routeCollection;
    this._context = context;
    this.strictRequirements = true;
}

/**
 * This array defines the characters (besides alphanumeric ones) that will not be percent-encoded in the path segment of the generated URL.
 *
 * PHP's rawurlencode() encodes all chars except "a-zA-Z0-9-._~" according to RFC 3986. But we want to allow some chars
 * to be used in their literal form (reasons below). Other chars inside the path must of course be encoded, e.g.
 * "?" and "#" (would be interpreted wrongly as query and fragment identifier),
 * "'" and """ (are used as delimiters in HTML).
 */
UrlGenerator.prototype.decodedChars = {
    // the slash can be used to designate a hierarchical structure and we want allow using it with this meaning
    // some webservers don't allow the slash in encoded form in the path for security reasons anyway
    // see http://stackoverflow.com/questions/4069002/http-400-if-2f-part-of-get-url-in-jboss
    '%2F': '/',
    // the following chars are general delimiters in the URI specification but have only special meaning in the authority component
    // so they can safely be used in the path in unencoded form
    '%40': '@',
    '%3A': ':',
    // these chars are only sub-delimiters that have no predefined meaning and can therefore be used literally
    // so URI producing applications can use these chars to delimit subcomponents in a path segment without being encoded for better readability
    '%3B': ';',
    '%2C': ',',
    '%3D': '=',
    '%2B': '+',
    '%21': '!',
    '%2A': '*',
    '%7C': '|'
};

UrlGenerator.prototype.generate = function (name, parameters, absolute) {
    parameters = parameters || {};

    var route = this._routeCollection.get(name);
    if (!route) {
        throw new JSymfony.Routing.Error.RouteNotFoundError(util.format('Route "%s" does not exist.', name));
    }

    return this.doGenerate(route, parameters, name, absolute);
};

UrlGenerator.prototype.setContext = function (context) {
    this._context = context;
};

UrlGenerator.prototype.doGenerate = function (route, parameters, name, absolute) {
    var compiledRoute = route.compile();
    var defaults = route.getDefaults();
    var variables = compiledRoute.getVariables();

    var mergedParams = _.extend({}, defaults, this._context.getParameters(), parameters);

    var diff = _.difference(variables, Object.keys(mergedParams));
    if (diff.length) {
        throw new JSymfony.Routing.Error.MissingMandatoryParametersError(util.format('The "%s" route has some missing mandatory parameters ("%s").', name, diff.join('", "')));
    }
    var url = '';
    var optional = true;
    var tokens = compiledRoute.getTokens();
    for (i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        var varName = token[3];
        if ('variable' === token[0]) {
            if (!optional || !defaults.hasOwnProperty(varName) || mergedParams[varName] != defaults[varName]) {
                if (this.strictRequirements && !new RegExp('^' + token[2] + '$').test(mergedParams[varName])) {
                    throw new core.lib.routing.RoutingError(util.format('Parameter "%s" for route "%s" must match "%s" ("%s" given).', varName, name, token[2], mergedParams[varName]));
                }

                url = token[1] + mergedParams[varName] + url;
                optional = false;
            }
        } else {
            url = token[1] + url;
            optional = false;
        }
    }

    if (!url) {
        url = '/';
    }

    url = this._context.getBaseUrl() + JSymfony.fn.strtr(encodeURIComponent(url), this.decodedChars);

    // the path segments "." and ".." are interpreted as relative reference when resolving a URI; see http://tools.ietf.org/html/rfc3986#section-3.3
    // so we need to encode them as they are not used for this purpose here
    // otherwise we would generate a URI that, when followed by a user agent (e.g. browser), does not match this route
    url = JSymfony.fn.strtr(url, {'/../': '/%2E%2E/', '/./': '/%2E/'});
    if ('/..' === url.slice(-3)) {
        url = url.slice(0, -2) + '%2E%2E';
    } else if ('/.' === url.slice(-2)) {
        url = url.slice(0, -1) + '%2E';
    }

    // add a query string if needed
    var extra = _.difference(Object.keys(parameters), variables);
    if (extra.length) {
        var query = querystring.stringify(parameters);
        if (query) {
            url += '?' + query;
        }
    }

    var host = this._context.getHost();

    if (host) {
        var scheme = this._context.getScheme();
        var requirements = route.getRequirements();
        if (requirements.hasOwnProperty('_scheme')) {
            var req = requirements._scheme.toLowerCase();
            if (req != scheme) {
                absolute = true;
                scheme = requirements
            }
        }
        var hostnameTokens = compiledRoute.getHostnameTokens();
        if (hostnameTokens.length) {
            var routeHost = '';
            for (var i = 0; i < hostnameTokens.length; i++) {
                token  = hostnameTokens[i];
                if ('variable' === token[0]) {
                    if (this.strictRequirements && !new RegExp('^' + token[2] + '$').test(mergedParams[token[3]])) {
                        throw new core.lib.routing.RoutingError(util.format('Parameter "%s" for route "%s" must match "%s" ("%s" given).', token[3], name, token[2], mergedParams[token[3]]));
                    }
                    routeHost = token[1] + mergedParams[token[3]] + routeHost;
                } else if ('text' === token[0]) {
                    routeHost = token[1] + routeHost;
                }
            }
            if (routeHost != host) {
                host = routeHost;
                absolute = true;
            }
        }

        if (absolute) {
            var port = '';
            if ('http' === scheme && 80 != this._context.getHttpPort()) {
                port = ':' + this._context.getHttpPort();
            } else if ('https' === scheme && 443 != this._context.getHttpsPort()) {
                port = ':' + this._context.getHttpsPort();
            }

            url = scheme + '://' + host + port + url;
        }
    }

    return url;
};

JSymfony.Routing.UrlGenerator = module.exports = UrlGenerator;
