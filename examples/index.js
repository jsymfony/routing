require('../index.js');

var locator = new JSymfony.Config.FileLocator(__dirname + '/config');
var loader = new JSymfony.Routing.Loader.YamlFileLoader(locator);

var routeCollection = loader.load('routing.yml');
var Router = new JSymfony.Routing.Router(routeCollection);

console.log(Router.match('/'));
console.log(Router.match('/about'));
console.log(Router.match('/foo'));

console.log(Router.generate('static_page'));
console.log(Router.generate('static_page', {page: 'contacts'}));
console.log(Router.generate('static_page', {page: 'contacts'}, true));
