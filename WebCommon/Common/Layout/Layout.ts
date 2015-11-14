namespace layout {
  export const defaultPlaygroundId = 'playground-default';
  export const defaultSceneId = 'scene-default';
}
namespace config {
  export interface IData {
    layout: { //konfigurace layout aplikace
      routeActionToSceneId: (routeAction: flux.IAction) => string;
      playgroundContents: { //definuj RENDER obsah
        [id: string]: { //pro kazdy PlayGround
          [routeAction: string]: layout.TRenderFunction; //a pro kaztou route action. routeAction je flux.actionPath(IAction)
        }
      }
    };
  }
  cfg.data.layout = {
    routeActionToSceneId: action => layout.defaultSceneId,
    playgroundContents: { [layout.defaultPlaygroundId]: {} }
  }
}

namespace flux {
  export interface IWebState {
    layout?: layout.IRootState;
  }
}

namespace layout {

  export function changeLayout(routeAction: flux.IAction, playgs?: Array<IPlaygroundState>) {
    var playgrounds = !playgs ? [{ id: layout.defaultPlaygroundId, contentId: flux.actionPath(routeAction) }] : playgs;
    var layCfg = config.cfg.data.layout;
    if (!layCfg.routeActionToSceneId) throw 'Missing config.cfg.data.layout.routeActionToSceneId config';
    var sceneId = layCfg.routeActionToSceneId(routeAction);
    var layState = flux.getState().layout;
    if (!flux.stateConnected(layState.scene)) throw 'Scene PlaceHolder component does not exists or does not bind to flux.getState().layout.scene state';
    var sceneOK = sceneId == layState.scene.placeId;
    for (var newPl of playgrounds) {
      var oldPl = layState.playgrounds[newPl.id];
      if (!oldPl) throw 'Cannot find playground in layout state: ' + newPl.id;
      if (!flux.stateConnected(oldPl)) throw 'Scene Placeholder does not exist: ' + newPl.id;
      if (oldPl.contentId == newPl.contentId) continue;
      oldPl.contentId = newPl.contentId;
      if (sceneOK) flux.onStateChanged(oldPl);
    }
    if (sceneOK) return;
    layState.scene.placeId = sceneId;
    flux.onStateChanged(layState.scene);
  }

  export function setPlayGroundRender(moduleId: string, render: layout.TRenderFunction, playgroundId: string = layout.defaultPlaygroundId, actionId: string = uiRouter.routerActionId) {
    var playContents = config.cfg.data.layout.playgroundContents;
    if (!playContents[playgroundId]) playContents[playgroundId] = {};
    playContents[playgroundId][flux.actionPath({ moduleId: moduleId, actionId: actionId })] = render;
  }

  export type TRenderFunction = (parent: flux.SmartComponent<any, any>) => JSX.Element;
  export function sceneState(): IPlaceHolderState { return flux.getState().layout.scene; }
  export function playGroundState(id: string = defaultPlaygroundId): IPlaygroundState { return flux.getState().layout.playgrounds[layout.defaultPlaygroundId]; }

  export interface IRootState {
    scene: layout.IPlaceHolderState;
    playgrounds: {
      [id: string]: layout.IPlaygroundState;
    }
  }
  export const defaultState: IRootState = { scene: { placeId: defaultSceneId }, playgrounds: { [defaultPlaygroundId]: { id: defaultPlaygroundId } } };

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
    id: string;
    contentId?: string;
  }
  export interface IPlaygroundProps extends flux.ISmartProps<IPlaygroundState> { }

  //******************** PLACEHOLDER
  export class PlaceHolder extends flux.SmartComponent<IPlaceHolderProps, IPlaceHolderState> {
    render() {
      super.render();
      var placeId = this.props.initState.placeId;
      var cont = this.props.contents[placeId];
      if (!cont) throw 'flux.PlaceHolder.render: wrong place ' + placeId;
      return cont(this);
    }
  }
  export interface IPlaceHolderProps extends flux.ISmartProps<IPlaceHolderState> {
    contents: { [placeId: string]: TRenderFunction; }
  }
  export interface IPlaceHolderState extends flux.ISmartState {
    placeId: string;
  }

  //******************** SCENE
  export class Scene extends PlaceHolder { }

}