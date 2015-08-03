// Autor Miroslav Novak www.platiti.cz
// Pouzivani bez souhlasu autora neni povoleno
// $Id: PayuGate.cs,v 1.1 2011/06/01 17:04:46 master Exp $

using System;
using System.Security.Cryptography;
using System.Linq;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Text;
using System.Text.RegularExpressions;
using System.Net;

using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Configuration;


namespace Payu {

  public enum TransStatus {
    new_ = 1,
    cancelled = 2,
    rejected = 3,
    started = 4,
    awaiting_collection = 5,
    returning_funds_to_client = 7,
    finished = 99,
    contact = 888,
  }

  public class Error {
    public int code;
    public string descr;
    public static string getError (int code) {
      Error err = Errors.FirstOrDefault(e => e.code==code);
      return err==null ? "unknown error" : err.descr;
    }
    public static Error[] Errors = new Error[] {
      new Error() {code = 100, descr="chyb� parametr pos_id"},
      new Error() {code = 101, descr="chyb� parametr session_id"},
      new Error() {code = 102, descr="chyb� parametr t"},
      new Error() {code = 103, descr="chyb� parametr sig"},
      new Error() {code = 104, descr="chyb� parametr desc"},
      new Error() {code = 105, descr="chyb� parametr client_ip"},
      new Error() {code = 106, descr="chyb� parametr first_name"},
      new Error() {code = 107, descr="chyb� parametr last_name"},
      new Error() {code = 108, descr="chyb� parametr street"},
      new Error() {code = 109, descr="chyb� parametr city"},
      new Error() {code = 110, descr="chyb� parametr post_code"},
      new Error() {code = 111, descr="chyb� parametr amount"},
      new Error() {code = 112, descr="nespr�vn� ��slo bankovn�ho ��tu"},
      new Error() {code = 113, descr="chyb� parametr email"},
      new Error() {code = 114, descr="chyb� parametr tel. ��slo (phone)"},
      new Error() {code = 200, descr="jin� p�echodn� chyba"},
      new Error() {code = 201, descr="jin� p�echodn� chyba datab�ze"},
      new Error() {code = 202, descr="POS tohoto ID je blokov�n"},
      new Error() {code = 203, descr="neplatn� hodnota pay_type pro dan� pos_id"},
      new Error() {code = 204, descr="zvolen� typ platby (pay_type) je do�asn� zablokov�n pro dan� pos_id, nap�. z d�vodu servisn� odst�vky platebn� br�ny"},
      new Error() {code = 205, descr="��stka transakce je ni��� ne� minim�ln� hodnota"},
      new Error() {code = 206, descr="��stka transakce je vy��� ne� maxim�ln� hodnota"},
      new Error() {code = 207, descr="p�ekro�ena hodnota v�ech transakc� pro jednoho z�kazn�ka za posledn� obdob�"},
      new Error() {code = 209, descr="neplatn� pos_id nebo pos_auth_key"},
      new Error() {code = 210, descr="��stka transakce obsahuje nepovolen� hal��ov� polo�ky"},
      new Error() {code = 500, descr="neexistuj�c� transakce"},
      new Error() {code = 501, descr="chyb� autorizace pro tuto transakci"},
      new Error() {code = 502, descr="transakce za�ala d��ve"},
      new Error() {code = 503, descr="autorizace transakce ji� byla vykon�na"},
      new Error() {code = 504, descr="transakce byla d��ve zru�ena"},
      new Error() {code = 505, descr="transakce byla d��ve p�ijata"},
      new Error() {code = 506, descr="transakce byla vybr�na"},
      new Error() {code = 507, descr="chyba p�i p�evodu prost�edk� zp�t z�kazn�kovi"},
      new Error() {code = 599, descr="nespr�vn� status transakce, nap�. nen� mo�n� p�ijmout transakci n�kolikr�t a jin� � pros�m, kontaktujte n�s"},
      new Error() {code = 999, descr="jin� kritick� chyba � pros�m, kontaktujte n�s    }"}
    };
  }

