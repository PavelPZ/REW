using System;
using System.Collections.Generic;
using System.Text;
using System.Web;
using System.Web.Hosting;
using System.Diagnostics;
using System.IO;
//using System.Data.Linq;
//using System.Data.Linq.Mapping;
using System.Linq;
using System.Xml.Linq;

using LMNetLib;
//using HtmlAgilityPack;
using System.Configuration;

namespace LMComLib {

  [Flags]
  public enum MailTypes {
    ConfirmRegistration = 0x1,
    LostPassword = 0x2,
    oa_OrderAccepted = 0x4,
    oa_Dobirka = 0x8,
    oa_Faktura = 0x10,
    oa_Proforma = 0x20,
    OrderAccepted_Dobirka = oa_OrderAccepted | oa_Dobirka,
    OrderAccepted_Faktura = oa_OrderAccepted | oa_Faktura,
    OrderAccepted_Proforma = oa_OrderAccepted | oa_Proforma,
    OrderAccepted_ComFaktura = oa_OrderAccepted | oa_ComFaktura,
    sd_SendLicenceKey = 0x40,
    sd_Date = 0x80,
    sd_Reg = 0x100,
    sd_FixStartDate = 0x200,
    sd_Download = 0x400,
    sd_MultiDate = 0x800,
    sd_MultiPrice = 0x1000,
    sd_Poslechy = 0x2000,
    SendLicenceKey_Date = sd_SendLicenceKey | sd_Date,
    SendLicenceKey_Date_Reg = sd_SendLicenceKey | sd_Date | sd_Reg,
    SendLicenceKey_FixStartDate = sd_SendLicenceKey | sd_FixStartDate,
    SendLicenceKey_FixStartDate_Reg = sd_SendLicenceKey | sd_FixStartDate | sd_Reg,
    SendLicenceKey_MultiDate = sd_SendLicenceKey | sd_MultiDate,
    SendLicenceKey_MultiPrice = sd_SendLicenceKey | sd_MultiPrice,
    SendLicenceKey_Download = sd_SendLicenceKey | sd_Download,
    SendLicenceKey_Poslechy = sd_SendLicenceKey | sd_Poslechy,
    SendDiscount = 0x4000,
    oa_ComFaktura = 0x8000,
  }

  public class SiteLang {
    static MailTypes[] cs_sz = new MailTypes[] { 
      MailTypes.ConfirmRegistration, MailTypes.LostPassword, MailTypes.OrderAccepted_Dobirka, MailTypes.OrderAccepted_Faktura, MailTypes.OrderAccepted_Proforma,
      MailTypes.SendLicenceKey_Download, MailTypes.SendLicenceKey_Poslechy, MailTypes.SendDiscount};
    static MailTypes[] com = new MailTypes[] { 
      MailTypes.ConfirmRegistration, MailTypes.LostPassword, MailTypes.OrderAccepted_Faktura, MailTypes.OrderAccepted_ComFaktura, MailTypes.OrderAccepted_Proforma,
      MailTypes.SendLicenceKey_Download, MailTypes.SendLicenceKey_Poslechy, MailTypes.SendDiscount};
    public SiteLang(Domains site, Langs lang, MailTypes[] types) {
      Site = site; Lang = lang; Types = types;
    }
    public Domains Site;
    public Langs Lang;
    public MailTypes[] Types;
    public static SiteLang[] SiteLangs = new[] {
      new SiteLang (Domains.cz, Langs.cs_cz, cs_sz),
      new SiteLang (Domains.sz, Langs.cs_cz, cs_sz)
      /*new SiteLang (Domains.com, Langs.cs_cz, com),
      new SiteLang (Domains.com, Langs.de_de, com),
      new SiteLang (Domains.com, Langs.en_gb, com),
      new SiteLang (Domains.com, Langs.sk_sk, com),
      new SiteLang (Domains.com, Langs.es_es, com),
      new SiteLang (Domains.com, Langs.vi_vn, com),
      new SiteLang (Domains.com, Langs.ru_ru, com),
      new SiteLang (Domains.com, Langs.fr_fr, com),
      new SiteLang (Domains.com, Langs.it_it, com),
      new SiteLang (Domains.com, Langs.zh_cn, com),
      new SiteLang (Domains.com, Langs.ko_kr, com),
      new SiteLang (Domains.com, Langs.lt_lt, com),
      new SiteLang (Domains.com, Langs.th_th, com),
      new SiteLang (Domains.com, Langs.zh_hk, com),*/
    }.Concat(CommonLib.smallLocalizations.Select(l => new SiteLang(Domains.com, l, com))).ToArray();
    public string query(MailTypes mt) {
      return string.Format("site={0}&lang={1}&type={2}", Site, Lang.ToString().Replace('_', '-'), mt);
    }
  }

