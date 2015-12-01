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
      var msgObj = new SendGridMessage() {
        Subject = msg.subject,
        Html = msg.body ?? msg.plainBody,
        Text = msg.plainBody,
        From = new MailAddress(msg.from.email, msg.from.title),
        To = msg.to.Select(t => new MailAddress(t.email, t.title)).ToArray(),
        Cc = msg.cc == null ? null : msg.cc.Select(t => new MailAddress(t.email, t.title)).ToArray(),
        Bcc = msg.bcc == null ? null : msg.bcc.Select(t => new MailAddress(t.email, t.title)).ToArray(),
      };
      if (msg.attachments != null) foreach (var at in msg.attachments) {
          using (var str = new MemoryStream()) {
            var data = Encoding.UTF8.GetBytes(at.body);
            str.Write(data, 0, data.Length);
            str.Seek(0, SeekOrigin.Begin);
            msgObj.AddAttachment(str, at.fileName);
          }
        }
      transportWeb.DeliverAsync(msgObj).Wait();
    }

  }

}