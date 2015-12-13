namespace crs {

  export class edit<P extends IEditProps, S extends IEditState> extends eval<P, S> {
  }
  export interface IEditProps extends IEvalProps {
    correctValue: string;
    widthGroup?: string;
    width?: number;
    offeringId?: string;
    caseSensitive?: boolean;
  }
  interface IEditState extends IEvalState { }

  export class GapFill extends edit<IGapFillProps, IGapFillState> {
  }
  interface IGapFillState extends IEditState { }

  export interface IGapFillProps extends IEditProps{
    hint?: string;
    initValue?: string;
    readOnly?: boolean;
    skipEvaluation?: boolean;
  }

}