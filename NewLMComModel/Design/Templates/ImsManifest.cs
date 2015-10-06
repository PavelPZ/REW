﻿// ------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version: 14.0.0.0
//  
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
// ------------------------------------------------------------------------------
namespace NewData.Design.Templates
{
    using System.Linq;
    using System.Text;
    using System.Collections.Generic;
    using LMComLib;
    using LMNetLib;
    using System;
    
    /// <summary>
    /// Class to produce the template output
    /// </summary>
    
    #line 1 "D:\LMCom\REW\NewLMComModel\Design\Templates\ImsManifest.tt"
    [global::System.CodeDom.Compiler.GeneratedCodeAttribute("Microsoft.VisualStudio.TextTemplating", "14.0.0.0")]
    public partial class ImsManifest : ImsManifestBase
    {
#line hidden
        /// <summary>
        /// Create the template output
        /// </summary>
        public virtual string TransformText()
        {
            this.Write(" \r\n");
            this.Write(" \r\n");
            this.Write(" \r\n\r\n");
            
            #line 9 "D:\LMCom\REW\NewLMComModel\Design\Templates\ImsManifest.tt"
 
  const string producerId = "com";
  const string producer = "LANGMaster.com"; 
  var line = cfg.line; 
  var productTitle = cfg.title;
  var productNum = cfg.prodUrl; 
  var dictId = CommonLib.LineIdToLang(line).ToString().Replace('_', '-');
  string uniqueId = producerId + "-" + productNum.Replace('/','-') + "-" + cfg.langStr; 

            
            #line default
            #line hidden
            this.Write(@"<?xml version=""1.0"" encoding=""utf-8""?>
<manifest xmlns=""http://www.imsproject.org/xsd/imscp_rootv1p1p2"" xmlns:imsmd=""http://www.imsproject.org/xsd/ims_md_rootv1p1"" xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:adlcp=""http://www.adlnet.org/xsd/adlcp_rootv1p2"" xsi:schemaLocation=""http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsproject.org/xsd/ims_md_rootv1p1 ims_md_rootv1p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd""
   identifier=""MANIFEST-");
            
            #line 20 "D:\LMCom\REW\NewLMComModel\Design\Templates\ImsManifest.tt"
            this.Write(this.ToStringHelper.ToStringWithCulture(uniqueId));
            
            #line default
            #line hidden
            this.Write("\">\r\n  <metadata>\r\n    <schema>ADL SCORM</schema>\r\n    <schemaversion>1.2</schemav" +
                    "ersion>\r\n    <lom xmlns=\"http://www.imsglobal.org/xsd/imsmd_rootv1p2p1\">  \r\n    " +
                    "  <general>\r\n        <title>\r\n          <langstring>");
            
            #line 27 "D:\LMCom\REW\NewLMComModel\Design\Templates\ImsManifest.tt"
            this.Write(this.ToStringHelper.ToStringWithCulture(productTitle));
            
            #line default
            #line hidden
            this.Write("</langstring>\r\n        </title>\r\n        <description>\r\n          <langstring>");
            
            #line 30 "D:\LMCom\REW\NewLMComModel\Design\Templates\ImsManifest.tt"
            this.Write(this.ToStringHelper.ToStringWithCulture(productTitle));
            
            #line default
            #line hidden
            this.Write("</langstring>\r\n        </description>\r\n      </general>\r\n    </lom>\r\n  </metadata" +
                    ">\r\n  <organizations default=\"ORG-");
            
            #line 35 "D:\LMCom\REW\NewLMComModel\Design\Templates\ImsManifest.tt"
            this.Write(this.ToStringHelper.ToStringWithCulture(uniqueId));
            
            #line default
            #line hidden
            this.Write("\"> \r\n    <organization identifier=\"ORG-");
            
            #line 36 "D:\LMCom\REW\NewLMComModel\Design\Templates\ImsManifest.tt"
            this.Write(this.ToStringHelper.ToStringWithCulture(uniqueId));
            
            #line default
            #line hidden
            this.Write("\" structure=\"hierarchical\">\r\n      <title>");
            
            #line 37 "D:\LMCom\REW\NewLMComModel\Design\Templates\ImsManifest.tt"
            this.Write(this.ToStringHelper.ToStringWithCulture(producer));
            
            #line default
            #line hidden
            this.Write("</title>\r\n      <item isvisible=\"true\" identifier=\"ITEM1-");
            
            #line 38 "D:\LMCom\REW\NewLMComModel\Design\Templates\ImsManifest.tt"
            this.Write(this.ToStringHelper.ToStringWithCulture(uniqueId));
            
            #line default
            #line hidden
            this.Write("\" identifierref=\"RES1-");
            
            #line 38 "D:\LMCom\REW\NewLMComModel\Design\Templates\ImsManifest.tt"
            this.Write(this.ToStringHelper.ToStringWithCulture(uniqueId));
            
            #line default
            #line hidden
            this.Write("\"> \r\n        <adlcp:masteryscore>75</adlcp:masteryscore> \r\n        <title>");
            
            #line 40 "D:\LMCom\REW\NewLMComModel\Design\Templates\ImsManifest.tt"
            this.Write(this.ToStringHelper.ToStringWithCulture(productTitle));
            
            #line default
            #line hidden
            this.Write("</title>\r\n      </item>  \r\n    </organization>\r\n  </organizations>\r\n  <resources>" +
                    "\r\n    <resource identifier=\"RES1-");
            
            #line 45 "D:\LMCom\REW\NewLMComModel\Design\Templates\ImsManifest.tt"
            this.Write(this.ToStringHelper.ToStringWithCulture(uniqueId));
            
            #line default
            #line hidden
            this.Write("\" href=\"schools/index.htm\" type=\"webcontent\" adlcp:scormtype=\"sco\">\r\n      <file " +
                    "href=\"schools/index.htm\" />\r\n      <dependency identifierref=\"RES2-");
            
            #line 47 "D:\LMCom\REW\NewLMComModel\Design\Templates\ImsManifest.tt"
            this.Write(this.ToStringHelper.ToStringWithCulture(uniqueId));
            
            #line default
            #line hidden
            this.Write("\" />\r\n    </resource>\r\n    <resource identifier=\"RES2-");
            
            #line 49 "D:\LMCom\REW\NewLMComModel\Design\Templates\ImsManifest.tt"
            this.Write(this.ToStringHelper.ToStringWithCulture(uniqueId));
            
            #line default
            #line hidden
            this.Write("\" href=\"\" type=\"webcontent\" adlcp:scormtype=\"asset\">\r\n      ");
            
            #line 50 "D:\LMCom\REW\NewLMComModel\Design\Templates\ImsManifest.tt"
 foreach (var f in files) {
            
            #line default
            #line hidden
            this.Write("      <file href=\"");
            
            #line 51 "D:\LMCom\REW\NewLMComModel\Design\Templates\ImsManifest.tt"
            this.Write(this.ToStringHelper.ToStringWithCulture(f));
            
            #line default
            #line hidden
            this.Write("\" />\r\n      ");
            
            #line 52 "D:\LMCom\REW\NewLMComModel\Design\Templates\ImsManifest.tt"
 } 
            
            #line default
            #line hidden
            this.Write("    ");
            
            #line 53 "D:\LMCom\REW\NewLMComModel\Design\Templates\ImsManifest.tt"
 /*
#include SourcePath + "scormGlobalFiles.iss"
#include SourcePath + "products\" + productId + "_scorm_files.iss"
*/ 
            
            #line default
            #line hidden
            this.Write("    </resource>\r\n  </resources>\r\n</manifest>");
            return this.GenerationEnvironment.ToString();
        }
    }
    
