using System;
using Saluse.MediaKit.Bridge;

namespace Saluse.MediaKit.Common
{
	internal static class Utilities
	{
		public static int URShift(int number, int bits)
		{
			if (number >= 0)
			{
				return number >> bits;
			}
			else
			{
				return (number >> bits) + (2 << ~bits);
			}
		}

		public static int URShift(int number, long bits)
		{
			return URShift(number, (int)bits);
		}

		public static long URShift(long number, int bits)
		{
			if (number >= 0)
			{
				return number >> bits;
			}
			else
			{
				return (number >> bits) + (2L << ~bits);
			}
		}

		public static long URShift(long number, long bits)
		{
			return URShift(number, (int)bits);
		}

		/*******************************/
		/// <summary>
		/// This method is used as a dummy method to simulate VJ++ behavior
		/// </summary>
		/// <param name="literal">The literal to return</param>
		/// <returns>The received value</returns>
		public static long Identity(long literal)
		{
			return literal;
		}

		/// <summary>
		/// This method is used as a dummy method to simulate VJ++ behavior
		/// </summary>
		/// <param name="literal">The literal to return</param>
		/// <returns>The received value</returns>
		public static ulong Identity(ulong literal)
		{
			return literal;
		}

		/// <summary>
		/// This method is used as a dummy method to simulate VJ++ behavior
		/// </summary>
		/// <param name="literal">The literal to return</param>
		/// <returns>The received value</returns>
		public static float Identity(float literal)
		{
			return literal;
		}

		/// <summary>
		/// This method is used as a dummy method to simulate VJ++ behavior
		/// </summary>
		/// <param name="literal">The literal to return</param>
		/// <returns>The received value</returns>
		public static double Identity(double literal)
		{
			return literal;
		}

		/*******************************/
		
		/// <summary>
		/// Converts an array of sbytes to an array of bytes
		/// </summary>
		/// <param name="sbyteArray">The array of sbytes to be converted</param>
		/// <returns>The new array of bytes</returns>
		public static byte[] ToByteArray(sbyte[] sbyteArray)
		{
			byte[] byteArray = new byte[sbyteArray.Length];
			for (int index = 0; index < sbyteArray.Length; index++)
			{
				byteArray[index] = (byte)sbyteArray[index];
			}
			return byteArray;
		}

		/// <summary>
		/// Converts a string to an array of bytes
		/// </summary>
		/// <param name="sourceString">The string to be converted</param>
		/// <returns>The new array of bytes</returns>
		public static byte[] ToByteArray(string sourceString)
		{
			byte[] byteArray = new byte[sourceString.Length];
			for (int index = 0; index < sourceString.Length; index++)
			{
				byteArray[index] = (byte)sourceString[index];
			}
			return byteArray;
		}
	}
}