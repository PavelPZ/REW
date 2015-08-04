var proxies;
(function (proxies) {
    function test_all() {
        var log = [];
        test_login_all(log, function () {
            return test_adminGlobal(log, function () {
                return test_adminCompany(log, function () {
                    return test_ProductsAndLicences(log, function () {
                        return $('#testAll').html(log.join('<br/>'));
                    });
                });
            });
        });
    }
    proxies.test_all = test_all;
    //********** ADMIN GLOBAL
    function test_adminGlobal(log, completed) {
        log.push('');
        log.push('******************************');
        log.push('ADMIN GLOBAL');
        proxies.test.testDeleteAll(function () {
            return test_adminGlobal_createSystemAdmin_notExist(log, function () {
                return test_adminGlobal_createSystemAdmin_exist(log, function () {
                    return test_adminGlobal_createSystemAdmin_remove(log, function () {
                        log.push('');
                        proxies.test.testDeleteAll(function () {
                            return test_adminGlobal_createNewCompany_add(log, function () {
                                return test_adminGlobal_createNewCompany_remove(log, function () {
                                    return test_adminGlobal_createNewCompany_add_add(log, function () {
                                        return test_adminGlobal_getCompaniesAndTheirAdmins(log, function () {
                                            return test_adminGlobal_createNewCompany_add_remove(log, function () {
                                                return completed();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }
    proxies.test_adminGlobal = test_adminGlobal;
    function test_adminGlobal_createSystemAdmin_notExist(log, completed) {
        proxies.adminglobal.createSystemAdmin("p@p.p", true, function (email) {
            return proxies.dbuser.doRead_data(email, function (user) {
                log.push("***** systemAdmin, add, not exist");
                log.push(JSON.stringify(user));
                test_login_createUser(email, function (email) {
                    return proxies.dbuser.doRead_data(email, function (user) {
                        return proxies.adminglobal.getSystemAdmins(function (emails) {
                            log.push(JSON.stringify(user));
                            log.push(emails.join(','));
                            completed();
                        });
                    });
                });
            });
        });
    }
    proxies.test_adminGlobal_createSystemAdmin_notExist = test_adminGlobal_createSystemAdmin_notExist;
    function test_adminGlobal_createSystemAdmin_exist(log, completed) {
        test_login_createUser("p2@p.p", function (email) {
            return proxies.dbuser.doRead_data(email, function (user) {
                log.push("***** systemAdmin, add, not exist");
                log.push(JSON.stringify(user));
                proxies.adminglobal.createSystemAdmin("p2@p.p", true, function (email) {
                    return proxies.dbuser.doRead_data(email, function (user) {
                        return proxies.adminglobal.getSystemAdmins(function (emails) {
                            log.push(JSON.stringify(user));
                            log.push(emails.join(','));
                            completed();
                        });
                    });
                });
            });
        });
    }
    proxies.test_adminGlobal_createSystemAdmin_exist = test_adminGlobal_createSystemAdmin_exist;
    function test_adminGlobal_createSystemAdmin_remove(log, completed) {
        proxies.adminglobal.createSystemAdmin("p2@p.p", false, function (email) {
            return proxies.dbuser.doRead_data(email, function (user) {
                return proxies.adminglobal.getSystemAdmins(function (emails) {
                    log.push("***** systemAdmin, remove, exist");
                    log.push(JSON.stringify(user));
                    log.push(emails.join(','));
                    completed();
                });
            });
        });
    }
    proxies.test_adminGlobal_createSystemAdmin_remove = test_adminGlobal_createSystemAdmin_remove;
    function test_adminGlobal_createNewCompany_add(log, completed) {
        proxies.adminglobal.createNewCompany("comp1", "p@p.p", true, function () {
            return proxies.dbcompany.doRead_user("comp1", function (comp) {
                return proxies.dbuser.doRead_companies("p@p.p", function (user) {
                    log.push("***** mainCompanyAdmin, add");
                    log.push("comp1 " + JSON.stringify(comp.usersObj));
                    log.push("p@p.p " + JSON.stringify(user.companiesObj));
                    completed();
                });
            });
        });
    }
    proxies.test_adminGlobal_createNewCompany_add = test_adminGlobal_createNewCompany_add;
    function test_adminGlobal_createNewCompany_remove(log, completed) {
        proxies.adminglobal.createNewCompany("comp1", "p@p.p", false, function () {
            return proxies.dbcompany.doRead_user("comp1", function (comp) {
                return proxies.dbuser.doRead_companies("p@p.p", function (user) {
                    log.push("***** mainCompanyAdmin, remove");
                    log.push("comp1 " + JSON.stringify(comp.usersObj));
                    log.push("p@p.p " + JSON.stringify(user.companiesObj));
                    completed();
                });
            });
        });
    }
    proxies.test_adminGlobal_createNewCompany_remove = test_adminGlobal_createNewCompany_remove;
    function test_adminGlobal_createNewCompany_add_add(log, completed) {
        proxies.adminglobal.createNewCompany("comp1", "p@p.p", true, function () {
            return proxies.adminglobal.createNewCompany("comp1", "p2@p.p", true, function () {
                return proxies.dbcompany.doRead_user("comp1", function (comp) {
                    return proxies.dbuser.doRead_companies("p@p.p", function (user1) {
                        return proxies.dbuser.doRead_companies("p2@p.p", function (user2) {
                            log.push("***** mainCompanyAdmin, add, add");
                            log.push("comp1 " + JSON.stringify(comp.usersObj));
                            log.push("p@p.p " + JSON.stringify(user1.companiesObj));
                            log.push("p2@p.p " + JSON.stringify(user2.companiesObj));
                            completed();
                        });
                    });
                });
            });
        });
    }
    proxies.test_adminGlobal_createNewCompany_add_add = test_adminGlobal_createNewCompany_add_add;
    function test_adminGlobal_createNewCompany_add_remove(log, completed) {
        proxies.adminglobal.createNewCompany("comp1", "p@p.p", true, function () {
            return proxies.adminglobal.createNewCompany("comp1", "p2@p.p", false, function () {
                return proxies.dbcompany.doRead_user("comp1", function (comp) {
                    return proxies.dbuser.doRead_companies("p@p.p", function (user1) {
                        return proxies.dbuser.doRead_companies("p2@p.p", function (user2) {
                            log.push("***** mainCompanyAdmin, add, remove");
                            log.push("comp1 " + JSON.stringify(comp.usersObj));
                            log.push("p@p.p " + JSON.stringify(user1.companiesObj));
                            log.push("p2@p.p " + JSON.stringify(user2.companiesObj));
                            completed();
                        });
                    });
                });
            });
        });
    }
    proxies.test_adminGlobal_createNewCompany_add_remove = test_adminGlobal_createNewCompany_add_remove;
    function test_adminGlobal_getCompaniesAndTheirAdmins(log, completed) {
        proxies.adminglobal.getCompaniesAndTheirAdmins(function (res) {
            log.push("***** mainCompanyAdmin, getMainCompanyAdmins");
            log.push(JSON.stringify(res));
            completed();
        });
    }
    proxies.test_adminGlobal_getCompaniesAndTheirAdmins = test_adminGlobal_getCompaniesAndTheirAdmins;
    //********** ADMIN COMPANY
    function test_adminCompany(log, completed) {
        log.push('');
        log.push('******************************');
        log.push('ADMIN COMPANY');
        proxies.test.testDeleteAll(function () {
            return test_adminCompany_createNewCompany_add_remove(log, function () {
                return proxies.test.testDeleteAll(function () {
                    return test_adminCompany_createNewCompany_add_company_system_admin(log, function () {
                        return test_adminCompany_createNewCompany_remove_company_admin(log, function () {
                            log.push('');
                            proxies.test.testDeleteAll(function () {
                                return test_adminCompany_evaluator_add_remove(log, function () {
                                    completed();
                                });
                            });
                        });
                    });
                });
            });
        });
    }
    proxies.test_adminCompany = test_adminCompany;
    function test_adminCompany_createNewCompany_add_remove(log, completed) {
        proxies.admincompany.setCompanyUserRoles("comp1", "p@p.p", LMComLib.CompRole.Department | LMComLib.CompRole.Admin, function () {
            return proxies.admincompany.setCompanyUserRoles("comp1", "p2@p.p", LMComLib.CompRole.HumanEvalManager, function () {
                return proxies.admincompany.getCompanyUserRoles("comp1", function (res1) {
                    return proxies.admincompany.setCompanyUserRoles("comp1", "p2@p.p", 0, function () {
                        return proxies.admincompany.getCompanyUserRoles("comp1", function (res2) {
                            log.push("***** otherCompanyAdmins, add, remove");
                            log.push(JSON.stringify(res1));
                            log.push(JSON.stringify(res2));
                            completed();
                        });
                    });
                });
            });
        });
    }
    proxies.test_adminCompany_createNewCompany_add_remove = test_adminCompany_createNewCompany_add_remove;
    function test_adminCompany_createNewCompany_add_company_system_admin(log, completed) {
        proxies.adminglobal.createNewCompany("comp1", "p@p.p", true, function () {
            return proxies.admincompany.setCompanyUserRoles("comp1", "p@p.p", LMComLib.CompRole.Department, function () {
                return proxies.admincompany.getCompanyUserRoles("comp1", function (res1) {
                    log.push("***** otherCompanyAdmins, add company and system admin");
                    log.push(JSON.stringify(res1));
                    completed();
                });
            });
        });
    }
    proxies.test_adminCompany_createNewCompany_add_company_system_admin = test_adminCompany_createNewCompany_add_company_system_admin;
    function test_adminCompany_createNewCompany_remove_company_admin(log, completed) {
        proxies.admincompany.setCompanyUserRoles("comp1", "p@p.p", 0, function () {
            return proxies.admincompany.getCompanyUserRoles("comp1", function (res1) {
                return proxies.adminglobal.getCompaniesAndTheirAdmins(function (res2) {
                    log.push("***** otherCompanyAdmins, remove company admin");
                    log.push(JSON.stringify(res1));
                    log.push(JSON.stringify(res2));
                    completed();
                });
            });
        });
    }
    proxies.test_adminCompany_createNewCompany_remove_company_admin = test_adminCompany_createNewCompany_remove_company_admin;
    function test_adminCompany_evaluator_add_remove(log, completed) {
        proxies.admincompany.setHumanEvaluator("comp1", "p@p.p", [LMComLib.LineIds.English, LMComLib.LineIds.German], function () {
            return proxies.admincompany.getCompanyUserRoles("comp1", function (res1) {
                return proxies.admincompany.setHumanEvaluator("comp1", "p@p.p", [LMComLib.LineIds.English], function () {
                    return proxies.admincompany.getCompanyUserRoles("comp1", function (res2) {
                        return proxies.admincompany.setHumanEvaluator("comp1", "p@p.p", [], function () {
                            return proxies.admincompany.getCompanyUserRoles("comp1", function (res3) {
                                log.push("***** evaluator: add, remove");
                                log.push("ADD: " + JSON.stringify(res1));
                                log.push("EDIT: " + JSON.stringify(res2));
                                log.push("REMOVE: " + JSON.stringify(res3));
                                completed();
                            });
                        });
                    });
                });
            });
        });
    }
    proxies.test_adminCompany_evaluator_add_remove = test_adminCompany_evaluator_add_remove;
    //********** ADMIN PRODUCTS AND LICENCES
    function test_ProductsAndLicences(log, completed) {
        log.push('');
        log.push('******************************');
        log.push('ADMIN PRODUCTS AND LICENCES');
        proxies.test.testDeleteAll(function () {
            return test_prodLic_add_products(log, function () {
                return test_prodLic_del_products(log, function () {
                    return proxies.test.testDeleteAll(function () {
                        return test_prodLic_lic(log, completed);
                    });
                });
            });
        });
    }
    proxies.test_ProductsAndLicences = test_ProductsAndLicences;
    function test_prodLic_add_products(log, completed) {
        proxies.adminglobal.createNewCompany("comp1", "p@p.p", true, function () {
            return proxies.adminlicence.createNewProduct("comp1", "/a/b/c/", false, 10, true, function () {
                return proxies.adminlicence.createNewProduct("comp1", "/a/b/c/", false, 15, true, function () {
                    return proxies.adminlicence.createNewProduct("comp1", "/a/b/c/d/", false, 10, true, function () {
                        return proxies.adminlicence.getAllProductsLicInfo("comp1", function (res1) {
                            return proxies.dbcompany.doRead_licence("comp1", function (comp) {
                                log.push("***** evaluator: add products");
                                log.push(JSON.stringify(res1));
                                log.push("comp1: " + JSON.stringify(comp));
                                completed();
                            });
                        });
                    });
                });
            });
        });
    }
    proxies.test_prodLic_add_products = test_prodLic_add_products;
    function test_prodLic_del_products(log, completed) {
        proxies.adminlicence.createNewProduct("comp1", "/a/b/c/", null, 10, false, function () {
            return proxies.adminlicence.createNewProduct("comp1", "/a/b/c/", null, 15, false, function () {
                return proxies.adminlicence.getAllProductsLicInfo("comp1", function (res1) {
                    return proxies.dbcompany.doRead_licence("comp1", function (comp) {
                        log.push("***** evaluator: delete products");
                        log.push(JSON.stringify(res1));
                        completed();
                    });
                });
            });
        });
    }
    proxies.test_prodLic_del_products = test_prodLic_del_products;
    function test_prodLic_lic(log, completed) {
        proxies.adminglobal.createNewCompany("comp1", "p@p.p", true, function () {
            return proxies.adminlicence.createNewProduct("comp1", "/a/b/c/", false, 10, true, function () {
                return test_login_createUser("p@p.p", function (email) {
                    return test_login_createUser("p2@p.p", function (email) {
                        return proxies.adminlicence.generateLicenceKeys("comp1", "/a/b/c/", 10, 5, function (keys1) {
                            return proxies.dbcompany.doRead_licence("comp1", function (comp) {
                                log.push('');
                                log.push("***** Admin/keyGen.ts, schools/my.ts");
                                log.push("***** generateLicenceKeys");
                                log.push("comp1.licenceObj=" + JSON.stringify(comp.licenceObj));
                                log.push("keys=" + JSON.stringify(keys1));
                                proxies.adminlicence.enterLicenceKey("p@p.p", keys1[0].CompShortId, keys1[0].LicId, keys1[0].LicKeyId, function (res /*0..ok, 1..entered, 2..used*/) {
                                    return proxies.dbcompany.doRead_licence("comp1", function (comp1) {
                                        return proxies.dbuser.doRead_data("p@p.p", function (user) {
                                            return proxies.adminlicence.enterLicenceKey("p@p.p", keys1[0].CompShortId, keys1[0].LicId, keys1[0].LicKeyId, function (res2) {
                                                return proxies.adminlicence.enterLicenceKey("p2@p.p", keys1[1].CompShortId, keys1[1].LicId, keys1[1].LicKeyId, function (res3) {
                                                    return proxies.dbcompany.doRead_licence("comp1", function (comp2) {
                                                        return proxies.adminlicence.enterLicenceKey("p@p.p", keys1[1].CompShortId, keys1[1].LicId, keys1[1].LicKeyId, function (res4) {
                                                            log.push("***** enterLicenceKey");
                                                            log.push("comp1.licenceObj=" + JSON.stringify(comp1.licenceObj));
                                                            log.push("p@p.p.companiesObj=" + JSON.stringify(user.companiesObj));
                                                            log.push("The same user: " + res2.toString());
                                                            log.push("comp1.licenceObj=" + JSON.stringify(comp2.licenceObj));
                                                            log.push("Other user: " + res4.toString());
                                                            completed();
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }
    proxies.test_prodLic_lic = test_prodLic_lic;
    //********** LOGIN 
    function test_login_all(log, completed) {
        log.push('');
        log.push('******************************');
        log.push('LOGIN');
        proxies.test.testDeleteAll(function () {
            return test_login_CreateLmUserStart(log, function () {
                return test_login_OnOtherLogin(log, function () {
                    return test_login_lm_to_google_login(log, function () {
                        return test_SaveProfile(log, function () {
                            return test_OnLMLogin(log, function () {
                                return test_GetPassword(log, function () {
                                    return test_ChangePassword(log, function () {
                                        return completed();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }
    proxies.test_login_all = test_login_all;
    var encryptedPsw = Utils.encryptStr("psw");
    function test_login_createUser(email, completed) {
        proxies.login.CreateLmUserStart(encryptedPsw, { EMail: email }, function (email) { return proxies.login.CreateLmUserEnd(email, function () { return completed(email); }); });
    }
    function test_login_CreateLmUserStart(log, completed) {
        test_login_createUser("p@p.p", function (email) {
            return proxies.dbuser.doRead_data(email, function (user) {
                log.push('***** CreateLmUserStart');
                log.push(JSON.stringify(user));
                completed();
            });
        });
    }
    proxies.test_login_CreateLmUserStart = test_login_CreateLmUserStart;
    function test_login_OnOtherLogin(log, completed) {
        proxies.login.OnOtherLogin(LMComLib.OtherType.Google, 'asd asd fas fasd', "p2@p.p", "fm", "lm", function (cook) {
            return proxies.dbuser.doRead_data(cook.EMail, function (user) {
                log.push('***** OnOtherLogin');
                log.push(JSON.stringify(user));
                completed();
            });
        });
    }
    proxies.test_login_OnOtherLogin = test_login_OnOtherLogin;
    function test_login_lm_to_google_login(log, completed) {
        test_login_createUser("p3@p.p", function (email) {
            return proxies.dbuser.doRead_data(email, function (user) {
                log.push('***** lm => google login');
                log.push(JSON.stringify(user));
                proxies.login.OnOtherLogin(LMComLib.OtherType.Google, 'asd asd fas fasd', "p3@p.p", "fm\"'<>?&\\/.", "lm", function (cook) {
                    return proxies.dbuser.doRead_data(email, function (user) {
                        log.push(JSON.stringify(user));
                        completed();
                    });
                });
            });
        });
    }
    proxies.test_login_lm_to_google_login = test_login_lm_to_google_login;
    function test_SaveProfile(log, completed) {
        test_login_createUser("p4@p.p", function (email) {
            return proxies.dbuser.doRead_data(email, function (user) {
                var cook = user.dataObj;
                cook.FirstName = 'Modified FirstName';
                proxies.login.SaveProfile(cook, function () {
                    proxies.dbuser.doRead_data(email, function (user) {
                        log.push('***** SaveProfile');
                        log.push(JSON.stringify(user));
                        completed();
                    });
                });
            });
        });
    }
    proxies.test_SaveProfile = test_SaveProfile;
    function test_OnLMLogin(log, completed) {
        test_login_createUser("p5@p.p", function (email) {
            return proxies.login.OnLMLogin(email, encryptedPsw, function (cook) {
                log.push('***** OnLMLogin');
                log.push(JSON.stringify(cook));
                completed();
            });
        });
    }
    proxies.test_OnLMLogin = test_OnLMLogin;
    function test_GetPassword(log, completed) {
        test_login_createUser("p6@p.p", function (email) {
            return proxies.login.GetPassword("p6@p.p", function (psw) {
                log.push('***** GetPassword');
                log.push(JSON.stringify(Utils.decryptStr(psw)));
                completed();
            });
        });
    }
    proxies.test_GetPassword = test_GetPassword;
    function test_ChangePassword(log, completed) {
        test_login_createUser("p7@p.p", function (email) {
            return proxies.login.ChangePassword("p7@p.p", encryptedPsw, Utils.encryptStr("psw2"), function (ok) {
                return proxies.login.GetPassword("p7@p.p", function (psw) {
                    log.push('***** ChangePassword');
                    log.push(JSON.stringify(Utils.decryptStr(psw)));
                    completed();
                });
            });
        });
    }
    proxies.test_ChangePassword = test_ChangePassword;
})(proxies || (proxies = {}));
