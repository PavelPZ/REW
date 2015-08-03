using LMComLib;
using LMNetLib;
using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Linq;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Web.Http;
using Newtonsoft.Json;
using CourseModel;

namespace azure {

  [RoutePrefix("humaneval")]
  public partial class hmanEvalController : ApiController {

    [Route("getlines"), HttpGet]
    public linesToEvalResult[] linesToEval(string compId) {
      var db = driverLow.create();
      var evals = AzureData.HumanEval.readAllForLines(db, compId).ToArray();
      var evalsObjs = evals.SelectMany(ce => ce.dataObj.Select(d => ce.line)); //kvuli count
      return evalsObjs.GroupBy(l => l).Select(grp => new azure.hmanEvalController.linesToEvalResult { line = grp.Key, count = grp.Count() }).ToArray();
    }
    public class linesToEvalResult {
      public LineIds line;
      public int count;
    }

    [Route("getTestsToAssign"), HttpGet]
    public evalLineResult getTestsToAssign(string compId, LineIds line) {
      var db = driverLow.create();
      var toEvals = AzureData.HumanEval.readAllForLine(db, compId, line).ToArray().SelectMany(ce => ce.dataObj).ToArray();
      var assigned = toEvals.Where(e => e.evaluator != null).GroupBy(e => e.evaluator).ToDictionary(e => e.Key, e => e.Count());
      var evaluators = db.compReadForEdit<AzureData.Company_User>(compId).usersObj.Users.Where(u => u.Roles != null && u.Roles.HumanEvalatorInfos != null && u.Roles.HumanEvalatorInfos.Any(he => he.lang == line)).ToArray();
      return new evalLineResult {
        evaluators = evaluators.Select(ev => { int cnt; if (!assigned.TryGetValue(ev.EMail, out cnt)) cnt = 0; return new evaluator { email = ev.EMail, num = cnt }; }).ToArray(),
        toEvaluateNum = toEvals.Length,
      };
    }
    public class evalLineResult {
      public evaluator[] evaluators; //vsechny evaluatori pro danou line s poctem doposud prirazenych testu
      public int toEvaluateNum; //celkovy pocet nevyhodnocenych testu
    }

    //reprentuje test result
    public class testItem {
      public string email; //email studenta
      public string productId; //identifikace produktu k evaluaci
      public int testKeyId; //bliysi identifikace testu
      public string evaluator; //email evaluatora
      public int assigned; //datum prirazeni evaluace, javascript Utils.nowToNum() funkci
      public CourseDataFlag flag; //test result flag 
      public List<exItem> items; //cviceni testu k vyhodnoceni
    }

    public class exItem {
      public string key;
      public CourseDataFlag flag;
    }

    public class evaluator {
      public string email; //email evaluatora
      public int num; //pocet prirazenych testu
    }

