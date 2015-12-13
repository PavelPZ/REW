using System;
using System.Collections.Generic;
using System.Text;
using System.Web;
using System.Xml.Serialization;
using System.Data.Linq;
using System.Data.Linq.Mapping;
using System.Linq;
using System.Web.Hosting;
using MoreLinq;
using LMNetLib;

namespace LMComLib {

  [Flags]
  public enum ProductIcons {
    CourseKids = 0x1,
    Course4 = 0x2,
    Course3 = 0x4,
    Course2 = 0x8,
    Course13 = 0x10,
    Course1 = 0x20,
    DictAudio92000 = 0x40,
    DictAudio73000 = 0x80,
    DictAudio65000 = 0x100,
    DictAudio60000 = 0x200,
    DictAudio55000 = 0x400,
    DictAudio29000 = 0x800,
    Dict60000 = 0x1000,
    Dict5500 = 0x2000,
    Dict4800 = 0x4000,
    Dict3000 = 0x8000,
    Dict15000 = 0x10000,
    Dict12000 = 0x20000,
    DictAudio50000 = 0x40000,
    DictAudio200000 = 0x80000,
    DictUnknown = 0x100000,
    Video12 = 0x200000,
    Mp313 = 0x400000,
    Mp31 = 0x800000,

    Download = 0x1000000,
    Box = 0x2000000,

    isCourse = Course1 | Course13 | CourseKids | Course4 | Course3,
    isDict = DictAudio92000 | DictAudio73000 | DictAudio65000 | DictAudio60000 | DictAudio55000 | DictAudio29000 | Dict60000 |
      Dict5500 | Dict4800 | Dict3000 | Dict15000 | Dict12000 | DictAudio50000 | DictAudio200000 | DictUnknown,
    isMP3 = Mp31 | Mp313 | Video12
  }

  /************************** Products.XML: vyukova data **************************/
  /// <summary>
  /// Statické informace o produktech z pohledu vyukovych dat kurzech
  /// </summary>
  public class ProductInfos {
    public ProductInfo[] Items;
    public int Version;
    public int BasicVersion;
    [XmlIgnore]
    Dictionary<string, ProductInfo> SpaceToProduct = new Dictionary<string, ProductInfo>();
    [XmlIgnore]
    Dictionary<string, CourseInfo> SpaceToCourse = new Dictionary<string, CourseInfo>();
    [XmlIgnore]
    Dictionary<CourseIds, ProductInfo> ProductIdToProduct = new Dictionary<CourseIds, ProductInfo>();
    [XmlIgnore]
    Dictionary<CourseIds, CourseInfo> CourseIdToCourseInfo = new Dictionary<CourseIds, CourseInfo>();
    static ProductInfos instance;
    public static ProductInfo GetProduct(string spaceId) {
      ProductInfo res;
      if (spaceId != null && Instance.SpaceToProduct.TryGetValue(spaceId.ToLowerInvariant(), out res)) return res;
      return Instance.Items[0];
    }
    public static ProductInfo GetProduct(CourseIds prodId) {
      ProductInfo res;
      if (Instance.ProductIdToProduct.TryGetValue(prodId, out res)) return res;
      return Instance.Items[0];
    }
    public static ProductInfo GetProductEx(CourseIds prodOrCourseId) {
      ProductInfo res;
      CourseInfo crsInfo;
      if (Instance.ProductIdToProduct.TryGetValue(prodOrCourseId, out res)) return res;
      if (Instance.CourseIdToCourseInfo.TryGetValue(prodOrCourseId, out crsInfo)) return crsInfo.Owner;
      return null;
    }
    public static CourseInfo GetCourse(string spaceId) {
      CourseInfo res;
      if (spaceId != null && Instance.SpaceToCourse.TryGetValue(spaceId.ToLowerInvariant(), out res)) return res;
      return Instance.Items[0].Courses[0];
    }
    public static CourseIds SpaceIdToCourseId(string spaceId) {
      return GetCourse(spaceId).Id;
    }
    public static CourseInfo GetCourse(CourseIds courseId) {
      CourseInfo res;
      if (Instance.CourseIdToCourseInfo.TryGetValue(courseId, out res)) return res;
      throw new Exception("Cannot find course " + courseId.ToString());
    }
    static CourseIds[] DuplicatedSpacesIgnores;
    public static ProductInfos Instance {
      get {
        lock (typeof(ProductInfos)) {
          if (instance != null) return instance;
          string igns = System.Configuration.ConfigurationManager.AppSettings["DuplicatedSpacesIgnores"];
          if (igns != null) DuplicatedSpacesIgnores = igns.Split(',').Select(s => (CourseIds)Enum.Parse(typeof(CourseIds), s)).ToArray();
          //SpaceToProductIgnores
          //instance = (ProductInfos)XmlUtils.FileToObject(System.Configuration.ConfigurationManager.AppSettings["courseInfo"], typeof(ProductInfos));
          //string ignoreProduct = 
          instance = (ProductInfos)XmlUtils.FileToObject(Machines.basicPath + @"rew\LMCom\App_Data\Products.xml", typeof(ProductInfos));
          foreach (ProductInfo prod in instance.Items) {
            try {
              prod.owner = instance;
              instance.ProductIdToProduct.Add(prod.Id, prod);
              if (prod.Courses != null)
                foreach (CourseInfo crs in prod.Courses) {
                  crs.Owner = prod;
                  instance.CourseIdToCourseInfo.Add(crs.Id, crs);
                  if (DuplicatedSpacesIgnores != null && !DuplicatedSpacesIgnores.Contains(prod.Id))
                    foreach (string sp in crs.Spaces) {
                      instance.SpaceToProduct.Add(sp.ToLowerInvariant(), prod);
                      instance.SpaceToCourse.Add(sp.ToLowerInvariant(), crs);
                    }
                }
            } catch (Exception e) {
              throw new Exception(prod.Id.ToString(), e);
            }
          }
          return instance;
        }
      }
    }
  }

