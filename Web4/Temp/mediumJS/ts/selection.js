/// <reference path="base.ts" />
var LMMedium;
(function (LMMedium) {
    var Selection = (function () {
        function Selection() {
        }
        Selection.prototype.saveSelection = function () {
            if (LMMedium.w.getSelection) {
                var sel = LMMedium.w.getSelection();
                if (sel.rangeCount > 0) {
                    return sel.getRangeAt(0);
                }
            }
            else if (LMMedium.d.selection && LMMedium.d.selection.createRange) {
                return LMMedium.d.selection.createRange();
            }
            return null;
        };
        Selection.prototype.restoreSelection = function (range) {
            if (range) {
                if (LMMedium.w.getSelection) {
                    var sel = LMMedium.w.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
                else if (LMMedium.d.selection && range.select) {
                    range.select();
                }
            }
        };
        return Selection;
    })();
    LMMedium.Selection = Selection;
})(LMMedium || (LMMedium = {}));