  //public struct OrderInvoice {
  //  public Order order;
  //  public XInvoice invoice;
  //}

  //public struct SendDiscountPar {
  //  public SendDiscountPar(OrderDBContext ctx, string discount, double amount) {
  //    Discount = discount;
  //    Amount = amount;
  //    Context = ctx;
  //  }
  //  public string Discount;
  //  public double Amount;
  //  public OrderDBContext Context;
  //}

  public struct SendLicenceKeyPar {
    /*public SendLicenceKeyPar(OrderItem orderItem, RegLicenceObj regObj, string key, OrderDBContext ctx) {
      this.regObj = regObj; this.orderItem = orderItem; this.key = key;
      Context = ctx;
    }*/
    public SendLicenceKeyPar(/*CourseIds crsId,*/ bool isDownload, ET_SiteMapId productType, string key, string shortTitle, string downloadUrl, int orderId) {
      /*this.crsId = crsId;*/
      this.shortTitle = shortTitle; this.key = key; this.downloadUrl = downloadUrl; this.isDownload = isDownload; this.orderId = orderId; this.productType = productType;
    }
    //public CourseIds crsId;
    public string key;
    public string shortTitle;
    public string downloadUrl;
    public bool isDownload;
    public int orderId;
    public ET_SiteMapId productType;
    //public OrderItem orderItem;
    //public RegLicenceObj regObj;
    //public OrderDBContext Context;
    //public string key; //licencni klic
  }

  //public class MailToText {

  //  public HtmlDocument doc;

  //  public string Convert(string path) {
  //    doc = new HtmlDocument();
  //    doc.Load(path);

  //    StringWriter sw = new StringWriter();
  //    ConvertTo(doc.DocumentNode, sw);
  //    sw.Flush();
  //    return sw.ToString();
  //  }

  //  public string ConvertHtml(string html) {
  //    doc = new HtmlDocument();
  //    doc.LoadHtml(html);

  //    StringWriter sw = new StringWriter();
  //    ConvertTo(doc.DocumentNode, sw);
  //    sw.Flush();
  //    return sw.ToString();
  //  }

  //  void ConvertContentTo(HtmlNode node, TextWriter outText) {
  //    foreach (HtmlNode subnode in node.ChildNodes) {
  //      ConvertTo(subnode, outText);
  //    }
  //  }

  //  void ConvertTo(HtmlNode node, TextWriter outText) {
  //    string html;
  //    switch (node.NodeType) {
  //      case HtmlNodeType.Comment:
  //        // don't output comments
  //        break;
  //      case HtmlNodeType.Document:
  //        ConvertContentTo(node, outText);
  //        break;
  //      case HtmlNodeType.Text:
  //        // script and style must not be output
  //        string parentName = node.ParentNode.Name;
  //        if ((parentName == "script") || (parentName == "style"))
  //          break;
  //        // get text
  //        html = ((HtmlTextNode)node).Text;
  //        // is it in fact a special closing node output as text?
  //        if (HtmlNode.IsOverlappedClosingElement(html))
  //          break;
  //        html = html.Trim('\r', '\n', ' ', '\t');
  //        // check the text is meaningful and not a bunch of whitespaces
  //        if (html.Length > 0)
  //          outText.Write(HtmlEntity.DeEntitize(html));
  //        break;
  //      case HtmlNodeType.Element:
  //        switch (node.Name) {
  //          case "title":
  //            return;
  //          case "a":
  //            outText.Write(' ');
  //            if (node.Attributes != null && node.Attributes["href"] != null)
  //              outText.Write(node.Attributes["href"].Value);
  //            return;
  //        }

