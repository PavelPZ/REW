/// <reference path="GenLMComLib.ts" />
/// <reference path="GenRw.ts" />
/// <reference path="GenRew.ts" />
/// <reference path="../JsLib/js/external/ClosureLib.ts" />
/// <reference path="../JsLib/js/external/RJSON.ts" />
/// <reference path="../JsLib/jsd/underscore.d.ts" />
/// <reference path="../JsLib/jsd/knockout.d.ts" />
/// <reference path="../JsLib/js/utils.ts" />
/// <reference path="../JsLib/js/ModelBase.ts" />
/// <reference path="Model.ts" /> 
module RwPersistLocal {

  //****************** InitMyRewise - globalni info o uzivatelove rewise
  export function InitMyRewise(newUserLoc: LMComLib.LineIds, completed: (rd: Rew.MyRewise) => void ) {

  }

  //****************** Read all lines
  export function LocSrcCmd(loc: LMComLib.LineIds, completed: (res: Rew.LocSrc) => void ): void {

  }

  //****************** MyFacts
  export function LoadMyFact(completed: () => void ): void {

  }

  //****************** Add rewise
  export function AddRewiseCmd(line: LMComLib.LineIds, loc: LMComLib.LineIds, completed: () => void ): void {

  }

  //****************** Delete rewise
  export function DelRewiseCmd(line: LMComLib.LineIds, loc: LMComLib.LineIds, completed: () => void ): void {

  }

  //****************** Change Native Lang
  export function SaveMyOptionsCmd(completed: () => void ): void {

  }

  //****************** Add Lesson
  export function AddLessonCmd(bookName: string, lessonId: number, completed: () => void ): void {

  }

  //****************** Delete Lesson
  export function DelLessonCmd(lessonId: number, completed: () => void ): void {

  }

  //****************** Read Lesson
  export function ReadLessonCmd(bookName: string, lessonId: number, completed: (less: Rew.LessonDataSrc) => void ): void {

  }

  //****************** SaveFactCmd
  export function SaveFactCmd(fact: Rew.MyFact, completed: () => void ): void {

  }

}




