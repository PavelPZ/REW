using System;
using System.Data.Common;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Threading;
using System.Text;
//using Npgsql;
using System.Configuration;
using System.Linq;
using System.Linq.Expressions;
using System.Data.Linq;
using iTextSharp.text.pdf;
using iTextSharp.text.xml.xmp;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.X509;
using Org.BouncyCastle.Pkcs;

using LMNetLib;
using LMWeb;

namespace LMComLib {

  public class VypisItem {
    public DateTime Date { get; set; }
    public int OrderId { get; set; }
    public double Amount { get; set; }
    public Intranet.PaymentCheckResult PairResult { get; set; }
    public Exception Error { get; set; }
    public string ErrorStr { get { return LowUtils.ExceptionToString(Error, true, true); } }
  }

  public class XCustommer {
    public XCustommer(ProfileData profile) {
      pri1 = profile.Address.Title;
      pri2 = profile.Address.Zip + " " + profile.Address.Street;
      pri3 = profile.Address.City;
      pri4 = (string.IsNullOrEmpty(profile.IC) ? null : "IČO " + profile.IC + ", ") + (string.IsNullOrEmpty(profile.DIC) ? null : "DIČ " + profile.DIC);
    }
    public XCustommer(Ipn ipn) {
      pri1 = ipn.name;
      pri2 = ipn.payer_email;
      pri3 = ipn.address1;
      pri4 = ipn.address2;
    }
    public string pri1;
    public string pri2;
    public string pri3;
    public string pri4;
  }

  public class XSupplier {
    public XSupplier Fill(Domains site, SubDomains subSite, Langs lng) {
      this.lng = lng; this.site = site; this.subSite = subSite;
      bool isCz = site != Domains.com || subSite == SubDomains.com_cz;
      string langStr = isCz ? "cz" : "en";
      dod1 = ConfigurationManager.AppSettings["Fact.dod1"];
      dod2 = ConfigurationManager.AppSettings["Fact.dod2." + langStr];
      dod3 = ConfigurationManager.AppSettings["Fact.dod3"];
      dod4 = ConfigurationManager.AppSettings["Fact.dod4." + langStr];
      ico = ConfigurationManager.AppSettings["Fact.ico"];
      taxpoint = ConfigurationManager.AppSettings["Fact.taxpoint." + langStr];
      account = Order.Account;// ConfigurationManager.AppSettings["Fact.account"];
      return this;
    }
    public Langs lng;
    public Domains site;
    public SubDomains subSite;
    public string dod1;
    public string dod2;
    public string dod3;
    public string dod4;
    public string ico;
    public string taxpoint;
    public string account;
    //b2b faktury
    public string dic;
    public double vatValue;
  }

  public class XInvoice : XSupplier {
    public XInvoice() : base() { }
    public XInvoice (XSupplier supl): this () {
      Fill(supl);
    }
    public void Fill(XSupplier supl) {
      site = supl.site;
      subSite = supl.subSite;
      lng = supl.lng;
      dod1 = supl.dod1;
      dod2 = supl.dod2;
      dod3 = supl.dod3;
      dod4 = supl.dod4;
      ico = supl.ico;
      dic = supl.dic;
      vatValue = supl.vatValue;
      taxpoint = supl.taxpoint;
      account = supl.account;
    }
    public void Fill(XCustommer cust) {
      pri1 = cust.pri1;
      pri2 = cust.pri2;
      pri3 = cust.pri3;
      pri4 = cust.pri4;
    }
    public string nazev;
    public string id;
    public string pri1;
    public string pri2;
    public string pri3;
    public string pri4;
    public string created; //datum vytvoreni
    public string topay; //datum platby
    public string price;
    public List<XInvoiceItem> items;
    //b2b faktury
    public string vat { get; set; }
    public string priceVat { get; set; }
  }
  public class XInvoiceItem {
    public string code { get; set; }
    public string unitprice { get; set; }
    public string title { get; set; }
    public string amount { get; set; }
    public string price { get; set; }
  }

  [EnumDescrAttribute(typeof(DocumentType), "proforma=Proforma,invoice=Faktura,adviceOfCredit=Dobropis")]
  public enum DocumentType {
    proforma,
    invoice,
    adviceOfCredit,
  }

  public static class ProsperLib {

    public static string c_ShippingProductTitlePosta {
      get { return "Poštovné"; }
    }
    public static string c_ShippingProductTitlePPL {
      get { return "Dopravné PPL"; }
    }
    public static string c_DiscountTitle {
      get { return CSLocalize.localize("97630346ba6646f6ab171dadd03a9825", LocPageGroup.LMComLib, "Sleva"); }
    }
    /// <summary>
    /// High level funkci na vlozeni faktury (nebo proformy)
    /// </summary>
    /// <param name="context">potrebne informace o objednavce, zakaznikovi a dodavateli</param>
    /// <param name="isProforma">Proforma x faktura</param>
    /// <param name="isAdviceOfCredit"></param>
    public static void createInvoice(OrderDBContext context, DocumentType docType) {
      //Dokument jiz existuje: negeneruj 
      if (context.pdfDocumentId(docType) != null) {
        new CommerceEvent(CommerceEventIds.Other, "ProsperLib.createInvoice: pokus o duplicitní generaci faktury", context.Order.Id).Raise();
        return;
      }
      //Faktura do Prosper
      //ProsperData.faktury faktura = InsertInvoice(context, docType); //LowLevel import
      //int faid = faktura == null ? 111 : faktura.id;
      int faid = context.Order.Id;
      context.setPdfDocumentId(docType, faid);
      new CommerceEvent(CommerceEventIds.CreateDocument, EnumDescrAttribute.getDescr(typeof(DocumentType), (int)docType) + ", číslo " + faid.ToString() + ")", context.Order.Id).Raise();
      //PDF.
      refreshInvoicePDF(context, docType);
    }

    static void refreshInvoicePDF(OrderDBContext context, DocumentType docType) {
      if (context.pdfDocumentNew(docType) == null) context.setPdfDocumentNew(context, docType);
    }
    static CultureInfo czDate = CultureInfo.GetCultureInfo("cs-cz");
    static CultureInfo enDate = CultureInfo.GetCultureInfo("en-gb");

