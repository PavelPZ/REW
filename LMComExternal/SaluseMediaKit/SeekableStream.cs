using System;
using System.IO;
using System.Threading;
using Saluse.MediaKit.Delegates;
using System.ComponentModel;
using System.Diagnostics;

namespace Saluse.MediaKit.IO
{
	public class SeekableStream : System.IO.MemoryStream
	{
		#region public events

		public event DownloadProgressChangedDelegate DownloadProgressChanged;

		#endregion

		#region private variables

		private Stream _sourceStream = null;
		private Thread _readAheadThread = null;

		// Used for synchronization between reading and writing of the internal buffer
		private AutoResetEvent _readAheadResetEvent = new AutoResetEvent(false);
		/*
		* _readAheadStreamResetEvent functionality disabled until solution to lock ups is found
		// User for the synchronization between reading and closing of the source stream
		private ManualResetEvent _readAheadStreamResetEvent = new ManualResetEvent(true);
		*/
		private byte[] _asyncStreamBuffer;
		private int _asyncStreamBufferSize = UInt16.MaxValue; // Default to 64K
		private long _currentWriteIndex = 0;
		private long _currentReadIndex = 0;
		private object _memoryBufferLock;
		private long _predeterminedLength = 0;
		private volatile bool _readAheadThreadMustStop = false;
		
		#endregion

		#region public constructors

		/// <summary>
		/// 	Create a base MemoryStream with an expandable buffer (empty constructor)
		/// </summary>
		/// <param name="stream">The stream to make appear seekable</param>
		/// <param name="predeterminedLength">This MediaNetworkStream needs the final size of the content</param>
		public SeekableStream(Stream sourceStream, long predeterminedLength) : base()
		{
			_sourceStream = sourceStream;
			_predeterminedLength = predeterminedLength;
			_memoryBufferLock = new object();
			_asyncStreamBuffer = new byte[_asyncStreamBufferSize];
			_readAheadThread = new Thread(new ParameterizedThreadStart(FillMemoryStreamFromSourceStream));
		}
		
		#endregion

		#region private methods

		/// <summary>
		/// Populates the internal memory stream with bytes from the source stream which can be of any type
		/// </summary>
		/// <param name="state">Required parameter to be compatible with ParameterizedThreadStart signature</param>
		private void FillMemoryStreamFromSourceStream(object state)
		{
			int contentReadTotal = 1;
			while (contentReadTotal > 0)
			{
				// Used for Thread control
				if (_readAheadThreadMustStop)
				{
					contentReadTotal = 0;
					break;
				}

				/*
				/* // TODO: ResetEvents seem to lock up. investigate further
				// This Reset Event is used to synchronize the reading of the source stream and the potential closing of it.
				// See Close()
				_readAheadStreamResetEvent.Reset();
				*/

				/*
				// The async BeginRead() is used because Read() hangs and the system
				// locks when the stream is waiting to close. See Close()
				IAsyncResult asyncResult = _sourceStream.BeginRead(_asyncStreamBuffer, 0, _asyncStreamBufferSize, null, null);
				// EndRead() will wait until the read is saveResponse
				contentReadTotal = _sourceStream.EndRead(asyncResult);
				*/

				try
				{
					contentReadTotal = _sourceStream.Read(_asyncStreamBuffer, 0, _asyncStreamBufferSize);
				}
				catch (ObjectDisposedException)
				{
					// ResetEvents and Locking seem to hang on the Read.
					// Since _sourceStream.Read() uses internal ResetEvents, there seems to be some conflict
					// The workaround is to catch ObjectDisposedException which is thrown when Close()
					// closes the _sourceStream whilst it is being asynchronously read.
					// _readAheadStreamResetEvent functionality is currently commented out until the proper
					// solution is found.
					contentReadTotal = 0;
					break;
				}

				/*
				/* // TODO: ResetEvents seem to lock up. investigate further
				// Signal the waiting thread in Close(), if it is waiting, to continue closing the source stream
				// _readAheadStreamResetEvent must always be left signaled (Set() must be called) because this function
				// may saveResponse before Close() is ever called and the wait in Close() will then wait indefinitely.
				_readAheadStreamResetEvent.Set();
				*/

				// Used for Thread control
				if (_readAheadThreadMustStop)
				{
					contentReadTotal = 0;
					break;
				}

				lock (_memoryBufferLock)
				{
					// Must seek to current Write index as the reading of the memory stream will
					// change the current position in said stream
					base.Seek(_currentWriteIndex, SeekOrigin.Begin);
					base.Write(_asyncStreamBuffer, 0, contentReadTotal);
				}

				_currentWriteIndex += contentReadTotal;
				_readAheadResetEvent.Set();

				if (DownloadProgressChanged != null)
				{
					DownloadProgressChanged(this, ((double)_currentWriteIndex / _predeterminedLength));
				}
			}
		}

