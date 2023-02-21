<template>
  <CRow>
    <CCol col>
      <div style="padding: 10px" v-if="userHas('create_service_account')">
        <CButton color="primary" @click="newServiceAccount()">
          New Service Account
        </CButton>
      </div>
      <CDataTable
        :fields="fields"
        :items="filtered_service_accounts"
        column-filter
        pagination
        :sorter="{ external: false, resetable: true }"
      >
        <template #organization-filter="{ item }">
          <RMultiCheck
            :items="formatted_organizations"
            @checked="set_picker_filters($event, 'organization')"
            size="sm"
          ></RMultiCheck>
        </template>
        <template #tags-filter="{ item }">
          <RMultiCheck
            :items="account_tags"
            @checked="set_picker_filters($event, 'tags')"
            size="sm"
          ></RMultiCheck>
        </template>
        <template #organization="{ item }">
          <td>
            <OrganizationBadge :uuid="item.organization" />
          </td>
        </template>
        <template #tags="{ item }">
          <td>
            <li
              style="display: inline; margin-right: 2px"
              v-for="tag in item.tags"
              :key="tag"
            >
              <CButton color="primary" size="sm" disabled>
                {{ tag }}
              </CButton>
            </li>
          </td>
        </template>
        <template #actions="{ item }">
          <td class="text-right">
            <CButton color="info" size="sm" @click="editServiceAccount(item.uuid)">
              <CIcon name="cilPencil" />
            </CButton>
            &nbsp;
            <CButton color="secondary" size="sm" @click="cloneServiceAccount(item.uuid)">
              <CIcon name="cilCopy" /> </CButton
            >&nbsp;
            <CButton color="danger" size="sm" @click="removeServiceAccount(item.uuid)">
              <CIcon name="cilTrash" />
            </CButton>
          </td>
        </template>
      </CDataTable>
    </CCol>
    <ServiceAccountWizard
      :show.sync="show_wizard"
      :service_account="service_account"
      @service-account-created="showApiKey($event)"
    />
    <CModal :show.sync="show_api_key" title="Service Account Credential">
      <CAlert color="warning">
        <strong>Warning!</strong> This is the only time you will be able to see this key.
        Please save it in a safe place.
      </CAlert>
      <pre
        class="text-white bg-dark text-left prewrap"
        style="padding: 10px; border-radius: 5px"
        id="api_key"
        >{{ api_key }}</pre
      >
      <CButton color="primary" @click="copyToClipboard()" id="copy_api_key_button"
        >Copy</CButton
      >
      <template #footer>
        <CButton color="secondary" @click="hideApiKey()">Close</CButton>
      </template>
    </CModal>
    <CModal color="danger" :show.sync="confirm_delete_modal" title="Delete Service Account">
      <CForm id="delete-service-account-form" @submit.prevent="deleteServiceAccount(service_account.uuid)">
        <p>Are you sure you want to delete <b>{{ service_account.name }}</b
        >? After removing the Service Account any processes using the accounts access token will be unable to access the system</p>
        <p>Type the name in the box below to confirm your intent.</p>
        <CForm id="delete-service-account-confirm">
          <CInput v-model="delete_confirm"  required></CInput>
        </CForm>
      </CForm>
      <template #footer>
        <CButton @click="cancelServiceAccountRemoval()" color="secondary">No</CButton>
        <CButton type="submit" form="delete-service-account-form" color="danger">Yes</CButton>
      </template>
    </CModal>
  </CRow>
</template>

