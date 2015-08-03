using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace LMComLib {
  public static class EncryptionUtility {

    public static void Encrypt(byte[] utfData, Stream outStr, string password) {
      byte[] saltBytes = Encoding.UTF8.GetBytes(password);
      using (AesManaged aes = new AesManaged()) {
        Rfc2898DeriveBytes rfc = new Rfc2898DeriveBytes(password, saltBytes);

        aes.BlockSize = aes.LegalBlockSizes[0].MaxSize;
        aes.KeySize = aes.LegalKeySizes[0].MaxSize;
        aes.Key = rfc.GetBytes(aes.KeySize / 8);
        aes.IV = rfc.GetBytes(aes.BlockSize / 8);

        using (ICryptoTransform encryptTransform = aes.CreateEncryptor())
        using (CryptoStream encryptor = new CryptoStream(outStr, encryptTransform, CryptoStreamMode.Write)) {
          encryptor.Write(utfData, 0, utfData.Length);
          encryptor.Flush();
        }
      }
    }

    /// <summary> 
    /// Encrypt the data 
    /// </summary> 
    public static byte[] Encrypt(byte[] utfData, string password) {
      using (MemoryStream outStr = new MemoryStream()) {
        Encrypt(utfData, outStr, password);
        return outStr.ToArray();
      }
    }

    public static void Decrypt(byte[] encryptedBytes, Stream outStr, string password) {

      byte[] saltBytes = Encoding.UTF8.GetBytes(password);
      using (var aes = new AesManaged()) {
        Rfc2898DeriveBytes rfc = new Rfc2898DeriveBytes(password, saltBytes);
        aes.BlockSize = aes.LegalBlockSizes[0].MaxSize;
        aes.KeySize = aes.LegalKeySizes[0].MaxSize;
        aes.Key = rfc.GetBytes(aes.KeySize / 8);
        aes.IV = rfc.GetBytes(aes.BlockSize / 8);

        using (ICryptoTransform decryptTransform = aes.CreateDecryptor())
        using (CryptoStream decryptor = new CryptoStream(outStr, decryptTransform, CryptoStreamMode.Write)) {
          decryptor.Write(encryptedBytes, 0, encryptedBytes.Length);
          decryptor.Flush();
        }
      }
    }

    /// <summary> 
    /// Decrypt the data
    /// </summary> 
    public static byte[] Decrypt(byte[] encryptedBytes, string password) {
      using (MemoryStream outStr = new MemoryStream()) {
        Decrypt(encryptedBytes, outStr, password);
        return outStr.ToArray();
      }
    }
  }
}


