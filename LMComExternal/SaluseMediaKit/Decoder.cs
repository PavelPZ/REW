/*
* 1/12/99		Initial version.	mdm@techie.com
/*-----------------------------------------------------------------------
*  This program is free software; you can redistribute it and/or modify
*  it under the terms of the GNU General Public License as published by
*  the Free Software Foundation; either version 2 of the License, or
*  (at your option) any later version.
*
*  This program is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU General Public License for more details.
*
*  You should have received a copy of the GNU General Public License
*  along with this program; if not, write to the Free Software
*  Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
*----------------------------------------------------------------------
*/

using System;
using Saluse.MediaKit.Enumerations;
using Saluse.MediaKit.Exceptions;

namespace Saluse.MediaKit.Decoder
{
	/// <summary> The <code>Decoder</code> class encapsulates the details of
	/// decoding an MPEG audio frame. 
	/// 
	/// </summary>
	/// <author> 	MDM	
	/// </author>
	/// <version>  0.0.7 12/12/99
	/// @since	0.0.5
	/// 
	/// </version>
	
	internal class MP3Decoder
	{
		private static readonly Params DEFAULT_PARAMS = new Params();

		/// <summary> The Obuffer instance that will receive the decoded
		/// PCM samples.
		/// </summary>
		private OutputBuffer _outputBuffer;

		/// <summary>
		/// Synthesis filter for the left channel.
		/// </summary>
		private SynthesisFilter _synthesisLeftFilter;

		/// <summary>
		/// Sythesis filter for the right channel.
		/// </summary>
		private SynthesisFilter _synthesisRightFilter;

		/// <summary> The decoder used to decode layer III frames.
		/// </summary>
		private LayerIIIDecoder _layer3Decoder;
		//private LayerIIDecoder l2decoder;
		//private LayerIDecoder l1decoder;

		private int _outputFrequency;
		private int _outputChannels;
		private Equalizer _equalizer = new Equalizer();
		private Params _paramsRenamed;
		private bool _isInitialized;

		/// <summary>
		/// Creates a new <code>Decoder</code> instance with default 
		/// parameters.
		/// </summary>
		public MP3Decoder() : this(null)
		{
		}

		/// <summary>
		/// Creates a new <code>Decoder</code> instance with default 
		/// parameters.
		/// </summary>
		/// <param name="params	The"><code>Params</code> instance that describes
		/// the customizable aspects of the decoder.  
		/// </param>
		public MP3Decoder(Params params0)
		{
			if (params0 == null)
			{
				params0 = DEFAULT_PARAMS;
			}

			_paramsRenamed = params0;
		}

		static public Params DefaultParams
		{
			get
			{
				return (Params) DEFAULT_PARAMS.Clone();  // MemberwiseClone();
			}
		}

		virtual public Equalizer Equalizer
		{
			set
			{
				if (value == null)
				{
					value = Equalizer.PASSTHROUGHEQ;
				}
				
				_equalizer.FromEqualizer = value;
				
				float[] factors = _equalizer.BandFactors;
				if (_synthesisLeftFilter != null)
				{
					_synthesisLeftFilter.EQ = factors;
				}

				if (_synthesisRightFilter != null)
				{
					_synthesisRightFilter.EQ = factors;
				}
			}
		}

		/// <summary> Changes the output buffer. This will take effect the next time
		/// decodeFrame() is called. 
		/// </summary>
		virtual public OutputBuffer OutputBuffer
		{
			set
			{
				_outputBuffer = value;
			}
		}

		/// <summary> Retrieves the sample frequency of the PCM samples output
		/// by this decoder. This typically corresponds to the sample
		/// rate encoded in the MPEG audio stream.
		/// </summary>
		/// <param name="the">sample rate (in Hz) of the samples written to the
		/// output buffer when decoding. 
		/// </param>
		virtual public int OutputFrequency
		{
			get
			{
				return _outputFrequency;
			}
		}

		/// <summary> Retrieves the number of channels of PCM samples output by
		/// this decoder. This usually corresponds to the number of
		/// channels in the MPEG audio stream, although it may differ.
		/// </summary>
		/// <returns> The number of output channels in the decoded samples: 1 
		/// for mono, or 2 for stereo.
		/// </returns>
		virtual public int OutputChannels
		{
			get
			{
				return _outputChannels;
			}
		}

		/// <summary> Retrieves the maximum number of samples that will be written to
		/// the output buffer when one frame is decoded. This can be used to
		/// help calculate the size of other buffers whose size is based upon 
		/// the number of samples written to the output buffer. NB: this is
		/// an upper bound and fewer samples may actually be written, depending
		/// upon the sample rate and number of channels.
		/// </summary>
		/// <returns> The maximum number of samples that are written to the 
		/// output buffer when decoding a single frame of MPEG audio.
		/// </returns>
		virtual public int OutputBlockSize
		{
			get
			{
				return Saluse.MediaKit.Decoder.OutputBuffer.OBUFFERSIZE;
			}
		}
		
