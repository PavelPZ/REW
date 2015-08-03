using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using LMNetLib;
using System.Globalization;
using System.Configuration;

namespace LMComLib {

  public class SubDomainInfo {
    public SubDomains SubSite;
    public string Host;
    public Langs Lang;
    public CurrencyType Curr;

    public XSupplier Supplier;

    public CultureInfo Culture { get { return culture == null ? culture = urlInfo.cultureInfo(Lang.ToString()) : culture; } } CultureInfo culture;

    public static SubDomainInfo[] Infos = new SubDomainInfo[] {
      new SubDomainInfo() {
        SubSite=SubDomains.com, Host=SubDomainCommon.Hosts[SubDomains.com], Lang=Langs.LMPage_GetLang, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_pl, Host=SubDomainCommon.Hosts[SubDomains.com_pl], Lang=Langs.pl_pl, Curr = CurrencyType.pln, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_cz, Host=SubDomainCommon.Hosts[SubDomains.com_cz], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_tr, Host=SubDomainCommon.Hosts[SubDomains.com_tr], Lang=Langs.tr_tr, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_bg, Host=SubDomainCommon.Hosts[SubDomains.com_bg], Lang=Langs.bg_bg, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_bs, Host=SubDomainCommon.Hosts[SubDomains.com_bs], Lang=Langs.bs, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_lt, Host=SubDomainCommon.Hosts[SubDomains.com_lt], Lang=Langs.lt_lt, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_RuMarket, Host=SubDomainCommon.Hosts[SubDomains.com_RuMarket], Lang=Langs.ru_ru, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_sk, Host=SubDomainCommon.Hosts[SubDomains.com_sk], Lang=Langs.sk_sk, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_vi, Host=SubDomainCommon.Hosts[SubDomains.com_vi], Lang=Langs.vi_vn, Curr = CurrencyType.vnd, Supplier = SubDomain.sup_lm, 
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_LondonBusinessEnglish, Host=SubDomainCommon.Hosts[SubDomains.com_LondonBusinessEnglish], Lang=Langs.zh_cn, Curr = CurrencyType.cny, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Test, Host=SubDomainCommon.Hosts[SubDomains.com_Test], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      //fake domény
      new SubDomainInfo() {
        SubSite=SubDomains.com_Commest, Host=SubDomainCommon.Hosts[SubDomains.com_Commest], Lang=Langs.fr_fr, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_LanguageTraining, Host=SubDomainCommon.Hosts[SubDomains.com_LanguageTraining], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_CactusLanguageTraining, Host=SubDomainCommon.Hosts[SubDomains.com_CactusLanguageTraining], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Spevacek, Host=SubDomainCommon.Hosts[SubDomains.com_Spevacek], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_EducationFirst, Host=SubDomainCommon.Hosts[SubDomains.com_EducationFirst], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_GlobalLT, Host=SubDomainCommon.Hosts[SubDomains.com_GlobalLT], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_MHCBusinessLanguageTraining, Host=SubDomainCommon.Hosts[SubDomains.com_MHCBusinessLanguageTraining], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Linguarama, Host=SubDomainCommon.Hosts[SubDomains.com_Linguarama], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_LanguageDirect, Host=SubDomainCommon.Hosts[SubDomains.com_LanguageDirect], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Eurospeak, Host=SubDomainCommon.Hosts[SubDomains.com_Eurospeak], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Lingua, Host=SubDomainCommon.Hosts[SubDomains.com_Lingua], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_LanguageTrainers, Host=SubDomainCommon.Hosts[SubDomains.com_LanguageTrainers], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_InternationalHouseBarcelona, Host=SubDomainCommon.Hosts[SubDomains.com_InternationalHouseBarcelona], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Netlanguages, Host=SubDomainCommon.Hosts[SubDomains.com_Netlanguages], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_InternationalHouseLondon, Host=SubDomainCommon.Hosts[SubDomains.com_InternationalHouseLondon], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_InlinguaMuenchen, Host=SubDomainCommon.Hosts[SubDomains.com_InlinguaMuenchen], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_NovyiDisk, Host=SubDomainCommon.Hosts[SubDomains.com_NovyiDisk], Lang=Langs.ru_ru, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Lingea, Host=SubDomainCommon.Hosts[SubDomains.com_Lingea], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Skrivanek, Host=SubDomainCommon.Hosts[SubDomains.com_Skrivanek], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_NacionalinisSvietimoCentras, Host=SubDomainCommon.Hosts[SubDomains.com_NacionalinisSvietimoCentras], Lang=Langs.lt_lt, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_UnitedTeachers, Host=SubDomainCommon.Hosts[SubDomains.com_UnitedTeachers], Lang=Langs.pl_pl, Curr = CurrencyType.pln, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_SageAcademyOnline, Host=SubDomainCommon.Hosts[SubDomains.com_SageAcademyOnline], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_InternationalLanguageSchool, Host=SubDomainCommon.Hosts[SubDomains.com_InternationalLanguageSchool], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_AvanquestGermany, Host=SubDomainCommon.Hosts[SubDomains.com_AvanquestGermany], Lang=Langs.de_de, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_EuroTalk, Host=SubDomainCommon.Hosts[SubDomains.com_EuroTalk], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Agemsoft, Host=SubDomainCommon.Hosts[SubDomains.com_Agemsoft], Lang=Langs.sk_sk, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Grafia, Host=SubDomainCommon.Hosts[SubDomains.com_Grafia], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Pragoeduca, Host=SubDomainCommon.Hosts[SubDomains.com_Pragoeduca], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_AvanquestFrance, Host=SubDomainCommon.Hosts[SubDomains.com_AvanquestFrance], Lang=Langs.fr_fr, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_AvanquestUK, Host=SubDomainCommon.Hosts[SubDomains.com_AvanquestUK], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Inlingua, Host=SubDomainCommon.Hosts[SubDomains.com_Inlingua], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Oxygen, Host=SubDomainCommon.Hosts[SubDomains.com_Oxygen], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Tutor, Host=SubDomainCommon.Hosts[SubDomains.com_Tutor], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Megalanguage, Host=SubDomainCommon.Hosts[SubDomains.com_Megalanguage], Lang=Langs.ru_ru, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Anchortrain, Host=SubDomainCommon.Hosts[SubDomains.com_Anchortrain], Lang=Langs.ru_ru, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_MCLanguages, Host=SubDomainCommon.Hosts[SubDomains.com_MCLanguages], Lang=Langs.ru_ru, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_BKCInternationalHouse, Host=SubDomainCommon.Hosts[SubDomains.com_BKCInternationalHouse], Lang=Langs.ru_ru, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_GlobusInt, Host=SubDomainCommon.Hosts[SubDomains.com_GlobusInt], Lang=Langs.ru_ru, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_SpeakUP, Host=SubDomainCommon.Hosts[SubDomains.com_SpeakUP], Lang=Langs.uk_ua, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Adrian, Host=SubDomainCommon.Hosts[SubDomains.com_Adrian], Lang=Langs.uk_ua, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_SpeakPlus, Host=SubDomainCommon.Hosts[SubDomains.com_SpeakPlus], Lang=Langs.ru_ru, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_MasterKlass, Host=SubDomainCommon.Hosts[SubDomains.com_MasterKlass], Lang=Langs.ru_ru, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_PrimeSchool, Host=SubDomainCommon.Hosts[SubDomains.com_PrimeSchool], Lang=Langs.ru_ru, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_LinguaConsult, Host=SubDomainCommon.Hosts[SubDomains.com_LinguaConsult], Lang=Langs.ru_ru, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_AccentCenter, Host=SubDomainCommon.Hosts[SubDomains.com_AccentCenter], Lang=Langs.ru_ru, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_CDCInterTraining, Host=SubDomainCommon.Hosts[SubDomains.com_CDCInterTraining], Lang=Langs.ru_ru, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_GeneralLinguistic, Host=SubDomainCommon.Hosts[SubDomains.com_GeneralLinguistic], Lang=Langs.ru_ru, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_CREF, Host=SubDomainCommon.Hosts[SubDomains.com_CREF], Lang=Langs.ru_ru, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Alibra, Host=SubDomainCommon.Hosts[SubDomains.com_Alibra], Lang=Langs.ru_ru, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_SpeakUPRu, Host=SubDomainCommon.Hosts[SubDomains.com_SpeakUPRu], Lang=Langs.ru_ru, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_MichaHesseFremdsprachenunterricht, Host=SubDomainCommon.Hosts[SubDomains.com_MichaHesseFremdsprachenunterricht], Lang=Langs.de_de, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_BoaLingua, Host=SubDomainCommon.Hosts[SubDomains.com_BoaLingua], Lang=Langs.de_de, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Sprachschule4U, Host=SubDomainCommon.Hosts[SubDomains.com_Sprachschule4U], Lang=Langs.de_de, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_GLSSprachenzentrum, Host=SubDomainCommon.Hosts[SubDomains.com_GLSSprachenzentrum], Lang=Langs.de_de, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_LINGUAFRANCASprachschule, Host=SubDomainCommon.Hosts[SubDomains.com_LINGUAFRANCASprachschule], Lang=Langs.de_de, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Dialogica, Host=SubDomainCommon.Hosts[SubDomains.com_Dialogica], Lang=Langs.de_de, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_WallStreetInstitute, Host=SubDomainCommon.Hosts[SubDomains.com_WallStreetInstitute], Lang=Langs.de_de, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_CarlDuisberg, Host=SubDomainCommon.Hosts[SubDomains.com_CarlDuisberg], Lang=Langs.de_de, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_idiom, Host=SubDomainCommon.Hosts[SubDomains.com_idiom], Lang=Langs.de_de, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Sprachcoach, Host=SubDomainCommon.Hosts[SubDomains.com_Sprachcoach], Lang=Langs.de_de, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_AcademiaLuzern, Host=SubDomainCommon.Hosts[SubDomains.com_AcademiaLuzern], Lang=Langs.de_de, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_HBSSprachschule, Host=SubDomainCommon.Hosts[SubDomains.com_HBSSprachschule], Lang=Langs.de_de, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_SprachschuleSchneider, Host=SubDomainCommon.Hosts[SubDomains.com_SprachschuleSchneider], Lang=Langs.de_de, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Biku, Host=SubDomainCommon.Hosts[SubDomains.com_Biku], Lang=Langs.de_de, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_NewEnglishTeaching, Host=SubDomainCommon.Hosts[SubDomains.com_NewEnglishTeaching], Lang=Langs.it_it, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_LinguaramaIt, Host=SubDomainCommon.Hosts[SubDomains.com_LinguaramaIt], Lang=Langs.it_it, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_AccademicaBritannica, Host=SubDomainCommon.Hosts[SubDomains.com_AccademicaBritannica], Lang=Langs.it_it, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_EuropeanSchool, Host=SubDomainCommon.Hosts[SubDomains.com_EuropeanSchool], Lang=Langs.it_it, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_LondonLanguageServices, Host=SubDomainCommon.Hosts[SubDomains.com_LondonLanguageServices], Lang=Langs.it_it, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Enforex, Host=SubDomainCommon.Hosts[SubDomains.com_Enforex], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_BCNLanguages, Host=SubDomainCommon.Hosts[SubDomains.com_BCNLanguages], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_FyneFormacion, Host=SubDomainCommon.Hosts[SubDomains.com_FyneFormacion], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_TheBritishHouse, Host=SubDomainCommon.Hosts[SubDomains.com_TheBritishHouse], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_LinguaramaSP, Host=SubDomainCommon.Hosts[SubDomains.com_LinguaramaSP], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_HeadwayLanguageServices, Host=SubDomainCommon.Hosts[SubDomains.com_HeadwayLanguageServices], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Altissia, Host=SubDomainCommon.Hosts[SubDomains.com_Altissia], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_ABCHumboldt, Host=SubDomainCommon.Hosts[SubDomains.com_ABCHumboldt], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_EscuelaParla, Host=SubDomainCommon.Hosts[SubDomains.com_EscuelaParla], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_ICLIdiomas, Host=SubDomainCommon.Hosts[SubDomains.com_ICLIdiomas], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_CambioIdiomas, Host=SubDomainCommon.Hosts[SubDomains.com_CambioIdiomas], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Moose, Host=SubDomainCommon.Hosts[SubDomains.com_Moose], Lang=Langs.pl_pl, Curr = CurrencyType.pln, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_ProfiLingua, Host=SubDomainCommon.Hosts[SubDomains.com_ProfiLingua], Lang=Langs.pl_pl, Curr = CurrencyType.pln, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_BusinessRepublic, Host=SubDomainCommon.Hosts[SubDomains.com_BusinessRepublic], Lang=Langs.pl_pl, Curr = CurrencyType.pln, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_TFLS, Host=SubDomainCommon.Hosts[SubDomains.com_TFLS], Lang=Langs.pl_pl, Curr = CurrencyType.pln, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_IHWorld, Host=SubDomainCommon.Hosts[SubDomains.com_IHWorld], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_KlubschuleMigros, Host=SubDomainCommon.Hosts[SubDomains.com_KlubschuleMigros], Lang=Langs.de_de, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_CLLLanguageCentres, Host=SubDomainCommon.Hosts[SubDomains.com_CLLLanguageCentres], Lang=Langs.fr_fr, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_F9Languages, Host=SubDomainCommon.Hosts[SubDomains.com_F9Languages], Lang=Langs.fr_fr, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_VerbaScripta, Host=SubDomainCommon.Hosts[SubDomains.com_VerbaScripta], Lang=Langs.fr_fr, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_OneTwoSpeak, Host=SubDomainCommon.Hosts[SubDomains.com_OneTwoSpeak], Lang=Langs.fr_fr, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_LanguageConnexion, Host=SubDomainCommon.Hosts[SubDomains.com_LanguageConnexion], Lang=Langs.fr_fr, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Amideast, Host=SubDomainCommon.Hosts[SubDomains.com_Amideast], Lang=Langs.fr_fr, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_ActivLangues, Host=SubDomainCommon.Hosts[SubDomains.com_ActivLangues], Lang=Langs.fr_fr, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_CapitoleFormation, Host=SubDomainCommon.Hosts[SubDomains.com_CapitoleFormation], Lang=Langs.fr_fr, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_ADomlingua, Host=SubDomainCommon.Hosts[SubDomains.com_ADomlingua], Lang=Langs.fr_fr, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_PartnerLanguageSchool, Host=SubDomainCommon.Hosts[SubDomains.com_PartnerLanguageSchool], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_PartnerLanguageSchoolDE, Host=SubDomainCommon.Hosts[SubDomains.com_PartnerLanguageSchoolDE], Lang=Langs.de_de, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_PartnerLanguageSchoolSP, Host=SubDomainCommon.Hosts[SubDomains.com_PartnerLanguageSchoolSP], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_PartnerLanguageSchoolIT, Host=SubDomainCommon.Hosts[SubDomains.com_PartnerLanguageSchoolIT], Lang=Langs.it_it, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_PartnerLanguageSchoolFR, Host=SubDomainCommon.Hosts[SubDomains.com_PartnerLanguageSchoolFR], Lang=Langs.it_it, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_PartnerLanguageSchoolRU, Host=SubDomainCommon.Hosts[SubDomains.com_PartnerLanguageSchoolRU], Lang=Langs.it_it, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_InlinguaFrance, Host=SubDomainCommon.Hosts[SubDomains.com_InlinguaFrance], Lang=Langs.fr_fr, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_InlinguaItaly, Host=SubDomainCommon.Hosts[SubDomains.com_InlinguaItaly], Lang=Langs.it_it, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_InlinguaSpain, Host=SubDomainCommon.Hosts[SubDomains.com_InlinguaSpain], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_InlinguaGermany, Host=SubDomainCommon.Hosts[SubDomains.com_InlinguaGermany], Lang=Langs.de_de, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_SPEEXX, Host=SubDomainCommon.Hosts[SubDomains.com_SPEEXX], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_AnglictinaNepravidelnaSlovesa, Host=SubDomainCommon.Hosts[SubDomains.com_AnglictinaNepravidelnaSlovesa], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_EVC, Host=SubDomainCommon.Hosts[SubDomains.com_EVC], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_OnlineJazyky, Host=SubDomainCommon.Hosts[SubDomains.com_OnlineJazyky], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_InternationalHouseSpain, Host=SubDomainCommon.Hosts[SubDomains.com_InternationalHouseSpain], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_InternationalHouseGermany, Host=SubDomainCommon.Hosts[SubDomains.com_InternationalHouseGermany], Lang=Langs.de_de, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_InternationalHouseItaly, Host=SubDomainCommon.Hosts[SubDomains.com_InternationalHouseItaly], Lang=Langs.it_it, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_InternationalHouseRussia, Host=SubDomainCommon.Hosts[SubDomains.com_InternationalHouseRussia], Lang=Langs.ru_ru, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_InternationalHouseEngland, Host=SubDomainCommon.Hosts[SubDomains.com_InternationalHouseEngland], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Digiakademie, Host=SubDomainCommon.Hosts[SubDomains.com_Digiakademie], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_PRE, Host=SubDomainCommon.Hosts[SubDomains.com_PRE], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_OxfordSchool, Host=SubDomainCommon.Hosts[SubDomains.com_OxfordSchool], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_JJN, Host=SubDomainCommon.Hosts[SubDomains.com_JJN], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Oversea, Host=SubDomainCommon.Hosts[SubDomains.com_Oversea], Lang=Langs.it_it, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_UPAEP, Host=SubDomainCommon.Hosts[SubDomains.com_UPAEP], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Letsolutions, Host=SubDomainCommon.Hosts[SubDomains.com_Letsolutions], Lang=Langs.sk_sk, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Presto, Host=SubDomainCommon.Hosts[SubDomains.com_Presto], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Kontis, Host=SubDomainCommon.Hosts[SubDomains.com_Kontis], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_vnu, Host=SubDomainCommon.Hosts[SubDomains.com_vnu], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_vnuhcm, Host=SubDomainCommon.Hosts[SubDomains.com_vnuhcm], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hueuni, Host=SubDomainCommon.Hosts[SubDomains.com_hueuni], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_tnu, Host=SubDomainCommon.Hosts[SubDomains.com_tnu], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_ud, Host=SubDomainCommon.Hosts[SubDomains.com_ud], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_ctu, Host=SubDomainCommon.Hosts[SubDomains.com_ctu], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_vinhuni, Host=SubDomainCommon.Hosts[SubDomains.com_vinhuni], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_taynguyenuni, Host=SubDomainCommon.Hosts[SubDomains.com_taynguyenuni], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_qnu, Host=SubDomainCommon.Hosts[SubDomains.com_qnu], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hut, Host=SubDomainCommon.Hosts[SubDomains.com_hut], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_dhcd, Host=SubDomainCommon.Hosts[SubDomains.com_dhcd], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_haui, Host=SubDomainCommon.Hosts[SubDomains.com_haui], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_cntp, Host=SubDomainCommon.Hosts[SubDomains.com_cntp], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hup, Host=SubDomainCommon.Hosts[SubDomains.com_hup], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_pvu, Host=SubDomainCommon.Hosts[SubDomains.com_pvu], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_epu, Host=SubDomainCommon.Hosts[SubDomains.com_epu], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_dthu, Host=SubDomainCommon.Hosts[SubDomains.com_dthu], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hanu, Host=SubDomainCommon.Hosts[SubDomains.com_hanu], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_vimaru, Host=SubDomainCommon.Hosts[SubDomains.com_vimaru], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hau, Host=SubDomainCommon.Hosts[SubDomains.com_hau], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hcmuarc, Host=SubDomainCommon.Hosts[SubDomains.com_hcmuarc], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_neu, Host=SubDomainCommon.Hosts[SubDomains.com_neu], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_ueh, Host=SubDomainCommon.Hosts[SubDomains.com_ueh], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_uct, Host=SubDomainCommon.Hosts[SubDomains.com_uct], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hcmutrans, Host=SubDomainCommon.Hosts[SubDomains.com_hcmutrans], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_ulsa, Host=SubDomainCommon.Hosts[SubDomains.com_ulsa], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hlu, Host=SubDomainCommon.Hosts[SubDomains.com_hlu], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hcmulaw, Host=SubDomainCommon.Hosts[SubDomains.com_hcmulaw], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_vfu, Host=SubDomainCommon.Hosts[SubDomains.com_vfu], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_humg, Host=SubDomainCommon.Hosts[SubDomains.com_humg], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_buh, Host=SubDomainCommon.Hosts[SubDomains.com_buh], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_ftu, Host=SubDomainCommon.Hosts[SubDomains.com_ftu], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_ntu, Host=SubDomainCommon.Hosts[SubDomains.com_ntu], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hcmuaf, Host=SubDomainCommon.Hosts[SubDomains.com_hcmuaf], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hua, Host=SubDomainCommon.Hosts[SubDomains.com_hua], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hnue, Host=SubDomainCommon.Hosts[SubDomains.com_hnue], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hpu2, Host=SubDomainCommon.Hosts[SubDomains.com_hpu2], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_utehy, Host=SubDomainCommon.Hosts[SubDomains.com_utehy], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hcmute, Host=SubDomainCommon.Hosts[SubDomains.com_hcmute], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_nute, Host=SubDomainCommon.Hosts[SubDomains.com_nute], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_spktvinh, Host=SubDomainCommon.Hosts[SubDomains.com_spktvinh], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hcmup, Host=SubDomainCommon.Hosts[SubDomains.com_hcmup], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_vcu, Host=SubDomainCommon.Hosts[SubDomains.com_vcu], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_huc, Host=SubDomainCommon.Hosts[SubDomains.com_huc], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hcmuc, Host=SubDomainCommon.Hosts[SubDomains.com_hcmuc], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_nuce, Host=SubDomainCommon.Hosts[SubDomains.com_nuce], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_yds, Host=SubDomainCommon.Hosts[SubDomains.com_yds], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hmu, Host=SubDomainCommon.Hosts[SubDomains.com_hmu], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hpmu, Host=SubDomainCommon.Hosts[SubDomains.com_hpmu], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_dhhp, Host=SubDomainCommon.Hosts[SubDomains.com_dhhp], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_dlu, Host=SubDomainCommon.Hosts[SubDomains.com_dlu], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hou, Host=SubDomainCommon.Hosts[SubDomains.com_hou], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hvtc, Host=SubDomainCommon.Hosts[SubDomains.com_hvtc], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_hvnh, Host=SubDomainCommon.Hosts[SubDomains.com_hvnh], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Simpleway, Host=SubDomainCommon.Hosts[SubDomains.com_Simpleway], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Spolchemie, Host=SubDomainCommon.Hosts[SubDomains.com_Spolchemie], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_OlivegroveGroup, Host=SubDomainCommon.Hosts[SubDomains.com_OlivegroveGroup], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Vox, Host=SubDomainCommon.Hosts[SubDomains.com_Vox], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Chip, Host=SubDomainCommon.Hosts[SubDomains.com_Chip], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_iDnes, Host=SubDomainCommon.Hosts[SubDomains.com_iDnes], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_iHned, Host=SubDomainCommon.Hosts[SubDomains.com_iHned], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_JobsCZ, Host=SubDomainCommon.Hosts[SubDomains.com_JobsCZ], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Lidovky, Host=SubDomainCommon.Hosts[SubDomains.com_Lidovky], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_SkodaAuto, Host=SubDomainCommon.Hosts[SubDomains.com_SkodaAuto], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_SPrace, Host=SubDomainCommon.Hosts[SubDomains.com_SPrace], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_UceniOnline, Host=SubDomainCommon.Hosts[SubDomains.com_UceniOnline], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_VSEM, Host=SubDomainCommon.Hosts[SubDomains.com_VSEM], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_PCHelp, Host=SubDomainCommon.Hosts[SubDomains.com_PCHelp], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Manpower, Host=SubDomainCommon.Hosts[SubDomains.com_Manpower], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_HofmannPersonal, Host=SubDomainCommon.Hosts[SubDomains.com_HofmannPersonal], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_CeskyTrhPrace, Host=SubDomainCommon.Hosts[SubDomains.com_CeskyTrhPrace], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_PracaSMESK, Host=SubDomainCommon.Hosts[SubDomains.com_PracaSMESK], Lang=Langs.sk_sk, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_StartPeople, Host=SubDomainCommon.Hosts[SubDomains.com_StartPeople], Lang=Langs.sk_sk, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_ProfesiaSK, Host=SubDomainCommon.Hosts[SubDomains.com_ProfesiaSK], Lang=Langs.sk_sk, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_KarieraSK, Host=SubDomainCommon.Hosts[SubDomains.com_KarieraSK], Lang=Langs.sk_sk, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_PracaKarieraSK, Host=SubDomainCommon.Hosts[SubDomains.com_PracaKarieraSK], Lang=Langs.sk_sk, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_GraftonSK, Host=SubDomainCommon.Hosts[SubDomains.com_GraftonSK], Lang=Langs.sk_sk, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_TopjobsSK, Host=SubDomainCommon.Hosts[SubDomains.com_TopjobsSK], Lang=Langs.sk_sk, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_MonsterSK, Host=SubDomainCommon.Hosts[SubDomains.com_MonsterSK], Lang=Langs.sk_sk, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_ProstaffSK, Host=SubDomainCommon.Hosts[SubDomains.com_ProstaffSK], Lang=Langs.sk_sk, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_MojaPracaSK, Host=SubDomainCommon.Hosts[SubDomains.com_MojaPracaSK], Lang=Langs.sk_sk, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_GraftonCZ, Host=SubDomainCommon.Hosts[SubDomains.com_GraftonCZ], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_MonsterCZ, Host=SubDomainCommon.Hosts[SubDomains.com_MonsterCZ], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_ProfesiaCZ, Host=SubDomainCommon.Hosts[SubDomains.com_ProfesiaCZ], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Profeskontakt, Host=SubDomainCommon.Hosts[SubDomains.com_Profeskontakt], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Anex, Host=SubDomainCommon.Hosts[SubDomains.com_Anex], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_RobertHalf, Host=SubDomainCommon.Hosts[SubDomains.com_RobertHalf], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_HorizonsLanguageJobs, Host=SubDomainCommon.Hosts[SubDomains.com_HorizonsLanguageJobs], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Pragma, Host=SubDomainCommon.Hosts[SubDomains.com_Pragma], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_SudentAgency, Host=SubDomainCommon.Hosts[SubDomains.com_SudentAgency], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_AktualneCZ, Host=SubDomainCommon.Hosts[SubDomains.com_AktualneCZ], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_LMC, Host=SubDomainCommon.Hosts[SubDomains.com_LMC], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_CNPIEC, Host=SubDomainCommon.Hosts[SubDomains.com_CNPIEC], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_EduCloud, Host=SubDomainCommon.Hosts[SubDomains.com_EduCloud], Lang=Langs.sk_sk, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo1, Host=SubDomainCommon.Hosts[SubDomains.com_Demo1], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo2, Host=SubDomainCommon.Hosts[SubDomains.com_Demo2], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo3, Host=SubDomainCommon.Hosts[SubDomains.com_Demo3], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo4, Host=SubDomainCommon.Hosts[SubDomains.com_Demo4], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo5, Host=SubDomainCommon.Hosts[SubDomains.com_Demo5], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo6, Host=SubDomainCommon.Hosts[SubDomains.com_Demo6], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo7, Host=SubDomainCommon.Hosts[SubDomains.com_Demo7], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo8, Host=SubDomainCommon.Hosts[SubDomains.com_Demo8], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo9, Host=SubDomainCommon.Hosts[SubDomains.com_Demo9], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo10, Host=SubDomainCommon.Hosts[SubDomains.com_Demo10], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo11, Host=SubDomainCommon.Hosts[SubDomains.com_Demo11], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo12, Host=SubDomainCommon.Hosts[SubDomains.com_Demo12], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo13, Host=SubDomainCommon.Hosts[SubDomains.com_Demo13], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo14, Host=SubDomainCommon.Hosts[SubDomains.com_Demo14], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo15, Host=SubDomainCommon.Hosts[SubDomains.com_Demo15], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo16, Host=SubDomainCommon.Hosts[SubDomains.com_Demo16], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo17, Host=SubDomainCommon.Hosts[SubDomains.com_Demo17], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo18, Host=SubDomainCommon.Hosts[SubDomains.com_Demo18], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo19, Host=SubDomainCommon.Hosts[SubDomains.com_Demo19], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo20, Host=SubDomainCommon.Hosts[SubDomains.com_Demo20], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo21, Host=SubDomainCommon.Hosts[SubDomains.com_Demo21], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo22, Host=SubDomainCommon.Hosts[SubDomains.com_Demo22], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo23, Host=SubDomainCommon.Hosts[SubDomains.com_Demo23], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo24, Host=SubDomainCommon.Hosts[SubDomains.com_Demo24], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo25, Host=SubDomainCommon.Hosts[SubDomains.com_Demo25], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo26, Host=SubDomainCommon.Hosts[SubDomains.com_Demo26], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo27, Host=SubDomainCommon.Hosts[SubDomains.com_Demo27], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo28, Host=SubDomainCommon.Hosts[SubDomains.com_Demo28], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo29, Host=SubDomainCommon.Hosts[SubDomains.com_Demo29], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo30, Host=SubDomainCommon.Hosts[SubDomains.com_Demo30], Lang=Langs.cs_cz, Curr = CurrencyType.csk, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo31, Host=SubDomainCommon.Hosts[SubDomains.com_Demo31], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo32, Host=SubDomainCommon.Hosts[SubDomains.com_Demo32], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo33, Host=SubDomainCommon.Hosts[SubDomains.com_Demo33], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo34, Host=SubDomainCommon.Hosts[SubDomains.com_Demo34], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo35, Host=SubDomainCommon.Hosts[SubDomains.com_Demo35], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo36, Host=SubDomainCommon.Hosts[SubDomains.com_Demo36], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo37, Host=SubDomainCommon.Hosts[SubDomains.com_Demo37], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo38, Host=SubDomainCommon.Hosts[SubDomains.com_Demo38], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo39, Host=SubDomainCommon.Hosts[SubDomains.com_Demo39], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo40, Host=SubDomainCommon.Hosts[SubDomains.com_Demo40], Lang=Langs.en_gb, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo41, Host=SubDomainCommon.Hosts[SubDomains.com_Demo41], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo42, Host=SubDomainCommon.Hosts[SubDomains.com_Demo42], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo43, Host=SubDomainCommon.Hosts[SubDomains.com_Demo43], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo44, Host=SubDomainCommon.Hosts[SubDomains.com_Demo44], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo45, Host=SubDomainCommon.Hosts[SubDomains.com_Demo45], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo46, Host=SubDomainCommon.Hosts[SubDomains.com_Demo46], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo47, Host=SubDomainCommon.Hosts[SubDomains.com_Demo47], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo48, Host=SubDomainCommon.Hosts[SubDomains.com_Demo48], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo49, Host=SubDomainCommon.Hosts[SubDomains.com_Demo49], Lang=Langs.sp_sp, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
      new SubDomainInfo() {
        SubSite=SubDomains.com_Demo50, Host=SubDomainCommon.Hosts[SubDomains.com_Demo50], Lang=Langs.it_it, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      },
    };

    public static SubDomainInfo[] InfosAll = Infos.Concat(
      new SubDomainInfo[] {
      new SubDomainInfo() {
        SubSite=SubDomains.com_vi, Host=SubDomainCommon.Hosts[SubDomains.com_vi], Lang=Langs.vi_vn, Curr = CurrencyType.eur, Supplier = SubDomain.sup_lm
      }}
      ).ToArray();


    /*public static IEnumerable<string> LmComSubdomains() {
      return Infos.Select(i => i.Host);
    }*/
      
    public static Func<Domains, SubDomains, Langs, string> HomeUrl;

    public static SubDomains SubdomainRedirect(SubDomains subSite, Langs guiLang) {
      if (subSite != SubDomains.com) return subSite;
      switch (guiLang) {
        case Langs.cs_cz: return SubDomains.com_cz; //subdomains POUZE s jednou URL adresou
        default: return SubDomains.com;
      }
    }

    public static SubDomains LANGMasterSubDomain(Langs lang) {
      switch (lang) {
        case Langs.cs_cz: return SubDomains.com_cz; //subdomains POUZE s jednou URL adresou
        default: return SubDomains.com;
      }
    }


    public static bool SpecialDownload(SubDomains subSite) {
      switch (subSite) {
        case SubDomains.com:
        case SubDomains.com_cz: return false;
        default: return true;
      }
    }

    public static string LangMenuUrl(SubDomains subSite, Langs menuLang, Langs guiLang) {
      if (menuLang == Langs.cs_cz)
        return HomeUrl(Domains.com, SubDomains.com_cz, Langs.cs_cz);
      if (subSite == SubDomains.com_cz)
        return HomeUrl(Domains.com, SubDomains.com, menuLang);
      if (langMenuUrlLangs.Contains(menuLang))
        if (subSite == SubDomains.com && guiLang == menuLang) return HomeUrl(Domains.com, defaultLangSubdomain(menuLang), menuLang);
        else return HomeUrl(Domains.com, SubDomains.com, menuLang);
      if (langMenuUrlSubsites.Contains(subSite))
        return HomeUrl(Domains.com, SubDomains.com, menuLang);
      if (subSite == SubDomains.com && menuLang == Langs.vi_vn && guiLang == Langs.vi_vn)
        return "http://www.edusoft.com.vn";
      return HomeUrl(Domains.com, subSite, menuLang);
    }
    static SubDomains defaultLangSubdomain(Langs lng) {
      switch (lng) {
        case Langs.cs_cz: return SubDomains.com_cz;
        case Langs.pl_pl: return SubDomains.com_pl;
        case Langs.lt_lt: return SubDomains.com_lt;
        case Langs.ru_ru: return SubDomains.com_RuMarket;
        case Langs.tr_tr: return SubDomains.com_tr;
        case Langs.sk_sk: return SubDomains.com_sk;
        case Langs.bg_bg: return SubDomains.com_bg;
        default: return SubDomains.com;
      }
    }
    static Langs[] langMenuUrlLangs = new Langs[] { Langs.pl_pl, Langs.ru_ru, Langs.tr_tr, Langs.sk_sk, Langs.lt_lt, Langs.bg_bg };
    static SubDomains[] langMenuUrlSubsites = new SubDomains[] { SubDomains.com_pl, SubDomains.com_RuMarket, SubDomains.com_sk, SubDomains.com_tr, SubDomains.com_lt };


    public static string AlternativeProductLinkText(SubDomains subSite, Langs guiLang, ProductCatalogueItem product) {
      string price, url; ET_Localize.MaskTypes mask;
      if (subSite == SubDomains.com && langMenuUrlLangs.Contains(guiLang)) {
        mask = ET_Localize.MaskTypes.AlternativeProductLink_com;
        SubDomains otherSubsite = defaultLangSubdomain(guiLang);
        price = product.com_PriceText(product.com_LowLicence(otherSubsite), otherSubsite);
        url = product.debugUrl(otherSubsite);
      } else if (langMenuUrlSubsites.Contains(subSite)) {
        mask = ET_Localize.MaskTypes.AlternativeProductLink_partner;
        price = product.com_PriceText(product.com_LowLicence(SubDomains.com), SubDomains.com);
        url = product.debugUrl(SubDomains.com);
      } else
        return null;
      return string.Format(ET_Localize.MaskValue(guiLang, mask), url, price);
    }
  }
  public static class SubDomain {

    public static SubDomainInfo subDomainInfo(SubDomains subSite) {
      return SubDomainInfo.InfosAll.First(si => si.SubSite == subSite);
    }

    public static CurrencyType subDomainToCurr(SubDomains subSite) {
      return subDomainInfo(subSite).Curr;
    }

    public static string JavaScript_hostsToComSubdomains(string fnName, string hostGetter) {
      return "function " + fnName + " () { switch (" + hostGetter + ".toLowerCase()) { case 'localhost': return 'com';" +
        SubDomainInfo.InfosAll.Where(it => (int)it.SubSite < (int)SubDomains.com_FakeFirst).Select(it => string.Format("case '{0}': return '{1}';", it.Host, it.SubSite)).Aggregate((r, i) => r + i) +
        "default: return 'com'; } };";
    }

    public static SubDomains hostToComSubdomain(string host) {
      SubDomainInfo inf = SubDomainInfo.Infos.FirstOrDefault(si => si.Host == host);
      return inf != null ? inf.SubSite : SubDomains.com;
    }

    public static string subDomainToHost(SubDomains subSite) {
      return subDomainInfo(subSite).Host;
    }
    public static string subdomainToUrl(SubDomains subSite) {
      return "http://" + subDomainToHost(subSite);
    }

    public static XSupplier sup_lm = new XSupplier() {
      dod1 = "LANGMaster",
    };

  }

  public class PartnersServer {

    public static string DownloadHost(SubDomains subSite, Langs lng) {
      if (lng == Langs.vi_vn) return "down.eduland.vn";
      //if (lng == Langs.vi_vn) return "download.etestme.vn";
      if (subSite == SubDomains.com_LondonBusinessEnglish) return "download.lbenet.com";
      return "download.langmaster.cz";
    }

   
    static void UploadETestMeData(SubDomains subSite, out string login, out string password, out string share) {
      login = null; password = null; share = null;
      share = ConfigurationManager.AppSettings["subDomain.share"];
      if (string.IsNullOrEmpty(share)) { share = null; return; }
      login = ConfigurationManager.AppSettings["subDomain.login"];
      password = ConfigurationManager.AppSettings["subDomain.password"];
    }

    public static string QUnc(string share, string path) {
      return (share == null ? "q:" : share) + path;
    }

    public static void SetConnection(SubDomains subSite, Action<string> act) {
      string login, password, share;
      UploadETestMeData(subSite, out login, out password, out share);
      LMNetLib.ShareThis.SetConnection(share, login, password, () => act(share));
    }

    public static string SupportEMail(SubDomains subSite, string defaultEMail) {
      string email = ConfigurationManager.AppSettings["subDomain.intranet-email"];
      return email == "*" ? defaultEMail : email;
    }

  }

}
