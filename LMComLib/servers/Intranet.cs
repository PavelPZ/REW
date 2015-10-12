using System;
using System.Collections.Generic;
using System.Text;
using System.Globalization;
using System.IO;
using System.Data;
using System.Xml;
using System.Web;
using System.Web.UI;
using System.Data.Linq;
using System.Data.Linq.Mapping;
using System.Linq;

using LMNetLib;
using LMComLib;
using LMComData2;
using LMComLib.Cms;
using System.Configuration;
using System.Diagnostics;

namespace LMComLib {

  //public class TaskSummary {
  //  public DateTime StartAt;
  //  public DateTime FinishAt;
  //  public int BatchId;
  //  //public string SelfFileName;
  //  public List<int> TaskIds = new List<int>();
  //}

  /// <summary>
  /// Stav objednavky
  /// </summary>
  [EnumDescr(typeof(OrderStatus), "Prijata=Přijata: čeká na odeslání,DobirkaOdeslana=Dobírka odeslána,DobirkaVracena=Dobírka vrácena,CekaNaPlatbu=Čeká na platbu,Hotovo=Ukončena,Zaslano=Zasláno,Zrusena=Zrušena,eBankaZaplaceno=eBanka zaplaceno,eBankaError=eBanka error,Zaplaceno=Zaplaceno: čeká na odeslání,Storno=Storno")]
  public enum OrderStatus {
    no = 0,
    /// <summary>
    /// Objednavka prijata
    /// </summary>
    Prijata = 1,
    /// <summary>
    /// Dobirka odeslana
    /// </summary>
    DobirkaOdeslana = 2,
    /// <summary>
    /// Dobirka se vratila
    /// </summary>
    DobirkaVracena = 4,
    /// <summary>
    /// Ceka se na platbu zalohovou fakturou
    /// </summary>
    CekaNaPlatbu = 5,
    /// <summary>
    /// Objednavka kompletne vyrizena
    /// </summary>
    Hotovo = 6,
    /// <summary>
    /// Objednavka kompletne vyrizena, zbozi poslano. Nevime ale, jestli jiz uzivatel dostal zbozi.
    /// </summary>
    Zaslano = 7,
    /// <summary>
    /// objednavka zrusena, napr. vrácená dobírka (a uživatel nechce poslat znova), dlouho nezaplacena proforma-faktura apod.
    /// </summary>
    Zrusena = 8,
    /// <summary>
    /// Navrat z ebanka platebni brany
    /// </summary>
    eBankaZaplaceno = 9,
    /// <summary>
    /// Nepodarilo se strhnout penize z ebanky
    /// </summary>
    eBankaError = 10,
    /// <summary>
    /// Zaplaceno, čeká na odeslani
    /// </summary>
    Zaplaceno = 11,
    /// <summary>
    /// Storno
    /// </summary>
    Storno = 12,
  }
  [EnumDescrAttribute(typeof(TaskType), "PoslatZboziPosta=poslat zboží poštou,PoslatZboziPPL=poslat zboží PPL,DobirkaPosta=dobírka pošta,DobirkaPPL=dobírka PPL,Other=ostatní")]
  public enum TaskType {
    no = 0,
    /// <summary>
    /// Poslat zaplacene zbozi postou
    /// </summary>
    PoslatZboziPosta = 1,
    /// <summary>
    /// Poslat zaplacene zbozi postou
    /// </summary>
    PoslatZboziPPL = 2,
    /// <summary>
    /// Vyresit dobirku, posta
    /// </summary>
    DobirkaPosta = 3,
    /// <summary>
    /// Vyresit dobirku, PPL
    /// </summary>
    DobirkaPPL = 4,
    /// <summary>
    /// Poslat proformu postou
    /// </summary>
    PoslatProforma = 5,
    /// <summary>
    /// Libovolny záznam obsluhy
    /// </summary>
    Other = 6,
  }

  //public static class Intranet {

  //  //public static bool OnOrderFinished(Order order) {
  //  //  try {
  //  //    OrderDBContext ctx = new OrderDBContext(order);
  //  //    generateLicence(ctx);
  //  //    if (!Order.Instance.Save(ctx)) return false;
  //  //    setOrderStatus(ctx, OrderStatus.Prijata);

