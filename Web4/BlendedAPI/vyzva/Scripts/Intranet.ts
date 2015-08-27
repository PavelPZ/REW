module vyzva {
  export module intranet {

    //********************* DATOVY MODEL
    //globalni informace o firme, ulozene v Company.Data
    export interface ICompanyData {
      adminKeys: Array<IUsedKey>; //licencni klice adminuu k schoolmanager.product produktu. Vidi je LANGMaster v LM konzoli
      studyGroups: Array<IStudyGroup>; //studijni skupiny firmy
    }

    export interface IStudyGroup {
      title: string;
      line: LMComLib.LineIds; //jazyk vyuky
      isPattern3: boolean; //true pro skupinu ucitelu
      lectorKeys: Array<IUsedKey>; //licencni klice lektoruu k blended kurzu. Vidi je ADMIN v admin konzoli
      studentKeys: Array<IUsedKey>; //licencni klice studentuu k blended kurzu. Vidi je LEKTOR na home kurzu
      visitorsKeys: Array<IUsedKey>; //licencni klice visitor studentuu k blended kurzu. Vidi je LEKTOR na home kurzu. Visitors se napocitaji do skore, jsou pro navstevniky
    }

    //******************* OBJEDNAVKA
    export interface ISchoolOrder {
      closed: boolean; //objednavka uzavrena (uzavira se pri odeslani)
      schoolName: string;
      city: string;
      street: string;
      psc: string;

      firstName: string;
      lastName: string;
      email: string;
      groups: Array<ILmAdminCreateLicenceKey>;
    }

    //******************* VYTVORENI company v LANGMaster spravci
    export interface ILmAdminCreateLicenceKey {
      title: string;
      line: LMComLib.LineIds; //no => school manager produkt
      num: number; //= pocet studentu plus 3 (lektori na skupinu) + 3 (visitors)
      isPattern3: boolean;
      keys?: string[]; //ve formatu <licenceId>|<counter>
    }

    export interface ILoadIntranetInfoResult { learningData: intranet.IEnteredProductInfoResult; orderData: ISchoolOrder; }

    export function createCompany(groups: Array<ILmAdminCreateLicenceKey>): ICompanyData {
      var admins = _.find(groups, g => g.line == LMComLib.LineIds.no);
      var adminKeys: Array<IUsedKey> = !admins ? null : _.map(admins.keys, key => { return <any>{ keyStr: key } });
      var pattern3Count = 1; var pattern4Count = 1;
      var studyGroups = _.map(_.filter(groups, g => g.line != LMComLib.LineIds.no), grp => {
        var lectorKeys = grp.keys.slice(0, 4);
        var visitorKeys = grp.keys.slice(3, 7);
        var studentKeys = grp.keys.slice(6);
        var res: IStudyGroup = {
          line: grp.line,
          isPattern3: grp.isPattern3,
          title: grp.isPattern3 ? 'Skupina učitelů ' + (pattern3Count++).toString() : 'Skupina studentů ' + (pattern4Count++).toString(),
          lectorKeys: _.map(lectorKeys, key => { return <any>{ keyStr: key } }),
          visitorsKeys: _.map(visitorKeys, key => { return <any>{ keyStr: key } }),
          studentKeys: _.map(studentKeys, key => { return <any>{ keyStr: key } }),
        };
        return res;
      });
      return { adminKeys: adminKeys, studyGroups: studyGroups };
    }

    //******************* zakladni info PO SPUSTENI PRODUKTU
    //informace o licencich a klicich k spustenemu produktu
    export function enteredProductInfo(json: string, prodKeyCodes /*platne licence k produktu, zakodovane do "<UserLicences.LicenceId>|<UserLicences.Counter>"*/: string, cookie: LMStatus.LMCookie): IEnteredProductInfoResult {
      if (_.isEmpty(json)) return null;
      var prodKeyStrs: Array<string> = _.map(prodKeyCodes.split('#'), code => {
        var parts = code.split('|');
        var key: keys.Key = { licId: parseInt(parts[0]), counter: parseInt(parts[1]) };
        return keys.toString(key);
      });
      var data = <ICompanyData>(JSON.parse(json));
      var oldJson = JSON.stringify(data);
      //this.oldJson = JSON.stringify(this.data);
      //linearizace klicu
      var keyList: Array<IUsedKeyInfo> = [];
      keyList.pushArray(_.map(data.adminKeys, compKey => { return { key: compKey, group: null, groupLector: false, visitor:false }; }));
      _.each(data.studyGroups, grp => {
        keyList.pushArray(_.map(grp.lectorKeys, compKey => { return { key: compKey, group: grp, groupLector: true, visitor: false }; }));
        keyList.pushArray(_.map(grp.studentKeys, ak => { return { key: ak, group: grp, groupLector: false, visitor: false }; }));
        keyList.pushArray(_.map(grp.visitorsKeys, ak => { return { key: ak, group: grp, groupLector: false, visitor: true }; }));
      });
      //ev. doplneni udaju o uzivateli
      var usedKeyInfo: IUsedKeyInfo = null;
      _.find(prodKeyStrs, prodKeyStr => {
        usedKeyInfo = _.find(keyList, k => k.key.keyStr == prodKeyStr); if (!usedKeyInfo) return false;
        usedKeyInfo.key.email = cookie.EMail || cookie.Login; usedKeyInfo.key.firstName = cookie.FirstName; usedKeyInfo.key.lastName = cookie.LastName; usedKeyInfo.key.lmcomId = cookie.id;
        return true;
      });
      var newJson = JSON.stringify(data);
      var res = <IEnteredProductInfoResult>usedKeyInfo;
      res.data = data;
      res.jsonToSave = oldJson == newJson ? null : newJson;
      return res;
    }
    export interface IUsedKey {
      keyStr: string;
      lmcomId: number;
      email: string;
      firstName: string;
      lastName: string;
    }
    export interface IUsedKeyInfo {
      key: IUsedKey;
      group: IStudyGroup;
      groupLector: boolean;
      visitor: boolean;
    }
    export interface IEnteredProductInfoResult extends IUsedKeyInfo {
      data: ICompanyData;
      jsonToSave: string; //null => nezmeneno
    }
    //function eqKey(key1: keys.Key, key2: keys.Key): boolean { return key1.counter == key2.counter && key1.licId == key2.licId; }

  }
}