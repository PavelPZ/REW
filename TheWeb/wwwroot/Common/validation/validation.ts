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
      this.id = utils.propName(this.props.idPtr);
    }
    myGroup: Group;
    tabIndex: number;
    id: string;
    render() {
      return validation.getInputTemplate(this, { value: this.state.value, requestChange: newVal => this.change(newVal) }); //https://facebook.github.io/react/docs/two-way-binding-helpers.html
    }
    //pozdrzeni BLUR event, vola se nekdy sama
    componentDidMount() { setTimeout(() => this.blur = () => { this.state.blured = true; this.doValidate(); }, 1); }

    doValidate() {
      if (!this.props.validator) return;
      if (this.state.blured) {
        this.state.error = null;
        if (this.myGroup) this.myGroup.multiValidate();
        validate(this.props.validator, this.state);
      }
      this.setState(this.state);
    }

    change(newVal: string) { this.state.value = newVal; this.doValidate(); } //zmena hodnoty
    keyDown(ev: React.KeyboardEvent) { if (ev.keyCode != 13) return; this.doBlur(); } //ENTER
    blur: () => void; //ztrata fokusu
    doBlur() { if (this.blur) this.blur(); }

    static contextTypes = { myGroup: React.PropTypes.any };
  }

  interface IInputProps extends flux.IComponentProps {
    validator?: IValidPars;
    initValue?: string;
    title: string;
    idPtr: utils.propNameType;
    type?: string; tabIndex?: number;
  }

  //--- GROUP
  export class Group extends flux.DumpComponent<IGroupProps, any>{

    render() { return validation.getGroupTemplate(this); }

    id: string;
    lastTabIndex = 1;
    inputs: Array<Input> = [];
    multiValidate():boolean {
      var th = this; var isError = false;
      //validace stejnych hesel
      th.inputs.filter(sp => sp.props.validator && sp.state.blured && (sp.props.validator.type & types.equalTo) != 0).forEach(sp => {
        var pp = th.inputs.find(p => p.props.validator && p.state.blured && p.id == sp.props.validator.equalToId); if (!pp) return;
        sp.state.error = pp.state.value != sp.state.value ? messages.equalTo() : null;
        isError = isError || !!sp.state.error;
        sp.setState(sp.state);
      });
      return !isError;
    }
    validate(): Object {
      var res = {}; var isError = false;
      this.inputs.forEach(inp => {
        inp.state.blured = true; inp.state.error = null;
        validate(inp.props.validator, inp.state);
        inp.setState(inp.state);
        res[inp.id] = inp.state.value;
        isError = isError || !!inp.state.error;
      });
      isError = !this.multiValidate() || isError;
      return isError ? null : res;
    }
    onSubmit(ev: React.FormEvent) { //autocomplete: "VCARD_NAME" "x-autocompletetype"
      ev.preventDefault();
      var res = this.validate(); if (!res) return;
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