/// <reference path="utilities.ts" />
/// <reference path="cache.ts" />
/// <reference path="cursor.ts" />
/// <reference path="selection.ts" />
/// <reference path="undoable.ts" />
/// <reference path="action.ts" />
/// <reference path="element.ts" />
/// <reference path="drag.ts" />
/// <reference path="html.ts" />
interface HTMLElement {
  createTextRange(): any;
}

rangy.rangePrototype.insertNodeAtEnd = function (node) {
  var range = this.cloneRange();
  range.collapse(false);
  range.insertNode(node);
  range.detach();
  this.setEndAfter(node);
};

module LMMedium {
  export class Medium {
    constructor(public userSettings: any) {
      var medium = this;

      var defaultSettings = utils.deepExtend({}, Medium.defaultSettings);
      var settings = this.settings = utils.deepExtend(defaultSettings, userSettings);
      this.cache = new Cache();
      this.selection = new Selection();
      this.action = new Action(this);
      this.cursor = new Cursor(this);
      this.undoable = new Undoable(this);
      var el;
      var newVal;
      var i;

      for (i in defaultSettings) if (defaultSettings.hasOwnProperty(i)) {
        // Override defaults with data-attributes
        if (
          typeof defaultSettings[i] !== 'object'
          && defaultSettings.hasOwnProperty(i)
          && settings.element.getAttribute('data-medium-' + key)
          ) {
          newVal = settings.element.getAttribute('data-medium-' + key);

          if (newVal.toLowerCase() === "false" || newVal.toLowerCase() === "true") {
            newVal = newVal.toLowerCase() === "true";
          }
          settings[i] = newVal;
        }
      }

      if (settings.modifiers) {
        for (i in settings.modifiers) if (settings.modifiers.hasOwnProperty(i)) {
          if (typeof (key[i]) !== 'undefined') {
            settings.modifiers[key[i]] = settings.modifiers[i];
          }
        }
      }

      if (settings.keyContext) {
        for (i in settings.keyContext) if (settings.keyContext.hasOwnProperty(i)) {
          if (typeof (key[i]) !== 'undefined') {
            settings.keyContext[key[i]] = settings.keyContext[i];
          }
        }
      }

      // Extend Settings
      el = settings.element;

      // Editable
      el.contentEditable = true;
      el.className += (' ' + settings.cssClasses.editor) + (' ' + settings.cssClasses.editor + '-' + settings.mode);

      settings.tags = (settings.tags || {});
      if (settings.tags.outerLevel) {
        settings.tags.outerLevel = settings.tags.outerLevel.concat([settings.tags.paragraph, settings.tags.horizontalRule]);
      }

      this.settings = settings;
      this.element = el;
      el.medium = this;

      this.utils = utils;

      // Initialize editor
      medium.clean(null);
      medium.placeholders();
      this.action.preserveElementFocus();

      this.dirty = false;
      this.makeUndoable = this.undoable.makeUndoable;

      if (settings.drag) {
        medium.drag = new LMMedium.Drag(medium);
        medium.drag.setup();
      }

      this.action.setup();

      // Set as initialized
      this.cache.initialized = true;

      this.makeUndoable(true);

    }
    cache: Cache;
    selection: Selection;
    action: Action;
    cursor: Cursor;
    undoable: Undoable;
    drag: LMMedium.Drag;
    utils;
    settings
    element;
    dirty;
    makeUndoable;
    placeholder;
    html;

    //STATICS
    static activeElement: any;
    static inlineMode = 'inline';
    static partialMode = 'partial';
    static richMode = 'rich';
    static inlineRichMode = 'inlineRich';
    static Messages = {
      pastHere: 'Paste Here'
    };

