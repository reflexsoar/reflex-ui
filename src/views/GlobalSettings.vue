<template>
  <CCardBody>
    <CForm id="settings-form">
      <CRow>
        <CCol col="6">
          <h4>Basic Settings</h4>
          <CInput v-model="settings.base_url" label="Base URL" v-bind:disabled="!current_user.permissions['set_baseurl']"/>
          <CInput v-model="settings.logon_password_attempts" label="Max Logon Attempts"/>
          <label>Require Case Templates</label><br>
          <CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="settings.require_case_templates"/><br><br>

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
        </CCol>
        <CCol col="6">
          <h4>Mail Settings</h4>
          <CInput v-model="settings.email_from" label="Email From" placeholder="admin@reflexsoar.com"/>
          <CInput v-model="settings.email_server" label="Email Server" placeholder="127.0.0.1:25"/>
          <CSelect :value.sync="settings.email_secret_uuid" :options="credential_list" label="Email Credentials" placeholder="Select a credential"/>
        </CCol>
      </CRow>
      <CRow>
        <CCol col="12" class="text-right">
          <CButton color="primary" @click="updateSettings()">Save</CButton>
        </CCol>
      </CRow>  
    </CForm>
  </CCardBody>
</template>

<script>
import { vSelect } from "vue-select";
import { mapState } from "vuex"
export default {
  name: "GlobalSettings",
  data() {
    return {
    };
  },
  created(){
    this.loadData()
  },
  computed: mapState(['current_user', 'settings', 'credential_list']),
  methods: {
    loadData() {
      this.$store.dispatch('getSettings')
      this.$store.dispatch('getCredentialList')
    },
    updateSettings() {
      let settings = this.settings
      this.$store.dispatch('updateSettings', settings)
    }
  },
};
</script>