  /// <summary>
  /// Jedna informace o kurzu, ulozena v /CourseConfig.xml
  /// </summary>
  public class ProductInfo {
    public CourseIds Id; //identifikace kurzu
    public CourseInfo[] Courses;
    public LineIds Line; //obor kurzu
    public bool HasRightPanel = true; //ma pravy panel
    public string Icon = null; //identifikace ikony pro run.exe, setup.exe apod.
    public string ProducerCss = null; //class vlevo do chladice
    public string HomeUrl; //hlavni stranka pro CD ROM
    public string OnlineHomeUrl; //hlavni stranka pro online
    public string Footnote; //typ paticky
    public string Lang = "en-GB"; //difotni jazyk jako zdroj pro lokalizaci
    public int RegTrial; //delka trial doby ve dnech
    public CourseIds[] RegAlso; //produkty, ktere se s timto produktem licencuji
    public bool RegLimitedFree; //Limited verze je zadarmo
    public string RunExeTabs; // konfigurace Tabu v run.exe
    //parametrizace setupu, viz Framework/Deployment/setup_download.iss.aspx
    public string Inst_path;
    public string Inst_product;
    public string Inst_productId;
    public string Inst_productLong;
    public string Inst_groupName;
    public string Inst_splashSmallImage;
    public string Inst_setupIcon;

    public IEnumerable<CourseIds> RegAlsoAll(bool incSelf) {
      if (incSelf) yield return Id;
      if (RegAlso == null) yield break;
      foreach (CourseIds crs in RegAlso)
        foreach (CourseIds subCrs in ProductInfos.GetProduct(crs).RegAlsoAll(true))
          yield return subCrs;
    }

    public bool IsOldToNew; //jedna se o kurzy prevadene ze stare technologie
    int version;
    public int Version //aktualni verze
    {
      get { return owner == null || version > 0 ? version : owner.Version; }
      set { version = value; }
    }
    int basicVersion;
    public int BasicVersion //verze, ze ktere se dela aktualizace
    {
      get { return owner == null || basicVersion > 0 ? basicVersion : owner.BasicVersion; }
      set { basicVersion = value; }
    }
    [XmlIgnore]
    public ProductInfos owner;
  }

  /************************** AppData databaze: informace o produktech z pohledu commerce **************************/
  /// <summary>
  /// Optimalni nacitani produktu pres cache
  /// Umoznuje najit lokalizovany produkt pres ProductId, CommerceId nebo CourseId+Site
  /// </summary>
  public static class ProductCatalogue {

    /*public static Domains normalizeSite(Domains site) {
      return site == Domains.download ? Domains.com : site;
    }*/

    public static string CourseUrl(CourseIds crsId) {
      ProductInfo info = ProductInfos.GetProduct(crsId);
      return urlInfo.GetUrl(LMApps.ea, "/" + info.OnlineHomeUrl);
    }
    public static ProductCatalogueItem getCourse(CourseIds courseId, Domains site, Langs lang) {
      //site = normalizeSite(site);
      return ProductCatalogueItems.Instance.getCourse(courseId, site, lang);
    }
    public static ProductLicence getFirstLicenceFromAllCommerce(int prosperId/*, Langs lang*/) {
      return ProductCatalogueItems.Instance.getFirstLicenceFromAllCommerce(prosperId/*, lang*/);
    }

    public static ProductCatalogueItem get(int productId, Langs lang) {
      return ProductCatalogueItems.Instance.get(productId, lang);
    }
    public static ProductCatalogueItem getViaUrl(string fileName, bool noDict, Domains site, Langs lang) {
      //site = normalizeSite(site);
      ProductCatalogueItem item = ProductCatalogueItems.Instance.Products.
        Where(pr => pr.site == site && fileName == pr.FileName && (pr.WithDict == null || (bool)pr.WithDict != noDict)).
        SelectMany(pr => pr.LocItems).
        Where(lic => lic.lang == lang).First();
      return item;
    }
  }

