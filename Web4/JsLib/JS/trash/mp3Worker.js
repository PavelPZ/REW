importScripts('mp3WorkerLib.js');
importScripts('libmp3lame.js');
mp3Worker.worker = this;
mp3Worker.worker.onmessage = mp3Worker.onMessage;