  //        if (node.HasChildNodes && (node.Attributes == null || node.Attributes["lmIgnore"] == null))
  //          ConvertContentTo(node, outText);

  //        switch (node.Name) {
  //          case "div":
  //          case "p":
  //            outText.Write("\r\n");
  //            outText.Write("\r\n");
  //            break;
  //          case "br":
  //            outText.Write("\r\n");
  //            break;
  //          case "h1":
  //          case "h2":
  //          case "h3":
  //            outText.Write("\r\n==================================");
  //            outText.Write("\r\n");
  //            outText.Write("\r\n");
  //            break;
  //        }
  //        break;
  //    }
  //  }
  //}


  //public static class MailSender {

  //  public const string fakeEMail = "fake@fake.fake";

  //  static MailSender() {
  //    root = XElement.Load(Machines.basicPath + @"LMCom\App_Data\emails.xml");
  //  }

  //  static XElement root;

  //  static string autorizedUrl(Domains site, SubDomains subSite, Langs lang, string url, Int64 userId) {
  //    //if (site == Domains.cz)
  //    //return "http://" + HttpContext.Current.Request.Url.Host + urlInfoLow.AppDomainAppVirtualPath + url + "?" + LMStatus.encodeAutorisedUser(userId, url);
  //    string res = urlInfo.getUrl(site, subSite, LMApps.commerce, lang.ToString().Replace('_', '-'), url, false) + "?" + LMStatus.encodeAutorisedUser(userId, url);
  //    return res;
  //  }

  //  //static string ordersUrl(Domains site) {
  //  //return site == Domains.cz ? "/cz/Commerce/cs-cz/Secured/Muj-LANGMaster/Prehled-objednavek.aspx" : "Secured/Moje-objednavky.aspx";
  //  //return "Secured/Moje-objednavky.aspx";
  //  //}
  //  const string c_ordersUrl = "Secured/Moje-objednavky.aspx";
  //  //const string c_orderListUrl = "/cz/Commerce/cs-cz/Secured/Muj-LANGMaster/Prehled-objednavek.aspx";
  //  const string c_activateProfile = "Secured/Activate.aspx";
  //  //const string c_onlineLicence = "/cz/Commerce/cs-cz/Secured/Muj-LANGMaster/Online-licence.aspx";

  //  //public static void sendMailDebug(MailTypes type, Domains site, Langs lang, string mail) {
  //  //  XElement email = root.Elements().
  //  //    //Where(m => m.Attribute("Lang").Value == (lang == Langs.sp_sp ? "es_es" : lang.ToString()) && m.Attribute("Site").Value == site.ToString() && m.Attribute("Type").Value == type.ToString()).
  //  //    Where(m => m.Attribute("Lang").Value == lang.ToString() && m.Attribute("Site").Value == site.ToString() && m.Attribute("Type").Value == type.ToString()).
  //  //    First();

  //  //  //dokonceni mailu (prilohy apod.)
  //  //  Emailer em = new Emailer();
  //  //  em.HTML = email.Element("Html").Value;
  //  //  em.PlainText = email.Element("Txt").Value;
  //  //  em.Subject = email.Attribute("Title").Value;
  //  //  string mailFrom;
  //  //  switch (site) {
  //  //    case Domains.cz: mailFrom = "obchod@langmaster.cz"; break;
  //  //    case Domains.sz: mailFrom = "seznam@langmaster.cz"; break;
  //  //    case Domains.com: mailFrom = "support@langmaster.com"; break;
  //  //    default: throw new Exception("Missing code here");
  //  //  }
  //  //  em.From = mailFrom; // System.Configuration.ConfigurationManager.AppSettings["Email.From"];
  //  //  em.AddTo(mail);
  //  //  em.SendMail();
  //  //}

