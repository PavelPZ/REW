SET from=%1
SET to=%2
SET isMove=%3

SET pars=/S /J 
SET defaultExs=*.cs *.xmla *.config *.csproj *.xaml

robocopy %from%CubesDeployment %to%CubesDeployment %defaultExs% %pars% %isMove%
robocopy %from%EduAuthor %to%EduAuthor %defaultExs% %pars% %isMove%
robocopy %from%LMComLib %to%LMComLib %defaultExs% %pars% %isMove%
robocopy %from%NewLMComModel %to%NewLMComModel %defaultExs% %pars% %isMove%
robocopy %from%ObjectModel %to%ObjectModel %defaultExs% %pars% %isMove%
robocopy %from%OldToNewViewer %to%OldToNewViewer %defaultExs% %pars% %isMove%
robocopy %from%SchemaDefinition %to%SchemaDefinition %defaultExs% %pars% %isMove%
robocopy %from%SLExtension %to%SLExtension %defaultExs% %pars% %isMove%
robocopy %from%SolutionToolbar %to%SolutionToolbar %defaultExs% %pars% %isMove%

robocopy %from%Web4 %to%Web4 *.cs *.ts *.html *.js *.ashx *.config *.csproj *.ascx *.master *.aspx *.resx *.less *.css %pars%  %isMove% /xd d:\LMCom\rew\Web4\_bin_deployableAssemblies\ d:\LMCom\rew\Web4\App_Data\ d:\LMCom\rew\Web4\bin\ d:\LMCom\rew\Web4\BinImport\ d:\LMCom\rew\Web4\ClientBin\ d:\LMCom\rew\Web4\Content\ d:\LMCom\rew\Web4\Data\ d:\LMCom\rew\Web4\Demos\ d:\LMCom\rew\Web4\DXTempFolder\ d:\LMCom\rew\Web4\font-awesome\ d:\LMCom\rew\Web4\grafia\ d:\LMCom\rew\Web4\Licenses\ d:\LMCom\rew\Web4\lm\ d:\LMCom\rew\Web4\media\ d:\LMCom\rew\Web4\obj\ d:\LMCom\rew\Web4\packages\ d:\LMCom\rew\Web4\Properties\ d:\LMCom\rew\Web4\publ\ d:\LMCom\rew\Web4\Rewise\ d:\LMCom\rew\Web4\RwBooks\ d:\LMCom\rew\Web4\RwDicts\ d:\LMCom\rew\Web4\RwTTS\ d:\LMCom\rew\Web4\ScormExNet35\ d:\LMCom\rew\Web4\skrivanek\ d:\LMCom\rew\Web4\Statistics\ d:\LMCom\rew\Web4\Temp\ d:\LMCom\rew\Web4\TestResults\d:\LMCom\rew\Web4\WebDeploy\ d:\LMCom\rew\Web4\renamed\ 
