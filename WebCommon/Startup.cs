using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Hosting;
using Microsoft.Dnx.Runtime;
using Microsoft.Framework.Configuration;
using Microsoft.Framework.DependencyInjection;
using System;
using System.Linq;
using Microsoft.AspNet.Http;
using System.Threading.Tasks;
using Microsoft.AspNet.Routing;
using Microsoft.AspNet.Routing.Template;
using System.IO;

namespace WebApp {

  public class Startup {

    public Startup(IHostingEnvironment env, IApplicationEnvironment appEnv) {

      var builder = new ConfigurationBuilder()
        .SetBasePath(appEnv.ApplicationBasePath)
        .AddJsonFile("config.json")
        //.AddEnvironmentVariables()
      ;
      Configuration = builder.Build();
    }
    public IConfiguration Configuration { get; set; }

    public void ConfigureServices(IServiceCollection services) {
      //services.AddOptions();
      services.Configure<AppSettings>(appset => appset.web4Dir = Configuration["AppSettings:web4Dir"]);
      //services.AddInstance(Configuration);
      services.AddMvc();
    }

    public void Configure(IApplicationBuilder app) {

      app.UseIISPlatformHandler();

      //login page, nedela nic
      app.UseRouter(new TemplateRoute(new LoginRouter(), "login.html", app.ApplicationServices.GetService<IInlineConstraintResolver>()));
      //URL preview, ev. obslouzeni cache
      app.UseRouter( new TemplateRoute(new IndexRoute(),"web4",app.ApplicationServices.GetService<IInlineConstraintResolver>()));
      app.UseRouter(new TemplateRoute(new IndexRoute(), "common", app.ApplicationServices.GetService<IInlineConstraintResolver>()));
      app.UseRouter(new TemplateRoute(new OtherRoute(), "{*url}", app.ApplicationServices.GetService<IInlineConstraintResolver>()));

      app.Use(Cache.Middleware);
        //Console.WriteLine(context.Request.Path);
        //try {
        //  await next();
        //} catch (Exception ex) {
        //  Console.WriteLine(ex);
        //}

      app.UseMvc();

      //app.UseExceptionHandler("/Home/Error");

      // routes => {
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

  public class AppSettings {
    public string web4Dir;
  }

  public class IndexRoute : IRouter {
    public async Task RouteAsync(RouteContext context) { await Cache.onIndexRoute(context); }
    VirtualPathData IRouter.GetVirtualPath(VirtualPathContext context) { throw new NotImplementedException(); }
  }
  public class OtherRoute : IRouter {
    public async Task RouteAsync(RouteContext context) { await Cache.onOtherRoute(context); }
    VirtualPathData IRouter.GetVirtualPath(VirtualPathContext context) { throw new NotImplementedException(); }
  }
  public class LoginRouter : IRouter {
    public async Task RouteAsync(RouteContext context) { await context.HttpContext.Response.WriteAsync(""); context.IsHandled = true; }
    VirtualPathData IRouter.GetVirtualPath(VirtualPathContext context) { throw new NotImplementedException(); }
  }
}
//web api model binding: https://lbadri.wordpress.com/2014/11/23/web-api-model-binding-in-asp-net-mvc-6-asp-net-5/
//redirect: http://www.dotnet-tricks.com/Tutorial/mvc/4XDc110313-return-View()-vs-return-RedirectToAction()-vs-return-Redirect()-vs-return-RedirectToRoute().html
//asp.net5 aplikaci ze scratche: http://jtower.com/blog/new-asp-net-5-project-from-scratch-with-visual-studio-2015-part-2
// natvrdo vrati text: app.Run(async (context) => { await context.Response.WriteAsync("Hello World!"); });
