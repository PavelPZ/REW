//valid chars etc: https://msdn.microsoft.com/library/azure/dd179338.aspx
//quering table: https://convective.wordpress.com/2013/11/03/queries-in-the-windows-azure-storage-client-library-v2-1/
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Table;
using Microsoft.WindowsAzure.Storage.Table.Queryable;
using System.Linq;
using System.Collections.Generic;


namespace AzureLib {
  public static class Lib {
    public static void init() {
      CloudStorageAccount storageAccount = CloudStorageAccount.Parse(Cfg.cfg.azure.connectionString);
      tableClient = storageAccount.CreateCloudTableClient();
      blobClient = storageAccount.CreateCloudBlobClient();
    }
    public static CloudTable createTable(string containerName) {
      var res = tableClient.GetTableReference(containerName);
      res.CreateIfNotExists();
      return res;
    }
    public static CloudBlobContainer createBlob(string containerName) {
      return blobClient.GetContainerReference(containerName);
    }
    public static CloudTableClient tableClient;
    public static CloudBlobClient blobClient;

    //***** Extensions
    public static TableQuery<T> rowKeyRange<T>(CloudTable table, string partitionKey, string rowKeyPrefix) where T : ITableEntity, new() {
      var q = table.CreateQuery<T>();
      return (TableQuery<T>)q.Where(en => en.PartitionKey == partitionKey && en.RowKey.CompareTo(rowKeyPrefix) >= 0 && en.RowKey.CompareTo(rowKeyPrefix + char.MaxValue) <= 0);
    }
  }

  public class TableBatch {
    public TableBatch(CloudTable table) { this.table = table; }
    public void Execute() { foreach (var b in batches.Values.Where(b => b.Count > 0)) table.ExecuteBatch(b); }
    public void Delete(ITableEntity entity) { add(entity.PartitionKey, TableOperation.Delete(entity)); }
    public void Insert(ITableEntity entity) { add(entity.PartitionKey, TableOperation.Insert(entity)); }
    public void InsertOrMerge(ITableEntity entity) { add(entity.PartitionKey, TableOperation.InsertOrMerge(entity)); }
    public void InsertOrReplace(ITableEntity entity) { add(entity.PartitionKey, TableOperation.InsertOrReplace(entity)); }
    public void Replace(ITableEntity entity) { add(entity.PartitionKey, TableOperation.Replace(entity)); }
    //*** IMPL
    Dictionary<string, TableBatchOperation> batches = new Dictionary<string, TableBatchOperation>();
    CloudTable table;
    void add(string partKey, TableOperation op) {
      TableBatchOperation batch;
      if (!batches.TryGetValue(partKey, out batch)) { batches.Add(partKey, batch = new TableBatchOperation()); }
      if (batch.Count == 100) {
        table.ExecuteBatch(batch);
        batches[partKey] = batch = new TableBatchOperation();
      }
      batch.Add(op);
    }
  }

}
