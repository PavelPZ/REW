using LMComLib;
using LMNetLib;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Resources;
using System.Text;
using System.Web.UI.WebControls;
using System.Xml.Linq;
using Trados;

namespace web4.Trados {
  public partial class ManagerBatch : System.Web.UI.Page {
    protected void RunClick(object sender, EventArgs e) {
      XElement root = XElement.Load(Request["file"]);
      string protocolFn = root.AttributeValue("log", "ManagerBatch");
      using (StreamWriter logWr = new StreamWriter(@"c:\temp\" + protocolFn + ".log")) {
        foreach (XElement el in root.Elements()) {
          try {
            logWr.WriteLine("");
            logWr.WriteLine("**********************************************************");
            logWr.WriteLine(el.ToString());
            switch (el.Name.LocalName) {
              case "oper2":
                TradosLib.oper2(
                  LowUtils.EnumParse<LocPageGroup>(el.Element("group").Value),
                  LowUtils.EnumParse<Langs>(el.Element("transLang").Value),
                  bool.Parse(el.Element("adjustStrong").Value)
                );
                break;
              case "oper3":
                using (FileStream fs = new FileStream(el.Element("excelFile").Value, FileMode.Create))
                  TradosLib.oper3(
                    LowUtils.EnumParse<LocPageGroup>(el.Element("group").Value),
                    LowUtils.EnumParse<Langs>(el.Element("transLang").Value),
                    bool.Parse(el.Element("doLock").Value),
                    el.Element("commands").Value.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(s => LowUtils.EnumParse<LocCommand>(s)).ToList(),
                    fs
                  );
                break;
              case "oper4":
                StringBuilder log = new StringBuilder();
                using (StreamReader rdr = new StreamReader(el.Element("excelFile").Value)) {
                  TradosLib.oper4(
                    rdr.ReadToEnd(),
                    bool.Parse(el.Element("ignoreSentNotExist").Value),
                    LowUtils.EnumParse<Langs>(el.ElementValue("srcLang", "no")),
                    LowUtils.EnumParse<Langs>(el.ElementValue("transLang", "no")),
                    log);
                }
                string logFn = el.ElementValue("logFile");
                if (log.Length > 0 && !string.IsNullOrEmpty(logFn))
                  using (StreamWriter wr = new StreamWriter(logFn)) wr.Write(log.ToString());
                break;
              case "oper5":
                TradosLib.oper5(
                  LowUtils.EnumParse<LocPageGroup>(el.Element("group").Value),
                  LowUtils.EnumParse<Langs>(el.Element("transLang").Value)
                );
                break;
              case "combine":
                XDocument res = ExcelExport.Combine(el.Elements("file").Select(el2 => XElement.Load(el2.Value)), true);
                res.Save(el.Element("result").Value);
                break;
              case "cancelOper2":
                TradosLib.cancelOper2(
                  LowUtils.EnumParse<LocPageGroup>(el.Element("group").Value),
                  LowUtils.EnumParse<Langs>(el.Element("transLang").Value)
                );
                break;
            }

          } catch (Exception exp) {
            logWr.WriteLine("*** ERROR ***");
            logWr.WriteLine(exp.Message);
            logWr.WriteLine(exp.StackTrace);
            throw;
          }
        }
      }
    }

  }
}