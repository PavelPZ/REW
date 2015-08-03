namespace OldToNewViewer {
  partial class Main {
    /// <summary>
    /// Required designer variable.
    /// </summary>
    private System.ComponentModel.IContainer components = null;

    /// <summary>
    /// Clean up any resources being used.
    /// </summary>
    /// <param id="disposing">true if managed resources should be disposed; otherwise, false.</param>
    protected override void Dispose(bool disposing) {
      if (disposing && (components != null)) {
        components.Dispose();
      }
      base.Dispose(disposing);
    }

    #region Windows Form Designer generated code

    /// <summary>
    /// Required method for Designer support - do not modify
    /// the contents of this method with the code editor.
    /// </summary>
    private void InitializeComponent() {
      this.panel1 = new System.Windows.Forms.Panel();
      this.Splitter = new System.Windows.Forms.SplitContainer();
      this.browserNew = new System.Windows.Forms.WebBrowser();
      this.browserOld = new System.Windows.Forms.WebBrowser();
      this.TopPanel = new System.Windows.Forms.Panel();
      this.XsltCmb = new System.Windows.Forms.ComboBox();
      this.url2clipboard = new System.Windows.Forms.LinkLabel();
      this.eaNew = new System.Windows.Forms.LinkLabel();
      this.eaOld = new System.Windows.Forms.LinkLabel();
      this.PZLab = new System.Windows.Forms.LinkLabel();
      this.ReportLnk = new System.Windows.Forms.LinkLabel();
      this.statusLab = new System.Windows.Forms.Label();
      this.byHandChb = new System.Windows.Forms.CheckBox();
      this.doneChb = new System.Windows.Forms.CheckBox();
      this.IENewBtn = new System.Windows.Forms.Button();
      this.IEOldBtn = new System.Windows.Forms.Button();
      this.createHand = new System.Windows.Forms.Button();
      this.checkBtn = new System.Windows.Forms.Button();
      this.EditBtn = new System.Windows.Forms.Button();
      this.comboEdit = new System.Windows.Forms.ComboBox();
      this.comboOld = new System.Windows.Forms.ComboBox();
      this.comboNew = new System.Windows.Forms.ComboBox();
      this.NextBtn = new System.Windows.Forms.Button();
      this.PrevBtn = new System.Windows.Forms.Button();
      this.BottomPanel = new System.Windows.Forms.Panel();
      this.panel1.SuspendLayout();
      ((System.ComponentModel.ISupportInitialize)(this.Splitter)).BeginInit();
      this.Splitter.Panel1.SuspendLayout();
      this.Splitter.Panel2.SuspendLayout();
      this.Splitter.SuspendLayout();
      this.TopPanel.SuspendLayout();
      this.SuspendLayout();
      // 
      // panel1
      // 
      this.panel1.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
      this.panel1.BackColor = System.Drawing.SystemColors.Control;
      this.panel1.Controls.Add(this.Splitter);
      this.panel1.Controls.Add(this.TopPanel);
      this.panel1.Controls.Add(this.BottomPanel);
      this.panel1.Dock = System.Windows.Forms.DockStyle.Fill;
      this.panel1.Location = new System.Drawing.Point(2, 2);
      this.panel1.Name = "panel1";
      this.panel1.Size = new System.Drawing.Size(1352, 813);
      this.panel1.TabIndex = 0;
      // 
      // Splitter
      // 
      this.Splitter.BackColor = System.Drawing.Color.Maroon;
      this.Splitter.Dock = System.Windows.Forms.DockStyle.Fill;
      this.Splitter.Location = new System.Drawing.Point(0, 24);
      this.Splitter.Margin = new System.Windows.Forms.Padding(0);
      this.Splitter.Name = "Splitter";
      // 
      // Splitter.Panel1
      // 
      this.Splitter.Panel1.Controls.Add(this.browserNew);
      this.Splitter.Panel1MinSize = 200;
      // 
      // Splitter.Panel2
      // 
      this.Splitter.Panel2.Controls.Add(this.browserOld);
      this.Splitter.Panel2MinSize = 200;
      this.Splitter.Size = new System.Drawing.Size(1352, 767);
      this.Splitter.SplitterDistance = 656;
      this.Splitter.TabIndex = 13;
      // 
      // browserNew
      // 
      this.browserNew.Dock = System.Windows.Forms.DockStyle.Fill;
      this.browserNew.Location = new System.Drawing.Point(0, 0);
      this.browserNew.MinimumSize = new System.Drawing.Size(20, 20);
      this.browserNew.Name = "browserNew";
      this.browserNew.Size = new System.Drawing.Size(656, 767);
      this.browserNew.TabIndex = 0;
      // 
      // browserOld
      // 
      this.browserOld.Dock = System.Windows.Forms.DockStyle.Fill;
      this.browserOld.Location = new System.Drawing.Point(0, 0);
      this.browserOld.MinimumSize = new System.Drawing.Size(20, 20);
      this.browserOld.Name = "browserOld";
      this.browserOld.Size = new System.Drawing.Size(692, 767);
      this.browserOld.TabIndex = 0;
      // 
      // TopPanel
      // 
      this.TopPanel.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
      this.TopPanel.BackColor = System.Drawing.Color.LightBlue;
      this.TopPanel.Controls.Add(this.XsltCmb);
      this.TopPanel.Controls.Add(this.url2clipboard);
      this.TopPanel.Controls.Add(this.eaNew);
      this.TopPanel.Controls.Add(this.eaOld);
      this.TopPanel.Controls.Add(this.PZLab);
      this.TopPanel.Controls.Add(this.ReportLnk);
      this.TopPanel.Controls.Add(this.statusLab);
      this.TopPanel.Controls.Add(this.byHandChb);
      this.TopPanel.Controls.Add(this.doneChb);
      this.TopPanel.Controls.Add(this.IENewBtn);
      this.TopPanel.Controls.Add(this.IEOldBtn);
      this.TopPanel.Controls.Add(this.createHand);
      this.TopPanel.Controls.Add(this.checkBtn);
      this.TopPanel.Controls.Add(this.EditBtn);
      this.TopPanel.Controls.Add(this.comboEdit);
      this.TopPanel.Controls.Add(this.comboOld);
      this.TopPanel.Controls.Add(this.comboNew);
      this.TopPanel.Controls.Add(this.NextBtn);
      this.TopPanel.Controls.Add(this.PrevBtn);
      this.TopPanel.Dock = System.Windows.Forms.DockStyle.Top;
      this.TopPanel.Location = new System.Drawing.Point(0, 0);
      this.TopPanel.Name = "TopPanel";
      this.TopPanel.Size = new System.Drawing.Size(1352, 24);
      this.TopPanel.TabIndex = 12;
      this.TopPanel.DragDrop += new System.Windows.Forms.DragEventHandler(this.Main_DragDrop);
      this.TopPanel.DragEnter += new System.Windows.Forms.DragEventHandler(this.Main_DragEnter);
      // 
      // XsltCmb
      // 
      this.XsltCmb.FormattingEnabled = true;
      this.XsltCmb.Location = new System.Drawing.Point(437, 0);
      this.XsltCmb.Name = "XsltCmb";
      this.XsltCmb.Size = new System.Drawing.Size(165, 21);
      this.XsltCmb.TabIndex = 37;
      // 
      // url2clipboard
      // 
      this.url2clipboard.AutoSize = true;
      this.url2clipboard.Location = new System.Drawing.Point(973, 4);
      this.url2clipboard.Name = "url2clipboard";
      this.url2clipboard.Size = new System.Drawing.Size(23, 13);
      this.url2clipboard.TabIndex = 36;
      this.url2clipboard.TabStop = true;
      this.url2clipboard.Text = "clip";
      this.url2clipboard.LinkClicked += new System.Windows.Forms.LinkLabelLinkClickedEventHandler(this.url2clipboard_LinkClicked);
      // 
      // eaNew
      // 
      this.eaNew.AutoSize = true;
      this.eaNew.Location = new System.Drawing.Point(1107, 3);
      this.eaNew.Name = "eaNew";
      this.eaNew.Size = new System.Drawing.Size(33, 13);
      this.eaNew.TabIndex = 35;
      this.eaNew.TabStop = true;
      this.eaNew.Text = "@xml";
      this.eaNew.LinkClicked += new System.Windows.Forms.LinkLabelLinkClickedEventHandler(this.eaNew_LinkClicked);
      // 
      // eaOld
      // 
      this.eaOld.AutoSize = true;
      this.eaOld.Location = new System.Drawing.Point(1073, 3);
      this.eaOld.Name = "eaOld";
      this.eaOld.Size = new System.Drawing.Size(34, 13);
      this.eaOld.TabIndex = 34;
      this.eaOld.TabStop = true;
      this.eaOld.Text = "@lmd";
      this.eaOld.LinkClicked += new System.Windows.Forms.LinkLabelLinkClickedEventHandler(this.eaOld_LinkClicked);
      // 
      // PZLab
      // 
      this.PZLab.AutoSize = true;
      this.PZLab.Location = new System.Drawing.Point(1042, 3);
      this.PZLab.Name = "PZLab";
      this.PZLab.Size = new System.Drawing.Size(25, 13);
      this.PZLab.TabIndex = 33;
      this.PZLab.TabStop = true;
      this.PZLab.Text = "gen";
      this.PZLab.LinkClicked += new System.Windows.Forms.LinkLabelLinkClickedEventHandler(this.PZLab_LinkClicked);
      // 
      // ReportLnk
      // 
      this.ReportLnk.AutoSize = true;
      this.ReportLnk.Location = new System.Drawing.Point(1001, 4);
      this.ReportLnk.Name = "ReportLnk";
      this.ReportLnk.Size = new System.Drawing.Size(34, 13);
      this.ReportLnk.TabIndex = 32;
      this.ReportLnk.TabStop = true;
      this.ReportLnk.Text = "report";
      this.ReportLnk.LinkClicked += new System.Windows.Forms.LinkLabelLinkClickedEventHandler(this.ReportLnk_LinkClicked);
      // 
      // statusLab
      // 
      this.statusLab.AutoSize = true;
      this.statusLab.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.statusLab.ForeColor = System.Drawing.Color.Red;
      this.statusLab.Location = new System.Drawing.Point(886, 3);
      this.statusLab.Name = "statusLab";
      this.statusLab.Size = new System.Drawing.Size(62, 13);
      this.statusLab.TabIndex = 31;
      this.statusLab.Text = "statusLab";
      // 
      // byHandChb
      // 
      this.byHandChb.AutoSize = true;
      this.byHandChb.Checked = true;
      this.byHandChb.CheckState = System.Windows.Forms.CheckState.Indeterminate;
      this.byHandChb.Location = new System.Drawing.Point(821, 2);
      this.byHandChb.Name = "byHandChb";
      this.byHandChb.Size = new System.Drawing.Size(64, 17);
      this.byHandChb.TabIndex = 30;
      this.byHandChb.Text = "by hand";
      this.byHandChb.ThreeState = true;
      this.byHandChb.UseVisualStyleBackColor = true;
      this.byHandChb.CheckStateChanged += new System.EventHandler(this.byHandChb_CheckedChanged);
      // 
      // doneChb
      // 
      this.doneChb.AutoSize = true;
      this.doneChb.Checked = true;
      this.doneChb.CheckState = System.Windows.Forms.CheckState.Indeterminate;
      this.doneChb.Location = new System.Drawing.Point(751, 3);
      this.doneChb.Name = "doneChb";
      this.doneChb.Size = new System.Drawing.Size(68, 17);
      this.doneChb.TabIndex = 29;
      this.doneChb.Text = "checked";
      this.doneChb.ThreeState = true;
      this.doneChb.UseVisualStyleBackColor = true;
      this.doneChb.CheckStateChanged += new System.EventHandler(this.doneChb_CheckedChanged);
      // 
      // IENewBtn
      // 
      this.IENewBtn.BackColor = System.Drawing.SystemColors.Control;
      this.IENewBtn.FlatStyle = System.Windows.Forms.FlatStyle.Popup;
      this.IENewBtn.Location = new System.Drawing.Point(111, 0);
      this.IENewBtn.Name = "IENewBtn";
      this.IENewBtn.Size = new System.Drawing.Size(27, 21);
      this.IENewBtn.TabIndex = 28;
      this.IENewBtn.Text = "@";
      this.IENewBtn.UseVisualStyleBackColor = false;
      this.IENewBtn.Click += new System.EventHandler(this.IENewBtn_Click);
      // 
      // IEOldBtn
      // 
      this.IEOldBtn.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
      this.IEOldBtn.BackColor = System.Drawing.SystemColors.Control;
      this.IEOldBtn.FlatStyle = System.Windows.Forms.FlatStyle.Popup;
      this.IEOldBtn.Location = new System.Drawing.Point(1214, 0);
      this.IEOldBtn.Name = "IEOldBtn";
      this.IEOldBtn.Size = new System.Drawing.Size(27, 21);
      this.IEOldBtn.TabIndex = 27;
      this.IEOldBtn.Text = "@";
      this.IEOldBtn.UseVisualStyleBackColor = false;
      this.IEOldBtn.Click += new System.EventHandler(this.IEOldBtn_Click);
      // 
      // createHand
      // 
      this.createHand.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.createHand.Location = new System.Drawing.Point(334, -1);
      this.createHand.Name = "createHand";
      this.createHand.Size = new System.Drawing.Size(104, 22);
      this.createHand.TabIndex = 25;
      this.createHand.Text = "make by hand";
      this.createHand.UseVisualStyleBackColor = true;
      this.createHand.Click += new System.EventHandler(this.createHand_Click);
      // 
      // checkBtn
      // 
      this.checkBtn.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.checkBtn.Location = new System.Drawing.Point(264, -1);
      this.checkBtn.Name = "checkBtn";
      this.checkBtn.Size = new System.Drawing.Size(73, 22);
      this.checkBtn.TabIndex = 24;
      this.checkBtn.Text = "check";
      this.checkBtn.UseVisualStyleBackColor = true;
      this.checkBtn.Click += new System.EventHandler(this.checkBtn_Click);
      // 
      // EditBtn
      // 
      this.EditBtn.BackColor = System.Drawing.SystemColors.Control;
      this.EditBtn.FlatStyle = System.Windows.Forms.FlatStyle.Popup;
      this.EditBtn.Location = new System.Drawing.Point(701, 0);
      this.EditBtn.Name = "EditBtn";
      this.EditBtn.Size = new System.Drawing.Size(41, 21);
      this.EditBtn.TabIndex = 23;
      this.EditBtn.Text = "Open";
      this.EditBtn.UseVisualStyleBackColor = false;
      this.EditBtn.Click += new System.EventHandler(this.EditBtn_Click);
      // 
      // comboEdit
      // 
      this.comboEdit.DisplayMember = "editTitle";
      this.comboEdit.FormattingEnabled = true;
      this.comboEdit.Location = new System.Drawing.Point(612, 0);
      this.comboEdit.Name = "comboEdit";
      this.comboEdit.Size = new System.Drawing.Size(89, 21);
      this.comboEdit.TabIndex = 22;
      this.comboEdit.ValueMember = "value";
      // 
      // comboOld
      // 
      this.comboOld.DisplayMember = "viewTitle";
      this.comboOld.Dock = System.Windows.Forms.DockStyle.Right;
      this.comboOld.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.comboOld.ForeColor = System.Drawing.Color.Red;
      this.comboOld.FormattingEnabled = true;
      this.comboOld.Location = new System.Drawing.Point(1242, 0);
      this.comboOld.Name = "comboOld";
      this.comboOld.Size = new System.Drawing.Size(110, 21);
      this.comboOld.TabIndex = 21;
      this.comboOld.ValueMember = "value";
      this.comboOld.SelectedIndexChanged += new System.EventHandler(this.comboOld_SelectedIndexChanged);
      // 
      // comboNew
      // 
      this.comboNew.DisplayMember = "viewTitle";
      this.comboNew.Dock = System.Windows.Forms.DockStyle.Left;
      this.comboNew.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.comboNew.ForeColor = System.Drawing.Color.Red;
      this.comboNew.FormattingEnabled = true;
      this.comboNew.Location = new System.Drawing.Point(0, 0);
      this.comboNew.Name = "comboNew";
      this.comboNew.Size = new System.Drawing.Size(111, 21);
      this.comboNew.TabIndex = 20;
      this.comboNew.ValueMember = "value";
      this.comboNew.SelectedIndexChanged += new System.EventHandler(this.comboNew_SelectedIndexChanged);
      // 
      // NextBtn
      // 
      this.NextBtn.BackColor = System.Drawing.SystemColors.Control;
      this.NextBtn.FlatStyle = System.Windows.Forms.FlatStyle.Popup;
      this.NextBtn.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold);
      this.NextBtn.ForeColor = System.Drawing.SystemColors.ControlText;
      this.NextBtn.Location = new System.Drawing.Point(201, 0);
      this.NextBtn.Margin = new System.Windows.Forms.Padding(0);
      this.NextBtn.Name = "NextBtn";
      this.NextBtn.Size = new System.Drawing.Size(60, 20);
      this.NextBtn.TabIndex = 16;
      this.NextBtn.Text = ">>";
      this.NextBtn.UseVisualStyleBackColor = false;
      this.NextBtn.Click += new System.EventHandler(this.NextBtn_Click);
      // 
      // PrevBtn
      // 
      this.PrevBtn.BackColor = System.Drawing.SystemColors.Control;
      this.PrevBtn.FlatStyle = System.Windows.Forms.FlatStyle.Popup;
      this.PrevBtn.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold);
      this.PrevBtn.ForeColor = System.Drawing.SystemColors.ControlText;
      this.PrevBtn.Location = new System.Drawing.Point(141, 0);
      this.PrevBtn.Margin = new System.Windows.Forms.Padding(0);
      this.PrevBtn.Name = "PrevBtn";
      this.PrevBtn.Size = new System.Drawing.Size(60, 20);
      this.PrevBtn.TabIndex = 15;
      this.PrevBtn.Text = "<<";
      this.PrevBtn.UseVisualStyleBackColor = false;
      this.PrevBtn.Click += new System.EventHandler(this.PrevBtn_Click);
      // 
      // BottomPanel
      // 
      this.BottomPanel.BackColor = System.Drawing.Color.LightBlue;
      this.BottomPanel.Dock = System.Windows.Forms.DockStyle.Bottom;
      this.BottomPanel.Location = new System.Drawing.Point(0, 791);
      this.BottomPanel.Name = "BottomPanel";
      this.BottomPanel.Size = new System.Drawing.Size(1352, 22);
      this.BottomPanel.TabIndex = 1;
      this.BottomPanel.DragDrop += new System.Windows.Forms.DragEventHandler(this.Main_DragDrop);
      this.BottomPanel.DragEnter += new System.Windows.Forms.DragEventHandler(this.Main_DragEnter);
      this.BottomPanel.MouseClick += new System.Windows.Forms.MouseEventHandler(this.BottomPanel_MouseClick);
      // 
      // Main
      // 
      this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
      this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
      this.BackColor = System.Drawing.SystemColors.Control;
      this.ClientSize = new System.Drawing.Size(1356, 817);
      this.Controls.Add(this.panel1);
      this.Name = "Main";
      this.Padding = new System.Windows.Forms.Padding(2);
      this.StartPosition = System.Windows.Forms.FormStartPosition.Manual;
      this.Text = "Old-to-New Viewer";
      this.WindowState = System.Windows.Forms.FormWindowState.Maximized;
      this.Shown += new System.EventHandler(this.Main_Shown);
      this.panel1.ResumeLayout(false);
      this.Splitter.Panel1.ResumeLayout(false);
      this.Splitter.Panel2.ResumeLayout(false);
      ((System.ComponentModel.ISupportInitialize)(this.Splitter)).EndInit();
      this.Splitter.ResumeLayout(false);
      this.TopPanel.ResumeLayout(false);
      this.TopPanel.PerformLayout();
      this.ResumeLayout(false);

    }

    #endregion

    private System.Windows.Forms.Panel panel1;
    private System.Windows.Forms.Panel TopPanel;
    private System.Windows.Forms.Button NextBtn;
    private System.Windows.Forms.Button PrevBtn;
    private System.Windows.Forms.SplitContainer Splitter;
    private System.Windows.Forms.WebBrowser browserNew;
    private System.Windows.Forms.WebBrowser browserOld;
    private System.Windows.Forms.ComboBox comboNew;
    private System.Windows.Forms.ComboBox comboOld;
    private System.Windows.Forms.ComboBox comboEdit;
    private System.Windows.Forms.Button EditBtn;
    private System.Windows.Forms.Panel BottomPanel;
    private System.Windows.Forms.Button checkBtn;
    private System.Windows.Forms.Button createHand;
    private System.Windows.Forms.Button IENewBtn;
    private System.Windows.Forms.Button IEOldBtn;
    private System.Windows.Forms.CheckBox byHandChb;
    private System.Windows.Forms.CheckBox doneChb;
    private System.Windows.Forms.Label statusLab;
    private System.Windows.Forms.LinkLabel ReportLnk;
    private System.Windows.Forms.LinkLabel PZLab;
    private System.Windows.Forms.LinkLabel eaNew;
    private System.Windows.Forms.LinkLabel eaOld;
    private System.Windows.Forms.LinkLabel url2clipboard;
    private System.Windows.Forms.ComboBox XsltCmb;

  }
}

