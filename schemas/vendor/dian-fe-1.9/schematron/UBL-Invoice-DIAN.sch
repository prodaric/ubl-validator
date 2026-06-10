<?xml version="1.0" encoding="UTF-8"?>
<schema xmlns="http://purl.oclc.org/dsdl/schematron" queryBinding="xslt2">
  <pattern id="dian-invoice">
    <rule context="/*[local-name()='Invoice']">
      <assert test="exists(//*[local-name()='DianExtensions'])">DIAN: Invoice must contain DianExtensions.</assert>
      <assert test="exists(//*[local-name()='CustomizationID'])">DIAN: CustomizationID is required.</assert>
      <assert test="exists(//*[local-name()='ProfileID'])">DIAN: ProfileID is required.</assert>
      <assert test="exists(//*[local-name()='UUID'])">DIAN: UUID (CUFE) is required.</assert>
    </rule>
  </pattern>
</schema>
