declare module Lame {
  function init(): any;
  /*
    mode = 0,1,2,3 = stereo, jstereo, dual channel (not supported), mono
    default: lame picks based on compression ration and input channels
  */
  function set_mode(mp3codec: any, mode: mp3WorkerLib.mode): void;
  /* number of channels in input stream. default=2  */
  function set_num_channels(mp3codec: any, chanels: number): void;
  /*
  output sample rate in Hz.  default = 0, which means LAME picks best value
  based on the amount of compression.  MPEG only allows:
  MPEG1    32, 44.1,   48khz
  MPEG2    16, 22.05,  24
  MPEG2.5   8, 11.025, 12
  (not used by decoding routines)
*/
  function set_out_samplerate(mp3codec: any, samplerate: number): void;
  /* input sample rate in Hz.  default = 44100hz */
  function set_in_samplerate(mp3codec: any, samplerate: number): void;
  /* set one of brate compression ratio.  default is compression ratio of 11.  */
  function set_bitrate(mp3codec: any, bitrate: number): void;
  function set_compression_ratio(mp3codec: any, bitrate: number): void;
  /* VBR quality level.  0=highest  9=lowest  */
  function set_VBR_quality(mp3codec: any, bitrate: number): void;
  function set_VBR(mp3codec: any, vbr_mode: mp3WorkerLib.vbr_mode): void;
  function set_VBR_mean_bitrate_kbps(mp3codec: any, bitrate: number): void;

  function init_params(mp3codec: any): void;
  function do_encode_buffer_ieee_float(mp3codec: any, channel_l: Float32Array, channel_r: Float32Array): encodedMp3Buf;
  function do_encode_buffer(mp3codec: any, channel_l: Int16Array): encodedMp3Buf;
  function encode_flush(mp3codec: any): encodedMp3Buf;
  function close(mp3codec: any): void;

  interface encodedMp3Buf {
    size: number;
    data: Uint8Array;
  }

}





