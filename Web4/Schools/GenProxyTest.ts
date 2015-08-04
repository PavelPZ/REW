
module proxies {
  export function test_all() {
    var log: Array<string> = [];
    test_login_all(log,() =>
      test_adminGlobal(log,() =>
        test_adminCompany(log,() =>
          test_ProductsAndLicences(log,() =>
            $('#testAll').html(log.join('<br/>'))))));
  }

  //********** ADMIN GLOBAL
  export function test_adminGlobal(log: Array<string>, completed: () => void) {
    log.push(''); log.push('******************************'); log.push('ADMIN GLOBAL');
    proxies.test.testDeleteAll(() =>
      test_adminGlobal_createSystemAdmin_notExist(log,() =>
        test_adminGlobal_createSystemAdmin_exist(log,() =>
          test_adminGlobal_createSystemAdmin_remove(log,() => {
            log.push('');
            proxies.test.testDeleteAll(() =>
              test_adminGlobal_createNewCompany_add(log,() =>
                test_adminGlobal_createNewCompany_remove(log,() =>
                  test_adminGlobal_createNewCompany_add_add(log,() =>
                    test_adminGlobal_getCompaniesAndTheirAdmins(log,() =>
                      test_adminGlobal_createNewCompany_add_remove(log,() =>
                        completed()))))))
          }))));
  }

  export function test_adminGlobal_createSystemAdmin_notExist(log: Array<string>, completed: () => void) {
    proxies.adminglobal.createSystemAdmin("p@p.p", true, email =>
      proxies.dbuser.doRead_data(email, user => {
        log.push("***** systemAdmin, add, not exist"); log.push(JSON.stringify(user));
        test_login_createUser(email, email =>
          proxies.dbuser.doRead_data(email, user =>
            proxies.adminglobal.getSystemAdmins(emails => {
              log.push(JSON.stringify(user));
              log.push(emails.join(','));
              completed();
            })));
      }));
  }

  export function test_adminGlobal_createSystemAdmin_exist(log: Array<string>, completed: () => void) {
    test_login_createUser("p2@p.p", email =>
      proxies.dbuser.doRead_data(email, user => {
        log.push("***** systemAdmin, add, not exist"); log.push(JSON.stringify(user));
        proxies.adminglobal.createSystemAdmin("p2@p.p", true, email =>
          proxies.dbuser.doRead_data(email, user =>
            proxies.adminglobal.getSystemAdmins(emails => {
              log.push(JSON.stringify(user));
              log.push(emails.join(','));
              completed();
            })));
      }));
  }

  export function test_adminGlobal_createSystemAdmin_remove(log: Array<string>, completed: () => void) {
    proxies.adminglobal.createSystemAdmin("p2@p.p", false, email =>
      proxies.dbuser.doRead_data(email, user =>
        proxies.adminglobal.getSystemAdmins(emails => {
          log.push("***** systemAdmin, remove, exist");
          log.push(JSON.stringify(user));
          log.push(emails.join(','));
          completed();
        })));
  }

  export function test_adminGlobal_createNewCompany_add(log: Array<string>, completed: () => void) {
    proxies.adminglobal.createNewCompany("comp1", "p@p.p", true,() =>
      proxies.dbcompany.doRead_user("comp1", comp =>
        proxies.dbuser.doRead_companies("p@p.p", user => {
          log.push("***** mainCompanyAdmin, add");
          log.push("comp1 " + JSON.stringify(comp.usersObj));
          log.push("p@p.p " + JSON.stringify(user.companiesObj));
          completed();
        })));
  }

  export function test_adminGlobal_createNewCompany_remove(log: Array<string>, completed: () => void) {
    proxies.adminglobal.createNewCompany("comp1", "p@p.p", false,() =>
      proxies.dbcompany.doRead_user("comp1", comp =>
        proxies.dbuser.doRead_companies("p@p.p", user => {
          log.push("***** mainCompanyAdmin, remove");
          log.push("comp1 " + JSON.stringify(comp.usersObj));
          log.push("p@p.p " + JSON.stringify(user.companiesObj));
          completed();
        })));
  }

