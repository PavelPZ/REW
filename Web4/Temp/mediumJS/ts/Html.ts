/// <reference path="base.ts" />
/// <reference path="utilities.ts" />
/// <reference path="injector.ts" />
module LMMedium {
  export class Html {
    constructor (public medium, public html) {
		this.clean = true;
    this.injector = new LMMedium.Injector();
  }
  clean;
  injector;

  insert (fn, selectInserted?) {
    if (Medium.activeElement === this.medium.element) {
      if (fn) {
        fn.apply(this);
      }

      var inserted = this.injector.inject(this.html, selectInserted);

      if (this.clean) {
        //cleanup
        this.medium.clean();
        this.medium.placeholders();
      }

      this.medium.makeUndoable();

      return inserted;
    } else {
      return null;
    }
  }

  /**
   * @methodOf Medium.Html
   * @param clean
   * @returns {Medium.Html}
   */
  setClean (clean) {
    this.clean = clean;
    return this;
  }
}
}
