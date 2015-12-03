﻿var servCfg: servConfig.Root = {
  lmapp_website_id: null,
  routePrefix: 0,
  startProc: 0,
  azure: {
    connectionString: 'UseDevelopmentStorage=true',
    blobJS: 'http://127.0.0.1:10000/devstoreaccount1/js-v001',
    blobMM: 'http://127.0.0.1:10000/devstoreaccount1/mm-v001',
    //connectionString: 'DefaultEndpointsProtocol=https;AccountName=lmdata;AccountKey=Hx//uWeo6vDSA2BHbBJP7HZviSSE6D8qZhGV7f4G778yPcfGOiBODF6o7Cg6029JiqnpMm1U8KrlD3+hycYiEw==',
    //blobJS: 'http://lmdata.blob.core.windows.net/js-v001',
    //blobMM: 'http://lmdata.blob.core.windows.net/mm-v001',  
    swDeployAccount: {
      url: 'ftp://waws-prod-am2-033.ftp.azurewebsites.windows.net',
      userName: 'LMWebCommon\\pavelzika',
      password: 'pkzippkzip1_'
    },
    azureRootUrl: 'http://lmwebcommon.azurewebsites.net'
  },
  sendGrid: {
    userName: 'langmaster-email',
    password: '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',
  },
  mvcViewPars: {
    type: servConfig.MvcViewType.web,
    brand: servConfig.Brands.lm,
    debug: true,
    lang: LMComLib.Langs.cs_cz,
    skin: servConfig.SkinIds.bs,
    swFromFileSystem: true
  },
  testing: {
    testUserEMail: 'kubakaca@gmail.com',
  },
  oAuth: {
    lmLoginEmailSender: { email: '', title: '' },
    items: [
      null,
      { clientId: '' }, //google
      { clientId: '765138080284696' }, //FB
      { clientId: '' } //MS
    ]
  },
  server: {
    basicPath: '',
    web4Path: 'd:\\LMCom\\rew\\Web4',
    rootUrl: 'http://localhost:10101',
 }
}