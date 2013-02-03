var url = require('url');

function RequestContext(baseUrl, method, host, scheme, httpPort, httpsPort, uri) {
    this._baseUrl = baseUrl || '';
    this._method = (method || 'GET').toUpperCase();
    this._host = host || 'localhost';
    this._scheme = (scheme || 'http').toLowerCase();
    this._httpPort = httpPort || 80;
    this._httpsPort = httpsPort || 443;
    this._uri = uri || '/';
    this._parameters = {};
}

RequestContext.prototype.fromRequest = function (req) {
    this.setUri(url.parse(req.url).pathname);
    this.setMethod(req.method);
    this.setHost(req.host);
    this.setScheme(req.protocol);

    if (req.secure) {
        this.setHttpPort(req.port);
    } else {
        this.setHttpsPort(req.port);
    }
};

RequestContext.prototype.getBaseUrl = function () {
    return this._baseUrl;
};

RequestContext.prototype.setBaseUrl = function (baseUrl) {
    this._baseUrl = baseUrl;
};

RequestContext.prototype.getUri = function () {
    return this._uri;
};

RequestContext.prototype.setUri = function (uri) {
    this._uri = uri;
};

RequestContext.prototype.getMethod = function () {
    return this._method;
};

RequestContext.prototype.setMethod = function (method) {
    this._method = method.toUpperCase();
};

RequestContext.prototype.getHost = function () {
    return this._host;
};

RequestContext.prototype.setHost = function (host) {
    this._host = host;
};

RequestContext.prototype.getScheme = function () {
    return this._scheme;
};

RequestContext.prototype.setScheme = function (scheme) {
    this._scheme = scheme.toLowerCase();
};

RequestContext.prototype.getHttpPort = function () {
    return this._httpPort;
};

RequestContext.prototype.setHttpPort = function (httpPort) {
    this._httpPort = httpPort;
};

RequestContext.prototype.getHttpsPort = function () {
    return this._httpsPort;
};

RequestContext.prototype.setHttpsPort = function (httpsPort) {
    this._httpsPort = httpsPort;
};

RequestContext.prototype.getParameters = function () {
    return this._parameters;
};

RequestContext.prototype.setParameters = function (parameters) {
    this._parameters = parameters;
};

RequestContext.prototype.getParameter = function (name) {
    return this._parameters[name] || null;
};

RequestContext.prototype.hasParameter = function (name) {
    return this._parameters.hasOwnProperty(name);
};

RequestContext.prototype.setParameter = function (name, value) {
    this._parameters[name] = value;
};

JSymfony.Routing.RequestContext = module.exports = RequestContext;
