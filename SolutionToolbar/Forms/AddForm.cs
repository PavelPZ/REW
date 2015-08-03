using CourseMeta;
using LMComLib;
using LMNetLib;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Xml.Linq;

namespace Author {
  public partial class AddForm : Form {
    public AddForm() {
      InitializeComponent();
    }
    public AddForm(actions action, fileContext file, Action<string, Action<string>> onFinish)
      : this() {
      this.file = file; this.action = action;
      this.onFinish = onFinish;

      switch (action) {
        case actions.addFolder: PropertyEditor.SelectedObject = editedObj = new addFolder(this); break;
        case actions.addTest: PropertyEditor.SelectedObject = editedObj = new addTest(this); break;
        case actions.addCourse: PropertyEditor.SelectedObject = editedObj = new addCourse(this); break;
        case actions.addMod: PropertyEditor.SelectedObject = editedObj = new addMod(this); break;
        case actions.addTestSkill: PropertyEditor.SelectedObject = editedObj = new addTestSkill(this); break;
        case actions.addTestTaskGroup: PropertyEditor.SelectedObject = editedObj = new addTestTaskGroup(this); break;
      }
    }

    private void OKBtn_Click(object sender, EventArgs e) {
      Close();
      var obj = editedObj.createData();
      onFinish(editedObj.name, fn => data.writeObject(obj, fn));
    }
    Action<string, Action<string>> onFinish;
    addFolder editedObj;
    public actions action;
    public publisherContext publ;
    public fileContext file;
  }

  public class addFolder {
    protected addFolder(AddForm self, string folderName) {
      this.self = self;
      var idx = Enumerable.Range(1, 1000).First(i => !self.file.folderContent.Contains(folderName + "_" + i.ToString()));
      name = folderName + "_" + idx.ToString(); title = "title " + idx.ToString();
    }

    public addFolder(AddForm self) : this(self, "folder") { }

    [DisplayName("Folder name")]
    [TypeConverter(typeof(folderNameConverter))]
    [Browsable(true)]
    public string name { get; set; }

    [DisplayName("Folder title")]
    [Browsable(true)]
    public string title { get; set; }

    [DisplayName("Order")]
    [TypeConverter(typeof(UInt32Converter))]
    public UInt32 order { get; set; }

    public data createData() { data dt = null; createAndFill(ref dt, true); createAndFill(ref dt, false); return dt; }

    protected virtual void createAndFill(ref data dt, bool isCreate) { if (isCreate) dt = new data(); else { dt.title = title; dt.order = (int)order; } }

    public AddForm self;

    static protected void hideProp(string name) {
      PropertyDescriptor descriptor = TypeDescriptor.GetProperties(typeof(addTestSkill))[name];
      BrowsableAttribute attrib = (BrowsableAttribute)descriptor.Attributes[typeof(BrowsableAttribute)];
      FieldInfo browsable = attrib.GetType().GetField("browsable", BindingFlags.NonPublic | BindingFlags.Instance);
      browsable.SetValue(attrib, false);
    }

    public virtual void validateProperty(string name, object value) { }
  }

  public class lineAble : addFolder {
    protected lineAble(AddForm self, string folderName) : base(self, folderName) { }

    [DisplayName("Learned language")]
    [TypeConverter(typeof(LineConverter))]
    public LineIds line { get; set; }
  }

  public class addTest : lineAble {
    public addTest(AddForm self) : base(self, "test") { line = LineIds.English; title = "A1"; }

    protected override void createAndFill(ref data dt, bool isCreate) {
      if (isCreate) dt = new test(); else { base.createAndFill(ref dt, false); dt.line = line; dt.type |= runtimeType.project; }
    }
  }

  public class addCourse : lineAble {
    public addCourse(AddForm self) : base(self, "course") { line = LineIds.English; }

    protected override void createAndFill(ref data dt, bool isCreate) {
      if (isCreate) dt = new taskCourse(); else { base.createAndFill(ref dt, false); dt.line = line; dt.type |= runtimeType.project; }
    }
  }

  public class addMod : addFolder {
    public addMod(AddForm self) : base(self, "module") { }

    protected override void createAndFill(ref data dt, bool isCreate) {
      if (isCreate) dt = new mod(); else { base.createAndFill(ref dt, false); }
    }
  }

  public class addTestSkill : addFolder {

    static addTestSkill() { hideProp("title"); hideProp("name"); }

