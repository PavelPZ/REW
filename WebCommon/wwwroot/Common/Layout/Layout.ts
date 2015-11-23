﻿namespace layout {
  export const placeContent = 'place-content'; //misto pro difotni obsah stranky
  export const sceneDefault = 'scene-default'; //difotni scena
}
namespace config {
  export interface IData {
    layout?: layout.ILayoutConfig;
  }
  cfg.data.layout = {
    scenePlaceRenderers: {},
    stateCreated: (compl) => {
      flux.getState().layout = {
        scene: { ids: [], caseId: layout.sceneDefault },
        scenePlaces: {}
      };
      compl();
    }
  }
}

namespace flux {
  export interface IAppState {
    layout?: layout.IRootState;
  }
}

namespace layout {

  export interface ILayoutConfig extends config.IInitProcConfig {
    scenePlaceRenderers: { //definuj RENDER obsah
      [scenePlaceId: string]: { //pro kazdy ScenePlace
        [rendererId: string]: layout.TRenderFunction; //a pro kazdeho renderera
      }
    }
  }

  export function changeScene(sceneId: string, first: IScenePlaceState | string, ...other: Array<IScenePlaceState>) {
    //loger.log('>changeLayout ' + routeAction.moduleId + '[' + routeAction.actionId + ']');
    var firstPs: IScenePlaceState = utils.isString(first) ? { ids: [], rendererId: <string>first } : <IScenePlaceState>first;
    var scenePlaces = [firstPs].concat(other);
    var layCfg = config.cfg.data.layout;
    //if (!layCfg.routeActionToSceneId) throw 'Missing config.cfg.data.layout.routeActionToSceneId config';
    //var sceneId = layCfg.routeActionToSceneId(routeAction);
    var layState = flux.getState().layout;
    if (!flux.stateConnected(layState.scene)) throw 'Scene component does not exists or does not bind to flux.getState().layout.scene state';
    var sceneOK = sceneId == layState.scene.caseId;
    for (var newPl of scenePlaces) {
      var plId = newPl.placeId || placeContent;
      var oldPl = layState.scenePlaces[plId];
      if (!oldPl) layState.scenePlaces[plId] = oldPl = { ids: [], placeId: plId, rendererId: undefined }; //throw 'Cannot find scenePlace in layout state: ' + plId;
      if (oldPl.rendererId == newPl.rendererId) continue;
      oldPl.rendererId = newPl.rendererId;
      //overeni existence renderera
      var rends = config.cfg.data.layout.scenePlaceRenderers;
      if (!rends[oldPl.placeId] || !rends[oldPl.placeId][oldPl.rendererId]) throw `Unregistered "{oldPl.rendererId}" renderer for "{oldPl.placeId}" place.`;
      if (sceneOK) {
        flux.onStateChanged(oldPl);
      }
    }
    if (sceneOK) return;
    layState.scene.caseId = sceneId;
    flux.onStateChanged(layState.scene);
  }

  export function registerRenderer(scenePlaceId: string, rendererId: string, render: layout.TRenderFunction) {
    var renderers = config.cfg.data.layout.scenePlaceRenderers;
    if (!renderers[scenePlaceId]) renderers[scenePlaceId] = {};
    var place = renderers[scenePlaceId];
    if (place[rendererId]) throw `Place renderer ${scenePlaceId}.${rendererId} already exists `;
    place[rendererId] = render;
  }

  export type TRenderFunction = (parentId: string) => JSX.Element;
  export function scenePlaceState(id: string = placeContent): IScenePlaceState {
    var pl = flux.getState().layout.scenePlaces; var res = pl[id];
    if (!res) res = pl[id] = { ids: [], placeId: id, rendererId: null };
    return res;
  }

  export interface IRootState {
    scene: layout.ISwitcherState;
    scenePlaces: {
      [id: string]: layout.IScenePlaceState;
    }
  }

  //******************** PLAYGROUND
  export class ScenePlace extends flux.SmartComponent<IScenePlaceProps, IScenePlaceState> {
    render() {
      super.render();
      var st = this.props.initState;
      if (!st.rendererId) return null;
      return config.cfg.data.layout.scenePlaceRenderers[st.placeId][st.rendererId](this.id);
    }
  }
  export interface IScenePlaceState extends flux.ISmartState {
    placeId?: string; //!placeId => defaultScenePlaceId
    rendererId: string; //ide renderera, zaregistrovaneho v config.cfg.data.layout.scenePlaceRenderers
  }
  export interface IScenePlaceProps extends flux.ISmartProps<IScenePlaceState> { }

  //******************** SWITCHER
  export class Switcher extends flux.SmartComponent<ISwitcherProps, ISwitcherState> {
    render() {
      super.render();
      var caseId = this.props.initState.caseId; if (!caseId) return null;
      var cont = this.props.cases[caseId];
      if (!cont) throw 'flux.Switcher.render: wrong case ' + caseId;
      return cont(this.id);
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