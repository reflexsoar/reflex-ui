<template>
  <CRow
    ><CCol xs="12" lg="12">
      <h2 class="page-heading">
        Agent Management<button
          type="button"
          class="kb"
          onclick="window.open('https://docs.reflexsoar.com/en/latest/agents')"
        >
          <CIcon name="cil-book" size="lg" />
        </button>
      </h2>

      <CTabs
        addNavWrapperClasses="page-nav"
        addTabClasses="page-nav-tab-body"
        addNavClasses="page-nav-tab"
      >
        <CTab active>
          <template slot="title"> <CIcon name="cil-terminal" /> Agents </template>
          <CRow>
            <CCol class="text-center">
              <CalloutCard label="Total Agents" :value="agents.length" color="success" />
            </CCol>
            <CCol class="text-center">
              <CalloutCard
                label="Unhealthy Agents"
                :value="agents.filter((agent) => agent.healthy === false).length"
                color="warning"
              />
            </CCol>
            <CCol class="text-center">
              <CalloutCard
                label="Offline Agents"
                :value="
                  agents.filter(
                    (agent) =>
                      agent.health_issues &&
                      agent.health_issues.includes('Heartbeat TTL Expired')
                  ).length
                "
                color="danger"
              />
            </CCol>
          </CRow>
          <Agents></Agents>
        </CTab>
        <CTab>
          <template slot="title">
            <CIcon name="cil-object-group" /> Groups
          </template>
          <AgentGroups></AgentGroups>
        </CTab>
        <CTab>
          <template slot="title"> <CIcon name="cil-settings" /> Agent</template>
          <AgentPolicies></AgentPolicies>
        </CTab>
        <CTab>
        <template slot="title"> <CIcon name="cil-tags" /> Tags</template>
          <AgentTags/>
        </CTab>
      </CTabs> </CCol
  ></CRow>
</template>

<script>
import { mapState } from "vuex";
import CalloutCard from "./components/CalloutCard";
const Agents = () => import("@/views/AgentsList");
const AgentGroups = () => import("@/views/AgentGroupList");
const AgentPolicies = () => import("@/views/agents/AgentPolicies");

import AgentTags from "./agents/AgentTags.vue";

export default {
  name: "AgentManagement",
  computed: mapState(["agents"]),
  components: {
    Agents: Agents,
    AgentGroups: AgentGroups,
    AgentPolicies: AgentPolicies,
    CalloutCard,
    AgentTags
  },
  created() {
    this.$store.commit("add_start"); // Stop the success/fail add from showing up when changing from other pages
  },
};
</script>
