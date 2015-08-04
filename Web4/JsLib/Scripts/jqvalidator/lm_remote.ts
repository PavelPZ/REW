module lm_remote {

  export interface params {
    remoteAction: (callback: (res: number) => void) => void;
    message: (errorCode:number, value:string) => void;
  }

  $.validator.addMethod('lm_remote', function (value, element, param: params) {
    if (this.optional(element)) {
      return "dependency-mismatch";
    }

    var previous = this.previousValue(element), validator;

    if (!this.settings.messages[element.name]) this.settings.messages[element.name] = {}; 

    previous.originalMessage = this.settings.messages[element.name].lm_remote;
    this.settings.messages[element.name].lm_remote = previous.message;

    if (previous.old === value) return previous.valid;

    previous.old = value;
    validator = this;
    this.startRequest(element);
    param.remoteAction(res => {
      var valid = res == 0;
      validator.settings.messages[element.name].lm_remote = previous.originalMessage;
      if (valid) {
        var submitted = validator.formSubmitted;
        validator.prepareElement(element);
        validator.formSubmitted = submitted;
        validator.successList.push(element);
        delete validator.invalid[element.name];
        validator.showErrors();
      } else {
        var errors = {};
        errors[element.name] = previous.message = param.message(res, value);
        validator.invalid[element.name] = true;
        validator.showErrors(errors);
      }
      previous.valid = valid;
      validator.stopRequest(element, valid);
    });
    return "pending";
  });
}