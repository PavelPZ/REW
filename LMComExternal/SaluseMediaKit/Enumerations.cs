using System;

namespace Saluse.MediaKit.Enumerations
{
	internal struct LayerErrors
	{
		public readonly static int BITSTREAM_ERROR = 0x100;
		public readonly static int DECODER_ERROR = 0x200;
	}

	internal struct BitstreamErrors
	{
		public readonly static int UNKNOWN_ERROR;
		public readonly static int UNKNOWN_SAMPLE_RATE;
		public readonly static int STREAM_ERROR;
		public readonly static int UNEXPECTED_EOF;
		public readonly static int STREAM_EOF;
		public readonly static int BITSTREAM_LAST = 0x1ff;
		static BitstreamErrors()
		{
			UNKNOWN_ERROR = LayerErrors.BITSTREAM_ERROR + 0;
			UNKNOWN_SAMPLE_RATE = LayerErrors.BITSTREAM_ERROR + 1;
			STREAM_ERROR = LayerErrors.BITSTREAM_ERROR + 2;
			UNEXPECTED_EOF = LayerErrors.BITSTREAM_ERROR + 3;
			STREAM_EOF = LayerErrors.BITSTREAM_ERROR + 4;
		}
	}

	internal struct DecoderErrors
	{
		public readonly static int UNKNOWN_ERROR;
		public readonly static int UNSUPPORTED_LAYER;

		static DecoderErrors()
		{
			UNKNOWN_ERROR = LayerErrors.DECODER_ERROR + 0;
			UNSUPPORTED_LAYER = LayerErrors.DECODER_ERROR + 1;
		}
	}

	internal enum OutputChannelTypeEnumeration
	{
		BothChannels = 0,
		LeftChannel = 1,
		RightChannel = 2,
		DownMixChannels = 3
	}

	/// <summary>
	/// Describes sound formats that can be produced by the Mp3Stream class.
	/// </summary>
	public enum SoundFormat
	{
		/// <summary>
		/// PCM encoded, 16-bit Mono sound format.
		/// </summary>
		PCM16BitMono,
		/// <summary>
		/// PCM encoded, 16-bit Stereo sound format.
		/// </summary>
		PCM16BitStereo,
	}

	/// <summary>
	/// 	Support for different audio formats
	/// </summary>
	public enum AudioTypeEnumeration
	{
		Unknown,
		MP3,
		PCM
	}
}
