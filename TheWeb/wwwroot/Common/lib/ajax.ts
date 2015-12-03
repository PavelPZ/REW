namespace ajax { 
  //******************* AJAX 
  //https://developer.mozilla.org/en-US/docs/AJAX/Getting_Started, https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest, https://msdn.microsoft.com/cs-cz/library/ms535874(v=vs.85).aspx
  export function ajax(url: string, method: ajaxMethod = ajaxMethod.GET, option?: ajaxOptions): Promise<IAjaxResult> {
    if (option.data && typeof option.data != 'string') option.data = JSON.stringify(option.data);
    return new Promise<IAjaxResult>((resolve, reject) => ajaxLow(url, method, option, resolve, reject));
  }

  export function ajaxLow(url: string, method: ajaxMethod | string, option: ajaxOptions, resolve: (res: IAjaxResult) => void, reject: (err: IAjaxError) => void) {
    if (!option) option = {};
    if (utils.isString(method)) method = ajaxMethod[method];
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState !== 4) return;
      var result: IAjaxResult = { xhr: httpRequest, responseText: httpRequest.responseText, responseType: httpRequest.responseType };
      if (httpRequest.status <= 299) resolve(result);
      else {
        var error: IAjaxError = { status: httpRequest.status, statusText: httpRequest.statusText, result: result };
        reject(error);
      }
    };
    httpRequest.ontimeout = () => {
      var error: IAjaxError = { status: 999, statusText: 'timeout', result: null };
      reject(error);
    };
    httpRequest.open(ajaxMethod[method ? method : ajaxMethod.GET], url, true);
    httpRequest.setRequestHeader('Content-Type', getAjaxContentType(option.contentType ? option.contentType : ajaxContentType.txt));
    httpRequest.send(option.data);
  };

  proxies.invoke = (url, method, queryPars, body, completed) => {
    url = servCfg.server.rootUrl + utils.urlStringify(url, queryPars);
    ajaxLow(url, method, { data: body, contentType: ajaxContentType.txt }, res => completed(res.responseText), err => throwError(url, err));
  };
   
  export interface IAjaxResult {
    responseText: string;
    responseType: string;
    xhr: XMLHttpRequest;
  }
  export interface IAjaxError {
    status: number;
    statusText: string;
    result: IAjaxResult;
  }
  export enum ajaxMethod { GET, PUT, POST, DELETE, MERGE }
  export enum ajaxContentType { formUrlencoded, txt, json, javascript }
  //IIS mime maps, napr. D:\LMCom\rew\.vs\config\applicationhost.config
  function getAjaxContentType(type: ajaxContentType): string {
    if (!type) return null;
    switch (type) {
      case ajaxContentType.formUrlencoded: return 'application/x-www-form-urlencoded';
      case ajaxContentType.txt: return 'text/plain';
      case ajaxContentType.json: return 'application/json';
      case ajaxContentType.javascript: return 'application/javascript';
      default: loger.doThrow('not implemented');
    }
  }
  export interface ajaxOptions {
    data?: any;
    contentType?: ajaxContentType;
  }
  export function throwError(url: string, err: IAjaxError) {
    loger.doThrow(`*** AJAX ERROR on ${url}: status=${err.status}, statusText=${err.statusText}, ${err.result.responseText}`);
  }

}
