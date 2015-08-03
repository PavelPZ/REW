using System;
using LMComLib;
using System.Collections.Generic;
using System.Net;
using System.Web;
using System.IO;
using System.Text;
using System.Data.SqlClient;
using System.Data.Linq;
using System.Data.Linq.Mapping;
using System.Linq;

using LMComData2; 

namespace LMComLib.eBanka {
  /// <summary>
  /// Třída s obecnými parametry pro eBanku
  /// </summary>
  public abstract class eBanka {
    /// <summary>
    /// Adresa pro platbu
    /// </summary>
    protected string SetUrl = "https://" + System.Configuration.ConfigurationManager.AppSettings["eBanka.Host"] + "/owa/shop.payment";
    /// <summary>
    /// Adresa pro získání
    /// </summary>
    protected string GetUrl = "https://" + System.Configuration.ConfigurationManager.AppSettings["eBanka.Host"] + "/owa/shop.getpayments";
    /// <summary>
    /// Identifikační řetězec prodejce, slouží k přiřazení platby konkrétnímu prodejci z databáze
    /// </summary>
    protected string shopname = System.Configuration.ConfigurationManager.AppSettings["eBanka.shopname"];
    /// <summary>
    /// Číslo účtu prodejce
    /// </summary>
    protected string creditaccount = System.Configuration.ConfigurationManager.AppSettings["eBanka.creditaccount"];
    /// <summary>
    /// Heslo prodejce pro přístup k přehledu plateb
    /// </summary>
    protected string password = System.Configuration.ConfigurationManager.AppSettings["eBanka.password"];
    /// <summary>
    /// Kód banky, u něhož je tento účet založen
    /// </summary>
    protected string creditbank = System.Configuration.ConfigurationManager.AppSettings["eBanka.creditbank"];
    /// <summary>
    /// Formát datumu
    /// </summary>
    protected const string dateformat = "dd.MM.yyyy";
    /// <summary>
    /// Po uspesnem zadani platebniho prikazu by se na Vasich navratovych strankach melo objevit hlaseni
    /// </summary>
    public const string msg_success = "Platební příkaz byl eBankou v pořádku přijat.";
    /// <summary>
    /// Po vyskytu chyby v platebnim prikazu by se na Vasich navratovych strankach melo objevit hlaseni
    /// </summary>
    public const string msg_failed = "Platební příkaz NEBYL eBankou přijat!";
  }

  /// <summary>
  /// Třída pro platbu eBankou
  /// </summary>
  public class PaymentRequest : eBanka {
    public decimal amount;

