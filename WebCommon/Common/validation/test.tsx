namespace flux {
  export interface IWebState {
    valTest?: any; //cast globalniho flux.IFluxState, patrici aplikaci
  }
}

namespace valTest {

  //*********************** DISPATCH MODULE definition
  interface IValTestClickAction extends flux.IAction { }

  class valTest extends flux.Module {
    constructor() {
      super(valTest.moduleId);
    }
    dispatchAction(action: flux.IAction, complete: (action: flux.IAction) => void) {
      var old = flux.getState();
      switch (action.actionId) {
        case 'click':
          alert('click');
          if (complete) complete(action);
          break;
      }
    }
    static createAppClickAction(): IValTestClickAction { return { moduleId: valTest.moduleId, actionId: 'click' }; }
    static moduleId = 'valTest';
  }

  //************* VIEW
  export class ValTest extends flux.SmartComponent<IValTestProps, IValTestStates>{
    render() {
      return <div>
        <div onClick={() => flux.trigger(valTest.createAppClickAction()) }>Click</div>
        {this.props.children}
        </div>;
    }
  };
  interface IValTestStates extends IFreezerState<IValTestStates> { }
  interface IValTestProps extends flux.ISmartProps<IValTestStates> { }


  //************* WHOLE APP
  new valTest();
  flux.initWebState(
    { valTest: {} },
    () => ReactDOM.render(
      <flux.Web initState={flux.getState() }>
    <ValTest initState={flux.getState().valTest }>
      {/*<validation.Input validator={{ type: validation.types.stringLength | validation.types.stringLength, minLength: 2, maxLength: 4 }}/>*/}
      {/*<validation.Input validator={{ type: validation.types.email }}/>*/}
      <validation.Group>
      <validation.Input validator={{ type: validation.types.required, id: 'psw' }}/><br/>
      <validation.Input validator={{ type: validation.types.equalTo, equalToId: 'psw' }}/>
        </validation.Group>
      <p><validation.Input/></p>
      {/*
      <validation.Group>
        <p><validation.Input validator={{ type: validation.types.email | validation.types.email }}/></p>
        <p><validation.Input/></p>
        <p><validation.GroupError/></p>
        </validation.Group>
      <hr/>
      <p><validation.Input/></p>
      <hr/>
      <validation.Group>
        <p><validation.Input/></p>
        <p><validation.Input/></p>
        <p><validation.GroupError/></p>
        </validation.Group>*/}
      </ValTest>
        </flux.Web>,
      document.getElementById('app')
    )
  );

}