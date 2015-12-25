module CourseModel {
  export const enum IconIds {
    no = 0,
    a = 1,
    b = 2,
    c = 3,
    d = 4,
    e = 5,
    f = 6,
  }

  export const enum CheckItemTexts {
    yesNo = 0,
    trueFalse = 1,
    no = 2,
  }

  export const enum inlineControlTypes {
    no = 0,
    GapFill = 1,
    GapFill_Correction = 2,
    WordSelection = 3,
    DragTarget = 4,
    img = 5,
    TtsSound = 6,
  }

  export const enum modalSize {
    normal = 0,
    small = 1,
    large = 2,
  }

  export const enum offeringDropDownMode {
    dropDownDiscard = 0,
    dropDownKeep = 1,
    gapFillIgnore = 2,
  }

  export const enum smartOfferingMode {
    gapFill = 0,
    dropDownDiscard = 1,
    dropDownKeep = 2,
    gapFillPassive = 3,
  }

  export const enum inlineElementTypes {
    no = 0,
    gapFill = 1,
    gapFillCorrection = 2,
    wordSelection = 3,
    dropDown = 4,
    img = 5,
    ttsSound = 6,
  }

  export const enum smartElementTypes {
    no = 0,
    gapFill = 1,
    dropDown = 2,
    offering = 3,
    img = 4,
    wordSelection = 5,
  }

  export const enum colors {
    black = 0,
    white = 1,
    primary = 2,
    success = 3,
    info = 4,
    warning = 5,
    danger = 6,
  }

  export const enum listIcon {
    number = 0,
    letter = 1,
    upperLetter = 2,
    angleDoubleRight = 3,
    angleRight = 4,
    arrowCircleORight = 5,
    arrowCircleRight = 6,
    arrowRight = 7,
    caretRight = 8,
    caretSquareORight = 9,
    chevronCircleRight = 10,
    chevronRight = 11,
    handORight = 12,
    longArrowRight = 13,
    play = 14,
    playCircle = 15,
    playCircleO = 16,
    circleONotch = 17,
    cog = 18,
    refresh = 19,
    spinner = 20,
    squareO = 21,
    bullseye = 22,
    asterisk = 23,
    circle = 24,
    circleO = 25,
    circleThin = 26,
    dotCircleO = 27,
  }

  export const enum pairingLeftWidth {
    normal = 0,
    small = 1,
    xsmall = 2,
    large = 3,
  }

  export const enum threeStateBool {
    no = 0,
    true = 1,
    false = 2,
  }

  export const enum ExerciseStatus {
    Unknown = 0,
    Normal = 1,
    Preview = 2,
    Evaluated = 3,
    notAttempted = 4,
    removed = 5,
    PreviewLector = 6,
  }

  export const enum CourseDataFlag {
    needsEval = 1,
    pcCannotEvaluate = 2,
    hasExternalAttachments = 4,
    done = 8,
    passive = 16,
    testImpl_result = 32,
    testImpl = 64,
    testSkillImpl = 128,
    ex = 256,
    skipAbleRoot = 512,
    modImpl = 1024,
    pretestImp = 2048,
    multiTestImpl = 4096,
    testEx = 8192,
    all = 16127,
    blPretestItem = 16384,
    blLesson = 32768,
    blTest = 65536,
    blPretest = 131072,
    blProductHome = 262144,
    blPretestEx = 524288,
  }

  export interface Score {
    s: number;
    ms: number;
    flag: CourseDataFlag;
  }
  export interface Result extends Score {
    tg: string;
  }
  export interface orderingResult extends Result {
    indexes: Array<number>;
  }
  export interface PageUser extends Result {
    i: number;
    st: ExerciseStatus;
    bt: number;
    et: number;
    t: number;
    Results: any;
  }
  export interface PairingResult extends Result {
    Value: Array<number>;
  }
  export interface SingleChoiceResult extends Result {
    Value?: number;
  }
  export interface WordSelectionResult extends SingleChoiceResult {
  }
  export interface audioCaptureResult extends HumanEvalResult {
    audioUrl: string;
    recordedMilisecs: number;
    hRecommendFrom: number;
    hFrom: number;
    hTo: number;
  }
  export interface WritingResult extends HumanEvalResult {
    text: string;
    words: number;
    hMin: number;
    hMax: number;
    hRecommendMin: number;
  }
  export interface GapFillResult extends Result {
    Value: string;
  }
  export interface HumanEvalResult extends Result {
    hPercent: number;
    hEmail: string;
    hLmcomId: number;
    hLevel: string;
    hDate: number;
  }
  export interface CheckItemResult extends Result {
    Value?: boolean;
  }
  export interface evalBtnResult extends Result {
    Value: boolean;
  }
  export interface wordMultiSelectionResult extends Result {
    Values: Array<number>;
  }
  export interface extensionResult extends Result {
    Value: boolean;
  }
  export interface _mediaReplica extends tag {
    iconId: IconIds;
    dlgLeft: boolean;
    actor: string;
  }
  export interface _mediaSent extends tag {
    idx: number;
  }
  export interface _sndPage extends tag {
  }
  export interface _sndFileGroup extends urlTag {
  }
  export interface _sndGroup extends tag {
  }
  export interface _sndInterval extends tag {
  }
  export interface _sndSent extends tag {
    idx: number;
    begPos: number;
    endPos: number;
    text: string;
    actor: string;
  }
  export interface _evalPage extends tag {
    maxScore: number;
    radioGroups: string;
  }
  export interface _evalBtn extends tag {
    btnId: string;
  }
  export interface _evalGroup extends tag {
    isAnd: boolean;
    isExchangeable: boolean;
    evalControlIds: Array<string>;
  }
  export interface tag {
    id: string;
    styleSheet: string;
    srcpos: string;
    Items: Array<tag>;
    class: Array<string>;
  }
  export interface urlTag extends tag {
    mediaUrl: string;
  }
}

