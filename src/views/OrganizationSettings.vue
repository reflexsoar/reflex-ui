<template>
<CCol>
  <h2>Settings for {{mapOrgToName(uuid)}}<button type="button" class="kb" onclick="window.open('https://docs.reflexsoar.com/en/latest/organizations')"><CIcon name='cil-book' size="lg"/></button></h2><br>
  <CAlert :show.sync="alert.show" :color="alert.type" closeButton>
    {{alert.message}}
  </CAlert>
  <CCard>
    <CCardBody>    
    <CForm id="settings-form">      
      <CRow>
        <CCol col="6">
          <h4>Basic Settings</h4>
          <CInput v-model="settings.base_url" label="Base URL" v-bind:disabled="!current_user.role.permissions['set_baseurl']"/>
          <CInput v-model="settings.logon_password_attempts" label="Max Logon Attempts"/>
          <h4>Playbook Settings</h4>
          <CRow>
            <CCol col="6">
              <CInput v-model="settings.playbook_action_timeout" label="Playbook Action Timeout (seconds)"/>
            </CCol>
            <CCol col="6">
              <CInput v-model="settings.playbook_timeout" label="Playbook Action Timeout (seconds)"/>
            </CCol>
          </CRow>
          <h4>Case/Event Settings</h4>
          <CRow>
            <CCol col="6">
              <label>Require Case Templates</label><br>
              <CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="settings.require_case_templates"/><br><br>
              <label v-c-tooltip="{
                content: 'This will require users add additional details when closing a case.',
                placement: 'right'}">Require Case Closure Details</label><br>
              <CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="settings.require_case_close_comment"/><br><br>
              <label v-c-tooltip="{
                content: 'This will require users add additional details when dismissing an event.',
                placement: 'right'}">Require Event Dismiss Comment</label><br>
              <CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="settings.require_event_dismiss_comment"/><br><br>
              <CInput v-model="settings.events_page_refresh" description="Setting this too high may result in performance issues" label="Event queue refresh interval (seconds)" placeholder="60"/>
              <CSelect :value="settings.events_per_page" :options="[10,25,50,100]" label="Events per page" @change="settings.events_per_page = $event.target.value"/>
            </CCol>
            <CCol col="6">
              <label v-c-tooltip="{
                content: 'This will automatically assign a case to it\'s creator if they don\'t pick an owner.',
                placement: 'right'}">Auto-Assign Case to Creator</label><br>
                <CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="settings.assign_case_on_create"/><br><br>
                <label v-c-tooltip="{
                content: 'This will automatically assign a task to the user starting the task if one isn\'t assigned already.',
                placement: 'right'}">Auto-Assign Task to Starter</label><br>
                <CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="settings.assign_task_on_start"/><br><br>
                <label v-c-tooltip="{
                content: 'This will allow users to edit their comments, no history is maintained.',
                placement: 'right'}">Allow Comment Editing</label><br>
                <CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="settings.allow_comment_editing"/><br><br>
                <label v-c-tooltip="{
                content: 'This will allow users to delete their commends',
                placement: 'right'}">Allow Comment Deletion</label><br/>
                <CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="settings.allow_comment_deletion"/><br><br>
            </CCol>
          </CRow>
        </CCol>
        <CCol col="6">
          <h4>User Account Settings</h4>
          <label>Require MFA</label><br><CSwitch v-c-tooltip="{content: 'Coming in future release', placement: 'top'}" disabled color="success" label-on="Yes" label-off="No" v-bind:checked.sync="settings.require_mfa"/><br>
          <small class="form-text text-muted w-100">When enabled all users must configure MFA at first login.</small><br>
          <CInput v-c-tooltip="{content: 'Coming in future release', placement: 'top'}" label="Minimum Password Length" v-model="settings.minimum_password_length" placeholder="8" disabled/>
          <label>Enforce Password Complexity</label><br><CSwitch v-c-tooltip="{content: 'Coming in future release', placement: 'top'}" disabled color="success" label-on="Yes" label-off="No" v-bind:checked.sync="settings.enforce_password_complexity"/><br>
          <small class="form-text text-muted w-100">Requires passwords to contain special characters.</small><br>
          <CTextarea v-c-tooltip="{content: 'Coming in future release', placement: 'top'}" disabled label="Disallowed Keywords" rows="5" v-model="settings.disallowed_password_keywords" description="Blocks keywords from being used in new passwords.  Each keyword should be on it's own line."/>          
          <h4>Advanced Settings</h4>
          <label v-c-tooltip="{
            content: 'Only requests from IPs in the Approve IPs list will be allowed to communicate with the platform.',
            placement: 'right'}">Restrict Access to Approved IPs</label><br>
            <CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="settings.require_approved_ips"/><br>
            <small class="form-text text-danger w-100"><b>WARNING - This setting can prevent access to your console.</b></small><br>
          <CTextarea v-model="settings.approved_ips" description="Enter IP addresses in single host or CIDR format, one per line." label="Approved IPs" rows="5" placeholder="10.0.0.0/8" v-bind:disabled="!settings.require_approved_ips"/>
          <h4>Mail Settings</h4>
          <CInput v-model="settings.email_from" label="Email From" placeholder="admin@reflexsoar.com"/>
          <CInput v-model="settings.email_server" label="Email Server" placeholder="127.0.0.1:25"/>
          <CSelect :value.sync="settings.email_secret_uuid" :options="credential_list" label="Email Credentials" placeholder="Select a credential"/>
          <h4>API Settings</h4>
          <CInput v-model="settings.api_key_valid_days" description="Changing this setting will only impact new API keys" label="API Key Valid Period (days)" placeholder="366"/>
          <h4>Agent Settings</h4>
          <CInput v-model="settings.agent_pairing_token_valid_minutes" label="Agent Pairing Token Validity (minutes)" placeholder="15"/>
          <CButton color="danger" @click="persistentTokenModal()">Generate Peristent Pairing Token</CButton>
        </CCol>
      </CRow>
      <CRow>
        <CCol col="12" class="text-right">
          <CButton color="primary" @click="updateSettings()">Save</CButton>
        </CCol>
      </CRow>
    </CForm>
    <CModal title="Persistent Pairing Token" color="danger" :centered="true" size="lg" :show.sync="generate_modal">
      <CForm id="confirmPairingConfirm" @submit.prevent="deleteUser(user.uuid)">
        <p>Are you sure you want to generate a persistent pairing token?</p>
        <p>Persistent pairing tokens never expire, at which point they can be used to register new agents and agents have significant permissions.</p>
        <p><b>WARNING</b>: If you already have a persistent pairing token, generating a new one will invalidate the old one.</p>
        <p><center v-if="confirm_generate"><b>Pairing Token</b><br>{{persistent_pairing_token}}</center></p>
        </CForm>
      </CForm>
      <template #footer>
        <CButton v-if="!confirm_generate" @click="dismiss()" color="secondary">No</CButton>
        <CButton v-if="!confirm_generate" @click="generateToken()" color="danger">Yes</CButton>
        <CButton v-if="confirm_generate" @click="dismiss()" color="success">Finish</CButton>
      </template>
    </CModal>
  </CCardBody>
  </CCard>
  </CCol>
