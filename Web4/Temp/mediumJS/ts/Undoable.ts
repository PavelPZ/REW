/// <reference path="base.ts" />
/// <reference path="utilities.ts" />
declare var Undo:any;
module LMMedium {
  export class Undoable {
    movingThroughStack = false;
    element;
    timer;
    startValue;
    stack = new Undo.Stack();
    oldValue;
    newValue;
    makeUndoable;
    constructor (public medium:any) {
      var me = this;
      me.element = medium.settings.element;
      var EditCommand = Undo.Command.extend({
        constructor: function (oldValue, newValue) {
          me.oldValue = oldValue;
          me.newValue = newValue;
        },
        execute: function () {
        },
        undo: function () {
          me.element.innerHTML = me.oldValue;
          medium.canUndo = me.stack.canUndo();
          medium.canRedo = me.stack.canRedo();
          medium.dirty = me.stack.dirty();
        },
        redo: function () {
          me.element.innerHTML = me.newValue;
          medium.canUndo = me.stack.canUndo();
          medium.canRedo = me.stack.canRedo();
          medium.dirty = me.stack.dirty();
        }
      });
      this.makeUndoable = function (isInit?) {
        var newValue = me.element.innerHTML;

        if (isInit) {
          me.startValue = me.element.innerHTML;
          me.stack.execute(new EditCommand(me.startValue, me.startValue));
        }

          // ignore meta key presses
        else if (newValue != me.startValue) {

          if (!me.movingThroughStack) {
            // this could try and make a diff instead of storing snapshots
            me.stack.execute(new EditCommand(me.startValue, newValue));
            me.startValue = newValue;
            medium.dirty = me.stack.dirty();
          }

          LMMedium.utils.triggerEvent(medium.settings.element, "change");
        }
      };

      LMMedium.utils.addEvent(me.element, 'keyup', function (e) {
        if (e.ctrlKey || e.keyCode === key.z) {
          utils.preventDefaultEvent(e);
          return;
        }

        // a way too simple algorithm in place of single-character undo
        clearTimeout(me.timer);
        me.timer = setTimeout(function () {
          this.makeUndoable();
        }, 250);
      })

        .addEvent(me.element, 'keydown', function (e) {
          if (!e.ctrlKey || e.keyCode !== key.z) {
            me.movingThroughStack = false;
            return;
          }

          utils.preventDefaultEvent(e);

          me.movingThroughStack = true;

          if (e.shiftKey) {
            me.stack.canRedo() && me.stack.redo()
          } else {
            me.stack.canUndo() && me.stack.undo();
          }
        });
    }
  }
}

