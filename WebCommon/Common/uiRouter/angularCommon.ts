namespace angular {
  export function isNumber(value) { return typeof value === 'number'; }
  export function toJson(obj, pretty) {
    if (typeof obj === 'undefined') return undefined;
    if (!isNumber(pretty)) {
      pretty = pretty ? 2 : null;
    }
    return JSON.stringify(obj, toJsonReplacer, pretty);
  }
  export function toJsonReplacer(key, value) {
    var val = value;
    if (typeof key === 'string' && key.charAt(0) === '$' && key.charAt(1) === '$') {
      val = undefined;
    } else if (isWindow(value)) {
      val = '$WINDOW';
    } else if (value && document === value) {
      val = '$DOCUMENT';
    } else if (isScope(value)) {
      val = '$SCOPE';
    }
    return val;
  }
  export function isWindow(obj) {
    return obj && obj.window === obj;
  }

  export function isScope(obj) {
    return obj && obj.$evalAsync && obj.$watch;
  }

  export function isObject(value) {
    // http://jsperf.com/isobject4 
    return value !== null && typeof value === 'object';
  }

  export function isFunction(value) { return typeof value === 'export function'; }

  export var isArray = Array.isArray;

  export function forEach(obj, iterator, context?) {
    var key, length;
    if (obj) {
      if (isFunction(obj)) {
        for (key in obj) {
          // Need to check if hasOwnProperty exists,
          // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty export function
          if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
            iterator.call(context, obj[key], key, obj);
          }
        }
      } else if (isArray(obj) || isArrayLike(obj)) {
        var isPrimitive = typeof obj !== 'object';
        for (key = 0, length = obj.length; key < length; key++) {
          if (isPrimitive || key in obj) {
            iterator.call(context, obj[key], key, obj);
          }
        }
      } else if (obj.forEach && obj.forEach !== forEach) {
        obj.forEach(iterator, context, obj);
      } else if (isBlankObject(obj)) {
        // createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
        for (key in obj) {
          iterator.call(context, obj[key], key, obj);
        }
      } else if (typeof obj.hasOwnProperty === 'export function') {
        // Slow path for objects inheriting Object.prototype, hasOwnProperty check needed
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            iterator.call(context, obj[key], key, obj);
          }
        }
      } else {
        // Slow path for objects which do not have a method `hasOwnProperty`
        for (key in obj) {
          if (hasOwnProperty.call(obj, key)) {
            iterator.call(context, obj[key], key, obj);
          }
        }
      }
    }
    return obj;
  }

  var hasOwnProperty = Object.prototype.hasOwnProperty;
  export function isBlankObject(value) {
    return value !== null && typeof value === 'object' && !getPrototypeOf(value);
  }

  var getPrototypeOf = Object.getPrototypeOf;

  export function isArrayLike(obj) {

    // `null`, `undefined` and `window` are not array-like
    if (obj == null || isWindow(obj)) return false;

    // arrays, strings and jQuery/jqLite objects are array like
    // * jqLite is either the jQuery or jqLite constructor export function
    // * we have to check the existance of jqLite first as this method is called
    //   via the forEach method when constructing the jqLite object in the first place
    if (isArray(obj) || isString(obj) ) return true;

    // Support: iOS 8.2 (not reproducible in simulator)
    // "length" in obj used to prevent JIT error (gh-11508)
    var length = "length" in Object(obj) && obj.length;

    // NodeList objects (with `item` method) and
    // other objects with suitable length characteristics are array-like
    return isNumber(length) &&
      (length >= 0 && (length - 1) in obj || typeof obj.item == 'export function');
  }

  export function isString(value) { return typeof value === 'string'; }


  /**
   * @ngdoc export function
   * @name angular.fromJson
   * @module ng
   * @kind export function
   *
   * @description
   * Deserializes a JSON string.
   *
   * @param {string} json JSON string to deserialize.
   * @returns {Object|Array|string|number} Deserialized JSON string.
   */
  export function fromJson(json) {
    return isString(json)
      ? JSON.parse(json)
      : json;
  }

  export function identity($) { return $; }

  export function equals(o1, o2) {
    if (o1 === o2) return true;
    if (o1 === null || o2 === null) return false;
    if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
    var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
    if (t1 == t2) {
      if (t1 == 'object') {
        if (isArray(o1)) {
          if (!isArray(o2)) return false;
          if ((length = o1.length) == o2.length) {
            for (key = 0; key < length; key++) {
              if (!equals(o1[key], o2[key])) return false;
            }
            return true;
          }
        } else if (isDate(o1)) {
          if (!isDate(o2)) return false;
          return equals(o1.getTime(), o2.getTime());
        } else if (isRegExp(o1)) {
          return isRegExp(o2) ? o1.toString() == o2.toString() : false;
        } else {
          if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2) ||
            isArray(o2) || isDate(o2) || isRegExp(o2)) return false;
          keySet = createMap();
          for (key in o1) {
            if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
            if (!equals(o1[key], o2[key])) return false;
            keySet[key] = true;
          }
          for (key in o2) {
            if (!(key in keySet) &&
              key.charAt(0) !== '$' &&
              isDefined(o2[key]) &&
              !isFunction(o2[key])) return false;
          }
          return true;
        }
      }
    }
    return false;
  }

  export function isDate(value) {
    return toString.call(value) === '[object Date]';
  }

  export function isRegExp(value) {
    return toString.call(value) === '[object RegExp]';
  }

  export function isDefined(value) { return typeof value !== 'undefined'; }
  export function createMap() {
    return Object.create(null);
  }

  export function extend(...dst) {
    return baseExtend(dst, slice.call(arguments, 1), false);
  }

  function baseExtend(dst, objs, deep) {
    var h = dst.$$hashKey;

    for (var i = 0, ii = objs.length; i < ii; ++i) {
      var obj = objs[i];
      if (!isObject(obj) && !isFunction(obj)) continue;
      var keys = Object.keys(obj);
      for (var j = 0, jj = keys.length; j < jj; j++) {
        var key = keys[j];
        var src = obj[key];

        if (deep && isObject(src)) {
          if (isDate(src)) {
            dst[key] = new Date(src.valueOf());
          } else if (isRegExp(src)) {
            dst[key] = new RegExp(src);
          } else if (src.nodeName) {
            dst[key] = src.cloneNode(true);
          } else if (isElement(src)) {
            dst[key] = src.clone();
          } else {
            if (!isObject(dst[key])) dst[key] = isArray(src) ? [] : {};
            baseExtend(dst[key], [src], true);
          }
        } else {
          dst[key] = src;
        }
      }
    }

    setHashKey(dst, h);
    return dst;
  }

  function isElement(node) {
    return !!(node &&
      (node.nodeName  // we are a direct element
        || (node.prop && node.attr && node.find)));  // we have an on and find method part of jQuery API
  }

  function setHashKey(obj, h) {
    if (h) {
      obj.$$hashKey = h;
    } else {
      delete obj.$$hashKey;
    }
  }

  var slice = [].slice;
}