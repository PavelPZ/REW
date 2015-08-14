using System;
using System.Linq;
using LMComLib;
using LMNetLib;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Xml.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.IO.Compression;
using Newtonsoft.Json;
using System.Xml;
using System.ComponentModel;
using schools;
using ProductsDefine;

namespace ProductsDefine {

  public static class Def {
    //vrati popisy vsech casti produktu
    //static string[] ignores = new string[] { "reshome.htm", "hometop.htm", "homehome.htm" };
    public static Dictionary<CourseIds, string> part1 = new Dictionary<CourseIds, string>() { { CourseIds.English, "part 1" }, { CourseIds.EnglishE, "part 1" }, { CourseIds.German, "Teil 1" }, { CourseIds.Spanish, "parte 1" }, { CourseIds.French, "partie 1" }, { CourseIds.Italian, "parte 1" }, { CourseIds.Russian, "part 1" } };
    public static Dictionary<CourseIds, string> part2 = new Dictionary<CourseIds, string>() { { CourseIds.English, "part 2" }, { CourseIds.EnglishE, "part 2" }, { CourseIds.German, "Teil 2" }, { CourseIds.Spanish, "parte 2" }, { CourseIds.French, "partie 2" }, { CourseIds.Italian, "parte 2" }, { CourseIds.Russian, "part 2" } };

    static Dictionary<CourseIds, Dictionary<int, string>> levelTitle = new Dictionary<CourseIds, Dictionary<int, string>>() {
    {CourseIds.English, new Dictionary<int, string>() { {0, "Beginners"}, {1, "False Beginners"}, {2, "Pre-intermediate"}, {3, "Intermediate"}, {4, "Upper Intermediate"} } },
    {CourseIds.EnglishE, new Dictionary<int, string>() { {0, "Beginners"}, {1, "False Beginners"}, {2, "Pre-intermediate"}, {3, "Intermediate"}, {4, "Upper Intermediate"} } },
    {CourseIds.German, new Dictionary<int, string>() { {0, "Anfänger"}, {1, "Mittelfortgeschrittene"}, {2, "Fortgeschrittene"} } },
    {CourseIds.Spanish, new Dictionary<int, string>() { {0, "Inicial"}, {1, "Intermedio"}, {2, "Avanzado"} } },
    {CourseIds.French, new Dictionary<int, string>() { {0, "Débutants"}, {1, "Débutants avancés"}, {2, "Avancés"} } },
    {CourseIds.Italian, new Dictionary<int, string>() { {0, "Principiante"}, {1, "Intermedio"}, {2, "Avanzato"} } },
    {CourseIds.Russian, new Dictionary<int, string>() { {0, "Начинающие"}, {1, "Начальный средний"}, {2, "Средний уровень"}, {3, "Level 4"} } }
  };
    static Dictionary<CourseIds, string> courseTitle = new Dictionary<CourseIds, string>() {
    {CourseIds.English, "English Courses"},
    {CourseIds.EnglishE, "LANGMaster English"},
    {CourseIds.German, "Deutschkurs"},
    {CourseIds.Spanish, "Curso de español"},
    {CourseIds.French, "Cours de français"},
    {CourseIds.Italian, "Corso di Italiano"},
    {CourseIds.Russian, "Курсы русского"},
  };
    static Dictionary<CourseIds, int> numOfParts = new Dictionary<CourseIds, int>() {
    {CourseIds.English, 10},
    {CourseIds.EnglishE, 10},
    {CourseIds.German, 5},
    {CourseIds.Spanish, 6},
    {CourseIds.French, 6},
    {CourseIds.Italian, 6},
    //{CourseIds.Russian, 3},
    {CourseIds.Russian, 4},
  };
  static Dictionary<CourseIds, int> startCount = new Dictionary<CourseIds, int>() {
    {CourseIds.English, 100},
    {CourseIds.EnglishE, 200},
    {CourseIds.German, 300},
    {CourseIds.Spanish, 400},
    {CourseIds.French, 500},
    {CourseIds.Italian, 600},
    {CourseIds.Russian, 700},
  };
  const int VSZCount = 800;
  const int ExamplesCount = 890;
  const int GrafiaCount = 900;
  const int PretestCount = 1000;

