module encryptLib {

  const encryptKey = 18475;

  export function encrypt(source: string, key: number = encryptKey): utils.base64 {
    if (!source) return null;
    var bytes = crypt.stringToUtf8ByteArray(source);
    decryptLow(bytes, 0, bytes.length, key); //decrypt na miste
    return base64.encode(bytes);
  }

  export function decrypt(source: utils.base64, key: number = encryptKey): string {
    var bytes = base64.decode(source);
    encryptLow(bytes, 0, bytes.length, key); //encrypt na miste
    return crypt.utf8ByteArrayToString(bytes);
  }

  export function test() {
    var enc = encrypt('ěščřěščŘĚasdfas f asdfa');
    var dec = decrypt(enc);
    dec = null;
  }

  //*************** Low level INPLACE encryption x decryption

  export function encryptLow(data: utils.bytes, start: number, len: number, key: number = encryptKey): utils.bytes {
    for (var i = start; i < start + len; i++) {
      data[i] = Int64ToByte(data[i] ^ (key >> 8));
      key = Int64ToUShort((data[i] + key) * 52845 + 22719);
    }
    return data;
  }

  export function decryptLow(data: utils.bytes, start: number, len: number, key: number = encryptKey): utils.bytes {
    var old;
    for (var i = 0; i < data.length; i++) {
      old = data[i];
      data[i] = Int64ToByte(old ^ (key >> 8));
      key = Int64ToUShort((old + key) * 52845 + 22719);
    }
    return data;
  }

  function Int64ToByte(val: number): number {
    return val & 0xFF;
  };
  function Int64ToUShort(val: number): number {
    return val & 0xFFFF;
  };

}