  export function test_adminGlobal_createNewCompany_add_add(log: Array<string>, completed: () => void) {
    proxies.adminglobal.createNewCompany("comp1", "p@p.p", true,() =>
      proxies.adminglobal.createNewCompany("comp1", "p2@p.p", true,() =>
        proxies.dbcompany.doRead_user("comp1", comp =>
          proxies.dbuser.doRead_companies("p@p.p", user1 =>
            proxies.dbuser.doRead_companies("p2@p.p", user2 => {
              log.push("***** mainCompanyAdmin, add, add");
              log.push("comp1 " + JSON.stringify(comp.usersObj));
              log.push("p@p.p " + JSON.stringify(user1.companiesObj));
              log.push("p2@p.p " + JSON.stringify(user2.companiesObj));
              completed();
            })))));
  }

  export function test_adminGlobal_createNewCompany_add_remove(log: Array<string>, completed: () => void) {
    proxies.adminglobal.createNewCompany("comp1", "p@p.p", true,() =>
      proxies.adminglobal.createNewCompany("comp1", "p2@p.p", false,() =>
        proxies.dbcompany.doRead_user("comp1", comp =>
          proxies.dbuser.doRead_companies("p@p.p", user1 =>
            proxies.dbuser.doRead_companies("p2@p.p", user2 => {
              log.push("***** mainCompanyAdmin, add, remove");
              log.push("comp1 " + JSON.stringify(comp.usersObj));
              log.push("p@p.p " + JSON.stringify(user1.companiesObj));
              log.push("p2@p.p " + JSON.stringify(user2.companiesObj));
              completed();
            })))));
  }

  export function test_adminGlobal_getCompaniesAndTheirAdmins(log: Array<string>, completed: () => void) {
    proxies.adminglobal.getCompaniesAndTheirAdmins(res => {
      log.push("***** mainCompanyAdmin, getMainCompanyAdmins");
      log.push(JSON.stringify(res));
      completed();
    });
  }

  //********** ADMIN COMPANY
  export function test_adminCompany(log: Array<string>, completed: () => void) {
    log.push(''); log.push('******************************'); log.push('ADMIN COMPANY');
    proxies.test.testDeleteAll(() =>
      test_adminCompany_createNewCompany_add_remove(log,() =>
        proxies.test.testDeleteAll(() =>
          test_adminCompany_createNewCompany_add_company_system_admin(log,() =>
            test_adminCompany_createNewCompany_remove_company_admin(log,() => {
              log.push('');
              proxies.test.testDeleteAll(() =>
                test_adminCompany_evaluator_add_remove(log,() => {
                  completed();
                }));
            })))));
  }

  export function test_adminCompany_createNewCompany_add_remove(log: Array<string>, completed: () => void) {
    proxies.admincompany.setCompanyUserRoles("comp1", "p@p.p", LMComLib.CompRole.Department | LMComLib.CompRole.Admin,() =>
      proxies.admincompany.setCompanyUserRoles("comp1", "p2@p.p", LMComLib.CompRole.HumanEvalManager,() =>
        proxies.admincompany.getCompanyUserRoles("comp1", res1 =>
          proxies.admincompany.setCompanyUserRoles("comp1", "p2@p.p", 0,() =>
            proxies.admincompany.getCompanyUserRoles("comp1", res2 => {
              log.push("***** otherCompanyAdmins, add, remove");
              log.push(JSON.stringify(res1));
              log.push(JSON.stringify(res2));
              completed();
            })))));
  }

  export function test_adminCompany_createNewCompany_add_company_system_admin(log: Array<string>, completed: () => void) {
    proxies.adminglobal.createNewCompany("comp1", "p@p.p", true,() =>
      proxies.admincompany.setCompanyUserRoles("comp1", "p@p.p", LMComLib.CompRole.Department,() =>
        proxies.admincompany.getCompanyUserRoles("comp1", res1 => {
          log.push("***** otherCompanyAdmins, add company and system admin");
          log.push(JSON.stringify(res1));
          completed();
        })));
  }

  export function test_adminCompany_createNewCompany_remove_company_admin(log: Array<string>, completed: () => void) {
    proxies.admincompany.setCompanyUserRoles("comp1", "p@p.p", 0,() =>
      proxies.admincompany.getCompanyUserRoles("comp1", res1 =>
        proxies.adminglobal.getCompaniesAndTheirAdmins(res2 => {
          log.push("***** otherCompanyAdmins, remove company admin");
          log.push(JSON.stringify(res1));
          log.push(JSON.stringify(res2));
          completed();
        })));
  }

