namespace config {
  export interface IData {
    validation: {
      group: validation.Group;
    };
  }
}

namespace validation {

  export interface IValidPars {
    type: types;
    id?: string;
    mask?: string; //regexp pro string mask
    //string length
    minLength?: number,
    maxLength?: number,
    //number intervals
    min?: number,
    max?: number,
    equalToId?: string;

  }
  export enum types {
    required = 0x1,
    email = 0x2,
    number = 0x4,
    digits = 0x8,
    equalTo = 0x10,
    stringLength = 0x20,
    numberRange = 0x40,
    stringMask = 0x80,
  }

  //********************************* VALIDATE LOGIC

  //---- GROUP
  class group {
    inputs: Array<inputDriver> = [];
    error: groupError;
    validate() {
      var th = this;
      //validace stejnych hesel
      th.inputs.filter(sp => sp.validator && sp.state.blured && (sp.validator.type & types.equalTo) != 0).forEach(sp => {
        var pp = th.inputs.find(p => p.validator && p.state.blured && p.validator.id == sp.validator.equalToId); if (!pp) return;
        sp.state.error = pp.state.value != sp.state.value ? messages.equalTo() : null;
        sp.onStateChanged();
      });
    }
  }
  class groupError {
    constructor(public group: group, public onStateChanged: () => void) {
      if (group) group.error = this;
    }
    state: IGroupErrorState = { value: '' };
  }
  interface IGroupErrorState { value: string; }

  //---- INPUT
  class inputDriver {
    constructor(public group: group, public validator: IValidPars, initValue: string, public onStateChanged: () => void) {
      this.state = { value: initValue ? initValue : '' };
      if (group) group.inputs.push(this); //registrace self v ramci cele grupy
    }
    state: IInputState; //STATE input komponenty
    pars: IValidPars; //parametry validace
    keyDown(ev: React.KeyboardEvent) { if (ev.keyCode != 13) return; this.blur(); } //ENTER
    blur() { this.state.blured = true; this.validate(); this.onStateChanged(); } //ztrata fokusu
    change(newVal: string) { this.state.value = newVal; if (this.state.blured) this.validate(); this.onStateChanged(); } //zmena hodnoty
    validate() {
      var th = this; if (!th.validator) return;
      var st = th.state; st.error = null;
      //na urovni GROUP, napr. EQUAL TO
      if (this.group) this.group.validate(); 
      var len = !st.value ? 0 : st.value.length;
      //REQUIRED
      if ((th.validator.type & types.required) != 0) {
        if (len < 1) { st.error = messages.required(); return; }
      }
      //STRING LENGTH
      if ((th.validator.type & types.stringLength) != 0) {
        if (th.validator.minLength && th.validator.maxLength) {
          if (len < th.validator.minLength || len > th.validator.maxLength) { st.error = messages.rangelength(th.validator.minLength, th.validator.maxLength); return; }
        } else if (th.validator.minLength) {
          if (len < th.validator.minLength) { st.error = messages.minlength(th.validator.minLength); return; }
        } else if (th.validator.maxLength) {
          if (len > th.validator.maxLength) { st.error = messages.maxlength(th.validator.maxLength); return; }
        }
      }
      //.. with MASK
      var mask: RegExp = null; var error: string;
      if ((th.validator.type & (types.number | types.numberRange)) != 0) {
        mask = /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;
        error = messages.number();
      } else if ((th.validator.type & types.digits) != 0) {
        mask = /^\d+$/;
        error = messages.digits();
      } else if ((th.validator.type & types.email) != 0) {
        mask = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        error = messages.email();
      }
      if (mask) {
        if (len == 0 || !mask.test(st.value)) { st.error = error; return; }
      }
      //NUMBER RANGE
      var defined = v => typeof v != 'undefined';
      if ((th.validator.type & types.numberRange) != 0) {
        var num = parseFloat(st.value);
        if (defined(th.validator.min) && defined(th.validator.max)) {
          if (num < th.validator.min || num > th.validator.max) { st.error = messages.range(th.validator.min, th.validator.max); return; }
        } else if (defined(th.validator.min)) {
          if (num < th.validator.min) { st.error = messages.min(th.validator.min); return; }
        } else if (defined(th.validator.max)) {
          if (num > th.validator.max) { st.error = messages.max(th.validator.max); return; }
        }
      }
    }
  }
  interface IInputState { value: string; blured?: boolean; error?: string; }

  var messages = {
    required: () => "This field is required.",
    remote: () => "Please fix this field.",
    email: () => "Please enter a valid email address.",
    url: () => "Please enter a valid URL.",
    date: () => "Please enter a valid date.",
    dateISO: () => "Please enter a valid date ( ISO ).",
    number: () => "Please enter a valid number.",
    digits: () => "Please enter only digits.",
    equalTo: () => "Please enter the same value again.",
    maxlength: (v1) => `Please enter no more than ${v1} characters.`,
    minlength: (v1) => `Please enter at least ${v1} characters.`,
    rangelength: (v1, v2) => `Please enter a value between ${v1} and ${v2} characters long.`,
    range: (v1, v2) => `Please enter a value between ${v1} and ${v2}.`,
    max: (v1) => `Please enter a value less than or equal to ${v1}.`,
    min: (v1) => `Please enter a value greater than or equal to ${v1}.`
  };

  //*********************** COMPONENTS
  interface IGroupContext { validation: group; }

  //--- IMPUT
  export class Input extends flux.DumpComponent<IInputProps, any>{ 
    constructor(prop, ctx: IGroupContext) {
      super(prop, ctx);
      this.driver = new inputDriver(ctx ? ctx.validation : null, this.props.validator, this.props.initValue, () => this.setState(this.driver.state));
    }
    static contextTypes = { validation: React.PropTypes.any }; //, [config.ctxPropName]: React.PropTypes.any };
    driver: inputDriver;
    render() {
      var templ: IInputTemplate = {
        valueLink: { value: this.driver.state.value, requestChange: newVal => this.driver.change(newVal) }, //https://facebook.github.io/react/docs/two-way-binding-helpers.html
        blur: () => this.driver.blur(),
        keyDown: ev => this.driver.keyDown(ev),
        error: this.driver.state.error
      };
      return getInputTemplate(templ);
    }
  }
  interface IInputProps extends flux.IComponentProps { validator?: IValidPars; initValue?: string; }

  export interface IInputTemplate {
    valueLink: React.ReactLink<string>; //two way binding
    blur: () => void; //ztrata fokusu
    keyDown: React.KeyboardEventHandler; //enter
    error: string; //validation error
  }

  //--- GROUP
  export class Group extends React.Component<any, any>{
    static childContextTypes = { validation: React.PropTypes.element };
    getChildContext: () => IGroupContext = () => { return { validation: this.driver = new group() }; }
    render() { return React.createElement("div", null, this.props.children); } //nikdy nebude mit vizualni podobu
    driver: group;
  }

  //--- GROUP ERROR
  export class GroupError extends flux.DumpComponent<any, IGroupErrorState>{
    constructor(prop, ctx: IGroupContext) {
      super(prop, ctx);
      this.driver = new groupError(ctx ? ctx.validation : null, () => this.setState(this.driver.state));
    }
    driver: groupError;
    static contextTypes = { validation: React.PropTypes.any, [config.ctxPropName]: React.PropTypes.any };
    render() { return getGroupErrorTemplate({ value: this.driver.state.value }); }
  }
  export interface IGroupErrorTemplate { value: string; }
}