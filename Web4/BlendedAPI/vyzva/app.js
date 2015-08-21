var vyzva;
(function (vyzva) {
    //*************** RESOLVERs
    //adjust produkt
    vyzva.loadProduct = ['$stateParams', function ($stateParams) {
            blended.finishContext($stateParams);
            $stateParams.finishProduct = vyzva.finishProdukt;
            return blended.loader.adjustProduct($stateParams);
        }];
    //adjust root task
    vyzva.initRootTasks = ['$stateParams', '$q', '$loadedProduct', function ($stateParams, $q, product) {
            var def = $q.defer();
            $stateParams.product = product;
            blended.finishContext($stateParams);
            new vyzva.blendedCourseTask(product, $stateParams, null, function (t) { return def.resolve(t); });
            return def.promise;
        }];
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
            url: "/vyzvaproduct/:persistence/:taskid/:companyid/:userid/:subuserid/:loc/:producturl",
            abstract: true,
            resolve: {
                $loadedProduct: vyzva.loadProduct,
                $rootTask: vyzva.initRootTasks,
            },
            template: "<div data-ui-view></div>",
        })
            .state({
            name: vyzva.stateNames.productHome = 'pg.ajs.vyzvaproduct.root',
            url: '/root',
            controller: vyzva.productHomeController,
            data: $.extend(getDataConfig('product', 'empty'), {
                dataPretestItem: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/producthome/pretestItem.html',
            }),
            templateUrl: pageTemplate,
        })
            .state({
            name: vyzva.stateNames.pretestHome = 'pg.ajs.vyzvaproduct.pretest',
            url: '/root/pretest',
            data: getDataConfig('pretest', 'empty'),
            controller: vyzva.pretestHomeController,
            templateUrl: pageTemplate,
        })
            .state({
            name: vyzva.stateNames.moduleHome = 'pg.ajs.vyzvaproduct.module',
            url: '/root/pretest/level/:moduleurl/:mode',
            data: getDataConfig('module', 'run'),
            controller: vyzva.moduleHomeController,
            templateUrl: pageTemplate,
        })
            .state({
            name: vyzva.stateNames.exercise = 'pg.ajs.vyzvaproduct.exercise',
            url: '/exercise/:tasktype/:moduleurl/:mode/:url',
            data: getDataConfig('module', 'module'),
            controller: vyzva.exerciseController,
            templateUrl: pageTemplate,
        })
            .state({
            name: 'pg.ajs.vyzva',
            url: "/vyzva/:persistence/:taskid/:companyid/:userid/:subuserid/:loc/:producturl",
            abstract: true,
            controller: vyzva.homeTaskController,
            resolve: {
                $loadedProduct: vyzva.loadProduct,
            },
            template: "<div data-ui-view></div>",
        })
            .state({
            name: vyzva.stateNames.productHome = 'pg.ajs.vyzva.home',
            url: "/home",
            controller: vyzva.homeViewController,
            data: $.extend(getDataConfig('product', 'empty'), {
                dataPretestItem: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/producthome/pretestItem.html',
            }),
            templateUrl: pageTemplate,
        })
            .state({
            name: 'pg.ajs.vyzva.pretest',
            url: '/pretest/:pretesturl',
            abstract: true,
            controller: vyzva.pretestTaskController,
            template: "<div data-ui-view></div>",
        })
            .state({
            name: vyzva.stateNames.pretestHome = 'pg.ajs.vyzva.pretest.home',
            url: "/home",
            data: getDataConfig('pretest', 'empty'),
            controller: vyzva.pretestViewController,
            templateUrl: pageTemplate,
        })
            .state({
            name: 'pg.ajs.vyzva.pretest.ex',
            url: '/ex/:moduleurl:/:url',
            data: getDataConfig('exercise', 'module'),
            controller: vyzva.exerciseTaskController,
            templateUrl: pageTemplate,
        })
            .state({
            name: 'pg.ajs.vyzva.lesson',
            url: '/lesson/:moduleurl',
            abstract: true,
            controller: vyzva.moduleTaskController,
            template: "<div data-ui-view></div>",
        })
            .state({
            name: 'pg.ajs.vyzva.lesson.home',
            url: '/home',
            data: getDataConfig('module', 'run'),
            controller: vyzva.moduleViewController,
            templateUrl: pageTemplate,
        })
            .state({
            name: 'pg.ajs.vyzva.lesson.ex',
            url: '/ex/:moduleurl:/url',
            data: getDataConfig('exercise', 'run'),
            controller: vyzva.exerciseTaskController,
            templateUrl: pageTemplate,
        });
    }
    vyzva.registerNew = registerNew;
    function getDataConfig(page, toolbar) {
        return {
            dataTemplate: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/' + page + 'home.html',
            dataToolbar: blended.baseUrlRelToRoot + '/blendedapi/vyzva/ViewParts/Toolbar/toolbar.html',
            dataToolbarType: blended.baseUrlRelToRoot + '/blendedapi/vyzva/ViewParts/Toolbar/' + toolbar + '.html',
        };
    }
    var pageTemplate = blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/_pageTemplate.html';
})(vyzva || (vyzva = {}));
