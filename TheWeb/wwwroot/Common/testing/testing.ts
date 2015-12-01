namespace testing {

  //*** PLAYING
  export function startPlay(playList: IPlayList) {
    if (!playList) return;
    cookieSet({ isPlaying: true, isRecording: false });
    storageSet(playList);
    var rec = getNextRecording();
    //playList musi zacinat external navigate akci
    flux.doPlayActions(rec.actions, utils.Noop);
  }

  export function getAppAndRouteState(): flux.IRecording {
    var cook = cookieGet(); if (!cook) return null;
    if (cook.isPlaying) return getNextRecording();
    if (cook.isRecording) flux.recordStart();
    return null;
  }

  //*** RECORDING
  export function startRecording() {
    cookieSet({ isPlaying: false, isRecording: true });
    storageSet({ recordings: [] });
    flux.recordStart();
  }
  export function onExternalLink(): IPlayList {
    var cook = cookieGet(); if (!cook || cook.isRecording) return;
    var st = storageGet(); if (!st || !st.recordings) loger.doThrow('!st || !st.recordings');
    st.recordings.push(flux.recording);
    storageSet(st);
    return st;
  }
  export function stopRecording(): IPlayList  {
    cookieSet(null); storageSet(null);
    return onExternalLink();
  }


  //*** IMPL
  function getNextRecording(): flux.IRecording {
    var st = storageGet(); if (!st || !st.recordings) return null;
    var res = st.recordings[0]; if (!res) { cookieSet(null); storageSet(null); return null; }
    st.recordings.splice(0, 1);
    return res;
  }

  export interface IPlayList {
    recordings: Array<flux.IRecording>;
  }

  interface IPlayListCookie {
    isRecording: boolean; //nahrava se
    isPlaying: boolean; //prehreva se
  }

  const cookName = 'testing-playlist';
  function cookieSet(cook: IPlayListCookie) { if (cook) cookies.set(cookName, JSON.stringify(cook)); else cookies.remove(cookName); }
  function cookieGet(): IPlayListCookie { var str = cookies.get(cookName) as string; return utils.isEmpty(str) ? null : JSON.parse(str); }
  function storageSet(pl: IPlayList) { if (pl) localStorage.setItem(cookName, JSON.stringify(pl)); else localStorage.removeItem(cookName); }
  function storageGet(): IPlayList { var str = localStorage.getItem(cookName) as string; return utils.isEmpty(str) ? null : JSON.parse(str); }

}