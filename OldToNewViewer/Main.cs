using CourseMeta;
using LMComLib;
using LMNetLib;
using Microsoft.Win32;
using OldToNew;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Xml.Xsl;


namespace OldToNewViewer {
  public partial class Main : Form {
    public Main() {
      InitializeComponent();
      //exFile.getAllServerScript(logger, (e, c) => { });
      //checkLog();
      //return;
      TopPanel.AllowDrop = BottomPanel.AllowDrop = true;
      try { if (Directory.Exists(tempDir)) Directory.Delete(tempDir); Directory.CreateDirectory(tempDir); } catch { }
      CourseMeta.Lib.init(logger);
      checkLog();
      combos[newIdx] = comboNew; combos[oldIdx] = comboOld;
      browsers[newIdx] = browserNew; browsers[oldIdx] = browserOld;
    }

    static string tempDir = System.IO.Path.GetTempPath() + @"oldToNewViewer\";
    public static string exePath = System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetEntryAssembly().Location);
    LoggerMemory logger = new LoggerMemory(true);
    ComboBox[] combos = new ComboBox[2];
    WebBrowser[] browsers = new WebBrowser[2];
    const int newIdx = 0; const int oldIdx = 1;
    static int[] idxs = new int[] { newIdx, oldIdx };

    string actFile;

    string[] nonFilterUrls; string[] urls; int urlIdx = -1; exFile fileEx;


    bool checkLog() {
      if (!logger.hasError) return true;
      var fn = string.Format(@"{0}error.log", tempDir);
      if (File.Exists(fn)) File.Delete(fn);
      File.WriteAllText(fn, logger.Log());
      MessageBox.Show("See error in " + fn);
      logger.clear();
      return false;
    }


    void CloseBtn_Click(object sender, EventArgs e) {
      Close();
    }

    void Main_Shown(object sender, EventArgs e) {
      changeUrlIdx(-1);
    }

    void changeUrlIdx(int urlIdx) {
      this.urlIdx = urlIdx;
      if (urlIdx < 0) {
        Splitter.Visible = PrevBtn.Visible = NextBtn.Visible = IENewBtn.Visible = IEOldBtn.Visible = checkBtn.Visible = createHand.Visible =
          comboNew.Visible = comboOld.Visible = comboEdit.Visible = EditBtn.Visible = statusLab.Visible = false;
        if (nonFilterUrls == null)
          Text = exFile.actWorker().ToString() + ": Drag and Drop file(s) to one of blue panels";
        else
          this.Text = "Empty filter result # " + actFile;
        fileEx = null;
        return;
      }

      var actUrl = urls[urlIdx];
      this.Text = string.Format("{1}/{2} # {3} # {0}", actFile, urlIdx + 1, urls == null ? 0 : urls.Length, actUrl);

      Splitter.Visible = PrevBtn.Visible = NextBtn.Visible = IENewBtn.Visible = IEOldBtn.Visible = checkBtn.Visible = comboNew.Visible =
        comboOld.Visible = comboEdit.Visible = EditBtn.Visible = statusLab.Visible = true;


      this.Text = string.Format("{1}/{2} # {3} # {0}", actFile, urlIdx + 1, urls.Length, actUrl);

      fileEx = OldToNew.fileGroup.getAllFiles()[actUrl];

      refresh();

      PrevBtn.Enabled = urlIdx > 0; NextBtn.Enabled = urlIdx < urls.Length - 1;
      //checkBtn.Visible = true; 
    }

    void refresh() {
      var isHand = fileEx.getMeta().isByHand();
      var isChecked = fileEx.getMeta().isChecked();
      foreach (var idx in idxs) {
        var combo = combos[idx];
        var sel = combo.SelectedItem; combo.Items.Clear();
        foreach (var tp in fileEx.alowedView()) combo.Items.Add(typeObj.itemsDict[tp]);
        if (sel != null && !combo.Items.Cast<typeObj>().Any(s => s == sel)) sel = null;
        //combo.SelectedItem = sel ?? typeObj.itemsDict[idx == newIdx ? (isHand || isChecked ? oldeaDataType.xmlNew : oldeaDataType.xml) : oldeaDataType.webOld];
        combo.SelectedItem = sel ?? typeObj.itemsDict[idx == newIdx ? oldeaDataType.xmlNew : oldeaDataType.webOld];
      }
      adjustComboEdit();
      //buttons
      createHand.Visible = !isChecked;
      if (createHand.Visible) createHand.Text = isHand ? "del by hand" : "make by hand";
      checkBtn.Text = isChecked ? "unCheck" : "check";
      statusLab.Text = fileEx.getMeta().repStatus();
    }

