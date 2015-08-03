using LMComLib;
using LMNetLib;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Configuration;
using System.Data.Entity;
using System.Data.Entity.Infrastructure.Annotations;
using System.Data.Entity.ModelConfiguration;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Web.Http;

namespace azure {

  [RoutePrefix("test")]
  public class testController : ApiController {
    [Route("testDeleteAll"), HttpGet]
    public void testDeleteAll() {
      driverLow.create().testDeleteAll();
    }
    //policies
  }
  //podrobny a novy clanek
  //http://azure.microsoft.com/en-us/documentation/articles/storage-table-design-guide/
  //http://blogs.msdn.com/b/windowsazurestorage/archive/2011/02/03/overview-of-retry-policies-in-the-windows-azure-storage-client-library.aspx
  //error codes
  //TableErrorCodeStrings, https://msdn.microsoft.com/en-us/library/azure/dd179438.aspx
  //operations, batch (4MB & 100 limit)
  //http://blogs.msdn.com/b/windowsazurestorage/archive/2012/11/06/windows-azure-storage-client-library-2-0-getTable-deep-dive.aspx
  //generic entity
  //https://github.com/sandrinodimattia/WindowsAzure-DictionaryTableEntity/blob/master/Demo/Program.cs
  //Retry Policies, efektivita dotazu
  //http://java.dzone.com/articles/be-sure-azure-net-azure-table-0
  //dynamic queries
  //http://stackoverflow.com/questions/11884775/dynamic-query-to-azure-getTable
  //prehled vsech operaci
  //http://azure.microsoft.com/cs-cz/documentation/articles/storage-dotnet-how-to-use-getTable/
  //reference
  //https://msdn.microsoft.com/library/azure/dn261237.aspx
  //storage
  //https://msdn.microsoft.com/en-us/library/azure/gg433040.aspx
  //azcopy
  //http://azure.microsoft.com/en-us/documentation/articles/storage-use-azcopy/
  //limitation and other infos
  //https://msdn.microsoft.com/en-us/library/dd179338.aspx
  //hardware limits
  //https://msdn.microsoft.com/library/azure/dn249410.aspx
  //http://azure.microsoft.com/cs-cz/documentation/articles/azure-subscription-service-limits/
  //maximum constrains per query: 14 
  //http://stackoverflow.com/questions/11884775/dynamic-query-to-azure-getTable
  //prevod z desitkove do jine soustavy
  //http://www.pvladov.com/2012/05/decimal-to-arbitrary-numeral-system.html
  //LINQ
  //https://msdn.microsoft.com/en-us/library/azure/dd894039.aspx

  public abstract class azureEntity : ITableEntity {
    public virtual string PartitionKey { get; set; }
    public virtual string RowKey { get { return azure.keyLib.makeConst(GetType().Name.ToLower()); } set { } } //rowKey je difotne jmeno typu
    public DateTimeOffset Timestamp { get; set; }
    public string ETag { get; set; }
    public virtual void ReadEntity(IDictionary<string, EntityProperty> properties, OperationContext operationContext) {
      foreach (var kv in properties) afterRead(kv.Key, kv.Value);
    }
    public virtual IDictionary<string, EntityProperty> WriteEntity(OperationContext operationContext) {
      Dictionary<string, EntityProperty> res = new Dictionary<string, EntityProperty>();
      beforeWrite((name, value) => res[name] = value);
      return res;
    }
    protected virtual void afterRead(string key, EntityProperty prop) { throw new NotImplementedException(key); }
    protected virtual void beforeWrite(Action<string, EntityProperty> writeProp) { }
    [Timestamp, IgnoreProperty]
    public Byte[] DbTimestamp { get; set; } //timestamp pro DB drive
    [IgnoreProperty]
    public int Id { get; set; } //primary key for DB drive
    public static string toJson(object obj) { return obj == null ? null : JsonConvert.SerializeObject(obj, new JsonSerializerSettings { DefaultValueHandling = DefaultValueHandling.Ignore, NullValueHandling = NullValueHandling.Ignore }); }
    public static T fromJson<T>(string str) where T : class { return string.IsNullOrEmpty(str) ? (T)null : JsonConvert.DeserializeObject<T>(str); }
    public bool isNew() { return DbTimestamp == null && ETag == null; }
    public static void defineMap<TRes>(EntityTypeConfiguration<TRes> map, string tabName) where TRes : azureEntity {
      map.ToTable(tabName);
      map.Ignore(t => t.Timestamp); map.Ignore(t => t.ETag);
      map.Property(t => t.DbTimestamp).IsConcurrencyToken();
      //indexes
      map.HasKey(t => t.Id);
      map.Property(e => e.PartitionKey).HasMaxLength(128).HasColumnAnnotation("Index", new IndexAnnotation(new IndexAttribute()));
      map.Property(e => e.RowKey).HasMaxLength(128).HasColumnAnnotation("Index", new IndexAnnotation(new IndexAttribute()));
    }
  }

