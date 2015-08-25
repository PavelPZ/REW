//http://xregexp.com/plugins/, d:\Instalace\JavascriptUnicode\
var Unicode;
(function (Unicode) {
    var a = new RegExp("\\w{4}", "g");
    //unicode - properties.js
    var White_Space = "0009-000D0020008500A01680180E2000-200A20282029202F205F3000".replace(a, "\\u$&");
    var cWhite_Space = new RegExp("[" + White_Space + "\']");
    //unicode-base.js
    var Letter = "0041-005A0061-007A00AA00B500BA00C0-00D600D8-00F600F8-02C102C6-02D102E0-02E402EC02EE0370-037403760377037A-037D03860388-038A038C038E-03A103A3-03F503F7-0481048A-05270531-055605590561-058705D0-05EA05F0-05F20620-064A066E066F0671-06D306D506E506E606EE06EF06FA-06FC06FF07100712-072F074D-07A507B107CA-07EA07F407F507FA0800-0815081A082408280840-085808A008A2-08AC0904-0939093D09500958-09610971-09770979-097F0985-098C098F09900993-09A809AA-09B009B209B6-09B909BD09CE09DC09DD09DF-09E109F009F10A05-0A0A0A0F0A100A13-0A280A2A-0A300A320A330A350A360A380A390A59-0A5C0A5E0A72-0A740A85-0A8D0A8F-0A910A93-0AA80AAA-0AB00AB20AB30AB5-0AB90ABD0AD00AE00AE10B05-0B0C0B0F0B100B13-0B280B2A-0B300B320B330B35-0B390B3D0B5C0B5D0B5F-0B610B710B830B85-0B8A0B8E-0B900B92-0B950B990B9A0B9C0B9E0B9F0BA30BA40BA8-0BAA0BAE-0BB90BD00C05-0C0C0C0E-0C100C12-0C280C2A-0C330C35-0C390C3D0C580C590C600C610C85-0C8C0C8E-0C900C92-0CA80CAA-0CB30CB5-0CB90CBD0CDE0CE00CE10CF10CF20D05-0D0C0D0E-0D100D12-0D3A0D3D0D4E0D600D610D7A-0D7F0D85-0D960D9A-0DB10DB3-0DBB0DBD0DC0-0DC60E01-0E300E320E330E40-0E460E810E820E840E870E880E8A0E8D0E94-0E970E99-0E9F0EA1-0EA30EA50EA70EAA0EAB0EAD-0EB00EB20EB30EBD0EC0-0EC40EC60EDC-0EDF0F000F40-0F470F49-0F6C0F88-0F8C1000-102A103F1050-1055105A-105D106110651066106E-10701075-1081108E10A0-10C510C710CD10D0-10FA10FC-1248124A-124D1250-12561258125A-125D1260-1288128A-128D1290-12B012B2-12B512B8-12BE12C012C2-12C512C8-12D612D8-13101312-13151318-135A1380-138F13A0-13F41401-166C166F-167F1681-169A16A0-16EA1700-170C170E-17111720-17311740-17511760-176C176E-17701780-17B317D717DC1820-18771880-18A818AA18B0-18F51900-191C1950-196D1970-19741980-19AB19C1-19C71A00-1A161A20-1A541AA71B05-1B331B45-1B4B1B83-1BA01BAE1BAF1BBA-1BE51C00-1C231C4D-1C4F1C5A-1C7D1CE9-1CEC1CEE-1CF11CF51CF61D00-1DBF1E00-1F151F18-1F1D1F20-1F451F48-1F4D1F50-1F571F591F5B1F5D1F5F-1F7D1F80-1FB41FB6-1FBC1FBE1FC2-1FC41FC6-1FCC1FD0-1FD31FD6-1FDB1FE0-1FEC1FF2-1FF41FF6-1FFC2071207F2090-209C21022107210A-211321152119-211D212421262128212A-212D212F-2139213C-213F2145-2149214E218321842C00-2C2E2C30-2C5E2C60-2CE42CEB-2CEE2CF22CF32D00-2D252D272D2D2D30-2D672D6F2D80-2D962DA0-2DA62DA8-2DAE2DB0-2DB62DB8-2DBE2DC0-2DC62DC8-2DCE2DD0-2DD62DD8-2DDE2E2F300530063031-3035303B303C3041-3096309D-309F30A1-30FA30FC-30FF3105-312D3131-318E31A0-31BA31F0-31FF3400-4DB54E00-9FCCA000-A48CA4D0-A4FDA500-A60CA610-A61FA62AA62BA640-A66EA67F-A697A6A0-A6E5A717-A71FA722-A788A78B-A78EA790-A793A7A0-A7AAA7F8-A801A803-A805A807-A80AA80C-A822A840-A873A882-A8B3A8F2-A8F7A8FBA90A-A925A930-A946A960-A97CA984-A9B2A9CFAA00-AA28AA40-AA42AA44-AA4BAA60-AA76AA7AAA80-AAAFAAB1AAB5AAB6AAB9-AABDAAC0AAC2AADB-AADDAAE0-AAEAAAF2-AAF4AB01-AB06AB09-AB0EAB11-AB16AB20-AB26AB28-AB2EABC0-ABE2AC00-D7A3D7B0-D7C6D7CB-D7FBF900-FA6DFA70-FAD9FB00-FB06FB13-FB17FB1DFB1F-FB28FB2A-FB36FB38-FB3CFB3EFB40FB41FB43FB44FB46-FBB1FBD3-FD3DFD50-FD8FFD92-FDC7FDF0-FDFBFE70-FE74FE76-FEFCFF21-FF3AFF41-FF5AFF66-FFBEFFC2-FFC7FFCA-FFCFFFD2-FFD7FFDA-FFDC".replace(a, "\\u$&");
    var cLetter = new RegExp("[" + Letter + "]");
    //unicode-categories.js
    var Number = "0030-003900B200B300B900BC-00BE0660-066906F0-06F907C0-07C90966-096F09E6-09EF09F4-09F90A66-0A6F0AE6-0AEF0B66-0B6F0B72-0B770BE6-0BF20C66-0C6F0C78-0C7E0CE6-0CEF0D66-0D750E50-0E590ED0-0ED90F20-0F331040-10491090-10991369-137C16EE-16F017E0-17E917F0-17F91810-18191946-194F19D0-19DA1A80-1A891A90-1A991B50-1B591BB0-1BB91C40-1C491C50-1C5920702074-20792080-20892150-21822185-21892460-249B24EA-24FF2776-27932CFD30073021-30293038-303A3192-31953220-32293248-324F3251-325F3280-328932B1-32BFA620-A629A6E6-A6EFA830-A835A8D0-A8D9A900-A909A9D0-A9D9AA50-AA59ABF0-ABF9FF10-FF19".replace(a, "\\u$&");
    var cNumber = new RegExp("[" + Number + "]");
    function isLetter(ch) {
        return cLetter.test(ch);
    }
    Unicode.isLetter = isLetter;
    function isWhiteSpace(ch) {
        return cWhite_Space.test(ch);
    }
    Unicode.isWhiteSpace = isWhiteSpace;
    function isNumber(ch) {
        return cNumber.test(ch);
    }
    Unicode.isNumber = isNumber;
    function isLeterOrDigit(ch) {
        return isNumber(ch) || isLetter(ch);
    }
    Unicode.isLeterOrDigit = isLeterOrDigit;
})(Unicode || (Unicode = {}));

