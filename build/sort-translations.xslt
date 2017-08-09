<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes" omit-xml-declaration="no" encoding="UTF-8"/>
  <xsl:strip-space elements="*"/>
  <xsl:template match="translationbundle">
    <!-- XSLT doesn't support adding doctype without PUBLIC or SYSTEM annotation, so add it to the doc raw -->
    <xsl:text disable-output-escaping="yes">&lt;!DOCTYPE translationbundle&gt;</xsl:text>
    <xsl:copy>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates select="translation">
        <xsl:sort select="@key" order="ascending"/>
        <!-- second sort on id attribute to ensure stability of the sort -->
        <xsl:sort select="@id" order="ascending" data-type="number"/>
      </xsl:apply-templates>
    </xsl:copy>
  </xsl:template>

  <!--empty template suppresses 'source' attribute -->
  <xsl:template match="@source"/>

  <!--identity template copies everything forward by default-->
  <xsl:template match="@* | node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>
