var LMMedium;
(function (LMMedium) {
    var Cache = (function () {
        function Cache() {
            this.initialized = false;
            this.cmd = false;
            this.focusedElement = null;
        }
        return Cache;
    })();
    LMMedium.Cache = Cache;
})(LMMedium || (LMMedium = {}));
//(function(Medium) {
//	"use strict";
//	Medium.Cache = function () {
//		this.initialized = false;
//		this.cmd = false;
//		this.focusedElement = null
//	};
//})(Medium);
