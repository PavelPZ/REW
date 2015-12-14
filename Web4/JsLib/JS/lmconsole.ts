declare var isLogging: boolean;
module lmConsole {
  export function sendStart(el: HTMLElement) {
    $(el).data('btn-down', Utils.nowToInt().toString());
  }

  export function sendEnd(el: HTMLElement) {
    var bd = $(el).data('btn-down'); if (!bd) return;
    var btnDownTime = parseInt(<any>bd);
    if (Utils.nowToInt() - btnDownTime < 2000) return;
    send();
  }

  function send() {
    if (typeof Pager == 'undefined') {
      $('body').html('<h2>Log</h2>' + getLogData('').replace(/\r\n/g, '<br/>'));
    } else {
      var sendId = new Date().getTime().toString();
      var res = sendLogLogDataLow();
      if (res.msg == null) { alert('Nothing to send'); return; }
      anim.alert().lmconsoleShow((dlg, completed) => {
        var st: LMComLib.lmConsoleSend = {
          nowStr: new Date().toUTCString(),
          now: Utils.nowToNum(),
          email: LMStatus.Cookie ? LMStatus.Cookie.EMail : '',
          replEmail: dlg.find('#repl-email').val(),
          problem: dlg.find('#problem').val(),
          action: dlg.find('#action').val(),
          other: dlg.find('#other').val(),
          date: '',
          hasError: false,
        };
        var data = '****************************************************************\r\n'
          + JSON.stringify(st) + '\r\n'
          + '****************************************************************\r\n'
          + res.msg
          + '#<' + sendId + ' log end\r\n';
        var url = Pager.basicUrl + 'mp3Uploader.ashx?phase=lmconsole&fileUrl=/app_data/logs/' + signature + '.js.log' + '&timestamp=' + sendId;
        sendAjax(url, data, success => {
          if (success) alert('Logging sent successfully!');
          else $('body').html('<h2>Send content of this page to support@langmaster.com</h2>' + data.replace(/\r\n/g, '<br/>'));
          delFiles(res.files);
          completed();
        });
      });
    }
  }

  function sendAjax(url: string, data: string, completed: (success: boolean) => void) {
    $.ajax({
      url: url,
      type: 'POST',
      data: data,
      contentType: 'text/plain',
      dataType: 'text',
    }).done(() => completed(true)).fail(() => completed(false));
  }

  function getLogData(status: string): string {
    if (!active) return;
    var res = sendLogLogDataLow();
    delFiles(res.files);
    return res.msg;
  }

  function sendLogLogDataLow(): { msg: string; files: Array<number>; } {
    var res = { files: getLogFiles(), msg: null };
    if (res.files.length == 0) return res;
    var data = _.map(res.files, idx => localStorage.getItem(name(idx)));
    res.msg = data.join('');
    return res;
    //sendCallback(msg, doDel => { if (!doDel) return; _.each(idxs, idx => localStorage.removeItem(name(idx))); refreshNames(); });
  }

  function delFiles(idxs: Array<number>) {
    _.each(idxs, idx => localStorage.removeItem(name(idx)));
    refreshNames();
  }

  export var active = false;
  export var signature: string = null;

  var names: Array<number> = [];
  var lastName = 0;
  var fileLenLimit = 1000;
  var fileCountLimit = 1000;
  console['log'] = log;

  function signComputer() {
    signature = localStorage.getItem('log/signature');
    if (signature == null) {
      signature = new Date().getTime().toString();
      localStorage.setItem('log/signature', signature);
    }
  }

  function createCookie(name, value, days) {
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      var expires = "; expires=" + date.toUTCString();
    }
    else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
  }
  var cookieId = 'LoggerLogId'.toLowerCase();
  createCookie(cookieId, '', -1);

  function init() {
    if (active) return;
    if (!(active = storageExists())) return;
    signComputer();
    createCookie(cookieId, signature, 1);
    refreshNames();
  }

  function logError(msg: string) {
    init();
    log(msg);
  }
  function log(msg: string) {
    console.info(msg);
    if (!active) return;
    var actName = name(lastName);
    var val = <string>(localStorage.getItem(actName));
    if (val && val.length > fileLenLimit) {
      if (names.length > fileCountLimit) {
        localStorage.removeItem(name(names[0]));
        names = names.slice(1);
      }
      lastName++; actName = name(lastName); names.push(lastName);
      val = null;

    }
    val = val ? val + msg : msg;
    localStorage.setItem(actName, val + '\r\n');
  }

  function refreshNames() {
    names = getLogFiles();
    lastName = names.length == 0 ? 0 : _.max(names) + 1;
  }
  function getLogFiles(): Array<number> {
    var res: Array<number> = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      var mtch = /^log\/(\d+)$/gi.exec(key);
      if (mtch == null) continue;
      res.push(parseInt(mtch[1]));
    }
    res = _.sortBy(res);
    return res;
  }

  function name(idx: number): string { return 'log/' + idx.toString(); }

  function storageExists() {
    var test = 'test';
    try {
      localStorage.setItem(test, test); localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
  export function test() {
    for (var i = 0; i < 20; i++) console.log(i.toString() + " xxxxxxx");
  }

  if (!isLogging) {
    isLogging = location.hash && location.hash == '#log';
    if (isLogging) location.hash == '';
  }
  if (isLogging) init();
  //localStorage.clear();
  $(window).on('error', ev => {
    var orig: any = ev.originalEvent;
    var msg = orig && orig.filename ? orig.filename + '.' + orig.lineno + '.' + orig.message : '';
    logError('*** ERROR (window.onerror): ' + msg);
  });
  $(window).bind('hashchange',() => {
    if (!isLogging) {
      isLogging = location.hash && location.hash == '#log';
      if (isLogging) {
        location.hash == '';
        init();
      }
    }
  });
  //http://blogs.cozi.com/techold/2008/04/javascript-erro.html
  //nefunguje, protoze se zmeni BIND funkce a pak nefunguje JQuery UNBIND
  //var jQueryBind = jQuery.fn.bind;
  //jQuery.fn.bind = function (type, data, fn) {
  //  if (!fn && data && typeof data == 'function') { fn = data; data = null; }
  //  if (fn) {
  //    var origFn = fn;
  //    var wrappedFn = function () {
  //      try { origFn.apply(this, arguments); }
  //      catch (ex) {
  //        var msg = 'Unknown error';
  //        if (ex.message) msg = ex.message; else if (typeof ex == 'string' || typeof ex == 'String') msg = ex;
  //        logError('*** ERROR (jQuery.fn.bind): ' + msg);
  //        throw ex;
  //      }
  //    };
  //    fn = wrappedFn;
  //  }
  //  return jQueryBind.call(this, type, data, fn);
  //};

} 