  public class ProductCatalogueItems {
    public static ProductCatalogueItems instance;
    public static ProductCatalogueItems Instance {
      get {
        if (instance != null) return instance;
        lock (typeof(ProductCatalogueItems)) {
          if (instance != null) return instance;
          instance = (ProductCatalogueItems)XmlUtils.FileToObject(
            Machines.basicPath + @"rew\LMCom\App_Data\ProductCatalogue.xml",
            typeof(ProductCatalogueItems));
          instance.Finish();
          return instance;
        }
      }
    }
    public List<DsgnProduct> Products;
    public void Finish() {
      LocProducts = new Dictionary<Langs, List<ProductCatalogueItem>>();
      lock (typeof(VirtualImg)) {
        foreach (DsgnProduct prod in Products) {
          VirtualImg.registerImg(prod.SmallImgData);
          if (prod.LocItems != null)
            foreach (ProductCatalogueItem pi in prod.LocItems) {
              pi.Owner = prod;
              List<ProductCatalogueItem> langProd;
              if (!LocProducts.TryGetValue(pi.lang, out langProd)) {
                langProd = new List<ProductCatalogueItem>();
                LocProducts.Add(pi.lang, langProd);
              }
              langProd.Add(pi);
              //VirtualImg.registerImg(pi.MiddleImgData);
              pi.LicenceList = prod.cloneLicenceList();
              if (pi.LicenceList != null) foreach (ProductLicence lic in pi.LicenceList) lic.MyProd = pi;
            }
        }
      }
    }
    [XmlIgnore]
    Dictionary<Langs, List<ProductCatalogueItem>> LocProducts;
    List<ProductCatalogueItem> getLocProduct(Langs lng) {
      List<ProductCatalogueItem> res;
      if (LocProducts.TryGetValue(lng, out res)) return res;
      res = new List<ProductCatalogueItem>();
      LocProducts.Add(lng, res);
      return res;
    }
    public ProductCatalogueItem get(int productId, Langs lang) {
      ProductCatalogueItem res = getLocProduct(lang).Where(pr => pr.ProductId == productId).FirstOrDefault();
      if (res == null && lang != Langs.cs_cz) res = get(productId, Langs.cs_cz);
      return res;
    }
    public ProductCatalogueItem getEx(int productId) {
      return Products.Where(pr => pr.ProductId == productId).First().LocItems.OrderBy(l => l.lang).First();
    }
    public string getBestTitle(int dbId, params Langs[] langs) {
      var items = Products.Where(pr => pr.ProductId == dbId).SelectMany(p => p.LocItems).ToArray();
      if (items.Length == 0) throw new Exception();
      ProductCatalogueItem it = items.FirstOrDefault(t => langs.Contains(t.lang));
      if (it == null) it = items[0];
      return it.ShortTitle;
      /*foreach (Langs lng in langs) {
        ProductCatalogueItem it = items.FirstOrDefault(t => t.lang == lng);
        if (it != null) return it.ShortTitle;
      }*/
      throw new Exception();
      /*var items = Products.Where(pr => pr.ProductId == dbId).SelectMany(p => p.LocItems).Where(pi => langs.Contains(pi.lang)).ToArray();
      if (items.Length == 0) throw new Exception();
      foreach (Langs lng in langs) {
        ProductCatalogueItem it = items.FirstOrDefault(t => t.lang == lng);
        if (it != null) return it.ShortTitle;
      }
      throw new Exception();*/
    }
    public ProductLicence getFirstLicenceFromAllCommerce(int prosperId/*, Langs lang*/) {
      int commerceId = ProductLicence.getCommerceId(prosperId);
      ProductLicenceType licType = ProductLicence.getLicenceType(prosperId);
      var licences = LocProducts.Values.SelectMany(l => l).Where(p => p.CommerceId == commerceId);
      return licences.SelectMany(li => li.Licences.Values).Where(li => li.Licence == licType).FirstOrDefault();
      //DsgnProduct prod = instance.Products.Where(pr => pr.CommerceId == commerceId).Single();
      /*foreach (ProductCatalogueItem prod in getAllCommerce(commerceId, lang))
        foreach (ProductLicence lic in prod.Licences.Values)
          if (lic.Licence == licType)
            return lic;
      if (lang != Langs.cs_cz) return getFirstLicenceFromAllCommerce(prosperId/*, Langs.cs_cz);
      throw new Exception();*/
    }

    public IEnumerable<Langs> DownloadLangs(Domains site, CourseIds crsId) {
      //site = ProductCatalogue.normalizeSite(site);
      return ProductCatalogueItems.Instance.Products.SelectMany(p => p.LocItems).
        //Zmena 3.8.2011 kvule Avanquest, povoleni anglictiny v anglictine
        //Where(pl => pl.Owner.site == site && pl.Owner.LicenceList.Any(l => l.Licence == ProductLicenceType.download && l.CourseId == crsId) && !pl.IsSameLang).
        Where(pl => pl.Owner.site == site && pl.Owner.LicenceList.Any(l => l.Licence == ProductLicenceType.download && l.CourseId == crsId)).
        Select(pl => pl.lang);
    }

    public struct LocLic { public ProductCatalogueItem Loc; public ProductLicence Lic; }

    public IEnumerable<LocLic> Downloads(Domains site) {
      //site = ProductCatalogue.normalizeSite(site);
      return ProductCatalogueItems.Instance.Products.SelectMany(p => p.LocItems).Where(pl => (site == Domains.no || pl.Owner.site == site) && !pl.IsSameLang).
        Select(li => new LocLic() { Loc = li, Lic = li.Owner.LicenceList.FirstOrDefault(l => l.Licence == ProductLicenceType.download) }).
        Where(ll => ll.Lic != null);
    }

