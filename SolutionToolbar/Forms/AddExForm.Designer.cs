namespace Author {
  partial class AddExForm {
    /// <summary>
    /// Required designer variable.
    /// </summary>
    private System.ComponentModel.IContainer components = null;

    /// <summary>
    /// Clean up any resources being used.
    /// </summary>
    /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
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
      this.webBrowser = new System.Windows.Forms.WebBrowser();
      this.panel2 = new System.Windows.Forms.Panel();
      this.label2 = new System.Windows.Forms.Label();
      this.comboBox1 = new System.Windows.Forms.ComboBox();
      this.label1 = new System.Windows.Forms.Label();
      this.NumOfPages = new System.Windows.Forms.NumericUpDown();
      this.OkBtn = new System.Windows.Forms.Button();
      this.BackBtn = new System.Windows.Forms.Button();
      this.HomeBtn = new System.Windows.Forms.Button();
      this.panel2.SuspendLayout();
      ((System.ComponentModel.ISupportInitialize)(this.NumOfPages)).BeginInit();
      this.SuspendLayout();
      // 
      // webBrowser
      // 
      this.webBrowser.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
      this.webBrowser.Location = new System.Drawing.Point(0, 55);
      this.webBrowser.Margin = new System.Windows.Forms.Padding(3, 3, 3, 40);
      this.webBrowser.MinimumSize = new System.Drawing.Size(20, 20);
      this.webBrowser.Name = "webBrowser";
      this.webBrowser.Size = new System.Drawing.Size(1064, 653);
      this.webBrowser.TabIndex = 0;
      this.webBrowser.Url = new System.Uri("http:\\\\www.langmaster.cz", System.UriKind.Absolute);
      this.webBrowser.Navigated += new System.Windows.Forms.WebBrowserNavigatedEventHandler(this.webBrowser_Navigated);
      // 
      // panel2
      // 
      this.panel2.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
      this.panel2.Controls.Add(this.label2);
      this.panel2.Controls.Add(this.comboBox1);
      this.panel2.Controls.Add(this.label1);
      this.panel2.Controls.Add(this.NumOfPages);
      this.panel2.Controls.Add(this.OkBtn);
      this.panel2.Controls.Add(this.BackBtn);
      this.panel2.Controls.Add(this.HomeBtn);
      this.panel2.Location = new System.Drawing.Point(0, -1);
      this.panel2.Name = "panel2";
      this.panel2.Size = new System.Drawing.Size(1064, 50);
      this.panel2.TabIndex = 2;
      // 
      // label2
      // 
      this.label2.Anchor = System.Windows.Forms.AnchorStyles.Right;
      this.label2.AutoSize = true;
      this.label2.Location = new System.Drawing.Point(442, 8);
      this.label2.Name = "label2";
      this.label2.Size = new System.Drawing.Size(56, 13);
      this.label2.TabIndex = 7;
      this.label2.Text = "Instruction";
      // 
      // comboBox1
      // 
      this.comboBox1.Anchor = System.Windows.Forms.AnchorStyles.Right;
      this.comboBox1.FormattingEnabled = true;
      this.comboBox1.Location = new System.Drawing.Point(440, 25);
      this.comboBox1.Name = "comboBox1";
      this.comboBox1.Size = new System.Drawing.Size(333, 21);
      this.comboBox1.TabIndex = 6;
      // 
      // label1
      // 
      this.label1.Anchor = System.Windows.Forms.AnchorStyles.Right;
      this.label1.AutoSize = true;
      this.label1.Location = new System.Drawing.Point(787, 9);
      this.label1.Name = "label1";
      this.label1.Size = new System.Drawing.Size(126, 13);
      this.label1.TabIndex = 5;
      this.label1.Text = "Number of new exercises";
      // 
      // NumOfPages
      // 
      this.NumOfPages.Anchor = System.Windows.Forms.AnchorStyles.Right;
      this.NumOfPages.Location = new System.Drawing.Point(790, 25);
      this.NumOfPages.Name = "NumOfPages";
      this.NumOfPages.Size = new System.Drawing.Size(120, 20);
      this.NumOfPages.TabIndex = 4;
      this.NumOfPages.Value = new decimal(new int[] {
            1,
            0,
            0,
            0});
      // 
      // OkBtn
      // 
      this.OkBtn.Anchor = System.Windows.Forms.AnchorStyles.Right;
      this.OkBtn.Location = new System.Drawing.Point(930, 3);
      this.OkBtn.Name = "OkBtn";
      this.OkBtn.Size = new System.Drawing.Size(134, 44);
      this.OkBtn.TabIndex = 3;
      this.OkBtn.Text = "Create exercise(s)";
      this.OkBtn.UseVisualStyleBackColor = true;
      this.OkBtn.Click += new System.EventHandler(this.OkBtn_Click);
      // 
      // BackBtn
      // 
      this.BackBtn.Location = new System.Drawing.Point(69, 15);
      this.BackBtn.Name = "BackBtn";
      this.BackBtn.Size = new System.Drawing.Size(75, 23);
      this.BackBtn.TabIndex = 1;
      this.BackBtn.Text = "Back";
      this.BackBtn.UseVisualStyleBackColor = true;
      this.BackBtn.Click += new System.EventHandler(this.BackBtn_Click);
      // 
      // HomeBtn
      // 
      this.HomeBtn.Location = new System.Drawing.Point(11, 15);
      this.HomeBtn.Name = "HomeBtn";
      this.HomeBtn.Size = new System.Drawing.Size(52, 23);
      this.HomeBtn.TabIndex = 0;
      this.HomeBtn.Text = "Home";
      this.HomeBtn.UseVisualStyleBackColor = true;
      this.HomeBtn.Click += new System.EventHandler(this.HomeBtn_Click);
      // 
      // AddExForm
      // 
      this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
      this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
      this.ClientSize = new System.Drawing.Size(1068, 713);
      this.Controls.Add(this.panel2);
      this.Controls.Add(this.webBrowser);
      this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.SizableToolWindow;
      this.Name = "AddExForm";
      this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
      this.Text = "Select exercise template";
      this.panel2.ResumeLayout(false);
      this.panel2.PerformLayout();
      ((System.ComponentModel.ISupportInitialize)(this.NumOfPages)).EndInit();
      this.ResumeLayout(false);

    }

    #endregion

    private System.Windows.Forms.WebBrowser webBrowser;
    private System.Windows.Forms.Panel panel2;
    private System.Windows.Forms.Button BackBtn;
    private System.Windows.Forms.Button HomeBtn;
    private System.Windows.Forms.Label label1;
    private System.Windows.Forms.NumericUpDown NumOfPages;
    private System.Windows.Forms.Button OkBtn;
    private System.Windows.Forms.Label label2;
    private System.Windows.Forms.ComboBox comboBox1;
  }
}