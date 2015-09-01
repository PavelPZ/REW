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
                var compInfo = vyzva.intranet.enteredProductInfo(res, ctx.lickeys, LMStatus.Cookie);
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
            //  if (location.hash == '#/pg/ajs/vyzva//def/1/1/1/2/!lm!blcourse!langmastermanager.product!/home') {
            //    event.preventDefault();
            //    setTimeout(() => location.hash = '#/pg/ajs/langmastermanager', 1);
            //  } else if (location.hash == '#/pg/ajs/vyzva//def/1/1/1/2/!lm!blcourse!schoolmanager.product!/home') {
            //    event.preventDefault();
            //    setTimeout(() => location.hash = '#/pg/ajs/schoolmanager', 1);
            //  }
            //})
            //sance zrusit ladovani stranky
            $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
                blended.finishContext(fromParams);
                var prod = blended.loader.productCache.fromCache(fromParams);
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
        vyzva.stateNames.root = new state({
            name: 'pg.ajs',
            url: '/ajs',
            abstract: true,
            controller: function () { Pager.clearHtml(); },
            template: "<div data-ui-view></div>",
            childs: [
                new state({
                    name: 'managers',
                    url: "/vyzva/managers/:companyid/:loginid/:lickeys",
                    template: "<div data-ui-view></div>",
                    abstract: true,
                    childs: [
                        vyzva.stateNames.shoolManager = new state({
                            name: 'schoolmanager',
                            url: "/schoolmanager",
                            templateUrl: pageTemplate,
                            layoutContentId: 'managerschool',
                            controller: vyzva.managerSchool,
                            resolve: {
                                $intranetInfo: vyzva.loadIntranetInfo(),
                            },
                        }),
                    ]
                }),
                blended.prodStates.homeTask = vyzva.stateNames.homeTask = new state({
                    name: 'vyzva',
                    //lickeys ve formatu <UserLicences.LicenceId>|<UserLicences.Counter>#<UserLicences.LicenceId>|<UserLicences.Counter>...
                    url: "/vyzva/:companyid/:loginid/:persistence/:loc/:lickeys/:producturl/:taskid?:onbehalfof&returnurl",
                    dataNodeUrlParName: 'productUrl',
                    controller: vyzva.homeTaskController,
                    abstract: true,
                    resolve: {
                        $loadedProduct: vyzva.loadProduct,
                        $intranetInfo: vyzva.loadIntranetInfo(),
                    },
                    template: "<div data-ui-view></div>",
                    childs: [
                        blended.prodStates.home = vyzva.stateNames.home = new state({
                            name: 'home',
                            url: "/home",
                            controller: vyzva.homeViewController,
                            layoutContentId: 'home',
                            templateUrl: pageTemplate,
                        }),
                        vyzva.stateNames.lector = new state({
                            name: 'lector',
                            url: "/lector/:groupid",
                            controller: vyzva.lectorController,
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
                                vyzva.stateNames.lectorEval = new state({
                                    name: 'eval',
                                    url: "/eval",
                                    controller: vyzva.lectorEvalController,
                                    layoutContentId: 'lector/eval',
                                    templateUrl: pageTemplate,
                                }),
                            ]
                        }),
                        vyzva.stateNames.pretestTask = new state({
                            name: 'pretest',
                            url: '/pretest/:pretesturl',
                            controller: blended.pretestTaskController,
                            dataNodeUrlParName: 'pretestUrl',
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
                                    controller: blended.moduleTaskController,
                                    dataNodeUrlParName: 'moduleUrl',
                                    moduleAlowCycleExercise: false,
                                    abstract: true,
                                    template: "<div data-ui-view></div>",
                                    childs: [
                                        blended.prodStates.pretestExercise = vyzva.stateNames.pretestExercise = new state({
                                            name: 'ex',
                                            url: '/ex/:url',
                                            controller: vyzva.pretestExercise,
                                            dataNodeUrlParName: 'Url',
                                            layoutContentId: 'exercise',
                                            layoutToolbarType: 'toolbar/run',
                                            pageTitlePlace: vyzva.pageTitlePlace.none,
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
                        vyzva.stateNames.lessonTask = new state({
                            name: 'lesson',
                            url: '/lesson/:moduleurl',
                            controller: vyzva.moduleTaskController,
                            dataNodeUrlParName: 'moduleUrl',
                            abstract: true,
                            template: "<div data-ui-view></div>",
                            childs: [
                                vyzva.stateNames.lesson = new state({
                                    name: 'home',
                                    url: '/home',
                                    layoutContentId: 'module',
                                    layoutToolbarType: 'toolbar/run',
                                    controller: vyzva.moduleViewController,
                                    templateUrl: pageTemplate,
                                }),
                                vyzva.stateNames.lessonExercise = new state({
                                    name: 'ex',
                                    url: '/ex/:url',
                                    controller: vyzva.lessonExercise,
                                    dataNodeUrlParName: 'Url',
                                    layoutContentId: 'exercise',
                                    layoutToolbarType: 'toolbar/run',
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
})(vyzva || (vyzva = {}));
