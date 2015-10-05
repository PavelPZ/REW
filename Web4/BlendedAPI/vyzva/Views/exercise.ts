namespace vyzva {

  export interface IToolbarRun {
    tbClick();
    tbNavigateProductHome();
    tbTitle: string;
    tbDoneTitle: string;
  }

  export class moduleTaskController extends blended.moduleTaskController {
  }

  export class exerciseViewLow extends blended.exerciseTaskViewController implements IToolbarRun {
    constructor($scope: blended.IExerciseScope | blended.IStateService, $state: angular.ui.IStateService, $loadedEx: blended.cacheExercise, $loadedLongData: blended.IExLong, public $modal: angular.ui.bootstrap.IModalService) {
      super($scope, $state, $loadedEx, $loadedLongData);
    }
    tbClick() { this.greenClick(); }
    tbNavigateProductHome() { this.navigateProductHome() } //this.navigate({ stateName: stateNames.home.name, pars: this.ctx }) }
    tbTitle: string;
    tbDoneTitle: string;
    tbCongratulation: string;
    tbCongratulationTitle: string;
    confirmWrongScoreDialog(): ng.IPromise<any> {
      return this.$modal.open({
        templateUrl: 'vyzva$exercise$wrongscore.html',
      }).result;
    }
    congratulationDialog(): ng.IPromise<any> {
      return this.$modal.open({
        templateUrl: 'vyzva$exercise$congratulation.html',
        scope: this.$scope,
      }).result;
    }
    static $inject = ['$scope', '$state', '$loadedEx', '$loadedLongData', '$modal'];
  }

  export class pretestExercise extends exerciseViewLow {

    constructor($scope: blended.IExerciseScope | blended.IStateService, $state: angular.ui.IStateService, $loadedEx: blended.cacheExercise, $loadedLongData: blended.IExLong, $modal: angular.ui.bootstrap.IModalService) {
      super($scope, $state, $loadedEx, $loadedLongData, $modal);
      if (this.isFakeCreate) return;
      this.breadcrumb = breadcrumbBase(this);
      this.breadcrumb.push({ title: 'Rozřazovací test', url: null, active: true });
      this.tbTitle = 'Pokračovat v Rozřazovacím testu';
      this.tbDoneTitle = 'Rozřazovací test dokončen';
      this.tbCongratulation = 'Gratulujeme k dokončení Rozřazovacího testu!';
    }
  }

  export class lessonExercise extends exerciseViewLow {
    constructor($scope: blended.IExerciseScope | blended.IStateService, $state: angular.ui.IStateService, $loadedEx: blended.cacheExercise, $loadedLongData: blended.IExLong, $modal: angular.ui.bootstrap.IModalService) {
      super($scope, $state, $loadedEx, $loadedLongData, $modal);
      if (this.isFakeCreate) return;
      this.breadcrumb = breadcrumbBase(this);
      this.breadcrumb.push({ title: this.title, url: null, active: true });
      this.tbTitle = 'Pokračovat v lekci';
      this.tbDoneTitle = 'Lekce dokončena';
      this.tbCongratulation = 'Gratulujeme k dokončení lekce!';
    }
    state: state;
  }

  export class lessonTest extends exerciseViewLow {
    constructor($scope: blended.IExerciseScope | blended.IStateService, $state: angular.ui.IStateService, $loadedEx: blended.cacheExercise, $loadedLongData: blended.IExLong, $modal: angular.ui.bootstrap.IModalService) {
      super($scope, $state, $loadedEx, $loadedLongData, $modal);
      if (this.isFakeCreate) return;
      this.breadcrumb = breadcrumbBase(this);
      this.breadcrumb.push({ title: this.title, url: null, active: true });
      this.tbTitle = 'Pokračovat v testu';
      this.tbDoneTitle = 'Test dokončen';
    }
    congratulationDialog(): ng.IPromise<any> {
      var ok = this.modService.agregUser.ms ? Math.round(this.modService.agregUser.s / this.modService.agregUser.ms * 100) > 65 : false;
      if (ok) {
        this.tbCongratulation = 'Gratulujeme k dokončení testu! Pokud test obsahuje mluvený projev, byl zaslán vašemu Učiteli k vyhodnocení.';
      } else {
        this.tbCongratulationTitle = 'Test nesplněn';
        this.tbCongratulation = 'Skóre, dosažené v testu, je menší než 65%. O dalším pokračování v kurzu musí rozhodnout váš učitel';
      }
      return super.congratulationDialog();
    }
    state: state;
  }

  export class vyzva$exercise$keyboardkey {
    constructor() {
      this.link = (scope, el: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
        el.on('mousedown', () => {
          var $focused = $(':focus');
          if ($focused[0].tagName.toLowerCase() != 'input') return;
          insertAtCaret($focused[0], scope.key);
          return false;
        });
        
      }
    }
    scope = { key: '@key' };
    link;
  }

  function insertAtCaret(element, text) {
    if (document.selection) {
      element.focus();
      var sel = document.selection.createRange();
      sel.text = text;
      element.focus();
    } else if (element.selectionStart || element.selectionStart === 0) {
      var startPos = element.selectionStart;
      var endPos = element.selectionEnd;
      var scrollTop = element.scrollTop;
      element.value = element.value.substring(0, startPos) + text + element.value.substring(endPos, element.value.length);
      element.focus();
      element.selectionStart = startPos + text.length;
      element.selectionEnd = startPos + text.length;
      element.scrollTop = scrollTop;
    } else {
      element.value += text;
      element.focus();
    }
  }

  blended.rootModule
    .directive('vyzva$exercise$keyboardkey', () => new vyzva$exercise$keyboardkey())
  ;

}