class HeaderProp extends Tag<CourseModel.IHeaderPropProps,CourseModel.IHeaderPropState> {
}
class EvalButton extends EvalControl<CourseModel.IEvalButtonProps,CourseModel.IEvalButtonState> {
}
class DropDown extends Edit<CourseModel.IDropDownProps,CourseModel.IDropDownState> {
}
class GapFill extends Edit<CourseModel.IGapFillProps,CourseModel.IGapFillState> {
}
class RadioButton extends EvalControl<CourseModel.IRadioButtonProps,CourseModel.IRadioButtonState> {
}
class CheckLow<P extends CourseModel.ICheckLowProps, S extends CourseModel.ICheckLowState> extends EvalControl<P,S> {
}
class CheckItem extends CheckLow<CourseModel.ICheckItemProps,CourseModel.ICheckItemState> {
}
class CheckBox extends CheckLow<CourseModel.ICheckBoxProps,CourseModel.ICheckBoxState> {
}
class PairingItem extends Tag<CourseModel.IPairingItemProps,CourseModel.IPairingItemState> {
}
class Pairing extends EvalControl<CourseModel.IPairingProps,CourseModel.IPairingState> {
}
class SingleChoice extends Tag<CourseModel.ISingleChoiceProps,CourseModel.ISingleChoiceState> {
}
class WordSelection extends EvalControl<CourseModel.IWordSelectionProps,CourseModel.IWordSelectionState> {
}
class WordMultiSelection extends EvalControl<CourseModel.IWordMultiSelectionProps,CourseModel.IWordMultiSelectionState> {
}
class WordOrdering extends EvalControl<CourseModel.IWordOrderingProps,CourseModel.IWordOrderingState> {
}
class SentenceOrdering extends EvalControl<CourseModel.ISentenceOrderingProps,CourseModel.ISentenceOrderingState> {
}
class SentenceOrderingItem extends Tag<CourseModel.ISentenceOrderingItemProps,CourseModel.ISentenceOrderingItemState> {
}
class Extension extends EvalControl<CourseModel.IExtensionProps,CourseModel.IExtensionState> {
}
class Writing extends HumanEval<CourseModel.IWritingProps,CourseModel.IWritingState> {
}
class Recording extends HumanEval<CourseModel.IRecordingProps,CourseModel.IRecordingState> {
}
class List extends Macro<CourseModel.IListProps,CourseModel.IListState> {
}
class ListGroup extends Macro<CourseModel.IListGroupProps,CourseModel.IListGroupState> {
}
class TwoColumn extends Macro<CourseModel.ITwoColumnProps,CourseModel.ITwoColumnState> {
}
class Panel extends Macro<CourseModel.IPanelProps,CourseModel.IPanelState> {
}
class Dummy extends Tag<CourseModel.IDummyProps,CourseModel.IDummyState> {
}
class Offering extends Tag<CourseModel.IOfferingProps,CourseModel.IOfferingState> {
}
class UrlTag<P extends CourseModel.IUrlTagProps, S extends CourseModel.IUrlTagState> extends Tag<P,S> {
}
class MediaTag<P extends CourseModel.IMediaTagProps, S extends CourseModel.IMediaTagState> extends UrlTag<P,S> {
}
class MediaBigMark extends MediaTag<CourseModel.IMediaBigMarkProps,CourseModel.IMediaBigMarkState> {
}
class MediaPlayer extends MediaTag<CourseModel.IMediaPlayerProps,CourseModel.IMediaPlayerState> {
}
class MediaVideo extends MediaTag<CourseModel.IMediaVideoProps,CourseModel.IMediaVideoState> {
}
class MediaText extends MediaTag<CourseModel.IMediaTextProps,CourseModel.IMediaTextState> {
}
class SndFile<P extends CourseModel.ISndFileProps, S extends CourseModel.ISndFileState> extends UrlTag<P,S> {
}
class CutDialog extends SndFile<CourseModel.ICutDialogProps,CourseModel.ICutDialogState> {
}
class CutText extends SndFile<CourseModel.ICutTextProps,CourseModel.ICutTextState> {
}
class Phrase extends Tag<CourseModel.IPhraseProps,CourseModel.IPhraseState> {
}
class Replica extends Tag<CourseModel.IReplicaProps,CourseModel.IReplicaState> {
}
class Include<P extends CourseModel.IIncludeProps, S extends CourseModel.IIncludeState> extends Tag<P,S> {
}
class IncludeText extends Include<CourseModel.IIncludeTextProps,CourseModel.IIncludeTextState> {
}
class IncludeDialog extends Include<CourseModel.IIncludeDialogProps,CourseModel.IIncludeDialogState> {
}
class PhraseReplace extends Tag<CourseModel.IPhraseReplaceProps,CourseModel.IPhraseReplaceState> {
}
class MacroTemplate<P extends CourseModel.IMacroTemplateProps, S extends CourseModel.IMacroTemplateState> extends Macro<P,S> {
}
class MacroTrueFalse extends MacroTemplate<CourseModel.IMacroTrueFalseProps,CourseModel.IMacroTrueFalseState> {
}
class MacroSingleChoices extends MacroTemplate<CourseModel.IMacroSingleChoicesProps,CourseModel.IMacroSingleChoicesState> {
}
class MacroPairing extends MacroTemplate<CourseModel.IMacroPairingProps,CourseModel.IMacroPairingState> {
}
class MacroTable extends MacroTemplate<CourseModel.IMacroTableProps,CourseModel.IMacroTableState> {
}
class MacroListWordOrdering extends MacroTemplate<CourseModel.IMacroListWordOrderingProps,CourseModel.IMacroListWordOrderingState> {
}
class MacroList extends MacroTemplate<CourseModel.IMacroListProps,CourseModel.IMacroListState> {
}
class MacroIconList extends MacroTemplate<CourseModel.IMacroIconListProps,CourseModel.IMacroIconListState> {
}
class MacroArticle extends MacroTemplate<CourseModel.IMacroArticleProps,CourseModel.IMacroArticleState> {
}
class MacroVocabulary extends MacroTemplate<CourseModel.IMacroVocabularyProps,CourseModel.IMacroVocabularyState> {
}
class MacroVideo extends MacroTemplate<CourseModel.IMacroVideoProps,CourseModel.IMacroVideoState> {
}
class InlineTag extends MacroTemplate<CourseModel.IInlineTagProps,CourseModel.IInlineTagState> {
}
class SmartTag extends Tag<CourseModel.ISmartTagProps,CourseModel.ISmartTagState> {
}
class SmartElementLow<P extends CourseModel.ISmartElementLowProps, S extends CourseModel.ISmartElementLowState> extends MacroTemplate<P,S> {
}
class SmartElement extends SmartElementLow<CourseModel.ISmartElementProps,CourseModel.ISmartElementState> {
}
class SmartOffering extends SmartElementLow<CourseModel.ISmartOfferingProps,CourseModel.ISmartOfferingState> {
}
class SmartPairing extends SmartElementLow<CourseModel.ISmartPairingProps,CourseModel.ISmartPairingState> {
}
