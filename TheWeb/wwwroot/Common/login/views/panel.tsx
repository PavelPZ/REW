module login {
  export class Panel extends flux.SmartComponent<IPanelProps, auth.IUser>{
    render() {
      if (auth.isLogged())
        return <b>LOGIN PANEL</b>;
      else
        return <a href={router.getHash(login.namedRoute.home)} >LOGIN</a>;
    }
  }
  interface IPanelProps extends flux.ISmartProps<auth.IUser> { }
}