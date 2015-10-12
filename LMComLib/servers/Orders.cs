using System;
using System.Web;
using System.Web.SessionState;
using System.Diagnostics;
using System.Collections.Generic;
using System.Text;
using System.Xml.Serialization;
using System.Web.Hosting;
using System.Configuration;
using System.Data.Linq;
using System.Data.Linq.Mapping;
using System.Linq;

using LMNetLib;
using LMComData2;
using System.IO;
using LMComLib;
using LMWeb;
using System.Globalization;

namespace LMComData2 {
  public partial class Comm_Order {
    public byte[] ProformaX {
      get {
        if (string.IsNullOrEmpty(ProformaNew)) {
          if (Proforma == null) return null;
          return Proforma.ToArray();
        } else {
          XInvoice inv = XmlUtils.StringToObject<XInvoice>(ProformaNew);
          return ProsperLib.printInvoiceNew(inv);
        }
      }
    }
    public byte[] InvoiceX {
      get {
        if (string.IsNullOrEmpty(InvoiceNew)) {
          if (Invoice == null) return null;
          return Invoice.ToArray();
        } else {
          XInvoice inv = XmlUtils.StringToObject<XInvoice>(InvoiceNew);
          return ProsperLib.printInvoiceNew(inv);
        }
      }
    }
    public byte[] AdviceX {
      get {
        if (string.IsNullOrEmpty(AdviceNew)) {
          if (Invoice == null) return null;
          return Advice.ToArray();
        } else {
          XInvoice inv = XmlUtils.StringToObject<XInvoice>(AdviceNew);
          return ProsperLib.printInvoiceNew(inv);
        }
      }
    }
    public bool HasInvoiceX { get { return !string.IsNullOrEmpty(InvoiceNew) || Invoice != null; } }
    public bool HasProformaX { get { return !string.IsNullOrEmpty(ProformaNew) || Proforma != null; } }
  }
}

namespace LMComLib {

  /// <summary>
  /// Povolene metody platby
  /// </summary>
  [EnumDescrAttribute(typeof(BillingMethods), "Dobirka=Na dobírku,Prevod=Převodem,payMuzo=Platební karta,eBanka=eBanka,PayPal=Platba PayPal účet,PayPalCard=Platba PayPal karta,Seznam=Seznam")]
  public enum BillingMethods {
    no,
    Dobirka,
    Prevod,
    payMuzo,
    eBanka,
    PayPal,
    PayPalCard,
    Seznam,
    PayU,
  }

  /// <summary>
  /// Povolene metody dodani
  /// </summary>
  [EnumDescrAttribute(typeof(ShippingMethods), "posta=Česká pošta,PPL=PPL")]
  public enum ShippingMethods {
    no,
    posta,
    PPL,
  }

  /// <summary>
  /// Jeden radek objednavky
  /// </summary>
  public class OrderItem {
    public OrderItem() : base() { }

    public OrderItem(Order ord, ProductLicence licObj)
      : base() {
      ProsperId = licObj.ProsperId;
      dbId = licObj.ProductId;
      MyOrder = ord;
    }
    /// <summary>
    /// Identifikace produktu v ucetnictvi (skladajici se z ProductId a z Licence)
    /// </summary>
    public int ProsperId;
    /// <summary>
    /// Identifikace produktu v katalogu
    /// </summary>
    public int dbId;
    /// <summary>
    /// Jeho mnozstvi
    /// </summary>
    public int Quantity;
    /// <summary>
    /// Cena za jednotku
    /// </summary>
    public Currency? ExternalPrice;

    /// <summary>
    /// Licencni klic
    /// </summary>
    public string[] LicKey;

    public double Price() {
      if (ExternalPrice != null) return Order.RoundCurrency(((Currency)ExternalPrice).Price(Order.ActTaxPercent, MyOrder.SubSite, LicenceType));
      else return Licence.NormalPrice(MyOrder.SubSite);
      //return LicenceType != ProductLicenceType.multiPrice  ? Licence.NormalPrice() :
      //Order.RoundCurrency(((Currency)ExternalPrice).Price(Order.ActTaxPercent));
    }
    public double PriceToKc() {
      return LicenceType != ProductLicenceType.multiPrice ?
        Licence.NormalPrice(MyOrder.SubSite) :
        Order.RoundCurrency(((Currency)ExternalPrice).Price(Order.ActTaxPercent, MyOrder.SubSite, LicenceType));
    }
    public double PriceTax() {
      if (ExternalPrice != null) return Order.RoundCurrency(((Currency)ExternalPrice).PriceTax(Order.ActTaxPercent, MyOrder.SubSite, LicenceType));
      else return Licence.NormalPriceTax(MyOrder.SubSite);
      //return LicenceType != ProductLicenceType.multiPrice ? Licence.NormalPriceTax() :
      //Order.RoundCurrency(((Currency)ExternalPrice).PriceTax(Order.ActTaxPercent));
    }
    public double Tax() {
      return Licence.NormalTax(MyOrder.SubSite);
    }
    /// <summary>
    /// Typ licence k produktu
    /// </summary>
    [XmlIgnore]
    public ProductLicenceType LicenceType {
      get { return ProductLicence.getLicenceType(ProsperId); }
    }

    /// <summary>
    /// Product objekt
    /// </summary>
    //public Product Product {
    //get { return Licence.Prod; }
    //}
    [XmlIgnore]
    public Order MyOrder;
    [XmlIgnore]
    ProductLicence licence;
    /// <summary>
    /// Product objekt
    /// </summary>
    [XmlIgnore]
    public ProductLicence Licence {
      get {
        try {
          if (licence == null) {
            ProductCatalogueItem product = ProductCatalogue.get(dbId, MyOrder.Lang);
            licence = product==null ? null : product.Licences[LicenceType];
          }
          return licence;
        } catch (Exception exp) {
          throw new Exception(string.Format("dbId={0}, lang = {1}, licence={2}", dbId, MyOrder.Lang, LicenceType), exp);
        }
      }
    }
  }

  public enum OrderContentType {
    Electronic,
    Box,
    Both,
  }

  public interface ICurrencyRates {
    double EUR { get; }
    double USD { get; }
  }
  /// <summary>
  /// Objednavka, ukladatelna do Data sloupce Orders tabulky
  /// </summary>
  public class Order {

    public const Int64 lmcomUser = Int64.MaxValue - 123;

    public static ICurrencyRates CurrencyRates;

    public static int ActTaxPercent = int.Parse(ConfigurationManager.AppSettings["Fact.TaxPercent"] ?? "20");
    public static string Account = ConfigurationManager.AppSettings["Fact.account"];

