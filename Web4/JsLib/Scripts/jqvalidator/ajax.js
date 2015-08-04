$.validator.addMethod('lmajax', function (value, element, param) {
    if (this.optional(element)) {
        return "dependency-mismatch";
    }
    var previous = this.previousValue(element), validator, data;
    if (!this.settings.messages[element.name]) {
        this.settings.messages[element.name] = {};
    }
    previous.originalMessage = this.settings.messages[element.name].remote;
    this.settings.messages[element.name].remote = previous.message;
    param = typeof param === "string" && { url: param } || param;
    if (previous.old === value) {
        return previous.valid;
    }
    previous.old = value;
    validator = this;
    this.startRequest(element);
    data = {};
    data[element.name] = value;
    setTimeout(function () {
        var valid = false, errors, message, submitted;
        validator.settings.messages[element.name].remote = previous.originalMessage;
        if (valid) {
            submitted = validator.formSubmitted;
            validator.prepareElement(element);
            validator.formSubmitted = submitted;
            validator.successList.push(element);
            delete validator.invalid[element.name];
            validator.showErrors();
        }
        else {
            errors = {};
            message = validator.defaultMessage(element, "remote");
            errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
            validator.invalid[element.name] = true;
            validator.showErrors(errors);
        }
        previous.valid = valid;
        validator.stopRequest(element, valid);
    }, 3000);
    //$.ajax($.extend(true, {
    //  url: param,
    //  mode: "abort",
    //  port: "validate" + element.name,
    //  dataType: "json",
    //  data: data,
    //  context: validator.currentForm,
    //  success: function (response) {
    //    var valid = response === true || response === "true",
    //      errors, message, submitted;
    //    validator.settings.messages[element.name].remote = previous.originalMessage;
    //    if (valid) {
    //      submitted = validator.formSubmitted;
    //      validator.prepareElement(element);
    //      validator.formSubmitted = submitted;
    //      validator.successList.push(element);
    //      delete validator.invalid[element.name];
    //      validator.showErrors();
    //    } else {
    //      errors = {};
    //      message = response || validator.defaultMessage(element, "remote");
    //      errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
    //      validator.invalid[element.name] = true;
    //      validator.showErrors(errors);
    //    }
    //    previous.valid = valid;
    //    validator.stopRequest(element, valid);
    //  }
    //}, param));
    return "pending";
});
