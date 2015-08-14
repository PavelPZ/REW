using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Xml.Linq;
using LMComLib;
using LMNetLib;
using System.IO;
using System.Text;
using System.Configuration;

namespace web4.Schools.Design {

  //public partial class LANGMasterAuthor : System.Web.UI.Page {

  //  const int fakeCount = 1; //pocet prvku v combo, ktere se ignoruji (Select XXX)

  //  // PROJECTS
  //  static Dictionary<string, CourseMeta.productDescrNew[]> projects { get { return _projects == null ? _projects = CourseMeta.Lib.projects() : _projects; } } static Dictionary<string, CourseMeta.productDescrNew[]> _projects;
  //  // PROJECT (= products)
  //  CourseMeta.productDescrNew[] project {
  //    get {
  //      if (ProjectsCmb.SelectedIndex <= 0) return null;
  //      CourseMeta.productDescrNew[] res;
  //      return projects.TryGetValue(ProjectsCmb.SelectedValue, out res) ? res : null;
  //    }
  //    set { product = null; projectModules = null; CoursesCmb.Items.Clear(); }
  //  }
  //  //PRODUCT
  //  CourseMeta.lesson[] _lessons;
  //  static IEnumerable<CourseMeta.lesson> getLessons(CourseMeta.productDescrNew product) { return product == null ? null : product._productParts.SelectMany(p => p._lessonsEx); }
  //  CourseMeta.productDescrNew product {
  //    get { return CoursesCmb.SelectedIndex < fakeCount || CoursesCmb.SelectedIndex - fakeCount >= project.Length ? null : project[CoursesCmb.SelectedIndex - fakeCount]; }
  //    set { _lessons = null; modules = null; LessonsCmb.Items.Clear(); }
  //  }
  //  CourseMeta.lesson[] lessons { get { return _lessons == null ? _lessons = enumToArray(getLessons(product)) : _lessons; } }
  //  //LESSON
  //  CourseMeta.mod[] _modules;
  //  static IEnumerable<CourseMeta.mod> getModules(CourseMeta.lesson lesson) { return lesson == null ? null : lesson.items.Cast<CourseMeta.mod>(); }
  //  CourseMeta.mod[] modules {
  //    get {
  //      if (product == null || LessonsCmb.SelectedIndex < fakeCount || LessonsCmb.SelectedIndex - fakeCount >= lessons.Length) return null;
  //      return _modules == null ? _modules = enumToArray(getModules(lessons[LessonsCmb.SelectedIndex - fakeCount])) : _modules;
  //    }
  //    set { _modules = null; moduleMeta = null; ModulesCmb.Items.Clear(); }
  //  }
  //  //MODULE
  //  static CourseModel.Module getModuleMeta(CourseMeta.mod mod, out string moduleDir) {
  //    moduleDir = Machines.rootPath + (mod.spaceId + "\\" + mod.globalId).Replace('/', '\\');
  //    CourseModel.Module res = CourseModel.Lib.readModule(moduleDir);
  //    if (res.Items == null) res.Items = new CourseModel.Ex[0];
  //    return res;
  //  }
  //  CourseModel.Module _moduleMeta; string moduleDir; CourseMeta.modInfo _modInfo;
  //  CourseModel.Module moduleMeta {
  //    get {
  //      if (_moduleMeta != null) return _moduleMeta;
  //      var mods = modules;
  //      if (mods == null || ModulesCmb.SelectedIndex < fakeCount || ModulesCmb.SelectedIndex - fakeCount >= mods.Length) return null;
  //      return _moduleMeta = getModuleMeta(mods[ModulesCmb.SelectedIndex - fakeCount], out moduleDir);
  //    }
  //    set { _moduleMeta = null; moduleDir = null; _modInfo = null; exercise = null; PagesLb.Items.Clear(); }
  //  }
  //  CourseMeta.modInfo modInfo {
  //    get {
  //      if (_modInfo != null) return _modInfo;
  //      if (moduleMeta == null) return null;
  //      var modSitemap = CourseMeta.Lib.findModuleSitemap(product, moduleDir);
  //      return _modInfo = CourseModel.Lib.ModuleLow(modSitemap, product, m => product.course);
  //    }
  //  }
  //  //EXERCISE
  //  CourseModel.Ex exercise {
  //    get {
  //      if (moduleMeta == null || PagesLb.SelectedIndex < 0 || _moduleMeta.Items == null || _moduleMeta.Items.Length <= 0 || PagesLb.SelectedIndex >= _moduleMeta.Items.Length) return null;
  //      return (CourseModel.Ex)_moduleMeta.Items[PagesLb.SelectedIndex];
  //    }
  //    set {
  //      //UrlTxt.Text = null;
  //      exerciseFrame.Visible = false;
  //      errorEx.Visible = false;
  //      editPlace.Visible = false;
  //      exerciseFrame.Src = "about:blank";
  //    }
  //  }