    public ProductCatalogueItem getCourse(CourseIds courseId, Domains site, Langs lang, bool langMustMatch) {
      ProductCatalogueItem res = getLocProduct(lang).Where(pr => pr.getOnlyCourseId() == courseId && pr.site == site).FirstOrDefault();
      if (res == null) {
        if (langMustMatch) return null;
        if (lang != Langs.cs_cz) res = getCourse(courseId, site, Langs.cs_cz);
      }
      return res;
    }
    public ProductCatalogueItem getCourse(CourseIds courseId, Domains site, Langs lang) {
      return getCourse(courseId, site, lang, false);
      //site = ProductCatalogue.normalizeSite(site);
      //ProductCatalogueItem res = getLocProduct(lang).Where(pr => pr.getOnlyCourseId() == courseId && pr.site == site).FirstOrDefault();
      //if (res == null && lang != Langs.cs_cz) res = getCourse(courseId, site, Langs.cs_cz);
      //return res;
    }
    IEnumerable<ProductCatalogueItem> getAllCommerce(int commerceId, Langs lang) {
      return getLocProduct(lang).Where(pr => pr.CommerceId == commerceId);
    }
    public IEnumerable<ProductCatalogueItem> GetProductIds(bool hasDownload, Domains site, Langs lang) {
      //site = ProductCatalogue.normalizeSite(site);
      return ProductCatalogueItems.Instance.Products.Where(pr => pr.site == site && (!hasDownload || pr.HasDownload) && !pr.HideOnLmcom).
        SelectMany(pr => pr.LocItems).
        Where(li => li.lang == lang && (!hasDownload || !li.IsSameLang));
    }

    public delegate bool ProductOKEvent(DsgnProduct item);

    public IEnumerable<ProductCatalogueItem> GetProductIds(Domains site, Langs lang, ProductOKEvent okEvent) {
      //site = ProductCatalogue.normalizeSite(site);
      return ProductCatalogueItems.Instance.Products.Where(pr => pr.site == site && !pr.HideOnLmcom && okEvent(pr)).
        SelectMany(pr => pr.LocItems).
        Where(li => li.lang == lang);
    }

    public IEnumerable<ProductCatalogueItem> GetFiaFileName(Domains site, string fn) {
      //site = ProductCatalogue.normalizeSite(site);
      return ProductCatalogueItems.Instance.Products.Where(pr => pr.site == site && pr.FileName == fn).SelectMany(pr => pr.LocItems);
    }
  }

  public class ProductCatalogueItem {
    public Langs lang;
    public string Title;
    string shortTitle;
    public string ShortTitle {
      get { return shortTitle == null ? "*** missing short title ***" : shortTitle; }
      set { shortTitle = value; }
    }
    public string ShortXTitle(Domains site, Langs lng) {
      if (site != Domains.com) return ShortTitle;
      string s = ShortTitle;
      switch (lng) {
        case Langs.en_gb: return ShortTitle.Replace(" by LANGMaster.com", null).Replace("Collins", null);
        case Langs.de_de: return ShortTitle.Replace(" von LANGMaster.com", null).Replace("elektronisches", null);
        case Langs.sp_sp: return ShortTitle.Replace(" por LANGMaster.com", null).Replace("Collins", null);
        case Langs.ru_ru: return ShortTitle.Replace(" от LANGMaster.com", null).Replace("Collins", null);
        case Langs.it_it: return ShortTitle.Replace(" by LANGMaster.com", null).Replace("Collins", null);
        case Langs.fr_fr: return ShortTitle.Replace(" by LANGMaster.com", null).Replace("Collins", null);
        default: return ShortTitle;
      }
    }
    public string Perex;
    public string Url;
    public string BuyUrl;
    public bool IsSameLang;
    public string DownloadUrl;
    public string RunUrl;

    public string debugBuyUrl(SubDomains subDomain) {
      if (subDomain == SubDomains.no) {
        string newUrl = null;
        switch (Machines.machine) {
          case Machines.pz_comp: newUrl = "localhost"; break;
          case "newbuild": newUrl = "newbuild"; break;
          case "lm-backup": newUrl = "test.langmaster.cz"; break;
          default: return BuyUrl;
        }
        if (DownloadUrl.IndexOf("vyuka.lide.cz") > 0 && DownloadUrl.IndexOf("vyuka.lide.cz/lmcom/sz") < 0) newUrl += "/lmcom";
        return BuyUrl.Replace("www.langmaster.cz", newUrl).Replace("vyuka.lide.cz", newUrl).Replace("www.langmaster.com", newUrl);
      } else
        return BuyUrl.Replace("www.langmaster.com", SubDomain.subDomainToHost(subDomain));
    }

    public string debugDownloadUrl(SubDomains subDomain) {
      if (subDomain == SubDomains.no) {
        string newUrl = null;
        switch (Machines.machine) {
          case Machines.pz_comp: newUrl = "localhost"; break;
          case "newbuild": newUrl = "newbuild"; break;
          case "lm-backup": newUrl = "test.langmaster.cz"; break;
          default: return DownloadUrl;
        }
        if (DownloadUrl.IndexOf("vyuka.lide.cz") > 0 && DownloadUrl.IndexOf("vyuka.lide.cz/lmcom/sz") < 0) newUrl += "/lmcom/sz/web/cs-cz/pages";
        return DownloadUrl.Replace("www.langmaster.cz", newUrl).Replace("vyuka.lide.cz", newUrl).Replace("www.langmaster.com", newUrl);
      } else
        return DownloadUrl.Replace("www.langmaster.com", SubDomain.subDomainToHost(subDomain));
    }

