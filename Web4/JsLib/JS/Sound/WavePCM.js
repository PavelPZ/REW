var WavePCM;
(function (WavePCM) {
    function toPCM(cfg, buffer) {
        return bitReduce(cfg, resampleAndInterleave(cfg, buffer));
    }
    WavePCM.toPCM = toPCM;
    function getConfig(inputSampleRate, bufferLength, outputSampleRate) {
        var resampledBufferLength = Math.round(bufferLength * outputSampleRate / inputSampleRate);
        return {
            inputSampleRate: inputSampleRate,
            bufferLength: bufferLength,
            outputBytesPerSample: 2,
            outputSampleRate: outputSampleRate,
            resampleRatio: (bufferLength - 1) / (resampledBufferLength - 1),
            resampledBufferLength: resampledBufferLength,
            bufResampleAndInterleave: new Float32Array(resampledBufferLength),
            bufBitReduce: new Uint8Array(resampledBufferLength * 2),
        };
    }
    WavePCM.getConfig = getConfig;
    function bitReduce(cfg, floatData) {
        var outputData = cfg.bufBitReduce; //new Uint8Array(floatData.length * cfg.outputBytesPerSample);
        var outputIndex = 0;
        for (var i = 0; i < floatData.length; i++) {
            var sample = floatData[i];
            if (sample > 1)
                sample = 1;
            else if (sample < -1)
                sample = -1;
            switch (cfg.outputBytesPerSample) {
                case 4:
                    sample = sample * 2147483648;
                    outputData[outputIndex++] = sample;
                    outputData[outputIndex++] = sample >> 8;
                    outputData[outputIndex++] = sample >> 16;
                    outputData[outputIndex++] = sample >> 24;
                    break;
                case 3:
                    sample = sample * 8388608;
                    outputData[outputIndex++] = sample;
                    outputData[outputIndex++] = sample >> 8;
                    outputData[outputIndex++] = sample >> 16;
                    break;
                case 2:
                    sample = sample * 32768;
                    outputData[outputIndex++] = sample;
                    outputData[outputIndex++] = sample >> 8;
                    break;
                case 1:
                    outputData[outputIndex++] = (sample + 1) * 128;
                    break;
                default:
                    throw "Only 8, 16, 24 and 32 bits per sample are supported";
            }
        }
        return new Uint16Array(outputData.buffer);
    }
    function resampleAndInterleave(cfg, buffer) {
        if (cfg.outputSampleRate === cfg.inputSampleRate)
            return buffer;
        var outputData = cfg.bufResampleAndInterleave; //.new Float32Array(cfg.resampledBufferLength);
        outputData[cfg.resampledBufferLength - 1] = buffer[cfg.bufferLength - 1];
        for (var i = 0; i < cfg.resampledBufferLength - 1; i++) {
            var ir = i * cfg.resampleRatio;
            var op = Math.floor(ir);
            var channelData = buffer;
            outputData[i] = channelData[op] + (channelData[op + 1] - channelData[op]) * (ir - op);
        }
        return outputData;
    }
})(WavePCM || (WavePCM = {}));
