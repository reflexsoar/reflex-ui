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
    </CCol>
  </CRow>
</template>
<script>
import { mapState } from "vuex";
import OrganizationBadge from "../OrganizationBadge.vue";

export default {
  name: "AgentPolicies",
  components: {
    OrganizationBadge,
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
        "created_at",
        "created_by",
        "updated_at",
        "updated_by",
        "actions",
      ],
    };
  },
  created() {
    this.listPolicies();
  },
  methods: {
    newAgentPolicy() {},
    listPolicies() {
      this.$store.dispatch("getAgentPolicies", {});
    },
  },
};
</script>
