namespace crs {
  export interface ITagContext { pageContext: IPageContext; }
  export interface IPageContext { designRender: boolean; }

  export class PageDesignTime extends React.Component<any, any> {
    constructor(props: CourseModel.IBodyProps, context: crs.ITagContext) {
      super(props, context);
    }
    static childContextTypes = { pageContext: React.PropTypes.any }
    getChildContext(): crs.ITagContext {
      return { pageContext: { designRender: true } };
    }
  }

}
