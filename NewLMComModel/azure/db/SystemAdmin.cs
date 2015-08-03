using azure;
using LMComLib;
using LMNetLib;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Text;

namespace AzureData {

  public abstract class Sys_Low : azure.azureEntity {
    public Sys_Low() : base() { } //PartitionKey = "global"; RowKey = azure.keyLib.makeConst(GetType().Name.ToLower()); }
    protected virtual void initData() { }
    public override string PartitionKey { get { return "global"; } set { } }

    public static TRes doRead<TRes>(driverLow drv) where TRes : Sys_Low, new() {
      var example = new TRes();
      return drv.read<TRes>(example);
    }
    public static TRes doCreate<TRes>() where TRes : Sys_Low, new() { var res = new TRes(); res.initData(); return res; }
  }

  public abstract class Sys_Strings : Sys_Low {
    public Sys_Strings() : base() { }
    public string strData {
      get { return strDataList == null || strDataList.Count == 0 ? null : strDataList.Aggregate((r, i) => r + "," + i); }
      set { strDataList = value == null ? null : value.Split(',').ToList(); }
    }
    protected override void initData() { strDataList = new List<string>(); }

    public List<string> strDataList; // { get { return _strDataList ?? (_strDataList = new List<string>()); } } List<string> _strDataList;
    protected override void afterRead(string key, EntityProperty prop) {
      switch (key) {
        case "strData": strData = prop.StringValue; break;
        default: base.afterRead(key, prop); break;
      }
    }
    protected override void beforeWrite(Action<string, EntityProperty> writeProp) {
      base.beforeWrite(writeProp);
      writeProp("strData", new EntityProperty(strData));
    }
  }

  public class Sys_Admin : Sys_Strings { }
  public class Sys_CompShortId : Sys_Strings { }

  //public enum sysType { no, strDataList }

  //public partial class SystemAdmin_ : azure.azureEntity {

  //  public SystemAdmin_() : base() { }
  //  public SystemAdmin_(sysType type) : this() { PartitionKey = "s"; RowKey = type.ToString(); }
  //  public string strData {
  //    get { return _strDataList == null || _strDataList.Count == 0 ? null : _strDataList.Aggregate((r, i) => r + "," + i); }
  //    set { _strDataList = value == null ? null : value.Split(',').ToList(); }
  //  } 

  //  public List<string> strDataList { get {return _strDataList ?? (_strDataList = new List<string>()); } } List<string> _strDataList; 

  //  public static SystemAdmin_ doRead(driverLow drv, sysType type) {
  //    return drv.read<SystemAdmin_>(new SystemAdmin_(type));
  //  }

  //}

}
