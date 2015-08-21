var vyzva;
(function (vyzva) {
    vyzva.stateNames = { taskRoot: 'root', taskCheckTest: 'checktest', taskLesson: 'lesson', taskPretest: 'pretest', taskPretestItem: 'pretestitem' };
    function registerNew(params) {
        params.$stateProvider
            .state({
            name: 'pg.ajs',
            url: '/ajs',
            abstract: true,
            controller: function () { Pager.clearHtml(); },
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
            name: vyzva.stateNames.productHome = 'pg.ajs.vyzvaproduct.root',
            url: '/task/root',
            controller: vyzva.productHomeController,
            templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/productHome.html',
        })
            .state({
            name: vyzva.stateNames.pretestHome = 'pg.ajs.vyzvaproduct.pretest',
            url: '/task/pretest',
            controller: vyzva.pretestHomeController,
            templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/pretestHome.html',
        })
            .state({
            name: vyzva.stateNames.moduleHome = 'pg.ajs.vyzvaproduct.module',
            url: '/module/:url/:mode',
            controller: vyzva.moduleHomeController,
            templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/moduleHome.html',
        })
            .state({
            name: vyzva.stateNames.exercise = 'pg.ajs.vyzvaproduct.exercise',
            url: '/exercise/:tasktype/:url/:mode',
            controller: vyzva.exerciseController,
            templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/exercise.html',
        });
    }
    vyzva.registerNew = registerNew;
})(vyzva || (vyzva = {}));