  export function test_adminCompany_evaluator_add_remove(log: Array<string>, completed: () => void) {
    proxies.admincompany.setHumanEvaluator("comp1", "p@p.p", [LMComLib.LineIds.English, LMComLib.LineIds.German],() =>
      proxies.admincompany.getCompanyUserRoles("comp1", res1 =>
        proxies.admincompany.setHumanEvaluator("comp1", "p@p.p", [LMComLib.LineIds.English],() =>
          proxies.admincompany.getCompanyUserRoles("comp1", res2 =>
            proxies.admincompany.setHumanEvaluator("comp1", "p@p.p", [],() =>
              proxies.admincompany.getCompanyUserRoles("comp1", res3 => {
                log.push("***** evaluator: add, remove");
                log.push("ADD: " + JSON.stringify(res1));
                log.push("EDIT: " + JSON.stringify(res2));
                log.push("REMOVE: " + JSON.stringify(res3));
                completed();
              }))))));
  }

  //********** ADMIN PRODUCTS AND LICENCES
  export function test_ProductsAndLicences(log: Array<string>, completed: () => void) {
    log.push(''); log.push('******************************'); log.push('ADMIN PRODUCTS AND LICENCES');
    proxies.test.testDeleteAll(() =>
      test_prodLic_add_products(log,() =>
        test_prodLic_del_products(log,() =>
          proxies.test.testDeleteAll(() =>
            test_prodLic_lic(log, completed)))));
  }

  export function test_prodLic_add_products(log: Array<string>, completed: () => void) {
    proxies.adminglobal.createNewCompany("comp1", "p@p.p", true,() =>
      proxies.adminlicence.createNewProduct("comp1", "/a/b/c/", false, 10, true,() =>
        proxies.adminlicence.createNewProduct("comp1", "/a/b/c/", false, 15, true,() =>
          proxies.adminlicence.createNewProduct("comp1", "/a/b/c/d/", false, 10, true,() =>
            proxies.adminlicence.getAllProductsLicInfo("comp1", res1 =>
              proxies.dbcompany.doRead_licence("comp1", comp => {
                log.push("***** evaluator: add products");
                log.push(JSON.stringify(res1));
                log.push("comp1: " + JSON.stringify(comp));
                completed();
              }))))));
  }

  export function test_prodLic_del_products(log: Array<string>, completed: () => void) {
    proxies.adminlicence.createNewProduct("comp1", "/a/b/c/", null, 10, false,() =>
      proxies.adminlicence.createNewProduct("comp1", "/a/b/c/", null, 15, false,() =>
        proxies.adminlicence.getAllProductsLicInfo("comp1", res1 =>
          proxies.dbcompany.doRead_licence("comp1", comp => {
            log.push("***** evaluator: delete products");
            log.push(JSON.stringify(res1));
            completed();
          }))));
  }

  export function test_prodLic_lic(log: Array<string>, completed: () => void) {
    proxies.adminglobal.createNewCompany("comp1", "p@p.p", true,() =>
      proxies.adminlicence.createNewProduct("comp1", "/a/b/c/", false, 10, true,() =>
        test_login_createUser("p@p.p", email =>
          test_login_createUser("p2@p.p", email =>
            proxies.adminlicence.generateLicenceKeys("comp1", "/a/b/c/", 10, 5, keys1 =>
              proxies.dbcompany.doRead_licence("comp1", comp => {
                log.push('');
                log.push("***** Admin/keyGen.ts, schools/my.ts");
                log.push("***** generateLicenceKeys");
                log.push("comp1.licenceObj=" + JSON.stringify(comp.licenceObj));
                log.push("keys=" + JSON.stringify(keys1));
                proxies.adminlicence.enterLicenceKey("p@p.p", keys1[0].CompShortId, keys1[0].LicId, keys1[0].LicKeyId, res /*0..ok, 1..entered, 2..used*/ =>
                  proxies.dbcompany.doRead_licence("comp1", comp1 =>
                    proxies.dbuser.doRead_data("p@p.p", user =>
                      proxies.adminlicence.enterLicenceKey("p@p.p", keys1[0].CompShortId, keys1[0].LicId, keys1[0].LicKeyId, res2 =>
                        proxies.adminlicence.enterLicenceKey("p2@p.p", keys1[1].CompShortId, keys1[1].LicId, keys1[1].LicKeyId, res3 =>
                          proxies.dbcompany.doRead_licence("comp1", comp2 =>
                            proxies.adminlicence.enterLicenceKey("p@p.p", keys1[1].CompShortId, keys1[1].LicId, keys1[1].LicKeyId, res4 => {
                              log.push("***** enterLicenceKey");
                              log.push("comp1.licenceObj=" + JSON.stringify(comp1.licenceObj));
                              log.push("p@p.p.companiesObj=" + JSON.stringify(user.companiesObj));
                              log.push("The same user: " + res2.toString());
                              log.push("comp1.licenceObj=" + JSON.stringify(comp2.licenceObj));
                              log.push("Other user: " + res4.toString());
                              completed();
                            })))))));
              }))))));
  }

