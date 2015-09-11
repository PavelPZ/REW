var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    var lectorController = (function (_super) {
        __extends(lectorController, _super);
        function lectorController($scope, $state) {
            var _this = this;
            _super.call(this, $scope, $state);
            var lectorGroups = this.productParent.lectorGroups;
            this.groupId = parseInt(this.ctx.groupid);
            this.lectorGroup = _.find(lectorGroups, function (grp) { return grp.groupId == _this.groupId; });
        }
        return lectorController;
    })(blended.controller);
    vyzva.lectorController = lectorController;
    var lectorViewBase = (function (_super) {
        __extends(lectorViewBase, _super);
        function lectorViewBase($scope, $state) {
            _super.call(this, $scope, $state);
            this.title = this.lectorParent.lectorGroup.title;
            this.breadcrumb = this.breadcrumbBase();
            this.breadcrumb[this.breadcrumb.length - 1].active = true;
        }
        lectorViewBase.prototype.breadcrumbBase = function () {
            var res = vyzva.breadcrumbBase(this);
            res.push({ title: this.title, url: this.href({ stateName: vyzva.stateNames.lectorHome.name, pars: this.ctx }) });
            return res;
        };
        return lectorViewBase;
    })(blended.controller);
    vyzva.lectorViewBase = lectorViewBase;
    var lectorViewController = (function (_super) {
        __extends(lectorViewController, _super);
        function lectorViewController($scope, $state) {
            _super.call(this, $scope, $state);
            this.breadcrumb[this.breadcrumb.length - 1].active = true;
            this.tabIdx = 0;
            this.students = _.map(this.lectorParent.lectorGroup.studentKeys, function (k) { return { key: k }; });
            this.visitors = _.map(this.lectorParent.lectorGroup.visitorsKeys, function (k) { return { key: k }; });
        }
        lectorViewController.prototype.gotoStudentResult = function (student) {
            var _this = this;
            var ctx = blended.cloneAndModifyContext(this.ctx, function (c) {
                c.onbehalfof = student.key.lmcomId;
                c.returnurl = _this.href({ stateName: vyzva.stateNames.lectorHome.name, pars: _this.ctx });
            });
            this.navigate({ stateName: vyzva.stateNames.home.name, pars: ctx });
        };
        lectorViewController.prototype.downloadLicenceKeys = function () {
            vyzva.downloadExcelReport({ type: vyzva.reportType.lectorKeys, companyId: this.ctx.companyid, groupId: this.lectorParent.groupId });
        };
        lectorViewController.prototype.downloadSummary = function (isStudyAll) {
            vyzva.downloadExcelReport({ type: vyzva.reportType.lectorStudy, companyId: this.ctx.companyid, groupId: this.lectorParent.groupId, isStudyAll: isStudyAll });
        };
        return lectorViewController;
    })(lectorViewBase);
    vyzva.lectorViewController = lectorViewController;
    blended.rootModule
        .directive('vyzva$lector$user', function () {
        return {
            scope: { student: '&student', ts: '&ts' },
            templateUrl: 'vyzva$lector$user.html'
        };
    })
        .directive('vyzva$lector$users', function () {
        return {
            scope: { students: '&students', ts: '&ts' },
            templateUrl: 'vyzva$lector$users.html'
        };
    })
        .directive('vyzva$lector$visitors', function () {
        return {
            scope: { students: '&students', ts: '&ts' },
            templateUrl: 'vyzva$lector$visitors.html'
        };
    })
        .directive('vyzva$lector$visitor', function () {
        return {
            scope: { student: '&student', ts: '&ts' },
            templateUrl: 'vyzva$lector$visitor.html'
        };
    });
})(vyzva || (vyzva = {}));
