module vyzva {

  export interface IHomePretest {
    run: () => void;
    canRun: boolean;
    btnTitle: string;
    resultLevel: string;
    previewUrl: string;
  }

}