rem call d:\LMCom\rew\Web4\Data\DelJS.cmd
del d:\LMCom\rew\Web4\Data\buildLogs\*.* /q

d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9LM_Data_New-lmtests
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9LM_Data_New-skrivanek
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9LM_Data_New-edusoft
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9chinhTestvn_data-globals

call d:\LMCom\ReleaseDeploy\copyFE3.cmd