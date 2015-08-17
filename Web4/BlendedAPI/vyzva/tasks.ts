module vyzva {

  //***************** metadata pro spravu vyuky
  //jsou ulozeny pod uzivatelem s emailem '@vyzva-fake-user' a heslem '@vyzva-fake-user'
  export interface ISchoolOrder { //key=ISchoolOrder'
  }

  //***************** metadata, popisujici metakurz
  export enum level {
    A1 = 0, A2 = 1, B1 = 2, B2 = 3
  }

  export interface ILangRepository {
    line: LMComLib.LineIds; //kurz (English, German, French)
    pretest: IPretestRepository; //identifikace pretestu
    levels: Array<ILevelRepository>; //levels, napr. levels[level.A1]
  }

  export interface IPretestRepository {
    levels: Array<CourseMetaNew.SiteMap>; //levels, napr. levels[level.A1]
    entryTest: CourseMetaNew.SiteMap; //vstupni check-test
  }

  export interface ILevelRepository {
    periods: Array<IPeriodRepository>; //etapy vyuky (0..3)
  }

  export interface IPeriodRepository {
    lessons: Array<CourseMetaNew.SiteMap>; //lekce
    checkTest: CourseMetaNew.SiteMap; //kontrolni test
  }

  //*********** user data
  export enum taskStatus {
    notAttempt,
    running,
    finished,
  }

  export interface ILangUser {
    pretest: IPretestUserProxy; //identifikace pretestu
    months: Array<IMonthUserProxy>; //mesice vyuky, napr. months[month.M0] je zari
  }

  export interface IPretestUserProxy {
    status: taskStatus; //stav pruchodu pretestem
    targetLevel: level; //vysledek pretestu pro status=finished
  }

  export interface IMonthUserProxy {
    status: taskStatus; //stav pruchodu mesicem. mesic ma splnen chedkTest => finished
  }

  export class rootTask {
    pretest: any;
  }
  export class IRootTaskUser {

  }
}