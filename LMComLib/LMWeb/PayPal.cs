using System;
using System.Configuration;
using System.Linq;
using System.Globalization;
using System.Web.UI;
using LMComLib;
using LMNetLib;
using System.Collections.Specialized;
using System.Web;
using System.Net;
using System.Text;
using System.IO;
using System.Web.UI.WebControls;

namespace LMWeb {

  //https://developer.paypal.com/
  //jan.vales@webtica.com,asdfghjkl
  //seler: Seller_1187957985_biz@webtica.com,asdfghjkl
  //me: pzika@langmaster.cz,12345678
  //https://cms.paypal.com/us/cgi-bin/?cmd=_render-content&content_ID=developer/library_documentation

  public static class PayPalLow {

    static string testingMode = ConfigurationManager.AppSettings["PayPalNew.TestingMode"];
    //static bool isTesting = string.IsNullOrEmpty(testingMode) ? Machines.isPZComp() : testingMode == "yes";
    static bool isTesting = string.IsNullOrEmpty(testingMode) ? Machines.isDebugDatabase : testingMode == "yes";

    public static string host(bool? isSandBox) { return ConfigurationManager.AppSettings["PayPalNew.Host" + (isSandBox??isTesting ? ".localhost" : null)]; }
    public static string img(bool? isSandBox) { return ConfigurationManager.AppSettings["PayPalNew.Img" + (isSandBox ?? isTesting ? ".localhost" : null)]; }
    public static string business(bool? isSandBox) { return ConfigurationManager.AppSettings["PayPalNew.Business" + (isSandBox ?? isTesting ? ".localhost" : null)]; }
    public static string notifyUrl(bool? isSandBox) { return ConfigurationManager.AppSettings["PayPalNew.NotifyUrl" + (isSandBox ?? isTesting ? ".localhost" : null)]; }
    public static string notifyUrlCz(bool? isSandBox) { return ConfigurationManager.AppSettings["PayPalNew.NotifyUrlCz" + (isSandBox ?? isTesting ? ".localhost" : null)]; }

    public static double Eur2Kc = double.Parse(ConfigurationManager.AppSettings["Fact.Eur2Kc"] ?? "0", CultureInfo.InvariantCulture);
    public static double Usd2Kc = double.Parse(ConfigurationManager.AppSettings["Fact.Usd2Kc"] ?? "0", CultureInfo.InvariantCulture);
    public static double Pln2Kc = double.Parse(ConfigurationManager.AppSettings["Fact.Pln2Kc"] ?? "0", CultureInfo.InvariantCulture);
    public static double Rub2Kc = double.Parse(ConfigurationManager.AppSettings["Fact.Rub2Kc"] ?? "0", CultureInfo.InvariantCulture);
    public static double Try2Kc = double.Parse(ConfigurationManager.AppSettings["Fact.Try2Kc"] ?? "0", CultureInfo.InvariantCulture);
    public static double Vnd2Kc = double.Parse(ConfigurationManager.AppSettings["Fact.Vnd2Kc"] ?? "0", CultureInfo.InvariantCulture);
    public static double Ltl2Kc = double.Parse(ConfigurationManager.AppSettings["Fact.Ltl2Kc"] ?? "0", CultureInfo.InvariantCulture);
    public static double Cny2Kc = double.Parse(ConfigurationManager.AppSettings["Fact.Cny2Kc"] ?? "0", CultureInfo.InvariantCulture);

    public static CultureInfo en_gb = new CultureInfo("en-us");

    public static double CurrExchange2Kc(CurrencyType from) {
      switch (from) {
        case CurrencyType.eur: return Eur2Kc;
        case CurrencyType.usd: return Usd2Kc;
        case CurrencyType.pln: return Pln2Kc;
        case CurrencyType.rub: return Rub2Kc;
        case CurrencyType.Try: return Try2Kc;
        case CurrencyType.vnd: return Vnd2Kc;
        case CurrencyType.ltl: return Ltl2Kc;
        case CurrencyType.cny: return Cny2Kc;
        case CurrencyType.czk:
        case CurrencyType.csk: return 1.0;
        default: throw new Exception("Missing code here");
      }
    }

    public static double CurrExchange(CurrencyType from, CurrencyType to, double value) {
      return value * CurrExchange2Kc(from) / CurrExchange2Kc(to);
    }

    public static CurrencyType CurrencyFromText(string currTxt) {
      CurrencyType res = LowUtils.EnumParse<CurrencyType>(currTxt);
      return res == CurrencyType.czk ? CurrencyType.csk : res;
    }