  public enum azureMode { no, db, azure }

  public static class lib {

    public static void testAll() {
      var db = driverLow.create();
      File.WriteAllText(string.Format(@"d:\temp\{0}.log", db.mode), _testAll());
    }
    static string _testAll() {
      StringBuilder sb = new StringBuilder();
      //return sb.ToString();
      AzureData.User_Low.test(sb);
      AzureData.Company_Low.test(sb);
      azure.LoginController.test(sb);
      azure.adminGlobalController.test(sb);
      azure.adminCompanyController.test(sb);
      azure.adminLicenceController.test(sb);
      azure.courseController.test(sb);
      azure.hmanEvalController.test(sb);
      return sb.ToString();
    }

  }

  public abstract class driverLow {
    public driverLow(azureMode mode) { this.mode = mode; }
    public azureMode mode;

    public TRes compReadForEdit<TRes>(string compId) where TRes : AzureData.Company_Low, new() { var res = AzureData.Company_Low.doRead<TRes>(this, compId); if (res != null) attach(res, TableOperationType.Replace); else attach(res = AzureData.Company_Low.doCreate<TRes>(compId), TableOperationType.Insert); return res; }
    public TRes compRead<TRes>(string compId) where TRes : AzureData.Company_Low, new() { return AzureData.Company_Low.doRead<TRes>(this, compId); }

    public TRes userReadForEdit<TRes>(string email) where TRes : AzureData.User_Low, new() { var res = AzureData.User_Low.doRead<TRes>(this, email); if (res != null) attach(res, TableOperationType.Replace); else attach(res = AzureData.User_Low.doCreate<TRes>(email), TableOperationType.Insert); return res; }
    public TRes userRead<TRes>(string email) where TRes : AzureData.User_Low, new() { return AzureData.User_Low.doRead<TRes>(this, email); }

    public TRes sysReadForEdit<TRes>() where TRes : AzureData.Sys_Low, new() { var res = AzureData.Sys_Low.doRead<TRes>(this); if (res != null) attach(res, TableOperationType.Replace); else attach(res = AzureData.Sys_Low.doCreate<TRes>(), TableOperationType.Insert); return res; }
    public TRes sysRead<TRes>() where TRes : AzureData.Sys_Low, new() { return AzureData.Sys_Low.doRead<TRes>(this); }

    public abstract IQueryable<TRes> createQuery<TRes>() where TRes : class, ITableEntity, new();
    public abstract TRes read<TRes>(TRes example) where TRes : class, ITableEntity, new();
    public abstract TRes read<TRes>(string partitionKey, string rowKey) where TRes : class, ITableEntity, new();
    public abstract IEnumerable<TRes> executeQuery<TRes>(IQueryable<TRes> q) where TRes : class, ITableEntity, new();
    public abstract void attach<TRes>(TRes entity, TableOperationType oper) where TRes : azureEntity, new();
    public abstract void SaveChanges();
    public abstract void testDeleteAll();

    //public IQueryable<TRes> keyEqual<TRes>(TRes example) where TRes : azureEntity, new() { return createQuery<TRes>(example).Where(f => f.PartitionKey == example.PartitionKey && f.RowKey == example.RowKey); }
    public IQueryable<TRes> keyRangeQuery<TRes>(TRes example) where TRes : class, ITableEntity, new() {
      return keyRangeQuery<TRes>(example.PartitionKey, example.RowKey);
    }
    public IQueryable<TRes> keyRangeQuery<TRes>(string partitionKey, string rowKey) where TRes : class, ITableEntity, new() {
      IQueryable<TRes> qres = createQuery<TRes>();
      if (partitionKey != null) qres = qres.Where(f => f.PartitionKey == partitionKey);
      var low = rowKey;
      if (!string.IsNullOrEmpty(low)) {
        var high = low.Substring(0, low.Length - 1) + keyLib.charMax;
        qres = qres.Where(f => f.RowKey.CompareTo(low) >= 0 && f.RowKey.CompareTo(high) <= 0);
      }
      return qres;
    }
    public IQueryable<TRes> keyQuery<TRes>(TRes example) where TRes : class, ITableEntity, new() {
      IQueryable<TRes> qres = createQuery<TRes>(); var partition = example.PartitionKey;
      if (partition != null) qres = qres.Where(f => f.PartitionKey == partition);
      if (!string.IsNullOrEmpty(example.RowKey)) qres = qres.Where(f => f.RowKey == example.RowKey);
      return qres;
    }

