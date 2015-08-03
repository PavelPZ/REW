namespace Author {
  partial class AddForm {
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
      this.panel1 = new System.Windows.Forms.Panel();
      this.OKBtn = new System.Windows.Forms.Button();
      this.PropertyEditor = new System.Windows.Forms.PropertyGrid();
      this.panel1.SuspendLayout();
      this.SuspendLayout();
      // 
      // panel1
      // 
      this.panel1.Controls.Add(this.OKBtn);
      this.panel1.Dock = System.Windows.Forms.DockStyle.Bottom;
      this.panel1.Location = new System.Drawing.Point(0, 272);
      this.panel1.Name = "panel1";
      this.panel1.Size = new System.Drawing.Size(652, 46);
      this.panel1.TabIndex = 1;
      // 
      // OKBtn
      // 
      this.OKBtn.Anchor = System.Windows.Forms.AnchorStyles.Right;
      this.OKBtn.Location = new System.Drawing.Point(559, 11);
      this.OKBtn.Name = "OKBtn";
      this.OKBtn.Size = new System.Drawing.Size(75, 23);
      this.OKBtn.TabIndex = 0;
      this.OKBtn.Text = "OK";
      this.OKBtn.UseVisualStyleBackColor = true;
      this.OKBtn.Click += new System.EventHandler(this.OKBtn_Click);
      // 
      // PropertyEditor
      // 
      this.PropertyEditor.Dock = System.Windows.Forms.DockStyle.Fill;
      this.PropertyEditor.Location = new System.Drawing.Point(0, 0);
      this.PropertyEditor.Name = "PropertyEditor";
      this.PropertyEditor.Size = new System.Drawing.Size(652, 272);
      this.PropertyEditor.TabIndex = 2;
      // 
      // AddForm
      // 
      this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
      this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
      this.ClientSize = new System.Drawing.Size(652, 318);
      this.Controls.Add(this.PropertyEditor);
      this.Controls.Add(this.panel1);
      this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
      this.Name = "AddForm";
      this.Text = "AddForm";
      this.panel1.ResumeLayout(false);
      this.ResumeLayout(false);

    }

    #endregion

    private System.Windows.Forms.Panel panel1;
    private System.Windows.Forms.PropertyGrid PropertyEditor;
    private System.Windows.Forms.Button OKBtn;
  }
}