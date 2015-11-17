namespace layout {
  export const defaultScenePlaceId = 'scenePlace-default';
  export const defaultSceneId = 'scene-default';
}
namespace config {
  export interface IData {
    layout?: { //konfigurace layout aplikace
      routeActionToSceneId: (routeAction: flux.IAction) => string;
      scenePlaceContents: { //definuj RENDER obsah
        [scenePlaceId: string]: { //pro kazdy ScenePlace
          [contentId: string]: layout.TRenderFunction; //a pro kazde contentId
        }
      }
    };
  }
  cfg.data.layout = {
    routeActionToSceneId: action => layout.defaultSceneId,
    scenePlaceContents: {}
  }
}

namespace flux {
  export interface IWebState {
    layout?: layout.IRootState;
  }
}

namespace layout {

  export function changeLayout(routeAction: flux.IAction, first: IScenePlaceState | string, ...other: Array<IScenePlaceState>) {
    console.log('>changeLayout ' + routeAction.moduleId + '/' + routeAction.actionId);
    var firstPs: IScenePlaceState = utils.isString(first) ? { contentId: <string>first } : <IScenePlaceState>first;
    var scenePlaces = [firstPs].concat(other);
    var layCfg = config.cfg.data.layout;
    if (!layCfg.routeActionToSceneId) throw 'Missing config.cfg.data.layout.routeActionToSceneId config';
    var sceneId = layCfg.routeActionToSceneId(routeAction);
    var layState = flux.getState().layout;
    if (!flux.stateConnected(layState.scene)) throw 'Scene component does not exists or does not bind to flux.getState().layout.scene state';
    var sceneOK = sceneId == layState.scene.caseId;
    for (var newPl of scenePlaces) {
      var plId = newPl.id || defaultScenePlaceId;
      if (!layState.scenePlaces) layState.scenePlaces = {};
      var oldPl = layState.scenePlaces[plId];
      if (!oldPl) layState.scenePlaces[plId] = oldPl = { id: plId, contentId: undefined }; //throw 'Cannot find scenePlace in layout state: ' + plId;
      if (oldPl.contentId == newPl.contentId) continue;
      oldPl.contentId = newPl.contentId;
      if (sceneOK) {
        flux.onStateChanged(oldPl);
      }
    }
    if (sceneOK) return;
    layState.scene.caseId = sceneId;
    flux.onStateChanged(layState.scene);
  }

  export function setScenePlaceRender(scenePlaceId: string, contentId: string, render: layout.TRenderFunction) {
    var playContents = config.cfg.data.layout.scenePlaceContents;
    if (!playContents[scenePlaceId]) playContents[scenePlaceId] = {};
    playContents[scenePlaceId][contentId] = render;
  }

  export type TRenderFunction = (parent: flux.SmartComponent<any, any>) => JSX.Element;
  export function sceneState(): ISwitcherState { var st = flux.getState(); if (!st.layout) st.layout = {}; var l = st.layout; return l.scene ? l.scene : l.scene = {}; }
  export function scenePlaceState(id: string = defaultScenePlaceId): IScenePlaceState { return flux.getState().layout.scenePlaces[id]; }

  export interface IRootState {
    scene?: layout.ISwitcherState;
    scenePlaces?: {
      [id: string]: layout.IScenePlaceState;
    }
  }

  //******************** PLAYGROUND
  export class ScenePlace extends flux.SmartComponent<IScenePlaceProps, IScenePlaceState> {
    render() {
      super.render();
      var st = this.props.initState;
      if (!st.contentId) return null;
      return config.cfg.data.layout.scenePlaceContents[st.id][st.contentId](this);
    }
  }
  export interface IScenePlaceState extends flux.ISmartState {
    id?: string; //!id => defaultScenePlaceId
    contentId: string;
  }
  export interface IScenePlaceProps extends flux.ISmartProps<IScenePlaceState> { }

  //******************** SWITCHER
  export class Switcher extends flux.SmartComponent<ISwitcherProps, ISwitcherState> {
    render() {
      super.render();
      var caseId = this.props.initState.caseId; if (!caseId) return null;
      var cont = this.props.cases[caseId];
      if (!cont) throw 'flux.Switcher.render: wrong case ' + caseId;
      return cont(this);
    }
  }
  export interface ISwitcherProps extends flux.ISmartProps<ISwitcherState> {
    cases: { [caseId: string]: TRenderFunction; }
  }
  export interface ISwitcherState extends flux.ISmartState {
    caseId?: string;
  }

  //******************** SCENE
  export class Scene extends Switcher { }

}