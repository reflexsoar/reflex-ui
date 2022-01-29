<template>
  <CRow>
    
    <CCol col>
      <h1>Credentials<button type="button" aria-label="Close" class="close" onclick="window.open('https://github.com/reflexsoar/reflex-docs/blob/main/credentials/index.md')"><CIcon name='cil-book' size="lg"/></button></h1><br>
      <CButton color="primary" @click="newCredential()">New Credential</CButton><br /><br />
      <CAlert :show.sync="alert.show" :color="alert.type" closeButton>
        {{alert.message}}
      </CAlert>   
      <CCard>
        <CCardHeader>
          <b>Credentials</b>
        </CCardHeader>
        <CCardBody>
          <CDataTable
            :hover="hover"
            :striped="striped"
            :bordered="bordered"
            :small="small"
            :fixed="fixed"
            :items="credentials"
            :fields="fields"
            :items-per-page="small ? 25 : 10"
            :dark="dark"
            :sorter="{ external: true, resetable: true }"
            pagination
          >
            <template #name="{ item }">
              <td>
                <b>{{ item.name }}</b>
              </td>
            </template>
            <template #organization="{item}">
              <td>
                <CButton class="tag" size="lg" color="secondary">{{mapOrgToName(item.organization)}}</CButton>
              </td>
            </template>
            <template #actions="{ item }">
              <td class="text-right" style="width:10%">
                <CButton color="primary" size="sm" @click="getCredentialDetails(item.uuid)">Edit</CButton>&nbsp;
                <CButton color="danger" size="sm" @click="removeCredential(item.uuid)">Delete</CButton>
              </td>
            </template>
          </CDataTable>
        </CCardBody>
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
        <CSelect label="Organization" placeholder="Select an organization" v-if="current_user.default_org" :value.sync="credential_data.organization" :options="organizations"/>
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
          rows=3,
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
    <CModal title="Delete Credential" :closeOnBackdrop="false" color="danger" :centered="true" :show.sync="delete_modal">
      <CForm id="deleteForm" @submit.prevent="deleteCredential(credential_data.uuid)">
        <p>Are you sure you want to delete <b>{{credential_data.name}}</b>?   Any plugin, or input using this credential will stop working.</p>
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
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "Credentials",
  props: {
    items: Array,
    fields: {
      type: Array,
      default() {
        return ["name", "description", "actions"];
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
    dark: Boolean
  },
  created() {
    this.$store.dispatch("getCredentials");
    if(this.current_user.default_org) {
      if (!this.fields.includes('organization')) {
        this.fields.splice(1,0,'organization')
        this.$store.dispatch('getOrganizations').then(resp => {
          this.organizations = this.$store.getters.organizations.map((o) => { return {label: o.name, value: o.uuid}})
        })
      }      
    }
  },
  computed: mapState(["credentials", "alert","current_user"]),
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
        organization: ""
      },
      modal_title: "New Credential",
      modal_action: this.createCredential,
      modal_submit_text: "Create",
      modal_status: false,
      error: false,
      error_message:"",
      organization: "",
      organizations: []
    };
  },
  methods: {
    mapOrgToName(uuid) {
      let org = this.$store.getters.organizations.filter(o => o.uuid === uuid)
      if (org.length > 0) {
        return org[0].name
      } else {
        return "Unknown"
      }
    },
    dismiss() {
      this.modal_status = false

    },
    dismiss_delete() {
      this.delete_modal = false
      this.delete_confirm = ""
    },
    removeCredential(uuid) {
      this.credential_data = this.credentials.find(c => c.uuid == uuid)
      this.delete_confirm = ""
      this.delete_modal = true
    },
    deleteCredential() {
      let uuid = this.credential_data.uuid
      if(this.credential_data.name == this.delete_confirm) {
        this.$store.dispatch('deleteCredential', uuid).then(resp => {
          this.delete_modal = false
        })
      } else {
        this.delete_error = "Error: Entered name does not match credential name."
      }
    },
    newCredential() {
      this.modal_title = "New Credential"
      this.modal_submit_text = "Create"
      this.modal_action = this.createCredential
      this.modal_status = true
      this.credential_data = {
        name: "",
        username: "",
        secret: "",
        description: ""
      }
    },
    getCredentialDetails(uuid) {
      this.credential_data = {}
      Object.assign(this.credential_data, this.credentials.find(c => c.uuid == uuid))
      this.modal_title = "Edit Credential"
      this.modal_submit_text = "Edit"
      this.modal_action = this.editCredential
      this.modal_status = true
      
    },
    createCredential() {
      let credential = this.credential_data
      this.$store.dispatch('createCredential', credential).then(resp => {
        this.modal_status = false
      })
    },
    editCredential() {
      let uuid = this.credential_data.uuid
      let credential = {
        name: this.credential_data.name,
        description: this.credential_data.description,
        username: this.credential_data.username,
        organization: this.credential_data.organization
      }
      if (this.credential_data.secret != "") {
        credential.secret = this.credential_data.secret
      }
      this.$store.dispatch('updateCredential', {uuid, credential}).then(resp => {
        this.credential = this.$store.getters.credential
        this.modal_status = false
      })
    },
    addSuccess: function () {
      if (this.$store.getters.addSuccess == "success") {
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>
