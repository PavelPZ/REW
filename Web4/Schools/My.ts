// <reference path="../jslib/jsd/knockout.d.ts" />
module schoolMy {

  var errWrongFormat = () => CSLocalize('52e17a9a1f654e1893f5cb9131cc1762', 'Incorrect format of the License key. Please, check if you entered it correctly.');
  var errUsed = () => CSLocalize('28df461f6e2c47f7a8cde96ed974be9e', 'License key used by another user');
  var errAdded = () => CSLocalize('7a824dbe23b34680b5149663ac66ed24', 'License key already entered');
  var errOK = () => CSLocalize('6e8be0cf1d8e411cb0876ae1aea57c4c', 'License key accepted');

  export class Model extends schools.Model {

    constructor() {
      super(schools.tMy, null);
      this.licKey = validate.create(validate.types.rangelength,(prop) => {
        prop.min = 8;
        prop.max = 8;
      });
      this.licKeyOK = () => {
        this.licKey.message('');
        if (!validate.isPropsValid([this.licKey])) return;
        var k: keys.Key;
        try { k = keys.fromString(this.licKey()); } catch (err) {
          this.licKey.message(errWrongFormat());
          return;
        }
        Pager.ajaxGet(
          Pager.pathType.restServices,
          Login.CmdEnterLicKey_Type,
          LMStatus.createCmd<Login.CmdEnterLicKey>(r => { r.CompLicId = k.licId; r.Counter = k.counter; }),
          //Login.CmdEnterLicKey_Create(LMStatus.Cookie.id, k.licId, k.counter),
          (res: Login.CmdEnterLicKeyResult) => {
            switch (res.res) {
              case Login.EnterLicenceResult.ok:
                //this.licKey.message(errOK());
                this.licKey("");
                Login.adjustMyData(true,() => Pager.reloadPage(this));
                anim.collapseExpanded();
                //Pager.closePanels();
                return;
              case Login.EnterLicenceResult.added: this.licKey.message(errAdded()); return;
              case Login.EnterLicenceResult.used: this.licKey.message(errUsed()); return;
              case Login.EnterLicenceResult.wrongCounter:
              case Login.EnterLicenceResult.wrongId: this.licKey.message(errWrongFormat()); return;
            }
          });
      }
    }

