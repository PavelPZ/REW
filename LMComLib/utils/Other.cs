// $Header: /cvsroot/LMCom/lmcomlib/utils/Other.cs,v 1.1 2009/05/07 05:15:13 pavel Exp $

namespace LMNetLib
{
  using System;
  using System.IO;
  using System.Web.Mail;
  using System.Text;
  using System.Threading;
  using System.Reflection;
  using System.Diagnostics;
  using System.Collections;
  using System.Collections.Specialized;
  using System.Runtime.InteropServices;

  /// <summary> Implementuje jinde neza�azen� metody. </summary>
  public class OtherCore
  {
    /// <summary> Nastav� hodnotu fieldu nebo propertry objektu. </summary>
    /// <param name="member"> Popis fieldu nebo property. </param>
    /// <param name="obj"> Objekt. </param>
    /// <param name="value"> Nastavovan� hodnota. </param>
    public static void SetMemberValue ( MemberInfo member, object obj, object value )
    {
      if ( member is FieldInfo )
        ((FieldInfo)member).SetValue( obj, value );
      else if ( member is PropertyInfo )
        ((PropertyInfo)member).SetValue( obj, value, null );
      else
        throw new Exception( string.Format( "OtherCode.SetMemberValue: unsupported member type '{0}', class '{1}', value '{2}'", member.GetType(), obj.GetType(), value.GetType() ) );
    }

    /// <summary> Vr�t� hodnotu fieldu nebo propertry objektu. </summary>
    /// <param name="member"> Popis fieldu nebo property. </param>
    /// <param name="obj"> Objekt. </param>
    /// <returns> Hodnota fieldu nebo property. </returns>
    public static object GetMemberValue ( MemberInfo member, object obj )
    {
      if ( member is FieldInfo )
        return ((FieldInfo)member).GetValue( obj );
      else if ( member is PropertyInfo )
        return ((PropertyInfo)member).GetValue( obj, null );
      else
        throw new Exception( string.Format( "OtherCode.GetMemberValue: unsupported member type '{0}', class '{1}'", member.GetType(), obj.GetType() ) );
    }

    /// <summary> Vr�t� typ fieldu nebo property objektu. </summary>
    /// <param name="member"> Popis fieldu nebo property. </param>
    /// <returns> Typ fieldu nebo property. </returns>
    public static Type GetMemberType ( MemberInfo member )
    {
      if ( member is FieldInfo )
        return ((FieldInfo)member).FieldType;
      else if ( member is PropertyInfo )
        return ((PropertyInfo)member).PropertyType;
      else
        throw new Exception( string.Format( "OtherCode.GetMemberType: unsupported member type '{0}'", member.GetType() ) );
    }

    /// <summary> Porovn� obsah 2 kolekc�. </summary>
    /// <param name="enum1">Enumer�tor 1. kolekce.</param>
    /// <param name="enum2">Enumer�tor 2. kolekce.</param>
    /// <returns>true pokud jsou kolekce stejn�.</returns>
    public static bool EnumerablesAreSame ( IEnumerator enum1, IEnumerator enum2 )
    {
      enum1.Reset();
      enum2.Reset();

      for ( ;; )
      {
        bool next1 = enum1.MoveNext();
        bool next2 = enum2.MoveNext();

        if ( !next1 || !next2 )
          return !next1 && !next2;

        if ( 0 != ((IComparable)enum1.Current).CompareTo( enum2.Current ) )
          return false;
      }
    }

    /// <summary> Vr�t� zkr�cen� BitArray. </summary>
    /// <param name="bits"> P�vodn� BitArray. </param>
    /// <param name="length"> Po�adovan� nov� men�� d�lka.</param>
    /// <returns> Zkr�cen� kopie BitArray. </returns>
    public static BitArray ShortenBitArray ( BitArray bits, int length )
    {
      BitArray result = new BitArray( length );
      for ( int i = length ; --i >= 0 ; )
        result[i] = bits[i];
      return result;
    }

    public static BitArray BitArrayCreate ( Type enumType, params int[] values)
    {
      BitArray res = new BitArray (  Enum.GetValues ( enumType).Length);
      foreach (int i in values)
        res[i] = true;
      return res;
    }
    /// <summary> Zjist�, jestli 2 bitov� pole maj� spole�n� bity. 
    /// Pole nemus� m�t stejnou d�lku, bity nav�c se berou jako shodn�. </summary>
    /// <param name="bits1"> 1. bitov� pole. </param>
    /// <param name="bits2"> 2. bitov� pole. </param>
    /// <returns> true, pokud maj� ob� pole spole�n� bity. </returns>
    public static bool BitsIntersect ( BitArray bits1, BitArray bits2 )
    {
      return BitsIntersect( bits1, bits2, false );
    }

