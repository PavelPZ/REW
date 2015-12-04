namespace validation {

  //*********************** COMPONENTS
  interface IGroupContext { myGroup: Group; }

  //--- INPUT
  export class Input extends flux.DumpComponent<IInputProps, IInputState>{
    constructor(prop: IInputProps, ctx: IGroupContext) {
      super(prop, ctx);
      this.state = { value: prop.initValue ? prop.initValue : '' };
      this.myGroup = ctx ? ctx.myGroup : null;
      if (this.myGroup) {
        this.myGroup.inputs.push(this);
        if (!prop.tabIndex) this.tabIndex = this.myGroup.lastTabIndex++;
      } else
        this.tabIndex = prop.tabIndex || 0;
    }
    myGroup: Group;
    tabIndex: number;
    render() {
      return validation.getInputTemplate(this, { value: this.state.value, requestChange: newVal => this.change(newVal) }); //https://facebook.github.io/react/docs/two-way-binding-helpers.html
    }

    doValidate() {
      if (!this.props.validator) return;
      if (this.state.blured) {
        this.state.error = null;
        if (this.myGroup) this.myGroup.validate();
        validate(this.props.validator, this.state);
      }
      this.setState(this.state);
    }

    change(newVal: string) { this.state.value = newVal; this.doValidate(); } //zmena hodnoty
    keyDown(ev: React.KeyboardEvent) { if (ev.keyCode != 13) return; this.blur(); } //ENTER
    blur() { this.state.blured = true; this.doValidate(); } //ztrata fokusu

    static contextTypes = { myGroup: React.PropTypes.any };
  }

  interface IInputProps extends flux.IComponentProps {
    validator?: IValidPars;
    initValue?: string;
    title: string;
    id?: string;
    type?: string; tabIndex?: number;
  }

  //--- GROUP
  export class Group extends flux.DumpComponent<IGroupProps, any>{
    render() {
      return validation.getGroupTemplate(this);
    }

    id: string;
    lastTabIndex = 1;
    inputs: Array<Input> = [];
    validate() {
      var th = this;
      //validace stejnych hesel
      th.inputs.filter(sp => sp.props.validator && sp.state.blured && (sp.props.validator.type & types.equalTo) != 0).forEach(sp => {
        var pp = th.inputs.find(p => p.props.validator && p.state.blured && p.props.id == sp.props.validator.equalToId); if (!pp) return;
        sp.state.error = pp.state.value != sp.state.value ? messages.equalTo() : null;
        sp.setState(sp.state);
      });
    }
    onSubmit(ev: React.FormEvent) { //autocomplete: "VCARD_NAME" "x-autocompletetype"
      ev.preventDefault();
      var firstError = this.inputs.find(inp => !!inp.state.error);
      if (firstError) return;
      var res = {};
      this.inputs.forEach(inp => res[inp.props.id] = inp.state.value);
      this.props.onOk(res);
    }

    static childContextTypes = { myGroup: React.PropTypes.any };
    getChildContext: () => IGroupContext = () => { return { myGroup: this }; }
  }

  interface IGroupProps extends flux.IComponentProps {
    okTitle: string;
    cancelTitle: string;
    onOk: (vals: Object) => void;
    onCancel: utils.TCallback;
  }

  //--- GROUP ERROR
  //export class GroupError extends flux.DumpComponent<any, IGroupErrorState>{
  //  constructor(prop, ctx: IGroupContext) {
  //    super(prop, ctx);
  //    this.driver = new groupError(ctx ? ctx.myGroup : null, () => this.setState(this.driver.state));
  //  }
  //  driver: groupError;
  //  static contextTypes = { validation: React.PropTypes.any, [config.ctxPropName]: React.PropTypes.any };
  //  render() { return validation.getGroupErrorTemplate({ value: this.driver.state.value }); }
  //}
  //export interface IGroupErrorTemplate { value: string; }
}