  //  // PROJECT MODULES
  //  srchModule[] _projectModules;
  //  srchModule[] projectModules {
  //    get {
  //      if (_projectModules != null) return _projectModules;
  //      var pr = project; if (project == null) return null;
  //      string modDir; int prodIdx = 0; int lessIdx = 0, modIdx = 0;
  //      return _projectModules = project.Select(p => new { p, prodIdx = prodIdx++ + (lessIdx = 0) }).
  //        SelectMany(p => getLessons(p.p).Select(l => new { l, prod = p.p, p.prodIdx, lessIdx = lessIdx++ + (modIdx = 0) })).
  //        SelectMany(l => getModules(l.l).Select(m => new { m, l.prod, less = l.l, l.prodIdx, lessIdx = l.lessIdx })).
  //        Select(m => new srchModule() {
  //          mod = getModuleMeta(m.m, out modDir),
  //          prodTitle = m.prod.title,
  //          prodIdx = m.prodIdx + 1,
  //          lessTitle = m.less.title,
  //          lessIdx = m.lessIdx + 1,
  //          modIdx = modIdx++ + 1,
  //        }).ToArray();
  //    }
  //    set {
  //      _projectModules = null;
  //    }
  //  }


  //  static T[] enumToArray<T>(IEnumerable<T> en) {
  //    return en == null ? null : en.ToArray();
  //  }

  //  protected void Page_LoadComplete(object sender, EventArgs e) {
  //    PagesLb_SelectedIndexChanged(null, null);
  //  }

  //  protected void Page_Load(object sender, EventArgs e) {
  //    exerciseFrame.Visible = false;
  //    exerciseFrame.Src = null;
  //    errorEx.Visible = false;
  //    errorEx.InnerText = null;
  //    editPlace.Visible = false;
  //    globalError.InnerHtml = null;
  //    if (!IsPostBack) {
  //      ProjectsCmb.DataSource = XExtension.Create<object>("... select project").Concat(projects.Select(p => new TextValue<string>(p.Key)));
  //      ProjectsCmb.DataBind();
  //      ProjectsCmb.SelectedIndex = 0;
  //      searchCb_CheckedChanged(null, null);
  //      CriteriumCmb.DataSource = XExtension.Create<object>("... select criterium").Concat(LowUtils.EnumGetValues<srchCriteriaType>().Select(c => c.ToString()));
  //      CriteriumCmb.DataBind();
  //      CriteriumCmb_SelectedIndexChanged(null, null);
  //      TemplateIdCmb.DataSource = XExtension.Create<object>("... no template").Concat(CourseModel.MacroLib.Templates().Items.OfType<CourseModel.Ex>().Select(ex => ex.id));
  //      TemplateIdCmb.DataBind();
  //      try { //restore stav z query stringu nebo z cookie
  //        string lastSel = Request["LastSelection"];
  //        string[] parts = lastSel != null ? lastSel.Split('|') : null; if (parts == null || parts.Length < 4) return;
  //        ProjectsCmb.SelectedIndex = int.Parse(parts[0]);
  //        ProjectsCmb_SelectedIndexChanged(sender, null);
  //        CoursesCmb.SelectedIndex = int.Parse(parts[1]);
  //        CoursesCmb_SelectedIndexChanged(sender, null);
  //        LessonsCmb.SelectedIndex = int.Parse(parts[2]);
  //        LessonsCmb_SelectedIndexChanged(sender, null);
  //        ModulesCmb.SelectedIndex = int.Parse(parts[3]);
  //        ModulesCmb_SelectedIndexChanged(sender, null);
  //        if (parts.Length > 4) {
  //          editModeCb.Checked = true;
  //          PagesLb.SelectedIndex = int.Parse(parts[4]);
  //          PagesLb_SelectedIndexChanged(sender, null);
  //        }
  //      } catch { }
  //    }
  //  }