    /// <summary> Vr�t� true, pokud jsou v�echny bity BitArray false. </summary>
    /// <param name="bits"> Bitov� pole. </param>
    /// <returns> true, pokud jsou v�echny bity pole false. </returns>
    public static bool BitArrayAllFalse ( BitArray bits )
    {
      Int32[] array = new Int32[ ( bits.Count + 31 ) /  32 ];
      bits.CopyTo( array, 0 );
      // proje� v�echny prvky a� na posledn�
      for ( int i = array.Length - 1 ; --i >= 0 ; )
        if ( array[i] != 0 )
          return false;
      // zkontroluj posledn� prvek, kter� velmi pravd�podobn� ukl�d� "necel�" 32 po�et bit�
      int countMod32 = bits.Count % 32;
      return 0 == ( array[ array.Length - 1] & ~( countMod32 == 0 ? 0 : ~1 << ( countMod32 - 1 ) ) );
    }

    /// <summary> Zjist�, jestli 2 bitov� pole maj� spole�n� bity. </summary>
    /// <param name="bits1"> 1. bitov� pole. </param>
    /// <param name="bits2"> 2. bitov� pole. </param>
    /// <param name="samesize"> true pokud mus� b�t ob� pole stejn� d�lky. </param>
    /// <returns> true, pokud maj� ob� pole spole�n� bity. </returns>
    public static bool BitsIntersect ( BitArray bits1, BitArray bits2, bool samesize )
    {
      if ( bits1 != null && bits2 != null )
      {
        BitArray intersection;
        if ( bits1.Length == bits2.Length )
          intersection = ((BitArray)bits1.Clone()).And( bits2 );
        else
        {
          if ( samesize )
            throw new Exception( string.Format( "Other.BitsIntersect: BitArrays nemaj� stejnou velikost {0} <> {1}", bits1.Length, bits2.Length ) );

          BitArray bits1Temp, bits2Temp;

          if ( bits1.Length > bits2.Length )
          {
            bits1Temp = ShortenBitArray( bits1, bits2.Length );
            bits2Temp = bits2;
          }
          else
          {
            bits1Temp = (BitArray)bits1.Clone();
            bits2Temp = ShortenBitArray( bits2, bits1.Length );
          }

          intersection = bits1Temp.And( bits2Temp );
        }

        for ( int i = intersection.Length ; --i >= 0 ; )
          if ( intersection[i] )
            return true;
      }

      return false;
    }

    /// <summary> Zjist�, jestli stejn� dlouh� BitArrays maj� nastaven� stejn� bity. </summary>
    /// <param name="bits1"> 1. BitArray. </param>
    /// <param name="bits2"> 2. BitArray. </param>
    /// <returns> true, kdy� maj� nastaven� stejn� bity. </returns>
    public static bool BitArraysEqual ( BitArray bits1, BitArray bits2 )
    {
      if ( bits1.Count != bits2.Count )
        throw new Exception( string.Format( "OtherCore.BitArraysEqual: different BitArray sizes {0} != {1}", bits1.Count != bits2.Count ) );

      return EnumerablesAreSame( bits1.GetEnumerator(), bits2.GetEnumerator() );
//
//      int[] array1 = new int[ ( bits1.Count + 31 ) / 32 ];
//      bits1.CopyTo( array1, 0 );
//      int[] array2 = new int[ array1.Length ];
//      bits2.CopyTo( array2, 0 );
//
//      for ( int index = array1.Length ; --index >= 0 ; )
//        if ( array1[ index ] != array2[ index ] )
//          return false;
//
//      return true;
    }

    /// <summary> Zalo�� StringCollection z pole string�. </summary>
    /// <param name="strings"> Pole string�. </param>
    /// <returns> StringCollection vznikl� z pole string�. </returns>
    public static StringCollection StringCollection ( params string[] strings )
    {
      StringCollection result = new StringCollection();
      if ( strings != null )
        foreach( string str in strings )
          result.Add( str );
      return result;
    }

