
module proxies {

  function invoke(url: string, type: string, queryPars: Object, body: string, completed: (res) => void): void {
    var ajaxOption: JQueryAjaxSettings = { type : type, contentType : "application/json" };
    ajaxOption.url = Pager.basicUrl + url; if (queryPars != null) ajaxOption.url += "?" + $.param(queryPars);
    if (body) ajaxOption.data = body;
    $.ajax(ajaxOption).done(data => completed(data)).fail(() => { debugger; Logger.error('proxies.ajax', url, ''); });
  }

  export class admincompany {
    static getCompanyUserRoles(compid: string, completed: (res: {  email: string;  role: LMComLib.CompUserRole;  }[]) => void): void {
		  invoke('admincompany/getcompanyuserroles', 'get', { compid: compid }, null, completed);
	  } 
    static setCompanyUserRoles(compid: string, email: string, role: LMComLib.CompRole, completed: () => void): void {
		  invoke('admincompany/setcompanyuserroles', 'get', { compid: compid, email: email, role: role }, null, completed);
	  } 
    static setHumanEvaluator(compid: string, email: string, lines: LMComLib.LineIds[], completed: () => void): void {
		  invoke('admincompany/sethumanevaluator', 'post', { compid: compid, email: email }, JSON.stringify(lines), completed);
	  } 
   
  };
  export class adminglobal {
    static createSystemAdmin(systemadminemail: string, isadd: boolean, completed: (res: string) => void): void {
		  invoke('adminglobal/createsystemadmin', 'get', { systemadminemail: systemadminemail, isadd: isadd }, null, completed);
	  } 
    static getSystemAdmins(completed: (res: Array<string>) => void): void {
		  invoke('adminglobal/getsystemadmins', 'get', null, null, completed);
	  } 
    static createNewCompany(compid: string, email: string, isadd: boolean, completed: () => void): void {
		  invoke('adminglobal/createnewcompany', 'get', { compid: compid, email: email, isadd: isadd }, null, completed);
	  } 
    static getCompaniesAndTheirAdmins(completed: (res: {  compId: string;  emails: Array<string>;  }[]) => void): void {
		  invoke('adminglobal/getcompaniesandtheiradmins', 'get', null, null, completed);
	  } 
   
  };
  export class adminlicence {
    static createNewProduct(compid: string, prodid: string, istest: boolean, days: number, isadd: boolean, completed: () => void): void {
		  invoke('adminlicence/createnewproduct', 'get', { compid: compid, prodid: prodid, istest: istest, days: days, isadd: isadd }, null, completed);
	  } 
    static getAllProductsLicInfo(compid: string, completed: (res: Admin.CompanyLicences) => void): void {
		  invoke('adminlicence/getallproductslicinfo', 'get', { compid: compid }, null, completed);
	  } 
    static generateLicenceKeys(compid: string, prodid: string, days: number, numofkeys: number, completed: (res: Admin.GenLicKey[]) => void): void {
		  invoke('adminlicence/generatelicencekeys', 'get', { compid: compid, prodid: prodid, days: days, numofkeys: numofkeys }, null, completed);
	  } 
    static enterLicenceKey(email: string, comphash: number, licid: number, keyid: number, completed: (res: number) => void): void {
		  invoke('adminlicence/enterlicencekey', 'get', { email: email, comphash: comphash, licid: licid, keyid: keyid }, null, completed);
	  } 
    static getHomePageData(email: string, completed: () => void): void {
		  invoke('adminlicence/gethomepagedata', 'get', { email: email }, null, completed);
	  } 
   
  };
  export class course {
    static deleteDataKeys(email: string, compid: string, productid: string, testkeyid: number, keys: Array<string>, completed: () => void): void {
		  invoke('course/deletedatakeys', 'post', { email: email, compid: compid, productid: productid, testkeyid: testkeyid }, JSON.stringify(keys), completed);
	  } 
    static getShortProductDatas(email: string, compid: string, productid: string, testkeyid: number, completed: (res: {  shortData: string;  flag: CourseModel.CourseDataFlag;  }[]) => void): void {
		  invoke('course/getshortproductdatas', 'get', { email: email, compid: compid, productid: productid, testkeyid: testkeyid }, null, completed);
	  } 
    static getLongData(email: string, compid: string, productid: string, testkeyid: number, key: string, completed: (res: string) => void): void {
		  invoke('course/getlongdata', 'get', { email: email, compid: compid, productid: productid, testkeyid: testkeyid, key: key }, null, completed);
	  } 
    static saveData(email: string, compid: string, productid: string, testkeyid: number, line: LMComLib.LineIds, datas: {  longData: string;  shortData: string;  flag: CourseModel.CourseDataFlag;  }[], completed: () => void): void {
		  invoke('course/savedata', 'post', { email: email, compid: compid, productid: productid, testkeyid: testkeyid, line: line }, JSON.stringify(datas), completed);
	  } 
   
  };
  export class dbcompany {
    static doRead_user(compid: string, completed: (res: {  compId: string;  metaObj: Admin.CompanyMeta;  licenceObj: Admin.CompanyLicences;  departmentsObj: Admin.DepartmentRoot;  usersObj: Admin.CompanyUsers;  departmentUsageObj: Admin.DepartmentUsages;  }) => void): void {
		  invoke('dbcompany/doread/user', 'get', { compid: compid }, null, completed);
	  } 
    static doRead_meta(compid: string, completed: (res: {  compId: string;  metaObj: Admin.CompanyMeta;  licenceObj: Admin.CompanyLicences;  departmentsObj: Admin.DepartmentRoot;  usersObj: Admin.CompanyUsers;  departmentUsageObj: Admin.DepartmentUsages;  }) => void): void {
		  invoke('dbcompany/doread/meta', 'get', { compid: compid }, null, completed);
	  } 
    static doRead_licence(compid: string, completed: (res: {  compId: string;  metaObj: Admin.CompanyMeta;  licenceObj: Admin.CompanyLicences;  departmentsObj: Admin.DepartmentRoot;  usersObj: Admin.CompanyUsers;  departmentUsageObj: Admin.DepartmentUsages;  }) => void): void {
		  invoke('dbcompany/doread/licence', 'get', { compid: compid }, null, completed);
	  } 
    static doRead_department(compid: string, completed: (res: {  compId: string;  metaObj: Admin.CompanyMeta;  licenceObj: Admin.CompanyLicences;  departmentsObj: Admin.DepartmentRoot;  usersObj: Admin.CompanyUsers;  departmentUsageObj: Admin.DepartmentUsages;  }) => void): void {
		  invoke('dbcompany/doread/department', 'get', { compid: compid }, null, completed);
	  } 
    static doRead_departmentUsage(compid: string, completed: (res: {  compId: string;  metaObj: Admin.CompanyMeta;  licenceObj: Admin.CompanyLicences;  departmentsObj: Admin.DepartmentRoot;  usersObj: Admin.CompanyUsers;  departmentUsageObj: Admin.DepartmentUsages;  }) => void): void {
		  invoke('dbcompany/doread/departmentusage', 'get', { compid: compid }, null, completed);
	  } 
   
  };
  export class dbuser {
    static doRead_data(email: string, completed: (res: {  email: string;  dataObj: LMComLib.LMCookieJS;  companiesObj: Admin.UserCompanies;  }) => void): void {
		  invoke('dbuser/doread/data', 'get', { email: email }, null, completed);
	  } 
    static doRead_companies(email: string, completed: (res: {  email: string;  dataObj: LMComLib.LMCookieJS;  companiesObj: Admin.UserCompanies;  }) => void): void {
		  invoke('dbuser/doread/companies', 'get', { email: email }, null, completed);
	  } 
   
  };
  export class hmaneval {
    static linesToEval(compid: string, completed: (res: {  line: LMComLib.LineIds;  count: number;  }[]) => void): void {
		  invoke('humaneval/getlines', 'get', { compid: compid }, null, completed);
	  } 
    static getTestsToAssign(compid: string, line: LMComLib.LineIds, completed: (res: {  evaluators: {  email: string;  num: number;  }[];  toEvaluateNum: number;  }) => void): void {
		  invoke('humaneval/getteststoassign', 'get', { compid: compid, line: line }, null, completed);
	  } 
    static setTestsToAssign(compid: string, line: LMComLib.LineIds, newtodo: {  email: string;  num: number;  }[], completed: () => void): void {
		  invoke('humaneval/setteststoassign', 'post', { compid: compid, line: line }, JSON.stringify(newtodo), completed);
	  } 
    static getEvaluatorTests(compid: string, evalemail: string, completed: (res: {  email: string;  productId: string;  testKeyId: number;  assigned: number;  }[]) => void): void {
		  invoke('humaneval/getevaluatortests', 'get', { compid: compid, evalemail: evalemail }, null, completed);
	  } 
    static getExerciseFromTest(email: string, compid: string, line: LMComLib.LineIds, productid: string, testkeyid: number, completed: (res: Array<string>) => void): void {
		  invoke('humaneval/getexercisefromtest', 'get', { email: email, compid: compid, line: line, productid: productid, testkeyid: testkeyid }, null, completed);
	  } 
   
  };
  export class login {
    static CreateLmUserStart(password: string, cook: LMComLib.LMCookieJS, completed: (res: string) => void): void {
		  invoke('login/createlmuserstart', 'post', { password: password }, JSON.stringify(cook), completed);
	  } 
    static OnOtherLogin(othertype: LMComLib.OtherType, otherid: string, email: string, firstname: string, lastname: string, completed: (res: LMComLib.LMCookieJS) => void): void {
		  invoke('login/onotherlogin', 'get', { othertype: othertype, otherid: otherid, email: email, firstname: firstname, lastname: lastname }, null, completed);
	  } 
    static CreateLmUserEnd(email: string, completed: () => void): void {
		  invoke('login/createlmuserend', 'get', { email: email }, null, completed);
	  } 
    static ChangePassword(email: string, oldpsw: string, newpsw: string, completed: (res: boolean) => void): void {
		  invoke('login/changepassword', 'get', { email: email, oldpsw: oldpsw, newpsw: newpsw }, null, completed);
	  } 
    static GetPassword(email: string, completed: (res: string) => void): void {
		  invoke('login/getpassword', 'get', { email: email }, null, completed);
	  } 
    static OnLMLogin(email: string, password: string, completed: (res: LMComLib.LMCookieJS) => void): void {
		  invoke('login/onlmlogin', 'get', { email: email, password: password }, null, completed);
	  } 
    static SaveProfile(cook: LMComLib.LMCookieJS, completed: () => void): void {
		  invoke('login/saveprofile', 'post', null, JSON.stringify(cook), completed);
	  } 
   
  };
  export class test {
    static testDeleteAll(completed: () => void): void {
		  invoke('test/testdeleteall', 'get', null, null, completed);
	  } 
   
  };
  export class testme {
    static toEvalLangs(compid: string, completed: (res: {  line: LMComLib.LineIds;  count: number;  }[]) => void): void {
		  invoke('testme/toevallangs', 'post', { compid: compid }, null, completed);
	  } 
   
  };
  export class vyzva57services {
    static lmAdminCreateCompany(companyid: number, companydata: string, completed: () => void): void {
		  invoke('vyzva57services/lmadmincreatecompany', 'post', { companyid: companyid }, JSON.stringify(companydata), completed);
	  } 
    static lmAdminCreateLicenceKeys(companyid: number, requestedkeys: {  line: LMComLib.LineIds;  num: number;  keys: Array<string>;  }[], completed: (res: {  line: LMComLib.LineIds;  num: number;  keys: Array<string>;  }[]) => void): void {
		  invoke('vyzva57services/lmadmincreatelicencekeys', 'post', { companyid: companyid }, JSON.stringify(requestedkeys), completed);
	  } 
    static loadCompanyData(companyid: number, completed: (res: string) => void): void {
		  invoke('vyzva57services/loadcompanydata', 'get', { companyid: companyid }, null, completed);
	  } 
    static writeCompanyData(companyid: number, data: string, completed: () => void): void {
		  invoke('vyzva57services/writecompanydata', 'post', { companyid: companyid }, JSON.stringify(data), completed);
	  } 
    static deleteDataKeys(companyid: number, lmcomid: number, producturl: string, urltaskids: {  url: string;  taskId: string;  }[], completed: () => void): void {
		  invoke('vyzva57services/deletedatakeys', 'post', { companyid: companyid, lmcomid: lmcomid, producturl: producturl }, JSON.stringify(urltaskids), completed);
	  } 
    static getShortProductDatas(companyid: number, lmcomid: number, producturl: string, completed: (res: {  url: string;  taskId: string;  shortData: string;  }[]) => void): void {
		  invoke('vyzva57services/getshortproductdatas', 'get', { companyid: companyid, lmcomid: lmcomid, producturl: producturl }, null, completed);
	  } 
    static getLongData(companyid: number, lmcomid: number, producturl: string, taskid: string, key: string, completed: (res: string) => void): void {
		  invoke('vyzva57services/getlongdata', 'get', { companyid: companyid, lmcomid: lmcomid, producturl: producturl, taskid: taskid, key: key }, null, completed);
	  } 
    static saveUserData(companyid: number, lmcomid: number, producturl: string, data: {  url: string;  taskId: string;  shortData: string;  longData: string;  }[], completed: () => void): void {
		  invoke('vyzva57services/saveuserdata', 'post', { companyid: companyid, lmcomid: lmcomid, producturl: producturl }, JSON.stringify(data), completed);
	  } 
   
  };
}
