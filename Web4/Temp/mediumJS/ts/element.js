/// <reference path="base.ts" />
/// <reference path="utilities.ts" />
var LMMedium;
(function (LMMedium) {
    var Element = (function () {
        function Element(medium, tagName, attributes) {
            this.medium = medium;
            this.element = medium.element;
            switch (tagName.toLowerCase()) {
                case 'bold':
                    this.tagName = 'b';
                    break;
                case 'italic':
                    this.tagName = 'i';
                    break;
                case 'underline':
                    this.tagName = 'u';
                    break;
                default:
                    this.tagName = tagName;
            }
            this.attributes = attributes || {};
            this.clean = true;
        }
        Element.prototype.invoke = function (fn) {
            if (LMMedium.Medium.activeElement === this.element) {
                if (fn) {
                    fn.apply(this);
                }
                var attr = this.attributes, tagName = this.tagName.toLowerCase(), applier, cl;
                if (attr.className !== undefined) {
                    cl = (attr.className.split[' '] || [attr.className]).shift();
                    delete attr.className;
                }
                else {
                    cl = 'medium-' + tagName;
                }
                applier = rangy.createClassApplier(cl, {
                    elementTagName: tagName,
                    elementAttributes: this.attributes
                });
                this.medium.makeUndoable();
                applier.toggleSelection(LMMedium.w);
                if (this.clean) {
                    //cleanup
                    this.medium.clean();
                    this.medium.placeholders();
                }
            }
        };
        /**
         *
         * @param {Boolean} clean
         * @returns {Medium.Element}
         */
        Element.prototype.setClean = function (clean) {
            this.clean = clean;
            return this;
        };
        return Element;
    })();
    LMMedium.Element = Element;
})(LMMedium || (LMMedium = {}));
