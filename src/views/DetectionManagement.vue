<template>
  <CCol xs="12" lg="12">
    <h2>Detection Management</h2><br>
     <CAlert :show.sync="alert.show" :color="alert.type" closeButton>
      {{alert.message}}
    </CAlert>
    <CCard>
      <CCardBody class="tabbed">
        <CTabs>
          <CTab active>
            <template slot="title">
              Detection Rules
            </template>
            BRUH
            <!--<DetectionRules></DetectionRules>-->
          </CTab>
        </CTabs>
      </CCardBody>
    </CCard>
  </CCol>
</template>

<script>
import {mapState} from 'vuex';
//const DetectionRules = () => import('@/views/DetectionRuleList')
export default {
    name: 'DetectionManagement',
    /*components: {
      'DetectionRules': DetectionRules
    },*/
    computed: mapState(['alert']),
    created() {
      this.$store.commit('add_start') // Stop the success/fail add from showing up when changing from other pages
    }
}
</script>
