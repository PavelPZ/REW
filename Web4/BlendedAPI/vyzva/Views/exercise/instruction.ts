module vyzva {

  blended.rootModule
    .directive('vyzva$exercise$instruction', () => new exerciseInstruction())
  ;

  export class exerciseInstruction { 
    templateUrl = vyzvaRoot + 'views/exercise/instruction.html';
    scope = { user: '&user', doReset: '&doReset', data: '&instructionData', state: '&state' };
  }

}