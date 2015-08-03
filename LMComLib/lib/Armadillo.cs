using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Runtime.InteropServices;

using LMNetLib;
namespace LMComLib {
  public static class ArmadilloCodeGen {

    /*
    [DllImport("CodeGen.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Ansi)]
    static extern string CreateCode(string name, string encrypt_template, int hardwareID, UInt16 otherinfo);
    [DllImport("CodeGen.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Ansi)]
    public static extern int HexToInt(string hexString);
    [DllImport("CodeGen.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Ansi)]
    static extern UInt16 MakeDate(int Year, int Month, int Day);
    [DllImport("CodeGen.dll", CallingConvention = CallingConvention.StdCall, CharSet = CharSet.Ansi)]
    static extern bool WriteHardwareChangeLog(string outFn, string inFn);
    */
    [DllImport("codegen.dll", EntryPoint = "CreateCode", CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    //[return: MarshalAs(UnmanagedType.U1)]
    //[return: MarshalAs(UnmanagedType.LPTStr)]
    //public static extern string CreateCode([MarshalAs(UnmanagedType.LPStr)]string name, [MarshalAs(UnmanagedType.LPStr)]string encryption_template, int hardwareID, UInt16 otherinfo);
    static extern IntPtr CreateCode([MarshalAs(UnmanagedType.LPStr)]string name, [MarshalAs(UnmanagedType.LPStr)]string encryption_template, int hardwareID, UInt16 otherinfo);

    [DllImport("codegen.dll", EntryPoint = "HexToInt", CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    [return: MarshalAs(UnmanagedType.I4)]
    static extern int HexToInt([MarshalAs(UnmanagedType.LPStr)]string hexstring);

    [DllImport("codegen.dll", EntryPoint = "MakeDate", CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    [return: MarshalAs(UnmanagedType.U2)]
    static extern ushort MakeDate(int year, int month, int day);

    [DllImport("codegen.dll", EntryPoint = "WriteHardwareChangeLog", CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    [return: MarshalAs(UnmanagedType.Bool)]
    static extern bool WriteHardwareChangeLog([MarshalAs(UnmanagedType.LPStr)]string writefilename, [MarshalAs(UnmanagedType.LPStr)]string ahclfilename);

    public static string CreateCodeEx(string name, string encryption_template, int hardwareID, UInt16 otherinfo) {
      IntPtr res = ArmadilloCodeGen.CreateCode(name, encryption_template, hardwareID, otherinfo);
      string str = null;
      while (true) {
        byte b = System.Runtime.InteropServices.Marshal.ReadByte(res);
        if (b == 0) break;
        str += Convert.ToChar(b);
        res = res + 1;
      }
      return str;
    }


    //static DateTime startDate = new DateTime(2007, 1, 1);

    public static string getHwLog(string hwCode) {
      lock (typeof(ArmadilloCodeGen)) {
        try {
          string dir = System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath + "App_Data\\";
          string inFn = dir + "hwLog.bin";
          string outFn = dir + "hwLog.txt";
          byte[] logBin = LowUtils.StringToBytes(hwCode);
          //logBin = StringUtils.FileToBytes(@"c:\Temp\Run.AHCL");
          StringUtils.BytesToFile(logBin, inFn);
          if (!WriteHardwareChangeLog(outFn, inFn)) return null;
          string res = StringUtils.FileToString(outFn);
          File.Delete(inFn);
          File.Delete(outFn);
          return res;
        } catch (Exception exp) {
          return "ArmadilloCodeGen.getHwLog error: " + exp.Message;
        }
      }
    }

    public static string getActKey(string licKey, out RegLicenceObj Lic, out string hw) {
      lock (typeof(ArmadilloCodeGen)) {
        hw = licKey.Substring(0, 8).Replace('G', '0').Replace('g', '0');
        string licStr = licKey.Substring(8);
        hw = hw.Insert(4, "-");
        int hwInt = HexToInt(hw);
        Lic = new RegLicenceObj();
        Lic.AsString = licStr;
        RegLicenceScena armCodeScena = Lic.Scena;
        switch (armCodeScena) {
          case RegLicenceScena.multiDate: armCodeScena = RegLicenceScena.date; break;
          case RegLicenceScena.multiFull: armCodeScena = RegLicenceScena.full; break;
          case RegLicenceScena.expressUpgrade: armCodeScena = RegLicenceScena.full; break;
        }
        string armCode = ConfigCourse.armadillo_Prefix + armCodeScena.ToString().ToUpper();
        if (Lic.Scena == RegLicenceScena.full || Lic.Scena == RegLicenceScena.multiFull || Lic.Scena == RegLicenceScena.expressUpgrade)
          return CreateCodeEx(licStr, armCode, hwInt, 0).Replace('0', 'G');
        else if (Lic.Scena == RegLicenceScena.express)
          return CreateCodeEx(licStr, armCode, hwInt, 0).Replace('0', 'G');
        else if (Lic.Scena == RegLicenceScena.date || Lic.Scena == RegLicenceScena.multiDate) {
          DateTime endDate = LowUtils.startDate.AddMonths(Lic.Months);
          UInt16 par = MakeDate(endDate.Year, endDate.Month, endDate.Day);
          return CreateCodeEx(licStr, armCode, hwInt, par).Replace('0', 'G');
        } else
          throw new Exception("Missing code in CSharp.ArmadilloCodeGen.getActKey");
      }
    }
  }
}
/*
http://forum.siliconrealms.com/index.php?showtopic=4639
/// <summary>
    /// Wraps the Armadillo (Software Passport) Codegen.dll.
    ///  
    /// </summary>
    static public class CodeGenWrapper
    {
        [DllImport("codegen.dll", EntryPoint = "CheckUninstallKey", CharSet = CharSet.Auto, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool CheckUninstallKey(int level, [MarshalAs(UnmanagedType.LPStr)]string name, [MarshalAs(UnmanagedType.LPStr)]string encryption_template, ulong hardwareID, [MarshalAs(UnmanagedType.LPStr)]string original_key, [MarshalAs(UnmanagedType.LPStr)]string uninstall_code);

        [DllImport("codegen.dll", EntryPoint = "CreateCode", CharSet = CharSet.Auto, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        [return: MarshalAs(UnmanagedType.LPStr)]
        public static extern string CreateCode([MarshalAs(UnmanagedType.LPStr)]string name, [MarshalAs(UnmanagedType.LPStr)]string encryption_template, ulong hardwareID, ushort otherinfo);

        [DllImport("codegen.dll", EntryPoint = "CreateCode2", CharSet = CharSet.Auto, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        [return: MarshalAs(UnmanagedType.LPStr)]
        public static extern string CreateCode2(int level, [MarshalAs(UnmanagedType.LPStr)]string name, [MarshalAs(UnmanagedType.LPStr)]string encryption_template, ulong hardwareID, ushort otherinfo1, ushort otherinfo2, ushort otherinfo3, ushort otherinfo4, ushort otherinfo5);

        [DllImport("codegen.dll", EntryPoint = "CreateCode3", CharSet = CharSet.Auto, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        [return: MarshalAs(UnmanagedType.LPStr)]
        public static extern string CreateCode3(int level, [MarshalAs(UnmanagedType.LPStr)]string name, [MarshalAs(UnmanagedType.LPStr)]string encryption_template, ulong hardwareID, ushort otherinfo1, ushort otherinfo2, ushort otherinfo3, ushort otherinfo4, ushort otherinfo5);

        [DllImport("codegen.dll", EntryPoint = "CreateCodeShort3", CharSet = CharSet.Auto, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        [return: MarshalAs(UnmanagedType.LPStr)]
        public static extern string CreateCodeShort3(int level, [MarshalAs(UnmanagedType.LPStr)]string name, [MarshalAs(UnmanagedType.LPStr)]string encryption_template, ulong hardwareID, ushort otherinfo1, ushort otherinfo2, ushort otherinfo3, ushort otherinfo4, ushort otherinfo5);

        [DllImport("codegen.dll", EntryPoint = "CreateCodeShort3WithString", CharSet = CharSet.Auto, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        [return: MarshalAs(UnmanagedType.LPStr)]
        public static extern string CreateCodeShort3WithString(int level, [MarshalAs(UnmanagedType.LPStr)]string name, [MarshalAs(UnmanagedType.LPStr)]string encryption_template, ulong hardwareID, ushort otherinfo1, ushort otherinfo2, ushort otherinfo3, ushort otherinfo4, ushort otherinfo5, [MarshalAs(UnmanagedType.LPStr)]string keystring);

        [DllImport("codegen.dll", EntryPoint = "CreateFixClockKey", CharSet = CharSet.Auto, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        [return: MarshalAs(UnmanagedType.LPStr)]
        public static extern string CreateFixClockKey([MarshalAs(UnmanagedType.LPStr)]string project_name);

        [DllImport("codegen.dll", EntryPoint = "DateKeyCreated", CharSet = CharSet.Auto, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        [return: MarshalAs(UnmanagedType.LPStr)]
        public static extern string DateKeyCreated(int level, [MarshalAs(UnmanagedType.LPStr)]string name, [MarshalAs(UnmanagedType.LPStr)]string enc_template, ulong hardwareID, [MarshalAs(UnmanagedType.LPStr)]string origkey);

        [DllImport("codegen.dll", EntryPoint = "HexToInt", CharSet = CharSet.Auto, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        [return: MarshalAs(UnmanagedType.U8)]
        public static extern ulong HexToInt([MarshalAs(UnmanagedType.LPStr)]string hexstring);

        [DllImport("codegen.dll", EntryPoint = "MakeDate", CharSet = CharSet.Auto, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        [return: MarshalAs(UnmanagedType.U2)]
        public static extern ushort MakeDate(uint year, uint month, uint day);

        [DllImport("codegen.dll", EntryPoint = "WriteHardwareChangeLog", CharSet = CharSet.Auto, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool WriteHardwareChangeLog([MarshalAs(UnmanagedType.LPStr)]string writefilename, [MarshalAs(UnmanagedType.LPStr)]string ahclfilename);
    }

 */