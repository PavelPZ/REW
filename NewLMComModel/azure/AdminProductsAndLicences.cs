using Admin;
using AzureData;
using LMComLib;
using LMNetLib;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web.Http;

namespace Admin {

  public static class binaryVersion { public const byte v = 1; }

  /************ LICENCES *************************/
  public class CompanyLicences {
    public List<ProductLicence> Lics;
    public ushort LicIdAutoIncrement; //citac, zajistujici jednoznacnost ProductLicence.LicId

    //ushort identifikace company kvuli licencnimu klici (ktery se sklada z <CompanyLicences.compHash, ProductLicence.LicId, UsedKey.KeyId>)
    //public void setCompHash(string compId) { compHash = LowUtils.pearsonHash16(compId); }
    //public static ushort Get16BitHash(string s) {
    //  if (s == null) return 0;
    //  using (var md5Hasher = MD5.Create()) { var data = md5Hasher.ComputeHash(Encoding.UTF8.GetBytes(s)); return BitConverter.ToUInt16(data, 0); }
    //}
    public ushort CompShortId;

    public void ToBinary(BinaryWriter wr) {
      wr.Write(binaryVersion.v);
      wr.Write(CompShortId);
      wr.Write(LicIdAutoIncrement); wr.Write(Lics == null ? 0 : Lics.Count);
      if (Lics != null) foreach (var l in Lics) l.ToBinary(wr);
    }
    public static CompanyLicences FromBinary(BinaryReader wr) {
      wr.ReadByte();
      var res = new CompanyLicences { CompShortId = wr.ReadUInt16(), LicIdAutoIncrement = wr.ReadUInt16() };
      var cnt = wr.ReadInt32(); if (cnt == 0) { res.Lics = new List<ProductLicence>(); return res; }
      res.Lics = Enumerable.Range(0, cnt).Select(c => ProductLicence.FromBinary(wr)).ToList();
      return res;
    }
  }
  public class ProductLicence {
    public string ProductId; //identifikace produktu
    public bool isTest; //ProductId je test
    public ushort LicId; //jednoznacne id v ramci company (hlidana LicIdAutoIncrement), cast licencniho klice
    public ushort CourseDays; //pocet dni pro kurz
    public int KeyIdAutoIncrement; //naposledy vygenerovany licencni klic. Zajistuje unikatnost generovanych lic klicu. Ne kazdy vsak musi byt pouzit.
    public List<UsedKey> Lics;
    public int LicsCount; //nepersistentni pomocny udaj: v getAllProductsLicInfo vracim ProductLicence bez Lics - datm tedy alespon LicsCount=Lics.Count
    public void ToBinary(BinaryWriter wr) {
      wr.Write(binaryVersion.v);
      wr.WriteStringEx(ProductId);
      wr.Write(LicId); wr.Write(KeyIdAutoIncrement); wr.Write(CourseDays); wr.Write(Lics == null ? 0 : Lics.Count);
      if (Lics != null) foreach (var l in Lics) l.ToBinary(wr);
    }
    public static ProductLicence FromBinary(BinaryReader wr) {
      wr.ReadByte();
      var res = new ProductLicence { ProductId = wr.ReadStringEx(), LicId = wr.ReadUInt16(), KeyIdAutoIncrement = wr.ReadInt32(), CourseDays = wr.ReadUInt16() };
      var cnt = wr.ReadInt32(); if (cnt == 0) { res.Lics = new List<UsedKey>(); return res; }
      res.Lics = Enumerable.Range(0, cnt).Select(c => UsedKey.FromBinary(wr)).ToList();
      return res;
    }
  }
  public class UsedKey {
    public int LicKeyId; //pouzity licencni klic. V ProductLicence.Lics se nesmi vyskytovat dve polozky se stejnou Key. Druha cast licencniho klice.
    public string email; //pro uzivatele...
    public void ToBinary(BinaryWriter wr) {
      var t = typeof(UserProduct); //debug, documentation
      wr.Write(binaryVersion.v);
      wr.Write(LicKeyId); wr.WriteStringEx(email);
    }
    public static UsedKey FromBinary(BinaryReader wr) {
      wr.ReadByte();
      return new UsedKey { LicKeyId = wr.ReadInt32(), email = wr.ReadStringEx() };
    }
  }