  //  //    //return true;
  //  //    //Dle zpusobu platby
  //  //    switch (order.BillMethod) {
  //  //      case BillingMethods.Dobirka:
  //  //        orderDobirkaFinished(ctx);
  //  //        MailSender.sendMail(MailTypes.OrderAccepted_Dobirka, ctx.Order.Site, ctx.Order.SubSite, ctx.Order.Lang, LMStatus.Profile.Email, ctx);
  //  //        //MailSender.sendMail("orderAccepted_dobirka", LMStatus.Profile.Email, ctx);
  //  //        break;
  //  //      case BillingMethods.eBanka:
  //  //      case BillingMethods.payMuzo:
  //  //      case BillingMethods.PayPal:
  //  //      case BillingMethods.PayPalCard:
  //  //      case BillingMethods.PayU:
  //  //        setOrderStatus(ctx, OrderStatus.CekaNaPlatbu);
  //  //        //Proforma
  //  //        ProsperLib.createInvoice(ctx, DocumentType.proforma);
  //  //        //ProsperLib.refreshInvoicePDF(ctx, true);
  //  //        break;
  //  //      case BillingMethods.Prevod:
  //  //        setOrderStatus(ctx, OrderStatus.CekaNaPlatbu);
  //  //        //Proforma
  //  //        ProsperLib.createInvoice(ctx, DocumentType.proforma);
  //  //        //ProsperLib.refreshInvoicePDF(ctx, true);
  //  //        MailSender.sendMail(MailTypes.OrderAccepted_Proforma, ctx.Order.Site, ctx.Order.SubSite, ctx.Order.Lang, LMStatus.Profile.Email, ctx);
  //  //        //MailSender.sendMail("orderAccepted_proforma", LMStatus.Profile.Email, ctx);
  //  //        break;
  //  //      default:
  //  //        throw new Exception();
  //  //    }
  //  //    //Aktualizace databaze
  //  //    ctx.Save();
  //  //    //Event
  //  //    new CommerceEvent(CommerceEventIds.OrderSave, order.Id).Raise();
  //  //    return true;
  //  //  } catch (Exception exp) {
  //  //    Order.ClearInstance();
  //  //    throw new Exception(string.Format("Order {0}", order.Id), exp);
  //  //  }
  //  //}

  //  //public static IEnumerable<VypisItem> ImportMBankVypis(string raw, DateTime start, DateTime end, IEnumerable<VypisItem> items) {
  //  //  List<VypisItem> res = new List<VypisItem>();
  //  //  foreach (VypisItem it in items) {
  //  //    try {
  //  //      it.PairResult = OnPaymentCheck(it.OrderId, new Currency() { Amount = it.Amount, Typ = CurrencyType.csk, WithVat = true }, true);
  //  //    } catch (Exception exp) {
  //  //      it.PairResult = PaymentCheckResult.exception;
  //  //      it.Error = exp;
  //  //    }
  //  //    res.Add(it);
  //  //  }
  //  //  LMComDataContext db = Machines.getContext();
  //  //  if (res.Where(i => i.PairResult != PaymentCheckResult.alreadyPayed).Any()) {
  //  //    db.MBanks.InsertOnSubmit(
  //  //      new MBank() {
  //  //        Created = DateTime.UtcNow,
  //  //        Start = start,
  //  //        End = end,
  //  //        Raw = raw,
  //  //        Data = res.
  //  //          Where(i => i.PairResult != PaymentCheckResult.alreadyPayed).
  //  //          Select(i => i.OrderId.ToString() + ";" + i.Amount.ToString() + ";" + i.PairResult + ";" + i.ErrorStr).
  //  //          Aggregate((r, i) => r + "\r\n" + i)
  //  //      }
  //  //    );
  //  //  }
  //  //  db.SubmitChanges();
  //  //  return res;
  //  //}

  //  //static void orderDobirkaFinished(OrderDBContext ctx) {
  //  //  new CommerceEvent("Dobírka", ctx.Order.Id).Raise();
  //  //  setOrderStatus(ctx, OrderStatus.Prijata);
  //  //  //PZ 10.3.08: faktura pro dobirku se vytvari az pri exportu tasku
  //  //  ProsperLib.createInvoice(ctx, DocumentType.proforma);
  //  //  //ProsperLib.refreshInvoicePDF(ctx, true);
  //  //  //Generace klicu
  //  //  //if (ctx.Order.ContentType != OrderContentType.Box)
  //  //  //generateLicence(ctx);
  //  //  //Zaznam v tasklistu
  //  //  if (ctx.Order.ShipMethod == ShippingMethods.posta)
  //  //    createTask(ctx, TaskType.DobirkaPosta);
  //  //  else if (ctx.Order.ShipMethod == ShippingMethods.PPL)
  //  //    createTask(ctx, TaskType.DobirkaPPL);
  //  //  else
  //  //    throw new Exception();
  //  //}

  //  //static void createTask(OrderDBContext ctx, TaskType type) {
  //  //  Task task = new Task();
  //  //  ctx.db.Tasks.InsertOnSubmit(task);
  //  //  task.OrderId = ctx.OrderId;
  //  //  task.Created = DateTime.UtcNow.ToUniversalTime();
  //  //  string tit = null;
  //  //  switch (type) {
  //  //    case TaskType.DobirkaPosta: tit = "Dobírka poštou"; break;
  //  //    case TaskType.DobirkaPPL: tit = "Dobírka PPL"; break;
  //  //    case TaskType.PoslatProforma: tit = "Poslat proformu"; break;
  //  //    case TaskType.PoslatZboziPosta: tit = "Zboží poštou"; break;
  //  //    case TaskType.PoslatZboziPPL: tit = "Zboží PPL"; break;
  //  //  }
  //  //  task.Title = tit + ", zákazník=" + ctx.Order.UserId.ToString() + ", var.sym.=" + ctx.OrderId;
  //  //  task.Type = (short)type;
  //  //  task.Closed = false;
  //  //  new CommerceEvent(CommerceEventIds.TaskCreated,
  //  //    EnumDescrAttribute.getDescr(typeof(TaskType), (int)type), ctx.OrderId).Raise();
  //  //}