    public static XInvoice createXInvoice(Order ord, XCustommer cust, DocumentType docType) {
      XInvoice res = new XInvoice(ord.Supplier);
      bool isCz = ord.Site != Domains.com || ord.SubSite == SubDomains.com_cz;
      CultureInfo dateFormat = isCz ? czDate : enDate;
      //if (res.site == Domains.com && docType == DocumentType.proforma) throw new Exception("Wrong lm.com docType");
      int multi = docType == DocumentType.adviceOfCredit ? -1 : 1;

      if (isCz) res.nazev = docType == DocumentType.proforma ? "ZÁLOHOVÁ FAKTURA" : (docType == DocumentType.adviceOfCredit ? "DOBROPIS" : "FAKTURA"); 
      else res.nazev = docType == DocumentType.adviceOfCredit ? "DOBROPIS" : "INVOICE";
      res.id = ord.Id.ToString();
      res.Fill(cust);
      res.created = ord.CreatedOn.ToString(dateFormat.DateTimeFormat.LongDatePattern, dateFormat);
      if (isCz) res.topay = ord.BillMethod == BillingMethods.Prevod ? DateTime.UtcNow.AddDays(14).ToString(dateFormat.DateTimeFormat.LongDatePattern, dateFormat) : DateTime.UtcNow.ToString(dateFormat.DateTimeFormat.LongDatePattern, dateFormat);
      res.price = urlInfo.priceText(ord.Site, ord.SubSite, multi * ord.PriceTax);
      res.items = new List<XInvoiceItem>();
      int cnt = 1;
      foreach (OrderItem item in ord.Items) {
        XInvoiceItem it = new XInvoiceItem(); res.items.Add(it);
        string cntTxt = cnt.ToString(); cnt++;
        it.code = item.Licence.MyProd.ProductId.ToString();
        it.amount = item.Quantity.ToString();
        it.title = item.Licence.MyProd.ShortTitle;
        //it.title = 
        it.unitprice = urlInfo.priceText(ord.Site, ord.SubSite, (multi * item.PriceTax()));
        it.price = urlInfo.priceText(ord.Site, ord.SubSite, multi * (item.Quantity * item.PriceTax()));
      }
      if (ord.Discount > 0) {
        XInvoiceItem it = new XInvoiceItem(); res.items.Add(it);
        string cntTxt = cnt.ToString(); cnt++;
        it.code = "";
        it.amount = "";
        it.title = c_DiscountTitle;
        it.unitprice = "";
        it.price = urlInfo.priceText(ord.Site, ord.SubSite, -1 * multi * (ord.Discount + ord.DiscountTax));
      }
      if (ord.Shipping > 0) {
        XInvoiceItem it = new XInvoiceItem(); res.items.Add(it);
        it.code = "";
        it.amount = "";
        it.title = ord.ShipMethod == ShippingMethods.posta ? "Poštovné" : "Doprava PPL";
        it.unitprice = "";
        it.price = urlInfo.priceText(ord.Site, ord.SubSite, multi * (ord.Shipping + ord.ShippingTax));
      }
      return res;
    }

    public static byte[] printInvoiceNew(XInvoice res) {
      if (res == null) return null;
      List<GeneratePdfItem> items = new List<GeneratePdfItem>();
      bool isCz = res.site != Domains.com || res.subSite == SubDomains.com_cz;
      if (isCz) items.Add(new GeneratePdfItem() { Name = "nazev", Value = res.nazev });
      items.Add(new GeneratePdfItem() { Name = "dod1", Value = res.dod1 });
      items.Add(new GeneratePdfItem() { Name = "dod2", Value = res.dod2 });
      items.Add(new GeneratePdfItem() { Name = "dod3", Value = res.dod3 });
      items.Add(new GeneratePdfItem() { Name = "dod4", Value = res.dod4 });
      items.Add(new GeneratePdfItem() { Name = "ico", Value = res.ico });
      items.Add(new GeneratePdfItem() { Name = "taxpoint", Value = res.taxpoint });
      if (isCz) items.Add(new GeneratePdfItem() { Name = "account", Value = res.account });

      items.Add(new GeneratePdfItem() { Name = "id", Value = res.id });
      if (isCz) items.Add(new GeneratePdfItem() { Name = "varsymb", Value = res.id });
      items.Add(new GeneratePdfItem() { Name = "pri1", Value = res.pri1 });
      items.Add(new GeneratePdfItem() { Name = "pri2", Value = res.pri2 });
      items.Add(new GeneratePdfItem() { Name = "pri3", Value = res.pri3 });
      items.Add(new GeneratePdfItem() { Name = "pri4", Value = res.pri4 });
      items.Add(new GeneratePdfItem() { Name = "created", Value = res.created });
      if (isCz) items.Add(new GeneratePdfItem() { Name = "topay", Value = res.topay });
      items.Add(new GeneratePdfItem() { Name = "price", Value = res.price });
      int cnt = 1;
      foreach (XInvoiceItem item in res.items) {
        string cntTxt = cnt.ToString(); cnt++;
        items.Add(new GeneratePdfItem() { Name = "c" + cntTxt, Value = item.code });
        if (isCz) items.Add(new GeneratePdfItem() { Name = "j" + cntTxt, Value = item.unitprice });
        items.Add(new GeneratePdfItem() { Name = "t" + cntTxt, Value = item.title });
        if (isCz) items.Add(new GeneratePdfItem() { Name = "a" + cntTxt, Value = item.amount });
        items.Add(new GeneratePdfItem() { Name = "p" + cntTxt, Value = item.price });
      }
      return PdfGenerator.createPdf(ConfigurationManager.AppSettings["Fact." + (isCz ? "cz" : "en")], items.ToArray());
    }

