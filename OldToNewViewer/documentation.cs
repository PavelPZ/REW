using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace doc {
  public static class doc {
    public static void doc_() {
      /// vstupem OldToNewViewer.exe je seznam EA souboru (filename, urls, ...), ktere zobrazi 
      /// - v puvodni verzi na www.lm.com 
      /// - v nove verzi.
      /// Seznamy se berou z d:\LMCom\rew\OldToNewData\fileGroups\ a vznikaji v 
      OldToNew.fileGroup.generator();
      /// Seznamy vznikaji prochazenim vsech old souboru a jejich postupnou zatridovanim.
      /// Nejdrive vznika seznam 'passive' (pasivni cviceni), a pak dalsi (zalezi na poradi, do dalsi skupiny se daji dposud nezarazene soubory)

      /// ************* vznik fileGroups seznamu
    }
  }
}
