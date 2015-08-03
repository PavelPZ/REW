// $Id: MP3PCMStream.cs,v 1.1 2010/12/02 18:26:16 master Exp $
//
// Fri Jul 30 20:39:30 EDT 2004
// Rewrote the buffer object to hold one frame at a time for 
// efficiency. Commented out some functions rather than taking
// the time to port them. --t/DD

// Rob, Sept 1:
// - Changed access for all classes in this project except Mp3Sharp and the Exceptions to internal 
// - Removed commenting from DecodeFrame method of Mp3Stream
// - Added GPL license to Mp3Sharp.cs
// - Changed version number to 1.4

/*
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
using System.IO;
using Saluse.MediaKit.Decoder;
using Saluse.MediaKit.Enumerations;

namespace Saluse.MediaKit.IO
{
	/// <summary>
	/// Provides a view of the sequence of bytes that are produced during the conversion of an MP3 stream
	/// into a 16-bit PCM-encoded ("WAV" format) stream.
	/// </summary>
	public class MP3PCMStream : Stream
	{
		private Header _lastHeader = null;
		private MP3Decoder _mp3Decoder = new MP3Decoder(MP3Decoder.DefaultParams);
		private Bitstream _bitStream;
		private Stream _sourceStream;
		private int _bitrate = 0;
		private int _frameSize = 0;
		private int _frequency = -1;
		private short _channelCount = -1;
		private Custom16BitStereoOutputBuffer _outputBuffer;
		private SoundFormat _soundFormat = SoundFormat.PCM16BitStereo;

		/// <summary>
		/// Creates a new stream instance using the provided filename, and the default chunk size of 4096 bytes.
		/// </summary>
		public MP3PCMStream(string fileName) : this(new FileStream(fileName, FileMode.Open))
		{
		}

		/// <summary>
		/// Creates a new stream instance using the provided filename and chunk size.
		/// </summary>
		public MP3PCMStream(string fileName, int chunkSize) : this(new FileStream(fileName, FileMode.Open), chunkSize)
		{
		}

		/// <summary>
		/// Creates a new stream instance using the provided stream as a source, and the default chunk size of 4096 bytes.
		/// </summary>
		public MP3PCMStream(Stream sourceStream) : this(sourceStream, 4096)
		{
		}

		/// <summary>
		/// Creates a new stream instance using the provided stream as a source.
		///
		/// TODO: allow selecting stereo or mono in the constructor (note that
		///   this also requires "implementing" the stereo format).
		/// </summary>
		public MP3PCMStream(Stream sourceStream, int chunkSize)
		{
			_soundFormat = SoundFormat.PCM16BitStereo;
			_sourceStream = sourceStream;
			_bitStream = new Bitstream(new BackStream(_sourceStream, chunkSize));
			_outputBuffer = new Custom16BitStereoOutputBuffer();
			_mp3Decoder.OutputBuffer = _outputBuffer;
		}

		/// <summary>
		/// Reads a frame from the MP3 stream.  Returns whether the operation was successful.  If it wasn't, 
		/// the source stream is probably at its end.
		/// </summary>
		private bool ReadFrame()
		{
			OutputBuffer decoderOutput = null;
			// Read a frame from the bitstream.
			Header header = _bitStream.ReadFrame();
			if (header == null)
			{
				return false;
			}

			try
			{
				// Set the channel count and frequency values for the stream.
				if (header.Mode == Header.SINGLE_CHANNEL)
				{
					_channelCount = (short)1;
				}
				else
				{
					_channelCount = (short)2;
				}

				_lastHeader = header;
				_frequency = header.Frequency;
				_bitrate = header.Bitrate;
				_frameSize = _outputBuffer.BufferSize;

				// Decode the frame.
				try
				{
					decoderOutput = _mp3Decoder.DecodeFrame(header, _bitStream);
				}
				catch
				{
					// Added try..catch to return false, instead of default true
					// This forces the consumer to end playback gracefully instead of attempting to continue playing
					// TODO: Throw an error or return a more robust error object
					return false;
				}

				// Apparently, the way JavaZoom sets the output buffer 
				// on the decoder is a bit dodgy. Even though
				// this exception should never happen, we test to be sure.
				if (decoderOutput != _outputBuffer)
				{
					throw new System.Exception("Output buffers are different.");
				}
			}
			finally
			{
				// No resource leaks please!
				_bitStream.CloseFrame();
			}
			return true;
		}

		/// <summary>
		/// Decodes the requested number of frames from the MP3 stream 
		/// and caches their PCM-encoded bytes.  These can subsequently be obtained using the Read method.
		/// Returns the number of frames that were successfully decoded.
		/// </summary>
		public int DecodeFrames(int frameCount)
		{
			int framesDecoded = 0;
			bool frameWasRead = true;
			while (framesDecoded < frameCount && frameWasRead)
			{
				frameWasRead = ReadFrame();
				if (frameWasRead)
				{
					framesDecoded++;
				}
			}
			return framesDecoded;
		}

		public int ChunkSize
		{
			get
			{
				return 0; // Note: used to return field 'BackStreamByteCountRep' which was never assigned to.
			} 
		}

		public int FrameSize
		{
			get
			{
				return _frameSize;
			}
			set
			{
				_frameSize = value;
			}
		}

		public int BitRate
		{
			get
			{
				return _bitrate;
			}
			set
			{
				_bitrate = value;
			}
		}

		/// <summary>
		/// Gets the frequency of the audio being decoded.  
		/// Initially set to -1.  Initialized during the first call to either of the Read and DecodeFrames methods,
		/// and updated during every subsequent call to one of those methods to reflect the most recent header information
		/// from the MP3 stream.
		/// </summary>
		public int Frequency
		{
			get
			{
				return _frequency;
			}
		}

		/// <summary>
		/// Gets the number of channels available in the audio being decoded.
		/// Initially set to -1.  Initialized during the first call to either of the Read and DecodeFrames methods,
		/// and updated during every subsequent call to one of those methods to reflect the most recent header information
		/// from the MP3 stream.
		/// </summary>
		public short ChannelCount
		{
			get
			{
				return _channelCount;
			}
		}

		/// <summary>
		/// Gets or sets the PCM output format of this stream.
		/// </summary>
		public SoundFormat Format
		{
			get
			{
				return _soundFormat;
			}
			// Note: the buffers are stored in an optimized format--changing
			// the Format involves flushing the buffers and so on, so 
			// let'query just not, OK?
			// set { FormatRep = value; } 
		}

		public byte[] Buffer
		{
			get
			{
				return _outputBuffer.Buffer;
			}
		}

    //LM public
    public Header LastHeader
		{
			get
			{
				return _lastHeader;
			}
		}

		public override bool CanRead
		{
			get
			{
				return _sourceStream.CanRead;
			}
		}

		public override bool CanSeek
		{
			get
			{
				return _sourceStream.CanSeek;
			}
		}

		public override bool CanWrite
		{
			get
			{
				return _sourceStream.CanWrite;
			}
		}

		public override long Length
		{
			get
			{
				return _sourceStream.Length;
			}
		}

		/// <summary>
		/// Gets or sets the position of the source stream.  This is relative to the number of bytes in the MP3 file, rather than
		/// the total number of PCM bytes (typically signicantly greater) contained in the Mp3Stream'query output.
		/// </summary>
		public override long Position
		{
			get
			{
				return _sourceStream.Position;
			}
			set
			{
				_sourceStream.Position = value;
			}
		}

		public override void Flush()
		{
			_sourceStream.Flush();
		}

		/// <summary>
		/// Sets the position of the source stream.
		/// </summary>
		public override long Seek(long position, SeekOrigin origin)
		{
			return _sourceStream.Seek(position, origin);
		}

		/// <summary>
		/// This method is not valid for an Mp3Stream.
		/// </summary>
		public override void SetLength(long length)
		{
			throw new InvalidOperationException();
		}

		/// <summary>
		/// This method is not valid for an Mp3Stream.
		/// </summary>
		public override void Write(byte[] buffer, int offset, int count)
		{
			throw new InvalidOperationException();
		}
		
		/// <summary>
		/// Reads the MP3 stream as PCM-encoded bytes.  Decodes a portion of the stream if necessary.
		/// Returns the number of bytes read.
		/// </summary>
		public override int Read(byte[] buffer, int offset, int count)
		{
			// Copy from queue buffers, reading new ones as necessary,
			// until we can't read more or we have read "count" bytes
			int bytesRead = 0;
			while (true)
			{
				if (_outputBuffer.BytesLeft <= 0)
				{
					if (!ReadFrame()) // out of frames or end of stream?
					{
						break;
					}
				}

				// Copy as much as we can from the current buffer:
				bytesRead += _outputBuffer.Read(buffer, (offset + bytesRead), (count - bytesRead));

				if (bytesRead >= count)
				{
					break;
				}
			}
			return bytesRead;
		}
   
		/// <summary>
		/// Closes the source stream and releases any associated resources.
		/// If you don't call this, you may be leaking file descriptors.
		/// </summary>
		public override void Close()
		{
			_bitStream.Close(); // This should close SourceStream as well.
			// SourceStream.Close();
		}
	}
}