    /// <summary>
    /// Identifikace objednavky v databazi
    /// </summary>
    public int Id {
      get {
        if (id == 0)
          id = (int)LMComDataProvider.getUniqueId(LMComDataProvider.uiOrderId);
        return id;
      }
      set { id = value; }
    } int id;

    /// <summary>
    /// Identifikace profilu
    /// </summary>
    public Int64 UserId;

    /// <summary>
    /// Site, na ktere byla faktura vystavena
    /// </summary>
    public Domains Site;

    /// <summary>
    /// SubSite, na ktere byla faktura vystavena
    /// </summary>
    public SubDomains SubSite;

    /// <summary>
    /// Měna objednávky
    /// </summary>
    public CurrencyType CurrType;

    public string NormCurrType {
      get { return CurrType == CurrencyType.csk ? "CZK" : CurrType.ToString().ToUpper(); }
    }

    /// <summary>
    /// Pro menu jinou nez CSK: kurz prepoctu
    /// </summary>
    public double CurrExchange;

    /// <summary>
    /// Transakcni naklady pro PayPal
    /// </summary>
    public double PaymentFee;

    /// <summary>
    /// Jazyk GUI v době vytvoření objednávky
    /// </summary>
    public Langs Lang;

    /// <summary>
    /// Informace o dodavateli, ZZ nebo RJ. Jmeno, ICO, cislo uctu apod.
    /// </summary>
    public XSupplier Supplier;

    public Ipn IPN;


    /// <summary>
    /// Oznaceni majitele webu, kde se prodavaji nase produkty. Seznam nebo LANGMaster
    /// </summary>
    public SupplierId SupplierId;

    /// <summary>
    /// Provize SupplierId (Seznamu) v procentech
    /// </summary>
    public double ProvisionPercent;

    /// <summary>
    /// Billing method
    /// </summary>
    public BillingMethods BillMethod;

    /// <summary>
    /// Shipping method
    /// </summary>
    public ShippingMethods ShipMethod;

    /// <summary>
    /// Transaction ID
    /// </summary>
    public string TransactionID;

    /// <summary>
    /// UTC datum vytvoreni objednavky
    /// </summary>
    public DateTime CreatedOn;

    /// <summary>
    /// UTC datum splatnosti
    /// </summary>
    public DateTime DueDate;

    /// <summary>
    /// Jednotlive radky objednavky
    /// </summary>
    public List<OrderItem> Items = new List<OrderItem>();

    /// <summary>
    /// Slevove kupony
    /// </summary>
    public List<Discount> Discounts = new List<Discount>();

    /// <summary>
    /// Typ obsah objednaky
    /// </summary>
    public OrderContentType ContentType {
      get {
        if (Items.Count == 0)
          return OrderContentType.Electronic;
        OrderContentType res = OrderContentType.Both;
        foreach (OrderItem oItem in Items) {
          if (oItem.Licence.LicenceOnly) {
            if (res == OrderContentType.Both)
              res = OrderContentType.Electronic;
            else if (res == OrderContentType.Box)
              return OrderContentType.Both;
          } else {
            if (res == OrderContentType.Both)
              res = OrderContentType.Box;
            else if (res == OrderContentType.Electronic)
              return OrderContentType.Both;
          }
        }
        return res;
      }
    }

    /// <summary>
    /// Pridani slevoveho kuponu
    /// </summary>
    /// <returns>false, kdyz kupon nelze pridat</returns>
    public bool addDiscount(Discount disc, out string msg) {
      msg = null;
      //Site
      if ((Domains)disc.Site != urlInfo.GetUrlInfo().SiteId) { msg = "Tento slevový kupón je určen pro jinou doménu (jiného prodejce)."; new CommerceEvent(CommerceEventIds.Error, msg, Id).Raise(); return false; }
      //datum
      if (disc.ValidTo != null && (DateTime)disc.ValidTo < DateTime.UtcNow.ToUniversalTime()) { msg = "Tomuto slevovému kupónu již vypršela doba platnosti"; new CommerceEvent(CommerceEventIds.Error, msg, Id).Raise(); return false; }
      //2x ta sama UniqueId sleva v teze objednavce
      foreach (Discount d in Discounts)
        if (d.UniqueId == disc.UniqueId) { msg = "Tento slevový kupón byl již přidán."; new CommerceEvent(CommerceEventIds.Error, msg, Id).Raise(); return false; }
      //nelze kumulovat slevy:
      if (!(bool)disc.CanCombine)
        foreach (Discount d in Discounts)
          if (!(bool)d.CanCombine) { msg = "Tento slevový kupón nelze kombinovat s jinými kupóny."; new CommerceEvent(CommerceEventIds.Error, msg, Id).Raise(); return false; }
      //Produkty
      if (disc.Products != null) {
        bool isOK = false;
        foreach (OrderItem it in Items) {
          foreach (int dp in disc.Products)
            if (it.ProsperId == dp) { isOK = true; break; }
          if (isOK) break;
        }
        if (!isOK) {
          msg = "Tento slevový kupón se vztahuje na jiné produkty než jsou v objednávce."; new CommerceEvent(CommerceEventIds.Error, msg, Id).Raise(); return false;
        }
      }
      //Kontrola v databazi
      if (!LMComLib.Discount.discountValid(disc.UniqueId)) {
        msg = "Tento slevový kupón byl již použit v jiné objednávce."; new CommerceEvent(CommerceEventIds.Error, msg, Id).Raise(); return false;
      }
      //Vse OK
      Discounts.Add(disc);
      Order.Instance.RefreshPrice();
      return true;
    }

    /// <summary>
    /// Odstrani discount daneho indexu. V GUI je tedy potreba si pamatovat index
    /// </summary>
    public void removeDiscount(int idx) {
      Discounts.RemoveAt(idx);
      Order.Instance.RefreshPrice();
    }

    public ProductCatalogueItem Fill(Ipn ipn, XCustommer cust) {
      IPN = ipn;
      Site = ipn.site;
      CurrType = ipn.mc_currency;
      PaymentFee = ipn.mc_fee;
      Lang = ipn.lng;
      TransactionID = ipn.txn_id;
      SupplierId = LMComLib.SupplierId.LANGMaster;
      BillMethod = BillingMethods.PayPal;
      CreatedOn = DueDate = DateTime.UtcNow;
      Profile = new ProfileData() { Email = cust.pri2, Address = new Address() { FirstName = cust.pri1, Street = cust.pri3, City = cust.pri4 } };
      OrderItem ordItem;
      int dbId = int.Parse(ipn.productId);
      ProductCatalogueItem prod = ProductCatalogue.get(dbId, Lang);
      Items.Add(ordItem = new OrderItem() {
        MyOrder = this,
        dbId = dbId,
        Quantity = 1,
        ExternalPrice = new Currency(ipn.mc_currency, ipn.mc_gross, true),
        LicKey = new string[] { ipn.licKey },
        ProsperId = ProductLicence.getProsperId(prod.CommerceId, ProductLicenceType.download)
      });
      CurrExchange = PayPalLow.CurrExchange2Kc(CurrType);
      RefreshPriceCom();
      return prod;
    }

