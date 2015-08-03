using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Text;
using LMNetLib;

namespace LMComLib {

  /// <summary>
  /// Musi odpovidat http://localhost/cz/ea/cs-cz/Framework/Script/LM/RegLicence.js
  /// Musi byt vzestupne podle vahy licence (full je nejvic)
  /// </summary>
  public enum ProductRight {
    no = 0,
    /// <summary>
    /// vyprsela casove omezena verze produktu, nutno zakoupit prodlouzeni
    /// </summary>
    expired = 1,
    /// <summary>
    /// trial verze
    /// </summary>
    trial = 2,
    /// <summary>
    /// omezena verze (vyprsel trial RegLimitedFree produktu)
    /// </summary>
    limited = 3,
    /// <summary>
    /// plna, neomezena verze
    /// </summary>
    full = 4,
  }
  /// <summary>
  /// Typy licencnich klicu
  /// </summary>
#if !SILVERLIGHT
  [EnumDescrAttribute(typeof(RegLicenceScena), "full=neomezená licence,express=Express,expressUpgrade=Rozšíření z Express na neomezenou,date=časově omezená,multiFull=firemní multilicence,multiDate=časově omezená firemní multilicence,multiPrice=firemní kredit na online výuku,fixStartDate=pevné datum začátku kurzu")]
#endif
  public enum RegLicenceScena {
    no = 0,
    //Plna unlimited licence. Jakekoliv dalsi zadani licenci se ignoruji.
    full = 1,
    //Express licence (tj. dostupna pouze cast produktu, ktera je urceno v TLicenceObj.SubProduct)
    express = 2,
    //Aktualizace Express - plny produkt. Validni pouze pro predchozi ls_express
    expressUpgrade = 3,
    //Casove omezena licence: prvni zadani (ve forme "Na 3 mesice")
    date = 4,
    //Full multilicence  
    multiFull = 5,
    //Full Casove omezena licence  
    multiDate = 6,
    //Castka pro monline multilicenci
    multiPrice = 7,
    //Kurz zacina ve fixni datum
    fixStartDate = 8,
  };

