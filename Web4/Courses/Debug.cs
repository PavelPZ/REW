using LMComLib;
using System;
using System.Linq;
using System.Collections.Generic;
using CourseModel;
using Newtonsoft.Json;
using System.IO;
using LMNetLib;
using System.Xml.Serialization;

namespace CourseModel {
  public static class debugEx {
    public static void run() {
      //Page res2 = new Page() {
      //  email = "root",
      //  info = new schools.page() {
      //    title = "Titulek stranky",
      //    instrTitle = "Instr",
      //    instrs = new string[] { "Instr1", "Instr2" },
      //  },
      //  Title = "Titulek stranky",
      //  Instruction = "Instr",
      //  TechInstructionPtrs = new string[] { "Instr1", "Instr2" },
      //  Classes = "cls1 cls2",
      //  SubType = SubTypes.Dragging_MarkUsed,
      //  Items = new Tag[] {
      //    new Pairing() {
      //      Items = new PairingItem[] {
      //        new PairingItem() {
      //          SubType = SubTypes.Row_Percent,
      //          Items = new Tag[] {
      //            new Cell () {Width = 49, Item = new Text(){Title = "Left"}},
      //            new Cell () {Width = 49, Offset=51, Item = new Text(){Title = "Right"}}
      //          }
      //        },
      //        new PairingItem() {
      //          SubType = SubTypes.Row_Percent,
      //          Items = new Tag[] {
      //            new Cell () {Width = 49, Item = new Text(){Title = "Left 2"}},
      //            new Cell () {Width = 49, Offset=51, Item = new Text(){Title = "Right 2"}}
      //          }
      //        }
      //      }
      //    },
      //    new Row() {
      //      Classes = "c-gapfill-lineheight",
      //      Items = new Cell[] {
      //        new Cell() {
      //          Offset = 1,
      //          Width = 6,
      //          Items = new Tag[] {
      //            new Text() {Title = "Toto je "},
      //            new GapFill() {email = "gp1", InitValue="[gap fill Init]", CorrectValue = "OK1|OK2"},
      //            new Text() {Title = "GapFill."},
      //            new GapFill() {email = "gp2", CorrectValue="OK3|OK4", PlaceHolder="Type text" },
      //          }
      //        },
      //        new Cell() {
      //          Offset = 1,
      //          Width = 6,
      //          Items = new Tag[] {
      //            new Text() {Title = "Toto je "},
      //            new GapFill() {email = "gp1", InitValue="[gap fill Init]", CorrectValue = "OK1|OK2"},
      //            new Text() {Title = "GapFill."},
      //            new GapFill() {email = "gp2", CorrectValue = "OK3|OK4", PlaceHolder="Type text" },
      //          }
      //        }
      //      }
      //    },
      //    new table() {
      //      Items = new Tag[] {
      //        new tr() {
      //          Items = new Tag[] {
      //            new td() {
      //              Item = new Text() {Title = "cell 1"}
      //            },
      //            new td() {
      //              Items = new Tag[] {
      //                new Text() {Title = "Toto je "},
      //                new GapFill() {email = "gp1", InitValue="[gap fill Init]", CorrectValue="OK1|OK2"},
      //                new Text() {Title = "GapFill."},
      //                new GapFill() {email = "gp2", CorrectValue = "OK3|OK4", PlaceHolder="Type text" },                    
      //              }
      //            }
      //          }
      //        }
      //      }
      //    }
      //  }
      //};

      //XmlUtils.ObjectToFile(Machines.basicPath + @"rew\Web4\RwCourses\russian4\meta.xml", new schools.course() {
      //  title = "Pokročilí",
      //  level = "B1-B2",
      //});
      //XmlUtils.ObjectToFile(Machines.basicPath + @"rew\Web4\RwCourses\russian4\\01Lesson\meta.xml", new schools.lesson() {
      //  title = "Lesson 1",
      //});
      //XmlUtils.ObjectToFile(Machines.basicPath + @"rew\Web4\RwCourses\russian4\01Lesson\01Module\meta.xml", new schools.mod() {
      //  title = "Module 1",
      //});

      //var resDebug = res2;
      //XmlUtils.ObjectToFile(Machines.basicPath + @"rew\web4\Courses\page-raw.xml", resDebug);

      //var root = lib.ToElement(res2);
      //root.Save(Machines.basicPath + @"rew\web4\Courses\page-root.xml");

      //res2 = lib.FromElement<Page>(root);
      //XmlUtils.ObjectToFile(Machines.basicPath + @"rew\web4\Courses\page-res2.xml", res2);

      //lib.ToElement(res2).Save(Machines.basicPath + @"rew\web4\Courses\page.xml");
      //lib.ToElement(res2).Save(Machines.basicPath + @"rew\Web4\RwCourses\russian4\01Lesson\01Module\01Page.xml");

      //var json = JsonConvert.SerializeObject(res2, Newtonsoft.Json.Formatting.Indented, jsonSet);
      //File.WriteAllText(Machines.basicPath + @"rew\web4\Courses\page.json", CourseModel.lib.Json(null, Machines.basicPath + @"rew\web4\Courses\page.xml", true));

    }
    public static JsonSerializerSettings jsonSet = new JsonSerializerSettings { DefaultValueHandling = DefaultValueHandling.Ignore, NullValueHandling = NullValueHandling.Ignore };
  }

}