    public string debugUrl(SubDomains subDomain) {
      if (subDomain == SubDomains.no) {
        string newUrl = null;
        switch (Machines.machine) {
          case Machines.pz_comp: newUrl = "localhost"; break;
          case "newbuild": newUrl = "newbuild"; break;
          case "lm-backup": newUrl = "test.langmaster.cz"; break;
          default: return Url;
        }
        if (Url.IndexOf("vyuka.lide.cz") > 0 && Url.IndexOf("vyuka.lide.cz/lmcom/sz") < 0) newUrl += "/lmcom/sz/web/cs-cz/pages";
        return Url.Replace("www.langmaster.cz", newUrl).Replace("vyuka.lide.cz", newUrl).Replace("www.langmaster.com", newUrl);
      } else
        return Url.Replace("www.langmaster.com", SubDomain.subDomainToHost(subDomain));
    }

    [XmlIgnore]
    public string SmallImg { get { return Owner.SmallImgData == null ? null : Owner.SmallImgData.Url(); } }
    //[XmlIgnore]
    //public string MiddleImg { get { return MiddleImgData==null ? null : MiddleImgData.Url(); } }
    //kopie seznamu ruznych licenci s cenami
    [XmlIgnore]
    public ProductLicence[] LicenceList;
    [XmlIgnore]
    public DsgnProduct Owner;

    public int ProductId { get { return Owner.ProductId; } }
    public Domains site { get { return Owner.site; } }
    public int CommerceId { get { return Owner.CommerceId; } }
    // "Vase cena": v podstate plati tato cena, UnitPrice se pouze zobrazuje
    public Currency Discount { get { return Owner.Discount; } }
    // Pro ucetnictvi: obsahuje skladovou kartu
    public bool StockAble { get { return Owner.StockAble; } }
    // Vyrobni naklady
    public Currency ProductionCost { get { return Owner.ProductionCost; } }
    // Informace o licencnich poplatcich
    public ProductRoyality[] ProductRoyalities { get { return Owner.ProductRoyalities; } }
    public int[] seeAlso { get { return Owner.seeAlso; } }


    public string BuyUrlLic(ProductLicenceType type, SubDomains subDomain) {
      string res = debugBuyUrl(subDomain);
      //vedlejsi efekt: stare BuildUrl obsahuje query string, k nim se prida i licence. Nove nikoliv.
      return res.IndexOf('?') < 0 ? res : res + "&Lic=" + type.ToString();
    }

    public string GetTitle(RegLicenceObj regLic) {
      if (regLic != null && regLic.Scena == RegLicenceScena.fixStartDate)
        return ShortTitle + " (" + "začátek kurzu" + " " + ProductLicence.FixDateStart(regLic.MultiPrice).ToShortDateString() + ")";
      else
        return ShortTitle;
    }

    public ProductLicence findLicence(ProductLicenceType type) {
      if (LicenceList != null)
        foreach (ProductLicence lic in LicenceList)
          if (lic.Licence == type) return lic;
      return null;
    }

    public CourseIds getOnlyCourseId() {
      return DsgnProduct.getOnlyCourseId(LicenceList);
    }

    [XmlIgnore]
    Dictionary<ProductLicenceType, ProductLicence> licences;
    [XmlIgnore]
    public Dictionary<ProductLicenceType, ProductLicence> Licences {
      get {
        if (licences == null) {
          licences = new Dictionary<ProductLicenceType, ProductLicence>();
          if (LicenceList == null || LicenceList.Length <= 0) {
            ProductLicence noLic = new ProductLicence();
            noLic.MyProd = this;
            noLic.Licence = ProductLicenceType.box;
            noLic.LicPrice = Discount;
            licences.Add(noLic.Licence, noLic);
          } else
            foreach (ProductLicence lic in LicenceList) {
              lic.MyProd = this;
              licences.Add(lic.Licence, lic);
            }
        }
        return licences;
      }
    }

    public double ProductPriceTax(SubDomains subSite, ProductLicenceType lic) {
      return Order.RoundCurrency(Discount.PriceTax(Order.ActTaxPercent, subSite, lic));
    }

    public double LowerPriceTax(SubDomains subSite, ProductLicenceType lic) {
      if (LicenceList == null || LicenceList.Length <= 0) return ProductPriceTax(subSite, lic);
      double pr = Double.MaxValue;
      foreach (ProductLicence li in LicenceList) {
        double newPr = li.NormalPriceTax(subSite);
        if (newPr < pr) pr = newPr;
      }
      return pr;
    }

    //licence pro subsite:
    public IEnumerable<ProductLicence> com_Licences(SubDomains subsite) {
      return LicenceList.Where(l => l.SubSites == null || l.SubSites.Contains(subsite));
    }

    public Currency com_LowPrice(SubDomains subsite) { return com_Licences(subsite).Select(l => com_Price(l, subsite)).MinBy(l => l.Amount); }

    public ProductLicence com_LowLicence(SubDomains subsite) { return com_Licences(subsite).MinBy(l => com_Price(l, subsite).Amount); }

    //true: download, false: box; null: both
    public bool? com_Download(SubDomains subsite) {
      bool isBox = false; bool isDownload = false;
      foreach (ProductLicence lic in com_Licences(subsite))
        if (lic.Licence == ProductLicenceType.box) isBox = true; else if (lic.Licence == ProductLicenceType.download) isDownload = true;
      if (isDownload && !isBox) return true; else if (!isDownload && isBox) return false; else return null;
    }

    //licence daneho typu
    public ProductLicence com_Licence(SubDomains subsite, ProductLicenceType type) {
      return com_Licences(subsite).First(l => l.Licence == type);
    }

