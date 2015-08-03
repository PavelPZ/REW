using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;
using System.Xml.Linq;
using System.IO;

namespace LMComLib {

  /// <summary>
  /// pouziti napr.
  /// Stemmer czStemmer = new Stemmer(Stemmer.CLSID_CzStemmer);
  /// List<string> res = new List<string> ();
  /// czStemmer.GenerateWordForms("koňům", delegate(string word, bool isAltWorld) { res.Add(word); });
  /// </summary>
  public class Stemmer : IWordFormSink {
    static Dictionary<Langs, Guid> guids = new Dictionary<Langs, Guid>();
    static Dictionary<Langs, IStemmer> All = new Dictionary<Langs, IStemmer>();
    static Stemmer() {
      guids.Add(Langs.cs_cz, new Guid("021bb1ac-5625-4a7a-9785-06a78840b812"));
      guids.Add(Langs.fr_fr, new Guid("2a6eb050-7f1c-11ce-be57-00aa0051fe20"));
      guids.Add(Langs.de_de, new Guid("510a4910-7f1c-11ce-be57-00aa0051fe20"));
      guids.Add(Langs.it_it, new Guid("6d36ce10-7f1c-11ce-be57-00aa0051fe20"));
      guids.Add(Langs.sp_sp, new Guid("b0516ff0-7f1c-11ce-be57-00aa0051fe20"));
      guids.Add(Langs.en_gb, new Guid("d99f7670-7f1a-11ce-be57-00aa0051fe20"));
      guids.Add(Langs.no, new Guid("78fe669a-186e-4108-96e9-77b586c1332f")); //null
      bool lic;
      foreach (KeyValuePair<Langs, Guid> kv in guids) {
        IStemmer stemmer = (IStemmer)Com.CoCreateInstance(guids[kv.Key], null, Com.CLSCTX.CLSCTX_INPROC, IStemmerGuid);
        stemmer.Init(1000, out lic);
        All.Add(kv.Key, stemmer);
      }
      /*
dutch {860d28d0-8bf4-11ce-be59-00aa0051fe20}
swedish {9478f640-7f1c-11ce-be57-00aa0051fe20}
english US {eeed4c20-7f1b-11ce-be57-00aa0051fe20}
      */
    }


    public delegate void putWord(string word, bool isAltWord);

    IStemmer stemmer;
    putWord OnPutWorld;
    static Guid IStemmerGuid = new Guid("efbaf140-7f42-11ce-be57-00aa0051fe20");

    public Stemmer(Langs lang) {
      if (!guids.ContainsKey(lang)) lang = Langs.no;
      stemmer = All[lang];
    }

    public void GenerateWordForms(string word, putWord onPutWorld) {
      OnPutWorld = onPutWorld;
      stemmer.GenerateWordForms(word, word.Length, this);
    }

    public string GenerateWordForms(string word, List<string> buf) {
      buf.Clear();
      GenerateWordForms(word, delegate(string w, bool isAltWorld) { buf.Add(w); });
      if (buf.Count <= 0) return null;
      buf.Sort();
      return buf[0];
    }

    public void PutAltWord(string pwcInBuf, int cwc) {
      if (OnPutWorld != null) OnPutWorld(pwcInBuf.Substring(0, cwc), true);
    }
    public void PutWord(string pwcInBuf, int cwc) {
      if (OnPutWorld != null) OnPutWorld(pwcInBuf.Substring(0, cwc), false);
    }
  }

  public static class Com {
    [DllImport("ole32.dll", ExactSpelling = true, PreserveSig = false)]
    [return: MarshalAs(UnmanagedType.Interface)]
    public static extern object CoCreateInstance(
       [In, MarshalAs(UnmanagedType.LPStruct)] Guid rclsid,
       [MarshalAs(UnmanagedType.IUnknown)] object pUnkOuter,
       CLSCTX dwClsContext,
       [In, MarshalAs(UnmanagedType.LPStruct)] Guid riid);