    public static Func<driverLow> create;

    static driverLow() {
      var activeMode = LowUtils.EnumParse<azureMode>(ConfigurationManager.AppSettings["azureMode"] ?? "no");
      switch (activeMode) {
        case azureMode.azure: create = () => new driverAzure(activeMode); break;
        case azureMode.db: create = () => new driverDb(activeMode); break;
      }
    }

  }

  //https://msdn.microsoft.com/en-us/data/jj592676.aspx
  //http://www.roelvanlisdonk.nl/?p=2461
  public class driverDb : driverLow {
    public driverDb(azureMode mode) : base(mode) { }
    public AzureData.Container readDb() {
      var res = new AzureData.Container(false);
      log = new StringBuilder(); res.Database.Log = s => log.Append(s);
      return res;
    }
    StringBuilder log;
    AzureData.Container writeDb() { return _writeDb ?? (_writeDb = new AzureData.Container()); } AzureData.Container _writeDb;
    public override IQueryable<TRes> createQuery<TRes>() {
      return (IQueryable<TRes>)AzureData.Container.tables[typeof(TRes)](readDb());
    }
    public override TRes read<TRes>(TRes example) {
      return read<TRes>(example.PartitionKey, example.RowKey);
    }
    public override TRes read<TRes>(string partitionKey, string rowKey) {
      var db = readDb();
      IQueryable<TRes> q = (IQueryable<TRes>)AzureData.Container.tables[typeof(TRes)](db);
      return q.FirstOrDefault(c => c.PartitionKey == partitionKey && c.RowKey == rowKey) as TRes;
    }
    public override void attach<TRes>(TRes entity, TableOperationType oper) {
      var db = writeDb();
      IDbSet<TRes> q = (IDbSet<TRes>)AzureData.Container.tables[entity.GetType()](db);
      switch (oper) {
        case TableOperationType.Insert:
          q.Attach(entity);
          db.Entry(entity).State = System.Data.Entity.EntityState.Added; break;
        case TableOperationType.Delete:
          IQueryable<TRes> qr2 = (IQueryable<TRes>)q;
          var ent2 = qr2.Where(c => c.PartitionKey == entity.PartitionKey && c.RowKey == entity.RowKey).Select(c => new { c.Id, c.DbTimestamp }).FirstOrDefault();
          if (ent2 == null) return;
          entity.Id = ent2.Id; entity.DbTimestamp = ent2.DbTimestamp;
          q.Attach(entity);
          db.Entry(entity).State = System.Data.Entity.EntityState.Deleted;
          break;
        case TableOperationType.Replace:
          q.Attach(entity);
          db.Entry(entity).State = System.Data.Entity.EntityState.Modified;
          break;
        case TableOperationType.InsertOrReplace:
          IQueryable<TRes> qr = (IQueryable<TRes>)q;
          var ent = qr.Where(c => c.PartitionKey == entity.PartitionKey && c.RowKey == entity.RowKey).Select(c => new { c.Id, c.DbTimestamp }).FirstOrDefault();
          if (ent != null) { entity.Id = ent.Id; entity.DbTimestamp = ent.DbTimestamp; }
          q.Attach(entity);
          db.Entry(entity).State = ent != null ? System.Data.Entity.EntityState.Modified : System.Data.Entity.EntityState.Added;
          break;
        default:
          throw new NotImplementedException();
      }
    }
    public override void SaveChanges() {
      writeDb().SaveChanges(); _writeDb = null;
    }
    public override IEnumerable<TRes> executeQuery<TRes>(IQueryable<TRes> q) { return q; }
    public override void testDeleteAll() { writeDb().testDelAll(); }
  }

  //http://java.dzone.com/articles/be-sure-azure-net-azure-table-0
  //http://azure.microsoft.com/cs-cz/documentation/articles/storage-dotnet-how-to-use-getTable/
  public class driverAzure : driverLow {

