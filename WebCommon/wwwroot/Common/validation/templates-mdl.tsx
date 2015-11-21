namespace validation {

  //********************************* VALIDATE TEMPLATES
  //export var getInputTemplate = (templ: IInputTemplate) => {
  //  var error = templ.error ? [<span className="mdl-textfield__error" style={{visibility:'visible'}}>{templ.error}</span>] : null; var id = '$i-' + (cnt++).toString();
  //  return <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
  //    <input type="text" className="mdl-textfield__input" valueLink={templ.valueLink} onBlur={templ.blur} onKeyDown={templ.keyDown} id={id}/>
  //    <label className="mdl-textfield__label" htmlFor={id}>Number...</label>
  //      {error}
  //    </div>;
  //}
  //var cnt = 0; 

  //export var getGroupErrorTemplate = (templ: IGroupErrorTemplate) => {
  //  return templ.value ? <span className="mdl-textfield__error">{ templ.value }</span> : null;
  //};

} 

/*
  <div class="mdl-textfield mdl-js-textfield">
    <input class="mdl-textfield__input" type="text" pattern="-?[0-9]*(\.[0-9]+)?" id="sample2">
    <label class="mdl-textfield__label" for="sample2">Number...</label>
    <span class="mdl-textfield__error">Input is not a number!</span>
  </div>
*/