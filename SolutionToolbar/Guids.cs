// Guids.cs
// MUST match guids.cr
using System;

namespace Author
{
    static class GuidList
    {
        public const string guidSolutionToolbarPkgString = "9de60c98-b3b9-4d96-8c11-379081f00382";
        public const string guidSolutionToolbarCmdSetString = "819bff7d-cbdf-4b3b-be05-782e034d89b2";

        public static readonly Guid guidSolutionToolbarCmdSet = new Guid(guidSolutionToolbarCmdSetString);
    };
}