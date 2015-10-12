using System;
using System.Data;
using System.Collections;
using System.Linq;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Text;
using System.Web;
using System.Web.Security;
using System.Web.Hosting;
using System.Globalization;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Xml;
using System.Xml.Serialization;
using System.Reflection;
using System.Xml.Schema;
using System.Threading;

using LMNetLib;
using LMComLib;

namespace LMComLib.Cms {

  //public static class PageRanges {
  //  //Stranka (vcetne jejich potomku) je na celou sirku stranky, bez praveho sloupce
  //  public static bool hasBlankPageMaster(int id) {
  //    switch (id) {
  //      case -301:
  //      case -302:
  //      case -303:
  //      case -304:
  //        return true;
  //      default:
  //        return false;
  //    }
  //  }
  //}
  /*
  /// <summary>
  /// Odkaz na licencor data u produktu
  /// </summary>
  public class LicenceItem {

    public LicenceItem() { }

    public LicenceItem(int licencor, double percent) {
      Licencor = licencor; Percent = percent;
    }
    /// <summary>
    /// ID licencora v ciselniku (odpovida Licencor.Id)
    /// </summary>
    public int Licencor;
    /// <summary>
    /// Kolikatina produktu odpovida licencovanemu produktu
    /// </summary>
    public double Percent;
    //public double AmountKc;
    //public bool SubstractProductCost;
  }*/

  /// <summary>
  /// Objekt pro Prosper vazbu mezi polozkou faktury a skladem
  /// </summary>
  //public class ProductForStack {
  //  public ProductForStack(ProductLicence lic) {
  //    Id = lic.ProsperId.ToString();
  //    Title = lic.ShortTitle;
  //    StackAble = lic.StockAble;
  //  }
  //  public ProductForStack(string id, string title, bool stockAble) {
  //    Id = id;
  //    Title = title;
  //    StackAble = stockAble;
  //  }
  //  /// <summary>
  //  /// Nase identifikace produktu
  //  /// </summary>
  //  public string Id;
  //  /// <summary>
  //  /// Priznak: jedna se o zbozi (=true) nebo specialni kartu (false)
  //  /// </summary>
  //  public bool StackAble;
  //  /// <summary>
  //  /// Jmeno skladove karty
  //  /// </summary> 
  //  public string Title;
  //}


  //public class ProductAppDataItem {
  //  public string LocUrl;
  //  public string LocDownloadUrl;
  //}

  //[CmsPageAttribute(PageType.Page, "Produkt")]
  //public class Product : LMPageTemplate {

  //  //Seznam ruznych licenci s cenami
  //  public ProductLicence[] LicenceList;

  //  public double PADUsdPrice;
  //  public double PADEurPrice;
  //  public string COMScreenShot;
  //  public bool HideOnLmcom;

  //  //Identifikace stranky v download centru (napr. Anglictina-Cambridge oznacuje ~/site/web/lang/pages/Download/Anglictina-Cambridge.aspx). 
  //  //Chybi-li, bere se stejne jmeno jako je jmeno LMP souboru.
  //  public string DownloadCentrumUrl;

  //  //kvuli Gopasu: explicitne zadane nelokalizovatelne hodnoty
  //  public string Url;
  //  public string BuyUrl;

  //  public ProductIcons Icons;

  //  //Identifikace stranky s popisem produktu. 
  //  //Chybi-li, bere se stejne jmeno jako je jmeno LMP souboru.
  //  //public string ProductUrl;

  //  //Identifikace online kurzu
  //  //public CourseIds CourseId;

  //  /// <summary>
  //  /// Identifikac produktu pro eCommerce
  //  /// </summary>
  //  [IntAttribute(90, "ID pro eCommerce", Default = 0)]
  //  public int? CommerceId;

  //  public bool pageOnly() {
  //    return CommerceId != null && (int)CommerceId == -1;
  //  }

  //  /// <summary>
  //  /// "Vase cena": v podstate plati tato cena, UnitPrice se pouze zobrazuje
  //  /// </summary>
  //  [CurrencyAttribute(110, "Vaše cena", DefaultAmount = 0, DefaultTyp = CurrencyType.csk, DefaultWithWat = true)]
  //  public Currency? Discount;

