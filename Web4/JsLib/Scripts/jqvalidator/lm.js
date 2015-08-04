var lm_JQueryValidator;
(function (lm_JQueryValidator) {
    $.validator.addMethod('lmajax', function (value, element, param) {
        if (this.optional(element)) {
            return "dependency-mismatch";
        }
        var previous = this.previousValue(element), validator;
        if (!this.settings.messages[element.name]) {
            this.settings.messages[element.name] = {};
        }
        previous.originalMessage = this.settings.messages[element.name].remote;
        this.settings.messages[element.name].remote = previous.message;
        if (previous.old === value) {
            return previous.valid;
        }
        previous.old = value;
        validator = this;
        this.startRequest(element);
        param.remoteAction(function (res) {
            var errors, message, submitted;
            var valid = res == 0;
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
        });
        return "pending";
    });
})(lm_JQueryValidator || (lm_JQueryValidator = {}));
