
-- --------------------------------------------------
-- Entity Designer DDL Script for SQL Server 2005, 2008, and Azure
-- --------------------------------------------------
-- Date Created: 06/18/2013 17:59:04
-- Generated from EDMX file: Q:\LMCom\rew\web4\Schools\Design\Vocabularies\Fulltext.edmx
-- --------------------------------------------------

SET QUOTED_IDENTIFIER OFF;
GO
USE [fulltext];
GO
IF SCHEMA_ID(N'dbo') IS NULL EXECUTE(N'CREATE SCHEMA [dbo]');
GO

-- --------------------------------------------------
-- Dropping existing FOREIGN KEY constraints
-- --------------------------------------------------


-- --------------------------------------------------
-- Dropping existing tables
-- --------------------------------------------------

IF OBJECT_ID(N'[dbo].[Dict]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Dict];
GO

-- --------------------------------------------------
-- Creating all tables
-- --------------------------------------------------

-- Creating table 'Dict'
CREATE TABLE [dbo].[Dict] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [en_gb] nvarchar(max)  NULL,
    [de_de] nvarchar(max)  NULL,
    [fr_fr] nvarchar(max)  NULL,
    [it_it] nvarchar(max)  NULL,
    [ru_ru] nvarchar(max)  NULL,
    [sp_sp] nvarchar(max)  NULL,
    [cs_cz] nvarchar(max)  NULL,
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

-- --------------------------------------------------
-- Creating all FOREIGN KEY constraints
-- --------------------------------------------------

-- --------------------------------------------------
-- Script has ended
-- --------------------------------------------------