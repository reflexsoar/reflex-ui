<template>

    <CRow>
      <CCol>
        <CRow>
          <CCol xs="12" lg="12">
            <img width="150px" height="150px" src="#" style="float:left; margin-right: 25px"/>
            <h1>{{current_user.first_name}} {{current_user.last_name}}</h1>
            <h4>Username: {{current_user.username}}</h4>
            <h4>Role: {{current_user.role ? current_user.role.name : ""}}<br><small>{{ current_user.role ? current_user.role.description : ""}}</small></h4>
          </CCol>
          
        </CRow>
        <CRow>
          <CCol>
            <br>
            <h2>Authentication</h2>
            <CButton color="primary" @click="edit_password_modal = !edit_password_modal">Change Password</CButton>&nbsp;
            <CButton v-if="!current_user.mfa_enabled" color="primary" @click="start_mfa_wizard()">Enable MFA</CButton>
            <CButton v-else color="danger" @click="disable_mfa()">Disable MFA</CButton>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <br>
            <h2>User Information</h2>
          </CCol>
        </CRow>
      </CCol>
      <CModal title="Change Password" :centered="true" size="lg" :show.sync="edit_password_modal">
      <CAlert :show.sync="this.error" color="danger" closeButton>
            {{error_message}}
      </CAlert>
      <CForm @submit.prevent="update_password" id="userForm">
        <CInput v-model="password" type="password" label="Password" placeholder="Enter your desired password..." required/>
        <CInput v-model="confirm_password"  type="password" label="Confirm Password" placeholder="Confirm password" required/>
      </CForm>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Cancel</CButton>
        <CButton type="submit" form="userForm" color="primary">Update Password</CButton>
      </template>
    </CModal>
    <CModal title="Enable MFA" :centered="true" size="lg" :show.sync="enable_mfa_modal">
      <CAlert :show.sync="this.error" color="danger" closeButton>
            {{error_message}}
      </CAlert>
      <div v-if="mfa_wizard_step == 1">
        <p>Welcome to the multi-factor authentication wizard.  Follow the steps below to setup MFA for your account.</p>
        <ol>
          <li>Click next, open your MFA app (e.g. Duo, Google Authenticator, etc.)</li>
          <li>Scan the QR code, click next</li>
          <li>Verify the code</li>
          <li>Setup complete!</li>
        </ol>
      </div>
      <div v-if="mfa_wizard_step == 2"><center><div v-html="qr_code"></div></center></div>
      <div v-if="mfa_wizard_step == 3">
        Confirm MFA Code
      </div><center></center>
      <template #footer>
        <CButton @click="enable_mfa_modal = !enable_mfa_modal" color="secondary">Cancel</CButton>
        <CButton color="info" v-if="mfa_wizard_step > 1 && mfa_wizard_step < 4" @click="previousStep()">Previous Step</CButton>
        <CButton color="primary" v-if="mfa_wizard_step > 0 && mfa_wizard_step < 3" @click="nextStep()">Next</CButton>
        <CButton color="success" v-if="mfa_wizard_step == 3" @click="finishMFASetup()">Finish</CButton>
      </template>
    </CModal>
    </CRow>
    

</template>
<script>
import { mapState } from 'vuex';

export default {
  name: 'Dashboard',
  data () {
    return {
      password: "",
      confirm_password: "",
      error: false,
      error_message: "",
      edit_password_modal: false,
      enable_mfa_modal: false,
      qr_code: "",
      mfa_wizard_step: 0,
      mfa_enable_success: false
    }
  },
  methods: {
    nextStep () {

      if (this.mfa_wizard_step == 1) {
        this.enable_mfa()
        if (this.mfa_enable_success) {
          this.mfa_wizard_step += 1
          this.fetch_qr_code()
          return 0
        } else {
          this.error = true
          this.error_message = "An error occuring while trying to enable MFA.  Please try again later."
        }
      }

      if (this.mfa_wizard_step == 2) {
        this.mfa_wizard_step += 1
      }
    },
    finishMFASetup() {
      this.current_user.mfa_enabled = true
      this.enable_mfa_modal = false
    },
    previousStep () {
      if(this.mfa_wizard_step == 1) {
        this.mfa_wizard_step = 1
      } else {
        this.mfa_wizard_step -= 1
      }      
    },
    fetch_qr_code() {
      this.$store.dispatch('fetchMFAQRCode').then(resp => {
        this.qr_code = resp.data
      })
    },
    enable_mfa() {
      this.$store.dispatch('enableMFA')
      this.mfa_enable_success = this.$store.getters.mfa_enabled      
    },
    disable_mfa() {
      this.$store.dispatch('disableMFA')
      this.current_user.mfa_enabled = false
    },
    start_mfa_wizard() {
      this.enable_mfa_modal = true
      this.mfa_enable_success = false
      this.mfa_wizard_step = 1    

    },
    dismiss() {
      this.edit_password_modal = false,
      this.password = "",
      this.confirm_password = ""
    }
  },
  beforeMount() {
    this.$store.dispatch('getMe')
  },
  computed: mapState(['current_user'])
}
</script>