    [Route("setTestsToAssign"), HttpPost]
    public void setTestsToAssign(string compId, LineIds line, [FromBody]evaluator[] newToDo) {
      var db = driverLow.create();
      var toEvals = AzureData.HumanEval.readAllForLine(db, compId, line).ToArray(); //uzivatele s testem k vyhodnoceni
      var tests = toEvals.SelectMany(te => { foreach (var st in te.dataObj) st.email = te.email; return te.dataObj; }).ToArray(); //testy k vyhodnoceni
      if (newToDo.Sum(t => t.num) != tests.Length) throw new Exception("newToDo.Sum(t => t.num) != tests.Length");
      var freeTests = tests.Where(t => t.evaluator == null).ToList(); //neprirazene testy
      //vsichni evaluatori
      var all = newToDo.Select(e => e.email).Concat(tests.Where(t => t.evaluator != null).Select(t => t.evaluator)).Distinct().ToDictionary(ev => ev, ev => new tempInfo { email = ev, tests = new List<testItem>(), newNum = 0 });
      foreach (var newEv in newToDo) all[newEv.email].newNum = newEv.num;
      foreach (var tst in tests.Where(t => t.evaluator != null)) all[tst.evaluator].tests.Add(tst);
      //uber testy
      foreach (var ev in all.Values.Where(e => e.tests.Count() > e.newNum)) {
        var toDel = ev.tests.Count() - ev.newNum;
        freeTests.AddRange(ev.tests.Take(toDel));
        ev.tests.RemoveRange(0, toDel);
      }
      //pridej testy
      foreach (var ev in all.Values.Where(e => e.tests.Count() < e.newNum)) {
        var toAdd = ev.newNum - ev.tests.Count();
        ev.tests.AddRange(freeTests.Take(toAdd));
        freeTests.RemoveRange(0, toAdd);
      }
      //kontrola
      if (freeTests.Count != 0) throw new Exception("freeTests.Count != 0");
      //aktualizuj evaluatory
      HashSet<string> changed = new HashSet<string>();
      foreach (var kv in all)
        foreach (var st in kv.Value.tests) {
          if (st.evaluator != kv.Key) { changed.Add(st.email); st.evaluator = kv.Key; st.assigned = LowUtils.nowToNum(); }
          st.email = null;
        }
      //save
      foreach (var toEval in toEvals.Where(t => changed.Contains(t.email))) db.attach(toEval, TableOperationType.Replace);
      db.SaveChanges();
    }
    internal class tempInfo { //pomocny objekt
      internal string email; //evaluator email
      internal List<testItem> tests; //students test pro evaluatora
      internal int newNum; //pozadavek na pocet testu
    }

    [Route("getEvaluatorTests"), HttpGet]
    public getEvaluatorTestsResult[] getEvaluatorTests(string compId, string evalEmail) {
      var db = driverLow.create();
      var evals = AzureData.HumanEval.readAllForLines(db, compId).ToArray();
      return evals.SelectMany(ev => ev.dataObj.Where(d => d.evaluator == evalEmail).Select(d => new getEvaluatorTestsResult {
        email = ev.email,
        productId = d.productId,
        testKeyId = d.testKeyId,
        assigned = d.assigned
      })).ToArray();
    }
    public class getEvaluatorTestsResult {
      public string email; //email studenta
      public string productId; //identifikace produktu k evaluaci
      public int testKeyId; //bliysi identifikace testu
      public int assigned; //datum prirazeni evaluace, javascript Utils.nowToNum() funkci
    }

    [Route("getExerciseFromTest"), HttpGet]
    public string[] getExerciseFromTest(string email, string compId, LineIds line, string productId, int testKeyId) {
      var db = driverLow.create();
      var res = AzureData.HumanEval.readOrCreate(db, compId, line, email); if (res.isNew()) return null;
      var test = res.dataObj.FirstOrDefault(t => t.productId == productId && t.testKeyId == testKeyId); if (test == null) return null;
      var urls = test.items.Select(it => it.key).ToArray(); if (urls.Length == 0) return null;
      return urls;
    }


   }
}

namespace AzureData {

  //zaznam o testech k vyhodnoceni pro jednu firmu, line a studenta
  public class HumanEval : azure.azureEntity {
    public HumanEval() : base() { }
    public HumanEval(string compId, LineIds line, string email)
      : this() {
      this.compId = compId; this.line = line; this.email = email;
    }
    static IEnumerable<object> keys(LineIds line, string email) { yield return new azure.keyLib.constString(typeof(HumanEval).Name.ToLower()); yield return line.ToString(); yield return email; }
    static string partitionKey(string compId) { return azure.keyLib.encode(compId); }
    IEnumerable<object> keys() { return keys(line, email); }
    public override string PartitionKey { get { return partitionKey(compId); } set { compId = azure.keyLib.decode(value); } }
    public override string RowKey {
      get { return azure.keyLib.createKeyLow(keys()); }
      set { var parts = value.Split(azure.keyLib.charMin); line = LowUtils.EnumParse<LineIds>(parts[1]); email = azure.keyLib.decode(parts[2]); }
    }

    public string compId;
    public LineIds line;
    public string email;

    public List<azure.hmanEvalController.testItem> dataObj;
    public string data { get { return toJson(dataObj); } set { dataObj = fromJson<List<azure.hmanEvalController.testItem>>(value); } }

