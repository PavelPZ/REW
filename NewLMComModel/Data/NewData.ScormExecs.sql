USE [NewLMCom]
GO
/****** Object:  Table [dbo].[LANGMasterScorms]    Script Date: 27. 1. 2014 20:30:19 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LANGMasterScorms](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [nvarchar](150) NOT NULL,
	[AttemptId] [bigint] NOT NULL,
	[AttemptIdStr] [nvarchar](120) NULL,
	[AttemptIdGuid] [uniqueidentifier] NULL,
	[Key1Str] [nvarchar](120) NULL,
	[Key2Str] [nvarchar](120) NULL,
	[Key1Int] [bigint] NOT NULL,
	[Key2Int] [bigint] NOT NULL,
	[Data1] [nvarchar](max) NULL,
	[Data2] [nvarchar](max) NULL,
	[Date] [bigint] NOT NULL,
	[RowVersion] [timestamp] NOT NULL,
 CONSTRAINT [PK_dbo.LANGMasterScorms] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Index [IX_attemptid]    Script Date: 27. 1. 2014 20:30:19 ******/
CREATE NONCLUSTERED INDEX [IX_attemptid] ON [dbo].[LANGMasterScorms]
(
	[AttemptId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_attemptidguid]    Script Date: 27. 1. 2014 20:30:19 ******/
CREATE NONCLUSTERED INDEX [IX_attemptidguid] ON [dbo].[LANGMasterScorms]
(
	[AttemptIdGuid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [IX_attemptidstr]    Script Date: 27. 1. 2014 20:30:19 ******/
CREATE NONCLUSTERED INDEX [IX_attemptidstr] ON [dbo].[LANGMasterScorms]
(
	[AttemptIdStr] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_date]    Script Date: 27. 1. 2014 20:30:19 ******/
CREATE NONCLUSTERED INDEX [IX_date] ON [dbo].[LANGMasterScorms]
(
	[Date] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_key1int]    Script Date: 27. 1. 2014 20:30:19 ******/
CREATE NONCLUSTERED INDEX [IX_key1int] ON [dbo].[LANGMasterScorms]
(
	[Key1Int] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [IX_key1str]    Script Date: 27. 1. 2014 20:30:19 ******/
CREATE NONCLUSTERED INDEX [IX_key1str] ON [dbo].[LANGMasterScorms]
(
	[Key1Str] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
/****** Object:  Index [IX_key2int]    Script Date: 27. 1. 2014 20:30:19 ******/
CREATE NONCLUSTERED INDEX [IX_key2int] ON [dbo].[LANGMasterScorms]
(
	[Key2Int] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [IX_key2str]    Script Date: 27. 1. 2014 20:30:19 ******/
CREATE NONCLUSTERED INDEX [IX_key2str] ON [dbo].[LANGMasterScorms]
(
	[Key2Str] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [IX_userid]    Script Date: 27. 1. 2014 20:30:19 ******/
CREATE NONCLUSTERED INDEX [IX_userid] ON [dbo].[LANGMasterScorms]
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
