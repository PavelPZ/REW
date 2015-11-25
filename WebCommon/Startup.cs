using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Hosting;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Routing;
using Microsoft.AspNet.Routing.Template;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.PlatformAbstractions;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace WebApp {

  public class Startup {

    public Startup(IHostingEnvironment env, IApplicationEnvironment appEnv) {
      //Trace.AutoFlush = true;
      Trace.TraceInformation("WebApp.Startup: " + appEnv.ApplicationBasePath);

      //var builder = new ConfigurationBuilder()
      //  .SetBasePath(appEnv.ApplicationBasePath)
      //  .AddJsonFile("config.json")
      ////.AddEnvironmentVariables()
      //;
      //Configuration = builder.Build();

      //inicializace config souboru
      Cfg.init(appEnv.ApplicationBasePath + @"\wwwroot\servConfig.js");
      applicationBasePath = appEnv.ApplicationBasePath;
    }
    public IConfiguration Configuration { get; set; }
    string applicationBasePath;

    public void ConfigureServices(IServiceCollection services) {
      //services.AddOptions();
      //services.Configure<AppSettings>(appset => appset.web4Dir = Configuration["AppSettings:web4Dir"]);
      //services.AddInstance(Configuration);
      services.AddMvc();
    }

    public void Configure(IApplicationBuilder app) {

      //app.Run(async (context) => {
      //  await context.Response.WriteAsync("Hello World! ");
      //});

      app.UseDeveloperExceptionPage();
      app.UseRuntimeInfoPage();
      app.UseIISPlatformHandler();

      //login page - vraci prazdnou login stranku (pouze se scriptem na oAUth login)
      //app.UseRouter(new TemplateRoute(new LoginRouter(), "login.html", app.ApplicationServices.GetService<IInlineConstraintResolver>()));
      if (Cfg.cfg.defaultPars.swFromFileSystem) {
        //soubory z filesystemu
        app.UseRouter(new TemplateRoute(new OtherFilesRoute(), "{*url:regex(~)}", app.ApplicationServices.GetService<IInlineConstraintResolver>()));
      } else {
        Cache.init(applicationBasePath + @"\swfiles.zip");
        //zkus .CSHTML index straky z cache
        app.UseRouter(new TemplateRoute(new IndexCacheRoute(servConfig.Apps.web4), HomeController.web4Mask, app.ApplicationServices.GetService<IInlineConstraintResolver>()));
        app.UseRouter(new TemplateRoute(new IndexCacheRoute(servConfig.Apps.oauth), HomeController.oAuthMask, app.ApplicationServices.GetService<IInlineConstraintResolver>()));
        app.UseRouter(new TemplateRoute(new IndexCacheRoute(servConfig.Apps.web), HomeController.webTestMask, app.ApplicationServices.GetService<IInlineConstraintResolver>()));
        //zkus ostati file z cache
        app.UseRouter(new TemplateRoute(new OtherCacheRoute(), "{*url:regex(~)}", app.ApplicationServices.GetService<IInlineConstraintResolver>()));
      }

      //MVC zpracovani INDEX stranek: zacne middleware, ten v await next() vyvola MVC (na generaci INDEX), middleware pak da vysledek do cache (vcetne GZIP)
      //Cache middleware - sance na cache .CSHTML stranek (vcetne pripravy GZIPu)
      app.Use(Cache.Middleware);
      //MVC router
      app.UseMvc();

      //app.UseExceptionHandler("/Home/Error");

    }
    // Entry point for the application.
    public static void Main(string[] args) => WebApplication.Run<Startup>(args);

  }

  public class AppSettings {
    public string web4Dir;
  }

  //cached INDEX pages
  public class IndexCacheRoute : IRouter { //cached INDEX pages
    public IndexCacheRoute(servConfig.Apps app) { this.app = app; }
    public async Task RouteAsync(RouteContext context) { await Cache.onIndexCache(context, app); }
    VirtualPathData IRouter.GetVirtualPath(VirtualPathContext context) { throw new NotImplementedException(); }
    servConfig.Apps app;
  }
  //cached other pages
  public class OtherCacheRoute : IRouter {
    public async Task RouteAsync(RouteContext context) { await Cache.onOtherCache(context); }
    VirtualPathData IRouter.GetVirtualPath(VirtualPathContext context) { throw new NotImplementedException(); }
  }
  //other pages form filesystem
  public class OtherFilesRoute : IRouter {
    public async Task RouteAsync(RouteContext context) { await Cache.onOtherFile(context); }
    VirtualPathData IRouter.GetVirtualPath(VirtualPathContext context) { throw new NotImplementedException(); }
  }
  //login page
  public class LoginRouter : IRouter {
    public async Task RouteAsync(RouteContext context) { await context.HttpContext.Response.WriteAsync(""); context.IsHandled = true; }
    VirtualPathData IRouter.GetVirtualPath(VirtualPathContext context) { throw new NotImplementedException(); }
  }
}
//web api model binding: https://lbadri.wordpress.com/2014/11/23/web-api-model-binding-in-asp-net-mvc-6-asp-net-5/
//redirect: http://www.dotnet-tricks.com/Tutorial/mvc/4XDc110313-return-View()-vs-return-RedirectToAction()-vs-return-Redirect()-vs-return-RedirectToRoute().html
//asp.net5 aplikaci ze scratche: http://jtower.com/blog/new-asp-net-5-project-from-scratch-with-visual-studio-2015-part-2
// natvrdo vrati text: app.Run(async (context) => { await context.Response.WriteAsync("Hello World!"); });