    public string curcode;
    /// <summary>
    /// Poznámka pro prodejce – bude uvedena v záznamu příslušné transakce (max. 140 znaků)
    /// </summary>
    public string credittext;
    /// <summary>
    /// Variabilní symbol platby (max. 10 znaků) – numerické znaky
    /// </summary>    
    public string varsymbol;
    /// <summary>
    /// Konstantní symbol platby (max. 4 znaky)
    /// </summary>        
    public string constsymbol;
    /// <summary>
    /// Specifický symbol platby (max. 10 znaky) – numerické znaky
    /// </summary>    
    public string specsymbol;
    /// <summary>
    /// První den splatnosti ve tvaru: DD.MM.YYYY
    /// </summary>    
    public DateTime validfrom;
    /// <summary>
    /// Poslední den splatnosti ve tvaru: DD.MM.YYYY
    /// </summary>    
    public DateTime validto;
    /// <summary>
    /// E-mailová adresa, na kterou se posílá zpráva pro příjemce v okamžiku realizace transakce (není-li uvedena, žádná zpráva se neposílá)
    /// </summary>    
    public string email;
    /// <summary>
    ///  K adrese předané v URL, jež slouží jako návrat na stránky prodejce, jsou připojené následující parametry:
    ///   completed=Y	příkaz byl akceptován bankou, nebo
    ///   completed=N	klient příkaz nepředal bance (klepnul na tlačítko „Zpět“)
    ///   orderid	    vrací hodnotu vstupního parametru varsymbol
    ///   (signedurl)	podepsané URL digitálním podpisem (v případě, že se jedná o 	obchodníka, který komunikuje s eBankou pomocí digitálního podpisu)
    /// </summary>    
    public string URL;
    /// <summary>
    /// Adresa stránky, která se zobraní po úspěšném zadání platebního příkazu do eBanky.  Není-li uvedena, použije se parametr URL.
    ///	K adrese předané v URL, jež slouží jako návrat na stránky prodejce, jsou připojené následující parametry:
    ///	  orderid       vrací hodnotu vstupního parametru varsymbol
    ///   (signedurl)	podepsané URL digitálním podpisem (v případě, že se jedná o 	obchodníka, který komunikuje s eBankou pomocí digitálního podpisu)
    /// </summary>    
    public string URLsuccess;
    /// <summary>
    /// Adresa stránky, která se zobraní po neúspěšném zadání platebního příkazu do eBanky - klient příkaz nepředal bance (klepnul na tlačítko „Zpět“) Není-li uvedena, použije se parametr URL.
    /// K adrese předané v URL, jež slouží jako návrat na stránky prodejce, jsou připojené následující parametry:
    ///   orderid       vrací hodnotu vstupního parametru varsymbol
    ///   (signedurl)   podepsané URL digitálním podpisem (v případě, že se jedná o obchodníka, který komunikuje s eBankou pomocí digitálního podpisu)	
    /// </summary>    
    public string URLfail;
    /// <summary>
    /// Seznam produktů(zboží), které se zákázník(klient) nakoupil. Obchodník může posílat v seznamu název produktů (jejich jména)  i jejích číselník, který je uložen u eBanky v databázi.
    /// </summary>    
    public string product;
    /// <summary>
    /// Řetězec obsahující další parametry dle požadavků prodejce (např. identifikátor session). Zde uvedené parametry se po návratu ze stránek eBanky na stránky prodejce předají ve standardní formě, tj. jako součást URL. Formát parametrického řetězce je následující (páry název parametru – hodnota se oddělují středníkem):
    /// otherparams=parameter1=hodnota1;parameter2=hodnota2;parameter3=hodnota3;...
    /// </summary>
    public string otherparams;
    /// <summary>
    /// Elektronický podpis pro URL včetně všech parametrů kromě signedbusinessurl (vyžadováno v případě, že se jedná o obchodníka, který komunikuje s eBankou za pomoci elektronického podpisu.
    /// </summary>
    public string signedbusinessurl;
    /// <summary>
    /// Parametr určuje typ vzhledu platební brány. Hodnota  „SEZNAM“ vykreslí vstupní bránu v designu Seznam účtu. Není-li parametr uveden, vykresluje se standardní platební brána.
    /// </summary>
    public string type;

    /// <summary>
    /// <param name="Amount">Celková částka platby</param>
    /// <param name="VarSymbol">Variabilní symbol</param>
    /// </summary>
    public PaymentRequest(decimal Amount, string VarSymbol) {
      this.amount = Amount;
      this.curcode = null;
      this.credittext = null;
      this.varsymbol = VarSymbol;
      this.constsymbol = null;
      this.specsymbol = null;
      this.validfrom = DateTime.MinValue;
      this.validto = DateTime.MaxValue;
      this.email = null;
      this.URL = null;
      this.URLsuccess = null;
      this.URLfail = null;
      this.product = null;
      this.otherparams = null;
      this.signedbusinessurl = null;
      this.type = null;
    }

