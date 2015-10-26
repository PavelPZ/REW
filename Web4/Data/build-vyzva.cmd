call d:\LMCom\rew\Web4\Data\DelJS.cmd
call d:\LMCom\rew\Web4\Data\DelMM.cmd
del d:\LMCom\rew\Web4\Data\buildLogs\*.* /q
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -8LM_Data_Blended
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -8lm_data_blended-globals
rem call d:\LMCom\ReleaseDeploy\copyFE3.cmd