/*
* 02/13/99 : Java Conversion by E.B , ebsp@iname.com
*
*---------------------------------------------------------------------------
* Declarations for MPEG header class
* A few layer III, MPEG-2 LSF, and seeking modifications made by Jeff Tsay.
* Last modified : 04/19/97
*
*  @(#) header.h 1.7, last edit: 6/15/94 16:55:33
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
*--------------------------------------------------------------------------
*/

using System;
using Saluse.MediaKit.Bridge;
using Saluse.MediaKit.Common;
using Saluse.MediaKit.Enumerations;
using Saluse.MediaKit.Models;

namespace Saluse.MediaKit.Decoder
{
	/// <summary> Class for extracting information from a frame header.
	/// *
	/// *
	/// </summary>
	// TODO: move strings into resources
	//LM public
	public class Header
	{
		/// <summary> Constant for MPEG-2 LSF version
		/// </summary>
		public const int MPEG2LSF = 0;
		public const int MPEG25LSF = 2; // SZD

		/// <summary> Constant for MPEG-1 version
		/// </summary>
		public const int MPEG1 = 1;

		public const int STEREO = 0;
		public const int JOINT_STEREO = 1;
		public const int DUAL_CHANNEL = 2;
		public const int SINGLE_CHANNEL = 3;
		public const int FOURTYFOUR_POINT_ONE = 0;
		public const int FOURTYEIGHT = 1;
		public const int THIRTYTWO = 2;

		private static readonly int[][][] _bitrateMatrix = 
		{
			new int[][]
			{
			 new int[]{0, 32000, 48000, 56000, 64000, 80000, 96000, 112000, 128000, 144000, 160000, 176000, 192000, 224000, 256000, 0},
			 new int[]{0, 8000, 16000, 24000, 32000, 40000, 48000, 56000, 64000, 80000, 96000, 112000, 128000, 144000, 160000, 0},
			 new int[]{0, 8000, 16000, 24000, 32000, 40000, 48000, 56000, 64000, 80000, 96000, 112000, 128000, 144000, 160000, 0}
			},
			new int[][]
			{
				new int[]{0, 32000, 64000, 96000, 128000, 160000, 192000, 224000, 256000, 288000, 320000, 352000, 384000, 416000, 448000, 0},
				new int[]{0, 32000, 48000, 56000, 64000, 80000, 96000, 112000, 128000, 160000, 192000, 224000, 256000, 320000, 384000, 0},
				new int[]{0, 32000, 40000, 48000, 56000, 64000, 80000, 96000, 112000, 128000, 160000, 192000, 224000, 256000, 320000, 0}
			},
			new int[][]
			{
				new int[]{0, 32000, 48000, 56000, 64000, 80000, 96000, 112000, 128000, 144000, 160000, 176000, 192000, 224000, 256000, 0},
				new int[]{0, 8000, 16000, 24000, 32000, 40000, 48000, 56000, 64000, 80000, 96000, 112000, 128000, 144000, 160000, 0},
				new int[]{0, 8000, 16000, 24000, 32000, 40000, 48000, 56000, 64000, 80000, 96000, 112000, 128000, 144000, 160000, 0}}
		};

		private static readonly int[][] _frequencyMatrix =
			{ new int[] { 22050, 24000, 16000, 1 }, new int[] { 44100, 48000, 32000, 1 }, new int[] { 11025, 12000, 8000, 1 } }; // SZD: MPEG25

		private float[][] _millisecondsPerFrameMatrix =
			{new float[] { 8.707483f, 8.0f, 12.0f }, new float[] { 26.12245f, 24.0f, 36.0f }, new float[] { 26.12245f, 24.0f, 36.0f }};

		private int _layerID;
		private int _protectionBit;
		private int _bitrateIndex;
		private int _paddingBit;
		private int _modeExtension;
		private int _version;
		private int _mode;
		private int _sampleFrequency;
		private int _numberOfSubBands;
		private int _intensityStereoBound;
		private bool _isCopyrighted;
		private bool _isOriginal;
		private sbyte _syncMode = Bitstream.INITIALSYNC;
		private CRC16 _crc;
		private short _checksum;
		private int _frameSize;
		private int _slotCount;
		private int _headerString = -1;
		private VBRHeader _vbrHeader = new VBRHeader();

		/// <summary> Returns synchronized header.
		/// </summary>
		public virtual int SyncHeader
		{
			get
			{
				return _headerString;
			}
		}
		
