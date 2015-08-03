using System;
using System.Data;
using System.Net;
using System.Configuration;
using System.Web;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Text;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Xml;
using System.Xml.Schema;
using System.Xml.Serialization;
using System.Web.Hosting;
using System.Reflection;

using LMNetLib;
using LMScormLibDOM;
using LMComLib;

namespace LMScormLib {

  //musi odpovidat S4N.Cst v .JS
  public enum CourseTreeType {
    no,
    content,
    run,
    result,
    setStart
  }

  public class CoursePlaceholder : PlaceHolder {
  }

  public class CourseItem : PlaceHolder {
    CourseIds crsId;
    public CourseIds CrsId { get { return crsId; } set { crsId = value; } }
  }

  public abstract class OrderingCtrl : Ctrl {
    Ordering data;
    protected abstract void getInfo(out string acceptData, out string dragStatusChanged, out bool doSwap, out int columnIdx, out int rowIdx);
    protected override void OnLoad(EventArgs e) {
      base.OnLoad(e);
      LMScormClientScript.RegisterScriptInclude("atlastoolkit/timer", "atlastoolkit/common", "atlastoolkit/dragdropscripts", "lm/ordering");
      register("orderings.js", null, null);
      registerCSS("ordering.css", "eva.css", "drag.css");
      string dragStatusChanged, acceptData; bool doSwap; int columnIdx, rowIdx;
      getInfo(out acceptData, out dragStatusChanged, out doSwap, out columnIdx, out rowIdx);
      data = (LMScormLibDOM.Ordering)Data;
      LMScormClientScript.RegisterAjaxScript("S4N.ReorderList",
        new AjaxPairs(
          "initValue", "#a" + data.DisplayIndexes,
          "rowIdx", rowIdx,
          "columnIdx", columnIdx,
          "doSwap", doSwap,
          "dragTemplate", string.Format("#s$get('{0}_dragtemplate')", data.varName)),
        new AjaxPairs("dragStatusChanged", dragStatusChanged, "acceptData", acceptData, "canDrop", "ord_canDrop"),
        null,
        data.varName);
    }
  }

  public static class OtherLib {
    /*public static void courseHomeBuildTree(Control parent, SiteMapNode root, Dictionary<string, int> nodeIds, CourseTreeType type, bool isRoot)
    {
      if (!root.HasChildNodes) return;
      string spaceId, globalId;
      Control placeHolder = LowUtils.FindControlEx(parent, "TreePlace");
      foreach (SiteMapNode nd in root.ChildNodes)
      {
        if (nd["specialNode"] == "support") continue;
        lm_scorm.decodeAbsoluteUrl(nd.Url, out spaceId, out globalId);
        Control ctrl = parent.Page.LoadControl("~/Framework/Controls/CommonParts/CourseTreeNode.ascx");
        bool isModule = nd["template"] == "lmsModule";
        Ctrl.setFields(
          ctrl, "node", nd, "urlToId", nodeIds, "type", type, "isModule", isModule,
          "isLast", root.ChildNodes[root.ChildNodes.Count - 1] == nd, "nodeId", nodeIds[nd.Url]);
        placeHolder.Controls.Add(ctrl);
        if (!isModule) courseHomeBuildTree(ctrl, nd, nodeIds, type, false);
      }
    }
    public static string courseHomeNodeId(SiteMapNode node, Dictionary<string, int> urlToId)
    {
      return "n" + urlToId[node.Url].ToString();
    }*/

    public static IEnumerable<string> moduleIds(SiteMapNode root) {
      if (root == null) yield break;
      foreach (SiteMapNode subRoot in root.ChildNodes) {
        if (subRoot["specialNode"] == "support") continue;
        foreach (SiteMapNode nd in LowUtils.allNodes(subRoot, delegate(SiteMapNode subNd) { return subNd["template"] == "lmsModule"; })) {
          string si, gi;
          lm_scorm.decodeAbsoluteUrl(nd.Url, out si, out gi);
          yield return LowUtils.JSONToId(si, gi);
        }
      }
    }