var Base32;
(function (Base32) {
    //https://github.com/agnoster/base32-js
    // This would be the place to edit if you want a different
    // Base32 implementation
    var alphabet = '0123456789abcdefghjkmnpqrtuvwxyz';
    var alias = { o: 0, i: 1, l: 1, s: 5 };
    /**
     * Build a lookup table and memoize it
     *
     * Return an object that maps a character to its
     * byte value.
     */
    var lookup = function () {
        var table = {};
        // Invert 'alphabet'
        for (var i = 0; i < alphabet.length; i++) {
            table[alphabet[i]] = i;
        }
        // Splice in 'alias'
        for (var key in alias) {
            if (!alias.hasOwnProperty(key))
                continue;
            table[key] = table['' + alias[key]];
        }
        lookup = function () { return table; };
        return table;
    };
    /**
     * A streaming encoder
     *
     *     var encoder = new base32.Encoder()
     *     var output1 = encoder.update(input1)
     *     var output2 = encoder.update(input2)
     *     var lastoutput = encode.update(lastinput, true)
     */
    function Encoder() {
        var skip = 0; // how many bits we will skip from the first byte
        var bits = 0; // 5 high bits, carry from one byte to the next
        this.output = '';
        // Read one byte of input
        // Should not really be used except by "update"
        this.readByte = function (bt) {
            // coerce the byte to an int
            //if (typeof byte == 'string') byte = byte.charCodeAt(0)
            if (skip < 0) {
                bits |= (bt >> (-skip));
            }
            else {
                bits = (bt << skip) & 248;
            }
            if (skip > 3) {
                // not enough data to produce a character, get us another one
                skip -= 8;
                return 1;
            }
            if (skip < 4) {
                // produce a character
                this.output += alphabet[bits >> 3];
                skip += 5;
            }
            return 0;
        };
        // Flush any remaining bits left in the stream
        this.finish = function (check) {
            var output = this.output + (skip < 0 ? alphabet[bits >> 3] : '') + (check ? '$' : '');
            this.output = '';
            return output;
        };
    }
    Base32.Encoder = Encoder;
    /**
     * Process additional input
     *
     * input: string of bytes to convert
     * flush: boolean, should we flush any trailing bits left
     *        in the stream
     * returns: a string of characters representing 'input' in base32
     */
    Encoder.prototype.update = function (input, flush) {
        for (var i = 0; i < input.length;) {
            i += this.readByte(input[i]);
        }
        // consume all output
        var output = this.output;
        this.output = '';
        if (flush) {
            output += this.finish();
        }
        return output;
    };
    // Functions analogously to Encoder
    function Decoder() {
        var skip = 0; // how many bits we have from the previous character
        var bt = 0; // current byte we're producing
        this.output = [];
        // Consume a character from the stream, store
        // the output in this.output. As before, better
        // to use update().
        this.readChar = function (chr) {
            //if (typeof char != 'string') {
            //if (typeof char == 'number') {
            //char = String.fromCharCode(char)
            //}
            //}
            chr = chr.toLowerCase();
            var val = lookup()[chr];
            if (typeof val == 'undefined') {
                // character does not exist in our lookup table
                //return // skip silently. An alternative would be:
                throw Error('Could not find character "' + chr + '" in lookup table.');
            }
            val <<= 3; // move to the high bits
            bt |= val >>> skip;
            skip += 5;
            if (skip >= 8) {
                // we have enough to preduce output
                this.output.push(bt);
                skip -= 8;
                if (skip > 0)
                    bt = (val << (5 - skip)) & 255;
                else
                    bt = 0;
            }
        };
        this.finish = function (check) {
            if (skip < 0)
                this.output.push(alphabet[bt >> 3]);
            //var output = this.output;
            //this.output = [];
            //return output;
        };
    }
    Base32.Decoder = Decoder;
    Decoder.prototype.update = function (input, flush) {
        for (var i = 0; i < input.length; i++) {
            this.readChar(input[i]);
        }
        this.finish();
        var output = this.output;
        this.output = [];
        return output;
    };
    /** Convenience functions
     *
     * These are the ones to use if you just have a string and
     * want to convert it without dealing with streams and whatnot.
     */
    // String of data goes in, Base32-encoded string comes out.
    function encode(input) {
        var encoder = new Encoder();
        var output = encoder.update(input, true);
        return output;
    }
    Base32.encode = encode;
    // Base32-encoded string goes in, decoded data comes out.
    function decode(input) {
        var decoder = new Decoder();
        var output = decoder.update(input, true);
        return output;
    }
    Base32.decode = decode;
})(Base32 || (Base32 = {}));

