using System;
using System.Linq;
using System.Reflection;
using System.Collections.Generic;
using System.Web.Http;
using System.Text;

namespace jsWebApiProxy2 {

  public class NameSpaceDefinition {
    public NameSpaceDefinition(string name, params Type[] types) {
      NamespaceName = name;
      Controllers = types.Select(t => new ControllerDefinition(t)).ToArray();
    }
    public string NamespaceName;
    public ControllerDefinition[] Controllers;
  }
  public class ControllerDefinition {
    public ControllerDefinition(Type tp) {
      controllerParser.parseController(tp, this);
    }
    public string ControllerName;
    public ActionMethodDefinition[] ActionMethods;
  }
  public class ActionMethodDefinition {
    public string HttpMethod;
    public string ActionName;
    public string Url;
    public List<ParameterDefinition> UrlParameters = new List<ParameterDefinition>();
    public ParameterDefinition BodyParameter;
    public Type ReturnType;
  }
  public class ParameterDefinition {
    public string Name;
    public Type Type;
    public bool isBody;
  }

  public static class controllerGenerator {
    public static string generate(Func<Type, HashSet<string>, string> inlineTypeGenerator, string[] alreadyDefinedtypes, params ControllerDefinition[] controllers) {
      var ctx = new context {
        sb = new StringBuilder(),
        alreadyDefinedtypes = new HashSet<string>(alreadyDefinedtypes),
        inlineTypeGenerator = inlineTypeGenerator
      };
      ctx.sb.AppendLine("namespace proxies {");
      ctx.sb.AppendLine("  export var invoke: (url: string, type: string, queryPars: Object, body: string, completed: (res) => void) => void;");
      foreach (var nm in controllers) generate(ctx, nm);
      ctx.sb.AppendLine("}");
      return ctx.sb.ToString();
    }
    static void generate(context ctx, ControllerDefinition def) {
      ctx.sb.AppendFormat("  namespace {0} {{", def.ControllerName); ctx.sb.AppendLine();
      foreach (var act in def.ActionMethods) generate(ctx, act);
      ctx.sb.AppendLine("  }"); ctx.sb.AppendLine();
    }
    static void generate(context ctx, ActionMethodDefinition method) {
      ctx.sb.AppendFormat("    export function {0} ({1}): void {{", method.ActionName, declarePars(ctx, method)); ctx.sb.AppendLine();
      ctx.sb.AppendFormat("      invoke({0});", invokePars(method)); ctx.sb.AppendLine();
      ctx.sb.AppendLine("    }");
    }
    static string declarePars(context ctx, ActionMethodDefinition method) {
      var allParameters = method.UrlParameters;
      var selectedParameters = allParameters.Where(m => m != null).Select(m => m.Name.ToLower() + ": " + ctx.inlineTypeGenerator(m.Type, ctx.alreadyDefinedtypes)).ToList();
      var retType = ctx.inlineTypeGenerator(method.ReturnType, ctx.alreadyDefinedtypes);
      selectedParameters.Add("completed: " + (string.IsNullOrEmpty(retType) ? "() => void" : "(res: " + retType + ") => void"));
      return string.Join(", ", selectedParameters);
    }
    static string invokePars(ActionMethodDefinition method) {
      var invokePar = new {
        //TODO 
        url = method.ActionName.ToLower(),
        method = method.HttpMethod.ToLower(),
        queryPars = method.UrlParameters.Count() == 0 ? (string)null : "{ " + method.UrlParameters.Select(p => p.Name.ToLower()).Select(p => p + ": " + p).DefaultIfEmpty().Aggregate((r, i) => r + ", " + i) + " }",
        body = method.BodyParameter != null ? "JSON.stringify(" + method.BodyParameter.Name.ToLower() + ")" : "null"
      };
      return string.Format("'{0}', '{1}', {2}, {3}, completed", invokePar.url, invokePar.method, invokePar.queryPars ?? "null", invokePar.body);
    }
    public class context {
      public StringBuilder sb;
      public HashSet<string> alreadyDefinedtypes;
      public Func<Type, HashSet<string>, string> inlineTypeGenerator;
    }
  }

  public static class controllerParser {
    public static void parseController(Type cls, ControllerDefinition res) {
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
      ParameterDefinition bodyPar = null;
      foreach (var par in method.GetParameters().OrderBy(p => p.Position)) {
        var pd = new ParameterDefinition { Name = par.Name, Type = par.ParameterType };
        pd.isBody = par.GetCustomAttributes(typeof(FromBodyAttribute), false).Length > 0;
        if (pd.isBody) bodyPar = pd; else res.UrlParameters.Add(pd);
      }
      if (bodyPar != null) res.UrlParameters.Add(bodyPar);
      return res;
    }
  }
}