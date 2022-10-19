<template>
  <CRow
    ><link
      rel="stylesheet"
      href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"
    />
    <CCol col>
      <div style="padding: 10px">
        <CButton color="primary" @click="newAgentPolicy()">New Agent Policy</CButton>
      </div>
      <CDataTable
        :items="agent_policies"
        :fields="fields"
        :items-per-page="small ? 25 : 10"
        :loading="loading"
        :sorter="{ external: false, resetable: true }"
      >
        <template #organization="{ item }">
          <td>
            <OrganizationBadge :uuid="item.organization" />
          </td>
        </template>
        <template #tags="{item}">
          <td>
            <li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag">
            <CBadge color="info" size="sm" style="padding: 5px; margin-top:10px; margin-right:3px;">{{ tag }}</CBadge>
          </li>
          </td>
          </template>
        <template #created_at="{ item }">
          <td>
            {{ item.created_at | moment("from", "now") }}
          </td>
        </template>
        <template #updated_at="{ item }">
          <td>
            {{ item.updated_at | moment("from", "now") }}
          </td>
        </template>
        <template #updated_by="{ item }">
          <td>
            {{ item.updated_by ? item.updated_by.username : "" }}
          </td>
        </template>
        <template #roles="{item}">
            <td>
            <li style="display: inline; margin-right: 2px;" v-for="role in item.roles" :key="role"><CButton color="primary" style="cursor: auto" size="sm" disabled>{{ role }}</CButton></li>
            </td>
        </template>
        <template #created_by="{ item }">
          <td>
            {{ item.created_by ? item.created_by.username : "" }}
          </td>
        </template>
        <template #actions="{ item }">
          <td class="text-right">
            <CButton @click="editAgentPolicy(item.uuid)" color="info" size="sm"
              ><CIcon name="cilPencil" /></CButton
            >&nbsp;
            <CButton @click="deleteAgentPolicy(item.uuid)" color="danger" size="sm"
              ><CIcon name="cilTrash"
            /></CButton>
          </td>
        </template>
      </CDataTable>
      <AgentPolicyWizard :show.sync="show_agent_wizard" :modal_mode="modal_mode" :policy="agent_policy" />
    </CCol>
  </CRow>
</template>
<script>
import { mapState } from "vuex";
import OrganizationBadge from "../OrganizationBadge.vue";
import AgentPolicyWizard from "./AgentPolicyWizard.vue";

export default {
  name: "AgentPolicies",
  components: {
    OrganizationBadge,
    AgentPolicyWizard
  },
  data() {
    return {
      msg: "Welcome to Your Vue.js App",
    };
  },
  computed: mapState(["agent_policies"]),
  data() {
    return {
      show_agent_wizard: false,
      fields: [
        "name",
        "organization",
        "roles",
        "tags",
        "created_at",
        "updated_at",
        "updated_by",
        "actions",
      ],
      agent_policy: {
        "name": "",
        "description": null,
        "roles": [
          "runner",
          "detector",
          "poller"
        ],
        "health_check_interval": 30,
        "logging_level": "ERROR",
        "max_intel_db_size": 0,
        "disable_event_cache_check": false,
        "event_realert_ttl": 3600,
        "poller_config": {
          "concurrent_inputs": 5,
          "graceful_exit": true,
          "logging_level": "ERROR",
          "max_input_attempts": 3,
          "signature_cache_ttl": 3600
        },
        "detector_config": {
          "concurrent_rules": 10,
          "graceful_exit": true,
          "catchup_period": 60,
          "wait_interval": 30,
          "max_threshold_events": 1000,
          "logging_level": "ERROR"
        },
        "runner_config": {
          "concurrent_actions": 10,
          "graceful_exit": true,
          "wait_interval": 30,
          "plugin_poll_interval": 30,
          "logging_level": "ERROR"
        },
        "tags": [],
        "priority": 1,
      },
      loading: false,
      small: false,
      modal_mode: 'Create'
    };
  },
  created() {
    this.listPolicies();
  },
  methods: {
    newAgentPolicy() {
      this.modal_mode = "Create";
      this.agent_policy = {
        "name": "",
        "description": null,
        "roles": [
          "runner",
          "detector",
          "poller"
        ],
        "health_check_interval": 30,
        "logging_level": "ERROR",
        "max_intel_db_size": 0,
        "disable_event_cache_check": false,
        "event_realert_ttl": 3600,
        "poller_config": {
          "concurrent_inputs": 5,
          "graceful_exit": true,
          "logging_level": "ERROR",
          "max_input_attempts": 3,
          "signature_cache_ttl": 3600
        },
        "detector_config": {
          "concurrent_rules": 10,
          "graceful_exit": true,
          "catchup_period": 60,
          "wait_interval": 30,
          "max_threshold_events": 1000,
          "logging_level": "ERROR"
        },
        "runner_config": {
          "concurrent_actions": 10,
          "graceful_exit": true,
          "wait_interval": 30,
          "plugin_poll_interval": 30,
          "logging_level": "ERROR"
        },
        "tags": [],
        "priority": 1,
      };
      this.show_agent_wizard = true;
    },
    editAgentPolicy(uuid) {
      this.modal_mode = 'Edit'
      this.agent_policy = Object.assign({},this.agent_policies.find((agent_policy) => agent_policy.uuid === uuid));
      this.show_agent_wizard = true;
    },
    listPolicies() {
      this.$store.dispatch("getAgentPolicies", {});
    },
  },
};
</script>
