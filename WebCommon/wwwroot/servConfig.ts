var servCfg: servConfig.Root = { 
  azure: {
    connectionString: 'UseDevelopmentStorage=true',
    blobJS: 'http://127.0.0.1:10000/devstoreaccount1/js-v001',
    blobMM: 'http://127.0.0.1:10000/devstoreaccount1/mm-v001',
    //_connectionString: 'DefaultEndpointsProtocol=https;AccountName=lmdata;AccountKey=Hx//uWeo6vDSA2BHbBJP7HZviSSE6D8qZhGV7f4G778yPcfGOiBODF6o7Cg6029JiqnpMm1U8KrlD3+hycYiEw==',
    //blobJS: 'http://lmdata.blob.core.windows.net/js-v001',
    //blobMM: 'http://lmdata.blob.core.windows.net/mm-v001',  
  },
  defaultPars: {
    app: servConfig.Apps.common,
    //app: servConfig.Apps.web4,
    brand: servConfig.Brands.lm,
    debug: false,
    lang: LMComLib.Langs.cs_cz,
    skin: servConfig.SkinIds.bs
  }
}