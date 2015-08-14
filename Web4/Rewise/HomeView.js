/// <reference path="../jsd/jquery.d.ts" />
/// <reference path="../jsd/jqueryMobile.d.ts" />
/// <reference path="../js/ViewBase.ts" />
/// <reference path="../js/LMModel.ts" />
/// <reference path="../js/MobileExtension.ts" />
/// <reference path="model.ts" />
var Home;
(function (Home) {
    Home.View = {
        saveStatus: function (pg) {
            if(ViewBase.isMobile == ViewBase.viewType.jqueryMobile) {
                pg.expLine = mobile.getExpandedDataId();
            } else {
                return null;
            }
        }
    };
})(Home || (Home = {}));
