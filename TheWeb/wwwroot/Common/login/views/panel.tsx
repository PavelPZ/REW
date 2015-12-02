module login {
  export class Panel extends flux.SmartComponent<IPanelProps, auth.IUser>{
    render() {
      if (auth.isLogged())
        return <b>LOGIN PANEL</b>;
      else
        return <a href='#' onClick={ev => router.navigRoute(login.namedRoute.home, {}, ev) } >LOGIN</a>;
    }
  }
  interface IPanelProps extends flux.ISmartProps<auth.IUser> { }
}