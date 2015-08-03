using LMComLib;
using LMNetLib;
using Login;
using System.Text;
using Newtonsoft.Json;
using System.Web.Http;
using System;
using System.Linq;
using Microsoft.WindowsAzure.Storage.Table;
using System.IO;
using System.Collections.Generic;
using azure;
using Microsoft.WindowsAzure.Storage;

namespace azure {

  [RoutePrefix("course")]
  public partial class courseController : ApiController {

    //Vymaze short a long data dle zadaneho klice. Byvale Cmd_resetModules. 
    [Route("deleteDataKeys"), HttpPost]
    public void deleteDataKeys(string email, string compId, string productId, int testKeyId, [FromBody]string[] keys) {
      var db = driverLow.create();
      new AzureData.CourseShorts(email, compId, productId, testKeyId).delete(db, keys);
      foreach (var key in keys) db.attach(new AzureData.CourseLong(email, compId, productId, testKeyId, key, null), TableOperationType.Delete);
      db.SaveChanges();
    }

    //vrati short data pro kurz. Byvale Cmd_readCrsResults.
    [Route("getShortProductDatas"), HttpGet]
    public AzureData.dataObj[] getShortProductDatas(string email, string compId, string productId, int testKeyId) {
      var db = driverLow.create();
      var shorts = new AzureData.CourseShorts(email, compId, productId, testKeyId);
      if (db.mode == azureMode.azure) return shorts.getAll(db).ToArray();
      else return shorts.getDbAll(db).ToArray();
    }

    //vrati long data pro klic. Byvale Cmd_readModuleResults
    [Route("getLongData"), HttpGet]
    public string getLongData(string email, string compId, string productId, int testKeyId, string key) {
      var db = driverLow.create();
      var res = db.read<AzureData.CourseLong>(new AzureData.CourseLong(email, compId, productId, testKeyId, key, null));
      return res == null ? null : res.longData;
    }

    //Ulozi shortData, longData a flag. Navic zalozi task pro ohodnoceni. Byvale Cmd_saveUserData.
    [Route("saveData"), HttpPost]
    public void saveData(string email, string compId, string productId, int testKeyId, LineIds line, [FromBody] AzureData.saveKeyDataObj[] datas) {
      var db = driverLow.create();
      //long data
      foreach (var data in datas) {
        var longData = new AzureData.CourseLong(email, compId, productId, testKeyId, data.key, data.longData);
        if (db.mode == azureMode.db) {
          longData.shortData = data.shortData;
          longData.flag = (int) data.flag;
        }
        db.attach(longData, TableOperationType.InsertOrReplace);
      }
      //short data
      new AzureData.CourseShorts(email, compId, productId, testKeyId).save(db, datas);
      //toEval data
      var flag = CourseModel.CourseDataFlag.pcCannotEvaluate; var flag2 = CourseModel.CourseDataFlag.testEx | CourseModel.CourseDataFlag.testImpl_result;
      var pcEvals = datas.Where(d => (d.flag & flag) == flag && (d.flag & flag2) != 0).ToArray(); //pcCannotEvaluate + testEx nebo testImpl_result
      if (pcEvals.Length > 0) AzureData.HumanEval.refreshEvals(db, compId, line, email, productId, testKeyId, pcEvals);
      db.SaveChanges();
    }

  }
}

namespace AzureData {

  public interface IMultiDataObj {
    string key { get; set; }
    object data { get; set; }
  }
  public class dataObj : IMultiDataObj {
    public dataObj() { }
    public string key { get; set; }
    [JsonIgnore]
    public object data {
      get { using (MemoryStream ms = new MemoryStream()) using (BinaryWriter wr = new BinaryWriter(ms)) { wr.Write((int)flag); wr.WriteStringEx(shortData); return ms.ToArray(); } }
      set { using (MemoryStream ms = new MemoryStream((byte[])value)) using (BinaryReader rdr = new BinaryReader(ms)) { flag = (CourseModel.CourseDataFlag)rdr.ReadInt32(); shortData = rdr.ReadStringEx(); } }
      //get { return shortData; }
      //set { shortData = (string)value; }
    }
    public string shortData;
    public CourseModel.CourseDataFlag flag;
  }
  public class saveKeyDataObj : AzureData.dataObj {
    public string longData;
  }

