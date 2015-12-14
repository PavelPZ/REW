var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Course;
(function (Course) {
    //********************************************* MEDIA controls GUI
    var mediaActivable = (function (_super) {
        __extends(mediaActivable, _super);
        function mediaActivable() {
            _super.apply(this, arguments);
            this.active = ko.observable(false);
        }
        return mediaActivable;
    })(Course.tagImpl);
    Course.mediaActivable = mediaActivable;
    var mediaTagImpl = (function (_super) {
        __extends(mediaTagImpl, _super);
        function mediaTagImpl() {
            _super.apply(this, arguments);
            this.loading = ko.observable(true);
            this.playing = ko.observable(false);
        }
        mediaTagImpl.prototype.myGrp = function () { return this._myPage.sndPage.grps[this._sentGroupId]; };
        return mediaTagImpl;
    })(mediaActivable);
    Course.mediaTagImpl = mediaTagImpl;
    var mediaBigMark = (function (_super) {
        __extends(mediaBigMark, _super);
        function mediaBigMark() {
            _super.apply(this, arguments);
        }
        mediaBigMark.prototype.play = function () { if (this.loading())
            return; this._myPage.sndPage.play(this._sentGroupId, -1); };
        return mediaBigMark;
    })(mediaTagImpl);
    Course.mediaBigMark = mediaBigMark;
    //ozvuceny text nebo dialog
    var mediaText = (function (_super) {
        __extends(mediaText, _super);
        function mediaText(data) {
            if (!data.passive)
                data.passive = false;
            if (!data.hidden)
                data.hidden = false;
            //if (!data.inline) data.inline = false;
            _super.call(this, data);
            if (this.passive)
                this.loading(false);
        }
        return mediaText;
    })(mediaTagImpl);
    Course.mediaText = mediaText;
    //video, vytvari driver na prehravani
    var mediaVideo = (function (_super) {
        __extends(mediaVideo, _super);
        function mediaVideo() {
            _super.apply(this, arguments);
            this.ratioClass = ko.observable('');
        }
        return mediaVideo;
    })(mediaTagImpl);
    Course.mediaVideo = mediaVideo;
    var mediaReplica = (function (_super) {
        __extends(mediaReplica, _super);
        function mediaReplica() {
            _super.apply(this, arguments);
        }
        mediaReplica.prototype.css = function () { return (_.isString(this.iconId) ? (this.iconId) : CourseModel.IconIds[this.iconId]) + " " + (this.dlgLeft ? "dlg-left" : "dlg-right"); };
        return mediaReplica;
    })(mediaActivable);
    Course.mediaReplica = mediaReplica;
    var mediaSent = (function (_super) {
        __extends(mediaSent, _super);
        function mediaSent() {
            _super.apply(this, arguments);
        }
        mediaSent.prototype.myText = function () { return (this._owner._tg == CourseModel.t_mediaReplica ? this._owner._owner : this._owner); };
        mediaSent.prototype.pageCreated = function () {
            _super.prototype.pageCreated.call(this);
            this.mySent = this._myPage.sndPage.sents[this.idx];
            if (!this.mySent)
                return; //pro passivni mediaText
            this.mySent.myMediaSents.push(this); //provazani media - snd sentence
            if (!this.Items || this.Items.length == 0)
                this.Items = [(this.mySent.text)]; //naplneni obsahu mediaSent
        };
        mediaSent.prototype.play = function () { if (this.myText().loading() || this.myText().passive)
            return; var grp = this.mySent._owner._owner; grp._owner._owner.play(grp.id, this.mySent.begPos); }; //play
        return mediaSent;
    })(mediaActivable);
    Course.mediaSent = mediaSent;
    //********************************************* SND HELPER OBJECTS
    var sndFileGroupImpl = (function (_super) {
        __extends(sndFileGroupImpl, _super);
        function sndFileGroupImpl(data) {
            _super.call(this, data);
            this.medieUrlAdjusted = false;
            if (!this.mediaUrl)
                return;
            var parts = this.mediaUrl.split('@');
            this.mediaUrl = parts[0];
            if (parts.length > 1)
                this.videoFormat = parts[1];
        }
        //allUrl() { return this.mediaUrl; }// this.audioUrl ? this.audioUrl : this.videoUrl; }
        sndFileGroupImpl.prototype.isVideo = function () { return this.videoFormat; };
        //vytvoreni html5 nebo SL driveru a naladovani media souboru
        sndFileGroupImpl.prototype.initProc = function (phase, getTypeOnly, completed) {
            var _this = this;
            switch (phase) {
                case Course.initPhase.afterRender:
                    if (!getTypeOnly) {
                        if (this.isVideo()) {
                            var allVids = (_.map(this.Items, function (gr) { return _.find(gr.myMediaTags, function (t) { return t._tg == CourseModel.tmediaVideo; }); }));
                            var vid = allVids[0];
                            SndLow.createDriver(true, vid.id, '#' + vid.id, null, false, function (dr) {
                                var grp = vid.myGrp();
                                grp._player = dr;
                                _this.adjustMediaUrl(dr); //spocti mediaUrl, videoRatio
                                _.each(allVids, function (v) { return v.ratioClass('embed-responsive-' + _this.videoRatio); }); //nastav velikost videa na strance
                                _this.driverLoaded(dr, function () {
                                    _.each(_.rest(allVids), function (subVid) { return SndLow.createDriver(true, subVid.id, '#' + subVid.id, null, false, function (subDr) {
                                        var subGrp = subVid.myGrp();
                                        subGrp._player = subDr;
                                        subDr.openPlay(_this.mediaUrl, -1, 0);
                                    }); });
                                });
                                completed();
                            });
                        }
                        else
                            SndLow.createDriver(false, this.Items[0].id, null, 'cls-audio-unvisible', false, function (dr) { _this.player = dr; completed(); _this.adjustMediaUrl(dr); _this.driverLoaded(dr); });
                    }
                    return Course.initPhaseType.async;
            }
            return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
        };
        sndFileGroupImpl.prototype.driverLoaded = function (dr, completed) {
            var _this = this;
            if (completed === void 0) { completed = null; }
            //return; //ladeni loading
            dr.openPlay(this.mediaUrl, -1, 0).done(function () {
                _this.duration = dr.handler.duration;
                _.each(_this.Items, function (grp) {
                    //dosad duration do single sentence grupy (majici endPos=-1)
                    if (grp.withoutCut)
                        grp.Items[0].endPos = grp.Items[0].Items[0].endPos = _this.duration * 1000;
                    grp.loading = false;
                    _.each(grp.myMediaTags, function (t) { return t.loading(false); });
                });
                if (completed)
                    completed();
            });
        };
        sndFileGroupImpl.prototype.adjustMediaUrl = function (dr) {
            if (this.medieUrlAdjusted)
                return;
            this.medieUrlAdjusted = true;
            var start = ((cfg.baseTagUrl ? cfg.baseTagUrl : Pager.basicDir) + this.mediaUrl).toLowerCase();
            //*** audio url
            if (!this.isVideo()) {
                this.mediaUrl = start;
                return;
            }
            //*** video url
            //potrebna extension
            var neededEx;
            switch (dr.type) {
                case LMComLib.SoundPlayerType.SL:
                    neededEx = 'mp4';
                    break;
                case LMComLib.SoundPlayerType.HTML5:
                    if (SndLow.html5_CanPlay(SndLow.media.video_mp4))
                        neededEx = 'mp4';
                    break;
                    if (SndLow.html5_CanPlay(SndLow.media.video_webm))
                        neededEx = 'webm';
                    break;
                    debugger;
                    throw 'Can play neither mp4 nor webm';
                default:
                    debugger;
                    throw 'missing driver';
            }
            //dostupne extensions x size
            var parts = this.videoFormat.split(':');
            this.videoRatio = parts[0];
            parts = parts[1].split('|');
            var sizeExt = [];
            _.each(parts, function (p) {
                var pparts = p.split('-');
                var availableExts = pparts[1].split(',');
                var ext = _.find(availableExts, function (e) { return Utils.endsWith(e, neededEx); });
                if (!ext)
                    return;
                sizeExt.push({ ext: ext, limit: pparts[0] == '*' ? 100000 : parseInt(pparts[0]) });
                return true;
            });
            if (sizeExt.length == 0) {
                debugger;
                throw 'cannot find extension for ext=' + neededEx;
            }
            //najdi optimalni extension dle limitu
            var docWidth = Math.min(10000, $(document).width());
            sizeExt = _.sortBy(sizeExt, function (s) { return s.limit; });
            var res = _.find(sizeExt, function (se) { return docWidth <= se.limit; });
            if (!res)
                res = sizeExt[sizeExt.length - 1];
            this.mediaUrl = start + '.' + res.ext;
        };
        return sndFileGroupImpl;
    })(Course.tagImpl);
    Course.sndFileGroupImpl = sndFileGroupImpl;
    var sndGroupImpl = (function (_super) {
        __extends(sndGroupImpl, _super);
        function sndGroupImpl() {
            _super.apply(this, arguments);
            this.loading = true;
            //notifikace o zmene pozice nebo aktualni sentence
            this.playProgress = ko.observable(0);
            this.actSent = ko.observable(null);
        }
        sndGroupImpl.prototype.player = function () { return this._player ? this._player : this._owner.player; };
        sndGroupImpl.prototype.jsonMLParsed = function () {
            _super.prototype.jsonMLParsed.call(this);
            //jedna grupa, interval i sentence s endPos==-1. Dosazeno v ObjectModel\Model\CourseSchemaDOM.cs, mediaTag.Generate
            this.withoutCut = this.Items.length == 1 && this.Items[0].Items.length == 1 && this.Items[0].Items[0].endPos == -1;
        };
        sndGroupImpl.prototype.pageCreated = function () {
            var _this = this;
            _super.prototype.pageCreated.call(this);
            this.myMediaTags = _.filter(this._owner._owner.allMediaTags, function (m) { return m._sentGroupId == _this.id; });
        };
        return sndGroupImpl;
    })(Course.tagImpl);
    Course.sndGroupImpl = sndGroupImpl;
    var sndIntervalImpl = (function (_super) {
        __extends(sndIntervalImpl, _super);
        function sndIntervalImpl() {
            _super.apply(this, arguments);
        }
        sndIntervalImpl.prototype.jsonMLParsed = function () {
            _super.prototype.jsonMLParsed.call(this);
            this.begPos = this.Items[0].begPos;
            this.endPos = this.Items[this.Items.length - 1].endPos;
        };
        return sndIntervalImpl;
    })(Course.tagImpl);
    Course.sndIntervalImpl = sndIntervalImpl;
    var sndSentImpl = (function (_super) {
        __extends(sndSentImpl, _super);
        function sndSentImpl() {
            _super.apply(this, arguments);
            this.myMediaSents = [];
        }
        return sndSentImpl;
    })(Course.tagImpl);
    Course.sndSentImpl = sndSentImpl;
    var writingImpl = (function (_super) {
        __extends(writingImpl, _super);
        function writingImpl(staticData) {
            _super.call(this, staticData);
            this.textInput = ko.observable();
            this.progressBarValue = ko.observable(0);
            this.progressBarFrom = ko.observable(0);
            this.progressText = ko.observable('');
            this.progressBarLimetExceeded = ko.observable(false);
            this.isDone = ko.observable(false);
            if (!this.limitMin)
                this.limitMin = 0;
            if (!this.limitMax)
                this.limitMax = 0;
            if (!this.limitRecommend)
                this.limitRecommend = 0;
            if (!this.numberOfRows)
                this.numberOfRows = 5;
            if (this.limitRecommend < this.limitMin)
                this.limitRecommend = this.limitMin;
            this.progressBarFrom(!this.limitRecommend ? 0 : (!this.limitMax ? 100 : this.limitRecommend * 100 / this.limitMax));
            var self = this;
            this.textInput.subscribe(function (value) {
                var actMWords = _.filter(DictConnector.startSplitWord(value), function (w) { return !_.isEmpty(w.trim()); }).length;
                var words = Math.max(self.limitMin, self.limitMax);
                if (!words)
                    words = 100;
                var txt = CSLocalize('b8c48a0294c149fabcf83d3098d0b7bd', 'written') + ' ' + Math.round(actMWords) + ' ' + CSLocalize('0ed651b15e15485bb16b9a8f6eba61eb', 'words');
                if (self.limitRecommend > 0 && self.limitMax > 0)
                    txt += ' (' + CSLocalize('816063b2c5e248e98d782e6c72ccb0a7', 'minimum') + ' ' + self.limitRecommend.toString() + ', ' + CSLocalize('c33d47b0e8714300b2a0bbebb5dcc0c5', 'maximum') + ' ' + self.limitMax.toString() + ' ' + CSLocalize('876f5ad503044c2a988f59852eedbe03', 'words') + ')';
                else if (self.limitRecommend > 0)
                    txt += ' (' + CSLocalize('6cfd3dde69134155b12a5613a2bd5e90', 'minimum') + ' ' + self.limitRecommend.toString() + ' ' + CSLocalize('1eec4e5b539348bca19de5d8849b8356', 'words') + ')';
                else if (self.limitMax > 0)
                    txt += ' (' + CSLocalize('00c41ba93408472792afc9af724256eb', 'maximum') + ' ' + self.limitMax.toString() + ' ' + CSLocalize('acc174b843a1481b8a0dea1acee2f35f', 'words') + ')';
                self.progressText(txt);
                self.progressBarLimetExceeded(self.limitMax && actMWords > self.limitMax);
                if (!self.progressBarLimetExceeded() && actMWords > words)
                    self.progressBarFrom(0);
                self.progressBarValue((actMWords > words ? actMWords % words : actMWords) / words * 100);
                self.result.text = value;
                self.result.words = actMWords;
            });
            //var self = this;
            //this.textInput = ko.computed({
            //  read: function () {
            //    return self.result ? self.result.text : '';
            //  },
            //  write: function (value) {
            //    var actMWords = _.filter(DictConnector.startSplitWord(value), w => !_.isEmpty(w.trim())).length;
            //    var words = Math.max(self.wordsMin, self.wordsMax); if (!words) words = 100;
            //    var txt = 'written ' + Math.round(actMWords) + ' words';
            //    if (self.wordsMin > 0 && self.wordsMax > 0) txt += ' (min ' + self.wordsMin.toString() + ', max ' + self.wordsMax.toString() + ' words)';
            //    else if (self.wordsMin > 0) txt += ' (min ' + self.wordsMin.toString() + ' words)';
            //    else if (self.wordsMax > 0) txt += ' (max ' + self.wordsMax.toString() + ' words)';
            //    self.progressText(txt);
            //    self.progressBarLimetExceeded(self.wordsMax && actMWords > self.wordsMax);
            //    if (!self.progressBarLimetExceeded() && actMWords > words) self.progressBarFrom(0);
            //    self.progressBarValue((actMWords > words ? actMWords % words : actMWords) / words * 100);
            //    self.result.text = value; self.result.words = actMWords;
            //  },
            //  owner: this,
            //  pure: true,
            //});
        }
        //humanHelpTxt = ko.observable('');
        writingImpl.prototype.createResult = function (forceEval) { this.done(false); return { ms: 0, s: 0, tg: this._tg, flag: CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate, text: null, words: forceEval ? (this.limitMin ? this.limitMin : 0) : 0, hPercent: -1, hEmail: null, hDate: 0, hLmcomId: 0, hLevel: this.acTestLevel(), hRecommendMin: this.limitRecommend, hMax: this.limitMax, hMin: this.limitMin }; };
        writingImpl.prototype.provideData = function () {
            //this.result.text = this.textInput();
            //this.result.humanPercent = this.human();
            //this.result.words = 
        };
        writingImpl.prototype.acceptData = function (done) {
            _super.prototype.acceptData.call(this, done);
            this.textInput(this.result.text ? this.result.text : '');
            //var txt = this.result.text ? this.result.text : '';
            //$('#' + this.id).find('textarea').val(txt);
            //this.textInput(txt);
            this.human(this.result.hPercent < 0 ? '' : this.result.hPercent.toString());
            var tostr = this.limitMax ? ' - ' + this.limitMax.toString() : '';
            this.humanHelpTxt(this.limitRecommend ? this.limitRecommend.toString() + tostr + ' / ' + this.result.words.toString() : '');
            this.humanLevel(this.result.hLevel);
            //this.textInput.evaluateImmediate();
            //this.textInput.valueHasMutated();
            //var t = this.textInput();
            //if (!t) return;
            //this.textInput.notifySubscribers();
            this.isDone(this.done());
        };
        writingImpl.prototype.setScore = function () {
            if ((this.result.flag & CourseModel.CourseDataFlag.needsEval) == 0 && (this.result.flag & CourseModel.CourseDataFlag.pcCannotEvaluate) != 0) {
                this.result.ms = this.scoreWeight;
                this.result.s = Math.round(this.result.hPercent);
                return;
            }
            var c = this.limitMin && (this.result.words >= this.limitMin);
            this.result.ms = this.scoreWeight;
            this.result.s = c ? this.scoreWeight : 0;
            if (c)
                this.result.flag |= CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate;
            else
                this.result.flag &= ~(CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate) & CourseModel.CourseDataFlag.all;
            //this.result.flag = !c ? 0 : CourseModel.CourseDataFlag.pcCannotEvaluate | CourseModel.CourseDataFlag.needsEval;
        };
        writingImpl.prototype.initProc = function (phase, getTypeOnly, completed) {
            switch (phase) {
                case Course.initPhase.afterRender:
                    if (!getTypeOnly) {
                        var txt = $('#' + this.id).find('textarea');
                        txt.autosize();
                        this.adjustEvalForm();
                    }
                    return Course.initPhaseType.sync;
            }
            return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
        };
        return writingImpl;
    })(Course.humanEvalControlImpl);
    Course.writingImpl = writingImpl;
    var audioCaptureImpl = (function (_super) {
        __extends(audioCaptureImpl, _super);
        function audioCaptureImpl(staticData) {
            var _this = this;
            _super.call(this, staticData);
            //modal dialog
            this.modalDialogSizeCss = function () { switch (_this.dialogSize) {
                case CourseModel.modalSize.large: return 'modal-lg';
                case CourseModel.modalSize.small: return 'modal-sm';
                default: return '';
            } };
            this.progressBarFrom = ko.observable(0); //hodnota minimalniho casu
            this.progressText = ko.observable(''); //text v baru
            this.progressBarLimetExceeded = ko.observable(false); //pro audioCapture nenastane - zobrazeni cervene pri prekroceni hodnoty
            this.allDisabled = ko.observable(true);
            //stavove info
            this.saveRecordingDisabled = ko.observable(false);
            this.recording = ko.observable(false);
            this.miliseconds = ko.observable(0);
            this.playing = ko.observable(false);
            this.isRecorded = ko.observable(false);
            this.isDone = ko.observable(false);
            if (!this.singleAttempt)
                this.singleAttempt = false;
            if (!this.limitMin)
                this.limitMin = 0;
            if (!this.limitMax)
                this.limitMax = 0;
            if (this.limitMax && this.limitMax < this.limitMin)
                this.limitMax = this.limitMin;
            if (!this.limitRecommend)
                this.limitRecommend = 0;
            if (this.limitMin && this.limitRecommend < this.limitMin)
                this.limitRecommend = this.limitMin;
            //DEBUG
            //this.speakSecondsFrom = 10;
            //this.speakSecondsTo = 15;
            this.iconClass = ko.computed(function () { return "fa-" + (_this.recording() ? 'stop' : 'circle'); });
            this.progressBarFrom(!this.limitRecommend ? 0 : (!this.limitMax ? 100 : this.limitRecommend * 100 / this.limitMax));
            this.progressBarValue = ko.computed(function () {
                if (!_this.recording())
                    return 0; //po this.driver.recordEnd(true) nize muze jeste prijit progressBarValue, coz vadi.
                var actMsecs = _this.miliseconds();
                //vyprseni casu eTestMe sekce behem nahravani -> uloz vysledky a uzavri dialog
                if ((!_this.limitMin || actMsecs >= _this.limitMin * 1000) && testMe.notify && testMe.notify.active() && testMe.notify.remaindSeconds <= 3) {
                    if (_this.modalDialog)
                        _this.modalDialog.modal('hide');
                    _this.driver.recordEnd(true);
                    return 100;
                }
                _this.saveRecordingDisabled(_this.limitMin && actMsecs < _this.limitMin * 1000); //neni dosaeno speakSecondsFrom => disabled Save recording button
                if (_this.limitMax && actMsecs >= _this.limitMax * 1000) {
                    if (_this.modalDialog)
                        _this.modalDialog.modal('hide');
                    _this.driver.recordEnd(true);
                    anim.alert().show(CSLocalize('9259ce32c3a14bb29b657b9430be2f83', 'Maximum time limit reached. Your recording was finished and saved.'), $.noop, function () { return anim.alert().isCancelVisible(false); });
                    return 100;
                }
                var msecs = Math.max(_this.limitMin, _this.limitMax) * 1000;
                if (!msecs)
                    msecs = 60000;
                var txt = CSLocalize('94708246af584ffdacf8dd4c8c4521c8', 'recorded') + ' ' + Utils.formatTimeSpan(actMsecs / 1000);
                if (_this.limitRecommend > 0 && _this.limitMax > 0)
                    txt += ' (' + CSLocalize('23aacf6c308d4ffa95fa6f9cad88285d', 'recommended') + ' ' + Utils.formatTimeSpan(_this.limitRecommend) + ' - ' + Utils.formatTimeSpan(_this.limitMax) + ')';
                else if (_this.limitRecommend > 0)
                    txt += ' (min ' + Utils.formatTimeSpan(_this.limitRecommend) + ')';
                else if (_this.limitMax > 0)
                    txt += ' (max ' + Utils.formatTimeSpan(_this.limitMax) + ')';
                _this.progressText(txt);
                if (actMsecs > msecs)
                    _this.progressBarFrom(0);
                return (actMsecs > msecs ? actMsecs % msecs : actMsecs) / msecs * 100;
            });
        }
        audioCaptureImpl.prototype.initProc = function (phase, getTypeOnly, completed) {
            var _this = this;
            switch (phase) {
                case Course.initPhase.afterRender:
                    if (!getTypeOnly) {
                        if (this.recordInDialog) {
                            this.modalDialog = $('#modal-' + this.id);
                            this.modalContent = this.modalDialog.find('.modal-header');
                            this.modalDialog.on('hide.bs.modal', function () {
                                console.log('audioCaptureImpl: hide.bs.modal');
                                anim.onModalHide(_this.modalDialog);
                                SndLow.Stop(null);
                                delete audioCaptureImpl.activeAudioCapture;
                            }).on('show.bs.modal', function () {
                                console.log('audioCaptureImpl: show.bs.modal');
                                anim.onModalShow(_this.modalDialog);
                                audioCaptureImpl.activeAudioCapture = _this;
                            });
                        }
                        if (this.driver) {
                            completed();
                            return;
                        }
                        SndLow.getGlobalMedia().adjustGlobalDriver(true, function (dr, disabled) {
                            _this.driver = dr;
                            _this.allDisabled(disabled);
                            completed();
                        });
                        this.adjustEvalForm();
                    }
                    return Course.initPhaseType.async;
            }
            return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
        };
        audioCaptureImpl.saveAudioAndHideModal = function (completed) {
            var act = audioCaptureImpl.activeAudioCapture;
            if (!act) {
                completed();
                return;
            }
            act.driver.recordEnd(true);
            console.log('audioCaptureImpl: modalAudioDriver.recordEnd');
            setTimeout(completed, 500);
        };
        //Eval control
        audioCaptureImpl.prototype.createResult = function (forceEval) { this.done(false); return { ms: 0, s: 0, tg: this._tg, flag: 0, audioUrl: createMediaUrl(this.id), recordedMilisecs: forceEval ? (this.limitMin ? this.limitMin * 1000 : 0) : 0, hPercent: -1, hEmail: null, hDate: 0, hLevel: this.acTestLevel(), hLmcomId: 0, hFrom: this.limitMin, hTo: this.limitMax, hRecommendFrom: this.limitRecommend }; };
        audioCaptureImpl.prototype.provideData = function () {
        };
        audioCaptureImpl.prototype.acceptData = function (done) {
            _super.prototype.acceptData.call(this, done);
            this.isRecorded(this.isRecordLengthCorrect());
            this.isDone(this.done());
            this.human(this.result.hPercent < 0 ? '' : this.result.hPercent.toString());
            var tostr = this.limitMax ? ' - ' + Utils.formatTimeSpan(this.limitMax) : '';
            ;
            this.humanHelpTxt(this.limitRecommend ? Utils.formatTimeSpan(this.limitRecommend) + tostr + ' / ' + Utils.formatTimeSpan(Math.round(this.result.recordedMilisecs / 1000)) : '');
            this.humanLevel(this.result.hLevel);
            //CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate
        };
        audioCaptureImpl.prototype.setScore = function () {
            if ((this.result.flag & CourseModel.CourseDataFlag.needsEval) == 0 && (this.result.flag & CourseModel.CourseDataFlag.pcCannotEvaluate) != 0) {
                this.result.ms = this.scoreWeight;
                this.result.s = Math.round(this.result.hPercent);
                return;
            }
            var c = this.isRecordLengthCorrect();
            this.result.ms = this.scoreWeight;
            this.result.s = c ? this.scoreWeight : 0;
            if (c)
                this.result.flag |= CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate | CourseModel.CourseDataFlag.hasExternalAttachments;
            else
                this.result.flag &= ~(CourseModel.CourseDataFlag.needsEval | CourseModel.CourseDataFlag.pcCannotEvaluate | CourseModel.CourseDataFlag.hasExternalAttachments) & CourseModel.CourseDataFlag.all;
        };
        audioCaptureImpl.prototype.isRecordLengthCorrect = function () { return this.result.recordedMilisecs > 0 && (!this.limitMin || (this.result.recordedMilisecs >= this.limitMin * 1000)); }; //pro 0 x 1 score
        audioCaptureImpl.prototype.setRecorderSound = function (recorderSound) {
            this.driver.openFile(null); //reset driveru
            if (this.recorderSound)
                this.recorderSound.close();
            this.recorderSound = recorderSound;
            //uspesne ukonceni nahravani
            this.result.recordedMilisecs = this.recorderSound ? this.miliseconds() : 0;
            var c = this.isRecordLengthCorrect();
            if (!c)
                this.result.recordedMilisecs = 0;
            this.isRecorded(c);
            //vyjimka pro tuto kontrolku: save stavu cviceni
            this.doProvideData();
            this._myPage.result.userPending = true;
            CourseMeta.lib.saveProduct($.noop);
        };
        audioCaptureImpl.prototype.play = function () {
            var _this = this;
            var wasPaused = this.driver.handler.paused;
            SndLow.Stop(null);
            this.playing(false);
            if (!wasPaused)
                return;
            var url = this.recorderSound ? this.recorderSound.url : ((cfg.baseTagUrl ? cfg.baseTagUrl : Pager.basicDir) + this.result.audioUrl).toLowerCase();
            this.driver.play(url + '?stamp=' + (audioCaptureImpl.playCnt++).toString(), 0, function (msec) { return _this.playing(msec >= 0); });
        };
        audioCaptureImpl.prototype.stopRecording = function () {
            var _this = this;
            setTimeout(function () { return _this.driver.recordEnd(true); }, 500);
        };
        audioCaptureImpl.prototype.record = function () {
            var _this = this;
            var toDiscUrl = this.result.audioUrl;
            if (this.recording())
                this.driver.recordEnd(true);
            else {
                this.miliseconds(0);
                SndLow.Stop(null);
                this.driver.recordStart({
                    toDisc: true,
                    toDiscFileUrl: this.result.audioUrl,
                    toMemoryCompleted: function (mp3Data) {
                        if (_this.modalDialog)
                            _this.modalDialog.modal('hide');
                        _this.setRecorderSound(new SndLow.recordedSound(_this.driver, !toDiscUrl ? mp3Data : Pager.basicDir + toDiscUrl));
                    },
                    actHtml5SampleRate: 0,
                    isRecording: this.recording,
                    miliseconds: this.miliseconds,
                    recordStarting: function () {
                        if (!_this.recordInDialog)
                            return;
                        _this.saveRecordingDisabled(_this.limitMin > 0);
                        if (_this.dialogHeaderId) {
                            _this.modalContent.empty();
                            _this.modalContent.append($('#' + _this.dialogHeaderId).clone());
                        }
                        //this.modalDialog.modal({ backdrop: 'static', keyboard: true });
                        _this.modalDialog.modal('show');
                    },
                    toMemoryCompletedData: null,
                });
            }
        };
        audioCaptureImpl.playCnt = 0;
        return audioCaptureImpl;
    })(Course.humanEvalControlImpl);
    Course.audioCaptureImpl = audioCaptureImpl;
    function createMediaUrl(id) {
        var fn = LMStatus.sessionId.toString() + '-' + new Date().getTime() + '-' + id;
        var hash = Utils.Hash(fn) & 0x0000ffff;
        var part1 = hash >> 8;
        var part2 = hash & 0x000000ff;
        var res = urlBasicPath + part1.toString() + '/' + part2.toString() + '/' + fn + '.mp3';
        return res;
    }
    Course.createMediaUrl = createMediaUrl;
    var urlBasicPath = '/media/';
    //********************************************* SND PAGE
    (function (progressType) {
        progressType[progressType["progress"] = 0] = "progress";
        progressType[progressType["done"] = 1] = "done";
        progressType[progressType["always"] = 2] = "always";
    })(Course.progressType || (Course.progressType = {}));
    var progressType = Course.progressType;
    //sound informace pro jednu stranku
    var sndPageImpl = (function (_super) {
        __extends(sndPageImpl, _super);
        function sndPageImpl() {
            _super.apply(this, arguments);
            //***** ACTIVE management
            this.actSent = null; //aktualni veta
        }
        //constructor(data: CourseModel.tag) { super(data); bindClick(); }
        sndPageImpl.prototype.jsonMLParsed = function () {
            var _this = this;
            _super.prototype.jsonMLParsed.call(this);
            this.grps = {};
            this.sents = {};
            if (!self)
                return;
            _.each(this.Items, function (fgrp) { return _.each(fgrp.Items, function (grp) {
                _this.grps[grp.id] = grp;
                _.each(grp.Items, function (interv) { return _.each(interv.Items, function (sent) { return _this.sents[sent.idx] = sent; }); });
            }); });
        };
        sndPageImpl.prototype.pageCreated = function () {
            _super.prototype.pageCreated.call(this);
            bindClick();
        };
        sndPageImpl.prototype.leave = function () {
            unbindClick();
        };
        //***** PLAY management
        sndPageImpl.prototype.play = function (grpId, begPos) {
            this.onPlay();
            var grp = this.grps[grpId];
            if (grp.loading)
                return;
            if (begPos < 0)
                begPos = grp.Items[0].begPos; //begpos<0 => zacni hrat od zacatku
            var interv = _.find(grp.Items, function (i) { return begPos >= i.begPos && begPos < i.endPos; }); //najdi aktualni interval
            if (interv == null) {
                debugger;
                throw 'interv == null';
            }
            this.playInt(interv, begPos); //hraj prvni interval
        };
        sndPageImpl.prototype.onPlaying = function (interv, msec, context) {
            var _this = this;
            switch (context) {
                case progressType.progress:
                    interv._owner.playProgress(msec);
                    var s = _.find(interv.Items, function (s) { return msec < s.endPos; });
                    this.setActiveSentence(interv._owner, s);
                    break;
                case progressType.done:
                    var intIdx = _.indexOf(interv._owner.Items, interv);
                    if (intIdx < interv._owner.Items.length - 1) {
                        var interv = interv._owner.Items[intIdx + 1];
                        setTimeout(function () { return _this.playInt(interv, interv.begPos); });
                    }
                    break;
                case progressType.always:
                    //SndLow.guiBlocker(false);
                    interv._owner.playProgress(-1);
                    this.setActiveSentence(interv._owner, null);
                    break;
            }
        };
        sndPageImpl.prototype.playInt = function (interv, begPos) {
            var self = this; //var intVar = interv; var bp = begPos;
            interv._owner.player().openPlay(interv._owner._owner.mediaUrl, begPos, interv.endPos).
                progress(function (msec) { return self.onPlaying(interv, msec < begPos ? begPos : msec /*pri zacatku hrani muze byt notifikovana pozice kousek pred zacatkem*/, progressType.progress); }).
                done(function () { return self.onPlaying(interv, -1, progressType.done); }).
                always(function () { return self.onPlaying(interv, -1, progressType.always); }); //uplny konec
        };
        //vstupni procedura do active managmentu
        sndPageImpl.prototype.setActiveSentence = function (grp, s) {
            if (this.actSent == s)
                return;
            Logger.trace_lmsnd('media.ts: sndPageImpl.setActiveSentence, idx=' + (s ? s.idx.toString() : '-1'));
            this.actSent = s;
            grp.actSent(s);
            if (s == null) {
                this.setAllActive(null);
                return;
            }
            var newActive = [];
            _.each(s.myMediaSents, function (ms) {
                newActive.push(ms);
                if (ms._owner._tg == CourseModel.t_mediaReplica)
                    newActive.push((ms._owner));
            });
            newActive.pushArray(s._owner._owner.myMediaTags); //mediaTags
            this.setAllActive(newActive);
        };
        sndPageImpl.prototype.setAllActive = function (newActive) {
            if (!newActive && !this.allActive)
                return; //both null
            if (!newActive) {
                _.each(this.allActive, function (a) { return a.active(false); });
                delete this.allActive;
                return;
            } //newActive null => deactivate allActive
            if (!this.allActive) {
                _.each(newActive, function (a) { return a.active(true); });
                this.allActive = newActive;
                return;
            } //allActive null => activate newActive
            //merge
            var newAllActive = [];
            _.each(this.allActive, function (a) { return delete a['fl']; });
            _.each(this.allActive, function (a) {
                if (_.indexOf(newActive, a) < 0)
                    a.active(false); //deaktivuj 
                else
                    a['fl'] = true; //oznac jako jiz aktivni
            });
            _.each(newActive, function (a) { if (a['fl'])
                delete a['fl'];
            else
                a.active(true); }); //aktivuj zbyle
            this.allActive = newActive;
        };
        sndPageImpl.prototype.htmlClearing = function () {
            Logger.trace_lmsnd('media.ts: htmlClearing');
            unbindClick();
            _.each(this.Items, function (fg) { if (fg.player)
                SndLow.htmlClearing(fg.player.id);
            else
                _.each(fg.Items, function (g) { if (g.player())
                    SndLow.htmlClearing(g.player().id); }); });
        };
        //stop play
        sndPageImpl.prototype.onPlay = function () {
            cancelSoundStop();
            //if (pageSound.inOnPlayTimer != 0) { clearTimeout(pageSound.inOnPlayTimer); pageSound.inOnPlayTimer = 0; }
            inOnPlay = true;
            var self = this;
            setTimeout(function () { inOnPlay = false; }, 10);
        };
        return sndPageImpl;
    })(Course.tagImpl);
    Course.sndPageImpl = sndPageImpl;
    //********************************************* MEDIA PLAYER
    //ovladaci panel (videa apod.)
    var mediaPlayer = (function (_super) {
        __extends(mediaPlayer, _super);
        function mediaPlayer() {
            var _this = this;
            _super.apply(this, arguments);
            this.withoutCut = function () { return _this.myGrp().withoutCut; };
            this.actor = ko.observable('');
            this.speech = ko.observable('');
            this.textVisible = ko.observable(true);
            this.playStop = function () { if (_this.loading())
                return; var driver = _this.myGrp().player(); if (!driver.handler.paused) {
                driver.stop();
            }
            else
                _this.playFromSlider(); };
            this.nextSent = function () { if (_this.loading())
                return; _this.prevNext(false); };
            this.prevSent = function () { if (_this.loading())
                return; _this.prevNext(true); };
            this.toogleText = function () { if (_this.loading())
                return; _this.textVisible(!_this.textVisible()); };
        }
        mediaPlayer.prototype.initProc = function (phase, getTypeOnly, completed) {
            var _this = this;
            switch (phase) {
                case Course.initPhase.afterRender2:
                    if (!getTypeOnly) {
                        var self = this;
                        var grp = self.myGrp();
                        if (grp.Items.length != 1) {
                            debugger;
                            throw 'Only single sound interval is alowed for media-player';
                        }
                        self.slider = $('#' + this.id + '-slider');
                        //http://api.jqueryui.com/slider
                        self.slider.slider({
                            start: function (event, ui) { return grp.player().stop(); },
                            "max": 100000,
                            disabled: true,
                        });
                        grp.playProgress.subscribe(function (msec) {
                            if (msec < 0) {
                                self.playing(false);
                                return;
                            }
                            self.playing(true);
                            self.sliderFromMsec(msec);
                        });
                        grp.actSent.subscribe(function (sent) {
                            if (!sent)
                                return;
                            _this.actSent = sent;
                            _this.speech(sent.text);
                            _this.actor(!sent.actor ? '' : sent.actor + ': ');
                        });
                        self.sliderStart = grp.Items[0].begPos; //???
                        this.loading.subscribe(function (l) { if (!l)
                            self.slider.slider("option", 'disabled', false); });
                        if (completed)
                            completed();
                    }
                    return Course.initPhaseType.async;
            }
            return _super.prototype.initProc.call(this, phase, getTypeOnly, completed);
        };
        mediaPlayer.prototype.playFromSlider = function () {
            this._myPage.sndPage.play(this._sentGroupId, this.msecFromSlider());
        };
        mediaPlayer.prototype.sliderFromMsec = function (msec) { this.slider.slider("option", "value", 100000 * (msec - this.sliderStart) / this.sliderLen()); };
        mediaPlayer.prototype.msecFromSlider = function () { return this.slider.slider("option", "value") * this.sliderLen() / 100000 + this.sliderStart; };
        mediaPlayer.prototype.sliderLen = function () {
            return this.myGrp().Items[0].endPos - this.sliderStart;
        };
        //initProc(phase: initPhase, getTypeOnly: boolean, completed: () => void): initPhaseType {
        //  switch (phase) {
        //    case initPhase.afterRender:
        //      if (!getTypeOnly) {
        //        super.initProc(initPhase.afterRender, false, null);
        //        var self = this;
        //        var grp = this.myGrp();
        //        grp.actSent.subscribe(sent => {
        //          if (!sent) return;
        //          this.actSent = sent;
        //          this.speech(sent.text);
        //          this.actor(!sent.actor ? '' : sent.actor + ': ');
        //        });
        //        completed();
        //      }
        //      return initPhaseType.async;
        //  }
        //  return super.initProc(phase, getTypeOnly, completed);
        //}
        mediaPlayer.prototype.prevNext = function (isPrev) {
            var grp = this.myGrp();
            var newSent;
            if (isPrev && this.actSent && grp.playProgress() - this.actSent.begPos > 500) {
                newSent = this.actSent;
            }
            else {
                var sents = grp.Items[0].Items;
                var actSentIdx = this.actSent ? _.indexOf(sents, this.actSent) : (isPrev ? sents.length - 1 : 0);
                if (isPrev) {
                    if (actSentIdx == 0)
                        return;
                    newSent = sents[actSentIdx - 1];
                }
                else {
                    if (actSentIdx >= sents.length - 1)
                        return;
                    newSent = sents[actSentIdx + 1];
                }
            }
            grp.player().stop();
            this.sliderFromMsec(newSent.begPos);
            grp.actSent(newSent);
        };
        return mediaPlayer;
    })(mediaTagImpl);
    Course.mediaPlayer = mediaPlayer;
    // ******** STATIC
    var inOnPlay = false;
    var inOnPlayTimer = 0;
    function cancelSoundStop() {
        if (inOnPlayTimer != 0) {
            clearTimeout(inOnPlayTimer);
            inOnPlayTimer = 0;
        }
    }
    function bindClick() {
        $('body').bind('click.stopSound', function (ev) {
            if ($(ev.target).closest('.oli-cancel-stop-sound').length > 0)
                return;
            if (inOnPlay)
                return;
            inOnPlayTimer = setTimeout(function () {
                inOnPlayTimer = 0;
                Logger.trace_lmsnd('media.ts: body.click stop');
                SndLow.Stop();
            }, 1);
        });
    }
    function unbindClick() {
        $('body').unbind('click.stopSound');
    }
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_sndPage, sndPageImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_sndFileGroup, sndFileGroupImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_sndGroup, sndGroupImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_sndInterval, sndIntervalImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_sndSent, sndSentImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tmediaBigMark, mediaBigMark);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tmediaPlayer, mediaPlayer);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tmediaText, mediaText);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.tmediaVideo, mediaVideo);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_mediaReplica, mediaReplica);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.t_mediaSent, mediaSent);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.trecording, audioCaptureImpl);
    CourseModel.registerClassToInterface(CourseModel.meta, CourseModel.twriting, writingImpl);
})(Course || (Course = {}));
