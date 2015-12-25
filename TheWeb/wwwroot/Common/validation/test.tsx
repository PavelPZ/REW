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
  interface IRes {
    email: string;
    psw: string;
    pswc: string;
  }
  var namedState = router.named.validationTest; //pojmenovane stavy
  namedState.index = new router.RouteType(moduleId, 'default', '/validation/test-home')

  export function doRunApp() {

    //** ROUTERS and its dispatch
    router.activate(namedState.index);

    router.setHome(namedState.index, {});
    namedState.index.dispatch = (par, comp) => { comp(); };

    new valTest();

    var root = () => <ValTest key={flux.cnt() } initState={flux.getState().valTest} id='valTest.ValTest' parentId={''} >
      <validation.Group okTitle='Ok' cancelTitle='Cancel' onCancel={() => alert('cancel') } onOk={(val: IRes) => alert(JSON.stringify(val)) }>
        <validation.Input validator={{ type: validation.types.email }} idPtr={(r: IRes) => r.email} title='eMail'/><br/>
        <validation.Input validator={{ type: validation.types.required }} idPtr={(r: IRes) => r.psw} title='Password' type='password'/><br/>
        <validation.Input validator={{ type: validation.types.equalTo, equalToId: 'psw' }} idPtr={(r: IRes) => r.pswc} title='Confirm password' type='password'/>
        </validation.Group>
      </ValTest>;

    flux.getState().valTest = { ids: [] };

    flux.initApplication(document.getElementById('app'), root);
  }

}