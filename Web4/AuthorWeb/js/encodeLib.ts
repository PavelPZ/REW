module waEncode {

  //**************** Escape, bracket content encoding, ...
  export function escape(s: string): string {
    if (_.isEmpty(s)) return s;
    var res = []; var encodeNext = false;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (encodeNext) {
        encodeNext = false;
        if (ch == '\n') { res.push(escapeChar + ch); continue; }
        res.push(escapeFlag);
        var idx = ch.charCodeAt(0); if (idx > s2Max - s2) throw 'idx > s2Max - s2';
        res.push(String.fromCharCode(s2 + idx));
        continue;
      }
      if (ch != escapeChar) { res.push(ch); continue; }
      encodeNext = true;
    }
    return res.join('');
  }
  export function unEscape(s: string): string {
    if (_.isEmpty(s)) return s
    var res = []; var encodeNext = false;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (encodeNext) {
        encodeNext = false;
        var idx = ch.charCodeAt(0);
        res.push(String.fromCharCode(idx - s2));
        continue;
      }
      if (ch != escapeFlag) { res.push(ch); continue; }
      encodeNext = true;
    }
    return res.join('');
  }
  var escapeFlag = '\u167F';
  var escapeChar = '\\';
  export var s1 = 0x1400;
  export var s1Max = 0x15FF;
  var s1First = '\u1400';
  var s1Last = '\u15FF';
  export var s2 = 0x4E00;
  export var s2Max = 0x9FCC;
  var s2First = '\u4E00';
  var s2Last = '\u9FCC';
  var lowerMask = 0x000001ff;
  var fill = '≡';
  function firstCode(sb: Array<string>, idx: number) { sb.push(String.fromCharCode(s1 + (idx & lowerMask))); }
  function secondCode(sb: Array<string>, idx: number) { sb.push(String.fromCharCode(s2 + (idx >> 9))); }
  export function encode(sb: Array<string>, idx: number, length: number) {
    firstCode(sb, idx);
    secondCode(sb, idx);
    for (var i = 0; i < length; i++) sb.push(fill);
  }
  export function decode(ch1: number, ch2: number) {
    return ch1 - s1 + ((ch2 - s2) << 9);
  }

  //*********** styleParams
  export class styleParams {
    ids: Array<string>;
    id() { return !this.ids || this.ids.length == 0 ? null : this.ids[0]; }
    attrs: { [id: string]: string; } = {};
    values: Array<string> = [];
    valStr: string;
    fillParValue(parVal: string, trim:boolean = true): styleParams {
      var match = inlineParsMask.exec(parVal); if (!match) return;
      var par = match[1]; this.valStr = match[2];
      this.fillPar(par);
      this.values = !this.valStr ? [] : _.map(this.valStr.split('|'), v => unEscape(trim ? v.trim() : v));
      return this;
    }
    fillPar(par: string, trim: boolean = true): styleParams {
      if (_.isEmpty(par)) return this;
      var kvs = _.map<string,Array<string>>(par.replace(/[\n\s;]+$/, "").split(';'), p => {
        var idx = p.indexOf('='); return idx < 0 ? [p] : [p.substring(0,idx), p.substr(idx+1)];
      });
      var ids = kvs[0][0].trim().split(/\s+/); 
      if (kvs.length > 1 || kvs[0].length > 1) {
        kvs[0][0] = ids[ids.length - 1];
        this.ids = ids.slice(0, ids.length - 1);
        _.each(kvs, kv => this.attrs[kv[0].trim()] = unEscape(trim && kv[1] ? kv[1].trim() : kv[1]));
      } else this.ids = ids;
      return this;
    }
  }
  export var inlineParsMask = /^(?:\((.*?)\))?(?:\s(.*))?$/;

  export class inlineParams {
    values: Array<string> = [];
    pars: string;
    vals: string;
    constructor (parVal: string) {
      var match = inlineParsMask.exec(parVal); if (!match) return;
      this.pars = match[1]; var valStr = this.vals = match[2];
      this.values = !valStr ? [] : _.map(valStr.split('|'), v => unEscape(v));
    }
  }

}