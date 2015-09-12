using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using excelReport;
using System.IO;
using OfficeOpenXml;
using System.Drawing;
using OfficeOpenXml.Style;
using Newtonsoft.Json;
using LMNetLib;
using CourseMeta;
using blendedMeta;
using LMComLib;

namespace blended {

  public static class ExcelReport {

    //D:\LMCom\REW\Web4\BlendedAPI\vyzva\Scripts\Lib.ts
    public enum reportType { managerKeys, managerStudy, lectorKeys, lectorStudy }
    public class requestPar {
      public reportType type;
      public int companyId;
      public bool managerIncludeStudents;
      public bool isStudyAll;
      public int groupId;
    }

    public static byte[] run(requestPar par) {
      switch (par.type) {
        case reportType.managerKeys: return managerKeys.run(par.companyId, par.managerIncludeStudents);
        case reportType.lectorKeys: return managerKeys.run(par.companyId, par.groupId);

        case reportType.managerStudy: return par.isStudyAll ? studyResults.runAll(par.companyId, -1) : studyResults.run(par.companyId, -1);
        case reportType.lectorStudy: return par.isStudyAll ? studyResults.runAll(par.companyId, par.groupId) : studyResults.run(par.companyId, par.groupId);

        default: throw new Exception("blended.ExcelReport.run: unknown par.type");
      }
    }

    //**************************** STUDY RESULTS
    public static class studyResults {

