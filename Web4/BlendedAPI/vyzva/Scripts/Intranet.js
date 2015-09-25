var vyzva;
(function (vyzva) {
    var intranet;
    (function (intranet) {
        //***************** odvozene informace, vhodne pro zobrazeni
        var alocatedKeyRoot = (function () {
            function alocatedKeyRoot(alocatedKeyInfos, //dato, odvozene z companyData
                companyData, userDir, jsonToSave) {
                this.alocatedKeyInfos = alocatedKeyInfos;
                this.companyData = companyData;
                this.userDir = userDir;
                this.jsonToSave = jsonToSave;
            } //null => nezmeneno
            alocatedKeyRoot.prototype.userInfo = function (lmcomId) {
                return this.userDir[lmcomId.toString()];
            };
            //LANGMaster only
            alocatedKeyRoot.prototype.deleteStudentKey = function (groupId, keyStr) {
                var grp = _.find(this.companyData.studyGroups, function (g) { return g.groupId == groupId; });
                for (var i = 0; i < grp.studentKeys.length; i++) {
                    if (grp.studentKeys[i].keyStr != keyStr)
                        continue;
                    grp.studentKeys.splice(i, 1);
                    break;
                }
            };
            alocatedKeyRoot.prototype.addStudentKey = function (groupId, keyStr) {
                var grp = _.find(this.companyData.studyGroups, function (g) { return g.groupId == groupId; });
                grp.studentKeys.push({ keyStr: keyStr });
            };
            return alocatedKeyRoot;
        })();
        intranet.alocatedKeyRoot = alocatedKeyRoot;
        function lmAdminCreateLicenceKeys_request(groups) {
            var res = [];
            //school manager keys: 2 dalsi klice pro spravce (mimo prvniho spravce = self)
            res.push({ line: LMComLib.LineIds.no, num: 2, keys: null });
            //students keys: pro kazdou line a group a pocet
            var lineGroups = _.groupBy(groups, function (g) { return g.line; });
            _.each(lineGroups, function (lineGroup, line) {
                var lg = { line: parseInt(line), num: 3 /*3 klice pro Spravce-visitora*/ + Utils.sum(lineGroup, function (grp) { return parseInt(grp.num) + 6; } /*3 pro lector-visitora, 3 pro lektora*/ /*3 pro lector-visitora, 3 pro lektora*/), keys: null };
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
                grp.studentKeys = useKey(grp.line, parseInt(grp.num));
                grp.visitorsKeys = useKey(grp.line, 3);
                grp.lectorKeys = useKey(grp.line, 3);
            });
            var managerKeys = useKey(LMComLib.LineIds.no, 2);
            //Visitors pro Spravce:
            var lineGroups = _.groupBy(groups, function (g) { return g.line; });
            var visitorsKeys = [];
            _.each(lineGroups, function (lineGroup, line) {
                visitorsKeys.push({ line: parseInt(line), visitorsKeys: useKey(parseInt(line), 3) });
            });
            return { studyGroups: groups, managerKeys: managerKeys, visitorsKeys: visitorsKeys };
        }
        intranet.lmAdminCreateLicenceKeys_reponse = lmAdminCreateLicenceKeys_reponse;
        //******************* zakladni info PO SPUSTENI PRODUKTU
        //informace o licencich a klicich k spustenemu produktu
        function enteredProductInfo(companyData, licenceKeysStr /*platne licencni klice k produktu*/, cookie) {
            if (!companyData)
                return null;
            //if (_.isEmpty(json)) return null;
            var licenceKeys = licenceKeysStr ? licenceKeysStr.split('#') : [];
            //var companyData = <ICompanyData>(JSON.parse(json));
            var oldJson = JSON.stringify(companyData);
            //linearizace klicu
            var alocList = [];
            alocList.pushArray(_.map(companyData.managerKeys, function (alocKey) { return { key: alocKey, group: null, isLector: false, isVisitor: false, isStudent: false }; }));
            _.each(companyData.studyGroups, function (grp) {
                alocList.pushArray(_.map(grp.lectorKeys, function (alocKey) { return { key: alocKey, group: grp, isLector: true, isVisitor: false, isStudent: false }; }));
                alocList.pushArray(_.map(grp.studentKeys, function (alocKey) { return { key: alocKey, group: grp, isLector: false, isVisitor: false, isStudent: true }; }));
                alocList.pushArray(_.map(grp.visitorsKeys, function (alocKey) { return { key: alocKey, group: grp, isLector: false, isVisitor: true, isStudent: false }; }));
            });
            _.each(companyData.visitorsKeys, function (keys) {
                alocList.pushArray(_.map(keys.visitorsKeys, function (alocKey) { return { key: alocKey, group: null, isLector: false, isVisitor: true, isStudent: false }; }));
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
                alocatedKeyInfo.key.email = cookie.EMail || cookie.Login;
                alocatedKeyInfo.key.firstName = cookie.FirstName;
                alocatedKeyInfo.key.lastName = cookie.LastName;
                alocatedKeyInfo.key.lmcomId = cookie.id;
                alocatedKeyInfos.push(alocatedKeyInfo);
            });
            //adresar lmcomid => user udaje
            var userDir = {};
            _.each(alocList, function (al) {
                if (!al.key || !al.key.lmcomId)
                    return;
                userDir[al.key.lmcomId.toString()] = al.key;
            });
            var newJson = JSON.stringify(companyData);
            return new alocatedKeyRoot(alocatedKeyInfos, companyData, userDir, oldJson == newJson ? null : newJson);
        }
        intranet.enteredProductInfo = enteredProductInfo;
    })(intranet = vyzva.intranet || (vyzva.intranet = {}));
})(vyzva || (vyzva = {}));
