namespace LMComLib.Data.SeoScanResultTableAdapters {
  public partial class DataTableAdapter {
    public static SeoScanResult.DataDataTable fillTable(string connStringPar) {
      DataTableAdapter adapt = new DataTableAdapter();
      SeoScanResult.DataDataTable table = new SeoScanResult.DataDataTable();
      adapt.Connection.ConnectionString = string.Format(System.Configuration.ConfigurationManager.ConnectionStrings["SeoData"].ConnectionString, connStringPar);
      adapt.Fill(table);
      return table;
    }
  }
}

namespace LMComLib.Data {
  public partial class SeoScanResult {
    public partial class DataRow {
      public string Name { get; set; }
    }
  }
}

