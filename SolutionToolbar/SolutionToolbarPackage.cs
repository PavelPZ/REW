using System;
using System.Diagnostics;
using System.Linq;
using System.Globalization;
using System.Runtime.InteropServices;
using System.ComponentModel.Design;
using Microsoft.Win32;
using Microsoft.VisualStudio;
using Microsoft.VisualStudio.Shell.Interop;
using Microsoft.VisualStudio.OLE.Interop;
using Microsoft.VisualStudio.Shell;
using System.Windows.Forms;
using System.Collections.Generic;
using LMComLib;
using System.IO;
using System.Threading;
using System.Text.RegularExpressions;
using LMNetLib;
using CourseMeta;
using System.Text;

//add file http://www.windows-tech.info/4/139cb1de8d724d05.php
//parent, child, ... http://dotneteers.net/blogs/divedeeper/archive/2008/10/16/LearnVSXNowPart36.aspx
//http://www.mztools.com/articles/2014/MZ2014007.aspx
//http://www.diaryofaninja.com/blog/2014/02/18/who-said-building-visual-studio-extensions-was-hard
//http://msdn.microsoft.com/en-gb/library/vstudio/bb491716.aspx
//http://blogs.msdn.com/b/martintracy/archive/2006/05/16/599057.aspx
//web konstanty http://stackoverflow.com/questions/12088469/how-to-add-context-menu-entries-in-website-projects
//http://www.codingodyssey.com/2008/03/14/dynamic-menu-commands-in-visual-studio-packages-part-1/
//http://www.codingodyssey.com/2008/03/22/dynamic-menu-commands-in-visual-studio-packages-part-2/
//http://www.codingodyssey.com/2008/04/05/dynamic-menu-commands-in-visual-studio-packages-part-3/
//http://dbsharper.googlecode.com/svn/trunk/DbSharper/DbSharper.CodeGenerator/VsMultipleFileGenerator.cs
//http://social.msdn.microsoft.com/Forums/en-US/ea145dc4-4fb9-49f5-83a7-5d32bd38caa6/question-about-vsip
//multiselection http://www.symbolsource.org/MyGet/Metadata/clarius/Project/Clide/1.0.1212.1404/Release/.NETFramework,Version%3Dv4.5/Clide/Clide/VisualStudio/VsMonitorSelectionExtensions.cs?ImageName=Clide
//Output Window, Option page,... http://msdn.microsoft.com/en-us/library/cc138529.aspx
//Output window http://stackoverflow.com/questions/1094366/how-do-i-write-to-the-visual-studio-output-window-in-my-custom-tool
//MS Help http://msdn.microsoft.com/en-us/library/bb165336.aspx
//web browser https://go4answers.webhost4life.com/Example/open-visual-studio-internal-web-browser-156916.aspx, https://reviewboardvsx.googlecode.com/svn-history/r2/trunk/ReviewBoardVsx/ReviewBoardVsx.Package/MyPackage.cs

namespace Author {

  [PackageRegistration(UseManagedResourcesOnly = true)]
  [InstalledProductRegistration("#110", "#112", "1.0", IconResourceID = 400)]
  [ProvideMenuResource("Menus.ctmenu", 1)]
  [Guid(GuidList.guidSolutionToolbarPkgString)]
  [ProvideAutoLoad("{f1536ef8-92ec-443c-9ed7-fdadf150da82}")]
  public sealed class SolutionToolbarPackage : Package {
    public SolutionToolbarPackage() {
      Debug.WriteLine(string.Format(CultureInfo.CurrentCulture, "Entering constructor for: {0}", this.ToString()));
    }