    //cena pro licenci
    public Currency com_Price(ProductLicence lic, SubDomains subsite) {
      return lic.LicPrice.priceValue(subsite, lic.Licence);
      /*if (lic.LicPrice.SubSites == null) return lic.LicPrice;
      SubSiteCurrency? noPrice = null;
      foreach (SubSiteCurrency sc in lic.LicPrice.SubSites)
        if (sc.SubSite == subsite) return sc.getCurrency();
        else if (sc.SubSite == SubDomains.no) noPrice = sc;
      if (noPrice == null) throw new Exception();
      return ((SubSiteCurrency)noPrice).getCurrency();*/
    }

    public Currency com_Price(ProductLicenceType lic, SubDomains subsite) {
      return com_Price(com_Licence(subsite, lic), subsite);
    }

    public string com_PriceText(ProductLicenceType lic, SubDomains subsite) {
      Currency curr = com_Price(com_Licence(subsite, lic), subsite);
      return urlInfo.priceText(curr.Typ, curr.PriceTax(subsite, lic));
    }

    public string com_PriceText(ProductLicence lic, SubDomains subsite) {
      Currency curr = com_Price(lic, subsite);
      return urlInfo.priceText(curr.Typ, curr.PriceTax(subsite, lic.Licence));
    }

    /*public bool IsPoslechyOrETAudio() {
      return Owner.ET_SiteMapId == ET_SiteMapId.talknowaudio || ProductLicence.isPoslechy(getOnlyCourseId());
    }*/
  }

  public class DsgnProduct {
    public int ProductId;
    public Domains site;
    public LineIds Line; //zatrideni do skupiny produktu
    public bool? WithDict; //priznak - produkt se slovnikem
    public int SiteOrder; //poradi v sitemap
    public string FileName; //FileName .LMP souboru
    public bool HideOnLmcom; //produkt se neukazuje v lm.com
    public string ParentFileName; //FileName .ASPX souboru s parent uzlem produktu
    public string ParentDownloadFileName; //FileName .ASPX souboru s parent uzlem download stranky
    public bool HasDownload; //existuje download
    public int CommerceId;
    public ImgInfo SmallImgData;
    // "Vase cena": v podstate plati tato cena, UnitPrice se pouze zobrazuje
    public Currency Discount;
    //pomocna cena v USD
    public double PADUsdPrice;
    public double PADEurPrice;
    //ikony
    public ProductIcons Icons;
    //file se screenshotem v q:\LMCom\LMCom\site\web\lang\pages\Products\img\ adresari
    public string COMScreenShot;
    public ET_SiteMapId ET_SiteMapId; //pro ET produkty: typ produktu
    public ET_SiteMapId ET_SiteMapIdEx(CourseIds crsId) {
      if (ET_SiteMapId != LMComLib.ET_SiteMapId.old) return ET_SiteMapId;
      return ProductLicence.isPoslechy(crsId) ? ET_SiteMapId.poslechy : ET_SiteMapId.old;
    }

    // Pro ucetnictvi: obsahuje skladovou kartu
    public bool StockAble;
    // Vyrobni naklady
    public Currency ProductionCost;
    // Informace o licencnich poplatcich
    public ProductRoyality[] ProductRoyalities;
    public int[] seeAlso;
    public ProductLicence[] LicenceList;
    public ProductCatalogueItem[] LocItems;
    public ProductLicence[] cloneLicenceList() {
      if (LicenceList == null || LicenceList.Length == 0) {
        ProductLicence noLic = new ProductLicence();
        noLic.Licence = ProductLicenceType.box;
        noLic.LicPrice = (Currency)Discount;
        return new ProductLicence[] { noLic };
      }
      ProductLicence[] res = new ProductLicence[LicenceList.Length];
      for (int i = 0; i < LicenceList.Length; i++) res[i] = (ProductLicence)LicenceList[i].Clone();
      return res;
    }
    public CourseIds getOnlyCourseId() {
      return getOnlyCourseId(LicenceList);
    }

    public static CourseIds getOnlyCourseId(ProductLicence[] LicenceList) {
      CourseIds res = CourseIds.no;
      if (LicenceList == null) return CourseIds.no;
      foreach (ProductLicence lic in LicenceList)
        if (lic.CourseId != CourseIds.no)
          if (res != CourseIds.no) throw new Exception(string.Format("{0} {1}", res, lic.CourseId));
          else res = lic.CourseId;
      return res;
    }

  }

  /// <summary>
  /// Ruzne typy licenci
  /// </summary>
  /*[EnumDescrAttribute(typeof(ProductLicenceType), "full=,month3=3 měsíční licence,month6=6 měsíční licence,month12=roční licence,multi5Full=5 uživatelů,multi10Full=10 uživatelů,multi20Full=20 uživatelů,multi50Full=50 uživatelů,multi5Month12=5 uživatelů; roční licence,multi10Month12=10 uživatelů; roční licence,multi20Month12=20 uživatelů; roční licence,multi50Month12=50 uživatelů; roční licence")]
  public enum ProductLicenceType {
    no,
    full, //neomezena licence
    month3,
    month6,
    month12,
    multi5Full,
    multi10Full,
    multi20Full,
    multi50Full,
    multi5Month12,
    multi10Month12,
    multi20Month12,
    multi50Month12,
    fixStartDate, //licence, zacinajici v pevne datum
    multiPrice, //licence v hodnote penez
    fullDownload, //neomezena licence, doruceni downloadem
  }*/

