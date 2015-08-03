using System;
using System.Data;
using System.Configuration;
using System.Collections.Generic;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Reflection;
using System.Web.Hosting;
using System.Xml.Serialization;
using System.Xml;
using System.Text;
using System.IO;
using LMComLib;
using System.Xml.Linq;
using System.Linq;

namespace LMScormLibDOM {

  public abstract class SoundLow : LMScormObj {
    [XmlIgnore]
    public LMGroupSound GroupSound;
    public abstract string[] files();
    public abstract sound_dialogIgnore_sound ignoreSound();
    sound_sentencesFile? singleFile;
    public sound_sentencesFile SingleFile() {
      if (singleFile != null) return (sound_sentencesFile)singleFile;
      int idx = -1; string[] fls = files();
      for (int i = 0; i < fls.Length; i++) {
        if (string.IsNullOrEmpty(fls[i])) continue;
        if (idx >= 0) { idx = int.MaxValue; break; }
        idx = i;
      }
      if (idx < 0 || idx == int.MaxValue) singleFile = sound_sentencesFile.no;
      else singleFile = (sound_sentencesFile)idx;
      return (sound_sentencesFile)singleFile;
    }
    public IEnumerable<string> mp3Files() {
      foreach (string fn in files())
        if (!string.IsNullOrEmpty(fn)) yield return fn.Replace(".wma", ".mp3");
      //if (!string.IsNullOrEmpty(fn)) yield return fn.Replace(".mp3", ".wma");
    }
    public override void addChildProperties(childProperties props) {
      props.Add(new childProperties.childProperty(this, "sound_sentence", "group_sound", varName));
      props.Add(new childProperties.childProperty(this, "sound_sentences", "group_sound", varName));
    }
    internal struct sndFileInfo {
      internal sndFileInfo(int id, string spaceId, string globalId) {
        this.id = id; this.spaceId = spaceId; this.globalId = globalId;
      }
      internal int id;
      internal string spaceId;
      internal string globalId;
    }
    public static void SoundGroupScript(LMGroupSound root) {
      if (root == null) return;
      bool playerGenerated = false;
      StringBuilder sb = null;
      Dictionary<string, sndFileInfo> files = new Dictionary<string, sndFileInfo>();
      int cnt = 0;
      foreach (LMGroupSound snd in root)
        foreach (LMGroupSound interval in snd) {
          string spaceId, globalId, url;
          interval.markers.getObjId(out spaceId, out globalId, out url);
          if (!files.ContainsKey(url)) files.Add(url, new sndFileInfo(cnt++, spaceId, globalId));
        }
      cnt = 0;
      ConfigLow crsConfig = Deployment.actConfig(null);
      SoundPlayerType sndDriver = crsConfig.LMS == LMSType.SlNewEE ? SoundPlayerType.SlNewEE : SoundPlayerType.no;
      foreach (LMGroupSound snd in root) {
        if (snd.sound.ignoreSound() != sound_dialogIgnore_sound.no) continue;
        snd.varName = string.Format("sg{0}", cnt++);
        if (!playerGenerated) {
          /*
          LMScormLib.LMScormClientScript.RegisterAjaxScript("S4N.SoundPlayer",
            new LMScormLib.AjaxPairs("email", "soundPlayer", "forceVersion", "#sS4N.SoundDriver." + sndDriver.ToString()),
            new LMScormLib.AjaxPairs("onSentFocus", "snd_sentenceFocus", "onMarkFocus", "snd_markFocus"),
            null, null);*/
          playerGenerated = true;
          foreach (KeyValuePair<string, sndFileInfo> kv in files)
            LMScormLib.LMScormClientScript.RegisterAjaxScript("S4N.SoundFile",
              new LMScormLib.AjaxPairs("id", "sf" + kv.Value.id.ToString(), "url", kv.Key, "spaceId", kv.Value.spaceId, "globalId", kv.Value.globalId),
              null, new LMScormLib.AjaxPairs("player", "soundPlayer"), null);
          sb = new StringBuilder();
        }
        //poradi intervalu v grupe
        sb.Length = 0;
        sb.Append("#s[");
        for (int i = 0; i < snd.Count; i++) {
          LMGroupSound interval = (LMGroupSound)snd[i];
          sb.Append('\''); sb.Append(interval.varName); sb.Append('\'');
          if (i < snd.Count - 1) sb.Append(',');
        }
        sb.Append(']');
        LMScormLib.LMScormClientScript.RegisterAjaxScript("S4N.SoundGroup",
          new LMScormLib.AjaxPairs("id", snd.varName, "intervals", sb.ToString()), null, new LMScormLib.AjaxPairs("player", "soundPlayer"), null);
        if (snd.mark != null)
          LMScormLib.LMScormClientScript.RegisterAjaxScript("S4N.SoundMark", null, null, new LMScormLib.AjaxPairs("group", snd.varName), snd.mark.varName);

        for (int i = 0; i < snd.Count; i++) {
          LMGroupSound interval = (LMGroupSound)snd[i];
          string spaceId, globalId, url;
          interval.markers.getObjId(out spaceId, out globalId, out url);
          int fileId = files[url].id;
          LMScormLib.Marker begMark = interval.markers[((sound_sentence)interval[0]).markIdx];
          LMScormLib.Marker endMark = interval.markers[((sound_sentence)interval[interval.Count - 1]).markIdx];
          LMScormLib.LMScormClientScript.RegisterAjaxScript("S4N.SoundInterval",
            new LMScormLib.AjaxPairs("id", interval.varName, "beg", (int)(begMark.Beg / 10000), "end", (int)(endMark.End / 10000)), null, new LMScormLib.AjaxPairs("file", "sf" + fileId.ToString()), null);
          foreach (sound_sentence sent in interval) {
            LMScormLib.Marker mark = interval.markers[sent.markIdx];
            LMScormLib.LMScormClientScript.RegisterAjaxScript("S4N.SoundSent",
              new LMScormLib.AjaxPairs("beg", (int)(mark.Beg / 10000), "end", (int)(mark.End / 10000)/*, "endFocus", mark.Middle*/),
              null,
              new LMScormLib.AjaxPairs("interval", interval.varName),
              sent.varName);

          }
        }
      }
      oldToNewSound.run(root);
    }
  }