    /*
    static MemoryStream printInvoice2(OrderDBContext context, DocumentType docType) {

      return PdfGenerator.createPdf(@"q:\LMCom\LMCom\App_Data\Invoice.pdf", (fields, setPdfField) => {

        Order ord = context.order; OrderItem oi = context.order.Items[0];
        CommonLib.setLang(ord.Lang);

        string typDokladu = docType == DocumentType.proforma ?
          "ZÁLOHOVÁ FAKTURA" :
          CSLocalize.localize("6a8a44a05314408ca7d8db52cfc6688c", LocPageGroup.LMComLib, "FAKTURA");
        //fields.AddSubstitutionFont(font);
        setPdfField(fields, "Jmeno", ord.Profile.Address.FirstName, 0, false);
        setPdfField(fields, "Prijmeni", ord.Profile.Address.LastName, 0, false);
        setPdfField(fields, "Ulice", ord.Profile.Email, 0, false);
        setPdfField(fields, "TypDokladu", typDokladu, 12, false);
        //setPdfField(fields, "CisloDokladu", info == null ? "XXX001" : info.druhdokladu + "/" + info.cislodokladu, 12, false);
        setPdfField(fields, "CisloDokladu", context.Order.Id.ToString(), 12, false);
        setPdfField(fields, "DUZP", ord.DueDate.ToShortDateString(), 0, false);
        setPdfField(fields, "KodZbozi", oi.dbId.ToString(), 0, false);
        setPdfField(fields, "produkt", oi.Licence.ShortTitle.Replace("&amp;", "&"), 0, false);
        setPdfField(fields, "PocetKS", "1", 0, false);
        setPdfField(fields, "CenaCelkem", urlInfo.priceText(ord.Site, oi.PriceTax()), 11, false);
        setPdfField(fields, "UhradaCelkem", urlInfo.priceText(ord.Site, ord.PriceTax), 12, false);
        setPdfField(fields, "ZakladDS0", urlInfo.priceText(ord.Site, 0), 9, false);
        setPdfField(fields, "ZakladDS9", urlInfo.priceText(ord.Site, 0), 9, false);
        setPdfField(fields, "ZakladDS19", urlInfo.priceText(ord.Site, ord.Price), 9, false);
        setPdfField(fields, "DS0", urlInfo.priceText(ord.Site, 0), 9, false);
        setPdfField(fields, "DS9", urlInfo.priceText(ord.Site, 0), 9, false);
        setPdfField(fields, "DS19", urlInfo.priceText(ord.Site, ord.Tax), 9, false);
        //PJ a MT
        string vat = "DS";
        string vatBase = "základ DS [0]".Replace('[', '{').Replace(']', '}');
        setPdfField(fields, "DodavatelText", CSLocalize.localize("3d15ef50b3c944ee9c9b575febba994e", LocPageGroup.LMComLib, "Dodavatel"), 10, true); //bold
        setPdfField(fields, "LMcomText", "LANGMaster.com, s.r.o.", 10, false);
        setPdfField(fields, "LMadresaText", "Branická 659/107, 140 00 Praha 4", 10, false);
        setPdfField(fields, "LMstatText", CSLocalize.localize("0e5c35819f354dad88ba01ff31951824", LocPageGroup.LMComLib, "Česká republika"), 10, false);
        setPdfField(fields, "LMicText", "IČO: 27338606", 10, false);
        setPdfField(fields, "LMdicText", CSLocalize.localize("8a74d0b3e3e64cb1a5c3b1c421e28a1d", LocPageGroup.LMComLib, "DIČ") + ": CZ27338606", 10, false);
        setPdfField(fields, "PrijemceText", CSLocalize.localize("fde361fa338040ca90f44a62098144bb", LocPageGroup.LMComLib, "Příjemce"), 10, true); //bold
        setPdfField(fields, "DUZPText", "Datum uskutečnitelného zdanitelného plnění", 9, false);
        setPdfField(fields, "KodZboziText", CSLocalize.localize("fd56e09c25d349a8878beb3fd7a6602d", LocPageGroup.LMComLib, "kód zboží"), 10, true); //bold
        setPdfField(fields, "ProduktText", CSLocalize.localize("db28ac96d3474b56a82cc5afd94e7c93", LocPageGroup.LMComLib, "popis produktu"), 10, true); //bold
        setPdfField(fields, "PocetKSText", "ks", 10, true); //bold
        setPdfField(fields, "CenaCelkemText", "cena celkem s DPH", 10, true); //bold
        setPdfField(fields, "UhradaCelkemText", CSLocalize.localize("29baf440e1f044868549b1d469fa9315", LocPageGroup.LMComLib, "Celkem k úhradě"), 11, true); //bold
        setPdfField(fields, "ZakladDS0Text", string.Format(vatBase, "0%"), 8, true); //bold
        setPdfField(fields, "DS0Text", vat + " 0%", 8, true); //bold
        setPdfField(fields, "ZakladDS9Text", string.Format(vatBase, "10%"), 8, true); //bold
        setPdfField(fields, "DS9Text", vat + " 10%", 8, true); //bold
        setPdfField(fields, "ZakladDS19Text", string.Format(vatBase, "20%"), 8, true); //bold //DPH 20
        setPdfField(fields, "DS19Text", vat + " 20%", 8, true); //bold //DPH 20      
      });*/
      /*
      if (font == null)
        lock (typeof(ProsperLib))
          if (font == null) {
            font = BaseFont.CreateFont(@"q:\LMCom\LMCom\App_Data\Invoice\verdana.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            Cert(@"q:\LMCom\LMCom\App_Data\langmaster_pdf.pfx", ConfigurationManager.AppSettings["PDF.Cert.Password"], out akp, out chain);
          }
      //PdfReader rdr = new PdfReader(new RandomAccessFileOrArray(string.Format(@"q:\LMCom\LMCom\App_Data\Invoice\{0}.pdf", context.order.Lang)), null);
      PdfReader rdr = new PdfReader(new RandomAccessFileOrArray(string.Format(@"q:\LMCom\LMCom\App_Data\Invoice.pdf", context.order.Lang)), null);
      MemoryStream res = new MemoryStream();
      try {
        PdfStamper ps = new PdfStamper(rdr, res);
        try {
          //Dosazeni poli
          AcroFields fields = ps.AcroFields;

          Order ord = context.order; OrderItem oi = context.order.Items[0];
          CommonLib.setLang(ord.Lang);
          
          string typDokladu = docType == DocumentType.proforma ?
            "ZÁLOHOVÁ FAKTURA" :
            CSLocalize.localize("3ebf4510a52b459ea0d924bb8546027e", LocPageGroup.LMComLib, "FAKTURA");
          //fields.AddSubstitutionFont(font);
          setPdfField(fields, "Jmeno", ord.Profile.Address.FirstName,0, false);
          setPdfField(fields, "Prijmeni", ord.Profile.Address.LastName, 0, false);
          setPdfField(fields, "Ulice", ord.Profile.Email, 0, false);
          setPdfField(fields, "TypDokladu", typDokladu, 12, false);
          setPdfField(fields, "CisloDokladu", info == null ? "XXX001" : info.druhdokladu + "/" + info.cislodokladu, 12, false);
          setPdfField(fields, "DUZP", ord.DueDate.ToShortDateString(), 0, false);
          setPdfField(fields, "KodZbozi", oi.dbId.ToString(), 0, false);
          setPdfField(fields, "produkt", oi.Licence.ShortTitle.Replace("&amp;","&"), 0, false);
          setPdfField(fields, "PocetKS", "1", 0, false);
          setPdfField(fields, "CenaCelkem", urlInfo.priceText(ord.Site, oi.PriceTax()), 11, false);
          setPdfField(fields, "UhradaCelkem", urlInfo.priceText(ord.Site, ord.PriceTax), 12, false);
          setPdfField(fields, "ZakladDS0", urlInfo.priceText(ord.Site, 0), 9, false);
          setPdfField(fields, "ZakladDS9", urlInfo.priceText(ord.Site, 0), 9, false);
          setPdfField(fields, "ZakladDS19", urlInfo.priceText(ord.Site, ord.Price), 9, false);
          setPdfField(fields, "DS0", urlInfo.priceText(ord.Site, 0), 9, false);
          setPdfField(fields, "DS9", urlInfo.priceText(ord.Site, 0), 9, false); 
          setPdfField(fields, "DS19", urlInfo.priceText(ord.Site, ord.Tax), 9, false);
          //PJ a MT
          string vat = "DS";
          string vatBase = "základ DS [0]".Replace('[','{').Replace(']','}');
          setPdfField(fields, "DodavatelText", CSLocalize.localize("4cd070ae691b49d3b082604774b49b26", LocPageGroup.LMComLib, "Dodavatel"), 10, true); //bold
          setPdfField(fields, "LMcomText", "LANGMaster.com, s.r.o.", 10, false);
          setPdfField(fields, "LMadresaText", "Branická 659/107, 140 00 Praha 4", 10, false);
          setPdfField(fields, "LMstatText", CSLocalize.localize("cb0c6758ea48434e91745e2eeb061ab1", LocPageGroup.LMComLib, "Česká republika"), 10, false);
          setPdfField(fields, "LMicText", "IČO: 27338606", 10, false);
          setPdfField(fields, "LMdicText", CSLocalize.localize("68e797efb57d42c68d906b437a981aba", LocPageGroup.LMComLib, "DIČ") + ": CZ27338606", 10, false);
          setPdfField(fields, "PrijemceText", CSLocalize.localize("18219c6e1ca84878a7d357e6b79dc23b", LocPageGroup.LMComLib, "Příjemce"), 10, true); //bold
          setPdfField(fields, "DUZPText", "Datum uskutečnitelného zdanitelného plnění", 9, false);
          setPdfField(fields, "KodZboziText", CSLocalize.localize("c08ab32711664a96bdd55ac6a52f7dee", LocPageGroup.LMComLib, "kód zboží"), 10, true); //bold
          setPdfField(fields, "ProduktText", CSLocalize.localize("55bf788aa56b4c9494141872d1f24fac", LocPageGroup.LMComLib, "popis produktu"), 10, true); //bold
          setPdfField(fields, "PocetKSText", "ks", 10, true); //bold
          setPdfField(fields, "CenaCelkemText", "cena celkem s DPH", 10, true); //bold
          setPdfField(fields, "UhradaCelkemText", CSLocalize.localize("c6d4c77187234d7f8eb78cf3c69a2a37", LocPageGroup.LMComLib, "Celkem k úhradě"), 11, true); //bold
          setPdfField(fields, "ZakladDS0Text", string.Format (vatBase, "0%"), 8, true); //bold
          setPdfField(fields, "DS0Text", vat + " 0%", 8, true); //bold
          setPdfField(fields, "ZakladDS9Text", string.Format(vatBase, "10%"), 8, true); //bold
          setPdfField(fields, "DS9Text", vat + " 10%", 8, true); //bold
          setPdfField(fields, "ZakladDS19Text", string.Format(vatBase, "20%"), 8, true); //bold //DPH 20
          setPdfField(fields, "DS19Text", vat + " 20%", 8, true); //bold //DPH 20
          ps.FormFlattening = true;
          //Priprava na elektronicky podpis
        } finally { ps.Close(); }
      } finally { rdr.Close(); }
      PdfReader certRdr = new PdfReader(res.GetBuffer());
      MemoryStream certRes = new MemoryStream();
      try {
        PdfStamper certPs = PdfStamper.CreateSignature(certRdr, certRes, '\0');
        try {
          PdfSignatureAppearance sap = certPs.SignatureAppearance;
          sap.SetCrypto(akp, chain, null, PdfSignatureAppearance.WINCER_SIGNED);
          sap.Reason = "Certify";
          sap.Contact = "LANGMaster";
          sap.Location = "EU";
        } finally {
          certPs.Close();
        }
      } finally { certRdr.Close(); }
      return certRes;*/

