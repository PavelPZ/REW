using System;
using System.Data;
using System.Data.Common;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Xml.Serialization;
using System.Web.UI.WebControls;
using System.Linq;
using System.Linq.Expressions;
using System.Data.Linq;
using System.Data.Linq.Mapping;
using LinqKit;

using LMNetLib;

namespace LMComLib.Admin {

  [XmlInclude(typeof(User_Fulltext))]
  [XmlInclude(typeof(Order_UserId))]
  [XmlInclude(typeof(Order_Delayed))]
  [XmlInclude(typeof(Order_Months))]
  [XmlInclude(typeof(Order_Quarter))]
  [XmlInclude(typeof(Order_Year))]
  [XmlInclude(typeof(Order_Interval))]
  [XmlInclude(typeof(Task_Type))]
  [XmlInclude(typeof(Task_Order))]
  [XmlInclude(typeof(Task_Id))]
  [XmlInclude(typeof(EventLog_User))]
  [XmlInclude(typeof(EventLog_Order))]
  [XmlInclude(typeof(EventLog_Task))]
  [XmlInclude(typeof(EventLogPar))]
  [XmlInclude(typeof(Licencors_Months))]
  [XmlInclude(typeof(Licencors_Quarter))]
  [XmlInclude(typeof(Licencors_Year))]
  [XmlInclude(typeof(Licencors_Interval))]
  [XmlInclude(typeof(Product_Months))]
  [XmlInclude(typeof(Product_Quarter))]
  [XmlInclude(typeof(Product_Year))]
  [XmlInclude(typeof(Product_Interval))]
  [XmlInclude(typeof(ProductOrder_Months))]
  [XmlInclude(typeof(ProductOrder_Quarter))]
  [XmlInclude(typeof(ProductOrder_Year))]
  [XmlInclude(typeof(ProductOrder_Interval))]
  [XmlInclude(typeof(Discount_Months))]
  [XmlInclude(typeof(Discount_Quarter))]
  [XmlInclude(typeof(Discount_Year))]
  [XmlInclude(typeof(Discount_Interval))]
  public partial class QueryPar {
  }

  /// <summary>
  /// Jaky sloupec Users se bere jako test na datum
  /// </summary>
  [EnumDescrAttribute(typeof(UserDateType), "Created=datum vytvoření,ActivationMailSent=aktivace")]
  public enum UserDateType {
    Created,
    ActivationMailSent,
  }

  public class User_Fulltext : QueryPar {

    /// <summary>
    /// Fulltextovy dotaz nad Users.Fulltext
    /// </summary>
    [XmlAttribute]
    public string Query;

    /// <summary>
    /// Users.Roles
    /// </summary>
    public EnumProp Roles = new EnumProp(typeof(LMComRole));

    /// <summary>
    /// Users.Type
    /// </summary>
    public EnumProp ProfileType = new EnumProp(typeof(ProfileType));


    [XmlAttribute]
    public UserDateType UserDateType;
    [XmlAttribute]
    public DateTime FromDate = DateTime.MinValue;
    [XmlAttribute]
    public DateTime ToDate = DateTime.MinValue;

    void dateCond(ref Expression<Func<LMComData2.User, bool>> whereFnc, DateTime date, bool isGt) {
      if (date == DateTime.MinValue) return;
      Expression<Func<LMComData2.User, bool>> res = null;
      switch (UserDateType) {
        case UserDateType.Created: if (isGt) res = p => p.Created >= date; else res = p => p.Created < date; break;
        case UserDateType.ActivationMailSent: if (isGt) res = p => p.ActivationMailSent >= date; else res = p => p.ActivationMailSent < date; break;
        default: return;
      }
      whereFnc = whereFnc.And<LMComData2.User>(res);
    }

    void enumCond(ref Expression<Func<LMComData2.User, bool>> whereFnc) {
      if (ProfileType == null || ProfileType.Count <= 0) return;
      bool isNegative = ProfileType.isNegative();
      if (isNegative) whereFnc = whereFnc.And(o => !ProfileType.Contains(o.Type));
      else whereFnc = whereFnc.And(o => ProfileType.Contains(o.Type));
    }