  //  //public static void createTask(int orderId, string title) {
  //  //  LMComDataContext db = Machines.getContext();
  //  //  Task task = new Task();
  //  //  db.Tasks.InsertOnSubmit(task);
  //  //  task.OrderId = orderId;
  //  //  task.Created = DateTime.UtcNow.ToUniversalTime();
  //  //  task.Title = title;
  //  //  task.Type = (short)TaskType.Other;
  //  //  task.Closed = false;
  //  //  db.SubmitChanges();
  //  //}

  //  //static void finishTask(int taskId, int batchId) {
  //  //  OrderDBContext ctx = new OrderDBContext();
  //  //  //LMComDataContext db = Machines.getContext();
  //  //  Task task = ctx.db.Tasks.Single<Task>(t => t.Id == taskId); // (from tsk in ctx.db.Tasks where tsk.Id == taskId select tsk).First<Task>();
  //  //  if (task.Closed) return;
  //  //  TaskType tp = (TaskType)task.Type;
  //  //  ctx.OrderId = task.OrderId;
  //  //  switch (tp) {
  //  //    case TaskType.DobirkaPosta:
  //  //    case TaskType.DobirkaPPL:
  //  //      setOrderStatus(ctx, OrderStatus.DobirkaOdeslana);
  //  //      task.Closed = true;
  //  //      new CommerceEvent(CommerceEventIds.TaskFinished, EnumDescrAttribute.getDescr(typeof(TaskType), (int)tp) + "(dávka číslo " + batchId.ToString() + ")", ctx.OrderDb.Id).Raise();
  //  //      break;
  //  //    case TaskType.PoslatProforma:
  //  //      break;
  //  //    case TaskType.PoslatZboziPosta:
  //  //    case TaskType.PoslatZboziPPL:
  //  //      setOrderStatus(ctx, OrderStatus.Zaslano);
  //  //      task.Closed = true;
  //  //      new CommerceEvent(CommerceEventIds.TaskFinished, EnumDescrAttribute.getDescr(typeof(TaskType), (int)tp) + "(dávka číslo " + batchId.ToString() + ")", ctx.OrderDb.Id).Raise();
  //  //      break;
  //  //    default: return;
  //  //  }
  //  //  ctx.Save();
  //  //}

  //  //static void setOrderStatus(OrderDBContext ctx, OrderStatus st) {
  //  //  setOrderStatus(ctx.OrderDb, st);
  //  //}

  //  //static void setOrderStatus(Comm_Order ordDb, OrderStatus st) {
  //  //  OrderStatus oldSt = (OrderStatus)ordDb.Status;
  //  //  if (oldSt == st) return;
  //  //  if (st == OrderStatus.Hotovo)
  //  //    ordDb.PaymentDate = DateTime.UtcNow.ToUniversalTime();
  //  //  ordDb.StatusDate = DateTime.UtcNow.ToUniversalTime();
  //  //  ordDb.Status = (short)st;
  //  //  new CommerceEvent(CommerceEventIds.Status,
  //  //    EnumDescrAttribute.getDescr(typeof(OrderStatus), (int)st) + " (z " +
  //  //    EnumDescrAttribute.getDescr(typeof(OrderStatus), (int)oldSt) + ")", ordDb.Id).Raise();
  //  //}

  //  //static void sendDiscount(OrderDBContext ctx) {
  //  //  if (ctx.Order.Site == Domains.com) return;
  //  //  double discount = double.Parse(System.Configuration.ConfigurationManager.AppSettings["Order.Bonus"], CultureInfo.InvariantCulture);
  //  //  discount = ctx.Order.PriceForTax * discount;
  //  //  discount = Order.RoundTotalCurrency(discount);
  //  //  string disc = Discount.GenerateOrderDiscount((Domains)ctx.Order.Site, discount, CurrencyType.csk);
  //  //  //Pro mail: zobrazeni slevz s dani
  //  //  discount = Order.RoundTotalCurrency(discount + discount * Order.ActTaxPercent / 100);
  //  //  MailSender.sendMail(MailTypes.SendDiscount, ctx.Order.Site, ctx.Order.SubSite, ctx.Order.Lang, ctx.Profile.Email, new SendDiscountPar(ctx, disc, discount));
  //  //  //MailSender.sendMail("sendDiscount", ctx.Profile.Email, new SendDiscountPar(ctx, disc, discount));
  //  //}

