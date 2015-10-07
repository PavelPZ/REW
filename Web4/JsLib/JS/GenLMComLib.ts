module LMComLib {
export enum CookieIds {
  lang = 0,
  LMTicket = 1,
  schools_info = 2,
  lms_licence = 3,
  subsite = 4,
  returnUrl = 5,
  oauth = 6,
  loginEMail = 7,
  loginLogin = 8,
  LMJSTicket = 9,
}

export enum CompRole {
  Keys = 1,
  Products = 2,
  Department = 4,
  Results = 8,
  Publisher = 16,
  HumanEvalManager = 32,
  HumanEvalator = 64,
  Admin = 32768,
  All = 32895,
}

export enum Role {
  Admin = 1,
  Comps = 2,
  All = 255,
}

export enum CourseIds {
  no = 0,
  English = 1,
  German = 2,
  Spanish = 3,
  Italian = 4,
  French = 5,
  Chinese = 6,
  Russian = 7,
  KurzTest = 8,
  Vyspa1 = 9,
  Vyspa2 = 10,
  Vyspa3 = 11,
  Vyspa4 = 12,
  Vyspa5 = 13,
  Vyspa6 = 14,
  Vyspa7 = 15,
  Vyspa8 = 16,
  Vyspa9 = 17,
  Vyspa10 = 18,
  Vyspa11 = 19,
  Vyspa12 = 20,
  Vyspa13 = 21,
  Vyspa = 22,
  NNOUcto = 23,
  ZSAJ61 = 24,
  ZSAJ71 = 25,
  ZSAJ81 = 26,
  ZSAJ91 = 27,
  ZSNJ61 = 28,
  ZSNJ71 = 29,
  ZSNJ81 = 30,
  ZSNJ91 = 31,
  ZSAJ62 = 32,
  ZSAJ72 = 33,
  ZSAJ82 = 34,
  ZSAJ92 = 35,
  ZSNJ62 = 36,
  ZSNJ72 = 37,
  ZSNJ82 = 38,
  ZSNJ92 = 39,
  MVAJtesty = 40,
  MVSPtesty = 41,
  MVFRtesty = 42,
  MVRJtesty = 43,
  MVtesty = 44,
  EuroEnglish = 45,
  RewiseEnglish = 46,
  RewiseGerman = 47,
  RewiseSpanish = 48,
  RewiseItalian = 49,
  RewiseFrench = 50,
  RewiseChinese = 51,
  RewiseRussian = 52,
  Holiday_English = 53,
  ZSAj = 54,
  ZSNj = 55,
  Ucto1 = 56,
  Ucto2 = 57,
  Ucto3 = 58,
  UctoAll = 59,
  SurvEnglish = 60,
  SurvGerman = 61,
  SurvSpanish = 62,
  SurvFrench = 63,
  SurvItalian = 64,
  Ptas = 65,
  Esd = 66,
  Usschpor = 67,
  Ustelef = 68,
  Usprez = 69,
  Usobchjed = 70,
  EnglishBerlitz = 71,
  GermanBerlitz = 72,
  SpanishBerlitz = 73,
  ItalianBerlitz = 74,
  FrenchBerlitz = 75,
  ChineseBerlitz = 76,
  RussianBerlitz = 77,
  AholdDemoAnim = 78,
  AholdDemoVideo = 79,
  IsEduLand_Other = 80,
  IsEduLand_EuroEnglish = 81,
  EnglishE = 82,
  ElementsAndTest = 83,
  eTestMeBig = 90,
  eTestMeSmall = 91,
  eTestMe_EnglishBig = 92,
}

export enum Domains {
  no = 0,
  cz = 1,
  com = 2,
  sz = 3,
  el = 4,
  org = 5,
  sk = 6,
  gopas = 7,
  site = 99,
}

export enum errorId {
  no = 0,
  missingLicence = 1,
  licRead = 2,
  licFormat = 3,
  wrongDemoModules = 4,
  wrongHost = 5,
  wrongSpace = 6,
  noMoodle = 7,
  expiredAll = 8,
  expiredServices = 9,
  notLogged = 10,
  notLoggedTrial = 11,
}

export enum Langs {
  no = 0,
  lang = 1,
  cs_cz = 2,
  en_gb = 3,
  de_de = 4,
  sk_sk = 5,
  fr_fr = 6,
  it_it = 7,
  sp_sp = 8,
  ru_ru = 9,
  vi_vn = 10,
  es_es = 11,
  fi_fi = 12,
  sv_se = 13,
  da_dk = 14,
  nb_no = 15,
  af_za = 16,
  sq_al = 17,
  ar_sa = 18,
  hy_am = 19,
  as_in = 20,
  az_latn_az = 21,
  eu_es = 22,
  bn_in = 23,
  be_by = 24,
  pt_br = 25,
  br_fr = 26,
  bg_bg = 27,
  fr_ca = 28,
  zh_hk = 29,
  ca_es = 30,
  co_fr = 31,
  hr_hr = 32,
  nl_nl = 34,
  en_us = 35,
  et_ee = 36,
  gl_es = 37,
  ka_ge = 38,
  el_gr = 39,
  gu_in = 40,
  ha_latn_ng = 41,
  he_il = 42,
  hi_in = 43,
  hu_hu = 44,
  zh_cn = 45,
  is_is = 46,
  ig_ng = 47,
  id_id = 48,
  ga_ie = 49,
  ja_jp = 50,
  kn_in = 51,
  km_kh = 52,
  ky_kg = 53,
  ko_kr = 54,
  lo_la = 55,
  es_mx = 56,
  lv_lv = 57,
  lt_lt = 58,
  mk_mk = 59,
  ms_my = 60,
  ml_in = 61,
  mt_mt = 62,
  mi_nz = 63,
  mr_in = 64,
  mn_mn = 65,
  ne_np = 66,
  oc_fr = 67,
  ps_af = 68,
  fa_ir = 69,
  pl_pl = 70,
  pt_pt = 71,
  pa_in = 72,
  quz_pe = 73,
  ro_ro = 74,
  sr_latn_cs = 75,
  nso_za = 76,
  si_lk = 77,
  sl_si = 78,
  sw_ke = 79,
  ta_in = 80,
  te_in = 81,
  th_th = 82,
  bo_cn = 83,
  tn_za = 84,
  tr_tr = 85,
  uk_ua = 86,
  ur_pk = 87,
  uz_latn_uz = 88,
  cy_gb = 89,
  xh_za = 90,
  yo_ng = 91,
  zu_za = 92,
  bs = 93,
  en_nz = 94,
  ku_arab = 95,
  LMPage_GetLang = 999,
}

export enum LMSSize {
  no = 0,
  self = 1,
  blend = 2,
}

export enum LMSType {
  no = 0,
  NewEE = 1,
  EE = 2,
  LMCom = 3,
  Moodle = 4,
  SlNewEE = 5,
}

export enum Targets {
  web = 0,
  download = 1,
  scorm = 2,
  phoneGap = 3,
  author = 4,
  no = 127,
}

export enum OtherType {
  no = 0,
  Seznam = 1,
  Facebook = 2,
  Google = 3,
  Moodle = 4,
  Yahoo = 5,
  MyOpenId = 6,
  eTestMeId = 7,
  Microsoft = 8,
  LinkedIn = 9,
  LANGMaster = 10,
  LANGMasterNoEMail = 11,
  scorm = 12,
}

export enum SubDomains {
  no = 0,
  com = 1,
  com_pl = 2,
  com_cz = 3,
  com_RuMarket = 4,
  com_lt = 5,
  com_sk = 6,
  com_vi = 7,
  com_tr = 8,
  com_LondonBusinessEnglish = 9,
  com_Test = 10,
  com_bg = 11,
  com_bs = 12,
  com_FakeFirst = 199,
  com_Commest = 200,
  com_LanguageTraining = 201,
  com_CactusLanguageTraining = 202,
  com_Spevacek = 203,
  com_EducationFirst = 204,
  com_GlobalLT = 205,
  com_MHCBusinessLanguageTraining = 206,
  com_Linguarama = 207,
  com_LanguageDirect = 208,
  com_Eurospeak = 209,
  com_Lingua = 210,
  com_LanguageTrainers = 211,
  com_InternationalHouseBarcelona = 212,
  com_Netlanguages = 213,
  com_InternationalHouseLondon = 214,
  com_InlinguaMuenchen = 215,
  com_NovyiDisk = 216,
  com_Lingea = 217,
  com_Skrivanek = 218,
  com_NacionalinisSvietimoCentras = 219,
  com_UnitedTeachers = 220,
  com_SageAcademyOnline = 221,
  com_InternationalLanguageSchool = 222,
  com_AvanquestGermany = 223,
  com_EuroTalk = 224,
  com_Agemsoft = 225,
  com_Grafia = 226,
  com_Pragoeduca = 227,
  com_AvanquestFrance = 228,
  com_AvanquestUK = 229,
  com_Inlingua = 230,
  com_Oxygen = 231,
  com_Tutor = 232,
  com_Megalanguage = 233,
  com_Anchortrain = 234,
  com_MCLanguages = 235,
  com_BKCInternationalHouse = 236,
  com_GlobusInt = 237,
  com_SpeakUP = 238,
  com_Adrian = 239,
  com_SpeakPlus = 240,
  com_MasterKlass = 241,
  com_PrimeSchool = 242,
  com_LinguaConsult = 243,
  com_AccentCenter = 244,
  com_CDCInterTraining = 245,
  com_GeneralLinguistic = 246,
  com_CREF = 247,
  com_Alibra = 248,
  com_SpeakUPRu = 249,
  com_MichaHesseFremdsprachenunterricht = 250,
  com_BoaLingua = 251,
  com_Sprachschule4U = 252,
  com_GLSSprachenzentrum = 253,
  com_LINGUAFRANCASprachschule = 254,
  com_Dialogica = 255,
  com_WallStreetInstitute = 256,
  com_CarlDuisberg = 257,
  com_idiom = 258,
  com_Sprachcoach = 259,
  com_AcademiaLuzern = 260,
  com_HBSSprachschule = 261,
  com_SprachschuleSchneider = 262,
  com_Biku = 263,
  com_NewEnglishTeaching = 264,
  com_LinguaramaIt = 265,
  com_AccademicaBritannica = 266,
  com_EuropeanSchool = 267,
  com_LondonLanguageServices = 268,
  com_Enforex = 269,
  com_BCNLanguages = 270,
  com_FyneFormacion = 271,
  com_TheBritishHouse = 272,
  com_LinguaramaSP = 273,
  com_HeadwayLanguageServices = 274,
  com_Altissia = 275,
  com_ABCHumboldt = 276,
  com_EscuelaParla = 277,
  com_ICLIdiomas = 278,
  com_CambioIdiomas = 279,
  com_Moose = 280,
  com_ProfiLingua = 281,
  com_BusinessRepublic = 282,
  com_TFLS = 283,
  com_IHWorld = 284,
  com_KlubschuleMigros = 285,
  com_CLLLanguageCentres = 286,
  com_F9Languages = 287,
  com_VerbaScripta = 288,
  com_OneTwoSpeak = 289,
  com_LanguageConnexion = 290,
  com_Amideast = 291,
  com_ActivLangues = 292,
  com_CapitoleFormation = 293,
  com_ADomlingua = 294,
  com_PartnerLanguageSchool = 295,
  com_PartnerLanguageSchoolDE = 296,
  com_PartnerLanguageSchoolSP = 297,
  com_PartnerLanguageSchoolIT = 298,
  com_PartnerLanguageSchoolFR = 299,
  com_PartnerLanguageSchoolRU = 300,
  com_InlinguaFrance = 301,
  com_InlinguaItaly = 302,
  com_InlinguaSpain = 303,
  com_InlinguaGermany = 304,
  com_SPEEXX = 305,
  com_AnglictinaNepravidelnaSlovesa = 306,
  com_EVC = 307,
  com_OnlineJazyky = 308,
  com_InternationalHouseSpain = 309,
  com_InternationalHouseGermany = 310,
  com_InternationalHouseItaly = 311,
  com_InternationalHouseRussia = 312,
  com_InternationalHouseEngland = 313,
  com_Digiakademie = 314,
  com_PRE = 315,
  com_OxfordSchool = 316,
  com_JJN = 317,
  com_Oversea = 318,
  com_UPAEP = 319,
  com_Letsolutions = 320,
  com_Presto = 321,
  com_Kontis = 322,
  com_vnu = 323,
  com_vnuhcm = 324,
  com_hueuni = 325,
  com_tnu = 326,
  com_ud = 327,
  com_ctu = 328,
  com_vinhuni = 329,
  com_taynguyenuni = 330,
  com_qnu = 331,
  com_hut = 332,
  com_dhcd = 333,
  com_haui = 334,
  com_cntp = 335,
  com_hup = 336,
  com_pvu = 337,
  com_epu = 338,
  com_dthu = 339,
  com_hanu = 340,
  com_vimaru = 341,
  com_hau = 342,
  com_hcmuarc = 343,
  com_neu = 344,
  com_ueh = 345,
  com_uct = 346,
  com_hcmutrans = 347,
  com_ulsa = 348,
  com_hlu = 349,
  com_hcmulaw = 350,
  com_vfu = 351,
  com_humg = 352,
  com_buh = 353,
  com_ftu = 354,
  com_ntu = 355,
  com_hcmuaf = 356,
  com_hua = 357,
  com_hnue = 358,
  com_hpu2 = 359,
  com_utehy = 360,
  com_hcmute = 361,
  com_nute = 362,
  com_spktvinh = 363,
  com_hcmup = 364,
  com_vcu = 365,
  com_huc = 366,
  com_hcmuc = 367,
  com_nuce = 368,
  com_yds = 369,
  com_hmu = 370,
  com_hpmu = 371,
  com_dhhp = 372,
  com_dlu = 373,
  com_hou = 374,
  com_hvtc = 375,
  com_hvnh = 376,
  com_Simpleway = 377,
  com_Spolchemie = 378,
  com_OlivegroveGroup = 379,
  com_Vox = 380,
  com_Chip = 381,
  com_iDnes = 382,
  com_iHned = 383,
  com_JobsCZ = 384,
  com_Lidovky = 385,
  com_SkodaAuto = 386,
  com_SPrace = 387,
  com_UceniOnline = 388,
  com_VSEM = 389,
  com_PCHelp = 390,
  com_Manpower = 391,
  com_HofmannPersonal = 392,
  com_CeskyTrhPrace = 393,
  com_PracaSMESK = 394,
  com_StartPeople = 395,
  com_ProfesiaSK = 396,
  com_KarieraSK = 397,
  com_PracaKarieraSK = 398,
  com_GraftonSK = 399,
  com_TopjobsSK = 400,
  com_MonsterSK = 401,
  com_ProstaffSK = 402,
  com_MojaPracaSK = 403,
  com_GraftonCZ = 404,
  com_MonsterCZ = 405,
  com_ProfesiaCZ = 406,
  com_Profeskontakt = 407,
  com_Anex = 408,
  com_RobertHalf = 409,
  com_HorizonsLanguageJobs = 410,
  com_Pragma = 411,
  com_SudentAgency = 412,
  com_AktualneCZ = 413,
  com_LMC = 414,
  com_CNPIEC = 415,
  com_EduCloud = 416,
  com_Demo1 = 417,
  com_Demo2 = 418,
  com_Demo3 = 419,
  com_Demo4 = 420,
  com_Demo5 = 421,
  com_Demo6 = 422,
  com_Demo7 = 423,
  com_Demo8 = 424,
  com_Demo9 = 425,
  com_Demo10 = 426,
  com_Demo11 = 427,
  com_Demo12 = 428,
  com_Demo13 = 429,
  com_Demo14 = 430,
  com_Demo15 = 431,
  com_Demo16 = 432,
  com_Demo17 = 433,
  com_Demo18 = 434,
  com_Demo19 = 435,
  com_Demo20 = 436,
  com_Demo21 = 437,
  com_Demo22 = 438,
  com_Demo23 = 439,
  com_Demo24 = 440,
  com_Demo25 = 441,
  com_Demo26 = 442,
  com_Demo27 = 443,
  com_Demo28 = 444,
  com_Demo29 = 445,
  com_Demo30 = 446,
  com_Demo31 = 447,
  com_Demo32 = 448,
  com_Demo33 = 449,
  com_Demo34 = 450,
  com_Demo35 = 451,
  com_Demo36 = 452,
  com_Demo37 = 453,
  com_Demo38 = 454,
  com_Demo39 = 455,
  com_Demo40 = 456,
  com_Demo41 = 457,
  com_Demo42 = 458,
  com_Demo43 = 459,
  com_Demo44 = 460,
  com_Demo45 = 461,
  com_Demo46 = 462,
  com_Demo47 = 463,
  com_Demo48 = 464,
  com_Demo49 = 465,
  com_Demo50 = 466,
}

export enum LineIds {
  no = 0,
  English = 1,
  German = 2,
  Spanish = 3,
  Italian = 4,
  French = 5,
  Chinese = 6,
  Russian = 7,
  Other = 8,
  MSWord = 9,
  MSExcel = 10,
  MSOutlook = 11,
  MSAccess = 12,
  MSPowerPoint = 13,
  MSVista = 14,
  MSOffice = 15,
  MSEcdl = 16,
  Ucto = 17,
  Fotografie = 18,
  BranaVedeni = 19,
  Afrikaans = 20,
  Albanian = 21,
  Arabic = 22,
  Armenian = 23,
  Assamese = 24,
  Azerbaijani = 25,
  Basque = 26,
  Bengali = 27,
  Breton = 28,
  Bulgarian = 29,
  Cantonese = 30,
  Catalan = 31,
  Corsican = 32,
  Croatian = 33,
  Czech = 34,
  Danish = 35,
  Dutch = 36,
  Estonian = 37,
  Finnish = 38,
  Galician = 39,
  Georgian = 40,
  Greek = 41,
  Hausa = 42,
  Hebrew = 43,
  Hungarian = 44,
  Chinese_Mandarin = 45,
  Icelandic = 46,
  Igbo = 47,
  Indonesian = 48,
  Irish = 49,
  Japanese = 50,
  Khmer = 51,
  Kirghiz = 52,
  Korean = 53,
  Latvian = 54,
  Lithuanian = 55,
  Macedonian = 56,
  Malay = 57,
  Malayalam = 58,
  Maltese = 59,
  Maori = 60,
  Mongolian = 61,
  Norwegian = 62,
  Occitan = 63,
  Pashto = 64,
  Persian = 65,
  Polish = 66,
  Portuguese = 67,
  Portuguese_Brazilian = 68,
  Quechua = 69,
  Romanian = 70,
  Serbian = 71,
  Sesotho = 72,
  Slovak = 73,
  Slovenian = 74,
  Swahili = 75,
  Swedish = 76,
  Thai = 77,
  Tibetan = 78,
  Tswana = 79,
  Turkish = 80,
  Ukrainian = 81,
  Urdu = 82,
  Uzbek = 83,
  Vietnamese = 84,
  Xhosa = 85,
  Yoruba = 86,
  Zulu = 87,
  Bossna = 88,
  Belarusian = 89,
  Gujarati = 90,
  Hindi = 91,
  Kannada = 92,
  Tamil = 93,
  Telugu = 94,
  Welsh = 95,
  Farsi = 96,
}

export enum SoundSrcId {
  LM = 0,
  Lingea = 1,
  HowJSay = 2,
  EuroTalk_Male = 3,
  EuroTalk_Female = 4,
  unknown = 2147483646,
  no = 2147483647,
}

export enum ExerciseStatus {
  Unknown = 0,
  Normal = 1,
  Preview = 2,
  Evaluated = 3,
  notAttempted = 4,
  removed = 5,
  PreviewLector = 6,
}

export enum SoundPlayerType {
  no = 0,
  SL = 1,
  HTML5 = 2,
  Flash = 3,
  SlNewEE = 4,
  Silverlight = 5,
}

export enum BooleanEx {
  Unknown = 0,
  True = 1,
  False = 2,
}

export enum VerifyStates {
  ok = 0,
  waiting = 1,
  prepared = 2,
}

export interface Cmd {
  lmcomId: number;
  sessionId: number;
}
export interface CmdEMail {
  From: string;
  To: string;
  Cc: string;
  Subject: string;
  Html: string;
  isForgotPassword: boolean;
  isAtt: boolean;
  attFile: string;
  attContent: string;
  attContentType: string;
  emailId: string;
}
export var CmdEMail_Type = 'LMComLib.CmdEMail';
export function CmdEMail_Create (From: string, To: string, Cc: string, Subject: string, Html: string, isForgotPassword: boolean, isAtt: boolean, attFile: string, attContent: string, attContentType: string, emailId: string): CmdEMail{
  return {From: From, To: To, Cc: Cc, Subject: Subject, Html: Html, isForgotPassword: isForgotPassword, isAtt: isAtt, attFile: attFile, attContent: attContent, attContentType: attContentType, emailId: emailId};
}
export interface LMCookieJS {
  id: number;
  created: number;
  EMail: string;
  Login: string;
  LoginEMail: string;
  Type: OtherType;
  TypeId: string;
  FirstName: string;
  LastName: string;
  OtherData: string;
  Roles: Role;
  VerifyStatus: VerifyStates;
  Company: MyCompanyLow;
}
export var LMCookieJS_Type = 'LMComLib.LMCookieJS';
export function LMCookieJS_Create (id: number, created: number, EMail: string, Login: string, LoginEMail: string, Type: OtherType, TypeId: string, FirstName: string, LastName: string, OtherData: string, Roles: Role, VerifyStatus: VerifyStates, Company: MyCompanyLow): LMCookieJS{
  return {id: id, created: created, EMail: EMail, Login: Login, LoginEMail: LoginEMail, Type: Type, TypeId: TypeId, FirstName: FirstName, LastName: LastName, OtherData: OtherData, Roles: Roles, VerifyStatus: VerifyStatus, Company: Company};
}
export interface MyCompanyLow {
  Title: string;
  Id: number;
  RoleEx: CompUserRole;
  Courses: Array<MyCourse>;
  DepSelected?: number;
}
export interface CompUserRole {
  Role: CompRole;
  HumanEvalatorInfos: Array<HumanEvalInfo>;
}
export interface HumanEvalInfo {
  lang: LineIds;
}
export interface MyCourse {
  ProductId: string;
  Expired: number;
  LicCount: number;
  LicenceKeys: Array<string>;
}
export interface RpcResponse {
  errorText: string;
  error: number;
  result: any;
}
export interface JSTyped {
  Type: string;
}
export interface lmConsoleSend {
  nowStr: string;
  email: string;
  replEmail: string;
  problem: string;
  action: string;
  other: string;
  date: string;
  hasError: boolean;
  now: number;
}
export var LangToLine: LineIds[] = [0,0,34,1,2,73,5,4,3,7,84,3,38,76,35,62,20,21,22,23,24,25,26,27,89,68,28,29,0,30,31,32,33,0,36,0,37,39,40,41,90,42,43,91,44,45,46,47,48,49,50,92,51,52,53,0,0,54,55,56,57,58,59,60,0,61,0,63,64,96,66,67,0,69,70,71,72,0,74,75,93,94,77,78,79,80,81,82,83,95,85,86,87,88];
export var LineToLang: Langs[] = [0,3,4,8,7,6,0,9,0,0,0,0,0,0,0,0,0,0,0,0,16,17,18,19,20,21,22,23,26,27,29,30,31,32,2,14,34,36,12,37,38,39,41,42,44,45,46,47,48,49,50,52,53,54,57,58,59,60,61,62,63,65,15,67,68,69,70,71,25,73,74,75,76,5,78,79,13,82,83,84,85,86,87,88,10,90,91,92,93,0,0,43,0,0,0,0,69];
export var bigLocalizations = [3, 4, 8, 2, 5, 9, 6, 7, 70, 10, 85, 58, 45, 27, 93, 18];
export var LangToEADir = {'2':'comcz','3':'comen','4':'comde','5':'comsk','6':'comfr','7':'comit','8':'comes','9':'comru','10':'comvi','11':'comes','27':'combg','29':'comth','45':'comcn','54':'comko','58':'comlt','70':'compl','82':'comhk','85':'comtr','93':'combs'};
}
