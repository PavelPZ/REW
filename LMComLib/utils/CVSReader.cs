/* CSVReader - a simple open source C# class library to read CSV data
 * by Andrew Stellman - http://www.stellman-greene.com/CSVReader
 * 
 */

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Data;
using System.Text;

namespace LMNetLib {
  /// <summary>
  /// Read CSV-formatted data from a file or TextReader
  /// </summary>
  public static class CSVLib {

    public class BreakException : Exception {
      public string Line; public string Value; public int LineIndex; public int ValueIndex;
      public BreakException(string msg, string value, int valueIndex, string line, int lineIndex)
        : base(msg) {
        Line = line; Value = value; LineIndex = lineIndex; ValueIndex = valueIndex;
      }
    };

    public const string NEWLINE = "\r\n";

    public static IEnumerable<IEnumerable<string>> ReadRows(string file, Func<string, int, string, int, string> validate) {
      int lineIdx = 0;
      return file.Split(new string[] { "\r", "\n" }, StringSplitOptions.RemoveEmptyEntries).Select(l => ReadRow(l, (value, idx) => {
        return validate(value, idx, l, lineIdx++);
      }));
    }

    public static void WriteRows(IEnumerable<IEnumerable<string>> data, string newline, Action<string> write) {
      bool firstLine = true;
      WriteRows(data, newline, write, ref firstLine);
    }

    static void WriteRow(IEnumerable<string> data, Action<string> write, ref bool firstItem) {
      foreach (string val in data) {
        if (firstItem) firstItem = false; else write(",");
        if (val != null && val.IndexOf('"') >= 0) { write("\""); write(val.Replace("\"", "\"\"")); write("\""); } else write(val);
      }
    }

    static void WriteRows(IEnumerable<IEnumerable<string>> data, string newline, Action<string> write, ref bool firstLine) {
      foreach (var rw in data) {
        if (firstLine) firstLine = false; else write(newline);
        bool firstItem = true;
        WriteRow(rw, write, ref firstItem);
      }
    }

    static IEnumerable<string> ReadRow(string currentLine, Func<string, int, string> validate) {
      int status = 0; int idx = 0; int startPart = 0;
      while (idx < currentLine.Length)
        try {
          char actChar = currentLine[idx]; char nextChar = idx == currentLine.Length - 1 ? '\x0' : currentLine[idx + 1];
          switch (status) {
            case 0: //mezera
              if (char.IsWhiteSpace(actChar)) break;
              startPart = idx;
              if (actChar == '"') { status = 1; startPart++; } else status = 2;
              break;
            case 1: //uprostred ""
              if (actChar != '"') break;
              if (nextChar == '"') { idx++; break; } else { yield return currentLine.Substring(startPart, idx - startPart).Replace("\"\"", "\""); status = 3; break; }
            case 2:
              if (actChar != ',') break;
              yield return currentLine.Substring(startPart, idx - startPart).TrimEnd();
              status = 0;
              break;
            case 3: //mezery za ""
              if (char.IsWhiteSpace(actChar)) break;
              if (actChar != ',') throw new Exception();
              status = 0;
              break;
          }
        } finally { idx++; }
      if (status == 2 && startPart < currentLine.Length) yield return currentLine.Substring(startPart, idx - startPart).TrimEnd();
    }

    /*static string ReadNextObject(string currentLine, ref int idx, Func<string, string> validate) {
      if (currentLine == null) throw new Exception();

      // Check to see if the next value is quoted
      bool quoted = currentLine.StartsWith("\"");

      // Find the end of the next value
      string nextObjectString = "";
      int i = 0;
      int len = currentLine.Length;
      bool foundEnd = false;
      while (!foundEnd && i <= len) {
        // Check if we've hit the end of the string
        if ((!quoted && i == len) // non-quoted strings end with a comma or end of line
            || (!quoted && currentLine.Substring(i, 1) == ",")
          // quoted strings end with a quote followed by a comma or end of line
            || (quoted && i == len - 1 && currentLine.EndsWith("\""))
            || (quoted && currentLine.Substring(i, 2) == "\","))
          foundEnd = true;
        else
          i++;
      }
      if (quoted) {
        if (i > len || !currentLine.Substring(i, 1).StartsWith("\""))
          throw new FormatException("Invalid CSV format: " + currentLine.Substring(0, i));
        i++;
      }
      nextObjectString = currentLine.Substring(0, i).Replace("\"\"", "\"");

      if (i < len)
        currentLine = currentLine.Substring(i + 1);
      else
        currentLine = null;

      if (quoted) {
        if (nextObjectString.StartsWith("\""))
          nextObjectString = nextObjectString.Substring(1);
        if (nextObjectString.EndsWith("\""))
          nextObjectString = nextObjectString.Substring(0, nextObjectString.Length - 1);
      }
      return validate(nextObjectString);
    }*/

  }
}