    protected override void Initialize() {
      base.Initialize();

      Machines._dataDir = vsNetServer.resourcePath + "data";
      vsNetConfig.configFn = vsNetServer.resourcePath + "app.config";

      OleMenuCommandService mcs = GetService(typeof(IMenuCommandService)) as OleMenuCommandService; if (mcs == null) return;

      //Browse testEx x mod
      CommandID browseCommandID = new CommandID(GuidList.guidSolutionToolbarCmdSet, (int)PkgCmdIDList.cmdBrowse);
      OleMenuCommand browseMenuItem = new OleMenuCommand((s, a) => doAction(actions.browse), browseCommandID);
      browseMenuItem.BeforeQueryStatus += (s, a) => queryAction(s, actions.browse);
      mcs.AddCommand(browseMenuItem);

      //Run testEx x mod
      CommandID runCommandID = new CommandID(GuidList.guidSolutionToolbarCmdSet, (int)PkgCmdIDList.cmdRun);
      OleMenuCommand runMenuItem = new OleMenuCommand((s, a) => doAction(actions.saveHtml), runCommandID);
      runMenuItem.BeforeQueryStatus += (s, a) => queryAction(s, actions.saveHtml);
      mcs.AddCommand(runMenuItem);

      //Xref mod
      CommandID xrefCommandID = new CommandID(GuidList.guidSolutionToolbarCmdSet, (int)PkgCmdIDList.cmdXref);
      OleMenuCommand xrefMenuItem = new OleMenuCommand((s, a) => doAction(actions.xref), xrefCommandID);
      xrefMenuItem.BeforeQueryStatus += (s, a) => queryAction(s, actions.xref);
      mcs.AddCommand(xrefMenuItem);

      //addFolder
      CommandID addFolderCommandID = new CommandID(GuidList.guidSolutionToolbarCmdSet, (int)PkgCmdIDList.cmd_addFolder);
      OleMenuCommand addFolderMenuItem = new OleMenuCommand((s, a) => doAction(actions.addFolder), addFolderCommandID);
      addFolderMenuItem.BeforeQueryStatus += (s, a) => queryAction(s, actions.addFolder);
      mcs.AddCommand(addFolderMenuItem);

      //addTest
      CommandID addTestCommandID = new CommandID(GuidList.guidSolutionToolbarCmdSet, (int)PkgCmdIDList.cmd_addTest);
      OleMenuCommand addTestMenuItem = new OleMenuCommand((s, a) => doAction(actions.addTest), addTestCommandID);
      addTestMenuItem.BeforeQueryStatus += (s, a) => queryAction(s, actions.addTest);
      mcs.AddCommand(addTestMenuItem);

      //addCourse
      CommandID addCourseCommandID = new CommandID(GuidList.guidSolutionToolbarCmdSet, (int)PkgCmdIDList.cmd_addCourse);
      OleMenuCommand addCourseMenuItem = new OleMenuCommand((s, a) => doAction(actions.addCourse), addCourseCommandID);
      addCourseMenuItem.BeforeQueryStatus += (s, a) => queryAction(s, actions.addCourse);
      mcs.AddCommand(addCourseMenuItem);

      //addTestSkill
      CommandID addTestSkillCommandID = new CommandID(GuidList.guidSolutionToolbarCmdSet, (int)PkgCmdIDList.cmd_addTestSkill);
      OleMenuCommand addTestSkillMenuItem = new OleMenuCommand((s, a) => doAction(actions.addTestSkill), addTestSkillCommandID);
      addTestSkillMenuItem.BeforeQueryStatus += (s, a) => queryAction(s, actions.addTestSkill);
      mcs.AddCommand(addTestSkillMenuItem);

      //addTestTaskGroup
      CommandID addTestTaskGroupCommandID = new CommandID(GuidList.guidSolutionToolbarCmdSet, (int)PkgCmdIDList.cmd_addTestTaskGroup);
      OleMenuCommand addTestTaskGroupMenuItem = new OleMenuCommand((s, a) => doAction(actions.addTestTaskGroup), addTestTaskGroupCommandID);
      addTestTaskGroupMenuItem.BeforeQueryStatus += (s, a) => queryAction(s, actions.addTestTaskGroup);
      mcs.AddCommand(addTestTaskGroupMenuItem);

      //addEx
      CommandID addExCommandID = new CommandID(GuidList.guidSolutionToolbarCmdSet, (int)PkgCmdIDList.cmd_addEx);
      OleMenuCommand addExMenuItem = new OleMenuCommand((s, a) => doAction(actions.addEx), addExCommandID);
      addExMenuItem.BeforeQueryStatus += (s, a) => queryAction(s, actions.addEx);
      mcs.AddCommand(addExMenuItem);

      //addMod
      CommandID addModCommandID = new CommandID(GuidList.guidSolutionToolbarCmdSet, (int)PkgCmdIDList.cmd_addMod);
      OleMenuCommand addModMenuItem = new OleMenuCommand((s, a) => doAction(actions.addMod), addModCommandID);
      addModMenuItem.BeforeQueryStatus += (s, a) => queryAction(s, actions.addMod);
      mcs.AddCommand(addModMenuItem);

      //build
      CommandID BuildCommandID = new CommandID(GuidList.guidSolutionToolbarCmdSet, (int)PkgCmdIDList.cmd_Build);
      OleMenuCommand BuildMenuItem = new OleMenuCommand((s, a) => doAction(actions.build), BuildCommandID);
      BuildMenuItem.BeforeQueryStatus += (s, a) => queryAction(s, actions.build);
      mcs.AddCommand(BuildMenuItem);
    }