    public static string productQuery(int dbId, ProductLicenceType? lic, int quantity, Currency? curr) {
      string res = "Add=" + dbId;
      if (quantity > 0) res += "&Quantity=" + quantity;
      if (lic != null) res += "&Lic=" + lic.ToString();
      if (curr != null) res += "&ExternalPrice=" + ((Currency)curr).AsString;
      return res;
    }

    /// <summary>
    /// preneseni informaci z query stringu do session (pres addProduct stranku)
    /// </summary>
    public class addProductObj {
      public addProductObj(HttpContext ctx, ProductLicenceType? defLic) {
        dbId = ctx.Request["Add"];
        quantity = ctx.Request["Quantity"];
        lic = defLic == null ? ctx.Request["Lic"] : defLic.ToString();
        curr = ctx.Request["ExternalPrice"];
      }
      public string dbId; public string lic; public string quantity; public string curr; public string referer;
    }

    public ProductLicence addProduct(addProductObj obj, out Currency? external) {
      int dbId; external = null;
      if (!Int32.TryParse(obj.dbId, out dbId)) return null;
      //LMComLib.Cms.Product prod = (LMComLib.Cms.Product)CacheItems.GetTemplate(dbId);
      ProductCatalogueItem prod = ProductCatalogue.get(dbId, Lang);
      ProductLicenceType prodLic = string.IsNullOrEmpty(obj.lic) ? ProductLicenceType.box : (ProductLicenceType)Enum.Parse(typeof(ProductLicenceType), obj.lic, true);
      ProductLicence licObj = prod.Licences[prodLic];
      int qty;
      if (!string.IsNullOrEmpty(obj.quantity) || !int.TryParse(obj.quantity, out qty)) qty = 1;
      if (!string.IsNullOrEmpty(obj.curr)) {
        Currency curr = new Currency();
        try {
          curr.AsString = obj.curr;
        } catch {
          throw new Exception(string.Format("Wrong ExternalPrice Query string 2: {0}", obj.curr));
        }
        addProduct(licObj, qty, curr);
        external = curr;
      } else
        addProduct(licObj, qty, null);
      RefreshPrice();
      return licObj;
    }

    public int addProduct(HttpRequest req) {
      int dbId;
      if (!Int32.TryParse(req.QueryString["Add"], out dbId)) return 0;
      //LMComLib.Cms.Product prod = (LMComLib.Cms.Product)CacheItems.GetTemplate(dbId);
      ProductCatalogueItem prod = ProductCatalogue.get(dbId, Lang);
      string lic = req.QueryString["Lic"];
      ProductLicenceType prodLic = string.IsNullOrEmpty(lic) ? ProductLicenceType.box : (ProductLicenceType)Enum.Parse(typeof(ProductLicenceType), lic, true);
      ProductLicence licObj = prod.Licences[prodLic];
      string qtyStr = req.QueryString["Quantity"];
      int qty;
      if (!string.IsNullOrEmpty(qtyStr) || !int.TryParse(qtyStr, out qty)) qty = 1;
      string extPrice = req.QueryString["ExternalPrice"];
      if (!string.IsNullOrEmpty(extPrice)) {
        Currency curr = new Currency();
        try {
          curr.AsString = extPrice;
        } catch {
          throw new Exception(string.Format("Wrong ExternalPrice Query string 2: {0}", extPrice));
        }
        addProduct(licObj, qty, curr);
      } else
        addProduct(licObj, qty, null);
      RefreshPrice();
      return licObj.ProsperId;
    }

    /// <summary>
    /// obsahuje produkt z zadanym ProsperId
    /// </summary>
    public OrderItem findItem(int ProsperId) {
      foreach (OrderItem it in Items)
        if (it.ProsperId == ProsperId)
          return it;
      return null;
    }

    /// <summary>
    /// Pridani produktu
    /// </summary>
    public void addProduct(ProductLicence licObj, int quantity, Currency? externalPrice) {
      OrderItem item = findItem(licObj.ProsperId);
      if (item != null) {
        item.Quantity += quantity;
        return;
      }
      item = new OrderItem(this, licObj);
      item.Quantity = quantity;
      item.ExternalPrice = externalPrice;
      Items.Add(item);
      //new CommerceEvent("Add to basket", CommerceEventIds.AddToBasket, Id).Raise();
      Order.Instance.RefreshPrice();
    }

    /*void addProduct(ProductLicence licObj, int quantity) {
      addProduct(licObj, quantity);
    }*/

    /// <summary>
    /// Odstrani radek s produktem
    /// </summary>
    /// <param name="productId"></param>
    public void removeProduct(int prosperId) {
      for (int i = 0; i < Items.Count; i++)
        if (Items[i].ProsperId == prosperId) {
          Items.RemoveAt(i); break;
        }
      Order.Instance.RefreshPrice();
    }

    /// <summary>
    /// odstrani vsechny produkty i discounty
    /// </summary>
    public void removeAll() {
      Items.Clear();
      Discounts.Clear();
      BillMethod = BillingMethods.no;
      ShipMethod = ShippingMethods.no;
      RefreshPrice();
    }

    /// <summary>
    /// Zmìní poèet produktù
    /// </summary>
    public void updateQuantity(int prosperId, int quantity) {
      foreach (OrderItem it in Items)
        if (it.ProsperId == prosperId) {
          it.Quantity = quantity;
          return;
        }
      //new CommerceEvent("Update to basket", CommerceEventIds.AddToBasket, productId).Raise();
      Order.Instance.RefreshPrice();
    }


