using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;

namespace DesignNew {

  public static partial class Deploy {

    //******************* soubory pro SW deployment
    public static IEnumerable<string> allSWFiles(string basicPath) {
      var JSs = validDesignIds.SelectMany(designId => validLangStrs.SelectMany(lang => new bool[] { true, false }.Select(isMin => new { designId, lang, isMin }))).SelectMany(slb => allJS(slb.isMin, slb.lang, slb.designId));
      var CSSs = validDesignIds.SelectMany(designId => new bool[] { true, false }.Select(isMin => new { designId, isMin })).SelectMany(slb => allCSS(slb.isMin, slb.designId));
      var other = File.ReadAllLines(basicPath + @"Deploy\otherServer.txt").Concat(File.ReadAllLines(basicPath + @"Deploy\otherClient.txt"));
      return JSs.Concat(CSSs).Concat(other).Where(s => !string.IsNullOrEmpty(s)).Select(s => s.ToLower()).Distinct().OrderBy(s => s);
    }
    public static void zipSWFiles(string basicPath, string zipFile) {
      if (File.Exists(zipFile)) File.Delete(zipFile);
      using (var zipStr = File.OpenWrite(zipFile))
      using (ZipArchive zip = new ZipArchive(zipStr, ZipArchiveMode.Create)) {
        foreach (var fn in allSWFiles(basicPath).Select(f => f.Replace('/', '\\'))) {
          ZipArchiveEntry entry = zip.CreateEntry(fn);
          var inpFn = basicPath + fn;
          using (var inpStr = File.OpenRead(inpFn))
          using (var str = entry.Open()) inpStr.CopyTo(str);
          if (gzipExtensions.Contains(Path.GetExtension(inpFn))) {
            entry = zip.CreateEntry(fn + ".gzip", CompressionLevel.NoCompression);
            using (var inpStr = File.OpenRead(inpFn)) {
              if (inpStr.Length < 100) continue;
              using (var str = entry.Open())
              using (var gzipStr = new GZipStream(str, CompressionMode.Compress))
                inpStr.CopyTo(gzipStr);
            }
          }
        }
      }
    }

    //******************* soubory pro generaci index.html
    //seznam JS a CSS souboru (pro debug a minify mode)
    public static IEnumerable<string> allJS(bool isMin, string lang, string designId) {
      var jss = isMin ? jsMins.Select(s => string.Format(s, lang)) : externals.SelectMany(s => s).Concat(web.SelectMany(s => s)).Concat(loc.SelectMany(s => s).Select(s => string.Format(s, lang)));
      IEnumerable<string> skin = Enumerable.Empty<string>();
      if (!string.IsNullOrEmpty(designId)) { string[] sk; if (jsSkins.TryGetValue(designId, out sk)) skin = sk; }
      return jquery(isMin).Concat(jss).Concat(skin);
    }

    public static IEnumerable<string> allCSS(bool isMin, string designId) {
      var cssList = isMin ? cssMins : css;
      IEnumerable<string> skin = Enumerable.Empty<string>();
      if (!string.IsNullOrEmpty(designId)) { string[] sk; if (cssSkins.TryGetValue(designId, out sk)) skin = sk; }
      return cssList.Concat(skin);
    }

  }

}
