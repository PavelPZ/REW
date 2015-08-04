﻿using LMComLib;
using System;
using System.Collections.Generic;
using System.Data.Objects;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Login;
using LMNetLib;
using System.Data.Entity;
using schools;
using System.Text.RegularExpressions;
using System.Web;

namespace NewData {

  public static class Schools {

    static Schools() {

      /* SchoolCmdGetDict */
      RewRpcLib.registerCommand<SchoolCmdGetDict, string>(par => {
        return new RpcResponse(getDictWord(par.dictId, par.word));
      });

    }

    public static string getDictWord(string dictId, string word) {
      string url = string.Format("http://www.lingea.cz/ilex51/lms/Home.aspx/lms?word={0}&dict={1}", HttpUtility.UrlEncode(word), HttpUtility.UrlEncode(dictId));
      string html = null; 
      try {
        html = LowUtils.DownloadStr(url);
      }
      catch (Exception exp) {
        html = "*" + url;
      }
      StringBuilder sb = new StringBuilder();
      foreach (regExItem ri in regExItem.Parse(html, rxEntry)) {
        if (ri.IsMatch) { sb.Append('<'); sb.Append(ri.Value.Substring(2, ri.Value.Length - 4)); sb.Append('>'); } else sb.Append(HttpUtility.HtmlEncode(ri.Value));
      }
      return sb.ToString();
    }
    static Regex rxEntry = new Regex("\\\\<.*?\\\\>");
  }
}