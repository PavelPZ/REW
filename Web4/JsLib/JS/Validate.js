/// <reference path="../jsd/jquery.d.ts" />
/// <reference path="../jsd/knockout.d.ts" />
/// <reference path="../jsd/jsrender.d.ts" />
/// <reference path="../jsd/underscore.d.ts" /> 
/// <reference path="../js/Utils.ts" />
var validate;
(function (validate_1) {
    (function (types) {
        types[types["empty"] = 0] = "empty";
        types[types["required"] = 1] = "required";
        types[types["email"] = 2] = "email";
        types[types["minlength"] = 3] = "minlength";
        types[types["rangelength"] = 4] = "rangelength";
        types[types["range"] = 5] = "range";
        types[types["rangeMin"] = 6] = "rangeMin";
        types[types["rangeMax"] = 7] = "rangeMax";
        types[types["depended"] = 8] = "depended";
        types[types["regEx"] = 9] = "regEx";
    })(validate_1.types || (validate_1.types = {}));
    var types = validate_1.types;
    var c_email = function () { return CSLocalize('27747c60f8a24429855917008c65521f', 'E-mail'); };
    var c_password = function () { return CSLocalize('74a95445936f44558cd585dd8b3d7b29', 'Password'); };
    var c_confirmPsw = function () { return CSLocalize('16636e21101c4ebf8a1bae8f358da7b5', 'Confirm password'); };
    function email(prop, required) {
        prop.required = required;
        return validate.inputModel("email", c_email(), prop, validate.types.email);
    }
    validate_1.email = email;
    function regex(prop, mask, name, title) {
        prop.mask = mask;
        return validate.inputModel(name, title, prop, validate.types.regEx);
    }
    validate_1.regex = regex;
    function minLen(prop, minLen, name, title) {
        prop.min = minLen;
        return validate.inputModel(name, title, prop, validate.types.minlength);
    }
    validate_1.minLen = minLen;
    function password(prop, minLen, name, title) {
        if (name === void 0) { name = "password"; }
        if (title === void 0) { title = null; }
        if (title == null)
            title = c_password();
        prop.min = minLen;
        return validate.inputModel(name, title, prop, validate.types.minlength, validate.controlType.password);
    }
    validate_1.password = password;
    function confirmPsw(prop, on) {
        prop.on = on;
        return validate.inputModel("confirmPsw", c_confirmPsw(), prop, validate.types.depended, validate.controlType.password);
    }
    validate_1.confirmPsw = confirmPsw;
    function Null() {
        return validate.inputModel(null, null, null, null, null);
    }
    validate_1.Null = Null;
    function empty(prop, name, title) {
        return validate.inputModel(name, title, prop, validate.types.empty);
    }
    validate_1.empty = empty;
    (ko.extenders).lm = function (target, par) {
        if (target.type == types.empty) {
            target.validate = function () { };
            return target;
        }
        target.hasError = ko.observable();
        target.message = ko.observable();
        target.hasfocus = ko.observable();
        target.validOk = function () {
            if (!target.ok)
                return;
            focusStatus = 2; //force zobraz chybu
            validate();
            if (target.hasError())
                return;
            focusStatus = 0; //validace OK, uschovej chyby
            target.ok();
        };
        var msg = null;
        function validInt(value) {
            if (value == null || value.length <= 0)
                return NaN;
            if (!/^\d+$/.test(value))
                return NaN;
            return parseInt(value);
        }
        function validate(fake, force) {
            if (fake === void 0) { fake = null; }
            if (force === void 0) { force = false; }
            var value = $.trim(target());
            switch (target.type) {
                case types.regEx:
                    var valid = target.mask.test(value);
                    msg = valid ? null : target.errorMessage || validate_1.messages.required();
                    break;
                case types.email:
                    var empty = value.length == 0;
                    var valid = !(target.required && empty);
                    msg = valid ? null : validate_1.messages.required();
                    if (valid && !empty) {
                        valid = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
                        msg = valid ? null : target.errorMessage || validate_1.messages.email();
                    }
                    break;
                case types.required:
                    var valid = value.length > 0;
                    msg = valid ? null : target.errorMessage || validate_1.messages.required();
                    break;
                case types.minlength:
                    var len = value.length;
                    var valid = len >= target.min;
                    msg = valid ? null : Utils.string_format(target.errorMessage || validate_1.messages.minlength(), [target.min]);
                    break;
                case types.rangelength:
                    var len = value.length;
                    var valid = len >= target.min && len <= target.max;
                    msg = valid ? null : Utils.string_format(target.errorMessage || validate_1.messages.rangelength(), [target.min, target.max]);
                    break;
                case types.range:
                    var val = validInt(value);
                    var valid = !isNaN(val) && val >= target.min && val <= target.max;
                    msg = valid ? null : Utils.string_format(target.errorMessage || validate_1.messages.range(), [target.min, target.max]);
                    break;
                case types.rangeMin:
                    var val = validInt(value);
                    var valid = !isNaN(val) && val >= target.min;
                    msg = valid ? null : Utils.string_format(target.errorMessage || validate_1.messages.min(), [target.min]);
                    break;
                case types.rangeMax:
                    var val = validInt(value);
                    var valid = !isNaN(val) && val <= target.max;
                    msg = valid ? null : Utils.string_format(target.errorMessage || validate_1.messages.max(), [target.max]);
                    break;
                case types.depended:
                    var valid = ($.trim(target.on()) == value) && (value.length > 0);
                    msg = valid ? null : target.errorMessage || validate_1.messages.equalTo();
                    break;
                default:
                    throw "notImplemented";
            }
            if (valid && target.customValidation) {
                msg = target.customValidation(value);
                valid = msg == null;
            }
            target.hasError(!valid);
            if (force || focusStatus == 2)
                target.message(msg);
        }
        validate();
        target.subscribe(validate);
        if (target.type == types.depended)
            target.on.subscribe(validate);
        var focusStatus = 0;
        target.hasfocus.subscribe(function (val) {
            if (val && focusStatus == 0)
                focusStatus = 1;
            else if (!val && focusStatus == 1)
                focusStatus = 2;
            if (focusStatus == 2)
                target.message(msg);
        });
        target.validate = function () { return validate(null, true); };
        target.resetFocusStatus = function () { return focusStatus = 0; };
        target.get = function () {
            var value = $.trim(target());
            switch (target.type) {
                case types.email:
                    return value.toLowerCase();
                case types.range:
                case types.rangeMin:
                case types.rangeMax:
                    return validInt(value);
                default:
                    return value;
            }
        };
        target.set = function (val) {
            target(val.toString());
        };
        return target;
    };
    ////JsRender vlastnosti
    //export interface InputBtnModel extends InputModel {
    //}
    function isValid(models) {
        return isPropsValid(_.map(models, function (m) { return m.prop; }));
        //var res = true;
        //_.each(models, (inp: validate.InputModel) => {
        //  if (!inp.prop) return;
        //  inp.prop.validate();
        //  res = res && (!inp.prop.hasError || !inp.prop.hasError());
        //});
        //return res;
    }
    validate_1.isValid = isValid;
    function isPropsValid(props) {
        var res = true;
        _.each(props, function (prop) {
            prop.validate();
            res = res && (!prop.hasError || !prop.hasError());
        });
        //form OK: reset focusStatus
        if (res)
            _.each(props, function (prop) {
                if (prop.resetFocusStatus)
                    prop.resetFocusStatus();
            });
        return res;
    }
    validate_1.isPropsValid = isPropsValid;
    (function (controlType) {
        controlType[controlType["text"] = 0] = "text";
        controlType[controlType["password"] = 1] = "password";
    })(validate_1.controlType || (validate_1.controlType = {}));
    var controlType = validate_1.controlType;
    function create(type, finish) {
        if (finish === void 0) { finish = null; }
        var res = ko.observable();
        res.type = type;
        if (finish)
            finish(res);
        res.extend({ lm: null });
        return res;
    }
    validate_1.create = create;
    function inputModel(name, title, prop, valType, type) {
        if (type === void 0) { type = controlType.text; }
        var res = { name: name, title: title, prop: prop, textType: null, btnTitle: null };
        if (prop == null)
            return res;
        switch (type) {
            case controlType.text:
                res.textType = "text";
                break;
            case controlType.password:
                res.textType = "password";
                break;
        }
        prop.type = valType;
        prop.extend({ lm: { x: true } });
        return res;
    }
    validate_1.inputModel = inputModel;
    //export function inputBtnModel(name: string, title: string, btnTitle: string, prop: ValidObservable, valType: types, type: controlType = controlType.text): InputBtnModel {
    //  var res = <InputBtnModel> inputModel(name, title, prop, valType, type);
    //  res.btnTitle = btnTitle;
    //  return res;
    //}
    ko.bindingHandlers['visibility'] = {
        'update': function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            var isCurrentlyVisible = element.style.visibility != "hidden";
            if (value && !isCurrentlyVisible)
                element.style.visibility = "";
            else if (!value && isCurrentlyVisible)
                element.style.visibility = "hidden";
        }
    };
    //nefunguje v MSIE 7
    //ko.bindingHandlers['placeholder'] = {
    //  'update': function (element: HTMLElement, valueAccessor) {
    //    var value = ko.utils.unwrapObservable(valueAccessor());
    //    $(element).attr("placeholder", value);
    //  }
    //};
    validate_1.messages = {
        required: function () { return CSLocalize('8dd00c8210854c5eb8fb7bc017cfa21e', 'This field is required.'); },
        email: function () { return CSLocalize('c913db0985a940c09d95ebfa7459a4be', 'Please enter a valid email address.'); },
        equalTo: function () { return CSLocalize('9a47c9f99dce4e43859d7029e9ae6955', 'Please enter the same value again.'); },
        remote: function () { return "Please fix this field."; },
        url: function () { return "Please enter a valid URL."; },
        date: function () { return "Please enter a valid date."; },
        dateISO: function () { return "Please enter a valid date (ISO)."; },
        number: function () { return "Please enter a valid number."; },
        digits: function () { return "Please enter only digits."; },
        creditcard: function () { return "Please enter a valid credit card number."; },
        maxlength: function () { return "Please enter no more than {0} characters."; },
        minlength: function () { return CSLocalize('106ee5f0757b4829af9c71cc2c557093', 'Please enter at least 3 characters.'); },
        rangelength: function () { return CSLocalize('915e1b2dbd2d44df89cdf4e9bbdee3df', 'Please enter a value between {0} and {1} characters long.'); },
        range: function () { return "Please enter a value between {0} and {1}."; },
        max: function () { return "Please enter a value less than or equal to {0}."; },
        min: function () { return CSLocalize('f03951d4577b484ca04b639ad6d96514', 'Please enter a value greater than or equal to {0}.'); }
    };
})(validate || (validate = {}));
