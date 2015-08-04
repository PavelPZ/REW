<%@ Page Language="C#" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<script runat="server">

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
</script>
<%Machines.checkAdminIP(Context);%>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
  <title></title>
</head>
<body>
  <form id="form1" runat="server">
  <div>
    <asp:Button runat="server" Text="RUN!" OnClick="RunClick" />
    <p>
      Example:<br />
      ManagerBatch.aspx?file=Q:\lmcom\LMCom\Services\Trados\BatchExample.xml
    </p>
  </div>
  </form>
</body>
</html>
