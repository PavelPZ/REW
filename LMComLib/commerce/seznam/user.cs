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
      ///  Vytv��� nov�ho u�ivatele. V�t�ina parametr� je nepovinn�. Pokud nejsou zad�ny, jsou inicializov�ny implicitn�mi hodnotami. 
      ///  Ka�d� u�ivatel mus� m�t definovan� minim�ln� u�ivatelsk� jm�no a dom�nu. Hodnota clientIP se pou�ije pro z�pis do autentiza�n� 
      ///  tabulky. Zapisuje se jako service="registrace", spolu s �asem registrace a IP adresou. Hodnota authorized je nepovinn�, implicitn� 
      ///  true (u�ivatel je autorizov�n), m�la by b�t zad�na zejm�na pokud vytv���me p�edem neautorizovan�ho u�ivatele (tj. nastavit na false). 
      ///  Vol�n� m��e uskute�nit pouze klient, kter� m� povoleno vyv��en� u�ivatel�.
      /// </summary>
      /// <param name="data">Atributy uzivatele</param>
      /// <param name="clientIp">IP adresa klieta, ktery si ucet zaklada</param>
      /// <param name="authorized">True (default) pro zalozeni autorizovan�ho uzivatele</param>
      [XmlRpcMethod("user.create")]
      createResponse create(userAttributes data, string clientIp);

      /// <summary>
      /// Vol�n�m metody lze z�skat informace o u�ivateli. Pokud nen� maskou ud�no jinak, vrac� se v�echny povolen� atributy pro 
      /// dan�ho XMLRPC klienta. Pokud je maska zad�na, vrac� se pr�nik zadan�ch atribut� a t�ch, kter� je mo�n� pro XMLRPC klienta 
      /// poskytnout. Maska je pole stringu jako "sex", "language", ... viz. informace o tom, co metoda vrac�. 
      /// Zji��ov�n� informac� o u�ivatel�ch je mo�n� pouze pro takov� u�ivatele, kte�� maj� namapovanou slu�bu, ke kter� m� XMLRPC klient p��stup.
      /// </summary>
      /// <param name="userId">Uzivatelske id</param>
      [XmlRpcMethod("user.getAttributes")]
      userAttribsResponse getAttributes(int userId);

      ///Vrac� informaci o mapovani sluzby.
      ///Vol�n�m lze zjistit, zda m� u�ivatel namapovanou danou slu�bu. XMLRPC klient m��e takov� dotaz polo�it pouze nad 
      ///serviceId, kter� m� povoleny.
      ///int userId            Uzivatelske id
      ///string serviceId      Id sluzby ("sbazar", "email", apod.)
      [XmlRpcMethod("user.getServiceMapping")]
      getServiceMappingResponse getServiceMapping(int userId, string serviceId);

      /// <summary>
      /// Provede explicitn� namapov�n� slu�by.
      /// Vol�n�m metody lze explicitn� namapovat slu�bu dan�mu u�ivateli. Mapov�n� slu�by lze povolit 
      /// pouze XMLRPC klientovi, kter� m� pr�vo nad danou slu�bou mapov�n� nastavovat.
      /// </summary>
      /// <param name="userId">Uzivatelske id</param>
      /// <param name="serviceId">Id sluzby (napr. "sbazar", "email", ...)</param>
      /// <returns></returns>
      [XmlRpcMethod("user.mapService")]
      mapServiceResponse mapService(int userId, string serviceId);

      /*
      /// <summary>
      ///  Vytv��� nov�ho u�ivatele. V�t�ina parametr� je nepovinn�. Pokud nejsou zad�ny, jsou inicializov�ny implicitn�mi hodnotami. 
      ///  Ka�d� u�ivatel mus� m�t definovan� minim�ln� u�ivatelsk� jm�no a dom�nu. Hodnota clientIP se pou�ije pro z�pis do 
      ///  autentiza�n� tabulky. Zapisuje se jako service="registrace", spolu s �asem registrace a IP adresou. 
      ///  Hodnota authorized je nepovinn�, implicitn� true (u�ivatel je autorizov�n), m�la by b�t zad�na zejm�na pokud vytv���me
      ///  p�edem neautorizovan�ho u�ivatele (tj. nastavit na false). Vol�n� m��e uskute�nit pouze klient, kter� m� povoleno vyv��en� u�ivatel�.
      /// </summary>
      /// <param name="data">Atributy uzivatele</param>
      /// <param name="clientIp">IP adresa klieta, ktery si ucet zaklada</param>
      /// <param name="authorized">True (default) pro zalozeni autorizovan�ho uzivatele</param>
      [XmlRpcMethod("user.create")]
      createResponse create(userAttributes data, string clientIp, bool authorized);

      /// <summary>
      /// Metoda slou�� k p�evodu u�ivatelsk�ho jm�na na userId. Z�rove� je mo�no ji volat pouze na u�ivatele, kter� m� namapovanou 
      /// slu�bu, kterou XMLRPC klient obhospoda�uje. Vol�n� m��e uskute�nit pouze klient, kter� m� povolen resolving.
      /// </summary>
      /// <param name="username">Uzivatelska jmeno</param>
      /// <param name="domain">Domena uzivatele</param>
      /// <returns></returns>
      [XmlRpcMethod("user.resolveUser")]
      resolveUserResponse resolveUser(string username, string domain);

      /// <summary>
      /// Vol�n�m metody lze z�skat informace o u�ivateli. Pokud nen� maskou ud�no jinak, vrac� se v�echny povolen� atributy pro 
      /// dan�ho XMLRPC klienta. Pokud je maska zad�na, vrac� se pr�nik zadan�ch atribut� a t�ch, kter� je mo�n� pro XMLRPC klienta 
      /// poskytnout. Maska je pole stringu jako "sex", "language", ... viz. informace o tom, co metoda vrac�. Zji��ov�n� informac� o u�ivatel�ch 
      /// je mo�n� pouze pro takov� u�ivatele, kte�� maj� namapovanou slu�bu, ke kter� m� XMLRPC klient p��stup.
      /// </summary>
      /// <param name="userId">Uzivatelske id</param>
      /// <param name="mask">Maska atributu, ktere nas zajimaji</param>
      [XmlRpcMethod("user.getAttributes")]
      userAttribsResponse getAttributes(int userId, string[] mask);

      [XmlRpcMethod("user.getTrustLevel")]
      getTrustLevelResponse getTrustLevel(int userId);

      /// <summary>
      /// Provede odmapov�n� slu�by u�ivateli.
      /// Tato metoda zru�� mapov�n� slu�by serviceId u�ivateli userId. Volaj�c� XMLRPC klient mus� m�t pr�vo k odmapov�n� dan� slu�by.
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