  //  /// <summary>
  //  /// Pro ucetnictvi: obsahuje skladovou kartu
  //  /// </summary>
  //  [BoolAttribute(180, "Účtuje se do skladu", Default = false)]
  //  public bool? StockAble;

  //  /// <summary>
  //  /// Vyrobni naklady
  //  /// </summary>
  //  [CurrencyAttribute(112, "Výrobní náklady", DefaultTyp = CurrencyType.csk, DefaultWithWat = true)]
  //  public Currency? ProductionCost;

  //  /// <summary>
  //  /// Informace o licencnich poplatcich
  //  /// </summary>
  //  //[LicenceFeeAttribute(170, "Licenční poplatky")]
  //  //public ProductRoyality[] ProductRoyalities;

  //  [StringAttribute(78, "Krátký titulek", Type = StringType.SingleLine)]
  //  public string ShortTitle;

  //  [StringAttribute(80, "Perex", Type = StringType.Html)]
  //  public string Perex;

  //  public LineIds Line; //zatrideni do skupiny produktu
  //  public Langs[] LocalizedTo; //produkt je lokalizovan do jazyku...
  //  public Langs[] LocalizedToFake; //Fake lokalizace, pouze kvuli SEO
  //  public bool? WithDict; //priznak - produkt se slovnikem

  //  public ET_SiteMapId ET_SiteMapId; //pro ET produkty: typ produktu

  //  /// <summary>
  //  /// Jedna se pouze o prodej licence, nikoliv krabice apod.
  //  /// </summary>
  //  /*public bool LicenceOnly {
  //    get { return CourseId != CourseIds.no; }
  //  }*/

  //  void adjustLicenceList() {
  //    if (LicenceList != null && LicenceList.Length > 0) return;
  //    LicenceList = new ProductLicence[] { 
  //      new ProductLicence() {
  //        Licence = ProductLicenceType.box,
  //        LicPrice = (Currency)Discount
  //      }
  //    };
  //  }

  //  [XmlIgnore]
  //  Dictionary<ProductLicenceType, ProductLicence> licences;
  //  [XmlIgnore]
  //  public Dictionary<ProductLicenceType, ProductLicence> Licences {
  //    get {
  //      return null;
  //      //if (licences == null)
  //      //  try {
  //      //    licences = new Dictionary<ProductLicenceType, ProductLicence>();
  //      //    adjustLicenceList();
  //      //    /*if (LicenceList == null || LicenceList.Length <= 0) {
  //      //      ProductLicence noLic = new ProductLicence();
  //      //      noLic.MyProd = ProductCatalogue.get(Info.dbId, Langs.cs_cz);
  //      //      noLic.Licence = ProductLicenceType.box;
  //      //      noLic.LicPrice = (Currency)Discount;
  //      //      licences.Add(noLic.Licence, noLic);
  //      //    } else*/
  //      //    foreach (ProductLicence lic in LicenceList) {
  //      //      lic.MyProd = ProductCatalogue.get(Info.dbId, Langs.cs_cz);
  //      //      licences.Add(lic.Licence, lic);
  //      //    }

  //      //  } catch (Exception exp) {
  //      //    throw new Exception(string.Format("DBId={0}, CommerceId={1}", Info.dbId, CommerceId), exp);
  //      //  }
  //      //return licences;
  //    }
  //  }

  //  public double ProductPriceTax() {
  //    return Order.RoundCurrency(((Currency)Discount).PriceTax(Order.ActTaxPercent, SubDomains.no, ProductLicenceType.box));
  //  }

  //  //public UniversalDataItem getData() {
  //  //  UniversalDataItem res = new UniversalDataItem(this, Perex, Info.AbsVisibleUrl(), middleImg());
  //  //  res.price = ProductPriceTax();
  //  //  res.pageOnly = pageOnly();
  //  //  return res;
  //  //}

  //  /*Properties, "zdedene" od predchudcu
  //  string Title; //Jmeno produktu
  //  int dbId; //Identifikace produktu
  //  this.Info.Url() //URL s produktem
  //  */
  //  [StringAttribute(85, "Body", Type = StringType.Html)]
  //  public string Body;

