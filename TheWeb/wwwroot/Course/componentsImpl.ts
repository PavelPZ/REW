class Tag<P extends CourseModel.ITagProps, S extends CourseModel.ITagState> extends React.Component<P, S> {
  render(): JSX.Element {
    return null;
  }
  //***** Context, https://github.com/Microsoft/TypeScript/issues/4785
  static contextTypes = { pageContext: React.PropTypes.any }
  context: crs.ITagContext;
}
class EvalControl<P extends CourseModel.IEvalControlProps, S extends CourseModel.IEvalControlState> extends Tag<P, S> {
}
class Macro<P extends CourseModel.IMacroProps, S extends CourseModel.IMacroState> extends Tag<P, S> {
}
class HumanEval<P extends CourseModel.IHumanEvalProps, S extends CourseModel.IHumanEvalState> extends EvalControl<P, S> {
}
class Edit<P extends CourseModel.IEditProps, S extends CourseModel.IEditState> extends EvalControl<P, S> {
}

class Body extends Tag<CourseModel.IBodyProps, CourseModel.IBodyState> {
  constructor(props: CourseModel.IBodyProps, context: crs.ITagContext) {
    super(props, context);
  }
}

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