    static defaultSettings = {
      element: null,
      modifier: 'auto',
      placeholder: "",
      autofocus: false,
      autoHR: true,
      mode: Medium.richMode,
      maxLength: -1,
      modifiers: {
        'b': 'bold',
        'i': 'italicize',
        'u': 'underline'
      },
      tags: {
        'break': 'br',
        'horizontalRule': 'hr',
        'paragraph': 'p',
        'outerLevel': ['pre', 'blockquote', 'figure'],
        'innerLevel': ['a', 'b', 'u', 'i', 'img', 'strong']
      },
      cssClasses: {
        editor: 'Medium',
        pasteHook: 'Medium-paste-hook',
        placeholder: 'Medium-placeholder',
        clear: 'Medium-clear'
      },
      attributes: {
        remove: ['style', 'class']
      },
      pasteAsText: true,
      beforeInvokeElement: function () {
        //this = Medium.Element
      },
      beforeInsertHtml: function () {
        //this = Medium.Html
      },
      maxLengthReached: function (element) {
        //element
      },
      beforeAddTag: function (tag, shouldFocus, isEditable, afterElement) {
      },
      keyContext: null,
      drag: false
    };

    placeholders() {
      //in IE8, just gracefully degrade to no placeholders
      if (!w.getComputedStyle) return;

      var s = this.settings,
        placeholder = this.placeholder || (this.placeholder = d.createElement('div')),
        el = this.element,
        style = placeholder.style,
        elStyle = w.getComputedStyle(el, null),
        qStyle = function (prop) {
          return elStyle.getPropertyValue(prop)
        },
        text = utils.text(el),
        cursor = this.cursor,
        childCount = el.children.length,
        hasFocus = Medium.activeElement === el;

      el.placeholder = placeholder;

      // Empty Editor
      if (
        !hasFocus
        && text.length < 1
        && childCount < 2
        ) {
        if (el.placeHolderActive) return;

        if (!el.innerHTML.match('<' + s.tags.paragraph)) {
          el.innerHTML = '';
        }

        // We need to add placeholders
        if (s.placeholder.length > 0) {
          if (!placeholder.setup) {
            placeholder.setup = true;

            //background & background color
            style.background = qStyle('background');
            style.backgroundColor = qStyle('background-color');

            //text size & text color
            style.fontSize = qStyle('font-size');
            style.color = elStyle.color;

            //begin box-model
            //margin
            style.marginTop = qStyle('margin-top');
            style.marginBottom = qStyle('margin-bottom');
            style.marginLeft = qStyle('margin-left');
            style.marginRight = qStyle('margin-right');

            //padding
            style.paddingTop = qStyle('padding-top');
            style.paddingBottom = qStyle('padding-bottom');
            style.paddingLeft = qStyle('padding-left');
            style.paddingRight = qStyle('padding-right');

            //border
            style.borderTopWidth = qStyle('border-top-width');
            style.borderTopColor = qStyle('border-top-color');
            style.borderTopStyle = qStyle('border-top-style');
            style.borderBottomWidth = qStyle('border-bottom-width');
            style.borderBottomColor = qStyle('border-bottom-color');
            style.borderBottomStyle = qStyle('border-bottom-style');
            style.borderLeftWidth = qStyle('border-left-width');
            style.borderLeftColor = qStyle('border-left-color');
            style.borderLeftStyle = qStyle('border-left-style');
            style.borderRightWidth = qStyle('border-right-width');
            style.borderRightColor = qStyle('border-right-color');
            style.borderRightStyle = qStyle('border-right-style');
            //end box model

            //element setup
            placeholder.className = s.cssClasses.placeholder + ' ' + s.cssClasses.placeholder + '-' + s.mode;
            placeholder.innerHTML = '<div>' + s.placeholder + '</div>';
            el.parentNode.insertBefore(placeholder, el);
          }

          el.className += ' ' + s.cssClasses.clear;

          style.display = '';
          // Add base P tag and do auto focus, give it a min height if el has one
          style.minHeight = el.clientHeight + 'px';
          style.minWidth = el.clientWidth + 'px';

          if (s.mode !== Medium.inlineMode && s.mode !== Medium.inlineRichMode) {
            this.setupContents();

            if (childCount === 0 && el.firstChild) {
              this.cursor.set(0, el.firstChild);
            }
          }
        }
        el.placeHolderActive = true;
      } else if (el.placeHolderActive) {
        el.placeHolderActive = false;
        style.display = 'none';
        el.className = utils.trim(el.className.replace(s.cssClasses.clear, ''));
        this.setupContents();
      }
    }