    /*
    }
   static BaseFont font;
    static AsymmetricKeyParameter akp; static Org.BouncyCastle.X509.X509Certificate[] chain;

    static void setPdfField(AcroFields fields, string name, string value, int size, bool bold) {
      name = fields.GetTranslatedFieldName(name);
      fields.SetFieldProperty(name, "textsize", (float)(size == 0 ? 10 : size), null);
      fields.SetFieldProperty(name, "textfont", font, null);
      fields.SetField(name, value);
    }


    static void Cert(string path, string password, out AsymmetricKeyParameter akp, out Org.BouncyCastle.X509.X509Certificate[] chain) {
      string alias = null;
      Pkcs12Store pk12;
      //First we'll read the certificate file
      pk12 = new Pkcs12Store(new FileStream(path, FileMode.Open, FileAccess.Read), password.ToCharArray());

      //then Iterate throught certificate entries to find the private key entry
      IEnumerator i = pk12.Aliases.GetEnumerator();
      while (i.MoveNext()) {
        alias = ((string)i.Current);
        if (pk12.IsKeyEntry(alias)) break;
      }

      akp = pk12.GetKey(alias).Key;
      X509CertificateEntry[] ce = pk12.GetCertificateChain(alias);
      chain = new Org.BouncyCastle.X509.X509Certificate[ce.Length];
      for (int k = 0; k < ce.Length; ++k)
        chain[k] = ce[k].Certificate;
    }*/
    /*static void refreshInvoicePDF(OrderDBContext context, DocumentType docType) {
      //if (docType == DocumentType.adviceOfCredit) return;
      //Dokument jiz existuje: negeneruj 
      //bool isProforma = docType == DocumentType.proforma;
      //if (context.pdfDocumentNew(docType) != null) return;
      //nacteni dat z prosperu
      //int? prosperId = isProforma ? context.OrderDb.ProformaId : context.OrderDb.InvoiceId;
      //if (prosperId == null)
        //throw new Exception("Missing invoice ID");
      //ProsperData.faktury info = getInvoiceInfoFromProsper(context, (int)prosperId);
      //tisk PDF a ulozeni do databaze
      if (context.pdfDocumentNew(docType) == null) context.setPdfDocumentNew(context, docType);
        //(context.order.Site == Domains.com ? printInvoice2(context, docType).ToArray() : printInvoice(context, docType).ToArray()));
    }

    /*public static void refreshInvoicePDF(OrderDBContext context, bool isProforma) {
      refreshInvoicePDF(context, isProforma, false);
    }*/

    /// <summary>
    /// Vrati fyzickou Prosper identifikaci ciselne rady
    /// </summary>
    /// <param name="isProforma">proforma a faktura maji jine ciselne rady</param>
    /// <param name="supplierId">identifikace dodavatele z App_Data/Suppliers.xml</param>
    /// <returns>Prosper identifikace rady</returns>
    /*static string getProsperRange(OrderDBContext context, DocumentType docType ) {
      char[] res = new char[3];
      switch (docType) {
        case DocumentType.invoice: res[0] = 'F'; break;
        case DocumentType.proforma: res[0] = 'Z'; break;
        case DocumentType.adviceOfCredit: res[0] = 'D'; break;
        default: throw new Exception("Missing code here");
      }
      switch (context.Order.Site) {
        case Domains.cz: res[1] = 'A'; break;
        case Domains.sz: res[1] = 'B'; break;
        default: res[1] = 'A'; break;
      }
      switch (context.Order.CurrType) {
        case CurrencyType.csk: res[2] = 'A'; break;
        case CurrencyType.eur: res[2] = 'B'; break;
        case CurrencyType.usd: res[2] = 'C'; break;
        default: throw new Exception("Missing code here");
      }
      return new string(res);
    }

    static string getProsperBrach(OrderDBContext context) {
      switch (context.Order.Site) {
        case Domains.cz: return "0001";
        case Domains.sz: return "0002";
        case Domains.com: return "0003";
        default: throw new Exception("Missing code here");
      }
    }

    static string getProsperTypPlatceDPH(OrderDBContext context) {
      return string.IsNullOrEmpty(context.Profile.DIC) ? "B" : "A";
    }

    static short getProsperKodZuctovani(OrderDBContext context, DocumentType doc) {
      if (doc != DocumentType.invoice) return 0;
      if (context.Order.BillMethod != BillingMethods.Prevod) return 0;
      switch (context.Order.CurrType) {
        case CurrencyType.csk: return 10;
        case CurrencyType.eur: return 11;
        case CurrencyType.usd: return 12;
        default: throw new Exception("Missing code here " + context.Order.CurrType.ToString());
      }
    }

    public static string ProsperVypis(Order ord, DateTime date) {
      return string.Format(";;;;{0};{1};;{2};;;;", ord.PriceTax.ToString(new CultureInfo("cs-cz")), ord.Id, date.ToString("dd.MM.yy"), null);
    }*/

