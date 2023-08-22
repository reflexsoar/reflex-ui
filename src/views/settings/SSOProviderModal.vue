<template>
  <CModal :centered="false" size="xl" :show.sync="show">
  <link rel="stylesheet" href="https://unpkg.com/vue-multiselect/dist/vue-multiselect.min.css">
    <template #header>
      <h5 class="modal-title" style="text-transform: capitalize">{{ mode }} SSO Provider</h5>
    </template>
    <CAlert :show.sync="error" color="danger">
      {{ error_message }}
      </CAlert>
    <CTabs
      :fade="false"
      variant="pills"
      :activeTab.sync="step"
      :vertical="{ navs: 'col-md-2', content: 'col-md-10' }"
    >
      <CTab title="Overview">
        <h5>SSO Providers</h5>
        <p>
          SSO Providers are used to configure Single Sign-On for your organization.
          Each provider can be configured to use a different Identity Provider.  The provider that is 
          used for authentication is determined by the domain name of the user's email address. If
          more than one provider exists for a domain, the provider that was created first will be used.
        </p>
      </CTab>
      <CTab title="Provider Details">
        <h5>Provider Details</h5>
        <CRow>
          <CCol>
            <CInput label="Provider Name" v-model="name" description="A name to identify this provider" placeholder="Microsoft Azure" required/>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <CTextarea label="Description" v-model="description" description="Additional details about this provider.  Example the name of the IdP administrator or cert expiration dates, etc." rows=5 />
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <label>Logon Domains<br></label>
            <multiselect
              v-model="logon_domains"
              :options="logon_domain_options"
              @tag="addLogonDomain"
              @remove="removeLogonDomain"
              :multiple="true"
              :close-on-select="false"
              :placeholder="'Select Logon Domains'"
              :taggable="true"
              /><small class="text-muted">The logon domains determine which provider is used when a user attempts Single Sign-On.</small>
          </CCol>
        </CRow>
      </CTab>
      <CTab title="Identity Provider">
        <h5>Identity Provider Settings</h5>
        <CRow>
          <CCol>
            <CInput label="Entity ID" v-model="idp_entity_id" description="The Entity ID as provided by your IdP" placeholder="Example https://sts.windows.net/88af590a-ca11-46b1-9bb1-39fb5d5d161d/" required/>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <CInput label="Sign On URL" v-model="idp_signon_url" description="The URL to redirect users to to complete IdP authentication" placeholder="Example https://login.microsoftonline.com/88af590a-ca11-46b1-9bb1-39fb5d5d161d/saml2" required/>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <CInput label="Sign Out URL" v-model="idp_signout_url" description="The URL to redirect users to on logout" placeholder="Example https://login.microsoftonline.com/88af590a-ca11-46b1-9bb1-39fb5d5d161d/saml2" />
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <CTextarea rows="6" label="Certificate" v-model="idp_certificate" description="The CER encoded Certificate from the IdP" :placeholder="cert_placeholder" required/>
          </CCol>
          {{idp_certificate}}
        </CRow>
      </CTab>
      <CTab title="User Provisioning">
        <h5>Automatic User Provisioning</h5>
        <p>Automatic User Provisioning allows for the automatic creation of users in the system when they authenticate
          with the IdP.  If a user authenticates with an attribute that is mapped to a role, the user will be assigned that role.
          If the user matches none of the mappings, the user will be assigned the default role
          </p>
          <p>
          <ul>
            <li><b>Enabled</b>: If enabled, users will be automatically created in the system when they authenticate with the IdP.</li>
            <li><b>Default Role</b>: The role that will be assigned to the user if the mapping is applied.</li>
          </ul>
          </p>
        <CRow>
          <CCol col=3>
            <label>Auto Provision Users</label><br>
            <CSwitch :checked.sync="auto_provision" label-on="Yes" label-off="No" color="success"/>
          </CCol>
          <CCol>
            <CSelect v-bind:disabled="!auto_provision" label="Default Role" :value.sync="default_role" :options="roles.map(role => { return {label: role.name, value: role.uuid}})" required/>
          </CCol>
        </CRow>
      </CTab>
      <CTab title="Advanced"> </CTab>
    </CTabs>
    <template #footer>
      <CRow>
        <CCol class="text-right">
          <CButton color="secondary" @click="dismiss">Cancel</CButton>&nbsp;
          <CButton v-if="mode == 'create'" color="primary" @click="createProvider"
            >Create</CButton
          >
          <CButton v-if="mode == 'edit'" color="primary" @click="updateProvider"
            >Update</CButton
          >
        </CCol>
      </CRow>
    </template>
  </CModal>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "SSOProviderModal",
  props: {
    show: Boolean,
    provider: {
      type: Object,
      default: () => {},
    },
    mode: {
      type: String,
      default: "create",
    },
  },
  computed: {
    ...mapState(["roles"]),
  },
  watch: {
    show: function () {
      this.$emit("update:show", this.show);
      if(this.show) {
        this.getUserRoles();
      }
    },
  },
  data() {
    return {
      loading: false,
      error: false,
      error_message: "",
      name: "",
      description: "",
      idp_entity_id: "",
      idp_signon_url: "",
      idp_signout_url: "",
      idp_certificate: "",
      logon_domains: [],
      logon_domain_options: [],
      auto_provision: false,
      default_role: "",
      step: 0,
      cert_placeholder: `-----BEGIN CERTIFICATE-----
CERTIFICATE DATA HERE
-----END CERTIFICATE-----`,
    };
  },
  methods: {
    closeModal() {
      this.reset()
      this.$emit("update:show", false);
    },
    getUserRoles() {
      this.$store
        .dispatch("getRoles", {})
    },
    addLogonDomain(domain) {
      if(!this.logon_domains.includes(domain)) {
        this.logon_domains.push(domain);
        this.logon_domain_options.push(domain)
      }
    },
    removeLogonDomain(domain) {
      this.logon_domains = this.logon_domains.filter(d => d != domain);
    },
    reset() {
      this.name = "";
      this.description = "";
      this.idp_entity_id = "";
      this.idp_signon_url = "";
      this.idp_signout_url = "";
      this.idp_certificate = "";
      this.logon_domains = [];
      this.auto_provision = false;
      this.default_role = "";
      this.step = 0;
      this.error = false;
      this.error_message = "";
    },
    createProvider() {
      let payload = {
        name: this.name,
        description: this.description,
        idp_cert: this.idp_certificate,
        idp_entity_id: this.idp_entity_id,
        idp_signon_url: this.idp_signon_url,
        idp_signout_url: this.idp_signout_url,
        idp_certificate: this.idp_certificate,
        logon_domains: this.logon_domains,
        auto_provision: this.auto_provision,
        default_role: this.default_role,
      }
      this.$store.dispatch("createSSOProvider", payload).then(resp => {
        this.closeModal();
      }).catch(err => {
        console.log(err);
      })
      
    },
    updateProvider() {
      console.log("edit");
      this.closeModal();
    },
    dismiss() {
      console.log("dismiss");
      this.closeModal();
    },
  },
};
</script>
