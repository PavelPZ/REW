namespace valTest {

  //*********************** DISPATCH MODULE definition
  interface IValTestClickAction extends flux.IAction { }

  var modName = 'valTest';

  class valTest extends flux.Module {
    constructor() {
      super(modName);
    }
    dispatchAction(type: string, action: flux.IAction, complete: (action: flux.IAction) => void) {
      var old = store.getState();
      switch (type) {
        case 'click':
          alert('click');
          if (complete) complete(action);
          break;
      }
    }
    static createAppClickAction(): IValTestClickAction { return { type: modName + '.click' }; }
  }

  //************* VIEW
  export class ValTest extends flux.RootComponent<IValTestProps, IValTestStates>{
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
  var store = new flux.Flux<IValTestStates>([new valTest()], {
  })

  ReactDOM.render(
    <ValTest initState={store.getState() }>
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
      </ValTest>,
    document.getElementById('app')
  );
}