    void addRole(ref Expression<Func<LMComData2.User, bool>> whereFnc) {
      if (Roles == null || Roles.Count <= 0) return;
      Int64 mask = Roles.GetMask();
      Expression<Func<LMComData2.User, bool>> fnc;
      if (mask == 0)
        if (Roles.isNegative()) fnc = p => p.Roles == null; else fnc = p => p.Roles != null;
      else
        if (Roles.isNegative()) fnc = p => ((Int64)p.Roles & mask) == 0; else fnc = p => ((Int64)p.Roles & mask) > 0;
      whereFnc = whereFnc.And(fnc);
    }

    Expression<Func<LMComData2.User, bool>> userWhereCondition() {
      Expression<Func<LMComData2.User, bool>> whereFnc = LinqKit.PredicateBuilder.True<LMComData2.User>();
      dateCond(ref whereFnc, FromDate, true);
      dateCond(ref whereFnc, ToDate, false);
      addRole(ref whereFnc);
      enumCond(ref whereFnc);
      return whereFnc;
    }

    static string ordersUrl(long userId) {
      Order_UserId par = new Order_UserId();
      par.EMailId = userId.ToString();
      par.Status = ActiveStatus.grid;
      par.Type = FormType.Orders;
      par.SubType = 1;
      return Link(par, "Objednávky");
    }
    static string eventLogUrl(long userId) {
      EventLog_User par = new EventLog_User();
      par.Id = userId;
      par.Status = ActiveStatus.grid;
      par.Type = FormType.EventLog;
      par.SubType = 1;
      return Link(par, "Historie");
    }

    string userDetailUrl(long userId) {
      return Link(string.Format("User.aspx?Id=" + userId + "&" + returnQueryString(this)), "Detail");
    }

    public IEnumerable linqQuery2() {
      LMComData2.LMComDataContext db = Machines.getContext();
      DbCommand cmd = db.Connection.CreateCommand();
      cmd.CommandText = "SELECT * FROM users WHERE " + string.Format(@"CONTAINS(fulltext, '{0}')", PrepareContains(Query));
      db.Connection.Open();
      try {
        using (DbDataReader rdr = cmd.ExecuteReader())
          return db.Translate<LMComData2.User>(rdr).OrderBy(u => u.Id).Select(usr => new {
            usr.Id,
            usr.EMail,
            usr.Title,
            usr.Roles,
            usr.Created,
            usr.ActivationMailSent,
            ordersUrl = ordersUrl(usr.Id),
            eventLogUrl = eventLogUrl(usr.Id),
            detailUrl = userDetailUrl(usr.Id)
          }).ToArray();
      } finally {
        db.Connection.Close();
      }
    }

    public override IQueryable linqQuery() {
      LMComData2.LMComDataContext db = Machines.getContext();
      return db.Users.Where(userWhereCondition()).OrderBy(u => u.Id).Select(usr => new {
        usr.Id,
        usr.EMail,
        usr.Title,
        usr.Roles,
        usr.Created,
        usr.ActivationMailSent,
        ordersUrl = ordersUrl(usr.Id),
        eventLogUrl = eventLogUrl(usr.Id),
        detailUrl = userDetailUrl(usr.Id)
      });
    }

    public int linqCount() {
      LMComData2.LMComDataContext db = Machines.getContext();
      return db.Users.Where(userWhereCondition()).Count();
    }
  }

  public class Order_UserId : QueryPar {
    /// <summary>
    /// Budto Users.Id nebo Users.EMail (neni-li EMailId cislo)
    /// </summary>
    [XmlAttribute]
    public string EMailId;

    Expression<Func<LMComData2.Comm_Order, bool>> query() {
      int id;
      if (Int32.TryParse(EMailId, out id))
        return o => o.User.Id == id;
      else
        return o => o.User.EMail == EMailId;
    }

    public override IQueryable linqQuery() {
      LMComData2.LMComDataContext db = Machines.getContext();
      return OrderPar.linqQueryLow(query(), this);
    }

    public override Dictionary<string, double> linqSummary() {
      return OrderPar.linqSummary(query());
    }
  }

