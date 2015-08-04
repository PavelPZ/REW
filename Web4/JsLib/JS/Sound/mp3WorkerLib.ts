module mp3WorkerLib {

  export var isOldBrowser = typeof ArrayBuffer == 'undefined' || typeof Worker == 'undefined';

  export interface config {
    firstData: Uint16Array | string;
    pagerBasicUrl: string; //root web aplikace pro ajax
    recordStartPar: WorkerRecordStartPar;
  }

  //export enum discFormat { mp3, gzip, wav };

  export interface WorkerRecordStartPar {
    toDisc: boolean;
    toDiscFileUrl: string; //pro toDisc==true: identifikace souboru na server disku, napr. /test.mp3 pro d:\LMCom\rew\Web4\test.mp3
    actHtml5SampleRate: number;
  }
  export interface RecordStartPar extends WorkerRecordStartPar {
    toMemoryCompleted: (data: ArrayBuffer) => void; //pro toDisc==false: callback pro predani MP3 souboru
    toMemoryCompletedData: ArrayBuffer;
    isRecording: KnockoutObservable<boolean>;
    miliseconds: KnockoutObservable<number>;
    recordStarting: () => void; //teste pred zacatkem hrani
  }

  export function getWorkerRecordStartPar(par: RecordStartPar): WorkerRecordStartPar {
    return {
      actHtml5SampleRate: par.actHtml5SampleRate,
      toDisc: par.toDisc,
      toDiscFileUrl: par.toDiscFileUrl,
    };
  }

  export interface channels {
    left: Float32Array;
    right: Float32Array;
  }

  export interface message {
    id: number;
    cmd: string;
    loggerId: string;
    data: mp3WorkerLib.config | string | Uint16Array;
  }

  export interface MessageEvent {
    data: message;
  }

  function postMessage(worker: Worker, msg: message) {
    if (mp3WorkerLib.isOldBrowser)
      mp3Worker.onMessageLow(msg);
    else {
      if (!worker) { //nektere snd karty posilaji 
        mp3WorkerLib.log('postMessage, !worker'); return;
      }
      worker.postMessage(msg);
    }
  }

  export function postInitSLMessage(worker: Worker, data: config) {
    cnt++;
    mp3WorkerLib.log('postInitSLMessage ' + cnt.toString() + ': ' + (data.firstData ? data.firstData.length : 0));
    postMessage(worker, { cmd: 'sl_init', data: data, id: cnt, loggerId: Logger.logId() });
  }
  export function postEncodeSLMessage(worker: Worker, data: string) {
    cnt++;
    mp3WorkerLib.log('postEncodeSLMessage ' + cnt.toString() + ': ' + data.length);
    postMessage(worker, { cmd: 'sl_encode', data: data, id: cnt, loggerId: Logger.logId() });
  }
  export function postFinishSLMessage(worker: Worker) {
    cnt++;
    mp3WorkerLib.log('postFinishSLMessage ' + cnt.toString());
    postMessage(worker, { cmd: 'sl_finish', data: null, id: cnt, loggerId: Logger.logId() });
  }

  export function postInitHTML5Message(worker: Worker, data: config) {
    cnt++;
    mp3WorkerLib.log('postInitHTML5Message ' + cnt.toString() + ': ' + (data.firstData ? data.firstData.length : 0));
    postMessage(worker, { cmd: 'html5_init', data: data, id: cnt, loggerId: Logger.logId() });
  }
  export function postEncodeHTML5Message(worker: Worker, data: Uint16Array | string) {
    cnt++;
    mp3WorkerLib.log('postEncodeHTML5Message ' + cnt.toString() + ': ' + data.length);
    postMessage(worker, { cmd: 'html5_encode', data: data, id: cnt, loggerId: Logger.logId() });
  }
  export function postFinishHTML5Message(worker: Worker) {
    cnt++;
    mp3WorkerLib.log('postFinishHTML5Message ' + cnt.toString());
    postMessage(worker, { cmd: 'html5_finish', data: null, id: cnt, loggerId: Logger.logId() });
  }


  var cnt: number = 0;

  export enum mode {
    no = -1,
    STEREO = 0,
    JOINT_STEREO = 1,
    MONO = 3
  }
  export enum vbr_mode {
    vbr_off = 0,
    vbr_rh = 2,
    vbr_abr = 3,
    vbr_mtrh = 4,
  }

  export function log(msg: string) {
    console.info(msg);
  }
}