    #line default
    #line hidden
    #region Base class
    /// <summary>
    /// Base class for this transformation
    /// </summary>
    [global::System.CodeDom.Compiler.GeneratedCodeAttribute("Microsoft.VisualStudio.TextTemplating", "14.0.0.0")]
    public class ImsManifestBase
    {
        #region Fields
        private global::System.Text.StringBuilder generationEnvironmentField;
        private global::System.CodeDom.Compiler.CompilerErrorCollection errorsField;
        private global::System.Collections.Generic.List<int> indentLengthsField;
        private string currentIndentField = "";
        private bool endsWithNewline;
        private global::System.Collections.Generic.IDictionary<string, object> sessionField;
        #endregion
        #region Properties
        /// <summary>
        /// The string builder that generation-time code is using to assemble generated output
        /// </summary>
        protected System.Text.StringBuilder GenerationEnvironment
        {
            get
            {
                if ((this.generationEnvironmentField == null))
                {
                    this.generationEnvironmentField = new global::System.Text.StringBuilder();
                }
                return this.generationEnvironmentField;
            }
            set
            {
                this.generationEnvironmentField = value;
            }
        }
        /// <summary>
        /// The error collection for the generation process
        /// </summary>
        public System.CodeDom.Compiler.CompilerErrorCollection Errors
        {
            get
            {
                if ((this.errorsField == null))
                {
                    this.errorsField = new global::System.CodeDom.Compiler.CompilerErrorCollection();
                }
                return this.errorsField;
            }
        }
        /// <summary>
        /// A list of the lengths of each indent that was added with PushIndent
        /// </summary>
        private System.Collections.Generic.List<int> indentLengths
        {
            get
            {
                if ((this.indentLengthsField == null))
                {
                    this.indentLengthsField = new global::System.Collections.Generic.List<int>();
                }
                return this.indentLengthsField;
            }
        }
        /// <summary>
        /// Gets the current indent we use when adding lines to the output
        /// </summary>
        public string CurrentIndent
        {
            get
            {
                return this.currentIndentField;
            }
        }
        /// <summary>
        /// Current transformation session
        /// </summary>
        public virtual global::System.Collections.Generic.IDictionary<string, object> Session
        {
            get
            {
                return this.sessionField;
            }
            set
            {
                this.sessionField = value;
            }
        }
        #endregion
        #region Transform-time helpers
        /// <summary>
        /// Write text directly into the generated output
        /// </summary>
        public void Write(string textToAppend)
        {
            if (string.IsNullOrEmpty(textToAppend))
            {
                return;
            }
            // If we're starting off, or if the previous text ended with a newline,
            // we have to append the current indent first.
            if (((this.GenerationEnvironment.Length == 0) 
                        || this.endsWithNewline))
            {
                this.GenerationEnvironment.Append(this.currentIndentField);
                this.endsWithNewline = false;
            }
            // Check if the current text ends with a newline
            if (textToAppend.EndsWith(global::System.Environment.NewLine, global::System.StringComparison.CurrentCulture))
            {
                this.endsWithNewline = true;
            }
            // This is an optimization. If the current indent is "", then we don't have to do any
            // of the more complex stuff further down.
            if ((this.currentIndentField.Length == 0))
            {
                this.GenerationEnvironment.Append(textToAppend);
                return;
            }
            // Everywhere there is a newline in the text, add an indent after it
            textToAppend = textToAppend.Replace(global::System.Environment.NewLine, (global::System.Environment.NewLine + this.currentIndentField));
            // If the text ends with a newline, then we should strip off the indent added at the very end
            // because the appropriate indent will be added when the next time Write() is called
            if (this.endsWithNewline)
            {
                this.GenerationEnvironment.Append(textToAppend, 0, (textToAppend.Length - this.currentIndentField.Length));
            }
            else
            {
                this.GenerationEnvironment.Append(textToAppend);
            }
        }
        /// <summary>
        /// Write text directly into the generated output
        /// </summary>
        public void WriteLine(string textToAppend)
        {
            this.Write(textToAppend);
            this.GenerationEnvironment.AppendLine();
            this.endsWithNewline = true;
        }
        /// <summary>
        /// Write formatted text directly into the generated output
        /// </summary>
        public void Write(string format, params object[] args)
        {
            this.Write(string.Format(global::System.Globalization.CultureInfo.CurrentCulture, format, args));
        }
        /// <summary>
        /// Write formatted text directly into the generated output
        /// </summary>
        public void WriteLine(string format, params object[] args)
        {
            this.WriteLine(string.Format(global::System.Globalization.CultureInfo.CurrentCulture, format, args));
        }
        /// <summary>
        /// Raise an error
        /// </summary>
        public void Error(string message)
        {
            System.CodeDom.Compiler.CompilerError error = new global::System.CodeDom.Compiler.CompilerError();
            error.ErrorText = message;
            this.Errors.Add(error);
        }
        /// <summary>
        /// Raise a warning
        /// </summary>
        public void Warning(string message)
        {
            System.CodeDom.Compiler.CompilerError error = new global::System.CodeDom.Compiler.CompilerError();
            error.ErrorText = message;
            error.IsWarning = true;
            this.Errors.Add(error);
        }
        /// <summary>
        /// Increase the indent
        /// </summary>
        public void PushIndent(string indent)
        {
            if ((indent == null))
            {
                throw new global::System.ArgumentNullException("indent");
            }
            this.currentIndentField = (this.currentIndentField + indent);
            this.indentLengths.Add(indent.Length);
        }
        /// <summary>
        /// Remove the last indent that was added with PushIndent
        /// </summary>
        public string PopIndent()
        {
            string returnValue = "";
            if ((this.indentLengths.Count > 0))
            {
                int indentLength = this.indentLengths[(this.indentLengths.Count - 1)];
                this.indentLengths.RemoveAt((this.indentLengths.Count - 1));
                if ((indentLength > 0))
                {
                    returnValue = this.currentIndentField.Substring((this.currentIndentField.Length - indentLength));
                    this.currentIndentField = this.currentIndentField.Remove((this.currentIndentField.Length - indentLength));
                }
            }
            return returnValue;
        }
        /// <summary>
        /// Remove any indentation
        /// </summary>
        public void ClearIndent()
        {
            this.indentLengths.Clear();
            this.currentIndentField = "";
        }
        #endregion
        #region ToString Helpers
        /// <summary>
        /// Utility class to produce culture-oriented representation of an object as a string.
        /// </summary>
        public class ToStringInstanceHelper
        {
            private System.IFormatProvider formatProviderField  = global::System.Globalization.CultureInfo.InvariantCulture;
            /// <summary>
            /// Gets or sets format provider to be used by ToStringWithCulture method.
            /// </summary>
            public System.IFormatProvider FormatProvider
            {
                get
                {
                    return this.formatProviderField ;
                }
                set
                {
                    if ((value != null))
                    {
                        this.formatProviderField  = value;
                    }
                }
            }
            /// <summary>
            /// This is called from the compile/run appdomain to convert objects within an expression block to a string
            /// </summary>
            public string ToStringWithCulture(object objectToConvert)
            {
                if ((objectToConvert == null))
                {
                    throw new global::System.ArgumentNullException("objectToConvert");
                }
                System.Type t = objectToConvert.GetType();
                System.Reflection.MethodInfo method = t.GetMethod("ToString", new System.Type[] {
                            typeof(System.IFormatProvider)});
                if ((method == null))
                {
                    return objectToConvert.ToString();
                }
                else
                {
                    return ((string)(method.Invoke(objectToConvert, new object[] {
                                this.formatProviderField })));
                }
            }
        }
        private ToStringInstanceHelper toStringHelperField = new ToStringInstanceHelper();
        /// <summary>
        /// Helper to produce culture-oriented representation of an object as a string
        /// </summary>
        public ToStringInstanceHelper ToStringHelper
        {
            get
            {
                return this.toStringHelperField;
            }
        }
        #endregion
    }
    #endregion
}
