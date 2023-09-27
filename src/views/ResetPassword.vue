<template>
  <CContainer class="d-flex content-center min-vh-100">
    <CRow style="width: 50%">
      <CCol>
        <CAlert v-if="authStatus() == false"
              closeButton
              color="danger"
              fade
            >
              Failed to change password.
            </CAlert>
            <CAlert v-if="reset_fail"
              closeButton
              color="danger"
              fade
            >
              Failed to change password. {{ error_message }}
            </CAlert>
          <CCard>
            <CCardBody>
              <CForm @submit.prevent="reset">
                <h1>Reset Password</h1>
                <p class="text-muted">Enter your new password.</p>
                <CInput
                  placeholder="Password"
                  type="password"
                  autocomplete="current-password"
                  required
                  v-model="password"
                ><template #prepend-content><CIcon name="cil-lock-locked"/></template>
                </CInput>
                <CInput
                  placeholder="Confirm"
                  type="password"
                  autocomplete="current-password"
                  required
                  v-model="confirm_password"
                >
                  <template #prepend-content><CIcon name="cil-lock-locked"/></template>
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
  name: 'ResetPassword',
  data(){
    return {
      password: "",
      confirm_password: "",
      token: this.$route.params.token,
      reset_fail: false,
      error_message: ""
    }
  },
  methods: {
    reset: function () {
      let token = this.token
      let password = this.password
      let confirm_password = this.confirm_password
      this.$store.dispatch('resetPassword', { token, data: {password: password, confirm_password: confirm_password}})
      .then(() => this.$router.push('/login'))
      .catch(err => {
        this.reset_fail = true
        console.log(err.response.data.message);
        if (err.response.data.message == "401 Unauthorized: Token retired.") {
          this.error_message = "This password reset link has already been used. Please request a new one."
        } else if (err.response.data.message == "Access token expired.") {
          this.error_message = "This password reset link has expired. Please request a new one."
        } else {
          this.error_message = err.response.data.message
        }
      })
    },
    authStatus: function() {
      if(this.$store.getters.authStatus == 'error') {
        return false
      }
    }
  }
}
</script>
