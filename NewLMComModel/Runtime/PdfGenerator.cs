using System;
using System.Configuration;
using System.Linq;
using System.Collections.Generic;

namespace LMComLib {
  public class GeneratePdfItem {
    public string Name;
    public string Value;
    public int FontSize;
    public bool IsBold;
  }

  public static class PdfGenerator {

    public static Func<string, string, string, string, string, IEnumerable<Tuple<string,string,int,bool>>, byte[]> doPdfGenerate = (template, fontPath, fontBoldPath, certPath, password, fields) => {
      throw new Exception("Missing reference to PdfLibrary.dll or LMComLib.PdfGenerator.doPdfGenerate = LMComLib.PdfGeneratorLow.createPdf; assignment in global.asax");
    };

    public static byte[] createPdf(string template, GeneratePdfItem[] fields) {
      string fontPath = string.Format(ConfigurationManager.AppSettings["PDF.Font"], Machines.rootPath);
      string fontBoldPath = string.Format(ConfigurationManager.AppSettings["PDF.FontBold"], Machines.rootPath);
      string certPath = string.Format(ConfigurationManager.AppSettings["PDF.Cert"], Machines.rootPath);
      string password = ConfigurationManager.AppSettings["PDF.Cert.Password"];
      return doPdfGenerate(template, fontPath, fontBoldPath, certPath, password, fields.Select(f => new Tuple<string, string, int, bool>(f.Name, f.Value, f.FontSize, f.IsBold)));
    }
  }
}
