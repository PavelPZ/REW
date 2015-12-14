var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SndLow;
(function (SndLow) {
    var globalMedia = (function () {
        function globalMedia() {
            //slInstalled = false;
            this.slInstalled = Silverlight.isInstalled(slVersion);
            this.needInstall = ko.observable(false);
            _globalMedia = this;
            try {
                console.log('soundnew.ts: Player.selectDriver start');
                //init result
                playerType = LMComLib.SoundPlayerType.no;
                SndLow.recordingType = LMComLib.SoundPlayerType.no;
                //get static info
                var isHtmlAudioVideo = html5_CanPlay(media.audio_mp3) && (html5_CanPlay(media.video_mp4) || html5_CanPlay(media.video_webm));
                var isHtmlCapture = html5Recorder.checkHTML5AudioCapture() && html5_CanPlay(media.audio_wave);
                //compute audio a recording type
                if (isHtmlCapture && isHtmlAudioVideo) {
                    playerType = SndLow.recordingType = LMComLib.SoundPlayerType.HTML5;
                }
                else if (this.slInstalled) {
                    playerType = SndLow.recordingType = LMComLib.SoundPlayerType.SL;
                }
                else if (isHtmlAudioVideo) {
                    playerType = LMComLib.SoundPlayerType.HTML5;
                    SndLow.recordingType = LMComLib.SoundPlayerType.SL;
                    this.renderSLInstallHTML = true;
                }
                else {
                    playerType = SndLow.recordingType = LMComLib.SoundPlayerType.SL;
                    this.renderSLInstallHTML = true;
                }
                if (this.renderSLInstallHTML)
                    Pager.renderTemplateEx('global-media', 'install_sl', this);
                console.log('soundnew.ts: Player.selectDriver end');
            }
            catch (msg) {
                console.log('Error: Player.selectDriver', msg);
                debugger;
                throw msg;
            }
        }
        globalMedia.prototype.adjustGlobalDriver = function (isRecorder, completed) {
            var _this = this;
            var doCompleted = function (dr) {
                var disbl = dr == _dummyDriver;
                _this.needInstall(disbl);
                completed(dr, disbl);
            };
            //hotovo
            if (!isRecorder && SndLow.globalAudioPlayer) {
                doCompleted(SndLow.globalAudioPlayer);
                return;
            }
            if (isRecorder && SndLow.globaRecorder) {
                doCompleted(SndLow.globaRecorder);
                return;
            }
            if (!isRecorder) {
                SndLow.createDriver(false, 'slplayer', null, 'cls-audio-unvisible', false, function (dr) {
                    SndLow.globalAudioPlayer = dr;
                    if (dr.type == SndLow.recordingType)
                        SndLow.globaRecorder = dr;
                    doCompleted(dr);
                });
            }
            else {
                if (SndLow.globalAudioPlayer)
                    SndLow.globalAudioPlayer.htmlClearing();
                SndLow.createDriver(false, 'slplayer', null, 'cls-audio-unvisible', true, function (dr) {
                    SndLow.globaRecorder = SndLow.globalAudioPlayer = dr;
                    doCompleted(dr);
                });
            }
        };
        return globalMedia;
    })();
    SndLow.globalMedia = globalMedia;
    function getGlobalMedia() { if (!_globalMedia)
        new globalMedia(); return _globalMedia; }
    SndLow.getGlobalMedia = getGlobalMedia;
    var _globalMedia;
    function dummyDriver() {
        if (!_dummyDriver)
            _dummyDriver = new MediaDriver(false, null, null);
        return _dummyDriver;
    }
    SndLow.dummyDriver = dummyDriver;
    var _dummyDriver;
    function needInstallFalse() {
        if (!_globalMedia)
            return;
        _globalMedia.needInstall(false);
    }
    SndLow.needInstallFalse = needInstallFalse;
    //export var globalAudioPlayer: MediaDriver;
    //export var globaRecorder: MediaDriver;
    //export function adjustGlobalDriver(isRecorder: boolean, completed: (driver: MediaDriver) => void) {
    //  //hotovo
    //  if (!isRecorder && globalAudioPlayer) { completed(globalAudioPlayer); return; }
    //  if (isRecorder && globaRecorder) { completed(globaRecorder); return; }
    //  //
    //  selectDriver();
    //  if (!isRecorder) {
    //    SndLow.createDriver(false, 'slplayer', null, 'cls-audio-unvisible', false, dr => {
    //      globalAudioPlayer = dr;
    //      if (dr.type == recordingType) globaRecorder = dr;
    //      completed(dr);
    //    });
    //  } else {
    //    SndLow.createDriver(false, 'slplayer', null, 'cls-audio-unvisible', true, dr => {
    //      globaRecorder = globalAudioPlayer = dr;
    //      completed(dr);
    //    });
    //  }
    //}
    function guiBlocker(isStart) {
        if (isStart) {
            if (guiBlockerTimer) {
                debugger;
                throw 'guiBlockerTimer';
            }
            guiBlockerTimer = setTimeout(function () { guiBlockerTimer = 0; guiBlockerLow(true); }, 300);
        }
        else {
            if (guiBlockerTimer) {
                clearTimeout(guiBlockerTimer);
                guiBlockerTimer = 0;
            }
            guiBlockerLow(false);
        }
    }
    SndLow.guiBlocker = guiBlocker;
    ;
    var guiBlockerTimer;
    function guiBlockerLow(isStart) {
        var bg = $('.block-gui');
        if (bg.length == 0)
            return;
        if (isStart)
            bg.removeClass('hide');
        else
            bg.addClass('hide');
    }
    ;
    //http://www.htmlgoodies.com/html5/client/how-to-embed-video-using-html5.html#fbid=XRsS9osNoHa
    function createDriver(isVideo, id, parentId, htmltagClass, isRecording, completed) {
        //selectDriver();
        if (allDrivers[id]) {
            completed(allDrivers[id]);
            return;
        }
        var gm = getGlobalMedia();
        var $parent = _.isEmpty(parentId) ? null : $(parentId);
        var parent = $parent && $parent.length == 1 ? $parent[0] : null;
        var driverType = isRecording ? SndLow.recordingType : (cfg.forceDriver ? cfg.forceDriver : playerType);
        switch (driverType) {
            case LMComLib.SoundPlayerType.HTML5:
                allDrivers[id] = new MediaDriver_Html5(isVideo, id, parent, htmltagClass);
                completed(allDrivers[id]);
                break;
            case LMComLib.SoundPlayerType.SL:
                if (!gm.slInstalled) {
                    //gm.needInstall(true);
                    completed(dummyDriver());
                }
                else {
                    allDrivers[id] = new MediaDriver_SL(isVideo, id, parent, htmltagClass, function (driver) { return completed(driver); });
                    break;
                }
        }
    }
    SndLow.createDriver = createDriver;
    var allDrivers = {}; //evidence vsech driveru.
    var playerType; //v selectDriver(): staticky zjisteny SoundPlayerType
    //var slInstalled: boolean; //staticky SLInstalled test
    function htmlClearing(id) {
        guiBlocker(false);
        var dr = allDrivers[id];
        if (!dr)
            return;
        dr.htmlClearing();
        delete allDrivers[id];
    }
    SndLow.htmlClearing = htmlClearing;
    function Stop(actDriver) {
        if (actDriver === void 0) { actDriver = null; }
        Logger.trace_lmsnd('soundnew.ts: SndLow.stop');
        for (var id in allDrivers)
            if (allDrivers[id].handler && allDrivers[id] != actDriver) {
                allDrivers[id].stop();
                if (allDrivers[id].recHandler)
                    allDrivers[id].recordEnd(false);
            }
    }
    SndLow.Stop = Stop;
    (function (media) {
        media[media["video_mp4"] = 1] = "video_mp4";
        media[media["video_webm"] = 2] = "video_webm";
        media[media["audio_mp3"] = 4] = "audio_mp3";
        media[media["audio_wave"] = 8] = "audio_wave";
    })(SndLow.media || (SndLow.media = {}));
    var media = SndLow.media;
    var canPlayRes = -1;
    function html5_CanPlay(m) {
        if (canPlayRes == -1) {
            canPlayRes = 0;
            var elem = document.createElement('audio');
            if (elem.canPlayType) {
                if (elem.canPlayType('audio/mpeg;').replace(/^no$/, '') != '')
                    canPlayRes |= media.audio_mp3;
                if (elem.canPlayType('audio/wav').replace(/^no$/, '') != '')
                    canPlayRes |= media.audio_wave;
            }
            elem = document.createElement('video');
            if (elem.canPlayType) {
                if (elem.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, '') != '')
                    canPlayRes |= media.video_mp4;
                if (elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '') != '')
                    canPlayRes |= media.video_webm;
            }
        }
        return (canPlayRes & m) != 0;
    }
    SndLow.html5_CanPlay = html5_CanPlay;
    function compareBrowserVersion(a, b) { return compVerRec(a.split("."), b.split(".")); }
    function compVerRec(a, b) {
        if (a.length == 0)
            a = ['0'];
        if (b.length == 0)
            b = ['0'];
        if (a[0] != b[0] || (a.length == 1 && b.length == 1))
            return parseInt(a[0]) - parseInt(b[0]);
        return compVerRec(a.slice(1), b.slice(1));
    }
    //zvuk v pameti (pro html5 i SL)
    var recordedSound = (function () {
        function recordedSound(driver, data) {
            this.driver = driver;
            if (typeof data === 'string') {
                this.url = data;
            }
            else {
                this.isMemory = true;
                this.url = driver.createObjectURL(data);
            }
        }
        recordedSound.prototype.close = function () { if (this.isMemory)
            this.driver.revokeObjectURL(this.url); };
        return recordedSound;
    })();
    SndLow.recordedSound = recordedSound;
    var MediaDriver = (function () {
        //alowTitle(): string { return ''; }
        function MediaDriver(isVideo, id, parent) {
            this.isVideo = isVideo;
            this.id = id;
            this.parent = parent;
            this.timerId = 0;
        }
        //Playing
        MediaDriver.prototype.openFile = function (url) { debugger; };
        //Recording
        MediaDriver.prototype.recordStart = function (par) { debugger; };
        MediaDriver.prototype.recordEnd = function (finishAudioFile) { debugger; };
        MediaDriver.prototype.createObjectURL = function (data) { debugger; return null; };
        MediaDriver.prototype.revokeObjectURL = function (url) { debugger; };
        MediaDriver.prototype.htmlClearing = function () { try {
            this.stop(); /*this.setTimer(null);*/
            delete allDrivers[this.id];
            if (!this.htmlElement)
                return;
            this.htmlElement.remove();
            this.htmlElement = null;
        }
        catch (msg) { } };
        //begMsec<0 => pouze open. endMsec<0 => hraje se do konce
        MediaDriver.prototype.openPlay = function (url, begMsec, endMsec /*, onBlockGui: (isStart: boolean) => void = null*/) {
            SndLow.Stop(this);
            var th = this;
            th.onCanplaythrough = th.onPaused = th.timeupdate = null;
            if (th.actPlayer)
                th.actPlayer.reject();
            var def = th.actPlayer = $.Deferred();
            th.onPaused = function () { if (th.onCanplaythrough)
                return; th.onPaused = null; th.timeupdate = null; def.resolve(); };
            th.timeupdate = function (msec) {
                if (endMsec > 0 && msec > endMsec)
                    th.handler.pause();
                else
                    def.notify(msec);
            };
            th.onCanplaythrough = function () {
                th.onCanplaythrough = null;
                if (begMsec < 0)
                    def.resolve(); //pouze open
                else {
                    th.handler.currentTime = begMsec / 1000;
                    th.handler.play();
                }
            };
            th.openFile(url);
            return def.promise();
        };
        MediaDriver.prototype.doTimeupdate = function () { if (!this.timeupdate)
            return; try {
            this.timeupdate(Math.round(this.handler.currentTime * 1000));
        }
        catch (msg) { } };
        MediaDriver.prototype.doPaused = function () { Logger.trace_lmsnd('soundnew.ts: MediaDriver.doPaused'); if (!this.onPaused)
            return; try {
            this.onPaused();
        }
        catch (msg) { } };
        MediaDriver.prototype.doCanplaythrough = function () { guiBlocker(false); Logger.trace_lmsnd('soundnew.ts: MediaDriver.doCanplaythrough'); if (!this.onCanplaythrough)
            return; try {
            this.onCanplaythrough();
        }
        catch (msg) { } };
        MediaDriver.prototype.doLoading = function (isStart) { Logger.trace_lmsnd('soundnew.ts: MediaDriver.doLoading'); if (!this.loading)
            return; try {
            this.loading(isStart);
        }
        catch (msg) { } };
        MediaDriver.prototype.onError = function (err) {
            this.errorFlag = true;
            setTimeout(function () { this.errorFlag = false; }, 100); //nastav na chvili errorFlag, aby byla sance na ukonceni timeru.
            Logger.error_snd('Audio error', err); //LMSnd.options.onError("HTML5 Error code: " + err);
            try {
                this.stop();
            }
            catch (e) { }
        };
        MediaDriver.prototype.stop = function () {
            Logger.trace_lmsnd('soundnew.ts: MediaDriver.stop start');
            try {
                //if (this.actPlayer) { this.actPlayer.reject(); this.actPlayer = null; }
                if (this.handler)
                    this.handler.pause();
                this.recordingChanged(false);
                Logger.trace_lmsnd('soundnew.ts: MediaDriver.stop end');
            }
            catch (msg) {
                Logger.error_snd('MediaDriver.stop', msg);
                debugger;
                throw msg;
            }
        };
        MediaDriver.prototype.doRecordingCompleted = function () {
            Logger.trace_lmsnd('soundnew.ts: doRecordingCompleted beg');
            delete this.recordWorker;
            if (!this.recordStartPar || !this.recordStartPar.toMemoryCompleted)
                return;
            this.recordStartPar.toMemoryCompleted(this.recordStartPar.toMemoryCompletedData);
            delete this.recordStartPar;
            Logger.trace_lmsnd('soundnew.ts: doRecordingCompleted end');
        };
        MediaDriver.prototype.recordingChanged = function (isRec) {
            if (!this.recordStartPar || !this.recordStartPar.isRecording)
                return;
            this.recordStartPar.isRecording(isRec);
            //if (!isRec) { this.recordStartPar.isRecording = null; this.recordStartPar.miliseconds = null; }
        };
        MediaDriver.prototype.play = function (url, msecPos, playProgress) {
            var th = this;
            this.openPlay(url, msecPos, -1).
                done(function () { if (playProgress)
                playProgress(-1); }).
                progress(function (msec) { if (playProgress)
                playProgress(msec + 50); });
        };
        return MediaDriver;
    })();
    SndLow.MediaDriver = MediaDriver;
    function createMP3Worker(driver) {
        var par = driver.recordStartPar;
        if (mp3WorkerLib.isOldBrowser) {
            return mp3Worker.worker = {
                postMessage: function (msg) {
                    switch (msg.cmd) {
                        case 'end':
                            Logger.trace_lmsnd('createMP3Worker end');
                            Pager.blockGui(false);
                            driver.doRecordingCompleted();
                            break;
                    }
                }
            };
        }
        else {
            var workerJs = 'wavWorker';
            var worker = new Worker('../jslib/js/sound/' + workerJs + '.js');
            var res = [];
            worker.onmessage = function (ev) {
                switch (ev.data.cmd) {
                    case 'data':
                    case 'end':
                        if (par.toDisc) {
                            if (ev.data.cmd == 'end') {
                                worker.terminate();
                                worker = null;
                                Logger.trace_lmsnd('createMP3Worker end');
                                Pager.blockGui(false);
                                driver.doRecordingCompleted();
                            }
                        }
                        else {
                            var data = ev.data.data;
                            mp3WorkerLib.log('push ' + ev.data.cmd + ' ' + ev.data.id + ': ' + data.byteLength.toString());
                            res.push(data);
                            if (ev.data.cmd == 'end') {
                                worker.terminate();
                                worker = null;
                                Logger.trace_lmsnd('createMP3Worker end');
                                //concatenate chunks to one array
                                var len = 0;
                                _.each(res, function (r) { return len += r.length; });
                                var mp3 = new Uint8Array(len);
                                var pos = 0;
                                _.each(res, function (r) { mp3.set(r, pos); pos += r.length; });
                                Pager.blockGui(false);
                                par.toMemoryCompletedData = mp3.buffer;
                                driver.doRecordingCompleted();
                            }
                        }
                        break;
                }
            };
            return worker;
        }
    }
    SndLow.createMP3Worker = createMP3Worker;
    //http://code.tutsplus.com/tutorials/html5-audio-and-video-what-you-must-know--net-15545
    //https://developer.mozilla.org/en-US/Apps/Build/Audio_and_video_delivery/buffering_seeking_time_ranges
    var MediaDriver_Html5 = (function (_super) {
        __extends(MediaDriver_Html5, _super);
        function MediaDriver_Html5(isVideo, id, parent, htmltagClass) {
            _super.call(this, isVideo, id, parent);
            this.type = LMComLib.SoundPlayerType.HTML5;
            try {
                var th = this;
                Logger.trace_lmsnd('soundnew.ts: MediaDriver_Html5.init start');
                th.htmlElement = $(isVideo ? '<video id="driver-' + id + '" class="cls-video embed-responsive-item' + (htmltagClass ? htmltagClass : '') + '"></video>' : '<audio id="driver-' + id + '" class="cls-audio ' + (htmltagClass ? htmltagClass : '') + '"></audio>');
                th.html5Handler = (th.htmlElement[0]);
                th.handler = th.html5Handler;
                th.recHandler = new html5Recorder.RecHandler();
                var $par = parent ? $(parent) : $('body');
                if (isVideo) {
                    var parClasses = $par.attr('class').split(/\s+/);
                    _.each(parClasses, function (cls) { if (cls.indexOf('video-') != 0)
                        return; th.htmlElement.addClass(cls); });
                }
                $par.prepend(th.htmlElement[0]);
                if (!th.html5Handler.load) {
                    debugger;
                    throw 'MediaDriver_Html5.init: cannot find load method of audio/video tag';
                } //kontrola audio objektu
                $(th.html5Handler).
                    on('error', function () { return th.onError(th.html5Handler.error.code.toString()); }).
                    on('loadeddata', function () { return th.doCanplaythrough(); }).
                    on('ended', function () { return th.doPaused(); }).
                    on('pause', function () { return th.doPaused(); }).
                    on('timeupdate', function () { return th.doTimeupdate(); });
                Logger.trace_lmsnd('soundnew.ts: HTML5.init end');
            }
            catch (msg) {
                Logger.error_snd('MediaDriver_Html5.init', msg);
                debugger;
                throw msg;
            }
        }
        MediaDriver_Html5.prototype.recordStart = function (par) {
            var _this = this;
            this.recordStartPar = par;
            this.recordedMilisecs = 0;
            if (!par.toDisc)
                this.memorySound = [];
            if (par.toDisc) {
                this.recordWorkerInitialized = false;
                this.recordWorker = createMP3Worker(this);
            }
            var cfg = null;
            html5Recorder.startRecording(function (ev) {
                var sampleRate = 8000;
                if (!_this.recordWorkerInitialized && par.recordStarting)
                    par.recordStarting();
                if (!cfg)
                    cfg = WavePCM.getConfig(ev.inputBuffer.sampleRate, html5Recorder.bufferLength, sampleRate);
                var floatBuf = new Float32Array(ev.inputBuffer.getChannelData(0));
                var buf = WavePCM.toPCM(cfg, floatBuf);
                if (par.toDisc) {
                    if (!_this.recordWorkerInitialized) {
                        _this.recordWorkerInitialized = true;
                        _this.recordingChanged(true);
                        var hdr = new Uint16Array(3);
                        hdr[0] = sampleRate;
                        hdr[1] = 16;
                        hdr[2] = 1;
                        mp3WorkerLib.postInitHTML5Message(_this.recordWorker, {
                            recordStartPar: mp3WorkerLib.getWorkerRecordStartPar(_this.recordStartPar),
                            pagerBasicUrl: Pager.basicUrl, firstData: hdr //, in_samplerate: sampleRate, isAbr: null, VBR_mean_bitrate_kbps: null, firstData: hdr, firstData_ieee_float: null, VBR_quality: 0
                        });
                        mp3WorkerLib.postEncodeHTML5Message(_this.recordWorker, buf);
                    }
                    else {
                        mp3WorkerLib.postEncodeHTML5Message(_this.recordWorker, buf);
                    }
                }
                else {
                    _this.recordStartPar.actHtml5SampleRate = ev.inputBuffer.sampleRate;
                    _this.memorySound.push(floatBuf);
                }
                _this.recordedMilisecs += floatBuf.length / ev.inputBuffer.sampleRate * 1000;
                if (_this.recordStartPar.miliseconds) {
                    _this.recordStartPar.miliseconds(_this.recordedMilisecs); //this.recordedMilisecs / ev.inputBuffer.sampleRate * 1000);
                }
            });
        };
        MediaDriver_Html5.prototype.recordEnd = function (finishAudioFile) {
            this.recordingChanged(false);
            html5Recorder.stopRecording();
            if (!this.recordStartPar || !finishAudioFile)
                return;
            if (this.recordStartPar.toDisc) {
                Pager.blockGui(true);
                mp3WorkerLib.postFinishHTML5Message(this.recordWorker);
            }
            else {
                var view = html5Recorder.encodeWAV(this.memorySound, this.recordStartPar.actHtml5SampleRate);
                this.recordStartPar.toMemoryCompletedData = view.buffer;
                this.doRecordingCompleted();
            }
            //this.recordWorker = null; this.recordStartPar = null; this.memorySound = null;
        };
        MediaDriver_Html5.prototype.createObjectURL = function (data) {
            var blob = new Blob([new DataView(data)], { type: "audio/wav" });
            return URL.createObjectURL(blob);
        };
        MediaDriver_Html5.prototype.revokeObjectURL = function (url) { URL.revokeObjectURL(url); };
        MediaDriver_Html5.prototype.isRecording = function () { return html5Recorder.audioNodesConnected; };
        MediaDriver_Html5.prototype.formatCommandline = function (url) {
            var th = this;
            if (typeof url === 'string') {
                var s = url.toLowerCase();
                th.url = url;
            }
            else
                delete th.url;
        };
        MediaDriver_Html5.prototype.openFile = function (url) {
            var th = this;
            if (!url) {
                th.url = '';
                return;
            }
            Logger.trace_lmsnd('soundnew.ts: MediaDriver_Html5.openFile start: url=' + url);
            try {
                var urlLow = url.toLowerCase();
                if (!th.url || th.url.indexOf(urlLow) < 0) {
                    Logger.trace_lmsnd('soundnew.ts: MediaDriver_Html5.openFile jine URL');
                    th.html5Handler.src = url;
                    th.url = urlLow;
                    th.html5Handler.load();
                }
                else {
                    Logger.trace_lmsnd('soundnew.ts: MediaDriver_Html5.openFile stejne URL');
                    if (th.onCanplaythrough)
                        th.onCanplaythrough();
                }
            }
            catch (msg) {
                th.html5Handler.src = null;
                Logger.error_snd('MediaDriver_Html5.openFile', msg);
                debugger;
                throw msg;
            }
        };
        return MediaDriver_Html5;
    })(MediaDriver);
    SndLow.MediaDriver_Html5 = MediaDriver_Html5;
    //export interface IPCMEventArgument {
    //  Value: string;
    //  BitsPerSample: number; SamplesPerSecond: number;
    //}
    var slWarning;
    //var slVersion = "5.0.61118.0";
    var slVersion = "5.1.20913.0";
    SndLow.slInstallUrl = 'http://www.microsoft.com/getsilverlight';
    var MediaDriver_SL = (function (_super) {
        __extends(MediaDriver_SL, _super);
        function MediaDriver_SL(isVideo, id, parentEl, htmltagClass, completed) {
            var _this = this;
            _super.call(this, isVideo, id, parentEl);
            this.type = LMComLib.SoundPlayerType.SL;
            try {
                Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.constructor: init start');
                var self = this;
                var src = Silverlight.createObject(Pager.basicUrl + 'schools/slextension.xap', null, 'driver-' + id, 
                //var src = Silverlight.createObject(cfg.baseTagUrl ? cfg.baseTagUrl + '/schools/slextension.xap' : '../schools/slextension.xap', null, 'driver-' + id,
                //var src = Silverlight.createObject('slextension.xap', null, 'driver-' + id,
                { autoUpgrade: 'true', background: 'white', minRuntimeVersion: slVersion, alt: 'LANGMaster', enablehtmlaccess: 'true' }, {
                    onError: function (msg) { return _this.onError(msg); },
                    onLoad: function (sender) {
                        try {
                            Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.constructor: onLoad start');
                            var video = sender.getHost().content.HTML5Like;
                            var slObj = $('#' + id);
                            self.handler = self.recHandler = self.slHandler = video;
                            self.isVideo = isVideo;
                            video.alowTitle = CSLocalize('f9726cae800748ef83e29f8d3c2cbb98', 'Alow microphone');
                            video.addEventListener("onCanplaythrough", function () { return self.doCanplaythrough(); });
                            video.addEventListener("onPaused", function () { return self.doPaused(); });
                            video.addEventListener("timeupdate", function () { return self.doTimeupdate(); });
                            video.addEventListener("OnPCMData", function (sender, ev) { try {
                                self.slOnPCMData(ev.Value);
                            }
                            catch (exp) {
                                exp = null;
                            } });
                            video.addEventListener("OnRecordedMilisecs", function (sender, ev) {
                                try {
                                    if (self.recordStartPar.miliseconds)
                                        _this.recordStartPar.miliseconds(ev.Value);
                                }
                                catch (exp) { }
                            });
                            completed(self);
                            Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.constructor: onLoad end');
                        }
                        catch (msg) {
                            Logger.error_snd('soundnew.ts: MediaDriver_SL.constructor: onLoad', msg);
                            debugger;
                            throw msg;
                        }
                    }
                }, "");
                src = src.replace('<object ', '<object class="cls-' + (isVideo ? 'video ' : 'audio ') + (htmltagClass ? htmltagClass : '') + '" ');
                var $parent = parentEl ? $(parentEl) : $('body');
                this.htmlElement = $(src);
                if (isVideo) {
                    var parClasses = $parent.attr('class').split(/\s+/);
                    _.each(parClasses, function (cls) { if (cls.indexOf('video-') != 0)
                        return; _this.htmlElement.addClass(cls); });
                }
                $parent.prepend(this.htmlElement[0]);
                this.parent = $parent[0];
                Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.constructor: init end');
            }
            catch (msg) {
                Logger.error_snd('soundnew.ts: MediaDriver_SL.constructor: init', msg);
                debugger;
                throw msg;
            }
        }
        MediaDriver_SL.prototype.isRecording = function () { return this.slHandler.isRecording(); };
        MediaDriver_SL.prototype.recordStart = function (par) {
            var _this = this;
            this.recordStartPar = par;
            this.recordedMilisecs = 0;
            this.recordWorkerInitialized = false;
            this.recordAlowMicrophone(function () {
                _this.slHandler.recordStart(par);
                if (!_this.recordWorkerInitialized && _this.recordStartPar.recordStarting)
                    _this.recordStartPar.recordStarting();
                _this.recordingChanged(true);
                if (par.toDisc) {
                    _this.recordWorker = createMP3Worker(_this);
                }
            });
        };
        MediaDriver_SL.prototype.recordAlowMicrophone = function (completed) {
            var _this = this;
            if (!this.slHandler.alowMicrophone()) {
                this.htmlElement.css('top', '0px');
                this.htmlElement.css('position', 'inherit');
                $(window).scrollTop(0);
                var testMicrophoneTimer = setInterval(function () {
                    if (!_this.slHandler.alowMicrophone())
                        return;
                    clearInterval(testMicrophoneTimer);
                    _this.htmlElement.css('top', '-50px');
                    _this.htmlElement.css('position', 'absolute');
                    completed();
                }, 100);
            }
            else
                completed();
        };
        MediaDriver_SL.prototype.recordEnd = function (finishAudioFile) {
            this.recordingChanged(false);
            this.slHandler.recordEnd();
            Logger.trace_lmsnd('MediaDriver_SL: after this.slHandler.recordEnd()');
            if (!finishAudioFile)
                return;
            if (this.recordStartPar.toDisc) {
                Pager.blockGui(true);
                mp3WorkerLib.postFinishSLMessage(this.recordWorker);
            }
            else {
                this.doRecordingCompleted();
            }
        };
        MediaDriver_SL.prototype.createObjectURL = function (data) { return this.slHandler.createObjectURL(); };
        MediaDriver_SL.prototype.revokeObjectURL = function (url) { this.slHandler.revokeObjectURL(url); };
        MediaDriver_SL.prototype.slOnPCMData = function (rawBase64) {
            if (!this.recordStartPar)
                return; //asi jiz volano recordEnd, dalsi PCM buffery jsou ignorovany
            if (!this.recordWorkerInitialized) {
                this.recordWorkerInitialized = true;
                mp3WorkerLib.postInitSLMessage(this.recordWorker, {
                    recordStartPar: mp3WorkerLib.getWorkerRecordStartPar(this.recordStartPar),
                    pagerBasicUrl: Pager.basicUrl, firstData: rawBase64,
                });
            }
            else {
                mp3WorkerLib.postEncodeSLMessage(this.recordWorker, rawBase64);
            }
            //this.recordedMilisecs += 1000 * ev.Value.length / (ev.BitsPerSample / 8) / ev.SamplesPerSecond;
            //if (this.recordStartPar.miliseconds) {
            //  this.recordStartPar.miliseconds(this.recordedMilisecs); //this.recordedMilisecs / ev.SamplesPerSecond * 1000);
            //}
        };
        MediaDriver_SL.prototype.openFile = function (urlOrBuffer) {
            Logger.trace_lmsnd('soundnew.ts: MediaDriver_SL.openFile start: url=' + urlOrBuffer);
            this.url = urlOrBuffer;
            this.slHandler.openFile(urlOrBuffer);
        };
        return MediaDriver_SL;
    })(MediaDriver);
    SndLow.MediaDriver_SL = MediaDriver_SL;
})(SndLow || (SndLow = {}));
//******************* Player pro EA
var LMSnd;
(function (LMSnd) {
    var Player = (function () {
        function Player() {
        }
        Player.init = function (_onStoped) {
            SndLow.getGlobalMedia().adjustGlobalDriver(false, function (dr, disabled) {
                onStoped = _onStoped;
            });
        };
        Player.playFile = function (url, sec) {
            try {
                Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.playFile start');
                if (!onStoped) {
                    debugger;
                    throw '!onStoped';
                }
                url = url.toLowerCase().replace('.wma', '.mp3');
                Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.playFile sec=' + sec.toString() + ', url=' + url);
                SndLow.globalAudioPlayer.play(url, sec * 1000, function (msec) {
                    if (msec < 0) {
                        onStoped();
                        Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.playFile stoped');
                    }
                    else {
                        Logger.trace_lmsnd('****** ' + msec.toString());
                        if (file)
                            file.onPlaying(msec);
                    }
                });
                Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.playFile end');
            }
            catch (msg) {
                Logger.error_snd('soundnew.ts: LMSnd.Player.playFile', msg);
                debugger;
                throw msg;
            }
        };
        Player.play = function (_file, msec) {
            try {
                Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.play start');
                file = _file;
                var url = _file.getFileUrl().toLowerCase();
                Player.playFile(url, msec / 1000);
                Logger.trace_lmsnd('soundnew.ts: LMSnd.Player.play end');
            }
            catch (msg) {
                Logger.error_snd('soundnew.ts: LMSnd.Player.playFile', msg);
                debugger;
                throw msg;
            }
        };
        Player.stop = function () {
            if (!SndLow.globalAudioPlayer || !SndLow.globalAudioPlayer.handler)
                return;
            try {
                SndLow.globalAudioPlayer.stop();
            }
            catch (err) { }
        };
        return Player;
    })();
    LMSnd.Player = Player;
    var onStoped;
    //export var driver: SndLow.MediaDriver;
    var file = null;
})(LMSnd || (LMSnd = {}));
//xx/#DEBUG
var Logger;
(function (Logger) {
    function trace_lmsnd(msg) {
        Logger.trace("Sound", msg);
    }
    Logger.trace_lmsnd = trace_lmsnd;
    function error_snd(where, msg) {
        Logger.error("Sound", msg, where);
    }
    Logger.error_snd = error_snd;
    ;
})(Logger || (Logger = {}));
//xx/#ENDDEBUG
//var SoundNoop = null; 