  public class GenLicKey { //generovany licencni klic
    //identifikace licence
    public ushort CompShortId; //=Company.licenceObj.compLicKeyId (CompanyLicences.compLicKeyId), jednoznacne ID company pro generaci licencnich klicu
    public ushort LicId; //=ProductLicence.LicId
    public int LicKeyId; //pouzity UsedKey.LicKeyId
  }



}

namespace azure {

  [RoutePrefix("adminLicence")]
  public class adminLicenceController : ApiController {

    //***** zalozeni produktu s poctem licenci v Admin/products.ts
    [Route("createNewProduct"), HttpGet]
    public void createNewProduct(string compId, string prodId, bool? isTest, ushort days, bool isAdd) {
      var db = driverLow.create();
      var comp = db.compReadForEdit<Company_Licence>(compId);
      var licenceObj = comp.licenceObj;
      if (!isAdd) {
        var prod = licenceObj.Lics.FirstOrDefault(l => l.ProductId == prodId && l.CourseDays == days);
        if (prod == null || prod.Lics.Count > 0) throw new Exception("prod==null || prod.Lics.Count>0");
        licenceObj.Lics.Remove(prod);
      } else {
        if (licenceObj.Lics.Any(l => l.ProductId == prodId && l.CourseDays == days)) throw new Exception("l.ProductId == prodId && l.Days == days");
        licenceObj.LicIdAutoIncrement++;
        licenceObj.Lics.Add(new Admin.ProductLicence { CourseDays = days, ProductId = prodId, isTest = (bool)isTest, LicId = licenceObj.LicIdAutoIncrement, Lics = new List<UsedKey>() });
      }
      db.SaveChanges();
    }
    //***** list vsech produktu pro Admin/products.ts a admin/keygen/ts
    [Route("getAllProductsLicInfo"), HttpGet]
    public CompanyLicences getAllProductsLicInfo(string compId) {
      var db = driverLow.create(); // driverLow.create();
      var licenceObj = db.compRead<Company_Licence>(compId).licenceObj;
      foreach (var l in licenceObj.Lics) { l.LicsCount = l.Lics.Count(); l.Lics = null; }
      return licenceObj;
    }

    //***** generace licencnich klicu v admin/keygen/ts
    [Route("generateLicenceKeys"), HttpGet]
    public GenLicKey[] generateLicenceKeys(string compId, string prodId, ushort days, int numOfKeys) {
      var db = driverLow.create();
      var comp = db.compReadForEdit<Company_Licence>(compId);
      var licenceObj = comp.licenceObj;
      if (licenceObj.CompShortId == 0) {
        var admin = db.sysReadForEdit<Sys_CompShortId>();
        admin.strDataList.Add(comp.compId); //posloupnost compId. licKeyId je index compId v posloupnosti plus 1.
        licenceObj.CompShortId = (ushort)admin.strDataList.Count;
      }
      var prod = licenceObj.Lics.FirstOrDefault(l => l.ProductId == prodId && l.CourseDays == days);
      if (prod == null) throw new Exception("prod==null");
      var res = Enumerable.Range(prod.KeyIdAutoIncrement + 1, numOfKeys).Select(key => new GenLicKey { CompShortId = licenceObj.CompShortId, LicId = prod.LicId, LicKeyId = key }).ToArray();

      prod.KeyIdAutoIncrement += numOfKeys;
      db.SaveChanges();
      return res;
    }

    [Route("enterLicenceKey"), HttpGet]
    public int enterLicenceKey(string email, ushort compHash, ushort licId, int keyId) {
      var db = driverLow.create();
      var compLicKeys = db.sysRead<Sys_CompShortId>().strDataList;
      var compId = compLicKeys[compHash - 1];
      //var compId = AzureData.Company.findCompanyIdFromHash(db, compHash); if (compId == null) throw new Exception("compId == null");
      var comp = db.compReadForEdit<Company_Licence>(compId);
      var licenceObj = comp.licenceObj;
      var lic = licenceObj.Lics.FirstOrDefault(l => l.LicId == licId);
      if (lic == null) throw new Exception("lic==null");
      var usedLic = lic.Lics.FirstOrDefault(uk => uk.LicKeyId == keyId);
      if (usedLic != null) {
        return usedLic.email == email ? 1 : 2;
      }
      //pouziti licencniho klice
      var user = db.userReadForEdit<User_Company>(email); if (user == null) throw new Exception("user == null");
      var userComps = user.companiesObj;
      lic.Lics.Add(new UsedKey { email = email, LicKeyId = keyId });
      var userComp = userComps.Companies.FirstOrDefault(c => c.compId == comp.compId);
      if (userComp == null) userComps.Companies.Add(userComp = new Admin.UserCompany { compId = comp.compId, Products = new List<UserProduct>() });
      if (lic.isTest) {
        var userProd = new UserProduct { ProductId = lic.ProductId, LicKeyId = keyId };
      } else {
        var userProd = userComp.Products.FirstOrDefault(p => p.ProductId == lic.ProductId);
        if (userProd == null) userComp.Products.Add(userProd = new UserProduct { ProductId = lic.ProductId, Created = LowUtils.nowToNum() });
        userProd.CourseDays += lic.CourseDays;
        //userProd.Keys.Add(new UserKey { /*CompLicKeyId = licenceObj.compLicKeyId,*/ KeyId = keyId, LicId = lic.LicId, Days = lic.Days });
      }
      //save
      db.SaveChanges();
      return 0;
    }

