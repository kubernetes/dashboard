<!--
Copyright 2017 The Kubernetes Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

<!--
Transformation used to remove duplicated translation entries. It should be used before translations are sorted.
Given following input:

key="MSG_WORKLOADS_1" msg="Old translation."
key="MSG_WORKLOADS_2" msg="Some other translation."
key="MSG_WORKLOADS_1" msg="New translation."

It will produce following output:

key="MSG_WORKLOADS_2" msg="Some other translation."
key="MSG_WORKLOADS_1" msg="New translation."
-->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes" omit-xml-declaration="no" encoding="UTF-8"/>
  <xsl:strip-space elements="*"/>
  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>
  <xsl:template match="*[not(*)][@key = following-sibling::*/@key]" />
</xsl:stylesheet>
