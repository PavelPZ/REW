// $Header: /cvsroot/LMCom/lmcomlib/utils/Files.cs,v 1.1 2009/05/07 05:15:13 pavel Exp $

namespace LMNetLib {
  using System;
  using System.IO;
  using System.Collections.Generic;
  using System.Security;
  using System.Collections;
  using System.Collections.Specialized;
  using System.Text.RegularExpressions;

  /// <summary> Souborov� utility. </summary>
  public class Files {
    /// <summary> P�e�te obsah souboru do stringu. </summary>
    /// <param name="fileName">Jm�no souboru.</param>
    /// <returns>Stringov� obsah souboru.</returns>
    public static string FileToString(string fileName) {
      StreamReader sr = File.OpenText(fileName);

      try {
        return sr.ReadToEnd();
      } finally {
        sr.Close();
      }
    }

    /*public static void BytesToFile(byte[] data, string fileName) {
      using (FileStream sr = new FileStream (fileName, FileMode.Create, FileAccess.Write))
        sr.Write(data, 0, data.Length);
    }*/

    /// <summary> P�e�te obsah souboru do stringu. </summary>
    /// <param name="fileName">Jm�no souboru.</param>
    /// <param name="coding">K�dov�n� souboru.</param>
    /// <returns>Stringov� obsah souboru.</returns>
    public static string FileToString(string fileName, System.Text.Encoding coding) {
      StreamReader fileStream = new StreamReader(fileName, coding);
      try {
        return fileStream.ReadToEnd();
      } finally {
        fileStream.Close();
      }
    }

    /// <summary> Zap�e string do souboru. </summary>
    /// <param name="str">string k zaps�n� do souboru.</param>
    /// <param name="fileName">Jm�no souboru.</param>
    public static void StringToFile(string str, string fileName) {
      StreamWriter sr = File.CreateText(fileName);
      try {
        sr.Write(str);
        sr.Flush();
      } finally {
        sr.Close();
      }
    }

    /// <summary> Nahrad� v cest� na soubor jinou z�kladn� cestu. </summary>
    /// <param name="fileName"> P�vodn� cesta na soubor. </param>
    /// <param name="basePath"> Nov� z�kladn� cesta. Mus� kon�it na zp�tn� lom�tko. </param>
    /// <param name="constSegments"> Po�et pevn�ch ��st� (odd�len� jsou zp�tn�mi lom�tky) cesty ve jm�nu souboru.
    /// Kladn� ��slo zna�� od za��tkou cesty, z�porn� od konce. </param>
    /// <returns> Cesta na soubor s novou z�kladn� cestou. </returns>
    public static string ReplaceBasePath(string fileName, string basePath, int constSegments) {
      int segmentPos;

      if (constSegments > 0) {
        segmentPos = -1;
        for (; --constSegments >= 0; )
          segmentPos = fileName.IndexOf(Path.DirectorySeparatorChar, segmentPos + 1);
      } else {
        segmentPos = fileName.Length;
        for (; ++constSegments <= 0; )
          segmentPos = fileName.LastIndexOf(Path.DirectorySeparatorChar, segmentPos - 1);
      }

      return basePath + fileName.Substring(segmentPos + 1);
    }
  }

  /// <summary> Ur�uje formu/form�t vr�cen�ho jm�na souboru ve <see cref="ScanDir.FileName"/>. </summary>
  /// <remarks>
  /// Polo�ky jsem vysv�tleny na souboru c:\pom\file.txt a BasicPath=c:\
  /// </remarks>
  public enum FileNameMode {
    /// <summary> c:\pom\file.txt (plat� pro soubor c:\pom\file.txt a BasicPath=c:\). </summary>
    FullPath,
    /// <summary> c:\pom\file (plat� pro soubor c:\pom\file.txt a BasicPath=c:\). </summary>
    FullName,
    /// <summary> pom\file.txt (plat� pro soubor c:\pom\file.txt a BasicPath=c:\). </summary>
    RelPath,
    /// <summary> pom\file (plat� pro soubor c:\pom\file.txt a BasicPath=c:\). </summary>
    RelName,
    /// <summary> file.txt (plat� pro soubor c:\pom\file.txt a BasicPath=c:\). </summary>
    Path,
    /// <summary> file (plat� pro soubor c:\pom\file.txt a BasicPath=c:\). </summary>
    Name,
    /// <summary> .txt (plat� pro soubor c:\pom\file.txt a BasicPath=c:\). </summary>
    Extension,
  }

