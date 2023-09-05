<template>
  <div>
    <CRow class="page-heading page-heading-row page-heading-no-nav">
      <CCol>
        <h1>Credential Management<button
          type="button"
          class="kb"
          onclick="window.open('https://docs.reflexsoar.com/en/latest/credentials')"
        >
          <CIcon name="cil-book" size="lg" />
        </button>
      </h1>
      </CCol>
    </CRow>
  <CRow>
    <CCol col>
      
      <CRow class="page-sub-header page-header-row">
        <CCol>
          <h2>Credentials</h2>
        </CCol>
        <CCol class="text-right">
          <CButton color="primary" @click="newCredential()">New Credential</CButton>
        </CCol>
      </CRow>
      <CAlert :show.sync="alert.show" :color="alert.type" closeButton>
        {{ alert.message }}
      </CAlert>
      <CCard>
        <CDataTable
          :hover="hover"
          :items="filtered_credentials"
          :fields="fields"
          :items-per-page="small ? 25 : 10"
          pagination
          column-filter
          :sorter="{ external: false, resetable: true }"
        >
          <template #organization-filter="{ item }">
            <RMultiCheck
              :items="organizations"
              @checked="set_picker_filters($event, 'organization')"
              size="sm"
            ></RMultiCheck>
          </template>
          <template #name="{ item }">
            <td>
              <b>{{ item.name }}</b>
            </td>
          </template>
          <template #organization="{ item }">
            <td>
              <OrganizationBadge :uuid="item.organization" />
            </td>
          </template>
          <template #actions="{ item }">
            <td class="text-right" style="width: 10%">
              <CButton color="info" size="sm" @click="getCredentialDetails(item.uuid)"
                ><CIcon name="cilPencil" /></CButton
              >&nbsp;
              <CButton color="danger" size="sm" @click="removeCredential(item.uuid)"
                ><CIcon name="cilTrash"
              /></CButton>
            </td>
          </template>
        </CDataTable>
      </CCard>
    </CCol>
    <CModal
      :title="modal_title"
      :centered="true"
      size="lg"
      :show.sync="modal_status"
      :closeOnBackdrop="false"
    >
      <CAlert :show.sync="this.error" color="danger" closeButton>
        {{ error_message }}
      </CAlert>
      <CForm name="credentialForm" id="credentialForm" @submit.prevent="modal_action">
        <CSelect
          label="Organization"
          placeholder="Select an organization"
          v-if="current_user.default_org"
          :value.sync="credential_data.organization"
          :options="organizations"
        />
        <CInput
          placeholder="Credential Name"
          required
          v-model="credential_data.name"
          label="Name"
        >
        </CInput>
        <CRow>
          <CCol>
            <CInput
              placeholder="Username"
              required
              v-model="credential_data.username"
              label="Username"
            >
            </CInput>
          </CCol>
          <CCol>
            <CInput
              placeholder="A secret"
              v-bind:required="modal_title == 'Create Credential'"
              type="password"
              autocomplete="current-password"
              v-model="credential_data.secret"
              label="Secret"
            >
            </CInput>
          </CCol>
        </CRow>
        <CTextarea
          placeholder="Enter a description for the credential.  The more detail the better."
          required
          v-model="credential_data.description"
          rows="3,"
          label="Description"
        >
          <template #prepend-content><CIcon name="cil-description" /></template>
        </CTextarea>
      </CForm>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
        <CButton type="submit" form="credentialForm" color="primary">{{
          modal_submit_text
        }}</CButton>
      </template>
    </CModal>
    <CModal
      title="Delete Credential"
      :closeOnBackdrop="false"
      color="danger"
      :centered="true"
      :show.sync="delete_modal"
    >
      <CForm id="deleteForm" @submit.prevent="deleteCredential(credential_data.uuid)">
        <p>
          Are you sure you want to delete <b>{{ credential_data.name }}</b
          >? Any plugin, or input using this credential will stop working.
        </p>
        <CForm id="delete-credential-confirm">
          <CInput
            v-model="delete_confirm"
            label="Credential Name"
            v-bind:description="delete_error"
            required
          ></CInput>
        </CForm>
      </CForm>
      <template #footer>
        <CButton @click="dismiss_delete()" color="secondary">No</CButton>
        <CButton type="submit" form="deleteForm" color="danger">Yes</CButton>
      </template>
    </CModal>
  </CRow>
  </div>
</template>

