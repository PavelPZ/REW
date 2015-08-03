using System;
using CookComputing.XmlRpc;
namespace LMComLib.Seznam
{
     
  /// <summary>
  /// Summary description for session
  /// </summary>
  public class session
  {
    //public const string ProxyUrl = "http://rusproxy.sbeta.cz:2816/RPC2";

    public struct createResponse
    {
      public int status;           //V�sledek operace; 200=Ok, 406=Chybn� argumenty
      public string statusMessage;
      public string session;        //�et�zec se session
    }

    public struct sessionAttributes
    {
      public int userId;         //identifikace u�ivatele
      public string serviceId;   //identifikace zakl�daj�c� slu�by
      public string username;    //u�ivatelsk� jm�no ve tvaru uname@domain
      public string clientIp;    //IP adresa klienta
      public string userAgent;   //Identifikace prohl�e�e (User-agent)
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public System.Boolean temporary; // P��znak, �e jde o do�asnou session]
    }

    public struct checkAttributes {
      public string serviceId;   //identifikace volaj�c� slu�by
      public string clientIp;    //IP adresa klienta
      public string userAgent;   //Identifikace prohl�e�e (User-agent)
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string[] allowDomain;    //Seznam povolen�ch dom�n
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string variable;    //Nova hodnota promenne variable - uzivatelskych dat
    }

    public struct checkResponse
    {
      public int status;            //V�sledek operace; 200=Ok, 406=Chybn� argumenty, 402=Chyba autentizace
      public string statusMessage;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public int version;        //Verze session
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public int level;          //�rove� autorizace
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string creator;     //Identifikace zakl�daj�c� slu�by
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public System.DateTime created;  // Datum a �as zalo�en� session
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public System.DateTime refreshed;  //Datum a cas posledniho testu (oziveni) session
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public int userId;         //Id u�ivatele
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string username;    //Identifikace u�ivatele ve tvaru uname@domain
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string session;     //Aktualizovan� session
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public System.Boolean temporary;  //P��znak, �e jde o temporary session
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public System.Boolean adminSession;  //Priznak, ze jde o admin session
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public int expired; //Pocet sekund od expirace. Existuje, pouze tehdy, je-li session spravna, ale expirovala.
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string variable;    //Uzivatelska data - vracena z vyparsovane session
    }

    public struct closeAttributes {
      public string serviceId;   //identifikace volaj�c� slu�by
      public string clientIp;    //IP adresa klienta
      public string userAgent;   //Identifikace prohl�e�e (User-agent)
    }

    public struct closeResponse {
      public int status;            //V�sledek operace; 200=Ok, 406=Chybn� argumenty, 402=Chyba autentizace
      public string statusMessage;
    }



    //[XmlRpcUrl(Utils.ProxyUrl)]
    public interface ISession : IXmlRpcProxy
    {
      /// <summary>
      /// Vol�n�m lze sestavit session cookie ur�en� pro autentizaci u�ivatel�.
      /// </summary>
      /// <param name="attribs"></param>
      /// <returns></returns>
      [XmlRpcMethod("session.create")]
      createResponse create(sessionAttributes attribs);


      /// <summary>
      /// Metoda je ur�ena pro ov��en� platnosti trval� session a v kladn�m p��pad� k vr�cen� informac� o session. Aplikace mus� u�ivatele autorizovat pouze v p��pad�, pokud je j� vy�adovan� �rove� autorizace v�t�� nebo rovna �rovni vr�cen� ve v�sledku vol�n�.
      /// </summary>
      /// <param name="sessionId">Identifik�tor session</param>
      /// <param name="attribs"></param>
      /// <returns></returns>
      [XmlRpcMethod("session.check")]
      checkResponse check(string sessionId, checkAttributes attribs);

      /// <summary>
      /// Metoda je ur�ena pro ov��en� platnosti trval� session a v kladn�m p��pad� k vr�cen� informac� o session. Aplikace mus� u�ivatele autorizovat pouze v p��pad�, pokud je j� vy�adovan� �rove� autorizace v�t�� nebo rovna �rovni vr�cen� ve v�sledku vol�n�.
      /// </summary>
      /// <param name="sessionId">Identifik�tor session</param>
      /// <param name="attribs"></param>
      /// <returns></returns>
      [XmlRpcMethod("session.close")]
      closeResponse close(string sessionId, closeAttributes attribs);
    }
  }
}