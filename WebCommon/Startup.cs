using Microsoft.AspNet.Builder;
using Microsoft.Framework.DependencyInjection;
using System;

namespace WebApplication5 {
  public class Startup {
    public void ConfigureServices(IServiceCollection services) {
      services.AddMvc();
    }

    public void Configure(IApplicationBuilder app) {

      app.UseIISPlatformHandler();

      app.Use(async (context, next) => {
        Console.WriteLine(context.Request.Path);
        try {
          await next();
          //await context.Response.WriteAsync("XXXXXXX");
        } catch (Exception ex) {
          Console.WriteLine(ex);
        }
      });

      app.UseMvc();// routes => {
        //routes.MapRoute(
        //  name: "Index1"
        //  ,template: "{controller=Home}/{action=Index1}/{id?}"
        //  ,defaults: new { }
        //  );
        //routes.MapRoute(
        //  name: "Index2",
        //  template: "{controller=Home}/{action=Index2}/{id?}");
      //});
    }
  }
}
//web api model binding: https://lbadri.wordpress.com/2014/11/23/web-api-model-binding-in-asp-net-mvc-6-asp-net-5/
//redirect: http://www.dotnet-tricks.com/Tutorial/mvc/4XDc110313-return-View()-vs-return-RedirectToAction()-vs-return-Redirect()-vs-return-RedirectToRoute().html
//asp.net5 aplikaci ze scratche: http://jtower.com/blog/new-asp-net-5-project-from-scratch-with-visual-studio-2015-part-2
// natvrdo vrati text: app.Run(async (context) => { await context.Response.WriteAsync("Hello World!"); });
