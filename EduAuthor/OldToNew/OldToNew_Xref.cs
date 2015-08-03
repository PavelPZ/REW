using LMScormLibDOM;
using System;

namespace LMScormLib {

  public static class OldToNew_Xref {
    static OldToNew_Xref() {
      var all = new object[] {
        //*********** TAGS
        new box(),
        new check_item(),
        new classification(),
        new control(),
        new cross_word(),
        new eval_mark(),
        new gap_fill(),
        new gap_fill_source(),
        new head(),
        new hide_control(),
        new html(),
        new img(),
        new layout_cell(),
        new layout_row(),
        new layout_table(),
        new make_word(),
        new page_instruction(),
        new pairing(),
        new row(),
        new selection(),
        new sentence_ordering(),
        new sound(),
        new sound_dialog(),
        new sound_mark(),
        new sound_sentence(),
        new sound_sentences(),
        new table(),
        new td(),
        new tr(),
        new word_ordering(),
        //*********** PROPS
        new box().id,
        new box().title,
        new box().title_html,
        new box().type,
        new box().width,
        new check_item().correct, //
        new check_item().example, //
        new check_item().group_eval, //
        new check_item().id, //
        new check_item().init_value, //
        new check_item().layout, //
        new check_item().title, //
        new check_item().title_html, //
        new check_item().type, //
        new classification().child_attrs, //
        new classification().group, //
        new classification().id, //
        new classification().title, //
        new classification().title_html, //
        new control().child_attrs,
        new control().force_trans,
        new control().id,
        new control().tag_name,
        new cross_word().col_header, //
        new cross_word().id, //
        new cross_word().row_header, //
        new eval_mark().group, //
        new eval_mark().id, //
        new eval_mark().inline, //
        new eval_mark().visible, //
        new gap_fill().child_attrs, //
        new gap_fill().correct, //
        new gap_fill().drag_source, //
        new gap_fill().eval_mode, //
        new gap_fill().example, //
        new gap_fill().group_eq_width, //
        new gap_fill().group_eval, //
        new gap_fill().group_set, //
        new gap_fill().id, //
        new gap_fill().init_value, //
        new gap_fill().inline, //
        new gap_fill().width, //
        new gap_fill_source().case_sensitive, //
        new gap_fill_source().id, //
        new gap_fill_source().type, //
        new head().layout,
        new hide_control().title, //
        new hide_control().title_html, //
        new html().child_attrs, //
        new html().id,
        new img().align,
        new img().height,
        new img().src,
        new img().symbol,
        new layout_cell().align,
        new layout_cell().child_attrs,
        new layout_cell().flow,
        new layout_cell().id,
        new layout_cell().padding,
        new layout_cell().valign,
        new layout_row().child_attrs,
        new layout_row().flow,
        new layout_row().id,
        new layout_table().child_attrs,
        new layout_table().flow,
        new layout_table().id,
        new make_word().id, //
        new page_instruction().type,
        new pairing().id, //
        new row().align,
        new row().child_attrs,
        new row().example,
        new row().hlite,
        new row().id,
        new row().padding,
        new row().valign,
        new selection().child_attrs, //
        new selection().eval_control, //
        new selection().id, //
        new selection().title, //
        new selection().title_html, //
        new selection().type, //
        new sentence_ordering().id, //
        new sound().child_attrs, //
        new sound().file, //
        new sound().id, //
        new sound().ignore_sound, //
        new sound().layout, //
        new sound_dialog().actor_width, //
        new sound_dialog().child_attrs, //
        new sound_dialog().file, //
        new sound_dialog().id, //
        new sound_dialog().ignore_sound, //
        new sound_dialog().width, //
        new sound_mark().group, //
        new sound_mark().id, //
        new sound_mark().inline, //
        new sound_sentence().file, //
        new sound_sentence().group_sound, //
        new sound_sentence().id, //
        new sound_sentence().layout, //
        new sound_sentence().sentence,
        new sound_sentences().file,
        new sound_sentences().group_sound,
        new sound_sentences().id,
        new sound_sentences().layout,
        new sound_sentences().sentences,
        new table().align,
        new table().border,
        new table().child_attrs,
        new table().col_header,
        new table().flow,
        new table().grid,
        new table().hlite,
        new table().id,
        new table().padding,
        new table().row_header,
        new table().small,
        new table().start_with,
        new table().valign,
        new table().width,
        new td().align,
        new td().colspan,
        new td().hlite,
        new td().padding,
        new td().rowspan,
        new td().valign,
        new tr().align,
        new tr().child_attrs,
        new tr().hlite,
        new word_ordering().group_eval, //
        new word_ordering().id, //
      };
    }
  }

}