  public class ConfigData {
    public static ConfigData Config {
      get {
        if (config == null) {
          config = new ConfigData();
          config.pos_id = int.Parse(ConfigurationManager.AppSettings["PayU.pos_id"]);
          config.pos_auth_key = ConfigurationManager.AppSettings["PayU.pos_auth_key"];
          config.url_payu = ConfigurationManager.AppSettings["PayU.url_payu"];
          config.encoding = ConfigurationManager.AppSettings["PayU.encoding"];
          config.key1 = ConfigurationManager.AppSettings["PayU.key1"];
          config.key2 = ConfigurationManager.AppSettings["PayU.key2"];
          config.log_file = @"q:\temp\pom.PayU.log";
          return config;
        }
        return config;
      }
    } static ConfigData config;

    public int pos_id;              // pos_id	- hodnota, kterou p�id�lilo PayU
    public string pos_auth_key;     // pos_auth_key	- Autoriza�n� kl�� POS (pos_auth_key)
    public string url_payu;         // url_payu    - adresa URL, na kter� byla nainstalov�na aplikace PayU https://www.payu.cz/paygw/
    public string encoding;         // encoding	- K�dov�n� p�en�en�ch dat. Jedna z n�sleduj�c�ch hodnot: ISO, UTF, WIN
    public string key1;             // key1	- Kl�� (MD5)
    public string key2;             // key2	- Druh� kl�� (MD5)
    public string log_file;         // log_file	- n�zev log souboru
  }

  public class NewOrderData {
    public string session_id;     // ID platby � jedine�n� pro z�kazn�ka, hodnota p�id�lena aplikac� Obchodu p�i vytvo�en� transakce
    public int amount;     // ��stka v hal���ch
    public string desc;     // kr�tk� popis � objev� se z�kazn�kovi, na v�pisech z banky a jin�ch m�stech
    public string first_name;     // jm�no
    public string last_name;     // p��jmen�
    public string email;     // e-mailov� adresa
    // dalsi hodnoty jsou nepovinne a mohou byt null
    public string order_id;     // ��slo objedn�vky, hodnota p�id�lena aplikac� Obchodu p�i vytvo�en� transakce
    public string desc2;     // libovoln� informace
    public string street;     // ulice
    public string street_hn;     // domovn� ��slo
    public string street_an;     // ��slo bytu
    public string city;     // m�sto
    public string post_code;     // PS�
    public string country;     // k�d krajiny z�kazn�ka (2 p�smena) dle ISO-3166 http:www.chemie.fu-berlin.de/diverse/doc/ISO_3166.html
    public string phone;     // telefonn� ��slo, je mo�n� zadat n�kolik ��sel odd�len�ch ��rkami
    public string language;     // k�d jazyka dle ISO-639 http:www.ics.uci.edu/pub/ietf/http/related/iso639.txt (currently cs, en)
  }

  public class OrderReplyData {
    public int pos_id;     // hodnota, kterou p�id�lilo PayU
    public string session_id;     // ID platby � jedine�n� pro z�kazn�ka, hodnota p�id�lena aplikac� Obchodu p�i vytvo�en� transakce
    public string trans_id;     // identifik�tor nov� transakce vytvo�en� v aplikaci PayU
    public string pay_type;     // typ platby - jeden z tabulky 2.4 Typy Plateb
    public int error;     // ��slo chyby payu
    public string order_id;     // ��slo objedn�vky, hodnota p�id�lena aplikac� Obchodu p�i vytvo�en� transakce
  }