		/// <summary>
		/// Decodes one frame from an MPEG audio bitstream.
		/// </summary>
		/// <param name="header">
		/// The header describing the frame to decode.
		/// </param>
		/// <param name="bitstream">
		/// The bitstream that provides the bits for te body of the frame. 
		/// </param>
		/// <returns>
		/// A SampleBuffer containing the decoded samples.
		/// </returns>
		public virtual OutputBuffer DecodeFrame(Header header, Bitstream stream)
		{
			if (!_isInitialized)
			{
				Initialize(header);
			}
			
			int layer = header.LayerID;
			_outputBuffer.ClearBuffer();
			
			FrameDecoder decoder = RetrieveDecoder(header, stream, layer);
			decoder.DecodeFrame();
			_outputBuffer.WriteBuffer(1);
			
			return _outputBuffer;
		}
		
		public virtual DecoderException CreateDecoderException(int errorcode)
		{
			return new DecoderException(errorcode, null);
		}
		
		public virtual DecoderException CreateDecoderException(int errorcode, System.Exception throwable)
		{
			return new DecoderException(errorcode, throwable);
		}
		
		public virtual FrameDecoder RetrieveDecoder(Header header, Bitstream stream, int layer)
		{
			FrameDecoder decoder = null;
			
			// REVIEW: allow channel output selection type
			// (LEFT, RIGHT, BOTH, DOWNMIX)
			switch (layer)
			{
				
				case 3: 
					if (_layer3Decoder == null)
					{
						_layer3Decoder = new LayerIIIDecoder(stream, header, _synthesisLeftFilter, _synthesisRightFilter, _outputBuffer, (int)OutputChannelTypeEnumeration.BothChannels);
					}
					
					decoder = _layer3Decoder;
					break;
				// Ahura Mazda|2009-11-26: Only Layer3 MP3 files are supported for the time being.
				/*
				case 2: 
					if (l2decoder == null)
					{
						l2decoder = new LayerIIDecoder();
						l2decoder.create(stream, header, filter1, filter2, output, (int)OutputChannelsEnum.BOTH_CHANNELS);
					}
					decoder = l2decoder;
					break;
				
				case 1: 
					if (l1decoder == null)
					{
						l1decoder = new LayerIDecoder();
						l1decoder.create(stream, header, filter1, filter2, output, (int)OutputChannelsEnum.BOTH_CHANNELS);
					}
					decoder = l1decoder;
					break;
				*/
				}
			
			if (decoder == null)
			{
				throw CreateDecoderException(DecoderErrors.UNSUPPORTED_LAYER, null);
			}
			
			return decoder;
		}
		
		private void Initialize(Header header)
		{
			
			// REVIEW: allow customizable scale factor
			float scalefactor = 32700.0f;
			
			int mode = header.Mode;
			int layer = header.LayerID;
			int channels = mode == Header.SINGLE_CHANNEL?1:2;
			
			// set up output buffer if not set up by client.
			if (_outputBuffer == null)
			{
				_outputBuffer = new FixBlockOutputBuffer(header.Frequency, channels);
			}
			
			float[] factors = _equalizer.BandFactors;
			_synthesisLeftFilter = new SynthesisFilter(0, scalefactor, factors);
			
			// REVIEW: allow mono output for stereo
			if (channels == 2)
			{
				_synthesisRightFilter = new SynthesisFilter(1, scalefactor, factors);
			}
			
			_outputChannels = channels;
			_outputFrequency = header.Frequency;
			
			_isInitialized = true;
		}
		
		/// <summary> The <code>Params</code> class presents the customizable
		/// aspects of the decoder. 
		/// <p>
		/// Instances of this class are not thread safe. 
		/// </summary>
		internal class Params
		{
			private OutputChannels outputChannels = OutputChannels.BOTH;
			private Equalizer equalizer = new Equalizer();

			virtual public OutputChannels OutputChannels
			{
				get
				{
					return outputChannels;
				}
				set
				{
					if (value == null)
					{
						throw new System.NullReferenceException("out");
					}
					outputChannels = value;
				}
			}

			/// <summary> Retrieves the equalizer settings that the decoder'query equalizer
			/// will be initialized from.
			/// <p>
			/// The <code>Equalizer</code> instance returned 
			/// cannot be changed in real time to affect the 
			/// decoder output as it is used only to initialize the decoders
			/// EQ settings. To affect the decoder'query output in realtime,
			/// use the Equalizer returned from the getEqualizer() method on
			/// the decoder. 
			/// 
			/// </summary>
			/// <returns>	The <code>Equalizer</code> used to initialize the
			/// EQ settings of the decoder. 
			/// 
			/// </returns>
			virtual public Equalizer InitialEqualizerSettings
			{
				get
				{
					return equalizer;
				}
			}
			
			public System.Object Clone()
			{
				return base.MemberwiseClone();
			}
		}
	}
}