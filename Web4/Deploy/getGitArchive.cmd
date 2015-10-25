cd /d d:\temp

rem do aktualniho adresare zkopiruje z remote repository branch "blended-leden"
git clone -b blended-leden --single-branch https://github.com/PavelPZ/REW --depth 1

cd /d d:\temp\rew

rem jsem v adresari s local repository: vytvori ZIP se vsemi soubory
git archive blended-leden --format=zip > d:\lmcom\rew\webcode\app_data\gitarchive.zip

cd /d d:\temp

rd d:\temp\rew\ /s /q 