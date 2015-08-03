//-----------------------------------------------------------------------
// <copyright file="WaveFormatExtensible.cs" company="Larry Olson">
// (c) Copyright Larry Olson.
// This source is subject to the Microsoft Public License (Ms-PL)
// See http://code.msdn.microsoft.com/ManagedMediaHelpers/Project/License.aspx
// All other rights reserved.
// </copyright>
//-----------------------------------------------------------------------

using System;
using System.Globalization;
//using Saluse.MediaKit.Extensions;
using System.IO;
using System.Windows.Media;

namespace LMMedia {
  /// <summary>
  /// A managed representation of the multimedia WAVEFORMATEX structure
  /// declared in mmreg.h.
  /// </summary>
  /// <remarks>
  /// This was designed for usage in an environment where PInvokes are not
  /// allowed.
  /// </remarks>
  public class WaveFormatExtensible {

    /// <summary>
    /// The different formats allowable. For now PCM is the only one we support
    /// </summary>
    public const short FormatPCM = 1;
    /// <summary>
    /// The size of the basic structure
    /// </summary>
    public const uint SizeOf = 18;
    /// <summary>
    /// Gets or sets the audio format type. A complete list of format tags can be
    /// found in the Mmreg.h header file.
    /// </summary>
    /// <remarks>
    /// Silverlight 2 supports:
    /// WMA 7,8,9
    /// WMA 10 Pro
    /// Mp3
    /// WAVE_FORMAT_MPEGLAYER3 = 0x0055
    /// WAVE_FORMAT_ALAW = 0x0006
    /// WAVE_FORMAT_ADPCM = 0x0002
    /// </remarks>
    public short FormatTag { get; set; }

    /// <summary>
    /// Gets or sets the number of channels in the data. 
    /// Mono            1
    /// Stereo          2
    /// Dual            2 (2 Mono channels)
    /// </summary>
    /// <remarks>
    /// Silverlight 2 only supports stereo output and folds down higher
    /// numbers of channels to stereo.
    /// </remarks>
    public short Channels { get; set; }

    /// <summary>
    /// Gets or sets the sampling rate in hertz (samples per second)
    /// </summary>
    public int SamplesPerSec { get; set; }

    /// <summary>
    /// Gets or sets the average data-transfer rate, in bytes per second, for the format.
    /// </summary>
    public int AverageBytesPerSecond { get; set; }

    /// <summary>
    /// Gets or sets the minimum size of a unit of data for the given format in Bytes.
    /// </summary>
    public short BlockAlign { get; set; }

    /// <summary>
    /// Gets or sets the number of bits in a single sample of the format'query data.
    /// </summary>
    public short BitsPerSample { get; set; }

    /// <summary>
    /// Gets or sets the size in bytes of any extra format data added to the end of the
    /// WAVEFORMATEX structure.
    /// </summary>
    public short Size { get; set; }

    /// <summary>
    /// Delka Raw dat
    /// </summary>
    public int DataLen;

    /// <summary>
    /// Pozica Raw dat ve streamu
    /// </summary>
    public int DataPos { get { return (int) RIFFHeaderSize; } }

    /// <summary>
    /// Gets or sets the buffer with Extra header data
    /// </summary>
    public byte[] Ext { get; set; }

    /// <summary>
    /// Returns a string representing the structure in little-endian 
    /// hexadecimal format.
    /// </summary>
    /// <remarks>
    /// The string generated here is intended to be passed as 
    /// CodecPrivateData for Silverlight 2'query MediaStreamSource
    /// </remarks>
    /// <returns>
    /// A string representing the structure in little-endia hexadecimal
    /// format.
    /// </returns>
    public string ToHexString() {
      string s = string.Format(CultureInfo.InvariantCulture, "{0:X4}", FormatTag).ToLittleEndian();
      s += string.Format(CultureInfo.InvariantCulture, "{0:X4}", Channels).ToLittleEndian();
      s += string.Format(CultureInfo.InvariantCulture, "{0:X8}", SamplesPerSec).ToLittleEndian();
      s += string.Format(CultureInfo.InvariantCulture, "{0:X8}", AverageBytesPerSecond).ToLittleEndian();
      s += string.Format(CultureInfo.InvariantCulture, "{0:X4}", BlockAlign).ToLittleEndian();
      s += string.Format(CultureInfo.InvariantCulture, "{0:X4}", BitsPerSample).ToLittleEndian();
      s += string.Format(CultureInfo.InvariantCulture, "{0:X4}", Size).ToLittleEndian();
      return s;
    }

