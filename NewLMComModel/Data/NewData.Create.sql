USE [NewLMCom]
GO
/****** Object:  Table [dbo].[Companies]    Script Date: 19/11/2013 14:59:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Companies](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Title] [nvarchar](max) NOT NULL,
	[ScormHost] [nvarchar](64) NULL,
 CONSTRAINT [PK_dbo.Companies] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[CompanyDepartments]    Script Date: 19/11/2013 14:59:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CompanyDepartments](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Title] [nvarchar](max) NOT NULL,
	[CompanyId] [int] NOT NULL,
 CONSTRAINT [PK_dbo.CompanyDepartments] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[CompanyLicences]    Script Date: 19/11/2013 14:59:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CompanyLicences](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[LastCounter] [int] NOT NULL,
	[Days] [smallint] NOT NULL,
	[CompanyId] [int] NOT NULL,
	[ProductId] [int] NOT NULL,
 CONSTRAINT [PK_dbo.CompanyLicences] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[CompanyUsers]    Script Date: 19/11/2013 14:59:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CompanyUsers](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Created] [datetime] NOT NULL,
	[CompanyId] [int] NOT NULL,
	[UserId] [bigint] NOT NULL,
	[DepartmentId] [int] NULL,
	[Roles] [bigint] NOT NULL,
 CONSTRAINT [PK_dbo.CompanyUsers] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[CourseDatas]    Script Date: 19/11/2013 14:59:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CourseDatas](
	[Id] [bigint] IDENTITY(1,1) NOT NULL,
	[Key] [nvarchar](80) NOT NULL,
	[Data] [nvarchar](max) NOT NULL,
	[ShortData] [nvarchar](max) NULL,
	[CourseUserId] [int] NOT NULL,
 CONSTRAINT [PK_dbo.CourseDatas] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[CourseUsers]    Script Date: 19/11/2013 14:59:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CourseUsers](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[Created] [datetime] NOT NULL,
	[ProductId] [int] NOT NULL,
 CONSTRAINT [PK_dbo.CourseUsers] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[LANGMasterScorms]    Script Date: 19/11/2013 14:59:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LANGMasterScorms](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [nvarchar](150) NOT NULL,
	[AttemptId] [int] NOT NULL,
	[AttemptIdStr] [nvarchar](80) NULL,
	[AttemptIdGuid] [uniqueidentifier] NULL,
	[Key1Str] [nvarchar](80) NULL,
	[Key2Str] [nvarchar](80) NULL,
	[Key1Int] [bigint] NOT NULL,
	[Key2Int] [bigint] NOT NULL,
	[Data1] [nvarchar](max) NULL,
	[Data2] [nvarchar](max) NULL,
 CONSTRAINT [PK_dbo.LANGMasterScorms] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[ModuleNews]    Script Date: 19/11/2013 14:59:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ModuleNews](
	[Id] [int] NOT NULL,
	[TestId] [int] NOT NULL,
	[TestUserId] [int] NOT NULL,
	[Data] [nvarchar](max) NOT NULL,
	[Proxy] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_dbo.ModuleNews] PRIMARY KEY CLUSTERED 
(
	[Id] ASC,
	[TestId] ASC,
	[TestUserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Modules]    Script Date: 19/11/2013 14:59:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[Modules](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ProxyData] [nvarchar](max) NULL,
	[Data] [nvarchar](max) NULL,
	[ProxyDataBin] [varbinary](max) NOT NULL,
	[DataBin] [varbinary](max) NOT NULL,
	[Level] [smallint] NOT NULL,
	[Status] [smallint] NOT NULL,
	[RepSkill] [smallint] NOT NULL,
	[RepScore] [smallint] NOT NULL,
	[RepElapsedSeconds] [smallint] NOT NULL,
	[RepAbsLevel] [smallint] NOT NULL,
	[RepAbsScore] [smallint] NOT NULL,
	[RepGlobalScore] [smallint] NOT NULL,
	[UserTestId] [int] NOT NULL,
 CONSTRAINT [PK_dbo.Modules] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[UserLicences]    Script Date: 19/11/2013 14:59:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserLicences](
	[LicenceId] [int] NOT NULL,
	[Counter] [int] NOT NULL,
	[UserId] [int] NOT NULL,
	[Started] [datetime] NOT NULL,
 CONSTRAINT [PK_dbo.UserLicences] PRIMARY KEY CLUSTERED 
(
	[LicenceId] ASC,
	[Counter] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Users]    Script Date: 19/11/2013 14:59:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[Id] [bigint] IDENTITY(1,1) NOT NULL,
	[EMail] [nvarchar](256) NULL,
	[Password] [nvarchar](32) NULL,
	[Created] [datetime] NOT NULL,
	[VerifyStatus] [smallint] NOT NULL,
	[OtherType] [smallint] NOT NULL,
	[OtherId] [nvarchar](120) NULL,
	[FirstName] [nvarchar](100) NULL,
	[LastName] [nvarchar](100) NULL,
	[Login] [nvarchar](64) NULL,
	[LoginEMail] [nvarchar](256) NULL,
	[Roles] [bigint] NOT NULL,
 CONSTRAINT [PK_dbo.Users] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[UserTestNews]    Script Date: 19/11/2013 14:59:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserTestNews](
	[Id] [int] NOT NULL,
	[UserId] [int] NOT NULL,
	[Data] [nvarchar](max) NOT NULL,
	[Proxy] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_dbo.UserTestNews] PRIMARY KEY CLUSTERED 
(
	[Id] ASC,
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[UserTests]    Script Date: 19/11/2013 14:59:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[UserTests](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[CourseUserId] [int] NOT NULL,
	[UserId] [int] NULL,
	[Level] [smallint] NOT NULL,
	[CourseId] [smallint] NOT NULL,
	[Data] [nvarchar](max) NULL,
	[DataBin] [varbinary](max) NULL,
	[Status] [smallint] NOT NULL,
	[EvaluatorLock] [nvarchar](128) NULL,
	[Invitated] [datetime] NULL,
	[ELandUserId] [int] NULL,
	[LmsOrderItemId] [int] NULL,
	[CompanyEMail] [nvarchar](max) NULL,
	[Created] [datetime] NOT NULL,
	[InvitationId] [uniqueidentifier] NULL,
	[TutorId] [int] NULL,
	[TutorAssigned] [datetime] NULL,
	[TutorEvaluated] [datetime] NULL,
	[RepStart] [datetime] NULL,
	[RepEnd] [datetime] NULL,
	[RepElapsedSeconds] [smallint] NOT NULL,
	[RepInterruptions] [smallint] NOT NULL,
	[RepScoreLevel] [smallint] NOT NULL,
	[RepScore] [smallint] NOT NULL,
	[RepAbsScore] [smallint] NOT NULL,
	[RepAbsLevel] [smallint] NOT NULL,
	[RepGlobalScore] [smallint] NOT NULL,
	[RepGlobalScores] [nvarchar](max) NULL,
	[dbTestFileName] [nvarchar](max) NULL,
	[dbTestId] [bigint] NULL,
	[Title] [nvarchar](max) NULL,
	[Descr] [nvarchar](max) NULL,
	[ImportID] [uniqueidentifier] NULL,
 CONSTRAINT [PK_dbo.UserTests] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Index [IX_CompanyId]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_CompanyId] ON [dbo].[CompanyDepartments]
(
	[CompanyId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_CompanyId]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_CompanyId] ON [dbo].[CompanyLicences]
(
	[CompanyId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_CompanyId]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_CompanyId] ON [dbo].[CompanyUsers]
(
	[CompanyId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_DepartmentId]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_DepartmentId] ON [dbo].[CompanyUsers]
(
	[DepartmentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserId]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_UserId] ON [dbo].[CompanyUsers]
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_CourseUserId]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_CourseUserId] ON [dbo].[CourseDatas]
(
	[CourseUserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [IX_key]    Script Date: 19/11/2013 14:59:26 ******/
