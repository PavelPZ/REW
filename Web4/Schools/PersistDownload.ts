interface BrowserPublic extends persistDownload.delphiApi {
}

module persistDownload {

  var delphiApi: delphiApi;

  var debugVersion = true;

  class debugDelphiApi implements persistDownload.delphiApi {
    init(appDir:string, userDir:string):void {
      oldApi.init(appDir, userDir);
    }
    readAppFile(url: string): string {
      Logger.trace_persistDownload("readAppFile: " + url);
      var res = oldApi.readAppFile(url);
      Logger.trace_persistDownload("readAppFile: OK");
      return res;
    }
    readFile(crsId: string, url: string): string {
      Logger.trace_persistDownload("readFile: " + url);
      var res = oldApi.readFile(crsId, url);
      Logger.trace_persistDownload("readFile: OK");
      return res;
    }
    writeFile(crsId: string, url: string, data: string): void {
      Logger.trace_persistDownload("writeFile: " + url);
      oldApi.writeFile(crsId, url, data);
      Logger.trace_persistDownload("writeFile: OK");
    }
    deleteFile(crsId: string, url: string): void {
      Logger.trace_persistDownload("deleteFile: " + url);
      oldApi.deleteFile(crsId,url);
      Logger.trace_persistDownload("deleteFile: OK");
    }
    log(msg: string): void {
      throw "not implemented";
    }
  }

  declare var slApi;

  //export function Init(isSl:boolean, completed: () => void ): void {
  //  delphiApi = (isSl ? slApi : window.external);
  //  if (!isSl) Logger.delphiLog = <any>(window.external);
  //  if (isSl) slApi.init("q:\\temp\\LANGMaster.com\\english_0_1\\cs_cz\\data\\schools\\", "q:\\temp\\DebugDownload\\");
  //  if (!delphiApi || typeof delphiApi.readAppFile == 'undefined') { alert("missing window.external.readAppFile"); return; }
  //  schools.readAppDataAndLoc = readAppDataAndLoc;
  //  schools.readAppData = readAppData;
  //  persistLocal.readFile = readFile;
  //  persistLocal.writeFile = writeFile;
  //  persistLocal.deleteFile = deleteFile;
  //  if (debugVersion) {
  //    oldApi = delphiApi;
  //    delphiApi = new debugDelphiApi();
  //  }
  //  completed();
  //}
  var oldApi;

  function readAppDataAndLoc(urls: Pager.locPaths, completed: (data,loc: string) => void ) {
    completed(delphiApi.readAppFile(urls.url), delphiApi.readAppFile(urls.urlLoc)); //, urls.urlDict == null ? null : delphiApi.readAppFile(urls.urlDict)
  }

  function readAppData(url: string, completed: (data: string) => void ): void {
    completed(delphiApi.readAppFile(url));
  }

  function readFile(crsId: string, url: string, completed: (data: string) => void ): void {
    var res = delphiApi.readFile(crsId, url);
    completed(res=="" ? null : res);
  }
  function writeFile(crsId: string, url: string, data: string, completed: () => void ): void {
    delphiApi.writeFile(crsId,url, data);
    completed();
  }
  function deleteFile(crsId: string, url: string, completed: () => void ): void {
    delphiApi.deleteFile(crsId, url);
    completed();
  }

  export interface delphiApi {
    readAppFile(url: string): string;
    readFile(crsId: string, url: string): string;
    writeFile(crsId: string, url: string, data: string): void;
    deleteFile(crsId: string, url: string): void;
    log(msg: string): void;
  }

}

//xx/#DEBUG
module Logger {
  export function trace_persistDownload(msg: string): void {
    Logger.trace("persistDownload", msg);
  }
}
//xx/#ENDDEBUG
//var fake_download = null;
