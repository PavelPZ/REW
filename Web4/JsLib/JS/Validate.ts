/// <reference path="../jsd/jquery.d.ts" />
/// <reference path="../jsd/knockout.d.ts" />
/// <reference path="../jsd/jsrender.d.ts" />
/// <reference path="../jsd/underscore.d.ts" /> 
/// <reference path="../js/Utils.ts" />
module validate {

  export enum types {   
    empty,
    required,
    email,
    minlength,
    rangelength,
    range,
    rangeMin,
    rangeMax,
    depended,
    regEx,
  }

  var c_email = () => CSLocalize('27747c60f8a24429855917008c65521f', 'E-mail');
  var c_password = () => CSLocalize('74a95445936f44558cd585dd8b3d7b29', 'Password');
  var c_confirmPsw = () => CSLocalize('16636e21101c4ebf8a1bae8f358da7b5', 'Confirm password');

  export function email(prop: any, required: boolean): InputModel {
    (<ValidObservable<any>>prop).required = required;
    return validate.inputModel("email", c_email(), prop, validate.types.email);
  }
  export function regex(prop: any, mask: RegExp, name: string, title: string): InputModel {
    (<ValidObservable<any>>prop).mask = mask;
    return validate.inputModel(name, title, prop, validate.types.regEx);
  }
  export function minLen(prop: any, minLen: number, name: string, title: string): InputModel {
    (<ValidObservable<any>>prop).min = minLen;
    return validate.inputModel(name, title, prop, validate.types.minlength);
  }
  export function password(prop: any, minLen: number, name: string = "password", title: string = null): InputModel {
    if (title == null) title = c_password();
    (<ValidObservable<any>>prop).min = minLen;
    return validate.inputModel(name, title, prop, validate.types.minlength, validate.controlType.password);
  }
  export function confirmPsw(prop: any, on: any): InputModel {
    (<ValidObservable<any>>prop).on = on;
    return validate.inputModel("confirmPsw", c_confirmPsw(), prop, validate.types.depended, validate.controlType.password);
  }
  export function Null(): InputModel {
    return validate.inputModel(null, null, null, null, null);
  }
  export function empty(prop: any, name: string, title: string): InputModel {
    return validate.inputModel(name, title, prop, validate.types.empty);
  }

  (<any>(ko.extenders)).lm = function (target: ValidObservable<any>, par) {
    if (target.type == types.empty) {
      target.validate = () => { };
      return target;
    }
    target.hasError = ko.observable<Boolean>(); target.message = ko.observable<string>(); target.hasfocus = ko.observable<boolean>();
    target.validOk = () => { //kontrolka s buttonem
      if (!target.ok) return;
      focusStatus = 2; //force zobraz chybu
      validate();
      if (target.hasError()) return;
      focusStatus = 0; //validace OK, uschovej chyby
      target.ok();
    };

    var msg: string = null;
    function validInt (value: string): number { 
      if (value == null || value.length <= 0) return NaN;
      if (!/^\d+$/.test(value)) return NaN;
      return parseInt(value);
    }
    function validate(fake: any = null, force: boolean = false) {
      var value = $.trim(target());
      switch (target.type) {
        case types.regEx:
          var valid = target.mask.test(value);
          msg = valid ? null : target.errorMessage || messages.required();
          break;
        case types.email:
          var empty = value.length == 0;
          var valid = !(target.required && empty);
          msg = valid ? null : messages.required();
          if (valid && !empty) {
            valid = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
            msg = valid ? null : target.errorMessage || messages.email();
          }
          break;
        case types.required:
          var valid = value.length > 0;
          msg = valid ? null : target.errorMessage || messages.required();
          break;
        case types.minlength:
          var len = value.length;
          var valid = len >= target.min;
          msg = valid ? null : Utils.string_format(target.errorMessage || messages.minlength(), [target.min]);
          break;
        case types.rangelength:
          var len = value.length;
          var valid = len >= target.min && len <= target.max;
          msg = valid ? null : Utils.string_format(target.errorMessage || messages.rangelength(), [target.min, target.max]);
          break;
        case types.range:
          var val = validInt(value);
          var valid = !isNaN(val) && val >= target.min && val <= target.max;
          msg = valid ? null : Utils.string_format(target.errorMessage || messages.range(), [target.min, target.max]);
          break;
        case types.rangeMin:
          var val = validInt(value);
          var valid = !isNaN(val) && val >= target.min;
          msg = valid ? null : Utils.string_format(target.errorMessage || messages.min(), [target.min]);
          break;
        case types.rangeMax:
          var val = validInt(value);
          var valid = !isNaN(val) && val <= target.max;
          msg = valid ? null : Utils.string_format(target.errorMessage || messages.max(), [target.max]);
          break;
        case types.depended:
          var valid = ($.trim(target.on()) == value) && (value.length > 0);
          msg = valid ? null : target.errorMessage || messages.equalTo();
          break;
        default:
          throw "notImplemented"
      }
      if (valid && target.customValidation) { msg = target.customValidation(value); valid = msg == null; }
      target.hasError(!valid);
      if (force || focusStatus == 2) target.message(msg);
    }
    validate();
    target.subscribe(validate);
    if (target.type == types.depended) target.on.subscribe(validate);
    var focusStatus = 0;
    target.hasfocus.subscribe((val: boolean) => {
      if (val && focusStatus == 0) focusStatus = 1; else if (!val && focusStatus == 1) focusStatus = 2;
      if (focusStatus == 2) target.message(msg);
    });
    target.validate = () => validate(null, true);
    target.resetFocusStatus = () => focusStatus = 0;
    target.get = () => {
      var value = $.trim(target());
      switch (target.type) {
        case types.email:
          return <any>value.toLowerCase();
        case types.range:
        case types.rangeMin:
        case types.rangeMax:
          return validInt(value);
        default:
          return value;
      }
    };
    target.set = (val) => {
      target(val.toString());
    };
    return target;
  };

