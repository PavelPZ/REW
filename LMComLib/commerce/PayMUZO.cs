using System;
using System.ComponentModel;
using System.Collections;
using System.Runtime.InteropServices;
using System.Security.Cryptography.X509Certificates;
using System.Security.Cryptography;
using System.Text;
using LMComLib;
using System.Web;

namespace LMComLib.PayMUZO 
{
  /// <summary>
  /// T��da s obecn�mi parametry pro PayMUZO
  /// </summary>
  public abstract class PayMUZO
  {
    /// <summary>
    /// Pridelen� c�slo obchodn�ka
    /// Povinn�
    /// </summary>
    protected string MERCHANTNUMBER = System.Configuration.ConfigurationManager.AppSettings["MUZO.MERCHANTNUMBER"];
    /// <summary>
    /// Adresa pro platbu
    /// </summary>
    protected string Host = System.Configuration.ConfigurationManager.AppSettings["MUZO.Host"];
    //protected const string ContentType = "application/x-www-form-urlencoded"; 
  }

  /// <summary>
  /// T��da pro platbu PayMUZO
  /// </summary>
  public class PaymentRequest : PayMUZO
  {
    /// <summary>
    /// Typ operace
    /// Povinn�
    /// <value>CREATE_ORDER</value>
    /// </summary>
    const string OPERATION = "CREATE_ORDER";
    /// <summary>
    /// Poradov� c�slo objedn�vky, c�slo mus� b�t v ka�d�m po�adavku
    /// od obchodn�ka unik�tn�. 
    /// Numerick� 15 m�st, Povinn�
    /// </summary>
    Int64 ORDERNUMBER;
    /// <summary>
    /// C�stka v nejmen��ch jednotk�ch dan� meny pro Kc = v hal�r�ch. 
    /// Numerick� 12 m�st, Povinn�
    /// </summary>
    Int32 AMOUNT;
    /// <summary>
    /// Identifik�tor meny dle ISO 4217 (viz. dodatek ISO 4217)
    ///Pokud nen� parametr zad�n pou�ije se prednastaven� hodnota �203� (CZK).
    ///Soucasn� verze Autorizacn�ho Centra podporuje pouze CZK = hodnotu 203
    /// Nepovinn�
    /// </summary>
    public Int32 CURRENCY;
    /// <summary>
    /// Ud�v�, zda m� b�t objedn�vka uhrazena automaticky.
    /// Povolen� hodnoty:
    /// 0 = nen� po�adov�na �hrada
    /// 1 = je po�adov�na �hrada
    /// Povinn�
    /// </summary>
    int DEPOSITFLAG;
    /// <summary>
    /// Identifikace objedn�vky pro obchodn�ka. 
    /// Zobraz� se na v�pisu z banky. V pr�pade, �e nen� zad�no, pou�ije se
    /// hodnota ORDERNUMBER. 
    /// Numerick� 16 m�st Nepovinn�
    /// </summary>
    public Int64 MERORDERNUM;
    /// <summary>
    /// Pln� URL adresa obchodn�ka.(vcetne specifikace protokolu � napr. https:// )
    /// Na tuto adresu bude odesl�n v�sledek po�adavku. V pr�pade chybn�ho podpisu dat se chybov�
    /// hl�en� zas�l� zpet do internetov�ho prohl�ece,ze kter�ho tento po�adavek pri�el. 
    /// Znakov� 50 m�st, Povinn�
    /// </summary>
    string URL;
    /// <summary>
    /// Popis n�kupu.
    /// Obsah pole se pren�� do 3-D syst�mu pro mo�nost n�sledn� kontroly dr�itelem
    /// karty behem autentikace u Access Control Serveru vydavatelsk� banky.
    /// Pole mus� obsahovat pouze ASCII znaky v rozsahu 0x20 � 0x7E.
    /// Znakov� 125 m�st, Nepovinn�
    /// </summary>
    public string DESCRIPTION;
    /// <summary>
    /// Libovoln� data obchodn�ka, kter� jsou vr�cena obchodn�kovi v odpovedi v nezmenen� podobe.
    /// Pole se pou��v� pro uspokojen� rozd�ln�ch po�adavku jednotliv�ch e-shopu.
    /// Pole mus� obsahovat pouze ASCII znaky v rozsahu 0x20 � 0x7E. Pokud je nezbytn� pren�et jin� data,
    /// potom je zapotreb� pou��t BASE64 k�dov�n�. (viz. Dodatek Base64). Pole nesm� obsahovat osobn� �daje
    /// V�sledn� d�lka dat mu�e b�t maxim�lne 30 B.
    /// Znakov� 30 m�st, Nepovinn�
    /// </summary>
    public string MD;

