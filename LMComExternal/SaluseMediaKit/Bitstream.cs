/*
* 12/12/99	 Based on Ibitstream. Exceptions thrown on errors,
*			 Tempoarily removed seek functionality. mdm@techie.com
*
* 02/12/99 : Java Conversion by E.B , ebsp@iname.com , JavaLayer
*
*----------------------------------------------------------------------
*  @(#) ibitstream.h 1.5, last edit: 6/15/94 16:55:34
*  @(#) Copyright (C) 1993, 1994 Tobias Bading (bading@cs.tu-berlin.de)
*  @(#) Berlin University of Technology
*
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
*
*  Changes made by Jeff Tsay :
*  04/14/97 : Added function prototypes for new syncing and seeking
*  mechanisms. Also made this file portable.
*-----------------------------------------------------------------------
*/
using System;
using Saluse.MediaKit.Exceptions;
using Saluse.MediaKit.Enumerations;
using Saluse.MediaKit.Common;
using Saluse.MediaKit.Bridge;
//using System.Diagnostics;
using Saluse.MediaKit.Models;

namespace Saluse.MediaKit.Decoder
{
	/// <summary> The <code>Bistream</code> class is responsible for parsing
	/// an MPEG audio bitstream.
	/// *
	/// <b>REVIEW:</b> much of the parsing currently occurs in the
	/// various decoders. This should be moved into this class and associated
	/// inner classes.
	/// </summary>
	internal sealed class Bitstream
	{
		/// <summary> Syncrhronization control constant for the initial
		/// synchronization to the start of a frame.
		/// </summary>
		internal static sbyte INITIALSYNC = 0;

		/// <summary> Syncrhronization control constant for non-iniital frame
		/// synchronizations.
		/// </summary>
		internal static sbyte STRICTSYNC = 1;

		// max. 1730 bytes per frame: 144 * 384kbit/query / 32000 Hz + 2 Bytes CRC
		/// <summary> Maximum size of the frame buffer.
		/// </summary>
		private const int _BUFFERINTSIZE = 433;

		/// <summary> The frame buffer that holds the data for the current frame.
		/// </summary>
		private int[] _frameBuffer = new int[_BUFFERINTSIZE];

		/// <summary> Number of valid bytes in the frame buffer.
		/// </summary>
		private int _frameSize;

		/// <summary> The bytes read from the stream.
		/// </summary>
		private sbyte[] _frameBytes = new sbyte[_BUFFERINTSIZE * 4];

		/// <summary> Index into <code>framebuffer</code> where the next bits are
		/// retrieved.
		/// </summary>
		private int _wordPointer;

		/// <summary> Number (0-31, from MSB to LSB) of next bit for get_bits()
		/// </summary>
		private int _bitIndex;

		/// <summary> The current specified syncword
		/// </summary>
		private int _syncWord;

		/// <summary>*
		/// </summary>
		private bool _singleChannelMode;
		//private int 			current_frame_number;
		//private int				last_frame_number;

		private int[] _bitMask = new int[] { 0, 0x00000001, 0x00000003, 0x00000007, 0x0000000F, 0x0000001F, 0x0000003F, 0x0000007F, 0x000000FF, 0x000001FF, 0x000003FF, 0x000007FF, 0x00000FFF, 0x00001FFF, 0x00003FFF, 0x00007FFF, 0x0000FFFF, 0x0001FFFF };

		private BackStream _sourceStream;

		private Header _header = new Header();

		private sbyte[] _syncBuffer = new sbyte[4];

		private CRC16[] _crc = new CRC16[1];

		//private ByteArrayOutputStream	_baos = null; // E.B
		
		/// <summary> Construct a IBitstream that reads data from a
		/// given InputStream.
		/// *
		/// </summary>
		/// <param name="in	The">InputStream to read from.
		/// 
		/// </param>
		internal Bitstream(BackStream inputStream)
		{
			if (inputStream == null)
			{
				throw new System.NullReferenceException("inputStream");
			}
			_sourceStream = inputStream;

			//_baos = new ByteArrayOutputStream(); // E.B

			CloseFrame();
			//current_frame_number = -1;
			//last_frame_number = -1;
		}

		public void Close()
		{
			try
			{
				_sourceStream.Close();
				//_baos = null;
			}
			catch (System.IO.IOException ex)
			{
				throw new BitstreamException(BitstreamErrors.STREAM_ERROR, ex);
			}
		}

