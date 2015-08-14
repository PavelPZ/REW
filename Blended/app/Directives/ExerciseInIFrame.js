var test;
(function (test) {
    function iframedirective() {
        return {
            restrict: 'AE',
            scope: { url: 'http://www.langmaster.com' },
            link: function (scope, element, attrs, ctrl) {
            },
            template: '<iframe id="myIframe" src="xxx" onload="if (typeof(doOnResize)!=\'undefined\') doOnResize();" xframeBorder="0" style="width:100%;" width="100%" ></iframe>'
        };
    }
    test.iframedirective = iframedirective;
    ;
})(test || (test = {}));