    /// <summary>
    /// Kostruktor
    /// </summary>
    /// <param name="_ORDERNUMBER">Poradov� c�slo objedn�vky</param>
    /// <param name="_AMOUNT">C�stka v nejmen��ch jednotk�ch dan� meny pro Kc = v hal�r�ch.</param>
    /// <param name="_DEPOSITFLAG">Ud�v�, zda m� b�t objedn�vka uhrazena automaticky.</param>
    /// <param name="_URL">Pln� URL adresa obchodn�ka.</param>
    public PaymentRequest(Int64 _ORDERNUMBER, double _AMOUNT, int _DEPOSITFLAG, string _URL)
    {
      ORDERNUMBER = _ORDERNUMBER;
      AMOUNT = (int)(_AMOUNT * 100);
      CURRENCY = -1; //203;
      DEPOSITFLAG = _DEPOSITFLAG;
      MERORDERNUM = -1;
      URL = _URL;
      DESCRIPTION = null;
      MD = null; //FitString(DateTime.UtcNow.Ticks.ToString(), 30);
    }

    /// <summary>
    /// Metoda pro zasl�n� po�adavku
    /// </summary>
    public string BuildUrl()
    {
      return Host + "?" + MakeParams();
    }

    /// <summary>
    /// Metoda pro sestaven� parametr� URL stringu podle nastaven�ch atribut�
    /// </summary>
    private string MakeParams()
    {
      string UrlParams = "";
      UrlParams += "MERCHANTNUMBER=" + HttpUtility.UrlEncode(MERCHANTNUMBER);
      UrlParams += "&OPERATION=" + HttpUtility.UrlEncode(OPERATION);
      UrlParams += "&ORDERNUMBER=" + HttpUtility.UrlEncode(ORDERNUMBER.ToString());
      UrlParams += "&AMOUNT=" + HttpUtility.UrlEncode(AMOUNT.ToString());
      if (CURRENCY != -1)
        UrlParams += "&CURRENCY=" + HttpUtility.UrlEncode(CURRENCY.ToString());
      UrlParams += "&DEPOSITFLAG=" + HttpUtility.UrlEncode(DEPOSITFLAG.ToString());
      if (MERORDERNUM != -1)
        UrlParams += "&MERORDERNUM=" + HttpUtility.UrlEncode(MERORDERNUM.ToString());
      UrlParams += "&URL=" + HttpUtility.UrlEncode(URL);
      if (DESCRIPTION != null)
        UrlParams += "&DESCRIPTION=" + HttpUtility.UrlEncode(FitString(DESCRIPTION, 125));
      if (MD != null)
        UrlParams += "&MD=" + HttpUtility.UrlEncode(MD);
      UrlParams += "&DIGEST=" + HttpUtility.UrlEncode(GetDigest());

      return UrlParams;
    }

    /// <summary>
    /// Funkce pro vytvo�en� podpisu
    /// </summary>
    private string GetDigest()
    {
      X509Helper.CSignature sig = new X509Helper.CSignature();
      string message = "";
      message += MERCHANTNUMBER;
      message += "|" + OPERATION;
      message += "|" + ORDERNUMBER.ToString();
      message += "|" + AMOUNT.ToString();
      if (CURRENCY != -1)
        message += "|" + CURRENCY.ToString();
      message += "|" + DEPOSITFLAG.ToString();
      if (MERORDERNUM != -1)
        message += "|" + MERORDERNUM.ToString();
      message += "|" + URL;
      if (DESCRIPTION != null)
        message += "|" + FitString(DESCRIPTION, 125);
      if (MD != null)
        message += "|" + MD;
      message = sig.Sign(message);
      return message;
    }