    //**** kumulovane udaje, aktuaizovane v RefreshPrice
    /// <summary>
    /// Celkova cena bez dane
    /// </summary>
    public double Price;
    /// <summary>
    /// Celkova cena s dani
    /// </summary>
    public double PriceTax;
    /// <summary>
    /// Celkova dan
    /// </summary>
    public double Tax;
    /// <summary>
    /// Dan v procentech
    /// </summary>
    public int TaxPercent;
    /// <summary>
    /// Sleva
    /// </summary>
    public double Discount;
    /// <summary>
    /// DPH pro slevu
    /// </summary>
    public double DiscountTax;
    /// <summary>
    /// Jakou cast ceny zbozi zakaznik plati po sleve
    /// </summary>
    public double DiscountRatio;
    /// <summary>
    /// Provize v korunach
    /// </summary>
    public double Provision;
    /// <summary>
    /// Cena za dopravu bez DPH
    /// </summary>
    public double Shipping;
    /// <summary>
    /// Tax za dopravu (pro PPL)
    /// </summary>
    public double ShippingTax;
    /// <summary>
    /// Cena za zbozi plus postovne = zaklad pro cenu s nenulovou dani
    /// </summary>
    public double PriceForTax;
    /// <summary>
    /// Zaokrouhlení ceny objednávky
    /// </summary>
    public double Rounded;
    /// <summary>
    /// Aktualizuje kumulativni udaje
    /// </summary>
    /// <returns></returns>
    /// 

    public static double GetShipping(bool incTax) {
      return double.Parse(ConfigurationManager.AppSettings["Order." + (incTax ? "ShippingTax" : "Shipping")]);
    }

    public void RefreshPrice() {
      Price = 0; PriceTax = 0; Tax = 0; Discount = 0; Shipping = 0; ShippingTax = 0; DiscountRatio = 1; Rounded = 0; Provision = 0;
      TaxPercent = Order.ActTaxPercent;
      if (Items.Count == 0) return;
      //*** Soucet cen produktu bez dane:
      double soucetCenBezDPH = 0;
      foreach (OrderItem it in Items)
        soucetCenBezDPH += it.Price() * it.Quantity;
      //*** Sleva:
      //1. discount v penezich
      foreach (Discount disc in Discounts)
        if (disc.Amount != null)
          Discount += ((Currency)disc.Amount).Price(TaxPercent, SubDomains.no, ProductLicenceType.box);
      //2. discount v procentech
      double rest = soucetCenBezDPH - Discount;
      if (soucetCenBezDPH > 0) {
        foreach (Discount disc in Discounts)
          if (disc.Percent != null)
            Discount += rest * (double)disc.Percent / 100;
      }
      if (Discount > soucetCenBezDPH) Discount = soucetCenBezDPH;
      DiscountRatio = 1 - (double)Discount / soucetCenBezDPH;
      //Provize v procentech
      //if (ProvisionPercent==0) ProvisionPercent = Suppliers.find(SupplierId).Provision;
      //*** Shipping
      //PZ - postovne s dani vzdy
      switch (ShipMethod) {
        case ShippingMethods.posta:
        case ShippingMethods.PPL:
          switch (BillMethod) {
            case BillingMethods.Dobirka:
              Shipping = GetShipping(false);
              ShippingTax = GetShipping(true) - Shipping;
              break;
            default:
              Shipping = GetShipping(false);
              ShippingTax = GetShipping(true) - Shipping;
              break;
          }
          break;
      }

      //*** zbytek
      DiscountTax = Discount * (double)TaxPercent / 100; //DPH slevy
      PriceForTax = soucetCenBezDPH * DiscountRatio; // cena za zbozi po sleve: cena, ze ktere se pocita dan
      Price = PriceForTax + Shipping; //celkova cena bez dane
      if (ShippingTax > 0)
        PriceForTax = PriceForTax + Shipping;
      Tax = PriceForTax * (double)TaxPercent / 100; //tax za zbozi a dopravu
      PriceTax = Price + Tax; //cena s dani
      //Zaokrouhlení


      Discount = Order.RoundCurrency(Discount);
      DiscountTax = Order.RoundCurrency(DiscountTax);
      PriceForTax = Order.RoundCurrency(PriceForTax);
      Tax = Order.RoundCurrency(Tax);

      PriceTax = Order.RoundTotalCurrency(PriceTax);

      //Rounded = Math.Floor(100*((Price - (products * DiscountRatio + Shipping))));
      //if (ShippingTax > 0) {
      //  toRound = (Price - (products * DiscountRatio + Shipping));
      //  Rounded = Math.Round(toRound + (toRound < 0 ? 0.005 : -0.005), 2, MidpointRounding.AwayFromZero);
      //} else {
      Rounded = Math.Round(PriceTax - Tax - Price, 2);
      Price = Order.RoundCurrency(Price);
      //}
      Provision = PriceForTax * ProvisionPercent / 100;

    }

    public void RefreshPriceCom() {
      Price = 0; PriceTax = 0; Tax = 0; Discount = 0; Shipping = 0; ShippingTax = 0; DiscountRatio = 1; Rounded = 0; ProvisionPercent = 0; Provision = 0;
      TaxPercent = Order.ActTaxPercent;
      if (Items.Count == 0) return;
      //*** Soucet cen produktu bez dane:
      double soucetCenBezDPH = 0;
      foreach (OrderItem it in Items)
        soucetCenBezDPH += it.Price() * it.Quantity;
      //*** Sleva:
      //1. discount v penezich
      foreach (Discount disc in Discounts)
        if (disc.Amount != null)
          Discount += ((Currency)disc.Amount).Price(TaxPercent, SubDomains.no, ProductLicenceType.box);
      //2. discount v procentech
      double rest = soucetCenBezDPH - Discount;
      if (soucetCenBezDPH > 0) {
        foreach (Discount disc in Discounts)
          if (disc.Percent != null)
            Discount += rest * (double)disc.Percent / 100;
      }
      if (Discount > soucetCenBezDPH) Discount = soucetCenBezDPH;
      DiscountRatio = 1 - (double)Discount / soucetCenBezDPH;
      //Provize v procentech
      //ProvisionPercent = Suppliers.find(SupplierId).Provision;
      //*** Shipping
      //PZ - postovne s dani vzdy
      switch (ShipMethod) {
        case ShippingMethods.posta:
        case ShippingMethods.PPL:
          switch (BillMethod) {
            case BillingMethods.Dobirka:
              Shipping = GetShipping(false);
              ShippingTax = GetShipping(true) - Shipping;
              break;
            default:
              Shipping = GetShipping(false);
              ShippingTax = GetShipping(true) - Shipping;
              break;
          }
          break;
      }

      //*** zbytek
      DiscountTax = Discount * (double)TaxPercent / 100; //DPH slevy
      PriceForTax = soucetCenBezDPH * DiscountRatio; // cena za zbozi po sleve: cena, ze ktere se pocita dan
      Price = PriceForTax + Shipping; //celkova cena bez dane
      if (ShippingTax > 0)
        PriceForTax = PriceForTax + Shipping;
      Tax = PriceForTax * (double)TaxPercent / 100; //tax za zbozi a dopravu
      PriceTax = Price + Tax; //cena s dani
      //Zaokrouhlení


      Discount = Order.RoundCurrency(Discount);
      DiscountTax = Order.RoundCurrency(DiscountTax);
      PriceForTax = Order.RoundCurrency(PriceForTax);
      Tax = Order.RoundCurrency(Tax);

      PriceTax = Order.RoundTotalCurrency(PriceTax);

      //Rounded = Math.Floor(100*((Price - (products * DiscountRatio + Shipping))));
      //if (ShippingTax > 0) {
      //  toRound = (Price - (products * DiscountRatio + Shipping));
      //  Rounded = Math.Round(toRound + (toRound < 0 ? 0.005 : -0.005), 2, MidpointRounding.AwayFromZero);
      //} else {
      Rounded = Math.Round(PriceTax - Tax - Price, 2);
      Price = Order.RoundCurrency(Price);
      //}
      Provision = PriceForTax * ProvisionPercent / 100;

    }