  /// <summary>
  /// Predchudce pro zadani databazoveho IDu
  /// </summary>
  public abstract class IdPar : QueryPar {
    public Int64 Id;
  }

  public class Order_Delayed : QueryPar {
    /// <summary>
    /// Comm_Order.Site
    /// </summary>
    public EnumProp Site = new EnumProp(typeof(Domains));

    Expression<Func<LMComData2.Comm_Order, bool>> query() {
      Expression<Func<LMComData2.Comm_Order, bool>> whereFnc = LinqKit.PredicateBuilder.True<LMComData2.Comm_Order>();
      DatePar.enumCond(ref whereFnc, Site, 1);
      return whereFnc.And(o => o.DueDate < DateTime.UtcNow.ToUniversalTime());
    }

    public override IQueryable linqQuery() {
      return OrderPar.linqQueryLow(query(), this);
    }

    public override Dictionary<string, double> linqSummary() {
      return OrderPar.linqSummary(query());
    }
  }

  /// <summary>
  /// Predchudce pro Datum-Order queries
  /// </summary>
  public abstract class OrderPar : DatePar {
    public Order_Common Common = new Order_Common();

    static string detailUrl(int orderId, QueryPar par) {
      return Link(string.Format("Order.aspx?Id=" + orderId + "&" + returnQueryString(par)), "Detail");
    }
    static string tasksUrl(int orderId) {
      Task_Order par = new Task_Order();
      par.Id = orderId;
      par.Status = ActiveStatus.grid;
      par.Type = FormType.Tasks;
      par.SubType = 2;
      return Link(par, "Úkoly");
    }
    static string eventLogUrl(int userId) {
      EventLog_Order par = new EventLog_Order();
      par.Id = userId;
      par.Status = ActiveStatus.grid;
      par.Type = FormType.EventLog;
      par.SubType = 2;
      return Link(par, "Historie");
    }

    Expression<Func<LMComData2.Comm_Order, bool>> orderWhereConditionEx() {
      Expression<Func<LMComData2.Comm_Order, bool>> whereFnc = orderWhereCondition();
      enumCond(ref whereFnc, Common.BillMethod, 3);
      enumCond(ref whereFnc, Common.ShipMethod, 4);
      return whereFnc;
    }

    static ProfileData profile(LMComData2.Comm_Order ordDb) {
      string data = ordDb.Data; Order ord; 
      try {
        ord = XmlUtils.StringToObject<Order>(ordDb.Data);
      } catch (Exception exp){
        if (exp == null) return null;
        string[] parts = data.Split(new string[] { "<title>", "</title>", "<raw>", "</raw>" }, StringSplitOptions.RemoveEmptyEntries);
        ord = XmlUtils.StringToObject<Order>(parts[0] + parts[2] + parts[4]);
      }
      if (ord.Profile != null) return ord.Profile;
      if (ordDb.InvoiceNew != null) {
        XInvoice inv = XmlUtils.StringToObject<XInvoice>(ordDb.InvoiceNew);
        return new ProfileData() { Email = inv.pri2, Address = new Address() { FirstName = inv.pri1 } };
      }
      return new ProfileData();
    }

    public static IQueryable linqQueryLow(Expression<Func<LMComData2.Comm_Order, bool>> q, QueryPar par) {
      LMComData2.LMComDataContext db = Machines.getContext();
      return db.Comm_Orders.Where(q).OrderBy(o => o.Id).
        Select(o => new { o = o, prof = profile(o) }).
        Select(o => new {
          o.o.Id,
          o.o.Site,
          o.o.UserId,
          o.o.Status,
          o.o.StatusDate,
          o.o.BillMethod,
          o.o.ShipMethod,
          o.o.Created,
          o.o.DueDate,
          o.o.PaymentDate,
          o.o.Price,
          o.o.Provision,
          EMail = o.prof.Email,
          Title = string.Format("{0} {1}", o.prof.Address.FirstName, o.prof.Address.LastName),
          detailUrl = detailUrl(o.o.Id, par),
          tasksUrl = tasksUrl(o.o.Id),
          eventLogUrl = eventLogUrl(o.o.Id)
        });
    }

    public override IQueryable linqQuery() {
      return linqQueryLow(orderWhereConditionEx(), this);
    }