    /// <summary>
    /// Upraven� substring
    /// </summary>
    /// <param name="text">text kter� m� b�t zkr�cen</param>
    /// <param name="length">maxim�ln� d�lka</param>
    /// <returns></returns>
    private string FitString(string text, int length)
    {
      if (text != null && text.Length > length)
        return text.Substring(0, length);
      else
        return text;
    }
  }


  /// <summary>
  /// Z�sk�n� v�pisu z PayMUZO
  /// </summary>
  public class PaymentResponse : PayMUZO
  {
    /// <summary>
    /// Hodnota CREATE_ORDER
    /// Povinn�
    /// </summary>
    string OPERATION;
    /// <summary>
    /// Obsah pole z po�adavku
    /// Povinn�, numerick� 15
    /// </summary>
    public string ORDERNUMBER;
    /// <summary>
    /// Obsah pole z po�adavku pokud bylo uvedeno
    /// Nepovinn�, numerick� 16
    /// </summary>
    public string MERORDERNUM;
    /// <summary>
    /// Obsah pole z po�adavku pokud bylo uvedeno
    /// Nepovinn�, znakov� 512
    /// </summary>
    public string MD;
    /// <summary>
    /// Ud�v� prim�rn� k�d, viz. Pr�loha 2
    /// Povinn�, numerick�
    /// </summary>
    public int PRCODE;
    /// <summary>
    /// Ud�v� sekund�rn� k�d, viz. Pr�loha 2
    /// Povinn�, numerick�
    /// </summary>
    public int SRCODE;
    /// <summary>
    /// Slovn� popis chyby, kter� je jednoznacne d�n kombinac� PRCODE a SRCODE. Pro k�dov�n� obsahu pole je pou�ita k�dov� str�nka Windows Central European (Code Page 1250)
    /// Nepovinn�, znakov� 255
    /// </summary>
    public string RESULTTEXT;
    /// <summary>
    /// Kontroln� podpis retezce, kter� vznikne zretezen�m v�ech pol� v uveden�m porad�.
    /// Povinn�, znakov�
    /// </summary>
    string DIGEST;

    public PaymentResponse()
    {
      OPERATION = null;
      ORDERNUMBER = null;
      MERORDERNUM = null;
      MD = null;
      PRCODE = -1;
      SRCODE = -1;
      RESULTTEXT = null;
      DIGEST = null;
    }

    /// <summary>
    /// Metoda pro sestaven� URL stringu podle nastaven�ch atribut�
    /// </summary>
    public bool ParseUrl(System.Collections.Specialized.NameValueCollection QueryString)
    {
      if (QueryString["OPERATION"] != null)
        OPERATION = QueryString["OPERATION"].ToString();
      if (QueryString["ORDERNUMBER"] != null)
        ORDERNUMBER = QueryString["ORDERNUMBER"].ToString();
      if (QueryString["MERORDERNUM"] != null)
        MERORDERNUM = QueryString["MERORDERNUM"].ToString();
      if (QueryString["MD"] != null)
        MD = QueryString["MD"].ToString();
      if (QueryString["PRCODE"] != null)
        int.TryParse(QueryString["PRCODE"].ToString(), out PRCODE);
      if (QueryString["SRCODE"] != null)
        int.TryParse(QueryString["SRCODE"].ToString(), out SRCODE);
      if (QueryString["RESULTTEXT"] != null)
        RESULTTEXT = QueryString["RESULTTEXT"].ToString();
      if (QueryString["DIGEST"] != null)
        DIGEST = QueryString["DIGEST"].ToString();
      if (OPERATION != null && OPERATION == "CREATE_ORDER")
      {
        if (DIGEST != null)
          return VerifyDigest(DIGEST);
      }
      return false;
    }

    private bool VerifyDigest(string digest)
    {
      X509Helper.CSignature sig = new X509Helper.CSignature();
      string message = "";
      if (OPERATION != null)
        message += OPERATION;
      //else message += "|";
      if (ORDERNUMBER != null)
        message += "|" + ORDERNUMBER;
      //else message += "|";
      if (MERORDERNUM != null)
        message += "|=" + MERORDERNUM;
      //else message += "|";
      if (MD != null)
        message += "|" + MD;
      //else message += "|";
      if (PRCODE != -1)
        message += "|" + PRCODE;
      //else message += "|";
      if (SRCODE != -1)
        message += "|" + SRCODE;
      //else message += "|";
      if (RESULTTEXT != null)
        message += "|" + RESULTTEXT;
      //else message += "|";
      return sig.ValidateDigest(message, digest);
    }
  }
}

