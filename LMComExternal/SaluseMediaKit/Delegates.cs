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

namespace Saluse.MediaKit.Delegates
{
	public delegate void SampleReadyDelegate(object sender, Int16[] samples);
	public delegate void DownloadProgressChangedDelegate(object sender, double downloadProgress);

	/// <summary>
	/// 	You can alter the raw audio data before it is passed onto a consumer (MediaElement).
	///  	Please remember to keep your code in this delegate as fast as possible otherwise
	///  	the audio will stutter as it tries to provide data to the consumer.
	///  <remarks>
	///  	Do not use direct references to an RawMediaStreamSource instance as the
	///  	RawMediaStreamSource instance will have a reference to your delegate which
	///  	creates a circular reference.
	///  </remarks>
	/// </summary>
	/// <param name="rawSamples">
	///		The format is 4 bytes per sample.
	/// 	The first 2 bytes is for the left channel, the next two are for the right channel.
	/// 	The 2 bytes represent a 16bit (Int16) sample
	/// </param>
	public delegate void AudioPreProcessorDelegate(byte[] rawSamples);
}