    static Dictionary<char, char> normTable;
    static string[] table = new string[] { };
    /*"41", "410",
    "61", "430",
    "42", "412",
    "62", "432",
    "45", "415",
    "65", "435",
    "4B", "41A",
    "6B", "43A",
    "4D", "41C",
    "6D", "43C",
    "48", "41D",
    "68", "43D",
    "4F", "41E",
    "6F", "43E",
    "50", "420",
    "70", "440",
    "43", "421",
    "63", "441",
    "54", "422",
    "74", "442",
    "59", "423",
    "79", "443",
    "58", "425",
    "78", "445",
    "EB", "451"*/

    public static string NormalizeString(string s) {
      if (string.IsNullOrEmpty(s)) return s;
      if (normTable == null) {
        normTable = new Dictionary<char, char>();
        for (int i = 1; i < table.Length; i += 2)
          normTable.Add(
            Convert.ToChar(int.Parse(table[i], System.Globalization.NumberStyles.HexNumber)),
            Convert.ToChar(int.Parse(table[i - 1], System.Globalization.NumberStyles.HexNumber)));
      }
      //PRO JAVASCRIPT LMSys.js
      //string js = null;
      //foreach (KeyValuePair<char, char> kv in normTable)
      //js += string.Format("'{0}','{1}',\r\n", Convert.ToInt16(kv.Key), kv.Value);
      char[] chars = s.ToCharArray();
      char ch;
      for (int i = 0; i < chars.Length; i++)
        if (normTable.TryGetValue(chars[i], out ch)) chars[i] = ch;
      return new String(chars);
    }
  }

  //Objekty pro JSON serializaci dat pro home stranky kurzu. Vyuzito v Framework/Controls/CommonParts/CourseTree.ascx
  public class CourseTreeNode {
    public string title;
    public int id;
    public int exNum;
    public object control;
    public object parent;
    public bool isModule;
    public bool isLast;
    [System.Web.Script.Serialization.ScriptIgnoreAttribute]
    public int modules;

    //pro ucely statistiky: zjisteni poctu modulu a cviceni
    public static CourseTreeNode getCourseTree(CourseIds crsId) {
      courseNodes nodes;
      Deployment.courseNodes(crsId, out nodes, false);
      int mc = 0; int fc = 1000;
      return CourseTreeNode.buildTree(nodes.home, CourseTreeType.no, ref mc, ref fc);
    }

