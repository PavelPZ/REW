using LMComLib;
using LMNetLib;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Xml.Linq;

namespace web4.Schools.Design {
  public partial class DefaultDict : System.Web.UI.Page {

    protected void DictForCourses(object sender, EventArgs e) {
      DictForCourse.DictForCourses();
    }

    protected void FinishBtn_Click(object sender, EventArgs e) {
      Ultralingua.Lib.Op1_Finish();
    }
    protected void MakeWordListBtn_Click(object sender, EventArgs e) {
      //Ultralingua.lib.MakeWordList();
      Ultralingua.Lib.MakeWordList_Other();
    }
    protected void WordFormsBtn_Click(object sender, EventArgs e) {
      Ultralingua.Lib.WordForms();
      Ultralingua.Lib.LingeaWordForms();
    }

    protected void Wiki_ExtractTexts(object sender, EventArgs e) {
      Wikdionary.Lib.ExtractTexts();
    }

    

    protected void OldToNew1(object sender, EventArgs e) { LingeaDictionary.OldToNew1(); }
    protected void OldToNew2(object sender, EventArgs e) { LingeaDictionary.OldToNew2(); }
    protected void OldToNew3(object sender, EventArgs e) { LingeaDictionary.OldToNew3(); }

  }
}