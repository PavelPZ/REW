/// <reference path="../jsd/jquery.d.ts" />
/// <reference path="../jsd/knockout.d.ts" />
/// <reference path="../jsd/jsrender.d.ts" />
/// <reference path="../jsd/underscore.d.ts" /> 
/// <reference path="../js/Utils.ts" />
/// <reference path="../js/Base32.ts" />
var keys;
(function (keys) {
    function toString(key) {
        var b1 = Utils.longToByteArray(key.licId);
        var b2 = Utils.longToByteArray(key.counter);
        var b3 = [b2[0], b2[1], b2[2], b1[0], b1[1]];
        b3 = LowUtils.encrypt(b3);
        return Base32.encode(b3).toUpperCase();
    }
    keys.toString = toString;
    function fromString(str) {
        var b3 = Base32.decode(str);
        b3 = LowUtils.decrypt(b3);
        var b2 = [b3[0], b3[1], b3[2], 0, 0, 0, 0, 0];
        var b1 = [b3[3], b3[4], 0, 0, 0, 0, 0, 0];
        return { licId: Utils.byteArrayToLong(b1), counter: Utils.byteArrayToLong(b2) };
    }
    keys.fromString = fromString;
})(keys || (keys = {}));
