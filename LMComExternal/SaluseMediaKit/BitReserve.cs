/*
* 12/12/99 0.0.7	Implementation stores single bits 
*					as ints for better performance. mdm@techie.com.
*
* Java Conversion by E.B, ebsp@iname.com, JavaLayer
*
*---------------------------------------------------
* bit_res.h
*
* 	Declarations for Bit Reservoir for Layer III
*
*  Adapted from the public c code by Jeff Tsay.
*---------------------------------------------------
*/

using System;

namespace Saluse.MediaKit.Decoder
{
	/// <summary> Implementation of Bit Reservoir for Layer III.
	/// <p>
	/// The implementation stores single bits as a word in the buffer. If
	/// a bit is set, the corresponding word in the buffer will be non-zero.
	/// If a bit is clear, the corresponding word is zero. Although this
	/// may seem waseful, this can be a factor of two quicker than 
	/// packing 8 bits to a byte and extracting. 
	/// <p> 
	/// </summary>
	
	// REVIEW: there is no range checking, so buffer underflow or overflow
	// can silently occur.
	internal sealed class BitReserve
	{
		/// <summary> Size of the internal buffer to store the reserved bits.
		/// Must be a power of 2. And x8, as each bit is stored as a single
		/// entry.
		/// </summary>
		private const int _BUFFERSIZE = 4096 * 8;
		private int[] _buffer = new int[_BUFFERSIZE];
		private int _offset = 0;
		private int _totBit = 0;
		private int _bufferByteIndex = 0;
		
		/// <summary> Mask that can be used to quickly implement the
		/// modulus operation on BUFSIZE.
		/// </summary>
		private static readonly int _BUFFERSIZEMASK = _BUFFERSIZE - 1;
		
		/// <summary> Return totbit Field.
		/// </summary>
		public int GetTotBit()
		{
			return (_totBit);
		}
		
		/// <summary>
		/// Read a number bits from the bit stream.
		/// </summary>
		/// <param name="N">
		/// the number of bits to return
		/// </param>
		public int GetNBits(int N)
		{
			_totBit += N;
			
			int val = 0;
			
			int pos = _bufferByteIndex;
			if (pos + N < _BUFFERSIZE)
			{
				while (N-- > 0)
				{
					val <<= 1;
					val |= ((_buffer[pos++] != 0)?1:0);
				}
			}
			else
			{
				while (N-- > 0)
				{
					val <<= 1;
					val |= ((_buffer[pos] != 0)?1:0);
					pos = (pos + 1) & _BUFFERSIZEMASK;
				}
			}
			_bufferByteIndex = pos;
			return val;
		}
		
		
		
		/// <summary> Read 1 bit from the bit stream.
		/// </summary>
		/*
		public int hget1bit_old()
		{
		int val;
		totbit++;
		if (buf_bit_idx == 0)
		{
		buf_bit_idx = 8;
		buf_byte_idx++;		 
		}
		// BUFSIZE = 4096 = 2^12, so
		// buf_byte_idx%BUFSIZE == buf_byte_idx & 0xfff
		val = buf[buf_byte_idx & BUFSIZE_MASK] & putmask[buf_bit_idx];
		buf_bit_idx--;
		val = val >>> buf_bit_idx;
		return val;   
		}
		*/
		/// <summary>
		/// Returns next bit from reserve.
		/// </summary>
		/// <returns>
		/// 0 if next bit is reset, or 1 if next bit is set.
		/// </returns>
		public int GetNextBit()
		{
			_totBit++;
			int val = _buffer[_bufferByteIndex];
			_bufferByteIndex = (_bufferByteIndex + 1) & _BUFFERSIZEMASK;
			return val;
		}
		
		/// <summary> Retrieves bits from the reserve.     
		/// </summary>
		/*   
		public int readBits(int[] out, int len)
		{
		if (buf_bit_idx == 0)
		{
		buf_bit_idx = 8;
		buf_byte_idx++;
		current = buf[buf_byte_idx & BUFSIZE_MASK];
		}      
		
		
		
		// save total number of bits returned
		len = buf_bit_idx;
		buf_bit_idx = 0;
		
		int b = current;
		int count = len-1;
		
		while (count >= 0)
		{
		out[count--] = (b & 0x1);
		b >>>= 1;
		}
		
		totbit += len;
		return len;
		}
		*/
		
		/// <summary> Write 8 bits into the bit stream.
		/// </summary>
		public void PutByte(int val)
		{
			int ofs = _offset;
			_buffer[ofs++] = val & 0x80;
			_buffer[ofs++] = val & 0x40;
			_buffer[ofs++] = val & 0x20;
			_buffer[ofs++] = val & 0x10;
			_buffer[ofs++] = val & 0x08;
			_buffer[ofs++] = val & 0x04;
			_buffer[ofs++] = val & 0x02;
			_buffer[ofs++] = val & 0x01;
			
			if (ofs == _BUFFERSIZE)
				_offset = 0;
			else
				_offset = ofs;
		}
		
		/// <summary> Rewind N bits in Stream.
		/// </summary>
		public void RewindNBits(int N)
		{
			_totBit -= N;
			_bufferByteIndex -= N;
			if (_bufferByteIndex < 0)
			{
				_bufferByteIndex += _BUFFERSIZE;
			}
		}
		
		/// <summary> Rewind N bytes in Stream.
		/// </summary>
		public void RewindNBytes(int N)
		{
			int bits = (N << 3);
			_totBit -= bits;
			_bufferByteIndex -= bits;
			if (_bufferByteIndex < 0)
			{
				_bufferByteIndex += _BUFFERSIZE;
			}
		}
	}
}