    void OpenURL(string url) {
      string key = @"htmlfile\shell\open\command";
      RegistryKey registryKey = Registry.ClassesRoot.OpenSubKey(key, false);
      // Get the default browser path on the system
      string Default_Browser_Path = ((string)registryKey.GetValue(null, null)).Split('"')[1];

      Process p = new Process();
      p.StartInfo.FileName = Default_Browser_Path;
      p.StartInfo.Arguments = url;
      p.Start();
    }

    void navigate(int idx, OldToNew.exFile fileEx, oldeaDataType dataType /*dovoleny pouze xml* hodnoty enumu*/) {
      var browser = browsers[idx];
      browser.Navigate(fileEx.viewUrl(dataType));
    }

    void adjustComboEdit() {
      var sel = comboEdit.SelectedItem; comboEdit.Items.Clear();
      foreach (var tp in fileEx.alowedView()) {
        if (tp == oldeaDataType.webOld) continue;
        comboEdit.Items.Add(typeObj.itemsDict[typeObj.itemsDict[tp].xmlValue]);
      }
      foreach (var tp in fileEx.alowedView()) {
        if (tp == oldeaDataType.webOld) continue;
        comboEdit.Items.Add(typeObj.itemsDict[tp]);
      }
      comboEdit.SelectedItem = sel;
    }

    oldeaDataType comboViewItem(int idx) {
      var s = (typeObj)combos[idx].SelectedItem;
      return s == null ? oldeaDataType.no : s.value;
    }

    void comboViewChanged(int idx) {
      navigate(idx, fileEx, comboViewItem(idx));
      checkBtn.Enabled = comboViewItem(newIdx) == oldeaDataType.xmlNew; // !fileEx.getMeta().isByHand() || comboViewItem(newIdx) == oldeaDataType.xmlNew;
    }

    void PrevBtn_Click(object sender, EventArgs e) {
      changeUrlIdx((urlIdx - 1) % urls.Length);
    }

    void NextBtn_Click(object sender, EventArgs e) {
      changeUrlIdx((urlIdx + 1) % urls.Length);
    }

    static string urlAuthor = ConfigurationManager.AppSettings["BasicUrl"];

    void comboNew_SelectedIndexChanged(object sender, EventArgs e) {
      comboViewChanged(newIdx);
    }

    void comboOld_SelectedIndexChanged(object sender, EventArgs e) {
      comboViewChanged(oldIdx);
    }

    void EditBtn_Click(object sender, EventArgs e) {
      if (comboEdit.SelectedItem == null) return;
      var tpObj = typeObj.itemsDict[((typeObj)comboEdit.SelectedItem).value];
      LoggerMemory log = new LoggerMemory(false);
      var isEditable = (tpObj.value == oldeaDataType.lmdataNew && File.Exists(fileEx.fileName(oldeaDataType.lmdataNew))) || tpObj.editable;
      if (isEditable) {
        var cont = fileEx.getFileContentLow(tpObj.value, log) as string; if (cont == null) return;
        if (cont[0] != '@') {
          var fn = tempDir + fileEx.tempFileName(tpObj.value);
          File.WriteAllText(fn, log.hasError ? log.Log() : cont, Encoding.UTF8);
          openInVSNet(fn);
        } else
          openInVSNet(cont.Substring(1));
      } else {
        var cont = fileEx.getFileContentString(tpObj.value, log);
        var fn = tempDir + fileEx.tempFileName(tpObj.value);
        File.WriteAllText(fn, log.hasError ? log.Log() : cont, Encoding.UTF8);
        openInVSNet(fn);
      }
    }

    void checkBtn_Click(object sender, EventArgs e) {
      var isCheck = fileEx.toogleCheck();
      if (isCheck) {
        NextBtn_Click(null, null);
      } else {
        foreach (var idx in idxs) combos[idx].SelectedItem = null;
        refresh();
      }
    }

