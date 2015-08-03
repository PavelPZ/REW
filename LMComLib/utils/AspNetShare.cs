using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Net;

namespace LMComLib {
  public class ShareThis { //used in calling WNetAddConnection2 

    [StructLayout(LayoutKind.Sequential)]
    public struct NETRESOURCE {
      public int dwScope; public int dwType;
      public int dwDisplayType;
      public int dwUsage;
      [MarshalAs(UnmanagedType.LPStr)]
      public string lpLocalName;
      [MarshalAs(UnmanagedType.LPStr)]
      public string lpRemoteName;
      [MarshalAs(UnmanagedType.LPStr)]
      public string lpComment;
      [MarshalAs(UnmanagedType.LPStr)]
      public string lpProvider;
    }

    //WIN32API - WNetAddConnection2 
    [DllImport("mpr.dll", CharSet = System.Runtime.InteropServices.CharSet.Auto)]
    private static extern int WNetAddConnection2A([MarshalAs(UnmanagedType.LPArray)]  NETRESOURCE[] lpNetResource, [MarshalAs(UnmanagedType.LPStr)]  string lpPassword, [MarshalAs(UnmanagedType.LPStr)]  string lpUserName, int dwFlags);

    //WIN32API - WNetCancelConnection2
    [DllImport("mpr.dll", CharSet = System.Runtime.InteropServices.CharSet.Auto)]
    private static extern int WNetCancelConnection2A([MarshalAs(UnmanagedType.LPStr)]  string lpName, int dwFlags, int fForce);
    
    public static void CopyFile (string share, string username, string password, string dirFrom, string dirTo, string filename) {
      NETRESOURCE[] nr = new NETRESOURCE[1];
      nr[0].lpRemoteName = share;
      nr[0].lpLocalName = ""; //mLocalName;  
      nr[0].dwType = 1; //disk  
      nr[0].dwDisplayType = 0;
      nr[0].dwScope = 0;
      nr[0].dwUsage = 0;
      nr[0].lpComment = "";
      nr[0].lpProvider = "";
      WNetAddConnection2A(nr, password, username, 0);
      File.Copy(dirFrom + "\\" + filename, dirTo + "\\" + filename);
      WNetCancelConnection2A(share, 0, -1);
    }
    public static void Main(string[] args) {
      CopyFile(@"\\sa191", "username", "password", @"f:\shared", @"\\sa191\shared", "123.shp");
    }
  }
}