    /// <summary>
    /// Metoda pro sestavení URL stringu podle nastavených atributů
    /// </summary>
    public string BuildUrl() {
      string UrlParams = SetUrl + "?";
      UrlParams += "shopname=" + shopname;
      UrlParams += "&creditaccount=" + creditaccount;
      UrlParams += "&creditbank=" + creditbank;
      UrlParams += "&amount=" + Math.Round(this.amount, 2).ToString().Replace(',', '.');
      if (this.curcode != null) {
        UrlParams += "&curcode=" + this.curcode;
      }
      if (this.credittext != null) {
        UrlParams += "&credittext=" + this.credittext;
      }
      UrlParams += "&varsymbol=" + this.varsymbol;
      if (this.constsymbol != null) {
        UrlParams += "&constsymbol=" + this.constsymbol;
      }
      if (this.specsymbol != null) {
        UrlParams += "&specsymbol=" + this.specsymbol;
      }
      if (this.validfrom != DateTime.MinValue) {
        UrlParams += "&validfrom=" + this.validfrom.ToString(dateformat);
      }
      if (this.validto != DateTime.MaxValue) {
        UrlParams += "&validto=" + this.validto.ToString(dateformat);
      }
      if (this.email != null) {
        UrlParams += "&email=" + this.email;
      }
      if (this.URL != null) {
        UrlParams += "&URL=" + HttpUtility.UrlEncode (this.URL);
      }
      if (this.URLsuccess != null) {
        UrlParams += "&URLsuccess=" + this.URLsuccess;
      }
      if (this.URLfail != null) {
        UrlParams += "&URLfail=" + this.URLfail;
      }
      if (this.product != null) {
        UrlParams += "&product=" + this.product;
      }
      if (this.otherparams != null) {
        UrlParams += "&otherparams=" + HttpUtility.UrlEncode (this.otherparams);
      }
      if (this.signedbusinessurl != null) {
        UrlParams += "&signedbusinessurl=" + this.signedbusinessurl;
      }
      if (this.type != null) {
        UrlParams += "&type=" + this.type;
      }
      return UrlParams;
    }
  }

  /// <summary>
  /// Získání výpisu z eBanky
  /// </summary>
  public class PaymentResponse : eBanka {
    /// <summary>
    /// OLD   - přehled se zobrazí ve starém původním formátu (tato volba je zde z důvodů kompatibility)
    /// HTML - přehled se zobrací jako HTML stránka, kde jsou v tabulce zobrazeny údaje 
    /// PLAIN - přehled se zobrazí jako stránka ve formátu TEXT/PLAIN.
    /// </summary>
    public enum ListType { OLD, HTML, PLAIN, UNSET };
    /// <summary>
    /// Číslo účtu zákazníka
    /// </summary>
    public string debitaccount;
    /// <summary>
    /// Kód banky zákazníka
    /// </summary>
    public string debitbank;
    /// <summary>
    /// Minimální částka s desetinnou tečkou a dvěma desetinnými místy
    /// </summary>
    public string amountfrom;
    /// <summary>
    /// Maximální částka s desetinnou tečkou a dvěma desetinnými místy
    /// </summary>
    public string amountto;
    /// <summary>
    /// Třípísmenný kód měny převodu
    /// </summary>
    public string curcode;
    /// <summary>
    /// Variabilní symbol platby
    /// </summary>
    public string varsymbol;
    /// <summary>
    /// Konstantní symbol platby
    /// </summary>
    public string constsymbol;
    /// <summary>
    /// Specifický symbol platby
    /// </summary>
    public string specsymbol;
    /// <summary>
    /// První den splatnosti ve tvaru: DD.MM.YYYY
    /// </summary>
    public DateTime validfrom;
    /// <summary>
    /// Poslední den splatnosti ve tvaru: DD.MM.YYYY
    /// </summary>
    public DateTime validto;
    /// <summary>
    /// Začátek období, ve kterém byla částka transakce připsána na účet (formát: DD.MM.YYYY)
    /// </summary>
    public DateTime paidfrom;
    /// <summary>
    /// Konec období, ve kterém byla částka transakce připsána na účet (formát: DD.MM.YYYY)
    /// </summary>
    public DateTime paidto;
    /// <summary>
    /// Zobrazovat seznam produktů u transakce. (Y = ANO, N = NE). Pokud není vyplněno použije se parametr uložený v databázi (default N)
    /// </summary>
    public string showproduct;
    /// <summary>
    /// Zobrazovat název debetního účtu. (Y = ANO, N = NE). Pokud není vyplněno použije se parametr uložený v databázi (default N)
    /// </summary>
    public string showaccname;
    /// <summary>
    /// Zobrazovat specifický symbol platby. (Y = ANO, N = NE). Pokud není vyplněno použije se parametr uložený v databázi (default N) 
    /// </summary>
    public string showspecsymbol;
    /// <summary>
    /// Zobrazovat identifikátor platby  (Y = ANO, N = NE). Pokud není vyplněno použije se parametr uložený v databázi (default Y pro Platební systémy zakládané po 9.7.2003) 
    /// </summary>
    public string showid;
    /// <summary>
    /// Zobrazovat realizovaná inkasa (Y = ANO, N = NE, default N)
    /// </summary>
    public string cash;
    /// <summary>
    /// Nastavení v jakém formátu chcete nechat zobrazovat přehled plateb.
    /// </summary>
    public string listtype;
    /// <summary>
    /// Summary description for eBanka
    /// </summary>