  //  protected void editModeCb_CheckedChanged(object sender, EventArgs e) {
  //    PagesLb_SelectedIndexChanged(sender, e);
  //  }

  //  protected void searchCb_CheckedChanged(object sender, EventArgs e) {
  //    NotSearchPlace.Visible = !SearchCourseChb.Checked;
  //    SearchPlace.Visible = SearchCourseChb.Checked;
  //  }

  //  protected void ProjectsCmb_SelectedIndexChanged(object sender, EventArgs e) {
  //    project = null; if (project == null) return;
  //    CoursesCmb.DataSource = XExtension.Create<object>("... select course").Concat(project.Select(p => new TextValue<CourseMeta.productDescrNew>(p)));
  //    CoursesCmb.DataBind();
  //  }

  //  protected void CoursesCmb_SelectedIndexChanged(object sender, EventArgs e) {
  //    product = null; if (product == null) return;
  //    product.refreshLessonsEx();
  //    LessonsCmb.DataSource = XExtension.Create<object>("... select lesson").Concat(lessons.Select(l => new TextValue<CourseMeta.data>(l)));
  //    LessonsCmb.DataBind();
  //  }

  //  protected void LessonsCmb_SelectedIndexChanged(object sender, EventArgs e) {
  //    modules = null; if (modules == null) return;
  //    ModulesCmb.DataSource = XExtension.Create<object>("... select Module").Concat(modules.Select(l => new TextValue<CourseMeta.data>(l)));
  //    ModulesCmb.DataBind();
  //  }

  //  protected void ModulesCmb_SelectedIndexChanged(object sender, EventArgs e) {
  //    moduleMeta = null; if (moduleMeta == null) return;
  //    PagesLb.DataSource = moduleMeta.ex.Select(l => new TextValue<CourseModel.Ex>(l));
  //    PagesLb.DataBind();
  //    //save stav do cookie
  //    string status = string.Format("{0}|{1}|{2}|{3}", ProjectsCmb.SelectedIndex, CoursesCmb.SelectedIndex, LessonsCmb.SelectedIndex, ModulesCmb.SelectedIndex);
  //    //UrlTxt.Text = Request.Url.AbsoluteUri.Split('?')[0] + "?LastSelection=" + status;
  //    var cook = new HttpCookie("LastSelection", status);
  //    cook.Expires = DateTime.Now.AddDays(10);
  //    Response.Cookies.Add(cook);

  //  }

  //  protected void PagesLb_SelectedIndexChanged(object sender, EventArgs e) {
  //    exercise = null; var ex = exercise; if (ex == null) return;
  //    if (string.IsNullOrEmpty(ex.template)) TemplateIdCmb.SelectedIndex = 1; else TemplateIdCmb.SelectedValue = ex.template;
  //    if (editModeCb.Checked) {
  //      editPlace.Visible = true;
  //      exerciseFrame.Src = null;
  //      errorEx.InnerText = null;
  //      MakeNotSimpleBtn.Visible = ex.isSimpleData();
  //      if (sender != null) {
  //        editData.Text = ex.editData;
  //        todoChb.Checked = ex.todo;
  //        editInstr.Text = ex.instr;
  //        editTechInstr.Text = ex.tech_instr;
  //        editTitle.Text = ex.title;
  //        editSeeAlso.Text = ex.seealso;
  //      }
  //    } else if (string.IsNullOrEmpty(ex.error)) {
  //      showExercise(ex);
  //    } else {
  //      errorEx.Visible = true;
  //      errorEx.InnerText = ex.error;
  //    }
  //    //save stav do cookie
  //    string status = string.Format("{0}|{1}|{2}|{3}|{4}", ProjectsCmb.SelectedIndex, CoursesCmb.SelectedIndex, LessonsCmb.SelectedIndex, ModulesCmb.SelectedIndex, PagesLb.SelectedIndex);
  //    //UrlTxt.Text = Request.Url.AbsoluteUri.Split('?')[0] + "?LastSelection=" + status;
  //    var cook = new HttpCookie("LastSelection", status);
  //    cook.Expires = DateTime.Now.AddDays(10);
  //    Response.Cookies.Add(cook);
  //  }

