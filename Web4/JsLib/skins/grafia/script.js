var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var grafia;
(function (grafia) {
    grafia.home = "grafia_homeModel".toLowerCase();
    var skin = (function (_super) {
        __extends(skin, _super);
        function skin() {
            _super.apply(this, arguments);
        }
        skin.prototype.bodyClass = function () { return $(document).width() <= 960 ? 'screen-width-small' : ''; };
        skin.prototype.getHome = function () { return oldPrefix + [grafia.appId, grafia.home].join(hashDelim); };
        return skin;
    })(Gui2.skin);
    grafia.skin = skin;
    var homeModel = (function (_super) {
        __extends(homeModel, _super);
        function homeModel() {
            _super.call(this, grafia.appId, grafia.home, null);
            this.tb = new schools.TopBarModel(this);
        }
        return homeModel;
    })(Pager.Page);
    grafia.homeModel = homeModel;
    Gui2.skin.instance = new skin();
    //Pager.registerAppLocator(appId, home, (urlParts, completed) => completed(new homeModel()));
    blended.oldLocators.push(function ($stateProvider) { return blended.registerOldLocator($stateProvider, grafia.home, grafia.appId, grafia.home, 0, function (urlParts) { return new homeModel(); }); });
})(grafia || (grafia = {}));
