using System;
using System.Configuration;

namespace LMComLib {
  public class GeneratePdfItem {
    public string Name;
    public string Value;
    public int FontSize;
    public bool IsBold;
  }

  public static class PdfGenerator {
    public static byte[] createPdf(string template, GeneratePdfItem[] fields) {
      string fontPath = string.Format(ConfigurationManager.AppSettings["PDF.Font"], Machines.rootPath);
      string fontBoldPath = string.Format(ConfigurationManager.AppSettings["PDF.FontBold"], Machines.rootPath);
      string certPath = string.Format(ConfigurationManager.AppSettings["PDF.Cert"], Machines.rootPath);
      string password = ConfigurationManager.AppSettings["PDF.Cert.Password"];
      throw new Exception("missing code here");
      //return PdfGeneratorLow.createPdf(template, fontPath, fontBoldPath, certPath, password, fields);
    }
  }
}