		/// <summary> Reads and parses the next frame from the input source.
		/// </summary>
		/// <returns> the Header describing details of the frame read,
		/// or null if the end of the stream has been reached.
		/// 
		/// </returns>
		internal Header ReadFrame()
		{
			Header header = null;
			try
			{
				header = ReadNextFrame();
			}
			catch (BitstreamException ex)
			{
				if (ex.ErrorCode != BitstreamErrors.STREAM_EOF)
				{
					// wrap original exception so stack trace is maintained.
					throw CreateBitstreamException(ex.ErrorCode, ex);
				}
			}
			return header;
		}

		private Header ReadNextFrame()
		{
			if (_frameSize == -1)
			{
				NextFrame();
			}

			return _header;
		}

		/// <summary>*
		/// </summary>
		private void NextFrame()
		{
			// entire frame is read by the header class.
			_header.ReadHeader(this, _crc);
		}

		/// <summary> Unreads the bytes read from the frame.
		/// @throws BitstreamException
		/// </summary>
		// REVIEW: add new error codes for this.
		public void UnreadFrame()
		{
			if (_wordPointer == -1 && _bitIndex == -1 && (_frameSize > 0))
			{
				try
				{
					//source.UnRead(SupportClass.ToByteArray(frame_bytes), 0, framesize);
					_sourceStream.UnRead(_frameSize);
				}
				catch (System.IO.IOException)
				{
					throw CreateBitstreamException(BitstreamErrors.STREAM_ERROR);
				}
			}
		}

		public void CloseFrame()
		{
			_frameSize = -1;
			_wordPointer = -1;
			_bitIndex = -1;
		}

		/// <summary> Determines if the next 4 bytes of the stream represent a
		/// frame header.
		/// </summary>
		public bool IsSyncCurrentPosition(int syncMode)
		{
			bool isInSync = false;
			int readCount = ReadBytes(_syncBuffer, 0, 4);
			int headerString = 
				((_syncBuffer[0] << 24) & (int)Utilities.Identity(0xFF000000)) | ((_syncBuffer[1] << 16) & 0x00FF0000) | ((_syncBuffer[2] << 8) & 0x0000FF00) | ((_syncBuffer[3] << 0) & 0x000000FF);

			try
			{
				//source.UnRead(SupportClass.ToByteArray(syncbuf), 0, read);
				_sourceStream.UnRead(readCount);
			}
			catch (System.IO.IOException)
			{
			}

			switch (readCount)
			{
				case 0:
					Trace.WriteLine("0 bytes read == sync?", "Bitstream");
					isInSync = true;
					break;

				case 4:
					isInSync = isSyncMark(headerString, syncMode, _syncWord);
					break;
			}

			return isInSync;
		}


		// REVIEW: this class should provide inner classes to
		// parse the frame contents. Eventually, readBits will
		// be removed.
		public int ReadBits(int numberOfBits)
		{
			return GetBits(numberOfBits);
		}

		public int ReadCheckedBits(int numberOfBits)
		{
			// REVIEW: implement CRC check.
			return GetBits(numberOfBits);
		}

		public BitstreamException CreateBitstreamException(int errorcode)
		{
			return new BitstreamException(errorcode, null);
		}

		public BitstreamException CreateBitstreamException(int errorcode, System.Exception throwable)
		{
			return new BitstreamException(errorcode, throwable);
		}

		/// <summary> Get next 32 bits from bitstream.
		/// They are stored in the headerstring.
		/// syncmod allows Synchro flag ID
		/// The returned value is False at the end of stream.
		/// </summary>

		internal int SyncHeader(sbyte syncMode)
		{
			bool isInSync = false;
			int headerString = 0;

			// read additional 2 bytes
			int bytesRead = ReadBytes(_syncBuffer, 0, 3);
			if (bytesRead != 3)
			{
				throw CreateBitstreamException(BitstreamErrors.STREAM_EOF, null);
			}

			headerString = ((_syncBuffer[0] << 16) & 0x00FF0000) | ((_syncBuffer[1] << 8) & 0x0000FF00) | ((_syncBuffer[2] << 0) & 0x000000FF);
			while (!isInSync)
			{
				headerString <<= 8;

				if (ReadBytes(_syncBuffer, 3, 1) != 1)
				{
					throw CreateBitstreamException(BitstreamErrors.STREAM_EOF, null);
				}

				headerString |= (_syncBuffer[3] & 0x000000FF);
				isInSync = isSyncMark(headerString, syncMode, _syncWord);
			}

			return headerString;
		}