  public class CourseLong : azure.azureEntity {
    public CourseLong() : base() { }
    public CourseLong(string email, string compId, string productId, int testKeyId, string key, string data)
      : this() {
      this.email = email; this.compId = compId; this.productId = productId; this.testKeyId = testKeyId; this.key = key; this.longData = data;
    }
    public IEnumerable<object> keys() { yield return new azure.keyLib.constString(GetType().Name.ToLower()); yield return compId; yield return productId; yield return testKeyId.ToString(); yield return key; }
    public override string PartitionKey { get { return azure.keyLib.makeConst(azure.keyLib.encode(email), true); } set { } }
    public override string RowKey {
      get { return keyLib.createKeyLow(keys()); }
      set {
        var parts = azure.keyLib.parseKeyLow(value);
        compId = azure.keyLib.decode(parts[1]); productId = azure.keyLib.decode(parts[2]); testKeyId = int.Parse(parts[3]); key = azure.keyLib.decode(parts[4]);
      }
    }

    public string email;
    public string compId;
    public string productId;
    public int testKeyId;
    public string key;
    public string longData { get; set; }
    [IgnoreProperty]
    public string shortData { get; set; }
    [IgnoreProperty]
    public int flag { get; set; }

    protected override void afterRead(string key, EntityProperty prop) {
      switch (key) {
        case "longData": longData = prop.StringValue; break;
        default: base.afterRead(key, prop); break;
      }
    }
    protected override void beforeWrite(Action<string, EntityProperty> writeProp) {
      base.beforeWrite(writeProp);
      writeProp("longData", new EntityProperty(longData));
    }
  }

  public abstract class multi : azure.azureEntity {
    public multi() : base() { }
    public multi(string partitionKey, string rowKey) : base() { PartitionKey = partitionKey; RowKey = rowKey; }
    public override string PartitionKey { get; set; }
    public override string RowKey { get; set; }
    public int idx() { return int.Parse(RowKey.Split(keyLib.charMin).Last()); }
    public IDictionary<string, EntityProperty> properties { get { return _properties ?? (_properties = new Dictionary<string, EntityProperty>()); } } IDictionary<string, EntityProperty> _properties;
    public override void ReadEntity(IDictionary<string, EntityProperty> properties, OperationContext operationContext) { _properties = properties; }
    public override IDictionary<string, EntityProperty> WriteEntity(OperationContext operationContext) { return properties; }
  }

  public abstract class multiWrapper<TRes, TDataObj>
    where TRes : multi, new()
    where TDataObj : IMultiDataObj, new() {
    protected abstract IEnumerable<object> keys();
    protected abstract string PartitionKey();
    string RowKeyBase(StringBuilder sb) { return keyLib.createKeyLow(keys(), sb); }
    string RowKey(int idx, StringBuilder sb) { return RowKeyBase(sb) + keyLib.charMin + idx.ToString(); }

    public void delete(driverLow db, string[] keys) {
      if (db.mode != azureMode.azure) return;
      StringBuilder sb = new StringBuilder();
      var multies = db.executeQuery(db.keyRangeQuery<TRes>(PartitionKey(), RowKeyBase(sb))).ToDictionary(m => m.idx(), m => m);
      HashSet<int> modified = new HashSet<int>();
      foreach (var key in keys) {
        int idx = keyLib.keyToEntityIdx(key);
        TRes multi;
        if (!multies.TryGetValue(idx, out multi)) continue;
        multi.properties.Remove(keyLib.idEncode(key));
        modified.Add(idx);
      }
      foreach (var idx in modified) {
        var multi = multies[idx];
        db.attach(multi, multi.properties.Count == 0 ? TableOperationType.Delete : TableOperationType.Replace);
      }
    }
    public IEnumerable<TDataObj> getAll(driverLow db) {
      StringBuilder sb = new StringBuilder();
      var multies = db.executeQuery(db.keyRangeQuery<TRes>(PartitionKey(), RowKeyBase(sb))).ToArray();
      return multies.SelectMany(m => m.properties).Select(prop => new TDataObj { key = keyLib.idDecode(prop.Key), data = prop.Value.PropertyAsObject });
    }
    public void save(driverLow db, IEnumerable<TDataObj> keyValues) {
      if (db.mode != azureMode.azure) return;
      var subEntities = new Dictionary<int, TRes>(); StringBuilder sb = new StringBuilder();
      foreach (var kv in keyValues) {
        int idx = keyLib.keyToEntityIdx(kv.key);
        TRes act;
        if (!subEntities.TryGetValue(idx, out act)) subEntities.Add(idx, act = new TRes { PartitionKey = PartitionKey(), RowKey = RowKey(idx, sb) });
        var data = kv.data;
        if (data is string)
          act.properties[keyLib.idEncode(kv.key, sb)] = new EntityProperty((string)data);
        else if (data is byte[])
          act.properties[keyLib.idEncode(kv.key, sb)] = new EntityProperty((byte[])data);
        else
          throw new NotImplementedException();
      }
      foreach (var multi in subEntities.Values) db.attach(multi, TableOperationType.InsertOrMerge);
    }
  }

