using System;
using System.IO;
using Saluse.MediaKit.Decoder;
using Saluse.MediaKit.Bridge;

namespace Saluse.MediaKit.Decoder
{
	internal class CircularByteBuffer
	{
		private byte[] _dataArray = null;
		private int _length = 1;
		private int _index = 0;
		private int _numberValid = 0;

		public CircularByteBuffer(int size)
		{
			_dataArray = new byte[size];
			_length = size;
		}

		/// <summary>
		/// Initialize by copying the CircularByteBuffer passed in
		/// </summary>
		public CircularByteBuffer(CircularByteBuffer _circularByteBuffer)
		{
			lock (_circularByteBuffer)
			{
				_length = _circularByteBuffer._length;
				_numberValid = _circularByteBuffer._numberValid;
				_index = _circularByteBuffer._index;
				_dataArray = new byte[_length];
				for (int c = 0; c < _length; c++)
				{
					_dataArray[c] = _circularByteBuffer._dataArray[c];
				}
			}
		}

		public CircularByteBuffer Copy()
		{
			return new CircularByteBuffer(this);
		}

		/// <summary>
		/// The physical size of the Buffer (read/write)
		/// </summary>
		public int BufferSize
		{
			get
			{
				return _length;
			}
			set
			{
				byte[] newDataArray = new byte[value];

				int minLength = (_length > value) ? value : _length;
				for (int i = 0; i < minLength; i++)
				{
					newDataArray[i] = InternalGet(i - _length + 1);
				}
				_dataArray = newDataArray;
				_index = minLength - 1;
				_length = value;
			}
		}

		public void Reset()
		{
			_index = 0;
			_numberValid = 0;
		}

		/// <summary>
		/// Push a byte into the buffer.  Returns the value of whatever comes off.
		/// </summary>
		public byte Push(byte newValue)
		{
			byte ret;
			lock (this)
			{
				ret = InternalGet(_length);
				_dataArray[_index] = newValue;
				_numberValid++; if (_numberValid > _length) _numberValid = _length;
				_index++;
				_index %= _length;
			}
			return ret;
		}

		/// <summary>
		/// Pop an integer off the start of the buffer. Throws an exception if the buffer is empty (NumValid == 0)
		/// </summary>
		public byte Pop()
		{
			lock (this)
			{
				if (_numberValid == 0) throw new Exception("Can't pop off an empty CircularByteBuffer");
				_numberValid--;
				return this[_numberValid];
			}
		}

		/// <summary>
		/// Returns what would fall out of the buffer on a Push.  NOT the same as what you'd get with a Pop().
		/// </summary>
		public byte Peek()
		{
			lock (this)
			{
				return InternalGet(_length);
			}
		}

		/// <summary>
		/// e.g. Offset[0] is the current value
		/// </summary>
		public byte this[int index]
		{
			get
			{
				return InternalGet(-1 - index);
			}
			set
			{
				InternalSet(-1 - index, value);
			}
		}

		private byte InternalGet(int offset)
		{
			int ind = _index + offset;

			// Do thin modulo (should just drop through)
			for (; ind >= _length; ind -= _length) ;
			for (; ind < 0; ind += _length) ;
			// Set value
			return _dataArray[ind];
		}

		private void InternalSet(int offset, byte valueToSet)
		{
			int ind = _index + offset;

			// Do thin modulo (should just drop through)
			for (; ind > _length; ind -= _length) ;
			for (; ind < 0; ind += _length) ;
			// Set value
			_dataArray[ind] = valueToSet;
		}


		/// <summary>
		/// How far back it is safe to look (read/write).  Write only to reduce NumValid.
		/// </summary>
		public int NumberValid
		{
			get
			{
				return _numberValid;
			}
			set
			{
				if (value > _numberValid) throw new Exception("Can't set NumValid to " + value + " which is greater than the current numValid value of " + _numberValid);
				_numberValid = value;
			}
		}

		/// <summary>
		/// Returns a range (in terms of Offsets) in an int array in chronological (oldest-to-newest) order. e.g. (3, 0) returns the last four ints pushed, with result[3] being the most recent.
		/// </summary>
		public byte[] GetRange(int str, int stp)
		{
			byte[] outByte = new byte[str - stp + 1];

			for (int i = str, j = 0; i >= stp; i--, j++)
			{
				outByte[j] = this[i];
			}

			return outByte;
		}

		public override String ToString()
		{
			String ret = "";
			for (int i = 0; i < _dataArray.Length; i++)
			{
				ret += _dataArray[i] + " ";
			}
			ret += "\n index = " + _index + " numValid = " + NumberValid;
			return ret;
		}
	}
}