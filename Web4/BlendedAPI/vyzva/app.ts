module vyzva {

 
  //*************** RESOLVERs
  //adjust produkt
  export var loadProduct = ['$stateParams', ($stateParams: blended.learnContext) => {
    blended.finishContext($stateParams);
    $stateParams.finishProduct = finishProdukt;
    return blended.loader.adjustProduct($stateParams);
  }];

  //adjust root task
  export var initRootTasks = ['$stateParams', '$q', '$loadedProduct', ($stateParams: blended.learnContext, $q: ng.IQService, product: blended.IProductEx) => {
    var def = $q.defer<blendedCourseTask>();
    $stateParams.product = product;
    blended.finishContext($stateParams);
    new blendedCourseTask(product, $stateParams, null, t => def.resolve(<blendedCourseTask>t));
    return def.promise;
  }];


  export interface IStateNames {
    productHome?: string;
    pretestHome?: string;
    exercise?: string;
    moduleHome?: string;
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
        url: "/vyzvaproduct/:persistence/:taskid/:companyid/:userid/:subuserid/:loc/:producturl",
        abstract: true,
        resolve: {
          $loadedProduct: vyzva.loadProduct,
          $rootTask: vyzva.initRootTasks,
        },
        template: "<div data-ui-view></div>",
      })
      .state({
        name: stateNames.productHome = 'pg.ajs.vyzvaproduct.root',
        url: '/root',
        controller: productHomeController,
        data: $.extend(getDataConfig('product', 'empty'), {
          dataPretestItem: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/producthome/pretestItem.html',
        }),
        templateUrl: pageTemplate,
      })
      .state({
        name: stateNames.pretestHome = 'pg.ajs.vyzvaproduct.pretest',
        url: '/root/pretest',
        data: getDataConfig('pretest', 'empty'),
        controller: pretestHomeController,
        templateUrl: pageTemplate,
      })
      .state({
        name: stateNames.moduleHome = 'pg.ajs.vyzvaproduct.module',
        url: '/root/pretest/level/:moduleurl/:mode', //mode=course, test, preview. tasktype=lesson, pretest
        data: getDataConfig('module', 'run'),
        controller: moduleHomeController,
        templateUrl: pageTemplate,
      })
      .state({
        name: stateNames.exercise = 'pg.ajs.vyzvaproduct.exercise',
        url: '/exercise/:tasktype/:moduleurl/:mode/:url', //mode=course, test, preview. tasktype=lesson, pretest
        data: getDataConfig('module', 'module'),
        controller: exerciseController,
        templateUrl: pageTemplate,
      })
    //***************** NEW
      //** HOME
      .state({
        name: 'pg.ajs.vyzva',
        url: "/vyzva/:persistence/:taskid/:companyid/:userid/:subuserid/:loc/:producturl",
        abstract:true,
        controller: homeTaskController,
        resolve: {
          $loadedProduct: vyzva.loadProduct,
        },
        template: "<div data-ui-view></div>",
      })
      .state({
        name: stateNames.productHome = 'pg.ajs.vyzva.home',
        url: "/home",
        controller: homeViewController,
        data: $.extend(getDataConfig('product', 'empty'), {
          dataPretestItem: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/producthome/pretestItem.html',
        }),
        templateUrl: pageTemplate,
      })
      //** PRETEST
      .state({
        name: 'pg.ajs.vyzva.pretest',
        url: '/pretest/:pretesturl',
        abstract: true,
        controller: pretestTaskController,
        template: "<div data-ui-view></div>",
      })
      .state({
        name: stateNames.pretestHome = 'pg.ajs.vyzva.pretest.home',
        url: "/home",
        data: getDataConfig('pretest', 'empty'),
        controller: pretestViewController,
        templateUrl: pageTemplate,
      })
      //** PRETEST EXERCISE
      .state({
        name: 'pg.ajs.vyzva.pretest.ex',
        url: '/ex/:moduleurl:/:url',
        data: getDataConfig('exercise', 'module'),
        controller: exerciseTaskController,
        templateUrl: pageTemplate,
      })
      //** LESSON
      .state({
        name: 'pg.ajs.vyzva.lesson',
        url: '/lesson/:moduleurl',
        abstract: true,
        controller: moduleTaskController,
        template: "<div data-ui-view></div>",
      })
      .state({
        name: 'pg.ajs.vyzva.lesson.home',
        url: '/home',
        data: getDataConfig('module', 'run'),
        controller: moduleViewController,
        templateUrl: pageTemplate,
      })
      //** LESSON EXERCISE
      .state({
        name: 'pg.ajs.vyzva.lesson.ex',
        url: '/ex/:moduleurl:/url',
        data: getDataConfig('exercise', 'run'),
        controller: exerciseTaskController,
        templateUrl: pageTemplate,
      })
    ;
  }

  interface IDataConfig {
    dataTemplate: string;
    dataToolbar: string;
    dataToolbarType: string;
  }

  function getDataConfig(page: string, toolbar: string): IDataConfig {
    return {
      dataTemplate: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/' + page + 'home.html',
      dataToolbar: blended.baseUrlRelToRoot + '/blendedapi/vyzva/ViewParts/Toolbar/toolbar.html',
      dataToolbarType: blended.baseUrlRelToRoot + '/blendedapi/vyzva/ViewParts/Toolbar/' + toolbar + '.html',
    };
  }
  var pageTemplate = blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/_pageTemplate.html';

}