    void queryAction(object sender, actions action) {
      try {
      var cmd = sender as OleMenuCommand; if (cmd == null) return;
      adjustFileContext(ref actCtx);
      cmd.Visible = actCtx != null && actCtx.hasAction(action);
      } catch (Exception exp) {
        vsNetServer.log.ErrorLineFmt(action.ToString(), "SolutionToolbarPackage.queryAction, {0}", LowUtils.ExceptionToString(exp));
      }
    }

    fileContext actCtx;

    
    //**********  RUN x BROWSE

    void doAction(actions action) {
      try {
        vsNetServer.log.clear();
        adjustFileContext(ref actCtx); if (actCtx == null) return;
        switch (action) {
          case actions.xref:
            break;
          case actions.browse:
            progressStart();
            try {
              var html = vsNetServer.getHtmFromTemplate(actCtx);
              var fn = Path.GetTempPath() + "page.htm";
              File.WriteAllText(fn, html, Encoding.UTF8);
              if (!vsNetServer.log.hasError) navigate(fn, null);
            } finally { progressEnd(); }
            break;
          case actions.saveHtml:
            vsNetServer.saveHtmlData(actCtx);
            break;
          case actions.addEx:
            new AddExForm(action, actCtx, addExs).ShowDialog();
            break;
          case actions.build:
            DeployForm.show(actCtx);
            //using (var str = File.OpenWrite(@"d:\temp\prod.zip")) vsNetServer.build(str, actCtx);
            break;
          default:
            new AddForm(action, actCtx, addFolder).ShowDialog();
            break;
        }
      } catch (Exception exp) {
        vsNetServer.log.ErrorLineFmt(action.ToString(), "SolutionToolbarPackage.doAction, {0}", LowUtils.ExceptionToString(exp) );
      }
      if (vsNetServer.log.hasError) {
        var fn = Path.GetTempPath() + "error.htm";
        File.WriteAllText(fn, vsNetServer.log.LogHtml(), Encoding.UTF8);
        navigate(fn, null);
      }
    }

    void addExs(string[] fileNames, string content) {
      string dir = Path.GetDirectoryName(actCtx.fileName);
      vsFileContext fx = (vsFileContext)actCtx.vsNetHiearchy;
      IVsProject3 pro = (IVsProject3)(fx.hierarchy as IVsProject3);
      Guid guid = Guid.Empty; //IVsWindowFrame frame = null;
      foreach (var fn in fileNames) {
        var f = dir + "\\" + fn + ".xml";
        File.WriteAllText(f, content, Encoding.UTF8);
        adjustAddFile(f, pro);
      }
    }

    //http://www.windows-tech.info/4/139cb1de8d724d05.php
    void addFolder(string folderName, Action<string> writeFile) {
      string dir = Path.GetDirectoryName(actCtx.fileName) + "\\" + folderName;
      string fileName = dir + "\\meta.xml";
      Directory.CreateDirectory(dir);
      writeFile(fileName);

      vsFileContext fx = (vsFileContext)actCtx.vsNetHiearchy;
      IVsProject3 pro = (IVsProject3)(fx.hierarchy as IVsProject3);
      //add directory
      VSADDRESULT[] addResArr = new VSADDRESULT[1]; string[] fnarr = new string[] { dir };
      int retVal = pro.AddItem(fx.itemId, VSADDITEMOPERATION.VSADDITEMOP_OPENFILE, dir, 1, fnarr, IntPtr.Zero, addResArr);
      //add meta.xml
      if (retVal == 0) adjustAddFile(fileName, pro);
    }

    void adjustAddFile(string fileName, IVsProject3 pro) {
      int pfFound; VSDOCUMENTPRIORITY[] pdwPriority = new VSDOCUMENTPRIORITY[1];
      int retVal; uint newFileId;
      //Microsoft.VisualStudio.VSConstants.VSITEMID 
      //if (!File.Exists(fileName)) throw new Exception();
      //retVal = pro.IsDocumentInProject(fileName, out pfFound, pdwPriority, out newFileId);
      //if (retVal != 0) return;
      //if (pfFound != 1) { 
      //}
      retVal = pro.IsDocumentInProject(fileName, out pfFound, pdwPriority, out newFileId);
      VSADDRESULT[] addResArr = new VSADDRESULT[1];
      string[] fnarr = new string[] { fileName };
      //retVal = pro.AddItem(newFileId, VSADDITEMOPERATION.VSADDITEMOP_OPENFILE, fileName, cFilesToOpen, fnarr, IntPtr.Zero, addResArr);
      //retVal = pro.AddItem(VSConstants.VSITEMID_ROOT, VSADDITEMOPERATION.VSADDITEMOP_OPENFILE, fileName, 1, fnarr, IntPtr.Zero, addResArr);
      retVal = pro.AddItem(newFileId, VSADDITEMOPERATION.VSADDITEMOP_OPENFILE, fileName, 1, fnarr, IntPtr.Zero, addResArr);
      if (retVal != 0) return;
      //retVal = pro.IsDocumentInProject(fileName, out pfFound, pdwPriority, out newFileId);
      //retVal = pro.IsDocumentInProject(fileName, out pfFound, pdwPriority, out newFileId);
      if (retVal != 0) return;
      Guid guid = Guid.Empty; IVsWindowFrame frame = null;
      retVal = pro.OpenItem(newFileId, ref guid, IntPtr.Zero, out frame);
      if (frame != null) frame.Show();
    }

