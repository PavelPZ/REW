var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var test;
(function (test) {
    //****************** DEMO controlers
    var DLesson = (function (_super) {
        __extends(DLesson, _super);
        function DLesson($scope, $state) {
            _super.call(this, $scope, $state);
        }
        return DLesson;
    })(test.PageController);
    test.DLesson = DLesson;
    //****************** DEMO SOUND controlers
    //*** DS
    var DSController = (function (_super) {
        __extends(DSController, _super);
        function DSController($scope, $state, demoSoundMetadata) {
            _super.call(this, $scope, $state);
            if (!DSNode) {
                var ds = angular.fromJson(demoSoundMetadata.data);
                if (_.isString(ds))
                    ds = angular.fromJson(ds);
                DSNode = ds;
                //debugger;
                renameAttrs(DSNode);
            }
            $scope.node = DSNode;
            $scope.tupples = tuples($scope.node.data);
        }
        DSController.$inject = ['$scope', '$state', 'demoSoundMetadata'];
        return DSController;
    })(test.PageController);
    test.DSController = DSController;
    //*** DSLang
    var DSLangController = (function (_super) {
        __extends(DSLangController, _super);
        function DSLangController($scope, $state) {
            _super.call(this, $scope, $state);
            $scope.node = _.find($scope.$parent.node.data, function (l) { return l.url == $scope.params.lang; });
            test.root.$scope.pageTitle = $scope.node.title;
            $scope.tupples = tuples($scope.node.data);
        }
        return DSLangController;
    })(test.PageController);
    test.DSLangController = DSLangController;
    //*** DSLangLevel
    var DSLangLevelController = (function (_super) {
        __extends(DSLangLevelController, _super);
        function DSLangLevelController($scope, $state) {
            _super.call(this, $scope, $state);
            $scope.node = _.find($scope.$parent.node.data, function (l) { return l.url == $scope.params.level; });
            $scope.exs = $scope.node.data;
            test.root.$scope.pageTitle = $scope.node.parent.title + ' / ' + $scope.node.title;
        }
        return DSLangLevelController;
    })(test.PageController);
    test.DSLangLevelController = DSLangLevelController;
    //*** DSLangLevelFile
    var DSLangLevelFileController = (function (_super) {
        __extends(DSLangLevelFileController, _super);
        function DSLangLevelFileController($scope, $state) {
            _super.call(this, $scope, $state);
            var file = $scope.params.file.replace(/\//g, '@');
            $scope.authorUrl = config.runExMask[$scope.params.configid] + file;
            test.root.$scope.bodyScrollHidden = true;
        }
        return DSLangLevelFileController;
    })(test.PageController);
    test.DSLangLevelFileController = DSLangLevelFileController;
    var DSNode;
    function renameAttrs(node) {
        for (var p in node) {
            if (p[0] == '@') {
                node[p.substring(1)] = node[p];
                delete node[p];
            }
        }
        if (node.url)
            node.escapedUrl = node.url.replace(/\//g, '@');
        if (node.data)
            _.each(node.data, function (d) {
                d.parent = node;
                renameAttrs(d);
            });
    }
    //z seznamu udela dvojice
    function tuples(objs) {
        var res = [];
        var last = null;
        _.each(objs, function (obj) {
            if (last) {
                last.right = obj;
                last.hasRight = true;
                last = null;
            }
            else {
                last = { left: obj, right: null, hasRight: false };
                res.push(last);
            }
        });
        return res;
    }
})(test || (test = {}));
