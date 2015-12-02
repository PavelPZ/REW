using System;
using System.Linq;
using System.Reflection;
using System.Collections.Generic;
using System.Web.Http;
using System.Text;
using LMNetLib;

namespace jsWebApiProxyNew {
  /*Priklad pouziti
    var res = controllerGenerator.generate((t, ts) => "{}", new string[0],
      new ControllerDefinition(typeof(Vyzva57ServicesController)), 
      new ControllerDefinition(typeof(ExampleController))
    );
  */

  public class ControllerDefinition {
    public ControllerDefinition(Type tp) { controllerParser.parseController(tp, this); }
    public string ControllerName;
    public ActionMethodDefinition[] ActionMethods;
    public static IEnumerable<ControllerDefinition> getControllers(string assemblyPath, params string[] typeFullNames) {
      return LowUtils.loadAssemblyTypes(assemblyPath, typeFullNames).Select(t => new ControllerDefinition(t));
    }
  }
  public class ActionMethodDefinition {
    public string HttpMethod;
    public string ActionName;
    public List<ParameterDefinition> UrlParameters = new List<ParameterDefinition>();
    public ParameterDefinition BodyParameter;
    public Type ReturnType;
  }
  public class ParameterDefinition {
    public string Name;
    public Type Type;
  }

  public static class controllerGenerator {
    public static string generate(Func<Type, LMComLib.InlineContext, string> inlineTypeGenerator, IEnumerable<Type> defined, IEnumerable<ControllerDefinition> controllers) {
      var ctx = new context {
        sb = new StringBuilder(),
        typeDefined = new HashSet<string>(defined.Select(t => t.FullName)),
        inlineTypeGenerator = inlineTypeGenerator
      };
      ctx.sb.AppendLine("namespace proxies {");
      ctx.sb.AppendLine("  export var invoke: (url: string, type: string, queryPars: Object, body: string, completed: (res) => void) => void;"); ctx.sb.AppendLine();
      foreach (var nm in controllers) generate(ctx, nm);
      ctx.sb.AppendLine("}");
      return ctx.sb.ToString();
    }
    static void generate(context ctx, ControllerDefinition def) {
      ctx.sb.AppendFormat("  export namespace {0} {{", def.ControllerName); ctx.sb.AppendLine();
      ctx.enumToDefine = new List<Type>();
      foreach (var act in def.ActionMethods) generate(ctx, def, act);
      if (ctx.enumToDefine != null && ctx.enumToDefine.Count > 0) {
        foreach (var tp in ctx.enumToDefine.Distinct()) LMComLib.CSharpToTypeScript.GenEnum(tp, ctx.sb, true);
      }
      ctx.sb.AppendLine("  }"); ctx.sb.AppendLine();
    }
    static void generate(context ctx, ControllerDefinition controller, ActionMethodDefinition method) {
      ctx.sb.AppendFormat("    export function {0} ({1}): void {{", method.ActionName, declarePars(ctx, method)); ctx.sb.AppendLine();
      ctx.sb.AppendFormat("      invoke({0});", invokePars(controller, method)); ctx.sb.AppendLine();
      ctx.sb.AppendLine("    }");
    }
    static string declarePars(context ctx, ActionMethodDefinition method) {
      var allParameters = method.UrlParameters.ToList(); if (method.BodyParameter != null) allParameters.Add(method.BodyParameter);
      var enums = new List<Type>();
      var inlineCtx = new LMComLib.InlineContext { typeDefined = ctx.typeDefined, enumToDefine = ctx.enumToDefine };
      var selectedParameters = allParameters.Where(m => m != null).Select(m => m.Name.ToLower() + ": " + ctx.inlineTypeGenerator(m.Type, inlineCtx)).ToList();
      var retType = ctx.inlineTypeGenerator(method.ReturnType, inlineCtx);
      selectedParameters.Add("completed: " + (string.IsNullOrEmpty(retType) ? "() => void" : "(res: " + retType + ") => void"));
      return string.Join(", ", selectedParameters);
    }
    static string invokePars(ControllerDefinition controller, ActionMethodDefinition method) {
      var invokePar = new {
        url = "/api/" + controller.ControllerName + '/' + method.ActionName.ToLower(),
        method = method.HttpMethod,
        queryPars = method.UrlParameters.Count() == 0
          ? (string)null
          : "{ " + method.UrlParameters.Select(p => p.Name.ToLower()).Select(p => p + ": " + p).DefaultIfEmpty().Aggregate((r, i) => r + ", " + i) + " }",
        //body = method.BodyParameter != null ? string.Format("typeof {0} == 'string' ? {0} : JSON.stringify({0})", method.BodyParameter.Name.ToLower()) : "null"
        body = method.BodyParameter != null ? string.Format("{0}", method.BodyParameter.Name.ToLower()) : "null"
      };
      return string.Format("'{0}', '{1}', {2}, {3}, completed", invokePar.url, invokePar.method, invokePar.queryPars ?? "null", invokePar.body);
    }
    public class context {
      public StringBuilder sb;
      public HashSet<string> typeDefined;
      public List<Type> enumToDefine;
      public Func<Type, LMComLib.InlineContext, string> inlineTypeGenerator;
    }
  }

  public static class controllerParser {
    public static void parseController(Type cls, ControllerDefinition res) {
      //var prefix = cls.GetCustomAttributes().OfType<RoutePrefixAttribute>().First();
      var nm = cls.Name.ToLower(); if (!nm.EndsWith("controller")) throw new Exception();
      res.ControllerName = nm.Substring(0, nm.Length - "controller".Length);
      res.ActionMethods = cls.GetMethods().Select(m => getMethodDefinition(m)).Where(ma => ma != null).ToArray();
    }
    static ActionMethodDefinition getMethodDefinition(MethodInfo method) {
      ActionNameAttribute actAttr = null; HttpGetAttribute getAttr = null; HttpPostAttribute postAttr = null;
      foreach (var attr in method.GetCustomAttributes()) { actAttr = actAttr ?? attr as ActionNameAttribute; getAttr = getAttr ?? attr as HttpGetAttribute; postAttr = postAttr ?? attr as HttpPostAttribute; }
      if (actAttr == null || (getAttr == null && postAttr == null)) return null;
      var res = new ActionMethodDefinition {
        ActionName = actAttr.Name,
        HttpMethod = getAttr != null ? "GET" : "POST",
        ReturnType = method.ReturnType.Name == "Void" ? null : method.ReturnType
      };
      foreach (var par in method.GetParameters().OrderBy(p => p.Position)) {
        var pd = new ParameterDefinition { Name = par.Name, Type = par.ParameterType };
        var isBody = par.GetCustomAttributes(typeof(FromBodyAttribute), false).Length > 0;
        if (isBody) res.BodyParameter = pd; else res.UrlParameters.Add(pd);
      }
      return res;
    }
  }
}