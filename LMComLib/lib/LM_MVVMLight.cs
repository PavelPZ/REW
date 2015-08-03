using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using GalaSoft.MvvmLight.Helpers;
using GalaSoft.MvvmLight;
using System.ComponentModel;
using System.Collections;
using GalaSoft.MvvmLight.Command;
//using System.Windows.Controls;

namespace LMComLib {
  public static class LMMessenger {

    public class LMAction { }

    public class LMAction<T> : LMAction {
      public LMAction(Action<T> act) { _action = act; }
      private readonly Action<T> _action;
      public void Execute(T parameter) { if (_action == null) return; _action(parameter); }
    }

    public class DlgMessage<TInit, TResult> {
      public TInit InitPar;
      public LMEventHandler<TResult> Completed;
    }

    public static void Register<TMsg>(object recipient, Guid token, Action<TMsg> action) {
      List<WeakAction> list;
      if (!dict.TryGetValue(token, out list)) dict.Add(token, list = new List<WeakAction>());
      list.Add(new WeakAction<TMsg>(recipient, action));
    }

    public static void RegisterDlg<TInit, TResult>(Guid token, Action<DlgMessage<TInit, TResult>> showDlg) {
      LMAction showAct;
      if (!dialogs.ContainsKey(token)) dialogs.Add(token, showAct = new LMAction<DlgMessage<TInit, TResult>>(showDlg));
    }

    public static void ShowDlg<TInit, TResult>(Guid token, DlgMessage<TInit, TResult> initMsg) {
      LMAction showAct;
      if (!dialogs.TryGetValue(token, out showAct)) return;
      ((LMAction<DlgMessage<TInit, TResult>>)showAct).Execute(initMsg);
    }

    public static void Broadcast<TMsg>(TMsg msg, Guid token) {
      List<WeakAction> list;
      if (!dict.TryGetValue(token, out list)) return;
      foreach (WeakAction<TMsg> act in list.Take(list.Count).ToList()) act.Execute(msg);
    }

    public static void Unregister(object recipient, Guid token) {
      List<WeakAction> list;
      if (!dict.TryGetValue(token, out list)) return;
      WeakAction wa = list.FirstOrDefault(w => w.Target == recipient);
      if (wa != null) list.Remove(wa);
    }

    static Dictionary<Guid, List<WeakAction>> dict = new Dictionary<Guid, List<WeakAction>>();
    static Dictionary<Guid, LMAction> dialogs = new Dictionary<Guid, LMAction>();

  }

  public partial class LMViewModelBase : ViewModelBase {
    protected void RaisePropertyChanged<T>(string propertyName, T newValue, Guid token) {
      RaisePropertyChanged(propertyName);
      LMMessenger.Broadcast<T>(newValue, token);
    }
    protected void SyncRaisePropertyChanged(string propertyName) {
      AsyncAppContext.ExecuteInMainThread(() => RaisePropertyChanged(propertyName));
    }

    /*public virtual void Activate() {
    }
    public virtual void Deactivate() { }*/

  }


}