		/// <summary>
		/// 	Note: parameter 'word' is not used (code commented out)
		/// </summary>
		/// <param name="headerString"></param>
		/// <param name="syncMode"></param>
		/// <param name="word"></param>
		/// <returns></returns>
		public bool isSyncMark(int headerString, int syncMode, int word)
		{
			bool isInSync = false;

			if (syncMode == INITIALSYNC)
			{
				//sync =  ((headerstring & 0xFFF00000) == 0xFFF00000);
				isInSync = ((headerString & 0xFFE00000) == 0xFFE00000); // SZD: MPEG 2.5
			}
			else
			{
				//sync = ((headerstring & 0xFFF80C00) == word) 
				isInSync = ((headerString & 0xFFE00000) == 0xFFE00000) // ROB -- THIS IS PROBABLY WRONG. A WEAKER CHECK.
					&& (((headerString & 0x000000C0) == 0x000000C0) == _singleChannelMode);
			}

			//TODO: Remove Trace writes
			// filter out invalid sample rate
			if (isInSync)
			{
				isInSync = (((Utilities.URShift(headerString, 10)) & 3) != 3);
				if (!isInSync)
				{
					Trace.WriteLine("INVALID SAMPLE RATE DETECTED", "Bitstream");
				}
			}
			// filter out invalid layer
			if (isInSync)
			{
				isInSync = (((Utilities.URShift(headerString, 17)) & 3) != 0);
				if (!isInSync)
				{
					Trace.WriteLine("INVALID LAYER DETECTED", "Bitstream");
				}
			}
			// filter out invalid version
			if (isInSync)
			{
				isInSync = (((Utilities.URShift(headerString, 19)) & 3) != 1);
				if (!isInSync)
				{
					Trace.WriteLine("INVALID VERSION DETECTED", "");
				}
			}

			return isInSync;
		}

		/// <summary> Reads the data for the next frame. The frame is not parsed
		/// until parse frame is called.
		/// </summary>
		internal void ReadFrameData(int byteSize)
		{
			ReadFully(_frameBytes, 0, byteSize);
			_frameSize = byteSize;
			_wordPointer = -1;
			_bitIndex = -1;
		}

		/// <summary>
		/// 	This is normally called only once during the first Header read
		/// </summary>
		/// <returns>VBRHeader possibly populated</returns>
		internal VBRHeader ParseVBRHeader()
		{
			VBRHeader vbrHeader = new VBRHeader();

			// Index 32 is the start of the 'Xing' ID and 44 is the last position of interest
			if (_frameBytes.Length > 43)
			{
				// TODO: Cater for different VBR offsets
				int vbrHeaderOffset = 32;
				if (_frameBytes[vbrHeaderOffset] == 'X')
				{
					if (_frameBytes[vbrHeaderOffset + 1] == 'i')
					{
						if (_frameBytes[vbrHeaderOffset + 2] == 'n')
						{
							vbrHeader.MediaIsVBR = (_frameBytes[vbrHeaderOffset + 3] == 'g');
						}
					}
				}
				if (vbrHeader.MediaIsVBR)
				{
					// TODO: Check if the Total Frames fields is available before attempting to read data
					// Convert BigEndian to LittleEndian
					sbyte[] bigEndian = new sbyte[4];
					Array.Copy(_frameBytes, (vbrHeaderOffset + 8), bigEndian, 0, 4);
					Array.Reverse(bigEndian);
					vbrHeader.TotalFramesInMedia = System.BitConverter.ToInt32((byte[])(Array)bigEndian, 0);
				}
			}

			return vbrHeader;
		}

		/// <summary> Parses the data previously read with read_frame_data().
		/// </summary>
		internal void ParseFrame()
		{
			// Convert Bytes read to int
			int b = 0;
			sbyte[] byteRead = _frameBytes;
			int byteSize = _frameSize;

			for (int k = 0; k < byteSize; k = k + 4)
			{
				sbyte b0 = 0;
				sbyte b1 = 0;
				sbyte b2 = 0;
				sbyte b3 = 0;
				b0 = byteRead[k];
				if (k + 1 < byteSize)
				{
					b1 = byteRead[k + 1];
				}
				if (k + 2 < byteSize)
				{
					b2 = byteRead[k + 2];
				}
				if (k + 3 < byteSize)
				{
					b3 = byteRead[k + 3];
				}

				_frameBuffer[b++] = ((b0 << 24) & (int)Utilities.Identity(0xFF000000)) | ((b1 << 16) & 0x00FF0000) | ((b2 << 8) & 0x0000FF00) | (b3 & 0x000000FF);
			}

			_wordPointer = 0;
			_bitIndex = 0;
		}