    /// <summary>
    /// Vrati aktualni objednavku ze session. Neexistuje-li, vytvori ji. 
    /// </summary>
    public static string reqId = Guid.NewGuid().ToString();

    public static Order CreateInstance(Domains site, SubDomains subSite, Langs lang) {
      Order res = new Order();
      //res.Id = (int)LMComDataProvider.getUniqueId(LMComDataProvider.uiOrderId);
      //Logging.Trace(System.Diagnostics.TraceLevel.Info, TraceCategory.All, "Order.Instance " + res.Id);
      res.UserId = -1; //Oprava PZ 1.12.08. ID usera neni v dobe zalozeni objednavky znam, ve wiyardovi se muze zmenit (bylo LMStatus.Profile.Id)
      res.CreatedOn = DateTime.UtcNow.ToUniversalTime();
      Int32 days;
      if (Int32.TryParse(System.Configuration.ConfigurationManager.AppSettings["Faktura.Splatnost"], out days))
        res.DueDate = DateTime.UtcNow.AddDays(days).ToUniversalTime();
      res.Site = site;
      res.SubSite = subSite;
      res.Lang = lang;
      //Doplneni dodavatele pro vypocet provize
      switch (res.Site) {
        case Domains.cz:
          res.SupplierId = SupplierId.LANGMaster;
          res.ProvisionPercent = 0;
          res.CurrType = CurrencyType.csk;
          break;
        case Domains.sz:
          res.SupplierId = SupplierId.Seznam;
          res.ProvisionPercent = 20;
          res.CurrType = CurrencyType.csk;
          break;
        case Domains.com:
          res.SupplierId = SupplierId.LANGMaster;
          res.ProvisionPercent = 0;
          res.CurrType = SubDomain.subDomainToCurr(subSite);
          break;
        default:
          throw new Exception("Missing code here");
      }
      res.Supplier = new XSupplier().Fill(site, subSite, lang);
      //res.SupplierId = Provisions.getSupplierId(res.Site, LMStatus.Profile);
      //TODO: upresnit stat
      //res.KodStatu = "CZ";
      return res;
    }
    public static Order Instance {
      get {
        HttpSessionState ses = HttpContext.Current.Session;
        //Debug.Assert(ses != null, "ses != null");
        Order res = (Order)ses[reqId];
        if (res != null) return res;
        try {
          urlInfo ui = urlInfo.GetUrlInfo();
          //Debug.Assert(ui != null, "ui != null");
          if (ui.SiteId == Domains.cz)
            res = CreateInstance(Domains.com, SubDomains.com_cz, ui.LangId);
          else
            res = CreateInstance(ui.SiteId, ui.SubSite, ui.LangId);
          ses[reqId] = res;
          //new CommerceEvent(CommerceEventIds.OrderCreate, res.Id).Raise();
          return res;
        } catch (Exception exp) {
          throw new Exception("UserId=" + LMStatus.Cookie.id, exp);
        }
      }
    }

    public static void setInstance(Order ord) {
      HttpContext.Current.Session[reqId] = ord;
    }
    public static string SessionPayPalReturn = Guid.NewGuid().ToString();

    /// <summary>
    /// Vymaze objednavku ze sessionstate
    /// </summary>
    public static void ClearInstance() {
      //Order res = (Order)HttpContext.Current.Session[reqId];
      //if (res!=null)
      //Logging.Trace(System.Diagnostics.TraceLevel.Info, TraceCategory.All, "Order.ClearInstance " + res.Id);
      HttpContext.Current.Session.Remove(reqId);
      HttpContext.Current.Session.Remove(SessionPayPalReturn);
    }

    double getKc(double price) {
      return CurrExchange == 0 ? price : Order.RoundTotalCurrency(price * CurrExchange);
    }

    double getOrig(double price) {
      return CurrExchange == 0 ? price : Order.RoundTotalCurrency(price / CurrExchange);
    }

    public static Int64 adjustUser(LMComDataContext db, int id) {
      long userId = Order.lmcomUser + id;
      if (lmcomUserExist) return userId;
      var obj = db.Users.Where(u => u.Id == userId).Select(u => new { u.Id }).FirstOrDefault();
      if (obj == null) {
        LMComDataContext dbUser = Machines.getContext();
        User usr = new User() {
          Id = userId,
          Created = minValue,
          LastRequest = minValue,
          ActivationMailSent = minValue,
          Data = ""
        };
        dbUser.Users.InsertOnSubmit(usr);
        dbUser.SubmitChanges();
      }
      lmcomUserExist = true;
      return userId;
    }
    static bool lmcomUserExist = false;
    static DateTime minValue = new DateTime(1900, 1, 1);

    public Comm_Order InsertLow(LMComDataContext db, Int64 userId, OrderStatus status) {
      Comm_Order ord = new Comm_Order();
      db.Comm_Orders.InsertOnSubmit(ord);
      ord.Id = Id;
      ord.UserId = userId; //PZ oprava 30.3.08 LMStatus.Profile.Id;
      ord.Created = CreatedOn;
      ord.DueDate = DueDate;
      ord.Site = (short)Site;
      //ord.Subsite = (short)SubSite;
      ord.SupplierId = (short)SupplierId;
      ord.PayPalTransaction = TransactionID;
      ord.Ico = Supplier == null ? null : Supplier.ico;
      ord.Data = getAsString();
      ord.Price = getKc(PriceTax);
      ord.BillMethod = (short)BillMethod;
      ord.ShipMethod = (short)ShipMethod;
      ord.Provision = getKc(Provision);
      ord.Status = (short)status;
      ord.StatusDate = DateTime.UtcNow;
      ord.ContentType = (short)ContentType;
      ord.Lang = (short)Lang;

      //ulozeni ProductInfos a Licencors
      RefreshOrderData(db);

      return ord;
    }