    public static IEnumerable<productDescrLow> generateProducts(CourseIds crsId) {
      var cnt = startCount[crsId];
      string tit = courseTitle[crsId]; int parts = numOfParts[crsId];
      foreach (bool isTest in new bool[] { true, false }) {
        if (isTest && crsId != CourseIds.English) continue; //testy ma jen anglictina
        string testTitle = tit + (isTest ? " with Tests" : null);
        yield return new productDescr() { isTest = isTest, courseId = cnt++, title = testTitle, course = crsId, skipPart = 0, takePart = parts };
        if (crsId == CourseIds.Russian) {
          yield return new productDescr() { courseId = cnt++, title = testTitle + ", " + levelTitle[crsId][0], course = crsId, skipPart = 0, takePart = 1 };
          yield return new productDescr() { courseId = cnt++, title = testTitle + ", " + levelTitle[crsId][1], course = crsId, skipPart = 1, takePart = 1 };
          yield return new productDescr() { courseId = cnt++, title = testTitle + ", " + levelTitle[crsId][2], course = crsId, skipPart = 2, takePart = 1 };
          yield return new productDescr() { courseId = cnt++, title = testTitle + ", " + levelTitle[crsId][3], course = crsId, skipPart = 3, takePart = 1 };
          continue;
        }
        for (int lev = 0; lev < (parts + 1) >> 1; lev++) {
          string levTitle = testTitle + ", " + levelTitle[crsId][lev];
          if (lev == 2 && crsId == CourseIds.German) {//treti uroven nemciny
            yield return new productDescr() { isTest = isTest, courseId = cnt++, title = levTitle, course = crsId, skipPart = 4, takePart = 1 };
            continue;
          }
          yield return new productDescr() { isTest = isTest, courseId = cnt++, title = levTitle, course = crsId, skipPart = lev * 2, takePart = 2 };
          for (int partIdx = 0; partIdx < 2; partIdx++) {
            yield return new productDescr() { isTest = isTest, courseId = cnt++, title = levTitle + ", " + (partIdx == 0 ? part1 : part2)[crsId], course = crsId, skipPart = lev * 2 + partIdx, takePart = 1 };
          }

        }
      }
    }

    public static IEnumerable<productDescrLow> generateGrafiaProducts() {
      var cnt = GrafiaCount;
      yield return new productDescrNew() {
        course = CourseIds.German,
        courseId = cnt++,
        title = "Grafia Fragment",
        dataPath = "Grafia/fragment",
        _productId = "GrafiaFragment".ToLower(),
        _locs = new Langs[] { Langs.cs_cz },
        //_allLevels = Lib.createSitemap("Grafia/fragment").Elements().ToArray(),
        _productParts = new productPartNew[] {
          new productPartNew() {
            _partLevelName = "Part 1",
            refreshLessons = () => Lib.createSitemap("Grafia/fragment").Descendants("lesson").ToArray(), //dynamicke kvuli refresh pri buildu
          }
        }
      };
    }

    public static IEnumerable<productDescrLow> generateExamplesProducts() {
      var cnt = ExamplesCount;
      yield return new productDescrNew() {
        course = CourseIds.German,
        courseId = cnt++,
        title = "Examples",
        dataPath = "Examples",
        _productId = "Examples".ToLower(),
        _locs = new Langs[] { Langs.cs_cz },
        //_allLevels = Lib.createSitemap("Grafia/fragment").Elements().ToArray(),
        _productParts = new productPartNew[] {
          new productPartNew() {
            _partLevelName = "Part 1",
            refreshLessons = () => Lib.createSitemap("Examples").Descendants("lesson").ToArray(), //dynamicke kvuli refresh pri buildu
          }
        }
      };
    }

    public static IEnumerable<productDescrLow> generatePretestProducts() {
      var cnt = PretestCount;
      yield return new productDescrNew() {
        course = CourseIds.English,
        courseId = cnt++,
        title = "English Pretest",
        dataPath = "pretests/en",
        _productId = "pretestsen".ToLower(),
        _locs = new Langs[] { Langs.cs_cz },
        //_allLevels = Lib.createSitemap("Grafia/fragment").Elements().ToArray(),
        _productParts = new productPartNew[] {
          new productPartNew() {
            _partLevelName = "Part 1",
            refreshLessons = () => Lib.createSitemap("pretests/en").Descendants("lesson").ToArray(), //dynamicke kvuli refresh pri buildu
          }
        }
      };
    }