    /// <summary> Obsahuje li cesta mezery, tak ji obal� uvozovkami. </summary>
    /// <param name="path"> Cesta na nap�. soubor. </param>
    /// <returns> Upraven� cesta. </returns>
    public static string QuotePath ( string path )
    {
      return -1 == path.IndexOf( ' ' ) ? path : "\"" + path + "\"";
    }

    /// <summary> Za null string vr�t� jeho zadanou n�hradu. </summary>
    /// <param name="value"> Vstupn� string. </param>
    /// <param name="replacement"> N�hrada za null stringy. </param>
    /// <returns> Normalizovan� string. </returns>
    public static string UnNullString ( string value, string replacement )
    {
      return value != null ? value : replacement;
    }

    /// <summary> Z null string� vr�t� pr�zdn� string. </summary>
    /// <param name="value"> Vstupn� string. </param>
    /// <returns> Non-null string. </returns>
    public static string UnNullString ( string value )
    {
      return UnNullString( value, "" );
    }

    /// <summary> Spust� synchronn� extern� proces nebo dokument v norm�ln�m okn�. </summary>
    /// <param name="executable">Cesta k souboru, kter� se m� spustit nebo otev��t.</param>
    /// <param name="arguments">Argumenty.</param>
    /// <returns>Objekt typu Process popisuj�c� spu�t�n� proces.</returns>
    public static Process LaunchProcess ( string executable, string arguments )
    {
      bool dummy;

      return LaunchProcess( executable, arguments, true, ProcessWindowStyle.Normal, ProcessPriorityClass.Normal, true, false, false, false, Int32.MaxValue, out dummy );
    }

    /// <summary> Spust� synchronn� extern� proces nebo dokument v norm�ln�m okn�. </summary>
    /// <param name="executable">Cesta k souboru, kter� se m� spustit nebo otev��t.</param>
    /// <param name="arguments">Argumenty.</param>
    /// <param name="priorityClass">Priorita procesu.</param>
    /// <returns>Objekt typu Process popisuj�c� spu�t�n� proces.</returns>
    public static Process LaunchProcess ( string executable, string arguments, ProcessPriorityClass priorityClass )
    {
      bool dummy;

      return LaunchProcess( executable, arguments, true, ProcessWindowStyle.Normal, priorityClass, true, false, false, false, Int32.MaxValue, out dummy );
    }

    /// <summary> Spust� extern� proces nebo dokument v norm�ln�m okn�. </summary>
    /// <param name="executable">Cesta k souboru, kter� se m� spustit nebo otev��t.</param>
    /// <param name="arguments">Argumenty.</param>
    /// <param name="synchronous">true, pokud se m� �eka na ukon�en� procesu.</param>
    /// <returns>Objekt typu Process popisuj�c� spu�t�n� proces.</returns>
    public static Process LaunchProcess ( string executable, string arguments, bool synchronous )
    {
      bool dummy;

      return LaunchProcess( executable, arguments, synchronous, ProcessWindowStyle.Normal, ProcessPriorityClass.Normal, true, false, false, false, Int32.MaxValue, out dummy );
    }

    /// <summary> Spust� extern� proces. </summary>
    /// <param name="executable">Cesta k souboru, kter� se m� spustit nebo otev��t.</param>
    /// <param name="arguments">Argumeny.</param>
    /// <param name="synchronous">true, pokud se m� �eka na ukon�en� procesu.</param>
    /// <param name="windowStyle">Styl okna procesu.</param>
    /// <param name="priorityClass">Priorita procesu.</param>
    /// <param name="useShellExecute">false, pokud se m� process spustit p��mo.</param>
    /// <param name="redirectStdOut">true, pokud se m� v�stup p�esm�rovat do Process.StandardOutput.</param>
    /// <param name="redirectStdErr">true, pokud se m� error v�stup p�esm�rovat do Process.StandardError.</param>
    /// <param name="redirectStdInput">true, pokud se m� vstup p�esm�rovat do Process.StandardInput.</param>
    /// <param name="timeout">P�i synchronous true ur�uje timout procesu, Int32.MaxValue znamen� bez timeoutu.</param>
    /// <param name="wasTimeout">true, pokud procesu vypr�el timeout.</param>
    /// <returns>Objekt typu Process popisuj�c� spu�t�n� proces.</returns>
    public static Process LaunchProcess ( string executable, string arguments, bool synchronous,
      ProcessWindowStyle windowStyle, ProcessPriorityClass priorityClass,
      bool useShellExecute, bool redirectStdOut, bool redirectStdErr, bool redirectStdInput, int timeout, out bool wasTimeout )
    {
      Process prc = new Process();
      prc.StartInfo = new ProcessStartInfo( executable, arguments );
      prc.StartInfo.WindowStyle = windowStyle;
      prc.StartInfo.CreateNoWindow = windowStyle == ProcessWindowStyle.Hidden;
      prc.StartInfo.UseShellExecute = useShellExecute;
      prc.StartInfo.RedirectStandardOutput = redirectStdOut;
      prc.StartInfo.RedirectStandardError = redirectStdErr;
      prc.StartInfo.RedirectStandardInput = redirectStdInput;
      prc.Start();
      prc.PriorityClass = priorityClass;
      if ( synchronous )
      {
        if ( timeout == Int32.MaxValue )
        {
          prc.WaitForExit();
          wasTimeout = false;
        }
        else
          wasTimeout = !prc.WaitForExit( timeout );
      }
      else
        wasTimeout = false;

      return prc;
    }

