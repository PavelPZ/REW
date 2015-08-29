module vyzva {
  export module intranet {

    //***************** globalni informace o firme, ulozene v databazi, tabulka Company
    export interface ICompanyData {
      managerKeys: Array<IAlocatedKey>;
      studyGroups: Array<IStudyGroup>; //studijni skupiny firmy
    }
    export interface IStudyGroup {
      title: string;
      groupId: number;
      line: LMComLib.LineIds; //jazyk vyuky
      isPattern3: boolean; //true pro skupinu ucitelu
      lectorKeys?: Array<IAlocatedKey>; //licencni klice lektoruu k blended kurzu. Vidi je ADMIN v admin konzoli
      studentKeys?: Array<IAlocatedKey>; //licencni klice studentuu k blended kurzu. Vidi je LEKTOR na home kurzu
      visitorsKeys?: Array<IAlocatedKey>; //licencni klice visitor studentuu k blended kurzu. Vidi je LEKTOR na home kurzu. Visitors se napocitaji do skore, jsou pro navstevniky
      num: number; //pro create school wizzard - pocet studentu
    }
    export interface IAlocatedKey {
      keyStr: string;
      lmcomId: number;
      email: string;
      firstName: string;
      lastName: string;
    }

    //***************** odvozene informace, vhodne pro zobrazeni
    export interface IAlocatedKeyRoot {
      alocatedKeyInfos: Array<IAlocatedKeyInfo>; //dato, odvozene z companyData
      companyData: ICompanyData;
      jsonToSave: string; //null => nezmeneno
    }
    export interface IAlocatedKeyInfo {
      key: IAlocatedKey;
      group: IStudyGroup;
      isLector: boolean;
      isVisitor: boolean;
      isStudent: boolean;
    }

    //******************* VYTVORENI company v LANGMaster spravci
    export interface ILmAdminCreateLicenceKey {
      line: LMComLib.LineIds; //no => school manager produkt
      num: number; //= pocet studentu plus 3 (lektori na skupinu) + 3 (visitors)
      keys: string[]; //pro response: ve formatu <licenceId>|<counter>
    }
    export function lmAdminCreateLicenceKeys_request(groups: Array<IStudyGroup>): Array<ILmAdminCreateLicenceKey> {
      var res: Array<ILmAdminCreateLicenceKey> = [];
      //school manager keys: 2 dalsi klice pro spravce (mimo prvniho spravce = self)
      res.push({ line: LMComLib.LineIds.no, num: 2, keys: null });
      //students keys: pro kazdou line a group a pocet
      var lineGroups = _.groupBy(groups, g => g.line);
      _.each(lineGroups, (lineGroup, line) => {
        var lg: ILmAdminCreateLicenceKey = { line: parseInt(line), num: Utils.sum(lineGroup, grp => grp.num + 6 /*3 klice pro lektora, 3 pro visitora*/), keys: null };
        //lg.num += 3;
        res.push(lg);
      })
      return res;
    }

    export function lmAdminCreateLicenceKeys_reponse(groups: Array<IStudyGroup>, respKeys: Array<ILmAdminCreateLicenceKey>): ICompanyData {
      var useKey = (line: LMComLib.LineIds, num: number) => {
        //odeber NUM klicu pro line
        var key = _.find(respKeys, k => k.line == line); var keyStrs = key.keys.slice(0, num); if (keyStrs.length != num) throw 'keyStrs.length != num'; key.keys.splice(0, num);
        //zkonvertuj lienceId|counter na encoded licence key
        return _.map(keyStrs, keyStr => {
          var parts = keyStr.split('|');
          return <any>{ keyStr: keys.toString({ licId: parseInt(parts[0]), counter: parseInt(parts[1]) }) };
        });
      };
      _.each(groups, grp => {
        grp.studentKeys = useKey(grp.line, grp.num);
        grp.visitorsKeys = useKey(grp.line, 3);
        grp.lectorKeys = useKey(grp.line, 3);
      });
      var managerKeys: Array<IAlocatedKey> = useKey(LMComLib.LineIds.no, 2);
      return { studyGroups: groups, managerKeys: managerKeys };
    }

    //******************* zakladni info PO SPUSTENI PRODUKTU
    //informace o licencich a klicich k spustenemu produktu
    export function enteredProductInfo(json: string, licenceKeysStr /*platne licencni klice k produktu*/: string, cookie: LMStatus.LMCookie): IAlocatedKeyRoot {
      if (_.isEmpty(json)) return null;
      var licenceKeys = licenceKeysStr.split('#');
      var companyData = <ICompanyData>(JSON.parse(json));
      var oldJson = JSON.stringify(companyData);

      //linearizace klicu
      var alocList: Array<IAlocatedKeyInfo> = [];
      alocList.pushArray(_.map(companyData.managerKeys, alocKey => { return { key: alocKey, group: null, isLector: false, isVisitor: false, isStudent: false }; }));
      _.each(companyData.studyGroups, grp => {
        alocList.pushArray(_.map(grp.lectorKeys, alocKey => { return { key: alocKey, group: grp, isLector: true, isVisitor: false, isStudent: false }; }));
        alocList.pushArray(_.map(grp.studentKeys, alocKey => { return { key: alocKey, group: grp, isLector: false, isVisitor: false, isStudent: true }; }));
        alocList.pushArray(_.map(grp.visitorsKeys, alocKey => { return { key: alocKey, group: grp, isLector: false, isVisitor: true, isStudent: false }; }));
      });

      ////student nebo visitor lmcomid => seznam lines. Pomaha zajistit jednoznacn
      //var lmcomIdToLineDir: { [lmcomid: number]: Array<LMComLib.LineIds>; } = {};
      //_.each(_.filter(alocList, l => l.isStudent || l.isVisitor), l => {
      //  var lines = lmcomIdToLineDir[l.key.lmcomId];
      //  if (!lines) lmcomIdToLineDir[l.key.lmcomId] = lines = [];
      //  lines.push(l.group.line);
      //});

      //doplneni udaju do alokovaneho klice uzivatele. Alokovany klice se paruje s licencnim klicem
      var alocatedKeyInfos: Array<IAlocatedKeyInfo> = [];
      _.each(licenceKeys, licenceKey => {
        var alocatedKeyInfo = _.find(alocList, k => k.key.keyStr == licenceKey); if (!alocatedKeyInfo) return;
        if (!alocatedKeyInfo) return;
        alocatedKeyInfo.key.email = cookie.EMail || cookie.Login; alocatedKeyInfo.key.firstName = cookie.FirstName; alocatedKeyInfo.key.lastName = cookie.LastName; alocatedKeyInfo.key.lmcomId = cookie.id;
        alocatedKeyInfos.push(alocatedKeyInfo);
      });
      //if (!usedKeyInfo) usedKeyInfo = { group: null, groupLector: false, key: null, visitor:true };
      var newJson = JSON.stringify(companyData);
      var res: IAlocatedKeyRoot = { companyData: companyData, jsonToSave: oldJson == newJson ? null : newJson, alocatedKeyInfos: alocatedKeyInfos };
      return res;
    }

  }
}