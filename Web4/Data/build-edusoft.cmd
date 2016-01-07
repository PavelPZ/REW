rem call d:\LMCom\rew\Web4\Data\DelJS.cmd
del d:\LMCom\rew\Web4\Data\buildLogs\*.* /q

d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9lmtests
rem d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9skrivanek
rem d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9edusoft
d:\LMCom\rew\CubesDeployment\bin\Debug\CubesDeployment.exe -9globals-chinh

call d:\LMCom\ReleaseDeploy\copyFE3.cmd