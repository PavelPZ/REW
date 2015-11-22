namespace flux {
  export interface IAppState {
    valTest?: flux.ISmartState; //cast globalniho flux.IFluxState, patrici aplikaci
  }
}

namespace valTest {

  //*********************** DISPATCH MODULE definition
  interface IValTestClickAction extends flux.IAction { }

  class valTest extends flux.Dispatcher {
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
    props: IValTestProps;
  };
  interface IValTestStates extends flux.ISmartState { }
  interface IValTestProps extends flux.ISmartProps<IValTestStates> { }


  //************* WHOLE APP
  //** inicializace aplikace
  config.cfg.initProc(config.initProcPhase.start);

  new valTest();

  var root = () => <ValTest key={flux.cnt() } initState={flux.getState().valTest} id='valTest.ValTest' parentId={''} >
      {/*<validation.Input validator={{ type: validation.types.stringLength | validation.types.stringLength, minLength: 2, maxLength: 4 }}/>*/}
      {/*<validation.Input validator={{ type: validation.types.email }}/>*/}
      <validation.Group>
      <validation.Input validator={{ type: validation.types.required, id: 'psw' }} title='Password'/><br/>
      <validation.Input validator={{ type: validation.types.equalTo, equalToId: 'psw' }} title='Confirm password'/>
        </validation.Group>
      <p><validation.Input title='???'/></p>
    </ValTest>;

  var state: flux.IAppState = { valTest: { ids: [] } };

  flux.initApplication(document.getElementById('app'), state, root);

}