    /// <summary>
    /// Returns a string representing all of the fields in the object.
    /// </summary>
    /// <returns>
    /// A string representing all of the fields in the object.
    /// </returns>
    public override string ToString() {
      return string.Format(
          CultureInfo.InvariantCulture,
          "WAVEFORMATEX FormatTag: {0}, Channels: {1}, SamplesPerSec: {2}, AvgBytesPerSec: {3}, BlockAlign: {4}, BitsPerSample: {5}, Size: {6} ",
          this.FormatTag,
          this.Channels,
          this.SamplesPerSec,
          this.AverageBytesPerSecond,
          this.BlockAlign,
          this.BitsPerSample,
          this.Size);
    }
    /// <summary>
    /// Set the data from a byte array (usually read from a file)
    /// </summary>
    /// <param name="byteArray">The array used as input to the stucture</param>
    public void SetFromByteArray(byte[] byteArray) {
      if ((byteArray.Length + 2) < SizeOf) {
        throw new ArgumentException("Byte array is too small");
      }

      this.FormatTag = BitConverter.ToInt16(byteArray, 0);
      this.Channels = BitConverter.ToInt16(byteArray, 2);
      this.SamplesPerSec = BitConverter.ToInt32(byteArray, 4);
      this.AverageBytesPerSecond = BitConverter.ToInt32(byteArray, 8);
      this.BlockAlign = BitConverter.ToInt16(byteArray, 12);
      this.BitsPerSample = BitConverter.ToInt16(byteArray, 14);
      if (byteArray.Length >= SizeOf) {
        this.Size = BitConverter.ToInt16(byteArray, 16);
      } else {
        this.Size = 0;
      }

      if (byteArray.Length > SizeOf) {
        this.Ext = new byte[byteArray.Length - SizeOf];
        Array.Copy(byteArray, (int)SizeOf, this.Ext, 0, this.Ext.Length);
      } else {
        this.Ext = null;
      }
    }

    /// <summary>
    /// Calculate the duration of audio based on the size of the buffer
    /// </summary>
    /// <param name="audioDataSize">the buffer size in bytes</param>
    /// <returns>The duration of that buffer</returns>
    public long AudioDurationFromDataLen(long audioDataSize) {
      if (this.AverageBytesPerSecond == 0) return 0;
      return (long)audioDataSize * 10000000 / AverageBytesPerSecond;
    }

    /// <summary>
    /// Calculate the buffer size necessary for a duration of audio
    /// </summary>
    /// <param name="duration">the duration</param>
    /// <returns>the size of the buffer necessary</returns>
    public int DataLenFromAudioDuration(long duration) {
      long size = duration * this.AverageBytesPerSecond / 10000000;
      uint remainder = (uint)(size % this.BlockAlign);
      if (remainder != 0) size += this.BlockAlign - remainder;
      return (int)size;
    }

    public int DataLenFromMSec(int msec) {
      return (int)DataLenFromAudioDuration(msec * 10000);
    }

    public int MSecFromFromDataLen(int audioDataSize) {
      return (int)(AudioDurationFromDataLen(audioDataSize) / 10000);
    }

    public int MSecFromFileLen() {
      return MSecFromFromDataLen(DataLen);
    }

    /// <summary>
    /// Validate that the Wave format is consistent.
    /// </summary>
    public void ValidateWaveFormat() {
      if (this.FormatTag != FormatPCM) {
        throw new InvalidOperationException("Only PCM format is supported");
      }

      if (this.Channels != 1 && this.Channels != 2) {
        throw new InvalidOperationException("Only 1 or 2 channels are supported");
      }

      if (this.BitsPerSample != 8 && this.BitsPerSample != 16) {
        throw new InvalidOperationException("Only 8 or 16 bit samples are supported");
      }

      if (this.Size != 0) {
        throw new InvalidOperationException("Size must be 0");
      }

      if (this.BlockAlign != this.Channels * (this.BitsPerSample / 8)) {
        throw new InvalidOperationException("Block Alignment is incorrect");
      }

      if (this.SamplesPerSec > (uint.MaxValue / this.BlockAlign)) {
        throw new InvalidOperationException("SamplesPerSec overflows");
      }

      if (this.AverageBytesPerSecond != this.SamplesPerSec * this.BlockAlign) {
        throw new InvalidOperationException("AvgBytesPerSec is wrong");
      }
    }

    static byte[] Int2ByteArr(uint val) {
      byte[] res = new byte[4];
      for (int i = 0; i < 4; i++) {
        res[i] = (byte)(val >> (i * 8));
      }
      return res;
    }

    static byte[] Short2ByteArr(short val) {
      byte[] res = new byte[2];
      for (int i = 0; i < 2; i++) {
        res[i] = (byte)(val >> (i * 8));
      }
      return res;
    }

    static void WriteStream(Stream str, byte[] data) {
      str.Write(data, 0, data.Length);
    }