  public partial class sound_dialog : SoundLow {
    public override string[] files() {
      return new string[] { file, file2, file3, file4 };
    }
    public override sound_dialogIgnore_sound ignoreSound() {
      return ignore_sound;
    }

    [LocalizedProperty(Type = LocalizeType.items2items), XmlIgnore]
    public object[] localItems;
    public override IEnumerable<object> GetChilds() {
      object[] its = localItems == null ? Items : localItems;
      if (its == null) yield break;
      foreach (object obj in its)
        yield return obj;
    }
  }

  public partial class sound : SoundLow {
    [XmlIgnore]
    public bool[] showColumn;
    public override string[] files() {
      return new string[] { file, file2, file3, file4 };
    }
    public override sound_dialogIgnore_sound ignoreSound() {
      return ignore_sound;
    }
    IEnumerable<sound_sentence> allSent(LMGroupSound grp) {
      foreach (object obj in grp)
        if (obj is sound_sentence) yield return (sound_sentence)obj;
        else if (obj is LMGroupSound) allSent((LMGroupSound)obj);
        else throw new Exception();
    }
    public override void AfterLoad() {
      if (layout != soundLayout.dictionary && layout != soundLayout.dictionary2) return;
      showColumn = new bool[] { false, false, false, false, false, false, false, false };
      showColumn[0] = layout == soundLayout.dictionary;
      showColumn[1] = ignoreSound() == sound_dialogIgnore_sound.no;
      showColumn[3] = true;
      if (layout == soundLayout.dictionary) {
        showColumn[2] = false;
        foreach (sound_sentence sent in allSent(GroupSound)) {
          if (sent.FileMarkers == null) continue;
          Dictionary<string, object> props = sent.FileMarkers[sent.markIdx].Props;
          if (props == null) continue;
          showColumn[4] = showColumn[4] || props.ContainsKey("p");
          showColumn[5] = showColumn[5] || props.ContainsKey("d");
          showColumn[6] = showColumn[6] || props.ContainsKey("td");
          showColumn[7] = showColumn[7] || props.ContainsKey("t");
        }
      } else {
        foreach (sound_sentence sent in allSent(GroupSound)) {
          if (sent.FileMarkers == null) continue;
          Dictionary<string, object> props = sent.FileMarkers[sent.markIdx].Props;
          if (props == null) continue;
          showColumn[2] = showColumn[2] || props.ContainsKey("p");
          showColumn[7] = showColumn[7] || props.ContainsKey("t");
        }
      }
    }