    void createHand_Click(object sender, EventArgs e) {
      var oldByHand = fileEx.getMeta().isByHand();
      if (oldByHand)
        if (MessageBox.Show("Opravdu vymazat ručně připravený soubor?", "Confirm", MessageBoxButtons.YesNo) == System.Windows.Forms.DialogResult.No) return;
      fileEx.toogleByHand();
      if (!oldByHand) {
        var fn = fileEx.fileName(oldeaDataType.lmdataNew);
        var xsltId = XsltCmb.SelectedItem as string;
        if (!string.IsNullOrEmpty(xsltId)) {
          var xsltFn = string.Format(@"{0}\xslts\{1}.xslt", exePath, xsltId);
          if (!File.Exists(xsltFn)) { MessageBox.Show(string.Format("XSLT file {0} does not exists!", xsltFn)); return; }
          XslCompiledTransform xslt = new XslCompiledTransform();
          xslt.Load(xsltFn);
          var tempFn = string.Format(@"{0}beforeXslt.xml", tempDir);
          if (File.Exists(tempFn)) File.Delete(tempFn);
          File.Move(fn, tempFn);
          xslt.Transform(tempFn, fn);
        }
        openInVSNet(fn);
      }
      foreach (var idx in idxs) combos[idx].SelectedItem = null;
      refresh();
    }

    void openInVSNet(string fn) {
      if (vsnetDte == null) {
        Type t = System.Type.GetTypeFromProgID("VisualStudio.DTE.12.0", true);
        vsnetDte = (EnvDTE80.DTE2)System.Activator.CreateInstance(t, true);
        vsnetDte.MainWindow.Visible = true;
        vsnetDte.UserControl = true;
      }
      //[HKEY_CURRENT_USER\Software\Microsoft\VisualStudio\12.0_Config\Languages\File Extensions\.lmdata]
      //@="{f6819a78-a205-47b5-be1c-675b3c7f0b8e}"
      vsnetDte.ItemOperations.OpenFile(fn);
    }
    EnvDTE80.DTE2 vsnetDte;

