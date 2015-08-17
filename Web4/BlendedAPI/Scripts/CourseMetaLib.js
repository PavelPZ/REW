var CourseMeta;
(function (CourseMeta) {
    function extendProduct(prod) {
        $.extend(prod, CourseMeta.productEx);
        prod.moduleCache = new blended.loader.cacheOf(3);
    }
    CourseMeta.extendProduct = extendProduct;
    CourseMeta.productEx = {
        findParent: function (self, cond) {
            var c = self;
            while (c != null) {
                if (cond(c))
                    return c;
                c = c.parent;
            }
            return null;
        },
        find: function (url) {
            var pe = this;
            return (pe.nodeDir[url]);
        }
    };
})(CourseMeta || (CourseMeta = {}));
