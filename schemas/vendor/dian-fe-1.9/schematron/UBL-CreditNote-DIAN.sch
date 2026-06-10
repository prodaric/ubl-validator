<?xml version="1.0" encoding="UTF-8"?>
<schema xmlns="http://purl.oclc.org/dsdl/schematron" queryBinding="xslt2">
  <pattern id="dian-creditnote">
    <rule context="/*[local-name()='CreditNote']">
      <assert test="exists(//*[local-name()='DianExtensions'])">DIAN: CreditNote must contain DianExtensions.</assert>
    </rule>
  </pattern>
</schema>
