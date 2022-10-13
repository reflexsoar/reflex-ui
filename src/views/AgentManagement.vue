<template>
  <CRow><CCol xs="12" lg="12">
        <h2>Agent Management<button type="button" class="kb" onclick="window.open('https://docs.reflexsoar.com/en/latest/agents')"><CIcon name='cil-book' size="lg"/></button></h2><br>
        <CCard>
          <CCardBody class="tabbed">
            <CTabs>
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
              <CTab>
                <template slot="title">
                  <CIcon name="cil-settings"/> Agent Policies
                </template>
                <AgentPolicies></AgentPolicies>
              </CTab>
            </CTabs>
          </CCardBody>
        </CCard>
      </CCol></CRow>
</template>

<script>

const Agents = () => import('@/views/AgentsList')
const AgentGroups = () => import('@/views/AgentGroupList')
const AgentPolicies = () => import('@/views/agents/AgentPolicies')
export default {
    name: 'AgentManagement',
    components: {
      'Agents': Agents,
      'AgentGroups': AgentGroups,
      'AgentPolicies': AgentPolicies
    },
    created() {
      this.$store.commit('add_start') // Stop the success/fail add from showing up when changing from other pages
    }
}
</script>
