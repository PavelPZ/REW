using System;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;

namespace Saluse.MediaKit.Models
{
	/// <summary>
	/// 	Contains details related to MP3 files that are Variable Bitrate encoded
	/// </summary>
	public struct VBRHeader
	{
		public bool MediaIsVBR;
		public int TotalFramesInMedia;
	}
}
