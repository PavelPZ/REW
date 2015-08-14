declare module pako {
  class Deflate {
    constructor(option:deflateOptions);
    push(data: Uint8Array, isLast:boolean);
    onData: (chunk: Uint8Array) => void;
    onEnd: (isOk:boolean) => void;
  }
  interface deflateOptions {
    /*
    Z_NO_COMPRESSION:         0,
    Z_BEST_SPEED:             1,
    Z_BEST_COMPRESSION:       9,
    Z_DEFAULT_COMPRESSION:   -1,
    */
    level: number;
    gzip: boolean;
  }
}