using CourseMeta;
using LMComLib;
using LMNetLib;
using Microsoft.Build.Framework;
using Microsoft.Build.Utilities;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Xml.Linq;
using Yahoo.Yui.Compressor;

namespace DesignNew {

  public static class minifier {

    static jsMinifyResult jsMinify(IEnumerable<string> files) {
      StringBuilder sb = new StringBuilder(); StringBuilder orig = new StringBuilder();
      var compr = new JavaScriptCompressor();
      foreach (var fn in files) {
        var file = File.ReadAllText(fn, Encoding.UTF8);
        var res = compr.Compress(file);
        sb.Append(res); orig.Append(file); orig.AppendLine();
      }
      return new jsMinifyResult { min = sb.ToString(), orig = orig.ToString() };
    }
    public struct jsMinifyResult {
      public string orig;
      public string min;
    }
    public static void jsMinify(string dplUrl, string dest, Langs lng = Langs.no) {
      var files = FileSources.pathsFromDpl(dplUrl, lng).ToArray();
      var destFn = FileSources.pathFromUrl(dest);
      var res = jsMinify(files);
      File.WriteAllText(destFn + ".min.js", res.min);
      File.WriteAllText(destFn + ".js", res.orig);
      Trace.TraceInformation("Minified JS: " + destFn);
    }

    public static void cssInPlaceMinify(string dplUrl) {
      var files = FileSources.pathsFromDpl(dplUrl).ToArray();
      var compr = new CssCompressor();
      foreach (var fn in files) {
        var res = compr.Compress(File.ReadAllText(fn, Encoding.UTF8));
        var destFn = fn.Replace(".css", ".min.css");
        File.WriteAllText(destFn, res);
        Trace.TraceInformation("Minified CSS: " + destFn);
      }
    }
  }


}