module mp3Worker {

  export var worker: Worker;
  var cfg: mp3WorkerLib.config;
  var toUploadChunks: Array<Uint16Array>;
  var toUploadChunksLen: number;
  var isFirstUpload: boolean;

  function slAjax(base64: string, phase: string, loggerId:string) {
    var xmlDoc: XMLHttpRequest = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    var url = cfg.pagerBasicUrl + 'mp3Uploader.ashx?fileUrl=' + cfg.recordStartPar.toDiscFileUrl + '&phase=' + phase + (loggerId ? '&LoggerLogId=' + loggerId : '');
    //if (phase == 'sl_finish')
    //  url += '&SamplesPerSecond=' + cfg.in_samplerate.toString() + '&BitsPerSample=16&Channels=1';
    xmlDoc.open('POST', url, false);
    xmlDoc.setRequestHeader("Content-type", 'text/plain');
    xmlDoc.onerror = ev => console.log('slAjax error: message=' + ev.message);
    mp3WorkerLib.log('slAjax, base64.length=' + base64.length);
    xmlDoc.send(base64);
  }

  function uploadChunks(raw: Uint16Array, isEnd:boolean) {
    if (raw) {
      toUploadChunks.push(raw);
      toUploadChunksLen += raw.length;
    }
    if (!isEnd && toUploadChunksLen < 50000) return;
    var phase = isFirstUpload ? (isEnd ? 'html_init_finish' : 'html_init') : (isEnd ? 'html_finish' : 'html_encode');
    isFirstUpload = false;

    var toUploadData = new Uint16Array(toUploadChunksLen);
    var pos = 0;
    for (var i = 0; i < toUploadChunks.length; i++) {
      var act = toUploadChunks[i];
      toUploadData.set(act, pos); pos += act.length;
    }
    var xmlDoc: XMLHttpRequest = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    var url = cfg.pagerBasicUrl + 'mp3Uploader.ashx?fileUrl=' + cfg.recordStartPar.toDiscFileUrl + '&phase=' + phase;
    //if (phase == 'html_init_finish' || phase == 'html_finish')
    //  url += '&SamplesPerSecond=' + cfg.in_samplerate.toString() + '&BitsPerSample=16&Channels=1';
    xmlDoc.open('POST', url, false);
    xmlDoc.setRequestHeader("Content-type", 'text/plain');
    xmlDoc.onerror = ev => console.log('slAjax error: message=' + ev.message);
    mp3WorkerLib.log('uploadChunks ajax ' + toUploadData.length.toString());
    xmlDoc.send(toUploadData.buffer);
    toUploadChunks = []; toUploadChunksLen = 0;
  }

  export function onMessage(ev: MessageEvent) {
    onMessageLow(<mp3WorkerLib.message>ev.data);
  }