module CourseModel {
  export interface ITagState { }
  export interface ITagProps extends React.Props<any> {
    id?: string;
    styleSheet?: string;
    srcpos?: string;
  }
  export interface IEvalControlState extends ITagState { }
  export interface IEvalControlProps extends ITagProps {
    evalGroup?: string;
    scoreWeight?: number;
    evalButtonId?: string;
  }
  export interface IBodyState extends ITagState { }
  export interface IBodyProps extends ITagProps {
    title?: string;
    url?: string;
    instrTitle?: string;
    instrBody?: string;
    seeAlsoStr?: string;
  }
  export interface IHeaderPropState extends ITagState { }
  export interface IHeaderPropProps extends ITagProps {
  }
  export interface IMacroState extends ITagState { }
  export interface IMacroProps extends ITagProps {
  }
  export interface IHumanEvalState extends IEvalControlState { }
  export interface IHumanEvalProps extends IEvalControlProps {
    isPassive?: boolean;
  }
  export interface IEvalButtonState extends IEvalControlState { }
  export interface IEvalButtonProps extends IEvalControlProps {
    scoreAsRatio?: boolean;
  }
  export interface IDropDownState extends IEditState { }
  export interface IDropDownProps extends IEditProps {
    gapFillLike?: boolean;
  }
  export interface IEditState extends IEvalControlState { }
  export interface IEditProps extends IEvalControlProps {
    correctValue?: string;
    widthGroup?: string;
    width?: number;
    offeringId?: string;
    caseSensitive?: boolean;
  }
  export interface IGapFillState extends IEditState { }
  export interface IGapFillProps extends IEditProps {
    hint?: string;
    initValue?: string;
    readOnly?: boolean;
    skipEvaluation?: boolean;
  }
  export interface IRadioButtonState extends IEvalControlState { }
  export interface IRadioButtonProps extends IEvalControlProps {
    correctValue?: boolean;
    initValue?: boolean;
    readOnly?: boolean;
    skipEvaluation?: boolean;
  }
  export interface ICheckLowState extends IEvalControlState { }
  export interface ICheckLowProps extends IEvalControlProps {
    correctValue?: boolean;
    textType?: CheckItemTexts;
    initValue?: threeStateBool;
    readOnly?: boolean;
    skipEvaluation?: boolean;
  }
  export interface ICheckItemState extends ICheckLowState { }
  export interface ICheckItemProps extends ICheckLowProps {
  }
  export interface ICheckBoxState extends ICheckLowState { }
  export interface ICheckBoxProps extends ICheckLowProps {
  }
  export interface IPairingItemState extends ITagState { }
  export interface IPairingItemProps extends ITagProps {
    right?: string;
  }
  export interface IPairingState extends IEvalControlState { }
  export interface IPairingProps extends IEvalControlProps {
    leftRandom?: boolean;
    leftWidth?: pairingLeftWidth;
  }
  export interface ISingleChoiceState extends ITagState { }
  export interface ISingleChoiceProps extends ITagProps {
    readOnly?: boolean;
    skipEvaluation?: boolean;
    scoreWeight?: number;
    evalButtonId?: string;
  }
  export interface IWordSelectionState extends IEvalControlState { }
  export interface IWordSelectionProps extends IEvalControlProps {
    words?: string;
  }
  export interface IWordMultiSelectionState extends IEvalControlState { }
  export interface IWordMultiSelectionProps extends IEvalControlProps {
    words?: string;
  }
  export interface IWordOrderingState extends IEvalControlState { }
  export interface IWordOrderingProps extends IEvalControlProps {
    correctOrder?: string;
  }
  export interface ISentenceOrderingState extends IEvalControlState { }
  export interface ISentenceOrderingProps extends IEvalControlProps {
  }
  export interface ISentenceOrderingItemState extends ITagState { }
  export interface ISentenceOrderingItemProps extends ITagProps {
  }
  export interface IExtensionState extends IEvalControlState { }
  export interface IExtensionProps extends IEvalControlProps {
    data?: string;
    cdata?: string;
  }
  export interface IWritingState extends IHumanEvalState { }
  export interface IWritingProps extends IHumanEvalProps {
    limitRecommend?: number;
    limitMin?: number;
    limitMax?: number;
    numberOfRows?: number;
  }
  export interface IRecordingState extends IHumanEvalState { }
  export interface IRecordingProps extends IHumanEvalProps {
    limitRecommend?: number;
    limitMin?: number;
    limitMax?: number;
    recordInDialog?: boolean;
    dialogHeaderId?: string;
    dialogSize?: modalSize;
    singleAttempt?: boolean;
  }
  export interface IListState extends IMacroState { }
  export interface IListProps extends IMacroProps {
    delim?: string;
    isStriped?: boolean;
    icon?: listIcon;
    color?: colors;
  }
  export interface IListGroupState extends IMacroState { }
  export interface IListGroupProps extends IMacroProps {
    isStriped?: boolean;
  }
  export interface ITwoColumnState extends IMacroState { }
  export interface ITwoColumnProps extends IMacroProps {
  }
  export interface IPanelState extends IMacroState { }
  export interface IPanelProps extends IMacroProps {
  }
  export interface IDummyState extends ITagState { }
  export interface IDummyProps extends ITagProps {
  }
  export interface IOfferingState extends ITagState { }
  export interface IOfferingProps extends ITagProps {
    words?: string;
    mode?: offeringDropDownMode;
    hidden?: boolean;
  }
  export interface IUrlTagState extends ITagState { }
  export interface IUrlTagProps extends ITagProps {
    mediaUrl?: string;
  }
  export interface IMediaTagState extends IUrlTagState { }
  export interface IMediaTagProps extends IUrlTagProps {
    cutUrl?: string;
    subset?: string;
    shareMediaId?: string;
    _sentGroupId?: string;
  }
  export interface IMediaBigMarkState extends IMediaTagState { }
  export interface IMediaBigMarkProps extends IMediaTagProps {
  }
  export interface IMediaPlayerState extends IMediaTagState { }
  export interface IMediaPlayerProps extends IMediaTagProps {
  }
  export interface IMediaVideoState extends IMediaTagState { }
  export interface IMediaVideoProps extends IMediaTagProps {
  }
  export interface IMediaTextState extends IMediaTagState { }
  export interface IMediaTextProps extends IMediaTagProps {
    continueMediaId?: string;
    passive?: boolean;
    isOldToNew?: boolean;
    hidden?: boolean;
  }
  export interface ISndFileState extends IUrlTagState { }
  export interface ISndFileProps extends IUrlTagProps {
    file?: IIncludeProps;
  }
  export interface ICutDialogState extends ISndFileState { }
  export interface ICutDialogProps extends ISndFileProps {
  }
  export interface ICutTextState extends ISndFileState { }
  export interface ICutTextProps extends ISndFileProps {
  }
  export interface IPhraseState extends ITagState { }
  export interface IPhraseProps extends ITagProps {
    begPos?: number;
    endPos?: number;
    idx?: number;
  }
  export interface IReplicaState extends ITagState { }
  export interface IReplicaProps extends ITagProps {
    actorId?: IconIds;
    actorName?: string;
    numberOfPhrases?: number;
  }
  export interface IIncludeState extends ITagState { }
  export interface IIncludeProps extends ITagProps {
    cutUrl?: string;
  }
  export interface IIncludeTextState extends IIncludeState { }
  export interface IIncludeTextProps extends IIncludeProps {
  }
  export interface IIncludeDialogState extends IIncludeState { }
  export interface IIncludeDialogProps extends IIncludeProps {
  }
  export interface IPhraseReplaceState extends ITagState { }
  export interface IPhraseReplaceProps extends ITagProps {
    phraseIdx?: number;
    replicaPhraseIdx?: string;
  }
  export interface IMacroTemplateState extends IMacroState { }
  export interface IMacroTemplateProps extends IMacroProps {
    name?: string;
    cdata?: string;
  }
  export interface IMacroTrueFalseState extends IMacroTemplateState { }
  export interface IMacroTrueFalseProps extends IMacroTemplateProps {
    textId?: CheckItemTexts;
  }
  export interface IMacroSingleChoicesState extends IMacroTemplateState { }
  export interface IMacroSingleChoicesProps extends IMacroTemplateProps {
  }
  export interface IMacroPairingState extends IMacroTemplateState { }
  export interface IMacroPairingProps extends IMacroTemplateProps {
  }
  export interface IMacroTableState extends IMacroTemplateState { }
  export interface IMacroTableProps extends IMacroTemplateProps {
    inlineType?: inlineControlTypes;
  }
  export interface IMacroListWordOrderingState extends IMacroTemplateState { }
  export interface IMacroListWordOrderingProps extends IMacroTemplateProps {
  }
  export interface IMacroListState extends IMacroTemplateState { }
  export interface IMacroListProps extends IMacroTemplateProps {
    inlineType?: inlineControlTypes;
  }
  export interface IMacroIconListState extends IMacroTemplateState { }
  export interface IMacroIconListProps extends IMacroTemplateProps {
    delim?: string;
    isStriped?: boolean;
    icon?: listIcon;
    color?: colors;
  }
  export interface IMacroArticleState extends IMacroTemplateState { }
  export interface IMacroArticleProps extends IMacroTemplateProps {
  }
  export interface IMacroVocabularyState extends IMacroTemplateState { }
  export interface IMacroVocabularyProps extends IMacroTemplateProps {
  }
  export interface IMacroVideoState extends IMacroTemplateState { }
  export interface IMacroVideoProps extends IMacroTemplateProps {
    cutUrl?: string;
    mediaUrl?: string;
    displayStyle?: string;
  }
  export interface IInlineTagState extends IMacroTemplateState { }
  export interface IInlineTagProps extends IMacroTemplateProps {
    inlineType?: inlineElementTypes;
  }
  export interface ISmartTagState extends ITagState { }
  export interface ISmartTagProps extends ITagProps {
    correct?: boolean;
    defaultInlineType?: inlineControlTypes;
  }
  export interface ISmartElementLowState extends IMacroTemplateState { }
  export interface ISmartElementLowProps extends IMacroTemplateProps {
  }
  export interface ISmartElementState extends ISmartElementLowState { }
  export interface ISmartElementProps extends ISmartElementLowProps {
    inlineType?: smartElementTypes;
  }
  export interface ISmartOfferingState extends ISmartElementLowState { }
  export interface ISmartOfferingProps extends ISmartElementLowProps {
    words?: string;
    mode?: smartOfferingMode;
  }
  export interface ISmartPairingState extends ISmartElementLowState { }
  export interface ISmartPairingProps extends ISmartElementLowProps {
    random?: boolean;
    leftWidth?: pairingLeftWidth;
  }
}
