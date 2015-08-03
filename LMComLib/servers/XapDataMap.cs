using System;
using System.Xml.Linq;
using System.Collections.Generic;
using LMNetLib;
using System.IO;
#if SILVERLIGHT
using System.Windows;
#endif

namespace LMComLib {
  public static class XapDataMap {
    public static List<string> Files = new List<string>();
#if SILVERLIGHT
    static XapDataMap () {
      string s;
      using (Stream str = Application.GetResourceStream(new Uri("data/datamap.txt", UriKind.Relative)).Stream)
      using (StreamReader rdr = new StreamReader(str))
        while ((s = rdr.ReadLine())!=null) Files.Add(s);
    }

    public static Stream FileToStream(string fn) {
      return Application.GetResourceStream(new Uri("data/" + fn, UriKind.Relative)).Stream;
    }
#else
    //provede scan basicPath adresare, da jej do txt a ten ulozi do mapFileName
    public static void Create(string basicPath, string mapFileName) {
      ScanDir sd = new ScanDir() { BasicPath = basicPath, DirsToResult = false };
      using (StreamWriter wr = new StreamWriter(mapFileName)) foreach (string fn in sd.FileName(FileNameMode.RelPath)) wr.WriteLine(fn.Replace('\\','/').ToLower());
    }
#endif
  }
}
