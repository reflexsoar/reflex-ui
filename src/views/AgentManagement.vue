<template>
  <CRow><CCol xs="12" lg="12">
        <h2>Agent Management<button type="button" class="kb" onclick="window.open('https://docs.reflexsoar.com/en/latest/agents')"><CIcon name='cil-book' size="lg"/></button></h2><br>

        <CRow>
          <CCol>
            <CCard>
              <CCardHeader color="secondary">Agent Summary</CCardHeader>
              <CCardBody><CRow>
                <CCol class="text-center">
                  <h1>{{agents.length}}</h1>
                  <small>TOTAL AGENTS</small>
                </CCol>
                <CCol class="text-center" style="border-left:1px solid #cfcfcf">
                  <h1>{{agents.filter(agent => agent.health_issues && agent.health_issues.includes('Heartbeat TTL Expired')).length}}</h1>
                  <small>OFFLINE AGENTS</small>
                </CCol>
                <CCol class="text-center" style="border-left:1px solid #cfcfcf">
                  <h1>{{agents.filter(agent => agent.healthy === false).length}}</h1>
                  <small>UNHEALTHY AGENTS</small>
                </CCol>
              </CRow></CCardBody>
              </CCard>
          </CCol>
          </CRow>
            
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
import { mapState } from 'vuex'
const Agents = () => import('@/views/AgentsList')
const AgentGroups = () => import('@/views/AgentGroupList')
const AgentPolicies = () => import('@/views/agents/AgentPolicies')
export default {
    name: 'AgentManagement',
    computed: mapState(['agents']),
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