      public static byte[] run(int companyId, int groupId) {
        var db = blendedData.Lib.CreateContext();
        //nacteni Companies.data, kde je JSON se strukturou grup, licencnich klicu apod.
        ICompanyData data = readData(companyId, db);
        //adresar <lineId,lmcomId> => user informace (firstName, lastname...)
        var courseUsers = studentsFromCompany(groupId < 0 ? data.studyGroups : data.studyGroups.Where(g => g.groupId == groupId));
        var allUsers = usersFromCompany(data);
        //nac ti z CourseData pretesty, hotove lekce nebo vyhodnocene testy:
        long validTypes = (long)(CourseModel.CourseDataFlag.blLesson | CourseModel.CourseDataFlag.blTest | CourseModel.CourseDataFlag.blPretest);
        var query = db.CourseDatas.
          Where(cd =>
            cd.CourseUser.CompanyId == companyId &&
            (cd.Flags & (long)CourseModel.CourseDataFlag.done) != 0 && //musi byt done
            (cd.Flags & validTypes) != 0 && //pretest, lekce nebo test
            (cd.Flags & (long)CourseModel.CourseDataFlag.needsEval) == 0); //jsou vyhodnocene
        //filtr pouze na skupinu studentu studijni grupy
        if (groupId >= 0) {
          var grp = data.studyGroups.First(g => g.groupId == groupId);
          var lmcomIds = courseUsers.Keys.Select(u => u.lmcomId).ToArray();
          query = query.Where(cd => lmcomIds.Contains(cd.CourseUser.LMComId));
        }
        //vyber raw data z databaze
        var query2 = query.
          Select(cd => new { cd.Key, cd.ShortData, cd.CourseUser.ProductUrl, cd.CourseUser.LMComId }).
          ToArray();
        //zpracovani raw dat
        var allModules = query2.
          Select(kd => {
            var res = JsonConvert.DeserializeObject<userBase>(kd.ShortData);
            res.url = kd.Key; res.productUrl = kd.ProductUrl; res.lmcomId = kd.LMComId;
            return res;
          }).
          ToArray();
        //zapracovani user dat do struktury kurzu
        var userProducts = new blendedMeta.uProducts();
        foreach (var module in allModules) blendedMeta.MetaInfo.addModule(userProducts, module); //zatrideni existujicich dat
        foreach (var lmcId in courseUsers.Keys) blendedMeta.MetaInfo.addDummyUsers(userProducts, lmcId); //doplneni studentu, co jeste nedokoncili nic z kurzu (tj. nemaji zadna DONE data v DB)
        var rows = lib.emptyAndHeader(userProducts.uproducts.Select(kv => new { kv.Key, kv.Value })).Select(t => {
          IAlocatedKey usr = null; if (t != null) courseUsers.TryGetValue(t.Key, out usr);
          IAlocatedKey lector = usr == null ? null : allUsers[usr._myLectorLmcomId];
          return new object[] {
              t==null ? "Student" : usr.lastName + " " + usr.firstName,
              t==null ? "Studijní skupina" : usr._myGroup.title + " (učitel " + lector.firstName + " " + lector.lastName + ")",
              t==null ? "Kurz" : t.Value.product.line.ToString(),
              t==null ? "Fáze výuky" : t.Value.etapId(),
            };
        });
        //export user produktu do excelu
        //using (var pck = new ExcelPackage()) {
        //ExcelWorksheet ws = pck.Workbook.Worksheets.Add("Data");
        using (var xlsx = new xlsxFile(HttpContext.Current.Server.MapPath("~/blendedapi/vyzva/server/excels/studysmall.xlsx"))) {
          //vloz do excelu
          var ws = lib.prepareSheet(xlsx.package, "data", 0);
          var rng = lib.import(ws, rows, 0, 0);
          ws.Names.Add(lib.dDataAll, rng);
          return xlsx.result;//.GetAsByteArray();
        }
      }
      public static byte[] runAll(int companyId, int groupId) {
        var db = blendedData.Lib.CreateContext();
        ICompanyData data = readData(companyId, db);
        var courseUsers = studentsFromCompany(groupId < 0 ? data.studyGroups : data.studyGroups.Where(g => g.groupId == groupId));
        //hotova cviceni, ktera nepotrebuji human evaluaci:
        long exFlag = (long)(CourseModel.CourseDataFlag.ex | CourseModel.CourseDataFlag.done);
        long wrongFlag = (long)CourseModel.CourseDataFlag.needsEval;
        var query = db.CourseDatas.
          Where(cd =>
            cd.CourseUser.CompanyId == companyId &&
            (cd.Flags & exFlag) == exFlag &&
            (cd.Flags & wrongFlag) == 0);
        //filtr pouze na skupinu studentu studijni grupy
        if (groupId >= 0) {
          var grp = data.studyGroups.First(g => g.groupId == groupId);
          var lmcomIds = courseUsers.Keys.Select(u => u.lmcomId).ToArray();
          query = query.Where(cd => lmcomIds.Contains(cd.CourseUser.LMComId));
        }
        //vyber raw data z databaze
        var query2 = query.
          Select(cd => new { cd.Key, cd.ShortData, cd.CourseUser.ProductUrl, cd.CourseUser.LMComId }).
          ToArray();
        //zpracovani raw dat
        var allExercises = query2.
          Select(kd => {
            var res = JsonConvert.DeserializeObject<uEx>(kd.ShortData);
            res.url = kd.Key; res.productUrl = kd.ProductUrl; res.lmcomId = kd.LMComId;
            return res;
          }).
          ToArray();
        //merge user data s product sitemap
        var umodules = new blendedMeta.uDoneModules();
        foreach (var ex in allExercises) blendedMeta.MetaInfo.addEx(umodules, ex); //zatrideni existujicich dat
        //foreach (var lmcId in courseUsers.Keys) blendedMeta.MetaInfo.addDummyUsers(userProducts, lmcId); //doplneni studentu, co nemaji zadna data
        var allUsers = usersFromCompany(data);

        var sourceData = umodules.umodules.Values.ToArray();
        var rows = lib.emptyAndHeader(sourceData).Select(t => {
          IAlocatedKey usr = null; if (t != null) courseUsers.TryGetValue(new lineUser(t.module.product.line, t.lmcomId), out usr);
          IAlocatedKey lector = usr == null ? null : allUsers[usr._myLectorLmcomId];
          int lev = t == null ? 0 : (t.module is pretestItem ? ((pretestItem)t.module).lev : t.module.level.lev);
          return new object[] {
              t==null ? "Student" : usr.lastName + " " + usr.firstName,
              t==null ? "Studijní skupina" : usr._myGroup.title + " (učitel " + lector.firstName + " " + lector.lastName + ")",
              t==null ? "Kurz" : t.module.product.line.ToString(),
              t==null ? "Úroveň" : lev.ToString(),
              t==null ? "Lekce" : t.module.data.title,
              t==null ? (object)"maxScore" : t.ms,//new lib.formatedValue(Math.Round(t.ms==0 ? -1 : (decimal)t.s / t.ms, 2), lib.cellFormat.percent),
              t==null ? (object)"score" : t.s,
              t==null ? (Object)"Doba výuky" : new lib.formatedValue(t.elapsed / secPerDay, lib.cellFormat.time),
              t==null ? (Object)"Nahrávky" : new lib.formatedValue(t.sRec / secPerDay, lib.cellFormat.time),
              t==null ? (Object)"Přehrání nahrávek" : new lib.formatedValue(t.sPRec / secPerDay, lib.cellFormat.time),
              t==null ? (Object)"Přehrání zvuku" : new lib.formatedValue(t.sPlay / secPerDay, lib.cellFormat.time),
            };
        }).ToArray();
        //vloz do excelu
        //ExcelWorksheet ws = pck.Workbook.Worksheets.Add("Data");
        using (var xlsx = new xlsxFile(HttpContext.Current.Server.MapPath("~/blendedapi/vyzva/server/excels/studyall.xlsx"))) {
          var ws = lib.prepareSheet(xlsx.package, "data", 0);
          var rng = lib.import(ws, rows, 0, 0);
          ws.Names.Add(lib.dDataAll, rng);
          return xlsx.result; // pck.GetAsByteArray();
        }
      }
    }
    const int secPerDay = 60 * 60 * 24;

