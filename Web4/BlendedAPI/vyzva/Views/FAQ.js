var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var vyzva;
(function (vyzva) {
    var faqController = (function (_super) {
        __extends(faqController, _super);
        function faqController($scope, $state) {
            _super.call(this, $scope, $state);
            $('#splash').hide();
        }
        return faqController;
    })(blended.controller);
    vyzva.faqController = faqController;
    blended.rootModule
        .directive('vyzva$faq$item', function () { return new vyzva$faq$item(); })
        .directive('vyzva$faq$toc', ['$anchorScroll', function ($anchorScroll) { return new vyzva$faq$toc($anchorScroll); }]);
    var vyzva$faq$item = (function () {
        function vyzva$faq$item() {
            this.scope = { title: '@title', type: '@type' };
            this.restrict = 'EA';
            this.transclude = true;
            this.templateUrl = 'vyzva$faq$item.html';
            this.link = function (scope) {
                var id = 'tocitem-' + (vyzva$faq$item.count++).toString();
                scope.datatoc = { id: id, title: scope.title, type: scope.type };
                scope.id = id;
                scope.gotoTop = function () {
                    $('html, body').animate({
                        scrollTop: $(document.body).offset().top
                    }, 500);
                };
            };
        }
        vyzva$faq$item.count = 0;
        return vyzva$faq$item;
    })();
    vyzva.vyzva$faq$item = vyzva$faq$item;
    var vyzva$faq$toc = (function () {
        function vyzva$faq$toc($anchorScroll) {
            this.$anchorScroll = $anchorScroll;
            this.link = function (scope, el) {
                setTimeout(function () {
                    var items = [];
                    $('[data-toc]').each(function (idx, el) { return items.push($(el).data('toc')); });
                    scope.groups = _.groupBy(items, function (it) { return it.type; });
                    scope.$apply();
                    scope.click = function (it) {
                        $('html, body').animate({
                            scrollTop: $('#' + it.id).offset().top
                        }, 500);
                        //this.$anchorScroll.yOffset = $('#' + it.id); this.$anchorScroll();
                    };
                });
            };
            this.restrict = 'EA';
            this.templateUrl = 'vyzva$faq$toc.html';
        }
        return vyzva$faq$toc;
    })();
    vyzva.vyzva$faq$toc = vyzva$faq$toc;
})(vyzva || (vyzva = {}));
