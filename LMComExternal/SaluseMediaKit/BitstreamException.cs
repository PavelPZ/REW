using System;
using Saluse.MediaKit.Enumerations;

namespace Saluse.MediaKit.Exceptions
{
	/// <summary> Instances of <code>BitstreamException</code> are thrown 
	/// when operations on a <code>Bitstream</code> fail. 
	/// <p>
	/// The exception provides details of the exception condition 
	/// in two ways:
	/// <ol><li>
	/// as an error-code describing the nature of the error
	/// </li><br></br><li>
	/// as the <code>Throwable</code> instance, if any, that was thrown
	/// indicating that an exceptional condition has occurred. 
	/// </li></ol></p>
	/// 
	/// @since 0.0.6
	/// </summary>
	/// <author>
	/// MDM	12/12/99
	/// </author>

	internal class BitstreamException : MediaKitException
	{
		#region public constructors

		public BitstreamException(int errorCode, System.Exception exception)
			: base(string.Format("Bitstream Error: {0}", errorCode), errorCode, exception)
		{
		}

		#endregion
	}
}