		/// <summary> Read a 32-bit header from the bitstream.
		/// </summary>
		internal void ReadHeader(Bitstream bitstream, CRC16[] crcArray)
		{
			int headerString = 0;
			int channelBitrate;
			bool isInSync = false;
			sbyte syncMode = _syncMode;

			while (!isInSync)
			{
				headerString = bitstream.SyncHeader(_syncMode);
				_headerString = headerString; // E.B
				
				// Only determine the version once on first read
				if (_syncMode == Bitstream.INITIALSYNC)
				{
					_version = ((Utilities.URShift(headerString, 19)) & 1);
					if (((Utilities.URShift(headerString, 20)) & 1) == 0)
					{
						// SZD: MPEG2.5 detection
						if (_version == MPEG2LSF)
						{
							_version = MPEG25LSF;
						}
						else
						{
							throw bitstream.CreateBitstreamException(BitstreamErrors.UNKNOWN_ERROR);
						}
					}
					
					if ((_sampleFrequency = ((Utilities.URShift(headerString, 10)) & 3)) == 3)
					{
						throw bitstream.CreateBitstreamException(BitstreamErrors.UNKNOWN_ERROR);
					}
				}
				
				_layerID = 4 - (Utilities.URShift(headerString, 17)) & 3;
				_protectionBit = (Utilities.URShift(headerString, 16)) & 1;
				_bitrateIndex = (Utilities.URShift(headerString, 12)) & 0xF;
				_paddingBit = (Utilities.URShift(headerString, 9)) & 1;
				_mode = ((Utilities.URShift(headerString, 6)) & 3);
				_modeExtension = (Utilities.URShift(headerString, 4)) & 3;
				if (_mode == JOINT_STEREO)
				{
					_intensityStereoBound = (_modeExtension << 2) + 4;
				}
				else
				{
					_intensityStereoBound = 0;
				}

				if (((Utilities.URShift(headerString, 3)) & 1) == 1)
				{
					_isCopyrighted = true;
				}

				if (((Utilities.URShift(headerString, 2)) & 1) == 1)
				{
					_isOriginal = true;
				}
				
				// calculate number of subbands:
				if (_layerID == 1)
				{
					_numberOfSubBands = 32;
				}
				else
				{
					channelBitrate = _bitrateIndex;
					// calculate bitrate per channel:
					if (_mode != SINGLE_CHANNEL)
					{
						if (channelBitrate == 4)
						{
							channelBitrate = 1;
						}
						else
						{
							channelBitrate -= 4;
						}
					}

					if ((channelBitrate == 1) || (channelBitrate == 2))
					{
						if (_sampleFrequency == THIRTYTWO)
						{
							_numberOfSubBands = 12;
						}
						else
						{
							_numberOfSubBands = 8;
						}
					}
					else if ((_sampleFrequency == FOURTYEIGHT) || ((channelBitrate >= 3) && (channelBitrate <= 5)))
					{
						_numberOfSubBands = 27;
					}
					else
					{
						_numberOfSubBands = 30;
					}
				}

				if (_intensityStereoBound > _numberOfSubBands)
				{
					_intensityStereoBound = _numberOfSubBands;
				}

				// calculate framesize and nSlots
				CalculateFrameSize();
				
				// read framedata:
				bitstream.ReadFrameData(_frameSize);
				syncMode = _syncMode;
				
				if (bitstream.IsSyncCurrentPosition(_syncMode))
				{
					if (_syncMode == Bitstream.INITIALSYNC)
					{
						_syncMode = Bitstream.STRICTSYNC;
						bitstream.SetSyncword(headerString & unchecked((int)0xFFF80CC0));
					}
					isInSync = true;
				}
				else
				{
					bitstream.UnreadFrame();
				}
			} // while

			if (syncMode == Bitstream.INITIALSYNC)
			{
				_vbrHeader = bitstream.ParseVBRHeader();
			}

			bitstream.ParseFrame();

			if (_protectionBit == 0)
			{
				// frame contains a crc checksum
				_checksum = (short)bitstream.GetBits(16);
				if (_crc == null)
				{
					_crc = new CRC16();
				}
				_crc.AddBits(headerString, 16);
				crcArray[0] = _crc;
			}
			else
			{
				crcArray[0] = null;
			}
		}

		public VBRHeader VBRHeader
		{
			get
			{
				return _vbrHeader;
			}
		}
		
		// Functions to query header contents:
		/// <summary> Returns version.
		/// </summary>
		public int Version
		{
			get
			{
				return _version;
			}
		}
		
		/// <summary> Returns Layer ID.
		/// </summary>
		public int LayerID
		{
			get
			{
				return _layerID;
			}
		}

		public int FrameSize
		{
			get
			{
				return _frameSize;
			}
		}

		public int Bitrate
		{
			get
			{
				return _bitrateMatrix[_version][_layerID - 1][_bitrateIndex];
			}
		}
		
		/// <summary> Returns Sample Frequency.
		/// </summary>
		public int SampleFrequency
		{
			get
			{
				return _sampleFrequency;
			}
		}
		
		/// <summary> Returns Frequency.
		/// </summary>
		public int Frequency
		{
			get
			{
				return _frequencyMatrix[_version][_sampleFrequency];
			}
		}
		
		/// <summary> Returns Mode.
		/// </summary>
		public int Mode
		{
			get
			{
				return _mode;
			}
		}
		
		/// <summary> Returns Protection bit.
		/// </summary>
		public bool MediaIsProtected
		{
			get
			{
				return (_protectionBit == 0);
			}
		}
		
		/// <summary> Returns Copyright.
		/// </summary>
		public bool MediaIsCopyrighted
		{
			get
			{
				return _isCopyrighted;
			}
		}
		
