var vyzva;
(function (vyzva) {
    //*************** RESOLVERs
    //adjust produkt
    vyzva.loadProduct = ['$stateParams', function ($stateParams) {
            blended.finishContext($stateParams);
            $stateParams.finishProduct = vyzva.finishHomeDataNode;
            return blended.loader.adjustProduct($stateParams);
        }];
    vyzva.stateNames = {}; //taskRoot: 'root', taskCheckTest: 'checktest', taskLesson: 'lesson', taskPretest: 'pretest', taskPretestItem: 'pretestitem' };
    vyzva.initVyzvaApp = ['$rootScope', '$location', '$state', function ($rootScope, $location, $state) {
            //sance zrusit ladovani stranky
            $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
                blended.finishContext(toParams);
                blended.state.onRouteChangeStart(e, toState, toParams, $location, $state);
            });
        }];
    function initVyzvaStates(params) {
        vyzva.stateNames.root = new blended.state({
            name: 'pg.ajs',
            url: '/ajs',
            abstract: true,
            controller: function () { Pager.clearHtml(); },
            template: "<div data-ui-view></div>",
            childs: [
                blended.prodStates.homeTask = vyzva.stateNames.homeTask = new blended.state({
                    name: 'vyzva',
                    url: "/vyzva/:persistence/:taskid/:companyid/:userid/:subuserid/:loc/:producturl",
                    dataNodeUrlParName: 'productUrl',
                    controller: vyzva.homeTaskController,
                    abstract: true,
                    resolve: {
                        $loadedProduct: vyzva.loadProduct,
                    },
                    template: "<div data-ui-view></div>",
                    childs: [
                        blended.prodStates.home = vyzva.stateNames.home = new blended.state({
                            name: 'home',
                            url: "/home",
                            controller: vyzva.homeViewController,
                            data: $.extend(getDataConfig('home', 'empty'), {
                                dataPretestItem: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/home/pretestItem.html',
                            }),
                            templateUrl: pageTemplate,
                        }),
                        vyzva.stateNames.pretestTask = new blended.pretestState({
                            name: 'pretest',
                            url: '/pretest/:pretesturl',
                            controller: vyzva.pretestTaskController,
                            dataNodeUrlParName: 'pretestUrl',
                            abstract: true,
                            template: "<div data-ui-view></div>",
                            childs: [
                                vyzva.stateNames.pretest = new blended.state({
                                    name: 'home',
                                    url: "/home",
                                    data: getDataConfig('pretest', 'empty'),
                                    controller: vyzva.pretestViewController,
                                    templateUrl: pageTemplate,
                                }),
                                new blended.state({
                                    name: 'test',
                                    url: '/test/:moduleurl',
                                    controller: blended.taskController,
                                    dataNodeUrlParName: 'moduleUrl',
                                    abstract: true,
                                    template: "<div data-ui-view></div>",
                                    childs: [
                                        blended.prodStates.pretestExercise = vyzva.stateNames.pretestExercise = new blended.state({
                                            name: 'ex',
                                            url: '/ex/:url',
                                            controller: vyzva.exerciseTaskController,
                                            dataNodeUrlParName: 'Url',
                                            data: getDataConfig('exercise', 'run'),
                                            templateUrl: pageTemplate,
                                        })
                                    ]
                                }),
                            ]
                        }, vyzva.stateNames.pretestExercise),
                        vyzva.stateNames.lessonTask = new blended.state({
                            name: 'lesson',
                            url: '/lesson/:moduleurl',
                            controller: vyzva.moduleTaskController,
                            dataNodeUrlParName: 'moduleUrl',
                            abstract: true,
                            template: "<div data-ui-view></div>",
                            childs: [
                                vyzva.stateNames.lesson = new blended.state({
                                    name: 'home',
                                    url: '/home',
                                    data: getDataConfig('module', 'run'),
                                    controller: vyzva.moduleViewController,
                                    templateUrl: pageTemplate,
                                }),
                                vyzva.stateNames.lessonExercise = new blended.state({
                                    name: 'ex',
                                    url: '/ex/:url',
                                    controller: vyzva.exerciseTaskController,
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
        vyzva.stateNames.root.initFromStateTree(params.$stateProvider);
    }
    vyzva.initVyzvaStates = initVyzvaStates;
    function getDataConfig(page, toolbar) {
        return {
            dataTemplate: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/' + page + '.html',
            dataToolbar: blended.baseUrlRelToRoot + '/blendedapi/vyzva/ViewParts/Toolbar/toolbar.html',
            dataToolbarType: blended.baseUrlRelToRoot + '/blendedapi/vyzva/ViewParts/Toolbar/' + toolbar + '.html',
        };
    }
    var pageTemplate = blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/_pageTemplate.html';
})(vyzva || (vyzva = {}));