  /// <summary> Typ <see cref="ScanDir"/> callbacku. </summary>
  public delegate ScanDirCallBackResult ScanDirCallBack(string path, FileSystemInfo info);

  /// <summary> N�vratov� hodnota <see cref="ScanDirCallBackResult"/>. </summary>
  public enum ScanDirCallBackResult {
    /// <summary>
    /// Pou�ij soubor.
    /// </summary>
    Use,
    /// <summary>
    /// Ignoruj soubor.
    /// </summary>
    Ignore,
    /// <summary>
    /// Ukon�i prohled�v�n� pomoc� ScanDirAbortException.
    /// </summary>
    Abort,
  }

  /// <summary> Exception hozen� ze <see cref="ScanDir"/> v p��pad�, �e <see cref="ScanDir"/>
  /// callback vr�t� <see cref="ScanDirCallBackResult.Abort"/>. </summary>
  public class ScanDirAbortException : Exception { }

  /// <summary> T��da pro z�sk�n� jmen soubor� a adres��� z file syst�mu. </summary>
  /// <example>
  /// Vyp�e pln� cesty soubor� *.txt a podadres��� z adres��e e:\x a jeho p��m�ch podares���.
  /// <code>
  /// ScanDir sd = new ScanDir();
  ///
  /// sd.BasicPath = @"e:\x\";
  /// sd.ScanDepth = 2;
  /// sd.DirsToResult = true;
  /// sd.FileMask = @"(?i:\.txt)$";
  ///
  /// for ( int i = 0 ; i &lt; sd.Count ; i++ )
  ///   Console.WriteLine( sd.FileName( FileNameMode.FullPath , i ) );
  ///
  /// // P��klady z�pis� Regex
  /// // prefix*.xml = @"(?i:^prefix.*\.xml)$"
  /// // *.xml = @"(?i:\.txt)$"
  /// </code>
  /// </example>
  public sealed class ScanDir {
    /// <summary> Hloubka pro proch�zen� adres��� a� na dno (cel� stromov� struktura). </summary>
    public const int c_ScanFullDepth = int.MaxValue;

    private string _FileMask = null;
    /// <summary> Ur�uje pomoc� .NET regul�rn�ho v�razu masku jmen soubor� (ne adres���!),
    /// kter� budou p�id�ny do v�sledku. Implicitn� je null. </summary>
    /// <remarks>
    /// P��klady regul�rn�ch v�raz�:
    /// <pre>
    /// null            v�echny soubory
    /// .+              v�echny soubory
    /// (?i:\.HTM)$     *.htm
    /// ^a              soubory za��naj�c� 'a'
    /// ^(?i:a)	        soubory za��naj�c� 'a' nebo 'A'
    /// the             soubory obsahuj�c� "the"
    /// </pre></remarks>
    public string FileMask {
      get { return _FileMask; }
      set {
        if (_FileMask != value) {
          Active = false;
          _FileMask = value;
        }
      }
    }

    private string _FileMaskNot = null;
    /// <summary> Ur�uje pomoc� .NET regul�rn�ho v�razu masku jmen soubor� (ne adres���!),
    /// kter� NEbudou p�id�ny do v�sledku. Implicitn� je null (pak nen� ��dn� omezen�).
    /// Syntaxe je stejn� jako u <see cref="FileMask"/>. </summary>
    public string FileMaskNot {
      get { return _FileMaskNot; }
      set {
        if (_FileMaskNot != value) {
          Active = false;
          _FileMaskNot = value;
        }
      }
    }

    private int _ScanDepth = c_ScanFullDepth;
    /// <summary> Hloubka vno�en� p�i proch�zen� podadres���. 0 znamen� pouze jednu root �rove�. c_ScanFullDepth znamen� v�echny �rovn�.
    /// Implicitn� je c_ScanFullDepth. </summary>
    public int ScanDepth {
      get { return _ScanDepth; }
      set {
        if (_ScanDepth != value) {
          Active = false;
          _ScanDepth = value;
        }
      }
    }

    private bool _KeepCase = true;
    /// <summary> true pokud se m� zachovat velikost p�smenek soubor�,
    /// kdy� false, tak jsou jm�na soubor� p�evedena na mal� p�smenka.
    /// Implicitn� je true. </summary>
    public bool KeepCase {
      get { return _KeepCase; }
      set {
        if (_KeepCase != value) {
          Active = false;
          _KeepCase = value;
        }
      }
    }

    private bool _FilesToResult = true;
    /// <summary> true pokud maj� b�t soubory p�id�ny do v�sledku. Implicitn� je true. </summary>
    public bool FilesToResult {
      get { return _FilesToResult; }
      set {
        if (_FilesToResult != value) {
          Active = false;
          _FilesToResult = value;
        }
      }
    }

