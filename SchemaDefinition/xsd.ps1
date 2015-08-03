# cmd /c "c:\Program Files (x86)\Microsoft SDKs\Windows\v8.1A\bin\NETFX 4.5.1 Tools\xsd.exe" "d:\LMCom\rew\SchemaDefinition\bin\Debug\SchemaDefinition.dll" /o:d:\LMCom\rew\SchemaDefinition /t:CourseModel.html
add-type -path d:\LMCom\rew\ObjectModel\bin\Debug\ObjectModel.dll
[SchemaDefinition.ModifyXsd]::genSchema()
Copy-Item d:\LMCom\rew\Web4\author\CourseModelSchema.xsd \\195.250.145.28\q\rew\services\rew\web4\author\CourseModelSchema.xsd
Copy-Item d:\LMCom\rew\Web4\author\CourseModelSchema.xsd \\192.168.0.14\q\rew\alpha\rew\Web4\author\CourseModelSchema.xsd
Copy-Item d:\LMCom\rew\Web4\Author\tagsMeta.xml \\192.168.0.14\q\rew\alpha\rew\Web4\Author\tagsMeta.xml
Copy-Item d:\LMCom\rew\SchemaDefinition\SchemaDefinition.xml \\192.168.0.14\q\rew\alpha\rew\Web4\Author\SchemaDefinition.xml

Copy-Item d:\LMCom\rew\SchemaDefinition\SchemaDefinition.xml d:\LMCom\rew\Web4\Author\SchemaDefinition.xml
