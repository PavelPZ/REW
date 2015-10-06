module metaJS {
export enum xsdPropType {
  Number = 0,
  String = 1,
  Enum = 2,
  Bool = 3,
  Class = 4,
}

export enum xsdPropModifier {
  no = 0,
  Array = 1,
  ArrayArray = 2,
  Dict = 3,
}

export enum xsdInheritsFrom {
  tag = 0,
  eval = 1,
  media = 2,
}

export enum xsdPropConstrains {
  no = 0,
  regex = 1,
  id = 2,
  idref = 3,
  intNumber = 4,
  ncname = 5,
}

export interface xsd {
  types: { [id:string]: xsdType};
  properties: Array<xsdProp>;
  enums: { [id:string]: xsdEnum};
}
export interface xsdLow {
  name: string;
  summary: string;
  descr: string;
  flag: CourseModel.tgSt;
  _newName: string;
}
export interface xsdType extends xsdLow {
  ancestor: string;
  inheritsFrom: xsdInheritsFrom;
  required: boolean;
}
export interface xsdEnum extends xsdLow {
  enumData: Array<xsdEnumItem>;
}
export interface xsdEnumItem extends xsdLow {
  value: number;
}
export interface xsdProp extends xsdLow {
  propOf: string;
  type: xsdPropType;
  modifier: xsdPropModifier;
  clsEnumName: string;
  constrains: xsdPropConstrains;
  regexConstrains: string;
}

export var metaData: xsd = 
{
  "types": {
    "tag": {
      "ancestor": null,
      "inheritsFrom": 0,
      "required": false,
      "name": "tag",
      "summary": "tag",
      "descr": "tag descr",
      "flag": 384,
      "_newName": null
    },
    "eval-control": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "eval-control",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    "html-tag": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "html-tag",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    "script": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "script",
      "summary": null,
      "descr": null,
      "flag": 386,
      "_newName": null
    },
    "img": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "img",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    "text": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "text",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    "body": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "body",
      "summary": null,
      "descr": null,
      "flag": 131333,
      "_newName": null
    },
    "header-prop": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "header-prop",
      "summary": null,
      "descr": null,
      "flag": 36992,
      "_newName": null
    },
    "macro": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "macro",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    "human-eval": {
      "ancestor": "eval-control",
      "inheritsFrom": 1,
      "required": false,
      "name": "human-eval",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    "tts-sound": {
      "ancestor": "media-tag",
      "inheritsFrom": 2,
      "required": false,
      "name": "tts-sound",
      "summary": null,
      "descr": null,
      "flag": 133,
      "_newName": null
    },
    "eval-button": {
      "ancestor": "eval-control",
      "inheritsFrom": 1,
      "required": false,
      "name": "eval-button",
      "summary": null,
      "descr": "@summary tlacitko pro vyhodnoceni jedne skupiny vyhodnotitelnych elementu.\n            @descr ??",
      "flag": 5,
      "_newName": "eval-btn"
    },
    "drop-down": {
      "ancestor": "edit",
      "inheritsFrom": 1,
      "required": false,
      "name": "drop-down",
      "summary": null,
      "descr": null,
      "flag": 5,
      "_newName": null
    },
    "edit": {
      "ancestor": "eval-control",
      "inheritsFrom": 1,
      "required": false,
      "name": "edit",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    "gap-fill": {
      "ancestor": "edit",
      "inheritsFrom": 1,
      "required": false,
      "name": "gap-fill",
      "summary": null,
      "descr": null,
      "flag": 5,
      "_newName": null
    },
    "radio-button": {
      "ancestor": "eval-control",
      "inheritsFrom": 1,
      "required": false,
      "name": "radio-button",
      "summary": null,
      "descr": null,
      "flag": 4101,
      "_newName": null
    },
    "check-low": {
      "ancestor": "eval-control",
      "inheritsFrom": 1,
      "required": false,
      "name": "check-low",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    "check-item": {
      "ancestor": "check-low",
      "inheritsFrom": 1,
      "required": false,
      "name": "check-item",
      "summary": null,
      "descr": null,
      "flag": 4101,
      "_newName": null
    },
    "check-box": {
      "ancestor": "check-low",
      "inheritsFrom": 1,
      "required": false,
      "name": "check-box",
      "summary": null,
      "descr": null,
      "flag": 5,
      "_newName": null
    },
    "pairing-item": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "pairing-item",
      "summary": null,
      "descr": null,
      "flag": 4101,
      "_newName": null
    },
    "pairing": {
      "ancestor": "eval-control",
      "inheritsFrom": 1,
      "required": false,
      "name": "pairing",
      "summary": null,
      "descr": null,
      "flag": 5,
      "_newName": null
    },
    "single-choice": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "single-choice",
      "summary": null,
      "descr": null,
      "flag": 4,
      "_newName": null
    },
    "word-selection": {
      "ancestor": "eval-control",
      "inheritsFrom": 1,
      "required": false,
      "name": "word-selection",
      "summary": null,
      "descr": null,
      "flag": 5,
      "_newName": null
    },
    "word-multi-selection": {
      "ancestor": "eval-control",
      "inheritsFrom": 1,
      "required": false,
      "name": "word-multi-selection",
      "summary": null,
      "descr": null,
      "flag": 5,
      "_newName": null
    },
    "word-ordering": {
      "ancestor": "eval-control",
      "inheritsFrom": 1,
      "required": false,
      "name": "word-ordering",
      "summary": null,
      "descr": null,
      "flag": 5,
      "_newName": null
    },
    "sentence-ordering": {
      "ancestor": "eval-control",
      "inheritsFrom": 1,
      "required": false,
      "name": "sentence-ordering",
      "summary": null,
      "descr": null,
      "flag": 5,
      "_newName": null
    },
    "sentence-ordering-item": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "sentence-ordering-item",
      "summary": null,
      "descr": null,
      "flag": 4101,
      "_newName": "sentence"
    },
    "extension": {
      "ancestor": "eval-control",
      "inheritsFrom": 1,
      "required": false,
      "name": "extension",
      "summary": null,
      "descr": null,
      "flag": 135,
      "_newName": null
    },
    "writing": {
      "ancestor": "human-eval",
      "inheritsFrom": 1,
      "required": false,
      "name": "writing",
      "summary": null,
      "descr": null,
      "flag": 4101,
      "_newName": null
    },
    "recording": {
      "ancestor": "human-eval",
      "inheritsFrom": 1,
      "required": false,
      "name": "recording",
      "summary": null,
      "descr": null,
      "flag": 4101,
      "_newName": null
    },
    "list": {
      "ancestor": "macro",
      "inheritsFrom": 0,
      "required": false,
      "name": "list",
      "summary": null,
      "descr": null,
      "flag": 4,
      "_newName": null
    },
    "list-group": {
      "ancestor": "macro",
      "inheritsFrom": 0,
      "required": false,
      "name": "list-group",
      "summary": null,
      "descr": null,
      "flag": 12293,
      "_newName": null
    },
    "two-column": {
      "ancestor": "macro",
      "inheritsFrom": 0,
      "required": false,
      "name": "two-column",
      "summary": null,
      "descr": null,
      "flag": 4101,
      "_newName": null
    },
    "panel": {
      "ancestor": "macro",
      "inheritsFrom": 0,
      "required": false,
      "name": "panel",
      "summary": null,
      "descr": null,
      "flag": 131077,
      "_newName": null
    },
    "node": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "node",
      "summary": null,
      "descr": null,
      "flag": 4228,
      "_newName": null
    },
    "offering": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "offering",
      "summary": null,
      "descr": null,
      "flag": 5,
      "_newName": null
    },
    "url-tag": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "url-tag",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    "media-tag": {
      "ancestor": "url-tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "media-tag",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    "media-big-mark": {
      "ancestor": "media-tag",
      "inheritsFrom": 2,
      "required": false,
      "name": "media-big-mark",
      "summary": null,
      "descr": null,
      "flag": 5,
      "_newName": null
    },
    "media-player": {
      "ancestor": "media-tag",
      "inheritsFrom": 2,
      "required": false,
      "name": "media-player",
      "summary": null,
      "descr": null,
      "flag": 5,
      "_newName": null
    },
    "media-video": {
      "ancestor": "media-tag",
      "inheritsFrom": 2,
      "required": false,
      "name": "media-video",
      "summary": null,
      "descr": null,
      "flag": 5,
      "_newName": null
    },
    "media-text": {
      "ancestor": "media-tag",
      "inheritsFrom": 2,
      "required": false,
      "name": "media-text",
      "summary": null,
      "descr": null,
      "flag": 5,
      "_newName": null
    },
    "_media-replica": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "_media-replica",
      "summary": null,
      "descr": null,
      "flag": 389,
      "_newName": null
    },
    "_media-sent": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "_media-sent",
      "summary": null,
      "descr": null,
      "flag": 131461,
      "_newName": null
    },
    "_snd-page": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "_snd-page",
      "summary": null,
      "descr": null,
      "flag": 385,
      "_newName": null
    },
    "_snd-file-group": {
      "ancestor": "url-tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "_snd-file-group",
      "summary": null,
      "descr": null,
      "flag": 385,
      "_newName": null
    },
    "_snd-group": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "_snd-group",
      "summary": null,
      "descr": null,
      "flag": 385,
      "_newName": null
    },
    "_snd-interval": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "_snd-interval",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    "_snd-sent": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "_snd-sent",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    "_snd-file": {
      "ancestor": "url-tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "_snd-file",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    "cut-dialog": {
      "ancestor": "_snd-file",
      "inheritsFrom": 0,
      "required": false,
      "name": "cut-dialog",
      "summary": null,
      "descr": null,
      "flag": 98308,
      "_newName": null
    },
    "cut-text": {
      "ancestor": "_snd-file",
      "inheritsFrom": 0,
      "required": false,
      "name": "cut-text",
      "summary": null,
      "descr": null,
      "flag": 98308,
      "_newName": null
    },
    "phrase": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "phrase",
      "summary": null,
      "descr": null,
      "flag": 102405,
      "_newName": "sent"
    },
    "replica": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "replica",
      "summary": null,
      "descr": null,
      "flag": 98309,
      "_newName": null
    },
    "include": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "include",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    "include-text": {
      "ancestor": "include",
      "inheritsFrom": 0,
      "required": false,
      "name": "include-text",
      "summary": null,
      "descr": null,
      "flag": 98304,
      "_newName": null
    },
    "include-dialog": {
      "ancestor": "include",
      "inheritsFrom": 0,
      "required": false,
      "name": "include-dialog",
      "summary": null,
      "descr": null,
      "flag": 98304,
      "_newName": null
    },
    "phrase-replace": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "phrase-replace",
      "summary": null,
      "descr": null,
      "flag": 102400,
      "_newName": "sent-replace"
    },
    "_eval-page": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "_eval-page",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    "_eval-btn": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "_eval-btn",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    "_eval-group": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "_eval-group",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    "macro-template": {
      "ancestor": "macro",
      "inheritsFrom": 0,
      "required": false,
      "name": "macro-template",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    "macro-true-false": {
      "ancestor": "macro-template",
      "inheritsFrom": 0,
      "required": false,
      "name": "macro-true-false",
      "summary": null,
      "descr": null,
      "flag": 6,
      "_newName": null
    },
    "macro-single-choices": {
      "ancestor": "macro-template",
      "inheritsFrom": 0,
      "required": false,
      "name": "macro-single-choices",
      "summary": null,
      "descr": null,
      "flag": 6,
      "_newName": null
    },
    "macro-pairing": {
      "ancestor": "macro-template",
      "inheritsFrom": 0,
      "required": false,
      "name": "macro-pairing",
      "summary": null,
      "descr": null,
      "flag": 6,
      "_newName": null
    },
    "macro-table": {
      "ancestor": "macro-template",
      "inheritsFrom": 0,
      "required": false,
      "name": "macro-table",
      "summary": null,
      "descr": null,
      "flag": 6,
      "_newName": null
    },
    "macro-list-word-ordering": {
      "ancestor": "macro-template",
      "inheritsFrom": 0,
      "required": false,
      "name": "macro-list-word-ordering",
      "summary": null,
      "descr": null,
      "flag": 6,
      "_newName": null
    },
    "macro-list": {
      "ancestor": "macro-template",
      "inheritsFrom": 0,
      "required": false,
      "name": "macro-list",
      "summary": null,
      "descr": null,
      "flag": 6,
      "_newName": null
    },
    "macro-icon-list": {
      "ancestor": "macro-template",
      "inheritsFrom": 0,
      "required": false,
      "name": "macro-icon-list",
      "summary": null,
      "descr": null,
      "flag": 6,
      "_newName": null
    },
    "macro-article": {
      "ancestor": "macro-template",
      "inheritsFrom": 0,
      "required": false,
      "name": "macro-article",
      "summary": null,
      "descr": null,
      "flag": 6,
      "_newName": null
    },
    "macro-vocabulary": {
      "ancestor": "macro-template",
      "inheritsFrom": 0,
      "required": false,
      "name": "macro-vocabulary",
      "summary": null,
      "descr": null,
      "flag": 6,
      "_newName": null
    },
    "macro-video": {
      "ancestor": "macro-template",
      "inheritsFrom": 0,
      "required": false,
      "name": "macro-video",
      "summary": null,
      "descr": null,
      "flag": 6,
      "_newName": null
    },
    "inline-tag": {
      "ancestor": "macro-template",
      "inheritsFrom": 0,
      "required": false,
      "name": "inline-tag",
      "summary": null,
      "descr": null,
      "flag": 16388,
      "_newName": null
    },
    "smart-tag": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "smart-tag",
      "summary": null,
      "descr": null,
      "flag": 2180,
      "_newName": null
    },
    "smart-element-low": {
      "ancestor": "macro-template",
      "inheritsFrom": 0,
      "required": false,
      "name": "smart-element-low",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    "smart-element": {
      "ancestor": "smart-element-low",
      "inheritsFrom": 0,
      "required": false,
      "name": "smart-element",
      "summary": null,
      "descr": null,
      "flag": 6,
      "_newName": null
    },
    "smart-offering": {
      "ancestor": "smart-element-low",
      "inheritsFrom": 0,
      "required": false,
      "name": "smart-offering",
      "summary": null,
      "descr": null,
      "flag": 6,
      "_newName": null
    },
    "smart-pairing": {
      "ancestor": "smart-element-low",
      "inheritsFrom": 0,
      "required": false,
      "name": "smart-pairing",
      "summary": null,
      "descr": null,
      "flag": 6,
      "_newName": null
    },
    "doc-tags-meta": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "doc-tags-meta",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    "doc-named": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "doc-named",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    "doc-type": {
      "ancestor": "doc-named",
      "inheritsFrom": 0,
      "required": false,
      "name": "doc-type",
      "summary": null,
      "descr": null,
      "flag": 386,
      "_newName": null
    },
    "doc-enum": {
      "ancestor": "doc-named",
      "inheritsFrom": 0,
      "required": false,
      "name": "doc-enum",
      "summary": null,
      "descr": null,
      "flag": 386,
      "_newName": null
    },
    "doc-enum-item": {
      "ancestor": "doc-named",
      "inheritsFrom": 0,
      "required": false,
      "name": "doc-enum-item",
      "summary": null,
      "descr": null,
      "flag": 386,
      "_newName": null
    },
    "doc-prop": {
      "ancestor": "doc-named",
      "inheritsFrom": 0,
      "required": false,
      "name": "doc-prop",
      "summary": null,
      "descr": null,
      "flag": 386,
      "_newName": null
    },
    "doc-descr": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "doc-descr",
      "summary": null,
      "descr": null,
      "flag": 36992,
      "_newName": null
    },
    "doc-example": {
      "ancestor": "tag",
      "inheritsFrom": 0,
      "required": false,
      "name": "doc-example",
      "summary": null,
      "descr": null,
      "flag": 133,
      "_newName": null
    }
  },
  "properties": [
    {
      "propOf": "tag",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 2,
      "regexConstrains": null,
      "name": "id",
      "summary": null,
      "descr": "@summary jednoznacna identifikace elementu\n            @descr ??",
      "flag": 524288,
      "_newName": null
    },
    {
      "propOf": "tag",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "srcpos",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    {
      "propOf": "tag",
      "type": 4,
      "modifier": 1,
      "clsEnumName": "tag",
      "constrains": 0,
      "regexConstrains": null,
      "name": "items",
      "summary": null,
      "descr": null,
      "flag": 128,
      "_newName": null
    },
    {
      "propOf": "tag",
      "type": 1,
      "modifier": 1,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "class",
      "summary": null,
      "descr": "@summary seznam CSS classes\n            @descr ??",
      "flag": 160,
      "_newName": null
    },
    {
      "propOf": "eval-control",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 1,
      "regexConstrains": "^((and)-\\w+-(exchangeable)|(and)-\\w+|\\w+-(exchangeable))$",
      "name": "eval-group",
      "summary": null,
      "descr": "@summary and-[id] nebo [id]-exchangeable nebo and-[id]-exchangeable.\n            Pro radioButton pouze [id]\n             @descr ??",
      "flag": 524288,
      "_newName": null
    },
    {
      "propOf": "eval-control",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "score-weight",
      "summary": null,
      "descr": null,
      "flag": 524288,
      "_newName": null
    },
    {
      "propOf": "eval-control",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 3,
      "regexConstrains": null,
      "name": "eval-button-id",
      "summary": null,
      "descr": null,
      "flag": 524288,
      "_newName": "eval-btn-id"
    },
    {
      "propOf": "html-tag",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "tag-name",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "html-tag",
      "type": 4,
      "modifier": 1,
      "clsEnumName": "attr",
      "constrains": 0,
      "regexConstrains": null,
      "name": "attrs",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    {
      "propOf": "script",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "cdata",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "img",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "src",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "text",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "title",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "body",
      "type": 4,
      "modifier": 0,
      "clsEnumName": "_snd-page",
      "constrains": 0,
      "regexConstrains": null,
      "name": "snd-page",
      "summary": null,
      "descr": null,
      "flag": 128,
      "_newName": null
    },
    {
      "propOf": "body",
      "type": 4,
      "modifier": 0,
      "clsEnumName": "_eval-page",
      "constrains": 0,
      "regexConstrains": null,
      "name": "eval-page",
      "summary": null,
      "descr": null,
      "flag": 128,
      "_newName": null
    },
    {
      "propOf": "body",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "url",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    {
      "propOf": "body",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "order",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "body",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "instr-title",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "body",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "externals",
      "summary": null,
      "descr": null,
      "flag": 128,
      "_newName": null
    },
    {
      "propOf": "body",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "see-also-links",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "course-see-also-str"
    },
    {
      "propOf": "body",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "old-ea-is-passive",
      "summary": null,
      "descr": null,
      "flag": 128,
      "_newName": null
    },
    {
      "propOf": "body",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "is-old-ea",
      "summary": null,
      "descr": null,
      "flag": 128,
      "_newName": null
    },
    {
      "propOf": "body",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "instr-body",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "instrs-str"
    },
    {
      "propOf": "body",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "see-also-str",
      "summary": null,
      "descr": null,
      "flag": 128,
      "_newName": null
    },
    {
      "propOf": "human-eval",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "is-passive",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "tts-sound",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "text",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "eval-button",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "score-as-ratio",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "ratio-score"
    },
    {
      "propOf": "drop-down",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "gap-fill-like",
      "summary": null,
      "descr": null,
      "flag": 524672,
      "_newName": null
    },
    {
      "propOf": "edit",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "correct-value",
      "summary": "Spravana hodnota vyhodnotitelneho elementu.",
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "edit",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 5,
      "regexConstrains": null,
      "name": "width-group",
      "summary": "vsem elementum se stejnou hodnotou smartWidth se nastavi stejna sirka (rovna maximu z sirky techto elementu)",
      "descr": null,
      "flag": 524288,
      "_newName": "smart-width"
    },
    {
      "propOf": "edit",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "width",
      "summary": null,
      "descr": null,
      "flag": 524288,
      "_newName": null
    },
    {
      "propOf": "edit",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 3,
      "regexConstrains": null,
      "name": "offering-id",
      "summary": "id \"offering\" elementu, do ktereho se pridaji vsechny spravne hodnoty z correctValue.",
      "descr": "Pri nastaveni offeringId se zaroven na stejnou hodnotu nastavi i smartWidth (pokud smartWidth jiz neni nastavena na neco jineho)",
      "flag": 524288,
      "_newName": null
    },
    {
      "propOf": "edit",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "case-sensitive",
      "summary": null,
      "descr": null,
      "flag": 524288,
      "_newName": null
    },
    {
      "propOf": "gap-fill",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "hint",
      "summary": null,
      "descr": null,
      "flag": 524288,
      "_newName": "place-holder"
    },
    {
      "propOf": "gap-fill",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "init-value",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "gap-fill",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "read-only",
      "summary": null,
      "descr": null,
      "flag": 524288,
      "_newName": null
    },
    {
      "propOf": "gap-fill",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "skip-evaluation",
      "summary": null,
      "descr": null,
      "flag": 524288,
      "_newName": null
    },
    {
      "propOf": "radio-button",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "correct-value",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "radio-button",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "init-value",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "radio-button",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "read-only",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "radio-button",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "skip-evaluation",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "check-low",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "correct-value",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "check-low",
      "type": 2,
      "modifier": 0,
      "clsEnumName": "check-item-texts",
      "constrains": 0,
      "regexConstrains": null,
      "name": "text-type",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "text-id"
    },
    {
      "propOf": "check-low",
      "type": 2,
      "modifier": 0,
      "clsEnumName": "three-state-bool",
      "constrains": 0,
      "regexConstrains": null,
      "name": "init-value",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "check-low",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "read-only",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "check-low",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "skip-evaluation",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "pairing-item",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "right",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "pairing",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "left-random",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "random"
    },
    {
      "propOf": "pairing",
      "type": 2,
      "modifier": 0,
      "clsEnumName": "pairing-left-width",
      "constrains": 0,
      "regexConstrains": null,
      "name": "left-width",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "single-choice",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "read-only",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "single-choice",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "skip-evaluation",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "single-choice",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "score-weight",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "single-choice",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 3,
      "regexConstrains": null,
      "name": "eval-button-id",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "eval-btn-id"
    },
    {
      "propOf": "word-selection",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "words",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "word-multi-selection",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "words",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "word-ordering",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "correct-order",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "correct-value"
    },
    {
      "propOf": "extension",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "data",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "extension",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "cdata",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "writing",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "limit-recommend",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "recommend-words-min"
    },
    {
      "propOf": "writing",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "limit-min",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "words-min"
    },
    {
      "propOf": "writing",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "limit-max",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "words-max"
    },
    {
      "propOf": "writing",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "number-of-rows",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "init-rows"
    },
    {
      "propOf": "recording",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "limit-recommend",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "recommend-seconds-from"
    },
    {
      "propOf": "recording",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "limit-min",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "speak-seconds-from"
    },
    {
      "propOf": "recording",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "limit-max",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "speak-seconds-to"
    },
    {
      "propOf": "recording",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "record-in-dialog",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "stop-in-modal-dialog"
    },
    {
      "propOf": "recording",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 3,
      "regexConstrains": null,
      "name": "dialog-header-id",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "modal-dialog-header"
    },
    {
      "propOf": "recording",
      "type": 2,
      "modifier": 0,
      "clsEnumName": "modal-size",
      "constrains": 0,
      "regexConstrains": null,
      "name": "dialog-size",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "modal-dialog-size"
    },
    {
      "propOf": "recording",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "single-attempt",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "disable-re-record"
    },
    {
      "propOf": "list",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "delim",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "list",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "is-striped",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "list",
      "type": 2,
      "modifier": 0,
      "clsEnumName": "list-icon",
      "constrains": 0,
      "regexConstrains": null,
      "name": "icon",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "list",
      "type": 2,
      "modifier": 0,
      "clsEnumName": "colors",
      "constrains": 0,
      "regexConstrains": null,
      "name": "color",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "list-group",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "is-striped",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "panel",
      "type": 4,
      "modifier": 0,
      "clsEnumName": "header-prop",
      "constrains": 0,
      "regexConstrains": null,
      "name": "header",
      "summary": null,
      "descr": null,
      "flag": 128,
      "_newName": null
    },
    {
      "propOf": "offering",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "words",
      "summary": "",
      "descr": "seznam prvku nabidky, oddeleny \"|\"",
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "offering",
      "type": 2,
      "modifier": 0,
      "clsEnumName": "offering-drop-down-mode",
      "constrains": 0,
      "regexConstrains": null,
      "name": "mode",
      "summary": "",
      "descr": "pro \"drop-down\" tagy: drop-down-discard\" => kazdy prvek nabidky muze byt vybrana pouze jednim drop-down elementem.\n            drop-down-mode=\"keep\" => jeden prvek nabidky muze pouzit vice drop-down elementu",
      "flag": 524288,
      "_newName": "drop-down-mode"
    },
    {
      "propOf": "offering",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "hidden",
      "summary": "",
      "descr": "pro offering s drop-down : offering se nezobrazi.",
      "flag": 524288,
      "_newName": "is-hidden"
    },
    {
      "propOf": "url-tag",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 1,
      "regexConstrains": "^.*\\.mp3$|^.*@((std-4|std-2)$|(16by9|4by3):((\\d+|\\*)-((\\w|\\.)*webm|(\\w|\\.)*mp4)+(,(\\w|\\.)*webm|,(\\w|\\.)*mp4)*)+(\\|(\\d+|\\*)-((\\w|\\.)*webm|(\\w|\\.)*mp4)+(,(\\w|\\.)*webm|,(\\w|\\.)*mp4)*)*)$",
      "name": "media-url",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "media-tag",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "cut-url",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "media-tag",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 1,
      "regexConstrains": "^(\\d+|-\\d+|\\d+-\\d+|\\d+-)(,\\d+|,-\\d+|,\\d+-\\d+|,\\d+-)*$",
      "name": "subset",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "media-tag",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 3,
      "regexConstrains": null,
      "name": "share-media-id",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "share-id"
    },
    {
      "propOf": "media-tag",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "_sent-group-id",
      "summary": null,
      "descr": null,
      "flag": 384,
      "_newName": null
    },
    {
      "propOf": "media-text",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 3,
      "regexConstrains": null,
      "name": "continue-media-id",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "continue-id"
    },
    {
      "propOf": "media-text",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "passive",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "is-passive"
    },
    {
      "propOf": "media-text",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "is-old-to-new",
      "summary": null,
      "descr": null,
      "flag": 128,
      "_newName": null
    },
    {
      "propOf": "media-text",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "hidden",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "is-hidden"
    },
    {
      "propOf": "_media-replica",
      "type": 2,
      "modifier": 0,
      "clsEnumName": "icon-ids",
      "constrains": 0,
      "regexConstrains": null,
      "name": "icon-id",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "_media-replica",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "dlg-left",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "_media-replica",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "actor",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "_media-sent",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "idx",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "_snd-sent",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "idx",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "_snd-sent",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "beg-pos",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "_snd-sent",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "end-pos",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "_snd-sent",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "text",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "_snd-sent",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "actor",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "_snd-file",
      "type": 4,
      "modifier": 0,
      "clsEnumName": "include",
      "constrains": 0,
      "regexConstrains": null,
      "name": "file",
      "summary": null,
      "descr": null,
      "flag": 128,
      "_newName": null
    },
    {
      "propOf": "phrase",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "beg-pos",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "phrase",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "end-pos",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "replica",
      "type": 2,
      "modifier": 0,
      "clsEnumName": "icon-ids",
      "constrains": 0,
      "regexConstrains": null,
      "name": "actor-id",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "icon-id"
    },
    {
      "propOf": "replica",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "actor-name",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "actor"
    },
    {
      "propOf": "replica",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "number-of-phrases",
      "summary": "",
      "descr": "uvedena konstrukce slou?? k vytvo?en? dialogu z plain textu. Podporov?n je POUZE souvisl? text (bez p?eskakov?n? zvukov?ch v?t). \n            Tak?e z?pis je ten, ?e pro ka?dou repliku se ur?? PO?ET v?t repliky (ur?ovat za??tek a konec je zbyte?n? slo?it?). \n            Dal?? replika za??n? prvn? v?tou po posledn? v?t? p?edchoz? repliky. \n            jestli preci jenom ale nebude nejlepsi \"take-phrases\" (puvodne \"sent-take\").",
      "flag": 0,
      "_newName": "sent-take"
    },
    {
      "propOf": "include",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "cut-url",
      "summary": null,
      "descr": "@summary pointer na XML file s sndDialog nebo sndText (extenze se ignoruje). \n            @descr",
      "flag": 262144,
      "_newName": null
    },
    {
      "propOf": "phrase-replace",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 4,
      "regexConstrains": null,
      "name": "phrase-idx",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "sent-idx"
    },
    {
      "propOf": "phrase-replace",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 1,
      "regexConstrains": "^\\d+\\.\\d+$",
      "name": "replica-phrase-idx",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": "replica-sent-idx"
    },
    {
      "propOf": "_eval-page",
      "type": 0,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "max-score",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "_eval-page",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "radio-groups",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "_eval-btn",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "btn-id",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "_eval-group",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "is-and",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "_eval-group",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "is-exchangeable",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "_eval-group",
      "type": 1,
      "modifier": 1,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "eval-control-ids",
      "summary": null,
      "descr": null,
      "flag": 32,
      "_newName": null
    },
    {
      "propOf": "macro-template",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "name",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "macro-template",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "cdata",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "macro-true-false",
      "type": 2,
      "modifier": 0,
      "clsEnumName": "check-item-texts",
      "constrains": 0,
      "regexConstrains": null,
      "name": "text-id",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "macro-table",
      "type": 2,
      "modifier": 0,
      "clsEnumName": "inline-control-types",
      "constrains": 0,
      "regexConstrains": null,
      "name": "inline-type",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "macro-list",
      "type": 2,
      "modifier": 0,
      "clsEnumName": "inline-control-types",
      "constrains": 0,
      "regexConstrains": null,
      "name": "inline-type",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "macro-icon-list",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "delim",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "macro-icon-list",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "is-striped",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "macro-icon-list",
      "type": 2,
      "modifier": 0,
      "clsEnumName": "list-icon",
      "constrains": 0,
      "regexConstrains": null,
      "name": "icon",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "macro-icon-list",
      "type": 2,
      "modifier": 0,
      "clsEnumName": "colors",
      "constrains": 0,
      "regexConstrains": null,
      "name": "color",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "macro-video",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "cut-url",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "macro-video",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 1,
      "regexConstrains": "^.*\\.mp3$|^.*@((std-4|std-2)$|(16by9|4by3):((\\d+|\\*)-((\\w|\\.)*webm|(\\w|\\.)*mp4)+(,(\\w|\\.)*webm|,(\\w|\\.)*mp4)*)+(\\|(\\d+|\\*)-((\\w|\\.)*webm|(\\w|\\.)*mp4)+(,(\\w|\\.)*webm|,(\\w|\\.)*mp4)*)*)$",
      "name": "media-url",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "macro-video",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "display-style",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "inline-tag",
      "type": 2,
      "modifier": 0,
      "clsEnumName": "inline-element-types",
      "constrains": 0,
      "regexConstrains": null,
      "name": "inline-type",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "smart-tag",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "correct",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "smart-tag",
      "type": 2,
      "modifier": 0,
      "clsEnumName": "inline-control-types",
      "constrains": 0,
      "regexConstrains": null,
      "name": "default-inline-type",
      "summary": null,
      "descr": null,
      "flag": 128,
      "_newName": null
    },
    {
      "propOf": "smart-element",
      "type": 2,
      "modifier": 0,
      "clsEnumName": "smart-element-types",
      "constrains": 0,
      "regexConstrains": null,
      "name": "inline-type",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "smart-offering",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "words",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "smart-offering",
      "type": 2,
      "modifier": 0,
      "clsEnumName": "smart-offering-mode",
      "constrains": 0,
      "regexConstrains": null,
      "name": "mode",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "smart-pairing",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "random",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "smart-pairing",
      "type": 2,
      "modifier": 0,
      "clsEnumName": "pairing-left-width",
      "constrains": 0,
      "regexConstrains": null,
      "name": "left-width",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "doc-tags-meta",
      "type": 4,
      "modifier": 1,
      "clsEnumName": "doc-type",
      "constrains": 0,
      "regexConstrains": null,
      "name": "types",
      "summary": null,
      "descr": null,
      "flag": 32,
      "_newName": null
    },
    {
      "propOf": "doc-tags-meta",
      "type": 4,
      "modifier": 1,
      "clsEnumName": "doc-prop",
      "constrains": 0,
      "regexConstrains": null,
      "name": "props",
      "summary": null,
      "descr": null,
      "flag": 32,
      "_newName": null
    },
    {
      "propOf": "doc-tags-meta",
      "type": 4,
      "modifier": 1,
      "clsEnumName": "doc-enum",
      "constrains": 0,
      "regexConstrains": null,
      "name": "enums",
      "summary": null,
      "descr": null,
      "flag": 32,
      "_newName": null
    },
    {
      "propOf": "doc-named",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "name",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "doc-named",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "summary",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "doc-named",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "cdata",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "doc-type",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "is-html",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "doc-type",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "is-ign",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "doc-type",
      "type": 1,
      "modifier": 1,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "descendants-and-self",
      "summary": null,
      "descr": null,
      "flag": 32,
      "_newName": null
    },
    {
      "propOf": "doc-type",
      "type": 1,
      "modifier": 1,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "my-props",
      "summary": null,
      "descr": null,
      "flag": 32,
      "_newName": null
    },
    {
      "propOf": "doc-type",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "xref",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "doc-enum",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "xref",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "doc-enum",
      "type": 4,
      "modifier": 1,
      "clsEnumName": "doc-enum-item",
      "constrains": 0,
      "regexConstrains": null,
      "name": "enums",
      "summary": null,
      "descr": null,
      "flag": 32,
      "_newName": null
    },
    {
      "propOf": "doc-enum-item",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "xref",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "doc-prop",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "owner-type",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "doc-prop",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "data-type",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "doc-prop",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "xref",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "doc-prop",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "is-html",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "doc-example",
      "type": 3,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "todo",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "doc-example",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "code-listing",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "doc-example",
      "type": 1,
      "modifier": 0,
      "clsEnumName": null,
      "constrains": 0,
      "regexConstrains": null,
      "name": "code-post-listing",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "doc-example",
      "type": 4,
      "modifier": 0,
      "clsEnumName": "header-prop",
      "constrains": 0,
      "regexConstrains": null,
      "name": "header",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "doc-example",
      "type": 4,
      "modifier": 0,
      "clsEnumName": "doc-descr",
      "constrains": 0,
      "regexConstrains": null,
      "name": "descr",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    {
      "propOf": "doc-example",
      "type": 4,
      "modifier": 0,
      "clsEnumName": "eval-button",
      "constrains": 0,
      "regexConstrains": null,
      "name": "eval-btn",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    }
  ],
  "enums": {
    "check-item-texts": {
      "enumData": [
        {
          "value": 0,
          "name": "yes-no",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": "yes-no"
        },
        {
          "value": 1,
          "name": "true-false",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": "true-false"
        },
        {
          "value": 2,
          "name": "no",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        }
      ],
      "name": "check-item-texts",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    "three-state-bool": {
      "enumData": [
        {
          "value": 0,
          "name": "no",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 1,
          "name": "true",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": "true"
        },
        {
          "value": 2,
          "name": "false",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": "false"
        }
      ],
      "name": "three-state-bool",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    "pairing-left-width": {
      "enumData": [
        {
          "value": 0,
          "name": "normal",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 1,
          "name": "small",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 2,
          "name": "xsmall",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 3,
          "name": "large",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        }
      ],
      "name": "pairing-left-width",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    "modal-size": {
      "enumData": [
        {
          "value": 0,
          "name": "normal",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 1,
          "name": "small",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 2,
          "name": "large",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        }
      ],
      "name": "modal-size",
      "summary": null,
      "descr": null,
      "flag": 0,
      "_newName": null
    },
    "list-icon": {
      "enumData": [
        {
          "value": 0,
          "name": "number",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 1,
          "name": "letter",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 2,
          "name": "upper-letter",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 3,
          "name": "angle-double-right",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 4,
          "name": "angle-right",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 5,
          "name": "arrow-circle-o-right",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 6,
          "name": "arrow-circle-right",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 7,
          "name": "arrow-right",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 8,
          "name": "caret-right",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 9,
          "name": "caret-square-o-right",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 10,
          "name": "chevron-circle-right",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 11,
          "name": "chevron-right",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 12,
          "name": "hand-o-right",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 13,
          "name": "long-arrow-right",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 14,
          "name": "play",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 15,
          "name": "play-circle",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 16,
          "name": "play-circle-o",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 17,
          "name": "circle-o-notch",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 18,
          "name": "cog",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 19,
          "name": "refresh",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 20,
          "name": "spinner",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 21,
          "name": "square-o",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 22,
          "name": "bullseye",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 23,
          "name": "asterisk",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 24,
          "name": "circle",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 25,
          "name": "circle-o",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 26,
          "name": "circle-thin",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 27,
          "name": "dot-circle-o",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        }
      ],
      "name": "list-icon",
      "summary": null,
      "descr": null,
      "flag": 128,
      "_newName": null
    },
    "colors": {
      "enumData": [
        {
          "value": 0,
          "name": "black",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 1,
          "name": "white",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 2,
          "name": "primary",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 3,
          "name": "success",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 4,
          "name": "info",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 5,
          "name": "warning",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 6,
          "name": "danger",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        }
      ],
      "name": "colors",
      "summary": null,
      "descr": null,
      "flag": 128,
      "_newName": null
    },
    "offering-drop-down-mode": {
      "enumData": [
        {
          "value": 0,
          "name": "drop-down-discard",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": "drop-down-discard"
        },
        {
          "value": 1,
          "name": "drop-down-keep",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": "drop-down-keep"
        },
        {
          "value": 2,
          "name": "gap-fill-ignore",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": "gap-fill-ignore"
        }
      ],
      "name": "offering-drop-down-mode",
      "summary": null,
      "descr": null,
      "flag": 524288,
      "_newName": "offering-mode"
    },
    "icon-ids": {
      "enumData": [
        {
          "value": 0,
          "name": "no",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 1,
          "name": "a",
          "summary": "Dialog speaker A",
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 2,
          "name": "b",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 3,
          "name": "c",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 4,
          "name": "d",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 5,
          "name": "e",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 6,
          "name": "f",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        }
      ],
      "name": "icon-ids",
      "summary": "Dialog speaker identification",
      "descr": "descr",
      "flag": 0,
      "_newName": "replica-actor"
    },
    "inline-control-types": {
      "enumData": [
        {
          "value": 0,
          "name": "no",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 1,
          "name": "gap-fill",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 2,
          "name": "gap-fill_-correction",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 3,
          "name": "word-selection",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 4,
          "name": "drag-target",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 5,
          "name": "img",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 6,
          "name": "tts-sound",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        }
      ],
      "name": "inline-control-types",
      "summary": null,
      "descr": null,
      "flag": 128,
      "_newName": null
    },
    "inline-element-types": {
      "enumData": [
        {
          "value": 0,
          "name": "no",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 1,
          "name": "gap-fill",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 2,
          "name": "gap-fill-correction",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 3,
          "name": "word-selection",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 4,
          "name": "drop-down",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 5,
          "name": "img",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 6,
          "name": "tts-sound",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        }
      ],
      "name": "inline-element-types",
      "summary": null,
      "descr": null,
      "flag": 128,
      "_newName": null
    },
    "smart-element-types": {
      "enumData": [
        {
          "value": 0,
          "name": "no",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 1,
          "name": "gap-fill",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 2,
          "name": "drop-down",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 3,
          "name": "offering",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 4,
          "name": "img",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 5,
          "name": "word-selection",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        }
      ],
      "name": "smart-element-types",
      "summary": null,
      "descr": null,
      "flag": 128,
      "_newName": null
    },
    "smart-offering-mode": {
      "enumData": [
        {
          "value": 0,
          "name": "gap-fill",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 1,
          "name": "drop-down-discard",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 2,
          "name": "drop-down-keep",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": null
        },
        {
          "value": 3,
          "name": "gap-fill-passive",
          "summary": null,
          "descr": null,
          "flag": 0,
          "_newName": "gap-fill-ignore"
        }
      ],
      "name": "smart-offering-mode",
      "summary": null,
      "descr": null,
      "flag": 128,
      "_newName": null
    }
  }
}
;
}
