//http://www.html5rocks.com/en/tutorials/getusermedia/intro/
//http://typedarray.org/from-microphone-to-wav-with-getusermedia-and-web-audio/
//http://webaudiodemos.appspot.com/
var html5Recorder;
(function (html5Recorder) {
    //export var bufferLength = 4096;
    html5Recorder.bufferLength = 16384;
    html5Recorder.wavUrl = null; //URL pro prime prehrani nahraneho zvuku
    var audioCaptureTested = false; //priznak otestovani, zdali prohlizec umi HTML5 Audio capture 
    var audioContextError; //vysledek testu. NULL => ok
    //nodes a context, vznikle pri prvnim recording
    var audioContext = null;
    var copyToBufferNode;
    var microphoneNode;
    html5Recorder.audioNodesConnected = false;
    var recBuffers = []; //buffer s nahranumi WAV samples
    var RecHandler = (function () {
        function RecHandler() {
        }
        RecHandler.prototype.recordEnd = function () { stopRecording(); };
        RecHandler.prototype.isRecording = function () { return html5Recorder.audioNodesConnected; };
        return RecHandler;
    })();
    html5Recorder.RecHandler = RecHandler;
    function checkHTML5AudioCapture() {
        if (audioCaptureTested)
            return audioContextError == null;
        audioCaptureTested = true;
        var errors = [];
        var nav = navigator;
        navigator.getUserMedia = nav.getUserMedia || nav.webkitGetUserMedia || nav.mozGetUserMedia || nav.msGetUserMedia;
        if (!navigator.getUserMedia)
            errors.push("Browser does not support navigator.getUserMedia.");
        URL = window.URL || window.webkitURL;
        if (!URL)
            errors.push("Browser does not support window.URL.");
        if (URL && (!URL.revokeObjectURL || !URL.createObjectURL))
            errors.push("Browser does not support URL.revokeObjectURL or URL.createObjectURL.");
        AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext)
            errors.push("Browser does not support window.AudioContext.");
        var audioContextError = errors.join("\r\n");
        if (audioContextError == '')
            audioContextError = null;
        return audioContextError == null;
    }
    html5Recorder.checkHTML5AudioCapture = checkHTML5AudioCapture;
    function startRecording(onProcess) {
        if (html5Recorder.audioNodesConnected)
            return; //jiz ze nahrava
        if (!checkHTML5AudioCapture()) {
            debugger;
            throw '!checkHTML5AudioCapture';
        } //nemelo by nastat, checkHTML5AudioCapture() musi projit pri testu na HTML5 nahravani
        recBuffers = []; //vyprazdni buffers
        if (!audioContext) {
            //BT 2247
            //var alowMicrophoneTimer: number;
            //if (!bowser.agent.firefox)
            //  alowMicrophoneTimer = setTimeout(() => { alert('Allow the microphone, please!\r\n(using the button rigth above the content of the page)'); alowMicrophoneTimer = 0; }, 3000);
            navigator.getUserMedia({ audio: true, video: false }, function (stream) {
                //BT 2247 if (alowMicrophoneTimer) clearTimeout(alowMicrophoneTimer); //mikrofon povolen => zrus upozorneni
                audioContext = new AudioContext();
                microphoneNode = audioContext.createMediaStreamSource(stream);
                copyToBufferNode = audioContext.createScriptProcessor(html5Recorder.bufferLength, 1, 1); //AudioNode na zaznamenani do bufferu
                connectAudioNodes(function (ev) { if (html5Recorder.audioNodesConnected)
                    onProcess(ev); }); //napojeni audio nodes
            }, function (err) { return alert('navigator.getUserMedia: ' + err.message); });
        }
        else {
            connectAudioNodes(function (ev) { if (html5Recorder.audioNodesConnected)
                onProcess(ev); });
        }
    }
    html5Recorder.startRecording = startRecording;
    function connectAudioNodes(onProcess) {
        if (onProcess === void 0) { onProcess = null; }
        if (!!onProcess && !html5Recorder.audioNodesConnected) {
            copyToBufferNode.onaudioprocess = onProcess;
            microphoneNode.connect(copyToBufferNode);
            copyToBufferNode.connect(audioContext.destination);
            html5Recorder.audioNodesConnected = true;
            Logger.trace_lmsnd('connectAudioNodes, audioNodesConnected = true');
        }
        else if (!onProcess && html5Recorder.audioNodesConnected) {
            microphoneNode.disconnect();
            copyToBufferNode.disconnect();
            html5Recorder.audioNodesConnected = false;
            Logger.trace_lmsnd('connectAudioNodes, audioNodesConnected = false');
        }
    }
    function clearRecording() { if (html5Recorder.wavUrl) {
        URL.revokeObjectURL(html5Recorder.wavUrl);
        html5Recorder.wavUrl = null;
    } }
    function stopRecording() {
        if (!html5Recorder.audioNodesConnected)
            return;
        connectAudioNodes(null); //odvaz mikrofon z grafu
        //if (recBuffers.length == 0) { debugger; throw 'recBuffers.length == 0'; }
        ////linearize recording
        //var samples = mergeBuffers(recBuffers); recBuffers = [];
        //Logger.trace_lmsnd('HTML5rec.stopRecording len=' + samples.length.toString());
        ////preved do blob a url
        //var dataview = encodeWAV(samples, 44100);
        //var blob = new Blob([dataview], { type: "audio/wav" });
        //wavUrl = URL.createObjectURL(blob);
        //Logger.trace_lmsnd('HTML5rec.stopRecording wavUrl=' + wavUrl);
        //if (completed) completed(wavUrl);
    }
    html5Recorder.stopRecording = stopRecording;
    function mergeBuffers(recBuffers) {
        var len = 0;
        _.each(recBuffers, function (b) { return len += b.length; }); //zjisti delku vysledku
        var result = new Float32Array(len); //alokuj pamet
        var offset = 0;
        _.each(recBuffers, function (b) { result.set(b, offset); offset += b.length; }); //zkopiruj bufery do jednoho
        return result;
    }
    function encodeWAV(recBuffers, sampleRate) {
        var floats = mergeBuffers(recBuffers);
        var buffer = new ArrayBuffer(44 + floats.length * 2);
        var view = new DataView(buffer);
        writeString(view, 0, 'RIFF'); // RIFF identifier 
        view.setUint32(4, 32 + floats.length * 2, true); // file length
        writeString(view, 8, 'WAVE'); // RIFF type
        writeString(view, 12, 'fmt '); // format chunk identifier
        view.setUint32(16, 16, true); // format chunk length
        view.setUint16(20, 1, true); // sample format (raw)
        view.setUint16(22, 1, true); // channel count, view.setUint16(22, 2, true) pro stereo
        view.setUint32(24, sampleRate, true); // sample rate
        view.setUint32(28, sampleRate * 2, true); // byte rate (sample rate * block align), view.setUint32(28, sampleRate * 4, true);  pro stereo
        view.setUint16(32, 2, true); //block align (channel count * bytes per sample), view.setUint16(32, 4, true) pro stereo
        view.setUint16(34, 16, true); // bits per sample
        writeString(view, 36, 'data'); // data chunk identifier
        view.setUint32(40, floats.length * 2, true); // data chunk length
        floatTo16BitPCM(view, 44, floats);
        return view;
    }
    html5Recorder.encodeWAV = encodeWAV;
    function floatTo16BitPCM(view, offset, samples) {
        for (var i = 0; i < samples.length; i++, offset += 2) {
            var s = Math.max(-1, Math.min(1, samples[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    }
    function writeString(view, offset, str) {
        for (var i = 0; i < str.length; i++)
            view.setUint8(offset + i, str.charCodeAt(i));
    }
})(html5Recorder || (html5Recorder = {}));
