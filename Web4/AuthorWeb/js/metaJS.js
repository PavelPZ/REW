var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var metaJS;
(function (metaJS) {
    var implLow = (function () {
        function implLow(json) {
            if (json)
                for (var p in json)
                    this[p] = json[p];
        }
        implLow.prototype.hasFlag = function (fl) {
            var val = _.isString(fl) ? CourseModel.tgSt[fl] : fl;
            return (this.flag & val) != 0;
        };
        implLow.prototype.rnName = function () {
            if (_.isEmpty(this._newName))
                return this.name;
            return this.name + ' => <span class="label label-default">' + this._newName + '</span>';
        };
        implLow.prototype.rnNameNew = function () { return this._newName || this.name; };
        return implLow;
    })();
    metaJS.implLow = implLow;
    var enumImpl = (function (_super) {
        __extends(enumImpl, _super);
        function enumImpl(json) {
            _super.call(this, json);
            for (var i = 0; i < this.enumData.length; i++)
                this.enumData[i] = new enumItemImpl(this.enumData[i]);
        }
        return enumImpl;
    })(implLow);
    metaJS.enumImpl = enumImpl;
    var enumItemImpl = (function (_super) {
        __extends(enumItemImpl, _super);
        function enumItemImpl() {
            _super.apply(this, arguments);
        }
        return enumItemImpl;
    })(implLow);
    metaJS.enumItemImpl = enumItemImpl;
    var typeImpl = (function (_super) {
        __extends(typeImpl, _super);
        function typeImpl() {
            _super.apply(this, arguments);
        }
        typeImpl.prototype.rnDescendants = function () {
            var _this = this;
            if (this.name == 'macro')
                return null;
            var cond = function (d) { d.isTrashMode = _this.isTrashMode; var ok = !!d.rnDescendants() || !d.hasFlag(CourseModel.tgSt.docIgnore); return _this.isTrashMode ? !ok || !!d.rnProps() : ok; };
            var res = _.filter(this.descendants, function (d) { return cond(d); });
            return res.length == 0 ? null : res;
        };
        typeImpl.prototype.rnProps = function () {
            var _this = this;
            var cond = function (p) { var ok = !p.hasFlag(CourseModel.tgSt.docIgnore); return _this.isTrashMode ? !ok : ok; };
            var res = _.filter(this.ownProps, function (p) { return cond(p); });
            return res.length == 0 ? null : res;
        };
        typeImpl.prototype.rnPropsNew = function () {
            var res = _.filter(this.props, function (p) { return !p.hasFlag(CourseModel.tgSt.docIgnore); });
            return _.sortBy(res, function (p) { return p.name; }); //p._newName || p.name);
        };
        return typeImpl;
    })(implLow);
    metaJS.typeImpl = typeImpl;
    //**************** objekt pro data, exportovana z CSharp
    var xsdObj = (function () {
        function xsdObj(json) {
            var _this = this;
            this.props = []; //prop impl
            this.allEnums = [];
            this.allTypes = [];
            //properties from JSON
            if (json)
                for (var p in json)
                    this[p] = json[p];
            //interface => impl
            for (var p in this.types)
                this.allTypes.push(this.types[p] = new typeImpl(this.types[p]));
            for (var p in this.enums)
                this.allEnums.push(this.enums[p] = new enumImpl(this.enums[p]));
            //spocti typeProps
            var ownPropDirs = {};
            _.map(this.properties, function (p) {
                var props = ownPropDirs[p.propOf];
                if (!props)
                    ownPropDirs[p.propOf] = props = [];
                props.push(p);
            });
            _.each(this.types, function (tp) {
                tp.propDir = {};
                tp.props = [];
                tp.ownProps = [];
                var t = tp;
                do {
                    _.each(ownPropDirs[t.name], function (p) {
                        var impl = new propImpl(p);
                        tp.propDir[p.name] = impl;
                        tp.props.push(impl);
                        if (t == tp) {
                            tp.ownProps.push(impl);
                            _this.props.push(impl);
                        }
                    });
                    t = t.ancestor ? _this.types[t.ancestor] : null;
                } while (t);
                tp.props = _.sortBy(tp.props, function (p) { return p.name; });
                tp.ownProps = _.sortBy(tp.ownProps, function (p) { return p.name; });
                //descendants
                if (tp.ancestor) {
                    var anc = _this.types[tp.ancestor];
                    if (!anc.descendants)
                        anc.descendants = [];
                    anc.descendants.push(tp);
                }
            });
            this.props = _.sortBy(this.props, function (p) { return p.name; });
            //sorting descendants
            for (var p in this.types) {
                var t = this.types[p];
                if (t.descendants)
                    t.descendants = _.sortBy(t.descendants, function (t) { return t.name; });
            }
        }
        xsdObj.prototype.rnRoot = function (isTrash) {
            var res = this.types['tag'];
            res.isTrashMode = isTrash;
            return res;
        };
        xsdObj.prototype.rnElements = function () {
            var _this = this;
            return _.sortBy(this.allTypes.filter(function (t) { return t.descendants == null && !t.hasFlag(CourseModel.tgSt.docIgnore) && !_this.inheritsFrom(t.name, 'macro'); }), function (t) { return t.name; }); //t => t._newName || t.name);
        };
        xsdObj.prototype.rnEnums = function () {
            return _.filter(this.allEnums, function (e) { return !e.hasFlag(CourseModel.tgSt.docIgnore); });
        };
        xsdObj.prototype.rnRenameJson = function () {
            var res = _.map(this.rnElements(), function (e) {
                return {
                    old: e.name,
                    'new': e._newName || undefined,
                    props: _.map(e.rnPropsNew(), function (p) { return { old: p.name, 'new': p._newName || undefined }; })
                };
            });
            return JSON.stringify(res).replace(/"/g, '\\"');
        };
        xsdObj.prototype.dcElements = function (isCut) {
            return _.filter(this.rnElements(), function (el) { return isCut == !!xsdObj.cutEls[el.name]; });
        };
        xsdObj.prototype.inheritsFrom = function (self, ancestor) { while (self) {
            if (self == ancestor)
                return true;
            var self = this.types[self].ancestor;
        } return false; };
        xsdObj.prototype.tooglePanel = function (model, ev) {
            var $a = $(ev.currentTarget);
            var $body = $a.parents('.panel').find('.panel-body');
            $body.toggle();
            var isVisible = $body.is(":visible");
            $a.toggleClass('fa-minus', isVisible);
            $a.toggleClass('fa-plus', !isVisible);
        };
        xsdObj.prototype.showProp = function (ev, propOf, prop) {
            alert(propOf + '.' + prop);
        };
        xsdObj.cutEls = { 'cut-dialog': true, 'cut-text': true, 'include-dialog': true, 'include-text': true, 'phrase': true, 'phrase-replace': true, 'replica': true };
        return xsdObj;
    })();
    metaJS.xsdObj = xsdObj;
    var propImpl = (function (_super) {
        __extends(propImpl, _super);
        function propImpl(json) {
            _super.call(this, json);
            this.camelName = Utils.toCammelCase(this.name);
        }
        propImpl.prototype.validateAndAssign = function (value, tag) {
            var trimVal = value.trim();
            delete tag[this.camelName];
            switch (this.type) {
                case metaJS.xsdPropType.Enum:
                    if (this.modifier != metaJS.xsdPropModifier.no)
                        throw 'System error: boolean and modifier';
                    trimVal = trimVal.toLowerCase();
                    var en = this.myEnum();
                    var it = _.find(en.enumData, function (v) { return v.name == trimVal; });
                    if (it) {
                        tag[this.camelName] = it.value;
                        return null;
                    }
                    return 'One from enum value expected';
                case metaJS.xsdPropType.Bool:
                    if (this.modifier != metaJS.xsdPropModifier.no)
                        throw 'System error: boolean and modifier';
                    var isOK = boolVal.test(trimVal = trimVal.toLowerCase());
                    if (isOK) {
                        tag[this.camelName] = trimVal == 'true';
                        return null;
                    }
                    return '[true] or [false] expected';
                case metaJS.xsdPropType.Number:
                    if (this.modifier != metaJS.xsdPropModifier.no)
                        throw 'System error: number and modifier';
                    var isOK = numVal.test(trimVal);
                    if (isOK) {
                        tag[this.camelName] = parseInt(trimVal);
                        return null;
                    }
                    return 'Number expected';
                case metaJS.xsdPropType.String:
                    if (this.modifier == metaJS.xsdPropModifier.no) {
                        switch (this.constrains) {
                            case metaJS.xsdPropConstrains.no:
                                tag[this.camelName] = waEncode.unEscape(value);
                                return null;
                            case metaJS.xsdPropConstrains.idref:
                            case metaJS.xsdPropConstrains.ncname:
                            case metaJS.xsdPropConstrains.id:
                                var isOK = idVal.test(trimVal);
                                if (isOK) {
                                    tag[this.camelName] = trimVal;
                                    return null;
                                }
                                return 'Identifier expected';
                            default: throw 'System error: xsdPropType.String with unknown constrains';
                        }
                    }
            }
            return null;
        };
        propImpl.prototype.myEnum = function () {
            if (this.type != metaJS.xsdPropType.Enum)
                throw 'metaJS.propImpl.Enum: this.type != xsdPropType.Enum';
            return metaJS.metaObj.enums[this.clsEnumName];
        };
        return propImpl;
    })(implLow);
    metaJS.propImpl = propImpl;
    var boolVal = /^(true)|(false)$/i;
    var numVal = /^\d+$/;
    var idVal = /^\s*[a-z][\w-]*\s*$/i;
    metaJS.metaObj = new xsdObj(metaJS.metaData);
})(metaJS || (metaJS = {}));
