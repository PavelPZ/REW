using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Xml.Serialization;
using System.Data.Linq;
using System.Data.Linq.Mapping;
using System.Linq;

using LMNetLib;
using LMComData2;

namespace LMComLib {
  public enum DiscountGeneratorType {
    //Modifikuje pouze Discount.UniqueId
    Simple,
  }

  //public class Discount {

  //  /// <summary>
  //  /// Validita kuponu pro urcitou site
  //  /// </summary>
  //  public Domains? Site;
  //  /// <summary>
  //  /// Jednoznacna identifikace kuponu: kupon je ulozen v databazi:
  //  /// - v databazi je ancestor kuponu s predvyplnenymi poli
  //  /// - v databazi je citac pouziti kuponu (napr. jednou, unlimited apod.)
  //  /// </summary>
  //  public int? UniqueId;
  //  /// <summary>
  //  /// Velikost slevy v penezich
  //  /// </summary>
  //  public Currency? Amount;
  //  /// <summary>
  //  /// Velikost slevy v procentech
  //  /// </summary>
  //  public int? Percent;
  //  /// <summary>
  //  /// Kdy prestane kupon platit. Null: unlimited
  //  /// </summary>
  //  public DateTime? ValidTo;
  //  /// <summary>
  //  /// Identifikace produktu, na ktere sleva plati. Null: na vse.
  //  /// </summary>
  //  public int[] Products;
  //  /// <summary>
  //  /// Kupon se da kombinovat s jinymi kupony
  //  /// </summary>
  //  public bool? CanCombine = false;

  //  /// <summary>
  //  /// DiscPrototype.title
  //  /// </summary>
  //  [XmlIgnore]
  //  public string Title;

  //  /// <summary>
  //  /// Vrati friendly titulek kuponu
  //  /// </summary>
  //  public string getFriendlyTitle(urlInfo ui) {
  //    string res = Title;
  //    res += " (";
  //    if (Amount != null) {
  //      int TaxPercent = Order.ActTaxPercent;
  //      res += "kupón v hodnotě ";
  //      double pr = Order.RoundTotalCurrency(((Currency)Amount).PriceTax(TaxPercent, SubDomains.no, ProductLicenceType.box));
  //      res += ui==null ? pr.ToString("C") : ui.priceText(pr);
  //    } else if (Percent != null) {
  //      res += "hodnota kupónu ";
  //      res += ((int)Percent).ToString();
  //      res += "% z ceny objednávky";
  //    }
  //    if (ValidTo != null)
  //      res += ", platí do " + ((DateTime)ValidTo).ToShortDateString();
  //    return res + ")";
  //  }

  //  /// <summary>
  //  /// Pocet volnych kuponu (DiscPrototype.MaxCounter-Discount.Counter), plni se v Decode
  //  /// </summary>
  //  [XmlIgnore]
  //  public int Counter;