  //********** LOGIN 
  export function test_login_all(log: Array<string>, completed: () => void) {
    log.push(''); log.push('******************************'); log.push('LOGIN');
    proxies.test.testDeleteAll(() =>
      test_login_CreateLmUserStart(log,() =>
        test_login_OnOtherLogin(log,() =>
          test_login_lm_to_google_login(log,() =>
            test_SaveProfile(log,() =>
              test_OnLMLogin(log,() =>
                test_GetPassword(log,() =>
                  test_ChangePassword(log,() =>
                    completed()))))))));
  }
  var encryptedPsw = Utils.encryptStr("psw");
  function test_login_createUser(email: string, completed: (email: string) => void) {
    proxies.login.CreateLmUserStart(encryptedPsw, <any>{ EMail: email }, email => proxies.login.CreateLmUserEnd(email,() => completed(email)));
  }

  export function test_login_CreateLmUserStart(log: Array<string>, completed: () => void) {
    test_login_createUser("p@p.p", email =>
      proxies.dbuser.doRead_data(email, user => {
        log.push('***** CreateLmUserStart'); log.push(JSON.stringify(user));
        completed();
      }));
  }
  export function test_login_OnOtherLogin(log: Array<string>, completed: () => void) {
    proxies.login.OnOtherLogin(LMComLib.OtherType.Google, 'asd asd fas fasd', "p2@p.p", "fm", "lm", cook =>
      proxies.dbuser.doRead_data(cook.EMail, user => {
        log.push('***** OnOtherLogin'); log.push(JSON.stringify(user));
        completed();
      }));
  }
  export function test_login_lm_to_google_login(log: Array<string>, completed: () => void) {
    test_login_createUser("p3@p.p", email =>
      proxies.dbuser.doRead_data(email, user => {
        log.push('***** lm => google login'); log.push(JSON.stringify(user));
        proxies.login.OnOtherLogin(LMComLib.OtherType.Google, 'asd asd fas fasd', "p3@p.p", "fm\"'<>?&\\/.", "lm", cook =>
          proxies.dbuser.doRead_data(email, user => {
            log.push(JSON.stringify(user));
            completed();
          }))
      }));
  }
  export function test_SaveProfile(log: Array<string>, completed: () => void) {
    test_login_createUser("p4@p.p", email =>
      proxies.dbuser.doRead_data(email, user => {
        var cook = user.dataObj; cook.FirstName = 'Modified FirstName';
        proxies.login.SaveProfile(cook,() => {
          proxies.dbuser.doRead_data(email, user => {
            log.push('***** SaveProfile'); log.push(JSON.stringify(user));
            completed();
          });
        })
      }));
  }
  export function test_OnLMLogin(log: Array<string>, completed: () => void) {
    test_login_createUser("p5@p.p", email =>
      proxies.login.OnLMLogin(email, encryptedPsw, cook => {
        log.push('***** OnLMLogin'); log.push(JSON.stringify(cook));
        completed();
      }));
  }
  export function test_GetPassword(log: Array<string>, completed: () => void) {
    test_login_createUser("p6@p.p", email =>
      proxies.login.GetPassword("p6@p.p", psw => {
        log.push('***** GetPassword'); log.push(JSON.stringify(Utils.decryptStr(psw)));
        completed();
      }));
  }
  export function test_ChangePassword(log: Array<string>, completed: () => void) {
    test_login_createUser("p7@p.p", email =>
      proxies.login.ChangePassword("p7@p.p", encryptedPsw, Utils.encryptStr("psw2"), ok =>
        proxies.login.GetPassword("p7@p.p", psw => {
          log.push('***** ChangePassword'); log.push(JSON.stringify(Utils.decryptStr(psw)));
          completed();
        })));
  }
}