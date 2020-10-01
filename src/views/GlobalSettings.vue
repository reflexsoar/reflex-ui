<template>
  <CCardBody>
    <CForm id="settings-form">
      <CRow>
        <CCol col="6">
          <h4>Basic Settings</h4>
          <CInput v-model="settings.base_url" label="Base URL" v-bind:disabled="!current_user.permissions['set_baseurl']"/>
          <CInput v-model="settings.logon_password_attempts" label="Max Logon Attempts"/>
          

          <label>Allow Comment Deletion</label><br/>
          <CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="settings.allow_comment_deletion"/><br><br>

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
          <label>Require Case Templates</label><br>
          <CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="settings.require_case_templates"/><br><br>
          <label v-c-tooltip="{
            content: 'This will require users to add additional details when closing a case.',
            placement: 'right'}">Require Case Closure Details</label><br>
          <CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="settings.require_case_close_comment"/><br><br>
          <label v-c-tooltip="{
            content: 'This will require users to add additional details when dismissing an event.',
            placement: 'right'}">Require Event Dismiss Comment</label><br>
          <CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="settings.require_event_dismiss_comment"/><br><br>
        </CCol>
        <CCol col="6">
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
</template>

<script>
import { vSelect } from "vue-select";
import { mapState } from "vuex"
export default {
  name: "GlobalSettings",
  data() {
    return {
      persistent_pairing_token: "",
      confirm_generate: false,
      generate_modal: false
    };
  },
  created(){
    this.loadData()
    
  },
  computed: mapState(['current_user', 'settings', 'credential_list']),
  methods: {
    persistentTokenModal() {
      this.generate_modal = true

    },
    generateToken() {
      this.$store.dispatch('getPersistentPairingToken').then(resp => {
        this.persistent_pairing_token = resp.data.token
        this.confirm_generate = true
      })
    },
    loadData() {
      this.$store.dispatch('getSettings')
      this.$store.dispatch('getCredentialList')
    },
    dismiss(){
      this.generate_modal = false;
      this.persistent_pairing_token = "";
      this.confirm_generate = false;
    },
    updateSettings() {
      let settings = this.settings
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