<script>
import { mapState } from "vuex";
import OrganizationBadge from "./OrganizationBadge";
import RMultiCheck from "./components/MultiCheck";
export default {
  name: "Credentials",
  components: {
    OrganizationBadge,
    RMultiCheck,
  },
  props: {
    items: Array,
    fields: {
      type: Array,
      default() {
        return [
          "name",
          { key: "description", sorter: false },
          { key: "actions", filter: false },
        ];
      },
    },
    caption: {
      type: String,
      default: "Table",
    },
    hover: Boolean,
    striped: Boolean,
    bordered: Boolean,
    small: Boolean,
    fixed: Boolean,
    dark: Boolean,
  },
  created() {
    this.$store.dispatch("getCredentials", {});
    if (this.current_user.default_org) {
      if (!this.fields.includes("organization")) {
        this.fields.splice(1, 0, {
          key: "organization",
          sorter: false,
          filterable: false,
        });
        this.$store.dispatch("getOrganizations", {}).then((resp) => {
          this.organizations = this.$store.getters.organizations.map((o) => {
            return { label: o.name, value: o.uuid };
          });
        });
      }
    }
  },
  computed: {
    ...mapState(["credentials", "alert", "current_user", "pagination"]),
    filtered_credentials() {
      let credentials = [];
      if (Object.keys(this.picker_filters).length == 0) {
        return this.credentials;
      }
      for (let i in this.credentials) {
        let credential = this.credentials[i];
        let match = true;
        for (let key in this.picker_filters) {
          if (this.picker_filters[key].length > 0) {
            if (!this.picker_filters[key].includes(credential[key])) {
              match = false;
            }
          }
        }
        if (match) {
          credentials.push(credential);
        }
      }
      return credentials;
    },
  },
  data() {
    return {
      name: "",
      description: "",
      username: "",
      secret: "",
      delete_confirm: "",
      delete_modal: false,
      delete_error: "",
      credential_data: {
        uuid: "",
        name: "",
        username: "",
        secret: "",
        description: "",
        organization: "",
      },
      modal_title: "New Credential",
      modal_action: this.createCredential,
      modal_submit_text: "Create",
      modal_status: false,
      error: false,
      error_message: "",
      organization: "",
      organizations: [],
      active_page: 1,
      picker_filters: {},
    };
  },
  watch: {
    active_page: function () {
      this.reloadCredentials(this.active_page);
    },
  },
  methods: {
    sort(event) {
      let sort_direction = event.asc ? "asc" : "desc";
      event.column = event.column ? event.column : "created_at";
      this.reloadCredentials(this.active_page, event.column, sort_direction);
    },
    reloadCredentials(page, sort_by, sort_direction) {
      this.loading = true;
      this.$store
        .dispatch("getCredentials", {
          page_size: 10000,
          page: page,
          sort_by: sort_by,
          sort_direction: sort_direction,
        })
        .then(() => {
          this.loading = false;
        });
    },
    mapOrgToName(uuid) {
      let org = this.$store.getters.organizations.filter((o) => o.uuid === uuid);
      if (org.length > 0) {
        return org[0].name;
      } else {
        return "Unknown";
      }
    },
    dismiss() {
      this.modal_status = false;
    },
    dismiss_delete() {
      this.delete_modal = false;
      this.delete_confirm = "";
    },
    removeCredential(uuid) {
      this.credential_data = this.credentials.find((c) => c.uuid == uuid);
      this.delete_confirm = "";
      this.delete_modal = true;
    },
    deleteCredential() {
      let uuid = this.credential_data.uuid;
      if (this.credential_data.name == this.delete_confirm) {
        this.$store.dispatch("deleteCredential", uuid).then((resp) => {
          this.delete_modal = false;
        });
      } else {
        this.delete_error = "Error: Entered name does not match credential name.";
      }
    },
    newCredential() {
      this.modal_title = "New Credential";
      this.modal_submit_text = "Create";
      this.modal_action = this.createCredential;
      this.modal_status = true;
      this.credential_data = {
        name: "",
        username: "",
        secret: "",
        description: "",
      };
    },
    getCredentialDetails(uuid) {
      this.credential_data = {};
      Object.assign(
        this.credential_data,
        this.credentials.find((c) => c.uuid == uuid)
      );
      this.modal_title = "Edit Credential";
      this.modal_submit_text = "Edit";
      this.modal_action = this.editCredential;
      this.modal_status = true;
    },
    createCredential() {
      let credential = this.credential_data;
      this.$store.dispatch("createCredential", credential).then((resp) => {
        this.modal_status = false;
      });
    },
    editCredential() {
      let uuid = this.credential_data.uuid;
      let credential = {
        name: this.credential_data.name,
        description: this.credential_data.description,
        username: this.credential_data.username,
        organization: this.credential_data.organization,
      };
      if (this.credential_data.secret != "") {
        credential.secret = this.credential_data.secret;
      }
      this.$store.dispatch("updateCredential", { uuid, credential }).then((resp) => {
        this.credential = this.$store.getters.credential;
        this.modal_status = false;
      });
    },
    addSuccess: function () {
      if (this.$store.getters.addSuccess == "success") {
        return true;
      } else {
        return false;
      }
    },

    set_picker_filters(val, key) {
      if (!this.picker_filters.hasOwnProperty(key)) {
        this.$delete(this.picker_filters, key);
      }
      if (val.length == 0) {
        this.$set(this.picker_filters, key, []);
      } else {
        this.$set(this.picker_filters, key, val);
      }
    },
  },
};
</script>