  //  void showExercise(CourseModel.Ex ex) {
  //    var domain = Machines.isPZComp() ? "localhost/rew" : "test.langmaster.com/alpha";
  //    string exId = ex.id;
  //    var mi = modInfo;
  //    var url = string.Format("http://{0}/Schools/LANGMasterAuthor.aspx?lang=cs-cz&forceEval=true#school@schoolexmodel@9999@{1}@{2}/{3}", domain, product.ProductId, mi.jsonId + "/" + mi.path, exId);
  //    exerciseFrame.Src = url;
  //    exerciseFrame.Visible = true;
  //  }

  //  protected void BuildCourseBtn_Click(object sender, EventArgs e) {
  //    if (product == null) return;
  //    var err = Exercise.BuildProductNew(product._productId, true);
  //    globalError.InnerHtml = err;
  //  }

  //  protected void BuildProjectBtn_Click(object sender, EventArgs e) {
  //    if (project == null) return;
  //    string err = null;
  //    foreach (var prod in project) err += Exercise.BuildProductNew(prod._productId, true);
  //    globalError.InnerHtml = err;
  //  }

  //  protected void BuildModuleBtn_Click(object sender, EventArgs evarg) {
  //    try {
  //      moduleMeta = null; var m = moduleMeta; if (m == null) return;
  //      build(m);
  //      //refresh GUI
  //      int idx = PagesLb.SelectedIndex;
  //      ModulesCmb_SelectedIndexChanged(null, null);
  //      PagesLb.SelectedIndex = Math.Min(idx, m.ex.Count() - 1);
  //    } catch (Exception exp) {
  //      globalError.InnerHtml = LowUtils.ExceptionToString(exp, true, true);
  //    }
  //  }

  //  void build(CourseModel.Module m) {
  //    //kontrola jednoznacnosti Page id
  //    CourseMeta.Lib.isUniqueAndNotEmpty(m.ex.Select(p => p.id), "Empty, missing or not unique 'id' attribute");
  //    //extrahuj exercise files from meta.xml
  //    CourseModel.MacroLib.exFilesFromMetaXml(moduleDir, m);
  //    //aktualni prod.refreshLessons(), aby odpovidalo modInfo
  //    product.refreshLessonsEx();
  //    CoursesSitemap.courseSitemapWithLoc(product, false); //generace sitemap kurzu do rew\Web4\Schools\EACourses\ a do product parts Lessons
  //    var mi = modInfo;
  //    //build do d:\LMCom\rew\Web4\Schools\EAData\
  //    Exercise.buildModuleNew(mi);
  //    //Zkopiruj exercise build errors do meta.xml
  //    foreach (var idTit in mi.exs.Where(it => !string.IsNullOrEmpty(it.buildError))) m.ex.First(e => idTit.Id.EndsWith(e.id)).error += idTit.buildError;
  //    //save meta.xml with errors
  //    CourseModel.Lib.writeModule(m, moduleDir);
  //  }

  //  protected void SaveBtn_Click(object sender, EventArgs e) {
  //    save(false);
  //  }

  //  protected void SaveViewBtn_Click(object sender, EventArgs e) {
  //    save(true);
  //  }

  //  void save(bool isView) {
  //    var ex = exercise; if (ex == null) return;
  //    ex.todo = todoChb.Checked;
  //    ex.editData = editData.Text;
  //    ex.instr = editInstr.Text;
  //    ex.tech_instr = editTechInstr.Text;
  //    ex.title = editTitle.Text;
  //    ex.seealso = editSeeAlso.Text; ;

  //    var m = moduleMeta;
  //    CourseModel.Lib.writeModule(m, moduleDir);
  //    if (!isView) return;
  //    editModeCb.Checked = false;
  //    build(m);
  //    showExercise(ex);
  //  }

  //  protected void resetModuleBtn_Click(object sender, EventArgs e) {
  //    var mi = modInfo; var m = moduleMeta; if (mi == null || m == null) return;
  //    foreach (var ex in m.ex) { ex.Items = null; ex.error = null; }
  //    CourseModel.Lib.writeModule(m, moduleDir);
  //  }

