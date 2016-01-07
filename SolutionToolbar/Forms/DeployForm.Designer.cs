namespace Author {
  partial class DeployForm {
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
      this.components = new System.ComponentModel.Container();
      System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(DeployForm));
      this.LoginGroup = new System.Windows.Forms.GroupBox();
      this.LoginLogged = new System.Windows.Forms.Label();
      this.LoginError = new System.Windows.Forms.Label();
      this.PasswordTb = new System.Windows.Forms.TextBox();
      this.EmailTb = new System.Windows.Forms.MaskedTextBox();
      this.WebLinkBtn = new System.Windows.Forms.LinkLabel();
      this.label3 = new System.Windows.Forms.Label();
      this.LoginBtn = new System.Windows.Forms.Button();
      this.label2 = new System.Windows.Forms.Label();
      this.label1 = new System.Windows.Forms.Label();
      this.groupBox2 = new System.Windows.Forms.GroupBox();
      this.textBox3 = new System.Windows.Forms.TextBox();
      this.IndividualCb = new System.Windows.Forms.CheckBox();
      this.label4 = new System.Windows.Forms.Label();
      this.CompaniesCmb = new System.Windows.Forms.ComboBox();
      this.groupBox3 = new System.Windows.Forms.GroupBox();
      this.RunCb = new System.Windows.Forms.CheckBox();
      this.ProgressBar = new System.Windows.Forms.ProgressBar();
      this.DeployBtn = new System.Windows.Forms.Button();
      this.emailError = new System.Windows.Forms.ErrorProvider(this.components);
      this.passwordError = new System.Windows.Forms.ErrorProvider(this.components);
      this.individualError = new System.Windows.Forms.ErrorProvider(this.components);
      this.groupBox1 = new System.Windows.Forms.GroupBox();
      this.textBox1 = new System.Windows.Forms.TextBox();
      this.RemoveBtn = new System.Windows.Forms.Button();
      this.LoginGroup.SuspendLayout();
      this.groupBox2.SuspendLayout();
      this.groupBox3.SuspendLayout();
      ((System.ComponentModel.ISupportInitialize)(this.emailError)).BeginInit();
      ((System.ComponentModel.ISupportInitialize)(this.passwordError)).BeginInit();
      ((System.ComponentModel.ISupportInitialize)(this.individualError)).BeginInit();
      this.groupBox1.SuspendLayout();
      this.SuspendLayout();
      // 
      // LoginGroup
      // 
      this.LoginGroup.Controls.Add(this.LoginLogged);
      this.LoginGroup.Controls.Add(this.LoginError);
      this.LoginGroup.Controls.Add(this.PasswordTb);
      this.LoginGroup.Controls.Add(this.EmailTb);
      this.LoginGroup.Controls.Add(this.WebLinkBtn);
      this.LoginGroup.Controls.Add(this.label3);
      this.LoginGroup.Controls.Add(this.LoginBtn);
      this.LoginGroup.Controls.Add(this.label2);
      this.LoginGroup.Controls.Add(this.label1);
      this.LoginGroup.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.LoginGroup.Location = new System.Drawing.Point(15, 13);
      this.LoginGroup.Name = "LoginGroup";
      this.LoginGroup.Size = new System.Drawing.Size(709, 125);
      this.LoginGroup.TabIndex = 0;
      this.LoginGroup.TabStop = false;
      this.LoginGroup.Text = "1. login first";
      // 
      // LoginLogged
      // 
      this.LoginLogged.AutoSize = true;
      this.LoginLogged.CausesValidation = false;
      this.LoginLogged.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.LoginLogged.Location = new System.Drawing.Point(7, 64);
      this.LoginLogged.Name = "LoginLogged";
      this.LoginLogged.Size = new System.Drawing.Size(19, 13);
      this.LoginLogged.TabIndex = 12;
      this.LoginLogged.Text = "   ";
      this.LoginLogged.Visible = false;
      // 
      // LoginError
      // 
      this.LoginError.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
      this.LoginError.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.LoginError.ForeColor = System.Drawing.Color.Red;
      this.LoginError.Location = new System.Drawing.Point(296, 64);
      this.LoginError.Name = "LoginError";
      this.LoginError.Size = new System.Drawing.Size(372, 16);
      this.LoginError.TabIndex = 11;
      this.LoginError.Text = "      ";
      this.LoginError.TextAlign = System.Drawing.ContentAlignment.TopRight;
      // 
      // PasswordTb
      // 
      this.PasswordTb.Location = new System.Drawing.Point(352, 41);
      this.PasswordTb.Name = "PasswordTb";
      this.PasswordTb.Size = new System.Drawing.Size(315, 20);
      this.PasswordTb.TabIndex = 10;
      // 
      // EmailTb
      // 
      this.EmailTb.Location = new System.Drawing.Point(9, 41);
      this.EmailTb.Name = "EmailTb";
      this.EmailTb.Size = new System.Drawing.Size(315, 20);
      this.EmailTb.TabIndex = 9;
      // 
      // WebLinkBtn
      // 
      this.WebLinkBtn.AutoSize = true;
      this.WebLinkBtn.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.WebLinkBtn.Location = new System.Drawing.Point(6, 96);
      this.WebLinkBtn.Name = "WebLinkBtn";
      this.WebLinkBtn.Size = new System.Drawing.Size(88, 13);
      this.WebLinkBtn.TabIndex = 6;
      this.WebLinkBtn.TabStop = true;
      this.WebLinkBtn.Text = "Zalozte si jej zde.";
      this.WebLinkBtn.Visible = false;
      this.WebLinkBtn.Click += new System.EventHandler(this.WebLinkBtn_Click);
      // 
      // label3
      // 
      this.label3.AutoSize = true;
      this.label3.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.label3.Location = new System.Drawing.Point(6, 83);
      this.label3.Name = "label3";
      this.label3.Size = new System.Drawing.Size(138, 13);
      this.label3.TabIndex = 5;
      this.label3.Text = "Nemate LANGMaster ucet?";
      this.label3.Visible = false;
      // 
      // LoginBtn
      // 
      this.LoginBtn.Enabled = false;
      this.LoginBtn.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.LoginBtn.Location = new System.Drawing.Point(581, 83);
      this.LoginBtn.Name = "LoginBtn";
      this.LoginBtn.Size = new System.Drawing.Size(87, 23);
      this.LoginBtn.TabIndex = 4;
      this.LoginBtn.Text = "Login";
      this.LoginBtn.UseVisualStyleBackColor = true;
      this.LoginBtn.Click += new System.EventHandler(this.LoginBtn_Click);
      // 
      // label2
      // 
      this.label2.AutoSize = true;
      this.label2.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.label2.Location = new System.Drawing.Point(349, 22);
      this.label2.Name = "label2";
      this.label2.Size = new System.Drawing.Size(141, 13);
      this.label2.TabIndex = 3;
      this.label2.Text = "LANGMaster-login password";
      // 
      // label1
      // 
      this.label1.AutoSize = true;
      this.label1.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.label1.Location = new System.Drawing.Point(6, 22);
      this.label1.Name = "label1";
      this.label1.Size = new System.Drawing.Size(121, 13);
      this.label1.TabIndex = 1;
      this.label1.Text = "LANGMaster-login eMail";
      // 
      // groupBox2
      // 
      this.groupBox2.Controls.Add(this.textBox3);
      this.groupBox2.Controls.Add(this.IndividualCb);
      this.groupBox2.Controls.Add(this.label4);
      this.groupBox2.Controls.Add(this.CompaniesCmb);
      this.groupBox2.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.groupBox2.Location = new System.Drawing.Point(15, 159);
      this.groupBox2.Name = "groupBox2";
      this.groupBox2.Size = new System.Drawing.Size(709, 126);
      this.groupBox2.TabIndex = 4;
      this.groupBox2.TabStop = false;
      this.groupBox2.Text = "2. select company ";
      // 
      // textBox3
      // 
      this.textBox3.BorderStyle = System.Windows.Forms.BorderStyle.None;
      this.textBox3.Enabled = false;
      this.textBox3.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.textBox3.Location = new System.Drawing.Point(9, 68);
      this.textBox3.Multiline = true;
      this.textBox3.Name = "textBox3";
      this.textBox3.ReadOnly = true;
      this.textBox3.ShortcutsEnabled = false;
      this.textBox3.Size = new System.Drawing.Size(664, 54);
      this.textBox3.TabIndex = 5;
      this.textBox3.TabStop = false;
      this.textBox3.Text = resources.GetString("textBox3.Text");
      this.textBox3.Visible = false;
      // 
      // IndividualCb
      // 
      this.IndividualCb.AutoSize = true;
      this.IndividualCb.Enabled = false;
      this.IndividualCb.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.IndividualCb.Location = new System.Drawing.Point(9, 34);
      this.IndividualCb.Name = "IndividualCb";
      this.IndividualCb.Size = new System.Drawing.Size(113, 17);
      this.IndividualCb.TabIndex = 4;
      this.IndividualCb.Text = "Individual account";
      this.IndividualCb.UseVisualStyleBackColor = true;
      this.IndividualCb.Visible = false;
      // 
      // label4
      // 
      this.label4.AutoSize = true;
      this.label4.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.label4.Location = new System.Drawing.Point(172, 18);
      this.label4.Name = "label4";
      this.label4.Size = new System.Drawing.Size(110, 13);
      this.label4.TabIndex = 1;
      this.label4.Text = "Company or institution";
      // 
      // CompaniesCmb
      // 
      this.CompaniesCmb.Enabled = false;
      this.CompaniesCmb.FormattingEnabled = true;
      this.CompaniesCmb.Location = new System.Drawing.Point(175, 34);
      this.CompaniesCmb.Name = "CompaniesCmb";
      this.CompaniesCmb.Size = new System.Drawing.Size(315, 21);
      this.CompaniesCmb.TabIndex = 0;
      // 
      // groupBox3
      // 
      this.groupBox3.Controls.Add(this.RunCb);
      this.groupBox3.Controls.Add(this.ProgressBar);
      this.groupBox3.Controls.Add(this.DeployBtn);
      this.groupBox3.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.groupBox3.Location = new System.Drawing.Point(15, 306);
      this.groupBox3.Name = "groupBox3";
      this.groupBox3.Size = new System.Drawing.Size(337, 138);
      this.groupBox3.TabIndex = 7;
      this.groupBox3.TabStop = false;
      this.groupBox3.Text = "3. publish to web";
      // 
      // RunCb
      // 
      this.RunCb.AutoSize = true;
      this.RunCb.Checked = true;
      this.RunCb.CheckState = System.Windows.Forms.CheckState.Checked;
      this.RunCb.Enabled = false;
      this.RunCb.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.RunCb.Location = new System.Drawing.Point(10, 57);
      this.RunCb.Name = "RunCb";
      this.RunCb.Size = new System.Drawing.Size(123, 17);
      this.RunCb.TabIndex = 9;
      this.RunCb.Text = "Run web application";
      this.RunCb.UseVisualStyleBackColor = true;
      this.RunCb.Visible = false;
      // 
      // ProgressBar
      // 
      this.ProgressBar.Location = new System.Drawing.Point(9, 28);
      this.ProgressBar.Name = "ProgressBar";
      this.ProgressBar.Size = new System.Drawing.Size(316, 23);
      this.ProgressBar.TabIndex = 8;
      // 
      // DeployBtn
      // 
      this.DeployBtn.Enabled = false;
      this.DeployBtn.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.DeployBtn.Location = new System.Drawing.Point(238, 98);
      this.DeployBtn.Name = "DeployBtn";
      this.DeployBtn.Size = new System.Drawing.Size(87, 23);
      this.DeployBtn.TabIndex = 7;
      this.DeployBtn.Text = "Publish";
      this.DeployBtn.UseVisualStyleBackColor = true;
      this.DeployBtn.Click += new System.EventHandler(this.DeployBtn_Click);
      // 
      // emailError
      // 
      this.emailError.ContainerControl = this;
      // 
      // passwordError
      // 
      this.passwordError.ContainerControl = this;
      // 
      // individualError
      // 
      this.individualError.ContainerControl = this;
      // 
      // groupBox1
      // 
      this.groupBox1.Controls.Add(this.textBox1);
      this.groupBox1.Controls.Add(this.RemoveBtn);
      this.groupBox1.Location = new System.Drawing.Point(367, 306);
      this.groupBox1.Name = "groupBox1";
      this.groupBox1.Size = new System.Drawing.Size(357, 138);
      this.groupBox1.TabIndex = 8;
      this.groupBox1.TabStop = false;
      this.groupBox1.Text = "... or undo web publish";
      // 
      // textBox1
      // 
      this.textBox1.BorderStyle = System.Windows.Forms.BorderStyle.None;
      this.textBox1.Enabled = false;
      this.textBox1.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.textBox1.Location = new System.Drawing.Point(10, 28);
      this.textBox1.Multiline = true;
      this.textBox1.Name = "textBox1";
      this.textBox1.ReadOnly = true;
      this.textBox1.ShortcutsEnabled = false;
      this.textBox1.Size = new System.Drawing.Size(331, 46);
      this.textBox1.TabIndex = 6;
      this.textBox1.TabStop = false;
      this.textBox1.Text = "Remove project data from server. This action does not affect your edited data.";
      // 
      // RemoveBtn
      // 
      this.RemoveBtn.Enabled = false;
      this.RemoveBtn.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.RemoveBtn.Location = new System.Drawing.Point(253, 98);
      this.RemoveBtn.Name = "RemoveBtn";
      this.RemoveBtn.Size = new System.Drawing.Size(88, 23);
      this.RemoveBtn.TabIndex = 0;
      this.RemoveBtn.Text = "Undo publish";
      this.RemoveBtn.UseVisualStyleBackColor = true;
      this.RemoveBtn.Click += new System.EventHandler(this.DeleteBtn_Click);
      // 
      // DeployForm
      // 
      this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 13F);
      this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
      this.ClientSize = new System.Drawing.Size(742, 456);
      this.Controls.Add(this.groupBox1);
      this.Controls.Add(this.groupBox3);
      this.Controls.Add(this.groupBox2);
      this.Controls.Add(this.LoginGroup);
      this.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
      this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedToolWindow;
      this.Name = "DeployForm";
      this.Text = "Project deployment";
      this.LoginGroup.ResumeLayout(false);
      this.LoginGroup.PerformLayout();
      this.groupBox2.ResumeLayout(false);
      this.groupBox2.PerformLayout();
      this.groupBox3.ResumeLayout(false);
      this.groupBox3.PerformLayout();
      ((System.ComponentModel.ISupportInitialize)(this.emailError)).EndInit();
      ((System.ComponentModel.ISupportInitialize)(this.passwordError)).EndInit();
      ((System.ComponentModel.ISupportInitialize)(this.individualError)).EndInit();
      this.groupBox1.ResumeLayout(false);
      this.groupBox1.PerformLayout();
      this.ResumeLayout(false);

    }

    #endregion

    private System.Windows.Forms.GroupBox LoginGroup;
    private System.Windows.Forms.Button LoginBtn;
    private System.Windows.Forms.Label label2;
    private System.Windows.Forms.Label label1;
    private System.Windows.Forms.GroupBox groupBox2;
    private System.Windows.Forms.Label label4;
    private System.Windows.Forms.ComboBox CompaniesCmb;
    private System.Windows.Forms.CheckBox IndividualCb;
    private System.Windows.Forms.GroupBox groupBox3;
    private System.Windows.Forms.ProgressBar ProgressBar;
    private System.Windows.Forms.Button DeployBtn;
    private System.Windows.Forms.LinkLabel WebLinkBtn;
    private System.Windows.Forms.Label label3;
    private System.Windows.Forms.CheckBox RunCb;
    private System.Windows.Forms.TextBox textBox3;
    private System.Windows.Forms.TextBox PasswordTb;
    private System.Windows.Forms.MaskedTextBox EmailTb;
    private System.Windows.Forms.Label LoginError;
    private System.Windows.Forms.Label LoginLogged;
    private System.Windows.Forms.ErrorProvider emailError;
    private System.Windows.Forms.ErrorProvider passwordError;
    private System.Windows.Forms.ErrorProvider individualError;
    private System.Windows.Forms.GroupBox groupBox1;
    private System.Windows.Forms.TextBox textBox1;
    private System.Windows.Forms.Button RemoveBtn;
  }
}