    /// <summary>
    /// Uplatni slevove kupony a ulozi objednavku (vcetne Licencors a ProductInfo tabulek) do databaze
    /// </summary>
    public bool Save(OrderDBContext ctx, int? oldOrderId) {
      lock (typeof(Order)) { // pro jistotu. Stejny lock se pouziva i v Intranet Save order operacich
        //priprava discounts:
        if (oldOrderId == null) {
          if (!LMComLib.Discount.UseDiscounts(ctx, Discounts)) { ClearInstance(); return false; }
        }
        //Dosazeni aktualniho profilu: pouze pri prvnim ulozeni objednavky
        if (Profile == null) {
          Profile = LMStatus.Profile;
          LMComDataProvider.WriteProfileEx(Profile, true);
          UserId = Profile.Id;
        }
        switch (CurrType) {
          case CurrencyType.eur: CurrExchange = CurrencyRates.EUR; break;
          case CurrencyType.usd: CurrExchange = CurrencyRates.USD; break;
          case CurrencyType.csk: break;
          default: throw new Exception("Missing code here");
        }
        //priprava objednavky:
        ctx.orderDb = InsertLow(ctx.db, UserId, OrderStatus.Prijata);
        /*Comm_Order ord = new Comm_Order();
        ctx.db.Comm_Orders.InsertOnSubmit(ord);
        ctx.orderDb = ord;
        ord.Id = Id;
        ord.UserId = UserId; //PZ oprava 30.3.08 LMStatus.Profile.Id;
        ord.Created = CreatedOn;
        ord.DueDate = DueDate;
        ord.Site = (short)Site;
        ord.SupplierId = (short)SupplierId;
        ord.PayPalTransaction = TransactionID;
        ord.Ico = Supplier.ico;
        ord.Data = getAsString();
        ord.Price = getKc(PriceTax);
        ord.BillMethod = (short)BillMethod;
        ord.ShipMethod = (short)ShipMethod;
        ord.Provision = getKc(Provision);
        ord.Status = (short)OrderStatus.Prijata;
        ord.StatusDate = DateTime.UtcNow;
        ord.ContentType = (short)ContentType;

        //ulozeni ProductInfos a Licencors
        RefreshOrderData(ctx.db);*/

        //Move discount ze stare objednavky na novou
        if (oldOrderId != null)
          LMComLib.Discount.MoveDiscounts((int)oldOrderId, this.Id, ctx.db);
      }
      //Vyrazeni objednavky ze Session
      ClearInstance();
      return true;
    }

    public class RoyalityItem {
      public int OrderId { get; set; }
      public string Currency { get; set; }
      public DateTime Payed { get; set; }
      public string LicenceType { get; set; }
      public int Quantity { get; set; }
      public double NetPrice { get; set; }
      public double NetLicPrice { get; set; }
      public double LicFee { get; set; }
      public string Title { get; set; }
      public string Customer { get; set; }
      public int LicencorId;
      public CourseIds CrsId { get; set; }
    }

    public IEnumerable<RoyalityItem> Royality(DateTime date) {
      double provision = (double)ProvisionPercent / 100;
      foreach (OrderItem it in Items) {
        if (it.Licence == null) continue;
        double productPrice = getKc(it.Price());
        double ListPrice = productPrice * it.Quantity;
        double Discount = ListPrice * (1 - DiscountRatio);
        double Provision = (ListPrice - Discount) * provision;
        double actPrice = ListPrice - Discount - Provision - getKc(PaymentFee);
        double Cost = it.LicenceType == ProductLicenceType.download ? 0.0 : (double)it.Quantity * ((Currency)it.Licence.ProductionCost).Amount;
        //try { if (it.Licence.Licencors == null) continue; } catch { continue; }
        if (it.Licence.Licencors != null)
          foreach (ProductRoyality li in it.Licence.getRoyalities(Lang, it.LicenceType)) {
            RoyalityItem res = new RoyalityItem() {
              OrderId = Id,
              Payed = date,
              Customer = Profile.Email,
              Currency = CurrType.ToString().ToUpper()
            };
            res.CrsId = it.Licence.CourseId;
            res.Quantity = it.Quantity;
            res.Title = ProductCatalogueItems.Instance.getBestTitle(it.dbId, new Langs[] { Langs.en_gb, Langs.cs_cz }); //ProductCatalogueItems.Instance.getEx(it.dbId);
            RoyalityTableItem licData = RoyalityTable.royalityTableItem(li.RoyalityTableItemId);
            res.LicencorId = licData.Id;
            res.LicenceType = licData.FriendlyId;
            //Odecteni nakladu na vyrobu z ceny produktu (pouze pro nektere licencory)
            res.NetPrice = getOrig(licData.SubstractProductCost ? actPrice - Cost : actPrice);
            //Zaklad pro vypocet licence
            res.NetLicPrice = res.NetPrice * (double)li.Percent / 100;
            //Licencni poplatek
            res.LicFee = res.NetLicPrice * (double)licData.Percent / 100;
            yield return res;
          }
      }
    }

    public void RefreshOrderData(LMComData2.LMComDataContext db) {
      double provision = (double)ProvisionPercent / 100;
      foreach (OrderItem it in Items) {
        LMComData2.ProductInfo pi = new LMComData2.ProductInfo();
        db.ProductInfos.InsertOnSubmit(pi);
        double productPrice = getKc(it.Price());
        pi.ListPrice = productPrice * it.Quantity;
        pi.Discount = pi.ListPrice * (1 - DiscountRatio);
        pi.Provision = (pi.ListPrice - pi.Discount) * provision;
        pi.Cost = it.LicenceType == ProductLicenceType.download ? 0.0 : (double)it.Quantity * ((Currency)it.Licence.ProductionCost).Amount;
        double actPrice = pi.ListPrice - pi.Discount - pi.Provision - getKc(PaymentFee);
        pi.OrderId = Id;
        pi.ProductId = it.ProsperId;
        pi.Quantity = (short)it.Quantity;
        double licenceAll = 0;
        if (it.Licence.Licencors != null)
          foreach (ProductRoyality li in it.Licence.getRoyalities(Lang, it.LicenceType)) {
            RoyalityTableItem licData = RoyalityTable.royalityTableItem(li.RoyalityTableItemId);
            //Odecteni nakladu na vyrobu z ceny produktu (pouze pro nektere licencory)
            double basePrice = licData.SubstractProductCost ? actPrice - pi.Cost : actPrice;
            //Zaklad pro vypocet licence
            double newVal = basePrice * (double)li.Percent / 100;
            //Pridani do licInfos
            double feeVal = newVal * (double)licData.Percent / 100;

            Licencor lic = new Licencor();
            db.Licencors.InsertOnSubmit(lic);
            lic.OrderId = Id;
            lic.LicencorId = (short)licData.Id;
            lic.Quantity = pi.Quantity;
            lic.Kc = newVal;
            lic.FeeKc = feeVal;
            lic.ProductId = it.dbId;
            lic.Licence = (short)ProductLicence.getLicenceType(it.ProsperId);

            licenceAll += feeVal;
          }
        pi.Licence = licenceAll;
        pi.Profit = pi.ListPrice - pi.Discount - pi.Cost - pi.Provision - pi.Licence;
      }
    }


