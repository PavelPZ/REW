using System;
using System.IO;
using Saluse.MediaKit.Decoder;
using Saluse.MediaKit.Bridge;

namespace Saluse.MediaKit.Decoder
{
	internal class BackStream 
	{
		private Stream _stream;
		private int _backBufferSize;
		private int NumForwardBytesInBuffer = 0;
		private byte[] _temporaryBuffer;
		private CircularByteBuffer _circularByteBuffer;

		public BackStream(Stream stream, int backBufferSize) 
		{
			_stream = stream;
			_backBufferSize = backBufferSize;
			_temporaryBuffer = new byte[_backBufferSize];
			_circularByteBuffer = new CircularByteBuffer(_backBufferSize);
		}

		public int Read(sbyte[]toRead, int offset, int length)
		{
			// Read 
			int currentByte = 0;
			bool canReadStream = true;
			while (currentByte < length && canReadStream)
			{
				if (NumForwardBytesInBuffer > 0)
				{ // from mem
					NumForwardBytesInBuffer--;
					toRead[offset+currentByte] = (sbyte)_circularByteBuffer[NumForwardBytesInBuffer];
					currentByte++;
				}
				else
				{ // from stream
					int newBytes = length - currentByte;
					int numRead = _stream.Read(_temporaryBuffer, 0, newBytes);
					canReadStream = numRead >= newBytes;
					for (int i = 0; i < numRead; i++) 
					{
						_circularByteBuffer.Push(_temporaryBuffer[i]);
						toRead[offset+currentByte+i] = (sbyte)_temporaryBuffer[i];
					}
					currentByte += numRead;
				}
			}
			return currentByte;
		}

		public void UnRead(int length)
		{
			NumForwardBytesInBuffer += length;
			if (NumForwardBytesInBuffer > _backBufferSize)
			{
				//TODO: Implement a course of action
			}
		}

		public void Close() 
		{
			_stream.Close();
		}
	}
}
