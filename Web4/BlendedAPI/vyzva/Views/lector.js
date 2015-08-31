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
        function lectorController(state) {
            _super.call(this, state);
            var lectorGroups = (this.taskRoot()).lectorGroups;
            var gid = parseInt(this.ctx.groupid);
            this.lectorGroup = _.find(lectorGroups, function (grp) { return grp.groupId == gid; });
        }
        return lectorController;
    })(blended.controller);
    vyzva.lectorController = lectorController;
    var lectorViewBase = (function (_super) {
        __extends(lectorViewBase, _super);
        function lectorViewBase(state) {
            _super.call(this, state);
            this.title = 'Studijní skupina ' + this.parent.lectorGroup.title;
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
        function lectorViewController(state) {
            _super.call(this, state);
            this.breadcrumb[this.breadcrumb.length - 1].active = true;
            this.tabIdx = 0;
        }
        return lectorViewController;
    })(lectorViewBase);
    vyzva.lectorViewController = lectorViewController;
})(vyzva || (vyzva = {}));
