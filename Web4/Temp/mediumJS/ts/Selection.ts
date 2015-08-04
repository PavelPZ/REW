/// <reference path="base.ts" />
module LMMedium {
  export class Selection {

    saveSelection():any {
      if (w.getSelection) {
        var sel = w.getSelection();
        if (sel.rangeCount > 0) {
          return sel.getRangeAt(0);
        }
      } else if (d.selection && d.selection.createRange) { // IE
        return d.selection.createRange();
      }
      return null;
    }

    restoreSelection(range) {
      if (range) {
        if (w.getSelection) {
          var sel = w.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } else if (d.selection && range.select) { // IE
          range.select();
        }
      }
    }
  }
}
