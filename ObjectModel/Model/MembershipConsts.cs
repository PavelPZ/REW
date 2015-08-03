using LMComLib;
using LMNetLib;
using System.Xml.Serialization;
using System.Collections.Generic;
using System.Linq;
using System;
using System.IO;
using Course;
using System.Text;

namespace LMComLib {

  public class UserData {
    public UserData() { }
    public const string fakePassword = "dE56Z;-!~!eeS";
#if SILVERLIGHT
    [XmlIgnore]
    public string EMail;
#else
    //pro designtime
    public string EMail;
    public Membership_Role[] Roles;
#endif
    public string FirstName;
    public string LastName;
    public UserLector Lector { get { return lector == null ? lector = new UserLector() : lector; } set { lector = value; } } UserLector lector;
    public UserCompany Company { get { return company == null ? company = new UserCompany() : company; } set { company = value; } } UserCompany company;
    public static string FriendlyNameLow(UserData self, string email) {
      if (self == null || string.IsNullOrEmpty(self.FirstName) || string.IsNullOrEmpty(self.LastName)) return email;
      return (string.IsNullOrEmpty(self.FirstName) ? null : self.FirstName + " ") + self.LastName + " (" + email + ")";
    }
    public string FriendlyName { get { return FriendlyNameLow(this, EMail); } }
  }

  public class UserLector {
    public Levels[] Levels;
  }

  public class UserCompany {

    public string Name; //in lm.com: Company.CompanyName
    public string Address1;
    public string Address2;
    public string PSC; //not used in lm.com
    public string City; //in lm.com: Company.Address3
    public string Phone; //not used in lm.com
    public string Country;
    public string DIC; //in lm.com: Company.VAT
    public string ICO; //not used in lm.com

    public class MyUser {
      //public int Id;
      public string EMail;
      public string FirstName;
      public string LastName;
      public string Group; public string Group1; public string Group2; public string Group3;
      public IEnumerable<String> GroupValues() { return XExtension.Create<string>(Group, Group1, Group2, Group3); }
      //public List<Invitation> Invitations { get { return invitations == null ? invitations = new List<Invitation>() : invitations; } set { invitations = value; } } List<Invitation> invitations;
#if SILVERLIGHT
      [XmlIgnore]
      //public TestUserInfo Data { get; set; }
      public object Data { get; set; } //TestUserInfo, neni v SLLib deklarovany, proto se v Q:\lmcom\RW2\Client\AppTest\Company\CompanyMainModel.cs pretypovava
      [XmlIgnore]
      public Func<object, UserData> getUserData; //vrati TestUserInfo.User
      [XmlIgnore]
      public string FriendlyName { get { return UserData.FriendlyNameLow(Data == null || getUserData == null ? null : getUserData(Data), EMail); } }
#endif
      /*public Guid AddInvitation(CourseIds courseId, Levels level) {
        Invitation inv = new Invitation() { Created = DateTime.UtcNow, Id = Guid.NewGuid(), CourseId = courseId, Level = level };
        Invitations.Add(inv);
        return inv.Id;
      }*/
    }

    public List<MyUser> Users { get { return users == null ? users = new List<MyUser>() : users; } set { users = value; } } List<MyUser> users;

    public static string EncodeString(string str) {
      return Convert.ToBase64String(EncryptionUtility.Encrypt(Encoding.UTF8.GetBytes(str), enc_pasword));
    }

    public static string DecodeString(string str) {
      byte[] bt = EncryptionUtility.Decrypt(Convert.FromBase64String(str), enc_pasword);
      return Encoding.UTF8.GetString(bt, 0, bt.Length);
    }

    //DB LAYER
    const sbyte runTestVersion = 1;
    public static string EncodeRunTestRequest(string companyEMail, string userEMail, CourseIds crsId, Levels level, Guid invitationId, int dbTestId) {
      using (MemoryStream ms = new MemoryStream()) using (BinaryWriter wr = new BinaryWriter(ms)) {
        wr.Write(companyEMail); wr.Write(userEMail); wr.Write((byte)crsId); wr.Write((byte)level); wr.Write(invitationId);
        wr.Write(runTestVersion);
        wr.Write(dbTestId);
        return Convert.ToBase64String(EncryptionUtility.Encrypt(ms.ToArray(), enc_pasword));
      }
    } const string enc_pasword = "ty%s7&ks";

    public static void DecodeRunTestRequest(string data, out string companyEMail, out string userEMail, out CourseIds crsId, out Levels level, out Guid invitationId, out int dbTestId) {
      dbTestId = -1;
      using (MemoryStream ms = new MemoryStream(EncryptionUtility.Decrypt(Convert.FromBase64String(data), enc_pasword))) using (BinaryReader rdr = new BinaryReader(ms)) {
        companyEMail = rdr.ReadString(); userEMail = rdr.ReadString(); crsId = (CourseIds)rdr.ReadByte(); level = (Levels)rdr.ReadByte(); invitationId = rdr.ReadGuid();
        if (rdr.BaseStream.Length - 1 > rdr.BaseStream.Position) {
          sbyte version = rdr.ReadSByte();
          switch (version) {
            case 1: dbTestId = rdr.ReadInt32(); break;
          }
        }
      }
    }

    //[XmlIgnore]
    //public bool UsersFilled;
  }

}