    /**
      Cleans element
      @param {HtmlElement} [el] default is settings.element
     */
    clean(el) {

      /*
       Deletes invalid nodes
       Removes Attributes*/

      var s = this.settings,
        placeholderClass = s.cssClasses.placeholder,
        attributesToRemove = (s.attributes || {}).remove || [],
        tags = s.tags || {},
        onlyOuter = tags.outerLevel || null,
        onlyInner = tags.innerLevel || null,
        outerSwitch = {},
        innerSwitch = {},
        paragraphTag = (tags.paragraph || '').toUpperCase(),
        html = this.html,
        attr,
        text,
        j;

      el = el || s.element;

      if (s.mode === Medium.inlineRichMode) {
        onlyOuter = s.tags.innerLevel;
      }

      if (onlyOuter !== null) {
        for (j = 0; j < onlyOuter.length; j++) {
          outerSwitch[onlyOuter[j].toUpperCase()] = true;
        }
      }

      if (onlyInner !== null) {
        for (j = 0; j < onlyInner.length; j++) {
          innerSwitch[onlyInner[j].toUpperCase()] = true;
        }
      }

      LMMedium.utils.traverseAll(el, {
        element: function (child, i, depth, parent) {
          var nodeName = child.nodeName,
            shouldDelete = true,
            attrValue;

          // Remove attributes
          for (j = 0; j < attributesToRemove.length; j++) {
            attr = attributesToRemove[j];
            if (child.hasAttribute(attr)) {
              attrValue = child.getAttribute(attr);
              if (attrValue !== placeholderClass && (!attrValue.match('medium-') && attr === 'class')) {
                child.removeAttribute(attr);
              }
            }
          }

          if (onlyOuter === null && onlyInner === null) {
            return;
          }

          if (depth === 1 && outerSwitch[nodeName] !== undefined) {
            shouldDelete = false;
          } else if (depth > 1 && innerSwitch[nodeName] !== undefined) {
            shouldDelete = false;
          }

          // Convert tags or delete
          if (shouldDelete) {
            if (w.getComputedStyle(child, null).getPropertyValue('display') === 'block') {
              if (paragraphTag.length > 0 && paragraphTag !== nodeName) {
                utils.changeTag(child, paragraphTag);
              }

              if (depth > 1) {
                while (parent.childNodes.length > i) {
                  parent.parentNode.insertBefore(parent.lastChild, parent.nextSibling);
                }
              }
            } else {
              switch (nodeName) {
                case 'BR':
                  if (child === child.parentNode.lastChild) {
                    if (child === child.parentNode.firstChild) {
                      break;
                    }
                    text = d.createTextNode("");
                    text.innerHTML = '&nbsp';
                    child.parentNode.insertBefore(text, child);
                    break;
                  }
                default:
                  while (child.firstChild !== null) {
                    child.parentNode.insertBefore(child.firstChild, child);
                  }
                  utils.detachNode(child);
                  break;
              }
            }
          }
        }
      });
    }
    /**
     
      @param {String|Object} html
      @param {Function} [callback]
      @param {Boolean} [skipChangeEvent]
      @returns {Medium}
     */
    insertHtml(html, callback, skipChangeEvent) {
      var result = (new LMMedium.Html(this, html))
        .insert(this.settings.beforeInsertHtml),
        lastElement = result[result.length - 1];

      if (skipChangeEvent === true) {
        utils.triggerEvent(this.element, "change");
      }

      if (callback) {
        callback.apply(result);
      }

      switch (lastElement.nodeName) {
        //lists need their last child selected if it exists
        case 'UL':
        case 'OL':
        case 'DL':
          if (lastElement.lastChild !== null) {
            this.cursor.moveCursorToEnd(lastElement.lastChild);
            break;
          }
        default:
          this.cursor.moveCursorToEnd(lastElement);
      }

      return this;
    }