    [Flags]
    public enum CLSCTX : uint {
      CLSCTX_INPROC_SERVER = 0x1,
      CLSCTX_INPROC_HANDLER = 0x2,
      CLSCTX_LOCAL_SERVER = 0x4,
      CLSCTX_INPROC_SERVER16 = 0x8,
      CLSCTX_REMOTE_SERVER = 0x10,
      CLSCTX_INPROC_HANDLER16 = 0x20,
      CLSCTX_RESERVED1 = 0x40,
      CLSCTX_RESERVED2 = 0x80,
      CLSCTX_RESERVED3 = 0x100,
      CLSCTX_RESERVED4 = 0x200,
      CLSCTX_NO_CODE_DOWNLOAD = 0x400,
      CLSCTX_RESERVED5 = 0x800,
      CLSCTX_NO_CUSTOM_MARSHAL = 0x1000,
      CLSCTX_ENABLE_CODE_DOWNLOAD = 0x2000,
      CLSCTX_NO_FAILURE_LOG = 0x4000,
      CLSCTX_DISABLE_AAA = 0x8000,
      CLSCTX_ENABLE_AAA = 0x10000,
      CLSCTX_FROM_DEFAULT_CONTEXT = 0x20000,
      CLSCTX_INPROC = CLSCTX_INPROC_SERVER | CLSCTX_INPROC_HANDLER,
      CLSCTX_SERVER = CLSCTX_INPROC_SERVER | CLSCTX_LOCAL_SERVER | CLSCTX_REMOTE_SERVER,
      CLSCTX_ALL = CLSCTX_SERVER | CLSCTX_INPROC_HANDLER
    }

  }