		/// <summary> Read bits from buffer into the lower bits of an unsigned int.
		/// The LSB contains the latest read bit of the stream.
		/// (1 <= number_of_bits <= 16)
		/// </summary>
		public int GetBits(int numberOfBits)
		{

			int returnValue = 0;
			int sum = _bitIndex + numberOfBits;

			// E.B
			// There is a problem here, wordpointer could be -1 ?!
			if (_wordPointer < 0)
			{
				_wordPointer = 0;
			}
			// E.B : End.

			if (sum <= 32)
			{
				// all bits contained in *wordpointer
				returnValue = (Utilities.URShift(_frameBuffer[_wordPointer], (32 - sum))) & _bitMask[numberOfBits];
				// returnvalue = (wordpointer[0] >> (32 - sum)) & bitmask[number_of_bits];
				if ((_bitIndex += numberOfBits) == 32)
				{
					_bitIndex = 0;
					_wordPointer++; // added by me!
				}
				return returnValue;
			}

			// Magouille a Voir
			//((short[])&returnvalue)[0] = ((short[])wordpointer + 1)[0];
			//wordpointer++; // Added by me!
			//((short[])&returnvalue + 1)[0] = ((short[])wordpointer)[0];
			int right = (_frameBuffer[_wordPointer] & 0x0000FFFF);
			_wordPointer++;
			int left = (_frameBuffer[_wordPointer] & (int)Utilities.Identity(0xFFFF0000));
			returnValue = ((right << 16) & (int)Utilities.Identity(0xFFFF0000)) | ((Utilities.URShift(left, 16)) & 0x0000FFFF);

			returnValue = Utilities.URShift(returnValue, 48 - sum); // returnvalue >>= 16 - (number_of_bits - (32 - bitindex))
			returnValue &= _bitMask[numberOfBits];
			_bitIndex = sum - 32;
			return returnValue;
		}

		/// <summary> Set the word we want to sync the header to.
		/// In Big-Endian byte order
		/// </summary>
		internal void SetSyncword(int syncWord)
		{
			_syncWord = syncWord & unchecked((int)0xFFFFFF3F);
			_singleChannelMode = ((syncWord & 0x000000C0) == 0x000000C0);
		}
		/// <summary> Reads the exact number of bytes from the source
		/// input stream into a byte array.
		/// *
		/// </summary>
		/// <param name="b		The">byte array to read the specified number
		/// of bytes into.
		/// </param>
		/// <param name="offs	The">index in the array where the first byte
		/// read should be stored.
		/// </param>
		/// <param name="len	the">number of bytes to read.
		/// *
		/// </param>
		/// <exception cref=""> BitstreamException is thrown if the specified
		/// number of bytes could not be read from the stream.
		/// 
		/// </exception>
		private void ReadFully(sbyte[] buffer, int offset, int length)
		{
			try
			{
				while (length > 0)
				{
					int bytesread = _sourceStream.Read(buffer, offset, length);
					if (bytesread == -1 || bytesread == 0) // t/DD -- .NET returns 0 at end-of-stream!
					{
						while ((length--) > 0)
						{
							buffer[offset++] = 0;
						}
						break;
						//throw newBitstreamException(UNEXPECTED_EOF, new EOFException());
					}

					offset += bytesread;
					length -= bytesread;
				}
			}
			catch (System.IO.IOException ex)
			{
				throw CreateBitstreamException(BitstreamErrors.STREAM_ERROR, ex);
			}
		}

		/// <summary> Simlar to readFully, but doesn't throw exception when
		/// EOF is reached.
		/// </summary>
		private int ReadBytes(sbyte[] buffer, int offset, int length)
		{
			int totalBytesRead = 0;
			try
			{
				while (length > 0)
				{
					int bytesread = _sourceStream.Read(buffer, offset, length);
					//					for (int i = 0; i < len; i++) b[i] = (sbyte)Temp[i];
					if (bytesread == -1 || bytesread == 0)
					{
						break;
					}
					totalBytesRead += bytesread;
					offset += bytesread;
					length -= bytesread;
				}
			}
			catch (System.IO.IOException ex)
			{
				throw CreateBitstreamException(BitstreamErrors.STREAM_ERROR, ex);
			}
			return totalBytesRead;
		}

		/// <summary> Returns ID3v2 tags.
		/// </summary>
		/*public ByteArrayOutputStream getID3v2()
		{
		return _baos;
		}*/
	}
}