    //**********  UTILS

    public class vsFileContext {
      public IVsHierarchy hierarchy;
      public uint itemId;
    }

    public publisherContext publisherCtx;

    void adjustFileContext(ref fileContext ctx) {
      if (actCtx != null && (DateTime.UtcNow - actCtx.created).TotalMilliseconds < 300) return; //zivotnost ctx je omezena na jednu user akci
      IVsMonitorSelection monSel = (IVsMonitorSelection)GetService(typeof(SVsShellMonitorSelection));
      IntPtr hierPtr; uint currentItemId; IVsMultiItemSelect multSel; IntPtr selPtr;
      int hr = monSel.GetCurrentSelection(out hierPtr, out currentItemId, out multSel, out selPtr);
      if (multSel != null || hierPtr == null) return; //multi selection nebo zadna selection
      IVsHierarchy selectedHierarchy = Marshal.GetObjectForIUnknown(hierPtr) as IVsHierarchy;
      if (selectedHierarchy == null) return;

      string currentDocument;
      selectedHierarchy.GetCanonicalName(VSConstants.VSITEMID_ROOT, out currentDocument);
      selectedHierarchy.GetCanonicalName(currentItemId, out currentDocument);

      if (Machines._rootDir != null && currentDocument.IndexOf(Machines._rootDir) != 0) publisherCtx = null; //context je neaktualni

      if (publisherCtx == null) {
        string rootDoc;
        selectedHierarchy.GetCanonicalName(VSConstants.VSITEMID_ROOT, out rootDoc);
        publisherCtx = new publisherContext(rootDoc);
      }
      fileContext.adjustFileContext(currentDocument, new vsFileContext { hierarchy = selectedHierarchy, itemId = currentItemId }, publisherCtx, ref ctx);
    }

    void navigate(string url, byte[] postData) {
      var service = Package.GetGlobalService(typeof(IVsWebBrowsingService)) as IVsWebBrowsingService;

      IVsWebBrowser browser; IVsWindowFrame frame;
      uint dwCreateFlags = (uint)(
        __VSCREATEWEBBROWSER.VSCWB_AutoShow | __VSCREATEWEBBROWSER.VSCWB_StartCustom | __VSCREATEWEBBROWSER.VSCWB_ForceNew | __VSCREATEWEBBROWSER.VSCWB_NoReadCache
        //__VSCREATEWEBBROWSER.VSCWB_AutoShow | __VSCREATEWEBBROWSER.VSCWB_StartCustom | __VSCREATEWEBBROWSER.VSCWB_ReuseExisting | __VSCREATEWEBBROWSER.VSCWB_NoReadCache
        );
      Guid guidNull = Guid.Empty;
      if (service.CreateWebBrowser(dwCreateFlags, ref guidNull, null, url, null, out browser, out frame) != 0) return;

      object postDataObj = postData; object obj = null;
      browser.NavigateEx(0, url, ref obj, ref postDataObj, ref obj);

    }

    void progressStart() {
      working = true;
      var th = new Thread(() => {
        IVsStatusbar statusBar = (IVsStatusbar)GetService(typeof(SVsStatusbar));
        if (statusBar == null) return;
        uint cookie = 0;
        string label = "Compiling module...";

        // Initialize the progress bar.
        statusBar.Progress(ref cookie, 1, "", 0, 0);
        while (working)
          for (uint i = 0, total = 100; i <= total; i++) {
            if (!working) break;
            // Display incremental progress.
            statusBar.Progress(ref cookie, 1, label, i, total);
            System.Threading.Thread.Sleep(100);
          }

        // Clear the progress bar.
        statusBar.Progress(ref cookie, 0, "", 0, 0);
      });
      th.Start();
    } bool working = false;
    void progressEnd() { working = false; }


