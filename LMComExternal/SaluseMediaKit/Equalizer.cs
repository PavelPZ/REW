/*
* 12/12/99		Initial version.	mdm@techie.com
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

namespace Saluse.MediaKit.Decoder
{
	/// <summary> The <code>Equalizer</code> class can be used to specify
	/// equalization settings for the MPEG audio decoder. 
	/// <p>
	/// The equalizer consists of 32 band-pass filters. 
	/// Each band of the equalizer can take on a fractional value between 
	/// -1.0 and +1.0.
	/// At -1.0, the input signal is attenuated by 6dB, at +1.0 the signal is
	/// amplified by 6dB. 
	/// 
	/// </summary>
	/// <seealso cref="">Decoder
	/// 
	/// </seealso>
	/// <author>  MDM
	/// 
	/// </author>
	
	internal class Equalizer
	{
		/// <summary>
		/// Equalizer setting to denote that a given band will not be
		/// present in the output signal.
		/// </summary>
		public static readonly float BANDNOTPRESENT = System.Single.NegativeInfinity;
		public static readonly Equalizer PASSTHROUGHEQ = new Equalizer();

		private const int _BANDS = 32;
		private float[] _settings = new float[_BANDS];

		public virtual float[] FromFloatArray
		{
			set
			{
				Reset();
				int max = (value.Length > _BANDS)?_BANDS:value.Length;
				
				for (int i = 0; i < max; i++)
				{
					_settings[i] = Limit(value[i]);
				}
			}
			
		}
		//UPGRADE_TODO: Method 'setFrom' was converted to a set modifier. This name conflicts with another property. 'ms-help://MS.VSCC.2003/commoner/redir/redirect.htm?keyword="jlca1137"'
		/// <summary> Sets the bands of this equalizer to the value the bands of
		/// another equalizer. Bands that are not present in both equalizers are ignored. 
		/// </summary>
		public virtual Equalizer FromEqualizer
		{
			set
			{
				if (value != this)
				{
					FromFloatArray = value._settings;
				}
			}
			
		}
		//UPGRADE_TODO: Method 'setFrom' was converted to a set modifier. This name conflicts with another property. 'ms-help://MS.VSCC.2003/commoner/redir/redirect.htm?keyword="jlca1137"'
		public virtual EQFunction FromEQFunction
		{
			set
			{
				Reset();
				int max = _BANDS;
				
				for (int i = 0; i < max; i++)
				{
					_settings[i] = Limit(value.GetBand(i));
				}
			}
			
		}
		/// <summary> Retrieves the number of bands present in this equalizer.
		/// </summary>
		public virtual int BandCount
		{
			get
			{
				return _settings.Length;
			}
			
		}
		/// <summary> Retrieves an array of floats whose values represent a
		/// scaling factor that can be applied to linear samples
		/// in each band to provide the equalization represented by
		/// this instance. 
		/// 
		/// </summary>
		/// <returns>	an array of factors that can be applied to the
		/// subbands.
		/// 
		/// </returns>
		internal virtual float[] BandFactors
		{
			get
			{
				float[] factors = new float[_BANDS];
				for (int i = 0, maxCount = _BANDS; i < maxCount; i++)
				{
					factors[i] = GetBandFactor(_settings[i]);
				}
				
				return factors;
			}
			
		}

		public Equalizer()
		{
			//Intentional:
		}
		
		//	private Equalizer(float b1, float b2, float b3, float b4, float b5,
		//					 float b6, float b7, float b8, float b9, float b10, float b11,
		//					 float b12, float b13, float b14, float b15, float b16,
		//					 float b17, float b18, float b19, float b20);
		
		public Equalizer(float[] settings)
		{
			FromFloatArray = settings;
		}
		
		public Equalizer(EQFunction eq)
		{
			FromEQFunction = eq;
		}

		/// <summary> Sets all bands to 0.0
		/// </summary>
		public void Reset()
		{
			for (int i = 0; i < _BANDS; i++)
			{
				_settings[i] = 0.0f;
			}
		}
		
		public float SetBand(int band, float neweq)
		{
			float eq = 0.0f;
			
			if ((band >= 0) && (band < _BANDS))
			{
				eq = _settings[band];
				_settings[band] = Limit(neweq);
			}
			
			return eq;
		}
		
		/// <summary> Retrieves the eq setting for a given band.
		/// </summary>
		public float GetBand(int band)
		{
			float eq = 0.0f;
			
			if ((band >= 0) && (band < _BANDS))
			{
				eq = _settings[band];
			}
			
			return eq;
		}
		
		private float Limit(float eq)
		{
			if (eq == BANDNOTPRESENT)
			{
				return eq;
			}

			if (eq > 1.0f)
			{
				return 1.0f;
			}

			if (eq < -1.0f)
			{
				return -1.0f;
			}
			
			return eq;
		}
		
		/// <summary> Converts an equalizer band setting to a sample factor.
		/// The factor is determined by the function f = 2^n where
		/// n is the equalizer band setting in the range [-1.0,1.0].
		/// 
		/// </summary>
		internal float GetBandFactor(float eq)
		{
			if (eq == BANDNOTPRESENT)
			{
				return 0.0f;
			}
			
			float f = (float) System.Math.Pow(2.0, eq);
			return f;
		}
		
		abstract internal class EQFunction
		{
			/// <summary> Returns the setting of a band in the equalizer. 
			/// 
			/// </summary>
			/// <param name="band	The">index of the band to retrieve the setting
			/// for. 
			/// 
			/// </param>
			/// <returns>		the setting of the specified band. This is a value between
			/// -1 and +1.
			/// 
			/// </returns>
			public virtual float GetBand(int band)
			{
				return 0.0f;
			}
		}
	}
}