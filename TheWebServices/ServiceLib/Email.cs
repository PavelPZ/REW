using LMNetLib;
using Newtonsoft.Json;
using SendGrid;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Net.Mime;
using System.Text;
using System.Web.Http;

namespace emailer {

  public class emailController : ApiController {

    public static void init() {
      transportWeb = new Web(new NetworkCredential(Cfg.cfg.sendGrid.userName, Cfg.cfg.sendGrid.password));
    }
    static Web transportWeb;

    [ActionName("Send"), HttpPost]
    public void Send([FromBody]string msgStr) {
      //https://github.com/sendgrid/sendgrid-csharp
      var msg = JsonConvert.DeserializeObject<emailMsg>(msgStr);

      MailMessage mailMsg = new MailMessage();
      // To
      foreach (var t in msg.to) mailMsg.To.Add(new MailAddress(t.email, t.title));
      // From
      mailMsg.From = new MailAddress(msg.from.email, msg.from.title);
      // Subject and multipart/alternative Body
      mailMsg.Subject = "subject";
      //string text = "text body";
      //mailMsg.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(text, null, MediaTypeNames.Text.Plain));
      mailMsg.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(msg.body ?? msg.plainBody, null, MediaTypeNames.Text.Html));

      // Init SmtpClient and send
      //SmtpClient smtpClient = new SmtpClient("smtp.sendgrid.net", Convert.ToInt32(587));
      //NetworkCredential credentials = new System.Net.NetworkCredential("langmaster-email", "CZ.langmaster1");
      SmtpClient smtpClient = new SmtpClient("mail.starlab.cz", Convert.ToInt32(25));
      smtpClient.EnableSsl = true;
      NetworkCredential credentials = new System.Net.NetworkCredential("info@gw.langmaster.com", "PhoozaAK47");
      smtpClient.Credentials = credentials;

      smtpClient.Send(mailMsg);


      //var msgObj = new SendGridMessage() {
      //  Subject = msg.subject,
      //  Html = msg.body ?? msg.plainBody,
      //  //Text = msg.plainBody,
      //  From = new MailAddress(msg.from.email, msg.from.title),
      //  To = msg.to.Select(t => new MailAddress(t.email, t.title)).ToArray(),
      //  //Cc = msg.cc == null ? null : msg.cc.Select(t => new MailAddress(t.email, t.title)).ToArray(),
      //  //Bcc = msg.bcc == null ? null : msg.bcc.Select(t => new MailAddress(t.email, t.title)).ToArray(),
      //};
      //if (msg.attachments != null) foreach (var at in msg.attachments) {
      //    using (var str = new MemoryStream()) {
      //      var data = Encoding.UTF8.GetBytes(at.body);
      //      str.Write(data, 0, data.Length);
      //      str.Seek(0, SeekOrigin.Begin);
      //      msgObj.AddAttachment(str, at.fileName);
      //    }
      //  }
      //transportWeb.DeliverAsync(msgObj).Wait();
    }

  }

}