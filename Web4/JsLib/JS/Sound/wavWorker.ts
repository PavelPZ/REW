importScripts('mp3WorkerLib.js');

mp3Worker.worker = this;
mp3Worker.worker.onmessage = mp3Worker.onMessage;



