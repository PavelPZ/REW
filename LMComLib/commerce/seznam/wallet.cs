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
      /// Vr�t� informace o v��i kreditu u�ivatele a datum a �as jeho posledn� transakce
      /// </summary>
      /// <param name="userId">Id uzivatele</param>
      /// <returns></returns>
      [XmlRpcMethod("wallet.createTransaction")]
      getAttributesResponse getAttributes(int userId);

      /// <summary>
      /// Vol�n�m metody lze vytvo�it transakci nad kreditem u�ivatele userId. Transakce znamen� ode�ten� ��stky amount z kreditu, proto hodnota amount mus� b�t z�porn� re�ln� ��slo (zaokrouhlen� na 2 desetinn� m�sta). Pokud m� u�ivatel dostate�n� kredit, dojde k jeho ode�ten� z ��tu, ale transakce z�stane v syst�mu nepotvrzen�. Volaj�c� aplikace mus� n�sledn� pou��t wallet.commitTransaction nebo wallet.rollbackTransaction. 
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
      /// Ka�dou vytvo�enou transakc� je nutn� potvrdit po �sp�n�m poskytnut� placen� slu�by, �i naopak zru�it, pokud placen� slu�ba nemohla b�t poskytnuta. V kladn�m p��pad� je pro potvrzen� ur�ena tato metoda. Jej�m vol�n�m je p�edchoz� vytvo�ena transakce ozna�ena jako potvrzena, na kredit u�ivatele se ji� vol�n� nijak nevztahuje.
      /// </summary>
      /// <param name="userId">Id uzivatele</param>
      /// <param name="transId">Id vytvorene transakce, nutne pro potvrzeni ci zruseni</param>
      /// <param name="confirmCode">Nahodne vygenerovany kod nutny pro potvrzeni</param>
      /// <returns></returns>
      [XmlRpcMethod("wallet.commitTransaction")]
      commitTransactionResponse commitTransaction(int userId, int transId, string confirmCode);
      /// <summary>
      /// Ka�dou vytvo�enou transakc� je nutn� potvrdit po �sp�n�m poskytnut� placen� slu�by, �i naopak zru�it, pokud placen� slu�ba nemohla b�t poskytnuta. Pokud poskytnut� slu�by selhalo, je nutn� vr�tit u�ivateli pen�ze. Vol�n�m t�to metody dojde k tomu, �e p�vodn� transakce je potvrzena a z�rove� se vytvo�� nov� (admin) transakce, kter� u�ivateli vr�t� �erp�ny kredit.
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