  /// <summary>
  ///Licencni klic, predmet nakupu, neboli to, co uzivateli prijde na zaklade nakupu v eShopu resp. je
  ///vytisteno na instalacnim CD ROM v krabici
  ///Vztah key Armadilo:
  ///- na serveru se vklada do NAME ve funkci CreateCode
  ///- v run.exe se vklada do InstallKey (ten jej vlozi je do ALTUSERNAME promenne)
  /// </summary>
  public class RegLicenceObj {
    public RegLicenceScena Scena; //4 bits (16 moznosti)
    public int Serie; //24 bits (16M moznosti)
    public short Product; //14 bits (16 testItems moznosti)
    //public Domains Domain; //8 bits (256 moznosti)
    public Langs Lang;
    //Produkt z pohledu katalogu (v podstate kurz). Ucetni Produkt je upresneni katalogoveho
    //produktu o napr. "Unlimited", "3 mesice" apod.
    //**** Option data dle Scena fieldu: dalsich 15 bitu neboli 3 znaky
    public int Months; //7 bits (128 moznosti):
    //pro ls_date. Licencni klic obsahuje pocet mesicu licenc
    //pro ls_fixStartDate: Licencni klic obsahuje identifikaci pocatecniho data kurzu
    //Tento pocet se funkci SetLicence prevede na pocet mesicu po 1.1.2007 budto ode dneska
    //nebo od budouciho data expirace
    public int MultiCount; //8 bits (256 moznosti) pro ls_multi* (pocet licenci)
    public UInt16 MultiPrice; //15 bitu (32 testItems) pro multiPrice 
    bool isLarge() {
      return Scena == RegLicenceScena.date || Scena == RegLicenceScena.multiDate || Scena == RegLicenceScena.multiFull;
    }
    public string AsString {
      get {
        byte[] res = new byte[14];
        byte scena = (byte)Scena;
        byte[] serie = BitConverter.GetBytes(Serie);
        byte[] product = BitConverter.GetBytes((UInt16)Product);
        //byte domain = (byte)Domain;
        byte lang = (byte)Lang;
        res[0] = ConvertNew.to5Bits(scena, 4, 7, serie[2], 0); //bity 4..7, bit 0
        res[1] = ConvertNew.to5Bits(serie[2], 1); //bity 1..5
        res[2] = ConvertNew.to5Bits(serie[2], 6, 7, serie[1], 0); //bity 6..7, bity 0..2
        res[3] = ConvertNew.to5Bits(serie[1], 3); //bity 3..7
        res[4] = ConvertNew.to5Bits(serie[0], 0); //bity 0..4
        res[5] = ConvertNew.to5Bits(serie[0], 5, 7, product[1], 2); //bity 5..7, bity 2..3
        res[6] = ConvertNew.to5Bits(product[1], 4, 7, product[0], 0); //bity 4..7, bit 0
        res[7] = ConvertNew.to5Bits(product[0], 1); //bity 1..5
        //res[8] = ConvertNew.to5Bits(product[0], 6, 7, domain, 0); //bity 6..7, bity 0..2
        //res[9] = ConvertNew.to5Bits(domain, 3); //bity 3..7
        res[8] = ConvertNew.to5Bits(product[0], 6, 7, lang, 0); //bity 6..7, bity 0..2
        res[9] = ConvertNew.to5Bits(lang, 3); //bity 3..7
        if (isLarge()) {
          //byte months = 127;
          //byte multiCount = 255;
          byte months = (byte)Months;
          byte multiCount = (byte)MultiCount;
          //15 bitu pro Months (7 bitu) a MultiCount (8 bitu)
          res[10] = ConvertNew.to5Bits(months, 1); //bity 1..5
          res[11] = ConvertNew.to5Bits(months, 6, 7, multiCount, 0); //bity 6..7, bity 0..2
          res[12] = ConvertNew.to5Bits(multiCount, 3); //bity 3..7
          res[13] = ConvertNew.countCheck(res, 0, 13);
          return ConvertNew.Byte32ToString(res, 0, 14);
        } else if (Scena == RegLicenceScena.multiPrice || Scena == RegLicenceScena.fixStartDate) {
          byte[] price = BitConverter.GetBytes(MultiPrice);
          res[10] = ConvertNew.to5Bits(price[0], 1); //bity 1..5
          res[11] = ConvertNew.to5Bits(price[0], 6, 7, price[1], 0); //bity 6..7, bity 0..2
          res[12] = ConvertNew.to5Bits(price[1], 3); //bity 3..7
          res[13] = ConvertNew.countCheck(res, 0, 13);
          return ConvertNew.Byte32ToString(res, 0, 14);
        } else {
          res[10] = ConvertNew.countCheck(res, 0, 10);
          return ConvertNew.Byte32ToString(res, 0, 11);
        }
      }
      set {
        //Scena = RegLicenceScena.no; Serie = 0; Product = 0; Domain = Domains.no; Months = 0; MultiCount = 0;
        Scena = RegLicenceScena.no; Serie = 0; Product = 0; Lang = Langs.no; Months = 0; MultiCount = 0;
        value = value.Trim().ToUpper();
        byte[] res = new byte[14];
        int len = ConvertNew.StringToByte32(value, ref res, 0);
        if (!ConvertNew.checkCheck(res, 0, len - 1, res[len - 1]))
          throw new Exception();
        byte scena = 0;
        byte[] serie = new byte[4];
        byte[] product = new byte[2];
        //byte domain = 0;
        byte lang = 0;
        ConvertNew.from5Bits(res[0], ref scena, 4, 7, ref serie[2], 0); //bity 4..7, bit 0
        ConvertNew.from5Bits(res[1], ref serie[2], 1); //bity 1..5
        ConvertNew.from5Bits(res[2], ref serie[2], 6, 7, ref serie[1], 0);//bity 6..7, bity 0..2
        ConvertNew.from5Bits(res[3], ref serie[1], 3); //bity 3..7
        ConvertNew.from5Bits(res[4], ref serie[0], 0); //bity 0..4
        ConvertNew.from5Bits(res[5], ref serie[0], 5, 7, ref product[1], 2); //bity 5..7, bity 2..3
        ConvertNew.from5Bits(res[6], ref product[1], 4, 7, ref product[0], 0); //bity 5..7, bity 2..3
        ConvertNew.from5Bits(res[7], ref product[0], 1); //bity 1..5
        //ConvertNew.from5Bits(res[8], ref product[0], 6, 7, ref domain, 0); //bity 6..7, bity 0..2
        //ConvertNew.from5Bits(res[9], ref domain, 3); //bity 3..7
        ConvertNew.from5Bits(res[8], ref product[0], 6, 7, ref lang, 0); //bity 6..7, bity 0..2
        ConvertNew.from5Bits(res[9], ref lang, 3); //bity 3..7
        Scena = (RegLicenceScena)scena;
        Serie = BitConverter.ToInt32(serie, 0);
        Product = BitConverter.ToInt16(product, 0);
        //Domain = (Domains)domain;
        Lang = (Langs)lang;
        if (isLarge()) {
          byte months = 0;
          byte multiCount = 0;
          //15 bitu pro Months (7 bitu) a MultiCount (8 bitu)
          ConvertNew.from5Bits(res[10], ref months, 1); //bity 1..5
          ConvertNew.from5Bits(res[11], ref months, 6, 7, ref multiCount, 0); //bity 6..7, bity 0..2
          ConvertNew.from5Bits(res[12], ref multiCount, 3); //bity 3..7
          Months = months;
          MultiCount = multiCount;
        } else if (Scena == RegLicenceScena.multiPrice || Scena == RegLicenceScena.fixStartDate) {
          byte[] price = new byte[2];
          ConvertNew.from5Bits(res[10], ref price[0], 1); //bity 1..5
          ConvertNew.from5Bits(res[11], ref price[0], 6, 7, ref price[1], 0); //bity 6..7, bity 0..2
          ConvertNew.from5Bits(res[12], ref price[1], 3); //bity 3..7
          MultiPrice = BitConverter.ToUInt16(price, 0);
        }
      }
    }
    public static AcceptLicenceResult AsStringCheck(string key, Langs lang, out RegLicenceObj lic) {
    //public static AcceptLicenceResult AsStringCheck(string key, Domains site, out RegLicenceObj lic) {
      lic = new RegLicenceObj();
      try {
        lic.AsString = key;
      } catch {
        return AcceptLicenceResult.formatError;
      }
      if (lic.Scena != RegLicenceScena.full && lic.Scena != RegLicenceScena.date && lic.Scena != RegLicenceScena.fixStartDate)
        return AcceptLicenceResult.singleRequired;
      //if (lic.Domain != site)
      if (lic.Lang != lang)
        return AcceptLicenceResult.wrongDomain;
      return AcceptLicenceResult.ok;
    }
    public static void Test() {
      RegLicenceObj lic = new RegLicenceObj();
      lic.Scena = RegLicenceScena.multiDate;
      //lic.Domain = Domains.com;
      lic.Lang = Langs.en_gb;
      lic.Product = 16000;
      lic.Serie = 16000001;
      lic.Months = 127;
      lic.MultiCount = 255;
      string s = lic.AsString;
      lic.AsString = s;
      lic = null;
    }
  }

