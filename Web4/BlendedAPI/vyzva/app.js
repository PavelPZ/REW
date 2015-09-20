var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vyzva;
(function (vyzva) {
    vyzva.vyzvaRoot = blended.baseUrlRelToRoot + '/blendedapi/vyzva/';
    //*************** RESOLVERs
    //adjust produkt
    vyzva.loadProduct = ['$stateParams', function (ctx) {
            blended.finishContext(ctx);
            ctx.finishProduct = vyzva.finishHomeDataNode;
            return blended.loader.adjustProduct(ctx);
        }];
    vyzva.loadIntranetInfo = function () { return ['$stateParams', function (ctx) {
            blended.finishContext(ctx);
            var def = ctx.$q.defer();
            proxies.vyzva57services.loadCompanyData(ctx.companyid, function (res) {
                if (!res) {
                    def.resolve(null);
                    return;
                }
                var compInfo = vyzva.intranet.enteredProductInfo((JSON.parse(res)), ctx.lickeys, LMStatus.Cookie);
                if (compInfo && compInfo.jsonToSave) {
                    proxies.vyzva57services.writeCompanyData(ctx.companyid, compInfo.jsonToSave, function () { return def.resolve(compInfo); });
                }
                else
                    def.resolve(compInfo);
            });
            return def.promise;
        }]; };
    vyzva.stateNames = {}; //taskRoot: 'root', taskCheckTest: 'checktest', taskLesson: 'lesson', taskPretest: 'pretest', taskPretestItem: 'pretestitem' };
    vyzva.initVyzvaApp = ['$rootScope', '$location', '$state', function ($rootScope, $location, $state) {
            //$rootScope.$on('$locationChangeStart', (event: angular.IAngularEvent, newUrl: string, oldUrl: string, newState, oldState) => {
            //})
            //sance zrusit ladovani stranky
            //$rootScope.$on('$stateChangeStart', (e, toState, toParams, fromState, fromParams) => {
            $rootScope.$on('$stateChangeSuccess', function (e, toState, toParams, fromState, fromParams) {
                $rootScope.$broadcast('onStateChangeSuccess'); //sance pred ulozenim produktu naplnit data. Vyuzije pro volani exerciseService.onDestroy
                var prod = blended.loader.productCache.fromCache(fromParams).prod;
                if (prod)
                    prod.saveProduct(fromParams, $.noop);
            });
        }];
    var state = (function (_super) {
        __extends(state, _super);
        function state(st) {
            _super.call(this, st);
        }
        return state;
    })(blended.state);
    vyzva.state = state;
    blended.rootModule
        .filter('vyzva$state$viewpath', function () { return function (id) { return vyzva.vyzvaRoot + 'views/' + id + '.html'; }; });
    var pageTemplate = vyzva.vyzvaRoot + 'views/_pageTemplate.html';
    function initVyzvaStates(params) {
        params.$stateProvider.state({
            name: 'vyzvademo',
            //url: "/vyzvademo?teacher&student&admin&studentempty&companytitle",
            url: "/vyzvademo?companytitle",
            controller: vyzva.runController,
            templateUrl: blended.baseUrlRelToRoot + '/blendedapi/vyzva/views/vyzvademo.html',
            resolve: {
                $checkOldApplicationStart: blended.checkOldApplicationStart,
                $keysFromCompanyTitle: vyzva.keysFromCompanyTitle
            }
        });
        vyzva.stateNames.root = new state({
            name: 'pg.ajs',
            url: '/ajs',
            abstract: true,
            controller: function () { Pager.clearHtml(); },
            template: "<div data-ui-view></div>",
            onEnter: function () { return anim.inAngularjsGui = true; },
            onExit: function () { return anim.inAngularjsGui = false; },
            childs: [
                blended.prodStates.homeTask = vyzva.stateNames.homeTask = new state({
                    name: 'vyzva',
                    //lickeys ve formatu <UserLicences.LicenceId>|<UserLicences.Counter>#<UserLicences.LicenceId>|<UserLicences.Counter>...
                    url: "/vyzva/:companyid/:loginid/:persistence/:loc/:lickeys?returnurl&homelinktype&vyzvademocompanytitle",
                    abstract: true,
                    template: "<div data-ui-view></div>",
                    resolve: {
                        $intranetInfo: vyzva.loadIntranetInfo(),
                    },
                    childs: [
                        vyzva.stateNames.langmasterManager = new state({
                            name: 'langmastermanager',
                            url: "/langmastermanager",
                            templateUrl: pageTemplate,
                            layoutContentId: 'managerLangmaster',
                            layoutSpecial: true,
                            controller: vyzva.managerLangmaster,
                        }),
                        vyzva.stateNames.shoolManager = new state({
                            name: 'schoolmanager',
                            url: "/schoolmanager",
                            templateUrl: pageTemplate,
                            layoutContentId: 'managerschool',
                            controller: vyzva.managerSchool,
                        }),
                        vyzva.stateNames.faq = new state({
                            name: 'faq',
                            url: "/faq",
                            layoutSpecial: true,
                            templateUrl: pageTemplate,
                            layoutContentId: 'faq',
                            controller: vyzva.faqController,
                        }),
                        new state({
                            name: 'prod',
                            url: "/prod/:producturl/:taskid/:onbehalfof",
                            template: "<div data-ui-view></div>",
                            controller: vyzva.homeTaskController,
                            controllerAs: blended.taskContextAs.product,
                            abstract: true,
                            resolve: {
                                $loadedProduct: vyzva.loadProduct,
                                $intranetInfo: vyzva.loadIntranetInfo(),
                            },
                            childs: [
                                vyzva.stateNames.testhw = new state({
                                    name: 'testhw',
                                    url: "/testhw/:url",
                                    templateUrl: pageTemplate,
                                    layoutContentId: 'testHw',
                                    layoutSpecial: true,
                                    controller: vyzva.testHwController,
                                    resolve: {
                                        $loadedEx: blended.loadEx,
                                    }
                                }),
                                blended.prodStates.home = vyzva.stateNames.home = new state({
                                    name: 'home',
                                    url: "/home",
                                    templateUrl: pageTemplate,
                                    layoutContentId: 'home',
                                    controller: vyzva.homeViewController,
                                }),
                                vyzva.stateNames.lector = new state({
                                    name: 'lector',
                                    url: "/lector/:groupid",
                                    controller: vyzva.lectorController,
                                    controllerAs: blended.taskContextAs.lector,
                                    abstract: true,
                                    template: "<div data-ui-view></div>",
                                    childs: [
                                        vyzva.stateNames.lectorHome = new state({
                                            name: 'home',
                                            url: "/home",
                                            controller: vyzva.lectorViewController,
                                            layoutContentId: 'lector',
                                            templateUrl: pageTemplate,
                                        }),
                                    ]
                                }),
                                vyzva.stateNames.pretestTask = new state({
                                    name: 'pretest',
                                    url: '/pretest/:pretesturl',
                                    controller: blended.pretestTaskController,
                                    controllerAs: blended.taskContextAs.pretest,
                                    dataNodeUrlParName: 'pretestUrl',
                                    //isGreenArrowRoot:true,
                                    abstract: true,
                                    template: "<div data-ui-view></div>",
                                    childs: [
                                        vyzva.stateNames.pretest = new state({
                                            name: 'home',
                                            url: "/home",
                                            layoutContentId: 'pretest',
                                            controller: vyzva.pretestViewController,
                                            templateUrl: pageTemplate,
                                        }),
                                        blended.prodStates.pretestModule = new state({
                                            name: 'test',
                                            url: '/test/:moduleurl',
                                            controller: vyzva.moduleTaskController,
                                            controllerAs: blended.taskContextAs.module,
                                            dataNodeUrlParName: 'moduleUrl',
                                            abstract: true,
                                            moduleType: blended.moduleServiceType.pretest,
                                            template: "<div data-ui-view></div>",
                                            childs: [
                                                blended.prodStates.pretestExercise = vyzva.stateNames.pretestExercise = new state({
                                                    name: 'ex',
                                                    url: '/ex/:url',
                                                    controller: vyzva.pretestExercise,
                                                    controllerAs: blended.taskContextAs.ex,
                                                    dataNodeUrlParName: 'Url',
                                                    layoutSpecial: true,
                                                    layoutContentId: 'exercise',
                                                    //layoutToolbarType: 'toolbar/run',
                                                    ignorePageTitle: true,
                                                    //exerciseIsTest: true,
                                                    //exerciseOmitModuleMap: true,
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
                                vyzva.stateNames.pretestPreview = new state({
                                    name: 'testview',
                                    url: '/testview/:moduleurl',
                                    controller: vyzva.moduleTaskController,
                                    controllerAs: blended.taskContextAs.module,
                                    dataNodeUrlParName: 'moduleUrl',
                                    moduleType: blended.moduleServiceType.pretest,
                                    //isGreenArrowRoot: true,
                                    abstract: true,
                                    template: "<div data-ui-view></div>",
                                    childs: [
                                        new state({
                                            name: 'ex',
                                            url: '/:url',
                                            controller: vyzva.lessonTest,
                                            controllerAs: blended.taskContextAs.ex,
                                            //exerciseIsTest: true,
                                            dataNodeUrlParName: 'Url',
                                            layoutSpecial: true,
                                            layoutContentId: 'exercise',
                                            resolve: {
                                                $loadedEx: blended.loadEx,
                                                $loadedLongData: blended.loadLongData,
                                            },
                                            templateUrl: pageTemplate,
                                        })
                                    ]
                                }),
                                vyzva.stateNames.moduleLessonTask = new state({
                                    name: 'lesson',
                                    url: '/lesson/:moduleurl',
                                    controller: vyzva.moduleTaskController,
                                    controllerAs: blended.taskContextAs.module,
                                    dataNodeUrlParName: 'moduleUrl',
                                    //isGreenArrowRoot: true,
                                    moduleType: blended.moduleServiceType.lesson,
                                    abstract: true,
                                    template: "<div data-ui-view></div>",
                                    childs: [
                                        new state({
                                            name: 'ex',
                                            url: '/:url',
                                            controller: vyzva.lessonExercise,
                                            controllerAs: blended.taskContextAs.ex,
                                            dataNodeUrlParName: 'Url',
                                            layoutSpecial: true,
                                            layoutContentId: 'exercise',
                                            //layoutToolbarType: 'toolbar/run',
                                            resolve: {
                                                $loadedEx: blended.loadEx,
                                                $loadedLongData: blended.loadLongData,
                                            },
                                            templateUrl: pageTemplate,
                                        }),
                                    ]
                                }),
                                vyzva.stateNames.moduleTestTask = new state({
                                    name: 'test',
                                    url: '/test/:moduleurl',
                                    controller: vyzva.moduleTaskController,
                                    controllerAs: blended.taskContextAs.module,
                                    dataNodeUrlParName: 'moduleUrl',
                                    //isGreenArrowRoot: true,
                                    abstract: true,
                                    template: "<div data-ui-view></div>",
                                    moduleType: blended.moduleServiceType.test,
                                    childs: [
                                        new state({
                                            name: 'ex',
                                            url: '/:url',
                                            controller: vyzva.lessonTest,
                                            controllerAs: blended.taskContextAs.ex,
                                            //exerciseIsTest: true,
                                            dataNodeUrlParName: 'Url',
                                            layoutSpecial: true,
                                            layoutContentId: 'exercise',
                                            //layoutToolbarType: 'toolbar/run',
                                            resolve: {
                                                $loadedEx: blended.loadEx,
                                                $loadedLongData: blended.loadLongData,
                                            },
                                            templateUrl: pageTemplate,
                                        })
                                    ]
                                })
                            ]
                        }),
                    ]
                })
            ]
        });
        vyzva.stateNames.root.initFromStateTree(params.$stateProvider);
    }
    vyzva.initVyzvaStates = initVyzvaStates;
})(vyzva || (vyzva = {}));
