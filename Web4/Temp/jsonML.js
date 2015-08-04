var jsonML;
(function (jsonML) {
    //['',...]
    function toObject(jml) {
        if (!_.isArray(jml) || jml.length < 1 || _.isString(jml[0]))
            throw 'invalid JsonML';
        var tagName = jml[0];
        if (jml.length == 1)
            return { tagName: tagName, items: null };
        var startIdx = 1;
        var elem = null;
        if (_.isObject(jml[1])) {
            startIdx = 2;
            elem = jml[1];
            elem.tagName = tagName;
        } else
            elem = { tagName: tagName, items: null };
        for (var i = startIdx; i < jml.length; i++) {
            if (!elem.items)
                elem.items = [];
            elem.items.push(_.isString(jml[i]) ? jml[i] : toObject(jml[i]));
        }
        return elem;
    }
    jsonML.toObject = toObject;
    ;
})(jsonML || (jsonML = {}));

var JsonML;
(function (JsonML) {
    /**
    * Determines if the value is an Array
    *
    * @private
    * @param {*} val the object being tested
    * @return {boolean}
    */
    var isArray = Array.isArray || function (val) {
        return (val instanceof Array);
    };

    /**
    * Creates a DOM element
    *
    * @private
    * @param {string} tag The element's tag name
    * @return {Node}
    */
    function createElement(tag) {
        if (!tag) {
            // create a document fragment to hold multiple-root elements
            if (document.createDocumentFragment) {
                return document.createDocumentFragment();
            }

            tag = '';
        } else if (tag.charAt(0) === '!') {
            return document.createComment(tag === '!' ? '' : tag.substr(1) + ' ');
        }

        return document.createElement(tag);
    }

    /**
    * Appends an attribute to an element
    *
    * @private
    * @param {Node} elem The element
    * @param {Object} attr Attributes object
    * @return {Node}
    */
    function addAttributes(elem, attr) {
        for (var name in attr) {
            if (attr.hasOwnProperty(name)) {
                // attributes
                elem.setAttribute(name, attr[name]);
            }
        }
        return elem;
    }
    ;

    /**
    * Appends a child to an element
    *
    * @private
    * @param {Node} elem The parent element
    * @param {Node} child The child
    */
    function appendDOM(elem, child) {
        if (child) {
            if (elem.nodeType === 8) {
                if (child.nodeType === 3) {
                    elem.nodeValue += child.nodeValue;
                }
            } else if (elem.canHaveChildren !== false) {
                elem.appendChild(child);
            }
        }
    }
    ;

    /**
    * Default error handler
    * @param {Error} ex
    * @return {Node}
    */
    JsonML.onerror = function (ex, jml, filter) {
        if (typeof filter === "undefined") { filter = null; }
        return document.createTextNode('[' + ex + ']');
    };

    /**
    * @param {Node} elem
    * @param {*} jml
    * @param {function} filter
    * @return {Node}
    */
    function patch(elem, jml, filter) {
        if (typeof filter === "undefined") { filter = null; }
        for (var i = 1; i < jml.length; i++) {
            if (isArray(jml[i]) || 'string' === typeof jml[i]) {
                // append children
                appendDOM(elem, toXML(jml[i], filter));
            } else if ('object' === typeof jml[i] && jml[i] !== null && elem.nodeType === 1) {
                // add attributes
                elem = addAttributes(elem, jml[i]);
            }
        }

        return elem;
    }
    ;

    /**
    * Main builder entry point
    * @param {string|array} jml
    * @param {function} filter
    * @return {Node}
    */
    function toXML(jml, filter) {
        if (typeof filter === "undefined") { filter = null; }
        try  {
            if (!jml) {
                return null;
            }
            if ('string' === typeof jml) {
                return document.createTextNode(jml);
            }
            if (!isArray(jml) || ('string' !== typeof jml[0])) {
                throw new SyntaxError('invalid JsonML');
            }

            var tagName = jml[0];
            if (!tagName) {
                // correctly handle a list of JsonML trees
                // create a document fragment to hold elements
                var frag = createElement('');
                for (var i = 1; i < jml.length; i++) {
                    appendDOM(frag, toXML(jml[i], filter));
                }

                // eliminate wrapper for single nodes
                if (frag.childNodes.length === 1) {
                    return frag.firstChild;
                }
                return frag;
            }

            var elem = patch(createElement(tagName), jml, filter);

            return (elem && 'function' === typeof filter) ? filter(elem) : elem;
        } catch (ex) {
            try  {
                // handle error with complete context
                return JsonML.onerror(ex, jml, filter);
            } catch (ex2) {
                return document.createTextNode('[' + ex2 + ']');
            }
        }
    }
    JsonML.toXML = toXML;
    ;

    /**
    * Converts JsonML to XML text
    * @param {string|array} jml
    * @param {function} filter
    * @return {array} JsonML
    */
    function toXMLText(jml, filter) {
        if (typeof filter === "undefined") { filter = null; }
        return renderXML(toXML(jml, filter));
    }
    JsonML.toXMLText = toXMLText;
    ;

    /* Reverse conversion -------------------------*/
    function addChildren(/*DOM*/ elem, /*function*/ filter, /*JsonML*/ jml) {
        if (elem.hasChildNodes()) {
            for (var i = 0, len = elem.childNodes.length; i < len; i++) {
                var child = elem.childNodes[i];
                child = fromXML(child, filter);
                if (child) {
                    jml.push(child);
                }
            }
            return true;
        }
        return false;
    }
    ;

    /**
    * @param {Node} elem
    * @param {function} filter
    * @return {string|array} JsonML
    */
    function fromXML(elem, filter) {
        if (!elem || !elem.nodeType) {
            // free references
            return (elem = null);
        }

        var i, jml;
        switch (elem.nodeType) {
            case 1:
            case 9:
            case 11:
                jml = [elem.tagName ? elem.tagName.toLowerCase() : ''];

                var attr = elem.attributes, props = {}, hasAttrib = false;

                for (i = 0; attr && i < attr.length; i++) {
                    if (attr[i].specified) {
                        if ('string' === typeof attr[i].value) {
                            props[attr[i].name] = attr[i].value;
                        }
                        hasAttrib = true;
                    }
                }
                if (hasAttrib) {
                    jml.push(props);
                }

                addChildren(elem, filter, jml);

                // filter result
                if ('function' === typeof filter) {
                    jml = filter(jml, elem);
                }

                // free references
                elem = null;
                return jml;
            case 3:
            case 4:
                var str = String(elem.nodeValue);

                // free references
                elem = null;
                return str;
            case 10:
                jml = ['!'];

                var type = ['DOCTYPE', (elem.name || 'html').toLowerCase()];

                if (elem.publicId) {
                    type.push('PUBLIC', '"' + elem.publicId + '"');
                }

                if (elem.systemId) {
                    type.push('"' + elem.systemId + '"');
                }

                jml.push(type.join(' '));

                // filter result
                if ('function' === typeof filter) {
                    jml = filter(jml, elem);
                }

                // free references
                elem = null;
                return jml;
            case 8:
                if ((elem.nodeValue || '').indexOf('DOCTYPE') !== 0) {
                    // free references
                    elem = null;
                    return null;
                }

                jml = [
                    '!',
                    elem.nodeValue];

                // filter result
                if ('function' === typeof filter) {
                    jml = filter(jml, elem);
                }

                // free references
                elem = null;
                return jml;
            default:
                if (window.console) {
                    window.console.log('nodeType ' + elem.nodeType + ' skipped.');
                }

                // free references
                return (elem = null);
        }
    }
    JsonML.fromXML = fromXML;
    ;

    /**
    * Converts XML text to XML DOM nodes
    * https://developer.mozilla.org/en-US/docs/Parsing_and_serializing_XML
    * https://gist.github.com/553364
    * @param {string} xmlText
    * @return {Node} xml node
    */
    function parseXML(xmlText) {
        if (!xmlText || typeof xmlText !== 'string') {
            return null;
        }

        if (DOMParser) {
            // standard XML DOM
            return new DOMParser().parseFromString(xmlText, 'application/xml');
        } else if (ActiveXObject) {
            // legacy IE XML DOM
            var xml = new ActiveXObject('Microsoft.XMLDOM');
            xml.async = 'false';
            xml.loadXML(xmlText);
            return xml;
        } else
            return null;
    }
    ;

    /**
    * Converts XML text nodes to JsonML
    * @param {string} xmlText
    * @param {function} filter
    * @return {string|array} JsonML
    */
    function fromXMLText(xmlText, filter) {
        var elem = parseXML(xmlText);
        elem = elem && (elem.ownerDocument || elem).documentElement;

        return fromXML(elem, filter);
    }
    JsonML.fromXMLText = fromXMLText;
    ;

    /**
    * Converts XML DOM nodes to XML text
    * https://developer.mozilla.org/en-US/docs/Parsing_and_serializing_XML
    * @param {string} xmlText
    * @return {string|array} JsonML
    */
    function renderXML(elem) {
        if (!elem) {
            return null;
        }

        if (XMLSerializer) {
            // standard XML DOM
            return new XMLSerializer().serializeToString(elem);
        }

        // legacy IE XML
        if (elem.xml) {
            return elem.xml;
        }

        // HTML DOM
        if (elem.outerHTML) {
            return elem.outerHTML;
        }

        var parent = (createElement('div'));
        parent.appendChild(elem);

        var html = parent.innerHTML;
        parent.removeChild(elem);

        return html;
    }
    JsonML.renderXML = renderXML;
    ;

    //JsonML.isXML = function (elem) {
    //  var root = elem && (elem.ownerDocument || elem).documentElement;
    //  return !!root && (root.nodeName !== "HTML");
    //};
    // enable usage of XML DOM, fallback to HTML DOM
    var document = parseXML('<xml/>') || document;
})(JsonML || (JsonML = {}));
