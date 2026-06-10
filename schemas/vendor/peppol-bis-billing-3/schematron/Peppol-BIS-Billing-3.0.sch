<?xml version="1.0" encoding="UTF-8"?>
<schema xmlns="http://purl.oclc.org/dsdl/schematron" queryBinding="xslt2">
  <pattern id="peppol-billing">
    <rule context="/*[local-name()='Invoice' or local-name()='CreditNote']">
      <assert test="exists(//*[local-name()='CustomizationID'])">Peppol: CustomizationID is required.</assert>
      <assert test="exists(//*[local-name()='ProfileID'])">Peppol: ProfileID is required.</assert>
      <assert test="exists(//*[local-name()='AccountingSupplierParty'])">Peppol: AccountingSupplierParty is required.</assert>
      <assert test="exists(//*[local-name()='AccountingCustomerParty'])">Peppol: AccountingCustomerParty is required.</assert>
    </rule>
  </pattern>
</schema>
