var test;
(function (test) {
    function emberResponsive() {
        return {
            restrict: 'A',
            link: function (scope, el, attrs) {
                scope.id = 'id-' + (frameId++).toString();
                el.attr('src', attrs['iframedirective']);
                el.css('width', '100%');
                el.attr('width', '100%');
                el.attr('frameBorder', '0');
                el.css('height', '2000px');
                el.attr('height', '2000px');
                el.on('load', function () { return onIFrameResize(el); });
                $(window).on('resize.' + scope.id, function () { return onIFrameResize(el); });
                scope.$on(scope.id + '.$destroy', function () {
                    el.off('load');
                    $(window).off('resize.' + scope.id);
                });
                test.root.$scope.modalExercise = true;
            },
        };
    }
    test.emberResponsive = emberResponsive;
    ;
    var frameId = 0; //citac frames kvuli events namespace
    function onIFrameResize(frm) {
        frm.height($(window).height() - frm.offset().top - 10);
    }
})(test || (test = {}));
