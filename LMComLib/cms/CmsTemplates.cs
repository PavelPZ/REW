using System;
using System.Data;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Text;
using System.Web;
using System.Web.Security;
using System.Web.Hosting;
using System.Globalization;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Xml;
using System.Xml.Serialization;
using System.Reflection;
using System.Xml.Schema;
using System.Threading;

using LMNetLib;
using LMComLib;

namespace LMComLib.Cms {
  public enum PageType {
    Page,
    Control,
    MasterPage,
  }

  [AttributeUsage(AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
  public class CmsPageAttribute : System.Attribute {
    public CmsPageAttribute(PageType typ, string descr) {
      Descr = descr;
      Typ = typ;
    }
    public string Descr;
    public PageType Typ;
  }
  public abstract class CmsAttribute : System.Attribute {
    public CmsAttribute(int order, string descr) {
      Descr = descr;
      Order = order;
    }
    /// <summary>
    /// Popis atributu ve vizualnim editoru
    /// </summary>
    public string Descr;
    public bool CanInherit = true;

    public int Order;
    /// <summary>
    /// Priznak zacatku nove sekce ve vizualnim editoru
    /// </summary>
    public string StartGroupDescr;
    /// <summary>
    /// Atribut nesmi byt prazdny
    /// </summary>
    public bool Required;
    public abstract string getEditControlName(propInfo info);
    public abstract bool isDefault(object value);
    public abstract object getValue(propInfo info, object value);
    public virtual bool eqValue(object val1, object val2) {
      if (val1 == null && val2 == null) return true;
      if ((val1 == null) != (val2 == null)) return false;
      return ((IComparable)val1).CompareTo(val2) == 0;
    }
    public virtual string ValidateError(object val) {
      return null;
    }
  }
  public enum StringType {
    SingleLine,
    MultiLine,
    Html,
    ImgUrl,
    LmpUrl,
  }
  [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
  public class StringAttribute : CmsAttribute {
    public StringAttribute(int order, string descr) : base(order, descr) { }
    /// <summary>
    /// Typ editace stringu
    /// </summary>
    public StringType Type = StringType.SingleLine;
    /// <summary>
    /// Difotni hodnota
    /// </summary>
    public string Default;
    /// <summary>
    /// Ev. validacni vyraz pro SingleLine.
    /// </summary>
    public string regExpr;
    public override string getEditControlName(propInfo info) {
      return "EditString";
    }
    public override bool isDefault(object value) {
      return value == null || (string)value == Default;
    }
    public override object getValue(propInfo info, object value) {
      return (value == null) ? Default : value;
    }
  }

  [FlagsAttribute]
  public enum PageFilter {
    Page,
    Img,
    TheSameClass,
  }

  public class pageFilter {
    public Type[] Classes; //omezeni na jednu nebo vice class
    public PageFilter? FilterType; //omezeni na LMP, img nebo "The same page"
    public bool IncGlobal = false; //omezeni na aktualni site (=false) nebo na aktualni site a Domains.site (=true)
    public string getKey() //vrati klic pro ulozeni do cache
    {
      StringBuilder sb = new StringBuilder();
      if (Classes != null) foreach (Type cls in Classes) { sb.Append(cls.Name); sb.Append(","); }
      sb.Append("#");
      if (FilterType != null) sb.Append(FilterType.ToString());
      sb.Append("#");
      sb.Append(IncGlobal.ToString());
      return sb.ToString();
    }
    public bool nodeOK(CmsSiteMapNode nd, Template page) {
      if (FilterType != null) {
        switch ((PageFilter)FilterType) {
          case PageFilter.TheSameClass: return page != null && nd.className == page.GetType().FullName;
          case PageFilter.Img: return nd.urlInfo.Type == SiteMapNodeType.img;
          case PageFilter.Page: if (nd.urlInfo.Type != SiteMapNodeType.lmp) return false;
            if (Classes != null) {
              foreach (Type cls in Classes)
                if (cls.FullName == nd.className) return true;
              return false;
            } else
              return true;
        }
      }
      if (Classes != null) {
        foreach (Type cls in Classes)
          if (cls == typeof(ImgTemplate) && nd.urlInfo.Type == SiteMapNodeType.img)
            return true;
          else if (cls.FullName == nd.className)
            return true;
        return false;
      } else
        return true;
    }
  }

  public abstract class PointerAttributeLow : CmsAttribute {
    public PointerAttributeLow(int order, string descr) : base(order, descr) { }
    pageFilter filter = new pageFilter();
    public pageFilter Filter {
      get { return filter; }
    }
    public Type[] Classes {
      get { return null; }
      set { filter.Classes = value; }
    }
    public PageFilter FilterType {
      get { return PageFilter.Page; }
      set { filter.FilterType = value; }
    }
    public bool IncGlobal {
      get { return true; }
      set { filter.IncGlobal = value; }
    }
  }

  [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
  public class PointerAttribute : PointerAttributeLow {
    public PointerAttribute(int order, string descr) : base(order, descr) { }
    public override string getEditControlName(propInfo info) {
      return "EditPointer";
    }
    public override object getValue(propInfo info, object value) {
      return value;
    }
    public override bool isDefault(object value) {
      return value == null;
    }
  }
  [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
  public class PointerAttributes : PointerAttributeLow {
    public PointerAttributes(int order, string descr) : base(order, descr) { }
    public override string getEditControlName(propInfo info) {
      return "EditPointers";
    }
    public override object getValue(propInfo info, object value) {
      return value;
    }
    public override bool isDefault(object value) {
      return value == null;
    }
    public override bool eqValue(object val1, object val2) {
      if (val1 == null && val2 == null) return true;
      if ((val1 == null) != (val2 == null)) return false;
      int[] v1 = (int[])val1; int[] v2 = (int[])val2;
      if (v1.Length != v2.Length) return false;
      for (int i = 0; i < v1.Length; i++)
        if (v1[i] != v2[i]) return false;
      return true;
    }
  }

  [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
  public class CurrencyAttribute : CmsAttribute {
    public CurrencyAttribute(int order, string descr) : base(order, descr) { }
    public CurrencyType Currencies;
    public double DefaultAmount;
    public CurrencyType DefaultTyp;
    public bool DefaultWithWat;
    public override string getEditControlName(propInfo info) {
      return "EditCurrency";
    }
    public override object getValue(propInfo info, object value) {
      return (value == null) ? new Currency(DefaultTyp, DefaultAmount, DefaultWithWat) : value;
    }
    public override bool isDefault(object value) {
      if (value == null) return true;
      Currency curr = (Currency)value;
      return curr.Typ == DefaultTyp && curr.Amount == DefaultAmount && curr.WithVat == DefaultWithWat;
    }
    public override bool eqValue(object val1, object val2) {
      if (val1 == null && val2 == null) return true;
      if ((val1 == null) != (val2 == null)) return false;
      return ((Currency)val1).Typ == ((Currency)val2).Typ && ((Currency)val1).Amount == ((Currency)val2).Amount && ((Currency)val1).WithVat == ((Currency)val2).WithVat;
    }
  }

  [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
  public class BoolAttribute : CmsAttribute {
    public BoolAttribute(int order, string descr) : base(order, descr) { }
    public bool Default;
    public override string getEditControlName(propInfo info) {
      return "EditBool";
    }
    public override object getValue(propInfo info, object value) {
      return (value == null) ? Default : value;
    }
    public override bool isDefault(object value) {
      return value == null || (bool)value == Default;
    }
  }

  [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
  public class LicenceFeeAttribute : CmsAttribute {
    public LicenceFeeAttribute(int order, string descr) : base(order, descr) { }

    public override string getEditControlName(propInfo info) {
      return "EditLicencors";
    }
    public override object getValue(propInfo info, object value) {
      return value;
    }
    public override bool isDefault(object value) {
      return value == null;
    }
    public override bool eqValue(object val1, object val2) {
      if (val1 == null && val2 == null) return true;
      if ((val1 == null) != (val2 == null)) return false;
      return false;
    }
  }

  [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
  public class UploadAttribute : CmsAttribute {
    public UploadAttribute(int order, string descr) : base(order, descr) { }

    public override string getEditControlName(propInfo info) {
      return "EditUpload";
    }
    public override object getValue(propInfo info, object value) {
      return null;
    }
    public override bool isDefault(object value) {
      return false;
    }
  }

  [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
  public class DateAttribute : CmsAttribute {
    public DateAttribute(int order, string descr) : base(order, descr) { }
    public DateTime def;
    public string Default {
      set {
        if (!DateTime.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out def))
          def = LowUtils.startDate;
        def = def.ToUniversalTime();
      }
      get { return null; }
    }
    public override string getEditControlName(propInfo info) {
      return "EditDate";
    }
    public override object getValue(propInfo info, object value) {
      return (value == null) ? def : value;
    }
    public override bool isDefault(object value) {
      return value == null || (DateTime)value == def;
    }
  }

  [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
  public class IntAttribute : CmsAttribute {
    public IntAttribute(int order, string descr) : base(order, descr) { }
    public int Default;
    public int? minValue;
    public int? maxValue;
    public override string getEditControlName(propInfo info) {
      return "EditInt";
    }
    public override object getValue(propInfo info, object value) {
      return (value == null) ? Default : value;
    }
    public override bool isDefault(object value) {
      return value == null || (int)value == Default;
    }
  }

  [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
  public class EnumAttribute : CmsAttribute {
    public EnumAttribute(int order, string descr, Type enumType)
      : base(order, descr) {
      EnumType = enumType;
    }
    public Type EnumType;
    public object Default = 0;
    public override string getEditControlName(propInfo info) {
      return "EditEnum";
    }
    public override object getValue(propInfo info, object value) {
      return (value == null) ? Default : value;
    }
    public object getEnum(object value) {
      return Enum.ToObject(EnumType, value);
    }
    public override bool isDefault(object value) {
      return value == null || (int)value == (int)Default;
    }
  }

  public class propInfo {
    public CmsAttribute Attribute;
    public MemberInfo Field;
    public MemberInfo Ptr;
    public object GetValue(Template obj, out bool isDefault) {
      object val = Field is FieldInfo ? ((FieldInfo)Field).GetValue(obj) : ((PropertyInfo)Field).GetValue(obj, null);
      Template anc = Attribute.CanInherit ? obj.getAncestor() : null;
      if (anc == null)
        isDefault = Attribute.isDefault(val);
      else {
        if (val == null) {
          val = GetValue(anc, out isDefault);
          isDefault = true;
        } else
          isDefault = false;
      }
      return Attribute.getValue(this, val);
    }
    public void SetValue(Template obj, object value) {
      if (LibConfig.Usage == LibUsage.LMComWebAdmin) {
        Template anc = Attribute.CanInherit ? obj.getAncestor() : null;
        bool isDef;
        if (anc != null) {
          object ancVal = GetValue(anc, out isDef);
          isDef = Attribute.eqValue(ancVal, value);
        } else
          isDef = Attribute.isDefault(value);
        if (isDef) value = null;
      }
      if (Field is FieldInfo)
        ((FieldInfo)Field).SetValue(obj, value);
      else
        ((PropertyInfo)Field).SetValue(obj, value, null);
    }
    public object GetPtrValue(Template obj) {
      LibConfig.DesignTimeEq(false); //nesmi byt designtine
      return Ptr is FieldInfo ? ((FieldInfo)Ptr).GetValue(obj) : ((PropertyInfo)Ptr).GetValue(obj, null);
    }
    public void SetPtrValue(Template obj, object value) {
      LibConfig.DesignTimeEq(false); //nesmi byt designtine
      if (Ptr is FieldInfo)
        ((FieldInfo)Ptr).SetValue(obj, value);
      else
        ((PropertyInfo)Ptr).SetValue(obj, value, null);
    }
    public Type Type() {
      return Field is FieldInfo ? ((FieldInfo)Field).FieldType : ((PropertyInfo)Field).PropertyType;
    }
    public Type PtrType() {
      return Ptr is FieldInfo ? ((FieldInfo)Ptr).FieldType : ((PropertyInfo)Ptr).PropertyType;
    }
  }

  public class typeInfo {
    public Type Typ;
    public CmsPageAttribute Attribute;
    public List<propInfo> Props = new List<propInfo>();
    public Template Example;
    public propInfo getProp(string name) {
      foreach (propInfo pr in Props)
        if (pr.Field.Name == name) return pr;
      throw new Exception(string.Format("Cannot find {0}.{1} property", Example.GetType().Name, name));
    }
  }

  //public class Page {
  //  public Template Item;
  //}

  public abstract class Template : ICmsSerialize {
    [XmlIgnore]
    public abstract string Name { get; set; }

    [EnumAttribute(10, "Zabezpečení", typeof(SecurityDir), CanInherit = false)]
    [XmlIgnore]
    public SecurityDir Security {
      get { return cmsNode != null ? cmsNode.urlInfo.Security : SecurityDir.no; }
      set { if (cmsNode != null) cmsNode.urlInfo.Security = value; }
    }

    [PointerAttribute(30, "Předchůdce", CanInherit = false, FilterType = PageFilter.TheSameClass)]
    public int? ancestor;
    [XmlIgnore]
    public CacheNode Ancestor;

    public Template getAncestor() {
      if (ancestor == null) return null;
      if (LibConfig.Usage == LibUsage.LMComWebAdmin) {
        Template res = CmsEditContext.getPage((int)ancestor);
        if (res.GetType() != GetType())
          throw new Exception("ancestor has different className");
        return res;
      } else
        return Ancestor.getTemplate();
    }

    [XmlIgnore]
    public SiteMapNode node;
    [StringAttribute(40, "Titulek", Default = "Chybějící titulek")]
    [XmlIgnore]
    public string Title {
      get { return cmsNode != null ? cmsNode.title : (node==null ? null : node.Title); }
      set { if (cmsNode != null) cmsNode.title = value;}
    }

    [XmlIgnore]
    public urlInfoLow Info; //pouze pro runtime: informace z URL adresy

    [XmlIgnore]
    public CmsSiteMapNode cmsNode {
      get { return LibConfig.Usage == LibUsage.LMComWebAdmin ? CmsEditContext.getSiteMap().FindNode(dbId) : null; }
    }
    [XmlIgnore]
    public int dbId; //pouze pro designtime: dbId pro svazani s CmsSiteMapNode

    CmsFile _cmsFile;
    [XmlIgnore]
    public CmsFile cmsFile {
      get { if (_cmsFile == null) _cmsFile = new CmsFile(this); return _cmsFile; }
    }

    public virtual byte[] SerializeToUtf8String() //ICmsSerialize
    {
      return SaveToUtf8String(this);
    }
    public string GetFileName() //ICmsSerialize
    {
      return cmsNode.urlInfo.getFileName();
    }

    static Dictionary<string, typeInfo> infos;
    static List<Type> templateTypes = new List<Type>();
    public static Dictionary<string, typeInfo> Infos {
      get {
        lock (typeof(Template)) {
          if (infos != null) return infos;
          infos = new Dictionary<string, typeInfo>();
          foreach (Type tp in templateTypes) {
            typeInfo res = new typeInfo();
            res.Typ = tp;
            object[] attrs = tp.GetCustomAttributes(typeof(CmsPageAttribute), true);
            if (attrs.Length != 1)
              throw new Exception(string.Format("Template.InitTypes: missing CmsPageAttribute attribute at {0}", tp.Name));
            res.Attribute = (CmsPageAttribute)attrs[0];
            Template ex = (Template)tp.GetConstructor(Type.EmptyTypes).Invoke(null);
            allTemp.Page.Add(ex);
            foreach (MemberInfo mi in allMembers(tp))
              foreach (CmsAttribute attr in Attribute.GetCustomAttributes(mi, typeof(CmsAttribute), true)) {
                propInfo prop = new propInfo();
                prop.Attribute = attr;
                prop.Field = mi;
                //doplneni pointer source property
                if (attr is PointerAttributeLow) {
                  string nm = char.ToUpper(mi.Name[0]) + mi.Name.Substring(1);
                  prop.Ptr = tp.GetMember(nm)[0];
                  if (prop.Ptr == null) throw new Exception(string.Format("Template.InitTypes: missing field {0}.{1}", tp.Name, nm));
                  if (attr is PointerAttributes) {
                    if (prop.PtrType() != typeof(CacheNode)) new Exception(string.Format("Template.InitTypes: wrong field {0}.{1}", tp.Name, nm));
                  } else {
                    if (prop.PtrType() != typeof(CacheNode[])) new Exception(string.Format("Template.InitTypes: wrong field {0}.{1}", tp.Name, nm));
                  }
                }
                //initializace Example a kontrola attr typu
                if (prop.Type() == typeof(string))
                  checkTypes(ex, mi.Name, prop, attr, typeof(StringAttribute));
                else if (prop.Type() == typeof(Currency))
                  checkTypes(ex, new Currency(CurrencyType.csk, 123.456F), prop, attr, typeof(CurrencyAttribute));
                else if (prop.Type() == typeof(int?) && prop.Ptr != null)
                  checkTypes(ex, 333333, prop, attr, typeof(PointerAttribute));
                else if (prop.Type() == typeof(int[]))
                  checkTypes(ex, new int[] { 33, 44, 555555 }, prop, attr, typeof(PointerAttributes));
                else if (prop.Type() == typeof(bool))
                  checkTypes(ex, true, prop, attr, typeof(BoolAttribute));
                else if (prop.Type() == typeof(int?))
                  checkTypes(ex, -123456, prop, attr, typeof(IntAttribute));
                res.Props.Add(prop);
              }
            res.Props.Sort(delegate(propInfo p1, propInfo p2) { return p1.Attribute.Order - p2.Attribute.Order; });
            infos.Add(tp.FullName.ToLower(), res);
          }
        }
        return infos;
      }
    }
    public class AllTemplates {
      public ArrayList Page = new ArrayList();
    }
    /// <summary>
    /// Kvuli XSD: obsahuje priklady vsech Templates. Ty se zapisi do XML a z XML se odvodi XSD schema
    /// </summary>
    static AllTemplates allTemp = new AllTemplates();
    public static typeInfo getType(Type tp) {
      return getType(tp.FullName);
    }

    public typeInfo getType() {
      return getType(this.GetType());
    }

    public propInfo getProp(string propName) {
      return getType().getProp(propName);
    }

    public static typeInfo getType(string fullName) {
      try {
        return Infos[fullName.ToLower()];
      } catch (Exception exp) {
        throw new Exception(fullName, exp);
      }
    }

    public static void refreshXsd(string fileName) {
      MemoryStream ms = new MemoryStream();
      XmlAttributes attrs = new XmlAttributes();
      foreach (typeInfo tpi in Infos.Values)
        attrs.XmlArrayItems.Add(new XmlArrayItemAttribute(tpi.Typ));
      XmlAttributeOverrides attrOverrides = new XmlAttributeOverrides();
      attrOverrides.Add(typeof(AllTemplates), "Page", attrs);
      XmlSerializer serializer = new XmlSerializer(allTemp.GetType(), attrOverrides);
      using (StringWriter writer = new StringWriter()) {
        serializer.Serialize(writer, allTemp);
        using (XmlReader reader = XmlReader.Create(new StringReader(writer.ToString()))) {
          XmlSchemaInference schema = new XmlSchemaInference();
          XmlSchemaSet schemaSet = schema.InferSchema(reader);
          foreach (XmlSchema s in schemaSet.Schemas())
            using (TextWriter wr = new StreamWriter(fileName)) { s.Write(wr); break; }
        }
      }
    }

    public static string onFindPointer(string name) {
      if (name == "~") return HttpRuntime.AppDomainAppVirtualPath;
      int id;
      if (!int.TryParse(name, out id)) return "wrong pointer " + name;
      CacheNode nd = CacheItems.GetNode(id);
      if (nd == null) return "missing pointer " + name;
      return nd.Info.Type == SiteMapNodeType.img ? nd.Info.AbsUrl() : nd.Info.AbsVisibleUrl();
    }

    public void Finish() {
      if (LibConfig.Usage == LibUsage.LMComWebAdmin) return; //pro LMComWebAdmin se Finish neprovadi
      string lang = Thread.CurrentThread.CurrentUICulture.Name;
      bool isDefault;
      foreach (propInfo prop in getType(GetType()).Props) {
        //dedeni
        prop.SetValue(this, prop.GetValue(this, out isDefault));
        if (prop.Attribute is PointerAttributeLow) {
          //fixace pointeru
          object val = prop.GetValue(this, out isDefault);
          if (val == null) continue;
          if (prop.Attribute is PointerAttribute)
            prop.SetPtrValue(this, CacheItems.GetNodeNoNull((int)val));
          else {
            List<CacheNode> nds = new List<CacheNode>();
            foreach (int id in (int[])val)
              if (id > 0) nds.Add(CacheItems.GetNodeNoNull(id));
            prop.SetPtrValue(this, nds.ToArray());
          }
        } /*else if (prop.Attribute is StringAttribute && ((StringAttribute)prop.Attribute).Type == StringType.Html) {
          //adjustace odkazu v HTML
          string html = (string)prop.GetValue(this, out isDefault);
          if (!string.IsNullOrEmpty(html)) {
            if (sb == null) sb = new StringBuilder();
            html = LowUtils.FormatEx(html, new LowUtils.findValueEvent(onFindPointer), sb);
            prop.SetValue(this, html);
          }
        }*/

      }
    }
    public static string getHtml(string html) {
      if (string.IsNullOrEmpty(html) || html.IndexOf("[#") < 0) return html;
      return LowUtils.FormatEx(html, new LowUtils.findValueEvent(onFindPointer));
    }
    static void checkTypes(Template ex, object val, propInfo mi, CmsAttribute attr, params Type[] types) {
      //if (LibConfig.Usage != LibUsage.LMComWebAdmin) return; //pro LMCom se checkTypes neprovadi
      foreach (Type typ in types)
        if (attr.GetType() == typ) {
          //if (val != null) mi.SetValue(ex, val);
          return;
        }
      throw new Exception(string.Format("Wrong CmsAttribute at {0}.{1}", ex.GetType().Name, mi.Field.Name));
    }
    static IEnumerable<MemberInfo> allMembers(Type tp) {
      foreach (FieldInfo f in tp.GetFields()) yield return f;
      foreach (PropertyInfo f in tp.GetProperties()) yield return f;
    }

    public static void InitTypes(params Type[] tps) {
      foreach (Type tp in tps)
        templateTypes.Add(tp);
    }

    public static Type findTemplateType(string cls) {
      Type tp = Assembly.GetAssembly(typeof(Template)).GetType(cls);
      if (tp == null)
        throw new Exception(string.Format("Lib.Load: wrong full class name ({0})", cls));
      return tp;
    }

    public static Template Load(string fileName, string cls) {
      try {
        if (string.IsNullOrEmpty(cls))
          throw new Exception(string.Format("Lib.Load: missing template SiteMapNode attribute ({0})", fileName));
        Type tp = findTemplateType(cls);
        XmlAttributes attrs = new XmlAttributes();
        Template res = null;
        attrs.XmlRoot = new XmlRootAttribute();
        attrs.XmlRoot.Namespace = "LmCms";
        XmlAttributeOverrides attrOverrides = new XmlAttributeOverrides();
        attrOverrides.Add(tp, attrs);
        XmlSerializer serializer = new XmlSerializer(tp, attrOverrides);
        using (TextReader reader = new StreamReader(fileName))
          res = (Template)serializer.Deserialize(reader);
        res.Finish();
        return res;
      } catch (Exception exp) {
        throw new Exception(fileName, exp);
      }
    }

    public static byte[] SaveToUtf8String(Template obj) {
      XmlAttributes attrs = new XmlAttributes();
      attrs.XmlRoot = new XmlRootAttribute();
      attrs.XmlRoot.Namespace = "LmCms";
      XmlAttributeOverrides attrOverrides = new XmlAttributeOverrides();
      attrOverrides.Add(obj.GetType(), attrs);
      XmlSerializer serializer = new XmlSerializer(obj.GetType(), attrOverrides);
      MemoryStream ms = new MemoryStream();
      using (TextWriter writer = new StreamWriter(ms)) {
        serializer.Serialize(writer, obj);
        ms.Seek(0, SeekOrigin.Begin);
        writer.Flush();
        return ms.ToArray();
      }
    }
    public static void Save(Template obj, string path) {
      Save(SaveToUtf8String(obj), path);
    }

    public static void Save(byte[] data, string path) {
      LowUtils.AdjustFileDir(path);
      using (FileStream fs = new FileStream(path, FileMode.Create))
        fs.Write(data, 0, data.Length);
    }

    public static string SiteFileName(Domains dom, string path) {
      return string.Format(@"{0}{1}\web\{2}", System.Configuration.ConfigurationManager.AppSettings["lmcomAppPath"], dom, path);
    }

    public static int UniqueId() {
      lock (typeof(Template)) {
        string fn = HostingEnvironment.ApplicationPhysicalPath + @"app_data\UniqueId.txt";
        string ui = StringUtils.FileToString(fn);
        int cnt = int.Parse(ui) + 1;
        StringUtils.StringToFile(cnt.ToString(), fn);
        return cnt;
      }
    }

    public virtual string PageAspx() {
      return null;
    }

  }

  [CmsPageAttribute(PageType.Page, "Popis")]
  public class ImgTemplate : Template {
    public override byte[] SerializeToUtf8String() {
      return null;
    }
    [StringAttribute(20, "Url path", Type = StringType.ImgUrl, CanInherit = false, Required = true, regExpr = @"([;:@&=a-zA-Z0-9\$\-_\+\*\',\(\)!]|(\%[0-9a-fA-F][0-9a-fA-F]))+(/([;:@&=a-zA-Z0-9\$\-_\+\*\',\(\)!]|(\%[0-9a-fA-F][0-9a-fA-F]))+)*")]
    [XmlIgnore]
    public override string Name {
      get { return cmsNode != null ? cmsNode.urlInfo.Name + "." + cmsNode.urlInfo.Ext : null; }
      set {
        if (cmsNode == null) return;
        int idx = value.LastIndexOf('.');
        cmsNode.urlInfo.Name = value.Substring(0, idx);
        cmsNode.urlInfo.Ext = value.Substring(idx + 1);
      }
    }
    [UploadAttribute(30, "upload img", CanInherit = false)]
    [XmlIgnore]
    public object Upload {
      get { return null; }
      set { ;}
    }

    public static void assignToAspImg(CacheNode obj, Image aspImg) {
      if (obj == null) { aspImg.Visible = false; return; }
      urlInfoLow inf = obj.getTemplate().Info;
      aspImg.ImageUrl = inf.Url();
      aspImg.Width = inf.imgWidth();
      aspImg.Height = inf.imgHeight();
    }

    public UniversalDataItem getData() {
      return new UniversalDataItem(this, null, null, Info);
    }

  }

  public abstract class PageTemplate : Template {
    [StringAttribute(20, "Url cesta", Type = StringType.LmpUrl, CanInherit = false)]
    [XmlIgnore]
    public override string Name {
      get { return cmsNode != null ? cmsNode.urlInfo.Name : null; }
      set { if (cmsNode != null) cmsNode.urlInfo.Name = value; }
    }

    public virtual string ContentControlUrl() {
      return null;
    }

  }

  [EnumDescrAttribute(typeof(TestEnum), "Enum1=Prvni moznost,Enum2=Druha moznost")]
  public enum TestEnum {
    Enum1,
    Enum2
  }

  //[CmsPageAttribute(PageType.Page, "Popis Test class")]
  //public class Test : PageTemplate {

  //  [StringAttribute(105, "Popis String prop", Default = "def", Required = true, StartGroupDescr = "Zacatek skupiny 1")]
  //  public string Str;

  //  [EnumAttribute(107, "Popis Enum prop", typeof(TestEnum), Default = TestEnum.Enum2)]
  //  public TestEnum? Enum;

  //  [BoolAttribute(110, "Popis Check prop", Default = true)]
  //  public bool? Check;

  //  [IntAttribute(120, "Popis Num prop", Default = 123, StartGroupDescr = "Zacatek skupiny 2")]
  //  public int? Num;

  //  [CurrencyAttribute(130, "Popis Curr prop", Currencies = CurrencyType.csk, DefaultAmount = 100, DefaultTyp = CurrencyType.csk)]
  //  public Currency? Curr;

  //  [DateAttribute(135, "Popis Date prop", Default = "2007-12-31")]
  //  public DateTime? Date;

  //  [PointerAttribute(140, "Popis ptr Prop", FilterType = PageFilter.Page, IncGlobal = false, Classes = new Type[] { typeof(Test) })]
  //  public int? ptr;
  //  [XmlIgnore]
  //  public CacheNode Ptr;

  //  [PointerAttributes(150, "Popis ptrs prop")]
  //  public int[] ptrs;
  //  [XmlIgnore]
  //  public CacheNode[] Ptrs;
  //}

  public class UniversalDataItem {
    public UniversalDataItem(Template temp, string Perex, string RelativeUrl, CacheNode nd)
      : this(temp, Perex, RelativeUrl, nd == null ? null : nd.Info) { }

    public UniversalDataItem(Template temp, string Perex, string RelativeUrl, urlInfoLow info) {
      if (temp is Product) {
        string tit = ((Product)temp).ShortTitle;
        this.title = string.IsNullOrEmpty(tit) ? temp.Title : tit;
      } else
        this.title = temp.Title;
      _dbId = temp.Info.dbId;
      this.perex = Template.getHtml(Perex);
      this.relativeUrl = RelativeUrl;
      this.date = DateTime.MinValue;
      this.subtitle = "";
      if (info != null) {
        this.relativeIconUrl = info.AbsUrl();
        this.width = info.imgWidth();
        this.height = info.imgHeight();
      }
    }
    //public static List<UniversalDataItem> CreateDataSource(IEnumerable nodes) {
    //  if (nodes == null) return null;
    //  List<UniversalDataItem> res = new List<UniversalDataItem>();
    //  foreach (object obj in nodes) {
    //    Template temp = obj is CacheNode ? ((CacheNode)obj).getTemplate() : CacheItems.GetNode((SiteMapNode)obj).getTemplate();
    //    if (temp is Product)
    //      res.Add(((Product)temp).getData());
    //    else if (temp is UniversalItem)
    //      res.Add(((UniversalItem)temp).getData());
    //    if (temp is ImgTemplate)
    //      res.Add(((ImgTemplate)temp).getData());
    //  }
    //  return res;
    //}
    string title;
    public string Title {
      get { return title; }
    }
    internal string subtitle;
    public string SubTitle {
      get { return subtitle; }
    }
    string perex;
    public string Perex {
      get { return perex; }
    }
    string relativeUrl;
    public string RelativeUrl {
      get { return relativeUrl; }
    }
    string relativeIconUrl;
    public string RelativeIconUrl {
      get { return relativeIconUrl; }
    }
    internal DateTime date;
    public DateTime Date {
      get { return date; }
    }
    int _dbId;
    public int dbId {
      get { return _dbId; }
    }
    internal int width;
    public int Width {
      get { return width; }
    }
    internal int height;
    public int Height {
      get { return height; }
    }
    internal double price;
    public double Price {
      get { return price; }
    }
    public bool pageOnly { get; set; }
  }

}