var schools;
(function (schools) {
    //export var readFiles: (urls: string[], completed: (data: string[]) => void) => void;
    //export var readAppDataAndLoc: (urls: Pager.locPaths, completed: (data, loc: string) => void) => void;
    //export var readAppData: (urls: string, completed: (data: string) => void) => void;
    ////nacte soubor z q:\LMCom\rew\Web4\Schools\EAData\ i s lokalizaci
    ////export var readStaticModuleData: (urls: Pager.locPaths, completed: (res, locRes: string) => void ) => void; 
    //export var resetModules: (LMComUserId: number, companyId: number, productId: string, modJsonIds: string[], completed: () => void) => void;
    ////nacte strucne vysledky vsech modulu kurzu
    //export var readCrsResults: (isStart: boolean, lmcomUserId: number, companyId: number, productId: string, completed: (res: ModUser[]) => void) => void;
    ////nacte podrobne vysledky modulu
    //export var readModuleResult: (lmcomUserId: number, companyId: number, productId: string, moduleJsonId: string, completed: (data: ModUser) => void) => void;
    ////zapise podrobne vysledky modulu
    //export var writeModuleResult: (lmcomUserId: number, companyId: number, productId: string, moduleJsonId: string, data: ModUser, dataShort: ModUser, completed: () => void) => void;
    ////metainformace o kurzu v puvodni lm.com DB. V nove verzi musi byt nahrazeny by metaCourse
    //export var readCrsInfo: (lmcomUserId: number, companyId: number, productId: string, completed: (res: CourseInfo) => void) => void;
    //export var setMetaCourse: (lmcomUserId: number, companyId: number, productId: string, value: metaCourse, completed: () => void) => void;
    //export var getMetaCourse: (lmcomUserId: number, companyId: number, productId: string, completed: (res: metaCourse) => void) => void;
    ////export var createTest: (testFileName: string, lmcomUserId: number, companyId: number, productId: string, completed: (testId: number) => void) => void;
    ////export var readTestResults: (isStart: boolean, testIds: number[], completed: (testResults: schools.SchoolCmdTestInfoItem[]) => void) => void;
    function resetModulesLocal(modJsonIds) {
        ////uvolni data aktualniho modulu
        //schools.data.modId = null; schools.data.exStatic = null; schools.data.modUser = null;
        ////vymaz moduly na klientovi
        //_.each(modJsonIds, (key: string) => delete schools.data.crsUser[key]);
    }
    schools.resetModulesLocal = resetModulesLocal;
    function addTimespan(url, replace) {
        return replace ? url + "?timestamp=" + new Date().getTime() : url;
    }
})(schools || (schools = {}));