  //  //public static OrderDBContext OnDobirkaVracena(int orderId) {
  //  //  OrderDBContext ctx = new OrderDBContext(orderId);
  //  //  new CommerceEvent("Dobírka vrácena", ctx.OrderId).Raise();
  //  //  setOrderStatus(ctx, OrderStatus.DobirkaVracena);
  //  //  ProsperLib.createInvoice(ctx, DocumentType.adviceOfCredit);
  //  //  ctx.Order.OnStorno(ctx);
  //  //  ctx.Save();
  //  //  return ctx;
  //  //}

  //  //public static OrderDBContext OnStorno(int orderId) {
  //  //  OrderDBContext ctx = new OrderDBContext(orderId);
  //  //  new CommerceEvent("Storno", ctx.OrderId).Raise();
  //  //  setOrderStatus(ctx, OrderStatus.Storno);
  //  //  ProsperLib.createInvoice(ctx, DocumentType.adviceOfCredit);
  //  //  ctx.Order.OnStorno(ctx);
  //  //  ctx.Save();
  //  //  return ctx;
  //  //}

  //  //public static OrderDBContext OnDobirkaZnovu(int orderId) {
  //  //  new CommerceEvent("Znovuzaslání dobírky", orderId).Raise();
  //  //  OrderDBContext ctx = new OrderDBContext();
  //  //  Comm_Order oldOrd = (from o in ctx.db.Comm_Orders where o.Id == orderId select o).Single<Comm_Order>();
  //  //  oldOrd.Status = (short)OrderStatus.Zrusena;
  //  //  //string oldData = (from o in ctx.db.Comm_Orders where o.Id == orderId select o.Data).Single<string>();
  //  //  Order ord = Order.setAsString(oldOrd.Data);
  //  //  ord.Id = (int)LMComDataProvider.getUniqueId(LMComDataProvider.uiOrderId);
  //  //  ctx.OrderId = ord.Id;
  //  //  ctx.order = ord;
  //  //  ord.Save(ctx, orderId);
  //  //  orderDobirkaFinished(ctx);
  //  //  ctx.Save();
  //  //  new CommerceEvent(CommerceEventIds.OrderCopy, ord.Id.ToString() + "(stará objednávka " + orderId.ToString() + ")", ord.Id).Raise();
  //  //  return ctx;
  //  //}

  //  //public static OrderDBContext OnDobirkaZrusit(int orderId) {
  //  //  OrderDBContext ctx = new OrderDBContext(orderId);
  //  //  new CommerceEvent("Zrušení dobírky", ctx.OrderId).Raise();
  //  //  setOrderStatus(ctx, OrderStatus.Zrusena);
  //  //  ctx.Save();
  //  //  return ctx;
  //  //}

  //  //public static OrderDBContext OnZrusitProformu(int orderId) {
  //  //  OrderDBContext ctx = new OrderDBContext(orderId);
  //  //  new CommerceEvent("Zrušení proformy", ctx.OrderId).Raise();
  //  //  setOrderStatus(ctx, OrderStatus.Zrusena);
  //  //  ctx.Save();
  //  //  return ctx;
  //  //}

  //  //public static void OnEBankaCheck() {
  //  //  //Zjisteni stavu plateb u eBanky
  //  //  List<int> errors = new List<int>();
  //  //  List<int> OKList = new List<int>();
  //  //  LMComLib.eBanka.PaymentResponse.VerifyPaid(OKList, errors);
  //  //  //Zmena stavu u Order v databazi
  //  //  LMComDataContext db = Machines.getContext();
  //  //  foreach (int id in OKList) {
  //  //    Comm_Order ord = db.Comm_Orders.Single<Comm_Order>(o => o.Id == id);
  //  //    setOrderStatus(ord,
  //  //      ord.ContentType == (short)OrderContentType.Electronic ? OrderStatus.Hotovo : OrderStatus.Zaplaceno);
  //  //  }
  //  //  foreach (int id in errors) {
  //  //    Comm_Order ord = db.Comm_Orders.Single<Comm_Order>(o => o.Id == id);
  //  //    setOrderStatus(ord, OrderStatus.eBankaError);
  //  //  }
  //  //  db.SubmitChanges();
  //  //  if (errors.Count == 0) return;
  //  //  //Mail o eBanka chybe
  //  //  Emailer em = new Emailer();
  //  //  em.PlainText = "Zkontroluj eBanka Errors!!!";
  //  //  em.Subject = "LANGMaster Intranet varování";
  //  //  em.From = "obchod@langmaster.cz";
  //  //  string[] ms = System.Configuration.ConfigurationManager.AppSettings["Email.EBankaError"].Split(',');
  //  //  foreach (string m in ms)
  //  //    em.AddTo(m);
  //  //  em.SendMail();
  //  //}