#region X509Helper

namespace X509Helper
{
  public class CSignature
  {
    public string privatni, heslo, verejny, MUZO_verejny;

    public CSignature()
    {
      string basePath = System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath + "App_Data\\";
      this.privatni = basePath + System.Configuration.ConfigurationManager.AppSettings["MUZO.Cert.Private.LangMaster"];
      this.heslo = System.Configuration.ConfigurationManager.AppSettings["MUZO.Cert.Private.LangMaster.Password"];
      this.verejny = basePath + System.Configuration.ConfigurationManager.AppSettings["MUZO.Cert.Public.LangMaster"];
      this.MUZO_verejny = basePath + System.Configuration.ConfigurationManager.AppSettings["MUZO.Cert.Public.Muzo"];
    }

    public string Sign(string text)
    {
      X509Certificate2 priv_cert = new X509Certificate2(this.privatni, this.heslo);
      RSAPKCS1SignatureFormatter sf = new RSAPKCS1SignatureFormatter(priv_cert.PrivateKey);
      sf.SetHashAlgorithm("SHA1");
      System.Text.ASCIIEncoding ascii = new System.Text.ASCIIEncoding();
      byte[] message = ascii.GetBytes(text);
      byte[] hash = new SHA1CryptoServiceProvider().ComputeHash(message);
      byte[] digest = sf.CreateSignature(hash);

      return Convert.ToBase64String(digest);
    }

    public byte[] Sign(byte[] data)
    {
      X509Certificate2 priv_cert = new X509Certificate2(this.privatni, this.heslo);
      RSAPKCS1SignatureFormatter sf = new RSAPKCS1SignatureFormatter(priv_cert.PrivateKey);
      sf.SetHashAlgorithm("SHA1");
      System.Text.ASCIIEncoding ascii = new System.Text.ASCIIEncoding();
      byte[] hash = new SHA1CryptoServiceProvider().ComputeHash(data);
      byte[] digest = sf.CreateSignature(hash);

      return digest;
    }

    public bool Verify(string text, string signature)
    {
      X509Certificate pub_cert = X509Certificate.CreateFromCertFile(this.MUZO_verejny);
      byte[] digest = Convert.FromBase64String(signature);

      RSACryptoServiceProvider rsa = X509Helper.KeyFromCert.GetPublicKeyFromX509Certificate(pub_cert);

      RSAPKCS1SignatureDeformatter df = new RSAPKCS1SignatureDeformatter(rsa);
      df.SetHashAlgorithm("SHA1");
      byte[] message = System.Text.Encoding.Default.GetBytes(text);
      byte[] hash = new SHA1CryptoServiceProvider().ComputeHash(message);
      return df.VerifySignature(hash, digest);
    }

    public bool ValidateDigest(string sMessage, string sDigest)
    {
      X509Certificate cert = X509Certificate.CreateFromCertFile(this.MUZO_verejny);
      RSACryptoServiceProvider RSA = new RSACryptoServiceProvider();
      RSA = X509Helper.KeyFromCert.GetPublicKeyFromX509Certificate(cert);

      byte[] bDigest = Convert.FromBase64String(sDigest);

      byte[] data = new byte[sMessage.Length];
      data = System.Text.Encoding.Default.GetBytes(sMessage);
      //string aa = System.Text.Encoding.ASCII.GetChars(data);

      byte[] HashResult;
      SHA1 sha = new SHA1CryptoServiceProvider();
      HashResult = sha.ComputeHash(data);

      RSAPKCS1SignatureDeformatter RSADeformatter = new RSAPKCS1SignatureDeformatter(RSA);
      RSADeformatter.SetHashAlgorithm("SHA1");

      if (RSADeformatter.VerifySignature(HashResult, bDigest))
        return true;
      else
        return false;
    }
  }
}



namespace X509Helper
{
  public class KeyFromCert
  {