  public class CourseShort : multi {
    public CourseShort() : base() { }
    public CourseShort(string partitionKey, string rowKey) : base(partitionKey, rowKey) { }
  }

  public class CourseShorts : multiWrapper<CourseShort, dataObj> {
    public CourseShorts() { }
    public CourseShorts(string email, string compId, string productId, int testKeyId) : this() { this.email = email; this.compId = compId; this.productId = productId; this.testKeyId = testKeyId; }
    protected override IEnumerable<object> keys() { yield return new azure.keyLib.constString(typeof(CourseShort).Name.ToLower()); yield return compId; yield return productId; yield return testKeyId.ToString(); }
    protected override string PartitionKey() { return azure.keyLib.makeConst(azure.keyLib.encode(email), true); }

    public string email;
    public string compId;
    public string productId;
    public int testKeyId;

    public IEnumerable<dataObj> getDbAll(driverLow db) {
      CourseLong crs = new CourseLong(email, compId, productId, testKeyId, null, null);
      var q1 = db.executeQuery(db.keyRangeQuery<CourseLong>(crs.PartitionKey, keyLib.createKeyLow(crs.keys().Take(4))));
      var q2 = q1.Select(cl => new { cl.RowKey, cl.shortData, cl.flag });
      var q3 = q2.ToArray().Select(cl => new CourseLong { RowKey = cl.RowKey, shortData = cl.shortData, flag = cl.flag });
      return q3.Select(cl => new dataObj { key = cl.key, shortData = cl.shortData, flag = (CourseModel.CourseDataFlag)cl.flag });
    }
  }

}

namespace azure {

  public partial class courseController : ApiController {
    public static void test(StringBuilder sb) {
      var db = driverLow.create(); //if (db.mode != azureMode.azure) return;
      sb.AppendLine();
      sb.AppendLine("*************************************************************");
      db.testDeleteAll();

      sb.AppendLine("***** save x delete data");
      var crs = new courseController();
      azure.keyLib.maxMultiIndex = 100;
      var keys = Enumerable.Range(0, 200).Select(i => string.Format("čkey_{0}þ", i)).ToArray();
      crs.saveData("p@p.p", "comp1", "/p/p/p2", 2, LineIds.German,
        keys.Take(2).Select(key => new AzureData.saveKeyDataObj { key = key, flag = CourseModel.CourseDataFlag.ex, shortData = "short" + key, longData = "long" + key }).ToArray()
      );
      var res = crs.getShortProductDatas("p@p.p", "comp1", "/p/p/p2", 2);
      sb.AppendLine(JsonConvert.SerializeObject(res));
      crs.saveData("p@p.p", "comp1", "/p/p/p1", 1, LineIds.German,
        keys.Select(key => new AzureData.saveKeyDataObj { key = key, flag = CourseModel.CourseDataFlag.ex, shortData = "short" + key, longData = "long" + key }).ToArray()
      );
      crs.saveData("p@p.p", "comp1", "/p/p/p1", 1, LineIds.German,
        keys.Select(key => new AzureData.saveKeyDataObj { key = key, flag = CourseModel.CourseDataFlag.ex, shortData = "short" + key + "_" + key, longData = "long" + key + "_" + key }).ToArray()
      );
      crs.deleteDataKeys("p@p.p", "comp1", "/p/p/p1", 1, keys.Skip(20).ToArray());
      crs.deleteDataKeys("p@p.p", "comp1", "/p/p/p1", 1, keys.Skip(10).Take(10).ToArray());
      crs.saveData("p@p.p", "comp1", "/p/p/p1", 1, LineIds.German,
        keys.Take(10).Select(key => new AzureData.saveKeyDataObj { key = key, flag = CourseModel.CourseDataFlag.ex, shortData = "short" + key, longData = "long" + key }).ToArray()
      );
      res = crs.getShortProductDatas("p@p.p", "comp1", "/p/p/p1", 1);
      sb.AppendLine(JsonConvert.SerializeObject(res));
    }
  }
}