    void Main_DragEnter(object sender, DragEventArgs e) {
      if (e.Data.GetDataPresent(DataFormats.FileDrop)) e.Effect = DragDropEffects.Copy;
      else if (e.Data.GetDataPresent(DataFormats.Text)) e.Effect = DragDropEffects.Copy;
      else e.Effect = DragDropEffects.None;
    }
    void Main_DragDrop(object sender, DragEventArgs e) {
      dragDrop(e.Data);
    }
    void dragDrop(IDataObject data) {
      if (data.GetDataPresent(DataFormats.FileDrop)) {
        string[] filePaths = (string[])data.GetData(DataFormats.FileDrop); if (filePaths == null || filePaths.Length == 0) return;
        nonFilterUrls = fileToUrls(filePaths).ToArray();
      } else if (data.GetDataPresent(DataFormats.Text)) {
        var txt = (string)data.GetData(DataFormats.Text);
        nonFilterUrls = fileToUrls(txt.Split(new char[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)).Select(t => t.Trim()).ToArray();
      } else {
        return;
      }
      doneChb.CheckState = CheckState.Unchecked; byHandChb.CheckState = CheckState.Indeterminate;
      checkUrls();
      filterUrls();
    }
    private void BottomPanel_MouseClick(object sender, MouseEventArgs e) {
      if (e.Button != System.Windows.Forms.MouseButtons.Right) return;
      dragDrop(Clipboard.GetDataObject());
    }

    void changeFileGroup(string fg) {
      IEnumerable<string> xslts = XExtension.Create("russiandict"); //Enumerable.Empty<string>();
      if (fg == null) fg = "";
      switch (fg) {
        case "simple-pairing":
        case "other-pairing": xslts = XExtension.Create("row-cell-img+pairing"); break;
        case "": xslts = XExtension.Create("row-cell-img+pairing"); break;
        case "wordordering": xslts = XExtension.Create("wordordering"); break;
      }
      XsltCmb.Items.Clear();
      foreach (var xs in xslts) XsltCmb.Items.Add(xs);
    }

    IEnumerable<string> fileToUrls(string[] files) {
      var isFirstFile = true; changeFileGroup(null);
      foreach (var fn in files.Select(f => f.ToLower())) {
        if (fn.StartsWith("/")) yield return fn;
        else switch (Path.GetExtension(fn)) {
            case ".txt":
              if (isFirstFile) { exFile.actFileGroup = fn; changeFileGroup(exFile.actFileGroup); isFirstFile = false; }
              foreach (var u in File.ReadAllLines(fn)) yield return u;
              break;
            case ".xml":
              var parts = fn.Split(new string[] { @"\lm\oldea\" }, StringSplitOptions.RemoveEmptyEntries); if (parts.Length != 2) yield break;
              yield return "/" + parts[1].Split('.')[0].Replace('\\', '/');
              break;
            case ".lmdata":
              var parts2 = fn.Split(new string[] { @"\eduauthornew\" }, StringSplitOptions.RemoveEmptyEntries); if (parts2.Length != 2) yield break;
              yield return "/" + parts2[1].Split('.')[0].Replace('\\', '/');
              break;
          }
      }
    }

    //odfiltruje zadany seznam
    void filterUrls() {
      if (nonFilterUrls == null) return;
      var dict = fileGroup.getAllFiles();
      urls = nonFilterUrls.Where(url => {
        var f = dict[url].getMeta();
        if (doneChb.CheckState != CheckState.Indeterminate)
          if (f != null && f.isChecked() != (doneChb.CheckState == CheckState.Checked)) return false;
        if (byHandChb.CheckState != CheckState.Indeterminate)
          if (f != null && f.isByHand() != (byHandChb.CheckState == CheckState.Checked)) return false;
        return true;
      }).ToArray();
      if (urls.Length == 0) urls = null;
      if (urls == null) { changeUrlIdx(-1); return; }
      actFile = urls[0];
      changeUrlIdx(0);
    }

    //vyhodi prvky seznamu, ktere nejsou v getAllFiles()
    void checkUrls() {
      if (nonFilterUrls == null) return; var dict = fileGroup.getAllFiles();
      nonFilterUrls = nonFilterUrls.Where(u => u != null).Select(u => u.ToLower()).Where(u => dict.ContainsKey(u)).Distinct().ToArray();
      if (nonFilterUrls.Length == 0) nonFilterUrls = null;
    }


    void IEBtn(int idx) {
      var url = fileEx.viewUrl(comboViewItem(idx));
      OpenURL(url);
    }

    void IENewBtn_Click(object sender, EventArgs e) { IEBtn(newIdx); }

    void IEOldBtn_Click(object sender, EventArgs e) { IEBtn(oldIdx); }

    private void doneChb_CheckedChanged(object sender, EventArgs e) {
      filterUrls();
    }

    private void byHandChb_CheckedChanged(object sender, EventArgs e) {
      filterUrls();
    }

    private void ReportLnk_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e) {
      Report.export();
    }

    private void PZLab_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e) {
      //OldToNew.StatLib.dump(false);
      //OldToNew.StatLib.dump(true);
      OldToNew.fileGroup.generator();
    }

    private void eaOld_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e) {
      var url = CourseMeta.Lib.dataFromEAStrUrl(fileEx.newUrl, oldeaDataType.lmdataNew, logger);
      OpenURL(url);
    }

    private void eaNew_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e) {
      var url = CourseMeta.Lib.dataFromEAStrUrl(fileEx.newUrl, oldeaDataType.xmlNew, logger);
      OpenURL(url);
    }

    private void url2clipboard_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e) {
      if (fileEx == null) return;
      Clipboard.SetText(fileEx.url);
    }

  }

  public class typeObj {
    public oldeaDataType value { get; set; }
    public string editTitle { get; set; }
    public string viewTitle { get; set; }
    public bool editable;
    public oldeaDataType xmlValue; //pro value typu xml - odpovidajici lmdata value
    public static typeObj[] items = new typeObj[] { 
      new typeObj{value = oldeaDataType.lmdata, editTitle = "lmdata: old new", viewTitle = "", editable = exFile.actWorker()==workers.pz },
      new typeObj{value = oldeaDataType.lmdataNew, editTitle = "lmdata: new", viewTitle = ""},
      new typeObj{value = oldeaDataType.xml, editTitle = "xml: old new", viewTitle = "old new", xmlValue = oldeaDataType.lmdata },
      new typeObj{value = oldeaDataType.xmlNew, editTitle = "xml: new", viewTitle = "new", xmlValue = oldeaDataType.lmdataNew},
      new typeObj{value = oldeaDataType.webOld, editTitle = "", viewTitle = "old" },
    };
    public static Dictionary<oldeaDataType, typeObj> itemsDict = items.ToDictionary(it => it.value, it => it);
  }

}
