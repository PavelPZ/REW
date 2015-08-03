using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OfficeOpenXml;
using excelReport;
using System.Reflection;
using System.IO;
using LMComLib;
using OldToNew;
using System.Windows.Forms;
using LMNetLib;

namespace OldToNewViewer {
  public static class Report {
    public static void export() {
      try {
        var files = OldToNew.fileGroup.getAllFiles().Values.Where(t => {
          var m = t.getMeta();
          return m != null && m.history != null && m.history.Count > 0;
        }).OrderBy(t => t.url).Select(t => {
          var meta = t.getMeta();
          var res = new { file = t, meta = meta, itChecked = meta.repChecked(false), itByHandChecked = meta.repChecked(true), itByHand = meta.repByHand() };
          return res;
        });
        using (var xlsx = new xlsxFile(Main.exePath + @"\ReportTemplate.xlsx")) {
          var rows = lib.emptyAndHeader(files).Select(t => new object[] {
            t==null ? (object)"url" : t.file.url,
            t==null ? (object)"fileGroup" : t.meta.repFileGroup(),
            t==null ? (object)"status" : t.meta.repStatus(),
            t==null ? (object)"checkedDate" : t.itChecked==null ? null : new lib.formatedValue(t.itChecked.repDate.date, lib.cellFormat.dateTime),
            t==null ? (object)"checkedBy" : t.itChecked==null ? null : t.itChecked.worker.ToString(),
            t==null ? (object)"byHandDate" : t.itByHand==null ? null : new lib.formatedValue(t.itByHand.repDate.date, lib.cellFormat.dateTime),
            t==null ? (object)"byHandBy" : t.itByHand==null ? null : t.itByHand.worker.ToString(),
            t==null ? (object)"checkedByHandDate" : t.itByHandChecked==null ? null : new lib.formatedValue(t.itByHandChecked.repDate.date, lib.cellFormat.dateTime),
            t==null ? (object)"checkedByHandBy" : t.itByHandChecked==null ? null : t.itByHandChecked.worker.ToString(),
            t==null ? (object)"historyLen" : t.meta.history.Count,
            t==null ? (object)"lmdataNewExists" : File.Exists(t.file.fileName(CourseMeta.oldeaDataType.lmdataNew)),
            t==null ? (object)"lmdataOld" : t.file.fileName(CourseMeta.oldeaDataType.lmdata),
            t==null ? (object)"lmdataNew" : t.file.fileName(CourseMeta.oldeaDataType.lmdataNew),
            t==null ? (object)"xmlOld" : t.file.fileName(CourseMeta.oldeaDataType.xml),
            t==null ? (object)"xmlNew" : t.file.fileName(CourseMeta.oldeaDataType.xmlNew),
          });
          ExcelWorksheet sheet = lib.prepareSheet(xlsx.package, "DataFile");
          var range = lib.import(sheet, rows, 0);
          sheet.Names.Add(lib.dDataAll, range);
          File.WriteAllBytes(exFile.dataBasicPath + "report.xlsx", xlsx.result);
        }
      } catch (Exception exp) {
        MessageBox.Show(LowUtils.ExceptionToString(exp));
      }
    }
  }
}