CREATE UNIQUE NONCLUSTERED INDEX [IX_key] ON [dbo].[CourseDatas]
(
	[Key] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserId]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_UserId] ON [dbo].[CourseUsers]
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_key1int]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_key1int] ON [dbo].[LANGMasterScorms]
(
	[Key1Int] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [IX_key1str]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_key1str] ON [dbo].[LANGMasterScorms]
(
	[Key1Str] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_key2int]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_key2int] ON [dbo].[LANGMasterScorms]
(
	[Key2Int] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [IX_key2str]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_key2str] ON [dbo].[LANGMasterScorms]
(
	[Key2Str] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [IX_userid]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_userid] ON [dbo].[LANGMasterScorms]
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_TestId_TestUserId]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_TestId_TestUserId] ON [dbo].[ModuleNews]
(
	[TestId] ASC,
	[TestUserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserTestId]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_UserTestId] ON [dbo].[Modules]
(
	[UserTestId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_LicenceId]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_LicenceId] ON [dbo].[UserLicences]
(
	[LicenceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserId]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_UserId] ON [dbo].[UserLicences]
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [IX_email]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_email] ON [dbo].[Users]
(
	[EMail] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [IX_otherid]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_otherid] ON [dbo].[Users]
(
	[OtherId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserId]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_UserId] ON [dbo].[UserTestNews]
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_CourseUserId]    Script Date: 19/11/2013 14:59:26 ******/
CREATE NONCLUSTERED INDEX [IX_CourseUserId] ON [dbo].[UserTests]
(
	[CourseUserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [dbo].[CompanyDepartments]  WITH CHECK ADD  CONSTRAINT [FK_dbo.CompanyDepartments_dbo.Companies_CompanyId] FOREIGN KEY([CompanyId])
REFERENCES [dbo].[Companies] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[CompanyDepartments] CHECK CONSTRAINT [FK_dbo.CompanyDepartments_dbo.Companies_CompanyId]
GO
ALTER TABLE [dbo].[CompanyLicences]  WITH CHECK ADD  CONSTRAINT [FK_dbo.CompanyLicences_dbo.Companies_CompanyId] FOREIGN KEY([CompanyId])
REFERENCES [dbo].[Companies] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[CompanyLicences] CHECK CONSTRAINT [FK_dbo.CompanyLicences_dbo.Companies_CompanyId]
GO
ALTER TABLE [dbo].[CompanyUsers]  WITH CHECK ADD  CONSTRAINT [FK_dbo.CompanyUsers_dbo.Companies_CompanyId] FOREIGN KEY([CompanyId])
REFERENCES [dbo].[Companies] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[CompanyUsers] CHECK CONSTRAINT [FK_dbo.CompanyUsers_dbo.Companies_CompanyId]
GO
ALTER TABLE [dbo].[CompanyUsers]  WITH CHECK ADD  CONSTRAINT [FK_dbo.CompanyUsers_dbo.CompanyDepartments_DepartmentId] FOREIGN KEY([DepartmentId])
REFERENCES [dbo].[CompanyDepartments] ([Id])
GO
ALTER TABLE [dbo].[CompanyUsers] CHECK CONSTRAINT [FK_dbo.CompanyUsers_dbo.CompanyDepartments_DepartmentId]
GO
ALTER TABLE [dbo].[CompanyUsers]  WITH CHECK ADD  CONSTRAINT [FK_dbo.CompanyUsers_dbo.Users_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[CompanyUsers] CHECK CONSTRAINT [FK_dbo.CompanyUsers_dbo.Users_UserId]
GO
ALTER TABLE [dbo].[CourseDatas]  WITH CHECK ADD  CONSTRAINT [FK_dbo.CourseDatas_dbo.CourseUsers_CourseUserId] FOREIGN KEY([CourseUserId])
REFERENCES [dbo].[CourseUsers] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[CourseDatas] CHECK CONSTRAINT [FK_dbo.CourseDatas_dbo.CourseUsers_CourseUserId]
GO
ALTER TABLE [dbo].[CourseUsers]  WITH CHECK ADD  CONSTRAINT [FK_dbo.CourseUsers_dbo.CompanyUsers_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[CompanyUsers] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[CourseUsers] CHECK CONSTRAINT [FK_dbo.CourseUsers_dbo.CompanyUsers_UserId]
GO
ALTER TABLE [dbo].[ModuleNews]  WITH CHECK ADD  CONSTRAINT [FK_dbo.ModuleNews_dbo.UserTestNews_TestId_TestUserId] FOREIGN KEY([TestId], [TestUserId])
REFERENCES [dbo].[UserTestNews] ([Id], [UserId])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ModuleNews] CHECK CONSTRAINT [FK_dbo.ModuleNews_dbo.UserTestNews_TestId_TestUserId]
GO
ALTER TABLE [dbo].[Modules]  WITH CHECK ADD  CONSTRAINT [FK_dbo.Modules_dbo.UserTests_UserTestId] FOREIGN KEY([UserTestId])
REFERENCES [dbo].[UserTests] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Modules] CHECK CONSTRAINT [FK_dbo.Modules_dbo.UserTests_UserTestId]
GO
ALTER TABLE [dbo].[UserLicences]  WITH CHECK ADD  CONSTRAINT [FK_dbo.UserLicences_dbo.CompanyLicences_LicenceId] FOREIGN KEY([LicenceId])
REFERENCES [dbo].[CompanyLicences] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserLicences] CHECK CONSTRAINT [FK_dbo.UserLicences_dbo.CompanyLicences_LicenceId]
GO
ALTER TABLE [dbo].[UserLicences]  WITH CHECK ADD  CONSTRAINT [FK_dbo.UserLicences_dbo.CourseUsers_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[CourseUsers] ([Id])
GO
ALTER TABLE [dbo].[UserLicences] CHECK CONSTRAINT [FK_dbo.UserLicences_dbo.CourseUsers_UserId]
GO
ALTER TABLE [dbo].[UserTestNews]  WITH CHECK ADD  CONSTRAINT [FK_dbo.UserTestNews_dbo.CourseUsers_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[CourseUsers] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserTestNews] CHECK CONSTRAINT [FK_dbo.UserTestNews_dbo.CourseUsers_UserId]
GO
ALTER TABLE [dbo].[UserTests]  WITH CHECK ADD  CONSTRAINT [FK_dbo.UserTests_dbo.CourseUsers_CourseUserId] FOREIGN KEY([CourseUserId])
REFERENCES [dbo].[CourseUsers] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserTests] CHECK CONSTRAINT [FK_dbo.UserTests_dbo.CourseUsers_CourseUserId]
GO