/*
Copyright (c) 2012, Dmytro V. Dogadailo <entropyhacker@gmail.com>

RJSON is Recursive JSON.

RJSON converts any JSON data collection into more compact recursive
form. Compressed data is still JSON and can be parsed with `JSON.parse`. RJSON
can compress not only homogeneous collections, but any data sets with free
structure.

RJSON is stream single-pass compressor, it extracts data schemes from a
document, assign each schema unique number and use this number instead of
repeating same property names again and again.

Bellow you can see same document in both forms.

JSON:

{
    "id": 7,
    "tags": ["programming", "javascript"],
    "users": [
    {"first": "Homer", "last": "Simpson"},
    {"first": "Hank", "last": "Hill"},
    {"first": "Peter", "last": "Griffin"}
    ],
    "books": [
    {"title": "JavaScript", "author": "Flanagan", "year": 2006},
    {"title": "Cascading Style Sheets", "author": "Meyer", "year": 2004}
    ]
}

RJSON:

{
    "id": 7,
    "tags": ["programming", "javascript"],
    "users": [
    {"first": "Homer", "last": "Simpson"},
        [2, "Hank", "Hill", "Peter", "Griffin"]
    ],
    "books": [
    {"title": "JavaScript", "author": "Flanagan", "year": 2006},
        [3, "Cascading Style Sheets", "Meyer", 2004]
    ]
}

RJSON allows to:

* reduce JSON data size and network traffic when gzip isn't available. For
example, in-browser 3D-modeling tools like [Mydeco
3D-planner](http://mydeco.com/3d-planner/) may process and send to server
megabytes of JSON-data;
* analyze large collections of JSON-data without
unpacking of whole dataset. RJSON-data is still JSON-data, so it can be
traversed and analyzed after parsing and fully unpacked only if a document meets
some conditions.

*/
var RJSON;
(function (RJSON) {
    var hasOwnProperty = Object.prototype.hasOwnProperty, toString = Object.prototype.toString, getKeys = Object.keys || _keys, isArray = Array.isArray || _isArray;
    /**
     * @param {*} Any valid for JSON javascript data.
     * @return {*} Packed javascript data, usually a dictionary.
     */
    function pack(data) {
        var schemas = {}, maxSchemaIndex = 0;
        function encodeArray(value) {
            var len = value.length, encoded = [];
            if (len === 0)
                return [];
            if (typeof value[0] === 'number') {
                encoded.push(0); // 0 is schema index for Array
            }
            for (var i = 0; i < len; i++) {
                var v = value[i], current = encode(v), last = encoded[encoded.length - 1];
                if (isEncodedObject(current) &&
                    isArray(last) && current[0] === last[0]) {
                    // current and previous object have same schema,
                    // so merge their values into one array
                    encoded[encoded.length - 1] =
                        last.concat(current.slice(1));
                }
                else {
                    encoded.push(current);
                }
            }
            return encoded;
        }
        function encodeObject(value) {
            var schemaKeys = getKeys(value).sort();
            if (schemaKeys.length === 0) {
                return {};
            }
            var encoded, schema = schemaKeys.length + ':' + schemaKeys.join('|'), schemaIndex = schemas[schema];
            if (schemaIndex) {
                encoded = [schemaIndex];
                for (var i = 0, k; k = schemaKeys[i++];) {
                    encoded[i] = encode(value[k]);
                }
            }
            else {
                schemas[schema] = ++maxSchemaIndex;
                encoded = {};
                for (var i = 0, k; k = schemaKeys[i++];) {
                    encoded[k] = encode(value[k]);
                }
            }
            return encoded;
        }
        function encode(value) {
            if (typeof value !== 'object' || !value) {
                // non-objects or null return as is
                return value;
            }
            else if (isArray(value)) {
                return encodeArray(value);
            }
            else {
                return encodeObject(value);
            }
        }
        return encode(data);
    }
    RJSON.pack = pack;
    /**
     * @param {*} data Packed javascript data.
     * @return {*} Original data.
     */
    function unpack(data) {
        var schemas = {}, maxSchemaIndex = 0;
        function parseArray(value) {
            if (value.length === 0) {
                return [];
            }
            else if (value[0] === 0 || typeof value[0] !== 'number') {
                return decodeArray(value);
            }
            else {
                return decodeObject(value);
            }
        }
        function decodeArray(value) {
            var len = value.length, decoded = []; // decode array of something
            for (var i = (value[0] === 0 ? 1 : 0); i < len; i++) {
                var v = value[i], obj = decode(v);
                if (isEncodedObject(v) && isArray(obj)) {
                    // several objects was encoded into single array
                    decoded = decoded.concat(obj);
                }
                else {
                    decoded.push(obj);
                }
            }
            return decoded;
        }
        function decodeObject(value) {
            var schemaKeys = schemas[value[0]], schemaLen = schemaKeys.length, total = (value.length - 1) / schemaLen, decoded;
            if (total > 1) {
                decoded = []; // array of objects with same schema
                for (var i = 0; i < total; i++) {
                    var obj = {};
                    for (var j = 0, k; k = schemaKeys[j++];) {
                        obj[k] = decode(value[i * schemaLen + j]);
                    }
                    decoded.push(obj);
                }
            }
            else {
                decoded = {};
                for (var j = 0, k; k = schemaKeys[j++];) {
                    decoded[k] = decode(value[j]);
                }
            }
            return decoded;
        }
        function decodeNewObject(value) {
            var schemaKeys = getKeys(value).sort();
            if (schemaKeys.length === 0) {
                return {};
            }
            schemas[++maxSchemaIndex] = schemaKeys;
            var decoded = {};
            for (var i = 0, k; k = schemaKeys[i++];) {
                decoded[k] = decode(value[k]);
            }
            return decoded;
        }
        function decode(value) {
            if (typeof value !== 'object' || !value) {
                // non-objects or null return as is
                return value;
            }
            else if (isArray(value)) {
                return parseArray(value);
            }
            else {
                return decodeNewObject(value);
            }
        }
        return decode(data);
    }
    RJSON.unpack = unpack;
    /**
     * Object is encoded as array and object schema index is stored as
     * first item of the array. Valid schema index should be greater than 0,
     * because 0 is reserved for Array schema.
     * Several objects with same schema can be stored in the one array.
     * @param {*} value encoded value to check.
     * @return {boolean} true if value contains an encoded object or several
     * objects with same schema.
     */
    function isEncodedObject(value) {
        return isArray(value) && typeof value[0] === 'number' && value[0] !== 0;
    }
    function _keys(obj) {
        var keys = [], k;
        for (k in obj) {
            if (hasOwnProperty.call(obj, k)) {
                keys.push(k);
            }
        }
        return keys;
    }
    function _isArray(obj) {
        return toString.apply(obj) === '[object Array]';
    }
})(RJSON || (RJSON = {}));

