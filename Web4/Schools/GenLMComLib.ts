module LMComLib {
  export interface Dict {
    From: Langs;
    To: Langs;
    Code: string;
    Native: boolean;
    wordsFrom: number;
    wordsTo: number;
    meaningFrom: number;
    meaningTo: number;
    exampleFrom: number;
    exampleTo: number;
    transFrom: number;
    transTo: number;
  }
}