    public static IEnumerable<productDescrLow> generateVSZProducts() {

      //Func<IEnumerable<XElement>, IEnumerable<XElement>> germanRenameLess = els => {
      //  Action<XAttribute, int> rename = (attr, idx) => {
      //    var pts = attr.Value.Split(' ');
      //    attr.Value = pts[0] + " " + (idx + 1).ToString();
      //  };
      //  var elsArr = els.ToArray();
      //  for (var i = 0; i < elsArr.Length; i++) rename(elsArr[i].Attribute("title"), i);
      //  return elsArr;
      //};
      //A1..B2
      var cnt = VSZCount;
      yield return new productDescrEx() {
        course = CourseIds.English,
        courseId = cnt++,
        title = "English course A1",
        _grammarLevels = new int[] { 1 },
        _productId = "English_A1",
        _locs = new Langs[] { Langs.cs_cz },
        setProductParts = new productPartEx[] {
            new productPartEx() {
              title = "English course A1",
              levs = new productLessInterval[] { new productLessInterval() { levIdx = 1 } }
            }
          }
      };
      yield return new productDescrEx() {
        course = CourseIds.English,
        courseId = cnt++,
        title = "English course A2",
        _grammarLevels = new int[] { 2 },
        _productId = "English_A2",
        _locs = new Langs[] { Langs.cs_cz },
        setProductParts = new productPartEx[] {
            new productPartEx() {
              title = "English course A2",
              levs = new productLessInterval[] { new productLessInterval() { levIdx = 2 } }
            }
          }
      };
      yield return new productDescrEx() {
        course = CourseIds.English,
        courseId = cnt++,
        title = "English course B1",
        _grammarLevels = new int[] { 3 },
        _productId = "English_B1",
        _locs = new Langs[] { Langs.cs_cz },
        setProductParts = new productPartEx[] {
            new productPartEx() {
              title = "English course B1",
              levs = new productLessInterval[] { new productLessInterval() { levIdx = 3 } }
            }
          }
      };
      yield return new productDescrEx() {
        course = CourseIds.English,
        courseId = cnt++,
        title = "English course B2",
        _grammarLevels = new int[] { 4 },
        _productId = "English_B2",
        _locs = new Langs[] { Langs.cs_cz },
        setProductParts = new productPartEx[] {
            new productPartEx() {
              title = "English course B2",
              levs = new productLessInterval[] { new productLessInterval() { levIdx = 4 } }
            }
          }
      };
      yield return new productDescrEx() {
        course = CourseIds.German,
        courseId = cnt++,
        title = "Deutschkurs A1",
        _grammarLevels = new int[] { 0 },
        _productId = "German_A1",
        _locs = new Langs[] { Langs.cs_cz },
        setProductParts = new productPartEx[] {
              new productPartEx() {
                title = "Deutschkurs A1",
                levs = new productLessInterval[] {  new productLessInterval() { levIdx = 0, take = 8 }  }
              }
            }
      };
      yield return new productDescrEx() {
        course = CourseIds.German,
        courseId = cnt++,
        title = "Deutschkurs A2",
        _grammarLevels = new int[] { 0, 1 },
        _productId = "German_A2",
        _locs = new Langs[] { Langs.cs_cz },
        setProductParts = new productPartEx[] {
              new productPartEx() {
                title = "Deutschkurs A2",
                levs = new productLessInterval[] {  
                  new productLessInterval() { levIdx = 0, skip = 8 },
                  new productLessInterval() { levIdx = 1, take = 4 }  
                },
                //modifySiteMap = germanRenameLess
              }
            }
      };
      yield return new productDescrEx() {
        course = CourseIds.German,
        courseId = cnt++,
        title = "Deutschkurs B1",
        _grammarLevels = new int[] { 1 },
        _productId = "German_B1",
        _locs = new Langs[] { Langs.cs_cz },
        setProductParts = new productPartEx[] {
              new productPartEx() {
                title = "Deutschkurs B1",
                levs = new productLessInterval[] {  
                  new productLessInterval() { levIdx = 1, skip = 4 }  
                },
                //modifySiteMap = germanRenameLess
              }
            }
      };
      yield return new productDescrEx() {
        course = CourseIds.German,
        courseId = cnt++,
        title = "Deutschkurs B2",
        _grammarLevels = new int[] { 2 },
        _productId = "German_B2",
        _locs = new Langs[] { Langs.cs_cz },
        setProductParts = new productPartEx[] {
              new productPartEx() {
                title = "Deutschkurs B2",
                levs = new productLessInterval[] {  
                  new productLessInterval() { levIdx = 2 }  
                }
              }
            }
      };
      yield return new productDescrEx() {
        course = CourseIds.Russian,
        courseId = cnt++,
        title = "Курсы русского A1",
        //_grammarLevels = new int[] { 2 },
        _productId = "Russian_A1",
        _locs = new Langs[] { Langs.cs_cz },
        setProductParts = new productPartEx[] {
              new productPartEx() {
                title = "Курсы русского A1",
                levs = new productLessInterval[] {  
                  new productLessInterval() { levIdx = 0 }  
                }
              }
            }
      };
      yield return new productDescrEx() {
        course = CourseIds.Russian,
        courseId = cnt++,
        title = "Курсы русского A2",
        //_grammarLevels = new int[] { 2 },
        _productId = "Russian_A2",
        _locs = new Langs[] { Langs.cs_cz },
        setProductParts = new productPartEx[] {
              new productPartEx() {
                title = "Курсы русского A2",
                levs = new productLessInterval[] {  
                  new productLessInterval() { levIdx = 1 }  
                }
              }
            }
      };
      yield return new productDescrEx() {
        course = CourseIds.Russian,
        courseId = cnt++,
        title = "Курсы русского B1",
        //_grammarLevels = new int[] { 2 },
        _productId = "Russian_B1",
        _locs = new Langs[] { Langs.cs_cz },
        setProductParts = new productPartEx[] {
              new productPartEx() {
                title = "Курсы русского B1",
                levs = new productLessInterval[] {  
                  new productLessInterval() { levIdx = 2 }  
                }
              }
            }
      };
      yield return new productDescrEx() {
        course = CourseIds.Russian,
        courseId = cnt++,
        title = "Курсы русского B2",
        //_grammarLevels = new int[] { 2 },
        _productId = "Russian_B2",
        _locs = new Langs[] { Langs.cs_cz },
        setProductParts = new productPartEx[] {
              new productPartEx() {
                title = "Курсы русского B2",
                levs = new productLessInterval[] {  
                  new productLessInterval() { levIdx = 3 }  
                }
              }
            }
      };
      yield return new productDescrEx() {
        course = CourseIds.Italian,
        courseId = cnt++,
        title = "Corso di Italiano A1",
        _grammarLevels = new int[] { 0 },
        _productId = "Italian_A1",
        _locs = new Langs[] { Langs.cs_cz },
        setProductParts = new productPartEx[] {
              new productPartEx() {
                title = "Corso di Italiano A1",
                levs = new productLessInterval[] {  
                  new productLessInterval() { levIdx = 0 }  
                }
              }
            }
      };
      yield return new productDescrEx() {
        course = CourseIds.Spanish,
        courseId = cnt++,
        title = "Curso de español A1",
        _grammarLevels = new int[] { 0 },
        _productId = "Spanish_A1",
        _locs = new Langs[] { Langs.cs_cz },
        setProductParts = new productPartEx[] {
              new productPartEx() {
                title = "Curso de español A1",
                levs = new productLessInterval[] {  
                  new productLessInterval() { levIdx = 0 }  
                }
              }
            }
      };
      yield return new productDescrEx() {
        course = CourseIds.Spanish,
        courseId = cnt++,
        title = "Curso de español A2",
        _grammarLevels = new int[] { 1 },
        _productId = "Spanish_A2",
        _locs = new Langs[] { Langs.cs_cz },
        setProductParts = new productPartEx[] {
              new productPartEx() {
                title = "Curso de español A2",
                levs = new productLessInterval[] {  
                  new productLessInterval() { levIdx = 1 }  
                }
              }
            }
      };
      yield return new productDescrEx() {
        course = CourseIds.Spanish,
        courseId = cnt++,
        title = "Curso de español B1",
        _grammarLevels = new int[] { 2 },
        _productId = "Spanish_B1",
        _locs = new Langs[] { Langs.cs_cz },
        setProductParts = new productPartEx[] {
              new productPartEx() {
                title = "Curso de español B1",
                levs = new productLessInterval[] {  
                  new productLessInterval() { levIdx = 2 }  
                }
              }
            }
      };
      yield return new productDescrEx() {
        course = CourseIds.French,
        courseId = cnt++,
        title = "Cours de français A1",
        _grammarLevels = new int[] { 0 },
        _productId = "French_A1",
        _locs = new Langs[] { Langs.cs_cz },
        setProductParts = new productPartEx[] {
              new productPartEx() {
                title = "Cours de français A1",
                levs = new productLessInterval[] {  
                  new productLessInterval() { levIdx = 0 }  
                }
              }
            }
      };
      yield return new productDescrEx() {
        course = CourseIds.French,
        courseId = cnt++,
        title = "Cours de français A2",
        _grammarLevels = new int[] { 1 },
        _productId = "French_A2",
        _locs = new Langs[] { Langs.cs_cz },
        setProductParts = new productPartEx[] {
              new productPartEx() {
                title = "Cours de français A2",
                levs = new productLessInterval[] {  
                  new productLessInterval() { levIdx = 1 }  
                }
              }
            }
      };
      yield return new productDescrEx() {
        course = CourseIds.French,
        courseId = cnt++,
        title = "Cours de français B1",
        _grammarLevels = new int[] { 2 },
        _productId = "French_B1",
        _locs = new Langs[] { Langs.cs_cz },
        setProductParts = new productPartEx[] {
              new productPartEx() {
                title = "Cours de français B1",
                levs = new productLessInterval[] {  
                  new productLessInterval() { levIdx = 2 }  
                }
              }
            }
      };
    }
  }

}