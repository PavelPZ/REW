//Soucast external, laduje se pred REW JS souborem
interface Array<T> {
  pushArray(arr: Array<T>): Array<T>;
}
Array.prototype.pushArray = function (arr) {
  if (arr) this.push.apply(this, arr);
  return this;
};

module bowser {

  /**
* navigator.userAgent =>
* Chrome:  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.57 Safari/534.24"
* Opera:   "Opera/9.80 (Macintosh; Intel Mac OS X 10.6.7; U; en) Presto/2.7.62 Version/11.01"
* Safari:  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; en-us) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1"
* IE:      "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C)"
* IE>=11:  "Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; .NET4.0E; .NET4.0C; Media Center PC 6.0; rv:11.0) like Gecko"
* Firefox: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:2.0) Gecko/20100101 Firefox/4.0"
* iPhone:  "Mozilla/5.0 (iPhone Simulator; U; CPU iPhone OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5"
* iPad:    "Mozilla/5.0 (iPad; U; CPU OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5",
* Android: "Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; T-Mobile G2 Build/GRJ22) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"
* Touchpad: "Mozilla/5.0 (hp-tabled;Linux;hpwOS/3.0.5; U; en-US)) AppleWebKit/534.6 (KHTML, like Gecko) wOSBrowser/234.83 Safari/534.6 TouchPad/1.0"
* PhantomJS: "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.5.0 Safari/534.34"
*/

  var ua = navigator.userAgent
    , t = true
    , ie = /(msie|trident)/i.test(ua)
    , chrome = /chrome|crios/i.test(ua)
    , phantom = /phantom/i.test(ua)
    , safari = /safari/i.test(ua) && !chrome && !phantom
    , iphone = /iphone/i.test(ua)
    , ipad = /ipad/i.test(ua)
    , touchpad = /touchpad/i.test(ua)
    , android = /android/i.test(ua)
    , opera = /opera/i.test(ua) || /opr/i.test(ua)
    , firefox = /firefox/i.test(ua)
    , gecko = /gecko\//i.test(ua)
    , seamonkey = /seamonkey\//i.test(ua)
    , webkitVersion = /version\/(\d+(\.\d+)?)/i
    , firefoxVersion = /firefox\/(\d+(\.\d+)?)/i
    , o

  function detect() {

    if (ie) return {
      name: 'Internet Explorer'
      , msie: t
      , version: ua.match(/(msie |rv:)(\d+(\.\d+)?)/i)[2]
    }
    if (opera) return {
      name: 'Opera'
      , opera: t
      , version: ua.match(webkitVersion) ? ua.match(webkitVersion)[1] : ua.match(/opr\/(\d+(\.\d+)?)/i)[1]
    }
    if (chrome) return {
      name: 'Chrome'
      , webkit: t
      , chrome: t
      , version: ua.match(/(?:chrome|crios)\/(\d+(\.\d+)?)/i)[1]
    }
    if (phantom) return {
      name: 'PhantomJS'
      , webkit: t
      , phantom: t
      , version: ua.match(/phantomjs\/(\d+(\.\d+)+)/i)[1]
    }
    if (touchpad) return {
      name: 'TouchPad'
      , webkit: t
      , touchpad: t
      , version: ua.match(/touchpad\/(\d+(\.\d+)?)/i)[1]
    }
    if (iphone || ipad) {
      o = {
        name: iphone ? 'iPhone' : 'iPad'
        , webkit: t
        , mobile: t
        , ios: t
        , iphone: iphone
        , ipad: ipad
      }
      // WTF: version is not part of user agent in web apps
      if (webkitVersion.test(ua)) {
        o.version = ua.match(webkitVersion)[1]
      }
      return o
    }
    if (android) return {
      name: 'Android'
      , webkit: t
      , android: t
      , mobile: t
      , version: (ua.match(webkitVersion) || ua.match(firefoxVersion))[1]
    }
    if (safari) return {
      name: 'Safari'
      , webkit: t
      , safari: t
      , version: ua.match(webkitVersion)[1]
    }
    if (gecko) {
      o = {
        name: 'Gecko'
        , gecko: t
        , mozilla: t
        , version: ua.match(firefoxVersion)[1]
      }
      if (firefox) {
        o.name = 'Firefox';
        o.firefox = t;
      }
      return o
    }
    if (seamonkey) return {
      name: 'SeaMonkey'
      , seamonkey: t
      , version: ua.match(/seamonkey\/(\d+(\.\d+)?)/i)[1]
    }
    return {}
  }

  export var agent = <agentInfo>detect();

  // Graded Browser Support
  // http://developer.yahoo.com/yui/articles/gbs
  if ((agent.msie && agent.version >= 8) ||
    (agent.chrome && agent.version >= 10) ||
    (agent.firefox && agent.version >= 4.0) ||
    (agent.safari && agent.version >= 5) ||
    (agent.opera && agent.version >= 10.0)) {
    agent.a = t;
  }

  else if ((agent.msie && agent.version < 8) ||
    (agent.chrome && agent.version < 10) ||
    (agent.firefox && agent.version < 4.0) ||
    (agent.safari && agent.version < 5) ||
    (agent.opera && agent.version < 10.0)) {
    agent.c = t
  } else agent.x = t

