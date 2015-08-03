using System;
using System.Collections.Generic;
using System.IO;
using System.Windows.Media;
//using LMComLib;

namespace LMMedia {

  /// <summary>
  /// A Media Stream Source implemented to play WAVE files
  /// </summary>
  public class WaveMediaStreamSource2 : MediaStreamSource {

    public WaveMediaStreamSource2(Stream stream) {
      this.stream = stream;
      stream.Seek(0, SeekOrigin.Begin);
    }

    Stream stream; //vstupni stream s WAV daty

    const long numSamples = 200; //pocet samples co se najednou prehravaji
    long sampleSize; //pocet bytes pro numSamples samples

    long pcmDataLen; //delka zvuku (bytes)
    long duration; //delka zvuku (100 nano sec)
    WaveFormatExtensible header; //header z wav file

    long currentPosition; //The current position in the stream (bytes)
    long currentTimeStamp; //The current position in the stream (100 nano sec)
    long startPosition; //zacatek PCM dat (vetsinou = 44)

    /// <summary>
    /// The sample attributes (not used so empty)
    /// </summary>
    Dictionary<MediaSampleAttributeKeys, string> emptySampleDict = new Dictionary<MediaSampleAttributeKeys, string>();
    /// <summary>
    /// The stream description
    /// </summary>
    MediaStreamDescription audioDesc;


    /// <summary>
    /// Open the media.
    /// Create the structures.
    /// </summary>
    protected override void OpenMediaAsync() {
      header = WaveFormatExtensible.ReadHeader(stream);
      header.ValidateWaveFormat();

      sampleSize = (long)header.Channels * header.BitsPerSample / 8 * numSamples;
      startPosition = currentPosition = stream.Position;
      pcmDataLen = stream.Length - startPosition;
      duration = header.AudioDurationFromDataLen(pcmDataLen);

      // Init
      Dictionary<MediaStreamAttributeKeys, string> streamAttributes = new Dictionary<MediaStreamAttributeKeys, string>();
      Dictionary<MediaSourceAttributesKeys, string> sourceAttributes = new Dictionary<MediaSourceAttributesKeys, string>();
      List<MediaStreamDescription> availableStreams = new List<MediaStreamDescription>();

      // Stream Description
      streamAttributes[MediaStreamAttributeKeys.CodecPrivateData] = header.ToHexString();
      MediaStreamDescription msd = new MediaStreamDescription(MediaStreamType.Audio, streamAttributes);

      this.audioDesc = msd;
      availableStreams.Add(this.audioDesc);

      sourceAttributes[MediaSourceAttributesKeys.Duration] = duration.ToString();
      ReportOpenMediaCompleted(sourceAttributes, availableStreams);
    }

    /// <summary>
    /// Close the media. Release the resources.
    /// </summary>
    protected override void CloseMedia() {
      // Close the stream
      currentPosition = 0;
      currentTimeStamp = 0;
      audioDesc = null;
    }

    /// <summary>
    /// Return the next sample requested
    /// </summary>
    /// <param name="mediaStreamType">The stream type that we are getting a sample for</param>
    protected override void GetSampleAsync(MediaStreamType mediaStreamType) {

      long bufferSize = Math.Min(sampleSize, startPosition + pcmDataLen - currentPosition);
      // Send out the next sample
      if (bufferSize > 0) {
        MediaStreamSample sample = new MediaStreamSample(audioDesc, stream, currentPosition, bufferSize, currentTimeStamp, emptySampleDict);
        currentTimeStamp += header.AudioDurationFromDataLen(bufferSize);
        currentPosition += bufferSize;
        ReportGetSampleCompleted(sample);
      } else
        // Report EOS
        ReportGetSampleCompleted(new MediaStreamSample(audioDesc, null, 0, 0, 0, this.emptySampleDict));
    }

    /// <summary>
    /// Called when asked to seek to a new position
    /// </summary>
    /// <param name="seekToTime">the time to seek to</param>
    protected override void SeekAsync(long seekToTime) {
      if (seekToTime > duration) throw new InvalidOperationException("The seek position is beyond the length of the stream");
      currentPosition = header.DataLenFromAudioDuration(seekToTime) + startPosition;
      currentTimeStamp = seekToTime;

      ReportSeekCompleted(seekToTime);
    }

    /// <summary>
    /// Stream media stream.
    /// Not implemented
    /// </summary>
    /// <param name="mediaStreamDescription">The mediaStreamDescription that we want to switch to</param>
    protected override void SwitchMediaStreamAsync(MediaStreamDescription mediaStreamDescription) { throw new NotImplementedException(); }
    protected override void GetDiagnosticAsync(MediaStreamSourceDiagnosticKind diagnosticKind) { throw new NotImplementedException(); }

  }

}
