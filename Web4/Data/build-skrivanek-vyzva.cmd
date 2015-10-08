del d:\LMCom\rew\Web4\Data\buildLogs\*.* /q
rem ------------ FE5 a local
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -8LM_Data_New-skrivanek
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -8skrivanek_data-globals

d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -8LM_Data_Blended
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -8lm_data_blended-globals

rem ------------ ZIPs
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9LM_Data_New-skrivanek
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9skrivanek_data-globals

d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9LM_Data_Blended
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9lm_data_blended-globals

call d:\LMCom\ReleaseDeploy\copyFE3.cmd