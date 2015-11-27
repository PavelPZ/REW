namespace proxies {
  export var invoke: (url: string, type: string, queryPars: Object, body: string, completed: (res) => void) => void;
  namespace vyzva57services {
    export function lmAdminSendOrder(jsonorder: {}, completed: (res: {}) => void): void {
      invoke('lmadminsendorder', 'post', { jsonorder: jsonorder }, null, completed);
    }
    export function lmLectorExportInfoToXml(completed: (res: {}) => void): void {
      invoke('lmlectorexportinfotoxml', 'get', null, null, completed);
    }
    export function lmAdminCreateCompany(companyid: {}, companydata: {}, completed: (res: {}) => void): void {
      invoke('lmadmincreatecompany', 'post', { companyid: companyid, companydata: companydata }, null, completed);
    }
    export function lmAdminCreateLicenceKeys(companyid: {}, requestedkeys: {}, completed: (res: {}) => void): void {
      invoke('lmadmincreatelicencekeys', 'post', { companyid: companyid, requestedkeys: requestedkeys }, null, completed);
    }
    export function lmAdminCreateSingleLicenceKey(companyid: {}, prodid: {}, completed: (res: {}) => void): void {
      invoke('lmadmincreatesinglelicencekey', 'post', { companyid: companyid, prodid: prodid }, null, completed);
    }
    export function loadCompanyData(companyid: {}, completed: (res: {}) => void): void {
      invoke('loadcompanydata', 'get', { companyid: companyid }, null, completed);
    }
    export function writeCompanyData(companyid: {}, data: {}, completed: (res: {}) => void): void {
      invoke('writecompanydata', 'post', { companyid: companyid, data: data }, null, completed);
    }
    export function reports(reportpar: {}, completed: (res: {}) => void): void {
      invoke('reports', 'get', { reportpar: reportpar }, null, completed);
    }
    export function writeUs(jsondata: {}, completed: (res: {}) => void): void {
      invoke('writeus', 'post', { jsondata: jsondata }, null, completed);
    }
  }

  namespace example {
    export function login(pswhash: {}, email: {}, completed: (res: {}) => void): void {
      invoke('login', 'get', { pswhash: pswhash, email: email }, null, completed);
    }
  }

}