    private static DateTime assmVerLimitMin = new DateTime( 2000, 1, 1 );
    private static DateTime assmVerLimitMax = DateTime.UtcNow.AddMonths( 1 );

    /// <summary> Vytvo�� string s vers� zadan�ho assembly. P�edpokl�d�, �e assembly je versov�no atributem ve
    /// tvaru [assembly: AssemblyVersion("major.minor.*")]. V�sledkem je string major.minor.revision.build date time </summary>
    /// <param name="assembly"> Assembly. </param>
    /// <returns> Verse assembly. </returns>
    public static string GetAssemblyVersion ( Assembly assembly )
    {
      Version ver = assembly.GetName().Version;
      string result = string.Format( "{0} {1}.{2}.{3}.{4}", assembly.GetName().Name, ver.Major, ver.Minor, ver.Build, ver.Revision );
      if ( ver.Revision != 0 )
      {
        DateTime dt = assmVerLimitMin.AddDays( ver.Build ).AddSeconds( ver.Revision * 2 );
        if ( dt < assmVerLimitMax )
          result += dt.ToString( " dd.MM.yyyy HH:mm:ss" );
      }
      return result;
    }

    /// <summary> Do v�sledku zap�e na jednotliv� ��dky verse pou�it�ch assemblies. </summary>
    /// <param name="lineDelim"> Odd�lova� ��dk�. </param>
    /// <returns>Verse assemblies. </returns>
    public static string GetAssembliesVersion ( string lineDelim )
    {
      ArrayList list = new ArrayList();
      foreach ( Assembly assembly in AppDomain.CurrentDomain.GetAssemblies() )
        list.Add( GetAssemblyVersion( assembly ) );
      list.Sort();
      StringBuilder result = new StringBuilder();
      foreach ( string assmStr in list )
      {
        if ( result.Length != 0 )
          result.Append( lineDelim );
        result.Append( assmStr );
      }
      return result.ToString();
    }

    /// <summary> Do v�sledku zap�e na jednotliv� ��dky verse pou�it�ch assemblies. </summary>
    /// <returns>Verse assemblies. </returns>
    public static string GetAssembliesVersion ()
    {
      return GetAssembliesVersion( "\r\n" );
    }

    /// <summary>Replaces backslashes by slashes.</summary>
    /// <param name="input">Input string.</param>
    /// <returns>Returns original string with replaced backslashes by slashes.</returns>
    public static string EnsureSlashes ( string input )
    {
      return input.Replace( '\\', '/' );
    }

    /// <summary> Replaces slashes by backslashes.</summary>
    /// <param name="Input">Input string.</param>
    /// <returns>Returns original string with placed slashes by backslashes.</returns>
    public static string EnsureBackSlashes ( string Input )
    {
      return Input.Replace( '/', '\\' );
    }
  }