    //public void refreshEvalData(string productId, int testKeyId, AzureData.saveKeyDataObj[] pcEvals) {
    //  if (dataObj.Any(st => st.productId == productId && st.testKeyId == testKeyId)) return;
    //  dataObj.Add(new azure.hmanEvalController.student { productId = productId, testKeyId = testKeyId });
    //}

    protected override void afterRead(string key, EntityProperty prop) {
      switch (key) {
        case "data": data = prop.StringValue; break;
        default: base.afterRead(key, prop); break;
      }
    }
    protected override void beforeWrite(Action<string, EntityProperty> writeProp) {
      base.beforeWrite(writeProp);
      writeProp("data", new EntityProperty(data));
    }
    public static HumanEval readOrCreate(azure.driverLow db, string compId, LineIds line, string email) {
      var example = new HumanEval(compId, line, email);
      return db.read(example) ?? example;
    }
    public static void refreshEvals(azure.driverLow db, string compId, LineIds line, string email, string productId, int testKeyId, AzureData.saveKeyDataObj[] pcEvals) {
      var res = readOrCreate(db, compId, line, email);
      //adjust test
      if (res.dataObj == null) res.dataObj = new List<azure.hmanEvalController.testItem>();
      var test = res.dataObj.FirstOrDefault(t => t.productId == productId && t.testKeyId == testKeyId);
      if (test == null) res.dataObj.Add(test = new azure.hmanEvalController.testItem { productId = productId, testKeyId = testKeyId });
      if (test.items == null) test.items = new List<azure.hmanEvalController.exItem>();
      //zatrid pcEvals
      foreach (var eval in pcEvals) {
        if ((eval.flag & CourseDataFlag.testImpl_result) == CourseDataFlag.testImpl_result)
          test.flag = eval.flag;
        else {
          var item = test.items.FirstOrDefault(it => it.key == eval.key);
          if (item == null) test.items.Add(item = new azure.hmanEvalController.exItem { key = eval.key, flag = eval.flag });
          item.flag = eval.flag;
          if ((item.flag & CourseDataFlag.needsEval) == 0) test.items.Remove(item);
        }
      }
      if ((test.flag & CourseDataFlag.needsEval) == 0) {
        if (test.items.Count > 0) throw new Exception("test.items.Count > 0");
        res.dataObj.Remove(test);
      }
      //empty and attach
      if (res.isNew()) //new
        if (res.dataObj.Count == 0) { } else db.attach(res, TableOperationType.Insert);
      else //old
        db.attach(res, res.dataObj.Count == 0 ? TableOperationType.Delete : TableOperationType.Replace);
    }

    public static HumanEval[] readAllForLine(azure.driverLow db, string compId, LineIds line) {
      return db.executeQuery(db.keyRangeQuery<HumanEval>(partitionKey(compId), azure.keyLib.createKeyLow(keys(line, null).Take(2)))).ToArray();
    }
    public static IEnumerable<HumanEval> readAllForLines(azure.driverLow db, string compId) {
      return db.executeQuery(db.keyRangeQuery<HumanEval>(partitionKey(compId), azure.keyLib.createKeyLow(keys(LineIds.no, null).Take(1))));
    }

  }

}

namespace azure {

