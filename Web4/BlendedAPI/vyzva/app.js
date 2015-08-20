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
            name: vyzva.stateNames.pretestItemHome = 'pg.ajs.vyzvaproduct.pretestitem',
            url: '/pretestitem/:url',
            controller: vyzva.pretestItemHomeController,
            templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/pretestItemHome.html',
        })
            .state({
            name: vyzva.stateNames.lessonHome = 'pg.ajs.vyzvaproduct.lessoon',
            url: '/lesson/:url',
            controller: vyzva.lessonHomeController,
            templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/lessonHome.html',
        })
            .state({
            name: vyzva.stateNames.checkTestHome = 'pg.ajs.vyzvaproduct.checktest',
            url: '/checktest/:url',
            controller: vyzva.checkTestHomeController,
            templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/checkTestHome.html',
        })
            .state({
            name: vyzva.stateNames.exercise = 'pg.ajs.vyzvaproduct.exercise',
            url: '/exercise/:tasktype/:url',
            controller: vyzva.exerciseController,
            templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/exercise.html',
        });
    }
    vyzva.registerNew = registerNew;
})(vyzva || (vyzva = {}));
