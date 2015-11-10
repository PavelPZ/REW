namespace validation {
  export interface IValidation {
    
  }
  export enum types {
    no,
    required = 0x1,
    email = 0x2,
    number = 0x4,
    digits = 0x8,

  }
}