var blended;
(function (blended) {
    blended.oldLocators = [];
    function registerOldLocator($stateProvider, appId, type, numOfPars, createModel) {
        //numOfPars je budto cislo nebo array cisel. Oznacuje mozne pocty parametru.
        if (_.isNumber(numOfPars))
            numOfPars = [numOfPars];
        for (var np = 0; np < numOfPars.length; np++) {
            var pars;
            for (var i = 0; i < numOfPars; i++)
                pars += '/p' + i.toString();
            $stateProvider.state({
                name: type,
                url: '/old/appid/type' + pars,
                template: "<!--old-->",
                controller: blended.OldController,
                data: { createModel: createModel }
            });
        }
        //Pager.loadPage(createModel());
    }
    blended.registerOldLocator = registerOldLocator;
})(blended || (blended = {}));