  /*public struct CurrencyEx {
    public Currency Price;
    public Langs Lang;
  }*/

  /// <summary>
  /// Produkt ma vice variant dle licence: jedna licence (dava se napr. do kosiku apod.)
  /// </summary>
  public class ProductLicence : ICloneable {

    public ProductLicenceType Licence;

    public Currency LicPrice;

    public SubDomains[] SubSites;

    //public CurrencyEx[] LicPriceEx;

    //Identifikace online kurzu
    public CourseIds CourseId;

    public object Clone() {
      ProductLicence res = new ProductLicence();
      res.Licence = Licence; res.LicPrice = LicPrice; res.CourseId = CourseId; if (SubSites != null) res.SubSites = SubSites.ToArray();
      return res;
    }

    [XmlIgnore]
    public ProductCatalogueItem MyProd;

    [XmlIgnore]
    LMComLib.Cms.Product cmsProd;
    public LMComLib.Cms.Product CmsProd {
      get {
        if (cmsProd == null) cmsProd = (LMComLib.Cms.Product)LMComLib.CacheItems.GetTemplate(MyProd.ProductId);
        return cmsProd;
      }
    }
    [XmlIgnore]
    public string Title { get { return MyProd != null ? MyProd.Title : CmsProd.Title; } }
    [XmlIgnore]
    public string Perex { get { return MyProd != null ? MyProd.Perex : CmsProd.Perex; } }
    [XmlIgnore]
    public int CommerceId { get { return MyProd != null ? MyProd.CommerceId : (int)CmsProd.CommerceId; } }
    [XmlIgnore]
    public Currency Discount { get { return MyProd != null ? MyProd.Discount : (Currency)CmsProd.Discount; } }
    [XmlIgnore]
    public bool StockAble { get { return MyProd != null ? MyProd.StockAble : (CmsProd.StockAble == null ? false : (bool)CmsProd.StockAble); } }
    [XmlIgnore]
    public Currency ProductionCost { get { return MyProd != null ? MyProd.ProductionCost : (CmsProd.ProductionCost == null ? new Currency(CurrencyType.csk, 0.0) : (Currency)CmsProd.ProductionCost); } }
    /*[XmlIgnore]
    public CourseIds CourseId { get { return MyProd != null ? MyProd.CourseId : (CmsProd.CourseId == CourseIds.no ? 0 : (CourseIds)CmsProd.CourseId); } }*/
    [XmlIgnore]
    public bool LicenceOnly { get { return CourseId != CourseIds.no; } }
    [XmlIgnore]
    public int ProductId { get { return MyProd != null ? MyProd.ProductId : CmsProd.Info.dbId; } }
    [XmlIgnore]
    public ProductRoyality[] Licencors { get { return MyProd != null ? MyProd.ProductRoyalities : CmsProd.ProductRoyalities; } }

    public IEnumerable<ProductRoyality> getRoyalities(Langs lng, ProductLicenceType type) {
      if (Licencors == null || Licencors.Length == 0) yield break;
      int maxType = Licencors.Select(l => l.Type == ProductLicenceType.fake ? (string.IsNullOrEmpty(l.Langs) ? 1 : 2) : (string.IsNullOrEmpty(l.Langs) ? 3 : 4)).Max();
      switch (maxType) {
        case 1: foreach (ProductRoyality pr in Licencors) yield return pr; break;
        case 2: foreach (ProductRoyality pr in Licencors.Where(p => p.Langs.IndexOf(lng.ToString()) >= 0)) yield return pr; break;
        case 3: foreach (ProductRoyality pr in Licencors.Where(p => p.Type == type)) yield return pr; break;
        case 4: foreach (ProductRoyality pr in Licencors.Where(p => p.Langs.IndexOf(lng.ToString()) >= 0 && p.Type == type)) yield return pr; break;
      }
    }

    [XmlIgnore]
    public string ShortTitle {
      get { return GetTitle((OrderItem)null); }
    }
    public string GetTitle(OrderItem oi) {
      return GetTitle(oi == null ? (Currency?)null : oi.ExternalPrice);
    }

    public string GetTitle(Currency? externalPrice) {
      string st = MyProd != null ? MyProd.ShortTitle : CmsProd.ShortTitle;
      switch (Licence) {
        case ProductLicenceType.box:
        case ProductLicenceType.multiPrice:
          return st;
        case ProductLicenceType.download:
          return st + " (" + CSLocalize.localize("e359c155905a43759cfbbd39aa3c5807", LocPageGroup.LMComLib, "Licenční klíč") + ")";
        case ProductLicenceType.fixStartDate:
          return st + (externalPrice == null ? null : " (" + "začátek kurzu" + " " + FixDateStart(Convert.ToInt32(((Currency)externalPrice).Amount)).ToShortDateString() + ")");
        default:
          return st + " (" + EnumDescrAttribute.getDescr(typeof(ProductLicenceType), (int)Licence) + ")";
      }
    }
    public static DateTime FixDateStart(int weekNum) {
      return LowUtils.startDate.AddDays(weekNum * 7);
    }
    public int ProsperId {
      get {
        return getProsperId(CommerceId, Licence);
      }
    }
    public double NormalPrice(SubDomains subSite) {
      return Order.RoundCurrency(LicPrice.Price(Order.ActTaxPercent, subSite, Licence));
    }
    public double NormalPriceTax(SubDomains subSite) {
      return Order.RoundCurrency(LicPrice.PriceTax(Order.ActTaxPercent, subSite, Licence));
    }
    public double NormalTax(SubDomains subSite) {
      return Order.RoundCurrency(LicPrice.Tax(Order.ActTaxPercent, subSite, Licence));
    }

