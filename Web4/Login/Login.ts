module Login {

  export class LoginModel extends loginMode {

    update(completed: () => void ): void {
      this.viewModel = _.map(cfg.logins,(pr: LMComLib.OtherType) => <any>(createProvider(pr)));
      //kontrola lowercase pro google etc login
      var path = location.href.split('?')[0].split('#')[0];
      if (Utils.endsWith(path, '.html') && path != path.toLowerCase()) {
        location.href = location.href.toLowerCase();
        location.href = path.toLowerCase() + location.hash;
        return;
      }
      completed();
    }

    call_provider(sender, par: LMComLib.OtherType) {
      if (par == LMComLib.OtherType.LANGMaster) Pager.navigateToHash(getHash(pageLmLogin));
      else if (par == LMComLib.OtherType.LANGMasterNoEMail) Pager.navigateToHash(getHash(pageLmLoginNoEMail));
      else OAuth.authrequest(par);
    }

    cancel() {
      LMStatus.gotoReturnUrl();
    }
    button = Pager.ButtonType.cancel;
  }

  function createProvider(id: LMComLib.OtherType): provider {
    //return { id: id, name: LowUtils.EnumToString(LMComLib.OtherType, id).toLowerCase() };
    return { id: id, name: LowUtils.EnumToString(LMComLib.OtherType, id).toLowerCase() };
  }

  export interface provider {
    id: LMComLib.OtherType;
    name: string;
  }

}

