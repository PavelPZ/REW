using System;
using CookComputing.XmlRpc;
using LMComLib.Seznam;
namespace LMComLib.Seznam {

  /// <summary>
  /// Summary description for user
  /// </summary>
  public class user {

    public struct MultiGetAttribute {
      public string methodName;
      public int[] @params;
      public MultiGetAttribute(int id) {
        @params = new int[] { id };
        methodName = "user.getAttributes";
      }
    }

    public struct userAttributes //Atributy uzivatele.
    {
      public string username;
      public string domain;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public int userId;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string iconUrl;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string portraitUrl;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string password;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public bool disabled;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public System.DateTime createDate;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string nameFirst;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string nameLast;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string title;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string email;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string address;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string city;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string zip;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string country;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string phone;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string sex;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public bool receiveInfoFlag;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string question;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string answer;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string language;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public System.DateTime birthDate;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string iconType;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string finger;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string www;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string icq;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string greeting;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public bool viewTitle;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public bool viewNameFirst;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public bool viewNameLast;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public bool viewAddress;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public bool viewCity;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public bool viewPhone;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public bool viewCountry;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public bool viewBirthDate;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public bool viewEmail;
    }

    public struct userAttribsResponse {
      public int status;
      public string statusMessage;
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public userAttributes userData;
    }

    public struct userAttribsArrayResponse {
      public int status;
      public string statusMessage;
      public userAttributes[] userData;
    }

    public struct createResponse {
      public int status;             // Vysledek operace (200=Ok, 404=User exists, 5xx=Internal error)
      public string statusMessage;   // Slovni popis statusu
      public int userId;             // Id vytvoreneho uzivatele
    }

    public struct resolveUserResponse {
      public int status;              //Status kod volani (200=Ok, 404=Not found, 405=Not allowed)
      public string statusMessage;    //Textovy popis vysledku volani
      public int userId;              //Uzivatelske id
    }

    public struct getTrustLevelResponse {
      public int status; //                Status kod volani (200=Ok, 404=User, not found, 405=Not allowed)
      public string statusMessage; //     Textovy popis vysledku volani
      public int trustLevel; //            Uroven verohodnosti, 0=neverohodny, >0 verohodny
    }

    public struct getServiceMappingResponse {
      public int status;                  //Status kod volani
      public string statusMessage;        //Textovy popis vysledku volani
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public bool disabled;               //Infomace, zda sluzba nebyla zablokovana
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public System.DateTime lastUsed;   //Datum a cas posledniho pouziti
      [XmlRpcMissingMapping(MappingAction.Ignore)]
      public string lastClientIP;         //IP adresa posledniho pristupu
    }

    public struct mapServiceResponse {
      public int status;               //Status kod volani (200=Ok, 404=Not found,405=Not allowed)
      public string statusMessage;    //Textovy popis vysledku volani
    }

    public struct unmapServiceResponse {
      public int status;               //Status kod volani (200=Ok, 404=Not found,405=Not allowed)
      public string statusMessage;     //Textovy popis vysledku volani
    }


    //[XmlRpcUrl(Utils.ProxyUrl)]
    public interface IUser : IXmlRpcProxy {
      [XmlRpcMethod("system.multicall")]
      userAttribsResponse[] multiGetAttributes(MultiGetAttribute[] attributes);
      /// <summary>
      ///  Vytváøí nového uivatele. Vìtšina parametrù je nepovinná. Pokud nejsou zadány, jsou inicializovány implicitními hodnotami. 
      ///  Kadı uivatel musí mít definované minimálnì uivatelské jméno a doménu. Hodnota clientIP se pouije pro zápis do autentizaèní 
      ///  tabulky. Zapisuje se jako service="registrace", spolu s èasem registrace a IP adresou. Hodnota authorized je nepovinná, implicitnì 
      ///  true (uivatel je autorizován), mìla by bıt zadána zejména pokud vytváøíme pøedem neautorizovaného uivatele (tj. nastavit na false). 
      ///  Volání mùe uskuteènit pouze klient, kterı má povoleno vyváøení uivatelù.
      /// </summary>
      /// <param name="data">Atributy uzivatele</param>
      /// <param name="clientIp">IP adresa klieta, ktery si ucet zaklada</param>
      /// <param name="authorized">True (default) pro zalozeni autorizovaného uzivatele</param>
      [XmlRpcMethod("user.create")]
      createResponse create(userAttributes data, string clientIp);

