rem call d:\LMCom\rew\Web4\Data\DelJS.cmd
del d:\LMCom\rew\Web4\Data\buildLogs\*.* /q
rem ------------ FE5 a local
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -8Blended
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -8globals-blended

rem ------------ ZIPs
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9Blended
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9globals-blended

call d:\LMCom\ReleaseDeploy\copyFE3.cmd