    private bool _DirsToResult = false;
    /// <summary> true pokud maj� b�t adres��e p�id�ny do v�sledku. Implicitn� je false. </summary>
    /// <remarks>
    /// Do hierarchick�ho v�sledku jsou v�dy p�id�ny v�echny adres��e.
    /// </remarks>
    public bool DirsToResult {
      get { return _DirsToResult; }
      set {
        if (_DirsToResult != value) {
          Active = false;
          _DirsToResult = value;
        }
      }
    }

    private string _BasicPath = "." + Path.DirectorySeparatorChar;
    /// <summary> Jm�no ko�enov�ho adres��e, ve kter�m se soubory proch�zej�. Mus� kon�it na '\'. Implicitn� je ".\" </summary>
    public string BasicPath {
      get { return _BasicPath; }
      set {
        if (_BasicPath != value) {
          Active = false;
          _BasicPath = value;
          if (!_BasicPath.EndsWith("\\")) _BasicPath += '\\';
        }
      }
    }

    private ScanDirCallBack _CallBack = null;
    /// <summary> Callback volan� pro ka�d� potencion�ln� vkl�dan� soubor nebo adres��.
    /// Implicitn� je null (��dn� callback). </summary>
    /// <example>
    /// Tento callback za��d� pou�it� soubor� jen mlad��ch ne� 1 hodina.
    /// <code>
    /// public static ScanDirCallBackResult MyScanDirCallBack ( string path, FileSystemInfo info )
    /// {
    ///   return info.CreationTime &lt; DateTime.UtcNow.AddHours( -1 ) ? ScanDirCallBackResult.Ignore : ScanDirCallBackResult.Use;
    /// }
    /// ...
    /// sd.CallBack = new ScanDirCallBack( MyScanDirCallBack );
    /// </code>
    /// </example>
    public ScanDirCallBack CallBack {
      get { return _CallBack; }
      set {
        if (_CallBack != value) {
          Active = false;
          _CallBack = value;
        }
      }
    }

    private FileDirEntry _Hierarchy = null;
    /// <summary> V�sledek v hierarchick� podob�. </summary>
    /// <example>
    /// N�sleduj�c� p��klad ukazuje jednoduch� v�pis hierarchick�ho v�sledku.
    /// <code>
    /// static void PrintHier ( ScanDir.FileDirEntry entry, string indent )
    /// {
    ///   foreach( ScanDir.FileDirEntry Item in entry.SubEntries )
    ///     if ( (Item.Entry.Attributes &amp; FileAttributes.Directory) == 0)
    ///       Console.WriteLine( indent + Item.Entry.Name );
    ///     else
    ///     {
    ///       Console.WriteLine( indent + ":" + Item.Entry.Name );
    ///       PrintHier( Item, indent + "  " );
    ///     }
    /// }
    /// ...
    /// PrintHier( scanDir.Hierarchy, "" );
    /// </code>
    /// </example>
    public FileDirEntry Hierarchy {
      get { return _Hierarchy; }
    }

    private StringCollection _ResultList = new StringCollection();
    /// <summary> V�sledek v linearn� podob�.  </summary>
    /// <remarks>
    /// Jednotliv� polo�ky jsou jm�na soubor� relativn� k BasePath, adres��e kon�� v�dy znakem \.
    /// </remarks>
    public StringCollection ResultList {
      get { Active = true; return _ResultList; }
    }

    /// <summary> Po�et polo�ek v line�rn�m v�sledku. Zp�sobuje intern� nastaven� Active = true. </summary>
    public int Count {
      get {
        Active = true;
        return _ResultList.Count;
      }
    }

