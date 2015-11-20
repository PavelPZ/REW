module chinh {

  export class defaultDesign implements EMailer.emailDesign {
    domain = 'www.etestme.vn';
    from = "admin@etestme.vn";
    wishSuccess(): string { return 'Chúng tôi chúc bạn thành công với các sản phẩm giáo dục của Edusoft.'; }
    LMTeam(): string { return 'Edusoft team'; }
    contact(): string { return 'eTestMe.vn, address, Vietnam, <a href="mailto:admin@etestme.vn">admin@etestme.vn</a>, <a href="http://www.etestme.vn">www.etestme.vn</a>.'; }
    rights(): string { return '© Edusoft 2015'; }
  }

  EMailer.actEmailDesign = new defaultDesign();

}