    //***** home stranka
    [Route("getHomePageData"), HttpGet]
    public void getHomePageData(string email) {
    }

    public static void test(StringBuilder sb) {
      var db = driverLow.create();

      sb.AppendLine();
      sb.AppendLine("*************************************************************");
      sb.AppendLine("Admin/products.ts");

      db.testDeleteAll();
      var adm = new adminLicenceController();
      var admGlob = new adminGlobalController();

      sb.AppendLine("***** add products");
      admGlob.createNewCompany("comp1", "p&p.p", true);
      adm.createNewProduct("comp1", "/a/b/c/", false, 10, true);
      adm.createNewProduct("comp1", "/a/b/c/", false, 15, true);
      adm.createNewProduct("comp1", "/a/b/c/d/", false, 10, true);
      sb.AppendLine(JsonConvert.SerializeObject(adm.getAllProductsLicInfo("comp1")));
      sb.AppendLine("company." + JsonConvert.SerializeObject(db.compRead<Company_Licence>("comp1")));

      sb.AppendLine("***** delete products");
      adm.createNewProduct("comp1", "/a/b/c/", null, 10, false);
      adm.createNewProduct("comp1", "/a/b/c/", null, 15, false);
      sb.AppendLine(JsonConvert.SerializeObject(adm.getAllProductsLicInfo("comp1")));

      sb.AppendLine();
      sb.AppendLine("*************************************************************");
      sb.AppendLine("Admin/keyGen.ts, schools/my.ts");

      db.testDeleteAll();

      var logSrv = new azure.LoginController();
      var packedPsw = LowUtils.packStr("xstdg");

      admGlob.createNewCompany("comp1", "a&p.p", true); adm.createNewProduct("comp1", "/a/b/c/", false, 10, true);
      logSrv.CreateLmUserStart(new LMCookieJS { EMail = "p@p.p" }, packedPsw); logSrv.CreateLmUserEnd("p@p.p");
      logSrv.CreateLmUserStart(new LMCookieJS { EMail = "p2@p.p" }, packedPsw); logSrv.CreateLmUserEnd("p2@p.p");

      var keys1 = adm.generateLicenceKeys("comp1", "/a/b/c/", 10, 5);
      sb.AppendLine("comp1.licenceObj=" + JsonConvert.SerializeObject(db.compRead<Company_Licence>("comp1").licenceObj));
      sb.AppendLine("keys=" + JsonConvert.SerializeObject(keys1));

      var res = adm.enterLicenceKey("p@p.p", keys1[0].CompShortId, keys1[0].LicId, keys1[0].LicKeyId);
      sb.AppendLine("comp1.licenceObj=" + JsonConvert.SerializeObject(db.compRead<Company_Licence>("comp1").licenceObj));
      sb.AppendLine("p@p.p.companiesObj=" + JsonConvert.SerializeObject(db.userRead<User_Company>("p@p.p").companiesObj));
      res = adm.enterLicenceKey("p@p.p", keys1[0].CompShortId, keys1[0].LicId, keys1[0].LicKeyId);
      sb.AppendLine("The same user: " + res.ToString());
      res = adm.enterLicenceKey("p2@p.p", keys1[1].CompShortId, keys1[1].LicId, keys1[1].LicKeyId);
      sb.AppendLine("comp1.licenceObj=" + JsonConvert.SerializeObject(db.compRead<Company_Licence>("comp1").licenceObj));
      res = adm.enterLicenceKey("p@p.p", keys1[1].CompShortId, keys1[1].LicId, keys1[1].LicKeyId);
      sb.AppendLine("Other user: " + res.ToString());

    }
  }
}