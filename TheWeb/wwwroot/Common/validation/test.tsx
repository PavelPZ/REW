namespace flux {
  export interface IAppState {
    valTest?: flux.ISmartState; //cast globalniho flux.IFluxState, patrici aplikaci
  }
}

namespace router {
  export interface INamedRoutes {
    validationTest: { index: router.RouteType; }
  };
  named.validationTest = {} as any;
}


namespace validationTest {

  //***** ROUTE init
  var moduleId = 'validationTest';

  //** ROUTERS and its dispatch
  var namedState = router.named.validationTest; //pojmenovane stavy
  router.init(
    namedState.index = new router.RouteType(moduleId, 'default', '/validation/test-home')
  );

  //*********************** DISPATCH MODULE definition
  interface IValTestClickAction extends flux.IAction { }

  class valTest extends flux.Dispatcher {
    constructor() {
      super(valTest.moduleId);
    }
    dispatchAction(action: flux.IAction, compl: utils.TCallback) {
      var old = flux.getState();
      switch (action.actionId) {
        case 'click':
          alert('click');
          break;
      }
      if (compl) compl();
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

  export function doRunApp() {

    router.setHome(namedState.index, {});
    namedState.index.dispatch = (par, comp) => { comp(); };

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

    flux.getState().valTest = { ids: [] };

    flux.initApplication(document.getElementById('app'), root);
  }

}