module chinh {

  export class defaultDesign implements EMailer.emailDesign {
    domain = 'www.edusoft.com.vn';
    from = "etestme@edusoft.com.vn";
    wishSuccess(): string { return 'Chúng tôi chúc bạn thành công với các sản phẩm giáo dục của Edusoft.'; }
    LMTeam(): string { return 'Edusoft team'; }
    contact(): string { return 'Edusoft.com.vn, address, Vietnam, <a href="mailto:etestme@edusoft.com.vn">etestme@edusoft.com.vn</a>, <a href="http://www.edusoft.com.vn">www.edusoft.com.vn</a>.'; }
    rights(): string { return '© Edusoft 2015'; }
  }

  EMailer.actEmailDesign = new defaultDesign();

}