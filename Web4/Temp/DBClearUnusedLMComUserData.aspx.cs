//using System;
//using LMComLib;
//using LMNetLib;
//using System.IO;
//using System.Linq;
//using System.Data.Linq;

//namespace web4.Temp {
//  public partial class DBClearUnusedLMComUserData : System.Web.UI.Page {
//    protected void Page_Load(object sender, EventArgs e) {

//    }
//    protected void GoBtn_Click(object sender, EventArgs e) {
//      var ids = File.ReadAllLines(@"c:\Temp\lmcom.txt").Where(l => !string.IsNullOrEmpty(l)).Select(l => int.Parse(l)).ToArray();
//      var db = Machines.getContext();
//      db.CommandTimeout = 10000;
//      foreach (var interv in LowUtils.intervals(ids.Length, 500)) {
//        string inClausule = ids.Skip(interv.skip).Take(interv.take).Select(i => i.ToString()).Aggregate((r, i) => r + "," + i);
//        var res = db.ExecuteCommand("DELETE FROM [CourseUser] WHERE UserId in (" + inClausule + ")");
//        //if (res2 != interv.take) break;
//        //break;
//      }
//    }
//  }
//}