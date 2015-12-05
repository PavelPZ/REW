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
      foreach (var t in msg.to) mailMsg.To.Add(new MailAddress(t.email, t.title));
      mailMsg.From = new MailAddress(msg.from.email, msg.from.title);
      mailMsg.Subject = "subject";
      //string text = "text body";
      //mailMsg.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(text, null, MediaTypeNames.Text.Plain));
      mailMsg.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(msg.body ?? msg.plainBody, null, MediaTypeNames.Text.Html));

      // Init SmtpClient and send
      SmtpClient smtpClient = new SmtpClient("mail.starlab.cz", Convert.ToInt32(25));
      smtpClient.EnableSsl = true;
      NetworkCredential credentials = new System.Net.NetworkCredential("info@gw.langmaster.com", "PhoozaAK47");
      smtpClient.Credentials = credentials;

      smtpClient.Send(mailMsg);
    }

  }

}