    public bool Save(OrderDBContext ctx) {
      return Save(ctx, null);
    }

    /*public bool Save(OrderDBContext ctx, int oldId) {
      return SaveLow(ctx, oldId);
    }*/

    //public void OnStorno(OrderDBContext ctx) {
    //  ctx.db.ExecuteCommand("DELETE FROM Licencors WHERE OrderId=" + ctx.OrderId);
    //  ctx.db.ExecuteCommand("DELETE FROM ProductInfo WHERE OrderId=" + ctx.OrderId);
    //  //archivace storno faktury
    //  XInvoice inv = XmlUtils.StringToObject<XInvoice>(ctx.OrderDb.AdviceNew);
    //  byte[] data = ProsperLib.printInvoiceNew(inv).ToArray();
    //  Intranet.archiveInvoice(inv, data, true);
    //  /*using (System.Data.SqlClient.SqlConnection con = new System.Data.SqlClient.SqlConnection(Machines.LMDataConnectionString())) {
    //    con.Open();
    //    System.Data.SqlClient.SqlCommand del = new System.Data.SqlClient.SqlCommand("DELETE FROM Licencors WHERE OrderId=" + ctx.Order.Id.ToString(), con);
    //    del.ExecuteNonQuery();
    //    del = new System.Data.SqlClient.SqlCommand("DELETE FROM ProductInfo WHERE OrderId=" + ctx.Order.Id.ToString(), con);
    //    del.ExecuteNonQuery();
    //    con.Close();
    //  }*/
    //}

    public ProfileData Profile;
    /// <summary>
    /// Serializace
    /// </summary>
    public string getAsString() {
      //Profile = ctx.Profile;// LMComDataProvider.getProfileFromCache(UserId);
      return XmlUtils.ObjectToString(this);
    }

    /// <summary>
    /// Deserializace
    /// </summary>
    public static Order setAsString(string s) {
      Order res = (Order)XmlUtils.StringToObject(s, typeof(Order));
      foreach (OrderItem it in res.Items)
        it.MyOrder = res;
      return res;
    }

    /// <summary>
    /// Poèet míst k zaokrouhlení
    /// </summary>
    private const int decimals = 1;
    /// <summary>
    /// Úèetní zaokrouhlení položky
    /// </summary>
    /// <param name="value">hodnota k zaokrouhlení</param>
    /// <returns></returns>
    public static double RoundCurrency(double value) {
      return Convert.ToDouble(Math.Round(Convert.ToDecimal(value), decimals));
    }

    /// <summary>
    /// Úèetní zaokrouhlení celé sumy
    /// </summary>
    /// <param name="value">hodnota k zaokrouhlení</param>
    /// <returns></returns>
    public static double RoundTotalCurrency(double value) {
      double reminder = value - Math.Floor(value);
      if (reminder < 0.3)
        return Math.Floor(value);
      else if (reminder >= 0.3 && reminder < 0.8)
        return Math.Floor(value) + 0.5;
      //else if (reminder >= 0.8)
      return Math.Ceiling(value);
    }
  }