  //  /// <summary>
  //  /// Cena produktu: soucasti Currency je i měna a zdali se jedná o cenu s daní či bez daně.
  //  /// </summary>
  //  [CurrencyAttribute(100, "Cena", DefaultAmount = 0, DefaultTyp = CurrencyType.csk, DefaultWithWat = true)]
  //  public Currency? UnitPrice;

  //  /// <summary>
  //  /// Ukazatel na obrazek s produktem. Jeho URL je napr. v Image.Info.Url()
  //  /// </summary>
  //  [PointerAttributes(140, "3 boxy (od největšího)", FilterType = PageFilter.Img)]
  //  public int[] boxImg;
  //  [XmlIgnore]
  //  public CacheNode[] BoxImg;

  //  public CacheNode smallImg() {
  //    if (BoxImg == null || BoxImg.Length < 3) return null;
  //    return BoxImg[2];
  //  }
  //  public CacheNode middleImg() {
  //    if (BoxImg == null || BoxImg.Length < 2) return null;
  //    return BoxImg[1];
  //  }
  //  public CacheNode bigImg() {
  //    if (BoxImg == null || BoxImg.Length < 1) return null;
  //    return BoxImg[0];
  //  }


  //  ///// Screenshoty
  //  ///// </summary>
  //  //[PointerAttributes(142, "Screenshoty", FilterType = PageFilter.Img)]
  //  //public int[] screenShots;
  //  //[XmlIgnore]
  //  //public CacheNode[] ScreenShots;

  //  ///// <summary>
  //  ///// Svazane produkty. Pristup je pres Product pr = (Product) Related[i].getTemplate();
  //  ///// </summary>
  //  //[PointerAttributes(150, "'Viz též produtky", Classes = new Type[] { typeof(Product) })]
  //  //public int[] related;
  //  //[XmlIgnore]
  //  //public CacheNode[] Related;

  //  ///// <summary>
  //  ///// Svazane produkty
  //  ///// </summary>
  //  //[PointerAttributes(160, "'Viz též' komplety", Classes = new Type[] { typeof(Product) })]
  //  //public int[] packages;
  //  //[XmlIgnore]
  //  //public CacheNode[] Packages;

  //  ///// <summary>
  //  ///// Ocenění
  //  ///// </summary>
  //  //[PointerAttributes(162, "Ocenění", Classes = new Type[] { typeof(UniversalItem) })]
  //  //public int[] prices;
  //  //[XmlIgnore]
  //  //public CacheNode[] Prices;

  //  ///// <summary>
  //  ///// Ocenění
  //  ///// </summary>
  //  //[PointerAttributes(163, "Partneři", Classes = new Type[] { typeof(UniversalItem) })]
  //  //public int[] partners;
  //  //[XmlIgnore]
  //  //public CacheNode[] Partners;

  //  //[IntAttribute(165, "Pořadí v obsahu kompletů", Default = 0)]
  //  //public int? KompletOrder;

  //  ///// <summary>
  //  ///// Další informace pro AppData databazi
  //  ///// </summary>
  //  //public ProductAppDataItem AppDataItem;

  //  //public double ListPrice() {
  //  //  return Order.RoundCurrency(((Currency)UnitPrice).Price(Order.ActTaxPercent, SubDomains.no, ProductLicenceType.box));
  //  //}

  //  //public double ListPriceTax() {
  //  //  return Order.RoundCurrency(((Currency)UnitPrice).PriceTax(Order.ActTaxPercent, SubDomains.no, ProductLicenceType.box));
  //  //}
  //  ///*public double Price() {
  //  //  return Order.RoundCurrency(((Currency)Discount).Price(Order.ActTaxPercent));
  //  //}
  //  //public double Tax() {
  //  //  return Order.RoundCurrency(((Currency)Discount).Tax(Order.ActTaxPercent));
  //  //}*/

  //  //public override string ContentControlUrl() {
  //  //  return "~/cz/Web/Controls/Products/Product.ascx";
  //  //}

