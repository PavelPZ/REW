/*
* 02/12/99 : Java Conversion by E.B , ebsp@iname.com, JavaLayer
*
*-----------------------------------------------------------------------
*  @(#) crc.h 1.5, last edit: 6/15/94 16:55:32
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
*-----------------------------------------------------------------------
*/

using System;
using Saluse.MediaKit.Common;

namespace Saluse.MediaKit.Decoder
{
	/// <summary> 16-Bit CRC checksum
	/// </summary>
	internal sealed class CRC16
	{
		private static short polynomial = (short)Utilities.Identity(0x8005);
		private short _crc = (short)Utilities.Identity(0xFFFF);
		
		/// <summary> Feed a bitstring to the crc calculation (0 < length <= 32).
		/// </summary>
		public void AddBits(int bitString, int length)
		{
			int bitmask = 1 << (length - 1);
			do
			{
				if (((_crc & 0x8000) == 0) ^ ((bitString & bitmask) == 0))
				{
					_crc <<= 1;
					_crc ^= polynomial;
				}
				else
				{
					_crc <<= 1;
				}
			}
			while ((bitmask = Utilities.URShift(bitmask, 1)) != 0);
		}
		
		/// <summary> Return the calculated checksum.
		/// Erase it for next calls to add_bits().
		/// </summary>
		public short GetChecksum()
		{
			short sum = _crc;
			_crc = (short) Utilities.Identity(0xFFFF);
			return sum;
		}
	}
}