module login {
  export class Panel extends flux.SmartComponent<IPanelProps, auth.IUser>{
    render() { return <b>LOGIN PANEL</b>; }
  }
  interface IPanelProps extends flux.ISmartProps<auth.IUser> { }
}