    addTag(tag, shouldFocus, isEditable?, afterElement?) {
      if (!this.settings.beforeAddTag(tag, shouldFocus, isEditable, afterElement)) {
        var newEl: HTMLElement = d.createElement(tag);
        var toFocus;

        if (typeof isEditable !== "undefined" && isEditable === false) {
          newEl.contentEditable = "false";
        }
        if (newEl.innerHTML.length == 0) {
          newEl.innerHTML = ' ';
        }
        if (afterElement && afterElement.nextSibling) {
          afterElement.parentNode.insertBefore(newEl, afterElement.nextSibling);
          toFocus = afterElement.nextSibling;

        } else {
          this.element.appendChild(newEl);
          toFocus = this.lastChild();
        }

        if (shouldFocus) {
          this.cache.focusedElement = toFocus;
          this.cursor.set(0, toFocus);
        }
        return newEl;
      }
      return null;
    }

    /**
     
      @param {String} tagName
      @param {Object} [attributes]
      @param {Boolean} [skipChangeEvent]
      @returns {Medium}
     */
    invokeElement(tagName, attributes, skipChangeEvent) {
      var settings = this.settings,
        remove = attributes.remove || [];

      attributes = attributes || {};

      switch (settings.mode) {
        case Medium.inlineMode:
        case Medium.partialMode:
          return this;
        default:
      }

      //invoke works off class, so if it isn't there, we just add it
      if (remove.length > 0) {
        if (!utils.arrayContains(settings, 'class')) {
          remove.push('class');
        }
      }

      (new LMMedium.Element(this, tagName, attributes))
        .invoke(this.settings.beforeInvokeElement);

      if (skipChangeEvent === true) {
        utils.triggerEvent(this.element, "change");
      }

      return this;
    }

    /**
     
      @param {String} [value]
      @returns {Medium}
     */
    value(value?) {
      if (typeof value !== 'undefined') {
        this.element.innerHTML = value;

        this.clean(null);
        this.placeholders();

        this.makeUndoable();
      } else {
        return this.element.innerHTML;
      }

      return this;
    }

    /**
      Focus on element
      @returns {Medium}
     */
    focus() {
      var el = this.element;
      el.focus();
      return this;
    }

    /**
      Select all text
      @returns {Medium}
     */
    select() {
      utils.selectNode(Medium.activeElement = this.element);
      return this;
    }

    isActive() {
      return (Medium.activeElement === this.element);
    }

    setupContents() {
      var el = this.element,
        children = el.children,
        childNodes = el.childNodes,
        initialParagraph,
        s = this.settings;

      if (
        !s.tags.paragraph
        || children.length > 0
        || s.mode === Medium.inlineMode
        || s.mode === Medium.inlineRichMode
        ) {
        return null;
      }

      //has content, but no children
      if (childNodes.length > 0) {
        initialParagraph = d.createElement(s.tags.paragraph);
        if (el.innerHTML.match('^[&]nbsp[;]')) {
          el.innerHTML = el.innerHTML.substring(6, el.innerHTML.length - 1);
        }
        initialParagraph.innerHTML = el.innerHTML;
        el.innerHTML = '';
        el.appendChild(initialParagraph);
        //this.cursor.set(this, initialParagraph.innerHTML.length, initialParagraph);
      } else {
        initialParagraph = d.createElement(s.tags.paragraph);
        initialParagraph.innerHTML = '&nbsp;';
        el.appendChild(initialParagraph);
        this.cursor.set(0, el.firstChild);
      }

      return this;
    }

