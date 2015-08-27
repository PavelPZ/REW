module vyzva {

 
  //*************** RESOLVERs
  //adjust produkt
  export var loadProduct = ['$stateParams', (ctx: blended.learnContext) => {
    blended.finishContext(ctx);
    ctx.finishProduct = finishHomeDataNode;
    return blended.loader.adjustProduct(ctx);
  }];

  export var loadIntranetInfo = (bothData: boolean) => ['$stateParams', (ctx: blended.learnContext) => {
    blended.finishContext(ctx);
    var def = ctx.$q.defer<intranet.ILoadIntranetInfoResult>();
    proxies.vyzva57services.loadCompanyData(ctx.companyid, true, bothData, res => {
      if (!res) res = <any>{};
      def.resolve({
        learningData: intranet.enteredProductInfo(res.LearningData, ctx.lickeys, LMStatus.Cookie),
        orderData: res.OrderData ? JSON.parse(res.OrderData) : null,
      });
    });
    return def.promise;
  }];

  export interface IStateNames extends blended.IProductStates {
    root?: blended.state;
    pretest?: blended.state;
    lessonExercise?: blended.state;
    lesson?: blended.state;
    pretestTask?: blended.state;
    lessonTask?: blended.state;
    shoolManager?: blended.state;
    langmasterManager?: blended.state;
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
    //  blended.state.onRouteChangeStart(e, toState, toParams, $location, $state);
    //});
  }];
  export function initVyzvaStates(params: blended.createStatePars) {
    stateNames.root = new blended.state({
      name: 'pg.ajs',
      url: '/ajs',
      abstract: true,
      controller: () => { Pager.clearHtml(); }, //vyhozeni old obsahu 
      template: "<div data-ui-view></div>",
      childs: [
        new blended.state({
          name: 'managers',
          url: "/managers/:companyid/:loginid/:loc/:lickeys", //lickeys ve formatu <UserLicences.LicenceId>|<UserLicences.Counter>#<UserLicences.LicenceId>|<UserLicences.Counter>...
          template: "<div data-ui-view></div>",
          abstract: true,
          childs: [
            stateNames.langmasterManager = new blended.state({
              name: 'langmastermanager',
              url: "/langmastermanager",
              templateUrl: pageTemplate,
              data: getDataConfig('managerlangmaster', 'empty'),
              controller: managerLANGMaster,
              resolve: {
                $intranetInfo: loadIntranetInfo(true),
              },
            }),
            stateNames.shoolManager = new blended.state({
              name: 'schoolmanager',
              url: "/schoolmanager",
              templateUrl: pageTemplate,
              data: getDataConfig('managerschool', 'empty'),
              controller: managerSchool,
              resolve: {
                $intranetInfo: loadIntranetInfo(true),
              },
            }),
          ]
        }),
        blended.prodStates.homeTask = stateNames.homeTask = new blended.state({
          name: 'vyzva',
          url: "/vyzva/:persistence/:taskid/:companyid/:loginid/:userdataid/:loc/:producturl/:lickeys",
          dataNodeUrlParName: 'productUrl',
          controller: homeTaskController,
          abstract: true,
          resolve: {
            $loadedProduct: loadProduct,
            $intranetInfo: loadIntranetInfo(false),
          },
          template: "<div data-ui-view></div>",
          childs: [
            blended.prodStates.home = stateNames.home = new blended.state({
              name: 'home',
              url: "/home",
              controller: homeViewController,
              data: $.extend(getDataConfig('home', 'empty'), {
                dataPretestItem: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/home/pretestItem.html',
              }),
              templateUrl: pageTemplate,
            }),
            stateNames.pretestTask = new blended.state({
              name: 'pretest',
              url: '/pretest/:pretesturl',
              controller: blended.pretestTaskController,
              dataNodeUrlParName: 'pretestUrl',
              abstract: true,
              template: "<div data-ui-view></div>",
              childs: [
                stateNames.pretest = new blended.state({
                  name: 'home',
                  url: "/home",
                  data: getDataConfig('pretest', 'empty'),
                  controller: pretestViewController,
                  templateUrl: pageTemplate,
                }),
                blended.prodStates.pretestModule = new blended.state({
                  name: 'test',
                  url: '/test/:moduleurl',
                  controller: blended.moduleTaskController,
                  dataNodeUrlParName: 'moduleUrl',
                  data: blended.createStateData<blended.IModuleStateData>({ alowCycleExercise: false }),
                  abstract: true,
                  template: "<div data-ui-view></div>",
                  childs: [
                    blended.prodStates.pretestExercise = stateNames.pretestExercise = new blended.state({
                      name: 'ex',
                      url: '/ex/:url',
                      controller: pretestExercise,
                      dataNodeUrlParName: 'Url',
                      data: $.extend(getDataConfig('exercise', 'run'), blended.createStateData<blended.IExerciseStateData>({ isTest: true })),
                      resolve: {
                        //$loadedExAnUser: blended.exAndUser,
                        $loadedEx: blended.loadEx,
                        $loadedLongData: blended.loadLongData,
                      },
                      templateUrl: pageTemplate,
                    })
                  ]
                }),
              ]
            }),
            stateNames.lessonTask = new blended.state({
              name: 'lesson',
              url: '/lesson/:moduleurl',
              controller: moduleTaskController,
              dataNodeUrlParName: 'moduleUrl',
              abstract: true,
              template: "<div data-ui-view></div>",
              childs: [
                stateNames.lesson = new blended.state({
                  name: 'home',
                  url: '/home',
                  data: getDataConfig('module', 'run'),
                  controller: moduleViewController,
                  templateUrl: pageTemplate,
                }),
                stateNames.lessonExercise = new blended.state({
                  name: 'ex',
                  url: '/ex/:url',
                  controller: lessonExercise,
                  dataNodeUrlParName: 'Url',
                  data: getDataConfig('exercise', 'run'),
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

  interface IDataConfig {
    dataTemplate: string;
    dataToolbar: string;
    dataToolbarType: string;
  }

  function getDataConfig(page: string, toolbar: string): IDataConfig {
    return {
      dataTemplate: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/' + page + '.html',
      dataToolbar: blended.baseUrlRelToRoot + '/blendedapi/vyzva/ViewParts/Toolbar/toolbar.html',
      dataToolbarType: blended.baseUrlRelToRoot + '/blendedapi/vyzva/ViewParts/Toolbar/' + toolbar + '.html',
    };
  }
  var pageTemplate = blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/_pageTemplate.html';

}
  