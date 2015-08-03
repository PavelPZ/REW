<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:msxsl="urn:schemas-microsoft-com:xslt"
    xmlns="htmlPassivePage"
    xmlns:lm="lm"
    xmlns:ms="urn:schemas-microsoft-com:xslt"
  >

  <xsl:output method="xml" indent="yes"/>

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

  <xsl:template match="lm:layout_row">
    <xsl:choose>
      <xsl:when test="count(./lm:layout_cell)=2 and count(./lm:layout_cell/*)=2 and count(./lm:layout_cell/lm:img)=1 and count(./lm:layout_cell/*[local-name() = 'pairing'])=1">
        <div class="media">
          <div class="media-body">
            <xsl:apply-templates select="./lm:layout_cell//*[local-name() = 'pairing']|./lm:layout_cell//comment()"/>  
          </div>
          <div class="media-right media-middle">
            <xsl:apply-templates select="./lm:layout_cell//*[local-name() = 'img']"/>    
          </div>
        </div>
      </xsl:when>
      <xsl:otherwise>
        <xsl:copy-of select="."/>
      </xsl:otherwise>
    </xsl:choose>

  </xsl:template>

  <xsl:template match="lm:layout_cell[count(./lm:img)=1]">
    
      <xsl:apply-templates select="@* | node()"/>
  
  </xsl:template>

  <xsl:template match="comment()">
    <xsl:comment>
      <xsl:copy-of select="."/>
    </xsl:comment>
  </xsl:template>
  
  <xsl:template match="@valign" />
  
  <xsl:template match="lm:layout_cell[count(./*[local-name() = 'pairing'])=1]">
    
      <xsl:apply-templates select="@* | node()"/>
  
  </xsl:template>

  <xsl:template match="lm:img">
    <xsl:copy-of select ="."/>
  </xsl:template>

  <xsl:template match="*[local-name() = 'pairing']">
    <xsl:copy-of select="."/>
  </xsl:template>

  <xsl:template match="@* | node()">
    <xsl:copy>
      <xsl:apply-templates select="@* | node()"/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="text()">
    <xsl:copy-of select="."/>
  </xsl:template>

  <xsl:template match="*" >
    NEPODPOROVANÝ XSLT PŘEVOD
  </xsl:template>

</xsl:stylesheet>


