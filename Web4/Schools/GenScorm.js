var scorm;
(function (scorm) {
    scorm.Cmd_Logger_Type = 'scorm.Cmd_Logger';
    function Cmd_Logger_Create(id, data, companyId, productId, scormId, lmcomId, sessionId) {
        return { id: id, data: data, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId };
    }
    scorm.Cmd_Logger_Create = Cmd_Logger_Create;
    scorm.Cmd_resetModules_Type = 'scorm.Cmd_resetModules';
    function Cmd_resetModules_Create(modIds, companyId, productId, scormId, lmcomId, sessionId) {
        return { modIds: modIds, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId };
    }
    scorm.Cmd_resetModules_Create = Cmd_resetModules_Create;
    scorm.Cmd_readCrsResults_Type = 'scorm.Cmd_readCrsResults';
    function Cmd_readCrsResults_Create(companyId, productId, scormId, lmcomId, sessionId) {
        return { companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId };
    }
    scorm.Cmd_readCrsResults_Create = Cmd_readCrsResults_Create;
    scorm.Cmd_readModuleResults_Type = 'scorm.Cmd_readModuleResults';
    function Cmd_readModuleResults_Create(key, companyId, productId, scormId, lmcomId, sessionId) {
        return { key: key, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId };
    }
    scorm.Cmd_readModuleResults_Create = Cmd_readModuleResults_Create;
    scorm.Cmd_saveUserData_Type = 'scorm.Cmd_saveUserData';
    function Cmd_saveUserData_Create(data, companyId, productId, scormId, lmcomId, sessionId) {
        return { data: data, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId };
    }
    scorm.Cmd_saveUserData_Create = Cmd_saveUserData_Create;
    scorm.Cmd_createArchive_Type = 'scorm.Cmd_createArchive';
    function Cmd_createArchive_Create(companyId, productId, scormId, lmcomId, sessionId) {
        return { companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId };
    }
    scorm.Cmd_createArchive_Create = Cmd_createArchive_Create;
    scorm.Cmd_testResults_Type = 'scorm.Cmd_testResults';
    function Cmd_testResults_Create(companyId, productId, scormId, lmcomId, sessionId) {
        return { companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId };
    }
    scorm.Cmd_testResults_Create = Cmd_testResults_Create;
    scorm.Cmd_testCert_Type = 'scorm.Cmd_testCert';
    function Cmd_testCert_Create(loc, companyId, productId, scormId, lmcomId, sessionId) {
        return { loc: loc, companyId: companyId, productId: productId, scormId: scormId, date: Utils.nowToInt(), lmcomId: lmcomId, sessionId: sessionId };
    }
    scorm.Cmd_testCert_Create = Cmd_testCert_Create;
})(scorm || (scorm = {}));
