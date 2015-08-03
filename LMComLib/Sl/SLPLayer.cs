using System;
using LMNetLib;
using LMComLib;
#if JavaScript
using SharpKit.JavaScript; 
using LMSystem.Windows.Browser;
#else
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.Serialization;

using System.Threading;
using System.Globalization;
using System.Windows;
#endif
using System.IO;
#if !NewVersion
#endif

namespace LMComLib.SL {

  /*
   * trialAll: testuje se Expired>Now. Kdyz FALSE, 
   *    - hlasi se message na kazde strance a nejde zvuk
   *    - message se nehlasi, kdyz je MoodleNotExpired a URL stranky odpovida MOODLE
   * trialServices: testuje se ExpiredService>Now. Kdyz FALSE, 
   *    - hlasi se message pri pristupu ke sluzbe (a nejdou sluzby)
   *    - kdyz je HideLicenceServiceControls, linky na services se neukazuji
   */
#if JavaScript
  [JsType(JsMode.Prototype, Filename = "~/res/SLPlayer/SLPlayer.js", Name = codeNames.LMComLib_SL_LicenceType)]
#endif
  public enum LicenceType {
    no,
    //demoModules, //vycet volnych URL modulu je v SPlayer.xap
    //hosts, //vycet volnych host je v SPlayer.xap
    trialAll, //kontroluje se Host, Expired a SpaceId a ev. MoodleOnly, pro funkci LicenceOK
    trialServices, //jako trialAll, ale pro funkci LicenceServiceOK
  }

  //Data contract pro SL prehravac (licencni soubor)
  [DataContract(Namespace = "lm")]
#if JavaScript
  [JsType(JsMode.Clr, Filename = "~/res/SLPlayer/SLPlayer.js", Name=codeNames.LMComLib_SL_Licence)]
#endif
  public class Licence {

    [DataMember]
    public LicenceType LicenceType;
    [DataMember]
    public long ExpiredInt = LowUtils.DateToInt(DateTime.UtcNow);
    public DateTime Expired { get { return LowUtils.IntToDate(ExpiredInt, Expired__); } set { ExpiredInt = LowUtils.DateToInt(value); Expired__ = value; } }
    DateTime? Expired__;
    //public DateTime Expired = DateTime.UtcNow;
    [DataMember]
    public long ExpiredServiceInt = LowUtils.DateToInt(DateTime.UtcNow);
    public DateTime ExpiredService { get { return LowUtils.IntToDate(ExpiredServiceInt, ExpiredService__); } set { ExpiredServiceInt = LowUtils.DateToInt(value); ExpiredService__ = value; } }
    DateTime? ExpiredService__;
    //public DateTime ExpiredService = DateTime.UtcNow;
    [DataMember]
    public string Host;
    [DataMember]
    public string SpaceId; //? obsolete ?
    [DataMember]
    public bool MoodleNotExpired; //Pro MOODLE Basic version kurzu nikdy neexpiruje
    [DataMember]
    public bool HideLicenceServiceControls; //? obsolete ?
    [DataMember]
    public int AmountUsers; //pro LMS licence
    [DataMember]
    public bool ShowDays; //v GUI ukazat pocet dni expirace
    [DataMember]
    public bool ShowBuy; //v GUI ukazat Buy tlacitko
    [DataMember]
    public bool IsELand; //ELand user
    //Informace
    [DataMember]
    public string FirstName;
    [DataMember]
    public string LastName;
    [DataMember]
    public string AdminEmail;
    [DataMember]
    public string Company;
    [DataMember]
    public string CompanyUrl;
    [DataMember]
    public long CreatedInt = LowUtils.DateToInt(DateTime.UtcNow);
    public DateTime Created { get { return LowUtils.IntToDate(CreatedInt, Created__); } set { CreatedInt = LowUtils.DateToInt(value); Created__ = value; } }
    DateTime? Created__;
    //public DateTime Created = DateTime.UtcNow;
    public static bool notFreeLicence(Langs lng, CourseIds crsId) {
      return lng == Langs.vi_vn || lng == Langs.no || crsId == CourseIds.Russian || crsId == CourseIds.EuroEnglish;
    }

#if NewVersion || !OldVersion
    static Licence FromBytes(byte[] data) {
      return null;
    }

    public byte[] ToBytes() {
      return LowUtils.JsObjectEncodeBin(this);
    }

    public override string ToString() {
      return LowUtils.JsObjectEncode(this);
    }

    public static Licence FromString(string str) {
      return LowUtils.JsObjectDecode<Licence>(str);
    }
#else
    static Licence FromBytes(byte[] data) {
      return MsgPack.Serializer.BytesToObject<Licence>(data);
    }

    public byte[] ToBytes() {
      return MsgPack.Serializer.ObjectToBytes(this);
    }

    public override string ToString() {
      return LowUtils.HexDecode(ToBytes());
    }

    public static Licence FromString(string str) {
      return FromBytes(LowUtils.HexEncode(str));
    }
#endif
    public static string[] demoModules = new string[] {
      "english1/l02/a",
      "english2/l05/b",
      "english3/l05/a",
      "english4/l05/a",
      "english5/l34/j",
      "german1/les4/chapc",
      "german2/les3/chapb",
      "german3/les1/chapa",
      "spanish1/l06/a",
      "spanish2/l01/b",
      "spanish3/l04/b",
      "french1/l04/a",
      "french2/l08/b",
      "french3/l06/a",
      "italian1/l05/a",
      "italian2/l04/b",
      "italian3/l01/b",
      "russian1/lesson4/chaptera",
      "russian2/lesson1/chapterc",
      "russian3/lesson1/chaptera",
      "euroenglish/chapter1",
    }
#if !JavaScript
.Select(s => s.ToLowerInvariant()).ToArray()
#endif
;

    public const string LicenceFileName = "signature.bin";
    public const string LicenceUrl = "signature.url";
    public const string FixLicenceUrl = "http://www.langmaster.com/lmcom/services/lmslicence.aspx";
    public const int LicenceFileNameLen = 1024;
    //Ochrane prvky

    /*public static Licence fromStream(Stream str) {
#if JavaScript
      return null;
#else
      if (str == null || str.Length == 0) return null;
      byte[] strData = null;
      CultureInfo cult = Thread.CurrentThread.CurrentUICulture;
      Thread.CurrentThread.CurrentUICulture = CultureInfo.InvariantCulture;
      try {
        try {
          using (BinaryReader rdr = new BinaryReader(str)) strData = rdr.ReadBytes((int)str.Length);
          byte[] data = new byte[strData.Length];
          Array.Copy(strData, data, strData.Length);
          data = LowUtils.Decrypt(data, LowUtils.encryptKey);
          string dataStr = Encoding.UTF8.GetString(data, 0, data.Length);
          int idx = dataStr.IndexOf("</Licence>");
          return (LMComLib.SL.Licence)ZipWrapper.Deserialize(typeof(LMComLib.SL.Licence), dataStr.Substring(0, idx + 10));
        } catch {
          return (LMComLib.SL.Licence)ZipWrapper.Deserialize(typeof(LMComLib.SL.Licence), strData);
        }
      } finally {
        Thread.CurrentThread.CurrentUICulture = cult;
      }
#endif
    }
    public byte[] toBytes() {
#if JavaScript
      return null;
#else
      Created = DateTime.UtcNow;
      return LowUtils.Encrypt(ZipWrapper.Serialize(this), LowUtils.encryptKey);
#endif
    }*/
  }

}
