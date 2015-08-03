<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.1" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:msxsl="urn:schemas-microsoft-com:xslt" xmlns="htmlPassivePage" xmlns:lm="lm"
  xmlns:ms="urn:schemas-microsoft-com:xslt">

  <xsl:output method="xml" indent="yes"/>
  <xsl:variable name="smallcase" select="'abcdefghijklmnopqrstuvwxyz'"/>
  <xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"/>

  <xsl:template match="*[local-name() = 'html']">
    <html xmlns="htmlPassivePage" xmlns:lm="lm" xmlns:ms="urn:schemas-microsoft-com:xslt"
      xmlns:epa="www.epaonline.com/epaclasses">
      <xsl:apply-templates select="*|@*"/>
    </html>
  </xsl:template>

  <xsl:template match="*[local-name() = 'body']">
    <body xmlns:lm="lm" xmlns:ms="urn:schemas-microsoft-com:xslt">
      <xsl:apply-templates select="*|@*"/>
    </body>
  </xsl:template>

  <xsl:template match="*[local-name() = 'head']">
    <xsl:copy-of select="."/>
  </xsl:template>

  <xsl:template match="*[local-name() = 'cross_word']">
    <table>
      <xsl:variable name="ident2" select="translate(normalize-space(./text()), ' ','')"/>
      <xsl:variable name="item" select="msxsl:node-set($mw_items)/*[local-name() = 'item'][@ident=$ident2][1]"/>
      <!--<xsl:variable name="item" select="$mw_items/*[local-name() = 'item'][@ident=$ident2][1]"/>-->
      <xsl:apply-templates select="@id"/>
      <xsl:apply-templates select="$item" mode="cw"/>
    </table>
  </xsl:template>

  <xsl:template match="*[local-name() = 'make_word']">
    <table>
      <xsl:variable name="ident2" select="translate(normalize-space(./text()), ' ','')"/>
      <!--<xsl:variable name="item"
        select="$mw_items/*[local-name() = 'item'][contains(@ident,$ident2)][1]"/>-->
      <xsl:variable name="item" select="msxsl:node-set($mw_items)/*[local-name() = 'item'][contains(@ident,$ident2)][1]"/>-->
      <xsl:apply-templates select="@id"/>
      <xsl:apply-templates select="$item" mode="mw"/>
    </table>
  </xsl:template>

  <xsl:template
    match="*[local-name() = 'sound'][@layout='dictionary'][@ignore_sound='wma'][count(./*[local-name() = 'sound_sentences'][@layout='vocabulary'])>0]">
    <xsl:variable name="file" select="./@file"/>
    <table class="table table-striped">
      <xsl:apply-templates select="msxsl:node-set($rdict)/*[local-name() = 'lmap'][contains(@ident,$file)]"/>
    </table>
  </xsl:template>

  <xsl:template match="*[local-name() = 'lmap']">
    <xsl:for-each select="./*[local-name() = 'item']">
      <tr>
        <td>
          <xsl:value-of select="position()"/>.
        </td>
        <td>
          <xsl:value-of select="@src"/>
        </td>
        <td>
          <xsl:text>{{trans</xsl:text>
          <xsl:value-of select="generate-id()"/>
          <xsl:text>|</xsl:text>
          <xsl:value-of select="@trans_en"/>
          <xsl:text>}}</xsl:text>
        </td>
      </tr>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="*[local-name() = 'line']" mode="mw">
    <tr>
      <xsl:apply-templates select="*" mode="mw"/>
    </tr>
  </xsl:template>

  <xsl:template match="*[local-name() = 'line']" mode="cw">
    <tr>
      <xsl:apply-templates select="*" mode="cw"/>
    </tr>
  </xsl:template>

  <xsl:template match="*[local-name() = 'td']" mode="cw">
    <td>
      <xsl:choose>
        <xsl:when test="./@header">
          <button type="button" class="btn btn-primary" disabled="disabled">
            <xsl:copy-of select="./text()"/>
          </button>
        </xsl:when>
        <xsl:when test="./@hint">
          <xsl:attribute name="style">background-color: red</xsl:attribute>
          <gap-fill width="14">
            <xsl:attribute name="correct-value">
              <xsl:value-of select="./text()"/>
            </xsl:attribute>
            <xsl:attribute name="hint">
              <xsl:value-of select="./text()"/>
            </xsl:attribute>
          </gap-fill>
        </xsl:when>
        <xsl:when test="./text()='-'">
          <xsl:text>$nbsp;</xsl:text>
        </xsl:when>
        <xsl:otherwise>
          <gap-fill width="10">
            <xsl:attribute name="correct-value">
              <xsl:value-of select="./text()"/>
            </xsl:attribute>
          </gap-fill>
        </xsl:otherwise>
      </xsl:choose>
    </td>
  </xsl:template>

  <xsl:template match="*[local-name() = 'td']" mode="mw">
    <td>
      <xsl:choose>
        <xsl:when test="./@header">
          <button type="button" class="btn btn-primary" disabled="disabled">
            <xsl:copy-of select="./text()"/>
          </button>
        </xsl:when>
        <xsl:when test="./@hint">
          <button type="button" class="btn btn-success" disabled="disabled">
            <xsl:copy-of select="./text()"/>
          </button>
        </xsl:when>
        <xsl:when test="./@answer">
          <word-selection>
            <xsl:attribute name="words">
              #<xsl:value-of select="./text()"/>
            </xsl:attribute>
          </word-selection>
        </xsl:when>
        <xsl:otherwise>
          <word-selection>
            <xsl:attribute name="words">
              <xsl:value-of select="./text()"/>
            </xsl:attribute>
          </word-selection>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*" mode="mw"/>
    </td>
  </xsl:template>

  <xsl:template match="@* | node() | *">
    <xsl:copy>
      <xsl:apply-templates select="@* | node() | *"/>
    </xsl:copy>
  </xsl:template>

  <xsl:variable name="rdict">
    <lmap ident="~/Russian1/Lesson1/ChapterA/lekce01_1_cz.xml">
      <item trans="aha!" src="а!" trans_en="I see!"/>
      <item trans="vy, Vy" src="вы" trans_en="you (plural or formal singular)"/>
      <item trans="děláte" src="(вы) дéлаете" trans_en="you do, you are doing"/>
      <item trans="myslíte si" src="(вы) дýмаете" trans_en="you think"/>
      <item trans="myslím si" src="(я) дýмаю" trans_en="I think"/>
      <item trans="o" src="о (+ Lok.)" trans_en="about"/>
      <item trans="o čem" src="о чём" trans_en="about what"/>
      <item trans="rozumím" src="понимáю" trans_en="I understand"/>
      <item trans="Ahoj!" src="Привéт!" trans_en="Hi!"/>
      <item trans="co, že" src="что" trans_en="what; that"/>
      <item trans="já" src="я" trans_en="I"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson1/ChapterB/lekce01_2_cz.xml">
      <item trans="a, ale" src="а" trans_en="and; but"/>
      <item trans="mluvíme"
            src="(мы) говори́м"
            trans_en="we speak, we are speaking"/>
      <item trans="mluví"
            src="(он, онá) говори́т"
            trans_en="(he/she) speaks, (he/she) is speaking"/>
      <item trans="mluvím" src="(я) говорю́" trans_en="I speak, I am speaking"/>
      <item trans="pán" src="господи́н (г-н)" trans_en="Mr."/>
      <item trans="paní" src="госпожá (г-жа)" trans_en="Mrs."/>
      <item trans="i, a" src="и" trans_en="and"/>
      <item trans="mě" src="меня́" trans_en="me (*acc.*)"/>
      <item trans="my" src="мы" trans_en="we"/>
      <item trans="ne (slovesný zápor)"
            src="не"
            trans_en="not (negative with a verb)"/>
      <item trans="Němec" src="нéмец" trans_en="German (person)"/>
      <item trans="ne" src="нет" trans_en="no"/>
      <item trans="on" src="он" trans_en="he"/>
      <item trans="ona" src="онá" trans_en="she"/>
      <item trans="německy" src="по-немéцки" trans_en="German"/>
      <item trans="rusky" src="по-рýсски" trans_en="Russian"/>
      <item trans="Ruska" src="рýсская" trans_en="Russian (woman)"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson1/ChapterC/lekce01_3_cz.xml">
      <item trans="v" src="в" trans_en="in, at"/>
      <item trans="Super!" src="Здóрово!" trans_en="Excellent!"/>
      <item trans="vědět, znát"
            src="знать (знáю, знáешь, знáют)"
            trans_en="to know"/>
      <item trans="hrát, hrát si"
            src="игрáть (игрáю, игрáешь, игрáют)"
            trans_en="play"/>
      <item trans="na" src="на" trans_en="at, on"/>
      <item trans="velmi" src="óчень" trans_en="very"/>
      <item trans="cožpak, ale…?" src="рáзве...?" trans_en="really ... ?"/>
      <item trans="nudně" src="скýчно" trans_en="boringly"/>
      <item trans="ty" src="ты" trans_en="you(*singular, informal*)"/>
      <item trans="to (je)" src="э́то" trans_en="that (is)"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson1/ChapterC/lekce01_4_cz.xml">
      <item trans="kde?" src="где?" trans_en="where? (*dat.*)"/>
      <item trans="doma" src="дóма" trans_en="at home"/>
      <item trans="nebo" src="или" trans_en="or"/>
      <item trans="například" src="напримéр" trans_en="for example"/>
      <item trans="poslouchat"
            src="слýшать (слýшаю, слýшаешь, слýшают)"
            trans_en="listen"/>
      <item trans="tak" src="так" trans_en="so, thus"/>
      <item trans="tam" src="там" trans_en="there"/>
      <item trans="také" src="тóже" trans_en="too"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson2/ChapterA/lekce02_1_cz.xml">
      <item trans="boršč" src="борщ" trans_en="borscht"/>
      <item trans="vás, Vás"
            src="вас"
            trans_en="you (4th case plural and formal singular)"/>
      <item trans="hle" src="вот" trans_en="look!"/>
      <item trans="jmenuji se" src="меня́ зовýт" trans_en="my name is"/>
      <item trans="ano" src="да" trans_en="yes"/>
      <item trans="jak?" src="как?" trans_en="how?"/>
      <item trans="kdo?" src="кто?" trans_en="who?"/>
      <item trans="vysvětlení" src="объяснéние" trans_en="explanation"/>
      <item trans="první seznámení"
            src="пéрвое знакóмство"
            trans_en="meeting for the 1st time"/>
      <item trans="o, na" src="по (+ dat.)" trans_en="about, on"/>
      <item trans="polévka" src="суп" trans_en="soup"/>
      <item trans="tebe" src="тебя́" trans_en="you (singular informal)"/>
      <item trans="příjmení" src="фами́лия" trans_en="surname"/>
      <item trans="šči, kapustová polévka"
            src="щи"
            trans_en="shchi, cabbage soup"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson2/ChapterA/lekce02_2_cz.xml">
      <item trans="dobrý den"
            src="здрáвствуйте"
            trans_en="Good morning, Good afternoon!"/>
      <item trans="ještě" src="ещё" trans_en="still"/>
      <item trans="ale" src="но" trans_en="but"/>
      <item trans="nová" src="нóвая (f.)" trans_en="new"/>
      <item trans="oh!" src="ой!" trans_en="oh!"/>
      <item trans="odpovídat"
            src="отвечáть (отвечáю, отвечáешь, отвечáют)"
            trans_en="to answer"/>
      <item trans="děkuji" src="спаси́бо" trans_en="thank you"/>
      <item trans="spolužačka" src="сокýрсница" trans_en="classmate (female)"/>
      <item trans="ptát se"
            src="спрáшивать (спрáшиваю, спрáшиваешь, спрáшивают)"
            trans_en="to ask"/>
      <item trans="dobře" src="хорошó" trans_en="well/correctly"/>
      <item trans="tato" src="э́та (f.)" trans_en="this"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson2/ChapterB/lekce02_3_cz.xml">
      <item trans="vaše" src="вáша" trans_en="your"/>
      <item trans="noviny" src="газéта" trans_en="newspaper"/>
      <item trans="žít, bydlet"
            src="жить (живý, живёшь, живýт)"
            trans_en="live"/>
      <item trans="jaká?" src="какáя? (f.)" trans_en="what?, which?"/>
      <item trans="moje" src="моя́" trans_en="my"/>
      <item trans="nás" src="нас" trans_en="us (*acc.*)"/>
      <item trans="oni, ony" src="они́" trans_en="they"/>
      <item trans="přítelkyně"
            src="подрýга"
            trans_en="female friend, girlfriend"/>
      <item trans="dnes" src="сегóдня" trans_en="today"/>
      <item trans="sestra" src="сестрá" trans_en="Sister"/>
      <item trans="dívat se"
            src="смотрéть (смотрю́, смóтришь, смóтрят)"
            trans_en="look at"/>
      <item trans="SRN, Spolková republika Německo"
            src="ФРГ, Федерати́вная Респýблика Гермáния"
            trans_en="Federal Republic of Germany"/>
      <item trans="číst" src="читáть (читáю, читáешь, читáют)" trans_en="read"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson2/ChapterC/lekce02_4_cz.xml">
      <item trans="vidět" src="ви́деть (ви́жу, ви́дишь, ви́дят)" trans_en="see"/>
      <item trans="všichni" src="все" trans_en="everyone"/>
      <item trans="hotel" src="гости́ница" trans_en="hotel"/>
      <item trans="jet" src="éхать (éду, éдешь, éдут)" trans_en="drive"/>
      <item trans="MK, Moskevský komsomolec"
            src="МК, Москóвский Комсомóлец"
            trans_en="MK, Moskovskij Komsomolets (daily newspaper)"/>
      <item trans="konečně" src="наконéц" trans_en="finally"/>
      <item trans="Pravda (komunistický deník)"
            src="Прáвда"
            trans_en="Pravda (communist daily)"/>
      <item trans="Rusko" src="Росси́я" trans_en="Russia"/>
      <item trans="s" src="c (+ instr.)" trans_en="with"/>
      <item trans="ulice" src="ýлица" trans_en="street"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson3/ChapterA/lekce03_1_cz.xml">
      <item trans="večer" src="вéчером" trans_en="evening"/>
      <item trans="ve dne"
            src="днём"
            trans_en="in the day time, during the day"/>
      <item trans="snídat"
            src="зáвтракать (зáвтракаю, зáвтракаешь, зáвтракают)"
            trans_en="have breakfast"/>
      <item trans="jít"
            src="идти́ (идý, идёшь, идýт)"
            trans_en="to go (*walk*)"/>
      <item trans="pít" src="пить (пью, пьёшь, пьют)" trans_en="drink"/>
      <item trans="prohlédnout si"
            src="посмотрéть (посмотрю́, посмóтришь, посмóтрят)"
            trans_en="to look at, to inspect"/>
      <item trans="poté" src="потóм" trans_en="after"/>
      <item trans="ráno" src="ýтром" trans_en="morning"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson3/ChapterA/lekce03_2_cz.xml">
      <item trans="pojďte ... (něco udělat)"
            src="давáйте ..."
            trans_en="let us… (do something)"/>
      <item trans="podívejme se ..."
            src="давáйте посмóтрим ..."
            trans_en="let us look…"/>
      <item trans="peníze" src="дéньги (pl.)" trans_en="money"/>
      <item trans="kdy?" src="когдá?" trans_en="when?"/>
      <item trans="je možné" src="мóжно" trans_en="it is possible"/>
      <item trans="karta, pohlednice" src="кáрточка" trans_en="postcard"/>
      <item trans="červený (-á, -é)" src="крáсный (-ая, -ое)" trans_en="red"/>
      <item trans="kreditní" src="креди́тный (-ая, -ое)" trans_en="credit"/>
      <item trans="výměna" src="обмéн" trans_en="exchange"/>
      <item trans="vyměňovat"
            src="обменя́ть (обменя́ю, обменя́ешь, обменя́ют)"
            trans_en="to exchange"/>
      <item trans="vysvětlovat"
            src="объясня́ть (объясня́ю, объясня́ешь, объясня́ют)"
            trans_en="explain"/>
      <item trans="náměstí" src="плóщадь (f.)" trans_en="square"/>
      <item trans="přijímat"
            src="принимáть (принимáю, принимáешь, принимáют)"
            trans_en="accept"/>
      <item trans="nejprve" src="сначáла" trans_en="first"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson3/ChapterB/lekce03_3_cz.xml">
      <item trans="nashledanou" src="до свидáния" trans_en="good-bye"/>
      <item trans="promiň" src="извини́" trans_en="sorry"/>
      <item trans="k" src="к (+ dat.)" trans_en="to"/>
      <item trans="okamžik" src="(однý) минýточку" trans_en="moment"/>
      <item trans="prosím" src="пожáлуйста" trans_en="please"/>
      <item trans="pozvat"
            src="пригласи́ть (приглашý, пригласи́шь, приглася́т)"
            trans_en="invite"/>
      <item trans="s radostí" src="с удовóльствием" trans_en="with pleasure"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson3/ChapterB/lekce03_4_cz.xml">
      <item trans="dcera" src="дочь (f.)" trans_en="Daughter"/>
      <item trans="babička" src="бáбушка" trans_en="grandmother"/>
      <item trans="manželka" src="женá" trans_en="Wife"/>
      <item trans="žena" src="жéнщина" trans_en="a woman"/>
      <item trans="chlapec" src="мáльчик" trans_en="boy"/>
      <item trans="můj" src="мой" trans_en="my"/>
      <item trans="manžel" src="муж" trans_en="Husband"/>
      <item trans="muž" src="мужчи́на" trans_en="a man"/>
      <item trans="rodina" src="семья́" trans_en="a family"/>
      <item trans="syn" src="сын" trans_en="Son"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson3/ChapterB/lekce03_5_cz.xml">
      <item trans="velice děkuji"
            src="большóе спаси́бо"
            trans_en="thank you very much"/>
      <item trans="procházet se"
            src="гуля́ть (гуля́ю, гуля́ешь, гуля́ют)"
            trans_en="walk"/>
      <item trans="do, k" src="до (+ gen.)" trans_en="to, towards"/>
      <item trans="domů" src="домóй" trans_en="home"/>
      <item trans="zítra" src="зáвтра" trans_en="tomorrow"/>
      <item trans="promiňte" src="извини́те" trans_en="excuse me"/>
      <item trans="kam?" src="кудá?" trans_en="where? (*acc.*)"/>
      <item trans="Moskvané" src="мoсквичи́ (pl.)" trans_en="Muscovites"/>
      <item trans="odkud?" src="откýда?" trans_en="from where?"/>
      <item trans="(velice) mě těší"
            src="(óчень) прия́тно"
            trans_en="pleased to meet you"/>
      <item trans="(ještě) jednou" src="(ещё) раз" trans_en="(once) more"/>
      <item trans="vedle" src="ря́дом" trans_en="beside/next to/alongside"/>
      <item trans="kolik?" src="скóлько?" trans_en="how much?/how many?"/>
      <item trans="V kolik?" src="Во скóлько?" trans_en="At what time?"/>
      <item trans="stát"
            src="cтоя́ть (стою́, стои́шь, cтоя́т)"
            trans_en="stand"/>
      <item trans="poté" src="тогдá" trans_en="after"/>
      <item trans="Udaľcovi (příjmení)"
            src="Удальцóвы (pl.)"
            trans_en="the Udalc's (family name)"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson3/ChapterC/lekce03_6_cz.xml">
      <item trans="koupelna" src="вáнная" trans_en="bathroom"/>
      <item trans="šunka" src="ветчинá" trans_en="ham"/>
      <item trans="víno" src="винó" trans_en="wine"/>
      <item trans="voda" src="вoдá" trans_en="water"/>
      <item trans="hotový, připravený" src="готóв" trans_en="ready, prepared"/>
      <item trans="dům" src="дом" trans_en="house; building"/>
      <item trans="za, o" src="за (+ akuz.)" trans_en="for, about"/>
      <item trans="kaviár" src="икрá" trans_en="caviar"/>
      <item trans="byt" src="кварти́ра" trans_en="flat, apartment"/>
      <item trans="salám" src="колбасá" trans_en="salami"/>
      <item trans="pokoj" src="кóмната" trans_en="room"/>
      <item trans="kuchyň" src="кýхня" trans_en="kitchen"/>
      <item trans="malý (-á, -é)" src="мáленький (-ая, -ое)" trans_en="small"/>
      <item trans="pokračování příště"
            src="продолжéние слéдует"
            trans_en="continued next time"/>
      <item trans="ryba" src="ры́ба" trans_en="fish"/>
      <item trans="sedmý (-á, -é)" src="седьмóй (-áя, -óе)" trans_en="seventh"/>
      <item trans="šťáva" src="сок" trans_en="juice, sauce"/>
      <item trans="stůl" src="стол" trans_en="table"/>
      <item trans="takový (-á, -é)" src="такóй (-áя, -óе)" trans_en="such"/>
      <item trans="jen" src="тóлько" trans_en="only"/>
      <item trans="už" src="yжé" trans_en="already"/>
      <item trans="večeře" src="ýжин" trans_en="dinner"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson4/ChapterA/lekce04_1_cz.xml">
      <item trans="velký (-á, -é)"
            src="большóй (-áя, -óе)"
            trans_en="big, large"/>
      <item trans="nahlas" src="вслух" trans_en="aloud"/>
      <item trans="hosté" src="гóсти (pl.)" trans_en="guests"/>
      <item trans="na návštěvě" src="в гoстя́х (pl.)" trans_en="on a visit"/>
      <item trans="dívka" src="дéвочка" trans_en="girl"/>
      <item trans="skutečně" src="действи́тельно" trans_en="really, actually"/>
      <item trans="dětský pokoj" src="дéтская" trans_en="children's room"/>
      <item trans="dvoupokojový (-á, -é)"
            src="двухкóмнатный (-ая, -ое)"
            trans_en="one-bedroom"/>
      <item trans="jiný (-á, -é)"
            src="другóй (-áя, -óе)"
            trans_en="another, different"/>
      <item trans="je, jsou" src="есть" trans_en="is, are"/>
      <item trans="bohužel"
            src="к сожалéнию"
            trans_en="unfortunately, regrettably"/>
      <item trans="moskevský (-á, -é)"
            src="москóвский (-ая, -ое)"
            trans_en="Moscow (adjective)"/>
      <item trans="náš, naše, naše" src="наш, нáша, нáше" trans_en="our(s)"/>
      <item trans="nepohodlně, nevhodně"
            src="неудóбно"
            trans_en="uncomfortably, unsuitably"/>
      <item trans="ukazovat"
            src="покáзывать (покáзываю, покáзываешь, покáзывают)"
            trans_en="to show"/>
      <item trans="spát" src="спать (сплю, спишь, спят)" trans_en="sleep"/>
      <item trans="u" src="у (+ gеn.)" trans_en="by, at"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson4/ChapterA/lekce04_2_cz.xml">
      <item trans="sklenice (mn.č.)" src="бокáлы (pl.)" trans_en="glasses"/>
      <item trans="lahev" src="бyты́лка" trans_en="bottle"/>
      <item trans="váš, vaše, vaše" src="ваш, вáша, вáше" trans_en="your(s)"/>
      <item trans="chutný (-á, -é)" src="вкýсный (-ая, -ое)" trans_en="tasty"/>
      <item trans="jestli" src="éсли" trans_en="whether"/>
      <item trans="jíst"
            src="есть (ем, ешь, ест, еди́м, еди́те, едя́т)"
            trans_en="eat"/>
      <item trans="avšak, přece" src="же" trans_en="but, although"/>
      <item trans="zdraví" src="здорóвье" trans_en="health"/>
      <item trans="ovšem" src="конéчно" trans_en="certainly"/>
      <item trans="lépe" src="лýчше" trans_en="better"/>
      <item trans="nalévat"
            src="наливáть (наливáю, наливáешь, наливáют)"
            trans_en="pour"/>
      <item trans="nevysoký (-á, -é)"
            src="невысóкий (-ая, -ое)"
            trans_en="not tall"/>
      <item trans="nízký (-a, -e)"
            src="ни́зкий (-ая, -ое)"
            trans_en="short, low"/>
      <item trans="otevřít"
            src="откры́ть (открóю, открóешь, открóют)"
            trans_en="open"/>
      <item trans="dárek" src="подáрок" trans_en="gift"/>
      <item trans="zvedat"
            src="поднимáть (поднимáю, поднимáешь, поднимáют)"
            trans_en="to lift"/>
      <item trans="polštář" src="подýшка" trans_en="pillow, cushion"/>
      <item trans="pozvání" src="приглашéние" trans_en="invitation"/>
      <item trans="sedět"
            src="сидéть (сижý, сиди́шь, сидя́т)"
            trans_en="to sit"/>
      <item trans="ihned" src="срáзу" trans_en="immediately"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson4/ChapterB/lekce04_3_cz.xml">
      <item trans="brát" src="брать (берý, берёшь, берýт)" trans_en="to take"/>
      <item trans="vemte si" src="бери́те" trans_en="také"/>
      <item trans="vše" src="всё" trans_en="everything"/>
      <item trans="noviny (mn. č.)" src="газéты (pl.)" trans_en="newspaper"/>
      <item trans="moci" src="мочь (могý, мóжешь, мóгут)" trans_en="can"/>
      <item trans="to není pravda" src="непрáвда" trans_en="that is not true"/>
      <item trans="nic" src="ничегó" trans_en="nothing"/>
      <item trans="psát" src="писáть (пишý, пи́шешь, пи́шут)" trans_en="write"/>
      <item trans="vyzkoušejte" src="попрóбуйте" trans_en="try"/>
      <item trans="sami" src="сáми (pl.)" trans_en="yourself"/>
      <item trans="podívejte se" src="смотри́те" trans_en="look"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson4/ChapterB/lekce04_4_cz.xml">
      <item trans="chudě" src="бéдно" trans_en="poorly"/>
      <item trans="bliny (mn.č.), pohankové placky"
            src="блины́ (pl.)"
            trans_en="blini (plural), buckwheat pancakes"/>
      <item trans="více (ne)" src="бóльше (не)" trans_en="(no) more"/>
      <item trans="zavařenina" src="варéнье" trans_en="preserve"/>
      <item trans="hrneček" src="горшóчек" trans_en="mug"/>
      <item trans="Vítejte!" src="Дoбрó пожáловать!" trans_en="Welcome!"/>
      <item trans="trouba" src="духóвка" trans_en="oven"/>
      <item trans="předkrm" src="закýска" trans_en="appetiser"/>
      <item trans="zmrzlina" src="морóженое" trans_en="ice cream"/>
      <item trans="maso" src="мя́со" trans_en="meat"/>
      <item trans="masový (-á, -é)"
            src="мяснóй (-áя, -óе)"
            trans_en="meat (adjective)"/>
      <item trans="nést" src="нести́ (несý, несёшь, несýт)" trans_en="to carry"/>
      <item trans="Dobrou chuť!"
            src="Прия́тного аппети́та!"
            trans_en="Enjoy your meal!"/>
      <item trans="ruský (-á, -é)"
            src="рýсский (-ая, -ое)"
            trans_en="Russian (adjective)"/>
      <item trans="Rusové" src="рýсские (pl.)" trans_en="Russians"/>
      <item trans="kalíšek" src="рю́мка" trans_en="cup"/>
      <item trans="(kysaná) smetana" src="сметáна" trans_en="(sour) cream"/>
      <item trans="znovu" src="снóва" trans_en="again"/>
      <item trans="sýr" src="сыр" trans_en="cheese"/>
      <item trans="čaj" src="чай" trans_en="tea"/>
      <item trans="zázrak" src="чýдо" trans_en="miracle"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson4/ChapterC/lekce04_5_cz.xml">
      <item trans="bratr" src="брат" trans_en="Brother"/>
      <item trans="vypít"
            src="вы́пить (вы́пью, вы́пьешь, вы́пьют)"
            trans_en="drink"/>
      <item trans="děti" src="дéти (pl.)" trans_en="children"/>
      <item trans="jednopokojový (-á, -é)"
            src="однокóмнатный (-ая, -ое)"
            trans_en="one-room flat"/>
      <item trans="špatně" src="плóхо" trans_en="poorly"/>
      <item trans="mluvit"
            src="разговáривать (разговáриваю, разговáриваешь, разговáривают)"
            trans_en="speak"/>
      <item trans="příjemně" src="ую́тно" trans_en="pleasantly"/>
      <item trans="čtyřpokojový (-á, -é)"
            src="четырёхкóмнатный (-ая, -ое)"
            trans_en="three-bedroom"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson5/ChapterA/lekce05_1_cz.xml">
      <item trans="vystupovat"
            src="выходи́ть (выхожý, выхóдишь, выхóдят)"
            trans_en="get off"/>
      <item trans="dále" src="дáльше" trans_en="further"/>
      <item trans="hlasatel" src="ди́ктор" trans_en="announcer"/>
      <item trans="oznámení" src="объявлéние" trans_en="announcement"/>
      <item trans="opakovat"
            src="повторя́ть (повторя́ю, повторя́ешь, повторя́ют)"
            trans_en="repeat"/>
      <item trans="vlak" src="пóезд" trans_en="train"/>
      <item trans="poslouchejte" src="слýшайте" trans_en="listen"/>
      <item trans="spací"
            src="спáльный (-ая, -ое)"
            trans_en="sleeping (adjective)"/>
      <item trans="stanice" src="стáнция" trans_en="station"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson5/ChapterA/lekce05_2_cz.xml">
      <item trans="lístek, jízdenka" src="билéт" trans_en="ticket"/>
      <item trans="nádraží" src="вокзáл" trans_en="railway station"/>
      <item trans="místo" src="мéсто" trans_en="place/location"/>
      <item trans="čekat" src="ждать (жду, ждёшь, ждут)" trans_en="to wait"/>
      <item trans="oblečení" src="одéжда" trans_en="clothing"/>
      <item trans="odjezd" src="отправлéние" trans_en="departure"/>
      <item trans="prověřovat"
            src="проверя́ть (проверя́ю, проверя́ешь, проверя́ют)"
            trans_en="check"/>
      <item trans="jízdní řád" src="расписáние" trans_en="schedule"/>
      <item trans="rychlý (-á, -é)" src="скóрый (-ая, -ое)" trans_en="fast"/>
      <item trans="kufr" src="чемодáн" trans_en="suitcase"/>
      <item trans="balit"
            src="упакóвывать (упакóвываю, упакóвываешь, упакóвывают)"
            trans_en="to pack"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson5/ChapterA/lekce05_3_cz.xml">
      <item trans="Dáte si?" src="бýдете?" trans_en="Will you have?"/>
      <item trans="večer" src="вéчер" trans_en="evening"/>
      <item trans="vchod" src="вход" trans_en="entrance"/>
      <item trans="dobrý (-á, -é)" src="дóбрый (-ая, -ое)" trans_en="good"/>
      <item trans="dlouho" src="дóлго" trans_en="for a long time"/>
      <item trans="cizinci" src="инострáнцы (pl.)" trans_en="foreigners"/>
      <item trans="jaký (-á, -é)"
            src="какóй (-áя, -óе)"
            trans_en="what kind, which"/>
      <item trans="rozdělený na kupé"
            src="купéйный (-ая, -ое)"
            trans_en="divided into compartments"/>
      <item trans="otevírat"
            src="открывáть (открывáю, открывáешь, открывáют)"
            trans_en="open"/>
      <item trans="zpívat" src="петь (пою́, поёшь, пою́т)" trans_en="sing"/>
      <item trans="postavit"
            src="постáвить (постáвлю, постáвишь, постáвят)"
            trans_en="put"/>
      <item trans="pověsit"
            src="повéсить (повéшу, повéсишь, повéсят)"
            trans_en="to hang"/>
      <item trans="přinést"
            src="приноси́ть (приношý, принóсишь, принóсят)"
            trans_en="bring"/>
      <item trans="průvodčí (žena)"
            src="проводни́ца"
            trans_en="train conductor (female)"/>
      <item trans="cesta" src="путь (m.)" trans_en="a road"/>
      <item trans="spolužák" src="сокýрсник" trans_en="classmate"/>
      <item trans="brzy" src="скóро" trans_en="soon"/>
      <item trans="sklenice" src="стакáн" trans_en="glass"/>
      <item trans="str., strana" src="стр., страни́ца" trans_en="p., page"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson5/ChapterB/lekce05_4_cz.xml">
      <item trans="bez" src="без (+ gen.)" trans_en="without"/>
      <item trans="vysoký (-á, -é)" src="высóкий (-ая, -ое)" trans_en="tall"/>
      <item trans="vyšší" src="вы́сший (-ая, -ее)" trans_en="taller, higher"/>
      <item trans="výplata" src="зарплáта" trans_en="pay, pay cheque"/>
      <item trans="krabička" src="корóбка" trans_en="little box"/>
      <item trans="krásný (-á, -é)"
            src="краси́вый (-ая, -ое)"
            trans_en="beautiful"/>
      <item trans="milovat"
            src="люби́ть (люблю́, лю́бишь, лю́бят)"
            trans_en="love"/>
      <item trans="lidé" src="лю́ди (pl.)" trans_en="people"/>
      <item trans="lidový" src="нарóдный (-ая, -ое)" trans_en="folk"/>
      <item trans="okno" src="окнó" trans_en="window"/>
      <item trans="protože" src="потомý что" trans_en="because"/>
      <item trans="proč?" src="почемý?" trans_en="why?"/>
      <item trans="práce" src="рабóта" trans_en="work"/>
      <item trans="pracovat"
            src="рабóтать (рабóтаю, рабóтаешь, рабóтают)"
            trans_en="to work"/>
      <item trans="dříve" src="рáньше" trans_en="before, earlier"/>
      <item trans="přibližně" src="сравни́тельно" trans_en="approximately"/>
      <item trans="tobě"
            src="тебé"
            trans_en="you (*dativ, singular, informal*)"/>
      <item trans="teď" src="тепéрь" trans_en="now"/>
      <item trans="obtížně" src="трýдно" trans_en="with difficulty"/>
      <item trans="obtížný (-á, -é)"
            src="трýдный (-ая, -ое)"
            trans_en="difficult"/>
      <item trans="učit (se)"
            src="учи́ть (учý, ýчишь, ýчат)"
            trans_en="to learn"/>
      <item trans="hůře" src="хýже" trans_en="worse"/>
      <item trans="než" src="чем" trans_en="than"/>
      <item trans="škola" src="шкóла" trans_en="school"/>
      <item trans="jablko" src="я́блоко" trans_en="apple"/>
      <item trans="jazyk, řeč" src="язы́к" trans_en="tongue, language"/>
      <item trans="tento, tato, toto" src="э́тот, э́та, э́то" trans_en="this"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson5/ChapterB/lekce05_5_cz.xml">
      <item trans="chudoba" src="бéдность (f.)" trans_en="poverty"/>
      <item trans="nezaměstnanost" src="безрабóтица" trans_en="unemployment"/>
      <item trans="celý, celá, celé"
            src="весь, вся, всё"
            trans_en="whole, entire"/>
      <item trans="přesto" src="всё ещё" trans_en="in spite of"/>
      <item trans="město" src="гóрод" trans_en="a city"/>
      <item trans="hrana" src="грань (f.)" trans_en="edge"/>
      <item trans="dědeček" src="дéдушка" trans_en="grandfather"/>
      <item trans="věc" src="дéло" trans_en="thing, item"/>
      <item trans="o co jde"
            src="в чём дéло"
            trans_en="what is the matter/issue"/>
      <item trans="vesnice" src="дерéвня" trans_en="a village"/>
      <item trans="drahý (-á, -é)"
            src="дорогóй (-áя, -óе)"
            trans_en="expensive"/>
      <item trans="jeho, ho" src="егó" trans_en="him"/>
      <item trans="jemu" src="емý" trans_en="him (*dativ*)"/>
      <item trans="zapomínat"
            src="забывáть (забывáю, забывáешь, забывáют)"
            trans_en="forget"/>
      <item trans="kvůli" src="и́з-за" trans_en="because of"/>
      <item trans="obzvláště, právě" src="и́менно" trans_en="especially"/>
      <item trans="brambory" src="картóшка" trans_en="potatoes"/>
      <item trans="koupit"
            src="купи́ть (куплю́, кýпишь, кýпят)"
            trans_en="to buy"/>
      <item trans="obchod" src="магази́н" trans_en="shop"/>
      <item trans="mlčet"
            src="молчáть (молчý, молчи́шь, молчáт)"
            trans_en="to be silent"/>
      <item trans="pravděpodobně" src="навéрное" trans_en="probably"/>
      <item trans="nám" src="нам" trans_en="us (*dativ*)"/>
      <item trans="Němci" src="нéмцы (pl.)" trans_en="Germans"/>
      <item trans="ne (tak) špatně" src="неплóхо" trans_en="not (so) badly"/>
      <item trans="nuže" src="ну" trans_en="well"/>
      <item trans="spojení" src="объединéние" trans_en="connection"/>
      <item trans="okurka" src="огурéц" trans_en="cucumber"/>
      <item trans="okolo, vedle, přibližně"
            src="óколо (+ gen.)"
            trans_en="around, next, approximately"/>
      <item trans="přivydělávat si"
            src="подрабáтывать (подрабáтываю, подрабáтываешь, подрабáтывают)"
            trans_en="make some extra money"/>
      <item trans="rajče" src="помидóр" trans_en="tomato"/>
      <item trans="příčina" src="причи́на" trans_en="cause"/>
      <item trans="jednoduše" src="прóсто" trans_en="simply"/>
      <item trans="televizor" src="телеви́зор" trans_en="television set"/>
      <item trans="třetina" src="треть (f.)" trans_en="one third"/>
      <item trans="Francouzi" src="францýзы (pl.)" trans_en="the French"/>
      <item trans="čistý (-á, -é)" src="чи́стый (-ая, -ое)" trans_en="clean"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson5/ChapterC/lekce05_6_cz.xml">
      <item trans="zapínat"
            src="включáть (включáю, включáешь, включáют)"
            trans_en="switch on"/>
      <item trans="vypínat"
            src="выключа́ть (выключа́ю, выключа́ешь, выключа́ют)"
            trans_en="switch off"/>
      <item trans="společně" src="вмéсте" trans_en="together"/>
      <item trans="dávat" src="давáть (даю́, даёшь, даю́т)" trans_en="to give"/>
      <item trans="dokonce" src="дáже" trans_en="even"/>
      <item trans="dveře" src="дверь (f.)" trans_en="door"/>
      <item trans="to znamená" src="знáчит" trans_en="that means"/>
      <item trans="mně" src="мне" trans_en="me (*dativ*)"/>
      <item trans="nad" src="над (+ instr.)" trans_en="above, over"/>
      <item trans="nespokojen" src="недовóлен" trans_en="dissatisfied"/>
      <item trans="převlékat se"
            src="переодевáться (-вáюсь, -вáешься, -вáются)"
            trans_en="change (one's clothes)"/>
      <item trans="zavolejte (komu)"
            src="позвони́те (+ dat.)"
            trans_en="call (someone)"/>
      <item trans="jít"
            src="пойти́ (пойдý, пойдёшь, пойдýт)"
            trans_en="to go (*walk*)"/>
      <item trans="kupovat"
            src="покупáть (покупáю, покупáешь, покупáют)"
            trans_en="to buy"/>
      <item trans="police" src="пóлка" trans_en="the police"/>
      <item trans="učitel" src="преподавáтель (m.)" trans_en="teacher"/>
      <item trans="loučení" src="прощáние" trans_en="parting, farewell"/>
      <item trans="svůj, svá, své" src="свой, своя́, своё" trans_en="one's own"/>
      <item trans="světlo" src="свет" trans_en="light"/>
      <item trans="překvapení" src="сюрпри́з" trans_en="surprise"/>
      <item trans="tím" src="тем" trans_en="thereby"/>
      <item trans="přestože, třeba jen" src="хоть" trans_en="although"/>
      <item trans="hodina" src="час" trans_en="hour"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson6/ChapterA/lekce06_1_cz.xml">
      <item trans="vždyť" src="ведь" trans_en="after all"/>
      <item trans="dvoje, dva" src="двóе" trans_en="two pairs, two"/>
      <item trans="továrna" src="завóд" trans_en="factory"/>
      <item trans="vydělávat"
            src="зарабáтывать (зарабáтываю, зарабáтываешь, зарабáтывают)"
            trans_en="to earn money"/>
      <item trans="výdělek" src="зáработок" trans_en="earnings"/>
      <item trans="známí" src="знакóмые (pl.)" trans_en="acquaintances"/>
      <item trans="je, jejich" src="их" trans_en="them, theirs"/>
      <item trans="kvalita" src="кáчество" trans_en="quality"/>
      <item trans="který (-á, -é)" src="котóрый (-ая, -ое)" trans_en="which"/>
      <item trans="auto" src="маши́на" trans_en="car"/>
      <item trans="mnoho" src="мнóго" trans_en="many, much"/>
      <item trans="ucházející"
            src="неплохóй (-áя, -óе)"
            trans_en="passable, acceptable"/>
      <item trans="prodávat"
            src="продавáть (продаю́, продаёшь, продаю́т)"
            trans_en="to sell"/>
      <item trans="příliš" src="сли́шком" trans_en="too much"/>
      <item trans="dobrý (-á, -é)" src="хорóший (-ая, -ее)" trans_en="good"/>
      <item trans="přestože" src="хотя́" trans_en="although"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson6/ChapterA/lekce06_2_cz.xml">
      <item trans="rok" src="год" trans_en="year"/>
      <item trans="ochrana" src="защи́та" trans_en="protection"/>
      <item trans="musí, musejí"
            src="дóлжен, должнá, должнó, должны́"
            trans_en="must"/>
      <item trans="pro" src="для (+ gen.)" trans_en="for"/>
      <item trans="z" src="из (+ gen.)" trans_en="from"/>
      <item trans="množství" src="коли́чество" trans_en="amount"/>
      <item trans="skutečný"
            src="настоя́щий (-ая, -ее)"
            trans_en="actual, real"/>
      <item trans="společnost" src="óбщество" trans_en="society, company"/>
      <item trans="určitý (-á, -é)"
            src="определённый (-ая, -ое)"
            trans_en="certain, definite"/>
      <item trans="výborný (-á, -é)"
            src="отли́чный (-ая, -ое)"
            trans_en="excellent"/>
      <item trans="téměř" src="почти́" trans_en="nearly, almost"/>
      <item trans="dělníci" src="рабóчие (pl.)" trans_en="workers"/>
      <item trans="povolovat"
            src="разрешáть (разрешáю, разрешáешь, разрешáют)"
            trans_en="allow"/>
      <item trans="rada" src="совéт" trans_en="advice"/>
      <item trans="natolik" src="стóлько" trans_en="to such an extent"/>
      <item trans="propustit"
            src="увóлить (увóлю, увóлишь, увóлят)"
            trans_en="release"/>
      <item trans="chtít" src="хотéть (хочý, хóчешь, хотя́т)" trans_en="want"/>
      <item trans="člověk" src="человéк" trans_en="man, person"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson6/ChapterB/lekce06_3_cz.xml">
      <item trans="houby" src="грибы́ (pl.)" trans_en="mushrooms"/>
      <item trans="pečený (-á, -é)"
            src="жáреный (-ая, -ое)"
            trans_en="baked, roasted"/>
      <item trans="objednávat"
            src="закáзывать (закáзываю, закáзываешь, закáзывают)"
            trans_en="order"/>
      <item trans="zlatý (-á, -é)"
            src="золотóй (-áя, -óе)"
            trans_en="gold, golden"/>
      <item trans="čínský (-á, -é)"
            src="китáйский (-ая, -ое)"
            trans_en="Chinese"/>
      <item trans="jestli" src="ли" trans_en="whether"/>
      <item trans="menu" src="меню́" trans_en="menu"/>
      <item trans="med" src="мёд" trans_en="honey"/>
      <item trans="nelze" src="нельзя́" trans_en="not possible"/>
      <item trans="nový (-á, -é)" src="нóвый (-ая, -ое)" trans_en="new"/>
      <item trans="zelenina" src="óвощи (pl.)" trans_en="vegetables"/>
      <item trans="číšník" src="официáнт" trans_en="waiter"/>
      <item trans="první" src="пéрвый (-ая, -ое)" trans_en="first"/>
      <item trans="čínsky" src="по-китáйски" trans_en="in Chinese"/>
      <item trans="pomáhat"
            src="помогáть (помогáю, помогáешь, помогáют)"
            trans_en="help"/>
      <item trans="proto" src="поэ́тому" trans_en="therefore"/>
      <item trans="zvát"
            src="приглашáть (приглашáю, приглашáешь, приглашáют)"
            trans_en="invite"/>
      <item trans="jednou" src="раз" trans_en="once"/>
      <item trans="večeřet"
            src="ýжинать (ýжинаю, ýжинаешь, ýжинают)"
            trans_en="have dinner"/>
      <item trans="povečeřet"
            src="поýжинать (поýжинаю, поýжинаешь, поýжинают)"
            trans_en="have one's dinner"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson6/ChapterB/lekce06_4_cz.xml">
      <item trans="bezplatný (-á, -é)"
            src="бесплáтный (-ая, -ое)"
            trans_en="free of charge"/>
      <item trans="v ostatním" src="в остальнóм" trans_en="in other things"/>
      <item trans="vůbec, všeobecně" src="вообщé" trans_en="at all, generally"/>
      <item trans="druhý (-á, -é)" src="вторóй (-áя, -óе)" trans_en="second"/>
      <item trans="včera" src="вчерá" trans_en="yesterday"/>
      <item trans="někde" src="гдé-то" trans_en="somewhere"/>
      <item trans="městský (-á, -é)"
            src="городскóй (-áя, -óе)"
            trans_en="urban, city"/>
      <item trans="hořce" src="гóрько" trans_en="bitterly"/>
      <item trans="chata" src="дáча" trans_en="cottage"/>
      <item trans="den" src="день (m.)" trans_en="day"/>
      <item trans="přidávat"
            src="добавля́ть (добавля́ю, добавля́ешь, добавля́ют)"
            trans_en="add"/>
      <item trans="draze" src="дóрого" trans_en="expensively"/>
      <item trans="euro" src="éвро" trans_en="the euro"/>
      <item trans="známost, znalost" src="знакóмство" trans_en="knowledge"/>
      <item trans="jim" src="им" trans_en="them (*dativ*)"/>
      <item trans="někdy" src="иногдá" trans_en="sometimes"/>
      <item trans="hranolky"
            src="картóфель-фри (pl.)"
            trans_en="chips, French fries"/>
      <item trans="kopějka" src="копéйка" trans_en="kopek"/>
      <item trans="kousek" src="кусóк" trans_en="piece"/>
      <item trans="měsíc" src="мéсяц" trans_en="month"/>
      <item trans="týden" src="недéля" trans_en="week"/>
      <item trans="neobratný, trapný"
            src="нелóвкий (-ая, -ое)"
            trans_en="clumsy, embarrassing"/>
      <item trans="německý (-á, -é)"
            src="немéцкий (-ая, -ое)"
            trans_en="German"/>
      <item trans="nikdo (ne)" src="никтó (не)" trans_en="nobody"/>
      <item trans="obzvláště" src="осóбенно" trans_en="especially"/>
      <item trans="otevřeně" src="откровéнно" trans_en="openly"/>
      <item trans="situace, poloha"
            src="положéние"
            trans_en="situation, position"/>
      <item trans="pokračovat"
            src="продолжáть (продолжáю, продолжáешь, продолжáют)"
            trans_en="continue"/>
      <item trans="rubl" src="рубль (m.)" trans_en="rouble"/>
      <item trans="rybí směs"
            src="ры́бное ассорти́ (pl.)"
            trans_en="fish mixture"/>
      <item trans="od (časově)" src="с (+ gen.)" trans_en="from, since"/>
      <item trans="svěží, čerstvý" src="свéжий (-ая, -ее)" trans_en="fresh"/>
      <item trans="slovo" src="слóво" trans_en="word"/>
      <item trans="říci"
            src="сказáть (скажý, скáжешь, скáжут)"
            trans_en="to say"/>
      <item trans="kolik stojí…?"
            src="скóлько стóит ...?"
            trans_en="how much is…?"/>
      <item trans="počítat"
            src="считáть (считáю, считáешь, считáют)"
            trans_en="count"/>
      <item trans="ticho" src="ти́хо" trans_en="silence"/>
      <item trans="chleba" src="хлеб" trans_en="bread"/>
      <item trans="cent" src="цент" trans_en="cent"/>
      <item trans="smažená (míchaná) vajíčka"
            src="яи́чница"
            trans_en="scrambled eggs"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson6/ChapterC/lekce06_5_cz.xml">
      <item trans="nejen ... ale i" src="и ... и" trans_en="not only… but also"/>
      <item trans="ohniště" src="костёр" trans_en="fire pit"/>
      <item trans="v létě" src="лéтом" trans_en="in summer"/>
      <item trans="několik" src="нéскoлько" trans_en="several"/>
      <item trans="píseň" src="пéсня" trans_en="song"/>
      <item trans="(je) čas" src="порá" trans_en="(it is) time"/>
      <item trans="sklenička na cestu"
            src="посошóк"
            trans_en="a glass for the road"/>
      <item trans="překrásný (-á, -é)"
            src="прекрáсный (-ая, -ое)"
            trans_en="beautiful"/>
      <item trans="přineste" src="принеси́те" trans_en="bring"/>
      <item trans="příroda" src="прирóда" trans_en="nature"/>
      <item trans="prázdný (-á, -é)" src="пустóй (-áя, -óе)" trans_en="empty"/>
      <item trans="rybaření" src="рыбáлка" trans_en="fishing"/>
      <item trans="teď" src="сейчáс" trans_en="now"/>
      <item trans="smát se"
            src="смея́ться (смею́сь, смеёшься, смею́тся)"
            trans_en="smile"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson7/ChapterA/lekce07_1_cz.xml">
      <item trans="osmý (-á, -é)" src="восьмóй (-áя, -óе)" trans_en="eight"/>
      <item trans="vychovatel" src="воспитáтель (m.)" trans_en="carer, warden"/>
      <item trans="vychovatelka"
            src="воспитáтельница"
            trans_en="female carer, warden"/>
      <item trans="dávat, darovat"
            src="дари́ть (дарю́, дáришь, дáрят)"
            trans_en="give (imperfective)"/>
      <item trans="dát, obdarovat"
            src="подари́ть (подарю́, подáришь, подáрят)"
            trans_en="give (perfective)"/>
      <item trans="mateřská škola" src="дéтский сад" trans_en="kindergarten"/>
      <item trans="každý (-á, -é)"
            src="кáждый (-ая, -ое)"
            trans_en="every, each"/>
      <item trans="březen" src="март" trans_en="March"/>
      <item trans="souprava" src="набóр" trans_en="set"/>
      <item trans="blahopřát"
            src="поздравля́ть (поздравля́ю, поздравля́ешь, поздравля́ют)"
            trans_en="wish"/>
      <item trans="poblahopřát"
            src="поздрáвить (поздрáвлю, поздрáвишь, поздрáвят)"
            trans_en="wish"/>
      <item trans="starší" src="постáрше" trans_en="older"/>
      <item trans="svátek" src="прáздник" trans_en="holiday"/>
      <item trans="sváteční"
            src="прáздничный (-ая, -ое)"
            trans_en="festive, holiday-like"/>
      <item trans="rodiče" src="роди́тели" trans_en="parents"/>
      <item trans="verše, básně" src="стихи́" trans_en="verses, poems"/>
      <item trans="školní" src="шкóльный (-ая, -ое)" trans_en="school (adj.)"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson7/ChapterA/lekce07_2_cz.xml">
      <item trans="vzdychat"
            src="вздыхáть (вздыхáю, вздыхáешь, вздыхáют)"
            trans_en="to sigh (imperfective)"/>
      <item trans="vzdychnout"
            src="вздохнýть (вздохнý, вздохнёшь, вздохнýт)"
            trans_en="to sigh (perfective)"/>
      <item trans="hluboko" src="глyбокó" trans_en="deeply"/>
      <item trans="navzájem" src="друг дрýга" trans_en="mutually"/>
      <item trans="voňavka" src="духи́" trans_en="perfume"/>
      <item trans="ženský (-á, -é)" src="жéнский (-ая, -ое)" trans_en="female"/>
      <item trans="koníček" src="лошáдка" trans_en="hobby"/>
      <item trans="mámin (-a, -o)" src="мáмин (-а, -о)" trans_en="Mother's"/>
      <item trans="vyrábět si"
            src="мастери́ть (мастерю́, мастери́шь, мастеря́т)"
            trans_en="to make (imperfective)"/>
      <item trans="vyrobit si"
            src="смастери́ть (смастерю́, смастери́шь, смастеря́т)"
            trans_en="to make (perfective)"/>
      <item trans="mezinárodní"
            src="междунарóдный (-ая, -ое)"
            trans_en="international"/>
      <item trans="začínat" src="начинáть" trans_en="to begin"/>
      <item trans="začít"
            src="начáть (начнý, начнёшь, начнýт)"
            trans_en="start"/>
      <item trans="obyčejně" src="обы́чно" trans_en="usually"/>
      <item trans="jedno a to samé"
            src="однó и тóже"
            trans_en="one and the same thing"/>
      <item trans="výborně" src="отли́чно" trans_en="excellently"/>
      <item trans="pohlednice" src="откры́тка" trans_en="postcard"/>
      <item trans="blahopřejný (-á, -é)"
            src="поздрави́тельный (-ая, -ое)"
            trans_en="congratulatory"/>
      <item trans="kratčeji" src="покорóче" trans_en="shorter"/>
      <item trans="řešit, rozhodovat se"
            src="решáть"
            trans_en="to address, to decide"/>
      <item trans="vyřešit, rozhodnout se"
            src="реши́ть (решý, реши́шь, решáт)"
            trans_en="to resolve, to decide"/>
      <item trans="malovat"
            src="рисовáть (рисýю, рисýешь, рисýют)"
            trans_en="to paint (imperfective)"/>
      <item trans="namalovat"
            src="нарисовáть (нарисýю, нарисýешь, нарисýют)"
            trans_en="to paint (perfective)"/>
      <item trans="obrázek" src="рисýнок" trans_en="picture"/>
      <item trans="sbírat" src="собирáть" trans_en="to collect (imperfective)"/>
      <item trans="sebrat"
            src="собрáть (соберý, соберёшь, соберýт)"
            trans_en="to collect (perfective)"/>
      <item trans="báseň" src="стихотворéние" trans_en="poem"/>
      <item trans="třetí" src="трéтий (-ья, -ье)" trans_en="third"/>
      <item trans="žák" src="учени́к" trans_en="pupil, student"/>
      <item trans="učitelka" src="учи́тельница" trans_en="teacher"/>
      <item trans="naučit se"
            src="вы́учить (вы́учу, вы́учишь, вы́учат)"
            trans_en="to learn"/>
      <item trans="květiny" src="цветы́" trans_en="flowers"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson7/ChapterB/lekce07_3_cz.xml">
      <item trans="vstávat"
            src="вставáть (встаю́, встаёшь, встаю́т)"
            trans_en="get up"/>
      <item trans="vstát"
            src="встать (встáну, встáнешь, встáнут)"
            trans_en="to get up"/>
      <item trans="vstupovat, vcházet"
            src="входи́ть (вхожý, вхóдишь, вхóдят)"
            trans_en="to enter (imperfective)"/>
      <item trans="vstoupit, vejít"
            src="войти́ (войдý, войдёшь, войдýт)"
            trans_en="to enter (perfective)"/>
      <item trans="oko" src="глаз" trans_en="eye"/>
      <item trans="vařit, připravovat"
            src="готóвить (готóвлю, готóвишь, готóвят)"
            trans_en="to cook, to prepare (imperfective)"/>
      <item trans="uvařit, připravit"
            src="приготóвить (приготóвлю, приготóвишь, приготóвят)"
            trans_en="to cook, to prepare (perfective)"/>
      <item trans="jí" src="ей" trans_en="her (*dativ*)"/>
      <item trans="snídaně" src="зáвтрак" trans_en="breakfast"/>
      <item trans="kup" src="купи́" trans_en="buy"/>
      <item trans="objímat"
            src="обнимáть (обнимáю, обнимáешь, обнимáют)"
            trans_en="to hug (imperfective)"/>
      <item trans="obejmout"
            src="обня́ть (обнимý, обни́мешь, обни́мут)"
            trans_en="to hug (perfective)"/>
      <item trans="přicházet"
            src="прихoди́ть (прихожý, прихóдишь, прихóдят)"
            trans_en="to arrive"/>
      <item trans="přijít"
            src="прийти́ (придý, придёшь, придýт)"
            trans_en="come"/>
      <item trans="probouzet se"
            src="просыпáться (просыпáюсь, просыпáешься, просыпáются)"
            trans_en="to wake up (imperfective)"/>
      <item trans="probudit se"
            src="проснýться (проснýсь, проснёшься, проснýтся)"
            trans_en="to wake up (perfective)"/>
      <item trans="sám, sama, samo"
            src="сам, сама, самo"
            trans_en="on his/her/its own"/>
      <item trans="seď" src="сиди́" trans_en="sit"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson7/ChapterB/lekce07_4_cz.xml">
      <item trans="bitva" src="би́тва" trans_en="battle"/>
      <item trans="zcela rychle" src="бы́стренько" trans_en="entirely fast"/>
      <item trans="rychle" src="бы́стро" trans_en="quickly, fast"/>
      <item trans="okolo" src="вокрýг" trans_en="around"/>
      <item trans="vstal" src="встал (m.)" trans_en="he got up"/>
      <item trans="vypadat"
            src="вы́глядеть (вы́гляжу, вы́глядишь, вы́глядят)"
            trans_en="to look"/>
      <item trans="vytírat"
            src="вытирáть (вытирáю, вытирáешь, вытирáют)"
            trans_en="to wipe (imperfective)"/>
      <item trans="vytřít"
            src="вы́тереть (вы́тру, вы́трешь, вы́трут)"
            trans_en="to wipe (perfective)"/>
      <item trans="naučili se" src="вы́учили" trans_en="they learned"/>
      <item trans="všímat si"
            src="замечáть (замечáю, замечáешь, замечáют)"
            trans_en="to notice (imperfective)"/>
      <item trans="všimnout si"
            src="замéтить (замéчу, замéтишь, замéтят)"
            trans_en="to notice"/>
      <item trans="jakmile" src="как тóлько" trans_en="as soon as"/>
      <item trans="obrázek" src="карти́нка" trans_en="picture"/>
      <item trans="křičet"
            src="кричáть (кричý, кричи́шь, крича́т)"
            trans_en="to cry, to shout (imperfective)"/>
      <item trans="zakřičet"
            src="кри́кнуть (кри́кну, кри́кнешь, кри́кнут)"
            trans_en="to cry, to shout (perfective)"/>
      <item trans="koupila" src="купи́ла" trans_en="she bought"/>
      <item trans="mýt"
            src="мыть (мóю, мóешь, мóют)"
            trans_en="to wash (imperfective)"/>
      <item trans="umýt"
            src="вымыть (вымóю, вымóешь, вымóют)"
            trans_en="to wash (perfective)"/>
      <item trans="nakreslil" src="нарисовáл" trans_en="he drew"/>
      <item trans="odpočívat, být na dovolené"
            src="отдыхáть (отдыхáю, отдыхáешь, отдыхáют)"
            trans_en="to rest, to be on vacation (imperfective)"/>
      <item trans="odpočinout si, být na dovolené"
            src="отдохнýть (отдохнý, отдохнёшь, отдохнýт)"
            trans_en="to rest, to be on vacation (perfective)"/>
      <item trans="položit"
            src="положи́ть (положý, полóжишь, полóжат)"
            trans_en="give"/>
      <item trans="pokládat"
            src="класть (кладý, кладёшь, кладýт)"
            trans_en="to put down (imperfective)"/>
      <item trans="po" src="пóсле (+ gen.)" trans_en="after"/>
      <item trans="nádobí" src="посýда" trans_en="dishes, tableware"/>
      <item trans="potraviny" src="продýкты" trans_en="food"/>
      <item trans="slza" src="слезá" trans_en="tear"/>
      <item trans="úplně" src="совсéм" trans_en="entirely"/>
      <item trans="párek" src="соси́ска" trans_en="sausage"/>
      <item trans="ptát se"
            src="спрáшивать (спрáшиваю, спрáшиваешь, спрáшивают)"
            trans_en="to ask"/>
      <item trans="zeptat se"
            src="спроси́ть (спрошý, спрóсишь, спрóсят)"
            trans_en="to ask (perfective)"/>
      <item trans="hned ... hned"
            src="то ... то"
            trans_en="immediately, this instant…"/>
      <item trans="dojat (-a, -o)"
            src="трóнут (-а, -о)"
            trans_en="touched, moved"/>
      <item trans="uklízet"
            src="убирáть (убирáю, убирáешь, убирáют)"
            trans_en="to tidy, to clean (imperfective)"/>
      <item trans="uklidit"
            src="убрáть (уберý, уберёшь, уберýт)"
            trans_en="to tidy, to clean (perfective)"/>
      <item trans="usmívat se"
            src="улыбáться (улыбáюсь, улыбáешься, улыбáются)"
            trans_en="to smile (imperfective)"/>
      <item trans="usmát se"
            src="улыбнýться (улыбнýсь, улыбнёшься, улыбнýтся)"
            trans_en="to smile (perfective)"/>
      <item trans="ráno" src="ýтро" trans_en="morning"/>
      <item trans="odcházet"
            src="ухoди́ть (ухожý, ухóдишь, ухóдят)"
            trans_en="to leave (imperfective)"/>
      <item trans="odejít" src="уйти́ (уйдý, уйдёшь, уйдýт)" trans_en="leave"/>
      <item trans="mraznička" src="холоди́льник" trans_en="freezer"/>
      <item trans="sborově" src="хóром" trans_en="in unison, in chorus"/>
      <item trans="líbat se"
            src="целовáться (целýюсь, целýешься, целýются)"
            trans_en="to kiss (imperfective)"/>
      <item trans="políbit se"
            src="поцеловáться (поцелýюсь, поцелýешься, поцелýются)"
            trans_en="to kiss one another (perfective)"/>
      <item trans="celý (-á, -é)"
            src="цéлый (-ая, -ое)"
            trans_en="entire, whole"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson7/ChapterC/lekce07_5_cz.xml">
      <item trans="čas" src="врéмя (n.)" trans_en="time"/>
      <item trans="vzhled, výhled" src="вид" trans_en="appearance, look"/>
      <item trans="domácí" src="домáшний (-яя, -ее)" trans_en="domestic"/>
      <item trans="přijíždět"
            src="приезжáть (приезжáю, приезжáешь, приезжáют)"
            trans_en="to arrive by vehicle (imperfective)"/>
      <item trans="přijet"
            src="приéхать (приéду, приéдешь, приéдут)"
            trans_en="to arrive by vehicle (perfective)"/>
      <item trans="telefonovat"
            src="звони́ть (звоню́, звони́шь, звоня́т)"
            trans_en="to phone"/>
      <item trans="zatelefonovat"
            src="позвони́ть (позвоню́, позвони́шь, позвоня́т)"
            trans_en="to make a call (perfective)"/>
      <item trans="omlouvat se"
            src="извиня́ться (извиня́юсь, извиня́ешься, извиня́ются)"
            trans_en="to apologise (imperfective)"/>
      <item trans="omluvit se"
            src="извини́ться (извиню́сь, извини́шься, извиня́тся)"
            trans_en="to apologise (perfective)"/>
      <item trans="urážet"
            src="обижáть (обижáю, обижáешь, обижáют)"
            trans_en="to insult (imperfective)"/>
      <item trans="urazit"
            src="оби́деть (оби́жy, оби́дишь, оби́дят)"
            trans_en="to insult (perfective)"/>
      <item trans="prožívat, dělat si starosti, překonávat"
            src="переживáть (переживáю, переживáешь, переживáют)"
            trans_en="to live through, to worry, to overcome (imperfective)"/>
      <item trans="zažít, prožít, překonat"
            src="пережи́ть (переживý, переживёшь, переживýт)"
            trans_en="to live through, to worry, to overcome (perfective)"/>
      <item trans="chyť" src="поймáй" trans_en="catch"/>
      <item trans="rozumět"
            src="понимáть (понимáю, понимáешь, понимáют)"
            trans_en="understand"/>
      <item trans="porozumět"
            src="поня́ть (поймý, поймёшь, поймýт)"
            trans_en="to understand (perfective)"/>
      <item trans="klidně" src="спокóйно" trans_en="calmly"/>
      <item trans="strašně" src="ужáсно" trans_en="terribly"/>
      <item trans="chtěl" src="хотéл (m.)" trans_en="he wanted"/>
    </lmap>
    <lmap ident="~/Russian1/Lesson7/ChapterC/lekce07_6_cz.xml">
      <item trans="vyhazovat"
            src="выбрáсывать (выбрáсываю, выбрáсываешь, выбрáсывают)"
            trans_en="to throw out (imperfective)"/>
      <item trans="vyhodit"
            src="вы́бросить (вы́брошу, вы́бросишь, вы́бросят)"
            trans_en="to throw out (perfective)"/>
      <item trans="dvůr" src="двор" trans_en="yard"/>
      <item trans="úkol" src="задáние" trans_en="task"/>
      <item trans="mokrý (-á, -é)" src="мóкрый (-ая, -ое)" trans_en="wet"/>
      <item trans="mlčky" src="мóлча" trans_en="in silence"/>
      <item trans="odpad" src="мýсор" trans_en="waste"/>
      <item trans="správně" src="прáвильно" trans_en="properly, correctly"/>
      <item trans="prát"
            src="стирáть (стирáю, стирáешь, стирáют)"
            trans_en="to wash (imperfective)"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson1/ChapterA/lekce08_1_cz.xml">
      <item trans="být" src="быть" trans_en="be"/>
      <item trans="vždy" src="всегдá" trans_en="always"/>
      <item trans="včas" src="вóвремя" trans_en="on time"/>
      <item trans="jména (2.p.)"
            src="и́мени (gen.)"
            trans_en="names (2nd case - genitive)"/>
      <item trans="snít" src="мечтáть" trans_en="to dream (imperfective)"/>
      <item trans="mnohem" src="намнóго" trans_en="much"/>
      <item trans="nedávno" src="недáвно" trans_en="not long ago"/>
      <item trans="dostávat"
            src="получáть"
            trans_en="to get, to receive (imperfective)"/>
      <item trans="dostat"
            src="получи́ть (полýчy, полýчишь, полýчат)"
            trans_en="to get"/>
      <item trans="vysavač" src="пылесóс" trans_en="vacuum cleaner"/>
      <item trans="střední" src="срéдний (-яя, -ее)" trans_en="neuter"/>
      <item trans="pračka" src="стирáльная маши́на" trans_en="washing machine"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson1/ChapterA/lekce08_2_cz.xml">
      <item trans="domácí, každodenní"
            src="бытовóй (-áя, -óе)"
            trans_en="domestic, every-day"/>
      <item trans="Vám, vám" src="вам" trans_en="to/for you"/>
      <item trans="věčný (-á, -é)" src="вéчный (-ая, -ое)" trans_en="eternal"/>
      <item trans="nadšeně" src="в востóрге" trans_en="enthusiastically"/>
      <item trans="během" src="во врéмя" trans_en="during"/>
      <item trans="NDR, Německá demokratická republika"
            src="ГДР, Гермáнская Демократи́ческая Респýблика"
            trans_en="GDR, German Democratic Republic"/>
      <item trans="značně" src="довóльно" trans_en="considerably"/>
      <item trans="Žiguli (ruská značka auta)"
            src="Жигули́"
            trans_en="Žiguli (make of Russian cars)"/>
      <item trans="atd., a tak dále"
            src="и т. д., и так дáлее"
            trans_en="etc., and so forth"/>
      <item trans="kávovar" src="кофевáрка" trans_en="coffee maker"/>
      <item trans="libovolný (-á, -é)" src="любóй (-áя, -óе)" trans_en="any"/>
      <item trans="svět, mír" src="мир" trans_en="world, peace"/>
      <item trans="posílat" src="направля́ть" trans_en="to send (imperfective)"/>
      <item trans="poslat"
            src="напрáвить (напрáвлю, напрáвишь, напрáвят)"
            trans_en="to send (perfective)"/>
      <item trans="ukazovat" src="покáзывать" trans_en="to show"/>
      <item trans="ukázat"
            src="показáть (покажý, покáжешь, покáжут)"
            trans_en="to show (perfective)"/>
      <item trans="zástupce, představitel"
            src="представи́тель (m.)"
            trans_en="representative"/>
      <item trans="třída, široká okázalá ulice"
            src="проспéкт"
            trans_en="avenue"/>
      <item trans="vypravovat"
            src="расскáзывать"
            trans_en="to tell (imperfective)"/>
      <item trans="vyprávět"
            src="рассказáть (расскажý, расскáжешь, расскáжут)"
            trans_en="to tell (imperfective)"/>
      <item trans="ložnice" src="спáльня" trans_en="bedroom"/>
      <item trans="stalinský (-á, -é)"
            src="стáлинский (-ая, -ое)"
            trans_en="Stalinist"/>
      <item trans="úspěšně" src="успéшно" trans_en="successfully"/>
      <item trans="žehlička" src="утю́г" trans_en="iron"/>
      <item trans="francouzský (-á, -é)"
            src="францýзский (-ая, -ое)"
            trans_en="French (adjective)"/>
      <item trans="za hotové (peníze)" src="чи́стыми" trans_en="in cash"/>
      <item trans="šestý (-á, -é)" src="шестóй (-áя, -óе)" trans_en="sixth"/>
      <item trans="průvodce" src="экскурсовóд" trans_en="guide"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson1/ChapterB/lekce08_3_cz.xml">
      <item trans="bílý (-á, -é)" src="бéлый (-ая, -ое)" trans_en="white"/>
      <item trans="vidět" src="ви́деть (ви́жу, ви́дишь, ви́дят)" trans_en="see"/>
      <item trans="uvidět"
            src="уви́деть (уви́жу, уви́дишь, уви́дят)"
            trans_en="to see (perfective)"/>
      <item trans="setkávat se"
            src="встречáть"
            trans_en="to meet, to encounter (imperfective)"/>
      <item trans="setkat se"
            src="встрéтить (встрéчу, встрéтишь, встрéтят)"
            trans_en="to meet, to encounter (perfective)"/>
      <item trans="obhajovat"
            src="защищáть"
            trans_en="to defend (imperfective)"/>
      <item trans="obhájit"
            src="защити́ть (защищý, защити́шь, защитя́т)"
            trans_en="to defend (perfective)"/>
      <item trans="zde" src="здесь" trans_en="here"/>
      <item trans="proslulý (-á, -é)"
            src="знамени́тый (-ая, -ое)"
            trans_en="famous"/>
      <item trans="pevnost" src="крéпость (f.)" trans_en="solidity"/>
      <item trans="noc" src="ночь (f.)" trans_en="night"/>
      <item trans="nutně" src="обязáтельно" trans_en="necessarily"/>
      <item trans="osvobozovat"
            src="освобождáть"
            trans_en="to free, to liberate (imperfective)"/>
      <item trans="osvobodit"
            src="освободи́ть (освобожý, освободи́шь, освободя́т)"
            trans_en="to free, to liberate (perfective)"/>
      <item trans="památník" src="пáмятник" trans_en="memorial"/>
      <item trans="odjet"
            src="поéхать (поéду, поéдешь, поéдут)"
            trans_en="to leave"/>
      <item trans="představovat"
            src="представля́ть"
            trans_en="to introduce (imperfective)"/>
      <item trans="představit"
            src="предстáвить (предстáвлю, предстáвишь, предстáвят)"
            trans_en="to introduce (perfective)"/>
      <item trans="vlast" src="рóдина" trans_en="homeland"/>
      <item trans="sobě" src="себé (dat.)" trans_en="to oneself"/>
      <item trans="slyšet" src="слы́шать" trans_en="hear"/>
      <item trans="uslyšet" src="услы́шать" trans_en="to hear (perfective)"/>
      <item trans="katedrála" src="собóр" trans_en="cathedral"/>
      <item trans="tam" src="тудá" trans_en="there"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson1/ChapterB/lekce08_4_cz.xml">
      <item trans="herec" src="актёр" trans_en="actor"/>
      <item trans="herečka" src="актри́са" trans_en="an actress"/>
      <item trans="budoucí" src="бýдущий (-ая, -ее)" trans_en="future"/>
      <item trans="bývat, být" src="бывáть" trans_en="to usually be, to be"/>
      <item trans="vernisáž" src="вернисáж" trans_en="vernissage"/>
      <item trans="výloha" src="витри́на" trans_en="shop window"/>
      <item trans="vybudovat"
            src="воздви́гнут (-а, -о)"
            trans_en="to build (perfective)"/>
      <item trans="přesto" src="всё-таки" trans_en="in spite of"/>
      <item trans="výše, vyšší" src="вы́ше" trans_en="higher"/>
      <item trans="za" src="за (+ instr.)" trans_en="in"/>
      <item trans="Izmajlovo (známý bleší trh)"
            src="Измáйлово"
            trans_en="Izmajlovo (a famous flee market)"/>
      <item trans="obraz" src="карти́на" trans_en="picture, painting"/>
      <item trans="koberec" src="ковёр" trans_en="carpet, rug"/>
      <item trans="kůň" src="конь (m.)" trans_en="horse"/>
      <item trans="Labutí jezero (balet)"
            src="Лебеди́ное óзеро"
            trans_en="Swan Lake (ballet)"/>
      <item trans="malý (-á, -é)" src="мáлый (-ая, -ое)" trans_en="small"/>
      <item trans="manéžový, jízdárenský"
            src="манéжный (-ая, -ое)"
            trans_en="ring, riding hall (adj.)"/>
      <item trans="může" src="мóжет" trans_en="can, may"/>
      <item trans="zbytečně" src="напрáсно" trans_en="needlessly"/>
      <item trans="nacházet"
            src="находи́ть (нахожý, нахóдишь, нахóдят)"
            trans_en="to come up"/>
      <item trans="najít"
            src="найти́ (найдý, найдёшь, найдýт)"
            trans_en="to find (perfective)"/>
      <item trans="líbit se"
            src="нрáвиться (нрáвлюсь, нрáвишься, нрáвятся)"
            trans_en="like"/>
      <item trans="zalíbit se"
            src="понрáвиться (понрáвлюсь, понрáвишься, понрáвятся)"
            trans_en="to take a liking (perfective)"/>
      <item trans="přerušovat"
            src="перебивáть"
            trans_en="to interrupt (imperfective)"/>
      <item trans="přerušit"
            src="переби́ть (перебью́, перебьёшь, перебью́т)"
            trans_en="to interrupt (perfective)"/>
      <item trans="před" src="пéред (+ instr.)" trans_en="ago"/>
      <item trans="spisovatel" src="писáтель (m.)" trans_en="writer"/>
      <item trans="vítězství" src="побéда" trans_en="victory"/>
      <item trans="držák sklenic" src="подстакáнник" trans_en="glass holder"/>
      <item trans="při, u" src="при (+ lok.)" trans_en="at"/>
      <item trans="zkoušet"
            src="прóбовать (прóбую, прóбуешь, прóбуют)"
            trans_en="to try (imperfective)"/>
      <item trans="vyzkoušet"
            src="попрóбовать (попрóбую, попрóбуешь, попрóбуют)"
            trans_en="to try (perfective)"/>
      <item trans="srdce" src="сéрдце" trans_en="heart"/>
      <item trans="stříbrný (-á, -é)"
            src="серéбряный (-ая, -ое)"
            trans_en="silver"/>
      <item trans="Sněhurka (balet)" src="Снегýрочка" trans_en="Snow White"/>
      <item trans="současný (-á, -é)"
            src="совремéнный (-ая, -ое)"
            trans_en="contemporary"/>
      <item trans="socialistický realismus (umělecký směr)"
            src="соцреали́зм"
            trans_en="socialist realism (artistic style)"/>
      <item trans="představení" src="спектáкль (m.)" trans_en="performance"/>
      <item trans="stojící"
            src="стóящий (-ая, -ее)"
            trans_en="standing, stand-up"/>
      <item trans="sobota" src="суббóта" trans_en="Saturday"/>
      <item trans="obchodovat"
            src="торгова́ть (торгýю, торгýешь, торгýют)"
            trans_en="to trade (imperfective)"/>
      <item trans="obchodní" src="торгóвый (-ая, -ое)" trans_en="commercial"/>
      <item trans="dovednost, umění" src="умéние" trans_en="skill, art"/>
      <item trans="učiliště"
            src="учи́лище"
            trans_en="secondary vocational school"/>
      <item trans="cena" src="ценá" trans_en="price"/>
      <item trans="něco" src="чтó-то" trans_en="something"/>
      <item trans="Šeremeťjevo (mezinárodní letiště v Moskvě)"
            src="Шеремéтьево"
            trans_en="Sheremetyevo (Moscow international airport)"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson1/ChapterC/lekce08_5_cz.xml">
      <item trans="výstava" src="вы́ставка" trans_en="exhibition"/>
      <item trans="předrevoluční"
            src="дореволюциóнный (-ая, -ое)"
            trans_en="pre-revolutionary"/>
      <item trans="objednávat" src="закáзывать" trans_en="order"/>
      <item trans="objednat"
            src="заказáть (закажý, закáжешь, закáжут)"
            trans_en="order"/>
      <item trans="sloup, pilíř" src="колóнна" trans_en="pillar"/>
      <item trans="lupa" src="лýпа" trans_en="magnifying glass"/>
      <item trans="(s) ním" src="(с) ним" trans_en="(with) him"/>
      <item trans="opožďovat se"
            src="опáздывать"
            trans_en="to run late (imperfective)"/>
      <item trans="opozdit se"
            src="опоздáть"
            trans_en="to run late (perfective)"/>
      <item trans="promluvit si"
            src="поговори́ть"
            trans_en="to have a talk (perfective)"/>
      <item trans="dovolovat"
            src="позволя́ть"
            trans_en="to permit, to allow (imperfective)"/>
      <item trans="dovolit"
            src="позвóлить (позвóлю, позвóлишь, позвóлят)"
            trans_en="allow"/>
      <item trans="pomoc" src="пóмощь (f.)" trans_en="help"/>
      <item trans="poutač, stánek" src="стенд" trans_en="placard, stand"/>
      <item trans="stoleček" src="стóлик" trans_en="little table"/>
      <item trans="a to" src="а то" trans_en="namely"/>
      <item trans="jedinečný (-á, -é)"
            src="уникáльный (-ая, -ое)"
            trans_en="unique"/>
      <item trans="přenechávat, slevovat, ustupovat"
            src="уступáть"
            trans_en="to leave, to back away (imperfective)"/>
      <item trans="přenechat, slevit, ustoupit"
            src="уступи́ть (уступлю́, устýпишь, устýпят)"
            trans_en="to leave, to back away (perfective)"/>
      <item trans="umělec" src="худóжник" trans_en="artist"/>
      <item trans="částečně" src="части́чно" trans_en="partially"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson2/ChapterA/lekce09_1_cz.xml">
      <item trans="východ" src="востóк" trans_en="east"/>
      <item trans="žádost, oznámení" src="заявлéние" trans_en="request, notice"/>
      <item trans="les (v lese)"
            src="лес (в лесý)"
            trans_en="forest (in the forest)"/>
      <item trans="let (2.pád.mn.č.)"
            src="лет (gen. pl.)"
            trans_en="flight (plural genitive)"/>
      <item trans="touha" src="мечтá" trans_en="longing"/>
      <item trans="moře" src="мóре" trans_en="sea"/>
      <item trans="musí se, mělo by se"
            src="нáдо"
            trans_en="must be, should be"/>
      <item trans="nedaleko" src="недалекó" trans_en="not far away"/>
      <item trans="platit" src="оплáчивать" trans_en="pay"/>
      <item trans="zaplatit"
            src="оплати́ть (оплачý, оплáтишь, оплáтят)"
            trans_en="to pay (perfective)"/>
      <item trans="opět" src="опя́ть" trans_en="again"/>
      <item trans="od" src="от (+ gen.)" trans_en="since"/>
      <item trans="psát/napsat"
            src="написáть (напишý, напи́шешь, напи́шут)"
            trans_en="to write (imperfective/perfective)"/>
      <item trans="místenkový vůz"
            src="плацкáртный вагóн"
            trans_en="a car with seat reservations"/>
      <item trans="trávit (čas)"
            src="проводи́ть (провожý, провóдишь, провóдят) (врéмя)"
            trans_en="to spend time (imperfective)"/>
      <item trans="strávit (čas)"
            src="провести́ (проведý, проведёшь, проведýт)"
            trans_en="to spend time (perfective)"/>
      <item trans="odborový svaz"
            src="профсою́з, профессионáльный сою́з"
            trans_en="trade union"/>
      <item trans="řeka" src="рекá" trans_en="river"/>
      <item trans="letadlo" src="самолёт" trans_en="aircraft"/>
      <item trans="strana" src="сторонá" trans_en="side"/>
      <item trans="24 hodín" src="сýтки (pl.)" trans_en="24 hours"/>
      <item trans="troje, tři" src="трóе" trans_en="three pair, three"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson2/ChapterA/lekce09_2_cz.xml">
      <item trans="Německo" src="Гермáния" trans_en="Germany"/>
      <item trans="dávat" src="давáть (даю́, даёшь, даю́т)" trans_en="to give"/>
      <item trans="dát"
            src="дать (дам, дашь, даст, дади́м, дади́тe, дадýт)"
            trans_en="give"/>
      <item trans="dvoutisící"
            src="двухты́сячный (-ая, -ое)"
            trans_en="two thousandth"/>
      <item trans="dcerka" src="дóчка" trans_en="daughter"/>
      <item trans="ní (2.pád), její" src="её" trans_en="her (genitive)"/>
      <item trans="moci" src="мочь (могý, мóжешь, мóгут)" trans_en="can"/>
      <item trans="moci" src="смочь (смогý, смóжешь, смóгут)" trans_en="can"/>
      <item trans="počáteční, základní"
            src="начáльный (-ая, -ое)"
            trans_en="initial, basic"/>
      <item trans="nikam" src="никудá" trans_en="nowhere"/>
      <item trans="oba, obě" src="óба, óбе (f.)" trans_en="both"/>
      <item trans="překlad" src="перевóд" trans_en="translation"/>
      <item trans="cesta" src="поéздка" trans_en="a road"/>
      <item trans="vyučovat"
            src="преподавáть (преподаю́, преподаёшь, преподаю́т)"
            trans_en="to teach (imperfective)"/>
      <item trans="pátý (-á, -é)" src="пя́тый (-ая, -ое)" trans_en="fifth"/>
      <item trans="Sasko" src="Саксóния" trans_en="Saxony"/>
      <item trans="na vlastní oči"
            src="свои́ми глазáми"
            trans_en="in one's own eyes"/>
      <item trans="stát (peníze)"
            src="стóить (стóю, стóишь, стóят)"
            trans_en="to cost"/>
      <item trans="země" src="странá" trans_en="country"/>
      <item trans="přes" src="чéрез (+ akuz.)" trans_en="over"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson2/ChapterB/lekce09_3_cz.xml">
      <item trans="stávkovat"
            src="бастовáть (бастýю, бастýешь, бастýют)"
            trans_en="to strike (imperfective)"/>
      <item trans="zahájit stávku"
            src="забастовáть (забастýю, забастýешь, забастýют)"
            trans_en="to go on strike"/>
      <item trans="namiesto (čeho)"
            src="вмéсто"
            trans_en="instead (of something)"/>
      <item trans="neděle" src="воскресéнье" trans_en="Sunday"/>
      <item trans="lékař" src="врач" trans_en="doctor"/>
      <item trans="stávka" src="забастóвка" trans_en="strike"/>
      <item trans="zapomínat" src="забывáть" trans_en="forget"/>
      <item trans="zapomenout"
            src="забы́ть (забýду, забýдешь, забýдут)"
            trans_en="to forget (perfective)"/>
      <item trans="zdráv (-a, -o, -i)"
            src="здорóв (-а, -о, -ы)"
            trans_en="healthy"/>
      <item trans="(to je) škoda" src="жаль" trans_en="(that is) too bad"/>
      <item trans="živ (-a, -o, -i)" src="жив (-á, -о, -ы)" trans_en="alive"/>
      <item trans="mít" src="имéть" trans_en="have"/>
      <item trans="není možné" src="невозмóжно" trans_en="not possible"/>
      <item trans="zprávy" src="нóвости" trans_en="news"/>
      <item trans="slib" src="обещáние" trans_en="promise"/>
      <item trans="slibovat" src="обещáть" trans_en="to promise (imperfective)"/>
      <item trans="přislíbit" src="пообещáть" trans_en="to make a promise"/>
      <item trans="platit"
            src="плати́ть (плачý, плáтишь, плáтят)"
            trans_en="pay"/>
      <item trans="zaplatit"
            src="заплати́ть (заплачý, заплáтишь, заплáтят)"
            trans_en="to pay (perfective)"/>
      <item trans="zatím" src="покá" trans_en="while"/>
      <item trans="představa" src="представлéние" trans_en="idea"/>
      <item trans="přivážet, dovážet"
            src="привози́ть (привожý, привóзишь, привóзят)"
            trans_en="to bring, to import (imperfective)"/>
      <item trans="přivézt, dovézt"
            src="привезти́ (привезý, привезёшь, привезýт)"
            trans_en="to bring, to import (perfective)"/>
      <item trans="učitel" src="учи́тель (m.)" trans_en="teacher"/>
      <item trans="horník" src="шахтёр" trans_en="miner"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson2/ChapterB/lekce09_4_cz.xml">
      <item trans="vrátit"
            src="вернýть (вернý, вернёшь, вернýт)"
            trans_en="to return (perfective)"/>
      <item trans="vzpomínat"
            src="вспоминáть"
            trans_en="to recall, to remember (imperfective)"/>
      <item trans="vzpomenout si"
            src="вспóмнить (вспóмню, вспóмнишь, вспóминят)"
            trans_en="to recall, to remember (perfective)"/>
      <item trans="dluh" src="долг" trans_en="debt"/>
      <item trans="jednodenní" src="одноднéвный (-ая, -ое)" trans_en="one-day"/>
      <item trans="dopis" src="письмó" trans_en="letter"/>
      <item trans="jak se máš?" src="как поживáешь?" trans_en="How are you?"/>
      <item trans="zůstávat"
            src="оставáться (остаю́сь, остаёшься, остаю́тся)"
            trans_en="to remain"/>
      <item trans="zůstat"
            src="остáться (остáнусь, остáнешься, остáнутся)"
            trans_en="stay"/>
      <item trans="zabezpečovat zbožím"
            src="отовáривать"
            trans_en="to provision with goods (imperfective)"/>
      <item trans="zabezpečit zbožím"
            src="отовáрить (отовáрю, отовáришь, отовáрят)"
            trans_en="to provision with good (perfective)"/>
      <item trans="piš" src="пиши́" trans_en="writer"/>
      <item trans="chápání" src="понимáние" trans_en="understanding"/>
      <item trans="pravda" src="прáвда" trans_en="truth"/>
      <item trans="vláda" src="прави́тельство" trans_en="government"/>
      <item trans="mezi" src="среди́ (+ gen.)" trans_en="in between"/>
      <item trans="je hanba" src="сты́дно" trans_en="that is a shame"/>
      <item trans="sem" src="сюдá" trans_en="here"/>
      <item trans="ten, ta, to"
            src="тот, та, то"
            trans_en="that (masc., fem., neut.)"/>
      <item trans="uvidět se"
            src="уви́деться (уви́жусь, уви́дишься, уви́дятся)"
            trans_en="to see one another (perfective)"/>
      <item trans="učebnice" src="учéбник" trans_en="text book"/>
      <item trans="učit se"
            src="учи́ться (учýсь, ýчишься, ýчатся)"
            trans_en="to learn, to study (imperfective)"/>
      <item trans="naučit se"
            src="научи́ться (научýсь, наýчишься, наýчатся)"
            trans_en="to learn"/>
      <item trans="postačovat"
            src="хватáть"
            trans_en="to suffice (imperfective)"/>
      <item trans="stačit"
            src="хвати́ть (хвачý, хвáтишь, хвáтят)"
            trans_en="to suffice (perfective)"/>
      <item trans="často" src="чáсто" trans_en="often"/>
      <item trans="šek, kupon" src="чек" trans_en="cheque, voucher"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson2/ChapterC/lekce09_5_cz.xml">
      <item trans="většina" src="большинствó" trans_en="majority"/>
      <item trans="uvnitř" src="внутри́ (+ gen.)" trans_en="inside"/>
      <item trans="devátý (-á, -é)" src="девя́тый (-ая, -ое)" trans_en="ninth"/>
      <item trans="skutečnost" src="действи́тельность (f.)" trans_en="reality"/>
      <item trans="leninský (-á, -é)"
            src="лéнинский (-ая, -ое)"
            trans_en="Leninist"/>
      <item trans="meziměstský (-á, -é)"
            src="междугорóдный (-ая, -ое)"
            trans_en="long-distance"/>
      <item trans="nacházet se"
            src="находи́ться (нахожýсь, нахóдишься, нахóдятся)"
            trans_en="to find oneself (imperfective)"/>
      <item trans="potřebný (-á, -é)"
            src="нýжный (-ая, -ое)"
            trans_en="necessary"/>
      <item trans="odpojen (-a, -o)"
            src="отключён (отключена́, отключенó)"
            trans_en="disconnected"/>
      <item trans="hovorna" src="переговóрный пункт" trans_en="call office"/>
      <item trans="pomáhat" src="помогáть" trans_en="help"/>
      <item trans="pomoci"
            src="помóчь (помогý, помóжешь, помóгут)"
            trans_en="to help (perfective)"/>
      <item trans="průvodčí" src="проводни́к" trans_en="conductor"/>
      <item trans="síť" src="сеть (f.)" trans_en="network"/>
      <item trans="sen" src="сон" trans_en="dream"/>
      <item trans="čtvrtý (-á, -é)"
            src="четвёртый (-ая, -ое)"
            trans_en="fourth"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson3/ChapterA/lekce10_1_cz.xml">
      <item trans="najednou" src="вдруг" trans_en="all of a sudden"/>
      <item trans="v zimě" src="зимóй" trans_en="in winter"/>
      <item trans="seznamovat se"
            src="знакóмиться (знакóмлюсь, знакóмишься, знакóмятся)"
            trans_en="to get to know (imperfective)"/>
      <item trans="seznámit se"
            src="познакóмиться (познакóмлюсь, познакóмишься, познакóмятся)"
            trans_en="to get to know (perfective)"/>
      <item trans="mladý (-á, -é)" src="молодóй (-áя, -óе)" trans_en="young"/>
      <item trans="neznámý (-á, -é)"
            src="незнакóмый (-ая, -ое)"
            trans_en="unknown"/>
      <item trans="plakat"
            src="плáкать (плáчу, плáчешь, плáчут)"
            trans_en="to cry (imperfective)"/>
      <item trans="přicházet, přistupovat"
            src="подходи́ть (подхожý, подхóдишь, подхóдят)"
            trans_en="to come, to approach (imperfective)"/>
      <item trans="přijít, přistoupit"
            src="подойти́ (подойдý, подойдёшь, подойдýт)"
            trans_en="to come, to approach (perfective)"/>
      <item trans="pamatovat si"
            src="пóмнить (пóмню, пóмнишь, пóмнят)"
            trans_en="to remember (imperfective)"/>
      <item trans="pořádek" src="поря́док" trans_en="order"/>
      <item trans="chtít se" src="хотéться" trans_en="want, fee like"/>
      <item trans="chce se mi" src="мне хóчется" trans_en="I feel like"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson3/ChapterA/lekce10_2_cz.xml">
      <item trans="atomová elektrárna"
            src="АЭС, А́томная Электри́ческая Стáнция"
            trans_en="nuclear power plant"/>
      <item trans="vedle" src="вóзле" trans_en="beside/next to/alongside"/>
      <item trans="otázka" src="вопрóс" trans_en="question"/>
      <item trans="schůzka" src="встрéча" trans_en="meeting"/>
      <item trans="vyrůstat"
            src="вырастáть"
            trans_en="to grow up (imperfective)"/>
      <item trans="vyrůst"
            src="вы́расти (вы́расту, вы́растешь, вы́растут, вы́рос, вы́росла)"
            trans_en="to grow up (perfective)"/>
      <item trans="dělat" src="дéлать" trans_en="do"/>
      <item trans="udělat" src="сдéлать" trans_en="to do, to make (perfective)"/>
      <item trans="přítel" src="друг" trans_en="friend"/>
      <item trans="zapamatovávat si"
            src="запоминáть"
            trans_en="to remember (imperfective)"/>
      <item trans="zapamatovat si"
            src="запóмнить (запóмню, запóмнишь, запóмнят)"
            trans_en="to remember (perfective)"/>
      <item trans="léto" src="лéто" trans_en="summer"/>
      <item trans="obličej" src="лицó" trans_en="face"/>
      <item trans="jen" src="лишь" trans_en="only"/>
      <item trans="trochu" src="немнóжко" trans_en="a little"/>
      <item trans="oblast" src="óбласть (f.)" trans_en="area"/>
      <item trans="společnost, obec" src="общи́на" trans_en="community"/>
      <item trans="jedenáctiletý (-á, -é)"
            src="одиннадцатилéтний (-яя, -ее)"
            trans_en="eleven-year-old"/>
      <item trans="dovolená, oddech" src="óтдых" trans_en="vacation, break"/>
      <item trans="pitný (-á, -é)"
            src="питьевóй (-áя, -óе)"
            trans_en="potable, drinking (adj.)"/>
      <item trans="zvýšený" src="повы́шенный (-ая, -oе)" trans_en="elevated"/>
      <item trans="pole" src="пóле" trans_en="field"/>
      <item trans="pravda" src="прáвда" trans_en="truth"/>
      <item trans="dávat k dispozici"
            src="предоставля́ть"
            trans_en="to make available (imperfective)"/>
      <item trans="dát k dispozici"
            src="предостáвить (предостáвлю, предостáвишь, предостáвят)"
            trans_en="to make available (perfective)"/>
      <item trans="zvykat si"
            src="привыкáть"
            trans_en="to get accustomed (imperfective)"/>
      <item trans="zvyknout si"
            src="привы́кнуть (привы́кну, привы́кнешь, привы́кнут)"
            trans_en="to get accustomed (perfective)"/>
      <item trans="posílat, vysílat"
            src="присылáть"
            trans_en="to send (imperfective)"/>
      <item trans="poslat, vyslat"
            src="прислáть (пришлю́, пришлёшь, пришлю́т)"
            trans_en="to send (perfective)"/>
      <item trans="radiace" src="радиáция" trans_en="radiation"/>
      <item trans="kněz" src="свящéнник" trans_en="priest"/>
      <item trans="Díky Bohu!" src="Слáва Бóгу!" trans_en="Thank God!"/>
      <item trans="vlastní" src="сóбствeнный (-ая, -ое)" trans_en="own"/>
      <item trans="starší" src="стáрший (-ая, -ее)" trans_en="older"/>
      <item trans="zvláštní" src="стрáнный (-ая, -ое)" trans_en="peculiar"/>
      <item trans="hrozně, strašně" src="стрáшно" trans_en="terribly, horribly"/>
      <item trans="ten, ta, to"
            src="тот, та, то"
            trans_en="that (masc., fem., neut.)"/>
      <item trans="chtělo se (mi)" src="(мне) хoтéлось" trans_en="I felt like"/>
      <item trans="církevní"
            src="церкóвный (-ая, -ое)"
            trans_en="church (adj.)"/>
      <item trans="čtvery, čtyři" src="чéтверо" trans_en="four pair, four"/>
      <item trans="pocit" src="чýвство" trans_en="to honour"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson3/ChapterB/lekce10_3_cz.xml">
      <item trans="by" src="бы" trans_en="would"/>
      <item trans="je důležité" src="вáжно" trans_en="is important"/>
      <item trans="trochu" src="немнóго" trans_en="a little"/>
      <item trans="rozhovor" src="разговóр" trans_en="dialogue"/>
      <item trans="doprovázet"
            src="провожáть"
            trans_en="accompany (imperfective)"/>
      <item trans="doprovodit"
            src="проводи́ть (провожý, провóдишь, провóдят)"
            trans_en="accompany (perfective)"/>
      <item trans="dovolovat"
            src="разрешáть"
            trans_en="to permit, to allow (imperfective)"/>
      <item trans="dovolit"
            src="разреши́ть (разрешý, разреши́шь, разрешáт)"
            trans_en="allow"/>
      <item trans="dávat souhlas"
            src="соглашáться"
            trans_en="to give consent (imperfective)"/>
      <item trans="dát souhlas"
            src="согласи́ться (соглашýсь, согласи́шься, соглася́тся)"
            trans_en="to give consent (perfective)"/>
      <item trans="cítit (se)"
            src="чýвствовать (себя́) (чýвствую, чýвствуешь, чýвствуют)"
            trans_en="to feel (imperfective)"/>
      <item trans="pocítit"
            src="почýвствовать (почýвствую, почýвствуешь, почýвствуют)"
            trans_en="to feel (perfective)"/>
      <item trans="aby" src="чтóбы" trans_en="in order that"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson3/ChapterB/lekce10_4_cz.xml">
      <item trans="vzpomínka" src="воспоминáние" trans_en="memory"/>
      <item trans="smutno" src="грýстно" trans_en="sad (adverb)"/>
      <item trans="dlužník" src="должни́к" trans_en="debtor"/>
      <item trans="živý, čilý" src="живóй (-áя, -óе)" trans_en="alive, lively"/>
      <item trans="proč" src="зачéм" trans_en="why"/>
      <item trans="upřímně" src="и́скрeнне" trans_en="frankly"/>
      <item trans="použít, používat"
            src="испóльзовать (испóльзую, испóльзуешь, испóльзуют)"
            trans_en="to use"/>
      <item trans="zkoušet, pociťovat"
            src="испы́тывать (испы́тываю, испы́тываешь, испы́тывают)"
            trans_en="to try, to feel (imperfective)"/>
      <item trans="zkusit, pocítit"
            src="испыта́ть (испыта́ю, испыта́ешь, испыта́ют)"
            trans_en="to try, to feel (perfective)"/>
      <item trans="nějak" src="как-то" trans_en="somehow"/>
      <item trans="lehčeji" src="лéгче" trans_en="lightly"/>
      <item trans="je nutno" src="нýжно" trans_en="it is necessary"/>
      <item trans="odpovídat (průběžně)"
            src="отвечáть"
            trans_en="to respond, to reply (imperfective)"/>
      <item trans="odpovědět"
            src="отвéтить (отвéчу, отвéтишь, отвéтят)"
            trans_en="to respond, to reply (perfective)"/>
      <item trans="plně, zcela" src="пóлностью" trans_en="fully, entirely"/>
      <item trans="pochod, túra" src="похóд" trans_en="hike"/>
      <item trans="lnout, získávat náklonost"
            src="привя́зываться"
            trans_en="to cling, to be attached (imperfective)"/>
      <item trans="přilnout"
            src="привязáться (привяжýсь, привя́жешься, привя́жутся)"
            trans_en="to cling, to be attached (perfective)"/>
      <item trans="různý (-á, -é)" src="рáзный (-ая, -ое)" trans_en="diverse"/>
      <item trans="složitý (-á, -é)"
            src="слóжный (-ая, -ое)"
            trans_en="complicated"/>
      <item trans="stávat se"
            src="станoви́ться (становлю́сь, станóвишься, станóвятся)"
            trans_en="to happen (imperfective)"/>
      <item trans="stát se"
            src="стать (стáнy, стáнешь, стáнут)"
            trans_en="to become"/>
      <item trans="ostýchat se, být v rozpacích"
            src="стесня́ться"
            trans_en="to be embarrassed (imperfective)"/>
      <item trans="dostat se do rozpaků"
            src="постесня́ться"
            trans_en="to be embarrassed (perfective)"/>
      <item trans="účet" src="счёт" trans_en="bill"/>
      <item trans="odjíždět" src="уезжáть" trans_en="to depart (imperfective)"/>
      <item trans="odjet"
            src="уéхать (уéду, уéдешь, уéдут)"
            trans_en="to leave"/>
      <item trans="část" src="часть (f.)" trans_en="part"/>
      <item trans="jasně" src="я́сно" trans_en="clearly"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson3/ChapterC/lekce10_6_cz.xml">
      <item trans="duše" src="душá" trans_en="soul"/>
      <item trans="přirozeně, samozřejmě"
            src="естéственно"
            trans_en="naturally, as a matter of fact"/>
      <item trans="předem" src="зарáнее" trans_en="in advance"/>
      <item trans="cizinec" src="инострáнец" trans_en="foreigner"/>
      <item trans="kořen" src="кóрень (m.)" trans_en="root"/>
      <item trans="určovat"
            src="назначáть"
            trans_en="to determine (imperfective)"/>
      <item trans="určit, naznačit"
            src="назнáчить (назнáчу, назнáчишь, назнáчат)"
            trans_en="to determine (perfective)"/>
      <item trans="objetí" src="объя́тие" trans_en="embrace"/>
      <item trans="otevřený (-á, -é)"
            src="откры́тый (-ая, -ое)"
            trans_en="open"/>
      <item trans="rozdělit se"
            src="подели́ться (поделю́сь, подéлишься, подéлятся)"
            trans_en="to share (perfective)"/>
      <item trans="jednodušeji" src="попрóще" trans_en="simpler"/>
      <item trans="slavit"
            src="прáздновать (прáздную, прáзднуешь, прáзднуют)"
            trans_en="to celebrate"/>
      <item trans="přesně" src="тóчно" trans_en="precisely"/>
      <item trans="cizí" src="чужóй (-áя, -óе)" trans_en="strange, foreign"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson4/ChapterA/lekce11_1_cz.xml">
      <item trans="akcie" src="áкция" trans_en="share"/>
      <item trans="sdružení, svaz"
            src="ассоциáция"
            trans_en="association, union"/>
      <item trans="vysoká škola"
            src="вуз, вы́сшее учéбное заведéние"
            trans_en="university"/>
      <item trans="je výhodné" src="вы́годно" trans_en="is advantageous"/>
      <item trans="státní"
            src="госудáрственный (-ая, -ое)"
            trans_en="state, government (adj.)"/>
      <item trans="smlouva" src="договóр" trans_en="agreement"/>
      <item trans="euroasijský (-á, -é)"
            src="еврази́йский (-ая, -ое)"
            trans_en="Eurasian"/>
      <item trans="ústav, zařízení, instituce"
            src="заведéние"
            trans_en="institute"/>
      <item trans="zahraniční" src="инострáнный (-ая, -ое)" trans_en="foreign"/>
      <item trans="komu?" src="комý?" trans_en="to whom?, for whom?"/>
      <item trans="mezi" src="мéжду (+ instr.)" trans_en="in between"/>
      <item trans="vědecký (-á, -é)"
            src="наýчный (-ая, -ое)"
            trans_en="scientific"/>
      <item trans="reputace" src="репутáция" trans_en="reputation"/>
      <item trans="přijímat, brát"
            src="принимáть"
            trans_en="to accept (imperfective)"/>
      <item trans="přijmout, vzít"
            src="приня́ть (примý, при́мешь, при́мут)"
            trans_en="to accept (perfective)"/>
      <item trans="zúčastnit se"
            src="приня́ть учáстие"
            trans_en="to take part (perfective)"/>
      <item trans="spolupracovat"
            src="сотрýдничать"
            trans_en="to cooperate (imperfective)"/>
      <item trans="spolupráce" src="сотрýдничество" trans_en="cooperation"/>
      <item trans="seznam" src="спи́сок" trans_en="list"/>
      <item trans="společný (-á, -é)"
            src="совмéстный (-ая, -ое)"
            trans_en="joint, common, shared"/>
      <item trans="existovat" src="существовáть" trans_en="to exist"/>
      <item trans="účast" src="учáстие" trans_en="participation"/>
      <item trans="učební" src="учéбный (-ая, -ое)" trans_en="teaching"/>
      <item trans="člen" src="член" trans_en="article"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson4/ChapterA/lekce11_2_cz.xml">
      <item trans="soubor (umělecký)" src="ансáмбль (m.)" trans_en="ensemble"/>
      <item trans="nemocnice" src="больни́ца" trans_en="hospital"/>
      <item trans="cyklistický závod" src="велопробéг" trans_en="cycling race"/>
      <item trans="jezdit" src="éздить (éзжу, éздишь, éздят)" trans_en="to go"/>
      <item trans="humanitní, humanitární"
            src="гуманитáрный (-ая, -ое)"
            trans_en="humanitarian"/>
      <item trans="nakladatelství"
            src="издáтельство"
            trans_en="publishing house"/>
      <item trans="amatérský (-á -é)"
            src="люби́тельский (-ая, -ое)"
            trans_en="amateur"/>
      <item trans="obvyklý (-á, -é)"
            src="обыкновéнный (-ая, -ое)"
            trans_en="usual"/>
      <item trans="organizovat"
            src="организóвывать"
            trans_en="to organise (imperfective)"/>
      <item trans="zorganizovat"
            src="организовáть (организýю, организýeшь, организýют)"
            trans_en="to organise (perfective)"/>
      <item trans="partnerství" src="партнёрство" trans_en="partnership"/>
      <item trans="partnerský (á, -é)"
            src="партнёрский (-ая, -ое)"
            trans_en="partnership (adj.)"/>
      <item trans="užitek, prospěch" src="пóльза" trans_en="use, benefit"/>
      <item trans="spořitelna" src="сберкáсса" trans_en="savings bank"/>
      <item trans="soutěž" src="соревновáние" trans_en="competition"/>
      <item trans="sportovní"
            src="спорти́вный (-ая, -ое)"
            trans_en="sport (adj.)"/>
      <item trans="žák" src="шкóльник" trans_en="pupil, student"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson4/ChapterB/lekce11_3_cz.xml">
      <item trans="vaudeville, opereta, zpěvohra"
            src="водеви́ль (m.)"
            trans_en="vaudeville, light opera"/>
      <item trans="setkávat se"
            src="встречáться"
            trans_en="to meet, to encounter (imperfective)"/>
      <item trans="setkat se"
            src="встрéтиться (встрéчусь, встрéтишься, встрéтятся)"
            trans_en="to meet, to encounter (perfective)"/>
      <item trans="dojem" src="впечатлéние" trans_en="impression"/>
      <item trans="v průběhu" src="в течéние" trans_en="during"/>
      <item trans="připravovat"
            src="готóвить (готóвлю, готóвишь, готóвят)"
            trans_en="to prepare (imperfective)"/>
      <item trans="divák" src="зри́тель (m.)" trans_en="viewer"/>
      <item trans="amatér" src="люби́тель (m.)" trans_en="amateur"/>
      <item trans="nijak (ne)" src="никáк (не)" trans_en="in no way"/>
      <item trans="vyměňovat si"
            src="обмéниваться (обмéниваюсь, обмéниваешься, обмéниваются)"
            trans_en="to exchange (imperfective)"/>
      <item trans="vyměnit si"
            src="обменя́ться (обменя́юсь, обменя́ешься, обменя́ются)"
            trans_en="to exchange (perfective)"/>
      <item trans="připravit"
            src="подготóвить (подготóвлю, подготóвишь, подготóвят)"
            trans_en="to prepare (perfective)"/>
      <item trans="postarší" src="пожилóй (-áя, -óе)" trans_en="older"/>
      <item trans="podobný (-á, -é) (komu)"
            src="похóжий (-ая, -ое) (на)"
            trans_en="similar"/>
      <item trans="svatba" src="свáдьба" trans_en="wedding"/>
      <item trans="projevit se"
            src="сказáться (скáжется, скáжутся)"
            trans_en="to manifest, to show (perfective)"/>
      <item trans="konat se"
            src="состоя́ться (состою́сь, состои́шься, состоя́тся)"
            trans_en="to take place"/>
      <item trans="tvůrčí" src="твóрческий (-ая, -ое)" trans_en="creative"/>
      <item trans="milovník divadla" src="театрáл" trans_en="theatre lover"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson4/ChapterB/lekce11_4_cz.xml">
      <item trans="papír" src="бумáга" trans_en="paper"/>
      <item trans="bývalý (-á, -é)" src="бы́вший (-ая, -ее)" trans_en="former"/>
      <item trans="cyklista" src="велосипеди́ст" trans_en="cyclist"/>
      <item trans="cyklistický"
            src="велосипéдный (-ая, -ое)"
            trans_en="cycling"/>
      <item trans="věřit" src="вéрить" trans_en="to believe"/>
      <item trans="uvěřit" src="повéрить" trans_en="to believe (perfective)"/>
      <item trans="(oficiální) návštěva"
            src="визи́т"
            trans_en="(official) visit"/>
      <item trans="hluboký (-á, -é)" src="глубóкий (-ая, -ое)" trans_en="deep"/>
      <item trans="mnohem" src="горáздо" trans_en="much"/>
      <item trans="desetiletí" src="десятилéтие" trans_en="decade"/>
      <item trans="džudista" src="дзюдои́ст" trans_en="judoist"/>
      <item trans="cestička" src="дорóжка" trans_en="path"/>
      <item trans="přátelit se (s)"
            src="дружи́ться (с) (дружýсь, дрýжишься, дрýжатся)"
            trans_en="to make friends (imperfective)"/>
      <item trans="jediný (-á, -é)"
            src="еди́ный (-ая, -ое)"
            trans_en="the only"/>
      <item trans="zástupce" src="замести́тель (m.)" trans_en="representative"/>
      <item trans="vědět" src="знать" trans_en="know"/>
      <item trans="dovědět se" src="узнать" trans_en="to learn (perfective)"/>
      <item trans="plnit se, uskutečňovat se"
            src="исполня́ться"
            trans_en="to fulfil, to happen (imperfective)"/>
      <item trans="splnit se, uskutečnit se"
            src="испóлнится (испóлнюсь, испóлнишься, испóлнятся)"
            trans_en="to fulfil, to happen (perfective)"/>
      <item trans="kromě" src="крóме (+ gen.)" trans_en="except for"/>
      <item trans="osobně" src="ли́чно" trans_en="personally"/>
      <item trans="dílna, ateliér" src="мастерскáя" trans_en="workshop, studio"/>
      <item trans="mnohonárodnostní"
            src="многонационáльный (-ая, -ое)"
            trans_en="multinational"/>
      <item trans="starosta" src="мэр" trans_en="mayor"/>
      <item trans="nikde" src="нигдé" trans_en="nowhere"/>
      <item trans="zkušený (-á, -é)"
            src="óпытный (-ая, -ое)"
            trans_en="experienced"/>
      <item trans="Orlovci" src="орлóвцы" trans_en="the Orlovs"/>
      <item trans="pocit" src="ощущéние" trans_en="to honour"/>
      <item trans="pobýt" src="побывáть" trans_en="to stay"/>
      <item trans="z důvodu" src="по пóвoду" trans_en="due to"/>
      <item trans="opouštět" src="покидáть" trans_en="to leave (imperfective)"/>
      <item trans="opustit"
            src="поки́нуть (поки́ну, поки́нешь, поки́нут)"
            trans_en="to leave (perfective)"/>
      <item trans="zasahovat, překvapovat"
            src="поражáть"
            trans_en="to surprise (imperfective)"/>
      <item trans="zasáhnout, překvapit"
            src="порази́тъ (поражý, порази́шь, поразя́т)"
            trans_en="to surprise (perfective)"/>
      <item trans="poslední" src="послéдний (-яя, -ее)" trans_en="last"/>
      <item trans="předseda" src="председáтель (m.)" trans_en="chairman"/>
      <item trans="dělat, vyrábět, vyvolávat"
            src="производи́ть"
            trans_en="to make (imperfective)"/>
      <item trans="udělat, vyrobit, vyvolat"
            src="произвести́ (произведý, произведёшь, произведýт)"
            trans_en="to make (perfective)"/>
      <item trans="ráj" src="рай" trans_en="paradise"/>
      <item trans="samotný (-á, -é)" src="сáмый (-ая, -ое)" trans_en="alone"/>
      <item trans="sportovec" src="спoртсмéн" trans_en="athlete, sportsman"/>
      <item trans="spřátelit se"
            src="сдрyжи́ться"
            trans_en="to befriend (perfective)"/>
      <item trans="televíze" src="телеви́дение" trans_en="television"/>
      <item trans="zde" src="тут" trans_en="here"/>
      <item trans="účastník" src="учáстник" trans_en="participant"/>
      <item trans="žákyně" src="учени́ца" trans_en="female student"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson4/ChapterC/lekce11_5_cz.xml">
      <item trans="bankovní" src="бáнковский (-ая, -ое)" trans_en="bank (adj.)"/>
      <item trans="valutový (-á, -é)"
            src="валю́тный (-ая, -ое)"
            trans_en="foreign currency (adj.)"/>
      <item trans="mezinárodní den spoření"
            src="всеми́рный день сбережéний"
            trans_en="International Day of Savings"/>
      <item trans="pohostinný (-á, -é)"
            src="гостеприи́мный (-ая, -ое)"
            trans_en="hospitable"/>
      <item trans="zabývat se"
            src="занимáться"
            trans_en="to occupy, to engage in (imperfective)"/>
      <item trans="zabavit se, zaměstnat se"
            src="заня́ться (займýсь, займёшься, займýтся)"
            trans_en="to occupy oneself (perfective)"/>
      <item trans="potom" src="затéм" trans_en="afterwards"/>
      <item trans="kapesní" src="кармáнный (-ая, -ое)" trans_en="pocket (adj.)"/>
      <item trans="pokladnička" src="копи́лка" trans_en="money box"/>
      <item trans="měl jsem štěstí" src="мне повезлó" trans_en="I was lucky"/>
      <item trans="mnozí" src="мнóгие" trans_en="many"/>
      <item trans="obracet se"
            src="обращáться"
            trans_en="to turn (imperfective)"/>
      <item trans="obrátit se"
            src="обрати́ться (обрашýсь, обрати́шься, обратя́тся)"
            trans_en="to turn (perfective)"/>
      <item trans="oddělení" src="отдéл" trans_en="department"/>
      <item trans="stravování, zásobování"
            src="питáние"
            trans_en="dining, provisioning"/>
      <item trans="dostávat se"
            src="поступáть"
            trans_en="to get (imperfective)"/>
      <item trans="dostat se"
            src="поступи́ть (поступлю́, постýпишь, постýпят)"
            trans_en="to get (perfective)"/>
      <item trans="vymýšlet si, vynalézat"
            src="придýмывать"
            trans_en="to invent (imperfective)"/>
      <item trans="vymyslet si, vynalézt"
            src="придýмать"
            trans_en="to invent (perfective)"/>
      <item trans="výpočetní"
            src="расчётный (-ая, -ое)"
            trans_en="calculation (adj.)"/>
      <item trans="spořitelní"
            src="с6ерегáтeлъный (-ая, -ое)"
            trans_en="pertaining to a savings company"/>
      <item trans="nudit se, stýskat si (po kom)"
            src="скучáтъ"
            trans_en="to be bored, to miss (imperfective)"/>
      <item trans="složitě" src="слóжно" trans_en="complicatedly"/>
      <item trans="učiliště"
            src="учи́лище"
            trans_en="secondary vocational school"/>
      <item trans="jazykový (-á, -é)"
            src="языковóй (-áя, -óе)"
            trans_en="language, linguistic (adj.)"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson5/ChapterA/lekce12_1_cz.xml">
      <item trans="znepokojovat, obtěžovat"
            src="беспокóить (беспокóю, беспокóишь, беспокóят)"
            trans_en="to worry, to concern (imperfective)"/>
      <item trans="přátelství" src="дрýжба" trans_en="friendship"/>
      <item trans="uzavřen (-a, -o)"
            src="заключён (-енá, -енó)"
            trans_en="closed"/>
      <item trans="výjimka" src="исключéние" trans_en="exception"/>
      <item trans="nestabilita"
            src="нестаби́льность (f.)"
            trans_en="instability"/>
      <item trans="zvláštní, mimořádný"
            src="осóбый (-ая, -ое)"
            trans_en="special, extraordinary"/>
      <item trans="podepsán (-a, -o)"
            src="подпи́сан (-а, -о)"
            trans_en="signed"/>
      <item trans="postaven (-a, -o)" src="пострóен (-а, -о)" trans_en="built"/>
      <item trans="příjemný (-á, -é)"
            src="прия́тный (-ая, -ое)"
            trans_en="pleasant"/>
      <item trans="ruský (-á, -é)"
            src="росси́йский (-ая, -ое)"
            trans_en="Russian (adjective)"/>
      <item trans="řada" src="ряд" trans_en="range"/>
      <item trans="stavební"
            src="строи́тельный (-ая, -ое)"
            trans_en="building (adj.)"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson5/ChapterA/lekce12_2_cz.xml">
      <item trans="beseda, rozhovor" src="бесéда" trans_en="discussion, talk"/>
      <item trans="protestovat, namítat"
            src="возражáть"
            trans_en="protest (imperfective)"/>
      <item trans="namítnout"
            src="возрази́ть (возражý, возрази́шь, возразя́т)"
            trans_en="to object (perfective)"/>
      <item trans="umlouvat se"
            src="договáриваться"
            trans_en="agree (imperfective)"/>
      <item trans="umluvit se"
            src="договори́ться"
            trans_en="agree (perfective)"/>
      <item trans="deník (noviny)"
            src="ежеднéвник"
            trans_en="daily (newspaper)"/>
      <item trans="zaměstnán, zaneprázdněn, obsazen"
            src="зáнят (-а, -о)"
            trans_en="busy, occupied"/>
      <item trans="zvonění" src="звонóк" trans_en="ringing"/>
      <item trans="zdá se" src="кáжется" trans_en="it seems"/>
      <item trans="právě, přesně" src="как рáз" trans_en="exactly, precisely"/>
      <item trans="národ" src="нарóд" trans_en="nation"/>
      <item trans="trochu blíže" src="побли́же" trans_en="a bit closer"/>
      <item trans="pozdní" src="пóздний (-яя, -ее)" trans_en="late (adj.)"/>
      <item trans="popřemýšlet" src="подýмать" trans_en="to think (perfective)"/>
      <item trans="velvyslanectví" src="посóльство" trans_en="embassy"/>
      <item trans="stále" src="постоя́нно" trans_en="all the time"/>
      <item trans="recepce" src="приём" trans_en="reception"/>
      <item trans="prohovořit"
            src="проговори́ть"
            trans_en="to talk (perfective)"/>
      <item trans="rád, ráda" src="рад, рада" trans_en="gladly"/>
      <item trans="rozpovídat se"
            src="разговори́ться"
            trans_en="to start talking (perfective)"/>
      <item trans="oblast, okres, čtvrť"
            src="райóн"
            trans_en="area, district, neighbourhood"/>
      <item trans="volný (-á, -é)" src="свобóден (-дна, -дно)" trans_en="free"/>
      <item trans="následující"
            src="слéдующий (-ая, -ее)"
            trans_en="following, next"/>
      <item trans="společnice při rozhovoru"
            src="собесéдница"
            trans_en="companion in a dialogue"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson5/ChapterB/lekce12_3_cz.xml">
      <item trans="bavit se"
            src="бесéдовать (бесéдую, бесéдуешь, бесéдуют)"
            trans_en="talk"/>
      <item trans="život" src="жизнь (f.)" trans_en="life"/>
      <item trans="stýkat se"
            src="общáться"
            trans_en="to be in contact (imperfective)"/>
      <item trans="podzimní"
            src="осéнний (-яя, -ее)"
            trans_en="autumn, fall (adj.)"/>
      <item trans="otevřenost" src="откровéние" trans_en="openness"/>
      <item trans="mladík" src="пáрень (m.)" trans_en="young man"/>
      <item trans="přecházet"
            src="переходи́ть (перехожý, перехóдишь, перехóдят)"
            trans_en="switch to (imperfective)"/>
      <item trans="přejít"
            src="перейти́ (перейдý, перейдёшь, перейдýт)"
            trans_en="switch to (perfective)"/>
      <item trans="pivo" src="пи́во" trans_en="beer"/>
      <item trans="navrhovat"
            src="предлагáть"
            trans_en="to propose, suggest (imperfective)"/>
      <item trans="navrhnout"
            src="предложи́ть (предложу́, предлóжишь, предлóжат)"
            trans_en="to propose (perfective)"/>
      <item trans="trvat, pokračovat"
            src="продолжáться"
            trans_en="to last, to continue (perfective)"/>
      <item trans="potrvat, protáhnout se"
            src="продóлжиться (продóлжится, продóлжатся)"
            trans_en="to last, to drag out (perfective)"/>
      <item trans="prosit"
            src="проси́ть (прошý, прóсишь, прóсят)"
            trans_en="ask for"/>
      <item trans="poprosit"
            src="попроси́ть (попрошý, попрóсишь, попрóсят)"
            trans_en="to ask (perfective)"/>
      <item trans="sebe" src="себя́ (gen., akuz.)" trans_en="oneself"/>
      <item trans="chystat se"
            src="собирáться"
            trans_en="to prepare, to get ready (imperfective)"/>
      <item trans="nachystat se"
            src="собрáться (соберýсь, соберёшься, соберýтся)"
            trans_en="to prepare, to get ready (perfective)"/>
      <item trans="starší" src="стáрше" trans_en="older"/>
      <item trans="táhnout"
            src="тянýть (тянý, тя́нешь, тя́нут)"
            trans_en="to drag (imperfective)"/>
      <item trans="hrůza" src="ýжас" trans_en="horror"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson5/ChapterB/lekce12_4_cz.xml">
      <item trans="Anglie" src="А́нглия" trans_en="England"/>
      <item trans="blízkost"
            src="бли́зость (f.)"
            trans_en="proximity, closeness"/>
      <item trans="ve třech" src="втроём" trans_en="in a group of three"/>
      <item trans="vypínat" src="выключáть" trans_en="switch off"/>
      <item trans="vypnout"
            src="вы́ключить (вы́ключу, вы́ключишь, вы́ключат)"
            trans_en="to switch off"/>
      <item trans="hrubě" src="грýбо" trans_en="grossly"/>
      <item trans="diplomatická služba"
            src="дипслýжба, дипломати́ческая слýжба"
            trans_en="diplomatic service"/>
      <item trans="cesta" src="дорóга" trans_en="a road"/>
      <item trans="proto také, ale" src="затó" trans_en="therefore"/>
      <item trans="krátce" src="кóрoтко" trans_en="briefly"/>
      <item trans="marinovaný (-á, -é)"
            src="маринóванный (-ая, -ое)"
            trans_en="marinated"/>
      <item trans="nábřeží" src="нáбережная" trans_en="embankment"/>
      <item trans="pelmeně, šátečky s náplní"
            src="пельмéни"
            trans_en="pelmeni, filled pasta"/>
      <item trans="pod" src="под (+ instr.)" trans_en="below"/>
      <item trans="v půl dvanácté"
            src="в полдвенáдцатого"
            trans_en="at half past eleven"/>
      <item trans="velvyslanecký (-á, -é)"
            src="посóльский (-ая, -ое)"
            trans_en="ambassadorial"/>
      <item trans="má pravdu" src="прав, правá" trans_en="he is right"/>
      <item trans="radovat se"
            src="рáдоваться"
            trans_en="to rejoice (imperfective)"/>
      <item trans="sleď" src="селёдка" trans_en="herring"/>
      <item trans="sibiřský (-á, -é)"
            src="сиби́рский (-ая, -ое)"
            trans_en="Siberian"/>
      <item trans="nasolená potravina" src="солéние" trans_en="salted food"/>
      <item trans="nadšeně" src="увлечённо" trans_en="enthusiastically"/>
      <item trans="ťukat si"
            src="чóкаться (чóкаюсь, чóкаешься, чóкаются)"
            trans_en="to clink glasses (imperfective)"/>
      <item trans="přiťuknout si"
            src="чóкнуться (чóкнусь, чóкнешься, чóкнутся)"
            trans_en="to clink glasses (perfective)"/>
      <item trans="privátní" src="чáстный (-ая, -ое)" trans_en="private"/>
      <item trans="kožich" src="шýба" trans_en="fur coat"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson5/ChapterC/lekce12_5_cz.xml">
      <item trans="bít" src="бить (бью, бьёшь, бьют)" trans_en="to beat"/>
      <item trans="blízký (-á, -é)" src="бли́зкий (-ая, -ое)" trans_en="closed"/>
      <item trans="jídlo" src="блю́до" trans_en="food"/>
      <item trans="bolestivě" src="бóльно" trans_en="painfully"/>
      <item trans="vzít" src="взять" trans_en="to take"/>
      <item trans="brát"
            src="брать (возьмý, возьмёшь, возьмýт)"
            trans_en="to take"/>
      <item trans="vesele" src="вéсело" trans_en="merrily"/>
      <item trans="vychovávat"
            src="воспи́тывать"
            trans_en="to bring up, to educate (imperfective)"/>
      <item trans="vychovat"
            src="воспитáть"
            trans_en="to bring up, to educate (perfective)"/>
      <item trans="akceptovat, chápat"
            src="воспринимáть"
            trans_en="to accept, to understand (perfective)"/>
      <item trans="akceptovat, pochopit"
            src="восприня́ть (воспримý, воспри́мешь, воспри́мут)"
            trans_en="to accept, to understand (perfective)"/>
      <item trans="ostatně" src="впрóчем" trans_en="after all"/>
      <item trans="dávno" src="давнó" trans_en="a long time ago"/>
      <item trans="hospodyně" src="домрабóтница" trans_en="housekeeper"/>
      <item trans="doplácet"
            src="доплáчивать"
            trans_en="to pay, to suffer the consequences (imperfective)"/>
      <item trans="doplatit"
            src="доплати́ть (доплачý, доплáтишь, доплáтят)"
            trans_en="to pay, to suffer the consequences (perfective)"/>
      <item trans="dosud" src="до сих пóр" trans_en="so far"/>
      <item trans="klást, přidělovat"
            src="задавáтъ (задаю́, задаёшь, задаю́т)"
            trans_en="to place, to assign (imperfective)"/>
      <item trans="položit, přidělit"
            src="задáтъ (задáм, задáшь, задáст, задади́м, задади́те, зададу́т)"
            trans_en="to place, to assign (perfective)"/>
      <item trans="krev" src="кровь (f.)" trans_en="blood"/>
      <item trans="láska" src="любóвь (f.)" trans_en="love"/>
      <item trans="před (rokem)" src="(год томý) назáд" trans_en="a year ago"/>
      <item trans="naopak" src="наоборóт" trans_en="on the contrary"/>
      <item trans="nemalý (-á, -é)"
            src="немáлый (-ая, -ое)"
            trans_en="considerable, sizeable"/>
      <item trans="nezřídka" src="нерéдко" trans_en="frequently"/>
      <item trans="neskromný" src="нескрóмный" trans_en="immodest"/>
      <item trans="objímat se"
            src="обнимáться"
            trans_en="to embrace one another (imperfective)"/>
      <item trans="obejmout se"
            src="обня́ться (обнимýсь, обни́мешься, обни́мутся)"
            trans_en="to embrace one another (perfective)"/>
      <item trans="zkušenost, pokus" src="óпыт" trans_en="experience, attempt"/>
      <item trans="vztah" src="отношéние" trans_en="relationship"/>
      <item trans="řada, fronta" src="óчерeдь (f.)" trans_en="line, queue"/>
      <item trans="jinak" src="по-другóму" trans_en="otherwise"/>
      <item trans="vyměnit si"
            src="поменя́ть"
            trans_en="to exchange (perfective)"/>
      <item trans="odpouštět, promíjet"
            src="прощáть"
            trans_en="to forgive (imperfective)"/>
      <item trans="odpustit, prominout"
            src="прости́ть (прощý, прости́шь, простя́т)"
            trans_en="to forgiven (perfective)"/>
      <item trans="rovnoprávný (-á, -é)"
            src="равнопрáвный (-ая, -ое)"
            trans_en="equal"/>
      <item trans="rozvádět se, oddělovat se"
            src="разводи́ться"
            trans_en="to divorce, to separate (imperfective)"/>
      <item trans="rozvést se, oddělit se"
            src="развести́сь (разведýсь, разведёшься, разведýтся)"
            trans_en="to divorce, to separate (perfective)"/>
      <item trans="usuzovat"
            src="рассуждáть"
            trans_en="to conclude (imperfective)"/>
      <item trans="usoudit"
            src="рассуди́ть (рассужý, рассýдишь, рассýдят)"
            trans_en="to conclude (perfective)"/>
      <item trans="zřídka" src="рéдко" trans_en="rarely"/>
      <item trans="srdeční" src="сердéчный (-ая, -ое)" trans_en="heart (adj.)"/>
      <item trans="silný (-á, -é)" src="си́льный (-ая, -ое)" trans_en="strong"/>
      <item trans="úplně" src="совершéнно" trans_en="entirely"/>
      <item trans="zachovávat"
            src="сохраня́ть"
            trans_en="to keep, to maintain, to preserve (imperfective)"/>
      <item trans="zachovat"
            src="сохрани́ть (сохраню́, сохрани́шь, сохраня́т)"
            trans_en="to keep, to maintain, to preserve (perfective)"/>
      <item trans="manželka" src="супрýга" trans_en="Wife"/>
      <item trans="teplota" src="теплотá" trans_en="temperature"/>
      <item trans="přesvědčen (-a, -o)"
            src="увéрeн (-а, -о)"
            trans_en="convinced"/>
      <item trans="lidský (-á, -é)"
            src="человéческий (-ая, -ое)"
            trans_en="human"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson6/ChapterA/lekce1_1_cz.xml">
      <item trans="pohled, vzhled" src="взгляд" trans_en="view, look"/>
      <item trans="dívka" src="дéвушка" trans_en="girl"/>
      <item trans="měnit se"
            src="изменя́ться"
            trans_en="to change (imperfective)"/>
      <item trans="změnit se"
            src="измени́ться"
            trans_en="to change (perfective)"/>
      <item trans="neuvěřitelný" src="невероя́тный" trans_en="unbelievable"/>
      <item trans="ukazovat se, zdát se"
            src="покáзываться"
            trans_en="to turn out, to seem (imperfective)"/>
      <item trans="ukázat se"
            src="показа́ться (покажýсь, покáжешься, покáжутся)"
            trans_en="to turn out, to seem (perfective)"/>
      <item trans="přesvědčovat se"
            src="убеждáться"
            trans_en="to become convinced (imperfective)"/>
      <item trans="přesvědčit se"
            src="убеди́ться (убеди́шься, убедя́тся)"
            trans_en="to become convinced (perfective)"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson6/ChapterA/lekce1_2_cz.xml">
      <item trans="běhat" src="бéгать" trans_en="to run, to jog (imperfective)"/>
      <item trans="blíže" src="бли́же" trans_en="closer, in more detail"/>
      <item trans="důležitý" src="вáжный" trans_en="important"/>
      <item trans="žehlit"
            src="глáдить (глáжу, глáдишь, глáдят)"
            trans_en="to iron (imperfective)"/>
      <item trans="vyžehlit"
            src="поглáдить (поглáжу, поглáдишь, поглáдят)"
            trans_en="to iron (perfective)"/>
      <item trans="(s) dvěma" src="(с) двумя́ (+ instr.)" trans_en="(with) two"/>
      <item trans="důvěra" src="довéрие" trans_en="trust, confidence"/>
      <item trans="vyzvedávat"
            src="забирáть"
            trans_en="to pick up (imperfective)"/>
      <item trans="vyzvednout"
            src="забрáть (заберý, заберёшь, заберýт)"
            trans_en="to pick up (perfective)"/>
      <item trans="starost" src="забóта" trans_en="concern"/>
      <item trans="starat se"
            src="забóтиться (о) (забóчусь, забóтишься, забóтятся)"
            trans_en="to take care of (imperfective)"/>
      <item trans="postarat se (o)"
            src="позабóтиться (о) (позабóчусь, позабóтишься, позабóтятся)"
            trans_en="to take care of (perfective)"/>
      <item trans="zajímat se"
            src="интересовáться (+ instr.)"
            trans_en="to be interested in (imperfective)"/>
      <item trans="mínění" src="мнéние" trans_en="opinion"/>
      <item trans="možná" src="мóжет быть" trans_en="perhaps"/>
      <item trans="myš" src="мышь (f.)" trans_en="mouse"/>
      <item trans="otravovat"
            src="надоедáть"
            trans_en="to annoy (imperfective)"/>
      <item trans="otrávit"
            src="надоéсть (надоéм, надоéшь, надоéст, надоеди́м, надоеди́те, надоедя́т)"
            trans_en="to annoy (perfective)"/>
      <item trans="dědictví, dědění" src="наслéдство" trans_en="inheritance"/>
      <item trans="někteří, některé" src="нéкоторые (pl.)" trans_en="some"/>
      <item trans="chůva" src="ня́ня" trans_en="nanny, nurse"/>
      <item trans="vyučovat" src="обучáть" trans_en="to teach (imperfective)"/>
      <item trans="naučit, vyškolit"
            src="обучи́ть (обучý, обýчишь, обýчат)"
            trans_en="to teach (perfective)"/>
      <item trans="studentská kolej"
            src="общежи́тие"
            trans_en="student dormitory"/>
      <item trans="vysvětlit"
            src="объясни́ть (объясню́, объясни́шь, объясня́т)"
            trans_en="to explain (perfective)"/>
      <item trans="povinnost" src="обя́занность (f.)" trans_en="obligation"/>
      <item trans="odpojovat"
            src="отключáть"
            trans_en="to disconnect (imperfective)"/>
      <item trans="odpojit"
            src="отключи́ть (отключý, отклю́чишь, отклю́чат)"
            trans_en="to disconnect (perfective)"/>
      <item trans="z důvodu" src="по пóводу" trans_en="due to"/>
      <item trans="podávat žalobu"
            src="подавáть в суд (подаю́, подаёшь, подаю́т)"
            trans_en="to file a lawsuit (imperfective)"/>
      <item trans="podat žalobu"
            src="подáть в суд (подáм, подáшь, подáст, подади́м, подади́те, подаду́т)"
            trans_en="to file a lawsuit (perfective)"/>
      <item trans="polovina" src="полови́на" trans_en="half"/>
      <item trans="pomocnice" src="помóщница" trans_en="helper (female)"/>
      <item trans="projevit soucit"
            src="посочýвствовать"
            trans_en="to show compassion (perfective)"/>
      <item trans="přivádět"
            src="приводи́ть (привожý, привóдишь, привóдят)"
            trans_en="to bring (imperfective)"/>
      <item trans="přivést"
            src="привести́ (приведý, приведёшь, приведýт)"
            trans_en="to bring (perfective)"/>
      <item trans="žít, obývat"
            src="проживáть"
            trans_en="to live, to inhabit (imperfective)"/>
      <item trans="prožít"
            src="прожи́ть"
            trans_en="to live through (perfective)"/>
      <item trans="dít se, konat se"
            src="происходи́ть (происхóдит, происхóдят)"
            trans_en="to happen, to take place (imperfective)"/>
      <item trans="přihodit se"
            src="произойти́ (произойдёт, произойду́т)"
            trans_en="to happen (perfective)"/>
      <item trans="vysávat" src="пылесóсить" trans_en="to vacuum (perfective)"/>
      <item trans="dítě" src="ребёнок" trans_en="a child"/>
      <item trans="příbuzný" src="роднóй" trans_en="relative"/>
      <item trans="hádat se" src="ругáться" trans_en="quarrel"/>
      <item trans="pohádat se"
            src="поругáться"
            trans_en="to quarrel (perfective)"/>
      <item trans="také" src="тáкже" trans_en="too"/>
      <item trans="šváb" src="таракáн" trans_en="cockroach"/>
      <item trans="jesle" src="я́сли (pl.)" trans_en="day nursery"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson6/ChapterB/lekce1_3_cz.xml">
      <item trans="bát se"
            src="боя́ться (+ gen.) (бою́сь, бои́шься, боя́тся)"
            trans_en="to be afraid"/>
      <item trans="koneckonců" src="в концé концóв" trans_en="after all"/>
      <item trans="je možné" src="возмóжно" trans_en="it is possible"/>
      <item trans="věk" src="вóзраст" trans_en="age"/>
      <item trans="vychovatel" src="воспитáтель (m.)" trans_en="carer, warden"/>
      <item trans="vyplňovat, vykonávat"
            src="выполня́ть"
            trans_en="to fulfil, to perform (imperfective)"/>
      <item trans="vyplnit, vykonat"
            src="вы́полнить (вы́полню, вы́полнишь, вы́полнят)"
            trans_en="to fulfil, to perform (perfective)"/>
      <item trans="záviset"
            src="зави́сеть (зави́шу, зави́сишь, зави́сят)"
            trans_en="to depend"/>
      <item trans="výborně" src="замечáтельно" trans_en="excellently"/>
      <item trans="zatoužit"
            src="захотéть (захочý, захóчешь, захóчет, захоти́м, захоти́те, захотя́т)"
            trans_en="to feel a desire, to long for (perfective)"/>
      <item trans="seznamovat"
            src="знакóмить (знакóмлю, знакóмишь, знакóмят)"
            trans_en="to acquaint (imperfective)"/>
      <item trans="seznámit"
            src="познакóмить (познакóмлю, познакóмишь, познакóмят)"
            trans_en="to acquaint (perfective)"/>
      <item trans="nějaký" src="какóй-то" trans_en="some"/>
      <item trans="osobní" src="ли́чный" trans_en="personal"/>
      <item trans="jmenovat, označovat"
            src="назывáть (+ instr.)"
            trans_en="to name, to identify (imperfective)"/>
      <item trans="pojmenovat, označit"
            src="назвáть (+ instr.) (назовý, назовёшь, назовýт)"
            trans_en="to name, to identify (perfective)"/>
      <item trans="nedostatek, chyba"
            src="недостáток"
            trans_en="imperfection, mistake"/>
      <item trans="nenávidět"
            src="ненави́деть (ненави́жу, ненави́дишь, ненави́дят"
            trans_en="to hate"/>
      <item trans="obohacovat"
            src="обогащáть"
            trans_en="to enrich (imperfective)"/>
      <item trans="obohatit"
            src="обогати́ть (обогащý, обогати́шь, обогатя́т)"
            trans_en="to enrich (perfective)"/>
      <item trans="obraz, podoba" src="óбраз" trans_en="picture, likeness"/>
      <item trans="společný" src="óбщий" trans_en="shared, joint"/>
      <item trans="ohromný" src="огрóмный" trans_en="immense"/>
      <item trans="chyba" src="оши́бка" trans_en="mistake"/>
      <item trans="ve srovnání"
            src="по сравнéнию"
            trans_en="as compared, in comparison"/>
      <item trans="příklad" src="примéр" trans_en="example"/>
      <item trans="jednodušeji" src="прóще" trans_en="simpler"/>
      <item trans="pracovní, pracující" src="рабóчий" trans_en="work, working"/>
      <item trans="rozepisovat, plánovat"
            src="распи́сывать"
            trans_en="to write out,, to plan (imperfective)"/>
      <item trans="rozepsat, naplánovat"
            src="расписáть (распишý, распи́шешь, распи́шут)"
            trans_en="to write out, to plan (perfective)"/>
      <item trans="síla" src="си́ла" trans_en="strength"/>
      <item trans="je směšné" src="смешнó" trans_en="is ridiculous"/>
      <item trans="smysl" src="смысл" trans_en="sense"/>
      <item trans="přibližně" src="сравни́тельно" trans_en="approximately"/>
      <item trans="přísný" src="стрóгий" trans_en="strict"/>
      <item trans="poněvadž" src="тáк как" trans_en="since(reason)"/>
      <item trans="takzvaný" src="так назывáемый" trans_en="so-called"/>
      <item trans="zabíjet" src="убивáть" trans_en="to kill (imperfective)"/>
      <item trans="zabít"
            src="уби́ть (убью́, убьёшь, убью́т)"
            trans_en="to kill (perfective)"/>
      <item trans="přestože" src="хотя́" trans_en="although"/>
      <item trans="oceňovat"
            src="цени́ть (ценю́, цéнишь, цéнят)"
            trans_en="to appreciate (imperfective)"/>
      <item trans="čestně" src="чéстно" trans_en="honestly, fairly"/>
      <item trans="něco" src="чтó-нибудь" trans_en="something"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson6/ChapterC/lekce1_4_cz.xml">
      <item trans="přizpůsobit se"
            src="адапти́роваться"
            trans_en="to adapt (perfective)"/>
      <item trans="vrátit se"
            src="вернýться (вернýсь, вернёшься, вернýтся)"
            trans_en="to return (perfective)"/>
      <item trans="hračka" src="игрýшка" trans_en="toy"/>
      <item trans="měnit" src="изменя́ть" trans_en="to change (imperfective)"/>
      <item trans="změnit" src="измени́ть" trans_en="to change (perfective)"/>
      <item trans="radit"
            src="совéтовать"
            trans_en="to give advice (imperfective)"/>
      <item trans="poradit"
            src="посовéтовать"
            trans_en="to give advice (perfective)"/>
      <item trans="vtipkovat"
            src="шути́ть (шучý, шýтишь, шýтят)"
            trans_en="to joke (imperfective)"/>
      <item trans="zavtipkovat"
            src="пошути́ть (пошучý, пошýтишь, пошýтят)"
            trans_en="to joke (perfective)"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson7/ChapterA/lekce2_2_cz.xml">
      <item trans="oko" src="глаз" trans_en="eye"/>
      <item trans="různě" src="по-рáзному" trans_en="differently, diversely"/>
      <item trans="bohatý" src="богáтый" trans_en="rich"/>
      <item trans="veselý" src="весёлый" trans_en="merry"/>
      <item trans="vzduch" src="вóздух" trans_en="air"/>
      <item trans="válka" src="вoйнá" trans_en="war"/>
      <item trans="nadšení" src="востóрг" trans_en="excitement"/>
      <item trans="vyjadřovat"
            src="выскáзывать"
            trans_en="to express (imperfective)"/>
      <item trans="vyjádřit"
            src="вы́сказать (вы́скажу, вы́скажешь, вы́скажут)"
            trans_en="to express (perfective)"/>
      <item trans="svěřovat, důvěřovat"
            src="доверя́ть"
            trans_en="to trust (imperfective)"/>
      <item trans="svěřit"
            src="довéрить (довéрю, довéришь, довéрят)"
            trans_en="to entrust"/>
      <item trans="přát (si)" src="желáть" trans_en="to wish (imperfective)"/>
      <item trans="popřát"
            src="пожелáть"
            trans_en="to wish, congratulate (perfective)"/>
      <item trans="obydlí" src="жильё" trans_en="abode"/>
      <item trans="brambory" src="картóшка" trans_en="potatoes"/>
      <item trans="k lepšímu" src="к лýчшему" trans_en="for the better"/>
      <item trans="milovaný, oblíbený"
            src="люби́мый"
            trans_en="beloved, popular"/>
      <item trans="měnit" src="меня́ть" trans_en="to change (imperfective)"/>
      <item trans="změnit" src="изменя́ть" trans_en="to change (perfective)"/>
      <item trans="doufat, spoléhat se"
            src="надéяться (надéюсь, надéешься, надéются)"
            trans_en="to hope, to rely (imperfective)"/>
      <item trans="spolehnout se"
            src="понадéяться (понадéюсь, понадéешься, понадéются)"
            trans_en="to rely (perfective)"/>
      <item trans="nikoho (ne)"
            src="никогó (не) (gen., akuz.)"
            trans_en="nobody"/>
      <item trans="novoroční"
            src="новогóдний (-яя, -ее)"
            trans_en="New Year (adj.)"/>
      <item trans="potřebný (-á, -é)"
            src="нýжен (-жнá, -жно)"
            trans_en="necessary"/>
      <item trans="otevřen (-a, -o)" src="откры́т (-а, -о)" trans_en="open"/>
      <item trans="výslužba, důchod" src="отстáвка" trans_en="pension"/>
      <item trans="přání" src="пожелáние" trans_en="wishes"/>
      <item trans="jeden a půl" src="полторá" trans_en="one and a half"/>
      <item trans="správný" src="прáвильный" trans_en="correct, proper"/>
      <item trans="o (kom, čem)"
            src="про (+ akuz.)"
            trans_en="about (whom, what)"/>
      <item trans="radovat se"
            src="рáдоваться (+ dat.) (рáдуюсь, рáдуешься, рáдуются)"
            trans_en="to rejoice (imperfective)"/>
      <item trans="zaradovat se"
            src="обрáдоваться (+ dat.) (обрáдуюсь, обрáдуешься, обрáдуются)"
            trans_en="to rejoice (perfective)"/>
      <item trans="ruka" src="рукá" trans_en="hand, arm"/>
      <item trans="řídit"
            src="руководи́ть (руковожý, руководи́шь, руководя́т)"
            trans_en="drive"/>
      <item trans="souhlasí" src="соглáсен (-сна, -сно)" trans_en="agrees"/>
      <item trans="štěstí" src="счáстье" trans_en="good luck, fortune"/>
      <item trans="ti samí" src="тé же" trans_en="the same"/>
      <item trans="úspěch" src="успéх" trans_en="success"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson7/ChapterB/lekce2_3_cz.xml">
      <item trans="vítr" src="вéтер" trans_en="wind"/>
      <item trans="věc" src="вещь (f.)" trans_en="thing, item"/>
      <item trans="přivolávat"
            src="вызывáть"
            trans_en="to bring stg. about (imperfective)"/>
      <item trans="přivolat"
            src="вы́звать (вы́зову, вы́зовёшь, вы́зовут)"
            trans_en="to bring stg. about (perfective)"/>
      <item trans="žvanění" src="говори́льня" trans_en="blabber"/>
      <item trans="hora" src="горá" trans_en="mountain"/>
      <item trans="stávka, stávek (2. pád mn. č.)"
            src="забастóвка, забастóвок (gen. pl.)"
            trans_en="strike (2nd case - genitive plural)"/>
      <item trans="zdát se" src="казáться" trans_en="to seem"/>
      <item trans="ukázat se"
            src="показáться"
            trans_en="to turn out, to seem (perfective)"/>
      <item trans="idol" src="куми́р" trans_en="idol"/>
      <item trans="měnit se"
            src="меня́ться"
            trans_en="to change (imperfective)"/>
      <item trans="změnit se"
            src="поменя́ться"
            trans_en="to change (perfective)"/>
      <item trans="začínat" src="начинáться" trans_en="to begin"/>
      <item trans="začít" src="начáться" trans_en="start"/>
      <item trans="nepochopení"
            src="непонимáние"
            trans_en="lack of understanding"/>
      <item trans="ponožky" src="носки́ (pl.)" trans_en="socks"/>
      <item trans="oblečen (-a, -o)" src="одéт (-а, -о)" trans_en="dressed"/>
      <item trans="přestávka" src="перемéна" trans_en="break, intermission"/>
      <item trans="trochu jíst"
            src="поедáть"
            trans_en="to eat a bit (imperfective)"/>
      <item trans="pojíst"
            src="поéсть (поéм, поéшь, поéст, поеди́м, поеди́те, поедя́т)"
            trans_en="to eat a bit (perfective)"/>
      <item trans="Polsko" src="Пóльша" trans_en="Poland"/>
      <item trans="rozpadávat se, hroutit se"
            src="рýшиться"
            trans_en="to fall apart, to collapse (imperfective)"/>
      <item trans="rozpadnout se, zhroutit se"
            src="порýшиться"
            trans_en="to fall apart, to collapse (perfective)"/>
      <item trans="úspory" src="сбережéние" trans_en="savings"/>
      <item trans="zabočit"
            src="свернýть"
            trans_en="to make a turn (perfective)"/>
      <item trans="starý" src="стáрый" trans_en="old"/>
      <item trans="přívrženec" src="сторóнник" trans_en="proponent"/>
      <item trans="ztrácet" src="теря́ть" trans_en="to lose (imperfective)"/>
      <item trans="ztratit" src="потеря́ть" trans_en="to lose (perfective)"/>
      <item trans="číslo" src="числó" trans_en="number"/>
    </lmap>
    <lmap ident="~/Russian2/Lesson7/ChapterC/lekce2_4_cz.xml">
      <item trans="nekonečný" src="бесконéчный" trans_en="endless, infinite"/>
      <item trans="vrhat se"
            src="бросáться"
            trans_en="to throw oneself (imperfective)"/>
      <item trans="vrhnout se"
            src="брóситься (брóшусь, брóсишься, брóсятся)"
            trans_en="to throw oneself (perfective)"/>
      <item trans="papírek" src="бумáжка" trans_en="(little piece of) paper"/>
      <item trans="viset"
            src="висéть (вишý, виси́шь, вися́т)"
            trans_en="to hang (imperfective)"/>
      <item trans="upadat (do)"
            src="впадáть"
            trans_en="to fall (into) (imperfective)"/>
      <item trans="upadnout (do)"
            src="впасть (впадý, впадёшь, впадýт)"
            trans_en="to fall (into) (perfective)"/>
      <item trans="hlava" src="головá" trans_en="head, manager"/>
      <item trans="jediný, jedinečný"
            src="еди́нственный"
            trans_en="the only, unique"/>
      <item trans="žvýkačka" src="жвáчка" trans_en="chewing gum"/>
      <item trans="zahraniční" src="загрaни́чный" trans_en="foreign"/>
      <item trans="vyplňovat"
            src="заполня́ть"
            trans_en="to fill in (imperfective)"/>
      <item trans="vyplnit"
            src="запóлнить (запóлню, запóлнишь, запóлнят)"
            trans_en="to fill in (perfective)"/>
      <item trans="pracovna" src="кабинéт" trans_en="office"/>
      <item trans="slepice (mn. č.)"
            src="кýры (pl.)"
            trans_en="chicken (plural)"/>
      <item trans="lahůdka" src="лáкoмство (pl.)" trans_en="delicacy"/>
      <item trans="naděje" src="надéжда" trans_en="hope"/>
      <item trans="nosit"
            src="носи́ть (ношý, нóсишь, нóсят)"
            trans_en="to carry (imperfective)"/>
      <item trans="urážlivě" src="оби́дно" trans_en="offensively"/>
      <item trans="avšak" src="однáко" trans_en="but"/>
      <item trans="odlišovat se"
            src="отличáться"
            trans_en="to differ (imperfective)"/>
      <item trans="odlišit se"
            src="отличи́ться (отличýсь, отличи́шься, отличáтся)"
            trans_en="to differ (perfective)"/>
      <item trans="zoufalství" src="отчáяние" trans_en="despair"/>
      <item trans="podávat"
            src="подавáть"
            trans_en="to pass, to serve (imperfective)"/>
      <item trans="podat"
            src="подáть"
            trans_en="to pass, to serve (perfective)"/>
      <item trans="kladný" src="положи́тельный" trans_en="positive"/>
      <item trans="zdát se" src="появля́ться" trans_en="to seem"/>
      <item trans="ukázat se"
            src="появи́ться (появлю́сь, поя́вишься, поя́вятся)"
            trans_en="to turn out, to seem (perfective)"/>
      <item trans="oznamovat"
            src="провозглашáть"
            trans_en="to announce (imperfective)"/>
      <item trans="oznámit"
            src="провозгласи́ть (провозглашý, провозгласи́шь, провозглася́т)"
            trans_en="to announce (perfective)"/>
      <item trans="vedoucí" src="руководи́тель (m.)" trans_en="head, manager"/>
      <item trans="svoboda" src="свобóда" trans_en="freedom"/>
      <item trans="sundávat"
            src="снимáть"
            trans_en="to take off (imperfective)"/>
      <item trans="sundat"
            src="снять (снимý, сни́мешь, сни́мут)"
            trans_en="to take off (perfective)"/>
      <item trans="slámka" src="солóминка" trans_en="straw"/>
      <item trans="zboží" src="товáр" trans_en="goods"/>
      <item trans="umět" src="умéть" trans_en="to be able to, can"/>
      <item trans="přidržovat se, chytat se"
            src="цепля́ться"
            trans_en="to hold onto stg., to grab (imperfective)"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson1/ChapterA/lekce3_1_cz.xml">
      <item trans="větší" src="бóльший" trans_en="bigger, larger, greater"/>
      <item trans="průvodce" src="гид" trans_en="guide"/>
      <item trans="aktivní, činný"
            src="дéйствующий (-ая, -ее, -ие)"
            trans_en="active"/>
      <item trans="letět"
            src="летéть (лечý, лети́шь, летя́т)"
            trans_en="to fly (imperfective)"/>
      <item trans="prapůvodní" src="первоздáнный" trans_en="primeval"/>
      <item trans="přistání" src="посáдка" trans_en="landing"/>
      <item trans="příroda" src="прирóда" trans_en="nature"/>
      <item trans="přímo" src="пря́мо" trans_en="directly"/>
      <item trans="rozdíl" src="рáзница" trans_en="difference"/>
      <item trans="sedat si"
            src="сади́ться (сажýсь, сади́шься, садя́тся)"
            trans_en="to sit (imperfective)"/>
      <item trans="sednout si"
            src="сесть (ся́ду, ся́дешь, ся́дут)"
            trans_en="to sit (perfective)"/>
      <item trans="stovky, stovek (2. pád mn. č.)"
            src="сóтни, сóтен (gen. pl.)"
            trans_en="hundreds (2nd case - genitive plural)"/>
      <item trans="cestička" src="тропи́нка" trans_en="path"/>
      <item trans="ukazatel" src="указáтель (m.)" trans_en="indicator"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson1/ChapterA/lekce3_2_cz.xml">
      <item trans="návrat" src="возвращéние" trans_en="return"/>
      <item trans="snášet, přečkávat"
            src="выдéрживать"
            trans_en="to withstand (imperfective)"/>
      <item trans="vydržet, přečkat"
            src="вы́держать (вы́держу, вы́держишь, вы́держат)"
            trans_en="to withstand (perfective)"/>
      <item trans="horský" src="гóрный" trans_en="mountain (adj.)"/>
      <item trans="horký" src="горя́чий" trans_en="hot"/>
      <item trans="daleko" src="далекó" trans_en="far away"/>
      <item trans="zachtít se (zachce se/zachtělo se)"
            src="захотéться (+ dat.) (захóчется, захотéлось)"
            trans_en="to wish for, to want (perfective)"/>
      <item trans="pramen" src="истóчник" trans_en="spring"/>
      <item trans="krátký" src="крáткий" trans_en="short"/>
      <item trans="koupat se" src="купáться" trans_en="to bathe (imperfective)"/>
      <item trans="muzeum" src="музéй" trans_en="museum"/>
      <item trans="obvyklý, obyčejný" src="обы́чный" trans_en="usual, ordinary"/>
      <item trans="zvedat se, stoupat"
            src="поднимáться"
            trans_en="to rise (imperfective)"/>
      <item trans="zvednout se"
            src="подня́ться (поднимýсь, подни́мешься, подни́мутся)"
            trans_en="to rise (perfective)"/>
      <item trans="plný" src="пóлный" trans_en="full"/>
      <item trans="poslechnout si"
            src="послýшать"
            trans_en="to listen (perfective)"/>
      <item trans="dobrodružství" src="приключéние" trans_en="adventure"/>
      <item trans="cesta" src="путешéствие" trans_en="a road"/>
      <item trans="samozřejmě" src="разумéется" trans_en="of course, naturally"/>
      <item trans="sladký" src="слáдкий" trans_en="sweet"/>
      <item trans="plavit se"
            src="сплавля́ться"
            trans_en="to sail, to navigate (imperfective)"/>
      <item trans="doplavit se"
            src="сплáвиться (сплáвлюсь, сплáвишься, сплáвятся)"
            trans_en="to sail, to navigate (perfective)"/>
      <item trans="táhnout"
            src="тянýть (тянý, тя́нешь, тя́нут)"
            trans_en="to drag (imperfective)"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson1/ChapterB/lekce3_3_cz.xml">
      <item trans="bolet (bolí)"
            src="болéть (боли́т, боля́т)"
            trans_en="to ache (aches)"/>
      <item trans="je vidět" src="ви́дно" trans_en="it is visible"/>
      <item trans="padat, vypadávat"
            src="выпадáть"
            trans_en="to fall, to fall out (imperfective)"/>
      <item trans="vypadnout"
            src="вы́пасть (вы́паду, вы́падешь, вы́падут)"
            trans_en="to fall out (perfective)"/>
      <item trans="vypíjet" src="выпивáть" trans_en="to drink (imperfective)"/>
      <item trans="vypít" src="вы́пить" trans_en="drink"/>
      <item trans="hlouběji" src="глýбже" trans_en="deeper"/>
      <item trans="narozeniny" src="день рождéния" trans_en="birthday"/>
      <item trans="údolí" src="доли́на" trans_en="valley"/>
      <item trans="domeček" src="дóмик" trans_en="little house"/>
      <item trans="docházet, dosahovat"
            src="доходи́ть"
            trans_en="to reach, to arrive at (imperfective)"/>
      <item trans="dojít, dosáhnout"
            src="дойти́"
            trans_en="to reach, to arrive at (perfective)"/>
      <item trans="foukat"
            src="дуть (дýю, дýешь, дýют)"
            trans_en="to blow (imperfective)"/>
      <item trans="přirozený" src="естéственный" trans_en="natural"/>
      <item trans="zapochybovat"
            src="засомневáться"
            trans_en="to doubt (perfective)"/>
      <item trans="zlatý" src="золотóй" trans_en="gold, golden"/>
      <item trans="ležet"
            src="лежáть (лежý, лежи́шь, лежáт)"
            trans_en="to lie (imperfective)"/>
      <item trans="sval" src="мы́шца" trans_en="muscle"/>
      <item trans="zpět" src="назáд" trans_en="back"/>
      <item trans="nocovat"
            src="ночевáть"
            trans_en="to spend a night (imperfective)"/>
      <item trans="přenocovat"
            src="переночевáть"
            trans_en="to spend a night (perfective)"/>
      <item trans="podzim" src="óсень (f.)" trans_en="autumn"/>
      <item trans="přelézat"
            src="перелезáть"
            trans_en="to climb over (imperfective)"/>
      <item trans="přelézt"
            src="перелéзть (перелéзу, перелéзешь, перелéзут)"
            trans_en="to climb over (perfective)"/>
      <item trans="počasí" src="погóда" trans_en="weather"/>
      <item trans="pás, pásmo" src="пóяс" trans_en="band, zone"/>
      <item trans="přilétat"
            src="прилетáть"
            trans_en="to arrive by air (imperfective)"/>
      <item trans="přiletět"
            src="прилетéть (прилечý, прилети́шь, прилетя́т)"
            trans_en="to arrive by air (perfective)"/>
      <item trans="sněhová bouře" src="пургá" trans_en="snow storm"/>
      <item trans="cesta" src="путь (m.)" trans_en="a road"/>
      <item trans="skála" src="скалá" trans_en="rock"/>
      <item trans="příliš" src="сли́шком" trans_en="too much"/>
      <item trans="sníh" src="снег" trans_en="snow"/>
      <item trans="pochybovat"
            src="сомневáться"
            trans_en="to doubt (imperfective)"/>
      <item trans="scházet, sjíždět"
            src="спускáться"
            trans_en="to go down (imperfective)"/>
      <item trans="sejít, sjet"
            src="спусти́ться (спущýсь, спýстишься, спýстятся)"
            trans_en="to go down (perfective)"/>
      <item trans="potěšení" src="удовóльствие" trans_en="pleasure"/>
      <item trans="chladný" src="холóдный" trans_en="cool, cold"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson1/ChapterC/lekce3_4_cz.xml">
      <item trans="nedělní" src="воскрéсный" trans_en="Sunday (adj.)"/>
      <item trans="uschnout"
            src="вы́сохнуть (вы́сохну, вы́сохнешь, вы́сохнут)"
            trans_en="to dry (perfective)"/>
      <item trans="déšť" src="дождь (f.)" trans_en="rain"/>
      <item trans="konec" src="конéц" trans_en="end"/>
      <item trans="mobilní telefon"
            src="моби́льник"
            trans_en="mobile telephone"/>
      <item trans="není odkud" src="нéоткуда" trans_en="from nowhere"/>
      <item trans="osamělost" src="одинóчество" trans_en="loneliness"/>
      <item trans="měnit se, vyměňovat si"
            src="переменя́ться"
            trans_en="to change, to exchange (imperfective)"/>
      <item trans="změnit se, vyměnit si"
            src="перемени́ться (переменю́сь, перемéнишься, перемéнятся)"
            trans_en="to change, to exchange (perfective)"/>
      <item trans="let" src="полёт" trans_en="flight"/>
      <item trans="vysoké boty, holínky" src="сапоги́ (pl.)" trans_en="boots"/>
      <item trans="plavení" src="сплав" trans_en="rafting"/>
      <item trans="odlétat"
            src="улетáть"
            trans_en="to leave by air (imperfective)"/>
      <item trans="odletět"
            src="улетéть (улечý, улети́шь, улетя́т)"
            trans_en="to leave by air (perfective)"/>
      <item trans="stíhat"
            src="успевáть"
            trans_en="to make (something on time) (imperfective)"/>
      <item trans="stihnout"
            src="успéть (успéю, успéешь, успéют)"
            trans_en="to make (something on time) (perfective)"/>
      <item trans="Švýcarsko" src="Швейцáрия" trans_en="Switzerland"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson2/ChapterA/lekce4_1_cz.xml">
      <item trans="světový" src="мировóй" trans_en="world (adj.)"/>
      <item trans="začátek" src="начáло" trans_en="beginning"/>
      <item trans="žádný" src="никакóй" trans_en="none"/>
      <item trans="stěhovat se"
            src="переезжáть"
            trans_en="to move house (imperfective)"/>
      <item trans="přestěhovat se"
            src="переéхать (переéду, переéдешь, переéдут)"
            trans_en="to move house (perfective)"/>
      <item trans="smutný" src="печáльный" trans_en="sad"/>
      <item trans="pochopitelně" src="поня́тно" trans_en="understandably"/>
      <item trans="zrádce" src="предáтель (m.)" trans_en="traitor"/>
      <item trans="opovrhovat" src="презирáть" trans_en="to spurn (perfective)"/>
      <item trans="příkaz" src="прикáз" trans_en="order"/>
      <item trans="osud" src="судьбá" trans_en="fate"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson2/ChapterA/lekce4_2_cz.xml">
      <item trans="boj" src="борьбá" trans_en="fight, struggle"/>
      <item trans="století" src="век, векá (pl.)" trans_en="century"/>
      <item trans="náboženství" src="вероиспове́дание" trans_en="religion"/>
      <item trans="vnitřní" src="внýтренний (-яя, -ее)" trans_en="internal"/>
      <item trans="výběr" src="вы́бор" trans_en="selection"/>
      <item trans="odcházet" src="выходи́ть" trans_en="to leave (imperfective)"/>
      <item trans="odejít" src="вы́йти" trans_en="leave"/>
      <item trans="občan, občané"
            src="граждани́н, грáждане (pl.)"
            trans_en="citizen, citizens"/>
      <item trans="mít platnost" src="дéйствовать" trans_en="to be valid"/>
      <item trans="země" src="земля́" trans_en="country"/>
      <item trans="daň" src="налóг" trans_en="tax"/>
      <item trans="obdělávat"
            src="обрабáтывать"
            trans_en="to farm (imperfective)"/>
      <item trans="obdělat" src="обрабóтать" trans_en="to farm (perfective)"/>
      <item trans="osvobození" src="освобождéние" trans_en="liberation"/>
      <item trans="sídliště, osada" src="поселéние" trans_en="settlement"/>
      <item trans="předek, předci"
            src="прéдок, прéдки (pl.)"
            trans_en="ancestor"/>
      <item trans="přivolávat"
            src="призывáть"
            trans_en="to bring stg. about (imperfective)"/>
      <item trans="přivolat"
            src="призвáть (призовý, призовёшь, призовýт)"
            trans_en="to bring stg. about (perfective)"/>
      <item trans="přinést"
            src="принести́ (принесý, принесёшь, принесýт)"
            trans_en="bring"/>
      <item trans="rozvíjet"
            src="развивáть"
            trans_en="to develop (imperfective)"/>
      <item trans="rozvinout"
            src="разви́ть (разовью́, разовьёшь, разовью́т)"
            trans_en="to develop (perfective)"/>
      <item trans="samospráva"
            src="самоуправлéние"
            trans_en="self-administration"/>
      <item trans="Sovětský Svaz" src="Совéтский Сою́з" trans_en="Soviet Union"/>
      <item trans="nařízení" src="укáз" trans_en="order, decree"/>
      <item trans="Ukrajina" src="Украи́на" trans_en="Ukraine"/>
      <item trans="carevna" src="цари́ца" trans_en="tsarina"/>
      <item trans="carský" src="цáрский" trans_en="tsarist"/>
      <item trans="švábsky" src="швáбский" trans_en="in Swabian"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson2/ChapterB/lekce4_3_cz.xml">
      <item trans="potulovat se"
            src="броди́ть (брожу́, брóдишь, брóдят)"
            trans_en="to wander, to roam"/>
      <item trans="toulat se"
            src="брести́ (бреду́, бредёшь, бреду́т)"
            trans_en="to wander, to roam"/>
      <item trans="velbloud" src="верблю́д" trans_en="camel"/>
      <item trans="na jaře" src="веснóй" trans_en="in the spring"/>
      <item trans="vinná réva" src="виногрáд" trans_en="grapevine"/>
      <item trans="moc, vláda" src="власть (f.)" trans_en="power, government"/>
      <item trans="všesvazový" src="всесою́зный" trans_en="pan-union (adj.)"/>
      <item trans="vstupovat"
            src="вступáть"
            trans_en="to appear (imperfective)"/>
      <item trans="vstoupit"
            src="вступи́ть (вступлю́, всту́пишь, всту́пят)"
            trans_en="to appear (perfective)"/>
      <item trans="odchovávat, pěstovat"
            src="вырáщивать"
            trans_en="to raise, to grow (imperfective)"/>
      <item trans="odchovat, vypěstovat"
            src="вы́растить (вы́ращу, вы́растишь, вы́растят)"
            trans_en="to raise, to grow (perfective)"/>
      <item trans="strom, stromy"
            src="дéрево, дерéвья (pl.)"
            trans_en="tree, trees"/>
      <item trans="dětství" src="дéтство" trans_en="childhood"/>
      <item trans="jídlo" src="едá" trans_en="food"/>
      <item trans="ženit se" src="жени́ться" trans_en="to marry (imperfective)"/>
      <item trans="obyvatel" src="жи́тель (m.)" trans_en="inhabitant"/>
      <item trans="západ" src="зáпад" trans_en="west"/>
      <item trans="západní" src="зáпадный" trans_en="western"/>
      <item trans="ochrana" src="защи́та" trans_en="protection"/>
      <item trans="kolchoz, zemědělské družstvo"
            src="колхóз"
            trans_en="kolkhoz, agricultural cooperative"/>
      <item trans="rolník, rolníci"
            src="крестья́нин, крестья́не (pl.)"
            trans_en="farmers"/>
      <item trans="mladší" src="млáдший" trans_en="younger"/>
      <item trans="neočakávaně" src="неожи́данно" trans_en="unexpectedly"/>
      <item trans="oznamovat"
            src="объявля́ть"
            trans_en="to announce (imperfective)"/>
      <item trans="oznámit"
            src="объяви́ть (+ instr.) (объявлю́, объя́вишь, объя́вят)"
            trans_en="to announce (perfective)"/>
      <item trans="ocitat se"
            src="окáзываться"
            trans_en="to find oneself (imperfective)"/>
      <item trans="ocitnout se"
            src="оказáться (+ instr.) (окажýсь, окáжешься, окáжутся)"
            trans_en="to find oneself (perfective)"/>
      <item trans="otec" src="отéц" trans_en="Father"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson2/ChapterB/lekce4_4_cz.xml">
      <item trans="oddíl" src="отря́д" trans_en="unit, troop"/>
      <item trans="předávat, sdělovat"
            src="передавáть (передаю́, передаёшь, передаю́т)"
            trans_en="to pass on, to communicate (imperfective)"/>
      <item trans="předat, sdělit"
            src="передáть (передáм, передáшь, передáст, передади́м, передади́те, передаду́т)"
            trans_en="to pass on, to communicate (perfective)"/>
      <item trans="toulat se"
            src="переквалифици́роваться"
            trans_en="to wander, to roam"/>
      <item trans="podroben (-a, -o, -i)"
            src="репресси́рован (-а, -о, -ы)"
            trans_en="subjugated"/>
      <item trans="rodit se, narodit se" src="роди́ться" trans_en="to be born"/>
      <item trans="příbuzný" src="рóдственник" trans_en="relative"/>
      <item trans="obyvatel Ruské federace, obyvatelé RF"
            src="россия́нин, россия́не"
            trans_en="inhabitant of the Russian Federation, inhabitants of the RF"/>
      <item trans="štípat, kácet"
            src="руби́ть (рублю́, рýбишь, рýбят)"
            trans_en="to split, to cut down (imperfective)"/>
      <item trans="svobodný" src="свобóдный" trans_en="free"/>
      <item trans="sever" src="сéвер" trans_en="north"/>
      <item trans="chov dobytka" src="скотовóдство" trans_en="cattle farming"/>
      <item trans="sovětský" src="совéтский" trans_en="Soviet"/>
      <item trans="sovchoz, státní zemědělský podnik"
            src="совхóз"
            trans_en="Sovkhoz, government agricultural enterprise"/>
      <item trans="stavět, vytvářet"
            src="стрóить (стрóю, стрóишь, стрóят)"
            trans_en="to build, to create (imperfective)"/>
      <item trans="postavit, vytvořit"
            src="пострóить (пострóю, пострóишь, пострóят)"
            trans_en="to build, to create (perfective)"/>
      <item trans="šťastný" src="счастли́вый" trans_en="happy, lucky"/>
      <item trans="Durynsko" src="Тюри́нгия" trans_en="Thuringia"/>
      <item trans="pracovní armáda" src="трудáрмия" trans_en="labour army"/>
      <item trans="utíkat"
            src="убегáть"
            trans_en="to run (away) (imperfective)"/>
      <item trans="utéct"
            src="убежáть (убегý, убежи́шь, убегýт)"
            trans_en="to run away (perfective)"/>
      <item trans="dařit se"
            src="удавáться (удаётся, удаю́тся)"
            trans_en="to do well, to be successful (imperfective)"/>
      <item trans="podařit se"
            src="удáться (удáстся, удадýтся)"
            trans_en="it was successful"/>
      <item trans="divit se"
            src="удивля́ться"
            trans_en="to be surprised, to wonder (imperfective)"/>
      <item trans="podivit se"
            src="удиви́ться (удивлю́сь, удиви́шься, удивя́тся)"
            trans_en="to be surprised, to wonder (perfective)"/>
      <item trans="strašný" src="ужáсный" trans_en="horrible"/>
      <item trans="umírat" src="умирáть" trans_en="to die (imperfective)"/>
      <item trans="umřít"
            src="умерéть (умрý, умрёшь, умрýт)"
            trans_en="to die (perfective)"/>
      <item trans="řízení, vedení"
            src="управлéние"
            trans_en="management, leadership"/>
      <item trans="chuligán" src="хулигáн" trans_en="hooligan"/>
      <item trans="černý" src="чёрный" trans_en="black"/>
      <item trans="jih" src="юг" trans_en="south"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson2/ChapterC/lekce4_5_cz.xml">
      <item trans="odjezd" src="вы́езд" trans_en="departure"/>
      <item trans="stát" src="госудáрство" trans_en="stand"/>
      <item trans="dostatečně" src="достáточно" trans_en="sufficiently"/>
      <item trans="dostavovat"
            src="дострáивать"
            trans_en="finish building (imperfective)"/>
      <item trans="dostavět"
            src="дострóить (дострóю, дострóишь, дострóят)"
            trans_en="finish building (perfective)"/>
      <item trans="vyrušovat"
            src="мешáть (+ dat.)"
            trans_en="to disturb (imperfective)"/>
      <item trans="vyrušit"
            src="помешáть (+ dat.)"
            trans_en="to disturb (perfective)"/>
      <item trans="nikdy" src="никогдá" trans_en="never"/>
      <item trans="přestávka" src="переры́в" trans_en="break, intermission"/>
      <item trans="rozkvět" src="процветáние" trans_en="flourishing"/>
      <item trans="samostatný" src="самостоя́тельный" trans_en="independent"/>
      <item trans="sociální zabezpečení"
            src="социáльное обеспéчение"
            trans_en="social security"/>
      <item trans="utrpení" src="страдáние" trans_en="suffering"/>
      <item trans="vážit si" src="уважáть" trans_en="to respect"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson3/ChapterA/lekce5_1_cz.xml">
      <item trans="někdy" src="когдá-нибудь" trans_en="sometimes"/>
      <item trans="lehký" src="лёгкий" trans_en="light"/>
      <item trans="animovaný film"
            src="мультфи́льм"
            trans_en="cartoon, animated film"/>
      <item trans="novostavba" src="новострóйка" trans_en="new building"/>
      <item trans="osamělý" src="одинóкий" trans_en="solitary, lonely"/>
      <item trans="mladík" src="пáрень (m.)" trans_en="young man"/>
      <item trans="bázlivý, ostýchavý" src="рóбкий" trans_en="timid"/>
      <item trans="událost" src="собы́тие" trans_en="event"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson3/ChapterA/lekce5_2_cz.xml">
      <item trans="zámek" src="замóк" trans_en="lock"/>
      <item trans="instance" src="инстáнция" trans_en="instance"/>
      <item trans="schodiště" src="лéстничная клéтка" trans_en="staircase"/>
      <item trans="název" src="назвáние" trans_en="name"/>
      <item trans="stejný" src="одинáкoвый" trans_en="the same, identical"/>
      <item trans="dostávat se, strefovat se"
            src="попадáть"
            trans_en="to reach, to get, to hit (imperfective)"/>
      <item trans="dostat se, strefit se"
            src="попáсть (попадý, попадёшь, попадýт)"
            trans_en="to reach, to get, to hit (perfective)"/>
      <item trans="minulý (-á, -é)"
            src="прóшлый (-ая, -ое)"
            trans_en="last, past, previous"/>
      <item trans="zahradní" src="садóвый" trans_en="garden (adj.)"/>
      <item trans="stavitel, budovatel"
            src="строи́тель (m.)"
            trans_en="builder"/>
      <item trans="standardní" src="типoвóй" trans_en="standard"/>
      <item trans="umělecký" src="худóжественный" trans_en="artistic"/>
      <item trans="barva, barvy"
            src="цвет, цветá (pl.)"
            trans_en="colour, colours"/>
      <item trans="téměř (ne)" src="чуть ли (не)" trans_en="nearly (not)"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson3/ChapterB/lekce5_3_cz.xml">
      <item trans="ruská sauna, parní lázeň"
            src="бáня"
            trans_en="Russian sauna, steam bath"/>
      <item trans="nepořádek" src="беспоря́док" trans_en="mess"/>
      <item trans="budit"
            src="буди́ть (бужу́, бу́дишь, бу́дят)"
            trans_en="to wake (imperfective)"/>
      <item trans="vzbudit"
            src="разбуди́ть (разбужу́, разбу́дишь, разбу́дят)"
            trans_en="to wake (perfective)"/>
      <item trans="vracet se"
            src="возвращáться"
            trans_en="to return (imperfective)"/>
      <item trans="vrátit se" src="вернýться" trans_en="to return (perfective)"/>
      <item trans="hlavní" src="глáвный" trans_en="main, chief"/>
      <item trans="bezpečně, s jistotou"
            src="достовéрно"
            trans_en="safely, with certainty"/>
      <item trans="ženich" src="жени́х" trans_en="bridegroom"/>
      <item trans="zastrkat" src="запихáть" trans_en="to insert (imperfective)"/>
      <item trans="zastrčit" src="запихнýть" trans_en="to insert (perfective)"/>
      <item trans="měnit" src="изменя́ть" trans_en="to change (imperfective)"/>
      <item trans="změnit" src="измени́ть" trans_en="to change (perfective)"/>
      <item trans="klíč" src="ключ" trans_en="key"/>
      <item trans="silně" src="крéпко" trans_en="strongly"/>
      <item trans="mýt se" src="мы́ться" trans_en="to wash oneself"/>
      <item trans="umýt se" src="помы́ться" trans_en="wash oneself"/>
      <item trans="nápoj" src="напи́ток" trans_en="drink"/>
      <item trans="nevěsta" src="невéста" trans_en="bride"/>
      <item trans="odtud" src="оттýда" trans_en="from here, from there"/>
      <item trans="zřetelně, jasně" src="отчётливо" trans_en="clearly"/>
      <item trans="stát se zvykem"
            src="повести́сь"
            trans_en="to become a habit (perfective)"/>
      <item trans="předpokládat"
            src="предполагáть"
            trans_en="to presume (imperfective)"/>
      <item trans="vyslovit předpoklad"
            src="предположи́ть"
            trans_en="to express an assumption"/>
      <item trans="opilý (-á, -é)" src="пьян (-á, -ы́)" trans_en="drunk"/>
      <item trans="shodovat se, krýt se"
            src="совпадáть"
            trans_en="to match (imperfective)"/>
      <item trans="shodnout se"
            src="совпáсть (совпадý, совпадёшь, совпадýт)"
            trans_en="to match (perfective)"/>
      <item trans="právě" src="тóлько что" trans_en="just, exactly"/>
      <item trans="přesvědčen" src="увéрeн" trans_en="convinced"/>
      <item trans="čestný" src="чéстный" trans_en="honest"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson3/ChapterC/lekce5_4_cz.xml">
      <item trans="dobrodruh" src="авантюри́ст" trans_en="adventurer"/>
      <item trans="nestydatý" src="бессты́жий" trans_en="unabashed"/>
      <item trans="barbar" src="вáрвар" trans_en="barbarian"/>
      <item trans="vybíhat" src="выбегáть" trans_en="to choose (imperfective)"/>
      <item trans="vyběhnout"
            src="вы́бежать (вы́бегу, вы́бежишь, вы́бегут)"
            trans_en="to run out (perfective)"/>
      <item trans="vyspávat"
            src="высыпáться"
            trans_en="to sleep in (imperfective)"/>
      <item trans="vyspat se"
            src="вы́спаться (вы́сплюсь, вы́спишься, вы́спятся)"
            trans_en="to sleep (perfective)"/>
      <item trans="objasňovat"
            src="выясня́ть"
            trans_en="to explain (imperfective)"/>
      <item trans="objasnit" src="вы́яснить" trans_en="to explain (perfective)"/>
      <item trans="hloupost"
            src="глýпость (f.)"
            trans_en="foolishness, silliness, nonsense"/>
      <item trans="dlouhý" src="дли́нный" trans_en="long"/>
      <item trans="soucit" src="жáлость (f.)" trans_en="compassion"/>
      <item trans="Jaká škoda!" src="Какáя жáлость!" trans_en="Too bad!"/>
      <item trans="zlobit se"
            src="зли́ться "
            trans_en="to be angry (imperfective)"/>
      <item trans="končit" src="кончáть(ся)" trans_en="to end (imperfective)"/>
      <item trans="skončit" src="кóнчить(ся)" trans_en="to end (perfective)"/>
      <item trans="noční můra, hrůza" src="кошмáр" trans_en="nightmare"/>
      <item trans="krást" src="красть" trans_en="to steal (imperfective)"/>
      <item trans="ukrást" src="украсть" trans_en="to steal (perfective)"/>
      <item trans="někdo" src="ктó-то" trans_en="somebody/anybody"/>
      <item trans="kousek" src="кусóчек" trans_en="piece"/>
      <item trans="malý" src="мéлкий" trans_en="small"/>
      <item trans="moudrý" src="мýдрый" trans_en="wise"/>
      <item trans="drzoun" src="наглéц" trans_en="sauce-box"/>
      <item trans="sprosťák" src="нахáл" trans_en="foul mouth, lewd man"/>
      <item trans="hloupost"
            src="нелéпость (f.)"
            trans_en="foolishness, silliness, nonsense"/>
      <item trans="pitomec, trdlo" src="обалдýй" trans_en="nitwit"/>
      <item trans="zpět" src="обрáтно" trans_en="back"/>
      <item trans="vzpamatovat se"
            src="опóмниться"
            trans_en="to collect oneself, to get over something (perfective)"/>
      <item trans="pocit" src="ощущéние" trans_en="to honour"/>
      <item trans="půlhodina" src="полчасá" trans_en="half an hour"/>
      <item trans="posedět (si)"
            src="посидéть"
            trans_en="to sit for a while (perfective)"/>
      <item trans="tisknout se, tulit se"
            src="прижимáться"
            trans_en="to press oneself against stg./sb., to snuggle (up) against stg. / sb. (imperfective)"/>
      <item trans="přitisknout se, přitulit se"
            src="прижáться (прижму́сь, прижмёшься, прижмýтся)"
            trans_en="to press oneself against stg./sb., to snuggle (up) against stg. / sb. (perfective)"/>
      <item trans="trhat" src="разрывáть" trans_en="to tear (imperfective)"/>
      <item trans="roztrhat" src="разорвáть" trans_en="to tear (perfective)"/>
      <item trans="žárlit"
            src="ревновáть (+ dat.)"
            trans_en="to be jealous (imperfective)"/>
      <item trans="rozhodovat se"
            src="решáться"
            trans_en="to decide (imperfective)"/>
      <item trans="rozhodnout se"
            src="реши́ться"
            trans_en="to decide (perfective)"/>
      <item trans="ovládat (se)"
            src="сдéрживать(ся)"
            trans_en="to control (oneself) (imperfective)"/>
      <item trans="ovládnout (se)"
            src="сдeржáть(ся)"
            trans_en="to control (oneself) (perfective)"/>
      <item trans="zachraňovat"
            src="спасáть"
            trans_en="to rescue, to save (imperfective)"/>
      <item trans="zachránit"
            src="спасти́ (спасу́, спасёшь, спасýт)"
            trans_en="to rescue, to save (perfective)"/>
      <item trans="bláznivý" src="сумасшéдший" trans_en="crazy"/>
      <item trans="odcházet" src="сходи́ть" trans_en="to leave (imperfective)"/>
      <item trans="odejít" src="сойти́" trans_en="leave"/>
      <item trans="rozum" src="ум" trans_en="reason"/>
      <item trans="Ty jsi se zbláznila!"
            src="Ты с ума сошлá!"
            trans_en="You must have gone mad!"/>
      <item trans="chytrý, šikovný" src="ýмный" trans_en="clever, skilful"/>
      <item trans="unavovat se"
            src="уставáть"
            trans_en="to get tired (imperfective)"/>
      <item trans="unavit se"
            src="устáть (устáну, устáнешь, устáнут)"
            trans_en="to get tired (perfective)"/>
      <item trans="líbat" src="целовáть" trans_en="to kiss (imperfective)"/>
      <item trans="políbit" src="поцеловáть" trans_en="to kiss (perfective)"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson4/ChapterA/lekce6_1_cz.xml">
      <item trans="blízko" src="бли́зко" trans_en="nearly (not)"/>
      <item trans="(oficiální) návštěva"
            src="визи́т"
            trans_en="(official) visit"/>
      <item trans="dole" src="внизý" trans_en="down, below"/>
      <item trans="hasit" src="гаси́ть" trans_en="to extinguish (imperfective)"/>
      <item trans="uhasit"
            src="погаси́ть"
            trans_en="to extinguish (perfective)"/>
      <item trans="státní tajemník"
            src="госсекретáрь (m.), госудáрственный секретáрь"
            trans_en="state secretary"/>
      <item trans="host" src="гость (m.)" trans_en="guest"/>
      <item trans="vleklý, zdlouhavý"
            src="дли́тельный"
            trans_en="protracted, lengthy"/>
      <item trans="průvod" src="кортéж" trans_en="parade, procession"/>
      <item trans="Ministestvo zahraničních věcí"
            src="МИД, Министéрство инострáнных дел"
            trans_en="Ministry of Foreign Affairs"/>
      <item trans="nestátní"
            src="негосудáрственный"
            trans_en="non-governmental"/>
      <item trans="strážný, člen ochranky" src="охрáнник" trans_en="guard"/>
      <item trans="jednání (mn. č.)"
            src="переговóры (pl.)"
            trans_en="meeting (plural)"/>
      <item trans="pouštět" src="подпускáть" trans_en="to let (imperfective)"/>
      <item trans="pustit" src="подпусти́ть" trans_en="to let (perfective)"/>
      <item trans="navštívení, návštěva" src="посещéние" trans_en="visit"/>
      <item trans="velvyslanec, velvyslankyně"
            src="посóл, поcлá"
            trans_en="ambassador"/>
      <item trans="vládní" src="прави́тельственный" trans_en="governmental"/>
      <item trans="procházka" src="прогýлка" trans_en="walk"/>
      <item trans="prosba" src="прóсьба" trans_en="request"/>
      <item trans="míjet, procházet"
            src="проходи́ть"
            trans_en="to pass (imperfective)"/>
      <item trans="minout, projít"
            src="пройти́"
            trans_en="to pass (perfective)"/>
      <item trans="schůdky" src="трап" trans_en="small steps, stairs"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson4/ChapterA/lekce6_2_cz.xml">
      <item trans="mít vliv"
            src="влия́ть"
            trans_en="to have influence (imperfective)"/>
      <item trans="možnost" src="возмóжность (f.)" trans_en="possibility"/>
      <item trans="to je jedno" src="всё равнó" trans_en="it does not matter"/>
      <item trans="vybírat" src="выбирáть" trans_en="to choose (imperfective)"/>
      <item trans="vybrat" src="вы́брать" trans_en="to choose (perfective)"/>
      <item trans="pozvání, výzva"
            src="вы́зов"
            trans_en="invitation, challenge"/>
      <item trans="hlava" src="глaвá" trans_en="head, manager"/>
      <item trans="zaujmout, upoutat"
            src="заинтересовáть (+ instr.)"
            trans_en="to interest (perfective)"/>
      <item trans="katedra" src="кáфедра" trans_en="department"/>
      <item trans="něco" src="кóе-что" trans_en="something"/>
      <item trans="kruh" src="круг" trans_en="circle"/>
      <item trans="kupé" src="купé" trans_en="compartment"/>
      <item trans="-letý" src="-лéтний" trans_en="-year-old"/>
      <item trans="matka" src="мать (f.)" trans_en="Mother"/>
      <item trans="menší zlo" src="мéньшее зло" trans_en="lesser evil"/>
      <item trans="není možné" src="невозмóжно" trans_en="not possible"/>
      <item trans="nenucený, přirozený" src="непринуждённый" trans_en="natural"/>
      <item trans="povinný" src="обязáтельный" trans_en="mandatory"/>
      <item trans="diplomaticky"
            src="по-дипломати́чески"
            trans_en="in a diplomatic way"/>
      <item trans="podrobný" src="подрóбный" trans_en="detailed"/>
      <item trans="rozvoj" src="разви́тие" trans_en="development"/>
      <item trans="linka" src="рейс" trans_en="line"/>
      <item trans="případ" src="слýчай" trans_en="case"/>
      <item trans="spoluautor" src="соáвтор" trans_en="co-author"/>
      <item trans="obsažný"
            src="содержáтельный"
            trans_en="pithy, rich in content"/>
      <item trans="zahrát (si)" src="сыгрáть " trans_en="to play (perfective)"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson4/ChapterB/lekce6_3_cz.xml">
      <item trans="lahvička, plechovka" src="бáночка" trans_en="flask, can"/>
      <item trans="ve třech" src="втроём" trans_en="in a group of three"/>
      <item trans="východ" src="вы́ход" trans_en="east"/>
      <item trans="obývací pokoj" src="гости́ная" trans_en="living room"/>
      <item trans="host (žena)" src="гóстья" trans_en="guest (female)"/>
      <item trans="nahoře" src="наверхý" trans_en="up, on top"/>
      <item trans="vyskytovat se"
            src="находи́ться"
            trans_en="to occur (imperfective)"/>
      <item trans="vyskytnout se"
            src="найти́сь"
            trans_en="to occur (perfective)"/>
      <item trans="speciální služby"
            src="спецобслýживание, специáльное обслýживание"
            trans_en="special services"/>
      <item trans="stěhovat se"
            src="переселя́ться"
            trans_en="to move house (imperfective)"/>
      <item trans="přestěhovat se"
            src="пересели́ться"
            trans_en="to move house (perfective)"/>
      <item trans="pozdě" src="пóздно" trans_en="late"/>
      <item trans="pracovna" src="рабóчий кабинéт" trans_en="office"/>
      <item trans="realita" src="реáльность (f.)" trans_en="reality"/>
      <item trans="sám sebou" src="сам собóй (instr.)" trans_en="oneself"/>
      <item trans="rodinný" src="семéйный" trans_en="family (adj.)"/>
      <item trans="smělý" src="смéлый" trans_en="daring"/>
      <item trans="pohodlně" src="удóбно" trans_en="comfortably"/>
      <item trans="podmínka" src="услóвие" trans_en="the conditional"/>
      <item trans="činžák s malými byty"
            src="хрущёвка"
            trans_en="building with small flats"/>
      <item trans="krok" src="шаг" trans_en="step"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson4/ChapterC/lekce6_4_cz.xml">
      <item trans="gubernátor" src="губернáтор" trans_en="governor"/>
      <item trans="starodávný" src="дрéвний" trans_en="ancient"/>
      <item trans="lipecký" src="ли́пецкий" trans_en="of Lipetsk"/>
      <item trans="zvědavost, všetečnost"
            src="любопы́тство"
            trans_en="curiosity, nosiness"/>
      <item trans="málo" src="мáло (+ gen.)" trans_en="little"/>
      <item trans="myšlenka" src="мысль (f.)" trans_en="idea"/>
      <item trans="společný, společenský"
            src="общéственный"
            trans_en="common, social"/>
      <item trans="každodenní" src="повседнéвный" trans_en="every-day"/>
      <item trans="trochu lépe" src="полýчше" trans_en="a bit better"/>
      <item trans="poučovat" src="поучáть" trans_en="to lecture (imperfective)"/>
      <item trans="převaha" src="превосхóдство" trans_en="prevalence"/>
      <item trans="skromný" src="скрóмный" trans_en="modest"/>
      <item trans="společnice při rozhovoru"
            src="собесéдница"
            trans_en="companion in a dialogue"/>
      <item trans="televize" src="телеви́дeние" trans_en="television"/>
      <item trans="citlivý, jemný" src="чýткий" trans_en="sensitive, fine"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson5/ChapterA/lekce7_1_cz.xml">
      <item trans="agentura" src="агéнтство" trans_en="agency"/>
      <item trans="silný" src="крýпный" trans_en="strong"/>
      <item trans="vzdělání" src="образовáние" trans_en="education"/>
      <item trans="základ" src="оснóва" trans_en="base"/>
      <item trans="úspěšný, vzkvétající"
            src="преуспевáющий"
            trans_en="successful, flourishing"/>
      <item trans="výrobní" src="произвóдственный" trans_en="production (adj.)"/>
      <item trans="spolupracovník" src="сотрýдник" trans_en="co-worker"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson5/ChapterA/lekce7_2_cz.xml">
      <item trans="vyhlídkový let" src="авиатýр" trans_en="sightseeing flight"/>
      <item trans="blahobyt" src="благосостоя́ние" trans_en="welfare"/>
      <item trans="podobný" src="врóде" trans_en="similar"/>
      <item trans="vyplácet, splácet"
            src="выплáчивать"
            trans_en="to pay out, to pay up (imperfective)"/>
      <item trans="vyplatit, splatit"
            src="вы́платить (вы́плачу, вы́платишь, вы́платят)"
            trans_en="to pay out, to pay up (perfective)"/>
      <item trans="splnění, uskutečnění"
            src="выполнéние"
            trans_en="fulfilment, realisation"/>
      <item trans="trvat, vléci se"
            src="дли́ться"
            trans_en="to last, to drag on (imperfective)"/>
      <item trans="déle" src="дóльше" trans_en="longer"/>
      <item trans="přání" src="желáние" trans_en="wishes"/>
      <item trans="objednávka" src="закáз" trans_en="order"/>
      <item trans="hra" src="игрá" trans_en="game"/>
      <item trans="myšlenkový" src="идéйный" trans_en="mental"/>
      <item trans="vydání" src="издáние" trans_en="edition"/>
      <item trans="méně" src="мéньше" trans_en="less"/>
      <item trans="oblékat se"
            src="одевáться"
            trans_en="to dress (imperfective)"/>
      <item trans="obléknout se"
            src="одéться (одéнусь, одéнешься, одéнyтся)"
            trans_en="dress oneself"/>
      <item trans="nechávat, opouštět"
            src="оставля́ть"
            trans_en="to leave, to abandon (imperfective)"/>
      <item trans="nechat, opustit"
            src="остáвить (остáвлю, остáвишь, остáвят)"
            trans_en="to leave, to abandon (perfective)"/>
      <item trans="výdělek, plat" src="плáта" trans_en="earnings, pay"/>
      <item trans="půlnoc" src="пóлночь" trans_en="midnight"/>
      <item trans="do půlnoci" src="до полýночи" trans_en="until midnight"/>
      <item trans="používat"
            src="пóльзоваться"
            trans_en="to use (imperfective)"/>
      <item trans="pravidlo" src="прáвило" trans_en="rule"/>
      <item trans="být přítomen" src="присýтствовать" trans_en="to be present"/>
      <item trans="výroba, provedení"
            src="произвóдство"
            trans_en="production, execution"/>
      <item trans="vypracovávat"
            src="разрабáтывать"
            trans_en="to work out, to make (imperfective)"/>
      <item trans="vypracovat"
            src="разрабóтать"
            trans_en="to work out, to make (perfective)"/>
      <item trans="odevzdávat, předávat"
            src="сдавáть"
            trans_en="to hand over, to pass on (imperfective)"/>
      <item trans="odevzdat, předat"
            src="сдать (сдам, сдашь, сдадýт)"
            trans_en="to hand over, to pass on (perfective)"/>
      <item trans="zaměstnanec, úředník"
            src="слýжащий"
            trans_en="employee, clerk"/>
      <item trans="lhůta" src="срок" trans_en="deadline"/>
      <item trans="nábytková stěna"
            src="стéнка"
            trans_en="living room furniture set"/>
      <item trans="stylový, supermódní"
            src="сти́льный"
            trans_en="stylish, elegant, super-modern"/>
      <item trans="fotografování, filmování"
            src="съёмка"
            trans_en="photography, filming"/>
      <item trans="takový (-á, -é, -í)"
            src="такóв (-á, -ó, -ы́)"
            trans_en="such"/>
      <item trans="televizní divák"
            src="телезри́тель (m.)"
            trans_en="television viewer"/>
      <item trans="Turecko" src="Тýрция" trans_en="Turkey"/>
      <item trans="mladý" src="ю́ный" trans_en="young"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson5/ChapterB/lekce7_3_cz.xml">
      <item trans="vedoucí" src="ведýщий" trans_en="head, manager"/>
      <item trans="externí" src="внештáтный" trans_en="external"/>
      <item trans="pružný, tvárný" src="ги́бкий" trans_en="flexible, pliable"/>
      <item trans="ochrana, zabezpečení"
            src="защищённость (f.)"
            trans_en="protection, security"/>
      <item trans="zdravě uvažující"
            src="здравомы́слящий"
            trans_en="of a sound mind"/>
      <item trans="znalost" src="знáние" trans_en="knowledge"/>
      <item trans="kádr" src="кадр" trans_en="cadre"/>
      <item trans="je nutné" src="необходи́мо" trans_en="it is necessary"/>
      <item trans="několika (let)"
            src="нéскольких (лет)"
            trans_en="several (years)"/>
      <item trans="končit" src="окáнчивать" trans_en="to end (imperfective)"/>
      <item trans="skončit" src="окóнчить" trans_en="to end (perfective)"/>
      <item trans="odpověď" src="отвéт" trans_en="reply, response"/>
      <item trans="podobný" src="подóбный" trans_en="similar"/>
      <item trans="hledání" src="пóиск" trans_en="search"/>
      <item trans="stálý" src="постоя́нный" trans_en="constant"/>
      <item trans="mít úspěch" src="преуспевáть" trans_en="to be successful"/>
      <item trans="dosáhnout úspěchu"
            src="преуспéть"
            trans_en="to achieve, to accomplish (perfective)"/>
      <item trans="musel jsem" src="мне пришлóсь" trans_en="I had to"/>
      <item trans="rozvíjet se"
            src="развивáться"
            trans_en="to develop (imperfective)"/>
      <item trans="rozvinout se"
            src="разви́ться (разовью́сь, разовьёшься, развью́тся)"
            trans_en="to develop (perfective)"/>
      <item trans="růst" src="расти́" trans_en="to grow (imperfective)"/>
      <item trans="vyrůst" src="вы́расти" trans_en="to grow up (perfective)"/>
      <item trans="existovat" src="существовáть" trans_en="to exist"/>
      <item trans="propouštět"
            src="увольня́ть"
            trans_en="to release (imperfective)"/>
      <item trans="propustit" src="увóлить" trans_en="release"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson5/ChapterC/lekce7_4_cz.xml">
      <item trans="odvedení, odvození"
            src="вы́вод"
            trans_en="derivation, deduction"/>
      <item trans="být hrdý" src="горди́ться" trans_en="to be proud"/>
      <item trans="jednotka" src="едини́ца" trans_en="unit"/>
      <item trans="zdravý" src="здорóвый" trans_en="healthy"/>
      <item trans="význam" src="значéние" trans_en="meaning"/>
      <item trans="světonázor" src="мировоззрéние" trans_en="worldview"/>
      <item trans="cítít" src="ощущáть" trans_en="to feel (imperfective)"/>
      <item trans="pocítit" src="ощути́ть" trans_en="to feel (perfective)"/>
      <item trans="pohrdání, opovržení" src="презрéние" trans_en="contempt"/>
      <item trans="prodavač"
            src="продавéц"
            trans_en="sales clerk, shop assistant"/>
      <item trans="volant" src="руль (m.)" trans_en="steering wheel"/>
      <item trans="úhel pohledu" src="тóчка зрéния" trans_en="point of view"/>
      <item trans="přesvědčení" src="убеждéние" trans_en="conviction"/>
      <item trans="úspěch" src="удáча" trans_en="success"/>
      <item trans="snižovat, ponižovat"
            src="унижáть"
            trans_en="to lower, to decrease (imperfective)"/>
      <item trans="snížit, ponížit"
            src="уни́зить"
            trans_en="to lower, to decrease (perfective)"/>
      <item trans="pozadí" src="фон" trans_en="background"/>
      <item trans="cennost, hodnota"
            src="цéнность (f.)"
            trans_en="valuable, value"/>
      <item trans="neskrývaný, zjevný"
            src="я́вный"
            trans_en="unconcealed, apparent"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson6/ChapterA/lekce8_1_cz.xml">
      <item trans="Bůh" src="бог" trans_en="God"/>
      <item trans="existence" src="бытиé" trans_en="existence"/>
      <item trans="věřící" src="вéрующий" trans_en="believer"/>
      <item trans="hrdý" src="гóрдый" trans_en="proud"/>
      <item trans="Pán (Bůh)" src="госпóдь" trans_en="God"/>
      <item trans="nazývat se"
            src="назывáться (+ instr.)"
            trans_en="to be called (imperfective)"/>
      <item trans="nazvat se"
            src="назвáться (+ instr.)"
            trans_en="to be called (perfective)"/>
      <item trans="záporný" src="отрицáтельный" trans_en="negative"/>
      <item trans="římský papež" src="Пáпа Ри́мский" trans_en="Roman pope"/>
      <item trans="odpadlík (církevní slovanština)"
            src="па́доша"
            trans_en="apostate, renegade (church Slavic)"/>
      <item trans="právo" src="прáво" trans_en="right"/>
      <item trans="pravoslaví" src="правослáвие" trans_en="Orthodox faith"/>
      <item trans="pravoslavný" src="правослáвный" trans_en="Orthodox (adj.)"/>
      <item trans="Řím" src="Pим" trans_en="Rome"/>
      <item trans="vlastní hodnocení"
            src="самооцéнка"
            trans_en="self-assessment"/>
      <item trans="bohoslužba" src="слýжба" trans_en="(church) service"/>
      <item trans="zachovávat se"
            src="сохраня́ться"
            trans_en="to behave (imperfective)"/>
      <item trans="zachovat se"
            src="сохрани́ться"
            trans_en="to behave (perfective)"/>
      <item trans="výklad" src="толковáние" trans_en="explanation"/>
      <item trans="církev" src="цéрковь (f.)" trans_en="church (denomination)"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson6/ChapterA/lekce8_2_cz.xml">
      <item trans="letiště" src="аэропóрт" trans_en="airport"/>
      <item trans="zamilovat se"
            src="влюби́ться"
            trans_en="to fall in love (perfective)"/>
      <item trans="nepřítel" src="враг" trans_en="enemy"/>
      <item trans="dávno" src="давны́м-давнó" trans_en="a long time ago"/>
      <item trans="duch" src="дух" trans_en="spirit, ghost"/>
      <item trans="zamyšleně" src="задýмчиво" trans_en="contemplatively"/>
      <item trans="je zakázáno" src="запрещенó" trans_en="it is prohibited"/>
      <item trans="knižní" src="кни́жный" trans_en="book (adj.), bookish"/>
      <item trans="kříž" src="крест" trans_en="cross"/>
      <item trans="žehnat křížem, křtít"
            src="крести́ть"
            trans_en="to bless with a cross, to baptise"/>
      <item trans="křest" src="крещéние" trans_en="baptism"/>
      <item trans="modlitební kniha" src="моли́твенник" trans_en="prayer book"/>
      <item trans="prohlížet"
            src="осмáтривать"
            trans_en="to examine, to inspect (imperfective)"/>
      <item trans="prohlédnout"
            src="осмотрéть"
            trans_en="to examine, to inspect (perfective)"/>
      <item trans="odvézt"
            src="повезти́"
            trans_en="to remove, to take away (perfective)"/>
      <item trans="užitečný" src="полéзный" trans_en="useful"/>
      <item trans="příjezd" src="приéзд" trans_en="arrival"/>
      <item trans="farnost, fara" src="прихóд" trans_en="parish, parish house"/>
      <item trans="uskutečnění" src="проведéние" trans_en="realisation"/>
      <item trans="přímý" src="прямóй" trans_en="direct"/>
      <item trans="říza, mešní roucho" src="ри́за" trans_en="vestment"/>
      <item trans="Rus" src="Русь (f.)" trans_en="a Russian"/>
      <item trans="trpět" src="страдáть" trans_en="to suffer (imperfective)"/>
      <item trans="utrpět" src="пострадáть" trans_en="to suffer (perfective)"/>
      <item trans="tajně" src="тáйно" trans_en="secretly"/>
      <item trans="skříň" src="шкаф" trans_en="closet, wardrobe"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson6/ChapterB/lekce8_3_cz.xml">
      <item trans="ikonostas" src="иконостáс" trans_en="iconostasis"/>
      <item trans="křižovat se"
            src="крести́ться"
            trans_en="to cross oneself (imperfective)"/>
      <item trans="kroužek" src="кружóк" trans_en="group"/>
      <item trans="mimo" src="ми́мо" trans_en="outside"/>
      <item trans="mládež" src="молодёжь (m.)" trans_en="youth"/>
      <item trans="mnich" src="монáх" trans_en="monk"/>
      <item trans="oběd" src="обéд" trans_en="lunch"/>
      <item trans="patřící náboženské obci"
            src="общи́нный"
            trans_en="belonging to a religious community"/>
      <item trans="ukázání, předvedení"
            src="покáз"
            trans_en="demonstration, manifestation"/>
      <item trans="poklona" src="поклóн" trans_en="tribute"/>
      <item trans="rozmístění" src="размещéние" trans_en="distribution"/>
      <item trans="zkoušet"
            src="репети́ровать"
            trans_en="to try (imperfective)"/>
      <item trans="vyzkoušet"
            src="порепети́ровать"
            trans_en="to try (perfective)"/>
      <item trans="sloužit" src="служи́ть" trans_en="to serve (imperfective)"/>
      <item trans="posloužit" src="послужи́ть" trans_en="to serve (perfective)"/>
      <item trans="rozrušen (-a, -i)"
            src="смущён (-енá, -ены́)"
            trans_en="upset, agitated"/>
      <item trans="čtení" src="чтéние" trans_en="reading"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson6/ChapterC/lekce8_4_cz.xml">
      <item trans="blízký (-á, -cí)"
            src="бли́зок (-зкá, -зки́)"
            trans_en="close"/>
      <item trans="bohoslužba" src="богослужéние" trans_en="(church) service"/>
      <item trans="nádherně" src="великолéпно" trans_en="beautifully"/>
      <item trans="dojem" src="впечатлéние" trans_en="impression"/>
      <item trans="duševní" src="душéвный" trans_en="spiritual"/>
      <item trans="zavírat (se)"
            src="закрывáть(ся)"
            trans_en="to close (oneself) (imperfective)"/>
      <item trans="zavřít (se)"
            src="закры́ть(ся)"
            trans_en="to close (oneself) (perfective)"/>
      <item trans="jako by" src="как бýдто" trans_en="as if"/>
      <item trans="panenka" src="кýкла" trans_en="doll"/>
      <item trans="připomínat"
            src="напоминáть (+ dat.)"
            trans_en="to remind (imperfective)"/>
      <item trans="připomenout"
            src="напóмнить (+ dat.)"
            trans_en="to remind (perfective)"/>
      <item trans="nedostupný (-á, -é)"
            src="недостýпен (-пна, -пны)"
            trans_en="inaccessible"/>
      <item trans="nezvykle" src="непривы́чно" trans_en="unusually"/>
      <item trans="zpěv" src="пéние" trans_en="singing"/>
      <item trans="trochu blíže" src="побли́же" trans_en="a bit closer"/>
      <item trans="svíce" src="свечá" trans_en="candle"/>
      <item trans="lavička" src="скамéйка" trans_en="bench"/>
      <item trans="teplý" src="тёплый" trans_en="warm"/>
      <item trans="ucho, uši" src="ýхо, ýши" trans_en="ear, ears"/>
      <item trans="Carská vrata (část ikonostasu)"
            src="Цáрские вратá (pl.)"
            trans_en="Holy (Royal) Doors"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson7/ChapterA/lekce9_1_cz.xml">
      <item trans="veliký" src="вели́кий" trans_en="large, great"/>
      <item trans="poprvé" src="впервы́е" trans_en="for the first time"/>
      <item trans="hrom" src="гром" trans_en="thunder"/>
      <item trans="pozoruhodný" src="замечáтельный" trans_en="remarkable"/>
      <item trans="znásilnění" src="изнаси́лование" trans_en="rape"/>
      <item trans="liják" src="ли́вень (m.)" trans_en="downpour"/>
      <item trans="neznalost"
            src="незнáние"
            trans_en="lack of knowledge, ignorance"/>
      <item trans="úryvek" src="отры́вок" trans_en="excerpt"/>
      <item trans="přečkávat"
            src="пережидáть"
            trans_en="to wait out (imperfective)"/>
      <item trans="přečkat" src="переждáть" trans_en="to wait out (perfective)"/>
      <item trans="burácení" src="перекáт" trans_en="roaring"/>
      <item trans="chování, jednání"
            src="поведéние"
            trans_en="behaviour, conduct"/>
      <item trans="provedení, dílo"
            src="произведéние"
            trans_en="execution, work"/>
      <item trans="obsah" src="содержáние" trans_en="content"/>
      <item trans="temný" src="тёмный" trans_en="dark"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson7/ChapterA/lekce9_2_cz.xml">
      <item trans="versta (ruská měrná jednotka délky)"
            src="верстá"
            trans_en="verst (Russian unit of length)"/>
      <item trans="hořet" src="горéть" trans_en="to burn (imperfective)"/>
      <item trans="shořet" src="сгорéть" trans_en="to burn (perfective)"/>
      <item trans="světnice" src="гóрница" trans_en="sitting room"/>
      <item trans="hruď, prsa" src="грудь (f.)" trans_en="chest"/>
      <item trans="ret, rty" src="губá, гýбы (pl.)" trans_en="lip, lips"/>
      <item trans="bláznivá žena" src="дýрочка" trans_en="a crazy woman"/>
      <item trans="pro, kvůli"
            src="за-рáди (+ gen.)"
            trans_en="for, because of"/>
      <item trans="zapalovat" src="зажигáть" trans_en="to light (imperfective)"/>
      <item trans="zapálit"
            src="зажéчь (зажгý, зажжёшь, зажгýт)"
            trans_en="to light (perfective)"/>
      <item trans="křik" src="крик" trans_en="shouting"/>
      <item trans="zápraží" src="крыльцó" trans_en="doorstep"/>
      <item trans="přicházet" src="наступáть" trans_en="to arrive"/>
      <item trans="přijít" src="наступи́ть" trans_en="come"/>
      <item trans="nebe" src="нéбо" trans_en="sky"/>
      <item trans="náhrdelník" src="ожерéлье" trans_en="necklace"/>
      <item trans="zastavovat se"
            src="останáвливаться"
            trans_en="to stop (imperfective)"/>
      <item trans="zastavit se"
            src="останoви́ться"
            trans_en="to stop (perfective)"/>
      <item trans="šaty" src="плáтье" trans_en="dress"/>
      <item trans="otáčet se"
            src="повёртываться"
            trans_en="to turn (imperfective)"/>
      <item trans="otočit se" src="повернýться" trans_en="to turn (perfective)"/>
      <item trans="posílat" src="посылáть" trans_en="to send (imperfective)"/>
      <item trans="poslat" src="послáть" trans_en="to send (perfective)"/>
      <item trans="protahovat se"
            src="потя́гиваться"
            trans_en="to stretch (imperfective)"/>
      <item trans="protáhnout se"
            src="потянýться"
            trans_en="to stretch (perfective)"/>
      <item trans="zabručet, zahuhlat"
            src="пробормотáть"
            trans_en="to grumble, to mutter (perfective)"/>
      <item trans="lekat se"
            src="пугáться"
            trans_en="to startle (imperfective)"/>
      <item trans="leknout se"
            src="испугáться"
            trans_en="to startle (perfective)"/>
      <item trans="lupič" src="разбóйник" trans_en="burglar"/>
      <item trans="předsíňka, chodbička"
            src="сéнцы (pl.)"
            trans_en="hall, corridor"/>
      <item trans="klouzat"
            src="скользи́ть (скольжу́, скользи́шь, скользя́т)"
            trans_en="to slip, slide, skid (imperfective)"/>
      <item trans="uklouznout"
            src="скользну́ть"
            trans_en="to slip (perfective)"/>
      <item trans="dobytek" src="скоти́на" trans_en="cattle"/>
      <item trans="zápalka" src="спи́чка" trans_en="match"/>
      <item trans="stařec" src="стари́к" trans_en="old man"/>
      <item trans="tmavnout" src="темнéть" trans_en="to darken (imperfective)"/>
      <item trans="ztmavnout"
            src="потемнéть"
            trans_en="to grow dark (perfective)"/>
      <item trans="temnota" src="темнотá" trans_en="darkness"/>
      <item trans="mrak" src="тýча" trans_en="cloud"/>
      <item trans="hospodář, pán domu" src="хозя́ин" trans_en="landlord"/>
      <item trans="hrdlo" src="шéйка" trans_en="throat"/>
    </lmap>
    <lmap ident="~/Russian3/Lesson7/ChapterB/lekce9_3_cz.xml">
      <item trans="oženit se"
            src="взять зáмуж"
            trans_en="to get married (perfective)"/>
      <item trans="náhlost" src="внезáпность (f.)" trans_en="suddenness"/>
      <item trans="vlas" src="вóлос" trans_en="hair"/>
      <item trans="vyskakovat"
            src="вскáкивать"
            trans_en="to jump out (imperfective)"/>
      <item trans="vyskočit"
            src="вскочи́ть"
            trans_en="to jump out (perfective)"/>
      <item trans="držet" src="держáть" trans_en="to hold (imperfective)"/>
      <item trans="usínat"
            src="засыпáть"
            trans_en="to fall asleep (imperfective)"/>
      <item trans="usnout" src="заснýть" trans_en="to fall asleep (perfective)"/>
      <item trans="levý" src="лéвый" trans_en="left"/>
      <item trans="milý" src="ми́лый" trans_en="pleasant"/>
      <item trans="naznak" src="нáвзничь" trans_en="on one's back"/>
      <item trans="pryčna" src="нáры (pl.)" trans_en="plank bed"/>
      <item trans="povalovat"
            src="опроки́дывать"
            trans_en="to lie about (imperfective)"/>
      <item trans="povalit"
            src="опроки́нуть"
            trans_en="to knock down (perfective)"/>
      <item trans="cigareta s dutinkou"
            src="папирóса"
            trans_en="cigarette with a tube"/>
      <item trans="rameno" src="плечó" trans_en="shoulder"/>
      <item trans="pravý" src="прáвый" trans_en="right"/>
      <item trans="uhlazovat"
            src="приглáживать"
            trans_en="to smoothen (imperfective)"/>
      <item trans="uhladit"
            src="приглáдить"
            trans_en="to smoothen (perfective)"/>
      <item trans="otrok, otrokyně" src="раб, рабá" trans_en="slave"/>
      <item trans="rozhazovat"
            src="разбрáсывать"
            trans_en="to spread out (imperfective)"/>
      <item trans="rozhodit"
            src="разбросáть"
            trans_en="to spread out (perfective)"/>
      <item trans="rozepnutý"
            src="расстёгнутый"
            trans_en="unbuttoned, opened up"/>
      <item trans="samolibě" src="самодовóльно" trans_en="smugly, complacently"/>
      <item trans="stávat se"
            src="случáться"
            trans_en="to happen (imperfective)"/>
      <item trans="stát se" src="случи́ться" trans_en="to become"/>
      <item trans="klidně" src="сми́рно" trans_en="calmly"/>
      <item trans="zamotaný, popletený"
            src="спýтанный"
            trans_en="tangled up, confused"/>
      <item trans="hrůza" src="ýжас" trans_en="horror"/>
      <item trans="široce" src="широкó" trans_en="broadly"/>
    </lmap>
  </xsl:variable>

  <xsl:variable name="mw_items">
    <item type="make-word" id="cw1" name="Russian1/Lesson1/ChapterC/Krossvord.htm"
      ident="лг+трефбаслп+о+н+и+м+а+т+ь+с+кёв+д+ми+внйл+рйо+у+д+дг+бку+уур+м+ёе+лр+чш+июи+а+юял+ца+а+йят+т+смьа+ет+чэь+ь+тз+н+а+т+ь+ь+еиугкцcдь+p">
      <line>
        <td>л</td>
        <td answer="true">г</td>
        <td>т</td>
        <td>р</td>
        <td>е</td>
        <td>ф</td>
        <td>б</td>
        <td>а</td>
        <td>с</td>
        <td>л</td>
      </line>
      <line>
        <td answer="true">п</td>
        <td answer="true">о</td>
        <td answer="true">н</td>
        <td answer="true">и</td>
        <td answer="true">м</td>
        <td answer="true">а</td>
        <td answer="true">т</td>
        <td answer="true">ь</td>
        <td answer="true">с</td>
        <td>к</td>
      </line>
      <line>
        <td>ё</td>
        <td answer="true">в</td>
        <td answer="true">д</td>
        <td>м</td>
        <td answer="true">и</td>
        <td>в</td>
        <td>н</td>
        <td>й</td>
        <td answer="true">л</td>
        <td>р</td>
      </line>
      <line>
        <td>й</td>
        <td answer="true">о</td>
        <td answer="true">у</td>
        <td answer="true">д</td>
        <td>д</td>
        <td answer="true">г</td>
        <td>б</td>
        <td>к</td>
        <td answer="true">у</td>
        <td>у</td>
      </line>
      <line>
        <td>у</td>
        <td answer="true">р</td>
        <td answer="true">м</td>
        <td>ё</td>
        <td answer="true">е</td>
        <td>л</td>
        <td answer="true">р</td>
        <td>ч</td>
        <td answer="true">ш</td>
        <td>и</td>
      </line>
      <line>
        <td>ю</td>
        <td answer="true">и</td>
        <td answer="true">а</td>
        <td>ю</td>
        <td>я</td>
        <td answer="true">л</td>
        <td>ц</td>
        <td answer="true">а</td>
        <td answer="true">а</td>
        <td>й</td>
      </line>
      <line>
        <td>я</td>
        <td answer="true">т</td>
        <td answer="true">т</td>
        <td>с</td>
        <td>м</td>
        <td>ь</td>
        <td answer="true">а</td>
        <td>е</td>
        <td answer="true">т</td>
        <td>ч</td>
      </line>
      <line>
        <td>э</td>
        <td answer="true">ь</td>
        <td answer="true">ь</td>
        <td>т</td>
        <td answer="true">з</td>
        <td answer="true">н</td>
        <td answer="true">а</td>
        <td answer="true">т</td>
        <td answer="true">ь</td>
        <td answer="true">ь</td>
      </line>
      <line>
        <td>е</td>
        <td>и</td>
        <td>у</td>
        <td>г</td>
        <td>к</td>
        <td>ц</td>
        <td>c</td>
        <td>д</td>
        <td answer="true">ь</td>
        <td>p</td>
      </line>
    </item>
    <item type="make-word" id="cw1" name="Russian1/Lesson2/ChapterB/Krosvord.htm"
      ident="ДСЩПШАП+А+Р+И+Ж+ШЧТЖЕЮЯР+ИЛГР+ДВ+А+Р+Ш+А+В+А+ЭМАИ+ЖИ+С+С+Т+О+К+Г+О+Л+Ь+М+ЦЛ+О+РУЩБА+ЬО+ЧАСЬ+Ф+ХЮЗЯЁБН+ШХЭН+И+ШМ+А+Д+Р+И+Д+ЦЕМ+Ю+Я+ФЧГЬЭЕО+СЮО+С+МПЮХЗОЮН+РЬС+АЖЁЯЕРТМ+И+Н+С+К+ШХЧБ+БВДСЕЦИВ+К+О+П+Е+Н+Г+А+Г+Е+Н+ЛА+ЭДФР+ЧЕХЦЖЁКИЗУИН+КЛБ+Е+Р+Л+И+Н+">
      <line>
        <td>Д</td>
        <td>С</td>
        <td>Щ</td>
        <td>П</td>
        <td>Ш</td>
        <td>А</td>
        <td answer="true">П</td>
        <td answer="true">А</td>
        <td answer="true">Р</td>
        <td answer="true">И</td>
        <td answer="true">Ж</td>
        <td>Ш</td>
      </line>
      <line>
        <td>Ч</td>
        <td>Т</td>
        <td>Ж</td>
        <td>Е</td>
        <td>Ю</td>
        <td>Я</td>
        <td answer="true">Р</td>
        <td>И</td>
        <td>Л</td>
        <td>Г</td>
        <td answer="true">Р</td>
        <td>Д</td>
      </line>
      <line>
        <td answer="true">В</td>
        <td answer="true">А</td>
        <td answer="true">Р</td>
        <td answer="true">Ш</td>
        <td answer="true">А</td>
        <td answer="true">В</td>
        <td answer="true">А</td>
        <td>Э</td>
        <td>М</td>
        <td>А</td>
        <td answer="true">И</td>
        <td>Ж</td>
      </line>
      <line>
        <td answer="true">И</td>
        <td answer="true">С</td>
        <td answer="true">С</td>
        <td answer="true">Т</td>
        <td answer="true">О</td>
        <td answer="true">К</td>
        <td answer="true">Г</td>
        <td answer="true">О</td>
        <td answer="true">Л</td>
        <td answer="true">Ь</td>
        <td answer="true">М</td>
        <td>Ц</td>
      </line>
      <line>
        <td answer="true">Л</td>
        <td answer="true">О</td>
        <td>Р</td>
        <td>У</td>
        <td>Щ</td>
        <td>Б</td>
        <td answer="true">А</td>
        <td>Ь</td>
        <td answer="true">О</td>
        <td>Ч</td>
        <td>А</td>
        <td>С</td>
      </line>
      <line>
        <td answer="true">Ь</td>
        <td answer="true">Ф</td>
        <td>Х</td>
        <td>Ю</td>
        <td>З</td>
        <td>Я</td>
        <td>Ё</td>
        <td>Б</td>
        <td answer="true">Н</td>
        <td>Ш</td>
        <td>Х</td>
        <td>Э</td>
      </line>
      <line>
        <td answer="true">Н</td>
        <td answer="true">И</td>
        <td>Ш</td>
        <td answer="true">М</td>
        <td answer="true">А</td>
        <td answer="true">Д</td>
        <td answer="true">Р</td>
        <td answer="true">И</td>
        <td answer="true">Д</td>
        <td>Ц</td>
        <td>Е</td>
        <td answer="true">М</td>
      </line>
      <line>
        <td answer="true">Ю</td>
        <td answer="true">Я</td>
        <td>Ф</td>
        <td>Ч</td>
        <td>Г</td>
        <td>Ь</td>
        <td>Э</td>
        <td>Е</td>
        <td answer="true">О</td>
        <td>С</td>
        <td>Ю</td>
        <td answer="true">О</td>
      </line>
      <line>
        <td answer="true">С</td>
        <td>М</td>
        <td>П</td>
        <td>Ю</td>
        <td>Х</td>
        <td>З</td>
        <td>О</td>
        <td>Ю</td>
        <td answer="true">Н</td>
        <td>Р</td>
        <td>Ь</td>
        <td answer="true">С</td>
      </line>
      <line>
        <td>А</td>
        <td>Ж</td>
        <td>Ё</td>
        <td>Я</td>
        <td>Е</td>
        <td>Р</td>
        <td>Т</td>
        <td answer="true">М</td>
        <td answer="true">И</td>
        <td answer="true">Н</td>
        <td answer="true">С</td>
        <td answer="true">К</td>
      </line>
      <line>
        <td>Ш</td>
        <td>Х</td>
        <td>Ч</td>
        <td answer="true">Б</td>
        <td>Б</td>
        <td>В</td>
        <td>Д</td>
        <td>С</td>
        <td>Е</td>
        <td>Ц</td>
        <td>И</td>
        <td answer="true">В</td>
      </line>
      <line>
        <td answer="true">К</td>
        <td answer="true">О</td>
        <td answer="true">П</td>
        <td answer="true">Е</td>
        <td answer="true">Н</td>
        <td answer="true">Г</td>
        <td answer="true">А</td>
        <td answer="true">Г</td>
        <td answer="true">Е</td>
        <td answer="true">Н</td>
        <td>Л</td>
        <td answer="true">А</td>
      </line>
      <line>
        <td>Э</td>
        <td>Д</td>
        <td>Ф</td>
        <td answer="true">Р</td>
        <td>Ч</td>
        <td>Е</td>
        <td>Х</td>
        <td>Ц</td>
        <td>Ж</td>
        <td>Ё</td>
        <td>К</td>
        <td>И</td>
      </line>
      <line>
        <td>З</td>
        <td>У</td>
        <td>И</td>
        <td answer="true">Н</td>
        <td>К</td>
        <td>Л</td>
        <td answer="true">Б</td>
        <td answer="true">Е</td>
        <td answer="true">Р</td>
        <td answer="true">Л</td>
        <td answer="true">И</td>
        <td answer="true">Н</td>
      </line>
    </item>
    <item type="make-word" id="cw1" name="Russian1/Lesson3/ChapterA/Krossvord.htm"
      ident="ОЧ+Е+Т+Ы+Р+Е+П+АКД+РД+В+А+СЯ+КЙЕ+О+БО+ФГТ+ЖШВ+Д+Е+С+Я+Т+Ь+ЩИЯ+И+Ш+Е+С+Т+Ь+ВРТ+Н+ФМ+ЛР+ЗКДЬ+ЧМЬ+РИ+КА">
      <line>
        <td>О</td>
        <td answer="true">Ч</td>
        <td answer="true">Е</td>
        <td answer="true">Т</td>
        <td answer="true">Ы</td>
        <td answer="true">Р</td>
        <td answer="true">Е</td>
        <td answer="true">П</td>
        <td>А</td>
      </line>
      <line>
        <td>К</td>
        <td answer="true">Д</td>
        <td>Р</td>
        <td answer="true">Д</td>
        <td answer="true">В</td>
        <td answer="true">А</td>
        <td>С</td>
        <td answer="true">Я</td>
        <td>К</td>
      </line>
      <line>
        <td>Й</td>
        <td answer="true">Е</td>
        <td answer="true">О</td>
        <td>Б</td>
        <td answer="true">О</td>
        <td>Ф</td>
        <td>Г</td>
        <td answer="true">Т</td>
        <td>Ж</td>
      </line>
      <line>
        <td>Ш</td>
        <td answer="true">В</td>
        <td answer="true">Д</td>
        <td answer="true">Е</td>
        <td answer="true">С</td>
        <td answer="true">Я</td>
        <td answer="true">Т</td>
        <td answer="true">Ь</td>
        <td>Щ</td>
      </line>
      <line>
        <td>И</td>
        <td answer="true">Я</td>
        <td answer="true">И</td>
        <td answer="true">Ш</td>
        <td answer="true">Е</td>
        <td answer="true">С</td>
        <td answer="true">Т</td>
        <td answer="true">Ь</td>
        <td>В</td>
      </line>
      <line>
        <td>Р</td>
        <td answer="true">Т</td>
        <td answer="true">Н</td>
        <td>Ф</td>
        <td answer="true">М</td>
        <td>Л</td>
        <td answer="true">Р</td>
        <td>З</td>
        <td>К</td>
      </line>
      <line>
        <td>Д</td>
        <td answer="true">Ь</td>
        <td>Ч</td>
        <td>М</td>
        <td answer="true">Ь</td>
        <td>Р</td>
        <td answer="true">И</td>
        <td>К</td>
        <td>А</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="Russian1/Lesson4/ChapterB/Krossvord.htm"
      col_header="letter" row_header="number"
      ident="шамп*анское-сыр*------лимо*н------вод*ка------су*п--------к*олбасаторт*--------ры*ба----">
      <line>
        <td>-</td>
        <td header="true">a</td>
        <td header="true">b</td>
        <td header="true">c</td>
        <td header="true">d</td>
        <td header="true">e</td>
        <td header="true">f</td>
        <td header="true">g</td>
        <td header="true">h</td>
        <td header="true">i</td>
        <td header="true">ak</td>
      </line>
      <line>
        <td header="true">1.</td>
        <td>ш</td>
        <td>а</td>
        <td>м</td>
        <td hint="true">п</td>
        <td>а</td>
        <td>н</td>
        <td>с</td>
        <td>к</td>
        <td>о</td>
        <td>е</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>с</td>
        <td>ы</td>
        <td hint="true">р</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>л</td>
        <td>и</td>
        <td>м</td>
        <td hint="true">о</td>
        <td>н</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>в</td>
        <td>о</td>
        <td hint="true">д</td>
        <td>к</td>
        <td>а</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>с</td>
        <td hint="true">у</td>
        <td>п</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">к</td>
        <td>о</td>
        <td>л</td>
        <td>б</td>
        <td>а</td>
        <td>с</td>
        <td>а</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>т</td>
        <td>о</td>
        <td>р</td>
        <td hint="true">т</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>р</td>
        <td hint="true">ы</td>
        <td>б</td>
        <td>а</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="Russian1/Lesson5/ChapterC/Krossvord.htm"
      col_header="letter" row_header="number"
      ident="--------пp*oвoдник--------вa*гoн-------------c*тaкaны----------п*yть----oтпpaвлeни*e-------------мec*тo--------кoнфeтa*----------чeмoдaн*---------------би*лeт----------кyпe*-------">
      <line>
        <td>-</td>
        <td header="true">a</td>
        <td header="true">b</td>
        <td header="true">c</td>
        <td header="true">d</td>
        <td header="true">e</td>
        <td header="true">f</td>
        <td header="true">g</td>
        <td header="true">h</td>
        <td header="true">i</td>
        <td header="true">ak</td>
        <td header="true">aa</td>
        <td header="true">ab</td>
        <td header="true">ac</td>
        <td header="true">ad</td>
        <td header="true">ae</td>
        <td header="true">af</td>
        <td header="true">ag</td>
      </line>
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>п</td>
        <td hint="true">p</td>
        <td>o</td>
        <td>в</td>
        <td>o</td>
        <td>д</td>
        <td>н</td>
        <td>и</td>
        <td>к</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>в</td>
        <td hint="true">a</td>
        <td>г</td>
        <td>o</td>
        <td>н</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">c</td>
        <td>т</td>
        <td>a</td>
        <td>к</td>
        <td>a</td>
        <td>н</td>
        <td>ы</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">п</td>
        <td>y</td>
        <td>т</td>
        <td>ь</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>o</td>
        <td>т</td>
        <td>п</td>
        <td>p</td>
        <td>a</td>
        <td>в</td>
        <td>л</td>
        <td>e</td>
        <td>н</td>
        <td hint="true">и</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>м</td>
        <td>e</td>
        <td hint="true">c</td>
        <td>т</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>к</td>
        <td>o</td>
        <td>н</td>
        <td>ф</td>
        <td>e</td>
        <td>т</td>
        <td hint="true">a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>ч</td>
        <td>e</td>
        <td>м</td>
        <td>o</td>
        <td>д</td>
        <td>a</td>
        <td hint="true">н</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>б</td>
        <td hint="true">и</td>
        <td>л</td>
        <td>e</td>
        <td>т</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">10.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>к</td>
        <td>y</td>
        <td>п</td>
        <td hint="true">e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="make-word" id="cw1" name="Russian1/Lesson6/ChapterA/Krossvord.htm"
      ident="C+E+M+Ь+C+O+T+БЩПC+ЖД+ШЫИЧ+E+T+Ы+P+E+C+T+A+B+П+MЛЮЁЭCЗHЫO+ЁE+Я+ЭЛД+E+B+Я+T+Ь+C+O+T+C+T+P+И+C+T+A+ЧЮЯMXЖT+Ь+ЩOШЗЦAЧXAЫЭИ+C+ЯHД+E+B+Я+H+O+C+T+O+ЁO+ЮHBЦЧXЩЮЫФДКT+ЁB+O+C+E+M+Ь+C+O+T+ГЧ">
      <line>
        <td answer="true">C</td>
        <td answer="true">E</td>
        <td answer="true">M</td>
        <td answer="true">Ь</td>
        <td answer="true">C</td>
        <td answer="true">O</td>
        <td answer="true">T</td>
        <td>Б</td>
        <td>Щ</td>
        <td>П</td>
        <td answer="true">C</td>
        <td>Ж</td>
        <td answer="true">Д</td>
      </line>
      <line>
        <td>Ш</td>
        <td>Ы</td>
        <td>И</td>
        <td answer="true">Ч</td>
        <td answer="true">E</td>
        <td answer="true">T</td>
        <td answer="true">Ы</td>
        <td answer="true">P</td>
        <td answer="true">E</td>
        <td answer="true">C</td>
        <td answer="true">T</td>
        <td answer="true">A</td>
        <td answer="true">B</td>
      </line>
      <line>
        <td answer="true">П</td>
        <td>M</td>
        <td>Л</td>
        <td>Ю</td>
        <td>Ё</td>
        <td>Э</td>
        <td>C</td>
        <td>З</td>
        <td>H</td>
        <td>Ы</td>
        <td answer="true">O</td>
        <td>Ё</td>
        <td answer="true">E</td>
      </line>
      <line>
        <td answer="true">Я</td>
        <td>Э</td>
        <td>Л</td>
        <td answer="true">Д</td>
        <td answer="true">E</td>
        <td answer="true">B</td>
        <td answer="true">Я</td>
        <td answer="true">T</td>
        <td answer="true">Ь</td>
        <td answer="true">C</td>
        <td answer="true">O</td>
        <td answer="true">T</td>
        <td answer="true">C</td>
      </line>
      <line>
        <td answer="true">T</td>
        <td answer="true">P</td>
        <td answer="true">И</td>
        <td answer="true">C</td>
        <td answer="true">T</td>
        <td answer="true">A</td>
        <td>Ч</td>
        <td>Ю</td>
        <td>Я</td>
        <td>M</td>
        <td>X</td>
        <td>Ж</td>
        <td answer="true">T</td>
      </line>
      <line>
        <td answer="true">Ь</td>
        <td>Щ</td>
        <td>O</td>
        <td>Ш</td>
        <td>З</td>
        <td>Ц</td>
        <td>A</td>
        <td>Ч</td>
        <td>X</td>
        <td>A</td>
        <td>Ы</td>
        <td>Э</td>
        <td answer="true">И</td>
      </line>
      <line>
        <td answer="true">C</td>
        <td>Я</td>
        <td>H</td>
        <td answer="true">Д</td>
        <td answer="true">E</td>
        <td answer="true">B</td>
        <td answer="true">Я</td>
        <td answer="true">H</td>
        <td answer="true">O</td>
        <td answer="true">C</td>
        <td answer="true">T</td>
        <td answer="true">O</td>
        <td>Ё</td>
      </line>
      <line>
        <td answer="true">O</td>
        <td>Ю</td>
        <td>H</td>
        <td>B</td>
        <td>Ц</td>
        <td>Ч</td>
        <td>X</td>
        <td>Щ</td>
        <td>Ю</td>
        <td>Ы</td>
        <td>Ф</td>
        <td>Д</td>
        <td>К</td>
      </line>
      <line>
        <td answer="true">T</td>
        <td>Ё</td>
        <td answer="true">B</td>
        <td answer="true">O</td>
        <td answer="true">C</td>
        <td answer="true">E</td>
        <td answer="true">M</td>
        <td answer="true">Ь</td>
        <td answer="true">C</td>
        <td answer="true">O</td>
        <td answer="true">T</td>
        <td>Г</td>
        <td>Ч</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="Russian1/Test2/Test2/Krossvord.htm" col_header="letter"
      row_header="number"
      ident="---п*одарок---р*исуноклоша*дка------з*дорово---д*евочка-ден*ьги---духи*---------к*онфеты">
      <line>
        <td>-</td>
        <td header="true">a</td>
        <td header="true">b</td>
        <td header="true">c</td>
        <td header="true">d</td>
        <td header="true">e</td>
        <td header="true">f</td>
        <td header="true">g</td>
        <td header="true">h</td>
        <td header="true">i</td>
        <td header="true">ak</td>
      </line>
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">п</td>
        <td>о</td>
        <td>д</td>
        <td>а</td>
        <td>р</td>
        <td>о</td>
        <td>к</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">р</td>
        <td>и</td>
        <td>с</td>
        <td>у</td>
        <td>н</td>
        <td>о</td>
        <td>к</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>л</td>
        <td>о</td>
        <td>ш</td>
        <td hint="true">а</td>
        <td>д</td>
        <td>к</td>
        <td>а</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">з</td>
        <td>д</td>
        <td>о</td>
        <td>р</td>
        <td>о</td>
        <td>в</td>
        <td>о</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">д</td>
        <td>е</td>
        <td>в</td>
        <td>о</td>
        <td>ч</td>
        <td>к</td>
        <td>а</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>д</td>
        <td>е</td>
        <td hint="true">н</td>
        <td>ь</td>
        <td>г</td>
        <td>и</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>д</td>
        <td>у</td>
        <td>х</td>
        <td hint="true">и</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">к</td>
        <td>о</td>
        <td>н</td>
        <td>ф</td>
        <td>е</td>
        <td>т</td>
        <td>ы</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="Russian2/Lesson1/ChapterA/Krossvord.htm" col_header=""
      row_header="number"
      ident="--вторн*ик--------че*тверг---сред*а-----воскре*сеньепонедел*ьник------пя*тница">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>в</td>
        <td>т</td>
        <td>о</td>
        <td>р</td>
        <td hint="true">н</td>
        <td>и</td>
        <td>к</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>ч</td>
        <td hint="true">е</td>
        <td>т</td>
        <td>в</td>
        <td>е</td>
        <td>р</td>
        <td>г</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>с</td>
        <td>р</td>
        <td>е</td>
        <td hint="true">д</td>
        <td>а</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>в</td>
        <td>о</td>
        <td>с</td>
        <td>к</td>
        <td>р</td>
        <td hint="true">е</td>
        <td>с</td>
        <td>е</td>
        <td>н</td>
        <td>ь</td>
        <td>е</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>п</td>
        <td>о</td>
        <td>н</td>
        <td>е</td>
        <td>д</td>
        <td>е</td>
        <td hint="true">л</td>
        <td>ь</td>
        <td>н</td>
        <td>и</td>
        <td>к</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>п</td>
        <td hint="true">я</td>
        <td>т</td>
        <td>н</td>
        <td>и</td>
        <td>ц</td>
        <td>а</td>
      </line>
    </item>
    <item type="make-word" id="cw1" name="Russian2/Lesson1/ChapterB/Krossvord.htm"
      ident="ЩВСМ+АЕОРГЧОНМТЯ+ЩМП+ЦКЛЁЭК+ХС+ЛЕЫ+ТЮРУХ+О+Л+О+Д+И+Л+Ь+Н+И+К+ТФ+ЭР+ЩВЕ+БЦНЫКЕ+ЛУ+БМС+ЗЖУ+ШДВ+ГБ+ЧЙО+ЁЭТ+ЯЩА+ЫК+ДСС+ЙЧЮ+ППР+ЭА+ЙНБТЗГ+ЦЦК+ЩЛГДЖЕОАФЧ+А+Й+Н+И+К+ШРЕЩО">
      <line>
        <td>Щ</td>
        <td>В</td>
        <td>С</td>
        <td answer="true">М</td>
        <td>А</td>
        <td>Е</td>
        <td>О</td>
        <td>Р</td>
        <td>Г</td>
        <td>Ч</td>
        <td>О</td>
      </line>
      <line>
        <td>Н</td>
        <td>М</td>
        <td>Т</td>
        <td answer="true">Я</td>
        <td>Щ</td>
        <td>М</td>
        <td answer="true">П</td>
        <td>Ц</td>
        <td>К</td>
        <td>Л</td>
        <td>Ё</td>
      </line>
      <line>
        <td>Э</td>
        <td answer="true">К</td>
        <td>Х</td>
        <td answer="true">С</td>
        <td>Л</td>
        <td>Е</td>
        <td answer="true">Ы</td>
        <td>Т</td>
        <td>Ю</td>
        <td>Р</td>
        <td>У</td>
      </line>
      <line>
        <td answer="true">Х</td>
        <td answer="true">О</td>
        <td answer="true">Л</td>
        <td answer="true">О</td>
        <td answer="true">Д</td>
        <td answer="true">И</td>
        <td answer="true">Л</td>
        <td answer="true">Ь</td>
        <td answer="true">Н</td>
        <td answer="true">И</td>
        <td answer="true">К</td>
      </line>
      <line>
        <td>Т</td>
        <td answer="true">Ф</td>
        <td>Э</td>
        <td answer="true">Р</td>
        <td>Щ</td>
        <td>В</td>
        <td answer="true">Е</td>
        <td>Б</td>
        <td>Ц</td>
        <td>Н</td>
        <td>Ы</td>
      </line>
      <line>
        <td>К</td>
        <td answer="true">Е</td>
        <td>Л</td>
        <td answer="true">У</td>
        <td>Б</td>
        <td>М</td>
        <td answer="true">С</td>
        <td>З</td>
        <td>Ж</td>
        <td answer="true">У</td>
        <td>Ш</td>
      </line>
      <line>
        <td>Д</td>
        <td answer="true">В</td>
        <td>Г</td>
        <td answer="true">Б</td>
        <td>Ч</td>
        <td>Й</td>
        <td answer="true">О</td>
        <td>Ё</td>
        <td>Э</td>
        <td answer="true">Т</td>
        <td>Я</td>
      </line>
      <line>
        <td>Щ</td>
        <td answer="true">А</td>
        <td>Ы</td>
        <td answer="true">К</td>
        <td>Д</td>
        <td>С</td>
        <td answer="true">С</td>
        <td>Й</td>
        <td>Ч</td>
        <td answer="true">Ю</td>
        <td>П</td>
      </line>
      <line>
        <td>П</td>
        <td answer="true">Р</td>
        <td>Э</td>
        <td answer="true">А</td>
        <td>Й</td>
        <td>Н</td>
        <td>Б</td>
        <td>Т</td>
        <td>З</td>
        <td answer="true">Г</td>
        <td>Ц</td>
      </line>
      <line>
        <td>Ц</td>
        <td answer="true">К</td>
        <td>Щ</td>
        <td>Л</td>
        <td>Г</td>
        <td>Д</td>
        <td>Ж</td>
        <td>Е</td>
        <td>О</td>
        <td>А</td>
        <td>Ф</td>
      </line>
      <line>
        <td answer="true">Ч</td>
        <td answer="true">А</td>
        <td answer="true">Й</td>
        <td answer="true">Н</td>
        <td answer="true">И</td>
        <td answer="true">К</td>
        <td>Ш</td>
        <td>Р</td>
        <td>Е</td>
        <td>Щ</td>
        <td>О</td>
      </line>
    </item>
    <item type="make-word" id="cw1" name="Russian2/Lesson2/ChapterA/Krosvord.htm"
      ident="M+X+O+P+O+Ш+И+Й+КДA+ФTЧЗCBБH+П+Л+O+X+O+Й+EИИ+CЭE+EAУКЛЗ+ДAPH+ИЙHБК+ГБ+O+Л+ъ+Ш+O+Й+И+ИУPAГК+ИЙЙ+ЩB+Ы+C+O+К+И+Й+Г+O+P+O+Д+C+К+O+Й+">
      <line>
        <td answer="true">M</td>
        <td answer="true">X</td>
        <td answer="true">O</td>
        <td answer="true">P</td>
        <td answer="true">O</td>
        <td answer="true">Ш</td>
        <td answer="true">И</td>
        <td answer="true">Й</td>
        <td>К</td>
      </line>
      <line>
        <td>Д</td>
        <td answer="true">A</td>
        <td>Ф</td>
        <td>T</td>
        <td>Ч</td>
        <td>З</td>
        <td>C</td>
        <td>B</td>
        <td>Б</td>
      </line>
      <line>
        <td answer="true">H</td>
        <td answer="true">П</td>
        <td answer="true">Л</td>
        <td answer="true">O</td>
        <td answer="true">X</td>
        <td answer="true">O</td>
        <td answer="true">Й</td>
        <td>E</td>
        <td>И</td>
      </line>
      <line>
        <td answer="true">И</td>
        <td>C</td>
        <td>Э</td>
        <td answer="true">E</td>
        <td>E</td>
        <td>A</td>
        <td>У</td>
        <td>К</td>
        <td>Л</td>
      </line>
      <line>
        <td answer="true">З</td>
        <td>Д</td>
        <td>A</td>
        <td>P</td>
        <td answer="true">H</td>
        <td>И</td>
        <td>Й</td>
        <td>H</td>
        <td>Б</td>
      </line>
      <line>
        <td answer="true">К</td>
        <td>Г</td>
        <td answer="true">Б</td>
        <td answer="true">O</td>
        <td answer="true">Л</td>
        <td answer="true">ъ</td>
        <td answer="true">Ш</td>
        <td answer="true">O</td>
        <td answer="true">Й</td>
      </line>
      <line>
        <td answer="true">И</td>
        <td>И</td>
        <td>У</td>
        <td>P</td>
        <td>A</td>
        <td>Г</td>
        <td answer="true">К</td>
        <td>И</td>
        <td>Й</td>
      </line>
      <line>
        <td answer="true">Й</td>
        <td>Щ</td>
        <td answer="true">B</td>
        <td answer="true">Ы</td>
        <td answer="true">C</td>
        <td answer="true">O</td>
        <td answer="true">К</td>
        <td answer="true">И</td>
        <td answer="true">Й</td>
      </line>
      <line>
        <td answer="true">Г</td>
        <td answer="true">O</td>
        <td answer="true">P</td>
        <td answer="true">O</td>
        <td answer="true">Д</td>
        <td answer="true">C</td>
        <td answer="true">К</td>
        <td answer="true">O</td>
        <td answer="true">Й</td>
      </line>
    </item>
    <item type="cross-word" id="cw2" name="Russian2/Lesson4/ChapterB/Krosvord.htm" col_header="no"
      row_header="no"
      ident="---@1---с--@2обыкновенные---в------@4п@3гуманитарная---е-------р---с-------т---т---@5---н---н---г---ё---а---л---р---я---у---с-------б---к------@6официальный-------к---й-------о-------е">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>с</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">2</td>
        <td>о</td>
        <td>б</td>
        <td>ы</td>
        <td>к</td>
        <td>н</td>
        <td>о</td>
        <td>в</td>
        <td>е</td>
        <td>н</td>
        <td>н</td>
        <td>ы</td>
        <td>е</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>в</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">4</td>
        <td>п</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3</td>
        <td>г</td>
        <td>у</td>
        <td>м</td>
        <td>а</td>
        <td>н</td>
        <td>и</td>
        <td>т</td>
        <td>а</td>
        <td>р</td>
        <td>н</td>
        <td>а</td>
        <td>я</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>е</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>р</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>с</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>т</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>т</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">5</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>н</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>н</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>г</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>ё</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>а</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>л</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>р</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>я</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>у</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>с</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>б</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>к</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6</td>
        <td>о</td>
        <td>ф</td>
        <td>и</td>
        <td>ц</td>
        <td>и</td>
        <td>а</td>
        <td>л</td>
        <td>ь</td>
        <td>н</td>
        <td>ы</td>
        <td>й</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>к</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>й</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>о</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>е</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="Russian2/Lesson7/ChapterC/Krosvord.htm"
      col_header="letter" row_header="number"
      ident="---восп*ринять-----мне*ние-------откр*ыто---------ме*нять------чувс*твовать--любит*ь--------довер*ять-------гово*рить---трудный*---------демок*ратия------сча*стье---">
      <line>
        <td>-</td>
        <td header="true">a</td>
        <td header="true">b</td>
        <td header="true">c</td>
        <td header="true">d</td>
        <td header="true">e</td>
        <td header="true">f</td>
        <td header="true">g</td>
        <td header="true">h</td>
        <td header="true">i</td>
        <td header="true">ak</td>
        <td header="true">aa</td>
        <td header="true">ab</td>
        <td header="true">ac</td>
        <td header="true">ad</td>
      </line>
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>в</td>
        <td>о</td>
        <td>с</td>
        <td hint="true">п</td>
        <td>р</td>
        <td>и</td>
        <td>н</td>
        <td>я</td>
        <td>т</td>
        <td>ь</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>м</td>
        <td>н</td>
        <td hint="true">е</td>
        <td>н</td>
        <td>и</td>
        <td>е</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>о</td>
        <td>т</td>
        <td>к</td>
        <td hint="true">р</td>
        <td>ы</td>
        <td>т</td>
        <td>о</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>м</td>
        <td hint="true">е</td>
        <td>н</td>
        <td>я</td>
        <td>т</td>
        <td>ь</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>ч</td>
        <td>у</td>
        <td>в</td>
        <td hint="true">с</td>
        <td>т</td>
        <td>в</td>
        <td>о</td>
        <td>в</td>
        <td>а</td>
        <td>т</td>
        <td>ь</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>л</td>
        <td>ю</td>
        <td>б</td>
        <td>и</td>
        <td hint="true">т</td>
        <td>ь</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>д</td>
        <td>о</td>
        <td>в</td>
        <td>е</td>
        <td hint="true">р</td>
        <td>я</td>
        <td>т</td>
        <td>ь</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>г</td>
        <td>о</td>
        <td>в</td>
        <td hint="true">о</td>
        <td>р</td>
        <td>и</td>
        <td>т</td>
        <td>ь</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>т</td>
        <td>р</td>
        <td>у</td>
        <td>д</td>
        <td>н</td>
        <td>ы</td>
        <td hint="true">й</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">10.</td>
        <td>-</td>
        <td>-</td>
        <td>д</td>
        <td>е</td>
        <td>м</td>
        <td>о</td>
        <td hint="true">к</td>
        <td>р</td>
        <td>а</td>
        <td>т</td>
        <td>и</td>
        <td>я</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">11.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>с</td>
        <td>ч</td>
        <td hint="true">а</td>
        <td>с</td>
        <td>т</td>
        <td>ь</td>
        <td>е</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="Russian3/Lesson1/ChapterA/Krosvord.htm"
      col_header="letter" row_header="number"
      ident="Тpoпинк*a------------cтpa*нa------------caм*oлëт------------ч*acть---------пoca*дкa-----------Пeт*poпaвлoвcк---вyлк*aн----------yкaзa*тeль------">
      <line>
        <td>-</td>
        <td header="true">a</td>
        <td header="true">b</td>
        <td header="true">c</td>
        <td header="true">d</td>
        <td header="true">e</td>
        <td header="true">f</td>
        <td header="true">g</td>
        <td header="true">h</td>
        <td header="true">i</td>
        <td header="true">ak</td>
        <td header="true">aa</td>
        <td header="true">ab</td>
        <td header="true">ac</td>
        <td header="true">ad</td>
        <td header="true">ae</td>
        <td header="true">af</td>
        <td header="true">ag</td>
      </line>
      <line>
        <td header="true">1.</td>
        <td>Т</td>
        <td>p</td>
        <td>o</td>
        <td>п</td>
        <td>и</td>
        <td>н</td>
        <td hint="true">к</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>т</td>
        <td>p</td>
        <td hint="true">a</td>
        <td>н</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>a</td>
        <td hint="true">м</td>
        <td>o</td>
        <td>л</td>
        <td>ë</td>
        <td>т</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">ч</td>
        <td>a</td>
        <td>c</td>
        <td>т</td>
        <td>ь</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>п</td>
        <td>o</td>
        <td>c</td>
        <td hint="true">a</td>
        <td>д</td>
        <td>к</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>П</td>
        <td>e</td>
        <td hint="true">т</td>
        <td>p</td>
        <td>o</td>
        <td>п</td>
        <td>a</td>
        <td>в</td>
        <td>л</td>
        <td>o</td>
        <td>в</td>
        <td>c</td>
        <td>к</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>в</td>
        <td>y</td>
        <td>л</td>
        <td hint="true">к</td>
        <td>a</td>
        <td>н</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>y</td>
        <td>к</td>
        <td>a</td>
        <td>з</td>
        <td hint="true">a</td>
        <td>т</td>
        <td>e</td>
        <td>л</td>
        <td>ь</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw2" name="Russian3/Lesson7/ChapterA/Krosvord.htm" col_header="no"
      row_header="no"
      ident="----@1----р--@2зубы---@3к@4нога---о---@5-@6глазан@7ухо---о--@8волосы-@9палец">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>р</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">2</td>
        <td>з</td>
        <td>у</td>
        <td>б</td>
        <td>ы</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">3</td>
        <td>к</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4</td>
        <td>н</td>
        <td>о</td>
        <td>г</td>
        <td>а</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>о</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">5</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">6</td>
        <td>г</td>
        <td>л</td>
        <td>а</td>
        <td>з</td>
        <td>а</td>
        <td>н</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7</td>
        <td>у</td>
        <td>х</td>
        <td>о</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>о</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">8</td>
        <td>в</td>
        <td>о</td>
        <td>л</td>
        <td>о</td>
        <td>с</td>
        <td>ы</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">9</td>
        <td>п</td>
        <td>а</td>
        <td>л</td>
        <td>е</td>
        <td>ц</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German1/les1/chapt/t1a_kb_l1_t9.htm" col_header=""
      row_header=""
      ident="---@5.fünf*--------------@11.el*f----------@43.dreiu*ndvierzig@20.zwanzig*-----------@16.sechz*ehn-----------@6.se*chs----------@19.neu*nzehn----@80.achtzig*---------">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>f</td>
        <td>ü</td>
        <td>n</td>
        <td hint="true">f</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">11.</td>
        <td>e</td>
        <td hint="true">l</td>
        <td>f</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">43.</td>
        <td>d</td>
        <td>r</td>
        <td>e</td>
        <td>i</td>
        <td hint="true">u</td>
        <td>n</td>
        <td>d</td>
        <td>v</td>
        <td>i</td>
        <td>e</td>
        <td>r</td>
        <td>z</td>
        <td>i</td>
        <td>g</td>
      </line>
      <line>
        <td header="true">20.</td>
        <td>z</td>
        <td>w</td>
        <td>a</td>
        <td>n</td>
        <td>z</td>
        <td>i</td>
        <td hint="true">g</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">16.</td>
        <td>s</td>
        <td>e</td>
        <td>c</td>
        <td>h</td>
        <td hint="true">z</td>
        <td>e</td>
        <td>h</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6.</td>
        <td>s</td>
        <td hint="true">e</td>
        <td>c</td>
        <td>h</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">19.</td>
        <td>n</td>
        <td>e</td>
        <td hint="true">u</td>
        <td>n</td>
        <td>z</td>
        <td>e</td>
        <td>h</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">80.</td>
        <td>a</td>
        <td>c</td>
        <td>h</td>
        <td>t</td>
        <td>z</td>
        <td>i</td>
        <td hint="true">g</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German1/les2/chapt/t1a_kb_l2_t11.htm" col_header=""
      row_header="" ident="@1.FOT*O--@2.LIE*D---@3.EL*F---@4.ZE*T----@5.F*ÜNF-@6.JO*T---@7.UN*ION">
      <line>
        <td header="true">1.</td>
        <td>F</td>
        <td>O</td>
        <td hint="true">T</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>L</td>
        <td>I</td>
        <td hint="true">E</td>
        <td>D</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">3.</td>
        <td>E</td>
        <td hint="true">L</td>
        <td>F</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">4.</td>
        <td>Z</td>
        <td hint="true">E</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">5.</td>
        <td hint="true">F</td>
        <td>Ü</td>
        <td>N</td>
        <td>F</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">6.</td>
        <td>J</td>
        <td hint="true">O</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">7.</td>
        <td>U</td>
        <td hint="true">N</td>
        <td>I</td>
        <td>O</td>
        <td>N</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German1/les3/chapt/t1a_kb_l3_t9.htm" col_header=""
      row_header=""
      ident="---@1-@2--------------@3----W@2FOTOAPPARAT----M----O-E--------------I-@4FAHRRAD-@6,5KüHLSCHRANK----N-N---T----------R----W@7STEREOANLAGE@8--O----A-E---L---@10---H--W----G-H---E@9STAUBSAUGER---E-E---F---U---N--L----N-R-@11COMPUTER-D--L----------N---O---Y--E-">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1</td>
        <td>-</td>
        <td header="true">2</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">3</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>W</td>
        <td header="true">2</td>
        <td>F</td>
        <td>O</td>
        <td>T</td>
        <td>O</td>
        <td>A</td>
        <td>P</td>
        <td>P</td>
        <td>A</td>
        <td>R</td>
        <td>A</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>M</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>O</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>I</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4</td>
        <td>F</td>
        <td>A</td>
        <td>H</td>
        <td>R</td>
        <td>R</td>
        <td>A</td>
        <td>D</td>
        <td>-</td>
        <td header="true">6,5</td>
        <td>K</td>
        <td>ü</td>
        <td>H</td>
        <td>L</td>
        <td>S</td>
        <td>C</td>
        <td>H</td>
        <td>R</td>
        <td>A</td>
        <td>N</td>
        <td>K</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>W</td>
        <td header="true">7</td>
        <td>S</td>
        <td>T</td>
        <td>E</td>
        <td>R</td>
        <td>E</td>
        <td>O</td>
        <td>A</td>
        <td>N</td>
        <td>L</td>
        <td>A</td>
        <td>G</td>
        <td>E</td>
        <td header="true">8</td>
        <td>-</td>
        <td>-</td>
        <td>O</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>A</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>L</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">10</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>H</td>
        <td>-</td>
        <td>-</td>
        <td>W</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>G</td>
        <td>-</td>
        <td>H</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td header="true">9</td>
        <td>S</td>
        <td>T</td>
        <td>A</td>
        <td>U</td>
        <td>B</td>
        <td>S</td>
        <td>A</td>
        <td>U</td>
        <td>G</td>
        <td>E</td>
        <td>R</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>F</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>U</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>L</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td header="true">11</td>
        <td>C</td>
        <td>O</td>
        <td>M</td>
        <td>P</td>
        <td>U</td>
        <td>T</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
        <td>D</td>
        <td>-</td>
        <td>-</td>
        <td>L</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German1/les5/chapt/t1a_kb_l5_t8.htm" col_header=""
      row_header=""
      ident="--------@1.*WOCHE--------@2.Z*OO------------@3.*CAFÉ-------@4.FLO*HMARKT-----@5.MUS*EUM---------@6.KI*NO------@7.TRAUMB*ERUF--@8.RESTAURA*NT---------@9.STA*DT----------@10.TH*EATER-">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td hint="true">W</td>
        <td>O</td>
        <td>C</td>
        <td>H</td>
        <td>E</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>Z</td>
        <td hint="true">O</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">3.</td>
        <td hint="true">C</td>
        <td>A</td>
        <td>F</td>
        <td>É</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">4.</td>
        <td>F</td>
        <td>L</td>
        <td>O</td>
        <td hint="true">H</td>
        <td>M</td>
        <td>A</td>
        <td>R</td>
        <td>K</td>
        <td>T</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>M</td>
        <td>U</td>
        <td>S</td>
        <td hint="true">E</td>
        <td>U</td>
        <td>M</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6.</td>
        <td>K</td>
        <td>I</td>
        <td hint="true">N</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">7.</td>
        <td>T</td>
        <td>R</td>
        <td>A</td>
        <td>U</td>
        <td>M</td>
        <td>B</td>
        <td hint="true">E</td>
        <td>R</td>
        <td>U</td>
        <td>F</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>R</td>
        <td>E</td>
        <td>S</td>
        <td>T</td>
        <td>A</td>
        <td>U</td>
        <td>R</td>
        <td>A</td>
        <td hint="true">N</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">9.</td>
        <td>S</td>
        <td>T</td>
        <td>A</td>
        <td hint="true">D</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">10.</td>
        <td>T</td>
        <td>H</td>
        <td hint="true">E</td>
        <td>A</td>
        <td>T</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German1/les7/chapt/t1b_kb_l7_t8.htm" col_header=""
      row_header=""
      ident="-----@1.*FRAU-----------@2.V*ATER-------@3.GROSS*MUTTER---------@4.N*ICHTE-------@5.ENKE*LIN---------@6.SCHW*IEGERMUTTER@7.TOCHT*ER---------">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td hint="true">F</td>
        <td>R</td>
        <td>A</td>
        <td>U</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>V</td>
        <td hint="true">A</td>
        <td>T</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>G</td>
        <td>R</td>
        <td>O</td>
        <td>S</td>
        <td>S</td>
        <td hint="true">M</td>
        <td>U</td>
        <td>T</td>
        <td>T</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">4.</td>
        <td>N</td>
        <td hint="true">I</td>
        <td>C</td>
        <td>H</td>
        <td>T</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">5.</td>
        <td>E</td>
        <td>N</td>
        <td>K</td>
        <td>E</td>
        <td hint="true">L</td>
        <td>I</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">6.</td>
        <td>S</td>
        <td>C</td>
        <td>H</td>
        <td>W</td>
        <td hint="true">I</td>
        <td>E</td>
        <td>G</td>
        <td>E</td>
        <td>R</td>
        <td>M</td>
        <td>U</td>
        <td>T</td>
        <td>T</td>
        <td>E</td>
        <td>R</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>T</td>
        <td>O</td>
        <td>C</td>
        <td>H</td>
        <td>T</td>
        <td hint="true">E</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German1/les8/chapt/t1b_kb_l8_t9.htm" col_header=""
      row_header="" ident="---@1.*MIETE@2.CHA*OS---@3.LEH*RE------@4.*GESTE@5.APF*EL------@6.*NACKT">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td hint="true">M</td>
        <td>I</td>
        <td>E</td>
        <td>T</td>
        <td>E</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>C</td>
        <td>H</td>
        <td>A</td>
        <td hint="true">O</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>L</td>
        <td>E</td>
        <td>H</td>
        <td hint="true">R</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">4.</td>
        <td hint="true">G</td>
        <td>E</td>
        <td>S</td>
        <td>T</td>
        <td>E</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>A</td>
        <td>P</td>
        <td>F</td>
        <td hint="true">E</td>
        <td>L</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6.</td>
        <td hint="true">N</td>
        <td>A</td>
        <td>C</td>
        <td>K</td>
        <td>T</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German1/les9/chapt/t1b_kb_l9_t9.htm" col_header=""
      row_header=""
      ident="-----@1.HAMBUR*G---------------@2.ITA*LIENISCH--------@3.EUR*OPAS-----------@4.SALZ*BURG----------@5.MÜNCH*EN-------------@6.HAUP*TSTADT--@7.BUNDESLÄNDE*R--------------@8.KANT*ONEN------------@9.DEU*TSCH--------@10.BUNDESS*TAAT------------@11.ALP*ENGEBIET--------@12.TOU*RISMUS--">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td>H</td>
        <td>A</td>
        <td>M</td>
        <td>B</td>
        <td>U</td>
        <td>R</td>
        <td hint="true">G</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>I</td>
        <td>T</td>
        <td>A</td>
        <td hint="true">L</td>
        <td>I</td>
        <td>E</td>
        <td>N</td>
        <td>I</td>
        <td>S</td>
        <td>C</td>
        <td>H</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">3.</td>
        <td>E</td>
        <td>U</td>
        <td>R</td>
        <td hint="true">O</td>
        <td>P</td>
        <td>A</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">4.</td>
        <td>S</td>
        <td>A</td>
        <td>L</td>
        <td>Z</td>
        <td hint="true">B</td>
        <td>U</td>
        <td>R</td>
        <td>G</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>M</td>
        <td>Ü</td>
        <td>N</td>
        <td>C</td>
        <td>H</td>
        <td hint="true">E</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6.</td>
        <td>H</td>
        <td>A</td>
        <td>U</td>
        <td>P</td>
        <td hint="true">T</td>
        <td>S</td>
        <td>T</td>
        <td>A</td>
        <td>D</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>B</td>
        <td>U</td>
        <td>N</td>
        <td>D</td>
        <td>E</td>
        <td>S</td>
        <td>L</td>
        <td>Ä</td>
        <td>N</td>
        <td>D</td>
        <td>E</td>
        <td hint="true">R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">8.</td>
        <td>K</td>
        <td>A</td>
        <td>N</td>
        <td>T</td>
        <td hint="true">O</td>
        <td>N</td>
        <td>E</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">9.</td>
        <td>D</td>
        <td>E</td>
        <td>U</td>
        <td hint="true">T</td>
        <td>S</td>
        <td>C</td>
        <td>H</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">10.</td>
        <td>B</td>
        <td>U</td>
        <td>N</td>
        <td>D</td>
        <td>E</td>
        <td>S</td>
        <td>S</td>
        <td hint="true">T</td>
        <td>A</td>
        <td>A</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">11.</td>
        <td>A</td>
        <td>L</td>
        <td>P</td>
        <td hint="true">E</td>
        <td>N</td>
        <td>G</td>
        <td>E</td>
        <td>B</td>
        <td>I</td>
        <td>E</td>
        <td>T</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">12.</td>
        <td>T</td>
        <td>O</td>
        <td>U</td>
        <td hint="true">R</td>
        <td>I</td>
        <td>S</td>
        <td>M</td>
        <td>U</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German1/les10/chapt/t1b_kb_l10_t1.htm" col_header=""
      row_header="" ident="@1.KOP*F-----@2.KN*IE-----@3.B*EIN-----@4.*BAUCH@5.NAS*E-----@6.OH*R----">
      <line>
        <td header="true">1.</td>
        <td>K</td>
        <td>O</td>
        <td>P</td>
        <td hint="true">F</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">2.</td>
        <td>K</td>
        <td>N</td>
        <td hint="true">I</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">3.</td>
        <td>B</td>
        <td hint="true">E</td>
        <td>I</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">4.</td>
        <td hint="true">B</td>
        <td>A</td>
        <td>U</td>
        <td>C</td>
        <td>H</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>N</td>
        <td>A</td>
        <td>S</td>
        <td hint="true">E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">6.</td>
        <td>O</td>
        <td>H</td>
        <td hint="true">R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German1/les10/chapt/t1b_kb_l10_t5.htm" col_header=""
      row_header=""
      ident="---@1.@W*A@L@NÜ@S@SE-------@2.@BA*@NA@NE@N--------@3.@HA@S*E@L@NÜ@S@SE-----@4.Ä@P@FE*@L------------@5.@BI@R*@NE@N-----------@6.@KI*@WI-------------@7.@S*@TA@C@HE@L@BEE@RE@N@8.@KI@R@S*@C@HE@N-----------@9.@T*@RAU@BE@N------">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td hint="true">W</td>
        <td>A</td>
        <td header="true">L</td>
        <td header="true">N</td>
        <td>Ü</td>
        <td header="true">S</td>
        <td header="true">S</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td header="true">B</td>
        <td hint="true">A</td>
        <td header="true">N</td>
        <td>A</td>
        <td header="true">N</td>
        <td>E</td>
        <td header="true">N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">3.</td>
        <td header="true">H</td>
        <td>A</td>
        <td hint="true">S</td>
        <td>E</td>
        <td header="true">L</td>
        <td header="true">N</td>
        <td>Ü</td>
        <td header="true">S</td>
        <td header="true">S</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>Ä</td>
        <td header="true">P</td>
        <td header="true">F</td>
        <td hint="true">E</td>
        <td header="true">L</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">5.</td>
        <td header="true">B</td>
        <td>I</td>
        <td hint="true">R</td>
        <td header="true">N</td>
        <td>E</td>
        <td header="true">N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">6.</td>
        <td header="true">K</td>
        <td hint="true">I</td>
        <td header="true">W</td>
        <td>I</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">7.</td>
        <td hint="true">S</td>
        <td header="true">T</td>
        <td>A</td>
        <td header="true">C</td>
        <td header="true">H</td>
        <td>E</td>
        <td header="true">L</td>
        <td header="true">B</td>
        <td>E</td>
        <td>E</td>
        <td header="true">R</td>
        <td>E</td>
        <td header="true">N</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td header="true">K</td>
        <td>I</td>
        <td header="true">R</td>
        <td hint="true">S</td>
        <td header="true">C</td>
        <td header="true">H</td>
        <td>E</td>
        <td header="true">N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">9.</td>
        <td hint="true">T</td>
        <td header="true">R</td>
        <td>A</td>
        <td>U</td>
        <td header="true">B</td>
        <td>E</td>
        <td header="true">N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German1/les11/chapt/t1b_kb_l11_t8.htm" col_header=""
      row_header=""
      ident="----------@1.-------------R----------@2.--O---------@2.BUNT@3.-------@4.-L-@5.-S-------O-A-G-C-----@6.GRAU-E-H-------A---L-W----@7.DUNKELBRAUN-----G--@9.--R--@8.VIOLETT---Z---------Ü-----------@10.GRÜN-----------K----------@11.WEISS-----------S------">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>B</td>
        <td>U</td>
        <td>N</td>
        <td>T</td>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">4.</td>
        <td>-</td>
        <td>L</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>O</td>
        <td>-</td>
        <td>A</td>
        <td>-</td>
        <td>G</td>
        <td>-</td>
        <td>C</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6.</td>
        <td>G</td>
        <td>R</td>
        <td>A</td>
        <td>U</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>H</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>A</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>L</td>
        <td>-</td>
        <td>W</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">7.</td>
        <td>D</td>
        <td>U</td>
        <td>N</td>
        <td>K</td>
        <td>E</td>
        <td>L</td>
        <td>B</td>
        <td>R</td>
        <td>A</td>
        <td>U</td>
        <td>N</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>G</td>
        <td>-</td>
        <td>-</td>
        <td header="true">9.</td>
        <td>-</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>V</td>
        <td>I</td>
        <td>O</td>
        <td>L</td>
        <td>E</td>
        <td>T</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>Z</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>Ü</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">10.</td>
        <td>G</td>
        <td>R</td>
        <td>Ü</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>K</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">11.</td>
        <td>W</td>
        <td>E</td>
        <td>I</td>
        <td>S</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German2/les1/chapt/t2a_kb_l1_t10.htm" col_header="no"
      row_header="number"
      ident="----gart*en--zimmer*-----fra*ge-----häu*schenwohnheim*-----obw*ohl---schlo*ss-------h*aus-kaution*---wohnu*ng--reihen*haus--anzeig*e">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>g</td>
        <td>a</td>
        <td>r</td>
        <td hint="true">t</td>
        <td>e</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>z</td>
        <td>i</td>
        <td>m</td>
        <td>m</td>
        <td>e</td>
        <td hint="true">r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>f</td>
        <td>r</td>
        <td hint="true">a</td>
        <td>g</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>h</td>
        <td>ä</td>
        <td hint="true">u</td>
        <td>s</td>
        <td>c</td>
        <td>h</td>
        <td>e</td>
        <td>n</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>w</td>
        <td>o</td>
        <td>h</td>
        <td>n</td>
        <td>h</td>
        <td>e</td>
        <td>i</td>
        <td hint="true">m</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>o</td>
        <td>b</td>
        <td hint="true">w</td>
        <td>o</td>
        <td>h</td>
        <td>l</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>s</td>
        <td>c</td>
        <td>h</td>
        <td>l</td>
        <td hint="true">o</td>
        <td>s</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">h</td>
        <td>a</td>
        <td>u</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>-</td>
        <td>k</td>
        <td>a</td>
        <td>u</td>
        <td>t</td>
        <td>i</td>
        <td>o</td>
        <td hint="true">n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">10.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>w</td>
        <td>o</td>
        <td>h</td>
        <td>n</td>
        <td hint="true">u</td>
        <td>n</td>
        <td>g</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">11.</td>
        <td>-</td>
        <td>-</td>
        <td>r</td>
        <td>e</td>
        <td>i</td>
        <td>h</td>
        <td>e</td>
        <td hint="true">n</td>
        <td>h</td>
        <td>a</td>
        <td>u</td>
        <td>s</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">12.</td>
        <td>-</td>
        <td>-</td>
        <td>a</td>
        <td>n</td>
        <td>z</td>
        <td>e</td>
        <td>i</td>
        <td hint="true">g</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German2/les2/chapt/t2a_kb_l2_t4.htm" col_header=""
      row_header="number"
      ident="-----W*EST--SEMI*NAR-INTER*NAT---GES*ETZ--GEHI*RN--GREN*ZE--PUHD*YS---GED*ÄCHTNISSCHUMA*NN--BOTS*CHAFT-----V*ERLAG--THEO*RIEGEFÜHL*---VOK*ALE">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">W</td>
        <td>E</td>
        <td>S</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>S</td>
        <td>E</td>
        <td>M</td>
        <td hint="true">I</td>
        <td>N</td>
        <td>A</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>I</td>
        <td>N</td>
        <td>T</td>
        <td>E</td>
        <td hint="true">R</td>
        <td>N</td>
        <td>A</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>G</td>
        <td>E</td>
        <td hint="true">S</td>
        <td>E</td>
        <td>T</td>
        <td>Z</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>G</td>
        <td>E</td>
        <td>H</td>
        <td hint="true">I</td>
        <td>R</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>G</td>
        <td>R</td>
        <td>E</td>
        <td hint="true">N</td>
        <td>Z</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>P</td>
        <td>U</td>
        <td>H</td>
        <td hint="true">D</td>
        <td>Y</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>G</td>
        <td>E</td>
        <td hint="true">D</td>
        <td>Ä</td>
        <td>C</td>
        <td>H</td>
        <td>T</td>
        <td>N</td>
        <td>I</td>
        <td>S</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>S</td>
        <td>C</td>
        <td>H</td>
        <td>U</td>
        <td>M</td>
        <td hint="true">A</td>
        <td>N</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">10.</td>
        <td>-</td>
        <td>-</td>
        <td>B</td>
        <td>O</td>
        <td>T</td>
        <td hint="true">S</td>
        <td>C</td>
        <td>H</td>
        <td>A</td>
        <td>F</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">11.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">V</td>
        <td>E</td>
        <td>R</td>
        <td>L</td>
        <td>A</td>
        <td>G</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">12.</td>
        <td>-</td>
        <td>-</td>
        <td>T</td>
        <td>H</td>
        <td>E</td>
        <td hint="true">O</td>
        <td>R</td>
        <td>I</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">13.</td>
        <td>G</td>
        <td>E</td>
        <td>F</td>
        <td>Ü</td>
        <td>H</td>
        <td hint="true">L</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">14.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>V</td>
        <td>O</td>
        <td hint="true">K</td>
        <td>A</td>
        <td>L</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German2/les3/chapt/t2a_kb_l3_t8.htm" col_header="no"
      row_header="number" ident="----W*ind---Re*gen--Hit*ze-Kält*eSchne*e---Fr*ost">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">W</td>
        <td>i</td>
        <td>n</td>
        <td>d</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>R</td>
        <td hint="true">e</td>
        <td>g</td>
        <td>e</td>
        <td>n</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>H</td>
        <td>i</td>
        <td hint="true">t</td>
        <td>z</td>
        <td>e</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>K</td>
        <td>ä</td>
        <td>l</td>
        <td hint="true">t</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>S</td>
        <td>c</td>
        <td>h</td>
        <td>n</td>
        <td hint="true">e</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>F</td>
        <td hint="true">r</td>
        <td>o</td>
        <td>s</td>
        <td>t</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German2/les4/chapt/t2a_kb_l4_t4.htm" col_header="no"
      row_header="number" ident="Aus*nahmeZwi*llingeBuc*hmesseSch*eidungFra*nzKön*ig">
      <line>
        <td header="true">1.</td>
        <td>A</td>
        <td>u</td>
        <td hint="true">s</td>
        <td>n</td>
        <td>a</td>
        <td>h</td>
        <td>m</td>
        <td>e</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>Z</td>
        <td>w</td>
        <td hint="true">i</td>
        <td>l</td>
        <td>l</td>
        <td>i</td>
        <td>n</td>
        <td>g</td>
        <td>e</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>B</td>
        <td>u</td>
        <td hint="true">c</td>
        <td>h</td>
        <td>m</td>
        <td>e</td>
        <td>s</td>
        <td>s</td>
        <td>e</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>S</td>
        <td>c</td>
        <td hint="true">h</td>
        <td>e</td>
        <td>i</td>
        <td>d</td>
        <td>u</td>
        <td>n</td>
        <td>g</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>F</td>
        <td>r</td>
        <td hint="true">a</td>
        <td>n</td>
        <td>z</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>K</td>
        <td>ö</td>
        <td hint="true">n</td>
        <td>i</td>
        <td>g</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German2/les5/chapf/t2a_kb_l5_f1.htm" col_header="no"
      row_header="number"
      ident="---H*offnung--Mo*de--br*ingen--Jo*ghurt--As*thma-hek*tischErfo*lg-Dep*ressionen">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">H</td>
        <td>o</td>
        <td>f</td>
        <td>f</td>
        <td>n</td>
        <td>u</td>
        <td>n</td>
        <td>g</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>M</td>
        <td hint="true">o</td>
        <td>d</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>b</td>
        <td hint="true">r</td>
        <td>i</td>
        <td>n</td>
        <td>g</td>
        <td>e</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>J</td>
        <td hint="true">o</td>
        <td>g</td>
        <td>h</td>
        <td>u</td>
        <td>r</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>A</td>
        <td hint="true">s</td>
        <td>t</td>
        <td>h</td>
        <td>m</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>h</td>
        <td>e</td>
        <td hint="true">k</td>
        <td>t</td>
        <td>i</td>
        <td>s</td>
        <td>c</td>
        <td>h</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>E</td>
        <td>r</td>
        <td>f</td>
        <td hint="true">o</td>
        <td>l</td>
        <td>g</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>D</td>
        <td>e</td>
        <td hint="true">p</td>
        <td>r</td>
        <td>e</td>
        <td>s</td>
        <td>s</td>
        <td>i</td>
        <td>o</td>
        <td>n</td>
        <td>e</td>
        <td>n</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German2/les5/chapt/t2a_kb_l5_t5.htm" col_header="no"
      row_header="number" ident="-Eng*elBeul*e--Va*mpir--Du*rchfall-Rob*oterKate*r-Dyn*amit">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>E</td>
        <td>n</td>
        <td hint="true">g</td>
        <td>e</td>
        <td>l</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>B</td>
        <td>e</td>
        <td>u</td>
        <td hint="true">l</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>V</td>
        <td hint="true">a</td>
        <td>m</td>
        <td>p</td>
        <td>i</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>D</td>
        <td hint="true">u</td>
        <td>r</td>
        <td>c</td>
        <td>h</td>
        <td>f</td>
        <td>a</td>
        <td>l</td>
        <td>l</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>R</td>
        <td>o</td>
        <td hint="true">b</td>
        <td>o</td>
        <td>t</td>
        <td>e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>K</td>
        <td>a</td>
        <td>t</td>
        <td hint="true">e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>D</td>
        <td>y</td>
        <td hint="true">n</td>
        <td>a</td>
        <td>m</td>
        <td>i</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German2/les7/chapt/t2b_kb_l7_t9.htm" col_header=""
      row_header="number" ident="-FAMIL*IE----BE*TT--LIEB*EKINDHE*IT---LAN*D">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>F</td>
        <td>A</td>
        <td>M</td>
        <td>I</td>
        <td hint="true">L</td>
        <td>I</td>
        <td>E</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>B</td>
        <td hint="true">E</td>
        <td>T</td>
        <td>T</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>L</td>
        <td>I</td>
        <td>E</td>
        <td hint="true">B</td>
        <td>E</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>K</td>
        <td>I</td>
        <td>N</td>
        <td>D</td>
        <td>H</td>
        <td hint="true">E</td>
        <td>I</td>
        <td>T</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>L</td>
        <td>A</td>
        <td hint="true">N</td>
        <td>D</td>
        <td>-</td>
      </line>
    </item>
    <item type="make-word" id="cw1" name="German2/les8/chapb/t2b_ab_l8_b1.htm"
      ident="HOTELFDB+Ä+C+K+E+R+ESAH+RFRAUIGNE+RINMCA+U+T+O+R+I+N+INL+ISTES+U+RFUSSGP+I+L+O+T+AKC+S+UF+R+I+S+E+U+R+N+LA+LS+H+F+PO+LEV+NRGE+NX+OT+A+R+Z+T+BRE+IOKR+AI+FU+U+A+RO+NNR+EFOTOF+GD+S+U+FM+KAK+UMERMA+NE+P+LK+O+C+H+Ä+R+Z+T+I+N+H+MN+I+ERD+INU+KÜNSTR+AT+E+SRE+LAF+MEISTE+LI+L+EAL+MS+E+K+R+E+T+Ä+R+I+N+E+TUL+E+H+R+E+R+I+N+CIELR+ASSIREITSCHIRM">
      <line>
        <td>H</td>
        <td>O</td>
        <td>T</td>
        <td>E</td>
        <td>L</td>
        <td>F</td>
        <td>D</td>
        <td answer="true">B</td>
        <td answer="true">Ä</td>
        <td answer="true">C</td>
        <td answer="true">K</td>
        <td answer="true">E</td>
        <td answer="true">R</td>
        <td>E</td>
        <td>S</td>
      </line>
      <line>
        <td>A</td>
        <td answer="true">H</td>
        <td>R</td>
        <td>F</td>
        <td>R</td>
        <td>A</td>
        <td>U</td>
        <td>I</td>
        <td>G</td>
        <td>N</td>
        <td answer="true">E</td>
        <td>R</td>
        <td>I</td>
        <td>N</td>
        <td>M</td>
      </line>
      <line>
        <td>C</td>
        <td answer="true">A</td>
        <td answer="true">U</td>
        <td answer="true">T</td>
        <td answer="true">O</td>
        <td answer="true">R</td>
        <td answer="true">I</td>
        <td answer="true">N</td>
        <td>I</td>
        <td>N</td>
        <td answer="true">L</td>
        <td>I</td>
        <td>S</td>
        <td>T</td>
        <td>E</td>
      </line>
      <line>
        <td answer="true">S</td>
        <td answer="true">U</td>
        <td>R</td>
        <td>F</td>
        <td>U</td>
        <td>S</td>
        <td>S</td>
        <td>G</td>
        <td answer="true">P</td>
        <td answer="true">I</td>
        <td answer="true">L</td>
        <td answer="true">O</td>
        <td answer="true">T</td>
        <td>A</td>
        <td>K</td>
      </line>
      <line>
        <td answer="true">C</td>
        <td answer="true">S</td>
        <td>U</td>
        <td answer="true">F</td>
        <td answer="true">R</td>
        <td answer="true">I</td>
        <td answer="true">S</td>
        <td answer="true">E</td>
        <td answer="true">U</td>
        <td answer="true">R</td>
        <td answer="true">N</td>
        <td>L</td>
        <td answer="true">A</td>
        <td>L</td>
        <td answer="true">S</td>
      </line>
      <line>
        <td answer="true">H</td>
        <td answer="true">F</td>
        <td>P</td>
        <td answer="true">O</td>
        <td>L</td>
        <td>E</td>
        <td answer="true">V</td>
        <td>N</td>
        <td>R</td>
        <td>G</td>
        <td answer="true">E</td>
        <td>N</td>
        <td answer="true">X</td>
        <td>O</td>
        <td answer="true">T</td>
      </line>
      <line>
        <td answer="true">A</td>
        <td answer="true">R</td>
        <td answer="true">Z</td>
        <td answer="true">T</td>
        <td>B</td>
        <td>R</td>
        <td answer="true">E</td>
        <td>I</td>
        <td>O</td>
        <td>K</td>
        <td answer="true">R</td>
        <td>A</td>
        <td answer="true">I</td>
        <td>F</td>
        <td answer="true">U</td>
      </line>
      <line>
        <td answer="true">U</td>
        <td answer="true">A</td>
        <td>R</td>
        <td answer="true">O</td>
        <td>N</td>
        <td>N</td>
        <td answer="true">R</td>
        <td>E</td>
        <td>F</td>
        <td>O</td>
        <td>T</td>
        <td>O</td>
        <td answer="true">F</td>
        <td>G</td>
        <td answer="true">D</td>
      </line>
      <line>
        <td answer="true">S</td>
        <td answer="true">U</td>
        <td>F</td>
        <td answer="true">M</td>
        <td>K</td>
        <td>A</td>
        <td answer="true">K</td>
        <td>U</td>
        <td>M</td>
        <td>E</td>
        <td>R</td>
        <td>M</td>
        <td answer="true">A</td>
        <td>N</td>
        <td answer="true">E</td>
      </line>
      <line>
        <td answer="true">P</td>
        <td>L</td>
        <td answer="true">K</td>
        <td answer="true">O</td>
        <td answer="true">C</td>
        <td answer="true">H</td>
        <td answer="true">Ä</td>
        <td answer="true">R</td>
        <td answer="true">Z</td>
        <td answer="true">T</td>
        <td answer="true">I</td>
        <td answer="true">N</td>
        <td answer="true">H</td>
        <td>M</td>
        <td answer="true">N</td>
      </line>
      <line>
        <td answer="true">I</td>
        <td>E</td>
        <td>R</td>
        <td answer="true">D</td>
        <td>I</td>
        <td>N</td>
        <td answer="true">U</td>
        <td>K</td>
        <td>Ü</td>
        <td>N</td>
        <td>S</td>
        <td>T</td>
        <td answer="true">R</td>
        <td>A</td>
        <td answer="true">T</td>
      </line>
      <line>
        <td answer="true">E</td>
        <td>S</td>
        <td>R</td>
        <td answer="true">E</td>
        <td>L</td>
        <td>A</td>
        <td answer="true">F</td>
        <td>M</td>
        <td>E</td>
        <td>I</td>
        <td>S</td>
        <td>T</td>
        <td answer="true">E</td>
        <td>L</td>
        <td answer="true">I</td>
      </line>
      <line>
        <td answer="true">L</td>
        <td>E</td>
        <td>A</td>
        <td answer="true">L</td>
        <td>M</td>
        <td answer="true">S</td>
        <td answer="true">E</td>
        <td answer="true">K</td>
        <td answer="true">R</td>
        <td answer="true">E</td>
        <td answer="true">T</td>
        <td answer="true">Ä</td>
        <td answer="true">R</td>
        <td answer="true">I</td>
        <td answer="true">N</td>
      </line>
      <line>
        <td answer="true">E</td>
        <td>T</td>
        <td>U</td>
        <td answer="true">L</td>
        <td answer="true">E</td>
        <td answer="true">H</td>
        <td answer="true">R</td>
        <td answer="true">E</td>
        <td answer="true">R</td>
        <td answer="true">I</td>
        <td answer="true">N</td>
        <td>C</td>
        <td>I</td>
        <td>E</td>
        <td>L</td>
      </line>
      <line>
        <td answer="true">R</td>
        <td>A</td>
        <td>S</td>
        <td>S</td>
        <td>I</td>
        <td>R</td>
        <td>E</td>
        <td>I</td>
        <td>T</td>
        <td>S</td>
        <td>C</td>
        <td>H</td>
        <td>I</td>
        <td>R</td>
        <td>M</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German2/les8/chapt/t2b_kb_l8_t10.htm" col_header=""
      row_header="number" ident="---Pil*ot-Bäcke*r-Sachb*earbeiterin-Frise*urÄrztin*">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>P</td>
        <td>i</td>
        <td hint="true">l</td>
        <td>o</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>B</td>
        <td>ä</td>
        <td>c</td>
        <td>k</td>
        <td hint="true">e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>S</td>
        <td>a</td>
        <td>c</td>
        <td>h</td>
        <td hint="true">b</td>
        <td>e</td>
        <td>a</td>
        <td>r</td>
        <td>b</td>
        <td>e</td>
        <td>i</td>
        <td>t</td>
        <td>e</td>
        <td>r</td>
        <td>i</td>
        <td>n</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>F</td>
        <td>r</td>
        <td>i</td>
        <td>s</td>
        <td hint="true">e</td>
        <td>u</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>Ä</td>
        <td>r</td>
        <td>z</td>
        <td>t</td>
        <td>i</td>
        <td hint="true">n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw2" name="German2/les8/chapt/t2b_kb_l8_t10.htm" col_header=""
      row_header="number"
      ident="------Ha*usfrau----Lehr*er-----Arb*eitsloserFotomode*llSchauspi*eler----Arzt*------Ve*rkäufer-Autorin*">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>H</td>
        <td hint="true">a</td>
        <td>u</td>
        <td>s</td>
        <td>f</td>
        <td>r</td>
        <td>a</td>
        <td>u</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>L</td>
        <td>e</td>
        <td>h</td>
        <td hint="true">r</td>
        <td>e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>A</td>
        <td>r</td>
        <td hint="true">b</td>
        <td>e</td>
        <td>i</td>
        <td>t</td>
        <td>s</td>
        <td>l</td>
        <td>o</td>
        <td>s</td>
        <td>e</td>
        <td>r</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>F</td>
        <td>o</td>
        <td>t</td>
        <td>o</td>
        <td>m</td>
        <td>o</td>
        <td>d</td>
        <td hint="true">e</td>
        <td>l</td>
        <td>l</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>S</td>
        <td>c</td>
        <td>h</td>
        <td>a</td>
        <td>u</td>
        <td>s</td>
        <td>p</td>
        <td hint="true">i</td>
        <td>e</td>
        <td>l</td>
        <td>e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>A</td>
        <td>r</td>
        <td>z</td>
        <td hint="true">t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>V</td>
        <td hint="true">e</td>
        <td>r</td>
        <td>k</td>
        <td>ä</td>
        <td>u</td>
        <td>f</td>
        <td>e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>A</td>
        <td>u</td>
        <td>t</td>
        <td>o</td>
        <td>r</td>
        <td>i</td>
        <td hint="true">n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German2/les9/chapt/t2b_kb_l9_t8.htm" col_header=""
      row_header=""
      ident="-------@1.--------------------K------@3.-----------@2.HOEFLICHKEIT----------M------U-------------P------N----------@4.PERSONAL-D-----------@6.-O--@7.---E-----------B-M--W-@8.-N---------@5.BEDIENUNG@9.STOERUNG-----S-S--N-E-E-----------C-S--S-D-R-----------H----C-U-V-----------W----H-L-I-----------E------D-C-----------R--------E-------@10.KUNDE-------------------E------------------------------------">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>K</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>H</td>
        <td>O</td>
        <td>E</td>
        <td>F</td>
        <td>L</td>
        <td>I</td>
        <td>C</td>
        <td>H</td>
        <td>K</td>
        <td>E</td>
        <td>I</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>M</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>U</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>P</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">4.</td>
        <td>P</td>
        <td>E</td>
        <td>R</td>
        <td>S</td>
        <td>O</td>
        <td>N</td>
        <td>A</td>
        <td>L</td>
        <td>-</td>
        <td>D</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6.</td>
        <td>-</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>B</td>
        <td>-</td>
        <td>M</td>
        <td>-</td>
        <td>-</td>
        <td>W</td>
        <td>-</td>
        <td header="true">8.</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>B</td>
        <td>E</td>
        <td>D</td>
        <td>I</td>
        <td>E</td>
        <td>N</td>
        <td>U</td>
        <td>N</td>
        <td>G</td>
        <td header="true">9.</td>
        <td>S</td>
        <td>T</td>
        <td>O</td>
        <td>E</td>
        <td>R</td>
        <td>U</td>
        <td>N</td>
        <td>G</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>D</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>H</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td>-</td>
        <td>U</td>
        <td>-</td>
        <td>V</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>W</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>H</td>
        <td>-</td>
        <td>L</td>
        <td>-</td>
        <td>I</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>D</td>
        <td>-</td>
        <td>C</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">10.</td>
        <td>K</td>
        <td>U</td>
        <td>N</td>
        <td>D</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German2/les10/chapt/t2b_kb_l10_t10.htm" col_header=""
      row_header=""
      ident="-------@1.*LEBENSKRISE@2.SELBSTH*ILFEGRUPPE------@3.FR*EUNDSCHAFT-----@4.LIE*BE-----------@5.HOCHZ*EIT--------">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td hint="true">L</td>
        <td>E</td>
        <td>B</td>
        <td>E</td>
        <td>N</td>
        <td>S</td>
        <td>K</td>
        <td>R</td>
        <td>I</td>
        <td>S</td>
        <td>E</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>S</td>
        <td>E</td>
        <td>L</td>
        <td>B</td>
        <td>S</td>
        <td>T</td>
        <td>H</td>
        <td hint="true">I</td>
        <td>L</td>
        <td>F</td>
        <td>E</td>
        <td>G</td>
        <td>R</td>
        <td>U</td>
        <td>P</td>
        <td>P</td>
        <td>E</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">3.</td>
        <td>F</td>
        <td>R</td>
        <td hint="true">E</td>
        <td>U</td>
        <td>N</td>
        <td>D</td>
        <td>S</td>
        <td>C</td>
        <td>H</td>
        <td>A</td>
        <td>F</td>
        <td>T</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">4.</td>
        <td>L</td>
        <td>I</td>
        <td>E</td>
        <td hint="true">B</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>H</td>
        <td>O</td>
        <td>C</td>
        <td>H</td>
        <td>Z</td>
        <td hint="true">E</td>
        <td>I</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw2" name="German2/les10/chapt/t2b_kb_l10_t10.htm" col_header=""
      row_header=""
      ident="------@1.*NACHBARSCHAFT@2.PUBERT*ÄT------------@3.UMBRU*CH------------@4.GLEIC*HGÜLTIGKEIT---@5.LEBEN*SSINN-----------@6.SEK*TE------------@7.ENGAG*EMENT----------@8.EHRE*NAMT---------">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td hint="true">N</td>
        <td>A</td>
        <td>C</td>
        <td>H</td>
        <td>B</td>
        <td>A</td>
        <td>R</td>
        <td>S</td>
        <td>C</td>
        <td>H</td>
        <td>A</td>
        <td>F</td>
        <td>T</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>P</td>
        <td>U</td>
        <td>B</td>
        <td>E</td>
        <td>R</td>
        <td>T</td>
        <td hint="true">Ä</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">3.</td>
        <td>U</td>
        <td>M</td>
        <td>B</td>
        <td>R</td>
        <td>U</td>
        <td hint="true">C</td>
        <td>H</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">4.</td>
        <td>G</td>
        <td>L</td>
        <td>E</td>
        <td>I</td>
        <td>C</td>
        <td hint="true">H</td>
        <td>G</td>
        <td>Ü</td>
        <td>L</td>
        <td>T</td>
        <td>I</td>
        <td>G</td>
        <td>K</td>
        <td>E</td>
        <td>I</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">5.</td>
        <td>L</td>
        <td>E</td>
        <td>B</td>
        <td>E</td>
        <td>N</td>
        <td hint="true">S</td>
        <td>S</td>
        <td>I</td>
        <td>N</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6.</td>
        <td>S</td>
        <td>E</td>
        <td>K</td>
        <td hint="true">T</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">7.</td>
        <td>E</td>
        <td>N</td>
        <td>G</td>
        <td>A</td>
        <td>G</td>
        <td hint="true">E</td>
        <td>M</td>
        <td>E</td>
        <td>N</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">8.</td>
        <td>E</td>
        <td>H</td>
        <td>R</td>
        <td>E</td>
        <td hint="true">N</td>
        <td>A</td>
        <td>M</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German2/les11/chapt/t2b_kb_l11_t8.htm" col_header=""
      row_header=""
      ident="--@3.DRU*CKER-------@6.M*ODEM--------@7.*MAUS---@9.LAUTS*PRECHER---@11.LA*UFWERK---@5.TAS*TATUR---@4.DISK*ETTE-----@8.CD@-*ROM----">
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">3.</td>
        <td>D</td>
        <td>R</td>
        <td>U</td>
        <td hint="true">C</td>
        <td>K</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6.</td>
        <td>M</td>
        <td hint="true">O</td>
        <td>D</td>
        <td>E</td>
        <td>M</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">7.</td>
        <td hint="true">M</td>
        <td>A</td>
        <td>U</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>L</td>
        <td>A</td>
        <td>U</td>
        <td>T</td>
        <td>S</td>
        <td hint="true">P</td>
        <td>R</td>
        <td>E</td>
        <td>C</td>
        <td>H</td>
        <td>E</td>
        <td>R</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">11.</td>
        <td>L</td>
        <td>A</td>
        <td hint="true">U</td>
        <td>F</td>
        <td>W</td>
        <td>E</td>
        <td>R</td>
        <td>K</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>T</td>
        <td>A</td>
        <td>S</td>
        <td hint="true">T</td>
        <td>A</td>
        <td>T</td>
        <td>U</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">4.</td>
        <td>D</td>
        <td>I</td>
        <td>S</td>
        <td>K</td>
        <td hint="true">E</td>
        <td>T</td>
        <td>T</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">8.</td>
        <td>C</td>
        <td>D</td>
        <td header="true">-</td>
        <td hint="true">R</td>
        <td>O</td>
        <td>M</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="German3/les1/chapt/t3a_kb_l1_t8.htm" col_header=""
      row_header="number" ident="--M*önch-No*nneAer*obicBad*minton">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">M</td>
        <td>ö</td>
        <td>n</td>
        <td>c</td>
        <td>h</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>N</td>
        <td hint="true">o</td>
        <td>n</td>
        <td>n</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>A</td>
        <td>e</td>
        <td hint="true">r</td>
        <td>o</td>
        <td>b</td>
        <td>i</td>
        <td>c</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>B</td>
        <td>a</td>
        <td hint="true">d</td>
        <td>m</td>
        <td>i</td>
        <td>n</td>
        <td>t</td>
        <td>o</td>
        <td>n</td>
      </line>
    </item>
    <item type="cross-word" id="cw02" name="German3/les1/chapt/t3a_kb_l1_t8.htm" col_header=""
      row_header="number"
      ident="---G*eburtshelferin--Ne*rvenkitzel--Ki*ckKais*erschnitt--St*ubenhocker">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">G</td>
        <td>e</td>
        <td>b</td>
        <td>u</td>
        <td>r</td>
        <td>t</td>
        <td>s</td>
        <td>h</td>
        <td>e</td>
        <td>l</td>
        <td>f</td>
        <td>e</td>
        <td>r</td>
        <td>i</td>
        <td>n</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>N</td>
        <td hint="true">e</td>
        <td>r</td>
        <td>v</td>
        <td>e</td>
        <td>n</td>
        <td>k</td>
        <td>i</td>
        <td>t</td>
        <td>z</td>
        <td>e</td>
        <td>l</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>K</td>
        <td hint="true">i</td>
        <td>c</td>
        <td>k</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>K</td>
        <td>a</td>
        <td>i</td>
        <td hint="true">s</td>
        <td>e</td>
        <td>r</td>
        <td>s</td>
        <td>c</td>
        <td>h</td>
        <td>n</td>
        <td>i</td>
        <td>t</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>S</td>
        <td hint="true">t</td>
        <td>u</td>
        <td>b</td>
        <td>e</td>
        <td>n</td>
        <td>h</td>
        <td>o</td>
        <td>c</td>
        <td>k</td>
        <td>e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="German3/les2/chapt/t3a_kb_l2_t8.htm" col_header=""
      row_header="number"
      ident="----A*dverbien---Pr*äpositionenDirig*entWerbu*ng--Kom*parativ---ne*rvt--Han*dy-Part*yKaffe*e">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">A</td>
        <td>d</td>
        <td>v</td>
        <td>e</td>
        <td>r</td>
        <td>b</td>
        <td>i</td>
        <td>e</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>P</td>
        <td hint="true">r</td>
        <td>ä</td>
        <td>p</td>
        <td>o</td>
        <td>s</td>
        <td>i</td>
        <td>t</td>
        <td>i</td>
        <td>o</td>
        <td>n</td>
        <td>e</td>
        <td>n</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>D</td>
        <td>i</td>
        <td>r</td>
        <td>i</td>
        <td hint="true">g</td>
        <td>e</td>
        <td>n</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>W</td>
        <td>e</td>
        <td>r</td>
        <td>b</td>
        <td hint="true">u</td>
        <td>n</td>
        <td>g</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>K</td>
        <td>o</td>
        <td hint="true">m</td>
        <td>p</td>
        <td>a</td>
        <td>r</td>
        <td>a</td>
        <td>t</td>
        <td>i</td>
        <td>v</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>n</td>
        <td hint="true">e</td>
        <td>r</td>
        <td>v</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>H</td>
        <td>a</td>
        <td hint="true">n</td>
        <td>d</td>
        <td>y</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>P</td>
        <td>a</td>
        <td>r</td>
        <td hint="true">t</td>
        <td>y</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>K</td>
        <td>a</td>
        <td>f</td>
        <td>f</td>
        <td hint="true">e</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German3/les3/chapt/t3a_kb_l3_t10.htm" col_header="letter"
      row_header="number" ident="----L*ichtleinKarne*valVerei*n---Ab*schneiden">
      <line>
        <td>-</td>
        <td header="true">a</td>
        <td header="true">b</td>
        <td header="true">c</td>
        <td header="true">d</td>
        <td header="true">e</td>
        <td header="true">f</td>
        <td header="true">g</td>
        <td header="true">h</td>
        <td header="true">i</td>
        <td header="true">ak</td>
        <td header="true">aa</td>
        <td header="true">ab</td>
        <td header="true">ac</td>
        <td header="true">ad</td>
      </line>
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">L</td>
        <td>i</td>
        <td>c</td>
        <td>h</td>
        <td>t</td>
        <td>l</td>
        <td>e</td>
        <td>i</td>
        <td>n</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>K</td>
        <td>a</td>
        <td>r</td>
        <td>n</td>
        <td hint="true">e</td>
        <td>v</td>
        <td>a</td>
        <td>l</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>V</td>
        <td>e</td>
        <td>r</td>
        <td>e</td>
        <td hint="true">i</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>A</td>
        <td hint="true">b</td>
        <td>s</td>
        <td>c</td>
        <td>h</td>
        <td>n</td>
        <td>e</td>
        <td>i</td>
        <td>d</td>
        <td>e</td>
        <td>n</td>
      </line>
    </item>
    <item type="cross-word" id="cw2" name="German3/les3/chapt/t3a_kb_l3_t10.htm" col_header="letter"
      row_header="number" ident="-------S*ilvester-----Goe*the---Morge*nland----Voll*mondPfingste*n">
      <line>
        <td>-</td>
        <td header="true">a</td>
        <td header="true">b</td>
        <td header="true">c</td>
        <td header="true">d</td>
        <td header="true">e</td>
        <td header="true">f</td>
        <td header="true">g</td>
        <td header="true">h</td>
        <td header="true">i</td>
        <td header="true">ak</td>
        <td header="true">aa</td>
        <td header="true">ab</td>
        <td header="true">ac</td>
        <td header="true">ad</td>
        <td header="true">ae</td>
        <td header="true">af</td>
      </line>
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">S</td>
        <td>i</td>
        <td>l</td>
        <td>v</td>
        <td>e</td>
        <td>s</td>
        <td>t</td>
        <td>e</td>
        <td>r</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>G</td>
        <td>o</td>
        <td hint="true">e</td>
        <td>t</td>
        <td>h</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>M</td>
        <td>o</td>
        <td>r</td>
        <td>g</td>
        <td hint="true">e</td>
        <td>n</td>
        <td>l</td>
        <td>a</td>
        <td>n</td>
        <td>d</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>V</td>
        <td>o</td>
        <td>l</td>
        <td hint="true">l</td>
        <td>m</td>
        <td>o</td>
        <td>n</td>
        <td>d</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>P</td>
        <td>f</td>
        <td>i</td>
        <td>n</td>
        <td>g</td>
        <td>s</td>
        <td>t</td>
        <td hint="true">e</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German3/les4/chapt/t3a_kb_l4_t10.htm" col_header="no"
      row_header="number" ident="-W*unschmu*ss-n*icht-d*arfse*hrin*">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td hint="true">W</td>
        <td>u</td>
        <td>n</td>
        <td>s</td>
        <td>c</td>
        <td>h</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>m</td>
        <td hint="true">u</td>
        <td>s</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td hint="true">n</td>
        <td>i</td>
        <td>c</td>
        <td>h</td>
        <td>t</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td hint="true">d</td>
        <td>a</td>
        <td>r</td>
        <td>f</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>s</td>
        <td hint="true">e</td>
        <td>h</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>i</td>
        <td hint="true">n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw2" name="German3/les4/chapt/t3a_kb_l4_t10.htm" col_header="no"
      row_header="number" ident="----G*rüne---Me*inungProbl*em---Id*ee">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">G</td>
        <td>r</td>
        <td>ü</td>
        <td>n</td>
        <td>e</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>M</td>
        <td hint="true">e</td>
        <td>i</td>
        <td>n</td>
        <td>u</td>
        <td>n</td>
        <td>g</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>P</td>
        <td>r</td>
        <td>o</td>
        <td>b</td>
        <td hint="true">l</td>
        <td>e</td>
        <td>m</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>I</td>
        <td hint="true">d</td>
        <td>e</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw3" name="German3/les4/chapt/t3a_kb_l4_t10.htm" col_header="no"
      row_header="number" ident="----R*esultateGloba*lisierung---St*au">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">R</td>
        <td>e</td>
        <td>s</td>
        <td>u</td>
        <td>l</td>
        <td>t</td>
        <td>a</td>
        <td>t</td>
        <td>e</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>G</td>
        <td>l</td>
        <td>o</td>
        <td>b</td>
        <td hint="true">a</td>
        <td>l</td>
        <td>i</td>
        <td>s</td>
        <td>i</td>
        <td>e</td>
        <td>r</td>
        <td>u</td>
        <td>n</td>
        <td>g</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>S</td>
        <td hint="true">t</td>
        <td>a</td>
        <td>u</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="German3/les5/chapt/t3a_kb_l5_t8.htm" col_header="no"
      row_header="number" ident="----Z*ukunft---Zw*eite---Be*atles--Her*z-Lang*Kaise*rreich">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">Z</td>
        <td>u</td>
        <td>k</td>
        <td>u</td>
        <td>n</td>
        <td>f</td>
        <td>t</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>Z</td>
        <td hint="true">w</td>
        <td>e</td>
        <td>i</td>
        <td>t</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>B</td>
        <td hint="true">e</td>
        <td>a</td>
        <td>t</td>
        <td>l</td>
        <td>e</td>
        <td>s</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>H</td>
        <td>e</td>
        <td hint="true">r</td>
        <td>z</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>L</td>
        <td>a</td>
        <td>n</td>
        <td hint="true">g</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>K</td>
        <td>a</td>
        <td>i</td>
        <td>s</td>
        <td hint="true">e</td>
        <td>r</td>
        <td>r</td>
        <td>e</td>
        <td>i</td>
        <td>c</td>
        <td>h</td>
      </line>
    </item>
    <item type="cross-word" id="cw2" name="German3/les5/chapt/t3a_kb_l5_t8.htm" col_header="no"
      row_header="number"
      ident="---S*ektoren--Sc*hallplatten-Wah*len--Ma*uerbau-Okt*oberDikt*atur--Ve*rfassung-Mon*d">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">S</td>
        <td>e</td>
        <td>k</td>
        <td>t</td>
        <td>o</td>
        <td>r</td>
        <td>e</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>S</td>
        <td hint="true">c</td>
        <td>h</td>
        <td>a</td>
        <td>l</td>
        <td>l</td>
        <td>p</td>
        <td>l</td>
        <td>a</td>
        <td>t</td>
        <td>t</td>
        <td>e</td>
        <td>n</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>W</td>
        <td>a</td>
        <td hint="true">h</td>
        <td>l</td>
        <td>e</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>M</td>
        <td hint="true">a</td>
        <td>u</td>
        <td>e</td>
        <td>r</td>
        <td>b</td>
        <td>a</td>
        <td>u</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>O</td>
        <td>k</td>
        <td hint="true">t</td>
        <td>o</td>
        <td>b</td>
        <td>e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>D</td>
        <td>i</td>
        <td>k</td>
        <td hint="true">t</td>
        <td>a</td>
        <td>t</td>
        <td>u</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>V</td>
        <td hint="true">e</td>
        <td>r</td>
        <td>f</td>
        <td>a</td>
        <td>s</td>
        <td>s</td>
        <td>u</td>
        <td>n</td>
        <td>g</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>M</td>
        <td>o</td>
        <td hint="true">n</td>
        <td>d</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English1/l03/d/hueex0_l03_d09.htm" col_header=""
      row_header="number" ident="---s*ky-blu*erain*bow---s*un--wh*ite--vi*oletoran*gegree*n">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">s</td>
        <td>k</td>
        <td>y</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>b</td>
        <td>l</td>
        <td hint="true">u</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>r</td>
        <td>a</td>
        <td>i</td>
        <td hint="true">n</td>
        <td>b</td>
        <td>o</td>
        <td>w</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">s</td>
        <td>u</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>w</td>
        <td hint="true">h</td>
        <td>i</td>
        <td>t</td>
        <td>e</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>v</td>
        <td hint="true">i</td>
        <td>o</td>
        <td>l</td>
        <td>e</td>
        <td>t</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>o</td>
        <td>r</td>
        <td>a</td>
        <td hint="true">n</td>
        <td>g</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>g</td>
        <td>r</td>
        <td>e</td>
        <td hint="true">e</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English1/l21/a/hueex0_l21_a03.htm" col_header=""
      row_header="number"
      ident="-----B*EER----WI*NE----FR*IEND--PART*Y-----H*APPYSATURD*AY----CA*KE-----Y*OU">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">B</td>
        <td>E</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>W</td>
        <td hint="true">I</td>
        <td>N</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>F</td>
        <td hint="true">R</td>
        <td>I</td>
        <td>E</td>
        <td>N</td>
        <td>D</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>P</td>
        <td>A</td>
        <td>R</td>
        <td hint="true">T</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">H</td>
        <td>A</td>
        <td>P</td>
        <td>P</td>
        <td>Y</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>S</td>
        <td>A</td>
        <td>T</td>
        <td>U</td>
        <td>R</td>
        <td hint="true">D</td>
        <td>A</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td hint="true">A</td>
        <td>K</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">Y</td>
        <td>O</td>
        <td>U</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English1/l04/c/hueex0_l04_c06.htm" col_header=""
      row_header="number"
      ident="---BRI*EFCASE---TIM*E-@PLANNER-----P*EN-LAPTO*P--ADDR*ESSBOOK--DICT*IONARY----WA*LLET---MON*EYCREDIT*-CARD">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>B</td>
        <td>R</td>
        <td hint="true">I</td>
        <td>E</td>
        <td>F</td>
        <td>C</td>
        <td>A</td>
        <td>S</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>T</td>
        <td>I</td>
        <td hint="true">M</td>
        <td>E</td>
        <td header="true">-</td>
        <td>P</td>
        <td>L</td>
        <td>A</td>
        <td>N</td>
        <td>N</td>
        <td>E</td>
        <td>R</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">P</td>
        <td>E</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>L</td>
        <td>A</td>
        <td>P</td>
        <td>T</td>
        <td hint="true">O</td>
        <td>P</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>A</td>
        <td>D</td>
        <td>D</td>
        <td hint="true">R</td>
        <td>E</td>
        <td>S</td>
        <td>S</td>
        <td>B</td>
        <td>O</td>
        <td>O</td>
        <td>K</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>D</td>
        <td>I</td>
        <td>C</td>
        <td hint="true">T</td>
        <td>I</td>
        <td>O</td>
        <td>N</td>
        <td>A</td>
        <td>R</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>W</td>
        <td hint="true">A</td>
        <td>L</td>
        <td>L</td>
        <td>E</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>M</td>
        <td>O</td>
        <td hint="true">N</td>
        <td>E</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>C</td>
        <td>R</td>
        <td>E</td>
        <td>D</td>
        <td>I</td>
        <td hint="true">T</td>
        <td>-</td>
        <td>C</td>
        <td>A</td>
        <td>R</td>
        <td>D</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English1/l05/b/hueex0_l05_b08.htm" col_header=""
      row_header=""
      ident="----------@1.---------@2.--S-------@4.@3.CLOUDY-----R-O--N-------A-L--N-----@6./5.WINDY-Y-----H-N-------@7.SNOWY----------T">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">4.</td>
        <td header="true">3.</td>
        <td>C</td>
        <td>L</td>
        <td>O</td>
        <td>U</td>
        <td>D</td>
        <td>Y</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>A</td>
        <td>-</td>
        <td>L</td>
        <td>-</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6./5.</td>
        <td>W</td>
        <td>I</td>
        <td>N</td>
        <td>D</td>
        <td>Y</td>
        <td>-</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>H</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>S</td>
        <td>N</td>
        <td>O</td>
        <td>W</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English1/l06/b/hueex0_l06_b05.htm" col_header=""
      row_header=""
      ident="---JU@NE--------D---S-A-----------@E-J-E-N-------O---C-U-@P-@U--M----@C---E-L-@T-A--AUGUS@T---MA@Y@FEBRUARY---O---B---M-Y--C----B---E---B----H-NO@VEMBE@R---E---------R-------R----------------">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>J</td>
        <td>U</td>
        <td header="true">N</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>D</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>A</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">E</td>
        <td>-</td>
        <td>J</td>
      </line>
      <line>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td>-</td>
        <td>U</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">P</td>
        <td>-</td>
        <td header="true">U</td>
        <td>-</td>
        <td>-</td>
        <td>M</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">C</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>L</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">T</td>
        <td>-</td>
        <td>A</td>
        <td>-</td>
        <td>-</td>
        <td>A</td>
        <td>U</td>
        <td>G</td>
        <td>U</td>
        <td>S</td>
        <td header="true">T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>M</td>
        <td>A</td>
        <td header="true">Y</td>
      </line>
      <line>
        <td header="true">F</td>
        <td>E</td>
        <td>B</td>
        <td>R</td>
        <td>U</td>
        <td>A</td>
        <td>R</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>B</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>M</td>
        <td>-</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>B</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>B</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>H</td>
        <td>-</td>
        <td>N</td>
        <td>O</td>
        <td header="true">V</td>
        <td>E</td>
        <td>M</td>
        <td>B</td>
        <td>E</td>
        <td header="true">R</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="make-word" id="mw1" name="English1/l07/d/hueex0_l07_d04.htm"
      ident="DPUB+I+G+US+LOVEOBBQ+SITM+TAH+OGCETU+VMA+USA+TWT+E+R+R+I+B+L+E+PR+BIAHISCE+L+O+U+D+VNETHELOT+WNOP">
      <line>
        <td>D</td>
        <td>P</td>
        <td>U</td>
        <td answer="true">B</td>
        <td answer="true">I</td>
        <td answer="true">G</td>
        <td>U</td>
        <td answer="true">S</td>
        <td>L</td>
        <td>O</td>
        <td>V</td>
        <td>E</td>
      </line>
      <line>
        <td>O</td>
        <td>B</td>
        <td>B</td>
        <td answer="true">Q</td>
        <td>S</td>
        <td>I</td>
        <td>T</td>
        <td answer="true">M</td>
        <td>T</td>
        <td>A</td>
        <td answer="true">H</td>
        <td>O</td>
      </line>
      <line>
        <td>G</td>
        <td>C</td>
        <td>E</td>
        <td>T</td>
        <td answer="true">U</td>
        <td>V</td>
        <td>M</td>
        <td answer="true">A</td>
        <td>U</td>
        <td>S</td>
        <td answer="true">A</td>
        <td>T</td>
      </line>
      <line>
        <td>W</td>
        <td answer="true">T</td>
        <td answer="true">E</td>
        <td answer="true">R</td>
        <td answer="true">R</td>
        <td answer="true">I</td>
        <td answer="true">B</td>
        <td answer="true">L</td>
        <td answer="true">E</td>
        <td>P</td>
        <td answer="true">R</td>
        <td>B</td>
      </line>
      <line>
        <td>I</td>
        <td>A</td>
        <td>H</td>
        <td>I</td>
        <td>S</td>
        <td>C</td>
        <td answer="true">E</td>
        <td answer="true">L</td>
        <td answer="true">O</td>
        <td answer="true">U</td>
        <td answer="true">D</td>
        <td>V</td>
      </line>
      <line>
        <td>N</td>
        <td>E</td>
        <td>T</td>
        <td>H</td>
        <td>E</td>
        <td>L</td>
        <td>O</td>
        <td answer="true">T</td>
        <td>W</td>
        <td>N</td>
        <td>O</td>
        <td>P</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English1/l23/a/hueex0_l23_a01.htm" col_header=""
      row_header=""
      ident="------@1.---@2.---------w---o-@5.----@3.get-@4.play------n-@7.-e-r------@6.train-e----@8.--@9.-f--------u--g@10.town----@11.please--@13.--------r@12.read-----@15.--d----o--@14.watched@16.see-----o--n----s--">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>w</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>o</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">3.</td>
        <td>g</td>
        <td>e</td>
        <td>t</td>
        <td>-</td>
        <td header="true">4.</td>
        <td>p</td>
        <td>l</td>
        <td>a</td>
        <td>y</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>n</td>
        <td>-</td>
        <td header="true">7.</td>
        <td>-</td>
        <td>e</td>
        <td>-</td>
        <td>r</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6.</td>
        <td>t</td>
        <td>r</td>
        <td>a</td>
        <td>i</td>
        <td>n</td>
        <td>-</td>
        <td>e</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td header="true">9.</td>
        <td>-</td>
        <td>f</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>u</td>
        <td>-</td>
        <td>-</td>
        <td>g</td>
        <td header="true">10.</td>
        <td>t</td>
        <td>o</td>
        <td>w</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">11.</td>
        <td>p</td>
        <td>l</td>
        <td>e</td>
        <td>a</td>
        <td>s</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td header="true">13.</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>r</td>
        <td header="true">12.</td>
        <td>r</td>
        <td>e</td>
        <td>a</td>
        <td>d</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">15.</td>
        <td>-</td>
        <td>-</td>
        <td>d</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">14.</td>
        <td>w</td>
        <td>a</td>
        <td>t</td>
        <td>c</td>
        <td>h</td>
        <td>e</td>
        <td>d</td>
        <td header="true">16.</td>
        <td>s</td>
        <td>e</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English1/l11/c/hueex0_l11_c04.htm" col_header=""
      row_header=""
      ident="------@6.------W---@1.TEACHER----@2.PILOT@3.ASSISTANT---@4.CLERK---@5.FARMER">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>W</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td>T</td>
        <td>E</td>
        <td>A</td>
        <td>C</td>
        <td>H</td>
        <td>E</td>
        <td>R</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>P</td>
        <td>I</td>
        <td>L</td>
        <td>O</td>
        <td>T</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>A</td>
        <td>S</td>
        <td>S</td>
        <td>I</td>
        <td>S</td>
        <td>T</td>
        <td>A</td>
        <td>N</td>
        <td>T</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">4.</td>
        <td>C</td>
        <td>L</td>
        <td>E</td>
        <td>R</td>
        <td>K</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>F</td>
        <td>A</td>
        <td>R</td>
        <td>M</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="English2/l06/a/hueex1_l06_a07.htm" col_header=""
      row_header=""
      ident="-1.@------2.@--1.@ROSE-8.@2.@MY-O--L@-S-E----O--E@-T-R----M3.@AMERICA------E@-A-E---6.@4.@ON-U5.@DO-6.@AUNT7.@SEE---T--S@-S-S--">
      <line>
        <td>-</td>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">1.</td>
        <td>R</td>
        <td>O</td>
        <td>S</td>
        <td>E</td>
        <td>-</td>
        <td header="true">8.</td>
        <td header="true">2.</td>
        <td>M</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
        <td header="true">L</td>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
        <td header="true">E</td>
        <td>-</td>
        <td>T</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>M</td>
        <td header="true">3.</td>
        <td>A</td>
        <td>M</td>
        <td>E</td>
        <td>R</td>
        <td>I</td>
        <td>C</td>
        <td>A</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">E</td>
        <td>-</td>
        <td>A</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">6.</td>
        <td header="true">4.</td>
        <td>O</td>
        <td>N</td>
        <td>-</td>
        <td>U</td>
        <td header="true">5.</td>
        <td>D</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>A</td>
        <td>U</td>
        <td>N</td>
        <td>T</td>
        <td header="true">7.</td>
        <td>S</td>
        <td>E</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td header="true">S</td>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="English2/l06/c/hueex1_l06_c01.htm" col_header=""
      row_header=""
      ident="------1.@------M---3.@---------2.@-1.@AUGUST--4.@----2.@JULY---E-3.@FALL---U------P---P-----N---4.@OCTOBER-----E------E---I--------5.@SUMMER-L-------5.@--6.@-B-7.@---------S--D-E-J---------P6.@FEBRUARY-------R--C---N-------7.@WINTER--U---------N--M-8.@MARCH------G--B---R------------E---Y----9.@NOVEMBER--------">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>M</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>-</td>
        <td header="true">1.</td>
        <td>A</td>
        <td>U</td>
        <td>G</td>
        <td>U</td>
        <td>S</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>J</td>
        <td>U</td>
        <td>L</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td header="true">3.</td>
        <td>F</td>
        <td>A</td>
        <td>L</td>
        <td>L</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>U</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>P</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>P</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">4.</td>
        <td>O</td>
        <td>C</td>
        <td>T</td>
        <td>O</td>
        <td>B</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>I</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>S</td>
        <td>U</td>
        <td>M</td>
        <td>M</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
        <td>L</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6.</td>
        <td>-</td>
        <td>B</td>
        <td>-</td>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
        <td>D</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>J</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>P</td>
        <td header="true">6.</td>
        <td>F</td>
        <td>E</td>
        <td>B</td>
        <td>R</td>
        <td>U</td>
        <td>A</td>
        <td>R</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">7.</td>
        <td>W</td>
        <td>I</td>
        <td>N</td>
        <td>T</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>U</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>M</td>
        <td>-</td>
        <td header="true">8.</td>
        <td>M</td>
        <td>A</td>
        <td>R</td>
        <td>C</td>
        <td>H</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>G</td>
        <td>-</td>
        <td>-</td>
        <td>B</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>N</td>
        <td>O</td>
        <td>V</td>
        <td>E</td>
        <td>M</td>
        <td>B</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="English2/l07/b/hueex1_l07_b03.htm" col_header=""
      row_header="number"
      ident="---CO*STSCANN*ER----S*HELFSHOPP*ING--OPE*N-BARC*ODECASHI*ER-LOCA*L---CL*OSE--TRO*LLEY----F*RUITCORNF*LAKES--CHE*CKOUT--MAR*KET">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td hint="true">O</td>
        <td>S</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>S</td>
        <td>C</td>
        <td>A</td>
        <td>N</td>
        <td hint="true">N</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">S</td>
        <td>H</td>
        <td>E</td>
        <td>L</td>
        <td>F</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>S</td>
        <td>H</td>
        <td>O</td>
        <td>P</td>
        <td hint="true">P</td>
        <td>I</td>
        <td>N</td>
        <td>G</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>O</td>
        <td>P</td>
        <td hint="true">E</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>B</td>
        <td>A</td>
        <td>R</td>
        <td hint="true">C</td>
        <td>O</td>
        <td>D</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>C</td>
        <td>A</td>
        <td>S</td>
        <td>H</td>
        <td hint="true">I</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>L</td>
        <td>O</td>
        <td>C</td>
        <td hint="true">A</td>
        <td>L</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td hint="true">L</td>
        <td>O</td>
        <td>S</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">10.</td>
        <td>-</td>
        <td>-</td>
        <td>T</td>
        <td>R</td>
        <td hint="true">O</td>
        <td>L</td>
        <td>L</td>
        <td>E</td>
        <td>Y</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">11.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">F</td>
        <td>R</td>
        <td>U</td>
        <td>I</td>
        <td>T</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">12.</td>
        <td>C</td>
        <td>O</td>
        <td>R</td>
        <td>N</td>
        <td hint="true">F</td>
        <td>L</td>
        <td>A</td>
        <td>K</td>
        <td>E</td>
        <td>S</td>
      </line>
      <line>
        <td header="true">13.</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td>H</td>
        <td hint="true">E</td>
        <td>C</td>
        <td>K</td>
        <td>O</td>
        <td>U</td>
        <td>T</td>
      </line>
      <line>
        <td header="true">14.</td>
        <td>-</td>
        <td>-</td>
        <td>M</td>
        <td>A</td>
        <td hint="true">R</td>
        <td>K</td>
        <td>E</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="make-word" id="mkw01" name="English2/l23/a/hueex1_l23_a03.htm"
      ident="T+G+W+E+R+E+H+B+O+U+G+H+T+A+S+T+O+P+P+E+D+W+L+I+K+E+D+UE+JE+RLAP+N+GEF+FU+RT+W+A+S+T+OO">
      <line>
        <td answer="true">T</td>
        <td answer="true">G</td>
        <td answer="true">W</td>
        <td answer="true">E</td>
        <td answer="true">R</td>
        <td answer="true">E</td>
        <td answer="true">H</td>
      </line>
      <line>
        <td answer="true">B</td>
        <td answer="true">O</td>
        <td answer="true">U</td>
        <td answer="true">G</td>
        <td answer="true">H</td>
        <td answer="true">T</td>
        <td answer="true">A</td>
      </line>
      <line>
        <td answer="true">S</td>
        <td answer="true">T</td>
        <td answer="true">O</td>
        <td answer="true">P</td>
        <td answer="true">P</td>
        <td answer="true">E</td>
        <td answer="true">D</td>
      </line>
      <line>
        <td answer="true">W</td>
        <td answer="true">L</td>
        <td answer="true">I</td>
        <td answer="true">K</td>
        <td answer="true">E</td>
        <td answer="true">D</td>
        <td>U</td>
      </line>
      <line>
        <td answer="true">E</td>
        <td>J</td>
        <td answer="true">E</td>
        <td>R</td>
        <td>L</td>
        <td>A</td>
        <td answer="true">P</td>
      </line>
      <line>
        <td answer="true">N</td>
        <td>G</td>
        <td>E</td>
        <td answer="true">F</td>
        <td>F</td>
        <td answer="true">U</td>
        <td>R</td>
      </line>
      <line>
        <td answer="true">T</td>
        <td answer="true">W</td>
        <td answer="true">A</td>
        <td answer="true">S</td>
        <td answer="true">T</td>
        <td>O</td>
        <td>O</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="English2/l11/c/hueex1_l11_c06.htm" col_header=""
      row_header="number" ident="WAITR@ESSTOMOR@R@OWCOMPUTER@ISLANDER@TOUR@ISTSPR@OBLEMS">
      <line>
        <td header="true">1.</td>
        <td>W</td>
        <td>A</td>
        <td>I</td>
        <td>T</td>
        <td header="true">R</td>
        <td>E</td>
        <td>S</td>
        <td>S</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>T</td>
        <td>O</td>
        <td>M</td>
        <td>O</td>
        <td header="true">R</td>
        <td header="true">R</td>
        <td>O</td>
        <td>W</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>C</td>
        <td>O</td>
        <td>M</td>
        <td>P</td>
        <td>U</td>
        <td>T</td>
        <td>E</td>
        <td header="true">R</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>I</td>
        <td>S</td>
        <td>L</td>
        <td>A</td>
        <td>N</td>
        <td>D</td>
        <td>E</td>
        <td header="true">R</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>T</td>
        <td>O</td>
        <td>U</td>
        <td header="true">R</td>
        <td>I</td>
        <td>S</td>
        <td>T</td>
        <td>S</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>P</td>
        <td header="true">R</td>
        <td>O</td>
        <td>B</td>
        <td>L</td>
        <td>E</td>
        <td>M</td>
        <td>S</td>
      </line>
    </item>
    <item type="make-word" id="cw1" name="English3/l02/c/hueex2_l02_c08.htm"
      ident="t+r+e+a+d+b+wzrt+ca+twje+oid+n+tau+iag+t+r+i+e+s+a+w+g+fa+a+o+d+w+e+m+a+c+h+n+e+a+o+s+oe+t+a+k+t+m+v+o+k+lt+lndhol+a+nqs+a+t+qed+pbg+">
      <line>
        <td answer="true">t</td>
        <td answer="true">r</td>
        <td answer="true">e</td>
        <td answer="true">a</td>
        <td answer="true">d</td>
        <td answer="true">b</td>
        <td>w</td>
        <td>z</td>
        <td>r</td>
        <td answer="true">t</td>
      </line>
      <line>
        <td>c</td>
        <td answer="true">a</td>
        <td>t</td>
        <td>w</td>
        <td>j</td>
        <td answer="true">e</td>
        <td>o</td>
        <td>i</td>
        <td answer="true">d</td>
        <td answer="true">n</td>
      </line>
      <line>
        <td>t</td>
        <td>a</td>
        <td answer="true">u</td>
        <td>i</td>
        <td>a</td>
        <td answer="true">g</td>
        <td answer="true">t</td>
        <td answer="true">r</td>
        <td answer="true">i</td>
        <td answer="true">e</td>
      </line>
      <line>
        <td answer="true">s</td>
        <td answer="true">a</td>
        <td answer="true">w</td>
        <td answer="true">g</td>
        <td>f</td>
        <td answer="true">a</td>
        <td answer="true">a</td>
        <td answer="true">o</td>
        <td answer="true">d</td>
        <td answer="true">w</td>
      </line>
      <line>
        <td answer="true">e</td>
        <td answer="true">m</td>
        <td answer="true">a</td>
        <td answer="true">c</td>
        <td answer="true">h</td>
        <td answer="true">n</td>
        <td answer="true">e</td>
        <td answer="true">a</td>
        <td answer="true">o</td>
        <td answer="true">s</td>
      </line>
      <line>
        <td>o</td>
        <td answer="true">e</td>
        <td answer="true">t</td>
        <td answer="true">a</td>
        <td answer="true">k</td>
        <td answer="true">t</td>
        <td answer="true">m</td>
        <td answer="true">v</td>
        <td answer="true">o</td>
        <td answer="true">k</td>
      </line>
      <line>
        <td>l</td>
        <td answer="true">t</td>
        <td>l</td>
        <td>n</td>
        <td>d</td>
        <td>h</td>
        <td>o</td>
        <td answer="true">l</td>
        <td answer="true">a</td>
        <td>n</td>
      </line>
      <line>
        <td>q</td>
        <td answer="true">s</td>
        <td answer="true">a</td>
        <td answer="true">t</td>
        <td>q</td>
        <td>e</td>
        <td answer="true">d</td>
        <td>p</td>
        <td>b</td>
        <td answer="true">g</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English3/l21/a/hueex2_l21_a05.htm" col_header=""
      row_header="number"
      ident="m*enu------e*xpensive-d*ictionaryi*ll-------t*uesday---e*ggs------r*ound-----r*ains-----a*utumn----n*ovember--e*nglish---a*unt------n*umber----">
      <line>
        <td header="true">1.</td>
        <td hint="true">m</td>
        <td>e</td>
        <td>n</td>
        <td>u</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td hint="true">e</td>
        <td>x</td>
        <td>p</td>
        <td>e</td>
        <td>n</td>
        <td>s</td>
        <td>i</td>
        <td>v</td>
        <td>e</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td hint="true">d</td>
        <td>i</td>
        <td>c</td>
        <td>t</td>
        <td>i</td>
        <td>o</td>
        <td>n</td>
        <td>a</td>
        <td>r</td>
        <td>y</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td hint="true">i</td>
        <td>l</td>
        <td>l</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td hint="true">t</td>
        <td>u</td>
        <td>e</td>
        <td>s</td>
        <td>d</td>
        <td>a</td>
        <td>y</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td hint="true">e</td>
        <td>g</td>
        <td>g</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td hint="true">r</td>
        <td>o</td>
        <td>u</td>
        <td>n</td>
        <td>d</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td hint="true">r</td>
        <td>a</td>
        <td>i</td>
        <td>n</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td hint="true">a</td>
        <td>u</td>
        <td>t</td>
        <td>u</td>
        <td>m</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">10.</td>
        <td hint="true">n</td>
        <td>o</td>
        <td>v</td>
        <td>e</td>
        <td>m</td>
        <td>b</td>
        <td>e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">11.</td>
        <td hint="true">e</td>
        <td>n</td>
        <td>g</td>
        <td>l</td>
        <td>i</td>
        <td>s</td>
        <td>h</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">12.</td>
        <td hint="true">a</td>
        <td>u</td>
        <td>n</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">13.</td>
        <td hint="true">n</td>
        <td>u</td>
        <td>m</td>
        <td>b</td>
        <td>e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="make-word" id="cw1" name="English3/l04/a/hueex2_l04_a04.htm"
      ident="GM+A+L+YDF+C+R+C+JAO+R+A+YA+H+E+O+N+E+P+U+M+M+X+A+P+M+D+E+S+K+S+C+P+I+A+P+S+E+L+I+F+E+H+R+P+U+P+R+I+N+T+E+R+A+MT+D+R+A+O+B+Y+E+K+I+E+T+E+L+E+P+H+O+N+E+R+">
      <line>
        <td>G</td>
        <td answer="true">M</td>
        <td answer="true">A</td>
        <td answer="true">L</td>
        <td>Y</td>
        <td>D</td>
        <td answer="true">F</td>
        <td answer="true">C</td>
        <td answer="true">R</td>
        <td answer="true">C</td>
      </line>
      <line>
        <td>J</td>
        <td>A</td>
        <td answer="true">O</td>
        <td answer="true">R</td>
        <td answer="true">A</td>
        <td>Y</td>
        <td answer="true">A</td>
        <td answer="true">H</td>
        <td answer="true">E</td>
        <td answer="true">O</td>
      </line>
      <line>
        <td answer="true">N</td>
        <td answer="true">E</td>
        <td answer="true">P</td>
        <td answer="true">U</td>
        <td answer="true">M</td>
        <td answer="true">M</td>
        <td answer="true">X</td>
        <td answer="true">A</td>
        <td answer="true">P</td>
        <td answer="true">M</td>
      </line>
      <line>
        <td answer="true">D</td>
        <td answer="true">E</td>
        <td answer="true">S</td>
        <td answer="true">K</td>
        <td answer="true">S</td>
        <td answer="true">C</td>
        <td answer="true">P</td>
        <td answer="true">I</td>
        <td answer="true">A</td>
        <td answer="true">P</td>
      </line>
      <line>
        <td answer="true">S</td>
        <td answer="true">E</td>
        <td answer="true">L</td>
        <td answer="true">I</td>
        <td answer="true">F</td>
        <td answer="true">E</td>
        <td answer="true">H</td>
        <td answer="true">R</td>
        <td answer="true">P</td>
        <td answer="true">U</td>
      </line>
      <line>
        <td answer="true">P</td>
        <td answer="true">R</td>
        <td answer="true">I</td>
        <td answer="true">N</td>
        <td answer="true">T</td>
        <td answer="true">E</td>
        <td answer="true">R</td>
        <td answer="true">A</td>
        <td>M</td>
        <td answer="true">T</td>
      </line>
      <line>
        <td answer="true">D</td>
        <td answer="true">R</td>
        <td answer="true">A</td>
        <td answer="true">O</td>
        <td answer="true">B</td>
        <td answer="true">Y</td>
        <td answer="true">E</td>
        <td answer="true">K</td>
        <td answer="true">I</td>
        <td answer="true">E</td>
      </line>
      <line>
        <td answer="true">T</td>
        <td answer="true">E</td>
        <td answer="true">L</td>
        <td answer="true">E</td>
        <td answer="true">P</td>
        <td answer="true">H</td>
        <td answer="true">O</td>
        <td answer="true">N</td>
        <td answer="true">E</td>
        <td answer="true">R</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English3/l05/a/hueex2_l05_a01.htm" col_header=""
      row_header="number"
      ident="------j*et-----bo*at-----bu*s-----car*----train*--bicycle*----lorry*--">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">j</td>
        <td>e</td>
        <td>t</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>b</td>
        <td hint="true">o</td>
        <td>a</td>
        <td>t</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>b</td>
        <td hint="true">u</td>
        <td>s</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>a</td>
        <td hint="true">r</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>t</td>
        <td>r</td>
        <td>a</td>
        <td>i</td>
        <td hint="true">n</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>b</td>
        <td>i</td>
        <td>c</td>
        <td>y</td>
        <td>c</td>
        <td>l</td>
        <td hint="true">e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>l</td>
        <td>o</td>
        <td>r</td>
        <td>r</td>
        <td hint="true">y</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English3/l05/a/hueex2_l05_a10.htm" col_header=""
      row_header="number"
      ident="---stat*ion-------car*d----------ga*te----------v*isa----office*------------l*icencecontrol*-----------de*sk---------ar*ea----">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>s</td>
        <td>t</td>
        <td>a</td>
        <td hint="true">t</td>
        <td>i</td>
        <td>o</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>a</td>
        <td hint="true">r</td>
        <td>d</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>g</td>
        <td hint="true">a</td>
        <td>t</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">v</td>
        <td>i</td>
        <td>s</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>o</td>
        <td>f</td>
        <td>f</td>
        <td>i</td>
        <td>c</td>
        <td hint="true">e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">l</td>
        <td>i</td>
        <td>c</td>
        <td>e</td>
        <td>n</td>
        <td>c</td>
        <td>e</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>c</td>
        <td>o</td>
        <td>n</td>
        <td>t</td>
        <td>r</td>
        <td>o</td>
        <td hint="true">l</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>d</td>
        <td hint="true">e</td>
        <td>s</td>
        <td>k</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>a</td>
        <td hint="true">r</td>
        <td>e</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="make-word" id="cw1" name="English3/l08/b/hueex2_l08_b07.htm"
      ident="N+A+T+I+O+N+A+L+B+H+OREN+B+L+U+E+O+O+XHQD+F+C+O+A+S+T+F+O+L+I+A+G+E+F+T+E+IW+H+A+L+E+S+SO+L+R+A+YN+L+P+P+KN+C+O+C+XS+L+E+A+F+JO+O+A+S+U+P+E+R+B+S+L+M+D+PM+T+P+K+E+K+O+S+I+FM+R+I+YA+I+U+AA+CE+I+N+VR+E+R+T+O+U+R+P+G+WS+S+S+">
      <line>
        <td answer="true">N</td>
        <td answer="true">A</td>
        <td answer="true">T</td>
        <td answer="true">I</td>
        <td answer="true">O</td>
        <td answer="true">N</td>
        <td answer="true">A</td>
        <td answer="true">L</td>
        <td answer="true">B</td>
        <td answer="true">H</td>
      </line>
      <line>
        <td>O</td>
        <td>R</td>
        <td>E</td>
        <td answer="true">N</td>
        <td answer="true">B</td>
        <td answer="true">L</td>
        <td answer="true">U</td>
        <td answer="true">E</td>
        <td answer="true">O</td>
        <td answer="true">O</td>
      </line>
      <line>
        <td>X</td>
        <td>H</td>
        <td>Q</td>
        <td answer="true">D</td>
        <td answer="true">F</td>
        <td answer="true">C</td>
        <td answer="true">O</td>
        <td answer="true">A</td>
        <td answer="true">S</td>
        <td answer="true">T</td>
      </line>
      <line>
        <td answer="true">F</td>
        <td answer="true">O</td>
        <td answer="true">L</td>
        <td answer="true">I</td>
        <td answer="true">A</td>
        <td answer="true">G</td>
        <td answer="true">E</td>
        <td answer="true">F</td>
        <td answer="true">T</td>
        <td answer="true">E</td>
      </line>
      <line>
        <td>I</td>
        <td answer="true">W</td>
        <td answer="true">H</td>
        <td answer="true">A</td>
        <td answer="true">L</td>
        <td answer="true">E</td>
        <td answer="true">S</td>
        <td>S</td>
        <td answer="true">O</td>
        <td answer="true">L</td>
      </line>
      <line>
        <td answer="true">R</td>
        <td answer="true">A</td>
        <td>Y</td>
        <td answer="true">N</td>
        <td answer="true">L</td>
        <td answer="true">P</td>
        <td answer="true">P</td>
        <td>K</td>
        <td answer="true">N</td>
        <td answer="true">C</td>
      </line>
      <line>
        <td answer="true">O</td>
        <td answer="true">C</td>
        <td>X</td>
        <td answer="true">S</td>
        <td answer="true">L</td>
        <td answer="true">E</td>
        <td answer="true">A</td>
        <td answer="true">F</td>
        <td>J</td>
        <td answer="true">O</td>
      </line>
      <line>
        <td answer="true">O</td>
        <td answer="true">A</td>
        <td answer="true">S</td>
        <td answer="true">U</td>
        <td answer="true">P</td>
        <td answer="true">E</td>
        <td answer="true">R</td>
        <td answer="true">B</td>
        <td answer="true">S</td>
        <td answer="true">L</td>
      </line>
      <line>
        <td answer="true">M</td>
        <td answer="true">D</td>
        <td>P</td>
        <td answer="true">M</td>
        <td answer="true">T</td>
        <td answer="true">P</td>
        <td answer="true">K</td>
        <td answer="true">E</td>
        <td answer="true">K</td>
        <td answer="true">O</td>
      </line>
      <line>
        <td answer="true">S</td>
        <td answer="true">I</td>
        <td>F</td>
        <td answer="true">M</td>
        <td answer="true">R</td>
        <td answer="true">I</td>
        <td>Y</td>
        <td answer="true">A</td>
        <td answer="true">I</td>
        <td answer="true">U</td>
      </line>
      <line>
        <td>A</td>
        <td answer="true">A</td>
        <td>C</td>
        <td answer="true">E</td>
        <td answer="true">I</td>
        <td answer="true">N</td>
        <td>V</td>
        <td answer="true">R</td>
        <td answer="true">E</td>
        <td answer="true">R</td>
      </line>
      <line>
        <td answer="true">T</td>
        <td answer="true">O</td>
        <td answer="true">U</td>
        <td answer="true">R</td>
        <td answer="true">P</td>
        <td answer="true">G</td>
        <td>W</td>
        <td answer="true">S</td>
        <td answer="true">S</td>
        <td answer="true">S</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="English4/l01/a/hueex3_l01_a04.htm" col_header=""
      row_header="number" ident="trous*ers---bo*ots----c*oat-jack*et--T-s*hirt">
      <line>
        <td header="true">1.</td>
        <td>t</td>
        <td>r</td>
        <td>o</td>
        <td>u</td>
        <td hint="true">s</td>
        <td>e</td>
        <td>r</td>
        <td>s</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>b</td>
        <td hint="true">o</td>
        <td>o</td>
        <td>t</td>
        <td>s</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">c</td>
        <td>o</td>
        <td>a</td>
        <td>t</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>j</td>
        <td>a</td>
        <td>c</td>
        <td hint="true">k</td>
        <td>e</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>T</td>
        <td>-</td>
        <td hint="true">s</td>
        <td>h</td>
        <td>i</td>
        <td>r</td>
        <td>t</td>
      </line>
    </item>
    <item type="cross-word" id="cw02" name="English4/l01/a/hueex3_l01_a04.htm" col_header=""
      row_header="number" ident="----s*uit---sh*irt--blo*usejumpe*r-dres*s">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">s</td>
        <td>u</td>
        <td>i</td>
        <td>t</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>s</td>
        <td hint="true">h</td>
        <td>i</td>
        <td>r</td>
        <td>t</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>b</td>
        <td>l</td>
        <td hint="true">o</td>
        <td>u</td>
        <td>s</td>
        <td>e</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>j</td>
        <td>u</td>
        <td>m</td>
        <td>p</td>
        <td hint="true">e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>d</td>
        <td>r</td>
        <td>e</td>
        <td hint="true">s</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English4/l21/a/hueex3_l21_a02.htm" col_header=""
      row_header="number"
      ident="--------l*akeself-cate*ring------spi*nning--------s*hower-------qu*eue-----char*ity-------de*posit">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">l</td>
        <td>a</td>
        <td>k</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>s</td>
        <td>e</td>
        <td>l</td>
        <td>f</td>
        <td>-</td>
        <td>c</td>
        <td>a</td>
        <td>t</td>
        <td hint="true">e</td>
        <td>r</td>
        <td>i</td>
        <td>n</td>
        <td>g</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>s</td>
        <td>p</td>
        <td hint="true">i</td>
        <td>n</td>
        <td>n</td>
        <td>i</td>
        <td>n</td>
        <td>g</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">s</td>
        <td>h</td>
        <td>o</td>
        <td>w</td>
        <td>e</td>
        <td>r</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>q</td>
        <td hint="true">u</td>
        <td>e</td>
        <td>u</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>h</td>
        <td>a</td>
        <td hint="true">r</td>
        <td>i</td>
        <td>t</td>
        <td>y</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>d</td>
        <td hint="true">e</td>
        <td>p</td>
        <td>o</td>
        <td>s</td>
        <td>i</td>
        <td>t</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="English4/l04/c/hueex3_l04_c06.htm" col_header=""
      row_header="number"
      ident="-draw*er---bo*ss-over*timebreak*flexi*time--can*teen--pag*er-co-w*orkers---co*lleagues----r*eception----l*ift----d*epartment">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>d</td>
        <td>r</td>
        <td>a</td>
        <td hint="true">w</td>
        <td>e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>b</td>
        <td hint="true">o</td>
        <td>s</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>o</td>
        <td>v</td>
        <td>e</td>
        <td hint="true">r</td>
        <td>t</td>
        <td>i</td>
        <td>m</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>b</td>
        <td>r</td>
        <td>e</td>
        <td>a</td>
        <td hint="true">k</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>f</td>
        <td>l</td>
        <td>e</td>
        <td>x</td>
        <td hint="true">i</td>
        <td>t</td>
        <td>i</td>
        <td>m</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>a</td>
        <td hint="true">n</td>
        <td>t</td>
        <td>e</td>
        <td>e</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>p</td>
        <td>a</td>
        <td hint="true">g</td>
        <td>e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>c</td>
        <td>o</td>
        <td>-</td>
        <td hint="true">w</td>
        <td>o</td>
        <td>r</td>
        <td>k</td>
        <td>e</td>
        <td>r</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td hint="true">o</td>
        <td>l</td>
        <td>l</td>
        <td>e</td>
        <td>a</td>
        <td>g</td>
        <td>u</td>
        <td>e</td>
        <td>s</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">10.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">r</td>
        <td>e</td>
        <td>c</td>
        <td>e</td>
        <td>p</td>
        <td>t</td>
        <td>i</td>
        <td>o</td>
        <td>n</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">11.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">l</td>
        <td>i</td>
        <td>f</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">12.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">d</td>
        <td>e</td>
        <td>p</td>
        <td>a</td>
        <td>r</td>
        <td>t</td>
        <td>m</td>
        <td>e</td>
        <td>n</td>
        <td>t</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="English4/l22/a/hueex3_l22_a05.htm" col_header=""
      row_header="number"
      ident="---ca*ll--rep*eat----p*hone---fo*rwarde-mai*l-than*ks-best*----m*emo--fle*xitime---en*titlement----t*elecommuter">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td hint="true">a</td>
        <td>l</td>
        <td>l</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>r</td>
        <td>e</td>
        <td hint="true">p</td>
        <td>e</td>
        <td>a</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">p</td>
        <td>h</td>
        <td>o</td>
        <td>n</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>f</td>
        <td hint="true">o</td>
        <td>r</td>
        <td>w</td>
        <td>a</td>
        <td>r</td>
        <td>d</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>e</td>
        <td>-</td>
        <td>m</td>
        <td>a</td>
        <td hint="true">i</td>
        <td>l</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>t</td>
        <td>h</td>
        <td>a</td>
        <td hint="true">n</td>
        <td>k</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>b</td>
        <td>e</td>
        <td>s</td>
        <td hint="true">t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">m</td>
        <td>e</td>
        <td>m</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>-</td>
        <td>-</td>
        <td>f</td>
        <td>l</td>
        <td hint="true">e</td>
        <td>x</td>
        <td>i</td>
        <td>t</td>
        <td>i</td>
        <td>m</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">10.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>e</td>
        <td hint="true">n</td>
        <td>t</td>
        <td>i</td>
        <td>t</td>
        <td>l</td>
        <td>e</td>
        <td>m</td>
        <td>e</td>
        <td>n</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">11.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">t</td>
        <td>e</td>
        <td>l</td>
        <td>e</td>
        <td>c</td>
        <td>o</td>
        <td>m</td>
        <td>m</td>
        <td>u</td>
        <td>t</td>
        <td>e</td>
        <td>r</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English5/l10/b/hueex4_l10_b03.htm" col_header=""
      row_header="number"
      ident="comp*ositesreso*urces---l*oggers---l*itter--ru*bbish-bot*tleenvi*ronment-smo*g--un*safe">
      <line>
        <td header="true">1.</td>
        <td>c</td>
        <td>o</td>
        <td>m</td>
        <td hint="true">p</td>
        <td>o</td>
        <td>s</td>
        <td>i</td>
        <td>t</td>
        <td>e</td>
        <td>s</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>r</td>
        <td>e</td>
        <td>s</td>
        <td hint="true">o</td>
        <td>u</td>
        <td>r</td>
        <td>c</td>
        <td>e</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">l</td>
        <td>o</td>
        <td>g</td>
        <td>g</td>
        <td>e</td>
        <td>r</td>
        <td>s</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">l</td>
        <td>i</td>
        <td>t</td>
        <td>t</td>
        <td>e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>r</td>
        <td hint="true">u</td>
        <td>b</td>
        <td>b</td>
        <td>i</td>
        <td>s</td>
        <td>h</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>b</td>
        <td>o</td>
        <td hint="true">t</td>
        <td>t</td>
        <td>l</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>e</td>
        <td>n</td>
        <td>v</td>
        <td hint="true">i</td>
        <td>r</td>
        <td>o</td>
        <td>n</td>
        <td>m</td>
        <td>e</td>
        <td>n</td>
        <td>t</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>s</td>
        <td>m</td>
        <td hint="true">o</td>
        <td>g</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>-</td>
        <td>-</td>
        <td>u</td>
        <td hint="true">n</td>
        <td>s</td>
        <td>a</td>
        <td>f</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English1E/l21/a/hueex0_l21_a03.htm" col_header=""
      row_header="number"
      ident="-----B*EER----WI*NE----FR*IEND--PART*Y-----H*APPYSATURD*AY----CA*KE-----Y*OU">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">B</td>
        <td>E</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>W</td>
        <td hint="true">I</td>
        <td>N</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>F</td>
        <td hint="true">R</td>
        <td>I</td>
        <td>E</td>
        <td>N</td>
        <td>D</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>P</td>
        <td>A</td>
        <td>R</td>
        <td hint="true">T</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">H</td>
        <td>A</td>
        <td>P</td>
        <td>P</td>
        <td>Y</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>S</td>
        <td>A</td>
        <td>T</td>
        <td>U</td>
        <td>R</td>
        <td hint="true">D</td>
        <td>A</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td hint="true">A</td>
        <td>K</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">Y</td>
        <td>O</td>
        <td>U</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English1E/l04/c/hueex0_l04_c06.htm" col_header=""
      row_header="number"
      ident="---BRI*EFCASE---TIM*E-@PLANNER-----P*EN-LAPTO*P--ADDR*ESSBOOK--DICT*IONARY----WA*LLET---MON*EYCREDIT*-CARD">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>B</td>
        <td>R</td>
        <td hint="true">I</td>
        <td>E</td>
        <td>F</td>
        <td>C</td>
        <td>A</td>
        <td>S</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>T</td>
        <td>I</td>
        <td hint="true">M</td>
        <td>E</td>
        <td header="true">-</td>
        <td>P</td>
        <td>L</td>
        <td>A</td>
        <td>N</td>
        <td>N</td>
        <td>E</td>
        <td>R</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">P</td>
        <td>E</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>L</td>
        <td>A</td>
        <td>P</td>
        <td>T</td>
        <td hint="true">O</td>
        <td>P</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>A</td>
        <td>D</td>
        <td>D</td>
        <td hint="true">R</td>
        <td>E</td>
        <td>S</td>
        <td>S</td>
        <td>B</td>
        <td>O</td>
        <td>O</td>
        <td>K</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>D</td>
        <td>I</td>
        <td>C</td>
        <td hint="true">T</td>
        <td>I</td>
        <td>O</td>
        <td>N</td>
        <td>A</td>
        <td>R</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>W</td>
        <td hint="true">A</td>
        <td>L</td>
        <td>L</td>
        <td>E</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>M</td>
        <td>O</td>
        <td hint="true">N</td>
        <td>E</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>C</td>
        <td>R</td>
        <td>E</td>
        <td>D</td>
        <td>I</td>
        <td hint="true">T</td>
        <td>-</td>
        <td>C</td>
        <td>A</td>
        <td>R</td>
        <td>D</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English1E/l05/b/hueex0_l05_b08.htm" col_header=""
      row_header=""
      ident="----------@1.---------@2.--S-------@4.@3.CLOUDY-----R-O--N-------A-L--N-----@6./5.WINDY-Y-----H-N-------@7.SNOWY----------T">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">4.</td>
        <td header="true">3.</td>
        <td>C</td>
        <td>L</td>
        <td>O</td>
        <td>U</td>
        <td>D</td>
        <td>Y</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>A</td>
        <td>-</td>
        <td>L</td>
        <td>-</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6./5.</td>
        <td>W</td>
        <td>I</td>
        <td>N</td>
        <td>D</td>
        <td>Y</td>
        <td>-</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>H</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>S</td>
        <td>N</td>
        <td>O</td>
        <td>W</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English1E/l06/b/hueex0_l06_b05.htm" col_header=""
      row_header=""
      ident="---JU@NE--------D---S-A-----------@E-J-E-N-------O---C-U-@P-@U--M----@C---E-L-@T-A--AUGUS@T---MA@Y@FEBRUARY---O---B---M-Y--C----B---E---B----H-NO@VEMBE@R---E---------R-------R----------------">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>J</td>
        <td>U</td>
        <td header="true">N</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>D</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>A</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">E</td>
        <td>-</td>
        <td>J</td>
      </line>
      <line>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td>-</td>
        <td>U</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">P</td>
        <td>-</td>
        <td header="true">U</td>
        <td>-</td>
        <td>-</td>
        <td>M</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">C</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>L</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">T</td>
        <td>-</td>
        <td>A</td>
        <td>-</td>
        <td>-</td>
        <td>A</td>
        <td>U</td>
        <td>G</td>
        <td>U</td>
        <td>S</td>
        <td header="true">T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>M</td>
        <td>A</td>
        <td header="true">Y</td>
      </line>
      <line>
        <td header="true">F</td>
        <td>E</td>
        <td>B</td>
        <td>R</td>
        <td>U</td>
        <td>A</td>
        <td>R</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>B</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>M</td>
        <td>-</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>B</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>B</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>H</td>
        <td>-</td>
        <td>N</td>
        <td>O</td>
        <td header="true">V</td>
        <td>E</td>
        <td>M</td>
        <td>B</td>
        <td>E</td>
        <td header="true">R</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="make-word" id="mw1" name="English1E/l07/d/hueex0_l07_d04.htm"
      ident="DPUB+I+G+US+LOVEOBBQ+SITM+TAH+OGCETU+VMA+USA+TWT+E+R+R+I+B+L+E+PR+BIAHISCE+L+O+U+D+VNETHELOT+WNOP">
      <line>
        <td>D</td>
        <td>P</td>
        <td>U</td>
        <td answer="true">B</td>
        <td answer="true">I</td>
        <td answer="true">G</td>
        <td>U</td>
        <td answer="true">S</td>
        <td>L</td>
        <td>O</td>
        <td>V</td>
        <td>E</td>
      </line>
      <line>
        <td>O</td>
        <td>B</td>
        <td>B</td>
        <td answer="true">Q</td>
        <td>S</td>
        <td>I</td>
        <td>T</td>
        <td answer="true">M</td>
        <td>T</td>
        <td>A</td>
        <td answer="true">H</td>
        <td>O</td>
      </line>
      <line>
        <td>G</td>
        <td>C</td>
        <td>E</td>
        <td>T</td>
        <td answer="true">U</td>
        <td>V</td>
        <td>M</td>
        <td answer="true">A</td>
        <td>U</td>
        <td>S</td>
        <td answer="true">A</td>
        <td>T</td>
      </line>
      <line>
        <td>W</td>
        <td answer="true">T</td>
        <td answer="true">E</td>
        <td answer="true">R</td>
        <td answer="true">R</td>
        <td answer="true">I</td>
        <td answer="true">B</td>
        <td answer="true">L</td>
        <td answer="true">E</td>
        <td>P</td>
        <td answer="true">R</td>
        <td>B</td>
      </line>
      <line>
        <td>I</td>
        <td>A</td>
        <td>H</td>
        <td>I</td>
        <td>S</td>
        <td>C</td>
        <td answer="true">E</td>
        <td answer="true">L</td>
        <td answer="true">O</td>
        <td answer="true">U</td>
        <td answer="true">D</td>
        <td>V</td>
      </line>
      <line>
        <td>N</td>
        <td>E</td>
        <td>T</td>
        <td>H</td>
        <td>E</td>
        <td>L</td>
        <td>O</td>
        <td answer="true">T</td>
        <td>W</td>
        <td>N</td>
        <td>O</td>
        <td>P</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English1E/l23/a/hueex0_l23_a01.htm" col_header=""
      row_header=""
      ident="------@1.---@2.---------w---o-@5.----@3.get-@4.play------n-@7.-e-r------@6.train-e----@8.--@9.-f--------u--g@10.town----@11.please--@13.--------r@12.read-----@15.--d----o--@14.watched@16.see-----o--n----s--">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>w</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>o</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">3.</td>
        <td>g</td>
        <td>e</td>
        <td>t</td>
        <td>-</td>
        <td header="true">4.</td>
        <td>p</td>
        <td>l</td>
        <td>a</td>
        <td>y</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>n</td>
        <td>-</td>
        <td header="true">7.</td>
        <td>-</td>
        <td>e</td>
        <td>-</td>
        <td>r</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6.</td>
        <td>t</td>
        <td>r</td>
        <td>a</td>
        <td>i</td>
        <td>n</td>
        <td>-</td>
        <td>e</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td header="true">9.</td>
        <td>-</td>
        <td>f</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>u</td>
        <td>-</td>
        <td>-</td>
        <td>g</td>
        <td header="true">10.</td>
        <td>t</td>
        <td>o</td>
        <td>w</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">11.</td>
        <td>p</td>
        <td>l</td>
        <td>e</td>
        <td>a</td>
        <td>s</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td header="true">13.</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>r</td>
        <td header="true">12.</td>
        <td>r</td>
        <td>e</td>
        <td>a</td>
        <td>d</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">15.</td>
        <td>-</td>
        <td>-</td>
        <td>d</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">14.</td>
        <td>w</td>
        <td>a</td>
        <td>t</td>
        <td>c</td>
        <td>h</td>
        <td>e</td>
        <td>d</td>
        <td header="true">16.</td>
        <td>s</td>
        <td>e</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English1E/l11/c/hueex0_l11_c04.htm" col_header=""
      row_header=""
      ident="------@6.------W---@1.TEACHER----@2.PILOT@3.ASSISTANT---@4.CLERK---@5.FARMER">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>W</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td>T</td>
        <td>E</td>
        <td>A</td>
        <td>C</td>
        <td>H</td>
        <td>E</td>
        <td>R</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>P</td>
        <td>I</td>
        <td>L</td>
        <td>O</td>
        <td>T</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>A</td>
        <td>S</td>
        <td>S</td>
        <td>I</td>
        <td>S</td>
        <td>T</td>
        <td>A</td>
        <td>N</td>
        <td>T</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">4.</td>
        <td>C</td>
        <td>L</td>
        <td>E</td>
        <td>R</td>
        <td>K</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>F</td>
        <td>A</td>
        <td>R</td>
        <td>M</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="English2E/l06/a/hueex1_l06_a07.htm" col_header=""
      row_header=""
      ident="-1.@------2.@--1.@ROSE-8.@2.@MY-O--L@-S-E----O--E@-T-R----M3.@AMERICA------E@-A-E---6.@4.@ON-U5.@DO-6.@AUNT7.@SEE---T--S@-S-S--">
      <line>
        <td>-</td>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">1.</td>
        <td>R</td>
        <td>O</td>
        <td>S</td>
        <td>E</td>
        <td>-</td>
        <td header="true">8.</td>
        <td header="true">2.</td>
        <td>M</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
        <td header="true">L</td>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
        <td header="true">E</td>
        <td>-</td>
        <td>T</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>M</td>
        <td header="true">3.</td>
        <td>A</td>
        <td>M</td>
        <td>E</td>
        <td>R</td>
        <td>I</td>
        <td>C</td>
        <td>A</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">E</td>
        <td>-</td>
        <td>A</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">6.</td>
        <td header="true">4.</td>
        <td>O</td>
        <td>N</td>
        <td>-</td>
        <td>U</td>
        <td header="true">5.</td>
        <td>D</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>A</td>
        <td>U</td>
        <td>N</td>
        <td>T</td>
        <td header="true">7.</td>
        <td>S</td>
        <td>E</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td header="true">S</td>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="English2E/l06/c/hueex1_l06_c01.htm" col_header=""
      row_header=""
      ident="------1.@------M---3.@---------2.@-1.@AUGUST--4.@----2.@JULY---E-3.@FALL---U------P---P-----N---4.@OCTOBER-----E------E---I--------5.@SUMMER-L-------5.@--6.@-B-7.@---------S--D-E-J---------P6.@FEBRUARY-------R--C---N-------7.@WINTER--U---------N--M-8.@MARCH------G--B---R------------E---Y----9.@NOVEMBER--------">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>M</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>-</td>
        <td header="true">1.</td>
        <td>A</td>
        <td>U</td>
        <td>G</td>
        <td>U</td>
        <td>S</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>J</td>
        <td>U</td>
        <td>L</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td header="true">3.</td>
        <td>F</td>
        <td>A</td>
        <td>L</td>
        <td>L</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>U</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>P</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>P</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">4.</td>
        <td>O</td>
        <td>C</td>
        <td>T</td>
        <td>O</td>
        <td>B</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>I</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>S</td>
        <td>U</td>
        <td>M</td>
        <td>M</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
        <td>L</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6.</td>
        <td>-</td>
        <td>B</td>
        <td>-</td>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
        <td>D</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>J</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>P</td>
        <td header="true">6.</td>
        <td>F</td>
        <td>E</td>
        <td>B</td>
        <td>R</td>
        <td>U</td>
        <td>A</td>
        <td>R</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">7.</td>
        <td>W</td>
        <td>I</td>
        <td>N</td>
        <td>T</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>U</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>M</td>
        <td>-</td>
        <td header="true">8.</td>
        <td>M</td>
        <td>A</td>
        <td>R</td>
        <td>C</td>
        <td>H</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>G</td>
        <td>-</td>
        <td>-</td>
        <td>B</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>Y</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>N</td>
        <td>O</td>
        <td>V</td>
        <td>E</td>
        <td>M</td>
        <td>B</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="English2E/l07/b/hueex1_l07_b03.htm" col_header=""
      row_header="number"
      ident="---CO*STSCANN*ER----S*HELFSHOPP*ING--OPE*N-BARC*ODECASHI*ER-LOCA*L---CL*OSE--TRO*LLEY----F*RUITCORNF*LAKES--CHE*CKOUT--MAR*KET">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td hint="true">O</td>
        <td>S</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>S</td>
        <td>C</td>
        <td>A</td>
        <td>N</td>
        <td hint="true">N</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">S</td>
        <td>H</td>
        <td>E</td>
        <td>L</td>
        <td>F</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>S</td>
        <td>H</td>
        <td>O</td>
        <td>P</td>
        <td hint="true">P</td>
        <td>I</td>
        <td>N</td>
        <td>G</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>O</td>
        <td>P</td>
        <td hint="true">E</td>
        <td>N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>B</td>
        <td>A</td>
        <td>R</td>
        <td hint="true">C</td>
        <td>O</td>
        <td>D</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>C</td>
        <td>A</td>
        <td>S</td>
        <td>H</td>
        <td hint="true">I</td>
        <td>E</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>L</td>
        <td>O</td>
        <td>C</td>
        <td hint="true">A</td>
        <td>L</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td hint="true">L</td>
        <td>O</td>
        <td>S</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">10.</td>
        <td>-</td>
        <td>-</td>
        <td>T</td>
        <td>R</td>
        <td hint="true">O</td>
        <td>L</td>
        <td>L</td>
        <td>E</td>
        <td>Y</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">11.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">F</td>
        <td>R</td>
        <td>U</td>
        <td>I</td>
        <td>T</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">12.</td>
        <td>C</td>
        <td>O</td>
        <td>R</td>
        <td>N</td>
        <td hint="true">F</td>
        <td>L</td>
        <td>A</td>
        <td>K</td>
        <td>E</td>
        <td>S</td>
      </line>
      <line>
        <td header="true">13.</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td>H</td>
        <td hint="true">E</td>
        <td>C</td>
        <td>K</td>
        <td>O</td>
        <td>U</td>
        <td>T</td>
      </line>
      <line>
        <td header="true">14.</td>
        <td>-</td>
        <td>-</td>
        <td>M</td>
        <td>A</td>
        <td hint="true">R</td>
        <td>K</td>
        <td>E</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="make-word" id="mkw01" name="English2E/l23/a/hueex1_l23_a03.htm"
      ident="T+G+W+E+R+E+H+B+O+U+G+H+T+A+S+T+O+P+P+E+D+W+L+I+K+E+D+UE+JE+RLAP+N+GEF+FU+RT+W+A+S+T+OO">
      <line>
        <td answer="true">T</td>
        <td answer="true">G</td>
        <td answer="true">W</td>
        <td answer="true">E</td>
        <td answer="true">R</td>
        <td answer="true">E</td>
        <td answer="true">H</td>
      </line>
      <line>
        <td answer="true">B</td>
        <td answer="true">O</td>
        <td answer="true">U</td>
        <td answer="true">G</td>
        <td answer="true">H</td>
        <td answer="true">T</td>
        <td answer="true">A</td>
      </line>
      <line>
        <td answer="true">S</td>
        <td answer="true">T</td>
        <td answer="true">O</td>
        <td answer="true">P</td>
        <td answer="true">P</td>
        <td answer="true">E</td>
        <td answer="true">D</td>
      </line>
      <line>
        <td answer="true">W</td>
        <td answer="true">L</td>
        <td answer="true">I</td>
        <td answer="true">K</td>
        <td answer="true">E</td>
        <td answer="true">D</td>
        <td>U</td>
      </line>
      <line>
        <td answer="true">E</td>
        <td>J</td>
        <td answer="true">E</td>
        <td>R</td>
        <td>L</td>
        <td>A</td>
        <td answer="true">P</td>
      </line>
      <line>
        <td answer="true">N</td>
        <td>G</td>
        <td>E</td>
        <td answer="true">F</td>
        <td>F</td>
        <td answer="true">U</td>
        <td>R</td>
      </line>
      <line>
        <td answer="true">T</td>
        <td answer="true">W</td>
        <td answer="true">A</td>
        <td answer="true">S</td>
        <td answer="true">T</td>
        <td>O</td>
        <td>O</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="English2E/l11/c/hueex1_l11_c06.htm" col_header=""
      row_header="number" ident="WAITR@ESSTOMOR@R@OWCOMPUTER@ISLANDER@TOUR@ISTSPR@OBLEMS">
      <line>
        <td header="true">1.</td>
        <td>W</td>
        <td>A</td>
        <td>I</td>
        <td>T</td>
        <td header="true">R</td>
        <td>E</td>
        <td>S</td>
        <td>S</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>T</td>
        <td>O</td>
        <td>M</td>
        <td>O</td>
        <td header="true">R</td>
        <td header="true">R</td>
        <td>O</td>
        <td>W</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>C</td>
        <td>O</td>
        <td>M</td>
        <td>P</td>
        <td>U</td>
        <td>T</td>
        <td>E</td>
        <td header="true">R</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>I</td>
        <td>S</td>
        <td>L</td>
        <td>A</td>
        <td>N</td>
        <td>D</td>
        <td>E</td>
        <td header="true">R</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>T</td>
        <td>O</td>
        <td>U</td>
        <td header="true">R</td>
        <td>I</td>
        <td>S</td>
        <td>T</td>
        <td>S</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>P</td>
        <td header="true">R</td>
        <td>O</td>
        <td>B</td>
        <td>L</td>
        <td>E</td>
        <td>M</td>
        <td>S</td>
      </line>
    </item>
    <item type="make-word" id="cw1" name="English3E/l02/c/hueex2_l02_c08.htm"
      ident="t+r+e+a+d+b+wzrt+ca+twje+oid+n+tau+iag+t+r+i+e+s+a+w+g+fa+a+o+d+w+e+m+a+c+h+n+e+a+o+s+oe+t+a+k+t+m+v+o+k+lt+lndhol+a+nqs+a+t+qed+pbg+">
      <line>
        <td answer="true">t</td>
        <td answer="true">r</td>
        <td answer="true">e</td>
        <td answer="true">a</td>
        <td answer="true">d</td>
        <td answer="true">b</td>
        <td>w</td>
        <td>z</td>
        <td>r</td>
        <td answer="true">t</td>
      </line>
      <line>
        <td>c</td>
        <td answer="true">a</td>
        <td>t</td>
        <td>w</td>
        <td>j</td>
        <td answer="true">e</td>
        <td>o</td>
        <td>i</td>
        <td answer="true">d</td>
        <td answer="true">n</td>
      </line>
      <line>
        <td>t</td>
        <td>a</td>
        <td answer="true">u</td>
        <td>i</td>
        <td>a</td>
        <td answer="true">g</td>
        <td answer="true">t</td>
        <td answer="true">r</td>
        <td answer="true">i</td>
        <td answer="true">e</td>
      </line>
      <line>
        <td answer="true">s</td>
        <td answer="true">a</td>
        <td answer="true">w</td>
        <td answer="true">g</td>
        <td>f</td>
        <td answer="true">a</td>
        <td answer="true">a</td>
        <td answer="true">o</td>
        <td answer="true">d</td>
        <td answer="true">w</td>
      </line>
      <line>
        <td answer="true">e</td>
        <td answer="true">m</td>
        <td answer="true">a</td>
        <td answer="true">c</td>
        <td answer="true">h</td>
        <td answer="true">n</td>
        <td answer="true">e</td>
        <td answer="true">a</td>
        <td answer="true">o</td>
        <td answer="true">s</td>
      </line>
      <line>
        <td>o</td>
        <td answer="true">e</td>
        <td answer="true">t</td>
        <td answer="true">a</td>
        <td answer="true">k</td>
        <td answer="true">t</td>
        <td answer="true">m</td>
        <td answer="true">v</td>
        <td answer="true">o</td>
        <td answer="true">k</td>
      </line>
      <line>
        <td>l</td>
        <td answer="true">t</td>
        <td>l</td>
        <td>n</td>
        <td>d</td>
        <td>h</td>
        <td>o</td>
        <td answer="true">l</td>
        <td answer="true">a</td>
        <td>n</td>
      </line>
      <line>
        <td>q</td>
        <td answer="true">s</td>
        <td answer="true">a</td>
        <td answer="true">t</td>
        <td>q</td>
        <td>e</td>
        <td answer="true">d</td>
        <td>p</td>
        <td>b</td>
        <td answer="true">g</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English3E/l21/a/hueex2_l21_a05.htm" col_header=""
      row_header="number"
      ident="m*enu------e*xpensive-d*ictionaryi*ll-------t*uesday---e*ggs------r*ound-----r*ains-----a*utumn----n*ovember--e*nglish---a*unt------n*umber----">
      <line>
        <td header="true">1.</td>
        <td hint="true">m</td>
        <td>e</td>
        <td>n</td>
        <td>u</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td hint="true">e</td>
        <td>x</td>
        <td>p</td>
        <td>e</td>
        <td>n</td>
        <td>s</td>
        <td>i</td>
        <td>v</td>
        <td>e</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td hint="true">d</td>
        <td>i</td>
        <td>c</td>
        <td>t</td>
        <td>i</td>
        <td>o</td>
        <td>n</td>
        <td>a</td>
        <td>r</td>
        <td>y</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td hint="true">i</td>
        <td>l</td>
        <td>l</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td hint="true">t</td>
        <td>u</td>
        <td>e</td>
        <td>s</td>
        <td>d</td>
        <td>a</td>
        <td>y</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td hint="true">e</td>
        <td>g</td>
        <td>g</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td hint="true">r</td>
        <td>o</td>
        <td>u</td>
        <td>n</td>
        <td>d</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td hint="true">r</td>
        <td>a</td>
        <td>i</td>
        <td>n</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td hint="true">a</td>
        <td>u</td>
        <td>t</td>
        <td>u</td>
        <td>m</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">10.</td>
        <td hint="true">n</td>
        <td>o</td>
        <td>v</td>
        <td>e</td>
        <td>m</td>
        <td>b</td>
        <td>e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">11.</td>
        <td hint="true">e</td>
        <td>n</td>
        <td>g</td>
        <td>l</td>
        <td>i</td>
        <td>s</td>
        <td>h</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">12.</td>
        <td hint="true">a</td>
        <td>u</td>
        <td>n</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">13.</td>
        <td hint="true">n</td>
        <td>u</td>
        <td>m</td>
        <td>b</td>
        <td>e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="make-word" id="cw1" name="English3E/l04/a/hueex2_l04_a04.htm"
      ident="GM+A+L+YDF+C+R+C+JAO+R+A+YA+H+E+O+N+E+P+U+M+M+X+A+P+M+D+E+S+K+S+C+P+I+A+P+S+E+L+I+F+E+H+R+P+U+P+R+I+N+T+E+R+A+MT+D+R+A+O+B+Y+E+K+I+E+T+E+L+E+P+H+O+N+E+R+">
      <line>
        <td>G</td>
        <td answer="true">M</td>
        <td answer="true">A</td>
        <td answer="true">L</td>
        <td>Y</td>
        <td>D</td>
        <td answer="true">F</td>
        <td answer="true">C</td>
        <td answer="true">R</td>
        <td answer="true">C</td>
      </line>
      <line>
        <td>J</td>
        <td>A</td>
        <td answer="true">O</td>
        <td answer="true">R</td>
        <td answer="true">A</td>
        <td>Y</td>
        <td answer="true">A</td>
        <td answer="true">H</td>
        <td answer="true">E</td>
        <td answer="true">O</td>
      </line>
      <line>
        <td answer="true">N</td>
        <td answer="true">E</td>
        <td answer="true">P</td>
        <td answer="true">U</td>
        <td answer="true">M</td>
        <td answer="true">M</td>
        <td answer="true">X</td>
        <td answer="true">A</td>
        <td answer="true">P</td>
        <td answer="true">M</td>
      </line>
      <line>
        <td answer="true">D</td>
        <td answer="true">E</td>
        <td answer="true">S</td>
        <td answer="true">K</td>
        <td answer="true">S</td>
        <td answer="true">C</td>
        <td answer="true">P</td>
        <td answer="true">I</td>
        <td answer="true">A</td>
        <td answer="true">P</td>
      </line>
      <line>
        <td answer="true">S</td>
        <td answer="true">E</td>
        <td answer="true">L</td>
        <td answer="true">I</td>
        <td answer="true">F</td>
        <td answer="true">E</td>
        <td answer="true">H</td>
        <td answer="true">R</td>
        <td answer="true">P</td>
        <td answer="true">U</td>
      </line>
      <line>
        <td answer="true">P</td>
        <td answer="true">R</td>
        <td answer="true">I</td>
        <td answer="true">N</td>
        <td answer="true">T</td>
        <td answer="true">E</td>
        <td answer="true">R</td>
        <td answer="true">A</td>
        <td>M</td>
        <td answer="true">T</td>
      </line>
      <line>
        <td answer="true">D</td>
        <td answer="true">R</td>
        <td answer="true">A</td>
        <td answer="true">O</td>
        <td answer="true">B</td>
        <td answer="true">Y</td>
        <td answer="true">E</td>
        <td answer="true">K</td>
        <td answer="true">I</td>
        <td answer="true">E</td>
      </line>
      <line>
        <td answer="true">T</td>
        <td answer="true">E</td>
        <td answer="true">L</td>
        <td answer="true">E</td>
        <td answer="true">P</td>
        <td answer="true">H</td>
        <td answer="true">O</td>
        <td answer="true">N</td>
        <td answer="true">E</td>
        <td answer="true">R</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English3E/l05/a/hueex2_l05_a01.htm" col_header=""
      row_header="number"
      ident="------j*et-----bo*at-----bu*s-----car*----train*--bicycle*----lorry*--">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">j</td>
        <td>e</td>
        <td>t</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>b</td>
        <td hint="true">o</td>
        <td>a</td>
        <td>t</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>b</td>
        <td hint="true">u</td>
        <td>s</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>a</td>
        <td hint="true">r</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>t</td>
        <td>r</td>
        <td>a</td>
        <td>i</td>
        <td hint="true">n</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>b</td>
        <td>i</td>
        <td>c</td>
        <td>y</td>
        <td>c</td>
        <td>l</td>
        <td hint="true">e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>l</td>
        <td>o</td>
        <td>r</td>
        <td>r</td>
        <td hint="true">y</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English3E/l05/a/hueex2_l05_a10.htm" col_header=""
      row_header="number"
      ident="---stat*ion-------car*d----------ga*te----------v*isa----office*------------l*icencecontrol*-----------de*sk---------ar*ea----">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>s</td>
        <td>t</td>
        <td>a</td>
        <td hint="true">t</td>
        <td>i</td>
        <td>o</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>a</td>
        <td hint="true">r</td>
        <td>d</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>g</td>
        <td hint="true">a</td>
        <td>t</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">v</td>
        <td>i</td>
        <td>s</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>o</td>
        <td>f</td>
        <td>f</td>
        <td>i</td>
        <td>c</td>
        <td hint="true">e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">l</td>
        <td>i</td>
        <td>c</td>
        <td>e</td>
        <td>n</td>
        <td>c</td>
        <td>e</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>c</td>
        <td>o</td>
        <td>n</td>
        <td>t</td>
        <td>r</td>
        <td>o</td>
        <td hint="true">l</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>d</td>
        <td hint="true">e</td>
        <td>s</td>
        <td>k</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>a</td>
        <td hint="true">r</td>
        <td>e</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="make-word" id="cw1" name="English3E/l08/b/hueex2_l08_b07.htm"
      ident="N+A+T+I+O+N+A+L+B+H+OREN+B+L+U+E+O+O+XHQD+F+C+O+A+S+T+F+O+L+I+A+G+E+F+T+E+IW+H+A+L+E+S+SO+L+R+A+YN+L+P+P+KN+C+O+C+XS+L+E+A+F+JO+O+A+S+U+P+E+R+B+S+L+M+D+PM+T+P+K+E+K+O+S+I+FM+R+I+YA+I+U+AA+CE+I+N+VR+E+R+T+O+U+R+P+G+WS+S+S+">
      <line>
        <td answer="true">N</td>
        <td answer="true">A</td>
        <td answer="true">T</td>
        <td answer="true">I</td>
        <td answer="true">O</td>
        <td answer="true">N</td>
        <td answer="true">A</td>
        <td answer="true">L</td>
        <td answer="true">B</td>
        <td answer="true">H</td>
      </line>
      <line>
        <td>O</td>
        <td>R</td>
        <td>E</td>
        <td answer="true">N</td>
        <td answer="true">B</td>
        <td answer="true">L</td>
        <td answer="true">U</td>
        <td answer="true">E</td>
        <td answer="true">O</td>
        <td answer="true">O</td>
      </line>
      <line>
        <td>X</td>
        <td>H</td>
        <td>Q</td>
        <td answer="true">D</td>
        <td answer="true">F</td>
        <td answer="true">C</td>
        <td answer="true">O</td>
        <td answer="true">A</td>
        <td answer="true">S</td>
        <td answer="true">T</td>
      </line>
      <line>
        <td answer="true">F</td>
        <td answer="true">O</td>
        <td answer="true">L</td>
        <td answer="true">I</td>
        <td answer="true">A</td>
        <td answer="true">G</td>
        <td answer="true">E</td>
        <td answer="true">F</td>
        <td answer="true">T</td>
        <td answer="true">E</td>
      </line>
      <line>
        <td>I</td>
        <td answer="true">W</td>
        <td answer="true">H</td>
        <td answer="true">A</td>
        <td answer="true">L</td>
        <td answer="true">E</td>
        <td answer="true">S</td>
        <td>S</td>
        <td answer="true">O</td>
        <td answer="true">L</td>
      </line>
      <line>
        <td answer="true">R</td>
        <td answer="true">A</td>
        <td>Y</td>
        <td answer="true">N</td>
        <td answer="true">L</td>
        <td answer="true">P</td>
        <td answer="true">P</td>
        <td>K</td>
        <td answer="true">N</td>
        <td answer="true">C</td>
      </line>
      <line>
        <td answer="true">O</td>
        <td answer="true">C</td>
        <td>X</td>
        <td answer="true">S</td>
        <td answer="true">L</td>
        <td answer="true">E</td>
        <td answer="true">A</td>
        <td answer="true">F</td>
        <td>J</td>
        <td answer="true">O</td>
      </line>
      <line>
        <td answer="true">O</td>
        <td answer="true">A</td>
        <td answer="true">S</td>
        <td answer="true">U</td>
        <td answer="true">P</td>
        <td answer="true">E</td>
        <td answer="true">R</td>
        <td answer="true">B</td>
        <td answer="true">S</td>
        <td answer="true">L</td>
      </line>
      <line>
        <td answer="true">M</td>
        <td answer="true">D</td>
        <td>P</td>
        <td answer="true">M</td>
        <td answer="true">T</td>
        <td answer="true">P</td>
        <td answer="true">K</td>
        <td answer="true">E</td>
        <td answer="true">K</td>
        <td answer="true">O</td>
      </line>
      <line>
        <td answer="true">S</td>
        <td answer="true">I</td>
        <td>F</td>
        <td answer="true">M</td>
        <td answer="true">R</td>
        <td answer="true">I</td>
        <td>Y</td>
        <td answer="true">A</td>
        <td answer="true">I</td>
        <td answer="true">U</td>
      </line>
      <line>
        <td>A</td>
        <td answer="true">A</td>
        <td>C</td>
        <td answer="true">E</td>
        <td answer="true">I</td>
        <td answer="true">N</td>
        <td>V</td>
        <td answer="true">R</td>
        <td answer="true">E</td>
        <td answer="true">R</td>
      </line>
      <line>
        <td answer="true">T</td>
        <td answer="true">O</td>
        <td answer="true">U</td>
        <td answer="true">R</td>
        <td answer="true">P</td>
        <td answer="true">G</td>
        <td>W</td>
        <td answer="true">S</td>
        <td answer="true">S</td>
        <td answer="true">S</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="English4E/l01/a/hueex3_l01_a04.htm" col_header=""
      row_header="number" ident="trous*ers---bo*ots----c*oat-jack*et--T-s*hirt">
      <line>
        <td header="true">1.</td>
        <td>t</td>
        <td>r</td>
        <td>o</td>
        <td>u</td>
        <td hint="true">s</td>
        <td>e</td>
        <td>r</td>
        <td>s</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>b</td>
        <td hint="true">o</td>
        <td>o</td>
        <td>t</td>
        <td>s</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">c</td>
        <td>o</td>
        <td>a</td>
        <td>t</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>j</td>
        <td>a</td>
        <td>c</td>
        <td hint="true">k</td>
        <td>e</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>T</td>
        <td>-</td>
        <td hint="true">s</td>
        <td>h</td>
        <td>i</td>
        <td>r</td>
        <td>t</td>
      </line>
    </item>
    <item type="cross-word" id="cw02" name="English4E/l01/a/hueex3_l01_a04.htm" col_header=""
      row_header="number" ident="----s*uit---sh*irt--blo*usejumpe*r-dres*s">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">s</td>
        <td>u</td>
        <td>i</td>
        <td>t</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>s</td>
        <td hint="true">h</td>
        <td>i</td>
        <td>r</td>
        <td>t</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>b</td>
        <td>l</td>
        <td hint="true">o</td>
        <td>u</td>
        <td>s</td>
        <td>e</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>j</td>
        <td>u</td>
        <td>m</td>
        <td>p</td>
        <td hint="true">e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>d</td>
        <td>r</td>
        <td>e</td>
        <td hint="true">s</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English4E/l21/a/hueex3_l21_a02.htm" col_header=""
      row_header="number"
      ident="--------l*akeself-cate*ring------spi*nning--------s*hower-------qu*eue-----char*ity-------de*posit">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">l</td>
        <td>a</td>
        <td>k</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>s</td>
        <td>e</td>
        <td>l</td>
        <td>f</td>
        <td>-</td>
        <td>c</td>
        <td>a</td>
        <td>t</td>
        <td hint="true">e</td>
        <td>r</td>
        <td>i</td>
        <td>n</td>
        <td>g</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>s</td>
        <td>p</td>
        <td hint="true">i</td>
        <td>n</td>
        <td>n</td>
        <td>i</td>
        <td>n</td>
        <td>g</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">s</td>
        <td>h</td>
        <td>o</td>
        <td>w</td>
        <td>e</td>
        <td>r</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>q</td>
        <td hint="true">u</td>
        <td>e</td>
        <td>u</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>h</td>
        <td>a</td>
        <td hint="true">r</td>
        <td>i</td>
        <td>t</td>
        <td>y</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>d</td>
        <td hint="true">e</td>
        <td>p</td>
        <td>o</td>
        <td>s</td>
        <td>i</td>
        <td>t</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="English4E/l04/c/hueex3_l04_c06.htm" col_header=""
      row_header="number"
      ident="-draw*er---bo*ss-over*timebreak*flexi*time--can*teen--pag*er-co-w*orkers---co*lleagues----r*eception----l*ift----d*epartment">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>d</td>
        <td>r</td>
        <td>a</td>
        <td hint="true">w</td>
        <td>e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>b</td>
        <td hint="true">o</td>
        <td>s</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>o</td>
        <td>v</td>
        <td>e</td>
        <td hint="true">r</td>
        <td>t</td>
        <td>i</td>
        <td>m</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>b</td>
        <td>r</td>
        <td>e</td>
        <td>a</td>
        <td hint="true">k</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>f</td>
        <td>l</td>
        <td>e</td>
        <td>x</td>
        <td hint="true">i</td>
        <td>t</td>
        <td>i</td>
        <td>m</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>a</td>
        <td hint="true">n</td>
        <td>t</td>
        <td>e</td>
        <td>e</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>p</td>
        <td>a</td>
        <td hint="true">g</td>
        <td>e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>c</td>
        <td>o</td>
        <td>-</td>
        <td hint="true">w</td>
        <td>o</td>
        <td>r</td>
        <td>k</td>
        <td>e</td>
        <td>r</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td hint="true">o</td>
        <td>l</td>
        <td>l</td>
        <td>e</td>
        <td>a</td>
        <td>g</td>
        <td>u</td>
        <td>e</td>
        <td>s</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">10.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">r</td>
        <td>e</td>
        <td>c</td>
        <td>e</td>
        <td>p</td>
        <td>t</td>
        <td>i</td>
        <td>o</td>
        <td>n</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">11.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">l</td>
        <td>i</td>
        <td>f</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">12.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">d</td>
        <td>e</td>
        <td>p</td>
        <td>a</td>
        <td>r</td>
        <td>t</td>
        <td>m</td>
        <td>e</td>
        <td>n</td>
        <td>t</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="English4E/l22/a/hueex3_l22_a05.htm" col_header=""
      row_header="number"
      ident="---ca*ll--rep*eat----p*hone---fo*rwarde-mai*l-than*ks-best*----m*emo--fle*xitime---en*titlement----t*elecommuter">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td hint="true">a</td>
        <td>l</td>
        <td>l</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>r</td>
        <td>e</td>
        <td hint="true">p</td>
        <td>e</td>
        <td>a</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">p</td>
        <td>h</td>
        <td>o</td>
        <td>n</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>f</td>
        <td hint="true">o</td>
        <td>r</td>
        <td>w</td>
        <td>a</td>
        <td>r</td>
        <td>d</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>e</td>
        <td>-</td>
        <td>m</td>
        <td>a</td>
        <td hint="true">i</td>
        <td>l</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>t</td>
        <td>h</td>
        <td>a</td>
        <td hint="true">n</td>
        <td>k</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>b</td>
        <td>e</td>
        <td>s</td>
        <td hint="true">t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">m</td>
        <td>e</td>
        <td>m</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>-</td>
        <td>-</td>
        <td>f</td>
        <td>l</td>
        <td hint="true">e</td>
        <td>x</td>
        <td>i</td>
        <td>t</td>
        <td>i</td>
        <td>m</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">10.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>e</td>
        <td hint="true">n</td>
        <td>t</td>
        <td>i</td>
        <td>t</td>
        <td>l</td>
        <td>e</td>
        <td>m</td>
        <td>e</td>
        <td>n</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">11.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">t</td>
        <td>e</td>
        <td>l</td>
        <td>e</td>
        <td>c</td>
        <td>o</td>
        <td>m</td>
        <td>m</td>
        <td>u</td>
        <td>t</td>
        <td>e</td>
        <td>r</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="English5E/l10/b/hueex4_l10_b03.htm" col_header=""
      row_header="number"
      ident="comp*ositesreso*urces---l*oggers---l*itter--ru*bbish-bot*tleenvi*ronment-smo*g--un*safe">
      <line>
        <td header="true">1.</td>
        <td>c</td>
        <td>o</td>
        <td>m</td>
        <td hint="true">p</td>
        <td>o</td>
        <td>s</td>
        <td>i</td>
        <td>t</td>
        <td>e</td>
        <td>s</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>r</td>
        <td>e</td>
        <td>s</td>
        <td hint="true">o</td>
        <td>u</td>
        <td>r</td>
        <td>c</td>
        <td>e</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">l</td>
        <td>o</td>
        <td>g</td>
        <td>g</td>
        <td>e</td>
        <td>r</td>
        <td>s</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">l</td>
        <td>i</td>
        <td>t</td>
        <td>t</td>
        <td>e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>r</td>
        <td hint="true">u</td>
        <td>b</td>
        <td>b</td>
        <td>i</td>
        <td>s</td>
        <td>h</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>b</td>
        <td>o</td>
        <td hint="true">t</td>
        <td>t</td>
        <td>l</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>e</td>
        <td>n</td>
        <td>v</td>
        <td hint="true">i</td>
        <td>r</td>
        <td>o</td>
        <td>n</td>
        <td>m</td>
        <td>e</td>
        <td>n</td>
        <td>t</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>s</td>
        <td>m</td>
        <td hint="true">o</td>
        <td>g</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>-</td>
        <td>-</td>
        <td>u</td>
        <td hint="true">n</td>
        <td>s</td>
        <td>a</td>
        <td>f</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="make-word" id="mw01" name="French1/l01/a/hufex1_l01_a03.htm"
      ident="$nbsp;$nbsp;$nbsp;$nbsp;M+$nbsp;$nbsp;$nbsp;$nbsp;$nbsp;$nbsp;$nbsp;A+IZ$nbsp;$nbsp;$nbsp;P+A+R+I+S+$nbsp;$nbsp;DB+US+TRVB+O+R+D+E+A+U+X+$nbsp;CE+RI+GHA$nbsp;IS+NL+Y+O+N+$nbsp;$nbsp;T+PL+US$nbsp;$nbsp;$nbsp;$nbsp;$nbsp;E+$nbsp;$nbsp;$nbsp;">
      <line>
        <td>$nbsp;</td>
        <td>$nbsp;</td>
        <td>$nbsp;</td>
        <td>$nbsp;</td>
        <td answer="true">M</td>
        <td>$nbsp;</td>
        <td>$nbsp;</td>
        <td>$nbsp;</td>
      </line>
      <line>
        <td>$nbsp;</td>
        <td>$nbsp;</td>
        <td>$nbsp;</td>
        <td>$nbsp;</td>
        <td answer="true">A</td>
        <td>I</td>
        <td>Z</td>
        <td>$nbsp;</td>
      </line>
      <line>
        <td>$nbsp;</td>
        <td>$nbsp;</td>
        <td answer="true">P</td>
        <td answer="true">A</td>
        <td answer="true">R</td>
        <td answer="true">I</td>
        <td answer="true">S</td>
        <td>$nbsp;</td>
      </line>
      <line>
        <td>$nbsp;</td>
        <td>D</td>
        <td answer="true">B</td>
        <td>U</td>
        <td answer="true">S</td>
        <td>T</td>
        <td>R</td>
        <td>V</td>
      </line>
      <line>
        <td answer="true">B</td>
        <td answer="true">O</td>
        <td answer="true">R</td>
        <td answer="true">D</td>
        <td answer="true">E</td>
        <td answer="true">A</td>
        <td answer="true">U</td>
        <td answer="true">X</td>
      </line>
      <line>
        <td>$nbsp;</td>
        <td>C</td>
        <td answer="true">E</td>
        <td>R</td>
        <td answer="true">I</td>
        <td>G</td>
        <td>H</td>
        <td>A</td>
      </line>
      <line>
        <td>$nbsp;</td>
        <td>I</td>
        <td answer="true">S</td>
        <td>N</td>
        <td answer="true">L</td>
        <td answer="true">Y</td>
        <td answer="true">O</td>
        <td answer="true">N</td>
      </line>
      <line>
        <td>$nbsp;</td>
        <td>$nbsp;</td>
        <td answer="true">T</td>
        <td>P</td>
        <td answer="true">L</td>
        <td>U</td>
        <td>S</td>
        <td>$nbsp;</td>
      </line>
      <line>
        <td>$nbsp;</td>
        <td>$nbsp;</td>
        <td>$nbsp;</td>
        <td>$nbsp;</td>
        <td answer="true">E</td>
        <td>$nbsp;</td>
        <td>$nbsp;</td>
        <td>$nbsp;</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="French1/l03/c/hufex1_l03_c04.htm" col_header=""
      row_header="number"
      ident="------ho*tel-------p*lace----chat*------bi*se-------m*usique-----voi*leannivers*aire-------t*riste-----fle*ur">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>h</td>
        <td hint="true">o</td>
        <td>t</td>
        <td>e</td>
        <td>l</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">p</td>
        <td>l</td>
        <td>a</td>
        <td>c</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>h</td>
        <td>a</td>
        <td hint="true">t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>b</td>
        <td hint="true">i</td>
        <td>s</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">m</td>
        <td>u</td>
        <td>s</td>
        <td>i</td>
        <td>q</td>
        <td>u</td>
        <td>e</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>v</td>
        <td>o</td>
        <td hint="true">i</td>
        <td>l</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>a</td>
        <td>n</td>
        <td>n</td>
        <td>i</td>
        <td>v</td>
        <td>e</td>
        <td>r</td>
        <td hint="true">s</td>
        <td>a</td>
        <td>i</td>
        <td>r</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">t</td>
        <td>r</td>
        <td>i</td>
        <td>s</td>
        <td>t</td>
        <td>e</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>f</td>
        <td>l</td>
        <td hint="true">e</td>
        <td>u</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="make-word" id="cw1" name="French1/l04/b/hufex1_l04_b08.htm"
      ident="BA+L+L+E+R+D+OUA+R+A+IA+SÉ+C+T+V+R+I+ZT+OT+O+O+O+I+M+YT+YE+N+U+I+V+E+LE+OS+T+R+R+E+R+XN+IT+I+N+P+R+E+N+D+R+E+N+E+V+E+N+I+R+NR+U+R+E+T+R+E+E+AUE+SA+D+O+R+E+R+BR+I">
      <line>
        <td>B</td>
        <td answer="true">A</td>
        <td answer="true">L</td>
        <td answer="true">L</td>
        <td answer="true">E</td>
        <td answer="true">R</td>
        <td answer="true">D</td>
        <td>O</td>
        <td>U</td>
      </line>
      <line>
        <td answer="true">A</td>
        <td answer="true">R</td>
        <td answer="true">A</td>
        <td>I</td>
        <td answer="true">A</td>
        <td>S</td>
        <td answer="true">É</td>
        <td answer="true">C</td>
        <td answer="true">T</td>
      </line>
      <line>
        <td answer="true">V</td>
        <td answer="true">R</td>
        <td answer="true">I</td>
        <td>Z</td>
        <td answer="true">T</td>
        <td>O</td>
        <td answer="true">T</td>
        <td answer="true">O</td>
        <td answer="true">O</td>
      </line>
      <line>
        <td answer="true">O</td>
        <td answer="true">I</td>
        <td answer="true">M</td>
        <td>Y</td>
        <td answer="true">T</td>
        <td>Y</td>
        <td answer="true">E</td>
        <td answer="true">N</td>
        <td answer="true">U</td>
      </line>
      <line>
        <td answer="true">I</td>
        <td answer="true">V</td>
        <td answer="true">E</td>
        <td>L</td>
        <td answer="true">E</td>
        <td>O</td>
        <td answer="true">S</td>
        <td answer="true">T</td>
        <td answer="true">R</td>
      </line>
      <line>
        <td answer="true">R</td>
        <td answer="true">E</td>
        <td answer="true">R</td>
        <td>X</td>
        <td answer="true">N</td>
        <td>I</td>
        <td answer="true">T</td>
        <td answer="true">I</td>
        <td answer="true">N</td>
      </line>
      <line>
        <td answer="true">P</td>
        <td answer="true">R</td>
        <td answer="true">E</td>
        <td answer="true">N</td>
        <td answer="true">D</td>
        <td answer="true">R</td>
        <td answer="true">E</td>
        <td answer="true">N</td>
        <td answer="true">E</td>
      </line>
      <line>
        <td answer="true">V</td>
        <td answer="true">E</td>
        <td answer="true">N</td>
        <td answer="true">I</td>
        <td answer="true">R</td>
        <td>N</td>
        <td answer="true">R</td>
        <td answer="true">U</td>
        <td answer="true">R</td>
      </line>
      <line>
        <td answer="true">E</td>
        <td answer="true">T</td>
        <td answer="true">R</td>
        <td answer="true">E</td>
        <td answer="true">E</td>
        <td>A</td>
        <td>U</td>
        <td answer="true">E</td>
        <td>S</td>
      </line>
      <line>
        <td answer="true">A</td>
        <td answer="true">D</td>
        <td answer="true">O</td>
        <td answer="true">R</td>
        <td answer="true">E</td>
        <td answer="true">R</td>
        <td>B</td>
        <td answer="true">R</td>
        <td>I</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="French1/l05/a/hufex1_l05_a05.htm" col_header=""
      row_header="number"
      ident="------C*AFE-----CH*OCOLATCROISSA*NTS---FROM*AGE------P*OIVRONS-----LA*IT----BAG*UETTES-RAISIN*-----OE*UFS">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">C</td>
        <td>A</td>
        <td>F</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td hint="true">H</td>
        <td>O</td>
        <td>C</td>
        <td>O</td>
        <td>L</td>
        <td>A</td>
        <td>T</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>C</td>
        <td>R</td>
        <td>O</td>
        <td>I</td>
        <td>S</td>
        <td>S</td>
        <td hint="true">A</td>
        <td>N</td>
        <td>T</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>F</td>
        <td>R</td>
        <td>O</td>
        <td hint="true">M</td>
        <td>A</td>
        <td>G</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">P</td>
        <td>O</td>
        <td>I</td>
        <td>V</td>
        <td>R</td>
        <td>O</td>
        <td>N</td>
        <td>S</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>L</td>
        <td hint="true">A</td>
        <td>I</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>B</td>
        <td>A</td>
        <td hint="true">G</td>
        <td>U</td>
        <td>E</td>
        <td>T</td>
        <td>T</td>
        <td>E</td>
        <td>S</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>R</td>
        <td>A</td>
        <td>I</td>
        <td>S</td>
        <td>I</td>
        <td hint="true">N</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>O</td>
        <td hint="true">E</td>
        <td>U</td>
        <td>F</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="French1/l05/d/hufex1_l05_d04.htm" col_header=""
      row_header="number"
      ident="---dac*cordmontpa*rnasse---tom*ate--tele*cartecentim*e--timb*re----ve*ndre--phar*macie--cart*e">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>d</td>
        <td>a</td>
        <td hint="true">c</td>
        <td>c</td>
        <td>o</td>
        <td>r</td>
        <td>d</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>m</td>
        <td>o</td>
        <td>n</td>
        <td>t</td>
        <td>p</td>
        <td hint="true">a</td>
        <td>r</td>
        <td>n</td>
        <td>a</td>
        <td>s</td>
        <td>s</td>
        <td>e</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>t</td>
        <td>o</td>
        <td hint="true">m</td>
        <td>a</td>
        <td>t</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>t</td>
        <td>e</td>
        <td>l</td>
        <td hint="true">e</td>
        <td>c</td>
        <td>a</td>
        <td>r</td>
        <td>t</td>
        <td>e</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>c</td>
        <td>e</td>
        <td>n</td>
        <td>t</td>
        <td>i</td>
        <td hint="true">m</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>t</td>
        <td>i</td>
        <td>m</td>
        <td hint="true">b</td>
        <td>r</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>v</td>
        <td hint="true">e</td>
        <td>n</td>
        <td>d</td>
        <td>r</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>p</td>
        <td>h</td>
        <td>a</td>
        <td hint="true">r</td>
        <td>m</td>
        <td>a</td>
        <td>c</td>
        <td>i</td>
        <td>e</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>a</td>
        <td>r</td>
        <td hint="true">t</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw01" name="French1/l07/d/hufex1_l07_d02.htm" col_header=""
      row_header=""
      ident="-----------@8----@7------f-@6-@1exotique*-l--t-----@2sole*il-o@3b*ronzer-t--@9-@10-c--a------i--c-d@4avent*ure-@5voya*ges-t--g------a--m-s-i--e------l--p-e-o--r---------a-r*-n*------------g*-t--------------n--------------e">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">8</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">7</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>f</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">6</td>
        <td>-</td>
        <td header="true">1</td>
        <td>e</td>
        <td>x</td>
        <td>o</td>
        <td>t</td>
        <td>i</td>
        <td>q</td>
        <td>u</td>
        <td hint="true">e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>l</td>
        <td>-</td>
        <td>-</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2</td>
        <td>s</td>
        <td>o</td>
        <td>l</td>
        <td hint="true">e</td>
        <td>i</td>
        <td>l</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>o</td>
        <td header="true">3</td>
        <td hint="true">b</td>
        <td>r</td>
        <td>o</td>
        <td>n</td>
        <td>z</td>
        <td>e</td>
        <td>r</td>
        <td>-</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
        <td header="true">9</td>
        <td>-</td>
        <td header="true">10</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>c</td>
        <td>-</td>
        <td>-</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>i</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>-</td>
        <td>d</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4</td>
        <td>a</td>
        <td>v</td>
        <td>e</td>
        <td>n</td>
        <td hint="true">t</td>
        <td>u</td>
        <td>r</td>
        <td>e</td>
        <td>-</td>
        <td header="true">5</td>
        <td>v</td>
        <td>o</td>
        <td>y</td>
        <td hint="true">a</td>
        <td>g</td>
        <td>e</td>
        <td>s</td>
      </line>
      <line>
        <td>-</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
        <td>g</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>m</td>
        <td>-</td>
        <td>s</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>i</td>
        <td>-</td>
        <td>-</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>l</td>
        <td>-</td>
        <td>-</td>
        <td>p</td>
        <td>-</td>
        <td>e</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>a</td>
        <td>-</td>
        <td hint="true">r</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td hint="true">n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">g</td>
        <td>-</td>
        <td>t</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="French2/l02/b/hufex2_l02_b06.htm" col_header="no"
      row_header="number"
      ident="---dis*cret----be*au---fid*èle---gou*rmand-----c*ultivé---pat*ientdynami*que-harmo*nieux---ten*dre">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>d</td>
        <td>i</td>
        <td hint="true">s</td>
        <td>c</td>
        <td>r</td>
        <td>e</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>b</td>
        <td hint="true">e</td>
        <td>a</td>
        <td>u</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>f</td>
        <td>i</td>
        <td hint="true">d</td>
        <td>è</td>
        <td>l</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>g</td>
        <td>o</td>
        <td hint="true">u</td>
        <td>r</td>
        <td>m</td>
        <td>a</td>
        <td>n</td>
        <td>d</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">c</td>
        <td>u</td>
        <td>l</td>
        <td>t</td>
        <td>i</td>
        <td>v</td>
        <td>é</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>p</td>
        <td>a</td>
        <td hint="true">t</td>
        <td>i</td>
        <td>e</td>
        <td>n</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>d</td>
        <td>y</td>
        <td>n</td>
        <td>a</td>
        <td>m</td>
        <td hint="true">i</td>
        <td>q</td>
        <td>u</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>h</td>
        <td>a</td>
        <td>r</td>
        <td>m</td>
        <td hint="true">o</td>
        <td>n</td>
        <td>i</td>
        <td>e</td>
        <td>u</td>
        <td>x</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>t</td>
        <td>e</td>
        <td hint="true">n</td>
        <td>d</td>
        <td>r</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="mw1" name="French2/l05/c/hufex2_l05_c06.htm" col_header=""
      row_header=""
      ident="@am*écanicien@bclo*wn@cgu*ide@dcommis*saire@eantiq*uaire@fcu*isinier@ggondolie*r@hguit*ariste@iga*rçon@jécri*vain@kcadr*e@lcoiffe*ur@mgaragis*te">
      <line>
        <td header="true">a</td>
        <td hint="true">m</td>
        <td>é</td>
        <td>c</td>
        <td>a</td>
        <td>n</td>
        <td>i</td>
        <td>c</td>
        <td>i</td>
        <td>e</td>
        <td>n</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">b</td>
        <td>c</td>
        <td>l</td>
        <td hint="true">o</td>
        <td>w</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">c</td>
        <td>g</td>
        <td hint="true">u</td>
        <td>i</td>
        <td>d</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">d</td>
        <td>c</td>
        <td>o</td>
        <td>m</td>
        <td>m</td>
        <td>i</td>
        <td hint="true">s</td>
        <td>s</td>
        <td>a</td>
        <td>i</td>
        <td>r</td>
        <td>e</td>
      </line>
      <line>
        <td header="true">e</td>
        <td>a</td>
        <td>n</td>
        <td>t</td>
        <td>i</td>
        <td hint="true">q</td>
        <td>u</td>
        <td>a</td>
        <td>i</td>
        <td>r</td>
        <td>e</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">f</td>
        <td>c</td>
        <td hint="true">u</td>
        <td>i</td>
        <td>s</td>
        <td>i</td>
        <td>n</td>
        <td>i</td>
        <td>e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">g</td>
        <td>g</td>
        <td>o</td>
        <td>n</td>
        <td>d</td>
        <td>o</td>
        <td>l</td>
        <td>i</td>
        <td hint="true">e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">h</td>
        <td>g</td>
        <td>u</td>
        <td>i</td>
        <td hint="true">t</td>
        <td>a</td>
        <td>r</td>
        <td>i</td>
        <td>s</td>
        <td>t</td>
        <td>e</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">i</td>
        <td>g</td>
        <td hint="true">a</td>
        <td>r</td>
        <td>ç</td>
        <td>o</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">j</td>
        <td>é</td>
        <td>c</td>
        <td>r</td>
        <td hint="true">i</td>
        <td>v</td>
        <td>a</td>
        <td>i</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">k</td>
        <td>c</td>
        <td>a</td>
        <td>d</td>
        <td hint="true">r</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">l</td>
        <td>c</td>
        <td>o</td>
        <td>i</td>
        <td>f</td>
        <td>f</td>
        <td hint="true">e</td>
        <td>u</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">m</td>
        <td>g</td>
        <td>a</td>
        <td>r</td>
        <td>a</td>
        <td>g</td>
        <td>i</td>
        <td hint="true">s</td>
        <td>t</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="French2/l08/c/hufex2_l08_c02.htm" col_header="no"
      row_header="letter"
      ident="--monta*gne-signer*--cogna*c-champi*gnons-enseig*nanteAuvergn*e--gagné*---agne*au">
      <line>
        <td header="true">a</td>
        <td>-</td>
        <td>-</td>
        <td>m</td>
        <td>o</td>
        <td>n</td>
        <td>t</td>
        <td hint="true">a</td>
        <td>g</td>
        <td>n</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">b</td>
        <td>-</td>
        <td>s</td>
        <td>i</td>
        <td>g</td>
        <td>n</td>
        <td>e</td>
        <td hint="true">r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">c</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>o</td>
        <td>g</td>
        <td>n</td>
        <td hint="true">a</td>
        <td>c</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">d</td>
        <td>-</td>
        <td>c</td>
        <td>h</td>
        <td>a</td>
        <td>m</td>
        <td>p</td>
        <td hint="true">i</td>
        <td>g</td>
        <td>n</td>
        <td>o</td>
        <td>n</td>
        <td>s</td>
      </line>
      <line>
        <td header="true">e</td>
        <td>-</td>
        <td>e</td>
        <td>n</td>
        <td>s</td>
        <td>e</td>
        <td>i</td>
        <td hint="true">g</td>
        <td>n</td>
        <td>a</td>
        <td>n</td>
        <td>t</td>
        <td>e</td>
      </line>
      <line>
        <td header="true">f</td>
        <td>A</td>
        <td>u</td>
        <td>v</td>
        <td>e</td>
        <td>r</td>
        <td>g</td>
        <td hint="true">n</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">g</td>
        <td>-</td>
        <td>-</td>
        <td>g</td>
        <td>a</td>
        <td>g</td>
        <td>n</td>
        <td hint="true">é</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">h</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>a</td>
        <td>g</td>
        <td>n</td>
        <td hint="true">e</td>
        <td>a</td>
        <td>u</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="French3/l02/a/hufex3_l02_a02.htm" col_header="no"
      row_header="letter"
      ident="-------f*emme------va*cances-------m*ariagegénérati*ons--réveil*lon---probl*èmes-ancêtre*">
      <line>
        <td header="true">a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">f</td>
        <td>e</td>
        <td>m</td>
        <td>m</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">b</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>v</td>
        <td hint="true">a</td>
        <td>c</td>
        <td>a</td>
        <td>n</td>
        <td>c</td>
        <td>e</td>
        <td>s</td>
      </line>
      <line>
        <td header="true">c</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">m</td>
        <td>a</td>
        <td>r</td>
        <td>i</td>
        <td>a</td>
        <td>g</td>
        <td>e</td>
      </line>
      <line>
        <td header="true">d</td>
        <td>g</td>
        <td>é</td>
        <td>n</td>
        <td>é</td>
        <td>r</td>
        <td>a</td>
        <td>t</td>
        <td hint="true">i</td>
        <td>o</td>
        <td>n</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">e</td>
        <td>-</td>
        <td>-</td>
        <td>r</td>
        <td>é</td>
        <td>v</td>
        <td>e</td>
        <td>i</td>
        <td hint="true">l</td>
        <td>l</td>
        <td>o</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">f</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>p</td>
        <td>r</td>
        <td>o</td>
        <td>b</td>
        <td hint="true">l</td>
        <td>è</td>
        <td>m</td>
        <td>e</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">g</td>
        <td>-</td>
        <td>a</td>
        <td>n</td>
        <td>c</td>
        <td>ê</td>
        <td>t</td>
        <td>r</td>
        <td hint="true">e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="italian1/l01/b/huiex1_l01_b03.htm" col_header=""
      row_header=""
      ident="---@1ge*lato---------@2ch*iave-----------@3*bicicletta@4chita*rra----------@5cu*ore-------">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1</td>
        <td>g</td>
        <td>e</td>
        <td hint="true">l</td>
        <td>a</td>
        <td>t</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2</td>
        <td>c</td>
        <td>h</td>
        <td hint="true">i</td>
        <td>a</td>
        <td>v</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">3</td>
        <td hint="true">b</td>
        <td>i</td>
        <td>c</td>
        <td>i</td>
        <td>c</td>
        <td>l</td>
        <td>e</td>
        <td>t</td>
        <td>t</td>
        <td>a</td>
      </line>
      <line>
        <td header="true">4</td>
        <td>c</td>
        <td>h</td>
        <td>i</td>
        <td>t</td>
        <td>a</td>
        <td hint="true">r</td>
        <td>r</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">5</td>
        <td>c</td>
        <td>u</td>
        <td hint="true">o</td>
        <td>r</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="italian1/l02/c/huiex1_l02_c05.htm" col_header=""
      row_header=""
      ident="-----------@2.--@3.---@4.-@5.-@6.--@1.novanta@7.@4.dodici----e--r-q-i-i-i-----n--e-u-c@8.cento-@10.@9.trenta-i-i-q--@10.sei--t-r-a-o-u---e-n--a-a@11.settantotto--q-n-s-t-n---t-v--u-t-e@12.ottantasei-a-a-t---a---n----t-n@13.tre-d@14.ottantotto-e---u---a----r-v---@15.sette-@16.zero-e">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">4.</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>-</td>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td>n</td>
        <td>o</td>
        <td>v</td>
        <td>a</td>
        <td>n</td>
        <td>t</td>
        <td>a</td>
        <td header="true">7.</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>d</td>
        <td>o</td>
        <td>d</td>
        <td>i</td>
        <td>c</td>
        <td>i</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>r</td>
        <td>-</td>
        <td>q</td>
      </line>
      <line>
        <td>-</td>
        <td>i</td>
        <td>-</td>
        <td>i</td>
        <td>-</td>
        <td>i</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>e</td>
        <td>-</td>
        <td>u</td>
      </line>
      <line>
        <td>-</td>
        <td>c</td>
        <td header="true">8.</td>
        <td>c</td>
        <td>e</td>
        <td>n</td>
        <td>t</td>
        <td>o</td>
        <td>-</td>
        <td header="true">10.</td>
        <td header="true">9.</td>
        <td>t</td>
        <td>r</td>
        <td>e</td>
        <td>n</td>
        <td>t</td>
        <td>a</td>
      </line>
      <line>
        <td>-</td>
        <td>i</td>
        <td>-</td>
        <td>i</td>
        <td>-</td>
        <td>q</td>
        <td>-</td>
        <td>-</td>
        <td header="true">10.</td>
        <td>s</td>
        <td>e</td>
        <td>i</td>
        <td>-</td>
        <td>-</td>
        <td>t</td>
        <td>-</td>
        <td>r</td>
      </line>
      <line>
        <td>-</td>
        <td>a</td>
        <td>-</td>
        <td>o</td>
        <td>-</td>
        <td>u</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>e</td>
        <td>-</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>a</td>
        <td>-</td>
        <td>a</td>
      </line>
      <line>
        <td header="true">11.</td>
        <td>s</td>
        <td>e</td>
        <td>t</td>
        <td>t</td>
        <td>a</td>
        <td>n</td>
        <td>t</td>
        <td>o</td>
        <td>t</td>
        <td>t</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>q</td>
        <td>-</td>
        <td>n</td>
      </line>
      <line>
        <td>-</td>
        <td>s</td>
        <td>-</td>
        <td>t</td>
        <td>-</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>t</td>
        <td>-</td>
        <td>v</td>
        <td>-</td>
        <td>-</td>
        <td>u</td>
        <td>-</td>
        <td>t</td>
      </line>
      <line>
        <td>-</td>
        <td>e</td>
        <td header="true">12.</td>
        <td>o</td>
        <td>t</td>
        <td>t</td>
        <td>a</td>
        <td>n</td>
        <td>t</td>
        <td>a</td>
        <td>s</td>
        <td>e</td>
        <td>i</td>
        <td>-</td>
        <td>a</td>
        <td>-</td>
        <td>a</td>
      </line>
      <line>
        <td>-</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>t</td>
        <td>-</td>
        <td>n</td>
      </line>
      <line>
        <td header="true">13.</td>
        <td>t</td>
        <td>r</td>
        <td>e</td>
        <td>-</td>
        <td>d</td>
        <td header="true">14.</td>
        <td>o</td>
        <td>t</td>
        <td>t</td>
        <td>a</td>
        <td>n</td>
        <td>t</td>
        <td>o</td>
        <td>t</td>
        <td>t</td>
        <td>o</td>
      </line>
      <line>
        <td>-</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>u</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>r</td>
        <td>-</td>
        <td>v</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">15.</td>
        <td>s</td>
        <td>e</td>
        <td>t</td>
        <td>t</td>
        <td>e</td>
        <td>-</td>
        <td header="true">16.</td>
        <td>z</td>
        <td>e</td>
        <td>r</td>
        <td>o</td>
        <td>-</td>
        <td>e</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="italian1/l02/c/huiex1_l02_c06.htm" col_header=""
      row_header=""
      ident="---@1.-@2.-@3.----------r-s@3.ospedale---i-c-f----------s@4.ufficio------t-o-i----@5.-----o-l-c----b--@6.farmacia---a-----a---n----n-----n-@7.fabbrica----t--------a--@8.negozio------">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>-</td>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>r</td>
        <td>-</td>
        <td>s</td>
        <td header="true">3.</td>
        <td>o</td>
        <td>s</td>
        <td>p</td>
        <td>e</td>
        <td>d</td>
        <td>a</td>
        <td>l</td>
        <td>e</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>i</td>
        <td>-</td>
        <td>c</td>
        <td>-</td>
        <td>f</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>s</td>
        <td header="true">4.</td>
        <td>u</td>
        <td>f</td>
        <td>f</td>
        <td>i</td>
        <td>c</td>
        <td>i</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>t</td>
        <td>-</td>
        <td>o</td>
        <td>-</td>
        <td>i</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>o</td>
        <td>-</td>
        <td>l</td>
        <td>-</td>
        <td>c</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>b</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>f</td>
        <td>a</td>
        <td>r</td>
        <td>m</td>
        <td>a</td>
        <td>c</td>
        <td>i</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>n</td>
        <td>-</td>
        <td header="true">7.</td>
        <td>f</td>
        <td>a</td>
        <td>b</td>
        <td>b</td>
        <td>r</td>
        <td>i</td>
        <td>c</td>
        <td>a</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">8.</td>
        <td>n</td>
        <td>e</td>
        <td>g</td>
        <td>o</td>
        <td>z</td>
        <td>i</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="italian1/l03/a/huiex1_l03_a06.htm" col_header=""
      row_header=""
      ident="--@1.spu*mante-----@2.c*affè----@3.ara*nciata@4.cappu*ccino-----@5.b*irra------@6.l*atte--">
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td>s</td>
        <td>p</td>
        <td>u</td>
        <td hint="true">m</td>
        <td>a</td>
        <td>n</td>
        <td>t</td>
        <td>e</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2.</td>
        <td>c</td>
        <td hint="true">a</td>
        <td>f</td>
        <td>f</td>
        <td>è</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">3.</td>
        <td>a</td>
        <td>r</td>
        <td>a</td>
        <td hint="true">n</td>
        <td>c</td>
        <td>i</td>
        <td>a</td>
        <td>t</td>
        <td>a</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>c</td>
        <td>a</td>
        <td>p</td>
        <td>p</td>
        <td>u</td>
        <td hint="true">c</td>
        <td>c</td>
        <td>i</td>
        <td>n</td>
        <td>o</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>b</td>
        <td hint="true">i</td>
        <td>r</td>
        <td>r</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6.</td>
        <td>l</td>
        <td hint="true">a</td>
        <td>t</td>
        <td>t</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw" name="italian1/l05/a/huiex1_l05_a08.htm" col_header=""
      row_header=""
      ident="-@1.singo*la------@2.matrim*oniale-----@3.par*cheggio-@4.settim*ana-------@5.dome*nica----------@6.*doppia-----@7.col*azione--">
      <line>
        <td>-</td>
        <td header="true">1.</td>
        <td>s</td>
        <td>i</td>
        <td>n</td>
        <td>g</td>
        <td>o</td>
        <td hint="true">l</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>m</td>
        <td>a</td>
        <td>t</td>
        <td>r</td>
        <td>i</td>
        <td>m</td>
        <td hint="true">o</td>
        <td>n</td>
        <td>i</td>
        <td>a</td>
        <td>l</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">3.</td>
        <td>p</td>
        <td>a</td>
        <td>r</td>
        <td hint="true">c</td>
        <td>h</td>
        <td>e</td>
        <td>g</td>
        <td>g</td>
        <td>i</td>
        <td>o</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>s</td>
        <td>e</td>
        <td>t</td>
        <td>t</td>
        <td>i</td>
        <td>m</td>
        <td hint="true">a</td>
        <td>n</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>d</td>
        <td>o</td>
        <td>m</td>
        <td>e</td>
        <td hint="true">n</td>
        <td>i</td>
        <td>c</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6.</td>
        <td hint="true">d</td>
        <td>o</td>
        <td>p</td>
        <td>p</td>
        <td>i</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">7.</td>
        <td>c</td>
        <td>o</td>
        <td>l</td>
        <td hint="true">a</td>
        <td>z</td>
        <td>i</td>
        <td>o</td>
        <td>n</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="italian1/l08/a/huiex1_l08_a07.htm" col_header=""
      row_header=""
      ident="-@1aran*cia-----@2asp*aragi----@3ca*rciofo@4manda*rini----@5pep*erone-@6frago*la-------@7ag*lio-----@8pom*odoro-">
      <line>
        <td>-</td>
        <td header="true">1</td>
        <td>a</td>
        <td>r</td>
        <td>a</td>
        <td>n</td>
        <td hint="true">c</td>
        <td>i</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">2</td>
        <td>a</td>
        <td>s</td>
        <td>p</td>
        <td hint="true">a</td>
        <td>r</td>
        <td>a</td>
        <td>g</td>
        <td>i</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">3</td>
        <td>c</td>
        <td>a</td>
        <td hint="true">r</td>
        <td>c</td>
        <td>i</td>
        <td>o</td>
        <td>f</td>
        <td>o</td>
      </line>
      <line>
        <td header="true">4</td>
        <td>m</td>
        <td>a</td>
        <td>n</td>
        <td>d</td>
        <td>a</td>
        <td hint="true">r</td>
        <td>i</td>
        <td>n</td>
        <td>i</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">5</td>
        <td>p</td>
        <td>e</td>
        <td>p</td>
        <td hint="true">e</td>
        <td>r</td>
        <td>o</td>
        <td>n</td>
        <td>e</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6</td>
        <td>f</td>
        <td>r</td>
        <td>a</td>
        <td>g</td>
        <td>o</td>
        <td hint="true">l</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">7</td>
        <td>a</td>
        <td>g</td>
        <td hint="true">l</td>
        <td>i</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td header="true">8</td>
        <td>p</td>
        <td>o</td>
        <td>m</td>
        <td hint="true">o</td>
        <td>d</td>
        <td>o</td>
        <td>r</td>
        <td>o</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="italian2/l01/a/huiex2_l01_a07.htm" col_header=""
      row_header="number" ident="---cog*natonipote*-----cugin*a----suoce*ro--suocer*a------zio*----">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>o</td>
        <td hint="true">g</td>
        <td>n</td>
        <td>a</td>
        <td>t</td>
        <td>o</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>n</td>
        <td>i</td>
        <td>p</td>
        <td>o</td>
        <td>t</td>
        <td hint="true">e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>c</td>
        <td>u</td>
        <td>g</td>
        <td>i</td>
        <td hint="true">n</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>s</td>
        <td>u</td>
        <td>o</td>
        <td>c</td>
        <td hint="true">e</td>
        <td>r</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>s</td>
        <td>u</td>
        <td>o</td>
        <td>c</td>
        <td>e</td>
        <td hint="true">r</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>z</td>
        <td>i</td>
        <td hint="true">o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="italian2/l02/a/huiex2_l02_a02.htm" col_header=""
      row_header="number"
      ident="tartaru*ga----------c*ane---------c*avallo-----se*rpente------l*eone--farfall*a-------gatto*------">
      <line>
        <td header="true">1.</td>
        <td>t</td>
        <td>a</td>
        <td>r</td>
        <td>t</td>
        <td>a</td>
        <td>r</td>
        <td hint="true">u</td>
        <td>g</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">c</td>
        <td>a</td>
        <td>n</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">c</td>
        <td>a</td>
        <td>v</td>
        <td>a</td>
        <td>l</td>
        <td>l</td>
        <td>o</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>s</td>
        <td hint="true">e</td>
        <td>r</td>
        <td>p</td>
        <td>e</td>
        <td>n</td>
        <td>t</td>
        <td>e</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">l</td>
        <td>e</td>
        <td>o</td>
        <td>n</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>f</td>
        <td>a</td>
        <td>r</td>
        <td>f</td>
        <td>a</td>
        <td>l</td>
        <td hint="true">l</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>g</td>
        <td>a</td>
        <td>t</td>
        <td>t</td>
        <td hint="true">o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="italian2/l08/b/huiex2_l08_b05.htm" col_header="number"
      row_header="number"
      ident="--sara*i-co*m*prerà-s*a*r*emo---a------av*r*a*i----nf----arriverai-ga-----a-v--a*bit*era*nno-n-e---v*ivrò-----n-r---*sarò------o-e-fara*i---------*m--v*orra*i------comprer*ai-----------e---------------t----------*l*av*orerai------">
      <line>
        <td>-</td>
        <td header="true">1.</td>
        <td header="true">2.</td>
        <td header="true">3.</td>
        <td header="true">4.</td>
        <td header="true">5.</td>
        <td header="true">6.</td>
        <td header="true">7.</td>
        <td header="true">8.</td>
        <td header="true">9.</td>
        <td header="true">10.</td>
        <td header="true">11.</td>
        <td header="true">12.</td>
        <td header="true">13.</td>
        <td header="true">14.</td>
        <td header="true">15.</td>
        <td header="true">16.</td>
      </line>
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>s</td>
        <td>a</td>
        <td>r</td>
        <td>a</td>
        <td hint="true">i</td>
        <td>-</td>
        <td>c</td>
        <td>o</td>
        <td hint="true">m</td>
        <td hint="true">p</td>
        <td>r</td>
        <td>e</td>
        <td>r</td>
        <td>à</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>s</td>
        <td hint="true">a</td>
        <td hint="true">r</td>
        <td hint="true">e</td>
        <td>m</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>a</td>
        <td>v</td>
        <td hint="true">r</td>
        <td hint="true">a</td>
        <td hint="true">i</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>n</td>
        <td>f</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>a</td>
        <td>r</td>
        <td>r</td>
        <td>i</td>
        <td>v</td>
        <td>e</td>
        <td>r</td>
        <td>a</td>
        <td>i</td>
        <td>-</td>
        <td>g</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>a</td>
        <td>-</td>
        <td>v</td>
        <td>-</td>
        <td>-</td>
        <td>a</td>
        <td hint="true">b</td>
        <td>i</td>
        <td>t</td>
        <td hint="true">e</td>
        <td>r</td>
        <td>a</td>
        <td hint="true">n</td>
        <td>n</td>
        <td>o</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>n</td>
        <td>-</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>v</td>
        <td hint="true">i</td>
        <td>v</td>
        <td>r</td>
        <td>ò</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>n</td>
        <td>-</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">s</td>
        <td>a</td>
        <td>r</td>
        <td>ò</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>o</td>
        <td>-</td>
        <td>e</td>
        <td>-</td>
        <td>f</td>
        <td>a</td>
        <td>r</td>
        <td>a</td>
        <td hint="true">i</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">m</td>
        <td>-</td>
        <td>-</td>
        <td>v</td>
        <td hint="true">o</td>
        <td>r</td>
        <td>r</td>
        <td>a</td>
        <td hint="true">i</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">10.</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>o</td>
        <td>m</td>
        <td>p</td>
        <td>r</td>
        <td>e</td>
        <td>r</td>
        <td hint="true">a</td>
        <td>i</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">11.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">12.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>t</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">13.</td>
        <td>-</td>
        <td hint="true">l</td>
        <td hint="true">a</td>
        <td>v</td>
        <td hint="true">o</td>
        <td>r</td>
        <td>e</td>
        <td>r</td>
        <td>a</td>
        <td>i</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="italian2/l09/a/huiex2_l09_a06.htm" col_header=""
      row_header=""
      ident="s*ot*tile---bu*io------mod*erno---si*lenziosoca*ro------gran*de----fredd*o*----s*tretto---p*ieno-----br*utto----bia*nco----">
      <line>
        <td hint="true">s</td>
        <td>o</td>
        <td hint="true">t</td>
        <td>t</td>
        <td>i</td>
        <td>l</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>b</td>
        <td hint="true">u</td>
        <td>i</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>m</td>
        <td>o</td>
        <td hint="true">d</td>
        <td>e</td>
        <td>r</td>
        <td>n</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>s</td>
        <td hint="true">i</td>
        <td>l</td>
        <td>e</td>
        <td>n</td>
        <td>z</td>
        <td>i</td>
        <td>o</td>
        <td>s</td>
        <td>o</td>
      </line>
      <line>
        <td>c</td>
        <td hint="true">a</td>
        <td>r</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>g</td>
        <td>r</td>
        <td>a</td>
        <td hint="true">n</td>
        <td>d</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>f</td>
        <td>r</td>
        <td>e</td>
        <td>d</td>
        <td hint="true">d</td>
        <td hint="true">o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td hint="true">s</td>
        <td>t</td>
        <td>r</td>
        <td>e</td>
        <td>t</td>
        <td>t</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td hint="true">p</td>
        <td>i</td>
        <td>e</td>
        <td>n</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>b</td>
        <td hint="true">r</td>
        <td>u</td>
        <td>t</td>
        <td>t</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>b</td>
        <td>i</td>
        <td hint="true">a</td>
        <td>n</td>
        <td>c</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="italian2/l09/c/huiex2_l09_c07.htm" col_header=""
      row_header="number"
      ident="-------l*avandino----arma*dio----------div*ano-----poltrona*---------------t*avolo-------libr*eria------comodi*no------------sc*rivania------spe*cchio---">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">l</td>
        <td>a</td>
        <td>v</td>
        <td>a</td>
        <td>n</td>
        <td>d</td>
        <td>i</td>
        <td>n</td>
        <td>o</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>a</td>
        <td>r</td>
        <td>m</td>
        <td hint="true">a</td>
        <td>d</td>
        <td>i</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>d</td>
        <td>i</td>
        <td hint="true">v</td>
        <td>a</td>
        <td>n</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>p</td>
        <td>o</td>
        <td>l</td>
        <td>t</td>
        <td>r</td>
        <td>o</td>
        <td>n</td>
        <td hint="true">a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">t</td>
        <td>a</td>
        <td>v</td>
        <td>o</td>
        <td>l</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>l</td>
        <td>i</td>
        <td>b</td>
        <td hint="true">r</td>
        <td>e</td>
        <td>r</td>
        <td>i</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>o</td>
        <td>m</td>
        <td>o</td>
        <td>d</td>
        <td hint="true">i</td>
        <td>n</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>s</td>
        <td hint="true">c</td>
        <td>r</td>
        <td>i</td>
        <td>v</td>
        <td>a</td>
        <td>n</td>
        <td>i</td>
        <td>a</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>s</td>
        <td>p</td>
        <td hint="true">e</td>
        <td>c</td>
        <td>c</td>
        <td>h</td>
        <td>i</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="italian3/l03/a/huiex3_l03_a05.htm" col_header="no"
      row_header="number"
      ident="-----za*ino---orec*chini------q*uaderno--compu*tertovagli*a----ras*oio------t*avolo--occhi*ali">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>z</td>
        <td hint="true">a</td>
        <td>i</td>
        <td>n</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>o</td>
        <td>r</td>
        <td>e</td>
        <td hint="true">c</td>
        <td>c</td>
        <td>h</td>
        <td>i</td>
        <td>n</td>
        <td>i</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">q</td>
        <td>u</td>
        <td>a</td>
        <td>d</td>
        <td>e</td>
        <td>r</td>
        <td>n</td>
        <td>o</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>o</td>
        <td>m</td>
        <td>p</td>
        <td hint="true">u</td>
        <td>t</td>
        <td>e</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>t</td>
        <td>o</td>
        <td>v</td>
        <td>a</td>
        <td>g</td>
        <td>l</td>
        <td hint="true">i</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>r</td>
        <td>a</td>
        <td hint="true">s</td>
        <td>o</td>
        <td>i</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">t</td>
        <td>a</td>
        <td>v</td>
        <td>o</td>
        <td>l</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>o</td>
        <td>c</td>
        <td>c</td>
        <td>h</td>
        <td hint="true">i</td>
        <td>a</td>
        <td>l</td>
        <td>i</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="italian3/l05/a/huiex3_l05_a06.htm" col_header="no"
      row_header="number"
      ident="protagonis*ta--scrittri*ce-poliziesc*o---recensi*one---giornal*e-------gui*da------roma*nzo">
      <line>
        <td header="true">1.</td>
        <td>p</td>
        <td>r</td>
        <td>o</td>
        <td>t</td>
        <td>a</td>
        <td>g</td>
        <td>o</td>
        <td>n</td>
        <td>i</td>
        <td hint="true">s</td>
        <td>t</td>
        <td>a</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>s</td>
        <td>c</td>
        <td>r</td>
        <td>i</td>
        <td>t</td>
        <td>t</td>
        <td>r</td>
        <td hint="true">i</td>
        <td>c</td>
        <td>e</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>p</td>
        <td>o</td>
        <td>l</td>
        <td>i</td>
        <td>z</td>
        <td>i</td>
        <td>e</td>
        <td>s</td>
        <td hint="true">c</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>r</td>
        <td>e</td>
        <td>c</td>
        <td>e</td>
        <td>n</td>
        <td>s</td>
        <td hint="true">i</td>
        <td>o</td>
        <td>n</td>
        <td>e</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>g</td>
        <td>i</td>
        <td>o</td>
        <td>r</td>
        <td>n</td>
        <td>a</td>
        <td hint="true">l</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>g</td>
        <td>u</td>
        <td hint="true">i</td>
        <td>d</td>
        <td>a</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>r</td>
        <td>o</td>
        <td>m</td>
        <td hint="true">a</td>
        <td>n</td>
        <td>z</td>
        <td>o</td>
      </line>
    </item>
    <item type="make-word" id="cw1" name="italian3/l07/a/huiex3_l07_a05.htm"
      ident="P+A+NAP+Á+C+A+TR+N+ALE+V+A+EL+E+L+E+CON+T+I+C+NC+H+I+ITUE+P+OR+E+IS+E+P+EI+O+PASN+O+QV+UE+ACOM+B+NR+E+CHIS+S+VI+L+UV+E+OS+T+R+IO+">
      <line>
        <td answer="true">P</td>
        <td answer="true">A</td>
        <td>N</td>
        <td>A</td>
        <td answer="true">P</td>
        <td answer="true">Á</td>
        <td answer="true">C</td>
        <td answer="true">A</td>
        <td>T</td>
        <td answer="true">R</td>
      </line>
      <line>
        <td answer="true">N</td>
        <td>A</td>
        <td>L</td>
        <td answer="true">E</td>
        <td answer="true">V</td>
        <td answer="true">A</td>
        <td>E</td>
        <td answer="true">L</td>
        <td answer="true">E</td>
        <td answer="true">L</td>
      </line>
      <line>
        <td answer="true">E</td>
        <td>C</td>
        <td>O</td>
        <td answer="true">N</td>
        <td answer="true">T</td>
        <td answer="true">I</td>
        <td answer="true">C</td>
        <td>N</td>
        <td answer="true">C</td>
        <td answer="true">H</td>
      </line>
      <line>
        <td answer="true">I</td>
        <td>I</td>
        <td>T</td>
        <td>U</td>
        <td answer="true">E</td>
        <td answer="true">P</td>
        <td>O</td>
        <td answer="true">R</td>
        <td answer="true">E</td>
        <td>I</td>
      </line>
      <line>
        <td answer="true">S</td>
        <td answer="true">E</td>
        <td answer="true">P</td>
        <td>E</td>
        <td answer="true">I</td>
        <td answer="true">O</td>
        <td>P</td>
        <td>A</td>
        <td>S</td>
        <td answer="true">N</td>
      </line>
      <line>
        <td answer="true">O</td>
        <td>Q</td>
        <td answer="true">V</td>
        <td>U</td>
        <td answer="true">E</td>
        <td>A</td>
        <td>C</td>
        <td>O</td>
        <td answer="true">M</td>
        <td answer="true">B</td>
      </line>
      <line>
        <td>N</td>
        <td answer="true">R</td>
        <td answer="true">E</td>
        <td>C</td>
        <td>H</td>
        <td>I</td>
        <td answer="true">S</td>
        <td answer="true">S</td>
        <td>V</td>
        <td answer="true">I</td>
      </line>
      <line>
        <td answer="true">L</td>
        <td>U</td>
        <td answer="true">V</td>
        <td answer="true">E</td>
        <td>O</td>
        <td answer="true">S</td>
        <td answer="true">T</td>
        <td answer="true">R</td>
        <td>I</td>
        <td answer="true">O</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="italian3/l08/a/huiex3_l08_a03.htm" col_header="no"
      row_header="number"
      ident="alluvionisiccitàslavineinquinamentodeforestazioneeffettoserraelettrosmogbucodellozonorifiuti">
      <line>
        <td header="true">1.</td>
        <td>a</td>
        <td>l</td>
        <td>l</td>
        <td>u</td>
        <td>v</td>
        <td>i</td>
        <td>o</td>
        <td>n</td>
        <td>i</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>s</td>
        <td>i</td>
        <td>c</td>
        <td>c</td>
        <td>i</td>
        <td>t</td>
        <td>à</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>s</td>
        <td>l</td>
        <td>a</td>
        <td>v</td>
        <td>i</td>
        <td>n</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>i</td>
        <td>n</td>
        <td>q</td>
        <td>u</td>
        <td>i</td>
        <td>n</td>
        <td>a</td>
        <td>m</td>
        <td>e</td>
        <td>n</td>
        <td>t</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>d</td>
        <td>e</td>
        <td>f</td>
        <td>o</td>
        <td>r</td>
        <td>e</td>
        <td>s</td>
        <td>t</td>
        <td>a</td>
        <td>z</td>
        <td>i</td>
        <td>o</td>
        <td>n</td>
        <td>e</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>e</td>
        <td>f</td>
        <td>f</td>
        <td>e</td>
        <td>t</td>
        <td>t</td>
        <td>o</td>
        <td>s</td>
        <td>e</td>
        <td>r</td>
        <td>r</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>e</td>
        <td>l</td>
        <td>e</td>
        <td>t</td>
        <td>t</td>
        <td>r</td>
        <td>o</td>
        <td>s</td>
        <td>m</td>
        <td>o</td>
        <td>g</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>b</td>
        <td>u</td>
        <td>c</td>
        <td>o</td>
        <td>d</td>
        <td>e</td>
        <td>l</td>
        <td>l</td>
        <td>o</td>
        <td>z</td>
        <td>o</td>
        <td>n</td>
        <td>o</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>r</td>
        <td>i</td>
        <td>f</td>
        <td>i</td>
        <td>u</td>
        <td>t</td>
        <td>i</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="italian3/l08/c/huiex3_l08_c06.htm" col_header="no"
      row_header="number"
      ident="-------s*catolame---preco*tti---barat*tolo-aliment*ari----asso*ciazione----brev*etti---consu*matore--agrico*lturasurgelat*icarrello*">
      <line>
        <td header="true">1.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">s</td>
        <td>c</td>
        <td>a</td>
        <td>t</td>
        <td>o</td>
        <td>l</td>
        <td>a</td>
        <td>m</td>
        <td>e</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>p</td>
        <td>r</td>
        <td>e</td>
        <td>c</td>
        <td hint="true">o</td>
        <td>t</td>
        <td>t</td>
        <td>i</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>b</td>
        <td>a</td>
        <td>r</td>
        <td>a</td>
        <td hint="true">t</td>
        <td>t</td>
        <td>o</td>
        <td>l</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>a</td>
        <td>l</td>
        <td>i</td>
        <td>m</td>
        <td>e</td>
        <td>n</td>
        <td hint="true">t</td>
        <td>a</td>
        <td>r</td>
        <td>i</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>a</td>
        <td>s</td>
        <td>s</td>
        <td hint="true">o</td>
        <td>c</td>
        <td>i</td>
        <td>a</td>
        <td>z</td>
        <td>i</td>
        <td>o</td>
        <td>n</td>
        <td>e</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>b</td>
        <td>r</td>
        <td>e</td>
        <td hint="true">v</td>
        <td>e</td>
        <td>t</td>
        <td>t</td>
        <td>i</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>o</td>
        <td>n</td>
        <td>s</td>
        <td hint="true">u</td>
        <td>m</td>
        <td>a</td>
        <td>t</td>
        <td>o</td>
        <td>r</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>a</td>
        <td>g</td>
        <td>r</td>
        <td>i</td>
        <td>c</td>
        <td hint="true">o</td>
        <td>l</td>
        <td>t</td>
        <td>u</td>
        <td>r</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>s</td>
        <td>u</td>
        <td>r</td>
        <td>g</td>
        <td>e</td>
        <td>l</td>
        <td>a</td>
        <td hint="true">t</td>
        <td>i</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">10.</td>
        <td>c</td>
        <td>a</td>
        <td>r</td>
        <td>r</td>
        <td>e</td>
        <td>l</td>
        <td>l</td>
        <td hint="true">o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw2" name="italian3/l09/a/huiex3_l09_a08.htm" col_header="no"
      row_header="no"
      ident="-----@1------@2------m-@4----s@5@3t*or*to-o*-@6--ce-@7-f-t-m-m--og-b-g-o-b@8av*a*ro@9u*so-r-r-n*--ri-g-@10difet*to-es-i---n-l-e*--tm-e---o-l-n--to------@11ones*to*----------r---------@12super*bo*-">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>m</td>
        <td>-</td>
        <td header="true">4</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>s</td>
        <td header="true">5</td>
      </line>
      <line>
        <td header="true">3</td>
        <td hint="true">t</td>
        <td>o</td>
        <td hint="true">r</td>
        <td>t</td>
        <td>o</td>
        <td>-</td>
        <td hint="true">o</td>
        <td>-</td>
        <td header="true">6</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>e</td>
      </line>
      <line>
        <td>-</td>
        <td header="true">7</td>
        <td>-</td>
        <td>f</td>
        <td>-</td>
        <td>t</td>
        <td>-</td>
        <td>m</td>
        <td>-</td>
        <td>m</td>
        <td>-</td>
        <td>-</td>
        <td>o</td>
        <td>g</td>
      </line>
      <line>
        <td>-</td>
        <td>b</td>
        <td>-</td>
        <td>g</td>
        <td>-</td>
        <td>o</td>
        <td>-</td>
        <td>b</td>
        <td header="true">8</td>
        <td>a</td>
        <td hint="true">v</td>
        <td hint="true">a</td>
        <td>r</td>
        <td>o</td>
      </line>
      <line>
        <td header="true">9</td>
        <td hint="true">u</td>
        <td>s</td>
        <td>o</td>
        <td>-</td>
        <td>r</td>
        <td>-</td>
        <td>r</td>
        <td>-</td>
        <td hint="true">n</td>
        <td>-</td>
        <td>-</td>
        <td>r</td>
        <td>i</td>
      </line>
      <line>
        <td>-</td>
        <td>g</td>
        <td>-</td>
        <td header="true">10</td>
        <td>d</td>
        <td>i</td>
        <td>f</td>
        <td>e</td>
        <td hint="true">t</td>
        <td>t</td>
        <td>o</td>
        <td>-</td>
        <td>e</td>
        <td>s</td>
      </line>
      <line>
        <td>-</td>
        <td>i</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>n</td>
        <td>-</td>
        <td>l</td>
        <td>-</td>
        <td hint="true">e</td>
        <td>-</td>
        <td>-</td>
        <td>t</td>
        <td>m</td>
      </line>
      <line>
        <td>-</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>o</td>
        <td>-</td>
        <td>l</td>
        <td>-</td>
        <td>n</td>
        <td>-</td>
        <td>-</td>
        <td>t</td>
        <td>o</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">11</td>
        <td>o</td>
        <td>n</td>
        <td>e</td>
        <td hint="true">s</td>
        <td>t</td>
        <td hint="true">o</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">12</td>
        <td>s</td>
        <td>u</td>
        <td>p</td>
        <td>e</td>
        <td hint="true">r</td>
        <td>b</td>
        <td hint="true">o</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="Spanish1/l02/a/humex1_l02_a05.htm" col_header=""
      row_header=""
      ident="------@1cam*arero-----@2enfe*rmera@3programad*or----@4arqui*tecto------@5sec*retario------@6pro*fesora">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1</td>
        <td>c</td>
        <td>a</td>
        <td hint="true">m</td>
        <td>a</td>
        <td>r</td>
        <td>e</td>
        <td>r</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">2</td>
        <td>e</td>
        <td>n</td>
        <td>f</td>
        <td hint="true">e</td>
        <td>r</td>
        <td>m</td>
        <td>e</td>
        <td>r</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3</td>
        <td>p</td>
        <td>r</td>
        <td>o</td>
        <td>g</td>
        <td>r</td>
        <td>a</td>
        <td>m</td>
        <td>a</td>
        <td hint="true">d</td>
        <td>o</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">4</td>
        <td>a</td>
        <td>r</td>
        <td>q</td>
        <td>u</td>
        <td hint="true">i</td>
        <td>t</td>
        <td>e</td>
        <td>c</td>
        <td>t</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">5</td>
        <td>s</td>
        <td>e</td>
        <td hint="true">c</td>
        <td>r</td>
        <td>e</td>
        <td>t</td>
        <td>a</td>
        <td>r</td>
        <td>i</td>
        <td>o</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6</td>
        <td>p</td>
        <td>r</td>
        <td hint="true">o</td>
        <td>f</td>
        <td>e</td>
        <td>s</td>
        <td>o</td>
        <td>r</td>
        <td>a</td>
        <td>-</td>
      </line>
    </item>
    <item type="make-word" id="cw1" name="Spanish1/l10/a/humex1_l10_a02.htm"
      ident="MAM+ECAJOC+O+C+H+E+XA+U+T+O+B+U+S+LLO+BA+RT+EM+E+T+R+O+R+PRALC+EE+IA+V+I+O+N+N+">
      <line>
        <td>M</td>
        <td>A</td>
        <td answer="true">M</td>
        <td>E</td>
        <td>C</td>
        <td>A</td>
        <td>J</td>
      </line>
      <line>
        <td>O</td>
        <td answer="true">C</td>
        <td answer="true">O</td>
        <td answer="true">C</td>
        <td answer="true">H</td>
        <td answer="true">E</td>
        <td>X</td>
      </line>
      <line>
        <td answer="true">A</td>
        <td answer="true">U</td>
        <td answer="true">T</td>
        <td answer="true">O</td>
        <td answer="true">B</td>
        <td answer="true">U</td>
        <td answer="true">S</td>
      </line>
      <line>
        <td>L</td>
        <td>L</td>
        <td answer="true">O</td>
        <td>B</td>
        <td answer="true">A</td>
        <td>R</td>
        <td answer="true">T</td>
      </line>
      <line>
        <td>E</td>
        <td answer="true">M</td>
        <td answer="true">E</td>
        <td answer="true">T</td>
        <td answer="true">R</td>
        <td answer="true">O</td>
        <td answer="true">R</td>
      </line>
      <line>
        <td>P</td>
        <td>R</td>
        <td>A</td>
        <td>L</td>
        <td answer="true">C</td>
        <td>E</td>
        <td answer="true">E</td>
      </line>
      <line>
        <td>I</td>
        <td answer="true">A</td>
        <td answer="true">V</td>
        <td answer="true">I</td>
        <td answer="true">O</td>
        <td answer="true">N</td>
        <td answer="true">N</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="Spanish1/l10/a/humex1_l10_a08.htm" col_header="no"
      row_header="no" ident="-----l*ejos--vuel*ta----le*nto-pelig*rosoempeza*r---bar*ato">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td hint="true">l</td>
        <td>e</td>
        <td>j</td>
        <td>o</td>
        <td>s</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>v</td>
        <td>u</td>
        <td>e</td>
        <td hint="true">l</td>
        <td>t</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>l</td>
        <td hint="true">e</td>
        <td>n</td>
        <td>t</td>
        <td>o</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>p</td>
        <td>e</td>
        <td>l</td>
        <td>i</td>
        <td hint="true">g</td>
        <td>r</td>
        <td>o</td>
        <td>s</td>
        <td>o</td>
      </line>
      <line>
        <td>e</td>
        <td>m</td>
        <td>p</td>
        <td>e</td>
        <td>z</td>
        <td hint="true">a</td>
        <td>r</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>b</td>
        <td>a</td>
        <td hint="true">r</td>
        <td>a</td>
        <td>t</td>
        <td>o</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="Spanish1/l12/a/humex1_l12_a07.htm" col_header="no"
      row_header="number"
      ident="herman*o----bo*da---noc*hebuena---enh*orabuena-jugue*tes---nav*idad--pari*entes----re*galo---caj*a----ma*dre">
      <line>
        <td header="true">1.</td>
        <td>h</td>
        <td>e</td>
        <td>r</td>
        <td>m</td>
        <td>a</td>
        <td hint="true">n</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>b</td>
        <td hint="true">o</td>
        <td>d</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>n</td>
        <td>o</td>
        <td hint="true">c</td>
        <td>h</td>
        <td>e</td>
        <td>b</td>
        <td>u</td>
        <td>e</td>
        <td>n</td>
        <td>a</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>e</td>
        <td>n</td>
        <td hint="true">h</td>
        <td>o</td>
        <td>r</td>
        <td>a</td>
        <td>b</td>
        <td>u</td>
        <td>e</td>
        <td>n</td>
        <td>a</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>j</td>
        <td>u</td>
        <td>g</td>
        <td>u</td>
        <td hint="true">e</td>
        <td>t</td>
        <td>e</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>n</td>
        <td>a</td>
        <td hint="true">v</td>
        <td>i</td>
        <td>d</td>
        <td>a</td>
        <td>d</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>p</td>
        <td>a</td>
        <td>r</td>
        <td hint="true">i</td>
        <td>e</td>
        <td>n</td>
        <td>t</td>
        <td>e</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>r</td>
        <td hint="true">e</td>
        <td>g</td>
        <td>a</td>
        <td>l</td>
        <td>o</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">9.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>c</td>
        <td>a</td>
        <td hint="true">j</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">10.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>m</td>
        <td hint="true">a</td>
        <td>d</td>
        <td>r</td>
        <td>e</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="make-word" id="cw1" name="Spanish1/l15/a/humex1_l15_a08.htm"
      ident="LB+SIONOO+R+E+J+A+RLSA+TOP+I+E+TZ+ARI+CSRO+MD+E+D+O+ADEIR+IJ+NAM+A+N+O+O+EB+O+C+A+RE">
      <line>
        <td>L</td>
        <td answer="true">B</td>
        <td>S</td>
        <td>I</td>
        <td>O</td>
        <td>N</td>
        <td>O</td>
      </line>
      <line>
        <td answer="true">O</td>
        <td answer="true">R</td>
        <td answer="true">E</td>
        <td answer="true">J</td>
        <td answer="true">A</td>
        <td>R</td>
        <td>L</td>
      </line>
      <line>
        <td>S</td>
        <td answer="true">A</td>
        <td>T</td>
        <td>O</td>
        <td answer="true">P</td>
        <td answer="true">I</td>
        <td answer="true">E</td>
      </line>
      <line>
        <td>T</td>
        <td answer="true">Z</td>
        <td>A</td>
        <td>R</td>
        <td answer="true">I</td>
        <td>C</td>
        <td>S</td>
      </line>
      <line>
        <td>R</td>
        <td answer="true">O</td>
        <td>M</td>
        <td answer="true">D</td>
        <td answer="true">E</td>
        <td answer="true">D</td>
        <td answer="true">O</td>
      </line>
      <line>
        <td>A</td>
        <td>D</td>
        <td>E</td>
        <td>I</td>
        <td answer="true">R</td>
        <td>I</td>
        <td answer="true">J</td>
      </line>
      <line>
        <td>N</td>
        <td>A</td>
        <td answer="true">M</td>
        <td answer="true">A</td>
        <td answer="true">N</td>
        <td answer="true">O</td>
        <td answer="true">O</td>
      </line>
      <line>
        <td>E</td>
        <td answer="true">B</td>
        <td answer="true">O</td>
        <td answer="true">C</td>
        <td answer="true">A</td>
        <td>R</td>
        <td>E</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="Spanish1/l18/a/humex1_l18_a03.htm" col_header="no"
      row_header="no" ident="---enf*ermedadagricu*ltura---opt*imista--salu*d--teor*ía-visio*nes">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>e</td>
        <td>n</td>
        <td hint="true">f</td>
        <td>e</td>
        <td>r</td>
        <td>m</td>
        <td>e</td>
        <td>d</td>
        <td>a</td>
        <td>d</td>
      </line>
      <line>
        <td>a</td>
        <td>g</td>
        <td>r</td>
        <td>i</td>
        <td>c</td>
        <td hint="true">u</td>
        <td>l</td>
        <td>t</td>
        <td>u</td>
        <td>r</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>o</td>
        <td>p</td>
        <td hint="true">t</td>
        <td>i</td>
        <td>m</td>
        <td>i</td>
        <td>s</td>
        <td>t</td>
        <td>a</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>s</td>
        <td>a</td>
        <td>l</td>
        <td hint="true">u</td>
        <td>d</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>t</td>
        <td>e</td>
        <td>o</td>
        <td hint="true">r</td>
        <td>í</td>
        <td>a</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>v</td>
        <td>i</td>
        <td>s</td>
        <td>i</td>
        <td hint="true">o</td>
        <td>n</td>
        <td>e</td>
        <td>s</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="Spanish2/l10/a/humex2_l10_a02.htm" col_header=""
      row_header="number"
      ident="ACTIV*IDAD---MI*EDO--CON*TACTO-SINC*ERIDAD--GRU*PO--SOL*EDAD---CO*NVERSACIÓN-AMIS*TAD">
      <line>
        <td header="true">1.</td>
        <td>A</td>
        <td>C</td>
        <td>T</td>
        <td>I</td>
        <td hint="true">V</td>
        <td>I</td>
        <td>D</td>
        <td>A</td>
        <td>D</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>M</td>
        <td hint="true">I</td>
        <td>E</td>
        <td>D</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">3.</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td>O</td>
        <td hint="true">N</td>
        <td>T</td>
        <td>A</td>
        <td>C</td>
        <td>T</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">4.</td>
        <td>-</td>
        <td>S</td>
        <td>I</td>
        <td>N</td>
        <td hint="true">C</td>
        <td>E</td>
        <td>R</td>
        <td>I</td>
        <td>D</td>
        <td>A</td>
        <td>D</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">5.</td>
        <td>-</td>
        <td>-</td>
        <td>G</td>
        <td>R</td>
        <td hint="true">U</td>
        <td>P</td>
        <td>O</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>S</td>
        <td>O</td>
        <td hint="true">L</td>
        <td>E</td>
        <td>D</td>
        <td>A</td>
        <td>D</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">7.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td hint="true">O</td>
        <td>N</td>
        <td>V</td>
        <td>E</td>
        <td>R</td>
        <td>S</td>
        <td>A</td>
        <td>C</td>
        <td>I</td>
        <td>Ó</td>
        <td>N</td>
      </line>
      <line>
        <td header="true">8.</td>
        <td>-</td>
        <td>A</td>
        <td>M</td>
        <td>I</td>
        <td hint="true">S</td>
        <td>T</td>
        <td>A</td>
        <td>D</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
    <item type="cross-word" id="cw1" name="Spanish2/l14/a/humex2_l14_a10.htm" col_header=""
      row_header=""
      ident="----------7.@-8.@----------S-G----1.@ENSUCIAR-------6.@--L-I2.@EMPUJAR--B-T------3.@ENFADARSE-----5.@-S--R-R-----C-P---4.@MOLESTAR-----L-T-----A-A-----R-R-----S-----E">
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">7.</td>
        <td>-</td>
        <td header="true">8.</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>G</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">1.</td>
        <td>E</td>
        <td>N</td>
        <td>S</td>
        <td>U</td>
        <td>C</td>
        <td>I</td>
        <td>A</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">6.</td>
        <td>-</td>
        <td>-</td>
        <td>L</td>
        <td>-</td>
        <td>I</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td header="true">2.</td>
        <td>E</td>
        <td>M</td>
        <td>P</td>
        <td>U</td>
        <td>J</td>
        <td>A</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>B</td>
        <td>-</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">3.</td>
        <td>E</td>
        <td>N</td>
        <td>F</td>
        <td>A</td>
        <td>D</td>
        <td>A</td>
        <td>R</td>
        <td>S</td>
        <td>E</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">5.</td>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>C</td>
        <td>-</td>
        <td>P</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td header="true">4.</td>
        <td>M</td>
        <td>O</td>
        <td>L</td>
        <td>E</td>
        <td>S</td>
        <td>T</td>
        <td>A</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>L</td>
        <td>-</td>
        <td>T</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>A</td>
        <td>-</td>
        <td>A</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>R</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>S</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
      <line>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>E</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </line>
    </item>
  </xsl:variable>

</xsl:stylesheet>
