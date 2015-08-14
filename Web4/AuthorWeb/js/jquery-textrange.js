var textRange;
(function (textRange) {
    function getRange(self) {
        var jq;
        return _textrange[browserType(self)].get(self);
    }
    textRange.getRange = getRange;
    /**
     * $().textrange('set')
     *
     * Sets the selected text of an object by specifying the start and length of the selection.
     *
     * The start and length parameters are identical to PHP's substr() function with the following changes:
     *  - excluding start will select all the text in the field.
     *  - passing 0 for length will set the cursor at start. See $().textrange('setcursor')
     *
     * @param (optional) start
     * @param (optional) length
     *
     * @see http://php.net/manual/en/function.substr.php
     */
    function setRange(self, s, l) {
        var e;
        if (typeof s === 'undefined') {
            s = 0;
        }
        else if (s < 0) {
            s = self.val().length + s;
        }
        if (typeof l === 'undefined') {
            e = self.val().length;
        }
        else if (length >= 0) {
            e = s + l;
        }
        else {
            e = self.val().length + l;
        }
        _textrange[browserType(self)].set(self, s, e);
        return self;
    }
    textRange.setRange = setRange;
    /*
     * $().textrange('setcursor')
    *
     * Sets the cursor at a position of the text field.
     *
     * @param position
    */
    function setcursor(self, position) {
        return setRange(self, position, 0);
    }
    textRange.setcursor = setcursor;
    /*
     * $().textrange('replace')
    * Replaces the selected text in the input field or textarea with text.
     *
     * @param text The text to replace the selection with.
     */
    function replace(self, text) {
        _textrange[browserType(self)].replace(self, text);
        return self;
    }
    textRange.replace = replace;
    /*
     * Alias for $().textrange('replace')
      */
    function insert(self, text) {
        return replace(self, text);
    }
    textRange.insert = insert;
    function browserType(self) {
        return 'selectionStart' in self[0] ? 'xul' : document.selection ? 'msie' : 'unknown';
    }
    var _textrange = {
        xul: {
            get: function (self, property) {
                var ta = (self[0]);
                var props = {
                    position: ta.selectionStart,
                    start: ta.selectionStart,
                    end: ta.selectionEnd,
                    length: ta.selectionEnd - ta.selectionStart,
                    text: self.val().substring(ta.selectionStart, ta.selectionEnd)
                };
                return typeof property === 'undefined' ? props : props[property];
            },
            set: function (self, start, end) {
                var ta = (self[0]);
                ta.selectionStart = start;
                ta.selectionEnd = end;
            },
            replace: function (self, text) {
                var ta = (self[0]);
                var val = self.val();
                var start = ta.selectionStart;
                self.val(val.substring(0, ta.selectionStart) + text + val.substring(ta.selectionEnd, val.length));
                ta.selectionStart = start;
                ta.selectionEnd = start + text.length;
            }
        },
        msie: {
            get: function (self, property) {
                var range = document.selection.createRange();
                if (typeof range === 'undefined') {
                    return {
                        position: 0,
                        start: 0,
                        end: self.val().length,
                        length: self.val().length,
                        text: self.val()
                    };
                }
                var rangetext = self[0].createTextRange();
                var rangetextcopy = rangetext.duplicate();
                rangetext.moveToBookmark(range.getBookmark());
                rangetextcopy.setEndPoint('EndToStart', rangetext);
                var props = {
                    position: rangetextcopy.text.length,
                    start: rangetextcopy.text.length,
                    end: rangetextcopy.text.length + range.text.length,
                    length: range.text.length,
                    text: range.text
                };
                return typeof property === 'undefined' ? props : props[property];
            },
            set: function (self, start, end) {
                var range = self[0].createTextRange();
                if (typeof range === 'undefined') {
                    return self;
                }
                if (typeof start !== 'undefined') {
                    range.moveStart('character', start);
                    range.collapse();
                }
                if (typeof end !== 'undefined') {
                    range.moveEnd('character', end - start);
                }
                range.select();
            },
            replace: function (self, text) {
                document.selection.createRange().text = text;
            }
        }
    };
})(textRange || (textRange = {}));
