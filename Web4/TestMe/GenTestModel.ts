module testMe {
export enum Status {
  no = 0,
  Started = 1,
  Interrupted = 2,
  SendedToEvaluation = 3,
  EvalAssigned = 4,
  Evaluated = 5,
}

export interface userData {
  started: number;
  ip: string;
  interrupts: Array<interrupt>;
}
export interface multiUserData {
  level: string;
}
export interface skillUserData {
  modUrls: Array<string>;
  started: number;
  finished: number;
  elapsed: number;
}
export interface interrupt {
  beg: number;
  end: number;
  ip: string;
}
export interface result {
  domain: string;
  id: number;
  title: string;
  company: string;
  firstName: string;
  lastName: string;
  eMail: string;
  skills: Array<skillResult>;
  ip: string;
  interrupts: Array<interrupt>;
  score: number;
  flag: CourseModel.CourseDataFlag;
  companyId: number;
  productUrl: string;
  lmcomId: number;
  level: string;
}
export interface skillResult extends CourseModel.Score {
  skill: string;
  title: string;
  scoreWeight: number;
  started: number;
  finished: number;
  elapsed: number;
}
}