  //  public enum PaymentCheckResult {
  //    ok,
  //    alreadyPayed,
  //    wrongPrice,
  //    varSymbNotFound,
  //    exception,
  //  }

  //  //public static PaymentCheckResult OnPaymentCheck(int orderId, Currency? price, bool sendInvoice) {
  //  //  OrderDBContext ctx = new OrderDBContext(orderId);
  //  //  if (!ctx.OrderDbExists) return PaymentCheckResult.varSymbNotFound;
  //  //  if (ctx.OrderDb.Status != (short)OrderStatus.CekaNaPlatbu && ctx.OrderDb.Status != (short)OrderStatus.DobirkaOdeslana) return PaymentCheckResult.alreadyPayed;
  //  //  if (price != null) {
  //  //    Currency pr = (Currency)price;
  //  //    if (ctx.Order.PriceTax < pr.Price(SubDomains.no, ProductLicenceType.box) || ctx.Order.CurrType != pr.Typ) return PaymentCheckResult.wrongPrice;
  //  //  }
  //  //  //if (ctx.Order.BillMethod != BillingMethods.Prevod) return;
  //  //  onPayed(ctx, sendInvoice);
  //  //  ctx.Save();
  //  //  return PaymentCheckResult.ok;
  //  //}

  //  /*public static PaymentCheckResult OnPaymentCheck(int debugOrderId) {
  //    OrderDBContext ctx = new OrderDBContext(debugOrderId);
  //    if (ctx.OrderDb.Status != (short)OrderStatus.CekaNaPlatbu && ctx.OrderDb.Status != (short)OrderStatus.DobirkaOdeslana) return PaymentCheckResult.alreadyPayed;
  //    onPayed(ctx, false);
  //    ctx.Save();
  //    return PaymentCheckResult.ok;
  //  }*/

  //  //public static void SendLicence(int orderId) {
  //  //  OrderDBContext ctx = new OrderDBContext(orderId);
  //  //  switch (ctx.Order.ContentType) {
  //  //    case OrderContentType.Both:
  //  //    case OrderContentType.Electronic:
  //  //      sendLicence(ctx); break;
  //  //    default:
  //  //      break;
  //  //  }
  //  //}

  //  /*public static bool IsPaid(int varSymbol, Order ord) {
  //    //TODO LMCOM2
  //    return false;
  //  }

  //  public static void OnPaymentCheck() {
  //    LMComDataContext db = Machines.getContext();
  //    var orderIds = db.Comm_Orders.Where(ord => ord.Status == (short)OrderStatus.CekaNaPlatbu || ord.Status == (short)OrderStatus.DobirkaOdeslana).Select(ord => ord.Id).ToArray();
  //    //orderIds = new int[] { 152621 };
  //    foreach (int orderId in orderIds) {
  //      OrderDBContext ctx = new OrderDBContext(orderId);
  //      if (IsPaid(ctx.OrderId, ctx.Order)) {
  //        if (string.IsNullOrEmpty(ctx.Profile.Email)) {
  //          Logging.Trace(System.Diagnostics.TraceLevel.Error, TraceCategory.Commerce, "Missing mail, var.symb = {0}", ctx.OrderId);
  //          continue;
  //        }
  //        if (ctx.Order.BillMethod == BillingMethods.Prevod)
  //          onPayed(ctx, true);
  //        else if (ctx.Order.BillMethod == BillingMethods.Dobirka) {
  //          if (ctx.Order.ContentType == OrderContentType.Electronic)
  //            sendLicence(ctx);
  //          sendDiscount(ctx);
  //          setOrderStatus(ctx, OrderStatus.Hotovo);
  //        }
  //        ctx.Save();
  //      }
  //    }
  //  }*/

  //  //public static OrderDBContext stringToContext(int orderId) {
  //  //  //int orderId;
  //  //  //if (!int.TryParse(orderIdStr, out orderId)) throw new Exception();
  //  //  return new OrderDBContext(orderId);
  //  //}

  //  //public static bool OnElectronicPaymentFinished(OrderDBContext ctx) {
  //  //  //Order.setInstance(ctx.Order);
  //  //  onPayed(ctx, true);
  //  //  //MailSender.sendMail(MailTypes.OrderAccepted_Faktura, ctx.Order.Site, ctx.Order.Lang, ctx.Profile.Email, ctx);
  //  //  ctx.Save();
  //  //  return true;
  //  //}

  //  //public static void archiveInvoice(XInvoice info, byte[] data, bool isStorno) {
  //  //  try {
  //  //    Emailer em = new Emailer();
  //  //    em.Subject = string.Format("{0} {1} {2} {3}", info.ico, info.site, DateTime.UtcNow.ToString("yyyy/MM"), info.id);
  //  //    em.From = "obchod@langmaster.cz";
  //  //    em.AddTo(archiveEMail);
  //  //    Emailer.Attachment att = new Emailer.Attachment("Invoice_" + info.id + ".pdf", data, "application/pdf");
  //  //    em.AddAttachment(att);
  //  //    em.SendMail();
  //  //  } catch (Exception exp) {
  //  //    Logging.Trace(TraceLevel.Error, TraceCategory.All, "Cannot archiveInvoice: " + exp.Message);
  //  //  }
  //  //} static string archiveEMail = ConfigurationManager.AppSettings["Fact.ArchiveEMail"];


