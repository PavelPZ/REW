/*
var db = Machines.getContext();
if (db.DatabaseExists()) {
  Console.WriteLine("Deleting old database...");
  db.DeleteDatabase();
}
db.CreateDatabase();*/

USE [master]
GO


ALTER DATABASE [LMComData]
SET SINGLE_USER 
WITH ROLLBACK IMMEDIATE;
GO
DROP DATABASE [LMComData];
GO


CREATE DATABASE LMComData ON PRIMARY 
  ( NAME = N'eTestMe', FILENAME = N'd:\disk_q\LMCom\Database\LMComData.mdf' , SIZE = 6000KB , MAXSIZE = UNLIMITED, FILEGROWTH = 1024KB )
/*,FILEGROUP eTestMeFS CONTAINS FILESTREAM ( NAME = eTestMeFS, FILENAME = 'd:\disk_q\lmcom\Database\eTestMeFS')*/
LOG ON ( NAME = N'eTestMe_log', FILENAME = N'd:\disk_q\LMCom\Database\LMComData_log.ldf' , SIZE = 1024KB , MAXSIZE = 2048GB , FILEGROWTH = 10%)
/*WITH FILESTREAM ( NON_TRANSACTED_ACCESS = FULL, DIRECTORY_NAME = N'eTestMeFS' )*/

GO

/*
http://msdn.microsoft.com/en-us/library/ff929144.aspx
USE LMComData;
CREATE TABLE Externals AS FileTable WITH (FileTable_Directory = 'eTestMeFS')
SELECT FileTableRootPath('Externals');
*/

ALTER DATABASE LMComData SET ANSI_NULL_DEFAULT OFF 
GO

ALTER DATABASE LMComData SET ANSI_NULLS OFF 
GO

ALTER DATABASE LMComData SET ANSI_PADDING ON 
GO

ALTER DATABASE LMComData SET ANSI_WARNINGS OFF 
GO

ALTER DATABASE LMComData SET ARITHABORT OFF 
GO

ALTER DATABASE LMComData SET AUTO_CLOSE OFF 
GO

ALTER DATABASE LMComData SET AUTO_CREATE_STATISTICS ON 
GO

ALTER DATABASE LMComData SET AUTO_SHRINK OFF 
GO

ALTER DATABASE LMComData SET AUTO_UPDATE_STATISTICS ON 
GO

ALTER DATABASE LMComData SET CURSOR_CLOSE_ON_COMMIT OFF 
GO

ALTER DATABASE LMComData SET CURSOR_DEFAULT  LOCAL 
GO

ALTER DATABASE LMComData SET CONCAT_NULL_YIELDS_NULL OFF 
GO

ALTER DATABASE LMComData SET NUMERIC_ROUNDABORT OFF 
GO

ALTER DATABASE LMComData SET QUOTED_IDENTIFIER ON 
GO

ALTER DATABASE LMComData SET RECURSIVE_TRIGGERS OFF 
GO

ALTER DATABASE LMComData SET  DISABLE_BROKER 
GO

ALTER DATABASE LMComData SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO

ALTER DATABASE LMComData SET DATE_CORRELATION_OPTIMIZATION OFF 
GO

ALTER DATABASE LMComData SET TRUSTWORTHY OFF 
GO

ALTER DATABASE LMComData SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO

ALTER DATABASE LMComData SET PARAMETERIZATION SIMPLE 
GO

ALTER DATABASE LMComData SET READ_COMMITTED_SNAPSHOT OFF 
GO

ALTER DATABASE LMComData SET HONOR_BROKER_PRIORITY OFF 
GO

ALTER DATABASE LMComData SET  READ_WRITE 
GO

ALTER DATABASE LMComData SET RECOVERY SIMPLE 
GO

ALTER DATABASE LMComData SET  MULTI_USER 
GO

ALTER DATABASE LMComData SET PAGE_VERIFY NONE  
GO

ALTER DATABASE LMComData SET DB_CHAINING OFF 
GO

EXEC sys.sp_addsrvrolemember @loginame = N'IIS APPPOOL\ASP.NET v4.0', @rolename = N'dbcreator'
GO
EXEC sys.sp_addsrvrolemember @loginame = N'IIS APPPOOL\ASP.NET v4.0', @rolename = N'sysadmin'
GO

GO
/*
USE LMComData;
GO
CREATE USER [lmcomdatatest] FOR LOGIN [lmcomdatatest] WITH DEFAULT_SCHEMA=[dbo]
GO*/