    /// <summary>
    /// Metoda pro sestavení URL stringu podle nastavených atributů
    /// </summary>
    public string BuildUrl() {
      string UrlParams = GetUrl + "?";
      UrlParams += "shopname=" + shopname;
      UrlParams += "&password=" + password;
      UrlParams += "&creditaccount=" + creditaccount;
      UrlParams += "&creditbank=" + creditbank;

      if (this.amountfrom != null) { UrlParams += "&amountfrom=" + amountfrom; }
      if (this.amountto != null) { UrlParams += "&amountto=" + amountto; }
      if (this.cash != null) { UrlParams += "&cash=" + cash; }
      if (this.constsymbol != null) { UrlParams += "&constsymbol=" + constsymbol; }
      if (this.curcode != null) { UrlParams += "&curcode=" + curcode; }
      if (this.debitaccount != null) { UrlParams += "&debitaccount=" + debitaccount; }
      if (this.debitbank != null) { UrlParams += "&debitbank=" + debitbank; }
      if (this.listtype != null) { UrlParams += "&listtype=" + listtype; }
      if (this.paidfrom != DateTime.MinValue) { UrlParams += "&paidfrom=" + paidfrom.ToString(dateformat); }
      if (this.paidto != DateTime.MaxValue) { UrlParams += "&paidto=" + paidto.ToString(dateformat); }
      if (this.showaccname != null) { UrlParams += "&showaccname=" + showaccname; }
      if (this.showid != null) { UrlParams += "&showid=" + showid; }
      if (this.showproduct != null) { UrlParams += "&showproduct=" + showproduct; }
      if (this.showspecsymbol != null) { UrlParams += "&showspecsymbol=" + showspecsymbol; }
      if (this.specsymbol != null) { UrlParams += "&specsymbol=" + specsymbol; }
      if (this.validfrom != DateTime.MinValue) { UrlParams += "&validfrom=" + validfrom.ToString(dateformat); }
      if (this.validto != DateTime.MaxValue) { UrlParams += "&validto=" + validto.ToString(dateformat); }
      if (this.varsymbol != null) { UrlParams += "&varsymbol=" + varsymbol; }

      return UrlParams;

    }

    public PaymentResponse() {
      this.amountfrom = null;
      this.amountto = null;
      this.cash = null;
      this.constsymbol = null;
      this.curcode = null;
      this.debitaccount = null;
      this.debitbank = null;
      this.listtype = null;
      this.paidfrom = DateTime.MinValue;
      this.paidto = DateTime.MaxValue;
      this.showaccname = null;
      this.showid = null;
      this.showproduct = null;
      this.showspecsymbol = null;
      this.specsymbol = null;
      this.validfrom = DateTime.MinValue;
      this.validto = DateTime.MaxValue;
      this.varsymbol = null;
    }

    const int INDEX_STATUS = 13;
    const int INDEX_VARSYMBOL = 10;
    const int INDEX_DATE = 1;
    const int EBANKA_OK = 2;

    //const int TIMEINTERVAL = 30;
    //const int STATUS_EBANKAP = 2;
    //const int STATUS_EBANKAERR = 4;
    //const int STATUS_ORDERP = 3;

