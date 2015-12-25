function $loc(id: string, value: string): string { return value; }
//namespace crs {

//  export class control<P extends IControlProps, S extends IControlState> extends React.Component<P, S> {
//    constructor(props: P, context: any) {
//      super(props, context);
//      props.self = this;
//      console.log(props.id + '.constructor');
//    }
//    componentWillMount(): void { console.log(this.props.id + '.componentWillMount'); }
//    componentDidMount(): void { console.log(this.props.id + '.componentDidMount'); }
//    //componentWillReceiveProps(nextProps: IEvalProps, nextContext: any): void { console.log(this.props.id + '.componentWillReceiveProps'); }
//    //componentWillUpdate(nextProps: IEvalProps, nextState: IEvalState, nextContext: any): void { console.log(this.props.id + '.componentWillUpdate'); }
//    //componentDidUpdate(prevProps: IEvalProps, prevState: IEvalState, prevContext: any): void { console.log(this.props.id + '.componentDidUpdate'); }
//    render() {
//      console.log(this.props.id + '.render');
//      return <div>{this.props.id} / {this.props.children}</div>
//    }
//  }
//  type controlType = control<IControlProps, IControlState>;
//  interface IControlState { }
//  interface IControlProps extends React.Props<any> {
//    id: string;
//    class?: Array<string>;
//    self: controlType;
//    //odvozene
//    state: IControlState;
//    parent?: controlType;
//    childs?: Array<controlType>;
//  }

//  export class eval<P extends IEvalProps, S extends IEvalState> extends control<P, S> {
//  }
//  export interface IEvalProps extends IControlProps {
//    evalGroup?: string;
//    scoreWeight?: number;
//    evalButtonId?: string;
//  }
//  export interface IEvalState extends IControlState { }

//  export class Page extends eval<IPageProps, IPageState> {
//    render() {
//      var childs = finish(this.props.children);
//      return <div>{childs}</div>;
//    }
//  }

//  function finish(children: React.ReactNode): React.ReactNode {
//    return React.Children.map(children, (ch: React.ReactElement<CourseModel.IGapFillProps>) => {
//      return React.cloneElement<CourseModel.ITagProps>(ch, { id: 'gapfill-' + ch.props.id }, finish(ch.props.children));
//    });
//  }

//  export interface IPageProps extends IEvalProps {

//  }
//  export interface IPageState extends IEvalState { }

//}