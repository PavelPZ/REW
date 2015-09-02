var proxies;
(function (proxies) {
    function invoke(url, type, queryPars, body, completed) {
        var ajaxOption = { type: type, contentType: "application/json" };
        ajaxOption.url = Pager.basicUrl + url;
        if (queryPars != null)
            ajaxOption.url += "?" + $.param(queryPars);
        if (body)
            ajaxOption.data = body;
        $.ajax(ajaxOption).done(function (data) { return completed(data); }).fail(function () { debugger; Logger.error('proxies.ajax', url, ''); });
    }
    var admincompany = (function () {
        function admincompany() {
        }
        admincompany.getCompanyUserRoles = function (compid, completed) {
            invoke('admincompany/getcompanyuserroles', 'get', { compid: compid }, null, completed);
        };
        admincompany.setCompanyUserRoles = function (compid, email, role, completed) {
            invoke('admincompany/setcompanyuserroles', 'get', { compid: compid, email: email, role: role }, null, completed);
        };
        admincompany.setHumanEvaluator = function (compid, email, lines, completed) {
            invoke('admincompany/sethumanevaluator', 'post', { compid: compid, email: email }, JSON.stringify(lines), completed);
        };
        return admincompany;
    })();
    proxies.admincompany = admincompany;
    ;
    var adminglobal = (function () {
        function adminglobal() {
        }
        adminglobal.createSystemAdmin = function (systemadminemail, isadd, completed) {
            invoke('adminglobal/createsystemadmin', 'get', { systemadminemail: systemadminemail, isadd: isadd }, null, completed);
        };
        adminglobal.getSystemAdmins = function (completed) {
            invoke('adminglobal/getsystemadmins', 'get', null, null, completed);
        };
        adminglobal.createNewCompany = function (compid, email, isadd, completed) {
            invoke('adminglobal/createnewcompany', 'get', { compid: compid, email: email, isadd: isadd }, null, completed);
        };
        adminglobal.getCompaniesAndTheirAdmins = function (completed) {
            invoke('adminglobal/getcompaniesandtheiradmins', 'get', null, null, completed);
        };
        return adminglobal;
    })();
    proxies.adminglobal = adminglobal;
    ;
    var adminlicence = (function () {
        function adminlicence() {
        }
        adminlicence.createNewProduct = function (compid, prodid, istest, days, isadd, completed) {
            invoke('adminlicence/createnewproduct', 'get', { compid: compid, prodid: prodid, istest: istest, days: days, isadd: isadd }, null, completed);
        };
        adminlicence.getAllProductsLicInfo = function (compid, completed) {
            invoke('adminlicence/getallproductslicinfo', 'get', { compid: compid }, null, completed);
        };
        adminlicence.generateLicenceKeys = function (compid, prodid, days, numofkeys, completed) {
            invoke('adminlicence/generatelicencekeys', 'get', { compid: compid, prodid: prodid, days: days, numofkeys: numofkeys }, null, completed);
        };
        adminlicence.enterLicenceKey = function (email, comphash, licid, keyid, completed) {
            invoke('adminlicence/enterlicencekey', 'get', { email: email, comphash: comphash, licid: licid, keyid: keyid }, null, completed);
        };
        adminlicence.getHomePageData = function (email, completed) {
            invoke('adminlicence/gethomepagedata', 'get', { email: email }, null, completed);
        };
        return adminlicence;
    })();
    proxies.adminlicence = adminlicence;
    ;
    var course = (function () {
        function course() {
        }
        course.deleteDataKeys = function (email, compid, productid, testkeyid, keys, completed) {
            invoke('course/deletedatakeys', 'post', { email: email, compid: compid, productid: productid, testkeyid: testkeyid }, JSON.stringify(keys), completed);
        };
        course.getShortProductDatas = function (email, compid, productid, testkeyid, completed) {
            invoke('course/getshortproductdatas', 'get', { email: email, compid: compid, productid: productid, testkeyid: testkeyid }, null, completed);
        };
        course.getLongData = function (email, compid, productid, testkeyid, key, completed) {
            invoke('course/getlongdata', 'get', { email: email, compid: compid, productid: productid, testkeyid: testkeyid, key: key }, null, completed);
        };
        course.saveData = function (email, compid, productid, testkeyid, line, datas, completed) {
            invoke('course/savedata', 'post', { email: email, compid: compid, productid: productid, testkeyid: testkeyid, line: line }, JSON.stringify(datas), completed);
        };
        return course;
    })();
    proxies.course = course;
    ;
    var dbcompany = (function () {
        function dbcompany() {
        }
        dbcompany.doRead_user = function (compid, completed) {
            invoke('dbcompany/doread/user', 'get', { compid: compid }, null, completed);
        };
        dbcompany.doRead_meta = function (compid, completed) {
            invoke('dbcompany/doread/meta', 'get', { compid: compid }, null, completed);
        };
        dbcompany.doRead_licence = function (compid, completed) {
            invoke('dbcompany/doread/licence', 'get', { compid: compid }, null, completed);
        };
        dbcompany.doRead_department = function (compid, completed) {
            invoke('dbcompany/doread/department', 'get', { compid: compid }, null, completed);
        };
        dbcompany.doRead_departmentUsage = function (compid, completed) {
            invoke('dbcompany/doread/departmentusage', 'get', { compid: compid }, null, completed);
        };
        return dbcompany;
    })();
    proxies.dbcompany = dbcompany;
    ;
    var dbuser = (function () {
        function dbuser() {
        }
        dbuser.doRead_data = function (email, completed) {
            invoke('dbuser/doread/data', 'get', { email: email }, null, completed);
        };
        dbuser.doRead_companies = function (email, completed) {
            invoke('dbuser/doread/companies', 'get', { email: email }, null, completed);
        };
        return dbuser;
    })();
    proxies.dbuser = dbuser;
    ;
    var hmaneval = (function () {
        function hmaneval() {
        }
        hmaneval.linesToEval = function (compid, completed) {
            invoke('humaneval/getlines', 'get', { compid: compid }, null, completed);
        };
        hmaneval.getTestsToAssign = function (compid, line, completed) {
            invoke('humaneval/getteststoassign', 'get', { compid: compid, line: line }, null, completed);
        };
        hmaneval.setTestsToAssign = function (compid, line, newtodo, completed) {
            invoke('humaneval/setteststoassign', 'post', { compid: compid, line: line }, JSON.stringify(newtodo), completed);
        };
        hmaneval.getEvaluatorTests = function (compid, evalemail, completed) {
            invoke('humaneval/getevaluatortests', 'get', { compid: compid, evalemail: evalemail }, null, completed);
        };
        hmaneval.getExerciseFromTest = function (email, compid, line, productid, testkeyid, completed) {
            invoke('humaneval/getexercisefromtest', 'get', { email: email, compid: compid, line: line, productid: productid, testkeyid: testkeyid }, null, completed);
        };
        return hmaneval;
    })();
    proxies.hmaneval = hmaneval;
    ;
    var login = (function () {
        function login() {
        }
        login.CreateLmUserStart = function (password, cook, completed) {
            invoke('login/createlmuserstart', 'post', { password: password }, JSON.stringify(cook), completed);
        };
        login.OnOtherLogin = function (othertype, otherid, email, firstname, lastname, completed) {
            invoke('login/onotherlogin', 'get', { othertype: othertype, otherid: otherid, email: email, firstname: firstname, lastname: lastname }, null, completed);
        };
        login.CreateLmUserEnd = function (email, completed) {
            invoke('login/createlmuserend', 'get', { email: email }, null, completed);
        };
        login.ChangePassword = function (email, oldpsw, newpsw, completed) {
            invoke('login/changepassword', 'get', { email: email, oldpsw: oldpsw, newpsw: newpsw }, null, completed);
        };
        login.GetPassword = function (email, completed) {
            invoke('login/getpassword', 'get', { email: email }, null, completed);
        };
        login.OnLMLogin = function (email, password, completed) {
            invoke('login/onlmlogin', 'get', { email: email, password: password }, null, completed);
        };
        login.SaveProfile = function (cook, completed) {
            invoke('login/saveprofile', 'post', null, JSON.stringify(cook), completed);
        };
        return login;
    })();
    proxies.login = login;
    ;
    var test = (function () {
        function test() {
        }
        test.testDeleteAll = function (completed) {
            invoke('test/testdeleteall', 'get', null, null, completed);
        };
        return test;
    })();
    proxies.test = test;
    ;
    var testme = (function () {
        function testme() {
        }
        testme.toEvalLangs = function (compid, completed) {
            invoke('testme/toevallangs', 'post', { compid: compid }, null, completed);
        };
        return testme;
    })();
    proxies.testme = testme;
    ;
    var vyzva57services = (function () {
        function vyzva57services() {
        }
        vyzva57services.lmAdminCreateCompany = function (companyid, companydata, completed) {
            invoke('vyzva57services/lmadmincreatecompany', 'post', { companyid: companyid }, JSON.stringify(companydata), completed);
        };
        vyzva57services.lmAdminCreateLicenceKeys = function (companyid, requestedkeys, completed) {
            invoke('vyzva57services/lmadmincreatelicencekeys', 'post', { companyid: companyid }, JSON.stringify(requestedkeys), completed);
        };
        vyzva57services.loadCompanyData = function (companyid, completed) {
            invoke('vyzva57services/loadcompanydata', 'get', { companyid: companyid }, null, completed);
        };
        vyzva57services.writeCompanyData = function (companyid, data, completed) {
            invoke('vyzva57services/writecompanydata', 'post', { companyid: companyid }, JSON.stringify(data), completed);
        };
        vyzva57services.deleteDataKeys = function (companyid, lmcomid, producturl, urltaskids, completed) {
            invoke('vyzva57services/deletedatakeys', 'post', { companyid: companyid, lmcomid: lmcomid, producturl: producturl }, JSON.stringify(urltaskids), completed);
        };
        vyzva57services.getShortProductDatas = function (companyid, lmcomid, producturl, completed) {
            invoke('vyzva57services/getshortproductdatas', 'get', { companyid: companyid, lmcomid: lmcomid, producturl: producturl }, null, completed);
        };
        vyzva57services.getLongData = function (companyid, lmcomid, producturl, taskid, key, completed) {
            invoke('vyzva57services/getlongdata', 'get', { companyid: companyid, lmcomid: lmcomid, producturl: producturl, taskid: taskid, key: key }, null, completed);
        };
        vyzva57services.debugClearProduct = function (companyid, lmcomid, producturl, completed) {
            invoke('vyzva57services/debugclearproduct', 'get', { companyid: companyid, lmcomid: lmcomid, producturl: producturl }, null, completed);
        };
        vyzva57services.saveUserData = function (companyid, lmcomid, producturl, data, completed) {
            invoke('vyzva57services/saveuserdata', 'post', { companyid: companyid, lmcomid: lmcomid, producturl: producturl }, JSON.stringify(data), completed);
        };
        return vyzva57services;
    })();
    proxies.vyzva57services = vyzva57services;
    ;
})(proxies || (proxies = {}));
