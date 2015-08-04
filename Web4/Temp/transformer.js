function toXmlAcc(jsonml, acc) {
    if (_.isArray(jsonml)) {
        acc.push("<");
        acc.push(jsonml[0]);
        var pos = 1;
        var attributes = jsonml[1];
        if (attributes && !_.isArray(attributes) && typeof (attributes) !== "string") {
            for (var key in attributes) {
                if (attributes.hasOwnProperty(key)) {
                    acc.push(' ');
                    acc.push(key);
                    acc.push('="');
                    xmlEscape(attributes[key], acc);
                    acc.push('"');
                }
            }
            ++pos;
        }
        if (pos < jsonml.length) {
            acc.push(">");
            do {
                toXmlAcc(jsonml[pos], acc);
                ++pos;
            } while (pos < jsonml.length);
            acc.push("</");
            acc.push(jsonml[0]);
            acc.push(">");
        }
        else {
            acc.push(" />");
        }
    }
    else {
        xmlEscape(jsonml.toString(), acc);
    }
}
function xmlEscape(str, acc) {
    for (var i = 0; i < str.length; ++i) {
        var c = str[i];
        var code = c.charCodeAt(0);
        var s = reventities[c];
        if (s) {
            acc.push("&" + s + ";");
        }
        else if (code >= 128) {
            acc.push("&#" + code + ";");
        }
        else {
            acc.push(c);
        }
    }
}
var reventities = (function () {
    var result = {};
    for (var key in entities) {
        if (entities.hasOwnProperty(key)) {
            result[entities[key]] = key;
        }
    }
    return result;
})();
var entities = {
    "quot": '"',
    "amp": '&',
    "apos": "'",
    "lt": '<',
    "gt": '>'
};
