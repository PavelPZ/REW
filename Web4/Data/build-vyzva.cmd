rem call d:\LMCom\rew\Web4\Data\DelJS.cmd
del d:\LMCom\rew\Web4\Data\buildLogs\*.* /q
rem ------------ FE5 a local
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -8LM_Data_Blended
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -8lm_data_blended-globals

rem ------------ ZIPs
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9LM_Data_Blended
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9lm_data_blended-globals

call d:\LMCom\ReleaseDeploy\copyFE3.cmd