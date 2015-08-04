var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var waObjs;
(function (waObjs) {
    var DlgModelLow = (function () {
        function DlgModelLow(modalId, place, completed) {
            this.modalId = modalId;
            this.place = place;
            this.completed = completed;
            this.btnGrid = []; //button grid pro ovladani by arrow keys
        }
        DlgModelLow.prototype.show = function () {
            this.$mod = render(this.modalId, this);
            this.$mod.modal();
            DlgModelLow.init(this);
            this.$mod.modal('show');
            if (this.btnGrid.length > 0)
                this.btnGrid[0][0].focus();
        };
        DlgModelLow.prototype.btnGridOK = function (btn) { }; //zvoleno grid tlacitko
        DlgModelLow.prototype.hide = function () { this.$mod.modal('hide'); };
        DlgModelLow.prototype.onHide = function () { };
        DlgModelLow.prototype.onInit = function () { };
        DlgModelLow.prototype.onGetResult = function () { };
        DlgModelLow.init = function (dlg) {
            //*** init focus grid
            _.each(dlg.$mod.find('[data-focus-grid]'), function (el) {
                var $el = $(el);
                var d = $el.data('focusGrid').split(':');
                var row = parseInt(d[0]);
                var cell = parseInt(d[1]);
                if (!dlg.btnGrid[row])
                    dlg.btnGrid[row] = [];
                dlg.btnGrid[row][cell] = $el;
            });
            if (dlg.btnGrid.length > 0)
                dlg.btnGridEvents();
            dlg.onInit();
            var self = dlg;
            dlg.$mod.on('show.bs.modal', function () {
                if (!self.place)
                    return;
                self.$mod.css({ 'top': 'auto', 'left': 'auto' }); //inicializace position. Musi byt, jinak se nasledujici position pocita z jiz zmenenych properties
                self.$mod.position({ my: "center top+20", at: 'horizontal ', of: self.place[0], collision: 'flipfit' });
            });
            dlg.$mod.on('shown.bs.modal', function () {
                var bd = $('.modal-backdrop.in');
                bd.on('click', function () { return self.$mod.modal('hide'); });
                if (self.caller) {
                    bd.css({ 'z-index': '1051' });
                    self.$mod.css({ 'z-index': '1061' });
                }
            });
            dlg.$mod.on('hidden.bs.modal', function () {
                self.onHide();
                self.caller = null;
            });
        };
        DlgModelLow.prototype.btnGridEvents = function () {
            var _this = this;
            this.$mod.on('keydown', '[data-focus-grid]', function (ev) {
                var $btn = $((ev.target));
                var d = $btn.data('focusGrid').split(':');
                var row = parseInt(d[0]);
                var cell = parseInt(d[1]);
                //enter
                if (ev.keyCode == waObjs.key.enter) {
                    if ($btn.data('dlgRes')) {
                        _this.btnGridOK($btn);
                        return false;
                    }
                    else
                        return true;
                }
                if (!$btn.data('arrowIgnore')) {
                    switch (ev.keyCode) {
                        case waObjs.key.tab:
                        case waObjs.key.rightArrow:
                            _this.btnGrid[row][cell == _this.btnGrid[row].length - 1 ? 0 : cell + 1].focus();
                            break;
                        case waObjs.key.leftArrow:
                            _this.btnGrid[row][cell == 0 ? _this.btnGrid[row].length - 1 : cell - 1].focus();
                            break;
                        case waObjs.key.downArrow:
                            _this.btnGrid[row == _this.btnGrid.length - 1 ? 0 : row + 1][0].focus();
                            break;
                        case waObjs.key.upArrow:
                            _this.btnGrid[row == 0 ? _this.btnGrid.length - 1 : row - 1][0].focus();
                            break;
                        //case key.enter: if ($btn.data('dlgRes')) this.btnGridOK($btn); break;
                        default: return true;
                    }
                    return false;
                }
            });
            this.$mod.on('click', '[data-dlg-res]', function (ev) {
                var $btn = $((ev.target));
                _this.btnGridOK($btn);
            });
        };
        return DlgModelLow;
    })();
    waObjs.DlgModelLow = DlgModelLow;
    //************* DlgTextModel *****************
    var DlgTextModel = (function (_super) {
        __extends(DlgTextModel, _super);
        function DlgTextModel(modalId, edit, rng, place, completed) {
            _super.call(this, modalId, place, completed);
            this.edit = edit;
            this.rng = rng;
            this.rng = rng;
        }
        DlgTextModel.prototype.btnGridOK = function (btn) {
            var rng = this.callCompleted(btn);
            if (rng)
                this.rng = rng;
            var edit = this.edit;
            this.edit = null;
            var completedNotCalled = this.rng.start < 0; //
            if (!completedNotCalled)
                this.recoverRange(edit);
            this.hide();
            if (completedNotCalled)
                this.edit = edit;
        };
        DlgTextModel.prototype.callCompleted = function (btn) {
            return this.completed(btn);
        };
        DlgTextModel.prototype.recoverRange = function (edit) {
            var _this = this;
            if (!edit)
                return;
            setTimeout(function () {
                edit.focus();
                textRange.setRange(edit, _this.rng.start, _this.rng.end - _this.rng.start);
            }, 1);
        };
        DlgTextModel.prototype.onHide = function () {
            this.recoverRange(this.edit);
        };
        return DlgTextModel;
    })(DlgModelLow);
    waObjs.DlgTextModel = DlgTextModel;
    //************* DlgOpenBracket *****************
    var DlgOpenBracket = (function (_super) {
        __extends(DlgOpenBracket, _super);
        function DlgOpenBracket(edit, rng, place, completed) {
            _super.call(this, 'dlg-open-bracket', edit, rng, place, completed);
            this.show();
        }
        return DlgOpenBracket;
    })(DlgTextModel);
    waObjs.DlgOpenBracket = DlgOpenBracket;
    //************* DlgEditBlock *****************
    var DlgEditBlock = (function (_super) {
        __extends(DlgEditBlock, _super);
        function DlgEditBlock(place, completed) {
            _super.call(this, 'dlg-edit-block', place, completed);
            this.show();
        }
        DlgEditBlock.prototype.btnGridOK = function (btn) {
            this.completed(btn.data('dlgRes'));
            this.hide();
        };
        return DlgEditBlock;
    })(DlgModelLow);
    waObjs.DlgEditBlock = DlgEditBlock;
    //************* DlgPropName *****************
    var DlgPropName = (function (_super) {
        __extends(DlgPropName, _super);
        function DlgPropName(edit, rng, place, mark, completed) {
            _super.call(this, 'dlg-prop-name', edit, rng, place, completed);
            this.list = ko.observable();
            this.list(new propName(mark));
            this.show();
        }
        DlgPropName.prototype.callCompleted = function (btn) {
            var prop = (this.list().value().dato);
            if (prop.type == metaJS.xsdPropType.Enum) {
                var self = this;
                setTimeout(function () { return new DlgEnumValue(self.edit, self.rng, self.place, self.list().mark, prop, function (enumItem) { return self.completed(prop.name + '=' + enumItem.name + '|'); }); }, 1);
                return { start: -1, end: -1 };
            }
            else {
                var boolVal = prop.type == metaJS.xsdPropType.Bool ? 'true' : '';
                var snipset = prop.name + '=' + boolVal + '|';
                return this.completed(snipset);
            }
        };
        return DlgPropName;
    })(DlgTextModel);
    waObjs.DlgPropName = DlgPropName;
    //************* DlgEnumValue *****************
    var DlgEnumValue = (function (_super) {
        __extends(DlgEnumValue, _super);
        function DlgEnumValue(edit, rng, place, mark, prop, completed) {
            _super.call(this, 'dlg-enum-value', edit, rng, place, completed);
            this.list = ko.observable();
            this.list(new enumValue(mark, prop));
            this.show();
        }
        DlgEnumValue.prototype.callCompleted = function (btn) {
            return this.completed(this.list().value().dato);
        };
        return DlgEnumValue;
    })(DlgTextModel);
    waObjs.DlgEnumValue = DlgEnumValue;
    //************* DlgEditInline *****************
    var DlgEditInline = (function (_super) {
        __extends(DlgEditInline, _super);
        function DlgEditInline(edit, rng, place, mark, completed) {
            var _this = this;
            _super.call(this, 'dlg-edit-inline', edit, rng, place, completed);
            this.propEditor = ko.observable();
            this.valueEditor = ko.observable();
            var p = new propName(mark, false);
            p.value(null);
            p.selected = function (sel) {
                if (!sel) {
                    _this.valueEditor(null);
                    return;
                }
                _this.valueEditor(new enumValue(p.mark, metaJS.metaObj.types['offering'].propDir['drop-down-mode']));
            };
            this.propEditor(p);
            this.show();
        }
        return DlgEditInline;
    })(DlgTextModel);
    waObjs.DlgEditInline = DlgEditInline;
    //**************** EDITORS MODELS ********************
    var edModel = (function () {
        function edModel(scriptId) {
            this.scriptId = scriptId;
        }
        return edModel;
    })();
    waObjs.edModel = edModel;
    var listModel = (function (_super) {
        __extends(listModel, _super);
        function listModel(scriptId, list) {
            _super.call(this, scriptId);
            this.list = list;
            this.value = ko.observable();
            this.descr = ko.observable();
            this.value(this.list[0]);
        }
        listModel.prototype.changed = function () {
            var sel = this.value();
            if (this.selected)
                this.selected(sel);
            if (!sel)
                return '';
            this.descr((sel.summary ? '<b>' + sel.summary + '</b><br/>' : '') + (sel.descr || ''));
        };
        return listModel;
    })(edModel);
    waObjs.listModel = listModel;
    var propName = (function (_super) {
        __extends(propName, _super);
        function propName(mark, removeUsed) {
            if (removeUsed === void 0) { removeUsed = true; }
            _super.call(this, 'ed-prop-name', propName.getList(mark, removeUsed));
            this.mark = mark;
        }
        propName.getList = function (mark, removeUsed) {
            var usedProps = !removeUsed ? [] : _.map(_.filter(mark.marks.marks, function (m) { return m.type == waObjs.markType.propName; }), function (m) { return m.prop; });
            var okProps = _.filter(metaJS.metaObj.types[mark.tag].props, function (p) { return (p.flag & CourseModel.tgSt.metaJS_browse) != 0 && !_.contains(usedProps, p); });
            return _.map(okProps, function (p) { return { name: p.name, value: p.name, dato: p, summary: p.summary, descr: p.descr }; });
        };
        return propName;
    })(listModel);
    waObjs.propName = propName;
    var enumValue = (function (_super) {
        __extends(enumValue, _super);
        function enumValue(mark, prop) {
            _super.call(this, 'ed-enum', enumValue.getList(prop));
            this.mark = mark;
            this.prop = prop;
        }
        enumValue.getList = function (prop) {
            return _.map(prop.myEnum().enumData, function (en) { return { name: en.name, value: en.name, summary: en.summary, descr: en.descr, dato: en }; });
        };
        return enumValue;
    })(listModel);
    waObjs.enumValue = enumValue;
    //**************** JSRender LIB ********************
    //var templCache: JsTemplate[] = [];
    //export function tmpl(id: string): any {
    //  id = id.toLowerCase();
    //  var tmpl = templCache[id];
    //  if (tmpl == null) {
    //    var t = $('#' + id);
    //    var txt = t.html();
    //    if (!txt) { debugger; throw 'cannot read template ' + id; }
    //    t.remove();
    //    try {
    //      tmpl = $.templates(txt);
    //    } catch (msg) {
    //      alert("cannot compile template " + id);
    //      throw msg;
    //    }
    //    templCache[id] = tmpl;
    //  }
    //  return tmpl;
    //}
    function render(templateId, data) {
        var str = JsRenderTemplateEngine.tmpl(templateId).render(data);
        $('#' + templateId).remove();
        $('body').append($(str));
        var res = $('#' + templateId);
        ko.applyBindings(data, res[0]);
        return res;
    }
    waObjs.render = render;
    ko.nativeTemplateEngine.instance['renderTemplateSource'] = function (template, bindingContext, options) {
        if (_.isEmpty(template))
            return [];
        var data = bindingContext.$data;
        var str = JsRenderTemplateEngine.tmpl(template).render(data);
        return $.parseHTML(str, null, true);
    };
    ko.nativeTemplateEngine.instance['makeTemplateSource'] = function (template, templateDocument) { return _.isString(template) ? template : null; };
})(waObjs || (waObjs = {}));