  //  /*public ProductCatalogueItem CreateProductCatalogue(Domains site) {
  //    ProductCatalogueItem res = AppDataItem != null ? AppDataItem : new ProductCatalogueItem();
  //    res.ProductId = Info.dbId;
  //    res.site = site;
  //    res.LicenceList = LicenceList;
  //    res.seeAlso = related;
  //    res.CommerceId = (int)CommerceId;
  //    res.Discount = (Currency)Discount;
  //    res.StockAble = StockAble == null ? false : (bool)StockAble;
  //    res.ProductionCost = ProductionCost == null ? new Currency(CurrencyType.csk, 0.0) : (Currency)ProductionCost;
  //    res.ProductRoyalities = ProductRoyalities;
  //    return res;
  //  }*/

  //  //public DsgnProduct dsgnCreateProduct(Domains site) {
  //  //  DsgnProduct res = new DsgnProduct();
  //  //  res.ProductId = Info.dbId;
  //  //  res.site = site;
  //  //  res.HideOnLmcom = HideOnLmcom;
  //  //  adjustLicenceList();
  //  //  res.LicenceList = LicenceList.Where(lic => lic.LicPrice.Amount > 0 || lic.LicPrice.Ptr != null || lic.LicPrice.SubSites != null).ToArray();// LicenceList;
  //  //  //res.LicenceList = Licences.Values.Where(lic => lic.LicPrice.Amount > 0 || lic.LicPrice.Ptr != null).ToArray();// LicenceList;
  //  //  if (res.LicenceList == null || res.LicenceList.Length == 0)
  //  //    return null;
  //  //  res.seeAlso = related;
  //  //  res.CommerceId = (int)CommerceId;
  //  //  res.Discount = (Currency)Discount;
  //  //  res.StockAble = StockAble == null ? false : (bool)StockAble;
  //  //  res.ProductionCost = ProductionCost == null ? new Currency(CurrencyType.csk, 0.0) : (Currency)ProductionCost;
  //  //  res.ProductRoyalities = ProductRoyalities;
  //  //  res.PADUsdPrice = PADUsdPrice;
  //  //  res.Icons = Icons;
  //  //  res.PADEurPrice = PADEurPrice;
  //  //  res.COMScreenShot = COMScreenShot;
  //  //  res.ET_SiteMapId = ET_SiteMapId;
  //  //  return res;
  //  //}
  //}

  public enum UniversalCategory {
    no,
    comment,
    news,
    price,
    reference,
  }

  //public abstract class UniversalItemLow : LMPageTemplate {
  //  [StringAttribute(100, "Perex", Type = StringType.Html)]
  //  public string Perex;

  //  [StringAttribute(110, "Text", Type = StringType.Html)]
  //  public string Body;

  //}

  //[CmsPageAttribute(PageType.Page, "Help stránka")]
  //public class HelpItem : UniversalItemLow {
  //  public override string ContentControlUrl() {
  //    return "~/cz/Web/Controls/HelpPage.ascx";
  //  }
  //  public UniversalDataItem getData() {
  //    CacheNode nd = null;
  //    UniversalDataItem res = new UniversalDataItem(this, Perex, null, nd);
  //    return res;
  //  }
  //  [PointerAttributes(200, "Viz též...", FilterType = PageFilter.Page, IncGlobal = false, Classes = new Type[] { typeof(HelpItem) })]
  //  public int[] items;
  //  [XmlIgnore]
  //  public CacheNode[] Items;

  //}

  //[CmsPageAttribute(PageType.Page, "Obecná položka/stránka")]
  //public class UniversalItem : UniversalItemLow {

  //  [StringAttribute(105, "Podtitulek", Type = StringType.MultiLine)]
  //  public string Subtitle;

  //  [PointerAttribute(120, "Ikona", IncGlobal = true, Classes = new Type[] { typeof(ImgTemplate) })]
  //  public int? icon;
  //  [XmlIgnore]
  //  public CacheNode Icon;

  //  [DateAttribute(130, "Datum")]
  //  public DateTime? Date;

