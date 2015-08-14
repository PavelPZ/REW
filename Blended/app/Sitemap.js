var test;
(function (test) {
    //Sitemap Definition
    var pages = {
        home: {
            controller: test.HomeController,
            title: 'home',
            url: "/index",
            templateUrl: "/app/pages/index.html",
        },
        contact: {
            controller: test.PageController,
            title: 'contact',
            url: "/contact",
            templateUrl: "/app/pages/contact.html",
        }
    };
    test.sitemap = pages.home;
    //sitemap tree
    pages.home.childs = [pages.contact];
    //...
    function setParents(node) {
        if (!node.childs)
            return;
        _.each(node.childs, function (ch) { ch.parent = node; setParents(ch); });
    }
    setParents(test.sitemap);
    function defineRoute($routeProvider) {
        $routeProvider.
            when(pages.home.url, toRoute(pages.home)).
            when(pages.contact.url, toRoute(pages.contact)).
            otherwise({ redirectTo: pages.home.url }); // ... other routes ...
    }
    test.defineRoute = defineRoute;
    function toRoute(node) { return { controller: node.controller, templateUrl: node.templateUrl, resolve: { sitemapNode: function () { return node; } } }; }
})(test || (test = {}));
//# sourceMappingURL=Sitemap.js.map