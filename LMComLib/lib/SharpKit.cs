using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SharpKit.JavaScript {
  public enum JsMode {
    Global = 0,
    Prototype = 1,
    Clr = 2,
    Json = 3,
    ExtJs = 4,
  }
  public class JsTypeAttribute : Attribute {
    public JsTypeAttribute(JsMode mode) { }
    public bool AutomaticPropertiesAsFields { get; set; }
    public bool Export { get; set; }
    public string Exporter { get; set; }
    public string Filename { get; set; }
    public bool ForceDelegatesAsNativeFunctions { get; set; }
    public bool GlobalObject { get; set; }
    public bool IgnoreGenericMethodArguments { get; set; }
    public bool IgnoreGenericTypeArguments { get; set; }
    public bool InlineFields { get; set; }
    public JsMode Mode { get; set; }
    public string Name { get; set; }
    public bool Native { get; set; }
    public bool NativeArrayEnumerator { get; set; }
    public bool NativeCasts { get; set; }
    public bool NativeConstructors { get; set; }
    public bool NativeDelegates { get; set; }
    public bool NativeEnumerator { get; set; }
    public bool NativeError { get; set; }
    public bool NativeFunctions { get; set; }
    public bool NativeJsons { get; set; }
    public bool NativeOperatorOverloads { get; set; }
    public bool NativeOverloads { get; set; }
    public bool NativeParams { get; set; }
    public bool OmitCasts { get; set; }
    public bool OmitDefaultConstructor { get; set; }
    public bool OmitInheritance { get; set; }
    public bool OmitOptionalParameters { get; set; }
    public int OrderInFile { get; set; }
    public string PostCode { get; set; }
    public string PreCode { get; set; }
    public bool PropertiesAsFields { get; set; }
    public string PrototypeName { get; set; }
    public string SharpKitVersion { get; set; }
    public Type TargetType { get; set; }
    public string TargetTypeName { get; set; }
  }

  [AttributeUsage(AttributeTargets.Field)]
  public class JsFieldAttribute : Attribute {
    public JsFieldAttribute() { }
    public bool Export;
    public string Name;
  }

  public class JsArray<T> : List<T> { public int length { get { return Count; } } }
  public class JsObject<T> : List<T> {
    public JsObject() { }
    public JsObject(IEnumerable<T> items) : base(items) { }
  }
}