  //  const int encryptKey = 31920;
  //  /// <summary>
  //  /// Kodovani do stringu
  //  /// byte 0..3: UniqueId: TODO Webtica - ma byt 0..23
  //  /// byte 4: Site
  //  /// byte 5, bits:
  //  /// 25: Maska Amount (4 byte, prvni byte je mena, dalsi 3 byte je mnozstvi v halirich)
  //  /// 26: Maska Percent (1 byte)
  //  /// 27: Maska ValidTo (2 byte: pocet dni po 1.1.2007)
  //  /// 28: CanCombine
  //  /// 29,30,31,32: 0..16 Products (kazdy produkt 2 byte, max. 30 bytes)
  //  /// dale data pro Amount, Percent, ValidTo
  //  /// </summary>
  //  /// <returns></returns>
  //  [XmlIgnore]
  //  public string AsString {
  //    get {
  //      byte[] res = new byte[50];
  //      int nextIdx = 0;
  //      byte[] arr = BitConverter.GetBytes((int)UniqueId); res[nextIdx++] = arr[0]; res[1] = arr[nextIdx++]; res[nextIdx++] = arr[2]; res[nextIdx++] = arr[3];
  //      //res[nextIdx++] = (byte)Site;
  //      int flagIdx = nextIdx++;
  //      res[flagIdx] = 0;
  //      if (this.CanCombine != null && ((bool)this.CanCombine))
  //        res[flagIdx] |= 0x10;
  //      if (this.Amount != null) {
  //        res[flagIdx] |= 0x80;
  //        res[nextIdx++] = (byte)((Currency)Amount).Typ;
  //        int amount = Convert.ToInt32 (((Currency)Amount).Amount * 100);
  //        arr = BitConverter.GetBytes(amount); res[nextIdx++] = arr[0]; res[nextIdx++] = arr[1]; res[nextIdx++] = arr[2];
  //      }
  //      if (this.Percent != null) {
  //        res[flagIdx] |= 0x40;
  //        res[nextIdx++] = (byte)Percent;
  //      }
  //      if (this.ValidTo != null) {
  //        res[flagIdx] |= 0x20;
  //        TimeSpan ts = ((DateTime)ValidTo).Subtract(LowUtils.startDate);
  //        arr = BitConverter.GetBytes((UInt16)ts.TotalDays);
  //        res[nextIdx++] = arr[0]; res[nextIdx++] = arr[1];
  //      }
  //      if (this.Products != null) {
  //        res[flagIdx] |= (byte)(Products.Length & 0x0000000F);
  //        for (int i = 0; i < Products.Length; i++) {
  //          arr = BitConverter.GetBytes((UInt16)Products[i]);
  //          res[nextIdx++] = arr[0]; res[nextIdx++] = arr[1];
  //        }
  //      }
  //      return ConvertNew.ToBase32(res, 0, nextIdx, encryptKey, true);
  //    }
  //    set {
  //      try {
  //        UniqueId = null; Site = null; CanCombine = null; Amount = null; Percent = null; ValidTo = null; Products = null;
  //        byte[] res = ConvertNew.FromBase32(value, encryptKey);
  //        int nextIdx = 0;
  //        byte[] arr = new byte[4]; arr[0] = res[nextIdx++]; arr[1] = res[nextIdx++]; arr[2] = res[nextIdx++]; arr[3] = res[nextIdx++];
  //        UniqueId = BitConverter.ToInt32(arr, 0);
  //        //Site = (Domains)res[nextIdx++];
  //        int flagIdx = nextIdx++;
  //        if ((res[flagIdx] & 0x10) != 0)
  //          this.CanCombine = true;
  //        if ((res[flagIdx] & 0x80) != 0) {
  //          Currency curr = new Currency();
  //          curr.Typ = (CurrencyType)res[nextIdx++];
  //          arr[0] = res[nextIdx++]; arr[1] = res[nextIdx++]; arr[2] = res[nextIdx++]; arr[3] = 0;
  //          curr.Amount = (double) BitConverter.ToInt32(arr, 0) / 100;
  //          Amount = curr;
  //        }
  //        if ((res[flagIdx] & 0x40) != 0) {
  //          Percent = (byte)res[nextIdx++];
  //        }
  //        if ((res[flagIdx] & 0x20) != 0) {
  //          UInt16 days = BitConverter.ToUInt16(res, nextIdx);
  //          nextIdx += 2;
  //          ValidTo = LowUtils.startDate.AddDays(days);
  //        }
  //        byte products = (byte)(res[flagIdx] & 0x0F);
  //        if (products > 0) {
  //          Products = new int[products];
  //          for (int i = 0; i < products; i++) {
  //            Products[i] = BitConverter.ToUInt16(res, nextIdx);
  //            nextIdx += 2;
  //          }
  //        }
  //      } catch {
  //        throw new Exception("Špatný formát kupónu, zapsali jste jej opravdu správně?");
  //      }
  //    }
  //  }
  //  /// <summary>
  //  /// nacteni ze stringu
  //  /// </summary>
  //  static Discount DecodeLow(string code) {
  //    Discount res = new Discount();
  //    res.AsString = code;
  //    return res;
  //  }

  //  static LMComData2.Discount getDiscountDB(int id, out Disc_Prototype prototype) {
  //    return getDiscountDB(Machines.getContext(), id, out prototype);
  //  }

  //  static LMComData2.Discount getDiscountDB(LMComData2.LMComDataContext db, int id, out Disc_Prototype prototype) {
  //    LMComData2.Discount disc = db.Discounts.Single<LMComData2.Discount>(d => d.Id == id);
  //    prototype = disc.Disc_Prototype;
  //    return disc;
  //  }

  //  /// <summary>
  //  /// nacteni ze stringu a zkombinovani s hodnotami z databaze
  //  /// </summary>
  //  public static Discount Decode(string code) {
  //    //dekodovani Discount z code
  //    Discount res = DecodeLow(code);
  //    Disc_Prototype prototype;
  //    LMComData2.Discount disc = getDiscountDB((int)res.UniqueId, out prototype);
  //    res.Counter = prototype.MaxCount - disc.Counter;
  //    Discount ancestor = (Discount)XmlUtils.StringToObject(prototype.Instance, typeof(Discount));
  //    ancestor.Title = prototype.Title;
  //    ancestor.UniqueId = res.UniqueId;
  //    if (res.Site != null) ancestor.Site = res.Site;
  //    if (ancestor.Site == null) throw new Exception("Missing Discount.Site field value");
  //    if (res.Amount != null) ancestor.Amount = res.Amount;
  //    if (res.Percent != null) ancestor.Percent = res.Percent;
  //    if (res.ValidTo != null) ancestor.ValidTo = res.ValidTo;
  //    if (res.Products != null) ancestor.Products = res.Products;
  //    if (res.CanCombine != null) ancestor.CanCombine = res.CanCombine;
  //    if (ancestor.CanCombine == null) ancestor.CanCombine = false;
  //    return ancestor;
  //  }