    doUpdate(completed: () => void): void {
      this.systemAdmin = Login.isSystemAdmin() ? () => LMStatus.setReturnUrlAndGoto(oldPrefix + "schoolAdmin" + hashDelim + "schoolAdminModel") : null;
      //var hasCompany = /*this.systemAdmin != null || Login.companyExists();
      if (Login.companyExists()) {
        this.companies = _.map(Login.myData.Companies, c => {
          TreeView.adjustParents(c.DepTree.Departments);
          var comp: Company = {
            title: c.Title, items: [], courses: null, data: c,
            department: ko.observable<Admin.Department>(c.PublisherOwnerUserId != 0 ? null : <Admin.Department>TreeView.findNode(c.DepTree.Departments,(d: Admin.Department) => d.Id == c.DepSelected)),
            treeViewModel: null
          };
          if (c.DepTree.Departments) comp.treeViewModel = new TreeView.Model(c.DepTree.Departments, false, null, {
            withCheckbox: false,
            editable: false,
            onLinkClick: (nd: TreeView.Node) => {
              Pager.ajaxGet(
                Pager.pathType.restServices,
                Login.CmdSaveDepartment_Type,
                Login.CmdSaveDepartment_Create(LMStatus.Cookie.id, c.Id,(<Admin.Department>(nd.data)).Id),
                (res) => {
                  comp.department(<any>(nd.data));
                  anim.collapseExpanded();
                });
            }
          });
          var it: Item;
          if ((c.RoleEx.Role & LMComLib.CompRole.Admin) != 0) comp.items.push(it = {
            id: 'manage_admin',
            title: CSLocalize('7dbd71d1e623446e884febbd07c72f9f', 'Manage administrators and their roles'),
            gotoItem: () => Pager.navigateToHash(schoolAdmin.getHash(schoolAdmin.compAdminsTypeName, c.Id))
          });
          if ((c.RoleEx.Role & LMComLib.CompRole.Products) != 0) comp.items.push(it = {
            id: 'manage_products',
            title: CSLocalize('fd0acec43f7d487ba635b4a55343b23a', 'Manage products'),
            gotoItem: () => Pager.navigateToHash(schoolAdmin.getHash(schoolAdmin.productsTypeName, c.Id))
          });
          if ((c.RoleEx.Role & LMComLib.CompRole.Keys) != 0) comp.items.push(it = {
            id: 'gen_keys',
            title: CSLocalize('643da9a0b02b4e209e26e20ca620f54c', 'Generate license keys'),
            gotoItem: () => Pager.navigateToHash(schoolAdmin.getHash(schoolAdmin.keyGenTypeName, c.Id))
          });
          if ((c.RoleEx.Role & LMComLib.CompRole.Department) != 0) comp.items.push(it = {
            id: 'edit_criteria',
            title: CSLocalize('9231de5764184fd7a75389aa2ecfdad5', 'Edit Department structure and criteria for tracking study results'),
            gotoItem: () => Pager.navigateToHash(schoolAdmin.getHash(schoolAdmin.editDepartmentTypeName, c.Id))
          });
          if ((c.RoleEx.Role & LMComLib.CompRole.Results) != 0) comp.items.push(it = {
            id: 'view_students_results',
            title: CSLocalize('2fb8a691d86e4f4181dba3f48708a363', 'View Student results'),
            gotoItem: () => Pager.navigateToHash(schoolAdmin.getHash(schoolAdmin.schoolUserResultsTypeName, c.Id))
          });
          if ((c.RoleEx.Role & LMComLib.CompRole.HumanEvalator) != 0) comp.items.push(it = {
            id: 'human_eval',
            title: CSLocalize('f8fce20059f24b5e82b52bd41fef4bd4', 'Evaluate Speaking and Writing skills'),
            gotoItem: () => Pager.navigateToHash(schoolAdmin.getHash(schoolAdmin.humanEvalTypeName, c.Id))
          });
          if ((c.RoleEx.Role & LMComLib.CompRole.HumanEvalManager) != 0) comp.items.push(it = {
            id: 'human_eval_manager',
            title: CSLocalize('e72a70b3d05244759ea5469440921ff2', 'Assign Tests to Evaluators'),
            gotoItem: () => Pager.navigateToHash(schoolAdmin.getHash(schoolAdmin.humanEvalManagerLangsTypeName, c.Id))
          });
          //if ((c.RoleEx.Role & LMComLib.CompRole.HumanEvalManager) != 0) comp.items.push(it = {
          //  id: 'human_eval_manager',
          //  title: CSLocalize('6e852a7128f54a27b9fb667b03b48a6e', 'Advanced assign to evaluators'),
          //  gotoItem: () => location.hash = schoolAdmin.getHash(schoolAdmin.humanEvalManagerExTypeName, c.Id)
          //});
          if ((c.RoleEx.Role & LMComLib.CompRole.HumanEvalManager) != 0) comp.items.push(it = {
            id: 'human_evaluators',
            title: CSLocalize('bce009c57f4b418c9ff42e30c7998479', 'Configure Evaluators'),
            gotoItem: () => Pager.navigateToHash(schoolAdmin.getHash(schoolAdmin.humanEvalManagerEvsTypeName, c.Id))
          });
          comp.courses = [];
          //kurzy, k nimz mam licenci
          _.each(c.Courses, crs => {
            if (crs.isAuthoredCourse && (c.RoleEx.Role & LMComLib.CompRole.Publisher) == 0) return;
            var pr = CourseMeta.lib.findProduct(crs.ProductId); if (pr == null) return;
            comp.courses.push(this.courseLinkFromProduct(pr, comp, crs));
          });
          comp.courses = _.sortBy(comp.courses, c => !c.data.isAuthoredCourse);

          return comp;
        });
        this.companies = _.sortBy(this.companies, c => c.data.PublisherOwnerUserId == 0);
      }
      completed();
    }
    courseLinkFromProduct(pr: CourseMeta.data, comp: Company, crs: LMComLib.MyCourse): courseLink {
      var persistence = crs.isAuthoredCourse ? schools.memoryPersistId : null;
      return {
        //isPublIndiv: crs==null,
        expired: crs.Expired <= 0 ? new Date() : Utils.intToDate(crs.Expired),
        line: pr.line, title: pr.title, prodId: pr.url, isTest: CourseMeta.lib.isTest(pr),
        isAngularJS: CourseMeta.lib.isAngularJS(pr),
        data: crs,
        myCompany: comp,
        gotoUrl: (dt: courseLink) => {
          if (dt.isTest && dt.data.LicCount == 0) return;
          if (comp.data.PublisherOwnerUserId == 0 && /*!dt.data.isAuthoredCourse &&*/ dt.myCompany.data.DepTree && dt.myCompany.data.DepTree.Departments && !dt.myCompany.department()) { alert(CSLocalize('a85c8a527bb44bda9a7ee0721707d2ef', 'Choose company department (by clicking on [Change] link above)')); return; }
          //if (dt.isAngularJS) {
          //  blended.rootState.go('ajs.vyzvaproduct', { producturl: encodeURIComponent(pr.url) }); return;
          //}
          if (dt.isAngularJS) { window.location.hash = '/ajs/vyzvaproduct/xxx'; return; }
          var hash = dt.isTest ? testMe.createUrlPersist(testMe.tEx, comp.data.Id, pr.url, persistence) : new CourseMeta.dataImpl().hrefCompl(comp.data.Id, pr.url, persistence);
          if (dt.isTest) testMe.alowTestCreate_Url = pr.url;
          window.location.hash = hash;
        },
        gotoArchive: (dt: courseLink) => {
          window.location.hash = testMe.createUrlPersist(testMe.tResults, comp.data.Id, pr.url, persistence);
        }
      };
    }
    systemAdmin; //je videt link firmy a jejich spravci

