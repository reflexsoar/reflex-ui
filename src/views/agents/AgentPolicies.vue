<template>
  <CRow
    ><link
      rel="stylesheet"
      href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"
    />
    <CCol col>
      <CRow class="page-sub-header page-header-row">
        <CCol>
          <h2>Agent Policies</h2>
        </CCol>
        <CCol class="text-right">
     
          <CButton color="primary" @click="newAgentPolicy()">New Agent Policy</CButton>
        </CCol>
      </CRow>
      <CCard>
      
      <CDataTable
        :items="agent_policies"
        :fields="fields"
        :items-per-page="small ? 25 : 10"
        :loading="loading"
        :responsive="true"
        :sorter="{ external: false, resetable: true }"
      >
        <template #organization="{ item }">
          <td>
            <OrganizationBadge :uuid="item.organization" />
          </td>
        </template>
        <template #tags="{item}">
          <td>
            <TagBucket :tags="item.tags" />
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
            <TagBucket :tags="item.roles" label="Roles" iconName="cilSettings" />
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
      </CCard>
      <AgentPolicyWizard :show.sync="show_agent_wizard" :modal_mode="modal_mode" :policy="agent_policy" />
    </CCol>
  </CRow>
</template>
<script>
import { mapState } from "vuex";
import OrganizationBadge from "../OrganizationBadge.vue";
import AgentPolicyWizard from "./AgentPolicyWizard.vue";
import RDataTable from "../components/DataTable.vue";
import TagBucket from "../components/TagBucket.vue"

export default {
  name: "AgentPolicies",
  components: {
    OrganizationBadge,
    AgentPolicyWizard,
    RDataTable,
    TagBucket
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
          "poller",
          "mitre",
          "fim"
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
        "mitre_mapper_config": {
          'concurrent_inputs': 10,
          'graceful_exit': true,
          'mapping_refresh_interval': 60,
          'assessment_days': 14,
          'logging_level': 'ERROR',
          'timeout': 30
        },
        "fim_config": {
          "max_parallel_rules": 10,
          "max_cpu_time": 30,
          "max_memory": 256,
          "max_cache_db_size": 100,
          "max_cache_db_age": 72,
          "alert_on_cache_missing": false,
          "wait_interval": 30,
          "logging_level": 'ERROR',
          "graceful_exit": true
        },
        search_proxy_config: {
          event_wait_timeout: 30,
          logging_level: "ERROR",
          max_concurrent_searches: 10,
          max_results: 500,
          query_timeout: 30,
          sudo_user: null,
          target_input: null,
          user_roles: [],
          credential: null
        },
        inventory_config : {
          enabled: true,
          collection_interval: 3600,
          cache_expiration: 300,
          installed_software: true,
          services: true,
          listening_ports: true,
          local_users: true,
          network_adapters: true,
          containers: true,
          perf_interval: 30,
          service_interval: 300,
          host_performance: false,
          container_stats: false,
          container_services: false,
          metrics_outputs: []
        },
        winlog_config: {
          wait_interval: 60,
          logging_level: 'ERROR',
          graceful_exit: true,
          log_source_config: [],
          default_output: []
        },
        sysmon_manager_config: {
          wait_interval: 60,
          logging_level: 'ERROR',
          graceful_exit: true,
          configurations: []
        },
        "tags": [],
        agent_tags: [],
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
        "mitre_mapper_config": {
          'concurrent_inputs': 10,
          'graceful_exit': true,
          'mapping_refresh_interval': 60,
          'assessment_days': 14,
          'logging_level': 'ERROR',
          'timeout': 30
        },
        "fim_config": {
          "max_parallel_rules": 10,
          "max_cpu_time": 30,
          "max_memory": 256,
          "max_cache_db_size": 100,
          "max_cache_db_age": 72,
          "alert_on_cache_missing": false,
          "wait_interval": 30,
          "logging_level": 'ERROR',
          "graceful_exit": true
        },
        search_proxy_config: {
          event_wait_timeout: 30,
          logging_level: "ERROR",
          max_concurrent_searches: 10,
          max_results: 500,
          query_timeout: 30,
          sudo_user: null,
          target_input: null,
          user_roles: [],
          credential: null
        },
        inventory_config : {
          enabled: true,
          collection_interval: 3600,
          cache_expiration: 300,
          installed_software: true,
          services: true,
          listening_ports: true,
          local_users: true,
          network_adapters: true,
          containers: true,
          perf_interval: 30,
          service_interval: 300,
          host_performance: false,
          container_stats: false,
          container_services: false,
          metrics_outputs: []
        },
        winlog_config: {
          wait_interval: 60,
          logging_level: 'ERROR',
          graceful_exit: true,
          log_source_config: [],
          default_output: []
        },
        sysmon_manager_config: {
          wait_interval: 60,
          logging_level: 'ERROR',
          graceful_exit: true,
          configurations: []
        },
        "tags": [],
        agent_tags: [],
        "priority": 1,
      };
      this.show_agent_wizard = true;
    },
    editAgentPolicy(uuid) {
      this.modal_mode = 'Edit'
      this.agent_policy = JSON.parse(JSON.stringify(this.agent_policies.find((p) => p.uuid === uuid)));
      this.show_agent_wizard = true;
    },
    listPolicies() {
      this.$store.dispatch("getAgentPolicies", {});
    },
  },
};
</script>
