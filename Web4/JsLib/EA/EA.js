///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\lm\starttrace.js
var startTrace = true;
///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\lm\Silverlight.js
///////////////////////////////////////////////////////////////////////////////
//
//  Silverlight.js   			version 5.0.61118.0
//
//  This file is provided by Microsoft as a helper file for websites that
//  incorporate Silverlight Objects. This file is provided under the Microsoft
//  Public License available at 
//  http://code.msdn.microsoft.com/silverlightjs/Project/License.aspx.  
//  You may not use or distribute this file or the code in this file except as 
//  expressly permitted under that license.
// 
//  Copyright (c) Microsoft Corporation. All rights reserved.
//
///////////////////////////////////////////////////////////////////////////////

if (!window.Silverlight) {
  window.Silverlight = {};
}

//////////////////////////////////////////////////////////////////
//
// _silverlightCount:
//
// Counter of globalized event handlers
//
//////////////////////////////////////////////////////////////////
Silverlight._silverlightCount = 0;

//////////////////////////////////////////////////////////////////
//
// __onSilverlightInstalledCalled:
//
// Prevents onSilverlightInstalled from being called multiple 
// times
//
//////////////////////////////////////////////////////////////////
Silverlight.__onSilverlightInstalledCalled = false;

//////////////////////////////////////////////////////////////////
//
// fwlinkRoot:
//
// Prefix for fwlink URL's
//
//////////////////////////////////////////////////////////////////
Silverlight.fwlinkRoot = 'http://go2.microsoft.com/fwlink/?LinkID=';

//////////////////////////////////////////////////////////////////
//
// __installationEventFired:
//
// Ensures that only one Installation State event is fired.
//
//////////////////////////////////////////////////////////////////
Silverlight.__installationEventFired = false;

//////////////////////////////////////////////////////////////////
//  
// onGetSilverlight:
//
// Called by Silverlight.GetSilverlight to notify the page that a user
// has requested the Silverlight installer
//
//////////////////////////////////////////////////////////////////
Silverlight.onGetSilverlight = null;

//////////////////////////////////////////////////////////////////
//
// onSilverlightInstalled:
//
// Called by Silverlight.WaitForInstallCompletion when the page detects
// that Silverlight has been installed. The event handler is not called
// in upgrade scenarios.
//
//////////////////////////////////////////////////////////////////
Silverlight.onSilverlightInstalled = function () { window.location.reload(false); };

//////////////////////////////////////////////////////////////////
//
// isInstalled:
//
// Checks to see if the correct version is installed
//
//////////////////////////////////////////////////////////////////
Silverlight.isInstalled = function (version) {
  if (version == undefined)
    version = null;

  var isVersionSupported = false;
  var container = null;

  try {
    var control = null;
    var tryNS = false;

    if (window.ActiveXObject) {
      try {
        control = new ActiveXObject('AgControl.AgControl');
        if (version === null) {
          isVersionSupported = true;
        }
        else if (control.IsVersionSupported(version)) {
          isVersionSupported = true;
        }
        control = null;
      }
      catch (e) {
        tryNS = true;
      }
    }
    else {
      tryNS = true;
    }
    if (tryNS) {
      var plugin = navigator.plugins["Silverlight Plug-In"];
      if (plugin) {
        if (version === null) {
          isVersionSupported = true;
        }
        else {
          var actualVer = plugin.description;
          if (actualVer === "1.0.30226.2")
            actualVer = "2.0.30226.2";
          var actualVerArray = actualVer.split(".");
          while (actualVerArray.length > 3) {
            actualVerArray.pop();
          }
          while (actualVerArray.length < 4) {
            actualVerArray.push(0);
          }
          var reqVerArray = version.split(".");
          while (reqVerArray.length > 4) {
            reqVerArray.pop();
          }

          var requiredVersionPart;
          var actualVersionPart;
          var index = 0;


          do {
            requiredVersionPart = parseInt(reqVerArray[index]);
            actualVersionPart = parseInt(actualVerArray[index]);
            index++;
          }
          while (index < reqVerArray.length && requiredVersionPart === actualVersionPart);

          if (requiredVersionPart <= actualVersionPart && !isNaN(requiredVersionPart)) {
            isVersionSupported = true;
          }
        }
      }
    }
  }
  catch (e) {
    isVersionSupported = false;
  }

  return isVersionSupported;
};
//////////////////////////////////////////////////////////////////
//
// WaitForInstallCompletion:
//
// Occasionally checks for Silverlight installation status. If it
// detects that Silverlight has been installed then it calls
// Silverlight.onSilverlightInstalled();. This is only supported
// if Silverlight was not previously installed on this computer.
//
//////////////////////////////////////////////////////////////////
Silverlight.WaitForInstallCompletion = function () {
  if (!Silverlight.isBrowserRestartRequired && Silverlight.onSilverlightInstalled) {
    try {
      navigator.plugins.refresh();
    }
    catch (e) {
    }
    if (Silverlight.isInstalled(null) && !Silverlight.__onSilverlightInstalledCalled) {
      Silverlight.onSilverlightInstalled();
      Silverlight.__onSilverlightInstalledCalled = true;
    }
    else {
      setTimeout(Silverlight.WaitForInstallCompletion, 3000);
    }
  }
};
//////////////////////////////////////////////////////////////////
//
// __startup:
//
// Performs startup tasks. 
//////////////////////////////////////////////////////////////////
Silverlight.__startup = function () {
  navigator.plugins.refresh();
  Silverlight.isBrowserRestartRequired = Silverlight.isInstalled(null);
  if (!Silverlight.isBrowserRestartRequired) {
    Silverlight.WaitForInstallCompletion();
    if (!Silverlight.__installationEventFired) {
      Silverlight.onInstallRequired();
      Silverlight.__installationEventFired = true;
    }
  }
  else if (window.navigator.mimeTypes) {
    var mimeSL2 = navigator.mimeTypes["application/x-silverlight-2"];
    var mimeSL2b2 = navigator.mimeTypes["application/x-silverlight-2-b2"];
    var mimeSL2b1 = navigator.mimeTypes["application/x-silverlight-2-b1"];
    var mimeHighestBeta = mimeSL2b1;
    if (mimeSL2b2)
      mimeHighestBeta = mimeSL2b2;

    if (!mimeSL2 && (mimeSL2b1 || mimeSL2b2)) {
      if (!Silverlight.__installationEventFired) {
        Silverlight.onUpgradeRequired();
        Silverlight.__installationEventFired = true;
      }
    }
    else if (mimeSL2 && mimeHighestBeta) {
      if (mimeSL2.enabledPlugin &&
          mimeHighestBeta.enabledPlugin) {
        if (mimeSL2.enabledPlugin.description !=
            mimeHighestBeta.enabledPlugin.description) {
          if (!Silverlight.__installationEventFired) {
            Silverlight.onRestartRequired();
            Silverlight.__installationEventFired = true;
          }
        }
      }
    }
  }
  if (!Silverlight.disableAutoStartup) {
    if (window.removeEventListener) {
      window.removeEventListener('load', Silverlight.__startup, false);
    }
    else {
      window.detachEvent('onload', Silverlight.__startup);
    }
  }
};

///////////////////////////////////////////////////////////////////////////////
//
// This block wires up Silverlight.__startup to be executed once the page
// loads. This is the desired behavior for most sites. If, however, a site
// prefers to control the timing of the Silverlight.__startup call then it should
// put the following block of javascript into the webpage before this file is
// included:
//
//    <script type="text/javascript">
//        if (!window.Silverlight)
//        {
//            window.Silverlight = {};
//        }
//        Silverlight.disableAutoStartup = true;
//    </script> 
//
/////////////////////////////////////////////////////////////////////////////////

if (!Silverlight.disableAutoStartup) {
  if (window.addEventListener) {
    window.addEventListener('load', Silverlight.__startup, false);
  }
  else {
    window.attachEvent('onload', Silverlight.__startup);
  }
}

///////////////////////////////////////////////////////////////////////////////
// createObject:
//
// Inserts a Silverlight <object> tag or installation experience into the HTML
// DOM based on the current installed state of Silverlight. 
//
/////////////////////////////////////////////////////////////////////////////////

Silverlight.createObject = function (source, parentElement, id, properties, events, initParams, userContext) {
  var slPluginHelper = new Object();
  var slProperties = properties;
  var slEvents = events;

  slPluginHelper.version = slProperties.version;
  slProperties.source = source;
  slPluginHelper.alt = slProperties.alt;

  //rename properties to their tag property names. For bacwards compatibility
  //with Silverlight.js version 1.0
  if (initParams)
    slProperties.initParams = initParams;
  if (slProperties.isWindowless && !slProperties.windowless)
    slProperties.windowless = slProperties.isWindowless;
  if (slProperties.framerate && !slProperties.maxFramerate)
    slProperties.maxFramerate = slProperties.framerate;
  if (id && !slProperties.id)
    slProperties.id = id;

  // remove elements which are not to be added to the instantiation tag
  delete slProperties.ignoreBrowserVer;
  delete slProperties.inplaceInstallPrompt;
  delete slProperties.version;
  delete slProperties.isWindowless;
  delete slProperties.framerate;
  delete slProperties.data;
  delete slProperties.src;
  delete slProperties.alt;


  // detect that the correct version of Silverlight is installed, else display install

  if (Silverlight.isInstalled(slPluginHelper.version)) {
    //move unknown events to the slProperties array
    for (var name in slEvents) {
      if (slEvents[name]) {
        if (name == "onLoad" && typeof slEvents[name] == "function" && slEvents[name].length != 1) {
          var onLoadHandler = slEvents[name];
          slEvents[name] = function (sender) { return onLoadHandler(document.getElementById(id), userContext, sender) };
        }
        var handlerName = Silverlight.__getHandlerName(slEvents[name]);
        if (handlerName != null) {
          slProperties[name] = handlerName;
          slEvents[name] = null;
        }
        else {
          throw "typeof events." + name + " must be 'function' or 'string'";
        }
      }
    }
    slPluginHTML = Silverlight.buildHTML(slProperties);
  }
    //The control could not be instantiated. Show the installation prompt
  else {
    slPluginHTML = Silverlight.buildPromptHTML(slPluginHelper);
  }

  // insert or return the HTML
  if (parentElement) {
    parentElement.innerHTML = slPluginHTML;
  }
  else {
    return slPluginHTML;
  }

};

///////////////////////////////////////////////////////////////////////////////
//
//  buildHTML:
//
//  create HTML that instantiates the control
//
///////////////////////////////////////////////////////////////////////////////
Silverlight.buildHTML = function (slProperties) {
  var htmlBuilder = [];

  htmlBuilder.push('<object type="application/x-silverlight" data="data:application/x-silverlight,"');

  //if (!slProperties.style) { slProperties.style = "'position:absolute; top:-30;"; }
  //htmlBuilder.push(' style="' + slProperties.style + '"');

  if (slProperties.id != null) {
    htmlBuilder.push(' id="' + Silverlight.HtmlAttributeEncode(slProperties.id) + '"');
  }
  if (slProperties.width != null) {
    htmlBuilder.push(' width="' + slProperties.width + '"');
  }
  if (slProperties.height != null) {
    htmlBuilder.push(' height="' + slProperties.height + '"');
  }
  htmlBuilder.push(' >');

  delete slProperties.id;
  delete slProperties.width;
  delete slProperties.height;

  for (var name in slProperties) {
    if (slProperties[name]) {
      htmlBuilder.push('<param name="' + Silverlight.HtmlAttributeEncode(name) + '" value="' + Silverlight.HtmlAttributeEncode(slProperties[name]) + '" />');
    }
  }
  htmlBuilder.push('<\/object>');
  return htmlBuilder.join('');
};



//////////////////////////////////////////////////////////////////
//
// createObjectEx:
//
// takes a single parameter of all createObject 
// parameters enclosed in {}
//
//////////////////////////////////////////////////////////////////

Silverlight.createObjectEx = function (params) {
  var parameters = params;
  var html = Silverlight.createObject(parameters.source, parameters.parentElement, parameters.id, parameters.properties, parameters.events, parameters.initParams, parameters.context);
  if (parameters.parentElement == null) {
    return html;
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////
//
// buildPromptHTML
//
// Builds the HTML to prompt the user to download and install Silverlight
//
///////////////////////////////////////////////////////////////////////////////////////////////
Silverlight.buildPromptHTML = function (slPluginHelper) {
  var slPluginHTML = "";
  var urlRoot = Silverlight.fwlinkRoot;
  var version = slPluginHelper.version;
  if (slPluginHelper.alt) {
    slPluginHTML = slPluginHelper.alt;
  }
  else {
    if (!version) {
      version = "";
    }
    slPluginHTML = "<a href='javascript:Silverlight.getSilverlight(\"{1}\");' style='text-decoration: none;'><img src='{2}' alt='Get Microsoft Silverlight' style='border-style: none'/></a>";
    slPluginHTML = slPluginHTML.replace('{1}', version);
    slPluginHTML = slPluginHTML.replace('{2}', urlRoot + '161376');
  }

  return slPluginHTML;
};

///////////////////////////////////////////////////////////////////////////////////////////////
//
// getSilverlight:
//
// Navigates the browser to the appropriate Silverlight installer
//
///////////////////////////////////////////////////////////////////////////////////////////////
Silverlight.getSilverlight = function (version) {
  if (Silverlight.onGetSilverlight) {
    Silverlight.onGetSilverlight();
  }

  var shortVer = "";
  var reqVerArray = String(version).split(".");
  if (reqVerArray.length > 1) {
    var majorNum = parseInt(reqVerArray[0]);
    if (isNaN(majorNum) || majorNum < 2) {
      shortVer = "1.0";
    }
    else {
      shortVer = reqVerArray[0] + '.' + reqVerArray[1];
    }
  }

  var verArg = "";

  if (shortVer.match(/^\d+\056\d+$/)) {
    verArg = "&v=" + shortVer;
  }

  Silverlight.followFWLink("149156" + verArg);
};


///////////////////////////////////////////////////////////////////////////////////////////////
//
// followFWLink:
//
// Navigates to a url based on fwlinkid
//
///////////////////////////////////////////////////////////////////////////////////////////////
Silverlight.followFWLink = function (linkid) {
  top.location = Silverlight.fwlinkRoot + String(linkid);
};

///////////////////////////////////////////////////////////////////////////////////////////////
//
// HtmlAttributeEncode:
//
// Encodes special characters in input strings as charcodes
//
///////////////////////////////////////////////////////////////////////////////////////////////
Silverlight.HtmlAttributeEncode = function (strInput) {
  var c;
  var retVal = '';

  if (strInput == null) {
    return null;
  }

  for (var cnt = 0; cnt < strInput.length; cnt++) {
    c = strInput.charCodeAt(cnt);

    if (((c > 96) && (c < 123)) ||
          ((c > 64) && (c < 91)) ||
          ((c > 43) && (c < 58) && (c != 47)) ||
          (c == 95)) {
      retVal = retVal + String.fromCharCode(c);
    }
    else {
      retVal = retVal + '&#' + c + ';';
    }
  }

  return retVal;
};
///////////////////////////////////////////////////////////////////////////////
//
//  default_error_handler:
//
//  Default error handling function 
//
///////////////////////////////////////////////////////////////////////////////

Silverlight.default_error_handler = function (sender, args) {
  var iErrorCode;
  var errorType = args.ErrorType;

  iErrorCode = args.ErrorCode;

  var errMsg = "\nSilverlight error message     \n";

  errMsg += "ErrorCode: " + iErrorCode + "\n";


  errMsg += "ErrorType: " + errorType + "       \n";
  errMsg += "Message: " + args.ErrorMessage + "     \n";

  if (errorType == "ParserError") {
    errMsg += "XamlFile: " + args.xamlFile + "     \n";
    errMsg += "Line: " + args.lineNumber + "     \n";
    errMsg += "Position: " + args.charPosition + "     \n";
  }
  else if (errorType == "RuntimeError") {
    if (args.lineNumber != 0) {
      errMsg += "Line: " + args.lineNumber + "     \n";
      errMsg += "Position: " + args.charPosition + "     \n";
    }
    errMsg += "MethodName: " + args.methodName + "     \n";
  }
  alert(errMsg);
};

///////////////////////////////////////////////////////////////////////////////////////////////
//
// __cleanup:
//
// Releases event handler resources when the page is unloaded
//
///////////////////////////////////////////////////////////////////////////////////////////////
Silverlight.__cleanup = function () {
  for (var i = Silverlight._silverlightCount - 1; i >= 0; i--) {
    window['__slEvent' + i] = null;
  }
  Silverlight._silverlightCount = 0;
  if (window.removeEventListener) {
    window.removeEventListener('unload', Silverlight.__cleanup, false);
  }
  else {
    window.detachEvent('onunload', Silverlight.__cleanup);
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////
//
// __getHandlerName:
//
// Generates named event handlers for delegates.
//
///////////////////////////////////////////////////////////////////////////////////////////////
Silverlight.__getHandlerName = function (handler) {
  var handlerName = "";
  if (typeof handler == "string") {
    handlerName = handler;
  }
  else if (typeof handler == "function") {
    if (Silverlight._silverlightCount == 0) {
      if (window.addEventListener) {
        window.addEventListener('unload', Silverlight.__cleanup, false);
      }
      else {
        window.attachEvent('onunload', Silverlight.__cleanup);
      }
    }
    var count = Silverlight._silverlightCount++;
    handlerName = "__slEvent" + count;

    window[handlerName] = handler;
  }
  else {
    handlerName = null;
  }
  return handlerName;
};
//////////////////////////////////////////////////////////////////
//  
// onRequiredVersionAvailable:
//
// Called by version  verification control to notify the page that
// an appropriate build of Silverlight is available. The page 
// should respond by injecting the appropriate Silverlight control
//
//////////////////////////////////////////////////////////////////
Silverlight.onRequiredVersionAvailable = function () {

};
//////////////////////////////////////////////////////////////////
//  
// onRestartRequired:
//
// Called by version verification control to notify the page that
// an appropriate build of Silverlight is installed but not loaded. 
// The page should respond by injecting a clear and visible 
// "Thanks for installing. Please restart your browser and return
// to mysite.com" or equivalent into the browser DOM
//
//////////////////////////////////////////////////////////////////
Silverlight.onRestartRequired = function () {

};
//////////////////////////////////////////////////////////////////
//  
// onUpgradeRequired:
//
// Called by version verification control to notify the page that
// Silverlight must be upgraded. The page should respond by 
// injecting a clear, visible, and actionable upgrade message into
// the DOM. The message must inform the user that they need to 
// upgrade Silverlight to use the page. They are already somewhat
// familiar with the Silverlight product when they encounter this.
// Silverlight should be mentioned so the user expects to see that
// string in the installer UI. However, the Silverlight-powered
// application should be the focus of the solicitation. The user
// wants the app. Silverlight is a means to the app.
// 
// The upgrade solicitation will have a button that directs 
// the user to the Silverlight installer. Upon click the button
// should both kick off a download of the installer URL and replace
// the Upgrade text with "Thanks for downloading. When the upgarde
// is complete please restart your browser and return to 
// mysite.com" or equivalent.
//
// Note: For a more interesting upgrade UX we can use Silverlight
// 1.0-style XAML for this upgrade experience. Contact PiotrP for
// details.
//
//////////////////////////////////////////////////////////////////
Silverlight.onUpgradeRequired = function () {

};
//////////////////////////////////////////////////////////////////
//  
// onInstallRequired:
//
// Called by Silverlight.checkInstallStatus to notify the page
// that Silverlight has not been installed by this user.
// The page should respond by 
// injecting a clear, visible, and actionable upgrade message into
// the DOM. The message must inform the user that they need to 
// download and install components needed to use the page. 
// Silverlight should be mentioned so the user expects to see that
// string in the installer UI. However, the Silverlight-powered
// application should be the focus of the solicitation. The user
// wants the app. Silverlight is a means to the app.
// 
// The installation solicitation will have a button that directs 
// the user to the Silverlight installer. Upon click the button
// should both kick off a download of the installer URL and replace
// the Upgrade text with "Thanks for downloading. When installation
// is complete you may need to refresh the page to view this 
// content" or equivalent.
//
//////////////////////////////////////////////////////////////////
Silverlight.onInstallRequired = function () {

};

//////////////////////////////////////////////////////////////////
//  
// IsVersionAvailableOnError:
//
// This function should be called at the beginning of a web page's
// Silverlight error handler. It will determine if the required 
// version of Silverlight is installed and available in the 
// current process.
//
// During its execution the function will trigger one of the 
// Silverlight installation state events, if appropriate.
//
// Sender and Args should be passed through from  the calling
// onError handler's parameters. 
//
// The associated Sivlerlight <object> tag must have
// minRuntimeVersion set and should have autoUpgrade set to false.
//
//////////////////////////////////////////////////////////////////
Silverlight.IsVersionAvailableOnError = function (sender, args) {
  var retVal = false;
  try {
    if (args.ErrorCode == 8001 && !Silverlight.__installationEventFired) {
      Silverlight.onUpgradeRequired();
      Silverlight.__installationEventFired = true;
    }
    else if (args.ErrorCode == 8002 && !Silverlight.__installationEventFired) {
      Silverlight.onRestartRequired();
      Silverlight.__installationEventFired = true;
    }
      // this handles upgrades from 1.0. That control did not
      // understand the minRuntimeVerison parameter. It also
      // did not know how to parse XAP files, so would throw
      // Parse Error (5014). A Beta 2 control may throw 2106
    else if (args.ErrorCode == 5014 || args.ErrorCode == 2106) {
      if (Silverlight.__verifySilverlight2UpgradeSuccess(args.getHost())) {
        retVal = true;
      }
    }
    else {
      retVal = true;
    }
  }
  catch (e) {
  }
  return retVal;
};
//////////////////////////////////////////////////////////////////
//  
// IsVersionAvailableOnLoad:
//
// This function should be called at the beginning of a web page's
// Silverlight onLoad handler. It will determine if the required 
// version of Silverlight is installed and available in the 
// current process.
//
// During its execution the function will trigger one of the 
// Silverlight installation state events, if appropriate.
//
// Sender should be passed through from  the calling
// onError handler's parameters. 
//
// The associated Sivlerlight <object> tag must have
// minRuntimeVersion set and should have autoUpgrade set to false.
//
//////////////////////////////////////////////////////////////////
Silverlight.IsVersionAvailableOnLoad = function (sender) {
  var retVal = false;
  try {
    if (Silverlight.__verifySilverlight2UpgradeSuccess(sender.getHost())) {
      retVal = true;
    }
  }
  catch (e) {
  }
  return retVal;
};
//////////////////////////////////////////////////////////////////
//
// __verifySilverlight2UpgradeSuccess:
//
// This internal function helps identify installation state by
// taking advantage of behavioral differences between the
// 1.0 and 2.0 releases of Silverlight. 
//
//////////////////////////////////////////////////////////////////
Silverlight.__verifySilverlight2UpgradeSuccess = function (host) {
  var retVal = false;
  var version = "4.0.50401";
  var installationEvent = null;

  try {
    if (host.IsVersionSupported(version + ".99")) {
      installationEvent = Silverlight.onRequiredVersionAvailable;
      retVal = true;
    }
    else if (host.IsVersionSupported(version + ".0")) {
      installationEvent = Silverlight.onRestartRequired;
    }
    else {
      installationEvent = Silverlight.onUpgradeRequired;
    }

    if (installationEvent && !Silverlight.__installationEventFired) {
      installationEvent();
      Silverlight.__installationEventFired = true;
    }
  }
  catch (e) {
  }
  return retVal;
};
///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\lm\ac_runactivecontent.js
//v1.7
// Flash Player Version Detection
// Detect Client Browser type
// Copyright 2005-2007 Adobe Systems Incorporated.  All rights reserved.
var isIE = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
var isWin = (navigator.appVersion.toLowerCase().indexOf("win") != -1) ? true : false;
var isOpera = (navigator.userAgent.indexOf("Opera") != -1) ? true : false;

function ControlVersion() {
  var version;
  var axo;
  var e;

  // NOTE : new ActiveXObject(strFoo) throws an exception if strFoo isn't in the registry

  try {
    // version will be set for 7.X or greater players
    axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
    version = axo.GetVariable("$version");
  } catch (e) {
  }

  if (!version) {
    try {
      // version will be set for 6.X players only
      axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");

      // installed player is some revision of 6.0
      // GetVariable("$version") crashes for versions 6.0.22 through 6.0.29,
      // so we have to be careful. 

      // default to the first public version
      version = "WIN 6,0,21,0";

      // throws if AllowScripAccess does not exist (introduced in 6.0r47)		
      axo.AllowScriptAccess = "always";

      // safe to call for 6.0r47 or greater
      version = axo.GetVariable("$version");

    } catch (e) {
    }
  }

  if (!version) {
    try {
      // version will be set for 4.X or 5.X player
      axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
      version = axo.GetVariable("$version");
    } catch (e) {
    }
  }

  if (!version) {
    try {
      // version will be set for 3.X player
      axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
      version = "WIN 3,0,18,0";
    } catch (e) {
    }
  }

  if (!version) {
    try {
      // version will be set for 2.X player
      axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
      version = "WIN 2,0,0,11";
    } catch (e) {
      version = -1;
    }
  }

  return version;
}

// JavaScript helper required to detect Flash Player PlugIn version information
function GetSwfVer() {
  // NS/Opera version >= 3 check for Flash plugin in plugin array
  var flashVer = -1;

  if (navigator.plugins != null && navigator.plugins.length > 0) {
    if (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]) {
      var swVer2 = navigator.plugins["Shockwave Flash 2.0"] ? " 2.0" : "";
      var flashDescription = navigator.plugins["Shockwave Flash" + swVer2].description;
      var descArray = flashDescription.split(" ");
      var tempArrayMajor = descArray[2].split(".");
      var versionMajor = tempArrayMajor[0];
      var versionMinor = tempArrayMajor[1];
      var versionRevision = descArray[3];
      if (versionRevision == "") {
        versionRevision = descArray[4];
      }
      if (versionRevision[0] == "d") {
        versionRevision = versionRevision.substring(1);
      } else if (versionRevision[0] == "r") {
        versionRevision = versionRevision.substring(1);
        if (versionRevision.indexOf("d") > 0) {
          versionRevision = versionRevision.substring(0, versionRevision.indexOf("d"));
        }
      }
      var flashVer = versionMajor + "." + versionMinor + "." + versionRevision;
    }
  }
    // MSN/WebTV 2.6 supports Flash 4
  else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.6") != -1) flashVer = 4;
    // WebTV 2.5 supports Flash 3
  else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.5") != -1) flashVer = 3;
    // older WebTV supports Flash 2
  else if (navigator.userAgent.toLowerCase().indexOf("webtv") != -1) flashVer = 2;
  else if (isIE && isWin && !isOpera) {
    flashVer = ControlVersion();
  }
  return flashVer;
}

// When called with reqMajorVer, reqMinorVer, reqRevision returns true if that version or greater is available
function DetectFlashVer(reqMajorVer, reqMinorVer, reqRevision) {
  versionStr = GetSwfVer();
  if (versionStr == -1) {
    return false;
  } else if (versionStr != 0) {
    if (isIE && isWin && !isOpera) {
      // Given "WIN 2,0,0,11"
      tempArray = versionStr.split(" "); 	// ["WIN", "2,0,0,11"]
      tempString = tempArray[1];			// "2,0,0,11"
      versionArray = tempString.split(",");	// ['2', '0', '0', '11']
    } else {
      versionArray = versionStr.split(".");
    }
    var versionMajor = versionArray[0];
    var versionMinor = versionArray[1];
    var versionRevision = versionArray[2];

    // is the major.revision >= requested major.revision AND the minor version >= requested minor
    if (versionMajor > parseFloat(reqMajorVer)) {
      return true;
    } else if (versionMajor == parseFloat(reqMajorVer)) {
      if (versionMinor > parseFloat(reqMinorVer))
        return true;
      else if (versionMinor == parseFloat(reqMinorVer)) {
        if (versionRevision >= parseFloat(reqRevision))
          return true;
      }
    }
    return false;
  }
}

function AC_AddExtension(src, ext) {
  if (src.indexOf('?') != -1)
    return src.replace(/\?/, ext + '?');
  else
    return src + ext;
}

function AC_Generateobj(objAttrs, params, embedAttrs) {
  var str = '<div style="position:absolute; top:-10px;">';
  if (isIE && isWin && !isOpera) {
    str += '<object ';
    for (var i in objAttrs) {
      str += i + '="' + objAttrs[i] + '" ';
    }
    str += '>';
    for (var i in params) {
      str += '<param name="' + i + '" value="' + params[i] + '" /> ';
    }
    str += '</object>';
  }
  else {
    str += '<embed ';
    for (var i in embedAttrs) {
      str += i + '="' + embedAttrs[i] + '" ';
    }
    str += '> </embed>';
  }
  str += '</div>';
  return str;
}

function AC_FL_RunContent() {
  var ret =
    AC_GetArgs
    (arguments, ".swf", "movie", "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"
     , "application/x-shockwave-flash"
    );
  return AC_Generateobj(ret.objAttrs, ret.params, ret.embedAttrs);
}

function AC_GetArgs(args, ext, srcParamName, classid, mimeType) {
  var ret = new Object();
  ret.embedAttrs = new Object();
  ret.params = new Object();
  ret.objAttrs = new Object();
  for (var i = 0; i < args.length; i = i + 2) {
    var currArg = args[i].toLowerCase();

    switch (currArg) {
      case "classid":
        break;
      case "pluginspage":
        ret.embedAttrs[args[i]] = args[i + 1];
        break;
      case "src":
      case "movie":
        args[i + 1] = AC_AddExtension(args[i + 1], ext);
        ret.embedAttrs["src"] = args[i + 1];
        ret.params[srcParamName] = args[i + 1];
        break;
      case "onafterupdate":
      case "onbeforeupdate":
      case "onblur":
      case "oncellchange":
      case "onclick":
      case "ondblclick":
      case "ondrag":
      case "ondragend":
      case "ondragenter":
      case "ondragleave":
      case "ondragover":
      case "ondrop":
      case "onfinish":
      case "onfocus":
      case "onhelp":
      case "onmousedown":
      case "onmouseup":
      case "onmouseover":
      case "onmousemove":
      case "onmouseout":
      case "onkeypress":
      case "onkeydown":
      case "onkeyup":
      case "onload":
      case "onlosecapture":
      case "onpropertychange":
      case "onreadystatechange":
      case "onrowsdelete":
      case "onrowenter":
      case "onrowexit":
      case "onrowsinserted":
      case "onstart":
      case "onscroll":
      case "onbeforeeditfocus":
      case "onactivate":
      case "onbeforedeactivate":
      case "ondeactivate":
      case "type":
      case "codebase":
      case "id":
        ret.objAttrs[args[i]] = args[i + 1];
        break;
      case "width":
      case "height":
      case "align":
      case "vspace":
      case "hspace":
      case "class":
      case "title":
      case "accesskey":
      case "name":
      case "tabindex":
        ret.embedAttrs[args[i]] = ret.objAttrs[args[i]] = args[i + 1];
        break;
      default:
        ret.embedAttrs[args[i]] = ret.params[args[i]] = args[i + 1];
    }
  }
  ret.objAttrs["classid"] = classid;
  if (mimeType) ret.embedAttrs["type"] = mimeType;
  return ret;
}

///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\atlas\microsoftajax.js
Function.__typeName = "Function"; Function.__class = true; Function.createCallback = function (b, a) { return function () { var e = arguments.length; if (e > 0) { var d = []; for (var c = 0; c < e; c++) d[c] = arguments[c]; d[e] = a; return b.apply(this, d) } return b.call(this, a) } }; Function.createDelegate = function (a, b) { return function () { return b.apply(a, arguments) } }; Function.emptyFunction = Function.emptyMethod = function () { }; Function._validateParams = function (e, c) { var a; a = Function._validateParameterCount(e, c); if (a) { a.popStackFrame(); return a } for (var b = 0; b < e.length; b++) { var d = c[Math.min(b, c.length - 1)], f = d.name; if (d.parameterArray) f += "[" + (b - c.length + 1) + "]"; a = Function._validateParameter(e[b], d, f); if (a) { a.popStackFrame(); return a } } return null }; Function._validateParameterCount = function (e, a) { var c = a.length, d = 0; for (var b = 0; b < a.length; b++) if (a[b].parameterArray) c = Number.MAX_VALUE; else if (!a[b].optional) d++; if (e.length < d || e.length > c) { var f = Error.parameterCount(); f.popStackFrame(); return f } return null }; Function._validateParameter = function (c, a, h) { var b, g = a.type, l = !!a.integer, k = !!a.domElement, m = !!a.mayBeNull; b = Function._validateParameterType(c, g, l, k, m, h); if (b) { b.popStackFrame(); return b } var e = a.elementType, f = !!a.elementMayBeNull; if (g === Array && typeof c !== "undefined" && c !== null && (e || !f)) { var j = !!a.elementInteger, i = !!a.elementDomElement; for (var d = 0; d < c.length; d++) { var n = c[d]; b = Function._validateParameterType(n, e, j, i, f, h + "[" + d + "]"); if (b) { b.popStackFrame(); return b } } } return null }; Function._validateParameterType = function (a, c, n, m, k, d) { var b; if (typeof a === "undefined") if (k) return null; else { b = Error.argumentUndefined(d); b.popStackFrame(); return b } if (a === null) if (k) return null; else { b = Error.argumentNull(d); b.popStackFrame(); return b } if (c && c.__enum) { if (typeof a !== "number") { b = Error.argumentType(d, Object.getType(a), c); b.popStackFrame(); return b } if (a % 1 === 0) { var e = c.prototype; if (!c.__flags || a === 0) { for (var i in e) if (e[i] === a) return null } else { var l = a; for (var i in e) { var f = e[i]; if (f === 0) continue; if ((f & a) === f) l -= f; if (l === 0) return null } } } b = Error.argumentOutOfRange(d, a, String.format(Sys.Res.enumInvalidValue, a, c.getName())); b.popStackFrame(); return b } if (m) { var h; if (typeof a.nodeType !== "number") { var g = a.ownerDocument || a.document || a; if (g != a) { var j = g.defaultView || g.parentWindow; h = j != a && !(j.document && a.document && j.document === a.document) } else h = typeof g.body === "undefined" } else h = a.nodeType === 3; if (h) { b = Error.argument(d, Sys.Res.argumentDomElement); b.popStackFrame(); return b } } if (c && !c.isInstanceOfType(a)) { b = Error.argumentType(d, Object.getType(a), c); b.popStackFrame(); return b } if (c === Number && n) if (a % 1 !== 0) { b = Error.argumentOutOfRange(d, a, Sys.Res.argumentInteger); b.popStackFrame(); return b } return null }; Error.__typeName = "Error"; Error.__class = true; Error.create = function (d, b) { var a = new Error(d); a.message = d; if (b) for (var c in b) a[c] = b[c]; a.popStackFrame(); return a }; Error.argument = function (a, c) { var b = "Sys.ArgumentException: " + (c ? c : Sys.Res.argument); if (a) b += "\n" + String.format(Sys.Res.paramName, a); var d = Error.create(b, { name: "Sys.ArgumentException", paramName: a }); d.popStackFrame(); return d }; Error.argumentNull = function (a, c) { var b = "Sys.ArgumentNullException: " + (c ? c : Sys.Res.argumentNull); if (a) b += "\n" + String.format(Sys.Res.paramName, a); var d = Error.create(b, { name: "Sys.ArgumentNullException", paramName: a }); d.popStackFrame(); return d }; Error.argumentOutOfRange = function (c, a, d) { var b = "Sys.ArgumentOutOfRangeException: " + (d ? d : Sys.Res.argumentOutOfRange); if (c) b += "\n" + String.format(Sys.Res.paramName, c); if (typeof a !== "undefined" && a !== null) b += "\n" + String.format(Sys.Res.actualValue, a); var e = Error.create(b, { name: "Sys.ArgumentOutOfRangeException", paramName: c, actualValue: a }); e.popStackFrame(); return e }; Error.argumentType = function (d, c, b, e) { var a = "Sys.ArgumentTypeException: "; if (e) a += e; else if (c && b) a += String.format(Sys.Res.argumentTypeWithTypes, c.getName(), b.getName()); else a += Sys.Res.argumentType; if (d) a += "\n" + String.format(Sys.Res.paramName, d); var f = Error.create(a, { name: "Sys.ArgumentTypeException", paramName: d, actualType: c, expectedType: b }); f.popStackFrame(); return f }; Error.argumentUndefined = function (a, c) { var b = "Sys.ArgumentUndefinedException: " + (c ? c : Sys.Res.argumentUndefined); if (a) b += "\n" + String.format(Sys.Res.paramName, a); var d = Error.create(b, { name: "Sys.ArgumentUndefinedException", paramName: a }); d.popStackFrame(); return d }; Error.format = function (a) { var c = "Sys.FormatException: " + (a ? a : Sys.Res.format), b = Error.create(c, { name: "Sys.FormatException" }); b.popStackFrame(); return b }; Error.invalidOperation = function (a) { var c = "Sys.InvalidOperationException: " + (a ? a : Sys.Res.invalidOperation), b = Error.create(c, { name: "Sys.InvalidOperationException" }); b.popStackFrame(); return b }; Error.notImplemented = function (a) { var c = "Sys.NotImplementedException: " + (a ? a : Sys.Res.notImplemented), b = Error.create(c, { name: "Sys.NotImplementedException" }); b.popStackFrame(); return b }; Error.parameterCount = function (a) { var c = "Sys.ParameterCountException: " + (a ? a : Sys.Res.parameterCount), b = Error.create(c, { name: "Sys.ParameterCountException" }); b.popStackFrame(); return b }; Error.prototype.popStackFrame = function () { if (typeof this.stack === "undefined" || this.stack === null || typeof this.fileName === "undefined" || this.fileName === null || typeof this.lineNumber === "undefined" || this.lineNumber === null) return; var a = this.stack.split("\n"), c = a[0], e = this.fileName + ":" + this.lineNumber; while (typeof c !== "undefined" && c !== null && c.indexOf(e) === -1) { a.shift(); c = a[0] } var d = a[1]; if (typeof d === "undefined" || d === null) return; var b = d.match(/@(.*):(\d+)$/); if (typeof b === "undefined" || b === null) return; this.fileName = b[1]; this.lineNumber = parseInt(b[2]); a.shift(); this.stack = a.join("\n") }; Object.__typeName = "Object"; Object.__class = true; Object.getType = function (b) { var a = b.constructor; if (!a || typeof a !== "function" || !a.__typeName || a.__typeName === "Object") return Object; return a }; Object.getTypeName = function (a) { return Object.getType(a).getName() }; String.__typeName = "String"; String.__class = true; String.prototype.endsWith = function (a) { return this.substr(this.length - a.length) === a }; String.prototype.startsWith = function (a) { return this.substr(0, a.length) === a }; String.prototype.trim = function () { return this.replace(/^\s+|\s+$/g, "") }; String.prototype.trimEnd = function () { return this.replace(/\s+$/, "") }; String.prototype.trimStart = function () { return this.replace(/^\s+/, "") }; String.format = function () { return String._toFormattedString(false, arguments) }; String.localeFormat = function () { return String._toFormattedString(true, arguments) }; String._toFormattedString = function (l, j) { var c = "", e = j[0]; for (var a = 0; true;) { var f = e.indexOf("{", a), d = e.indexOf("}", a); if (f < 0 && d < 0) { c += e.slice(a); break } if (d > 0 && (d < f || f < 0)) { c += e.slice(a, d + 1); a = d + 2; continue } c += e.slice(a, f); a = f + 1; if (e.charAt(a) === "{") { c += "{"; a++; continue } if (d < 0) break; var h = e.substring(a, d), g = h.indexOf(":"), k = parseInt(g < 0 ? h : h.substring(0, g), 10) + 1, i = g < 0 ? "" : h.substring(g + 1), b = j[k]; if (typeof b === "undefined" || b === null) b = ""; if (b.toFormattedString) c += b.toFormattedString(i); else if (l && b.localeFormat) c += b.localeFormat(i); else if (b.format) c += b.format(i); else c += b.toString(); a = d + 1 } return c }; Boolean.__typeName = "Boolean"; Boolean.__class = true; Boolean.parse = function (b) { var a = b.trim().toLowerCase(); if (a === "false") return false; if (a === "true") return true }; Date.__typeName = "Date"; Date.__class = true; Date._appendPreOrPostMatch = function (e, b) { var d = 0, a = false; for (var c = 0, g = e.length; c < g; c++) { var f = e.charAt(c); switch (f) { case "'": if (a) b.append("'"); else d++; a = false; break; case "\\": if (a) b.append("\\"); a = !a; break; default: b.append(f); a = false } } return d }; Date._expandFormat = function (a, b) { if (!b) b = "F"; if (b.length === 1) switch (b) { case "d": return a.ShortDatePattern; case "D": return a.LongDatePattern; case "t": return a.ShortTimePattern; case "T": return a.LongTimePattern; case "F": return a.FullDateTimePattern; case "M": case "m": return a.MonthDayPattern; case "s": return a.SortableDateTimePattern; case "Y": case "y": return a.YearMonthPattern; default: throw Error.format(Sys.Res.formatInvalidString) } return b }; Date._expandYear = function (c, a) { if (a < 100) { var b = (new Date).getFullYear(); a += b - b % 100; if (a > c.Calendar.TwoDigitYearMax) return a - 100 } return a }; Date._getParseRegExp = function (b, e) { if (!b._parseRegExp) b._parseRegExp = {}; else if (b._parseRegExp[e]) return b._parseRegExp[e]; var c = Date._expandFormat(b, e); c = c.replace(/([\^\$\.\*\+\?\|\[\]\(\)\{\}])/g, "\\\\$1"); var a = new Sys.StringBuilder("^"), j = [], f = 0, i = 0, h = Date._getTokenRegExp(), d; while ((d = h.exec(c)) !== null) { var l = c.slice(f, d.index); f = h.lastIndex; i += Date._appendPreOrPostMatch(l, a); if (i % 2 === 1) { a.append(d[0]); continue } switch (d[0]) { case "dddd": case "ddd": case "MMMM": case "MMM": a.append("(\\D+)"); break; case "tt": case "t": a.append("(\\D*)"); break; case "yyyy": a.append("(\\d{4})"); break; case "fff": a.append("(\\d{3})"); break; case "ff": a.append("(\\d{2})"); break; case "f": a.append("(\\d)"); break; case "dd": case "d": case "MM": case "M": case "yy": case "y": case "HH": case "H": case "hh": case "h": case "mm": case "m": case "ss": case "s": a.append("(\\d\\d?)"); break; case "zzz": a.append("([+-]?\\d\\d?:\\d{2})"); break; case "zz": case "z": a.append("([+-]?\\d\\d?)") } Array.add(j, d[0]) } Date._appendPreOrPostMatch(c.slice(f), a); a.append("$"); var k = a.toString().replace(/\s+/g, "\\s+"), g = { "regExp": k, "groups": j }; b._parseRegExp[e] = g; return g }; Date._getTokenRegExp = function () { return /dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|y|hh|h|HH|H|mm|m|ss|s|tt|t|fff|ff|f|zzz|zz|z/g }; Date.parseLocale = function (a) { return Date._parse(a, Sys.CultureInfo.CurrentCulture, arguments) }; Date.parseInvariant = function (a) { return Date._parse(a, Sys.CultureInfo.InvariantCulture, arguments) }; Date._parse = function (g, c, h) { var e = false; for (var a = 1, i = h.length; a < i; a++) { var f = h[a]; if (f) { e = true; var b = Date._parseExact(g, f, c); if (b) return b } } if (!e) { var d = c._getDateTimeFormats(); for (var a = 0, i = d.length; a < i; a++) { var b = Date._parseExact(g, d[a], c); if (b) return b } } return null }; Date._parseExact = function (s, y, j) { s = s.trim(); var m = j.dateTimeFormat, v = Date._getParseRegExp(m, y), x = (new RegExp(v.regExp)).exec(s); if (x === null) return null; var w = v.groups, f = null, c = null, h = null, g = null, d = 0, n = 0, o = 0, e = 0, k = null, r = false; for (var p = 0, z = w.length; p < z; p++) { var a = x[p + 1]; if (a) switch (w[p]) { case "dd": case "d": h = parseInt(a, 10); if (h < 1 || h > 31) return null; break; case "MMMM": c = j._getMonthIndex(a); if (c < 0 || c > 11) return null; break; case "MMM": c = j._getAbbrMonthIndex(a); if (c < 0 || c > 11) return null; break; case "M": case "MM": var c = parseInt(a, 10) - 1; if (c < 0 || c > 11) return null; break; case "y": case "yy": f = Date._expandYear(m, parseInt(a, 10)); if (f < 0 || f > 9999) return null; break; case "yyyy": f = parseInt(a, 10); if (f < 0 || f > 9999) return null; break; case "h": case "hh": d = parseInt(a, 10); if (d === 12) d = 0; if (d < 0 || d > 11) return null; break; case "H": case "HH": d = parseInt(a, 10); if (d < 0 || d > 23) return null; break; case "m": case "mm": n = parseInt(a, 10); if (n < 0 || n > 59) return null; break; case "s": case "ss": o = parseInt(a, 10); if (o < 0 || o > 59) return null; break; case "tt": case "t": var u = a.toUpperCase(); r = u === m.PMDesignator.toUpperCase(); if (!r && u !== m.AMDesignator.toUpperCase()) return null; break; case "f": e = parseInt(a, 10) * 100; if (e < 0 || e > 999) return null; break; case "ff": e = parseInt(a, 10) * 10; if (e < 0 || e > 999) return null; break; case "fff": e = parseInt(a, 10); if (e < 0 || e > 999) return null; break; case "dddd": g = j._getDayIndex(a); if (g < 0 || g > 6) return null; break; case "ddd": g = j._getAbbrDayIndex(a); if (g < 0 || g > 6) return null; break; case "zzz": var q = a.split(/:/); if (q.length !== 2) return null; var i = parseInt(q[0], 10); if (i < -12 || i > 13) return null; var l = parseInt(q[1], 10); if (l < 0 || l > 59) return null; k = i * 60 + (a.startsWith("-") ? -l : l); break; case "z": case "zz": var i = parseInt(a, 10); if (i < -12 || i > 13) return null; k = i * 60 } } var b = new Date; if (f === null) f = b.getFullYear(); if (c === null) c = b.getMonth(); if (h === null) h = b.getDate(); b.setFullYear(f, c, h); if (b.getDate() !== h) return null; if (g !== null && b.getDay() !== g) return null; if (r && d < 12) d += 12; b.setHours(d, n, o, e); if (k !== null) { var t = b.getMinutes() - (k + b.getTimezoneOffset()); b.setHours(b.getHours() + parseInt(t / 60, 10), t % 60) } return b }; Date.prototype.format = function (a) { return this._toFormattedString(a, Sys.CultureInfo.InvariantCulture) }; Date.prototype.localeFormat = function (a) { return this._toFormattedString(a, Sys.CultureInfo.CurrentCulture) }; Date.prototype._toFormattedString = function (e, h) { if (!e || e.length === 0 || e === "i") if (h && h.name.length > 0) return this.toLocaleString(); else return this.toString(); var d = h.dateTimeFormat; e = Date._expandFormat(d, e); var a = new Sys.StringBuilder, b; function c(a) { if (a < 10) return "0" + a; return a.toString() } function g(a) { if (a < 10) return "00" + a; if (a < 100) return "0" + a; return a.toString() } var j = 0, i = Date._getTokenRegExp(); for (; true;) { var l = i.lastIndex, f = i.exec(e), k = e.slice(l, f ? f.index : e.length); j += Date._appendPreOrPostMatch(k, a); if (!f) break; if (j % 2 === 1) { a.append(f[0]); continue } switch (f[0]) { case "dddd": a.append(d.DayNames[this.getDay()]); break; case "ddd": a.append(d.AbbreviatedDayNames[this.getDay()]); break; case "dd": a.append(c(this.getDate())); break; case "d": a.append(this.getDate()); break; case "MMMM": a.append(d.MonthNames[this.getMonth()]); break; case "MMM": a.append(d.AbbreviatedMonthNames[this.getMonth()]); break; case "MM": a.append(c(this.getMonth() + 1)); break; case "M": a.append(this.getMonth() + 1); break; case "yyyy": a.append(this.getFullYear()); break; case "yy": a.append(c(this.getFullYear() % 100)); break; case "y": a.append(this.getFullYear() % 100); break; case "hh": b = this.getHours() % 12; if (b === 0) b = 12; a.append(c(b)); break; case "h": b = this.getHours() % 12; if (b === 0) b = 12; a.append(b); break; case "HH": a.append(c(this.getHours())); break; case "H": a.append(this.getHours()); break; case "mm": a.append(c(this.getMinutes())); break; case "m": a.append(this.getMinutes()); break; case "ss": a.append(c(this.getSeconds())); break; case "s": a.append(this.getSeconds()); break; case "tt": a.append(this.getHours() < 12 ? d.AMDesignator : d.PMDesignator); break; case "t": a.append((this.getHours() < 12 ? d.AMDesignator : d.PMDesignator).charAt(0)); break; case "f": a.append(g(this.getMilliseconds()).charAt(0)); break; case "ff": a.append(g(this.getMilliseconds()).substr(0, 2)); break; case "fff": a.append(g(this.getMilliseconds())); break; case "z": b = this.getTimezoneOffset() / 60; a.append((b <= 0 ? "+" : "-") + Math.floor(Math.abs(b))); break; case "zz": b = this.getTimezoneOffset() / 60; a.append((b <= 0 ? "+" : "-") + c(Math.floor(Math.abs(b)))); break; case "zzz": b = this.getTimezoneOffset() / 60; a.append((b <= 0 ? "+" : "-") + c(Math.floor(Math.abs(b))) + d.TimeSeparator + c(Math.abs(this.getTimezoneOffset() % 60))) } } return a.toString() }; Number.__typeName = "Number"; Number.__class = true; Number.parseLocale = function (a) { return Number._parse(a, Sys.CultureInfo.CurrentCulture) }; Number.parseInvariant = function (a) { return Number._parse(a, Sys.CultureInfo.InvariantCulture) }; Number._parse = function (b, n) { b = b.trim(); if (b.match(/^[+-]?infinity$/i)) return parseFloat(b); if (b.match(/^0x[a-f0-9]+$/i)) return parseInt(b); var a = n.numberFormat, f = Number._parseNumberNegativePattern(b, a, a.NumberNegativePattern), h = f[0], d = f[1]; if (h === "" && a.NumberNegativePattern !== 1) { f = Number._parseNumberNegativePattern(b, a, 1); h = f[0]; d = f[1] } if (h === "") h = "+"; var j, c, e = d.indexOf("e"); if (e < 0) e = d.indexOf("E"); if (e < 0) { c = d; j = null } else { c = d.substr(0, e); j = d.substr(e + 1) } var g, k, m = c.indexOf(a.NumberDecimalSeparator); if (m < 0) { g = c; k = null } else { g = c.substr(0, m); k = c.substr(m + a.NumberDecimalSeparator.length) } g = g.split(a.NumberGroupSeparator).join(""); var l = h + g; if (k !== null) l += "." + k; if (j !== null) { var i = Number._parseNumberNegativePattern(j, a, 1); if (i[0] === "") i[0] = "+"; l += "e" + i[0] + i[1] } if (l.match(/^[+-]?\d*\.?\d*(e[+-]?\d+)?$/)) return parseFloat(l); return Number.NaN }; Number._parseNumberNegativePattern = function (a, d, e) { var b = d.NegativeSign, c = d.PositiveSign; switch (e) { case 4: b = " " + b; c = " " + c; case 3: if (a.endsWith(b)) return ["-", a.substr(0, a.length - b.length)]; else if (a.endsWith(c)) return ["+", a.substr(0, a.length - c.length)]; break; case 2: b += " "; c += " "; case 1: if (a.startsWith(b)) return ["-", a.substr(b.length)]; else if (a.startsWith(c)) return ["+", a.substr(c.length)]; break; case 0: if (a.startsWith("(") && a.endsWith(")")) return ["-", a.substr(1, a.length - 2)] } return ["", a] }; Number.prototype.format = function (a) { return this._toFormattedString(a, Sys.CultureInfo.InvariantCulture) }; Number.prototype.localeFormat = function (a) { return this._toFormattedString(a, Sys.CultureInfo.CurrentCulture) }; Number.prototype._toFormattedString = function (d, j) { if (!d || d.length === 0 || d === "i") if (j && j.name.length > 0) return this.toLocaleString(); else return this.toString(); var q = ["n %", "n%", "%n"], p = ["-n %", "-n%", "-%n"], r = ["(n)", "-n", "- n", "n-", "n -"], o = ["$n", "n$", "$ n", "n $"], n = ["($n)", "-$n", "$-n", "$n-", "(n$)", "-n$", "n-$", "n$-", "-n $", "-$ n", "n $-", "$ n-", "$ -n", "n- $", "($ n)", "(n $)"]; function i(p, k, j, l, o) { var e = j[0], g = 1, c = p.toString(), a = "", m = "", i = c.split("."); if (i.length > 1) { c = i[0]; a = i[1]; var h = a.split(/e/i); if (h.length > 1) { a = h[0]; m = "e" + h[1] } } if (k > 0) { var f = a.length - k; if (f > 0) a = a.slice(0, k); else if (f < 0) for (var n = 0; n < Math.abs(f) ; n++) a += "0"; a = o + a } else a = ""; a += m; var b = c.length - 1, d = ""; while (b >= 0) { if (e === 0 || e > b) if (d.length > 0) return c.slice(0, b + 1) + l + d + a; else return c.slice(0, b + 1) + a; if (d.length > 0) d = c.slice(b - e + 1, b + 1) + l + d; else d = c.slice(b - e + 1, b + 1); b -= e; if (g < j.length) { e = j[g]; g++ } } return c.slice(0, b + 1) + l + d + a } var a = j.numberFormat, e = Math.abs(this); if (!d) d = "D"; var b = -1; if (d.length > 1) b = parseInt(d.slice(1), 10); var c; switch (d.charAt(0)) { case "d": case "D": c = "n"; if (b !== -1) { var g = "" + e, k = b - g.length; if (k > 0) for (var m = 0; m < k; m++) g = "0" + g; e = g } if (this < 0) e = -e; break; case "c": case "C": if (this < 0) c = n[a.CurrencyNegativePattern]; else c = o[a.CurrencyPositivePattern]; if (b === -1) b = a.CurrencyDecimalDigits; e = i(Math.abs(this), b, a.CurrencyGroupSizes, a.CurrencyGroupSeparator, a.CurrencyDecimalSeparator); break; case "n": case "N": if (this < 0) c = r[a.NumberNegativePattern]; else c = "n"; if (b === -1) b = a.NumberDecimalDigits; e = i(Math.abs(this), b, a.NumberGroupSizes, a.NumberGroupSeparator, a.NumberDecimalSeparator); break; case "p": case "P": if (this < 0) c = p[a.PercentNegativePattern]; else c = q[a.PercentPositivePattern]; if (b === -1) b = a.PercentDecimalDigits; e = i(Math.abs(this), b, a.PercentGroupSizes, a.PercentGroupSeparator, a.PercentDecimalSeparator); break; default: throw Error.format(Sys.Res.formatBadFormatSpecifier) } var l = /n|\$|-|%/g, f = ""; for (; true;) { var s = l.lastIndex, h = l.exec(c); f += c.slice(s, h ? h.index : c.length); if (!h) break; switch (h[0]) { case "n": f += e; break; case "$": f += a.CurrencySymbol; break; case "-": f += a.NegativeSign; break; case "%": f += a.PercentSymbol } } return f }; RegExp.__typeName = "RegExp"; RegExp.__class = true; Array.__typeName = "Array"; Array.__class = true; Array.add = Array.enqueue = function (a, b) { a[a.length] = b }; Array.addRange = function (a, b) { a.push.apply(a, b) }; Array.clear = function (a) { a.length = 0 }; Array.clone = function (a) { if (a.length === 1) return [a[0]]; else return Array.apply(null, a) }; Array.contains = function (a, b) { return Array.indexOf(a, b) >= 0 }; Array.dequeue = function (a) { return a.shift() }; Array.forEach = function (b, e, d) { for (var a = 0, f = b.length; a < f; a++) { var c = b[a]; if (typeof c !== "undefined") e.call(d, c, a, b) } }; Array.indexOf = function (d, e, a) { if (typeof e === "undefined") return -1; var c = d.length; if (c !== 0) { a = a - 0; if (isNaN(a)) a = 0; else { if (isFinite(a)) a = a - a % 1; if (a < 0) a = Math.max(0, c + a) } for (var b = a; b < c; b++) if (typeof d[b] !== "undefined" && d[b] === e) return b } return -1 }; Array.insert = function (a, b, c) { a.splice(b, 0, c) }; Array.parse = function (value) { if (!value) return []; return eval(value) }; Array.remove = function (b, c) { var a = Array.indexOf(b, c); if (a >= 0) b.splice(a, 1); return a >= 0 }; Array.removeAt = function (a, b) { a.splice(b, 1) }; if (!window) this.window = this; window.Type = Function; Type.prototype.callBaseMethod = function (a, d, b) { var c = this.getBaseMethod(a, d); if (!b) return c.apply(a); else return c.apply(a, b) }; Type.prototype.getBaseMethod = function (d, c) { var b = this.getBaseType(); if (b) { var a = b.prototype[c]; return a instanceof Function ? a : null } return null }; Type.prototype.getBaseType = function () { return typeof this.__baseType === "undefined" ? null : this.__baseType }; Type.prototype.getInterfaces = function () { var a = [], b = this; while (b) { var c = b.__interfaces; if (c) for (var d = 0, f = c.length; d < f; d++) { var e = c[d]; if (!Array.contains(a, e)) a[a.length] = e } b = b.__baseType } return a }; Type.prototype.getName = function () { return typeof this.__typeName === "undefined" ? "" : this.__typeName }; Type.prototype.implementsInterface = function (d) { this.resolveInheritance(); var c = d.getName(), a = this.__interfaceCache; if (a) { var e = a[c]; if (typeof e !== "undefined") return e } else a = this.__interfaceCache = {}; var b = this; while (b) { var f = b.__interfaces; if (f) if (Array.indexOf(f, d) !== -1) return a[c] = true; b = b.__baseType } return a[c] = false }; Type.prototype.inheritsFrom = function (b) { this.resolveInheritance(); var a = this.__baseType; while (a) { if (a === b) return true; a = a.__baseType } return false }; Type.prototype.initializeBase = function (a, b) { this.resolveInheritance(); if (this.__baseType) if (!b) this.__baseType.apply(a); else this.__baseType.apply(a, b); return a }; Type.prototype.isImplementedBy = function (a) { if (typeof a === "undefined" || a === null) return false; var b = Object.getType(a); return !!(b.implementsInterface && b.implementsInterface(this)) }; Type.prototype.isInstanceOfType = function (b) { if (typeof b === "undefined" || b === null) return false; if (b instanceof this) return true; var a = Object.getType(b); return !!(a === this) || a.inheritsFrom && a.inheritsFrom(this) || a.implementsInterface && a.implementsInterface(this) }; Type.prototype.registerClass = function (c, b, d) { this.prototype.constructor = this; this.__typeName = c; this.__class = true; if (b) { this.__baseType = b; this.__basePrototypePending = true } Sys.__upperCaseTypes[c.toUpperCase()] = this; if (d) { this.__interfaces = []; for (var a = 2, f = arguments.length; a < f; a++) { var e = arguments[a]; this.__interfaces.push(e) } } return this }; Type.prototype.registerInterface = function (a) { Sys.__upperCaseTypes[a.toUpperCase()] = this; this.prototype.constructor = this; this.__typeName = a; this.__interface = true; return this }; Type.prototype.resolveInheritance = function () { if (this.__basePrototypePending) { var b = this.__baseType; b.resolveInheritance(); for (var a in b.prototype) { var c = b.prototype[a]; if (!this.prototype[a]) this.prototype[a] = c } delete this.__basePrototypePending } }; Type.getRootNamespaces = function () { return Array.clone(Sys.__rootNamespaces) }; Type.isClass = function (a) { if (typeof a === "undefined" || a === null) return false; return !!a.__class }; Type.isInterface = function (a) { if (typeof a === "undefined" || a === null) return false; return !!a.__interface }; Type.isNamespace = function (a) { if (typeof a === "undefined" || a === null) return false; return !!a.__namespace }; Type.parse = function (typeName, ns) { var fn; if (ns) { fn = Sys.__upperCaseTypes[ns.getName().toUpperCase() + "." + typeName.toUpperCase()]; return fn || null } if (!typeName) return null; if (!Type.__htClasses) Type.__htClasses = {}; fn = Type.__htClasses[typeName]; if (!fn) { fn = eval(typeName); Type.__htClasses[typeName] = fn } return fn }; Type.registerNamespace = function (f) { var d = window, c = f.split("."); for (var b = 0; b < c.length; b++) { var e = c[b], a = d[e]; if (!a) { a = d[e] = { __namespace: true, __typeName: c.slice(0, b + 1).join(".") }; if (b === 0) Sys.__rootNamespaces[Sys.__rootNamespaces.length] = a; a.getName = function () { return this.__typeName } } d = a } }; window.Sys = { __namespace: true, __typeName: "Sys", getName: function () { return "Sys" }, __upperCaseTypes: {} }; Sys.__rootNamespaces = [Sys]; Sys.IDisposable = function () { }; Sys.IDisposable.prototype = {}; Sys.IDisposable.registerInterface("Sys.IDisposable"); Sys.StringBuilder = function (a) { this._parts = typeof a !== "undefined" && a !== null && a !== "" ? [a.toString()] : []; this._value = {}; this._len = 0 }; Sys.StringBuilder.prototype = { append: function (a) { this._parts[this._parts.length] = a }, appendLine: function (a) { this._parts[this._parts.length] = typeof a === "undefined" || a === null || a === "" ? "\r\n" : a + "\r\n" }, clear: function () { this._parts = []; this._value = {}; this._len = 0 }, isEmpty: function () { if (this._parts.length === 0) return true; return this.toString() === "" }, toString: function (a) { a = a || ""; var b = this._parts; if (this._len !== b.length) { this._value = {}; this._len = b.length } var d = this._value; if (typeof d[a] === "undefined") { if (a !== "") for (var c = 0; c < b.length;) if (typeof b[c] === "undefined" || b[c] === "" || b[c] === null) b.splice(c, 1); else c++; d[a] = this._parts.join(a) } return d[a] } }; Sys.StringBuilder.registerClass("Sys.StringBuilder"); if (!window.XMLHttpRequest) window.XMLHttpRequest = function () { var b = ["Mxsml2.XMLHTTP.3.0", "Msxml2.XMLHTTP"]; for (var a = 0, c = b.length; a < c; a++) try { return new ActiveXObject(b[a]) } catch (d) { } return null }; Sys.Browser = {}; Sys.Browser.InternetExplorer = {}; Sys.Browser.Firefox = {}; Sys.Browser.Safari = {}; Sys.Browser.Opera = {}; Sys.Browser.agent = null; Sys.Browser.hasDebuggerStatement = false; Sys.Browser.name = navigator.appName; Sys.Browser.version = parseFloat(navigator.appVersion); if (navigator.userAgent.indexOf(" MSIE ") > -1) { Sys.Browser.agent = Sys.Browser.InternetExplorer; Sys.Browser.version = parseFloat(navigator.userAgent.match(/MSIE (\d+\.\d+)/)[1]); Sys.Browser.hasDebuggerStatement = true } else if (navigator.userAgent.indexOf(" Firefox/") > -1) { Sys.Browser.agent = Sys.Browser.Firefox; Sys.Browser.version = parseFloat(navigator.userAgent.match(/Firefox\/(\d+\.\d+)/)[1]); Sys.Browser.name = "Firefox"; Sys.Browser.hasDebuggerStatement = true } else if (navigator.userAgent.indexOf(" Safari/") > -1) { Sys.Browser.agent = Sys.Browser.Safari; Sys.Browser.version = parseFloat(navigator.userAgent.match(/Safari\/(\d+(\.\d+)?)/)[1]); Sys.Browser.name = "Safari" } else if (navigator.userAgent.indexOf("Opera/") > -1) Sys.Browser.agent = Sys.Browser.Opera; Type.registerNamespace("Sys.UI"); Sys._Debug = function () { }; Sys._Debug.prototype = { _appendConsole: function (a) { if (typeof Debug !== "undefined" && Debug.writeln) Debug.writeln(a); if (window.console && window.console.log) window.console.log(a); if (window.opera) window.opera.postError(a); if (window.debugService) window.debugService.trace(a) }, _appendTrace: function (b) { var a = document.getElementById("TraceConsole"); if (a && a.tagName.toUpperCase() === "TEXTAREA") a.value += b + "\n" }, assert: function (c, a, b) { if (!c) { a = b && this.assert.caller ? String.format(Sys.Res.assertFailedCaller, a, this.assert.caller) : String.format(Sys.Res.assertFailed, a); if (confirm(String.format(Sys.Res.breakIntoDebugger, a))) this.fail(a) } }, clearTrace: function () { var a = document.getElementById("TraceConsole"); if (a && a.tagName.toUpperCase() === "TEXTAREA") a.value = "" }, fail: function (message) { this._appendConsole(message); if (Sys.Browser.hasDebuggerStatement) eval("debugger") }, trace: function (a) { this._appendConsole(a); this._appendTrace(a) }, traceDump: function (a, b) { var c = this._traceDump(a, b, true) }, _traceDump: function (a, c, f, b, d) { c = c ? c : "traceDump"; b = b ? b : ""; if (a === null) { this.trace(b + c + ": null"); return } switch (typeof a) { case "undefined": this.trace(b + c + ": Undefined"); break; case "number": case "string": case "boolean": this.trace(b + c + ": " + a); break; default: if (Date.isInstanceOfType(a) || RegExp.isInstanceOfType(a)) { this.trace(b + c + ": " + a.toString()); break } if (!d) d = []; else if (Array.contains(d, a)) { this.trace(b + c + ": ..."); return } Array.add(d, a); if (a == window || a === document || window.HTMLElement && a instanceof HTMLElement || typeof a.nodeName === "string") { var k = a.tagName ? a.tagName : "DomElement"; if (a.id) k += " - " + a.id; this.trace(b + c + " {" + k + "}") } else { var i = Object.getTypeName(a); this.trace(b + c + (typeof i === "string" ? " {" + i + "}" : "")); if (b === "" || f) { b += "    "; var e, j, l, g, h; if (Array.isInstanceOfType(a)) { j = a.length; for (e = 0; e < j; e++) this._traceDump(a[e], "[" + e + "]", f, b, d) } else for (g in a) { h = a[g]; if (!Function.isInstanceOfType(h)) this._traceDump(h, g, f, b, d) } } } Array.remove(d, a) } } }; Sys._Debug.registerClass("Sys._Debug"); Sys.Debug = new Sys._Debug; Sys.Debug.isDebug = false; function Sys$Enum$parse(c, e) { var a, b, i; if (e) { a = this.__lowerCaseValues; if (!a) { this.__lowerCaseValues = a = {}; var g = this.prototype; for (var f in g) a[f.toLowerCase()] = g[f] } } else a = this.prototype; if (!this.__flags) { i = e ? c.toLowerCase() : c; b = a[i.trim()]; if (typeof b !== "number") throw Error.argument("value", String.format(Sys.Res.enumInvalidValue, c, this.__typeName)); return b } else { var h = (e ? c.toLowerCase() : c).split(","), j = 0; for (var d = h.length - 1; d >= 0; d--) { var k = h[d].trim(); b = a[k]; if (typeof b !== "number") throw Error.argument("value", String.format(Sys.Res.enumInvalidValue, c.split(",")[d].trim(), this.__typeName)); j |= b } return j } } function Sys$Enum$toString(c) { if (typeof c === "undefined" || c === null) return this.__string; var d = this.prototype, a; if (!this.__flags || c === 0) { for (a in d) if (d[a] === c) return a } else { var b = this.__sortedValues; if (!b) { b = []; for (a in d) b[b.length] = { key: a, value: d[a] }; b.sort(function (a, b) { return a.value - b.value }); this.__sortedValues = b } var e = [], g = c; for (a = b.length - 1; a >= 0; a--) { var h = b[a], f = h.value; if (f === 0) continue; if ((f & c) === f) { e[e.length] = h.key; g -= f; if (g === 0) break } } if (e.length && g === 0) return e.reverse().join(", ") } return "" } Type.prototype.registerEnum = function (b, c) { Sys.__upperCaseTypes[b.toUpperCase()] = this; for (var a in this.prototype) this[a] = this.prototype[a]; this.__typeName = b; this.parse = Sys$Enum$parse; this.__string = this.toString(); this.toString = Sys$Enum$toString; this.__flags = c; this.__enum = true }; Type.isEnum = function (a) { if (typeof a === "undefined" || a === null) return false; return !!a.__enum }; Type.isFlags = function (a) { if (typeof a === "undefined" || a === null) return false; return !!a.__flags }; Sys.EventHandlerList = function () { this._list = {} }; Sys.EventHandlerList.prototype = { addHandler: function (b, a) { Array.add(this._getEvent(b, true), a) }, removeHandler: function (c, b) { var a = this._getEvent(c); if (!a) return; Array.remove(a, b) }, getHandler: function (b) { var a = this._getEvent(b); if (!a || a.length === 0) return null; a = Array.clone(a); return function (c, d) { for (var b = 0, e = a.length; b < e; b++) a[b](c, d) } }, _getEvent: function (a, b) { if (!this._list[a]) { if (!b) return null; this._list[a] = [] } return this._list[a] } }; Sys.EventHandlerList.registerClass("Sys.EventHandlerList"); Sys.EventArgs = function () { }; Sys.EventArgs.registerClass("Sys.EventArgs"); Sys.EventArgs.Empty = new Sys.EventArgs; Sys.CancelEventArgs = function () { Sys.CancelEventArgs.initializeBase(this); this._cancel = false }; Sys.CancelEventArgs.prototype = { get_cancel: function () { return this._cancel }, set_cancel: function (a) { this._cancel = a } }; Sys.CancelEventArgs.registerClass("Sys.CancelEventArgs", Sys.EventArgs); Sys.INotifyPropertyChange = function () { }; Sys.INotifyPropertyChange.prototype = {}; Sys.INotifyPropertyChange.registerInterface("Sys.INotifyPropertyChange"); Sys.PropertyChangedEventArgs = function (a) { Sys.PropertyChangedEventArgs.initializeBase(this); this._propertyName = a }; Sys.PropertyChangedEventArgs.prototype = { get_propertyName: function () { return this._propertyName } }; Sys.PropertyChangedEventArgs.registerClass("Sys.PropertyChangedEventArgs", Sys.EventArgs); Sys.INotifyDisposing = function () { }; Sys.INotifyDisposing.prototype = {}; Sys.INotifyDisposing.registerInterface("Sys.INotifyDisposing"); Sys.Component = function () { if (Sys.Application) Sys.Application.registerDisposableObject(this) }; Sys.Component.prototype = { _id: null, _initialized: false, _updating: false, get_events: function () { if (!this._events) this._events = new Sys.EventHandlerList; return this._events }, get_id: function () { return this._id }, set_id: function (a) { this._id = a }, get_isInitialized: function () { return this._initialized }, get_isUpdating: function () { return this._updating }, add_disposing: function (a) { this.get_events().addHandler("disposing", a) }, remove_disposing: function (a) { this.get_events().removeHandler("disposing", a) }, add_propertyChanged: function (a) { this.get_events().addHandler("propertyChanged", a) }, remove_propertyChanged: function (a) { this.get_events().removeHandler("propertyChanged", a) }, beginUpdate: function () { this._updating = true }, dispose: function () { if (this._events) { var a = this._events.getHandler("disposing"); if (a) a(this, Sys.EventArgs.Empty) } delete this._events; Sys.Application.unregisterDisposableObject(this); Sys.Application.removeComponent(this) }, endUpdate: function () { this._updating = false; if (!this._initialized) this.initialize(); this.updated() }, initialize: function () { this._initialized = true }, raisePropertyChanged: function (b) { if (!this._events) return; var a = this._events.getHandler("propertyChanged"); if (a) a(this, new Sys.PropertyChangedEventArgs(b)) }, updated: function () { } }; Sys.Component.registerClass("Sys.Component", null, Sys.IDisposable, Sys.INotifyPropertyChange, Sys.INotifyDisposing); function Sys$Component$_setProperties(a, i) { var d, j = Object.getType(a), e = j === Object || j === Sys.UI.DomElement, h = Sys.Component.isInstanceOfType(a) && !a.get_isUpdating(); if (h) a.beginUpdate(); for (var c in i) { var b = i[c], f = e ? null : a["get_" + c]; if (e || typeof f !== "function") { var k = a[c]; if (!b || typeof b !== "object" || e && !k) a[c] = b; else Sys$Component$_setProperties(k, b) } else { var l = a["set_" + c]; if (typeof l === "function") l.apply(a, [b]); else if (b instanceof Array) { d = f.apply(a); for (var g = 0, m = d.length, n = b.length; g < n; g++, m++) d[m] = b[g] } else if (typeof b === "object" && Object.getType(b) === Object) { d = f.apply(a); Sys$Component$_setProperties(d, b) } } } if (h) a.endUpdate() } function Sys$Component$_setReferences(c, b) { for (var a in b) { var e = c["set_" + a], d = $find(b[a]); e.apply(c, [d]) } } var $create = Sys.Component.create = function (h, f, d, c, g) { var a = g ? new h(g) : new h, b = Sys.Application, i = b.get_isCreatingComponents(); a.beginUpdate(); if (f) Sys$Component$_setProperties(a, f); if (d) for (var e in d) a["add_" + e](d[e]); if (a.get_id()) b.addComponent(a); if (i) { b._createdComponents[b._createdComponents.length] = a; if (c) b._addComponentToSecondPass(a, c); else a.endUpdate() } else { if (c) Sys$Component$_setReferences(a, c); a.endUpdate() } return a }; Sys.UI.MouseButton = function () { throw Error.notImplemented() }; Sys.UI.MouseButton.prototype = { leftButton: 0, middleButton: 1, rightButton: 2 }; Sys.UI.MouseButton.registerEnum("Sys.UI.MouseButton"); Sys.UI.Key = function () { throw Error.notImplemented() }; Sys.UI.Key.prototype = { backspace: 8, tab: 9, enter: 13, esc: 27, space: 32, pageUp: 33, pageDown: 34, end: 35, home: 36, left: 37, up: 38, right: 39, down: 40, del: 127 }; Sys.UI.Key.registerEnum("Sys.UI.Key"); Sys.UI.Point = function (a, b) { this.x = a; this.y = b }; Sys.UI.Point.registerClass("Sys.UI.Point"); Sys.UI.Bounds = function (c, d, b, a) { this.x = c; this.y = d; this.height = a; this.width = b }; Sys.UI.Bounds.registerClass("Sys.UI.Bounds"); Sys.UI.DomEvent = function (d) { var a = d; this.rawEvent = a; this.altKey = a.altKey; if (typeof a.button !== "undefined") this.button = typeof a.which !== "undefined" ? a.button : a.button === 4 ? Sys.UI.MouseButton.middleButton : a.button === 2 ? Sys.UI.MouseButton.rightButton : Sys.UI.MouseButton.leftButton; if (a.type === "keypress") this.charCode = a.charCode || a.keyCode; else if (a.keyCode && a.keyCode === 46) this.keyCode = 127; else this.keyCode = a.keyCode; this.clientX = a.clientX; this.clientY = a.clientY; this.ctrlKey = a.ctrlKey; this.target = a.target ? a.target : a.srcElement; if (typeof a.offsetX !== "undefined" && typeof a.offsetY !== "undefined") { this.offsetX = a.offsetX; this.offsetY = a.offsetY } else if (this.target && this.target.nodeType !== 3 && typeof a.clientX === "number") { var b = Sys.UI.DomElement.getLocation(this.target), c = Sys.UI.DomElement._getWindow(this.target); this.offsetX = (c.pageXOffset || 0) + a.clientX - b.x; this.offsetY = (c.pageYOffset || 0) + a.clientY - b.y } this.screenX = a.screenX; this.screenY = a.screenY; this.shiftKey = a.shiftKey; this.type = a.type }; Sys.UI.DomEvent.prototype = { preventDefault: function () { if (this.rawEvent.preventDefault) this.rawEvent.preventDefault(); else if (window.event) this.rawEvent.returnValue = false }, stopPropagation: function () { if (this.rawEvent.stopPropagation) this.rawEvent.stopPropagation(); else if (window.event) this.rawEvent.cancelBubble = true } }; Sys.UI.DomEvent.registerClass("Sys.UI.DomEvent"); var $addHandler = Sys.UI.DomEvent.addHandler = function (a, d, e) { if (!a._events) a._events = {}; var c = a._events[d]; if (!c) a._events[d] = c = []; var b; if (a.addEventListener) { b = function (b) { return e.call(a, new Sys.UI.DomEvent(b)) }; a.addEventListener(d, b, false) } else if (a.attachEvent) { b = function () { var b = {}; try { b = Sys.UI.DomElement._getWindow(a).event } catch (c) { } return e.call(a, new Sys.UI.DomEvent(b)) }; a.attachEvent("on" + d, b) } c[c.length] = { handler: e, browserHandler: b } }, $addHandlers = Sys.UI.DomEvent.addHandlers = function (e, d, c) { for (var b in d) { var a = d[b]; if (c) a = Function.createDelegate(c, a); $addHandler(e, b, a) } }, $clearHandlers = Sys.UI.DomEvent.clearHandlers = function (a) { if (a._events) { var e = a._events; for (var b in e) { var d = e[b]; for (var c = d.length - 1; c >= 0; c--) $removeHandler(a, b, d[c].handler) } a._events = null } }, $removeHandler = Sys.UI.DomEvent.removeHandler = function (a, e, f) { var d = null, c = a._events[e]; for (var b = 0, g = c.length; b < g; b++) if (c[b].handler === f) { d = c[b].browserHandler; break } if (a.removeEventListener) a.removeEventListener(e, d, false); else if (a.detachEvent) a.detachEvent("on" + e, d); c.splice(b, 1) }; Sys.UI.DomElement = function () { }; Sys.UI.DomElement.registerClass("Sys.UI.DomElement"); Sys.UI.DomElement.addCssClass = function (a, b) { if (!Sys.UI.DomElement.containsCssClass(a, b)) if (a.className === "") a.className = b; else a.className += " " + b }; Sys.UI.DomElement.containsCssClass = function (b, a) { return Array.contains(b.className.split(" "), a) }; Sys.UI.DomElement.getBounds = function (a) { var b = Sys.UI.DomElement.getLocation(a); return new Sys.UI.Bounds(b.x, b.y, a.offsetWidth || 0, a.offsetHeight || 0) }; var $get = Sys.UI.DomElement.getElementById = function (f, e) { if (!e) return document.getElementById(f); if (e.getElementById) return e.getElementById(f); var c = [], d = e.childNodes; for (var b = 0; b < d.length; b++) { var a = d[b]; if (a.nodeType == 1) c[c.length] = a } while (c.length) { a = c.shift(); if (a.id == f) return a; d = a.childNodes; for (b = 0; b < d.length; b++) { a = d[b]; if (a.nodeType == 1) c[c.length] = a } } return null }; switch (Sys.Browser.agent) { case Sys.Browser.InternetExplorer: Sys.UI.DomElement.getLocation = function (a) { if (a.self || a.nodeType === 9) return new Sys.UI.Point(0, 0); var b; try { b = a.getBoundingClientRect(); } catch (e) { b = null;} if (!b) return new Sys.UI.Point(0, 0); var d = a.ownerDocument.documentElement, e = b.left - 2 + d.scrollLeft, f = b.top - 2 + d.scrollTop; try { var c = a.ownerDocument.parentWindow.frameElement || null; if (c) { var g = c.frameBorder === "0" || c.frameBorder === "no" ? 2 : 0; e += g; f += g } } catch (h) { } return new Sys.UI.Point(e, f) }; break; case Sys.Browser.Safari: Sys.UI.DomElement.getLocation = function (c) { if (c.window && c.window === c || c.nodeType === 9) return new Sys.UI.Point(0, 0); var f = 0, g = 0, j = null, e = null, b; for (var a = c; a; j = a, (e = b, a = a.offsetParent)) { b = Sys.UI.DomElement._getCurrentStyle(a); var d = a.tagName; if ((a.offsetLeft || a.offsetTop) && (d !== "BODY" || (!e || e.position !== "absolute"))) { f += a.offsetLeft; g += a.offsetTop } } b = Sys.UI.DomElement._getCurrentStyle(c); var h = b ? b.position : null; if (!h || h !== "absolute") for (var a = c.parentNode; a; a = a.parentNode) { d = a.tagName; if (d !== "BODY" && d !== "HTML" && (a.scrollLeft || a.scrollTop)) { f -= a.scrollLeft || 0; g -= a.scrollTop || 0 } b = Sys.UI.DomElement._getCurrentStyle(a); var i = b ? b.position : null; if (i && i === "absolute") break } return new Sys.UI.Point(f, g) }; break; case Sys.Browser.Opera: Sys.UI.DomElement.getLocation = function (b) { if (b.window && b.window === b || b.nodeType === 9) return new Sys.UI.Point(0, 0); var d = 0, e = 0, i = null; for (var a = b; a; i = a, a = a.offsetParent) { var f = a.tagName; d += a.offsetLeft || 0; e += a.offsetTop || 0 } var g = b.style.position, c = g && g !== "static"; for (var a = b.parentNode; a; a = a.parentNode) { f = a.tagName; if (f !== "BODY" && f !== "HTML" && (a.scrollLeft || a.scrollTop) && (c && (a.style.overflow === "scroll" || a.style.overflow === "auto"))) { d -= a.scrollLeft || 0; e -= a.scrollTop || 0 } var h = a && a.style ? a.style.position : null; c = c || h && h !== "static" } return new Sys.UI.Point(d, e) }; break; default: Sys.UI.DomElement.getLocation = function (d) { if (d.window && d.window === d || d.nodeType === 9) return new Sys.UI.Point(0, 0); var e = 0, f = 0, i = null, g = null, b = null; for (var a = d; a; i = a, (g = b, a = a.offsetParent)) { var c = a.tagName; b = Sys.UI.DomElement._getCurrentStyle(a); if ((a.offsetLeft || a.offsetTop) && !(c === "BODY" && (!g || g.position !== "absolute"))) { e += a.offsetLeft; f += a.offsetTop } if (i !== null && b) { if (c !== "TABLE" && c !== "TD" && c !== "HTML") { e += parseInt(b.borderLeftWidth) || 0; f += parseInt(b.borderTopWidth) || 0 } if (c === "TABLE" && (b.position === "relative" || b.position === "absolute")) { e += parseInt(b.marginLeft) || 0; f += parseInt(b.marginTop) || 0 } } } b = Sys.UI.DomElement._getCurrentStyle(d); var h = b ? b.position : null; if (!h || h !== "absolute") for (var a = d.parentNode; a; a = a.parentNode) { c = a.tagName; if (c !== "BODY" && c !== "HTML" && (a.scrollLeft || a.scrollTop)) { e -= a.scrollLeft || 0; f -= a.scrollTop || 0; b = Sys.UI.DomElement._getCurrentStyle(a); if (b) { e += parseInt(b.borderLeftWidth) || 0; f += parseInt(b.borderTopWidth) || 0 } } } return new Sys.UI.Point(e, f) } } Sys.UI.DomElement.removeCssClass = function (d, c) { var a = " " + d.className + " ", b = a.indexOf(" " + c + " "); if (b >= 0) d.className = (a.substr(0, b) + " " + a.substring(b + c.length + 1, a.length)).trim() }; Sys.UI.DomElement.setLocation = function (b, c, d) { var a = b.style; a.position = "absolute"; a.left = c + "px"; a.top = d + "px" }; Sys.UI.DomElement.toggleCssClass = function (b, a) { if (Sys.UI.DomElement.containsCssClass(b, a)) Sys.UI.DomElement.removeCssClass(b, a); else Sys.UI.DomElement.addCssClass(b, a) }; Sys.UI.DomElement.getVisibilityMode = function (a) { return a._visibilityMode === Sys.UI.VisibilityMode.hide ? Sys.UI.VisibilityMode.hide : Sys.UI.VisibilityMode.collapse }; Sys.UI.DomElement.setVisibilityMode = function (a, b) { Sys.UI.DomElement._ensureOldDisplayMode(a); if (a._visibilityMode !== b) { a._visibilityMode = b; if (Sys.UI.DomElement.getVisible(a) === false) if (a._visibilityMode === Sys.UI.VisibilityMode.hide) a.style.display = a._oldDisplayMode; else a.style.display = "none"; a._visibilityMode = b } }; Sys.UI.DomElement.getVisible = function (b) { var a = b.currentStyle || Sys.UI.DomElement._getCurrentStyle(b); if (!a) return true; return a.visibility !== "hidden" && a.display !== "none" }; Sys.UI.DomElement.setVisible = function (a, b) { if (b !== Sys.UI.DomElement.getVisible(a)) { Sys.UI.DomElement._ensureOldDisplayMode(a); a.style.visibility = b ? "visible" : "hidden"; if (b || a._visibilityMode === Sys.UI.VisibilityMode.hide) a.style.display = a._oldDisplayMode; else a.style.display = "none" } }; Sys.UI.DomElement._ensureOldDisplayMode = function (a) { if (!a._oldDisplayMode) { var b = a.currentStyle || Sys.UI.DomElement._getCurrentStyle(a); a._oldDisplayMode = b ? b.display : null; if (!a._oldDisplayMode || a._oldDisplayMode === "none") switch (a.tagName.toUpperCase()) { case "DIV": case "P": case "ADDRESS": case "BLOCKQUOTE": case "BODY": case "COL": case "COLGROUP": case "DD": case "DL": case "DT": case "FIELDSET": case "FORM": case "H1": case "H2": case "H3": case "H4": case "H5": case "H6": case "HR": case "IFRAME": case "LEGEND": case "OL": case "PRE": case "TABLE": case "TD": case "TH": case "TR": case "UL": a._oldDisplayMode = "block"; break; case "LI": a._oldDisplayMode = "list-item"; break; default: a._oldDisplayMode = "inline" } } }; Sys.UI.DomElement._getWindow = function (a) { var b = a.ownerDocument || a.document || a; return b.defaultView || b.parentWindow }; Sys.UI.DomElement._getCurrentStyle = function (a) { if (a.nodeType === 3) return null; var c = Sys.UI.DomElement._getWindow(a); if (a.documentElement) a = a.documentElement; var b = c && a !== c && c.getComputedStyle ? c.getComputedStyle(a, null) : a.currentStyle || a.style; if (!b && Sys.Browser.agent === Sys.Browser.Safari && a.style) { var g = a.style.display, f = a.style.position; a.style.position = "absolute"; a.style.display = "block"; var e = c.getComputedStyle(a, null); a.style.display = g; a.style.position = f; b = {}; for (var d in e) b[d] = e[d]; b.display = "none" } return b }; Sys.IContainer = function () { }; Sys.IContainer.prototype = {}; Sys.IContainer.registerInterface("Sys.IContainer"); Sys._ScriptLoader = function () { this._scriptsToLoad = null; this._scriptLoadedDelegate = Function.createDelegate(this, this._scriptLoadedHandler) }; Sys._ScriptLoader.prototype = { dispose: function () { this._stopLoading(); if (this._events) delete this._events; this._scriptLoadedDelegate = null }, loadScripts: function (a, c, d, b) { this._loading = true; this._allScriptsLoadedCallback = c; this._scriptLoadFailedCallback = d; this._scriptLoadTimeoutCallback = b; if (a > 0) this._timeoutCookie = window.setTimeout(Function.createDelegate(this, this._scriptLoadTimeoutHandler), a * 1000); this._loadScriptsInternal() }, notifyScriptLoaded: function () { if (!this._loading) return; this._currentTask._notified++; if (Sys.Browser.agent === Sys.Browser.Safari) if (this._currentTask._notified === 1) window.setTimeout(Function.createDelegate(this, function () { this._scriptLoadedHandler(this._currentTask.get_scriptElement(), true) }), 0) }, queueCustomScriptTag: function (a) { if (!this._scriptsToLoad) this._scriptsToLoad = []; Array.add(this._scriptsToLoad, a) }, queueScriptBlock: function (a) { if (!this._scriptsToLoad) this._scriptsToLoad = []; Array.add(this._scriptsToLoad, { text: a }) }, queueScriptReference: function (a) { if (!this._scriptsToLoad) this._scriptsToLoad = []; Array.add(this._scriptsToLoad, { src: a }) }, _createScriptElement: function (c) { var a = document.createElement("SCRIPT"); a.type = "text/javascript"; for (var b in c) a[b] = c[b]; return a }, _loadScriptsInternal: function () { if (this._scriptsToLoad && this._scriptsToLoad.length > 0) { var b = Array.dequeue(this._scriptsToLoad), a = this._createScriptElement(b); if (a.text && Sys.Browser.agent === Sys.Browser.Safari) { a.innerHTML = a.text; delete a.text } if (typeof b.src === "string") { this._currentTask = new Sys._ScriptLoaderTask(a, this._scriptLoadedDelegate); this._currentTask.execute() } else { document.getElementsByTagName("HEAD")[0].appendChild(a); var d = this; window.setTimeout(function () { Sys._ScriptLoader._clearScript(a); d._loadScriptsInternal() }, 0) } } else { var c = this._allScriptsLoadedCallback; this._stopLoading(); if (c) c(this) } }, _raiseError: function (a) { var c = this._scriptLoadFailedCallback, b = this._currentTask.get_scriptElement(); this._stopLoading(); if (c) c(this, b, a); else throw Sys._ScriptLoader._errorScriptLoadFailed(b.src, a) }, _scriptLoadedHandler: function (a, b) { if (b && this._currentTask._notified) if (this._currentTask._notified > 1) this._raiseError(true); else { Array.add(Sys._ScriptLoader._getLoadedScripts(), a.src); this._currentTask.dispose(); this._currentTask = null; this._loadScriptsInternal() } else this._raiseError(false) }, _scriptLoadTimeoutHandler: function () { var a = this._scriptLoadTimeoutCallback; this._stopLoading(); if (a) a(this) }, _stopLoading: function () { if (this._timeoutCookie) { window.clearTimeout(this._timeoutCookie); this._timeoutCookie = null } if (this._currentTask) { this._currentTask.dispose(); this._currentTask = null } this._scriptsToLoad = null; this._loading = null; this._allScriptsLoadedCallback = null; this._scriptLoadFailedCallback = null; this._scriptLoadTimeoutCallback = null } }; Sys._ScriptLoader.registerClass("Sys._ScriptLoader", null, Sys.IDisposable); Sys._ScriptLoader.getInstance = function () { var a = Sys._ScriptLoader._activeInstance; if (!a) a = Sys._ScriptLoader._activeInstance = new Sys._ScriptLoader; return a }; Sys._ScriptLoader.isScriptLoaded = function (b) { var a = document.createElement("script"); a.src = b; return Array.contains(Sys._ScriptLoader._getLoadedScripts(), a.src) }; Sys._ScriptLoader.readLoadedScripts = function () { if (!Sys._ScriptLoader._referencedScripts) { var b = Sys._ScriptLoader._referencedScripts = [], c = document.getElementsByTagName("SCRIPT"); for (i = c.length - 1; i >= 0; i--) { var d = c[i], a = d.src; if (a.length) if (!Array.contains(b, a)) Array.add(b, a) } } }; Sys._ScriptLoader._clearScript = function (a) { if (!Sys.Debug.isDebug) a.parentNode.removeChild(a) }; Sys._ScriptLoader._errorScriptLoadFailed = function (b, d) { var a; if (d) a = Sys.Res.scriptLoadMultipleCallbacks; else a = Sys.Res.scriptLoadFailed; var e = "Sys.ScriptLoadFailedException: " + String.format(a, b), c = Error.create(e, { name: "Sys.ScriptLoadFailedException", "scriptUrl": b }); c.popStackFrame(); return c }; Sys._ScriptLoader._getLoadedScripts = function () { if (!Sys._ScriptLoader._referencedScripts) { Sys._ScriptLoader._referencedScripts = []; Sys._ScriptLoader.readLoadedScripts() } return Sys._ScriptLoader._referencedScripts }; Sys._ScriptLoaderTask = function (b, a) { this._scriptElement = b; this._completedCallback = a; this._notified = 0 }; Sys._ScriptLoaderTask.prototype = { get_scriptElement: function () { return this._scriptElement }, dispose: function () { if (this._disposed) return; this._disposed = true; this._removeScriptElementHandlers(); Sys._ScriptLoader._clearScript(this._scriptElement); this._scriptElement = null }, execute: function () { this._addScriptElementHandlers(); document.getElementsByTagName("HEAD")[0].appendChild(this._scriptElement) }, _addScriptElementHandlers: function () { this._scriptLoadDelegate = Function.createDelegate(this, this._scriptLoadHandler); if (Sys.Browser.agent !== Sys.Browser.InternetExplorer) { this._scriptElement.readyState = "loaded"; $addHandler(this._scriptElement, "load", this._scriptLoadDelegate) } else $addHandler(this._scriptElement, "readystatechange", this._scriptLoadDelegate); if (this._scriptElement.addEventListener) { this._scriptErrorDelegate = Function.createDelegate(this, this._scriptErrorHandler); this._scriptElement.addEventListener("error", this._scriptErrorDelegate, false) } }, _removeScriptElementHandlers: function () { if (this._scriptLoadDelegate) { var a = this.get_scriptElement(); if (Sys.Browser.agent !== Sys.Browser.InternetExplorer) $removeHandler(a, "load", this._scriptLoadDelegate); else $removeHandler(a, "readystatechange", this._scriptLoadDelegate); if (this._scriptErrorDelegate) { this._scriptElement.removeEventListener("error", this._scriptErrorDelegate, false); this._scriptErrorDelegate = null } this._scriptLoadDelegate = null } }, _scriptErrorHandler: function () { if (this._disposed) return; this._completedCallback(this.get_scriptElement(), false) }, _scriptLoadHandler: function () { if (this._disposed) return; var a = this.get_scriptElement(); if (a.readyState !== "loaded" && a.readyState !== "complete") return; var b = this; window.setTimeout(function () { b._completedCallback(a, true) }, 0) } }; Sys._ScriptLoaderTask.registerClass("Sys._ScriptLoaderTask", null, Sys.IDisposable); Sys.ApplicationLoadEventArgs = function (b, a) { Sys.ApplicationLoadEventArgs.initializeBase(this); this._components = b; this._isPartialLoad = a }; Sys.ApplicationLoadEventArgs.prototype = { get_components: function () { return this._components }, get_isPartialLoad: function () { return this._isPartialLoad } }; Sys.ApplicationLoadEventArgs.registerClass("Sys.ApplicationLoadEventArgs", Sys.EventArgs); Sys._Application = function () { Sys._Application.initializeBase(this); this._disposableObjects = []; this._components = {}; this._createdComponents = []; this._secondPassComponents = []; this._unloadHandlerDelegate = Function.createDelegate(this, this._unloadHandler); this._loadHandlerDelegate = Function.createDelegate(this, this._loadHandler); Sys.UI.DomEvent.addHandler(window, "unload", this._unloadHandlerDelegate); Sys.UI.DomEvent.addHandler(window, "load", this._loadHandlerDelegate) }; Sys._Application.prototype = { _creatingComponents: false, _disposing: false, get_isCreatingComponents: function () { return this._creatingComponents }, add_load: function (a) { this.get_events().addHandler("load", a) }, remove_load: function (a) { this.get_events().removeHandler("load", a) }, add_init: function (a) { if (this._initialized) a(this, Sys.EventArgs.Empty); else this.get_events().addHandler("init", a) }, remove_init: function (a) { this.get_events().removeHandler("init", a) }, add_unload: function (a) { this.get_events().addHandler("unload", a) }, remove_unload: function (a) { this.get_events().removeHandler("unload", a) }, addComponent: function (a) { this._components[a.get_id()] = a }, beginCreateComponents: function () { this._creatingComponents = true }, dispose: function () { if (!this._disposing) { this._disposing = true; if (window.pageUnload) window.pageUnload(this, Sys.EventArgs.Empty); var c = this.get_events().getHandler("unload"); if (c) c(this, Sys.EventArgs.Empty); var b = Array.clone(this._disposableObjects); for (var a = 0, e = b.length; a < e; a++) b[a].dispose(); Array.clear(this._disposableObjects); Sys.UI.DomEvent.removeHandler(window, "unload", this._unloadHandlerDelegate); if (this._loadHandlerDelegate) { Sys.UI.DomEvent.removeHandler(window, "load", this._loadHandlerDelegate); this._loadHandlerDelegate = null } var d = Sys._ScriptLoader.getInstance(); if (d) d.dispose(); Sys._Application.callBaseMethod(this, "dispose") } }, endCreateComponents: function () { var b = this._secondPassComponents; for (var a = 0, d = b.length; a < d; a++) { var c = b[a].component; Sys$Component$_setReferences(c, b[a].references); c.endUpdate() } this._secondPassComponents = []; this._creatingComponents = false }, findComponent: function (b, a) { return a ? Sys.IContainer.isInstanceOfType(a) ? a.findComponent(b) : a[b] || null : Sys.Application._components[b] || null }, getComponents: function () { var a = [], b = this._components; for (var c in b) a[a.length] = b[c]; return a }, initialize: function () { if (!this._initialized && !this._initializing) { this._initializing = true; this._doInitialize(); } }, notifyScriptLoaded: function () { var a = Sys._ScriptLoader.getInstance(); if (a) a.notifyScriptLoaded() }, registerDisposableObject: function (a) { if (!this._disposing) this._disposableObjects[this._disposableObjects.length] = a }, raiseLoad: function () { var b = this.get_events().getHandler("load"), a = new Sys.ApplicationLoadEventArgs(Array.clone(this._createdComponents), !this._initializing); if (b) b(this, a); if (window.pageLoad) window.pageLoad(this, a); this._createdComponents = [] }, removeComponent: function (b) { var a = b.get_id(); if (a) delete this._components[a] }, unregisterDisposableObject: function (a) { if (!this._disposing) Array.remove(this._disposableObjects, a) }, _addComponentToSecondPass: function (b, a) { this._secondPassComponents[this._secondPassComponents.length] = { component: b, references: a } }, _doInitialize: function () { Sys._Application.callBaseMethod(this, "initialize"); var a = this.get_events().getHandler("init"); if (a) { this.beginCreateComponents(); a(this, Sys.EventArgs.Empty); this.endCreateComponents() } this.raiseLoad(); this._initializing = false }, _loadHandler: function () { if (this._loadHandlerDelegate) { Sys.UI.DomEvent.removeHandler(window, "load", this._loadHandlerDelegate); this._loadHandlerDelegate = null } this.initialize() }, _unloadHandler: function () { this.dispose() } }; Sys._Application.registerClass("Sys._Application", Sys.Component, Sys.IContainer); Sys.Application = new Sys._Application; var $find = Sys.Application.findComponent; Type.registerNamespace("Sys.Net"); Sys.Net.WebRequestExecutor = function () { this._webRequest = null; this._resultObject = null }; Sys.Net.WebRequestExecutor.prototype = { get_webRequest: function () { return this._webRequest }, _set_webRequest: function (a) { this._webRequest = a }, get_started: function () { throw Error.notImplemented() }, get_responseAvailable: function () { throw Error.notImplemented() }, get_timedOut: function () { throw Error.notImplemented() }, get_aborted: function () { throw Error.notImplemented() }, get_responseData: function () { throw Error.notImplemented() }, get_statusCode: function () { throw Error.notImplemented() }, get_statusText: function () { throw Error.notImplemented() }, get_xml: function () { throw Error.notImplemented() }, get_object: function () { if (!this._resultObject) this._resultObject = Sys.Serialization.JavaScriptSerializer.deserialize(this.get_responseData()); return this._resultObject }, executeRequest: function () { throw Error.notImplemented() }, abort: function () { throw Error.notImplemented() }, getResponseHeader: function () { throw Error.notImplemented() }, getAllResponseHeaders: function () { throw Error.notImplemented() } }; Sys.Net.WebRequestExecutor.registerClass("Sys.Net.WebRequestExecutor"); Sys.Net.XMLDOM = function (d) { if (!window.DOMParser) { var c = ["Msxml2.DOMDocument.3.0", "Msxml2.DOMDocument"]; for (var b = 0, f = c.length; b < f; b++) try { var a = new ActiveXObject(c[b]); a.async = false; a.loadXML(d); a.setProperty("SelectionLanguage", "XPath"); return a } catch (g) { } } else try { var e = new window.DOMParser; return e.parseFromString(d, "text/xml") } catch (g) { } return null }; Sys.Net.XMLHttpExecutor = function () { Sys.Net.XMLHttpExecutor.initializeBase(this); var a = this; this._xmlHttpRequest = null; this._webRequest = null; this._responseAvailable = false; this._timedOut = false; this._timer = null; this._aborted = false; this._started = false; this._onReadyStateChange = function () { if (a._xmlHttpRequest.readyState === 4) { try { if (typeof a._xmlHttpRequest.status === "undefined") return } catch (b) { return } a._clearTimer(); a._responseAvailable = true; a._webRequest.completed(Sys.EventArgs.Empty); if (a._xmlHttpRequest != null) { a._xmlHttpRequest.onreadystatechange = Function.emptyMethod; a._xmlHttpRequest = null } } }; this._clearTimer = function () { if (a._timer != null) { window.clearTimeout(a._timer); a._timer = null } }; this._onTimeout = function () { if (!a._responseAvailable) { a._clearTimer(); a._timedOut = true; a._xmlHttpRequest.onreadystatechange = Function.emptyMethod; a._xmlHttpRequest.abort(); a._webRequest.completed(Sys.EventArgs.Empty); a._xmlHttpRequest = null } } }; Sys.Net.XMLHttpExecutor.prototype = { get_timedOut: function () { return this._timedOut }, get_started: function () { return this._started }, get_responseAvailable: function () { return this._responseAvailable }, get_aborted: function () { return this._aborted }, executeRequest: function () { this._webRequest = this.get_webRequest(); var c = this._webRequest.get_body(), a = this._webRequest.get_headers(); this._xmlHttpRequest = new XMLHttpRequest; this._xmlHttpRequest.onreadystatechange = this._onReadyStateChange; var e = this._webRequest.get_httpVerb(); this._xmlHttpRequest.open(e, this._webRequest.getResolvedUrl(), true); if (a) for (var b in a) { var f = a[b]; if (typeof f !== "function") this._xmlHttpRequest.setRequestHeader(b, f) } if (e.toLowerCase() === "post") { if (a === null || !a["Content-Type"]) this._xmlHttpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8"); if (!c) c = "" } var d = this._webRequest.get_timeout(); if (d > 0) this._timer = window.setTimeout(Function.createDelegate(this, this._onTimeout), d); this._xmlHttpRequest.send(c); this._started = true }, getResponseHeader: function (b) { var a; try { a = this._xmlHttpRequest.getResponseHeader(b) } catch (c) { } if (!a) a = ""; return a }, getAllResponseHeaders: function () { return this._xmlHttpRequest.getAllResponseHeaders() }, get_responseData: function () { return this._xmlHttpRequest.responseText }, get_statusCode: function () { var a = 0; try { a = this._xmlHttpRequest.status } catch (b) { } return a }, get_statusText: function () { return this._xmlHttpRequest.statusText }, get_xml: function () { var a = this._xmlHttpRequest.responseXML; if (!a || !a.documentElement) { a = Sys.Net.XMLDOM(this._xmlHttpRequest.responseText); if (!a || !a.documentElement) return null } else if (navigator.userAgent.indexOf("MSIE") !== -1) a.setProperty("SelectionLanguage", "XPath"); if (a.documentElement.namespaceURI === "http://www.mozilla.org/newlayout/xml/parsererror.xml" && a.documentElement.tagName === "parsererror") return null; if (a.documentElement.firstChild && a.documentElement.firstChild.tagName === "parsererror") return null; return a }, abort: function () { if (this._aborted || this._responseAvailable || this._timedOut) return; this._aborted = true; this._clearTimer(); if (this._xmlHttpRequest && !this._responseAvailable) { this._xmlHttpRequest.onreadystatechange = Function.emptyMethod; this._xmlHttpRequest.abort(); this._xmlHttpRequest = null; this._webRequest.completed(Sys.EventArgs.Empty) } } }; Sys.Net.XMLHttpExecutor.registerClass("Sys.Net.XMLHttpExecutor", Sys.Net.WebRequestExecutor); Sys.Net._WebRequestManager = function () { this._this = this; this._defaultTimeout = 0; this._defaultExecutorType = "Sys.Net.XMLHttpExecutor" }; Sys.Net._WebRequestManager.prototype = { add_invokingRequest: function (a) { this._get_eventHandlerList().addHandler("invokingRequest", a) }, remove_invokingRequest: function (a) { this._get_eventHandlerList().removeHandler("invokingRequest", a) }, add_completedRequest: function (a) { this._get_eventHandlerList().addHandler("completedRequest", a) }, remove_completedRequest: function (a) { this._get_eventHandlerList().removeHandler("completedRequest", a) }, _get_eventHandlerList: function () { if (!this._events) this._events = new Sys.EventHandlerList; return this._events }, get_defaultTimeout: function () { return this._defaultTimeout }, set_defaultTimeout: function (a) { this._defaultTimeout = a }, get_defaultExecutorType: function () { return this._defaultExecutorType }, set_defaultExecutorType: function (a) { this._defaultExecutorType = a }, executeRequest: function (webRequest) { var executor = webRequest.get_executor(); if (!executor) { var failed = false; try { var executorType = eval(this._defaultExecutorType); executor = new executorType } catch (a) { failed = true } webRequest.set_executor(executor) } if (executor.get_aborted()) return; var evArgs = new Sys.Net.NetworkRequestEventArgs(webRequest), handler = this._get_eventHandlerList().getHandler("invokingRequest"); if (handler) handler(this, evArgs); if (!evArgs.get_cancel()) executor.executeRequest() } }; Sys.Net._WebRequestManager.registerClass("Sys.Net._WebRequestManager"); Sys.Net.WebRequestManager = new Sys.Net._WebRequestManager; Sys.Net.NetworkRequestEventArgs = function (a) { Sys.Net.NetworkRequestEventArgs.initializeBase(this); this._webRequest = a }; Sys.Net.NetworkRequestEventArgs.prototype = { get_webRequest: function () { return this._webRequest } }; Sys.Net.NetworkRequestEventArgs.registerClass("Sys.Net.NetworkRequestEventArgs", Sys.CancelEventArgs); Sys.Net.WebRequest = function () { this._url = ""; this._headers = {}; this._body = null; this._userContext = null; this._httpVerb = null; this._executor = null; this._invokeCalled = false; this._timeout = 0 }; Sys.Net.WebRequest.prototype = { add_completed: function (a) { this._get_eventHandlerList().addHandler("completed", a) }, remove_completed: function (a) { this._get_eventHandlerList().removeHandler("completed", a) }, completed: function (b) { var a = Sys.Net.WebRequestManager._get_eventHandlerList().getHandler("completedRequest"); if (a) a(this._executor, b); a = this._get_eventHandlerList().getHandler("completed"); if (a) a(this._executor, b) }, _get_eventHandlerList: function () { if (!this._events) this._events = new Sys.EventHandlerList; return this._events }, get_url: function () { return this._url }, set_url: function (a) { this._url = a }, get_headers: function () { return this._headers }, get_httpVerb: function () { if (this._httpVerb === null) { if (this._body === null) return "GET"; return "POST" } return this._httpVerb }, set_httpVerb: function (a) { this._httpVerb = a }, get_body: function () { return this._body }, set_body: function (a) { this._body = a }, get_userContext: function () { return this._userContext }, set_userContext: function (a) { this._userContext = a }, get_executor: function () { return this._executor }, set_executor: function (a) { this._executor = a; this._executor._set_webRequest(this) }, get_timeout: function () { if (this._timeout === 0) return Sys.Net.WebRequestManager.get_defaultTimeout(); return this._timeout }, set_timeout: function (a) { this._timeout = a }, getResolvedUrl: function () { return Sys.Net.WebRequest._resolveUrl(this._url) }, invoke: function () { Sys.Net.WebRequestManager.executeRequest(this); this._invokeCalled = true } }; Sys.Net.WebRequest._resolveUrl = function (b, a) { if (b && b.indexOf("://") !== -1) return b; if (!a || a.length === 0) { var c = document.getElementsByTagName("base")[0]; if (c && c.href && c.href.length > 0) a = c.href; else a = document.URL } var d = a.indexOf("?"); if (d !== -1) a = a.substr(0, d); a = a.substr(0, a.lastIndexOf("/") + 1); if (!b || b.length === 0) return a; if (b.charAt(0) === "/") { var e = a.indexOf("://"), g = a.indexOf("/", e + 3); return a.substr(0, g) + b } else { var f = a.lastIndexOf("/"); return a.substr(0, f + 1) + b } }; Sys.Net.WebRequest._createQueryString = function (d, b) { if (!b) b = encodeURIComponent; var a = new Sys.StringBuilder, f = 0; for (var c in d) { var e = d[c]; if (typeof e === "function") continue; var g = Sys.Serialization.JavaScriptSerializer.serialize(e); if (f !== 0) a.append("&"); a.append(c); a.append("="); a.append(b(g)); f++ } return a.toString() }; Sys.Net.WebRequest._createUrl = function (a, b) { if (!b) return a; var d = Sys.Net.WebRequest._createQueryString(b); if (d.length > 0) { var c = "?"; if (a && a.indexOf("?") !== -1) c = "&"; return a + c + d } else return a }; Sys.Net.WebRequest.registerClass("Sys.Net.WebRequest"); Sys.Net.WebServiceProxy = function () { }; Sys.Net.WebServiceProxy.prototype = { get_timeout: function () { return this._timeout }, set_timeout: function (a) { if (a < 0) throw Error.argumentOutOfRange("value", a, Sys.Res.invalidTimeout); this._timeout = a }, get_defaultUserContext: function () { return this._userContext }, set_defaultUserContext: function (a) { this._userContext = a }, get_defaultSucceededCallback: function () { return this._succeeded }, set_defaultSucceededCallback: function (a) { this._succeeded = a }, get_defaultFailedCallback: function () { return this._failed }, set_defaultFailedCallback: function (a) { this._failed = a }, get_path: function () { return this._path }, set_path: function (a) { this._path = a }, _invoke: function (d, e, g, f, c, b, a) { if (c === null || typeof c === "undefined") c = this.get_defaultSucceededCallback(); if (b === null || typeof b === "undefined") b = this.get_defaultFailedCallback(); if (a === null || typeof a === "undefined") a = this.get_defaultUserContext(); return Sys.Net.WebServiceProxy.invoke(d, e, g, f, c, b, a, this.get_timeout()) } }; Sys.Net.WebServiceProxy.registerClass("Sys.Net.WebServiceProxy"); Sys.Net.WebServiceProxy.invoke = function (k, a, j, d, i, c, f, h) { var b = new Sys.Net.WebRequest; b.get_headers()["Content-Type"] = "application/json; charset=utf-8"; if (!d) d = {}; var g = d; if (!j || !g) g = {}; b.set_url(Sys.Net.WebRequest._createUrl(k + "/" + encodeURIComponent(a), g)); var e = null; if (!j) { e = Sys.Serialization.JavaScriptSerializer.serialize(d); if (e === "{}") e = "" } b.set_body(e); b.add_completed(l); if (h && h > 0) b.set_timeout(h); b.invoke(); function l(d) { if (d.get_responseAvailable()) { var g = d.get_statusCode(), b = null; try { var e = d.getResponseHeader("Content-Type"); if (e.startsWith("application/json")) b = d.get_object(); else if (e.startsWith("text/xml")) b = d.get_xml(); else b = d.get_responseData() } catch (m) { } var k = d.getResponseHeader("jsonerror"), h = k === "true"; if (h) { if (b) b = new Sys.Net.WebServiceError(false, b.Message, b.StackTrace, b.ExceptionType) } else if (e.startsWith("application/json")) b = b.d; if (g < 200 || g >= 300 || h) { if (c) { if (!b || !h) b = new Sys.Net.WebServiceError(false, String.format(Sys.Res.webServiceFailedNoMsg, a), "", ""); b._statusCode = g; c(b, f, a) } } else if (i) i(b, f, a) } else { var j; if (d.get_timedOut()) j = String.format(Sys.Res.webServiceTimedOut, a); else j = String.format(Sys.Res.webServiceFailedNoMsg, a); if (c) c(new Sys.Net.WebServiceError(d.get_timedOut(), j, "", ""), f, a) } } return b }; Sys.Net.WebServiceProxy._generateTypedConstructor = function (a) { return function (b) { if (b) for (var c in b) this[c] = b[c]; this.__type = a } }; Sys.Net.WebServiceError = function (c, d, b, a) { this._timedOut = c; this._message = d; this._stackTrace = b; this._exceptionType = a; this._statusCode = -1 }; Sys.Net.WebServiceError.prototype = { get_timedOut: function () { return this._timedOut }, get_statusCode: function () { return this._statusCode }, get_message: function () { return this._message }, get_stackTrace: function () { return this._stackTrace }, get_exceptionType: function () { return this._exceptionType } }; Sys.Net.WebServiceError.registerClass("Sys.Net.WebServiceError"); Type.registerNamespace("Sys.Services"); Sys.Services._ProfileService = function () { Sys.Services._ProfileService.initializeBase(this); this.properties = {} }; Sys.Services._ProfileService.DefaultWebServicePath = ""; Sys.Services._ProfileService.prototype = { _defaultLoadCompletedCallback: null, _defaultSaveCompletedCallback: null, _path: "", _timeout: 0, get_defaultLoadCompletedCallback: function () { return this._defaultLoadCompletedCallback }, set_defaultLoadCompletedCallback: function (a) { this._defaultLoadCompletedCallback = a }, get_defaultSaveCompletedCallback: function () { return this._defaultSaveCompletedCallback }, set_defaultSaveCompletedCallback: function (a) { this._defaultSaveCompletedCallback = a }, get_path: function () { return this._path || "" }, load: function (c, d, e, f) { var b, a; if (!c) { a = "GetAllPropertiesForCurrentUser"; b = { authenticatedUserOnly: false } } else { a = "GetPropertiesForCurrentUser"; b = { properties: this._clonePropertyNames(c), authenticatedUserOnly: false } } this._invoke(this._get_path(), a, false, b, Function.createDelegate(this, this._onLoadComplete), Function.createDelegate(this, this._onLoadFailed), [d, e, f]) }, save: function (d, b, c, e) { var a = this._flattenProperties(d, this.properties); this._invoke(this._get_path(), "SetPropertiesForCurrentUser", false, { values: a.value, authenticatedUserOnly: false }, Function.createDelegate(this, this._onSaveComplete), Function.createDelegate(this, this._onSaveFailed), [b, c, e, a.count]) }, _clonePropertyNames: function (e) { var c = [], d = {}; for (var b = 0; b < e.length; b++) { var a = e[b]; if (!d[a]) { Array.add(c, a); d[a] = true } } return c }, _flattenProperties: function (a, i, j) { var b = {}, e, d, g = 0; if (a && a.length === 0) return { value: b, count: 0 }; for (var c in i) { e = i[c]; d = j ? j + "." + c : c; if (Sys.Services.ProfileGroup.isInstanceOfType(e)) { var k = this._flattenProperties(a, e, d), h = k.value; g += k.count; for (var f in h) { var l = h[f]; b[f] = l } } else if (!a || Array.indexOf(a, d) !== -1) { b[d] = e; g++ } } return { value: b, count: g } }, _get_path: function () { var a = this.get_path(); if (!a.length) a = Sys.Services._ProfileService.DefaultWebServicePath; if (!a || !a.length) throw Error.invalidOperation(Sys.Res.servicePathNotSet); return a }, _onLoadComplete: function (a, e, g) { if (typeof a !== "object") throw Error.invalidOperation(String.format(Sys.Res.webServiceInvalidReturnType, g, "Object")); var c = this._unflattenProperties(a); for (var b in c) this.properties[b] = c[b]; var d = e[0] || this.get_defaultLoadCompletedCallback() || this.get_defaultSucceededCallback(); if (d) { var f = e[2] || this.get_defaultUserContext(); d(a.length, f, "Sys.Services.ProfileService.load") } }, _onLoadFailed: function (d, b) { var a = b[1] || this.get_defaultFailedCallback(); if (a) { var c = b[2] || this.get_defaultUserContext(); a(d, c, "Sys.Services.ProfileService.load") } }, _onSaveComplete: function (a, b, f) { var c = b[3]; if (a !== null) if (a instanceof Array) c -= a.length; else if (typeof a === "number") c = a; else throw Error.invalidOperation(String.format(Sys.Res.webServiceInvalidReturnType, f, "Array")); var d = b[0] || this.get_defaultSaveCompletedCallback() || this.get_defaultSucceededCallback(); if (d) { var e = b[2] || this.get_defaultUserContext(); d(c, e, "Sys.Services.ProfileService.save") } }, _onSaveFailed: function (d, b) { var a = b[1] || this.get_defaultFailedCallback(); if (a) { var c = b[2] || this.get_defaultUserContext(); a(d, c, "Sys.Services.ProfileService.save") } }, _unflattenProperties: function (e) { var c = {}, d, f, h = 0; for (var a in e) { h++; f = e[a]; d = a.indexOf("."); if (d !== -1) { var g = a.substr(0, d); a = a.substr(d + 1); var b = c[g]; if (!b || !Sys.Services.ProfileGroup.isInstanceOfType(b)) { b = new Sys.Services.ProfileGroup; c[g] = b } b[a] = f } else c[a] = f } e.length = h; return c } }; Sys.Services._ProfileService.registerClass("Sys.Services._ProfileService", Sys.Net.WebServiceProxy); Sys.Services.ProfileService = new Sys.Services._ProfileService; Sys.Services.ProfileGroup = function (a) { if (a) for (var b in a) this[b] = a[b] }; Sys.Services.ProfileGroup.registerClass("Sys.Services.ProfileGroup"); Sys.Services._AuthenticationService = function () { Sys.Services._AuthenticationService.initializeBase(this) }; Sys.Services._AuthenticationService.DefaultWebServicePath = ""; Sys.Services._AuthenticationService.prototype = { _defaultLoginCompletedCallback: null, _defaultLogoutCompletedCallback: null, _path: "", _timeout: 0, _authenticated: false, get_defaultLoginCompletedCallback: function () { return this._defaultLoginCompletedCallback }, set_defaultLoginCompletedCallback: function (a) { this._defaultLoginCompletedCallback = a }, get_defaultLogoutCompletedCallback: function () { return this._defaultLogoutCompletedCallback }, set_defaultLogoutCompletedCallback: function (a) { this._defaultLogoutCompletedCallback = a }, get_isLoggedIn: function () { return this._authenticated }, get_path: function () { return this._path || "" }, login: function (c, b, a, h, f, d, e, g) { this._invoke(this._get_path(), "Login", false, { userName: c, password: b, createPersistentCookie: a }, Function.createDelegate(this, this._onLoginComplete), Function.createDelegate(this, this._onLoginFailed), [c, b, a, h, f, d, e, g]) }, logout: function (c, a, b, d) { this._invoke(this._get_path(), "Logout", false, {}, Function.createDelegate(this, this._onLogoutComplete), Function.createDelegate(this, this._onLogoutFailed), [c, a, b, d]) }, _get_path: function () { var a = this.get_path(); if (!a.length) a = Sys.Services._AuthenticationService.DefaultWebServicePath; if (!a || !a.length) throw Error.invalidOperation(Sys.Res.servicePathNotSet); return a }, _onLoginComplete: function (e, c, f) { if (typeof e !== "boolean") throw Error.invalidOperation(String.format(Sys.Res.webServiceInvalidReturnType, f, "Boolean")); var b = c[4], d = c[7] || this.get_defaultUserContext(), a = c[5] || this.get_defaultLoginCompletedCallback() || this.get_defaultSucceededCallback(); if (e) { this._authenticated = true; if (a) a(true, d, "Sys.Services.AuthenticationService.login"); if (typeof b !== "undefined" && b !== null) window.location.href = b } else if (a) a(false, d, "Sys.Services.AuthenticationService.login") }, _onLoginFailed: function (d, b) { var a = b[6] || this.get_defaultFailedCallback(); if (a) { var c = b[7] || this.get_defaultUserContext(); a(d, c, "Sys.Services.AuthenticationService.login") } }, _onLogoutComplete: function (f, a, e) { if (f !== null) throw Error.invalidOperation(String.format(Sys.Res.webServiceInvalidReturnType, e, "null")); var b = a[0], d = a[3] || this.get_defaultUserContext(), c = a[1] || this.get_defaultLogoutCompletedCallback() || this.get_defaultSucceededCallback(); this._authenticated = false; if (c) c(null, d, "Sys.Services.AuthenticationService.logout"); if (!b) window.location.reload(); else window.location.href = b }, _onLogoutFailed: function (c, b) { var a = b[2] || this.get_defaultFailedCallback(); if (a) a(c, b[3], "Sys.Services.AuthenticationService.logout") }, _setAuthenticated: function (a) { this._authenticated = a } }; Sys.Services._AuthenticationService.registerClass("Sys.Services._AuthenticationService", Sys.Net.WebServiceProxy); Sys.Services.AuthenticationService = new Sys.Services._AuthenticationService; Sys.Services._RoleService = function () { Sys.Services._RoleService.initializeBase(this); this._roles = [] }; Sys.Services._RoleService.DefaultWebServicePath = ""; Sys.Services._RoleService.prototype = { _defaultLoadCompletedCallback: null, _rolesIndex: null, _timeout: 0, _path: "", get_defaultLoadCompletedCallback: function () { return this._defaultLoadCompletedCallback }, set_defaultLoadCompletedCallback: function (a) { this._defaultLoadCompletedCallback = a }, get_path: function () { return this._path || "" }, get_roles: function () { return Array.clone(this._roles) }, isUserInRole: function (a) { var b = this._get_rolesIndex()[a.trim().toLowerCase()]; return !!b }, load: function (a, b, c) { Sys.Net.WebServiceProxy.invoke(this._get_path(), "GetRolesForCurrentUser", false, {}, Function.createDelegate(this, this._onLoadComplete), Function.createDelegate(this, this._onLoadFailed), [a, b, c], this.get_timeout()) }, _get_path: function () { var a = this.get_path(); if (!a || !a.length) a = Sys.Services._RoleService.DefaultWebServicePath; if (!a || !a.length) throw Error.invalidOperation(Sys.Res.servicePathNotSet); return a }, _get_rolesIndex: function () { if (!this._rolesIndex) { var b = {}; for (var a = 0; a < this._roles.length; a++) b[this._roles[a].toLowerCase()] = true; this._rolesIndex = b } return this._rolesIndex }, _onLoadComplete: function (a, c, f) { if (a && !(a instanceof Array)) throw Error.invalidOperation(String.format(Sys.Res.webServiceInvalidReturnType, f, "Array")); this._roles = a; this._rolesIndex = null; var b = c[0] || this.get_defaultLoadCompletedCallback() || this.get_defaultSucceededCallback(); if (b) { var e = c[2] || this.get_defaultUserContext(), d = Array.clone(a); b(d, e, "Sys.Services.RoleService.load") } }, _onLoadFailed: function (d, b) { var a = b[1] || this.get_defaultFailedCallback(); if (a) { var c = b[2] || this.get_defaultUserContext(); a(d, c, "Sys.Services.RoleService.load") } } }; Sys.Services._RoleService.registerClass("Sys.Services._RoleService", Sys.Net.WebServiceProxy); Sys.Services.RoleService = new Sys.Services._RoleService; Type.registerNamespace("Sys.Serialization"); Sys.Serialization.JavaScriptSerializer = function () { }; Sys.Serialization.JavaScriptSerializer.registerClass("Sys.Serialization.JavaScriptSerializer"); Sys.Serialization.JavaScriptSerializer._serverTypeFieldName = "__type"; Sys.Serialization.JavaScriptSerializer._stringRegEx = new RegExp('["\\b\\f\\n\\r\\t\\\\\\x00-\\x1F]', "i"); Sys.Serialization.JavaScriptSerializer._dateRegEx = new RegExp('(^|[^\\\\])\\"\\\\/Date\\((-?[0-9]+)(?:[a-zA-Z]|(?:\\+|-)[0-9]{4})?\\)\\\\/\\"', "g"); Sys.Serialization.JavaScriptSerializer._jsonRegEx = new RegExp("[^,:{}\\[\\]0-9.\\-+Eaeflnr-u \\n\\r\\t]", "g"); Sys.Serialization.JavaScriptSerializer._jsonStringRegEx = new RegExp('"(\\\\.|[^"\\\\])*"', "g"); Sys.Serialization.JavaScriptSerializer._serializeBooleanWithBuilder = function (b, a) { a.append(b.toString()) }; Sys.Serialization.JavaScriptSerializer._serializeNumberWithBuilder = function (a, b) { if (isFinite(a)) b.append(String(a)); else throw Error.invalidOperation(Sys.Res.cannotSerializeNonFiniteNumbers) }; Sys.Serialization.JavaScriptSerializer._serializeStringWithBuilder = function (c, a) { a.append('"'); if (Sys.Serialization.JavaScriptSerializer._stringRegEx.test(c)) { var d = c.length; for (i = 0; i < d; ++i) { var b = c.charAt(i); if (b >= " ") { if (b === "\\" || b === '"') a.append("\\"); a.append(b) } else switch (b) { case "\b": a.append("\\b"); break; case "\f": a.append("\\f"); break; case "\n": a.append("\\n"); break; case "\r": a.append("\\r"); break; case "\t": a.append("\\t"); break; default: a.append("\\u00"); if (b.charCodeAt() < 16) a.append("0"); a.append(b.charCodeAt().toString(16)) } } } else a.append(c); a.append('"') }; Sys.Serialization.JavaScriptSerializer._serializeWithBuilder = function (b, a, i, g) {
  var c; switch (typeof b) {
    case "object":
      if (b)
        if (b.isArray) { a.append("["); for (c = 0; c < b.length; ++c) { if (c > 0) a.append(","); Sys.Serialization.JavaScriptSerializer._serializeWithBuilder(b[c], a, false, g) } a.append("]") }
        else if (Boolean.isInstanceOfType(b)) Sys.Serialization.JavaScriptSerializer._serializeBooleanWithBuilder(b, a);
        else if (String.isInstanceOfType(b)) Sys.Serialization.JavaScriptSerializer._serializeStringWithBuilder(b, a);
        else
        { if (Date.isInstanceOfType(b)) { a.append('"\\/Date('); a.append(b.getTime()); a.append(')\\/"'); break } var d = [], f = 0; for (var e in b) { if (e.startsWith("$")) continue; if (e === Sys.Serialization.JavaScriptSerializer._serverTypeFieldName && f !== 0) { d[f++] = d[0]; d[0] = e } else d[f++] = e } if (i) d.sort(); a.append("{"); var j = false; for (c = 0; c < f; c++) { var h = b[d[c]]; if (typeof h !== "undefined" && typeof h !== "function") { if (j) a.append(","); else j = true; Sys.Serialization.JavaScriptSerializer._serializeWithBuilder(d[c], a, i, g); a.append(":"); Sys.Serialization.JavaScriptSerializer._serializeWithBuilder(h, a, i, g) } } a.append("}") } else a.append("null"); break; case "number": Sys.Serialization.JavaScriptSerializer._serializeNumberWithBuilder(b, a); break; case "string": Sys.Serialization.JavaScriptSerializer._serializeStringWithBuilder(b, a); break; case "boolean": Sys.Serialization.JavaScriptSerializer._serializeBooleanWithBuilder(b, a); break; default: a.append("null")
  }
}; Sys.Serialization.JavaScriptSerializer.serialize = function (b) { var a = new Sys.StringBuilder; Sys.Serialization.JavaScriptSerializer._serializeWithBuilder(b, a, false); return a.toString() }; Sys.Serialization.JavaScriptSerializer.deserialize = function (data, secure) { if (data.length === 0) throw Error.argument("data", Sys.Res.cannotDeserializeEmptyString); try { var exp = data.replace(Sys.Serialization.JavaScriptSerializer._dateRegEx, "$1new Date($2)"); if (secure && Sys.Serialization.JavaScriptSerializer._jsonRegEx.test(exp.replace(Sys.Serialization.JavaScriptSerializer._jsonStringRegEx, ""))) throw null; return eval("(" + exp + ")") } catch (a) { throw Error.argument("data", Sys.Res.cannotDeserializeInvalidJson) } }; Sys.CultureInfo = function (c, b, a) { this.name = c; this.numberFormat = b; this.dateTimeFormat = a }; Sys.CultureInfo.prototype = { _getDateTimeFormats: function () { if (!this._dateTimeFormats) { var a = this.dateTimeFormat; this._dateTimeFormats = [a.MonthDayPattern, a.YearMonthPattern, a.ShortDatePattern, a.ShortTimePattern, a.LongDatePattern, a.LongTimePattern, a.FullDateTimePattern, a.RFC1123Pattern, a.SortableDateTimePattern, a.UniversalSortableDateTimePattern] } return this._dateTimeFormats }, _getMonthIndex: function (a) { if (!this._upperMonths) this._upperMonths = this._toUpperArray(this.dateTimeFormat.MonthNames); return Array.indexOf(this._upperMonths, this._toUpper(a)) }, _getAbbrMonthIndex: function (a) { if (!this._upperAbbrMonths) this._upperAbbrMonths = this._toUpperArray(this.dateTimeFormat.AbbreviatedMonthNames); return Array.indexOf(this._upperAbbrMonths, this._toUpper(a)) }, _getDayIndex: function (a) { if (!this._upperDays) this._upperDays = this._toUpperArray(this.dateTimeFormat.DayNames); return Array.indexOf(this._upperDays, this._toUpper(a)) }, _getAbbrDayIndex: function (a) { if (!this._upperAbbrDays) this._upperAbbrDays = this._toUpperArray(this.dateTimeFormat.AbbreviatedDayNames); return Array.indexOf(this._upperAbbrDays, this._toUpper(a)) }, _toUpperArray: function (c) { var b = []; for (var a = 0, d = c.length; a < d; a++) b[a] = this._toUpper(c[a]); return b }, _toUpper: function (a) { return a.split("\u00a0").join(" ").toUpperCase() } }; Sys.CultureInfo._parse = function (b) { var a = Sys.Serialization.JavaScriptSerializer.deserialize(b); return new Sys.CultureInfo(a.name, a.numberFormat, a.dateTimeFormat) }; Sys.CultureInfo.registerClass("Sys.CultureInfo"); Sys.CultureInfo.InvariantCulture = Sys.CultureInfo._parse('{"name":"","numberFormat":{"CurrencyDecimalDigits":2,"CurrencyDecimalSeparator":".","IsReadOnly":true,"CurrencyGroupSizes":[3],"NumberGroupSizes":[3],"PercentGroupSizes":[3],"CurrencyGroupSeparator":",","CurrencySymbol":"\u00a4","NaNSymbol":"NaN","CurrencyNegativePattern":0,"NumberNegativePattern":1,"PercentPositivePattern":0,"PercentNegativePattern":0,"NegativeInfinitySymbol":"-Infinity","NegativeSign":"-","NumberDecimalDigits":2,"NumberDecimalSeparator":".","NumberGroupSeparator":",","CurrencyPositivePattern":0,"PositiveInfinitySymbol":"Infinity","PositiveSign":"+","PercentDecimalDigits":2,"PercentDecimalSeparator":".","PercentGroupSeparator":",","PercentSymbol":"%","PerMilleSymbol":"\u2030","NativeDigits":["0","1","2","3","4","5","6","7","8","9"],"DigitSubstitution":1},"dateTimeFormat":{"AMDesignator":"AM","Calendar":{"MinSupportedDateTime":"@-62135568000000@","MaxSupportedDateTime":"@253402300799999@","AlgorithmType":1,"CalendarType":1,"Eras":[1],"TwoDigitYearMax":2029,"IsReadOnly":true},"DateSeparator":"/","FirstDayOfWeek":0,"CalendarWeekRule":0,"FullDateTimePattern":"dddd, dd MMMM yyyy HH:mm:ss","LongDatePattern":"dddd, dd MMMM yyyy","LongTimePattern":"HH:mm:ss","MonthDayPattern":"MMMM dd","PMDesignator":"PM","RFC1123Pattern":"ddd, dd MMM yyyy HH\':\'mm\':\'ss \'GMT\'","ShortDatePattern":"MM/dd/yyyy","ShortTimePattern":"HH:mm","SortableDateTimePattern":"yyyy\'-\'MM\'-\'dd\'T\'HH\':\'mm\':\'ss","TimeSeparator":":","UniversalSortableDateTimePattern":"yyyy\'-\'MM\'-\'dd HH\':\'mm\':\'ss\'Z\'","YearMonthPattern":"yyyy MMMM","AbbreviatedDayNames":["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],"ShortestDayNames":["Su","Mo","Tu","We","Th","Fr","Sa"],"DayNames":["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],"AbbreviatedMonthNames":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",""],"MonthNames":["January","February","March","April","May","June","July","August","September","October","November","December",""],"IsReadOnly":true,"NativeCalendarName":"Gregorian Calendar","AbbreviatedMonthGenitiveNames":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",""],"MonthGenitiveNames":["January","February","March","April","May","June","July","August","September","October","November","December",""]}}'); if (typeof __cultureInfo === "undefined") var __cultureInfo = '{"name":"en-US","numberFormat":{"CurrencyDecimalDigits":2,"CurrencyDecimalSeparator":".","IsReadOnly":false,"CurrencyGroupSizes":[3],"NumberGroupSizes":[3],"PercentGroupSizes":[3],"CurrencyGroupSeparator":",","CurrencySymbol":"$","NaNSymbol":"NaN","CurrencyNegativePattern":0,"NumberNegativePattern":1,"PercentPositivePattern":0,"PercentNegativePattern":0,"NegativeInfinitySymbol":"-Infinity","NegativeSign":"-","NumberDecimalDigits":2,"NumberDecimalSeparator":".","NumberGroupSeparator":",","CurrencyPositivePattern":0,"PositiveInfinitySymbol":"Infinity","PositiveSign":"+","PercentDecimalDigits":2,"PercentDecimalSeparator":".","PercentGroupSeparator":",","PercentSymbol":"%","PerMilleSymbol":"\u2030","NativeDigits":["0","1","2","3","4","5","6","7","8","9"],"DigitSubstitution":1},"dateTimeFormat":{"AMDesignator":"AM","Calendar":{"MinSupportedDateTime":"@-62135568000000@","MaxSupportedDateTime":"@253402300799999@","AlgorithmType":1,"CalendarType":1,"Eras":[1],"TwoDigitYearMax":2029,"IsReadOnly":false},"DateSeparator":"/","FirstDayOfWeek":0,"CalendarWeekRule":0,"FullDateTimePattern":"dddd, MMMM dd, yyyy h:mm:ss tt","LongDatePattern":"dddd, MMMM dd, yyyy","LongTimePattern":"h:mm:ss tt","MonthDayPattern":"MMMM dd","PMDesignator":"PM","RFC1123Pattern":"ddd, dd MMM yyyy HH\':\'mm\':\'ss \'GMT\'","ShortDatePattern":"M/d/yyyy","ShortTimePattern":"h:mm tt","SortableDateTimePattern":"yyyy\'-\'MM\'-\'dd\'T\'HH\':\'mm\':\'ss","TimeSeparator":":","UniversalSortableDateTimePattern":"yyyy\'-\'MM\'-\'dd HH\':\'mm\':\'ss\'Z\'","YearMonthPattern":"MMMM, yyyy","AbbreviatedDayNames":["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],"ShortestDayNames":["Su","Mo","Tu","We","Th","Fr","Sa"],"DayNames":["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],"AbbreviatedMonthNames":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",""],"MonthNames":["January","February","March","April","May","June","July","August","September","October","November","December",""],"IsReadOnly":false,"NativeCalendarName":"Gregorian Calendar","AbbreviatedMonthGenitiveNames":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",""],"MonthGenitiveNames":["January","February","March","April","May","June","July","August","September","October","November","December",""]}}'; Sys.CultureInfo.CurrentCulture = Sys.CultureInfo._parse(__cultureInfo); delete __cultureInfo; Sys.UI.Behavior = function (b) { Sys.UI.Behavior.initializeBase(this); this._element = b; var a = b._behaviors; if (!a) b._behaviors = [this]; else a[a.length] = this }; Sys.UI.Behavior.prototype = { _name: null, get_element: function () { return this._element }, get_id: function () { var a = Sys.UI.Behavior.callBaseMethod(this, "get_id"); if (a) return a; if (!this._element || !this._element.id) return ""; return this._element.id + "$" + this.get_name() }, get_name: function () { if (this._name) return this._name; var a = Object.getTypeName(this), b = a.lastIndexOf("."); if (b != -1) a = a.substr(b + 1); if (!this.get_isInitialized()) this._name = a; return a }, set_name: function (a) { this._name = a }, initialize: function () { Sys.UI.Behavior.callBaseMethod(this, "initialize"); var a = this.get_name(); if (a) this._element[a] = this }, dispose: function () { Sys.UI.Behavior.callBaseMethod(this, "dispose"); if (this._element) { var a = this.get_name(); if (a) this._element[a] = null; Array.remove(this._element._behaviors, this); delete this._element } } }; Sys.UI.Behavior.registerClass("Sys.UI.Behavior", Sys.Component); Sys.UI.Behavior.getBehaviorByName = function (b, c) { var a = b[c]; return a && Sys.UI.Behavior.isInstanceOfType(a) ? a : null }; Sys.UI.Behavior.getBehaviors = function (a) { if (!a._behaviors) return []; return Array.clone(a._behaviors) }; Sys.UI.Behavior.getBehaviorsByType = function (d, e) { var a = d._behaviors, c = []; if (a) for (var b = 0, f = a.length; b < f; b++) if (e.isInstanceOfType(a[b])) c[c.length] = a[b]; return c }; Sys.UI.VisibilityMode = function () { throw Error.notImplemented() }; Sys.UI.VisibilityMode.prototype = { hide: 0, collapse: 1 }; Sys.UI.VisibilityMode.registerEnum("Sys.UI.VisibilityMode"); Sys.UI.Control = function (a) { Sys.UI.Control.initializeBase(this); this._element = a; a.control = this }; Sys.UI.Control.prototype = { _parent: null, _visibilityMode: Sys.UI.VisibilityMode.hide, get_element: function () { return this._element }, get_id: function () { if (!this._element) return ""; return this._element.id }, set_id: function () { throw Error.invalidOperation(Sys.Res.cantSetId) }, get_parent: function () { if (this._parent) return this._parent; if (!this._element) return null; var a = this._element.parentNode; while (a) { if (a.control) return a.control; a = a.parentNode } return null }, set_parent: function (a) { this._parent = a }, get_visibilityMode: function () { return Sys.UI.DomElement.getVisibilityMode(this._element) }, set_visibilityMode: function (a) { Sys.UI.DomElement.setVisibilityMode(this._element, a) }, get_visible: function () { return Sys.UI.DomElement.getVisible(this._element) }, set_visible: function (a) { Sys.UI.DomElement.setVisible(this._element, a) }, addCssClass: function (a) { Sys.UI.DomElement.addCssClass(this._element, a) }, dispose: function () { Sys.UI.Control.callBaseMethod(this, "dispose"); if (this._element) { this._element.control = undefined; delete this._element } if (this._parent) delete this._parent }, onBubbleEvent: function () { return false }, raiseBubbleEvent: function (b, c) { var a = this.get_parent(); while (a) { if (a.onBubbleEvent(b, c)) return; a = a.get_parent() } }, removeCssClass: function (a) { Sys.UI.DomElement.removeCssClass(this._element, a) }, toggleCssClass: function (a) { Sys.UI.DomElement.toggleCssClass(this._element, a) } }; Sys.UI.Control.registerClass("Sys.UI.Control", Sys.Component);
Type.registerNamespace('Sys'); Sys.Res = { 'argumentInteger': 'Value must be an integer.', 'scriptLoadMultipleCallbacks': 'The script \'{0}\' contains multiple calls to Sys.Application.notifyScriptLoaded(). Only one is allowed.', 'invokeCalledTwice': 'Cannot call invoke more than once.', 'webServiceFailed': 'The server method \'{0}\' failed with the following error: {1}', 'webServiceInvalidJsonWrapper': 'The server method \'{0}\' returned invalid data. The \'d\' property is missing from the JSON wrapper.', 'argumentType': 'Object cannot be converted to the required type.', 'argumentNull': 'Value cannot be null.', 'controlCantSetId': 'The id property can\'t be set on a control.', 'formatBadFormatSpecifier': 'Format specifier was invalid.', 'webServiceFailedNoMsg': 'The server method \'{0}\' failed.', 'argumentDomElement': 'Value must be a DOM element.', 'invalidExecutorType': 'Could not create a valid Sys.Net.WebRequestExecutor from: {0}.', 'cannotCallBeforeResponse': 'Cannot call {0} when responseAvailable is false.', 'actualValue': 'Actual value was {0}.', 'enumInvalidValue': '\'{0}\' is not a valid value for enum {1}.', 'scriptLoadFailed': 'The script \'{0}\' could not be loaded.', 'parameterCount': 'Parameter count mismatch.', 'cannotDeserializeEmptyString': 'Cannot deserialize empty string.', 'formatInvalidString': 'Input string was not in a correct format.', 'invalidTimeout': 'Value must be greater than or equal to zero.', 'cannotAbortBeforeStart': 'Cannot abort when executor has not started.', 'argument': 'Value does not fall within the expected range.', 'cannotDeserializeInvalidJson': 'Cannot deserialize. The data does not correspond to valid JSON.', 'invalidHttpVerb': 'httpVerb cannot be set to an empty or null string.', 'nullWebRequest': 'Cannot call executeRequest with a null webRequest.', 'eventHandlerInvalid': 'Handler was not added through the Sys.UI.DomEvent.addHandler method.', 'cannotSerializeNonFiniteNumbers': 'Cannot serialize non finite numbers.', 'argumentUndefined': 'Value cannot be undefined.', 'webServiceInvalidReturnType': 'The server method \'{0}\' returned an invalid type. Expected type: {1}', 'servicePathNotSet': 'The path to the web service has not been set.', 'argumentTypeWithTypes': 'Object of type \'{0}\' cannot be converted to type \'{1}\'.', 'cannotCallOnceStarted': 'Cannot call {0} once started.', 'badBaseUrl1': 'Base URL does not contain ://.', 'badBaseUrl2': 'Base URL does not contain another /.', 'badBaseUrl3': 'Cannot find last / in base URL.', 'setExecutorAfterActive': 'Cannot set executor after it has become active.', 'paramName': 'Parameter name: {0}', 'cannotCallOutsideHandler': 'Cannot call {0} outside of a completed event handler.', 'cannotSerializeObjectWithCycle': 'Cannot serialize object with cyclic reference within child properties.', 'format': 'One of the identified items was in an invalid format.', 'assertFailedCaller': 'Assertion Failed: {0}\r\nat {1}', 'argumentOutOfRange': 'Specified argument was out of the range of valid values.', 'webServiceTimedOut': 'The server method \'{0}\' timed out.', 'notImplemented': 'The method or operation is not implemented.', 'assertFailed': 'Assertion Failed: {0}', 'invalidOperation': 'Operation is not valid due to the current state of the object.', 'breakIntoDebugger': '{0}\r\n\r\nBreak into debugger?' };
if (typeof (Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();

///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\lm\LMSys.js
//http://github.com/emwendelin/javascript-stacktrace
function printStackTrace(options) {
  var ex = (options && options.e) ? options.e : null;
  var guess = (options && options.guess) ? options.guess : true;

  var p = new printStackTrace.implementation();
  var result = p.run(ex);
  return (guess) ? p.guessFunctions(result) : result;
}

printStackTrace.implementation = function () { };

printStackTrace.implementation.prototype = {
  run: function (ex) {
    // Use either the stored mode, or resolve it
    var mode = this._mode || this.mode();
    if (mode === 'other') {
      return this.other(arguments.callee);
    }
    else {
      ex = ex ||
          (function () {
            try {
              (0)();
            } catch (e) {
              return e;
            }
          })();
      return this[mode](ex);
    }
  },

  mode: function () {
    try {
      (0)();
    } catch (e) {
      if (e.arguments) {
        return (this._mode = 'chrome');
      } else if (e.stack) {
        return (this._mode = 'firefox');
      } else if (window.opera && !('stacktrace' in e)) { //Opera 9-
        return (this._mode = 'opera');
      }
    }
    return (this._mode = 'other');
  },

  chrome: function (e) {
    return e.stack.replace(/^.*?\n/, '').
            replace(/^.*?\n/, '').
            replace(/^.*?\n/, '').
            replace(/^[^\(]+?[\n$]/gm, '').
            replace(/^\s+at\s+/gm, '').
            replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@').
            split("\n");
  },

  firefox: function (e) {
    return e.stack.replace(/^.*?\n/, '').
            replace(/(?:\n@:0)?\s+$/m, '').
            replace(/^\(/gm, '{anonymous}(').
            split("\n");
  },

  // Opera 7.x and 8.x only!
  opera: function (e) {
    var lines = e.message.split("\n"), ANON = '{anonymous}',
        lineRE = /Line\s+(\d+).*?script\s+(http\S+)(?:.*?in\s+function\s+(\S+))?/i, i, j, len;

    for (i = 4, j = 0, len = lines.length; i < len; i += 2) {
      if (lineRE.test(lines[i])) {
        lines[j++] = (RegExp.$3 ? RegExp.$3 + '()@' + RegExp.$2 + RegExp.$1 : ANON + '()@' + RegExp.$2 + ':' + RegExp.$1) +
        ' -- ' +
        lines[i + 1].replace(/^\s+/, '');
      }
    }

    lines.splice(j, lines.length - j);
    return lines;
  },

  // Safari, Opera 9+, IE, and others
  other: function (curr) {
    var ANON = "{anonymous}", fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], j = 0, fn, args;

    var maxStackSize = 10;
    while (curr && stack.length < maxStackSize) {
      fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
      args = Array.prototype.slice.call(curr['arguments']);
      stack[j++] = fn + '(' + printStackTrace.implementation.prototype.stringifyArguments(args) + ')';

      //Opera bug: if curr.caller does not exist, Opera returns curr (WTF)
      if (curr === curr.caller && window.opera) {
        //TODO: check for same arguments if possible
        break;
      }
      curr = curr.caller;
    }
    return stack;
  },

  stringifyArguments: function (args) {
    for (var i = 0; i < args.length; ++i) {
      var argument = args[i];
      if (typeof argument == 'object') {
        args[i] = '#object';
      } else if (typeof argument == 'function') {
        args[i] = '#function';
      } else if (typeof argument == 'string') {
        args[i] = '"' + argument + '"';
      }
    }
    return args.join(',');
  },

  sourceCache: {},

  ajax: function (url) {
    var req = this.createXMLHTTPObject();
    if (!req) {
      return;
    }
    req.open('GET', url, false);
    req.setRequestHeader("User-Agent", "XMLHTTP/1.0");
    req.send('');
    return req.responseText;
  },

  createXMLHTTPObject: function () {
    // Try XHR methods in order and store XHR factory
    var xmlhttp, XMLHttpFactories = [
        function () {
          return new XMLHttpRequest();
        }, function () {
          return new ActiveXObject("Msxml2.XMLHTTP");
        }, function () {
          return new ActiveXObject("Msxml3.XMLHTTP");
        }, function () {
          return new ActiveXObject("Microsoft.XMLHTTP");
        }
    ];
    for (var i = 0; i < XMLHttpFactories.length; i++) {
      try {
        xmlhttp = XMLHttpFactories[i]();
        // Use memoization to cache the factory
        this.createXMLHTTPObject = XMLHttpFactories[i];
        return xmlhttp;
      } catch (e) { }
    }
  },

  getSource: function (url) {
    if (!(url in this.sourceCache)) {
      this.sourceCache[url] = this.ajax(url).split("\n");
    }
    return this.sourceCache[url];
  },

  guessFunctions: function (stack) {
    for (var i = 0; i < stack.length; ++i) {
      var reStack = /{anonymous}\(.*\)@(\w+:\/\/([-\w\.]+)+(:\d+)?[^:]+):(\d+):?(\d+)?/;
      var frame = stack[i], m = reStack.exec(frame);
      if (m) {
        var file = m[1], lineno = m[4]; //m[7] is character position in Chrome
        if (file && lineno) {
          var functionName = this.guessFunctionName(file, lineno);
          stack[i] = frame.replace('{anonymous}', functionName);
        }
      }
    }
    return stack;
  },

  guessFunctionName: function (url, lineNo) {
    try {
      return this.guessFunctionNameFromLines(lineNo, this.getSource(url));
    } catch (e) {
      return 'getSource failed with url: ' + url + ', exception: ' + e.toString();
    }
  },

  guessFunctionNameFromLines: function (lineNo, source) {
    var reFunctionArgNames = /function ([^(]*)\(([^)]*)\)/;
    var reGuessFunction = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(function|eval|new Function)/;
    // Walk backwards from the first line in the function until we find the line which
    // matches the pattern above, which is the function definition
    var line = "", maxLines = 10;
    for (var i = 0; i < maxLines; ++i) {
      line = source[lineNo - i] + line;
      if (line !== undefined) {
        var m = reGuessFunction.exec(line);
        if (m) {
          return m[1];
        }
        else {
          m = reFunctionArgNames.exec(line);
        }
        if (m && m[1]) {
          return m[1];
        }
      }
    }
    return "(?)";
  }
};


Type.registerNamespace('S4N.Sys');
Type.registerNamespace('S4N');

S4N.Sys.IsEmpty = function (obj, ignoreEmptyString) {
  if (typeof (ignoreEmptyString) == 'undefined') ignoreEmptyString = false;
  var tp = typeof (obj);
  return (tp == 'undefined' || obj == null || (tp == 'string' && !ignoreEmptyString && obj == ''));
};
var $isEmpty = S4N.Sys.IsEmpty;

//API promenne, dosazovane v LmComAPI.js
var ScormAPI = null; //klasicke SCORM API
var ScormIsPopup = false; //otevreni v SCORM popup okne
var ScormAPIEx = null; //S4N.Api_lmcom: rozsirene SCORM API (o funkce LMSInitializeEx, LMSCommitEx, setData, ...)
var RunApiSCORM = null; //SCORM objekt (MAC nebo Delphi) pro S4N.Engine_NewEE
var RunApiExplorer = null; //Tlacitka exploreru (MAC nebo Delphi) pro LogoBar.js
var RunLicence = null; //Licence objekt pro Run.exe (Delphi)
var Json_Rpc = null; // JSON RPC server pro S4N.Engine_lmcom
var RewiseAPI = null; //REWISE API
var LicencePlayer = { checkLicence: function () { return true; } };   //Licence a Sound player. V DictConnector.js je dostupna Silverlight verze v podobe SPlayer

var dt_mili = 1000;
var dt_sec = dt_mili * 60;
var dt_min = dt_sec * 60;
var dt_hour = dt_min * 60;
var dt_day = dt_hour * 24;

function logHandle() {
  if ($isEmpty(S4N.config) || S4N.config.lmsType != S4N.LMSType.NewEE) return null;
  var res = null;
  if (navigator.userAgent.indexOf('Macintosh') > -1) {
    res = window.LMComOfflineMac;
    if ($isEmpty(res) && (window.parent != null)) res = window.parent.LMComOfflineMac;
    if (typeof (res.Log) != 'undefined') return res;
  } else {
    res = window.external;
    if (typeof (res) != 'undefined' /*PZ kvuli Vista, 21.9.07 && typeof(res.Log)!='undefined'*/) return res;
  }
  return null;
};

var Debug;
(function (Debug) {
  function $trace(id, txt) {
    var handle = logHandle();
    try {
      if (handle) handle.Log(4, id, txt);
      else Sys.Debug.trace(id.toString() + '|' + txt);
    } catch (e) { }
  }
  Debug.$trace = $trace;
})(Debug || (Debug = {}));

var $assert = function (condition, message) {
  //uprava pro itutor; default zakomentované
  //return;
  if (condition) return;
  var handle = logHandle();
  try {
    if (handle) handle.Log(0, 0, message);
    else Sys.Debug.assert(condition, message);
  } catch (e) { }
};

jsError = function (msg, url, l) {
  var stack = printStackTrace().join('\n\n');
  $assert(false, 'ERROR ' + msg + ', url=' + url + ', line=' + l + ", stack=" + stack);
};

Hack = function () { return typeof (EA) != 'undefined'; }

//window.onerror = jsError;

S4N.Trace = function () { throw Error.notImplemented(); };
S4N.Trace.prototype = {
  no: 0,
  Eval: 1,
  Sound: 2,
  ScormServer: 3,
  ScormClient: 4,
  Registration: 5
};
S4N.Trace.registerEnum('S4N.Trace');

/*********** EVENT ARG ***********/
S4N.BoolArg = function (value) {
  S4N.BoolArg.initializeBase(this);
  this.value = value;
};
S4N.BoolArg.registerClass('S4N.BoolArg', Sys.EventArgs);

/*********** ENUM ScorePart ***********/
S4N.ScorePart = function () {
  throw Error.notImplemented();
};
S4N.ScorePart.prototype = {
  Correct: 0,
  From: 1
};
S4N.ScorePart.registerEnum('S4N.ScorePart');

/*********** ENUM ExerciseStatus ***********/
//Unknown..neznamy, Empty..prazdne kontrolky, Normal..data v kontrolkach, Preview..preview, Evaluated..po vyhodnoceni
S4N.ExerciseStatus = function () {
  throw Error.notImplemented();
};
S4N.ExerciseStatus.prototype = {
  Unknown: 0,
  Normal: 1,
  Preview: 2,
  Evaluated: 3,
  //pro modul
  notAttempted: 4,
  removed: 5
};
S4N.ExerciseStatus.registerEnum('S4N.ExerciseStatus');

/*********** ENUM LMSType ***********/
S4N.LMSType = function () { throw Error.notImplemented(); };
S4N.LMSType.prototype = {
  no: 0,
  NewEE: 1,
  EE: 2,
  LMCom: 3,
  Moodle: 4,
  SlNewEE: 5 //SLEA
  //MacPC:5
};
S4N.LMSType.registerEnum('S4N.LMSType');

/*********** ENUM RunExeType from Q:\LMComPas\LMComOffline\Utils.pas ***********/
S4N.RunExeType = function () { throw Error.notImplemented(); };
S4N.RunExeType.prototype = {
  no: 0,
  cdrom: 1,
  download: 2
};
S4N.RunExeType.registerEnum('S4N.RunExeType');

/*********** ENUM Courses ***********/
S4N.CourseIds = function () { throw Error.notImplemented(); };
S4N.CourseIds.prototype = {
  no: 0,
  English: 1,
  German: 2,
  Spanish: 3,
  Italian: 4,
  French: 5,
  Chinese: 6,
  Russian: 7,
  KurzTest: 8,
  Vyspa1: 9,
  Vyspa2: 10,
  Vyspa3: 11,
  Vyspa4: 12,
  Vyspa5: 13,
  Vyspa6: 14,
  Vyspa7: 15,
  Vyspa8: 16,
  Vyspa9: 17,
  Vyspa10: 18,
  Vyspa11: 19,
  Vyspa12: 20,
  Vyspa13: 21,
  Vyspa: 22, //pro ProductID
  NNOUcto: 23,
  ZSAJ61: 24,
  ZSAJ71: 25,
  ZSAJ81: 26,
  ZSAJ91: 27,
  ZSNJ61: 28,
  ZSNJ71: 29,
  ZSNJ81: 30,
  ZSNJ91: 31,
  ZSAJ62: 32,
  ZSAJ72: 33,
  ZSAJ82: 34,
  ZSAJ92: 35,
  ZSNJ62: 36,
  ZSNJ72: 37,
  ZSNJ82: 38,
  ZSNJ92: 39,
  MVAJtesty: 40,
  MVSPtesty: 41,
  MVFRtesty: 42,
  MVRJtesty: 43,
  MVtesty: 44,
  EuroEnglish: 45,
  RewiseEnglish: 46,
  RewiseGerman: 47,
  RewiseSpanish: 48,
  RewiseItalian: 49,
  RewiseFrench: 50,
  RewiseChinese: 51,
  RewiseRussian: 52,
  Holiday_English: 53,
  ZSAj: 54,
  ZSNj: 55,
  Ucto1: 56,
  Ucto2: 57,
  Ucto3: 58,
  UctoAll: 59,
  SurvEnglish: 60,
  SurvGerman: 61,
  SurvSpanish: 62,
  SurvFrench: 63,
  SurvItalian: 64,
  Ptas: 65,
  Esd: 66,
  Usschpor: 67,
  Ustelef: 68,
  Usprez: 69,
  Usobchjed: 70,
  EnglishBerlitz: 71,
  GermanBerlitz: 72,
  SpanishBerlitz: 73,
  ItalianBerlitz: 74,
  FrenchBerlitz: 75,
  ChineseBerlitz: 76,
  RussianBerlitz: 77,
  AholdDemoAnim: 78,
  AholdDemoVideo: 79,

  EnglishE: 82,

  VNEng3: 101,
  VNEng4: 102,
  VNEng5: 103,
  VNEng6: 104,
  VNEng7: 105,
  VNEng8: 106,
  VNEng9: 107,
  VNEng10: 108,
  VNEng11: 109,
  VNEng12: 110

};
S4N.CourseIds.registerEnum('S4N.CourseIds');

/*********** EVENT ARG  AcceptDataArgs ***********/
S4N.AcceptDataArgs = function (exSt, data) {
  S4N.AcceptDataArgs.initializeBase(this);
  this.exerciseStatus = exSt;
  this.data = data;
};
S4N.AcceptDataArgs.registerClass('S4N.AcceptDataArgs', Sys.EventArgs);

/*********** CreateScore ***********/
S4N.CreateScore = function (correct, from) {
  var res = [];
  res[S4N.ScorePart.Correct] = correct;
  res[S4N.ScorePart.From] = from;
  return res;
};

$headerFrame = function () {
  if (window.name == 's4n_header') return window;
  else if (window.name == 's4n_content') return _findFrame('s4n_header', window.parent);
  else return _findFrame('s4n_header', window.top);
};

$lmsModule = function () {
  var top = $headerFrame();
  return $isEmpty(top) ? null : top.scormModule;
};

$ScormAPIEx = function () {
  var top = $headerFrame();
  return $isEmpty(top) ? null : top.ScormAPIEx;
};

$LMSGetValue = function (par) {
  try {
    if (!$ScormAPIEx) return null;
    var api = $ScormAPIEx(); if (api == null) return null;
    if (!api.LMSGetValue) return null;
    return api.LMSGetValue(par);
  } catch (msg) { return null; }
}

$contentFrame = function () {
  if (window.name == 's4n_content') return window;
  else if (window.name == 's4n_header') return _findFrame('s4n_content', window.parent);
  return _findFrame('s4n_content', window.top);
};

_findFrame = function (name, root) {
  try {
    if (root.name == name) return root;
  } catch (err) {
    return null;
  }
  for (var i = 0; i < root.frames.length; i++) {
    res = _findFrame(name, root.frames[i]);
    if (res != null) return res;
  }
  return null;
};

$JSONToId = function (spaceId, globalId) {
  var res = globalId.toLowerCase();
  res = res.replace(/(\_)/g, '_u').replace(/(\.)/g, '_d').replace(/(\/)/g, '_s').replace(/(\-)/g, '_c');
  return spaceId.toLowerCase().replace(/(\-)/g, '_c') + '_x' + res;
};

$JSONFromId = function (id) {
  var idx = id.indexOf('_x');
  var sp = id.substring(0, idx).replace(/(_c)/g, '-');
  var gl = id.substring(idx + 2, id.length);
  gl = gl.replace(/(_s)/g, '/').replace(/(_d)/g, '.').replace(/(_u)/g, '_').replace(/(_c)/g, '-');
  var res = {};
  res.spaceId = sp; res.globalId = gl;
  return res;
};

$innerText = function (el) {
  return document.all ? el.innerText : el.textContent;
};

/*********** UTILS ***********/
S4N.Sys.getAbsoluteUrl = function (fileUrl) {
  //S4N.Sys.getAbsoluteUrl = function (selfGlobalId, spaceId, globalId) {
  //var basicPath;
  //if (Hack()) {
  //basicPath = EA.DataPath();
  //} else {
  //if (appRoot == null) {
  //  var url = decodeURI(location.href.toLowerCase());
  //  url = url.substr(0, url.length - location.search.length - location.hash.length - selfGlobalId.length - 1);
  //  var idx = url.lastIndexOf('/');
  //  appRoot = url.substr(0, idx + 1);
  //}
  //basicPath = urlBasicPath;
  //}
  //var res = basicPath + spaceId + '/' + globalId;
  return Pager.basicUrl + fileUrl; // res.toLowerCase();
};
//var appRoot = null;

S4N.Sys.DocumentAll = function () {
  var res = [];
  var nodeQueue = [document.body];
  var childNodes = this.childNodes;
  var node;
  var c;

  while (nodeQueue.length) {
    node = Array.dequeue(nodeQueue);
    Array.add(res, node);
    childNodes = node.childNodes;
    if (childNodes.length != 0) {
      for (c = 0; c < childNodes.length; c++) {
        node = childNodes[c];
        if (node.nodeType == 1) {
          Array.enqueue(nodeQueue, node);
        }
      }
    }
  }

  return res;
};

S4N.Sys.textFromHtml = function (txt) {
  if (txt.indexOf('<') < 0) return txt;
  var sb = new Sys.StringBuilder();
  var st = 0;
  for (var i = 0; i < txt.length; i++) {
    if (st == 0) {
      if (txt.charAt(i) == '<') { st = 1; continue; }
      sb.append(txt.charAt(i));
    } else {
      if (txt.charAt(i) == '>') st = 0;
    }
  }
  return sb.toString();
};

S4N.Sys.setCssStatus = function (el) {
  if (el == null) return;
  for (var i = 1; i + 1 < arguments.length; i += 2) {
    if (arguments[i]) Sys.UI.DomElement.addCssClass(el, arguments[i + 1]);
    else Sys.UI.DomElement.removeCssClass(el, arguments[i + 1]);
  }
};

S4N.Sys.setDisplayId = function (elName, value) {
  S4N.Sys.setDisplay($get(elName), value);
};

S4N.Sys.setDisplay = function (el, value) {
  var displayCls = (el.tagName == 'span' ? 'displayInline' : 'displayBlock');
  if (value) {
    Sys.UI.DomElement.removeCssClass(el, 'displayNone');
    Sys.UI.DomElement.addCssClass(el, displayCls);
  } else {
    Sys.UI.DomElement.removeCssClass(el, displayCls);
    Sys.UI.DomElement.addCssClass(el, 'displayNone');
  }
};

S4N.Sys.createActiveXObject = function (id) {
  var error; var control = null;
  try {
    if (window.ActiveXObject) {
      control = new ActiveXObject(id);
    } else if (window.GeckoActiveXObject) {
      control = new GeckoActiveXObject(id);
    }
  }
  catch (error) {; }
  return control;
};

/*S4N.Sys.getActiveX = function (id) {
if (Sys.Browser.agent == Sys.Browser.InternetExplorer) return window[id];
if (Sys.Browser.agent == Sys.Browser.Safari) return document[id+'-embed'];
return document.getElementById(id+'-embed');
};

S4N.body = function () { document.getElementsByTagName("body")[0]; };
*/
S4N.Sys.addHandler = function (element, eventName, handler) {
  if (element.addEventListener)
    element.addEventListener(eventName, handler, false);
  else if (element.attachEvent)
    element.attachEvent(eventName, handler);
};

S4N.Sys.addHandlers = function (element, events, handlerOwner) {
  for (var name in events) {
    var handler = events[name];
    if (typeof (handler) !== 'function') throw Error.invalidOperation(Sys.Res.cantAddNonFunctionhandler);
    if (handlerOwner)
      handler = Function.createDelegate(handlerOwner, handler);
    S4N.Sys.addHandler(element, name, handler);
  }
};

/*S4N.DebugEmpty = function () {};
S4N.DebugEmpty.prototype = {
assert : function() { },
clearTrace : function() { },
trace : function() { },
traceDump : function() { },
fail : function() {}
};
S4N.DebugEmpty.registerClass('S4N.DebugEmpty', null);*/

var $serialize = function (obj) {
  return $isEmpty(obj) ? '' : Sys.Serialization.JavaScriptSerializer.serialize(obj);
};
var $deserialize = function (str) {
  return $isEmpty(str) ? null : Sys.Serialization.JavaScriptSerializer.deserialize(str);
};

S4N.Percent = function (score, max) {
  if (max <= 0) return -1;
  return parseInt(score / max * 100);
};

S4N.Querystring = function (qs) { // optionally pass a querystring to parse
  this.params = {};
  this.get = function (key, default_) {
    if (default_ == null) default_ = null;
    var value = this.params[key];
    return value == null ? default_ : value;
  };

  if (qs == null)
    qs = location.search.substring(1, location.search.length);
  if (qs.length == 0) return;
  qs = qs.replace(/\+/g, ' '); // Turn <plus> back to <space>
  var args = qs.split('&'); // parse out name/value pairs separated via &
  for (var i = 0; i < args.length; i++) {
    var pair = args[i].split('=');
    var name = unescape(pair[0]);
    var value = pair.length == 2 ? unescape(pair[1]) : name;
    this.params[name] = value;
  }
};

S4N.Querystring._instance = null;

S4N.Querystring.instance = function () {
  if (S4N.Querystring._instance == null) S4N.Querystring._instance = new S4N.Querystring();
  return S4N.Querystring._instance;
};

$getEx = function (ctrl, ext, ignoreNull) { //ignoreNull je difotne false
  var id = Sys.UI.Behavior.isInstanceOfType(ctrl) ? ctrl._element.id : ctrl.get_id();
  id += '_' + ext;
  var res = $get(id);
  if (typeof (ignoreNull) == 'undefined' || !ignoreNull) {
    $assert(res != null, '$getEx: ' + id);
  }
  return res;
};


Array.prototype.isArray = true;

/*
//based on http://devedge-temp.mozilla.org/viewsource/2003/windows-media-in-netscape/first-detection.js.txt
S4N.Sys.DetectMediaPlayer = function () {
var wmp64 = "MediaPlayer.MediaPlayer.1"; var wmp7 = "WMPlayer.OCX.7";
if((window.ActiveXObject && navigator.userAgent.indexOf('Windows') != -1) || window.GeckoActiveXObject)	{
var control = S4N.Sys.createActiveXObject(wmp7);
if (control) {
Debug.$trace( S4N.Trace.no, 'S4N.SoundPlayer.detect: MediaPlayer 7');
return S4N.SoundDriver.MediaPlayer; 
}
control = S4N.Sys.createActiveXObject(wmp64);
if (control) { 
Debug.$trace(S4N.Trace.no, 'S4N.SoundPlayer.detect: MediaPlayer 6.4');
return S4N.SoundDriver.MediaPlayer6;
}
}
return S4N.SoundDriver.prototype.no;
Debug.$trace(S4N.Trace.no, 'S4N.SoundPlayer.detect: MediaPlayer no');
};

S4N.Sys.DetectFlashPlayer = function () {
//if (DetectFlashVer (7,0,0)) return S4N.SoundDriver.prototype.FlashPlayer;
if (deconcept.SWFObjectUtil.getPlayerVersion().major>=7) return S4N.SoundDriver.prototype.FlashPlayer;
return S4N.SoundDriver.prototype.no;
};
*/

S4N.Config = function () {
  S4N.Config.initializeBase(this);
  S4N.config = this;
  this.courseId = S4N.CourseIds.no;
  this.productId = S4N.CourseIds.no;
  this.lmsType = S4N.LMSType.no;
  this.basicPath = '';
  this.site = '';
  this.regLimitedFree = false;
};
S4N.Config.prototype = {
  relUrl: function (spaceId, globalId) {
    var res = this.basicPath + spaceId + '/' + globalId;
    res = res.replace(/(berlitz)/g, '')
    return res;
  },
  navigate: function (frame, spaceId, globalId) {
    if (!frame) return;
    frame.location.href = this.relUrl(spaceId, globalId);
  },
  navigateCrs: function (frame, crsId, globalId) {
    if ($isEmpty(crsId) || crsId == S4N.CourseIds.no) crsId = this.courseId;
    var si = S4N.CourseIds.toString(crsId).toLowerCase().replace(/(_)/g, '-');
    this.navigate(frame, si, globalId);
  },
  get_CourseId: function (crsId) {
    return $isEmpty(crsId) || crsId == S4N.CourseIds.no ? this.courseId : crsId;
  },
  testUrl: function (url) {
    return this.basicPath + this.testSpaceId() + '/' + url;
  },
  testSpaceId: function () {
    return S4N.CourseIds.toString(this.courseId).replace('Berlitz', '') + 'Test';
  },
  courseUrl: function (url) {
    return this.basicPath + S4N.CourseIds.toString(this.courseId).replace('Berlitz', '') + '/' + url;
  }

};
S4N.Config.registerClass('S4N.Config', Sys.Component);

$config = function () { return S4N.config; };

Sys.UI.DomElement.getCurrentStyle = function Sys$UI$DomElement$_getCurrentStyle(element) {
  var w = (element.ownerDocument ? element.ownerDocument : element.documentElement).defaultView;
  return ((w && (element !== w) && w.getComputedStyle) ? w.getComputedStyle(element, null) : element.currentStyle);
};

var $adjustAPI = function () { };

//rxLocComment = new RegExp("\\(\\*.*?\\*\\)", "g");

//function CSLocalize(id, def) {
//  if (id == null || tradosData==null || typeof(tradosData) == 'undefined') return def.replace(rxLocComment, '');
//  var res = tradosData[id];
//  if (typeof (res) == 'undefined') return def.replace(rxLocComment, '');
//  return res;
//};
/*
var src = ".The rain in Spain falls mainly in the plain";
var re = new RegExp("\\w+", "g");
var res = regExpParse(re, src);
for (var i = 0; i < res.length; i++)
alert((res[i].match ? 'YES "' : 'NO "') + res[i].value + '"');
*/
function regExpParse(regEx, src) {
  var res = [];
  if (src == null || src.length == 0) return res;
  var index = 0;
  var match;
  while ((match = regEx.exec(src)) !== null) {
    if (index < match.index)
      Array.add(res, { match: false, value: src.slice(index, match.index) });
    Array.add(res, { match: true, value: src.slice(match.index, regEx.lastIndex) });
    index = regEx.lastIndex;
  }
  if (index < src.length)
    Array.add(res, { match: false, value: src.slice(index, value.length) });
  return res;
};

///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\lm\LMCommon.js
Type.registerNamespace('S4N');

/*********** INTERFACE IScoreProvider ***********/
S4N.IScoreProvider = function () { throw Error.notImplemented(); };
S4N.IScoreProvider.prototype = {
  provideData: function (data) { throw Error.notImplemented(); },
  acceptData: function (exSt, data) { throw Error.notImplemented(); },
  resetData: function (data) { throw Error.notImplemented(); },
  get_score: function () { throw Error.notImplemented(); }
};
S4N.IScoreProvider.registerInterface("S4N.IScoreProvider");


/*********** ENUM EvalType ***********/
S4N.EvalType = function () { throw Error.notImplemented(); };
S4N.EvalType.prototype = {
  Or: 0,
  And: 1
};
S4N.EvalType.registerEnum('S4N.EvalType');

/*********** COMPONENT EvalGroup ***********/
S4N.EvalGroup = function () {
  S4N.EvalGroup.initializeBase(this);

  this.scoreProviders = [];
  this.spText = null;
  this.evalType = S4N.EvalType.Or;
  this.exerciseStatus = S4N.ExerciseStatus.Unknown;
  this.evalGroup = null;
  this.example = false;
};
S4N.EvalGroup.prototype = {

  initialize: function () {
    S4N.EvalGroup.callBaseMethod(this, 'initialize');
    if (this.spText != null)
      for (var i = 0; i < this.spText.length; i++) {
        var prov = $find(this.spText[i]); prov.evalGroup = this;
        Array.add(this.scoreProviders, prov);
      }
  },

  set_scoreProviders: function (value) { this.spText = value; },
  get_scoreProviders: function () { return this.scoreProviders; },
  set_evalType: function (value) { this.evalType = S4N.EvalType.parse(value, true); },
  get_evalType: function () { return this.evalType; },
  set_evalGroup: function (value) { this.evalGroup = value; },
  get_evalGroup: function () { return this.evalGroup; },

  addScoreProvider: function (provider) {
    $assert(S4N.IScoreProvider.isImplementedBy(provider));
    Array.add(this.scoreProviders, provider);
  },

  //--------- S4N.IScoreProvider
  provideData: function (data) {
    for (var i = 0; i < this.scoreProviders.length; i++) {
      this.scoreProviders[i].provideData(data);
    }
  },

  acceptData: function (exSt, data) {
    if (this.exerciseStatus == exSt) return;
    for (var i = 0; i < this.scoreProviders.length; i++)
      this.scoreProviders[i].acceptData(exSt, data);
    this.exerciseStatus = exSt;
    this.raisePropertyChanged('exerciseStatus');
    //if (_myEvalGroupControl!=null) //obsolete
    //_myEvalGroupControl.onChangeExerciseStatus();
  },

  resetData: function (data) {
    for (var i = 0; i < this.scoreProviders.length; i++) {
      this.scoreProviders[i].resetData(data);
    }
  },

  get_score: function () {
    if (this.example || this.scoreProviders.length == 0) return null;
    var resFrom = 0; var resCorrect = 0;
    if (this.evalType == S4N.EvalType.Or) {
      for (var i = 0; i < this.scoreProviders.length; i++) {
        var sc = this.scoreProviders[i].get_score();
        if (sc == null) continue;
        resFrom += sc[S4N.ScorePart.From];
        resCorrect += sc[S4N.ScorePart.Correct];
      }
    } else if (this.evalType == S4N.EvalType.And) {
      var ok = true;
      for (var i = 0; i < this.scoreProviders.length; i++) {
        var sc = this.scoreProviders[i].get_score();
        if (sc == null) continue;
        if (sc == null || sc[S4N.ScorePart.Correct] < sc[S4N.ScorePart.From]) {
          ok = false;
          break;
        }
      }
      resFrom = 1;
      resCorrect = ok ? 1 : 0;
    }
    return S4N.CreateScore(resCorrect, resFrom);
  }
};
S4N.EvalGroup.registerClass('S4N.EvalGroup', Sys.Component, S4N.IScoreProvider);

/*********** CONTROL Control ***********/
S4N.Control = function (element) {
  S4N.Control.initializeBase(this, [element]);

  this.exerciseStatus = S4N.ExerciseStatus.Unknown;
  this.evalGroup = null;
};
S4N.Control.prototype = {

  get_score: function () { return S4N.CreateScore(this.isCorrect() ? 1 : 0, 1); },

  get_control: function (id, ignoreNull) { return $getEx(this, id, ignoreNull); },

  acceptData: function (exSt, data) {
    if (this.exerciseStatus == exSt) return;
    this.exerciseStatus = exSt;
    this.doAcceptData(exSt, data);
  },

  isCorrect: function () { return false; },

  doAcceptData: function (exSt, data) { }

};

S4N.Control.registerClass('S4N.Control', Sys.UI.Control, S4N.IScoreProvider);

/*********** persisentni data k jedne strance ***********/
S4N.ModulePageData = function () {
  this.i = -1; //index
  this.ms = 0; //score, 0 pro nevyhodnotitelne cviceni
  this.s = 0; //score
  //this.st = 0; //datum prvniho vstupu do stranky
  //this.et = 0; //datum posledniho vstupu do stranky
  //this.t = 0; //celkovy ztraveny cas na strance
  this.st = S4N.ExerciseStatus.Normal; //stav cviceni
  // dalsi properties pro kazdou z kontrolek
};

/*********** persisentni data k modulu ***********/
S4N.ModuleData = function () {
  this.st = S4N.ExerciseStatus.Normal;
  //this.actPage = 0; //index aktualni stranky
  this.ms = 0; //maximalni score
  this.s = 0; //score
  this.bt = 0; //datum prvniho vstupu do modulu
  this.et = 0; //datum posledniho vstupu do modulu
  this.t = 0; //celkovy ztraveny cas s modulem
  this.pages = []; //array of S4N.ModulePageData, persistence jednotlivych stranek
};

/*********** COMPONENT _Page ***********/
S4N.Page = function () {
  S4N.Page.initializeBase(this);

  this.spaceId = null;
  this.globalId = null;
  this.title = ''; //Titulek stranky

  this.exerciseStatus = S4N.ExerciseStatus.Normal;
  this.module = null; //S4N.Module objekt
  this.data = null; //S4N.ModulePageData. persistentni data stranky. data.i=-1 iff stranka neni v IFrame nebo neni v modulu

};

S4N.Page.prototype = {

  initialize: function () {
    S4N.Page.callBaseMethod(this, 'initialize');
    Sys.Application.add_load(Function.createDelegate(this, this.onLoad));
    Sys.Application.add_unload(Function.createDelegate(this, this.onUnload));
  },

  onLoad: function () {
    this.module = $lmsModule();
    this.data = $isEmpty(this.module) ? new S4N.ModulePageData() : this.module.get_pageData(this.spaceId, this.globalId);
    this.index = this.data.i;
    this.acceptData(this.data.st, this.data);
    if (this.module != null) this.module.innerPageChanged(true, this); //notifikace modulu
    S4N.Sys.setCssStatus(document.body, false, 'visibleHidden');
    window.focus();
  },

  onUnload: function () {
    if (this.module == null) return;
    this.provideData(this.data);
    //Odvazani od modulu
    this.module.page = null; this.module = null;
  },

  debug_status: function (status) {
    var _evalRoot = $evalRoot();
    if (_evalRoot == null) {
      this.exerciseStatus = S4N.ExerciseStatus.Evaluated;
      data.st = S4N.ExerciseStatus.Evaluated;
      return;
    }
    var data = this.data;
    if (this.exerciseStatus == S4N.ExerciseStatus.Normal && status == S4N.ExerciseStatus.Evaluated)
      this.provideData(data);
    else if (this.exerciseStatus == S4N.ExerciseStatus.Evaluated && status == S4N.ExerciseStatus.Normal)
      this.resetData(data);
    this.exerciseStatus = status;
    data.st = status;
    this.acceptData(this.exerciseStatus, data);
  },

  reset: function () {
    var data = this.data;
    this.exerciseStatus = S4N.ExerciseStatus.Normal;
    this.resetData(data);
    data.st = this.exerciseStatus;
    this.acceptData(this.exerciseStatus, data);
    if (this.module != null) {
      this.module.moduleData.pages[data.i] = data;
      this.module.innerPageChanged(false, this); //notifikace modulu
    }
  },

  evaluate: function (data, pageInfo) {
    var _evalRoot = $evalRoot();
    if (_evalRoot == null) {
      this.exerciseStatus = S4N.ExerciseStatus.Evaluated;
      data.st = S4N.ExerciseStatus.Evaluated;
      return true;
    }
    //zjisteni score
    var score = pageInfo.passive || pageInfo.errorLimit == 0 ? null : _evalRoot.get_score();
    Debug.$trace(S4N.Trace.Eval, score == null ? "null" :
        'S4N.Page.evaluate: ' + score[S4N.ScorePart.Correct].toString() + '/' + score[S4N.ScorePart.From].toString());
    //uschovat vysledek?
    var saveResult = score == null ||
        score[S4N.ScorePart.From] == 0 ||
        (score[S4N.ScorePart.Correct] / score[S4N.ScorePart.From] * 100) >= pageInfo.errorLimit; //je malo chyb
    if (!this.module.notResetable) {
      if (!saveResult) saveResult = this.askUser();
      if (!saveResult) return false;
    }
    //Refresh cviceni
    this.provideData(data);
    this.exerciseStatus = S4N.ExerciseStatus.Evaluated;
    data.st = S4N.ExerciseStatus.Evaluated;
    data.ms = score == null ? 0 : score[S4N.ScorePart.From];
    data.s = score == null ? 0 : score[S4N.ScorePart.Correct];
    this.acceptData(this.exerciseStatus, data);
    window.focus();
    return true;
  },

  askUser: function () {
    return confirm(CSLocalize('2d31eeae1c5d483db53452f07d20e0d9', 'Příliš mnoho chyb. Opravdu chcete cvičení vyhodnotit?'));
  },

  provideData: function (data) {
    var _evalRoot = $evalRoot();
    if (_evalRoot == null || data == null || _evalRoot.exerciseStatus != S4N.ExerciseStatus.Normal) return;
    _evalRoot.provideData(data);
  },

  acceptData: function (exSt, data) {
    var _evalRoot = $evalRoot();
    if (data == null || _evalRoot == null) return;
    _evalRoot.acceptData(exSt, data);
  },

  resetData: function (data) {
    var _evalRoot = $evalRoot();
    if (data == null || _evalRoot == null) return;
    _evalRoot.resetData(data);
  }

};
S4N.Page.registerClass('S4N.Page', Sys.Component);

$page = function () {
  return $find('page');
};
$evalRoot = function () {
  return $find('root');
};
$evalRootEx = function () {
  var res = $evalRoot();
  if (res == null) {
    res = new S4N.EvalGroup();
    res.set_id('root');
    Sys.Application.addComponent(this);
    res.initialize();
  }
  return res;
};

function getRunApi() {
  $adjustAPI();
  return RunApiExplorer;
};

function RunBrowser(url) {
  $adjustAPI();
  if (RunApiExplorer != null) RunApiExplorer.RunBrowser(url);
  else window.location.href = url;
};


///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\atlastoolkit\Timer.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />


///////////////////////////////////////////////////////////////////////////////
// Sys.Timer

Sys.Timer = function () {
  Sys.Timer.initializeBase(this);

  this._interval = 1000;
  this._enabled = false;
  this._timer = null;
}

Sys.Timer.prototype = {
  get_interval: function () {

    return this._interval;
  },
  set_interval: function (value) {

    if (this._interval !== value) {
      this._interval = value;
      this.raisePropertyChanged('interval');

      if (!this.get_isUpdating() && (this._timer !== null)) {
        this._stopTimer();
        this._startTimer();
      }
    }
  },

  get_enabled: function () {

    return this._enabled;
  },
  set_enabled: function (value) {

    if (value !== this.get_enabled()) {
      this._enabled = value;
      this.raisePropertyChanged('enabled');
      if (!this.get_isUpdating()) {
        if (value) {
          this._startTimer();
        }
        else {
          this._stopTimer();
        }
      }
    }
  },


  add_tick: function (handler) {


    this.get_events().addHandler("tick", handler);
  },

  remove_tick: function (handler) {


    this.get_events().removeHandler("tick", handler);
  },

  dispose: function () {
    this.set_enabled(false);
    this._stopTimer();

    Sys.Timer.callBaseMethod(this, 'dispose');
  },

  updated: function () {
    Sys.Timer.callBaseMethod(this, 'updated');

    if (this._enabled) {
      this._stopTimer();
      this._startTimer();
    }
  },

  _timerCallback: function () {
    var handler = this.get_events().getHandler("tick");
    if (handler) {
      handler(this, Sys.EventArgs.Empty);
    }
  },

  _startTimer: function () {
    this._timer = window.setInterval(Function.createDelegate(this, this._timerCallback), this._interval);
  },

  _stopTimer: function () {
    window.clearInterval(this._timer);
    this._timer = null;
  }
}

Sys.Timer.descriptor = {
  properties: [{ name: 'interval', type: Number },
                  { name: 'enabled', type: Boolean }],
  events: [{ name: 'tick' }]
}

Sys.Timer.registerClass('Sys.Timer', Sys.Component);

///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\atlastoolkit\Common.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />


// Add common toolkit scripts here.  To consume the scripts on a control add
// 
//      [RequiredScript(typeof(CommonToolkitScripts))] 
//      public class SomeExtender : ...
// 
// to the controls extender class declaration.


Type.registerNamespace('AjaxControlToolkit');


AjaxControlToolkit.BoxSide = function () {
  /// <summary>
  /// The BoxSide enumeration describes the sides of a DOM element
  /// </summary>
  /// <field name="Top" type="Number" integer="true" static="true" />
  /// <field name="Right" type="Number" integer="true" static="true" />
  /// <field name="Bottom" type="Number" integer="true" static="true" />
  /// <field name="Left" type="Number" integer="true" static="true" />
}
AjaxControlToolkit.BoxSide.prototype = {
  Top: 0,
  Right: 1,
  Bottom: 2,
  Left: 3
}
AjaxControlToolkit.BoxSide.registerEnum("AjaxControlToolkit.BoxSide", false);


AjaxControlToolkit._CommonToolkitScripts = function () {
  /// <summary>
  /// The _CommonToolkitScripts class contains functionality utilized across a number
  /// of controls (but not universally)
  /// </summary>
  /// <remarks>
  /// You should not create new instances of _CommonToolkitScripts.  Instead you should use the shared instance CommonToolkitScripts (or AjaxControlToolkit.CommonToolkitScripts).
  /// </remarks>
}
AjaxControlToolkit._CommonToolkitScripts.prototype = {
  // The order of these lookup tables is directly linked to the BoxSide enum defined above
  _borderStyleNames: ["borderTopStyle", "borderRightStyle", "borderBottomStyle", "borderLeftStyle"],
  _borderWidthNames: ["borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"],
  _paddingWidthNames: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
  _marginWidthNames: ["marginTop", "marginRight", "marginBottom", "marginLeft"],

  getCurrentStyle: function (element, attribute, defaultValue) {
    /// <summary>
    /// CommonToolkitScripts.getCurrentStyle is used to compute the value of a style attribute on an
    /// element that is currently being displayed.  This is especially useful for scenarios where
    /// several CSS classes and style attributes are merged, or when you need information about the
    /// size of an element (such as its padding or margins) that is not exposed in any other fashion.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// Live DOM element to check style of
    /// </param>
    /// <param name="attribute" type="String">
    /// The style attribute's name is expected to be in a camel-cased form that you would use when
    /// accessing a JavaScript property instead of the hyphenated form you would use in a CSS
    /// stylesheet (i.e. it should be "backgroundColor" and not "background-color").
    /// </param>
    /// <param name="defaultValue" type="Object" mayBeNull="true" optional="true">
    /// In the event of a problem (i.e. a null element or an attribute that cannot be found) we
    /// return this object (or null if none if not specified).
    /// </param>
    /// <returns type="Object">
    /// Current style of the element's attribute
    /// </returns>

    var currentValue = null;
    if (element) {
      if (element.currentStyle) {
        currentValue = element.currentStyle[attribute];
      } else if (document.defaultView && document.defaultView.getComputedStyle) {
        var style = document.defaultView.getComputedStyle(element, null);
        if (style) {
          currentValue = style[attribute];
        }
      }

      if (!currentValue && element.style.getPropertyValue) {
        currentValue = element.style.getPropertyValue(attribute);
      }
      else if (!currentValue && element.style.getAttribute) {
        currentValue = element.style.getAttribute(attribute);
      }
    }

    if ((!currentValue || currentValue == "" || typeof (currentValue) === 'undefined')) {
      if (typeof (defaultValue) != 'undefined') {
        currentValue = defaultValue;
      }
      else {
        currentValue = null;
      }
    }
    return currentValue;
  },

  getInheritedBackgroundColor: function (element) {
    /// <summary>
    /// CommonToolkitScripts.getInheritedBackgroundColor provides the ability to get the displayed
    /// background-color of an element.  In most cases calling CommonToolkitScripts.getCurrentStyle
    /// won't do the job because it will return "transparent" unless the element has been given a
    /// specific background color.  This function will walk up the element's parents until it finds
    /// a non-transparent color.  If we get all the way to the top of the document or have any other
    /// problem finding a color, we will return the default value '#FFFFFF'.  This function is
    /// especially important when we're using opacity in IE (because ClearType will make text look
    /// horrendous if you fade it with a transparent background color).
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// Live DOM element to get the background color of
    /// </param>
    /// <returns type="String">
    /// Background color of the element
    /// </returns>

    if (!element) return '#FFFFFF';
    var background = this.getCurrentStyle(element, 'backgroundColor');
    try {
      while (!background || background == '' || background == 'transparent' || background == 'rgba(0, 0, 0, 0)') {
        element = element.parentNode;
        if (!element) {
          background = '#FFFFFF';
        } else {
          background = this.getCurrentStyle(element, 'backgroundColor');
        }
      }
    } catch (ex) {
      background = '#FFFFFF';
    }
    return background;
  },

  getLocation: function (element) {
    /// <summary>Gets the coordinates of a DOM element.</summary>
    /// <param name="element" domElement="true"/>
    /// <returns type="Sys.UI.Point">
    ///   A Point object with two fields, x and y, which contain the pixel coordinates of the element.
    /// </returns>

    // workaround for an issue in getLocation where it will compute the location of the document element.
    // this will return an offset if scrolled.
    //
    if (element === document.documentElement) {
      return new Sys.UI.Point(0, 0);
    }

    // Workaround for IE6 bug in getLocation (also required patching getBounds - remove that fix when this is removed)
    if (Sys.Browser.agent == Sys.Browser.InternetExplorer && Sys.Browser.version < 7) {
      if (element.window === element || element.nodeType === 9 || !element.getClientRects || !element.getBoundingClientRect) return new Sys.UI.Point(0, 0);

      // Get the first bounding rectangle in screen coordinates
      var screenRects = element.getClientRects();
      if (!screenRects || !screenRects.length) {
        return new Sys.UI.Point(0, 0);
      }
      var first = screenRects[0];

      // Delta between client coords and screen coords
      var dLeft = 0;
      var dTop = 0;

      var inFrame = false;
      try {
        inFrame = element.ownerDocument.parentWindow.frameElement;
      } catch (ex) {
        // If accessing the frameElement fails, a frame is probably in a different
        // domain than its parent - and we still want to do the calculation below
        inFrame = true;
      }

      // If we're in a frame, get client coordinates too so we can compute the delta
      if (inFrame) {
        // Get the bounding rectangle in client coords
        var clientRect = element.getBoundingClientRect();
        if (!clientRect) {
          return new Sys.UI.Point(0, 0);
        }

        // Find the minima in screen coords
        var minLeft = first.left;
        var minTop = first.top;
        for (var i = 1; i < screenRects.length; i++) {
          var r = screenRects[i];
          if (r.left < minLeft) {
            minLeft = r.left;
          }
          if (r.top < minTop) {
            minTop = r.top;
          }
        }

        // Compute the delta between screen and client coords
        dLeft = minLeft - clientRect.left;
        dTop = minTop - clientRect.top;
      }

      // Subtract 2px, the border of the viewport (It can be changed in IE6 by applying a border style to the HTML element,
      // but this is not supported by ASP.NET AJAX, and it cannot be changed in IE7.), and also subtract the delta between
      // screen coords and client coords
      var ownerDocument = element.document.documentElement;
      return new Sys.UI.Point(first.left - 2 - dLeft + ownerDocument.scrollLeft, first.top - 2 - dTop + ownerDocument.scrollTop);
    }

    return Sys.UI.DomElement.getLocation(element);
  },

  setLocation: function (element, point) {
    /// <summary>
    /// Sets the current location for an element.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM element
    /// </param>
    /// <param name="point" type="Object">
    /// Point object (of the form {x,y})
    /// </param>
    /// <remarks>
    /// This method does not attempt to set the positioning mode of an element.
    /// The position is relative from the elements nearest position:relative or
    /// position:absolute element.
    /// </remarks>
    Sys.UI.DomElement.setLocation(element, point.x, point.y);
  },

  getContentSize: function (element) {
    /// <summary>
    /// Gets the "content-box" size of an element.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM element
    /// </param>
    /// <returns type="Object">
    /// Size of the element (in the form {width,height})
    /// </returns>
    /// <remarks>
    /// The "content-box" is the size of the content area *inside* of the borders and
    /// padding of an element. The "content-box" size does not include the margins around
    /// the element.
    /// </remarks>

    if (!element) {
      throw Error.argumentNull('element');
    }
    var size = this.getSize(element);
    var borderBox = this.getBorderBox(element);
    var paddingBox = this.getPaddingBox(element);
    return {
      width: size.width - borderBox.horizontal - paddingBox.horizontal,
      height: size.height - borderBox.vertical - paddingBox.vertical
    }
  },

  getSize: function (element) {
    /// <summary>
    /// Gets the "border-box" size of an element.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM element
    /// </param>
    /// <returns type="Object">
    /// Size of the element (in the form {width,height})
    /// </returns>
    /// <remarks>
    /// The "border-box" is the size of the content area *outside* of the borders and
    /// padding of an element.  The "border-box" size does not include the margins around
    /// the element.
    /// </remarks>

    if (!element) {
      throw Error.argumentNull('element');
    }
    return {
      width: element.offsetWidth,
      height: element.offsetHeight
    };
  },

  setContentSize: function (element, size) {
    /// <summary>
    /// Sets the "content-box" size of an element.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM element
    /// </param>
    /// <param name="size" type="Object">
    /// Size of the element (in the form {width,height})
    /// </param>
    /// <remarks>
    /// The "content-box" is the size of the content area *inside* of the borders and
    /// padding of an element. The "content-box" size does not include the margins around
    /// the element.
    /// </remarks>

    if (!element) {
      throw Error.argumentNull('element');
    }
    if (!size) {
      throw Error.argumentNull('size');
    }
    // FF respects -moz-box-sizing css extension, so adjust the box size for the border-box
    if (this.getCurrentStyle(element, 'MozBoxSizing') == 'border-box' || this.getCurrentStyle(element, 'BoxSizing') == 'border-box') {
      var borderBox = this.getBorderBox(element);
      var paddingBox = this.getPaddingBox(element);
      size = {
        width: size.width + borderBox.horizontal + paddingBox.horizontal,
        height: size.height + borderBox.vertical + paddingBox.vertical
      };
    }
    element.style.width = size.width.toString() + 'px';
    element.style.height = size.height.toString() + 'px';
  },

  setSize: function (element, size) {
    /// <summary>
    /// Sets the "border-box" size of an element.
    /// </summary>
    /// <remarks>
    /// The "border-box" is the size of the content area *outside* of the borders and 
    /// padding of an element.  The "border-box" size does not include the margins around
    /// the element.
    /// </remarks>
    /// <param name="element" type="Sys.UI.DomElement">DOM element</param>
    /// <param name="size" type="Object">Size of the element (in the form {width,height})</param>
    /// <returns />

    if (!element) {
      throw Error.argumentNull('element');
    }
    if (!size) {
      throw Error.argumentNull('size');
    }
    var borderBox = this.getBorderBox(element);
    var paddingBox = this.getPaddingBox(element);
    var contentSize = {
      width: size.width - borderBox.horizontal - paddingBox.horizontal,
      height: size.height - borderBox.vertical - paddingBox.vertical
    };
    this.setContentSize(element, contentSize);
  },

  getBounds: function (element) {
    /// <summary>Gets the coordinates, width and height of an element.</summary>
    /// <param name="element" domElement="true"/>
    /// <returns type="Sys.UI.Bounds">
    ///   A Bounds object with four fields, x, y, width and height, which contain the pixel coordinates,
    ///   width and height of the element.
    /// </returns>
    /// <remarks>
    ///   Use the CommonToolkitScripts version of getLocation to handle the workaround for IE6.  We can
    ///   remove the below implementation and just call Sys.UI.DomElement.getBounds when the other bug
    ///   is fixed.
    /// </remarks>

    var offset = $common.getLocation(element);
    return new Sys.UI.Bounds(offset.x, offset.y, element.offsetWidth || 0, element.offsetHeight || 0);
  },

  setBounds: function (element, bounds) {
    /// <summary>
    /// Sets the "border-box" bounds of an element
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM element
    /// </param>
    /// <param name="bounds" type="Object">
    /// Bounds of the element (of the form {x,y,width,height})
    /// </param>
    /// <remarks>
    /// The "border-box" is the size of the content area *outside* of the borders and
    /// padding of an element.  The "border-box" size does not include the margins around
    /// the element.
    /// </remarks>

    if (!element) {
      throw Error.argumentNull('element');
    }
    if (!bounds) {
      throw Error.argumentNull('bounds');
    }
    this.setSize(element, bounds);
    $common.setLocation(element, bounds);
  },

  getClientBounds: function () {
    /// <summary>
    /// Gets the width and height of the browser client window (excluding scrollbars)
    /// </summary>
    /// <returns type="Sys.UI.Bounds">
    /// Browser's client width and height
    /// </returns>

    var clientWidth;
    var clientHeight;
    switch (Sys.Browser.agent) {
      case Sys.Browser.InternetExplorer:
        clientWidth = document.documentElement.clientWidth;
        clientHeight = document.documentElement.clientHeight;
        break;
      case Sys.Browser.Safari:
        clientWidth = window.innerWidth;
        clientHeight = window.innerHeight;
        break;
      case Sys.Browser.Opera:
        clientWidth = Math.min(window.innerWidth, document.body.clientWidth);
        clientHeight = Math.min(window.innerHeight, document.body.clientHeight);
        break;
      default:  // Sys.Browser.Firefox, etc.
        clientWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
        clientHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
        break;
    }
    return new Sys.UI.Bounds(0, 0, clientWidth, clientHeight);
  },

  getMarginBox: function (element) {
    /// <summary>
    /// Gets the entire margin box sizes.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM element
    /// </param>
    /// <returns type="Object">
    /// Element's margin box sizes (of the form {top,left,bottom,right,horizontal,vertical})
    /// </returns>

    if (!element) {
      throw Error.argumentNull('element');
    }
    var box = {
      top: this.getMargin(element, AjaxControlToolkit.BoxSide.Top),
      right: this.getMargin(element, AjaxControlToolkit.BoxSide.Right),
      bottom: this.getMargin(element, AjaxControlToolkit.BoxSide.Bottom),
      left: this.getMargin(element, AjaxControlToolkit.BoxSide.Left)
    };
    box.horizontal = box.left + box.right;
    box.vertical = box.top + box.bottom;
    return box;
  },

  getBorderBox: function (element) {
    /// <summary>
    /// Gets the entire border box sizes.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM element
    /// </param>
    /// <returns type="Object">
    /// Element's border box sizes (of the form {top,left,bottom,right,horizontal,vertical})
    /// </returns>

    if (!element) {
      throw Error.argumentNull('element');
    }
    var box = {
      top: this.getBorderWidth(element, AjaxControlToolkit.BoxSide.Top),
      right: this.getBorderWidth(element, AjaxControlToolkit.BoxSide.Right),
      bottom: this.getBorderWidth(element, AjaxControlToolkit.BoxSide.Bottom),
      left: this.getBorderWidth(element, AjaxControlToolkit.BoxSide.Left)
    };
    box.horizontal = box.left + box.right;
    box.vertical = box.top + box.bottom;
    return box;
  },

  getPaddingBox: function (element) {
    /// <summary>
    /// Gets the entire padding box sizes.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM element
    /// </param>
    /// <returns type="Object">
    /// Element's padding box sizes (of the form {top,left,bottom,right,horizontal,vertical})
    /// </returns>

    if (!element) {
      throw Error.argumentNull('element');
    }
    var box = {
      top: this.getPadding(element, AjaxControlToolkit.BoxSide.Top),
      right: this.getPadding(element, AjaxControlToolkit.BoxSide.Right),
      bottom: this.getPadding(element, AjaxControlToolkit.BoxSide.Bottom),
      left: this.getPadding(element, AjaxControlToolkit.BoxSide.Left)
    };
    box.horizontal = box.left + box.right;
    box.vertical = box.top + box.bottom;
    return box;
  },

  isBorderVisible: function (element, boxSide) {
    /// <summary>
    /// Gets whether the current border style for an element on a specific boxSide is not 'none'.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM element
    /// </param>
    /// <param name="boxSide" type="AjaxControlToolkit.BoxSide">
    /// Side of the element
    /// </param>
    /// <returns type="Boolean">
    /// Whether the current border style for an element on a specific boxSide is not 'none'.
    /// </returns>

    if (!element) {
      throw Error.argumentNull('element');
    }
    if (boxSide < AjaxControlToolkit.BoxSide.Top || boxSide > AjaxControlToolkit.BoxSide.Left) {
      throw Error.argumentOutOfRange(String.format(Sys.Res.enumInvalidValue, boxSide, 'AjaxControlToolkit.BoxSide'));
    }
    var styleName = this._borderStyleNames[boxSide];
    var styleValue = this.getCurrentStyle(element, styleName);
    return styleValue != "none";
  },

  getMargin: function (element, boxSide) {
    /// <summary>
    /// Gets the margin thickness of an element on a specific boxSide.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM element
    /// </param>
    /// <param name="boxSide" type="AjaxControlToolkit.BoxSide">
    /// Side of the element
    /// </param>
    /// <returns type="Number" integer="true">
    /// Margin thickness on the element's specified side
    /// </returns>

    if (!element) {
      throw Error.argumentNull('element');
    }
    if (boxSide < AjaxControlToolkit.BoxSide.Top || boxSide > AjaxControlToolkit.BoxSide.Left) {
      throw Error.argumentOutOfRange(String.format(Sys.Res.enumInvalidValue, boxSide, 'AjaxControlToolkit.BoxSide'));
    }
    var styleName = this._marginWidthNames[boxSide];
    var styleValue = this.getCurrentStyle(element, styleName);
    try { return this.parsePadding(styleValue); } catch (ex) { return 0; }
  },

  getBorderWidth: function (element, boxSide) {
    /// <summary>
    /// Gets the border thickness of an element on a specific boxSide.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM element
    /// </param>
    /// <param name="boxSide" type="AjaxControlToolkit.BoxSide">
    /// Side of the element
    /// </param>
    /// <returns type="Number" integer="true">
    /// Border thickness on the element's specified side
    /// </returns>

    if (!element) {
      throw Error.argumentNull('element');
    }
    if (boxSide < AjaxControlToolkit.BoxSide.Top || boxSide > AjaxControlToolkit.BoxSide.Left) {
      throw Error.argumentOutOfRange(String.format(Sys.Res.enumInvalidValue, boxSide, 'AjaxControlToolkit.BoxSide'));
    }
    if (!this.isBorderVisible(element, boxSide)) {
      return 0;
    }
    var styleName = this._borderWidthNames[boxSide];
    var styleValue = this.getCurrentStyle(element, styleName);
    return this.parseBorderWidth(styleValue);
  },

  getPadding: function (element, boxSide) {
    /// <summary>
    /// Gets the padding thickness of an element on a specific boxSide.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM element
    /// </param>
    /// <param name="boxSide" type="AjaxControlToolkit.BoxSide">
    /// Side of the element
    /// </param>
    /// <returns type="Number" integer="true">
    /// Padding on the element's specified side
    /// </returns>

    if (!element) {
      throw Error.argumentNull('element');
    }
    if (boxSide < AjaxControlToolkit.BoxSide.Top || boxSide > AjaxControlToolkit.BoxSide.Left) {
      throw Error.argumentOutOfRange(String.format(Sys.Res.enumInvalidValue, boxSide, 'AjaxControlToolkit.BoxSide'));
    }
    var styleName = this._paddingWidthNames[boxSide];
    var styleValue = this.getCurrentStyle(element, styleName);
    return this.parsePadding(styleValue);
  },

  parseBorderWidth: function (borderWidth) {
    /// <summary>
    /// Parses a border-width string into a pixel size
    /// </summary>
    /// <param name="borderWidth" type="String" mayBeNull="true">
    /// Type of border ('thin','medium','thick','inherit',px unit,null,'')
    /// </param>
    /// <returns type="Number" integer="true">
    /// Number of pixels in the border-width
    /// </returns>
    if (!this._borderThicknesses) {

      // Populate the borderThicknesses lookup table
      var borderThicknesses = {};
      var div0 = document.createElement('div');
      div0.style.visibility = 'hidden';
      div0.style.position = 'absolute';
      div0.style.fontSize = '1px';
      document.body.appendChild(div0)
      var div1 = document.createElement('div');
      div1.style.height = '0px';
      div1.style.overflow = 'hidden';
      div0.appendChild(div1);
      var base = div0.offsetHeight;
      div1.style.borderTop = 'solid black';
      div1.style.borderTopWidth = 'thin';
      borderThicknesses['thin'] = div0.offsetHeight - base;
      div1.style.borderTopWidth = 'medium';
      borderThicknesses['medium'] = div0.offsetHeight - base;
      div1.style.borderTopWidth = 'thick';
      borderThicknesses['thick'] = div0.offsetHeight - base;
      div0.removeChild(div1);
      document.body.removeChild(div0);
      this._borderThicknesses = borderThicknesses;
    }

    if (borderWidth) {
      switch (borderWidth) {
        case 'thin':
        case 'medium':
        case 'thick':
          return this._borderThicknesses[borderWidth];
        case 'inherit':
          return 0;
      }
      var unit = this.parseUnit(borderWidth);
      Sys.Debug.assert(unit.type == 'px', String.format(AjaxControlToolkit.Resources.Common_InvalidBorderWidthUnit, unit.type));
      return unit.size;
    }
    return 0;
  },

  parsePadding: function (padding) {
    /// <summary>
    /// Parses a padding string into a pixel size
    /// </summary>
    /// <param name="padding" type="String" mayBeNull="true">
    /// Padding to parse ('inherit',px unit,null,'')
    /// </param>
    /// <returns type="Number" integer="true">
    /// Number of pixels in the padding
    /// </returns>

    if (padding) {
      if (padding == 'inherit') {
        return 0;
      }
      var unit = this.parseUnit(padding);
      Sys.Debug.assert(unit.type == 'px', String.format(AjaxControlToolkit.Resources.Common_InvalidPaddingUnit, unit.type));
      return unit.size;
    }
    return 0;
  },

  parseUnit: function (value) {
    /// <summary>
    /// Parses a unit string into a unit object
    /// </summary>
    /// <param name="value" type="String" mayBeNull="true">
    /// Value to parse (of the form px unit,% unit,em unit,...)
    /// </param>
    /// <returns type="Object">
    /// Parsed unit (of the form {size,type})
    /// </returns>

    if (!value) {
      throw Error.argumentNull('value');
    }

    value = value.trim().toLowerCase();
    var l = value.length;
    var s = -1;
    for (var i = 0; i < l; i++) {
      var ch = value.substr(i, 1);
      if ((ch < '0' || ch > '9') && ch != '-' && ch != '.' && ch != ',') {
        break;
      }
      s = i;
    }
    if (s == -1) {
      throw Error.create(AjaxControlToolkit.Resources.Common_UnitHasNoDigits);
    }
    var type;
    var size;
    if (s < (l - 1)) {
      type = value.substring(s + 1).trim();
    } else {
      type = 'px';
    }
    size = parseFloat(value.substr(0, s + 1));
    if (type == 'px') {
      size = Math.floor(size);
    }
    return {
      size: size,
      type: type
    };
  },

  getElementOpacity: function (element) {
    /// <summary>
    /// Get the element's opacity
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// Element
    /// </param>
    /// <returns type="Number">
    /// Opacity of the element
    /// </returns>

    if (!element) {
      throw Error.argumentNull('element');
    }

    var hasOpacity = false;
    var opacity;

    if (element.filters) {
      var filters = element.filters;
      if (filters.length !== 0) {
        var alphaFilter = filters['DXImageTransform.Microsoft.Alpha'];
        if (alphaFilter) {
          opacity = alphaFilter.opacity / 100.0;
          hasOpacity = true;
        }
      }
    }
    else {
      opacity = this.getCurrentStyle(element, 'opacity', 1);
      hasOpacity = true;
    }

    if (hasOpacity === false) {
      return 1.0;
    }
    return parseFloat(opacity);
  },

  setElementOpacity: function (element, value) {
    /// <summary>
    /// Set the element's opacity
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// Element
    /// </param>
    /// <param name="value" type="Number">
    /// Opacity of the element
    /// </param>

    if (!element) {
      throw Error.argumentNull('element');
    }

    if (element.filters) {
      var filters = element.filters;
      var createFilter = true;
      if (filters.length !== 0) {
        var alphaFilter = filters['DXImageTransform.Microsoft.Alpha'];
        if (alphaFilter) {
          createFilter = false;
          alphaFilter.opacity = value * 100;
        }
      }
      if (createFilter) {
        element.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + (value * 100) + ')';
      }
    }
    else {
      element.style.opacity = value;
    }
  },

  getVisible: function (element) {
    /// <summary>
    /// Check if an element is visible
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// Element
    /// </param>
    /// <returns type="Boolean" mayBeNull="false">
    /// True if the element is visible, false otherwise
    /// </returns>

    // Note: reference to CommonToolkitScripts must be left intact (i.e. don't
    // replace with 'this') because this function will be aliased

    return (element &&
            ("none" != $common.getCurrentStyle(element, "display")) &&
            ("hidden" != $common.getCurrentStyle(element, "visibility")));
  },

  setVisible: function (element, value) {
    /// <summary>
    /// Check if an element is visible
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// Element
    /// </param>
    /// <param name="value" type="Boolean" mayBeNull="false">
    /// True to make the element visible, false to hide it
    /// </param>

    // Note: reference to CommonToolkitScripts must be left intact (i.e. don't
    // replace with 'this') because this function will be aliased

    if (element && value != $common.getVisible(element)) {
      if (value) {
        if (element.style.removeAttribute) {
          element.style.removeAttribute("display");
        } else {
          element.style.removeProperty("display");
        }
      } else {
        element.style.display = 'none';
      }
      element.style.visibility = value ? 'visible' : 'hidden';
    }
  },

  resolveFunction: function (value) {
    /// <summary>
    /// Returns a function reference that corresponds to the provided value
    /// </summary>
    /// <param name="value" type="Object">
    /// The value can either be a Function, the name of a function (that can be found using window['name']),
    /// or an expression that evaluates to a function.
    /// </param>
    /// <returns type="Function">
    /// Reference to the function, or null if not found
    /// </returns>

    if (value) {
      if (value instanceof Function) {
        return value;
      } else if (String.isInstanceOfType(value) && value.length > 0) {
        var func;
        if ((func = window[value]) instanceof Function) {
          return func;
        } else if ((func = eval(value)) instanceof Function) {
          return func;
        }
      }
    }
    return null;
  },

  addCssClasses: function (element, classNames) {
    /// <summary>
    /// Adds multiple css classes to a DomElement
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement">The element to modify</param>
    /// <param name="classNames" type="Array">The class names to add</param>

    for (var i = 0; i < classNames.length; i++) {
      Sys.UI.DomElement.addCssClass(element, classNames[i]);
    }
  },
  removeCssClasses: function (element, classNames) {
    /// <summary>
    /// Removes multiple css classes to a DomElement
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement">The element to modify</param>
    /// <param name="classNames" type="Array">The class names to remove</param>

    for (var i = 0; i < classNames.length; i++) {
      Sys.UI.DomElement.removeCssClass(element, classNames[i]);
    }
  },
  setStyle: function (element, style) {
    /// <summary>
    /// Sets the style of the element using the supplied style template object
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement">The element to modify</param>
    /// <param name="style" type="Object">The template</param>

    $common.applyProperties(element.style, style);
  },
  removeHandlers: function (element, events) {
    /// <summary>
    /// Removes a set of event handlers from an element
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement">The element to modify</param>
    /// <param name="events" type="Object">The template object that contains event names and delegates</param>
    /// <remarks>
    /// This is NOT the same as $clearHandlers which removes all delegates from a DomElement.  This rather removes select delegates 
    /// from a specified element and has a matching signature as $addHandlers
    /// </remarks>
    for (var name in events) {
      $removeHandler(element, name, events[name]);
    }
  },

  overlaps: function (r1, r2) {
    /// <summary>
    /// Determine if two rectangles overlap
    /// </summary>
    /// <param name="r1" type="Object">
    /// Rectangle
    /// </param>
    /// <param name="r2" type="Object">
    /// Rectangle
    /// </param>
    /// <returns type="Boolean">
    /// True if the rectangles overlap, false otherwise
    /// </returns>

    return r1.x < (r2.x + r2.width)
           && r2.x < (r1.x + r1.width)
           && r1.y < (r2.y + r2.height)
           && r2.y < (r1.y + r1.height);
  },

  containsPoint: function (rect, x, y) {
    /// <summary>
    /// Tests whether a point (x,y) is contained within a rectangle
    /// </summary>
    /// <param name="rect" type="Object">The rectangle</param>
    /// <param name="x" type="Number">The x coordinate of the point</param>
    /// <param name="y" type="Number">The y coordinate of the point</param>

    return x >= rect.x && x < (rect.x + rect.width) && y >= rect.y && y < (rect.y + rect.height);
  },

  isKeyDigit: function (keyCode) {
    /// <summary>
    /// Gets whether the supplied key-code is a digit
    /// </summary>
    /// <param name="keyCode" type="Number" integer="true">The key code of the event (from Sys.UI.DomEvent)</param>
    /// <returns type="Boolean" />

    return (0x30 <= keyCode && keyCode <= 0x39);
  },

  isKeyNavigation: function (keyCode) {
    /// <summary>
    /// Gets whether the supplied key-code is a navigation key
    /// </summary>
    /// <param name="keyCode" type="Number" integer="true">The key code of the event (from Sys.UI.DomEvent)</param>
    /// <returns type="Boolean" />

    return (Sys.UI.Key.left <= keyCode && keyCode <= Sys.UI.Key.down);
  },

  padLeft: function (text, size, ch, truncate) {
    /// <summary>
    /// Pads the left hand side of the supplied text with the specified pad character up to the requested size
    /// </summary>
    /// <param name="text" type="String">The text to pad</param>
    /// <param name="size" type="Number" integer="true" optional="true">The size to pad the text (default is 2)</param>
    /// <param name="ch" type="String" optional="true">The single character to use as the pad character (default is ' ')</param>
    /// <param name="truncate" type="Boolean" optional="true">Whether to truncate the text to size (default is false)</param>

    return $common._pad(text, size || 2, ch || ' ', 'l', truncate || false);
  },

  padRight: function (text, size, ch, truncate) {
    /// <summary>
    /// Pads the right hand side of the supplied text with the specified pad character up to the requested size
    /// </summary>
    /// <param name="text" type="String">The text to pad</param>
    /// <param name="size" type="Number" integer="true" optional="true">The size to pad the text (default is 2)</param>
    /// <param name="ch" type="String" optional="true">The single character to use as the pad character (default is ' ')</param>
    /// <param name="truncate" type="Boolean" optional="true">Whether to truncate the text to size (default is false)</param>

    return $common._pad(text, size || 2, ch || ' ', 'r', truncate || false);
  },

  _pad: function (text, size, ch, side, truncate) {
    /// <summary>
    /// Pads supplied text with the specified pad character up to the requested size
    /// </summary>
    /// <param name="text" type="String">The text to pad</param>
    /// <param name="size" type="Number" integer="true">The size to pad the text</param>
    /// <param name="ch" type="String">The single character to use as the pad character</param>
    /// <param name="side" type="String">Either 'l' or 'r' to siginfy whether to pad the Left or Right side respectively</param>
    /// <param name="truncate" type="Boolean">Whether to truncate the text to size</param>

    text = text.toString();
    var length = text.length;
    var builder = new Sys.StringBuilder();
    if (side == 'r') {
      builder.append(text);
    }
    while (length < size) {
      builder.append(ch);
      length++;
    }
    if (side == 'l') {
      builder.append(text);
    }
    var result = builder.toString();
    if (truncate && result.length > size) {
      if (side == 'l') {
        result = result.substr(result.length - size, size);
      } else {
        result = result.substr(0, size);
      }
    }
    return result;
  },

  __DOMEvents: {
    focusin: { eventGroup: "UIEvents", init: function (e, p) { e.initUIEvent("focusin", true, false, window, 1); } },
    focusout: { eventGroup: "UIEvents", init: function (e, p) { e.initUIEvent("focusout", true, false, window, 1); } },
    activate: { eventGroup: "UIEvents", init: function (e, p) { e.initUIEvent("activate", true, true, window, 1); } },
    focus: { eventGroup: "UIEvents", init: function (e, p) { e.initUIEvent("focus", false, false, window, 1); } },
    blur: { eventGroup: "UIEvents", init: function (e, p) { e.initUIEvent("blur", false, false, window, 1); } },
    click: { eventGroup: "MouseEvents", init: function (e, p) { e.initMouseEvent("click", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
    dblclick: { eventGroup: "MouseEvents", init: function (e, p) { e.initMouseEvent("click", true, true, window, 2, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
    mousedown: { eventGroup: "MouseEvents", init: function (e, p) { e.initMouseEvent("mousedown", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
    mouseup: { eventGroup: "MouseEvents", init: function (e, p) { e.initMouseEvent("mouseup", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
    mouseover: { eventGroup: "MouseEvents", init: function (e, p) { e.initMouseEvent("mouseover", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
    mousemove: { eventGroup: "MouseEvents", init: function (e, p) { e.initMouseEvent("mousemove", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
    mouseout: { eventGroup: "MouseEvents", init: function (e, p) { e.initMouseEvent("mousemove", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
    load: { eventGroup: "HTMLEvents", init: function (e, p) { e.initEvent("load", false, false); } },
    unload: { eventGroup: "HTMLEvents", init: function (e, p) { e.initEvent("unload", false, false); } },
    select: { eventGroup: "HTMLEvents", init: function (e, p) { e.initEvent("select", true, false); } },
    change: { eventGroup: "HTMLEvents", init: function (e, p) { e.initEvent("change", true, false); } },
    submit: { eventGroup: "HTMLEvents", init: function (e, p) { e.initEvent("submit", true, true); } },
    reset: { eventGroup: "HTMLEvents", init: function (e, p) { e.initEvent("reset", true, false); } },
    resize: { eventGroup: "HTMLEvents", init: function (e, p) { e.initEvent("resize", true, false); } },
    scroll: { eventGroup: "HTMLEvents", init: function (e, p) { e.initEvent("scroll", true, false); } }
  },

  tryFireRawEvent: function (element, rawEvent) {
    /// <summary>
    /// Attempts to fire a raw DOM event on an element
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement">The element to fire the event</param>
    /// <param name="rawEvent" type="Object">The raw DOM event object to fire. Must not be Sys.UI.DomEvent</param>
    /// <returns type="Boolean">True if the event was successfully fired, otherwise false</returns>

    try {
      if (element.fireEvent) {
        element.fireEvent("on" + rawEvent.type, rawEvent);
        return true;
      } else if (element.dispatchEvent) {
        element.dispatchEvent(rawEvent);
        return true;
      }
    } catch (e) {
    }
    return false;
  },

  tryFireEvent: function (element, eventName, properties) {
    /// <summary>
    /// Attempts to fire a DOM event on an element
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement">The element to fire the event</param>
    /// <param name="eventName" type="String">The name of the event to fire (without an 'on' prefix)</param>
    /// <param name="properties" type="Object">Properties to add to the event</param>
    /// <returns type="Boolean">True if the event was successfully fired, otherwise false</returns>

    try {
      if (document.createEventObject) {
        var e = document.createEventObject();
        $common.applyProperties(e, properties || {});
        element.fireEvent("on" + eventName, e);
        return true;
      } else if (document.createEvent) {
        var def = $common.__DOMEvents[eventName];
        if (def) {
          var e = document.createEvent(def.eventGroup);
          def.init(e, properties || {});
          element.dispatchEvent(e);
          return true;
        }
      }
    } catch (e) {
    }
    return false;
  },

  wrapElement: function (innerElement, newOuterElement, newInnerParentElement) {
    /// <summary>
    /// Wraps an inner element with a new outer element at the same DOM location as the inner element
    /// </summary>
    /// <param name="innerElement" type="Sys.UI.DomElement">The element to be wrapped</param>
    /// <param name="newOuterElement" type="Sys.UI.DomElement">The new parent for the element</param>
    /// <returns />

    var parent = innerElement.parentNode;
    parent.replaceChild(newOuterElement, innerElement);
    (newInnerParentElement || newOuterElement).appendChild(innerElement);
  },

  unwrapElement: function (innerElement, oldOuterElement) {
    /// <summary>
    /// Unwraps an inner element from an outer element at the same DOM location as the outer element
    /// </summary>
    /// <param name="innerElement" type="Sys.UI.DomElement">The element to be wrapped</param>
    /// <param name="newOuterElement" type="Sys.UI.DomElement">The new parent for the element</param>
    /// <returns />

    var parent = oldOuterElement.parentNode;
    if (parent != null) {
      $common.removeElement(innerElement);
      parent.replaceChild(innerElement, oldOuterElement);
    }
  },

  removeElement: function (element) {
    /// <summary>
    /// Removes an element from the DOM tree
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement">The element to be removed</param>
    /// <returns />

    var parent = element.parentNode;
    if (parent != null) {
      parent.removeChild(element);
    }
  },

  applyProperties: function (target, properties) {
    /// <summary>
    /// Quick utility method to copy properties from a template object to a target object
    /// </summary>
    /// <param name="target" type="Object">The object to apply to</param>
    /// <param name="properties" type="Object">The template to copy values from</param>

    for (var p in properties) {
      var pv = properties[p];
      if (pv != null && Object.getType(pv) === Object) {
        var tv = target[p];
        $common.applyProperties(tv, pv);
      } else {
        target[p] = pv;
      }
    }
  },

  createElementFromTemplate: function (template, appendToParent, nameTable) {
    /// <summary>
    /// Creates an element for the current document based on a template object
    /// </summary>
    /// <param name="template" type="Object">The template from which to create the element</param>
    /// <param name="appendToParent" type="Sys.UI.DomElement" optional="true" mayBeNull="true">A DomElement under which to append this element</param>
    /// <param name="nameTable" type="Object" optional="true" mayBeNull="true">An object to use as the storage for the element using template.name as the key</param>
    /// <returns type="Sys.UI.DomElement" />
    /// <remarks>
    /// This method is useful if you find yourself using the same or similar DomElement constructions throughout a class.  You can even set the templates
    /// as static properties for a type to cut down on overhead.  This method is often called with a JSON style template:
    /// <code>
    /// var elt = $common.createElementFromTemplate({
    ///     nodeName : "div",
    ///     properties : {
    ///         style : {
    ///             height : "100px",
    ///             width : "100px",
    ///             backgroundColor : "white"
    ///         },
    ///         expandoAttribute : "foo"
    ///     },
    ///     events : {
    ///         click : function() { alert("foo"); },
    ///         mouseover : function() { elt.backgroundColor = "silver"; },
    ///         mouseout : function() { elt.backgroundColor = "white"; }
    ///     },
    ///     cssClasses : [ "class0", "class1" ],
    ///     visible : true,
    ///     opacity : .5
    /// }, someParent);
    /// </code>
    /// </remarks>

    // if we wish to override the name table we do so here
    if (typeof (template.nameTable) != 'undefined') {
      var newNameTable = template.nameTable;
      if (String.isInstanceOfType(newNameTable)) {
        newNameTable = nameTable[newNameTable];
      }
      if (newNameTable != null) {
        nameTable = newNameTable;
      }
    }

    // get a name for the element in the nameTable
    var elementName = null;
    if (typeof (template.name) !== 'undefined') {
      elementName = template.name;
    }

    // create or acquire the element
    var elt = document.createElement(template.nodeName);

    // if our element is named, add it to the name table
    if (typeof (template.name) !== 'undefined' && nameTable) {
      nameTable[template.name] = elt;
    }

    // if we wish to supply a default parent we do so here
    if (typeof (template.parent) !== 'undefined' && appendToParent == null) {
      var newParent = template.parent;
      if (String.isInstanceOfType(newParent)) {
        newParent = nameTable[newParent];
      }
      if (newParent != null) {
        appendToParent = newParent;
      }
    }

    // properties are applied as expando values to the element
    if (typeof (template.properties) !== 'undefined' && template.properties != null) {
      $common.applyProperties(elt, template.properties);
    }

    // css classes are added to the element's className property
    if (typeof (template.cssClasses) !== 'undefined' && template.cssClasses != null) {
      $common.addCssClasses(elt, template.cssClasses);
    }

    // events are added to the dom element using $addHandlers
    if (typeof (template.events) !== 'undefined' && template.events != null) {
      $addHandlers(elt, template.events);
    }

    // if the element is visible or not its visibility is set
    if (typeof (template.visible) !== 'undefined' && template.visible != null) {
      this.setVisible(elt, template.visible);
    }

    // if we have an appendToParent we will now append to it
    if (appendToParent) {
      appendToParent.appendChild(elt);
    }

    // if we have opacity, apply it
    if (typeof (template.opacity) !== 'undefined' && template.opacity != null) {
      $common.setElementOpacity(elt, template.opacity);
    }

    // if we have child templates, process them
    if (typeof (template.children) !== 'undefined' && template.children != null) {
      for (var i = 0; i < template.children.length; i++) {
        var subtemplate = template.children[i];
        $common.createElementFromTemplate(subtemplate, elt, nameTable);
      }
    }

    // if we have a content presenter for the element get it (the element itself is the default presenter for content)
    var contentPresenter = elt;
    if (typeof (template.contentPresenter) !== 'undefined' && template.contentPresenter != null) {
      contentPresenter = nameTable[contentPresenter];
    }

    // if we have content, add it
    if (typeof (template.content) !== 'undefined' && template.content != null) {
      var content = template.content;
      if (String.isInstanceOfType(content)) {
        content = nameTable[content];
      }
      if (content.parentNode) {
        $common.wrapElement(content, elt, contentPresenter);
      } else {
        contentPresenter.appendChild(content);
      }
    }

    // return the created element
    return elt;
  },

  prepareHiddenElementForATDeviceUpdate: function () {
    /// <summary>
    /// JAWS, an Assistive Technology device responds to updates to form elements 
    /// and refreshes its document buffer to what is showing live
    /// in the browser. To ensure that Toolkit controls that make XmlHttpRequests to
    /// retrieve content are useful to users with visual disabilities, we update a
    /// hidden form element to ensure that JAWS conveys what is in
    /// the browser. See this article for more details: 
    /// http://juicystudio.com/article/improving-ajax-applications-for-jaws-users.php
    /// This method creates a hidden input on the screen for any page that uses a Toolkit
    /// control that will perform an XmlHttpRequest.
    /// </summary>   
    var objHidden = document.getElementById('hiddenInputToUpdateATBuffer_CommonToolkitScripts');
    if (!objHidden) {
      var objHidden = document.createElement('input');
      objHidden.setAttribute('type', 'hidden');
      objHidden.setAttribute('value', '1');
      objHidden.setAttribute('id', 'hiddenInputToUpdateATBuffer_CommonToolkitScripts');
      objHidden.setAttribute('name', 'hiddenInputToUpdateATBuffer_CommonToolkitScripts');
      if (document.forms[0]) {
        document.forms[0].appendChild(objHidden);
      }
    }
  },

  updateFormToRefreshATDeviceBuffer: function () {
    /// <summary>
    /// Updates the hidden buffer to ensure that the latest document stream is picked up
    /// by the screen reader.
    /// </summary>
    var objHidden = document.getElementById('hiddenInputToUpdateATBuffer_CommonToolkitScripts');

    if (objHidden) {
      if (objHidden.getAttribute('value') == '1') {
        objHidden.setAttribute('value', '0');
      } else {
        objHidden.setAttribute('value', '1');
      }
    }
  }
}

// Create the singleton instance of the CommonToolkitScripts
var CommonToolkitScripts = AjaxControlToolkit.CommonToolkitScripts = new AjaxControlToolkit._CommonToolkitScripts();
var $common = CommonToolkitScripts;

// Alias functions that were moved from BlockingScripts into Common
Sys.UI.DomElement.getVisible = $common.getVisible;
Sys.UI.DomElement.setVisible = $common.setVisible;
Sys.UI.Control.overlaps = $common.overlaps;

AjaxControlToolkit._DomUtility = function () {
  /// <summary>
  /// Utility functions for manipulating the DOM
  /// </summary>
}
AjaxControlToolkit._DomUtility.prototype = {
  isDescendant: function (ancestor, descendant) {
    /// <summary>
    /// Whether the specified element is a descendant of the ancestor
    /// </summary>
    /// <param name="ancestor" type="Sys.UI.DomElement">Ancestor node</param>
    /// <param name="descendant" type="Sys.UI.DomElement">Possible descendant node</param>
    /// <returns type="Boolean" />

    for (var n = descendant.parentNode; n != null; n = n.parentNode) {
      if (n == ancestor) return true;
    }
    return false;
  },
  isDescendantOrSelf: function (ancestor, descendant) {
    /// <summary>
    /// Whether the specified element is a descendant of the ancestor or the same as the ancestor
    /// </summary>
    /// <param name="ancestor" type="Sys.UI.DomElement">Ancestor node</param>
    /// <param name="descendant" type="Sys.UI.DomElement">Possible descendant node</param>
    /// <returns type="Boolean" />

    if (ancestor === descendant)
      return true;
    return AjaxControlToolkit.DomUtility.isDescendant(ancestor, descendant);
  },
  isAncestor: function (descendant, ancestor) {
    /// <summary>
    /// Whether the specified element is an ancestor of the descendant
    /// </summary>
    /// <param name="descendant" type="Sys.UI.DomElement">Descendant node</param>
    /// <param name="ancestor" type="Sys.UI.DomElement">Possible ancestor node</param>
    /// <returns type="Boolean" />

    return AjaxControlToolkit.DomUtility.isDescendant(ancestor, descendant);
  },
  isAncestorOrSelf: function (descendant, ancestor) {
    /// <summary>
    /// Whether the specified element is an ancestor of the descendant or the same as the descendant
    /// </summary>
    /// <param name="descendant" type="Sys.UI.DomElement">Descendant node</param>
    /// <param name="ancestor" type="Sys.UI.DomElement">Possible ancestor node</param>
    /// <returns type="Boolean" />

    if (descendant === ancestor)
      return true;

    return AjaxControlToolkit.DomUtility.isDescendant(ancestor, descendant);
  },
  isSibling: function (self, sibling) {
    /// <summary>
    /// Whether the specified element is a sibling of the self element
    /// </summary>
    /// <param name="self" type="Sys.UI.DomElement">Self node</param>
    /// <param name="sibling" type="Sys.UI.DomElement">Possible sibling node</param>
    /// <returns type="Boolean" />

    var parent = self.parentNode;
    for (var i = 0; i < parent.childNodes.length; i++) {
      if (parent.childNodes[i] == sibling) return true;
    }
    return false;
  }
}
AjaxControlToolkit._DomUtility.registerClass("AjaxControlToolkit._DomUtility");
AjaxControlToolkit.DomUtility = new AjaxControlToolkit._DomUtility();


AjaxControlToolkit.TextBoxWrapper = function (element) {
  /// <summary>
  /// Class that wraps a TextBox (INPUT type="text") to abstract-out the
  /// presence of a watermark (which may be visible to the user but which
  /// should never be read by script.
  /// </summary>
  /// <param name="element" type="Sys.UI.DomElement" domElement="true">
  /// The DOM element the behavior is associated with
  /// </param>
  AjaxControlToolkit.TextBoxWrapper.initializeBase(this, [element]);
  this._current = element.value;
  this._watermark = null;
  this._isWatermarked = false;
}

AjaxControlToolkit.TextBoxWrapper.prototype = {

  dispose: function () {
    /// <summary>
    /// Dispose the behavior
    /// </summary>
    this.get_element().AjaxControlToolkitTextBoxWrapper = null;
    AjaxControlToolkit.TextBoxWrapper.callBaseMethod(this, 'dispose');
  },

  get_Current: function () {
    /// <value type="String">
    /// Current value actually in the TextBox (i.e., TextBox.value)
    /// </value>
    this._current = this.get_element().value;
    return this._current;
  },
  set_Current: function (value) {
    this._current = value;
    this._updateElement();
  },

  get_Value: function () {
    /// <value type="String">
    /// Conceptual "value" of the TextBox - its contents if no watermark is present
    /// or "" if one is
    /// </value>
    if (this.get_IsWatermarked()) {
      return "";
    } else {
      return this.get_Current();
    }
  },
  set_Value: function (text) {
    this.set_Current(text);
    if (!text || (0 == text.length)) {
      if (null != this._watermark) {
        this.set_IsWatermarked(true);
      }
    } else {
      this.set_IsWatermarked(false);
    }
  },

  get_Watermark: function () {
    /// <value type="String">
    /// Text of the watermark for the TextBox
    /// </value>
    return this._watermark;
  },
  set_Watermark: function (value) {
    this._watermark = value;
    this._updateElement();
  },

  get_IsWatermarked: function () {
    /// <value type="Boolean">
    /// true iff the TextBox is watermarked
    /// </value>
    return this._isWatermarked;
  },
  set_IsWatermarked: function (isWatermarked) {
    if (this._isWatermarked != isWatermarked) {
      this._isWatermarked = isWatermarked;
      this._updateElement();
      this._raiseWatermarkChanged();
    }
  },

  _updateElement: function () {
    /// <summary>
    /// Updates the actual contents of the TextBox according to what should be there
    /// </summary>
    var element = this.get_element();
    if (this._isWatermarked) {
      if (element.value != this._watermark) {
        element.value = this._watermark;
      }
    } else {
      if (element.value != this._current) {
        element.value = this._current;
      }
    }
  },

  add_WatermarkChanged: function (handler) {
    /// <summary>
    /// Adds a handler for the WatermarkChanged event
    /// </summary>
    /// <param name="handler" type="Function">
    /// Handler
    /// </param>
    this.get_events().addHandler("WatermarkChanged", handler);
  },
  remove_WatermarkChanged: function (handler) {
    /// <summary>
    /// Removes a handler for the WatermarkChanged event
    /// </summary>
    /// <param name="handler" type="Function">
    /// Handler
    /// </param>
    this.get_events().removeHandler("WatermarkChanged", handler);
  },
  _raiseWatermarkChanged: function () {
    /// <summary>
    /// Raises the WatermarkChanged event
    /// </summary>
    var onWatermarkChangedHandler = this.get_events().getHandler("WatermarkChanged");
    if (onWatermarkChangedHandler) {
      onWatermarkChangedHandler(this, Sys.EventArgs.Empty);
    }
  }
}
AjaxControlToolkit.TextBoxWrapper.get_Wrapper = function (element) {
  /// <summary>
  /// Gets (creating one if necessary) the TextBoxWrapper for the specified TextBox
  /// </summary>
  /// <param name="element" type="Sys.UI.DomElement" domElement="true">
  /// TextBox for which to get the wrapper
  /// </param>
  /// <returns type="AjaxControlToolkit.TextBoxWrapper">
  /// TextBoxWrapper instance
  /// </returns>
  if (null == element.AjaxControlToolkitTextBoxWrapper) {
    element.AjaxControlToolkitTextBoxWrapper = new AjaxControlToolkit.TextBoxWrapper(element);
  }
  return element.AjaxControlToolkitTextBoxWrapper;
}
AjaxControlToolkit.TextBoxWrapper.registerClass('AjaxControlToolkit.TextBoxWrapper', Sys.UI.Behavior);

AjaxControlToolkit.TextBoxWrapper.validatorGetValue = function (id) {
  /// <summary>
  /// Wrapper for ASP.NET's validatorGetValue to return the value from the wrapper if present
  /// </summary>
  /// <param name="id" type="String">
  /// id of the element
  /// </param>
  /// <returns type="Object">
  /// Value from the wrapper or result of original ValidatorGetValue
  /// </returns>
  var control = $get(id);
  if (control && control.AjaxControlToolkitTextBoxWrapper) {
    return control.AjaxControlToolkitTextBoxWrapper.get_Value();
  }
  return AjaxControlToolkit.TextBoxWrapper._originalValidatorGetValue(id);
}

// Wrap ASP.NET's ValidatorGetValue with AjaxControlToolkit.TextBoxWrapper.validatorGetValue
// to make validators work properly with watermarked TextBoxes
if (typeof (ValidatorGetValue) == 'function') {
  AjaxControlToolkit.TextBoxWrapper._originalValidatorGetValue = ValidatorGetValue;
  ValidatorGetValue = AjaxControlToolkit.TextBoxWrapper.validatorGetValue;
}


// Temporary fix null reference bug in Sys.CultureInfo._getAbbrMonthIndex
if (Sys.CultureInfo.prototype._getAbbrMonthIndex) {
  try {
    Sys.CultureInfo.prototype._getAbbrMonthIndex('');
  } catch (ex) {
    Sys.CultureInfo.prototype._getAbbrMonthIndex = function (value) {
      if (!this._upperAbbrMonths) {
        this._upperAbbrMonths = this._toUpperArray(this.dateTimeFormat.AbbreviatedMonthNames);
      }
      return Array.indexOf(this._upperAbbrMonths, this._toUpper(value));
    }
    Sys.CultureInfo.CurrentCulture._getAbbrMonthIndex = Sys.CultureInfo.prototype._getAbbrMonthIndex;
    Sys.CultureInfo.InvariantCulture._getAbbrMonthIndex = Sys.CultureInfo.prototype._getAbbrMonthIndex;
  }
}

///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\atlastoolkit\BaseScripts.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />


Type.registerNamespace('AjaxControlToolkit');

// This is the base behavior for all extender behaviors
AjaxControlToolkit.BehaviorBase = function (element) {
  /// <summary>
  /// Base behavior for all extender behaviors
  /// </summary>
  /// <param name="element" type="Sys.UI.DomElement" domElement="true">
  /// Element the behavior is associated with
  /// </param>
  AjaxControlToolkit.BehaviorBase.initializeBase(this, [element]);

  this._clientStateFieldID = null;
  this._pageRequestManager = null;
  this._partialUpdateBeginRequestHandler = null;
  this._partialUpdateEndRequestHandler = null;
};
AjaxControlToolkit.BehaviorBase.prototype = {
  initialize: function () {
    /// <summary>
    /// Initialize the behavior
    /// </summary>

    // TODO: Evaluate necessity
    AjaxControlToolkit.BehaviorBase.callBaseMethod(this, 'initialize');
  },

  dispose: function () {
    /// <summary>
    /// Dispose the behavior
    /// </summary>
    AjaxControlToolkit.BehaviorBase.callBaseMethod(this, 'dispose');

    if (this._pageRequestManager) {
      if (this._partialUpdateBeginRequestHandler) {
        this._pageRequestManager.remove_beginRequest(this._partialUpdateBeginRequestHandler);
        this._partialUpdateBeginRequestHandler = null;
      }
      if (this._partialUpdateEndRequestHandler) {
        this._pageRequestManager.remove_endRequest(this._partialUpdateEndRequestHandler);
        this._partialUpdateEndRequestHandler = null;
      }
      this._pageRequestManager = null;
    }
  },

  get_ClientStateFieldID: function () {
    /// <value type="String">
    /// ID of the hidden field used to store client state
    /// </value>
    return this._clientStateFieldID;
  },
  set_ClientStateFieldID: function (value) {
    if (this._clientStateFieldID != value) {
      this._clientStateFieldID = value;
      this.raisePropertyChanged('ClientStateFieldID');
    }
  },

  get_ClientState: function () {
    /// <value type="String">
    /// Client state
    /// </value>
    if (this._clientStateFieldID) {
      var input = document.getElementById(this._clientStateFieldID);
      if (input) {
        return input.value;
      }
    }
    return null;
  },
  set_ClientState: function (value) {
    if (this._clientStateFieldID) {
      var input = document.getElementById(this._clientStateFieldID);
      if (input) {
        input.value = value;
      }
    }
  },

  registerPartialUpdateEvents: function () {
    /// <summary>
    /// Register for beginRequest and endRequest events on the PageRequestManager,
    /// (which cause _partialUpdateBeginRequest and _partialUpdateEndRequest to be
    /// called when an UpdatePanel refreshes)
    /// </summary>

    if (Sys && Sys.WebForms && Sys.WebForms.PageRequestManager) {
      this._pageRequestManager = Sys.WebForms.PageRequestManager.getInstance();
      if (this._pageRequestManager) {
        this._partialUpdateBeginRequestHandler = Function.createDelegate(this, this._partialUpdateBeginRequest);
        this._pageRequestManager.add_beginRequest(this._partialUpdateBeginRequestHandler);
        this._partialUpdateEndRequestHandler = Function.createDelegate(this, this._partialUpdateEndRequest);
        this._pageRequestManager.add_endRequest(this._partialUpdateEndRequestHandler);
      }
    }
  },

  _partialUpdateBeginRequest: function (sender, beginRequestEventArgs) {
    /// <summary>
    /// Method that will be called when a partial update (via an UpdatePanel) begins,
    /// if registerPartialUpdateEvents() has been called.
    /// </summary>
    /// <param name="sender" type="Object">
    /// Sender
    /// </param>
    /// <param name="beginRequestEventArgs" type="Sys.WebForms.BeginRequestEventArgs">
    /// Event arguments
    /// </param>

    // Nothing done here; override this method in a child class
  },

  _partialUpdateEndRequest: function (sender, endRequestEventArgs) {
    /// <summary>
    /// Method that will be called when a partial update (via an UpdatePanel) finishes,
    /// if registerPartialUpdateEvents() has been called.
    /// </summary>
    /// <param name="sender" type="Object">
    /// Sender
    /// </param>
    /// <param name="endRequestEventArgs" type="Sys.WebForms.EndRequestEventArgs">
    /// Event arguments
    /// </param>

    // Nothing done here; override this method in a child class
  }
};
AjaxControlToolkit.BehaviorBase.registerClass('AjaxControlToolkit.BehaviorBase', Sys.UI.Behavior);


// Dynamically populates content when the populate method is called
AjaxControlToolkit.DynamicPopulateBehaviorBase = function (element) {
  /// <summary>
  /// DynamicPopulateBehaviorBase is used to add DynamicPopulateBehavior funcitonality
  /// to other extenders.  It will dynamically populate the contents of the target element
  /// when its populate method is called.
  /// </summary>
  /// <param name="element" type="Sys.UI.DomElement" domElement="true">
  /// DOM Element the behavior is associated with
  /// </param>
  AjaxControlToolkit.DynamicPopulateBehaviorBase.initializeBase(this, [element]);

  this._DynamicControlID = null;
  this._DynamicContextKey = null;
  this._DynamicServicePath = null;
  this._DynamicServiceMethod = null;
  this._cacheDynamicResults = false;
  this._dynamicPopulateBehavior = null;
  this._populatingHandler = null;
  this._populatedHandler = null;
};
AjaxControlToolkit.DynamicPopulateBehaviorBase.prototype = {
  initialize: function () {
    /// <summary>
    /// Initialize the behavior
    /// </summary>

    AjaxControlToolkit.DynamicPopulateBehaviorBase.callBaseMethod(this, 'initialize');

    // Create event handlers
    this._populatingHandler = Function.createDelegate(this, this._onPopulating);
    this._populatedHandler = Function.createDelegate(this, this._onPopulated);
  },

  dispose: function () {
    /// <summary>
    /// Dispose the behavior
    /// </summary>

    // Dispose of event handlers
    if (this._populatedHandler) {
      if (this._dynamicPopulateBehavior) {
        this._dynamicPopulateBehavior.remove_populated(this._populatedHandler);
      }
      this._populatedHandler = null;
    }
    if (this._populatingHandler) {
      if (this._dynamicPopulateBehavior) {
        this._dynamicPopulateBehavior.remove_populating(this._populatingHandler);
      }
      this._populatingHandler = null;
    }

    // Dispose of the placeholder control and behavior
    if (this._dynamicPopulateBehavior) {
      this._dynamicPopulateBehavior.dispose();
      this._dynamicPopulateBehavior = null;
    }
    AjaxControlToolkit.DynamicPopulateBehaviorBase.callBaseMethod(this, 'dispose');
  },

  populate: function (contextKeyOverride) {
    /// <summary>
    /// Demand-create the DynamicPopulateBehavior and use it to populate the target element
    /// </summary>
    /// <param name="contextKeyOverride" type="String" mayBeNull="true" optional="true">
    /// An arbitrary string value to be passed to the web method. For example, if the element to be populated is within a data-bound repeater, this could be the ID of the current row.
    /// </param>

    // If the DynamicPopulateBehavior's element is out of date, dispose of it
    if (this._dynamicPopulateBehavior && (this._dynamicPopulateBehavior.get_element() != $get(this._DynamicControlID))) {
      this._dynamicPopulateBehavior.dispose();
      this._dynamicPopulateBehavior = null;
    }

    // If a DynamicPopulateBehavior is not available and the necessary information is, create one
    if (!this._dynamicPopulateBehavior && this._DynamicControlID && this._DynamicServiceMethod) {
      this._dynamicPopulateBehavior = $create(AjaxControlToolkit.DynamicPopulateBehavior,
          {
            "id": this.get_id() + "_DynamicPopulateBehavior",
            "ContextKey": this._DynamicContextKey,
            "ServicePath": this._DynamicServicePath,
            "ServiceMethod": this._DynamicServiceMethod,
            "cacheDynamicResults": this._cacheDynamicResults
          }, null, null, $get(this._DynamicControlID));

      // Attach event handlers
      this._dynamicPopulateBehavior.add_populating(this._populatingHandler);
      this._dynamicPopulateBehavior.add_populated(this._populatedHandler);
    }

    // If a DynamicPopulateBehavior is available, use it to populate the dynamic content
    if (this._dynamicPopulateBehavior) {
      this._dynamicPopulateBehavior.populate(contextKeyOverride ? contextKeyOverride : this._DynamicContextKey);
    }
  },

  _onPopulating: function (sender, eventArgs) {
    /// <summary>
    /// Handler for DynamicPopulate behavior's Populating event
    /// </summary>
    /// <param name="sender" type="Object">
    /// DynamicPopulate behavior
    /// </param>
    /// <param name="eventArgs" type="Sys.CancelEventArgs" mayBeNull="false">
    /// Event args
    /// </param>
    this.raisePopulating(eventArgs);
  },

  _onPopulated: function (sender, eventArgs) {
    /// <summary>
    /// Handler for DynamicPopulate behavior's Populated event
    /// </summary>
    /// <param name="sender" type="Object">
    /// DynamicPopulate behavior
    /// </param>
    /// <param name="eventArgs" type="Sys.EventArgs" mayBeNull="false">
    /// Event args
    /// </param>
    this.raisePopulated(eventArgs);
  },

  get_dynamicControlID: function () {
    /// <value type="String">
    /// ID of the element to populate with dynamic content
    /// </value>
    return this._DynamicControlID;
  },
  get_DynamicControlID: this.get_dynamicControlID,
  set_dynamicControlID: function (value) {
    if (this._DynamicControlID != value) {
      this._DynamicControlID = value;
      this.raisePropertyChanged('dynamicControlID');
      this.raisePropertyChanged('DynamicControlID');
    }
  },
  set_DynamicControlID: this.set_dynamicControlID,

  get_dynamicContextKey: function () {
    /// <value type="String">
    /// An arbitrary string value to be passed to the web method.
    /// For example, if the element to be populated is within a
    /// data-bound repeater, this could be the ID of the current row.
    /// </value>
    return this._DynamicContextKey;
  },
  get_DynamicContextKey: this.get_dynamicContextKey,
  set_dynamicContextKey: function (value) {
    if (this._DynamicContextKey != value) {
      this._DynamicContextKey = value;
      this.raisePropertyChanged('dynamicContextKey');
      this.raisePropertyChanged('DynamicContextKey');
    }
  },
  set_DynamicContextKey: this.set_dynamicContextKey,

  get_dynamicServicePath: function () {
    /// <value type="String" mayBeNull="true" optional="true">
    /// The URL of the web service to call.  If the ServicePath is not defined, then we will invoke a PageMethod instead of a web service.
    /// </value>
    return this._DynamicServicePath;
  },
  get_DynamicServicePath: this.get_dynamicServicePath,
  set_dynamicServicePath: function (value) {
    if (this._DynamicServicePath != value) {
      this._DynamicServicePath = value;
      this.raisePropertyChanged('dynamicServicePath');
      this.raisePropertyChanged('DynamicServicePath');
    }
  },
  set_DynamicServicePath: this.set_dynamicServicePath,

  get_dynamicServiceMethod: function () {
    /// <value type="String">
    /// The name of the method to call on the page or web service
    /// </value>
    /// <remarks>
    /// The signature of the method must exactly match the following:
    ///     [WebMethod]
    ///     string DynamicPopulateMethod(string contextKey)
    ///     {
    ///         ...
    ///     }
    /// </remarks>
    return this._DynamicServiceMethod;
  },
  get_DynamicServiceMethod: this.get_dynamicServiceMethod,
  set_dynamicServiceMethod: function (value) {
    if (this._DynamicServiceMethod != value) {
      this._DynamicServiceMethod = value;
      this.raisePropertyChanged('dynamicServiceMethod');
      this.raisePropertyChanged('DynamicServiceMethod');
    }
  },
  set_DynamicServiceMethod: this.set_dynamicServiceMethod,

  get_cacheDynamicResults: function () {
    /// <value type="Boolean" mayBeNull="false">
    /// Whether the results of the dynamic population should be cached and
    /// not fetched again after the first load
    /// </value>
    return this._cacheDynamicResults;
  },
  set_cacheDynamicResults: function (value) {
    if (this._cacheDynamicResults != value) {
      this._cacheDynamicResults = value;
      this.raisePropertyChanged('cacheDynamicResults');
    }
  },

  add_populated: function (handler) {
    /// <summary>
    /// Add a handler on the populated event
    /// </summary>
    /// <param name="handler" type="Function">
    /// Handler
    /// </param>
    this.get_events().addHandler("populated", handler);
  },
  remove_populated: function (handler) {
    /// <summary>
    /// Remove a handler from the populated event
    /// </summary>
    /// <param name="handler" type="Function">
    /// Handler
    /// </param>
    this.get_events().removeHandler("populated", handler);
  },
  raisePopulated: function (arg) {
    /// <summary>
    /// Raise the populated event
    /// </summary>
    /// <param name="arg" type="Sys.EventArgs">
    /// Event arguments
    /// </param>
    var handler = this.get_events().getHandler("populated");
    if (handler) handler(this, arg);
  },

  add_populating: function (handler) {
    /// <summary>
    /// Add an event handler for the populating event
    /// </summary>
    /// <param name="handler" type="Function" mayBeNull="false">
    /// Event handler
    /// </param>
    /// <returns />
    this.get_events().addHandler('populating', handler);
  },
  remove_populating: function (handler) {
    /// <summary>
    /// Remove an event handler from the populating event
    /// </summary>
    /// <param name="handler" type="Function" mayBeNull="false">
    /// Event handler
    /// </param>
    /// <returns />
    this.get_events().removeHandler('populating', handler);
  },
  raisePopulating: function (eventArgs) {
    /// <summary>
    /// Raise the populating event
    /// </summary>
    /// <param name="eventArgs" type="Sys.CancelEventArgs" mayBeNull="false">
    /// Event arguments for the populating event
    /// </param>
    /// <returns />

    var handler = this.get_events().getHandler('populating');
    if (handler) {
      handler(this, eventArgs);
    }
  }
};
AjaxControlToolkit.DynamicPopulateBehaviorBase.registerClass('AjaxControlToolkit.DynamicPopulateBehaviorBase', AjaxControlToolkit.BehaviorBase);


AjaxControlToolkit.ControlBase = function (element) {
  AjaxControlToolkit.ControlBase.initializeBase(this, [element]);
  this._clientStateField = null;
  this._callbackTarget = null;
  this._onsubmit$delegate = Function.createDelegate(this, this._onsubmit);
  this._oncomplete$delegate = Function.createDelegate(this, this._oncomplete);
  this._onerror$delegate = Function.createDelegate(this, this._onerror);
};
AjaxControlToolkit.ControlBase.prototype = {
  initialize: function () {
    AjaxControlToolkit.ControlBase.callBaseMethod(this, "initialize");
    // load the client state if possible
    if (this._clientStateField) {
      this.loadClientState(this._clientStateField.value);
    }
    // attach an event to save the client state before a postback or updatepanel partial postback
    if (typeof (Sys.WebForms) !== "undefined" && typeof (Sys.WebForms.PageRequestManager) !== "undefined") {
      Array.add(Sys.WebForms.PageRequestManager.getInstance()._onSubmitStatements, this._onsubmit$delegate);
    } else {
      $addHandler(document.forms[0], "submit", this._onsubmit$delegate);
    }
  },
  dispose: function () {
    if (typeof (Sys.WebForms) !== "undefined" && typeof (Sys.WebForms.PageRequestManager) !== "undefined") {
      Array.remove(Sys.WebForms.PageRequestManager.getInstance()._onSubmitStatements, this._onsubmit$delegate);
    } else {
      $removeHandler(document.forms[0], "submit", this._onsubmit$delegate);
    }
    AjaxControlToolkit.ControlBase.callBaseMethod(this, "dispose");
  },
  findElement: function (id) {
    // <summary>Finds an element within this control (ScriptControl/ScriptUserControl are NamingContainers);
    return $get(this.get_id() + '_' + id.split(':').join('_'));
  },
  get_clientStateField: function () {
    return this._clientStateField;
  },
  set_clientStateField: function (value) {
    if (this.get_isInitialized()) throw Error.invalidOperation(AjaxControlToolkit.Resources.ExtenderBase_CannotSetClientStateField);
    if (this._clientStateField != value) {
      this._clientStateField = value;
      this.raisePropertyChanged('clientStateField');
    }
  },
  loadClientState: function (value) {
    /// <remarks>override this method to intercept client state loading after a callback</remarks>
  },
  saveClientState: function () {
    /// <remarks>override this method to intercept client state acquisition before a callback</remarks>
    return null;
  },
  _invoke: function (name, args, cb) {
    /// <summary>invokes a callback method on the server control</summary>        
    if (!this._callbackTarget) {
      throw Error.invalidOperation(AjaxControlToolkit.Resources.ExtenderBase_ControlNotRegisteredForCallbacks);
    }
    if (typeof (WebForm_DoCallback) === "undefined") {
      throw Error.invalidOperation(AjaxControlToolkit.Resources.ExtenderBase_PageNotRegisteredForCallbacks);
    }
    var ar = [];
    for (var i = 0; i < args.length; i++)
      ar[i] = args[i];
    var clientState = this.saveClientState();
    if (clientState != null && !String.isInstanceOfType(clientState)) {
      throw Error.invalidOperation(AjaxControlToolkit.Resources.ExtenderBase_InvalidClientStateType);
    }
    var payload = Sys.Serialization.JavaScriptSerializer.serialize({ name: name, args: ar, state: this.saveClientState() });
    WebForm_DoCallback(this._callbackTarget, payload, this._oncomplete$delegate, cb, this._onerror$delegate, true);
  },
  _oncomplete: function (result, context) {
    result = Sys.Serialization.JavaScriptSerializer.deserialize(result);
    if (result.error) {
      throw Error.create(result.error);
    }
    this.loadClientState(result.state);
    context(result.result);
  },
  _onerror: function (message, context) {
    throw Error.create(message);
  },
  _onsubmit: function () {
    if (this._clientStateField) {
      this._clientStateField.value = this.saveClientState();
    }
    return true;
  }

};
AjaxControlToolkit.ControlBase.registerClass("AjaxControlToolkit.ControlBase", Sys.UI.Control);

///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\atlastoolkit\DragDropScripts.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../../Common/Common.js" />
/// <reference path="../Timer/Timer.js" />


///////////////////////////////////////////////////////////////////////////////
// IDropSource

Type.registerNamespace('AjaxControlToolkit');

AjaxControlToolkit.IDragSource = function () {
};
AjaxControlToolkit.IDragSource.prototype = {
  // Type get_dragDataType()
  get_dragDataType: function () { throw Error.notImplemented(); },
  // Object getDragData(Context)
  getDragData: function () { throw Error.notImplemented(); },
  // DragMode get_dragMode()
  get_dragMode: function () { throw Error.notImplemented(); },
  // void onDragStart()
  onDragStart: function () { throw Error.notImplemented(); },
  // void onDrag()
  onDrag: function () { throw Error.notImplemented(); },
  // void onDragEnd(Cancelled)
  onDragEnd: function () { throw Error.notImplemented(); }
};
AjaxControlToolkit.IDragSource.registerInterface('AjaxControlToolkit.IDragSource');

///////////////////////////////////////////////////////////////////////////////
// IDropTarget
AjaxControlToolkit.IDropTarget = function () {
};
AjaxControlToolkit.IDropTarget.prototype = {
  get_dropTargetElement: function () { throw Error.notImplemented(); },
  // bool canDrop(DragMode, DataType, Data)
  canDrop: function () { throw Error.notImplemented(); },
  // void drop(DragMode, DataType, Data)
  drop: function () { throw Error.notImplemented(); },
  // void onDragEnterTarget(DragMode, DataType, Data)
  onDragEnterTarget: function () { throw Error.notImplemented(); },
  // void onDragLeaveTarget(DragMode, DataType, Data)
  onDragLeaveTarget: function () { throw Error.notImplemented(); },
  // void onDragInTarget(DragMode, DataType, Data)
  onDragInTarget: function () { throw Error.notImplemented(); }
};
AjaxControlToolkit.IDropTarget.registerInterface('AjaxControlToolkit.IDropTarget');

///////////////////////////////////////////////
// DragMode
//

AjaxControlToolkit.DragMode = function () {
  throw Error.invalidOperation();
};
AjaxControlToolkit.DragMode.prototype = {
  Copy: 0,
  Move: 1
};
AjaxControlToolkit.DragMode.registerEnum('AjaxControlToolkit.DragMode');

////////////////////////////////////////////////////////////////////
// DragDropEventArgs
//

AjaxControlToolkit.DragDropEventArgs = function (dragMode, dragDataType, dragData) {
  this._dragMode = dragMode;
  this._dataType = dragDataType;
  this._data = dragData;
};
AjaxControlToolkit.DragDropEventArgs.prototype = {
  get_dragMode: function () {
    return this._dragMode || null;
  },
  get_dragDataType: function () {
    return this._dataType || null;
  },
  get_dragData: function () {
    return this._data || null;
  }
};
AjaxControlToolkit.DragDropEventArgs.registerClass('AjaxControlToolkit.DragDropEventArgs');


AjaxControlToolkit._DragDropManager = function () {
  this._instance = null;
  this._events = null;
};
AjaxControlToolkit._DragDropManager.prototype = {

  add_dragStart: function (handler) {
    this.get_events().addHandler('dragStart', handler);
  },
  remove_dragStart: function (handler) {
    this.get_events().removeHandler('dragStart', handler);
  },

  get_events: function () {
    // todo: doc comments. this one is commented out (two //) due to a bug with the preprocessor.
    // <value type="Sys.EventHandlerList">
    // </value>
    if (!this._events) {
      this._events = new Sys.EventHandlerList();
    }
    return this._events;
  },

  add_dragStop: function (handler) {
    this.get_events().addHandler('dragStop', handler);
  },
  remove_dragStop: function (handler) {
    this.get_events().removeHandler('dragStop', handler);
  },

  _getInstance: function () {
    if (!this._instance) {
      //if (false) {
      if (Sys.Browser.agent === Sys.Browser.InternetExplorer && Sys.Browser.version < 10) {
        this._instance = new AjaxControlToolkit.IEDragDropManager();
      }
      else {
        this._instance = new AjaxControlToolkit.GenericDragDropManager();
      }
      this._instance.initialize();
      this._instance.add_dragStart(Function.createDelegate(this, this._raiseDragStart));
      this._instance.add_dragStop(Function.createDelegate(this, this._raiseDragStop));
    }
    return this._instance;
  },

  startDragDrop: function (dragSource, dragVisual, context) {
    this._getInstance().startDragDrop(dragSource, dragVisual, context);
  },

  registerDropTarget: function (target) {
    this._getInstance().registerDropTarget(target);
  },

  unregisterDropTarget: function (target) {
    this._getInstance().unregisterDropTarget(target);
  },

  dispose: function () {
    delete this._events;
    Sys.Application.unregisterDisposableObject(this);
    Sys.Application.removeComponent(this);
  },

  _raiseDragStart: function (sender, eventArgs) {
    var handler = this.get_events().getHandler('dragStart');
    if (handler) {
      handler(this, eventArgs);
    }
  },

  _raiseDragStop: function (sender, eventArgs) {
    var handler = this.get_events().getHandler('dragStop');
    if (handler) {
      handler(this, eventArgs);
    }
  }
};
AjaxControlToolkit._DragDropManager.registerClass('AjaxControlToolkit._DragDropManager');
AjaxControlToolkit.DragDropManager = new AjaxControlToolkit._DragDropManager();


AjaxControlToolkit.IEDragDropManager = function () {
  AjaxControlToolkit.IEDragDropManager.initializeBase(this);

  this._dropTargets = null;
  // Radius of the cursor used to determine what drop target we 
  // are hovering. Anything below the cursor's zone may be a 
  // potential drop target.
  this._radius = 10;
  this._activeDragVisual = null;
  this._activeContext = null;
  this._activeDragSource = null;
  this._underlyingTarget = null;
  this._oldOffset = null;
  this._potentialTarget = null;
  this._isDragging = false;
  this._mouseUpHandler = null;
  this._documentMouseMoveHandler = null;
  this._documentDragOverHandler = null;
  this._dragStartHandler = null;
  this._mouseMoveHandler = null;
  this._dragEnterHandler = null;
  this._dragLeaveHandler = null;
  this._dragOverHandler = null;
  this._dropHandler = null;
};
AjaxControlToolkit.IEDragDropManager.prototype = {

  add_dragStart: function (handler) {
    this.get_events().addHandler("dragStart", handler);
  },

  remove_dragStart: function (handler) {
    this.get_events().removeHandler("dragStart", handler);
  },

  add_dragStop: function (handler) {
    this.get_events().addHandler("dragStop", handler);
  },

  remove_dragStop: function (handler) {
    this.get_events().removeHandler("dragStop", handler);
  },

  initialize: function () {
    AjaxControlToolkit.IEDragDropManager.callBaseMethod(this, 'initialize');
    this._mouseUpHandler = Function.createDelegate(this, this._onMouseUp);
    this._documentMouseMoveHandler = Function.createDelegate(this, this._onDocumentMouseMove);
    this._documentDragOverHandler = Function.createDelegate(this, this._onDocumentDragOver);
    this._dragStartHandler = Function.createDelegate(this, this._onDragStart);
    this._mouseMoveHandler = Function.createDelegate(this, this._onMouseMove);
    this._dragEnterHandler = Function.createDelegate(this, this._onDragEnter);
    this._dragLeaveHandler = Function.createDelegate(this, this._onDragLeave);
    this._dragOverHandler = Function.createDelegate(this, this._onDragOver);
    this._dropHandler = Function.createDelegate(this, this._onDrop);
  },


  dispose: function () {
    if (this._dropTargets) {
      for (var i = 0; i < this._dropTargets; i++) {
        this.unregisterDropTarget(this._dropTargets[i]);
      }
      this._dropTargets = null;
    }

    AjaxControlToolkit.IEDragDropManager.callBaseMethod(this, 'dispose');
  },


  startDragDrop: function (dragSource, dragVisual, context) {
    var ev = window._event;

    // Don't allow drag and drop if there is another active drag operation going on.
    if (this._isDragging) {
      return;
    }

    this._underlyingTarget = null;
    this._activeDragSource = dragSource;
    this._activeDragVisual = dragVisual;
    this._activeContext = context;

    var mousePosition = { x: ev.clientX, y: ev.clientY };

    // By default we use absolute positioning, unless a different type 
    // of positioning is set explicitly.
    dragVisual.originalPosition = dragVisual.style.position;
    dragVisual.style.position = "absolute";

    document._lastPosition = mousePosition;
    dragVisual.startingPoint = mousePosition;
    var scrollOffset = this.getScrollOffset(dragVisual, /* recursive */ true);

    dragVisual.startingPoint = this.addPoints(dragVisual.startingPoint, scrollOffset);

    if (dragVisual.style.position == "absolute") {
      dragVisual.startingPoint = this.subtractPoints(dragVisual.startingPoint, $common.getLocation(dragVisual));
    }
    else {
      var left = parseInt(dragVisual.style.left);
      var top = parseInt(dragVisual.style.top);
      if (isNaN(left)) left = "0";
      if (isNaN(top)) top = "0";

      dragVisual.startingPoint = this.subtractPoints(dragVisual.startingPoint, { x: left, y: top });
    }

    // Monitor DOM changes.
    this._prepareForDomChanges();
    dragSource.onDragStart();
    var eventArgs = new AjaxControlToolkit.DragDropEventArgs(
        dragSource.get_dragMode(),
        dragSource.get_dragDataType(),
        dragSource.getDragData(context));
    var handler = this.get_events().getHandler('dragStart');
    if (handler) handler(this, eventArgs);
    this._recoverFromDomChanges();

    this._wireEvents();

    this._drag(/* isInitialDrag */ true);
  },


  _stopDragDrop: function (cancelled) {
    var ev = window._event;
    if (this._activeDragSource != null) {
      this._unwireEvents();

      if (!cancelled) {
        // The drag operation is cancelled if there 
        // is no drop target.
        cancelled = (this._underlyingTarget == null);
      }

      if (!cancelled && this._underlyingTarget != null) {
        this._underlyingTarget.drop(this._activeDragSource.get_dragMode(), this._activeDragSource.get_dragDataType(),
            this._activeDragSource.getDragData(this._activeContext));
      }

      this._activeDragSource.onDragEnd(cancelled);
      var handler = this.get_events().getHandler('dragStop');
      if (handler) handler(this, Sys.EventArgs.Empty);

      this._activeDragVisual.style.position = this._activeDragVisual.originalPosition;

      this._activeDragSource = null;
      this._activeContext = null;
      this._activeDragVisual = null;
      this._isDragging = false;
      this._potentialTarget = null;
      ev.preventDefault();
    }
  },

  _drag: function (isInitialDrag) {
    var ev = window._event;
    var mousePosition = { x: ev.clientX, y: ev.clientY };

    // NOTE: We store the event object to be able to determine the current 
    // mouse position in Mozilla in other event handlers such as keydown.
    document._lastPosition = mousePosition;

    var scrollOffset = this.getScrollOffset(this._activeDragVisual, /* recursive */ true);
    var position = this.addPoints(this.subtractPoints(mousePosition, this._activeDragVisual.startingPoint), scrollOffset);

    // Check if the visual moved at all.
    if (!isInitialDrag && parseInt(this._activeDragVisual.style.left) == position.x && parseInt(this._activeDragVisual.style.top) == position.y) {
      return;
    }

    $common.setLocation(this._activeDragVisual, position);

    // Monitor DOM changes.
    this._prepareForDomChanges();
    this._activeDragSource.onDrag();
    this._recoverFromDomChanges();

    // Find a potential target.
    this._potentialTarget = this._findPotentialTarget(this._activeDragSource, this._activeDragVisual);

    var movedToOtherTarget = (this._potentialTarget != this._underlyingTarget || this._potentialTarget == null);
    // Check if we are leaving an underlying target.
    if (movedToOtherTarget && this._underlyingTarget != null) {
      this._leaveTarget(this._activeDragSource, this._underlyingTarget);
    }

    if (this._potentialTarget != null) {
      // Check if we are entering a new target.
      if (movedToOtherTarget) {
        this._underlyingTarget = this._potentialTarget;

        // Enter the new target.
        this._enterTarget(this._activeDragSource, this._underlyingTarget);
      }
      else {
        this._moveInTarget(this._activeDragSource, this._underlyingTarget);
      }
    }
    else {
      this._underlyingTarget = null;
    }
  },


  _wireEvents: function () {
    $addHandler(document, "mouseup", this._mouseUpHandler);
    $addHandler(document, "mousemove", this._documentMouseMoveHandler);
    $addHandler(document.body, "dragover", this._documentDragOverHandler);

    $addHandler(this._activeDragVisual, "dragstart", this._dragStartHandler);
    $addHandler(this._activeDragVisual, "dragend", this._mouseUpHandler);
    $addHandler(this._activeDragVisual, "drag", this._mouseMoveHandler);
  },


  _unwireEvents: function () {
    $removeHandler(this._activeDragVisual, "drag", this._mouseMoveHandler);
    $removeHandler(this._activeDragVisual, "dragend", this._mouseUpHandler);
    $removeHandler(this._activeDragVisual, "dragstart", this._dragStartHandler);

    $removeHandler(document.body, "dragover", this._documentDragOverHandler);
    $removeHandler(document, "mousemove", this._documentMouseMoveHandler);
    $removeHandler(document, "mouseup", this._mouseUpHandler);
  },


  registerDropTarget: function (dropTarget) {
    if (this._dropTargets == null) {
      this._dropTargets = [];
    }
    Array.add(this._dropTargets, dropTarget);

    this._wireDropTargetEvents(dropTarget);
  },


  unregisterDropTarget: function (dropTarget) {
    this._unwireDropTargetEvents(dropTarget);
    if (this._dropTargets) {
      Array.remove(this._dropTargets, dropTarget);
    }
  },


  _wireDropTargetEvents: function (dropTarget) {
    var associatedElement = dropTarget.get_dropTargetElement();
    associatedElement._dropTarget = dropTarget;
    $addHandler(associatedElement, "dragenter", this._dragEnterHandler);
    $addHandler(associatedElement, "dragleave", this._dragLeaveHandler);
    $addHandler(associatedElement, "dragover", this._dragOverHandler);
    $addHandler(associatedElement, "drop", this._dropHandler);
  },


  _unwireDropTargetEvents: function (dropTarget) {
    var associatedElement = dropTarget.get_dropTargetElement();
    // make sure that the handlers are not removed twice
    if (associatedElement._dropTarget) {
      associatedElement._dropTarget = null;
      $removeHandler(associatedElement, "dragenter", this._dragEnterHandler);
      $removeHandler(associatedElement, "dragleave", this._dragLeaveHandler);
      $removeHandler(associatedElement, "dragover", this._dragOverHandler);
      $removeHandler(associatedElement, "drop", this._dropHandler);
    }
  },


  _onDragStart: function (ev) {
    window._event = ev;
    document.selection.empty();

    var dt = ev.dataTransfer;
    if (!dt && ev.rawEvent) dt = ev.rawEvent.dataTransfer;

    var dataType = this._activeDragSource.get_dragDataType().toLowerCase();
    var data = this._activeDragSource.getDragData(this._activeContext);

    if (data) {
      // TODO: How do we want to deal with 'non-compatible types'?
      if (dataType != "text" && dataType != "url") {
        dataType = "text";

        if (data.innerHTML != null) {
          data = data.innerHTML;
        }
      }

      dt.effectAllowed = "move";
      dt.setData(dataType, data.toString());
    }
  },

  _onMouseUp: function (ev) {
    window._event = ev;
    this._stopDragDrop(false);
  },

  _onDocumentMouseMove: function (ev) {
    window._event = ev;
    this._dragDrop();
  },

  _onDocumentDragOver: function (ev) {
    window._event = ev;
    if (this._potentialTarget) ev.preventDefault();
    //ev.returnValue = (_potentialTarget == null);
  },

  _onMouseMove: function (ev) {
    window._event = ev;
    this._drag();
  },

  _onDragEnter: function (ev) {
    window._event = ev;
    if (this._isDragging) {
      ev.preventDefault();
      //ev.returnValue = false;
    }
    else {
      // An external object is dragged to the drop target.
      var dataObjects = AjaxControlToolkit.IEDragDropManager._getDataObjectsForDropTarget(this._getDropTarget(ev.target));
      for (var i = 0; i < dataObjects.length; i++) {
        this._dropTarget.onDragEnterTarget(AjaxControlToolkit.DragMode.Copy, dataObjects[i].type, dataObjects[i].value);
      }
    }
  },

  _onDragLeave: function (ev) {
    window._event = ev;
    if (this._isDragging) {
      ev.preventDefault();
      //ev.returnValue = false;
    }
    else {
      // An external object is dragged to the drop target.
      var dataObjects = AjaxControlToolkit.IEDragDropManager._getDataObjectsForDropTarget(this._getDropTarget(ev.target));
      for (var i = 0; i < dataObjects.length; i++) {
        this._dropTarget.onDragLeaveTarget(AjaxControlToolkit.DragMode.Copy, dataObjects[i].type, dataObjects[i].value);
      }
    }
  },

  _onDragOver: function (ev) {
    window._event = ev;
    if (this._isDragging) {
      ev.preventDefault();
      //ev.returnValue = false;
    }
    else {
      // An external object is dragged over the drop target.
      var dataObjects = AjaxControlToolkit.IEDragDropManager._getDataObjectsForDropTarget(this._getDropTarget(ev.target));
      for (var i = 0; i < dataObjects.length; i++) {
        this._dropTarget.onDragInTarget(AjaxControlToolkit.DragMode.Copy, dataObjects[i].type, dataObjects[i].value);
      }
    }
  },

  _onDrop: function (ev) {
    window._event = ev;
    if (!this._isDragging) {
      // An external object is dropped on the drop target.
      var dataObjects = AjaxControlToolkit.IEDragDropManager._getDataObjectsForDropTarget(this._getDropTarget(ev.target));
      for (var i = 0; i < dataObjects.length; i++) {
        this._dropTarget.drop(AjaxControlToolkit.DragMode.Copy, dataObjects[i].type, dataObjects[i].value);
      }
    }
    ev.preventDefault();
    //ev.returnValue = false;
  },

  _getDropTarget: function (element) {
    while (element) {
      if (element._dropTarget != null) {
        return element._dropTarget;
      }
      element = element.parentNode;
    }
    return null;
  },

  _dragDrop: function () {
    if (this._isDragging) {
      return;
    }

    this._isDragging = true;
    this._activeDragVisual.dragDrop();
    document.selection.empty();
  },

  _moveInTarget: function (dragSource, dropTarget) {
    // Monitor DOM changes.
    this._prepareForDomChanges();
    dropTarget.onDragInTarget(dragSource.get_dragMode(), dragSource.get_dragDataType(), dragSource.getDragData(this._activeContext));
    this._recoverFromDomChanges();
  },

  _enterTarget: function (dragSource, dropTarget) {
    // Monitor DOM changes.
    this._prepareForDomChanges();
    dropTarget.onDragEnterTarget(dragSource.get_dragMode(), dragSource.get_dragDataType(), dragSource.getDragData(this._activeContext));
    this._recoverFromDomChanges();
  },

  _leaveTarget: function (dragSource, dropTarget) {
    // Monitor DOM changes.
    this._prepareForDomChanges();
    dropTarget.onDragLeaveTarget(dragSource.get_dragMode(), dragSource.get_dragDataType(), dragSource.getDragData(this._activeContext));
    this._recoverFromDomChanges();
  },

  _findPotentialTarget: function (dragSource, dragVisual) {
    var ev = window._event;

    if (this._dropTargets == null) {
      return null;
    }

    var type = dragSource.get_dragDataType();
    var mode = dragSource.get_dragMode();
    var data = dragSource.getDragData(this._activeContext);

    // Get the current cursor location.
    var scrollOffset = this.getScrollOffset(document.body, /* recursive */ true);
    var x = ev.clientX + scrollOffset.x;
    var y = ev.clientY + scrollOffset.y;
    var cursorRect = { x: x - this._radius, y: y - this._radius, width: this._radius * 2, height: this._radius * 2 };

    // Find any targets near the current cursor location.
    var targetRect;
    for (var i = 0; i < this._dropTargets.length; i++) {
      targetRect = $common.getBounds(this._dropTargets[i].get_dropTargetElement());
      if ($common.overlaps(cursorRect, targetRect) && this._dropTargets[i].canDrop(mode, type, data)) {
        return this._dropTargets[i];
      }
    }

    return null;
  },

  _prepareForDomChanges: function () {
    this._oldOffset = $common.getLocation(this._activeDragVisual);
  },

  _recoverFromDomChanges: function () {
    var newOffset = $common.getLocation(this._activeDragVisual);
    if (this._oldOffset.x != newOffset.x || this._oldOffset.y != newOffset.y) {
      this._activeDragVisual.startingPoint = this.subtractPoints(this._activeDragVisual.startingPoint, this.subtractPoints(this._oldOffset, newOffset));
      scrollOffset = this.getScrollOffset(this._activeDragVisual, /* recursive */ true);
      var position = this.addPoints(this.subtractPoints(document._lastPosition, this._activeDragVisual.startingPoint), scrollOffset);
      $common.setLocation(this._activeDragVisual, position);
    }
  },

  addPoints: function (p1, p2) {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
  },

  subtractPoints: function (p1, p2) {
    return { x: p1.x - p2.x, y: p1.y - p2.y };
  },

  // -- Drag and drop helper methods.
  getScrollOffset: function (element, recursive) {
    var left = element.scrollLeft;
    var top = element.scrollTop;
    if (recursive) {
      var parent = element.parentNode;
      while (parent != null && parent.scrollLeft != null) {
        left += parent.scrollLeft;
        top += parent.scrollTop;
        // Don't include anything below the body.
        if (parent == document.body && (left != 0 && top != 0))
          break;
        parent = parent.parentNode;
      }
    }
    return { x: left, y: top };
  },

  getBrowserRectangle: function () {
    var width = window.innerWidth;
    var height = window.innerHeight;
    if (width == null) {
      width = document.body.clientWidth;
    }
    if (height == null) {
      height = document.body.clientHeight;
    }

    return { x: 0, y: 0, width: width, height: height };
  },

  getNextSibling: function (item) {
    for (item = item.nextSibling; item != null; item = item.nextSibling) {
      if (item.innerHTML != null) {
        return item;
      }
    }
    return null;
  },

  hasParent: function (element) {
    return (element.parentNode != null && element.parentNode.tagName != null);
  }
};
AjaxControlToolkit.IEDragDropManager.registerClass('AjaxControlToolkit.IEDragDropManager', Sys.Component);

AjaxControlToolkit.IEDragDropManager._getDataObjectsForDropTarget = function (dropTarget) {
  if (dropTarget == null) {
    return [];
  }
  var ev = window._event;
  var dataObjects = [];
  var dataTypes = ["URL", "Text"];
  var data;
  for (var i = 0; i < dataTypes.length; i++) {
    var dt = ev.dataTransfer;
    if (!dt && ev.rawEvent) dt = ev.rawEvent.dataTransfer;
    data = dt.getData(dataTypes[i]);
    if (dropTarget.canDrop(AjaxControlToolkit.DragMode.Copy, dataTypes[i], data)) {
      if (data) {
        Array.add(dataObjects, { type: dataTypes[i], value: data });
      }
    }
  }

  return dataObjects;
};


AjaxControlToolkit.GenericDragDropManager = function () {
  AjaxControlToolkit.GenericDragDropManager.initializeBase(this);

  this._dropTargets = null;
  // Radius of the cursor used to determine what drop target we 
  // are hovering. Anything below the cursor's zone may be a 
  // potential drop target.
  this._scrollEdgeConst = 40;
  this._scrollByConst = 10;
  this._scroller = null;
  this._scrollDeltaX = 0;
  this._scrollDeltaY = 0;
  this._activeDragVisual = null;
  this._activeContext = null;
  this._activeDragSource = null;
  this._oldOffset = null;
  this._potentialTarget = null;
  this._mouseUpHandler = null;
  this._mouseMoveHandler = null;
  this._keyPressHandler = null;
  this._scrollerTickHandler = null;
};
AjaxControlToolkit.GenericDragDropManager.prototype = {

  initialize: function () {
    AjaxControlToolkit.GenericDragDropManager.callBaseMethod(this, "initialize");
    this._mouseUpHandler = Function.createDelegate(this, this._onMouseUp);
    this._mouseMoveHandler = Function.createDelegate(this, this._onMouseMove);
    this._keyPressHandler = Function.createDelegate(this, this._onKeyPress);
    this._scrollerTickHandler = Function.createDelegate(this, this._onScrollerTick);
    if (Sys.Browser.agent === Sys.Browser.Safari) {
      AjaxControlToolkit.GenericDragDropManager.__loadSafariCompatLayer(this);
    }
    this._scroller = new Sys.Timer();
    this._scroller.set_interval(10);
    this._scroller.add_tick(this._scrollerTickHandler);
  },

  startDragDrop: function (dragSource, dragVisual, context) {
    this._activeDragSource = dragSource;
    this._activeDragVisual = dragVisual;
    this._activeContext = context;

    AjaxControlToolkit.GenericDragDropManager.callBaseMethod(this, "startDragDrop", [dragSource, dragVisual, context]);
  },

  _stopDragDrop: function (cancelled) {
    this._scroller.set_enabled(false);

    AjaxControlToolkit.GenericDragDropManager.callBaseMethod(this, "_stopDragDrop", [cancelled]);
  },

  _drag: function (isInitialDrag) {
    AjaxControlToolkit.GenericDragDropManager.callBaseMethod(this, "_drag", [isInitialDrag]);

    this._autoScroll();
  },

  _wireEvents: function () {
    $addHandler(document, "mouseup", this._mouseUpHandler);
    $addHandler(document, "mousemove", this._mouseMoveHandler);
    $addHandler(document, "keypress", this._keyPressHandler);
  },

  _unwireEvents: function () {
    $removeHandler(document, "keypress", this._keyPressHandler);
    $removeHandler(document, "mousemove", this._mouseMoveHandler);
    $removeHandler(document, "mouseup", this._mouseUpHandler);
  },

  _wireDropTargetEvents: function (dropTarget) {
    //
  },

  _unwireDropTargetEvents: function (dropTarget) {
    //
  },

  _onMouseUp: function (e) {
    window._event = e;
    this._stopDragDrop(false);
  },

  _onMouseMove: function (e) {
    window._event = e;
    this._drag();
  },

  _onKeyPress: function (e) {
    window._event = e;
    // Escape.
    var k = e.keyCode ? e.keyCode : e.rawEvent.keyCode;
    if (k == 27) {
      this._stopDragDrop(/* cancel */ true);
    }
  },

  _autoScroll: function () {
    var ev = window._event;
    var browserRect = this.getBrowserRectangle();
    if (browserRect.width > 0) {
      this._scrollDeltaX = this._scrollDeltaY = 0;
      if (ev.clientX < browserRect.x + this._scrollEdgeConst) this._scrollDeltaX = -this._scrollByConst;
      else if (ev.clientX > browserRect.width - this._scrollEdgeConst) this._scrollDeltaX = this._scrollByConst;
      if (ev.clientY < browserRect.y + this._scrollEdgeConst) this._scrollDeltaY = -this._scrollByConst;
      else if (ev.clientY > browserRect.height - this._scrollEdgeConst) this._scrollDeltaY = this._scrollByConst;
      if (this._scrollDeltaX != 0 || this._scrollDeltaY != 0) {
        this._scroller.set_enabled(true);
      }
      else {
        this._scroller.set_enabled(false);
      }
    }
  },

  _onScrollerTick: function () {
    var oldLeft = document.body.scrollLeft;
    var oldTop = document.body.scrollTop;
    window.scrollBy(this._scrollDeltaX, this._scrollDeltaY);
    var newLeft = document.body.scrollLeft;
    var newTop = document.body.scrollTop;

    var dragVisual = this._activeDragVisual;
    var position = { x: parseInt(dragVisual.style.left) + (newLeft - oldLeft), y: parseInt(dragVisual.style.top) + (newTop - oldTop) };
    $common.setLocation(dragVisual, position);
  }
};
AjaxControlToolkit.GenericDragDropManager.registerClass('AjaxControlToolkit.GenericDragDropManager', AjaxControlToolkit.IEDragDropManager);


if (Sys.Browser.agent === Sys.Browser.Safari) {
  AjaxControlToolkit.GenericDragDropManager.__loadSafariCompatLayer = function (ddm) {
    ddm._getScrollOffset = ddm.getScrollOffset;

    ddm.getScrollOffset = function (element, recursive) {
      return { x: 0, y: 0 };
    }

    ddm._getBrowserRectangle = ddm.getBrowserRectangle;

    ddm.getBrowserRectangle = function () {
      var browserRect = ddm._getBrowserRectangle();

      var offset = ddm._getScrollOffset(document.body, true);
      return {
        x: browserRect.x + offset.x, y: browserRect.y + offset.y,
        width: browserRect.width + offset.x, height: browserRect.height + offset.y
      };
    }
  }
};

///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\atlastoolkit\Animations.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../Compat/Timer/Timer.js" />
/// <reference path="../Common/Common.js" />


Type.registerNamespace('AjaxControlToolkit.Animation');

// Create an alias for the namespace to save 25 chars each time it's used since
// this is a very long script and will take awhile to download
var $AA = AjaxControlToolkit.Animation;

$AA.registerAnimation = function (name, type) {
  /// <summary>
  /// Register an animation with the AJAX Control Toolkit animation framework. This serves a dual purpose:
  /// 1) to add standard utility methods to the animation type (such as a <code>play</code> method that creates
  /// an animation, plays it, and disposes it when the animation is over), and 2) to associate a name with the
  /// type that will be used when creating animations from a JSON description.  This method can also be called
  /// by other animation libraries to seamlessly interoperate with the AJAX Control Toolkit's animation
  /// framework.
  /// </summary>
  /// <param name="name" type="String">
  /// Name of the animation that will be used as the XML tag name in the XML animation description.  It
  /// should be a valid XML tag (i.e. an alpha-numeric sequence with no spaces, special characters, etc.).
  /// </param>
  /// <param name="type" type="Type">
  /// The type of the new animation must inherit from <see cref="AjaxControlToolkit.Animation.Animation" />.
  /// </param>
  /// <returns />

  // Make sure the type inherits from AjaxControlToolkit.Animation.Animation
  if (type && ((type === $AA.Animation) || (type.inheritsFrom && type.inheritsFrom($AA.Animation)))) {
    // We'll store the animation name/type mapping in a "static" object off of
    // AjaxControlToolkit.Animation.  If this __animations object hasn't been
    // created yet, demand create it on the first registration.
    if (!$AA.__animations) {
      $AA.__animations = {};
    }

    // Add the current type to the collection of animations
    $AA.__animations[name.toLowerCase()] = type;

    // Add a play function that will make it very easy to create, play, and
    // dispose of an animation.  This is effectively a "static" function on
    // each animation and will take the same parameters as that animation's
    // constructor.
    type.play = function () {
      /// <summary>
      /// Create an animation, play it immediately, and dispose it when finished.
      /// </summary>
      /// <param parameterArray="true" elementType="Object">
      /// The play function takes the same parameters as the type's constructor
      /// </param>
      /// <returns />

      // Create and initialize a new animation of the right type and pass in
      // any arguments given to the play function
      var animation = new type();
      type.apply(animation, arguments);
      animation.initialize();

      // Add an event handler to dispose the animation when it's finished
      var handler = Function.createDelegate(animation,
          function () {
            /// <summary>
            /// Dispose the animation after playing
            /// </summary>
            /// <returns />
            animation.remove_ended(handler);
            handler = null;
            animation.dispose();
          });
      animation.add_ended(handler);

      // Once the animation has been created and initialized, play it and
      // dispose it as soon as it's finished
      animation.play();
    }
  } else {
    // Raise an error if someone registers an animation that doesn't inherit
    // from our base Animation class
    throw Error.argumentType('type', type, $AA.Animation, AjaxControlToolkit.Resources.Animation_InvalidBaseType);
  }
}

$AA.buildAnimation = function (json, defaultTarget) {
  /// <summary>
  /// The <code>buildAnimation</code> function is used to turn a JSON animation description
  /// into an actual animation object that can be played.
  /// </summary>
  /// <param name="json" type="String" mayBeNull="true">
  /// JSON description of the animation in the format expected by createAnimation
  /// </param>
  /// <param name="defaultTarget" type="Sys.UI.DomElement" mayBeNull="true" domElement="true">
  /// Target of the animation if none is specified in the JSON description.  The semantics of
  /// target assignment are provided in more detail in createAnimation.
  /// </param>
  /// <returns type="AjaxControlToolkit.Animation.Animation" mayBeNull="true">
  /// Animation created from the JSON description
  /// </returns>

  // Ensure we have a description to create an animation with
  if (!json || json === '') {
    return null;
  }

  // "Parse" the JSON so we can easily manipulate it
  // (we don't wrap it in a try/catch when debugging to raise any errors)
  var obj;
  json = '(' + json + ')';
  if (!Sys.Debug.isDebug) {
    try { obj = Sys.Serialization.JavaScriptSerializer.deserialize(json); } catch (ex) { }
  } else {
    obj = Sys.Serialization.JavaScriptSerializer.deserialize(json);
  }

  // Create a new instance of the animation
  return $AA.createAnimation(obj, defaultTarget);
}

$AA.createAnimation = function (obj, defaultTarget) {
  /// <summary>
  /// The <code>createAnimation</code> function builds a new
  /// <see cref="AjaxControlToolkit.Animation.Animation" /> instance from an object
  /// that describes it.
  /// </summary>
  /// <param name="obj" type="Object">
  /// The object provides a description of the animation to be be generated in
  /// a very specific format. It has two special properties: <code>AnimationName</code>
  /// and <code>AnimationChildren</code>.  The <code>AnimationName</code> is required
  /// and used to find the type of animation to create (this name should map to
  /// one of the animation names supplied to <code>registerAnimation</code>).  The
  /// <code>AnimationChildren</code> property supplies an optional array for
  /// animations that use child animations (such as
  /// <see cref="AjaxControlToolkit.Animation.ParallelAnimation" /> and
  /// <see cref="AjaxControlToolkit.Animation.SequenceAnimation" />). The elements of
  /// the <code>AnimationChildren</code> array are valid
  /// <see cref="AjaxControlToolkit.Animation.Animation" /> objects that meet these same
  /// requirements.  In order for an animation to support child animations, it must
  /// derive from the <see cref="AjaxControlToolkit.Animation.ParentAnimation" /> class
  /// which provides common methods like <code>add</code>, <code>clear</code>, etc. The
  /// remaining properties of the object are used to set parameters specific to the type
  /// of animation being created (e.g. <code>duration</code>, <code>minimumOpacity</code>,
  /// <code>startValue</code>, etc.) and should have a corresponding property on the
  /// animation.  You can also assign an arbitrary JavaScript expression to any property
  /// by adding 'Script' to the end of its name (i.e., Height="70" can be replaced by
  /// HeightScript="$get('myElement').offsetHeight") and have the property set to the
  /// result of evaluating the expression before the animation is played each time.
  /// </param>
  /// <param name="defaultTarget" type="Sys.UI.DomElement" mayBeNull="true" domElement="true">
  /// The function also takes a <code>defaultTarget</code> parameter that is used as the
  /// target of the animation if the object does not specify one.  This parameter should be
  /// an instance of <see cref="Sys.UI.DomElement" /> and not just the name of an element.
  /// </param>
  /// <returns type="AjaxControlToolkit.Animation.Animation">
  /// <see cref="AjaxControlToolkit.Animation.Animation" /> created from the description
  /// </returns>
  /// <remarks>
  /// Exceptions are thrown when the <code>AnimationName</code> cannot be found.  Also,
  /// any exceptions raised by setting properties or providing properties with invalid
  /// names will only be raised when debugging.
  /// </remarks>

  // Create a default instance of the animation by looking up the AnimationName
  // in the global __animations object.
  if (!obj || !obj.AnimationName) {
    throw Error.argument('obj', AjaxControlToolkit.Resources.Animation_MissingAnimationName);
  }
  var type = $AA.__animations[obj.AnimationName.toLowerCase()];
  if (!type) {
    throw Error.argument('type', String.format(AjaxControlToolkit.Resources.Animation_UknownAnimationName, obj.AnimationName));
  }
  var animation = new type();

  // Set the animation's target if provided via defaultTarget (note that setting
  // it via AnimationTarget will happen during the regular property setting phase)
  if (defaultTarget) {
    animation.set_target(defaultTarget);
  }

  // If there is an AnimationChildren array and the animation inherits from
  // ParentAnimation, then we will recusively build the child animations.  It is
  // important that we create the child animations before setting the animation's
  // properties or initializing (because some properties and initialization may be
  // propogated down from parent to child).
  if (obj.AnimationChildren && obj.AnimationChildren.length) {
    if ($AA.ParentAnimation.isInstanceOfType(animation)) {
      for (var i = 0; i < obj.AnimationChildren.length; i++) {
        var child = $AA.createAnimation(obj.AnimationChildren[i]);
        if (child) {
          animation.add(child);
        }
      }
    } else {
      throw Error.argument('obj', String.format(AjaxControlToolkit.Resources.Animation_ChildrenNotAllowed, type.getName()));
    }
  }

  // Get the list of all properties available to set on the current animation's
  // type.  We create a mapping from the property's lowercase friendly name
  // (i.e., "duration") to the name of its setter (i.e., "set_duration").  This is
  // essentialy in setting properties so we only copy over valid values.
  var properties = type.__animationProperties;
  if (!properties) {
    // Get the properties for this type by walking its prototype - by doing
    // this we'll effectively ignore anything not defined in the prototype
    type.__animationProperties = {};
    type.resolveInheritance();
    for (var name in type.prototype) {
      if (name.startsWith('set_')) {
        type.__animationProperties[name.substr(4).toLowerCase()] = name;
      }
    }

    // Remove the 'id' property as it shouldn't be set by the animation
    // (NOTE: the 'target' proeprty shouldn't be set to a string value, but it
    // isn't removed because it can be used as a valid dynamic property - i.e.
    // Target="myElement" *DOES NOT WORK*, but it's OKAY to use
    // TargetScript="$get('myElement')".  Validation for this scenario will be
    // handled automatically by _validateParams when debugging as Target is required
    // to be a dom element.)
    delete type.__animationProperties['id'];
    properties = type.__animationProperties;
  }

  // Loop through each of the properties in the object and check if it's in the list
  // of valid property names.  We will check the type of the propertyName to make sure
  // it's a String (as other types can be added by the ASP.NET AJAX compatability
  // layers to all objects and cause errors if you don't exclude them).  We will first
  // try to set a property with the same name if it exists.  If we can't find one but
  // the name of the property ends in 'script', then we will try to set a corresponding
  // dynamic property.  If no matches can be found at all, we'll raise an error when
  // debugging.
  for (var property in obj) {
    // Ignore the special properties in the object that don't correspond
    // to any actual properties on the animation
    var prop = property.toLowerCase();
    if (prop == 'animationname' || prop == 'animationchildren') {
      continue;
    }

    var value = obj[property];

    // Try to directly set the value of this property
    var setter = properties[prop];
    if (setter && String.isInstanceOfType(setter) && animation[setter]) {
      // Ignore any exceptions raised by setting the property
      // unless we're debugging
      if (!Sys.Debug.isDebug) {
        try { animation[setter](value); } catch (ex) { }
      } else {
        animation[setter](value);
      }
    } else {
      // Try to set the value of a dynamic property
      if (prop.endsWith('script')) {
        setter = properties[prop.substr(0, property.length - 6)];
        if (setter && String.isInstanceOfType(setter) && animation[setter]) {
          animation.DynamicProperties[setter] = value;
        } else if (Sys.Debug.isDebug) {
          // Raise an error when debugging if we could not find a matching property
          throw Error.argument('obj', String.format(AjaxControlToolkit.Resources.Animation_NoDynamicPropertyFound, property, property.substr(0, property.length - 5)));
        }
      } else if (Sys.Debug.isDebug) {
        // Raise an error when debugging if we could not find a matching property
        throw Error.argument('obj', String.format(AjaxControlToolkit.Resources.Animation_NoPropertyFound, property));
      }
    }
  }

  return animation;
}


// In the Xml comments for each of the animations below, there is a special <animation /> tag
// that describes how the animation is referenced from a generic XML animation description


$AA.Animation = function (target, duration, fps) {
  /// <summary>
  /// <code>Animation</code> is an abstract base class used as a starting point for all the other animations.
  /// It provides the basic mechanics for the animation (playing, pausing, stopping, timing, etc.)
  /// and leaves the actual animation to be done in the abstract methods <code>getAnimatedValue</code>
  /// and <code>setValue</code>.
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 1.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <field name="DynamicProperties" type="Object">
  /// The DynamicProperties collection is used to associate JavaScript expressions with
  /// properties.  The expressions are evaluated just before the animation is played
  /// everytime (in the base onStart method).  The object itself maps strings with the
  /// names of property setters (like "set_verticalOffset") to JavaScript expressions
  /// (like "$find('MyBehavior').get_element().offsetHeight").  Note specifically that
  /// the dynamic properties are JavaScript expressions and not abitrary statements (i.e.
  /// you can't include things like "return foo;"), although you can include anything
  /// inside an anonymous function definition that you immediately invoke (i.e.,
  /// "(function() { return foo; })()").  A dynamic property can be set in the generic
  /// XML animation description by appending Script onto any legitimate property name
  /// (for example, instead of Height="70" we could use
  /// HeightScript="$find('MyBehavior').get_element().offsetHeight").  Any exceptions
  /// raised when setting dynamic properties (including both JavaScript evaluation errors
  /// and other exceptions raised by property setters) will only be propogated when
  /// debugging.
  /// </field>
  /// <remarks>
  /// Animations need to be as fast as possible - even in debug mode.  Don't add validation code to
  /// methods involved in every step of the animation.
  /// </remarks>
  /// <animation>Animation</animation>
  $AA.Animation.initializeBase(this);

  // Length of the animation in seconds
  this._duration = 1;

  // Number of steps per second
  this._fps = 25;

  // Target Sys.UI.DomElement of the animation
  this._target = null;

  // Tick event handler
  this._tickHandler = null;

  // Animation timer
  this._timer = null;

  // Percentage of the animation already played
  this._percentComplete = 0;

  // Percentage of the animation to play on each step
  this._percentDelta = null;

  // Reference to the animation that owns this animation (currently only set in 
  // ParallelAnimation.add).  This concept of ownership allows an entire animation
  // subtree to be driven off a single timer so all the operations are properly
  // synchronized.
  this._owner = null;

  // Reference to the animation that contains this as a child (this is set
  // in ParentAnimation.add).  The primary use of the parent animation is in
  // resolving the animation target when one isn't specified.
  this._parentAnimation = null;

  // The DynamicProperties collection is used to associate JavaScript expressions with
  // properties.  The expressions are evaluated just before the animation is played
  // everytime (in the base onStart method).  See the additional information in the
  // XML <field> comment above.
  this.DynamicProperties = {};

  // Set the target, duration, and fps if they were provided in the constructor
  if (target) {
    this.set_target(target);
  }
  if (duration) {
    this.set_duration(duration);
  }
  if (fps) {
    this.set_fps(fps);
  }
}
$AA.Animation.prototype = {
  dispose: function () {
    /// <summary>
    /// Dispose the animation
    /// </summary>
    /// <returns />

    if (this._timer) {
      this._timer.dispose();
      this._timer = null;
    }

    this._tickHandler = null;
    this._target = null;

    $AA.Animation.callBaseMethod(this, 'dispose');
  },

  play: function () {
    /// <summary>
    /// Play the animation from the beginning or where it was left off when paused.
    /// </summary>
    /// <returns />
    /// <remarks>
    /// If this animation is the child of another, you must call <code>play</code> on its parent instead.
    /// </remarks>

    // If ownership of this animation has been claimed, then we'll require the parent to
    // handle playing the animation (this is very important because then the entire animation
    // tree runs on the same timer and updates consistently)
    if (!this._owner) {
      var resume = true;
      if (!this._timer) {
        resume = false;

        if (!this._tickHandler) {
          this._tickHandler = Function.createDelegate(this, this._onTimerTick);
        }

        this._timer = new Sys.Timer();
        this._timer.add_tick(this._tickHandler);

        this.onStart();

        this._timer.set_interval(1000 / this._fps);
        this._percentDelta = 100 / (this._duration * this._fps);
        this._updatePercentComplete(0, true);
      }

      this._timer.set_enabled(true);

      this.raisePropertyChanged('isPlaying');
      if (!resume) {
        this.raisePropertyChanged('isActive');
      }
    }
  },

  pause: function () {
    /// <summary>
    /// Pause the animation if it is playing.  Calling <code>play</code> will resume where
    /// the animation left off.
    /// </summary>
    /// <returns />
    /// <remarks>
    /// If this animation is the child of another, you must call <code>pause</code> on its parent instead.
    /// </remarks>

    if (!this._owner) {
      if (this._timer) {
        this._timer.set_enabled(false);

        this.raisePropertyChanged('isPlaying');
      }
    }
  },

  stop: function (finish) {
    /// <summary>
    /// Stop playing the animation.
    /// </summary>
    /// <param name="finish" type="Boolean" mayBeNull="true" optional="true">
    /// Whether or not stopping the animation should leave the target element in a state
    /// consistent with the animation playing completely by performing the last step.
    /// The default value is true.
    /// </param>
    /// <returns />
    /// <remarks>
    /// If this animation is the child of another, you must call <code>stop</code> on
    /// its parent instead.
    /// </remarks>

    if (!this._owner) {
      var t = this._timer;
      this._timer = null;
      if (t) {
        t.dispose();

        if (this._percentComplete !== 100) {
          this._percentComplete = 100;
          this.raisePropertyChanged('percentComplete');
          if (finish || finish === undefined) {
            this.onStep(100);
          }
        }
        this.onEnd();

        this.raisePropertyChanged('isPlaying');
        this.raisePropertyChanged('isActive');
      }
    }
  },

  onStart: function () {
    /// <summary>
    /// The <code>onStart</code> method is called just before the animation is played each time.
    /// </summary>
    /// <returns />

    this.raiseStarted();

    // Initialize any dynamic properties
    for (var property in this.DynamicProperties) {
      try {
        // Invoke the property's setter on the evaluated expression
        this[property](eval(this.DynamicProperties[property]));
      } catch (ex) {
        // Propogate any exceptions if we're debugging, otherwise eat them
        if (Sys.Debug.isDebug) {
          throw ex;
        }
      }
    }
  },

  onStep: function (percentage) {
    /// <summary>
    /// The <code>onStep</code> method is called repeatedly to progress the animation through each frame
    /// </summary>
    /// <param name="percentage" type="Number">Percentage of the animation already complete</param>
    /// <returns />

    this.setValue(this.getAnimatedValue(percentage));
  },

  onEnd: function () {
    /// <summary>
    /// The <code>onEnd</code> method is called just after the animation is played each time.
    /// </summary>
    /// <returns />

    this.raiseEnded();
  },

  getAnimatedValue: function (percentage) {
    /// <summary>
    /// Determine the state of the animation after the given percentage of its duration has elapsed
    /// </summary>
    /// <param name="percentage" type="Number">Percentage of the animation already complete</param>
    /// <returns type="Object">
    /// State of the animation after the given percentage of its duration has elapsed that will
    /// be passed to <code>setValue</code>
    /// </returns>
    throw Error.notImplemented();
  },

  setValue: function (value) {
    /// <summary>
    /// Set the current state of the animation
    /// </summary>
    /// <param name="value" type="Object">Current state of the animation (as retreived from <code>getAnimatedValue</code>)</param>
    /// <returns />
    throw Error.notImplemented();
  },

  interpolate: function (start, end, percentage) {
    /// <summary>
    /// The <code>interpolate</code> function is used to find the appropriate value between starting and
    /// ending values given the current percentage.
    /// </summary>
    /// <param name="start" type="Number">
    /// Start of the range to interpolate
    /// </param>
    /// <param name="end" type="Number">
    /// End of the range to interpolate
    /// </param>
    /// <param name="percentage" type="Number">
    /// Percentage completed in the range to interpolate
    /// </param>
    /// <returns type="Number">
    /// Value the desired percentage between the start and end values
    /// </returns>
    /// <remarks>
    /// In the future, we hope to make several implementations of this available so we can dynamically
    /// change the apparent speed of the animations, although it may make more sense to modify the
    /// <code>_updatePercentComplete</code> function instead.
    /// </remarks>
    return start + (end - start) * (percentage / 100);
  },

  _onTimerTick: function () {
    /// <summary>
    /// Handler for the tick event to move the animation along through its duration
    /// </summary>
    /// <returns />
    this._updatePercentComplete(this._percentComplete + this._percentDelta, true);
  },

  _updatePercentComplete: function (percentComplete, animate) {
    /// <summary>
    /// Update the animation and its target given the current percentage of its duration that
    /// has already elapsed
    /// </summary>
    /// <param name="percentComplete" type="Number">
    /// Percentage of the animation duration that has already elapsed
    /// </param>
    /// <param name="animate" type="Boolean" mayBeNull="true" optional="true">
    /// Whether or not updating the animation should visually modify the animation's target
    /// </param>
    /// <returns />

    if (percentComplete > 100) {
      percentComplete = 100;
    }

    this._percentComplete = percentComplete;
    this.raisePropertyChanged('percentComplete');

    if (animate) {
      this.onStep(percentComplete);
    }

    if (percentComplete === 100) {
      this.stop(false);
    }
  },

  setOwner: function (owner) {
    /// <summary>
    /// Make this animation the child of another animation
    /// </summary>
    /// <param name="owner" type="AjaxControlToolkit.Animation.Animation">
    /// Parent animation
    /// </param>
    /// <returns />
    this._owner = owner;
  },

  raiseStarted: function () {
    /// <summary>
    /// Raise the <code>started</code> event
    /// </summary>
    /// <returns />
    var handlers = this.get_events().getHandler('started');
    if (handlers) {
      handlers(this, Sys.EventArgs.Empty);
    }
  },

  add_started: function (handler) {
    /// <summary>
    /// Adds an event handler for the <code>started</code> event.
    /// </summary>
    /// <param name="handler" type="Function">
    /// The handler to add to the event.
    /// </param>
    /// <returns />
    this.get_events().addHandler("started", handler);
  },

  remove_started: function (handler) {
    /// <summary>
    /// Removes an event handler for the <code>started</code> event.
    /// </summary>
    /// <param name="handler" type="Function">
    /// The handler to remove from the event.
    /// </param>
    /// <returns />
    this.get_events().removeHandler("started", handler);
  },

  raiseEnded: function () {
    /// <summary>
    /// Raise the <code>ended</code> event
    /// </summary>
    /// <returns />
    var handlers = this.get_events().getHandler('ended');
    if (handlers) {
      handlers(this, Sys.EventArgs.Empty);
    }
  },

  add_ended: function (handler) {
    /// <summary>
    /// Adds an event handler for the <code>ended</code> event.
    /// </summary>
    /// <param name="handler" type="Function">
    /// The handler to add to the event.
    /// </param>
    /// <returns />
    this.get_events().addHandler("ended", handler);
  },

  remove_ended: function (handler) {
    /// <summary>
    /// Removes an event handler for the <code>ended</code> event.
    /// </summary>
    /// <param name="handler" type="Function">
    /// The handler to remove from the event.
    /// </param>
    /// <returns />
    this.get_events().removeHandler("ended", handler);
  },

  get_target: function () {
    /// <value type="Sys.UI.DomElement" domElement="true" mayBeNull="true">
    /// Target of the animation.  If the target of this animation is null and
    /// the animation has a parent, then it will recursively use the target of
    /// the parent animation instead.
    /// </value>
    /// <remarks>
    /// Do not set this property in a generic Xml animation description. It should be set
    /// using either the extender's TargetControlID or the AnimationTarget property (the latter
    /// maps to AjaxControlToolkit.Animation.set_animationTarget).  The only valid way to
    /// set this property in the generic Xml animation description is to use the dynamic
    /// property TargetScript="$get('myElement')".
    /// <remarks>
    if (!this._target && this._parentAnimation) {
      return this._parentAnimation.get_target();
    }
    return this._target;
  },
  set_target: function (value) {
    if (this._target != value) {
      this._target = value;
      this.raisePropertyChanged('target');
    }
  },

  set_animationTarget: function (id) {
    /// <value type="string" mayBeNull="false">
    /// ID of a Sys.UI.DomElement or Sys.UI.Control to use as the target of the animation
    /// </value>
    /// <remarks>
    /// If no Sys.UI.DomElement or Sys.UI.Control can be found for the given ID, an
    /// argument exception will be thrown.
    /// <remarks>

    // Try to find a Sys.UI.DomElement
    var target = null;
    var element = $get(id);
    if (element) {
      target = element;
    } else {
      // Try to find the control in the AJAX controls collection
      var ctrl = $find(id);
      if (ctrl) {
        element = ctrl.get_element();
        if (element) {
          target = element;
        }
      }
    }

    // Use the new target if we have one, or raise an error if not
    if (target) {
      this.set_target(target);
    } else {
      throw Error.argument('id', String.format(AjaxControlToolkit.Resources.Animation_TargetNotFound, id));
    }
  },

  get_duration: function () {
    /// <value type="Number">
    /// Length of the animation in seconds.  The default is 1.
    /// </value>
    return this._duration;
  },
  set_duration: function (value) {
    value = this._getFloat(value);
    if (this._duration != value) {
      this._duration = value;
      this.raisePropertyChanged('duration');
    }
  },

  get_fps: function () {
    /// <value type="Number" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </value>
    return this._fps;
  },
  set_fps: function (value) {
    value = this._getInteger(value);
    if (this.fps != value) {
      this._fps = value;
      this.raisePropertyChanged('fps');
    }
  },

  get_isActive: function () {
    /// <value type="Boolean">
    /// <code>true</code> if animation is active, <code>false</code> if not.
    /// </value>
    return (this._timer !== null);
  },

  get_isPlaying: function () {
    /// <value type="Boolean">
    /// <code>true</code> if animation is playing, <code>false</code> if not.
    /// </value>
    return (this._timer !== null) && this._timer.get_enabled();
  },

  get_percentComplete: function () {
    /// <value type="Number">
    /// Percentage of the animation already played.
    /// </value>
    return this._percentComplete;
  },

  _getBoolean: function (value) {
    /// <summary>
    /// Helper to convert strings to booleans for property setters
    /// </summary>
    /// <param name="value" type="Object">
    /// Value to convert if it's a string
    /// </param>
    /// <returns type="Object">
    /// Value that has been converted if it was a string
    /// </returns>
    if (String.isInstanceOfType(value)) {
      return Boolean.parse(value);
    }
    return value;
  },

  _getInteger: function (value) {
    /// <summary>
    /// Helper to convert strings to integers for property setters
    /// </summary>
    /// <param name="value" type="Object">Value to convert if it's a string</param>
    /// <returns type="Object">Value that has been converted if it was a string</returns>
    if (String.isInstanceOfType(value)) {
      return parseInt(value);
    }
    return value;
  },

  _getFloat: function (value) {
    /// <summary>
    /// Helper to convert strings to floats for property setters
    /// </summary>
    /// <param name="value" type="Object">Value to convert if it's a string</param>
    /// <returns type="Object">Value that has been converted if it was a string</returns>
    if (String.isInstanceOfType(value)) {
      return parseFloat(value);
    }
    return value;
  },

  _getEnum: function (value, type) {
    /// <summary>
    /// Helper to convert strings to enum values for property setters
    /// </summary>
    /// <param name="value" type="Object">Value to convert if it's a string</param>
    /// <param name="type" type="Type">Type of the enum to convert to</param>
    /// <returns type="Object">Value that has been converted if it was a string</returns>
    if (String.isInstanceOfType(value) && type && type.parse) {
      return type.parse(value);
    }
    return value;
  }
}
$AA.Animation.registerClass('AjaxControlToolkit.Animation.Animation', Sys.Component);
$AA.registerAnimation('animation', $AA.Animation);


$AA.ParentAnimation = function (target, duration, fps, animations) {
  /// <summary>
  /// The <code>ParentAnimation</code> serves as a base class for all animations that contain children (such as
  /// <see cref="AjaxControlToolkit.Animation.ParallelAnimation" />, <see cref="AjaxControlToolkit.SequenceAnimation" />,
  /// etc.).  It does not actually play the animations, so any classes that inherit from it must do so.  Any animation
  /// that requires nested child animations must inherit from this class, although it will likely want to inherit off of
  /// <see cref="AjaxControlToolkit.Animation.ParallelAnimation" /> or <see cref="AjaxControlToolkit.SequenceAnimation" />
  /// which will actually play their child animations.
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 1.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="animations" mayBeNull="true" optional="true" parameterArray="true" elementType="AjaxControlToolkit.Animation.Animation">
  /// Array of child animations to be played
  /// </param>
  /// <animation>Parent</animation>
  $AA.ParentAnimation.initializeBase(this, [target, duration, fps]);

  // Array of child animations (there are no assumptions placed on order because
  // it will matter for some derived animations like SequenceAnimation, but not
  // for others like ParallelAnimation) that is demand created in add
  this._animations = [];

  // Add any child animations passed into the constructor
  if (animations && animations.length) {
    for (var i = 0; i < animations.length; i++) {
      this.add(animations[i]);
    }
  }
}
$AA.ParentAnimation.prototype = {
  initialize: function () {
    /// <summary>
    /// Initialize the parent along with any child animations that have not yet been initialized themselves
    /// </summary>
    /// <returns />
    $AA.ParentAnimation.callBaseMethod(this, 'initialize');

    // Initialize all the uninitialized child animations
    if (this._animations) {
      for (var i = 0; i < this._animations.length; i++) {
        var animation = this._animations[i];
        if (animation && !animation.get_isInitialized) {
          animation.initialize();
        }
      }
    }
  },

  dispose: function () {
    /// <summary>
    /// Dispose of the child animations
    /// </summary>
    /// <returns />

    this.clear();
    this._animations = null;
    $AA.ParentAnimation.callBaseMethod(this, 'dispose');
  },

  get_animations: function () {
    /// <value elementType="AjaxControlToolkit.Animation.Animation">
    /// Array of child animations to be played (there are no assumptions placed on order because it will matter for some
    /// derived animations like <see cref="AjaxControlToolkit.Animation.SequenceAnimation" />, but not for
    /// others like <see cref="AjaxControlToolkit.Animation.ParallelAnimation" />).  To manipulate the child
    /// animations, use the functions <code>add</code>, <code>clear</code>, <code>remove</code>, and <code>removeAt</code>.
    /// </value>
    return this._animations;
  },

  add: function (animation) {
    /// <summary>
    /// Add an animation as a child of this animation.
    /// </summary>
    /// <param name="animation" type="AjaxControlToolkit.Animation.Animation">Child animation to add</param>
    /// <returns />

    if (this._animations) {
      if (animation) {
        animation._parentAnimation = this;
      }
      Array.add(this._animations, animation);
      this.raisePropertyChanged('animations');
    }
  },

  remove: function (animation) {
    /// <summary>
    /// Remove the animation from the array of child animations.
    /// </summary>
    /// <param name="animation" type="AjaxControlToolkit.Animation.Animation">
    /// Child animation to remove
    /// </param>
    /// <returns />
    /// <remarks>
    /// This will dispose the removed animation.
    /// </remarks>

    if (this._animations) {
      if (animation) {
        animation.dispose();
      }
      Array.remove(this._animations, animation);
      this.raisePropertyChanged('animations');
    }
  },

  removeAt: function (index) {
    /// <summary>
    /// Remove the animation at a given index from the array of child animations.
    /// </summary>
    /// <param name="index" type="Number" integer="true">
    /// Index of the child animation to remove
    /// </param>
    /// <returns />

    if (this._animations) {
      var animation = this._animations[index];
      if (animation) {
        animation.dispose();
      }
      Array.removeAt(this._animations, index);
      this.raisePropertyChanged('animations');
    }
  },

  clear: function () {
    /// <summary>
    /// Clear the array of child animations.
    /// </summary>
    /// <remarks>
    /// This will dispose the cleared child animations.
    /// </remarks>
    /// <returns />

    if (this._animations) {
      for (var i = this._animations.length - 1; i >= 0; i--) {
        this._animations[i].dispose();
        this._animations[i] = null;
      }
      Array.clear(this._animations);
      this._animations = [];
      this.raisePropertyChanged('animations');
    }
  }
}
$AA.ParentAnimation.registerClass('AjaxControlToolkit.Animation.ParentAnimation', $AA.Animation);
$AA.registerAnimation('parent', $AA.ParentAnimation);


$AA.ParallelAnimation = function (target, duration, fps, animations) {
  /// <summary>
  /// The <code>ParallelAnimation</code> plays several animations simultaneously.  It inherits from
  /// <see cref="AjaxControlToolkit.Animation.ParentAnimation" />, but makes itself the owner of all
  /// its child animations to allow the use a single timer and syncrhonization mechanisms shared with
  /// all the children (in other words, the <code>duration</code> properties of any child animations
  /// are ignored in favor of the parent's <code>duration</code>).  It is very useful in creating
  /// sophisticated effects through combination of simpler animations.
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 1.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="animations" mayBeNull="true" optional="true" parameterArray="true" elementType="AjaxControlToolkit.Animation.Animation">
  /// Array of child animations
  /// </param>
  /// <animation>Parallel</animation>
  $AA.ParallelAnimation.initializeBase(this, [target, duration, fps, animations]);
}
$AA.ParallelAnimation.prototype = {
  add: function (animation) {
    /// <summary>
    /// Add an animation as a child of this animation and make ourselves its owner.
    /// </summary>
    /// <param name="animation" type="AjaxControlToolkit.Animation.Animation">Child animation to add</param>
    /// <returns />
    $AA.ParallelAnimation.callBaseMethod(this, 'add', [animation]);
    animation.setOwner(this);
  },

  onStart: function () {
    /// <summary>
    /// Get the child animations ready to play
    /// </summary>
    /// <returns />

    $AA.ParallelAnimation.callBaseMethod(this, 'onStart');
    var animations = this.get_animations();
    for (var i = 0; i < animations.length; i++) {
      animations[i].onStart();
    }
  },

  onStep: function (percentage) {
    /// <summary>
    /// Progress the child animations through each frame
    /// </summary>
    /// <param name="percentage" type="Number">
    /// Percentage of the animation already complete
    /// </param>
    /// <returns />

    var animations = this.get_animations();
    for (var i = 0; i < animations.length; i++) {
      animations[i].onStep(percentage);
    }
  },

  onEnd: function () {
    /// <summary>
    /// Finish playing all of the child animations
    /// </summary>
    /// <returns />

    var animations = this.get_animations();
    for (var i = 0; i < animations.length; i++) {
      animations[i].onEnd();
    }
    $AA.ParallelAnimation.callBaseMethod(this, 'onEnd');
  }
}
$AA.ParallelAnimation.registerClass('AjaxControlToolkit.Animation.ParallelAnimation', $AA.ParentAnimation);
$AA.registerAnimation('parallel', $AA.ParallelAnimation);


$AA.SequenceAnimation = function (target, duration, fps, animations, iterations) {
  /// <summary>
  /// The <code>SequenceAnimation</code> runs several animations one after the other.  It can also
  /// repeat the sequence of animations for a specified number of iterations (which defaults to a
  /// single iteration, but will repeat forever if you specify zero or less iterations).  Also, the
  /// <code>SequenceAnimation</code> cannot be a child of a <see cref="AjaxControlToolkit.Animation.ParallelAnimation" />
  /// (or any animation inheriting from it).
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 1.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="animations" mayBeNull="true" optional="true" parameterArray="true" elementType="AjaxControlToolkit.Animation.Animation">
  /// Array of child animations
  /// </param>
  /// <param name="iterations" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of times to repeatedly play the sequence.  If zero or less iterations are specified, the sequence
  /// will repeat forever.  The default value is 1 iteration.
  /// </param>
  /// <remarks>
  /// The <code>SequenceAnimation</code> ignores the <code>duration</code> and <code>fps</code>
  /// properties, and will let each of its child animations use any settings they please.
  /// </remarks>
  /// <animation>Sequence</animation>
  $AA.SequenceAnimation.initializeBase(this, [target, duration, fps, animations]);

  // Handler used to determine when an animation has finished
  this._handler = null;

  // Flags to note whether we're playing, paused, or stopped
  this._paused = false;
  this._playing = false;

  // Index of the currently executing animation in the sequence
  this._index = 0;

  // Counter used when playing the animation to determine the remaining number of times to play the entire sequence
  this._remainingIterations = 0;

  // Number of iterations
  this._iterations = (iterations !== undefined) ? iterations : 1;
}
$AA.SequenceAnimation.prototype = {
  dispose: function () {
    /// <summary>
    /// Dispose the animation
    /// </summary>
    /// <returns />
    this._handler = null;
    $AA.SequenceAnimation.callBaseMethod(this, 'dispose');
  },

  stop: function () {
    /// <summary>
    /// Stop playing the entire sequence of animations
    /// </summary>
    /// <returns />
    /// <remarks>
    /// Stopping this animation will perform the last step of each child animation, thereby leaving their
    /// target elements in a state consistent with the animation playing completely. If this animation is
    /// the child of another, you must call <code>stop</code> on its parent instead.
    /// </remarks>

    if (this._playing) {
      var animations = this.get_animations();
      if (this._index < animations.length) {
        // Remove the handler from the currently running animation
        animations[this._index].remove_ended(this._handler);
        // Call stop on all remaining animations to ensure their
        // effects will be seen
        for (var i = this._index; i < animations.length; i++) {
          animations[i].stop();
        }
      }
      this._playing = false;
      this._paused = false;
      this.raisePropertyChanged('isPlaying');
      this.onEnd();
    }
  },

  pause: function () {
    /// <summary>
    /// Pause the animation if it is playing.  Calling <code>play</code> will resume where
    /// the animation left off.
    /// </summary>
    /// <returns />
    /// <remarks>
    /// If this animation is the child of another, you must call <code>pause</code> on its parent instead.
    /// </remarks>

    if (this.get_isPlaying()) {
      var current = this.get_animations()[this._index];
      if (current != null) {
        current.pause();
      }
      this._paused = true;
      this.raisePropertyChanged('isPlaying');
    }
  },

  play: function () {
    /// <summary>
    /// Play the sequence of animations from the beginning or where it was left off when paused
    /// </summary>
    /// <returns />
    /// <remarks>
    /// If this animation is the child of another, you must call <code>play</code> on its parent instead
    /// </remarks>

    var animations = this.get_animations();
    if (!this._playing) {
      this._playing = true;
      if (this._paused) {
        this._paused = false;
        var current = animations[this._index];
        if (current != null) {
          current.play();
          this.raisePropertyChanged('isPlaying');
        }
      } else {
        this.onStart();
        // Reset the index and attach the handler to the first
        this._index = 0;
        var first = animations[this._index];
        if (first) {
          first.add_ended(this._handler);
          first.play();
          this.raisePropertyChanged('isPlaying');
        } else {
          this.stop();
        }
      }
    }
  },

  onStart: function () {
    /// <summary>
    /// The <code>onStart</code> method is called just before the animation is played each time
    /// </summary>
    /// <returns />
    $AA.SequenceAnimation.callBaseMethod(this, 'onStart');
    this._remainingIterations = this._iterations - 1;

    // Create the handler we attach to each animation as it plays to determine when we've finished with it
    if (!this._handler) {
      this._handler = Function.createDelegate(this, this._onEndAnimation);
    }
  },

  _onEndAnimation: function () {
    /// <summary>
    /// Wait for the end of each animation, and then continue by playing the other animations remaining
    /// in the sequence.  Stop when it reaches the last animation and there are no remaining iterations.
    /// </summary>
    /// <returns />

    // Remove the handler from the current animation
    var animations = this.get_animations();
    var current = animations[this._index++];
    if (current) {
      current.remove_ended(this._handler);
    }

    // Keep running animations and stop when we're out
    if (this._index < animations.length) {
      var next = animations[this._index];
      next.add_ended(this._handler);
      next.play();
    } else if (this._remainingIterations >= 1 || this._iterations <= 0) {
      this._remainingIterations--;
      this._index = 0;
      var first = animations[0];
      first.add_ended(this._handler);
      first.play();
    } else {
      this.stop();
    }
  },

  onStep: function (percentage) {
    /// <summary>
    /// Raises an invalid operation exception because this will only be called if a <code>SequenceAnimation</code>
    /// has been nested inside an <see cref="AjaxControlToolkit.Animation.ParallelAnimation" /> (or a derived type).
    /// </summary>
    /// <param name="percentage" type="Number">Percentage of the animation already complete</param>
    /// <returns />
    throw Error.invalidOperation(AjaxControlToolkit.Resources.Animation_CannotNestSequence);
  },

  onEnd: function () {
    /// <summary>
    /// The <code>onEnd</code> method is called just after the animation is played each time.
    /// </summary>
    /// <returns />
    this._remainingIterations = 0;
    $AA.SequenceAnimation.callBaseMethod(this, 'onEnd');
  },

  get_isActive: function () {
    /// <value type="Boolean">
    /// <code>true</code> if animation is active, <code>false</code> if not.
    /// </value>
    return true;
  },

  get_isPlaying: function () {
    /// <value type="Boolean">
    /// <code>true</code> if animation is playing, <code>false</code> if not.
    /// </value>
    return this._playing && !this._paused;
  },

  get_iterations: function () {
    /// <value type="Number" integer="true">
    /// Number of times to repeatedly play the sequence.  If zero or less iterations are specified, the sequence
    /// will repeat forever.  The default value is 1 iteration.
    /// </value>
    return this._iterations;
  },
  set_iterations: function (value) {
    value = this._getInteger(value);
    if (this._iterations != value) {
      this._iterations = value;
      this.raisePropertyChanged('iterations');
    }
  },

  get_isInfinite: function () {
    /// <value type="Boolean">
    /// <code>true</code> if this animation will repeat forever, <code>false</code> otherwise.
    /// </value>
    return this._iterations <= 0;
  }
}
$AA.SequenceAnimation.registerClass('AjaxControlToolkit.Animation.SequenceAnimation', $AA.ParentAnimation);
$AA.registerAnimation('sequence', $AA.SequenceAnimation);


$AA.SelectionAnimation = function (target, duration, fps, animations) {
  /// <summary>
  /// The <code>SelectionAnimation</code> will run a single animation chosen from of its child animations. It is
  /// important to note that the <code>SelectionAnimation</code> ignores the <code>duration</code> and <code>fps</code>
  /// properties, and will let each of its child animations use any settings they please.  This is a base class with no
  /// functional implementation, so consider using <see cref="AjaxControlToolkit.Animation.ConditionAnimation" /> or
  /// <see cref="AjaxControlToolkit.Animation.CaseAnimation" /> instead.
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 1.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="animations" mayBeNull="true" optional="true" parameterArray="true" elementType="AjaxControlToolkit.Animation.Animation">
  /// Array of child animations
  /// </param>
  /// <animation>Selection</animation>
  $AA.SelectionAnimation.initializeBase(this, [target, duration, fps, animations]);

  // Index of the animation selected to play
  this._selectedIndex = -1;

  // Reference to the animation selected to play
  this._selected = null;
}
$AA.SelectionAnimation.prototype = {
  getSelectedIndex: function () {
    /// <summary>
    /// Get the index of the animation that is selected to be played.  If this returns an index outside the bounds of
    /// the child animations array, then nothing is played.
    /// </summary>
    /// <returns type="Number" integer="true">
    /// Index of the selected child animation to play
    /// </returns>
    throw Error.notImplemented();
  },

  onStart: function () {
    /// <summary>
    /// The <code>onStart</code> method is called just before the animation is played each time.
    /// </summary>
    /// <returns />
    $AA.SelectionAnimation.callBaseMethod(this, 'onStart');

    var animations = this.get_animations();
    this._selectedIndex = this.getSelectedIndex();
    if (this._selectedIndex >= 0 && this._selectedIndex < animations.length) {
      this._selected = animations[this._selectedIndex];
      if (this._selected) {
        this._selected.setOwner(this);
        this._selected.onStart();
      }
    }
  },

  onStep: function (percentage) {
    /// <summary>
    /// The <code>onStep</code> method is called repeatedly to progress the animation through each frame
    /// </summary>
    /// <param name="percentage" type="Number">Percentage of the animation already complete</param>
    /// <returns />

    if (this._selected) {
      this._selected.onStep(percentage);
    }
  },

  onEnd: function () {
    /// <summary>
    /// The <code>onEnd</code> method is called just after the animation is played each time.
    /// </summary>
    /// <returns />

    if (this._selected) {
      this._selected.onEnd();
      this._selected.setOwner(null);
    }
    this._selected = null;
    this._selectedIndex = null;
    $AA.SelectionAnimation.callBaseMethod(this, 'onEnd');
  }
}
$AA.SelectionAnimation.registerClass('AjaxControlToolkit.Animation.SelectionAnimation', $AA.ParentAnimation);
$AA.registerAnimation('selection', $AA.SelectionAnimation);


$AA.ConditionAnimation = function (target, duration, fps, animations, conditionScript) {
  /// <summary>
  /// The <code>ConditionAnimation</code> is used as a control structure to play a specific child animation
  /// depending on the result of executing the <code>conditionScript</code>.  If the <code>conditionScript</code>
  /// evaluates to <code>true</code>, the first child animation is played.  If it evaluates to <code>false</code>,
  /// the second child animation is played (although nothing is played if a second animation is not present).
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 1.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="animations" mayBeNull="true" optional="true" parameterArray="true" elementType="AjaxControlToolkit.Animation.Animation">
  /// Array of child animations
  /// </param>
  /// <param name="conditionScript" type="String" mayBeNull="true" optional="true">
  /// JavaScript that should evaluate to <code>true</code> or <code>false</code> to determine which child
  /// animation to play.
  /// </param>
  /// <animation>Condition</animation>
  $AA.ConditionAnimation.initializeBase(this, [target, duration, fps, animations]);

  // Condition to determine which index we will play
  this._conditionScript = conditionScript;
}
$AA.ConditionAnimation.prototype = {
  getSelectedIndex: function () {
    /// <summary>
    /// Get the index of the animation that is selected to be played.  If this returns an index outside the bounds of
    /// the child animations array, then nothing is played.
    /// </summary>
    /// <returns type="Number" integer="true">
    /// Index of the selected child animation to play
    /// </returns>

    var selected = -1;
    if (this._conditionScript && this._conditionScript.length > 0) {
      try {
        selected = eval(this._conditionScript) ? 0 : 1;
      } catch (ex) {
      }
    }
    return selected;
  },

  get_conditionScript: function () {
    /// <value type="String">
    /// JavaScript that should evaluate to <code>true</code> or <code>false</code> to determine which
    /// child animation to play.
    /// </value>
    return this._conditionScript;
  },
  set_conditionScript: function (value) {
    if (this._conditionScript != value) {
      this._conditionScript = value;
      this.raisePropertyChanged('conditionScript');
    }
  }
}
$AA.ConditionAnimation.registerClass('AjaxControlToolkit.Animation.ConditionAnimation', $AA.SelectionAnimation);
$AA.registerAnimation('condition', $AA.ConditionAnimation);


$AA.CaseAnimation = function (target, duration, fps, animations, selectScript) {
  /// <summary>
  /// The <code>CaseAnimation</code> is used as a control structure to play a specific child animation depending on
  /// the result of executing the <code>selectScript</code>, which should return the index of the child animation to
  /// play (this is similar to the <code>case</code> or <code>select</code> statements in C#/VB, etc.).  If the provided
  /// index is outside the bounds of the child animations array (or if nothing was returned) then we will not play anything.
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 1.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="animations" mayBeNull="true" optional="true" parameterArray="true" elementType="AjaxControlToolkit.Animation.Animation">
  /// Array of child animations
  /// </param>
  /// <param name="selectScript" type="String" mayBeNull="true" optional="true">
  /// JavaScript that should evaluate to the index of the appropriate child animation to play.  If this returns an index outside the bounds of the child animations array, then nothing is played.
  /// </param>
  /// <animation>Case</animation>
  $AA.CaseAnimation.initializeBase(this, [target, duration, fps, animations]);

  // Condition to determine which index we will play
  this._selectScript = selectScript;
}
$AA.CaseAnimation.prototype = {
  getSelectedIndex: function () {
    /// <summary>
    /// Get the index of the animation that is selected to be played.  If this returns an index outside the bounds of
    /// the child animations array, then nothing is played.
    /// </summary>
    /// <returns type="Number" integer="true">
    /// Index of the selected child animation to play
    /// </returns>

    var selected = -1;
    if (this._selectScript && this._selectScript.length > 0) {
      try {
        var result = eval(this._selectScript)
        if (result !== undefined)
          selected = result;
      } catch (ex) {
      }
    }
    return selected;
  },

  get_selectScript: function () {
    /// <value type="String">
    /// JavaScript that should evaluate to the index of the appropriate child animation to play.  If this returns an index outside the bounds of the child animations array, then nothing is played.
    /// </value>
    return this._selectScript;
  },
  set_selectScript: function (value) {
    if (this._selectScript != value) {
      this._selectScript = value;
      this.raisePropertyChanged('selectScript');
    }
  }
}
$AA.CaseAnimation.registerClass('AjaxControlToolkit.Animation.CaseAnimation', $AA.SelectionAnimation);
$AA.registerAnimation('case', $AA.CaseAnimation);


$AA.FadeEffect = function () {
  /// <summary>
  /// The FadeEffect enumeration determines whether a fade animation is used to fade in or fade out.
  /// </summary>
  /// <field name="FadeIn" type="Number" integer="true" />
  /// <field name="FadeOut" type="Number" integer="true" />
  throw Error.invalidOperation();
}
$AA.FadeEffect.prototype = {
  FadeIn: 0,
  FadeOut: 1
}
$AA.FadeEffect.registerEnum("AjaxControlToolkit.Animation.FadeEffect", false);


$AA.FadeAnimation = function (target, duration, fps, effect, minimumOpacity, maximumOpacity, forceLayoutInIE) {
  /// <summary>
  /// The <code>FadeAnimation</code> is used to fade an element in or out of view, depending on the
  /// provided <see cref="AjaxControlToolkit.Animation.FadeEffect" />, by settings its opacity.
  /// The minimum and maximum opacity values can be specified to precisely control the fade.
  /// You may also consider using <see cref="AjaxControlToolkit.Animation.FadeInAnimation" /> or
  /// <see cref="AjaxControlToolkit.Animation.FadeOutAnimation" /> if you know the only direction you
  /// are fading.
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 1.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="effect" type="AjaxControlToolkit.Animation.FadeEffect" mayBeNull="true" optional="true">
  /// Determine whether to fade the element in or fade the element out.  The possible values are <code>FadeIn</code>
  /// and <code>FadeOut</code>.  The default value is <code>FadeOut</code>.
  /// </param>
  /// <param name="minimumOpacity" type="Number" mayBeNull="true" optional="true">
  /// Minimum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 0.
  /// </param>
  /// <param name="maximumOpacity" type="Number" mayBeNull="true" optional="true">
  /// Maximum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 1.
  /// </param>
  /// <param name="forceLayoutInIE" type="Boolean" mayBeNull="true" optional="true">
  /// Whether or not we should force a layout to be created for Internet Explorer by giving it a width and setting its
  /// background color (the latter is required in case the user has ClearType enabled). The default value is <code>true</code>.
  /// This is obviously ignored when working in other browsers.
  /// </param>
  /// <animation>Fade</animation>
  $AA.FadeAnimation.initializeBase(this, [target, duration, fps]);

  // The effect determines whether or not we fade in or out
  this._effect = (effect !== undefined) ? effect : $AA.FadeEffect.FadeIn;

  // Maximum and minimum opacities default to 100% and 0%
  this._max = (maximumOpacity !== undefined) ? maximumOpacity : 1;
  this._min = (minimumOpacity !== undefined) ? minimumOpacity : 0;

  // Starting and ending opacities
  this._start = this._min;
  this._end = this._max;

  // Whether the a layout has already been created (to work around IE problems)
  this._layoutCreated = false;

  // Whether or not we should force a layout to be created for IE by giving it a width
  // and setting its background color (the latter is required in case the user has ClearType enabled).
  // http://msdn.microsoft.com/library/default.asp?url=/workshop/author/filter/reference/filters/alpha.asp
  this._forceLayoutInIE = (forceLayoutInIE === undefined || forceLayoutInIE === null) ? true : forceLayoutInIE;

  // Current target of the animation that is cached before the animation plays (since looking up
  // the target could mean walking all the way up to the root of the animation's tree, which we don't
  // want to do for every step of the animation)
  this._currentTarget = null;

  // Properly set up the min/max values provided by the constructor
  this._resetOpacities();
}
$AA.FadeAnimation.prototype = {
  _resetOpacities: function () {
    /// <summary>
    /// Set the starting and ending opacity values based on the effect (i.e. when we're fading
    /// in we go from <code>_min</code> to <code>_max</code>, but we go <code>_max</code> to
    /// <code>_min</code> when fading out)
    /// </summary>
    /// <returns />

    if (this._effect == $AA.FadeEffect.FadeIn) {
      this._start = this._min;
      this._end = this._max;
    } else {
      this._start = this._max;
      this._end = this._min;
    }
  },

  _createLayout: function () {
    /// <summary>
    /// Create a layout when using Internet Explorer (which entails setting a width and also
    /// a background color if it currently has neither)
    /// </summary>
    /// <returns />

    var element = this._currentTarget;
    if (element) {
      // Get the original width/height/back color
      var originalWidth = $common.getCurrentStyle(element, 'width');
      var originalHeight = $common.getCurrentStyle(element, 'height');
      var originalBackColor = $common.getCurrentStyle(element, 'backgroundColor');

      // Set the width which will force the creation of a layout
      if ((!originalWidth || originalWidth == '' || originalWidth == 'auto') &&
          (!originalHeight || originalHeight == '' || originalHeight == 'auto')) {
        element.style.width = element.offsetWidth + 'px';
      }

      // Set the back color to avoid ClearType problems
      if (!originalBackColor || originalBackColor == '' || originalBackColor == 'transparent' || originalBackColor == 'rgba(0, 0, 0, 0)') {
        element.style.backgroundColor = $common.getInheritedBackgroundColor(element);
      }

      // Mark that we've created the layout so we only do it once
      this._layoutCreated = true;
    }
  },

  onStart: function () {
    /// <summary>
    /// The <code>onStart</code> method is called just before the animation is played each time.
    /// </summary>
    /// <returns />       
    $AA.FadeAnimation.callBaseMethod(this, 'onStart');

    this._currentTarget = this.get_target();
    this.setValue(this._start);

    // Force the creation of a layout in IE if we're supposed to and the current browser is Internet Explorer
    if (this._forceLayoutInIE && !this._layoutCreated && Sys.Browser.agent == Sys.Browser.InternetExplorer) {
      this._createLayout();
    }
  },

  getAnimatedValue: function (percentage) {
    /// <summary>
    /// Determine the current opacity after the given percentage of its duration has elapsed
    /// </summary>
    /// <param name="percentage" type="Number">Percentage of the animation already complete</param>
    /// <returns type="Number">
    /// Current opacity after the given percentage of its duration has elapsed that will
    /// be passed to <code>setValue</code>
    /// </returns>
    return this.interpolate(this._start, this._end, percentage);
  },

  setValue: function (value) {
    /// <summary>
    /// Set the current opacity of the element.
    /// </summary>
    /// <param name="value" type="Number">
    /// Current opacity (as retreived from <code>getAnimatedValue</code>)
    /// </param>
    /// <returns />
    /// <remarks>
    /// This method will be replaced by a dynamically generated function that requires no logic
    /// to determine whether it should use filters or the style's opacity.
    /// </remarks>
    if (this._currentTarget) {
      $common.setElementOpacity(this._currentTarget, value);
    }
  },

  //    set_target : function(value) {
  //        /// <value type="Sys.UI.DomElement">
  //        /// Override the <code>target</code> property to dynamically create the setValue function.
  //        /// </value>
  //        /// <remarks>
  //        /// Do not set this property in a generic Xml animation description. It will be set automatically
  //        /// using either the extender's TargetControlID or the AnimationTarget property.
  //        /// <remarks>
  //        $AA.FadeAnimation.callBaseMethod(this, 'set_target', [value]);
  //        
  //        var element = value;
  //        if (element) {
  //            var filters = element.filters;
  //            if (filters) {
  //                var alphaFilter = null;
  //                if (filters.length !== 0) {
  //                    alphaFilter = filters['DXImageTransform.Microsoft.Alpha'];
  //                }
  //                if (!alphaFilter) {
  //                    element.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + (this._start * 100) + ')';
  //                    alphaFilter = filters['DXImageTransform.Microsoft.Alpha'];
  //                }
  //                if (alphaFilter) {
  //                    this.setValue = function(val) { alphaFilter.opacity = val * 100; }
  //                } else {
  //                    this.setValue = function(val) {
  //                        element.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + (val * 100) + ')';
  //                    };
  //                }
  //            }
  //            else {
  //                this.setValue = function(val) { element.style.opacity = val; };
  //            }
  //        }
  //    },

  get_effect: function () {
    /// <value type="AjaxControlToolkit.Animation.FadeEffect">
    /// Determine whether to fade the element in or fade the element out.  The possible values are
    /// <code>FadeIn</code> and <code>FadeOut</code>.  The default value is <code>FadeOut</code>.
    /// </value>
    return this._effect;
  },
  set_effect: function (value) {
    value = this._getEnum(value, $AA.FadeEffect);
    if (this._effect != value) {
      this._effect = value;
      this._resetOpacities();
      this.raisePropertyChanged('effect');
    }
  },

  get_minimumOpacity: function () {
    /// <value type="Number">
    /// Minimum opacity to use when fading in or out. Its value can range from between 0 to 1.
    /// The default value is 0.
    /// </value>
    return this._min;
  },
  set_minimumOpacity: function (value) {
    value = this._getFloat(value);
    if (this._min != value) {
      this._min = value;
      this._resetOpacities();
      this.raisePropertyChanged('minimumOpacity');
    }
  },

  get_maximumOpacity: function () {
    /// <value type="Number">
    /// Maximum opacity to use when fading in or out. Its value can range from between 0 to 1.
    /// The default value is 1.
    /// </value>
    return this._max;
  },
  set_maximumOpacity: function (value) {
    value = this._getFloat(value);
    if (this._max != value) {
      this._max = value;
      this._resetOpacities();
      this.raisePropertyChanged('maximumOpacity');
    }
  },

  get_forceLayoutInIE: function () {
    /// <value type="Boolean">
    /// Whether or not we should force a layout to be created for Internet Explorer by giving it a width and setting its
    /// background color (the latter is required in case the user has ClearType enabled). The default value is <code>true</code>.
    /// This is obviously ignored when working in other browsers.
    /// </value>
    return this._forceLayoutInIE;
  },
  set_forceLayoutInIE: function (value) {
    value = this._getBoolean(value);
    if (this._forceLayoutInIE != value) {
      this._forceLayoutInIE = value;
      this.raisePropertyChanged('forceLayoutInIE');
    }
  },

  set_startValue: function (value) {
    /// <value type="Number">
    /// Set the start value (so that child animations can set the current opacity as the start value when fading in or out)
    /// </value>
    value = this._getFloat(value);
    this._start = value;
  }
}
$AA.FadeAnimation.registerClass('AjaxControlToolkit.Animation.FadeAnimation', $AA.Animation);
$AA.registerAnimation('fade', $AA.FadeAnimation);


$AA.FadeInAnimation = function (target, duration, fps, minimumOpacity, maximumOpacity, forceLayoutInIE) {
  /// <summary>
  /// The <code>FadeInAnimation</code> will fade the target in by moving from hidden to visible.
  /// It starts the animation the target's current opacity.
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 1.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="minimumOpacity" type="Number" mayBeNull="true" optional="true">
  /// Minimum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 0.
  /// </param>
  /// <param name="maximumOpacity" type="Number" mayBeNull="true" optional="true">
  /// Maximum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 1.
  /// </param>
  /// <param name="forceLayoutInIE" type="Boolean" mayBeNull="true" optional="true">
  /// Whether or not we should force a layout to be created for Internet Explorer by giving it a width and setting its
  /// background color (the latter is required in case the user has ClearType enabled). The default value is <code>true</code>.
  /// This is obviously ignored when working in other browsers.
  /// </param>
  /// <animation>FadeIn</animation>
  $AA.FadeInAnimation.initializeBase(this, [target, duration, fps, $AA.FadeEffect.FadeIn, minimumOpacity, maximumOpacity, forceLayoutInIE]);
}
$AA.FadeInAnimation.prototype = {
  onStart: function () {
    /// <summary>
    /// The <code>onStart</code> method is called just before the animation is played each time.
    /// </summary>
    /// <returns />
    $AA.FadeInAnimation.callBaseMethod(this, 'onStart');

    if (this._currentTarget) {
      this.set_startValue($common.getElementOpacity(this._currentTarget));
    }
  }
}
$AA.FadeInAnimation.registerClass('AjaxControlToolkit.Animation.FadeInAnimation', $AA.FadeAnimation);
$AA.registerAnimation('fadeIn', $AA.FadeInAnimation);


$AA.FadeOutAnimation = function (target, duration, fps, minimumOpacity, maximumOpacity, forceLayoutInIE) {
  /// <summary>
  /// The FadeInAnimation will fade the element out by moving from visible to hidden. It starts the animation
  /// at the element's current opacity.
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 1.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="minimumOpacity" type="Number" mayBeNull="true" optional="true">
  /// Minimum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 0.
  /// </param>
  /// <param name="maximumOpacity" type="Number" mayBeNull="true" optional="true">
  /// Maximum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 1.
  /// </param>
  /// <param name="forceLayoutInIE" type="Boolean" mayBeNull="true" optional="true">
  /// Whether or not we should force a layout to be created for Internet Explorer by giving it a width and setting its
  /// background color (the latter is required in case the user has ClearType enabled). The default value is <code>true</code>.
  /// This is obviously ignored when working in other browsers.
  /// </param>
  /// <animation>FadeOut</animation>
  $AA.FadeOutAnimation.initializeBase(this, [target, duration, fps, $AA.FadeEffect.FadeOut, minimumOpacity, maximumOpacity, forceLayoutInIE]);
}
$AA.FadeOutAnimation.prototype = {
  onStart: function () {
    /// <summary>
    /// The <code>onStart</code> method is called just before the animation is played each time.
    /// </summary>
    /// <returns />
    $AA.FadeOutAnimation.callBaseMethod(this, 'onStart');

    if (this._currentTarget) {
      this.set_startValue($common.getElementOpacity(this._currentTarget));
    }
  }
}
$AA.FadeOutAnimation.registerClass('AjaxControlToolkit.Animation.FadeOutAnimation', $AA.FadeAnimation);
$AA.registerAnimation('fadeOut', $AA.FadeOutAnimation);


$AA.PulseAnimation = function (target, duration, fps, iterations, minimumOpacity, maximumOpacity, forceLayoutInIE) {
  /// <summary>
  /// The PulseAnimation fades an element in and our repeatedly to create a pulsating
  /// effect.  The iterations determines how many pulses there will be (which defaults
  /// to three, but it will repeat infinitely if given zero or less).  The duration
  /// property defines the duration of each fade in or fade out, not the duration of
  /// the animation as a whole.
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 1.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="iterations" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of times to repeatedly play the sequence.  If zero or less iterations are specified, the sequence
  /// will repeat forever.  The default value is 1 iteration.
  /// </param>
  /// <param name="minimumOpacity" type="Number" mayBeNull="true" optional="true">
  /// Minimum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 0.
  /// </param>
  /// <param name="maximumOpacity" type="Number" mayBeNull="true" optional="true">
  /// Maximum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 1.
  /// </param>
  /// <param name="forceLayoutInIE" type="Boolean" mayBeNull="true" optional="true">
  /// Whether or not we should force a layout to be created for Internet Explorer by giving it a width and setting its
  /// background color (the latter is required in case the user has ClearType enabled). The default value is <code>true</code>.
  /// This is obviously ignored when working in other browsers.
  /// </param>
  /// <animation>Pulse</animation>
  $AA.PulseAnimation.initializeBase(this, [target, duration, fps, null, ((iterations !== undefined) ? iterations : 3)]);

  // Create the FadeOutAnimation
  this._out = new $AA.FadeOutAnimation(target, duration, fps, minimumOpacity, maximumOpacity, forceLayoutInIE);
  this.add(this._out);

  // Create the FadeInAnimation
  this._in = new $AA.FadeInAnimation(target, duration, fps, minimumOpacity, maximumOpacity, forceLayoutInIE);
  this.add(this._in);
}
$AA.PulseAnimation.prototype = {

  get_minimumOpacity: function () {
    /// <value type="Number">
    /// Minimum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 0.
    /// </value>
    return this._out.get_minimumOpacity();
  },
  set_minimumOpacity: function (value) {
    value = this._getFloat(value);
    this._out.set_minimumOpacity(value);
    this._in.set_minimumOpacity(value);
    this.raisePropertyChanged('minimumOpacity');
  },

  get_maximumOpacity: function () {
    /// <value type="Number">
    /// Maximum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 1.
    /// </value>
    return this._out.get_maximumOpacity();
  },
  set_maximumOpacity: function (value) {
    value = this._getFloat(value);
    this._out.set_maximumOpacity(value);
    this._in.set_maximumOpacity(value);
    this.raisePropertyChanged('maximumOpacity');
  },

  get_forceLayoutInIE: function () {
    /// <value type="Boolean">
    /// Whether or not we should force a layout to be created for Internet Explorer by giving it a width and setting its
    /// background color (the latter is required in case the user has ClearType enabled). The default value is <code>true</code>.
    /// This is obviously ignored when working in other browsers.
    /// </value>
    return this._out.get_forceLayoutInIE();
  },
  set_forceLayoutInIE: function (value) {
    value = this._getBoolean(value);
    this._out.set_forceLayoutInIE(value);
    this._in.set_forceLayoutInIE(value);
    this.raisePropertyChanged('forceLayoutInIE');
  },

  set_duration: function (value) {
    /// <value type="Number">
    /// Override the <code>duration</code> property
    /// </value>
    value = this._getFloat(value);
    $AA.PulseAnimation.callBaseMethod(this, 'set_duration', [value]);
    this._in.set_duration(value);
    this._out.set_duration(value);
  },

  set_fps: function (value) {
    /// <value type="Number" integer="true">
    /// Override the <code>fps</code> property
    /// </value>
    value = this._getInteger(value);
    $AA.PulseAnimation.callBaseMethod(this, 'set_fps', [value]);
    this._in.set_fps(value);
    this._out.set_fps(value);
  }

}
$AA.PulseAnimation.registerClass('AjaxControlToolkit.Animation.PulseAnimation', $AA.SequenceAnimation);
$AA.registerAnimation('pulse', $AA.PulseAnimation);


$AA.PropertyAnimation = function (target, duration, fps, property, propertyKey) {
  /// <summary>
  /// The <code>PropertyAnimation</code> is a useful base animation that will assign the value from
  /// <code>getAnimatedValue</code> to a specified <code>property</code>. You can provide the name of
  /// a <code>property</code> alongside an optional <code>propertyKey</code> (which indicates the value
  /// <code>property[propertyKey]</code>, like <code>style['backgroundColor']</code>).
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 1.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="property" type="String" mayBeNull="true" optional="true">
  /// Property of the <code>target</code> element to set when animating
  /// </param>
  /// <param name="propertyKey" type="String" mayBeNull="true" optional="true">
  /// Optional key of the property to be set (which indicates the value property[propertyKey], like style['backgroundColor']). Note that for the style property, the key must be in a JavaScript friendly format (i.e. backgroundColor instead of background-color).
  /// </param>
  /// <animation>Property</animation>
  $AA.PropertyAnimation.initializeBase(this, [target, duration, fps]);

  // Name of the property to set
  this._property = property;

  // Optional Key of the property to set (i.e., if the property were "style" then
  // this might be "backgroundColor")
  this._propertyKey = propertyKey;

  // Current target of the animation that is cached before the animation plays (since looking up
  // the target could mean walking all the way up to the root of the animation's tree, which we don't
  // want to do for every step of the animation)
  this._currentTarget = null;
}
$AA.PropertyAnimation.prototype = {
  onStart: function () {
    /// <summary>
    /// The <code>onStart</code> method is called just before the animation is played each time.
    /// </summary>
    /// <returns />
    $AA.PropertyAnimation.callBaseMethod(this, 'onStart');

    this._currentTarget = this.get_target();
  },

  setValue: function (value) {
    /// <summary>
    /// Set the current value of the property
    /// </summary>
    /// <param name="value" type="Object" mayBeNull="true">
    /// Value to assign
    /// </param>
    /// <returns />

    var element = this._currentTarget;
    if (element && this._property && this._property.length > 0) {
      if (this._propertyKey && this._propertyKey.length > 0 && element[this._property]) {
        element[this._property][this._propertyKey] = value;
      } else {
        element[this._property] = value;
      }
    }
    // Sys.TypeDescriptor.setProperty(this.get_target(), this._property, value, this._propertyKey);
  },

  getValue: function () {
    /// <summary>
    /// Get the current value from the property
    /// </summary>
    /// <returns type="Object" mayBeNull="true">
    /// Current value of the property
    /// </returns>

    var element = this.get_target();
    if (element && this._property && this._property.length > 0) {
      var property = element[this._property];
      if (property) {
        if (this._propertyKey && this._propertyKey.length > 0) {
          return property[this._propertyKey];
        }
        return property;
      }
    }
    return null;
    // return Sys.TypeDescriptor.getProperty(this.get_target(), this._property, this._propertyKey);
  },

  get_property: function () {
    /// <value type="String">
    /// Property of the <code>target</code> element to set when animating
    /// </value>
    return this._property;
  },
  set_property: function (value) {
    if (this._property != value) {
      this._property = value;
      this.raisePropertyChanged('property');
    }
  },

  get_propertyKey: function () {
    /// <value type="String" mayBeNull="true" optional="true">
    /// Optional key of the property to be set (which indicates the value property[propertyKey], like style['backgroundColor']). Note that for the style property, the key must be in a JavaScript friendly format (i.e. backgroundColor instead of background-color).
    /// </value>
    return this._propertyKey;
  },
  set_propertyKey: function (value) {
    if (this._propertyKey != value) {
      this._propertyKey = value;
      this.raisePropertyChanged('propertyKey');
    }
  }
}
$AA.PropertyAnimation.registerClass('AjaxControlToolkit.Animation.PropertyAnimation', $AA.Animation);
$AA.registerAnimation('property', $AA.PropertyAnimation);


$AA.DiscreteAnimation = function (target, duration, fps, property, propertyKey, values) {
  /// <summary>
  /// The <code>DiscreteAnimation</code> inherits from <see cref="AjaxControlToolkit.Animation.PropertyAnimation" />
  /// and sets the value of the <code>property</code> to the elements in a provided array of <code>values</code>.
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 1.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="property" type="String" mayBeNull="true" optional="true">
  /// Property of the <code>target</code> element to set when animating
  /// </param>
  /// <param name="propertyKey" type="String" mayBeNull="true" optional="true">
  /// Optional key of the property to be set (which indicates the value property[propertyKey], like style['backgroundColor']). Note that for the style property, the key must be in a JavaScript friendly format (i.e. backgroundColor instead of background-color).
  /// </param>
  /// <param name="values" mayBeNull="true" optional="true" parameterArray="true" elementType="Object">
  /// Array of possible values of the property that will be iterated over as the animation is played
  /// </param>
  /// <animation>Discrete</animation>
  $AA.DiscreteAnimation.initializeBase(this, [target, duration, fps, property, propertyKey]);

  // Values to assign to the property
  this._values = (values && values.length) ? values : [];
}
$AA.DiscreteAnimation.prototype = {
  getAnimatedValue: function (percentage) {
    /// <summary>
    /// Assign the value whose index corresponds to the current percentage
    /// </summary>
    /// <param name="percentage" type="Number">
    /// Percentage of the animation already complete
    /// </param>
    /// <returns type="Object">
    /// State of the animation after the given percentage of its duration has elapsed that will
    /// be passed to <code>setValue</code>
    /// </returns>
    var index = Math.floor(this.interpolate(0, this._values.length - 1, percentage));
    return this._values[index];
  },

  get_values: function () {
    /// <value parameterArray="true" elementType="Object">
    /// Array of possible values of the property that will be iterated over as the animation is played
    /// </value>
    return this._values;
  },
  set_values: function (value) {
    if (this._values != value) {
      this._values = value;
      this.raisePropertyChanged('values');
    }
  }
}
$AA.DiscreteAnimation.registerClass('AjaxControlToolkit.Animation.DiscreteAnimation', $AA.PropertyAnimation);
$AA.registerAnimation('discrete', $AA.DiscreteAnimation);


$AA.InterpolatedAnimation = function (target, duration, fps, property, propertyKey, startValue, endValue) {
  /// <summary>
  /// The <code>InterpolatedAnimation</code> assigns a range of values between <code>startValue</code>
  /// and <code>endValue</code> to the designated property.
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 1.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="property" type="String" mayBeNull="true" optional="true">
  /// Property of the <code>target</code> element to set when animating.  The default value is 'style'.
  /// </param>
  /// <param name="propertyKey" type="String" mayBeNull="true" optional="true">
  /// Optional key of the property to be set (which indicates the value property[propertyKey], like style['backgroundColor']). Note that for the style property, the key must be in a JavaScript friendly format (i.e. backgroundColor instead of background-color).
  /// </param>
  /// <param name="startValue" type="Number" mayBeNull="true" optional="true">
  /// Start of the range of values
  /// </param>
  /// <param name="endValue" type="Number" mayBeNull="true" optional="true">
  /// End of the range of values
  /// </param>
  /// <animation>Interpolated</animation>
  $AA.InterpolatedAnimation.initializeBase(this, [target, duration, fps, ((property !== undefined) ? property : 'style'), propertyKey]);

  // Start and end values
  this._startValue = startValue;
  this._endValue = endValue;
}
$AA.InterpolatedAnimation.prototype = {
  get_startValue: function () {
    /// <value type="Number">
    /// Start of the range of values
    /// </value>
    return this._startValue;
  },
  set_startValue: function (value) {
    value = this._getFloat(value);
    if (this._startValue != value) {
      this._startValue = value;
      this.raisePropertyChanged('startValue');
    }
  },

  get_endValue: function () {
    /// <value type="Number">
    /// End of the range of values
    /// </value>
    return this._endValue;
  },
  set_endValue: function (value) {
    value = this._getFloat(value);
    if (this._endValue != value) {
      this._endValue = value;
      this.raisePropertyChanged('endValue');
    }
  }
}
$AA.InterpolatedAnimation.registerClass('AjaxControlToolkit.Animation.InterpolatedAnimation', $AA.PropertyAnimation);
$AA.registerAnimation('interpolated', $AA.InterpolatedAnimation);


$AA.ColorAnimation = function (target, duration, fps, property, propertyKey, startValue, endValue) {
  /// <summary>
  /// The <code>ColorAnimation</code> transitions the value of the <code>property</code> between
  /// two colors (although it does ignore the alpha channel). The colors must be 7-character hex strings
  /// (like <code>#246ACF</code>).
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 1.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="property" type="String" mayBeNull="true" optional="true">
  /// Property of the <code>target</code> element to set when animating.  The default value is 'style'.
  /// </param>
  /// <param name="propertyKey" type="String" mayBeNull="true" optional="true">
  /// Optional key of the property to be set (which indicates the value property[propertyKey], like style['backgroundColor']). Note that for the style property, the key must be in a JavaScript friendly format (i.e. backgroundColor instead of background-color).
  /// </param>
  /// <param name="startValue" type="String" mayBeNull="true" optional="true">
  /// Start of the range of colors
  /// </param>
  /// <param name="endValue" type="String" mayBeNull="true" optional="true">
  /// End of the range of colors
  /// </param>
  /// <animation>Color</animation>
  $AA.ColorAnimation.initializeBase(this, [target, duration, fps, property, propertyKey, startValue, endValue]);

  // Cached start/end RBG triplets
  this._start = null;
  this._end = null;

  // Flags indicating whether each dimension of color will be interpolated
  this._interpolateRed = false;
  this._interpolateGreen = false;
  this._interpolateBlue = false;
}
$AA.ColorAnimation.prototype = {
  onStart: function () {
    /// <summary>
    /// Determine which dimensions of color will be animated
    /// </summary>
    /// <returns />
    $AA.ColorAnimation.callBaseMethod(this, 'onStart');

    this._start = $AA.ColorAnimation.getRGB(this.get_startValue());
    this._end = $AA.ColorAnimation.getRGB(this.get_endValue());

    this._interpolateRed = (this._start.Red != this._end.Red);
    this._interpolateGreen = (this._start.Green != this._end.Green);
    this._interpolateBlue = (this._start.Blue != this._end.Blue);
  },

  getAnimatedValue: function (percentage) {
    /// <summary>
    /// Get the interpolated color values
    /// </summary>
    /// <param name="percentage" type="Number">
    /// Percentage of the animation already complete
    /// </param>
    /// <returns type="String">
    /// Current color formatted as a 7-character hex string (like <code>#246ACF</code>).
    /// </returns>

    var r = this._start.Red;
    var g = this._start.Green;
    var b = this._start.Blue;

    if (this._interpolateRed)
      r = Math.round(this.interpolate(r, this._end.Red, percentage));

    if (this._interpolateGreen)
      g = Math.round(this.interpolate(g, this._end.Green, percentage));

    if (this._interpolateBlue)
      b = Math.round(this.interpolate(b, this._end.Blue, percentage));

    return $AA.ColorAnimation.toColor(r, g, b);
  },

  set_startValue: function (value) {
    /// <value type="String">
    /// Starting color of the transition formatted as a 7-character hex string (like <code>#246ACF</code>).
    /// </value>

    if (this._startValue != value) {
      this._startValue = value;
      this.raisePropertyChanged('startValue');
    }
  },

  set_endValue: function (value) {
    /// <value type="String">
    /// Ending color of the transition formatted as a 7-character hex string (like <code>#246ACF</code>).
    /// </value>

    if (this._endValue != value) {
      this._endValue = value;
      this.raisePropertyChanged('endValue');
    }
  }
}
$AA.ColorAnimation.getRGB = function (color) {
  /// <summary>
  /// Convert the color to an RGB triplet
  /// </summary>
  /// <param name="color" type="String">
  /// Color formatted as a 7-character hex string (like <code>#246ACF</code>)
  /// </param>
  /// <returns type="Object">
  /// Object representing the color with <code>Red</code>, <code>Green</code>, and <code>Blue</code> properties.
  /// </returns>

  if (!color || color.length != 7) {
    throw String.format(AjaxControlToolkit.Resources.Animation_InvalidColor, color);
  }
  return {
    'Red': parseInt(color.substr(1, 2), 16),
    'Green': parseInt(color.substr(3, 2), 16),
    'Blue': parseInt(color.substr(5, 2), 16)
  };
}
$AA.ColorAnimation.toColor = function (red, green, blue) {
  /// <summary>
  /// Convert an RBG triplet into a 7-character hex string (like <code>#246ACF</code>)
  /// </summary>
  /// <param name="red" type="Number" integer="true">
  /// Value of the color's red dimension
  /// </param>
  /// <param name="green" type="Number" integer="true">
  /// Value of the color's green dimension
  /// </param>
  /// <param name="blue" type="Number" integer="true">
  /// Value of the color's blue dimension
  /// </param>
  /// <returns type="String">
  /// Color as a 7-character hex string (like <code>#246ACF</code>)
  /// </returns>

  var r = red.toString(16);
  var g = green.toString(16);
  var b = blue.toString(16);
  if (r.length == 1) r = '0' + r;
  if (g.length == 1) g = '0' + g;
  if (b.length == 1) b = '0' + b;
  return '#' + r + g + b;
}
$AA.ColorAnimation.registerClass('AjaxControlToolkit.Animation.ColorAnimation', $AA.InterpolatedAnimation);
$AA.registerAnimation('color', $AA.ColorAnimation);


$AA.LengthAnimation = function (target, duration, fps, property, propertyKey, startValue, endValue, unit) {
  /// <summary>
  /// The <code>LengthAnimation</code> is identical to <see cref="AjaxControlToolkit.Animation.InterpolatedAnimation" />
  /// except it adds a <code>unit</code> to the value before assigning it to the <code>property</code>.
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 1.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="property" type="String" mayBeNull="true" optional="true">
  /// Property of the <code>target</code> element to set when animating.  The default value is 'style'.
  /// </param>
  /// <param name="propertyKey" type="String" mayBeNull="true" optional="true">
  /// Optional key of the property to be set (which indicates the value property[propertyKey], like style['backgroundColor']). Note that for the style property, the key must be in a JavaScript friendly format (i.e. backgroundColor instead of background-color).
  /// </param>
  /// <param name="startValue" type="Number" mayBeNull="true" optional="true">
  /// Start of the range of values
  /// </param>
  /// <param name="endValue" type="Number" mayBeNull="true" optional="true">
  /// End of the range of values
  /// </param>
  /// <param name="unit" type="String" mayBeNull="true" optional="true">
  /// Unit of the interpolated values.  The default value is <code>'px'</code>.
  /// </param>
  /// <animation>Length</animation>
  $AA.LengthAnimation.initializeBase(this, [target, duration, fps, property, propertyKey, startValue, endValue]);

  // Unit of length (which defaults to px)
  this._unit = (unit != null) ? unit : 'px';
}
$AA.LengthAnimation.prototype = {

  getAnimatedValue: function (percentage) {
    /// <summary>
    /// Get the interpolated length value
    /// </summary>
    /// <param name="percentage" type="Number">
    /// Percentage of the animation already complete
    /// </param>
    /// <returns type="String">
    /// Interpolated length
    /// </returns>

    var value = this.interpolate(this.get_startValue(), this.get_endValue(), percentage);
    return Math.round(value) + this._unit;
  },

  get_unit: function () {
    /// <value type="String">
    /// Unit of the interpolated values.  The default value is <code>'px'</code>.
    /// </value>
    return this._unit;
  },
  set_unit: function (value) {
    if (this._unit != value) {
      this._unit = value;
      this.raisePropertyChanged('unit');
    }
  }
}
$AA.LengthAnimation.registerClass('AjaxControlToolkit.Animation.LengthAnimation', $AA.InterpolatedAnimation);
$AA.registerAnimation('length', $AA.LengthAnimation);


$AA.MoveAnimation = function (target, duration, fps, horizontal, vertical, relative, unit) {
  /// <summary>
  /// The <code>MoveAnimation</code> is used to move the <code>target</code> element. If the
  /// <code>relative</code> flag is set to <code>true</code>, then it treats the <code>horizontal</code>
  /// and <code>vertical</code> properties as offsets to move the element. If the <code>relative</code>
  /// flag is <code>false</code>, then it will treat the <code>horizontal</code> and <code>vertical</code>
  /// properties as coordinates on the page where the <code>target</code> element should be moved. It is
  /// important to note that the <code>target</code> must be positioned (i.e. <code>absolutely</code>) so
  /// that settings its <code>top</code>/<code>left<code> style attributes will change its location.
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 1.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="horizontal" type="Number" mayBeNull="true" optional="true">
  /// If <code>relative</code>  is <code>true</code>, this is the offset to move horizontally. Otherwise this is the x
  /// coordinate on the page where the <code>target</code> should be moved.
  /// </param>
  /// <param name="vertical" type="Number" mayBeNull="true" optional="true">
  /// If <code>relative</code> is <code>true</code>, this is the offset to move vertically. Otherwise this is the y
  /// coordinate on the page where the <code>target</code> should be moved.
  /// </param>
  /// <param name="relative" type="Boolean" mayBeNull="true" optional="true">
  /// <code>true</code> if we are moving relative to the current position, <code>false</code> if we are moving absolutely
  /// </param>
  /// <param name="unit" type="String" mayBeNull="true" optional="true">
  /// Length unit for the size of the <code>target</code>. The default value is <code>'px'</code>.
  /// </param>
  /// <animation>Move</animation>
  $AA.MoveAnimation.initializeBase(this, [target, duration, fps, null]);

  // Distance to move horizontally and vertically
  this._horizontal = horizontal ? horizontal : 0;
  this._vertical = vertical ? vertical : 0;
  this._relative = (relative === undefined) ? true : relative;

  // Length animations representing the movememnts
  this._horizontalAnimation = new $AA.LengthAnimation(target, duration, fps, 'style', 'left', null, null, unit);
  this._verticalAnimation = new $AA.LengthAnimation(target, duration, fps, 'style', 'top', null, null, unit);
  this.add(this._verticalAnimation);
  this.add(this._horizontalAnimation);
}
$AA.MoveAnimation.prototype = {

  onStart: function () {
    /// <summary>
    /// Use the <code>target</code>'s current position as the starting point for the animation
    /// </summary>
    /// <returns />
    $AA.MoveAnimation.callBaseMethod(this, 'onStart');

    // Set the start and end values of the animations by getting
    // the element's current position and applying the offsets
    var element = this.get_target();
    this._horizontalAnimation.set_startValue(element.offsetLeft);
    this._horizontalAnimation.set_endValue(this._relative ? element.offsetLeft + this._horizontal : this._horizontal);
    this._verticalAnimation.set_startValue(element.offsetTop);
    this._verticalAnimation.set_endValue(this._relative ? element.offsetTop + this._vertical : this._vertical);
  },

  get_horizontal: function () {
    /// <value type="Number">
    /// If <code>relative</code>  is <code>true</code>, this is the offset to move horizontally. Otherwise this is the x
    /// coordinate on the page where the <code>target</code> should be moved.
    /// </value>
    return this._horizontal;
  },
  set_horizontal: function (value) {
    value = this._getFloat(value);
    if (this._horizontal != value) {
      this._horizontal = value;
      this.raisePropertyChanged('horizontal');
    }
  },

  get_vertical: function () {
    /// <value type="Number">
    /// If <code>relative</code> is <code>true</code>, this is the offset to move vertically. Otherwise this is the y
    /// coordinate on the page where the <code>target</code> should be moved.
    /// </value>
    return this._vertical;
  },
  set_vertical: function (value) {
    value = this._getFloat(value);
    if (this._vertical != value) {
      this._vertical = value;
      this.raisePropertyChanged('vertical');
    }
  },

  get_relative: function () {
    /// <value type="Boolean">
    /// <code>true</code> if we are moving relative to the current position, <code>false</code> if we are moving absolutely
    /// </value>
    return this._relative;
  },
  set_relative: function (value) {
    value = this._getBoolean(value);
    if (this._relative != value) {
      this._relative = value;
      this.raisePropertyChanged('relative');
    }
  },

  get_unit: function () {
    /// <value type="String" mayBeNull="true">
    /// Length unit for the size of the <code>target</code>. The default value is <code>'px'</code>.
    /// </value>
    this._horizontalAnimation.get_unit();
  },
  set_unit: function (value) {
    var unit = this._horizontalAnimation.get_unit();
    if (unit != value) {
      this._horizontalAnimation.set_unit(value);
      this._verticalAnimation.set_unit(value);
      this.raisePropertyChanged('unit');
    }
  }
}
$AA.MoveAnimation.registerClass('AjaxControlToolkit.Animation.MoveAnimation', $AA.ParallelAnimation);
$AA.registerAnimation('move', $AA.MoveAnimation);


$AA.ResizeAnimation = function (target, duration, fps, width, height, unit) {
  /// <summary>
  /// The <code>ResizeAnimation</code> changes the size of the <code>target</code> from its
  /// current value to the specified <code>width</code> and <code>height</code>.
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 1.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="width" type="Number" mayBeNull="true" optional="true">
  /// New width of the <code>target</code>
  /// </param>
  /// <param name="height" type="Number" mayBeNull="true" optional="true">
  /// New height of the <code>target</code>
  /// </param>
  /// <param name="unit" type="String" mayBeNull="true" optional="true">
  /// Length unit for the size of the <code>target</code>. The default value is <code>'px'</code>.
  /// </param>
  /// <animation>Resize</animation>
  $AA.ResizeAnimation.initializeBase(this, [target, duration, fps, null]);

  // New size of the element
  this._width = width;
  this._height = height;

  // Animations to set the size across both dimensions
  this._horizontalAnimation = new $AA.LengthAnimation(target, duration, fps, 'style', 'width', null, null, unit);
  this._verticalAnimation = new $AA.LengthAnimation(target, duration, fps, 'style', 'height', null, null, unit);
  this.add(this._horizontalAnimation);
  this.add(this._verticalAnimation);
}
$AA.ResizeAnimation.prototype = {

  onStart: function () {
    /// <summary>
    /// Use the <code>target</code>'s current size as the starting point for the animation
    /// </summary>
    /// <returns />

    $AA.ResizeAnimation.callBaseMethod(this, 'onStart');

    // Set the start and end values of the animations by getting
    // the element's current width and height
    var element = this.get_target();
    this._horizontalAnimation.set_startValue(element.offsetWidth);
    this._verticalAnimation.set_startValue(element.offsetHeight);
    this._horizontalAnimation.set_endValue((this._width !== null && this._width !== undefined) ?
        this._width : element.offsetWidth);
    this._verticalAnimation.set_endValue((this._height !== null && this._height !== undefined) ?
        this._height : element.offsetHeight);
  },

  get_width: function () {
    /// <value type="Number">
    /// New width of the <code>target</code>
    /// </value>

    return this._width;
  },
  set_width: function (value) {
    value = this._getFloat(value);
    if (this._width != value) {
      this._width = value;
      this.raisePropertyChanged('width');
    }
  },

  get_height: function () {
    /// <value type="Number">
    /// New height of the <code>target</code>
    /// </value>

    return this._height;
  },
  set_height: function (value) {
    value = this._getFloat(value);
    if (this._height != value) {
      this._height = value;
      this.raisePropertyChanged('height');
    }
  },

  get_unit: function () {
    /// <value type="String">
    /// Length unit for the size of the <code>target</code>. The default value is <code>'px'</code>.
    /// </value>

    this._horizontalAnimation.get_unit();
  },
  set_unit: function (value) {
    var unit = this._horizontalAnimation.get_unit();
    if (unit != value) {
      this._horizontalAnimation.set_unit(value);
      this._verticalAnimation.set_unit(value);
      this.raisePropertyChanged('unit');
    }
  }
}
$AA.ResizeAnimation.registerClass('AjaxControlToolkit.Animation.ResizeAnimation', $AA.ParallelAnimation);
$AA.registerAnimation('resize', $AA.ResizeAnimation);









$AA.ScaleAnimation = function (target, duration, fps, scaleFactor, unit, center, scaleFont, fontUnit) {
  /// <summary>
  /// The <code>ScaleAnimation</code> scales the size of the <code>target</code> element by the given <code>scaleFactor</code>
  /// (i.e. a <code>scaleFactor</code> of <code>.5</code> will shrink it in half and a <code>scaleFactor</code> of <code>2.0</code>
  /// will double it).  If <code>scaleFont</code> is <code>true</code>, the size of the font will also scale with the element.  If
  /// <code>center</code> is <code>true</code>, then the element's center will not move as it is scaled.  It is important to note that
  /// the target must be positioned (i.e. absolutely) so that setting its <code>top</code>/<code>left</code> properties will change
  /// its location in order for <code>center</code> to have an effect.
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 1.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="scaleFactor" type="Number" mayBeNull="true" optional="true">
  /// The amount to scale the <code>target</code> (a <code>scaleFactor</code> of <code>.5</code> will
  /// shrink it in half and a <code>scaleFactor</code> of <code>2.0</code> will double it). The default value is
  /// <code>1</code>, which does no scaling.
  /// </param>
  /// <param name="unit" type="String" mayBeNull="true" optional="true">
  /// Length unit for the size of the <code>target</code>.  The default value is <code>'px'</code>.
  /// </param>
  /// <param name="center" type="Boolean" mayBeNull="true" optional="true">
  /// Whether the <code>target</code> should stay centered while scaling
  /// </param>
  /// <param name="scaleFont" type="Boolean" mayBeNull="true" optional="true">
  /// Whether the font should be scaled along with the size
  /// </param>
  /// <param name="fontUnit" type="String" mayBeNull="true" optional="true">
  /// Unit of the font, which is only used if <code>scaleFont</code> is <code>true</code>.
  /// The default value is <code>'pt'</code>.
  /// </param>
  /// <animation>Scale</animation>
  $AA.ScaleAnimation.initializeBase(this, [target, duration, fps]);

  // Percentage to scale
  this._scaleFactor = (scaleFactor !== undefined) ? scaleFactor : 1;
  this._unit = (unit !== undefined) ? unit : 'px';

  // Center the content while scaling
  this._center = center;

  // Scale the font size as well
  this._scaleFont = scaleFont;
  this._fontUnit = (fontUnit !== undefined) ? fontUnit : 'pt';

  // Initial values
  this._element = null;
  this._initialHeight = null;
  this._initialWidth = null;
  this._initialTop = null;
  this._initialLeft = null;
  this._initialFontSize = null;
}
$AA.ScaleAnimation.prototype = {
  getAnimatedValue: function (percentage) {
    /// <summary>
    /// Get the amount to scale the <code>target</code>
    /// </summary>
    /// <param name="percentage" type="Number">
    /// Percentage of the animation already complete
    /// </param>
    /// <returns type="Number">
    /// Percentage to scale the <code>target</code>
    /// </returns>
    return this.interpolate(1.0, this._scaleFactor, percentage);
  },

  onStart: function () {
    /// <summary>
    /// Cache the initial size because it will be used to determine how much to scale the element at each step of the animation
    /// </summary>
    /// <returns />
    $AA.ScaleAnimation.callBaseMethod(this, 'onStart');

    this._element = this.get_target();
    if (this._element) {
      this._initialHeight = this._element.offsetHeight;
      this._initialWidth = this._element.offsetWidth;
      if (this._center) {
        this._initialTop = this._element.offsetTop;
        this._initialLeft = this._element.offsetLeft;
      }
      if (this._scaleFont) {
        // Note: we're assuming this is in the same units as fontUnit
        this._initialFontSize = parseFloat(
            $common.getCurrentStyle(this._element, 'fontSize'));
      }
    }
  },

  setValue: function (scale) {
    /// <summary>
    /// Scale the <code>target</code> by the given percentage
    /// </summary>
    /// <param name="scale" type="Number">
    /// Percentage to scale the <code>target</code>
    /// </param>
    /// <returns />

    if (this._element) {
      var width = Math.round(this._initialWidth * scale);
      var height = Math.round(this._initialHeight * scale);
      this._element.style.width = width + this._unit;
      this._element.style.height = height + this._unit;

      if (this._center) {
        this._element.style.top = (this._initialTop +
            Math.round((this._initialHeight - height) / 2)) + this._unit;
        this._element.style.left = (this._initialLeft +
            Math.round((this._initialWidth - width) / 2)) + this._unit;
      }

      if (this._scaleFont) {
        var size = this._initialFontSize * scale;
        if (this._fontUnit == 'px' || this._fontUnit == 'pt') {
          size = Math.round(size);
        }
        this._element.style.fontSize = size + this._fontUnit;
      }
    }
  },

  onEnd: function () {
    /// <summary>
    /// Wipe the cached values after the animation completes
    /// </summary>
    /// <returns />

    this._element = null;
    this._initialHeight = null;
    this._initialWidth = null;
    this._initialTop = null;
    this._initialLeft = null;
    this._initialFontSize = null;
    $AA.ScaleAnimation.callBaseMethod(this, 'onEnd');
  },

  get_scaleFactor: function () {
    /// <value type="Number">
    /// The amount to scale the <code>target</code> (a <code>scaleFactor</code> of <code>.5</code> will
    /// shrink it in half and a <code>scaleFactor</code> of <code>2.0</code> will double it). The default value is
    /// <code>1</code>, which does no scaling.
    /// </value>

    return this._scaleFactor;
  },
  set_scaleFactor: function (value) {
    value = this._getFloat(value);
    if (this._scaleFactor != value) {
      this._scaleFactor = value;
      this.raisePropertyChanged('scaleFactor');
    }
  },

  get_unit: function () {
    /// <value type="String">
    /// Length unit for the size of the <code>target</code>.  The default value is <code>'px'</code>.
    /// </value>
    return this._unit;
  },
  set_unit: function (value) {
    if (this._unit != value) {
      this._unit = value;
      this.raisePropertyChanged('unit');
    }
  },

  get_center: function () {
    /// <value type="Boolean">
    /// Whether the <code>target</code> should stay centered while scaling
    /// </value>
    return this._center;
  },
  set_center: function (value) {
    value = this._getBoolean(value);
    if (this._center != value) {
      this._center = value;
      this.raisePropertyChanged('center');
    }
  },

  get_scaleFont: function () {
    /// <value type="Boolean">
    /// Whether the font should be scaled along with the size
    /// </value>
    return this._scaleFont;
  },
  set_scaleFont: function (value) {
    value = this._getBoolean(value);
    if (this._scaleFont != value) {
      this._scaleFont = value;
      this.raisePropertyChanged('scaleFont');
    }
  },

  get_fontUnit: function () {
    /// <value type="String">
    /// Unit of the font, which is only used if <code>scaleFont</code> is <code>true</code>.
    /// The default value is <code>'pt'</code>.
    /// </value>
    return this._fontUnit;
  },
  set_fontUnit: function (value) {
    if (this._fontUnit != value) {
      this._fontUnit = value;
      this.raisePropertyChanged('fontUnit');
    }
  }
}
$AA.ScaleAnimation.registerClass('AjaxControlToolkit.Animation.ScaleAnimation', $AA.Animation);
$AA.registerAnimation('scale', $AA.ScaleAnimation);


$AA.Action = function (target, duration, fps) {
  /// <summary>
  /// <code>Action</code> is a base class for all "non-animating" animations that provides empty implementations
  /// for abstract methods and adds a <code>doAction</code> method that will be called to perform the action's
  /// operation.  While regular animations perform an operation in a sequence of small steps spread over an interval,
  /// the actions perform a single operation instantaneously.  By default, all actions have a <code>duration</code>
  /// of zero.  The actions are very useful for defining complex animations.
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 0.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <animation>Action</animation>
  $AA.Action.initializeBase(this, [target, duration, fps]);

  // Set the duration to 0 if it wasn't specified
  if (duration === undefined) {
    this.set_duration(0);
  }
}
$AA.Action.prototype = {

  onEnd: function () {
    /// <summary>
    /// Call the <code>doAction</code> method when the animation completes
    /// </summary>
    /// <returns />
    this.doAction();
    $AA.Action.callBaseMethod(this, 'onEnd');
  },

  doAction: function () {
    /// <summary>
    /// The <code>doAction</code> method must be implemented by all actions
    /// </summary>
    /// <returns />
    throw Error.notImplemented();
  },

  getAnimatedValue: function () {
    /// <summary>
    /// Empty implementation of required abstract method
    /// </summary>
  },
  setValue: function () {
    /// <summary>
    /// Empty implementation of required abstract method
    /// </summary>
  }
}
$AA.Action.registerClass('AjaxControlToolkit.Animation.Action', $AA.Animation);
$AA.registerAnimation('action', $AA.Action);


$AA.EnableAction = function (target, duration, fps, enabled) {
  /// <summary>
  /// The <code>EnableAction</code> changes whether or not the <code>target</code> is disabled.
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 0.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="enabled" type="Boolean" mayBeNull="true" optional="true">
  /// Whether or not the <code>target</code> is disabled. The default value is <code>true</code>.
  /// </param>
  /// <animation>EnableAction</animation>
  $AA.EnableAction.initializeBase(this, [target, duration, fps]);

  // Whether to enable or disable
  this._enabled = (enabled !== undefined) ? enabled : true;
}
$AA.EnableAction.prototype = {
  doAction: function () {
    /// <summary>
    /// Set the enabled property of the <code>target</code>
    /// </summary>
    /// <returns />

    var element = this.get_target();
    if (element) {
      element.disabled = !this._enabled;
    }
  },

  get_enabled: function () {
    /// <value type="Boolean">
    /// Whether or not the <code>target</code> is disabled. The default value is <code>true</code>.
    /// </value>
    return this._enabled;
  },
  set_enabled: function (value) {
    value = this._getBoolean(value);
    if (this._enabled != value) {
      this._enabled = value;
      this.raisePropertyChanged('enabled');
    }
  }
}
$AA.EnableAction.registerClass('AjaxControlToolkit.Animation.EnableAction', $AA.Action);
$AA.registerAnimation('enableAction', $AA.EnableAction);


$AA.HideAction = function (target, duration, fps, visible) {
  /// <summary>
  /// The <code>HideAction</code> simply hides the <code>target</code> from view
  /// (by setting its style's <code>display</code> attribute to <code>'none'</code>)
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 0.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="visible" type="Boolean" mayBeNull="False">
  /// True to show the target, false to hide it.  The default value is false.
  /// </param>
  /// <animation>HideAction</animation>
  $AA.HideAction.initializeBase(this, [target, duration, fps]);

  this._visible = visible;
}
$AA.HideAction.prototype = {
  doAction: function () {
    /// <summary>
    /// Hide the <code>target</code>
    /// </summary>
    /// <returns />
    var element = this.get_target();
    if (element) {
      $common.setVisible(element, this._visible);
    }
  },

  get_visible: function () {
    /// <value type="Boolean" mayBeNull="False">
    /// True to show the target, false to hide it.  The default value is false.
    /// </value>
    return this._visible;
  },
  set_visible: function (value) {
    if (this._visible != value) {
      this._visible = value;
      this.raisePropertyChanged('visible');
    }
  }
}
$AA.HideAction.registerClass('AjaxControlToolkit.Animation.HideAction', $AA.Action);
$AA.registerAnimation('hideAction', $AA.HideAction);


$AA.StyleAction = function (target, duration, fps, attribute, value) {
  /// <summary>
  /// The <code>StyleAction<code> is used to set a particular <code>attribute</code> of the <code>target</code>'s style
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 0.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="attribute" type="String" mayBeNull="true" optional="true">
  /// Style attribute to set (this must be in a JavaScript friendly format, i.e. <code>backgroundColor</code>
  /// instead of <code>background-color</code>)
  /// </param>
  /// <param name="value" type="String" mayBeNull="true" optional="true">
  /// Value to set the <code>attribute</code>
  /// </param>
  /// <animation>StyleAction</animation>
  $AA.StyleAction.initializeBase(this, [target, duration, fps]);

  // Style attribute (like "backgroundColor" or "borderWidth"
  this._attribute = attribute;

  // Value to assign to the style attribute
  this._value = value;

}
$AA.StyleAction.prototype = {
  doAction: function () {
    /// <summary>
    /// Assign the <code>value</code> to the style's <code>attribute</code>
    /// </summary>
    /// <returns />
    var element = this.get_target();
    if (element) {
      element.style[this._attribute] = this._value;
    }
  },

  get_attribute: function () {
    /// <value type="String">
    /// Style attribute to set (this must be in a JavaScript friendly format, i.e. <code>backgroundColor</code>
    /// instead of <code>background-color</code>)
    /// </value>
    return this._attribute;
  },
  set_attribute: function (value) {
    if (this._attribute != value) {
      this._attribute = value;
      this.raisePropertyChanged('attribute');
    }
  },

  get_value: function () {
    /// <value type="String">
    /// Value to set the <code>attribute</code>
    /// </value>
    return this._value;
  },
  set_value: function (value) {
    if (this._value != value) {
      this._value = value;
      this.raisePropertyChanged('value');
    }
  }
}
$AA.StyleAction.registerClass('AjaxControlToolkit.Animation.StyleAction', $AA.Action);
$AA.registerAnimation('styleAction', $AA.StyleAction);


$AA.OpacityAction = function (target, duration, fps, opacity) {
  /// <summary>
  /// <code>OpacityAction</code> allows you to set the <code>opacity</code> of the <code>target</code>
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 0.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="opacity" type="Number" mayBeNull="true" optional="true">
  /// Opacity to set the <code>target</code>
  /// </param>
  /// <animation>OpacityAction</animation>
  $AA.OpacityAction.initializeBase(this, [target, duration, fps]);

  // Opacity
  this._opacity = opacity;
}
$AA.OpacityAction.prototype = {
  doAction: function () {
    /// <summary>
    /// Set the opacity
    /// </summary>
    /// <returns />
    var element = this.get_target();
    if (element) {
      $common.setElementOpacity(element, this._opacity);
    }
  },

  get_opacity: function () {
    /// <value type="Number">
    /// Opacity to set the <code>target</code>
    /// </value>
    return this._opacity;
  },
  set_opacity: function (value) {
    value = this._getFloat(value);
    if (this._opacity != value) {
      this._opacity = value;
      this.raisePropertyChanged('opacity');
    }
  }
}
$AA.OpacityAction.registerClass('AjaxControlToolkit.Animation.OpacityAction', $AA.Action);
$AA.registerAnimation('opacityAction', $AA.OpacityAction);


$AA.ScriptAction = function (target, duration, fps, script) {
  /// <summary>
  /// The <code>ScriptAction</code> is used to execute arbitrary JavaScript
  /// </summary>
  /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
  /// Target of the animation
  /// </param>
  /// <param name="duration" type="Number" mayBeNull="true" optional="true">
  /// Length of the animation in seconds.  The default is 0.
  /// </param>
  /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
  /// Number of steps per second.  The default is 25.
  /// </param>
  /// <param name="script" type="String" mayBeNull="true" optional="true">
  /// JavaScript to execute
  /// </param>
  /// <animation>ScriptAction</animation>
  $AA.ScriptAction.initializeBase(this, [target, duration, fps]);

  // Script to execute
  this._script = script;
}
$AA.ScriptAction.prototype = {
  doAction: function () {
    /// <summary>
    /// Execute the script
    /// </summary>
    /// <returns />
    try {
      eval(this._script);
    } catch (ex) {
    }
  },

  get_script: function () {
    /// <value type="String">
    /// JavaScript to execute
    /// </value>
    return this._script;
  },
  set_script: function (value) {
    if (this._script != value) {
      this._script = value;
      this.raisePropertyChanged('script');
    }
  }
}
$AA.ScriptAction.registerClass('AjaxControlToolkit.Animation.ScriptAction', $AA.Action);
$AA.registerAnimation('scriptAction', $AA.ScriptAction);

///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\atlastoolkit\AlwaysVisibleControlBehavior.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Compat/Timer/Timer.js" />
/// <reference path="../Common/Common.js" />
/// <reference path="../Animation/Animations.js" />


Type.registerNamespace('AjaxControlToolkit');

AjaxControlToolkit.HorizontalSide = function () {
  /// <summary>
  /// The HorizontalSide enumeration describes the horizontal side
  /// of the window used to anchor the element
  /// </summary>
  /// <field name="Left" type="Number" integer="true" />
  /// <field name="Center" type="Number" integer="true" />
  /// <field name="Right" type="Number" integer="true" />
  throw Error.invalidOperation();
}
AjaxControlToolkit.HorizontalSide.prototype = {
  Left: 0,
  Center: 1,
  Right: 2
}
AjaxControlToolkit.HorizontalSide.registerEnum("AjaxControlToolkit.HorizontalSide", false);


AjaxControlToolkit.VerticalSide = function () {
  /// <summary>
  /// The VerticalSide enumeration describes the vertical side
  /// of the window used to anchor the element
  /// </summary>
  /// <field name="Top" type="Number" integer="true" />
  /// <field name="Middle" type="Number" integer="true" />
  /// <field name="Bottom" type="Number" integer="true" />
  throw Error.invalidOperation();
}
AjaxControlToolkit.VerticalSide.prototype = {
  Top: 0,
  Middle: 1,
  Bottom: 2
}
AjaxControlToolkit.VerticalSide.registerEnum("AjaxControlToolkit.VerticalSide", false);


AjaxControlToolkit.AlwaysVisibleControlBehavior = function (element) {
  /// <summary>
  /// The AlwaysVisibleControl behavior is used to fix a particular control a specified distance
  /// from the top/left corner at all times regardless of how the users scrolls or sizes the window.
  /// </summary>
  /// <param name="element" type="Sys.UI.DomElement" domElement="true">
  /// The DOM element the behavior is associated with
  /// </param>
  AjaxControlToolkit.AlwaysVisibleControlBehavior.initializeBase(this, [element]);

  // Desired offset from the horizontal edge of the window
  this._horizontalOffset = 0;

  // Vertical side of the window used to anchor the element
  this._horizontalSide = AjaxControlToolkit.HorizontalSide.Left;

  // Desired offset from the vertical edge of the window
  this._verticalOffset = 0;

  // Vertical side of the window used to anchor the element
  this._verticalSide = AjaxControlToolkit.VerticalSide.Top;

  // Custom property indicating the desired
  // duration of the scrolling effect
  this._scrollEffectDuration = .1;

  // Member variable used to handle the window's scroll and resize events
  this._repositionHandler = null;

  // The _animate flag is used to decide if we should play the animations whenever
  // the page is scrolled or resized.  We only need to do this on browsers that don't
  // support CSS position: fixed (i.e., IE <= 6).
  this._animate = false;

  // Animation to handle moving the element
  this._animation = null;
}
AjaxControlToolkit.AlwaysVisibleControlBehavior.prototype = {
  initialize: function () {
    /// <summary>
    /// Initialize the behavior
    /// </summary>
    /// <returns />
    AjaxControlToolkit.AlwaysVisibleControlBehavior.callBaseMethod(this, 'initialize');

    var element = this.get_element();
    if (!element) throw Error.invalidOperation(AjaxControlToolkit.Resources.AlwaysVisible_ElementRequired);

    // Create the resposition handler used to place the element
    this._repositionHandler = Function.createDelegate(this, this._reposition);

    // Determine whether or not to use animations (i.e. whether or not the browser
    // supports CSS position: fixed).  All major browsers except IE 6 or earlier support it.
    // Don't animate if we're running a version of IE greater than 6
    this._animate = (Sys.Browser.agent == Sys.Browser.InternetExplorer && Sys.Browser.version < 7);
    if (this._animate) {
      // Initialize the animations to use the actual properties
      this._animation = new AjaxControlToolkit.Animation.MoveAnimation(
          element, this._scrollEffectDuration, 25, 0, 0, false, 'px');

      // Make the control use absolute positioning to hover
      // appropriately and move it to its new home
      element.style.position = 'absolute';
    } else {
      // Make the control use fixed positioning to keep it from moving
      // while the content behind it slides around
      element.style.position = 'fixed';
    }

    // Attach the onResize handler
    $addHandler(window, 'resize', this._repositionHandler);

    // Attach the onscroll event handler for the animations
    if (this._animate) {
      $addHandler(window, 'scroll', this._repositionHandler);
    }

    // Move to the initial position
    this._reposition();
  },

  dispose: function () {
    /// <summary>
    /// Dispose the behavior
    /// </summary>
    /// <returns />

    // Detach the event and wipe the delegate
    if (this._repositionHandler) {
      if (this._animate) {
        $removeHandler(window, 'scroll', this._repositionHandler);
      }
      $removeHandler(window, 'resize', this._repositionHandler);
      this._repositionHandler = null;
    }

    // Dispose the animation
    if (this._animation) {
      this._animation.dispose();
      this._animation = null;
    }

    AjaxControlToolkit.AlwaysVisibleControlBehavior.callBaseMethod(this, 'dispose');
  },

  _reposition: function (eventObject) {
    /// <summary>
    /// Handler to reposition the element and place it where it actually belongs
    /// whenever the browser is scrolled or resized
    /// </summary>
    /// <param name="eventObject" type="Sys.UI.DomEvent">
    /// Event info
    /// </param>
    /// <returns />

    var element = this.get_element();
    if (!element) return;

    this.raiseRepositioning(Sys.EventArgs.Empty);

    var x = 0;
    var y = 0;

    // Compute the initial offset if we're animating
    if (this._animate) {
      if (document.documentElement && document.documentElement.scrollTop) {
        x = document.documentElement.scrollLeft;
        y = document.documentElement.scrollTop;
      } else {
        x = document.body.scrollLeft;
        y = document.body.scrollTop;
      }
    }

    // Compute the width and height of the client
    var clientBounds = $common.getClientBounds();
    var width = clientBounds.width;
    var height = clientBounds.height;

    // Compute the horizontal coordinate
    switch (this._horizontalSide) {
      case AjaxControlToolkit.HorizontalSide.Center:
        x = Math.max(0, Math.floor(x + width / 2.0 - element.offsetWidth / 2.0 - this._horizontalOffset));
        break;
      case AjaxControlToolkit.HorizontalSide.Right:
        x = Math.max(0, x + width - element.offsetWidth - this._horizontalOffset);
        break;
      case AjaxControlToolkit.HorizontalSide.Left:
      default:
        x += this._horizontalOffset;
        break;
    }

    // Compute the vertical coordinate
    switch (this._verticalSide) {
      case AjaxControlToolkit.VerticalSide.Middle:
        y = Math.max(0, Math.floor(y + height / 2.0 - element.offsetHeight / 2.0 - this._verticalOffset));
        break;
      case AjaxControlToolkit.VerticalSide.Bottom:
        y = Math.max(0, y + height - element.offsetHeight - this._verticalOffset);
        break;
      case AjaxControlToolkit.VerticalSide.Top:
      default:
        y += this._verticalOffset;
        break;
    }

    // Move the element to its new position
    if (this._animate && this._animation) {
      this._animation.stop();
      this._animation.set_horizontal(x);
      this._animation.set_vertical(y);
      this._animation.play();
    } else {
      element.style.left = x + 'px';
      element.style.top = y + 'px';
    }

    this.raiseRepositioned(Sys.EventArgs.Empty);
  },

  get_HorizontalOffset: function () {
    /// <value type="Number" integer="true">
    /// Distance to the horizontal edge of the browser in pixels from the same side of the target control. The default is 0 pixels.
    /// </value>
    return this._horizontalOffset;
  },
  set_HorizontalOffset: function (value) {
    if (this._horizontalOffset != value) {
      this._horizontalOffset = value;
      this._reposition();
      this.raisePropertyChanged('HorizontalOffset');
    }
  },

  get_HorizontalSide: function () {
    /// <value type="AjaxControlToolkit.HorizontalSide" integer="true">
    /// Horizontal side of the browser to anchor the control against.  The default is the Left side.
    /// </value>
    return this._horizontalSide;
  },
  set_HorizontalSide: function (value) {
    if (this._horizontalSide != value) {
      this._horizontalSide = value;
      this._reposition();
      this.raisePropertyChanged('HorizontalSide');
    }
  },

  get_VerticalOffset: function () {
    /// <value type="Number" integer="true">
    /// Distance to the vertical edge of the browser in pixels from the same side of the target control. The default is 0 pixels.
    /// </value>
    return this._verticalOffset;
  },
  set_VerticalOffset: function (value) {
    if (this._verticalOffset != value) {
      this._verticalOffset = value;
      this._reposition();
      this.raisePropertyChanged('VerticalOffset');
    }
  },

  get_VerticalSide: function () {
    /// <value type="AjaxControlToolkit.VerticalSide" integer="true">
    /// Vertical side of the browser to anchor the control against.  The default is the Top side.
    /// </value>
    return this._verticalSide;
  },
  set_VerticalSide: function (value) {
    if (this._verticalSide != value) {
      this._verticalSide = value;
      this._reposition();
      this.raisePropertyChanged('VerticalSide');
    }
  },

  get_ScrollEffectDuration: function () {
    /// <value type="Number">
    /// Length in seconds for the scrolling effect to last when the target control is repositioned. The default is .1 seconds.
    /// </value>
    return this._scrollEffectDuration;
  },
  set_ScrollEffectDuration: function (value) {
    if (this._scrollEffectDuration != value) {
      this._scrollEffectDuration = value;
      if (this._animation) {
        this._animation.set_duration(value);
      }
      this.raisePropertyChanged('ScrollEffectDuration');
    }
  },

  add_repositioning: function (handler) {
    /// <summary>
    /// Add an event handler for the repositioning event
    /// </summary>
    /// <param name="handler" type="Function" mayBeNull="false">
    /// Event handler
    /// </param>
    /// <returns />
    this.get_events().addHandler('repositioning', handler);
  },
  remove_repositioning: function (handler) {
    /// <summary>
    /// Remove an event handler from the repositioning event
    /// </summary>
    /// <param name="handler" type="Function" mayBeNull="false">
    /// Event handler
    /// </param>
    /// <returns />
    this.get_events().removeHandler('repositioning', handler);
  },
  raiseRepositioning: function (eventArgs) {
    /// <summary>
    /// Raise the repositioning event
    /// </summary>
    /// <param name="eventArgs" type="Sys.EventArgs" mayBeNull="false">
    /// Event arguments for the repositioning event
    /// </param>
    /// <returns />

    var handler = this.get_events().getHandler('repositioning');
    if (handler) {
      handler(this, eventArgs);
    }
  },

  add_repositioned: function (handler) {
    /// <summary>
    /// Add an event handler for the repositioned event
    /// </summary>
    /// <param name="handler" type="Function" mayBeNull="false">
    /// Event handler
    /// </param>
    /// <returns />
    this.get_events().addHandler('repositioned', handler);
  },
  remove_repositioned: function (handler) {
    /// <summary>
    /// Remove an event handler from the repositioned event
    /// </summary>
    /// <param name="handler" type="Function" mayBeNull="false">
    /// Event handler
    /// </param>
    /// <returns />
    this.get_events().removeHandler('repositioned', handler);
  },
  raiseRepositioned: function (eventArgs) {
    /// <summary>
    /// Raise the repositioned event
    /// </summary>
    /// <param name="eventArgs" type="Sys.EventArgs" mayBeNull="false">
    /// Event arguments for the repositioned event
    /// </param>
    /// <returns />

    var handler = this.get_events().getHandler('repositioned');
    if (handler) {
      handler(this, eventArgs);
    }
  }
}
AjaxControlToolkit.AlwaysVisibleControlBehavior.registerClass('AjaxControlToolkit.AlwaysVisibleControlBehavior', AjaxControlToolkit.BehaviorBase);
//    getDescriptor : function() {
//        /// <summary>
//        /// Get the type descriptor for this object
//        /// </summary>
//        /// <returns type="???">Type descriptor for this object</returns>
//        var td = AjaxControlToolkit.AlwaysVisibleControlBehavior.callBaseMethod(this, 'getDescriptor');
//        
//        //  Add property declarations
//        td.addProperty('HorizontalOffset', Number);
//        td.addProperty('HorizontalSide', AjaxControlToolkit.HorizontalSide);
//        td.addProperty('VerticalOffset', Number);
//        td.addProperty('VerticalSide', AjaxControlToolkit.VerticalSide);
//        td.addProperty('ScrollEffectDuration', Number);
//    
//        return td;
//    },

///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\lm\Ordering.js
S4N.OrderStatus = function () {
  throw Error.notImplemented();
};
S4N.OrderStatus.prototype = {
  enterTarget: 0,
  leaveTarget: 1,
  drop: 2
};
S4N.OrderStatus.registerEnum('S4N.OrderStatus');


S4N.OrderStatusArgs = function (item, st) {
  S4N.OrderStatusArgs.initializeBase(this);
  this.status = st;
  this.item = item;
};
S4N.OrderStatusArgs.registerClass('S4N.OrderStatusArgs', Sys.EventArgs);

$setIdx = function (el, idx) {
  el.idx = idx;
};
$getIdx = function (el) {
  return el.idx;
};

S4N.ReorderList = function (element) {
  S4N.ReorderList.initializeBase(this, [element]); //tabulka
  this.columnIdx = -1; //sloupec tabulky
  this.rowIdx = -1; //radek tabulky.
  this.doSwap = true; //vymena nebo posunuti
  this.dragTemplate = null; //template pro drag efekt
  this.initValue = null; //array of integer: pocatecni, zamichane poradi

  this.containers = []; //TD's
  this.items = []; //S4N.ReorderListItem, pripojeny k TD
  this.elements = []; //obsahy TD
  this.actOrder = []; //aktualni poradi
  this.itemTemplateInstance = null; //kopie dragTemplate 
};
S4N.ReorderList.prototype = {

  initialize: function () {
    S4N.ReorderList.callBaseMethod(this, 'initialize');
    var el = this._element;
    $assert(this.columnIdx >= 0 || this.rowIdx >= 0, 'error 1');
    $assert(this.columnIdx < 0 || this.rowIdx < 0, 'error 2');
    //Containers
    if (this.rowIdx >= 0) { //_element je row
      var row = el.rows[this.rowIdx];
      for (var i = 0; i < row.cells.length; i++)
        this.containers[i] = row.cells[i];
    } else { //el je table
      for (var i = 0; i < el.rows.length; i++)
        this.containers[i] = el.rows[i].cells[this.columnIdx];
    }
    //Elements: zachovej prave jeden non text element
    for (var i = 0; i < this.containers.length; i++) {
      var childs = this.containers[i].childNodes;
      this.elements[i] = null;
      for (var j = childs.length - 1; j >= 0; j--) {
        if (this.elements[i] != null || childs[j].nodeType != 1) {
          this.containers[i].removeChild(childs[j]);
          continue;
        }
        this.elements[i] = childs[j];
        $setIdx(this.elements[i], i);
      }
      $assert(this.elements[i] != null, 'error 1');
    }
    //Obal td tag D&D objektem
    for (var i = 0; i < this.containers.length; i++) {
      this.items[i] = new S4N.ReorderListItem(this.containers[i], this, i);
      this.items[i].initialize();
    }
  },

  get_dragTemplate: function () { return this.dragTemplate; },
  set_dragTemplate: function (value) { this.dragTemplate = value; },

  get_initValue: function () { return this.initValue; },
  set_initValue: function (value) { this.initValue = value; },

  add_dragStatusChanged: function (handler) { this.get_events().addHandler('dragStatusChanged', handler); },
  add_acceptData: function (handler) { this.get_events().addHandler('acceptData', handler); },
  add_canDrop: function (handler) { this.get_events().addHandler('canDrop', handler); }, //zmena drag efekt elementu po najeti na target

  onCanDrop: function (value) {
    var ev = this.get_events().getHandler('canDrop'); if (ev) ev(this, new S4N.BoolArg(value));
  },

  dragStatusChanged: function (item, st) {
    var ev = this.get_events().getHandler('dragStatusChanged');
    if (ev) ev(this, new S4N.OrderStatusArgs(item, st));
  },

  getTemplate: function (el) {
    //clone template
    if (this.itemTemplateInstance == null) {
      this.itemTemplateInstance = this.dragTemplate.cloneNode(true);
    } else
      this.onCanDrop(false);
    this.itemTemplateInstance.innerHTML = el.innerHTML;
    document.body.appendChild(this.itemTemplateInstance);
    return this.itemTemplateInstance;
  },

  setIdx: function (target, source) {
    var cont = this.containers[target];
    if (source < 0) { //odstraneni vsech elementu z TD
      while (cont.hasChildNodes()) cont.removeChild(cont.childNodes[0]);
      return;
    }
    source = this.actOrder[source];
    var targetIdx = (cont.hasChildNodes() ? cont.childNodes[0].temp_idx : -2);
    if (targetIdx == source) return;
    if (cont.hasChildNodes()) cont.removeChild(cont.childNodes[0]);
    cont.appendChild(this.elements[source]);
  },

  reorderStart: function (srcIdx) {
    for (var i = 0; i < this.elements.length; i++) this.elements[i].temp_idx = i;
    this.srcIdx = srcIdx;
  },

  reorderContinue: function (endIdx) {
    if (this.doSwap) {
      for (var i = 0; i < this.elements.length; i++)
        if (i != this.setIdx && i != endIdx) this.setIdx(i, i);
      this.setIdx(this.srcIdx, endIdx);
      this.setIdx(endIdx, this.srcIdx);
    } else {
      if (this.srcIdx == endIdx) {
        for (var i = 0; i < this.elements.length; i++) this.setIdx(i, i);
      } else if (this.srcIdx < endIdx) {
        for (var i = 0; i < this.srcIdx; i++) this.setIdx(i, i);
        for (var i = this.srcIdx; i < endIdx; i++)
          this.setIdx(i, i + 1);
        this.setIdx(endIdx, this.srcIdx);
        for (var i = endIdx + 1; i < this.elements.length; i++) this.setIdx(i, i);
      } else if (endIdx < this.srcIdx) {
        for (var i = 0; i < endIdx; i++) this.setIdx(i, i);
        for (var i = endIdx; i < this.srcIdx; i++)
          this.setIdx(i + 1, i);
        this.setIdx(endIdx, this.srcIdx);
        for (var i = this.srcIdx + 1; i < this.elements.length; i++) this.setIdx(i, i);
      }
    }
  },

  reorderEnd: function (cancel) {
    if (this.itemTemplateInstance.parentNode == null) return;
    this.itemTemplateInstance.parentNode.removeChild(this.itemTemplateInstance);
    if (cancel)//undo
      for (var i = 0; i < this.elements.length; i++) { this.setIdx(i, i); }
    else
      this.actOrder = this.get_value();
  },

  // S4N.IScoreProvider
  get_sentenceText: function (isOk) {
    var sb = new Sys.StringBuilder();
    if (isOk) {
      for (var i = 0; i < this.elements.length; i++) sb.append(this.elements[i].innerHTML);
      return sb.toString(' ');
    } else {
      for (var i = 0; i < this.elements.length; i++) sb.append(this.elements[this.actOrder[i]].innerHTML);
      return sb.toString(' ');
    }
  },

  get_dataValue: function (data) {
    var d = data[this.get_id()];
    return ($isEmpty(d) ? this.initValue : d);
  },

  get_value: function () {
    var res = new Array();
    for (var i = 0; i < this.elements.length; i++)
      res[i] = $getIdx(this.containers[i].childNodes[0]);
    return res;
  },

  doAcceptData: function (exSt, data) {
    this.actOrder = this.get_dataValue(data);
    //Bug 235, 26.9.07
    //if (exSt!=S4N.ExerciseStatus.Evaluated) {
    for (var i = 0; i < this.elements.length; i++) this.setIdx(i, -1); //odstraneni vsech elementu z TD
    for (var i = 0; i < this.elements.length; i++) this.setIdx(i, i); //dosazeni elementu dle aktualniho poradi
    //}
    var ev = this.get_events().getHandler('acceptData'); if (!ev) return;
    ev(this, new S4N.AcceptDataArgs(exSt, this.get_dataValue(data)));
  },

  resetData: function (data) {
    data[this.get_id()] = undefined;
  },

  get_score: function () {
    if (this.rowIdx >= 0) { //word ordering
      var okText = this.get_sentenceText(true); var userText = this.get_sentenceText(false);
      return S4N.CreateScore(okText == userText ? 1 : 0, 1)
    } else {
      var ok = 0;
      for (var i = 0; i < this.elements.length; i++)
        if (i == $getIdx(this.containers[i].childNodes[0])) ok += 1;
      return S4N.CreateScore(ok, this.elements.length);
    }
  },

  provideData: function (data) {
    data[this.get_id()] = this.get_value();
  }

};
S4N.ReorderList.registerClass('S4N.ReorderList', S4N.Control, S4N.IScoreProvider);

S4N.ReorderListItem = function (element, owner, idx) {
  S4N.ReorderListItem.initializeBase(this, [element]);
  this.owner = owner;
  this.idx = idx;

};
S4N.ReorderListItem.prototype = {

  initialize: function () {
    S4N.ReorderListItem.callBaseMethod(this, 'initialize');
    $addHandler(this._element, "mousedown", Function.createDelegate(this, this.mouseDownHandler));
    AjaxControlToolkit.DragDropManager.registerDropTarget(this);
  },

  mouseDownHandler: function (ev) {
    window._event = ev;
    var el = this._element;
    var templ = this.owner.getTemplate(el);
    //template position
    var dadMan = AjaxControlToolkit.DragDropManager._getInstance();
    var location = { x: ev.clientX + 10, y: ev.clientY - 10 };
    var scrollOffset = dadMan.getScrollOffset(document.body, true);
    location = dadMan.addPoints(location, scrollOffset);
    Sys.UI.DomElement.setLocation(templ, location.x, location.y);
    //prevent default
    ev.preventDefault();
    //start drag
    this.owner.reorderStart(this.idx);
    AjaxControlToolkit.DragDropManager.startDragDrop(this, templ, null);
  },

  get_text: function (ok) {
    var res = (ok ? this.owner.elements[this.idx].innerHTML : this._element.childNodes[0].innerHTML);
    res = S4N.Sys.textFromHtml(res);
    return res;
  },

  //AjaxControlToolkit.IDragSource
  get_dragDataType: function () { //return Type
    return this.owner.get_id();
  },
  getDragData: function (Context) { //return Object
    return this;
  },
  get_dragMode: function () { //return DragMode
    return AjaxControlToolkit.DragMode.Move;
  },
  onDragStart: function () { // void
  },
  onDrag: function () { // void
  },
  onDragEnd: function (Cancelled) { // void
    this.owner.reorderEnd(Cancelled);
  },

  //AjaxControlToolkit.IDropTarget
  get_dropTargetElement: function () { // return element
    return this._element;
  },
  canDrop: function (DragMode, DataType, Data) { //return bool
    return (DataType == this.owner.get_id());
  },
  drop: function (DragMode, DataType, Data) { // void
    this.owner.dragStatusChanged(this, S4N.OrderStatus.leaveTarget);
    this.owner.dragStatusChanged(this, S4N.OrderStatus.drop);
  },
  onDragEnterTarget: function (DragMode, DataType, Data) { // void
    this.owner.reorderContinue(this.idx);
    this.owner.onCanDrop(true);
    this.owner.dragStatusChanged(this, S4N.OrderStatus.enterTarget);
  },
  onDragLeaveTarget: function (DragMode, DataType, Data) { // void
    this.owner.onCanDrop(false);
    this.owner.dragStatusChanged(this, S4N.OrderStatus.leaveTarget);
  },
  onDragInTarget: function (DragMode, DataType, Data) { // void
  }

};
S4N.ReorderListItem.registerClass('S4N.ReorderListItem', S4N.Control, AjaxControlToolkit.IDragSource, AjaxControlToolkit.IDropTarget);

///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\lm\Other.js
/*********** CONTROL hide_control ***********/
S4N.HideControl = function (element) {
  S4N.HideControl.initializeBase(this, [element]);
  this.keepSpace = false; //display:none. Jinak visibility:hidden
  this.clickElement = null; //element pro osetreni expand x collapse kliku
  this.visible = null; //visibility
};

S4N.HideControl.prototype = {

  initialize: function () {
    S4N.HideControl.callBaseMethod(this, 'initialize');
    var grp = $evalRoot();
    grp.get_events().addHandler("propertyChanged", Function.createDelegate(this, this.exerciseStatusChanged));
    if (this.clickElement != null)
      $addHandler(this.clickElement, 'click', Function.createDelegate(this, this.doClick));
  },

  set_clickElement: function (value) { this.clickElement = value; },
  get_clickElement: function () { return this.clickElement; },
  add_visibleChanged: function (handler) { this.get_events().addHandler('visibleChanged', handler); },

  exerciseStatusChanged: function (sender, eventArgs) {
    if (eventArgs._propertyName != 'exerciseStatus') return;
    var st = sender.exerciseStatus;
    this.set_visible(st == S4N.ExerciseStatus.Evaluated);
  },

  set_visible: function (visible) {
    if (this.visible == visible) return;
    this.visible = visible;
    var ev = this.get_events().getHandler('visibleChanged'); if (!ev) return;
    ev(this, new S4N.BoolArg(visible));
  },

  doClick: function (ev) {
    this.set_visible(!this.visible);
  }
};
S4N.HideControl.registerClass('S4N.HideControl', Sys.UI.Control);

/*********** CONTROL hide_control ***********/
S4N.MemoryBox = function (element) {
  S4N.MemoryBox.initializeBase(this, [element]);
};

S4N.MemoryBox.prototype = {

  initialize: function () {
    S4N.MemoryBox.callBaseMethod(this, 'initialize');
  },

  provideData: function (data) {
    data[this.get_id()] = this._element.value;
  },
  acceptData: function (exSt, data) {
    var val = data[this.get_id()];
    this._element.value = $isEmpty(val) ? '' : val;
  },
  resetData: function (data) {
    data[this.get_id()] = undefined;
  },
  get_score: function () { return null; }
};
S4N.MemoryBox.registerClass('S4N.MemoryBox', Sys.UI.Control, S4N.IScoreProvider);





///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\lm\Selections.js
/*REPLACE
S4N.CheckBoxStatus
S4N.CheckBoxResult
S4N.CheckBoxType
S4N.CheckBox
this.type
this.correct
this.checkStatus
this.initValue
*/
/*********** ENUM CheckBoxStatus ***********/
S4N.CheckBoxStatus = function () { throw Error.notImplemented(); };
S4N.CheckBoxStatus.prototype = {
  Unknown: 0,
  Unchecked: 1,
  Checked: 2,
  UncheckedWrong: 3,
  CheckedWrong: 4,
  UncheckedOK: 5,
  CheckedOK: 6,
  ReadOnly: 7,
  Undefined: 8,
  UndefinedChecked: 9,
  UndefinedUnchecked: 10
};
S4N.CheckBoxStatus.registerEnum('S4N.CheckBoxStatus');

/*********** ENUM CheckBoxResult ***********/
S4N.CheckBoxResult = function () { throw Error.notImplemented(); };
S4N.CheckBoxResult.prototype = {
  Undefined: 0,
  Checked: 1,
  Unchecked: 2
};
S4N.CheckBoxResult.registerEnum('S4N.CheckBoxResult');

/*********** ENUM CheckBoxType ***********/
S4N.CheckBoxType = function () {
  throw Error.notImplemented();
};
S4N.CheckBoxType.prototype = {
  CheckBox: 0,
  RadioButton: 1
};
S4N.CheckBoxType.registerEnum('S4N.CheckBoxType');

/*********** CONTROL CheckBox ***********/
S4N.CheckBox = function (element) {
  S4N.CheckBox.initializeBase(this, [element]);

  this.type = S4N.CheckBoxType.CheckBox;
  this.correct = false; //spravna odpoved
  this.checkStatus = S4N.CheckBoxStatus.Unknown; //stav kontrolky
  this.initValue = S4N.CheckBoxResult.Undefined; //inicialni hodnota
  this.example = false;
};

S4N.CheckBox.prototype = {

  initialize: function () {
    S4N.CheckBox.callBaseMethod(this, 'initialize');
    if ((this.type == S4N.CheckBoxType.RadioButton && this.initValue == S4N.CheckBoxResult.Undefined))
      this.initValue == S4N.CheckBoxResult.Unchecked;
    //init hodnota a correct hodnota musi odpovidat
    if (this.example)
      this.correct = (this.initValue == S4N.CheckBoxResult.Checked);
    $addHandler(this.get_element(), 'click', Function.createDelegate(this, this.doClick));
  },

  set_type: function (value) { this.type = S4N.CheckBoxType.parse(value, true); },
  get_type: function () { return this.type; },
  set_correct: function (value) { this.correct = value; },
  set_initValue: function (value) { this.initValue = S4N.CheckBoxResult.parse(value, true); },
  get_initValue: function () { return this.initValue; },
  add_statusChanged: function (handler) { this.get_events().addHandler('statusChanged', handler); },

  get_score: function () {
    if (this.example) return null;
    return S4N.CreateScore(this.isCorrect() ? 1 : 0, 1);
  },

  // STATUS management
  doClick: function (ev) {
    if (this.exerciseStatus != S4N.ExerciseStatus.Normal) return;
    if (this.checkStatus == S4N.CheckBoxStatus.Undefined)
      this.set_CheckStatus(S4N.CheckBoxStatus.Unchecked);
    else if (this.checkStatus == S4N.CheckBoxStatus.Unchecked)
      this.set_CheckStatus(S4N.CheckBoxStatus.Checked);
    else if (this.type == S4N.CheckBoxType.CheckBox && this.checkStatus == S4N.CheckBoxStatus.Checked)
      this.set_CheckStatus(S4N.CheckBoxStatus.Unchecked);
    ev.stopPropagation();
  },

  checkResult: function () {
    if (this.checkStatus == S4N.CheckBoxStatus.Undefined || this.checkStatus == S4N.CheckBoxStatus.UndefinedChecked || this.checkStatus == S4N.CheckBoxStatus.UndefinedUnchecked)
      return S4N.CheckBoxResult.Undefined;
    else if (this.checkStatus == S4N.CheckBoxStatus.Checked || this.checkStatus == S4N.CheckBoxStatus.CheckedWrong || this.checkStatus == S4N.CheckBoxStatus.CheckedOK)
      return S4N.CheckBoxResult.Checked;
    else
      return S4N.CheckBoxResult.Unchecked;
  },

  set_CheckStatus: function (value) {
    if (this.checkStatus == value) return;
    this.checkStatus = value;

    var ev = this.get_events().getHandler('statusChanged');
    if (ev) ev(this, Sys.EventArgs.Empty);

    if (this.type != S4N.CheckBoxType.RadioButton || this.checkStatus != S4N.CheckBoxStatus.Checked) return;
    //pro radio: uncheck ostatnich prvku
    var siblings = this.evalGroup.scoreProviders;
    for (var i = 0; i < siblings.length; i++) {
      if (siblings[i] == this || !S4N.CheckBox.isInstanceOfType(siblings[i]) || siblings[i].get_type() != S4N.CheckBoxType.RadioButton) continue;
      siblings[i].set_CheckStatus(S4N.CheckBoxStatus.Unchecked);
    }
  },

  get_dataValue: function (data) {
    var d = data[this.get_id()];
    return $isEmpty(d) ? this.initValue/*.toString()*/ : d;
  },

  provideData: function (data) {
    data[this.get_id()] = this.checkResult().toString();
  },

  resetData: function (data) {
    data[this.get_id()] = null;
  },

  doAcceptData: function (exerciseStatus, data) {
    var es = exerciseStatus;
    if (exerciseStatus == S4N.ExerciseStatus.Evaluated && this.example)
      es = S4N.ExerciseStatus.Normal;
    switch (es) {
      case S4N.ExerciseStatus.Normal:
        var ch = this.get_dataValue(data);
        if (ch == S4N.CheckBoxResult.Undefined)
          this.set_CheckStatus(S4N.CheckBoxStatus.Undefined);
        else if (ch == S4N.CheckBoxResult.Checked)
          this.set_CheckStatus(S4N.CheckBoxStatus.Checked);
        else
          this.set_CheckStatus(S4N.CheckBoxStatus.Unchecked);
        break;
      case S4N.ExerciseStatus.Preview:
        this.set_CheckStatus(S4N.CheckBoxStatus.ReadOnly);
        break;
      case S4N.ExerciseStatus.Evaluated:
        var ch = this.get_dataValue(data);
        if (ch == S4N.CheckBoxResult.Undefined) {
          if (this.correct)
            this.set_CheckStatus(S4N.CheckBoxStatus.UndefinedChecked);
          else
            this.set_CheckStatus(S4N.CheckBoxStatus.UndefinedUnchecked);
        } else {
          var checked = ch == S4N.CheckBoxResult.Checked;
          if (checked && checked == this.correct)
            this.set_CheckStatus(S4N.CheckBoxStatus.CheckedOK);
          else if (checked && checked != this.correct)
            this.set_CheckStatus(S4N.CheckBoxStatus.CheckedWrong);
          else if (!checked && checked == this.correct)
            this.set_CheckStatus(S4N.CheckBoxStatus.UncheckedOK);
          else if (!checked && checked != this.correct)
            this.set_CheckStatus(S4N.CheckBoxStatus.UncheckedWrong);
        }
        break;
    }
  },

  isCorrect: function () {
    if (this.example) {
      this.correct = this.initValue;
      return true;
    } else {
      var ch = this.checkResult();
      if (ch == S4N.CheckBoxResult.Undefined) return false;
      var checked = ch == S4N.CheckBoxResult.Checked;
      return this.correct == checked;
    }
  }

};
S4N.CheckBox.registerClass('S4N.CheckBox', S4N.Control, S4N.IScoreProvider);

///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\lm\Sounds.js
Type.registerNamespace('S4N');

S4N.SoundDriver = function () { throw Error.notImplemented(); };
S4N.SoundDriver.prototype = {
  no: 0,
  FlashPlayer: 1,
  MediaPlayer: 2,
  MediaPlayer6: 3,
  Silverlight: 4,
  SlNewEE: 5,
  HTML5: 6
};
S4N.SoundDriver.registerEnum('S4N.SoundDriver');

S4N.SoundPlayer = function (type) {
  S4N.SoundPlayer.initializeBase(this);

  this.driver = null;
  this.files = [];
  this.actSent = null; //aktualni S4N.SoundSent
  this.actMark = null; //aktualni S4N.SoundMark
  this.forceVersion = S4N.SoundDriver.no;
};


S4N.SoundPlayer.prototype = {

  initialize: function () {
    S4N.SoundPlayer.callBaseMethod(this, 'initialize');
    $addHandler(document.body, 'click', Function.createDelegate(this, this.bodyClick));

    this.driver = LMSnd.Player;
    var self = this;
    LMSnd.Player.init(function () { self.clearMarks(); });
  },

  dispose: function () {
    if (this.driver && this.driver.dispose) this.driver.dispose();
    S4N.SoundPlayer.callBaseMethod(this, 'dispose');
  },

  add_onSentFocus: function (handler) { this.get_events().addHandler('onSentFocus', handler); },
  add_onMarkFocus: function (handler) { this.get_events().addHandler('onMarkFocus', handler); },

  set_actMark: function (mark) {
    if (mark == this.actMark) return;
    if (this.actMark != null) this.setMarkFocus(this.actMark, false);
    this.actMark = mark;
    if (this.actMark != null) this.setMarkFocus(this.actMark, true);
  },

  set_actSent: function (sent) {
    if (sent == this.actSent) return;
    if (this.actSent != null) this.setSentFocus(this.actSent, false);
    this.actSent = sent;
    if (this.actSent != null) this.setSentFocus(this.actSent, true);
  },

  setMarkFocus: function (mark, isFocus) {
    var ev = this.get_events().getHandler('onMarkFocus');
    if (ev) ev(mark, new S4N.BoolArg(isFocus));
  },

  setSentFocus: function (sent, isFocus) {
    var ev = this.get_events().getHandler('onSentFocus');
    if (ev) ev(sent, new S4N.BoolArg(isFocus));
  },

  stop: function (endInt, isBodyClick) {
    this.set_actSent(null); if (isBodyClick) this.set_actMark(null);
    if (isBodyClick || endInt == null) { this.driver.stop(); return; }
    var nextInt = endInt.nextInterval();
    if (nextInt == null) { this.set_actMark(null); this.driver.stop(); return; }
    nextInt.play(null);
  },

  bodyClick: function (ev) {
    //this.driver.stop();
    LMSnd.file = null;
    this.stop(null, true);
  },

  clearMarks: function () {
    this.set_actMark(null);
    this.set_actSent(null);
  },

  playFile: function (url) {
    this.driver.playFile(url, 0);
  }

};
S4N.SoundPlayer.registerClass('S4N.SoundPlayer', Sys.Component);

S4N.SoundFile = function () {
  S4N.SoundFile.initializeBase(this);
  this.url = ''; //relativni url s prehravanym zvukem
  this.spaceId = '';
  this.globalId = '';
  this.player = null;

  this.intervals = []; //seznam intervalu se souvislymi sekvencemi zvuku. Slouzi k nalezeni actMark x actSent
  this.endPos = 0; //koncova pozice pro STOP zvuku, hlidana timerem
  this.endInterval = null; //S4N.SoundInterval, ktery dosadil hodnotu this.endPos
};

S4N.SoundFile.prototype = {

  initialize: function () {
    S4N.SoundFile.callBaseMethod(this, 'initialize');
    Array.add(this.player.files, this);
  },

  set_player: function (value) { this.player = value; },

  onPlaying: function (actPos) { //aktualizace
    if (this.endPos > 0 && actPos >= this.endPos) {
      Debug.$trace(S4N.Trace.Sound, 'S4N.SoundFile.onPlaying: actPos=' + actPos + ', endPos=  ' + this.endPos);
      this.stop();
    } else {
      var actInt = null;
      for (var i = 0; i < this.intervals.length; i++) {
        actInt = this.intervals[i];
        if (actInt.beg <= actPos && actInt.end > actPos) break; else actInt = null;
      }
      if (actInt == null) return;
      if (actInt.myGroup.mark != null) this.player.set_actMark(actInt.myGroup.mark);
      var actSent = null;
      for (var i = 0; i < actInt.sents.length; i++) {
        actSent = actInt.sents[i];
        if (actSent.beg <= actPos && actSent.end > actPos) break; else actSent = null;
      }
      if (actSent != null) this.player.set_actSent(actSent);
    }
  },

  //getFileUrl: function () { return S4N.Sys.getAbsoluteUrl($page().globalId, this.spaceId, this.globalId); },
  getFileUrl: function () { return S4N.Sys.getAbsoluteUrl(this.url); },

  stop: function () {
    if (this.endPos == 0) return;
    var endInt = this.endInterval; this.endInterval = null; this.endPos = 0;
    this.player.stop(endInt, false);
  },

  play: function (beg) {
    Debug.$trace(S4N.Trace.Sound, 'S4N.SoundFile.play: beg=' + beg + ', end=  ' + this.endPos);
    this.player.driver.play(this, beg);
  }

};
S4N.SoundFile.registerClass('S4N.SoundFile', Sys.Component);

S4N.SoundGroup = function () {
  S4N.SoundGroup.initializeBase(this);
  this.intervals = []; //seznam intervalu se souvislymi sekvencemi zvuku. Ridi se jim poradi prehravani nesouvisleho zvuku
  this.player = null;

  this.mark = null; //velka zvukova znacka
};

S4N.SoundGroup.prototype = {

  initialize: function () {
    S4N.SoundGroup.callBaseMethod(this, 'initialize');
    var it = this.intervals;
    for (var i = 0; i < it.length; i++) {
      it[i] = $find(it[i]);
      it[i].myGroup = this;
      it[i].groupIdx = i;
    }
  },

  set_intervals: function (value) { this.intervals = value; },
  get_intervals: function () { return this.intervals; },
  set_player: function (value) { this.player = value; }

};
S4N.SoundGroup.registerClass('S4N.SoundGroup', Sys.Component);

S4N.SoundInterval = function () {
  S4N.SoundInterval.initializeBase(this);
  this.beg = 0;
  this.end = 0;
  this.myFile = null; //S4N.SoundFile

  this.sents = []; //seznam S4N.Sentence
  this.myGroup = null; //S4N.SoundGroup
  this.groupIdx = -1; //index do this.myGroup.intervals
};

S4N.SoundInterval.prototype = {

  initialize: function () {
    S4N.SoundInterval.callBaseMethod(this, 'initialize');
    Array.add(this.myFile.intervals, this);
  },

  set_file: function (value) { this.myFile = value; },

  play: function (sent) { //prehraje budto cely interval (sent==null) nebo interval od zadane zvukove vety
    this.myFile.endPos = this.end;
    this.myFile.endInterval = this;
    this.myFile.play(sent == null ? this.beg : sent.beg);
  },

  nextInterval: function () {
    if (this.groupIdx >= this.myGroup.intervals.length - 1) return null;
    return this.myGroup.intervals[this.groupIdx + 1];
  }

};
S4N.SoundInterval.registerClass('S4N.SoundInterval', Sys.Component);

S4N.SoundSent = function (element) {
  S4N.SoundSent.initializeBase(this, [element]);
  this.myInterval = null; //muj S4N.SoundInterval
  this.beg = 0; //zacatek prehravani
  this.end = 0; //konec prehravani
};

S4N.SoundSent.prototype = {

  initialize: function () {
    S4N.SoundSent.callBaseMethod(this, 'initialize');
    Array.add(this.myInterval.sents, this);
    $addHandler(this._element, 'click', Function.createDelegate(this, this.doClick));
    //Pronunc
    var pronObj = null;
    var el = $(this._element);
    var pron = el.find('.sdPronuncMark');
    if (pron != null && pron.length == 1) {
      var file = this.myInterval.myFile;
      //var url = file.spaceId + '/' + file.globalId;
      var pronObj = $(pron[0]);
      var par = { 'url': Pager.basicUrl + file.url, 'beg': this.beg.toString(), 'end': this.end.toString(), 'title': el.text() };
    }
    if (Hack()) {
      if (pronObj != null) pronObj.click(function (ev) {
        return Pager.callCPV(ev, par.url, par.title, par.beg, par.end);
      });
    } else {
      if (typeof (dictConnector) == 'undefined') return;
      pronObj.click(par, dictConnector.listenTalkSentence);
    }
  },

  doClick: function (ev) {
    ev.stopPropagation();
    if (ev.target != null && ev.target.tagName.toLowerCase() == 'a') return; //click na pronunciation znacku
    this.play(false);
  },

  set_interval: function (value) { this.myInterval = value; },

  play: function (simple) { //prehraje aktualni vetu (simple=true) nebo grupu (simple=false) 
    if (simple) {
      var file = this.myInterval.myFile;
      this.myFile.endPos = this.end;
      this.myFile.endInterval = null;
      this.myFile.play(this.beg);
    } else {
      this.myInterval.play(this);
    }
    this.myInterval.myFile.player.set_actSent(this);
  }

};
S4N.SoundSent.registerClass('S4N.SoundSent', S4N.Control);

S4N.SoundMark = function (element) {
  S4N.SoundMark.initializeBase(this, [element]);
  this.myGroup = null; //muj S4N.SoundGroup
};

S4N.SoundMark.prototype = {

  initialize: function () {
    S4N.SoundMark.callBaseMethod(this, 'initialize');
    $assert(this.myGroup.mark == null, 'S4N.SoundMark: duplicated mark');
    this.myGroup.mark = this;
    $addHandler(this._element, 'click', Function.createDelegate(this, this.doClick));
  },

  set_group: function (value) { this.myGroup = value; },
  get_group: function () { return this.myGroup; },

  play: function () { //prehraje celou grupu
    this.myGroup.intervals[0].play(null);
    this.myGroup.player.set_actMark(this);
  },

  doClick: function (ev) {
    ev.stopPropagation();
    this.play();
  }

};
S4N.SoundMark.registerClass('S4N.SoundMark', S4N.Control);

//S4N.MediaPlayerStatus = function () { throw Error.notImplemented(); };
//S4N.MediaPlayerStatus.prototype = {
//  Undefined: 0,
//  Stopped: 1,
//  Paused: 2,
//  Playing: 3,
//  ScanForward: 4,
//  ScanReverse: 5,
//  Buffering: 6,
//  Waiting: 7,
//  MediaEnded: 8,
//  Transitioning: 9,
//  Ready: 10,
//  Reconnecting: 11
//};
//S4N.MediaPlayerStatus.registerEnum('S4N.MediaPlayerStatus');

//S4N.SoundMediaPlayer = function (player) {
//  this.player = player;
//  this.control = $get('MediaPlayer');
//  $assert(this.control != null, 'S4N.SoundMediaPlayer: missing MediaPlayer');
//  S4N.Sys.addHandlers(this.control, { Error: this.error, PlayStateChange: this.playStateChange }, this);
//  this.file = null;
//  this.url = null;
//  this.timer = null;
//  Debug.$trace(S4N.Trace.Sound, 'S4N.SoundMediaPlayer: OK');
//};

//S4N.SoundMediaPlayer.prototype = {

//  dispose: function () {
//    this.control.controls.stop();
//  },

//  playFile: function (url, sec) {
//    if (this.url != url) {
//      this.control.URL = url;
//      Debug.$trace(S4N.Trace.Sound, 'S4N.SoundMediaPlayer.play ' + this.fileId() + ' url=' + url);
//      this.url = url;
//    }
//    this.control.controls.currentPosition = sec;
//    this.control.controls.Play();
//  },

//  play: function (file, msec) {
//    //if ($isEmpty(this.control.controls,true)) return;
//    this.stop(null);
//    this.file = file;
//    var url = S4N.Sys.getAbsoluteUrl($page().globalId, file.spaceId, file.globalId);
//    this.playFile(url, msec / 1000);
//    Debug.$trace(S4N.Trace.Sound, 'S4N.SoundMediaPlayer.play play: ' + this.fileId() + ' ' + beg.toString());
//  },

//  stop: function (file) {
//    if (this.control.playState != S4N.MediaPlayerStatus.Playing) return;
//    $assert(file == null || file == this.file, 'S4N.SoundMediaPlayer.actPos');
//    this.control.controls.pause();
//    Debug.$trace(S4N.Trace.Sound, 'S4N.SoundMediaPlayer.stop ' + this.fileId());
//  },

//  error: function () {
//    Debug.$trace(S4N.Trace.Sound, '***** S4N.SoundMediaPlayer.onError: ' + this.control.error.item(0).errorDescription + '  ' + this.fileId());
//  },

//  playStateChange: function (newState) {
//    Debug.$trace(S4N.Trace.Sound, 'S4N.SoundMediaPlayer.playStateChange: ' + S4N.MediaPlayerStatus.toString(newState) + '  ' + this.fileId());
//    switch (newState) {
//      case S4N.MediaPlayerStatus.Stoped:
//      case S4N.MediaPlayerStatus.Paused:
//        this.file = null;
//        if (this.timer == null) return;
//        clearInterval(this.timer);
//        this.timer = null;
//        break;
//      case S4N.MediaPlayerStatus.Playing:
//        if (this.timer != null) return;
//        this.timer = setInterval(Function.createDelegate(this, this.onTimer), 10);
//        break;
//    }
//  },

//  onTimer: function () {
//    this.file.onPlaying(this.control.playState == S4N.MediaPlayerStatus.Playing ? this.control.controls.currentPosition * 1000 : 100000000);
//  },

//  fileId: function () { return this.file == null ? 'null' : this.file.url; }

//};

////SLEA
///*********************************/
//S4N.SoundSlNewEE = function (player) {
//  this.player = player;
//  this.file = null;
//  this.control = null;
//  S4N.SoundSlNewEE.instance = this;
//  //Prirazeni sound callbacku do parent frame, aby byla funkce dostupna z CSharp:
//  try {
//    window.parent.S4N_SoundSlNewEE_timeChanged = function S4N_SoundSlNewEE_timeChanged(time) {
//      try {
//        var thisObj = S4N.SoundSlNewEE.instance;
//        alert(time);
//        if (time >= 0) {
//          if (thisObj.file != null) thisObj.file.onPlaying(time);
//        } else { //Stop
//          if (thisObj.file != null) thisObj.file.onPlaying(100000.0);
//          thisObj.player.clearMarks();
//        }
//      } catch (e2) { }
//    };
//  } catch (e) { }
//  Debug.$trace(S4N.Trace.Sound, 'S4N.SoundSlNewEE: OK');
//};

//S4N.SoundSlNewEE.prototype = {

//  dispose: function () {
//    if (this.control == null) return;
//    //this.control.stop();
//  },

//  playFile: function (url, sec) {
//    window.external.Play(url, sec);
//  },

//  play: function (file, msec) {
//    var url = S4N.Sys.getAbsoluteUrl($page().globalId, file.spaceId, file.globalId);
//    this.playFile(url, msec / 1000);
//    //alert('play: ' + url.toString() + ' (' + beg.toString() + ')');
//    Debug.$trace(S4N.Trace.Sound, 'S4N.SoundSlNewEE.play play: ' + url + ' ' + beg.toString());
//  },

//  stop: function (file) {
//    window.external.Stop();
//    //alert('stop');
//    //Debug.$trace(S4N.Trace.Sound, 'S4N.SoundSlNewEE.stop ' + this.fileId());
//  }

//};

//S4N.SoundSlNewEE.instance = null;

///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\lm\EvalGroup.js
S4N.EvalControlStatus = function () {
  throw Error.notImplemented();
};
S4N.EvalControlStatus.prototype = {
  Unknown: 0,
  DoEval: 1,
  DoReset: 2,
  Disabled: 3
};
S4N.EvalControlStatus.registerEnum('S4N.EvalControlStatus');


S4N.EvalControl = function (element) {
  S4N.EvalControl.initializeBase(this, [element]);

  this.allowReset = true;
  this.status = S4N.EvalControlStatus.Unknown;
  this.group = null;
};

S4N.EvalControl.prototype = {

  initialize: function () {
    S4N.EvalControl.callBaseMethod(this, 'initialize');
    if (this.group == null) this.group = $evalRoot();
    this.group.get_events().addHandler("propertyChanged", Function.createDelegate(this, this.exerciseStatusChanged));
    $addHandler(this._element, 'click', Function.createDelegate(this, this.doClick));
  },

  set_evalGroup: function (value) { this.group = value; },
  set_allowReset: function (value) { this.allowReset = value; },
  add_statusChanged: function (handler) { this.get_events().addHandler('statusChanged', handler); },

  set_status: function (value) {
    if (this.status == value) return;
    this.status = value;
    var ev = this.get_events().getHandler('statusChanged');
    if (ev) ev(this, Sys.EventArgs.Empty);
  },

  get_score: function () {
    return this.group.get_score();
  },

  exerciseStatusChanged: function (sender, eventArgs) {
    if (eventArgs._propertyName != 'exerciseStatus') return;
    var st = this.group.exerciseStatus;
    if (st == S4N.ExerciseStatus.Normal) {
      this.set_status(S4N.EvalControlStatus.DoEval);
    } else if (st == S4N.ExerciseStatus.Evaluated) {
      if (this.allowReset) this.set_status(S4N.EvalControlStatus.DoReset);
      else this.set_status(S4N.EvalControlStatus.Disabled);
    }
  },

  doClick: function (ev) {
    var data = $page().data;
    var st = this.group.exerciseStatus;
    if (st == S4N.ExerciseStatus.Normal) {
      this.group.provideData(data);
      this.group.acceptData(S4N.ExerciseStatus.Evaluated, data);
    } else if (st == S4N.ExerciseStatus.Evaluated && this.allowReset) {
      this.group.resetData(data);
      this.group.acceptData(S4N.ExerciseStatus.Normal, data);
    }
    ev.stopPropagation();
  }
};
S4N.EvalControl.registerClass('S4N.EvalControl', Sys.UI.Control);


///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\lm\Course.js
Type.registerNamespace('S4N');

var $CourseMan = null;

/*********** ENUM Cst, odpovida LMScormLib.CourseTreeType ***********/
S4N.Cst = function () { throw Error.notImplemented(); };
S4N.Cst.prototype = {
  no: 0,
  content: 1, //Obsah kurzu
  run: 2, //spusteni kurzu
  result: 3, //vysledky kurzu
  setStart: 4 //obsah kurzu s moznosti rucne nastavit zacatek kurzu
};
S4N.Cst.registerEnum('S4N.Cst');

/*********** Folder stromove struktury kurzu ***********/
S4N.CourseFolder = function (tree) {
  S4N.CourseFolder.initializeBase(this);
  this.tree = tree;
};

S4N.CourseFolder.prototype = {

  initialize: function () {
    S4N.CourseFolder.callBaseMethod(this, 'initialize');
  },

  refreshStatus: function () {
  },

  buildControl: function (parent) {
  },

  getEl: function (node, subId) {
    var n = 'n' + this.tree.id + '_' + subId;
    return node != null && node.id == n ? node : $get(n, node);
  }

};
S4N.CourseFolder.registerClass('S4N.CourseFolder', Sys.Component);

/*********** Stav kurzu vzhledem k testu ***********/
S4N.TestMode = function () { throw Error.notImplemented(); };
S4N.TestMode.prototype = {
  first: 0, //startovaci stav
  testHome: 1, //test bezi, je na home
  testForm: 2, //test bezi, je na dotazniku
  testTest: 3, //test bezi, je v testu (ID testu je v )
  testTestFinished: 4, //test dobehl, nabidka nastavit zacatek kurzu
  tested: 5 //test dobehl, je nastaven zacatek kurzu
};
S4N.TestMode.registerEnum('S4N.TestMode');

/*********** Persistentni informace o stavu kurzu ***********/
S4N.CourseInfo = function () {
  this.testUrl = null; //pro this.testMode=testTest: identifikace rozpracovaneho vstupniho test
  this.testMode = S4N.TestMode.first;
  this.firstIdOK = false; //this.firstId obsahuje validni zacatek kurzu (plati nejenom pro this.testMode==tested)
  this.firstId = null; //JSON Id prvniho modulu kurzu (moduly pred nim jsou removed) - vysledek nastaveni zacatku kurzu.
  this.tempFirstIdTitle = null; //pro porvrzeni testovaci kapitoly: jeji titulek
  this.tempFirstId = null; //pro porvrzeni testovaci kapitoly: jeji JSON id
  this.testHistory = {}; //this.testHistory[<jsonId testu>] obsahuje procentuelni vyhodnoceni každého z testů
  this.licenceAgreeOK = false; //uzivatel vyjadril souhlas s licencni smlouvou
};

S4N.CourseInfo.load = function (courseId) {
  var inf = ScormAPIEx == null ? null : ScormAPIEx.getData(null, 'courseinfo.json', 0, courseId);
  if ($isEmpty(courseId)) courseId = $config().courseId;
  return $isEmpty(inf) ? new S4N.CourseInfo() : $deserialize(inf); //persistentni cast CourseMan
};

S4N.CourseInfo.save = function (courseInfo, courseId) {
  if (courseInfo == null || ScormAPIEx == null) return;
  if ($isEmpty(courseId)) courseId = $config().courseId;
  ScormAPIEx.setData(null, 'courseinfo.json', $serialize(courseInfo), 0, courseId);
};

/*********** Spravce kurzu, root stromove struktury kurzu ***********/
S4N.CourseMan = function () {
  S4N.CourseMan.initializeBase(this);
  $CourseMan = this;
  this.type = S4N.Cst.no;
  this.body = null; //CourseTree body - tag, do ktereho se generuje CourseTree
  this.courseId = S4N.CourseIds.no;
  this.greenArrow = null; //tag se zelenou sipkou
  this.moduleIds = null; //array of JSON idu vsech kapitol kurzu (chybi-li this.tree a je potreba najit prvni modul).

  this.courseInfo = null; //persistentni S4N.CourseInfo
  //this.readOnly = false; //=true iff se pri UnLoad neuklada CourseInfo
  this.actModule = null;
  this.allModules = [];
  this.allControls = [this];
  this.firstIndex = -1; //zacatek kurzu (definovany indexem do this.allModules)
  this.hasExercise = false; //v TreeView s obsahem kurzu je videt zeznam cviceni
};

S4N.CourseMan.prototype = {

  initialize: function () {
    S4N.CourseMan.callBaseMethod(this, 'initialize');
    Sys.Application.add_load(Function.createDelegate(this, this.onLoad));
    Sys.Application.add_unload(Function.createDelegate(this, function () { this.onUnload(); }));
    this.hasExercise = this.type == S4N.Cst.content || this.type == S4N.Cst.setStart;
    if (this.greenArrow != null)
      $addHandler(this.greenArrow, 'click', Function.createDelegate(this, this.runCourse));
    $adjustAPI();
    if (this.courseId == S4N.CourseIds.no) this.courseId = $config().courseId;
  },

  set_tree: function (value) { this.tree = value; this.tree.control = this; }, get_tree: function () { return this.tree; },
  set_body: function (value) { this.body = value; }, get_body: function () { return this.body; },
  set_courseId: function (value) { this.courseId = value; }, get_courseId: function () { return this.courseId; },
  set_moduleIds: function (value) { this.moduleIds = value; }, get_moduleIds: function () { return this.moduleIds; },
  set_greenArrow: function (value) { this.greenArrow = value; }, get_greenArrow: function () { return this.greenArrow; },

  onLoad: function () {
    this.refresh(true);
  },

  onUnload: function () {
    S4N.CourseInfo.save(this.courseInfo, this.courseId);
  },

  refresh: function (first) {
    if (this.courseInfo == null) { //mj. priznak prvniho volani refreshStatus
      this.courseInfo = S4N.CourseInfo.load(this.courseId);
      //var inf = ScormAPIEx==null ? null : ScormAPIEx.getData(null,'courseinfo.json',0,this.courseId);
      //this.courseInfo = $isEmpty(inf) ? new S4N.CourseInfo () : $deserialize(inf); //persistentni cast CourseMan
      //Linearizace modules
      if (this.tree != null) S4N.CourseMan.registerModules(this.tree, this);
    }
    if (this.tree == null) return;
    //Nastaveni firstIndex
    if (this.courseInfo != null && this.courseInfo.firstId != null)
      for (var i = 0; i < this.allModules.length; i++)
        if (this.allModules[i].dataId == this.courseInfo.firstId) {
          this.firstIndex = i; break;
        }
    //Aktualizace Tree s pomoci getCourseData, obsahujici JSON se strucnymi informacemi o vsech modulech 
    //ve formatu {JSONToId(spaceId, globalId):value;...}
    this.actModule = null;
    if (this.tree != null) {
      this.finishTree(this.tree, ScormAPIEx == null ? null : $deserialize(ScormAPIEx.getCourseData(this.courseId)));
      //this.finishTree (this.tree, ScormAPIEx==null ? null : ScormAPIEx.getCourseData(this.courseId) );
      //Nalezeni prvniho modulu k probrani
      for (var i = 0; i < this.allModules.length; i++) {
        if (i < this.firstIndex) continue;
        var st = this.allModules[i].data;
        st = st != null ? st.st : S4N.ExerciseStatus.notAttempted;
        if (st == S4N.ExerciseStatus.Normal || st == S4N.ExerciseStatus.notAttempted) {
          this.actModule = this.allModules[i]; break;
        }
      }
    }
    //prvni vstup do stranky: adjustuj viditelne uzly
    if (first)
      if (this.actModule == null || this.hasExercise)
        S4N.CourseMan.adjustControl(this.tree, true, true);
      else {
        S4N.CourseMan.adjustControl(this.actModule, false, true);
        this.actModule.control.expand(true, true);
      }
    for (var i = 0; i < this.allControls.length; i++) this.allControls[i].refreshStatus();
  },

  resetModule: function (spaceId, globalId) {
    if (ScormAPIEx == null) return;
    ScormAPIEx.setModuleData(spaceId, globalId, '', '', this.courseId);
    this.refresh(false);
  },

  /*runTest : function () {
      this.getCourseInfo().testRunning = true;
      window.top.navigate (url);
  },*/

  runCourse: function () {
    var actId = null;
    if (this.tree != null) { //aktualni kapitola je v this.actModule
      actId = this.actModule == null ? null : this.actModule.dataId;
    } else { //aktualni kapitolu nutno zjistit z "getCourseData" a z posloupnosti IDu kapitol (this.)
      if (this.moduleIds == null || this.moduleIds.length <= 0) return;
      var shortData = ScormAPIEx == null ? null : $deserialize(ScormAPIEx.getCourseData(this.courseId));
      var mids = this.moduleIds;
      var firstIdReached = this.courseInfo.firstId == null ? true : false; //nejdrive je potreba dosahnout firstId, pak se teprve zjistuje status
      for (var i = 0; i < mids.length; i++) {
        if (!firstIdReached)
          if (mids[i] == this.courseInfo.firstId) firstIdReached = true;
        if (firstIdReached) {
          var dt = shortData == null ? null : shortData[mids[i]];
          if ($isEmpty(dt) || dt.st == S4N.ExerciseStatus.Normal || dt.st == S4N.ExerciseStatus.notAttempted) {
            actId = mids[i]; break;
          }
        }
      }
    }
    if (actId == null) { //kurz hotov, jdi na vysledkovou stanku
      $config().navigateCrs(window.top, this.courseId, 'home.htm');
    } else { //jdi na SpaceId, GlobalId
      var sp_gl = $JSONFromId(actId);
      $config().navigate(window.top, sp_gl.spaceId, sp_gl.globalId);
    }
  },

  expand: function (doExpand) { },

  isRemoved: function (node) {
    if (node.id < this.firstIndex) return true;
    if ($isEmpty(node.data)) return false;
    return (node.data.st == S4N.ExerciseStatus.removed);
  },

  finishTree: function (node, crsData) {
    if (node.isModule) {
      node.data = crsData == null ? null : crsData[node.dataId];
      if ($isEmpty(node.data)) node.data = null;
    } else {
      var removed = 0; var completed = 0; var incomplete = 0; var notAttempted = 0; var all = node.childs.length;
      //inicializace
      node.maxModules = 0; node.modules = 0; node.data.ms = 0; node.data.s = 0; node.data.bt = 0; node.data.et = 0; node.data.t = 0;
      for (var i = 0; i < all; i++) {
        var child = node.childs[i];
        child.parent = node;
        this.finishTree(child, crsData);
        if (this.isRemoved(child)) { removed += 1; continue; }
        if (!child.isModule) {
          node.maxModules += child.maxModules;
          node.modules += child.modules;
          node.data.ms += child.data.ms;
          node.data.s += child.data.s;
        } else {
          node.maxModules += 1;
          if ($isEmpty(child.data)) { notAttempted += 1; continue; }
          if (child.data.st == S4N.ExerciseStatus.Evaluated) {
            node.modules += 1;
            if (child.data.ms == 0) { //nevyhodnotitelne cviceni prispiva 1/1
              node.data.ms += 100; node.data.s += 100;
            } else {
              node.data.ms += child.data.ms; node.data.s += child.data.s;
            }
          }
        }
        switch (child.data.st) {
          case S4N.ExerciseStatus.Evaluated:
            completed += 1;
            if (child.data.bt != 0)
              if (node.data.bt == 0 || node.data.bt > child.data.bt) node.data.bt = child.data.bt;
            if (child.data.et > node.data.et) node.data.et = child.data.et;
            node.data.t += child.data.t;
            break;
          case S4N.ExerciseStatus.notAttempted: notAttempted += 1; continue;
          default: incomplete += 1; continue;
        }
      }
      if (all == removed) node.data.st = S4N.ExerciseStatus.removed;
      else if (all == removed + completed) node.data.st = S4N.ExerciseStatus.Evaluated;
      else if (all == removed + notAttempted) node.data.st = S4N.ExerciseStatus.notAttempted;
      else node.data.st = S4N.ExerciseStatus.Normal;
    }
  },

  action: function (typ, nd) {
    if (typ == 'start') {
      if (ScormAPIEx == null) return;
      while (!nd.isModule) nd = nd.childs[0];
      if (!confirm(CSLocalize('7e1cd46186014c21b971f869981dfff4', 'Opravdu chcete nastavit začátek kurzu na kapitolu') + ' "' + S4N.CourseMan.fullTitle(nd) + '"?')) return;
      this.courseInfo.firstId = nd.dataId;
      ScormAPIEx.setData(null, 'courseinfo.json', $serialize(this.courseInfo), 0, this.courseId);
    } else {
      if (ScormAPIEx == null) return;
      var sp_gl = $JSONFromId(nd.dataId);
      var dt = ScormAPIEx.LMSInitializeEx(sp_gl.spaceId, sp_gl.globalId);
      var md = (!$isEmpty(dt) ? $deserialize(dt) : new S4N.ModuleData());
      switch (typ) {
        case 'add':
          if (!confirm(CSLocalize('d831ae9ba2bc418382d361c2c29a3763', 'Opravdu chcete zařadit kapitolu zpátky do výuky?'))) return;
          md = null; dt = null;
          break;
        case 'remove':
          if (!confirm(CSLocalize('2fb0c828db9141ca9dcf0890e3256a51', 'Opravdu chcete vyřadit kapitolu z výuky?'))) return;
          md.pages = [];
          md.st = S4N.ExerciseStatus.removed;
          break;
        case 'reset':
          if (!confirm(CSLocalize('e931e33b05af468e93c874190465fa52', 'Opravdu chcete obnovit kapitolu do původního stavu tak, aby jste ji mohli projít znova? Obnovením přijdete o výsledky všech cvičení kapitoly.'))) return;
          md = null; dt = null;
          break;
      }
      if (md == null) {
        ScormAPIEx.LMSCommitEx(sp_gl.spaceId, sp_gl.globalId, null, null);
      } else {
        var pages = md.pages; md.pages = undefined;
        var dataShort = $serialize(md);
        md.pages = pages;
        dt = $serialize(md);
        ScormAPIEx.LMSCommitEx(sp_gl.spaceId, sp_gl.globalId, dt, dataShort);
      }
      Debug.$trace(S4N.Trace.ScormClient, 'S4N.CourseTreeNode.Action: ' + (dt == null ? '0' : dt.length));
    }
    this.refresh(false);
  }

};

S4N.CourseMan.registerModules = function (node, courseMan) {
  if (node.isModule) {
    courseMan.allModules[node.id] = node;
  } else {
    for (var i = 0; i < node.childs.length; i++) S4N.CourseMan.registerModules(node.childs[i], courseMan);
  }
};

S4N.CourseMan.adjustControl = function (node, incChild, adjustParent) {
  if (node == null) return;
  //parent chain
  if (adjustParent) S4N.CourseMan.adjustControl(node.parent, true, true);
  //self
  if (node.control == null) {
    var tp = eval('S4N.CourseTreeNode');
    node.control = new tp(node);
    Array.add($CourseMan.allControls, node.control);
    node.control.buildControl(node.parent.control);
    node.control.refreshStatus();
  }
  //childs of self
  if (incChild && !node.isModule)
    for (var i = 0; i < node.childs.length; i++) S4N.CourseMan.adjustControl(node.childs[i], false, false);
};

S4N.CourseMan.renameElements = function (el, id) {
  var elId = el.id;
  if (!$isEmpty(elId))
    el.id = elId.replace('xxx', id);
  for (var i = 0; i < el.childNodes.length; i++)
    S4N.CourseMan.renameElements(el.childNodes[i], id);
};

S4N.CourseMan.fullTitle = function (node) {
  var res = '';
  while (node != null) {
    if (res != '') res = ': ' + res;
    res = node.title + res;
    node = node.parent;
  }
  return res;
};

S4N.CourseMan.registerClass('S4N.CourseMan', S4N.CourseFolder);

/*********** spolecny predchudce:
- home stranek kurzu (framework/controls/course/CourseHome.js)
- testovacich stranek (napr. englishtest/TestEnter.js)
)
**************/
S4N.TestLib = function () {
  S4N.TestLib.initializeBase(this);
  this.firstId = '';
};

S4N.TestLib.prototype = {

  initialize: function () {
    S4N.TestLib.callBaseMethod(this, 'initialize');
  },

  onLoad: function () {
    S4N.TestLib.callBaseMethod(this, 'onLoad');
    var startCtrl = $get('TestHomeStart');
    if (startCtrl == null) return;
    var ci = this.courseInfo;
    switch (ci.testMode) {
      case S4N.TestMode.testHome:
        S4N.Sys.setCssStatus($get('TestHomeStart'), false, 'displayNone'); break;
      case S4N.TestMode.testForm:
      case S4N.TestMode.testTest:
        S4N.Sys.setCssStatus($get('TestHomeContinue'), false, 'displayNone'); break;
      case S4N.TestMode.testTestFinished:
        S4N.Sys.setCssStatus($get('TestHomeEnd'), false, 'displayNone');
        $get('StartTitle').innerText = ci.tempFirstIdTitle;
        break;
    }
  },

  testContinue: function () { //pokracovani ve vstupnim testu
    var ci = this.courseInfo;
    switch (ci.testMode) {
      case S4N.TestMode.testHome:
      case S4N.TestMode.testTestFinished:
        window.location.href = $config().testUrl('TestEnter.htm'); break;
      case S4N.TestMode.testForm:
        window.location.href = $config().testUrl('TestForm.htm'); break;
      case S4N.TestMode.testTest:
        window.location.href = $config().testUrl(ci.testUrl); break;
    }
  },

  setStartFirst: function () { //nastaveni zacatku kurzu na zacatek
    var ci = this.courseInfo;
    ci.testUrl = null;
    ci.testMode = S4N.TestMode.tested;
    ci.firstIdOK = true;
    ci.firstId = this.firstId;
    ci.testHistory = {};
    window.location.href = $config().courseUrl('home.htm');
  },

  runTest: function () { //nastaveni zacatku kurzu spustenim vstupniho testu
    var ci = this.courseInfo;
    ci.testMode = S4N.TestMode.testHome;
    ci.testHistory = {};
    window.location.href = $config().testUrl('TestEnter.htm');
  },

  cancelTest: function () { //zrusit vstupni test
    var ci = this.courseInfo;
    ci.testUrl = null;
    ci.testMode = S4N.TestMode.first;
    ci.testHistory = {};
    window.top.location.href = $config().courseUrl('home.htm');
  },

  cancelSetStart: function () { //zrusit nastaveni zacatku kurzu
    var ci = this.courseInfo;
    ci.testUrl = null;
    ci.testMode = S4N.TestMode.tested;
    ci.testHistory = {};
    window.location.href = $config().courseUrl('home.htm');
  },

  setStartAgain: function () { //nove nastaveni zacatku kurzu
    var ci = this.courseInfo;
    ci.testUrl = null;
    ci.testMode = S4N.TestMode.first;
    ci.testHistory = {};
    window.location.href = window.location.href;
  },

  runTestForm: function () {
    var ci = this.courseInfo;
    ci.testMode = S4N.TestMode.testForm;
    window.location.href = $config().testUrl('TestForm.htm');
  },

  setCourseStart: function () { //finalni nastaveni zacatku kurzu
    var ci = this.courseInfo;
    ci.testMode = S4N.TestMode.tested;
    ci.firstId = ci.tempFirstId;
    ci.firstIdOK = true;
    ci.testUrl = null; ci.tempFirstId = null; ci.tempFirstIdTitle = null;
    var url;
    if (false) {

    } else
      url = $config().courseUrl('home.htm');
    window.location.href = url;
  }
};
S4N.TestLib.setLevel = function (ci, levelId) {
  alert(CSLocalize('43073e32fb5c4ee08d247e501c45a3df', 'Gratulujeme k ukončení vstupního testu.'));
  ci.testMode = S4N.TestMode.testTestFinished;
  ci.tempFirstIdTitle = S4N.TestEnter.titles[levelId];
  ci.tempFirstId = $JSONToId(S4N.TestEnter.spaceIds[levelId], S4N.TestEnter.globalIds[levelId]);
  window.top.location.href = $config().testUrl('TestEnter.htm');
};

S4N.TestLib.nextTestNoAlert = function (ci, testId) {
  ci.testUrl = S4N.TestEnter.testUrl[testId];
  ci.testMode = S4N.TestMode.testTest;
  ScormAPIEx.LMSCommitEx($config().testSpaceId(), ci.testUrl, null, null);
  window.top.location.href = $config().testUrl(ci.testUrl);
};

S4N.TestLib.nextTest = function (ci, testId) {
  alert(CSLocalize('a988706addc34fb9b23bb8ccde488bec', 'Pro přesnější zjištění úrovně vašich znalostí bude dále spuštěn') + ' "' + S4N.TestEnter.testTitles[testId] + '"');
  S4N.TestLib.nextTestNoAlert(ci, testId);
};

S4N.TestLib.registerClass('S4N.TestLib', S4N.CourseMan);


///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\lm\GapFill.js
var gf_nt = [
'1040', 'A',
'1072', 'a',
'1042', 'B',
'1074', 'b',
'1045', 'E',
'1077', 'e',
'1050', 'K',
'1082', 'k',
'1052', 'M',
'1084', 'm',
'1053', 'H',
'1085', 'h',
'1054', 'O',
'1086', 'o',
'1056', 'P',
'1088', 'p',
'1057', 'C',
'1089', 'c',
'1058', 'T',
'1090', 't',
'1059', 'Y',
'1091', 'y',
'1061', 'X',
'1093', 'x',
'1105', 'ë',
'161', '!',
'160', ' ',
'191', '?',
'241', 'ň',
'39', '’',
'96', '’',
'180', '’',
'733', '"',
'8216', '’',
'8219', '’',
'8220', '"',
'8221', '"',
'8222', '"',
'8242', '’',
'8243', '"'
];
var gf_normTable = null;
gf_NormalizeString = function (s) {
  if ($isEmpty(s)) return s;
  if (gf_normTable == null) {
    gf_normTable = [];
    for (var i = 1; i < gf_nt.length; i += 2)
      gf_normTable[parseInt(gf_nt[i - 1])] = gf_nt[i];
  }
  for (var i = 0; i < s.length; i++) {
    var nw = gf_normTable[s.charCodeAt(i)];
    if (typeof (nw) != 'undefined') s = s.substring(0, i) + nw + s.substring(i + 1);
  }
  return s;
};


/*********** ENUM GapFillEvalMode ***********/
S4N.GapFillEvalMode = function () {
  throw Error.notImplemented();
};
S4N.GapFillEvalMode.prototype = {
  no: 0,
  ignoreCase: 1,
  caseSensitive: 2,
  intelligent: 3
};
S4N.GapFillEvalMode.registerEnum('S4N.GapFillEvalMode');

/*********** CONTROL GapFill ***********/
S4N.GapFill = function (element) {
  S4N.GapFill.initializeBase(this, [element]);
  this.initValue = '';
  this.dragTarget = false;
  this.correct;
  this.evalMode = S4N.GapFillEvalMode.ignoreCase;
  this.isMulti = false;
  this.inline = true;
  this.isFake = false; //pro classification: pridany gapfill
  this.example = false; //priklad: nevyhodnocovat
};

S4N.GapFill.prototype = {

  initialize: function () {
    S4N.GapFill.callBaseMethod(this, 'initialize');
    this.isMulti = typeof (this.correct) == 'object';
    //init hodnota a correct hodnota musi odpovidat
    if (this.example)
      this.correct = this.initValue;
    $addHandler(this._element, 'click', Function.createDelegate(this, this.doClick));
  },

  set_correct: function (value) { this.correct = value; },
  get_correct: function (value) { return this.correct; },
  add_getValue: function (handler) { this.get_events().addHandler('getValue', handler); },
  add_acceptData: function (handler) { this.get_events().addHandler('acceptData', handler); },

  doClick: function (ev) {
    ev.stopPropagation();
  },

  get_dataValue: function (data) {
    var d = data[this.get_id()];
    return $isEmpty(d, true) ? this.initValue : d;
  },

  get_value: function () {
    var ev = this.get_events().getHandler('getValue'); if (!ev) return;
    var arg = new S4N.AcceptDataArgs();
    ev(this, arg);
    return S4N.Sys.textFromHtml(arg.data).trim();
  },

  get_dragValue: function () {
    return this.get_value();
  },

  set_dragValue: function (value) {
    var ev = this.get_events().getHandler('acceptData'); if (!ev) return;
    ev(this, new S4N.AcceptDataArgs(S4N.ExerciseStatus.Normal, value));
  },

  resetData: function (data) {
    data[this.get_id()] = undefined;
  },

  get_score: function () {
    if (this.example) return null;
    return S4N.CreateScore(this.isCorrect() ? 1 : 0, 1);
  },

  isCorrect: function () {
    if (this.example) return null;
    var value = gf_NormalizeString(this.get_value());
    if (this.isMulti) {
      switch (this.evalMode) {
        case S4N.GapFillEvalMode.intelligent:
        case S4N.GapFillEvalMode.no:
        case S4N.GapFillEvalMode.ignoreCase:
          for (var i = 0; i < this.correct.length; i++)
            if (gf_NormalizeString(this.correct[i]).toLowerCase() == value.toLowerCase()) return true;
          return false;
        case S4N.GapFillEvalMode.caseSensitive:
          for (var i = 0; i < this.correct.length; i++)
            if (gf_NormalizeString(this.correct[i]) == value) return true;
          return false;
      }
    } else {
      switch (this.evalMode) {
        case S4N.GapFillEvalMode.intelligent:
        case S4N.GapFillEvalMode.no:
        case S4N.GapFillEvalMode.ignoreCase: return (gf_NormalizeString(this.correct).toLowerCase() == value.toLowerCase());
        case S4N.GapFillEvalMode.caseSensitive: return (gf_NormalizeString(this.correct) == value);
      }
    }
  },

  correctHTML: function () {
    return this.isMulti ? this.correct[0] : this.correct;
    //return _evalBehavior==null ? "" : _evalBehavior.correctHTML (this.get_value ());
  },

  provideData: function (data) {
    data[this.get_id()] = this.get_value();
  },

  doAcceptData: function (exSt, data) {
    var ev = this.get_events().getHandler('acceptData'); if (!ev) return;
    var arg = new S4N.AcceptDataArgs(exSt, this.get_dataValue(data));
    ev(this, arg);
  }
};
S4N.GapFill.registerClass('S4N.GapFill', S4N.Control, S4N.IScoreProvider);

/*********** CONTROL GapFillSet ***********/
S4N.GapFillSet = function () {
  S4N.GapFillSet.initializeBase(this);
  this.corrects = [];
  this.correctUses = [];
  this.evalLen = 0;
};
S4N.GapFillSet.prototype = {

  initialize: function () {
    S4N.GapFillSet.callBaseMethod(this, 'initialize');
    var gapFills = this.get_scoreProviders();
    for (var i = 0; i < gapFills.length; i++) {
      var gp = gapFills[i];
      if (!gp.isFake) this.evalLen += 1;
      $assert(!gp.isMulti, 'Error');
      var c = gp.correct; if (c == '') continue;
      Array.add(this.corrects, c);
      //Array.add(this.corrects, gf_NormalizeString(c));
      Array.add(this.correctUses, false);
    }
  },

  evalSet: function () {
    var _gapFills = this.get_scoreProviders();
    for (var i = 0; i < this.correctUses.length; i++) this.correctUses[i] = false;
    //naplneni spravnych gap fills, oznaceni spatnych
    var bad = [];
    for (var i = 0; i < _gapFills.length; i++) {
      var c = gf_NormalizeString(_gapFills[i].get_value()).toLowerCase();
      var ok = false;
      for (var j = 0; j < this.corrects.length; j++) {
        if (this.correctUses[j]) continue;
        //if ($isEmpty(this.corrects[j]) || c != this.corrects[j].toLowerCase()) continue;
        if ($isEmpty(this.corrects[j]) || c != gf_NormalizeString(this.corrects[j]).toLowerCase()) continue;
        this.correctUses[j] = true;
        _gapFills[i].correct = this.corrects[j];
        ok = true;
      }
      if (!ok) Array.add(bad, _gapFills[i]);
    }
    //vyuziti zbylych gap fills
    var wrongNum = 0;
    for (var i = 0; i < bad.length; i++) {
      var ok = false;
      for (var j = 0; j < this.corrects.length; j++) {
        if (this.correctUses[j]) continue;
        bad[i].correct = this.corrects[j];
        this.correctUses[j] = true;
        ok = true;
        break;
      }
      if (!ok) bad[i].correct = '';
      if (!bad[i].isCorrect()) wrongNum++;
    }
    return wrongNum;
  },

  resetData: function (data) {
    S4N.GapFillSet.callBaseMethod(this, 'resetData', [data]);
  },

  get_score: function () {
    //var _gapFills = this.get_scoreProviders();
    //var len = _gapFills.length;
    var len = this.evalLen;
    var wrong = this.evalSet(); if (wrong > len) wrong = len;
    return S4N.CreateScore(len - wrong, len);
  },

  provideData: function (data) {
    var _gapFills = this.get_scoreProviders();
    for (var i = 0; i < _gapFills.length; i++) {
      _gapFills[i].provideData(data);
    }
  },

  acceptData: function (exSt, data) {
    if (this.exerciseStatus == exSt) return;
    var _gapFills = this.get_scoreProviders();
    if (exSt == S4N.ExerciseStatus.Evaluated) {
      //1. pruchod: nastaveni hodnoty
      for (var i = 0; i < _gapFills.length; i++)
        _gapFills[i].acceptData(-1, data);
      //2. pruchod: preskladani hodnot mnozinovym algoritmem
      this.evalSet();
    }
    //3. pruchod: nastaveni stavu
    for (var i = 0; i < _gapFills.length; i++)
      _gapFills[i].acceptData(exSt, data);
    this.exerciseStatus = exSt;
  }

};
S4N.GapFillSet.registerClass('S4N.GapFillSet', S4N.EvalGroup, S4N.IScoreProvider);

/*********** CONTROL CrossWord ***********/
S4N.CrossWord = function (element) {
  S4N.CrossWord.initializeBase(this, [element]);
  this.correct = '';
};

S4N.CrossWord.prototype = {

  initialize: function () {
    S4N.CrossWord.callBaseMethod(this, 'initialize');
  },
  add_acceptData: function (handler) { this.get_events().addHandler('acceptData', handler); },

  provideData: function (data) {
    data[this.get_id()] = this._element.value;
  },
  doAcceptData: function (exSt, data) {
    var ev = this.get_events().getHandler('acceptData'); if (!ev) return;
    var dt = data[this.get_id()];
    if ($isEmpty(dt)) dt = '';
    var arg = new S4N.AcceptDataArgs(exSt, dt);
    ev(this, arg);
  },
  resetData: function (data) {
    data[this.get_id()] = undefined;
  },
  isCorrect: function () {
    return (this._element.value.toLowerCase() == this.correct.toLowerCase());
  }

};
S4N.CrossWord.registerClass('S4N.CrossWord', S4N.Control, S4N.IScoreProvider);


///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\lm\GapFillSource.js
//*********** EVENT ARG  SourceDisabledArg ***********/
S4N.SourceDisabledArg = function (disable) {
  S4N.SourceDisabledArg.initializeBase(this);
  this.disable = disable;
};
S4N.SourceDisabledArg.registerClass('S4N.SourceDisabledArg', Sys.EventArgs);

/**/
S4N.DragSourceGroup = function () {
  S4N.DragSourceGroup.initializeBase(this);

  this.members = []; //prvky seznamy DAD objektu (S4N.DragSourceBehavior)
  this.mode = AjaxControlToolkit.DragMode.Copy; //copy x move
  this.dragTemplate = null;
};

S4N.DragSourceGroup.prototype = {

  initialize: function () {
    S4N.DragSourceGroup.callBaseMethod(this, 'initialize');
    $addHandler(document.body, 'selectstart', Function.createDelegate(this, this.onSelectStart));
    //S4N.DragSourceBehavior k prvkum drag source
    for (var i = 0; i < this.members.length; i++) {
      this.members[i] = new S4N.DragSourceBehavior(this.members[i], this, i, null);
      this.members[i].initialize();
    }
  },

  get_members: function () { return members; },
  set_members: function (value) { this.members = value; },

  get_dragTemplate: function () { return this.dragTemplate; },
  set_dragTemplate: function (value) { this.dragTemplate = value; },

  add_sourceDisabled: function (handler) { this.get_events().addHandler('sourceDisabled', handler); }, //disabled pouziteho drag item
  add_targetFullChange: function (handler) { this.get_events().addHandler('targetFullChange', handler); }, //zmena vzhledu gapfillu po Drop
  add_canDrop: function (handler) { this.get_events().addHandler('canDrop', handler); }, //zmena drag efekt elementu po najeti na target

  onCanDrop: function (dragSource, value) {
    var ev = this.get_events().getHandler('canDrop'); if (ev) ev(dragSource, new S4N.BoolArg(value));
  },

  onSelectStart: function () {
    return false;
  },

  memberDisable: function (idx, disable) {
    if (this.mode == AjaxControlToolkit.DragMode.Copy) return;
    if ($isEmpty(disable)) disable = false;
    this.members[idx].disabled = disable;
    var ev = this.get_events().getHandler('sourceDisabled');
    if (ev) ev(this.members[idx], new S4N.SourceDisabledArg(disable));
  }

};
S4N.DragSourceGroup.registerClass('S4N.DragSourceGroup', Sys.Component);


S4N.DropTargetBehavior = function (element) {
  S4N.DropTargetBehavior.initializeBase(this, [element]);

  this.group = null; //S4N.DragSourceGroup
  this.attachedSource = null; //S4N.DragSourceBehavior: DropTargetBehavior je zaroven dragsource. Pro isTrash je null.
  //this.isTrash = false; //drag target k body tagu pro realizaci Trash
};

S4N.DropTargetBehavior.prototype = {

  initialize: function () {
    S4N.DropTargetBehavior.callBaseMethod(this, 'initialize');
    AjaxControlToolkit.DragDropManager.registerDropTarget(this);
    this.attachedSource = new S4N.DragSourceBehavior(this._element, this.group, -1, this);
    this.attachedSource.initialize();
    var root = $evalRoot();
    if (root != null) root.addScoreProvider(this);
  },

  get_owner: function () { return this.group; },
  set_owner: function (value) { this.group = value; },

  // IDropTarget members.
  get_dropTargetElement: function () { return this._element; },

  adjustEdit: function (attachedSource, idx) {
    if (attachedSource == null) return;
    attachedSource._element.control.set_dragValue(idx < 0 ? '' : $innerText(this.group.members[idx]._element));
    attachedSource.ownerIdx = idx;
    var ev = this.group.get_events().getHandler('targetFullChange');
    if (ev) ev(attachedSource, new S4N.BoolArg(idx >= 0));
  },

  drop: function (dragMode, type, dragSource) {
    //draguji do plneho GapFillu
    if (this.attachedSource.ownerIdx >= 0)
      this.group.memberDisable(this.attachedSource.ownerIdx, false); //dragSource, odpovidajici staremu obsahu gapfillu, dej enabled
    //napln edit
    this.adjustEdit(
      this.attachedSource,
      dragSource.ownerIdx);
    //aktualizuj zdroj dragovani
    if (dragSource.target == null)
      this.group.memberDisable(dragSource.ownerIdx, true); //nedraguji attachedSource, dragSource dej disable
    else
      this.adjustEdit(dragSource, -1); //draguji attachedSource, zdrojovy edit dej prazdny
  },

  canDrop: function (dragMode, dataType, dragSource) {
    return (dragSource != null && dragSource.ownerIdx != this.attachedSource.ownerIdx && dataType == this.group.get_id());
  },

  onDragEnterTarget: function (dragMode, type, dragSource) {
    //data je 4N.UI.DragSourceBehavior
    if (!this.canDrop(dragMode, type, dragSource)) return;
    this.group.onCanDrop(dragSource, true);
  },

  onDragLeaveTarget: function (dragMode, type, dragSource) {
    this.group.onCanDrop(dragSource, false);
  },

  onDragInTarget: function (dragMode, type, dragSource) {
  },

  //IScoreProvider members
  resetData: function (data) {
    data[this.get_id()] = undefined;
  },
  get_score: function () {
    return null;
  },
  provideData: function (data) {
    //pamatuje si ID drag source
    if (this.attachedSource.ownerIdx < 0) { data[this.get_id()] = undefined; return; }
    data[this.get_id()] = this.group.members[this.attachedSource.ownerIdx].get_id();
  },
  acceptData: function (exSt, data) {
    //Dle ID drag source nalezni jeho ownerIdx
    var srcId = data[this.get_id()];
    if ($isEmpty(srcId)) { this.attachedSource.ownerIdx = -1; return; }
    for (var i = 0; i < this.group.members.length; i++) {
      var mem = this.group.members[i];
      if (mem.get_id() == srcId) {
        this.attachedSource.ownerIdx = mem.ownerIdx; break;
      }
    }
  }

};
S4N.DropTargetBehavior.registerClass('S4N.DropTargetBehavior', Sys.UI.Behavior, AjaxControlToolkit.IDropTarget, S4N.IScoreProvider);

S4N.DragSourceBehavior = function (element, group, ownerIdx, target) {
  S4N.DragSourceBehavior.initializeBase(this, [element]);
  this.group = group; //S4N.DragSourceGroup
  this.ownerIdx = ownerIdx; //Index v DragSourceGroup.members. Pro target!=null je -1 (je-li target prazdny) nebo index prvku, odkud jsem dragoval.
  this.target = target; //Drag Source je pripojen k S4N.DropTargetBehavior (kvuli moznosti Drag UnDo)
  this.disabled = false; //pro Move scenar: kontrolka je droped, neni ji tedy mozno dragovat
  this.itemTemplateInstance = null; //clone dragovane kontrolky
};

S4N.DragSourceBehavior.prototype = {

  initialize: function () {
    S4N.DragSourceBehavior.callBaseMethod(this, 'initialize');
    $addHandler(this._element, "mousedown", Function.createDelegate(this, this.mouseDownHandler));
    if (this.target == null && this.group.mode == AjaxControlToolkit.DragMode.Move) { //move dragsource si potrebuje pamatovat disable
      var root = $evalRoot();
      if (root != null) root.addScoreProvider(this);
    }
  },

  mouseDownHandler: function (ev) {
    if (this.ownerIdx < 0 || this.disabled || $evalRoot().exerciseStatus != S4N.ExerciseStatus.Normal) return;
    window._event = ev;
    var el = this._element;
    //clone template
    if (this.itemTemplateInstance == null) {
      this.itemTemplateInstance = this.group.dragTemplate.cloneNode(true);
      this.itemTemplateInstance.innerHTML = this.target != null ? this._element.control.get_dragValue() : this._element.innerHTML;
    } else {
      this.group.onCanDrop(this, false);
    }
    document.body.appendChild(this.itemTemplateInstance);
    //template position
    var dadMan = AjaxControlToolkit.DragDropManager._getInstance();
    var location = { x: ev.clientX + 10, y: ev.clientY - 10 };
    var scrollOffset = dadMan.getScrollOffset(document.body, true);
    location = dadMan.addPoints(location, scrollOffset);
    Sys.UI.DomElement.setLocation(this.itemTemplateInstance, location.x, location.y);
    //prevent default
    ev.preventDefault();
    //start drag
    AjaxControlToolkit.DragDropManager.startDragDrop(this, this.itemTemplateInstance, null);
  },

  // IDragSource members.
  get_dragDataType: function () {
    return this.group.get_id();
  },
  getDragData: function () {
    return this;
  },
  get_dragMode: function () {
    return this.group.mode;
  },
  onDragStart: function () {
  },
  onDrag: function () {
  },
  onDragEnd: function (canceled) {
    if (this.itemTemplateInstance.parentNode == null) return;
    this.itemTemplateInstance.parentNode.removeChild(this.itemTemplateInstance);
    if (!canceled || this.target == null) return;
    //Trash:
    this.group.memberDisable(this.ownerIdx, false); //prislusny dragSource dej enable
    this.target.adjustEdit(this, -1); //edit dej prazdny
  },
  get_id: function () {
    return this._element.id;
  },
  //IScoreProvider members
  resetData: function (data) {
    data[this.get_id()] = undefined;
  },
  get_score: function () {
    return null;
  },
  provideData: function (data) {
    data[this.get_id()] = this.disabled;
  },
  acceptData: function (exSt, data) {
    if (exSt != S4N.ExerciseStatus.Normal)
      this.group.memberDisable(this.ownerIdx, true); //nastav disable
    else
      this.group.memberDisable(this.ownerIdx, data[this.get_id()]); //nastav disable
  }

};
S4N.DragSourceBehavior.registerClass('S4N.DragSourceBehavior', Sys.UI.Behavior, AjaxControlToolkit.IDragSource, S4N.IScoreProvider);



///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\script\lm\HideText.js
S4N.HideTextMark = function (element) {
  S4N.HideTextMark.initializeBase(this, [element]);

  this.hideId = null;
  this.words = [];
  this.marks = [];
  this.marksText = null;
};

S4N.HideTextMark.prototype = {

  initialize: function () {
    S4N.HideTextMark.callBaseMethod(this, 'initialize');

    $addHandler(this._element, 'click', Function.createDelegate(this, this.doClick));
    if (this.marksText != null) {
      for (var i = 0; i < this.marksText.length; i++) {
        this.marks[i] = $find(this.marksText[i]);
      }
    }
    if (this.hideId != null) {
      this.words = $(this._element.parentElement).find('.s4n_hideid');
    }

    //if (this.hideId != null) {
    //  var childs = S4N.Sys.DocumentAll();
    //  for (var i = 0; i < childs.length; i++) {
    //    if (childs[i].getAttribute('s4n_hideId') == this.hideId)
    //      Array.add(this.words, childs[i]);
    //  }
    //}

    var grp = $evalRoot(); if (grp == null) return;
    grp.get_events().addHandler("propertyChanged", Function.createDelegate(this, this.exerciseStatusChanged));
  },

  set_hideId: function (value) { this.hideId = value; },
  get_marks: function () { return this.marks; },
  set_marks: function (value) { this.marksText = value; },

  exerciseStatusChanged: function (sender, eventArgs) {
    if (eventArgs._propertyName != 'exerciseStatus') return;
    this.setVisible(sender.exerciseStatus == S4N.ExerciseStatus.Evaluated);
  },

  doClick: function (ev) {
    ev.stopPropagation();
    this.toggleVisible();
  },

  getVisible: function () {
    if (this.words.length != 0)
      return !Sys.UI.DomElement.containsCssClass(this.words[0], 'htHidden');
    else if (this.marks.length != 0)
      return this.marks[0].getVisible();
    else
      return false;
  },
  setVisible: function (visible) {
    for (var i = 0; i < this.words.length; i++) {
      S4N.Sys.setCssStatus(this.words[i], !visible, 'htHidden');
      //S4N.Sys.setCssStatus (this.words[i].childNodes[0], visible, 'visible', !visible, 'visibleHidden');
    }
    for (var i = 0; i < this.marks.length; i++) {
      this.marks[i].setVisible(visible);
    }
  },
  toggleVisible: function () {
    var visible = this.getVisible();
    this.setVisible(!visible);
  }
};
S4N.HideTextMark.registerClass('S4N.HideTextMark', S4N.Control);

///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\Controls\Other\hide_control.js
function hc_VisibleChanged(sender, eventArgs) {
  var visible = eventArgs.value;
  S4N.Sys.setCssStatus(sender._element, visible, 'hcStateOpen', !visible, 'hcStateClosed');
};

///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\Controls\Sound\Sound.js
snd_sentenceFocus = function (sender, arg) {
  var markCtrl = sender.get_control('Mark', true);
  if (markCtrl != null)
    S4N.Sys.setCssStatus(markCtrl, arg.value, 'sdMarkOn', !arg.value, 'sdMark');
  markCtrl = sender.get_control('Pronunc', true);
  if (markCtrl != null)
    S4N.Sys.setCssStatus(markCtrl, arg.value, 'sdPronuncMarkOn', !arg.value, 'sdPronuncMark');
  S4N.Sys.setCssStatus(sender._element, arg.value, 'sdSentencePlaying');
};

snd_markFocus = function (sender, arg) {
  S4N.Sys.setCssStatus(sender._element, arg.value, 'sdMarkBigOn', !arg.value, 'sdMarkBig');
};
///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\Controls\GapFill\Gap_Fill.js
function gf_GetValue(sender, eventArgs) {
  eventArgs.data = sender.get_control('Input').value;
};

function gf_AdjustText(val, emptyNbsp) {
  if (val == null || typeof (val) == 'undefined' || val == '') return emptyNbsp ? '&nbsp;' : '';
  return val;
};

function gf_Refresh(tags) {
  //FireFox hack: jinak se spatne aktualizuje sirka divu
  if (tags.ul.style.position == 'relative')
    tags.ul.style.position = '';
  else
    tags.ul.style.position = 'relative'
};

function gf_DisplayAll(tags, l1, l2, l3) {
  gf_Display(tags.line1, l1);
  gf_Display(tags.line2, l2);
  gf_Display(tags.line3, l3);
};

function gf_Display(el, visible) {
  el.style.display = visible ? '' : 'none';
};

/*function gf_Content2 (tags, value, strike) {
  tags.cont2.innerHTML = gf_AdjustText (value, true);
  //S4N.Sys.setCssStatus (tags.cont2, strike, 'evaStrike');
};*/

//mode: 0..dragtarget, 1..start, 2..OK, 3..empty user, 4..not empty user, 5..preview mode
function gf_SetStatus(tags, mode, value1, value2) {
  switch (mode) {
    case 0: //drag target
    case 2: //po vyhodnoceni - OK
      //readonly normal text v line2
      tags.cont2.innerHTML = gf_AdjustText(value1, true);
      //gf_Content2 (tags, value1, false);
      gf_DisplayAll(tags, false, true, false);
      break;
    case 1: //start
      //gapfill s init hodnotou
      tags.input.value = gf_AdjustText(value1, false);
      gf_DisplayAll(tags, false, false, true);
      break;
    case 3: //po vyhodnoceni: wrong, prazdna odpoved uzivatele
      //cervene text v line1
      tags.cont1.innerHTML = gf_AdjustText(value2, true);
      gf_DisplayAll(tags, true, false, false);
      break;
    case 4: //po vyhodnoceni: wrong, neprazdna odpoved uzivatele
      //cervene text v line1, preskrtnuty text v line2
      tags.cont1.innerHTML = gf_AdjustText(value2, true);
      //gf_Content2 (tags, value1, true);
      tags.cont2.innerHTML = gf_AdjustText(value1, true);
      gf_DisplayAll(tags, true, true, false);
      break;
    case 5: //preview
      tags.input.value = gf_AdjustText(value1, false);
      gf_DisplayAll(tags, false, false, true);
      tags.input.readOnly = true;
      break;
  }
};

function gf_AcceptData(sender, eventArgs) {
  var st = eventArgs.exerciseStatus; var data = eventArgs.data.replace(/(&nbsp;)/g, ' ');
  var tags = {
    'div': sender._element,
    'ul': sender.get_control('Table'),
    'line1': sender.get_control('1'),
    'cont1': sender.get_control('c1'),
    'line2': sender.get_control('2'),
    'cont2': sender.get_control('c2'),
    'line3': sender.get_control('3'),
    'input': sender.get_control('Input'),
    'ffHack': sender.inline && Sys.Browser.agent == Sys.Browser.Firefox
  }
  var isDragTarget = sender.dragTarget;
  tags.input.value = data; //nosic dat bez ohledu na isDragTarget
  switch (st) {
    case S4N.ExerciseStatus.Preview:
      S4N.Sys.setCssStatus(tags.ul, false, 'evaCorrect', false, 'evaIncorrect', false, 'evaEmpty');
      gf_SetStatus(tags, 5, data);
    case S4N.ExerciseStatus.Normal:
      S4N.Sys.setCssStatus(tags.ul, false, 'evaCorrect', false, 'evaIncorrect', false, 'evaEmpty');
      gf_SetStatus(tags, isDragTarget ? 0 : 1, data);
      break;
    case S4N.ExerciseStatus.Evaluated:
      var correctData = sender.correctHTML();
      var empty = $isEmpty(data);
      var isCorrect = sender.example ? true : sender.isCorrect();
      var mode;
      if (isCorrect) mode = 2; else if (empty) mode = 3; else mode = 4;
      S4N.Sys.setCssStatus(tags.ul, false, 'dtDropped', false, 'dtItem', isCorrect, 'evaCorrect', !isCorrect && !empty, 'evaIncorrect', !isCorrect && empty, 'evaEmpty');
      gf_SetStatus(tags, mode, data, correctData);
      break;
  }
  if (tags.ffHack) gf_Refresh(tags);
};

///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\Controls\Marks\eval_mark.js
function evm_ScoreText(sender) {
  var score = sender.group.get_score();
  if (score == null || score[1] == 0) return '0%';
  var sc = score[0] / score[1] * 100;
  return Math.floor(sc).toString() + '%';
};
function evm_Status(sender, eventArgs) {
  var st = sender.status;
  var el = sender._element;
  var normalCtrl = $getEx(sender, 'Normal'); var evaluatedCtrl = $getEx(sender, 'Evaluated');
  switch (st) {
    case S4N.EvalControlStatus.DoEval:
      S4N.Sys.setCssStatus(evaluatedCtrl, true, 'displayNone', false, 'displayInline');
      S4N.Sys.setCssStatus(normalCtrl, false, 'displayNone', true, 'displayInline');
      S4N.Sys.setCssStatus(el, true, 'emEvaluate', false, 'emResult', false, 'emAgain');
      break;
    case S4N.EvalControlStatus.Disabled:
    case S4N.EvalControlStatus.DoReset:
      var textCtrl = $getEx(sender, 'Text'); var widthCtrl = $getEx(sender, 'Width');
      S4N.Sys.setCssStatus(evaluatedCtrl, false, 'displayNone', true, 'displayInline');
      S4N.Sys.setCssStatus(normalCtrl, true, 'displayNone', false, 'displayInline');
      S4N.Sys.setCssStatus(el, false, 'emEvaluate', true, 'emResult', st == S4N.EvalControlStatus.DoReset, 'emAgain');
      var txt = evm_ScoreText(sender);
      textCtrl.innerHTML = txt;
      widthCtrl.style.width = txt;
      break;
  }
};


///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\Controls\Orderings\orderings.js
ord_canDrop = function (dragSource, arg) {
  S4N.Sys.setCssStatus(dragSource.itemTemplateInstance, arg.value, 'dsDraggedCanDrop');
};

ord_dragStatusChanged = function (sender, arg) {
  var isInsert = arg.status == S4N.OrderStatus.enterTarget;
  S4N.Sys.setCssStatus(arg.item._element, isInsert, 'ordInsertBetween');
};

ordw_acceptData = function (sender, arg) {
  var trEval = sender.get_control('Eval', false);
  var isEval = arg.exerciseStatus == S4N.ExerciseStatus.Evaluated;
  S4N.Sys.setCssStatus(trEval, !isEval, 'displayNone');
  S4N.Sys.setCssStatus(sender._element, isEval, 'displayNone');
  if (isEval) {
    var trOk = sender.get_control('Ok', false); var trUser = sender.get_control('User', false);
    var trOkText = sender.get_control('OkText'); var trUserText = sender.get_control('UserText');
    var okText = sender.get_sentenceText(true); var userText = sender.get_sentenceText(false);
    var isCorrect = okText == userText;
    trOkText.innerHTML = okText;
    S4N.Sys.setCssStatus(trEval, isCorrect, 'evaCorrect', !isCorrect, 'evaIncorrect');
    S4N.Sys.setCssStatus(trOk, isCorrect, 'displayNone');
    trUserText.innerHTML = userText;
  }
};

ords_acceptData = function (sender, arg) {
  var isEval = arg.exerciseStatus == S4N.ExerciseStatus.Evaluated;
  for (var i = 0; i < sender.items.length; i++) {
    var item = sender.items[i];
    //Not eval: uved do puvodniho stavu
    if (!isEval) {
      S4N.Sys.setCssStatus(item._element, false, 'evaCorrect', false, 'evaIncorrect', true, 'dsItem', false, 'dtItem');
      continue;
    }
    //priprava
    var okText = item.get_text(true); var userText = item.get_text(false);
    var isCorrect = okText == userText;
    S4N.Sys.setCssStatus(item._element, isCorrect, 'evaCorrect', !isCorrect, 'evaIncorrect', false, 'dsItem', true, 'dtItem');
    var idx = $getIdx(item._element.childNodes[0]); //pro vyhodnocovani: puvodni index itemu. Vyuzije se v S4N.ReorderList.isCorrect
    //nahrada Dragable obsahu:
    while (item._element.hasChildNodes()) item._element.removeChild(item._element.childNodes[0]);
    var innerHtml = '';
    if (isCorrect) {
      innerHtml = '<div class="evaUserValue"><nobr>' + okText + '</nobr></div>';
    } else {
      innerHtml = '<div class="evaCorrectValue"><nobr>' + okText + '</nobr></div><div class="evaUserValue"><nobr class="evaStrike">' + userText + '</nobr></div>';
    }
    item._element.innerHTML = innerHtml;
    $setIdx(item._element.childNodes[0], idx); //PZ 20.6.08: ve firefox se neprenese idx z innerHTML do vlastnosti
  }
};

ordp_dragStatusChanged = function (sender, arg) {
  if (arg.status == S4N.OrderStatus.drop)
    S4N.Sys.setCssStatus(arg.item._element.parentNode, true, 'ordPairingStateLine', false, 'ordPairingStateAvailable');
  else
    ord_dragStatusChanged(sender, arg);
};

ordp_acceptData = function (sender, arg) {
  var isEval = arg.exerciseStatus == S4N.ExerciseStatus.Evaluated;
  if (isEval) {
    for (var i = 0; i < sender.items.length; i++) {
      var item = sender.items[i];
      var divCtrl = item._element.childNodes[0]; //"div class=dsItem je jediny element v TD
      var okText = item.get_text(true); var userText = item.get_text(false);
      var isCorrect = okText == userText;
      var idx = $getIdx(item._element.childNodes[0]); //pro vyhodnocovani: puvodni index itemu. Vyuzije se v S4N.ReorderList.isCorrect
      //odstran vsechny elementy:
      while (item._element.hasChildNodes()) item._element.removeChild(item._element.childNodes[0]);
      //pomoci innerHTML vloz nove, vyhodnocovaci:
      var innerHtml = '<div class="dtItem ' + (isCorrect ? 'evaCorrect' : 'evaIncorrect') + '">';
      if (isCorrect) {
        innerHtml += '<div class="evaUserValue"><nobr>' + okText + '</nobr></div>';
      } else {
        innerHtml += '<div class="evaCorrectValue"><nobr>' + okText + '</nobr></div><div class="evaUserValue"><nobr class="evaStrike">' + userText + '</nobr></div>';
      }
      innerHtml += '</div>';
      item._element.innerHTML = innerHtml;
      $setIdx(item._element.childNodes[0], idx); //PZ 20.6.08: ve firefox se neprenese idx z innerHTML do vlastnosti
    }
  }
  //nastav prostredni sloupec
  for (var i = 0; i < sender.items.length; i++)
    S4N.Sys.setCssStatus(sender.items[i]._element.parentNode, isEval, 'ordPairingStateLine', !isEval, 'ordPairingStateAvailable');
};

///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\Controls\Selections\selections.js
function chb_StatusChanged(sender, eventArgs) {
  var iconCtrl = sender.get_control('Icon');
  var isCheckItem = sender.type == S4N.CheckBoxType.CheckBox; //isCheckItem=true pak checkbox, jinak radiobutton
  switch (sender.checkStatus) {
    case S4N.CheckBoxStatus.Undefined:
      if (isCheckItem) S4N.Sys.setCssStatus(iconCtrl,
         false, 'selCBChecked', false, 'selCBUnchecked', false, 'selCBEvaChecked', false, 'selCBEvaUnchecked', true, 'selCBUndefined', false, 'selCBUndEvaUnchecked', false, 'selCBUndEvaChecked');
      break;
    case S4N.CheckBoxStatus.UndefinedChecked:
      if (isCheckItem) S4N.Sys.setCssStatus(iconCtrl,
         false, 'selCBChecked', false, 'selCBUnchecked', false, 'selCBEvaChecked', false, 'selCBEvaUnchecked', false, 'selCBUndefined', false, 'selCBUndEvaUnchecked', true, 'selCBUndEvaChecked');
      break;
    case S4N.CheckBoxStatus.UndefinedUnchecked:
      if (isCheckItem) S4N.Sys.setCssStatus(iconCtrl,
         false, 'selCBChecked', false, 'selCBUnchecked', false, 'selCBEvaChecked', false, 'selCBEvaUnchecked', false, 'selCBUndefined', true, 'selCBUndEvaUnchecked', false, 'selCBUndEvaChecked');
      break;
    case S4N.CheckBoxStatus.ReadOnly:
    case S4N.CheckBoxStatus.UncheckedOK:
    case S4N.CheckBoxStatus.Unchecked:
      if (isCheckItem) S4N.Sys.setCssStatus(iconCtrl,
         false, 'selCBChecked', true, 'selCBUnchecked', false, 'selCBEvaChecked', false, 'selCBEvaUnchecked', false, 'selCBUndefined', false, 'selCBUndEvaUnchecked', false, 'selCBUndEvaChecked');
      else S4N.Sys.setCssStatus(iconCtrl,
         false, 'selRBChecked', true, 'selRBUnchecked', false, 'selRBEvaChecked', false, 'selRBEvaUnchecked');
      break;
    case S4N.CheckBoxStatus.CheckedOK:
    case S4N.CheckBoxStatus.Checked:
      if (isCheckItem) S4N.Sys.setCssStatus(iconCtrl,
         true, 'selCBChecked', false, 'selCBUnchecked', false, 'selCBEvaChecked', false, 'selCBEvaUnchecked', false, 'selCBUndefined', false, 'selCBUndEvaUnchecked', false, 'selCBUndEvaChecked');
      else S4N.Sys.setCssStatus(iconCtrl,
         true, 'selRBChecked', false, 'selRBUnchecked', false, 'selRBEvaChecked', false, 'selRBEvaUnchecked');
      break;
    case S4N.CheckBoxStatus.UncheckedWrong:
      if (isCheckItem) S4N.Sys.setCssStatus(iconCtrl,
         false, 'selCBChecked', false, 'selCBUnchecked', false, 'selCBEvaChecked', true, 'selCBEvaUnchecked', false, 'selCBUndefined', false, 'selCBUndEvaUnchecked', false, 'selCBUndEvaChecked');
      else S4N.Sys.setCssStatus(iconCtrl,
         false, 'selRBChecked', false, 'selRBUnchecked', false, 'selRBEvaChecked', true, 'selRBEvaUnchecked');
      break;
    case S4N.CheckBoxStatus.CheckedWrong:
      if (isCheckItem) S4N.Sys.setCssStatus(iconCtrl,
         false, 'selCBChecked', false, 'selCBUnchecked', true, 'selCBEvaChecked', false, 'selCBEvaUnchecked', false, 'selCBUndefined', false, 'selCBUndEvaUnchecked', false, 'selCBUndEvaChecked');
      else S4N.Sys.setCssStatus(iconCtrl,
         false, 'selRBChecked', false, 'selRBUnchecked', true, 'selRBEvaChecked', false, 'selRBEvaUnchecked');
      break;
  }
};

function chbw_StatusChanged(sender, eventArgs) {
  var ctrl = sender._element;
  switch (sender.checkStatus) {
    case S4N.CheckBoxStatus.UndefinedUnchecked:
    case S4N.CheckBoxStatus.UndefinedChecked:
    case S4N.CheckBoxStatus.Undefined:
      break;
    case S4N.CheckBoxStatus.UncheckedOK:
    case S4N.CheckBoxStatus.Unchecked:
    case S4N.CheckBoxStatus.ReadOnly:
      S4N.Sys.setCssStatus(ctrl, true, 'selWordUnchecked', false, 'selWordChecked', false, 'selWordEvaUnchecked', false, 'selWordEvaChecked');
      break;
    case S4N.CheckBoxStatus.CheckedOK:
    case S4N.CheckBoxStatus.Checked:
      S4N.Sys.setCssStatus(ctrl, false, 'selWordUnchecked', true, 'selWordChecked', false, 'selWordEvaUnchecked', false, 'selWordEvaChecked');
      break;
    case S4N.CheckBoxStatus.UncheckedWrong:
      S4N.Sys.setCssStatus(ctrl, false, 'selWordUnchecked', false, 'selWordChecked', true, 'selWordEvaUnchecked', false, 'selWordEvaChecked');
      break;
    case S4N.CheckBoxStatus.CheckedWrong:
      S4N.Sys.setCssStatus(ctrl, false, 'selWordUnchecked', false, 'selWordChecked', false, 'selWordEvaUnchecked', true, 'selWordEvaChecked');
      break;
  }
};

///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\Controls\GapFill\cross_word.js
function cw_AcceptData(sender, eventArgs) {
  var st = eventArgs.exerciseStatus; var data = eventArgs.data;
  var cellCtrl = sender.get_control('Cell');
  var textCtrl = sender._element;
  var userCtrl = sender.get_control('User');
  var correctCtrl = sender.get_control('Ok');
  switch (st) {
    case S4N.ExerciseStatus.Normal:
    case S4N.ExerciseStatus.Preview:
      if (st == S4N.ExerciseStatus.Normal) textCtrl.value = data;
      textCtrl.readOnly = st == S4N.ExerciseStatus.Preview;
      S4N.Sys.setCssStatus(textCtrl, false, 'displayNone');
      S4N.Sys.setCssStatus(userCtrl, true, 'displayNone');
      S4N.Sys.setCssStatus(correctCtrl, true, 'displayNone');
      S4N.Sys.setCssStatus(textCtrl, false, 'evaCorrect', false, 'evaEmpty', false, 'evaIncorrect');
      break;
    case S4N.ExerciseStatus.Evaluated:
      var userText = sender.get_control('UserText');
      userText.innerHTML = data;
      textCtrl.value = data;
      var empty = $isEmpty(data);
      correctCtrl.innerHTML = sender.correct;
      var isCorrect = sender.isCorrect();
      S4N.Sys.setCssStatus(textCtrl, true, 'displayNone');
      S4N.Sys.setCssStatus(userCtrl, false, 'displayNone');
      S4N.Sys.setCssStatus(correctCtrl, isCorrect, 'displayNone');
      S4N.Sys.setCssStatus(cellCtrl, isCorrect, 'evaCorrect', !isCorrect && empty, 'evaEmpty', !isCorrect && !empty, 'evaIncorrect');
      break;
  }
};

///#source 1 1 q:\LMNet2\WebApps\EduAuthorNew\framework\Controls\GapFill\Gap_Fill_Source.js
//Droped DragItem: set disable
gps_sourceDisabled = function (dragSource, arg) {
  S4N.Sys.setCssStatus(dragSource._element, arg.disable, 'dsUsed');
};

gps_targetFullChange = function (attachedSource, arg) {
  //S4N.Sys.setCssStatus (attachedSource._element, arg.value, 'dtDropped');
};

gps_canDrop = function (dragSource, arg) {
  S4N.Sys.setCssStatus(dragSource.itemTemplateInstance, arg.value, 'dsDraggedCanDrop');
};