  /*
  /// <summary> T��da pro Emailing. </summary>
  public class Email
  {
    /// <summary> Ode�le SMTP email. Vy�aduje nainstalovan� IIS. </summary>
    /// <param name="from"> Odes�latel. </param>
    /// <param name="to"> P��jemce. </param>
    /// <param name="cc"> Kopie. </param>
    /// <param name="subject"> P�edm�t. </param>
    /// <param name="message"> Zpr�va. </param>
    /// <param name="attachments"> P��lohy. </param>
    public static void Send ( string from, string to, string cc, string subject, string message, IList attachments )
    {
      Send( from, to, cc, null, subject, message, attachments, null );
    }

    /// <summary> Ode�le SMTP email. </summary>
    /// <param name="from"> Odes�latel. </param>
    /// <param name="to"> P��jemce. </param>
    /// <param name="cc"> Kopie. </param>
    /// <param name="subject"> P�edm�t. </param>
    /// <param name="message"> Zpr�va. </param>
    /// <param name="attachments"> P��lohy. </param>
    /// <param name="smtpServer"> SMTP server. </param>
    public static void Send ( string from, string to, string cc, string subject, string message, IList attachments, string smtpServer )
    {
      Send( from, to, cc, null, subject, message, attachments, smtpServer );
    }

    /// <summary> Ode�le SMTP email. </summary>
    /// <param name="from"> Odes�latel. </param>
    /// <param name="to"> P��jemce. </param>
    /// <param name="cc"> Kopie. </param>
    /// <param name="bcc"> Slep� kopie. </param>
    /// <param name="subject"> P�edm�t. </param>
    /// <param name="message"> Zpr�va. </param>
    /// <param name="attachments"> P��lohy. </param>
    /// <param name="smtpServer"> SMTP server. </param>
    public static void Send ( string from, string to, string cc, string bcc, string subject, string message, IList attachments, string smtpServer )
    {
      try
      {
        MailMessage msg = new MailMessage();
        msg.From = from;
        msg.To = to;
        msg.Cc = cc;
        msg.Bcc = bcc;
        msg.Subject = subject;
        msg.Body = message;
        msg.BodyFormat = MailFormat.Text;
        if ( attachments != null )
          foreach ( object attachment in attachments )
            msg.Attachments.Add( attachment );
      
        if ( smtpServer != null && smtpServer.Length != 0 )
          SmtpMail.SmtpServer = smtpServer;

        SmtpMail.Send( msg );
      }
      catch ( Exception e )
      {
        throw new Exception( string.Format( "Email.Send: from '{0}', to '{1}', cc '{2}', subject '{3}', message '{4}', server '{5}', exception '{6}'", 
          from, to, cc, subject, message, smtpServer, e.ToString() ) );
      }
    }

    /// <summary> Ode�le SMTP email. </summary>
    /// <param name="from"> Odes�latel. </param>
    /// <param name="to"> P��jemce. </param>
    /// <param name="cc"> Kopie. </param>
    /// <param name="bcc"> Slep� kopie. </param>
    /// <param name="subject"> P�edm�t. </param>
    /// <param name="message"> Zpr�va. </param>
    /// <param name="attachments"> P��lohy. </param>
    /// <param name="smtpServer"> SMTP server. </param>
    /// <param name="mailFormat"> Form�t textu. </param>
    public static void Send ( string from, string to, string cc, string bcc, string subject, string message, IList attachments, string smtpServer, MailFormat mailFormat )
    {
      try
      {
        MailMessage msg = new MailMessage();
        msg.From = from;
        msg.To = to;
        msg.Cc = cc;
        msg.Bcc = bcc;
        msg.Subject = subject;
        msg.Body = message;
        msg.BodyFormat = mailFormat;
        if ( mailFormat == MailFormat.Html )
          msg.BodyEncoding = Encoding.UTF8;
        if ( attachments != null )
          foreach ( object attachment in attachments )
            msg.Attachments.Add( attachment );
      
        if ( smtpServer != null && smtpServer.Length != 0 )
          SmtpMail.SmtpServer = smtpServer;

        SmtpMail.Send( msg );
      }
      catch ( Exception e )
      {
        throw new Exception( string.Format( "Email.Send: from '{0}', to '{1}', cc '{2}', subject '{3}', message '{4}', server '{5}', exception '{6}'", 
          from, to, cc, subject, message, smtpServer, e.ToString() ) );
      }
    }

    /// <summary> Vytvo�� v TEMP do�asn� soubor (Email p��lohu) dan�ho jm�na a textov�ho obsahu. </summary>
    /// <param name="fileName"> Jm�no souboru. </param>
    /// <param name="content"> Obsah souboru. </param>
    /// <returns> P�iloha pro Email. </returns>
    public static MailAttachment CreateTextAttachment ( string fileName, string content )
    {
      string tempDir = Path.GetTempFileName();
      File.Delete( tempDir );
      Directory.CreateDirectory( tempDir );
      string fullPath = tempDir + Path.DirectorySeparatorChar + fileName;
      TextWriter file = new StreamWriter( fullPath, false, Encoding.Default );
      try
      {
        file.Write( content );
      }
      finally
      {
        file.Close();
      }
      return new MailAttachment( fullPath );
    }

    /// <summary> Sma�e do�asnou Email p��lohu vyrobenou pomoc� <see cref="CreateTextAttachment"/>. </summary>
    /// <param name="attachment"> Do�asn� p��loha. </param>
    public static void DeleteTextAttachment ( MailAttachment attachment )
    {
      File.Delete( attachment.Filename );
      Directory.Delete( Path.GetDirectoryName( attachment.Filename ), false );
    }
  }
   * */
  
