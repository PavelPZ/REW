USE [fulltext]

--select * from [Dict] where FREETEXT (en_gb, N'meet')
--SELECT * FROM sys.dm_fts_parser (N'FORMSOF ( FREETEXT, "берлинский")', 1049, 0, 1)
SELECT * FROM sys.dm_fts_parser (N'FORMSOF ( FREETEXT, "horses")', 2057, 0, 0)