  export function onMessageLow(msg: mp3WorkerLib.message) {

    switch (msg.cmd) {
      case 'sl_init':
        cfg = <mp3WorkerLib.config>msg.data;
        var strData = <string>(cfg.firstData);
        mp3WorkerLib.log('worker sl_init, samples=' + strData.length.toString());
        slAjax(strData, 'sl_init', msg.loggerId);
        break;
      case 'sl_encode':
        var strData = <string>(msg.data);
        mp3WorkerLib.log('worker sl_encode, samples=' + strData.length.toString());
        slAjax(strData, 'sl_encode', msg.loggerId);
        break;
      case 'sl_finish':
        mp3WorkerLib.log('worker sl_finish, url=' + cfg.recordStartPar.toDiscFileUrl);
        slAjax('', 'sl_finish', msg.loggerId);
        var res: mp3WorkerLib.message = { cmd: 'end', data: null, id: 0, loggerId: msg.loggerId };
        worker.postMessage(res);
        break;

      case 'html5_init':
        //debugger;
        cfg = <mp3WorkerLib.config>msg.data;
        toUploadChunks = []; toUploadChunksLen = 0; isFirstUpload = true;
        mp3WorkerLib.log('worker html5_init');
        uploadChunks(<Uint16Array>cfg.firstData, false);
        break;
      case 'html5_encode':
        var channel = <Uint16Array>msg.data;
        mp3WorkerLib.log('worker html5_encode, samples=' + channel.length.toString());
        uploadChunks(channel, false);
        break;
      case 'html5_finish':
        mp3WorkerLib.log('worker html5_finish, url=' + cfg.recordStartPar.toDiscFileUrl);
        uploadChunks(null, true);
        var res: mp3WorkerLib.message = { cmd: 'end', data: null, id: 0, loggerId: msg.loggerId };
        worker.postMessage(res);
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
  //function uploadChunks(chunk: uploadChunk) {
  //  if (!!chunk) { toUploadChunks.push(chunk); toUploadChunksLen += chunk.data.length; } //neni navrat z Ajaxu
  //  if (inAjax) return; //jsem v ajaxu, konec
  //  if (toUploadChunksLen == 0) { if (finishDiscCompleted) finishDiscCompleted(); return; } //toUploadChunks.length == 0 => navrat z ajaxu
  //  if (!finishDiscCompleted && toUploadChunksLen < 50000) return;
  //  //debugger;
  //  var phase = isFirstUpload ? 'start' : 'body';
  //  isFirstUpload = false;
  //  var ajaxId = toUploadChunks[0].id;
  //  //var upload: ArrayBufferView;
  //  //if (cfg.recordStartPar.discFormat == mp3WorkerLib.discFormat.wav) {
  //  //} else {
  //  //  var uint8 = new Uint8Array(toUploadChunksLen);
  //  //  var pos = 0;
  //  //  for (var i = 0; i < toUploadChunks.length; i++) {
  //  //    var act = toUploadChunks[i].data;
  //  //    uint8.set(act, pos); pos += act.length;
  //  //  }
  //  //}
  //  var toUploadData: string | Uint16Array = null;
  //  if (typeof toUploadChunks[0].data === 'string') {
  //    toUploadData = toUploadChunks.map<string>(u => <string>(u.data)).join();
  //    //for (var i = 0; i < toUploadChunks.length; i++) toUploadData
  //  } else {
  //    toUploadData = new Uint16Array(toUploadChunksLen);
  //    var pos = 0;
  //    for (var i = 0; i < toUploadChunks.length; i++) {
  //      var act = <Uint16Array>(toUploadChunks[i].data);
  //      (<Uint16Array>toUploadData).set(act, pos); pos += act.length;
  //    }
  //  }
  //  console.log('ajaxPost before, phase=' + phase + ' chunk.id=' + ajaxId.toString() + '-' + toUploadChunks[toUploadChunks.length - 1].id.toString() + ' chunk.length=' + toUploadChunksLen.toString());
  //  var url = cfg.pagerBasicUrl + 'mp3Uploader.ashx?fileUrl=' + cfg.recordStartPar.toDiscFileUrl;
  //  if (finishDiscCompleted && cfg.recordStartPar.discFormat != mp3WorkerLib.discFormat.mp3) {
  //    url += '&SamplesPerSecond=' + cfg.in_samplerate.toString() + '&BitsPerSample=16&Channels=1';
  //    if (phase == 'body') phase = '';
  //    phase += cfg.recordStartPar.discFormat == mp3WorkerLib.discFormat.gzip ? 'gzipedwav2mp3' : 'wav2mp3';
  //  }
  //  url += '&phase=' + phase;

  //  //if (typeof toUploadData === 'string')
  //  //  console.log('JS, ajaxPost                  ' + stringToByteArray(toUploadData.substr(0, 10)).map(b => b.toString()).join(','));
  //  ajaxPost({ data: toUploadData, id: ajaxId }, url);
  //  toUploadChunks = []; toUploadChunksLen = 0;
  //}

  //function ajaxPost(chunk: uploadChunk, url: string) {
  //  var xmlDoc: XMLHttpRequest = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
  //  inAjax = true;
  //  xmlDoc.open('POST', url, true);
  //  xmlDoc.setRequestHeader("Content-type", 'application/octet-stream');
  //  //xmlDoc.setRequestHeader("Content-type", typeof chunk.data === 'text/plain' ? '' : 'application/octet-stream');
  //  xmlDoc.onreadystatechange = () => {
  //    if (xmlDoc.readyState === 4 && xmlDoc.status === 200) {
  //      console.log('ajaxPost successfull, chunk.id=' + chunk.id.toString());
  //      inAjax = false; uploadChunks(null);
  //    }
  //  }
  //  xmlDoc.onerror = ev => console.log('ajaxPost error: message=' + ev.message);
  //  //debugger;
  //  var d = chunk.data;
  //  if (typeof d === 'string')
  //    xmlDoc.send(d);
  //  else if (d instanceof Uint16Array)
  //    xmlDoc.send(d.buffer);
  //}

  //function stringToByteArray(str: string): number[] {
  //  var output = [], p = 0;
  //  for (var i = 0; i < str.length; i++) {
  //    var c = str.charCodeAt(i);
  //    while (c > 0xff) {
  //      output[p++] = c & 0xff;
  //      c >>= 8;
  //    }
  //    output[p++] = c;
  //  }
  //  return output;
  //}

//export function postInitMessage_ieee_float(worker: Worker, data: config) {
  //  cnt++;
  //  mp3WorkerLib.log('postInitMessage_ieee_float ' + cnt.toString() + ': ' + data.firstData_ieee_float.left.byteLength.toString());
  //  postMessage(worker, { cmd: 'init_ieee_float', data: data, id: cnt });
  //}
  //export function postInitMessage(worker: Worker, data: config) {
  //  cnt++;
  //  mp3WorkerLib.log('postInitMessage ' + cnt.toString() + ': ' + data.firstData.length);
  //  postMessage(worker, { cmd: 'init', data: data, id: cnt });
  //}
  //export function postEncodeMessage_ieee_float(worker: Worker, data: channels) {
  //  cnt++;
  //  mp3WorkerLib.log('postEncodeMessage_ieee_float ' + cnt.toString() + ': ' + data.left.byteLength);
  //  postMessage(worker, { cmd: 'encode_ieee_float', data: data, id: cnt });
  //}
  //export function postEncodeMessage(worker: Worker, data: Int16Array) {
  //  cnt++;
  //  mp3WorkerLib.log('postEncodeMessage ' + cnt.toString() + ': ' + data.byteLength);
  //  postMessage(worker, { cmd: 'encode', data: data, id: cnt });
  //}
  //export function postFinishMessage(worker: Worker) {
  //  cnt++;
  //  mp3WorkerLib.log('postFinishMessage ' + cnt.toString());
  //  postMessage(worker, { cmd: 'finish', data: null, id: cnt });
  //}

  //export function postInitGzipMessage(worker: Worker, data: config) {
  //  cnt++;
  //  mp3WorkerLib.log('postInitGzipMessage ' + cnt.toString() + ': ' + data.firstData.length);
  //  postMessage(worker, { cmd: 'gzip_init', data: data, id: cnt });
  //}
  //export function postEncodeGZipMessage(worker: Worker, data: Int16Array) {
  //  cnt++;
  //  mp3WorkerLib.log('postEncodeGZipMessage ' + cnt.toString() + ': ' + data.byteLength);
  //  postMessage(worker, { cmd: 'gzip_encode', data: data, id: cnt });
  //}
  //export function postFinishGZipMessage(worker: Worker) {
  //  cnt++;
  //  mp3WorkerLib.log('postFinishGZipMessage ' + cnt.toString());
  //  postMessage(worker, { cmd: 'gzip_finish', data: null, id: cnt });
  //}
    //in_samplerate: number;
    //isAbr: boolean;
    ////pro isAbr=true
    //VBR_mean_bitrate_kbps: number;
    ////pro isAbr=false
    //VBR_quality: number;
    ////prvni buffer v init operaci
    //firstData_ieee_float: channels;
    ////XXX
    //firstData: Uint16Array | string;
    //firstDataStr: string;

  //var mp3codec: any;
  //interface uploadChunk {
  //  id: number;
  //  data: Uint16Array | string;
  //}
  //var toUploadChunks: Array<uploadChunk>;
  //var finishDiscCompleted: () => void;
  //var inAjax = false;
  //var gzip: pako.Deflate;


}