    static driverAzure() {
      tryAction(() => {
        var storageAccount = CloudStorageAccount.DevelopmentStorageAccount;
        var tableClient = storageAccount.CreateCloudTableClient();
        foreach (var tb in LowUtils.EnumGetValues<tableNames>()) {
          CloudTable table = tableClient.GetTableReference(tb.ToString());
          if (table.Exists()) continue;
          table.Create();
        }
      });
    }

    public enum tableNames { user, company, systemAdmin }

    CloudTableClient tableClient;
    Dictionary<tableNames, Dictionary<string, List<TableOperation>>> batchs = new Dictionary<tableNames, Dictionary<string, List<TableOperation>>>();
    //List<azureEntity> items = new List<azureEntity>();

    public static Dictionary<Type, tableNames> tables = new Dictionary<Type, tableNames>() {
      {typeof(AzureData.Sys_Admin), tableNames.systemAdmin},
      {typeof(AzureData.Sys_CompShortId), tableNames.systemAdmin},
      {typeof(AzureData.User_Data), tableNames.user},
      {typeof(AzureData.User_Company), tableNames.user},
      {typeof(AzureData.CourseLong), tableNames.user},
      {typeof(AzureData.CourseShort), tableNames.user},
      {typeof(AzureData.Company_User), tableNames.company},
      {typeof(AzureData.Company_Meta), tableNames.company},
      {typeof(AzureData.Company_Licence), tableNames.company},
      {typeof(AzureData.Company_Department), tableNames.company},
      {typeof(AzureData.Company_DepartmentUsage), tableNames.company},
      {typeof(AzureData.HumanEval), tableNames.company},
    };

    public driverAzure(azureMode mode)
      : base(mode) {
      var storageAccount = CloudStorageAccount.DevelopmentStorageAccount;
      tableClient = storageAccount.CreateCloudTableClient();
    }

    public override void attach<TRes>(TRes ent, TableOperationType oper) {
      if (ent == null) return;
      ITableEntity entity = (ITableEntity)ent;
      var table = tables[entity.GetType()];
      Dictionary<string, List<TableOperation>> ops;
      if (!batchs.TryGetValue(table, out ops)) batchs.Add(table, ops = new Dictionary<string, List<TableOperation>>());
      List<TableOperation> prims; string prim = entity.PartitionKey;
      if (!ops.TryGetValue(prim, out prims)) ops.Add(prim, prims = new List<TableOperation>());
      switch (oper) {
        case TableOperationType.Insert: prims.Add(TableOperation.Insert(entity)); break;
        case TableOperationType.Replace: prims.Add(TableOperation.Replace(entity)); break;
        case TableOperationType.Delete: entity.ETag = "*"; prims.Add(TableOperation.Delete(entity)); break;
        case TableOperationType.InsertOrReplace: prims.Add(TableOperation.InsertOrReplace(entity)); break;
        case TableOperationType.InsertOrMerge: prims.Add(TableOperation.InsertOrMerge(entity)); break;
        default: throw new NotImplementedException();
      }
    }

    public override IQueryable<TRes> createQuery<TRes>() {
      return getTable(typeof(TRes)).CreateQuery<TRes>();
    }

    public override void testDeleteAll() {
      foreach (var tb in LowUtils.EnumGetValues<tableNames>()) {
        CloudTable table = tableClient.GetTableReference(tb.ToString());
        if (!table.Exists()) continue;
        table.Delete();
        table.Create();
      }
    }

    public override TRes read<TRes>(TRes example) {
      return read<TRes>(example.PartitionKey, example.RowKey);
    }

    public override TRes read<TRes>(string partitionKey, string rowKey) {
      return getTable(typeof(TRes)).Execute(TableOperation.Retrieve<TRes>(partitionKey, rowKey)).Result as TRes;
    }
    public override void SaveChanges() {
      foreach (var oTable in batchs) {
        var table = tableClient.GetTableReference(oTable.Key.ToString());
        foreach (var oPrim in oTable.Value) {
          var batch = new TableBatchOperation();
          foreach (var oper in oPrim.Value) {
            batch.Add(oper);
            if (batch.Count >= 100) { table.ExecuteBatch(batch); batch = new TableBatchOperation(); }
          }
          if (batch.Count > 0) table.ExecuteBatch(batch);
        }
      }
      batchs.Clear();
    }

