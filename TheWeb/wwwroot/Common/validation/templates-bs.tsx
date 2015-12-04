namespace validation {

  export var getInputTemplate = (templ: IInputTemplate) => {
    var error = templ.error ? [<br/>, <span>{templ.error}</span>] : null;
    return <span>
        <input type={templ.props.type || 'text'} name={templ.props.validator.id} id={templ.props.validator.id} valueLink={templ.valueLink} onBlur={templ.blur} onKeyDown={templ.keyDown}/>
        {error}
      </span>;
  };

  export var getGroupErrorTemplate = (templ: IGroupErrorTemplate) => {
    return templ.value ? <span>{ templ.value } </span> : null;
  };

  export var getGroupTemplate = (templ: IGroupTemplate) => {
    return <div>
      <iframe name={templ.id} style={{ display: 'none' }} src="about:blank"></iframe>;
      <form target={templ.id} action="about:blank" onSubmit={ev => templ.onSubmit(ev) }>
        <input value={templ.props.cancelTitle} type="button"/> | <input value={templ.props.okTitle} type="submit"/>
        </form>
      </div>;
  };

} 