  export var dataStr = JSON.stringify(agent);

  export interface agentInfo {
    msie: boolean;
    chrome: boolean;
    firefox: boolean;
    safari: boolean;
    opera: boolean;
    webkit: boolean;
    phantom: boolean;
    touchpad: boolean;
    mobile: boolean;
    ios: boolean;
    gecko: boolean;
    android: boolean;
    mozilla: boolean;
    seamonkey: boolean;

    a: boolean;
    c: boolean;
    x: boolean;

    version: number;
  }

}

module Utils {

  export function getObjectClassName(obj) {
    if (obj && obj.constructor && obj.constructor.toString()) {

      /*
       *  for browsers which have name property in the constructor
       *  of the object,such as chrome 
       */
      if (obj.constructor.name) {
        return obj.constructor.name;
      }
      var str = obj.constructor.toString();
      /*
       * executed if the return of object.constructor.toString() is 
       * "[object objectClass]"
       */

      if (str.charAt(0) == '[') {
        var arr = str.match(/\[\w+\s*(\w+)\]/);
      } else {
        /*
         * executed if the return of object.constructor.toString() is 
         * "function objectClass () {}"
         * for IE Firefox
         */
        var arr = str.match(/function\s*(\w+)/);
      }
      if (arr && arr.length == 2) {
        return arr[1];
      }
    }
    return undefined;
  };