    public override IEnumerable<TRes> executeQuery<TRes>(IQueryable<TRes> q) {
      var tq = q as TableQuery<TRes>;
      TableContinuationToken token = null;
      do {
        TableQuerySegment<TRes> queryResult = tq.ExecuteSegmented(token);
        token = queryResult.ContinuationToken;
        foreach (var r in queryResult.Results) yield return r;
      } while (token != null);
    }

    //string tryExecute(tableNames table, TableOperation oper, params string[] alowedErrors) { return tryAction(() => getTable(table).Execute(oper), alowedErrors); }

    CloudTable getTable(Type type) {
      return tableClient.GetTableReference(tables[type].ToString());
    }

    static string tryAction(Action act) { //, params string[] alowedErrors) {
      try {
        act();
        return null;
      } catch (StorageException ex) {
        if (ex.RequestInformation == null || ex.RequestInformation.ExtendedErrorInformation == null) throw;
        var extend = ex.RequestInformation.ExtendedErrorInformation;
        var code = extend.ErrorCode;
        //if (alowedErrors != null && alowedErrors.Contains(code)) return code;
        throw new Exception(code + ": " + extend.ErrorMessage);
      } catch (Exception ex) {
        throw ex;
      }
    }
  }

  //public abstract class batch {
  //}

  public static class keyLib {

    public struct constString { public constString(string value) { this.value = value; } public string value; }

    public const char charMin = ' ';
    public const char charMax = '~'; //0x7e
    public const char constChar = '`';
    static HashSet<char> wrongs = new HashSet<char>(XExtension.Create(charMin, charMax, constChar).Concat("/\\#?"));

    public static string makeConst(string key, bool isValue = false) { return key == null ? null : (isValue ? null : constChar.ToString()) + key + charMin; }

    //http://stackoverflow.com/questions/575440/url-encoding-using-c-sharp/21771206#21771206
    //http://unicode-table.com/en/blocks/basic-latin/
    //https://msdn.microsoft.com/en-us/library/aa664670(VS.71).aspx, http://www.fileformat.info/info/unicode/category/Ll/list.htm
    public static string encode(string key) { var sb = new StringBuilder(); encode(key, sb); return sb.ToString(); }
    public static void encode(string key, StringBuilder sb) { encode(key, sb, '%', ch => ch < charMin || ch >= charMax || wrongs.Contains(ch)); }
    public static string decode(string key) { return decode(key, '%'); }
    public static string encode(int? i) { return i == null ? null : ((int)i).ToString("D10"); }
    public static string encode(constString cnst, StringBuilder sb = null) {
      if (cnst.value == null) return constChar.ToString();
      if (sb == null) sb = new StringBuilder();
      sb.Append(constChar); encode(cnst.value, sb);
      return sb.ToString();
    }

    //oddelovac mezi key parts je mezera, ma nejmensi order
    public static string createKeyLow(IEnumerable<object> parts, StringBuilder sb = null) {
      if (sb == null) sb = new StringBuilder(); else sb.Clear();
      foreach (var obj in parts) {
        if (obj is int) sb.Append(((int)obj).ToString("D10"));
        else if (obj is string) encode((string)obj, sb);
        else if (obj is constString) encode((constString)obj, sb);
        else throw new NotImplementedException();
        sb.Append(charMin);
      }
      return sb.ToString();
    }
    public static string[] parseKeyLow(string key) {
      return key.Split(charMin);
    }
    public static string createKey(params object[] parts) { return createKeyLow(parts); }

    //**** property name
    const char idEscapeChar = 'ø';
    static HashSet<char> idValidChars = new HashSet<char>("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_");
    public static string idEncode(string value, StringBuilder sb = null) {
      if (sb == null) sb = new StringBuilder(); else sb.Clear();
      encode(value, sb, idEscapeChar, ch => !idValidChars.Contains(ch));
      return sb.ToString();
    }
    public static string idDecode(string value) { return decode(value, idEscapeChar); }

    //***** key to rowIdx: nahodne rozdeleni klicu do mnoziny 0..99
    public static int maxMultiIndex = 1000;
    //const int maxMultiIndex = 100;
    public static int keyToEntityIdx(string key) {
      return LowUtils.pearsonHash16(key) % maxMultiIndex;
    }

    //public static byte[] GetByteArrayFromIntArray(int[] intArray) {
    //  if (intArray == null || intArray.Length == 0) return null;
    //  byte[] data = new byte[intArray.Length * 4];
    //  for (int i = 0; i < intArray.Length; i++) Array.Copy(BitConverter.GetBytes(intArray[i]), 0, data, i * 4, 4);
    //  return data;
    //}

