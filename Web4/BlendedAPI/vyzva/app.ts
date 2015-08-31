module vyzva {

  export var vyzvaRoot = blended.baseUrlRelToRoot + '/blendedapi/vyzva/';
 
  //*************** RESOLVERs
  //adjust produkt
  export var loadProduct = ['$stateParams', (ctx: blended.learnContext) => {
    blended.finishContext(ctx);
    ctx.finishProduct = finishHomeDataNode;
    return blended.loader.adjustProduct(ctx);
  }];

  export var loadIntranetInfo = () => ['$stateParams', (ctx: blended.learnContext) => {
    blended.finishContext(ctx);
    var def = ctx.$q.defer<intranet.IAlocatedKeyRoot>();
    proxies.vyzva57services.loadCompanyData(ctx.companyid, res => {
      if (!res) { def.resolve(null); return; }
      var compInfo = intranet.enteredProductInfo(res, ctx.lickeys, LMStatus.Cookie);
      if (compInfo && compInfo.jsonToSave) {
        proxies.vyzva57services.writeCompanyData(ctx.companyid, compInfo.jsonToSave, () => def.resolve(compInfo));
      } else
        def.resolve(compInfo);
    });
    return def.promise;
  }];

  export interface IStateNames extends blended.IProductStates {
    root?: state;
    pretest?: state;
    lessonExercise?: state;
    lesson?: state;
    pretestTask?: state;
    lector?: state;
    lectorHome?: state;
    lessonTask?: state;
    shoolManager?: state;
    langmasterManager?: state;
    lectorTask?: state;
  }
  export var stateNames: IStateNames = {}; //taskRoot: 'root', taskCheckTest: 'checktest', taskLesson: 'lesson', taskPretest: 'pretest', taskPretestItem: 'pretestitem' };

  export var initVyzvaApp = ['$rootScope', '$location', '$state', ($rootScope: angular.IRootScopeService, $location: angular.ILocationService, $state: angular.ui.IStateService) => {

    //$rootScope.$on('$locationChangeStart', (event: angular.IAngularEvent, newUrl: string, oldUrl: string, newState, oldState) => {
    //  if (location.hash == '#/pg/ajs/vyzva//def/1/1/1/2/!lm!blcourse!langmastermanager.product!/home') {
    //    event.preventDefault();
    //    setTimeout(() => location.hash = '#/pg/ajs/langmastermanager', 1);
    //  } else if (location.hash == '#/pg/ajs/vyzva//def/1/1/1/2/!lm!blcourse!schoolmanager.product!/home') {
    //    event.preventDefault();
    //    setTimeout(() => location.hash = '#/pg/ajs/schoolmanager', 1);
    //  }
    //})

    //sance zrusit ladovani stranky
    //$rootScope.$on('$stateChangeStart', (e, toState, toParams, fromState, fromParams) => {
    //  blended.finishContext(toParams);
    //  state.onRouteChangeStart(e, toState, toParams, $location, $state);
    //});
  }];

  //rozsireni ui-route a blended STATE 
  export interface IState extends angular.ui.IState {
    layoutContentId?: string; //template stranky
    layoutToolbarType?: string; //typ toolbaru (nazev souboru v toolbar adresari)
    lectorTabId?: string;
  }
  export class state extends blended.state { constructor(st: IState) { super(st); } }

  blended.rootModule
    .filter('vyzva$state$viewpath', () => (id: string) => vyzvaRoot + 'views/' + id + '.html')
  ;

  var pageTemplate = vyzvaRoot + 'views/_pageTemplate.html';

  export function initVyzvaStates(params: blended.createStatePars) {
    stateNames.root = new state({
      name: 'pg.ajs',
      url: '/ajs',
      abstract: true,
      controller: () => { Pager.clearHtml(); }, //vyhozeni old obsahu 
      template: "<div data-ui-view></div>",
      childs: [
        new state({
          name: 'managers',
          url: "/vyzva/managers/:companyid/:loginid/:lickeys",
          template: "<div data-ui-view></div>",
          abstract: true,
          childs: [
            stateNames.shoolManager = new state({
              name: 'schoolmanager',
              url: "/schoolmanager",
              templateUrl: pageTemplate,
              layoutContentId: 'managerschool',
              controller: managerSchool,
              resolve: {
                $intranetInfo: loadIntranetInfo(),
              },
            }),
          ]
        }),
        blended.prodStates.homeTask = stateNames.homeTask = new state({
          name: 'vyzva',
          //lickeys ve formatu <UserLicences.LicenceId>|<UserLicences.Counter>#<UserLicences.LicenceId>|<UserLicences.Counter>...
          url: "/vyzva/:companyid/:loginid/:userdataid/:persistence/:loc/:lickeys/:producturl/:taskid",
          dataNodeUrlParName: 'productUrl',
          controller: homeTaskController,
          abstract: true,
          resolve: {
            $loadedProduct: loadProduct,
            $intranetInfo: loadIntranetInfo(),
          },
          template: "<div data-ui-view></div>",
          childs: [
            blended.prodStates.home = stateNames.home = new state({
              name: 'home',
              url: "/home",
              controller: homeViewController,
              layoutContentId: 'home',
              templateUrl: pageTemplate,
            }),
            stateNames.lector = new state({
              name: 'lector',
              url: "/lector/:groupid",
              controller: lectorController,
              abstract: true,
              template: "<div data-ui-view></div>",
              childs: [
                stateNames.lectorHome = new state({
                  name: 'home',
                  url: "/home",
                  controller: lectorViewController,
                  layoutContentId: 'lector',
                  lectorTabId: 'home',
                  templateUrl: pageTemplate,
                }),
                new state({
                  name: 'a1',
                  url: "/a1",
                  controller: lectorLevelController,
                  layoutContentId: 'lectorLevel',
                  lectorTabId: '???',
                  templateUrl: pageTemplate,
                }),
              ]
            }),
            stateNames.pretestTask = new state({
              name: 'pretest',
              url: '/pretest/:pretesturl',
              controller: blended.pretestTaskController,
              dataNodeUrlParName: 'pretestUrl',
              abstract: true,
              template: "<div data-ui-view></div>",
              childs: [
                stateNames.pretest = new state({
                  name: 'home',
                  url: "/home",
                  layoutContentId: 'pretest',
                  controller: pretestViewController,
                  templateUrl: pageTemplate,
                }),
                blended.prodStates.pretestModule = new state({
                  name: 'test',
                  url: '/test/:moduleurl',
                  controller: blended.moduleTaskController,
                  dataNodeUrlParName: 'moduleUrl',
                  moduleAlowCycleExercise: false,
                  abstract: true,
                  template: "<div data-ui-view></div>",
                  childs: [
                    blended.prodStates.pretestExercise = stateNames.pretestExercise = new state({
                      name: 'ex',
                      url: '/ex/:url',
                      controller: pretestExercise,
                      dataNodeUrlParName: 'Url',
                      layoutContentId: 'exercise',
                      layoutToolbarType: 'toolbar/run',
                      ommitTitle: true,
                      exerciseIsTest: true,
                      exerciseOmitModuleMap: true,
                      resolve: {
                        $loadedEx: blended.loadEx,
                        $loadedLongData: blended.loadLongData,
                      },
                      templateUrl: pageTemplate,
                    })
                  ]
                }),
              ]
            }),
            stateNames.lessonTask = new state({
              name: 'lesson',
              url: '/lesson/:moduleurl',
              controller: moduleTaskController,
              dataNodeUrlParName: 'moduleUrl',
              abstract: true,
              template: "<div data-ui-view></div>",
              childs: [
                stateNames.lesson = new state({
                  name: 'home',
                  url: '/home',
                  layoutContentId: 'module',
                  layoutToolbarType: 'toolbar/run',
                  controller: moduleViewController,
                  templateUrl: pageTemplate,
                }),
                stateNames.lessonExercise = new state({
                  name: 'ex',
                  url: '/ex/:url',
                  controller: lessonExercise,
                  dataNodeUrlParName: 'Url',
                  layoutContentId: 'exercise',
                  layoutToolbarType: 'toolbar/run',
                  templateUrl: pageTemplate,
                })
              ]
            })
          ]
        })
      ]
    });
    stateNames.root.initFromStateTree(params.$stateProvider);
  }

}
  