      /// <summary>
      /// Voláním metody lze získat informace o uivateli. Pokud není maskou udáno jinak, vrací se všechny povolené atributy pro 
      /// daného XMLRPC klienta. Pokud je maska zadána, vrací se prùnik zadanıch atributù a tìch, které je moné pro XMLRPC klienta 
      /// poskytnout. Maska je pole stringu jako "sex", "language", ... viz. informace o tom, co metoda vrací. 
      /// Zjišování informací o uivatelích je moné pouze pro takové uivatele, kteøí mají namapovanou slubu, ke které má XMLRPC klient pøístup.
      /// </summary>
      /// <param name="userId">Uzivatelske id</param>
      [XmlRpcMethod("user.getAttributes")]
      userAttribsResponse getAttributes(int userId);

      ///Vrací informaci o mapovani sluzby.
      ///Voláním lze zjistit, zda má uivatel namapovanou danou slubu. XMLRPC klient mùe takovı dotaz poloit pouze nad 
      ///serviceId, které má povoleny.
      ///int userId            Uzivatelske id
      ///string serviceId      Id sluzby ("sbazar", "email", apod.)
      [XmlRpcMethod("user.getServiceMapping")]
      getServiceMappingResponse getServiceMapping(int userId, string serviceId);

      /// <summary>
      /// Provede explicitní namapování sluby.
      /// Voláním metody lze explicitnì namapovat slubu danému uivateli. Mapování sluby lze povolit 
      /// pouze XMLRPC klientovi, kterı má právo nad danou slubou mapování nastavovat.
      /// </summary>
      /// <param name="userId">Uzivatelske id</param>
      /// <param name="serviceId">Id sluzby (napr. "sbazar", "email", ...)</param>
      /// <returns></returns>
      [XmlRpcMethod("user.mapService")]
      mapServiceResponse mapService(int userId, string serviceId);

      /*
      /// <summary>
      ///  Vytváøí nového uivatele. Vìtšina parametrù je nepovinná. Pokud nejsou zadány, jsou inicializovány implicitními hodnotami. 
      ///  Kadı uivatel musí mít definované minimálnì uivatelské jméno a doménu. Hodnota clientIP se pouije pro zápis do 
      ///  autentizaèní tabulky. Zapisuje se jako service="registrace", spolu s èasem registrace a IP adresou. 
      ///  Hodnota authorized je nepovinná, implicitnì true (uivatel je autorizován), mìla by bıt zadána zejména pokud vytváøíme
      ///  pøedem neautorizovaného uivatele (tj. nastavit na false). Volání mùe uskuteènit pouze klient, kterı má povoleno vyváøení uivatelù.
      /// </summary>
      /// <param name="data">Atributy uzivatele</param>
      /// <param name="clientIp">IP adresa klieta, ktery si ucet zaklada</param>
      /// <param name="authorized">True (default) pro zalozeni autorizovaného uzivatele</param>
      [XmlRpcMethod("user.create")]
      createResponse create(userAttributes data, string clientIp, bool authorized);

      /// <summary>
      /// Metoda slouí k pøevodu uivatelského jména na userId. Zároveò je mono ji volat pouze na uivatele, kterı má namapovanou 
      /// slubu, kterou XMLRPC klient obhospodaøuje. Volání mùe uskuteènit pouze klient, kterı má povolen resolving.
      /// </summary>
      /// <param name="username">Uzivatelska jmeno</param>
      /// <param name="domain">Domena uzivatele</param>
      /// <returns></returns>
      [XmlRpcMethod("user.resolveUser")]
      resolveUserResponse resolveUser(string username, string domain);

      /// <summary>
      /// Voláním metody lze získat informace o uivateli. Pokud není maskou udáno jinak, vrací se všechny povolené atributy pro 
      /// daného XMLRPC klienta. Pokud je maska zadána, vrací se prùnik zadanıch atributù a tìch, které je moné pro XMLRPC klienta 
      /// poskytnout. Maska je pole stringu jako "sex", "language", ... viz. informace o tom, co metoda vrací. Zjišování informací o uivatelích 
      /// je moné pouze pro takové uivatele, kteøí mají namapovanou slubu, ke které má XMLRPC klient pøístup.
      /// </summary>
      /// <param name="userId">Uzivatelske id</param>
      /// <param name="mask">Maska atributu, ktere nas zajimaji</param>
      [XmlRpcMethod("user.getAttributes")]
      userAttribsResponse getAttributes(int userId, string[] mask);

      [XmlRpcMethod("user.getTrustLevel")]
      getTrustLevelResponse getTrustLevel(int userId);

      /// <summary>
      /// Provede odmapování sluby uivateli.
      /// Tato metoda zruší mapování sluby serviceId uivateli userId. Volající XMLRPC klient musí mít právo k odmapování dané sluby.
      /// </summary>
      /// <param name="userId">Uzivatelske id</param>
      /// <param name="serviceId">Id sluzby (napr. "sbazar", "email", ...)</param>
      /// <returns></returns>
      [XmlRpcMethod("user.unmapService")]
      unmapServiceResponse unmapService(int userId, string serviceId);
*/

    }
  }
}