    //vsichni Course x Student firmy.
    static Dictionary<blendedMeta.lineUser, IAlocatedKey> studentsFromCompany(IEnumerable<IStudyGroup> groups) {
      var res = new Dictionary<lineUser, IAlocatedKey>(new blendedMeta.lineUserEqualityComparer());
      foreach (var kv in groups.SelectMany(grp => grp.studentKeys.Where(k => k.lmcomId > 0).Select(k => new { grp, key = k }))) {
        var lineUser = new blendedMeta.lineUser(kv.grp.line, kv.key.lmcomId);
        kv.key._myLectorLmcomId = kv.grp.lectorKeys.Select(lk => lk.lmcomId).First(id => id > 0);
        kv.key._myGroup = kv.grp;
        res[lineUser] = kv.key;
      }
      return res;
    }

    //vsichni Course x Student firmy.
    static Dictionary<long, IAlocatedKey> usersFromCompany(ICompanyData data) {
      var res = new Dictionary<long, IAlocatedKey>();
      foreach (var kv in data.alocKeys().Where(k => k.lmcomId > 0)) res[kv.lmcomId] = kv;
      return res;
    }

    static ICompanyData readData(int companyId, blendedData.Vyzva57 db = null) {
      if (db == null) db = blendedData.Lib.CreateContext();
      var dbData = db.Companies.Where(c => c.Id == companyId).Select(c => c.LearningData).FirstOrDefault();
      return JsonConvert.DeserializeObject<ICompanyData>(dbData);
    }
    //**************************** MANAGER & LECTOR KEYS
    public static class managerKeys {

