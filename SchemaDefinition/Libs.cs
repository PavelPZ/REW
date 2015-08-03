/* Prelozit ObjectModel.proj a pak prelozit SchemaDefinition.proj. Pak slouzi 
 * - na generaci dokumentace do d:\LMCom\rew\SchemaDefinition\SchemaDefinition.xml
 * - na generaci schema do d:\LMCom\rew\SchemaDefinition\schema.xsd
 * */
using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Text;
using System.Xml.Linq;
using System.Reflection;
using System.Xml.Serialization;
using System.Xml;
using System.Xml.Schema;
#pragma warning disable 1591

namespace Newtonsoft.Json {
  [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false)]
  public sealed class JsonIgnoreAttribute : Attribute {
  }
}

namespace LMComLib {
  public class JsonGenOnlyAttribute : Attribute { }
  public static class Machines {
    public static string basicPath = @"d:\LMCom\";
    public static string rootDir = basicPath + @"rew\web4";
  }
  public enum ExerciseStatus {
    Unknown = 0,
    Normal = 1,
    Preview = 2,
    Evaluated = 3,
    //pro modul
    notAttempted = 4,
    removed = 5,
    PreviewLector = 6,
  }
}

namespace LMNetLib {
//  public static class XmlUtils {
//    public static string ObjectToString(Object obj) {
//      XmlSerializer ser = new XmlSerializer(obj.GetType());
//      using (var wr = new StringWriter()) { ser.Serialize(wr, obj); return wr.ToString(); }
//    }
//    public static void ObjectToFile(string fn, Object obj) {
//      File.WriteAllText(fn, ObjectToString(obj), Encoding.UTF8);
//    }
//    public static T StringToObject<T>(string xml) {
//      XmlSerializer ser = new XmlSerializer(typeof(T));
//      using (var rdr = new StringReader(xml)) {
//        var res = (T)ser.Deserialize(rdr);
//        return res;
//      }
//    }
//    public static T FileToObject<T>(string fn) {
//      return StringToObject<T>(File.ReadAllText(fn));
//    }
//    public static IEnumerable<T> EnumGetValues<T>() {
//      return Enum.GetValues(typeof(T)).Cast<T>();
//    }
//  }
  public static class LowUtils {
    public static IEnumerable<T> EnumGetValues<T>() {
      return Enum.GetValues(typeof(T)).Cast<T>();
    }

  }
}


#pragma warning restore 1591