$.whenall = function (arr) { return $.when.apply($, arr); };
$.views.settings({ onError: function () { debugger; }, _dbgMode: false });
//$.whenAll = firstParam => {
//  var //args = arguments,
//    sliceDeferred = [].slice,
//    i = 0,
//    length = args.length,
//    count = length,
//    rejected,
//    deferred = length <= 1 && firstParam && jQuery.isFunction(firstParam.promise)
//    ? firstParam
//    : jQuery.Deferred();
//  function resolveFunc(i, reject) {
//    return function (value) {
//      rejected = true;
//      args[i] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;
//      if (!(--count)) {
//        // Strange bug in FF4:
//        // Values changed onto the arguments object sometimes end up as undefined values
//        // outside the $.when method. Cloning the object into a fresh array solves the issue
//        var fn = rejected ? deferred.rejectWith : deferred.resolveWith;
//        fn.call(deferred, deferred, sliceDeferred.call(args, 0));
//      }
//    };
//  }
//  if (length > 1) {
//    for (; i < length; i++) {
//      if (args[i] && jQuery.isFunction(args[i].promise)) {
//        args[i].promise().then(resolveFunc(i, false), resolveFunc(i, true));
//      } else {
//        --count;
//      }
//    }
//    if (!count) {
//      deferred.resolveWith(deferred, args);
//    }
//  } else if (deferred !== firstParam) {
//    deferred.resolveWith(deferred, length ? [firstParam] : []);
//  }
//  return deferred.promise();
//};
var colors;
(function (colors) {
    colors.Default = "default";
    colors.Disabled = "disabled";
    colors.Primary = "primary";
    colors.Success = "success";
    colors.Info = "info";
    colors.Warning = "warning";
    colors.Danger = "danger";
})(colors || (colors = {}));
var Cook;
(function (Cook) {
    var allSubDomains = ['www'];
    //var c_Lang = "lang"; //cookie ve formatu en-gb
    //var c_Logout = "logout"; //cookie pro logout
    //var c_LMTicket = "LMTicket";
    //export enum Ids {
    //  lang,
    //  //logout, 
    //  LMTicket,
    //  schools_info, //pro schools aplikaci, objekt s napr return url
    //  lms_licence, //pro 
    //  //includeData
    //}
    function read(id, def) {
        if (def === void 0) { def = ""; }
        return gCookie.getCookie(LowUtils.EnumToString(LMComLib.CookieIds, id), def);
    }
    Cook.read = read;
    function write(id, value, persist) {
        if (persist === void 0) { persist = false; }
        var name = LowUtils.EnumToString(LMComLib.CookieIds, id);
        //_.each(allSubDomains, s => gCookie.setCookie(name, '', -1, undefined, s + '.' + LowUtils.cookieDomain()));
        gCookie.setCookie(name, value, persist ? 100000000 : undefined, "/", LowUtils.cookieDomain());
    }
    Cook.write = write;
    function remove(id) {
        gCookie.remove(LowUtils.EnumToString(LMComLib.CookieIds, id), "/", LowUtils.cookieDomain());
    }
    Cook.remove = remove;
})(Cook || (Cook = {}));
var LMStatus;
(function (LMStatus) {
    LMStatus.sessionId = new Date().getTime();
    function createCmd(finish) {
        var res = { lmcomId: LMStatus.Cookie ? LMStatus.Cookie.id : 0, sessionId: LMStatus.sessionId };
        finish(res);
        return res;
    }
    LMStatus.createCmd = createCmd;
    function ToString(ck) {
        return Utils.encrypt(ck);
    }
    LMStatus.ToString = ToString;
    function FromString(s) {
        return Utils.decrypt(s);
    }
    function getCookie() {
        if (!isLogged()) {
            try {
                var cookStr = Cook.read(LMComLib.CookieIds.LMTicket);
                if (cookStr != "") {
                    LMStatus.Cookie = FromString(cookStr);
                    if (LMStatus.Cookie.id <= 0)
                        LMStatus.Cookie = null;
                }
            }
            catch (msg) {
                return null;
            }
        }
        return LMStatus.Cookie;
    }
    LMStatus.getCookie = getCookie;
    function setCookie(cook, persistent) {
        if (persistent === void 0) { persistent = false; }
        if (cook == null)
            Cook.remove(LMComLib.CookieIds.LMTicket);
        else
            Cook.write(LMComLib.CookieIds.LMTicket, ToString(cook), persistent);
        //Cookie = cook;
    }
    LMStatus.setCookie = setCookie;
    function logged(cook, persistent) {
        if (persistent === void 0) { persistent = false; }
        setCookie(cook, persistent);
        adjustLoggin(LMStatus.gotoReturnUrl);
    }
    LMStatus.logged = logged;
    function loginUrl() {
        return "http://" + location.host + "/lmcom/Services/LMLive/LMLive.aspx?returnurl=" + encodeURIComponent(location.href);
    }
    LMStatus.loginUrl = loginUrl;
    function setReturnUrlAndGoto(newHash) {
        if (newHash === void 0) { newHash = null; }
        setReturnUrl();
        if (newHash == null)
            return;
        Pager.navigateToHash(newHash);
        //if (newHash.charAt(0) != "#") newHash = "#" + newHash;
        //location.hash = newHash;
    }
    LMStatus.setReturnUrlAndGoto = setReturnUrlAndGoto;
    function setReturnUrl(newHash) {
        if (newHash === void 0) { newHash = null; }
        Cook.write(LMComLib.CookieIds.returnUrl, newHash ? newHash : location.hash);
    }
    LMStatus.setReturnUrl = setReturnUrl;
    function clearReturnUrl() {
        Cook.remove(LMComLib.CookieIds.returnUrl);
    }
    LMStatus.clearReturnUrl = clearReturnUrl;
    function isReturnUrl() {
        return !_.isEmpty(getReturnUrl());
    }
    LMStatus.isReturnUrl = isReturnUrl;
    function getReturnUrl() {
        var url = Cook.read(LMComLib.CookieIds.returnUrl);
        if (_.isEmpty(url) || url == '#')
            return null;
        if (url.charAt(0) == "#")
            url = url.substr(1);
        return oldPrefix + url;
    }
    LMStatus.getReturnUrl = getReturnUrl;
    function gotoReturnUrl() {
        var url = getReturnUrl();
        if (_.isEmpty(url))
            Pager.gotoHomeUrl();
        else
            Pager.navigateToHash(url);
    }
    LMStatus.gotoReturnUrl = gotoReturnUrl;
    LMStatus.Cookie = null;
    function scormUserId() {
        return LMStatus.Cookie.TypeId ? LMStatus.Cookie.TypeId : LMStatus.Cookie.id.toString();
    }
    LMStatus.scormUserId = scormUserId;
    function isLogged() { return !_.isEmpty(LMStatus.Cookie) && LMStatus.Cookie.id && LMStatus.Cookie.id > 0; }
    LMStatus.isLogged = isLogged;
    function loggedBodyClass() {
        var logged = isLogged();
        if (!logged) {
            $('body').removeClass("logged");
            setCookie(null);
        }
        else {
            $('body').addClass("logged");
        }
    }
    LMStatus.loggedBodyClass = loggedBodyClass;
    //zajisteni zalogovani
    function adjustLoggin(completed) {
        var cookEmpty = !isLogged(); //Cookie == null;
        if (cookEmpty) {
            var ticket = LowUtils.getQueryParams('ticket');
            var a1y = LowUtils.getQueryParams('a1y');
            if (!_.isEmpty(ticket)) {
                Login.login(true, null, null, null, ticket, function (cookie) {
                    setCookie(cookie);
                    window.location.href = window.location.href.replace('ticket=' + ticket, '');
                }, function (errId, errMsg) { debugger; throw 'Utils.adjustCookie: PZ Log Error'; });
                return;
            }
            else if (a1y) {
                var em, psw;
                switch (a1y) {
                    case 'b2c':
                        em = "pzika@langmaster.cz";
                        psw = "p";
                        break; //sance se nasilne nalogovat jako PZ
                    case 'ws7':
                        em = "zzikova@langmaster.cz";
                        psw = "zz";
                        break; //zz
                    case '73q':
                        em = "rjeliga@langmaster.cz";
                        psw = "rj";
                        break; //rj
                    case 'pw6':
                        em = "pjanecek@langmaster.cz";
                        psw = "pj";
                        break; //pj
                    case 'g3n':
                        em = "zikovakaca@seznam.cz";
                        psw = "kz";
                        break; //kz
                    case 'ws7':
                        em = "zzikova@langmaster.cz";
                        psw = "zz";
                        break; //zz
                    default: return;
                }
                Login.login(true, em, null, psw, null, function (cookie) {
                    setCookie(cookie);
                    window.location.href = window.location.href.replace(/a1y=\w{3}/, '');
                }, function (errId, errMsg) { debugger; throw 'Utils.adjustCookie: PZ Log Error'; });
                return;
            }
        }
        getCookie();
        loggedBodyClass();
        if (cookEmpty)
            LMStatus.onLogged(completed);
        else
            completed();
    }
    LMStatus.adjustLoggin = adjustLoggin;
    LMStatus.onLogged = null;
    if ($.views)
        $.views.helpers({
            Cookie: getCookie,
            userName: friendlyName,
            isLMComCookie: isLMComCookie,
            fncExists: function (name) { return ($.views.helpers)[name]; },
            'debugger': function (data) { debugger; },
            icon_chevron_right: function () { return Trados.isRtl ? 'fa-chevron-left' : 'fa-chevron-right'; },
        });
    function LogoutLow() {
        //binec, setCookie nastavi pouze browser cookie a ponecha LMStatus.Cookie
        LMStatus.setCookie(null);
        LMStatus.Cookie = null;
        Pager.gotoHomeUrl();
    }
    LMStatus.LogoutLow = LogoutLow;
    function Logout(obj, ev) {
        if (!isLogged())
            return;
        try {
            if (!isLMComCookie()) {
                var a = ev.currentTarget;
                if (a.tagName.toLowerCase() != CourseModel.ta)
                    return false; //throw "OAuth.logoutEx";
                a.href = OAuth.logoutUrl(LMStatus.Cookie.Type);
                return true;
            }
            else {
                return false;
            }
        }
        finally {
            LogoutLow();
        }
    }
    LMStatus.Logout = Logout;
    function friendlyName() {
        if (!isLogged())
            return "";
        return LMStatus.Cookie.Type == LMComLib.OtherType.LANGMasterNoEMail ? LMStatus.Cookie.Login : LMStatus.Cookie.EMail;
    }
    LMStatus.friendlyName = friendlyName;
    function isLMComCookie() {
        return !LMStatus.Cookie.Type || LMStatus.Cookie.Type == 0 || LMStatus.Cookie.Type == LMComLib.OtherType.LANGMasterNoEMail || LMStatus.Cookie.Type == LMComLib.OtherType.LANGMaster;
    }
    LMStatus.isLMComCookie = isLMComCookie;
})(LMStatus || (LMStatus = {}));
var JsRenderHelpers;
(function (JsRenderHelpers) {
    if ($.views)
        $.views.helpers({
            nextToLast: function () {
                return this.index === this.parent.data.length - 2;
            },
            notLast: function () {
                return this.index !== this.parent.data.length - 1;
            },
            tuppleRightEnd: function () {
                return this.index === this.parent.data.length - 1 || this.index % 2 === 1;
            },
            tuppleDelimiter: function () {
                return this.index % 2 === 1 && this.index !== this.parent.data.length - 1;
            },
            tuppleLeft: function () {
                return this.index % 2 === 0;
            },
            tuppleRight: function () {
                return this.index % 2 === 1;
            },
            boolConverter: function (par, trueVal, falseVal) {
                if (typeof par == "function")
                    par = par();
                return Utils.Empty(par) ? (falseVal ? falseVal : '') : (trueVal ? trueVal : '');
            },
            numConverter: function (par) {
                var pars = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    pars[_i - 1] = arguments[_i];
                }
                if (typeof par == "function")
                    par = par();
                var idx = Utils.Empty(par) ? 0 : par;
                if (idx >= pars.length)
                    throw "numConverter";
                return pars[idx];
            }
        });
})(JsRenderHelpers || (JsRenderHelpers = {}));
var CSLocalize = null;
var Trados;
(function (Trados) {
    //***************** Lokalizace SW
    var rxLocComment = new RegExp("\\(\\*.*?\\*\\)", "g");
    Trados.actLang = 0;
    Trados.actLangStr = "en_gb";
    Trados.actLangCode = "en-gb"; //napr. sp-sp
    Trados.actLangNetCode = "en-gb"; //napr. es-es
    Trados.isRtl = false;
    var rtlLangs = [LMComLib.Langs.ar_sa];
    //export function isRtl():boolean { return _.any(rtlLangs, l => l == actLang);}
    //export function initLang(lng: LMComLib.Langs): void {
    //  forceLang = lng == LMComLib.Langs.no ? null : LowUtils.EnumToString(LMComLib.Langs, lng).replace("_", "-");
    //}
    //var forceLang: string;
    var alertCalled = false;
    function Localize(id, def) {
        if (typeof tradosData == "undefined") {
            if (!alertCalled) {
                debugger;
                alert("Trados.Localize: missing tradosData");
            }
            alertCalled = true;
            return locNormalize(def);
        }
        if (id == null)
            return locNormalize(def);
        var res = tradosData[id];
        if (typeof (res) == 'undefined' || res == "###TRANS TODO###")
            return locNormalize(def);
        return res;
    }
    ;
    function locNormalize(s) { return s.replace(rxLocComment, ''); }
    Trados.locNormalize = locNormalize;
    if ($.views)
        $.views.helpers({
            CSLocalize: function (s, d) {
                try {
                    return CSLocalize(s, d);
                }
                catch (exp) {
                    throw exp;
                }
            },
            isRtl: function () { return Trados.isRtl; },
            cookie: function (name) { return gCookie.getCookie(name); },
        });
    CSLocalize = Localize;
    //Jsou dva pripady: 
    // - jazyk je definovan tim, ze je primo v HTML strance spravny.JS soubor.
    // - nebo je jazyk definovan externe a spravny .JS soubor se naladuje dynamicky
    function adjustLoc(completed) {
        /************ zjisteni jazyka *****************/
        var loadScript;
        var lng; //var fromCookie = "";
        if (typeof tradosData != "undefined") {
            lng = tradosData["forceLang"]; //jazyk je urcen timto .JS souborem
            Logger.trace("Trados.adjustLoc", "JS included, lng=" + lng);
            loadScript = false;
        }
        else {
            Logger.trace("Trados.adjustLoc", "JS not included");
            lng = null; //forceLang;
            loadScript = true;
        }
        if (_.isEmpty(lng)) {
            var hash = LowUtils.parseQuery(location.hash);
            if (hash != null && hash["lang"]) {
                lng = hash["lang"];
                location.hash = "";
            }
        }
        if (_.isEmpty(lng)) {
            var search = LowUtils.parseQuery(location.search);
            if (search != null && search["lang"]) {
                lng = search["lang"];
            }
        }
        //Jazyk z cookie:
        //if (loadScript && Utils.Empty(lng)) fromCookie = lng = Cook.read(LMComLib.CookieIds.lang);
        if (_.isEmpty(lng))
            lng = lng = Cook.read(LMComLib.CookieIds.lang);
        //jazyk neznamy => default
        if (_.isEmpty(lng) || lng == "no")
            lng = "en-gb"; //jazyk neznamy => default
        lng = lng.replace('es-es', 'sp-sp');
        Logger.trace("Trados.adjustLoc", "lng=" + lng);
        /************ pouziti zjisteneho jazyka *****************/
        //save to cookie:
        lng = lng.toLowerCase(); //fromCookie = fromCookie.toLowerCase();
        //if (loadScript && fromCookie != lng) Cook.write(LMComLib.CookieIds.lang, lng);
        //if (fromCookie != lng)
        Cook.write(LMComLib.CookieIds.lang, lng);
        //use lang
        var newLng = LowUtils.EnumParse(LMComLib.Langs, lng.replace('-', '_'));
        var isOK = Trados.actLang == newLng;
        Trados.actLang = newLng;
        var doCompleted = function () {
            Trados.actLangStr = LowUtils.EnumToString(LMComLib.Langs, Trados.actLang);
            Trados.actLangCode = Trados.actLangStr.replace("_", "-");
            Trados.actLangNetCode = Trados.actLangCode.replace('sp-sp', 'es-es');
            _.each(Globalize.cultures, function (c) { Globalize.cultures[c.name.toLowerCase()] = c; }); //culture lowercase
            Globalize.culture(Trados.actLangNetCode);
            Trados.isRtl = _.indexOf(rtlLangs, Trados.actLang) >= 0;
            completed();
        };
        if (isOK || Trados.actLang == LMComLib.Langs.en_gb) {
            tradosData = {};
            doCompleted();
            return;
        } //anglictina se neladuje
        if (!loadScript) {
            doCompleted();
            return;
        } //scorm nebo local: jiz naladovano
        /************ naladovani .JS souboru *****************/
        var spHack = lng == "sp-sp" ? "es-es" : lng;
        $.when($.ajax({
            cache: true,
            dataType: "script",
            url: Pager.path(Pager.pathType.relPath, Utils.string_format("jslib/scripts/cultures/globalize.culture.{0}.js", [spHack]))
        }), $.ajax({
            cache: true,
            dataType: "script",
            url: Pager.path(Pager.pathType.relPath, Utils.string_format("schools/loc/tradosData.{0}.js", [spHack]))
        })).done(function () { return doCompleted(); })
            .fail(function () {
            doCompleted(); /*noop, pouzije se difotni lokalizace, tj anglictina */
        });
    }
    Trados.adjustLoc = adjustLoc;
    //***************** Lokalizace dat
    //lokalizace JSON objektu
    function localizeObject(s, locPar, isRJson) {
        if (isRJson === void 0) { isRJson = false; }
        s = localizeJSON(s, locPar);
        var res = JSON.parse(s);
        return isRJson ? RJSON.unpack(res) : res; //ev. RJSON
    }
    Trados.localizeObject = localizeObject;
    //export function xlocalizeObjectEx(s: string, locPar: (s: string) => string): any { 
    //  s = replEx(s, v => "Trados.loc(" + v + ")");
    //  loc = locPar;
    //  locReplace = repl;
    //  var toEval = "(Trados.locRes = " + s + ");";
    //  eval(toEval);
    //  return locRes;
    //}
    //pomocne udaje
    //var locTable: string[];
    //var locReplace: (s: string) => string;
    //export var locRes;
    //export var loc : (s: string) => string; //hodnota property JSON objetku je dosazena pomoci Trados.loc funkce
    //low level nahrada {{}} zavorek pro umisteni do html
    function localize(data, loc) {
        //if (!loc) return data;
        var isJson = data.charAt(0) == "{";
        return data.replace(locEx, function (match) {
            var gm = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                gm[_i - 1] = arguments[_i];
            }
            var group_match = gm[0];
            var data = loc ? loc[group_match] : null;
            if (data && (isJson || group_match == 'Ahtmltitle')) {
                data = JSON.stringify(data);
                data = data.substr(1, data.length - 2);
            }
            return data ? data.toString() : "*** " + group_match + " ***";
        });
    }
    Trados.localize = localize;
    var locEx = /{{(.*?)}}/g;
    //low level nahrada {{}} zavorek pro umisteni do JSON stringu
    function localizeJSON(data, loc) {
        if (!loc)
            return data;
        return data.replace(locEx, function (match) {
            var gm = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                gm[_i - 1] = arguments[_i];
            }
            var group_match = gm[0];
            var data = JSON.stringify(loc[group_match]);
            if (data)
                data = data.substr(1, data.length - 2);
            return data ? data.toString() : "*** " + group_match + " ***";
        });
    }
    Trados.localizeJSON = localizeJSON;
})(Trados || (Trados = {}));
if (typeof ko != 'undefined') {
    ko.bindingHandlers["width"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            valueAccessor($(element).width());
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            $(element).width(ko.utils.unwrapObservable(valueAccessor()));
        }
    };
    ko.bindingHandlers["height"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            valueAccessor($(element).height());
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            $(element).height(ko.utils.unwrapObservable(valueAccessor()));
        }
    };
}
ko.bindingHandlers['test'] = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var nm = ko.unwrap(valueAccessor());
        _.each($(element).parents().toArray(), function (el) {
            var n = el.getAttribute("data-bind");
            if (n) {
                var t = testRegEx.exec(n);
                if (t)
                    nm = t[1] + '.' + nm;
            }
        });
        element.setAttribute('name', nm);
    }
};
var testRegEx = /.*test:'(.*?)'/g;