  //  /*static void trace(object par, string msg) {
  //    if (par.GetType() != typeof(SendLicenceKeyPar)) return;
  //    SendLicenceKeyPar licPar = (SendLicenceKeyPar)par;
  //    new CommerceEvent(CommerceEventIds.Other, "sendMail " + msg, licPar.orderId).Raise();
  //  }*/

  //  //public static void sendMail(MailTypes type, Domains site, SubDomains subSite, Langs lang, string mail, object par) {
  //  //  int orderId = 0;
  //  //  try {
  //  //    if (Machines.debugNoInternet || mail.ToLowerInvariant() == fakeEMail) return;
  //  //    //definice parametru mailu
  //  //    Dictionary<string, string> mailPars = new Dictionary<string, string>();
  //  //    OrderDBContext ctx;
  //  //    MailTypes newType = type;
  //  //    switch (type) {
  //  //      case MailTypes.ConfirmRegistration:
  //  //        ProfileData data = (ProfileData)par;
  //  //        mailPars.Add("LinkUrl", autorizedUrl(site, subSite, lang, c_activateProfile, data.Id));
  //  //        mailPars.Add("Name", data.Email);
  //  //        mailPars.Add("Password", data.Password);
  //  //        break;
  //  //      case MailTypes.LostPassword:
  //  //        mailPars.Add("Name", mail);
  //  //        mailPars.Add("Password", (string)par);
  //  //        break;
  //  //      case MailTypes.OrderAccepted_Proforma:
  //  //        ctx = (OrderDBContext)par;
  //  //        orderId = ctx.OrderId;
  //  //        mailPars.Add("OrderId", ctx.OrderId.ToString());
  //  //        mailPars.Add("Price", urlInfo.priceText(site, subSite, ctx.Order.PriceTax));
  //  //        mailPars.Add("Account", Order.Account);//ctx.Supplier.Company.AccountNo(ctx.Order.CurrType));
  //  //        mailPars.Add("VarSymbol", ctx.OrderId.ToString());
  //  //        mailPars.Add("LinkUrl", autorizedUrl(site, subSite, lang, c_ordersUrl, ctx.Order.UserId));
  //  //        break;
  //  //      case MailTypes.OrderAccepted_Dobirka:
  //  //      case MailTypes.OrderAccepted_Faktura:
  //  //        ctx = (OrderDBContext)par;
  //  //        orderId = ctx.OrderId;
  //  //        mailPars.Add("OrderId", ctx.OrderId.ToString());
  //  //        mailPars.Add("LinkUrl", autorizedUrl(site, subSite, lang, c_ordersUrl, ctx.Order.UserId));
  //  //        break;
  //  //      case MailTypes.OrderAccepted_ComFaktura:
  //  //        OrderInvoice ordInv = (OrderInvoice)par;
  //  //        orderId = ordInv.order.Id;
  //  //        mailPars.Add("OrderId", ordInv.order.Id.ToString());
  //  //        break;
  //  //      case MailTypes.SendDiscount:
  //  //        SendDiscountPar discPar = (SendDiscountPar)par;
  //  //        mailPars.Add("Discount", discPar.Discount);
  //  //        mailPars.Add("Amount", urlInfo.priceText(site, subSite, discPar.Amount));
  //  //        string buyUrl;
  //  //        switch (site) {
  //  //          case Domains.cz: buyUrl = "www.langmaster.cz"; break;
  //  //          case Domains.sz: buyUrl = "vyuka.lide.cz"; break;
  //  //          case Domains.com: buyUrl = "www.langmaster.com"; break;
  //  //          default: throw new Exception("Missing code here");
  //  //        }
  //  //        mailPars.Add("BuyUrl", buyUrl);
  //  //        //actSite = discPar.Context.Order.Site;
  //  //        //actLang = discPar.Context.Order.Lang.ToString().Replace('_', '-');
  //  //        break;
  //  //      case MailTypes.sd_SendLicenceKey:
  //  //        SendLicenceKeyPar licPar = (SendLicenceKeyPar)par;
  //  //        orderId = licPar.orderId;
  //  //        new CommerceEvent(CommerceEventIds.Other, "sendMail trace", orderId).Raise();
  //  //        mailPars.Add("Product", licPar.shortTitle);
  //  //        mailPars.Add("Key", licPar.key);
  //  //        if (licPar.isDownload) {
  //  //          newType = licPar.productType == ET_SiteMapId.poslechy || licPar.productType == ET_SiteMapId.talknowaudio ? MailTypes.SendLicenceKey_Poslechy : MailTypes.SendLicenceKey_Download;
  //  //          string url = licPar.downloadUrl;
  //  //          mailPars.Add("DownloadUrl", url == null ? "" : url);
  //  //          break;
  //  //        }
  //  //        break;
  //  //    }