    public static Dictionary<string, double> linqSummary(Expression<Func<LMComData2.Comm_Order, bool>> q) {
      LMComData2.LMComDataContext db = Machines.getContext();
      var query = db.Comm_Orders.Where(q);
      Dictionary<string, double> res = new Dictionary<string, double>();
      int cnt = query.Count();
      res.Add("SumQuantity", cnt);
      res.Add("SumKc", cnt == 0 ? 0 : query.Sum(p => p.Price));
      return res;
    }

    public override Dictionary<string, double> linqSummary() {
      return linqSummary(orderWhereConditionEx());
    }
  }

  public class Order_Months : OrderPar {
  }
  public class Order_Quarter : OrderPar {
  }
  public class Order_Year : OrderPar {
  }
  public class Order_Interval : OrderPar {
  }

  /// <summary>
  /// Spolecne vlastnosti pro nektere objednavky
  /// </summary>
  public class Order_Common {
    /// <summary>
    /// Comm_Order.BillMethod
    /// </summary>
    public EnumProp BillMethod = new EnumProp(typeof(BillingMethods));
    /// <summary>
    /// Comm_Order.ShipMethod
    /// </summary>
    public EnumProp ShipMethod = new EnumProp(typeof(ShippingMethods));

  }

  /// <summary>
  /// Jaky sloupec Comm_Order se bere jako test na datum
  /// </summary>
  [EnumDescrAttribute(typeof(DateColumn), "Created=Vytvořena,PaymentDate=Zaplacena,DueDate=Splatnost")]
  public enum DateColumn {
    /// <summary>
    /// Comm_Order.Created
    /// </summary>
    Created,
    /// <summary>
    /// Comm_Order.PaymentDate
    /// </summary>
    PaymentDate,
    /// <summary>
    /// Comm_Order.DueDate
    /// </summary>
    DueDate,
  }
  /// <summary>
  /// Predchudce pro datum queries
  /// </summary>
  public abstract class DatePar : QueryPar {
    /// <summary>
    /// Comm_Order.Site
    /// </summary>
    public EnumProp Site = new EnumProp(typeof(Domains));
    /// <summary>
    /// Comm_Order.Supplier
    /// </summary>
    public EnumProp Supplier = new EnumProp(typeof(SupplierId));
    /// <summary>
    /// Jaky sloupec Comm_Order se bere jako test na datum
    /// </summary>
    [XmlAttribute]
    public DateColumn DateColumn;
    /// <summary>
    /// Comm_Order.Status
    /// </summary>
    public EnumProp OrderStatus = new EnumProp(typeof(OrderStatus));

    [XmlAttribute]
    public int Year = DateTime.Today.Year;
    [XmlAttribute]
    public int Month = DateTime.Today.Month;
    [XmlAttribute]
    public int Quarter = (int)(DateTime.Today.Month / 3) + 1;
    [XmlAttribute]
    public DateTime StartDate = DateTime.MinValue;
    [XmlAttribute]
    public DateTime EndDate = DateTime.MinValue;

