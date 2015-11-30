using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AzureLib {
  public static class Factory {
    public static void init() {
      CloudStorageAccount storageAccount = CloudStorageAccount.Parse(Cfg.cfg.azure.connectionString);
      tableClient = storageAccount.CreateCloudTableClient();
      blobClient = storageAccount.CreateCloudBlobClient();
    }
    public static CloudTable createTable(string containerName) {
      return tableClient.GetTableReference(containerName);
    }
    public static CloudBlobContainer createBlob(string containerName) {
      return blobClient.GetContainerReference(containerName);
    }
    public static CloudTableClient tableClient;
    public static CloudBlobClient blobClient;
  }
}