  //  //    XElement email = null;
  //  //    if (site == Domains.com && subSite == SubDomains.com_cz && lang == Langs.cs_cz) {
  //  //      try {
  //  //        email = root.Elements().
  //  //          //Where(m => m.Attribute("Lang").Value == (lang == Langs.sp_sp ? "es_es" : lang.ToString()) && m.Attribute("Site").Value == site.ToString() && m.Attribute("Type").Value == newType.ToString()).
  //  //          Where(m => m.Attribute("Lang").Value == lang.ToString() && m.Attribute("Site").Value == Domains.cz.ToString() && m.Attribute("Type").Value == newType.ToString()).
  //  //          FirstOrDefault();
  //  //      } catch {
  //  //        throw new Exception("Cannot find cs-cz email, type= " + newType);
  //  //      }
  //  //    }
  //  //    if (email == null) {
  //  //      try {
  //  //        email = root.Elements().
  //  //          //Where(m => m.Attribute("Lang").Value == (lang == Langs.sp_sp ? "es_es" : lang.ToString()) && m.Attribute("Site").Value == site.ToString() && m.Attribute("Type").Value == newType.ToString()).
  //  //          Where(m => m.Attribute("Lang").Value == lang.ToString() && m.Attribute("Site").Value == site.ToString() && m.Attribute("Type").Value == newType.ToString()).
  //  //          First();
  //  //      } catch {
  //  //        throw new Exception("Cannot find non cs-cz email, type= " + newType + ", lang=" + lang + ", site=" + site);
  //  //      }
  //  //    }
  //  //    //AppData.AppDataDataContext db = Machines.getAppDataContext();
  //  //    //AppData.Mail dbMail = db.Mails.Single(m => m.Lang == (short)lang && m.Site == (short)site && m.Type == (short)newType);

