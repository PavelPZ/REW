using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using LMNetLib;

namespace CubesDeployment {
  public static class BlendedBatches {
    //projde cisty GIT a vyresi TS x JS duplicity
    public static void gitNormalize() {
      //var basicPath = @"d:\temp\git\Web4"; var toRemove = @"d:\temp\gitremove\Web4";
      var basicPath = @"d:\LMCom\rew"; var toRemove = @"d:\temp\gitremove2\Web4";
      var allTS = Directory.EnumerateFiles(basicPath, "*.ts", SearchOption.AllDirectories);
      var jsWithTS = allTS.Select(ts => Path.ChangeExtension(ts, ".js")).Where(js => File.Exists(js)).ToArray();
      foreach (var js in jsWithTS) {
        var newJS = toRemove + js.Substring(basicPath.Length);
        LowUtils.AdjustFileDir(newJS);
        if (File.Exists(newJS)) File.Delete(newJS);
        File.Move(js, newJS);
      }
      //var allTS2 = Directory.EnumerateFiles(basicPath2, "*.ts", SearchOption.AllDirectories);
      //var jsWithTS2 = allTS2.Select(ts => Path.ChangeExtension(ts, ".js")).Where(js => File.Exists(js)).ToArray();
      //foreach (var js in jsWithTS2) {
      //  var newJS = toRemove2 + js.Substring(basicPath2.Length);
      //  LowUtils.AdjustFileDir(newJS);
      //  File.Move(js, newJS);
      //}
      File.WriteAllLines(@"d:\temp\jsWithTS2.txt", jsWithTS);
    }
  }
}