  /// <summary> Specifick� Windows metody pro kl�vesnici. </summary>
  public class Keyboard
  {
    /// <summary> The GetAsyncKeyState function determines whether a key is up or down at the time the function is called, 
    /// and whether the key was pressed after a previous call to GetAsyncKeyState.  </summary>
    /// <param name="virtualKey"> Specifies a virtual key. </param>
    [DllImport("User32.dll")]
    public static extern Int16 GetAsyncKeyState ( Int32 virtualKey );

    /// <summary>The GetKeyState function retrieves the status of the specified virtual key. 
    /// The status specifies whether the key is up, down, or toggled (on, off�alternating each time the key is pressed). </summary>
    /// <param name="virtualKey"> Specifies a virtual key. </param>
    [DllImport("User32.dll")]
    public static extern Int16 GetKeyState ( Int32 virtualKey );

    /// <summary> The key is down; otherwise, it is up. </summary>
    public const Int16 KeyPressed = -32768;
    /// <summary> The key is toggled (GetKeyState) or changed state from last call (GetAsyncKeyState). </summary>
    public const Int16 KeyToggledOrChanged = 1;

    // Virtual key codes.
    public const Int32 VK_SHIFT     = 0x10;
    public const Int32 VK_CONTROL   = 0x11;
    public const Int32 VK_MENU      = 0x12;
    public const Int32 VK_LBUTTON   = 0x01;
    public const Int32 VK_RBUTTON   = 0x02;
    public const Int32 VK_CANCEL    = 0x03;
    public const Int32 VK_MBUTTON   = 0x04;
    public const Int32 VK_LWIN      = 0x5b;
    public const Int32 VK_RWIN      = 0x5c;
    public const Int32 VK_LSHIFT    = 0xa0;
    public const Int32 VK_RSHIFT    = 0xa1;
    public const Int32 VK_LCONTROL  = 0xa2;
    public const Int32 VK_RCONTROL  = 0xa3;
    public const Int32 VK_LMENU     = 0xa4;
    public const Int32 VK_RMENU     = 0xa5;
  }

  /// <summary> R�zn� normaliza�n� metody. </summary>
  public class Normalize
  {
    /// <summary> Normalizuje url. </summary>
    /// <remarks> Aby bylo mo�n� porovnat dv� url, vypo��t�vat HashUrl apod. </remarks>
    /// <param name="url">url</param>
    /// <returns>Normalizovan� tvar url.</returns>
    public static string Url(string url)
    {
      return url == null ? null : url.ToLower();
    }

    /// <summary> Obal� z�stupn� znaky v Url hranat�mi z�vorkami tak, aby Url bylo pou�iteln� v klauzuli LIKE SQL dotazu. </summary>
    /// <remarks> Vrac� normalizovan� tvar url, tj. pou��v� intern� metodu Url. </remarks>
    /// <param name="url"> Vstupn� Url. </param>
    /// <returns>Upraven� Url.</returns>
    public static string UrlForLike(string url)
    {
      string newUrl = Url( url );
      if ( newUrl != null )
        return null;//SQLUtils.SafeSqlLikeClauseLiteral( newUrl );
      else
        return newUrl;
    }
  }

