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
      public int status;             //V�sledek operace; 200=Ok, 402=Nevalidn� tiket
      public string statusMessage;
      public int userId;              //Id u�ivatele, pro kter�ho ticket plat�
      public System.Boolean remember;        //P��znak "remember", kter� tv�rce nastavil
    }

    //[XmlRpcUrl(Utils.ProxyUrl)]
    public interface ITicket : IXmlRpcProxy {
      /// <summary>
      /// Vol�n�m metody lze vytvo�it �asov� omezen� tiket spojen� se zadan�m u�ivatelem. Tikety se vytv��ej� tam, 
      /// kde je pot�eba v�m�na ov��en�ho userId mezi dv�ma syst�my (p�echod p�ihl�en�ho u�ivatele mezi slu�bami na r�zn�ch dom�n�ch).
      /// </summary>
      /// <param name="userId">Id uzivatele</param>
      /// <param name="remember">priznak pamatovani si prihlaseni</param>
      [XmlRpcMethod("ticket.create")]
      createResponse create(int userId, System.Boolean remember);

      /// <summary>
      /// Vol�n�m metody dojde k ov��en� tiketu a vr�ceni informace, zda je (je�t�) validn�, pro jak�ho u�ivatele (userId) byl 
      /// vystaven a p��znak "remeber", kter� nastavil tv�rce tiketu.
      /// </summary>
      /// <param name="ticket">�et�zec tiketu</param>
      /// <returns></returns>
      [XmlRpcMethod("ticket.check")]
      checkResponse check(string ticket);
    }
  }
}