  public partial class hmanEvalController : ApiController {
    public static void test(StringBuilder sb) {
      var db = driverLow.create(); //if (db.mode != azureMode.azure) return;
      var eval = new hmanEvalController();
      var crs = new courseController();
      var adm = new adminCompanyController();
      evalLineResult evalLine;

      sb.AppendLine();
      sb.AppendLine("*************************************************************");
      db.testDeleteAll();

      sb.AppendLine("***** setHumanEvaluator"); 
      foreach (var em in Enumerable.Range(0, 10).Select(idx => string.Format("p{0}@p.p", idx)))
        foreach (var line in XExtension.Create(LineIds.English)) //, LineIds.German))
          crs.saveData(em, "comp1", "/p/p/p1", 1, line, new AzureData.saveKeyDataObj[] { 
            new AzureData.saveKeyDataObj { 
              key = "result", 
              flag = CourseDataFlag.testImpl_result | CourseDataFlag.pcCannotEvaluate | CourseDataFlag.needsEval
            },
            new AzureData.saveKeyDataObj { 
              key = "ex", 
              flag = CourseDataFlag.testEx | CourseDataFlag.pcCannotEvaluate | CourseDataFlag.needsEval,
            }
          });

      var lines = eval.linesToEval("comp1");

      adm.setHumanEvaluator("comp1", "ev@p.p", new LineIds[] { LineIds.English, LineIds.German });
      adm.setHumanEvaluator("comp1", "ev2@p.p", new LineIds[] { LineIds.English, LineIds.German });
      adm.setHumanEvaluator("comp1", "ev3@p.p", new LineIds[] { LineIds.English, LineIds.German });
      evalLine = eval.getTestsToAssign("comp1", LineIds.English);
      sb.AppendLine("no assign evaluators: " + JsonConvert.SerializeObject(evalLine));

      eval.setTestsToAssign("comp1", LineIds.English, new evaluator[] { 
        new evaluator{email = "ev@p.p", num = 3},
        new evaluator{email = "ev2@p.p", num = 7},
      });
      evalLine = eval.getTestsToAssign("comp1", LineIds.English);
      sb.AppendLine("assign: " + JsonConvert.SerializeObject(evalLine));

      foreach (var em in Enumerable.Range(0, 5).Select(idx => string.Format("p{0}@p.p", idx)))
        crs.saveData(em, "comp1", "/p/p/p1", 2, LineIds.English, new AzureData.saveKeyDataObj[] { 
          new AzureData.saveKeyDataObj { key = "test", flag = CourseDataFlag.testImpl_result | CourseDataFlag.pcCannotEvaluate | CourseDataFlag.needsEval, shortData = "short", longData = "long" } 
        });
      evalLine = eval.getTestsToAssign("comp1", LineIds.English);

      eval.setTestsToAssign("comp1", LineIds.English, new evaluator[] { 
        new evaluator{email = "ev@p.p", num = 6},
        new evaluator{email = "ev2@p.p", num = 3},
        new evaluator{email = "ev3@p.p", num = 6},
      });
      evalLine = eval.getTestsToAssign("comp1", LineIds.English);
      sb.AppendLine("add test and assign: " + JsonConvert.SerializeObject(evalLine));

      sb.AppendLine();
      sb.AppendLine("*************************************************************");
      db.testDeleteAll();

      adm.setHumanEvaluator("comp1", "ev@p.p", new LineIds[] { LineIds.English });
      crs.saveData("p@p.p", "comp1", "/p/p/p1", 1, LineIds.English, new AzureData.saveKeyDataObj[] { 
            new AzureData.saveKeyDataObj { 
              key = "result", 
              flag = CourseDataFlag.testImpl_result | CourseDataFlag.pcCannotEvaluate | CourseDataFlag.needsEval
            },
            new AzureData.saveKeyDataObj { 
              key = "ex1", 
              flag = CourseDataFlag.testEx | CourseDataFlag.pcCannotEvaluate | CourseDataFlag.needsEval,
            },
            new AzureData.saveKeyDataObj { 
              key = "ex2", 
              flag = CourseDataFlag.testEx | CourseDataFlag.pcCannotEvaluate | CourseDataFlag.needsEval,
            },
          });
      crs.saveData("p@p.p", "comp1", "/p/p/p1", 2, LineIds.English, new AzureData.saveKeyDataObj[] { 
            new AzureData.saveKeyDataObj { 
              key = "result", 
              flag = CourseDataFlag.testImpl_result | CourseDataFlag.pcCannotEvaluate | CourseDataFlag.needsEval
            },
            new AzureData.saveKeyDataObj { 
              key = "ex1", 
              flag = CourseDataFlag.testEx | CourseDataFlag.pcCannotEvaluate | CourseDataFlag.needsEval,
            },
          });
      eval.setTestsToAssign("comp1", LineIds.English, new evaluator[] { 
        new evaluator{email = "ev@p.p", num = 2}
      });
      evalLine = eval.getTestsToAssign("comp1", LineIds.English);
      var evTests = eval.getEvaluatorTests("comp1", "ev@p.p");
      var urls = eval.getExerciseFromTest("p@p.p", "comp1", LineIds.English, "/p/p/p1", 1);
      sb.AppendLine("***** tests");
      sb.AppendLine("add test and assign: " + JsonConvert.SerializeObject(evalLine));
      sb.AppendLine("evaluator tests: " + JsonConvert.SerializeObject(evTests));
      sb.AppendLine("test exercises: " + JsonConvert.SerializeObject(urls));
      urls = eval.getExerciseFromTest("p@p.p", "comp1", LineIds.English, "/p/p/p1", 2);

      crs.saveData("p@p.p", "comp1", "/p/p/p1", 1, LineIds.English, new AzureData.saveKeyDataObj[] { 
            new AzureData.saveKeyDataObj { 
              key = "ex1", 
              flag = CourseDataFlag.testEx | CourseDataFlag.pcCannotEvaluate
            },
          });
      urls = eval.getExerciseFromTest("p@p.p", "comp1", LineIds.English, "/p/p/p1", 1);

      sb.AppendLine("***** evaluate exercise");
      evalLine = eval.getTestsToAssign("comp1", LineIds.English);
      evTests = eval.getEvaluatorTests("comp1", "ev@p.p");
      urls = eval.getExerciseFromTest("p@p.p", "comp1", LineIds.English, "/p/p/p1", 1);
      sb.AppendLine("add test and assign: " + JsonConvert.SerializeObject(evalLine));
      sb.AppendLine("evaluator tests: " + JsonConvert.SerializeObject(evTests));
      sb.AppendLine("test exercises: " + JsonConvert.SerializeObject(urls));

      crs.saveData("p@p.p", "comp1", "/p/p/p1", 1, LineIds.English, new AzureData.saveKeyDataObj[] { 
            new AzureData.saveKeyDataObj { 
              key = "result", 
              flag = CourseDataFlag.testImpl_result | CourseDataFlag.pcCannotEvaluate
            },
            new AzureData.saveKeyDataObj { 
              key = "ex2", 
              flag = CourseDataFlag.testEx | CourseDataFlag.pcCannotEvaluate
            },
          });
      sb.AppendLine("***** evaluate test");
      evalLine = eval.getTestsToAssign("comp1", LineIds.English);
      evTests = eval.getEvaluatorTests("comp1", "ev@p.p");
      urls = eval.getExerciseFromTest("p@p.p", "comp1", LineIds.English, "/p/p/p1", 1);
      sb.AppendLine("add test and assign: " + JsonConvert.SerializeObject(evalLine));
      sb.AppendLine("evaluator tests: " + JsonConvert.SerializeObject(evTests));
      sb.AppendLine("test exercises: " + JsonConvert.SerializeObject(urls));

      crs.saveData("p@p.p", "comp1", "/p/p/p1", 2, LineIds.English, new AzureData.saveKeyDataObj[] { 
            new AzureData.saveKeyDataObj { 
              key = "result", 
              flag = CourseDataFlag.testImpl_result | CourseDataFlag.pcCannotEvaluate
            },
            new AzureData.saveKeyDataObj { 
              key = "ex1", 
              flag = CourseDataFlag.testEx | CourseDataFlag.pcCannotEvaluate,
            },
          });
      sb.AppendLine("***** evaluate all tests");
      evalLine = eval.getTestsToAssign("comp1", LineIds.English);
      evTests = eval.getEvaluatorTests("comp1", "ev@p.p");
      urls = eval.getExerciseFromTest("p@p.p", "comp1", LineIds.English, "/p/p/p1", 1);
      sb.AppendLine("add test and assign: " + JsonConvert.SerializeObject(evalLine));
      sb.AppendLine("evaluator tests: " + JsonConvert.SerializeObject(evTests));
      sb.AppendLine("test exercises: " + JsonConvert.SerializeObject(urls));
      return;
    }
  }
}