  public class GetReplyData {
    public int pos_id;     // hodnota, kterou p�id�lilo PayU
    public string session_id;     // ID platby � jedine�n� pro z�kazn�ka, hodnota p�id�lena aplikac� Obchodu p�i vytvo�en� transakce
    public int amount;     // ��stka v hal���ch
    public string desc;     // kr�tk� popis � objev� se z�kazn�kovi, na v�pisech z banky a jin�ch m�stech
    public string trans_id;     // identifik�tor nov� transakce vytvo�en� v aplikaci PayU
    public string desc2;     // libovoln� informace
    public string sig;     // kontroln� sou�et parametr� formul��e zaslan�ho platform�
    public string ts;     // �asov� zn�mka pou�it� na v�po�et hodnoty sig
    public string pay_type;     // typ platby - jeden z tabulky 2.4 Typy Plateb
    public string order_id;     // ��slo objedn�vky, hodnota p�id�lena aplikac� Obchodu p�i vytvo�en� transakce
    public int status;     // aktu�ln� stav transakce v souladu s bodem 2.2
    public string pay_gw_name;     // n�zev br�ny vykon�vaj�c� transakci � intern� informace aplikace PayU
    public DateTime? create;     // datum vytvo�en� transakce
    public DateTime? init;     // datum za��tku transakce
    public DateTime? sent;     // datum, kdy byla transakce p�ed�na na vybr�n�
    public DateTime? recv;     // datum p�ijet� transakce
    public DateTime? cancel;     // datum zru�en� transakce
    public string auth_fraud;     // intern� informace aplikace PayU
    public string add_test;     // v�dy hodnota �1�
    public string add_testid;     // id transakce
  }

  public class ConfirmCancelReplyData {
    public int pos_id;     // hodnota, kterou p�id�lilo PayU
    public string session_id;     // ID platby � jedine�n� pro z�kazn�ka, hodnota p�id�lena aplikac� Obchodu p�i vytvo�en� transakce
    public string trans_id;     // identifik�tor nov� transakce vytvo�en� v aplikaci PayU
    public string sig;     // kontroln� sou�et parametr� formul��e zaslan�ho platform�
    public string ts;     // �asov� zn�mka pou�it� na v�po�et hodnoty sig
  }


  public static class PayuGate {

    /*protected ConfigData config;
    //protected Page page;

    // konstruktor PayuGate(config)
    // vytvori objekt a nastavi konfiguraci
    // page - aktualni strana skriptu (pokud bude volano jen callGet nebo callConfirmCance muze byt null)
    // config - konfiguracni data

    public PayuGate(Page page, ConfigData config) {
      this.config = config;
      this.page = page;
    }*/


    // sendOrder(order)
    // 	presmeruje browser klienta na branu payu
    // order - parametry platby

    public static void sendOrder(NewOrderData order, HttpContext ctx) {

      string client_ip = ctx.Request.UserHostAddress;

      string url = ConfigData.Config.url_payu + ConfigData.Config.encoding + "/NewPayment";

      // create hidden autosubmit
      string form = "<form id='form' method='post' action='" + url + "'>";
      form += "<input type='hidden' name='pos_id' value='" + ConfigData.Config.pos_id + "'>";
      form += "<input type='hidden' name='pos_auth_key' value='" + ConfigData.Config.pos_auth_key + "'>";
      form += "<input type='hidden' name='client_ip' value='" + client_ip + "'>";

      form += "<input type='hidden' name='session_id' value='" + order.session_id + "'>";
      form += "<input type='hidden' name='amount' value='" + order.amount + "'>";
      form += "<input type='hidden' name='desc' value='" + order.desc + "'>";
      form += "<input type='hidden' name='first_name' value='" + order.first_name + "'>";
      form += "<input type='hidden' name='last_name' value='" + order.last_name + "'>";
      form += "<input type='hidden' name='email' value='" + order.email + "'>";
      form += "<input type='hidden' name='desc2' value='" + order.desc2 + "'>";
      form += "<input type='hidden' name='street' value='" + order.street + "'>";
      form += "<input type='hidden' name='street_hn' value='" + order.street_hn + "'>";
      form += "<input type='hidden' name='street_an' value='" + order.street_an + "'>";
      form += "<input type='hidden' name='city' value='" + order.city + "'>";
      form += "<input type='hidden' name='post_code' value='" + order.post_code + "'>";
      form += "<input type='hidden' name='country' value='" + order.country + "'>";
      form += "<input type='hidden' name='phone' value='" + order.phone + "'>";
      form += "<input type='hidden' name='language' value='" + order.language + "'>";
      form += "<input type='hidden' name='order_id' value='" + order.order_id + "'>";

      form += "<input type='hidden' name='js' value='0'>";
      form += "<noscript>Klikn�te pros�m na tla��tko / Please click the button<br/><input type='submit' value='Pokracovat / Continue'></noscript>";
      form += "</form>";
      form += "<script>document.getElementById(\"form\").js.value=1; document.getElementById(\"form\").submit();</script>";

      writeLog("gateRedirect " + form);

      ctx.Response.Clear();
      ctx.Response.Write("<html><body>" + form + "</body></html>");
      ctx.Response.Flush();
      ctx.Response.End();

    }