    public static bool EqCurrency(CurrencyType curr1, CurrencyType curr2) {
      if (curr1 == CurrencyType.csk) curr1 = CurrencyType.czk;
      if (curr2 == CurrencyType.csk) curr2 = CurrencyType.czk;
      return curr1 == curr2;
    }

    public static string CurrencyText(CurrencyType curr) {
      switch (curr) {
        case CurrencyType.csk:
        case CurrencyType.czk:
          return "CZK";
        case CurrencyType.eur: return "EUR";
        case CurrencyType.usd: return "USD";
        case CurrencyType.pln: return "PLN";
        case CurrencyType.vnd: return "VND";
        case CurrencyType.rub: return "RUB";
        case CurrencyType.ltl: return "LTL";
        case CurrencyType.Try: return "TRY";
        case CurrencyType.cny: return "CNY";
        default: throw new NotImplementedException();
      }
    }

    public static double parsePayPalCurrency(string curr) {
      double res;
      if (!double.TryParse(curr, NumberStyles.Any, new CultureInfo("en-us"), out res)) res = 0;
      return res;
    }

    public static string EncodeCustom(Domains site, SubDomains subSite, CourseIds course, Langs lng, double price, CurrencyType curr, Int64 userId, string userEMail, string licenceKey, ET_SiteMapId productType) {
      using (MemoryStream ms = new MemoryStream()) using (BinaryWriter wr = new BinaryWriter(ms)) {
        wr.Write((byte)site);
        wr.Write((byte)subSite);
        wr.Write((UInt16)course);
        wr.Write((byte)lng);
        wr.Write(price);
        wr.Write((byte)curr);
        wr.Write(userId);
        wr.WriteStringEx(userEMail);
        //wr.WriteStringEx(productDownloadUrl);
        wr.WriteStringEx(licenceKey);
        wr.Write((byte)productType);
        string cust = Convert.ToBase64String(ms.ToArray());
        //DebugEncode(cust);
        return cust;
      }
    }

    public static void DebugEncode(string code) {
      Domains site; SubDomains subSite; CourseIds course; Langs lng; double price; CurrencyType curr; Int64 userId; string userEMail; string licenceKey; ET_SiteMapId productType;
      LMWeb.PayPalLow.DecodeCustom(code, out site, out subSite, out course, out lng, out price, out curr, out userId, out userEMail, out licenceKey, out productType);
      if (site == Domains.no) return;
    }

    public static void DecodeCustom(string code, out Domains site, out SubDomains subSite, out CourseIds course, out Langs lng, out double price, out CurrencyType curr, out Int64 userId,
      out string userEMail, out string licenceKey, out ET_SiteMapId productType) {
      //try {
      using (MemoryStream ms = new MemoryStream(Convert.FromBase64String(code))) using (BinaryReader rdr = new BinaryReader(ms)) {
        site = (Domains)rdr.ReadByte();
        subSite = (SubDomains)rdr.ReadByte();
        course = (CourseIds)rdr.ReadUInt16();
        lng = (Langs)rdr.ReadByte();
        price = rdr.ReadDouble();
        curr = (CurrencyType)rdr.ReadByte(); ;
        userId = rdr.ReadInt64();
        userEMail = rdr.ReadStringEx();
        //productDownloadUrl = rdr.ReadStringEx();
        licenceKey = rdr.ReadStringEx();
        productType = (ET_SiteMapId)rdr.ReadByte();
      }
      /*} catch  {
        site = Domains.no;
        course = CourseIds.no;
        lng = Langs.no;
        price = 0.0;
        curr = CurrencyType.no;
        userId = 0;
        userEMail = null;
        productDownloadUrl = null;
        licenceKey = null;
        productType = ET_SiteMapId.old;
      }*/
    }