    public DateTime getStartDate() {
      if (this is ProductOrder_Months || this is Product_Months || this is Licencors_Months || this is Order_Months || this is Discount_Months)
        return new DateTime(Year, Month, 1);
      else if (this is ProductOrder_Year || this is Product_Year || this is Licencors_Year || this is Order_Year || this is Discount_Year)
        return new DateTime(Year, 1, 1);
      else if (this is ProductOrder_Quarter || this is Product_Quarter || this is Licencors_Quarter || this is Order_Quarter || this is Discount_Quarter)
        return new DateTime(Year, (Quarter - 1) * 3 + 1, 1);
      else if (this is ProductOrder_Interval || this is Product_Interval || this is Licencors_Interval || this is Order_Interval || this is Discount_Interval)
        return StartDate;
      else return DateTime.UtcNow.ToUniversalTime();
    }
    public DateTime getEndDate() {
      if (this is ProductOrder_Months || this is Product_Months || this is Licencors_Months || this is Order_Months || this is Discount_Months)
        return new DateTime(Year, Month, 1).AddMonths(1).AddMilliseconds(-1);
      else if (this is ProductOrder_Year || this is Product_Year || this is Licencors_Year || this is Order_Year || this is Discount_Year)
        return new DateTime(Year, 1, 1).AddYears(1).AddMilliseconds(-1);
      else if (this is ProductOrder_Quarter || this is Product_Quarter || this is Licencors_Quarter || this is Order_Quarter || this is Discount_Quarter)
        return new DateTime(Year, (Quarter - 1) * 3 + 1, 1).AddMonths(3).AddMilliseconds(-1);
      else if (this is ProductOrder_Interval || this is Product_Interval || this is Licencors_Interval || this is Order_Interval || this is Discount_Interval)
        return new DateTime(EndDate.Year, EndDate.Month, EndDate.Day).AddDays(1).AddMilliseconds(-1);
      else return DateTime.UtcNow.ToUniversalTime();
    }
    void dateCond(ref Expression<Func<LMComData2.Comm_Order, bool>> whereFnc, DateTime date, bool isGt) {
      if (date == DateTime.MinValue) return;
      Expression<Func<LMComData2.Comm_Order, bool>> res = null;
      switch (DateColumn) {
        case DateColumn.Created: if (isGt) res = p => p.Created >= date; else res = p => p.Created < date; break;
        case DateColumn.DueDate: if (isGt) res = p => p.DueDate >= date; else res = p => p.DueDate < date; break;
        case DateColumn.PaymentDate: if (isGt) res = p => p.PaymentDate >= date; else res = p => p.PaymentDate < date; break;
        default: return;
      }
      whereFnc = whereFnc.And<LMComData2.Comm_Order>(res);
    }

    public static void enumCond(ref Expression<Func<LMComData2.Comm_Order, bool>> whereFnc, EnumProp enumProp, int fldId) {
      if (enumProp == null || enumProp.Count <= 0) return;
      bool isNegative = enumProp.isNegative();
      Expression<Func<LMComData2.Comm_Order, bool>> res;
      switch (fldId) {
        case 0: if (isNegative) res = o => !enumProp.Contains(o.Status); else res = o => enumProp.Contains(o.Status); break;
        case 1: if (isNegative) res = o => !enumProp.Contains(o.Site); else res = o => enumProp.Contains(o.Site); break;
        case 2: if (isNegative) res = o => !enumProp.Contains(o.SupplierId); else res = o => enumProp.Contains(o.SupplierId); break;
        case 3: if (isNegative) res = o => !enumProp.Contains(o.BillMethod); else res = o => enumProp.Contains(o.BillMethod); break;
        case 4: if (isNegative) res = o => !enumProp.Contains(o.ShipMethod); else res = o => enumProp.Contains(o.ShipMethod); break;
        default: return;
      }
      whereFnc = whereFnc.And<LMComData2.Comm_Order>(res);
    }
    protected Expression<Func<LMComData2.Comm_Order, bool>> orderWhereCondition() {
      Expression<Func<LMComData2.Comm_Order, bool>> whereFnc = LinqKit.PredicateBuilder.True<LMComData2.Comm_Order>();
      dateCond(ref whereFnc, getStartDate(), true);
      dateCond(ref whereFnc, getEndDate(), false);
      enumCond(ref whereFnc, this.OrderStatus, 0);
      enumCond(ref whereFnc, this.Site, 1);
      enumCond(ref whereFnc, this.Supplier, 2);
      return whereFnc;
    }
  }

  /// <summary>
  /// Predchudce pro Product-Order queries
  /// </summary>
  public abstract class ProductPar : DatePar {