    // receiveReply(replyData)
    // pro zavolani z positive/negative scriptu
    //				spravny format positive i negative scriptu: http[s]://server/script?trans_id=%transId%&pos_id=%posId%&pay_type=%payType%&session_id=%sessionId%&amount_ps=%amountPS%&amount_cs=%amountCS%&order_id=%orderId%&error=%error%
    // zpracuje predane hodnoty a vrati je
    // replyData - navratove asociativni pole s parametry platby
    // navratova hodnota
    //		0	- ok
    //		-1	- neodpovida pos_id
    //		-3	- chybejici parametry - pravdepodobne spatny format placeholderu url pro positive a negative
    //		kladna hodnota	- cislo chyby payu

    public static int receiveReply(out OrderReplyData replyData, HttpContext ctx) {

      writeLog("gateReply " + ctx.Request.QueryString);


      int result;
      NameValueCollection get = ctx.Request.QueryString;

      if (get["trans_id"] == null || get["pos_id"] == null || get["session_id"] == null || get["pay_type"] == null || get["error"] == null || get["order_id"] == null) {
        result = -3; // chybejici parametry
      }

      if (get["error"] != null && get["error"] != "%error%") {
        result = int.Parse(get["error"]);
      } else {
        result = 0;
      }

      replyData = new OrderReplyData();
      int.TryParse(get["pos_id"], out replyData.pos_id);
      //replyData.pos_id = int.Parse(get["pos_id"]);
      replyData.session_id = get["session_id"];
      replyData.trans_id = get["trans_id"];
      replyData.pay_type = get["pay_type"];
      replyData.order_id = get["order_id"];
      replyData.error = result;


      if (replyData.pos_id != ConfigData.Config.pos_id) {
        result = -1; // neodpovida pos_id
      }

      return result;
    }

    // receiveNotificationAndGet(trans_data)
    // pro zavolani z online scriptu. 
    // zpracuje predane hodnoty, overi jejich podpis, dale zavola proceduru Get a vrati jeji vysledek
    // Po zavolani teto funkce je potreba zavola funkci closeNotification
    //
    // trans_data	- vracene udaje o transakci z callGet
    // navratova hodnota
    //		0	- ok
    //		-1	- neplatne pos_id
    //		-2	- chybny podpis
    //		-3	- chybejici parametry - spatne formatovany online dotaz brany

    public static int receiveNotificationAndGet(out GetReplyData trans_data, out string session_id, HttpContext ctx) {

      int result = receiveNotification(out session_id, ctx);
      int getResult = result;
      if (result == 0) {
        getResult = callGet(session_id, out trans_data, ctx);
      } else {
        trans_data = null;
      }
      return getResult;
    }


    // closeNotification(precessResult)
    // odpovi v ramci "online" skriptu, pokud je parametr "OK" brana povazuje notifikaci za zpracovanou, jinak bude volani "online" skriptu opakovat
    public static void closeNotification(string processResult, HttpContext ctx) {
      writeLog("closeNotification " + (processResult != "OK" ? "Error: " : "") + processResult);
      ctx.Response.Write(processResult);
    }


