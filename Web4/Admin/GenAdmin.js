/// <reference path="../login/GenLogin.ts" />
var Admin;
(function (Admin) {
    (function (DictEntryCmdType) {
        DictEntryCmdType[DictEntryCmdType["loadDict"] = 0] = "loadDict";
        DictEntryCmdType[DictEntryCmdType["saveEntry"] = 1] = "saveEntry";
        DictEntryCmdType[DictEntryCmdType["statistics"] = 2] = "statistics";
    })(Admin.DictEntryCmdType || (Admin.DictEntryCmdType = {}));
    var DictEntryCmdType = Admin.DictEntryCmdType;
    (function (CmdXrefDataOpers) {
        CmdXrefDataOpers[CmdXrefDataOpers["nodeTypes"] = 0] = "nodeTypes";
        CmdXrefDataOpers[CmdXrefDataOpers["typeProps"] = 1] = "typeProps";
        CmdXrefDataOpers[CmdXrefDataOpers["typePropValues"] = 2] = "typePropValues";
        CmdXrefDataOpers[CmdXrefDataOpers["typeLinks"] = 3] = "typeLinks";
        CmdXrefDataOpers[CmdXrefDataOpers["typePropLinks"] = 4] = "typePropLinks";
        CmdXrefDataOpers[CmdXrefDataOpers["typePropValueLinks"] = 5] = "typePropValueLinks";
        CmdXrefDataOpers[CmdXrefDataOpers["nodeProps"] = 6] = "nodeProps";
        CmdXrefDataOpers[CmdXrefDataOpers["propValues"] = 7] = "propValues";
        CmdXrefDataOpers[CmdXrefDataOpers["propLinks"] = 8] = "propLinks";
        CmdXrefDataOpers[CmdXrefDataOpers["propValueLinks"] = 9] = "propValueLinks";
        CmdXrefDataOpers[CmdXrefDataOpers["refreshXref"] = 10] = "refreshXref";
        CmdXrefDataOpers[CmdXrefDataOpers["checkAll"] = 11] = "checkAll";
    })(Admin.CmdXrefDataOpers || (Admin.CmdXrefDataOpers = {}));
    var CmdXrefDataOpers = Admin.CmdXrefDataOpers;
    Admin.CmdAlocKeys_Type = 'Admin.CmdAlocKeys';
    function CmdAlocKeys_Create(LicenceId, Num) {
        return { LicenceId: LicenceId, Num: Num };
    }
    Admin.CmdAlocKeys_Create = CmdAlocKeys_Create;
    Admin.CmdGetProducts_Type = 'Admin.CmdGetProducts';
    function CmdGetProducts_Create(CompanyId, incUsedKeys) {
        return { CompanyId: CompanyId, incUsedKeys: incUsedKeys };
    }
    Admin.CmdGetProducts_Create = CmdGetProducts_Create;
    Admin.CmdGetDepartment_Type = 'Admin.CmdGetDepartment';
    function CmdGetDepartment_Create(CompanyId) {
        return { CompanyId: CompanyId };
    }
    Admin.CmdGetDepartment_Create = CmdGetDepartment_Create;
    Admin.CmdSetDepartment_Type = 'Admin.CmdSetDepartment';
    function CmdSetDepartment_Create(CompanyId, Departments, IntervalsConfig) {
        return { CompanyId: CompanyId, Departments: Departments, IntervalsConfig: IntervalsConfig };
    }
    Admin.CmdSetDepartment_Create = CmdSetDepartment_Create;
    Admin.CmdGetUsers_Type = 'Admin.CmdGetUsers';
    function CmdGetUsers_Create(IncUsers, IncComps, CompIds) {
        return { IncUsers: IncUsers, IncComps: IncComps, CompIds: CompIds };
    }
    Admin.CmdGetUsers_Create = CmdGetUsers_Create;
    Admin.CmdGetUsersResult_Type = 'Admin.CmdGetUsersResult';
    function CmdGetUsersResult_Create(Users, Comps, CompUsers) {
        return { Users: Users, Comps: Comps, CompUsers: CompUsers };
    }
    Admin.CmdGetUsersResult_Create = CmdGetUsersResult_Create;
    Admin.CmdSetProducts_Type = 'Admin.CmdSetProducts';
    function CmdSetProducts_Create(CompanyId, Products) {
        return { CompanyId: CompanyId, Products: Products };
    }
    Admin.CmdSetProducts_Create = CmdSetProducts_Create;
    Admin.CmdSetUsers_Type = 'Admin.CmdSetUsers';
    function CmdSetUsers_Create(Users, OldComps, Comps, CompUsers) {
        return { Users: Users, OldComps: OldComps, Comps: Comps, CompUsers: CompUsers };
    }
    Admin.CmdSetUsers_Create = CmdSetUsers_Create;
    Admin.CmdDsgnReadFile_Type = 'Admin.CmdDsgnReadFile';
    function CmdDsgnReadFile_Create(FileName) {
        return { FileName: FileName };
    }
    Admin.CmdDsgnReadFile_Create = CmdDsgnReadFile_Create;
    Admin.CmdDsgnReadFiles_Type = 'Admin.CmdDsgnReadFiles';
    function CmdDsgnReadFiles_Create(FileNames) {
        return { FileNames: FileNames };
    }
    Admin.CmdDsgnReadFiles_Create = CmdDsgnReadFiles_Create;
    Admin.CmdDsgnWriteDictWords_Type = 'Admin.CmdDsgnWriteDictWords';
    function CmdDsgnWriteDictWords_Create(FileName, Data) {
        return { FileName: FileName, Data: Data };
    }
    Admin.CmdDsgnWriteDictWords_Create = CmdDsgnWriteDictWords_Create;
    Admin.CmdGetPublProjects_Type = 'Admin.CmdGetPublProjects';
    function CmdGetPublProjects_Create(PublisherId) {
        return { PublisherId: PublisherId };
    }
    Admin.CmdGetPublProjects_Create = CmdGetPublProjects_Create;
    Admin.CmdCreatePublProject_Type = 'Admin.CmdCreatePublProject';
    function CmdCreatePublProject_Create(Line, PublisherId, ProjectId, User, Password, Title, TestItems) {
        return { Line: Line, PublisherId: PublisherId, ProjectId: ProjectId, User: User, Password: Password, Title: Title, TestItems: TestItems };
    }
    Admin.CmdCreatePublProject_Create = CmdCreatePublProject_Create;
    Admin.CmdPublChangePassword_Type = 'Admin.CmdPublChangePassword';
    function CmdPublChangePassword_Create(PublisherId, ProjectId, User, Title, Password) {
        return { PublisherId: PublisherId, ProjectId: ProjectId, User: User, Title: Title, Password: Password };
    }
    Admin.CmdPublChangePassword_Create = CmdPublChangePassword_Create;
    Admin.CmdPublBuild_Type = 'Admin.CmdPublBuild';
    function CmdPublBuild_Create(PublisherId, ProjectId) {
        return { PublisherId: PublisherId, ProjectId: ProjectId };
    }
    Admin.CmdPublBuild_Create = CmdPublBuild_Create;
    Admin.DictEntryCmd_Type = 'Admin.DictEntryCmd';
    function DictEntryCmd_Create(type, crsLang, natLang, entryId, soundMaster, html, okCrs, okCrsMaybe, todoCount, allCount) {
        return { type: type, crsLang: crsLang, natLang: natLang, entryId: entryId, soundMaster: soundMaster, html: html, okCrs: okCrs, okCrsMaybe: okCrsMaybe, todoCount: todoCount, allCount: allCount };
    }
    Admin.DictEntryCmd_Create = DictEntryCmd_Create;
    Admin.CmdXrefData_Type = 'Admin.CmdXrefData';
    function CmdXrefData_Create(oper, type, prop, value, nodeId, maxLinks, urlContext) {
        return { oper: oper, type: type, prop: prop, value: value, nodeId: nodeId, maxLinks: maxLinks, urlContext: urlContext };
    }
    Admin.CmdXrefData_Create = CmdXrefData_Create;
})(Admin || (Admin = {}));