    /// <summary>
    /// Ověří pro všechny objednavky ve stavu "eBanka zaplaceno" starsi 30 min zda jsou proplaceny
    /// </summary>
    public static void VerifyPaid(List<int> okList, List<int> wrongList) {
      int TIMEINTERVAL = Int32.Parse(System.Configuration.ConfigurationManager.AppSettings["eBanka.Verify.TimeIntervalMinute"]);
      //Vypisy z eBanky
      PaymentResponse pr = new PaymentResponse();
      pr.listtype = "PLAIN";
      List<eBankaRadekVypisu> vypis = CreateDataArray(pr.BuildUrl());
      //"eBankaZaplaceno" objednavky
      LMComDataContext db = Machines.getContext();
      var items = from ord in db.Comm_Orders where ord.Status == (short)OrderStatus.eBankaZaplaceno select new { ord.Id, ord.StatusDate };
      foreach (var item in items) {
        foreach (eBankaRadekVypisu line in vypis)
          if (item.Id.ToString() == line.varSymbol && item.StatusDate.AddMinutes(TIMEINTERVAL) < DateTime.UtcNow.ToUniversalTime()) {
            if (line.status == EBANKA_OK)
              okList.Add(item.Id);
            else
              wrongList.Add(item.Id);
          }
      }
    }

    private static List<eBankaRadekVypisu> CreateDataArray(string url) {
      string csv = GetTargetURL(url);
      List<eBankaRadekVypisu> result = new List<eBankaRadekVypisu>();
      if (csv.Length > 0) {
        string[] lines = csv.Split('\n');
        foreach (string line in lines) {
          string[] fields = line.Split(';');
          if (fields.Length > INDEX_STATUS) {
            eBankaRadekVypisu lineItem = new eBankaRadekVypisu();
            lineItem.status = Int32.Parse(fields[INDEX_STATUS]);
            lineItem.varSymbol = fields[INDEX_VARSYMBOL];
            lineItem.platnost = fields[INDEX_DATE];
            result.Add(lineItem);
          }
        }
      }
      return result;
    }

    struct eBankaRadekVypisu {
      public string platnost;
      public int status;
      public string varSymbol;
    }

    /// <summary>
    /// Zjistí zda je objednávka zaplacena
    /// </summary>
    /// <param name="varSymbol">variabilní sysmbol faktury (číslo objednávky)</param>
    /// <returns>je zaplaceno?</returns>
    public static bool IsOrderPaid(string varSymbol) {
      if (GetPaymentStatus(varSymbol) == 2)
        return true;
      else
        return false;
    }
    /// <summary>
    /// Meoda pro načtení dat z výpisu dle variabilního symbolu
    /// </summary>
    /// <param name="varSymbol">variabilní sysmbol faktury (číslo objednávky)</param>
    /// <returns>status uvedený ve výpisu, -1 pokud dojde k chybě</returns>
    private static int GetPaymentStatus(string varSymbol) {
      int result = -1;
      PaymentResponse pr = new PaymentResponse();
      pr.varsymbol = varSymbol;
      pr.listtype = "PLAIN";
      string csv = GetTargetURL(pr.BuildUrl());
      if (csv.Length > 0) {
        string[] line = csv.Split('\n');
        string[] fields = line[0].Split(';');
        if (fields.Length > 13) {
          string status = fields[13];
          Int32.TryParse(status, out result);
        }
      }
      return result;
    }
    /// <summary>
    /// Pomocná metoda pro stažení stránky z internetu
    /// </summary>
    /// <param name="url">adresa stránky</param>
    /// <returns></returns>
    private static string GetTargetURL(string url) {
      try {
        StringBuilder sb = new StringBuilder();
        byte[] buf = new byte[8192];
        // prepare the web page we will be asking for

        HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);

        // execute the request
        using (HttpWebResponse response = (HttpWebResponse)request.GetResponse()) {

          // we will read data via the response stream
          Stream resStream = response.GetResponseStream();

          string tempString = null;
          int count = 0;

          do {
            // fill the buffer with data
            count = resStream.Read(buf, 0, buf.Length);
            // make sure we read some data
            if (count != 0) {
              // translate from bytes to ASCII text
              tempString = Encoding.ASCII.GetString(buf, 0, count);
              // continue building the string
              sb.Append(tempString);
            }
          }
          while (count > 0); // any more data to read?
        }

        // print out page source
        return sb.ToString();
      } catch (Exception /*ex*/) {
        return "";
      }
    }
  }
}