    [LocalizedProperty(Type = LocalizeType.items2items), XmlIgnore]
    public object[] localItems;
    public override IEnumerable<object> GetChilds() {
      object[] its = localItems == null ? Items : localItems;
      if (its == null) yield break;
      foreach (object obj in its)
        yield return obj;
    }
  }

  public partial class sound_dialogRole : LMScormObj {

    [XmlIgnore]
    public XElement oldToNewXml; //OldToNew

    [XmlIgnore]
    public bool isText;
    public override void AfterLoad() {
      base.AfterLoad();
      isText = !string.IsNullOrEmpty(role_text);
      if (role_icon == sound_dialogRoleRole_icon.no && !isText)
        throw new Exception(string.Format(@"Missing role_text or role_icon attribute in {0}", ErrorId));
      if (role_icon != sound_dialogRoleRole_icon.no && isText)
        throw new Exception(string.Format(@"Only one from role_text,role_icon attribute alowed {0}", ErrorId));
    }

    [LocalizedProperty(Type = LocalizeType.items2items), XmlIgnore]
    public object[] localItems;
    public override IEnumerable<object> GetChilds() {
      object[] its = localItems == null ? Items : localItems;
      if (its == null) yield break;
      foreach (object obj in its)
        yield return obj;
    }
  }

  public partial class sound_sentence : LMScormObj {
    [LocalizedProperty(Type = LocalizeType.items2items), XmlIgnore]
    public object[] localItems;
    public override IEnumerable<object> GetChilds() {
      object[] its = localItems == null ? Items : localItems;
      if (its == null) yield break;
      foreach (object obj in its)
        yield return obj;
    }

    [XmlIgnore]
    public XElement oldToNewXml; //OldToNew