    /// This function creates and returns an RSACryptoServiceProvider 
    /// object (containing only the public key) based on the supplied 
    /// XmlDSig X509Certificate element.
    /*public static RSACryptoServiceProvider GetPublicKeyFromCertElement(XmlElement certElement)
    {
      // Get an X509Certificate from the XML element.
      X509Certificate cert = CreateX509CertificateFromXMLElement(certElement);

      // Return the RSA public key from the certificate.
      return GetPublicKeyFromX509Certificate(cert);
    }*/

    /// <summary>
    /// This method takes an XML element which contains a base64-encoded 
    /// X509Certificate in ASN.1 format and loads it into a 
    /// System.Security.Cryptography.X509Certificates.X509Certificate 
    /// object.
    /// </summary>
    /// <param name="theCertElement">The XML element containing
    /// the encoded X509Certificate</param>
    /// <returns>A new
    /// System.Security.Cryptography.X509Certificates.X509Certificate 
    /// object</returns>
    /*private static X509Certificate CreateX509CertificateFromXMLElement(
        XmlElement theCertElement)
    {
    // Make sure the name of the element is "X509Certificate",
    // to confirm the user is making a good-faith effort to provide 
    // the proper data.
    if (theCertElement.LocalName != "X509Certificate")
    { 
        throw new System.Exception("Bad element name!");
    }

    // The text of the element should be a Base64 representation 
    // of the certificate, so load it as a string.
    String base64CertificateData = theCertElement.InnerText;

    // Remove any whitespace that may be cluttering up the data.
    base64CertificateData = base64CertificateData.Replace("\n", "" );
    base64CertificateData = base64CertificateData.Replace("\r", "" );
    base64CertificateData = base64CertificateData.Replace("\f", "" );
    base64CertificateData = base64CertificateData.Replace("\t", "" );
    base64CertificateData = base64CertificateData.Replace(" ", "" );

    // Convert the data to a byte array.
    byte[] certificateData = System.Convert.FromBase64String(
        base64CertificateData );

    // Create a new X509Certificate from the data.
    System.Security.Cryptography.X509Certificates.X509Certificate cert = 
        new System.Security.Cryptography.X509Certificates.X509Certificate(
        certificateData );

    //Return the result
    return cert;
   }*/

