/// <summary>
/// Internal class used to queue samples that are being obtained 
/// from an Mp3 stream. This merges the old mp3stream OBuffer with
/// the javazoom SampleBuffer code for the highest efficiency...
/// well, not the highest possible. The highest I'm willing to sweat
/// over. --trs
/// 
/// This class handles stereo 16-bit data! Switch it out if you want mono or something.
/// </summary>

using System;
using System.Diagnostics;

namespace Saluse.MediaKit.Decoder {
  /// <summary>
  /// 	Prefixed it 'Custom' as class names cannot start with numerals
  /// </summary>
  internal class Custom16BitStereoOutputBuffer : OutputBuffer {
    // This is stereo!
    //LM
    public static int CHANNELS = 2;

    // Read offset used to read from the stream, in bytes.
    int _offset;

    // end marker, one past end of array. Same as bufferp[0], but
    // without the array bounds check.
    int _end;

    // Write offset used in append_bytes
    byte[] _buffer = new byte[OBUFFERSIZE * 2]; // all channels interleaved
    int[] _bufferp = new int[MAXCHANNELS]; // offset in each channel not same!

    public Custom16BitStereoOutputBuffer() {
      // Initialize the buffer pointers
      ClearBuffer();
    }

    public Byte[] Buffer {
      get {
        return this._buffer;
      }
    }

    public int BytesLeft {
      get {
        // Note: should be Math.Max( bufferp[0], bufferp[1]-1 ). 
        // Heh.
        return _end - _offset;

        // This results in a measurable performance improvement, but
        // is actually incorrect. Is there a trick to optimize this?
        // return (OBUFFERSIZE * 2) - _offset;
      }
    }

    public int BufferSize {
      get {
        return _buffer.Length;
      }
    }

    ///
    /// Copies as much of this buffer as will fit into hte output
    /// buffer.
    ///
    /// \return The amount of bytes copied.
    ///
    public int Read(byte[] bufferOut, int offset, int count) {
      int remaining = BytesLeft;
      int copySize;
      if (count > remaining) {
        copySize = remaining;
        Debug.Assert(copySize % (2 * CHANNELS) == 0);
      } else {
        // Copy an even number of sample frames
        int remainder = count % (2 * CHANNELS);
        copySize = count - remainder;
      }

      Array.Copy(_buffer, _offset, bufferOut, offset, copySize);

      _offset += copySize;
      return copySize;
    }

    // Inefficiently write one sample value
    public override void Append(int channel, short valueRenamed) {
      _buffer[_bufferp[channel]] = (byte)(valueRenamed & 0xff);
      _buffer[_bufferp[channel] + 1] = (byte)(valueRenamed >> 8);

      _bufferp[channel] += CHANNELS * 2;
    }

    // efficiently write 32 samples
    public override void AppendSamples(int channel, float[] samples) {
      // Always, 32 samples are appended
      int pos = _bufferp[channel];

      float fs;
      for (int i = 0; i < 32; i++) {
        fs = samples[i];
        if (fs > 32767.0f) // can this happen?
          fs = 32767.0f;
        else if (fs < -32767.0f)
          fs = -32767.0f;

        int sample = (int)fs;
        _buffer[pos] = (byte)(sample & 0xff);
        _buffer[pos + 1] = (byte)(sample >> 8);

        pos += CHANNELS * 2;
      }

      _bufferp[channel] = pos;
    }


    /// <summary>
    /// This implementation does not clear the buffer. 
    /// </summary>
    public override void ClearBuffer() {
      _offset = 0;
      _end = 0;

      for (int i = 0; i < CHANNELS; i++)
        _bufferp[i] = i * 2; // two bytes per channel
    }

    public override void SetStopFlag() { }
    public override void WriteBuffer(int val) {
      _offset = 0;

      // speed optimization - save end marker, and avoid
      // array access at read time. Can you believe this saves
      // like 1-2% of the cpu on a PIII? I guess allocating
      // that temporary "new int(0)" is expensive, too.
      _end = _bufferp[0];
    }
    public override void Close() { }
  }
}