  //  //static void onPayed(OrderDBContext ctx, bool sendInvoice) {
  //  //  try {
  //  //    if (ctx.Order.BillMethod == BillingMethods.Dobirka) {
  //  //      ctx.orderDb.PaymentDate = DateTime.UtcNow.ToUniversalTime();
  //  //      setOrderStatus(ctx, OrderStatus.Hotovo);
  //  //      return;
  //  //    }
  //  //    //Optimalizace 5.5.2011
  //  //    //if (ctx.OrderDb.Status == (short)OrderStatus.Hotovo || ctx.OrderDb.Status == (short)OrderStatus.Zaplaceno) return;

  //  //    if (ctx.Order.BillMethod == BillingMethods.eBanka)
  //  //      setOrderStatus(ctx, OrderStatus.eBankaZaplaceno);
  //  //    else
  //  //      setOrderStatus(ctx, OrderStatus.Zaplaceno);
  //  //    //Faktura
  //  //    //try {
  //  //    ProsperLib.createInvoice(ctx, DocumentType.invoice/*, ctx.Order.BillMethod == BillingMethods.Prevod*/);
  //  //    //ProsperLib.refreshInvoicePDF(ctx, false, ctx.Order.BillMethod == BillingMethods.Prevod);
  //  //    //} catch { }
  //  //    if (sendInvoice) {
  //  //      MailSender.sendMail(MailTypes.OrderAccepted_Faktura, ctx.Order.Site, ctx.Order.SubSite, ctx.Order.Lang, ctx.Profile.Email, ctx);
  //  //      /*switch (ctx.Order.BillMethod) {
  //  //        case BillingMethods.Dobirka:
  //  //          XInvoice inv = XmlUtils.StringToObject<XInvoice>(ctx.OrderDb.InvoiceNew);
  //  //          byte[] data = ProsperLib.printInvoiceNew(inv).ToArray();
  //  //          Intranet.archiveInvoice(inv, data, false);
  //  //          break;
  //  //        default:
  //  //          MailSender.sendMail(MailTypes.OrderAccepted_Faktura, ctx.Order.Site, ctx.Order.SubSite, ctx.Order.Lang, ctx.Profile.Email, ctx);
  //  //          break;
  //  //      }*/
  //  //    }
  //  //    ctx.orderDb.PaymentDate = DateTime.UtcNow.ToUniversalTime();
  //  //    //Dle obsahu košíku
  //  //    sendDiscount(ctx);
  //  //    switch (ctx.Order.ContentType) {
  //  //      case OrderContentType.Electronic:
  //  //        //generateLicence(ctx);
  //  //        sendLicence(ctx);
  //  //        if (ctx.Order.BillMethod != BillingMethods.eBanka)
  //  //          setOrderStatus(ctx, OrderStatus.Hotovo);
  //  //        break;
  //  //      case OrderContentType.Box:
  //  //        if (ctx.Order.ShipMethod == ShippingMethods.posta)
  //  //          createTask(ctx, TaskType.PoslatZboziPosta);
  //  //        else if (ctx.Order.ShipMethod == ShippingMethods.PPL)
  //  //          createTask(ctx, TaskType.PoslatZboziPPL);
  //  //        else if (ctx.Order.Id >= LMComDataProvider.fakeOrderIdStart)
  //  //          setOrderStatus(ctx, OrderStatus.Hotovo);
  //  //        break;
  //  //      case OrderContentType.Both:
  //  //        //generateLicence(ctx);
  //  //        sendLicence(ctx);
  //  //        if (ctx.Order.ShipMethod == ShippingMethods.posta)
  //  //          createTask(ctx, TaskType.PoslatZboziPosta);
  //  //        else if (ctx.Order.ShipMethod == ShippingMethods.PPL)
  //  //          createTask(ctx, TaskType.PoslatZboziPPL);
  //  //        else if (ctx.Order.Id >= LMComDataProvider.fakeOrderIdStart)
  //  //          setOrderStatus(ctx, OrderStatus.Hotovo);
  //  //        break;
  //  //    }
  //  //  } catch (Exception exp) {
  //  //    new CommerceEvent(CommerceEventIds.Error, "Error " + exp.Message + exp.StackTrace, ctx.Order.Id).Raise();
  //  //    Logging.Trace(System.Diagnostics.TraceLevel.Error, TraceCategory.Commerce, "Pay Error = {0}", ctx.Order.Id);
  //  //  }
  //  //}