  /// <summary>
  /// Navratovy kod ze zadani licencniho klice. Musi souhlasit s Delphi TActivationResult
  /// </summary>
#if !SILVERLIGHT
  [EnumDescrAttribute(typeof(AcceptLicenceResult), "singleRequired=singleRequired,formatError=formatError,wrongDomain=wrongDomain,usedByAnotherUser=usedByAnotherUser,alreadyUsed=alreadyUsed,ok=ok,notNessesary=notNessesary,toManyOfflineUsers=toManyOfflineUsers,notAutorized=notAutorized")]
#endif
  public enum AcceptLicenceResult {
    no,
    singleRequired, //Do SingleLicence dialogu se dava spatna licence
    formatError, //chyba ve formatu licence stringu
    wrongDomain, //musi souhlasit domena
    usedByAnotherUser, //online licence je jiz pouzita jinym uzivatelem
    alreadyUsed, //online licence je jiz drive pouzita stejnym uzivatelem
    ok, //Online licence pouzita
    notNessesary, //neni potreba instalovat (nepomuze si), licence nevyuzita
    toManyOfflineUsers, //pro offline registraci: prilis mnoho registraci
    notAutorized, //aktivace mailem, uzivatel neni autorizovan
    wrongCourseId,
  }

  public enum RegOfflineType {
    auto,
    sms,
    internet,
    mail,
    MP3Download,
  }


}
