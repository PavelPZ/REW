
module proxies {

  function invoke(url: string, type: string, queryPars: Object, body: string, completed: (res) => void): void {
    var ajaxOption: JQueryAjaxSettings = { type : type, contentType : "application/json" };
    ajaxOption.url = Pager.basicUrl + url; if (queryPars != null) ajaxOption.url += "?" + $.param(queryPars);
    if (body) ajaxOption.data = body;
    $.ajax(ajaxOption).done(data => completed(data)).fail(() => { debugger; Logger.error('proxies.ajax', url, ''); });
  }

  export class vyzva57services {
    static lmAdminSendOrder(jsonorder: string, completed: () => void): void {
		  invoke('vyzva57services/lmadminsendorder', 'post', null, JSON.stringify(jsonorder), completed);
	  } 
    static lmLectorExportInfoToXml(completed: () => void): void {
		  invoke('vyzva57services/lmlectorexportinfotoxml', 'get', null, null, completed);
	  } 
    static lmAdminCreateCompany(companyid: number, companydata: string, completed: () => void): void {
		  invoke('vyzva57services/lmadmincreatecompany', 'post', { companyid: companyid }, JSON.stringify(companydata), completed);
	  } 
    static lmAdminCreateLicenceKeys(companyid: number, requestedkeys: {  line: LMComLib.LineIds;  num: number;  keys: Array<string>;  }[], completed: (res: {  line: LMComLib.LineIds;  num: number;  keys: Array<string>;  }[]) => void): void {
		  invoke('vyzva57services/lmadmincreatelicencekeys', 'post', { companyid: companyid }, JSON.stringify(requestedkeys), completed);
	  } 
    static lmAdminCreateSingleLicenceKey(companyid: number, prodid: string, completed: (res: string) => void): void {
		  invoke('vyzva57services/lmadmincreatesinglelicencekey', 'post', { companyid: companyid, prodid: prodid }, null, completed);
	  } 
    static loadCompanyData(companyid: number, completed: (res: string) => void): void {
		  invoke('vyzva57services/loadcompanydata', 'get', { companyid: companyid }, null, completed);
	  } 
    static writeCompanyData(companyid: number, data: string, completed: () => void): void {
		  invoke('vyzva57services/writecompanydata', 'post', { companyid: companyid }, JSON.stringify(data), completed);
	  } 
    static reports(reportpar: string, completed: (res: Array<number>) => void): void {
		  invoke('vyzva57services/reports', 'get', { reportpar: reportpar }, null, completed);
	  } 
    static writeUs(jsondata: string, completed: () => void): void {
		  invoke('vyzva57services/writeus', 'post', null, JSON.stringify(jsondata), completed);
	  } 
    static authorGetExJsonML(url: string, completed: (res: string) => void): void {
		  invoke('vyzva57services/authorgetexjsonml', 'get', { url: url }, null, completed);
	  } 
    static createEmptyCompany(companytitle: string, completed: (res: {  licId: number;  licCounter: number;  }) => void): void {
		  invoke('vyzva57services/createemptycompany', 'get', { companytitle: companytitle }, null, completed);
	  } 
    static keysFromCompanyTitle(companytitle: string, completed: (res: {  student: {  licId: number;  licCounter: number;  lmcomId: number;  email: string;  firstName: string;  lastName: string;  };  teacher: {  licId: number;  licCounter: number;  lmcomId: number;  email: string;  firstName: string;  lastName: string;  };  studentDe: {  licId: number;  licCounter: number;  lmcomId: number;  email: string;  firstName: string;  lastName: string;  };  teacherDe: {  licId: number;  licCounter: number;  lmcomId: number;  email: string;  firstName: string;  lastName: string;  };  admin: {  licId: number;  licCounter: number;  lmcomId: number;  email: string;  firstName: string;  lastName: string;  };  companyTitle: string;  newCompanyId: number;  masterLicId: number;  masterLLicCounter: number;  }) => void): void {
		  invoke('vyzva57services/keysfromcompanytitle', 'get', { companytitle: companytitle }, null, completed);
	  } 
    static runDemoInformation(companylicenceid: number, counter: number, completed: (res: {  email: string;  firstName: string;  lastName: string;  companyId: number;  productUrl: string;  lmcomId: number;  licKeys: Array<string>;  otherType: LMComLib.OtherType;  }) => void): void {
		  invoke('vyzva57services/rundemoinformation', 'get', { companylicenceid: companylicenceid, counter: counter }, null, completed);
	  } 
    static deleteProduct(companyid: number, lmcomid: number, producturl: string, taskid: string, completed: () => void): void {
		  invoke('vyzva57services/deleteproduct', 'post', { companyid: companyid, lmcomid: lmcomid, producturl: producturl, taskid: taskid }, null, completed);
	  } 
    static getShortProductDatas(companyid: number, lmcomid: number, producturl: string, completed: (res: {  url: string;  taskId: string;  shortData: string;  }[]) => void): void {
		  invoke('vyzva57services/getshortproductdatas', 'get', { companyid: companyid, lmcomid: lmcomid, producturl: producturl }, null, completed);
	  } 
    static getLongData(companyid: number, lmcomid: number, producturl: string, taskid: string, key: string, completed: (res: string) => void): void {
		  invoke('vyzva57services/getlongdata', 'get', { companyid: companyid, lmcomid: lmcomid, producturl: producturl, taskid: taskid, key: key }, null, completed);
	  } 
    static saveUserData(companyid: number, lmcomid: number, producturl: string, data: {  url: string;  taskId: string;  flag: CourseModel.CourseDataFlag;  shortData: string;  longData: string;  }[], completed: () => void): void {
		  invoke('vyzva57services/saveuserdata', 'post', { companyid: companyid, lmcomid: lmcomid, producturl: producturl }, JSON.stringify(data), completed);
	  } 
   
  };
}