    public static void WriteEmptyHeader(Stream str) {
      byte[] empty = new byte[44];
      WriteStream(str, empty);
    }

    private const uint WaveHeaderSize = 36;
    private const uint WaveFormatSize = 16;
    private const uint RIFFHeaderSize = 44;

    public static void WriteHeader(Stream str, short channels, short bitsPerSample, uint samplesPerSec, uint dataLen) {
      short blockAlign = (short)(channels * (bitsPerSample / 8));
      uint averageBytesPerSecond = (uint)(samplesPerSec * blockAlign);
      WriteStream(str, new byte[] { (byte)'R', (byte)'I', (byte)'F', (byte)'F' });
      WriteStream(str, Int2ByteArr((uint) (dataLen + WaveHeaderSize)));
      WriteStream(str, new byte[] { (byte)'W', (byte)'A', (byte)'V', (byte)'E' });
      WriteStream(str, new byte[] { (byte)'f', (byte)'m', (byte)'t', (byte)' ' });
      WriteStream(str, Int2ByteArr(WaveFormatSize));
      WriteStream(str, Short2ByteArr(FormatPCM));
      WriteStream(str, Short2ByteArr(channels));
      WriteStream(str, Int2ByteArr(samplesPerSec));
      WriteStream(str, Int2ByteArr(averageBytesPerSecond));
      WriteStream(str, Short2ByteArr(blockAlign));
      WriteStream(str, Short2ByteArr(bitsPerSample));
      WriteStream(str, new byte[] { (byte)'d', (byte)'a', (byte)'t', (byte)'a' });
      WriteStream(str, Int2ByteArr(dataLen));
    }

    public static void WriteHeaderStart(Stream str, AudioFormat fmt) {
      WriteHeader(str, (short) fmt.Channels, (short) fmt.BitsPerSample, (uint) fmt.SamplesPerSecond, 0);
    }

    public static void WriteHeaderStart(Stream str, short channels, short bitsPerSample, uint samplesPerSec) {
      WriteHeader(str, channels, bitsPerSample, samplesPerSec, 0);
    }

    public static void WriteHeader(Stream str, WaveFormatExtensible fmt, uint dataLen) {
      WriteHeader(str, fmt.Channels, fmt.BitsPerSample, (uint)fmt.SamplesPerSec, dataLen);
    }

    public static void WriteHeaderEnd(Stream str) {
      uint dataLen = (uint)str.Length - RIFFHeaderSize;
      str.Seek(4, SeekOrigin.Begin);
      WriteStream(str, Int2ByteArr(dataLen + WaveHeaderSize));
      str.Seek(40, SeekOrigin.Begin);
      WriteStream(str, Int2ByteArr(dataLen));
    }

    static string ReadChunk(BinaryReader reader) {
      byte[] ch = new byte[4];
      reader.Read(ch, 0, ch.Length);
      return System.Text.Encoding.UTF8.GetString(ch, 0, ch.Length);
    }

    public static WaveFormatExtensible ReadHeader(Stream m_Stream/*, out int DataLength, out long DataPos*/) {
      BinaryReader Reader = new BinaryReader(m_Stream);
      if (ReadChunk(Reader) != "RIFF") throw new Exception("Invalid RIFF");

      Reader.ReadInt32(); // File length minus first 8 bytes of RIFF description, we don't use it

      if (ReadChunk(Reader) != "WAVE") throw new Exception("Invalid WAVE");

      if (ReadChunk(Reader) != "fmt ") throw new Exception("Invalid fmt");

      int FormatLength = Reader.ReadInt32();
      if (FormatLength != WaveFormatSize) throw new Exception("Invalid FormatLength");

      WaveFormatExtensible Format = new WaveFormatExtensible(); // initialize to any format
      Format.FormatTag = Reader.ReadInt16();
      Format.Channels = Reader.ReadInt16();
      Format.SamplesPerSec = Reader.ReadInt32();
      Format.AverageBytesPerSecond = Reader.ReadInt32();
      Format.BlockAlign = Reader.ReadInt16();
      Format.BitsPerSample = Reader.ReadInt16();
      if (ReadChunk(Reader) != "data") throw new Exception("Invalid data chunk");
      if (m_Stream.Position >= m_Stream.Length) throw new Exception("Missing DataLen field");
      Format.DataLen = Reader.ReadInt32();
      if (m_Stream.Length != Format.DataLen + RIFFHeaderSize) throw new Exception("Wrong WAV stream size");

      return Format;
    }

    public bool Eq(WaveFormatExtensible fmt) {
      return BitsPerSample == fmt.BitsPerSample && Channels == fmt.Channels && SamplesPerSec == fmt.SamplesPerSec;
    }
  }
}