using LMComLib;
using LMNetLib;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Text;

namespace azure {
  public static class dbTest {
    public static void test() {
      //var db = new AzureData.Container(); db.Companies.RemoveRange(db.Companies); db.SaveChanges();
      //var sb = new StringBuilder();
      //db.Database.Log = s => sb.Append(s); var comps = db.Companies.ToArray(); sb.Clear();
      //var comp = new Company { compId = "comp1" }; db.Companies.Add(comp); db.SaveChanges();
      //sb.Clear();

      //db = new AzureData.Container(); db.Database.Log = s => sb.Append(s);
      //comp = new Company { compId = comp.compId, Id = comp.Id, DbTimestamp = comp.DbTimestamp };
      //db.Companies.Attach(comp);
      ////var entr = db.Entry(comp);
      ////entr.State = EntityState.Modified;
      //comp.departmentsObj = new Admin.DepartmentRoot();
      ////var prop = db.Entry(comp).Property(c => c.departments);
      ////prop.IsModified = true;
      //db.SaveChanges();
      //sb.Clear();
      
    }
  }
}