    /// <summary>
    /// This function creates and returns an RSACryptoServiceProvider 
    /// object (containing only the public key) based on the
    /// supplied X509Certificate object.
    /// </summary>
    /// <param name="x509">the X509Certificate object from which 
    /// to extract a public key.</param>
    /// <returns>A System.Security.Cryptography.RSACryptoServiceProvider
    /// object</returns>
    public static RSACryptoServiceProvider GetPublicKeyFromX509Certificate(X509Certificate x509)
    {
      // This code has been adapted from the KnowledgeBase article
      // 320602 HOW TO: Sign and Verify SignedXml Objects Using Certificates
      // http://support.microsoft.com/?id=320602

      RSACryptoServiceProvider rsacsp = null;
      uint hProv = 0;
      IntPtr pPublicKeyBlob = IntPtr.Zero;

      // Get a pointer to a CERT_CONTEXT from the raw certificate data.
      IntPtr pCertContext = IntPtr.Zero;
      pCertContext = (IntPtr)CertCreateCertificateContext(
          X509_ASN_ENCODING | PKCS_7_ASN_ENCODING,
          x509.GetRawCertData(),
          x509.GetRawCertData().Length);

      if (pCertContext == IntPtr.Zero)
      {
        Console.WriteLine("CertCreateCertificateContext failed: "
            + Marshal.GetLastWin32Error().ToString());
        goto Cleanup;
      }

      if (!CryptAcquireContext(ref hProv, null, null, PROV_RSA_FULL, 0))
      {
        if (!CryptAcquireContext(ref hProv, null, null, PROV_RSA_FULL,
            CRYPT_NEWKEYSET))
        {
          Console.WriteLine("CryptAcquireContext failed: "
              + Marshal.GetLastWin32Error().ToString());
          goto Cleanup;
        }
      }

      // Get a pointer to the CERT_INFO structure.
      // It is the 4th DWORD of the CERT_CONTEXT structure.
      //
      //    typedef struct _CERT_CONTEXT {
      //        DWORD         dwCertEncodingType;
      //        BYTE*         pbCertEncoded;
      //        DWORD         cbCertEncoded;
      //        PCERT_INFO    pCertInfo;
      //        HCERTSTORE    hCertStore;
      //    } CERT_CONTEXT,  *PCERT_CONTEXT;
      //    typedef const CERT_CONTEXT *PCCERT_CONTEXT;
      //
      IntPtr pCertInfo = (IntPtr)Marshal.ReadInt32(pCertContext, 12);

      // Get a pointer to the CERT_PUBLIC_KEY_INFO structure.
      // This structure is located starting at the 57th byte
      // of the CERT_INFO structure.
      // 
      //    typedef struct _CERT_INFO {
      //        DWORD                       dwVersion;
      //        CRYPT_INTEGER_BLOB          SerialNumber;
      //        CRYPT_ALGORITHM_IDENTIFIER  SignatureAlgorithm;
      //        CERT_NAME_BLOB              Issuer;
      //        FILETIME                    NotBefore;
      //        FILETIME                    NotAfter;
      //        CERT_NAME_BLOB              Subject;
      //        CERT_PUBLIC_KEY_INFO        SubjectPublicKeyInfo;
      //        CRYPT_BIT_BLOB              IssuerUniqueId;
      //        CRYPT_BIT_BLOB              SubjectUniqueId;
      //        DWORD                       cExtension;
      //        PCERT_EXTENSION             rgExtension;
      //    } CERT_INFO, *PCERT_INFO;
      // 
      IntPtr pSubjectPublicKeyInfo = (IntPtr)(pCertInfo.ToInt32() + 56);

      // Import the public key information from the certificate context
      // into a key container by passing the pointer to the 
      // SubjectPublicKeyInfo member of the CERT_INFO structure 
      // into CryptImportPublicKeyInfoEx.
      // 
      uint hKey = 0;
      if (!CryptImportPublicKeyInfoEx(hProv, X509_ASN_ENCODING |
          PKCS_7_ASN_ENCODING, pSubjectPublicKeyInfo, 0, 0, 0, ref hKey))
      {
        Console.WriteLine("CryptImportPublicKeyInfoEx failed: "
            + Marshal.GetLastWin32Error().ToString());
        goto Cleanup;
      }

      // Now that the key is imported into a key container use
      // CryptExportKey to export the public key to the PUBLICKEYBLOB
      // format.
      // First get the size of the buffer needed to hold the 
      // PUBLICKEYBLOB structure.
      // 
      uint dwDataLen = 0;
      if (!CryptExportKey(hKey, 0, PUBLICKEYBLOB, 0, 0, ref dwDataLen))
      {
        Console.WriteLine("CryptExportKey failed: "
            + Marshal.GetLastWin32Error().ToString());
        goto Cleanup;
      }

      // Then export the public key into the PUBLICKEYBLOB format.
      pPublicKeyBlob = Marshal.AllocHGlobal((int)dwDataLen);
      if (!CryptExportKey(hKey, 0, PUBLICKEYBLOB, 0,
          (uint)pPublicKeyBlob.ToInt32(), ref dwDataLen))
      {
        Console.WriteLine("CryptExportKey failed: "
            + Marshal.GetLastWin32Error().ToString());
        goto Cleanup;
      }

      // The PUBLICKEYBLOB has the following format:
      //        BLOBHEADER blobheader;
      //        RSAPUBKEY rsapubkey;
      //        BYTE modulus[rsapubkey.bitlen/8];
      // 
      // Which can be expanded to the following:
      // 
      //        typedef struct _PUBLICKEYSTRUC {
      //            BYTE   bType;
      //            BYTE   bVersion;
      //            WORD   reserved;
      //            ALG_ID aiKeyAlg;
      //        } BLOBHEADER, PUBLICKEYSTRUC;
      //        typedef struct _RSAPUBKEY {
      //            DWORD magic;
      //            DWORD bitlen;
      //            DWORD pubexp;
      //        } RSAPUBKEY;
      //        BYTE modulus[rsapubkey.bitlen/8];

      // Get the public exponent.
      // The public exponent is located in bytes 17 through 20 of the 
      // PUBLICKEYBLOB structure.
      byte[] Exponent = new byte[4];
      Marshal.Copy((IntPtr)(pPublicKeyBlob.ToInt32() + 16), Exponent, 0, 4);
      Array.Reverse(Exponent); // Reverse the byte order.

      // Get the length of the modulus.
      // To do this extract the bit length of the modulus 
      // from the PUBLICKEYBLOB. The bit length of the modulus is at bytes 
      // 13 through 17 of the PUBLICKEYBLOB.
      int BitLength = Marshal.ReadInt32(pPublicKeyBlob, 12);

      // Get the modulus. The modulus starts at the 21st byte of the 
      // PUBLICKEYBLOB structure and is BitLengh/8 bytes in length.
      byte[] Modulus = new byte[BitLength / 8];
      Marshal.Copy((IntPtr)(pPublicKeyBlob.ToInt32() + 20), Modulus, 0,
          BitLength / 8);
      Array.Reverse(Modulus); // Reverse the byte order.

      // Put the modulus and exponent into an RSAParameters object.
      RSAParameters rsaparms = new RSAParameters();
      rsaparms.Exponent = Exponent;
      rsaparms.Modulus = Modulus;

      // Import the modulus and exponent into an RSACryptoServiceProvider
      // object via the RSAParameters object.
      rsacsp = new RSACryptoServiceProvider();
      rsacsp.ImportParameters(rsaparms);

    Cleanup:

      if (pCertContext != IntPtr.Zero)
        CertFreeCertificateContext(pCertContext);

      if (hProv != 0)
        CryptReleaseContext(hProv, 0);

      if (pPublicKeyBlob != IntPtr.Zero)
        Marshal.FreeHGlobal(pPublicKeyBlob);

      return rsacsp;
    }

