using LMComLib;
using LMNetLib;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Resources;
using System.Text;
using System.Web;
using System.Web.UI.WebControls;
using System.Xml;
using System.Xml.Linq;
using Trados;

namespace web4.Trados {
  public partial class Unlock : System.Web.UI.Page {

    protected void Page_Load(object sender, EventArgs e) {
      Machines.checkAdminIP(Context);
      if (IsPostBack) return;
      refresh();
    }

    void refresh() {
      TradosDataContext db = Machines.getTradosContext();
      UnlockRep.DataSource = db.Locks.Where(l => l.Locked).Select(l => new { l.PageGroup, l.Lang }).Distinct().Select(l => new {
        Title = string.Format("{0}.{1}", Enum.GetName(typeof(LocPageGroup), l.PageGroup), Enum.GetName(typeof(Langs), l.Lang))
      });
      UnlockRep.DataBind();
    }

    IEnumerable<Lock> getLock(TradosDataContext db, string txt) {
      string[] parts = txt.Split('.');
      Langs lng = (Langs)Enum.Parse(typeof(Langs), parts[1]);
      LocPageGroup grp = (LocPageGroup)Enum.Parse(typeof(LocPageGroup), parts[0]);
      return db.Locks.Where(l => l.Lang == (short)lng && l.PageGroup == (short)grp && l.Locked);
    }

    protected void UnlockBtn_Click(object sender, EventArgs e) {
      TradosDataContext db = Machines.getTradosContext();
      LowUtils.FindControlsEx(this, ctrl => (ctrl is CheckBox) && ((CheckBox)ctrl).Checked).
        SelectMany(chb => getLock(db, ((CheckBox)chb).Text)).ToList().ForEach(lck => lck.Locked = false);
      db.SubmitChanges();
      refresh();
    }
  }
}