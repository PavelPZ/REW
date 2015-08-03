USE [LMComData]
GO
/****** Object:  Table [dbo].[Comm_Order]    Script Date: 11.1.2013 13:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[Comm_Order](
	[Id] [int] NOT NULL,
	[UserId] [bigint] NOT NULL,
	[Created] [datetime] NOT NULL,
	[Site] [smallint] NOT NULL,
	[SupplierId] [int] NOT NULL,
	[ShipMethod] [smallint] NOT NULL,
	[BillMethod] [smallint] NOT NULL,
	[Price] [float] NOT NULL,
	[Provision] [float] NOT NULL,
	[Status] [smallint] NOT NULL,
	[StatusDate] [datetime] NOT NULL,
	[ContentType] [smallint] NOT NULL,
	[Data] [nvarchar](max) NOT NULL,
	[PaymentDate] [datetime] NULL,
	[ProformaId] [int] NULL,
	[Proforma] [varbinary](max) NULL,
	[ProformaNew] [nvarchar](max) NULL,
	[InvoiceId] [int] NULL,
	[Invoice] [varbinary](max) NULL,
	[InvoiceNew] [nvarchar](max) NULL,
	[DueDate] [datetime] NULL,
	[AdviceId] [int] NULL,
	[Advice] [varbinary](max) NULL,
	[AdviceNew] [nvarchar](max) NULL,
	[Ico] [char](10) NULL,
	[PayPalTransaction] [char](18) NULL,
 CONSTRAINT [PK_DBO.COMM_ORDER] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[CourseData]    Script Date: 11.1.2013 13:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[CourseData](
	[Id] [bigint] IDENTITY(1,1) NOT NULL,
	[CourseUserId] [bigint] NOT NULL,
	[Key] [varchar](80) NOT NULL,
	[Data] [nvarchar](max) NOT NULL,
	[ShortData] [nvarchar](max) NULL,
 CONSTRAINT [PK_DBO.COURSEDATA] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[CourseUser]    Script Date: 11.1.2013 13:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CourseUser](
	[Id] [bigint] IDENTITY(1,1) NOT NULL,
	[UserId] [bigint] NOT NULL,
	[CourseId] [smallint] NOT NULL,
	[LastRequest] [datetime] NOT NULL,
	[SessionsNum] [int] NOT NULL,
	[SessionsNumDate] [datetime] NOT NULL,
 CONSTRAINT [PK_DBO.COURSEUSER] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Disc_Prototype]    Script Date: 11.1.2013 13:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Disc_Prototype](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Instance] [nvarchar](max) NOT NULL,
	[Created] [datetime] NOT NULL,
	[Title] [nvarchar](1024) NOT NULL,
	[SingleInstance] [bit] NOT NULL,
	[MaxCount] [int] NOT NULL,
	[Site] [smallint] NOT NULL,
	[Generator] [smallint] NOT NULL,
	[isOrderDiscount] [bit] NOT NULL,
 CONSTRAINT [PK_DBO.DISC_PROTOTYPE] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Discount]    Script Date: 11.1.2013 13:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Discount](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[PrototypeId] [int] NOT NULL,
	[Counter] [int] NOT NULL,
	[Created] [datetime] NOT NULL,
 CONSTRAINT [PK_DBO.DISCOUNT] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[EventsLog]    Script Date: 11.1.2013 13:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EventsLog](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[TaskId] [int] NULL,
	[UserId] [bigint] NULL,
	[OrderId] [int] NULL,
	[UtcTime] [datetime] NOT NULL,
	[Type] [smallint] NOT NULL,
	[Code] [int] NOT NULL,
	[DetailCode] [int] NOT NULL,
	[Message] [nvarchar](1024) NOT NULL,
	[MachineName] [nvarchar](64) NOT NULL,
	[Site] [smallint] NULL,
	[App] [smallint] NULL,
	[RequestUrl] [nvarchar](1024) NULL,
	[Details] [nvarchar](max) NULL,
 CONSTRAINT [PK_DBO.EVENTSLOG] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Feedback]    Script Date: 11.1.2013 13:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[Feedback](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Site] [smallint] NOT NULL,
	[Lang] [smallint] NOT NULL,
	[IPAddress] [nvarchar](max) NULL,
	[Msg] [nvarchar](max) NOT NULL,
	[EMail] [nvarchar](80) NULL,
	[Date] [datetime] NULL,
	[Readed] [bit] NOT NULL,
	[Url] [varchar](120) NOT NULL,
 CONSTRAINT [PK_FEEDBACK] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[LicenceOffline]    Script Date: 11.1.2013 13:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LicenceOffline](
	[Id] [bigint] IDENTITY(1,1) NOT NULL,
	[Site] [smallint] NOT NULL,
	[Serie] [int] NOT NULL,
	[CourseId] [smallint] NOT NULL,
	[Data] [nvarchar](max) NOT NULL,
	[Created] [datetime] NOT NULL,
	[UserCount] [smallint] NOT NULL,
	[MaxCount] [smallint] NULL,
	[HistoryLen] [smallint] NOT NULL,
 CONSTRAINT [PK_DBO.LICENCEOFFLINE] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Licencors]    Script Date: 11.1.2013 13:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Licencors](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[OrderId] [int] NOT NULL,
	[LicencorId] [smallint] NOT NULL,
	[Quantity] [int] NOT NULL,
	[Kc] [float] NOT NULL,
	[FeeKc] [float] NOT NULL,
	[ProductId] [int] NOT NULL,
	[Licence] [smallint] NOT NULL,
 CONSTRAINT [PK_DBO.LICENCORS] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[LicOfflineLog]    Script Date: 11.1.2013 13:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[LicOfflineLog](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[LicenceOfflineId] [bigint] NOT NULL,
	[Type] [smallint] NOT NULL,
	[Result] [smallint] NOT NULL,
	[HwKey] [varchar](9) NOT NULL,
	[Data] [nvarchar](max) NULL,
	[UtcTime] [datetime] NOT NULL,
	[MachineName] [nvarchar](64) NOT NULL,
 CONSTRAINT [PK_LICOFFLINELOG] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[MBank]    Script Date: 11.1.2013 13:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MBank](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Created] [datetime] NOT NULL,
	[Start] [datetime] NOT NULL,
	[End] [datetime] NOT NULL,
	[Raw] [nvarchar](max) NOT NULL,
	[Data] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_MBank] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[MoodleEnroll]    Script Date: 11.1.2013 13:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MoodleEnroll](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[USERID] [bigint] NOT NULL,
	[MOODLEUSERID] [bigint] NOT NULL,
	[COURSEID] [bigint] NOT NULL,
	[LANG] [smallint] NOT NULL,
	[COURSELINE] [smallint] NOT NULL,
	[CREATED] [datetime] NOT NULL,
	[ENDTRIAL] [datetime] NOT NULL
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[OrderDiscount]    Script Date: 11.1.2013 13:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OrderDiscount](
	[IdOrder] [int] NOT NULL,
	[IdDiscount] [int] NOT NULL,
 CONSTRAINT [PK_DBO.ORDERDISCOUNT] PRIMARY KEY CLUSTERED 
(
	[IdOrder] ASC,
	[IdDiscount] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[ProductInfo]    Script Date: 11.1.2013 13:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductInfo](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[OrderId] [int] NOT NULL,
	[ProductId] [int] NOT NULL,
	[Quantity] [smallint] NOT NULL,
	[Profit] [float] NOT NULL,
	[ListPrice] [float] NOT NULL,
	[Discount] [float] NOT NULL,
	[Provision] [float] NOT NULL,
	[Licence] [float] NOT NULL,
	[Cost] [float] NOT NULL,
 CONSTRAINT [PK_DBO.PRODUCTINFO] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Tasks]    Script Date: 11.1.2013 13:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tasks](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[OrderId] [int] NOT NULL,
	[Created] [datetime] NOT NULL,
	[Title] [nvarchar](256) NOT NULL,
	[Type] [smallint] NOT NULL,
	[Closed] [bit] NOT NULL,
 CONSTRAINT [PK_DBO.TASKS] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[UniqueId]    Script Date: 11.1.2013 13:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UniqueId](
	[Id] [int] NOT NULL,
	[Data] [bigint] NOT NULL,
 CONSTRAINT [PK_DBO.UNIQUEID] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Users]    Script Date: 11.1.2013 13:24:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[Users](
	[Id] [bigint] NOT NULL,
	[EMail] [varchar](256) NULL,
	[Password] [nvarchar](32) NULL,
	[Data] [nvarchar](max) NOT NULL,
	[Created] [datetime] NOT NULL,
	[ActivationMailSent] [datetime] NULL,
	[Roles] [bigint] NULL,
	[Title] [nvarchar](1024) NULL,
	[Type] [smallint] NOT NULL,
	[Fulltext] [nvarchar](max) NULL,
	[Version] [int] NOT NULL,
	[OtherType] [smallint] NULL,
	[OtherId] [varchar](120) NULL,
	[Male] [bit] NULL,
	[FirstName] [nvarchar](100) NULL,
	[LastName] [nvarchar](100) NULL,
	[Icq] [varchar](15) NULL,
	[Skype] [varchar](50) NULL,
	[LastRequest] [datetime] NOT NULL,
	[IpAddress] [bigint] NULL,
	[Site] [smallint] NOT NULL,
 CONSTRAINT [pk_dbo.Users] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
ALTER TABLE [dbo].[CourseUser] ADD  CONSTRAINT [DF_CourseUser_LastRequest]  DEFAULT ('2008-01-01 00:00:00.000') FOR [LastRequest]
GO
ALTER TABLE [dbo].[CourseUser] ADD  CONSTRAINT [DF_CourseUser_SessionNum]  DEFAULT ((0)) FOR [SessionsNum]
GO
ALTER TABLE [dbo].[CourseUser] ADD  CONSTRAINT [DF_CourseUser_SessionNumDate]  DEFAULT ('2007-01-01') FOR [SessionsNumDate]
GO
ALTER TABLE [dbo].[Users] ADD  CONSTRAINT [DF_Users_LastRequestSite]  DEFAULT ((0)) FOR [Site]
GO
ALTER TABLE [dbo].[Comm_Order]  WITH CHECK ADD  CONSTRAINT [USER_COMM_ORDER] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[Comm_Order] CHECK CONSTRAINT [USER_COMM_ORDER]
GO
ALTER TABLE [dbo].[CourseData]  WITH CHECK ADD  CONSTRAINT [COURSEUSER_COURSEDATA] FOREIGN KEY([CourseUserId])
REFERENCES [dbo].[CourseUser] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[CourseData] CHECK CONSTRAINT [COURSEUSER_COURSEDATA]
GO
ALTER TABLE [dbo].[CourseUser]  WITH NOCHECK ADD  CONSTRAINT [CourseUser_User] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[CourseUser] NOCHECK CONSTRAINT [CourseUser_User]
GO
ALTER TABLE [dbo].[Discount]  WITH CHECK ADD  CONSTRAINT [DISC_PROTOTYPE_DISCOUNT] FOREIGN KEY([PrototypeId])
REFERENCES [dbo].[Disc_Prototype] ([Id])
GO
ALTER TABLE [dbo].[Discount] CHECK CONSTRAINT [DISC_PROTOTYPE_DISCOUNT]
GO
ALTER TABLE [dbo].[EventsLog]  WITH CHECK ADD  CONSTRAINT [TASK_EVENTSLOG] FOREIGN KEY([TaskId])
REFERENCES [dbo].[Tasks] ([Id])
GO
ALTER TABLE [dbo].[EventsLog] CHECK CONSTRAINT [TASK_EVENTSLOG]
GO
ALTER TABLE [dbo].[EventsLog]  WITH CHECK ADD  CONSTRAINT [USER_EVENTSLOG] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[EventsLog] CHECK CONSTRAINT [USER_EVENTSLOG]
GO
ALTER TABLE [dbo].[Licencors]  WITH CHECK ADD  CONSTRAINT [COMM_ORDER_LICENCOR] FOREIGN KEY([OrderId])
REFERENCES [dbo].[Comm_Order] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Licencors] CHECK CONSTRAINT [COMM_ORDER_LICENCOR]
GO
ALTER TABLE [dbo].[LicOfflineLog]  WITH CHECK ADD  CONSTRAINT [LICENCEOFFLINE_LICOFFLINELOG] FOREIGN KEY([LicenceOfflineId])
REFERENCES [dbo].[LicenceOffline] ([Id])
GO
ALTER TABLE [dbo].[LicOfflineLog] CHECK CONSTRAINT [LICENCEOFFLINE_LICOFFLINELOG]
GO
ALTER TABLE [dbo].[OrderDiscount]  WITH CHECK ADD  CONSTRAINT [COMM_ORDER_ORDERDISCOUNT] FOREIGN KEY([IdOrder])
REFERENCES [dbo].[Comm_Order] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[OrderDiscount] CHECK CONSTRAINT [COMM_ORDER_ORDERDISCOUNT]
GO
ALTER TABLE [dbo].[OrderDiscount]  WITH CHECK ADD  CONSTRAINT [DISCOUNT_ORDERDISCOUNT] FOREIGN KEY([IdDiscount])
REFERENCES [dbo].[Discount] ([Id])
GO
ALTER TABLE [dbo].[OrderDiscount] CHECK CONSTRAINT [DISCOUNT_ORDERDISCOUNT]
GO
ALTER TABLE [dbo].[ProductInfo]  WITH CHECK ADD  CONSTRAINT [COMM_ORDER_PRODUCTINFO] FOREIGN KEY([OrderId])
REFERENCES [dbo].[Comm_Order] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ProductInfo] CHECK CONSTRAINT [COMM_ORDER_PRODUCTINFO]
GO
ALTER TABLE [dbo].[Tasks]  WITH CHECK ADD  CONSTRAINT [COMM_ORDER_TASK] FOREIGN KEY([OrderId])
REFERENCES [dbo].[Comm_Order] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Tasks] CHECK CONSTRAINT [COMM_ORDER_TASK]
GO
