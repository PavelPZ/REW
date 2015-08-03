using System;
using System.Web;
using CookComputing.XmlRpc;

namespace LMComLib.Seznam {
  /// <summary>
  /// Summary description for ticket
  /// </summary>
  public class ticket {
    public struct createResponse {
      public int status;              //Vysledek operace; 200=Ok
      public string statusMessage;    //Textovy popis vysledku volani
      public string ticket;          //Hodnota tiketu
    }

    public struct checkResponse {
      public int status;             //Výsledek operace; 200=Ok, 402=Nevalidní tiket
      public string statusMessage;
      public int userId;              //Id uživatele, pro kterého ticket platí
      public System.Boolean remember;        //Pøíznak "remember", který tvùrce nastavil
    }

    //[XmlRpcUrl(Utils.ProxyUrl)]
    public interface ITicket : IXmlRpcProxy {
      /// <summary>
      /// Voláním metody lze vytvoøit èasovì omezený tiket spojený se zadaným uživatelem. Tikety se vytváøejí tam, 
      /// kde je potøeba výmìna ovìøeného userId mezi dvìma systémy (pøechod pøihlášeného uživatele mezi službami na rùzných doménách).
      /// </summary>
      /// <param name="userId">Id uzivatele</param>
      /// <param name="remember">priznak pamatovani si prihlaseni</param>
      [XmlRpcMethod("ticket.create")]
      createResponse create(int userId, System.Boolean remember);

      /// <summary>
      /// Voláním metody dojde k ovìøení tiketu a vráceni informace, zda je (ještì) validní, pro jakého uživatele (userId) byl 
      /// vystaven a pøíznak "remeber", který nastavil tvùrce tiketu.
      /// </summary>
      /// <param name="ticket">Øetìzec tiketu</param>
      /// <returns></returns>
      [XmlRpcMethod("ticket.check")]
      checkResponse check(string ticket);
    }
  }
}