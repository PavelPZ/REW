namespace testing {

  //*** PLAYING
  export function startPlay() {
    var rec = getNextRecording();
    oauth.authToCookie(rec.initStatus.auth);
    rec.initStatus.auth
    if (!rec) return;
    cookieSet({ isPlaying: true, isRecording: false });
    //playList musi zacinat external navigate akci
    flux.doPlayActions(rec.actions, utils.Noop);
  }

  export function continuePlaying(): flux.IRecording {
    var cook = cookieGet(); if (!cook || !cook.isPlaying) return null;
    return getNextRecording();
  }

  export function continueRecording() {
    var cook = cookieGet(); if (!cook || !cook.isRecording) return;
    flux.recordStart();
  }


  //*** RECORDING
  export function startRecording() {
    cookieSet({ isPlaying: false, isRecording: true });
    storageSet({ recordings: [] });
    flux.recordStart();
  }
  export function onExternalLink(): IPlayList {
    var cook = cookieGet(); if (!cook || !cook.isRecording) return;
    return addLastRecording();
  }
  export function stopRecording(): void  {
    addLastRecording()
    cookieSet(null); 
  }


  //*** IMPL
  function addLastRecording(): IPlayList {
    var st = storageGet(); if (!st || !st.recordings) loger.doThrow('!st || !st.recordings');
    loger.log('testing.addLastRecording: ' + JSON.stringify(flux.recording));
    st.recordings.push(flux.recording); delete flux.recording;
    storageSet(st);
    return st;
  }

  function getNextRecording(): flux.IRecording {
    var st = storageGet(); if (!st || !st.recordings) return null;
    var res = st.recordings[0]; if (!res) { cookieSet(null); storageSet(null); return null; }
    loger.log('testing.getNextRecording: ' + JSON.stringify(res));
    st.recordings.splice(0, 1);
    storageSet(st);
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