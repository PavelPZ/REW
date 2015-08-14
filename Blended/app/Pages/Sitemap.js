var test;
(function (test) {
    //Sitemap Definition
    test.pages = {
        home: {
            controller: test.HomeController,
            title: 'home',
            url: "/index",
            templateUrl: "/app/views/index.html",
        },
        contact: {
            controller: test.PageController,
            title: 'contact',
            url: "/contact",
            templateUrl: "/app/views/contact.html",
        }
    };
    test.sitemap = test.pages.home;
    //sitemap tree
    test.pages.home.childs = [test.pages.contact];
    //...
    function setParents(node) {
        if (!node.childs)
            return;
        _.each(node.childs, function (ch) { ch.parent = node; setParents(ch); });
    }
    setParents(test.sitemap);
})(test || (test = {}));