    public override IQueryable linqQuery() {
      LMComData2.LMComDataContext db = Machines.getContext();
      return db.Comm_Orders.Where(orderWhereCondition()).
        SelectMany(o => o.ProductInfos).
        GroupBy(p => new { p.Comm_Order.Site, p.ProductId }).
        OrderBy(g => g.Key.Site).OrderBy(g => g.Key.ProductId).
        Select(prodGroup => new {
          Site = prodGroup.Key.Site,
          ProductId = prodGroup.Key.ProductId,
          Quantity = prodGroup.Count(),
          Discounts = prodGroup.Sum(p => p.Discount),
          Licences = prodGroup.Sum(p => p.Licence),
          ListPrices = prodGroup.Sum(p => p.ListPrice),
          Provisions = prodGroup.Sum(p => p.Provision),
          Costs = prodGroup.Sum(p => p.Cost),
          Profits = prodGroup.Sum(p => p.Profit)
        });
    }
    public override Dictionary<string, double> linqSummary() {
      LMComData2.LMComDataContext db = Machines.getContext();
      Dictionary<string, double> res = new Dictionary<string, double>();
      var q = db.Comm_Orders.Where(orderWhereCondition()).SelectMany(o => o.ProductInfos);
      int cnt = q.Count();
      res.Add("SumQuantity", cnt);
      res.Add("SumProfit", cnt == 0 ? 0 : q.Sum(p => p.Profit));
      res.Add("SumDiscount", cnt == 0 ? 0 : q.Sum(p => p.Discount));
      res.Add("SumLicence", cnt == 0 ? 0 : q.Sum(p => p.Licence));
      res.Add("SumListPrice", cnt == 0 ? 0 : q.Sum(p => p.ListPrice));
      res.Add("SumProvision", cnt == 0 ? 0 : q.Sum(p => p.Provision));
      res.Add("SumCost", cnt == 0 ? 0 : q.Sum(p => p.Cost));
      return res;
    }
  }

  public class Product_Months : ProductPar {
  }
  public class Product_Quarter : ProductPar {
  }
  public class Product_Year : ProductPar {
  }
  public class Product_Interval : ProductPar {
  }

  public abstract class ProductOrderPar : ProductPar {

    string detailUrl(int orderId) {
      return Link(string.Format("Order.aspx?Id=" + orderId + "&" + returnQueryString(this)), "Detail");
    }
    public override IQueryable linqQuery() {
      LMComData2.LMComDataContext db = Machines.getContext();
      return db.Comm_Orders.Where(orderWhereCondition()).SelectMany(o => o.ProductInfos).
             OrderBy(p => p.ProductId).OrderBy(p => p.Comm_Order.Site).
             Select(prod => new {
               prod.ProductId,
               prod.Quantity,
               prod.Comm_Order.Site,
               prod.ListPrice,
               VarSymb = prod.Comm_Order.Id,
               prod.Comm_Order.UserId,
               prod.Comm_Order.Status,
               prod.Comm_Order.BillMethod,
               prod.Comm_Order.ShipMethod,
               prod.Comm_Order.Created,
               prod.Comm_Order.PaymentDate,
               prod.Comm_Order.DueDate,
               prod.Comm_Order.User.EMail,
               detailUrl = detailUrl(prod.Comm_Order.Id)
             });
    }
  }

  public class ProductOrder_Months : ProductOrderPar {
  }
  public class ProductOrder_Quarter : ProductOrderPar {
  }
  public class ProductOrder_Year : ProductOrderPar {
  }
  public class ProductOrder_Interval : ProductOrderPar {
  }

  /// <summary>
  /// Predchudce pro Licencors-Order queries
  /// </summary>
  public abstract class LicencorsPar : DatePar {

    public override IQueryable linqQueryExcel() {
      LMComData2.LMComDataContext db = Machines.getContext();
      return db.Comm_Orders.Where(orderWhereCondition()).
        SelectMany(o => o.Licencors).
        Select(l => new {
          VarSymb = l.Comm_Order.Id,
          Site = l.Comm_Order.Site.ToString(),
          Licencor = l.LicencorId,
          Percent = RoyalityTable.royalityTableItem(l.LicencorId).Percent,
          Product = l.ProductId,
          Quantity = l.Quantity,
          Sum = l.Kc,
          Fee = l.FeeKc
        });
    }