      public static byte[] run(int companyId, int groupId) {
        ICompanyData data = readData(companyId);
        using (var pck = new ExcelPackage()) {
          var grp = data.studyGroups.First(g => g.groupId == groupId);
          ExcelWorksheet ws = pck.Workbook.Worksheets.Add(grp.title);
          var firstFreeRow = 0;
          firstFreeRow = group(ws, firstFreeRow, grp.title, "Licenční klíče pro Studenty", grp.studentKeys);
          firstFreeRow = group(ws, firstFreeRow, "Návštěvníci", "Licenční klíče pro Návštěvníky", grp.visitorsKeys);
          foreach (var colIdx in Enumerable.Range(1, 4)) ws.Column(colIdx).AutoFit(); //automaticka sirka sloupce
          return pck.GetAsByteArray();
        }
      }
      public static byte[] run(int companyId, bool includeStudents) {
        ICompanyData data = readData(companyId);
        using (var pck = new ExcelPackage()) {
          ExcelWorksheet ws = pck.Workbook.Worksheets.Add("Licenční klíče a Učitelé");
          var firstFreeRow = 0;
          foreach (var grp in data.studyGroups) {
            firstFreeRow = group(ws, firstFreeRow, grp.line.ToString() + ": " + grp.title, "Licenční klíče pro Učitele", grp.lectorKeys);
            if (includeStudents) firstFreeRow = group(ws, firstFreeRow, null, "Licenční klíče pro Studenty", grp.studentKeys);
            if (includeStudents) firstFreeRow = group(ws, firstFreeRow, null, "Licenční klíče pro Návštěvníky učitele", grp.visitorsKeys);
          }
          firstFreeRow = group(ws, firstFreeRow, "Další licenční klíče", "Licenční klíče pro Správce", data.managerKeys);
          foreach (var vis in data.visitorsKeys) {
            firstFreeRow = group(ws, firstFreeRow, "Další licenční klíče", "Licenční klíče pro Návštěvníky (" + vis.line.ToString() + ")", vis.visitorsKeys);
          }
          foreach (var colIdx in Enumerable.Range(1, 4)) ws.Column(colIdx).AutoFit(); //automaticka sirka sloupce
          return pck.GetAsByteArray();
        }
      }
      //static ExcelPackage open(int companyId, out ICompanyData data) {
      //  var db = blendedData.Lib.CreateContext();
      //  var dbData = db.Companies.Where(c => c.Id == companyId).Select(c => c.LearningData).FirstOrDefault();
      //  data = Newtonsoft.Json.JsonConvert.DeserializeObject<ICompanyData>(dbData);
      //  return new ExcelPackage();
      //}
      //jedna skupina klicu do exportu
      static int group(ExcelWorksheet ws, int rowIdx, string title, string licTitle, IAlocatedKey[] keys) {
        var startRow = rowIdx;
        if (title != null) ws.Cells[rowIdx++ + 1, 1].Value = title;
        var rows = lib.emptyAndHeader(keys).Select(t => new object[] {
          t==null ? licTitle : t.keyStr,
          t==null ? "Jméno" : t.firstName,
          t==null ? "Příjmené" : t.lastName,
          t==null ? "EMail" : t.email,
        });
        //vloz do excelu
        var rng = lib.import(ws, rows, rowIdx, 0);
        //prvni radek
        if (title != null) {
          var firstRng = ws.Cells[startRow + 1, 1, startRow + 1, 4];
          //firstRng.Merge = true;
          fmtTitle(firstRng.Style);
        }
        //format druhy radek
        var secondLine = startRow + (title == null ? 1 : 2);
        fmtHeader(ws.Cells[startRow + 2, 1, startRow + 2, 4].Style);
        return rng.Start.Row + rng.Rows;
      }
      static void fmtTitle(ExcelStyle st) {
        st.Font.Bold = true;
        st.Fill.PatternType = ExcelFillStyle.Solid;
        st.Fill.BackgroundColor.SetColor(lib.formHtmlColor("337ab7"));
        st.Font.Color.SetColor(Color.White);
        st.Font.Size = 16;
        st.ShrinkToFit = false;
      }
      static void fmtHeader(ExcelStyle st) {
        st.Font.Bold = true;
        st.Fill.PatternType = ExcelFillStyle.Solid;
        st.Fill.BackgroundColor.SetColor(Color.LightGray);
        st.Font.Color.SetColor(Color.Black);
        st.ShrinkToFit = false;
      }
    }

  }
  public class ICompanyData {
    public IAlocatedKey[] managerKeys;
    public IVisitors[] visitorsKeys; //licencni klice visitor studentuu k blended kurzu. Vidi je SPRAVCE na home spravcovske konzole. Visitors se napocitaji do skore, jsou pro navstevniky
    public IStudyGroup[] studyGroups; //studijni skupiny firmy
    public IEnumerable<IAlocatedKey> alocKeys() {
      foreach (var k in managerKeys) yield return k;
      foreach (var k in visitorsKeys.SelectMany(vk => vk.visitorsKeys)) yield return k;
      foreach (var k in studyGroups.SelectMany(g => g.alocKeys())) yield return k;
    }
  }
  public class IVisitors {
    public LMComLib.LineIds line; //jazyk vyuky
    public IAlocatedKey[] visitorsKeys; //licencni klice visitor studentuu k blended kurzu. Vidi je LEKTOR na home kurzu. Visitors se napocitaji do skore, jsou pro navstevniky
  }
  public class IStudyGroup {
    public string title;
    public int groupId;
    public LMComLib.LineIds line; //jazyk vyuky
    public bool isPattern3; //true pro skupinu ucitelu
    public IAlocatedKey[] lectorKeys; //licencni klice lektoruu k blended kurzu. Vidi je ADMIN v admin konzoli
    public IAlocatedKey[] studentKeys; //licencni klice studentuu k blended kurzu. Vidi je LEKTOR na home kurzu
    public IAlocatedKey[] visitorsKeys; //licencni klice visitor studentuu k blended kurzu. Vidi je LEKTOR na home kurzu. Visitors se napocitaji do skore, jsou pro navstevniky
    public int num; //pro create school wizzard - pocet studentu

    public IEnumerable<IAlocatedKey> alocKeys() {
      return new IAlocatedKey[][] { lectorKeys, studentKeys, visitorsKeys }.SelectMany(ks => ks);
    }
  }
  public class IAlocatedKey {
    public string keyStr;
    public Int64 lmcomId;
    public string email;
    public string firstName;
    public string lastName;
    public long _myLectorLmcomId;
    public IStudyGroup _myGroup;
  }
}
