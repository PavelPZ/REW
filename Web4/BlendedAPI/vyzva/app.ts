module vyzva {

 
  //*************** RESOLVERs
  //adjust produkt
  export var loadProduct = ['$stateParams', ($stateParams: blended.learnContext) => {
    blended.finishContext($stateParams);
    $stateParams.finishProduct = finishHomeDataNode;
    return blended.loader.adjustProduct($stateParams);
  }];

  export var loadEx = ['$stateParams', ($stateParams: blended.learnContext) => {
    blended.finishContext($stateParams);
    $stateParams.finishProduct = finishHomeDataNode;
    return blended.loader.adjustEx($stateParams);
  }];

  export interface IStateNames extends blended.IProductStates {
    root?: blended.state;
    pretest?: blended.state;
    lessonExercise?: blended.state;
    lesson?: blended.state;
    pretestTask?: blended.state;
    lessonTask?: blended.state;

    //taskRoot: string;
    //taskLesson: string;
    //taskPretest: string;
    //taskPretestItem: string;
    //taskCheckTest: string;
  }
  export var stateNames: IStateNames = {}; //taskRoot: 'root', taskCheckTest: 'checktest', taskLesson: 'lesson', taskPretest: 'pretest', taskPretestItem: 'pretestitem' };

  export var initVyzvaApp = ['$rootScope', '$location', '$state', ($rootScope: angular.IRootScopeService, $location: angular.ILocationService, $state: angular.ui.IStateService) => {
    //sance zrusit ladovani stranky
    $rootScope.$on('$stateChangeStart',
      (e, toState, toParams, fromState, fromParams) => {
        blended.finishContext(toParams);
        blended.state.onRouteChangeStart(e, toState, toParams, $location, $state);
      }
      );
  }];
  export function initVyzvaStates(params: blended.createStatePars) {
    stateNames.root = new blended.state({
      name: 'pg.ajs',
      url: '/ajs',
      abstract: true,
      controller: () => { Pager.clearHtml(); }, //vyhozeni old obsahu 
      template: "<div data-ui-view></div>",
      childs: [
        blended.prodStates.homeTask = stateNames.homeTask = new blended.state({
          name: 'vyzva',
          url: "/vyzva/:persistence/:taskid/:companyid/:userid/:subuserid/:loc/:producturl",
          dataNodeUrlParName: 'productUrl',
          controller: homeTaskController,
          abstract: true,
          resolve: {
            $loadedProduct: vyzva.loadProduct,
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
                        $loadedEx: vyzva.loadEx,
                      },
                      templateUrl: pageTemplate,
                    })
                  ]
                }),
                //blended.prodStates.pretestExercise = stateNames.pretestExercise = new blended.state({
                //  name: 'ex',
                //  url: '/ex/:url',
                //  controller: pretestExercise,
                //  dataNodeUrlParName: 'Url',
                //  data: getDataConfig('exercise', 'run'),
                //  templateUrl: pageTemplate,
                //})
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
  