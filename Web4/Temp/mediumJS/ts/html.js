/// <reference path="base.ts" />
/// <reference path="utilities.ts" />
/// <reference path="injector.ts" />
var LMMedium;
(function (LMMedium) {
    var Html = (function () {
        function Html(medium, html) {
            this.medium = medium;
            this.html = html;
            this.clean = true;
            this.injector = new LMMedium.Injector();
        }
        Html.prototype.insert = function (fn, selectInserted) {
            if (LMMedium.Medium.activeElement === this.medium.element) {
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
            }
            else {
                return null;
            }
        };
        /**
         * @methodOf Medium.Html
         * @param clean
         * @returns {Medium.Html}
         */
        Html.prototype.setClean = function (clean) {
            this.clean = clean;
            return this;
        };
        return Html;
    })();
    LMMedium.Html = Html;
})(LMMedium || (LMMedium = {}));
