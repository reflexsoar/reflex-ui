<template>
  <CContainer class="d-flex content-center min-vh-100">
    <CRow>
      <CCol>
        <CAlert v-if="authStatus() == false"
              closeButton
              color="danger"
              fade
            >
              Failed to login. Invalid username or password.
            </CAlert>
          <CCard color="light">
            <CCardBody>
              
              <CForm @submit.prevent="reset_password">
                <h1>Forgot Password</h1>
                <p class="text-muted">Enter your email, if it exists in the system you will receive a password reset e-mail.</p>
                <CInput
                  placeholder="Email"
                  autocomplete="username email"
                  required
                  v-model="username"
                >
                  <template #prepend-content><CIcon name="cil-user"/></template>
                </CInput>
                <CRow>
                  <CCol col="6" class="text-left">
                    <CButton color="primary" class="px-4" type="submit">Reset Password</CButton>
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script>

export default {
  name: 'ForgotPassword',
  data(){
    return {
      username: "",
      password: ""
    }
  },
  methods: {
    reset_password: function () {
      let username = this.username
      this.$store.dispatch('forgotPassword', { 'email': username })
      .then(() => this.$router.push('/'))
      .catch(err => console.log(err))
    },
    authStatus: function() {
      if(this.$store.getters.authStatus == 'error') {
        return false
      }
    }
  }
}
</script>