    public override IQueryable linqQuery() {
      LMComData2.LMComDataContext db = Machines.getContext();
      return db.Comm_Orders.Where(orderWhereCondition()).
        SelectMany(o => o.Licencors).
        GroupBy(l => new { l.Comm_Order.Site, l.LicencorId }).
        OrderBy(g => g.Key.Site).OrderBy(g => g.Key.LicencorId).
        Select(g => new {
          g.Key.Site,
          g.Key.LicencorId,
          Quantity = g.Sum(p => p.Quantity),
          FeeSum = g.Sum(p => p.FeeKc),
          Sum = g.Sum(p => p.Kc)
        });
    }
    public override Dictionary<string, double> linqSummary() {
      LMComData2.LMComDataContext db = Machines.getContext();
      Dictionary<string, double> res = new Dictionary<string, double>();
      var q = db.Comm_Orders.Where(orderWhereCondition()).SelectMany(o => o.Licencors);
      int cnt = q.Count();
      res.Add("SumQuantity", cnt == 0 ? 0.0 : q.Sum(p => p.Quantity));
      res.Add("SumFee", cnt == 0 ? 0.0 : q.Sum(p => p.FeeKc));
      res.Add("SumKc", cnt == 0 ? 0.0 : q.Sum(p => p.Kc));
      return res;
    }
  }

  public class Licencors_Months : LicencorsPar {
  }
  public class Licencors_Quarter : LicencorsPar {
  }
  public class Licencors_Year : LicencorsPar {
  }
  public class Licencors_Interval : LicencorsPar {
  }

  public abstract class TaskPar : IdPar {
    public static IQueryable linqQueryCommon(Expression<Func<LMComData2.Task, bool>> q, QueryPar query) {
      LMComData2.LMComDataContext db = Machines.getContext();
      return db.Tasks.Where(q).OrderBy(t => t.Id).Select(t => new {
        t.Id,
        t.OrderId,
        t.Comm_Order.UserId,
        t.Comm_Order.User.EMail,
        t.Comm_Order.User.Title,
        t.Type,
        t.Created,
        t.Closed,
        eventLogUrl = eventLogUrl(t.Id),
        orderDetailUrl = orderDetailUrl(t.Id, query)
      });
    }
    static string eventLogUrl(int taskId) {
      EventLog_Task par = new EventLog_Task();
      par.Id = taskId;
      par.Status = ActiveStatus.grid;
      par.Type = FormType.EventLog;
      par.SubType = 3;
      return Link(par, "Historie");
    }
    static string orderDetailUrl(int orderId, QueryPar query) {
      return Link(string.Format("Order.aspx?Id=" + orderId + "&" + returnQueryString(query)), "Detail");
    }

    public override IQueryable linqQuery() {
      return linqQueryCommon(linqQueryLow(), this);
    }

    public IEnumerable<LMComData2.Task> linqQueryTask() {
      return Machines.getContext().Tasks.Where(linqQueryLow());
    }

    protected abstract Expression<Func<LMComData2.Task, bool>> linqQueryLow();
  }
  public class Task_Id : TaskPar {
    /// <summary>
    /// Tasks.Id
    /// </summary>
    protected override Expression<Func<LMComData2.Task, bool>> linqQueryLow() {
      return t => t.Id == Id;
    }
  }

  public class Task_Type : TaskPar {

    /// <summary>
    /// Tasks.Type
    /// </summary>
    public EnumProp TaskType = new EnumProp(typeof(TaskType));
    /// <summary>
    /// Seznam produktů, které objednávky z tásku nesmí obsahovat
    /// Comma delimited list ProductInfo.ProductId
    /// </summary>
    public string NotProducts;
    /// <summary>
    /// I uzavrene tasky, Tasks.Closed
    /// </summary>
    public bool Closed;

    void enumCond(ref Expression<Func<LMComData2.Task, bool>> whereFnc) {
      if (TaskType == null || TaskType.Count <= 0) return;
      bool isNegative = TaskType.isNegative();
      if (isNegative) whereFnc = whereFnc.And<LMComData2.Task>(o => !TaskType.Contains(o.Type));
      else whereFnc = whereFnc.And<LMComData2.Task>(o => TaskType.Contains(o.Type));
    }

