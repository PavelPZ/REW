module schools {


  //export function readModuleDict(moduleId: string, completed: (dict: schools.Dict) => void) {
  //  switch (dictType) {
  //    case schools.dictTypes.lingOffline:
  //      actDictData = null; if (actDict == null) { completed(null); return; }
  //      //schools.readAppData(Pager.filePath(Pager.pathType.dictData, "lingdict_" + moduleId, LowUtils.EnumToString(LMComLib.Langs, actLoc).replace('_', '-')).urlLoc, res => { moduleDict = RJSON.unpack(JSON.parse(res)); completed(); });
  //      schools.readAppData(
  //        Pager.filePath(Pager.pathType.dictData, moduleId + '_' + cfg.dictOfflineId, LowUtils.EnumToString(LMComLib.Langs, actLoc).replace('_', '-')).urlLoc,
  //        res => completed(RJSON.unpack(JSON.parse(res))));
  //      break;
  //    default:
  //      completed(null);
  //      break;
  //  }
  //}

  //export interface mod_Loc_Dict {
  //  exs: exStatic[];
  //  dict: schools.Dict;
  //}

  //export var flag_startWithNull = 1;
  //export var flag_urlDict = 2;
  //export function read_Mod_Loc_Dict(type: Pager.pathType, id: string, flag: number, completed: (res: mod_Loc_Dict) => void): void {
  //  schools.readAppDataAndLoc(Pager.filePath(type, id, Trados.actLangCode), (exStr, dictLocStr) => {
  //    var dictLoc = dictLocStr ? JSON.parse(dictLocStr) : {};
  //    var res: mod_Loc_Dict = { exs: parseAndLocalizeLow(exStr, dictLoc.loc ? dictLoc.loc : dictLoc /*debug - slovnik neni cast cviceni*/, flag), dict: null }
  //    if (!dictLoc.loc && !dictLoc.dict && cfg.dictOfflineId) { //debug - slovnik neni cast cviceni
  //      //var crsLang = LMComLib.LineToLang[schools.data.crsStatic.line];
  //      schools.readAppData(Pager.filePath(type, id + '_' + cfg.dictOfflineId, Trados.actLangCode).urlLoc.replace('.json','.rjson'), dictStr => {
  //        res.dict = RJSON.unpack(JSON.parse(dictStr));
  //        completed(res);
  //      });
  //    } else {
  //      res.dict = dictLoc.dict ? RJSON.unpack(dictLoc.dict) : null;
  //      completed(res);
  //    }
  //  });
  //}
  //function parseAndLocalizeLow(data: string, loc: any, flag: number = 0): exStatic[] {
  //  var parts = data.split("$$$");
  //  var res: exStatic[] = flag == flag_startWithNull ? [null] : [];
  //  for (var i = 0; i < parts.length; i += 2) {
  //    if (!parts[i]) break;
  //    var ex: exStatic = JSON.parse(parts[i]);
  //    var exLoc = loc ? loc[ex.url] : null;
  //    if (!exLoc) { //ex.url="ea/english1/l01/a/hueex0_l01_a03", v loc je loc.hueex0_l01_a03
  //      //lokalizace Drag&Drop cviceni, prevedenych do nove technologie:
  //      var p = ex.url.split('/');
  //      exLoc = loc == null ? null : loc[p[p.length - 1]];
  //    }
  //    ex.title = Trados.localize(ex.title, exLoc);
  //    ex.html = Trados.localize(parts[i + 1], exLoc);
  //    ex.index = res.length;
  //    if (flag == flag_urlDict) res[ex.url] = ex;
  //    else res.push(ex);
  //  }
  //  return res;
  //}
  //export function parseAndLocalize(data, locData: string, flag: number = 0): exStatic[]{
  //  return parseAndLocalizeLow(data, locData == null ? null : JSON.parse(locData), flag);
  //}

  //export function grammLinear(gramm: grammarNode): grammarNode[]{
  //  if (!gramm) return null;
  //  var res: grammarNode[] = [];
  //  grScan(gramm, res);
  //  return res;
  //}
  //function grScan(gramm: grammarNode, res: grammarNode[]) {
  //  if (!gramm.items) return;
  //  for (var i = 0; i < gramm.items.length; i++) {
  //    var it = gramm.items[i];
  //    if (it.items) grScan(it, res); else {
  //      it.idx = res.length;
  //      res.push(it);
  //    }
  //  }
  //}
}