    public IEnumerable<string> FileName(FileNameMode mode) {
      for (int i = 0; i < Count; i++) yield return FileName(mode, i);
    }
    /// <summary> Vr�t� polo�ku v line�rn�m v�sledku. Zp�sobuje intern� nastaven� Active = true. </summary>
    /// <param name="mode">Ur�uje formu/form�t vr�cen�ho jm�na souboru.</param>
    /// <param name="index">Index polo�ky.</param>
    /// <returns>Polo�ka v line�rn�m v�sledku.</returns>
    public string FileName(FileNameMode mode, int index) {
      Active = true;

      string entry = _ResultList[index];
      switch (mode) {
        case FileNameMode.FullPath:
          return _BasicPath + entry;

        case FileNameMode.FullName:
          return Path.ChangeExtension(_BasicPath + entry, null);

        case FileNameMode.RelPath:
          return entry;

        case FileNameMode.RelName:
          return Path.ChangeExtension(entry, null);

        case FileNameMode.Path:
          return Path.GetFileName(entry);

        case FileNameMode.Name:
          if (entry.EndsWith(@"\"))
            return Path.GetFileName(entry.Substring(0, entry.Length - 1));
          else
            return Path.GetFileNameWithoutExtension(entry);

        case FileNameMode.Extension:
          return Path.GetExtension(entry);

        default:
          throw new Exception(); // Nem�lo by nastat
      }
    }

    /// <summary> Intern� metoda pro p��padnou zm�nu velikosti p�smen jm�na souboru podle KeepCase. </summary>
    private string HandleCase(string path) {
      return _KeepCase ? path : path.ToLower();
    }

    /// <summary> Intern� metoda pro zpracov�n� jednoho souboru/adres��e. </summary>
    /// <returns>false, pokud se m� vyvolat <see cref="ScanDirAbortException"/></returns>
    private bool ProcessFile(string item, FileSystemInfo info) {
      if (null == _CallBack) {
        _ResultList.Add(HandleCase(item));
        return true;
      } else {
        switch (_CallBack(item, info)) {
          case ScanDirCallBackResult.Use:
            _ResultList.Add(HandleCase(item));
            return true;

          case ScanDirCallBackResult.Ignore:
            return true;

          case ScanDirCallBackResult.Abort:
            return false;

          default:
            throw new Exception(); // Nem�lo by nastat
        }
      }
    }

    /// <summary> Intern� rekurzivn� metoda pro proch�zen� adres���. </summary>
    private FileDirEntry BrowseInternal(string dir, Regex regEx, Regex regExNot, int depth) {
      DirectoryInfo currentDirectory = new DirectoryInfo(_BasicPath + dir);
      FileDirEntry result = new FileDirEntry(currentDirectory);

      if (depth >= 0) {
        // Soubory
        if (_FilesToResult) {
          try {
            FileInfo[] files = currentDirectory.GetFiles();

            foreach (FileInfo oneFile in files)
              if ((null == regEx || regEx.IsMatch(oneFile.Name.ToLower())) && (null == regExNot || !regExNot.IsMatch(oneFile.Name.ToLower()))) {
                if (!ProcessFile(dir + oneFile.Name, oneFile))
                  throw new ScanDirAbortException();

                result.SubEntries.Add(new FileDirEntry(oneFile));
              }
          } catch (SecurityException) { } catch (UnauthorizedAccessException) { }
        }

        // Adres��e
        try {
          DirectoryInfo[] directories = currentDirectory.GetDirectories();

          foreach (DirectoryInfo oneDirectory in directories) {
            if (_DirsToResult)
              if (!ProcessFile(dir + oneDirectory.Name + Path.DirectorySeparatorChar, oneDirectory))
                throw new ScanDirAbortException();

            result.SubEntries.Add(BrowseInternal(dir + oneDirectory.Name + Path.DirectorySeparatorChar, regEx, regExNot, depth - 1));
          }
        } catch (SecurityException) { } catch (UnauthorizedAccessException) { }
      }

      return result;
    }

    private bool _Active = false;
    /// <summary> Nastaven� do true nastartuje hled�n� soubor� podle ostatn�ch nastaven�ch parametr�.
    /// Nastaven� do false (t� zp�sobeno zm�nou jak�hokoliv parametru ScanDir) vynuluje v�sledky. </summary>
    public bool Active {
      get { return _Active; }
      set {
        if (_Active != value) {
          _Active = value;

          if (!value) {
            _Hierarchy = null;
            _ResultList.Clear();
          } else {
            if (!Directory.Exists(_BasicPath)) return;
            _Hierarchy = BrowseInternal(
              "",
              null == _FileMask ? null : new Regex(_FileMask),
              null == _FileMaskNot ? null : new Regex(_FileMaskNot),
              _ScanDepth);
          }
        }
      }
    }

    /// <summary> Popisuje jednu polo�ku hierarchick�ho v�sledku ScanDir,
    /// ukl�daj�c� kompletn� informace o souborech a adres���ch (jm�na, atributy, �asy, ...) /// </summary>
    public class FileDirEntry {
      /// <summary> </summary>
      public readonly FileSystemInfo Entry;
      /// <summary> </summary>
      public readonly ArrayList SubEntries = new ArrayList();
      /// <summary> </summary>
      public FileDirEntry(FileSystemInfo entry) {
        Entry = entry;
      }
    }
  }
}