  //  //static void generateLicence(OrderDBContext ctx) {
  //  //  List<string> keyStr = null;
  //  //  foreach (OrderItem item in ctx.Order.Items) {
  //  //    if (!item.Licence.LicenceOnly) continue;
  //  //    if (keyStr == null) keyStr = new List<string>(); else keyStr.Clear();
  //  //    RegLicenceServer.generateLicenceKey(
  //  //      delegate(RegLicenceObj obj) { keyStr.Add(obj.AsString); },
  //  //      //ctx.Order.Site, item.Licence.CourseId, item.Quantity, item.Licence.Licence, item.ExternalPrice);
  //  //      ctx.Order.Lang, item.Licence.CourseId, item.Quantity, item.Licence.Licence, item.ExternalPrice);
  //  //    item.LicKey = keyStr.ToArray(); //item.Quantity klicu
  //  //  }
  //  //}

  //  /*static string registeredFlag(SendLicenceKeyPar par) {
  //    if (par.regObj.Scena != RegLicenceScena.full && par.regObj.Scena != RegLicenceScena.date && par.regObj.Scena != RegLicenceScena.fixStartDate) return null;
  //    if (par.Context.Profile.Anonymous) return null;
  //    return "reg_";
  //  }*/

  //  //static void sendLicence(OrderDBContext ctx) {
  //  //  //RegLicenceObj regObj = null;
  //  //  foreach (OrderItem item in ctx.Order.Items)
  //  //    if (item.LicKey != null)
  //  //      foreach (string licKey in item.LicKey) {
  //  //        //if (regObj == null) regObj = new RegLicenceObj();
  //  //        //regObj.AsString = licKey;
  //  //        //SendLicenceKeyPar par = new SendLicenceKeyPar(item, regObj, licKey, ctx);
  //  //        //SendLicenceKeyPar par = new SendLicenceKeyPar(item.Licence.CourseId, item.Licence.Licence == ProductLicenceType.download, licKey, item.Licence.ShortTitle, item.Licence.MyProd.debugDownloadUrl());
  //  //        ET_SiteMapId prodType = item.Licence.MyProd.Owner.ET_SiteMapIdEx(item.Licence.CourseId);
  //  //        if (ProductLicence.isPoslechy(item.Licence.CourseId)) prodType = ET_SiteMapId.talknowaudio;
  //  //        MailSender.sendMail(
  //  //          MailTypes.sd_SendLicenceKey,
  //  //          ctx.Order.Site,
  //  //          ctx.Order.SubSite,
  //  //          ctx.Order.Lang,
  //  //          ctx.Profile.Email,
  //  //          new SendLicenceKeyPar(/*item.Licence.CourseId,*/
  //  //            item.Licence.Licence == ProductLicenceType.download,
  //  //            prodType,
  //  //            licKey,
  //  //            item.Licence.ShortTitle,// + " (" + item.Licence.CourseId.ToString() + ")",
  //  //            prodType == ET_SiteMapId.talknowaudio ? item.Licence.MyProd.debugUrl(ctx.Order.SubSite) : item.Licence.MyProd.debugDownloadUrl(ctx.Order.SubSite),
  //  //            ctx.Order.Id));
  //  //      }
  //  //}

  //  //public static void OnFinishTasks(byte[] bytes) {
  //  //  TaskSummary summary = (TaskSummary)XmlUtils.BytesToObject(bytes, typeof(TaskSummary));
  //  //  summary.FinishAt = DateTime.UtcNow.ToUniversalTime();
  //  //  foreach (int id in summary.TaskIds)
  //  //    finishTask(id, summary.BatchId);
  //  //  new IntranetEvent("Ukončení dávky", summary.BatchId).Raise();
  //  //}

  //  /*public static void OnRefreshPayPalReports() {
  //    foreach (int typ in new int[] { LMComDataProvider.uiPayPalReportKc })
  //      ProsperLib.refreshPayPalReport(typ);
  //  }*/

  //  //public static int OnPrepareTasks(LMComData2.Task[] tasks, Stream output) {
  //  //  int batchId = (int)LMComDataProvider.getUniqueId(LMComDataProvider.uiIntranetBatch);
  //  //  TaskSummary summary = new TaskSummary();
  //  //  summary.StartAt = DateTime.UtcNow.ToUniversalTime();
  //  //  summary.BatchId = batchId;
  //  //  //summary.SelfFileName = basicPath + "Hotovo.xml";
  //  //  using (ZipStream zip = new ZipStream(output)) {
  //  //    foreach (TaskType tp in new TaskType[] { TaskType.DobirkaPosta, TaskType.DobirkaPPL, TaskType.PoslatZboziPosta, TaskType.PoslatZboziPPL }) {
  //  //      int cnt = 0;
  //  //      string dir = tp.ToString() + @"\";
  //  //      MemoryStream ms = new MemoryStream();

