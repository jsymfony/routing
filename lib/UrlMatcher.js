var _ = require('lodash');

/**
 * UrlMatcher matches URL based on a set of routes.
 * @param {JSymfony.Routing.RouteCollection} routeCollection
 * @param {JSymfony.Routing.RequestContext} context
 * @constructor
 */
function UrlMatcher(routeCollection, context) {
    this._routeCollection = routeCollection;
    this._context = context;
}

UrlMatcher.prototype.setContext = function (context) {
    this._context = context;
};

UrlMatcher.prototype.getContext = function () {
    return this._context;
};

UrlMatcher.prototype.match = function (uri) {
    return this.matchCollection(uri, this._routeCollection);
};

UrlMatcher.prototype.matchCollection = function (uri, routeCollection) {
    var foundRoute = null;
    var self = this;
    routeCollection.forEach(function (name, route) {
        var compiledRoute = route.compile();

        if (compiledRoute.getStaticPrefix() && uri.indexOf(compiledRoute.getStaticPrefix()) !== 0) {
            return;
        }

        var matches = uri.match(compiledRoute.getRegex());
        if (!matches) {
            return;
        }
        var hostnameMatches = [];
        if (compiledRoute.getHostnameRegex()) {
            hostnameMatches = self._context.getHost().match(compiledRoute.getHostnameRegex());
            if (!hostnameMatches) {
                return;
            }
        }

        var methodReq = route.getRequirement('_method');
        if (methodReq) {
            // HEAD and GET are equivalent as per RFC
            var method = self._context.getMethod();
            if ('HEAD' === method) {
                method = 'GET';
            }
            if (methodReq.toUpperCase().split('|').indexOf(method) === -1) {
                return;
            }
        }


        if (!self.handleRouteRequirements(uri, name, route)) {
            return;
        }

        foundRoute = self.getAttributes(route, name, matches, hostnameMatches);
        return false;//stop iteration
    });
    return foundRoute;
};

UrlMatcher.prototype.getAttributes = function (route, name, matches, hostnameMatches) {
    var compiledRoute = route.compile();
    var params = {_route: name};
    _.extend(params, route.getDefaults());
    var vars = compiledRoute.getPathVariables();
    for (var i = 0; i < vars.length; i++) {
        if (typeof matches[i + 1] !== 'undefined') {
            params[vars[i]] = matches[i + 1];
        }
    }
    vars = compiledRoute.getHostnameVariables();
    for (i = 0; i < vars.length; i++) {
        if (typeof hostnameMatches[i + 1] !== 'undefined') {
            params[vars[i]] = hostnameMatches[i + 1];
        }
    }
    return params;
};

UrlMatcher.prototype.handleRouteRequirements = function (uri, name, route) {
    var scheme = route.getRequirement('_scheme');
    return !scheme || scheme === this._context.getScheme();
};

JSymfony.Routing.UrlMatcher = module.exports = UrlMatcher;
