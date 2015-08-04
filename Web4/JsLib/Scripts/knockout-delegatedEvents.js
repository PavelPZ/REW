//http://www.knockmeout.net/2012/11/revisit-event-delegation-in-knockout-js.html
//knockout-delegatedEvents v0.1.1 | (c) 2012 Ryan Niemeyer | http://www.opensource.org/licenses/mit-license
//http://borismoore.github.io/jsrender/demos/variants/accessing-templates/05_template-composition-templateobjects.html
(function (factory) {
  //CommonJS
  if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
    factory(require("knockout"), exports);
    //AMD
  } else if (typeof define === "function" && define.amd) {
    define(["knockout", "exports"], factory);
    //normal script tag
  } else {
    factory(ko, ko.actions = {});
  }
}(function (ko, actions) {
  var prefix = "ko_delegated_";
  var createDelegatedHandler = function (eventName, root) {
    return function (event) {
      var data, method, action, owner, matchingParent, command, result,
          el = event.target || event.srcElement,
          context = ko.contextFor(el),
          attr = "data-" + eventName,
          key = prefix + eventName;

      if (context) {
        //loop until we either find an action, run out of elements, or hit the root element that has our delegated handler
        while (!method && el) {
          method = el.getAttribute(attr) || ko.utils.domData.get(el, key);
          if (!method) {
            el = el !== root ? el.parentElement : null;
          }
        }

        if (method) {
          //get context of the element that actually held the action

          context = ko.contextFor(el);

          if (context) {
            data = context.$data;

            if (typeof method === "string") {
              //check defined actions
              if (method in actions) {
                command = actions[method];
                if (command) {
                  action = typeof command === "function" ? command : command.action;
                  owner = command.owner || data;
                }
              }
                //search for the action
              else if (data && data[method] && typeof data[method] === "function") {
                action = data[method];
                owner = data;
              }

              //search parents for the action
              if (!action) {
                matchingParent = ko.utils.arrayFirst(context.$parents, function (parent) {
                  return parent[method] && typeof parent[method] === "function";
                });

                action = matchingParent && matchingParent[method];
                owner = matchingParent;
              }
            }
              //a binding handler was used to associate the element with a function
            else if (typeof method === "function") {
              action = method;
              owner = data;
            }
          }

          //execute the action as KO normally would
          if (action) {
            //result = action.call(owner, data, event); 
            result = action.call(owner, data, el.getAttribute('data-delegate-index'), event); //LM PATCH

            //prevent default action, if handler returns true
            if (result !== true) {
              if (event.preventDefault) {
                event.preventDefault();
              }
              else {
                event.returnValue = false;
              }
            }
          }
        }
      }
    };
  };

  //create a binding for an event to associate a function with the element
  var createDelegatedBinding = function (event) {
    var bindingName;
    if (event) {
      //capitalize first letter
      bindingName = "delegated" + event.substr(0, 1).toUpperCase() + event.slice(1);
    }

    //create the binding, if it does not exist
    if (!ko.bindingHandlers[bindingName]) {
      ko.bindingHandlers[bindingName] = {
        init: function (element, valueAccessor) {
          var action = valueAccessor();
          ko.utils.domData.set(element, prefix + event, action);
        }
      };
    }
  };

  //add a handler on a parent element that responds to events from the children
  ko.bindingHandlers.delegatedHandler = {
    init: function (element, valueAccessor) {
      var events = ko.utils.unwrapObservable(valueAccessor()) || [];

      if (typeof events === "string") {
        events = [events];
      }

      ko.utils.arrayForEach(events, function (event) {
        createDelegatedBinding(event);
        ko.utils.registerEventHandler(element, event, createDelegatedHandler(event, element));
      });
    }
  };
}));
