var schoolCpv;
(function (schoolCpv) {
    //https://typescript.codeplex.com/workitem/1065 
    //d:\ProgramFiles\Common7\IDE\VWDExpressExtensions\TypeScript\
    var allCpvs = [];
    (function (PlayStatus) {
        PlayStatus[PlayStatus["initializing"] = 0] = "initializing";
        PlayStatus[PlayStatus["toPlay"] = 1] = "toPlay";
        PlayStatus[PlayStatus["playFile"] = 2] = "playFile";
        PlayStatus[PlayStatus["toRecord"] = 3] = "toRecord";
        PlayStatus[PlayStatus["recording"] = 4] = "recording";
        PlayStatus[PlayStatus["toPlayMemory"] = 5] = "toPlayMemory";
        PlayStatus[PlayStatus["playMemory"] = 6] = "playMemory";
    })(schoolCpv.PlayStatus || (schoolCpv.PlayStatus = {}));
    var PlayStatus = schoolCpv.PlayStatus;
    var model = (function () {
        function model(id, xap) {
            var _this = this;
            this.id = id;
            this.xap = xap;
            this.play = new btn("play");
            this.record = new btn("record");
            this.replay = new btn("replay");
            //installSlUrl(): string { return SndLow.slInstallUrl; }
            this.allDisabled = false; //je potreba instalace SL => buttony jsou disabled
            //showAlowMicrophoneBtn = ko.observable<boolean>(false);
            //needInstall = ko.observable<boolean>(true);
            //slvisible = ko.observable<boolean>(false);
            this.title = ko.observable('');
            this.destroy = function () {
                if (_this.driver) {
                    _this.driver.stop();
                    if (_this.driver.recHandler)
                        _this.driver.recordEnd(false);
                }
                if (_this.timerId != 0)
                    clearTimeout(_this.timerId);
                _this.timerId = 0;
            };
            this.timerId = 0;
            var self = this;
            allCpvs[id] = this;
            this.play.owner = this.record.owner = this.replay.owner = this;
            //this.destroy = () => {
            //  if (self.driver) {
            //    self.driver.stop();
            //    if (self.driver.recHandler) self.driver.recHandler.recordEnd();
            //  }
            //  if (self.timerId != 0) clearTimeout(self.timerId); self.timerId = 0;
            //}
        }
        model.prototype.setRecorderSound = function (recorderSound) {
            if (this.recorderSound)
                this.recorderSound.close();
            this.recorderSound = recorderSound;
        };
        model.prototype.init = function (completed) {
            var _this = this;
            if (this.driver) {
                completed();
                return;
            }
            SndLow.getGlobalMedia().adjustGlobalDriver(true, function (dr, disabled) {
                _this.driver = dr;
                _this.allDisabled = disabled;
                completed();
            });
        };
        model.prototype.htmlClearing = function () {
            this.setRecorderSound(null);
            SndLow.htmlClearing(this.id);
        };
        model.prototype.setBtn = function (btn, disabled, active, playing) {
            btn.disabled(disabled);
            btn.active(active);
            btn.playing(playing);
        };
        model.prototype.setButtonsStatus = function () {
            this.setBtn(this.play, this.allDisabled || this.playStatus == PlayStatus.recording, this.playStatus == PlayStatus.toPlay || this.playStatus == PlayStatus.playFile, this.playStatus == PlayStatus.playFile);
            this.setBtn(this.record, this.allDisabled, this.playStatus == PlayStatus.toRecord || this.playStatus == PlayStatus.recording, this.playStatus == PlayStatus.recording);
            //this.setBtn(this.replay, !this.driver || !this.driver.recHandler.recordingExists(), this.playStatus == PlayStatus.toPlayMemory/* || this.playStatus == PlayStatus.playMemory*/, this.playStatus == PlayStatus.playMemory);
            this.setBtn(this.replay, this.allDisabled || this.playStatus == PlayStatus.recording || !this.driver || !this.recorderSound, this.playStatus == PlayStatus.toPlayMemory || this.playStatus == PlayStatus.playMemory, this.playStatus == PlayStatus.playMemory);
        };
        model.prototype.hide = function (s, ev) {
            this.setRecorderSound(null);
            this.destroy();
            anim.collapseExpandedSlow();
            //this.slvisible(false);
            if (ev) {
                ev.cancelBubble = true;
                ev.stopPropagation();
            }
            return false;
        };
        model.prototype.playSound = function (isUrl) {
            var self = this;
            self.driver.url = null;
            self.driver.play(isUrl ? self.url : self.recorderSound.url, isUrl ? self.begPos * 1000 : 0, null);
        };
        model.prototype.show = function (url, title, begPos, endPos) {
            var _this = this;
            //this.stopStatus = { play: false, record: false, replay: false };
            this.playStatus = PlayStatus.initializing;
            this.url = url.toLowerCase(); /*this.computeUrl(url);*/
            this.title(title);
            this.begPos = begPos ? begPos / 1000 : 0;
            this.endPos = endPos ? endPos / 1000 : 1000000;
            var self = this;
            //Inicializace SL
            this.init(function () {
                self.playStatus = PlayStatus.toPlay;
                //self.slvisible(true);
                anim.show($('#' + self.id));
                //if (self.driver) self.driver.recHandler.clearRecording();
            });
            //Timer
            this.timerId = setInterval(function () {
                if (self.driver && self.driver.recHandler) {
                    //if (!self.driver.recHandler.alowMicrophone()) {//neni dovolen mikrofon
                    //  self.showAlowMicrophoneBtn(true); return;
                    //}
                    //self.showAlowMicrophoneBtn(false);
                    //stavy, nastavene klikem na button
                    if (!self.driver.handler.paused)
                        if (self.isRecordedSound())
                            self.playStatus = PlayStatus.playMemory;
                        else
                            self.playStatus = PlayStatus.playFile;
                    else if (self.driver.recHandler.isRecording())
                        self.playStatus = PlayStatus.recording;
                    //kontrola, zdali jeste bezi prehravani
                    switch (self.playStatus) {
                        case PlayStatus.playFile:
                            if (self.driver.handler.paused)
                                self.playStatus = PlayStatus.toRecord; //prestalo se prehravat vzor
                            else if (!self.isRecordedSound() && self.endPos && self.endPos <= self.driver.handler.currentTime)
                                self.driver.stop(); //dosazeno konce prehrani vzoru
                            break;
                        case PlayStatus.recording:
                            if (!self.driver.recHandler.isRecording())
                                self.playStatus = PlayStatus.toPlayMemory; //prestalo se nahravat
                            break;
                        case PlayStatus.playMemory:
                            if (self.driver.handler.paused)
                                self.playStatus = PlayStatus.toPlay; //prestalo se prehravat nahravka studenta
                            break;
                    }
                }
                //aktualizace stavu butonu
                _this.setButtonsStatus();
            }, 50);
        };
        model.prototype.isRecordedSound = function () {
            //return !this.driver.url || Utils.startsWith(this.driver.url, 'blob');
            return this.recorderSound && this.driver.url.toLowerCase() == this.recorderSound.url.toLowerCase();
        };
        return model;
    })();
    schoolCpv.model = model;
    function show(id, url, title, begPos, endPos) {
        allCpvs[id].show(url, title, begPos, endPos);
    }
    schoolCpv.show = show;
    function hide(id) {
        allCpvs[id].hide();
    }
    schoolCpv.hide = hide;
    var btn = (function () {
        function btn(id) {
            var _this = this;
            this.id = id;
            this.active = ko.observable(false);
            this.playing = ko.observable(false);
            this.disabled = ko.observable(false);
            this.iconClass = ko.computed(function () {
                var cls = "";
                switch (_this.id) {
                    case "replay":
                    case "play":
                        cls = _this.playing() ? "stop" : "play";
                        break;
                    case "record":
                        cls = _this.playing() ? "stop" : "circle";
                        break;
                }
                return "fa-" + cls;
            });
        }
        btn.prototype.text = function () {
            switch (this.id) {
                case "play": return CSLocalize('4bbab8260cf44783ade8f733a142866d', 'Listen to the original');
                case "record": return CSLocalize('e409b368170645e58cfd835473cb9561', 'Record');
                case "replay": return CSLocalize('0590834dbf264906ae88c717f81170cf', 'Check your recording');
            }
        };
        btn.prototype.click = function (s, ev) {
            var _this = this;
            if (this.disabled())
                return;
            //rec.alowTitle = CSLocalize('7da1fdbb748447bb83e9bbe135e543cc', 'Allow microphone');
            switch (this.id) {
                case "play":
                case "replay":
                    if (this.playing())
                        this.owner.driver.stop();
                    else
                        this.owner.playSound(this.id == "play");
                    break;
                case "record":
                    if (this.playing())
                        setTimeout(function () { return _this.owner.driver.recordEnd(true); }, 500);
                    else
                        this.owner.driver.recordStart({
                            toDisc: false,
                            toDiscFileUrl: null,
                            toMemoryCompleted: function (mp3Data) { return _this.owner.setRecorderSound(new SndLow.recordedSound(_this.owner.driver, mp3Data)); },
                            actHtml5SampleRate: 0,
                            isRecording: null,
                            miliseconds: null,
                            recordStarting: null,
                            toMemoryCompletedData: null,
                        });
                    break;
            }
            ev.cancelBubble = true;
            ev.stopPropagation();
            return false;
        };
        return btn;
    })();
    schoolCpv.btn = btn;
})(schoolCpv || (schoolCpv = {}));
var Pager;
(function (Pager) {
    //klik na mikrofon ve cviceni
    function callCPV(ev, url, title, begPos, endPos) {
        schoolCpv.show(schools.tExCpv, url, title, begPos, endPos);
    }
    Pager.callCPV = callCPV;
})(Pager || (Pager = {}));