    public static int getProsperId(int commerceId, ProductLicenceType licence) {
      //int pi = courseId * 100 + (ushort)licence;
      //ProductLicenceType lt = getLicenceType(pi);
      //int crs = getCourseId(pi);
      if (licence == ProductLicenceType.fake) throw new Exception();
      return commerceId * 100 + (ushort)licence;
    }
    public static ProductLicenceType getLicenceType(int prosperId) {
      ProductLicenceType res = (ProductLicenceType)(prosperId % 100);
      if (res == ProductLicenceType.fake) throw new Exception();
      return res;
    }
    public static int getCommerceId(int prosperId) {
      return prosperId / 100;
    }

    /*public static ProductLicence fincLicence(int prosperId) {
      return null;
    }*/

    public static bool isPoslechy(CourseIds crsId) {
      return crsId == CourseIds.EnglishPoslechy || crsId == CourseIds.FrenchPoslechy
        || crsId == CourseIds.GermanPoslechy || crsId == CourseIds.ItalianPoslechy
        || crsId == CourseIds.SpanishPoslechy;
    }
  }

  /// <summary>
  /// Byvale LicenceItem
  /// Informace o royalities u produtu v katalogu
  /// </summary>
  public class ProductRoyality {

    public ProductRoyality() { }

    public ProductRoyality(string licencor, double percent) {
      RoyalityTableItemId = licencor; Percent = percent;
    }
    /// <summary>
    /// ID licencora v ciselniku (odpovida RoyalityTableItem.Id)
    /// </summary>
    public string RoyalityTableItemId;
    /// <summary>
    /// Kolikatina produktu odpovida licencovanemu produktu
    /// </summary>
    public double Percent;

    /// <summary>
    /// Pro jakou lokalizaci se royality plati. Comma delimited seznam jazyku. Empty: pro ostatni.
    /// </summary>
    public string Langs;

    /// <summary>
    /// Pro jaky typ licence se royality plati
    /// </summary>
    public ProductLicenceType Type;
    //public double AmountKc;
    //public bool SubstractProductCost;

  }

  /// <summary>
  /// Prvek tabulky royalities (na ktery se z produktu odkazuje z LicencItem.Licencor)
  /// Byvale Licencor
  /// </summary>
  public class RoyalityTableItem {
    public int Id;
    public string FriendlyId;
    public string Licencor;
    public double Percent;
    //public double AmountKc;
    public bool SubstractProductCost;
    public string Title {
      get { return string.Format("{0}: {1}%", Licencor, Percent); }
    }
  }

  /// <summary>
  /// Byvale Licencors
  /// </summary>
  public class RoyalityTable {
    static RoyalityTable() {
      try {
        //Instance = (RoyalityTable)XmlUtils.FileToObject(string.Format("{0}app_data/Licencors.xml", HostingEnvironment.ApplicationPhysicalPath), typeof(RoyalityTable));
        Instance = XmlUtils.FileToObject<RoyalityTable>(Machines.basicPath + @"rew\LMCom\App_Data\Licencors.xml");
      } catch (Exception exp) {
        throw new Exception("XmlUtils.FileToObject", exp);
      }
      try {
        Instance.Finish();
      } catch (Exception exp) {
        throw new Exception("Instance.Finish", exp);
      }
    }
    public static RoyalityTable Instance;

    public RoyalityTableItem[] Items;
    [XmlIgnore]
    Dictionary<string, RoyalityTableItem> titles;
    [XmlIgnore]
    Dictionary<int, RoyalityTableItem> ids;
    [XmlIgnore]
    Dictionary<string, RoyalityTableItem> friendlyIds;
    public void Finish() {
      titles = new Dictionary<string, RoyalityTableItem>();
      ids = new Dictionary<int, RoyalityTableItem>();
      friendlyIds = new Dictionary<string, RoyalityTableItem>();
      foreach (RoyalityTableItem lic in Items) {
        try {
          titles.Add(lic.Title, lic);
          friendlyIds.Add(lic.FriendlyId, lic);
          ids.Add(lic.Id, lic);
        } catch (Exception exp) {
          throw new Exception(string.Format("Error in licencors.xml, title={0}, id={1}", lic.Title, lic.Id), exp);
        }
      }
    }

    public static IEnumerable<string> allRoyalityTableItems() {
      foreach (RoyalityTableItem lic in Instance.Items) yield return lic.Title;
    }

    public static int licencor(string licText) {
      return Instance.titles[licText].Id;
    }

    public static string licencorName(string licText) {
      return Instance.titles[licText].FriendlyId;
    }

    public static RoyalityTableItem royalityTableItem(int id) {
      return Instance.ids[id];
    }

    public static RoyalityTableItem royalityTableItem(string friendlyId) {
      try {
        return Instance.friendlyIds[friendlyId];
      } catch (Exception exp) {
        throw new Exception(friendlyId, exp);
      }

    }

  }


}
