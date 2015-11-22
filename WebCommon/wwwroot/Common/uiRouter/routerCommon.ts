namespace uiRouter {
  export function inherit(parent, extra) {
    return extend(new (extend(function () { }, { prototype: parent }))(), extra);
  }

  export function merge(dst) {
    forEach(arguments, function (obj) {
      if (obj !== dst) {
        forEach(obj, function (value, key) {
          if (!dst.hasOwnProperty(key)) dst[key] = value;
        });
      }
    });
    return dst;
  }

  /**
   * Finds the common ancestor path between two states.
   *
   * @param {Object} first The first state.
   * @param {Object} second The second state.
   * @return {Array} Returns an array of state names in descending order, not including the root.
   */
  export function ancestors(first, second) {
    var path = [];

    for (var n in first.path) {
      if (first.path[n] !== second.path[n]) break;
      path.push(first.path[n]);
    }
    return path;
  }

  /**
   * IE8-safe wrapper for `Object.keys()`.
   *
   * @param {Object} object A JavaScript object.
   * @return {Array} Returns the keys of the object as an array.
   */
  export function objectKeys(object) {
    if (Object.keys) {
      return Object.keys(object);
    }
    var result = [];

    forEach(object, function (val, key) {
      result.push(key);
    });
    return result;
  }

  /**
   * IE8-safe wrapper for `Array.prototype.indexOf()`.
   *
   * @param {Array} array A JavaScript array.
   * @param {*} value A value to search the array for.
   * @return {Number} Returns the array index value of `value`, or `-1` if not present.
   */
  export function indexOf(array, value) {
    if (Array.prototype.indexOf) {
      return array.indexOf(value, Number(arguments[2]) || 0);
    }
    var len = array.length >>> 0, from = Number(arguments[2]) || 0;
    from = (from < 0) ? Math.ceil(from) : Math.floor(from);

    if (from < 0) from += len;

    for (; from < len; from++) {
      if (from in array && array[from] === value) return from;
    }
    return -1;
  }

  /**
   * Merges a set of parameters with all parameters inherited between the common parents of the
   * current state and a given destination state.
   *
   * @param {Object} currentParams The value of the current state parameters ($stateParams).
   * @param {Object} newParams The set of parameters which will be composited with inherited params.
   * @param {Object} $current Internal definition of object representing the current state.
   * @param {Object} $to Internal definition of object representing state to transition to.
   */
  export function inheritParams(currentParams, newParams, $current, $to) {
    var parents = ancestors($current, $to), parentParams, inherited = {}, inheritList = [];

    for (var i in parents) {
      if (!parents[i].params) continue;
      parentParams = objectKeys(parents[i].params);
      if (!parentParams.length) continue;

      for (var j in parentParams) {
        if (indexOf(inheritList, parentParams[j]) >= 0) continue;
        inheritList.push(parentParams[j]);
        inherited[parentParams[j]] = currentParams[parentParams[j]];
      }
    }
    return extend({}, inherited, newParams);
  }

  /**
   * Performs a non-strict comparison of the subset of two objects, defined by a list of keys.
   *
   * @param {Object} a The first object.
   * @param {Object} b The second object.
   * @param {Array} keys The list of keys within each object to compare. If the list is empty or not specified,
   *                     it defaults to the list of keys in `a`.
   * @return {Boolean} Returns `true` if the keys match, otherwise `false`.
   */
  export function equalForKeys(a, b, keys) {
    if (!keys) {
      keys = [];
      for (var n in a) keys.push(n); // Used instead of Object.keys() for IE8 compatibility
    }

    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (a[k] != b[k]) return false; // Not '===', values aren't necessarily normalized
    }
    return true;
  }

  /**
   * Returns the subset of an object, based on a list of keys.
   *
   * @param {Array} keys
   * @param {Object} values
   * @return {Boolean} Returns a subset of `values`.
   */
  export function filterByKeys(keys, values) {
    var filtered = {};

    forEach(keys, function (name) {
      filtered[name] = values[name];
    });
    return filtered;
  }

  // like _.indexBy
  // when you know that your index values will be unique, or you want last-one-in to win
  export function indexBy(array, propName) {
    var result = {};
    forEach(array, function (item) {
      result[item[propName]] = item;
    });
    return result;
  }

  // extracted from underscore.js
  // Return a copy of the object only containing the whitelisted properties.
  export function pick(obj) {
    var copy = {};
    var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
    forEach(keys, function (key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  }

  // extracted from underscore.js
  // Return a copy of the object omitting the blacklisted properties.
  export function omit(obj) {
    var copy = {};
    var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
    for (var key in obj) {
      if (indexOf(keys, key) == -1) copy[key] = obj[key];
    }
    return copy;
  }

  export function pluck(collection, key) {
    var result = isArray(collection) ? [] : {};

    forEach(collection, function (val, i) {
      result[i] = isFunction(key) ? key(val) : val[key];
    });
    return result;
  }

  export function filter(collection, callback) {
    var array = isArray(collection);
    var result:any = array ? [] : {};
    forEach(collection, function (val, i) {
      if (callback(val, i)) {
        result[array ? result.length : i] = val;
      }
    });
    return result;
  }

  export function map(collection, callback) {
    var result = isArray(collection) ? [] : {};

    forEach(collection, function (val, i) {
      result[i] = callback(val, i);
    });
    return result;
  }
}