    public addTestSkill(AddForm self) : base(self, null) { skill = SkillConverter.correctSkills(this).First(); minutes = 5; }
    protected override void createAndFill(ref data dt, bool isCreate) {
      if (isCreate) dt = new taskTestSkill(); 
      else {
        name = skill.ToString(); title = skill.ToString();
        base.createAndFill(ref dt, false);
        dt.type |= (runtimeType.taskTestSkill | runtimeType.noDict | runtimeType.mod | runtimeType.dynamicModuleData);
        ((taskTestSkill)dt).skill = skill; ((taskTestSkill)dt).minutes = minutes;
      }
    }

    [DisplayName("Tested skill")]
    [TypeConverter(typeof(SkillConverter))]
    public string skill { get; set; }

    [DisplayName("Minutes")]
    [TypeConverter(typeof(intConverter))]
    public int minutes { get; set; }
  }

  public class addTestTaskGroup : addFolder {
    public addTestTaskGroup(AddForm self) : base(self, "task_group") { take = 1; }

    [DisplayName("Take from pool")]
    [TypeConverter(typeof(intConverter))]
    public int take { get; set; }

    protected override void createAndFill(ref data dt, bool isCreate) {
      if (isCreate) dt = new testTaskGroup(); else { base.createAndFill(ref dt, false); dt.type |= runtimeType.testTaskGroup; ((testTaskGroup)dt).take = take; }
    }

    public override void validateProperty(string name, object value) {
      switch (name) {
        case "take": if (Convert.ToInt32(value) <= 0) throw new Exception("Value greater than zero expected"); break;
      }
    }
  }

  public class folderNameConverter : StringConverter {
    public override object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, object value) {
      var obj = context.Instance as addFolder; var name = Convert.ToString(value).ToLower();
      if (obj.self.file.folderContent.Contains(name)) throw new Exception(string.Format("Directory '{0}' already exists!", name));
      return name;
    }
  }

  public class intConverter : Int32Converter {
    public override object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, object value) {
      var obj = context.Instance as addFolder; var name = Convert.ToString(value).ToLower();
      obj.validateProperty(context.PropertyDescriptor.Name, value);
      return base.ConvertFrom(context, culture, value);
    }
  }

  public class LMEnumConverter<T> : TypeConverter {
    public LMEnumConverter() { }
    public override bool GetStandardValuesSupported(ITypeDescriptorContext context) { return true; }
    public override StandardValuesCollection GetStandardValues(ITypeDescriptorContext context) { return new StandardValuesCollection(filter(context, Enum.GetValues(typeof(T)).Cast<object>()).ToArray()); }
    public override bool CanConvertFrom(ITypeDescriptorContext context, Type srcType) { return true; }
    public override object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, object value) { return Enum.Parse(typeof(T), (string)value); }
    public override bool CanConvertTo(ITypeDescriptorContext context, Type destinationType) { return true; }
    public override object ConvertTo(ITypeDescriptorContext context, CultureInfo culture, object value, Type destinationType) { return value.ToString(); }
    public override bool GetStandardValuesExclusive(ITypeDescriptorContext context) { return false; }

    protected virtual IEnumerable<object> filter(ITypeDescriptorContext context, IEnumerable<object> data) { return data; }
  }
  public class LineConverter : LMEnumConverter<LineIds> {
    protected override IEnumerable<object> filter(ITypeDescriptorContext context, IEnumerable<object> data) { return data.Where(d => ((LineIds)d > LineIds.no && (LineIds)d <= LineIds.Russian) || (LineIds)d >= LineIds.Afrikaans); }
  }
  public class SkillConverter : StringConverter {
    public override bool GetStandardValuesSupported(ITypeDescriptorContext context) { return true; }
    public override StandardValuesCollection GetStandardValues(ITypeDescriptorContext context) { return new StandardValuesCollection(correctSkills(context.Instance as addTestSkill).ToArray()); }
    public override bool GetStandardValuesExclusive(ITypeDescriptorContext context) { return false; }
    public static IEnumerable<string> correctSkills(addTestSkill sk) {
      //return LowUtils.EnumGetValues<testMe.Skills>().Where(d => (testMe.Skills)d != testMe.Skills.no && !sk.self.file.folderContent.Contains(d.ToString().ToLower()));
      return testMe.Skills.all.Where(d => !sk.self.file.folderContent.Contains(d.ToLower()));
    }

  }

}
