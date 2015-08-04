using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
//using Noesis.Javascript;
using System.IO;
using LMNetLib;
using LMComLib;

namespace Noesis {
  public static class Lib {
    public static string Obj2RJSON(object obj) {
      return JSON2RJSON(JsonHelper.Serialize(obj));
    }
    public static string JSON2RJSON(string inpJson) {
      using (var js = new Noesis.Javascript.JavascriptContext()) {
        js.SetParameter("inputJson", inpJson);
        var script =
          File.ReadAllText(Machines.basicPath + @"rew\Web4\JsLib\Scripts\json2.js") + "\r\n" +
          File.ReadAllText(Machines.basicPath + @"rew\Web4\JsLib\JS\External\RJSON.js") + "\r\n" +
          "var obj = JSON.parse(inputJson); var packed = RJSON.pack(obj); outputJson = JSON.stringify(packed);";
        try {
          js.Run(script);
        } catch (Exception exp) {
          throw exp;
        }
        return (string)js.GetParameter("outputJson");
      }
    }
  }
}