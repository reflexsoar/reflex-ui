<template>
  <CCol xs="12" lg="12">
    <h2>Case Management<button type="button" class="kb" onclick="window.open('https://docs.reflexsoar.com/en/latest/cases')"><CIcon name='cil-book' size="lg"/></button></h2><br>
     <CAlert :show.sync="alert.show" :color="alert.type" closeButton>
      {{alert.message}}
    </CAlert>
    <CCard>
      <CCardBody class="tabbed">
        <CTabs>
          <CTab active>
            <template slot="title">
              Cases
            </template>
            <Cases></Cases>
          </CTab>
          <CTab v-if="this.$store.getters.user_has_permission('update_case_template')">
            <template slot="title">
              Case Templates
            </template>
            <CaseTemplates></CaseTemplates>
          </CTab>
        </CTabs>
      </CCardBody>
    </CCard>
  </CCol>
</template>

<script>
import {mapState} from 'vuex';
const Cases = () => import('@/views/CaseList')
const CaseTemplates = () => import('@/views/CaseTemplateList')
export default {
    name: 'CaseManagement',
    components: {
      'Cases': Cases,
      CaseTemplates
    },
    computed: mapState(['alert','current_user']),
    created() {
      if(this.current_user.default_org) {
        this.$store.dispatch("getOrganizations")
      }
      this.$store.commit('add_start') // Stop the success/fail add from showing up when changing from other pages
    }
}
</script>
