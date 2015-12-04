module login {
  export interface IEmailRegisterPar {
    url: string;
    title: string;
  }
  export function emailRegister(par: IEmailRegisterPar): JSX.Element {
    return <div>
      <a href={par.url}>{par.title}</a>
      </div>;
  }
}