		private int FillConsumerBuffer(byte[] buffer, int offset, int count)
		{
			bool readAheadBufferMustBeFilled = false;

			lock (_memoryBufferLock)
			{
				// If the Position was manually set to after the current Write index,
				// then set the read position to the Write index and signal that the read-ahead buffer
				// must be filled first before the read.
				// Only perform this check if the memory stream has not been fully populated
				if (_currentWriteIndex < _predeterminedLength)
				{
					if ((_currentReadIndex + count) > _currentWriteIndex)
					{
						_currentReadIndex = _currentWriteIndex;
						readAheadBufferMustBeFilled = true;
					}
				}
			}

			// Block thread here and wait for the other thread that is running FillMemoryStreamFromSourceStream()
			// to populate the read-ahead buffer with enough data for the following Read to continue successfully
			if (readAheadBufferMustBeFilled)
			{
				// Reset() has to be called because FillMemoryStreamFromSourceStream() is
				// continously calling _readAheadResetEvent.Set()
				_readAheadResetEvent.Reset();
				_readAheadResetEvent.WaitOne();
			}

			lock (_memoryBufferLock)
			{
				// Must seek to the current Read index as the writing to the same memory stream
				// will change the position in said stream
				base.Seek(_currentReadIndex, SeekOrigin.Begin);
				int bytesRead = base.Read(buffer, offset, count);

				_currentReadIndex += bytesRead;
				return bytesRead;
			}
		}

		#endregion

		#region public overridden methods

		/// <summary>
		///  Reads data from the internal memory stream
		/// </summary>
		/// <param name="buffer">The buffer to fill</param>
		/// <param name="offset">The offset of the buffer to start fill at</param>
		/// <param name="count">The amount of data requested to fill into the buffer</param>
		/// <returns>The actual amount of data actually filled into the buffer</returns>
		public override int Read(byte[] buffer, int offset, int count)
		{
			// If the internal memory has not been filled in, then start the Thread to populate it
			// Dependent on the fact that the internal memory stream is created with a zero sized buffer. This
			// signifies that the memory stream is dynamically expandable
			if (base.Capacity == 0)
			{
				_readAheadThread.Start();

				// Wait for the first chunk of data to fill the buffer
				_readAheadResetEvent.WaitOne();
			}

			return FillConsumerBuffer(buffer, offset, count);
		}

		public override long Seek(long offset, SeekOrigin loc)
		{
			lock (_memoryBufferLock)
			{
				_currentReadIndex = base.Seek(offset, loc);

				if (_currentReadIndex > _currentWriteIndex)
				{
					_currentReadIndex = _currentWriteIndex;
				}
			}

			return _currentReadIndex;
		}

		/// <summary>
		/// 	TODO: Check if this is consistent with the custom behaviour of this stream
		/// </summary>
		/// <returns></returns>
		public override int ReadByte()
		{
			return base.ReadByte();
		}

		public override void SetLength(long value)
		{
			// Intentional : length of internal memory buffer is controlled by the read-ahead functions
		}

		/// <summary>
		/// 	Writing to the Stream is not allowed
		/// </summary>
		public override void Write(byte[] buffer, int offset, int count)
		{
			throw new NotImplementedException();
		}

		/// <summary>
		/// 	Writing to the Stream is not allowed
		/// </summary>
		public override void WriteByte(byte value)
		{
			throw new NotImplementedException();
		}

		public override void Close()
		{
			// Inform the read-ahead thread that the source stream is about to be closed
			_readAheadThreadMustStop = true;

			/*
			/* TODO: ResetEvents seem to lock up. investigate further
			// Wait for the read-ahead thread to complete its read from teh stream before closing the stream
			_readAheadStreamResetEvent.WaitOne();
			*/

			_sourceStream.Close();
			_readAheadResetEvent.Close();
			/*
			 * _readAheadStreamResetEvent functionality disabled until solution to lock ups is found
				_readAheadStreamResetEvent.Close();
		 	*/

			base.Close();
		}

		/// <summary>
		/// 	I believe that only writeable streams use Flush()
		/// </summary>
		public override void Flush()
		{
			throw new NotImplementedException();
		}

		#endregion

		#region public overridden properties

		public override bool CanRead
		{
			get
			{
				return base.CanRead;
			}
		}

		public override bool CanSeek
		{
			get
			{
				return base.CanSeek;
			}
		}

		public override bool CanTimeout
		{
			get
			{
				return _sourceStream.CanTimeout;
			}
		}

		/// <summary>
		/// 	Writing to the Stream is not allowed
		/// </summary>
		public override bool CanWrite
		{
			get
			{
				return false;
			}
		}
		
		public override long Length
		{
			get
			{
				return _predeterminedLength;
			}
		}

		public override long Position
		{
			get
			{
				lock (_memoryBufferLock)
				{
					return _currentReadIndex;
				}
			}
			set
			{
				lock (_memoryBufferLock)
				{
					// The _currentReadIndex will be validated on the next read to determine if
					// it is ahead of the read ahead buffer
					_currentReadIndex = value;
				}
			}
		}

		public override int ReadTimeout
		{
			get
			{
				return base.ReadTimeout;
			}
			set
			{
				base.ReadTimeout = value;
			}
		}
		
		public override int WriteTimeout
		{
			get
			{
				throw new NotImplementedException();
			}
			set
			{
				throw new NotImplementedException();
			}
		}

		#endregion
	}
}