var Pager;
(function (Pager) {
    (function (pathType) {
        //root,
        pathType[pathType["eTestMe"] = 0] = "eTestMe";
        pathType[pathType["restServices"] = 1] = "restServices";
        pathType[pathType["loggerService"] = 2] = "loggerService";
        pathType[pathType["restServicesScorm"] = 3] = "restServicesScorm";
        pathType[pathType["eaScormServer"] = 4] = "eaScormServer";
        pathType[pathType["eaData"] = 5] = "eaData";
        pathType[pathType["relPath"] = 6] = "relPath";
        //schoolCourse, //lmcom/rew/schools/courses/
        pathType[pathType["cpv"] = 7] = "cpv";
        //
        pathType[pathType["grammar"] = 8] = "grammar";
        pathType[pathType["instructions"] = 9] = "instructions";
        pathType[pathType["sitemaps"] = 10] = "sitemaps";
        pathType[pathType["sitemapRoot"] = 11] = "sitemapRoot";
        pathType[pathType["moduleData"] = 12] = "moduleData";
        pathType[pathType["dictInfo"] = 13] = "dictInfo";
        pathType[pathType["course2rewiseMap"] = 14] = "course2rewiseMap";
        pathType[pathType["rewiseIndex"] = 15] = "rewiseIndex";
        pathType[pathType["rewiseLesson"] = 16] = "rewiseLesson";
        pathType[pathType["prod"] = 17] = "prod";
        pathType[pathType["data"] = 18] = "data";
    })(Pager.pathType || (Pager.pathType = {}));
    var pathType = Pager.pathType;
    //base tag musi byt absolutni URL, neboli je k nicemu
    //var bases = document.getElementsByTagName('base');
    //export var basicDir: string;
    //export var basicUrl: string;
    //if (bases && bases.length == 1) {
    //  var parts = bases[0].href.toLowerCase().split('/');
    //  var schoolIdx = _.indexOf(parts, 'schools');
    //  parts = parts.slice(0, schoolIdx >= 0 ? schoolIdx : parts.length - 2); //odrizni Schools
    //  basicDir = parts.join('/');
    //  basicUrl = basicDir + '/';
    //  //basicDir = basicUrl.substr(0, basicUrl.length - 1);
    //} else {
    //k http://www.langmaster.com/rew/Schools/NewEA.aspx... vrati http://www.langmaster.com/rew/
    var parts = location.pathname.toLowerCase().split('/');
    var schoolIdx = _.indexOf(parts, 'schools');
    ////var href = 'http(s)://server/_layouts/SharePointLearningKit/Frameset/Frameset.aspx'.toLowerCase();
    ////var idx = href.indexOf('/sharepointlearningkit/');
    ////href = href.substr(0, idx + 1) + 'SLMS/SLMSLoadLM.ashx';
    parts = parts.slice(0, schoolIdx >= 0 ? schoolIdx : parts.length - 2); //odrizni Schools/NewEA.aspx
    Pager.basicDir = location.protocol + '//' + location.host + parts.join('/');
    Pager.basicUrl = Pager.basicDir + '/';
    //}
    //export var cfg: ajaxConfig = { forceServiceUrl: null };
    function path(type, url, loc) {
        if (url === void 0) { url = ""; }
        if (loc === void 0) { loc = LMComLib.Langs.no; }
        var res = null;
        switch (type) {
            //case pathType.root: res = '../'; break;
            case pathType.relPath:
                return '../' + url;
                break;
            case pathType.restServices:
                return !cfg.forceServiceUrl ? Pager.basicUrl + 'service.ashx' : serviceUrl();
                break;
            case pathType.loggerService:
                return cfg.forceLoggerUrl ? cfg.forceLoggerUrl : path(pathType.restServices);
                break;
            case pathType.restServicesScorm:
                return cfg.forceServiceUrl == null ? Pager.basicUrl + 'scormEx.ashx' : serviceUrl();
                break;
            /*********** OBSOLETE **************/
            case pathType.eTestMe:
                res = 'lmcom/eTestMe.com/Test.aspx';
                break;
            case pathType.eaScormServer:
                res = 'lmcom/services/rpc/ea/scormserver.aspx';
                break;
            case pathType.eaData:
                res = LMComLib.LangToEADir[loc.toString()] + "/";
                break;
            case pathType.cpv:
                res = "lmcom/eTestMe.com/site/" + Trados.actLangCode + '/ListeningAndPronunc.aspx#/AppPronunc/FactSoundView.xaml?IsFactOnly=true&';
                break;
            default: throw "NotImplemented";
        }
        return Pager.basicUrl + res + url;
    }
    Pager.path = path;
    function serviceUrl() {
        var cfgUrl = cfg.forceServiceUrl;
        switch (cfgUrl) {
            case 'edoceo':
                return location.protocol + '//' + location.host + '/' + location.pathname.split('/')[1] + '/courseresult/langmaster';
            case 'scomp-sharepoint':
                var href = location.href.toLowerCase();
                var idx = href.indexOf('/sharepointlearningkit/');
                href = href.substr(0, idx + 1);
                href += 'SLMS/SLMSLoadLM.ashx'.toLowerCase();
                //Query GUID
                var frame = window;
                var guid = null;
                var lkpar = 'LearnerAssignmentId'.toLowerCase();
                while (frame != null) {
                    guid = LowUtils.getQuery(LowUtils.parseQuery(frame.location.search), lkpar, null);
                    if (guid != null)
                        break;
                    frame = frame == frame.parent ? null : frame.parent;
                }
                if (guid != null)
                    href += '?AttemptIdGuid=' + guid;
                return href;
            case 'scomp-sharepoint-test':
                return "http://localhost/rew/scormexNet35.ashx";
            case 'moodle-pchelp':
                var href = scorm.apiUrl.replace('mod/scorm/player.php', 'filter/langmaster/service.php');
                return href;
            default:
                return cfgUrl;
        }
    }
    function replaceJSON(fn, replace) {
        return replace ? fn.replace('.json', '.js').replace('.rjson', '.js').replace('.lst', '.txt') : fn;
    }
    Pager.replaceJSON = replaceJSON;
    //export function filePath(type: pathType, id: string, loc: string = null): locPaths {
    //  var dir: string; var ext = "json"; var locExt = "json"; //var urlDict = null;
    //  switch (type) {
    //    case pathType.prod:
    //    //case pathType.data:
    //    //  id = "../" + pathType[type] + "/" + id.toLowerCase() + '.json';
    //    //  return { url: id, urlLoc: id.replace('.', '.' + loc + '.') };
    //    //case pathType.sitemaps: dir = "eacourses"; ext = "rjson"; break;
    //    //case pathType.sitemapRoot: dir = "eacourses"; id = "courses"; ext = "rjson"; break; //id se ignoruje
    //    //case pathType.sitemapRoot: dir = "eacourses"; id = "courses"; break; //id se ignoruje
    //    //case pathType.dictInfo: dir = "eacourses"; id = "dicts"; ext = "rjson"; break; //id se ignoruje
    //    //case pathType.grammar: dir = "eagrammar"; break;
    //    //case pathType.instructions: dir = "eadata"; id = "instructions"; break; //id se ignoruje
    //    //case pathType.moduleData: dir = "eadata"; /*urlDict = "lingDict_" + id;*/ break;
    //    //case pathType.course2rewiseMap: dir = "../rwbooks/runtime"; id = "crs2rwmap"; locExt = "rjson"; break; //id se ignoruje, pouze lokalizovana cast
    //    //case pathType.rewiseIndex: dir = "../rwbooks/runtime"; id = "index"; locExt = "rjson"; break; //id se ignoruje, pouze lokalizovana cast
    //    //case pathType.rewiseLesson: dir = "../rwbooks/runtime"; id = Utils.hashDir1(id, 0x3f) + "/" + id; locExt = "rjson"; break; //pouze lokalizovana cast, id je cislo lekce
    //      //case pathType.dictData: dir = "eadata"; locExt = "rjson";
    //      //pro English?E vezmi English? slovnik
    //      //id = id.replace(/(_english\d)e(_)/i, '$1$2');
    //      break;
    //  }
    //  //if (urlDict != null) urlDict = dir + "/" + loc + "/" + urlDict + ".json";
    //  return { url: dir + "/" + id.toLowerCase() + "." + ext, urlLoc: dir + "/" + loc + "/" + id.toLowerCase() + "." + locExt };
    //}
    ////Ajax z Silverlight, volani pres URL mechanismus (napr. pro edoceo v Schools\PersistScormEx.ts)
    //export function doSLAjax(isPost: boolean, url: string, type: string, data: string, callbackObj): void {
    //  doAjax(isPost, url, type, data, (res: string) => callbackObj.completed(res));
    //}
    ////Ajax z Silverlight, volani pres CMD mechanismus (napr. Schools\PersistNewEA.ts)
    //export function doSLAjaxCmd(isPost: boolean, url: string, type: string, data: string, callbackObj): void {
    //  doAjax(isPost, url, type, data, (str: any) => {
    //    if (str == null) { callbackObj.completed(null); return; }
    //    var res: LMComLib.RpcResponse = typeof str == 'string' ? (_.isEmpty(str) ? null : JSON.parse(str)) : str;
    //    if (res == null) return;
    //    if (res.error != 0)
    //      Logger.error('Ajax.doSLAjaxCmd', res.error.toString() + ": " + res.errorText + ", " + url, '');
    //    else
    //      callbackObj.completed(res.result);
    //  });
    //}
    //Ajax pres CMD mechanismus (napr. Schools\PersistNewEA.ts)
    function doAjaxCmd(isPost, url, type, data, completed, error) {
        if (error === void 0) { error = null; }
        doAjax(isPost, url, type, data, function (str) {
            if (str == null) {
                completed(null);
                return;
            }
            var res = typeof str == 'string' ? (_.isEmpty(str) ? null : JSON.parse(str)) : str;
            if (res == null) {
                completed(null);
                return;
            }
            else if (res.error != 0) {
                Logger.error('Ajax.doSLAjaxCmd', res.error.toString() + ": " + res.errorText + ", " + url, '');
                if (error)
                    error(res.error, res.errorText);
            }
            else
                completed(res.result);
        });
    }
    Pager.doAjaxCmd = doAjaxCmd;
    function ajax_download(url, data, type, input_name) {
        if (input_name === void 0) { input_name = "par"; }
        var $iframe, iframe_doc, iframe_html;
        if (($iframe = $('#download_iframe')).length === 0) {
            $iframe = $("<iframe id='download_iframe'" +
                " style='display: none' src='about:blank'></iframe>").appendTo("body");
        }
        url += url.indexOf('?') >= 0 ? "&" : '?';
        url += "timestamp=" + new Date().getTime().toString();
        if (type)
            url += '&type=' + type;
        if (url.charAt(0) == '/')
            url = '..' + url;
        iframe_doc = $iframe[0].contentWindow || $iframe[0].contentDocument;
        if (iframe_doc.document) {
            iframe_doc = iframe_doc.document;
        }
        iframe_html = "<html><head></head><body><form method='POST' action='" +
            url + "'>" +
            "<input type=hidden name='" + input_name + "' value='" +
            JSON.stringify(data) + "'/></form>" +
            "</body></html>";
        iframe_doc.open();
        iframe_doc.write(iframe_html);
        $(iframe_doc).find('form').submit();
    }
    Pager.ajax_download = ajax_download;
    //Univerzalni AJAX funkce pro POST x GET. crossdomain x bez
    function doAjax(isPost, url, type, data, completed /*, error: (id: number, msg: string) => void = null*/) {
        var isCrossDomain = Utils.isCrossDomain(url);
        //var isCrossDomain = true;
        var timestamp = new Date().getTime().toString();
        url += url.indexOf('?') >= 0 ? "&" : '?';
        url += "timestamp=" + timestamp;
        if (type)
            url += '&type=' + type;
        if (url.charAt(0) == '/')
            url = '..' + url;
        if (isPost && isCrossDomain) {
            Utils.iFrameSubmit(url + '&LoggerLogId=' + Logger.logId() + "&LMComVersion=" + Utils.LMComVersion, data, completed);
        }
        else {
            if (!isPost && data)
                url += "&par=" + encodeURIComponent(data);
            Logger.trace('<#' + timestamp + ' doAjax', 'url=' + url + (isPost ? ', data=' + data : ''));
            $.ajax(url, {
                async: true,
                type: isPost ? 'POST' : 'GET',
                dataType: isCrossDomain ? 'jsonp' : 'text',
                data: isPost ? data : '',
                contentType: "text/plain; charset=UTF-8",
                headers: { "LoggerLogId": Logger.logId(), "LMComVersion": Utils.LMComVersion }
            }).
                done(function (res) { if (completed)
                completed(res); }).
                fail(function () { debugger; Logger.error('Ajax.doAjax', url, ''); });
        }
    }
    Pager.doAjax = doAjax;
    //Obsolete, POST (nema obecne callback - pro crossdomain) 
    function ajaxPost(pthType, type, data, completed, error) {
        if (completed === void 0) { completed = null; }
        if (error === void 0) { error = null; }
        var url = Pager.path(pthType);
        doAjax(true, url, type, JSON.stringify(data), function (str) {
            if (!completed)
                return;
            var res = typeof str == 'string' ? (_.isEmpty(str) ? {} : JSON.parse(str)) : str;
            //if (res.error && res.error != 0)
            //  if (res.error == 999) Logger.error('ajaxPost', url + ": " + res.errorText + ", " + url, '');
            //  else {
            //    if (error) error(res.error, res.errorText); else Logger.error('ajaxPost', res.errorText, '');
            //  }
            //else if (completed != null) completed(res.result);
            if (res.error && res.error != 0)
                switch (res.error) {
                    case 999:
                        Logger.error('ajaxGet', url + ": " + res.errorText + ", " + url, '');
                        break;
                    case 998:
                        Logger.error('Warning: User logged under other account', url + ": " + res.errorText, '');
                        LMStatus.LogoutLow();
                        break;
                    default:
                        if (error)
                            error(res.error, res.errorText);
                        else
                            Logger.error('ajaxGet', res.errorText, '');
                        break;
                }
            else if (completed != null)
                completed(res.result);
        });
    }
    Pager.ajaxPost = ajaxPost;
    //export function ajaxGetEx<T>(pthType: Pager.pathType, type: string, objData: T, completed: (res: any) => void, error: (id: number, msg: string) => void = null): void {
    //  var url = Pager.path(pthType);
    //  doAjax(false, url, type, JSON.stringify(objData),
    //    (str: any) => {
    //      var res: LMComLib.RpcResponse = typeof str == 'string' ? JSON.parse(str) : str;
    //      if (res.error && res.error != 0)
    //        switch (res.error) {
    //          case 999:
    //            Logger.error('ajaxGet', url + ": " + res.errorText + ", " + url, '');
    //            break;
    //          case 998:
    //            break;
    //          default:
    //            if (error) error(res.error, res.errorText); else Logger.error('ajaxGet', res.errorText, '');
    //            break;
    //        }
    //      else if (completed != null) completed(res.result);
    //    });
    //}
    //Obsolete, GET
    function ajaxGet(pthType, type, objData, completed, error) {
        if (error === void 0) { error = null; }
        var url = Pager.path(pthType);
        doAjax(false, url, type, JSON.stringify(objData), function (str) {
            var res = typeof str == 'string' ? JSON.parse(str) : str;
            if (res.error && res.error != 0)
                switch (res.error) {
                    case 999:
                        Logger.error('ajaxGet', url + ": " + res.errorText + ", " + url, '');
                        break;
                    case 998:
                        Logger.error('Warning: User logged under other account', url + ": " + res.errorText, '');
                        LMStatus.LogoutLow();
                        break;
                    default:
                        if (error)
                            error(res.error, res.errorText);
                        else
                            Logger.error('ajaxGet', res.errorText, '');
                        break;
                }
            else if (completed != null)
                completed(res.result);
        });
    }
    Pager.ajaxGet = ajaxGet;
})(Pager || (Pager = {}));
$.ajaxTransport("+*", function (options, originalOptions, jqXHR) {
    // Test for the conditions that mean we can/want to send/receive blobs or arraybuffers - we need XMLHttpRequest
    // level 2 (so feature-detect against window.FormData), feature detect against window.Blob or window.ArrayBuffer,
    // and then check to see if the dataType is blob/arraybuffer or the data itself is a Blob/ArrayBuffer
    if (window.FormData && ((options.dataType && (options.dataType == 'blob' || options.dataType == 'arraybuffer'))
        || (options.data && ((window.Blob && options.data instanceof Blob)
            || (window.ArrayBuffer && options.data instanceof ArrayBuffer))))) {
        return {
            /**
             * Return a transport capable of sending and/or receiving blobs - in this case, we instantiate
             * a new XMLHttpRequest and use it to actually perform the request, and funnel the result back
             * into the jquery complete callback (such as the success function, done blocks, etc.)
             *
             * @param headers
             * @param completeCallback
             */
            send: function (headers, completeCallback) {
                var xhr = new XMLHttpRequest(), url = options.url || window.location.href, type = options.type || 'GET', dataType = options.dataType || 'text', data = options.data || null, async = options.async || true;
                xhr.addEventListener('load', function () {
                    var res = {};
                    res[dataType] = xhr.response;
                    completeCallback(xhr.status, xhr.statusText, res, xhr.getAllResponseHeaders());
                });
                xhr.open(type, url, async);
                xhr.responseType = dataType;
                xhr.send(data);
            },
            abort: function () {
                jqXHR.abort();
            }
        };
    }
});