  [ComImport]
  [Guid("fe77c330-7f42-11ce-be57-00aa0051fe20")]
  [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  public interface IWordFormSink {
    void PutAltWord([MarshalAs(UnmanagedType.LPWStr)] string pwcInBuf, [MarshalAs(UnmanagedType.U4)] int cwc);
    void PutWord([MarshalAs(UnmanagedType.LPWStr)] string pwcInBuf, [MarshalAs(UnmanagedType.U4)] int cwc);
  }

  [ComImport]
  [Guid("efbaf140-7f42-11ce-be57-00aa0051fe20")]
  [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  public interface IStemmer {
    void Init([MarshalAs(UnmanagedType.U4)] int ulMaxTokenSize, [MarshalAs(UnmanagedType.Bool)] out bool pfLicense);
    void GenerateWordForms([MarshalAs(UnmanagedType.LPWStr)] string pwcInBuf, [MarshalAs(UnmanagedType.U4)] int cwc, [MarshalAs(UnmanagedType.Interface)] IWordFormSink pStemSink);
    void GetLicenseToUse([MarshalAs(UnmanagedType.LPWStr)] out string ppwcsLicense);
  }

  //http://www.sqljunkies.com/HowTo/B28D8759-C093-4A09-AF79-257B46C41D49.scuk
  [ComImport]
  [Guid("D53552C8-77E3-101A-B552-08002B33B0E6")]
  [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  public interface IWordBreaker {
    void Init([MarshalAs(UnmanagedType.Bool)] bool fQuery, [MarshalAs(UnmanagedType.U4)] int maxTokenSize, [MarshalAs(UnmanagedType.Bool)] out bool pfLicense);
    void BreakText([MarshalAs(UnmanagedType.Struct)] ref TEXT_SOURCE pTextSource, [MarshalAs(UnmanagedType.Interface)] IWbWordSink pWordSink, [MarshalAs(UnmanagedType.Interface)] IPhraseSink pPhraseSink);
    void GetLicenseToUse([MarshalAs(UnmanagedType.LPWStr)] out string ppwcsLicense);
  }

  [Flags]
  public enum WORDREP_BREAK_TYPE {
    WORDREP_BREAK_EOW = 0,
    WORDREP_BREAK_EOS = 1,
    WORDREP_BREAK_EOP = 2,
    WORDREP_BREAK_EOC = 3
  }
  [ComImport]
  [Guid("CC907054-C058-101A-B554-08002B33B0E6")]
  [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  public interface IWbWordSink {
    void PutWord([MarshalAs(UnmanagedType.U4)] int cwc, [MarshalAs(UnmanagedType.LPWStr)] string pwcInBuf,
      [MarshalAs(UnmanagedType.U4)] int cwcSrcLen, [MarshalAs(UnmanagedType.U4)] int cwcSrcPos);
    void PutAltWord([MarshalAs(UnmanagedType.U4)] int cwc, [MarshalAs(UnmanagedType.LPWStr)] string pwcInBuf,
      [MarshalAs(UnmanagedType.U4)] int cwcSrcLen, [MarshalAs(UnmanagedType.U4)] int cwcSrcPos);
    void StartAltPhrase();
    void EndAltPhrase();
    void PutBreak(WORDREP_BREAK_TYPE breakType);
  }
  [ComImport]
  [Guid("CC906FF0-C058-101A-B554-08002B33B0E6")]
  [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  public interface IPhraseSink {
    void PutSmallPhrase([MarshalAs(UnmanagedType.LPWStr)] string pwcNoun, [MarshalAs(UnmanagedType.U4)] int cwcNoun,
      [MarshalAs(UnmanagedType.LPWStr)] string pwcModifier, [MarshalAs(UnmanagedType.U4)] int cwcModifier, [MarshalAs(UnmanagedType.U4)] int ulAttachmentType);
    void PutPhrase([MarshalAs(UnmanagedType.LPWStr)] string pwcPhrase, [MarshalAs(UnmanagedType.U4)] int cwcPhrase);
  }

  public class WordBreaker : IWbWordSink {

    //public const string stopWordsXml = @"q:\LMCom\rw\Rewise\App_Data\rewise\StopWords.xml";
    static Dictionary<Langs, Guid> guids = new Dictionary<Langs, Guid>();
    static Dictionary<Langs, IWordBreaker> All = new Dictionary<Langs, IWordBreaker>();
    public delegate void putWord(string word);
    static Dictionary<Langs, HashSet<string>> StopWords = new Dictionary<Langs, HashSet<string>>();
    static WordBreaker() {
      guids.Add(Langs.cs_cz, new Guid("9D9E4BCA-6C92-4267-B719-991D49E99DFA"));
      guids.Add(Langs.fr_fr, new Guid("59e09848-8099-101b-8df3-00000b65c3b5"));
      guids.Add(Langs.de_de, new Guid("9b08e210-e51b-11cd-bc7f-00aa003db18e"));
      guids.Add(Langs.it_it, new Guid("fd86b5d0-12c6-11ce-bd31-00aa004bbb1f"));
      guids.Add(Langs.sp_sp, new Guid("0285b5c0-12c7-11ce-bd31-00aa004bbb1f"));
      guids.Add(Langs.en_gb, new Guid("369647e0-17b0-11ce-9950-00aa004bbb1f")); //neutral
      guids.Add(Langs.no, new Guid("369647e0-17b0-11ce-9950-00aa004bbb1f")); //neutral
      bool lic;
      foreach (KeyValuePair<Langs, Guid> kv in guids) {
        try {
          IWordBreaker wb = (IWordBreaker)Com.CoCreateInstance(guids[kv.Key], null, Com.CLSCTX.CLSCTX_INPROC, IWordBreakerGuid);
          wb.Init(false, 1000, out lic);
          All.Add(kv.Key, wb);
        } catch { }
      }
      //readStopWords();
      /*
swedish {01c6b350-12c7-11ce-bd31-00aa004bbb1f}
dutch {66b37110-8bf2-11ce-be59-00aa0051fe20}
      */
    }

    /*static void readStopWords() {
      StopWords.Clear();
      XElement src;
      try { src = File.Exists(stopWordsXml) ? XElement.Load(stopWordsXml) : null; } catch (Exception exp) { throw new Exception(stopWordsXml, exp); }
      foreach (Langs lng in new Langs[] { Langs.cs_cz, Langs.de_de, Langs.en_gb, Langs.fr_fr, Langs.it_it, Langs.ru_ru, Langs.sp_sp, Langs.no }) {
        HashSet<string> sw = new HashSet<string>(); StopWords.Add(lng, sw);
        if (src != null && src.Element(lng.ToString()) != null)
          foreach (string s in src.Element(lng.ToString()).Elements().Select(el => el.Value))
            sw.Add(s.ToLower());
      }
    }*/

    public WordBreaker(Langs lang) {
      if (!guids.ContainsKey(lang)) lang = Langs.no;
      breaker = All[lang];
      //stopWords = StopWords[lang];
    }

    putWord OnPutWorld;
    IWordBreaker breaker;
    //HashSet<string> stopWords;

    uint WBREAK_E_END_OF_TEXT = 0x80041780;
    public void doWordBreak(string text, putWord doPutWord) {
      OnPutWorld = doPutWord;
      TEXT_SOURCE pTextSource = new TEXT_SOURCE();
      pTextSource.pfnFillTextBuffer = new delFillTextBuffer(delegate(ref TEXT_SOURCE ts) {
        return WBREAK_E_END_OF_TEXT;
      });
      pTextSource.iCur = 0;
      pTextSource.awcBuffer = text;
      pTextSource.iEnd = text.Length;
      breaker.BreakText(ref pTextSource, this, null);
    }
    public delegate bool isStopWordEvent(string w, List<string> stopWords);

    public void doWordBreak(string text, List<string> buf, List<string> stopWords, isStopWordEvent isStopWord) {
      buf.Clear();
      doWordBreak(text, delegate(string w) { if (isStopWord!=null && !isStopWord (w, stopWords)) buf.Add(w); });
    }

    public void doWordBreak(string text, List<string> buf) {
      buf.Clear();
      doWordBreak(text, delegate(string w) { buf.Add(w); });
    }

    public List<string> doWordBreak(string text) {
      List<string> buf = new List<string>();
      doWordBreak(text, delegate(string w) { buf.Add(w); });
      return buf;
    }

    static Guid IWordBreakerGuid = new Guid("D53552C8-77E3-101A-B552-08002B33B0E6");

    public void PutWord(int cwc, string pwcInBuf, int cwcSrcLen, int cwcSrcPos) {
      if (OnPutWorld != null) OnPutWorld(pwcInBuf.Substring(0, cwc));
    }
    public void PutAltWord(int cwc, string pwcInBuf, int cwcSrcLen, int cwcSrcPos) {
      if (OnPutWorld != null) OnPutWorld(pwcInBuf.Substring(0, cwc));
    }
    public void StartAltPhrase() {
    }
    public void EndAltPhrase() {
    }
    public void PutBreak(WORDREP_BREAK_TYPE breakType) {
      /*
      string strBreak;
      switch (breakType) {
        case WORDREP_BREAK_TYPE.WORDREP_BREAK_EOC:
          strBreak = "EOC";
          break;
        case WORDREP_BREAK_TYPE.WORDREP_BREAK_EOP:
          strBreak = "EOP";
          break;
        case WORDREP_BREAK_TYPE.WORDREP_BREAK_EOS:
          strBreak = "EOS";
          break;
        case WORDREP_BREAK_TYPE.WORDREP_BREAK_EOW:
          strBreak = "EOW";
          break;
        default:
          strBreak = "ERROR";
          break;
      }
      strBreak = null;
      */
    }
  }

  /*public class PhraseSink : IPhraseSink {
    public void PutSmallPhrase(string pwcNoun, int cwcNoun, string pwcModifier, int cwcModifier, int ulAttachmentType) {
      string res1 = pwcNoun.Substring(0, cwcNoun);
      string res2 = pwcModifier.Substring(0, cwcModifier);
      res2 = null;
    }
    public void PutPhrase(string pwcPhrase, int cwcPhrase) {
      string res = pwcPhrase.Substring(0, cwcPhrase);
      res = null;
    }
  }*/

  // used to fill the buffer for TEXT_SOURCE
  public delegate uint delFillTextBuffer([MarshalAs(UnmanagedType.Struct)] ref TEXT_SOURCE pTextSource);

  [StructLayout(LayoutKind.Sequential)]
  public struct TEXT_SOURCE {
    [MarshalAs(UnmanagedType.FunctionPtr)]
    public delFillTextBuffer pfnFillTextBuffer;
    [MarshalAs(UnmanagedType.LPWStr)]
    public string awcBuffer;
    [MarshalAs(UnmanagedType.U4)]
    public int iEnd;
    [MarshalAs(UnmanagedType.U4)]
    public int iCur;
  }


}