  //ko vlastnosti: rozsireni vsech Observables o validaci
  export interface ValidObservable<T> extends KnockoutSubscribable<T> {
    (): any;
    (value): void;
    hasError: KnockoutObservable<Boolean>;
    message: KnockoutObservable<String>;
    hasfocus: KnockoutObservable<Boolean>;
    //title: KnockoutObservableString;
    validate: () => void;
    get: () => any;
    set: (val:any) => void;
    resetFocusStatus: () => void;
    type: types;
    subscribe(fnc);
    //Pro input s buttonem:
    ok: () => void; //nutno dosadit zvenci: klik OK pri validnim Input
    validOk: () => void; //click databind.
    //nutno dosadit zvenci: neni-li null, po uspesne standardni validaci se vola jeste tato. Vraci text chyby nebo null;
    customValidation: (val:any) => string;
    //valid type specific udaje
    required: boolean; //pro email
    mask: RegExp;
    min: number;
    max: number;
    on: KnockoutObservable<any>;
    errorMessage: string;
  }

  //JsRender vlastnosti
  export interface InputModel {
    name: string;
    title: string;
    //type: controlType;
    textType: string;
    btnTitle: string;
    prop: ValidObservable<any>;
  }

  ////JsRender vlastnosti
  //export interface InputBtnModel extends InputModel {
  //}

  export function isValid(models: InputModel[]): boolean {
    return isPropsValid(_.map(models, m => m.prop));
    //var res = true;
    //_.each(models, (inp: validate.InputModel) => {
    //  if (!inp.prop) return;
    //  inp.prop.validate();
    //  res = res && (!inp.prop.hasError || !inp.prop.hasError());
    //});
    //return res;
  }


  export function isPropsValid(props: ValidObservable<any>[]): boolean {
    var res = true;
    _.each(props,(prop: ValidObservable<any>) => {
      prop.validate();
      res = res && (!prop.hasError || !prop.hasError());
    });
    //form OK: reset focusStatus
    if (res) _.each(props,(prop: ValidObservable<any>) => {
      if (prop.resetFocusStatus) prop.resetFocusStatus();
    });
    return res;
  }

  export enum controlType {
    text,
    password,
    //department
  }

  export function create(type: types, finish: (prop: ValidObservable<any>) => void = null): ValidObservable<any> {
    var res: ValidObservable<any> = <any>ko.observable();
    res.type = type;
    if (finish) finish(res);
    res.extend({ lm: null});
    return res;
  }

  export function inputModel(name: string, title: string, prop: ValidObservable<any>, valType: types, type: controlType = controlType.text): InputModel {
    var res: InputModel = { name: name, title: title, prop: prop, textType: null, btnTitle:null };
    if (prop == null) return res;
    switch (type) {
      case controlType.text: res.textType = "text"; break;
      case controlType.password: res.textType = "password"; break;
      //case controlType.department: break;
    }
    prop.type = valType;
    prop.extend({ lm: {x:true} });
    return res;
  }

  //export function inputBtnModel(name: string, title: string, btnTitle: string, prop: ValidObservable, valType: types, type: controlType = controlType.text): InputBtnModel {
  //  var res = <InputBtnModel> inputModel(name, title, prop, valType, type);
  //  res.btnTitle = btnTitle;
  //  return res;
  //}

  ko.bindingHandlers['visibility'] = {
    'update': function (element: HTMLElement, valueAccessor) {
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

  export var messages = {
    required: () => CSLocalize('8dd00c8210854c5eb8fb7bc017cfa21e', 'This field is required.'),
    email: () => CSLocalize('c913db0985a940c09d95ebfa7459a4be', 'Please enter a valid email address.'),
    equalTo: () => CSLocalize('9a47c9f99dce4e43859d7029e9ae6955', 'Please enter the same value again.'),
    remote: () => "Please fix this field.",
    url: () => "Please enter a valid URL.",
    date: () => "Please enter a valid date.",
    dateISO: () => "Please enter a valid date (ISO).",
    number: () => "Please enter a valid number.",
    digits: () => "Please enter only digits.",
    creditcard: () => "Please enter a valid credit card number.",
    maxlength: () => "Please enter no more than {0} characters.",
    minlength: () => CSLocalize('106ee5f0757b4829af9c71cc2c557093', 'Please enter at least 3 characters.'),
    rangelength: () => CSLocalize('915e1b2dbd2d44df89cdf4e9bbdee3df', 'Please enter a value between {0} and {1} characters long.'),
    range: () => "Please enter a value between {0} and {1}.",
    max: () => "Please enter a value less than or equal to {0}.",
    min: () =>  CSLocalize('f03951d4577b484ca04b639ad6d96514', 'Please enter a value greater than or equal to {0}.')
  }
}

