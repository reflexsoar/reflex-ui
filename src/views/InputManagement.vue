<template>
  <CRow><CCol xs="12" lg="12">
        <h2>Input Management<button type="button" class="kb" onclick="window.open('https://docs.reflexsoar.com/en/latest/inputs')"><CIcon name='cil-book' size="lg"/></button></h2><br>
        <CCard>
          <CCardBody class="tabbed">
            <CTabs>
              <CTab active>
                <template slot="title">
                  <CIcon name="cil-terminal"/> Inputs
                </template>
                <Inputs></Inputs>
              </CTab>
              <CTab>
                <template slot="title">
                  <CIcon name="cil-sitemap"/> Field Mappings <CBadge color="primary">BETA</CBadge>
                </template>
                <InputFieldMappingList></InputFieldMappingList>
              </CTab>
            </CTabs>
          </CCardBody>
        </CCard>
      </CCol></CRow>
</template>

<script>
import Inputs from "./InputsList.vue";
import InputFieldMappingList from './InputFieldMappingList.vue'

export default {
    name: 'InputManagement',
    components: {
      Inputs,
      InputFieldMappingList
    },
    created() {
      this.$store.commit('add_start') // Stop the success/fail add from showing up when changing from other pages
    }
}
</script>
