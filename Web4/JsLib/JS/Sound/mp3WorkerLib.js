var mp3WorkerLib;
(function (mp3WorkerLib) {
    mp3WorkerLib.isOldBrowser = typeof ArrayBuffer == 'undefined' || typeof Worker == 'undefined';
    function getWorkerRecordStartPar(par) {
        return {
            actHtml5SampleRate: par.actHtml5SampleRate,
            toDisc: par.toDisc,
            toDiscFileUrl: par.toDiscFileUrl,
        };
    }
    mp3WorkerLib.getWorkerRecordStartPar = getWorkerRecordStartPar;
    function postMessage(worker, msg) {
        if (mp3WorkerLib.isOldBrowser)
            mp3Worker.onMessageLow(msg);
        else {
            if (!worker) {
                mp3WorkerLib.log('postMessage, !worker');
                return;
            }
            worker.postMessage(msg);
        }
    }
    function postInitSLMessage(worker, data) {
        cnt++;
        mp3WorkerLib.log('postInitSLMessage ' + cnt.toString() + ': ' + (data.firstData ? data.firstData.length : 0));
        postMessage(worker, { cmd: 'sl_init', data: data, id: cnt, loggerId: Logger.logId() });
    }
    mp3WorkerLib.postInitSLMessage = postInitSLMessage;
    function postEncodeSLMessage(worker, data) {
        cnt++;
        mp3WorkerLib.log('postEncodeSLMessage ' + cnt.toString() + ': ' + data.length);
        postMessage(worker, { cmd: 'sl_encode', data: data, id: cnt, loggerId: Logger.logId() });
    }
    mp3WorkerLib.postEncodeSLMessage = postEncodeSLMessage;
    function postFinishSLMessage(worker) {
        cnt++;
        mp3WorkerLib.log('postFinishSLMessage ' + cnt.toString());
        postMessage(worker, { cmd: 'sl_finish', data: null, id: cnt, loggerId: Logger.logId() });
    }
    mp3WorkerLib.postFinishSLMessage = postFinishSLMessage;
    function postInitHTML5Message(worker, data) {
        cnt++;
        mp3WorkerLib.log('postInitHTML5Message ' + cnt.toString() + ': ' + (data.firstData ? data.firstData.length : 0));
        postMessage(worker, { cmd: 'html5_init', data: data, id: cnt, loggerId: Logger.logId() });
    }
    mp3WorkerLib.postInitHTML5Message = postInitHTML5Message;
    function postEncodeHTML5Message(worker, data) {
        cnt++;
        mp3WorkerLib.log('postEncodeHTML5Message ' + cnt.toString() + ': ' + data.length);
        postMessage(worker, { cmd: 'html5_encode', data: data, id: cnt, loggerId: Logger.logId() });
    }
    mp3WorkerLib.postEncodeHTML5Message = postEncodeHTML5Message;
    function postFinishHTML5Message(worker) {
        cnt++;
        mp3WorkerLib.log('postFinishHTML5Message ' + cnt.toString());
        postMessage(worker, { cmd: 'html5_finish', data: null, id: cnt, loggerId: Logger.logId() });
    }
    mp3WorkerLib.postFinishHTML5Message = postFinishHTML5Message;
    var cnt = 0;
    (function (mode) {
        mode[mode["no"] = -1] = "no";
        mode[mode["STEREO"] = 0] = "STEREO";
        mode[mode["JOINT_STEREO"] = 1] = "JOINT_STEREO";
        mode[mode["MONO"] = 3] = "MONO";
    })(mp3WorkerLib.mode || (mp3WorkerLib.mode = {}));
    var mode = mp3WorkerLib.mode;
    (function (vbr_mode) {
        vbr_mode[vbr_mode["vbr_off"] = 0] = "vbr_off";
        vbr_mode[vbr_mode["vbr_rh"] = 2] = "vbr_rh";
        vbr_mode[vbr_mode["vbr_abr"] = 3] = "vbr_abr";
        vbr_mode[vbr_mode["vbr_mtrh"] = 4] = "vbr_mtrh";
    })(mp3WorkerLib.vbr_mode || (mp3WorkerLib.vbr_mode = {}));
    var vbr_mode = mp3WorkerLib.vbr_mode;
    function log(msg) {
        console.info(msg);
    }
    mp3WorkerLib.log = log;
})(mp3WorkerLib || (mp3WorkerLib = {}));
var mp3Worker;
(function (mp3Worker) {
    mp3Worker.worker;
    var cfg;
    var toUploadChunks;
    var toUploadChunksLen;
    var isFirstUpload;
    function slAjax(base64, phase, loggerId) {
        var xmlDoc = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        var url = cfg.pagerBasicUrl + 'mp3Uploader.ashx?fileUrl=' + cfg.recordStartPar.toDiscFileUrl + '&phase=' + phase + (loggerId ? '&LoggerLogId=' + loggerId : '');
        //if (phase == 'sl_finish')
        //  url += '&SamplesPerSecond=' + cfg.in_samplerate.toString() + '&BitsPerSample=16&Channels=1';
        xmlDoc.open('POST', url, false);
        xmlDoc.setRequestHeader("Content-type", 'text/plain');
        xmlDoc.onerror = function (ev) { return console.log('slAjax error: message=' + ev.message); };
        mp3WorkerLib.log('slAjax, base64.length=' + base64.length);
        xmlDoc.send(base64);
    }
    function uploadChunks(raw, isEnd) {
        if (raw) {
            toUploadChunks.push(raw);
            toUploadChunksLen += raw.length;
        }
        if (!isEnd && toUploadChunksLen < 50000)
            return;
        var phase = isFirstUpload ? (isEnd ? 'html_init_finish' : 'html_init') : (isEnd ? 'html_finish' : 'html_encode');
        isFirstUpload = false;
        var toUploadData = new Uint16Array(toUploadChunksLen);
        var pos = 0;
        for (var i = 0; i < toUploadChunks.length; i++) {
            var act = toUploadChunks[i];
            toUploadData.set(act, pos);
            pos += act.length;
        }
        var xmlDoc = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        var url = cfg.pagerBasicUrl + 'mp3Uploader.ashx?fileUrl=' + cfg.recordStartPar.toDiscFileUrl + '&phase=' + phase;
        //if (phase == 'html_init_finish' || phase == 'html_finish')
        //  url += '&SamplesPerSecond=' + cfg.in_samplerate.toString() + '&BitsPerSample=16&Channels=1';
        xmlDoc.open('POST', url, false);
        xmlDoc.setRequestHeader("Content-type", 'text/plain');
        xmlDoc.onerror = function (ev) { return console.log('slAjax error: message=' + ev.message); };
        mp3WorkerLib.log('uploadChunks ajax ' + toUploadData.length.toString());
        xmlDoc.send(toUploadData.buffer);
        toUploadChunks = [];
        toUploadChunksLen = 0;
    }
    function onMessage(ev) {
        onMessageLow(ev.data);
    }
    mp3Worker.onMessage = onMessage;
    function onMessageLow(msg) {
        switch (msg.cmd) {
            case 'sl_init':
                cfg = msg.data;
                var strData = (cfg.firstData);
                mp3WorkerLib.log('worker sl_init, samples=' + strData.length.toString());
                slAjax(strData, 'sl_init', msg.loggerId);
                break;
            case 'sl_encode':
                var strData = (msg.data);
                mp3WorkerLib.log('worker sl_encode, samples=' + strData.length.toString());
                slAjax(strData, 'sl_encode', msg.loggerId);
                break;
            case 'sl_finish':
                mp3WorkerLib.log('worker sl_finish, url=' + cfg.recordStartPar.toDiscFileUrl);
                slAjax('', 'sl_finish', msg.loggerId);
                var res = { cmd: 'end', data: null, id: 0, loggerId: msg.loggerId };
                mp3Worker.worker.postMessage(res);
                break;
            case 'html5_init':
                //debugger;
                cfg = msg.data;
                toUploadChunks = [];
                toUploadChunksLen = 0;
                isFirstUpload = true;
                mp3WorkerLib.log('worker html5_init');
                uploadChunks(cfg.firstData, false);
                break;
            case 'html5_encode':
                var channel = msg.data;
                mp3WorkerLib.log('worker html5_encode, samples=' + channel.length.toString());
                uploadChunks(channel, false);
                break;
            case 'html5_finish':
                mp3WorkerLib.log('worker html5_finish, url=' + cfg.recordStartPar.toDiscFileUrl);
                uploadChunks(null, true);
                var res = { cmd: 'end', data: null, id: 0, loggerId: msg.loggerId };
                mp3Worker.worker.postMessage(res);
                break;
            //case 'gzip_init':
            //  cfg = <mp3WorkerLib.config>msg.data;
            //  toUploadChunks = []; toUploadChunksLen = 0; finishDiscCompleted = null; isFirstUpload = true;
            //  gzip = new pako.Deflate({ level: 9, gzip: true });
            //  gzip.onData = buf => {
            //    uploadChunks({ data: buf, id: 0 });
            //  };
            //  gzip.onEnd = ok => {
            //    finishDiscCompleted = () => {
            //      var res: mp3WorkerLib.message = { cmd: 'end', data: null, id: 0 };
            //      worker.postMessage(res);
            //    };
            //    uploadChunks(null);
            //  };
            //  mp3WorkerLib.log('gzip_init, samples=' + cfg.firstData.length.toString());
            //  gzip.push(new Uint8Array(cfg.firstData.buffer), false);
            //  break;
            //case 'gzip_encode':
            //  var channel = <Int16Array>msg.data;
            //  mp3WorkerLib.log('gzip_encode, samples=' + channel.length.toString());
            //  gzip.push(new Uint8Array(channel.buffer), false);
            //  break;
            //case 'gzip_finish':
            //  mp3WorkerLib.log('gzip_finish');
            //  gzip.push(new Uint8Array([]), true);
            //  break;
            //case 'init_ieee_float':
            //case 'init':
            //  cfg = <mp3WorkerLib.config>msg.data;
            //  mp3codec = Lame.init();
            //  Lame.set_in_samplerate(mp3codec, cfg.in_samplerate);
            //  Lame.set_num_channels(mp3codec, 1);
            //  Lame.set_mode(mp3codec, mp3WorkerLib.mode.MONO);
            //  if (cfg.isAbr) {
            //    if (cfg.VBR_mean_bitrate_kbps < 8) cfg.VBR_mean_bitrate_kbps = 8; else if (cfg.VBR_mean_bitrate_kbps > 320) cfg.VBR_mean_bitrate_kbps = 320;
            //    Lame.set_VBR(mp3codec, mp3WorkerLib.vbr_mode.vbr_mtrh);
            //    Lame.set_VBR_mean_bitrate_kbps(mp3codec, cfg.VBR_mean_bitrate_kbps);
            //  } else {
            //    if (cfg.VBR_quality < 0) cfg.VBR_quality = 0; else if (cfg.VBR_quality > 9) cfg.VBR_quality = 9;
            //    Lame.set_VBR(mp3codec, mp3WorkerLib.vbr_mode.vbr_mtrh);
            //    Lame.set_VBR_quality(mp3codec, cfg.VBR_quality);
            //  }
            //  Lame.init_params(mp3codec);
            //  mp3WorkerLib.log('Lame.init_params: in_samplerate=' + cfg.in_samplerate.toString());
            //  var mp3data: Lame.encodedMp3Buf;
            //  if (ev.data.cmd == 'init_ieee_float') {
            //    mp3data = Lame.do_encode_buffer_ieee_float(mp3codec, cfg.firstData_ieee_float.left, cfg.firstData_ieee_float.right);
            //    mp3WorkerLib.log('Lame.do_encode_buffer_ieee_float ' + msg.id.toString() + ', bytes=' + mp3data.data.length.toString());
            //  } else {
            //    mp3data = Lame.do_encode_buffer(mp3codec, cfg.firstData);
            //    mp3WorkerLib.log('Lame.do_encode_buffer ' + msg.id.toString() + ', bytes=' + mp3data.data.length.toString());
            //  }
            //  if (cfg.recordStartPar.toDisc) {
            //    toUploadChunks = []; toUploadChunksLen = 0; finishDiscCompleted = null; isFirstUpload = true;
            //    //debugger;
            //    uploadChunks({ data: mp3data.data, id: msg.id });
            //  } else {
            //    var res: mp3WorkerLib.message = { cmd: 'data', data: mp3data.data, id: msg.id };
            //    worker.postMessage(res);
            //  }
            //  break;
            //case 'encode_ieee_float':
            //  var channels = <mp3WorkerLib.channels>msg.data;
            //  var mp3data = Lame.do_encode_buffer_ieee_float(mp3codec, channels.left, channels.right);
            //  mp3WorkerLib.log('Lame.do_encode_buffer_ieee_float ' + msg.id.toString() + ', bytes=' + mp3data.data.length.toString());
            //  if (cfg.recordStartPar.toDisc) {
            //    uploadChunks({ data: mp3data.data, id: msg.id });
            //  } else {
            //    var res: mp3WorkerLib.message = { cmd: 'data', data: mp3data.data, id: msg.id };
            //    worker.postMessage(res);
            //  }
            //  break;
            //case 'encode':
            //  var channel = <Int16Array>msg.data;
            //  var mp3data = Lame.do_encode_buffer(mp3codec, channel);
            //  mp3WorkerLib.log('Lame.do_encode_buffer ' + msg.id.toString() + ', bytes=' + mp3data.data.length.toString());
            //  if (cfg.recordStartPar.toDisc) {
            //    uploadChunks({ data: mp3data.data, id: msg.id });
            //  } else {
            //    var res: mp3WorkerLib.message = { cmd: 'data', data: mp3data.data, id: msg.id };
            //    worker.postMessage(res);
            //  }
            //  break;
            //case 'finish':
            //  var mp3data = Lame.encode_flush(mp3codec);
            //  mp3WorkerLib.log('Lame.encode_flush ' + msg.id.toString());
            //  Lame.close(mp3codec);
            //  mp3WorkerLib.log('Lame.close');
            //  mp3codec = null;
            //  if (cfg.recordStartPar.toDisc) {
            //    finishDiscCompleted = () => {
            //      var res: mp3WorkerLib.message = { cmd: 'end', data: null, id: msg.id };
            //      console.log('finishDiscCompleted: ' + typeof worker);
            //      worker.postMessage(res);
            //    };
            //    uploadChunks({ data: mp3data.data, id: msg.id });
            //  } else {
            //    var res: mp3WorkerLib.message = { cmd: 'end', data: mp3data.data, id: msg.id };
            //    worker.postMessage(res);
            //  }
            //  break;
            default:
                debugger;
                break;
        }
    }
    mp3Worker.onMessageLow = onMessageLow;
})(mp3Worker || (mp3Worker = {}));
