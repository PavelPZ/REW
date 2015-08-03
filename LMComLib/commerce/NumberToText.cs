using System;
using System.Collections.Generic;
using System.Text;

namespace LMComLib {
  public static class NumberToText {

    public static string fncNum2Text(int iNumber) {
      int Miliony = 0;
      int StoTisice = 0;
      int DesetiTisice = 0;
      int Tisice = 0;
      int Stovky = 0;
      int Desitky = 0;
      int Zbytek = 0;
      string result = "";

      if (iNumber > 9999999) throw new Exception("Size overflow");

      string[] PrevodMiliony = new string[10] { "", "jedenmilion", "dvamiliony", "třimiliony", "čtyřimiliony", "pětmilionů", "šestmilionů", "sedmmilionů", "osmmilionů", "devětmilionů" };
      string[] Prevod100Tisice = new string[10] { "", "sto", "dvěstě", "třista", "čtyřista", "pětset", "šestset", "sedmset", "osmset", "devětset" };
      string[] PrevodDesitky = new string[10] { "", "", "dvacet", "třicet", "čtyřicet", "padesát", "šedesát", "sedmdesát", "osmdesát", "devadesát" };

      Miliony = iNumber / 1000000;
      if (Miliony >= 1) {
        Zbytek = iNumber % 1000000;
        result += PrevodMiliony[Miliony];
      } else {
        Zbytek = iNumber;
      }

      StoTisice = Zbytek / 100000;
      if (StoTisice >= 1) {
        Zbytek = iNumber % 100000;
        result += Prevod100Tisice[StoTisice];
      } else {
        Zbytek = iNumber % 1000000;
      }


      DesetiTisice = Zbytek / 10000;
      if (DesetiTisice > 1) {
        Zbytek = iNumber % 10000;
        result += PrevodDesitky[DesetiTisice];
      } else {
        Zbytek = iNumber % 100000;
      }

      Tisice = Zbytek / 1000;
      if (Tisice > 0) {
        Zbytek = Zbytek % 1000;
        result += Prevod(1000, Tisice);
      } else {
        if (DesetiTisice > 0 || StoTisice > 0) {
          result = result.ToString() + "tisíc";
        }
      }

      Stovky = Zbytek / 100;
      if (Stovky > 0) {
        Zbytek = Zbytek % 100;
        result += Prevod(100, Stovky);
      }

      Desitky = Zbytek / 10;
      if (Desitky > 1) {
        Zbytek = Zbytek % 10;
        result += PrevodDesitky[Desitky];
      }

      if (Zbytek > 0) {
        result += Prevod(1, Zbytek);
      }

      return result;
    }

    private static string Prevod(int Rad, int Hodnota) {
      string result = "";
      string[] Jednotky = new string[20] { "", "", "", "", "", "pět", "šest", "sedm", "osm", "devět", "deset", "jedenáct", "dvanáct", "třináct", "čtrnáct", "patnáct", "šestnáct", "sedmnáct", "osmnáct", "devatenáct" };

      if ((Hodnota > 4) & (Hodnota < 20)) {
        result = Jednotky[Hodnota];
      }
      if (Rad == 1000) {
        result = result.ToString() + "tisíc";
        if (Hodnota == 1) result = "jedentisíc";
        if (Hodnota == 2) result = "dvatisíce";
        if (Hodnota == 3) result = "třitisíce";
        if (Hodnota == 4) result = "čtyřitisíce";
      }

      if (Rad == 100) {
        result = result.ToString() + "set";
        if (Hodnota == 1) result = "jednosto";
        if (Hodnota == 2) result = "dvěstě";
        if (Hodnota == 3) result = "třista";
        if (Hodnota == 4) result = "čtyřista";
      }

      if (Rad == 1) {
        if (Hodnota == 1) result = "jedna";
        if (Hodnota == 2) result = "dva";
        if (Hodnota == 3) result = "tři";
        if (Hodnota == 4) result = "čtyři";
      }
      return result;
    }
  }
}