  //  protected void ChangeTemplateBtn_Click(object sender, EventArgs e) {
  //    if (TemplateIdCmb.SelectedIndex <= 0) return;
  //    var ex = exercise; if (ex == null) return;
  //    ex.template = TemplateIdCmb.SelectedValue;
  //    ex.Items = null; ex.error = null;
  //    CourseModel.Lib.writeModule(moduleMeta, moduleDir);
  //    PagesLb_SelectedIndexChanged(sender, null);
  //  }


  //  protected void MakeNotSimpleBtn_Click(object sender, EventArgs e) {
  //    var ex = exercise; if (ex == null) return;
  //    //var mi = modInfo; var m = moduleMeta; if (PagesLb.SelectedIndex < 0 || mi == null || m == null) return;
  //    //var ex = (CourseModel.Ex)m.Items[PagesLb.SelectedIndex];
  //    if (!ex.isSimpleData()) return;
  //    editData.Text = ex.notSimpleEditData();
  //  }

  //  protected void TtsExportBtn_Click(object sender, EventArgs e) {
  //    if (product == null) return;
  //    Tts.Lib.exportAllTtsCourseSounds(product);
  //  }

  //  /*protected void TtsStartBtn_Click(object sender, EventArgs e) {
  //    if (product == null) return;
  //    Tts.Build.Start(Tts.Build.courseTtsSounds(product), TtsAllChb.Checked, ttsTemp);
  //  }

  //  protected void TtsEndBtn_Click(object sender, EventArgs e) {
  //    if (product == null) return;
  //    var batch = Tts.Build.Load(ttsTemp);
  //    if (batch.id != product._productId) throw new Exception("batch.id != product._productId");
  //    batch.DeleteUnused();
  //    batch.End();
  //  }
  //  static string ttsTemp = Machines.basicPath + @"\TTSTemp";*/

  //  protected void metaFromExs_Click(object sender, EventArgs e) {
  //    if (product == null) return;
  //    foreach (var mod in product.Modules())
  //      CourseModel.MacroLib.metadataFromExFiles(Machines.rwDataSourcePath + @"rew\Web4\RwCourses\" + mod.pathOrderNum.Replace('/', '\\'));
  //  }

  //  protected void expandMacros_Click(object sender, EventArgs e) {
  //    var ex = exercise; if (ex == null) return;
  //    ex = (CourseModel.Ex)ex.clone();
  //    CourseModel.Lib.PostProcessPage(ex, null/*, false*/, new StringBuilder());
  //    string xml = CourseModel.Lib.ToElement(ex).ToString();
  //    xml = xml.Replace("<?xml version=\"1.0\" encoding=\"utf-16\"?>", null);
  //    ClipboardPlace.Value = xml;
  //  }

  //  protected void url_Click(object sender, EventArgs e) {
  //    if (exercise == null) return;
  //    string status = string.Format("{0}|{1}|{2}|{3}|{4}", ProjectsCmb.SelectedIndex, CoursesCmb.SelectedIndex, LessonsCmb.SelectedIndex, ModulesCmb.SelectedIndex, PagesLb.SelectedIndex);
  //    //UrlTxt.Text = Request.Url.AbsoluteUri.Split('?')[0] + "?LastSelection=" + status;
  //    ClipboardPlace.Value = Request.Url.AbsoluteUri.Split('?')[0] + "?LastSelection=" + status;
  //  }

  //  //protected void CourseToDoBtn_Click(object sender, EventArgs e) {
  //  //  if (product == null) return;
  //  //  Response.ContentType = "text/html";
  //  //  Response.Write("<a href='#'>Link</a>");
  //  //  Response.End();
  //  //}

  //  /**************** SEARCH ***************************/
  //  public struct srchModule {
  //    public CourseModel.Module mod;
  //    public int prodIdx;
  //    public int lessIdx;
  //    public int modIdx;
  //    public string prodTitle;
  //    public string lessTitle;
  //  }
  //  public enum srchCriteriaType {
  //    id, title, instr, techInstr, hasSeeAlso, isTodo, template, fulltext
  //  }

