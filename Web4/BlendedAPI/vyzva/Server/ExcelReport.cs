using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using excelReport;
using System.IO;
using OfficeOpenXml;
using System.Drawing;
using OfficeOpenXml.Style;

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
        case reportType.managerStudy: return studyResults.run(par.companyId);
        case reportType.lectorStudy: return studyResults.run(par.companyId, par.groupId);
        default: throw new Exception("blended.ExcelReport.run: unknown par.type");
      }
    }

    //**************************** STUDY RESULTS
    public static class studyResults {
      public static byte[] run(int companyId) {
        return null;
      }
      public static byte[] runAll(int companyId) {
        return null;
      }
      public static byte[] run(int companyId, int groupId) {
        return null;
      }
      public static byte[] runAll(int companyId, int groupId) {
        var db = blendedData.Lib.CreateContext();
        ICompanyData data = readData(companyId, db);
        var grp = data.studyGroups.First(g => g.groupId == groupId);
        var ids = grp.studentKeys.Select(k => k.lmcomId).Where(id => id > 0).Distinct().ToArray();
        db.CourseDatas.Where(cd => cd.CourseUser.CompanyId == companyId && ids.Contains(cd.CourseUser.LMComId));
        using (var pck = new ExcelPackage()) {
          return pck.GetAsByteArray();
        }
      }

      public class IExShort {
        public int ms;
        public int s;
        public CourseModel.CourseDataFlag flag;
        public int elapsed; //straveny cas ve vterinach
        public int beg; //datum zacatku, ve dnech
        public int end; //datum konce (ve dnech), na datum se prevede pomoci intToDate(end * 1000000)
        //Other
        public int sPlay; //prehrany nas zvuk (sec)
        public int sRec; //nahrany zvuk  (sec)
        public int sPRec; //prehrano nahravek (sec)
      }

    }

    static ICompanyData readData(int companyId, blendedData.Vyzva57 db = null) {
      if(db==null) db = blendedData.Lib.CreateContext();
      var dbData = db.Companies.Where(c => c.Id == companyId).Select(c => c.LearningData).FirstOrDefault();
      return Newtonsoft.Json.JsonConvert.DeserializeObject<ICompanyData>(dbData);
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
        //return new rowIndex
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
    public class ICompanyData {
      public IAlocatedKey[] managerKeys;
      public IVisitors[] visitorsKeys; //licencni klice visitor studentuu k blended kurzu. Vidi je SPRAVCE na home spravcovske konzole. Visitors se napocitaji do skore, jsou pro navstevniky
      public IStudyGroup[] studyGroups; //studijni skupiny firmy
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
    }
    public class IAlocatedKey {
      public string keyStr;
      public Int64 lmcomId;
      public string email;
      public string firstName;
      public string lastName;
    }
  }
}
