
//module prods {

  //export var Items: schools.root[] = null; //info o vsech dostupnych produktech
  //export var Crs2RwMap: Rew.Crs2RwMapItem[] = null; //prirazeni rewise lekci k lekcim kurzu, Crs2RwMap[<lesson jsonId>] = Rew.Crs2RwMapItem
  //export var all: CourseMeta.data[] = null; //info o vsech dostupnych produktech

  //export function init(completed: () => void): void {
  //  CourseMeta.lib.adjustAllProductList(completed);
  //  //return;
  //  //var pth = Pager.filePath(Pager.pathType.sitemapRoot, null).url;
  //  //var pthCrs2Rew = Pager.filePath(Pager.pathType.course2rewiseMap, null, Trados.actLangCode).urlLoc;
  //  //schools.readAppData(pth, res => {
  //  //  var obj = JSON.parse(res); Items = RJSON.unpack(obj);
  //  //  completed();
  //  //  /*if (cfg.target != LMComLib.Targets.web) { completed(); return; }
  //  //  schools.readAppData(pthCrs2Rew, resCrs2Rew => {
  //  //    obj = JSON.parse(resCrs2Rew); Crs2RwMap = RJSON.unpack(obj);
  //  //    completed();
  //  //  });*/
  //  //});
  //}

  //export function get(productId: string): schools.root {
  //  return _.find(Items, prod => prod.url == productId);
  //}

  //export function findProduct(productId: string): CourseMeta.data {
  //  return _.find(CourseMeta.allProductList, prod => prod.url == productId);
  //}
  //export function rewLessonId(jsonId: string): number {
  //  if (!Crs2RwMap) return 0;
  //  var map: Rew.Crs2RwMapItem = Crs2RwMap[jsonId];
  //  return map ? map.rwId : 0;
  //}

  ////k lekci zadanou jsonId vrati staticka data rewise lekce
  //export function getRewLesson(jsonId: string, completed: (l: Rew.LessonDataSrc) => void ): void {
  //  if (!Crs2RwMap) { completed(null); return; }
  //  var crs2Rew: Rew.Crs2RwMapItem = Crs2RwMap[jsonId];
  //  if (!crs2Rew) { completed(null); return; }
  //  var lng = crs2Rew.locRatioPromile > 100 ? Trados.actLangCode : "no";
  //  var pth = Pager.filePath(Pager.pathType.rewiseLesson, crs2Rew.rwId.toString(), lng).urlLoc;
  //  schools.readAppData(pth, rewLessStr => {
  //    var obj = JSON.parse(rewLessStr); var res: Rew.LessonDataSrc = RJSON.unpack(obj);
  //    completed(res);
  //  });
  //}

  //export function lineTxt(productId: string): string {
  //  return LowUtils.EnumToString(LMComLib.LineIds, CourseMeta.lib.findProduct(productId).line);
  //}

  //export function read(productId: string, completed: (crsTree: schools.root) => void) {
  //  schools.readAppDataAndLoc(
  //    //Pager.filePath(Pager.pathType.sitemaps, get(productId).fileName, Trados.actLangCode),
  //    Pager.filePath(Pager.pathType.sitemaps, productId, Trados.actLangCode),
  //    (d, l) => completed(Trados.localizeObject(d, JSON.parse(l), true)));
  //}


  //export function read2(productId: string, completed: (prod: CourseMeta.product) => void) {
  //  CourseMeta.lib.adjustProduct(productId, () => completed(CourseMeta.actProduct));
  //}

  //export function readDict(completed: (dicts: LMComLib.Dict[]) => void ) {
  //  var pth = Pager.filePath(Pager.pathType.dictInfo, null).url;
  //  schools.readAppData(pth, res => {
  //    var obj = JSON.parse(res);
  //    completed(RJSON.unpack(obj));
  //  });
  //}

  //$.views.helpers({
  //  productLineTxt: CourseMeta.lib.productLineTxt,
  //  productLineTxtLower: (productId) => CourseMeta.lib.productLineTxt(productId).toLowerCase(),
  //});

//}

