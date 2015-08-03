using System.IO;
using System.Text;
using System.Xml.Linq;
//using HtmlAgilityPack;

namespace LMComLib {
  // <summary>
  // Converts an HTML page to XHTML with Agility Pack. The original file is saved with an .orig extension.
  // <para>Derived from <see cref="ConvertWithRegex"/>.</para>
  // </summary>
  // <remarks>
  // <para>Singleton tags like br, br and input are automatically closed 
  // Unquoted attribute values are enclosed in quotes.
  // Attributes with no values get values (selected="")
  // Embedded server controls (in &lt;% /%&gt;) and asp server controls (&lt;asp:TextBox/&gt;) 
  // are ignored (and so is html inside them).
  // The script attribute "language" is removed.
  // </para>
  // <para>AgilityPack may skip certain markup, or wrongly change certain things it shouldn't- 
  // hence the original source is saved with the .orig extension.</para>
  // <para>Watch out: Unclosed Options are closed &lt;option%gt;1&lt;/select%gt; 
  // becomes &lt;option/%gt;1&lt;/select%gt;</para>
  // <para>Note AgilityPack has a bug that closes the FORM tag. The fix is to change HtmlNode.cs line 89 from 
  // <code>ElementsFlags.Add("form", HtmlElementFlag.CanOverlap | HtmlElementFlag.Empty);</code> to
  // <code>ElementsFlags.Add("form", HtmlElementFlag.CanOverlap);</code></para>
  // <para>AgilityPack also lowercases asp server and user control elements and values. 
  // This is usually harmless, but I hacked it...</para>
  // <para>In HtmlDocument add <code>public bool OptionOutputAsXHtml = false;</code></para>
  // <para>In HtmlAttribute add <code>internal string NameOriginalCase {    
  // get {return _ownerdocument._text.Substring(_namestartindex, _namelength);}
  // }</code></para>
  // <para>In HtmlNode add <code>private string NameOriginalCase { get {    return _ownerdocument._text.Substring(_namestartindex, _namelength); }}</code>, 
  // amend WriteAttribute(TextWriter outText, HtmlAttribute att) in first else <code>if (_ownerdocument.OptionOutputAsXHtml) {
  //                name = att.Name;
  //                if(Name.IndexOf(":") != -1) name = att.NameOriginalCase;
  //            }
  //            else //other if...</code>
  // and amend WriteTo(TextWriter outText) case HtmlNodeType.Element <code>if (_ownerdocument.OptionOutputAsXHtml) { 
  //                    name = Name;
  //                    if(Name.IndexOf(":") != -1) name = NameOriginalCase;
  //                }
  //                else //other if...</code></para>
  // </remarks>
  // <example>
  //     //Folder.Text contains the directory
  //     ConvertWithAgility c = new ConvertWithAgility();
  //     c.ConvertDirectory(Folder.Text);
  //     //show the last file converted in a TextBox
  //     textBox1.Text = c.LastHtml;
  // </example>
  //public static class Html2Xml {

  //  public static XElement ToXml(Stream str, Encoding enc) {
  //    return XElement.Parse(ToXmlString(str, enc));
  //  }

  //  public static string ToXmlString(Stream str, Encoding enc) {
  //    HtmlDocument doc = new HtmlDocument();
  //    doc.OptionWriteEmptyNodes = true; //autoclose hr, br etc
  //    doc.OptionOutputAsXml = true; //MJW extension to preserve case of server tags
  //    NB AgilityPack has a bug- see top!
  //    HtmlNode root = doc.DocumentNode;
  //    doc.Load(str, enc);
  //    CleanAttributes(root);

  //    capture the stream back into a string
  //    StringBuilder sb = new StringBuilder();
  //    StringWriter sw = new StringWriter(sb);
  //    doc.Save(sw);
  //    sw.Flush();
  //    return sw.ToString();
  //    _fileContents = sw.ToString();
  //    FixHeader();
  //    _LastFileHtml = _fileContents;
  //  }

  //  static void CleanAttributes(HtmlNode root) {
  //    xpath with language condition didn't seem to work
  //    foreach (HtmlNode script in root.Descendants("script"))
  //      if (script.Attributes["language"] != null)
  //        script.Attributes.Remove("language");

  //    look for <option selected>
  //    foreach (HtmlNode script in root.Descendants("option"))
  //      if (script.Attributes["selected"] != null)
  //        script.Attributes["selected"].Value = "selected";

  //    foreach (HtmlNode input in root.Descendants("input")) {
  //      if (input.Attributes["checked"] != null)
  //        input.Attributes["checked"].Value = "checked";
  //      if (input.Attributes["readonly"] != null)
  //        input.Attributes["readonly"].Value = "readonly";
  //      if (input.Attributes["disabled"] != null)
  //        input.Attributes["disabled"].Value = "disabled";
  //    }

  //    foreach (HtmlNode sel in root.Descendants("select")) {
  //      if (sel.Attributes["multiple"] != null)
  //        sel.Attributes["multiple"].Value = "multiple";
  //      if (sel.Attributes["disabled"] != null)
  //        sel.Attributes["disabled"].Value = "disabled";
  //    }

  //    foreach (HtmlNode hr in root.Descendants("hr")) {
  //      if (hr.Attributes["noshade"] != null)
  //        hr.Attributes["noshade"].Value = "noshade";
  //    }
  //  }
  //}
}
