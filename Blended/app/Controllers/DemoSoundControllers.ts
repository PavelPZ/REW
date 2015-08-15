module test {

  //****************** DEMO controlers
  export class DLesson extends PageController {
    constructor($scope: IDSScope, $state: angular.ui.IStateService) {
      super($scope, $state);
    }
  }

  //****************** DEMO SOUND controlers

  //*** DS
  export class DSController extends PageController {

    static $inject = ['$scope', '$state', 'demoSoundMetadata'];

    constructor($scope: IDSScope, $state: angular.ui.IStateService, demoSoundMetadata: ng.IHttpPromiseCallbackArg<string>) {
      super($scope, $state);
      if (!DSNode) {
        var ds = angular.fromJson(demoSoundMetadata.data);
        if (_.isString(ds)) ds = angular.fromJson(ds);
        DSNode = ds;
        //debugger;
        renameAttrs(DSNode);
      }
      $scope.node = DSNode;
      $scope.tupples = tuples($scope.node.data);
    }
  }
  interface IDSScope extends IPageScope {
    node: IDSNode;
    tupples: Array<ITupple>;
  }

  //*** DSLang
  export class DSLangController extends PageController {
    constructor($scope: IDSLangScope, $state: angular.ui.IStateService) {
      super($scope, $state);
      $scope.node = _.find($scope.$parent.node.data, l => l.url == $scope.params.lang);
      test.root.$scope.pageTitle = $scope.node.title;
      $scope.tupples = tuples($scope.node.data);
    }
  }
  interface IDSLangScope extends IPageScope { //rozsireni (modifikace) scope
    params: IDSLangParams;
    node: IDSNode;
    tupples: Array<ITupple>;
    $parent: IDSScope;
  }
  interface IDSLangParams { //route parametry
    lang: string;
  }

  //*** DSLangLevel
  export class DSLangLevelController extends PageController {
    constructor($scope: IDSLevelScope, $state: angular.ui.IStateService) {
      super($scope, $state);
      $scope.node = _.find($scope.$parent.node.data, l => l.url == $scope.params.level);
      $scope.exs = $scope.node.data;
      test.root.$scope.pageTitle = $scope.node.parent.title + ' / ' + $scope.node.title;
    }
  }
  interface IDSLevelScope extends IPageScope {
    exs: Array<IDSNode>;
    params: IDSLevelParams;
    node: IDSNode;
    $parent: IDSLangScope;
  }
  interface IDSLevelParams {
    lang: string;
    level: string;
  }

  //*** DSLangLevelFile
  export class DSLangLevelFileController extends PageController {
    constructor($scope: IDSLevelFileScope, $state: angular.ui.IStateService) {
      super($scope, $state);
      var file = $scope.params.file.replace(/\//g,'@');
      $scope.authorUrl = config.runExMask[$scope.params.configid] + file;
      test.root.$scope.bodyScrollHidden = true;
    }
  }
  interface IDSLevelFileScope extends IPageScope {
    params: IDSLevelFileParams;
    node: IDSNode;
    $parent: IDSLevelScope;
    authorUrl: string;
  }
  interface IDSLevelFileParams {
    //lang: string;
    //level: string;
    configid: string;
    file: string;
  }

  //Metadata, nactena ze serveru
  interface IDSNode {
    title: string;
    url: string;
    escapedUrl: string;
    data: Array<IDSNode>;
    parent: IDSNode;
  }
  var DSNode: IDSNode;
  function renameAttrs(node: IDSNode) {
    for (var p in node) {
      if (p[0] == '@') { node[p.substring(1)] = node[p]; delete node[p]; }
    }
    if (node.url) node.escapedUrl = node.url.replace(/\//g,'@');
    if (node.data) _.each(node.data, d => {
      d.parent = node;
      renameAttrs(d);
    });
  }

  //z seznamu udela dvojice
  function tuples(objs: Array<IDSNode>): Array<ITupple> {
    var res: Array<ITupple> = []; var last: ITupple = null;
    _.each(objs, obj => {
      if (last) {
        last.right = obj; last.hasRight = true; last = null;
      } else {
        last = { left: obj, right: null, hasRight: false }; res.push(last);
      }
    });
    return res;
  }
  interface ITupple { left: IDSNode; right: IDSNode; hasRight: boolean; }
}