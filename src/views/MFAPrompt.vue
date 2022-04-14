<template>
  <CContainer class="d-flex content-center min-vh-100">
    <CRow>
      <CCol sm="12" lg="12">
          <CCard>
            <CCardBody>
              <CAlert :show.sync="this.error" color="danger" closeButton>
                    {{error_message}}
              </CAlert>
              <CForm @submit.prevent="validateToken" id="mfaForm">
                <h1>Second Factor Authentication</h1>
                <p>Enter the One Time Password from your Authenticator app below.</p>
                <CRow>
                  <CCol>
                    <CInput label="One Time Password" v-model="token" required/>
                  </CCol>
                </CRow>
                
              </CForm>
                
            </CCardBody>
            <CCardFooter>
              <div style="text-align: right"><CButton type="submit" color="primary" form="mfaForm">Validate</CButton>&nbsp;
              <CButton color="secondary" @click="cancel()">Cancel</CButton></div>
            </CCardFooter>
          </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script>

export default {
  name: 'MFAPrompt',
  data(){
    return {
      token: "",
      error: false,
      error_message: ""
    }
  },
  methods: {
    cancel() {
      localStorage.removeItem('mfa_challenge_token')
      this.$router.push('/login')
    },
    validateToken() {
      let mfa_challenge_token = localStorage.getItem('mfa_challenge_token')
      let token = {
        'mfa_challenge_token': mfa_challenge_token,
        'token': this.token
      }
      this.$store.dispatch('checkMFA', token).then(() => {
        localStorage.removeItem('mfa_challenge_token')
        this.$store.dispatch('getMe').then(resp => {
            this.$router.push('/')
          })
      })
      return false
    }
  }
}
</script>