  //  [PointerAttribute(140, "Odkaz", IncGlobal = true)]
  //  public int? reference;
  //  [XmlIgnore]
  //  public CacheNode Reference;

  //  [StringAttribute(150, "Externí odkaz")]
  //  public string ExtReference;

  //  public UniversalDataItem getData() {
  //    string url = null;
  //    switch (Category) {
  //      case UniversalCategory.price: break;
  //      case UniversalCategory.news:
  //      case UniversalCategory.reference:
  //        if (!string.IsNullOrEmpty(Body)) url = Info.AbsVisibleUrl();
  //        else if (Reference != null) url = Reference.Info.AbsVisibleUrl();
  //        else if (!string.IsNullOrEmpty(ExtReference)) url = ExtReference;
  //        break;
  //      default:
  //        if (Reference != null) url = Reference.Info.AbsVisibleUrl();
  //        else if (!string.IsNullOrEmpty(ExtReference)) url = ExtReference;
  //        if (url == null) url = Info.AbsVisibleUrl();
  //        break;
  //    }
  //    UniversalDataItem res = new UniversalDataItem(this, Perex, url, Icon);
  //    if (Date != null) res.date = (DateTime)Date;
  //    res.subtitle = Subtitle;
  //    return res;
  //  }
  //  public override string ContentControlUrl() {
  //    return "~/cz/Web/Controls/Page.ascx";
  //  }

  //  UniversalCategory? category;
  //  [XmlIgnore]
  //  public UniversalCategory Category {
  //    get {
  //      if (category == null) {
  //        SiteMapNode nd = node;
  //        while (nd != null) {
  //          string catStr = nd["category"];
  //          if (!string.IsNullOrEmpty(catStr)) {
  //            category = (UniversalCategory)Enum.Parse(typeof(UniversalCategory), catStr, true);
  //            break;
  //          }
  //          nd = nd.ParentNode;
  //        }
  //        if (category == null) category = UniversalCategory.no;
  //      }
  //      return (UniversalCategory)category;
  //    }
  //  }
  //}

  //[EnumDescrAttribute(typeof(BoxType), "TopTen=TopTen,IconTableSmall=IconTableSmall,IconTableLarge=IconTableLarge,SubTree=SubTree,CaseStudies=CaseStudies,Actions=Actions,Comments=Comments,News=News")]
  //public enum BoxType {
  //  no,
  //  //do prave listy
  //  TopTen,
  //  IconTableSmall,
  //  IconTableLarge,
  //  SubTree,
  //  //na home, prostredni bar
  //  CaseStudies,
  //  Actions,
  //  Comments,
  //  //na home, levy bar
  //  News,
  //}

  //public abstract class BoxData : PageTemplate {
  //  public abstract BoxType? Type { get; set; }
  //  public virtual object getDataSource() {
  //    return null;
  //  }
  //}

  //[CmsPageAttribute(PageType.Control, "Seznam obecných položek box")]
  //public class UniversalItemBox : BoxData {

  //  BoxType? type;
  //  [EnumAttribute(100, "Typ boxu", typeof(BoxType))]
  //  public override BoxType? Type {
  //    get { return type; }
  //    set { type = value; }
  //  }

  //  [PointerAttributes(200, "Seznam odkazů", FilterType = PageFilter.Page, IncGlobal = false, Classes = new Type[] { typeof(UniversalItem) })]
  //  public int[] items;
  //  [XmlIgnore]
  //  public CacheNode[] Items;

  //  public override object getDataSource() {
  //    return UniversalDataItem.CreateDataSource(Items);
  //  }

  //  [StringAttribute(210, "Text pro Více...", Type = StringType.SingleLine)]
  //  public string MoreText;

  //  [PointerAttribute(220, "Odkaz pro Více...", IncGlobal = false)]
  //  public int? moreUrl;
  //  [XmlIgnore]
  //  public CacheNode MoreUrl;

  //}

  //[CmsPageAttribute(PageType.Control, "Top 10 box")]
  //public class TopTenBox : BoxData {

  //  [XmlIgnore]
  //  public override BoxType? Type {
  //    get { return BoxType.TopTen; }
  //    set { }
  //  }