    const string html = @"
<form action=""{5}"" target=""_blank"" method=""post"">
<input type=""hidden"" name=""cmd"" value=""_xclick"">
<input type=""hidden"" name=""charset"" value=""utf-8"">
<input type=""hidden"" name=""business"" value=""{7}"">
<input type=""hidden"" name=""lc"" value=""US"">
<input type=""hidden"" name=""item_name"" value=""{1}"">
<input type=""hidden"" name=""item_number"" value=""{0}"">
<input type=""hidden"" name=""amount"" value=""{2}"">
<input type=""hidden"" name=""invoice"" value=""{8}"">
<input type=""hidden"" name=""custom"" value=""{9}"">
<input type=""hidden"" name=""currency_code"" value=""{3}"">
<input type=""hidden"" name=""button_subtype"" value=""services"">
<input type=""hidden"" name=""tax_rate"" value=""0.000"">
<input type=""hidden"" name=""shipping"" value=""0.00"">
<input type=""hidden"" name=""bn"" value=""PP-BuyNowBF:btn_buynowCC_LG.gif:NonHosted"">
<input type=""hidden"" name=""notify_url"" value=""{4}"">
<input type=""hidden"" name=""return"" value=""{10}"">
<input type=""hidden"" name=""no_shipping"" value=""1"">
<input type=""image"" src=""{6}/WEBSCR-640-20110401-1/en_US/i/btn/btn_buynowCC_LG.gif"" border=""0"" name=""submit"" alt=""PayPal - The safer, easier way to pay online!"">
<img alt="""" border=""0"" src=""{6}/WEBSCR-640-20110401-1/en_US/i/scr/pixel.gif"" width=""1"" height=""1"">
</form>
";
    public const string q_ReturnUrl = "url";
    public const string q_ProductId = "paypalProductId";

    const string url =
"{5}?cmd=_xclick&no_shipping=1&charset=utf-8&business={7}&lc=US&item_name={1}&item_number={0}&amount={2}&invoice={8}&custom={9}&currency_code={3}&tax_rate=0.000&shipping=0.00&notify_url={4}&return={10}";

    public static string Generate(bool? isSandbox, string notify_url, bool isUrl, string Title, double Price, CurrencyType Currency, Int64 UserId, string UserEMail, CourseIds CourseId, Langs Lang,
        Domains Site, SubDomains subSite, string returnUrl, string licenceKey, string productId, ET_SiteMapId productType, /*string productDownloadUrl,*/ string origUrl, string orderId) {
      string mask = isUrl ? url : html;
      string custom = PayPalLow.EncodeCustom(Site, subSite, CourseId, Lang, Price, Currency, UserId, UserEMail, /*productDownloadUrl,*/ licenceKey, productType);
      string retUrl = returnUrl + "?" + q_ReturnUrl + "=" + HttpUtility.UrlEncode(origUrl) + "&" + q_ProductId + "=" + productId.ToString();
      return string.Format(mask,
        productId, //0
        HttpUtility.UrlEncode(Title), //1
        Price.ToString("F2", PayPalLow.en_gb), //2
        PayPalLow.CurrencyText(Currency), //3
        isUrl ? HttpUtility.UrlEncode(notify_url) : notify_url, //4
        PayPalLow.host(isSandbox), //5
        PayPalLow.img(isSandbox), //6
        PayPalLow.business(isSandbox), //7
        orderId, //8
        isUrl ? HttpUtility.UrlEncode(custom) : custom, //9
        isUrl ? HttpUtility.UrlEncode(retUrl) : retUrl //10
        );
    }

  }

  public class Ipn {
    public Ipn() { }
    public Ipn(NameValueCollection col) {
      string str = null;
      try { PayPalLow.DecodeCustom(str = col["custom"], out site, out subSite, out crs, out lng, out origPrice, out origCurrency, out userId, out userEMail, /*out productDownloadUrl,*/ out licKey, out productType); } catch (Exception exp) { error = "1:" + exp.Message + "; par=" + str; return; }
      try { invoice = Guid.Parse(str = col["invoice"]); } catch (Exception exp) { invoice = Guid.Empty; error = "2:" + exp.Message + "; par=" + str; }
      try { productId = col["item_number"]; } catch (Exception exp) { productId = null; error = "3:" + exp.Message + "; par=" + str; }
      try { title = col["item_name"]; } catch (Exception exp) { title = null; error = "4:" + exp.Message + "; par=" + str; }
      try {
        payment_status = col["payment_status"];
        payed = payment_status == "Completed";
        if (payment_status == "Pending")
          payment_status = payment_status + "_" + col["pending_reason"];
      } catch (Exception exp) { error = "5:" + exp.Message + "; par=" + str; }
      try { business = str = col["business"]; } catch (Exception exp) { business = "error"; error = "6:" + exp.Message + "; par=" + str; }
      try { receiver_email = str = col["receiver_email"]; } catch (Exception exp) { receiver_email = "error"; error = "7:" + exp.Message + "; par=" + str; }
      try { payer_email = str = col["payer_email"]; } catch (Exception exp) { payer_email = "error"; error = "8:" + exp.Message + "; par=" + str; }
      try { test_ipn = (str = col["test_ipn"]) == "1"; } catch (Exception exp) { test_ipn = false; error = "9:" + exp.Message + "; par=" + str; }
      try { txn_id = str = col["txn_id"]; } catch (Exception exp) { txn_id = "error"; error = "10:" + exp.Message + "; par=" + str; }
      try { mc_currency = PayPalLow.CurrencyFromText(str = col["mc_currency"]); } catch (Exception exp) { mc_currency = CurrencyType.no; error = "11:" + exp.Message + "; par=" + str; }
      try { mc_gross = PayPalLow.parsePayPalCurrency(str = col["mc_gross"]); } catch (Exception exp) { mc_gross = -1.0; error = "12:" + exp.Message + "; par=" + str; }
      try { mc_fee = PayPalLow.parsePayPalCurrency(str = col["mc_fee"]); } catch (Exception exp) { mc_fee = -1.0; error = "13:" + exp.Message + "; par=" + str; }
      try { name = col["first_name"] + " " + col["last_name"]; } catch (Exception exp) { name = null; error = "14:" + exp.Message; }
      try { address1 = col["zip"] + " " + col["address1"] + " " + col["address2"]; } catch (Exception exp) { address1 = null; error = "15:" + exp.Message; }
      try { address2 = col["city"] + " " + col["state"]; } catch (Exception exp) { address2 = null; error = "16:" + exp.Message; }
      try { raw = col.AllKeys.Select(k => k + "=" + col[k]).Aggregate((r, i) => r + ";" + i); } catch (Exception exp) { raw = "error"; error = "17:" + exp.Message; }
    }
    public Int64 userId;
    public string userEMail;
    public Domains site;
    public SubDomains subSite;
    public CourseIds crs;
    public string productId;
    //public string productDownloadUrl;
    public ET_SiteMapId productType;
    public string licKey;
    public Guid invoice;
    public Langs lng;
    public string payment_status;
    public string title;
    public bool payed;
    public string business;
    public string receiver_email;
    public string payer_email;
    public string name;
    public string address1;
    public string address2;
    public bool test_ipn; //jedna se o testovaci nebo ostrou platbu?
    public string txn_id; //id transakce
    public CurrencyType mc_currency; //mena objednavky
    public double mc_gross; //castka
    public double mc_fee; //poplatek PayPalu
    public double origPrice;
    public CurrencyType origCurrency;
    public string raw;
    public string error;
    public string isOK() {
      if (!payed) return "not payed";
      if (!PayPalLow.EqCurrency(origCurrency, mc_currency)) return "wrong currency " + origCurrency.ToString();
      if (mc_gross < origPrice) return "wrong amount " + origPrice.ToString();
      return null;
    }
  }

  public static class PayPal {

    public static void OnIPNRequest(HttpRequest req, Action<Ipn, Exception> completed) {
      Ipn ipn = null;
      try {
        string ver = Verify(req);
        if (ver != "VERIFIED") { if (completed != null) completed(ipn, new WebException("_notify-validate!=VERIFIED: " + ver, WebExceptionStatus.Pending)); return; }
        ipn = new Ipn(req.Form);
        if (completed != null) completed(ipn, null);
      } catch (Exception exp) {
        if (completed != null) completed(ipn, exp);
      }
    }

    static string Verify(HttpRequest currentReq) {
      //Obsah aktualniho requestu, obohaceneho o _notify-validate
      byte[] param = currentReq.BinaryRead(currentReq.ContentLength);
      string RawData = Encoding.ASCII.GetString(param);
      RawData += "&cmd=_notify-validate";

      //Posli na PayPalServer a zjisti navratovou hodnotu
      HttpWebRequest req = (HttpWebRequest)WebRequest.Create(new Uri(PayPalLow.host(null)));
      req.Method = "POST";
      req.ContentType = "application/x-www-form-urlencoded";
      req.ContentLength = RawData.Length;

      using (StreamWriter streamOut = new StreamWriter(req.GetRequestStream(), System.Text.Encoding.ASCII)) streamOut.Write(RawData);
      using (StreamReader streamIn = new StreamReader(req.GetResponse().GetResponseStream())) return streamIn.ReadToEnd();
    }
  }

  public class BuyNowButton : HyperLink {
    //public class BuyNowButton : ImageButton {

    public Func<string> OnGetRedirectUrl;

    //protected override void OnClick(ImageClickEventArgs e) {
    //base.OnClick(e);
    //if (OnGetRedirectUrl != null) Page.Response.Redirect(OnGetRedirectUrl());
    //}

    public void Finish() {
      if (OnGetRedirectUrl != null) this.NavigateUrl = OnGetRedirectUrl();
    }
  }
}