    licKey: validate.ValidObservable<any>;
    licKeyOK;
    licKeyMsg(): string {
      switch (cfg.designId) {
        case 'skrivanek': return 'Pro získání klíče zašlete email s informací o požadovaném jazyce na <a href="mailto:onlinetesty@skrivanek.cz">onlinetesty@skrivanek.cz</a>.';
        default: return null;
      }
    }

    companies: Company[];
  }

  export interface ProdItem {
    title: string;
    url: string;
    lineTxt: string;
  }
  export interface Item {
    id: string;
    title: string;
    gotoItem: () => void;
  }
  export interface courseLink {
    title: string;
    data: LMComLib.MyCourse;
    prodId: string;
    expired: Date;
    isTest: boolean;
    isAngularJS: boolean; //nova verze
    line: LMComLib.LineIds;
    gotoUrl: (data: courseLink) => void;
    gotoArchive: (data: courseLink) => void;
    myCompany: Company;
    //isPublIndiv: boolean; //priznak toho, ze se jedna o kurz, jehoz jsem publisherem
  }
  export interface Company {
    title: string;
    data: Login.MyCompany;
    courses: courseLink[];
    items: Item[];
    department: KnockoutObservable<Admin.Department>;
    treeViewModel: TreeView.Model;
  }

  //Pager.registerAppLocator(schools.appId, schools.tMy, (urlParts, completed) => completed(new schoolMy.Model()));

  export var myStateName = 'schoolMy_Model'.toLowerCase();
  blended.oldLocators.push($stateProvider => blended.registerOldLocator($stateProvider, myStateName, schools.appId, schools.tMy, 0, urlParts => new schoolMy.Model()));

}
