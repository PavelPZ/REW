﻿module angular.ui {
  //rozsireni ui-route a blended STATE 
  export interface IState {
    layoutContentId?: string; //template stranky
    layoutToolbarType?: string; //typ toolbaru (nazev souboru v toolbar adresari)
    pageTitlePlace?: vyzva.pageTitlePlace;
  }
}

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
    pretestPreview?: state;
    homeLessonEx?: state;
    homeLessonTest?: state;
    lesson?: state;
    pretestTask?: state;
    lector?: state;
    lectorHome?: state;
    lectorEval?: state;
    moduleLessonTask?: state;
    moduleTestTask?: state;
    shoolManager?: state;
    langmasterManager?: state;
    lectorTask?: state;
  }
  export var stateNames: IStateNames = {}; //taskRoot: 'root', taskCheckTest: 'checktest', taskLesson: 'lesson', taskPretest: 'pretest', taskPretestItem: 'pretestitem' };

  export var initVyzvaApp = ['$rootScope', '$location', '$state', ($rootScope: angular.IRootScopeService, $location: angular.ILocationService, $state: angular.ui.IStateService) => {

    //$rootScope.$on('$locationChangeStart', (event: angular.IAngularEvent, newUrl: string, oldUrl: string, newState, oldState) => {
    //})

    //sance zrusit ladovani stranky
    $rootScope.$on('$stateChangeStart', (e, toState, toParams, fromState, fromParams) => {
      blended.finishContext(fromParams);
      var prod = blended.loader.productCache.fromCache(fromParams);
      if (prod) prod.saveProduct(fromParams, $.noop);
    });
  }];

  export class state extends blended.state {
    constructor(st: angular.ui.IState) { super(st); }
    pageTitlePlace: vyzva.pageTitlePlace;
  }

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
          url: "/vyzva/:companyid/:loginid/:persistence/:loc/:lickeys/:producturl/:taskid?:onbehalfof&returnurl",
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
                  templateUrl: pageTemplate,
                }),
                stateNames.lectorEval = new state({
                  name: 'eval',
                  url: "/eval",
                  controller: lectorEvalController,
                  layoutContentId: 'lector/eval',
                  templateUrl: pageTemplate,
                }),
              ]
            }),
            stateNames.pretestTask = new state({
              name: 'pretest',
              url: '/pretest/:pretesturl',
              controller: blended.pretestTaskController,
              dataNodeUrlParName: 'pretestUrl',
              isGreenArrowRoot:true,
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
                  abstract: true,
                  moduleType: blended.moduleServiceType.pretest,
                  template: "<div data-ui-view></div>",
                  childs: [
                    blended.prodStates.pretestExercise = stateNames.pretestExercise = new state({
                      name: 'ex',
                      url: '/ex/:url',
                      controller: pretestExercise,
                      dataNodeUrlParName: 'Url',
                      layoutContentId: 'exercise',
                      layoutToolbarType: 'toolbar/run',
                      pageTitlePlace: pageTitlePlace.none,
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
            stateNames.pretestPreview = new state({
              name: 'testview',
              url: '/testview/:moduleurl',
              controller: moduleTaskController,
              dataNodeUrlParName: 'moduleUrl',
              isGreenArrowRoot: true,
              abstract: true,
              template: "<div data-ui-view></div>",
              childs: [
                new state({
                  name: 'ex',
                  url: '/:url',
                  controller: lessonTest,
                  exerciseIsTest: true,
                  dataNodeUrlParName: 'Url',
                  layoutContentId: 'exercise',
                  resolve: {
                    $loadedEx: blended.loadEx,
                    $loadedLongData: blended.loadLongData,
                  },
                  templateUrl: pageTemplate,
                })
              ]
            }),
            stateNames.moduleLessonTask = new state({
              name: 'lesson',
              url: '/lesson/:moduleurl',
              controller: moduleTaskController,
              dataNodeUrlParName: 'moduleUrl',
              isGreenArrowRoot: true,
              moduleType: blended.moduleServiceType.lesson,
              abstract: true,
              template: "<div data-ui-view></div>",
              childs: [
                new state({
                  name: 'ex',
                  url: '/:url',
                  controller: lessonExercise,
                  dataNodeUrlParName: 'Url',
                  layoutContentId: 'exercise',
                  layoutToolbarType: 'toolbar/run',
                  resolve: {
                    $loadedEx: blended.loadEx,
                    $loadedLongData: blended.loadLongData,
                  },
                  templateUrl: pageTemplate,
                }),
              ]
            }),
            stateNames.moduleTestTask = new state({
              name: 'test',
              url: '/test/:moduleurl',
              controller: moduleTaskController,
              dataNodeUrlParName: 'moduleUrl',
              isGreenArrowRoot: true,
              abstract: true,
              template: "<div data-ui-view></div>",
              moduleType: blended.moduleServiceType.test,
              childs: [
                new state({
                  name: 'ex',
                  url: '/:url',
                  controller: lessonTest,
                  exerciseIsTest: true,
                  dataNodeUrlParName: 'Url',
                  layoutContentId: 'exercise',
                  layoutToolbarType: 'toolbar/run',
                  resolve: {
                    $loadedEx: blended.loadEx,
                    $loadedLongData: blended.loadLongData,
                  },
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
  