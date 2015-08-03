using System;
using Saluse.MediaKit.Enumerations;

namespace Saluse.MediaKit.Exceptions
{
	internal class MediaKitException : Exception
	{
		private int _errorCode = 0;

		public MediaKitException(string message, int errorCode, Exception exception) : base(message, exception)
		{
			_errorCode = errorCode;
		}

		public int ErrorCode
		{
			get
			{
				return _errorCode;
			}
		}
	}
}
