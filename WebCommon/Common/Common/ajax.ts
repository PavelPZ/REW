namespace ajax {
  //******************* AJAX
  //https://developer.mozilla.org/en-US/docs/AJAX/Getting_Started, https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest, https://msdn.microsoft.com/cs-cz/library/ms535874(v=vs.85).aspx
  export function ajax(url: string, method: ajaxMethod = ajaxMethod.GET, option: ajaxOptions): Promise<IAjaxResult> {
    return new Promise<IAjaxResult>((resolve, reject) => {
      if (!option) option = {};
      var httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === 4) return;
        var result: IAjaxResult = { xhr: httpRequest, responseText: httpRequest.responseText, responseType: httpRequest.responseType };
        if (httpRequest.status === 200) resolve(result);
        else {
          var error: IAjaxError = { status: httpRequest.status, statusText: httpRequest.statusText, result: result };
          reject(error);
        }
      };
      httpRequest.ontimeout = () => reject({statusText: 'timeout'});
      if (option.contentType) httpRequest.setRequestHeader('Content-Type', getAjaxContentType(option.contentType));
      httpRequest.open(ajaxMethod[method], url, true);
      httpRequest.send(option.data);
    });
  }
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
  function getAjaxContentType(type: ajaxContentType): string {
    if (!type) return null;
    switch (type) {
      case ajaxContentType.formUrlencoded: return 'application/x-www-form-urlencoded';
      case ajaxContentType.txt: return 'text/plain';
      case ajaxContentType.json: return 'application/json';
      case ajaxContentType.javascript: return 'application/javascript';
      default: throw 'not implemented';
    }
  }
  export interface ajaxOptions {
    data?: any;
    contentType?: ajaxContentType;
  }

}
