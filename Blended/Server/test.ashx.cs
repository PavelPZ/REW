using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml;
using System.Xml.Linq;

namespace Blended.Server {
  /// <summary>
  /// Summary description for test
  /// </summary>
  public class test : IHttpHandler {

    public void ProcessRequest(HttpContext context) {
      string resp;
      try {
        var xml = new XElement("data", new string[] { "english", "german", "french" }.Select(l => readLang(l)));
        foreach (var ex in xml.Descendants("ex").ToArray()) ex.Name = "data";
        var doc = new XmlDocument();
        doc.LoadXml(xml.ToString());
        resp = JsonConvert.SerializeXmlNode(doc, Newtonsoft.Json.Formatting.None, true);
      }
      catch (Exception exp) {
        resp = exp.Message + "**** " + exp.StackTrace;
      }
      context.Response.ContentType = "text/plain";
      context.Response.Write(resp);
    }

    XElement readLang(string lang) {
      using (var str = GetType().Assembly.GetManifestResourceStream("Blended.App_Data." + lang + ".Dialogs.product")) {
        XElement root = XElement.Load(str).Elements().First();
        return new XElement("data", new XAttribute("title", root.Attribute("title").Value), new XAttribute("url", lang), root.Elements());
      }
    }

    public bool IsReusable {
      get {
        return false;
      }
    }
  }
}