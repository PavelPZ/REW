SELECT CourseDatas.[Id] AS [Id1], CourseDatas.[CourseUserId] AS [CourseUserId], CourseDatas.[ShortData] AS [ShortData], CourseDatas.[Key] AS [Key], CompanyUsers.[Id] AS [Id] 
FROM   CompanyUsers
	INNER JOIN CourseUsers ON CompanyUsers.Id = CourseUsers.UserId 
	INNER JOIN CourseDatas AS CourseDatas ON (CourseUsers.Id = CourseDatas.CourseUserId) AND (CourseDatas.ShortData IS NOT NULL) 
WHERE (8 = CompanyUsers.CompanyId) AND (CompanyUsers.DepartmentId IS NOT NULL)