    IVsProject getActProject() {
      var miscFiles = Microsoft.VisualStudio.Shell.Package.GetGlobalService(typeof(SVsExternalFilesManager)) as IVsExternalFilesManager;
      if (miscFiles != null) {
        IVsProject res;
        miscFiles.GetExternalFilesProject(out res);
        if (res != null) return res;
      }

      var solution = Microsoft.VisualStudio.Shell.Package.GetGlobalService(typeof(SVsSolution)) as IVsSolution;
      var guid = Guid.Empty; IEnumHierarchies hierarchyEnum = null;
      var hr = solution.GetProjectEnum((uint)__VSENUMPROJFLAGS.EPF_ALLPROJECTS, ref guid, out hierarchyEnum);
      if (hierarchyEnum == null) return null;
      hierarchyEnum.Reset();
      uint numFetched = 1;
      var item = new IVsHierarchy[1];
      hierarchyEnum.Next(1, item, out numFetched);
      while (numFetched == 1) {
        var vsProject = item[0] as IVsProject;
        if (vsProject != null) return vsProject;
      }

      return null;
    }

    static void ProcessHierarchy(IVsHierarchy hierarchy) {
      // Traverse the nodes of the hierarchy from the root node
      ProcessHierarchyNodeRecursively(hierarchy, VSConstants.VSITEMID_ROOT);
      //adjustRootUrl(hierarchy, currentItemId);
      //object value = null; object o; uint actItemId = currentItemId; string strVal;
      //while (true) {
      //  int res2;
      //  res2 = selected.GetProperty(actItemId, (int)__VSHPROPID.VSHPROPID_ParentHierarchy, out value);
      //  res2 = selected.GetProperty(actItemId, (int)__VSHPROPID.VSHPROPID_ParentHierarchyItemid, out value);
      //  if (value is int && ((int)value) > 0) {
      //    selected.GetProperty((uint)(int)value, (int)__VSHPROPID.VSHPROPID_Name, out o);
      //    selected.GetCanonicalName((uint)(int)value, out strVal);
      //  }
      //  IVsSolution2
      //  res2 = selected.GetProperty(actItemId, (int)__VSHPROPID.VSHPROPID_Parent, out value);
      //  if (!(value is int)) break;
      //  var i = (int)value; if (i < 0) break;
      //  actItemId = (uint)i;
      //}    
    }

    static IEnumerable<uint> getChildNodes(IVsHierarchy hierarchy, uint folderId) {
      object value;
      var res = hierarchy.GetProperty(folderId, (int)__VSHPROPID.VSHPROPID_FirstVisibleChild, out value);
      while (res == VSConstants.S_OK && value != null) {
        if (value is int && (uint)(int)value == VSConstants.VSITEMID_NIL) break; // No more nodes
        uint child = (uint)(int)value; yield return child;
        value = null;
        res = hierarchy.GetProperty(child, (int)__VSHPROPID.VSHPROPID_NextVisibleSibling, out value);
      }
    }

    static void ProcessHierarchyNodeRecursively(IVsHierarchy hierarchy, uint itemId) {
      int result;
      IntPtr nestedHiearchyValue = IntPtr.Zero;
      uint nestedItemIdValue = 0;
      object value = null;
      uint visibleChildNode;
      Guid nestedHierarchyGuid;
      IVsHierarchy nestedHierarchy;

      // First, guess if the node is actually the root of another hierarchy (a project, for example)
      nestedHierarchyGuid = typeof(IVsHierarchy).GUID;
      result = hierarchy.GetNestedHierarchy(itemId, ref nestedHierarchyGuid, out nestedHiearchyValue, out nestedItemIdValue);

      if (result == VSConstants.S_OK && nestedHiearchyValue != IntPtr.Zero && nestedItemIdValue == VSConstants.VSITEMID_ROOT) {
        // Get the new hierarchy
        nestedHierarchy = System.Runtime.InteropServices.Marshal.GetObjectForIUnknown(nestedHiearchyValue) as IVsHierarchy;
        System.Runtime.InteropServices.Marshal.Release(nestedHiearchyValue);

        if (nestedHierarchy != null) {
          ProcessHierarchy(nestedHierarchy);
        }
      } else // The node is not the root of another hierarchy, it is a regular node
         {
        ShowNodeName(hierarchy, itemId);

        // Get the first visible child node
        result = hierarchy.GetProperty(itemId, (int)__VSHPROPID.VSHPROPID_FirstVisibleChild, out value);

        while (result == VSConstants.S_OK && value != null) {
          if (value is int && (uint)(int)value == VSConstants.VSITEMID_NIL) {
            // No more nodes
            break;
          } else {
            visibleChildNode = Convert.ToUInt32(value);

            // Enter in recursion
            ProcessHierarchyNodeRecursively(hierarchy, visibleChildNode);

            // Get the next visible sibling node
            value = null;
            result = hierarchy.GetProperty(visibleChildNode, (int)__VSHPROPID.VSHPROPID_NextVisibleSibling, out value);
          }
        }
      }
    }

