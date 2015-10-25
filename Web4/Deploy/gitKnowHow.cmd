rem do aktualniho adresare zkopiruje z remote repository branch "blended-leden"
git clone -b blended-leden --single-branch https://github.com/PavelPZ/REW --depth 1

rem jsem v adresari s local repository: vytvori ZIP se vsemi soubory
git archive blended-leden --format=zip > d:\temp\archive.zip