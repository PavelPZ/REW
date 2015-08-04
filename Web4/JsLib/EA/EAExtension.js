var EA;
(function (EA) {
    //export function DataPath(): string {
    //  debugger;
    //  return cfg.EADataPath;
    //}
    function startAjax() {
        Sys.Application.dispose();
        Sys.Application.beginCreateComponents();
    }
    EA.startAjax = startAjax;
    function endAjax(completed) {
        setTimeout(function () {
            Sys.Application.endCreateComponents();
            Sys.Application._doInitialize();
            //finishImgSrc();
            if (completed)
                completed();
        }, 1);
    }
    EA.endAjax = endAjax;
    var oldToNewScoreProvider = (function () {
        function oldToNewScoreProvider(old) {
            this.old = old;
        }
        oldToNewScoreProvider.prototype.provideData = function (exData) {
            this.old.provideData(exData);
        };
        oldToNewScoreProvider.prototype.acceptData = function (done, exData) {
            this.old.acceptData(done ? 3 /* Evaluated */ : 1 /* Normal */, exData);
        };
        oldToNewScoreProvider.prototype.resetData = function (exData) {
            //var pg: CourseModel.PageUser = <any>{ Results: exData };
            this.old.resetData(exData);
        };
        oldToNewScoreProvider.prototype.getScore = function () {
            var nums = this.old.get_score();
            return nums == null || nums.length != 2 ? null : { s: nums[0], ms: nums[1], flag: 0 };
            //var nums = this.old.get_score(); return nums == null || nums.length != 2 ? null : { s: nums[0] == nums[1] ? 1 : 0, ms: 1, flag: 0 };
        };
        return oldToNewScoreProvider;
    })();
    EA.oldToNewScoreProvider = oldToNewScoreProvider;
})(EA || (EA = {}));
//var xapPath = 'eaimgmp3/'; //cesta k XAP a SWF souborum, relativne k schools adresari.
//var xapPath = ''; //cesta k XAP a SWF souborum, relativne k schools adresari.
//var actLms = 3; //LMSType.LMCom
//function DictConnector_listenTalk(url, word) {
//  return serviceRoot(actLms.toString(), true) + '/site/' + Trados.actLangCode + '/ListeningAndPronunc.aspx#/AppPronunc/FactSoundView.xaml?IsFactOnly=true&FactUrl=' + encodeURIComponent(url) + '&FactTitle=' + encodeURIComponent(word);
//};
//function DictConnector_listenTalkSentence(pars) {
//  return serviceRoot(actLms.toString(), true) + '/site/' + Trados.actLangCode + '/ListeningAndPronunc.aspx#/AppPronunc/FactSoundView.xaml?IsFactOnly=true&FactUrl=' + encodeURIComponent(listenTalkBase(actLms.toString()) + '/' + pars.url) + '&sentBeg=' + pars.beg + '&sentEnd=' + pars.end + '&FactTitle=' + encodeURIComponent(pars.title);
//};
