/* 
* 12/12/99  Initial Version based on FileObuffer.	mdm@techie.com.
* 
* FileObuffer:
* 15/02/99 ,Java Conversion by E.B ,ebsp@iname.com, JavaLayer
*
*----------------------------------------------------------------------------- 
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
*----------------------------------------------------------------------------
*/

using System;

namespace Saluse.MediaKit.Decoder
{
	/// <summary>
	/// The <code>SampleBuffer</code> class implements an output buffer
	/// that provides storage for a fixed size block of samples. 
	/// </summary>
	internal class FixBlockOutputBuffer : OutputBuffer
	{
		private short[] _buffer;
		private int[] _bufferp;
		private int _channels;
		private int _frequency;

		virtual public int ChannelCount
		{
			get
			{
				return this._channels;
			}
		}

		virtual public int SampleFrequency
		{
			get
			{
				return this._frequency;
			}
		}

		virtual public short[] Buffer
		{
			get
			{
				return this._buffer;
			}
		}

		virtual public int BufferLength
		{
			get
			{
				return _bufferp[0];
			}
		}
		
		/// <summary> Constructor
		/// </summary>
		public FixBlockOutputBuffer(int sampleFrequency, int numberOfChannels)
		{
			_buffer = new short[OBUFFERSIZE];
			_bufferp = new int[MAXCHANNELS];
			_channels = numberOfChannels;
			_frequency = sampleFrequency;

			for (int i = 0; i < numberOfChannels; ++i)
			{
				_bufferp[i] = (short)i;
			}
		}
		
		/// <summary> Takes a 16 Bit PCM sample.
		/// </summary>
		public override void Append(int channel, short valueRenamed)
		{
			_buffer[_bufferp[channel]] = valueRenamed;
			_bufferp[channel] += _channels;
		}
		
		public override void AppendSamples(int channel, float[] samples)
		{
			int pos = _bufferp[channel];
			
			short s;
			float fs;
			for (int i = 0; i < 32; )
			{
				fs = samples[i++];
				fs = (fs > 32767.0f?32767.0f:(fs < - 32767.0f?- 32767.0f:fs));
				
				//UPGRADE_WARNING: Narrowing conversions may produce unexpected results in C#. 'ms-help://MS.VSCC.2003/commoner/redir/redirect.htm?keyword="jlca1042"'
				s = (short) fs;
				_buffer[pos] = s;
				pos += _channels;
			}
			
			_bufferp[channel] = pos;
		}
		
		
		/// <summary> Write the samples to the file (Random Acces).
		/// </summary>
		public override void  WriteBuffer(int val)
		{
			//for (int i = 0; i < channels; ++i) 
			//	bufferp[i] = (short)i;
		}
		
		public override void  Close()
		{
		}
		
		/// <summary>*
		/// </summary>
		public override void  ClearBuffer()
		{
			for (int i = 0; i < _channels; ++i)
			{
				_bufferp[i] = (short)i;
			}
		}
		
		/// <summary>*
		/// </summary>
		public override void  SetStopFlag()
		{
			// Intentional:
		}
	}
}