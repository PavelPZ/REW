using LMComLib;
using LMNetLib;
using Login;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Author {
  public partial class DeployForm : Form {
    public DeployForm() {
      InitializeComponent();
    }

    public static void show(fileContext file) {
      if (instance == null) instance = new DeployForm(file);
      instance.file = file;
      instance.ShowDialog();
    } static DeployForm instance;

    DeployForm(fileContext file)
      : this() {
      this.file = file;
      this.ProgressBar.Value = 0;
      publPersist.InitFromPersist(file.publ.publisher, file.publ.publisherFn, file.publ.webAppUrl);
      email = publPersist.instance.email;
      individualChecked = publPersist.instance.individualChecked;
      companyId = publPersist.instance.companyId;
      runAfterDeploy = publPersist.instance.runAfterDeploy;

      //binding
      EmailTb.DataBindings.Add("Text", this, "email", false, DataSourceUpdateMode.OnPropertyChanged);
      Func<string> EmailTbValidating = () => { if (string.IsNullOrEmpty(EmailTb.Text)) return "Required"; else if (EmailTb.Text.Length < 3) return "Wrong"; else return null; };
      EmailTb.Validating += (s, a) => emailError.SetError(EmailTb, EmailTbValidating());

      PasswordTb.DataBindings.Add("Text", this, "password", false, DataSourceUpdateMode.OnPropertyChanged);
      Func<string> PasswordTbValidating = () => string.IsNullOrEmpty(PasswordTb.Text) ? "Required" : null;
      PasswordTb.Validating += (s, a) => passwordError.SetError(PasswordTb, PasswordTbValidating());

      IndividualCb.DataBindings.Add("CheckState", this, "individualChecked", false, DataSourceUpdateMode.OnPropertyChanged);
      CompaniesCmb.DataBindings.Add("SelectedValue", this, "companyId", false, DataSourceUpdateMode.OnPropertyChanged);
      CompaniesCmb.DisplayMember = "title"; CompaniesCmb.ValueMember = "id";
      RunCb.DataBindings.Add("Checked", this, "runAfterDeploy", false, DataSourceUpdateMode.OnPropertyChanged);

      PropertyChanged += (s, a) => {
        switch (a.PropertyName) {
          case "email":
          case "password": LoginBtn.Enabled = string.IsNullOrEmpty(EmailTbValidating() + PasswordTbValidating()); break;
          case "individualChecked":
          case "companyId": adjustCompanyStatus(); break;
        }
      };
    }
    fileContext file;

    void adjustCompanyStatus() {
      if (publPersist.instance.cookie == null) return;
      IndividualCb.Enabled = publPersist.individualNotReady ? false : true;
      CompaniesCmb.Enabled = individualChecked != CheckState.Checked;
      DeployBtn.Enabled = RunCb.Enabled = RemoveBtn.Enabled = individualChecked == CheckState.Checked || (individualChecked != CheckState.Unchecked && CompaniesCmb.SelectedIndex >= 0);
    }

    void LoginBtn_Click(object sender, EventArgs e) {
      LoginError.Text = null;
      Cursor.Current = Cursors.WaitCursor;
      try {
        try { publPersist.instance.InitFromLogin(EmailTb.Text, PasswordTb.Text); } finally { Cursor.Current = Cursors.Default; }
      } catch { LoginError.Text = "Wrong email or password"; return; }
      //unbind compId, password
      foreach (var ctrl in LoginGroup.Controls.OfType<Control>()) { if (ctrl == LoginLogged) continue; ctrl.Visible = false; }
      LoginLogged.Visible = true;
      LoginLogged.Text = string.Format("Logged to {0} {1} ({2})", publPersist.instance.cookie.FirstName, publPersist.instance.cookie.LastName, publPersist.instance.cookie.EMail);

      //prepare company
      CompaniesCmb.DataSource = publPersist.instance.myData.Companies != null ? publPersist.instance.myData.Companies.Select(c => new comp(c)).ToArray() : null;
      adjustCompanyStatus();
    }

    private void DeleteBtn_Click(object sender, EventArgs e) {
      Cursor.Current = Cursors.WaitCursor;
      try {
        var isIndv = individualChecked == CheckState.Checked;
        var par = new Admin.CmdDeployProject { action = Admin.DeployProjectAction.remove, url = file.url, isCompany = !isIndv, id = isIndv ? publPersist.instance.cookie.id : companyId };
        var res = publPersist.instance.callRpc<Admin.CmdDeployProjectResult>(par);
      } finally { Cursor.Current = Cursors.Default; Close(); }
    }

    private void DeployBtn_Click(object sender, EventArgs e) {
      Cursor.Current = Cursors.WaitCursor;
      try {
        try {
          //zacatek deplomnetu: priprav prostoru pro data, adjustace companyId pro individual
          var isIndv = individualChecked == CheckState.Checked;
          var par = new Admin.CmdDeployProject { action = Admin.DeployProjectAction.deployStart, url = file.url, isCompany = !isIndv, id = isIndv ? publPersist.instance.cookie.id : companyId };
          var res = publPersist.instance.callRpc<Admin.CmdDeployProjectResult>(par);
          //vyuziti res2
          par.action = Admin.DeployProjectAction.deployEnd;
          par.isCompany = true; par.id = res.companyId;

          var localProdUrl = Author.Server.prodUrlFromCourseUrl(file.url);
          var globalProductUrl = Author.Server.urlFromDesignUrl(res.companyId, localProdUrl);
          var globalPublisherDir = Author.Server.urlFromDesignUrl(res.companyId, null);
          //persistence udaju z formulare
          publPersist.instance.InitFromCompany(individualChecked, (int)(CompaniesCmb.SelectedValue ?? -1), runAfterDeploy, globalPublisherDir);
          //prenos ZIP pomoci FTP
          var ftp = new FtpClient(vsNetConfig.AppSettings["ftp.url"], vsNetConfig.AppSettings["ftp.user"], vsNetConfig.AppSettings["ftp.password"], vsNetConfig.AppSettings["ftp.dir"]);
          var ftpPath = Author.Server.urlFromDesignUrl(res.companyId, file.url) + "deploy.zip";
          using (var str = new MemoryStream()) {
            vsNetServer.getPublishProduct(str, file, localProdUrl, globalPublisherDir);
            ftp.FtpUpload(ftpPath, str.ToArray(), percent => ProgressBar.Value = percent, error => {
              if (error != null) {
                vsNetServer.log.ErrorLineFmt("DeployForm", "DeployForm.FtpUpload error, {0}", LowUtils.ExceptionToString(error));
                Close();
                return;
              }
              try {
                string ticketUrl = null;
                if (runAfterDeploy) {
                  ticketUrl = Guid.NewGuid().ToString().Replace("-", null);
                  par.ticket = new CmdLoginTicket {
                    email = publPersist.instance.cookie.EMail,
                    //hash = string.Format("school@schoolcoursemetamodel@{0}@{1}@", res2.companyId, globalProductUrl),
                    name = ticketUrl
                  };
                }
                //konec deplomnetu: proved deployment ze ZIPu apod.
                res = publPersist.instance.callRpc<Admin.CmdDeployProjectResult>(par);
                //run course
                if (runAfterDeploy) {
                  var homePage = vsNetConfig.AppSettings["homePage"];
                  homePage += homePage.IndexOf('?') >= 0 ? "&" : "?";
                  Process.Start(file.publ.webAppUrl + "/" + homePage + "ticket=" + ticketUrl);
                }
              } catch (Exception exp) {
                vsNetServer.log.ErrorLineFmt("DeployForm", "DeployForm.FtpUpload success, {0}", LowUtils.ExceptionToString(exp));
              }
              Close();
            });
          }
          //using (var str = File.OpenWrite(Machines.rootDir + ftpPath.Replace('/', '\\') + "deploy.zip")) vsNetServer.build(str, file, localProdUrl, globalBublisherDir);
          //ticket pro spusteni bez nutnosti loginu
        } catch (Exception exp) {
          vsNetServer.log.ErrorLineFmt("DeployForm", "DeployForm.DeployBtn_Click, {0}", LowUtils.ExceptionToString(exp));
        }
      } finally { Cursor.Current = Cursors.Default; }
    }

    public event PropertyChangedEventHandler PropertyChanged; void NotifyPropertyChanged(String info) { if (PropertyChanged != null) PropertyChanged(this, new PropertyChangedEventArgs(info)); }

    public string email { get { return _email; } set { _email = _email == null ? null : _email.ToLower(); if (_email == value) return; _email = value; NotifyPropertyChanged("email"); } } string _email;
    public string password { get { return _password; } set { if (_password == value) return; _password = value; NotifyPropertyChanged("password"); } } string _password;
    public CheckState individualChecked { get { return _individualChecked; } set { if (_individualChecked == value) return; _individualChecked = value; NotifyPropertyChanged("individualChecked"); } }  CheckState _individualChecked;
    public int companyId { get { return _companyId; } set { if (_companyId == value) return; _companyId = value; NotifyPropertyChanged("companyId"); } } int _companyId;
    public bool runAfterDeploy { get { return _runAfterDeploy; } set { if (_runAfterDeploy == value) return; _runAfterDeploy = value; NotifyPropertyChanged("runAfterDeploy"); } } bool _runAfterDeploy;

    public class comp { public comp(MyCompany cmp) { this.cmp = cmp; } MyCompany cmp; public int id { get { return cmp.Id; } } public string title { get { return cmp.Title; } } }

    private void WebLinkBtn_Click(object sender, EventArgs e) {
      Process.Start(file.publ.webAppUrl + "/" + vsNetConfig.AppSettings["homePage"]);
    }
  }

  public class publPersist {

    public string email;
    public int companyId;
    public CheckState individualChecked;
    public bool runAfterDeploy;

    public const bool individualNotReady = false;
    public static publPersist instance;

    public override string ToString() {
      return LowUtils.Base64Decode(Encoding.UTF8.GetBytes(Newtonsoft.Json.JsonConvert.SerializeObject(this)));
    }
    public static void InitFromPersist(CourseMeta.publisher publ, string publFn, string webAppUrl) {
      if (string.IsNullOrEmpty(publ.vsNetData)) instance = new publPersist { companyId = -1, individualChecked = individualNotReady ? CheckState.Unchecked : CheckState.Indeterminate, runAfterDeploy = true };
      else instance = Newtonsoft.Json.JsonConvert.DeserializeObject<publPersist>(Encoding.UTF8.GetString(LowUtils.Base64Encode(publ.vsNetData)));
      instance.webAppUrl = webAppUrl; instance.publFn = publFn; instance.publ = publ;
    }
    public void InitFromLogin(string email, string password) {
      CmdProfile profile = callRpc<CmdProfile>(new CmdLmLogin { email = email, password = LowUtils.packStr(password) });
      cookie = profile.Cookie;
      myData = callRpc<MyData>(new Login.CmdMyInit { lmcomId = publPersist.instance.cookie.id });
      this.email = email;
      save();
    }
    public void InitFromCompany(CheckState individualChecked, int companyId, bool runAfterDeploy, string publisherRoot) {
      this.individualChecked = individualChecked; this.companyId = companyId; this.runAfterDeploy = runAfterDeploy;
      publ.publisherRoot = publisherRoot;
      save();
    }
    void save() {
      if (publ == null) return;
      publ.vsNetData = ToString(); 
      CourseMeta.data.writeObject(publ, publFn);
    }
    public T callRpc<T>(object data) where T : class {
      WebClient wc = new WebClient();
      wc.Encoding = Encoding.UTF8;
      var json = Newtonsoft.Json.JsonConvert.SerializeObject(data);
      var uploadUrl = webAppUrl + "/Service.ashx?type=" + data.GetType().FullName;
      var res = wc.UploadData(uploadUrl, Encoding.UTF8.GetBytes(json));
      RpcResponse resp = Newtonsoft.Json.JsonConvert.DeserializeObject<RpcResponse>(Encoding.UTF8.GetString(res));
      if (resp.error != 0) throw new Exception(resp.errorText);
      return Newtonsoft.Json.JsonConvert.DeserializeObject<T>(Newtonsoft.Json.JsonConvert.SerializeObject(resp.result));
    }

    [JsonIgnore]
    public LMCookieJS cookie;
    [JsonIgnore]
    public Login.MyData myData;
    [JsonIgnore]
    public string webAppUrl;
    [JsonIgnore]
    public string publFn;
    [JsonIgnore]
    public CourseMeta.publisher publ;
  }


}