    /*private static string PrepeareForProsper(List<LMComLib.Commerce.PDF.PolozkaPPVypisu> polozkyVypisu) {
      string result = "";
      foreach (LMComLib.Commerce.PDF.PolozkaPPVypisu item in polozkyVypisu) {
        result += ";;;;";
        result += item.Sum.Replace('.', ',') + ";";
        result += item.varSymbol + ";;";
        result += item.date.ToString("dd.MM.yy") + ";;";
        result += item.transactionId + ";;;;";
        result += "\r\n";
      }
      return result;
    }

    public const string c_ShippingProductIdPosta = "0999";
    const int c_ShippingTaxPosta = 20; //DPH 20

    public const string c_ShippingProductIdPPL = "0997";
    const int c_ShippingTaxPPL = 20; //DPH 20

    public const string c_DiscountId = "0998";
    public static string c_DiscountTitle {
      get { return CSLocalize.localize("82db8ceb85a94ecda354a3b5a96a47f8", LocPageGroup.LMComLib, "Sleva"); }
    }

    /// <summary>
    /// WEBTICA: LowLevel funkce, nevyžadující LMCom runtime (databazi, cache, produkty apod.) na vytvoreni faktury v Prosperu
    /// </summary>
    /// <param name="context">potrebne informace o objednavce, zakaznikovi a dodavateli</param>
    /// <param name="products">potrebne informace o produktu kvuli sparovani se skladovymi kartami</param>
    /// <param name="rangeId">3-mistna identifikace ciselne rady. Identifikaci ciselne rady se napr. rozlisuje faktura od proforma faktury, 
    /// rozlisuji se jednotlivi dodavatele apod. Identifikace musi byt dodany Prosperem zvenku.</param>
    /// <returns>pojmenovane vystupni informace z importu, napr. číslo faktury apod.</returns>
    /*static ProsperData.faktury InsertInvoice(OrderDBContext context, DocumentType doc) {
      if (Machines.debugNoInternet) return null;
      //vlozeni nebo aktualizace firmy
      ProsperData.pdwfirmy firma = InsertFirma(context);
      context.ProsperDB.SubmitChanges();
      //vlozeni faktury
      ProsperData.faktury faktura = InsertFaktura(context, firma, doc);
      context.ProsperDB.SubmitChanges();
      //vlozeni skladovych pohybu
      InsertSkladovepohyby(context, faktura, doc);
      context.ProsperDB.SubmitChanges();
      return faktura;
    }

    static ProsperData.pdwfirmy InsertFirma(OrderDBContext context) {
      string user = context.Order.UserId.ToString(); string title = encodePopisZbozi (context.Profile.Address.Title);
      ProsperData.Context db = context.ProsperDB;
      ProsperData.pdwfirmy firma = db.pdwfirmies.Where(f => f.cislozakaznika == user).FirstOrDefault();
      if (firma == null) {
        firma = new ProsperData.pdwfirmy();
        db.pdwfirmies.InsertOnSubmit(firma);
        //Plneni firmy
        firma.cislozakaznika = user;
        firma.username = firma.fakturymena = firma.grouprelationship = firma.keyaccount = firma.destination =
          firma.kodstatu = firma.typplatcedph = firma.kodosvobozenidph = firma.a3kodstatu = "";
      }
      firma.nazev = title;
      firma.typplatcedph = ProsperLib.getProsperTypPlatceDPH(context);
      firma.kodstatu = context.Order.Profile.Address.Country; if (string.IsNullOrEmpty(firma.kodstatu)) firma.kodstatu = "CZ";
      return firma;
    }

    static ProsperData.faktury InsertFaktura(OrderDBContext context, ProsperData.pdwfirmy firma, DocumentType doc) {
      ProsperData.Context db = context.ProsperDB;
      ProsperData.faktury faktura = new ProsperData.faktury();
      db.fakturies.InsertOnSubmit(faktura);
      //Plneni faktury
      ProsperLib.FillFaktura(faktura, context, firma, doc);
      //Uschova a zjisteni ID
      return faktura;
    }

    static void FillFaktura(ProsperData.faktury faktura, OrderDBContext context, ProsperData.pdwfirmy firma, DocumentType doc) {
      Order ordr = context.Order;
      faktura.druhdokladu = getProsperRange(context, doc);
      faktura.datumdokladu = ordr.CreatedOn;
      faktura.datumsplatnosti = ordr.DueDate;
      faktura.datumzdanplneni = ordr.CreatedOn;
      faktura.icoexterni = firma.ico;
      faktura.datumvzniku = DateTime.UtcNow;
      faktura.bankovnispojeniodesilatele = context.Supplier.Company.AccountNo(context.Order.CurrType);

      faktura.variabilnisymbol = ordr.Id.ToString();
      faktura.konstantnisymbol = "308";
      faktura.stredisko = ProsperLib.getProsperBrach(context);
      faktura.zpusobdopravy = (short)ordr.ShipMethod;
      faktura.zpusobplatby = (short)ordr.BillMethod;
      faktura.kodzuctovani = ProsperLib.getProsperKodZuctovani(context, doc);
      faktura.mena = ordr.NormCurrType;
      faktura.koeficient = ordr.CurrExchange;
      if (doc != DocumentType.adviceOfCredit) {
        faktura.celkembezdph = Convert.ToDecimal(ordr.Price);
        faktura.zakladdane22 = Convert.ToDecimal(ordr.PriceForTax);
        faktura.dan22 = Convert.ToDecimal(ordr.Tax);
        faktura.celkemsdph = Convert.ToDecimal(ordr.PriceTax - ordr.Rounded);
        faktura.zaokrouhleni = Convert.ToDecimal(ordr.Rounded);

      } else {
        faktura.celkembezdph = (-1) * Convert.ToDecimal(ordr.Price);
        faktura.zakladdane22 = (-1) * Convert.ToDecimal(ordr.PriceForTax);
        faktura.dan22 = (-1) * Convert.ToDecimal(ordr.Tax);
        faktura.celkemsdph = (-1) * Convert.ToDecimal(ordr.PriceTax - ordr.Rounded);
        faktura.zaokrouhleni = (-1) * Convert.ToDecimal(ordr.Rounded);
      }
    }*/

