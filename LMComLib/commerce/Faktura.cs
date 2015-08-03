#if !GOPAS
using System;
using System.IO;
using System.Collections.Generic;
using System.Diagnostics;
using iTextSharp.text;
using iTextSharp.text.pdf;
using System.Web.Hosting;
using System.Resources;
using LMNetLib;

/*
namespace LMComLib.Commerce.PDF {

  public class Faktura {
    #region Properities
    private Prijemce prijemce;
    private Dodavatel dodavatel;
    private DetailPlatby detail;
    private Platba platba;
    private string CisloFaktury = "";

    BaseFont bfArial;
    /// <summary>
    /// 8
    /// </summary>
    Font fontItem;
    Font fontItemBold;
    Font fontText;
    Font fontText12;
    Font fontTextRed;
    Font fontTextBold8;
    Font fontTextBold;
    Font fontTextBold12;
    Font fontHeader;
    Font fontTextBold9;
    Font fontMini;


    string signatureImage;

    public string CertPFXPassword;
    public string CertNamePFX = null;
    public string CertNameCER = null;
    public string DocAuthorMail = "LANGMaster.com, s.r.o.";
    public List<PolozkaFaktury> PolozkyPlacene = new List<PolozkaFaktury>();
    public List<PolozkaCelkem> PolozkyCelkem = new List<PolozkaCelkem>();
    public string Comment = "";

    #endregion Properities

    static void splitLines(PdfContentByte cb) {
      cb.SetLineWidth(0.5f);
      cb.MoveTo(10, mm(95f));
      cb.LineTo(20, mm(95f));
      cb.Stroke();

      cb.MoveTo(10, mm(197f));
      cb.LineTo(20, mm(197f));
      cb.Stroke();

      cb.MoveTo(585, mm(95f));
      cb.LineTo(575, mm(95f));
      cb.Stroke();

      cb.MoveTo(585, mm(197f));
      cb.LineTo(575, mm(197f));
      cb.Stroke();
    }


    /// <summary>
    /// urrceno pro pridani prvku Datum splatnosti, Daum vystaveni, ...
    /// </summary>
    /// <returns></returns>

    Paragraph CreateParagraphR(string text) {
      Paragraph p = new Paragraph(text, fontText);
      p.Alignment = Element.ALIGN_RIGHT;
      return p;
    }
    /// <summary>
    /// vytvoří buňku tabulky
    /// </summary>
    /// <returns></returns>

    PdfPCell CreateEmptyCell(bool border) {
      PdfPCell cell = new PdfPCell(new Paragraph(" ", fontText));
      cell.BorderWidth = 0.5f;
      if (border) {
        cell.Border = Rectangle.RIGHT_BORDER;
      } else {
        cell.Border = Rectangle.NO_BORDER;
      }
      cell.VerticalAlignment = Element.ALIGN_MIDDLE;
      cell.HorizontalAlignment = Element.ALIGN_CENTER;

      return cell;
    }

    PdfPCell CreateEmptyCell() {
      return CreateEmptyCell(true);
    }
    PdfPCell CreateCell() {
      return CreateCell(true);
    }
    PdfPCell CreateCell(bool border) {
      PdfPCell cell = new PdfPCell();
      cell.BorderWidth = 0.5f;
      if (border) {
        cell.Border = Rectangle.RIGHT_BORDER;
      } else {
        cell.Border = Rectangle.NO_BORDER;
      }
      cell.VerticalAlignment = Element.ALIGN_MIDDLE;
      cell.HorizontalAlignment = Element.ALIGN_CENTER;

      return cell;
    }

    public PdfPCell createPolozkyFaktury() {
      //BaseFont bfArial = BaseFont.CreateFont("font.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
      //Font fontItem = new Font(bfArial, 7);
      //Font fontText = new Font(bfArial, 9);
      //Font fontTextRed = new Font(bfArial, 10, Font.NORMAL, new Color(255, 0, 0));
      //Font fontTextBold = new Font(bfArial, 10, Font.BOLD);
      //Font fontTextBold9 = new Font(bfArial, 9, Font.BOLD);
      //Font fontTextBold8 = new Font(bfArial, 8, Font.BOLD);
      //Font fontMini = new Font(bfArial, 7);
      //Font fontHeader = new Font(bfArial, 15);
      //kod zbozi | popis polozky | ks | jedn. cen bez DPH | sazba DPH | jedn. cena s DPH | cena celkem s DPH
      float[] f1 = { 16, 76, 13, 20, 20, 20, 20 };
      PdfPTable _table = new PdfPTable(f1);
      Paragraph p;

      //_table.BorderWidth = 1;
      //_table.Border = Rectangle.NO_BORDER;
      //_table.Padding = 0;
      //_table.Spacing = 0;

      _table.WidthPercentage = 100;

      PdfPCell _tableCell = new PdfPCell(new Paragraph("kód zboží", fontText));
      _tableCell.BorderWidth = 0.5f;
      //_tableCell.BorderWidthBottom = 1;
      _tableCell.MinimumHeight = mm(13f);
      _tableCell.Border = Rectangle.BOX;

      _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      _tableCell.HorizontalAlignment = Element.ALIGN_CENTER;
      _table.AddCell(_tableCell);

      _tableCell = new PdfPCell(new Paragraph("popis položky", fontText));
      _tableCell.BorderWidth = 0.5f;
      //_tableCell.BorderWidthBottom = 1;
      _tableCell.Border = Rectangle.BOX;
      _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      _tableCell.HorizontalAlignment = Element.ALIGN_CENTER;




      _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      _table.AddCell(_tableCell);

      _tableCell = new PdfPCell(new Paragraph("ks", fontText));
      _tableCell.BorderWidth = 0.5f;
      //_tableCell.BorderWidthBottom = 1;
      _tableCell.Border = Rectangle.BOX;
      _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      _tableCell.HorizontalAlignment = Element.ALIGN_CENTER;
      _table.AddCell(_tableCell);

      _tableCell = new PdfPCell(new Paragraph("jedn. cena" + "\n " + "bez DPH", fontText));
      _tableCell.BorderWidth = 0.5f;
      //_tableCell.BorderWidthBottom = 1;
      _tableCell.Border = Rectangle.BOX;
      _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      _tableCell.HorizontalAlignment = Element.ALIGN_CENTER;
      _table.AddCell(_tableCell);

      _tableCell = new PdfPCell(new Paragraph("sazba DPH", fontText));
      _tableCell.BorderWidth = 0.5f;
      //_tableCell.BorderWidthBottom = 1;
      _tableCell.Border = Rectangle.BOX;
      _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      _tableCell.HorizontalAlignment = Element.ALIGN_CENTER;
      //p = new Paragraph("sazba DPH", fontText);
      //p.Alignment = Element.ALIGN_CENTER;
      //_tableCell.AddElement(p); 

      _table.AddCell(_tableCell);

      _tableCell = new PdfPCell(new Paragraph("jedn. cena" + "\n " + "s DPH", fontText));
      _tableCell.BorderWidth = 0.5f;
      //_tableCell.BorderWidthBottom = 1;
      _tableCell.Border = Rectangle.BOX;
      _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      _tableCell.HorizontalAlignment = Element.ALIGN_CENTER;
      _table.AddCell(_tableCell);

      _tableCell = new PdfPCell(new Paragraph("cena celkem" + "\n " + "s DPH", fontText));
      _tableCell.BorderWidth = 0.5f;
      //_tableCell.BorderWidthBottom = 1;
      _tableCell.Border = Rectangle.BOX;
      _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      _tableCell.HorizontalAlignment = Element.ALIGN_CENTER;
      _table.AddCell(_tableCell);


      foreach (PolozkaFaktury polozka in this.PolozkyPlacene) {
        _tableCell = CreateCell();
        _tableCell.Border |= Rectangle.LEFT_BORDER;
        Paragraph paragraph = new Paragraph(polozka.Kod, fontItem);
        paragraph.Alignment = Element.ALIGN_CENTER;
        _tableCell.AddElement(paragraph);
        _table.AddCell(_tableCell);


        _tableCell = CreateCell();
        p = new Paragraph(polozka.Popis, fontItem);

        _tableCell.AddElement(p);
        _tableCell.PaddingLeft = mm(1f);
        _table.AddCell(_tableCell);

        p = new Paragraph(polozka.Mnozstvi, fontItem);
        p.Alignment = Element.ALIGN_CENTER;
        _tableCell = CreateCell();
        _tableCell.AddElement(p);
        _table.AddCell(_tableCell);

        p = new Paragraph(polozka.JednotkovaCena, fontItem);
        p.Alignment = Element.ALIGN_RIGHT;
        _tableCell = CreateCell();
        _tableCell.PaddingRight = mm(2.5f);
        _tableCell.AddElement(p);
        _table.AddCell(_tableCell);

        p = new Paragraph(polozka.DPH, fontItem);
        p.Alignment = Element.ALIGN_RIGHT;
        _tableCell = CreateCell();
        _tableCell.PaddingRight = mm(2.5f);
        _tableCell.AddElement(p);
        _table.AddCell(_tableCell);

        p = new Paragraph(polozka.JednotkovaCenaDPH, fontItem);
        p.Alignment = Element.ALIGN_RIGHT;
        _tableCell = CreateCell();
        _tableCell.PaddingRight = mm(2.5f);
        _tableCell.AddElement(p);
        _table.AddCell(_tableCell);

        p = new Paragraph(polozka.SDPHCelkem, fontItem);
        p.Alignment = Element.ALIGN_RIGHT;
        _tableCell = CreateCell();
        _tableCell.PaddingRight = mm(2.5f);
        _tableCell.AddElement(p);
        _table.AddCell(_tableCell);
      }

      for (int i = 0; i < (19 - this.PolozkyPlacene.Count); i++) {
        //_table.AddCell(new PdfPCell(new Paragraph("1",fontText)));
        PdfPCell cell = CreateEmptyCell();
        cell.Border |= Rectangle.LEFT_BORDER;
        _table.AddCell(cell);
        _table.AddCell(CreateEmptyCell());
        _table.AddCell(CreateEmptyCell());
        _table.AddCell(CreateEmptyCell());
        _table.AddCell(CreateEmptyCell());
        _table.AddCell(CreateEmptyCell());
        _table.AddCell(CreateEmptyCell());
      }
      _tableCell = CreateCell();
      _tableCell.Border |= Rectangle.LEFT_BORDER | Rectangle.BOTTOM_BORDER;
      _table.AddCell(_tableCell);

      _tableCell = CreateCell();
      _tableCell.Border |= Rectangle.LEFT_BORDER | Rectangle.BOTTOM_BORDER;
      _tableCell.AddElement(new Paragraph("zaokrouhlení", fontText));
      _table.AddCell(_tableCell);

      _tableCell = CreateCell();
      _tableCell.Border |= Rectangle.LEFT_BORDER | Rectangle.BOTTOM_BORDER;
      _table.AddCell(_tableCell);
      _tableCell = CreateCell();
      _tableCell.Border |= Rectangle.LEFT_BORDER | Rectangle.BOTTOM_BORDER;
      _table.AddCell(_tableCell);
      _tableCell = CreateCell();
      _tableCell.Border |= Rectangle.LEFT_BORDER | Rectangle.BOTTOM_BORDER;
      _table.AddCell(_tableCell);
      _tableCell = CreateCell();
      _tableCell.Border |= Rectangle.LEFT_BORDER | Rectangle.BOTTOM_BORDER;
      _table.AddCell(_tableCell);

      _tableCell = CreateCell();
      _tableCell.Border |= Rectangle.LEFT_BORDER | Rectangle.BOTTOM_BORDER;
      _tableCell.AddElement(CreateParagraphR(platba.Zaokrouhleni));
      _table.AddCell(_tableCell);

      PdfPCell pc = new PdfPCell();
      pc.Border = Rectangle.NO_BORDER;
      //pc.Border = Rectangle.BOTTOM_BORDER | Rectangle.TOP_BORDER;
      pc.PaddingTop = mm(0.0f);
      //pc.MinimumHeight = mm(90.0f);
      pc.AddElement(_table);
      return pc;

    }
    /// <summary>
    /// vypise slovo "prijemce" v ramecku adresy
    /// </summary>
    private void writePrijemce(Document doc, PdfWriter writer) {

      PdfTemplate template = writer.DirectContent.CreateTemplate(20, 20);
      template.BeginText();
      template.SetFontAndSize(bfArial, 8);
      template.SetTextMatrix(0, 2);
      template.ShowText("příjemce");
      float size = 8;
      float width = bfArial.GetWidthPoint("příjemce", size);
      template.Width = width;
      template.Height = size + 2;
      template.EndText();
      Image img = Image.GetInstance(template);
      img.SetAbsolutePosition(mm(100f), mm(263f));
      doc.Add(img);
    }

    protected PdfPCell getVerticalCell(string str, PdfWriter writer) {

      PdfPCell cell = new PdfPCell();

      cell.Border = Rectangle.NO_BORDER;

      PdfTemplate template = writer.DirectContent.CreateTemplate(20, 20);
      template.BeginText();
      template.SetFontAndSize(bfArial, 10);
      template.SetTextMatrix(0, 2);
      template.ShowText(str);
      float size = 10;
      float width = bfArial.GetWidthPoint(str, size);
      template.Width = width;
      template.Height = size + 2;
      template.EndText();
      Image img = Image.GetInstance(template);
      img.RotationDegrees = 90;



      Chunk ck = new Chunk(img, 0, 0);

      cell.VerticalAlignment = Element.ALIGN_MIDDLE;
      cell.HorizontalAlignment = Element.ALIGN_CENTER;
      cell.AddElement(ck);

      return cell;
    }


    protected PdfPCell createDodavatel() {
      PdfPCell cell = new PdfPCell();
      cell.Border = Rectangle.NO_BORDER;
      cell.AddElement(new Paragraph("dodavatel", fontItemBold));
      cell.AddElement(new Paragraph(dodavatel.sfNazev, fontText));
      cell.AddElement(new Paragraph(dodavatel.sfUlice + ", " + dodavatel.sfPSC + " " + dodavatel.sfMesto, fontText));
      cell.AddElement(new Paragraph("IČ:" + " " + dodavatel.sfIC + ", DIČ: " + dodavatel.sfDIC, fontText));
      cell.AddElement(new Paragraph("bankovní spojení:" + " " + dodavatel.sfBankovniSpojeni, fontText));
      Phrase phr, phrmain;


      phrmain = new Phrase();
      phr = new Phrase("číslo účtu:" + " ", fontText);
      phrmain.Add(phr);
      phr = new Phrase(dodavatel.sfCisloUctu, fontTextBold);
      phrmain.Add(phr);
      phr = new Phrase(", swift:" + " " + dodavatel.sfSWIFT, fontText);
      phrmain.Add(phr);
      cell.AddElement(new Paragraph(phrmain));
      cell.AddElement(new Paragraph(dodavatel.sfObchodniRejstrik, fontText));

      return cell;
    }
    protected PdfPCell createOdberatel() {
      PdfPCell cell = new PdfPCell();
      cell.Border = Rectangle.NO_BORDER;
      cell.AddElement(new Paragraph("odběratel", fontItemBold));
      cell.AddElement(new Paragraph(prijemce.billName + "", fontText));
      cell.AddElement(new Paragraph(prijemce.billStreet + "", fontText));
      cell.AddElement(new Paragraph(prijemce.billZIP + " " + prijemce.billCity + "", fontText));
      cell.AddElement(new Paragraph("IČ:" + " " + prijemce.IC + "", fontText));
      cell.AddElement(new Paragraph("DIČ:" + " " + prijemce.DIC + "", fontText));

      return cell;
    }
    protected PdfPCell createPrijemce() {
      PdfPCell cell = new PdfPCell();

      cell.HorizontalAlignment = Element.ALIGN_BOTTOM;
      cell.Border = Rectangle.NO_BORDER;

      cell.HorizontalAlignment = Element.ALIGN_BOTTOM;

      cell.AddElement(new Paragraph("\n\n\n", fontText12));
      cell.AddElement(new Paragraph(prijemce.shipName + "", fontTextBold12));
      cell.AddElement(new Paragraph(prijemce.shipCompany + "", fontText12));
      cell.AddElement(new Paragraph(prijemce.shipStreet + "", fontText12));
      cell.AddElement(new Paragraph(prijemce.shipZIP + " " + prijemce.shipCity + "\n\n\n", fontText12));


      float[] f = { 0.80f, 0.20f };
      PdfPTable tb = new PdfPTable(f);

      tb.WidthPercentage = 100;
      tb.HorizontalAlignment = Element.ALIGN_LEFT;
      //tb.SpacingBefore = 25;
      PdfPCell c1 = new PdfPCell();
      c1.Border = Rectangle.NO_BORDER;
      c1.PaddingRight = mm(10.0f);
      c1.HorizontalAlignment = Element.ALIGN_RIGHT;
      PdfPCell c2 = new PdfPCell();
      c2.Border = Rectangle.NO_BORDER;
      c1.AddElement(CreateParagraphR("Datum splatnosti:" + "\n" + "Datum vystavení:" + "\n" + "Datum uskut. zdan. plnění:"));
      c1.AddElement(CreateParagraphR("Variabilní symbol:" + "\n" + "Konstantní symbol:" + "\n" + "Číslo objednávky:" + "\n" + "Forma úhrady:" + "\n" + "Způsob dopravy:"));
      c2.AddElement(new Paragraph(detail.DatumSplatnosti + "\n" + detail.DatumVystaveni + "\n" + detail.DatumUskutecneni + "\n", fontTextBold9));
      c2.AddElement(new Paragraph(detail.VariabliniSymbol + "\n" + detail.KonstantniSymbol + "\n" + detail.VariabliniSymbol + "\n" + detail.ZpusobUhrady + "\n" + detail.ZpusobDopravy + "\n", fontTextBold9));
      tb.AddCell(c1);
      tb.AddCell(c2);
      //cell.PaddingLeft = 10;

      cell.AddElement(tb);

      PdfPTable table = new PdfPTable(1);
      table.AddCell(cell);
      PdfPCell cell2 = new PdfPCell(table);
      cell2.Border = Rectangle.NO_BORDER;
      cell2.HorizontalAlignment = Element.ALIGN_BOTTOM;
      return cell2;
    }


    public static float mm(float x) {
      return x * 842 / 297f;
    }

    public Faktura(string cisloFaktury, Prijemce _prijemce, Dodavatel _dodavatel, DetailPlatby _detail, Platba _platba, string fontPath, string signatureString) {
      bfArial = BaseFont.CreateFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
      fontItem = new Font(bfArial, 8);
      fontItemBold = new Font(bfArial, 8, Font.BOLD);
      fontText = new Font(bfArial, 9);
      fontText12 = new Font(bfArial, 12);
      fontTextRed = new Font(bfArial, 10, Font.NORMAL, new Color(255, 0, 0));
      fontTextBold8 = new Font(bfArial, 8, Font.BOLD);
      fontTextBold = new Font(bfArial, 10, Font.BOLD);
      fontTextBold12 = new Font(bfArial, 12, Font.BOLD);
      fontHeader = new Font(bfArial, 15);
      fontTextBold9 = new Font(bfArial, 9, Font.BOLD);
      fontMini = new Font(bfArial, 7);
      signatureImage = signatureString;

      prijemce = _prijemce;
      dodavatel = _dodavatel;
      detail = _detail;
      platba = _platba;
      CisloFaktury = cisloFaktury;
    }

    public void setWarnning(string warning) {
      this.Comment = warning;
    }

    #region Vytvoreni dokumentu

    public void VytvorPDF(MemoryStream os, DocumentType doc) {
      Document document = new Document(PageSize.A4, mm(15.0f), mm(10.0f), mm(15.0f), mm(10.0f));
      MemoryStream TmpStream = new MemoryStream();

      PdfWriter writer = PdfWriter.GetInstance(document, TmpStream);
      string docType = "";
      switch (doc) {
        case DocumentType.invoice:
          docType = "FAKTURA - daňový doklad" + "                                                   " + "č." + " ";
          break;
        case DocumentType.proforma:
          docType = "VÝZVA K ÚHRADĚ" + "                                                              " + "č." + " ";
          break;
        case DocumentType.adviceOfCredit:
          docType = "OPRAVNÝ DAŇOVÝ DOKLAD" + "                                                              " + "č." + " ";
          break;
      }
      HeaderFooter hf = new HeaderFooter(new Phrase(docType + this.CisloFaktury, fontHeader), false);
      hf.Border = Rectangle.BOTTOM_BORDER;
      hf.Alignment = Element.ALIGN_LEFT;
      document.Header = hf;

      document.Open();
      PdfTemplate template = writer.DirectContent.CreateTemplate(20, 20);
      template.BeginText();
      float size = 15;
      template.SetFontAndSize(bfArial, size);
      template.SetTextMatrix(0, 2);
      template.ShowText(docType);

      float width = bfArial.GetWidthPoint(docType, size);
      template.Width = width;
      template.Height = size + 2;
      template.EndText();
      Image img = Image.GetInstance(template);

      Chunk ck = new Chunk(img, 0, 0);




      img.SetAbsolutePosition(mm(10f), mm(285));
      //document.Add(img);

      Phrase oPhrase = new Phrase("Langmaster \nStránka ", fontItem);
      HeaderFooter footer = new HeaderFooter(oPhrase, true);
      footer.Border = Rectangle.TOP_BORDER;
      footer.Alignment = Element.ALIGN_CENTER;
      //document.Footer = footer;


      //PdfPTable tabulkaOdb = new PdfPTable(1);
      //PdfPCell c = getVerticalCell("odběratel", writer);
      //c.MinimumHeight = 90;
      //c.Border = Rectangle.NO_BORDER;
      //c.BorderWidth = 0;
      //c.VerticalAlignment = Element.ALIGN_MIDDLE;
      //tabulkaOdb.AddCell(c);


      PdfContentByte cb = writer.DirectContent;
      splitLines(cb);
      //logo
      System.Resources.ResourceManager rm = new System.Resources.ResourceManager("LMComLib.Images", System.Reflection.Assembly.GetExecutingAssembly());

      //Image jpg = Image.GetInstance("logo.jpg");

      Image jpg = Image.GetInstance((System.Drawing.Image)rm.GetObject("logo"), Color.BLACK);
      ////ResourceManager rm = new ResourceManager(

      jpg.SetAbsolutePosition(mm(160.0f), mm(10.0f));
      jpg.ScaleAbsolute(mm(40.0f), mm(23.5f));
      document.Add(jpg);
      //orámování adresy
      cb.Rectangle(mm(98f), mm(227f), mm(102f), mm(40f));
      cb.Stroke();
      writePrijemce(document, writer);
      //vytvoření hlavnní tabulky
      float[] widths = { 50.0f, 50.0f };
      PdfPTable mainTable = new PdfPTable(widths);
      mainTable.WidthPercentage = 100;
      mainTable.DefaultCell.Border = Rectangle.NO_BORDER;
      mainTable.DefaultCell.BorderWidth = 0;

      PdfPCell cell;
      //   cell = new PdfPCell();
      //   cell.Colspan = 3;
      //   cell.Border = Rectangle.BOTTOM_BORDER;
      ////   cell.AddElement(oPhrase); // vloží nadpis faktury
      //   mainTable.AddCell(cell);
      PdfPCell cell1;// = new PdfPCell(tabulkaOdb);
      //cell1.Border = Rectangle.NO_BORDER;
      float[] w = { 3.0f, 47.0f };
      PdfPTable t = new PdfPTable(w);
      t.WidthPercentage = 100;
      //t.AddCell(cell1);
      cell1 = createOdberatel();
      cell1.Colspan = 2;

      t.AddCell(cell1);
      //t.AddCell(c);
      //cell1 = getVerticalCell("dodavatel", writer);
      //t.AddCell(cell1);
      cell1 = createDodavatel();
      cell1.Colspan = 2;
      t.AddCell(cell1);

      cell1 = new PdfPCell();
      cell1.Colspan = 2;
      cell1.Border = Rectangle.NO_BORDER;
      cell1.AddElement(new Paragraph("kontakt", fontItemBold));
      cell1.AddElement(new Paragraph(dodavatel.kontaktNazev + "\n", fontText));
      cell1.AddElement(new Paragraph(dodavatel.kontaktUlice + ", " + dodavatel.kontaktPSC + " " + dodavatel.kontaktMesto + "\n", fontText));
      cell1.AddElement(new Paragraph("tel.:" + " " + dodavatel.kontaktTel + ", " + "fax:" + " " + dodavatel.kontaktFax, fontText));

      t.AddCell(cell1);

      cell = new PdfPCell();
      cell.BorderWidth = 0;
      cell.AddElement(t);
      cell.PaddingBottom = 0;
      cell.PaddingTop = 5;
      mainTable.AddCell(cell);

      //informace VS, KS, číslo objednávky, ...
      cell = createPrijemce();

      cell.Border = Rectangle.NO_BORDER;

      mainTable.AddCell(cell);

      //cell1 = getVerticalCell("kontakt"+" ", writer);
      //t = new PdfPTable(w);
      //t.WidthPercentage = 100;
      //t.AddCell(cell1);

      cell = new PdfPCell();
      cell.PaddingTop = 0;
      //cell.Colspan = 2;
      //cell.Border = Rectangle.NO_BORDER;  


      //cell.AddElement(p);



      //  mainTable.AddCell(cell);
      cell = new PdfPCell();
      cell.Border = Rectangle.NO_BORDER;
      cell.PaddingBottom = mm(5.0f);
      cell.Colspan = 3;
      mainTable.AddCell(cell);

      cell = createPolozkyFaktury();
      cell.Colspan = 2;
      mainTable.AddCell(cell);

      cell = pridejTabulkuPlatby();
      cell.Colspan = 2;
      mainTable.AddCell(cell);

      cell = new PdfPCell();
      cell.BorderWidth = 0;
      cell.AddElement(new Paragraph("poznámky:", fontItem));
      List list = new List(false, 10);
      list.Add(new ListItem("dlužná částka za dodané zboží a služby bude připsána na účet dodavatele nejpozději v den splatnosti faktury", fontItem));
      list.Add(new ListItem("v případě nedodržení této podmínky bude účtováno odběrateli penále ve výši 0,5% z dlužné částky za každý den", fontItem));
      list.Add(new ListItem("faktura slouží jako doklad o převzetí zboží (dodací list)", fontTextBold8));
      cell.AddElement(list);
      mainTable.AddCell(cell);

      cell = new PdfPCell();
      cell.Border = Rectangle.NO_BORDER;
      cell.BorderWidth = 0;
      cell.AddElement(new Paragraph("\n\n         " + "razítko a podpis", fontText));
      cell.AddElement(new Paragraph("         " + "vystavil: Tomáš Pilát", fontText));



      //cell = new PdfPCell();
      mainTable.AddCell(cell);

      document.Add(mainTable);



      //document.Add(new Paragraph(this.Comment, fontTextRed));
      //document.Add(new Paragraph("\n\n", fontTextRed));
      //if (signatureImage != null) {
      //  Image signature = Image.GetInstance(signatureImage);
      //  signature.Alignment = Element.ALIGN_RIGHT;
      //  if (signatureImage.Contains("Empty")) {
      //    signature.BorderWidth = 1;
      //    signature.Border = Rectangle.BOTTOM_BORDER | Rectangle.LEFT_BORDER | Rectangle.RIGHT_BORDER | Rectangle.TOP_BORDER;
      //  }
      //  document.Add(signature);
      //}
      document.Close();


      DocAuthor author = null;
      switch (doc) {
        case DocumentType.invoice:
          author = new DocAuthor(this.DocAuthorMail, "FAKTURA - daňový doklad č. " + this.CisloFaktury, "", "faktura", this.DocAuthorMail, this.DocAuthorMail);
          break;
        case DocumentType.proforma:
          author = new DocAuthor(this.DocAuthorMail, "ZÁLOHOVÁ FAKTURA - daňový doklad č. " + this.CisloFaktury, "", "zálohová faktura", this.DocAuthorMail, this.DocAuthorMail);
          break;
        case DocumentType.adviceOfCredit:
          author = new DocAuthor(this.DocAuthorMail, "OPRAVNÝ DAŇOVÝ DOKLAD - daňový doklad č. " + this.CisloFaktury, "", "zálohová faktura", this.DocAuthorMail, this.DocAuthorMail);
          break;
      }

      //vyhozeno, nefunguje, na OJ

      if (this.CertNamePFX != null && System.IO.File.Exists(this.CertNamePFX)) {
        FileSigner.SignPFX(this.CertNamePFX, this.CertPFXPassword, this.DocAuthorMail, "Ověření platnosti", "", author, TmpStream, os);
      } else {
        throw new Exception("neexistuje certifikat");
      }
      //byte[] res = TmpStream.ToArray();
      //os.Write(res, 0, res.Length);
    }

    public void VytvorPodepsenePDF(MemoryStream output, bool proforma) {
      Document document = new Document(PageSize.A4, 25, 25, 25, 25);
      MemoryStream TmpStream = new MemoryStream();
      try {
        PdfWriter writer = PdfWriter.GetInstance(document, TmpStream);
        //writer.SetEncryption(PdfWriter.STRENGTH128BITS, null, null, PdfWriter.AllowPrinting | PdfWriter.AllowCopy | PdfWriter.AllowScreenReaders);
        Phrase oPhrase;
        if (!proforma)
          oPhrase = new Phrase("FAKTURA - daňový doklad č. " + this.CisloFaktury + "\n", fontHeader);
        else
          oPhrase = new Phrase("ZÁLOHOVÁ FAKTURA - daňový doklad č. " + this.CisloFaktury + "\n", fontHeader); HeaderFooter header = new HeaderFooter(oPhrase, false);
        header.Border = Rectangle.BOTTOM_BORDER;
        header.Alignment = Element.ALIGN_LEFT;
        document.Header = header;
        oPhrase = new Phrase("LANGMaster" + " \n" + "Stránka ", fontItem);
        HeaderFooter footer = new HeaderFooter(oPhrase, true);
        footer.Border = Rectangle.TOP_BORDER;
        footer.Alignment = Element.ALIGN_CENTER;
        //document.Footer = footer;
        document.Open();

        pridejTabulkuPrijemce(ref document);
        pridejTabulkuDodavatel(ref document);
        pridejTabulkuPolozky(ref document);
        document.Add(new Paragraph("\n", fontItem));


        document.Add(new Paragraph(this.Comment, fontTextRed));
        if (signatureImage != null) {
          Image signature = Image.GetInstance(signatureImage);
          signature.Alignment = Element.ALIGN_RIGHT;
          document.Add(signature);
        }
      } catch (DocumentException de) {
        Console.Error.WriteLine(de.Message);
      } catch (IOException ioe) {
        Console.Error.WriteLine(ioe.Message);
      }
      document.Close();
      DocAuthor author;
      if (!proforma)
        author = new DocAuthor(this.DocAuthorMail, "FAKTURA - daňový doklad č. " + this.CisloFaktury, "", "faktura", this.DocAuthorMail, this.DocAuthorMail);
      else
        author = new DocAuthor(this.DocAuthorMail, "ZÁLOHOVÁ FAKTURA - daňový doklad č. " + this.CisloFaktury, "", "zálohová faktura", this.DocAuthorMail, this.DocAuthorMail);
      //return; //DEBUG
      if (this.CertNamePFX != null && System.IO.File.Exists(this.CertNamePFX)) {
        FileSigner.SignPFX(this.CertNamePFX, this.CertPFXPassword, this.DocAuthorMail, "Ověření platnosti", "", author, TmpStream, output);
      }
      if (this.CertNameCER != null && System.IO.File.Exists(this.CertNameCER)) {
        FileSigner.SignCER(TmpStream, output, this.CertNameCER);
      }
    }

    #endregion Vytvoreni dokumentu

    #region Pridavani Tabulek

    protected void pridejTabulkuPrijemce(ref Document document) {
      Table _table = new Table(2, 2);
      float[] f = { 1f, 1f };
      _table.Widths = f;
      _table.BorderWidth = 1;
      _table.Border = Rectangle.NO_BORDER;
      _table.Padding = 0;
      _table.Spacing = 0;
      _table.Width = 100;

      Cell _tableCell = new Cell();
      _tableCell.BorderWidth = 0;
      _tableCell.Add(new Paragraph("Odběratel:" + "\n", fontText));
      _table.AddCell(_tableCell);

      _tableCell = new Cell();
      _tableCell.BorderWidth = 0;
      _tableCell.Add(new Paragraph("Příjemce:" + "\n", fontText));
      _table.AddCell(_tableCell);

      _tableCell = new Cell();
      _tableCell.BorderWidth = 0;
      _tableCell.Add(new Paragraph(prijemce.billName + "\n", fontTextBold));
      _tableCell.Add(new Paragraph(prijemce.billStreet + "\n", fontText));
      _tableCell.Add(new Paragraph(prijemce.billZIP + " " + prijemce.billCity + "\n\n", fontText));
      _tableCell.Add(new Paragraph("IČ:" + " " + prijemce.IC + "\n", fontText));
      _tableCell.Add(new Paragraph("DIČ:" + " " + prijemce.DIC + "\n", fontText));
      _table.AddCell(_tableCell);

      _tableCell = new Cell();
      _tableCell.BorderWidth = 0;
      if (prijemce.shipCompany != null && prijemce.shipCompany != "")
        _tableCell.Add(new Paragraph(prijemce.shipCompany + "\n", fontTextBold));
      _tableCell.Add(new Paragraph(prijemce.shipName + "\n", fontTextBold));
      _tableCell.Add(new Paragraph(prijemce.shipStreet + "\n", fontText));
      _tableCell.Add(new Paragraph(prijemce.shipZIP + " " + prijemce.shipCity + "\n\n", fontText));
      _table.AddCell(_tableCell);

      document.Add(_table);
    }

    protected void pridejTabulkuDodavatel(ref Document document) {
      Table _table = new Table(2, 2);
      _table.BorderWidth = 1;
      _table.Border = Rectangle.BOTTOM_BORDER;
      //_table.Padding = 5;
      //_table.Spacing = 5;
      //_table.Cellpadding = 10;
      //_table.Cellspacing = 10;

      _table.Width = 100;

      Cell _tableCell = new Cell();
      _tableCell.BorderWidth = 0;
      _tableCell.Add(new Paragraph("Dodavatel:" + "\n", fontText));
      _table.AddCell(_tableCell);

      _tableCell = new Cell();
      _tableCell.BorderWidth = 0;
      _tableCell.Add(new Paragraph("\n", fontText));
      _table.AddCell(_tableCell);

      _tableCell = new Cell();
      _tableCell.BorderWidth = 0;
      _tableCell.Add(new Paragraph(dodavatel.sfNazev + "\n", fontText));
      _tableCell.Add(new Paragraph(dodavatel.sfUlice + ", " + dodavatel.sfPSC + " " + dodavatel.sfMesto + "\n", fontText));
      _tableCell.Add(new Paragraph("IČ:" + " " + dodavatel.sfIC + "," + "DIČ: " + dodavatel.sfDIC + "\n", fontText));
      _tableCell.Add(new Paragraph("bankovní spojení:" + " " + dodavatel.sfBankovniSpojeni + "\n", fontText));

      Paragraph p = new Paragraph();
      Phrase phr = new Phrase("číslo účtu:" + " ", fontText);
      p.Add(phr);
      phr = new Phrase(dodavatel.sfCisloUctu, fontTextRed);
      p.Add(phr);
      phr = new Phrase(", swift: " + dodavatel.sfSWIFT + "\n", fontText);
      p.Add(phr);
      _tableCell.Add(new Paragraph(p));
      _tableCell.Add(new Paragraph(dodavatel.sfObchodniRejstrik + "\n\n", fontText));
      _tableCell.Add(new Paragraph(dodavatel.kontaktNazev + "\n", fontText));
      _tableCell.Add(new Paragraph(dodavatel.kontaktUlice + ", " + dodavatel.kontaktPSC + " " + dodavatel.kontaktMesto + "\n", fontText));
      _tableCell.Add(new Paragraph("tel.:" + " " + dodavatel.kontaktTel + ", " + "fax:" + " " + dodavatel.kontaktFax + "\n", fontText));


      _table.AddCell(_tableCell);

      _tableCell = new Cell();
      _tableCell.BorderWidth = 0;

      _tableCell.Add(new Paragraph("Datum splatnosti:" + " " + detail.DatumSplatnosti + "\n", fontText));
      _tableCell.Add(new Paragraph("Datum vystavení:" + " " + detail.DatumVystaveni + "\n", fontText));
      _tableCell.Add(new Paragraph("Datum uskut. zdan. plnění:" + " " + detail.DatumUskutecneni + "\n", fontText));
      //_tableCell.Add(new Paragraph("Datum přijetí platby:"+" " + detail.DatumPrijeti + "\n", fontText));
      _tableCell.Add(new Paragraph("Forma úhrady:" + " " + detail.ZpusobUhrady + "\n", fontText));
      _tableCell.Add(new Paragraph("Variabilní symbol:" + " " + detail.VariabliniSymbol + "\n", fontText));
      _tableCell.Add(new Paragraph("Konstantní symbol:" + " " + detail.KonstantniSymbol + "\n", fontText));
      _tableCell.Add(new Paragraph("Číslo objednávky:" + " " + detail.VariabliniSymbol + "\n", fontText));
      _tableCell.Add(new Paragraph("Způsob dopravy:" + " " + detail.ZpusobDopravy + "\n", fontText));




      _table.AddCell(_tableCell);

      Table table2 = new Table(1, 1);
      Cell cell3 = new Cell(_table);
      table2.AddCell(cell3);
      table2.Width = 100;
      table2.Padding = 5;
      //document.Add(table2);
      document.Add(_table);
    }

    public void pridejTabulkuPolozky(ref Document document) {
      Table _table = new Table(7, 1);
      float[] f1 = { 0.6f, 2f, 0.6f, 0.6f, 0.6f, 0.6f, 0.6f };
      _table.Widths = f1;
      _table.BorderWidth = 0;
      _table.Border = Rectangle.NO_BORDER;
      _table.Padding = 0;
      _table.Spacing = 0;
      _table.Width = 100;

      Cell _tableCell = new Cell();
      _tableCell.BorderWidth = 0.5f;
      _tableCell.Border = Rectangle.LEFT_BORDER;
      _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      _tableCell.HorizontalAlignment = Element.ALIGN_LEFT;
      _tableCell.Add(new Paragraph("Kód zboží", fontText));
      _table.AddCell(_tableCell);

      _tableCell = new Cell();
      _tableCell.BorderWidth = 0;
      _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      _tableCell.HorizontalAlignment = Element.ALIGN_LEFT;
      _tableCell.Add(new Paragraph("Popis položky", fontText));
      _table.AddCell(_tableCell);

      _tableCell = new Cell();
      //_tableCell.BorderWidth = 0;
      _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      //_tableCell.HorizontalAlignment = Element.ALIGN_RIGHT;
      Paragraph p = new Paragraph("Ks", fontText);
      p.Alignment = Element.ALIGN_CENTER;
      _tableCell.Add(p);
      _table.AddCell(_tableCell);

      _tableCell = new Cell();
      //_tableCell.BorderWidth = 0;
      _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      //_tableCell.HorizontalAlignment = Element.ALIGN_RIGHT;
      p = new Paragraph("Jedn. cena" + "\n " + "bez DPH", fontText);
      p.Alignment = Element.ALIGN_CENTER;
      _tableCell.Add(p);
      _table.AddCell(_tableCell);

      _tableCell = new Cell();
      //_tableCell.BorderWidth = 0;
      _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      _tableCell.HorizontalAlignment = Element.ALIGN_CENTER;
      p = new Paragraph("Sazba DPH", fontText);
      p.Alignment = Element.ALIGN_CENTER;
      _tableCell.Add(p);
      _table.AddCell(_tableCell);

      _tableCell = new Cell();
      // _tableCell.BorderWidth = 0;
      _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      // _tableCell.HorizontalAlignment = Element.ALIGN_RIGHT;
      p = new Paragraph("Jedn. cena" + "\n " + "s DPH", fontText);
      p.Alignment = Element.ALIGN_CENTER;
      _tableCell.Add(p);

      _table.AddCell(_tableCell);

      _tableCell = new Cell();
      // _tableCell.BorderWidth = 0;
      _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      //_tableCell.HorizontalAlignment = Element.ALIGN_CENTER;
      p = new Paragraph("Celkem" + "\n " + "s DPH", fontText);
      p.Alignment = Element.ALIGN_CENTER;
      _tableCell.Add(p);
      _table.AddCell(_tableCell);


      foreach (PolozkaFaktury polozka in this.PolozkyPlacene) {
        _tableCell = new Cell();
        _tableCell.BorderWidth = 0;
        Paragraph paragraph = new Paragraph(polozka.Kod, fontItem);
        _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
        _tableCell.HorizontalAlignment = Element.ALIGN_CENTER;
        _tableCell.Add(paragraph);
        _table.AddCell(_tableCell);

        _tableCell = new Cell();
        _tableCell.BorderWidth = 0;
        _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
        _tableCell.HorizontalAlignment = Element.ALIGN_LEFT;
        _tableCell.Add(new Paragraph(polozka.Popis, fontItem));
        _table.AddCell(_tableCell);

        _tableCell = new Cell();
        _tableCell.BorderWidth = 0;
        _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
        _tableCell.HorizontalAlignment = Element.ALIGN_CENTER;
        _tableCell.Add(new Paragraph(polozka.Mnozstvi, fontItem));
        _table.AddCell(_tableCell);

        _tableCell = new Cell();
        _tableCell.BorderWidth = 0;
        _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
        _tableCell.HorizontalAlignment = Element.ALIGN_RIGHT;

        p = new Paragraph(polozka.JednotkovaCena, fontItem);
        p.Alignment = Element.ALIGN_RIGHT;
        _tableCell.Add(p);
        _table.AddCell(_tableCell);


        _tableCell = new Cell();
        _tableCell.BorderWidth = 0;
        _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
        _tableCell.HorizontalAlignment = Element.ALIGN_RIGHT;

        p = new Paragraph(polozka.DPH, fontItem);
        p.Alignment = Element.ALIGN_RIGHT;
        _tableCell.Add(p);
        _table.AddCell(_tableCell);

        _tableCell = new Cell();
        _tableCell.BorderWidth = 0;
        _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
        _tableCell.HorizontalAlignment = Element.ALIGN_RIGHT;
        p = new Paragraph(polozka.JednotkovaCenaDPH, fontItem);
        p.Alignment = Element.ALIGN_RIGHT;
        _tableCell.Add(p);
        _table.AddCell(_tableCell);

        _tableCell = new Cell();
        _tableCell.BorderWidth = 0;
        _tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
        _tableCell.HorizontalAlignment = Element.ALIGN_RIGHT;
        _tableCell.Add(new Paragraph(polozka.SDPHCelkem, fontItem));
        _table.AddCell(_tableCell);
      }
      for (int i = 0; i < (12 - this.PolozkyPlacene.Count); i++) {

      }
      document.Add(_table);


    }

    PdfPCell dsCell(string str, bool border, bool item) {

      PdfPCell cell = new PdfPCell(new Paragraph(str, item ? fontItem : fontText));
      cell.Border = border ? Rectangle.BOX : Rectangle.NO_BORDER;
      cell.HorizontalAlignment = Element.ALIGN_RIGHT;
      cell.MinimumHeight = mm(5f);
      return cell;
    }

    PdfPCell dsCellBold(string str) {
      PdfPCell cell = new PdfPCell(new Paragraph(str, fontTextBold));
      cell.Border = Rectangle.NO_BORDER;
      cell.HorizontalAlignment = Element.ALIGN_RIGHT;
      return cell;
    }


    protected PdfPCell pridejTabulkuPlatby() {
      float[] f2 = { 0.5f, 0.5f };
      float[] f = { 2.1f, 2.1f, 2.1f, 2.1f, 2.1f, 2.1f, 3.1f, 2.8f };

      PdfPCell pdfCell;
      PdfPTable _table = new PdfPTable(f);

      _table.DefaultCell.HorizontalAlignment = Element.ALIGN_RIGHT;
      _table.WidthPercentage = 100;

      _table.AddCell(dsCell("", false, true));
      _table.AddCell(dsCell("", false, true));
      _table.AddCell(dsCell("", false, true));
      _table.AddCell(dsCell("", false, true));
      _table.AddCell(dsCell("", false, true));
      _table.AddCell(dsCell("", false, true));
      _table.AddCell(dsCell("", false, true));
      _table.AddCell(dsCell("", false, true));





      _table.AddCell(dsCell("základ DS 0%", true, true));
      _table.AddCell(dsCell(PolozkyCelkem[0].CenaZakladDPH, true, true));
      _table.AddCell(dsCell("základ DS 10%", true, true));
      _table.AddCell(dsCell(PolozkyCelkem[1].CenaZakladDPH, true, true));
      _table.AddCell(dsCell("základ DS 20%", true, true)); //DPH 20
      _table.AddCell(dsCell(PolozkyCelkem[2].CenaZakladDPH, true, true));
      _table.AddCell(dsCell("", false, true));
      _table.AddCell(dsCell("", false, true));

      _table.AddCell(dsCell("DS 0%", true, true));
      _table.AddCell(dsCell(PolozkyCelkem[0].CenaDPH, true, true));
      _table.AddCell(dsCell("DS 10%", true, true));
      _table.AddCell(dsCell(PolozkyCelkem[1].CenaDPH, true, true));
      _table.AddCell(dsCell("DS 20%", true, true)); //DPH 20
      _table.AddCell(dsCell(PolozkyCelkem[2].CenaDPH, true, true));
      _table.AddCell(dsCellBold("Celkem k úhradě"));
      _table.AddCell(dsCellBold(platba.CelkemKUhrade));

      _table.AddCell(dsCell("", false, true));
      _table.AddCell(dsCell("", false, true));
      _table.AddCell(dsCell("", false, true));
      _table.AddCell(dsCell("", false, true));
      _table.AddCell(dsCell("", false, true));
      _table.AddCell(dsCell("", false, true));
      _table.AddCell(dsCell("", false, true));
      _table.AddCell(dsCell("", false, true));


      //  _tableCell = new PdfPCell(new Paragraph("DS " + PolozkyCelkem[0].CenaZ, fontText));
      //_tableCell.BorderWidth = 0;
      //_tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      //_table.AddCell(_tableCell);
      //_tableCell = new PdfPCell();
      //_tableCell.BorderWidth = 0;
      //_tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      //_tableCell.HorizontalAlignment = Element.ALIGN_RIGHT;
      //_tableCell.AddElement(new Paragraph(PolozkyCelkem[0].CenaDPH, fontText));
      //_table.AddCell(_tableCell);




      //_tableCell = new PdfPCell();
      //_tableCell.BorderWidth = 0;
      //_tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      //_tableCell.AddElement(new Paragraph("Základ DS ", fontText));
      //_table.AddCell(_tableCell);
      //_tableCell = new PdfPCell();
      //_tableCell.BorderWidth = 0;
      //_tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      //_tableCell.AddElement(new Paragraph("základ", fontText));
      //_table.AddCell(_tableCell);


      //_tableCell = new PdfPCell(new Paragraph("DS " + PolozkyCelkem[1].CenaZ, fontText));
      //_tableCell.BorderWidth = 0;
      //_tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      //_table.AddCell(_tableCell);
      //_tableCell = new PdfPCell();
      //_tableCell.BorderWidth = 0;
      //_tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      //_tableCell.HorizontalAlignment = Element.ALIGN_RIGHT;
      //_tableCell.AddElement(new Paragraph(PolozkyCelkem[1].CenaDPH, fontText));
      //_table.AddCell(_tableCell);


      //_tableCell = new PdfPCell();
      //_tableCell.BorderWidth = 0;
      //_tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      //_tableCell.AddElement(new Paragraph("Základ DS ", fontText));
      //_table.AddCell(_tableCell);
      //_tableCell = new PdfPCell();
      //_tableCell.BorderWidth = 0;
      //_tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      //_tableCell.AddElement(new Paragraph("základ", fontText));
      //_table.AddCell(_tableCell);


      //_tableCell = new PdfPCell(new Paragraph("DS " + PolozkyCelkem[2].CenaZ, fontText));
      //_tableCell.BorderWidth = 0;
      //_tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      //_table.AddCell(_tableCell);
      //_tableCell = new PdfPCell();
      //_tableCell.BorderWidth = 0;
      //_tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      //_tableCell.HorizontalAlignment = Element.ALIGN_RIGHT;
      //_tableCell.AddElement(new Paragraph(PolozkyCelkem[2].CenaDPH, fontText));
      //_table.AddCell(_tableCell);



      //_tableCell = new PdfPCell();
      //_tableCell.BorderWidth = 0;
      //_tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      //_tableCell.AddElement(new Paragraph("Zaokrouhlení", fontText));
      //_table.AddCell(_tableCell);

      //_tableCell = new PdfPCell();
      //_tableCell.BorderWidth = 0;
      //_tableCell.HorizontalAlignment = Element.ALIGN_RIGHT;
      //_tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      //_tableCell.AddElement(new Paragraph(platba.Zaokrouhleni, fontText));
      //_table.AddCell(_tableCell);


      //_tableCell = new PdfPCell();
      //_tableCell.BorderWidth = 0;
      //_tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      //_table.AddCell(_tableCell);

      //_tableCell = new PdfPCell();
      //_tableCell.BorderWidth = 0;
      //_tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      //_table.AddCell(_tableCell);

      pdfCell = new PdfPCell();
      pdfCell.Border = Rectangle.NO_BORDER;
      pdfCell.AddElement(_table);






      //_table = new PdfPTable(f2);
      //_table.HorizontalAlignment= Element.ALIGN_RIGHT;
      ////_table.Widths = f2;
      ////_table.BorderWidth = 0;
      //_table.WidthPercentage = 50;
      ////_table.Padding = 0;
      ////_table.Spacing = 0;

      //_tableCell = new PdfPCell();
      //_tableCell.BorderWidth = 0;
      //_tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      //_tableCell.AddElement(new Paragraph("CELKEM K ÚHRADĚ", fontTextBold));
      //_table.AddCell(_tableCell);

      //_tableCell = new PdfPCell();
      //_tableCell.BorderWidth = 0;
      //_tableCell.VerticalAlignment = Element.ALIGN_MIDDLE;
      //_tableCell.HorizontalAlignment = Element.ALIGN_RIGHT;
      //_tableCell.AddElement(new Paragraph(platba.CelkemKUhrade, fontTextBold));
      //_table.AddCell(_tableCell);
      //pdfCell = new PdfPCell(_table);
      //pdftable.AddCell(pdfCell);
      //PdfPCell tmp = new PdfPCell(pdftable);
      return pdfCell;
    }

    #endregion Pridavani Tabulek
  }

  #region Polozky na fakture

  public class PolozkaFaktury {
    public string Kod = "";
    public string Popis = "";
    public string Mnozstvi = "";
    public string JednotkovaCena = "";
    public string JednotkovaCenaDPH = "";
    public string DPH = "";
    public string SDPHCelkem = "";

    public PolozkaFaktury(string popis, string mnozstvi, string jedncena, string jednotkovaCenaDPH, string dph, string sdphcelkem) {
      Kod = "";
      Popis = popis;
      Mnozstvi = mnozstvi;
      JednotkovaCena = jedncena;
      DPH = dph;
      JednotkovaCenaDPH = jednotkovaCenaDPH;
      SDPHCelkem = sdphcelkem;
    }
  }

  public class PolozkaCelkem {
    public string Popis = "";
    public string CenaZ = "";
    public string CenaDPH = "";
    public string CenaZakladDPH = "";

    public PolozkaCelkem(string popis, string cenaZ, string cenaDPH, string cenaZakladDPH) {
      Popis = popis;
      CenaZ = cenaZ;
      CenaDPH = cenaDPH;
      CenaZakladDPH = cenaZakladDPH;
    }
  }

  public class Prijemce {
    public string billName = "";
    public string billStreet = "";
    public string billZIP = "";
    public string billCity = "";
    public string IC = "";
    public string DIC = "";

    public string shipCompany = "";
    public string shipName = "";
    public string shipStreet = "";
    public string shipZIP = "";
    public string shipCity = "";

    public Prijemce(LMComLib.ProfileData profile) {
      ZmenAdresuFakturace(profile);
      ZmenAdresuZaslani(profile);
    }

    public void ZmenAdresuFakturace(LMComLib.ProfileData profile) {
      billName = profile.Address.Title;
      billStreet = profile.Address.Street;
      billZIP = FormatZIP(profile.Address.Zip);
      billCity = profile.Address.City;
      IC = profile.IC;
      DIC = profile.DIC;

    }

    public void ZmenAdresuZaslani(LMComLib.ProfileData profile) {
      if (profile.HasShippingAddress) {
        shipCompany = profile.ShippingAddress.CompanyName;
        shipName = profile.ShippingAddress.LastName + " " + profile.ShippingAddress.FirstName;
        shipStreet = profile.ShippingAddress.Street;
        shipZIP = FormatZIP(profile.ShippingAddress.Zip);
        shipCity = profile.ShippingAddress.City;
      } else {
        shipName = profile.Address.Title;
        shipStreet = profile.Address.Street;
        shipZIP = FormatZIP(profile.Address.Zip);
        shipCity = profile.Address.City;
      }
    }

    public string ToString(string format) {
      String Text = "";
      if (format.Equals("bill")) {
        Text += this.billName + "\n";
        Text += this.billStreet + "\n";
        Text += this.billZIP + " " + this.billCity + "\n\n";
        if (this.IC != null) {
          Text += "IČ:" + " " + this.IC + "\n";
        }
        if (DIC != null) {
          Text += "DIČ:" + " " + this.DIC + "\n";
        }
      } else if (format.Equals("ship")) {
        Text += this.shipName + "\n";
        Text += this.shipStreet + "\n";
        Text += this.shipZIP + " " + this.shipCity + "\n\n";
      }
      return Text;
    }

    public static string FormatZIP(string uZIP) {
      string res = uZIP;
      if (uZIP != null && uZIP.Length == 5)
        res = uZIP.Substring(0, 3) + " " + uZIP.Substring(3, 2);
      return res;
    }
  }

  public class Dodavatel {
    public string sfNazev;
    public string sfUlice;
    public string sfPSC;
    public string sfMesto;
    public string sfIC;
    public string sfDIC;
    public string sfBankovniSpojeni;
    public string sfCisloUctu;
    public string sfSWIFT;
    public string sfObchodniRejstrik;

    public string kontaktNazev;
    public string kontaktUlice;
    public string kontaktPSC;
    public string kontaktMesto;
    public string kontaktTel;
    public string kontaktFax;

    public Dodavatel(LMComLib.Company company, CurrencyType currType) {
      sfNazev = company.Title;
      sfUlice = company.Street;
      sfPSC = company.ZIP;
      sfMesto = company.City;
      sfIC = company.IC;
      sfDIC = company.DIC;
      sfBankovniSpojeni = company.Bank;
      sfCisloUctu = company.AccountNo(currType);
      sfSWIFT = company.SWIFT;
      sfObchodniRejstrik = company.TradeRegister;

      kontaktNazev = company.contactTitle;
      kontaktUlice = company.contactStreet;
      kontaktPSC = company.contactZIP;
      kontaktMesto = company.contactCity;
      kontaktTel = company.contactPhone;
      kontaktFax = company.contactFax;
    }

    override public string ToString() {
      String Text = "";
      Text += this.sfNazev + "\n";
      Text += this.sfUlice + "\n";
      Text += this.sfPSC + " " + this.sfMesto + "\n\n";
      Text += "IČ:" + " " + this.sfIC + "\n";
      Text += "DIČ:" + " " + this.sfDIC + "\n\n";
      Text += this.sfBankovniSpojeni + "\n";
      Text += this.sfCisloUctu + "\n";
      Text += this.sfSWIFT + "\n\n";
      Text += this.sfObchodniRejstrik + "\n";
      return Text;
    }
  }

  public class DetailPlatby {
    public string VariabliniSymbol = "";
    public string CisloObjednavky = "";
    public string KonstantniSymbol = "";
    public string ZpusobUhrady = "";
    public string ZpusobDopravy = "";
    public string DatumVystaveni = "";
    public string DatumUskutecneni = "";
    public string DatumPrijeti = "";
    public string DatumSplatnosti = "";

    public DetailPlatby(Order order) {
      int spalatnost = 14;
      Int32.TryParse(System.Configuration.ConfigurationManager.AppSettings["Faktura.Splatnost"], out spalatnost);
      VariabliniSymbol = order.Id.ToString();
      CisloObjednavky = order.Id.ToString();
      KonstantniSymbol = "0308";
      ZpusobUhrady = PlatbaToString(order.BillMethod);
      ZpusobDopravy = DopravaTostring(order.ShipMethod);
      DateTime now = DateTime.UtcNow;
      DatumVystaveni = now.ToString("dd.MM.yyyy");
      DatumUskutecneni = now.ToString("dd.MM.yyyy");
      DatumPrijeti = order.CreatedOn.ToString("dd.MM.yyyy");
      if (order.BillMethod == BillingMethods.Prevod) {
        DatumSplatnosti = now.AddDays(spalatnost).ToString("dd.MM.yyyy");
      } else {
        DatumSplatnosti = now.ToString("dd.MM.yyyy");
      }
    }

    public string DopravaTostring(ShippingMethods s) {
      string res = "Download";
      switch (s) {
        case ShippingMethods.posta: res = "Pošta"; break;
        case ShippingMethods.PPL: res = "PPL"; break;
      }
      return res;
    }

    public string PlatbaToString(BillingMethods b) {
      string res = "";
      switch (b) {
        case BillingMethods.Dobirka: res = "Dobírka"; break;
        case BillingMethods.eBanka: res = "eBanka"; break;
        case BillingMethods.payMuzo: res = "Kartou"; break;
        case BillingMethods.PayPal: res = "PayPal"; break;
        case BillingMethods.Prevod: res = "Převodem"; break;
      }
      return res;
    }
    override public string ToString() {
      String Text = "";
      Text += "Variabilní symbol:" + " " + this.VariabliniSymbol + "\n";
      Text += "Číslo objednávky:" + " " + this.CisloObjednavky + "\n";
      Text += "Konstantní symbol:" + " " + this.KonstantniSymbol + "\n";
      Text += "Způsob úhrady:" + " " + this.ZpusobUhrady + "\n";
      Text += "Způsob dopravy:" + " " + this.ZpusobDopravy + "\n";
      Text += "Datum vystavení:" + " " + this.DatumVystaveni + "\n";
      Text += "Datum uskutečnění zdan. plnění:" + " " + this.DatumUskutecneni + "\n";
      Text += "Datum přijetí platby:" + " " + this.DatumPrijeti + "\n";
      Text += "Datum splatnosti:" + " " + this.DatumSplatnosti + "\n";
      return Text;
    }
  }

  public class Platba {
    public string CelkemBezDPH = "";
    public string JenDPH = "";
    public string CelkemSDPH = "";
    public string Zaokrouhleni = "";
    public string CelkemKUhrade = "";

    public Platba(string celkemBezDPH, string jenDPH, string celkemSDPH, string zaokrouhleni, string celkemKUhrade) {
      CelkemBezDPH = celkemBezDPH;
      JenDPH = jenDPH;
      CelkemSDPH = celkemSDPH;
      Zaokrouhleni = zaokrouhleni;
      CelkemKUhrade = celkemKUhrade;
    }
  }

  #endregion Polozky na fakture


}
*/
#endif
