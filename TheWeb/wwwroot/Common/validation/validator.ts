namespace validation {

  export interface IValidPars {
    type: types;
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

  export function validate(validator: IValidPars, st: IInputState) {
    var len = !st.value ? 0 : st.value.length;
    //REQUIRED
    if ((validator.type & types.required) != 0) {
      if (len < 1) { st.error = messages.required(); return; }
    }
    //STRING LENGTH
    if ((validator.type & types.stringLength) != 0) {
      if (validator.minLength && validator.maxLength) {
        if (len < validator.minLength || len > validator.maxLength) { st.error = messages.rangelength(validator.minLength, validator.maxLength); return; }
      } else if (validator.minLength) {
        if (len < validator.minLength) { st.error = messages.minlength(validator.minLength); return; }
      } else if (validator.maxLength) {
        if (len > validator.maxLength) { st.error = messages.maxlength(validator.maxLength); return; }
      }
    }
    //.. with MASK
    var mask: RegExp = null; var error: string;
    if ((validator.type & (types.number | types.numberRange)) != 0) {
      mask = /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;
      error = messages.number();
    } else if ((validator.type & types.digits) != 0) {
      mask = /^\d+$/;
      error = messages.digits();
    } else if ((validator.type & types.email) != 0) {
      mask = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      error = messages.email();
    }
    if (mask) {
      if (len == 0 || !mask.test(st.value)) { st.error = error; return; }
    }
    //NUMBER RANGE
    var defined = v => typeof v != 'undefined';
    if ((validator.type & types.numberRange) != 0) {
      var num = parseFloat(st.value);
      if (defined(validator.min) && defined(validator.max)) {
        if (num < validator.min || num > validator.max) { st.error = messages.range(validator.min, validator.max); return; }
      } else if (defined(validator.min)) {
        if (num < validator.min) { st.error = messages.min(validator.min); return; }
      } else if (defined(validator.max)) {
        if (num > validator.max) { st.error = messages.max(validator.max); return; }
      }
    }
  }

  export var messages = {
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

  export interface IInputState { value: string; blured?: boolean; error?: string; }

}