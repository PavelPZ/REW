interface IFreezerStatic {
  new <S>(par: S): IFreezerRoot<S>;
}
declare var Freezer: IFreezerStatic;

interface IFreezerCommon {
  getListener?: any;
  transact?: () => any;
  run?: () => void;
  now?: () => void;
}

interface IFreezerRoot<S> {
  get?: () => S;
  set?: (newItem: S) => IFreezerState<S>; 
  trigger?(actionId: string, ...pars: any[]);
  on?: any;
  off?: any;
}

interface IFreezerState<S> extends IFreezerCommon {
  remove?: (propName: string | string[]) => void;
  set?: (propName: string, newItem: any) => S; //listener of newItem is not preserved
  reset?: (newItem: S) => S; //listener of newItem is preserved
  get?: () => S;
}
interface IFreezerArray<S> extends Array<S>, IFreezerCommon {
  set?: (idx: number, newItem: S) => S;
  prepend?: (data: Array<S>) => void;
  append?: (data: Array<S>) => void;
}