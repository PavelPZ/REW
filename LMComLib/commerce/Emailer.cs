using System;
using System.Data;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace LMComLib {
  /// <summary>
  /// Summary description for Emailer
  /// </summary>
  public class Emailer {
    private static string Chilkat_Mht = System.Configuration.ConfigurationManager.AppSettings["Chilkat.Mht"];
    private static string Chilkat_MailMan = System.Configuration.ConfigurationManager.AppSettings["Chilkat.MailMan"];

    public class Attachment {
      public string fileName;
      public byte[] content;
      public string contentType;

      public Attachment(string FileName, byte[] Content, string ContentType) {
        this.content = (byte[])Content.Clone();
        this.contentType = ContentType;
        this.fileName = FileName;
      }
    }

    #region Properities

    private string html;
    public string HTML {
      get { return html; }
      set {
        html = value;
        //Chilkat.Mht mht = new Chilkat.Mht();
        dynamic mht = null;;
        bool success = false; // mht.UnlockComponent(Emailer.Chilkat_Mht);
        if (success != true) {
          throw new Exception("Chilkat Mht trial expired!");
        }

        mht.UseCids = true;

        // Create an email from an HTML file.
        // Call mht.HtmlToEML to get the MIME source of an email,
        // then load it into an email object.
        email = null; // new Chilkat.Email();
        string mime;
        mime = mht.HtmlToEML(html);
        email.SetFromMimeText(mime);
        this.PlainText = Html2Text(html);
      }
    }

    private string plain;
    public string PlainText {
      get { return plain; }
      set {
        plain = value;
        email.AddPlainTextAlternativeBody(plain);
      }
    }

    private string from;
    public string From {
      get { return from; }
      set { from = value; }
    }

    private string subject;
    public string Subject {
      get { return subject; }
      set { subject = value; }
    }

    #endregion Properities

    private Dictionary<string, string> to;
    private List<Attachment> attachments;
    dynamic email;
    //Chilkat.Email email;

    public static string sendEMail(string toEMails, string fromEMail, string subject, string body, bool isHtml, Emailer.Attachment att, string cc = null) {
      Emailer em = new Emailer();
      em.HTML = body;
      em.Subject = subject;
      em.From = fromEMail;
      foreach (string mail in toEMails.Split(new char[] { ';', ',' })) em.AddTo(mail);
      if (cc != null) foreach (string mail in cc.Split(new char[] { ';', ',' })) em.AddTo("+" + mail);
      if (att != null) em.AddAttachment(att);
      return em.sendMail();
    }

    public static void SendEMail(string toEMails, string fromEMail, string subject, string body, bool isHtml, Emailer.Attachment att, string cc = null) {
      sendEMail(toEMails, fromEMail, subject, body, isHtml, att, cc);
    }

    public Emailer() {
      email = null;// new Chilkat.Email();
      attachments = new List<Attachment>();
      to = new Dictionary<string, string>();
    }

    public void Replace(string oldValue, string newValue) {
      this.HTML = this.HTML.Replace(oldValue, newValue);
      this.PlainText = this.PlainText.Replace(oldValue, newValue);
    }

    public void AddAttachment(Attachment att) {
      attachments.Add(att);
    }

    public void ClearAttachment() {
      attachments.Clear();
    }

    public void AddTo(string email) {
      to.Add(email, email);
    }

    public void AddToCC(string email) {
      to.Add(email, email);
    }

    public void AddTo(string title, string email) {
      to.Add(title, email);
    }

    public void ClearTo() {
      to.Clear();
    }

    public bool SaveMail(string file) {
      RefreshMail();
      return email.SaveEml(file);
    }

    protected void RefreshMail() {
      email.Subject = Subject;
      email.Charset = "utf-8";
      email.ClearTo();
      foreach (string key in to.Keys) {
        string em = to[key];
        if (em[0] == '-') email.AddBcc(key, em.Substring(1));
        else if (em[0] == '+') email.AddCC(key, em.Substring(1));
        else email.AddTo(key, em);
      }
      email.From = From;
      email.DropAttachments();
      if (attachments.Count > 0)
        foreach (Attachment att in attachments)
          email.AddDataAttachment2(att.fileName, att.content, att.contentType);
    }

    public string sendMail() {
      RefreshMail();

      //Chilkat.MailMan mailman = new Chilkat.MailMan();
      dynamic mailman = null;
      if (!mailman.UnlockComponent(Emailer.Chilkat_MailMan)) {
        throw new Exception("Chilkat MailMan trial expired!");
      }
      // Set the SMTP server hostname.
      mailman.SmtpHost = SmtpHost;
      mailman.SmtpUsername = SmtpUsername;
      mailman.SmtpPassword = SmtpPassword;
      if (!mailman.SendEmail(email)) {
        string err = mailman.LastErrorText;
        if (err != null) return err;
        return "Error";
      }
      return null;
    }

    public bool SendMail() {
      return sendMail()==null;
    }
    static string SmtpHost = System.Configuration.ConfigurationManager.AppSettings["Email.SmtpHost"];
    static string SmtpUsername = System.Configuration.ConfigurationManager.AppSettings["Email.SmtpUsername"];
    static string SmtpPassword = System.Configuration.ConfigurationManager.AppSettings["Email.SmtpPassword"];

    public string Html2Text(string source) {
      try {
        string result;
        // Remove HTML Development formatting
        // Replace line breaks with space
        // because browsers inserts space
        result = source.Replace("\r", " ");
        // Replace line breaks with space
        // because browsers inserts space
        result = result.Replace("\n", " ");
        // Remove step-formatting
        result = result.Replace("\t", string.Empty);
        // Remove repeating speces becuase browsers ignore them
        result = Regex.Replace(result,
                                                              @"( )+", " ");

        // Remove the header (prepare first by clearing attributes)
        result = Regex.Replace(result,
                 @"<( )*head([^>])*>", "<head>",
                 RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 @"(<( )*(/)( )*head( )*>)", "</head>",
                 RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 "(<head>).*(</head>)", string.Empty,
                 RegexOptions.IgnoreCase);

        // remove all scripts (prepare first by clearing attributes)
        result = Regex.Replace(result,
                 @"<( )*script([^>])*>", "<script>",
                 RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 @"(<( )*(/)( )*script( )*>)", "</script>",
                 RegexOptions.IgnoreCase);
        //result = Regex.Replace(result, 
        //         @"(<script>)([^(<script>\.</script>)])*(</script>)",
        //         string.Empty, 
        //         RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 @"(<script>).*(</script>)", string.Empty,
                 RegexOptions.IgnoreCase);

        // remove all styles (prepare first by clearing attributes)
        result = Regex.Replace(result,
                 @"<( )*style([^>])*>", "<style>",
                 RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 @"(<( )*(/)( )*style( )*>)", "</style>",
                 RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 "(<style>).*(</style>)", string.Empty,
                 RegexOptions.IgnoreCase);

        // insert tabs in spaces of <td> tags
        result = Regex.Replace(result,
                 @"<( )*td([^>])*>", "\t",
                 RegexOptions.IgnoreCase);

        // insert line breaks in places of <BR> and <LI> tags
        result = Regex.Replace(result,
                 @"<( )*br( )*>", "\r",
                 RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 @"<( )*li( )*>", "\r",
                 RegexOptions.IgnoreCase);

        // insert line paragraphs (double line breaks) in place
        // if <P>, <DIV> and <TR> tags
        result = Regex.Replace(result,
                 @"<( )*div([^>])*>", "\r\r",
                 RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 @"<( )*tr([^>])*>", "\r\r",
                 RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 @"<( )*p([^>])*>", "\r\r",
                 RegexOptions.IgnoreCase);

        // Remove remaining tags like <a>, links, images,
        // comments etc - anything thats enclosed inside < >
        result = Regex.Replace(result,
                 @"<[^>]*>", string.Empty,
                 RegexOptions.IgnoreCase);

        // replace special characters:
        result = Regex.Replace(result,
                 @"&nbsp;", " ",
                 RegexOptions.IgnoreCase);

        result = Regex.Replace(result,
                 @"&bull;", " * ",
                 RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 @"&lsaquo;", "<",
                 RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 @"&rsaquo;", ">",
                 RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 @"&trade;", "(tm)",
                 RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 @"&frasl;", "/",
                 RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 @"&lt;", "<",
                 RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 @"&gt;", ">",
                 RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 @"&copy;", "(c)",
                 RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 @"&reg;", "(r)",
                 RegexOptions.IgnoreCase);
        // Remove all others. More can be added, see
        // http://hotwired.lycos.com/webmonkey/reference/special_characters/
        result = Regex.Replace(result,
                 @"&(.{2,6});", string.Empty,
                 RegexOptions.IgnoreCase);

        // for testng
        //Regex.Replace(result, 
        //       this.txtRegex.Text,string.Empty, 
        //       RegexOptions.IgnoreCase);

        // make line breaking consistent
        result = result.Replace("\n", "\r");

        // Remove extra line breaks and tabs:
        // replace over 2 breaks with 2 and over 4 tabs with 4. 
        // Prepare first to remove any whitespaces inbetween
        // the escaped characters and remove redundant tabs inbetween linebreaks
        result = Regex.Replace(result,
                 "(\r)( )+(\r)", "\r\r",
                 RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 "(\t)( )+(\t)", "\t\t",
                 RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 "(\t)( )+(\r)", "\t\r",
                 RegexOptions.IgnoreCase);
        result = Regex.Replace(result,
                 "(\r)( )+(\t)", "\r\t",
                 RegexOptions.IgnoreCase);
        // Remove redundant tabs
        result = Regex.Replace(result,
                 "(\r)(\t)+(\r)", "\r\r",
                 RegexOptions.IgnoreCase);
        // Remove multible tabs followind a linebreak with just one tab
        result = Regex.Replace(result,
                 "(\r)(\t)+", "\r\t",
                 RegexOptions.IgnoreCase);
        // Initial replacement target string for linebreaks
        string breaks = "\r\r\r";
        // Initial replacement target string for tabs
        string tabs = "\t\t\t\t\t";
        for (int index = 0; index < result.Length; index++) {
          result = result.Replace(breaks, "\r\r");
          result = result.Replace(tabs, "\t\t\t\t");
          breaks = breaks + "\r";
          tabs = tabs + "\t";
        }
        // Thats it.
        return result;

      }
      catch {
        return source;
      }
    }
  }
}