    /*static void InsertSkladovepohyby(OrderDBContext context, ProsperData.faktury faktura, DocumentType doc) {
      ProsperData.Context db = context.ProsperDB;
      ProsperData.skladovepohyby pohyb;
      foreach (OrderItem item in context.Order.Items) {
        pohyb = new ProsperData.skladovepohyby();
        db.skladovepohybies.InsertOnSubmit(pohyb);
        FillSkladovepohyby(pohyb, context, item, faktura, doc);
      }
      if (context.Order.Shipping > 0) {
        pohyb = new ProsperData.skladovepohyby();
        db.skladovepohybies.InsertOnSubmit(pohyb);
        FillSkladovepohybyPostovne(pohyb, context, faktura, doc);
      }
      if (context.Order.Discount > 0) {
        pohyb = new ProsperData.skladovepohyby();
        db.skladovepohybies.InsertOnSubmit(pohyb);
        FillSkladovepohybySleva(pohyb, context, faktura, doc);
      }
    }

    static void FillSkladovepohybyCommon(ProsperData.skladovepohyby item, DocumentType doc, bool isKc, double price, double priceTax, OrderDBContext context, ProsperData.faktury faktura) {
      item.username = "";
      item.faid = faktura.id;
      item.sklad = getProsperBrach(context);
      item.mernajednotka = "ks";
      if (!isKc) {
        if (doc != DocumentType.adviceOfCredit) {
          item.cenazamjbezdphvcm = Convert.ToDecimal(price);
          item.cenazamjsdphvcm = Convert.ToDecimal(priceTax);
        } else {
          item.cenazamjbezdphvcm = (-1) * Convert.ToDecimal(price);
          item.cenazamjsdphvcm = (-1) * Convert.ToDecimal(priceTax);
        }
        item.cenacelkembezdphvcm = Convert.ToDecimal(item.cenazamjbezdphvcm * (int)item.mnozstvimj);
        item.cenacelkemsdphvcm = Convert.ToDecimal(item.cenazamjsdphvcm * (int)item.mnozstvimj);
      } else {
        if (doc != DocumentType.adviceOfCredit) {
          item.cenazamjbezdph = Convert.ToDecimal(price);
          item.cenazamjsdph = Convert.ToDecimal(priceTax);
        } else {
          item.cenazamjbezdph = (-1) * Convert.ToDecimal(price);
          item.cenazamjsdph = (-1) * Convert.ToDecimal(priceTax);
        }
        item.cenacelkembezdph = Convert.ToDecimal(item.cenazamjbezdph * (int)item.mnozstvimj);
        item.cenacelkemsdph = Convert.ToDecimal(item.cenazamjsdph * (int)item.mnozstvimj);
      }
    }

    static void FillSkladovepohyby(ProsperData.skladovepohyby item, OrderDBContext context, OrderItem ordritem, ProsperData.faktury faktura, DocumentType doc) {
      item.kodzbozi = ordritem.ProsperId.ToString();
      //PZ 20.6.08 - pro HW zbozi dat pred kod pismeni Z
      int commerceId = ProductLicence.getCommerceId(ordritem.ProsperId);
      if (commerceId == 123 || commerceId == 124 || commerceId == 125) item.kodzbozi = "Z" + item.kodzbozi;
      else if (ordritem.Licence.Licence == ProductLicenceType.download) item.kodzbozi = "D" + item.kodzbozi;

      item.popiszbozi = encodePopisZbozi(ordritem.Licence.ShortTitle);
      item.mnozstvimj = ordritem.Quantity;

      if (ordritem.Tax() != 0) {
        item.sazbadph = 20; //DPH 20
      }
      switch (doc) {
        case DocumentType.invoice: item.typpohybu = (short)(ordritem.Licence.LicenceOnly ? -10 : -1); break;
        case DocumentType.proforma: item.typpohybu = -10; break;
        case DocumentType.adviceOfCredit: item.typpohybu = (short)(ordritem.Licence.LicenceOnly ? 10 : 1); break;
      }
      FillSkladovepohybyCommon(item, doc, context.order.CurrType == CurrencyType.csk, ordritem.Price(), ordritem.PriceTax(), context, faktura);
    }

    static void FillSkladovepohybyPostovne(ProsperData.skladovepohyby item, OrderDBContext context, ProsperData.faktury faktura, DocumentType doc) {
      Order ordr = context.order;
      if (ordr.ShipMethod == ShippingMethods.posta) {
        item.kodzbozi = c_ShippingProductIdPosta;
        item.popiszbozi = c_ShippingProductTitlePosta;
        item.sazbadph = c_ShippingTaxPosta;
      } else if (ordr.ShipMethod == ShippingMethods.PPL) {
        item.kodzbozi = c_ShippingProductIdPPL;
        item.popiszbozi = c_ShippingProductTitlePPL;
        item.sazbadph = c_ShippingTaxPPL;
      }
      item.mnozstvimj = 1;
      switch (doc) {
        case DocumentType.proforma:
        case DocumentType.invoice: item.typpohybu = -10; break;
        case DocumentType.adviceOfCredit: item.typpohybu = 10; break;
      }
      FillSkladovepohybyCommon(item, doc, context.order.CurrType == CurrencyType.csk, ordr.Shipping, ordr.Shipping + ordr.ShippingTax, context, faktura);
    }

    static void FillSkladovepohybySleva(ProsperData.skladovepohyby item, OrderDBContext context, ProsperData.faktury faktura, DocumentType doc) {
      Order ordr = context.order;
      item.kodzbozi = c_DiscountId;
      item.popiszbozi = c_DiscountTitle;
      item.mnozstvimj = 1;
      switch (doc) {
        case DocumentType.proforma:
        case DocumentType.invoice: item.typpohybu = -10; break;
        case DocumentType.adviceOfCredit: item.typpohybu = 10; break;
      }
      item.sazbadph = 20; //DPH 20
      FillSkladovepohybyCommon(item, doc, context.order.CurrType == CurrencyType.csk, ordr.Discount, ordr.Discount + ordr.DiscountTax, context, faktura);
    }

    public static void InsertSkladovaKarta(ProsperData.Context db, IEnumerable<ProsperData.skladovekarty> karty, string kodZbozi, string popisZbozi, int typKarty) {
      ProsperData.skladovekarty sk = karty.Where(s => s.kodzbozi == kodZbozi).FirstOrDefault();
      if (sk == null) {
        sk = new ProsperData.skladovekarty();
        sk.kodzbozi = kodZbozi;
        sk.mena = sk.username = "";
        sk.mernajednotka = "ks";
        db.skladovekarties.InsertOnSubmit(sk);
      }
      sk.popiszbozi = encodePopisZbozi(popisZbozi);
      sk.typkarty = (short)typKarty;
    }

    static string encodePopisZbozi(string popis) {
      char[] chars = popis.ToCharArray();
      for (int i = 0; i < chars.Length; i++) {
        switch (chars[i]) {
          case 'á': chars[i] = 'a'; break;
          case 'Á': chars[i] = 'A'; break;
          case 'č': chars[i] = 'c'; break;
          case 'Č': chars[i] = 'C'; break;
          case 'ď': chars[i] = 'd'; break;
          case 'Ď': chars[i] = 'D'; break;
          case 'é': chars[i] = 'e'; break;
          case 'É': chars[i] = 'E'; break;
          case 'ě': chars[i] = 'e'; break;
          case 'Ě': chars[i] = 'E'; break;
          case 'í': chars[i] = 'i'; break;
          case 'Í': chars[i] = 'I'; break;
          case 'ň': chars[i] = 'n'; break;
          case 'Ň': chars[i] = 'N'; break;
          case 'ó': chars[i] = 'o'; break;
          case 'Ó': chars[i] = 'O'; break;
          case 'ř': chars[i] = 'r'; break;
          case 'Ř': chars[i] = 'R'; break;
          case 'š': chars[i] = 's'; break;
          case 'Š': chars[i] = 'S'; break;
          case 'ť': chars[i] = 't'; break;
          case 'Ť': chars[i] = 'T'; break;
          case 'ú': chars[i] = 'u'; break;
          case 'Ú': chars[i] = 'U'; break;
          case 'ů': chars[i] = 'u'; break;
          case 'Ů': chars[i] = 'U'; break;
          case 'ý': chars[i] = 'y'; break;
          case 'Ý': chars[i] = 'Y'; break;
          case 'ž': chars[i] = 'z'; break;
          case 'Ž': chars[i] = 'Z'; break;
          case '’': chars[i] = '\''; break;
          default: break;
        }
        try {
          if (Convert.ToInt16(chars[i]) > 127)
            chars[i] = ' ';
        } catch { chars[i] = ' '; }
      }
      string res = new string(chars);
      if (res.Length > 60) res = res.Substring(0, 60);
      return res;
    }*/

