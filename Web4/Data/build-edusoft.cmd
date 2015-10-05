robocopy.exe \\192.168.0.14\q\rew\alpha\rew\Web4\edusoft\ d:\LMCom\rew\Web4\edusoft\ *.xml *.webm *.mp4 *.wmv *.png *.jpg *.mp3 /mir 

del d:\LMCom\rew\Web4\Data\buildLogs\*.* /q
del d:\LMCom\rew\Web4\Data\productSiteMap.xml
del d:\LMCom\rew\Web4\Data\products.xml

rem d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -8LM_Data_New-lmtests
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -8LM_Data_New-skrivanek
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -8LM_Data_New-edusoft
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -8LM_Data_New-globals

rem d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9LM_Data_New-lmtests
rem d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9LM_Data_New-skrivanek
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9LM_Data_New-edusoft
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9chinhTestvn_data-globals

rem robocopy.exe d:\LMCom\rew\Web4\skrivanek\ \\192.168.0.14\q\rew\alpha\rew\Web4\skrivanek\ /s *.js 
rem robocopy.exe d:\LMCom\rew\Web4\lm\etestme\english\ \\192.168.0.14\q\rew\alpha\rew\Web4\lm\etestme\english\ /s *.js 
robocopy.exe d:\LMCom\rew\Web4\edusoft\ \\192.168.0.14\q\rew\alpha\rew\Web4\edusoft\ /s *.js 
robocopy.exe d:\LMCom\ReleaseDeploy\packs\ \\195.250.145.28\q\rew\ReleaseDeploy\ *.* /mir
