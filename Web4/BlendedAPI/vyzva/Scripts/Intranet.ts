module vyzva {
  export module intranet {

    //***************** globalni informace o firme, ulozene v databazi, tabulka Company
    //!!!!!!!!!!!!!!!!  //musi souhlasit s D:\LMCom\REW\Web4\BlendedAPI\vyzva\Server\ExcelReport.cs
    export interface ICompanyData {
      managerKeys: Array<IAlocatedKey>;
      visitorsKeys?: Array<IVisitors>; //licencni klice visitor studentuu k blended kurzu. Vidi je SPRAVCE na home spravcovske konzole. Visitors se napocitaji do skore, jsou pro navstevniky
      studyGroups: Array<IStudyGroup>; //studijni skupiny firmy
    }
    export interface IVisitors {
      line: LMComLib.LineIds; //jazyk vyuky
      visitorsKeys?: Array<IAlocatedKey>; //licencni klice visitor studentuu k blended kurzu. Vidi je LEKTOR na home kurzu. Visitors se napocitaji do skore, jsou pro navstevniky
    }
    export interface IStudyGroup {
      title: string;
      groupId: number;
      line: LMComLib.LineIds; //jazyk vyuky
      isPattern3: boolean; //true pro skupinu ucitelu
      lectorKeys?: Array<IAlocatedKey>; //licencni klice lektoruu k blended kurzu. Vidi je ADMIN v admin konzoli
      studentKeys?: Array<IAlocatedKey>; //licencni klice studentuu k blended kurzu. Vidi je LEKTOR na home kurzu
      visitorsKeys?: Array<IAlocatedKey>; //licencni klice visitor studentuu k blended kurzu. Vidi je LEKTOR na home kurzu. Visitors se napocitaji do skore, jsou pro navstevniky
      num: string; //pro create school wizzard - pocet studentu (string pro two way binding)
    }
    export interface IAlocatedKey {
      keyStr: string;
      lmcomId: number;
      email: string;
      firstName: string;
      lastName: string;
    }

    //***************** odvozene informace, vhodne pro zobrazeni

    export class alocatedKeyRoot {
      constructor(
        public alocatedKeyInfos: Array<IAlocatedKeyInfo>, //dato, odvozene z companyData
        public companyData: ICompanyData,
        public userDir: { [lmcomid: string]: IAlocatedKey; },
        public jsonToSave: string) { } //null => nezmeneno

      userInfo(lmcomId: number): IAlocatedKey {
        return this.userDir[lmcomId.toString()];
      }
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
        var lg: ILmAdminCreateLicenceKey = { line: parseInt(line), num: 3 /*3 klice pro Spravce-visitora*/ + Utils.sum(lineGroup, grp => parseInt(grp.num) + 6 /*3 pro lector-visitora, 3 pro lektora*/), keys: null };
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
        grp.studentKeys = useKey(grp.line, parseInt(grp.num));
        grp.visitorsKeys = useKey(grp.line, 3);
        grp.lectorKeys = useKey(grp.line, 3);
      });
      var managerKeys: Array<IAlocatedKey> = useKey(LMComLib.LineIds.no, 2);
      //Visitors pro Spravce:
      var lineGroups = _.groupBy(groups, g => g.line);
      var visitorsKeys: Array<IVisitors> = [];
      _.each(lineGroups, (lineGroup, line) => {
        visitorsKeys.push({ line: parseInt(line), visitorsKeys: useKey(parseInt(line), 3) })
      });
      return { studyGroups: groups, managerKeys: managerKeys, visitorsKeys: visitorsKeys };
    }

    //******************* zakladni info PO SPUSTENI PRODUKTU
    //informace o licencich a klicich k spustenemu produktu
    export function enteredProductInfo(json: string, licenceKeysStr /*platne licencni klice k produktu*/: string, cookie: LMStatus.LMCookie): alocatedKeyRoot {
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
      _.each(companyData.visitorsKeys, keys => {
        alocList.pushArray(_.map(keys.visitorsKeys, alocKey => { return { key: alocKey, group: null, isLector: false, isVisitor: true, isStudent: false }; }));
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
        var alocatedKeyInfo = _.find(alocList, k => k.key.keyStr == licenceKey);
        if (!alocatedKeyInfo) return;
        alocatedKeyInfo.key.email = cookie.EMail || cookie.Login; alocatedKeyInfo.key.firstName = cookie.FirstName; alocatedKeyInfo.key.lastName = cookie.LastName; alocatedKeyInfo.key.lmcomId = cookie.id;
        alocatedKeyInfos.push(alocatedKeyInfo);
      });
      //adresar lmcomid => user udaje
      var userDir: { [lmcomid: string]: IAlocatedKey; } = {};
      _.each(alocList, al => {
        if (!al.key || !al.key.lmcomId) return;
        userDir[al.key.lmcomId.toString()] = al.key;
      });
      var newJson = JSON.stringify(companyData);
      return new alocatedKeyRoot(alocatedKeyInfos, companyData, userDir, oldJson == newJson ? null : newJson);
    }

  }
}