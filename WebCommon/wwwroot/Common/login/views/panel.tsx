module login {
  export class Panel extends flux.SmartComponent<IPanelProps, auth.IUser>{
  }
  interface IPanelProps extends flux.ISmartProps<auth.IUser> { }
}