    // receiveNotification(session_id)
    // pro zavolani z online scriptu. 
    // zpracuje predane hodnoty, overi jejich podpis, a vrati je
    // S vyslednym session_id je po te vhodne zavolat funkci callGet pro zjisteni stavu platby.
    // nasledne vypsat prace text "OK", je-li zpracovani uspesne. Jinak payu bude tuto notifikaci opakovat.
    //
    // session_id	- vracena hodnota identifikace platby
    // navratova hodnota
    //		0	- ok
    //		-1	- neplatne pos_id
    //		-2	- chybny podpis
    //		-3	- chybejici parametry - spatne formatovany online dotaz brany

    public static int receiveNotification(out string session_id, HttpContext ctx) {
      int result;
      NameValueCollection post = ctx.Request.Form;

      session_id = "";
      if (post["pos_id"] == null || post["session_id"] == null || post["ts"] == null || post["sig"] == null) {
        result = -3; // chybejici parametry
      } else if (int.Parse(post["pos_id"]) != ConfigData.Config.pos_id) {
        result = -1;  // neodpovida pos_id
      } else {
        string strToHash = post["pos_id"] + post["session_id"] + post["ts"] + ConfigData.Config.key2;
        if (post["sig"] != md5(strToHash)) {
          result = -2;   //--- chybn� podpis (signature)
        } else {
          session_id = post["session_id"];
          result = 0;
        }
      }
      writeLog("receiveNotification recv result=" + result + "  data: " + post);
      return result;
    }


    // callGet(session_id, trans_data)
    // vyvola payu proceduru Payment/get pro zjisteni stavu transakce
    // session_id	- identifikace platby
    // trans_data - navratove asociativni pole s parametry platby
    // navratova hodnota
    //		0	- ok
    //		-2	- neplatny podpis
    //		kladna hodnota	- cislo chyby payu

