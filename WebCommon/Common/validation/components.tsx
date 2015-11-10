namespace validation {

  //********************************* VALIDATE COMPONENTS
  export class Group extends React.Component<any, any>{
    static childContextTypes = { validation: React.PropTypes.element };
    getChildContext: () => IGroupContext = () => { return { validation: this.driver = new group() }; }
    render() {
      return <div>{ this.props.children } </div>;
    }
    driver: group;
  }
  interface IGroupContext { validation: group; }

  export class Input extends flux.Component<IInputProps, any>{
    constructor(prop, ctx: IGroupContext) {
      super(prop, ctx);
      this.driver = new inputDriver(ctx ? ctx.validation : null, this.props.validator, this.props.initValue, () => {
        this.setState(this.driver.state);
        this.forceUpdate();
      });
    }
    static contextTypes = { validation: React.PropTypes.any }; //, ctx: React.PropTypes.any };
    driver: inputDriver;
    render() {
      //https://facebook.github.io/react/docs/two-way-binding-helpers.html
      var valueLink = {
        value: this.driver.state.value,
        requestChange: newVal => this.driver.change(newVal)
      };
      var error = this.driver.state.error ? [<br/>, <span>{this.driver.state.error}</span>] : null;
      //var error = [<br/>, <span>{this.driver.state.value}</span>];
      return <span>
        <input type="text" valueLink={valueLink} onBlur={ev => this.driver.blur() } onKeyDown={ev => this.driver.keyDown(ev) }/>
        {error}
        </span>;
    }
  }
  interface IInputProps extends flux.IComponentProps { validator?: IValidPars; initValue?: string; }

  export class GroupError extends flux.Component<any, IGroupErrorState>{
    constructor(prop, ctx: IGroupContext) {
      super(prop, ctx);
      this.driver = new groupError(ctx ? ctx.validation : null, () => this.setState(this.driver.state));
    }
    driver: groupError;
    static contextTypes = { validation: React.PropTypes.any, ctx: React.PropTypes.any };
    render() { return this.driver.state.value ? <span>{this.driver.state.value}</span> : null; }
  }

}