<script>
import { mapState } from "vuex";
import OrganizationBadge from "./OrganizationBadge";
import RMultiCheck from "./components/MultiCheck.vue";
import ServiceAccountWizard from "./ServiceAccountWizard.vue";
export default {
  name: "ServiceAccountList",
  components: {
    OrganizationBadge,
    RMultiCheck,
    ServiceAccountWizard,
  },
  computed: {
    ...mapState(["current_user", "alert", "service_accounts", "organizations"]),
    filtered_service_accounts() {
      if (this.service_accounts.length == 0) {
        this.$store.dispatch("getServiceAccounts", {});
        this.tags = this.service_accounts.map((account) => {
          if (account.tags !== undefined && account.tags.length > 0) {
            return account.tags;
          }
        });
      }

      let accounts = [];
      if (Object.keys(this.picker_filters).length == 0) {
        return this.service_accounts;
      }
      for (let i in this.service_accounts) {
        let account = this.service_accounts[i];
        let match = true;
        for (let key in this.picker_filters) {
          if (this.picker_filters[key].length > 0) {
            if (typeof account[key] == "boolean") {
              if (!this.picker_filters[key].includes(account[key].toString())) {
                match = false;
              }
            } else if (typeof account[key] == "object") {
              if (account[key]) {
                if (!account[key].some((r) => this.picker_filters[key].includes(r))) {
                  match = false;
                }
              } else {
                match = false;
              }
            } else {
              if (!this.picker_filters[key].includes(account[key])) {
                match = false;
              }
            }
          }
        }
        if (match) {
          accounts.push(account);
        }
      }
      return accounts;
    },
    account_tags() {
      let tags = [];
      this.service_accounts.forEach((account) => {
        if (account.tags) {
          account.tags.forEach((tag) => {
            if (!tags.find((t) => t.value == tag)) {
              tags.push({ label: tag, value: tag });
            }
          });
        }
      });
      return tags;
    },
  },
  created() {
    if (this.organizations.length == 0) {
      this.$store.dispatch("getOrganizations", {}).then(() => {
        this.formatted_organizations = this.$store.getters.formatted_organizations;
      });
    } else {
      this.formatted_organizations = this.$store.getters.formatted_organizations;
    }
  },
  props: {},
  data() {
    return {
      loading: true,
      fields: [
        "name",
        "description",
        "organization",
        "tags",
        { key: "actions", filter: false },
      ],
      formatted_organizations: [],
      tags: [],
      picker_filters: {},
      show_wizard: false,
      wizard_mode: "create",
      service_account: {},
      show_api_key: false,
      api_key: "",
      delete_confirm: "",
      confirm_delete_modal: false,
    };
  },
  methods: {
    userHas(permission) {
      return this.current_user.role.permissions[permission];
    },
    set_picker_filters(val, key) {
      if (!this.picker_filters.hasOwnProperty(key)) {
        this.$set(this.picker_filters, key, []);
      }
      if (val.length == 0) {
        this.$delete(this.picker_filters, key);
      } else {
        this.$set(this.picker_filters, key, val);
      }
    },
    newServiceAccount() {
      this.service_account = {
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
        },
      };
      this.show_wizard = true;
      this.wizard_mode = "create";
      this.show_api_key = false;
      this.api_key = "";
    },
    editServiceAccount(uuid) {
      let service_account = this.service_accounts.find((sa) => sa.uuid == uuid);
      Object.assign(this.service_account, service_account);
      this.wizard_mode = "edit";
      this.show_wizard = true;
    },
    showApiKey(service_account) {
      console.log(service_account);
      this.api_key = service_account.access_token;
      this.show_api_key = true;
    },
    hideApiKey() {
      this.show_api_key = false;
      this.api_key = "";
      const copyButton = document.getElementById("copy_api_key_button");
      copyButton.textContent = "Copy!";
    },
    removeServiceAccount(uuid) {
      this.delete_confirm = ""
      this.service_account = this.service_accounts.find(
        (sa) => sa.uuid == uuid
      );
      this.confirm_delete_modal = true;
    },
    cancelServiceAccountRemoval() {
      this.confirm_delete_modal = false;
      this.service_account = {};
    },
    deleteServiceAccount() {
      if (this.delete_confirm == this.service_account.name) {
        alert('DELETING!')
      }
    },
    copyToClipboard() {
      const copyText = document.getElementById("api_key").textContent;
      const textArea = document.createElement("textarea");
      textArea.textContent = copyText;
      document.body.append(textArea);
      const copyButton = document.getElementById("copy_api_key_button");
      copyButton.textContent = "Copied!";
      textArea.select();
      document.execCommand("copy");
    },
  },
};
</script>
