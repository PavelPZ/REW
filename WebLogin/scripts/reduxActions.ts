namespace ReduxActions {
  // FSA-compliant action.
  // See: https://github.com/acdlite/flux-standard-action
  export interface Action {
    type: string;
    payload?: any;
    error?: boolean;
    meta?: any;
  };

  type PayloadCreator<T> = (...args: any[]) => T;
  type MetaCreator = (...args: any[]) => any;
  type Reducer<T> = (state: T, action: Action) => T;
  type ReducerMap<T> = { [actionType: string]: Reducer<T> };

  export function createAction<T>(type: string, actionCreator?: PayloadCreator<T>, metaCreator?: MetaCreator): (...args: any[]) => Action {
    var finalActionCreator = typeof actionCreator === 'function' ? actionCreator : identity;
    return function () {
      var action: Action = {
        type: type,
        payload: finalActionCreator.apply(undefined, arguments)
      };
      if (typeof metaCreator === 'function') action.meta = metaCreator.apply(undefined, arguments);
      return action;
    };
  }

  export function handleAction<T>(type: string, reducers: Reducer<T> | ReducerMap<T>): Reducer<T> {
    return function (state: T, action: Action): T {
      // If action type does not match, return previous state
      if (action.type !== type) return state;
      //https://github.com/acdlite/redux-actions: jeden reducer pro OK i ERROR nebo reducermap.
      var reducerFnc: Reducer<T> = isFunction(reducers) ? <Reducer<T>>reducers : reducers[action.error === true ? 'throw' : 'next'];
      return isFunction(reducers) ? reducerFnc(state, action) : state;
    };
  }

  export function handleActions<T>(handlers: ReducerMap<T>, defaultState?: T): Reducer<T> {
    //https://github.com/zloirock/core-js#ecmascript-6-reflect
    const reducers = Reflect.ownKeys(handlers).map((type:string) => {
      return handleAction(type, handlers[type]);
    });

    return typeof defaultState !== 'undefined'
      ? (state = defaultState, action) => reduceReducers(...reducers)(state, action)
      : reduceReducers(...reducers);  }


  function reduceReducers(...reducers) { return (previous, current) => reducers.reduce((p, r) => r(p, current),previous); }
  function identity(t) { return t; }
  function isFunction(val) { return typeof val === 'function'; }

}
