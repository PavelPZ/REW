CREATE INDEX EMailIdx ON Users (EMail)
go

CREATE INDEX CreatedIdx ON Users (Created,ActivationMailSent,Roles)
go

//CREATE INDEX UsersLastRequestIdx ON Users (LastRequest)
//go

CREATE INDEX OtherIdx ON Users (OtherType,OtherId)
go

CREATE INDEX RequestsIdx ON Requests (UserId, CourseId, Site)
go

/*
CREATE INDEX TrialIdx ON LicenceUsers (UserId,Site,CourseId)
go
*/

CREATE INDEX CourseDataKeyIdx ON CourseData ([Key])
go

CREATE INDEX CourseUserCourseIdIdx ON CourseUser (CourseId)
go

/*CREATE INDEX SerieIdx ON LicenceSingle (Serie)
go*/

/*CREATE INDEX KeyIdx ON RwKey (Lang,KeyHash)
go*/

CREATE INDEX TypeIdx ON EventsLog ([Type])
go

/*
CREATE INDEX RwUserIdx ON RwUser (UserId, Site, Line)
go
*/

CREATE FULLTEXT CATALOG LMtest
 WITH ACCENT_SENSITIVITY = OFF
go

CREATE NONCLUSTERED INDEX [AnalyzeIdx1] ON [dbo].[Users] 
(
                [LASTREQUEST] DESC,
                [Male] ASC
)
INCLUDE ( [Id],
[EMail],
[OtherId]) WITH (SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF) ON [PRIMARY]
go

CREATE NONCLUSTERED INDEX [AnalyzeIdx2] ON [dbo].[CourseData] 
(
                [CourseUserId] ASC
)
INCLUDE ( [Key],
[ShortData]) WITH (SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF) ON [PRIMARY]
go

CREATE FULLTEXT INDEX ON Users
  (Fulltext)
  KEY INDEX [PK_dbo.Users]
    ON LMtest
  WITH CHANGE_TRACKING AUTO
go

/*
ALTER TABLE LicenceUsers DROP CONSTRAINT User_LicenceUser
go
ALTER TABLE LicenceUsers ADD CONSTRAINT User_LicenceUser FOREIGN KEY (UserId) REFERENCES Users (Id) ON UPDATE NO ACTION ON DELETE CASCADE
go
*/

/*ALTER TABLE CourseUser DROP CONSTRAINT User_CourseUser
go
ALTER TABLE CourseUser ADD CONSTRAINT User_CourseUser FOREIGN KEY (UserId) REFERENCES Users (Id) ON UPDATE NO ACTION ON DELETE CASCADE
go*/

ALTER TABLE CourseData DROP CONSTRAINT CourseUser_CourseData
go
ALTER TABLE CourseData ADD CONSTRAINT CourseUser_CourseData FOREIGN KEY (CourseUserId) REFERENCES CourseUser (Id) ON UPDATE NO ACTION ON DELETE CASCADE
go

/*
ALTER TABLE RwKey DROP CONSTRAINT RwFact_RwKey
go
ALTER TABLE RwKey ADD CONSTRAINT RwFact_RwKey FOREIGN KEY (FactId) REFERENCES RwFact (Id) ON UPDATE NO ACTION ON DELETE CASCADE
go

ALTER TABLE RwFact DROP CONSTRAINT RwUser_RwFact
go
ALTER TABLE RwFact ADD CONSTRAINT RwUser_RwFact FOREIGN KEY ([RwUserId]) REFERENCES RwUser (Id) ON UPDATE NO ACTION ON DELETE CASCADE
go

ALTER TABLE RwUser DROP CONSTRAINT User_RwUser
go
ALTER TABLE RwUser ADD CONSTRAINT User_RwUser FOREIGN KEY ([UserId]) REFERENCES Users (Id) ON UPDATE NO ACTION ON DELETE CASCADE
go

CREATE NONCLUSTERED INDEX RwBookLessonKeyIdx ON RwBookLessonKey 
  (BookId ASC, LessonIdx ASC)
  INCLUDE ( KeyLangHash ) WITH (SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF) ON [PRIMARY]
go
*/
