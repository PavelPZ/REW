using System;
using CookComputing.XmlRpc;

namespace LMComLib.Seznam {
  /// <summary>
  /// Summary description for user
  /// </summary>
  public class lideUser {

    public struct userGetHeadResponse {
      public int status;
      public string statusMessage;
      public shead head;
    }

    public struct shead {
      public int onlineFriends;
      public int newMessages;
      public int newEmails;
      public int meets;
    }

    public struct portrait {
      public int userId;
      public string portraitUrl;
    }

    public struct userGetPortraitResponse {
      public int status;
      public string statusMessage;
      public portrait[] portraits;
    }

    //[XmlRpcUrl(Utils.LideProxyUrl)]
    public interface IUser : IXmlRpcProxy {
      /// <summary>
      ///  Informace o kontaktech.
      /// </summary>
      /// <param name="userId">id uživatele</param>
      [XmlRpcMethod("user.getHead")]
      userGetHeadResponse getHead(int userId);

      /// <summary>
      /// Portret uzivatele.
      /// </summary>
      /// <param name="userId">id uživatele</param>
      [XmlRpcMethod("getPortraits")]
      userGetPortraitResponse getPortrait(int[] userId);
    }
  }
}