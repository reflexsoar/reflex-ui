<template>
  <CCol xs="12" lg="12">
        <CCard>
          <CCardHeader>
            Agent Management
          </CCardHeader>
          <CCardBody>
            <CTabs><br>
              <CTab active>
                <template slot="title">
                  <CIcon name="cil-terminal"/> Agents
                </template>
                <Agents></Agents>
              </CTab>
              <CTab>
                <template slot="title">
                  <CIcon name="cil-object-group"/> Agent Groups
                </template>
                <AgentGroups></AgentGroups>
              </CTab>
            </CTabs>
          </CCardBody>
        </CCard>
      </CCol>
</template>

<script>

const Agents = () => import('@/views/AgentsList')
const AgentGroups = () => import('@/views/AgentGroupList')
export default {
    name: 'AgentManagement',
    components: {
      'Agents': Agents,
      'AgentGroups': AgentGroups
    },
    created() {
      this.$store.commit('add_start') // Stop the success/fail add from showing up when changing from other pages
    }
}
</script>
