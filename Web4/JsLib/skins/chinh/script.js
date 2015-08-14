var chinh;
(function (chinh) {
    var defaultDesign = (function () {
        function defaultDesign() {
            this.domain = 'www.edusoft.com.vn';
            this.from = "etestme@edusoft.com.vn";
        }
        defaultDesign.prototype.wishSuccess = function () { return 'Chúng tôi chúc bạn thành công với các sản phẩm giáo dục của Edusoft.'; };
        defaultDesign.prototype.LMTeam = function () { return 'Edusoft team'; };
        defaultDesign.prototype.contact = function () { return 'Edusoft.com.vn, address, Vietnam, <a href="mailto:etestme@edusoft.com.vn">etestme@edusoft.com.vn</a>, <a href="http://www.edusoft.com.vn">www.edusoft.com.vn</a>.'; };
        defaultDesign.prototype.rights = function () { return '© Edusoft 2015'; };
        return defaultDesign;
    })();
    chinh.defaultDesign = defaultDesign;
    EMailer.actEmailDesign = new defaultDesign();
})(chinh || (chinh = {}));
