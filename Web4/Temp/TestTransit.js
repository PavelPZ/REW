//interface JQuery {
//  transition;
//}
//interface JQuerySupport {
//  transition;
//}
//interface KnockoutBindingHandlers {
//  fadeVisible;
//}
//module testTransit {
//  export class view {
//    constructor(public title: string, template: string) { this.template(template); }
//    visible = ko.observable(true);
//    template = ko.observable<string>('dummy');
//  }
//  export class test {
//    views: Array<KnockoutObservable<view>> = [ko.observable<view>(null), ko.observable<view>(null)];
//    actCount = 1;
//    setView(v: view) {
//      var nextCount = this.actCount == 0 ? 1 : 0;
//      this.views[nextCount](v);
//      if (this.views[this.actCount]()) this.views[this.actCount]().visible(false);
//      this.actCount = nextCount;
//    }
//    change() { this.setView(new view('title ' + (cnt++).toString(), this.actCount == 0 ? 't0' : 't1')); }
//  } var cnt = 0;
//  $(() => ko.applyBindings(new test(), $('body')[0]));
//  ko.bindingHandlers.fadeVisible = {
//    update: function (element, valueAccessor) {
//      var data: view = ko.dataFor(element);
//      var value = ko.utils.unwrapObservable(valueAccessor());
//      if ($.support.transition) {
//        var width = $('body').width();
//        if (value) $(element).css({ left: '-' + width.toString() + 'px' }).transition({ x: '+=' + width.toString() }, 300);
//        else $(element).transition({ x: '+=' + width.toString() }, 300, () => data.template('dummy'));
//      } else {
//        if (!value) data.template('dummy');
//      }
//    }
//  };
//}
//module router {
//  export var obj = {
//    _trimSeparators: function (str) {
//        return str.replace(/^[\/.]+|\/+$/g, "")
//      },
//    _escapeRe: function (str) {
//        return str.replace(/\W/g, "\\$1")
//      },
//    _checkConstraint: function (param, constraint) {
//      param = String(param);
//      if (typeof constraint === "string")
//        constraint = new RegExp(constraint);
//      var match = constraint.exec(param);
//      if (!match || match[0] !== param)
//        return false;
//        return true
//      },
//    _ensureReady: function () {
//      var self = this;
//      if (this._patternRe)
//        return false;
//      this._pattern = this._trimSeparators(this._pattern);
//      this._patternRe = "";
//      this._params = [];
//      this._segments = [];
//      this._separators = [];
//      this._pattern.replace(/[^\/]+/g, function (segment, index) {
//        self._segments.push(segment);
//        if (index)
//          self._separators.push(self._pattern.substr(index - 1, 1))
//        });
//      $.each(this._segments, function (index) {
//        var isStatic = true,
//          segment = this,
//          separator = index ? self._separators[index - 1] : "";
//        if (segment.charAt(0) === ":") {
//          isStatic = false;
//          segment = segment.substr(1);
//          self._params.push(segment);
//          self._patternRe += "(?:" + separator + "([^/]+))";
//          if (segment in self._defaults)
//            self._patternRe += "?"
//          }
//        else
//          self._patternRe += separator + self._escapeRe(segment)
//        });
//      this._patternRe = new RegExp("^" + this._patternRe + "$")
//      },
//    ctor: function (pattern, defaults, constraints) {
//      this._pattern = pattern || "";
//      this._defaults = defaults || {};
//      this._constraints = constraints || {}
//      },
//    parse: function (uri) {
//      var self = this;
//      this._ensureReady();
//      var matches = this._patternRe.exec(uri);
//      if (!matches)
//        return false;
//      var result = $.extend({}, this._defaults);
//      $.each(this._params, function (i) {
//        var index = i + 1;
//        if (matches.length >= index && matches[index])
//          result[this] = self.parseSegment(matches[index])
//        });
//      $.each(this._constraints, function (key) {
//        if (!self._checkConstraint(result[key], self._constraints[key])) {
//          result = false;
//            return false
//          }
//      });
//        return result
//      },
//    format: function (routeValues): any {
//      var self = this,
//        query = "";
//      this._ensureReady();
//      var mergeValues = $.extend({}, this._defaults),
//        useStatic = 0,
//        ret = [],
//        dels = [],
//        unusedRouteValues = {};
//      $.each(routeValues, function (paramName, paramValue) {
//        routeValues[paramName] = self.formatSegment(paramValue);
//        if (!(paramName in mergeValues))
//          unusedRouteValues[paramName] = true
//        });
//      $.each(this._segments, function (index, segment) {
//        ret[index] = index ? self._separators[index - 1] : '';
//        if (segment.charAt(0) === ':') {
//          var paramName = segment.substr(1);
//          if (!(paramName in routeValues) && !(paramName in self._defaults)) {
//            ret = null;
//              return false
//            }
//          if (paramName in self._constraints && !self._checkConstraint(routeValues[paramName], self._constraints[paramName])) {
//            ret = null;
//              return false
//            }
//          if (paramName in routeValues) {
//            if (routeValues[paramName] !== undefined) {
//              mergeValues[paramName] = routeValues[paramName];
//              ret[index] += routeValues[paramName];
//              useStatic = index
//              }
//            delete unusedRouteValues[paramName]
//            }
//          else if (paramName in mergeValues) {
//            ret[index] += mergeValues[paramName];
//            dels.push(index)
//            }
//        }
//        else {
//          ret[index] += segment;
//          useStatic = index
//          }
//      });
//      $.each(mergeValues, function (key, value) {
//        if (!!value && $.inArray(":" + key, self._segments) === -1 && routeValues[key] !== value) {
//          ret = null;
//            return false
//          }
//      });
//      var unusedCount = 0;
//      if (!$.isEmptyObject(unusedRouteValues)) {
//        query = "?";
//        $.each(unusedRouteValues, function (key) {
//          query += key + "=" + routeValues[key] + "&";
//          unusedCount++
//          });
//        query = query.substr(0, query.length - 1)
//        }
//      $.each(routeValues, function (i) {
//        if (!this in mergeValues) {
//          ret = null;
//            return false
//          }
//      });
//      if (ret === null)
//        return false;
//      if (dels.length)
//        $.map(dels, function (i) {
//          if (i >= useStatic)
//            ret[i] = ''
//          });
//      var path = ret.join('');
//      path = path.replace(/\/+$/, "");
//        return {
//        uri: path + query,
//        unusedCount: unusedCount
//      }
//      },
//    formatSegment: function (value) {
//      if ($.isArray(value) || $.isPlainObject(value))
//        return "json:" + encodeURIComponent(JSON.stringify(value));
//        return encodeURIComponent(value)
//      },
//    parseSegment: function (value) {
//      if (value.substr(0, 5) === "json:")
//        try {
//            return $.parseJSON(decodeURIComponent(value.substr(5)))
//          }
//        catch (x) { }
//        return decodeURIComponent(value)
//      }
//  };
//  export function Route(pattern, defaults, constraints) {
//    this._pattern = pattern || "";
//    this._defaults = defaults || {};
//    this._constraints = constraints || {};
//    var obj = {
//      _trimSeparators: function (str) {
//                return str.replace(/^[\/.]+|\/+$/g, "")
//            },
//      _escapeRe: function (str) {
//                return str.replace(/\W/g, "\\$1")
//            },
//      _checkConstraint: function (param, constraint) {
//        param = String(param);
//        if (typeof constraint === "string")
//          constraint = new RegExp(constraint);
//        var match = constraint.exec(param);
//        if (!match || match[0] !== param)
//          return false;
//                return true
//            },
//      _ensureReady: function () {
//        var self = this;
//        if (this._patternRe)
//          return false;
//        this._pattern = this._trimSeparators(this._pattern);
//        this._patternRe = "";
//        this._params = [];
//        this._segments = [];
//        this._separators = [];
//        this._pattern.replace(/[^\/]+/g, function (segment, index) {
//          self._segments.push(segment);
//          if (index)
//            self._separators.push(self._pattern.substr(index - 1, 1))
//                });
//        $.each(this._segments, function (index) {
//          var isStatic = true,
//            segment = this,
//            separator = index ? self._separators[index - 1] : "";
//          if (segment.charAt(0) === ":") {
//            isStatic = false;
//            segment = segment.substr(1);
//            self._params.push(segment);
//            self._patternRe += "(?:" + separator + "([^/]+))";
//            if (segment in self._defaults)
//              self._patternRe += "?"
//                    }
//          else
//            self._patternRe += separator + self._escapeRe(segment)
//                });
//        this._patternRe = new RegExp("^" + this._patternRe + "$")
//            },
//      parse: function (uri) {
//        var self = this;
//        this._ensureReady();
//        var matches = this._patternRe.exec(uri);
//        if (!matches)
//          return false;
//        var result = $.extend({}, this._defaults);
//        $.each(this._params, function (i) {
//          var index = i + 1;
//          if (matches.length >= index && matches[index])
//            result[this] = self.parseSegment(matches[index])
//                });
//        $.each(this._constraints, function (key) {
//          if (!self._checkConstraint(result[key], self._constraints[key])) {
//            result = false;
//                        return false
//                    }
//        });
//                return result
//            },
//      format: function (routeValues): any {
//        var self = this,
//          query = "";
//        this._ensureReady();
//        var mergeValues = $.extend({}, this._defaults),
//          useStatic = 0,
//          ret = [],
//          dels = [],
//          unusedRouteValues = {};
//        $.each(routeValues, function (paramName, paramValue) {
//          routeValues[paramName] = self.formatSegment(paramValue);
//          if (!(paramName in mergeValues))
//            unusedRouteValues[paramName] = true
//                });
//        $.each(this._segments, function (index, segment) {
//          ret[index] = index ? self._separators[index - 1] : '';
//          if (segment.charAt(0) === ':') {
//            var paramName = segment.substr(1);
//            if (!(paramName in routeValues) && !(paramName in self._defaults)) {
//              ret = null;
//                            return false
//                        }
//            if (paramName in self._constraints && !self._checkConstraint(routeValues[paramName], self._constraints[paramName])) {
//              ret = null;
//                            return false
//                        }
//            if (paramName in routeValues) {
//              if (routeValues[paramName] !== undefined) {
//                mergeValues[paramName] = routeValues[paramName];
//                ret[index] += routeValues[paramName];
//                useStatic = index
//                            }
//              delete unusedRouteValues[paramName]
//                        }
//            else if (paramName in mergeValues) {
//              ret[index] += mergeValues[paramName];
//              dels.push(index)
//                        }
//          }
//          else {
//            ret[index] += segment;
//            useStatic = index
//                    }
//        });
//        $.each(mergeValues, function (key, value) {
//          if (!!value && $.inArray(":" + key, self._segments) === -1 && routeValues[key] !== value) {
//            ret = null;
//                        return false
//                    }
//        });
//        var unusedCount = 0;
//        if (!$.isEmptyObject(unusedRouteValues)) {
//          query = "?";
//          $.each(unusedRouteValues, function (key) {
//            query += key + "=" + routeValues[key] + "&";
//            unusedCount++
//                    });
//          query = query.substr(0, query.length - 1)
//                }
//        $.each(routeValues, function (i) {
//          if (!this in mergeValues) {
//            ret = null;
//                        return false
//                    }
//        });
//        if (ret === null)
//          return false;
//        if (dels.length)
//          $.map(dels, function (i) {
//            if (i >= useStatic)
//              ret[i] = ''
//                    });
//        var path = ret.join('');
//        path = path.replace(/\/+$/, "");
//                return {
//          uri: path + query,
//          unusedCount: unusedCount
//        }
//            },
//      formatSegment: function (value) {
//        if ($.isArray(value) || $.isPlainObject(value))
//          return "json:" + encodeURIComponent(JSON.stringify(value));
//                return encodeURIComponent(value)
//            },
//      parseSegment: function (value) {
//        if (value.substr(0, 5) === "json:")
//          try {
//                        return $.parseJSON(decodeURIComponent(value.substr(5)))
//                    }
//          catch (x) { }
//                return decodeURIComponent(value)
//            }
//    };
//  }
//} 
