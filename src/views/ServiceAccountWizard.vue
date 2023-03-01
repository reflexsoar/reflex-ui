<template>
  <CModal size="xl" :closeOnBackdrop="false" :centered="true" :show.sync="modalStatus">
    <template #header>
      <h5>
        {{ modal_mode == "create" ? "Create Service Account" : "Edit Service Account" }}
      </h5>
      <span class="text-right">
        <button type="button" aria-label="Close" class="close" @click="dismiss()">
          ×
        </button>
        <button
          type="button"
          class="kb"
          onclick="window.open('https://docs.reflexsoar.com/en/latest/users/creating-a-service-account/')"
        >
          <CIcon name="cil-book" size="lg" />
        </button>
      </span>
    </template>
    <h3>Service Account Details</h3>
    <CSelect
      v-if="current_user.default_org"
      label="Parent Organization"
      :options="formatted_organizations"
      :value.sync="service_account.organization"
    />
    <RMultiCheck
      label="Organization Scope"
      :items="formatted_organizations"
      :value.sync="service_account.organization_scope"
    />
    <CInput
      label="Service Account Name"
      placeholder="Enter a name for this Service Account"
      :value.sync="service_account.name"
    />
    <CTextarea
      rows="3"
      label="Description"
      placeholder="Enter a description for the Service Acccount so it is understood what it is used for"
      :value.sync="service_account.description"
    />
    <h3>Service Account Permissions</h3>
    <div v-if="service_account.permissions">
      <CListGroup>
        <CListGroupItem
          v-for="(permissions, category) in filteredPermissionMap"
          :key="category"
        >
          <b style="cursor: pointer" @click="toggleCollapse(category)"
            ><CIcon name="cilMinus" v-if="collapseStatus(category)" /><CIcon
              v-else
              name="cilPlus"
            />&nbsp;{{ category }}</b
          >
          ({{ activePermissions(category) }})
          <CCollapse :show="collapseStatus(category)"
            ><br />
            <CCol>
              <CRow>
                <CCol col="3" v-for="permission in permissions" :key="permission">
                  <label style="text-transform: capitalize">{{
                    permission.replaceAll("_", " ")
                  }}</label
                  ><br />
                  <CSwitch
                    :checked.sync="service_account.permissions[permission]"
                    label-on="Yes"
                    label-off="No"
                    color="success"
                  ></CSwitch
                  ><br /><br />
                </CCol>
              </CRow>
            </CCol>
          </CCollapse>
        </CListGroupItem>
      </CListGroup>
    </div>
    <template #footer>
      <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
      <CButton
        v-if="modal_mode === 'edit'"
        @click="updateServiceAccount()"
        color="primary"
        >Edit</CButton
      >
      <CButton
        v-if="modal_mode === 'create'"
        @click="createServiceAccount()"
        color="primary"
        >Create</CButton
      >
    </template>
  </CModal>
</template>

<script>
import { mapState } from "vuex";
import RMultiCheck from "./components/MultiCheck.vue";