    [XmlIgnore]
    public LMGroupSound GroupSound;
    [XmlIgnore]
    public LMGroupHideText GroupHideText;
    [XmlIgnore]
    public LMScormLib.Markers FileMarkers;
    [XmlIgnore]
    public int markIdx;
    public bool hasHiddenText() {
      return layout == sentenceStyle_Type.hiddenText || layout == sentenceStyle_Type.hiddentTextWithPronunciation || layout == sentenceStyle_Type.textWithHiddenPronunciation;
    }
    public override void AfterLoad() {
      base.AfterLoad();
      finishSentence();

      if (GroupSound == null)
        throw new Exception(string.Format("Missing sound_sentence .sound_group attribute ({0})", ErrorId));
      if (ignoreSound() == sound_dialogIgnore_sound.map) return;
      if (file == sound_sentencesFile.no)
        file = GroupSound.sound.SingleFile();
      if (file == sound_sentencesFile.no)
        throw new Exception(string.Format("Missing sound_sentence.file attribute ({0})", ErrorId));
      string fn = GroupSound.sound.files()[(int)file];
      FileMarkers = LMScormLib.MarkersLib.ReadFileMapUrl(fn, GroupSound.sound.ignoreSound() == sound_dialogIgnore_sound.no && !LMScormLib.CourseMan.Config.IgnoreWmaBmpFileExist);

      if (string.IsNullOrEmpty(sentence))
        throw new Exception(string.Format("Missing sound_sentence.sentence attribute ({0})", ErrorId));
      if (!int.TryParse(sentence, out markIdx))
        throw new Exception(string.Format("Sound_sentence.sentence attribute is not number ({0})", ErrorId));
      if (markIdx < 0 || markIdx >= FileMarkers.Count)
        throw new Exception(string.Format("Sound_sentence.sentence attribute not in 0..{0} interval ({1})", FileMarkers.Count - 1, ErrorId));

    }
    public sound_dialogIgnore_sound ignoreSound() {
      return GroupSound.sound.ignoreSound();
    }
    public string hideGroupId() {
      return HideTextMan.soundHideMarkIdStart + varName;
    }
    internal void finishSentence() {
      if (hasHiddenText()) {
        string hideGroup = hideGroupId();
        foreach (LMLiteral lit in LMScormObj.GetAll(this, delegate(object obj) { return obj is LMLiteral; }))
          lit.group_hide_text = hideGroup;
      }
    }
  }
  public partial class sound_sentences : LMScormObj {
    [XmlIgnore]
    public LMGroupSound GroupSound;
    [XmlIgnore]
    public LMGroupHideText GroupHideText;
    [XmlIgnore]
    public sound_sentence[] Items;
    public override IEnumerable<object> GetChilds() {
      if (Items != null)
        foreach (sound_sentence snt in Items)
          yield return snt;
    }
    public bool hasHiddenText() {
      return layout == sentenceStyle_Type.hiddenText || layout == sentenceStyle_Type.hiddentTextWithPronunciation || layout == sentenceStyle_Type.textWithHiddenPronunciation;
    }
    public override void AfterLoad() {
      base.AfterLoad();
      if (GroupSound == null)
        throw new Exception(string.Format("Missing sound_sentence .sound_group attribute ({0})", ErrorId));
      if (GroupSound.sound.ignoreSound() == sound_dialogIgnore_sound.map) {
        GroupSound.Remove(this);
        return;
      }
      if (file == sound_sentencesFile.no)
        file = GroupSound.sound.SingleFile();
      if (file == sound_sentencesFile.no)
        throw new Exception(string.Format("Missing sound_sentence.file attribute ({0})", ErrorId));
      string fn = GroupSound.sound.files()[(int)file];
      LMScormLib.Markers markers = LMScormLib.MarkersLib.ReadFileMapUrl(fn, GroupSound.sound.ignoreSound() == sound_dialogIgnore_sound.no && !LMScormLib.CourseMan.Config.IgnoreWmaBmpFileExist);
      if (markers == null) return;

      //analyza sentences parametru
      int begIdx, endIdx;
      if (string.IsNullOrEmpty(sentences))
        sentences = string.Format("0-{0}", markers.Count - 1);
      string[] parts = sentences.Split(new char[] { '-' }, StringSplitOptions.RemoveEmptyEntries);
      if (parts.Length <= 0 || parts.Length > 2)
        throw new Exception(string.Format("Wrong sound_sentences.sentences attribute format: <num> or <num>-<num> or <num>-* expected ({0})", ErrorId));
      if (!int.TryParse(parts[0], out begIdx))
        throw new Exception(string.Format("Wrong sound_sentences.sentences attribute format: <num> or <num>-<num> or <num>-* expected ({0})", ErrorId));
      endIdx = begIdx;
      if (parts.Length == 2) {
        if (!int.TryParse(parts[1], out endIdx)) {
          if (parts[1] != "*")
            throw new Exception(string.Format("Wrong sound_sentences.sentences attribute format: <num> or <num>-<num> or <num>-* expected ({0})", ErrorId));
          endIdx = markers.Count - 1;
        }
      }
      if (begIdx < 0 || begIdx > endIdx || begIdx >= markers.Count || endIdx >= markers.Count)
        throw new Exception(string.Format("Sound_sentences.sentences attributes not in 0..{0} interval ({1})", markers.Count - 1, ErrorId));

      //rozmnozeni na sound_sentence
      List<sound_sentence> sents = new List<sound_sentence>();
      for (int i = begIdx; i <= endIdx; i++) {
        sound_sentence sent = new sound_sentence();
        sent.Owner = this;
        sent.UniqueId = Root.getUniqueId();
        sent.GroupSound = GroupSound;
        sent.GroupHideText = GroupHideText;
        sent.FileMarkers = markers;
        sent.layout = layout;
        sent.markIdx = i;
        sents.Add(sent);
      }
      //zarazeni sentence's do object tree
      Items = sents.ToArray();
      //zarazeni sentence's do sound grupy
      int grpIdx = GroupSound.IndexOf(this);
      GroupSound[grpIdx] = sents[0];
      for (int i = 1; i < sents.Count; i++)
        GroupSound.Insert(grpIdx + i, sents[i]);
      //zarazeni sentence's do hide text grupy
      if (GroupHideText != null) {
        grpIdx = GroupHideText.IndexOf(this);
        GroupHideText[grpIdx] = sents[0];
        for (int i = 1; i < sents.Count; i++)
          GroupHideText.Insert(grpIdx + i, sents[i]);
      }
      for (int i = 0; i < sents.Count; i++)
        sents[i].finishSentence();
    }
  }

  public partial class sound_mark : LMScormObj {
    [XmlIgnore]
    public LMGroupSound GroupSound;
    [XmlIgnore]
    public XElement oldToNewXml;
  }

}
