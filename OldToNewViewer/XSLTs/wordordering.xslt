<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.1" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:msxsl="urn:schemas-microsoft-com:xslt"
  xmlns="htmlPassivePage"
  xmlns:lm="lm"
  xmlns:ms="urn:schemas-microsoft-com:xslt"
  >
  
  <xsl:output method="xml" indent="yes"/>
  <xsl:variable name="smallcase" select="'abcdefghijklmnopqrstuvwxyz'" />
  <xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'" />

  <xsl:template match="*[local-name() = 'html']">
    <html xmlns="htmlPassivePage" xmlns:lm="lm" xmlns:ms="urn:schemas-microsoft-com:xslt" xmlns:epa="www.epaonline.com/epaclasses" >
      <xsl:apply-templates select="*|@*"/>
    </html>
  </xsl:template>
  
  <xsl:template match="*[local-name() = 'body']">
    <body xmlns:lm="lm" xmlns:ms="urn:schemas-microsoft-com:xslt" >
      <xsl:apply-templates select="*|@*"/>
    </body>
  </xsl:template>
  
  <xsl:template match="*[local-name() = 'head']">
    <xsl:copy-of select="."/>
  </xsl:template>
  
  <xsl:template match="word-ordering">
    <word-ordering>
      <xsl:apply-templates select="@*"/>
    </word-ordering>
  </xsl:template>

  <xsl:template match="@correct-order">
    <xsl:variable name="words" select="substring-after(.,'|')"/>
    <xsl:variable name="first" select="substring-before(.,'|')"/>
    <xsl:attribute name="correct-order">
      <xsl:value-of select="translate($first,$uppercase,$smallcase)"/>#<xsl:value-of select="$first"/>|<xsl:value-of select="$words"/>
    </xsl:attribute>    
  </xsl:template>
  
  <xsl:template match="@* | node() | *" >
    <xsl:copy>
      <xsl:apply-templates select="@* | node()"/>
    </xsl:copy>
  </xsl:template>
  
</xsl:stylesheet>