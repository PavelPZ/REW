/// <reference path="../jslib/js/GenLMComLib.ts" />
/// <reference path="../schools/GenSchools.ts" />
module CourseModel {
export enum IconIds {
  no = 0,
  a = 1,
  b = 2,
  c = 3,
  d = 4,
  e = 5,
  f = 6,
}

export enum CheckItemTexts {
  yesNo = 0,
  trueFalse = 1,
  no = 2,
}

export enum inlineControlTypes {
  no = 0,
  GapFill = 1,
  GapFill_Correction = 2,
  WordSelection = 3,
  DragTarget = 4,
  img = 5,
  TtsSound = 6,
}

export enum JSStatus {
  no = 0,
  genericHtml = 1,
  ctrl = 2,
}

export enum CourseDataFlag {
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
}

export enum modalSize {
  normal = 0,
  small = 1,
  large = 2,
}

export enum tgSt {
  jsCtrl = 1,
  cdata = 2,
  csControl = 4,
  isEval = 8,
  isArray = 32,
  noJSONQuote = 64,
  docIgnore = 128,
  xsdIgnore = 256,
  xmlIgnore = 512,
  jsonIgnore = 1024,
  obsolete = 2048,
  xsdHtmlEl = 4096,
  xsdNoMixed = 8192,
  xsdString = 16384,
  xsdNoGlobal = 32768,
  xsdIgnoreTagAttrs = 65536,
  xsdMixed = 131072,
  xsdRequiredAttr = 262144,
  metaJS_browse = 524288,
}

export enum offeringDropDownMode {
  dropDownDiscard = 0,
  dropDownKeep = 1,
  gapFillIgnore = 2,
}

export enum smartOfferingMode {
  gapFill = 0,
  dropDownDiscard = 1,
  dropDownKeep = 2,
  gapFillPassive = 3,
}

export enum inlineElementTypes {
  no = 0,
  gapFill = 1,
  gapFillCorrection = 2,
  wordSelection = 3,
  dropDown = 4,
  img = 5,
  ttsSound = 6,
}

export enum smartElementTypes {
  no = 0,
  gapFill = 1,
  dropDown = 2,
  offering = 3,
  img = 4,
  wordSelection = 5,
}

export enum colors {
  black = 0,
  white = 1,
  primary = 2,
  success = 3,
  info = 4,
  warning = 5,
  danger = 6,
}

export enum listIcon {
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

export enum pairingLeftWidth {
  normal = 0,
  small = 1,
  xsmall = 2,
  large = 3,
}

export enum threeStateBool {
  no = 0,
  true = 1,
  false = 2,
}

export interface tag {
  id: string;
  srcpos: string;
  Items: Array<tag>;
  class: Array<string>;
}
export interface seeAlsoLink {
  url: string;
  title: string;
}
export interface html {
  head: head;
  body: body;
}
export interface head {
  title: string;
  style: string;
}
export interface evalControl extends tag {
  evalGroup: string;
  scoreWeight: number;
  evalButtonId: string;
}
export interface jsonMLMeta {
  rootTagName: string;
  types: { [id:string]: jsClassMeta};
}
export interface jsClassMeta {
  st: tgSt;
  xsdChildElements: string;
  anc: string;
  props: { [id:string]: jsPropMeta};
}
export interface jsPropMeta {
  st: tgSt;
  enumType: string;
  childPropTypes: string;
}
export interface htmlTag extends tag {
  tagName: string;
  attrs: Array<attr>;
}
export interface attr {
  name: string;
  value: string;
}
export interface script extends tag {
  cdata: string;
}
export interface img extends tag {
  src: string;
}
export interface TagStatic {
  isEval: boolean;
  JSStatus: JSStatus;
}
export interface text extends tag {
  title: string;
}
export interface body extends tag {
  sndPage: _sndPage;
  evalPage: _evalPage;
  url: string;
  order: number;
  instrTitle: string;
  externals: string;
  seeAlsoLinks: string;
  oldEaIsPassive: boolean;
  isOldEa: boolean;
  instrBody: string;
  seeAlsoStr: string;
}
export interface headerProp extends tag {
}
export interface macro extends tag {
}
export interface humanEval extends evalControl {
}
export interface Score {
  s: number;
  ms: number;
  flag: CourseDataFlag;
}
export interface ttsSound extends mediaTag {
  text: string;
}
export interface evalButton extends evalControl {
  scoreAsRatio: boolean;
}
export interface dropDown extends edit {
  gapFillLike: boolean;
}
export interface edit extends evalControl {
  correctValue: string;
  widthGroup: string;
  width: number;
  offeringId: string;
  caseSensitive: boolean;
}
export interface gapFill extends edit {
  hint: string;
  initValue: string;
  readOnly: boolean;
  skipEvaluation: boolean;
}
export interface radioButton extends evalControl {
  correctValue: boolean;
  initValue: boolean;
  readOnly: boolean;
  skipEvaluation: boolean;
}
export interface checkLow extends evalControl {
  correctValue: boolean;
  textType: CheckItemTexts;
  initValue: threeStateBool;
  readOnly: boolean;
  skipEvaluation: boolean;
}
export interface checkItem extends checkLow {
}
export interface checkBox extends checkLow {
}
export interface pairingItem extends tag {
  right: string;
}
export interface pairing extends evalControl {
  leftRandom: boolean;
  leftWidth: pairingLeftWidth;
}
export interface singleChoice extends tag {
  readOnly: boolean;
  skipEvaluation: boolean;
  scoreWeight: number;
  evalButtonId: string;
}
export interface wordSelection extends evalControl {
  words: string;
}
export interface wordMultiSelection extends evalControl {
  words: string;
}
export interface wordOrdering extends evalControl {
  correctOrder: string;
}
export interface orderingResult extends Result {
  indexes: Array<number>;
}
export interface sentenceOrdering extends evalControl {
}
export interface sentenceOrderingItem extends tag {
}
export interface extension extends evalControl {
  data: string;
  cdata: string;
}
export interface writing extends humanEval {
  limitRecommend: number;
  limitMin: number;
  limitMax: number;
  numberOfRows: number;
}
export interface recording extends humanEval {
  limitRecommend: number;
  limitMin: number;
  limitMax: number;
  recordInDialog: boolean;
  dialogHeaderId: string;
  dialogSize: modalSize;
  singleAttempt: boolean;
}
export interface list extends macro {
  delim: string;
  isStriped: boolean;
  icon: listIcon;
  color: colors;
}
export interface listGroup extends macro {
  isStriped: boolean;
}
export interface twoColumn extends macro {
}
export interface panel extends macro {
  header: headerProp;
}
export interface node extends tag {
}
export interface offering extends tag {
  words: string;
  mode: offeringDropDownMode;
  hidden: boolean;
}
export interface urlTag extends tag {
}
export interface mediaTag extends urlTag {
  _sentGroupId: string;
}
export interface mediaBigMark extends mediaTag {
}
export interface mediaPlayer extends mediaTag {
}
export interface mediaVideo extends mediaTag {
}
export interface mediaText extends mediaTag {
  passive: boolean;
  isOldToNew: boolean;
  hidden: boolean;
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
export interface _sndFile extends urlTag {
  file: include;
}
export interface cutDialog extends _sndFile {
}
export interface cutText extends _sndFile {
}
export interface phrase extends tag {
  begPos: number;
  endPos: number;
}
export interface replica extends tag {
  actorId: IconIds;
  actorName: string;
  numberOfPhrases: number;
}
export interface include extends tag {
  cutUrl: string;
}
export interface includeText extends include {
}
export interface includeDialog extends include {
}
export interface phraseReplace extends tag {
  phraseIdx: number;
  replicaPhraseIdx: string;
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
export interface macroTemplate extends macro {
  name: string;
  cdata: string;
}
export interface macroTrueFalse extends macroTemplate {
  textId: CheckItemTexts;
}
export interface macroSingleChoices extends macroTemplate {
}
export interface macroPairing extends macroTemplate {
}
export interface macroTable extends macroTemplate {
  inlineType: inlineControlTypes;
}
export interface macroListWordOrdering extends macroTemplate {
}
export interface macroList extends macroTemplate {
  inlineType: inlineControlTypes;
}
export interface macroIconList extends macroTemplate {
  delim: string;
  isStriped: boolean;
  icon: listIcon;
  color: colors;
}
export interface macroArticle extends macroTemplate {
}
export interface macroVocabulary extends macroTemplate {
}
export interface macroVideo extends macroTemplate {
  cutUrl: string;
  mediaUrl: string;
  displayStyle: string;
}
export interface inlineTag extends macroTemplate {
  inlineType: inlineElementTypes;
}
export interface smartTag extends tag {
  correct: boolean;
  defaultInlineType: inlineControlTypes;
}
export interface smartElementLow extends macroTemplate {
}
export interface smartElement extends smartElementLow {
  inlineType: smartElementTypes;
}
export interface smartOffering extends smartElementLow {
  words: string;
  mode: smartOfferingMode;
}
export interface smartPairing extends smartElementLow {
  random: boolean;
  leftWidth: pairingLeftWidth;
}
export interface docTagsMeta extends tag {
  types: Array<docType>;
  props: Array<docProp>;
  enums: Array<docEnum>;
}
export interface docNamed extends tag {
  name: string;
  summary: string;
  cdata: string;
}
export interface docType extends docNamed {
  isHtml: boolean;
  isIgn: boolean;
  descendantsAndSelf: Array<string>;
  myProps: Array<string>;
  xref: string;
}
export interface docEnum extends docNamed {
  xref: string;
  enums: Array<docEnumItem>;
}
export interface docEnumItem extends docNamed {
  xref: string;
}
export interface docProp extends docNamed {
  ownerType: string;
  dataType: string;
  xref: string;
  isHtml: boolean;
}
export interface docDescr extends tag {
}
export interface docExample extends tag {
  todo: boolean;
  codeListing: string;
  codePostListing: string;
  header: headerProp;
  descr: docDescr;
  evalBtn: evalButton;
}
export interface Result extends Score {
  tg: string;
}
export interface PageUser extends Result {
  i: number;
  st: LMComLib.ExerciseStatus;
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
export var meta: CourseModel.jsonMLMeta = <any>{"rootTagName":"tag","types":{"smart-pairing":{"st":6,"anc":"smart-element-low","props":{"random":{"st":64},"left-width":{"enumType":CourseModel.pairingLeftWidth}}},"smart-offering":{"st":6,"anc":"smart-element-low","props":{"words":{},"mode":{"enumType":CourseModel.smartOfferingMode}}},"smart-element":{"st":6,"anc":"smart-element-low","props":{"inline-type":{"enumType":CourseModel.smartElementTypes}}},"smart-element-low":{"anc":"macro-template","props":{}},"macro-article":{"st":6,"anc":"macro-template","props":{}},"macro-vocabulary":{"st":6,"anc":"macro-template","props":{}},"macro-video":{"st":6,"anc":"macro-template","props":{"cut-url":{},"media-url":{},"display-style":{}}},"macro-true-false":{"st":6,"anc":"macro-template","props":{"text-id":{"enumType":CourseModel.CheckItemTexts}}},"macro-single-choices":{"st":6,"anc":"macro-template","props":{}},"macro-list-word-ordering":{"st":6,"anc":"macro-template","props":{}},"macro-pairing":{"st":6,"anc":"macro-template","props":{}},"macro-table":{"st":6,"anc":"macro-template","props":{"inline-type":{"enumType":CourseModel.inlineControlTypes}}},"macro-list":{"st":6,"anc":"macro-template","props":{"inline-type":{"enumType":CourseModel.inlineControlTypes}}},"macro-icon-list":{"st":6,"anc":"macro-template","props":{"delim":{},"is-striped":{"st":64},"icon":{"enumType":CourseModel.listIcon},"color":{"enumType":CourseModel.colors}}},"tag":{"st":384,"props":{"id":{"st":524288},"style-sheet":{"st":1024},"srcpos":{"st":384},"items":{"st":640},"temporary-macro-item":{"st":1600},"class":{"st":160},"class-setter":{"st":1664}}},"smart-tag":{"st":2180,"anc":"tag","props":{"correct":{"st":64},"default-inline-type":{"st":128,"enumType":CourseModel.inlineControlTypes},"smart-text":{"st":1536}}},"node":{"st":4228,"anc":"tag","props":{}},"text":{"st":384,"anc":"tag","props":{"title":{}}},"error":{"st":16512,"anc":"tag","props":{"msg":{}}},"header-prop":{"st":36992,"anc":"tag","props":{}},"eval-control":{"st":392,"anc":"tag","props":{"eval-group":{"st":524288},"score-weight":{"st":524352},"eval-button-id":{"st":524288}}},"body":{"st":131333,"anc":"tag","props":{"snd-page":{"st":640,"childPropTypes":"_snd-page"},"eval-page":{"st":640,"childPropTypes":"_eval-page"},"url":{"st":384},"order":{"st":64},"instr-title":{},"externals":{"st":128},"see-also-links":{},"old-ea-is-passive":{"st":192},"is-old-ea":{"st":192},"see-also":{"st":1664},"title":{"st":1536},"body-style":{"st":1536},"instr-body":{},"see-also-str":{"st":128},"instrs":{"st":1536}}},"eval-button":{"st":13,"anc":"eval-control","props":{"score-as-ratio":{"st":64}}},"check-low":{"st":8,"anc":"eval-control","props":{"correct-value":{"st":64},"text-type":{"enumType":CourseModel.CheckItemTexts},"init-value":{"enumType":CourseModel.threeStateBool},"read-only":{"st":64},"skip-evaluation":{"st":64}}},"check-box":{"st":13,"anc":"check-low","props":{}},"check-item":{"st":4109,"anc":"check-low","props":{}},"offering":{"st":5,"anc":"tag","props":{"words":{},"mode":{"st":524288,"enumType":CourseModel.offeringDropDownMode},"hidden":{"st":524352}}},"radio-button":{"st":4109,"anc":"eval-control","props":{"correct-value":{"st":64},"init-value":{"st":64},"read-only":{"st":64},"skip-evaluation":{"st":64}}},"single-choice":{"st":4,"xsdChildElements":"c0_:['radio-button']","anc":"tag","props":{"read-only":{"st":64},"skip-evaluation":{"st":64},"score-weight":{"st":64},"eval-button-id":{}}},"word-selection":{"st":13,"anc":"eval-control","props":{"words":{}}},"word-multi-selection":{"st":13,"anc":"eval-control","props":{"words":{}}},"word-ordering":{"st":13,"anc":"eval-control","props":{"correct-order":{}}},"sentence-ordering":{"st":13,"xsdChildElements":"c0_:['sentence-ordering-item']","anc":"eval-control","props":{}},"sentence-ordering-item":{"st":4101,"anc":"tag","props":{}},"edit":{"st":392,"anc":"eval-control","props":{"correct-value":{},"width-group":{"st":524288},"width":{"st":524352},"offering-id":{"st":524288},"case-sensitive":{"st":524352}}},"gap-fill":{"st":13,"anc":"edit","props":{"hint":{"st":524288},"init-value":{},"read-only":{"st":524352},"skip-evaluation":{"st":524352}}},"drop-down":{"st":13,"anc":"edit","props":{"gap-fill-like":{"st":524736}}},"pairing":{"st":13,"xsdChildElements":"c0_:['pairing-item']","anc":"eval-control","props":{"left-random":{"st":64},"left-width":{"enumType":CourseModel.pairingLeftWidth}}},"pairing-item":{"st":4101,"anc":"tag","props":{"right":{}}},"human-eval":{"st":392,"anc":"eval-control","props":{}},"writing":{"st":4109,"anc":"human-eval","props":{"limit-recommend":{"st":64},"limit-min":{"st":64},"limit-max":{"st":64},"number-of-rows":{"st":64}}},"recording":{"st":4109,"anc":"human-eval","props":{"limit-recommend":{"st":64},"limit-min":{"st":64},"limit-max":{"st":64},"record-in-dialog":{"st":64},"dialog-header-id":{},"dialog-size":{"enumType":CourseModel.modalSize},"single-attempt":{"st":64}}},"macro":{"st":384,"anc":"tag","props":{}},"list":{"st":4,"xsdChildElements":"c0_:['li']","anc":"macro","props":{"delim":{},"is-striped":{"st":64},"icon":{"enumType":CourseModel.listIcon},"color":{"enumType":CourseModel.colors}}},"list-group":{"st":12293,"anc":"macro","props":{"is-striped":{"st":64}}},"two-column":{"st":4101,"anc":"macro","props":{}},"panel":{"st":131077,"xsdChildElements":"s:[{c01: ['header-prop']},{c0_: ['@flowContent']}]","anc":"macro","props":{"header":{"st":640,"childPropTypes":"header-prop"}}},"_eval-page":{"st":384,"anc":"tag","props":{"max-score":{"st":64},"radio-groups-obj":{"st":1536},"radio-groups":{}}},"_eval-btn":{"st":384,"anc":"tag","props":{"btn-id":{}}},"_eval-group":{"st":384,"anc":"tag","props":{"is-and":{"st":64},"is-exchangeable":{"st":64},"eval-control-ids":{"st":32},"max-score":{"st":1600}}},"_snd-page":{"st":385,"anc":"tag","props":{}},"_snd-file-group":{"st":385,"anc":"url-tag","props":{}},"_snd-group":{"st":385,"anc":"tag","props":{"intervals":{"st":1536},"sf":{"st":1536},"is-passive":{"st":1600}}},"_snd-interval":{"st":384,"anc":"tag","props":{}},"_snd-sent":{"st":384,"anc":"tag","props":{"idx":{"st":64},"beg-pos":{"st":64},"end-pos":{"st":64},"text":{},"actor":{}}},"media-text":{"st":5,"xsdChildElements":"c01: ['include-text','include-dialog','cut-text','cut-dialog']","anc":"media-tag","props":{"continue-media-id":{"st":1024},"passive":{"st":64},"is-old-to-new":{"st":192},"hidden":{"st":64}}},"_media-replica":{"st":389,"anc":"tag","props":{"icon-id":{"enumType":CourseModel.IconIds},"dlg-left":{"st":64},"actor":{}}},"_media-sent":{"st":131461,"anc":"tag","props":{"idx":{"st":64}}},"include":{"st":384,"anc":"tag","props":{"cut-url":{"st":262144}}},"include-text":{"st":98304,"xsdChildElements":"c0_:['phrase-replace']","anc":"include","props":{}},"include-dialog":{"st":98304,"xsdChildElements":"c0_:['phrase-replace']","anc":"include","props":{}},"phrase-replace":{"st":102400,"anc":"tag","props":{"phrase-idx":{"st":64},"replica-phrase-idx":{}}},"_snd-file":{"st":384,"anc":"url-tag","props":{"file":{"st":640,"childPropTypes":"include-text|include-dialog"},"temp-replicas":{"st":1536}}},"cut-dialog":{"st":98308,"xsdChildElements":"s:[{c01:['include-text']},{c0_:['replica']}]","anc":"_snd-file","props":{}},"cut-text":{"st":98308,"xsdChildElements":"c01:[{c01:['include-dialog']},{c0_:['phrase']}]","anc":"_snd-file","props":{}},"phrase":{"st":102405,"anc":"tag","props":{"beg-pos":{"st":64},"end-pos":{"st":64},"idx":{"st":1600},"text":{"st":1536},"actor":{"st":1536}}},"replica":{"st":98309,"xsdChildElements":"c0_:['phrase']","anc":"tag","props":{"actor-id":{"enumType":CourseModel.IconIds},"actor-name":{},"number-of-phrases":{"st":64}}},"url-tag":{"anc":"tag","props":{"media-url":{"st":1024},"any-url":{"st":1536},"is-video":{"st":1600}}},"media-tag":{"st":384,"anc":"url-tag","props":{"cut-url":{"st":1024},"subset":{"st":1024},"share-media-id":{"st":1024},"_sent-group-id":{"st":384},"file":{"st":1664,"childPropTypes":"cut-dialog|cut-text|include-text|include-dialog"}}},"media-big-mark":{"st":5,"xsdChildElements":"c01: ['include-text','include-dialog','cut-text','cut-dialog']","anc":"media-tag","props":{}},"media-player":{"st":5,"xsdChildElements":"c01: ['include-text','include-dialog','cut-text','cut-dialog']","anc":"media-tag","props":{}},"media-video":{"st":5,"xsdChildElements":"c01: ['include-text','include-dialog','cut-text','cut-dialog']","anc":"media-tag","props":{}},"tts-sound":{"st":133,"anc":"media-tag","props":{"text":{}}},"macro-template":{"st":384,"anc":"macro","props":{"name":{},"cdata":{}}},"inline-tag":{"st":16388,"anc":"macro-template","props":{"inline-type":{"enumType":CourseModel.inlineElementTypes}}},"html-tag":{"st":384,"anc":"tag","props":{"tag-name":{},"attrs":{"st":384}}},"script":{"st":386,"anc":"tag","props":{"cdata":{}}},"img":{"st":384,"anc":"tag","props":{"src":{}}},"extension":{"st":143,"anc":"eval-control","props":{"data":{},"cdata":{}}},"doc-example":{"st":133,"xsdChildElements":"s:[{c01: ['header-prop']},{c01: ['doc-descr']},{c0_: ['@flowContent']}]","anc":"tag","props":{"todo":{"st":64},"code-listing":{},"code-post-listing":{},"header":{"st":512,"childPropTypes":"header-prop"},"descr":{"st":512,"childPropTypes":"doc-descr"},"eval-btn":{"st":512,"childPropTypes":"eval-btn"}}},"drag-target":{"st":8,"anc":"edit","props":{}},"doc-named":{"st":384,"anc":"tag","props":{"name":{},"summary":{},"cdata":{}}},"doc-type":{"st":386,"anc":"doc-named","props":{"is-html":{"st":64},"is-ign":{"st":64},"descendants-and-self":{"st":32},"my-props":{"st":32},"xref":{}}},"doc-enum":{"st":386,"anc":"doc-named","props":{"xref":{},"enums":{"st":544,"childPropTypes":"doc-enum-item"}}},"doc-enum-item":{"st":386,"anc":"doc-named","props":{"xref":{}}},"doc-prop":{"st":386,"anc":"doc-named","props":{"owner-type":{},"data-type":{},"xref":{},"is-html":{"st":64}}},"doc-descr":{"st":36992,"anc":"tag","props":{}},"doc-tags-meta":{"st":384,"anc":"tag","props":{"types":{"st":544,"childPropTypes":"doc-type"},"props":{"st":544,"childPropTypes":"doc-prop"},"enums":{"st":544,"childPropTypes":"doc-enum"}}}}};
export var tsmartPairing = 'smart-pairing'; export var tsmartOffering = 'smart-offering'; export var tsmartElement = 'smart-element'; export var tsmartElementLow = 'smart-element-low'; export var tmacroArticle = 'macro-article'; export var tmacroVocabulary = 'macro-vocabulary'; export var tmacroVideo = 'macro-video'; export var tmacroTrueFalse = 'macro-true-false'; export var tmacroSingleChoices = 'macro-single-choices'; export var tmacroListWordOrdering = 'macro-list-word-ordering'; export var tmacroPairing = 'macro-pairing'; export var tmacroTable = 'macro-table'; export var tmacroList = 'macro-list'; export var tmacroIconList = 'macro-icon-list'; export var ttag = 'tag'; export var tsmartTag = 'smart-tag'; export var tnode = 'node'; export var ttext = 'text'; export var terror = 'error'; export var theaderProp = 'header-prop'; export var tevalControl = 'eval-control'; export var tbody = 'body'; export var tevalButton = 'eval-button'; export var tcheckLow = 'check-low'; export var tcheckBox = 'check-box'; export var tcheckItem = 'check-item'; export var toffering = 'offering'; export var tradioButton = 'radio-button'; export var tsingleChoice = 'single-choice'; export var twordSelection = 'word-selection'; export var twordMultiSelection = 'word-multi-selection'; export var twordOrdering = 'word-ordering'; export var tsentenceOrdering = 'sentence-ordering'; export var tsentenceOrderingItem = 'sentence-ordering-item'; export var tedit = 'edit'; export var tgapFill = 'gap-fill'; export var tdropDown = 'drop-down'; export var tpairing = 'pairing'; export var tpairingItem = 'pairing-item'; export var thumanEval = 'human-eval'; export var twriting = 'writing'; export var trecording = 'recording'; export var tmacro = 'macro'; export var tlist = 'list'; export var tlistGroup = 'list-group'; export var ttwoColumn = 'two-column'; export var tpanel = 'panel'; export var t_evalPage = '_eval-page'; export var t_evalBtn = '_eval-btn'; export var t_evalGroup = '_eval-group'; export var t_sndPage = '_snd-page'; export var t_sndFileGroup = '_snd-file-group'; export var t_sndGroup = '_snd-group'; export var t_sndInterval = '_snd-interval'; export var t_sndSent = '_snd-sent'; export var tmediaText = 'media-text'; export var t_mediaReplica = '_media-replica'; export var t_mediaSent = '_media-sent'; export var tinclude = 'include'; export var tincludeText = 'include-text'; export var tincludeDialog = 'include-dialog'; export var tphraseReplace = 'phrase-replace'; export var t_sndFile = '_snd-file'; export var tcutDialog = 'cut-dialog'; export var tcutText = 'cut-text'; export var tphrase = 'phrase'; export var treplica = 'replica'; export var turlTag = 'url-tag'; export var tmediaTag = 'media-tag'; export var tmediaBigMark = 'media-big-mark'; export var tmediaPlayer = 'media-player'; export var tmediaVideo = 'media-video'; export var tttsSound = 'tts-sound'; export var tmacroTemplate = 'macro-template'; export var tinlineTag = 'inline-tag'; export var thtmlTag = 'html-tag'; export var tscript = 'script'; export var timg = 'img'; export var textension = 'extension'; export var tdocExample = 'doc-example'; export var tdragTarget = 'drag-target'; export var tdocNamed = 'doc-named'; export var tdocType = 'doc-type'; export var tdocEnum = 'doc-enum'; export var tdocEnumItem = 'doc-enum-item'; export var tdocProp = 'doc-prop'; export var tdocDescr = 'doc-descr'; export var tdocTagsMeta = 'doc-tags-meta'; 
export var gaffFill_normTable: { [charCode: number]: string; } = {
1040:'A',1072:'a',1042:'B',1074:'b',1045:'E',1077:'e',1050:'K',1082:'k',1052:'M',1084:'m',1053:'H',1085:'h',1054:'O',1086:'o',1056:'P',1088:'p',1057:'C',1089:'c',1058:'T',1090:'t',1059:'Y',1091:'y',1061:'X',1093:'x',1105:'?',161:'!',160:' ',191:'?',241:'?',39:'?',96:'?',180:'?',733:'"',8216:'?',8219:'?',8220:'"',8221:'"',8222:'"',8242:'?',8243:'"'
};
}
