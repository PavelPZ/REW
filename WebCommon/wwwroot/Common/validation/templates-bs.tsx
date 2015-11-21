namespace validation {

  export var getInputTemplate = (templ: IInputTemplate) => {
    var error = templ.error ? [<br/>, <span>{templ.error}</span>] : null;
    return <span>
        <input type="text" valueLink={templ.valueLink} onBlur={templ.blur} onKeyDown={templ.keyDown}/>
        {error}
      </span>;
  };

  export var getGroupErrorTemplate = (templ: IGroupErrorTemplate) => {
    return templ.value ? <span>{ templ.value } </span> : null;
  };

} 