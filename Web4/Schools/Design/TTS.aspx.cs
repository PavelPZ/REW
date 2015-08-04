using LMComLib;
using LMNetLib;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace web4.Schools.Design {
  public partial class TTS : System.Web.UI.Page {
    static Langs[] ttsLangs = new Langs[] { Langs.no, Langs.de_de };
    protected void Page_Load(object sender, EventArgs e) {
      if (IsPostBack) return;
      LangCmb.DataSource = ttsLangs.Select(l => l.ToString());
      LangCmb.DataBind();
    }

    protected void generateRecordingRequestBtn_Click(object sender, EventArgs e) {
      var lng = actLang(); if (lng == Langs.no) return;
      Tts.ToRecord.generateRecordingRequest(lng);
    }

    protected void acceptRecording_Click(object sender, EventArgs e) {
      var lng = actLang(); if (lng == Langs.no) return;
      Tts.ToRecord.acceptRecording(lng, "test");
    }

    Langs actLang() {
      if (LangCmb.SelectedIndex < 0) return Langs.no;
      return LowUtils.EnumParse<Langs>(LangCmb.SelectedValue);
    }
  }
}