  //  //      using (XmlWriter taskWr = XmlWriter.Create(ms)) {
  //  //        ExcelExport.Start(taskWr);
  //  //        {
  //  //          ExcelExport.HeaderStart(taskWr);
  //  //          {
  //  //            ExcelExport.HeaderItem(taskWr, "Num");
  //  //            ExcelExport.HeaderItem(taskWr, "VarSym");
  //  //            ExcelExport.HeaderItem(taskWr, "TaskId");
  //  //            {
  //  //              ExcelExport.HeaderItem(taskWr, "CompanyName");
  //  //              ExcelExport.HeaderItem(taskWr, "FirstName");
  //  //              ExcelExport.HeaderItem(taskWr, "LastName");
  //  //              ExcelExport.HeaderItem(taskWr, "Street");
  //  //              ExcelExport.HeaderItem(taskWr, "City");
  //  //              ExcelExport.HeaderItem(taskWr, "Zip");
  //  //              ExcelExport.HeaderItem(taskWr, "Phone");
  //  //            }
  //  //            {
  //  //              ExcelExport.HeaderItem(taskWr, "Price");
  //  //              ExcelExport.HeaderItem(taskWr, "PriceHal");
  //  //              ExcelExport.HeaderItem(taskWr, "Slovy");
  //  //            }
  //  //          }
  //  //          ExcelExport.HeaderEnd(taskWr);
  //  //        }
  //  //        foreach (LMComData2.Task row in tasks.Where(t => t.Type == (short)tp)) {
  //  //          //Evidence task ID pro OnFinishTasks
  //  //          //wr.Write(row["Id"]); wr.Write(',');
  //  //          summary.TaskIds.Add(row.Id);
  //  //          OrderDBContext ctx = new OrderDBContext((int)row.OrderId);
  //  //          //Faktura pro dobirku az nyni
  //  //          if (tp == TaskType.DobirkaPosta || tp == TaskType.DobirkaPPL) {
  //  //            ProsperLib.createInvoice(ctx, DocumentType.invoice);
  //  //            //ProsperLib.refreshInvoicePDF(ctx, false);
  //  //            ctx.Save();
  //  //          }
  //  //          //Export PDF
  //  //          byte[] inv = ctx.OrderDb.InvoiceX;
  //  //          if (inv != null) zip.AddFileToZip(inv, dir + cnt.ToString("000") + ".pdf", DateTime.UtcNow.ToUniversalTime());
  //  //          //Export do excelu
  //  //          ExcelExport.RowStart(taskWr);
  //  //          {
  //  //            ExcelExport.DataItem(taskWr, ExcelFormat.Number, cnt);
  //  //            ExcelExport.DataItem(taskWr, ExcelFormat.Number, ctx.OrderDb.Id);
  //  //            ExcelExport.DataItem(taskWr, ExcelFormat.Number, row.Id);
  //  //            Address addr = ctx.Profile.HasShippingAddress ? ctx.Profile.ShippingAddress : ctx.Profile.Address;
  //  //            {
  //  //              ExcelExport.DataItem(taskWr, ExcelFormat.String, addr.CompanyName);
  //  //              ExcelExport.DataItem(taskWr, ExcelFormat.String, addr.FirstName);
  //  //              ExcelExport.DataItem(taskWr, ExcelFormat.String, addr.LastName);
  //  //              ExcelExport.DataItem(taskWr, ExcelFormat.String, addr.Street);
  //  //              ExcelExport.DataItem(taskWr, ExcelFormat.String, addr.City);
  //  //              ExcelExport.DataItem(taskWr, ExcelFormat.String, addr.Zip);
  //  //              ExcelExport.DataItem(taskWr, ExcelFormat.String, ctx.Profile.Phone);
  //  //            }
  //  //            {
  //  //              int price = (int)ctx.Order.PriceTax;
  //  //              int hal = (int)ctx.Order.PriceTax * 100;
  //  //              hal = hal % 100;
  //  //              ExcelExport.DataItem(taskWr, ExcelFormat.Number, price);
  //  //              ExcelExport.DataItem(taskWr, ExcelFormat.Number, hal);
  //  //              //LM16
  //  //              //ExcelExport.DataItem(taskWr, ExcelFormat.String, NumberToText.fncNum2Text(price));
  //  //            }
  //  //          }
  //  //          ExcelExport.RowEnd(taskWr);
  //  //          cnt++;
  //  //        }
  //  //        ExcelExport.End(taskWr);
  //  //      }
  //  //      zip.AddFileToZip(ms.ToArray(), dir + "Tasks.xml", DateTime.UtcNow);
  //  //    }
  //  //    zip.AddFileToZip(XmlUtils.ObjectToBytes(summary), "Hotovo.xml", DateTime.UtcNow.ToUniversalTime());
  //  //  }
  //  //  new IntranetEvent("Stažení dávky", batchId).Raise();
  //  //  return batchId;
  //  //}

  //}

}