  //  [PointerAttributes(200, "Seznam produktů", FilterType = PageFilter.Page, IncGlobal = false, Classes = new Type[] { typeof(Product) })]
  //  public int[] products;
  //  [XmlIgnore]
  //  public CacheNode[] Products;

  //  public override object getDataSource() {
  //    return UniversalDataItem.CreateDataSource(Products);
  //  }
  //}

  //[CmsPageAttribute(PageType.Control, "SubsiteMap box")]
  //public class SubsiteMapBox : BoxData {

  //  [XmlIgnore]
  //  public override BoxType? Type {
  //    get { return BoxType.SubTree; }
  //    set { }
  //  }

  //  [PointerAttribute(200, "Root", FilterType = PageFilter.Page)]
  //  public int? root;
  //  [XmlIgnore]
  //  public CacheNode Root;

  //}

  //[CmsPageAttribute(PageType.MasterPage, "Rozvržení")]
  //public class Master : PageTemplate {

  //  [PointerAttributes(110, "Seznam pravých boxů", FilterType = PageFilter.Page, IncGlobal = false, Classes = new Type[] { typeof(UniversalItemBox), typeof(TopTenBox), typeof(SubsiteMapBox) })]
  //  public int[] rightBoxes;
  //  [XmlIgnore]
  //  public CacheNode[] RightBoxes;

  //}

  public abstract class LMPageTemplate : PageTemplate {

    static LMPageTemplate() {
      if (LibConfig.Usage == LibUsage.LMComWebAdmin) return;
      loadMasters();
    }

    static void loadMasters() {
      blankAspx = StringUtils.FileToString(HostingEnvironment.ApplicationPhysicalPath + @"cz\Blank.aspx");
      twoColumnAspx = StringUtils.FileToString(HostingEnvironment.ApplicationPhysicalPath + @"cz\TwoColumns.aspx");
      threeColumnAspx = StringUtils.FileToString(HostingEnvironment.ApplicationPhysicalPath + @"cz\ThreeColumns.aspx");
    }

    public static string twoColumnAspx = null;
    public static string threeColumnAspx = null;
    public static string blankAspx = null;

    //public override string PageAspx() {
    //  loadMasters();
    //  if (this is HomePage)
    //    return threeColumnAspx;
    //  SiteMapNode nd = urlInfo.GetUrlInfo().Node;
    //  while (true) {
    //    string dbId = nd["dbId"];
    //    if (string.IsNullOrEmpty(dbId)) break;
    //    if (PageRanges.hasBlankPageMaster(int.Parse(dbId)))
    //      return blankAspx;
    //    nd = nd.ParentNode;
    //    if (nd == null)
    //      break;
    //  }
    //  return twoColumnAspx;
    //  //return isHome() ? threeColumnAspx : twoColumnAspx;
    //}

    /*public virtual bool isHome() {
      return false;
    }*/

    //public static void Init() {
    //  Template.InitTypes(typeof(Test), typeof(ImgTemplate), typeof(Product), typeof(UniversalItem), typeof(HelpItem),
    //    typeof(TopTenBox), typeof(SubsiteMapBox), typeof(Master), typeof(HomePage), typeof(UniversalItemBox));
    //}
  }

  //[CmsPageAttribute(PageType.Page, "Hlavní stránka")]
  //public class HomePage : LMPageTemplate {

  //  /*public override bool isHome() {
  //    return true;
  //  }*/

  //  [StringAttribute(195, "Body", Type = StringType.Html)]
  //  public string Body;

  //  [PointerAttribute(200, "Seznam levých boxů", FilterType = PageFilter.Page, IncGlobal = false, Classes = new Type[] { typeof(UniversalItemBox) })]
  //  public int? news;
  //  [XmlIgnore]
  //  public CacheNode News;

  //  [PointerAttributes(210, "Seznam středních boxů", FilterType = PageFilter.Page, IncGlobal = false, Classes = new Type[] { typeof(UniversalItemBox) })]
  //  public int[] centerBoxes;
  //  [XmlIgnore]
  //  public CacheNode[] CenterBoxes;

  //}

}