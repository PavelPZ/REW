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
      var basicPath = @"d:\temp\git\Web4";
      var toRemove = @"d:\temp\gitremove\Web4";
      var allTS = Directory.EnumerateFiles(basicPath, "*.ts", SearchOption.AllDirectories);
      var jsWithTS = allTS.Select(ts => Path.ChangeExtension(ts, ".js")).Where(js => File.Exists(js)).ToArray();
      foreach (var js in jsWithTS) {
        var newJS = toRemove + js.Substring(basicPath.Length);
        LowUtils.AdjustFileDir(js);
        //File.Move(js, newJS);
      }
      File.WriteAllLines(@"d:\temp\jsWithTS.txt", jsWithTS);
    }
  }
}