    private const int X509_ASN_ENCODING = 0x00000001;
    private const int PKCS_7_ASN_ENCODING = 0x00010000;
    private const int PROV_RSA_FULL = 1;
    private const int PUBLICKEYBLOB = 0x6;
    private const int CRYPT_NEWKEYSET = 0x00000008;

    // Import statements for calls to Crypto API and Win32 API methods.
    [DllImport("Crypt32.DLL", EntryPoint = "CertCreateCertificateContext",
        SetLastError = true,
        CharSet = CharSet.Unicode, ExactSpelling = false,
        CallingConvention = CallingConvention.StdCall)]
    private static extern IntPtr CertCreateCertificateContext(
         int dwCertEncodingType,
         byte[] pbCertEncoded,
         int cbCertEncoded);

    [DllImport("Crypt32.DLL", EntryPoint = "CryptAcquireContextU",
        SetLastError = true,
        CharSet = CharSet.Unicode, ExactSpelling = false,
        CallingConvention = CallingConvention.StdCall)]
    private static extern bool CryptAcquireContext(
         ref uint phProv, string szContainer,
         string szProvider,
         int dwProvType,
         int dwFlags);

    [DllImport("Crypt32.DLL", EntryPoint = "CryptImportPublicKeyInfoEx",
        SetLastError = true,
        CharSet = CharSet.Unicode, ExactSpelling = false,
        CallingConvention = CallingConvention.StdCall)]
    private static extern bool CryptImportPublicKeyInfoEx(
        uint hCryptProv,
        uint dwCertEncodingType,
        IntPtr pInfo,
        int aiKeyAlg,
        int dwFlags,
        int pvAuxInfo,
        ref uint phKey);

    [DllImport("Advapi32.DLL", EntryPoint = "CryptExportKey",
        SetLastError = true,
        CharSet = CharSet.Unicode, ExactSpelling = false,
        CallingConvention = CallingConvention.StdCall)]
    private static extern bool CryptExportKey(
        uint hKey,
        uint hExpKey,
        int dwBlobType,
        int dwFlags,
        uint pbData,
        ref uint pdwDataLen);

    [DllImport("Crypt32.DLL", EntryPoint = "CertFreeCertificateContext",
        SetLastError = true,
        CharSet = CharSet.Unicode, ExactSpelling = false,
        CallingConvention = CallingConvention.StdCall)]
    private static extern bool CertFreeCertificateContext(
        IntPtr pCertContext);

    [DllImport("Advapi32.DLL", EntryPoint = "CryptReleaseContext",
        SetLastError = true,
        CharSet = CharSet.Unicode, ExactSpelling = false,
        CallingConvention = CallingConvention.StdCall)]
    private static extern bool CryptReleaseContext(
        uint hProv,
        int dwFlags);
  }
}
#endregion X509Helper