  /*
  /// <summary> String (resp. obal nad n�m), kter� v sob� dok�e uchovat svoje r�zn� lokalizace. </summary>
  public class LocalizedString
  {
    /// <summary>
    /// Zalo�� lokalizovan� string ze stringu - kontaineru, kter� obsahuje v�echny lokalizovan� verse. 
    /// Implicitn� jazyk je �e�tina.
    /// </summary>
    /// <param name="container"> Kontejner, tj. string, kter� obsahuje lokalizovan� verse.</param>
    public LocalizedString ( string container ) : this( container, "CSY" ) {}

    /// <summary> Zalo�� lokalizovan� string ze stringu - kontaineru, kter� obsahuje v�echny lokalizovan� verse.  </summary>
    /// <param name="container"> Kontejner, tj. string, kter� obsahuje lokalizovan� verse.</param>
    /// <param name="defaultLanguage"> Implicitn� jazyk, pokud string nen� lokalizov�n. Zad�n pomoc� LCID. </param>
    public LocalizedString ( string container, int defaultLanguage ) : this ( container, ConvertsCore.LCID2ThreeLetterWindows( defaultLanguage ) ) {}

    /// <summary> Zalo�� lokalizovan� string ze stringu - kontaineru, kter� obsahuje v�echny lokalizovan� verse.  </summary>
    /// <param name="container"> Kontejner, tj. string, kter� obsahuje lokalizovan� verse.</param>
    /// <param name="defaultLanguage"> Implicitn� jazyk, pokud string nen� lokalizov�n. Zad�n pomoc� 3p�smenn� zkratky (nap�. ENU). </param>
    public LocalizedString ( string container, string defaultLanguage )
    {
      this.defaultLanguage = defaultLanguage;

      if ( container.Length == 0 || container[0] != signature)
      {
        strings = new StringDictionary();
        strings.Add( defaultLanguage, container );
      }
      else
        strings = CommaText.CommaTextToStringDictionary( container.Substring( signatureInString.Length ) );
    }

    /// <summary> Zna�ka pro ozna�en� stringov�ho kontejneru, kter� obsahuje lokalizovan� stringy. </summary>
    private const char signature = '~';
    /// <summary> Zna�ka pro ozna�en� stringov�ho kontejneru, kter� obsahuje lokalizovan� stringy. </summary>
    private const string signatureInString = "~";
    /// <summary> Uschovan� implicitn� jazyk. </summary>
    private readonly string defaultLanguage;
    /// <summary> Kolekce p�r� jazyk-string. </summary>
    private readonly StringDictionary strings;

    /// <summary> P��stup ke kolekci p�r� pro listing. </summary>
    public StringDictionary Strings
    {
      get
      {
        return strings;
      }
    }

    /// <summary> Indexer pro p��stup ke stringu dan�ho jazyka. Jazyk zad�n pomoc� LCID. </summary>
    public string this[ int language ]
    {
      get
      {
        return (string)strings[ ConvertsCore.LCID2ThreeLetterWindows( language ) ];
      }
      set
      {
        strings[ ConvertsCore.LCID2ThreeLetterWindows( language ) ] = value;
      }
    }

    /// <summary> Indexer pro p��stup ke stringu dan�ho jazyka. Jazyk zad�n pomoc� 3p�smenn� zkratky, nap�. ENU. </summary>
    public string this[ string language ]
    {
      get
      {
        return (string)strings[ language ];
      }
      set
      {
        strings[ language ] = value;
      }
    }

    /// <summary> Vyjme z kolekce p�elo�en�ch string� string dan�ho jazyka. </summary>
    /// <param name="language"> Jazyk zadan� jako 3p�smenn� zkratka (nap�. ENU). </param>
    public void Remove ( string language )
    {
      strings.Remove( language );
    }

    /// <summary> Vyjme z kolekce p�elo�en�ch string� string dan�ho jazyka. </summary>
    /// <param name="language"> Jazyk zadan� jako LCID. </param>
    public void Remove ( int language )
    {
      strings.Remove( ConvertsCore.LCID2ThreeLetterWindows( language ) );
    }

    /// <summary> Vr�t� obsah stringov�ho kontejneru obsahuj�c� v�echny lokalizovan� stringy. </summary>
    /// <returns> Obsah stringov�ho kontejneru obsahuj�c� v�echny lokalizovan� stringy. </returns>
    public override string ToString ()
    {
      if ( strings.Count == 1 && strings.ContainsKey( defaultLanguage ) )
        return strings[ defaultLanguage ];
      else
        return signatureInString + CommaText.StringDictionaryToCommaText( strings );
    }
  }
   * */
}