    static void ShowNodeName(IVsHierarchy hierarchy, uint itemId) {
      int result;
      object value = null;
      string name = "";
      string canonicalName = "";

      result = hierarchy.GetProperty(itemId, (int)__VSHPROPID.VSHPROPID_Name, out value);

      if (result == VSConstants.S_OK && value != null) {
        name = value.ToString();
      }

      result = hierarchy.GetCanonicalName(itemId, out canonicalName);

      var res = "Name: " + name + "\r\n" + "Canonical name: " + canonicalName;
      if (res == null) return;
    }



    //static string appId = "vsNet".ToLower();
    //static string exModelTypeName = "vsNetExModel".ToLower();

    //**************************************
    //
    //               KNOW HOW CODE
    //
    //**************************************

    private void ShowExMenuItemCallback(object sender, EventArgs e) {
      OleMenuCmdEventArgs arg = e as OleMenuCmdEventArgs;
      // Show a Message Box to prove we were here
      IVsUIShell uiShell = (IVsUIShell)GetService(typeof(SVsUIShell));
      IVsSolution solution = Package.GetGlobalService(typeof(SVsSolution)) as IVsSolution;
      IVsMonitorSelection monSel = (IVsMonitorSelection)GetService(typeof(SVsShellMonitorSelection));
      uint currentItemId;
      string currentDocument;
      IVsMultiItemSelect pMult;
      IntPtr selPtr = IntPtr.Zero;
      IntPtr hierPtr = IntPtr.Zero;
      int hr = monSel.GetCurrentSelection(out hierPtr, out currentItemId, out pMult, out selPtr);
      IVsHierarchy SelectedHierarchy = Marshal.GetObjectForIUnknown(hierPtr) as IVsHierarchy;
      hr = SelectedHierarchy.GetCanonicalName(currentItemId, out currentDocument);
      MessageBox.Show(currentDocument);
      var proj = LoadedProjects().ToArray();

      IVsWindowFrame ppFrame;
      var service = Package.GetGlobalService(typeof(IVsWebBrowsingService)) as IVsWebBrowsingService;
      service.Navigate("http://www.langmaster.com/", 0, out ppFrame);

      Guid clsid = Guid.Empty;
      int result;
      //Microsoft.VisualStudio.ErrorHandler.ThrowOnFailure(uiShell.ShowMessageBox(
      //           0,
      //           ref clsid,
      //           "SolutionToolbar",
      //           string.Format(CultureInfo.CurrentCulture, "Inside {0}.MenuItemCallback()", this.ToString()),
      //           string.Empty,
      //           0,
      //           OLEMSGBUTTON.OLEMSGBUTTON_OK,
      //           OLEMSGDEFBUTTON.OLEMSGDEFBUTTON_FIRST,
      //           OLEMSGICON.OLEMSGICON_INFO,
      //           0,        // false
      //           out result));
    }

    static public IEnumerable<IVsProject> LoadedProjects() {
      IVsSolution solution = Package.GetGlobalService(typeof(SVsSolution)) as IVsSolution;
      IEnumHierarchies enumerator = null;
      Guid guid = Guid.Empty;
      solution.GetProjectEnum((uint)__VSENUMPROJFLAGS.EPF_LOADEDINSOLUTION, ref guid, out enumerator);
      IVsHierarchy[] hierarchy = new IVsHierarchy[1] { null };
      uint fetched = 0;
      for (enumerator.Reset(); enumerator.Next(1, hierarchy, out fetched) == VSConstants.S_OK && fetched == 1; /*nothing*/) {
        yield return (IVsProject)hierarchy[0];
      }
    }

