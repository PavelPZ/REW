// Type definitions for react-redux 2.1.2
// Project: https://github.com/rackt/react-redux
// Definitions by: Qubo <https://github.com/tkqubo>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare namespace ReactRedux {
  import React = __React;
  //import { Store, Dispatch, ActionCreator } = Redux;

  export interface ClassDecorator {
    <TFunction extends Function>(target: TFunction): TFunction|void;
  }

  /**
   * Connects a React component to a Redux store.
   * @param mapStateToProps
   * @param mapDispatchToProps
   * @param mergeProps
   * @param options
     */
  export function connect<S,P>(mapStateToProps?: MapStateToProps<S>,
                          mapDispatchToProps?: MapDispatchToPropsFunction|MapDispatchToPropsObject,
                          mergeProps?: MergeProps,
                          options?: Options): (cls: React.ClassicComponentClass<P>) => React.ClassicComponentClass<P>;

  interface MapStateToProps<S> {
    (state: S, ownProps?: any): any;
  }

  interface MapDispatchToPropsFunction {
    (dispatch: Redux.Dispatch, ownProps?: any): any;
  }

  interface MapDispatchToPropsObject {
    [name: string]: Redux.ActionCreator;
  }

  interface MergeProps {
    (stateProps: any, dispatchProps: any, ownProps: any): any;
  }

  interface Options {
    /**
     * If true, implements shouldComponentUpdate and shallowly compares the result of mergeProps,
     * preventing unnecessary updates, assuming that the component is a “pure” component
     * and does not rely on any input or state other than its props and the selected Redux store’s state.
     * Defaults to true.
     * @default true
     */
    pure?: boolean;
  }

  export interface Property {
    /**
     * The single Redux store in your application.
     */
    store?: Redux.Store;
    children?: Function;
  }

  /**
   * Makes the Redux store available to the connect() calls in the component hierarchy below.
   */
  export class Provider extends React.Component<Property, {}> { }
}
