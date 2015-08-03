using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace Saluse.MediaKit.Bridge
{

	// Mimic the signature only of the desktop .NET Frameworks SerializableAttribute class
	internal class SerializableAttribute : Attribute
	{
	}

	// Mimic the signature only of the desktop .NET Frameworks Hashtable class
	internal class Hashtable : Dictionary<object, object>
	{
	}

	// Mimic the signature only of the desktop .NET Frameworks BinaryFormatter class
	internal class BinaryFormatter
	{
		public void Serialize(System.IO.Stream stream, object objectToSerialize)
		{
		}

		public object Deserialize(System.IO.Stream stream)
		{
			return null;
		}
	}

	// Mimic the signature and interface only of the desktop .NET Frameworks Trace class
	internal static class Trace
	{
		public static void WriteLine(string subject, string message)
		{
			Debug.WriteLine(subject + " - " + message);
		}
	}
}
