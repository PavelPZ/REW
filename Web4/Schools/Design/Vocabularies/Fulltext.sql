--http://stackoverflow.com/questions/12759042/full-text-search-does-not-work-if-stop-word-is-included-even-though-stop-word-li
USE [master]
GO

ALTER DATABASE [fulltext]
SET SINGLE_USER 
WITH ROLLBACK IMMEDIATE;
GO
DROP DATABASE [fulltext]
GO

CREATE DATABASE [fulltext]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'fulltext', FILENAME = N'd:\disk_q\LMCom\rew\Web4\Schools\Design\Vocabularies\fulltext.mdf' , SIZE = 83968KB , MAXSIZE = UNLIMITED, FILEGROWTH = 1024KB ), 
 FILEGROUP [fulltext_cat] 
( NAME = N'[fulltext_cat', FILENAME = N'd:\disk_q\LMCom\rew\Web4\Schools\Design\Vocabularies\fulltext_cat.mdf' , SIZE = 1024KB , MAXSIZE = UNLIMITED, FILEGROWTH = 1024KB )
 LOG ON 
( NAME = N'fulltext_log', FILENAME = N'd:\disk_q\LMCom\rew\Web4\Schools\Design\Vocabularies\fulltext_log.ldf' , SIZE = 11200KB , MAXSIZE = 2048GB , FILEGROWTH = 10%)
GO

IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC fulltext.[dbo].[sp_fulltext_database] @action = 'enable'
end
GO


USE [fulltext]

CREATE TABLE [dbo].[Dict] (
    [Id] int IDENTITY(1,1) NOT NULL,
	  en_gb [nvarchar](max) COLLATE Latin1_General_CI_AS  NULL,
	  de_de [nvarchar](max) COLLATE Latin1_General_CI_AS NULL,
	  fr_fr [nvarchar](max) COLLATE French_CI_AS NULL,
	  it_it [nvarchar](max) COLLATE Latin1_General_CI_AS NULL,
	  ru_ru [nvarchar](max) COLLATE Cyrillic_General_CI_AS NULL,
	  sp_sp [nvarchar](max) COLLATE Modern_Spanish_CI_AS NULL,
	  cs_cz [nvarchar](max) COLLATE Czech_CI_AS NULL,
    [FactId] int  NOT NULL,
    [LessId] nvarchar(max)  NULL
);
GO

-- --------------------------------------------------
-- Creating all PRIMARY KEY constraints
-- --------------------------------------------------

-- Creating primary key on [Id] in table 'Dict'
ALTER TABLE [dbo].[Dict]
ADD CONSTRAINT [PK_Dict]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO


CREATE UNIQUE INDEX idIdx ON [Dict](Id);
CREATE FULLTEXT CATALOG ft AS DEFAULT;
CREATE FULLTEXT INDEX ON [Dict](cs_cz Language 1029, en_gb Language 2057, de_de Language 1031, fr_fr Language 1036, it_it Language 1040, sp_sp Language 3082, ru_ru Language 1049) KEY INDEX IdIdx 
ALTER FULLTEXT INDEX ON [Dict] SET STOPLIST = OFF --no stoplist
GO

--INSERT INTO [Dict] VALUES (1, N'kùò', null);
--INSERT INTO [Dict] VALUES (2, N'konìm', null);
--INSERT INTO [Dict] VALUES (3, N'koòmi', null);
--INSERT INTO [Dict] VALUES (4, N'koní', null);

--INSERT INTO [Dict] VALUES (5, N'vemeno', null);
--INSERT INTO [Dict] VALUES (6, N'prase', null);
--GO

--select * from [Dict] where FREETEXT (cs_cz, N'koních')

--SELECT * FROM sys.dm_fts_parser (' "O koních se mi dobøe mluví" ', 1033, 0, 0)