    static void RefreshList() {
      var framesList = new List<IVsWindowFrame>();
      var toolWindowNames = new List<string>();

      // Get the UI Shell service
      IVsUIShell4 uiShell = (IVsUIShell4)Microsoft.VisualStudio.Shell.Package.GetGlobalService(typeof(SVsUIShell));
      // Get the tool windows enumerator
      IEnumWindowFrames windowEnumerator;

      uint flags = unchecked(((uint)__WindowFrameTypeFlags.WINDOWFRAMETYPE_Tool | (uint)__WindowFrameTypeFlags.WINDOWFRAMETYPE_Uninitialized));
      ErrorHandler.ThrowOnFailure(uiShell.GetWindowEnum(flags, out windowEnumerator));

      IVsWindowFrame[] frame = new IVsWindowFrame[1];
      uint fetched = 0;
      int hr = VSConstants.S_OK;
      // Note that we get S_FALSE when there is no more item, so only loop while we are getting S_OK
      while (hr == VSConstants.S_OK) {
        // For each tool window, add it to the list
        hr = windowEnumerator.Next(1, frame, out fetched);
        ErrorHandler.ThrowOnFailure(hr);
        if (fetched == 1) {
          if (frame[0].IsVisible() == VSConstants.S_OK) {
            // We successfully retrieved a window frame, update our lists
            string caption = (string)GetProperty(frame[0], (int)__VSFPROPID.VSFPROPID_Caption);
            toolWindowNames.Add(caption);
            framesList.Add(frame[0]);
          }
        }
      }
    }

    static object GetProperty(IVsWindowFrame frame, int propertyID) {
      object result = null;
      ErrorHandler.ThrowOnFailure(frame.GetProperty(propertyID, out result));
      return result;
    }

  }

  public class LoggerVSNet : LoggerMemory {
    IVsOutputWindowPane pane;
    public LoggerVSNet(Func<Type, object> getService) {
      IVsOutputWindow outWindow = Package.GetGlobalService(typeof(SVsOutputWindow)) as IVsOutputWindow;

      // Use e.g. Tools -> Create GUID to make a stable, but unique GUID for your pane.
      // Also, in a real project, this should probably be a static constant, and not a local variable
      Guid customGuid = gd;
      string customTitle = "LANGMaster Log";
      outWindow.CreatePane(ref gd, customTitle, 1, 1);

      outWindow.GetPane(ref customGuid, out pane);

      pane.Activate(); // Brings this pane into view


      //Guid guidGeneralPane = VSConstants.GUID_OutWindowGeneralPane;
      //var outputWindow = getService(typeof(SVsOutputWindow)) as IVsOutputWindow;
      //outputWindow.GetPane(ref guidGeneralPane, out pane);
    }
    static Guid gd = new Guid("0F44E2D1-F5FA-4d2d-AB30-22BE8ECD9789");
    protected override void write(string msg) {
      //System.Diagnostics.Debugger.Log(0, msg, msg);
      pane.OutputStringThreadSafe(msg);
    }
  }


  internal class BrowserUser : IVsWebBrowserUser {
    public int Disconnect() {
      return 0;
    }
    public int FilterDataObject(Microsoft.VisualStudio.OLE.Interop.IDataObject pDataObjIn, out Microsoft.VisualStudio.OLE.Interop.IDataObject ppDataObjOut) {
      ppDataObjOut = null;
      return 0;
    }
    public int GetCmdUIGuid(out System.Guid pguidCmdUI) {
      pguidCmdUI = System.Guid.Empty;
      return 0;
    }
    public int GetCustomMenuInfo(object pUnkCmdReserved, object pDispReserved, uint dwType, uint dwPosition, out System.Guid pguidCmdGroup, out int pdwMenuID) {
      pguidCmdGroup = System.Guid.Empty;
      pdwMenuID = 0;
      return 0;
    }
    public int GetCustomURL(uint nPage, out string pbstrURL) {
      pbstrURL = null;
      return 0;
    }
    public int GetDropTarget(Microsoft.VisualStudio.OLE.Interop.IDropTarget pDropTgtIn, out Microsoft.VisualStudio.OLE.Interop.IDropTarget ppDropTgtOut) {
      ppDropTgtOut = null;
      return 0;
    }
    public int GetExternalObject(out object ppDispObject) {
      ppDispObject = null;
      return 0;
    }
    public int GetOptionKeyPath(uint dwReserved, out string pbstrKey) {
      pbstrKey = null;
      return 0;
    }
    public int Resize(int cx, int cy) {
      return 0;
    }
    public int TranslateAccelarator(MSG[] lpmsg) {
      return 0;
    }
    public int TranslateUrl(uint dwReserved, string lpszURLIn, out string lppszURLOut) {
      lppszURLOut = null;
      return 0;
    }
  }

}
//**********  XREF
//void testXref(object sender) {
//  var cmd = sender as OleMenuCommand; if (cmd == null) return;
//  adjustFileContext(ref actCtx);
//  cmd.Visible = actCtx.hasAction(CourseMeta.vsNetClient.actions.xref);
//  //var fn = adjustFileContext(); if (fn == null) return;
//  //if (fn.EndsWith("\\")) fn = fn + "meta.xml";
//  //if (!File.Exists(fn)) return;
//  //cmd.Visible = fn.EndsWith("meta.xml");
//}

