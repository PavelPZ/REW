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
      public int status;           //Výsledek operace; 200=Ok, 406=Chybné argumenty
      public string statusMessage;
      public string session;        //Øetìzec se session
    }

    public struct sessionAttributes
    {
      public int userId;         //identifikace uživatele
      public string serviceId;   //identifikace zakládající služby
      public string username;    //uživatelské jméno ve tvaru uname@domain
      public string clientIp;    //IP adresa klienta
      public string userAgent;   //Identifikace prohlížeèe (User-agent)
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public System.Boolean temporary; // Pøíznak, že jde o doèasnou session]
    }

    public struct checkAttributes {
      public string serviceId;   //identifikace volající služby
      public string clientIp;    //IP adresa klienta
      public string userAgent;   //Identifikace prohlížeèe (User-agent)
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string[] allowDomain;    //Seznam povolenách domén
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string variable;    //Nova hodnota promenne variable - uzivatelskych dat
    }

    public struct checkResponse
    {
      public int status;            //Výsledek operace; 200=Ok, 406=Chybné argumenty, 402=Chyba autentizace
      public string statusMessage;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public int version;        //Verze session
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public int level;          //Úroveò autorizace
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string creator;     //Identifikace zakládající služby
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public System.DateTime created;  // Datum a èas založení session
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public System.DateTime refreshed;  //Datum a cas posledniho testu (oziveni) session
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public int userId;         //Id uživatele
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string username;    //Identifikace uživatele ve tvaru uname@domain
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string session;     //Aktualizovaná session
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public System.Boolean temporary;  //Pøíznak, že jde o temporary session
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public System.Boolean adminSession;  //Priznak, ze jde o admin session
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public int expired; //Pocet sekund od expirace. Existuje, pouze tehdy, je-li session spravna, ale expirovala.
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string variable;    //Uzivatelska data - vracena z vyparsovane session
    }

    public struct closeAttributes {
      public string serviceId;   //identifikace volající služby
      public string clientIp;    //IP adresa klienta
      public string userAgent;   //Identifikace prohlížeèe (User-agent)
    }

    public struct closeResponse {
      public int status;            //Výsledek operace; 200=Ok, 406=Chybné argumenty, 402=Chyba autentizace
      public string statusMessage;
    }



    //[XmlRpcUrl(Utils.ProxyUrl)]
    public interface ISession : IXmlRpcProxy
    {
      /// <summary>
      /// Voláním lze sestavit session cookie urèené pro autentizaci uživatelù.
      /// </summary>
      /// <param name="attribs"></param>
      /// <returns></returns>
      [XmlRpcMethod("session.create")]
      createResponse create(sessionAttributes attribs);


      /// <summary>
      /// Metoda je urèena pro ovìøení platnosti trvalé session a v kladném pøípadì k vrácení informací o session. Aplikace musí uživatele autorizovat pouze v pøípadì, pokud je jí vyžadovaná úroveò autorizace vìtší nebo rovna úrovni vrácené ve výsledku volání.
      /// </summary>
      /// <param name="sessionId">Identifikátor session</param>
      /// <param name="attribs"></param>
      /// <returns></returns>
      [XmlRpcMethod("session.check")]
      checkResponse check(string sessionId, checkAttributes attribs);

      /// <summary>
      /// Metoda je urèena pro ovìøení platnosti trvalé session a v kladném pøípadì k vrácení informací o session. Aplikace musí uživatele autorizovat pouze v pøípadì, pokud je jí vyžadovaná úroveò autorizace vìtší nebo rovna úrovni vrácené ve výsledku volání.
      /// </summary>
      /// <param name="sessionId">Identifikátor session</param>
      /// <param name="attribs"></param>
      /// <returns></returns>
      [XmlRpcMethod("session.close")]
      closeResponse close(string sessionId, closeAttributes attribs);
    }
  }
}