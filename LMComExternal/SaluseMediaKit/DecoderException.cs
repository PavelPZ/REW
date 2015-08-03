using System;
using Saluse.MediaKit.Enumerations;

namespace Saluse.MediaKit.Exceptions
{
	/// <summary>
	/// The <code>DecoderException</code> represents the class of
	/// errors that can occur when decoding MPEG audio. 
	/// </summary>
	/// <author>
	/// MDM
	/// </author>
	internal class DecoderException : MediaKitException
	{
		public DecoderException(int errorCode, System.Exception exception)
			: base(string.Format("Decoder Error: {0}", errorCode), errorCode, exception)
		{
		}
	}
}
