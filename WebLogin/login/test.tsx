namespace loginTest {
  export class Root extends flux.SmartComponent<IRootProps, IRootStates>{
    render() {
      return null;
    }
  }
  interface IRootProps extends flux.IProps<IRootStates> { }
  interface IRootStates extends IFreezerState<IRootStates> { }
}