namespace CourseMeta {

  export interface data { //rozsireni meta-dat 
    userData: Object;
    userDataChanged: boolean;
    myProduct: IProductEx;
  }

  export interface IProductAddIn {
    findParent<TRes extends data>(self: data, cond: (it: data) => boolean): TRes;
    find<TRes extends data>(url: string): TRes;
  }

  export interface IProductEx extends product, IProductAddIn{
    instructions: { [id: string]: string; };
    nodeDir: { [id: string]: data; };
    nodeList: Array<data>;
    moduleCache: blended.loader.cacheOf<blended.module>;
  }

  export function extendProduct(prod: IProductEx) {
    $.extend(prod, productEx);
    prod.moduleCache = new blended.loader.cacheOf<blended.module>(3);
  }

  export var productEx: IProductAddIn = {
    findParent<TRes extends data>(self: data, cond: (it: data) => boolean): TRes {
      var c = self;
      while (c != null) { if (cond(c)) return <TRes>c; c = c.parent; }
      return null;
    },
    find<TRes extends data>(url: string): TRes {
      var pe = <IProductEx>this;
      return <TRes>(pe.nodeDir[url]);
    }
  }
}

namespace CourseMetaNew {
  export interface SiteMap {
    //produkt
    productUrl: string; //produkt
    //data zadata odkazem...
    subUrls: Array<string>; //urls node v produktu. Url oznacuje node-produktu od modulu vyse.
    //...nebo data zadana primo
    data: CourseMeta.data; //kazde cviceni v datech musi byt obaleno modulem
  }
  export interface ITask {
    id: string; //jednoznacna identifikace tasku (timestamp)
    userData: Object; //stav objektu v uzivatelove DB
    sitemap: SiteMap;
    loader(): ng.IPromise<any>;
  }
}