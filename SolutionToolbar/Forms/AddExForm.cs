using LMNetLib;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Xml.Linq;

namespace Author {
  public partial class AddExForm : Form {
    public AddExForm() {
      InitializeComponent();
    }

    public AddExForm(actions action, fileContext file, Action<string[], string> onFinish)
      : this() {
      this.file = file; this.action = action; this.onFinish = onFinish;
      HomeBtn_Click(null, null);
      //new browserEx.browser(webBrowser, () => HomeBtn_Click(null, null));
    }
    Action<string[], string> onFinish;
    public actions action;
    public fileContext file;
    string exUrl;


    private void OkBtn_Click(object sender, EventArgs e) {
      //extract XML s shell
      var txt = webBrowser.DocumentText;
      var scriptStart = string.Format("<script type=\"text/xml\" data-id=\"{0}\">", exUrl.Replace("/demo/", "/shell/"));
      var startIdx = txt.IndexOf(scriptStart); if (startIdx < 0) throw new Exception(exUrl);
      startIdx += scriptStart.Length;
      var endIdx = txt.IndexOf("</script>", startIdx);
      var xml = txt.Substring(startIdx, endIdx - startIdx);
      //
      var root = XElement.Parse(xml);
      var name = root.Element("body").Attribute("id").Value.ToLower();
      var num = Convert.ToInt32(NumOfPages.Value); if (num <= 0) { Close(); return; }
      var files = Enumerable.Range(1, 10000).Where(i => !file.folderContent.Contains(name + "_" + i.ToString() + ".xml")).Take(num).Select(i => name + "_" + i.ToString()).ToArray();
      onFinish(files, xml);
      Close();
    }

    private void HomeBtn_Click(object sender, EventArgs e) {
      var tempFn = Path.GetTempPath() + "exformdata.htm";
      if (!exformdataExist) {
        exformdataExist = true;
        var srcFn = vsNetServer.resourcePath + @"author\exformdata.htm";
        var html = Author.vsNetServer.FormatNamedProps(File.ReadAllText(srcFn), key => {
          switch (key) {
            case "baseTagUrl": return vsNetConfig.AppSettings["webAppUrl"];
            default: throw new NotImplementedException();
          }
        });
        File.WriteAllText(tempFn, html, Encoding.UTF8);
      }
      webBrowser.Navigate("file:///" + tempFn);
    }
    static bool exformdataExist;

    private void BackBtn_Click(object sender, EventArgs e) {
      if (webBrowser.CanGoBack) webBrowser.GoBack();
    }

    private void webBrowser_Navigated(object sender, WebBrowserNavigatedEventArgs e) {
      exUrl = null;
      try {
        var parts = (webBrowser.Url.Fragment ?? "").Split(new char[] { '#', '@' }, StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length < 5 || parts[4].EndsWith("/")) return;
        exUrl = parts[4]; 
      } finally { OkBtn.Enabled = exUrl!=null; }
    }

  }
}