//void doXref() {
//  progressStart();
//  try {
//    adjustFileContext(ref actCtx); if (actCtx == null) return;
//    var href = publisherCtx.webAppUrl + "author/author.aspx?mode=xref&url=" + actCtx.url;
//    navigate(href, null);
//fileContext fx = (fileContext)actCtx.vsNetHiearchy;
//IVsProject3 pro = (IVsProject3)(fx.hierarchy as IVsProject3);
//int retVal;
////string fileName = actCtx.fileName.Replace("meta.xml",null) + "xxx.xml";
//string dir = actCtx.fileName.Replace("meta.xml", null) + @"yyy";
//string fileName = dir + @"\meta.xml";
//Directory.CreateDirectory(dir);
//File.Create(fileName).Close();
//VSADDRESULT[] addResArr = new VSADDRESULT[1];
//string[] fnarr = new string[] { dir };
//uint cFilesToOpen = 1;
//retVal = pro.AddItem(fx.itemId, VSADDITEMOPERATION.VSADDITEMOP_OPENFILE, dir, cFilesToOpen, fnarr, IntPtr.Zero, addResArr);
////foreach (var child in getChildNodes(fx.hierarchy, fx.itemId)) {
////  string path;
////  fx.hierarchy.GetCanonicalName(child, out path);
////  path = null;
////}
//if (retVal == 0) {
//  int pfFound; uint newDirId, newFileId;
//  VSDOCUMENTPRIORITY[] pdwPriority = new VSDOCUMENTPRIORITY[1];
//  retVal = pro.IsDocumentInProject(fileName, out pfFound, pdwPriority, out newDirId);
//  fnarr[0] = fileName;
//  retVal = pro.AddItem(newDirId, VSADDITEMOPERATION.VSADDITEMOP_OPENFILE, fileName, cFilesToOpen, fnarr, IntPtr.Zero, addResArr);
//  if (retVal == 0) {
//    retVal = pro.IsDocumentInProject(fileName, out pfFound, pdwPriority, out newFileId);
//    if (retVal == 0) {
//      Guid guid = Guid.Empty;
//      IVsWindowFrame frame = null;
//      retVal = pro.OpenItem(newFileId, ref guid, IntPtr.Zero, out frame);
//      if (frame != null) frame.Show();
//    }
//  }
//}
//return;

//  } finally {
//    progressEnd();
//  }
//}
//var serviceProvider = Package.GetGlobalService(typeof(Microsoft.VisualStudio.OLE.Interop.IServiceProvider)) as Microsoft.VisualStudio.OLE.Interop.IServiceProvider;
//IVsHierarchy hierarchy = (IVsHierarchy)GetService(typeof(SVsSolution)) as IVsHierarchy;
////IVsSolution2 sol = GetService(typeof(SVsSolution)) as IVsSolution2;
//ProcessHierarchy(hierarchy);
////string currentDocument;
////hr = hierarchy.GetCanonicalName(currentItemId, out currentDocument);
////return currentDocument.ToLower();



//var projs = LoadedProjects.ToArray();
//var proj = getActProject();
//if (proj == null) return;
//var vp = proj as IVsWebProject;
//string str;
//proj.GetMkDocument(VSConstants.VSITEMID_ROOT, out str);
//if (str == null) return;

//frame.SetProperty((int)__VSFPROPID.VSFPROPID_Caption, title);
//Microsoft.VisualStudio.Shell.Interop.__VSFPROPID
//service.Navigate(url, 0, out ppFrame);
//Microsoft.VisualStudio.Shell.Interop.__VSWBNAVIGATEFLAGS
//Microsoft.VisualStudio.Shell.Interop.__VSCREATEWEBBROWSER
//Microsoft.VisualStudio.Shell.Interop.IVsWebBrowser

//object value = null; string path; uint actItemId = currentItemId;
//while (true) {
//  int res2;
//  res2 = selectedHierarchy.GetProperty(actItemId, (int)__VSHPROPID.VSHPROPID_Parent, out value);
//  if (!(value is int) || (int)value < 0) {
//    selectedHierarchy.GetCanonicalName(actItemId, out path);
//    if (string.IsNullOrEmpty(path)) break;
//    var idx = path.Substring(0, path.Length - 1).LastIndexOf("\\");
//    publisherCtx = new publisherContext(path.Substring(0, idx + 1));
//    break;
//  }
//  actItemId = (uint)(int)value;
//}