  public class OrderDBContext {
    /*
    ProsperData.Context prosperDB;
    public ProsperData.Context ProsperDB {
      get {
        if (prosperDB == null) prosperDB = Machines.ProsperData();
        return prosperDB;
      }
    }*/
    public LMComDataContext _db;
    public OrderDBContext() {
    }
    public OrderDBContext(LMComDataContext db) {
      this._db = db;
    }
    public LMComDataContext db {
      get { if (_db == null) { _db = Machines.getContext(); _db.CommandTimeout = 100000; } return _db; }
    }
    public OrderDBContext(int orderId) {
      OrderId = orderId; order = null; orderDb = null; //supplier = null; 
    }
    public OrderDBContext(Comm_Order orderDb) {
      OrderId = orderDb.Id; order = null; this.orderDb = orderDb; //supplier = null; 
    }
    public OrderDBContext(Comm_Order orderDb, Order order) {
      OrderId = orderDb.Id; this.order = order; this.orderDb = orderDb; //supplier = null; 
    }
    public OrderDBContext(Order order) {
      OrderId = order.Id; this.order = order; this.orderDb = null; //supplier = null; 
    }
    public int OrderId;
    public Comm_Order orderDb;
    public Comm_Order OrderDb {
      get {
        if (orderDb == null) {
          orderDb = db.Comm_Orders.Single<Comm_Order>(o => o.Id == OrderId);
        }
        return orderDb;
      }
    }
    public bool OrderDbExists {
      get {
        if (orderDb == null) orderDb = db.Comm_Orders.SingleOrDefault<Comm_Order>(o => o.Id == OrderId);
        return orderDb != null;
      }
    }
    public int? pdfDocumentId(DocumentType docType) {
      switch (docType) {
        case DocumentType.invoice: return OrderDb.InvoiceId;
        case DocumentType.proforma: return OrderDb.ProformaId;
        case DocumentType.adviceOfCredit: return OrderDb.AdviceId;
        default: throw new Exception("Missing code here");
      }
    }
    /*public Binary pdfDocument(DocumentType docType) {
      switch (docType) {
        case DocumentType.invoice: return OrderDb.Invoice;
        case DocumentType.proforma: return OrderDb.Proforma;
        case DocumentType.adviceOfCredit: return OrderDb.Advice;
        default: throw new Exception("Missing code here");
      }
    }
    public void setPdfDocument(DocumentType docType, byte[] value) {
      switch (docType) {
        case DocumentType.invoice: OrderDb.Invoice = value; return;
        case DocumentType.proforma: OrderDb.Proforma = value; return;
        case DocumentType.adviceOfCredit: OrderDb.Advice = value; return;
        default: throw new Exception("Missing code here");
      }
    }
     */
    public string pdfDocumentNew(DocumentType docType) {
      return pdfDocumentNew(OrderDb, docType);
    }
    public static string pdfDocumentNew(Comm_Order OrderDb, DocumentType docType) {
      switch (docType) {
        case DocumentType.invoice: return OrderDb.InvoiceNew;
        case DocumentType.proforma: return OrderDb.ProformaNew;
        case DocumentType.adviceOfCredit: return OrderDb.AdviceNew;
        default: throw new Exception("Missing code here");
      }
    }
    public void setPdfDocumentNew(OrderDBContext context, DocumentType docType) {
      XInvoice val = ProsperLib.createXInvoice(context.Order, new XCustommer(context.Profile), docType);
      string valStr = val == null ? null : XmlUtils.ObjectToString(val);
      switch (docType) {
        case DocumentType.invoice: OrderDb.InvoiceNew = valStr; return;
        case DocumentType.proforma: OrderDb.ProformaNew = valStr; return;
        case DocumentType.adviceOfCredit: OrderDb.AdviceNew = valStr; return;
        default: throw new Exception("Missing code here");
      }
    }
    public static byte[] loadPdf(int orderId, DocumentType docType) {
      LMComData2.LMComDataContext db = Machines.getContext();
      LMComData2.Comm_Order ord = db.Comm_Orders.FirstOrDefault(o => o.Id == orderId);
      switch (docType) {
        case DocumentType.invoice: return ord.InvoiceX;
        case DocumentType.proforma: return ord.ProformaX;
        default: throw new Exception();
      }
      //string invStr = pdfDocumentNew(db.Comm_Orders.FirstOrDefault(o => o.Id == orderId), docType);
      //return ProsperLib.printInvoiceNew(XmlUtils.StringToObject<XInvoice>(invStr));
    }
    public void setPdfDocumentId(DocumentType docType, int value) {
      switch (docType) {
        case DocumentType.invoice: OrderDb.InvoiceId = value; return;
        case DocumentType.proforma: OrderDb.ProformaId = value; return;
        case DocumentType.adviceOfCredit: OrderDb.AdviceId = value; return;
        default: throw new Exception("Missing code here");
      }
    }
    public Order order;
    public Order Order {
      get {
        if (order == null)
          order = Order.setAsString(OrderDb.Data);
        return order;
      }
    }
    /*public Int64 UserId {
      get {
        //if (profile != null) return profile.Id;
        //else 
        if (order != null && order.UserId>0) return order.UserId;
        else if (orderDb != null) return orderDb.UserId;
        else return LMStatus.Profile.Id;
        //else throw new Exception();
      }
    }*/
    //ProfileData profile;
    public ProfileData Profile {
      get {
        ProfileData res = Order.Profile == null ? LMStatus.Profile : Order.Profile;
        if (res == null || (res.Id != Order.UserId && OrderDb.Status < (short)OrderStatus.DobirkaOdeslana)) {
          res = ProfileData.setAsString(db.Users.Where(u => u.Id == Order.UserId).Select(u => u.Data).Single());
          Order.Profile = res;
        }
        return res;
        //if (profile == null) {
        //profile = LMComDataProvider.readProfile(UserId);
        //Int64 id = db.Users.Where(u => u.Id == orderDb.UserId);
        //profile = LMComDataProvider.getProfileFromCache(UserId); // LMComDataProvider.readProfile(orderDb.UserId);
        //profile = ProfileData.setAsString(usr.Data);
        //}
        //return profile;
      }
    }
    /*Supplier supplier;
    public Supplier Supplier {
      get {
        if (supplier == null) {
          supplier = Suppliers.find((SupplierId)orderDb.SupplierId);
          if (supplier == null) throw new Exception(string.Format("SupplierId=", orderDb.SupplierId));
        }
        return (Supplier)supplier;
      }
    }*/

    public void Save() {
      if (_db != null) _db.SubmitChanges();
    }

    public void Clear() {
      OrderId = 0;
      _db = null;
      //supplier = null;
      order = null;
      orderDb = null;
      //prosperDB = null;
    }

  }

  [EnumDescrAttribute(typeof(SupplierId), "LANGMaster=LANGMaster,Seznam=Seznam")]
  public enum SupplierId {
    no,
    LANGMaster,
    Seznam,
  }

  /*/// <summary>
  /// Virtualni dodavatel, ma pouze vlastni radu dokumentu v ucetnictvi
  /// </summary>
  public class Supplier {
    /// <summary>
    /// Cislo, definujici radu dokumentu v Prosperu
    /// </summary>
    public SupplierId Id;
    /// <summary>
    /// User friendly titulek virtualniho dodavatele
    /// </summary>
    //public string Title;
    /// <summary>
    /// Provize v procentech
    /// </summary>
    public double Provision;
    //pointer na Suppliers.Company
    [XmlIgnore]
    public Company Company;
  }

  public class CompanyAccount {
    public CurrencyType CurrType;
    public string Number;
  }
  /// <summary>
  /// Danovy subjekt pro fakturaci
  /// </summary>
  /*public class Company {
    public string AccountNo(CurrencyType currType) {
      foreach (CompanyAccount acc in Accounts)
        if (currType == acc.CurrType) return acc.Number;
      throw new Exception();
    }
    public string Title;
    public int TaxPercent; //dan na produkty
    public string DIC;
    public string Street;
    public string ZIP;
    public string City;
    public string IC;
    public string Bank;
    //public string AccountNo;
    public CompanyAccount[] Accounts;
    public string SWIFT;
    public string TradeRegister;

    public string contactTitle;
    public string contactStreet;
    public string contactZIP;
    public string contactCity;
    public string contactPhone;
    public string contactFax;
  }
  /*public class Suppliers {
    static Suppliers instance;
    public static Suppliers Instance {
      get {
        if (instance == null) {
          instance = (Suppliers)XmlUtils.FileToObject(HostingEnvironment.ApplicationPhysicalPath + "app_data/suppliers.xml", typeof(Suppliers));
          foreach (Supplier s in instance.Items) s.Company = instance.Company;
        }
        return instance;
      }
    }
    public static Supplier find(SupplierId id) {
      foreach (Supplier s in Instance.Items)
        if (s.Id == id) return s;
      throw new Exception("Cannot find supplier, id=" + id.ToString());
    }
    public Supplier[] Items;
    public Company Company;
  }*/
}


