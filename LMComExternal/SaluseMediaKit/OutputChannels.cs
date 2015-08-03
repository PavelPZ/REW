/*
* 12/12/99 Initial implementation.		mdm@techie.com. 
/*-----------------------------------------------------------------------
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
*----------------------------------------------------------------------
*/

using System;
using Saluse.MediaKit.Enumerations;

namespace Saluse.MediaKit.Decoder
{
	/// <summary> A Type-safe representation of the the supported output channel
	/// constants. 
	/// 
	/// This class is immutable and, hence, is thread safe. 
	/// 
	/// </summary>
	/// <author> 	Mat McGowan 12/12/99 
	/// @since	0.0.7
	/// 
	/// </author>
	internal class OutputChannels
	{
		/// <summary>
		/// Flag to indicate output should include both channels. 
		/// </summary>
		public static int BOTHCHANNELS = (int)OutputChannelTypeEnumeration.BothChannels;

		/// <summary>
		/// Flag to indicate output should include the left channel only. 
		/// </summary>
		public static int LEFTCHANNEL = (int)OutputChannelTypeEnumeration.LeftChannel;

		/// <summary>
		/// Flag to indicate output should include the right channel only. 
		/// </summary>
		public static int RIGHTCHANNEL = (int)OutputChannelTypeEnumeration.RightChannel;

		/// <summary>
		/// 	Flag to indicate output is mono. 
		/// </summary>
		public static int DOWNMIXCHANNELS = (int)OutputChannelTypeEnumeration.DownMixChannels;

		public static readonly OutputChannels LEFT = new OutputChannels(LEFTCHANNEL);
		public static readonly OutputChannels RIGHT = new OutputChannels(RIGHTCHANNEL);
		public static readonly OutputChannels BOTH = new OutputChannels(BOTHCHANNELS);
		public static readonly OutputChannels DOWNMIX = new OutputChannels(DOWNMIXCHANNELS);

		private int outputChannels;

		/// <summary> Retrieves the code representing the desired output channels.
		/// Will be one of LEFT_CHANNEL, RIGHT_CHANNEL, BOTH_CHANNELS
		/// or DOWNMIX_CHANNELS.
		/// 
		/// </summary>
		/// <returns> the channel code represented by this instance.
		/// 
		/// </returns>
		virtual public int ChannelsOutputCode
		{
			get
			{
				return outputChannels;
			}
			
		}
		/// <summary> Retrieves the number of output channels represented 
		/// by this channel output type.
		/// 
		/// </summary>
		/// <returns>	The number of output channels for this channel output
		/// type. This will be 2 for BOTH_CHANNELS only, and 1
		/// for all other types. 
		/// 
		/// </returns>
		virtual public int ChannelCount
		{
			get
			{
				int count = (outputChannels == BOTHCHANNELS)?2:1;
				return count;
			}
		}
		
		/// <summary> Creates an <code>OutputChannels</code> instance
		/// corresponding to the given channel code.
		/// 
		/// </summary>
		/// <param name="code">one of the OutputChannels channel code constants.
		/// 
		/// @throws	IllegalArgumentException if code is not a valid
		/// channel code. 
		/// 
		/// </param>
		static public OutputChannels FromInt(int code)
		{
			switch (code)
			{
				case (int)OutputChannelTypeEnumeration.LeftChannel: 
					return LEFT;

				case (int)OutputChannelTypeEnumeration.RightChannel: 
					return RIGHT;

				case (int)OutputChannelTypeEnumeration.BothChannels: 
					return BOTH;

				case (int)OutputChannelTypeEnumeration.DownMixChannels: 
					return DOWNMIX;
				
				default: 
					throw new System.ArgumentException("Invalid channel code: " + code);
			}
		}
		
		private OutputChannels(int channels)
		{
			outputChannels = channels;
			if (channels < 0 || channels > 3)
			{
				throw new System.ArgumentException("channels");
			}
		}
		
		public  override bool Equals(System.Object o)
		{
			bool equals = false;
			
			if (o is OutputChannels)
			{
				OutputChannels oc = (OutputChannels) o;
				equals = (oc.outputChannels == outputChannels);
			}
			
			return equals;
		}
		
		public override int GetHashCode()
		{
			return outputChannels;
		}
	}
}