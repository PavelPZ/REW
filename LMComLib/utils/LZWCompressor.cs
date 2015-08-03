using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace LMNetLib {

  public class LZWCompressor {
    public static void Test(string txt) {
      //string txt = File.ReadAllText(@"n:\RewiseLANGMaster\RewiseBooks\English\cambridge1.xml");
      string compressed, decompressed;
      List<UInt16> compressedStd;
      //compressed = Compress(txt);
      //string decompressed = Decompress(compressed);
      var comprBin = CompressBin(txt);
      decompressed = DecompressBin(comprBin);
      var len1 = txt.Length;
      compressedStd = CompressUtf8(txt).ToList();
      var len2 = compressedStd.Count;
      decompressed = DecompressUtf8(compressedStd);
      if (decompressed != txt)
        decompressed = null;
      //decompressed = DecompressStd(compressedStd);
    }

    public static IEnumerable<byte> CompressBin(string uncompressed) {
      return Compress(uncompressed).SelectMany(i => UInt16ToBytes(i));
    }

    public static string DecompressBin(IEnumerable<byte> compressed) {
      return Decompress(BytesToUInt16s(compressed));
    }

    static IEnumerable<byte> UInt16ToBytes(UInt16 val) { yield return (byte)(val >> 8); yield return (byte)(val & 0xFF); }
    static IEnumerable<UInt16> BytesToUInt16s(IEnumerable<byte> bytes) {
      var enums = bytes.GetEnumerator();
      while (enums.MoveNext()) {
        var b1 = enums.Current;
        enums.MoveNext();
        yield return (UInt16)((b1 << 8) + enums.Current);
      }
    }

    public static IEnumerable<UInt16> Compress(string uncompressed) {
      // build the dictionary a na zacatek vysledku dej vsechny pouzite charaktery
      UInt16 cnt = 0;
      Dictionary<string, UInt16> dictionary = new Dictionary<string, UInt16>(); //dictionary
      //List<UInt16> compressed = new List<UInt16>(); //vysledek komprese
      var chars = uncompressed.Distinct().ToArray();
      yield return (UInt16)chars.Length;
      foreach (var ch in uncompressed.Distinct()) {
        var idx = cnt++;
        dictionary.Add(ch.ToString(), idx);
        yield return Convert.ToUInt16(ch);
      }

      //komprese
      string w = string.Empty;
      foreach (char c in uncompressed) {
        string wc = w + c;
        if (dictionary.ContainsKey(wc)) {
          w = wc;
        } else {
          // write w to output
          yield return (UInt16)dictionary[w];
          // wc is a new sequence; add it to the dictionary
          dictionary.Add(wc, (UInt16)dictionary.Count);
          w = c.ToString();
        }
      }

      // write remaining output if necessary
      if (!string.IsNullOrEmpty(w))
        yield return (UInt16)dictionary[w];
    }

    
    public static IEnumerable<UInt16> CompressUtf8(string uncompressed) {
      //Init dictionary
      Dictionary<string, UInt16> dictionary = new Dictionary<string, UInt16>(); //dictionary
      for (UInt16 i = 0; i < 256; i++) dictionary.Add(Convert.ToChar(i).ToString(),i);

      //komprese
      var bytes = Encoding.UTF8.GetBytes(uncompressed);
      string w = string.Empty;
      foreach (var c in bytes.Select(b => Convert.ToChar(b))) {
        string wc = w + c;
        if (dictionary.ContainsKey(wc)) {
          w = wc;
        } else {
          // write w to output
          yield return dictionary[w];
          // wc is a new sequence; add it to the dictionary
          dictionary.Add(wc, (UInt16)dictionary.Count);
          w = c.ToString();
        }
      }

      // write remaining output if necessary
      if (!string.IsNullOrEmpty(w)) yield return dictionary[w];
    }

    public static string DecompressUtf8x(IEnumerable<UInt16> compressed) {
      //Init dictionary
      List<string> dictionary = new List<string>();
      for (UInt16 i = 0; i < 256; i++) dictionary.Add(Convert.ToChar(i).ToString());

      //Dekomprese
      var enumer = compressed.GetEnumerator();
      enumer.MoveNext();
      string w = dictionary[enumer.Current];
      StringBuilder decompressed = new StringBuilder(w);
      while (enumer.MoveNext()) {
        //for (int i = dictLen + 2; i < compressed.Count; i++) {
        UInt16 k = enumer.Current;
        string entry = null;
        if (k < dictionary.Count)
          entry = dictionary[k];
        else if (k == dictionary.Count)
          entry = w + w[0];
        else
          throw new Exception("Something wrong");

        decompressed.Append(entry);

        // new sequence; add it to the dictionary
        dictionary.Add(w + entry[0]);

        w = entry;
      }

      return decompressed.ToString();
    }

    public static string Decompressx(IEnumerable<UInt16> compressed) {
      var enumer = compressed.GetEnumerator();
      enumer.MoveNext();
      var dictLen = enumer.Current;
      Dictionary<UInt16, string> dictionary = new Dictionary<UInt16, string>();
      for (UInt16 i = 0; i < dictLen; i++) { enumer.MoveNext(); dictionary.Add(i, Convert.ToChar(enumer.Current).ToString()); }

      //Dekomprese
      enumer.MoveNext();
      string w = dictionary[enumer.Current];
      StringBuilder decompressed = new StringBuilder(w);
      while (enumer.MoveNext()) {
        //for (int i = dictLen + 2; i < compressed.Count; i++) {
        UInt16 k = enumer.Current;
        string entry = null;
        if (dictionary.ContainsKey(k))
          entry = dictionary[k];
        else if (k == dictionary.Count)
          entry = w + w[0];
        else
          throw new Exception("Something wrong");

        decompressed.Append(entry);

        // new sequence; add it to the dictionary
        dictionary.Add((UInt16)dictionary.Count, w + entry[0]);

        w = entry;
      }

      return decompressed.ToString();
    }

    public static string Decompress(IEnumerable<UInt16> compressed) {
      var enumer = compressed.GetEnumerator();
      enumer.MoveNext();
      var dictLen = enumer.Current;
      Dictionary<UInt16, string> dictionary = new Dictionary<UInt16, string>();
      for (UInt16 i = 0; i < dictLen; i++) { enumer.MoveNext(); dictionary.Add(i, Convert.ToChar(enumer.Current).ToString()); }

      //Dekomprese
      enumer.MoveNext();
      string w = dictionary[enumer.Current];
      StringBuilder decompressed = new StringBuilder(w);
      while (enumer.MoveNext()) {
        //for (int i = dictLen + 2; i < compressed.Count; i++) {
        UInt16 k = enumer.Current;
        string entry = null;
        if (dictionary.ContainsKey(k))
          entry = dictionary[k];
        else if (k == dictionary.Count)
          entry = w + w[0];
        else
          throw new Exception("Something wrong");

        decompressed.Append(entry);

        // new sequence; add it to the dictionary
        dictionary.Add((UInt16)dictionary.Count, w + entry[0]);

        w = entry;
      }

      return decompressed.ToString();
    }


    public static string DecompressUtf8(IEnumerable<UInt16> compressed) {
      //Init dictionary
      List<string> dictionary = new List<string>();
      for (UInt16 i = 0; i < 256; i++) dictionary.Add(Convert.ToChar(i).ToString());

      //Dekomprese
      var enumer = compressed.GetEnumerator();
      enumer.MoveNext();
      string w = dictionary[enumer.Current];
      MemoryStream decompressed = new MemoryStream();
      decompressed.WriteByte(Convert.ToByte(w[0]));
      while (enumer.MoveNext()) {
        //for (int i = dictLen + 2; i < compressed.Count; i++) {
        UInt16 k = enumer.Current;
        string entry = null;
        if (k < dictionary.Count)
          entry = dictionary[k];
        else if (k == dictionary.Count)
          entry = w + w[0];
        else
          throw new Exception("Something wrong");

        foreach (var b in entry.Select(ch => Convert.ToByte(ch))) decompressed.WriteByte(b);

        // new sequence; add it to the dictionary
        dictionary.Add(w + entry[0]);

        w = entry;
      }

      return Encoding.UTF8.GetString(decompressed.ToArray(), 0, (int)decompressed.Length);
    }


    public static List<UInt16> CompressStd(string uncompressed) {
      // build the dictionary a na zacatek vysledku dej vsechny pouzite charaktery
      UInt16 cnt = 0;
      Dictionary<string, UInt16> dictionary = new Dictionary<string, UInt16>(); //dictionary
      List<UInt16> compressed = new List<UInt16>(); //vysledek komprese
      compressed.Add(0); //misto pro pocet charakteru
      foreach (var ch in uncompressed.Distinct()) {
        var idx = cnt++;
        dictionary.Add(ch.ToString(), idx);
        compressed.Add(Convert.ToUInt16(ch));
      }
      compressed[0] = (UInt16)(compressed.Count - 1); //pocet charakteru

      //komprese
      string w = string.Empty;
      foreach (char c in uncompressed) {
        string wc = w + c;
        if (dictionary.ContainsKey(wc)) {
          w = wc;
        } else {
          // write w to output
          compressed.Add(dictionary[w]);
          // wc is a new sequence; add it to the dictionary
          dictionary.Add(wc, (UInt16)dictionary.Count);
          w = c.ToString();
        }
      }

      // write remaining output if necessary
      if (!string.IsNullOrEmpty(w))
        compressed.Add(dictionary[w]);

      return compressed;
    }

    public static string DecompressStd(List<UInt16> compressed) {
      //Prvnich compressed[0] znaku jsou pouzite charaktery, inicializuj dictionary
      var dictLen = compressed[0];
      Dictionary<UInt16, string> dictionary = new Dictionary<UInt16, string>();
      for (UInt16 i = 0; i < dictLen; i++) dictionary.Add(i, Convert.ToChar(compressed[i + 1]).ToString());


      //Dekomprese
      string w = dictionary[compressed[dictLen + 1]];
      StringBuilder decompressed = new StringBuilder(w);
      for (int i = dictLen + 2; i < compressed.Count; i++) {
        UInt16 k = compressed[i];
        string entry = null;
        if (dictionary.ContainsKey(k))
          entry = dictionary[k];
        else if (k == dictionary.Count)
          entry = w + w[0];

        decompressed.Append(entry);

        // new sequence; add it to the dictionary
        dictionary.Add((UInt16)dictionary.Count, w + entry[0]);

        w = entry;
      }

      return decompressed.ToString();
    }
  }
}
