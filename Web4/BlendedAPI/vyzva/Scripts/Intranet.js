var vyzva;
(function (vyzva) {
    var intranet;
    (function (intranet) {
        function createCompany(groups) {
            var admins = _.find(groups, function (g) { return g.line == LMComLib.LineIds.no; });
            var adminKeys = !admins ? null : _.map(admins.keys, function (key) { return { keyStr: key }; });
            var pattern3Count = 1;
            var pattern4Count = 1;
            var studyGroups = _.map(_.filter(groups, function (g) { return g.line != LMComLib.LineIds.no; }), function (grp) {
                var lectorKeys = grp.keys.slice(0, 4);
                var visitorKeys = grp.keys.slice(3, 7);
                var studentKeys = grp.keys.slice(6);
                var res = {
                    line: grp.line,
                    isPattern3: grp.isPattern3,
                    title: grp.isPattern3 ? 'Skupina učitelů ' + (pattern3Count++).toString() : 'Skupina studentů ' + (pattern4Count++).toString(),
                    lectorKeys: _.map(lectorKeys, function (key) { return { keyStr: key }; }),
                    visitorsKeys: _.map(visitorKeys, function (key) { return { keyStr: key }; }),
                    studentKeys: _.map(studentKeys, function (key) { return { keyStr: key }; }),
                };
                return res;
            });
            return { adminKeys: adminKeys, studyGroups: studyGroups };
        }
        intranet.createCompany = createCompany;
        //******************* zakladni info PO SPUSTENI PRODUKTU
        //informace o licencich a klicich k spustenemu produktu
        function enteredProductInfo(json, prodKeyCodes /*platne licence k produktu, zakodovane do "<UserLicences.LicenceId>|<UserLicences.Counter>"*/, cookie) {
            if (_.isEmpty(json))
                return null;
            var prodKeyStrs = _.map(prodKeyCodes.split('#'), function (code) {
                var parts = code.split('|');
                var key = { licId: parseInt(parts[0]), counter: parseInt(parts[1]) };
                return keys.toString(key);
            });
            var data = (JSON.parse(json));
            var oldJson = JSON.stringify(data);
            //this.oldJson = JSON.stringify(this.data);
            //linearizace klicu
            var keyList = [];
            keyList.pushArray(_.map(data.adminKeys, function (compKey) { return { key: compKey, group: null, groupLector: false, visitor: false }; }));
            _.each(data.studyGroups, function (grp) {
                keyList.pushArray(_.map(grp.lectorKeys, function (compKey) { return { key: compKey, group: grp, groupLector: true, visitor: false }; }));
                keyList.pushArray(_.map(grp.studentKeys, function (ak) { return { key: ak, group: grp, groupLector: false, visitor: false }; }));
                keyList.pushArray(_.map(grp.visitorsKeys, function (ak) { return { key: ak, group: grp, groupLector: false, visitor: true }; }));
            });
            //ev. doplneni udaju o uzivateli
            var usedKeyInfo = null;
            _.find(prodKeyStrs, function (prodKeyStr) {
                usedKeyInfo = _.find(keyList, function (k) { return k.key.keyStr == prodKeyStr; });
                if (!usedKeyInfo)
                    return false;
                usedKeyInfo.key.email = cookie.EMail || cookie.Login;
                usedKeyInfo.key.firstName = cookie.FirstName;
                usedKeyInfo.key.lastName = cookie.LastName;
                usedKeyInfo.key.lmcomId = cookie.id;
                return true;
            });
            var newJson = JSON.stringify(data);
            var res = usedKeyInfo;
            res.data = data;
            res.jsonToSave = oldJson == newJson ? null : newJson;
            return res;
        }
        intranet.enteredProductInfo = enteredProductInfo;
    })(intranet = vyzva.intranet || (vyzva.intranet = {}));
})(vyzva || (vyzva = {}));