    protected override Expression<Func<LMComData2.Task, bool>> linqQueryLow() {
      Expression<Func<LMComData2.Task, bool>> whereFnc = LinqKit.PredicateBuilder.True<LMComData2.Task>();
      enumCond(ref whereFnc);
      if (!string.IsNullOrEmpty(NotProducts)) {
        int[] prodIds = NotProducts.Split(',').Select(s => int.Parse(s)).ToArray();
        whereFnc = whereFnc.And<LMComData2.Task>(t => !t.Comm_Order.ProductInfos.Where(p => prodIds.Contains(p.ProductId)).Any());
      }
      if (Id > 0) whereFnc = whereFnc.And<LMComData2.Task>(t => t.Id < Id);
      if (!Closed) whereFnc = whereFnc.And<LMComData2.Task>(t => !t.Closed);
      return whereFnc;
    }

  }

  public class Task_Order : TaskPar {
    /// <summary>
    /// Tasks.OrderId
    /// </summary>
    protected override Expression<Func<LMComData2.Task, bool>> linqQueryLow() {
      return t => t.OrderId == Id;
    }
  }

  public class EventLog_User : IdPar {
    static string detailUrl(int eventId, QueryPar query) {
      return Link(string.Format("EventDetail.aspx?Id=" + eventId + "&" + returnQueryString(query)), "Detail");
    }

    public static IQueryable linqQueryLow(Expression<Func<LMComData2.EventsLog, bool>> q, QueryPar query) {
      LMComData2.LMComDataContext db = Machines.getContext();
      return db.EventsLogs.Where(q).OrderBy(e => e.Id).Select(e => new {
        e.Id,
        e.Type,
        e.Message,
        e.MachineName,
        e.Site,
        e.App,
        e.RequestUrl,
        e.UtcTime,
        detailUrl = detailUrl(e.Id, query)
      });
    }

    public override IQueryable linqQuery() {
      return linqQueryLow(e => e.UserId == Id, this);
    }

  }

  public class EventLog_Order : IdPar {
    /// <summary>
    /// EventsLog.OrderId
    /// </summary>
    public override IQueryable linqQuery() {
      return EventLog_User.linqQueryLow(e => e.OrderId == Id, this);
    }


  }

  public class EventLog_Task : IdPar {
    /// <summary>
    /// EventsLog.TaskId
    /// </summary>
    public override IQueryable linqQuery() {
      return EventLog_User.linqQueryLow(e => e.TaskId == Id, this);
    }

  }
  public class EventLogPar : QueryPar {
    public EnumProp Category = new EnumProp(typeof(EventCategory));
    public EnumProp Site = new EnumProp(typeof(Domains));


    static void enumCond(ref Expression<Func<LMComData2.EventsLog, bool>> whereFnc, EnumProp enumProp, int fldId) {
      if (enumProp == null || enumProp.Count <= 0) return;
      bool isNegative = enumProp.isNegative();
      Expression<Func<LMComData2.EventsLog, bool>> res;
      switch (fldId) {
        case 0: if (isNegative) res = o => o.Site == null || !enumProp.Contains((Int64)o.Site); else res = o => o.Site != null && enumProp.Contains((Int64)o.Site); break;
        case 1: if (isNegative) res = o => !enumProp.Contains(o.Type); else res = o => enumProp.Contains(o.Type); break;
        default: return;
      }
    }

    public override IQueryable linqQuery() {
      Expression<Func<LMComData2.EventsLog, bool>> whereFnc = LinqKit.PredicateBuilder.True<LMComData2.EventsLog>();
      enumCond(ref whereFnc, Site, 0);
      enumCond(ref whereFnc, Category, 1);
      return EventLog_User.linqQueryLow(whereFnc, this);
    }
  }

  public abstract class DiscountPar : DatePar {

    public override IQueryable linqQuery() {
      LMComData2.LMComDataContext db = Machines.getContext();
      return db.Comm_Orders.Where(orderWhereCondition()).
        SelectMany(o => o.OrderDiscounts).
        GroupBy(l => new { l.Comm_Order.Site, l.Discount.Disc_Prototype.Title }).
        OrderBy(g => g.Key.Site).OrderBy(g => g.Key.Title).
        Select(g => new {
          g.Key.Site,
          g.Key.Title,
          OrdersNum = g.Count()
        });
    }
  }

  public class Discount_Months : DiscountPar {
  }
  public class Discount_Quarter : DiscountPar {
  }
  public class Discount_Year : DiscountPar {
  }
  public class Discount_Interval : DiscountPar {
  }

}
