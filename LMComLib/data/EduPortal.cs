namespace EduPortal {
  using System.Data.Linq;
  using System.Data.Linq.Mapping;
  using System.Data;
  using System.Collections.Generic;
  using System.Reflection;
  using System.Linq;
  using System.Linq.Expressions;
  using System.ComponentModel;
  using System;

  partial class Class {
    public IEnumerable<Teacher> Teachers {
      get { return this.ClassTeachers.Select(ct => ct.Teacher); }
    }
  }

  partial class Teacher {
    public IEnumerable<Class> Classes {
      get { return this.ClassTeachers.Select(ct => ct.Class); }
    }
  }

  partial class EduPortalDB {
    public void CreateDB() {

    }
  }
}