    /*
    public static bool IsPaid(int varSymbol, Order ord)
    {
      if (Machines.debugNoInternet) return false;
      bool result = false;
      using (NpgsqlConnection conn = Machines.createProsperConnection()) {
        conn.Open();

        NpgsqlCommand command = new NpgsqlCommand();
        command.Connection = conn;
        command.CommandType = CommandType.Text;
        command.CommandText = "select varsymbol, sumofmd-sumofd as castka from statickesaldo where lower(varsymbol) = @varsymbol";
        command.Parameters.Add("@varsymbol", NpgsqlTypes.NpgsqlDbType.Varchar, 14).Value = varSymbol.ToString();
        using (Npgsql.NpgsqlDataReader dr = command.ExecuteReader()) {
          if (dr.Read()) {
            double castka = (-1.0) * Convert.ToDouble(dr["castka"]);
            if (ord.BillMethod == BillingMethods.Prevod) {
              return castka == ord.PriceTax;
            } else
              return castka == 0;
          }
        }
        //dr.Close();
        //conn.Close();
      }
      return result;
    }    

    public static bool IsPaid(int varSymbol, Order ord) {
      ProsperData.Context db = Machines.ProsperData();
      //var x = db.statickesaldos.Where(s => s.varsymbol == varSymbol.ToString()).Select(s => new { s.sumofmd, s.sumofd }).ToArray();
      //var debug = db.statickesaldos.Where(s => s.varsymbol == varSymbol.ToString()).FirstOrDefault();
      decimal? castkaNull = db.statickesaldos.Where(s => s.varsymbol == varSymbol.ToString()).Select(s => s.sumofd - s.sumofmd).FirstOrDefault();
      if (castkaNull == null) return false;
      double castka = Convert.ToDouble((decimal)castkaNull);
      if (ord.BillMethod == BillingMethods.Prevod) {
        return castka >= 0.9 * ord.PriceTax; //kdyz zaplati alespon 90% ceny, sparujeme...
      } else
        return castka == 0;
    }

    public static void InsertHlavniKniha(OrderDBContext ctx) {
      if (Machines.debugNoInternet) return;
      Order ord = ctx.Order;
      //Parametry plneni, zavisle na mene
      string ucet12, druhDokladu; bool isCiziMena;
      switch (ord.CurrType) {
        case CurrencyType.csk: ucet12 = "221200"; druhDokladu = "BV3"; isCiziMena = false; break;
        case CurrencyType.eur: ucet12 = "221201"; druhDokladu = "BV4"; isCiziMena = true; break;
        case CurrencyType.usd: ucet12 = "221202"; druhDokladu = "BV5"; isCiziMena = true; break;
        default: throw new Exception("Missing code here");
      }
      ProsperData.Context db = Machines.ProsperData();
      int max = db.hlavniknihas.Where(hk => hk.druhdokladu == druhDokladu).Select(hk => hk.cislodokladu).Max();
      //Jednotlive radky:
      for (int i = 0; i < 4; i++) {
        ProsperData.pdwrozhranihk hk = new ProsperData.pdwrozhranihk();
        db.pdwrozhranihks.InsertOnSubmit(hk);
        hk.cislodokladu = max + 1;
        hk.druhdokladu = druhDokladu;
        hk.datum = (DateTime)ctx.OrderDb.PaymentDate;
        hk.datumzdanplneni = hk.datum;
        hk.hospodarskestredisko = ProsperLib.getProsperBrach(ctx);
        hk.mena = ord.NormCurrType;
        hk.kodstatu = ctx.Order.Profile.Address.Country;
        hk.typplatcedph = ProsperLib.getProsperTypPlatceDPH(ctx);
        hk.ucet = ""; hk.md = 0; hk.d = 0; hk.cizicastkamd = 0; hk.cizicastkad = 0; hk.kurs = 0; hk.link2 = 0; hk.ismain = 0;
        switch (i) {
          case 0:
            hk.ucet = ucet12; hk.ismain = 1;
            if (!isCiziMena) {
              hk.md = Convert.ToDecimal(ord.PriceTax);
            } else {
              hk.cizicastkamd = Convert.ToDecimal(ord.PriceTax); hk.kurs = ord.CurrExchange; hk.md = Convert.ToDecimal(ord.PriceTax) * Convert.ToDecimal(hk.kurs);
            }
            break;
          case 1:
            hk.ucet = ucet12; hk.link2 = 1;
            if (!isCiziMena) {
              hk.d = Convert.ToDecimal(ord.PaymentFee);
            } else {
              hk.cizicastkad = Convert.ToDecimal(ord.PaymentFee); hk.kurs = ord.CurrExchange; hk.d = Convert.ToDecimal(ord.PaymentFee) * Convert.ToDecimal(hk.kurs);
            }
            break;
          case 2:
            hk.ucet = "811999"; hk.varsymbol = ord.Id.ToString();
            if (!isCiziMena) {
              hk.d = Convert.ToDecimal(ord.PriceTax);
            } else {
              hk.cizicastkad = Convert.ToDecimal(ord.PriceTax); hk.kurs = ord.CurrExchange; hk.d = Convert.ToDecimal(ord.PriceTax) * Convert.ToDecimal(hk.kurs);
            }
            break;
          case 3:
            hk.ucet = "821999"; 
            if (!isCiziMena) {
              hk.md = Convert.ToDecimal(ord.PaymentFee);
            } else {
              hk.cizicastkamd = Convert.ToDecimal(ord.PaymentFee); hk.kurs = ord.CurrExchange; hk.md = Convert.ToDecimal(ord.PaymentFee) * Convert.ToDecimal(hk.kurs);
            }
            break;
        }
      }
      db.SubmitChanges();
    }
    */
    /// <summary>
    /// WEBTICA: K internimu cislu Prosper faktury vrati udaje, nutne k jejimu vytisteni.
    /// </summary>
    /// <param name="prosperId">interni Prosper ID dokumentu</param>
    /// <returns>informace, vytazene z Prosperu</returns>
    /// 
    /*
    static ProsperData.faktury getInvoiceInfoFromProsper(OrderDBContext context, int prosperId) {
      if (Machines.debugNoInternet) return null;
      //return context.ProsperDB.fakturies.Where(f => f.icoexterni == prosperId).FirstOrDefault();
      return context.ProsperDB.fakturies.Where(f => f.id == prosperId).FirstOrDefault();
    }*/