    public static int callGet(string session_id, out GetReplyData trans_data, HttpContext ctx) {
      int ts = time();

      string strToHash = ConfigData.Config.pos_id.ToString() + session_id.ToString() + ts.ToString() + ConfigData.Config.key1;
      string sig = md5(strToHash);
      string parameters = "pos_id=" + ConfigData.Config.pos_id + "&session_id=" + session_id + "&ts=" + ts + "&sig=" + sig;
      string url = ConfigData.Config.url_payu + ConfigData.Config.encoding + "/Payment/get";

      writeLog("callGet send " + url + ", " + parameters);

      string payu_response = loadUrlText(url, Encoding.ASCII, parameters);

      //writeLog("callGet recv raw " + payu_response);

      string status_zprac = Grep(payu_response, "<status>(.*?)</status>");

      int result;

      if (status_zprac != "OK") {
        payu_response = Grep(payu_response, "<error>(.*?)</error>");
        result = int.Parse(Grep(payu_response, "<nr>(.*?)</nr>"));
        trans_data = null;
      } else {
        payu_response = Grep(payu_response, "<trans>(.*?)</trans>");
        trans_data = new GetReplyData();
        trans_data.trans_id = Grep(payu_response, "<id>(.*?)</id>");
        trans_data.pos_id = int.Parse(Grep(payu_response, "<pos_id>(.*?)</pos_id>"));
        trans_data.session_id = Grep(payu_response, "<session_id>(.*?)</session_id>");
        trans_data.order_id = Grep(payu_response, "<order_id>(.*?)</order_id>");
        trans_data.amount = int.Parse(Grep(payu_response, "<amount>(.*?)</amount>"));
        trans_data.status = int.Parse(Grep(payu_response, "<status>(.*?)</status>"));
        trans_data.pay_type = Grep(payu_response, "<pay_type>(.*?)</pay_type>");
        trans_data.pay_gw_name = Grep(payu_response, "<pay_gw_name>(.*?)</pay_gw_name>");
        trans_data.desc = Grep(payu_response, "<desc>(.*?)</desc>");
        trans_data.desc2 = Grep(payu_response, "<desc2>(.*?)</desc2>");
        trans_data.create = parseDateTime(Grep(payu_response, "<create>(.*?)</create>"));
        trans_data.init = parseDateTime(Grep(payu_response, "<init>(.*?)</init>"));
        trans_data.sent = parseDateTime(Grep(payu_response, "<sent>(.*?)</sent>"));
        trans_data.recv = parseDateTime(Grep(payu_response, "<recv>(.*?)</recv>"));
        trans_data.cancel = parseDateTime(Grep(payu_response, "<cancel>(.*?)</cancel>"));
        trans_data.auth_fraud = Grep(payu_response, "<auth_fraud>(.*?)</auth_fraud>");
        trans_data.ts = Grep(payu_response, "<ts>(.*?)</ts>");
        trans_data.sig = Grep(payu_response, "<sig>(.*?)</sig>");
        trans_data.add_test = Grep(payu_response, "<add_test>(.*?)</add_test>");
        trans_data.add_testid = Grep(payu_response, "<add_testid>(.*?)</add_testid>");

        strToHash = trans_data.pos_id.ToString() + trans_data.session_id.ToString() + trans_data.order_id.ToString() + trans_data.status.ToString() + trans_data.amount.ToString() + trans_data.desc.ToString() + trans_data.ts.ToString() + ConfigData.Config.key2.ToString();
        sig = md5(strToHash);
        if (sig == trans_data.sig) {
          result = 0;
        } else {
          result = -2;  //neplatny podpis
        }

      }
      writeLog("callGet recv result=" + result + " data " + var_dump(trans_data));
      return result;

    }
    // callConfirmCancel(confirm_cancel, session_id, trans_data)
    // vyvola payu proceduru Payment/confirm nebo Payment/cancel
    // $confirm_cancel - rozliseni metody "confirm" nebo "cancel"
    // $session_id	- identifikace platby
    // $trans_data - navratove asociativni pole s parametry platby - prakticky neuzitecne
    //		trans_id	- identifik�tor nov� transakce vytvo�en� v aplikaci PayU
    //		pos_id	- hodnota, kterou p�id�lilo PayU
    //		session_id	- ID platby � jedine�n� pro z�kazn�ka, hodnota p�id�lena aplikac� Obchodu p�i vytvo�en� transakce
    //		ts	- �asov� zn�mka pou�it� na v�po�et hodnoty sig
    //		sig	- kontroln� sou�et parametr� formul��e zaslan�ho platform�
    // navratova hodnota
    //		0	- ok
    //		-2	- neplatny podpis
    //		kladna hodnota	- cislo chyby payu

