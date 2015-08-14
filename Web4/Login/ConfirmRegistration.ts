/// <reference path="../JsLib/jsd/jquery.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/jsd/jsrender.d.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="../JsLib/js/OAuth.ts" />
/// <reference path="../JsLib/js/Validate.ts" />
/// <reference path="Model.ts" />

module Login {

  export class ConfirmRegistrationModel extends loginMode {

    update(completed: () => void ): void {
      var key = LowUtils.parseQuery(location.search)["key"];
      try {
        if (Utils.Empty(key)) throw "Missing Key query par";
        var userId = Utils.byteArrayToLong(LowUtils.DecryptString(key));
        if (Utils.Empty(userId) || userId <= 0) throw "Wrong User id format";
        Pager.ajaxGet(
          Pager.pathType.restServices,
          CmdConfirmRegistration_Type,
          LMStatus.createCmd<CmdConfirmRegistration>(r => { r.lmcomId = userId }),
          //CmdConfirmRegistration_Create(userId),
          () => {
            this.success(CSLocalize('b28146649ad7498cb4109b6b1276fcef', 'Account') + ' ' + CSLocalize('c0b339ea24054072999d990c2e7b8db9', 'was activated.'));
            completed();
          }
          ,
          (errId: CmdLmLoginError, errMsg: string) => {
            this.error(CSLocalize('0262a5d780784acd842bc31bd2800579', 'The e-mail address was not found in the database.') +' '+ errMsg);
            completed();
          }
          );
      } catch (err) {
        this.error(CSLocalize('0cc1324eadf741c4b25f04ad1c8b1917', 'Wrong confirmation page url:') + ' ' + err);
        completed();
        return;
      }
    }

  }

}
 
