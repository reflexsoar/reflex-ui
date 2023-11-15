<template>
  <div>
    <CRow class="page-heading page-heading-no-nav">
      <CCol>
        <h2>File Integrity Monitoring</h2>
        <CAlert :show.sync="alert.show" :color="alert.color" :fade="false" closeButton>
          {{ alert.message }}
        </CAlert>
      </CCol>
    </CRow>
    <CRow>
      <CCol>
        <CAlert color="info">
          <b>Beta Functionality</b> 
          This functionality is currently in Beta and requires a special agent to properly
          function.
        </CAlert>
      </CCol>
    </CRow>
    <CRow>
      <CCol class="page-sub-header">
        <h3>File Integrity Rules</h3>
      </CCol>
      <CCol class="text-right">
        <CButton
          v-if="current_user.permissions['create_fim_rule']"
          @click="createRule()"
          color="primary"
          >Create Rule</CButton
        >
      </CCol>
    </CRow>
    <CRow>
      <CCol>
        <CCard style="margin-top: 5px">
          <CDataTable
            :items="fim_rules"
            :fields="columns"
            :responsive="false"
            pagination
            :items-per-page="10"
            :sorter="{ external: true, resetable: true }"
          >
            <template #name="{ item }">
              <td>
                <CBadge v-if="item.active" color="success" class="tag tag-sm" size="sm"
                  >Active</CBadge
                >
                <CBadge v-if="!item.active" color="danger" class="tag tag-sm" size="sm"
                  >Disabled</CBadge
                >
                &nbsp;{{ item.name }}
              </td>
            </template>
            <template #actions="{ item }">
              <td class="text-right">
                <CDropdown toggler-text="Actions" color="secondary" size="sm">
                  <CDropdownItem
                    @click="editRule(item.uuid)"
                    v-if="current_user.permissions['update_fim_rule']"
                    >Edit</CDropdownItem
                  >
                  <CDropdownItem
                    @click="enableRule(item.uuid)"
                    v-if="!item.active && current_user.permissions['update_fim_rule']"
                    >Enable Rule</CDropdownItem
                  >
                  <CDropdownItem
                    @click="disableRule(item.uuid)"
                    v-if="item.active && current_user.permissions['update_fim_rule']"
                    >Disable Rule</CDropdownItem
                  >
                  <CDropdownItem
                    v-if="!item.active && current_user.permissions['delete_fim_rule']"
                    @click="deleteRule(item.uuid)"
                    >Delete</CDropdownItem
                  >
                </CDropdown>
              </td>
            </template>
            <template #paths="{ item }">
              <td>
                <TagBucket :tags="item.paths" iconName="cil-folder"></TagBucket>
              </td>
            </template>
            <template #exclude_patterns="{ item }">
              <td>
                <TagBucket :tags="item.exclude_patterns" :countOnly="true"></TagBucket>
              </td>
            </template>
            <template #include_patterns="{ item }">
              <td>
                <TagBucket :tags="item.include_patterns" :countOnly="true"></TagBucket>
              </td>
            </template>
            <template #organization="{ item }">
              <td>
                <OrganizationBadge :uuid="item.organization"></OrganizationBadge>
              </td>
            </template>
          </CDataTable>
        </CCard>
      </CCol>
    </CRow>
    <FIMRuleModal
      :show.sync="show_fim_rule_wizard"
      :mode="modal_mode"
      :rule="fim_rule"
      @dismiss="show_fim_rule_wizard = false"
    ></FIMRuleModal>
  </div>
</template>

<script>
import { mapState } from "vuex";

import FIMRuleModal from "./FimRuleModal.vue";
import OrganizationBadge from "../OrganizationBadge";
import TagBucket from "../components/TagBucket.vue";

export default {
  name: "FimRules",
  components: {
    FIMRuleModal,
    OrganizationBadge,
    TagBucket,
  },
  computed: mapState(["current_user", "fim_rules"]),
  created: function () {
    this.$store.dispatch("getFimRules", {});
    if (this.current_user.default_org) {
      this.columns.splice(3, 0, "organization");
    }
  },
  data() {
    return {
      alert: {
        show: false,
        color: "success",
        message: "",
      },
      fim_rule: {},
      columns: [
        "name",
        "description",
        "paths",
        "exclude_patterns",
        "include_patterns",
        { key: "actions", label: "" },
      ],
      show_fim_rule_wizard: false,
      modal_mode: "create",
    };
  },
  methods: {
    createRule() {
      this.modal_mode = "create";
      this.fim_rule = {};
      this.show_fim_rule_wizard = true;
    },
    editRule(uuid) {
      this.fim_rule = this.fim_rules.find((x) => x.uuid == uuid);
      this.modal_mode = "edit";
      this.show_fim_rule_wizard = true;
    },
    enableRule(uuid) {
      this.$store.dispatch("updateFIMRule", { uuid: uuid, data: { active: true } });
    },
    disableRule(uuid) {
      this.$store.dispatch("updateFIMRule", { uuid: uuid, data: { active: false } });
    },
    deleteRule(uuid) {
        this.$store.dispatch("deleteFIMRule", { uuid: uuid });
    }
  },
};
</script>
