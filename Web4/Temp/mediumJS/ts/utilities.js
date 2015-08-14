/// <reference path="base.ts" />
var LMMedium;
(function (LMMedium) {
    LMMedium.w = window;
    LMMedium.d = document;
    LMMedium.key = LMMedium.w['key'] = {
        'backspace': 8,
        'tab': 9,
        'enter': 13,
        'shift': 16,
        'ctrl': 17,
        'alt': 18,
        'pause': 19,
        'capsLock': 20,
        'escape': 27,
        'pageUp': 33,
        'pageDown': 34,
        'end': 35,
        'home': 36,
        'leftArrow': 37,
        'upArrow': 38,
        'rightArrow': 39,
        'downArrow': 40,
        'insert': 45,
        'delete': 46,
        '0': 48,
        '1': 49,
        '2': 50,
        '3': 51,
        '4': 52,
        '5': 53,
        '6': 54,
        '7': 55,
        '8': 56,
        '9': 57,
        'a': 65,
        'b': 66,
        'c': 67,
        'd': 68,
        'e': 69,
        'f': 70,
        'g': 71,
        'h': 72,
        'i': 73,
        'j': 74,
        'k': 75,
        'l': 76,
        'm': 77,
        'n': 78,
        'o': 79,
        'p': 80,
        'q': 81,
        'r': 82,
        's': 83,
        't': 84,
        'u': 85,
        'v': 86,
        'w': 87,
        'x': 88,
        'y': 89,
        'z': 90,
        'leftWindow': 91,
        'rightWindowKey': 92,
        'select': 93,
        'numpad0': 96,
        'numpad1': 97,
        'numpad2': 98,
        'numpad3': 99,
        'numpad4': 100,
        'numpad5': 101,
        'numpad6': 102,
        'numpad7': 103,
        'numpad8': 104,
        'numpad9': 105,
        'multiply': 106,
        'add': 107,
        'subtract': 109,
        'decimalPoint': 110,
        'divide': 111,
        'f1': 112,
        'f2': 113,
        'f3': 114,
        'f4': 115,
        'f5': 116,
        'f6': 117,
        'f7': 118,
        'f8': 119,
        'f9': 120,
        'f10': 121,
        'f11': 122,
        'f12': 123,
        'numLock': 144,
        'scrollLock': 145,
        'semiColon': 186,
        'equalSign': 187,
        'comma': 188,
        'dash': 189,
        'period': 190,
        'forwardSlash': 191,
        'graveAccent': 192,
        'openBracket': 219,
        'backSlash': 220,
        'closeBracket': 221,
        'singleQuote': 222
    };
    var utils;
    (function (utils) {
        function isCommand(s, e, fnTrue, fnFalse) {
            if ((s.modifier === 'ctrl' && e.ctrlKey) ||
                (s.modifier === 'cmd' && e.metaKey) ||
                (s.modifier === 'auto' && (e.ctrlKey || e.metaKey))) {
                return fnTrue.call();
            }
            else {
                return fnFalse.call();
            }
        }
        utils.isCommand = isCommand;
        function isShift(e, fnTrue, fnFalse) {
            if (e.shiftKey) {
                return fnTrue.call();
            }
            else {
                return fnFalse.call();
            }
        }
        utils.isShift = isShift;
        function isModifier(settings, e, fn) {
            var cmd = settings.modifiers[e.keyCode];
            if (cmd) {
                return fn.call(null, cmd);
            }
            return false;
        }
        utils.isModifier = isModifier;
        utils.special = {};
        utils.special[LMMedium.key['backspace']] = true;
        utils.special[LMMedium.key['shift']] = true;
        utils.special[LMMedium.key['ctrl']] = true;
        utils.special[LMMedium.key['alt']] = true;
        utils.special[LMMedium.key['delete']] = true;
        utils.special[LMMedium.key['cmd']] = true;
        function isSpecial(e) {
            return typeof utils.special[e.keyCode] !== 'undefined';
        }
        utils.isSpecial = isSpecial;
        utils.navigational = {};
        utils.navigational[LMMedium.key['upArrow']] = true;
        utils.navigational[LMMedium.key['downArrow']] = true;
        utils.navigational[LMMedium.key['leftArrow']] = true;
        utils.navigational[LMMedium.key['rightArrow']] = true;
        function isNavigational(e) {
            return typeof utils.navigational[e.keyCode] !== 'undefined';
        }
        utils.isNavigational = isNavigational;
        /**
         * @param element
         * @param eventNamesString
         * @param func
         * @returns Medium.Utilities
         */
        function addEvents(element, eventNamesString, func) {
            var i = 0, eventName, eventNames = eventNamesString.split(' '), max = eventNames.length;
            for (; i < max; i++) {
                eventName = eventNames[i];
                if (eventName.length > 0) {
                    addEvent(element, eventName, func);
                }
            }
            return LMMedium.utils;
        }
        utils.addEvents = addEvents;
        /*
         * Handle Events
         */
        function addEvent(element, eventName, func) {
            if (element.addEventListener) {
                element.addEventListener(eventName, func, false);
            }
            else if (element.attachEvent) {
                element.attachEvent("on" + eventName, func);
            }
            else {
                element['on' + eventName] = func;
            }
            return LMMedium.utils;
        }
        utils.addEvent = addEvent;
        function removeEvent(element, eventName, func) {
            if (element.removeEventListener) {
                element.removeEventListener(eventName, func, false);
            }
            else if (element.detachEvent) {
                element.detachEvent("on" + eventName, func);
            }
            else {
                element['on' + eventName] = null;
            }
            return LMMedium.utils;
        }
        utils.removeEvent = removeEvent;
        function preventDefaultEvent(e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            else {
                e.returnValue = false;
            }
            return LMMedium.utils;
        }
        utils.preventDefaultEvent = preventDefaultEvent;
        function stopPropagation(e) {
            e = e || window.event;
            e.cancelBubble = true;
            if (e.stopPropagation !== undefined) {
                e.stopPropagation();
            }
            return LMMedium.utils;
        }
        utils.stopPropagation = stopPropagation;
        function isEventSupported(element, eventName) {
            eventName = 'on' + eventName;
            var el = LMMedium.d.createElement(element.tagName), isSupported = (eventName in el);
            if (!isSupported) {
                el.setAttribute(eventName, 'return;');
                isSupported = typeof el[eventName] == 'function';
            }
            el = null;
            return isSupported;
        }
        utils.isEventSupported = isEventSupported;
        function triggerEvent(element, eventName) {
            var e;
            if (LMMedium.d.createEvent) {
                e = LMMedium.d.createEvent("HTMLEvents");
                e.initEvent(eventName, true, true);
                e.eventName = eventName;
                element.dispatchEvent(e);
            }
            else {
                e = LMMedium.d.createEventObject();
                element.fireEvent("on" + eventName, e);
            }
            return LMMedium.utils;
        }
        utils.triggerEvent = triggerEvent;
        function deepExtend(destination, source) {
            var property, propertyValue;
            for (property in source)
                if (source.hasOwnProperty(property)) {
                    propertyValue = source[property];
                    if (propertyValue !== undefined
                        && propertyValue !== null
                        && propertyValue.constructor !== undefined
                        && propertyValue.constructor === Object) {
                        destination[property] = destination[property] || {};
                        deepExtend(destination[property], propertyValue);
                    }
                    else {
                        destination[property] = propertyValue;
                    }
                }
            return destination;
        }
        utils.deepExtend = deepExtend;
        /*
         * This is a Paste Hook. When the user pastes
         * content, this ultimately converts it into
         * plain text before inserting the data.
         */
        function pasteHook(medium, fn) {
            medium.makeUndoable();
            var tempEditable = LMMedium.d.createElement('div'), el = medium.element, existingValue, existingLength, overallLength, s = medium.settings, value, body = LMMedium.d.body;
            var bodyParent = (body.parentNode);
            var scrollTop = bodyParent.scrollTop, scrollLeft = bodyParent.scrollLeft;
            tempEditable.className = s.cssClasses.pasteHook;
            tempEditable.setAttribute('contenteditable', "true");
            body.appendChild(tempEditable);
            utils.selectNode(tempEditable);
            bodyParent.scrollTop = scrollTop;
            bodyParent.scrollLeft = scrollLeft;
            setTimeout(function () {
                value = text(tempEditable);
                el.focus();
                if (s.maxLength > 0) {
                    existingValue = text(el);
                    existingLength = existingValue.length;
                    overallLength = existingLength + value.length;
                    if (overallLength > existingLength) {
                        value = value.substring(0, s.maxLength - existingLength);
                    }
                }
                utils.detachNode(tempEditable);
                bodyParent.scrollTop = scrollTop;
                bodyParent.scrollLeft = scrollLeft;
                fn(value);
            }, 0);
            return LMMedium.utils;
        }
        utils.pasteHook = pasteHook;
        function traverseAll(element, options, depth) {
            var children = element.childNodes, length = children.length, i = 0, node;
            depth = depth || 1;
            options = options || {};
            if (length > 0) {
                for (; i < length; i++) {
                    node = children[i];
                    switch (node.nodeType) {
                        case 1:
                            traverseAll(node, options, depth + 1);
                            if (options.element !== undefined)
                                options.element(node, i, depth, element);
                            break;
                        case 3:
                            if (options.fragment !== undefined)
                                options.fragment(node, i, depth, element);
                    }
                    //length may change
                    length = children.length;
                    //if length did change, and we are at the last item, this causes infinite recursion, so if we are at the last item, then stop to prevent this
                    if (node === element.lastChild) {
                        i = length;
                    }
                }
            }
            return LMMedium.utils;
        }
        utils.traverseAll = traverseAll;
        function trim(string) {
            return string.replace(/^[\s]+|\s+$/g, '');
        }
        utils.trim = trim;
        function arrayContains(array, variable) {
            var i = array.length;
            while (i--) {
                if (array[i] === variable) {
                    return true;
                }
            }
            return false;
        }
        utils.arrayContains = arrayContains;
        function addClass(el, className) {
            if (el.classList)
                el.classList.add(className);
            else
                el.className += ' ' + className;
            return LMMedium.utils;
        }
        utils.addClass = addClass;
        function removeClass(el, className) {
            if (el.classList)
                el.classList.remove(className);
            else
                el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            return LMMedium.utils;
        }
        utils.removeClass = removeClass;
        function hasClass(el, className) {
            if (el.classList)
                return el.classList.contains(className);
            else
                return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
        }
        utils.hasClass = hasClass;
        function isHidden(el) {
            return el.offsetWidth === 0 || el.offsetHeight === 0;
        }
        utils.isHidden = isHidden;
        function isVisible(el) {
            return el.offsetWidth !== 0 || el.offsetHeight !== 0;
        }
        utils.isVisible = isVisible;
        function encodeHtml(html) {
            var pn = LMMedium.d.createElement('a').appendChild(LMMedium.d.createTextNode(html)).parentNode;
            return pn.innerHTML;
        }
        utils.encodeHtml = encodeHtml;
        function text(node, val) {
            if (val !== undefined) {
                if (node === null) {
                    return this;
                }
                if (node.textContent !== undefined) {
                    node.textContent = val;
                }
                else {
                    node.innerText = val;
                }
                return this;
            }
            else if (node === null) {
                return this;
            }
            else if (node.innerText !== undefined) {
                return utils.trim(node.innerText);
            }
            else if (node.textContent !== undefined) {
                return utils.trim(node.textContent);
            }
            else if (node.data !== undefined) {
                return utils.trim(node.data);
            }
            //for good measure
            return '';
        }
        utils.text = text;
        function changeTag(oldNode, newTag) {
            var newNode = LMMedium.d.createElement(newTag), node, nextNode;
            node = oldNode.firstChild;
            while (node) {
                nextNode = node.nextSibling;
                newNode.appendChild(node);
                node = nextNode;
            }
            oldNode.parentNode.insertBefore(newNode, oldNode);
            oldNode.parentNode.removeChild(oldNode);
            return newNode;
        }
        utils.changeTag = changeTag;
        function detachNode(el) {
            if (el.parentNode !== null) {
                el.parentNode.removeChild(el);
            }
            return this;
        }
        utils.detachNode = detachNode;
        function selectNode(el) {
            var range, selection;
            el.focus();
            if (LMMedium.d.body.createTextRange) {
                range = LMMedium.d.body.createTextRange();
                range.moveToElementText(el);
                range.select();
            }
            else if (LMMedium.w.getSelection) {
                selection = LMMedium.w.getSelection();
                range = LMMedium.d.createRange();
                range.selectNodeContents(el);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            return this;
        }
        utils.selectNode = selectNode;
        function baseAtCaret(medium) {
            if (!medium.isActive())
                return null;
            var sel = LMMedium.w.getSelection ? LMMedium.w.getSelection() : document.selection;
            if (sel.rangeCount) {
                var selRange = sel.getRangeAt(0), container = selRange.endContainer;
                switch (container.nodeType) {
                    case 3:
                        if (container.data && container.data.length != selRange.endOffset)
                            return false;
                        break;
                }
                return container;
            }
            return null;
        }
        utils.baseAtCaret = baseAtCaret;
        function atCaret(medium) {
            var container = this.baseAtCaret(medium) || {}, el = medium.element;
            if (container === false)
                return null;
            while (container && container.parentNode !== el) {
                container = container.parentNode;
            }
            if (container && container.nodeType == 1) {
                return container;
            }
            return null;
        }
        utils.atCaret = atCaret;
        function hide(el) {
            el.style.display = 'none';
        }
        utils.hide = hide;
        function show(el) {
            el.style.display = '';
        }
        utils.show = show;
        function hideAnim(el) {
            el.style.opacity = 1;
        }
        utils.hideAnim = hideAnim;
        function showAnim(el) {
            el.style.opacity = 0.01;
            el.style.display = '';
        }
        utils.showAnim = showAnim;
    })(utils = LMMedium.utils || (LMMedium.utils = {}));
})(LMMedium || (LMMedium = {}));