    public static int callConfirmCancel(string confirm_cancel, string session_id, out ConfirmCancelReplyData trans_data) {
      if (confirm_cancel != "confirm" && confirm_cancel != "cancel") {
        throw new Exception("Neplatny parametr confirm_cancel: " + confirm_cancel);
      }
      int ts = time();

      string strToHash = ConfigData.Config.pos_id.ToString() + session_id.ToString() + ts.ToString() + ConfigData.Config.key1;
      string sig = md5(strToHash);
      string parameters = "pos_id=" + ConfigData.Config.pos_id + "&session_id=" + session_id + "&ts=" + ts + "&sig=" + sig;
      string url = ConfigData.Config.url_payu + ConfigData.Config.encoding + "/Payment/" + confirm_cancel;

      writeLog("callConfirmCancel " + confirm_cancel + " send " + url + ", " + parameters);

      string payu_response = loadUrlText(url, Encoding.ASCII, parameters);

      //writeLog("callConfirmCancel recv raw " + payu_response);

      string status_zprac = Grep(payu_response, "<status>(.*?)</status>");

      int result;

      if (status_zprac != "OK") {
        payu_response = Grep(payu_response, "<error>(.*?)</error>");
        result = int.Parse(Grep(payu_response, "<nr>(.*?)</nr>"));
        trans_data = null;
      } else {
        payu_response = Grep(payu_response, "<trans>(.*?)</trans>");
        trans_data = new ConfirmCancelReplyData();
        trans_data.trans_id = Grep(payu_response, "<id>(.*?)</id>");
        trans_data.pos_id = int.Parse(Grep(payu_response, "<pos_id>(.*?)</pos_id>"));
        trans_data.session_id = Grep(payu_response, "<session_id>(.*?)</session_id>");

        trans_data.ts = Grep(payu_response, "<ts>(.*?)</ts>");
        trans_data.sig = Grep(payu_response, "<sig>(.*?)</sig>");

        strToHash = trans_data.pos_id.ToString() + trans_data.session_id.ToString() + trans_data.ts.ToString() + ConfigData.Config.key2.ToString();
        sig = md5(strToHash);
        if (sig == trans_data.sig) {
          result = 0;
        } else {
          result = -2;  //neplatny podpis
        }

      }
      writeLog("callConfirmCancel recv result=" + result + " data " + var_dump(trans_data));
      return result;

    }


    ////////////////////////////////////////////////////// vnitrni funkce



    public static void writeLog(string s) {
      if (string.IsNullOrEmpty(ConfigData.Config.log_file)) return;
      s = s.Replace("\n", " ").Replace("\r", "");
      string line = "*** " + DateTime.UtcNow.ToString() + "  " + s + Environment.NewLine;
      try {
        System.IO.File.AppendAllText(ConfigData.Config.log_file, line);
      } catch { }
    }


    static string Grep(string text, string pattern) {
      Regex repattern = new Regex(pattern, RegexOptions.Singleline);
      Match match = repattern.Match(text);
      if (match.Success) {
        return match.Groups[1].Value;
      } else {
        return null;
      }
    }

    public static string loadUrlText(string url, Encoding encoding, string postData) {

      /*
      // Rychle reseni pokud webserver nezna certifikacni autoritu, kterou pouziva PayU
      // Nefunguje vsak na vetsine hostingu, ale tam lze ocekavat ze certifikaty budou v poradku
			
            //Change SSL checks so that all checks pass
            ServicePointManager.ServerCertificateValidationCallback =
                new System.Net.Security.RemoteCertificateValidationCallback(
                    delegate { return true; }
                );
      */

      string reply;
      using (WebClient client = new WebClient()) {
        client.Encoding = encoding;
        client.Headers.Add("user-agent", "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.2; .NET CLR 1.0.3705;)");
        if (postData != null) {
          client.Headers["Content-Type"] = "application/x-www-form-urlencoded; charset=" + encoding.WebName;
          reply = client.UploadString(url, postData);
        } else {
          reply = client.DownloadString(url);
        }
      }
      return reply;
    }

    static string md5(string s) {
      MD5 md5 = MD5.Create();
      byte[] hashBytes = md5.ComputeHash(Encoding.ASCII.GetBytes(s));
      string hash = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
      return hash;
    }

    static int time() {
      return (int)(DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalSeconds;
    }


    static DateTime? parseDateTime(string s) {
      if (s == "") {
        return null;
      } else {
        DateTime d = DateTime.ParseExact(s, "yyyy-MM-dd HH:mm:ss", null);
        return d;
      }
    }


    // pro pouziti jen v ukazkove aplikaci
    public static string var_dump(object info) {
      StringBuilder sb = new StringBuilder();

      if (info == null) return "null";

      Type t = info.GetType();
      System.Reflection.FieldInfo[] props = t.GetFields();
      foreach (System.Reflection.FieldInfo prop in props) {
        sb.AppendFormat(prop.Name + "\t= " + (prop.GetValue(info) != null ? "'" + prop.GetValue(info).ToString() + "'" : "null") + ",\n");
      }

      return sb.ToString();
    }

  }


}