  //  //    //dokonceni mailu (prilohy apod.)
  //  //    StringBuilder sb = new StringBuilder();
  //  //    Emailer em = new Emailer();
  //  //    em.HTML = LowUtils.FormatEx(email.Element("Html").Value, mailPars, sb);
  //  //    em.PlainText = LowUtils.FormatEx(email.Element("Txt").Value, mailPars, sb); ;
  //  //    em.Subject = email.Attribute("Title").Value;
  //  //    string mailFrom;
  //  //    switch (site) {
  //  //      case Domains.cz: mailFrom = "obchod@langmaster.cz"; break;
  //  //      case Domains.sz: mailFrom = "seznam@langmaster.cz"; break;
  //  //      case Domains.com: mailFrom = "support@langmaster.com"; break;
  //  //      default: throw new Exception("Missing code here");
  //  //    }
  //  //    em.From = mailFrom; // System.Configuration.ConfigurationManager.AppSettings["Email.From"];
  //  //    em.AddTo(mail);
  //  //    Emailer.Attachment att;
  //  //    switch (type) {
  //  //      case MailTypes.ConfirmRegistration:
  //  //        new MailEvent("potvrzení registrace", em.PlainText).Raise();
  //  //        break;
  //  //      case MailTypes.LostPassword:
  //  //        new MailEvent("ztracené heslo", em.PlainText).Raise();
  //  //        break;
  //  //      case MailTypes.OrderAccepted_Proforma:
  //  //        ctx = (OrderDBContext)par;
  //  //        new MailEvent("potvrzení objednávky, převodem", ctx.OrderId, em.PlainText).Raise();
  //  //        att = new Emailer.Attachment("Proforma_" + ctx.OrderId + ".pdf", ctx.OrderDb.ProformaX.ToArray(), "application/pdf");
  //  //        em.AddAttachment(att);
  //  //        break;
  //  //      case MailTypes.OrderAccepted_Faktura:
  //  //        ctx = (OrderDBContext)par;
  //  //        new MailEvent("potvrzení objednávky, karta", ctx.OrderId, em.PlainText).Raise();
  //  //        XInvoice inv = XmlUtils.StringToObject<XInvoice>(ctx.OrderDb.InvoiceNew);
  //  //        byte[] data = ProsperLib.printInvoiceNew(inv).ToArray();
  //  //        att = new Emailer.Attachment("Invoice_" + ctx.OrderId + ".pdf", data, "application/pdf");
  //  //        em.AddAttachment(att);
  //  //        Intranet.archiveInvoice(inv, data, false);
  //  //        break;
  //  //      case MailTypes.OrderAccepted_ComFaktura:
  //  //        OrderInvoice ordInv = (OrderInvoice)par;
  //  //        new MailEvent("potvrzení objednávky, lm.com karta", ordInv.order.Id, em.PlainText).Raise();
  //  //        byte[] data2 = ProsperLib.printInvoiceNew(ordInv.invoice).ToArray();
  //  //        att = new Emailer.Attachment("Invoice_" + ordInv.order.Id + ".pdf", data2, "application/pdf");
  //  //        em.AddAttachment(att);
  //  //        Intranet.archiveInvoice(ordInv.invoice, data2, false);
  //  //        break;
  //  //      case MailTypes.SendDiscount:
  //  //        SendDiscountPar discPar = (SendDiscountPar)par;
  //  //        new MailEvent("slevový kupon", discPar.Context.Order.Id, em.PlainText).Raise();
  //  //        break;
  //  //      case MailTypes.sd_SendLicenceKey:
  //  //        SendLicenceKeyPar licPar = (SendLicenceKeyPar)par;
  //  //        new MailEvent("licenční klíč", licPar.orderId, em.PlainText).Raise();
  //  //        break;
  //  //      default:
  //  //        new MailEvent(type.ToString(), em.PlainText).Raise();
  //  //        break;
  //  //    }
  //  //    em.SendMail();
  //  //  } catch (Exception exp) {
  //  //    /*switch (type) {
  //  //      case MailTypes.ConfirmRegistration:
  //  //        ProfileData data = (ProfileData)par;
  //  //        data.Id
  //  //        data.Email
  //  //        data.Password
  //  //        break;
  //  //      case MailTypes.LostPassword:
  //  //        mail
  //  //        (string)par
  //  //        break;
  //  //      case MailTypes.OrderAccepted_Proforma:
  //  //        ctx = (OrderDBContext)par;
  //  //        ctx.OrderId.ToString()
  //  //        ctx.Order.PriceTax
  //  //        ctx.Order.CurrType
  //  //        ctx.OrderId.ToString()
  //  //        ctx.Order.UserId
  //  //        break;
  //  //      case MailTypes.OrderAccepted_Dobirka:
  //  //      case MailTypes.OrderAccepted_Faktura:
  //  //        ctx = (OrderDBContext)par;
  //  //        ctx.OrderId.ToString()
  //  //        ctx.Order.UserId
  //  //        break;
  //  //      case MailTypes.SendDiscount:
  //  //        SendDiscountPar discPar = (SendDiscountPar)par;
  //  //        discPar.Discount
  //  //        discPar.Amount
  //  //        break;
  //  //      case MailTypes.sd_SendLicenceKey:
  //  //        SendLicenceKeyPar licPar = (SendLicenceKeyPar)par;
  //  //        licPar.orderItem.Licence.ShortTitle
  //  //        licPar.key
  //  //        licPar.orderItem.Licence.Licence
  //  //    }*/
  //  //    if (orderId != 0) new CommerceEvent(CommerceEventIds.Other, "sendMail Error: " + exp.Message, orderId, exp).Raise();
  //  //    Logging.Trace(TraceLevel.Error, TraceCategory.All, "Cannot send mail " + mail + " " + exp.Message);
  //  //  }
  //  //}

  //}
}