    //public static int[] GetIntArrayFromByteArray(byte[] byteArray) {
    //  if (byteArray == null || byteArray.Length == 0) return null;
    //  int[] intArray = new int[byteArray.Length / 4];
    //  for (int i = 0; i < byteArray.Length; i += 4) intArray[i / 4] = BitConverter.ToInt32(byteArray, i);
    //  return intArray;
    //}
    static void encode(string key, StringBuilder sb, char escape, Func<char, bool> wrongs) {
      if (string.IsNullOrEmpty(key)) return;
      var bytes = Encoding.UTF8.GetBytes(key);
      foreach (var b in bytes) {
        var ch = Convert.ToChar(b);
        if (ch == escape || wrongs(ch)) {
          sb.Append(escape); sb.Append(b.ToString("x2"));
        } else sb.Append(ch);
      }
    }
    static string decode(string key, char escape) {
      if (string.IsNullOrEmpty(key)) return key;
      List<byte> bytes = new List<byte>();
      int idx = 0;
      while (idx < key.Length) {
        char ch = key[idx++];
        if (ch != escape) bytes.Add(Convert.ToByte(ch));
        else {
          var code = new string(new char[] { key[idx++], key[idx++] });
          bytes.Add(byte.Parse(code, System.Globalization.NumberStyles.HexNumber));
        }
      }
      return Encoding.UTF8.GetString(bytes.ToArray());
    }

  }

  public class LinqBuilder {

    //http://stackoverflow.com/questions/11884775/dynamic-query-to-azure-getTable
    public static Expression<Func<RowType, bool>> inFilter<RowType, ColumnType>(string filterColumnName, IEnumerable<ColumnType> columnValues) {
      ParameterExpression rowParam = Expression.Parameter(typeof(RowType), "r");
      MemberExpression column = Expression.Property(rowParam, filterColumnName);
      BinaryExpression filter = null;
      foreach (ColumnType columnValue in columnValues) {
        BinaryExpression newFilterClause = Expression.Equal(column, Expression.Constant(columnValue));
        filter = filter == null ? newFilterClause : Expression.Or(filter, newFilterClause);
      }
      return Expression.Lambda<Func<RowType, bool>>(filter, rowParam);
    }

    //http://stackoverflow.com/questions/16516971/linq-dynamic-select
    public static Expression<Func<RowType, ResType>> selectStatementProperty<RowType, ResType>(IEnumerable<string> propNames) {
      // input parameter "o"
      var rowParam = Expression.Parameter(typeof(RowType), "o");
      // new statement "new RowType()"
      var res = Expression.New(typeof(ResType));
      // create initializers
      var bindings = propNames.Select(propName => {
        // property "Field1"
        var miOrig = typeof(RowType).GetProperty(propName);
        // original value "o.Field1"
        var original = Expression.Property(rowParam, miOrig);
        // set value "Field1 = o.Field1"
        var miDest = typeof(ResType).GetProperty(propName);
        return Expression.Bind(miDest, original);
      }).ToArray();
      // initialization "new ResType { Field1 = o.Field1, Field2 = o.Field2 }"
      var newExpr = Expression.MemberInit(res, bindings);
      // expression "o => new ResType { Field1 = o.Field1, Field2 = o.Field2 }"
      return Expression.Lambda<Func<RowType, ResType>>(newExpr, rowParam);
    }

    public static Expression<Func<RowType, ResType>> selectStatementField<RowType, ResType>(IEnumerable<string> propNames) {
      // input parameter "o"
      var rowParam = Expression.Parameter(typeof(RowType), "o");
      // new statement "new RowType()"
      var res = Expression.New(typeof(ResType));
      // create initializers
      var bindings = propNames.Select(propName => {
        // property "Field1"
        var miOrig = typeof(RowType).GetField(propName);
        // original value "o.Field1"
        var original = Expression.Field(rowParam, miOrig);
        // set value "Field1 = o.Field1"
        var miDest = typeof(ResType).GetField(propName);
        return Expression.Bind(miDest, original);
      }).ToArray();
      // initialization "new ResType { Field1 = o.Field1, Field2 = o.Field2 }"
      var newExpr = Expression.MemberInit(res, bindings);
      // expression "o => new ResType { Field1 = o.Field1, Field2 = o.Field2 }"
      return Expression.Lambda<Func<RowType, ResType>>(newExpr, rowParam);
    }

  }


}
