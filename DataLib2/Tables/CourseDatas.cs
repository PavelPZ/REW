using System;
using System.Collections.Generic;
using Microsoft.Data.Entity;
using Microsoft.Data.Entity.Metadata;

namespace NewData
{
    public class CourseDatas
    {
        public long Id { get; set; }
        public int CourseUserId { get; set; }
        public string Data { get; set; }
        public long Date { get; set; }
        public long Flags { get; set; }
        public string Key { get; set; }
        public byte[] RowVersion { get; set; }
        public string ShortData { get; set; }

        public virtual CourseUsers CourseUser { get; set; }
    }
}
