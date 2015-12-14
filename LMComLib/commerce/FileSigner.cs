using System;
using System.Collections.Generic;
using System.Text;
using iTextSharp;
using System.IO;
namespace LMComLib.Commerce.PDF {
  public class FileSigner {
    public static bool SignPFX(string certPath, string password, string email, string reason, string location, DocAuthor author, MemoryStream inStream, MemoryStream outStream) {
      Cert myCert = null;
      bool result;
      //try {
        myCert = new Cert(certPath, password);
        result = true;

      //} catch (Exception /*ex*/) {
        //System.Windows.Forms.MessageBox.Show(ex.ToString());
//        result = false;
      //}
      if (result == true) {
        //Adding Meta Datas
        MetaData MyMD = new MetaData();
        MyMD.Author = author.Author;
        MyMD.Title = author.Title;
        MyMD.Subject = author.Subject;
        MyMD.Keywords = author.Keywords;
        MyMD.Creator = author.Creator;
        MyMD.Producer = author.Producer;


        PDFSigner pdfs = new PDFSigner(inStream, outStream, myCert, MyMD);
        pdfs.Sign(reason, email, location, false);
      }
      return result;
    }

    public static void SignCER(MemoryStream inStream, MemoryStream outStream, string myCert) //private certificate must be installed in system
    {
      //Chilkat.Crypt2 crypt = new Chilkat.Crypt2();
      dynamic crypt = null;

      crypt.UnlockComponent("SGORDICCrypt_790vQhSI2v9G");
      if (crypt.IsUnlocked() == false) {
        throw new Exception(crypt.LastErrorText);
      }

      // Read the PDF
      byte[] pdfBytes = inStream.ToArray();

      // Indicate which digital certificate is to be used.
      // This certificate must have the private key installed on the system.
      //Chilkat.Cert cert = new Chilkat.Cert();
      dynamic cert = null;
      // Replace this line with your own .cer or .p7b file.
      if (!cert.LoadFromFile(myCert)) {
        //System.Windows.Forms.MessageBox.Show(cert.LastErrorText);
      }
      //crypt.SetSigningCertificate(cert);
      crypt.SetSigningCert(cert);

      // Create the signature.
      //byte[] signature = crypt.CreateSignature(pdfBytes);
      //byte[] signature = crypt.OpaqueSignBytes(pdfBytes);
      byte[] signature = crypt.SignBytes(pdfBytes); //???

      // Save the signature to a file.
      System.IO.BinaryWriter bw = new System.IO.BinaryWriter(outStream);
      bw.Write(signature);
      bw.Close();
    }

    public static bool VerifyCER(string inFile, string outFile, string myCert) //private certificate must be installed in system
    {
      
      //Chilkat.Crypt2 crypt = new Chilkat.Crypt2();
      dynamic crypt = null;

      crypt.UnlockComponent("SGORDICCrypt_790vQhSI2v9G");
      if (crypt.IsUnlocked() == false) {
        throw new Exception(crypt.LastErrorText);
      }

      // Read the PDF
      System.IO.FileInfo fInfo = new System.IO.FileInfo(inFile);
      System.IO.BinaryReader br = new System.IO.BinaryReader(System.IO.File.OpenRead(inFile));
      byte[] pdfBytes = br.ReadBytes((int)fInfo.Length);
      br.Close();

      // Indicate which digital certificate is to be used.
      // This certificate must have the private key installed on the system.
      //Chilkat.Cert cert = new Chilkat.Cert();
      dynamic cert = null;
      // Replace this line with your own .cer or .p7b file.
      if (!cert.LoadFromFile(myCert)) {
        //System.Windows.Forms.MessageBox.Show(cert.LastErrorText);
      }
      //crypt.SetSigningCertificate(cert);
      crypt.SetSigningCert(cert);

      // Now load the signature back into another byte array.
      fInfo = new System.IO.FileInfo(outFile);
      br = new System.IO.BinaryReader(System.IO.File.OpenRead(outFile));
      byte[] sigBytes = br.ReadBytes((int)fInfo.Length);
      br.Close();

      // This should be valid.
      //???bool valid1 = crypt.VerifySignature(pdfBytes, sigBytes);
      bool valid1 = true;
      //System.Windows.Forms.MessageBox.Show("valid1 = " + valid1);
      return valid1;
    }
  }
}