robocopy.exe d:\LMCom\rew\Web4\ \\192.168.0.14\q\rew\alpha\rew\Web4\ *.* /mir /xd d:\LMCom\rew\Web4\lm d:\LMCom\rew\Web4\grafia d:\LMCom\rew\Web4\edusoft d:\LMCom\rew\Web4\RwBooks d:\LMCom\rew\Web4\App_Data\globalLogs d:\LMCom\rew\Web4\RwCourses d:\LMCom\rew\Web4\RwDicts d:\LMCom\rew\Web4\RwEACourses d:\LMCom\rew\Web4\RwTests d:\LMCom\rew\Web4\RwTTS d:\LMCom\rew\Web4\Schools\EACourses d:\LMCom\rew\Web4\Schools\EAData d:\LMCom\rew\Web4\Schools\EAGrammar d:\LMCom\rew\Web4\Schools\EAImgMp3  d:\LMCom\rew\Web4\skrivanek d:\LMCom\rew\Web4\publ d:\LMCom\rew\Web4\renamed
robocopy.exe d:\LMCom\rew\CubesDeployment\bin\Debug\ \\192.168.0.14\q\rew\alpha\rew\CubesDeployment\bin\Debug\ *.* /mir /LEV:1
copy d:\LMCom\rew\Web4\configs\Web.Alpha.AppSetting.config \\192.168.0.14\q\rew\alpha\rew\Web4\Web.AppSetting.config /y
copy d:\LMCom\rew\Web4\configs\Web.Alpha.ConnectionStrings.config \\192.168.0.14\q\rew\alpha\rew\Web4\Web.ConnectionStrings.config /y
robocopy.exe d:\LMCom\rew\SolutionToolbar\ \\192.168.0.14\q\rew\alpha\rew\SolutionToolbar\ *.* /mir
robocopy.exe d:\LMCom\rew\OldToNewViewer\bin\Debug\ \\192.168.0.14\q\rew\alpha\rew\OldToNewViewer\bin\Debug\ *.* /mir /LEV:1 /XF d:\LMCom\rew\OldToNewViewer\bin\Debug\OldToNewViewer.exe.config d:\LMCom\rew\OldToNewViewer\bin\Debug\OldToNewViewer.vshost.exe.config
robocopy.exe d:\LMCom\rew\OldToNewViewer\bin\Debug\xslts\ \\192.168.0.14\q\rew\alpha\rew\OldToNewViewer\bin\Debug\xslts\ *.* /mir
robocopy.exe d:\LMCom\rew\OldToNewData\ \\192.168.0.14\q\rew\alpha\rew\OldToNewData\ *.* /mir
robocopy.exe d:\LMCom\rew\blended\ \\192.168.0.14\q\rew\alpha\rew\blended\ *.* /mir
copy d:\lmcom\rew\blended\app\config-fe5.js \\192.168.0.14\q\rew\alpha\rew\blended\app\config.js /y

robocopy.exe d:\LMCom\rew\EduAuthorNew\bin\ \\192.168.0.14\q\rew\alpha\rew\EduAuthorNew\bin\ *.* /mir /LEV:1

