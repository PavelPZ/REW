// PkgCmdID.cs
// MUST match PkgCmdID.cr
using System;

namespace Author {
  static class PkgCmdIDList {
    public const uint cmdBrowse = 0x100;
    public const uint cmdRun = 0x101;
    public const uint cmdXref = 0x102;
    public const uint cmd_addFolder = 0x103;
    public const uint cmd_addTest = 0x104;
    public const uint cmd_addCourse = 0x105;
    public const uint cmd_addTestSkill = 0x106;
    public const uint cmd_addTestTaskGroup = 0x107;
    public const uint cmd_addEx = 0x108;
    public const uint cmd_Build = 0x109;
    public const uint cmd_addMod = 0x110;
    //public const uint cmdidShowCourse = 0x102;
    //public const uint cmdidShowTest = 0x103;
  };
}