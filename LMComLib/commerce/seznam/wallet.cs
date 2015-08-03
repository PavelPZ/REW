using System;
using CookComputing.XmlRpc;
namespace LMComLib.Seznam
{

  /// <summary>
  /// Summary description for wallet
  /// </summary>
  public class wallet
  {
    public struct getAttributesResponse
    {
      public int status;          // Vysledek operace (200=Ok, 404=User not found, 405=Not allowed)
      public string statusMessage;
      public double credit;        //Aktualni vyse kreditu
      public System.DateTime lastTransaction;    //Datum a cas posledni transakce
    }
    public struct createTransactionResponse
    {
      public int status; //      Vysledek operace (200=Ok, 404=Uzivatel neexistuje, 405=Not allowed, 406=Chybne argumenty,407=Nedostatecny kredit)
      public string statusMessage; //
      public int transId; //   Id vytvorene transakce, nutne pro potvrzeni ci zruseni
      public string confirmCode; //  Nahodne vygenerovany kod nutny pro potvrzeni
    }

    public struct commitTransactionResponse
    {
      public int status; //      Vysledek operace (200=Ok, 404=Transakce neexistuje, 405=Not allowed, 406=Chybna kombinace)
      public string statusMessage; //
    }

    public struct rollbackTransactionResponse
    {
      public int status; //      Vysledek operace (200=Ok, 404=Transakce neexistuje, 405=Not allowed, 406=Chybna kombinace)
      public string statusMessage; //
    }

    //[XmlRpcUrl(Utils.ProxyUrl)]
    public interface IWallet : IXmlRpcProxy
    {
      /// <summary>
      /// Vrátí informace o výši kreditu uživatele a datum a èas jeho poslední transakce
      /// </summary>
      /// <param name="userId">Id uzivatele</param>
      /// <returns></returns>
      [XmlRpcMethod("wallet.createTransaction")]
      getAttributesResponse getAttributes(int userId);

      /// <summary>
      /// Voláním metody lze vytvoøit transakci nad kreditem uživatele userId. Transakce znamená odeètení èástky amount z kreditu, proto hodnota amount musí být záporné reálné èíslo (zaokrouhlené na 2 desetinná místa). Pokud má uživatel dostateèný kredit, dojde k jeho odeètení z úètu, ale transakce zùstane v systému nepotvrzená. Volající aplikace musí následnì použít wallet.commitTransaction nebo wallet.rollbackTransaction. 
      /// </summary>
      /// <param name="userId">Id uzivatele</param>
      /// <param name="amount">Odecitana castka (zaporne cislo)</param>
      /// <param name="serviceId">Id sluzby (napr. email, sbazar, atd.)</param>
      /// <param name="clientIp">IP adresa cerpajiciho klienta</param>
      /// <param name="note">Poznamka k transakci (popis placene sluzby)</param>
      /// <returns></returns>
      [XmlRpcMethod("wallet.createTransaction")]
      createTransactionResponse createTransaction(int userId, double amount, string serviceId, string clientIp, string note);
      /// <summary>
      /// Každou vytvoøenou transakcí je nutné potvrdit po úspìšném poskytnutí placené služby, èi naopak zrušit, pokud placená služba nemohla být poskytnuta. V kladném pøípadì je pro potvrzení urèena tato metoda. Jejím voláním je pøedchozí vytvoøena transakce oznaèena jako potvrzena, na kredit uživatele se již volání nijak nevztahuje.
      /// </summary>
      /// <param name="userId">Id uzivatele</param>
      /// <param name="transId">Id vytvorene transakce, nutne pro potvrzeni ci zruseni</param>
      /// <param name="confirmCode">Nahodne vygenerovany kod nutny pro potvrzeni</param>
      /// <returns></returns>
      [XmlRpcMethod("wallet.commitTransaction")]
      commitTransactionResponse commitTransaction(int userId, int transId, string confirmCode);
      /// <summary>
      /// Každou vytvoøenou transakcí je nutné potvrdit po úspìšném poskytnutí placené služby, èi naopak zrušit, pokud placená služba nemohla být poskytnuta. Pokud poskytnutí služby selhalo, je nutné vrátit uživateli peníze. Voláním této metody dojde k tomu, že pùvodní transakce je potvrzena a zároveò se vytvoøí nová (admin) transakce, která uživateli vrátí èerpány kredit.
      /// </summary>
      /// <param name="userId">Id uzivatele</param>
      /// <param name="transId">Id vytvorene transakce, nutne pro potvrzeni ci zruseni</param>
      /// <param name="confirmCode">Nahodne vygenerovany kod nutny pro potvrzeni</param>
      /// <returns></returns>
      [XmlRpcMethod("wallet.rollbackTransaction")]
      rollbackTransactionResponse rollbackTransaction(int userId, int transId, string confirmCode);
    }
  }
}