    /*static Encoding enc = Encoding.GetEncoding("iso-8859-2");
    /// <summary>
    /// Zaruci ze v retezci jsou pouze znaky, ktere lze prekodovat do Latin 2
    /// </summary>
    public static string adjustStringCoding(string s) {
      string res = enc.GetString(enc.GetBytes(s));
      return res;
    }*/
    /*
        static MemoryStream printInvoice(OrderDBContext context, DocumentType docType) {
    #if GOPAS
          return null;
    #else
          string imagePath = System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath + "App_Data\\" + System.Configuration.ConfigurationManager.AppSettings["PDF.image"];
          string fontPath = System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath + "App_Data\\" + System.Configuration.ConfigurationManager.AppSettings["PDF.font"]; ;
          LMComLib.Commerce.PDF.Prijemce prijemce = new LMComLib.Commerce.PDF.Prijemce(context.Profile);
          LMComLib.Commerce.PDF.Dodavatel dodavatel = new LMComLib.Commerce.PDF.Dodavatel(context.Supplier.Company, context.Order.CurrType);
          LMComLib.Commerce.PDF.DetailPlatby detail = new LMComLib.Commerce.PDF.DetailPlatby(context.Order);
          int multi = docType == DocumentType.adviceOfCredit ? -1 : 1;
          LMComLib.Commerce.PDF.Platba platba = new LMComLib.Commerce.PDF.Platba(
            urlInfo.priceText(context.Order.Site, multi * context.Order.Price),
            urlInfo.priceText(context.Order.Site, multi * context.Order.Tax),
            urlInfo.priceText(context.Order.Site, multi * (context.Order.PriceTax + context.Order.Rounded)),
            urlInfo.priceText(context.Order.Site, multi * context.Order.Rounded),
            urlInfo.priceText(context.Order.Site, multi * context.Order.PriceTax));
          //LMComLib.Commerce.PDF.Faktura faktura = new LMComLib.Commerce.PDF.Faktura(info == null ? "XXX001" : (info.druhdokladu + "/" + info.cislodokladu), prijemce, dodavatel, detail, platba, fontPath, imagePath);
          LMComLib.Commerce.PDF.Faktura faktura = new LMComLib.Commerce.PDF.Faktura(context.Order.Id.ToString(), prijemce, dodavatel, detail, platba, fontPath, imagePath);
          List<LMComLib.Commerce.PDF.PolozkaFaktury> polozky = new List<LMComLib.Commerce.PDF.PolozkaFaktury>();
          foreach (OrderItem item in context.Order.Items) {
            polozky.Add(new LMComLib.Commerce.PDF.PolozkaFaktury(item.Licence.ShortTitle, item.Quantity.ToString(),
              urlInfo.priceText(context.Order.Site, multi * item.Price()),
              urlInfo.priceText(context.Order.Site, multi * item.PriceTax()), "20%", //DPH 20
              urlInfo.priceText(context.Order.Site, multi * (item.Quantity * item.PriceTax()))));
          }
          if (context.Order.Shipping > 0) {
            string _nazev = "";
            double _jedncena = context.Order.Shipping;
            double _jednCenaDPH = context.Order.Shipping + context.Order.ShippingTax;
            string _dphPercent = " 0%";

            if (context.Order.ShipMethod == ShippingMethods.posta) {
              _dphPercent = "20%"; //DPH 20
              _nazev = "Poštovné";
            } else if (context.Order.ShipMethod == ShippingMethods.PPL) {
              _dphPercent = "20%"; //DPH 20
              _nazev = "Doprava PPL";
            }
            if (context.Order.BillMethod == BillingMethods.Dobirka) {
              _nazev += " a dobírka";
            }
            polozky.Add(new LMComLib.Commerce.PDF.PolozkaFaktury(_nazev, "1",
              urlInfo.priceText(context.Order.Site, multi * _jedncena),
              urlInfo.priceText(context.Order.Site, multi * _jednCenaDPH), _dphPercent,
              urlInfo.priceText(context.Order.Site, multi * _jednCenaDPH)));
          }
          if (context.Order.Discount > 0) {
            polozky.Add(new LMComLib.Commerce.PDF.PolozkaFaktury(c_DiscountTitle, "1",
              "-" + urlInfo.priceText(context.Order.Site, multi * context.Order.Discount), "-" + urlInfo.priceText(context.Order.Site, (context.Order.Discount + context.Order.DiscountTax)), "20%", //DPH 20
              "-" + urlInfo.priceText(context.Order.Site, multi * (context.Order.Discount + context.Order.DiscountTax))));
          }
          faktura.PolozkyPlacene = polozky;

          List<LMComLib.Commerce.PDF.PolozkaCelkem> celkem = new List<LMComLib.Commerce.PDF.PolozkaCelkem>();
          celkem.Add(new LMComLib.Commerce.PDF.PolozkaCelkem("Daň", " 0%",
            urlInfo.priceText(context.Order.Site, (0)),
            urlInfo.priceText(context.Order.Site, (0))));
          celkem.Add(new LMComLib.Commerce.PDF.PolozkaCelkem("Daň", " 10%",
            urlInfo.priceText(context.Order.Site, (0)),
            urlInfo.priceText(context.Order.Site, (0))));
          celkem.Add(new LMComLib.Commerce.PDF.PolozkaCelkem("Daň", "20%", //DPH 20
            urlInfo.priceText(context.Order.Site, multi * context.Order.Tax),
            urlInfo.priceText(context.Order.Site, multi * context.Order.PriceForTax)));
          faktura.PolozkyCelkem = celkem;

          // faktura.CertNameCER = System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath + "App_Data\\" + System.Configuration.ConfigurationManager.AppSettings["MUZO.Cert.Public.LangMaster"];
          //faktura.CertNamePFX = System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath + "App_Data\\" + System.Configuration.ConfigurationManager.AppSettings["PDF.Cert"];
          faktura.CertNamePFX = System.Configuration.ConfigurationManager.AppSettings["PDF.Cert"];
          faktura.CertPFXPassword = System.Configuration.ConfigurationManager.AppSettings["PDF.Cert.Password"];
          MemoryStream ms = new MemoryStream();
          faktura.VytvorPDF(ms, docType);
          return ms;
    #endif
        }

     */

  }
}


