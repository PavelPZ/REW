namespace validation {

  //********************************* VALIDATE TEMPLATES
  export function getInputTemplate(templ: IInputTemplate): JSX.Element {
    var error = templ.error ? [<br/>, <span>{templ.error}</span>] : null;
    return <span>
        <input type="text" valueLink={templ.valueLink} onBlur={templ.blur} onKeyDown={templ.keyDown}/>
        {error}
      </span>;
  }

  export function getGroupErrorTemplate(templ: IGroupErrorTemplate): JSX.Element{
    return templ.value ? <span>{ templ.value } </span> : null;
  }

} 