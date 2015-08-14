var lmConsole;
(function (lmConsole) {
    function sendStart(el) {
        $(el).data('btn-down', Utils.nowToInt().toString());
    }
    lmConsole.sendStart = sendStart;
    function sendEnd(el) {
        var bd = $(el).data('btn-down');
        if (!bd)
            return;
        var btnDownTime = parseInt(bd);
        if (Utils.nowToInt() - btnDownTime < 2000)
            return;
        send();
    }
    lmConsole.sendEnd = sendEnd;
    function send() {
        if (typeof Pager == 'undefined') {
            $('body').html('<h2>Log</h2>' + getLogData('').replace(/\r\n/g, '<br/>'));
        }
        else {
            var sendId = new Date().getTime().toString();
            var res = sendLogLogDataLow();
            if (res.msg == null) {
                alert('Nothing to send');
                return;
            }
            anim.alert().lmconsoleShow(function (dlg, completed) {
                var st = {
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
                var url = Pager.basicUrl + 'mp3Uploader.ashx?phase=lmconsole&fileUrl=/app_data/logs/' + lmConsole.signature + '.js.log' + '&timestamp=' + sendId;
                sendAjax(url, data, function (success) {
                    if (success)
                        alert('Logging sent successfully!');
                    else
                        $('body').html('<h2>Send content of this page to support@langmaster.com</h2>' + data.replace(/\r\n/g, '<br/>'));
                    delFiles(res.files);
                    completed();
                });
            });
        }
    }
    function sendAjax(url, data, completed) {
        $.ajax({
            url: url,
            type: 'POST',
            data: data,
            contentType: 'text/plain',
            dataType: 'text',
        }).done(function () { return completed(true); }).fail(function () { return completed(false); });
    }
    function getLogData(status) {
        if (!lmConsole.active)
            return;
        var res = sendLogLogDataLow();
        delFiles(res.files);
        return res.msg;
    }
    function sendLogLogDataLow() {
        var res = { files: getLogFiles(), msg: null };
        if (res.files.length == 0)
            return res;
        var data = _.map(res.files, function (idx) { return localStorage.getItem(name(idx)); });
        res.msg = data.join('');
        return res;
        //sendCallback(msg, doDel => { if (!doDel) return; _.each(idxs, idx => localStorage.removeItem(name(idx))); refreshNames(); });
    }
    function delFiles(idxs) {
        _.each(idxs, function (idx) { return localStorage.removeItem(name(idx)); });
        refreshNames();
    }
    lmConsole.active = false;
    lmConsole.signature = null;
    var names = [];
    var lastName = 0;
    var fileLenLimit = 1000;
    var fileCountLimit = 1000;
    console['log'] = log;
    function signComputer() {
        lmConsole.signature = localStorage.getItem('log/signature');
        if (lmConsole.signature == null) {
            lmConsole.signature = new Date().getTime().toString();
            localStorage.setItem('log/signature', lmConsole.signature);
        }
    }
    function createCookie(name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toUTCString();
        }
        else
            var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    }
    var cookieId = 'LoggerLogId'.toLowerCase();
    createCookie(cookieId, '', -1);
    function init() {
        if (lmConsole.active)
            return;
        if (!(lmConsole.active = storageExists()))
            return;
        signComputer();
        createCookie(cookieId, lmConsole.signature, 1);
        refreshNames();
    }
    function logError(msg) {
        init();
        log(msg);
    }
    function log(msg) {
        console.info(msg);
        if (!lmConsole.active)
            return;
        var actName = name(lastName);
        var val = (localStorage.getItem(actName));
        if (val && val.length > fileLenLimit) {
            if (names.length > fileCountLimit) {
                localStorage.removeItem(name(names[0]));
                names = names.slice(1);
            }
            lastName++;
            actName = name(lastName);
            names.push(lastName);
            val = null;
        }
        val = val ? val + msg : msg;
        localStorage.setItem(actName, val + '\r\n');
    }
    function refreshNames() {
        names = getLogFiles();
        lastName = names.length == 0 ? 0 : _.max(names) + 1;
    }
    function getLogFiles() {
        var res = [];
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            var mtch = /^log\/(\d+)$/gi.exec(key);
            if (mtch == null)
                continue;
            res.push(parseInt(mtch[1]));
        }
        res = _.sortBy(res);
        return res;
    }
    function name(idx) { return 'log/' + idx.toString(); }
    function storageExists() {
        var test = 'test';
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    function test() {
        for (var i = 0; i < 20; i++)
            console.log(i.toString() + " xxxxxxx");
    }
    lmConsole.test = test;
    if (!isLogging) {
        isLogging = location.hash && location.hash == '#log';
        if (isLogging)
            location.hash == '';
    }
    if (isLogging)
        init();
    //localStorage.clear();
    $(window).on('error', function (ev) {
        var orig = ev.originalEvent;
        var msg = orig && orig.filename ? orig.filename + '.' + orig.lineno + '.' + orig.message : '';
        logError('*** ERROR (window.onerror): ' + msg);
    });
    $(window).bind('hashchange', function () {
        if (!isLogging) {
            isLogging = location.hash && location.hash == '#log';
            if (isLogging) {
                location.hash == '';
                init();
            }
        }
    });
})(lmConsole || (lmConsole = {}));
