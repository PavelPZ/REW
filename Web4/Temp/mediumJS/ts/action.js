/// <reference path="utilities.ts" />
/// <reference path="base.ts" />
var LMMedium;
(function (LMMedium) {
    function isEditable(e) {
        if (e.hasOwnProperty('target') && e.target.getAttribute('contenteditable') === 'false') {
            LMMedium.utils.preventDefaultEvent(e);
            return false;
        }
        return true;
    }
    var Action = (function () {
        function Action(medium) {
            this.medium = medium;
            this.handledEvents = {
                keydown: null,
                keyup: null,
                blur: null,
                focus: null,
                paste: null,
                click: null
            };
        }
        Action.prototype.setup = function () {
            this
                .handleFocus()
                .handleBlur()
                .handleKeyDown()
                .handleKeyUp()
                .handlePaste()
                .handleClick();
        };
        Action.prototype.destroy = function () {
            var el = this.medium.element;
            LMMedium.utils
                .removeEvent(el, 'focus', this.handledEvents.focus)
                .removeEvent(el, 'blur', this.handledEvents.blur)
                .removeEvent(el, 'keydown', this.handledEvents.keydown)
                .removeEvent(el, 'keyup', this.handledEvents.keyup)
                .removeEvent(el, 'paste', this.handledEvents.paste)
                .removeEvent(el, 'click', this.handledEvents.click);
        };
        Action.prototype.handleFocus = function () {
            var medium = this.medium, el = medium.element;
            LMMedium.utils.addEvent(el, 'focus', this.handledEvents.focus = function (e) {
                e = e || LMMedium.w.event;
                if (!isEditable(e)) {
                    return false;
                }
                LMMedium.Medium.activeElement = el;
                medium.placeholders();
            });
            return this;
        };
        Action.prototype.handleBlur = function () {
            var medium = this.medium, el = medium.element;
            LMMedium.utils.addEvent(el, 'blur', this.handledEvents.blur = function (e) {
                e = e || LMMedium.w.event;
                if (LMMedium.Medium.activeElement === el) {
                    LMMedium.Medium.activeElement = null;
                }
                medium.placeholders();
            });
            return this;
        };
        Action.prototype.handleKeyDown = function () {
            var action = this, medium = this.medium, settings = medium.settings, cache = medium.cache, el = medium.element;
            LMMedium.utils.addEvent(el, 'keydown', this.handledEvents.keydown = function (e) {
                e = e || LMMedium.w.event;
                if (!isEditable(e)) {
                    return false;
                }
                var keepEvent = true;
                //in Chrome it sends out this event before every regular event, not sure why
                if (e.keyCode === 229)
                    return;
                LMMedium.utils.isCommand(settings, e, function () {
                    cache.cmd = true;
                }, function () {
                    cache.cmd = false;
                });
                LMMedium.utils.isShift(e, function () {
                    cache.shift = true;
                }, function () {
                    cache.shift = false;
                });
                LMMedium.utils.isModifier(settings, e, function (cmd) {
                    if (cache.cmd) {
                        if ((settings.mode === LMMedium.Medium.inlineMode) || (settings.mode === LMMedium.Medium.partialMode)) {
                            LMMedium.utils.preventDefaultEvent(e);
                            return false;
                        }
                        var cmdType = typeof cmd;
                        var fn = null;
                        if (cmdType === "function") {
                            fn = cmd;
                        }
                        else {
                            fn = medium[cmd];
                        }
                        keepEvent = fn.call(medium, e);
                        if (keepEvent === false || keepEvent === medium) {
                            LMMedium.utils.preventDefaultEvent(e);
                            LMMedium.utils.stopPropagation(e);
                        }
                        return true;
                    }
                    return false;
                });
                if (settings.maxLength !== -1) {
                    var len = LMMedium.utils.text(el).length, hasSelection = false, selection = LMMedium.w.getSelection(), isSpecial = LMMedium.utils.isSpecial(e), isNavigational = LMMedium.utils.isNavigational(e);
                    if (selection) {
                        hasSelection = !selection.isCollapsed;
                    }
                    if (isSpecial || isNavigational) {
                        return true;
                    }
                    if (len >= settings.maxLength && !hasSelection) {
                        settings.maxLengthReached(el);
                        LMMedium.utils.preventDefaultEvent(e);
                        return false;
                    }
                }
                switch (e.keyCode) {
                    case LMMedium.key['enter']:
                        if (action.enterKey(e) === false) {
                            LMMedium.utils.preventDefaultEvent(e);
                        }
                        break;
                    case LMMedium.key['backspace']:
                    case LMMedium.key['delete']:
                        action.backspaceOrDeleteKey(e);
                        break;
                }
                return keepEvent;
            });
            return this;
        };
        Action.prototype.handleKeyUp = function () {
            var action = this, medium = this.medium, settings = medium.settings, cache = medium.cache, cursor = medium.cursor, el = medium.element;
            LMMedium.utils.addEvent(el, 'keyup', this.handledEvents.keyup = function (e) {
                e = e || LMMedium.w.event;
                if (!isEditable(e)) {
                    return false;
                }
                LMMedium.utils.isCommand(settings, e, function () {
                    cache.cmd = false;
                }, function () {
                    cache.cmd = true;
                });
                medium.clean(null);
                medium.placeholders();
                //here we have a key context, so if you need to create your own object within a specific context it is doable
                var keyContext;
                if (settings.keyContext !== null
                    && (keyContext = settings.keyContext[e.keyCode])) {
                    var el = cursor.parent();
                    if (el) {
                        keyContext.call(medium, e, el);
                    }
                }
                action.preserveElementFocus();
            });
            return this;
        };
        Action.prototype.handlePaste = function () {
            var medium = this.medium, el = medium.element, text, i, max, data, cD, type, types;
            LMMedium.utils.addEvent(el, 'paste', this.handledEvents.paste = function (e) {
                e = e || LMMedium.w.event;
                if (!isEditable(e)) {
                    return false;
                }
                i = 0;
                LMMedium.utils.preventDefaultEvent(e);
                text = '';
                cD = e.clipboardData;
                if (cD && (data = cD.getData)) {
                    types = cD.types;
                    max = types.length;
                    for (i = 0; i < max; i++) {
                        type = types[i];
                        switch (type) {
                            //case 'text/html':
                            //	return medium.paste(cD.getData('text/html'));
                            case 'text/plain':
                                return medium.paste(cD.getData('text/plain'));
                        }
                    }
                }
                medium.paste();
            });
            return this;
        };
        Action.prototype.handleClick = function () {
            var medium = this.medium, el = medium.element, cursor = medium.cursor;
            LMMedium.utils.addEvent(el, 'click', this.handledEvents.click = function (e) {
                if (!isEditable(e)) {
                    cursor.caretToAfter(e.target);
                }
            });
            return this;
        };
        Action.prototype.enterKey = function (e) {
            var medium = this.medium, el = medium.element, settings = medium.settings, cache = medium.cache, cursor = medium.cursor;
            if (settings.mode === LMMedium.Medium.inlineMode || settings.mode === LMMedium.Medium.inlineRichMode) {
                return false;
            }
            if (cache.shift) {
                if (settings.tags['break']) {
                    medium.addTag(settings.tags['break'], true);
                    return false;
                }
            }
            else {
                var focusedElement = LMMedium.utils.atCaret(medium) || {}, children = el.children, lastChild = focusedElement === el.lastChild ? el.lastChild : null, makeHR, secondToLast, paragraph;
                if (lastChild
                    && lastChild !== el.firstChild
                    && settings.autoHR
                    && settings.mode !== LMMedium.Medium.partialMode
                    && settings.tags.horizontalRule) {
                    LMMedium.utils.preventDefaultEvent(e);
                    makeHR =
                        LMMedium.utils.text(lastChild) === ""
                            && lastChild.nodeName.toLowerCase() === settings.tags.paragraph;
                    if (makeHR && children.length >= 2) {
                        secondToLast = children[children.length - 2];
                        if (secondToLast.nodeName.toLowerCase() === settings.tags.horizontalRule) {
                            makeHR = false;
                        }
                    }
                    if (makeHR) {
                        medium.addTag(settings.tags.horizontalRule, false, true, focusedElement);
                        focusedElement = focusedElement.nextSibling;
                    }
                    if ((paragraph = medium.addTag(settings.tags.paragraph, true, null, focusedElement)) !== null) {
                        paragraph.innerHTML = '';
                        cursor.set(0, paragraph);
                    }
                }
            }
            return true;
        };
        Action.prototype.backspaceOrDeleteKey = function (e) {
            var medium = this.medium, cursor = medium.cursor, settings = medium.settings, el = medium.element;
            if (settings.onBackspaceOrDelete !== undefined) {
                var result = settings.onBackspaceOrDelete.call(medium, e, el);
                if (result) {
                    return;
                }
            }
            if (el.lastChild === null)
                return;
            var lastChild = el.lastChild, beforeLastChild = lastChild.previousSibling, anchorNode = rangy.getSelection().anchorNode;
            if (lastChild
                && settings.tags.horizontalRule
                && lastChild.nodeName.toLocaleLowerCase() === settings.tags.horizontalRule) {
                el.removeChild(lastChild);
            }
            else if (lastChild
                && beforeLastChild
                && LMMedium.utils.text(lastChild).length < 1
                && beforeLastChild.nodeName.toLowerCase() === settings.tags.horizontalRule
                && lastChild.nodeName.toLowerCase() === settings.tags.paragraph) {
                el.removeChild(lastChild);
                el.removeChild(beforeLastChild);
            }
            else if (el.childNodes.length === 1
                && lastChild
                && !LMMedium.utils.text(lastChild).length) {
                LMMedium.utils.preventDefaultEvent(e);
                medium.setupContents();
            }
            else if (anchorNode && anchorNode === el) {
                medium.deleteSelection();
                medium.setupContents();
                cursor.set(0, el.firstChild);
            }
        };
        Action.prototype.preserveElementFocus = function () {
            // Fetch node that has focus
            var anchorNode = LMMedium.w.getSelection ? LMMedium.w.getSelection().anchorNode : document.activeElement;
            if (anchorNode) {
                var medium = this.medium, cache = medium.cache, el = medium.element, s = medium.settings, cur = anchorNode.parentNode, children = el.children, diff = cur !== cache.focusedElement, elementIndex = 0, i;
                // anchorNode is our target if element is empty
                if (cur === s.element) {
                    cur = anchorNode;
                }
                // Find our child index
                for (i = 0; i < children.length; i++) {
                    if (cur === children[i]) {
                        elementIndex = i;
                        break;
                    }
                }
                // Focused element is different
                if (diff) {
                    cache.focusedElement = cur;
                    cache.focusedElementIndex = elementIndex;
                }
            }
        };
        return Action;
    })();
    LMMedium.Action = Action;
})(LMMedium || (LMMedium = {}));
