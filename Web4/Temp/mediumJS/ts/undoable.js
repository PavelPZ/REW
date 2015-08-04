/// <reference path="base.ts" />
/// <reference path="utilities.ts" />
var LMMedium;
(function (LMMedium) {
    var Undoable = (function () {
        function Undoable(medium) {
            this.medium = medium;
            this.movingThroughStack = false;
            this.stack = new Undo.Stack();
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
            this.makeUndoable = function (isInit) {
                var newValue = me.element.innerHTML;
                if (isInit) {
                    me.startValue = me.element.innerHTML;
                    me.stack.execute(new EditCommand(me.startValue, me.startValue));
                }
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
                if (e.ctrlKey || e.keyCode === LMMedium.key.z) {
                    LMMedium.utils.preventDefaultEvent(e);
                    return;
                }
                // a way too simple algorithm in place of single-character undo
                clearTimeout(me.timer);
                me.timer = setTimeout(function () {
                    this.makeUndoable();
                }, 250);
            })
                .addEvent(me.element, 'keydown', function (e) {
                if (!e.ctrlKey || e.keyCode !== LMMedium.key.z) {
                    me.movingThroughStack = false;
                    return;
                }
                LMMedium.utils.preventDefaultEvent(e);
                me.movingThroughStack = true;
                if (e.shiftKey) {
                    me.stack.canRedo() && me.stack.redo();
                }
                else {
                    me.stack.canUndo() && me.stack.undo();
                }
            });
        }
        return Undoable;
    })();
    LMMedium.Undoable = Undoable;
})(LMMedium || (LMMedium = {}));
