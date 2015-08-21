module vyzva {

  export interface breadcrumbItem {
    title: string;
    url: string;
    active?: boolean;
  }

  export interface IToolbar {
    gotoHomeUrl();
    breadcrumb: Array<breadcrumbItem>;
  }
}