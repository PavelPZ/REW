using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;

namespace TheWeb {
  public static class WebApiConfig {
    public static void Register(HttpConfiguration config) {
      // Web API configuration and services
      config.Formatters.Add(new TextPlainFormatter());

      // Web API routes
      config.MapHttpAttributeRoutes();
       
      config.Routes.MapHttpRoute(
          name: "DefaultApi",
          routeTemplate: "api/{controller}/{action}"
      );
    }
  }

  public class TextPlainFormatter : MediaTypeFormatter {
    public TextPlainFormatter() {
      this.SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/plain"));
    }

    public override bool CanWriteType(Type type) {
      return type == typeof(string);
    }

    public override bool CanReadType(Type type) {
      return type == typeof(string);
    }

    public override Task WriteToStreamAsync(Type type, object value, Stream stream, HttpContent content, TransportContext transportContext) {
      return Task.Factory.StartNew(() => {
        StreamWriter writer = new StreamWriter(stream);
        writer.Write(value);
        writer.Flush();
      });
    }

    public override Task<object> ReadFromStreamAsync(Type type, Stream stream, HttpContent content, IFormatterLogger formatterLogger) {
      return Task.Factory.StartNew(() => {
        StreamReader reader = new StreamReader(stream);
        return (object)reader.ReadToEnd();
      });
    }
  }

}