</template>

<style scoped>
h4 {
  padding-bottom: 10px;
  border-bottom: 1px dotted #cfcfcf;
}
</style>

<script>
import { mapState } from "vuex"
export default {
  name: "OrganizationSettings",
  data() {
    return {
      uuid: this.$route.params.uuid,
      persistent_pairing_token: "",
      confirm_generate: false,
      generate_modal: false,
      settings: {}
    };
  },
  created(){
    this.$store.dispatch('getSettings', {uuid: this.uuid, store: false}).then(resp => {
        this.settings = resp.data
        this.$store.dispatch('getCredentialList', this.uuid)
    })
  },
  computed: mapState(['current_user', 'organizations', 'credential_list', 'alert']),
  methods: {
    mapOrgToName(uuid) {
      let org = this.$store.getters.organizations.filter(o => o.uuid === uuid)
      if (org.length > 0) {
        return org[0].name
      } else {
        return "Unknown"
      }
    },
    persistentTokenModal() {
      this.generate_modal = true
    },
    generateToken() {
      this.$store.dispatch('getPersistentPairingToken', this.uuid).then(resp => {
        this.persistent_pairing_token = resp.data.token
        this.confirm_generate = true
      })
    },
    loadData() {
      
      
    },
    dismiss(){
      this.generate_modal = false;
      this.persistent_pairing_token = "";
      this.confirm_generate = false;
    },
    updateSettings() {
      let settings = this.settings
      this.settings['organization'] = this.uuid
      if(this.settings.agent_pairing_token_valid_minutes > 365) {
        this.$store.commit('show_alert', {'message': 'Pairing tokens can not exceed 1 year in validity.', 'type':'danger'})
        return
      }
      this.$store.commit('clear_alert')
      this.$store.dispatch('updateSettings', settings)
    }
  },
};
</script>