  export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
        if (name !== 'constructor') {
          derivedCtor.prototype[name] = baseCtor.prototype[name];
        }
      });
    });
  }
  //applyMixins (srcType, [copyFrom1, copyFrom2,...]);

  export function longLog(lines: string) { _.each(lines.split('\n'), l => console.log(l)); }

  export function extendJsonDataByClass(jsonData: Object, cls: Object) {
    var t = (<any>cls).prototype; for (var p in t) jsonData[p] = t[p]; jsonData.constructor();
  }

  export function endsWith(str, suffix) { return str.indexOf(suffix, str.length - suffix.length) !== -1; }
  export function startsWith(str, suffix) { return str.indexOf(suffix) == 0; }

  // Encodes the basic 4 characters used to malform HTML in XSS hacks
  export function htmlEncode(s: string): string {
    return _.isEmpty(s) ? '' : s.replace(/\'/g, "&#39;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  export function htmlDecode(s: string): string {
    return _.isEmpty(s) ? '' : s.replace(/\'/g, "&#39;").replace(/\"/g, "&#34;").replace(/</g, "&#60;").replace(/>/g, "&#62;");
  }

  export function endWith(src: string, suffix: string): boolean {
    return src.indexOf(suffix, this.length - suffix.length) !== -1;
  }

  export function toCammelCase(obj: string): string {
    return obj.replace(toCammelCaseRegex, (s, group1) => group1.toUpperCase())
  }
  export function fromCammelCase(obj: string): string {
    return obj.replace(fromCammelCaseRegex, (s, group1: string) => '-' + group1.toLowerCase())
  }
  export function normalizeCamelCase(obj: Object) {
    _.each(_.keys(obj), key => {
      var replaced = toCammelCase(key.toLowerCase());
      if (replaced == key) return;
      obj[replaced] = obj[key];
      delete obj[key];
    });
  }
  var toCammelCaseRegex = /-([a-z])/gi;
  var fromCammelCaseRegex = /([A-Z])/g;

  export function extendClass(derivedCtor: any, baseCtors: any[]) {
    extendObject(derivedCtor.prototype, baseCtors);
  }

  export function extendObject(obj: Object, baseCtors: any[]) {
    _.each(baseCtors, baseCtor => {
      var p = baseCtor.prototype;
      for (var name in p) if (p.hasOwnProperty(name)) obj[name] = p[name];
    });
  }
  //export function extendLow(d: Object, t: Object, tp: runtimeType = 0) { t = (<any>t).prototype; for (var p in t) d[p] = t[p]; }

  export function fullUrl(url: string): boolean {
    return !_.isEmpty(url) && url.indexOf('://') > 0;
  }

  //export function relativeUrl(relativePath: string, basePath: string) {
  //  relativePath = relativePath.toLowerCase(); basePath = basePath.toLowerCase();
  //  if (relativePath.charAt(0) !== '/') throw 'URI is already relative';
  //  if (basePath.charAt(0) !== '/') throw 'Cannot calculate a URI relative to another relative URI';
  //  if (relativePath === basePath) return relativePath;
  //  //var relative = relativePath.split('/'); var base = basePath.split('/');
  //  var common = commonPath(relativePath, basePath);
  //  var parents = basePath
  //    .substring(common)
  //    .replace(/[^\/]*$/, '')
  //    .replace(/.*?\//g, '../');
  //}

  //function commonPath(o: string, t: string): number {
  //  var one = o.split('/'); var two = t.split('/');
  //  var l = 0;
  //  for (var i = 0; i < Math.min(one.length, two.length); i++)
  //    if (one[i] != two[i]) return l; else l += one[i].length + 1;
  //};

  export function combineUrl(url: string, concat: string) {
    if (_.isEmpty(concat) || concat.charAt(0) == '/' || concat.indexOf('://') > 0) return concat;
    if (!url) throw "!url";
    var url1 = url.split('/'); url1 = url1.slice(0, url1.length - 1);
    var url2 = concat.split('/');
    var url3 = [];
    for (var i = 0, l = url1.length; i < l; i++) {
      if (url1[i] == '..') {
        url3.pop();
      } else if (url1[i] == '.') {
        continue;
      } else {
        url3.push(url1[i]);
      }
    }
    for (var i = 0, l = url2.length; i < l; i++) {
      if (url2[i] == '..') {
        url3.pop();
      } else if (url2[i] == '.') {
        continue;
      } else {
        url3.push(url2[i]);
      }
    }
    return url3.join('/');
  }

  export function extend(literal: Object, type: any) {
    type = type.prototype;
    literal['constructor'] = type['constructor'];
    for (var name in type) literal[name] = type[name];
    literal.constructor();
  }

  export function modulo(s: number, m: number): { m: number; z: number; } {
    var z = s % m;
    return { m: (s - z) / m, z: z };
  }

  //http://mark.koli.ch/use-javascript-and-jquery-to-get-user-selected-text
  export function getSelection(): string {
    if (window.getSelection) return window.getSelection().toString();
    if (document.getSelection) return document.getSelection().toString();
    if (document.selection) return document.selection.createRange().text;
    return '';
  }

  export var LMComVersion = "1";

  export function scormApiUrl() { return typeof (scorm) == 'undefined' ? '' : scorm.apiUrl; }

  export function appIdViaUrl(): string {
    var sapi = Utils.scormApiUrl();
    return _.isEmpty(sapi) ? (window.location.host + window.location.pathname).toLowerCase() : sapi;
  }

  export function flate(obj): Object {
    return _.isObject(obj) ? _.object(_.filter(_.pairs(obj), p => _.isString(p[1]) || _.isNumber(p[1]) || _.isBoolean(p[1]) || _.isDate(p[1]) || _.isEmpty(p[1]))) : {};
  }

  //Returns a random number between min and max
  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  //Returns a random integer between min and max
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  //http://www.htmlblog.us/random-javascript-array 
  //http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
  export function randomizeArray<T>(array: Array<T>): Array<T> {
    for (var i = array.length - 1; i > 0; i--) {
      var j = i;
      while (j == i) j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  //export function hashDir1(name: string, mask: number = 0x7F): string {
  //  var xor = 0;
  //  _.each(gCrypt.stringToByteArray(md5.Encode(name)), (n: number) => xor = (xor ^ n) & mask);
  //  return LowUtils.bytesToHex([xor]);
  //}

  //export function hashDir2(name: string, mask: number = 0x7F) {
  //  var cd = gCrypt.stringToByteArray(md5.Encode(name));
  //  var xor1 = 0; var xor2 = 0;
  //  for (var i = 0; i < 8; i++) xor1 = (xor1 ^ cd[i]) & mask;
  //  for (var i = 8; i < 16; i++) xor2 = (xor2 ^ cd[i]) & mask;
  //  return LowUtils.bytesToHex([xor1]) + "/" + LowUtils.bytesToHex([xor2]);
  //}

  export function toClipboard(s: string) {
    if (!window.clipboardData) return;
    window.clipboardData.setData("Text", s);
  }

  export interface layoutCell {
    width: number; //span<width> v row-fluid
    tmpl: string;
    data: Object;
  }
  export function createLayoutCell(width: number, tmpl: string, data: Object) { return { width: width, tmpl: tmpl, data: data }; }

  export function longToByteArray(num: number): number[] {
    // we want to represent the input as a 8-bytes array
    var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

    for (var index = 0; index < byteArray.length; index++) {
      var bt = num & 0xff;
      byteArray[index] = bt;
      num = (num - bt) / 256;
    }

    return byteArray;
  };

  export function byteArrayToLong(byteArray: number[]): number {
    var value = 0;
    for (var i = byteArray.length - 1; i >= 0; i--) {
      value = (value * 256) + byteArray[i];
    }
    return value;
  };

  export function Empty(val: any) {
    return typeof val == "undefined" || !val || val == null || val == '' || val == 0;
  }

  if ($.views) $.views.helpers({
    empty: Empty,
    call_debugger: () => { debugger; return ""; },
    notEmpty: (val) => !_.isEmpty(val),
    extend: (src, byStr) => {
      var res = JSON.parse("{" + byStr + "}");
      return $.extend(src, res);
    },
    intToDate: (val) => Utils.intToDateStr(val),
    intToDateLong: (val) => Utils.intToDateStrLong(val),
    reverse: (val) => { var res = val.slice(); res.reverse(); return res; },
    smallFlagCls: (line: LMComLib.LineIds) => "flag-small flag-small-" + LowUtils.EnumToString(LMComLib.LineIds, line).toLowerCase(),
    midFlagCls: (line: LMComLib.LineIds, isBkg: boolean) => (isBkg ? "flag-mid-bg " : "flag-mid ") + "flag-mid-" + LowUtils.EnumToString(LMComLib.LineIds, line).toLowerCase(),
    cfgString: () => encodeURIComponent(JSON.stringify(cfg))

  });

  export function tuples(items: any[]): any[][] {
    var res = [[]];
    if (items == null || items.length == 0) return res;
    for (var i = 0; i < items.length; i += 2) {
      res.push([items[i], i + 1 < items.length ? items[i + 1] : null]);
    }
  }

  export function guid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  export function encodeURL(url: string, params: Object) {
    var res = url;
    var k, i = 0;
    var firstSeparator = (url.indexOf("?") === -1) ? '?' : '&';
    for (k in params) {
      res += (i++ === 0 ? firstSeparator : '&') + encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    }
    return res;
  }

  //http://stackoverflow.com/questions/1877788/javascript-date-to-c-sharp-via-ajax
  var localOffset = new Date().getTimezoneOffset() * 60000;
  export function toUtcTime(dt: Date): Date { return new Date(dt.getTime() + localOffset); }

  
  export function nowToInt(): number { return dateToInt(new Date()); } //milivteriny
  export function nowToNum(): number { return dateToNum(new Date()); } //vteriny
  export function nowToDay(): number { return dayToInt(new Date()); } //dny
  export function formatDateLow(dt: Date): string { return Globalize.format(dt, 'd'); }
  export function formatTimeLow(dt: Date): string { return Globalize.format(dt, ', H:m:s'); }

  //vteriny
  export function dateToNum(dt: Date): number { return Math.floor(dateToInt(dt) / 1000); }
  export function numToDate(num: number): Date { return new Date(num * 1000); }
  export function formatDate(sec: number) { return formatTimeLow(numToDate(sec)); }
  export function formatDateTime(sec: number) { return formatDate(sec) + formatTimeLow(numToDate(sec)); }

  //miliseconds
  export function dateToInt(dt: Date): number { return dt.getTime(); }
  export function intToDate(num: number): Date { return new Date(num); }
  export function intToDateStr(num: number): string { return formatTimeLow(intToDate(num)); }
  export function intToDateStrLong(num: number): string { return Globalize.format(intToDate(num), 'D'); }

  //days
  export function dayToInt(dt: Date): number { return Math.floor((dateToInt(dt) + 1) / msecInDay); }
  export function intToDay(num: number): Date { return new Date(num * msecInDay); }
  //export function formatDay(day: number) { return formatTimeLow(intToDay(day)); }
  export function formatDay(day: number) { return formatDateLow(intToDay(day)); }
  var msecInDay = 3600 * 24 * 1000;

  export function toInt(n: number): number { return Math.floor(n); }
  export function formatTimeSpan(secs: number) {
    var s = Math.floor(secs % 60); secs = secs / 60;
    var m = Math.floor(secs % 60);
    var h = Math.floor(secs / 60);
    return (h == 0 ? '' : (h.toString() + ":")) + (m < 10 ? "0" : "") + m.toString() + ":" + (s < 10 ? "0" : "") + s.toString();
  }
  export function IsTheSameDay(date1: Date, date2: Date): boolean {
    return date1.setHours(0, 0, 0, 0) == date2.setHours(0, 0, 0, 0);
  }

  //http://msdn.microsoft.com/en-us/library/ie/ms534653(v=vs.85).aspx
  //http://msdn.microsoft.com/en-us/library/ie/ms533542(v=vs.85).aspx
  //http://msdn.microsoft.com/en-us/library/ie/ms534713(v=vs.85).aspx
  declare var navigator: any;
  export function preferedLanguage(): string {
    var language = navigator.language;
    if (language == null) {
      language = navigator.userLanguage;
      if (language == null) language = "??";
    }
    //language = language.substring(0, 2);
    return navigator.language + "|" + navigator.browserLanguage + "|" + navigator.userLanguage + "|" + navigator.systemLanguage;
  }

  export function string_format(str: string, obj: any[]): string {
    return str.replace(/{([^{}]*)}/g, (match: string, ...group_match: any[]) => {
      var data = obj[group_match[0]];
      return data == null ? '' : data.toString();// typeof data === 'string' ? data : match;
    });
  }
  //http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
  export function Hash(str: string): number {
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      hash = ((hash << 5) + hash) + ch;
    }
    return hash;
  }
  //http://stevenbenner.com/2010/03/javascript-regex-trick-parse-a-query-string-into-an-object/
  //var parseQueryRx = new RegExp("([^?=&]+)(=([^&]*))?", "g");
  //export function parseQuery(url: string): Object {
  //  var queryString = {};
  //  url.replace(parseQueryRx, (substring: string, ...args: any[]) => { queryString[args[0].toLowerCase()] = args[2]; });
  //  return queryString;
  //}
  export function decrypt(data: string): Object {
    return JSON.parse(decryptStr(data));
  }
  export function encrypt(obj: Object): string {
    return encryptStr(JSON.stringify(obj));
  }
  export function decryptStr(data: string): string {
    return gCrypt.utf8ByteArrayToString(LowUtils.decrypt(gBase64.LMdecodeString(data)));
  }
  export function encryptStr(obj: string): string {
    return gBase64.LMencodeString(LowUtils.encrypt(gCrypt.stringToUtf8ByteArray(obj)));
  }
  export function packStr(str: string): string {
    return str ? gBase64.LMencodeString(gCrypt.stringToUtf8ByteArray(str)) : null;
  }
  export function unpackStr(str: string): string {
    return str ? gCrypt.utf8ByteArrayToString(gBase64.LMdecodeString(str)) : null;
  }
  //export function unpack_(data: string): msgpack.typedObj {
  //  return <msgpack.typedObj>msgpack.unpackBytes(gBase64.LMdecodeString(data));
  //}
  //export function pack_(obj: msgpack.typedObj): string {
  //  return gBase64.LMencodeString(msgpack.packBytes(obj));
  //}
  //export function getQueryVariable(win: Window, name: string): string {
  //  var match = RegExp('[?&]' + name + '=([^&]*)').exec(win.location.search);
  //  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  //};
  export function IsNullOrEmpty(s: string) {
    return s == null || s.length == 0;
  }
  export function addDays(date: Date, days: number) {
    var ms = date.getTime() + (86400000 * days);
    return new Date(ms);
  }
  export function MSecToDays(msec: number): number {
    return toInt(msec / msecInDay);
  }
  var msecInDay = 60 * 60 * 24 * 1000;

  function initStorage(): void {
    var dt = new Date().getTime().toString();
    var st = window.localStorage;
    try {
      st.setItem(dt, dt);
      if (st.getItem(dt) != dt) st = null;
      else st.removeItem(dt);
    } catch (msg) { st = null; }
    if (st == null) {
      window.localStorage = <Storage>{
        remainingSpace: 0,
        length: 0,
        getItem: (key: string) => null,
        setItem: (key: string, data: string) => { },
        clear: () => { },
        removeItem: (key: string) => { },
        key: (index: number) => null,
      };
    }
  }
  initStorage();

  export function isCrossDomain(url: string): boolean {
    return url.indexOf('://') >= 0 && url.toLowerCase().indexOf((location.protocol + '//' + location.host).toLowerCase()) < 0;
  }

  //http://stackoverflow.com/questions/7925260/how-to-use-iframe-to-cross-domain-post-request
  //http://www.d-mueller.de/blog/cross-domain-ajax-guide/
  export function iFrameSubmit(url: string, par: string, completed: (res: any) => void = null) {
    var _form = $('iFrameSubmit');
    var iframe: HTMLIFrameElement = _form.length == 0 ? null : <HTMLIFrameElement>(_form[0]);
    if (!iframe) {
      var iframe: HTMLIFrameElement = <HTMLIFrameElement>document.createElement("iframe");
      iframe.id = 'iFrameSubmit';
      var uniqueString = "CrossDomainPost";
      document.body.appendChild(iframe);
      iframe.style.display = "none";
      iframe.contentWindow.name = uniqueString;
      form = <HTMLFormElement>document.createElement("form");
      form.style.display = "none";
      form.target = uniqueString;
      form.method = "POST";

      guidInput = <HTMLInputElement>document.createElement("input");
      guidInput.type = "hidden";
      guidInput.name = "guid";
      form.appendChild(guidInput);

      parIninput = <HTMLInputElement>document.createElement("input");
      parIninput.type = "hidden";
      parIninput.name = "par";
      form.appendChild(parIninput);

      document.body.appendChild(form);
    }

    form.action = url;
    parIninput.value = par;
    var guid = new Date().getTime().toString();
    guidInput.value = guid;
    form.submit();
    if (!completed) return;

    //callback
    if (cfg.target != LMComLib.Targets.web) {
      completed(null); completed = null;
    } else {
      var idx = url.indexOf('?'); if (idx >= 0) url = url.substr(0, idx);
      url += "?waitfor=" + guid
      $.ajax(url, {
        async: true,
        type: 'GET',
        dataType: 'jsonp',
        headers: { "LoggerLogId": Logger.logId(), "LMComVersion": Utils.LMComVersion }
      }).then(
        res => { completed(res); completed = null; },
        (...reasons: any[]) => Logger.trace('ajax', 'Error: wait for callback not called, 5 sec wait follows')
        );
      setTimeout(() => {
        completed(null); completed = null;
      }, 5000);
    }
  } var guidInput: HTMLInputElement; var parIninput: HTMLInputElement; var form: HTMLFormElement = null;
}

module LowUtils {

  export function isMobile(): boolean {
    /**
     * jQuery.browser.mobile (http://detectmobilebrowser.com/)
     *
     * jQuery.browser.mobile will be true if the browser is a mobile device
     *
     **/
    var nav: any = navigator; var win: any = window;
    var agent = nav.userAgent || nav.vendor || win.opera;
    var res =
      /android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|meego.+mobile|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(agent) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(agent.substr(0, 4));
    return res;
  }

  /******  ENCRYPT x DECRYPT */
  function Int64ToByte(val: number): number {
    return val & 0xFF;
  };
  function Int64ToUShort(val: number): number {
    return val & 0xFFFF;
  };

  var encryptKey = 18475;

  export function EncryptString(data: number[]): string {
    return bytesToHex(EncryptLow(data, 0, data.length, encryptKey));
  }

  export function DecryptString(data: string): number[] {
    return DecryptLow(hexToBytes(data), 0, data.length, encryptKey)
  }

  export function encrypt(data: number[]): number[] {
    return EncryptLow(data, 0, data.length, encryptKey);
  }
  export function decrypt(data: number[]): number[] {
    return DecryptLow(data, 0, data.length, encryptKey);
  }
  function EncryptLow(data: number[], start: number, len: number, key: number): number[] {
    for (var i = start; i < start + len; i++) {
      data[i] = Int64ToByte(data[i] ^ (key >> 8));
      key = Int64ToUShort((data[i] + key) * 52845 + 22719);
    }
    return data;
  }
  //function EncryptLowEx(data: number[], key: number): void {
  //  for (var i = 0; i < data.length; i++) { data[i] = (data[i] ^ (key >> 8)) & 0xFF; key = ((data[i] + key) * 52845 + 22719) & 0xFFFF; }
  //}
  function DecryptLow(data: number[], start: number, len: number, key: number): number[] {
    var old;
    for (var i = 0; i < data.length; i++) {
      old = data[i];
      data[i] = Int64ToByte(old ^ (key >> 8));
      key = Int64ToUShort((old + key) * 52845 + 22719);
    }
    return data;
  }

  //export function NowToInt(): number {
  //  return 0; //dateToInt(new Date());
  //}
  //export function DateToInt(dt: Date): number {
  //  return dt.getTime();
  //}
  //export function IntToDate(d: number): Date {
  //  return new Date(d);
  //}
  //export function dateToInt(dt: Date): number { return dt.getTime(); }

  //http://docs.closure-library.googlecode.com/git/closure_goog_crypt_crypt.js.source.html
  export function bytesToHex(input): string {
    if (typeof input == "string") input = gCrypt.stringToByteArray(input);
    return _.map<number, string>(input, function (numByte) {
      var hexByte = numByte.toString(16);
      return hexByte.length > 1 ? hexByte : '0' + hexByte;
    }).join('');
  }

  export function hexToBytes(hexString: string): number[] {
    var arr = [];
    for (var i = 0; i < hexString.length; i += 2) {
      arr.push(parseInt(hexString.substring(i, i + 2), 16));
    }
    return arr;
  };
  //var hexDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
  //function dec2hex(dec: number): string { return (hexDigits[dec >> 4] + hexDigits[dec & 15]); };
  //function hex2dec(hex: string): number { return (parseInt(hex, 16)); };

  export function parseQuery(query: string): { [id: string]: string; } {
    var res: { [id: string]: string; } = {};
    if (typeof query == 'undefined' || query == '' || query == null) return res;
    var fch = query.charAt(0);
    if (fch == "#" || fch == "?") query = query.substr(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      res[decodeURIComponent(pair[0]).toLowerCase()] = pair.length == 2 ? decodeURIComponent(pair[1]) : "";
    }
    return res;
  }

  export function getQuery(query: { [id: string]: string; }, name: string, default_val: string = ""): string {
    if (query == null) return default_val;
    var res = query[name.toLowerCase()];
    return typeof res == "undefined" ? default_val : res;
  }

  export function getQueryParams(name: string, default_val: string = ""): string {
    initQueryParams();
    return getQuery(queryParams, name, default_val);
  }
  function initQueryParams() {
    if (queryParams == null) queryParams = parseQuery(window.location.search);
  }
  var queryParams: any = null;

  export function EnumToString(enumType: any, val: number): string {
    //var map = enumType["map_"];
    //if (typeof map == "undefined") {
    //  map = {};
    //  enumType["map_"] = map;
    //  for (var p in enumType) map[enumType[p].toString()] = p;
    //}
    //return map[val.toString()];
    return enumType[val];
  }
  export function EnumParse(enumType: any, val: string): number {
    return enumType[val];
  }

  export function cookieDomain() {
    var parts = window.location.host.toLowerCase().split('.');
    var len = parts.length;
    if (len < 3) return undefined;
    if (parts[len - 1].length <= 2 || parts[len - 1].match(wrongSecLev)) {
      if (len < 4) return undefined;
      return parts[len - 3] + "." + parts[len - 2] + "." + parts[len - 1];
    } else
      return parts[len - 2] + "." + parts[len - 1];
  }
  var wrongSecLev = /^(com|net|mil|org|gov|edu|int)$/;
  //https://bugzilla.mozilla.org/show_bug.cgi?id=252342


  export function documentReady(callback: () => void) {
    if (readyCalled) callback(); else callbacks.push(callback);
  }

  function doReady() {
    readyCalled = true;
    for (var i = 0; i < callbacks.length; i++) callbacks[i]();
  }
  var readyCalled = false;
  var callbacks: any[] = [];

  if (window.addEventListener) {// W3C standard 
    window.addEventListener('load', doReady, false); // NB **not** 'onload' 
  } else if (window.attachEvent) { // Microsoft 
    window.attachEvent('onload', doReady);
  }

  export function globalEval(src) {
    if (window.execScript) {
      window.execScript(src);
      return;
    }
    eval.call(window, src);
  };

}

module LMComLib {
  export class LMJsContext {
    static actLocale: string = null;
    static jQueryLocale() {
      switch (LMJsContext.actLocale) {
        case "cs-cz":
          return "cs";
        default:
          return "en-GB";
      }
    }
  };
}

declare var cfg: schools.config;

//http://www.sitepoint.com/building-web-pages-with-local-storage/ 
module Logger {

  export interface logger {
    log(msg: string, appId: string);
  }
  export var delphiLog: logger;

  var ids = null;
  var logProc: (msg: string, appId: string) => void;
  var noIds = null;

  function write(msg: string, appid: string) {
    if (logProc == null) {
      if (typeof delphiLog != "undefined") logProc = (msg, appId) => delphiLog.log(msg, appId);
      else logProc = (msg, appId) => {
        if (window.console && window.console.log) window.console.log(msg);
        if (_.indexOf(ignores, appId) < 0) logLow(msg);
      }
    }
    logProc(msg + '\r\n', appid);
  };

  export function traceFmt(appId: string, mask: string, ...pars: string[]) {
    trace(appId, Utils.string_format(mask, pars));
  }
  export function traceMsg(msg: string) {
    trace("Global", msg);
  }
  export function trace(appId: string, msg: string) {
    //if (appId != 'Course') return;
    var time = new Date().toTimeString().split(' GMT')[0];
    var txt = appId + ' (' + time + '): ' + msg;
    if (cfg.debugTypes) ids = cfg.debugTypes.split(',');
    if (!cfg.noDebugTypes) cfg.noDebugTypes = 'jsrender';
    if (cfg.noDebugTypes) noIds = cfg.noDebugTypes.split(',');
    if (typeof _ == "undefined" || !ids || ids.length == 0 || _.indexOf(ids, appId) >= 0) {
      if (noIds && noIds.length > 0 && _.indexOf(noIds, appId) >= 0) return;
      write(txt, appId);
    }
  }
  export function error(appId: string, msg: string, error: string) {
    if (logId() == '') startLog(null);
    var txt = "*** ERROR " + error + "\r\nappId: " + appId + "\r\nmsg: " + msg;
    write(txt, null);
    if (isDynamicJS()) {
      //debugger;
      //alert(txt);
    }
  }

  var maxBufLen = 500;
  var maxBufCount = 20;
  var maxLogTime = 30/*pocet minut*/ * (60 * 1000);
  var callLoggerMSecs = 3000; //5000
  export var ignores = ['jsrender'];

  interface info {
    id: string; started: number; count: number; cookieWrited: boolean;
  }
  export function startLog(event, logid: string = null): void {
    var inGui = !logid;
    if (!logid) logid = Utils.nowToInt().toString();
    var ws = window.localStorage; if (!ws) return;
    var inf = getInfo();
    clearLog(inf);
    inf = { id: logid, started: Utils.nowToInt(), count: 1, cookieWrited: false };
    ws.setItem("log_0", JSON.stringify(inf));
    traceFmt('Utils.logger START', 'url={0}, browser={1}, scorm={2}', window.location.href, bowser.dataStr, Utils.scormApiUrl());
    trace('cfg=', JSON.stringify(cfg));
    //if (inGui) refreshPage(null);
  }
  export function logId(doInit: () => void = null): string {
    return ''; //PZ 4/24/2015 - no ve logovani pomoci lmconsole.js
    if (logIdFromQuery) return logIdFromQuery; //PZ 21.3.2015
    if (!initialized) {
      initialized = true;
      if (doInit) doInit();
      info = getInfo(); if (info == null) return '';
    }
    if (info && (Utils.nowToInt() > info.started + maxLogTime || info.count > maxBufCount)) info = null;
    return info ? info.id : '';
  }
  var logIdFromQuery = LowUtils.getQueryParams('LoggerLogId'); //PZ 21.3.2015

  export var noLocalStorageLog = false;
  function logLow(msg: string): void {
    return; //PZ 21.3.2015
    if (noLocalStorageLog) return;
    var ws = window.localStorage; if (!ws) return;
    if (logId(refreshButtons) == '') return;
    var cook: string = '';
    if (!info.cookieWrited && typeof (LMStatus) != 'undefined' && LMStatus.Cookie) {
      info.cookieWrited = true;
      cook = 'Cookie: ' + JSON.stringify(LMStatus.Cookie) + '\r\n';
    }
    if (buf == '')
      try {
        var infoCount = info.count + 1;
        ws.setItem("log_0", JSON.stringify(info));
        info.count = infoCount;
      } catch (err) { return; }

    try {
      var toWrite = buf + cook + msg;
      ws.setItem("log_" + (info.count - 1).toString(), toWrite);
      buf = toWrite;
    } catch (err) { return; }

    if (buf.length > maxBufLen) buf = '';
  }

  export function cancelLog(event): void {
    var inf = getInfo();
    clearLog(inf);
    refreshButtons();
  }

  export function sendLog(event): void {
    var inf = getInfo(); if (inf == null) return;
    var log = getLog(inf);

    Pager.doAjaxCmd(
      true,
      Pager.path(Pager.pathType.loggerService),
      scorm.Cmd_Logger_Type,
      JSON.stringify(LMStatus.createCmd<scorm.Cmd_Logger>(r => { r.id = inf.id; r.data = log; })),
      //JSON.stringify(scorm.Cmd_Logger_Create(inf.id, log, 0, 0, null, null)),
      () => { alert('Log successfully sent, thank you :-)'); clearLog(inf); refreshButtons(); }
      );
  }

  export function readLog(event): void {
    var inf = getInfo(); if (inf == null) return;
    var log = getLog(inf);
    window.prompt("Copy to clipboard: Ctrl+C, Enter\r\n\r\n", log);
    clearLog(inf); refreshButtons();
  }

  export function refreshPage(event) {
    window.location.reload();
  }

  function clearLog(inf: info): void {
    info = null; initialized = false; buf = '';
    if (inf == null) return;
    var ws = window.localStorage; if (!ws) return null;
    for (var i = 0; i < inf.count; i++) ws.removeItem("log_" + i.toString());
  }

  function getLog(inf: info): string {
    if (inf == null) return null;
    var ws = window.localStorage; if (!ws) return null;
    var res = [];
    for (var i = 0; i < inf.count; i++) res.push(ws.getItem("log_" + i.toString()));
    return res.join('\r\n');
  }
  function getInfo(): info {
    var ws = window.localStorage; if (!ws) return null;
    var infoStr = ws.getItem("log_0");
    if (_.isEmpty(infoStr)) return null;
    return JSON.parse(infoStr);
  }
  var buf: string = '';
  var info: info;
  var initialized = false;

  $(window)
    .mousedown((ev) => {
      if ($('#bowser').length > 0 || !ev.ctrlKey) return; //v bowseru se down neuplatni
      isDownTime = Utils.nowToInt();
    })
    .mouseup((ev) => {
      if ($('#bowser').length <= 0) return; //mimo bowseru se up neuplatni
      if (Utils.getSelection() != '3DEA99769C464982B1D619617A4D6F67') return;
      gCookie.setCookie('dynamicjs', 'true');
    })
    .click(() => {
      if (isDownTime == 0) return;
      var diff = Utils.nowToInt() - isDownTime - callLoggerMSecs;
      isDownTime = 0;
      if (diff < 0) return;
      $('body').html($('#tbowser').html());
      refreshButtons();
    });
  var isDownTime = 0;

  function isDynamicJS(): boolean {
    return gCookie.getCookie('dynamicjs') == 'true';
  }

  function refreshButtons() {
    var start = $('#loggerStart'); var cont = $('#continueLearning'); var refr = $('#refreshPage'); var send = $('#loggerSend'); var read = $('#loggerRead '); var can = $('#loggerCancel');
    var inf = info ? info : getInfo();
    if (!inf) {
      start.removeAttr("disabled"); cont.removeAttr("disabled"); refr.attr("disabled", "disabled"); send.attr("disabled", "disabled"); read.attr("disabled", "disabled"); can.attr("disabled", "disabled"); return;
    }
    start.attr("disabled", "disabled"); cont.attr("disabled", "disabled"); refr.removeAttr("disabled"); send.removeAttr("disabled"); read.removeAttr("disabled"); can.removeAttr("disabled"); return;
  }

  //force log
  //var logIdStr = LowUtils.getQueryParams('LoggerLogId'); //PZ 21.3.2015
  var logIdStr = null;
  if (!_.isEmpty(logIdStr)) startLog(logIdStr);

  //PZ 21.3.2015, schools.versions.minified neni definovat
  //if (cfg.version == schools.versions.minified) {
  //  //global event handling, 
  //  //http://stackoverflow.com/questions/14374719/jquery-global-exception-handler
  //  //
  //  window.onerror = function (eventOrMessage: any, source: string, fileno: number, colnumber?: number): any { error('Bowser.window.onerror', _.isObject(eventOrMessage) ? JSON.stringify(Utils.flate(eventOrMessage)) : eventOrMessage.toString(), source + ': ' + fileno.toString()); }

  //  var event = (<any>jQuery).event; var temp = event.dispatch;
  //  event.dispatch = function () {
  //    try {
  //      temp.apply(this, arguments);
  //    } catch (e) {
  //      var ev: JQueryEventObject = event.fix(arguments[0]);
  //      var ct = ev.currentTarget && ev.currentTarget['parentNode'] ? $(ev.currentTarget['parentNode']).html() : '';
  //      var t = ev.target && ev.target['parentNode'] ? $(ev.target['parentNode']).html() : '';
  //      if (t == ct) ct = 'the same';
  //      error('Bowser.jQuery.event.dispatch', JSON.stringify(Utils.flate(ev)) + ', target=' + t + ', currentTarget=' + ct, '');
  //      throw 'Bowser.jQuery.event.dispatch';
  //    }
  //  }
  //}

}