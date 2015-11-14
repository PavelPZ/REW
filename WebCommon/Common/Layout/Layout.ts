namespace layout {
  export const defaultPlaygroundId = 'playground-default';
  export const defaultSceneId = 'scene-default';
}
namespace config {
  export interface IData {
    layout: { //konfigurace layout aplikace
      routeActionToSceneId: (routeAction: flux.IAction) => string;
      playgroundContents: { //definuj RENDER obsah
        [playGroundId: string]: { //pro kazdy PlayGround
          [contentId: string]: layout.TRenderFunction; //a pro kazde contentId
        }
      }
    };
  }
  cfg.data.layout = {
    routeActionToSceneId: action => layout.defaultSceneId,
    playgroundContents: {}
  }
}

namespace flux {
  export interface IWebState {
    layout?: layout.IRootState;
  }
}

namespace layout {

  export function changeLayout(routeAction: flux.IAction, first: IPlaygroundState | string, ...other: Array<IPlaygroundState>) {
    console.log('>changeLayout ' + routeAction.moduleId + '/' + routeAction.actionId);
    var firstPs: IPlaygroundState = utils.isString(first) ? { contentId: <string>first } : <IPlaygroundState>first;
    var playgrounds = [firstPs].concat(other);
    var layCfg = config.cfg.data.layout;
    if (!layCfg.routeActionToSceneId) throw 'Missing config.cfg.data.layout.routeActionToSceneId config';
    var sceneId = layCfg.routeActionToSceneId(routeAction);
    var layState = flux.getState().layout;
    if (!flux.stateConnected(layState.scene)) throw 'Scene PlaceHolder component does not exists or does not bind to flux.getState().layout.scene state';
    var sceneOK = sceneId == layState.scene.placeId;
    for (var newPl of playgrounds) {
      var plId = newPl.id || defaultPlaygroundId;
      if (!layState.playgrounds) layState.playgrounds = {};
      var oldPl = layState.playgrounds[plId];
      if (!oldPl) layState.playgrounds[plId] = oldPl = { id: plId, contentId: undefined }; //throw 'Cannot find playground in layout state: ' + plId;
      if (oldPl.contentId == newPl.contentId) continue;
      oldPl.contentId = newPl.contentId;
      if (sceneOK) {
        flux.onStateChanged(oldPl);
      }
    }
    if (sceneOK) return;
    layState.scene.placeId = sceneId;
    flux.onStateChanged(layState.scene);
  }

  export function setPlayGroundRender(playgroundId: string, contentId: string, render: layout.TRenderFunction) {
    var playContents = config.cfg.data.layout.playgroundContents;
    if (!playContents[playgroundId]) playContents[playgroundId] = {};
    playContents[playgroundId][contentId] = render;
  }

  export type TRenderFunction = (parent: flux.SmartComponent<any, any>) => JSX.Element;
  export function sceneState(): IPlaceHolderState {
    var st = flux.getState(); if (!st.layout) st.layout = {};
    var l = st.layout; return l.scene ? l.scene : l.scene = {};
  }
  export function playGroundState(id: string = defaultPlaygroundId): IPlaygroundState { return flux.getState().layout.playgrounds[id]; }

  export interface IRootState {
    scene?: layout.IPlaceHolderState;
    playgrounds?: {
      [id: string]: layout.IPlaygroundState;
    }
  }
  //export const defaultState: IRootState = { scene: { placeId: defaultSceneId }, playgrounds: { [defaultPlaygroundId]: { id: defaultPlaygroundId, contentId: null } } };

  //******************** PLAYGROUND
  export class Playground extends flux.SmartComponent<IPlaygroundProps, IPlaygroundState> {
    render() {
      super.render();
      var st = this.props.initState;
      if (!st.contentId) return null;
      return config.cfg.data.layout.playgroundContents[st.id][st.contentId](this);
    }
  }
  export interface IPlaygroundState extends flux.ISmartState {
    id?: string; //!id => defaultPlaygroundId
    contentId: string;
  }
  export interface IPlaygroundProps extends flux.ISmartProps<IPlaygroundState> { }

  //******************** PLACEHOLDER
  export class PlaceHolder extends flux.SmartComponent<IPlaceHolderProps, IPlaceHolderState> {
    render() {
      super.render();
      var placeId = this.props.initState.placeId; if (!placeId) return null;
      var cont = this.props.contents[placeId];
      if (!cont) throw 'flux.PlaceHolder.render: wrong place ' + placeId;
      return cont(this);
    }
  }
  export interface IPlaceHolderProps extends flux.ISmartProps<IPlaceHolderState> {
    contents: { [placeId: string]: TRenderFunction; }
  }
  export interface IPlaceHolderState extends flux.ISmartState {
    placeId?: string;
  }

  //******************** SCENE
  export class Scene extends PlaceHolder { }

}