  //  protected void CriteriumCmb_SelectedIndexChanged(object sender, EventArgs e) {
  //    CritTemplateIdCmb.Visible = CritTextBox.Visible = false; CritValueLab.Visible = CriteriumCmb.SelectedIndex > 0;
  //    switch ((srchCriteriaType)CriteriumCmb.SelectedIndex - 1) {
  //      case srchCriteriaType.id:
  //      case srchCriteriaType.title:
  //      case srchCriteriaType.instr:
  //      case srchCriteriaType.techInstr:
  //      case srchCriteriaType.fulltext:
  //        CritTextBox.Visible = true;
  //        break;
  //      case srchCriteriaType.template:
  //        if (CritTemplateIdCmb.Items.Count == 0) {
  //          CritTemplateIdCmb.DataSource = XExtension.Create<object>("... select template").Concat(CourseModel.MacroLib.Templates().Items.OfType<CourseModel.Ex>().Select(ex => ex.id));
  //          CritTemplateIdCmb.DataBind();
  //        }
  //        CritTemplateIdCmb.Visible = true;
  //        break;
  //      case srchCriteriaType.hasSeeAlso:
  //      case srchCriteriaType.isTodo: CritValueLab.Visible = false; break;
  //    }
  //  }

  //  protected void CritSearchBtn_Click(object sender, EventArgs evarg) {
  //    if (projectModules == null || CriteriumCmb.SelectedIndex <= 0) return;
  //    Func<CourseModel.Ex, bool> cond = null;
  //    Func<CourseModel.Ex, string> textCond = null;
  //    switch ((srchCriteriaType)CriteriumCmb.SelectedIndex - 1) {
  //      case srchCriteriaType.hasSeeAlso: cond = e => !string.IsNullOrEmpty(e.seealso); break;
  //      case srchCriteriaType.isTodo: cond = e => e.todo; break;
  //      case srchCriteriaType.id: textCond = e => e.id; break;
  //      case srchCriteriaType.title: textCond = e => e.title; break;
  //      case srchCriteriaType.instr: textCond = e => e.instr; break;
  //      case srchCriteriaType.techInstr: textCond = e => e.tech_instr; break;
  //      case srchCriteriaType.fulltext: textCond = e => XmlUtils.ObjectToString(e); break;
  //      case srchCriteriaType.template: if (CritTemplateIdCmb.SelectedIndex <= 0) return; cond = e => e.template == CritTemplateIdCmb.SelectedValue; break;
  //    }
  //    if (cond == null) {
  //      var val = CritTextBox.Text.ToLower();
  //      if (string.IsNullOrEmpty(val)) return;
  //      cond = e => (textCond(e) ?? "").ToLower().IndexOf(val) >= 0;
  //    }
  //    var qTits = projectModules.SelectMany(m => m.mod.ex.Where(e => cond(e)).Select(e => new {
  //      query = string.Format("{0}|{1}|{2}|{3}|{4}", ProjectsCmb.SelectedIndex, m.prodIdx, m.lessIdx, m.modIdx, Array.IndexOf(m.mod.Items, e)),
  //      title = string.Format("{0}/{1}/{2}/{3}", m.prodTitle, m.lessTitle, m.mod.title, e.title)
  //    }));
  //    StringBuilder sb = new StringBuilder();
  //    foreach (var qTit in qTits)
  //      sb.AppendFormat("<a target='_blank' href='{0}'>{1}</a><br/>", Request.Url.AbsoluteUri.Split('?')[0] + "?LastSelection=" + qTit.query, HttpUtility.HtmlDecode(qTit.title));
  //    Response.ContentType = "text/html";
  //    Response.Write(sb.ToString());
  //    Response.End();
  //  }
  //}

  public class TextValue<T> {
    public TextValue(T v) { Value = v; }
    public T Value { get; set; }
    //public override string ToString() {
    //  if (Value is string) return Value.ToString();
    //  if (Value is CourseMeta.data) return (Value as CourseMeta.data).title;
    //  if (Value is CourseMeta.productDescrNew) return (Value as CourseMeta.productDescrNew).title;
    //  if (Value is XElement) return (Value as XElement).AttributeValue("title");
    //  if (Value is CourseModel.Ex) {
    //    var e = Value as CourseModel.Ex;
    //    var res = "";
    //    if (!string.IsNullOrEmpty(e.error)) res += "*";
    //    if (e.todo) res += "!";
    //    if (res != "") res += " ";
    //    return res + e.id + ": " + e.title;
    //  }
    //  throw new NotImplementedException();
    //}
  }
}