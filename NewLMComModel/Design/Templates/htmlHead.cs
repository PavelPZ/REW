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
    using Packager;
    using schools;
    using System;
    
    /// <summary>
    /// Class to produce the template output
    /// </summary>
    
    #line 1 "D:\LMCom\rew\NewLMComModel\Design\Templates\htmlHead.tt"
    [global::System.CodeDom.Compiler.GeneratedCodeAttribute("Microsoft.VisualStudio.TextTemplating", "14.0.0.0")]
    public partial class htmlHead : htmlHeadBase
    {
#line hidden
        /// <summary>
        /// Create the template output
        /// </summary>
        public virtual string TransformText()
        {
            this.Write(" \r\n");
            this.Write(" \r\n");
            this.Write(" \r\n");
            this.Write(" \r\n");
            this.Write(" \r\n\r\n\r\n");
            
            #line 12 "D:\LMCom\rew\NewLMComModel\Design\Templates\htmlHead.tt"
 //**************** BOOT
  var min = cfg.version == versions.minified ? ".min" : "";
  var themeId = cfg.themeId!=null ? cfg.themeId : "";

  if (!string.IsNullOrEmpty(cfg.baseTagUrl)) WriteLine(string.Format("<base href=\"{0}/schools/\" />", cfg.baseTagUrl));


            
            #line default
            #line hidden
            this.Write("  <link href=\"../font-awesome/lm/externals");
            
            #line 19 "D:\LMCom\rew\NewLMComModel\Design\Templates\htmlHead.tt"
            this.Write(this.ToStringHelper.ToStringWithCulture(themeId));
            
            #line default
            #line hidden
            this.Write(".css\" rel=\"stylesheet\"/>\r\n  <link rel=\"stylesheet\" type=\"text/css\" href=\"../jslib" +
                    "/ea/ea.css\" />\r\n  <link rel=\"stylesheet\" type=\"text/css\" href=\"../blendedapi/sty" +
                    "les/style.css\" />\r\n  <link href=\"../jslib/css/lm");
            
            #line 22 "D:\LMCom\rew\NewLMComModel\Design\Templates\htmlHead.tt"
            this.Write(this.ToStringHelper.ToStringWithCulture(themeId));
            
            #line default
            #line hidden
            this.Write(".css\" rel=\"stylesheet\"/>\r\n\r\n");
            
            #line 24 "D:\LMCom\rew\NewLMComModel\Design\Templates\htmlHead.tt"

  WriteLine(RewApp.writeCfg(cfg));
  WriteLine(MainPage.writeCss(RewApp.publisherSkinCss(cfg)));

            
            #line default
            #line hidden
            this.Write("\r\n  <script type=\'text/javascript\' src=\'../jslib/scripts/jquery");
            
            #line 29 "D:\LMCom\rew\NewLMComModel\Design\Templates\htmlHead.tt"
            this.Write(this.ToStringHelper.ToStringWithCulture(min));
            
            #line default
            #line hidden
            this.Write(".js\'></script>\r\n  <script src=\"../jslib/scripts/angular.js\" type=\"text/javascript" +
                    "\"></script>\r\n  <script type=\'text/javascript\' src=\'../jslib/scripts/underscore");
            
            #line 31 "D:\LMCom\rew\NewLMComModel\Design\Templates\htmlHead.tt"
            this.Write(this.ToStringHelper.ToStringWithCulture(min));
            
            #line default
            #line hidden
            this.Write(@".js'></script>
  <script type='text/javascript' src='../jslib/js/lmconsoleinit.js'></script>

  <script src=""../jslib/scripts/angular-route.js"" type=""text/javascript""></script>
  <script src=""../jslib/scripts/angular-animate.js"" type=""text/javascript""></script>
  <script src=""../jslib/scripts/angular-cookies.js"" type=""text/javascript""></script>
  <script src=""../jslib/scripts/angular-ui-router.js"" type=""text/javascript""></script>
  <script src=""../jslib/scripts/ui-bootstrap-tpls.js"" type=""text/javascript""></script>

");
            
            #line 40 "D:\LMCom\rew\NewLMComModel\Design\Templates\htmlHead.tt"

  if (cfg.version == versions.minified) {

            
            #line default
            #line hidden
            this.Write(@"  <script type='text/javascript'>var isOk = true;</script>
  <!--[if lt IE 8]><script type='text/javascript'>isOk = false; alert('Internet Explorer 8 or better is required!');</script><![endif]-->
  <script type='text/javascript'>
  function jsUrl(stUrl, dynUrl, dynVer) {
    if (!document.cookie || !_.any(document.cookie.toLowerCase().split(';'), function (c) { return c.trim() == 'dynamicjs=true'; })) return stUrl;
    return cfg.licenceConfig.serviceUrl + '?type=' + dynUrl + '&version=' + dynVer;
  }
");
            
            #line 50 "D:\LMCom\rew\NewLMComModel\Design\Templates\htmlHead.tt"

    if (cfg.licenceConfig.domain != null) WriteLine(string.Format("  if (window.location.host.toLowerCase().indexOf('{0}') < 0) {{ alert('Wrong domain: {0}'); isOk = false; }}", cfg.licenceConfig.domain.ToLower()));
    if (cfg.licenceConfig.intExpiration > 0) WriteLine("  if (new Date().getTime() > {0}) {{ alert('Trial version expired at {1}'); isOk = false; }}", cfg.licenceConfig.intExpiration, cfg.licenceConfig.expiration.ToString("yyyy-MM-dd"));
    WriteLine(RewApp.writeJS(cfg, forStatistics));
    WriteLine("</script>");
  } else if (cfg.version == versions.not_minified) { 
    WriteLine(RewApp.writeJS(cfg, forStatistics));
  } else {
    WriteLine(RewApp.writeJS(cfg, forStatistics));
  }

            
            #line default
            #line hidden
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
    public class htmlHeadBase
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