  //  /// <summary>
  //  /// Predbezne testovani, zdali je discount validni
  //  /// </summary>
  //  public static bool discountValid(int? id) {
  //    if (id == null) return true; //ladeni
  //    Disc_Prototype prototype;
  //    LMComData2.Discount disc = getDiscountDB((int) id, out prototype);
  //    return prototype.MaxCount - disc.Counter > 0;
  //  }

  //  /// <summary>
  //  /// pouziti Discount kuponu: zmeni se ev Counter v databazi
  //  /// </summary>
  //  public static bool UseDiscounts(OrderDBContext ctx, List<Discount> discounts) {
  //    lock (typeof(Discount)) {
  //      foreach (Discount disc in discounts) {
  //        if (disc.UniqueId == null) continue;
  //        Disc_Prototype prototype;
  //        LMComData2.Discount discRec = getDiscountDB(ctx.db, (int)disc.UniqueId, out prototype);
  //        if (prototype.MaxCount - discRec.Counter <= 0) {
  //          new CommerceEvent(CommerceEventIds.Error, "UseDiscounts error", ctx.OrderId).Raise();
  //          return false;
  //        }
  //        discRec.Counter = discRec.Counter + 1;
  //        OrderDiscount od = new OrderDiscount();
  //        ctx.db.OrderDiscounts.InsertOnSubmit(od);
  //        od.IdOrder = ctx.OrderId;
  //        od.IdDiscount = (int)disc.UniqueId;
  //      }
  //      return true;
  //    }
  //  }


  //  public static void MoveDiscounts(int oldId, int newId, LMComDataContext db) {
  //    db.ExecuteCommand("UPDATE OrderDiscount SET IdOrder=" + newId + " WHERE IdOrder=" + oldId);
  //  }

  //  static Dictionary<Domains, int> orderDiscountsProtypes = new Dictionary<Domains, int>();

  //  /// <summary>
  //  /// Nacte identifikaci DiscPrototype, odpovidajici danemu site a IsOrderDiscount=true
  //  /// Nacachuje do orderDiscountsProtypes.
  //  /// Kdyz neexistuje tak zalozi DiscPrototype.
  //  /// </summary>
  //  static int orderDiscountsProtypeId(Domains site) {
  //    lock (typeof(Discount)) {
  //      int res;
  //      if (orderDiscountsProtypes.TryGetValue(site, out res)) return res; //jiz v orderDiscountsProtypes
  //      //nacteni Prototypu
  //      LMComDataContext db = Machines.getContext();
  //      Disc_Prototype prot = db.Disc_Prototypes.SingleOrDefault<Disc_Prototype>(dp => dp.Site==(short)site && dp.isOrderDiscount);
  //      if (prot==null) //jeste neni v databazi
  //      {
  //        Discount disc = new Discount();
  //        disc.Site = site;
  //        disc.CanCombine = true;
  //        prot = new LMComData2.Disc_Prototype();
  //        db.Disc_Prototypes.InsertOnSubmit(prot);
  //        prot.isOrderDiscount = true;
  //        prot.Created = DateTime.UtcNow.ToUniversalTime();
  //        prot.Instance = XmlUtils.ObjectToString(disc);
  //        prot.Site = (short)site;
  //        prot.Title = "Věrnostní sleva";
  //        prot.SingleInstance = false;
  //        prot.MaxCount = 1;
  //        prot.Generator = (short) DiscountGeneratorType.Simple;
  //        db.SubmitChanges();
  //      }

  //      res = prot.Id;
  //      orderDiscountsProtypes.Add(site, res); //dej do orderDiscountsProtypes
  //      return res;
  //    }
  //  }
  //  /// <summary>
  //  /// Vrati slevovy kupon, na ktery ma uzivatel narok pri nakupu zbozi (pro dany site, menu a vysi slevy)
  //  /// </summary>
  //  public static string GenerateOrderDiscount(Domains site, double amount, CurrencyType typ) {
  //    //zalozeni databazove polozky kvuli hlidani jednoznacnosti pouziti
  //    LMComDataContext db = Machines.getContext();
  //    LMComData2.Discount disc = new LMComData2.Discount();
  //    db.Discounts.InsertOnSubmit(disc);
  //    disc.Created = DateTime.UtcNow.ToUniversalTime();
  //    disc.Counter = 0;
  //    disc.PrototypeId = orderDiscountsProtypeId(site);
  //    db.SubmitChanges();
  //    //vytvoreni objektu
  //    Discount res = new Discount();
  //    res.Amount = new Currency(typ, amount, true);
  //    res.UniqueId = disc.Id;
  //    //res.Site = site;
  //    return res.AsString;
  //  }

  //}

  /*public static class Provisions {
    public static SupplierId getSupplierId(Domains site, ProfileData profile) {
      switch (site) {
        case Domains.cz: return SupplierId.LANGMaster;
        case Domains.sz: return SupplierId.Seznam;
        default: return SupplierId.LANGMaster;
      }
    }
  }*/
}
