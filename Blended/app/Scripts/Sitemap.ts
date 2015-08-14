module test {

  export var sitemap: angular.ui.IState;

  export function defineStates($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.route.IRouteProvider) {
    $urlRouterProvider.otherwise('/index');
    $stateProvider
      .state(sitemap = {
        name: 'index',
        controller: test.PageController,
        data: { title: 'home' },
        url: "/index",
        templateUrl: "app/pages/index.html"
      })
    //*** demopages
      .state({
        name: 'demopages',
        controller: test.PageController,
        abstract: true,
        data: { tabName: 'demopages' },
        url: "/demopages",
        template: "<div data-ui-view=''></div>",
      })
      .state({
        name: 'demopages.list',
        controller: test.PageController,
        data: { title: 'Jednotlivé části výuky' },
        url: "/list",
        templateUrl: "app/pages/demopages.html",
      })
      .state({
        name: 'demopages.pretest',
        controller: test.PageController,
        data: { title: 'Vstupní adaptabilní test' },
        url: "/pretest",
        templateUrl: "app/pages/demopages-pretest.html",
      })
      .state({
        name: 'demopages.lesson',
        controller: test.DLesson,
        data: { title: 'Lekce' },
        url: "/lesson",
        templateUrl: "app/pages/demopages-lesson.html",
      })
      .state({
        name: 'demopages.test',
        controller: test.PageController,
        data: { title: 'Kontrolní a závěrečný test' },
        url: "/test",
        templateUrl: "app/pages/demopages-test.html",
      })
    //**** demosound
      .state({
        name: 'demosound',
        controller: test.DSController,
        abstract: true,
        url: "/demosound",
        data: { tabName: 'demosound' },
        template: "<div data-ui-view=''></div>",
        resolve: {
          'demoSoundMetadata': ['exportService', (exportService: exportService) => exportService.getData('api/DemoSound/GetMetaData', true)]
        }
      })
      .state({
        name: 'demosound.list',
        controller: test.PageController,
        data: { title: 'Ukázky dialogů od rodilých mluvčích' },
        url: "/list",
        templateUrl: "app/pages/demosound.html",
      })
    //**** demosound.lang
      .state({
        name: 'demosound.lang',
        abstract: true,
        controller: test.DSLangController,
        url: "/lang/:lang",
        template: "<div data-ui-view=''></div>",
      })
      .state({
        name: 'demosound.lang.list',
        controller: test.PageController,
        url: "/list",
        templateUrl: "app/pages/demosound-lang.html",
      })
    //**** demosound.lang.level
      .state({
        name: 'demosound.lang.level',
        abstract: true,
        controller: test.DSLangLevelController,
        url: "/level/:level",
        template: "<div data-ui-view=''></div>",
      })
      .state({
        name: 'demosound.lang.level.list',
        controller: test.PageController,
        url: "/list",
        templateUrl: "app/pages/demosound-lang-level.html",
      })
    //**** demosound.lang.level.file
    //.state({
    //  name: 'demosound.lang.level.file',
    //  controller: test.DSLangLevelFileController,
    //  url: "/configid/:configid",
    //  templateUrl: "app/pages/demosound-lang-level-file.html",
    //  data: { topBarInclude: 'app/views/topbarmodal.html' }
    //})
      .state({
        name: 'runex',
        controller: test.DSLangLevelFileController,
        url: "/runex/:configid/file/:file",
        templateUrl: "app/pages/demosound-lang-level-file.html",
        data: { topBarInclude: 'app/views/topbarmodal.html' }
      })
    //**** other
      .state({
        name: 'statistics',
        controller: test.PageController,
        data: { title: 'Přehledy o výuce' },
        url: "/statistics",
        templateUrl: "app/pages/statistics.html",
      })
      .state({
        name: 'vyzva57',
        controller: test.PageController,
        data: { title: 'Výzva 57 MŠMT' },
        url: "/vyzva57",
        templateUrl: "app/pages/vyzva57.html",
      })
      .state({
        name: 'contact',
        controller: test.PageController,
        data: { title: 'Kontakt' },
        url: "/contact",
        templateUrl: "app/pages/contact.html",
      })
      .state({
        name: 'embed',
        //controller: test.EmbedResponsiveControler,
        controller: test.PageController,
        url: "/embed/:src/:ratio/:columns",
        templateUrl: "app/pages/embedResponsive.html",
        data: { topBarInclude: 'app/views/topbarmodal.html' }
      })
    ;
  }

}