    destroy() {
      var el = this.element,
        settings = this.settings,
        placeholder = this.placeholder || null;

      if (placeholder !== null && placeholder.setup && placeholder.parentNode !== null) {
        //remove placeholder
        placeholder.parentNode.removeChild(placeholder);
        delete el.placeHolderActive;
      }

      //remove contenteditable
      el.removeAttribute('contenteditable');

      //remove classes
      el.className = utils.trim(el.className
        .replace(settings.cssClasses.editor, '')
        .replace(settings.cssClasses.clear, '')
        .replace(settings.cssClasses.editor + '-' + settings.mode, ''));

      //remove events
      this.action.destroy();

      if (this.settings.drag) {
        this.drag.destroy();
      }
    }

    // Clears the element and restores the placeholder
    clear() {
      this.element.innerHTML = '';
      this.placeholders();
    }

    /**
      Splits content in medium element at cursor
      @returns {DocumentFragment|null}
     */
    splitAtCaret() {
      if (!this.isActive()) return null;

      var selector = <any>(w.getSelection || d.selection);
      var sel = selector();
      var offset = sel.focusOffset,
        node = sel.focusNode,
        el = this.element,
        range = d.createRange(),
        endRange = d.createRange(),
        contents;

      range.setStart(node, offset);
      endRange.selectNodeContents(el);
      range.setEnd(endRange.endContainer, endRange.endOffset);

      contents = range.extractContents();

      return contents;
    }

    /**
      Deletes selection
     */
    deleteSelection() {
      if (!this.isActive()) return;

      var sel = rangy.getSelection(),
        range;

      if (sel.rangeCount > 0) {
        range = sel.getRangeAt(0);
        range.deleteContents();
      }
    }

    lastChild() {
      return this.element.lastChild;
    }

    bold() {

      switch (this.settings.mode) {
        case Medium.partialMode:
        case Medium.inlineMode:
          return this;
      }

      (new LMMedium.Element(this, 'bold', null))
        .setClean(false)
        .invoke(this.settings.beforeInvokeElement);

      return this;
    }
    underline() {
      switch (this.settings.mode) {
        case Medium.partialMode:
        case Medium.inlineMode:
          return this;
      }

      (new LMMedium.Element(this, 'underline', null))
        .setClean(false)
        .invoke(this.settings.beforeInvokeElement);

      return this;
    }
    italicize() {
      switch (this.settings.mode) {
        case Medium.partialMode:
        case Medium.inlineMode:
          return this;
      }

      (new LMMedium.Element(this, 'italic', null))
        .setClean(false)
        .invoke(this.settings.beforeInvokeElement);

      return this;
    }
    quote() {

      return this;
    }
    /**
     
      @param {String} [text]
      @returns {boolean}
     */
    paste(text?) {
      var value = this.value(),
        length = value.length,
        totalLength,
        settings = this.settings,
        selection = this.selection,
        el = this.element,
        medium = this,
        postPaste = function (text) {
          text = text || '';
          if (text.length > 0) {
            el.focus();
            Medium.activeElement = el;
            selection.restoreSelection(sel);

            //encode the text first
            text = utils.encodeHtml(text);

            //cut down it's length
            totalLength = text.length + length;
            if (settings.maxLength > 0 && totalLength > settings.maxLength) {
              text = text.substring(0, settings.maxLength - length);
            }

            if (settings.mode !== Medium.inlineMode) {
              text = text.replace(/\n/g, '<br>');
            }

            (new LMMedium.Html(medium, text))
              .setClean(false)
              .insert(settings.beforeInsertHtml, true);

            medium.clean(null);
            medium.placeholders();
          }
        };

      medium.makeUndoable();

      if (text !== undefined) {
        postPaste(text);
      } else if (settings.pasteAsText) {
        var sel = selection.saveSelection();

        utils.pasteHook(this, postPaste);
      } else {
        setTimeout(function () {
          medium.clean(null);
          medium.placeholders();
        }, 20);
      }
      return true;
    }
    undo() {
      var undoable = this.undoable,
        stack = undoable.stack,
        can = stack.canUndo();

      if (can) {
        stack.undo();
      }

      return this;
    }
    redo() {
      var undoable = this.undoable,
        stack = undoable.stack,
        can = stack.canRedo();

      if (can) {
        stack.redo();
      }

      return this;
    }

  }
}