    public static CourseTreeNode buildTree(SiteMapNode node, CourseTreeType type, ref int modCount, ref int folderCount) {
      CourseTreeNode res = null;
      if (node["template"] == "lmsModule") res = new CourseTreeModule();
      else res = new CourseTreeFolder();
      res.title = node.Title;
      res.isLast = node.ParentNode.ChildNodes.IndexOf(node) == node.ParentNode.ChildNodes.Count - 1;
      if (res is CourseTreeFolder) {
        res.id = folderCount++;
        CourseTreeFolder fld = (CourseTreeFolder)res;
        //spocti nodes
        int cnt = 0;
        foreach (SiteMapNode child in node.ChildNodes)
          if (child["specialNode"] == "support") continue; else cnt++;
        //vytvor objekty
        fld.childs = new CourseTreeNode[cnt];
        cnt = 0;
        foreach (SiteMapNode child in node.ChildNodes) {
          if (child["specialNode"] == "support") continue;
          fld.childs[cnt] = buildTree(child, type, ref modCount, ref folderCount);
          fld.exNum += fld.childs[cnt].exNum;
          fld.modules += fld.childs[cnt].modules;
          cnt++;
        }
        fld.title = fld.title + " (" + 
          fld.modules + " " + CSLocalize.localize("45ce5688c9c4473dbf2ea7411992f712", LocPageGroup.EA_Code, "(*...kurz obsahuje celkem 32 *)kapitol") +
          " " + fld.exNum + " " + CSLocalize.localize("223784bcd3ea469991b306c3bf4004f5", LocPageGroup.EA_Code, "(*...kurz obsahuje celkem 32 *)cvičení") + ")";
      } else {
        if (type != CourseTreeType.no)
          LMScormClientScript.Register(node.Url, Lib.RelativeUrl(node.Url), ClientScriptPlace.WGetUrl);
        res.id = modCount++;
        CourseTreeModule fld = (CourseTreeModule)res;
        fld.notResetable = node["notResetable"] == "true";
        fld.relUrl = Lib.RelativeUrl(node.Url);
        string spaceId, globalId;
        lm_scorm.decodeAbsoluteUrl(node.Url, out spaceId, out globalId);
        fld.dataId = LowUtils.JSONToId(spaceId, globalId);
        fld.exNum = node.ChildNodes.Count - 3; //minus lmsHome, lmsResult, lmsTop
        fld.modules = 1;
        if (type == CourseTreeType.content || type == CourseTreeType.setStart) {
          fld.exercises = new CourseExercise[node.ChildNodes.Count];
          for (int i = 0; i < fld.exercises.Length; i++) {
            fld.exercises[i] = new CourseExercise();
            fld.exercises[i].Title = node.ChildNodes[i].Title;
            fld.exercises[i].RelUrl = Lib.RelativeUrl(node.ChildNodes[i].Url);
          }
        }
        fld.title = modCount.ToString() + ". " + fld.title + " (" + fld.exNum + " " +
          CSLocalize.localize("240502d2512946a58eff685c6cdb1318", LocPageGroup.EA_Code, "(*...kapitola obsahuje celkem 32 *)cvičení") + ")";
      }
      return res;
    }
  }
  public class CourseTreeModule : CourseTreeNode {
    public CourseTreeModule() {
      this.isModule = true;
    }
    public string relUrl;
    public string dataId;
    public bool notResetable;
    public CourseTreeFolderData data;
    public CourseExercise[] exercises;
  }
  public class CourseTreeFolder : CourseTreeNode {
    public CourseTreeFolder() {
      this.isModule = false;
    }
    public CourseTreeNode[] childs;
    public int maxModules = 0;
    //public int modules = 0;
    public CourseTreeFolderData data = new CourseTreeFolderData();
  }
  public class CourseTreeFolderData {
    public int st = 0;
    public int ms = 0;
    public int s = 0;
    public int bt = 0;
    public int et = 0;
    public int t = 0;
  }
  public class CourseExercise {
    public string Title;
    public string RelUrl;
  }

  [Serializable]
  public class CharWidth {
    static CharWidth instance;
    public static CharWidth Instance() {
      if (instance == null) {
        instance = (CharWidth)XmlUtils.FileToObject(HttpRuntime.AppDomainAppPath + @"Framework\Tools\CharWidth.xml", typeof(CharWidth));
        foreach (Chw chw in instance.Items)
          instance.items.Add(Convert.ToChar(chw.code), chw);
        instance.M = instance.items['M'];
      }
      return instance;
    }
    public Chw[] Items;
    [XmlIgnore]
    public Dictionary<char, Chw> items = new Dictionary<char, Chw>();
    [XmlIgnore]
    public Chw M;
    public static int emWidth(string s) {
      if (string.IsNullOrEmpty(s)) return 0;
      Instance();
      int res = 0; Chw chw;
      foreach (char ch in s) {
        if (!instance.items.TryGetValue(ch, out chw))
          chw = instance.M;
        res += chw.big;
      }
      double resD = ((double)res) / instance.M.big;
      res = (int)resD;
      if (res < resD) res += 1;
      return res;
    }
  }
  [Serializable]
  public class Chw {
    [XmlAttribute]
    public ushort code;
    [XmlAttribute]
    public byte small;
    [XmlAttribute]
    public byte big;
  }

}