export default {
  name: "ServiceAccountWizard",
  components: {
    RMultiCheck,
  },
  computed: {
    ...mapState(["current_user", "organizations"]),
    formatted_organizations() {
      return this.organizations.map((org) => {
        return {
          value: org.uuid,
          label: org.name,
        };
      });
    },
    filteredPermissionMap() {
      if (
        this.service_account.organization === this.current_user.organization &&
        this.current_user.default_org
      ) {
        return this.permission_map;
      } else {
        return Object.fromEntries(
          Object.entries(this.permission_map).filter(([key]) => key !== "Organizations")
        );
        //return this.permission_map.filter(category => category !== "Organizations")
      }
    },
  },
  watch: {
    show: function () {
      this.modalStatus = this.show;
      if (this.modalStatus) {
        if (!this.formatted_organizations || this.formatted_organizations.length == 0) {
          this.$store.dispatch("getOrganizations", {});
        }
      }
    },
  },
  props: {
    show: Boolean,
    modal_mode: {
      type: String,
      default: "create",
    },
    service_account: {
      type: Object,
      default: function () {
        return {
          name: "",
          description: "",
          organization: "",
          organization_scope: [],
          permissions: {
            add_user: false,
            update_user: false,
            delete_user: false,
            add_user_to_role: false,
            remove_user_from_role: false,
            reset_user_password: false,
            unlock_user: false,
            view_users: false,
            add_role: false,
            update_role: false,
            delete_role: false,
            set_role_permissions: false,
            view_roles: false,
            create_user_group: false,
            view_user_groups: false,
            update_user_groups: false,
            delete_user_group: false,
            add_event: false,
            view_events: false,
            view_case_events: false,
            update_event: false,
            delete_event: false,
            create_event_rule: false,
            view_event_rules: false,
            update_event_rule: false,
            delete_event_rule: false,
            add_observable: false,
            update_observable: false,
            delete_observable: false,
            add_tag_to_observable: false,
            remove_tag_from_observable: false,
            add_playbook: false,
            update_playbook: false,
            delete_playbook: false,
            view_playbooks: false,
            add_tag_to_playbook: false,
            remove_tag_from_playbook: false,
            add_agent: false,
            view_agents: false,
            update_agent: false,
            delete_agent: false,
            pair_agent: false,
            add_agent_group: false,
            view_agent_groups: false,
            update_agent_group: false,
            delete_agent_group: false,
            add_input: false,
            view_inputs: false,
            update_input: false,
            delete_input: false,
            add_tag: false,
            update_tag: false,
            delete_tag: false,
            view_tags: false,
            create_case: false,
            view_cases: false,
            update_case: false,
            delete_case: false,
            upload_case_files: false,
            view_case_files: false,
            delete_case_files: false,
            create_case_task: false,
            view_case_tasks: false,
            update_case_task: false,
            delete_case_task: false,
            create_case_template: false,
            view_case_templates: false,
            update_case_template: false,
            delete_case_template: false,
            create_case_template_task: false,
            view_case_template_tasks: false,
            update_case_template_task: false,
            delete_case_template_task: false,
            create_case_comment: false,
            view_case_comments: false,
            update_case_comment: false,
            delete_case_comment: false,
            create_case_status: false,
            update_case_status: false,
            delete_case_status: false,
            create_close_reason: false,
            update_close_reason: false,
            delete_close_reason: false,
            view_plugins: false,
            create_plugin: false,
            delete_plugin: false,
            update_plugin: false,
            add_credential: false,
            update_credential: false,
            decrypt_credential: false,
            delete_credential: false,
            view_credentials: false,
            add_organization: false,
            view_organizatons: false,
            update_organization: false,
            delete_organization: false,
            add_list: false,
            update_list: false,
            view_lists: false,
            delete_list: false,
            create_data_type: false,
            update_data_type: false,
            update_settings: false,
            view_settings: false,
            create_detection: false,
            update_detection: false,
            view_detections: false,
            delete_detection: false,
            create_notification_channel: false,
            view_notification_channels: false,
            update_notification_channel: false,
            delete_notification_channel: false,
            view_notifications: false,
            create_persistent_pairing_token: false,
            user_api: false,
            create_asset: false,
            view_assets: false,
            update_asset: false,
            delete_asset: false
          },
        };
      },
    },
  },
  data() {
    return {
      permissions: {},
      modalStatus: false,

      permission_map: {
        "User Administration": [
          "add_user",
          "update_user",
          "delete_user",
          "add_user_to_role",
          "remove_user_from_role",
          "reset_user_password",
          "unlock_user",
          "view_users",
        ],
        "Role Administration": [
          "add_role",
          "update_role",
          "delete_role",
          "set_role_permissions",
          "view_roles",
        ],
        "User Groups": [
          "create_user_group",
          "view_user_groups",
          "update_user_groups",
          "delete_user_group",
        ],
        Events: [
          "add_event",
          "view_events",
          "view_case_events",
          "update_event",
          "delete_event",
        ],
        "Event Rules": [
          "create_event_rule",
          "view_event_rules",
          "update_event_rule",
          "delete_event_rule",
        ],
        Observables: [
          "add_observable",
          "update_observable",
          "delete_observable",
          "add_tag_to_observable",
          "remove_tag_from_observable",
        ],
        Detections: [
          "create_detection",
          "update_detection",
          "view_detections",
          "delete_detection",
        ],
        Notifications: [
          "create_notification_channel",
          "view_notification_channels",
          "update_notification_channel",
          "delete_notification_channel",
          "view_notifications",
        ],
        /*"Playbooks": [
          'add_playbook',
          'update_playbook',
          'delete_playbook',
          'view_playbooks',
          'add_tag_to_playbook',
          'remove_tag_from_playbook',
        ],*/
        Agents: [
          "add_agent",
          "view_agents",
          "update_agent",
          "delete_agent",
          "pair_agent",
          "add_agent_group",
          "view_agent_groups",
          "update_agent_group",
          "delete_agent_group",
        ],
        Inputs: ["add_input", "view_inputs", "update_input", "delete_input"],
        "Case Management": [
          "create_case",
          "view_cases",
          "update_case",
          "delete_case",
          "upload_case_files",
          "view_case_files",
          "delete_case_files",
          "create_case_task",
          "view_case_tasks",
          "update_case_task",
          "delete_case_task",
          "create_case_template",
          "view_case_templates",
          "update_case_template",
          "delete_case_template",
          "create_case_template_task",
          "view_case_template_tasks",
          "update_case_template_task",
          "delete_case_template_task",
          "create_case_comment",
          "view_case_comments",
          "update_case_comment",
          "delete_case_comment",
          "create_case_status",
          "update_case_status",
          "delete_case_status",
        ],
        "Asset Management": [
          "create_asset",
          "view_assets",
          "update_asset",
          "delete_asset"
        ],
        /*"Closure Reasons": [
          'create_close_reason',
          'update_close_reason',
          'delete_close_reason',
        ],*/
        /*"Plugins": [
          'view_plugins',
          'create_plugin',
          'delete_plugin',
          'update_plugin',
        ],*/
        Credentials: [
          "add_credential",
          "update_credential",
          "decrypt_credential",
          "delete_credential",
          "view_credentials",
        ],
        Organizations: [
          "add_organization",
          "view_organizations",
          "update_organization",
          "delete_organization",
        ],
        "Intel Lists": ["add_list", "update_list", "view_lists", "delete_list"],
        "Data Types": ["create_data_type", "update_data_type"],
        Settings: ["update_settings", "view_settings", "create_persistent_pairing_token"],
        API: ["use_api"],
      },
      collapse: {
        Settings: false,
        "User Administration": false,
        "Role Administration": false,
        "User Groups": false,
        Events: false,
        "Event Rules": false,
        Observables: false,
        Detections: false,
        Notifications: false,
        Agents: false,
        Inputs: false,
        "Case Management": false,
        Credentials: false,
        Organizations: false,
        "Intel Lists": false,
        "Data Types": false,
        Settings: false,
        'Asset Management': false,
        API: false,
      },
    };
  },
  methods: {
    dismiss() {
      this.modalStatus = false;
      this.$emit("update:show", this.modalStatus);
    },
    toggleCollapse(category) {
      this.$set(this.collapse, category, !this.collapse[category]);
      for (let c in this.collapse) {
        if (c != category && this.collapse[c]) {
          this.$set(this.collapse, c, false);
        }
      }
    },
    collapseStatus(category) {
      return this.collapse[category];
    },
    activePermissions(category) {
      let permissions = this.filteredPermissionMap[category];
      let total_permissions = permissions.length;
      let active = 0;
      for (let p in Object.keys(this.service_account.permissions)) {
        let permission = Object.keys(this.service_account.permissions)[p];
        if (permissions.includes(permission)) {
          if (
            this.service_account.permissions[permission] != null &&
            this.service_account.permissions[permission] == true
          ) {
            active++;
          }
        }
      }
      return active.toString() + " of " + total_permissions.toString();
    },
    createServiceAccount() {
      this.$store
        .dispatch("createServiceAccount", this.service_account)
        .then((resp) => {
          this.$emit("service-account-created", resp.data);
          this.dismiss();
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>
