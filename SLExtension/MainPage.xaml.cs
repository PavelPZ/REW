using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using System.Windows.Browser;

namespace SLExtension {
  public partial class MainPage : UserControl {
    public MainPage() {
      InitializeComponent();
    }

    private void alowBtn_Click(object sender, RoutedEventArgs e) {
      LMMedia.Recorder.AdjustMicrophone();
      //SLPlayer.HTML5Like.Instance.trace("alowBtn_Click");
      //SLPlayer.Player.Instance.alowMicrophone(SLPlayer.Player.Instance.hideButton(LMMedia.Recorder.MicrophoneOK()));
      //SLPlayer.HTML5Like.Instance.callOnAlowMicrophone(SLPlayer.HTML5Like.Instance.microphoneButtonVisible());
    }

    private void alowBtn_MouseMove(object sender, MouseEventArgs e) {
      alowBtn.Cursor = Cursors.Hand;
    }

  }
}
