module vyzva {

  export interface IStateNames {
    productHome?: string;
    pretestHome?: string;
    exercise?: string;
    lessonHome?: string;
    pretestItemHome?: string;
    checkTestHome?: string;
    taskRoot: string;
    taskLesson: string;
    taskPretest: string;
    taskPretestItem: string;
    taskCheckTest: string;
  }
  export var stateNames: IStateNames = { taskRoot: 'root', taskCheckTest: 'checktest', taskLesson: 'lesson', taskPretest: 'pretest', taskPretestItem: 'pretestitem' };

  export function registerNew(params: blended.createStatePars) {
    params.$stateProvider
      .state({
        name: 'pg.ajs',
        url: '/ajs',
        abstract: true,
        controller: () => { Pager.clearHtml(); }, //vyhozeni old obsahu 
        template: "<div data-ui-view></div>",
      })
      .state({
        name: 'pg.ajs.vyzvaproduct',
        url: "/vyzvaproduct/:persistence/:taskid/:companyid/:userid/:adminid/:loc/:producturl",
        abstract: true,
        resolve: {
          $loadedProduct: vyzva.loadProduct,
          $rootTask: vyzva.initRootTasks,
        },
        templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/_productTemplate.html',
      })
      .state({
        name: stateNames.productHome = 'pg.ajs.vyzvaproduct.root',
        url: '/task/root',
        controller: productHomeController,
        templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/productHome.html',
      })
      .state({
        name: stateNames.pretestHome = 'pg.ajs.vyzvaproduct.pretest',
        url: '/task/pretest',
        controller: pretestHomeController,
        templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/pretestHome.html',
      })
      .state({
        name: stateNames.pretestItemHome = 'pg.ajs.vyzvaproduct.pretestitem',
        url: '/pretestitem/:url',
        controller: pretestItemHomeController,
        templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/pretestItemHome.html',
      })
      .state({
        name: stateNames.lessonHome = 'pg.ajs.vyzvaproduct.lessoon',
        url: '/lesson/:url',
        controller: lessonHomeController,
        templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/lessonHome.html',
      })
      .state({
        name: stateNames.checkTestHome = 'pg.ajs.vyzvaproduct.checktest',
        url: '/checktest/:url',
        controller: checkTestHomeController,
        templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/checkTestHome.html',
      })
      .state({
        name: stateNames.exercise = 'pg.ajs.vyzvaproduct.exercise',
        url: '/exercise/:tasktype/:url',
        controller: exerciseController,
        templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/exercise.html',
      })
    ;
  }
}