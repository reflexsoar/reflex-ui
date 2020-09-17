<template>
  <CCol xs="12" lg="12">
    <h2>Case Management</h2><br>
    <CCard>
      <CCardBody class="tabbed">
        <CTabs>
          <CTab active>
            <template slot="title">
              Cases
            </template>
            <Cases></Cases>
          </CTab>
          <CTab>
            <template slot="title">
              Case Templates
            </template>
            STUFF
          </CTab>
        </CTabs>
      </CCardBody>
    </CCard>
  </CCol>
</template>

<script>

const Cases = () => import('@/views/CaseList')
export default {
    name: 'CaseManagement',
    components: {
      'Cases': Cases
    },
    created() {
      this.$store.commit('add_start') // Stop the success/fail add from showing up when changing from other pages
    }
}
</script>
