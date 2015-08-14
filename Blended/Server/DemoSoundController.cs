using Newtonsoft.Json;
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Xml;
using System.Xml.Linq;

namespace Blended.Server {
  public class DemoSoundController : ApiController {
    public string GetMetaData() {
      
      //string[] result = GetType().Assembly.GetManifestResourceNames();
      var xml = new XElement("data", new string[] { "english", "german", "french" }.Select(l => readLang(l)));
      foreach (var ex in xml.Descendants("ex").ToArray()) ex.Name = "data";
      var doc = new XmlDocument();
      doc.LoadXml(xml.ToString());
      var json = JsonConvert.SerializeXmlNode(doc, Newtonsoft.Json.Formatting.None, true);
      return json;
    }

    XElement readLang(string lang) {
      using (var str = GetType().Assembly.GetManifestResourceStream("Blended.App_Data." + lang + ".Dialogs.product")) {
        XElement root = XElement.Load(str).Elements().First();
        return new XElement("data", new XAttribute("title", root.Attribute("title").Value), new XAttribute("url", lang), root.Elements());
      }
    }

  }

}