		/// <summary> Returns Original.
		/// </summary>
		public bool MediaIsOriginal
		{
			get
			{
				return _isOriginal;
			}
		}
		
		/// <summary> Returns Checksum flag.
		/// Compares computed checksum with stream checksum.
		/// </summary>
		public bool IsChecksumValid()
		{
			return (_checksum == _crc.GetChecksum());
		}
		
		// Seeking and layer III stuff
		/// <summary> Returns Layer III Padding bit.
		/// </summary>
		public bool PaddingIsSet
		{
			get
			{
				return (_paddingBit != 0);
			}
		}
		
		/// <summary> Returns number of Slots.
		/// </summary>
		public int SlotCount
		{
			get
			{
				return _slotCount;
			}
		}
		
		/// <summary> Returns Mode Extension.
		/// </summary>
		public int ModeExtension
		{
			get
			{
				return _modeExtension;
			}
		}
		
		// E.B -> private to public
		/// <summary> Calculate Frame size.
		/// Calculates framesize in bytes excluding header size.
		/// </summary>
		public int CalculateFrameSize()
		{
			if (_layerID == 1)
			{
				_frameSize = (12 * _bitrateMatrix[_version][0][_bitrateIndex]) / _frequencyMatrix[_version][_sampleFrequency];
				if (_paddingBit != 0)
				{
					_frameSize++;
				}
				_frameSize <<= 2; // one slot is 4 bytes long
				_slotCount = 0;
			}
			else
			{
				_frameSize = (144 * _bitrateMatrix[_version][_layerID - 1][_bitrateIndex]) / _frequencyMatrix[_version][_sampleFrequency];
				if (_version == MPEG2LSF || _version == MPEG25LSF)
				{
					_frameSize >>= 1;
				}
				// SZD
				if (_paddingBit != 0)
				{
					_frameSize++;
				}
				// Layer III slots
				if (_layerID == 3)
				{
					if (_version == MPEG1)
					{
						_slotCount = _frameSize - ((_mode == SINGLE_CHANNEL)?17:32) - ((_protectionBit != 0)?0:2) - 4; // header size
					}
					else
					{
						// MPEG-2 LSF, SZD: MPEG-2.5 LSF
						_slotCount = _frameSize - ((_mode == SINGLE_CHANNEL)?9:17) - ((_protectionBit != 0)?0:2) - 4; // header size
					}
				}
				else
				{
					_slotCount = 0;
				}
			}
			_frameSize -= 4; // subtract header size
			return _frameSize;
		}
		
		/// <summary> Returns the maximum number of frames in the stream.
		/// </summary>
		public int GetMaximumNumberOfFrames(int streamLength)
		{
			int maximumNumberOfFrames = 0;
			// VBR MP3 files supposedly places the total frame count in the VBR header and is a
			// better indication of the duration of the MP3 file.
			// The other method to calculate the frame count is to count all frames up front which
			// is not ideal for streaming media
			if (_vbrHeader.MediaIsVBR)
			{
				maximumNumberOfFrames = _vbrHeader.TotalFramesInMedia;
			}
			else
			{
				if ((_frameSize + 4 - _paddingBit) == 0)
				{
					maximumNumberOfFrames = 0;
				}
				else
				{
					maximumNumberOfFrames = (streamLength / (_frameSize + 4 - _paddingBit));
				}
			}

			return maximumNumberOfFrames;
		}
		
		/// <summary> Returns the maximum number of frames in the stream.
		/// </summary>
		public int GetMinimumNumberOfFrames(int streamsize)
		{
			if ((_frameSize + 5 - _paddingBit) == 0)
			{
				return 0;
			}
			else
			{
				return (streamsize / (_frameSize + 5 - _paddingBit));
			}
		}
		
		/// <summary> Returns ms/frame.
		/// </summary>
		public float GetMillisecondsPerFrame()
		{
			return (_millisecondsPerFrameMatrix[_layerID - 1][_sampleFrequency]);
		}
		
		/// <summary> Returns total ms.
		/// </summary>
		public float GetTotalMilliseconds(int streamLength)
		{
			int maximumFrameCount = GetMaximumNumberOfFrames(streamLength);
			return (maximumFrameCount * GetMillisecondsPerFrame());
		}

		/// <summary>
		/// TODO: This code is temporary until a definite mp3 position calculation can be written
		/// </summary>
		/// <param name="streamLength"></param>
		/// <param name="frameSize"></param>
		/// <param name="millisecondsPerFrame"></param>
		/// <returns></returns>
		public float GetTotalMilliseconds(int streamLength, int frameSize, double millisecondsPerFrame)
		{
			int maximumFrameCount = 0;
			//int maximumFrameCount = GetMaximumNumberOfFrames(streamLength);

			if (_vbrHeader.MediaIsVBR)
			{
				maximumFrameCount = _vbrHeader.TotalFramesInMedia;
			}
			else
			{
				maximumFrameCount = (streamLength / (frameSize + 4 - _paddingBit));
			}

			return (maximumFrameCount * (float)millisecondsPerFrame);
		}

	}
}