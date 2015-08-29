var vyzva;
(function (vyzva) {
    var intranet;
    (function (intranet) {
        function lmAdminCreateLicenceKeys_request(groups) {
            var res = [];
            //school manager keys: 2 dalsi klice pro spravce (mimo prvniho spravce = self)
            res.push({ line: LMComLib.LineIds.no, num: 2, keys: null });
            //students keys: pro kazdou line a group a pocet
            var lineGroups = _.groupBy(groups, function (g) { return g.line; });
            _.each(lineGroups, function (lineGroup, line) {
                var lg = { line: parseInt(line), num: Utils.sum(lineGroup, function (grp) { return grp.num + 6; } /*3 klice pro lektora, 3 pro visitora*/ /*3 klice pro lektora, 3 pro visitora*/), keys: null };
                //lg.num += 3;
                res.push(lg);
            });
            return res;
        }
        intranet.lmAdminCreateLicenceKeys_request = lmAdminCreateLicenceKeys_request;
        function lmAdminCreateLicenceKeys_reponse(groups, respKeys) {
            var useKey = function (line, num) {
                //odeber NUM klicu pro line
                var key = _.find(respKeys, function (k) { return k.line == line; });
                var keyStrs = key.keys.slice(0, num);
                if (keyStrs.length != num)
                    throw 'keyStrs.length != num';
                key.keys.splice(0, num);
                //zkonvertuj lienceId|counter na encoded licence key
                return _.map(keyStrs, function (keyStr) {
                    var parts = keyStr.split('|');
                    return { keyStr: keys.toString({ licId: parseInt(parts[0]), counter: parseInt(parts[1]) }) };
                });
            };
            _.each(groups, function (grp) {
                grp.studentKeys = useKey(grp.line, grp.num);
                grp.visitorsKeys = useKey(grp.line, 3);
                grp.lectorKeys = useKey(grp.line, 3);
            });
            var managerKeys = useKey(LMComLib.LineIds.no, 2);
            return { studyGroups: groups, managerKeys: managerKeys };
        }
        intranet.lmAdminCreateLicenceKeys_reponse = lmAdminCreateLicenceKeys_reponse;
        //******************* zakladni info PO SPUSTENI PRODUKTU
        //informace o licencich a klicich k spustenemu produktu
        function enteredProductInfo(json, licenceKeysStr /*platne licencni klice k produktu*/, cookie) {
            if (_.isEmpty(json))
                return null;
            var licenceKeys = licenceKeysStr.split('#');
            var companyData = (JSON.parse(json));
            var oldJson = JSON.stringify(companyData);
            //linearizace klicu
            var alocList = [];
            alocList.pushArray(_.map(companyData.managerKeys, function (alocKey) { return { key: alocKey, group: null, isLector: false, isVisitor: false, isStudent: false }; }));
            _.each(companyData.studyGroups, function (grp) {
                alocList.pushArray(_.map(grp.lectorKeys, function (alocKey) { return { key: alocKey, group: grp, isLector: true, isVisitor: false, isStudent: false }; }));
                alocList.pushArray(_.map(grp.studentKeys, function (alocKey) { return { key: alocKey, group: grp, isLector: false, isVisitor: false, isStudent: true }; }));
                alocList.pushArray(_.map(grp.visitorsKeys, function (alocKey) { return { key: alocKey, group: grp, isLector: false, isVisitor: true, isStudent: false }; }));
            });
            ////student nebo visitor lmcomid => seznam lines. Pomaha zajistit jednoznacn
            //var lmcomIdToLineDir: { [lmcomid: number]: Array<LMComLib.LineIds>; } = {};
            //_.each(_.filter(alocList, l => l.isStudent || l.isVisitor), l => {
            //  var lines = lmcomIdToLineDir[l.key.lmcomId];
            //  if (!lines) lmcomIdToLineDir[l.key.lmcomId] = lines = [];
            //  lines.push(l.group.line);
            //});
            //doplneni udaju do alokovaneho klice uzivatele. Alokovany klice se paruje s licencnim klicem
            var alocatedKeyInfos = [];
            _.each(licenceKeys, function (licenceKey) {
                var alocatedKeyInfo = _.find(alocList, function (k) { return k.key.keyStr == licenceKey; });
                if (!alocatedKeyInfo)
                    return;
                if (!alocatedKeyInfo)
                    return;
                alocatedKeyInfo.key.email = cookie.EMail || cookie.Login;
                alocatedKeyInfo.key.firstName = cookie.FirstName;
                alocatedKeyInfo.key.lastName = cookie.LastName;
                alocatedKeyInfo.key.lmcomId = cookie.id;
                alocatedKeyInfos.push(alocatedKeyInfo);
            });
            //if (!usedKeyInfo) usedKeyInfo = { group: null, groupLector: false, key: null, visitor:true };
            var newJson = JSON.stringify(companyData);
            var res = { companyData: companyData, jsonToSave: oldJson == newJson ? null : newJson, alocatedKeyInfos: alocatedKeyInfos };
            return res;
        }
        intranet.enteredProductInfo = enteredProductInfo;
    })(intranet = vyzva.intranet || (vyzva.intranet = {}));
})(vyzva || (vyzva = {}));
