namespace validation {

  export var getInputTemplate = (self: Input, valueLink: React.ReactLink<string>) => {
    var error = self.state.error ? [<br key={flux.cnt() }/>, <span key={flux.cnt() }>{self.state.error}</span>] : null;
    return <span>
      <span>{self.props.title}</span>
      <input
          type={self.props.type || 'text'}
          name={self.id}
          id={self.id}
          onBlur={() => self.doBlur() }
          onKeyDown={ev => self.keyDown(ev) }
          tabIndex = {self.tabIndex}
          valueLink={valueLink}
          autoComplete={self.props.type == 'password' ? 'off' : 'on'}
          autoFocus={self.tabIndex == 1}
        />
        {error}
      </span>;
  };

  //export var getGroupErrorTemplate = (templ: IGroupErrorTemplate) => {
  //  return templ.value ? <span>{ templ.value } </span> : null;
  //};

  export var getGroupTemplate = (self: Group) => {
    return <div>
      <iframe name={self.id} style={{ display: 'none' }} src="about:blank"></iframe>;
      <form target={self.id} action="about:blank" onSubmit={ev => self.onSubmit(ev) }>
        {self.props.children}<br/>
        <input value={self.props.cancelTitle} type="button" onClick={self.props.onCancel}/> | <input value={self.props.okTitle} type="submit"/>
        </form>
      </div>;
  };

} 