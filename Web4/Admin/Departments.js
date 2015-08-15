var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var schoolAdmin;
(function (schoolAdmin) {
    var Departments = (function (_super) {
        __extends(Departments, _super);
        function Departments(urlParts) {
            _super.call(this, schoolAdmin.editDepartmentTypeName, urlParts);
            this.th = ko.observable('Dummy');
            this.listModels = [
                { model: null, template: ko.observable('Dummy'), id: 'study_periods', title: CSLocalize('5c160f5326584d0e9edcf9e293e76f32', 'Study Periods') },
                { model: null, template: ko.observable('Dummy'), id: 'time intervals', title: CSLocalize('84566284da7f4cdab2d27e86bc5e58a8', 'Time Intervals') },
                { model: null, template: ko.observable('Dummy'), id: 'score_ntervals', title: CSLocalize('4166679903f548f88f67ef4f7fa4eb0c', 'Score Intervals') }
            ];
            var self = this;
        }
        Departments.prototype.update = function (completed) {
            var _this = this;
            Pager.ajaxGet(Pager.pathType.restServices, Admin.CmdGetDepartment_Type, Admin.CmdGetDepartment_Create(this.CompanyId), function (res) {
                var isNew = res.Departments == null;
                _this.treeModel = new TreeView.Model(isNew ? { Id: 0, Title: _this.title(), Items: null, isNew: true } : res.Departments, isNew, function (nd) { return _.any(res.UsedIds, function (id) { return id == nd.Id; }); }, { withCheckbox: false, editable: true, onLinkClick: null });
                if (res.IntervalsConfig == null)
                    res.IntervalsConfig = { Periods: { Items: null }, Secs: { Items: null }, Scores: { Items: null } };
                _this.th('depTreeTemplate');
                new listModel(res.IntervalsConfig.Periods.Items, _this.listModels[0], new periodDr());
                new listModel(res.IntervalsConfig.Secs.Items, _this.listModels[1], new secDr());
                new listModel(res.IntervalsConfig.Scores.Items, _this.listModels[2], new scoreDr());
                _.each(_this.listModels, function (m) { return m.template('depListTemplate'); });
                completed();
            });
        };
        Departments.prototype.ok = function () {
            var tree = this.treeModel.getResult();
            var intervals = { Periods: this.listModels[0].model.dataFromModel(), Secs: this.listModels[1].model.dataFromModel(), Scores: this.listModels[2].model.dataFromModel() };
            Pager.ajaxPost(Pager.pathType.restServices, Admin.CmdSetDepartment_Type, Admin.CmdSetDepartment_Create(this.CompanyId, tree, intervals));
            LMStatus.gotoReturnUrl();
        };
        Departments.prototype.cancel = function () { LMStatus.gotoReturnUrl(); };
        return Departments;
    })(schoolAdmin.CompModel);
    schoolAdmin.Departments = Departments;
    var listModel = (function () {
        function listModel(data, meta, driver) {
            var _this = this;
            this.meta = meta;
            this.driver = driver;
            this.newItem = ko.observable();
            var cnt = 0;
            this.items = ko.observableArray(_.map(data, function (d) { return new listItem(_this, d, _this, cnt++); }));
            meta.model = this;
        }
        listModel.prototype.dataFromModel = function () { var cnt = 0; return { Items: _.map(this.items(), function (li) { return { IntervalId: cnt++, From: li.value.valueNum(), Title: li.title.title() }; }) }; };
        listModel.prototype.valueIsOK = function (s, actItem) {
            var res = { isOK: false, val: this.driver.toNumber(s) };
            res.isOK = res.val != cError;
            if (!res.isOK)
                return res;
            res.isOK = !_.find(this.items(), function (it) { return it != actItem && (it.value).valueNum() == res.val; });
            return res;
        };
        listModel.prototype.sort = function () {
            if (this.driver.isDesc())
                this.items.sort(function (a, b) { return b.value.valueNum() - a.value.valueNum(); });
            else
                this.items.sort(function (a, b) { return a.value.valueNum() - b.value.valueNum(); }); //reorder
        };
        listModel.prototype.onEnterEscClick = function (data, par) {
            var self = data.model;
            try {
                if (par.keyCode !== 27) {
                    var res = self.valueIsOK(self.newItem(), null);
                    if (!res.isOK)
                        return;
                    self.items.push(new listItem(self, { From: res.val, Title: null }, self, self.items.length));
                    self.sort();
                }
            }
            finally {
                self.newItem('');
                self.newItem.valueHasMutated();
            }
        };
        return listModel;
    })();
    schoolAdmin.listModel = listModel;
    var listItem = (function () {
        function listItem(owner, data, listModel, id) {
            this.owner = owner;
            this.data = data;
            this.listModel = listModel;
            this.id = id;
            var self = this;
            this.value = new listCellValue(this, true, this.data.From);
            this.title = new listCellTitle(this, false, this.data.Title);
            this.descr = ko.computed({
                read: function () {
                    var items = self.owner.items();
                    var idx = items.indexOf(self);
                    return self.owner.driver.customDescr(items, idx);
                },
                deferEvaluation: true,
            });
        }
        listItem.prototype.doDelete = function () {
            if (this.owner.items().length <= 1)
                return;
            this.descr.dispose();
            this.owner.items.remove(this);
        };
        return listItem;
    })();
    schoolAdmin.listItem = listItem;
    var listCell = (function () {
        function listCell(listItem, isValue) {
            this.listItem = listItem;
            this.isValue = isValue;
            this.editing = ko.observable(false);
            this.id = listItem.listModel.meta.id + '_' + (isValue ? 'val' : 'title') + '_' + listItem.id;
        }
        listCell.prototype.doEdit = function () { this.editing(true); };
        listCell.prototype.onEnterEscape = function (data, ev) {
            if (ev.keyCode === 27)
                $(ev.target).val(data.title()); /*undo*/
            data.editing(false);
        };
        return listCell;
    })();
    schoolAdmin.listCell = listCell;
    //http://www.jefclaes.be/2013/05/validating-composite-models-with.html 
    //https://github.com/Knockout-Contrib/Knockout-Validation/wiki
    var listCellValue = (function (_super) {
        __extends(listCellValue, _super);
        function listCellValue(list, isLeft, valueNum) {
            _super.call(this, list, isLeft);
            this.valueNum = ko.observable();
            var self = this;
            self.valueNum(valueNum);
            var model = self.listItem.owner;
            this.title = ko.computed({
                read: function () { return model.driver.toString(self.valueNum()); },
                write: function (s) {
                    var res = model.valueIsOK(s, self.listItem);
                    if (!res.isOK)
                        self.title.notifySubscribers(model.driver.toString(self.valueNum())); //error => undo
                    else {
                        self.valueNum(res.val);
                        model.sort();
                    }
                },
            });
        }
        return listCellValue;
    })(listCell);
    schoolAdmin.listCellValue = listCellValue;
    var listCellTitle = (function (_super) {
        __extends(listCellTitle, _super);
        function listCellTitle(list, isLeft, value) {
            _super.call(this, list, isLeft);
            this.title = ko.observable('');
            this.title(value ? value : '');
        }
        return listCellTitle;
    })(listCell);
    schoolAdmin.listCellTitle = listCellTitle;
    var cError = -1000;
    var periodDr = (function () {
        function periodDr() {
        }
        periodDr.prototype.toNumber = function (s) {
            try {
                var ny = s.split('-');
                if (ny.length != 2)
                    throw 'e';
                return checkInterval(ny[0], 1, 12) + (checkInterval(ny[1], 2013, 2050) - 2000) * 100;
            }
            catch (e) {
                return cError;
            }
        };
        periodDr.prototype.toString = function (s) {
            var m = Utils.modulo(s, 100);
            return m.z.toString() + '-' + (m.m + 2000).toString();
        };
        periodDr.prototype.isDesc = function () { return false; };
        periodDr.prototype.customDescr = function (items, idx) {
            var dr = this;
            var act = Utils.modulo(items[idx].value.valueNum(), 100);
            var actStr = Globalize.format(new Date(act.m + 2000, act.z - 1, 1), 'Y', Trados.actLangNetCode);
            if (idx == items.length - 1)
                return actStr + ' -';
            var next = Utils.modulo(items[idx + 1].value.valueNum(), 100);
            next.z -= 1;
            if (next.z == 0) {
                next.m -= 1;
                next.z = 12;
            }
            if (act.z == next.z && act.m == next.m)
                return actStr;
            var nextStr = Globalize.format(new Date(next.m + 2000, next.z - 1, 1), 'Y', Trados.actLangNetCode);
            if (next.m == act.m && next.z == 12 && act.z == 1)
                return (next.m + 2000).toString();
            if (next.m == act.m)
                return Globalize.culture(Trados.actLangNetCode).calendars.standard.months.names[act.z - 1] + ' - ' + nextStr;
            return actStr + ' - ' + nextStr;
        };
        return periodDr;
    })();
    schoolAdmin.periodDr = periodDr;
    function checkInterval(val, min, max) {
        var v = parseInt(val.trim());
        if (isNaN(v) || v > max || v < min)
            throw 'err';
        return v;
    }
    var secDr = (function () {
        function secDr() {
        }
        secDr.prototype.toNumber = function (s) {
            try {
                var parts = s.split(/[\.\:]/);
                var res = 0;
                var len = parts.length;
                if (len > 4 || len < 3)
                    throw 'e';
                if (len == 4)
                    res += checkInterval(parts[len - 4], 0, 100) * 86400;
                res += checkInterval(parts[len - 3], 0, 23) * 3600;
                res += checkInterval(parts[len - 2], 0, 59) * 60;
                res += checkInterval(parts[len - 1], 0, 59);
                return res;
            }
            catch (e) {
                return cError;
            }
        };
        secDr.prototype.toString = function (s) {
            var res = "";
            var m = Utils.modulo(s, 86400);
            s = m.z;
            if (m.m > 0)
                res += m.m.toString() + ".";
            m = Utils.modulo(s, 3600);
            s = m.z;
            res += (m.m > 9 ? m.m.toString() : '0' + m.m.toString()) + ':';
            m = Utils.modulo(s, 60);
            s = m.z;
            res += (m.m > 9 ? m.m.toString() : '0' + m.m.toString()) + ':';
            res += s > 9 ? s.toString() : '0' + s.toString();
            return res;
        };
        secDr.prototype.isDesc = function () { return true; };
        secDr.prototype.customDescr = function (items, idx) {
            var dr = this;
            if (idx == 0)
                return dr.toString(items[idx].value.valueNum()) + ' -';
            return dr.toString(items[idx].value.valueNum()) + ' - ' + dr.toString(items[idx - 1].value.valueNum());
        };
        return secDr;
    })();
    schoolAdmin.secDr = secDr;
    var scoreDr = (function () {
        function scoreDr() {
        }
        scoreDr.prototype.toNumber = function (s) {
            try {
                return checkInterval(s, 0, 100) - 1;
            }
            catch (e) {
                return cError;
            }
        };
        scoreDr.prototype.toString = function (s) { return (s + 1).toString(); };
        scoreDr.prototype.isDesc = function () { return true; };
        scoreDr.prototype.customDescr = function (items, idx) {
            var dr = this;
            var max = idx == 0 ? 100 : items[idx - 1].value.valueNum();
            var min = items[idx].value.valueNum() + 1;
            if (max == min)
                return min.toString() + '%';
            return min.toString() + ' - ' + max.toString() + '%';
        };
        return scoreDr;
    })();
    schoolAdmin.scoreDr = scoreDr;
    //Pager.registerAppLocator(appId, editDepartmentTypeName, (urlParts, completed) => completed(new Departments(urlParts)));
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, schoolAdmin.editDepartmentTypeName, schoolAdmin.appId, schoolAdmin.editDepartmentTypeName, 1, function (urlParts) { return new Departments(urlParts); }); });
})(schoolAdmin || (schoolAdmin = {}));
